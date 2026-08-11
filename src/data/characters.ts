import {
  ABSOLUTION,
  ACID_WIND,
  AEGIS_SKILL,
  ANSWERED_IN_KIND,
  ANVIL_STANCE,
  ARROW_OF_ENDING,
  AVALANCHE,
  BILESPRAY,
  BLACKLANCE_THRUST,
  BLADE_OF_THE_CHOIR,
  BLOATBURST,
  BLOOD_GORGE,
  BLOOD_PACT,
  BLUNT_THE_EDGE,
  BONEBREAK,
  BONESHOT,
  BONEWHISTLE,
  BONE_CHOIR,
  BRACING_BLOW,
  BRAMBLECUT,
  BREAK_THE_HERD,
  CARRION_FEAST,
  CAVERN_ECHO,
  CHAINBREAK,
  CHAINWARD,
  CHOIRLIGHT,
  CINDERLASH,
  COALSONG,
  CORROSION,
  CRIMSON_SIGIL,
  CROWN_OF_FLIES,
  CUT_THE_VANGUARD,
  DAWNWARD,
  DECISIVE_STRIKE,
  DEEPSTONE_GRASP,
  DEEP_WARD,
  DEVOUR,
  DEVOURING_TIDE,
  DOUBLE_OR_NOTHING,
  DUELISTS_READ,
  DUSKWEAVE,
  EMBERBURST,
  ENTROPY,
  EVEN_HAND,
  FADESHOT,
  FEAST_ON_RUIN,
  FESTER,
  FIELD_DRESSING,
  FIRST_ARROW,
  FORGELIGHT_VIGIL,
  GAMBLERS_CUT,
  GATEBREAKERS_ANSWER,
  GNASHING_TIDE,
  GORGE,
  GRASPING_ROT,
  GRAVECALL,
  GRAVE_CHILL,
  GRAVE_GRASP,
  GRAVE_TIDE,
  GROUND_SLAM,
  GRUDGEFIRE,
  GRUDGE_SETTLED,
  GUARD_BREAK,
  GULLET,
  HAMMER_CHECK,
  HEXFIRE,
  HEX_THE_HEARTH,
  HOLD_THE_LINE,
  HOLLOWBIND,
  HURLED_ANVIL,
  IRONS_BROKEN,
  IRON_REBUKE,
  JUDGEMENT,
  KEEPERS_CHARGE,
  KINDLED_WORD,
  LEVEL_GROUND,
  LIGHTSPEAR,
  LONG_SILENCE,
  LOOSE_THE_FLIGHT,
  MARKED_QUARRY,
  MARROW_CRUNCH,
  MARROW_DRAW,
  MARSHALS_CALL,
  MAUL,
  MOUNTAIN_BREAKER,
  NIGHTREACH,
  NINEFANG_FEAST,
  OATH_OF_ARMS,
  OSSUARY_TIDE,
  PATIENT_MALICE,
  PIERCING_SHOT,
  PINNING_SHOT,
  PIT_PROPS,
  POMMEL_STRIKE,
  QUENCHING_DRAUGHT,
  QUIVER_UNSLUNG,
  RAGGED_SWIPE,
  RED_TITHE,
  REND,
  RIPOSTE,
  ROOT_AND_BOUGH,
  RUIN_UNBOUND,
  RUNES_OF_RETURN,
  RUNE_STRUCK,
  SALTBEARD_REMEDY,
  SANCTUARY,
  SECOND_WIND,
  SEEDED_SHAFT,
  SENDING,
  SENTENCE,
  SHIELDSWORN_OATH,
  SHIELD_WALL,
  SINSONG,
  SNARE_ARROW,
  SOOTHING_VERSE,
  SOUL_SIPHON,
  SOUL_TITHE,
  SOVEREIGNS_TOLL,
  SPLITTING_SHAFT,
  STAND_AND_BE_SEEN,
  STOKE_THE_GRUDGE,
  STOUT_WARD,
  SUNDERJAW,
  SUNDER_STONE,
  SUNKEN_RUNE,
  SUNLIT_BOUGH,
  SUNSPEAR_CAST,
  SWEEPING_COMMAND,
  SWORN_STRIKE,
  SYLVAN_REFRAIN,
  THE_DRAWN_SWORD,
  THE_HEX_COMES_DUE,
  THE_LAST_VOLLEY,
  THE_NINTH_HOLDS,
  THE_QUIET_FIELD,
  THE_RECKONING,
  THICK_HIDE,
  THIRD_WHISPER,
  THORNGUARD,
  THROAT_CUT,
  TITHE_COLLECTED,
  TRAMPLE,
  TRIAGE,
  TRUESIGHT_VOLLEY,
  UNMAKING,
  UNQUIET_HUNGER,
  UNWAVERING_LIGHT,
  UNYIELDING,
  VERSE_OF_DAWN,
  VIGIL,
  VOLLEY,
  WARDING_STRIKE,
  WARDSTONE,
  WARD_UNBROKEN,
  WEIGHED_AND_FOUND,
  WHISPERED_BARGAIN,
  WICKERBURN,
  WINDSTEP,
  WINDWOVEN_BALM,
  WITHERING_GAZE,
  WORLDS_MAW,
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
 * ## A kit is authored at its tier's ceiling, ultimate first, then in unlock order
 *
 * Since milestone 8c a character does not fight with everything written below it. Tier sets how
 * many skills it may ever field — two, three or four, counting the ultimate — and ascension rungs
 * hand them over one at a time. The table and the rungs are in `kits.ts`; the rule that reads them
 * is `core/roster/kit.ts`.
 *
 * Two conventions make a kit readable, and `characters.spec.ts` asserts both:
 *
 * - **Exactly as many skills as the tier allows.** Never fewer, so no character is short of what
 *   its tier promises; never more, so nothing is authored that no amount of ascending could reach.
 * - **The ultimate first, then the ordinary skills in the order they unlock.** The list order *is*
 *   the progression — second entry at `elite`, third at `legendary`, fourth at `ascended` — so
 *   reading a kit top to bottom reads what the player gets and when.
 *
 * Selection order is unaffected by either: `core/battle/content.ts` sorts a kit by descending
 * `priority` before a fight, so where a skill sits in this list decides when it is *earned* and
 * never when it is *used*.
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
 * - **Humans** — versatile and dependable, the control the others are read against. Wren is still
 *   the cheapest sustain in the game and the only character who heals and cleanses on one common-
 *   tier body, but "the one mortal faction with both" stopped being true in 8e and stopped being
 *   the point: Angels are the natural support and they walk the luck-only ladder, so what matters
 *   is that sustain is buyable without a banner, and now it is buyable in every faction.
 * - **Dwarves** — DEF and attrition: `recovery`, `healthRegen` and a `critBlock` that keeps a
 *   wall from folding to one lucky spike. Cannot close a fight; can refuse to lose one — which
 *   was a niche next to four other factions and a ceiling once five of them stood together, so
 *   Hedda is authored as the exception that closes.
 * - **Elves** — haste, attack speed, crit and **reach**. Made of paper, and the first answer
 *   to a back rank. The only faction authored with `attackSpeed`, which is what that stat was
 *   separated from haste to express.
 * - **Undead** — enormous HP, almost no DEF, and every kit built on `drain`. They used to buy
 *   their best turns with their own life; since 8b they are paid in energy for having been hit
 *   and take the life back out of whatever hit them. The lowest `energyRegen` outside the
 *   Monsters, because being in the fight is their meter. A siphon only ever pays its caster, so
 *   Vesper carries the one heal five of them can point at each other.
 * - **Monsters** — raw ATK and penetration. The answer to armour, given the damage curve.
 *   Deliberately the shortest stat blocks in the file: a faction with nothing but a number is a
 *   faction that says what it is. **The only faction 8e did not give a healer**, on exactly that
 *   argument — they sustain through `lifeLeech` and a siphon or they do not sustain.
 * - **Angels** — consistency and sustain. High DEF, low or no crit, the highest `energyRegen` in
 *   the game, and the only holders of `receivedHealing` and `critDamageResist`: the faction that
 *   answers a spike, and the one whose answer is ready whether or not the fight has gone badly.
 *   Three healers made a mono-Angel five a fight nobody could finish, which is what Nael, Ilyra
 *   and Zaphiel are for.
 * - **Demons** — magical damage and pure variance. Ignore armour entirely; die to anything —
 *   except Threx, who is authored to be hit, because five bodies averaging 440 HP have no front
 *   rank and a gate protects nobody when everyone is behind it.
 *
 * ## Seven per faction, and only two of the three tiers are closed
 *
 * Since milestone 8e every faction fields **three common, three legendary and one ascended**, and
 * `characters.spec.ts` asserts the first two exactly and the third as a floor. The bench is fixed
 * because it is what a mono-faction five is built from and what the mortal ladder eats as fodder;
 * the ascended tier is open because that is the tier new content arrives at.
 *
 * What that budget bought, beyond the count: every faction now owns an answer to health and an
 * answer to a back rank **in its own idiom**. Those are the two things a party cannot substitute
 * for — a formation with no reach cannot select a protected healer at all — and a lineup bonus
 * that pays for mono-faction play is a trap rather than a decision until both exist seven times
 * over.
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
  role: 'brawler',
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
  skills: [GUARD_BREAK, SECOND_WIND],
} as const;

