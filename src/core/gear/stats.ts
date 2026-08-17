import { type StatBlockData } from '../battle/types';
import { num, serialize } from '../numeric';
import {
  GEAR_ARCHETYPES,
  GEAR_SLOTS,
  GEAR_STATS,
  type GearArchetype,
  type GearBonus,
  type GearGradeData,
  type GearItem,
  type GearLoadout,
  type GearRulesData,
  type GearStat,
  type GearStatProfile,
  NO_GEAR_BONUS,
} from './types';

/**
 * What wearing gear is worth, and how it reaches the stat block.
 *
 * Everything here is a **fraction of the wearer's own stat**, for the reasons set out at the top of
 * [`types.ts`](./types.ts): a percentage survives the ×10⁹ level curve without a second curve of
 * its own, and it commutes with the whole-board rescale that `simulate.spec.ts` asserts is an
 * identity.
 *
 * One piece is worth `profile[stat] × grade.multiplier × (1 + perLevel × (level − 1))`, times the
 * alignment bonus when the wearer's faction matches. A loadout is the sum over its pieces, and the
 * sum is applied to the block as `stat × (1 + bonus)`.
 *
 * **Summing rather than compounding** is deliberate. Five pieces each worth ×1.2 compounded is
 * ×2.49 and five pieces summed is ×2.00, which is a difference nobody would notice — but the
 * compounding version makes the *last* piece the most valuable, so a player is rewarded for
 * finishing a set and punished for a bag that is four-fifths there. Summed, every piece is worth
 * what it says it is worth, whatever else is on, which is the property a screen can explain.
 */

/** The grade at `index`, clamped into the ladder this build ships. */
export function gradeAt(rules: GearRulesData, index: number): GearGradeData | undefined {
  const grades = rules.grades;
  if (grades.length === 0) {
    return undefined;
  }
  const clamped = clampGradeIndex(rules, index);
  return grades[clamped];
}

/** A grade index clamped into the authored ladder. An empty ladder clamps to zero. */
export function clampGradeIndex(rules: GearRulesData, index: number): number {
  const top = Math.max(rules.grades.length - 1, 0);
  if (!Number.isFinite(index)) {
    return 0;
  }
  return Math.min(Math.max(Math.floor(index), 0), top);
}

/**
 * The highest enhancement level a piece of this grade may reach.
 *
 * The grade ladder carries the cap rather than one global maximum, which is the same arrangement
 * `LEVEL_CURVE.caps` makes for characters: a rung is worth having partly because of the headroom it
 * unlocks. The top grade's cap is the game's stated ceiling of 100; everything below it stops
 * sooner, so a better piece is better twice over — a higher multiplier and further to climb.
 */
export function maxGearLevel(rules: GearRulesData, grade: number): number {
  const rung = gradeAt(rules, grade);
  const max = rung === undefined ? 1 : rung.maxLevel;
  return Number.isFinite(max) ? Math.max(Math.floor(max), 1) : 1;
}

/** A level clamped into `[1, maxGearLevel]`. */
export function clampGearLevel(rules: GearRulesData, grade: number, level: number): number {
  if (!Number.isFinite(level)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(level), 1), maxGearLevel(rules, grade));
}

/**
 * The whole grade ladder read as **one** run of enhancement levels, laid end to end.
 *
 * Worn 1 is position 1, Worn 20 is 20, Sturdy 1 is 21, and Relic 100 is the last position — so the
 * shipped ladder is 300 positions long. It exists so that content wanting *one monotone gear axis*
 * can interpolate a single number instead of authoring a grade and a level separately and then
 * having to keep the pair ordered by hand.
 *
 * ⚠️ **A grade boundary is not a level reset, and that is the whole reason this is not two dials.**
 * `gradeScale` multiplies the grade's own multiplier by `1 + perLevel × (level − 1)`, so Worn 20 is
 * worth 1.176 of a piece's profile and Sturdy 1 only 1.35 × 1.0 = 1.35 — the step up is real, but a
 * ramp that restarted the *level* at every grade while walking the grade up would still be monotone
 * only by luck. Walking one position keeps it monotone by construction, which is what
 * `gear.spec.ts` asserts.
 *
 * ⚠️ **Positions are one-based and clamp rather than validate**, the posture every other authored
 * index into content takes. Position 0 or a non-finite one is the bottom of the ladder.
 */
