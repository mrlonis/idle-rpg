import {
  BULWARK,
  CINDER_STORM,
  CUTPURSE,
  FADE,
  GATE_SLAM,
  GLACIAL_SLAM,
  GORE,
  MEND,
  MIRE,
  MOTE_LANCE,
  SHIELD_BASH,
  STONE_FIST,
  WITHERHEX,
  WITHERING_TOUCH,
} from './skills';

/**
 * Enemy stat blocks and kits.
 *
 * Plain data: no functions, no imports outside `data/`. Quantities are numbers (or strings,
 * once a value outgrows float64) rather than `Numeric`, because constructing a `Numeric` would
 * mean importing `core/` — and content that cannot be expressed as plain JSON is content that
 * can never be loaded from a file. `core/battle/content.ts` parses these into the simulation's
 * types.
 *
 * ## What the stats mean
 *
 * - `spd` is ATB gauge gained per battle tick, against a threshold of 1000. So `spd: 100` acts
 *   once per 10 ticks, and a combatant at 200 genuinely takes twice as many turns as one at
 *   100 — speed is a real stat, not a tiebreak.
 * - Damage is `atk² / (atk + def)`, measured against `pdef` or `mdef` depending on the
 *   attack's type. DEF has diminishing returns and can never reduce a hit to zero, so a
 *   high-DEF enemy is a soft wall that punishes low ATK rather than a hard one that makes a
 *   fight unwinnable.
 * - Every basic attack is physical and targets the **front rank**, falling through to the back
 *   only once the front is empty.
 *
 * ## Design intent: these are locks, not rungs on a ladder
 *
 * Each archetype asks a different question of the party, which is how composition is meant to
 * matter — through enemy design rather than flat "+10% if two Fire units" synergies, which only
 * ever produce a new single optimal team.
 *
 * The six originals are the blunt versions: a body, a fast body, a wall, a hard hitter, an
 * armour check, a gate. The six added here are the sharp ones, and each names the answer it
 * wants:
 *
 * | Enemy         | The question                             | The answer                        |
 * | ------------- | ---------------------------------------- | --------------------------------- |
 * | Marsh Acolyte | can you reach a healer behind two bodies? | reach, or burst through the front |
 * | Bog Hag       | can you survive a party-wide debuff?      | a cleanse                         |
 * | Pyre Caster   | is any of your durability magical?        | `mdef`, a Ward, or killing it     |
 * | Iron Bulwark  | can you out-damage a refreshed absorb?    | burst, not chip                   |
 * | Rimeplate     | what do you do when both defences are up? | penetration, or Sunder            |
 * | Fen Shade     | what do you do when it dodges half of it? | accuracy, or volume               |
 *
 * ## Factions
 *
 * Every enemy has one, because the matchup matrix in `combat.ts` is read on every attack and a
 * faction is what indexes it. They are spread across all seven deliberately: a ladder whose
 * enemies were all Monsters would make the four mortal factions that beat Monsters strictly
 * correct and the rest of the matrix decoration.
 */

// ---------------------------------------------------------------------------------------
// The originals — blunt questions
// ---------------------------------------------------------------------------------------

/** Fodder. Establishes the baseline every other archetype is read against. */
export const SLIME = {
  id: 'slime',
  name: 'Slime',
  faction: 'monster',
  stats: {
    hp: 300,
    patk: 26,
    matk: 9,
    pdef: 7,
    mdef: 6,
    spd: 78,
    critChance: 0.03,
    critMultiplier: 1.5,
  },
} as const;

/** Fragile but very fast: asks whether the party can kill something before it acts four times.
 * A slow party bleeds to these even though each hit is trivial — and Mote Lance means standing
 * in the back rank is cover rather than immunity. */
export const WISP = {
  id: 'wisp',
  name: 'Wisp',
  faction: 'undead',
  stats: {
    hp: 230,
    patk: 24,
    matk: 32,
    pdef: 5,
    mdef: 8,
    spd: 148,
    critChance: 0.08,
    critMultiplier: 1.6,
  },
  skills: [MOTE_LANCE],
} as const;

/** A plain meat wall. Asks for sustained damage rather than a burst window. */
export const BOAR = {
  id: 'boar',
  name: 'Tusked Boar',
  faction: 'monster',
  stats: {
    hp: 760,
    patk: 45,
    matk: 13,
    pdef: 20,
    mdef: 13,
    spd: 84,
    critChance: 0.05,
    critMultiplier: 1.5,
  },
  skills: [GORE],
} as const;

/** Hits hard and often, and goes for the back rank when it can. Asks whether the party's
 * fragile damage dealer survives the opening. */
export const BANDIT = {
  id: 'bandit',
  name: 'Bandit',
  faction: 'human',
  stats: {
    hp: 620,
    patk: 56,
    matk: 16,
    pdef: 24,
    mdef: 19,
    spd: 106,
    critChance: 0.12,
    critMultiplier: 1.7,
  },
  skills: [CUTPURSE],
} as const;

/** Enormous physical DEF and HP, barely moves, and soft to magic. Because of the diminishing-
 * return damage curve this punishes a party of many small physical hits far more than a party
 * with one big one — or one spell. */
export const GOLEM = {
  id: 'golem',
  name: 'Stone Golem',
  faction: 'monster',
  stats: {
    hp: 2600,
    patk: 84,
    matk: 18,
    pdef: 98,
    mdef: 32,
    spd: 52,
    critChance: 0.02,
    critMultiplier: 2,
  },
  skills: [STONE_FIST],
} as const;

