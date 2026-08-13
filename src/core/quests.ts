import { type AchievementCounter } from './achievements';
import { credit, type CurrencyAmounts, type CurrencyId } from './currency';
import { num, type Numeric, ZERO } from './numeric';
import { type GameState } from './state';

/**
 * Daily and weekly quests: a faucet that is not stage-gated.
 *
 * ## Why this exists, beyond "a reason to open the app tomorrow"
 *
 * The retention framing undersells it. A player walled below a stage has exactly **one** income
 * source and it is the thing the wall is throttling. Quests pay whether or not the ladder is
 * moving, so being stuck stops meaning being stopped — which matters far more in a game with no
 * way to buy a way past a wall.
 *
 * ## Progress is a delta, not a counter
 *
 * ⚠️ **Nothing here adds a field to the battle path**, and that is the load-bearing decision. The
 * obvious build gives every quest its own running total, incremented from `applyBattleResult` and
 * zeroed on reset — which is a write into the hottest path in the game for a number that is
 * derivable, and a second place for progress to disagree with itself.
 *
 * Instead a window stores a **baseline**: what the run's existing counters read the moment the
 * window opened. A quest's progress is `now - baseline`. Resetting a window is one assignment, the
 * simulation never learns that quests exist, and a save carrying a damaged baseline heals by
 * clamping rather than by reconstructing anything.
 *
 * ## Every reward is crystals, and that is not a shortcut
 *
 * ⚠️ Gold, xp and essence are priced against a level curve worth ×10⁹, so a flat quantity of any
 * of them is invisible within a chapter or two — the same argument `docs/gear.md` makes for
 * gear bonuses being percentages. A pull costs a flat `PULL_COST` forever, so a flat crystal
 * reward is the one payout that means the same thing at stage 5 and stage 5,000. A quest paying a
 * percentage of the player's income would also undo the point above: it would pay *most* to the
 * player whose ladder is already moving.
 *
 * ## The clock belongs to the caller
 *
 * `core/` has no clock. A window boundary arrives as a `nowMs` argument exactly as
 * `resume(state, nowMs)` takes one, and the day index is arithmetic over it.
 */

/** How often a quest's window reopens. */
export type QuestPeriod = 'daily' | 'weekly';

/** Every period a run keeps a window for. */
export const QUEST_PERIODS = ['daily', 'weekly'] as const;

/**
 * One quest: a counter, how much of it the window asks for, and what that pays.
 *
 * `counter` is deliberately the same closed union achievements are paid against — the run's own
 * running totals, and nothing invented for quests to measure.
 */
export interface QuestData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly period: QuestPeriod;
  readonly counter: QuestCounter;
  /** How much the counter has to move within the window. */
  readonly target: number;
  /** What completing it pays. */
  readonly reward: Readonly<Partial<Record<CurrencyId, number>>>;
}

/**
 * The counters a quest may be measured against.
 *
 * ⚠️ **`clearedStages` is deliberately absent, and it is the one that looks most obviously
 * right.** It counts *first* clears, so it stops moving the moment a run reaches the top of the
 * authored ladder — and a daily quest that a player at the end of the content can never finish is
 * a permanent empty row that pays nothing. That is the same failure a role-locked formation slot
 * was rejected for in milestone 4: content that reaches a state where completing it is impossible.
 * `battleCount` moves on every fight won or lost, and `pullCount` on every pull, so both are
 * always reachable by playing.
 */
/**
 * ⚠️ **`descentRuns` passes the same test and `signatureLevels` does not**, which is the pair worth
 * holding in mind before widening this again. The Descent is offered afresh every day forever, so
 * its run count can never stop moving; signature levels stop dead at 420 once every item is maxed,
 * and do not move at all for the tens of thousands of pulls before the first one unlocks. The
 * question a candidate has to answer is not "is it monotonic" — a wallet balance is not, and
 * `clearedStages` is — but "can a player always make it move today".
 */
export type QuestCounter = Extract<AchievementCounter, 'battleCount' | 'pullCount' | 'descentRuns'>;

/** How long each period runs, in milliseconds. */
const DAY_MS = 86_400_000;
const WEEK_MS = DAY_MS * 7;

/** The rules a caller supplies for where a window boundary falls. */
export interface QuestRulesData {
  /**
   * Minutes past UTC midnight at which the day rolls over.
   *
   * Authored rather than read off the device's timezone, because the reset has to be the same
   * moment for a save carried between devices — a player who flies is not owed, or denied, a
   * second day.
   */
  readonly resetOffsetMinutes: number;
}

/** One period's window: when it opened, what the counters read then, and what has been taken. */
export interface QuestWindow {
  /** The period index this window belongs to — a day number or a week number. */
  readonly index: number;
  /** What each counter read when the window opened. */
  readonly baseline: Readonly<Partial<Record<QuestCounter, number>>>;
  /** Quest ids already claimed in this window. */
  readonly claimed: readonly string[];
}