/** Mira with the edges filed sharper: a little faster, a little more likely to spike, and the
 * first character most runs own who can buy the whole party a turn's worth of damage. */
export const SEREN = {
  id: 'seren',
  name: 'Seren the Oathbound',
  faction: 'human',
  tier: 'legendary',
  role: 'brawler',
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
  skills: [OATH_OF_ARMS, SWORN_STRIKE, POMMEL_STRIKE],
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
  skills: [MARSHALS_CALL, DECISIVE_STRIKE, HOLD_THE_LINE, SWEEPING_COMMAND],
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
  role: 'support',
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
  skills: [FIELD_DRESSING, TRIAGE],
} as const;

/**
 * The Human wall, and the body a mono-Human five was missing.
 *
 * Humans had four characters and no tank: two bruisers, a healer and a support, which is a party
 * that fights well and has nothing to fight from behind. He is the front rank, and he is a Human
 * one rather than a Dwarven one — 700 HP where Bran has 940, and an absorb pool instead of the
 * armour stack, so he blunts a spike rather than refusing one.
 */
export const HALRIC = {
  id: 'halric',
  name: 'Halric Shieldsworn',
  faction: 'human',
  tier: 'common',
  role: 'tank',
  stats: {
    hp: 700,
    atk: 42,
    def: 30,
    recovery: 5,
    haste: 88,
    critChance: 0.09,
    critDamageAmp: 0.55,
    critBlock: 0.04,
    energyRegen: 10,
    physicalResist: 0.06,
  },
  skills: [SHIELDSWORN_OATH, BRACING_BLOW],
} as const;

/** The Human answer to a back rank, and the first one in the game that is not an Elf. Slower than
 * Rin, tougher than Rin, and the reason a Human party can fight a formation without borrowing
 * one. */
export const YSOLDE = {
  id: 'ysolde',
  name: 'Ysolde Truesight',
  faction: 'human',
  tier: 'legendary',
  role: 'ranger',
  stats: {
    hp: 505,
    atk: 57,
    def: 21,
    recovery: 4,
    haste: 108,
    attackSpeed: 10,
    critChance: 0.2,
    critDamageAmp: 0.75,
    energyRegen: 9,
    accuracy: 1.08,
  },
  skills: [TRUESIGHT_VOLLEY, MARKED_QUARRY, LOOSE_THE_FLIGHT],
} as const;

