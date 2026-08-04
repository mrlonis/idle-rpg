import { type SkillData } from '../battle/types';
import { clampRarityIndex, rarityIndex, startRarityIndex } from './rarity';
import { type CharacterTier } from './types';

/**
 * How many of a character's skills it may actually use, and when each one arrives.
 *
 * ## Two axes, and they answer different questions
 *
 * **Tier sets the ceiling** — how many skills a character can ever field, its ultimate included.
 * **Ascension rungs unlock up to it** — the ultimate from the start, the next skill at `elite`,
 * the one after at `legendary`, the last at `ascended`.
 *
 * So tier answers "how deep does this kit go" and rarity answers "how much of it do I have yet".
 * A common-tier character is complete at two skills and reaches the second one early; an
 * ascended-tier character has four and spends the whole ladder collecting them.
 *
 * ## The rung mapping is absolute rarity, and that is a deliberate head start
 *
 * The thresholds are read against the ladder itself rather than against each character's own
 * starting rung. An `ascended`-tier character starts at `elite` — see {@link startRarityIndex} —
 * so it arrives with its second skill already unlocked, while a common-tier one climbs two rungs
 * for the same thing.
 *
 * That was chosen with the alternative on the table. Counting rungs from each character's own
 * start would have given tier a higher ceiling and no free unlock, which preserves milestone 3's
 * "tier is a slope, not a head start" exactly. Absolute rarity modifies that promise twice over —
 * a capability gate *and* a head start on reaching it — and it is recorded here rather than left
 * to be discovered, because the thing that keeps it fair is a tuning target rather than a rule:
 * five common-tier characters at level 80 clear the hand-climbed half **with two skills each**,
 * which `data/stages.balance.ts` sweeps.
 *
 * ## The ultimate is never gated
 *
 * It is the one skill the roster screen names, the energy bar meters, and every kit is asserted
 * to carry exactly one of. A ceiling that could take it away would leave a combatant with a bar
 * that fills and can never be spent, which reads as a simulation bug rather than as progression.
 * So an ultimate is unlocked unconditionally here — not merely "unlocked at the starting rung",
 * which a damaged save sitting below its tier's floor could still fall through.
 *
 * ## Which ordinary skill unlocks first is the authored order
 *
 * A kit is a list, and the ordinary skills in it unlock in the order they are written. `data/`
 * authors the ultimate first and the rest in unlock order, which `data/characters.spec.ts`
 * asserts — so reading a kit top to bottom reads the progression.
 */

/** The ceiling table and the rung thresholds, as authored in `data/`. */
export interface KitRulesData {
  /** Skills a tier may field in total, **counting its ultimate**. */
  readonly ceiling: Readonly<Record<CharacterTier, number>>;
  /**
   * Rarity ids unlocking the first, second and third ordinary skill, in that order.
   *
   * Ids rather than ladder indices, because these are three names rather than a table indexed by
   * rarity — and an id that is not a rarity is then a failing spec instead of a silent index 0.
   */
  readonly unlocks: readonly string[];
}

/** One skill in a kit, and whether the character has earned it yet. */
export interface KitSlot {
  readonly skill: SkillData;
  readonly unlocked: boolean;
  /**
   * The rarity index that unlocks this skill, absent when no rung ever will.
   *
   * Absent covers exactly one shipped case and one damaged one: a skill authored past its tier's
   * ceiling, and a threshold naming a rarity that does not exist. An ultimate carries the tier's
   * starting rung here — true, and what the sheet shows — but its {@link unlocked} does not
   * depend on it.
   */
  readonly unlocksAt?: number;
}

/** Skills a tier may ever field, ultimate included. Never below one: every kit has an ultimate. */
export function skillCeiling(rules: KitRulesData, tier: CharacterTier): number {
  const authored = rules.ceiling[tier];
  return Number.isFinite(authored) ? Math.max(Math.floor(authored), 1) : 1;
}

/**
 * The rarity index unlocking the `ordinal`-th ordinary skill of a kit, counting from zero.
 *
 * `undefined` means no rung ever unlocks it — either the tier's ceiling stops short of that many
 * skills, or the authored threshold does not name a real rarity. Both resolve to "locked" rather
 * than to "free", which is the direction that cannot hand out power nobody authored.
 */
export function ordinaryUnlock(
  rules: KitRulesData,
  tier: CharacterTier,
  ordinal: number,
): number | undefined {
  if (ordinal < 0 || ordinal >= skillCeiling(rules, tier) - 1) {
    return undefined;
  }
  const threshold = rules.unlocks[ordinal];
  if (threshold === undefined) {
    return undefined;
  }
  const index = rarityIndex(threshold);
  return index < 0 ? undefined : index;
}

/**
 * Every skill in a kit, paired with whether this character has unlocked it.
 *
 * The whole kit rather than only the usable part, because the character sheet shows what is still
 * to come — a gate the player cannot see reads as content that is missing.
 */
export function kitSlots(
  skills: readonly SkillData[],
  rules: KitRulesData,
  tier: CharacterTier,
  rarity: number,
): readonly KitSlot[] {
  const reached = clampRarityIndex(rarity);
  let ordinal = 0;

  return skills.map((skill) => {
    if (skill.ultimate === true) {
      return { skill, unlocked: true, unlocksAt: startRarityIndex(tier) };
    }
    const unlocksAt = ordinaryUnlock(rules, tier, ordinal);
    ordinal++;
    return unlocksAt === undefined
      ? { skill, unlocked: false }
      : { skill, unlocked: reached >= unlocksAt, unlocksAt };
  });
}

/**
 * The part of a kit a character actually fights with.
 *
 * This is what `toBattleCombatant` hands the simulation. Combat itself knows nothing about tiers
 * or rungs: it receives a kit that has already been narrowed, exactly as it receives stats that
 * have already been scaled.
 */
export function unlockedSkills(
  skills: readonly SkillData[],
  rules: KitRulesData,
  tier: CharacterTier,
  rarity: number,
): readonly SkillData[] {
  return kitSlots(skills, rules, tier, rarity)
    .filter((slot) => slot.unlocked)
    .map((slot) => slot.skill);
}

/**
 * The next skill an ascension would unlock, or `undefined` when there is none left to buy.
 *
 * What the ascension card names, so a rung is a promise the player can read before paying for it
 * rather than a surprise on the other side.
 */
export function nextSkillUnlock(
  skills: readonly SkillData[],
  rules: KitRulesData,
  tier: CharacterTier,
  rarity: number,
): KitSlot | undefined {
  return kitSlots(skills, rules, tier, rarity).find(
    (slot) => !slot.unlocked && slot.unlocksAt !== undefined,
  );
}
