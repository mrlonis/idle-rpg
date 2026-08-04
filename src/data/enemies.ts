import {
  BULWARK,
  CINDER_STORM,
  CUTPURSE,
  FADE,
  FLENSE,
  GATE_SLAM,
  GLACIAL_SLAM,
  GORE,
  HEADSMANS_ARC,
  MEND,
  MIRE,
  MOTE_LANCE,
  RUINOUS_ARC,
  SHIELD_BASH,
  SHRIKE_DIVE,
  STONE_FIST,
  TYRANTS_CLAIM,
  WITHERHEX,
  WITHERING_TOUCH,
  WRATH_UNBOUND,
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
 * - `haste` is ATB gauge gained per battle tick, against a threshold of 1000. So `haste: 100`
 *   acts once per 10 ticks, and a combatant at 200 genuinely takes twice as many turns as one
 *   at 100 — gauge fill is a real stat, not a tiebreak. `attackSpeed` is extra gauge that
 *   accrues only while the combatant's last action was a basic attack, so it buys basic attacks
 *   and nothing else.
 * - Damage is `atk² / (atk + def × (1 - pierce))`, then reduced by the matching **resist**.
 *   One attack stat and one defence stat since milestone 8a: the attack's type no longer picks
 *   which stat it reads, it picks which pierce and which resist apply. DEF has diminishing
 *   returns and can never reduce a hit to zero, so a high-DEF enemy is a soft wall that
 *   punishes low ATK rather than a hard one that makes a fight unwinnable — and resist is
 *   capped below 1 for the same reason.
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
 * armour check, a gate. The six that follow them are the sharp ones, and each names the answer it
 * wants:
 *
 * | Enemy         | The question                             | The answer                        |
 * | ------------- | ---------------------------------------- | --------------------------------- |
 * | Marsh Acolyte | can you reach a healer behind two bodies? | reach, or burst through the front |
 * | Bog Hag       | can you survive a party-wide debuff?      | a cleanse                         |
 * | Pyre Caster   | is any of your durability magical?        | `magicResist`, or killing it      |
 * | Iron Bulwark  | can you out-damage a refreshed absorb?    | burst, not chip                   |
 * | Rimeplate     | what do you do when it resists both?      | penetration, or Sunder            |
 * | Fen Shade     | what do you do when it dodges half of it? | accuracy, or volume               |
 *
 * A third set follows for the second half of the ladder — see "The Ashfall Reach" below, which
 * also records why those needed new stat blocks rather than the old ones with a multiplier.
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
    atk: 26,
    def: 6,
    haste: 78,
    critChance: 0.03,
    critDamageAmp: 0.5,
    physicalResist: 0.03,
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
    atk: 32,
    def: 6,
    haste: 148,
    critChance: 0.08,
    critDamageAmp: 0.6,
    magicResist: 0.1,
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
    atk: 45,
    def: 16,
    haste: 84,
    critChance: 0.05,
    critDamageAmp: 0.5,
    physicalResist: 0.1,
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
    atk: 56,
    def: 22,
    haste: 106,
    critChance: 0.12,
    critDamageAmp: 0.7,
    physicalResist: 0.05,
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
    atk: 84,
    def: 65,
    haste: 52,
    critChance: 0.02,
    critDamageAmp: 1,
    critDamageResist: 0.25,
    critBlock: 0.12,
    physicalResist: 0.23,
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
    atk: 92,
    def: 48,
    haste: 98,
    critChance: 0.1,
    critDamageAmp: 0.8,
    mp: 72,
    mpRegen: 4,
    insight: 0.1,
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
    atk: 96,
    def: 25,
    haste: 92,
    critChance: 0.02,
    critDamageAmp: 0.4,
    mp: 90,
    mpRegen: 6,
    magicResist: 0.13,
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
    atk: 76,
    def: 33,
    haste: 88,
    critChance: 0.04,
    critDamageAmp: 0.5,
    mp: 80,
    mpRegen: 5,
    insight: 0.15,
    magicResist: 0.1,
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
    atk: 94,
    def: 24,
    haste: 96,
    critChance: 0.1,
    critDamageAmp: 0.8,
    mp: 78,
    mpRegen: 5,
    magicResist: 0.11,
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
    atk: 66,
    def: 60,
    haste: 74,
    critChance: 0.03,
    critDamageAmp: 0.5,
    mp: 80,
    mpRegen: 5,
    tenacity: 0.2,
    physicalResist: 0.06,
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
    atk: 100,
    def: 84,
    recovery: 14,
    haste: 60,
    critChance: 0.03,
    critDamageAmp: 0.8,
    critDamageResist: 0.2,
    critBlock: 0.1,
    tenacity: 0.3,
    physicalResist: 0.03,
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
    atk: 78,
    def: 15,
    haste: 112,
    critChance: 0.08,
    critDamageAmp: 0.7,
    lifeLeech: 0.15,
    magicResist: 0.09,
    dodge: 0.55,
  },
  skills: [FADE, WITHERING_TOUCH],
} as const;

