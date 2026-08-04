import {
  ABSOLUTION,
  AEGIS_SKILL,
  ANVIL_STANCE,
  CHOIRLIGHT,
  DECISIVE_STRIKE,
  DEEP_WARD,
  DEVOUR,
  EMBERBURST,
  FIELD_DRESSING,
  FIRST_ARROW,
  GAMBLERS_CUT,
  GRAVE_GRASP,
  GRAVE_TIDE,
  GROUND_SLAM,
  GUARD_BREAK,
  HAMMER_CHECK,
  HEXFIRE,
  MARSHALS_CALL,
  MOUNTAIN_BREAKER,
  OATH_OF_ARMS,
  PIERCING_SHOT,
  RUIN_UNBOUND,
  REND,
  SALTBEARD_REMEDY,
  SHIELD_WALL,
  SOUL_SIPHON,
  STOUT_WARD,
  SWORN_STRIKE,
  THROAT_CUT,
  TRIAGE,
  UNMAKING,
  UNWAVERING_LIGHT,
  VERSE_OF_DAWN,
  VOLLEY,
  WINDSTEP,
  WORLDS_MAW,
  BLOOD_PACT,
} from './skills';

/**
 * Playable character stat blocks and kits.
 *
 * Same plain-data rules as `enemies.ts`: numbers, strings and references to `data/` siblings
 * only, no imports outside `data/`.
 *
 * ## Stats here are level 1, at the character's starting rarity
 *
 * Everything below is a **base** block. `core/roster/stats.ts` scales the four quantities —
 * `hp`, `atk`, `def` and `recovery` — for level and rarity, and scales nothing else. The
 * scheduling weights (`haste`, `attackSpeed`), every probability (`critChance`, `critBlock`,
 * `dodge`, `lifeLeech`, `insight`, `tenacity`), the pierce and resist pairs, the percentage
 * amplifiers and the `energyRegen` budget all stay exactly as written, at every level. So the
 * numbers here are what a character is *like*, and level is how much of it there is.
 *
 * `recovery` is the one new quantity that had to scale: it is measured against `hp`, so a fixed
 * value would be a no-op the moment health outgrew it. `healthRegen` amplifies it as a
 * percentage and therefore does not scale, which is the correct side of the line for both.
 *
 * `energyRegen` staying flat is what keeps a caster metered, and it inherited the job from `mp`
 * unchanged: the bar it fills is a fixed 100, so a regen that grew with level would silently turn
 * the meter into a formality by about level eighty.
 *
 * ## Every character has exactly one ultimate
 *
 * Since milestone 8b, one skill in every kit is marked `ultimate` and is metered by a full energy
 * bar instead of by a cooldown. `energyRegen` here is the authorable half of how fast that bar
 * fills; the other half — ten for landing a hit, ten for taking one, ten for healing an ally — is
 * the same for everybody and lives in `combat.ts`.
 *
 * So the number below says **how much a character charges on its own**, and it is read against
 * how much fighting it expects to do. An Angel at 14 reaches its ultimate from the back rank
 * without being touched, which is what "consistency" means for a faction whose job is to have the
 * answer ready. A Monster at 5 reaches it only by being in the fight, which is the same statement
 * its six-line stat block makes. And a Dwarf sits high not because it is a caster but because it
 * is **slow**: at 70 haste it takes half as many turns as an Elf, and a per-turn drip has to be
 * read per turn.
 *
 * ## Every basic attack is physical
 *
 * Even a mage's. Since milestone 8a that no longer means a mage swings with a stat it did not
 * invest in — there is one `atk` and everything reads it. What the type decides now is which
 * **resist** answers the hit, so a mage's swing is the thing a `physicalResist` wall was built
 * for and its spells are what get past one. The trade moved from the caster's stat sheet onto
 * the encounter, which is where this game keeps preferring to put things.
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
 * Faction decides the ascension ladder (see `ascension.ts`), the matchup multipliers (see
 * `combat.ts`) and, by convention, the axis each of its members expresses more extremely as
 * tier rises:
 *
 * - **Humans** — versatile and dependable, the control the others are read against. The one
 *   mortal faction with both a healer and a cleanse, deliberately: Angels are the natural
 *   support and they walk the luck-only ladder, so a run that never pulls one still needs
 *   somewhere to buy sustain.
 * - **Dwarves** — DEF and attrition: `recovery`, `healthRegen` and a `critBlock` that keeps a
 *   wall from folding to one lucky spike. Cannot close a fight; can refuse to lose one.
 * - **Elves** — haste, attack speed, crit and **reach**. Made of paper, and the first answer
 *   to a back rank. The only faction authored with `attackSpeed`, which is what that stat was
 *   separated from haste to express.
 * - **Undead** — enormous HP, almost no DEF, and every kit built on `drain`. They used to buy
 *   their best turns with their own life; since 8b they are paid in energy for having been hit
 *   and take the life back out of whatever hit them. The lowest `energyRegen` outside the
 *   Monsters, because being in the fight is their meter.
 * - **Monsters** — raw ATK and penetration. The answer to armour, given the damage curve.
 *   Deliberately the shortest stat blocks in the file: a faction with nothing but a number is a
 *   faction that says what it is.
 * - **Angels** — consistency and sustain. High DEF, low or no crit, the highest `energyRegen` in
 *   the game, and the only holders of `receivedHealing` and `critDamageResist`: the faction that
 *   answers a spike, and the one whose answer is ready whether or not the fight has gone badly.
 * - **Demons** — magical damage and pure variance. Ignore armour entirely; die to anything.
 *
 * Because damage is `atk² / (atk + def)`, a party of many small hits is punished by high DEF
 * far more than one big hit is. That is what makes Monsters a real answer to Dwarves and
 * Golems rather than just another damage stat, and it is why the budgets below are not
 * directly comparable across factions.
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
  role: 'bruiser',
  stats: {
    hp: 580,
    atk: 48,
    def: 22,
    recovery: 4,
    haste: 96,
    critChance: 0.12,
    critDamageAmp: 0.6,
    energyRegen: 9,
  },
  skills: [GUARD_BREAK],
} as const;

/** Mira with the edges filed sharper: a little faster, a little more likely to spike, and the
 * first character most runs own who can buy the whole party a turn's worth of damage. */
