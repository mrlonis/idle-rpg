import { computed, inject, Service } from '@angular/core';
import {
  allBountyProgress,
  benchMembers,
  boardDayIndex,
  type BountyData,
  type BountyFailure,
  bountyPayout,
  collectBounty,
  collectReadyBounties,
  CURRENCY_IDS,
  type CurrencyAmounts,
  type CurrencyId,
  dailyBoard,
  dispatchBounty,
  dispatchOpenBounties,
  msUntilRotation,
  type Numeric,
} from '../core';
import { BOUNTY_BOARD_RULES, BOUNTY_LIST, CHARACTERS_BY_ID, FACTIONS_BY_ID } from './content';
import { CURRENCY_LABELS, formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/** One currency, ready to put on screen. */
export interface BountyAwardView {
  readonly currency: CurrencyId;
  readonly amount: string;
  readonly label: string;
}

/** A character the board can send, or one it currently has out. */
export interface CrewMemberView {
  readonly defId: string;
  readonly name: string;
  /** The faction id, which is what a mission's requirement is matched against. */
  readonly faction: string;
  /** The faction as a player reads it — "Dwarves", never `dwarf`. */
  readonly factionName: string;
}

/** One mission as the screen draws it. */
export interface BountyRowView {
  readonly bounty: BountyData;
  readonly running: boolean;
  readonly ready: boolean;
  readonly unlocked: boolean;
  /** How far through, as a whole percentage. */
  readonly percent: number;
  /** Time still to run, already worded — "3h 12m". Empty when idle or ready. */
  readonly remaining: string;
  /** How long the mission takes, worded the same way. */
  readonly duration: string;
  /** What it pays at the run's current rates. */
  readonly payout: readonly BountyAwardView[];
  /** Who is on it right now. */
  readonly crew: readonly CrewMemberView[];
  /**
   * The faction the mission insists on, already worded — "2 Dwarves". Empty when it asks for none.
   *
   * Worded here rather than in the template because the plural and the faction's display name are
   * both lookups, and a template doing either would be the complex logic templates are meant not to
   * carry.
   */
  readonly requirement: string;
  /** The faction id the mission wants, so the picker can mark who counts toward it. */
  readonly requiredFaction: string;
  /** Whether the bench can currently satisfy that requirement at all. */
  readonly crewable: boolean;
}

/** What a collection did. */
export interface BountyCollectSummary {
  readonly missions: number;
  readonly gained: readonly BountyAwardView[];
}

/**
 * The bounty board's read model and its three actions.
 *
 * ## Where the clock enters
 *
 * `core/` has no clock, so every question about whether a mission has finished is answered by
 * passing a `nowMs` into `core/bounties.ts`. Unlike quest windows there is **nothing to roll** — a
 * dispatch stores when it started and finishing is a comparison, so reading is pure and no write
 * has to happen on a timer. That is why this service can call `Date.now()` inside a `computed`
 * where `QuestsService` deliberately cannot: it only ever *reads* the clock.
 *
 * The snapshot resamples at ~6Hz, so a countdown ticks down on its own without any extra timer.
 */
@Service()
export class BountiesService {
  private readonly game = inject(GameLoopService);

  /**
   * Today's board, in pool order — shortest first.
   *
   * ⚠️ **Derived on read, never stored.** `dailyBoard` is a pure function of the run's seed and the
   * day index, so this recomputes to the same missions all day and to a different set tomorrow,
   * with nothing written to the save and nothing to reroll. Running missions hold their place, so
   * the board changes under a player only where they have nothing at stake.
   */
  readonly board = computed<readonly BountyData[]>(() => {
    const state = this.game.snapshot();
    return state === null
      ? []
      : dailyBoard(
          state,
          BOUNTY_LIST,
          BOUNTY_BOARD_RULES,
          boardDayIndex(BOUNTY_BOARD_RULES, Date.now()),
        );
  });

  /** Every mission on today's board, in the order the screen lists them. */
  readonly rows = computed<readonly BountyRowView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const now = Date.now();
    const bench = benchMembers(state);
    return allBountyProgress(this.board(), state, now).map((progress) => {
      const required = progress.bounty.requires;
      const matching =
        required === undefined
          ? bench.length
          : bench.filter((defId) => CHARACTERS_BY_ID.get(defId)?.faction === required.faction)
              .length;
      return {
        bounty: progress.bounty,
        running: progress.running,
        ready: progress.ready,
        unlocked: progress.unlocked,
        percent: Math.round(progress.fraction * 100),
        remaining: progress.running && !progress.ready ? duration(progress.remainingMs) : '',
        duration: duration(progress.bounty.durationMs),
        payout: awards(bountyPayout(progress.bounty, state.rates)),
        crew: (progress.dispatch?.members ?? []).map((defId) => member(defId)),
        requirement: requirementText(progress.bounty),
        requiredFaction: required?.faction ?? '',
        crewable: bench.length >= progress.bounty.crew && matching >= (required?.count ?? 0),
      };
    });
  });

  /** How many missions have finished and are waiting. Drives the Town card and the button. */
  readonly ready = computed(() => this.rows().filter((row) => row.ready).length);

  /**
   * How many missions Dispatch all would actually fill.
   *
   * ⚠️ **Asked of `dispatchOpenBounties` rather than counted off the rows**, because crews compete
   * for one bench. Counting rows that are *individually* crewable overstates it the moment the board
   * wants more characters than the player has — six missions wanting nineteen bodies from a bench of
   * fifteen is an ordinary mid-game board — and the button would promise six and deliver four.
   *
   * The result state is discarded; `core/` returns new state rather than mutating, so running the
   * assignment to count it is free of side effects.
   */
  readonly sendable = computed(() => {
    const state = this.game.snapshot();
    return state === null
      ? 0
      : dispatchOpenBounties(state, this.board(), CHARACTERS_BY_ID, Date.now()).dispatched;
  });

  /** Time until the board rotates, already worded, for the line under the heading. */
  readonly rotatesIn = computed(() => duration(msUntilRotation(BOUNTY_BOARD_RULES, Date.now())));

  /**
   * Everybody who could be sent right now: owned, not fighting, not already away.
   *
   * ⚠️ **Both exclusions are the disjointness invariant showing through to the UI**, and offering
   * a character the core layer would refuse is how a player learns a rule by being told "no". The
   * list is what makes the rule visible instead. `benchMembers` is the one place either rule is
   * written, so the picker and Dispatch all cannot disagree about who is free.
   */
  readonly available = computed<readonly CrewMemberView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    return benchMembers(state)
      .map((defId) => member(defId))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  /** Sends a crew. Returns the refusal reason when the board would not take them. */
  dispatch(bounty: BountyData, members: readonly string[]): BountyFailure | null {
    const state = this.game.current;
    if (state === null) {
      return 'not-owned';
    }
    const result = dispatchBounty(state, bounty, members, CHARACTERS_BY_ID, Date.now());
    if (!result.ok) {
      return result.reason;
    }
    this.game.apply(() => result.state);
    return null;
  }

  /**
   * Fills every open mission on today's board, in one press.
   *
   * Board order, top to bottom — the order on screen. See `dispatchOpenBounties` for why this one
   * is predictable rather than optimal, and why it is offered at all when crews genuinely compete.
   */
  dispatchAll(): number {
    const state = this.game.current;
    if (state === null) {
      return 0;
    }
    const result = dispatchOpenBounties(state, this.board(), CHARACTERS_BY_ID, Date.now());
    if (result.state !== state) {
      this.game.apply(() => result.state);
    }
    return result.dispatched;
  }

  /** Collects one finished mission. */
  collect(bounty: BountyData): BountyCollectSummary {
    const state = this.game.current;
    if (state === null) {
      return { missions: 0, gained: [] };
    }
    const result = collectBounty(state, bounty, Date.now());
    if (!result.ok) {
      return { missions: 0, gained: [] };
    }
    this.game.apply(() => result.state);
    return { missions: 1, gained: awards(result.gained ?? {}) };
  }

  /**
   * Collects everything finished, in one press.
   *
   * The same argument the Altar's Ascend All runs on: a finished mission has no alternative use
   * and no two of them compete, so this is the only move rather than a strategy.
   */
  collectAll(): BountyCollectSummary {
    const state = this.game.current;
    if (state === null) {
      return { missions: 0, gained: [] };
    }
    const result = collectReadyBounties(state, BOUNTY_LIST, Date.now());
    if (result.state !== state) {
      this.game.apply(() => result.state);
    }
    return { missions: result.missions, gained: awards(result.gained) };
  }
}