// ---------------------------------------------------------------------------------------
// The Ashfall Reach — the second half of the ladder
//
// ## Why these are new stat blocks rather than the old ones with a multiplier
//
// The party that arrives at stage 13 is roughly four times the party that cleared stage 12 —
// levels and ascension rungs, compounding. Fielding a 300-HP Slime against it is not an easy
// encounter, it is an empty square: it dies before it acts and the stage is a formality. So the
// second half of the ladder needs bodies of its own whatever else it does.
//
// What it must *not* be is only that. Six of the twelve below exist because
// `core/battle/types.ts` had vocabulary nothing had ever used — `enemy-row-back`,
// `enemy-lowest`, `enemy-highest` and the `self-hurt` condition, plus `tenacity` and penetration
// pushed far enough to be a question rather than a rounding error. Each one names an answer the
// twenty-three character roster already has and nothing was asking for. The other six are the
// bodies and the support those locks stand behind, sized for the band they appear in.
//
// | Enemy             | The question                                    | The answer                     |
// | ----------------- | ----------------------------------------------- | ------------------------------ |
// | Sky-Shrike        | what if your whole back rank is the target?     | durability, a barrier, or speed |
// | Barbed Ravager    | what if armour simply stops working?            | HP, sustain, evasion            |
// | Wrathborn         | what if chipping it is what turns it on?        | burst through the window, or a slow |
// | Ashen Hierophant  | a healer and a shielder in one body             | reach — killing it, not racing it |
// | Gallows Headsman  | can you keep your weakest member alive?         | sustain that is not the tank's |
// | Adamant Colossus  | can you win without a single debuff landing?    | raw damage, penetration        |
// | Bonefall Tyrant   | what if your wall is the first thing to die?    | heals on the front, or a cleanse |
//
// ## Scale
//
// Roughly a tenth again a stage, which is deliberately the slope the idle rates take across this
// stretch. Damage is `atk² / (atk + def)`, so scaling attack and defence together leaves a fight
// the same *length* while making it a fight between bigger numbers — which is what keeps the
// second half feeling like the first rather than like a wait.

/**
 * A body for the top half of the ladder, and the one that drains.
 *
 * Deliberately unremarkable: not every stage should be a lock, and a stage made entirely of
 * questions has no room left for the answers to land. Its life leech is what stops a party
 * ignoring it while it works on the thing behind it.
 */
export const REVENANT = {
  id: 'revenant',
  name: 'Ash Revenant',
  faction: 'undead',
  stats: {
    hp: 2900,
    atk: 72,
    def: 20,
    recovery: 22,
    haste: 82,
    critChance: 0.06,
    critDamageAmp: 0.6,
    lifeLeech: 0.2,
    physicalResist: 0.03,
  },
  skills: [WITHERING_TOUCH, GORE],
} as const;

/** The wall of this half: enormous on both defences, slow, and it slows you back. */
export const SENTINEL = {
  id: 'sentinel',
  name: 'Cairn Sentinel',
  faction: 'dwarf',
  stats: {
    hp: 3950,
    atk: 72,
    def: 78,
    recovery: 20,
    haste: 66,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    tenacity: 0.25,
    physicalResist: 0.05,
    healthRegen: 0.25,
  },
  skills: [GLACIAL_SLAM, SHIELD_BASH],
} as const;