export const SEREN = {
  id: 'seren',
  name: 'Seren the Oathbound',
  faction: 'human',
  tier: 'legendary',
  role: 'bruiser',
  stats: {
    hp: 545,
    atk: 54,
    def: 26,
    recovery: 5,
    haste: 102,
    critChance: 0.15,
    critDamageAmp: 0.7,
    energyRegen: 9,
    physicalResist: 0.03,
  },
  skills: [OATH_OF_ARMS, SWORN_STRIKE],
} as const;

/** No weakness worth naming and no spike worth fearing — she simply never has a bad matchup,
 * which is the most human thing in the game. */
export const AURELIA = {
  id: 'aurelia',
  name: 'Aurelia, Last Marshal',
  faction: 'human',
  tier: 'ascended',
  role: 'support',
  stats: {
    hp: 600,
    atk: 57,
    def: 28,
    recovery: 6,
    haste: 104,
    critChance: 0.18,
    critDamageAmp: 0.75,
    energyRegen: 10,
  },
  skills: [MARSHALS_CALL, DECISIVE_STRIKE],
} as const;

/**
 * The mortal healer.
 *
 * She exists because of a bad-luck failure mode rather than a hole in the fiction: healing is
 * an Angel's job, Angels ascend on copies of themselves alone, and a player whose banners are
 * unkind would otherwise have no sustain available at any price. Weaker per point of healing
 * than Celia and far cheaper to keep — a Human bench is easy to build.
 */
export const WREN = {
  id: 'wren',
  name: 'Wren of the Ninth',
  faction: 'human',
  tier: 'common',
  role: 'healer',
  stats: {
    hp: 500,
    atk: 46,
    def: 23,
    recovery: 5,
    haste: 94,
    critChance: 0.08,
    critDamageAmp: 0.5,
    energyRegen: 12,
    magicResist: 0.06,
  },
  skills: [TRIAGE, FIELD_DRESSING],
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
  role: 'tank',
  stats: {
    hp: 940,
    atk: 34,
    def: 34,
    recovery: 7,
    haste: 70,
    critChance: 0.05,
    critDamageAmp: 0.5,
    critBlock: 0.05,
    energyRegen: 9,
    physicalResist: 0.11,
    healthRegen: 0.2,
  },
  skills: [SHIELD_WALL],
} as const;

/** Trades what little offence Bran had for more wall. Against a wide wave of small hits he is
 * very close to unkillable; against one big one he is merely slow. */
