import { emptyWallet, type Rates, type Wallet, zeroRates } from './currency';
import { type RngState } from './rng';
import { type OwnedCharacter } from './roster/types';
import { SAVE_VERSION } from './save/version';

/**
 * How many characters fight at once.
 *
 * Three, matching the party the game shipped with. Lives here rather than in `data/` because
 * it is a rule the save layer has to enforce when repairing a damaged party, and `core/`
 * cannot reach `data/` to ask.
 */
export const PARTY_SIZE = 3;

/**
 * The complete runtime game state.
 *
 * Every field is `readonly`: core functions return a new state rather than mutating the
 * one they were given. That purity is what lets the UI hold a state object directly as a
 * snapshot without defensive copying.
 */
export interface GameState {
  /** Save schema version. Present from the first commit so migrations always have a floor. */
  readonly version: number;
  /**
   * Every currency the run holds.
   *
   * A keyed record rather than a field per currency. Milestone 1 carried gold as two flat
   * fields, which was right for one quantity and would have been ten fields for five — each
   * needing its own line in `tick`, in `resume`, in the save encoder and in the repair pass.
   */
  readonly wallet: Wallet;
  /**
   * Idle income per second, per currency.
   *
   * Every rate starts at **zero**. A new run earns nothing at all while idle, which makes the
   * first battle the only thing worth doing; clearing a stage raises these permanently, and
   * they never fall.
   */
  readonly rates: Rates;
  /**
   * Epoch milliseconds at the last save or resume, used to size the offline window.
   *
   * Core never reads a clock, so this is only ever written from a `nowMs` passed in by the
   * UI — see {@link stampSaveTime} and `resume`.
   */
  readonly lastTickAt: number;
  readonly rng: RngState;
  /**
   * The stage the party is currently fighting, 1-based.
   *
   * An index rather than a stage id: `core/` cannot import `data/`, so it has no way to check
   * an id against the authored stages, whereas a bounded integer can be repaired on load
   * without knowing what content exists. The caller clamps it to the stages it actually has.
   */
  readonly stage: number;
  /**
   * How many stages have ever been cleared.
   *
   * Distinct from {@link stage}, which stops climbing at the end of the authored ladder and so
   * cannot answer "was this a first clear" once the player is farming the last one. First-clear
   * summon bonuses are paid against this.
   */
  readonly clearedStages: number;
  /**
   * Battles resolved over the life of the run.
   *
   * Part of the battle RNG label, so retrying a stage is a new fight rather than a replay of
   * the same loss. Combat draws from a derived sub-stream, so this counter is the only thing
   * that advances per battle — `rng.calls` belongs to pulls and is untouched by combat.
   */
  readonly battleCount: number;
  /**
   * Every character the player owns, one entry per character rather than per copy.
   *
   * Unordered as far as the simulation is concerned; the UI sorts it for display.
   */
  readonly roster: readonly OwnedCharacter[];
  /**
   * The party that fights, as character ids in slot order, at most {@link PARTY_SIZE}.
   *
   * Ids rather than roster indices, so reordering or repairing the roster cannot silently
   * change who is fighting.
   */
  readonly activeParty: readonly string[];
  /**
   * Pulls made since the last ascended-tier character, driving the pity curve.
   *
   * **Global, not per-banner.** Per-banner pity is a monetisation pattern — it makes every new
   * banner a fresh fifty-pull tax — and there is nothing here to monetise.
   */
  readonly pity: number;
  /** Pulls made over the life of the run. Display only; the RNG position lives in `rng.calls`. */
  readonly pullCount: number;
}

export interface NewGameOptions {
  /**
   * The run's RNG seed. Supplied by the caller because core must not call `Math.random()`;
   * the UI generates it once at new-game time and it lives in the save from then on.
   */
  readonly seed: number;
  /** Epoch milliseconds at creation, supplied by the caller because core has no clock. */
  readonly nowMs: number;
}

export function newGame({ seed, nowMs }: NewGameOptions): GameState {
  return {
    version: SAVE_VERSION,
    wallet: emptyWallet(),
    rates: zeroRates(),
    lastTickAt: nowMs,
    rng: { seed: seed >>> 0, calls: 0 },
    stage: 1,
    clearedStages: 0,
    battleCount: 0,
    // Empty, not seeded. `core/` cannot import `data/`, so it does not know who the starter
    // characters are — the UI grants them with `grantStarters`, which also repairs a save that
    // somehow arrives with nobody in it.
    roster: [],
    activeParty: [],
    pity: 0,
    pullCount: 0,
  };
}

/**
 * Stamps the current wall-clock time onto the state ahead of persisting it.
 *
 * Kept separate from `tick` so that core stays clockless: `tick` advances the simulation by
 * a duration it is handed, and only the persistence boundary knows what time it is.
 */
export function stampSaveTime(state: GameState, nowMs: number): GameState {
  return { ...state, lastTickAt: nowMs };
}
