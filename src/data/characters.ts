/**
 * Playable character stat blocks.
 *
 * Same plain-data rules as `enemies.ts`: numbers and strings only, no imports outside `data/`.
 *
 * ## Stats here are level 1, at the character's starting rarity
 *
 * Everything below is a **base** block. `core/roster/stats.ts` scales `hp`, `atk` and `def` for
 * level and rarity; `spd`, `critChance` and `critMultiplier` are never scaled, because SPD is
 * ATB gauge per tick against a fixed threshold and crit chance is a probability. So the numbers
 * here are what a character is *like*, and level is how much of it there is.
 *
 * ## Tier is a slope, not a head start
 *
 * Base budgets are deliberately close across the three tiers. What a higher tier buys is a
 * **sharper version of its faction's identity** and a steeper growth rate — worth 1.2× at level
 * 50 and 19.5× at level 1000 (see `levels.ts`). A common-tier character is therefore a genuine
 * early-game answer rather than a consolation prize, and falls off late because the math says
 * so rather than because it was authored weak.
 *
 * This is also why an `ascended`-tier character is not simply "better at everything". Vharok
 * hits harder than anything in the game and is slower and softer than most commons. Seraphine
 * cannot crit at all. The tier sharpens the niche in both directions.
 *
 * ## Faction identities
 *
 * Faction decides the ascension ladder (see `ascension.ts`) and, by convention, the axis each
 * of its three members expresses more extremely as tier rises:
 *
 * - **Humans** — versatile and dependable, the control the others are read against.
 * - **Dwarves** — DEF and attrition. Cannot close a fight; can refuse to lose one.
 * - **Elves** — SPD and crit, made of paper. Wins before it can be hit.
 * - **Undead** — enormous HP, almost no DEF. Absorbs volume, melts to single big hits.
 * - **Monsters** — raw ATK and nothing else. The answer to high DEF, given the damage curve.
 * - **Angels** — consistency. High DEF, low or no crit — the same number every swing.
 * - **Demons** — pure variance. Crit chance and multiplier far past anyone else, on no HP.
 *
 * Because damage is `atk² / (atk + def)`, a party of many small hits is punished by high DEF
 * far more than one big hit is. That is what makes Monsters a real answer to Dwarves and Golems
 * rather than just another damage stat, and it is why the budgets above are not directly
 * comparable across factions.
 */

// ---------------------------------------------------------------------------------------
// Humans — versatile, dependable crit
// ---------------------------------------------------------------------------------------

/** The middle of every axis. Unexciting on purpose: she is the control against which the other
 * two are read, and the reason a party is never simply "more Rin". */
export const MIRA = {
  id: 'mira',
  name: 'Mira',
  faction: 'human',
  tier: 'common',
  stats: { hp: 580, atk: 48, def: 23, spd: 96, critChance: 0.12, critMultiplier: 1.6 },
} as const;

/** Mira with the edges filed sharper: a little faster, a little more likely to spike. */
export const SEREN = {
  id: 'seren',
  name: 'Seren the Oathbound',
  faction: 'human',
  tier: 'legendary',
  stats: { hp: 545, atk: 54, def: 27, spd: 102, critChance: 0.15, critMultiplier: 1.7 },
} as const;

/** No weakness worth naming and no spike worth fearing — she simply never has a bad matchup,
 * which is the most human thing in the game. */
export const AURELIA = {
  id: 'aurelia',
  name: 'Aurelia, Last Marshal',
  faction: 'human',
  tier: 'ascended',
  stats: { hp: 600, atk: 57, def: 29, spd: 104, critChance: 0.18, critMultiplier: 1.75 },
} as const;

// ---------------------------------------------------------------------------------------
// Dwarves — DEF and attrition
// ---------------------------------------------------------------------------------------

/** Slow and nearly unkillable early. His DEF is what keeps the party alive long enough for the
 * others to finish a fight, and his ATK is why he cannot finish one himself. */
export const BRAN = {
  id: 'bran',
  name: 'Bran',
  faction: 'dwarf',
  tier: 'common',
  stats: { hp: 940, atk: 34, def: 42, spd: 70, critChance: 0.05, critMultiplier: 1.5 },
} as const;

/** Trades what little offence Bran had for more wall. Against a wide wave of small hits he is
 * very close to unkillable; against one big one he is merely slow. */
export const KORRIN = {
  id: 'korrin',
  name: 'Korrin Anvilheart',
  faction: 'dwarf',
  tier: 'legendary',
  stats: { hp: 1010, atk: 31, def: 52, spd: 64, critChance: 0.04, critMultiplier: 1.5 },
} as const;

