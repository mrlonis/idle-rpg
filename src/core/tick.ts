import { accrue, credit } from './currency';
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
 *
 * Every rate-bearing currency accrues here in one pass. Spark deliberately has no rate and so
 * is never touched — it is minted by duplicate pulls and nothing else, which the `Rates` type
 * enforces rather than leaving to a comment.
 *
 * ## Why this is a written-out literal and not `{ ...state, wallet }`
 *
 * The spread is the idiom everywhere else in `core/` and it should stay there. Here it is the
 * difference between a fast function and a slow one, because object spread is downleveled by the
 * dev and test pipeline into a helper that calls `Object.defineProperty` once per property — some
 * 25× the cost of a plain store, and this state has twenty of them. Spelling the object out took
 * this function from 1.6s to 0.3s over the 360,000 iterations `offline.spec.ts` runs to prove
 * that closed-form resume agrees with stepwise accrual. The shipped bundle keeps native spread,
 * so the app was never the thing being slowed down; the invariant was the thing being made
 * expensive to assert.
 *
 * It is also the safer of the two: a field added to {@link GameState} makes this literal a
 * compile error until it is carried, where a spread would carry it silently and never say so.
 * **Copy fields, do not compute them here** — this function's whole job is the wallet.
 */
export function tick(state: GameState, dtMs: number): GameState {
  if (!Number.isFinite(dtMs) || dtMs <= 0) {
    return state;
  }
  return {
    version: state.version,
    wallet: credit(state.wallet, accrue(state.rates, dtMs / 1000)),
    rates: state.rates,
    lastTickAt: state.lastTickAt,
    rng: state.rng,
    chapter: state.chapter,
    stage: state.stage,
    clearedStages: state.clearedStages,
    battleCount: state.battleCount,
    roster: state.roster,
    formations: state.formations,
    pity: state.pity,
    legendaryPity: state.legendaryPity,
    pullCount: state.pullCount,
    gear: state.gear,
    gearMinted: state.gearMinted,
    gearShop: state.gearShop,
    achievements: state.achievements,
    quests: state.quests,
    dispatches: state.dispatches,
    towers: state.towers,
  };
}
