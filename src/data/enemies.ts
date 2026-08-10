import {
  ANTIPHON,
  BIND_THE_CONCORD,
  BROKEN_COVENANT,
  BULWARK,
  CHOIR_OF_ASH,
  CINDER_STORM,
  CUTPURSE,
  DOOMKNELL,
  DRAW_THE_OATH,
  EMBERSEED,
  FADE,
  FLENSE,
  GATE_SLAM,
  GLACIAL_SLAM,
  GORE,
  HEADSMANS_ARC,
  HERALDS_ANTHEM,
  LITANY,
  MEND,
  MIRE,
  MOONSONG,
  MOTE_LANCE,
  PALL_OF_YEARS,
  PILLAR_OF_LIGHT,
  RIFTFALL,
  RUINOUS_ARC,
  RUNEWARD,
  SEVENFOLD_HEX,
  SHIELD_BASH,
  SHRIKE_DIVE,
  STONE_FIST,
  THE_SEAL_BREAKS,
  THORNLASH,
  TYRANTS_CLAIM,
  WARD_THE_SEAL,
  WILDING_BLOOM,
  WITHERHEX,
  WITHERING_TOUCH,
  WRATH_UNBOUND,
} from './skills';
import { THORNMAIL } from './statuses';

/**
 * Enemy archetypes: a stat block at **level 1**, a kit, and the slope it grows on.
 *
 * Plain data: no functions, no imports outside `data/`. Quantities are numbers (or strings,
 * once a value outgrows float64) rather than `Numeric`, because constructing a `Numeric` would
 * mean importing `core/` — and content that cannot be expressed as plain JSON is content that
 * can never be loaded from a file. `core/battle/content.ts` parses these into the simulation's
 * types.
 *
 * ## Every block here is a level-1 block, and that is milestone 10's change
 *
 * An archetype used to be a finished stat block, sized by hand for the band of the ladder it
 * appeared in — a 300-HP Slime for the opening stages and a 12,500-HP Unmade for the end. That
 * works while the player's own curve spans a factor of forty. Past a billion it does not: the
 * Slime becomes a rounding error, and so does every question the ladder taught behind it.
 *
 * So a stage now names archetypes and a **level**, and `core/` scales the block on the way onto
 * the field. What is authored here is the archetype's *shape* — fragile and fast, armoured and
 * slow, a healer with no armour at all — and its weight relative to its neighbours. How big it
 * actually is on any given stage is that stage's business.
 *
 * The practical consequence when reading these numbers: **compare them to a character's level-1
 * block, not to each other across the ladder**. A level-1 Gate Warden is 1,050 HP against Bran's
 * 940, which is the right comparison; it meets the party at stage 11, at level 40, where it is
 * nearer 2,650.
 *
 * ## `tier` is the slope, not a difficulty rating
 *
 * The same three tiers a character has, meaning the same thing — `common`, `legendary`, `ascended`
 * in ascending order of growth per level. Fodder and plain bodies are `common`, the locks are
 * `legendary`, the gates and bosses are `ascended`. At level 1 the three are identical; what the
 * tier buys is that a gate pulls away from the escort standing in front of it as the ladder
 * climbs, instead of the two staying a fixed distance apart forever.
 *
 * There is deliberately **no ascension rung on this side** — see `toEnemyCombatant` in
 * `core/roster/stats.ts` for why the third dial milestone 10 planned was folded into the stat
 * block instead of shipped.
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
 * - **No enemy carries an ultimate**, so no enemy has an `energyRegen` either. Energy is a
 *   character system — a bar the player watches, and what milestone 8c hangs its skill ceiling on.
 *   An encounter is read as a rhythm instead, so its pacing is authored directly in cooldowns
 *   where it can be set exactly. See the note above the enemy kits in `skills.ts`.
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
 * also records what survived of the argument for authoring them separately once the level dial
 * arrived.
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
  tier: 'common',
  stats: {
    hp: 290,
    atk: 25,
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
  tier: 'common',
  stats: {
    hp: 210,
    atk: 30,
    def: 5,
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
  tier: 'common',
  stats: {
    hp: 620,
    atk: 37,
    def: 13,
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
  tier: 'common',
  stats: {
    hp: 520,
    atk: 46,
    def: 18,
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
  tier: 'legendary',
  stats: {
    hp: 1000,
    atk: 42,
    def: 19,
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
  tier: 'ascended',
  stats: {
    hp: 850,
    atk: 46,
    def: 15,
    haste: 98,
    critChance: 0.1,
    critDamageAmp: 0.8,
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
  tier: 'legendary',
  stats: {
    hp: 420,
    atk: 58,
    def: 15,
    haste: 92,
    critChance: 0.02,
    critDamageAmp: 0.4,
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
  tier: 'legendary',
  stats: {
    hp: 650,
    atk: 46,
    def: 20,
    haste: 88,
    critChance: 0.04,
    critDamageAmp: 0.5,
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
  tier: 'legendary',
  stats: {
    hp: 500,
    atk: 57,
    def: 15,
    haste: 96,
    critChance: 0.1,
    critDamageAmp: 0.8,
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
  tier: 'legendary',
  stats: {
    hp: 820,
    atk: 40,
    def: 21,
    haste: 74,
    critChance: 0.03,
    critDamageAmp: 0.5,
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
  tier: 'legendary',
  stats: {
    hp: 1100,
    atk: 60,
    def: 24,
    recovery: 6,
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
  tier: 'legendary',
  stats: {
    hp: 590,
    atk: 47,
    def: 9,
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
// ## Why these are separate archetypes rather than the old ones at a higher level
//
// Milestone 10 answered half of what this section used to argue. The old reason was scale: a
// 300-HP Slime against the party that arrives at stage 13 is not an easy encounter, it is an empty
// square. That reason is gone — a Slime fielded at level 58 is a real body, and the level dial is
// exactly the thing that makes re-authoring for scale unnecessary.
//
// **The half that survives is the half that always mattered.** Six of the twelve below exist
// because
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
// These sit somewhat heavier at level 1 than the openers above, and that is a statement about the
// archetypes rather than about the band: a Bonefall Tyrant is a bigger thing than a Slime wherever
// either of them stands. The band they appear in is `level` on the stage, and nothing here.
//
// Damage is `atk² / (atk + def)`, so scaling attack and defence together leaves a fight the same
// *length* while making it a fight between bigger numbers. That is what lets the whole ladder be
// rescaled without the ninety-second timer noticing — see the scaling invariant asserted in
// `core/battle/simulate.spec.ts`.

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
  tier: 'common',
  stats: {
    hp: 640,
    atk: 48,
    def: 15,
    recovery: 5,
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
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 70,
    def: 38,
    recovery: 4,
    haste: 66,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    tenacity: 0.25,
    physicalResist: 0.05,
    healthRegen: 0.08,
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
  tier: 'legendary',
  stats: {
    hp: 480,
    atk: 63,
    def: 16,
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
  tier: 'legendary',
  stats: {
    hp: 900,
    atk: 62,
    def: 22,
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
  tier: 'legendary',
  stats: {
    hp: 860,
    atk: 65,
    def: 25,
    haste: 92,
    critChance: 0.1,
    critDamageAmp: 0.8,
    magicResist: 0.04,
  },
  skills: [WRATH_UNBOUND, RUINOUS_ARC],
} as const;

/** The wide magical wave of this half, and the only thing here that debuffs the whole party. */
export const STORMCALLER = {
  id: 'stormcaller',
  name: 'Fen Stormcaller',
  faction: 'human',
  tier: 'legendary',
  stats: {
    hp: 770,
    atk: 73,
    def: 22,
    haste: 100,
    critChance: 0.12,
    critDamageAmp: 0.8,
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
 *
 * **It heals with {@link LITANY} rather than {@link MEND}, and milestone 8b is why.** Two skills
 * against one MP pool meant this was the one enemy in the game the pool genuinely metered — it
 * spent 28 a cycle against 6 a turn and ran down. Deleting MP handed it an unmetered heal every
 * second turn, and stage 24 became a 102-second attrition war the reference party lost more often
 * than it won. Its own longer-cooldown heal puts the cadence back without touching the Acolyte,
 * which shares none of that history and was never pool-limited at all.
 */
export const HIEROPHANT = {
  id: 'hierophant',
  name: 'Ashen Hierophant',
  faction: 'angel',
  tier: 'ascended',
  stats: {
    hp: 1050,
    atk: 56,
    def: 30,
    recovery: 7,
    haste: 104,
    critChance: 0.04,
    critDamageAmp: 0.5,
    magicResist: 0.1,
    receivedHealing: 0.25,
  },
  skills: [LITANY, BULWARK],
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
  tier: 'legendary',
  stats: {
    hp: 980,
    atk: 72,
    def: 30,
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
  tier: 'ascended',
  stats: {
    hp: 1250,
    atk: 88,
    def: 42,
    recovery: 7,
    haste: 58,
    critChance: 0.03,
    critDamageAmp: 0.6,
    critBlock: 0.12,
    tenacity: 0.85,
    physicalResist: 0.03,
    healthRegen: 0.15,
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
  tier: 'ascended',
  stats: {
    hp: 1550,
    atk: 96,
    def: 46,
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
  tier: 'ascended',
  stats: {
    hp: 1220,
    atk: 74,
    def: 42,
    haste: 100,
    critChance: 0.12,
    critDamageAmp: 0.8,
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
  tier: 'ascended',
  stats: {
    hp: 1800,
    atk: 100,
    def: 58,
    recovery: 8,
    haste: 96,
    critChance: 0.15,
    critDamageAmp: 1,
    critDamageResist: 0.2,
    tenacity: 0.5,
    physicalPierce: 0.3,
    magicPierce: 0.3,
  },
  skills: [TYRANTS_CLAIM, CINDER_STORM],
} as const;

// ---------------------------------------------------------------------------------------
// The tower blocks — milestone 15c
//
// ## Why eighteen archetypes arrived at once, and why they are spread the way they are
//
// A tower's enemies lean toward the faction that **counters** the one it admits, so the matchup
// matrix stays live inside it rather than being switched off by a mirror match. That makes the
// per-faction archetype count a hard constraint rather than a nicety: at the end of milestone 15b
// it read monster 6, undead 5, human 5, dwarf 3, demon 3, **elf 1, angel 1** — so the Undead tower
// (countered by Elves) and the Demon tower (countered by Angels) had a single block to build a
// hundred floors out of. That is not a lean, it is the same fight a hundred times.
//
// These bring every faction to **six**: two `common`, three `legendary` and one `ascended`, give or
// take where a faction already sat above that. Two of each shape is what the towers actually spend
// them on — commons for the low floors, legendaries for the locks in the middle, and one ascended
// block per faction so a top band can anchor on the tower's own counter rather than borrowing an
// anchor from somewhere the bias does not point.
//
// ⚠️ **The two new `ascended` blocks are sized against `OATHBREAKER` and `TYRANT`, not above
// them.** 15b measured that difficulty in a tower is almost entirely the front rank's weight and
// that it is sharply non-linear — pairing the two heaviest blocks in the game took the reference
// crew from a clean clear to single digits. A third and fourth heavy anchor is exactly the kind of
// content that makes six towers fail their sweep at once, so both land between the Oathbreaker and
// the Tyrant rather than reaching for a new ceiling.
//
// **Commons mostly reuse the kits above.** A body is a body: what makes the low floors of six
// towers different from each other is which faction is standing there and what the matchup matrix
// says about it, not a ninth spelling of "hits the front rank". The locks are where the new
// questions are, and those are the nine skills at the foot of `skills.ts`.
// ---------------------------------------------------------------------------------------

/** A Human body for the low floors, where the Dwarf Tower needs two of its counter and had one. */
export const FREE_BLADE = {
  id: 'free-blade',
  name: 'Free Company Blade',
  faction: 'human',
  tier: 'common',
  stats: {
    hp: 540,
    atk: 44,
    def: 16,
    haste: 98,
    critChance: 0.1,
    critDamageAmp: 0.6,
    physicalResist: 0.04,
  },
  skills: [GORE],
} as const;

/**
 * The Undead gate, and the faction's first `ascended` block.
 *
 * 15b recorded its absence as the constraint that shaped the Human Tower: with no ascended Undead
 * the heavy anchors on its top floors had to be borrowed from factions the bias did not point at,
 * which is why the lean is a share of the whole tower rather than a rule per floor. This is the
 * block that closes it.
 *
 * What it asks is {@link PALL_OF_YEARS}: a drain off the whole party at once, so the largest health
 * pool on the board is refilled by however much of the party is still standing. Sized under a
 * Bonefall Tyrant deliberately — see the note above this section.
 */
export const BARROW_SOVEREIGN = {
  id: 'barrow-sovereign',
  name: 'Barrow Sovereign',
  faction: 'undead',
  tier: 'ascended',
  stats: {
    hp: 1350,
    atk: 84,
    def: 40,
    recovery: 6,
    haste: 90,
    critChance: 0.1,
    critDamageAmp: 0.8,
    lifeLeech: 0.25,
    magicPierce: 0.25,
    physicalResist: 0.04,
  },
  skills: [PALL_OF_YEARS, HEADSMANS_ARC],
} as const;

/** A Dwarven body: slow, armoured, and nothing else. The Elf Tower's fodder. */
export const FORGE_THRALL = {
  id: 'forge-thrall',
  name: 'Forge Thrall',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 600,
    atk: 33,
    def: 18,
    haste: 72,
    critChance: 0.03,
    critDamageAmp: 0.5,
    physicalResist: 0.1,
  },
  skills: [STONE_FIST],
} as const;

/** The other half of that pair: quicker, and it opens armour rather than standing behind it. */
export const DEEPROCK_MINER = {
  id: 'deeprock-miner',
  name: 'Deeprock Miner',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 500,
    atk: 42,
    def: 14,
    haste: 88,
    critChance: 0.06,
    critDamageAmp: 0.6,
    physicalPierce: 0.2,
  },
  skills: [SHIELD_BASH],
} as const;

/**
 * The cleanse lock, and the only enemy in the game that takes an answer back.
 *
 * Sunder, Weaken and Slow are how a party has opened every wall since milestone 4. A Colossus
 * *refuses* them, which is a dice check the player can out-invest in `insight`; this removes them
 * once they have landed, which no amount of insight helps with. See {@link RUNEWARD}.
 */
export const RUNEWARDEN = {
  id: 'runewarden',
  name: 'Runewarden',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 860,
    atk: 52,
    def: 28,
    recovery: 4,
    haste: 78,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    tenacity: 0.35,
    physicalResist: 0.06,
  },
  skills: [RUNEWARD, GLACIAL_SLAM],
} as const;

/** An Elven body: fragile, quick, and it bleeds whatever it commits to. */
export const THORNLING = {
  id: 'thornling',
  name: 'Thornling',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 300,
    atk: 34,
    def: 8,
    haste: 122,
    critChance: 0.08,
    critDamageAmp: 0.6,
    magicResist: 0.05,
  },
  skills: [GORE],
} as const;

/** The Elven poke: it reaches past the gate from the first floor, which is what Elves are for. */
export const GLADE_STALKER = {
  id: 'glade-stalker',
  name: 'Glade Stalker',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 360,
    atk: 40,
    def: 10,
    haste: 116,
    critChance: 0.12,
    critDamageAmp: 0.7,
    dodge: 0.2,
    accuracy: 1.05,
  },
  skills: [CUTPURSE],
} as const;

/**
 * The regeneration lock: a healer with nothing to kill.
 *
 * A Marsh Acolyte is unreachable but mortal — get behind the front rank and the encounter is over.
 * A Wilding Bloom is neither: the Warden that cast it can die and its whole side keeps healing to
 * the end of the duration. So the answer moves from *reach* to out-damaging the tick, which is a
 * different party rather than a better-placed one.
 */
export const THORNWEALD_WARDEN = {
  id: 'thornweald-warden',
  name: 'Thornweald Warden',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 720,
    atk: 50,
    def: 22,
    recovery: 5,
    haste: 86,
    critChance: 0.04,
    critDamageAmp: 0.5,
    healthRegen: 0.2,
    magicResist: 0.1,
  },
  skills: [WILDING_BLOOM, THORNLASH],
} as const;

