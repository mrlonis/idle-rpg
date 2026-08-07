import { type CombatantData, type StatBlockData } from '../battle/types';
import { GEAR_ARCHETYPES, type GearArchetype, type GearLoadout } from '../gear/types';
import { CHARACTER_TIERS, type CharacterTier } from '../growth';

/**
 * The roster vocabulary: what a character is, how far it has been ascended, and how far it
 * has been levelled.
 *
 * Same two-layer split as combat. `...Data` types are the plain, JSON-safe shapes authored in
 * `data/`; the runtime types are what the simulation works in. Nothing here imports from
 * `data/` — ascension tables, level curves and stat blocks all arrive as arguments, which is
 * what lets a balance sweep drive the whole system from fixtures.
 *
 * ## Two axes, and why they are not the same thing
 *
 * **Tier** is which character you pulled and never changes: `common`, `legendary`,
 * `ascended`. It decides where a character starts on the ladder, how sharp its niche is, and
 * how fast it grows per level. Within a tier, characters are sidegrades — the best answer to
 * different encounters, not rungs above one another.
 *
 * **Rarity** is how far that character has been ascended, from `common` to `ascended-5`, and it
 * is a genuine vertical power axis bought with duplicate copies.
 *
 * The two axes deliberately share all three tier words: a `legendary`-tier character and the
 * `legendary` rarity are unrelated, and so are `common`/`common` and `ascended`/`ascended`. That
 * collision is inherited from the genre's vocabulary and kept because renaming either one would
 * make every conversation about the game translate through a glossary. The type system keeps
 * them apart — {@link CharacterTier} and {@link RarityId} are not assignable to one another — so
 * the only place the ambiguity can bite is prose, and the prose says which one it means.
 *
 * `common` became the third collision when the ladder grew a bottom; before that it was the one
 * tier word that was only ever a tier. The rule that survived it: **never write either word
 * bare.** "A common-tier character", or "a character at common rarity" — never "a common".
 */

/**
 * The ascension ladder, in order. An index into this array **is** a rarity: comparisons,
 * clamping and cost arithmetic are all done on the index, and the string is for display and
 * for authoring.
 *
 * ⚠️ **This array's indices are written into every save**, as `OwnedCharacter.rarity`. Inserting
 * a rung anywhere but the top renumbers every rung above it, which turns every stored rarity
 * into a claim about a different rung — silently, and in the player's favour or against it
 * depending on the direction. An insert is therefore a **save migration**, not a `data/` edit, and
 * the migration it needs is the dangerous kind: no field changes shape, so an unmigrated save
 * parses cleanly, validates cleanly and demotes the whole roster. The two rungs below `rare` went
 * in exactly this way and had a migration written for them; that migration has since been folded
 * into the v0 baseline along with every other — see [saves](../../../docs/saves.md) — which removes
 * the code, not the rule.
 */
export const RARITIES = [
  'common',
  'common-plus',
  'rare',
  'rare-plus',
  'elite',
  'elite-plus',
  'legendary',
  'legendary-plus',
  'mythic',
  'mythic-plus',
  'ascended',
  'ascended-1',
  'ascended-2',
  'ascended-3',
  'ascended-4',
  'ascended-5',
] as const;

export type RarityId = (typeof RARITIES)[number];

/** The last rung. A character here can ascend no further, and further copies become spark. */
export const MAX_RARITY_INDEX = RARITIES.length - 1;

/**
 * The six families the sixteen rungs group into, for anything that treats `rare` and
 * `rare-plus` as the same kind of thing.
 *
 * A rung's suffix — `-plus`, or a star count — is a step *within* a family rather than a new
 * one, which is why the ladder has sixteen entries and this has six. `rarity.spec.ts`
 * asserts every entry in {@link RARITIES} strips to one of these, so adding a rung without
 * deciding which family it belongs to is a failing test rather than a silent gap downstream.
 *
 * **`common` is a family here and a {@link CharacterTier} elsewhere**, which makes it the third
 * word this project spends on both axes. See [glossary](../../../docs/glossary.md); the prose
 * rule is that neither word is ever written bare.
 */
export const RARITY_FAMILIES = [
  'common',
  'rare',
  'elite',
  'legendary',
  'mythic',
  'ascended',
] as const;

export type RarityFamily = (typeof RARITY_FAMILIES)[number];

/**
 * The three growth slopes, re-exported from [`core/growth.ts`](../growth.ts).
 *
 * They live there rather than here because milestone 10 pointed the same machinery at the other
 * side of the board: an enemy declares a tier too, and `battle/types.ts` cannot read a type out
 * of `roster/` without turning the module graph into a cycle. The prose about what a tier *is*
 * moved with it; this re-export is what keeps `import { CHARACTER_TIERS } from './types'` — the
 * roster's own vocabulary — reading the way it always has.
 */
export { CHARACTER_TIERS, type CharacterTier };

/**
 * Which ascension ladder a character walks, decided by its faction.
 *
 * Both ladders are paid in copies of the character itself and nothing else. What separates them
 * is how many:
 *
 * - `mortal` — Humans, Dwarves, Elves, Undead and Monsters. The cheaper climb.
 * - `celestial` — Angels and Demons. Roughly twice the copies above `elite`, which is what the
 *   celestial advantage in combat is paid for with.
 *
 * ## What this used to be, and why the difference is worth knowing
 *
 * The mortal ladder used to spend **same-faction fodder**: four of its rungs were paid with other
 * characters of the faction, themselves ascended to a required rarity and then consumed. That was
 * the single largest source of complexity in `core/roster/` — a rung's price was quoted in
 * *ascended* copies and had to be resolved recursively into the base copies a player actually
 * holds, which is why {@link AscensionLadder} was a nested structure and the cost type was a
 * two-part sum.
 *
 * It bought one real thing: a spare copy of a character you would never play was still worth
 * something, because it was fodder. The cost of removing it is that such a copy is now inert
 * until that character is worth ascending on its own. The cost of keeping it was a system where
 * `common`-tier characters — the ones with no fodder tier beneath them — were priced through a
 * recursion nobody could evaluate by eye.
 */
