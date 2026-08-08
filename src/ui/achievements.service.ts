import { computed, inject, Service } from '@angular/core';
import {
  type AchievementProgress,
  type AchievementTrackData,
  allProgress,
  claimAchievements,
  CURRENCY_IDS,
  type CurrencyId,
  num,
  type Numeric,
  unclaimedReward,
  ZERO,
} from '../core';
import { ACHIEVEMENT_TRACKS, LADDER, TOWERS_BY_ID } from './content';
import { CURRENCY_LABELS, formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/** One currency, ready to put on screen. */
export interface AwardView {
  readonly currency: CurrencyId;
  /** The quantity, through the same formatter every other screen uses. */
  readonly amount: string;
  /** What the player calls that currency — "crystals" rather than `summons`. */
  readonly label: string;
}

/** One track as the screen draws it. */
export interface AchievementRowView extends AchievementProgress {
  /**
   * The heading, which is the track's name plus the tower it belongs to.
   *
   * ⚠️ **Fourteen of the sixteen shipped tracks share two names between them** — every tower has a
   * Spire Climber and a Spire Conqueror — so the track's own name identifies a *kind* of track
   * rather than a track. Resolved here rather than authored per tower because the tower's name
   * already lives in `TOWERS`, and a second copy in `data/achievements.ts` is a second thing to
   * rename. It is also load-bearing for the screen: seven identical `<h2>`s and seven progress bars
   * with the same accessible name is a WCAG failure, not just a readability one.
   */
  readonly name: string;
  /** What the whole outstanding balance on this track pays, already multiplied out. */
  readonly owed: readonly AwardView[];
  /** What a single award pays, for the row's subtitle. */
  readonly perAward: readonly AwardView[];
  /** How far into the current interval the run is, as a whole percentage. */
  readonly percent: number;
}

/** What a claim did, in the shape the screen reports it. */
export interface ClaimSummary {
  readonly awards: number;
  readonly gained: readonly AwardView[];
}

/**
 * The achievements screen's read model and its one action.
 *
 * Thin on purpose. Every number here is derived by `core/achievements.ts` from counters the run
 * already keeps, so this service holds **no state of its own** — it maps content onto the
 * authoritative snapshot and hands the claim back through `GameLoopService.apply`, which is the
 * only owner of the run. A second copy of "how many awards are owed" is exactly how a screen and
 * a save start disagreeing.
 */
@Service()
export class AchievementsService {
  private readonly game = inject(GameLoopService);

  /**
   * Every track, with what it has earned and what it owes.
   *
   * Recomputed off the ~6Hz snapshot like every other screen. Nothing here moves on a timer — a
   * track only changes when a stage falls — so this nearly always returns the same numbers, and
   * the cost of that is one division per track.
   */
  readonly rows = computed<readonly AchievementRowView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    // `LADDER` is the shipped ladder's shape, which is what turns a chapter track's `clearedStages`
    // into chapters — see `AchievementCounter`. Content, so it comes from `content.ts` rather than
    // from the run.
    return allProgress(ACHIEVEMENT_TRACKS, state, LADDER).map((progress) => ({
      ...progress,
      name: trackName(progress.track),
      owed: awards(unclaimedReward(progress)),
      perAward: awards(progress.track.reward),
      percent: Math.round(progress.fraction * 100),
    }));
  });

  /** How many awards are waiting, across every track. Drives the Town card and the button. */
  readonly unclaimed = computed(() => this.rows().reduce((total, row) => total + row.unclaimed, 0));

  /**
   * Takes everything owed, in one press.
   *
   * No confirmation, and the argument is the one `ascendAll` makes: nothing is spent and no two
   * tracks compete, so "claim everything" is the only move rather than a strategy. See
   * `claimAchievements` for the condition that would end that.
   */
  claimAll(): ClaimSummary {
    const state = this.game.current;
    if (state === null) {
      return { awards: 0, gained: [] };
    }
    const result = claimAchievements(state, ACHIEVEMENT_TRACKS, LADDER);
    // `result.state === state` is the no-op signal `claimAchievements` documents. It can still
    // differ with zero awards, when the pass wrote an over-claimed ledger back down — that is a
    // repair worth persisting even though the player is owed nothing by it.
    if (result.state !== state) {
      this.game.apply(() => result.state);
    }
    return { awards: result.awards, gained: awards(result.gained) };
  }
}

/**
 * A track's heading: its own name, and the tower it is about when it is about one.
 *
 * An unknown tower id falls back to the bare name rather than inventing one — the save layer keeps
 * progress for towers this build does not ship, and a track pointing at one is content that will
 * come back rather than an error.
 */
function trackName(track: AchievementTrackData): string {
  if (track.counter !== 'towerFloors') {
    return track.name;
  }
  const tower = TOWERS_BY_ID.get(track.tower);
  return tower === undefined ? track.name : `${track.name} — ${tower.name}`;
}

/**
 * A currency delta as display rows, dropping anything that rounds to nothing.
 *
 * Walks `CURRENCY_IDS` rather than the object's own keys, which buys two things: the rows come out
 * in the wallet's own order however the source was assembled, so a claim paying two currencies
 * reads the same way twice; and the value stays typed, where `Object.entries` over a union of two
 * partial records widens it to `any`.
 *
 * The source is a `Numeric` delta from `core/` or an authored `number` from `data/`, and both
 * arrive here — `unclaimedReward` returns the first and `track.reward` is the second.
 */
function awards(
  source: Readonly<Partial<Record<CurrencyId, Numeric | number>>>,
): readonly AwardView[] {
  const rows: AwardView[] = [];
  for (const currency of CURRENCY_IDS) {
    const amount = source[currency];
    if (amount === undefined) {
      continue;
    }
    const quantity = typeof amount === 'number' ? num(amount) : amount;
    if (quantity.lte(ZERO)) {
      continue;
    }
    rows.push({
      currency,
      amount: formatNumeric(quantity),
      label: CURRENCY_LABELS[currency],
    });
  }
  return rows;
}
