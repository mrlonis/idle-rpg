import {
  type SkillConditionData,
  type SkillEffectData,
  type SkillTarget,
  type StatusData,
} from '../battle/types';
import { type GearStat } from '../gear/types';

/**
 * Signature items: the deep per-character investment track, and the only thing emblems buy.
 *
 * Same two-layer split as combat, the roster and gear. `...Data` types are the plain, JSON-safe
 * shapes authored in `data/`; what lives in the save is a single integer. Nothing here imports
 * from `data/` — the rules, the items and the ability tiers all arrive as arguments.
 *
 * ## What a signature item is, and what it is not
 *
 * It is **not a `GearItem`**, and the distinction is the whole reason this module is small. A
 * piece of gear is an object: it is minted, it has an id, it sits in a bag, it moves between
 * characters, and two of them are two different things a player picks between. A signature item is
 * none of that. There is exactly one per character, it can never move, it can never be duplicated,
 * and it can never be salvaged — so everything `GearItem` carries in order to be an *object* would
 * be dead weight here.
 *
 * What is left once all of that is stripped away is one number: how far this character's item has
 * been levelled. That is {@link OwnedCharacter.signature}, and it is the entire save footprint of
 * this milestone on the roster side. Zero means locked.
 *
 * Presenting it as a slot on the character sheet is a screen's decision and is fully compatible
 * with this — the panel draws a slot, and what backs the slot is an integer.
 *
 * ## Two things a level buys, and they grow differently
 *
 * - **Stats**, which grow **every level**, smoothly, as percentages of the wearer's own block.
 * - **An ability**, which grows in **four steps** — at levels 1, 10, 20 and 30.
 *
 * The stats are the reason a level between the tier marks is worth buying at all; the ability is
 * the reason the tier marks are worth reaching. A track with only one of the two is either a
 * treadmill with three interesting moments or thirty identical ones.
 *
 * ## Why the stats reuse the gear vocabulary
 *
 * {@link GearStat} and `GearBonus` are already "hp, atk, def and haste, as fractions of the
 * wearer's own value", which is exactly what a signature item's stats are. Minting a parallel
 * `SignatureStat` union would be a fourth near-synonym in a project that already carries three
 * meanings of "rarity" — and, worse, it would be a second list that has to be kept in step with
 * the first every time the stat block changes.
 *
 * The bonuses are **summed into the same total as gear** rather than multiplied on top of it, for
 * the reason gear pieces sum with each other: a summed bonus is worth what it says it is worth
 * whatever else is equipped, which is the only version a screen can explain in one line. It
 * remains a multiplication against the scaled stat block either way, so the whole-board rescale
 * identity `simulate.spec.ts` asserts is untouched.
 *
 * ## Ascended tier only
 *
 * Common- and legendary-tier characters have no signature item and are not meant to get one. That
 * is a content decision rather than a mechanical limit, but it is enforced here rather than left
 * to `data/` authoring: {@link signatureUnlocked} checks the tier as well as the rung, so a
 * signature item authored against a legendary-tier character is inert rather than a quiet
 * exception to the rule.
 */

/**
 * A partial override of an authored skill, merged over it before the fight starts.
 *
 * ## One mechanism rather than five
 *
 * The obvious shape for "the signature ability changes what a skill does" is a union of edit
 * kinds — retarget, reduce-cooldown, drop-condition, add-effect, amplify. A partial override
 * expresses all five as *the field being present*, which means the vocabulary cannot fall behind
 * what a `SkillData` can say: a field added to `SkillData` is overridable the day it exists.
 *
 * ⚠️ **Merged at kit-build time, never per tick.** `toBattleCombatant` resolves this once while
 * assembling the combatant, so the simulation loop never learns that signature items exist. That
 * is what makes an ability free at runtime, and it is the reason to prefer this over a modifier
 * consulted inside `chooseSkill`.
 *
 * A field left absent keeps whatever the authored skill said. That is deliberately different from
 * setting it to a falsy value: `cooldown: 0` is a skill available every turn, and omitting
 * `cooldown` is a skill whose cooldown the item does not touch.
 */