export function gearLadderLength(rules: GearRulesData): number {
  let total = 0;
  for (let grade = 0; grade < rules.grades.length; grade++) {
    total += maxGearLevel(rules, grade);
  }
  return Math.max(total, 1);
}

/** The grade and level at `position` on the concatenated ladder. Clamped into the shipped ladder. */
export function gearAtLadderPosition(
  rules: GearRulesData,
  position: number,
): { readonly grade: number; readonly level: number } {
  const top = gearLadderLength(rules);
  let left = Number.isFinite(position) ? Math.min(Math.max(Math.round(position), 1), top) : 1;
  for (let grade = 0; grade < rules.grades.length; grade++) {
    const cap = maxGearLevel(rules, grade);
    if (left <= cap) {
      return { grade, level: left };
    }
    left -= cap;
  }
  const last = Math.max(rules.grades.length - 1, 0);
  return { grade: last, level: maxGearLevel(rules, last) };
}

/** Where an authored grade and level sit on the concatenated ladder. The inverse of the above. */
export function gearLadderPosition(rules: GearRulesData, grade: number, level: number): number {
  const clamped = clampGradeIndex(rules, grade);
  let position = clampGearLevel(rules, clamped, level);
  for (let below = 0; below < clamped; below++) {
    position += maxGearLevel(rules, below);
  }
  return position;
}

/**
 * What one grade and level is worth to **each** of the five archetypes, as a stage carries it.
 *
 * All five are priced rather than only the ones a given board fields, because the map is built once
 * at resolution time and read once per enemy per battle — so the saving would be four object
 * entries against a lookup that would otherwise have to know the formation.
 *
 * ⚠️ **Derived here rather than authored in `data/`, and that is the `docs/testing.md` rule
 * applied.** Content that wrote "+8.6% health" beside a Worn set would keep asserting 8.6% forever
 * while `GEAR_PROFILES` was retuned underneath it. What content authors is the grade and the level;
 * what a grade is worth is `data/gear.ts`'s business, on both sides of the board.
 *
 * ⚠️ **It lives here rather than in `ladder.ts` because it now has two callers.** It was private to
 * the campaign's `resolveStage` until the Human Tower's fourth hundred; `resolveFloor` needs the
 * identical pricing, and a second copy is how "an enemy's Worn set is worth what a player's Worn set
 * is worth" stops being a fact about the code and becomes a claim two functions have to keep
 * agreeing on.
 */
export function enemyGearBonuses(
  rules: GearRulesData,
  grade: number,
  level: number,
): Readonly<Record<string, GearBonus>> {
  const bonuses: Record<string, GearBonus> = {};
  for (const archetype of GEAR_ARCHETYPES) {
    // Unaligned: an enemy's set carries no faction, so there is nothing for the 1.3× to match.
    bonuses[archetype] = setBonus(rules, archetype, grade, level);
  }
  return bonuses;
}

/** `true` when this character's faction is the one the piece is aligned to. */
export function isAligned(item: GearItem, wearerFaction: string | undefined): boolean {
  return item.alignment !== undefined && item.alignment === wearerFaction;
}

/**
 * The multiplier a piece's authored profile is scaled by: its grade, its level, and its alignment.
 *
 * Linear in level rather than exponential, and that is the one place gear deliberately does **not**
 * copy the character curve. A character's levels compound because the whole game is tuned around a
 * power fantasy that outruns its own content; gear is a bounded third axis sitting beside that, and
 * an exponential here would put a fully enhanced set several orders of magnitude ahead of an empty
 * one — at which point gear is not an axis, it is the game.
 */
export function gearScale(
  rules: GearRulesData,
  item: GearItem,
  wearerFaction: string | undefined,
): number {
  return gradeScale(rules, item.grade, item.level, isAligned(item, wearerFaction));
}