/** The Human closer. Sharper than Seren on every offensive axis and thinner everywhere else,
 * which is the sidegrade the two of them are: one holds a line, one ends a fight. */
export const IVO = {
  id: 'ivo',
  name: 'Ivo Blacklance',
  faction: 'human',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 530,
    atk: 59,
    def: 23,
    recovery: 4,
    haste: 112,
    critChance: 0.24,
    critDamageAmp: 0.85,
    energyRegen: 8,
    dodge: 0.06,
  },
  skills: [BLACKLANCE_THRUST, RIPOSTE, DUELISTS_READ],
} as const;

/**
 * The Human who spends a turn on where the damage goes rather than on how much of it there is.
 *
 * The Ninth's battle-magus — Wren's field surgeon and Aurelia's marshal are the other two the unit
 * is remembered for — and the roster's first caster who is not a Demon, an Angel, an Elf or a
 * corpse. What he brings is not the damage: it is {@link CHAINWARD}, the first turn the party has
 * ever taken that puts a milestone-17 status on its **own** side of the board.
 *
 * Authored as control rather than as damage on purpose, and the budget shows it — 60 `atk` is the
 * middle of the ascended tier and the second lowest health of the seven Humans. A caster who was
 * also the faction's best damage would make Ivo and Ysolde decisions nobody has to make.
 */
export const CORVANE = {
  id: 'corvane',
  name: 'Corvane, the Sworn Word',
  faction: 'human',
  tier: 'ascended',
  role: 'mage',
  stats: {
    hp: 560,
    atk: 60,
    def: 24,
    recovery: 5,
    haste: 98,
    critChance: 0.11,
    critDamageAmp: 0.6,
    energyRegen: 11,
    magicPierce: 0.12,
    magicResist: 0.05,
  },
  skills: [CHAINWARD, BLUNT_THE_EDGE, SENDING, THE_NINTH_HOLDS],
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
  skills: [SHIELD_WALL, IRON_REBUKE],
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
  skills: [ANVIL_STANCE, HAMMER_CHECK, FORGELIGHT_VIGIL],
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
  skills: [DEEP_WARD, GROUND_SLAM, DEEPSTONE_GRASP, WARD_UNBROKEN],
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
  skills: [STOUT_WARD, SALTBEARD_REMEDY],
} as const;

/**
 * The Dwarven healer, and the second mortal one.
 *
 * Dorn cleanses and Korrin regenerates, which between them cover a debuff wave and a long grind
 * and neither of which pulls anybody back from the edge. She does — and she does it worse than
 * Wren per point, because every restoration in the game prices against `atk` and hers is a
 * Dwarf's. What she has instead is a body: 760 HP behind 29 DEF, standing in a rank a Human
 * healer would not survive.
 */
export const GRIMNA = {
  id: 'grimna',
  name: 'Grimna Coalsong',
  faction: 'dwarf',
  tier: 'common',
  role: 'support',
  stats: {
    hp: 760,
    atk: 41,
    def: 29,
    recovery: 8,
    haste: 80,
    critChance: 0.05,
    critDamageAmp: 0.5,
    critBlock: 0.04,
    energyRegen: 12,
    healthRegen: 0.25,
  },
  skills: [COALSONG, QUENCHING_DRAUGHT],
} as const;

/**
 * The Dwarf who can finish a fight, and the softest one authored.
 *
 * Every other Dwarf trades attack for defence and the faction is defined by how far it takes
 * that; she is the one who trades back. 46 ATK and 15% armour penetration is not a lot next to a
 * Monster, and next to Korrin it is transformative — a mono-Dwarf five with her in it wins on
 * points instead of running the clock out.
 */
export const HEDDA = {
  id: 'hedda',
  name: 'Hedda Grudgebearer',
  faction: 'dwarf',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 880,
    atk: 46,
    def: 33,
    recovery: 7,
    haste: 78,
    critChance: 0.08,
    critDamageAmp: 0.6,
    critBlock: 0.05,
    energyRegen: 8,
    physicalPierce: 0.15,
    physicalResist: 0.08,
    healthRegen: 0.15,
  },
  skills: [GRUDGE_SETTLED, RUNE_STRUCK, STOKE_THE_GRUDGE],
} as const;

/**
 * The Dwarven answer to a back rank: a hurled anvil, which is the least elegant reach in the game
 * and the only one attached to 830 HP. Slowest character in the faction outside Thraun.
 *
 * He and Hedda are the faction's two legendaries and they are read against each other. She is
 * bigger, faster and harder-hitting on every axis but one — his `recovery`, which is the axis the
 * faction was built on and the reason she does not simply replace him. What he sells is reach and
 * patience; what she sells is the kill.
 */
export const ORIN = {
  id: 'orin',
  name: 'Orin Deepvein',
  faction: 'dwarf',
  tier: 'legendary',
  role: 'ranger',
  stats: {
    hp: 830,
    atk: 44,
    def: 31,
    recovery: 9,
    haste: 74,
    critChance: 0.06,
    critDamageAmp: 0.55,
    critBlock: 0.05,
    energyRegen: 11,
    tenacity: 0.12,
    physicalResist: 0.1,
    healthRegen: 0.2,
  },
  skills: [HURLED_ANVIL, CAVERN_ECHO, PIT_PROPS],
} as const;

/**
 * The Dwarf who makes the wall's patience worth something, without making the wall an attacker.
 *
 * Hedda was the faction's first answer to "cannot close a fight", and she is an exception paid for
 * by being less of a Dwarf — 200 budget spent forward instead of down. He is the other route: the
 * thorns he lays over the party return a quarter of what reaches it, so the attrition the faction
 * was already winning starts having a number attached. He is still a terrible attacker. He simply
 * stops being one whose party runs the clock out.
 *
 * The healthiest non-tank in the file at 900 and the slowest character outside Thraun and Vharok,
 * which is what pays for it.
 */