/**
 * The tempo lock, widened from the front rank to the party.
 *
 * A Bog Hag slows the two bodies the party had already decided were expendable. This takes a third
 * of the gauge off all five, which is not durability — it is fewer turns in the fight, for the
 * healer and the carry as much as the wall.
 */
export const MOONSONG_WEAVER = {
  id: 'moonsong-weaver',
  name: 'Moonsong Weaver',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 560,
    atk: 62,
    def: 16,
    haste: 104,
    critChance: 0.1,
    critDamageAmp: 0.7,
    insight: 0.18,
    magicResist: 0.08,
  },
  skills: [MOONSONG],
} as const;

/**
 * The Elven gate, and the faction's answer to owning no wall.
 *
 * Every other big block on the board is durable because of what it *has* — armour, tenacity, a
 * barrier. This one is durable because of what it gets back, which is the axis a party that
 * arrived with penetration has no answer to. It holds the front rank still while it regrows, so
 * the fight it wants is the long one and the way past it is to refuse to have that fight.
 */
export const WYRDROOT_ANCIENT = {
  id: 'wyrdroot-ancient',
  name: 'Wyrdroot Ancient',
  faction: 'elf',
  tier: 'ascended',
  stats: {
    hp: 1300,
    atk: 78,
    def: 40,
    recovery: 9,
    haste: 56,
    critChance: 0.03,
    critDamageAmp: 0.6,
    critBlock: 0.1,
    tenacity: 0.4,
    healthRegen: 0.2,
    physicalResist: 0.04,
  },
  skills: [THORNLASH, GLACIAL_SLAM],
} as const;

