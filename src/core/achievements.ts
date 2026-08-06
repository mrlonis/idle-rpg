import { credit, type CurrencyAmounts, type CurrencyId } from './currency';
import { num, type Numeric, ZERO } from './numeric';
import { type GameState } from './state';

/**
 * Achievements: a reward for progress the run has already made, claimed rather than credited.
 *
 * ## Why a track is a rule instead of a list of rows
 *
 * A track pays every `every`th unit of some counter, forever. The obvious alternative — a table of
 * authored rows, "5 clears: 250 crystals; 10 clears: 250 crystals" — is the same per-stage
 * authoring problem milestone 11 removed from the reward curve, and it fails in the same place: a
 * chapter is fifty stages now and two hundred later, so a bounded list is either finite content
 * that runs out or thousands of rows nobody maintains. A rule means the same thing at five clears
 * and at five thousand.
 *
 * It is also what keeps the ledger to **one integer per track**. Everything else is derived:
 * `earned` is a division, `unclaimed` is a subtraction, and a save that arrives with a damaged
 * counter heals to exactly the value it should have had rather than to whatever it can rebuild.
 *
 * ## Why claimed rather than credited automatically
 *
 * Crediting silently would make this invisible — the crystals would arrive mixed into a stage
 * clear's payout and read as part of it. What the claim buys is a *moment*, and it is the same
 * argument the Altar makes for `ascendAll`: a screen the player goes to deliberately, with
 * something they have earned waiting on it.
 *
 * ⚠️ **Nothing is ever lost by not claiming.** Unclaimed rewards accumulate indefinitely and no
 * clock touches them, which is what keeps this on the right side of the project's rule against
 * manufactured urgency. A player who never opens the screen is owed exactly as much a year later.
 *
 * ## Where the content lives
 *
 * `core/` cannot see `data/`, so the tracks arrive as {@link AchievementTrackData} exactly as
 * every other piece of content does. What `core/` owns is the arithmetic and the ledger.
 */

/**
 * One endless achievement track: a counter, an interval, and what each interval pays.
 *
 * `counter` names which of the run's totals this reads. It is a closed union rather than a free
 * string because `core/` is what resolves it against {@link GameState} — a track naming a counter
 * nothing keeps would be content that silently never pays.
 */
export interface AchievementTrackData {
  readonly id: string;
  /** What the screen calls it. */
  readonly name: string;
  /** What the player is being paid for, in a line. */
  readonly description: string;
  /** Which of the run's running totals this track reads. */
  readonly counter: AchievementCounter;
  /** How many units of {@link counter} one award costs. */
  readonly every: number;
  /** What one award pays. */
  readonly reward: Readonly<Partial<Record<CurrencyId, number>>>;
}

/**
 * The run totals a track may be paid against.
 *
 * Deliberately only the counters {@link GameState} already keeps for its own reasons. A track
 * that needed a *new* counter would be asking for a field whose only purpose is to be rewarded,
 * which is how a progression system starts measuring itself.
 */
export type AchievementCounter = 'clearedStages' | 'battleCount' | 'pullCount';

/** How far a track has come, and what it owes. */
export interface AchievementProgress {
  readonly track: AchievementTrackData;
  /** The counter's current value, clamped to a whole number at or above zero. */
  readonly total: number;
  /** Awards the run has reached, claimed or not. */
  readonly earned: number;
  /** Awards already taken. */
  readonly claimed: number;
  /** Awards waiting to be taken. Never negative, even against a damaged ledger. */
  readonly unclaimed: number;
  /** Counter value at which the next award lands. */
  readonly nextAt: number;
  /** How far into the current interval the run is, in `[0, 1)`. */
  readonly fraction: number;
}

/** The claim ledger: how many awards each track has paid out, keyed by track id. */
export type AchievementLedger = Readonly<Record<string, number>>;

/** An empty ledger. A new run starts here and claims its way out. */
export function emptyAchievements(): AchievementLedger {
  return {};
}

/** A count read off an untrusted save or a damaged counter, as a whole number at or above zero. */
function wholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

/** The value of the counter a track is paid against. */
export function counterValue(state: GameState, counter: AchievementCounter): number {
  return wholeCount(state[counter]);
}

/**
 * How far `track` has come for this run.
 *
 * Clamps `every` to at least 1 rather than trusting it. A track authored with a zero or negative
 * interval would divide by zero and report an infinite number of unclaimed awards — which the
 * claim below would then pay.
 */
export function trackProgress(track: AchievementTrackData, state: GameState): AchievementProgress {
  const every = Number.isFinite(track.every) ? Math.max(Math.floor(track.every), 1) : 1;
  const total = counterValue(state, track.counter);
  const earned = Math.floor(total / every);
  // Clamped to `earned` at the top as well as to zero at the bottom: a ledger claiming more awards
  // than the run has reached is damage, and left alone it would silently withhold every future
  // award instead of paying nothing once.
  const claimed = Math.min(wholeCount(state.achievements[track.id] ?? 0), earned);
  return {
    track,
    total,
    earned,
    claimed,
    unclaimed: earned - claimed,
    nextAt: (earned + 1) * every,
    fraction: (total % every) / every,
  };
}

