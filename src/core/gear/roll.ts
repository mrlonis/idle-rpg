import { type StageKind } from '../battle/types';
import { type GearSpec } from './inventory';
import { GEAR_ARCHETYPES, GEAR_SLOTS, type GearRulesData } from './types';

/**
 * What a piece of gear looks like when it arrives, whether from a fight or from the shop.
 *
 * Both sources want the same three answers — which slot, which archetype, which alignment — and
 * the same skewed grade draw, so they share this rather than each growing their own copy. What
 * differs is only where the randomness comes from and how many pieces are asked for.
 *
 * ## Every draw is from a derived stream, and that is a rule rather than a preference
 *
 * `core/rng.ts` splits the run's randomness in two: the **main** stream, whose position lives in
 * `rng.calls` and is advanced by pulls, and derived sub-streams that advance nothing. Gear draws
 * from derived streams exclusively.
 *
 * ⚠️ Doing otherwise would make **fighting a stage shift the gacha sequence**, which is the exact
 * hazard milestone 2 built sub-streams to avoid and milestone 3 stopped treating as hypothetical: a
 * player who re-fights a stage before pulling would get a different pull than one who pulled first,
 * and neither would ever know why. It also matters in the other direction here — the shop's stock
 * has to be the *same* six items every time the app is relaunched inside the hour, which a stream
 * with a moving position cannot promise.
 */

/** A `() => number` in `[0, 1)`, which is what `derivedStream` hands back. */
export type Draw = () => number;

/**
 * Picks one entry from a weighted list.
 *
 * Takes weights already resolved to numbers rather than a key function, so both callers can skew
 * them differently before drawing. A list whose weights sum to nothing falls back to the last
 * entry rather than to `undefined` — the caller is asking for *a* grade, and refusing to answer
 * would push a null check into every drop site.
 */
export function weightedIndex(weights: readonly number[], draw: Draw): number {
  let total = 0;
  for (const weight of weights) {
    total += Number.isFinite(weight) && weight > 0 ? weight : 0;
  }
  if (total <= 0) {
    return Math.max(weights.length - 1, 0);
  }
  let roll = draw() * total;
  for (const [index, weight] of weights.entries()) {
    const value = Number.isFinite(weight) && weight > 0 ? weight : 0;
    roll -= value;
    if (roll < 0) {
      return index;
    }
  }
  return weights.length - 1;
}

/**
 * The grade weights at a given point on the ladder: a hard unlock gate, then a soft tilt.
 *
 * ## The gate
 *
 * A grade whose {@link GearGradeData.unlockIndex} is above this stage weighs nothing, so it cannot
 * drop and cannot be stocked. That makes the opening of a run **one grade wide** — every piece that
 * arrives is comparable to every other, and the only question a drop poses is which slot it fills.
 *
 * ⚠️ **This overrides a position this comment used to take, and the old argument is kept because it
 * is still half right.** It read: *"The top grade is reachable at stage 1, merely rare. A hard band
 * gate would make the first stage of each band a cliff, and everything earned below it garbage the
 * instant it was crossed."* The cliff is real and it is the price paid here. What the argument
 * missed is the opening: a soft tilt hands a new run a lottery ticket it cannot cash, because the
 * gold to enhance a lucky relic is twenty hours away and the piece sits at level 1 meanwhile.
 *
 * Two things bound the cliff. A gate only ever **widens** the table — the grades below keep
 * dropping at their authored weight, so nothing already earned becomes unobtainable — and the
 * bottom grade is ungated by construction, so the ladder always drops something.
 *
 * ## The tilt, among what is unlocked
 *
 * A grade's authored weight is then multiplied by `(1 + index / softness) ** gradeIndex`, so depth
 * tilts the same ladder rather than replacing it. Two properties still fall out of that shape:
 *
 * - **The authored weights are the distribution at stage 1**, because the tilt starts at 1 rather
 *   than at `1 / softness`. That is what the `1 +` buys, and it is not cosmetic: a bare ratio makes
 *   the top grade's weight `softness ** −4` at the bottom of the ladder — one in millions rather
 *   than one in hundreds — so the authored number stops describing anything a reader could predict
 *   from.
 * - **The bottom grade never becomes impossible**, it becomes rare — and a worn piece late in the
 *   run is still worth its salvage, so a drop is never a nothing.
 *
 * The exponent is the grade's own index, which is what makes the tilt compound up the ladder: at
 * the top of chapter 2 a relic is four factors of the tilt ahead of a worn piece rather than one.
 */