/** Every period's window. */
export type QuestWindows = Readonly<Record<QuestPeriod, QuestWindow>>;

/** A window that has never opened. Its index is below any real one, so the first roll opens it. */
export function emptyWindow(): QuestWindow {
  return { index: -1, baseline: {}, claimed: [] };
}

/** Both windows, unopened. A new run starts here. */
export function emptyQuestWindows(): QuestWindows {
  return { daily: emptyWindow(), weekly: emptyWindow() };
}

/** A count read off an untrusted save, as a whole number at or above zero. */
function wholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

/** How long one period runs. */
function periodMs(period: QuestPeriod): number {
  return period === 'weekly' ? WEEK_MS : DAY_MS;
}

/**
 * Which day — or week — `nowMs` falls in, under `rules`.
 *
 * A whole number that only ever counts upward through time, so "is this a new window" is one
 * comparison. A non-finite or pre-epoch `nowMs` reads as index 0 rather than producing a negative
 * or `NaN` index that every later comparison would then have to guard against.
 */
export function periodIndex(rules: QuestRulesData, period: QuestPeriod, nowMs: number): number {
  if (!Number.isFinite(nowMs)) {
    return 0;
  }
  const offset = Number.isFinite(rules.resetOffsetMinutes) ? rules.resetOffsetMinutes * 60_000 : 0;
  return Math.max(Math.floor((nowMs - offset) / periodMs(period)), 0);
}

/** What one counter reads on this run right now. */
function counterNow(state: GameState, counter: QuestCounter): number {
  return wholeCount(state[counter]);
}

/** How far a quest has come inside its window. */
export interface QuestProgress {
  readonly quest: QuestData;
  /** How much the counter has moved since the window opened, capped at the target. */
  readonly done: number;
  readonly target: number;
  /** Whether the counter has moved far enough. */
  readonly complete: boolean;
  /** Whether the reward has already been taken this window. */
  readonly claimed: boolean;
  /** Complete and not yet taken. */
  readonly claimable: boolean;
  /** How far through, in `[0, 1]`. */
  readonly fraction: number;
}

/**
 * How far `quest` has come in the window it belongs to.
 *
 * The baseline is clamped to the counter's current value before subtracting. A baseline *above*
 * the counter is damage — a save edited, or a counter repaired downward on load — and left alone
 * it would produce negative progress on a quest that could then never complete.
 */
export function questProgress(
  quest: QuestData,
  windows: QuestWindows,
  state: GameState,
): QuestProgress {
  const window = windows[quest.period];
  const now = counterNow(state, quest.counter);
  const baseline = Math.min(wholeCount(window.baseline[quest.counter] ?? 0), now);
  const target = Number.isFinite(quest.target) ? Math.max(Math.floor(quest.target), 1) : 1;
  const done = Math.min(now - baseline, target);
  const complete = done >= target;
  const claimed = window.claimed.includes(quest.id);
  return {
    quest,
    done,
    target,
    complete,
    claimed,
    claimable: complete && !claimed,
    fraction: done / target,
  };
}

/** Every quest's progress, in the order they were authored. */
export function allQuestProgress(
  quests: readonly QuestData[],
  windows: QuestWindows,
  state: GameState,
): readonly QuestProgress[] {
  return quests.map((quest) => questProgress(quest, windows, state));
}

/**
 * Opens any window whose period has elapsed, resetting its baseline and its claims.
 *
 * ⚠️ **A window only ever rolls *forward*, and that is the backwards-clock rule.** A device clock
 * moved back produces an index below the stored one; rolling on any difference would hand the
 * player a second day of quests every time they wound the clock back, and refusing to play at all
 * would punish somebody whose timezone simply changed. So the comparison is `>` rather than `!==`:
 * a clock that goes backwards does nothing at all, and the window resumes when real time catches
 * up with it. Clamp; do not detect. There is nothing to protect.
 *
 * Returns the same object when neither window moved, so a load or a tick that changes nothing
 * does not republish a snapshot and redraw every screen watching the run.
 */
export function rollQuestWindows(
  state: GameState,
  rules: QuestRulesData,
  counters: readonly QuestCounter[],
  nowMs: number,
): GameState {
  let next: Record<QuestPeriod, QuestWindow> | undefined;

  for (const period of QUEST_PERIODS) {
    const index = periodIndex(rules, period, nowMs);
    if (index <= state.quests[period].index) {
      continue;
    }
    const baseline: Partial<Record<QuestCounter, number>> = {};
    for (const counter of counters) {
      baseline[counter] = counterNow(state, counter);
    }
    next ??= { ...state.quests };
    next[period] = { index, baseline, claimed: [] };
  }

  return next === undefined ? state : { ...state, quests: next };
}