/** An Angelic body, and the faction's first thing that is not a Hierophant. */
export const LUMEN_ACOLYTE = {
  id: 'lumen-acolyte',
  name: 'Lumen Acolyte',
  faction: 'angel',
  tier: 'common',
  stats: {
    hp: 330,
    atk: 38,
    def: 11,
    haste: 100,
    critChance: 0.04,
    critDamageAmp: 0.5,
    magicResist: 0.14,
  },
  skills: [MOTE_LANCE],
} as const;

/** The other half: the plain armoured body the Demon Tower's low floors are built out of. */
export const GILDED_SENTRY = {
  id: 'gilded-sentry',
  name: 'Gilded Sentry',
  faction: 'angel',
  tier: 'common',
  stats: {
    hp: 640,
    atk: 35,
    def: 17,
    haste: 76,
    critChance: 0.03,
    critDamageAmp: 0.5,
    physicalResist: 0.1,
  },
  skills: [SHIELD_BASH],
} as const;

/**
 * The priority lock: a small thing that makes everything standing beside it bigger.
 *
 * Every wall asks to be got past and every healer asks to be reached. A Herald asks to be killed
 * **first**, which is a different decision — and the party that spends its opening on a 660-HP
 * support is the party that has not yet touched the block in front of it. See
 * {@link HERALDS_ANTHEM}.
 */
