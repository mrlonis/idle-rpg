import { type ModifiableStat } from '../battle/types';
import { type Numeric } from '../numeric';

/**
 * The gear vocabulary: what a piece of equipment is, and what wearing one is worth.
 *
 * Same two-layer split as combat and the roster. `...Data` types are the plain, JSON-safe shapes
 * authored in `data/`; {@link GearItem} is the runtime shape that lives in the save. Nothing here
 * imports from `data/` — grades, profiles and prices all arrive as arguments, which is what lets
 * the balance sweep drive gear from fixtures.
 *
 * ## Every bonus is a percentage of the wearer's own stat
 *
 * This is the decision the rest of the module hangs off, and it is forced by milestone 10. A
 * levelled, ascended character's quantities span a factor of ×10⁹; a flat `+400 atk` that meant
 * something at level 40 is invisible at level 400 and a rounding error at level 1000. Gear
 * expressed in flat quantities therefore needs its own exponential to keep pace, and then it needs
 * re-tuning every time the ladder extends — which is precisely the failure milestone 10 deleted
 * from the *enemy* side of the board by giving enemies levels instead of bigger authored blocks.
 *
 * A percentage has none of that. A relic chest piece is worth the same +38% health at level 1 and
 * at level 1000, so gear stays a third axis for the whole run and never needs a second curve.
 *
 * ⚠️ **It also preserves the identity in `simulate.spec.ts`.** Scaling both sides of the board by a
 * common factor leaves the whole simulation unchanged — damage is `atk² / (atk + def)` and every
 * status prices off the applier's `atk` — and that identity is what let milestone 10 rescale
 * everything by ×10⁹ without touching the ninety-second timer or the faction matrix. A percentage
 * bonus is a multiplication, so it commutes with that rescale and the identity survives. A flat
 * bonus is an addition, and an addition is exactly what the identity forbids.
 *
 * ## Haste is the one stat with a ceiling, and boots are the reason it is here
 *
 * `roster/stats.ts` explains at length why nothing in a stat block except the four quantities may
 * scale with level: `haste` is ATB gauge per tick against a threshold of 1000, and a `haste` that
 * grew would hit `content.ts`'s clamp within about eighty levels and turn the one stat that buys
 * turns into a constant every combatant shares.
 *
 * Boots move `haste`, so that argument applies to them and the answer is a **bounded** percentage
 * rather than an exemption. Authored haste runs 58–152, so a full set at the largest bonus this
 * module can produce lands the fastest character in the game near 220 against a threshold of 1000
 * — comfortably inside the clamp, with the ordering between characters preserved because a
 * percentage cannot reorder anything. `gear.spec.ts` asserts the bound directly rather than
 * trusting the arithmetic to stay true as grades are retuned.
 */

/** The five places a piece of gear goes, in the order they are displayed. */
export const GEAR_SLOTS = ['head', 'arms', 'chest', 'legs', 'boots'] as const;

export type GearSlot = (typeof GEAR_SLOTS)[number];

/**
 * Which kind of character a piece was forged for — and, read from the other end, what a character
 * is *for*. `roster/types.ts` re-exports this pair as `CharacterRole`.
 *
 * **One vocabulary rather than two that have to agree.** The alternative was a five-value gear enum
 * beside the roster's own roles plus a mapping between them, and this project already carries three
 * distinct meanings of "rarity" — see [glossary](../../../docs/glossary.md). A second near-synonym
 * for "what a character is for" would have been a fourth collision, and a mapping table is a thing
 * that can fall out of date with the two lists it joins.
 *
 * It lives **here** rather than in `roster/`, which is where the roster's own vocabulary otherwise
 * sits, for the reason `CHARACTER_TIERS` lives in `core/growth.ts`: `OwnedCharacter` carries a
 * {@link GearLoadout}, so `roster/` already depends on `gear/`, and defining the shared list in
 * `roster/` would close the loop. Putting shared vocabulary in the lower module is what keeps the
 * module graph a tree.
 *
 * The roster used to have eight roles; the argument for collapsing them to five, and what it cost,
 * is in `CharacterRole`.
 */
export const GEAR_ARCHETYPES = ['tank', 'brawler', 'mage', 'ranger', 'support'] as const;

export type GearArchetype = (typeof GEAR_ARCHETYPES)[number];

/**
 * The faction a piece is aligned to, or `undefined` for an unaligned piece.
 *
 * A faction id rather than a typed union, for the reason every other faction reference in `core/`
 * is a string: `core/` cannot import `data/`, so it cannot know which factions this build ships.
 * The repair pass checks ids against the content it is handed.
 *
 * ⚠️ **Alignment is a bonus, never a restriction.** Any character may wear any aligned piece; a
 * match simply pays more. The restriction version was on the table and loses to the argument
 * milestone 4 made when it added a mortal healer: a drop that is unusable rather than merely
 * suboptimal is a category of answer the player cannot buy, and combined with the archetype gate
 * a piece would have had to match on two axes before it was worth anything at all.
 */