/** The gate at the end of the original content: high on every axis at once, and the first thing
 * in the game that takes a turn away. */
export const WARDEN = {
  id: 'warden',
  name: 'Gate Warden',
  faction: 'human',
  stats: {
    hp: 2100,
    patk: 92,
    matk: 48,
    pdef: 50,
    mdef: 46,
    spd: 98,
    critChance: 0.1,
    critMultiplier: 1.8,
    mp: 72,
    mpRegen: 4,
    effectHit: 0.1,
  },
  skills: [GATE_SLAM],
} as const;

// ---------------------------------------------------------------------------------------
// The locks — sharp questions
// ---------------------------------------------------------------------------------------

/**
 * The healer lock.
 *
 * Almost no HP and almost no armour, which is the whole design: an Acolyte is trivially easy to
 * kill and, standing behind two bodies, completely unreachable by an ordinary attack. The
 * encounter is not "beat a healer", it is "get to one".
 */
export const ACOLYTE = {
  id: 'acolyte',
  name: 'Marsh Acolyte',
  faction: 'human',
  stats: {
    hp: 700,
    patk: 26,
    matk: 96,
    pdef: 18,
    mdef: 32,
    spd: 92,
    critChance: 0.02,
    critMultiplier: 1.4,
    mp: 90,
    mpRegen: 6,
  },
  skills: [MEND],
} as const;

/**
 * The debuff lock.
 *
 * Weakens the whole party and slows the front rank, re-applying only once each has worn off —
 * so a cleanse genuinely costs it a cast rather than buying a few ticks. Survivable without an
 * answer; expensive.
 */
export const HAG = {
  id: 'hag',
  name: 'Bog Hag',
  faction: 'undead',
  stats: {
    hp: 1080,
    patk: 44,
    matk: 76,
    pdef: 26,
    mdef: 40,
    spd: 88,
    critChance: 0.04,
    critMultiplier: 1.5,
    mp: 80,
    mpRegen: 5,
    effectHit: 0.15,
  },
  skills: [WITHERHEX, MIRE],
} as const;

/**
 * The wide magical wave.
 *
 * Punishes a party that bought all of its durability as physical armour, which is the cheapest
 * durability in the game. Fragile on purpose: killing it is meant to be a real option for a
 * party that can reach it, so the encounter is a race rather than a wall.
 */
export const PYRE = {
  id: 'pyre',
  name: 'Pyre Caster',
  faction: 'demon',
  stats: {
    hp: 820,
    patk: 24,
    matk: 94,
    pdef: 18,
    mdef: 30,
    spd: 96,
    critChance: 0.1,
    critMultiplier: 1.8,
    mp: 78,
    mpRegen: 5,
  },
  skills: [CINDER_STORM],
} as const;

/**
 * The absorb lock.
 *
 * A barrier applied *before* the damage arrives cannot be raced by chip damage at all, which
 * makes this a different problem from a healer rather than a bigger one: the party needs burst,
 * or it needs to kill the Bulwark, and a party of many small hits can do neither.
 */
export const BULWARK_ENEMY = {
  id: 'bulwark',
  name: 'Iron Bulwark',
  faction: 'dwarf',
  stats: {
    hp: 1700,
    patk: 56,
    matk: 66,
    pdef: 68,
    mdef: 52,
    spd: 74,
    critChance: 0.03,
    critMultiplier: 1.5,
    mp: 80,
    mpRegen: 5,
    tenacity: 0.2,
  },
  skills: [BULWARK, SHIELD_BASH],
} as const;

/**
 * The armour gate on both axes at once.
 *
 * A Golem is a physical wall that folds to a spell. A Rimeplate does not fold to anything, so
 * "bring the other damage type" stops being an answer and penetration or a Sunder starts being
 * one. Deliberately the last lock the ladder teaches.
 */
export const RIMEPLATE = {
  id: 'rimeplate',
  name: 'Rimeplate',
  faction: 'monster',
  stats: {
    hp: 3400,
    patk: 100,
    matk: 26,
    pdef: 90,
    mdef: 78,
    spd: 60,
    critChance: 0.03,
    critMultiplier: 1.8,
    tenacity: 0.3,
  },
  skills: [GLACIAL_SLAM],
} as const;

/**
 * The evasion lock.
 *
 * Dodges a little over half of what an ordinary attacker aims at it. The hit-chance floor is
 * what keeps this beatable at all; past that the answers are accuracy — Rin and Aelrindel both
 * carry it — or simply enough attacks that the misses stop deciding the fight.
 */
export const SHADE = {
  id: 'shade',
  name: 'Fen Shade',
  faction: 'undead',
  stats: {
    hp: 980,
    patk: 60,
    matk: 78,
    pdef: 12,
    mdef: 18,
    spd: 112,
    critChance: 0.08,
    critMultiplier: 1.7,
    dodge: 0.55,
    lifesteal: 0.15,
  },
  skills: [FADE, WITHERING_TOUCH],
} as const;

/** Every enemy, for the specs that check ids are unique and that every kit points at a real
 * skill. */
export const ENEMIES = [
  SLIME,
  WISP,
  BOAR,
  BANDIT,
  GOLEM,
  WARDEN,
  ACOLYTE,
  HAG,
  PYRE,
  BULWARK_ENEMY,
  RIMEPLATE,
  SHADE,
] as const;