export const KORRIN = {
  id: 'korrin',
  name: 'Korrin Anvilheart',
  faction: 'dwarf',
  tier: 'legendary',
  role: 'tank',
  stats: {
    hp: 1010,
    atk: 31,
    def: 41,
    recovery: 9,
    haste: 64,
    critChance: 0.04,
    critDamageAmp: 0.5,
    critBlock: 0.06,
    energyRegen: 10,
    physicalResist: 0.12,
    healthRegen: 0.25,
  },
  skills: [ANVIL_STANCE, HAMMER_CHECK],
} as const;

/** The most extreme defensive block authored, and the worst attacker in the game to pay for it.
 * A party built around him wins by outlasting; he will never once land the killing blow. */
export const THRAUN = {
  id: 'thraun',
  name: 'Thraun, the Deep Ward',
  faction: 'dwarf',
  tier: 'ascended',
  role: 'tank',
  stats: {
    hp: 1120,
    atk: 29,
    def: 52,
    recovery: 11,
    haste: 58,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    energyRegen: 10,
    tenacity: 0.2,
    physicalResist: 0.12,
    healthRegen: 0.35,
  },
  skills: [DEEP_WARD, GROUND_SLAM],
} as const;

/**
 * The mortal cleanse, for the same reason Wren is the mortal heal.
 *
 * Deep enough on both defensive axes to survive the front rank and useless at killing
 * anything, which is the trade for being the answer to a debuff wave.
 */
export const DORN = {
  id: 'dorn',
  name: 'Dorn Saltbeard',
  faction: 'dwarf',
  tier: 'common',
  role: 'support',
  stats: {
    hp: 820,
    atk: 34,
    def: 36,
    recovery: 7,
    haste: 76,
    critChance: 0.04,
    critDamageAmp: 0.5,
    critBlock: 0.04,
    energyRegen: 12,
    healthRegen: 0.2,
  },
  skills: [SALTBEARD_REMEDY, STOUT_WARD],
} as const;

// ---------------------------------------------------------------------------------------
// Elves — speed, crit and reach, made of paper
// ---------------------------------------------------------------------------------------

/** Fast, sharp, and made of glass — and the reason a starting party can answer a formation at
 * all. Piercing Shot is free, on a short cooldown, and it reaches over the front rank. */
export const RIN = {
  id: 'rin',
  name: 'Rin',
  faction: 'elf',
  tier: 'common',
  role: 'ranger',
  stats: {
    hp: 430,
    atk: 63,
    def: 15,
    haste: 118,
    attackSpeed: 22,
    critChance: 0.22,
    critDamageAmp: 0.8,
    energyRegen: 8,
    magicResist: 0.03,
    accuracy: 1.1,
  },
  skills: [PIERCING_SHOT],
} as const;

/** Gives up HP for tempo. Acts roughly a third more often than Rin and dies to roughly a third
 * less. */
export const LYSHA = {
  id: 'lysha',
  name: 'Lysha Windstep',
  faction: 'elf',
  tier: 'legendary',
  role: 'assassin',
  stats: {
    hp: 385,
    atk: 66,
    def: 12,
    haste: 134,
    attackSpeed: 26,
    critChance: 0.26,
    critDamageAmp: 0.85,
    energyRegen: 8,
    magicResist: 0.05,
    dodge: 0.1,
  },
  skills: [THROAT_CUT, WINDSTEP],
} as const;

/** The fastest thing authored and the softest. Acts nearly three times for every two turns a
 * human takes, loses outright to anything that reaches him twice, and is the only character who
 * can reliably delete a back rank on his own. */
export const AELRINDEL = {
  id: 'aelrindel',
  name: 'Aelrindel, First Arrow',
  faction: 'elf',
  tier: 'ascended',
  role: 'sniper',
  stats: {
    hp: 350,
    atk: 70,
    def: 10,
    haste: 152,
    attackSpeed: 30,
    critChance: 0.3,
    critDamageAmp: 0.9,
    energyRegen: 8,
    physicalPierce: 0.2,
    magicResist: 0.06,
    dodge: 0.12,
    accuracy: 1.15,
  },
  skills: [FIRST_ARROW, VOLLEY],
} as const;

// ---------------------------------------------------------------------------------------
// Undead — bodies without armour, paying for skills in life
// ---------------------------------------------------------------------------------------

/** A lot of HP behind almost no DEF. Because DEF has diminishing returns and HP does not, he
 * soaks a wide wave far better than his stat line suggests and folds to one big hit. */
export const MORTLACH = {
  id: 'mortlach',
  name: 'Mortlach the Patient',
  faction: 'undead',
  tier: 'common',
  role: 'bruiser',
  stats: {
    hp: 780,
    atk: 40,
    def: 11,
    recovery: 9,
    haste: 82,
    critChance: 0.06,
    critDamageAmp: 0.5,
    energyRegen: 6,
    lifeLeech: 0.05,
    physicalResist: 0.04,
  },
  skills: [GRAVE_GRASP],
} as const;

