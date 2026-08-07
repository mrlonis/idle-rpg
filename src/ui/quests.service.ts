import { computed, inject, Service } from '@angular/core';
import {
  allQuestProgress,
  claimQuests,
  CURRENCY_IDS,
  type CurrencyId,
  num,
  type Numeric,
  QUEST_PERIODS,
  type QuestPeriod,
  type QuestProgress,
  windowEndsAt,
  ZERO,
} from '../core';
import { QUEST_LIST, QUEST_WINDOW_RULES } from './content';
import { CURRENCY_LABELS, formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/** One currency, ready to put on screen. */
export interface QuestAwardView {
  readonly currency: CurrencyId;
  readonly amount: string;
  readonly label: string;
}

/** One quest as the screen draws it. */
export interface QuestRowView extends QuestProgress {
  readonly reward: readonly QuestAwardView[];
  /** How far through, as a whole percentage. */
  readonly percent: number;
}

/** A period's worth of quests, with the heading the screen puts above them. */
export interface QuestGroupView {
  readonly period: QuestPeriod;
  readonly title: string;
  /** When this period's window reopens, as epoch milliseconds. */
  readonly resetsAt: number;
  readonly rows: readonly QuestRowView[];
}

/** What a claim did. */
export interface QuestClaimSummary {
  readonly quests: number;
  readonly gained: readonly QuestAwardView[];
}

const TITLES: Readonly<Record<QuestPeriod, string>> = {
  daily: 'Today',
  weekly: 'This week',
};

/**
 * The quests screen's read model and its one action.
 *
 * ## Where the clock is, and where it deliberately is not
 *
 * ⚠️ **Nothing here reads a clock.** `core/` has none by rule, and this service has none by
 * design: the window roll lives in `GameLoopService.advance`, which is the one place that already
 * holds both the authoritative run and a real `nowMs`. Two consequences worth keeping —
 *
 * - a `setInterval` firing at 04:00 would be a second clock to keep alive, would not survive the
 *   app being backgrounded across the boundary, and would need tearing down on reset;
 * - rolling inside a `computed` is what the shape most obviously wants and Angular forbids it,
 *   because rolling is a signal write.
 *
 * So everything below is a **pure function of the snapshot**, which also means the screen cannot
 * disagree with itself between two reads in one frame.
 */
@Service()
export class QuestsService {
  private readonly game = inject(GameLoopService);

  /**
   * Every quest, grouped by the period it belongs to.
   *
   * ⚠️ **This does not roll the window**, and that separation is deliberate. Angular forbids
   * writing a signal from inside a `computed`, and rolling is a write — so it lives in
   * `GameLoopService.advance`, which is the one place that already holds both the authoritative run
   * and a real `nowMs`. By the time a snapshot reaches here its windows are current.
   */
  readonly groups = computed<readonly QuestGroupView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const progress = allQuestProgress(QUEST_LIST, state.quests, state);
    return QUEST_PERIODS.map((period) => ({
      period,
      title: TITLES[period],
      // Read off the window the run is actually parked in rather than off a live clock, so the
      // whole screen is a pure function of the snapshot and cannot disagree with itself mid-render.
      resetsAt: windowEndsAt(
        QUEST_WINDOW_RULES,
        period,
        windowStart(state.quests[period].index, period),
      ),
      rows: progress
        .filter((entry) => entry.quest.period === period)
        .map((entry) => ({
          ...entry,
          reward: awards(entry.quest.reward),
          percent: Math.round(entry.fraction * 100),
        })),
    })).filter((group) => group.rows.length > 0);
  });

  /** How many quests are finished and unclaimed. Drives the Town card and the button. */
  readonly claimable = computed(() =>
    this.groups().reduce(
      (total, group) => total + group.rows.filter((row) => row.claimable).length,
      0,
    ),
  );

  /**
   * Claims every finished quest, in one press.
   *
   * The same argument the Altar's Ascend All runs on: nothing is spent, no two quests compete, and
   * a finished quest has no alternative use — so a dialog would be asking the player to confirm the
   * only move.
   */
  claimAll(): QuestClaimSummary {
    const state = this.game.current;
    if (state === null) {
      return { quests: 0, gained: [] };
    }
    const result = claimQuests(state, QUEST_LIST);
    if (result.state !== state) {
      this.game.apply(() => result.state);
    }
    return { quests: result.quests, gained: awards(result.gained) };
  }
}

/** A currency delta as display rows, in the wallet's own order. */
function awards(
  source: Readonly<Partial<Record<CurrencyId, Numeric | number>>>,
): readonly QuestAwardView[] {
  const rows: QuestAwardView[] = [];
  for (const currency of CURRENCY_IDS) {
    const amount = source[currency];
    if (amount === undefined) {
      continue;
    }
    const quantity = typeof amount === 'number' ? num(amount) : amount;
    if (quantity.lte(ZERO)) {
      continue;
    }
    rows.push({ currency, amount: formatNumeric(quantity), label: CURRENCY_LABELS[currency] });
  }
  return rows;
}

/**
 * A moment inside the window with the given index.
 *
 * `windowEndsAt` takes an instant and answers when that instant's window closes, so reading it
 * against the *stored* index rather than against `Date.now()` keeps the whole screen a pure
 * function of the snapshot — and means a window that has not been rolled yet reports its own end
 * rather than the end of the one the wall clock is in.
 */
function windowStart(index: number, period: QuestPeriod): number {
  const length = period === 'weekly' ? 604_800_000 : 86_400_000;
  return Math.max(index, 0) * length + QUEST_WINDOW_RULES.resetOffsetMinutes * 60_000;
}