export type GearAlignment = string | undefined;

/**
 * One piece of gear the player owns.
 *
 * Unlike {@link OwnedCharacter}, which is one entry per character however many copies were pulled,
 * this is genuinely one entry per **object**: two relic chest pieces at different levels are two
 * different things and the player picks between them. That is what makes {@link id} necessary and
 * what would make the inventory the one unbounded collection in the save — see
 * {@link GearRulesData.inventoryLimit} and `addGear` for what bounds it instead.
 */
export interface GearItem {
  /**
   * Unique among every piece this run has ever minted.
   *
   * Minted from a counter in {@link GameState} rather than from the RNG, because an id has to be
   * unique and an RNG draw is only unique by luck. The counter never decreases, so a salvaged
   * item's id is never reissued and an equipment reference can never silently rebind to a
   * different object.
   */
  readonly id: string;
  readonly slot: GearSlot;
  readonly archetype: GearArchetype;
  /** Index into the authored grade ladder. Higher is better. */
  readonly grade: number;
  /** The faction this piece pays extra on, or `undefined` if it pays the same on everybody. */
  readonly alignment: GearAlignment;
  /**
   * Enhancement level, at least 1 and never above its grade's cap.
   *
   * The only mutable thing about a piece, and deliberately the only one. There is no partial
   * progress bar: a level is bought outright with alloy and gold, and alloy left over stays in the
   * wallet where it can go into a different piece. An `xp` field per item was the first shape and
   * it bought nothing — the wallet already is the place spare material lives, and a second one
   * per object is a second thing for the repair pass to clamp.
   */
  readonly level: number;
}

/** What a character is wearing: one item id per filled slot. */
export type GearLoadout = Readonly<Partial<Record<GearSlot, string>>>;

/** Nothing equipped. What every character starts with and what a repaired loadout falls back to. */
export function emptyLoadout(): GearLoadout {
  return {};
}

/** The item ids in a loadout, in slot order. */
export function loadoutItems(loadout: GearLoadout): readonly string[] {
  const items: string[] = [];
  for (const slot of GEAR_SLOTS) {
    const id = loadout[slot];
    if (id !== undefined) {
      items.push(id);
    }
  }
  return items;
}

/**
 * The stats a piece may move, as fractions of the wearer's own value.
 *
 * A narrow record rather than the whole stat block, and the narrowness is the design. `hp`, `atk`
 * and `def` are the three quantities a percentage is meaningful on; `haste` is included because
 * boots are the piece that buys turns and is bounded for it. `recovery` is deliberately absent
 * even though it scales — it is already a percentage of health in effect, and a second multiplier
 * on it would make a regeneration wall the cheapest thing in the game to build, which is the
 * shape 8c's tick cap exists to bound.
 */
export type GearStat = Extract<ModifiableStat, 'atk' | 'def' | 'haste'> | 'hp';

/** Every stat gear can move, in the order a sheet lists them. */
export const GEAR_STATS = ['hp', 'atk', 'def', 'haste'] as const satisfies readonly GearStat[];

/** Fractions of the wearer's base stat, before grade and level scale them. */
export type GearStatProfile = Readonly<Partial<Record<GearStat, number>>>;

/** The total percentage bonus a loadout contributes, per stat. Absent means the stat is untouched. */
export type GearBonus = Readonly<Partial<Record<GearStat, number>>>;

/** No gear, or gear worth nothing. Shared so the empty case is one object rather than many. */
export const NO_GEAR_BONUS: GearBonus = {};

/** One rung of the grade ladder, as authored in `data/`. */
export interface GearGradeData {
  readonly id: string;
  readonly name: string;
  /** Multiplier on every stat in the piece's profile. */
  readonly multiplier: number;
  /** The highest enhancement level a piece of this grade may reach. */
  readonly maxLevel: number;
  /** Alloy this piece is worth before anything has been invested in it. */
  readonly salvage: number;
  /** Relative chance of this grade dropping, before the ladder's position skews it. */
  readonly weight: number;
  /** How many seconds of the run's gold income one of these costs in the shop. */
  readonly priceSeconds: number;
}

/**
 * Everything that decides what gear is worth and what it costs, as authored in `data/`.
 *
 * One bundle rather than six arguments, for the reason `GachaRulesData` is one: every entry point
 * in this module needs most of it, and a signature that grows a parameter per coefficient is a
 * signature nobody can call without reading it.
 */