/**
 * The same multiplier, for a grade and level that are not attached to an owned object.
 *
 * Split out of {@link gearScale} for the enemy side, which has no {@link GearItem} to hold: a
 * stage authors a grade and a level and that is the whole of what it wears. Keeping one
 * implementation is what makes "an enemy's Worn set is worth what a player's Worn set is worth" a
 * fact about the code rather than a claim two functions have to keep agreeing on.
 */
export function gradeScale(
  rules: GearRulesData,
  grade: number,
  level: number,
  aligned: boolean,
): number {
  const rung = gradeAt(rules, grade);
  if (rung === undefined) {
    return 0;
  }
  const multiplier = Number.isFinite(rung.multiplier) ? Math.max(rung.multiplier, 0) : 0;
  const perLevel = Number.isFinite(rules.perLevel) ? Math.max(rules.perLevel, 0) : 0;
  const clamped = clampGearLevel(rules, grade, level);
  const alignment = aligned
    ? Math.max(Number.isFinite(rules.alignmentBonus) ? rules.alignmentBonus : 1, 1)
    : 1;
  return multiplier * (1 + perLevel * (clamped - 1)) * alignment;
}

/** `true` when `id` names one of the archetypes this build ships. */
export function isGearArchetype(id: string): id is GearArchetype {
  return (GEAR_ARCHETYPES as readonly string[]).includes(id);
}

/** The authored profile for one slot on one archetype, or nothing when content omits it. */
export function gearProfile(rules: GearRulesData, item: GearItem): GearStatProfile {
  return rules.profiles[item.archetype]?.[item.slot] ?? {};
}

/**
 * What one piece is worth to one wearer, per stat, as a fraction of that wearer's base stat.
 *
 * The wearer's faction is an argument rather than read off anything, for the same reason
 * `toBattleCombatant` takes a level rather than reading `owned.level`: the answer depends on who is
 * wearing it, and a function that looked it up itself would need to reach for the roster from
 * inside the stat pipeline.
 */
export function itemBonus(
  rules: GearRulesData,
  item: GearItem,
  wearerFaction: string | undefined,
): GearBonus {
  const scale = gearScale(rules, item, wearerFaction);
  if (scale <= 0) {
    return NO_GEAR_BONUS;
  }
  const profile = gearProfile(rules, item);
  const bonus: Partial<Record<GearStat, number>> = {};
  for (const stat of GEAR_STATS) {
    const share = profile[stat];
    if (share !== undefined && Number.isFinite(share) && share > 0) {
      bonus[stat] = share * scale;
    }
  }
  return bonus;
}

/**
 * What a whole loadout is worth to one wearer.
 *
 * Reads through the inventory by id rather than holding items directly, because a loadout is a set
 * of references and the items themselves live in one list. A reference to an item that is not there
 * contributes nothing rather than throwing — the same posture the save layer takes, and the reason
 * a damaged loadout costs a player a stat bonus instead of a run.
 */
export function loadoutBonus(
  rules: GearRulesData,
  loadout: GearLoadout,
  items: GearLookup,
  wearerFaction: string | undefined,
): GearBonus {
  const total: Partial<Record<GearStat, number>> = {};
  let any = false;
  for (const slot of GEAR_SLOTS) {
    const id = loadout[slot];
    if (id === undefined) {
      continue;
    }
    const item = items.get(id);
    // A piece filed under the wrong slot pays what its own slot is worth, not what the slot it is
    // sitting in is worth. Equipping is what enforces the match; this is a read path and it reports
    // the item, whatever a damaged save put where.
    if (item === undefined) {
      continue;
    }
    const bonus = itemBonus(rules, item, wearerFaction);
    for (const stat of GEAR_STATS) {
      const value = bonus[stat];
      if (value !== undefined) {
        total[stat] = (total[stat] ?? 0) + value;
        any = true;
      }
    }
  }
  return any ? total : NO_GEAR_BONUS;
}

/** Every piece the run owns, keyed by id. */
export type GearLookup = ReadonlyMap<string, GearItem>;

/** Builds the id lookup a loadout is resolved through. */
export function gearLookup(items: readonly GearItem[]): GearLookup {
  return new Map(items.map((item) => [item.id, item]));
}

/** `true` when this bonus would leave the stat block exactly as it found it. */
export function isNeutralBonus(bonus: GearBonus): boolean {
  return GEAR_STATS.every((stat) => {
    const value = bonus[stat];
    return value === undefined || !(value > 0);
  });
}