export const RADIANT_HERALD = {
  id: 'radiant-herald',
  name: 'Radiant Herald',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 660,
    atk: 52,
    def: 20,
    haste: 98,
    critChance: 0.05,
    critDamageAmp: 0.5,
    insight: 0.12,
    magicResist: 0.1,
  },
  skills: [HERALDS_ANTHEM, MOTE_LANCE],
} as const;

/**
 * The absorb lock, spread across the whole board.
 *
 * An Iron Bulwark's barrier sits on the Iron Bulwark, so burst spent breaking it is burst spent on
 * the thing the party wanted dead. This puts the same pool on the fodder as well, which means the
 * cheap way through the board is exactly the way a shield is best at stopping.
 */
export const ASHEN_CHOIR = {
  id: 'ashen-choir',
  name: 'Ashen Choir',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 700,
    atk: 48,
    def: 24,
    recovery: 4,
    haste: 88,
    critChance: 0.03,
    critDamageAmp: 0.5,
    magicResist: 0.12,
  },
  skills: [CHOIR_OF_ASH, SHIELD_BASH],
} as const;

/** The back-rank dive in the other damage type, so armour on the carries is not the answer. */
export const SERAPH_ADJUDICANT = {
  id: 'seraph-adjudicant',
  name: 'Seraph Adjudicant',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 590,
    atk: 68,
    def: 18,
    haste: 114,
    critChance: 0.14,
    critDamageAmp: 0.8,
    magicPierce: 0.3,
    magicResist: 0.06,
  },
  skills: [PILLAR_OF_LIGHT],
} as const;

/** A Demon body: fast, fragile, and it burns whatever it can see. */
export const CINDERLING = {
  id: 'cinderling',
  name: 'Cinderling',
  faction: 'demon',
  tier: 'common',
  stats: {
    hp: 280,
    atk: 34,
    def: 8,
    haste: 108,
    critChance: 0.08,
    critDamageAmp: 0.6,
    magicResist: 0.08,
  },
  skills: [CINDER_STORM],
} as const;

/** The other half: it drains, so ignoring it while working on something else does not pay. */
export const BLOODPACT_FIEND = {
  id: 'bloodpact-fiend',
  name: 'Bloodpact Fiend',
  faction: 'demon',
  tier: 'common',
  stats: {
    hp: 560,
    atk: 41,
    def: 14,
    haste: 92,
    critChance: 0.07,
    critDamageAmp: 0.6,
    lifeLeech: 0.25,
    magicResist: 0.05,
  },
  skills: [WITHERING_TOUCH],
} as const;

/**
 * The lock that charges a party twice for the answer it already owns.
 *
 * Every cleanse in the roster removes a **fixed count**, so one hostile status is cancelled and two
 * are halved. This is the first thing in the game that lands two at once — the party still has its
 * answer, and this is what makes spending it a choice rather than a formality.
 */
export const HEXBOUND_TORMENTOR = {
  id: 'hexbound-tormentor',
  name: 'Hexbound Tormentor',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 680,
    atk: 58,
    def: 20,
    haste: 96,
    critChance: 0.08,
    critDamageAmp: 0.7,
    insight: 0.2,
    magicResist: 0.1,
  },
  skills: [SEVENFOLD_HEX, RUINOUS_ARC],
} as const;

// ---------------------------------------------------------------------------------------
// The Bound Marches — milestone 17
//
// ## Eight blocks, and what makes them a chapter rather than a level band
//
// Chapter 2 argued that a new archetype is only worth authoring when it asks something the
// vocabulary could express and nothing had used. Milestone 17 has the harder version of that
// problem: **every targeting, status and effect kind in `core/battle/types.ts` was already in
// use**, so a ninth spelling of "hits the front rank harder" is all that was left inside the
// existing vocabulary.
//
// So the vocabulary grew, once, by four — taunt, reflect, link and a delayed payload — and these
// eight are what field them. Three of the four are about **where a hit is allowed to go** rather
// than about how big it is, which is a lever nothing in the game had and the reason this reads as
// a different place rather than as the Ashfall Reach at a higher level.
//
// | Enemy               | The question                                    | The answer                    |
// | ------------------- | ----------------------------------------------- | ----------------------------- |
// | Oathshield Vanguard | what if you cannot choose what to hit?          | a row attack, or kill it      |
// | Bramblehide Ravener | what does the swing itself cost you?            | fewer, bigger hits; sustain   |
// | Concord Cantor      | what if nothing can be removed one at a time?   | kill the Cantor, or go wide   |
// | Emberseed Warlock   | can the cleanse arrive before the fuse does?    | a cleanse, spent at the right time |
// | Riven Marchwarden   | both of the first two at once, late             | reach that is not single-target |
// | The Chainsworn      | all of it, on a board that answers back         | everything above, in one fight |
//
// ⚠️ **No opening carries a taunt, here or ever.** A permanent one would take a single-target
// party's access to a back rank away for a whole fight rather than for a while; the taunts here are
// cast, on a cooldown longer than the status, and `enemies.spec.ts` holds that rule against the
// content rather than against a comment.
//
// ## Scale
//
// Sized against the Ashfall legendaries rather than above them, and the boss sized **under** The
// Unmade. The chapter is harder because the `level` on its stages is higher and because these ask
// questions the party has never been asked, not because the blocks are bigger — which is the
// distinction milestone 10 bought and the reason a lock does not decay into an empty square.
// ---------------------------------------------------------------------------------------

