import { type StageKind } from './battle/types';

/**
 * What a fight has to do to drop an emblem, and how often it does.
 *
 * The other half of the emblem faucet lives in [`core/currency.ts`](./currency.ts) as
 * `EmblemRateCurve` — the idle rate that steps per chapter. This is the part that answers to
 * *fighting* rather than to time, and between them they are the only two ways an emblem enters a
 * run. Nothing else mints one: no shop sells them, no bounty pays them, and duplicate characters
 * still convert to spark.
 *
 * ## A chance, not a count, and why that is allowed here
 *
 * Gear drops a **range** with a floor of one, because "a fight never produces nothing" is a rule
 * this project holds everywhere — the same rule that makes a pull always produce something. An
 * emblem is drawn as a plain chance that usually fails, which looks like a violation and is not:
 * the gear drop already satisfies that rule unconditionally on every win. Emblems sit on top of a
 * payout that has already happened, so a miss is a fight that paid less rather than a fight that
 * paid nothing.
 *
 * ⚠️ **That licence is narrow and does not transfer.** If gear drops ever became conditional, this
 * would immediately be the thing making wins pay nothing, and it would have to grow a floor.
 *
 * ## One draw per fight, whatever happens
 *
 * {@link rollEmblems} takes exactly one draw from its stream, including on a fight that cannot
 * drop anything because the chapter gate is not met. That is not an oversight and it is not free
 * to change: the stream is derived per battle, so nothing downstream depends on the position — but
 * a version that returned early on the gate would consume a different number of draws before and
 * after chapter 1, which makes "what did seed X drop on stage Y" a question with two answers
 * depending on run history. Drawing unconditionally keeps the answer a function of the label
 * alone, which is what makes a recorded balance figure reproducible.
 */

/** How often a clear drops an emblem, by the kind of stage, and what gates it. */
export interface EmblemDropData {
  /** Chance an ordinary stage drops one, 0–1. */
  readonly normal: number;
  /** Chance a mini-boss drops one, 0–1. */
  readonly miniBoss: number;
  /** Chance a chapter boss — or a tower's roof — drops one, 0–1. */
  readonly boss: number;
  /**
   * Whole chapters that must be cleared before anything drops at all.
   *
   * The same threshold the idle rate crosses, authored once and shared, so "emblems unlock when
   * you finish a chapter" stays one fact. Two thresholds that happened to agree would be two
   * numbers free to drift, and the drift would present as a currency that drops before it can
   * accrue — or worse, the reverse.
   */
  readonly unlockChapters: number;
}

/** A probability clamped into `[0, 1]`, treating damaged content as "never". */
function chance(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}

/**
 * The chance one clear of this kind of stage drops an emblem, before the chapter gate.
 *
 * Exported because the pre-battle screen shows it: a player deciding whether to farm a boss or an
 * ordinary stage is making the decision this table exists to create, and a spread of one in fifty
 * against one in four is only an incentive if it is visible.
 */
export function emblemDropChance(drops: EmblemDropData, kind: StageKind): number {
  switch (kind) {
    case 'boss':
      return chance(drops.boss);
    case 'mini-boss':
      return chance(drops.miniBoss);
    default:
      return chance(drops.normal);
  }
}

/**
 * How many emblems one win drops: zero or one.
 *
 * Returns a count rather than a boolean so that widening this to a range later is a change to this
 * function alone rather than to every caller's type — the same latitude `dropCount` has on the
 * gear side.
 *
 * `clearedChapters` is the count **after** this fight is credited, deliberately. The chapter boss
 * of chapter 1 is the fight that completes chapter 1, and gating on the count before it would mean
 * the clear that unlocks emblems is the one clear that cannot drop one — a rule the player would
 * experience as the reward arriving a stage late for no reason they could see.
 *
 * Takes a raw `() => number` rather than an `RngStream` because it never needs to commit: combat
 * and its drops run on a **derived** stream, so nothing here advances `state.rng.calls` and the
 * pull sequence is untouched by fighting.
 */
export function rollEmblems(
  drops: EmblemDropData,
  kind: StageKind,
  clearedChapters: number,
  draw: () => number,
): number {
  // Drawn before the gate is checked rather than after, so the number of draws a fight takes is
  // the same on both sides of chapter 1. See the note at the top of this file.
  const roll = draw();
  const gate = Number.isFinite(drops.unlockChapters) ? Math.max(drops.unlockChapters, 0) : 0;
  const cleared = Number.isFinite(clearedChapters) ? Math.max(clearedChapters, 0) : 0;
  if (cleared < gate) {
    return 0;
  }
  return roll < emblemDropChance(drops, kind) ? 1 : 0;
}
