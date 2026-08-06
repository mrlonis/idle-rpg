import { computed, inject, Service } from '@angular/core';
import {
  allBountyProgress,
  awayMembers,
  type BountyData,
  type BountyFailure,
  bountyPayout,
  collectBounty,
  collectReadyBounties,
  CURRENCY_IDS,
  type CurrencyAmounts,
  type CurrencyId,
  dispatchBounty,
  type Numeric,
} from '../core';
import { BOUNTY_LIST, CHARACTERS_BY_ID } from './content';
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

  /** Every mission, in the order authored — shortest first. */
  readonly rows = computed<readonly BountyRowView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const now = Date.now();
    return allBountyProgress(BOUNTY_LIST, state, now).map((progress) => ({
      bounty: progress.bounty,
      running: progress.running,
      ready: progress.ready,
      unlocked: progress.unlocked,
      percent: Math.round(progress.fraction * 100),
      remaining: progress.running && !progress.ready ? duration(progress.remainingMs) : '',
      duration: duration(progress.bounty.durationMs),
      payout: awards(bountyPayout(progress.bounty, state.rates)),
      crew: (progress.dispatch?.members ?? []).map((defId) => member(defId)),
    }));
  });

  /** How many missions have finished and are waiting. Drives the Town card and the button. */
  readonly ready = computed(() => this.rows().filter((row) => row.ready).length);

  /**
   * Everybody who could be sent right now: owned, not fighting, not already away.
   *
   * ⚠️ **Both exclusions are the disjointness invariant showing through to the UI**, and offering
   * a character the core layer would refuse is how a player learns a rule by being told "no". The
   * list is what makes the rule visible instead.
   */
  readonly available = computed<readonly CrewMemberView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const fielded = new Set([...state.formation.front, ...state.formation.back]);
    const out = awayMembers(state);
    return state.roster
      .filter((owned) => !fielded.has(owned.defId) && !out.has(owned.defId))
      .map((owned) => member(owned.defId))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  /** Sends a crew. Returns the refusal reason when the board would not take them. */
  dispatch(bounty: BountyData, members: readonly string[]): BountyFailure | null {
    const state = this.game.current;
    if (state === null) {
      return 'not-owned';
    }
    const result = dispatchBounty(state, bounty, members, Date.now());
    if (!result.ok) {
      return result.reason;
    }
    this.game.apply(() => result.state);
    return null;
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

/** A character id as the screen names it. */
function member(defId: string): CrewMemberView {
  const character = CHARACTERS_BY_ID.get(defId);
  return {
    defId,
    name: character?.name ?? defId,
    factionName: character?.faction ?? '',
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
  const totalMinutes = Math.ceil(ms / 60_000);
  if (totalMinutes < 1) {
    return 'under a minute';
  }
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