/**
 * Applies a bonus to an authored stat block, returning a block of the same shape.
 *
 * Returns {@link StatBlockData} rather than resolved `CombatStats` for the reason `scaleStats`
 * does: the result stays plain and JSON-safe, and everything still enters the simulation through
 * `content.ts` rather than through a second, parallel way to build a combatant.
 *
 * Absent stays absent, and a bonus on a stat the block does not declare is dropped. A character
 * with no authored `haste`— which cannot happen, since `haste` is required — is the general case;
 * the rule matters for anything added to {@link GEAR_STATS} later, where quietly conjuring a stat
 * a character was authored without would be a silent identity change rather than a buff.
 */
export function applyGearBonus(stats: StatBlockData, bonus: GearBonus): StatBlockData {
  if (isNeutralBonus(bonus)) {
    return stats;
  }
  const grow = (raw: number | string, share: number | undefined): string =>
    serialize(num(raw).mul(1 + (share ?? 0)));

  return {
    ...stats,
    hp: grow(stats.hp, bonus.hp),
    atk: grow(stats.atk, bonus.atk),
    def: grow(stats.def, bonus.def),
    // `haste` is a plain bounded number rather than a quantity, so it is multiplied in place and
    // stays a number. `content.ts` clamps it to `[1, ATB_THRESHOLD]` on the way into the
    // simulation, which is the backstop; the bound that keeps it away from that clamp is the size
    // of the authored profiles, asserted in `gear.spec.ts`.
    haste: stats.haste * (1 + (bonus.haste ?? 0)),
  };
}

/**
 * The largest bonus this content could ever produce, per stat: every slot filled at the top grade,
 * fully enhanced, and aligned.
 *
 * Exported so the haste bound can be **derived** rather than retyped. A spec that copied "+45%
 * haste" out of this module would keep asserting 45% forever while the grades were retuned around
 * it — the `data/` testing rule, applied to the one number in this milestone that is a termination
 * argument rather than a balance knob.
 */
export function maxLoadoutBonus(rules: GearRulesData, archetype: GearArchetype): GearBonus {
  const top = Math.max(rules.grades.length - 1, 0);
  return setBonus(rules, archetype, top, maxGearLevel(rules, top), true);
}

/**
 * What a **full five-piece set** of one grade and level is worth to one archetype.
 *
 * The enemy side's whole gear pipeline, and the generalisation {@link maxLoadoutBonus} is now a
 * call to. A player assembles a loadout out of five objects that arrived separately, so
 * {@link loadoutBonus} reads them one at a time out of the bag; an enemy is authored as "kitted at
 * this grade", which is every slot filled at once and nothing to look up.
 *
 * ⚠️ **Unaligned by default, and the enemy side never passes `true`.** Alignment is the player's
 * 1.3× for matching a piece's faction to its wearer's, and an enemy's set has no faction on it to
 * match — an aligned enemy set would be a thirty percent difficulty step decided by nothing the
 * author wrote down. `maxLoadoutBonus` passes `true` because it is asking for the ceiling, which
 * is the number the haste bound in `gear.spec.ts` is derived from.
 *
 * An archetype this build does not ship contributes nothing rather than throwing, which is the
 * posture every other read path here takes.
 */
export function setBonus(
  rules: GearRulesData,
  archetype: string,
  grade: number,
  level: number,
  aligned = false,
): GearBonus {
  if (!isGearArchetype(archetype)) {
    return NO_GEAR_BONUS;
  }
  const scale = gradeScale(rules, grade, level, aligned);
  if (!(scale > 0)) {
    return NO_GEAR_BONUS;
  }

  const profiles = rules.profiles[archetype];
  const total: Partial<Record<GearStat, number>> = {};
  for (const slot of GEAR_SLOTS) {
    const profile = profiles[slot];
    for (const stat of GEAR_STATS) {
      const share = profile[stat];
      if (share !== undefined && Number.isFinite(share) && share > 0) {
        total[stat] = (total[stat] ?? 0) + share * scale;
      }
    }
  }
  return total;
}