export function gradeWeights(rules: GearRulesData, stageIndex: number): readonly number[] {
  const softness = Number.isFinite(rules.drops.gradeSoftness)
    ? Math.max(rules.drops.gradeSoftness, 1)
    : 1;
  const depth = Number.isFinite(stageIndex) ? Math.max(stageIndex, 1) : 1;
  const tilt = 1 + depth / softness;
  return rules.grades.map((grade, index) => {
    // An unauthored or damaged gate reads as ungated rather than as locked. A grade nobody can
    // reach is a content bug that presents as a thinner drop table, which is exactly the class of
    // failure that goes unnoticed for a milestone.
    const unlock = Number.isFinite(grade.unlockIndex) ? Math.max(grade.unlockIndex, 0) : 0;
    if (depth < unlock) {
      return 0;
    }
    const weight = Number.isFinite(grade.weight) ? Math.max(grade.weight, 0) : 0;
    return weight * Math.pow(tilt, index);
  });
}

/**
 * The best grade this build will hand out at `stageIndex`, for the screens that explain the gate.
 *
 * `ui/` needs this to say *why* the shop is showing nothing but worn pieces, and a screen that
 * recomputed it from the grade table would be a second place the gate is spelled out.
 */
export function unlockedGrades(rules: GearRulesData, stageIndex: number): number {
  const weights = gradeWeights(rules, stageIndex);
  let count = 0;
  for (const weight of weights) {
    if (weight > 0) {
      count++;
    }
  }
  return Math.max(count, 1);
}

/** How many pieces a stage of this kind drops on a win. */
export function dropCount(rules: GearRulesData, kind: StageKind): number {
  const authored =
    kind === 'boss'
      ? rules.drops.boss
      : kind === 'mini-boss'
        ? rules.drops.miniBoss
        : rules.drops.normal;
  return Number.isFinite(authored) ? Math.max(Math.floor(authored), 0) : 0;
}

/**
 * Rolls one piece.
 *
 * Slot and archetype are uniform, and alignment is unaligned with probability
 * `rules.unalignedChance` and otherwise uniform over the factions this build ships.
 *
 * **Uniform archetypes rather than weighted toward the party** was a real choice. Weighting drops
 * toward what the player is fielding makes every drop more likely to be usable, and it makes the
 * bag stop being a reason to field anybody new: the gear you own becomes an argument for the party
 * you already have, which is the opposite of what a game built on sidegrades wants. Uniform means
 * a tank piece arriving is a small nudge toward trying a tank.
 *
 * The order of the four draws is fixed and load-bearing in the way every RNG sequence in this
 * project is: changing it re-rolls every historical drop for a given seed, which is invisible in
 * play and turns every recorded balance figure into a different number.
 */
export function rollGear(rules: GearRulesData, factions: readonly string[], draw: Draw): GearSpec {
  const slot = GEAR_SLOTS[Math.floor(draw() * GEAR_SLOTS.length)] ?? 'head';
  const archetype = GEAR_ARCHETYPES[Math.floor(draw() * GEAR_ARCHETYPES.length)] ?? 'brawler';
  const unaligned = Number.isFinite(rules.unalignedChance)
    ? Math.min(Math.max(rules.unalignedChance, 0), 1)
    : 1;
  const aligned = draw() >= unaligned && factions.length > 0;
  const alignment = aligned ? factions[Math.floor(draw() * factions.length)] : undefined;
  return { slot, archetype, grade: 0, alignment };
}

/**
 * Everything a stage clear drops, in order.
 *
 * The grade is drawn per piece rather than once for the batch, so a boss dropping three is three
 * independent chances at the top grade rather than one chance repeated — which is what makes a
 * boss meaningfully better than three ordinary stages rather than merely faster.
 */
export function rollDrops(
  rules: GearRulesData,
  factions: readonly string[],
  stageIndex: number,
  kind: StageKind,
  draw: Draw,
): readonly GearSpec[] {
  const count = dropCount(rules, kind);
  if (count === 0) {
    return [];
  }
  const weights = gradeWeights(rules, stageIndex);
  const specs: GearSpec[] = [];
  for (let index = 0; index < count; index++) {
    const spec = rollGear(rules, factions, draw);
    specs.push({ ...spec, grade: weightedIndex(weights, draw) });
  }
  return specs;
}
