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
 * Gauge value at which a combatant acts. Every combatant gains `haste` gauge per tick, so
 * `ATB_THRESHOLD / haste` is the number of ticks between its actions.
 *
 * 1000 gives gauge values a comfortable authoring range — a `haste` of 100 acts once per
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
 * ⚠️ The battle timer: **ninety seconds, and running it out is a loss.**
 *
 * Two jobs in one number, and it is worth being clear that the second one arrived later.
 *
 * **It is the termination guard.** The damage formula is strictly positive, so a battle always
 * ends eventually, but "eventually" is not good enough for a function that runs synchronously on
 * the main thread and thousands of times inside a balance sweep.
 *
 * **It is also a rule of the game**, in the sense the genre uses: you have ninety seconds to win.
 * That is what it was lowered to from 18,000 ticks — thirty minutes — and the reason is that thirty
 * minutes was never a real bound on anything. A fight that could not be won produced half an hour
 * of battle log on a screen with no exit, and the tuned ladder never came close: the longest fight
 * any reference party has is 48.5 seconds, so the old cap was 37× a number nothing approached.
 *
 * **What the change actually fixed** is that "the fight is decided" and "the fight has finished"
 * had drifted apart. A party that cannot out-damage a healer had already lost by the first minute;
 * the clock was the only thing that had not noticed. A timer says so at ninety seconds, which is
 * both the honest answer and the one the player can act on.
 *
 * The headroom is now **1.9×** rather than 37×, and that is a live constraint on content rather
 * than slack: a stage tuned to take longer than ninety seconds against the party it is meant for
 * is a stage nobody can clear. `stages.balance.ts` asserts the margin, so the failure shows up as
 * a red sweep naming the stage rather than as an unwinnable ladder.
 */
export const MAX_BATTLE_TICKS = 900;

/** Converts a tick count into game milliseconds. */
export function ticksToMs(ticks: number): number {
  return ticks * BATTLE_TICK_MS;
}

/**
 * Ticks until a gauge at `gauge`, gaining `haste` per tick, reaches {@link ATB_THRESHOLD}.
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
export function ticksUntilReady(gauge: number, haste: number): number {
  return Math.max(1, Math.ceil((ATB_THRESHOLD - gauge) / haste));
}