export const VURN = {
  id: 'vurn',
  name: 'Vurn Runewright',
  faction: 'dwarf',
  tier: 'ascended',
  role: 'mage',
  stats: {
    hp: 900,
    atk: 40,
    def: 38,
    recovery: 9,
    haste: 72,
    critChance: 0.05,
    critDamageAmp: 0.5,
    critBlock: 0.06,
    energyRegen: 11,
    magicResist: 0.1,
    healthRegen: 0.2,
  },
  skills: [RUNES_OF_RETURN, GRUDGEFIRE, WARDSTONE, SUNKEN_RUNE],
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
  skills: [PIERCING_SHOT, SNARE_ARROW],
} as const;

/** Gives up HP for tempo. Acts roughly a third more often than Rin and dies to roughly a third
 * less. */
export const LYSHA = {
  id: 'lysha',
  name: 'Lysha Windstep',
  faction: 'elf',
  tier: 'legendary',
  role: 'brawler',
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
  skills: [THROAT_CUT, WINDSTEP, NIGHTREACH],
} as const;

/** The fastest thing authored and the softest. Acts nearly three times for every two turns a
 * human takes, loses outright to anything that reaches him twice, and is the only character who
 * can reliably delete a back rank on his own. */
export const AELRINDEL = {
  id: 'aelrindel',
  name: 'Aelrindel, First Arrow',
  faction: 'elf',
  tier: 'ascended',
  role: 'ranger',
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
  skills: [FIRST_ARROW, VOLLEY, SPLITTING_SHAFT, ARROW_OF_ENDING],
} as const;

/** The Elven healer: small heals, cast constantly. At 112 haste she gets roughly four turns for
 * every three a Human healer takes, which is the faction's argument applied to keeping people
 * alive — and it answers a grind far better than it answers one enormous hit. */
export const FAELEN = {
  id: 'faelen',
  name: 'Faelen',
  faction: 'elf',
  tier: 'common',
  role: 'support',
  stats: {
    hp: 455,
    atk: 50,
    def: 16,
    recovery: 3,
    haste: 112,
    critChance: 0.14,
    critDamageAmp: 0.6,
    energyRegen: 12,
    magicResist: 0.05,
  },
  skills: [SYLVAN_REFRAIN, WINDWOVEN_BALM],
} as const;

/**
 * The only Elf who can stand in a front rank, and he pays for it in the stat the faction is for.
 *
 * 560 HP behind 22 DEF is unremarkable anywhere else and is a wall by Elven standards — Rin has
 * 430 and Aelrindel 350. What it costs is tempo: at 104 haste and 8 points of attack speed he is
 * the slowest Elf authored, roughly two turns for every three Lysha takes. A body, bought with
 * the faction's own currency.
 */
export const CIRIEN = {
  id: 'cirien',
  name: 'Cirien',
  faction: 'elf',
  tier: 'common',
  role: 'brawler',
  stats: {
    hp: 560,
    atk: 55,
    def: 22,
    recovery: 3,
    haste: 104,
    attackSpeed: 8,
    critChance: 0.16,
    critDamageAmp: 0.65,
    energyRegen: 8,
    dodge: 0.06,
    accuracy: 1.05,
  },
  skills: [THORNGUARD, CUT_THE_VANGUARD],
} as const;

/** The Elven controller. No reach and no execution — what he sells is the whole enemy side
 * acting a third less often, which against a wide wave is worth more than either. */
export const NAERIN = {
  id: 'naerin',
  name: 'Naerin Duskweaver',
  faction: 'elf',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 415,
    atk: 61,
    def: 14,
    haste: 126,
    attackSpeed: 14,
    critChance: 0.24,
    critDamageAmp: 0.8,
    energyRegen: 9,
    magicResist: 0.06,
    dodge: 0.09,
  },
  skills: [DUSKWEAVE, FADESHOT, WITHERING_GAZE],
} as const;

/** Aelrindel's reach a tier down: most of the range, none of the armour penetration, and a body
 * that survives being reached slightly longer than his does. */
export const SYLVARA = {
  id: 'sylvara',
  name: 'Sylvara Sunspear',
  faction: 'elf',
  tier: 'legendary',
  role: 'ranger',
  stats: {
    hp: 445,
    atk: 63,
    def: 16,
    haste: 120,
    attackSpeed: 20,
    critChance: 0.27,
    critDamageAmp: 0.82,
    energyRegen: 8,
    physicalPierce: 0.12,
    accuracy: 1.12,
  },
  skills: [SUNSPEAR_CAST, PINNING_SHOT, QUIVER_UNSLUNG],
} as const;

/**
 * An Elven front rank that works by not being hit, which is the only kind this faction could ever
 * have.
 *
 * Cirien is the stopgap version — a body bought with tempo, and still the slowest Elf authored.
 * Maelis is the real answer, and he is a tank in the way an Elf is allowed to be one: 620 HP is
 * under every other tank in the game, and the 0.2 `dodge` is the highest anything carries. What he
 * spends turns on is {@link STAND_AND_BE_SEEN}, which drags every single-target attack on the
 * board onto the one body most likely to be missed.
 *
 * ⚠️ **The taunt is an ordinary skill and can never be his ultimate**, because
 * `skills.spec.ts` requires the cooldown to outlast the status and an ultimate carries no
 * cooldown at all. Worth knowing before authoring the obvious version of this character.
 */
export const MAELIS = {
  id: 'maelis',
  name: 'Maelis, the Warded Bough',
  faction: 'elf',
  tier: 'ascended',
  role: 'tank',
  stats: {
    hp: 620,
    atk: 44,
    def: 26,
    recovery: 6,
    haste: 106,
    attackSpeed: 6,
    critChance: 0.14,
    critDamageAmp: 0.6,
    critBlock: 0.05,
    energyRegen: 11,
    physicalResist: 0.05,
    dodge: 0.2,
  },
  skills: [SUNLIT_BOUGH, STAND_AND_BE_SEEN, BRAMBLECUT, ROOT_AND_BOUGH],
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
  role: 'brawler',
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
  skills: [GRAVE_GRASP, CARRION_FEAST],
} as const;