/**
 * What a mission's faction requirement says on screen — "1 Dwarf", "2 Elves", or nothing.
 *
 * The faction's **display** name comes from `FACTIONS_BY_ID`, so the screen never shows a raw id.
 * Singular is derived by trimming the authored plural rather than by authoring both: every shipped
 * faction name is its plural ("Dwarves", "Humans"), and a second field would be a second thing to
 * keep in step for a string the screen uses once.
 */
function requirementText(bounty: BountyData): string {
  const required = bounty.requires;
  if (required === undefined) {
    return '';
  }
  const count = Math.max(Math.floor(required.count), 0);
  if (count === 0) {
    return '';
  }
  const plural = FACTIONS_BY_ID.get(required.faction)?.name ?? required.faction;
  return `${count} ${count === 1 ? singular(plural) : plural}`;
}

/** "Dwarves" → "Dwarf", "Humans" → "Human", "Undead" → "Undead". */
function singular(plural: string): string {
  if (plural.endsWith('ves')) {
    return `${plural.slice(0, -3)}f`;
  }
  return plural.endsWith('s') ? plural.slice(0, -1) : plural;
}

/** A character id as the screen names it. */
function member(defId: string): CrewMemberView {
  const character = CHARACTERS_BY_ID.get(defId);
  const faction = character?.faction ?? '';
  return {
    defId,
    name: character?.name ?? defId,
    faction,
    factionName: FACTIONS_BY_ID.get(faction)?.name ?? faction,
  };
}

/**
 * A duration in words: "45m", "4h", "3h 12m".
 *
 * Worded rather than shown as a clock, because a bounty is measured in hours and a player reading
 * "03:12:44" has to decode a precision that means nothing here — the mission does not finish any
 * sooner for being watched to the second. Seconds are deliberately absent for the same reason, and
 * a mission under a minute out reads as "under a minute" rather than counting down.
 */
export function duration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '';
  }
  // ⚠️ Tested against `ms`, not against the rounded minutes. `Math.ceil` of any positive duration
  // is at least 1, so a `totalMinutes < 1` guard is unreachable and the sentence above quietly
  // described behaviour the screen never had — a mission thirty seconds out read as "1m".
  if (ms < 60_000) {
    return 'under a minute';
  }
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/** A currency delta as display rows, in the wallet's own order. */
function awards(
  source: CurrencyAmounts | Readonly<Partial<Record<CurrencyId, Numeric>>>,
): readonly BountyAwardView[] {
  const rows: BountyAwardView[] = [];
  for (const currency of CURRENCY_IDS) {
    const amount = source[currency];
    if (amount === undefined) {
      continue;
    }
    rows.push({ currency, amount: formatNumeric(amount), label: CURRENCY_LABELS[currency] });
  }
  return rows;
}