/**
 * The back-rank lock.
 *
 * By stage 13 every encounter below has taught the same habit — put the fragile things behind the
 * two bodies — and this is the encounter that charges for it. Almost no armour and the highest
 * speed on the ladder, so it is a race the party can win outright by noticing it exists.
 */
export const SKYSHRIKE = {
  id: 'skyshrike',
  name: 'Sky-Shrike',
  faction: 'elf',
  stats: {
    hp: 1450,
    atk: 100,
    def: 24,
    haste: 152,
    critChance: 0.16,
    critDamageAmp: 0.8,
    magicResist: 0.04,
    accuracy: 1.1,
  },
  skills: [SHRIKE_DIVE],
} as const;

/**
 * The penetration lock.
 *
 * Everything up to here has been answerable by buying more of a defensive stat. This one ignores
 * nearly half of whichever the party bought — and because penetration is a *percentage* rather
 * than a subtraction, a wall still feels like a body rather than like an empty square. The answer
 * is durability that is not armour: HP, sustain, or not being hit.
 */
export const RAVAGER = {
  id: 'ravager',
  name: 'Barbed Ravager',
  faction: 'monster',
  stats: {
    hp: 3450,
    atk: 118,
    def: 43,
    haste: 94,
    critChance: 0.08,
    critDamageAmp: 0.7,
    physicalPierce: 0.45,
    magicPierce: 0.4,
    physicalResist: 0.05,
  },
  skills: [FLENSE],
} as const;

/**
 * The escalation lock: it gets worse as it dies.
 *
 * Every other meter on the ladder counts down toward the enemy being able to act. This one counts
 * down toward the party wishing it had not started. Below half health it buys itself a third more
 * speed and a third more `atk` at once, so the damage it does in the last quarter of its HP bar
 * dwarfs the first three.
 */
export const WRATHBORN = {
  id: 'wrathborn',
  name: 'Wrathborn',
  faction: 'demon',
  stats: {
    hp: 3300,
    atk: 125,
    def: 48,
    haste: 92,
    critChance: 0.1,
    critDamageAmp: 0.8,
    mp: 90,
    mpRegen: 6,
    magicResist: 0.04,
  },
  skills: [WRATH_UNBOUND, RUINOUS_ARC],
} as const;

/** The wide magical wave of this half, and the only thing here that debuffs the whole party. */
export const STORMCALLER = {
  id: 'stormcaller',
  name: 'Fen Stormcaller',
  faction: 'human',
  stats: {
    hp: 2950,
    atk: 140,
    def: 43,
    haste: 100,
    critChance: 0.12,
    critDamageAmp: 0.8,
    mp: 110,
    mpRegen: 6,
    insight: 0.15,
    magicResist: 0.07,
  },
  skills: [CINDER_STORM, WITHERHEX],
} as const;

/**
 * A healer and a shielder in one body, which is a different problem from either.
 *
 * A Marsh Acolyte can be out-damaged. An Iron Bulwark can be burst. This does both from the same
 * turn economy, so chip damage loses to the barrier and burst loses to the heal — and the only
 * answer left is the one milestone 4 built the back rank around: **reach it**. A celestial, so it
 * also deals ten percent more to every mortal in the party with nothing coming back.
 */
export const HIEROPHANT = {
  id: 'hierophant',
  name: 'Ashen Hierophant',
  faction: 'angel',
  stats: {
    hp: 5100,
    atk: 240,
    def: 99,
    recovery: 30,
    haste: 104,
    critChance: 0.04,
    critDamageAmp: 0.5,
    mp: 120,
    mpRegen: 6,
    magicResist: 0.1,
    receivedHealing: 0.25,
  },
  skills: [MEND, BULWARK],
} as const;