/** More of Mortlach, with the armour stripped further and a magical drain bought with his own
 * blood — which wins against a Dwarf and loses badly against an Angel. */
export const SABLE = {
  id: 'sable',
  name: 'Sable, the Unquiet',
  faction: 'undead',
  tier: 'legendary',
  role: 'brawler',
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
  skills: [BLOOD_PACT, GRAVE_CHILL, UNQUIET_HUNGER],
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
  skills: [GRAVE_TIDE, SOUL_SIPHON, SOVEREIGNS_TOLL, SOUL_TITHE],
} as const;

/** The largest common-tier body in the game and the slowest, with 13 DEF holding it up. Against a
 * wide wave he is close to unkillable and against one big hit he is a Dwarf-sized target with no
 * Dwarf attached. */
export const GHAUL = {
  id: 'ghaul',
  name: 'Ghaul the Bloated',
  faction: 'undead',
  tier: 'common',
  role: 'tank',
  stats: {
    hp: 1000,
    atk: 34,
    def: 13,
    recovery: 11,
    haste: 68,
    critChance: 0.04,
    critDamageAmp: 0.5,
    energyRegen: 6,
    lifeLeech: 0.06,
    physicalResist: 0.05,
  },
  skills: [BLOATBURST, GRASPING_ROT],
} as const;

/**
 * The first Undead who can heal somebody who is not herself.
 *
 * Drain pays its caster and nobody else, which made a mono-Undead five into five parallel solo
 * runs — every member sustaining itself while the one actually dying got nothing. She is the fix,
 * authored as small as the fix can be: less health per cast than any dedicated healer, on the
 * lowest DEF in the faction, and she still has to spend her ultimate on blunting a rank.
 */
export const VESPER = {
  id: 'vesper',
  name: 'Vesper Hollowbind',
  faction: 'undead',
  tier: 'common',
  role: 'support',
  stats: {
    hp: 720,
    atk: 43,
    def: 10,
    recovery: 8,
    haste: 90,
    critChance: 0.07,
    critDamageAmp: 0.55,
    energyRegen: 8,
    lifeLeech: 0.06,
    magicResist: 0.04,
  },
  skills: [HOLLOWBIND, GRAVECALL],
} as const;

/** The Undead answer to a back rank, and the only siphon in the game that reaches past a gate.
 * Everything he takes he takes from somewhere the front rank cannot protect. */
export const OSSUARY = {
  id: 'ossuary',
  name: 'Ossuary, the Nine-Bound',
  faction: 'undead',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 940,
    atk: 47,
    def: 9,
    recovery: 13,
    haste: 86,
    critChance: 0.07,
    critDamageAmp: 0.55,
    energyRegen: 7,
    lifeLeech: 0.09,
    magicPierce: 0.12,
  },
  skills: [OSSUARY_TIDE, MARROW_DRAW, BONE_CHOIR],
} as const;

/** Attrition pointed outwards. Two damage-over-time statuses and one drain, on a body slow enough
 * that everything he applies outlives the turn he spent applying it — the Dwarven bargain with
 * the sign flipped. */
export const KARSITH = {
  id: 'karsith',
  name: 'Karsith the Rotcrown',
  faction: 'undead',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 960,
    atk: 49,
    def: 7,
    recovery: 14,
    haste: 92,
    critChance: 0.09,
    critDamageAmp: 0.6,
    energyRegen: 6,
    lifeLeech: 0.1,
    physicalResist: 0.02,
  },
  skills: [CROWN_OF_FLIES, FESTER, FEAST_ON_RUIN],
} as const;

/**
 * The Undead archer, and the first one of them that can take life from something it cannot reach
 * with its hands.
 *
 * Every Undead siphons — it is the whole faction — and until now the reach and the siphon were on
 * different bodies: Nekros pays nobody with his wave, and Vesper is the one heal five of them can
 * point at each other. A drain aimed over a front rank is both at once.
 *
 * 880 HP on 9 `def`, which is the faction bargain stated as plainly as it goes: he has the second
 * largest health pool among the Undead and the second thinnest armour in the game.
 */
export const CARROW = {
  id: 'carrow',
  name: 'Carrow, the Last Fletcher',
  faction: 'undead',
  tier: 'ascended',
  role: 'ranger',
  stats: {
    hp: 880,
    atk: 54,
    def: 9,
    recovery: 12,
    haste: 100,
    attackSpeed: 8,
    critChance: 0.16,
    critDamageAmp: 0.7,
    energyRegen: 7,
    lifeLeech: 0.12,
    physicalPierce: 0.15,
  },
  skills: [THE_LAST_VOLLEY, BONEWHISTLE, BONESHOT, THE_QUIET_FIELD],
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
  role: 'brawler',
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
  skills: [REND, MAUL],
} as const;

/** Slower and harder still, and the first character with real armour penetration. Nearly never
 * crits, which makes his damage boringly predictable — and predictability is exactly what a DEF
 * check wants. */
export const RUK = {
  id: 'ruk',
  name: 'Ruk the Mountain-Eater',
  faction: 'monster',
  tier: 'legendary',
  role: 'brawler',
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
  skills: [MOUNTAIN_BREAKER, SUNDER_STONE, AVALANCHE],
} as const;

/** The highest ATK authored, on the slowest body that is not a Dwarf, ignoring a third of
 * whatever armour it meets. Against the diminishing DEF curve one enormous hit is worth several
 * small ones, which is his entire argument. */