/** Every track's progress, in the order the tracks were authored. */
export function allProgress(
  tracks: readonly AchievementTrackData[],
  state: GameState,
): readonly AchievementProgress[] {
  return tracks.map((track) => trackProgress(track, state));
}

/** What one track currently owes, as a wallet delta. */
export function unclaimedReward(progress: AchievementProgress): CurrencyAmounts {
  const owed: Partial<Record<CurrencyId, Numeric>> = {};
  if (progress.unclaimed <= 0) {
    return owed;
  }
  for (const [id, amount] of Object.entries(progress.track.reward)) {
    if (Number.isFinite(amount) && amount > 0) {
      owed[id as CurrencyId] = num(amount).mul(progress.unclaimed);
    }
  }
  return owed;
}

/** The result of a claim: the run afterwards, and what it was paid. */
export interface ClaimResult {
  readonly state: GameState;
  /** What reached the wallet. Empty when there was nothing to take. */
  readonly gained: CurrencyAmounts;
  /** How many awards were taken, across every track claimed. */
  readonly awards: number;
}

/**
 * Claims everything owed across `tracks`.
 *
 * **All of them at once, with no confirmation, and that is licensed by the same argument the
 * Altar's `ascendAll` runs on**: nothing is spent, nothing is foregone, and no two tracks compete
 * for anything — so "claim everything" is a well-defined answer rather than a strategy, and a
 * dialog would be asking the player to confirm the only move.
 *
 * ⚠️ **Returns the same state object when nothing was owed**, not an equal one. `ui/` publishes
 * what it is handed, so a fresh object would redraw every screen watching the run in order to show
 * it numbers it already had. Callers use the identity to tell "this changed the run" from "this
 * was a no-op".
 *
 * The ledger is written from `earned` rather than incremented by `unclaimed`. The two agree
 * whenever the save is healthy, and they differ exactly when it is not — an incremented ledger
 * carries damage forward, where an assignment heals it.
 */
export function claimAchievements(
  state: GameState,
  tracks: readonly AchievementTrackData[],
): ClaimResult {
  let gained: CurrencyAmounts = {};
  let awards = 0;
  let repaired = false;
  const ledger: Record<string, number> = { ...state.achievements };

  for (const progress of allProgress(tracks, state)) {
    const stored = state.achievements[progress.track.id];
    // ⚠️ **An over-claimed entry is written down even when nothing is owed, and that is a repair
    // rather than tidiness.** `trackProgress` clamps a ledger claiming more awards than the run
    // has reached, which makes the *screen* right and leaves the *save* wrong — so the run would
    // go on owing nothing until it genuinely passed the bogus number, silently withholding every
    // award in between. Writing it down here is what bounds the damage to one press.
    if (stored !== undefined && stored > progress.earned) {
      ledger[progress.track.id] = progress.earned;
      repaired = true;
    }
    if (progress.unclaimed <= 0) {
      continue;
    }
    const owed = unclaimedReward(progress);
    const merged: Partial<Record<CurrencyId, Numeric>> = { ...gained };
    for (const [id, amount] of Object.entries(owed)) {
      merged[id as CurrencyId] = (merged[id as CurrencyId] ?? ZERO).add(amount);
    }
    gained = merged;
    awards += progress.unclaimed;
    ledger[progress.track.id] = progress.earned;
  }

  if (awards === 0 && !repaired) {
    return { state, gained: {}, awards: 0 };
  }
  return {
    state: {
      ...state,
      wallet: awards === 0 ? state.wallet : credit(state.wallet, gained),
      achievements: ledger,
    },
    gained,
    awards,
  };
}

/**
 * Decodes the ledger from an untrusted save.
 *
 * **Unknown track ids are kept rather than dropped**, which is the opposite of how the roster
 * treats an unknown character id — and for a reason the roster does not have. A character this
 * build does not ship cannot be fielded, so keeping it would mean carrying a fighter nobody can
 * use; a claim count this build has no track for costs one integer and is exactly what a save
 * needs to survive a build that ships fewer tracks than the one that wrote it. `trackProgress`
 * never reads a key it was not asked for, so an unknown entry is inert rather than dangerous.
 */
export function parseAchievements(
  raw: unknown,
  note: (field: string, problem: string, recovered: string) => void,
): AchievementLedger {
  if (typeof raw !== 'object' || raw === null) {
    if (raw !== undefined) {
      note(
        'achievements',
        `not an object (${JSON.stringify(raw) ?? 'undefined'})`,
        'nothing claimed',
      );
    }
    return {};
  }
  const ledger: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      note(`achievements.${id}`, `unusable (${JSON.stringify(value) ?? 'undefined'})`, '0');
      continue;
    }
    ledger[id] = Math.floor(value);
  }
  return ledger;
}