export interface GearRulesData {
  /** The grade ladder, weakest first. An index into this **is** a grade. */
  readonly grades: readonly GearGradeData[];
  /** What each slot contributes, per archetype, as fractions of the wearer's base stat. */
  readonly profiles: Readonly<Record<GearArchetype, Readonly<Record<GearSlot, GearStatProfile>>>>;
  /** Growth in a piece's contribution per enhancement level above the first. */
  readonly perLevel: number;
  /** Multiplier on a piece worn by a character of its own faction. */
  readonly alignmentBonus: number;
  /** Chance a dropped or stocked piece is unaligned, 0–1. */
  readonly unalignedChance: number;
  /** What enhancing costs. */
  readonly enhance: GearEnhanceData;
  /** What a stage clear drops. */
  readonly drops: GearDropData;
  /** How the hourly shop is stocked and priced. */
  readonly shop: GearShopData;
  /** The most unequipped pieces the bag holds before the worst is auto-salvaged. */
  readonly inventoryLimit: number;
}

/**
 * What one enhancement level costs.
 *
 * Same shape as the character level curve in `data/levels.ts` — a coefficient and an exponent per
 * currency, evaluated rather than tabulated — because it is the same kind of thing and a second
 * spelling of it would be a second thing to reason about.
 */
export interface GearEnhanceData {
  /** Alloy to go from level `L` to `L + 1`: `coefficient * L ** exponent`. */
  readonly alloy: { readonly coefficient: number; readonly exponent: number };
  /** Gold for that same step. The claim on gold this whole milestone exists to create. */
  readonly gold: { readonly coefficient: number; readonly exponent: number };
}

/** What clearing a stage drops. */
export interface GearDropData {
  /** Pieces an ordinary stage drops on a win. */
  readonly normal: number;
  /** Pieces a mini-boss drops. */
  readonly miniBoss: number;
  /** Pieces a chapter boss drops. */
  readonly boss: number;
  /**
   * How sharply grade odds improve with the linear stage index.
   *
   * A grade's weight is multiplied by `(index / gradeSoftness) ** gradeIndex`, so the ladder skews
   * the ladder rather than replacing it: a relic is reachable at stage 1 and merely rare, and by
   * chapter 2 a worn piece is the unusual one. A hard gate was the alternative and it is the worse
   * shape — it turns the first stage of a band into a cliff and makes everything below it garbage
   * the moment it is crossed.
   */
  readonly gradeSoftness: number;
}

/** How the shop is stocked, and how long its stock lasts. */
export interface GearShopData {
  /** How many pieces are offered per refresh. */
  readonly offers: number;
  /**
   * How long a stocking lasts, in milliseconds.
   *
   * A duration rather than "an hour" spelled out, because `core/` has no clock: the caller divides
   * a timestamp by this to get the refresh index and hands that in. See {@link gearShopSlot}.
   */
  readonly refreshMs: number;
  /**
   * The gold income a price is floored at, per second.
   *
   * Shop prices are denominated in **seconds of the run's own gold income**, the same trick
   * `rewardSeconds` uses on the stage lump, so the shop is meaningfully priced at every point on
   * the ladder without anybody authoring a price band per chapter. A brand-new run earns nothing,
   * and a price of zero would hand it the whole shop for free — so the rate the price is computed
   * against is floored here rather than the price being floored at some arbitrary number of gold.
   */
  readonly minGoldPerSecond: number;
}

/**
 * Which stocking of the shop a run is looking at, and what it has already taken from it.
 *
 * The slot is an index rather than a timestamp, and that is what makes the shop deterministic: the
 * stock is generated from `deriveSeed(seed, \`gear-shop:${slot}\`)`, so it is the same six items
 * however many times the app is relaunched inside the hour. Force-quitting to reroll the shop is
 * the reflex this shape removes — there is nothing to reroll, which is a better answer than
 * detecting it.
 */
export interface GearShopState {
  /** The refresh index the {@link purchased} list belongs to. */
  readonly slot: number;
  /** Offer indices already bought from this stocking, ascending. */
  readonly purchased: readonly number[];
}

/** A shop with nothing bought from it. */
export function emptyGearShop(): GearShopState {
  return { slot: 0, purchased: [] };
}

/** One thing the shop is offering: a piece, and what it costs. */
export interface GearOffer {
  /** Position in the stocking. Stable for the life of the refresh, and what a purchase names. */
  readonly index: number;
  /** The piece as it would arrive: always at level 1, so the shop sells potential, not progress. */
  readonly item: GearItem;
  /**
   * Gold price, derived from the run's income rather than authored.
   *
   * A `Numeric` rather than a `number` because it is a wallet quantity: it is compared against
   * `wallet.gold` and subtracted from it, and everything on that side of the line is `Numeric` so
   * that the one place a comparison could silently lose precision does not exist.
   */
  readonly price: Numeric;
  /** `true` once this offer has been taken and until the shop refreshes. */
  readonly purchased: boolean;
}