/** The result of claiming quest rewards. */
export interface QuestClaimResult {
  readonly state: GameState;
  /** What reached the wallet. Empty when nothing was owed. */
  readonly gained: CurrencyAmounts;
  /** How many quests were claimed. */
  readonly quests: number;
}

/**
 * Claims every completed, unclaimed quest.
 *
 * One press for the same reason the Altar's `ascendAll` is one press: nothing is spent, no two
 * quests compete, and a completed quest has no alternative use — so "claim everything" is the
 * only move rather than a strategy.
 *
 * ⚠️ Returns the same state object when nothing was owed, which callers use to tell a real change
 * from a no-op.
 */
export function claimQuests(state: GameState, quests: readonly QuestData[]): QuestClaimResult {
  const claimedBy: Record<QuestPeriod, string[]> = { daily: [], weekly: [] };
  let gained: Partial<Record<CurrencyId, Numeric>> = {};
  let count = 0;

  for (const progress of allQuestProgress(quests, state.quests, state)) {
    if (!progress.claimable) {
      continue;
    }
    for (const [id, amount] of Object.entries(progress.quest.reward)) {
      if (!Number.isFinite(amount) || amount <= 0) {
        continue;
      }
      const currency = id as CurrencyId;
      gained = { ...gained, [currency]: (gained[currency] ?? ZERO).add(num(amount)) };
    }
    claimedBy[progress.quest.period].push(progress.quest.id);
    count++;
  }

  if (count === 0) {
    return { state, gained: {}, quests: 0 };
  }

  const windows: Record<QuestPeriod, QuestWindow> = { ...state.quests };
  for (const period of QUEST_PERIODS) {
    if (claimedBy[period].length > 0) {
      windows[period] = {
        ...windows[period],
        claimed: [...windows[period].claimed, ...claimedBy[period]],
      };
    }
  }

  return {
    state: { ...state, wallet: credit(state.wallet, gained), quests: windows },
    gained,
    quests: count,
  };
}

/** When the window a quest belongs to next reopens, as epoch milliseconds. */
export function windowEndsAt(rules: QuestRulesData, period: QuestPeriod, nowMs: number): number {
  const offset = Number.isFinite(rules.resetOffsetMinutes) ? rules.resetOffsetMinutes * 60_000 : 0;
  const length = periodMs(period);
  return (periodIndex(rules, period, nowMs) + 1) * length + offset;
}

/** A field that could not be loaded as written, in the shape the save layer reports. */
type Note = (field: string, problem: string, recovered: string) => void;

/**
 * Decodes one window from an untrusted save.
 *
 * Everything degrades to "the window has never opened", which is the safe direction: the next
 * roll reopens it, the player gets a fresh set of quests, and nothing they had already claimed is
 * paid twice — because a reopened window's baseline is taken from the counters as they stand.
 */
function parseWindow(raw: unknown, period: QuestPeriod, note: Note): QuestWindow {
  if (typeof raw !== 'object' || raw === null) {
    if (raw !== undefined) {
      note(`quests.${period}`, 'not an object', 'window reopened');
    }
    return emptyWindow();
  }
  const record = raw as Record<string, unknown>;

  const rawIndex = record['index'];
  const index =
    typeof rawIndex === 'number' && Number.isFinite(rawIndex) ? Math.floor(rawIndex) : -1;
  if (index === -1 && rawIndex !== undefined && rawIndex !== -1) {
    note(`quests.${period}.index`, 'unusable', 'window reopened');
  }

  const baseline: Partial<Record<QuestCounter, number>> = {};
  const rawBaseline = record['baseline'];
  if (typeof rawBaseline === 'object' && rawBaseline !== null) {
    for (const [key, value] of Object.entries(rawBaseline as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        baseline[key as QuestCounter] = Math.floor(value);
      } else {
        note(`quests.${period}.baseline.${key}`, 'unusable', '0');
      }
    }
  }

  const rawClaimed = record['claimed'];
  const claimed = Array.isArray(rawClaimed)
    ? rawClaimed.filter((entry): entry is string => typeof entry === 'string')
    : [];
  if (Array.isArray(rawClaimed) && claimed.length !== rawClaimed.length) {
    note(`quests.${period}.claimed`, 'contains non-id entries', 'those entries dropped');
  }

  return { index, baseline, claimed };
}

/** Decodes both windows from an untrusted save. */
export function parseQuestWindows(raw: unknown, note: Note): QuestWindows {
  const record = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  if (typeof raw !== 'object' && raw !== undefined) {
    note('quests', 'not an object', 'both windows reopened');
  }
  return {
    daily: parseWindow(record['daily'], 'daily', note),
    weekly: parseWindow(record['weekly'], 'weekly', note),
  };
}