/**
 * The taunt lock, and the first thing in the game that chooses the party's target for it.
 *
 * Reach has been the answer to a protected healer since milestone 4 — put the sniper behind the
 * wall and shoot past it. This closes that door for as long as the Oathshield is up, so the party
 * either brings something that hits a whole row or spends the fight on the wall. It carries little
 * offence on purpose: what it costs the party is turns, not health.
 */
export const OATHSHIELD_VANGUARD = {
  id: 'oathshield-vanguard',
  name: 'Oathshield Vanguard',
  faction: 'human',
  tier: 'legendary',
  stats: {
    hp: 1020,
    atk: 64,
    def: 40,
    recovery: 5,
    haste: 74,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    tenacity: 0.25,
    physicalResist: 0.06,
  },
  skills: [DRAW_THE_OATH, SHIELD_BASH],
} as const;

/**
 * Spines. The first enemy that charges the party for attacking at all.
 *
 * Every lock below this is answered by doing more of something. This one is answered by doing
 * *less* of it — a party of many small hits pays the quarter over and over, and a party with one
 * big swing pays it once. It is the clearest statement the ladder makes that how damage is shaped
 * matters as much as how much of it there is.
 */
export const BRAMBLEHIDE_RAVENER = {
  id: 'bramblehide-ravener',
  name: 'Bramblehide Ravener',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 980,
    atk: 74,
    def: 28,
    haste: 88,
    critChance: 0.08,
    critDamageAmp: 0.7,
    lifeLeech: 0.1,
    physicalResist: 0.05,
  },
  opening: [THORNMAIL],
  skills: [GORE],
} as const;

/**
 * The link, and a support whose entire contribution is that nothing can be killed on its own.
 *
 * It deals almost nothing and is the most important body on any board it stands in: while the
 * Concord is up, two fifths of every hit is spread across whatever else is standing, so the
 * party's opening — remove the support, then the wall — simply stops resolving. Fragile, because
 * the answer is meant to be *kill the Cantor* and an answer nobody can reach is not one.
 */
export const CONCORD_CANTOR = {
  id: 'concord-cantor',
  name: 'Concord Cantor',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 700,
    atk: 58,
    def: 24,
    haste: 100,
    critChance: 0.04,
    critDamageAmp: 0.5,
    insight: 0.15,
    magicResist: 0.12,
  },
  skills: [BIND_THE_CONCORD, MOTE_LANCE],
} as const;

/**
 * The fuse. A payload on the back rank that lands in one piece forty ticks later.
 *
 * A poison asks whether the party can afford the attrition; this asks whether the answer arrives
 * in time — and because a cleanse spent early removes the whole thing, the decision is *when*
 * rather than *whether*. Everything the party keeps behind its wall is what it lands on.
 */
export const EMBERSEED_WARLOCK = {
  id: 'emberseed-warlock',
  name: 'Emberseed Warlock',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 740,
    atk: 68,
    def: 22,
    haste: 98,
    critChance: 0.1,
    critDamageAmp: 0.7,
    insight: 0.18,
    magicResist: 0.08,
  },
  skills: [EMBERSEED, CINDER_STORM],
} as const;

/** A body for the marches: armoured, slow, and nothing else. What the locks stand behind. */
export const MARCHWARD_PIKEMAN = {
  id: 'marchward-pikeman',
  name: 'Marchward Pikeman',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 700,
    atk: 50,
    def: 22,
    haste: 78,
    critChance: 0.04,
    critDamageAmp: 0.5,
    physicalResist: 0.08,
  },
  skills: [SHIELD_BASH],
} as const;

/** The other half of that pair: quick, fragile, and hard to pin down. */
export const BRAMBLEWALK_SCOUT = {
  id: 'bramblewalk-scout',
  name: 'Bramblewalk Scout',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 460,
    atk: 52,
    def: 13,
    haste: 120,
    critChance: 0.1,
    critDamageAmp: 0.7,
    dodge: 0.18,
    accuracy: 1.05,
    magicResist: 0.05,
  },
  skills: [CUTPURSE],
} as const;

/**
 * Both of the chapter's first two locks in one body, and the reason they were authored apart.
 *
 * A Vanguard says "hit me". A Ravener says "hitting costs you". Together they say "hit me, and it
 * costs you" — which is not a harder version of either, it is the first encounter where a party's
 * usual answer to one lock is the thing the other lock punishes. Late-chapter on purpose: it is
 * only a fair question once the party has met both halves separately.
 */
export const RIVEN_MARCHWARDEN = {
  id: 'riven-marchwarden',
  name: 'Riven Marchwarden',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 1150,
    atk: 66,
    def: 40,
    recovery: 6,
    haste: 68,
    critChance: 0.03,
    critDamageAmp: 0.6,
    critBlock: 0.1,
    tenacity: 0.35,
    physicalResist: 0.05,
  },
  opening: [THORNMAIL],
  skills: [DRAW_THE_OATH, GLACIAL_SLAM],
} as const;

