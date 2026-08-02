/**
 * The combat clock.
 *
 * A battle tick is **not** a render frame or a sim tick. Battles resolve instantly and
 * headlessly inside `simulateBattle`, and a "tick" here is a unit of in-battle time used to
 * order actions and to price the fight in game seconds. Nothing in this file is read by the
 * render loop.
 *
 * That separation is what makes 2x/4x playback, skip, and offline resolution free: the
 * simulation already knows the whole fight, so the UI is only choosing how fast to narrate
 * something that has already happened.
 */

/**
 * Gauge value at which a combatant acts. Every combatant gains `spd` gauge per tick, so
 * `ATB_THRESHOLD / spd` is the number of ticks between its actions.
 *
 * 1000 gives speed values a comfortable authoring range — a `spd` of 100 acts once per
 * second at {@link BATTLE_TICK_MS}, and single-point differences still shift turn order over
 * a long fight, so SPD is a real stat rather than a rounding artefact.
 */
export const ATB_THRESHOLD = 1000;

/**
 * How much game time one battle tick represents.
 *
 * Only used to convert a resolved battle into a duration, which `BattleResult.durationMs`
 * reports. That was once earmarked for a `timeToClear(state, stage)` feeding a segmented
 * offline solver; both are cancelled — offline rates never change mid-window — so the duration
 * now exists for balance sweeps and for display.
 */
export const BATTLE_TICK_MS = 100;

/**
 * Hard ceiling on the length of one simulated battle.
 *
 * A termination guard, not a balance lever. The damage formula is strictly positive, so a
 * battle always ends eventually, but "eventually" is not good enough for a function that
 * runs synchronously on the main thread and will later run thousands of times inside a
 * balance sweep. A fight that hits this cap is reported as a stalemate.
 *
 * 18,000 ticks is 30 minutes of in-battle time — far beyond anything a tuned stage should
 * take, so hitting it is a signal that the matchup is hopeless rather than merely slow.
 */
export const MAX_BATTLE_TICKS = 18_000;

/** Converts a tick count into game milliseconds. */
export function ticksToMs(ticks: number): number {
  return ticks * BATTLE_TICK_MS;
}

/**
 * Ticks until a gauge at `gauge`, gaining `spd` per tick, reaches {@link ATB_THRESHOLD}.
 *
 * This is what lets the simulation skip straight to the next action instead of stepping one
 * tick at a time. The same reasoning as offline resume: a fight between slow combatants can
 * span thousands of ticks in which nothing whatsoever happens, and iterating over them is
 * pure waste. Recomputing this after every action means it stays correct if a later milestone
 * introduces haste or slow effects mid-battle.
 *
 * Never returns less than 1, so the caller is guaranteed forward progress even if it is
 * handed a gauge that is already full.
 */
export function ticksUntilReady(gauge: number, spd: number): number {
  return Math.max(1, Math.ceil((ATB_THRESHOLD - gauge) / spd));
}