export const VHAROK = {
  id: 'vharok',
  name: "Vharok, World's Maw",
  faction: 'monster',
  tier: 'ascended',
  role: 'brawler',
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
  skills: [WORLDS_MAW, DEVOUR, GORGE, DEVOURING_TIDE],
} as const;

/** A Monster with armour on, which is the whole of the concession. He still cannot buff, heal,
 * cleanse or reach; he simply survives being the thing in front, and he is the slowest common-tier
 * character in the game for it. */
export const SKARN = {
  id: 'skarn',
  name: 'Skarn',
  faction: 'monster',
  tier: 'common',
  role: 'tank',
  stats: {
    hp: 800,
    atk: 46,
    def: 20,
    haste: 66,
    critChance: 0.03,
    critDamageAmp: 0.55,
    energyRegen: 5,
    physicalResist: 0.08,
  },
  skills: [BONEBREAK, THICK_HIDE],
} as const;

/**
 * The Monster answer to sustain, and it is deliberately not a healer.
 *
 * Every other faction was given something that puts health back on somebody else; the Monsters
 * were given `lifeLeech` and a siphon, because handing this faction a support would have solved a
 * composition problem by deleting the thing being composed. A mono-Monster five sustains by
 * winning the exchange, and if it stops winning the exchange it has nothing at all.
 */
export const YERRIK = {
  id: 'yerrik',
  name: 'Yerrik',
  faction: 'monster',
  tier: 'common',
  role: 'brawler',
  stats: {
    hp: 660,
    atk: 54,
    def: 15,
    haste: 80,
    critChance: 0.06,
    critDamageAmp: 0.6,
    energyRegen: 5,
    lifeLeech: 0.12,
    physicalPierce: 0.1,
  },
  skills: [BLOOD_GORGE, RAGGED_SWIPE],
} as const;

/**
 * The first Monster that gets past a front rank, and the last faction to be given reach at all.
 *
 * Against a protected healer a party with no back-rank answer does not lose narrowly — it cannot
 * select the target, so no amount of ATK closes the fight. He answers it by running through the
 * gate rather than shooting over it, which is why his reach is wide, blunt, and nowhere near as
 * precise as the shot an Elf takes.
 */
export const GHORRAK = {
  id: 'ghorrak',
  name: 'Ghorrak the Sunderjaw',
  faction: 'monster',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 730,
    atk: 65,
    def: 13,
    haste: 72,
    critChance: 0.04,
    critDamageAmp: 0.7,
    energyRegen: 5,
    insight: 0.08,
    physicalPierce: 0.28,
  },
  skills: [TRAMPLE, SUNDERJAW, BREAK_THE_HERD],
} as const;

/** The heaviest siphon in the game on the heaviest legendary-tier Monster. He is what happens
 * when the faction's one idea — take what you need out of whatever is in front of you — is given
 * a health pool to do it from. */
export const OZZA = {
  id: 'ozza',
  name: 'Ozza Ninefang',
  faction: 'monster',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 840,
    atk: 60,
    def: 12,
    recovery: 6,
    haste: 76,
    critChance: 0.05,
    critDamageAmp: 0.65,
    energyRegen: 5,
    lifeLeech: 0.15,
    physicalPierce: 0.18,
    physicalResist: 0.04,
  },
  skills: [NINEFANG_FEAST, GNASHING_TIDE, MARROW_CRUNCH],
} as const;

/**
 * The faction's argument, made in the other damage type.
 *
 * Monsters are the answer to armour: raw output and enough penetration that `def` stops meaning
 * what it says. All six of the others make that case physically, which leaves the faction with
 * nothing at all to say to a `physicalResist` wall — and the celestial chapters are full of them.
 * Vrakk carries the highest `magicPierce` in the game and says it again.
 *
 * Still a Monster in every other respect, which is the point rather than a concession: no buff, no
 * cleanse, no heal, and the sustain is a siphon because the faction has no support and is not
 * getting one.
 */
export const VRAKK = {
  id: 'vrakk',
  name: 'Vrakk, the Bile Throat',
  faction: 'monster',
  tier: 'ascended',
  role: 'mage',
  stats: {
    hp: 720,
    atk: 68,
    def: 13,
    haste: 78,
    critChance: 0.04,
    critDamageAmp: 0.75,
    energyRegen: 6,
    lifeLeech: 0.1,
    magicPierce: 0.35,
    magicResist: 0.04,
  },
  skills: [CORROSION, BILESPRAY, GULLET, ACID_WIND],
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
  role: 'support',
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
  skills: [CHOIRLIGHT, SOOTHING_VERSE],
} as const;

/** More wall, less luck, and the deepest cleanse in the game. */
export const ITHURIEL = {
  id: 'ithuriel',
  name: 'Ithuriel, Verse of Dawn',
  faction: 'angel',
  tier: 'legendary',
  role: 'support',
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
  skills: [VERSE_OF_DAWN, ABSOLUTION, DAWNWARD],
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
  role: 'support',
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
  skills: [UNWAVERING_LIGHT, AEGIS_SKILL, VIGIL, JUDGEMENT],
} as const;

/**
 * The Angel who holds a rank rather than healing the person in it.
 *
 * The faction was three healers, which is a party that cannot die and cannot win — the exact
 * ninety-second timeout the balance sweep exists to catch. He is half the answer, and the sweep
 * is also why his numbers are where they are rather than higher: **a wall added to a faction that
 * already refuses to die makes the stall worse, not better.** He was authored at 38 DEF behind
 * 8% physical resist, and a mono-Angel five carrying that stalled stage 18 outright. What holds a
 * rank here is the party-wide armour buff he casts, not the armour he wears.
 */