/** More of Mortlach, with the armour stripped further and a magical drain bought with his own
 * blood — which wins against a Dwarf and loses badly against an Angel. */
export const SABLE = {
  id: 'sable',
  name: 'Sable, the Unquiet',
  faction: 'undead',
  tier: 'legendary',
  role: 'bruiser',
  stats: {
    hp: 880,
    atk: 43,
    def: 8,
    recovery: 12,
    haste: 88,
    critChance: 0.07,
    critDamageAmp: 0.55,
    energyRegen: 6,
    lifeLeech: 0.08,
    physicalResist: 0.03,
  },
  skills: [BLOOD_PACT],
} as const;

/** The largest HP pool in the game attached to the thinnest armour, and the only character who
 * spends ninety of it on a single cast. Wonderful against Wisps, dreadful against a Warden. */
export const NEKROS = {
  id: 'nekros',
  name: 'Nekros, Grave Sovereign',
  faction: 'undead',
  tier: 'ascended',
  role: 'mage',
  stats: {
    hp: 1020,
    atk: 52,
    def: 7,
    recovery: 16,
    haste: 92,
    critChance: 0.08,
    critDamageAmp: 0.6,
    energyRegen: 7,
    lifeLeech: 0.1,
    magicPierce: 0.15,
  },
  skills: [GRAVE_TIDE, SOUL_SIPHON],
} as const;

// ---------------------------------------------------------------------------------------
// Monsters — raw ATK and penetration, nothing else
// ---------------------------------------------------------------------------------------

/** Hits hard, thinks slowly. The cheapest answer to an early armoured target. */
export const GNASH = {
  id: 'gnash',
  name: 'Gnash',
  faction: 'monster',
  tier: 'common',
  role: 'bruiser',
  stats: {
    hp: 620,
    atk: 58,
    def: 16,
    haste: 74,
    critChance: 0.04,
    critDamageAmp: 0.6,
    energyRegen: 5,
    physicalResist: 0.06,
  },
  skills: [REND],
} as const;

/** Slower and harder still, and the first character with real armour penetration. Nearly never
 * crits, which makes his damage boringly predictable — and predictability is exactly what a DEF
 * check wants. */
export const RUK = {
  id: 'ruk',
  name: 'Ruk the Mountain-Eater',
  faction: 'monster',
  tier: 'legendary',
  role: 'bruiser',
  stats: {
    hp: 700,
    atk: 68,
    def: 14,
    haste: 68,
    critChance: 0.03,
    critDamageAmp: 0.7,
    energyRegen: 5,
    physicalPierce: 0.25,
    physicalResist: 0.05,
  },
  skills: [MOUNTAIN_BREAKER],
} as const;

/** The highest ATK authored, on the slowest body that is not a Dwarf, ignoring a third of
 * whatever armour it meets. Against the diminishing DEF curve one enormous hit is worth several
 * small ones, which is his entire argument. */
export const VHAROK = {
  id: 'vharok',
  name: "Vharok, World's Maw",
  faction: 'monster',
  tier: 'ascended',
  role: 'bruiser',
  stats: {
    hp: 760,
    atk: 80,
    def: 11,
    haste: 62,
    critChance: 0.02,
    critDamageAmp: 0.8,
    energyRegen: 6,
    insight: 0.1,
    physicalPierce: 0.35,
    physicalResist: 0.04,
  },
  skills: [WORLDS_MAW, DEVOUR],
} as const;

// ---------------------------------------------------------------------------------------
// Angels — consistency and sustain (celestial ladder: no fodder, only their own copies)
// ---------------------------------------------------------------------------------------

/** Solid on both defensive axes and almost incapable of a lucky turn. What she does this fight
 * is what she did last fight — including the heal, which is the first real sustain most runs
 * find. */
export const CELIA = {
  id: 'celia',
  name: 'Celia of the Choir',
  faction: 'angel',
  tier: 'common',
  role: 'healer',
  stats: {
    hp: 690,
    atk: 44,
    def: 35,
    recovery: 6,
    haste: 86,
    critChance: 0.02,
    critDamageAmp: 0.4,
    critDamageResist: 0.15,
    energyRegen: 13,
    receivedHealing: 0.15,
  },
  skills: [CHOIRLIGHT],
} as const;

