import { type CombatantData, type StatBlockData } from '../battle/types';
import { num, type Numeric, serialize } from '../numeric';
import { clampRarityIndex, startRarityIndex } from './rarity';
import { type CharacterData, type CharacterTier, type OwnedCharacter } from './types';

/**
 * How a character's stats follow from its tier, its level and its rarity.
 *
 * ## Only the five quantities scale, and that is deliberate
 *
 * `hp`, `patk`, `matk`, `pdef` and `mdef` are quantities and grow without bound. Nothing else
 * in the block scales with anything.
 *
 * That is not a simplification, it is a requirement. `spd` is ATB gauge per tick against a
 * threshold of 1000, and `content.ts` clamps it to `[1, ATB_THRESHOLD]` because the
 * simulation's termination argument depends on nobody banking two actions in one tick. A
 * `spd` that grew with level would hit the clamp within about eighty levels and then be
 * identical for every character in the game — turning the one stat that buys turns into a
 * flat constant.
 *
 * The same argument covers the rest of the block from the other end. `critChance`, `dodge`,
 * `lifesteal`, `effectHit` and `tenacity` are probabilities and cannot exceed 1; `armorPen`
 * and `magicPen` are capped below 1 so a defensive stat can never be erased outright; and
 * `mp` is a **budget measured against authored skill costs**, so growing it would quietly
 * delete the metering that makes a healer's pool run out. Growth belongs to the quantities;
 * the scheduling weights, the probabilities and the resource budget stay where they were
 * authored, which is what keeps a fast fragile character fast and fragile at level 900.
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
 */

/** Growth rates as authored in `data/`. */
export interface GrowthData {
  /** Multiplier applied per level, per tier. Compounds — see the note above on divergence. */
  readonly perLevel: Readonly<Record<CharacterTier, number>>;
  /** Multiplier applied per rung climbed above the character's starting rarity. */
  readonly perAscension: number;
}

/** A growth factor, guarded so damaged content cannot shrink a character to nothing. */
function factor(value: number): number {
  return Number.isFinite(value) && value >= 1 ? value : 1;
}

/**
 * The multiplier a character's quantities carry at a given level and rarity.
 *
 * Exported because the UI shows it: "×4.8 at Legendary 210" is a far more legible answer to
 * "is this ascension worth it" than two stat blocks side by side.
 */
export function growthMultiplier(
  growth: GrowthData,
  tier: CharacterTier,
  level: number,
  rarityIndex: number,
): Numeric {
  // `Math.max(NaN, 1)` is `NaN`, so a damaged level has to be screened out before the clamp
  // rather than by it — otherwise every quantity on the character comes back `NaN` and the
  // battle it walks into cannot resolve.
  const levels = (Number.isFinite(level) ? Math.max(Math.floor(level), 1) : 1) - 1;
  const rungs = Math.max(clampRarityIndex(rarityIndex) - startRarityIndex(tier), 0);
  return num(factor(growth.perLevel[tier]))
    .pow(levels)
    .mul(num(factor(growth.perAscension)).pow(rungs));
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
    patk: scale(base.patk),
    matk: scale(base.matk),
    pdef: scale(base.pdef),
    mdef: scale(base.mdef),
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
 * same character ids, and so does the kit — a character's skills are what it *is*, not
 * something levelling hands it.
 */
export function toBattleCombatant(
  character: CharacterData,
  owned: OwnedCharacter,
  growth: GrowthData,
): CombatantData {
  return {
    id: character.id,
    name: character.name,
    faction: character.faction,
    stats: scaleStats(character.stats, growth, character.tier, owned.level, owned.rarity),
    basic: character.basic,
    skills: character.skills,
  };
}
