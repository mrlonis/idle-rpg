import { type CombatantData, type StatBlockData } from '../battle/types';

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
 * **Rarity** is how far that character has been ascended, from `rare` to `ascended-5`, and it
 * is a genuine vertical power axis bought with duplicate copies.
 *
 * The two axes deliberately share two words: a `legendary`-tier character and the `legendary`
 * rarity are unrelated, and so are `ascended`-tier and the `ascended` rarity. That collision
 * is inherited from the genre's vocabulary and kept because renaming either one would make
 * every conversation about the game translate through a glossary. The type system keeps them
 * apart — {@link CharacterTier} and {@link RarityId} are not assignable to one another — so
 * the only place the ambiguity can bite is prose, and the prose says which one it means.
 */

/**
 * The ascension ladder, in order. An index into this array **is** a rarity: comparisons,
 * clamping and cost arithmetic are all done on the index, and the string is for display and
 * for authoring.
 */
export const RARITIES = [
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
 * The five families the fourteen rungs group into, for anything that treats `rare` and
 * `rare-plus` as the same kind of thing.
 *
 * A rung's suffix — `-plus`, or a star count — is a step *within* a family rather than a new
 * one, which is why the ladder has fourteen entries and this has five. `rarity.spec.ts`
 * asserts every entry in {@link RARITIES} strips to one of these, so adding a rung without
 * deciding which family it belongs to is a failing test rather than a silent gap downstream.
 */
export const RARITY_FAMILIES = ['rare', 'elite', 'legendary', 'mythic', 'ascended'] as const;

export type RarityFamily = (typeof RARITY_FAMILIES)[number];

/**
 * How a character is pulled and how it grows, **in ascending order of growth slope**.
 *
 * - `common` starts at `rare`, is the weakest per level, and carries the early game. It can
 *   still be taken all the way to `ascended-5` — deliberately, so an early favourite is a
 *   real investment rather than something the game later tells you was a waste.
 * - `legendary` starts at `rare` too but grows faster and hits harder in its niche. Mid-game.
 * - `ascended` starts at `elite`, skipping the bottom two rungs entirely, and grows fastest.
 *   Late-game, and the thing the pity counter is pointed at.
 *
 * An array rather than a bare union for the same reason as {@link RARITIES}: the order is a
 * fact about the tiers, so anything ranking them should read it here rather than keep its own
 * copy. A fourth tier is then a compile error everywhere that ranking is exhaustive.
 */
export const CHARACTER_TIERS = ['common', 'legendary', 'ascended'] as const;

export type CharacterTier = (typeof CHARACTER_TIERS)[number];

/**
 * Which ascension ladder a character walks, decided by its faction.
 *
 * - `mortal` — Humans, Dwarves, Elves, Undead and Monsters. Several rungs are paid for with
 *   **same-faction fodder**: other characters of that faction, themselves ascended to the
 *   required rarity and then consumed. This is the expensive path, and the reason a faction
 *   needs bodies in it rather than one favourite.
 * - `celestial` — Angels and Demons. Every rung is paid for with copies of the character
 *   itself. No fodder at any point, which makes them cheaper in bodies and far more
 *   expensive in luck.
 */
export type AscensionPath = 'mortal' | 'celestial';

/** Where the copies for one rung come from. */
export type AscensionScope =
  /** Copies of the character being ascended. */
  | 'self'
  /** Copies of any character sharing its faction. The player chooses which. */
  | 'faction';

/** One clause of a rung's price: so many copies, of this kind, at this rarity. */
export interface AscensionRequirement {
  readonly scope: AscensionScope;
  /** Index into {@link RARITIES} the consumed copies must already have reached. */
  readonly rarity: number;
  readonly count: number;
}

/**
 * The price of every rung, indexed by the rarity being ascended **from**.
 *
 * Length is `RARITIES.length - 1`: there is no step off the top of the ladder.
 */
export type AscensionLadder = readonly (readonly AscensionRequirement[])[];

/** Both ladders, as authored in `data/`. */
export interface AscensionRules {
  readonly mortal: AscensionLadder;
  readonly celestial: AscensionLadder;
}

/**
 * What it costs to produce one character at a given rarity, counted in **base copies** —
 * copies as they arrive from a pull, before any ascension.
 *
 * Split in two because the two halves are not interchangeable. `self` can only be satisfied
 * by copies of that exact character, which is what makes an unlucky banner painful; `faction`
 * can be satisfied by any faction-mate, which is what makes a broad roster valuable.
 */
export interface CopyCost {
  /** Base copies of the character itself. */
  readonly self: number;
  /**
   * Base copies of same-faction characters, priced as `rare`-start fodder.
   *
   * Always zero on the `celestial` ladder, which never asks for fodder.
   */
  readonly faction: number;
}

/** A faction as authored in `data/`. Plain data: the path is a property of the faction. */
export interface FactionData {
  readonly id: string;
  readonly name: string;
  readonly ascensionPath: AscensionPath;
}

/**
 * What a character is *for*, in one word.
 *
 * Display and authoring guidance rather than a rule: **nothing in the simulation reads this.**
 * A role does not decide which rank a character may stand in, what it may target, or how much
 * damage it takes — all of that follows from the stat block and the kit. It exists so the
 * roster screen can say "healer" instead of making a player infer it from `matk` and a skill
 * list, and so an author adding a character has a shape to aim at.
 *
 * Keeping it inert is the point. The moment a role gates a placement, an unlucky roster
 * becomes a run that cannot legally form a party.
 */
export type CharacterRole =
  'tank' | 'bruiser' | 'assassin' | 'ranger' | 'sniper' | 'mage' | 'healer' | 'support';

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
}
