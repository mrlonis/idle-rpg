import { type CombatantData, type EnemyData, type StatBlockData } from '../battle/types';
import { applyGearBonus } from '../gear/stats';
import { type GearBonus } from '../gear/types';
import { type CharacterTier, growthAt, type GrowthData } from '../growth';
import { num, type Numeric, serialize } from '../numeric';
import { type KitRulesData, unlockedSkills } from './kit';
import { clampRarityIndex, startRarityIndex } from './rarity';
import { type CharacterData, type OwnedCharacter } from './types';

/**
 * How a combatant's stats follow from its tier, its level and its rarity.
 *
 * "A character's" until milestone 10. Enemies used to be hand-authored stat blocks that never
 * grew, and this file was the roster's private business; now an enemy is a definition plus a
 * level and climbs the same slopes, so {@link toEnemyCombatant} sits beside
 * {@link toBattleCombatant} at the bottom of the file. The two are deliberately the same
 * function with different paperwork — that symmetry is the milestone's whole thesis, since a
 * player curve worth ×10⁹ against a fixed enemy is not a power fantasy, it is deleted content.
 *
 * ## Only the four quantities scale, and that is deliberate
 *
 * `hp`, `atk`, `def` and `recovery` are quantities and grow without bound. Nothing else in the
 * block scales with anything.
 *
 * That is not a simplification, it is a requirement. `haste` is ATB gauge per tick against a
 * threshold of 1000, and `content.ts` clamps it to `[1, ATB_THRESHOLD]` because the
 * simulation's termination argument depends on nobody banking two actions in one tick. A
 * `haste` that grew with level would hit the clamp within about eighty levels and then be
 * identical for every character in the game — turning the one stat that buys turns into a
 * flat constant. `attackSpeed` is folded into the same gauge and inherits the same bound.
 *
 * The same argument covers the rest of the block from the other end. `critChance`, `critBlock`,
 * `dodge`, `lifeLeech`, `insight` and `tenacity` are probabilities and cannot exceed 1; the
 * pierce pair is capped below 1 so a defensive stat can never be erased outright, and the
 * resist pair is capped below 1 because a combatant nothing can damage is a battle that never
 * ends; and `energyRegen` is a **budget measured against a fixed 100-point bar**, so growing it
 * would put every ultimate in the game on a one-turn meter within about eighty levels. That last
 * argument is inherited verbatim from the `mp` pool energy replaced in 8b — the resource changed
 * shape, and the reason it must not scale did not.
 *
 * **`recovery` is the exception that proves the rule, and it is the one new stat that had to
 * be.** It is a quantity measured against `hp`, so a fixed value is a no-op the moment health
 * outgrows it — the budget argument run backwards. `healthRegen` amplifies it as a percentage
 * and therefore stays where it was authored, which is the correct side of the line for both.
 *
 * Growth belongs to the quantities; the scheduling weights, the probabilities and the resource
 * budget stay where they were authored, which is what keeps a fast fragile character fast and
 * fragile at level 900.
 *
 * ## Why tiers diverge instead of starting apart
 *
 * Each tier has its own per-level growth rate. Base stat budgets are roughly equal across
 * tiers — a higher tier spends its budget on sharper spikes and worse weaknesses, not on
 * more of everything — so at level 1 a common-tier character is genuinely competitive.
 *
 * The gap opens over the run. Compounding a ~0.3 percentage-point difference in per-level
 * growth across a thousand levels is worth roughly twenty times, which is what makes a
 * common-tier unit an excellent early investment and a joke in the late game **as a
 * consequence of the math** rather than as an assertion. A flat multiplier could not do this:
 * it would leave common tier a fixed percentage behind forever, always the same distance from
 * relevance no matter how long the run went on.
 *
 * That twenty times survived milestone 10 unchanged, which was a decision rather than an
 * accident: the rescale multiplied every tier's multiplier-at-cap by the same factor, so the
 * published ratios between the three are exactly what they were. Scaling the *exponents* by a
 * common factor was the other candidate and would have blown the gap out to several thousand —
 * a retune of milestone 3's central promise wearing the clothes of an arithmetic detail.
 */

/**
 * The multiplier a character's quantities carry at a given level and rarity.
 *
 * The rarity-flavoured wrapper around {@link growthAt}, which counts rungs instead. Exported
 * because the UI shows it: "×4.8 at Legendary 210" is a far more legible answer to "is this
 * ascension worth it" than two stat blocks side by side.
 */
export function growthMultiplier(
  growth: GrowthData,
  tier: CharacterTier,
  level: number,
  rarityIndex: number,
): Numeric {
  return growthAt(
    growth,
    tier,
    level,
    Math.max(clampRarityIndex(rarityIndex) - startRarityIndex(tier), 0),
  );
}