/**
 * The end of the Bound Marches, and the first body on the ladder fielded on exactly one stage.
 *
 * ⚠️ **It set the precedent the six-chapter re-cut made a rule** — when this was authored, every
 * other chapter boss was an archetype the chapter had already been fielding, with The Unmade
 * standing in nine stages before the one it named. This appears at `c5-s50` and nowhere else,
 * which is the whole of what "a boss is unique" buys: the last encounter of a chapter is the one a
 * player remembers, and a stat block they have already beaten four times is a stage number.
 *
 * It fields three of the chapter's four mechanics at once and leaves the fourth to the wall
 * standing in front of it: the board is bound, so nothing can be removed alone; it is thorned, so
 * working through it costs; and the Doomknell brands all five at once against a cleanse that can
 * only ever answer one. Sized **under** The Unmade rather than above it — `enemies.spec.ts` holds
 * that ceiling, and what makes this the harder fight is the questions rather than the numbers.
 */
export const CHAINSWORN = {
  id: 'chainsworn',
  name: 'The Chainsworn',
  faction: 'undead',
  tier: 'ascended',
  stats: {
    hp: 1700,
    atk: 98,
    def: 52,
    recovery: 7,
    haste: 92,
    critChance: 0.12,
    critDamageAmp: 0.9,
    critDamageResist: 0.2,
    tenacity: 0.45,
    lifeLeech: 0.15,
    physicalPierce: 0.25,
    magicPierce: 0.25,
  },
  opening: [THORNMAIL],
  skills: [BIND_THE_CONCORD, DOOMKNELL, TYRANTS_CLAIM],
} as const;

// ---------------------------------------------------------------------------------------
// The Sundered Vault — milestone 18
//
// ## Eight blocks, no new mechanics, and why that is the honest framing
//
// Milestone 17 grew the vocabulary once and recorded that it was the last time — every targeting,
// status and effect kind is in use, and a ninth spelling of an existing skill is the thing that
// milestone refused to ship. So this chapter does not claim a new lever. What it has instead is
// **two things nothing has combined before**:
//
// 1. **Pairs.** A taunt welded to an absorb pool; a cleanse welded to a tempo buff; a wide hit
//    that switches off once the party has lost somebody. Each is two known parts on one body, and
//    each asks a question neither part asks alone.
// 2. **The matchup matrix, pointed one way.** An Angel or a Demon deals 1.10 to every mortal and
//    **nothing comes back** — there is no `human → angel` row, by design. A celestial-led chapter
//    is therefore the one place on the ladder where the matrix is a standing tax rather than a
//    tiebreak, and no mortal party can answer it with composition. That is the Vault's difficulty
//    signature, and it is why the lean is *moderate*: at every board it would stop being a texture
//    and become a second level dial stacked on the first.
//
// | Enemy                | The question                                          | The answer                     |
// | -------------------- | ----------------------------------------------------- | ------------------------------ |
// | Sealward Custodian   | what if the wall you must hit is wearing a shield?    | burst inside the gap, or go wide |
// | Antiphon Archon      | what if your setup is removed *and* paid for?         | damage that needs no setup     |
// | Riftborn Harrower    | what if the fight is hardest while you are whole?     | open fast; do not trade slowly |
// | Covenant Breaker     | what if wounding it is what points it at your carry?  | burst it, or do not start      |
// | The Hollow Seraph    | all three at once, on something that cannot be slowed | everything above, in one fight |
//
// ## Scale
//
// Sized inside the Bound Marches band rather than above it, and the boss sized **under** The
// Unmade on both `hp` and `atk` exactly as The Chainsworn is. `enemies.spec.ts` holds that
// ceiling. What makes the Vault harder is the level its stages are fielded at, the pairs above,
// and the matrix — not bigger blocks, which is the distinction milestone 10 bought.
// ---------------------------------------------------------------------------------------

/**
 * The jailer that steps in front of its own board wearing the pool it was saving for the door.
 *
 * ⚠️ **The safe inversion of the shape chapter 3 is forbidden from repeating.** The Bound Marches
 * field exactly one healer behind a taunt, at stage 10, where the party is far above the level —
 * because sustain the party cannot aim at is a ninety-second clock and a timeout is a defeat. This
 * puts the durability **on the taunting body itself**, which flips the whole argument: the one
 * thing the party is allowed to hit is the one thing it needs to kill. Nothing here is unreachable
 * and nothing refills, so the fight resolves however the party plays it.
 *
 * Little offence, like the Vanguard it is descended from: what it costs the party is turns.
 */
export const SEALWARD_CUSTODIAN = {
  id: 'sealward-custodian',
  name: 'Sealward Custodian',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 1080,
    atk: 60,
    def: 42,
    recovery: 5,
    haste: 72,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.1,
    tenacity: 0.3,
    physicalResist: 0.06,
    magicResist: 0.08,
  },
  skills: [DRAW_THE_OATH, WARD_THE_SEAL],
} as const;

/**
 * The Vault's answer to being debuffed, and the first enemy that takes tempo as well.
 *
 * A Runewarden already removes the party's setup, so that lock is not new. What is new is what
 * this spends the turn on afterwards: a Runewarden buys **armour** and this buys **speed**, so the
 * board that just shrugged off the opening starts acting more often than the party does. Fragile
 * on purpose — the answer is to kill it, and an answer nobody can reach is not one.
 */
export const ANTIPHON_ARCHON = {
  id: 'antiphon-archon',
  name: 'Antiphon Archon',
  faction: 'angel',
  tier: 'legendary',
  stats: {
    hp: 720,
    atk: 56,
    def: 22,
    haste: 102,
    critChance: 0.04,
    critDamageAmp: 0.5,
    insight: 0.16,
    magicResist: 0.12,
  },
  skills: [ANTIPHON],
} as const;