/** More wall, less luck, and the deepest cleanse in the game. */
export const ITHURIEL = {
  id: 'ithuriel',
  name: 'Ithuriel, Verse of Dawn',
  faction: 'angel',
  tier: 'legendary',
  role: 'healer',
  stats: {
    hp: 740,
    atk: 48,
    def: 42,
    recovery: 8,
    haste: 90,
    critChance: 0.01,
    critDamageAmp: 0.35,
    critDamageResist: 0.2,
    energyRegen: 14,
    tenacity: 0.15,
    receivedHealing: 0.2,
  },
  skills: [ABSOLUTION, VERSE_OF_DAWN],
} as const;

/** Cannot crit. At all.
 *
 * A `critChance` of zero is a real design position rather than a missing number: she is the
 * only combatant whose damage has no variance whatsoever, which makes her the one unit a
 * marginal fight can be planned around. Every attack still draws exactly twice from the RNG —
 * `damage.ts` guarantees that regardless of the stat block — so fielding her never shifts the
 * battle's random sequence. */
export const SERAPHINE = {
  id: 'seraphine',
  name: 'Seraphine, the Unwavering',
  faction: 'angel',
  tier: 'ascended',
  role: 'healer',
  stats: {
    hp: 810,
    atk: 56,
    def: 50,
    recovery: 10,
    haste: 94,
    critChance: 0,
    critDamageAmp: 0.3,
    critDamageResist: 0.3,
    energyRegen: 14,
    tenacity: 0.25,
    receivedHealing: 0.3,
  },
  skills: [UNWAVERING_LIGHT, AEGIS_SKILL],
} as const;

// ---------------------------------------------------------------------------------------
// Demons — magical damage and pure variance (celestial ladder)
// ---------------------------------------------------------------------------------------

/** Crits about a quarter of the time for nearly double, and does it with magic — so the Dwarf
 * that walls everything else does nothing about her. Her average is ordinary and her fights
 * rarely are. */
export const PYRA = {
  id: 'pyra',
  name: 'Pyra Emberkin',
  faction: 'demon',
  tier: 'common',
  role: 'mage',
  stats: {
    hp: 470,
    atk: 55,
    def: 17,
    haste: 100,
    critChance: 0.25,
    critDamageAmp: 0.9,
    energyRegen: 8,
    magicResist: 0.03,
  },
  skills: [EMBERBURST],
} as const;

/** A third of his swings land for over double. The other two thirds are why he is called that.
 * The only Demon who reaches a back rank. */
export const MALAKAR = {
  id: 'malakar',
  name: 'Malakar the Gambler',
  faction: 'demon',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 420,
    atk: 58,
    def: 14,
    haste: 108,
    critChance: 0.34,
    critDamageAmp: 1.1,
    energyRegen: 8,
    magicResist: 0.03,
    dodge: 0.08,
  },
  skills: [GAMBLERS_CUT, HEXFIRE],
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
  role: 'mage',
  stats: {
    hp: 380,
    atk: 66,
    def: 11,
    haste: 116,
    critChance: 0.45,
    critDamageAmp: 1.4,
    energyRegen: 9,
    magicPierce: 0.2,
    magicResist: 0.04,
  },
  skills: [RUIN_UNBOUND, UNMAKING],
} as const;

/**
 * Every playable character, in faction then tier order.
 *
 * This is the pull pool and the roster's source of truth. `characters.spec.ts` asserts ids are
 * unique, every faction is populated at all three tiers, every `faction` names a real one, and
 * every kit points at a skill that exists.
 */
export const CHARACTERS = [
  MIRA,
  WREN,
  SEREN,
  AURELIA,
  BRAN,
  DORN,
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
 * The formation a new run is given.
 *
 * Three common-tier characters from three different factions — one wall, one generalist, one
 * ranger — so a new player owns a functioning party and three separate ascension projects from
 * the first minute, rather than three of one faction and no way to use the other four ladders.
 *
 * **Three in five slots is the intended shape, not a shortfall.** The ladder is tuned so this
 * party clears the first four stages comfortably; the two empty slots are what makes the first
 * summon worth something, and filling them is the game's first real decision. A starting party
 * that already filled the formation would make the gacha decorative for the whole early game.
 *
 * Rin stands behind Bran and Mira, which is load-bearing in three separate ways: the front rank
 * is what enemy attacks have to work through, she is the party's only answer to an enemy back
 * rank, and at 430 HP she does not survive being reached.
 */
export const STARTER_FORMATION = {
  front: ['bran', 'mira'],
  back: ['rin'],
} as const;
