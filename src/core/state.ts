import { type Numeric, ZERO } from './numeric';
import { type RngState } from './rng';
import { SAVE_VERSION } from './save/version';

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
  readonly gold: Numeric;
  /**
   * Idle income, in gold per second.
   *
   * Starts at **zero**. A new run earns nothing while idle, which makes the first battle the
   * only thing worth doing; clearing a stage raises this permanently, and it never falls. The
   * idle game is something the player switches on by fighting, not something running before
   * they have done anything.
   */
  readonly goldPerSec: Numeric;
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
   * Battles resolved over the life of the run.
   *
   * Part of the battle RNG label, so retrying a stage is a new fight rather than a replay of
   * the same loss. Combat draws from a derived sub-stream, so this counter is the only thing
   * that advances per battle — `rng.calls` belongs to pulls and is untouched by combat.
   */
  readonly battleCount: number;
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
    gold: ZERO,
    goldPerSec: ZERO,
    lastTickAt: nowMs,
    rng: { seed: seed >>> 0, calls: 0 },
    stage: 1,
    battleCount: 0,
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