export interface SkillOverrideData {
  /**
   * Which skill in the character's kit this rewrites.
   *
   * An id rather than an index, because a kit's order is the order its skills *unlock* and
   * inserting one is an ordinary content edit. An index would silently retarget the override onto
   * a different skill, which is the failure that produces a plausible wrong answer rather than a
   * visible one. An id naming no skill in the kit is inert, and `data/signature.spec.ts` is what
   * stops one shipping.
   */
  readonly skillId: string;
  /** Who the skill hits. Widening a single target to a row is the commonest signature effect. */
  readonly target?: SkillTarget;
  /**
   * Ticks before the skill can be used again.
   *
   * ⚠️ **Never take this to zero on a non-ultimate.** A cooldown-free ordinary skill is a strictly
   * better basic attack available every single turn, which does not make a character strong so
   * much as make its whole kit collapse into one row of the event log. `signature.spec.ts` holds a
   * floor.
   */
  readonly cooldown?: number;
  /** When the skill is worth using. Overriding with `always` is how a condition gets dropped. */
  readonly condition?: SkillConditionData;
  /**
   * The whole effect list, replacing the authored one.
   *
   * Replace rather than append, which is the one place this shape is deliberately blunt. An
   * append-only field cannot express "the same hit, harder" without the original clause being
   * applied twice, and a merge that matched clauses up by position would be an index doing the
   * job an id does everywhere else in this file. Restating the base clauses beside the new one is
   * more to author and impossible to misread.
   */
  readonly effects?: readonly SkillEffectData[];
}

/**
 * One rung of a signature ability: what it does at this tier, and what to call it.
 *
 * ## Four authored variants rather than one scaled by a factor
 *
 * A tier could have been "the base ability times a multiplier", which is less to write. It cannot
 * express the half of this that matters: an ability that *gains a clause* at +20 — a stun added, a
 * second target, a condition dropped — is the thing that makes a tier mark feel like an unlock
 * rather than a number going up. Authoring each rung outright costs four short records per
 * character and buys an ability that can change in kind rather than only in size.
 *
 * It also keeps every scaling decision in `data/`, where balance numbers live, instead of putting
 * a growth formula in `core/` that every ability then has to be designed around.
 */
export interface SignatureAbilityTierData {
  /** What the screen calls this rung of the ability. */
  readonly name: string;
  /** One line describing what it does now, for the character sheet. */
  readonly description: string;
  /**
   * The skills this rung rewrites, if it rewrites any.
   *
   * ⚠️ **A list rather than one override, because a tier *replaces* the rung below it rather than
   * stacking on top of it.** Only the reached tier is ever applied — so with a single override,
   * "tier 4 keeps what tier 1 did and adds something" is inexpressible, and every ability would
   * have to be a single skill getting numerically bigger four times. Restating the earlier
   * clauses in each later tier is more to author and is what makes a tier readable on its own:
   * the record says exactly what the ability does at that rung, with nothing inherited.
   *
   * An entry naming a skill the kit does not have is inert rather than an error, so a stale
   * `skillId` stays a content bug for `data/signature.spec.ts` to catch.
   */
  readonly skills?: readonly SkillOverrideData[];
  /**
   * Statuses applied to the wearer at the start of every fight, if this rung grants any.
   *
   * ⚠️ **The wearer only.** These reach the fight as `CombatantData.opening`, which is a property
   * of one combatant — there is no way to spell "and my whole party starts with this". That is a
   * real limit on what a passive can say and it is deliberate: applying a status to somebody else
   * at setup means picking targets before the first tick, which is the job of a skill, and a skill
   * is what the override half of this vocabulary is for.
   *
   * The **passive** half of the vocabulary, and it reuses {@link StatusData} whole rather than
   * inventing a passive language. Everything a passive would want to say — a lasting stat
   * multiplier, a regeneration, a shield, a damage-over-time aura — is already expressible as a
   * status, and statuses already have a duration, a hostile flag, a cleanse interaction and a
   * display name that every screen in the game knows how to draw.
   *
   * ⚠️ **A duration long enough to outlast a fight is how a permanent passive is written.** There
   * is no "forever" value and there should not be one: `MAX_BATTLE_TICKS` bounds every fight, so a
   * duration above it is permanent in every sense the simulation can observe, and keeping the
   * field a plain number means nothing downstream has to special-case infinity.
   */
  readonly opening?: readonly StatusData[];
}