/**
 * Scales an authored stat block for level and rarity.
 *
 * Returns a {@link StatBlockData} rather than resolved `CombatStats` so the result stays a
 * plain, JSON-safe stat block: quantities become exponential-notation strings, which is
 * exactly the shape `StatBlockData` documents for values that outgrow float64. That keeps one
 * path into the simulation — everything still enters combat through `content.ts` — instead of
 * a second, parallel way to build a combatant.
 */
export function scaleStats(
  base: StatBlockData,
  growth: GrowthData,
  tier: CharacterTier,
  level: number,
  rarityIndex: number,
): StatBlockData {
  const multiplier = growthMultiplier(growth, tier, level, rarityIndex);
  const scale = (raw: number | string): string => serialize(num(raw).mul(multiplier));

  return {
    ...base,
    hp: scale(base.hp),
    atk: scale(base.atk),
    def: scale(base.def),
    // Absent stays absent. A character with no natural recovery should not acquire one at
    // level 2 just because the scaler visited the field.
    ...(base.recovery === undefined ? {} : { recovery: scale(base.recovery) }),
    // Everything else carries through untouched — see the note at the top of this file. The
    // spread is what does it, so a stat added to the block later is unscaled by default, which
    // is the safe direction: a scheduling weight or a probability that quietly started growing
    // would be far harder to notice than one that did not.
  };
}

/**
 * Resolves one owned character into the combatant the simulation fights with.
 *
 * The `id` carries through unchanged so battle events, the roster and the save all speak the
 * same character ids.
 *
 * **The kit does not.** Since milestone 8c a character fights with the part of its kit it has
 * unlocked — tier sets the ceiling, ascension rungs unlock up to it, and `core/roster/kit.ts`
 * decides which. Narrowing it here rather than inside the simulation is the same seam `scaleStats`
 * sits on: combat receives a combatant that is already exactly what the player owns, and knows
 * nothing about tiers or rungs.
 *
 * **`level` is passed rather than read off `owned`, and that is the milestone 9 seam.** Since
 * resonance, `OwnedCharacter.level` is what the player *paid for* and the character fights at its
 * **effective** level — see `core/roster/resonance.ts`. Reading the invested level here would
 * send a bench character into a fight at the level it was bought at while every screen showed it
 * carried, which is the one disagreement a derived-not-stored design has to be built against. So
 * the caller resolves it, with `effectiveLevel`, and passes the answer in. Rarity is still
 * read off `owned` because ascension is individual and nothing carries it.
 */
export function toBattleCombatant(
  character: CharacterData,
  owned: OwnedCharacter,
  growth: GrowthData,
  kit: KitRulesData,
  level: number,
  gear?: GearBonus,
): CombatantData {
  const scaled = scaleStats(character.stats, growth, character.tier, level, owned.rarity);
  return {
    id: character.id,
    name: character.name,
    faction: character.faction,
    // Gear is applied **after** growth rather than to the authored block, and the order is not
    // arbitrary. A percentage of the level-1 block is a fixed quantity that the level curve then
    // leaves behind within a few dozen levels; a percentage of the *scaled* block is worth the same
    // proportion forever, which is the whole reason gear is expressed as a percentage. See
    // `core/gear/stats.ts`.
    //
    // Both operations are multiplications, so they commute and the whole-board rescale identity
    // that `simulate.spec.ts` asserts survives either way. The order matters for what the number
    // *means*, not for whether the arithmetic works.
    stats: gear === undefined ? scaled : applyGearBonus(scaled, gear),
    basic: character.basic,
    skills: unlockedSkills(character.skills ?? [], kit, character.tier, owned.rarity),
  };
}

/**
 * Resolves one authored enemy into the combatant the simulation fights with.
 *
 * The other side of {@link toBattleCombatant}, and deliberately the smaller function: an enemy
 * has no owner, so there is no invested level to reconcile and no kit to narrow. A stage names
 * the archetype and the level; the archetype's own tier decides the slope.
 *
 * **There is no ascension rung on this side, and that is a decision rather than an omission.**
 * Milestone 10 planned enemies as "a definition plus a level, tier and rarity". A rung is a flat
 * multiplier, so a per-stage one is a ×1.6 cliff on the dial `level` already turns smoothly, and
 * a per-archetype one is a multiplication of a stat block the author is writing anyway. Both
 * spellings say what the block already says, so the block says it. `rungs` is passed as zero
 * here rather than plumbed through as a parameter nothing supplies.
 */
export function toEnemyCombatant(
  enemy: EnemyData,
  growth: GrowthData,
  level: number,
): CombatantData {
  return {
    id: enemy.id,
    name: enemy.name,
    faction: enemy.faction,
    stats: scaleStats(enemy.stats, growth, enemy.tier, level, startRarityIndex(enemy.tier)),
    basic: enemy.basic,
    skills: enemy.skills,
  };
}