/** The most extreme defensive block authored, and the worst attacker in the game to pay for it.
 * A party built around him wins by outlasting; he will never once land the killing blow. */
export const THRAUN = {
  id: 'thraun',
  name: 'Thraun, the Deep Ward',
  faction: 'dwarf',
  tier: 'ascended',
  stats: { hp: 1120, atk: 29, def: 66, spd: 58, critChance: 0.03, critMultiplier: 1.5 },
} as const;

// ---------------------------------------------------------------------------------------
// Elves — speed and crit, made of paper
// ---------------------------------------------------------------------------------------

/** Fast, sharp, and made of glass. High crit makes her damage swingy, which is the tradeoff
 * for the raw ATK: she is the only one who meaningfully dents a high-DEF target. */
export const RIN = {
  id: 'rin',
  name: 'Rin',
  faction: 'elf',
  tier: 'common',
  stats: { hp: 430, atk: 63, def: 14, spd: 118, critChance: 0.22, critMultiplier: 1.8 },
} as const;

/** Gives up HP for tempo. Acts roughly a third more often than Rin and dies to roughly a third
 * less. */
export const LYSHA = {
  id: 'lysha',
  name: 'Lysha Windstep',
  faction: 'elf',
  tier: 'legendary',
  stats: { hp: 385, atk: 66, def: 11, spd: 134, critChance: 0.26, critMultiplier: 1.85 },
} as const;

/** The fastest thing authored and the softest. Acts nearly three times for every two turns a
 * human takes, and loses outright to anything that reaches him twice. */
export const AELRINDEL = {
  id: 'aelrindel',
  name: 'Aelrindel, First Arrow',
  faction: 'elf',
  tier: 'ascended',
  stats: { hp: 350, atk: 70, def: 9, spd: 152, critChance: 0.3, critMultiplier: 1.9 },
} as const;

// ---------------------------------------------------------------------------------------
// Undead — bodies without armour
// ---------------------------------------------------------------------------------------

/** A lot of HP behind almost no DEF. Because DEF has diminishing returns and HP does not, he
 * soaks a wide wave far better than his stat line suggests and folds to one big hit. */
export const MORTLACH = {
  id: 'mortlach',
  name: 'Mortlach the Patient',
  faction: 'undead',
  tier: 'common',
  stats: { hp: 780, atk: 40, def: 12, spd: 82, critChance: 0.06, critMultiplier: 1.5 },
} as const;

/** More of Mortlach, with the armour stripped further. */
export const SABLE = {
  id: 'sable',
  name: 'Sable, the Unquiet',
  faction: 'undead',
  tier: 'legendary',
  stats: { hp: 880, atk: 43, def: 9, spd: 88, critChance: 0.07, critMultiplier: 1.55 },
} as const;

/** The largest HP pool in the game attached to the thinnest armour. Wonderful against Wisps,
 * dreadful against a Warden. */
export const NEKROS = {
  id: 'nekros',
  name: 'Nekros, Grave Sovereign',
  faction: 'undead',
  tier: 'ascended',
  stats: { hp: 1020, atk: 46, def: 7, spd: 92, critChance: 0.08, critMultiplier: 1.6 },
} as const;

// ---------------------------------------------------------------------------------------
// Monsters — raw ATK, nothing else
// ---------------------------------------------------------------------------------------

/** Hits hard, thinks slowly. The cheapest answer to an early armoured target. */
export const GNASH = {
  id: 'gnash',
  name: 'Gnash',
  faction: 'monster',
  tier: 'common',
  stats: { hp: 620, atk: 58, def: 18, spd: 74, critChance: 0.04, critMultiplier: 1.6 },
} as const;

/** Slower and harder still. Nearly never crits, which makes his damage boringly predictable —
 * and predictability is exactly what a DEF check wants. */
export const RUK = {
  id: 'ruk',
  name: 'Ruk the Mountain-Eater',
  faction: 'monster',
  tier: 'legendary',
  stats: { hp: 700, atk: 68, def: 15, spd: 68, critChance: 0.03, critMultiplier: 1.7 },
} as const;

/** The highest ATK authored, on the slowest body that is not a Dwarf. Against the diminishing
 * DEF curve one enormous hit is worth several small ones, which is his entire argument. */
export const VHAROK = {
  id: 'vharok',
  name: "Vharok, World's Maw",
  faction: 'monster',
  tier: 'ascended',
  stats: { hp: 760, atk: 80, def: 12, spd: 62, critChance: 0.02, critMultiplier: 1.8 },
} as const;

// ---------------------------------------------------------------------------------------
// Angels — consistency (celestial ladder: no fodder, only their own copies)
// ---------------------------------------------------------------------------------------