export const NAEL = {
  id: 'nael',
  name: 'Nael of the Fifth Choir',
  faction: 'angel',
  tier: 'common',
  role: 'tank',
  stats: {
    hp: 760,
    atk: 42,
    def: 35,
    recovery: 5,
    haste: 82,
    critChance: 0.02,
    critDamageAmp: 0.4,
    critDamageResist: 0.18,
    energyRegen: 12,
    physicalResist: 0.04,
  },
  skills: [SANCTUARY, WARDING_STRIKE],
} as const;

/** The other half: the first Angel authored to kill something. Magical, like everything the
 * faction does, and reaching past a front rank, which no Angel could before. */
export const ILYRA = {
  id: 'ilyra',
  name: 'Ilyra Lightspear',
  faction: 'angel',
  tier: 'common',
  role: 'mage',
  stats: {
    hp: 620,
    atk: 52,
    def: 30,
    recovery: 4,
    haste: 92,
    critChance: 0.03,
    critDamageAmp: 0.45,
    critDamageResist: 0.1,
    energyRegen: 12,
    magicResist: 0.06,
  },
  skills: [LIGHTSPEAR, KINDLED_WORD],
} as const;

/** Angelic damage at legendary tier, and the faction's only debuffer. He does not out-damage a
 * Demon and never will; what he does is take the biggest thing on the field down a third of its
 * attack while hitting it, which is a support's instinct with a weapon in it. */
export const ZAPHIEL = {
  id: 'zaphiel',
  name: 'Zaphiel, the Even Hand',
  faction: 'angel',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 660,
    atk: 55,
    def: 36,
    recovery: 5,
    haste: 90,
    critChance: 0.02,
    critDamageAmp: 0.4,
    critDamageResist: 0.15,
    energyRegen: 13,
    magicPierce: 0.12,
    magicResist: 0.06,
  },
  skills: [EVEN_HAND, WEIGHED_AND_FOUND, LEVEL_GROUND],
} as const;

/**
 * The only combatant in the game who shields himself and nobody else. A fixed absorb pool spread
 * five ways is a badge; spent on one body in a front rank it is a wall.
 *
 * **He is a durable attacker rather than a second wall, and that was a correction.** Authored at
 * 45 DEF and 51 ATK he was Nael again with better numbers, and a mono-Angel five fielding both of
 * them took seventy-six seconds to lose a fight it never had a chance in — the sustain faction
 * given two more reasons not to die and none to kill. His attack now sits above Zaphiel's and his
 * armour below Ithuriel's, so what he sells is the absorb pool and the tempo he takes away.
 */
export const RAZIEL = {
  id: 'raziel',
  name: 'Raziel, Keeper of the Gate',
  faction: 'angel',
  tier: 'legendary',
  role: 'tank',
  stats: {
    hp: 790,
    atk: 56,
    def: 38,
    recovery: 8,
    haste: 84,
    critChance: 0.01,
    critDamageAmp: 0.35,
    critDamageResist: 0.18,
    critBlock: 0.06,
    energyRegen: 13,
    tenacity: 0.18,
    physicalResist: 0.05,
  },
  skills: [KEEPERS_CHARGE, GATEBREAKERS_ANSWER, UNYIELDING],
} as const;

/**
 * The Angel who ends fights, and the second half of an answer this faction has been owed since
 * milestone 8e.
 *
 * Three healers made a mono-Angel five a fight nobody could finish — a ninety-second timeout, which
 * is a **defeat**. Nael and Raziel were the first half: a wall, so the healers had something to
 * heal. Cassiel is the other half and the opposite kind of body. **Nothing in his kit restores
 * anything** — no heal, no shield, no cleanse, no regeneration — which makes him the only Angel in
 * the game that is true of.
 *
 * 66 `atk` is the highest an Angel carries by ten points, and the 0.25 `receivedHealing` is what he
 * is really built around: he is the one the other four keep standing, and he is worth 25% more of
 * every point they spend doing it.
 */
export const CASSIEL = {
  id: 'cassiel',
  name: 'Cassiel, the Drawn Sword',
  faction: 'angel',
  tier: 'ascended',
  role: 'brawler',
  stats: {
    hp: 700,
    atk: 66,
    def: 32,
    recovery: 7,
    haste: 100,
    critChance: 0.1,
    critDamageAmp: 0.8,
    critDamageResist: 0.1,
    energyRegen: 12,
    tenacity: 0.15,
    receivedHealing: 0.25,
  },
  skills: [THE_DRAWN_SWORD, SENTENCE, BLADE_OF_THE_CHOIR, ANSWERED_IN_KIND],
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
  skills: [EMBERBURST, CINDERLASH],
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
  skills: [GAMBLERS_CUT, HEXFIRE, DOUBLE_OR_NOTHING],
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
  skills: [UNMAKING, RUIN_UNBOUND, ENTROPY, LONG_SILENCE],
} as const;

/** A Demon who takes back some of what she burns. Not a healer and not close to one — the siphon
 * pays her alone — but it is the difference between a caster who dies to attrition and one who
 * merely dies to a spike. */
export const VEXIS = {
  id: 'vexis',
  name: 'Vexis',
  faction: 'demon',
  tier: 'common',
  role: 'mage',
  stats: {
    hp: 500,
    atk: 52,
    def: 16,
    haste: 96,
    critChance: 0.2,
    critDamageAmp: 0.85,
    energyRegen: 9,
    lifeLeech: 0.1,
    magicResist: 0.04,
  },
  skills: [SINSONG, WICKERBURN],
} as const;

/**
 * The Demon with enough health to be hit, which none of the others have.
 *
 * "Ignore armour entirely; die to anything" made a mono-Demon five unfieldable rather than
 * fragile: five bodies averaging 440 HP have no front rank, and a gate that protects a back rank
 * protects nobody when everyone is standing behind it. He is the exception and he pays for it in
 * the stat the faction is named for — 0.18 crit chance, the lowest any Demon carries.
 */