export type AscensionPath = 'mortal' | 'celestial';

/**
 * The price of every rung in **base copies of the character itself**, indexed by the rarity
 * being ascended **from**.
 *
 * Length is `RARITIES.length - 1`: there is no step off the top of the ladder.
 *
 * A flat count, deliberately. The number authored here is the number of copies the player
 * spends — there is no resolution step between the table and the cost, so retuning a rung is
 * arithmetic anyone can do in their head against {@link RARITIES}.
 */
export type AscensionLadder = readonly number[];

/** Both ladders, as authored in `data/`. */
export interface AscensionRules {
  readonly mortal: AscensionLadder;
  readonly celestial: AscensionLadder;
}

/** A faction as authored in `data/`. Plain data: the path is a property of the faction. */
export interface FactionData {
  readonly id: string;
  readonly name: string;
  readonly ascensionPath: AscensionPath;
}

/**
 * What a character is *for*, in one word — and, since milestone 12, which gear it may wear.
 *
 * **This stopped being inert, and the change was made deliberately rather than discovered.**
 * Until gear it was display guidance only: nothing in the simulation read it, and the comment
 * here said keeping it that way was the point, because a role that gates a **placement** lets an
 * unlucky roster reach a state with no legal party — the failure milestone 4 rejected role-locked
 * ranks over. Every word of that argument still holds and {@link CharacterRole} still does not
 * decide which rank a character stands in, what it may target, or how much damage it takes.
 *
 * What it now decides is which {@link GearArchetype} a piece of gear has to name before that
 * character can equip it, and the reason that is a different question is the reason it is safe: a
 * piece of gear the party cannot wear is **fodder**, not a dead end. It enhances something else,
 * at full value, on the turn it drops. There is no roster this gate can make unplayable, because
 * a character with no gear at all is a character, and a character with the wrong gear in the bag
 * is a character plus enhancement material.
 *
 * ## Why there are five of these and there used to be eight
 *
 * The eight were `tank`, `bruiser`, `assassin`, `ranger`, `sniper`, `mage`, `healer`, `support`,
 * and the extra three were distinctions with nothing downstream of them: an assassin is a bruiser
 * that opens on the back rank, a sniper is a ranger with a longer reach, and a healer is the
 * support that happens to restore health. All three of those are statements about a **kit**, and
 * the kit is right there in the same file saying them more precisely than a label could.
 *
 * Collapsing to five is what makes a gear archetype and a role the same word rather than two
 * vocabularies to keep in sync — and this project already carries three meanings of "rarity"
 * (see [glossary](../../../docs/glossary.md)), which is the argument for not minting a fourth
 * near-synonym when an existing field says the same thing.
 *
 * The cost is real and worth naming: the roster screen no longer says "healer" about the seven
 * characters that heal. What it says instead is "support", and what tells a player that Cirien
 * heals is Cirien's skill list, which is where they were going to look anyway.
 *
 * Re-exported from [`gear/types.ts`](../gear/types.ts) rather than declared here, and the direction
 * is forced: {@link OwnedCharacter} carries a {@link GearLoadout}, so `roster/` depends on `gear/`
 * and the shared list has to sit in the module underneath. Same arrangement, and the same reason,
 * as {@link CHARACTER_TIERS} living in `core/growth.ts`. This alias is what keeps
 * `import { type CharacterRole } from './types'` — the roster's own vocabulary — reading the way it
 * always has.
 */
export const CHARACTER_ROLES = GEAR_ARCHETYPES;

export type CharacterRole = GearArchetype;

/**
 * A playable character as authored in `data/`.
 *
 * Structurally a {@link CombatantData} — faction, stat block and kit included — so a party can
 * be handed straight to `simulateBattle` once its stats have been resolved for level and
 * rarity. The extra fields are what the roster needs and combat does not care about.
 */
export interface CharacterData extends CombatantData {
  readonly tier: CharacterTier;
  readonly role: CharacterRole;
  /** Stats at level 1, at the character's starting rarity. */
  readonly stats: StatBlockData;
}

/**
 * One character the player owns.
 *
 * There is exactly one of these per character id, not one per copy. The player levels and
 * ascends a single **main** copy; every other copy of that character is material, counted in
 * {@link copies} rather than tracked individually. Tracking each copy as its own entity would
 * mean a roster of hundreds of near-identical records in the save, and the only question ever
 * asked of a spare copy is "how many do I have".
 */
export interface OwnedCharacter {
  /** The `data/` character id. */
  readonly defId: string;
  /** Index into {@link RARITIES}. Never below the character's starting rarity. */
  readonly rarity: number;
  /** Level of the main copy, at least 1 and never above its rarity's cap. */
  readonly level: number;
  /**
   * Spare **base** copies held as ascension material.
   *
   * Base, not ascended: a spare is only ever consumed as part of a cost that has already been
   * resolved into base copies, so storing what rarity it *could* be ascended to would be
   * storing a decision nobody has made.
   */
  readonly copies: number;
  /**
   * What this character is wearing, as ids into `GameState.gear`.
   *
   * Ids rather than the items themselves, so a piece exists once and is referenced from wherever
   * it is worn — see {@link GameState.gear}. Every character has one of these including the ones
   * on the bench, because gear is equipped from the character sheet rather than from the party
   * screen and a bench character being kitted out ahead of being fielded is the normal case.
   */
  readonly gear: GearLoadout;
}