/** Light kept burning in a place nobody has walked for an age. Celestial filler, and cheap. */
export const VAULTLIGHT_CENSER = {
  id: 'vaultlight-censer',
  name: 'Vaultlight Censer',
  faction: 'angel',
  tier: 'common',
  stats: {
    hp: 500,
    atk: 44,
    def: 14,
    haste: 104,
    critChance: 0.05,
    critDamageAmp: 0.6,
    magicResist: 0.12,
  },
  skills: [MOTE_LANCE],
} as const;

/**
 * What came through when the seal gave, and it is worst in the first ten seconds.
 *
 * Every other wide threat on the ladder eases as the party thins. {@link RIFTFALL} switches off
 * once the party is down to three, so this is the one encounter that is hardest while the party is
 * **intact** — it cannot be out-lasted, only out-opened. A party that spends its first two turns
 * setting up has already taken the worst of it.
 */
export const RIFTBORN_HARROWER = {
  id: 'riftborn-harrower',
  name: 'Riftborn Harrower',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 70,
    def: 20,
    haste: 100,
    critChance: 0.1,
    critDamageAmp: 0.75,
    insight: 0.18,
    magicPierce: 0.15,
    magicResist: 0.08,
  },
  skills: [RIFTFALL, GORE],
} as const;

/** What was in the lesser cells: quick, starving, and not individually a problem. */
export const UNSEALED_WRETCH = {
  id: 'unsealed-wretch',
  name: 'Unsealed Wretch',
  faction: 'demon',
  tier: 'common',
  stats: {
    hp: 480,
    atk: 46,
    def: 10,
    haste: 118,
    critChance: 0.1,
    critDamageAmp: 0.65,
    dodge: 0.12,
    lifeLeech: 0.08,
  },
  skills: [CUTPURSE],
} as const;

/**
 * An oath that means nothing until it is broken, and then means the party's carry.
 *
 * A Wrathborn is the roster's other `self-hurt` body and it buffs itself, so chipping one is a step
 * toward killing it through a window. This answers being chipped by **reaching past the front
 * rank at whatever is biggest** — so wounding it is not progress, it is the thing that turns it
 * around. The party either commits and bursts it or leaves it alone, and there is no third option
 * where it is slowly worn down safely.
 */
export const COVENANT_BREAKER = {
  id: 'covenant-breaker',
  name: 'Covenant Breaker',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 900,
    atk: 68,
    def: 26,
    haste: 94,
    critChance: 0.09,
    critDamageAmp: 0.8,
    tenacity: 0.3,
    lifeLeech: 0.12,
    physicalPierce: 0.15,
  },
  skills: [BROKEN_COVENANT, FLENSE],
} as const;

/**
 * Still at its post, some centuries after there was anything to guard.
 *
 * The mortal body the Vault's boards are built on, and the reason the celestial lean is a texture
 * rather than a second level dial: a board of nothing but Angels and Demons taxes a mortal party
 * 1.10 on every incoming hit with nothing coming back, and at every stage that stops being a
 * flavour and becomes arithmetic the party cannot answer.
 */
export const VAULTBOUND_GAOLER = {
  id: 'vaultbound-gaoler',
  name: 'Vaultbound Gaoler',
  faction: 'human',
  tier: 'common',
  stats: {
    hp: 760,
    atk: 48,
    def: 26,
    haste: 76,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    physicalResist: 0.08,
  },
  skills: [GATE_SLAM],
} as const;

/**
 * What the chains were holding, and the second body on the ladder fielded on exactly one stage.
 *
 * The Chainsworn set that precedent one chapter ago and the argument is unchanged: the last
 * encounter of a chapter is the one a player remembers, and a stat block they have already beaten
 * four times is a stage number. It stands on `c6-s50` and nowhere else.
 *
 * Its three turns are the chapter's three pairs on one body — it wears the pool ({@link
 * WARD_THE_SEAL}), it takes the party's setup back and quickens its own board ({@link ANTIPHON}),
 * and it asks the one question a cleanse cannot answer ({@link THE_SEAL_BREAKS}, whose stun is not
 * removable).
 *
 * ⚠️ **Deliberately no healing, no regeneration and no ally shield.** Three things on this board
 * make a party live longer than it can kill — an absorb, a tempo buff and a stun — and every one
 * of them is a step toward the ninety-second timeout that is scored as a **defeat**. What keeps it
 * resolving is that the absorb is on **one** body and depletes, and that nothing anywhere in the
 * encounter puts health back.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds. What makes
 * this the harder fight is the level it is fielded at and the questions it asks.
 */
export const HOLLOW_SERAPH = {
  id: 'hollow-seraph',
  name: 'The Hollow Seraph',
  faction: 'angel',
  tier: 'ascended',
  stats: {
    hp: 1760,
    atk: 99,
    def: 54,
    recovery: 7,
    haste: 98,
    critChance: 0.14,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    tenacity: 0.5,
    physicalPierce: 0.25,
    magicPierce: 0.3,
  },
  skills: [WARD_THE_SEAL, ANTIPHON, THE_SEAL_BREAKS],
} as const;

// ---------------------------------------------------------------------------------------
// The chapter finals — the re-cut ladder's unique bosses
//
// The six-chapter re-cut made "every chapter ends on a boss fielded nowhere else" a rule rather
// than a precedent. The Chainsworn and the Hollow Seraph already satisfied it; these four close
// the gap for chapters 1 through 4. Each stands on exactly one stage — its chapter's last — and
// in no tower, which is the whole of what it is for: the last encounter of a chapter is the one a
// player remembers, and a stat block they have already beaten four times is a stage number.
//
// ⚠️ **No new mechanics, and not even a new skill.** Milestone 17 closed the vocabulary and
// milestone 18 held the line with pairs; these go one step further and are authored entirely from
// **skills already in the file**, recombined. What makes each unique is the body wearing the kit
// and the board standing around it. All four sit under The Unmade on both `hp` and `atk` —
// `enemies.spec.ts` holds that ceiling, and what ramps across the four is the level they are
// fielded at, not the blocks.
// ---------------------------------------------------------------------------------------