/** Solid on both defensive axes and almost incapable of a lucky turn. What she does this fight
 * is what she did last fight. */
export const CELIA = {
  id: 'celia',
  name: 'Celia of the Choir',
  faction: 'angel',
  tier: 'common',
  stats: { hp: 690, atk: 44, def: 34, spd: 86, critChance: 0.02, critMultiplier: 1.4 },
} as const;

/** More wall, less luck. */
export const ITHURIEL = {
  id: 'ithuriel',
  name: 'Ithuriel, Verse of Dawn',
  faction: 'angel',
  tier: 'legendary',
  stats: { hp: 740, atk: 47, def: 41, spd: 90, critChance: 0.01, critMultiplier: 1.35 },
} as const;

/** Cannot crit. At all.
 *
 * A `critChance` of zero is a real design position rather than a missing number: she is the
 * only combatant whose damage has no variance whatsoever, which makes her the one unit a
 * marginal fight can be planned around. Every attack still draws exactly once from the RNG —
 * `damage.ts` guarantees that regardless of the stat block — so fielding her never shifts the
 * battle's random sequence. */
export const SERAPHINE = {
  id: 'seraphine',
  name: 'Seraphine, the Unwavering',
  faction: 'angel',
  tier: 'ascended',
  stats: { hp: 810, atk: 50, def: 48, spd: 94, critChance: 0, critMultiplier: 1.3 },
} as const;

// ---------------------------------------------------------------------------------------
// Demons — pure variance (celestial ladder)
// ---------------------------------------------------------------------------------------

/** Crits about a quarter of the time for nearly double. Her average is ordinary and her fights
 * rarely are. */
export const PYRA = {
  id: 'pyra',
  name: 'Pyra Emberkin',
  faction: 'demon',
  tier: 'common',
  stats: { hp: 470, atk: 55, def: 16, spd: 100, critChance: 0.25, critMultiplier: 1.9 },
} as const;

/** A third of his swings land for over double. The other two thirds are why he is called that. */
export const MALAKAR = {
  id: 'malakar',
  name: 'Malakar the Gambler',
  faction: 'demon',
  tier: 'legendary',
  stats: { hp: 420, atk: 58, def: 13, spd: 108, critChance: 0.34, critMultiplier: 2.1 },
} as const;

/** The most volatile block in the game: nearly half his attacks land for 2.4×, on the second
 * smallest HP pool authored. The 5th-percentile run with him is genuinely bad and the median is
 * excellent, which is precisely the unit a game with no way to buy luck should be careful
 * about — his pity-adjacent counterpart is Seraphine, and that pairing is deliberate. */
export const AZRATHOTH = {
  id: 'azrathoth',
  name: 'Azrathoth, Ruin Unbound',
  faction: 'demon',
  tier: 'ascended',
  stats: { hp: 380, atk: 62, def: 10, spd: 116, critChance: 0.45, critMultiplier: 2.4 },
} as const;

/**
 * Every playable character, in faction then tier order.
 *
 * This is the pull pool and the roster's source of truth. `characters.spec.ts` asserts ids are
 * unique, every faction is populated at all three tiers, and every `faction` names a real one.
 */
export const CHARACTERS = [
  MIRA,
  SEREN,
  AURELIA,
  BRAN,
  KORRIN,
  THRAUN,
  RIN,
  LYSHA,
  AELRINDEL,
  MORTLACH,
  SABLE,
  NEKROS,
  GNASH,
  RUK,
  VHAROK,
  CELIA,
  ITHURIEL,
  SERAPHINE,
  PYRA,
  MALAKAR,
  AZRATHOTH,
] as const;

/**
 * The party a new run is given, in slot order.
 *
 * Three common-tier characters from three different factions — one glass cannon, one wall, one
 * generalist — so a new player owns a functioning party and three separate ascension projects
 * from the first minute, rather than three of one faction and no way to use the other four
 * ladders.
 *
 * Slot order is load-bearing: it breaks ties in ATB turn order, and enemies target the ally
 * with the least HP remaining rather than the front slot.
 */
export const STARTER_TEAM = [RIN, BRAN, MIRA] as const;

/**
 * The starter party as ids, for seeding a save without `core/` importing `data/`.
 *
 * Written out rather than derived from {@link STARTER_TEAM} with a `.map()`: `data/` is plain
 * data, and a call expression here is the first crack in that. `characters.spec.ts` asserts
 * the two lists agree, which is the part the `.map()` was buying.
 */
export const STARTER_CHARACTER_IDS = ['rin', 'bran', 'mira'] as const;