/**
 * A signature item as authored in `data/`.
 *
 * One per ascended-tier character, keyed to that character by {@link defId}. The pairing is
 * authored here rather than as a field on `CharacterData` so that a build shipping no signature
 * items is a build with an empty table, not a roster with a dangling optional on every entry.
 */
export interface SignatureItemData {
  readonly id: string;
  /** The character this belongs to. One item per character, and one character per item. */
  readonly defId: string;
  readonly name: string;
  /** The flavour line, shown once at the top of the panel. */
  readonly description: string;
  /**
   * What one level adds, per stat, as a fraction of the wearer's own scaled stat.
   *
   * Multiplied by the level, so a profile of `{ atk: 0.05 }` is +5% attack at level 1 and +150% at
   * level 30. Authored per character rather than shared, because the whole design brief is that a
   * signature item sharpens the niche its character already has — a wall gets more of what makes
   * it a wall, and a closer gets more of what makes it a closer.
   */
  readonly perLevel: Readonly<Partial<Record<GearStat, number>>>;
  /**
   * The ability, one entry per tier mark, weakest first.
   *
   * Length is `maxLevel / tierEvery + 1` — four at the shipped numbers, for levels 1, 10, 20 and
   * 30. ⚠️ **Index 0 is the ability at level 1, not the absence of one.** A signature item is
   * never unlocked without its ability; there is no level 0 and no rung at which the slot is
   * filled but inert.
   */
  readonly tiers: readonly SignatureAbilityTierData[];
}

/** Everything that decides what a signature item costs and how far it goes. */
export interface SignatureRulesData {
  /**
   * The rarity id at which the slot unlocks.
   *
   * An id rather than a ladder index, for the reason `KitRulesData.unlocks` is ids: this is one
   * named rung rather than a table indexed by rarity, and an id that is not a rarity is then a
   * failing spec instead of a silent index 0.
   */
  readonly unlockRarity: string;
  /** The highest level a signature item may reach. */
  readonly maxLevel: number;
  /** Levels between ability tiers. The first tier is at level 1, not at this. */
  readonly tierEvery: number;
  /**
   * What a level costs in emblems: `base + perLevel × (L − 1)`, for the level being **bought**.
   *
   * A smooth ramp rather than a step per tier. The stepped version was on the table and reads
   * worse in the one place it matters: a player saving toward the next level sees the price move
   * every time, rather than sitting flat for nine levels and then jumping by a factor they did not
   * see coming.
   *
   * Linear rather than the `coefficient × L ** exponent` shape gear and character levels use, and
   * that is deliberate. Those two price against curves that compound — a character level is worth
   * exponentially more than the last — so their costs have to compound to keep pace. A signature
   * level is worth a *flat* slice of one stat profile and one thirtieth of the way to a tier mark,
   * so a linear price is the one that keeps the last level as worth buying as the first.
   */
  readonly cost: {
    /** Emblems for level 1, which is also the unlock. */
    readonly base: number;
    /** Added to the price for each level above the first. */
    readonly perLevel: number;
  };
}

/** A signature item's contribution, per stat, as a fraction of the wearer's own value. */
export type SignatureBonus = Readonly<Partial<Record<GearStat, number>>>;

/** Nothing equipped, or nothing earned. Shared so the empty case is one object rather than many. */
export const NO_SIGNATURE_BONUS: SignatureBonus = {};

/** Why a signature purchase was refused. */
export type SignatureFailure =
  /** No character with that id in the roster. */
  | 'unknown-character'
  /** This build ships no signature item for that character. */
  | 'no-item'
  /** Not ascended tier, or not yet at the unlock rung. */
  | 'locked'
  /** Already at {@link SignatureRulesData.maxLevel}. */
  | 'maxed'
  /** Not enough emblems. */
  | 'insufficient';