/**
 * The fen's king, and the first boss the re-cut ladder meets — at stage 10, as chapter 1's final.
 *
 * It wears the absorb lesson itself: {@link WARD_THE_SEAL} banks a pool on the one body the fight
 * is shaped around, the pool depletes, and nothing on the board refills it. That is the Custodian's
 * skill without the Custodian's question — there is no taunt here, so nothing *forces* the party
 * onto the shield; it is simply that the biggest thing on the board is the thing that has to die.
 * A party that learned the Bulwark's barrier over the last nine stages meets the same idea grown a
 * tier.
 *
 * Deliberately **no healing anywhere on its board**, which is the rule every final observes: an
 * absorb depletes and a heal does not, and a timeout is a defeat.
 */
export const FENLORD = {
  id: 'fenlord',
  name: 'The Fenlord',
  faction: 'monster',
  tier: 'ascended',
  stats: {
    hp: 1250,
    atk: 62,
    def: 22,
    recovery: 5,
    haste: 76,
    critChance: 0.06,
    critDamageAmp: 0.7,
    critBlock: 0.1,
    tenacity: 0.25,
    physicalResist: 0.1,
  },
  skills: [WARD_THE_SEAL, GORE],
} as const;

/**
 * The master of the gates the Drowned Ward is built from, and chapter 2's final.
 *
 * A Gate Warden takes a turn away; the Pale Warden is where that lesson graduates. {@link
 * GATE_SLAM} is the same spike the chapter has been teaching the party to survive, and {@link
 * GLACIAL_SLAM} is the armour gate's own heavy turn pointed at whoever stands in front. The
 * durability is **on its own body** — plate, crit-block and tenacity rather than a healer behind a
 * wall, which is the safe inversion chapter 3 of the old ladder wrote down: everything the party
 * must kill is a thing it is allowed to hit.
 */
export const PALE_WARDEN = {
  id: 'pale-warden',
  name: 'The Pale Warden',
  faction: 'human',
  tier: 'ascended',
  stats: {
    hp: 1150,
    atk: 58,
    def: 26,
    recovery: 6,
    haste: 88,
    critChance: 0.08,
    critDamageAmp: 0.7,
    critDamageResist: 0.15,
    critBlock: 0.12,
    tenacity: 0.3,
    insight: 0.1,
    physicalResist: 0.08,
  },
  skills: [GATE_SLAM, GLACIAL_SLAM],
} as const;

/**
 * The first flame that walked out of the fen, and chapter 3's final — the seam where the mire
 * starts burning.
 *
 * The Cinder Mire closes on the penetration lesson the Ravagers spent ten stages teaching, and
 * this is that lesson wearing a crown: pierce on the stat block, {@link FLENSE} opening both front
 * bodies at once, and {@link CINDER_STORM} taxing the party that answered everything with physical
 * armour. Burst and burn together, from a body fast enough that neither can be waited out.
 */
export const FIRST_CINDER = {
  id: 'first-cinder',
  name: 'The First Cinder',
  faction: 'demon',
  tier: 'ascended',
  stats: {
    hp: 1350,
    atk: 72,
    def: 24,
    recovery: 5,
    haste: 100,
    critChance: 0.12,
    critDamageAmp: 0.85,
    tenacity: 0.3,
    physicalPierce: 0.25,
    magicResist: 0.08,
  },
  skills: [FLENSE, CINDER_STORM],
} as const;

/**
 * What rules the Ashfall Reach, and chapter 4's final — in the slot The Unmade held when this was
 * the whole ladder's last fight.
 *
 * The Unmade still stands in its nine other stages; what this asks is the pair it never did.
 * {@link WRATH_UNBOUND} is the escalation lock at boss scale — chipping the Sovereign down is the
 * thing that turns it on — and {@link HEADSMANS_ARC} is what it spends the window on: not the
 * wall, the weakest. Beside the Gallows Headsman already behind it, that is two executioners on
 * one board, so sustain pointed at the tank answers neither. Burst it through the window, or keep
 * all five standing; there is no third option where it is worn down slowly and nobody is at risk.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds.
 */
export const ASHFALL_SOVEREIGN = {
  id: 'ashfall-sovereign',
  name: 'The Ashfall Sovereign',
  faction: 'demon',
  tier: 'ascended',
  stats: {
    hp: 1740,
    atk: 97,
    def: 50,
    recovery: 7,
    haste: 94,
    critChance: 0.14,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    tenacity: 0.45,
    physicalPierce: 0.25,
    magicPierce: 0.2,
  },
  skills: [WRATH_UNBOUND, HEADSMANS_ARC],
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
  FREE_BLADE,
  BARROW_SOVEREIGN,
  FORGE_THRALL,
  DEEPROCK_MINER,
  RUNEWARDEN,
  THORNLING,
  GLADE_STALKER,
  THORNWEALD_WARDEN,
  MOONSONG_WEAVER,
  WYRDROOT_ANCIENT,
  LUMEN_ACOLYTE,
  GILDED_SENTRY,
  RADIANT_HERALD,
  ASHEN_CHOIR,
  SERAPH_ADJUDICANT,
  CINDERLING,
  BLOODPACT_FIEND,
  HEXBOUND_TORMENTOR,
  OATHSHIELD_VANGUARD,
  BRAMBLEHIDE_RAVENER,
  CONCORD_CANTOR,
  EMBERSEED_WARLOCK,
  MARCHWARD_PIKEMAN,
  BRAMBLEWALK_SCOUT,
  RIVEN_MARCHWARDEN,
  CHAINSWORN,
  FENLORD,
  PALE_WARDEN,
  FIRST_CINDER,
  ASHFALL_SOVEREIGN,
  SEALWARD_CUSTODIAN,
  ANTIPHON_ARCHON,
  VAULTLIGHT_CENSER,
  RIFTBORN_HARROWER,
  UNSEALED_WRETCH,
  COVENANT_BREAKER,
  VAULTBOUND_GAOLER,
  HOLLOW_SERAPH,
] as const;
