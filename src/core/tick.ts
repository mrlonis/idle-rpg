import { type GameState } from './state';

/**
 * Advances the simulation by `dtMs`.
 *
 * Pure: returns a new state and never mutates the argument. This runs at roughly 10Hz from
 * the UI's sim loop, independent of the render clock.
 *
 * A non-positive or non-finite `dtMs` returns the state untouched rather than throwing.
 * Timer callbacks can fire with a zero or negative delta when the device clock is adjusted,
 * and that must not corrupt the run.
 */
export function tick(state: GameState, dtMs: number): GameState {
  if (!Number.isFinite(dtMs) || dtMs <= 0) {
    return state;
  }
  return {
    ...state,
    gold: state.gold.add(state.goldPerSec.mul(dtMs / 1000)),
  };
}