export const THREX = {
  id: 'threx',
  name: 'Threx the Bound',
  faction: 'demon',
  tier: 'common',
  role: 'brawler',
  stats: {
    hp: 640,
    atk: 48,
    def: 24,
    recovery: 4,
    haste: 88,
    critChance: 0.18,
    critDamageAmp: 0.8,
    energyRegen: 8,
    magicPierce: 0.1,
    magicResist: 0.05,
  },
  skills: [CHAINBREAK, IRONS_BROKEN],
} as const;

/** Malakar's variance spread across the whole enemy side instead of concentrated on one of it.
 * The fastest Demon short of Azrathoth, and the only one who opens a fight by setting all five
 * opponents alight. */
export const NYXARA = {
  id: 'nyxara',
  name: 'Nyxara, the Third Whisper',
  faction: 'demon',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 460,
    atk: 60,
    def: 15,
    haste: 112,
    critChance: 0.32,
    critDamageAmp: 1.05,
    energyRegen: 8,
    magicPierce: 0.15,
    magicResist: 0.04,
    dodge: 0.07,
  },
  skills: [THIRD_WHISPER, HEX_THE_HEARTH, WHISPERED_BARGAIN],
} as const;

/**
 * The Demon healer, and the reason a run that pulled Demons and no Angels is not stranded.
 *
 * Wren and Dorn exist because healing is an Angel's job and Angels ascend on copies of themselves
 * alone. The same argument applies *inside* the celestial pair, and nobody had made it: a player
 * whose luck ran to Demons had no sustain at any price either. She is smaller per cast than every
 * Angel and attached to a body that crits a quarter of the time, which is the trade.
 *
 * **"Smaller per cast" had to be made true rather than asserted**, and the sweep is what caught
 * it. Restoration prices against `atk` and hers is a Demon's, so `Red Tithe` at its first
 * authored power healed *more* than Celia's ultimate while the comment above claimed the
 * opposite — and a mono-Demon five carrying it out-sustained stage 18 into a ninety-second
 * timeout nine times in twenty-four. At 1.15 against 56 attack she restores about 64 where Celia
 * restores 75, which is what the paragraph always said she did. Her `energyRegen` came down with
 * it: a Demon should reach its ultimate by fighting, not by waiting.
 */
export const SANGUINE = {
  id: 'sanguine',
  name: 'Sanguine, the Red Tithe',
  faction: 'demon',
  tier: 'legendary',
  role: 'support',
  stats: {
    hp: 545,
    atk: 56,
    def: 18,
    recovery: 5,
    haste: 100,
    critChance: 0.26,
    critDamageAmp: 0.9,
    energyRegen: 8,
    lifeLeech: 0.12,
    magicResist: 0.05,
  },
  skills: [RED_TITHE, TITHE_COLLECTED, CRIMSON_SIGIL],
} as const;

/**
 * The Demon who does not need the fight to be over yet.
 *
 * Demons are magical damage and pure variance — Azrathoth is nearly half his attacks landing for
 * 2.4×, and the faction has never once made a plan. Nazreth is the plan: a {@link SEEDED_SHAFT}
 * plants something that does **nothing at all** for forty ticks and then arrives in one piece, so
 * his whole kit is a bet on the fight lasting long enough to collect.
 *
 * The party's first bomb, and it asks the opposite question of every other turn in the roster: it
 * is worth most against the boards a party grinds down and worth nothing at all against the ones it
 * deletes. ⚠️ **Which is why his ultimate is aimed at the front rank and his seed at the largest
 * body** — a kit that pointed both at the same target would kill the thing carrying the payload,
 * and a payload that never goes off is a turn spent on nothing. See {@link SEEDED_SHAFT}, where
 * that was measured rather than assumed.
 */
export const NAZRETH = {
  id: 'nazreth',
  name: 'Nazreth, the Patient',
  faction: 'demon',
  tier: 'ascended',
  role: 'ranger',
  stats: {
    hp: 430,
    atk: 62,
    def: 12,
    haste: 120,
    attackSpeed: 8,
    critChance: 0.28,
    critDamageAmp: 1,
    energyRegen: 9,
    magicPierce: 0.22,
    magicResist: 0.04,
    dodge: 0.1,
  },
  skills: [THE_HEX_COMES_DUE, SEEDED_SHAFT, PATIENT_MALICE, THE_RECKONING],
} as const;

/**
 * Every playable character, in faction then tier order.
 *
 * This is the pull pool and the roster's source of truth. `characters.spec.ts` asserts ids are
 * unique, every faction fields exactly three common, exactly three legendary and at least one
 * ascended, every `faction` names a real one, and every kit points at a skill that exists.
 *
 * Forty-nine, and the banner needs no edit to include them: `BANNERS` in `banners.ts` carries an
 * empty `pool`, which means the whole roster. A rate-up banner would narrow it there.
 */
export const CHARACTERS = [
  MIRA,
  WREN,
  HALRIC,
  SEREN,
  YSOLDE,
  IVO,
  AURELIA,
  CORVANE,
  BRAN,
  DORN,
  GRIMNA,
  KORRIN,
  HEDDA,
  ORIN,
  THRAUN,
  VURN,
  RIN,
  FAELEN,
  CIRIEN,
  LYSHA,
  NAERIN,
  SYLVARA,
  AELRINDEL,
  MAELIS,
  MORTLACH,
  GHAUL,
  VESPER,
  SABLE,
  OSSUARY,
  KARSITH,
  NEKROS,
  CARROW,
  GNASH,
  SKARN,
  YERRIK,
  RUK,
  GHORRAK,
  OZZA,
  VHAROK,
  VRAKK,
  CELIA,
  NAEL,
  ILYRA,
  ITHURIEL,
  ZAPHIEL,
  RAZIEL,
  SERAPHINE,
  CASSIEL,
  PYRA,
  VEXIS,
  THREX,
  MALAKAR,
  NYXARA,
  SANGUINE,
  AZRATHOTH,
  NAZRETH,
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