/**
 * The execution lock: the party's own executioner rule, pointed back at it.
 *
 * Throat Cut, Decisive Strike and Devour all ignore rank and go for the lowest HP on the field.
 * Nothing had ever done that to the player. What it asks for is sustain aimed at whoever is
 * nearly dead rather than at whoever is standing in front, which is a different skill and a
 * different character.
 */
export const HEADSMAN = {
  id: 'headsman',
  name: 'Gallows Headsman',
  faction: 'undead',
  stats: {
    hp: 6700,
    atk: 168,
    def: 92,
    haste: 108,
    critChance: 0.18,
    critDamageAmp: 0.9,
    lifeLeech: 0.2,
    physicalResist: 0.04,
  },
  skills: [HEADSMANS_ARC],
} as const;

/**
 * The tenacity lock: a wall that debuffs bounce off.
 *
 * Sunder, Weaken and Slow have been the answer to every large thing on the ladder so far, and
 * against 0.85 tenacity almost none of them land. That leaves raw damage and penetration — and
 * because the party has spent twenty stages learning to open armour rather than out-hit it, this
 * is the encounter that asks whether it can still do the other thing.
 */
export const COLOSSUS = {
  id: 'colossus',
  name: 'Adamant Colossus',
  faction: 'dwarf',
  stats: {
    hp: 8600,
    atk: 168,
    def: 192,
    recovery: 34,
    haste: 58,
    critChance: 0.03,
    critDamageAmp: 0.6,
    critBlock: 0.12,
    tenacity: 0.85,
    physicalResist: 0.03,
    healthRegen: 0.3,
  },
  skills: [GLACIAL_SLAM, SHIELD_BASH],
} as const;

/**
 * The wall-breaker: it attacks the biggest thing the party brought.
 *
 * A front rank works because ordinary attacks have to pass through it. A Tyrant does not attack
 * *through* anything — it attacks the largest HP pool on the field, which is the wall itself, and
 * sunders it on the way so the next one lands harder. Fielding a second body does not help; the
 * answers are healing pointed at the front rank, or a cleanse.
 */
export const TYRANT = {
  id: 'tyrant',
  name: 'Bonefall Tyrant',
  faction: 'monster',
  stats: {
    hp: 9800,
    atk: 220,
    def: 148,
    haste: 88,
    critChance: 0.12,
    critDamageAmp: 0.9,
    physicalPierce: 0.3,
    physicalResist: 0.03,
  },
  skills: [TYRANTS_CLAIM],
} as const;

/** The gate of the second half: a Warden's stun on a body that can survive being answered. */
export const OATHBREAKER = {
  id: 'oathbreaker',
  name: 'The Oathbreaker',
  faction: 'human',
  stats: {
    hp: 7400,
    atk: 155,
    def: 135,
    haste: 100,
    critChance: 0.12,
    critDamageAmp: 0.8,
    mp: 110,
    mpRegen: 6,
    insight: 0.15,
    physicalResist: 0.03,
  },
  skills: [GATE_SLAM, CUTPURSE],
} as const;

/**
 * The end of the authored ladder, and every lock it has taught at once.
 *
 * It takes the biggest thing the party brought, burns the whole party, half-ignores both
 * defences, and shrugs off half of what is aimed back. Winnable, expensively, by a party that
 * arrived with sustain, reach and penetration — and by nothing that brought only one of them.
 */
export const UNMADE = {
  id: 'unmade',
  name: 'The Unmade',
  faction: 'demon',
  stats: {
    hp: 12500,
    atk: 195,
    def: 190,
    recovery: 40,
    haste: 96,
    critChance: 0.15,
    critDamageAmp: 1,
    critDamageResist: 0.2,
    mp: 140,
    mpRegen: 7,
    tenacity: 0.5,
    physicalPierce: 0.3,
    magicPierce: 0.3,
  },
  skills: [TYRANTS_CLAIM, CINDER_STORM],
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
  REVENANT,
  SENTINEL,
  SKYSHRIKE,
  RAVAGER,
  WRATHBORN,
  STORMCALLER,
  HIEROPHANT,
  HEADSMAN,
  COLOSSUS,
  TYRANT,
  OATHBREAKER,
  UNMADE,
] as const;
