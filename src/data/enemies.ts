import {
  ANTIPHON,
  BARROW_TITHE,
  BIND_THE_CONCORD,
  BLOOD_CALLS_BLOOD,
  BLOOD_RISEN,
  BROKEN_COVENANT,
  BULWARK,
  CHALLENGE_BELLOW,
  CHOIR_OF_ASH,
  CINDER_STORM,
  COUCHED_LANCE,
  CULL_THE_EMBERS,
  CUTPURSE,
  DOOMKNELL,
  DRAW_INTO_THE_ROOT,
  DRAW_THE_OATH,
  EMBERSEED,
  FADE,
  FLENSE,
  GATE_SLAM,
  GLACIAL_SLAM,
  GORE,
  HEADSMANS_ARC,
  HERALDS_ANTHEM,
  IRON_FOR_IRON,
  LITANY,
  MAUL,
  MEND,
  MIRE,
  MOONSONG,
  MOTE_LANCE,
  NAME_THE_QUARRY,
  NIGHT_RIDE,
  NO_ANSWER_COMES,
  OPEN_THE_VEIN,
  PALL_OF_YEARS,
  PILLAR_OF_LIGHT,
  RAKE,
  RELIQUARY_SEAL,
  RIFTFALL,
  RIFTSTEP,
  ROOTWAKE,
  RUINOUS_ARC,
  RUINOUS_STOOP,
  RUNEWARD,
  SEVENFOLD_HEX,
  SHIELD_BASH,
  SHRIKE_DIVE,
  SLUNG_ANVIL,
  STONE_FIST,
  SUNFADE,
  THE_ANVIL_FALLS,
  THE_BARROW_FORGETS,
  THE_BREACH_GIVEN,
  THE_CANOPY_PARTS,
  THE_DEBT_CALLED,
  THE_FIELD_CLOSES,
  THE_HORN_SOUNDS,
  THE_LAST_MUSTER,
  THE_LINE_TRUE,
  THE_LONG_BLEED,
  THE_LONG_LOOSE,
  THE_PACK_ANSWERS,
  THE_QUENCH,
  THE_SEAL_BREAKS,
  THE_SUN_AT_NOON,
  THE_WARDS_HOLD,
  THORNLASH,
  TYRANTS_CLAIM,
  UNDERMINE,
  WAKE_THE_BONE,
  WARD_THE_SEAL,
  WILDING_BLOOM,
  WITHERHEX,
  WITHERING_TOUCH,
  WRATH_UNBOUND,
  ZENITHFALL,
} from './skills';
import { ROOTBOUND, THORNMAIL } from './statuses';

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

// ---------------------------------------------------------------------------------------
// The Waking Barrows — milestone 21a
//
// ## Ten blocks, all Undead, and the count is the milestone's rather than this chapter's
//
// Milestone 21 fixes the lean of each of its four chapters up front, so that the four sessions
// touch **non-overlapping slices** of this file and so that the four thinnest factions are the ones
// that get deeper. Undead was on seven — the joint-thinnest with Elves — and these take it to
// seventeen. Eight of them are ordinary blocks, and the other two are the shapes this milestone
// added to what a chapter owes:
//
// - **{@link THE_CAIRN_KING}, the chapter boss**, standing on `c7-s50` and nowhere else. That has
//   been the rule since the re-cut and this is the seventh body authored under it.
// - **{@link THE_GRAVEWRIGHT}, the chapter *lieutenant*** — new in milestone 21. One heavy block
//   anchors all four mini-boss boards at rising levels, which is what gives a chapter a recurring
//   antagonist instead of four one-shot stat blocks. Deliberately **not** four unique bodies:
//   twenty blocks each appearing on exactly one board is most of what `enemies.spec.ts`'s orphan
//   rule exists to discourage.
//
// ## What the chapter asks, in five bands
//
// ⚠️ **No new status, and the budget was not spent.** Milestone 21 allows up to three across its
// four chapters and states plainly that a chapter coming in under the ceiling is the better
// outcome. All five locks below are built out of vocabulary that already ships.
//
// | Band | The lock                                             | Built from                        |
// | ---- | ---------------------------------------------------- | --------------------------------- |
// | 1    | the wall you must hit answers every swing            | a taunt on a thorned body         |
// | 2    | the fuse lands on the body you never cleanse         | {@link BARROW_TITHE}              |
// | 3    | going wide is answered once per body you reach       | thorns on the fodder              |
// | 4    | the wall you must hit spreads your damage sideways    | a taunt in front of a linked board |
// | 5    | all four, and the thing the barrows are for          | {@link THE_CAIRN_KING}            |
//
// **Band 3 is the one worth reading twice, because it inverts an answer the ladder has spent two
// hundred stages teaching.** A row attack into three thorned bodies is answered three times — see
// the note in `docs/combat.md` about an actor now being able to die inside its own action — so the
// habitual reply to a crowded board is the expensive one here, and single-target focus is the cheap
// one. That is a real question with a real answer and it needed nothing new to ask.
//
// ## Scale
//
// Sized inside the Sundered Vault's band rather than above it, and both `ascended` blocks sit
// **under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds. What makes chapter 7
// harder than chapter 6 is the level its stages are fielded at and the questions above — not bigger
// blocks, which is the distinction milestone 10 bought and every chapter since has kept.
// ---------------------------------------------------------------------------------------

/** What the barrows give up first: slow, heavy, and still wearing most of its armour. */
export const GRAVEWAKE_THRALL = {
  id: 'gravewake-thrall',
  name: 'Gravewake Thrall',
  faction: 'undead',
  tier: 'common',
  stats: {
    hp: 800,
    atk: 50,
    def: 24,
    haste: 74,
    critChance: 0.03,
    critDamageAmp: 0.5,
    physicalResist: 0.08,
  },
  skills: [STONE_FIST],
} as const;

/** The noise the barrow-mist makes. Fast, fragile, and it reaches past the front rank. */
export const BARROWMIST_KEENER = {
  id: 'barrowmist-keener',
  name: 'Barrowmist Keener',
  faction: 'undead',
  tier: 'common',
  stats: {
    hp: 520,
    atk: 48,
    def: 12,
    haste: 112,
    critChance: 0.06,
    critDamageAmp: 0.6,
    magicResist: 0.12,
  },
  skills: [MOTE_LANCE],
} as const;

/** What was buried with the barrow's owner to keep it company. Quick, and it goes for the back. */
export const SEPULCHRE_HOUND = {
  id: 'sepulchre-hound',
  name: 'Sepulchre Hound',
  faction: 'undead',
  tier: 'common',
  stats: {
    hp: 560,
    atk: 52,
    def: 14,
    haste: 124,
    critChance: 0.12,
    critDamageAmp: 0.7,
    dodge: 0.14,
    lifeLeech: 0.1,
  },
  skills: [CUTPURSE],
} as const;

/**
 * A cairn that stood up, and the cheapest body in the game that costs something to clear.
 *
 * ⚠️ **Thorns on a `common`, which is the whole of band 3.** Every reflect the ladder has fielded
 * so far has been worn by something the party was already treating carefully — The Chainsworn, and
 * this chapter's own Sentinel. On fodder it says something different: a row attack into three of
 * these is answered **three times**, so the reply a crowded board has always wanted is the one that
 * costs most here.
 *
 * Nothing about it is otherwise remarkable, and that is deliberate — the question is what it costs
 * to remove, not what it does while it stands.
 */
export const CAIRNWARD_HUSK = {
  id: 'cairnward-husk',
  name: 'Cairnward Husk',
  faction: 'undead',
  tier: 'common',
  stats: {
    hp: 760,
    atk: 46,
    def: 30,
    haste: 68,
    critChance: 0.02,
    critDamageAmp: 0.5,
    critBlock: 0.08,
    physicalResist: 0.1,
  },
  opening: [THORNMAIL],
  skills: [SHIELD_BASH],
} as const;

/**
 * The barrow's door, and it is made of the same bone as the walls.
 *
 * **A taunt worn by a thorned body — two known parts, never before on one.** An Oathshield Vanguard
 * says "hit me and nothing else"; a Chainsworn says "hitting me costs". Together they say the thing
 * neither says alone: *the only target you are allowed is the one that charges you for taking it*.
 *
 * ⚠️ **Answerable in three ways, which is what makes it a lock rather than a tax.** The taunt runs
 * 45 ticks against {@link DRAW_THE_OATH}'s 60, so there is a window at whatever stands behind it; a
 * multi-target selection ignores the taunt entirely; and the thorns are a flat share, so burst pays
 * the same toll as chip and gets there first. What it punishes is exactly one habit — grinding a
 * wall down with single-target chip — and that habit has been correct for six chapters.
 *
 * Little offence of its own, like the Vanguard and the Custodian it is descended from: what it
 * costs the party is turns and health it chose to spend.
 */
export const CAIRNBOUND_SENTINEL = {
  id: 'cairnbound-sentinel',
  name: 'Cairnbound Sentinel',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 1120,
    atk: 58,
    def: 46,
    recovery: 5,
    haste: 70,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.12,
    tenacity: 0.35,
    physicalResist: 0.08,
    magicResist: 0.06,
  },
  opening: [THORNMAIL],
  skills: [DRAW_THE_OATH, SHIELD_BASH],
} as const;

/**
 * It counts the party and takes the largest.
 *
 * {@link BARROW_TITHE} is the chapter's band-2 lock and the argument is on the skill: a delayed
 * payload aimed at `enemy-highest` lands on the one member a party never points a cleanse at,
 * because the reason that member is there is that it survives things. Fragile in the way every lock
 * on this ladder is fragile — the answer is to kill it, and an answer nobody can reach is not one.
 */
export const GRAVETIDE_HERALD = {
  id: 'gravetide-herald',
  name: 'Gravetide Herald',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 820,
    atk: 70,
    def: 24,
    haste: 98,
    critChance: 0.1,
    critDamageAmp: 0.8,
    insight: 0.16,
    magicPierce: 0.15,
    physicalResist: 0.04,
  },
  skills: [BARROW_TITHE, WITHERING_TOUCH],
} as const;

/**
 * Bone chained to bone, so that no part of the barrow can be taken out of it alone.
 *
 * The link itself is chapter 5's and this does not restate it. What band 4 does is stand this
 * **behind {@link CAIRNBOUND_SENTINEL}**, and that pairing is new: the taunt says the party may only
 * hit the wall, and the link says two fifths of every blow on the wall is spread across everything
 * else still standing. The party is aimed at one body and cannot concentrate on it.
 *
 * ⚠️ **It resolves, and the reason is that a link conserves damage.** Nothing is multiplied and
 * nothing is refunded — the board's total health falls at exactly the rate it always did, just
 * evenly. So this costs the party its *route* (remove one threat, then the next) rather than its
 * progress, which is the difference between a lock and a clock.
 *
 * ⚠️ **It deliberately does not taunt.** Two taunters on one board leave the door shut about
 * ninety-four percent of the time, which is a single-target party locked out of the back rank for
 * a whole fight rather than given a window — the failure `data/skills.spec.ts` enforces the duty
 * cycle to prevent. The chapter fields at most one taunt source per board.
 */
export const BONECHAIN_WARDEN = {
  id: 'bonechain-warden',
  name: 'Bonechain Warden',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 960,
    atk: 60,
    def: 34,
    haste: 80,
    critChance: 0.05,
    critDamageAmp: 0.6,
    critBlock: 0.1,
    tenacity: 0.3,
    physicalResist: 0.06,
  },
  skills: [BIND_THE_CONCORD, MIRE],
} as const;

/**
 * It does not mourn and it does not remember, which is the same thing said about the party's setup.
 *
 * {@link THE_BARROW_FORGETS} is the first `ally-afflicted` turn on the enemy side, and it is not a
 * smaller {@link ANTIPHON}: a board-wide cleanse is answered by having more debuffs than it can
 * take, and this is answered by having them in more places. Three statuses off whichever body
 * carries the most is precisely the punishment for the habit every wall on this ladder has taught —
 * open the big one with a Sunder, a Weaken and a Slow, then commit.
 */
export const GRAVEMOURN_KEEPER = {
  id: 'gravemourn-keeper',
  name: 'Gravemourn Keeper',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 58,
    def: 22,
    haste: 96,
    critChance: 0.04,
    critDamageAmp: 0.5,
    insight: 0.14,
    magicResist: 0.12,
  },
  skills: [THE_BARROW_FORGETS, MOTE_LANCE],
} as const;

/**
 * The thing doing the raising, met four times and never finished.
 *
 * ⚠️ **The ladder's first *lieutenant*, and the shape is milestone 21's rather than this chapter's.**
 * It stands on `c7-s10`, `c7-s20`, `c7-s30` and `c7-s40` — every mini-boss board — at rising levels,
 * so the chapter has a recurring antagonist that gets harder because the ladder does rather than
 * because a second stat block was written for it. Four unique mini-boss bodies would have been four
 * blocks each appearing once, which is the thing the orphan rule in `enemies.spec.ts` discourages
 * and which nobody would remember either.
 *
 * {@link WAKE_THE_BONE} is what it opens with and it is the only thing in the game that hands a
 * board {@link THORNMAIL} mid-fight — so every mini-boss in this chapter turns into a band-3 board
 * on the Gravewright's first turn, whether or not one was authored that way. After that it stops
 * setting up and starts collecting: {@link HEADSMANS_ARC} ignores rank and takes whoever is lowest,
 * which is the member the thorns have been quietly working on.
 *
 * ⚠️ **No healing, no drain and no regeneration anywhere in the kit**, which is not a coincidence —
 * see the Sundered Vault's boards for the argument. Every pool it puts on the field is one that
 * depletes, so the fight resolves however the party plays it.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, and under {@link THE_CAIRN_KING} as well: a
 * lieutenant that matched the chapter's final would make the final the fifth time you fought it.
 */
export const THE_GRAVEWRIGHT = {
  id: 'the-gravewright',
  name: 'The Gravewright',
  faction: 'undead',
  tier: 'ascended',
  stats: {
    hp: 1560,
    atk: 90,
    def: 46,
    recovery: 6,
    haste: 94,
    critChance: 0.12,
    critDamageAmp: 0.85,
    critDamageResist: 0.15,
    tenacity: 0.4,
    physicalPierce: 0.2,
    magicResist: 0.06,
  },
  skills: [WAKE_THE_BONE, HEADSMANS_ARC],
} as const;

/**
 * What the barrows are for, and the third body on the ladder fielded on exactly one stage.
 *
 * The Chainsworn and the Hollow Seraph set the rule and it is unchanged: a chapter's last encounter
 * is the one a player remembers, and a stat block they have already beaten four times is a stage
 * number. It stands on `c7-s50` and nowhere else.
 *
 * ⚠️ **That rule is about the _headline_ body, and this comment used to over-read it.** It said the
 * Gravewright was "**not** on that board, having been the thing they beat four times" — and the
 * Gravewright is on that board, in the back rank, where it is support rather than the fight. See
 * `c7-s50` in [`chapter-7.ts`](./chapter-7.ts): removing it makes the chapter final 6% harder than
 * the stage before it and hands the party it is tuned for a five-survivor clear, which is the same
 * defect the taunting-King draft was rejected for. **A lieutenant may stand on its chapter's final;
 * it may not _be_ it.**
 *
 * Its three turns are aimed at three different things: {@link BARROW_TITHE} at the largest body
 * standing, {@link HEADSMANS_ARC} at the smallest, and {@link WAKE_THE_BONE} at its own board. With
 * {@link THORNMAIL} already true of it from the first tick, that is the chapter's opening lock
 * stated at boss weight — every swing answered — and its board's Cairnbound Sentinel is what
 * decides the party has to take those swings.
 *
 * ⚠️ **It does not taunt, and the first draft's version of it did.** A boss that draws every attack
 * onto itself is the fight the party already wanted: it aims them at the body they were going to
 * focus anyway, and it spends the boss's own turns on something that deals no damage. Measured, that
 * King asked *less* of a party than the stage before it — 738 against 878 on the difficulty probe —
 * and the reference party finished it with all five alive. The taunt belongs on the wall in front,
 * which is the Hollow Seraph's shape and the reason that shape works.
 *
 * ⚠️ **Deliberately no healing, no drain and no shield**, which is the rule every chapter final
 * observes. Three of the things on its board make a party live longer than it can kill, and every
 * one of them is a step toward the ninety-second timeout that is scored as a **defeat**. What keeps
 * it resolving is that a reflect only ever shortens a fight and nothing anywhere on the encounter
 * puts health back.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds. What makes
 * this the harder fight is the level it is fielded at and the questions it asks.
 */
export const THE_CAIRN_KING = {
  id: 'the-cairn-king',
  name: 'The Cairn King',
  faction: 'undead',
  tier: 'ascended',
  stats: {
    hp: 1780,
    atk: 99,
    def: 55,
    recovery: 7,
    haste: 96,
    critChance: 0.14,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    tenacity: 0.5,
    physicalPierce: 0.25,
    magicPierce: 0.25,
  },
  opening: [THORNMAIL],
  skills: [WAKE_THE_BONE, BARROW_TITHE, HEADSMANS_ARC],
} as const;

// ---------------------------------------------------------------------------------------
// The Sunless Weald — milestone 21b
//
// ## Ten blocks, all Elven, and the count is the milestone's rather than this chapter's
//
// Milestone 21 fixes each of its four chapters' leans up front so the four sessions touch
// **non-overlapping slices** of this file and the four thinnest factions are the ones that get
// deeper. Elves were on seven — the joint-thinnest with the Undead before 21a — and these take
// them to seventeen. Eight are ordinary blocks and two are the shapes a chapter owes:
//
// - **{@link THE_WITHERED_CROWN}, the chapter boss**, standing on `c8-s50` and nowhere else. The
//   eighth body authored under that rule.
// - **{@link THE_LONGSHADOW}, the chapter *lieutenant***, on all four mini-boss boards at rising
//   levels. The second of these — see {@link THE_GRAVEWRIGHT} for the argument.
//
// ## What the chapter asks, in five bands
//
// ⚠️ **One new status, and it is the first of milestone 21's three to be spent.** 21a came in
// under the ceiling and this does not; {@link ROOTBOUND} is argued on its own merits in
// `statuses.ts` and the entry in [milestones](../../docs/milestones.md) states why a pair could not
// have asked band 3's question. It rides the existing `status` effect exactly as milestone 17's
// four did, needs no new `EffectKind`, no new `TargetKind` and no change in `ui/`.
//
// | Band | The lock                                              | Built from                     |
// | ---- | ----------------------------------------------------- | ------------------------------ |
// | 1    | the thing you are aiming at is not always there       | `dodge`, on the stat blocks    |
// | 2    | your back rank was never the safe half                | {@link THE_LONG_LOOSE}         |
// | 3    | reaching past the wall buys spread, not a kill        | {@link ROOTBOUND}              |
// | 4    | the one you commit to is pulled back into the whole   | {@link DRAW_INTO_THE_ROOT}     |
// | 5    | all four, and the thing the weald grew around         | {@link THE_WITHERED_CROWN}     |
//
// **Band 1 is a stat block and nothing else, deliberately.** `ModifiableStat` is `atk`, `def` and
// `haste`, so evasion cannot be a status without a `core/` change this milestone forbids — and it
// does not need to be. What answers `dodge` is `accuracy`, which five characters carry and four of
// them are Elves, so the chapter's own faction is the readable answer to its opening question.
// `MIN_HIT_CHANCE` is what stops it ever being a wall: a tenth of every swing lands whatever the
// pool says, which is the termination guard `data/combat.ts` argues for.
//
// ## Scale
//
// Both `ascended` blocks sit **under The Unmade on `hp` and `atk`**, which `enemies.spec.ts` holds,
// and the Crown sits under The Cairn King on both as well — what makes this the harder chapter is
// the level its stages are fielded at and the questions above, which is the distinction milestone
// 10 bought and every chapter since has kept.
// ---------------------------------------------------------------------------------------

/**
 * The weald's cheapest question: a body that is not reliably where it was aimed at.
 *
 * `dodge: 0.26` is the highest in the game on a `common` and half again the previous ceiling — a
 * Glade Stalker sits at 0.2 and nothing else has ever gone past it. Against a party at plain
 * accuracy that is a quarter of every swing, and against Rin at 1.10 it is a sixth, which is the
 * whole of what this chapter wants said out loud: **accuracy is a stat somebody in the roster owns,
 * and this is where owning it starts mattering.**
 *
 * Fragile in every other respect, so a swing that does land settles it. The tax is on the number of
 * turns spent, not on what a turn is worth.
 */
export const DUSKFERN_SKIRMISHER = {
  id: 'duskfern-skirmisher',
  name: 'Duskfern Skirmisher',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 540,
    atk: 54,
    def: 12,
    haste: 126,
    critChance: 0.1,
    critDamageAmp: 0.7,
    dodge: 0.26,
    accuracy: 1.05,
    magicResist: 0.06,
  },
  skills: [GORE],
} as const;

/** The weald's idea of a wall: bark, and not much else. Slow, stubborn, and no threat at all. */
export const HOLLOWBARK_SENTRY = {
  id: 'hollowbark-sentry',
  name: 'Hollowbark Sentry',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 840,
    atk: 46,
    def: 32,
    haste: 64,
    critChance: 0.02,
    critDamageAmp: 0.5,
    critBlock: 0.1,
    physicalResist: 0.12,
  },
  skills: [SHIELD_BASH],
} as const;

/**
 * The far shot, at fodder weight: it was never going to fight the front rank.
 *
 * Three of these behind a Sentry is band 2 stated at its cheapest — the party's wall is doing its
 * job perfectly and the party is still losing its back rank.
 */
export const WHISPERLEAF_ARCHER = {
  id: 'whisperleaf-archer',
  name: 'Whisperleaf Archer',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 500,
    atk: 56,
    def: 12,
    haste: 112,
    critChance: 0.08,
    critDamageAmp: 0.65,
    dodge: 0.14,
    magicPierce: 0.12,
  },
  skills: [MOTE_LANCE],
} as const;

/**
 * Where the roots come up, and the cheapest body on the ladder that cannot be removed on its own.
 *
 * ⚠️ **{@link ROOTBOUND} on a `common`, which is the whole of band 3** — the same move 21a made
 * putting thorns on a Husk, aimed at the opposite habit. Thorns on fodder punished going wide;
 * a bound back rank punishes going *deep*: two of these behind a wall means the sniper the party
 * fields to reach past the front rank hands a third of every shot to the other one.
 *
 * Nothing else about it is remarkable, deliberately. The question is what it costs to remove, not
 * what it does while it stands.
 */
export const GLOAMVINE_CREEPER = {
  id: 'gloamvine-creeper',
  name: 'Gloamvine Creeper',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 720,
    atk: 44,
    def: 26,
    haste: 68,
    critChance: 0.02,
    critDamageAmp: 0.5,
    physicalResist: 0.08,
  },
  opening: [ROOTBOUND],
  skills: [MIRE],
} as const;

/**
 * The evasion lock at weight, and the one body in the chapter that is both hard to hit and worth
 * hitting.
 *
 * A Skirmisher taxes the party's turns and dies to one of them. This carries `dodge: 0.34` on a
 * stat block that kills things, and it takes the lowest body on the field — so the member the
 * party is trying to keep alive is being aimed at by the thing the party keeps missing.
 *
 * ⚠️ **Answerable, and by three different things.** Accuracy shortens it directly; `enemy-row` and
 * `enemy-all` selections roll per target, so going wide converts one unlucky miss into four rolls;
 * and `MIN_HIT_CHANCE` means it is never a wall however the pool is stacked.
 */
export const WEALDSHADOW_STALKER = {
  id: 'wealdshadow-stalker',
  name: 'Wealdshadow Stalker',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 820,
    atk: 76,
    def: 20,
    haste: 118,
    critChance: 0.16,
    critDamageAmp: 0.85,
    dodge: 0.34,
    accuracy: 1.1,
    physicalPierce: 0.15,
    magicResist: 0.06,
  },
  skills: [HEADSMANS_ARC, CUTPURSE],
} as const;

/**
 * It opens the half of the party nobody has ever had to defend.
 *
 * {@link THE_LONG_LOOSE} is band 2's lock and the argument is on the skill: every status the enemy
 * side applies lands on the front rank, on one chosen body, or on everybody, and this is the first
 * aimed at the three the party keeps behind its wall. What follows it is ordinary — Archers and
 * Stalkers already reach there — which is the point. The sequence is the new thing, not either half.
 */
export const LONGBOUGH_MARKSMAN = {
  id: 'longbough-marksman',
  name: 'Longbough Marksman',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 78,
    def: 20,
    haste: 102,
    critChance: 0.12,
    critDamageAmp: 0.8,
    dodge: 0.16,
    accuracy: 1.12,
    physicalPierce: 0.2,
  },
  skills: [THE_LONG_LOOSE, SHRIKE_DIVE],
} as const;

/**
 * The wood pulling its hurt back into itself.
 *
 * {@link DRAW_INTO_THE_ROOT} is band 4's lock, and it occupies a healer's slot in a kit without
 * being one: it waits until the party has committed to a target and then binds *that* body, so the
 * damage already aimed at it starts arriving somewhere else.
 *
 * ⚠️ **Which is why this may stand behind a taunt and a Thornweald Warden may not.** It puts no
 * health back — it moves what has not landed yet — so nothing it does can outrun the ninety-second
 * clock. It is the one answer to focus fire in the game that is not sustain, and that distinction is
 * the reason band 4 has boards a healer could not have been put on.
 */
export const HEARTROOT_TENDER = {
  id: 'heartroot-tender',
  name: 'Heartroot Tender',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 800,
    atk: 62,
    def: 24,
    haste: 92,
    critChance: 0.04,
    critDamageAmp: 0.5,
    insight: 0.16,
    tenacity: 0.3,
    magicResist: 0.12,
  },
  opening: [ROOTBOUND],
  skills: [DRAW_INTO_THE_ROOT, MOTE_LANCE],
} as const;

/**
 * The tempo half of the weald, and the reason band 1 is not simply "bring accuracy".
 *
 * {@link MOONSONG} takes a third of the gauge off all five, so a party paying a quarter of its
 * swings to `dodge` is paying it out of fewer turns. Neither half is new; standing them together is
 * the chapter's first pair, and it is the one that decides whether a party's answer to evasion is
 * *enough* accuracy or merely *some*.
 */
export const NIGHTCANOPY_SINGER = {
  id: 'nightcanopy-singer',
  name: 'Nightcanopy Singer',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 740,
    atk: 66,
    def: 20,
    haste: 106,
    critChance: 0.08,
    critDamageAmp: 0.7,
    dodge: 0.2,
    insight: 0.18,
    magicResist: 0.1,
  },
  skills: [MOONSONG, THORNLASH],
} as const;

/**
 * The thing that has been following the party since the barrows, met four times and never finished.
 *
 * The ladder's second **lieutenant**, and the shape is settled now rather than new — see
 * {@link THE_GRAVEWRIGHT}. It stands on `c8-s10`, `c8-s20`, `c8-s30` and `c8-s40` at rising levels,
 * so the chapter has a recurring antagonist that gets harder because the ladder does.
 *
 * {@link ROOTWAKE} is what it opens with, which makes every mini-boss board in this chapter a
 * band-3 board on the Longshadow's first turn whether or not one was authored that way — the same
 * relationship {@link WAKE_THE_BONE} has with chapter 7's mini-bosses, and the reason a lieutenant
 * is worth more than four one-shot stat blocks. After that it stops setting up and starts reaching:
 * {@link THE_LONG_LOOSE} opens the party's back rank and {@link CUTPURSE} is already there.
 *
 * ⚠️ **No healing, no drain and no regeneration**, which is the standing rule for anything a chapter
 * fields four times. Every pool it puts on the field depletes, and a link puts nothing back at all.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`, and under {@link THE_WITHERED_CROWN} as
 * well** — a lieutenant that matched the chapter's final would make the final the fifth time you
 * fought it.
 */
export const THE_LONGSHADOW = {
  id: 'the-longshadow',
  name: 'The Longshadow',
  faction: 'elf',
  tier: 'ascended',
  stats: {
    hp: 1500,
    atk: 92,
    def: 44,
    recovery: 6,
    haste: 108,
    critChance: 0.16,
    critDamageAmp: 0.9,
    critDamageResist: 0.15,
    tenacity: 0.4,
    dodge: 0.22,
    accuracy: 1.15,
    physicalPierce: 0.22,
  },
  skills: [ROOTWAKE, THE_LONG_LOOSE, CUTPURSE],
} as const;

/**
 * What the weald grew around, and the fourth body on the ladder fielded on exactly one stage.
 *
 * All four of the chapter's questions stand on it at once: it is bound from the first tick and
 * {@link ROOTWAKE} binds everything else to it, `dodge: 0.28` on an `ascended` stat block means the
 * party's answer has to be aimed as well as large, {@link THE_LONG_LOOSE} opens the half of the
 * party its board is already reaching, and {@link HEADSMANS_ARC} takes whoever the spread has been
 * quietly working on.
 *
 * ⚠️ **The bound board is what makes it a boss rather than a wall, and it is the inverse of the
 * Cairn King's.** A thorned board punishes each swing; a bound board refuses the *order* the swings
 * were going to arrive in — so the party that beat chapter 7 by spending more carefully has to beat
 * this one by spending somewhere else. Both resolve, and for the same reason: a reflect only ever
 * shortens a fight and a link conserves damage.
 *
 * ⚠️ **It does not taunt**, which is 21a's finding and not this chapter's to re-derive: a boss that
 * draws every attack onto itself aims them at the body the party was going to focus anyway and
 * spends its own turns dealing nothing. The wall in front is what decides the party has to take the
 * fight it is offered.
 *
 * ⚠️ **No healing, no drain and no shield anywhere on it or its board.** Three things here already
 * make a party live longer than it can kill — a bound board, a dodge pool and a tempo debuff — and
 * every one of them is a step toward the ninety-second timeout that is scored as a **defeat**.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds, and under
 * The Cairn King as well.
 */
export const THE_WITHERED_CROWN = {
  id: 'the-withered-crown',
  name: 'The Withered Crown',
  faction: 'elf',
  tier: 'ascended',
  stats: {
    hp: 1740,
    atk: 98,
    def: 52,
    recovery: 7,
    haste: 104,
    critChance: 0.16,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    tenacity: 0.5,
    dodge: 0.28,
    accuracy: 1.2,
    physicalPierce: 0.25,
    magicPierce: 0.25,
  },
  opening: [ROOTBOUND],
  skills: [ROOTWAKE, THE_LONG_LOOSE, HEADSMANS_ARC],
} as const;

// ---------------------------------------------------------------------------------------
// The Hollow Anvil — milestone 21c
//
// Ten Dwarven blocks, which takes the faction 8 → **18**. That is the depth milestone 21 fixed its
// leans to produce, and the third of the four thin factions it named: undead and elf have already
// been taken to seventeen apiece and Monsters follow in 21d.
//
// ## What the chapter asks, and where each band's lock lives
//
// The barrows asked about *how* the party's damage arrives and the weald about *where* it lands.
// This chapter asks whether **anything the party does stays done** — which is what a hold is, and
// what `tenacity` has meant on a Dwarven stat block since milestone 4 without any content ever
// leaning on it.
//
// | Band | The lock                                                   | Built from                       |
// | ---- | ---------------------------------------------------------- | -------------------------------- |
// | 1    | your setup does not land                                   | `tenacity`, on the stat blocks   |
// | 2    | what you put back does not stay                            | {@link THE_QUENCH}               |
// | 3    | what you commit to is what charges you                     | {@link IRON_FOR_IRON}            |
// | 4    | the one thing you may hit is the one you cannot open       | a taunt worn by a `tenacity` wall |
// | 5    | all four, and the thing the hold was built around          | {@link THE_ANVIL_CROWNED}        |
//
// **Band 1 is a stat block and nothing else, which is the Sunless Weald's move repeated on purpose
// and on a different stat.** `tenacity` is not a `ModifiableStat` — that list is `atk`, `def` and
// `haste` — so refusal cannot be a status without a `core/` change this milestone forbids, and it
// does not need to be. What answers it is `insight`, which appears on exactly two characters, and
// past that the honest answer is the one the Adamant Colossus has always given: **stop needing the
// debuff.** `statusChance` is `authored + insight − tenacity` clamped at zero, so a board at 0.55
// takes an 0.85 Sunder down to 0.30 and a boss at 0.85 takes it to nothing.
//
// ⚠️ **Band 4 is the Sealward Custodian's inversion and it is the only safe shape here.** Sustain
// behind a taunt is a ninety-second clock and a timeout is scored as a **defeat** — so the
// durability goes on the taunting body itself. {@link OATHSTONE_BASTION} is the one thing the party
// is permitted to hit *and* the one thing it needs to kill, every pool on it depletes, and nothing
// on any board it stands on puts health back.
//
// ## Scale, and the one thing a Dwarven chapter has to watch
//
// ⚠️ **This is the faction most able to run the clock out, and the blocks are sized against that
// rather than against the fiction.** Dwarves are the tankiest archetypes in the game and the
// timer's headroom over the longest tuned fight is 1.44×, so nothing here reaches the Riven
// Marchwarden's bulk without a reason: the commons sit at or below the weald's, three of the ten
// carry real `haste`, and the resists are single digits where an Elf or a Monster block would carry
// a fifth. What makes the chapter hard is refusal, not health.
//
// Both `ascended` blocks sit **under The Unmade on `hp` and `atk`**, which `enemies.spec.ts` holds.
// ---------------------------------------------------------------------------------------

/**
 * The hold's cheapest statement: a body that does not care what you write on it.
 *
 * `tenacity: 0.55` is the highest on a `common` in the game and more than double what the Marchward
 * Pikeman carries. Against the party's habitual opener — a Sunder at 0.85, a Weaken at 0.9 — that is
 * roughly a third of what it was, on fodder, which is the whole of what band 1 wants said out loud:
 * **the setup turn is the one being taxed, and it is being taxed by the cheapest thing on the
 * board.**
 *
 * Otherwise unremarkable and deliberately so. Nothing about it is dangerous; what it costs is the
 * turn the party spent expecting a debuff to stick.
 */
export const COLDFORGE_HAND = {
  id: 'coldforge-hand',
  name: 'Coldforge Hand',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 620,
    atk: 52,
    def: 22,
    haste: 80,
    critChance: 0.03,
    critDamageAmp: 0.5,
    tenacity: 0.55,
    physicalResist: 0.08,
  },
  skills: [STONE_FIST],
} as const;

/** The hold's idea of a wall at fodder weight: slag, plate, and a shoulder that blunts a crit. */
export const SLAGBOUND_DRUDGE = {
  id: 'slagbound-drudge',
  name: 'Slagbound Drudge',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 780,
    atk: 48,
    def: 32,
    haste: 64,
    critChance: 0.02,
    critDamageAmp: 0.5,
    critBlock: 0.12,
    tenacity: 0.4,
    physicalResist: 0.12,
  },
  skills: [SHIELD_BASH],
} as const;

/**
 * Band 2 at its cheapest, and the same move the Gloamvine Creeper made for band 3.
 *
 * ⚠️ **{@link THE_QUENCH} on a `common`**, so the lock can be *stacked* rather than met once: two of
 * these behind a wall means the member the party's healer has just topped up is carrying a fuse
 * again before the next heal comes off cooldown. Fragile and quick, because it is not meant to
 * survive being noticed — what it costs the party is the answer, not the body.
 */
export const CINDERQUENCH_BEARER = {
  id: 'cinderquench-bearer',
  name: 'Cinderquench Bearer',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 540,
    atk: 56,
    def: 16,
    haste: 98,
    critChance: 0.06,
    critDamageAmp: 0.6,
    tenacity: 0.3,
    magicPierce: 0.14,
  },
  skills: [THE_QUENCH],
} as const;

/**
 * The one quick thing in the deep, and it is here for the clock as much as for the fiction.
 *
 * A chapter built out of Dwarves is a chapter of slow, armoured bodies, and a board of nothing but
 * those is how a ninety-second timer gets spent. This is the counterweight: the fastest Dwarven
 * block in the game, almost no armour, and it goes straight past the front rank.
 */
export const DEEPGALLERY_RUNNER = {
  id: 'deepgallery-runner',
  name: 'Deepgallery Runner',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 470,
    atk: 60,
    def: 12,
    haste: 118,
    critChance: 0.1,
    critDamageAmp: 0.7,
    tenacity: 0.25,
    physicalPierce: 0.18,
  },
  skills: [CUTPURSE],
} as const;

/**
 * Band 1 at weight: the body the debuff was actually for.
 *
 * A Coldforge Hand taxes a setup turn the party would have spent anyway. This carries
 * `tenacity: 0.8` on a stat block that kills things — so the Sunder the party opens with to make
 * this killable is the Sunder it cannot land, and the answer has to be raw damage, penetration, or
 * one of the two characters in the roster carrying `insight`.
 *
 * ⚠️ **Not a wall, on purpose.** The Adamant Colossus already says "high tenacity on something
 * enormous", and repeating it would make band 1 a stat check. What this says instead is that
 * refusal is dangerous on something that is *not* a wall: it hits back, it is quick enough to matter,
 * and it cannot be slowed down.
 */
export const COLDHEARTH_IRONSWORN = {
  id: 'coldhearth-ironsworn',
  name: 'Coldhearth Ironsworn',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 840,
    atk: 76,
    def: 28,
    haste: 88,
    critChance: 0.1,
    critDamageAmp: 0.75,
    critBlock: 0.08,
    tenacity: 0.8,
    physicalPierce: 0.16,
    physicalResist: 0.06,
  },
  skills: [GLACIAL_SLAM, SHIELD_BASH],
} as const;

/**
 * Band 2 at weight, and the body that makes the band a rhythm rather than an incident.
 *
 * A Bearer plants a fuse and dies to whatever notices it. This plants one, survives, and reaches the
 * party's back rank in between — so the member being healed and the member being shot are not the
 * same member, and the cleanse has somewhere else it is wanted.
 */
export const QUENCHWRIGHT = {
  id: 'quenchwright',
  name: 'Quenchwright',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 800,
    atk: 74,
    def: 24,
    haste: 94,
    critChance: 0.08,
    critDamageAmp: 0.7,
    tenacity: 0.45,
    magicPierce: 0.2,
    magicResist: 0.1,
  },
  skills: [THE_QUENCH, MOTE_LANCE],
} as const;

/**
 * Band 3: it does not kill anything, it arms whatever the party has decided to kill.
 *
 * {@link IRON_FOR_IRON} occupies a healer's slot in a kit without being one — it waits until the
 * party has committed and then thorns *that* body, so the damage already aimed at it starts being
 * billed for. ⚠️ **Which is exactly why this may stand behind a taunt and a Thornweald Warden may
 * not**: a reflect puts no health back and can only ever shorten a fight, so nothing it does can
 * outrun the ninety-second clock.
 *
 * Thorned itself from the first tick, so removing the thing arming the board is the thing the board
 * charges the most for.
 */
export const GRUDGEPLATE_SMITH = {
  id: 'grudgeplate-smith',
  name: 'Grudgeplate Smith',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 820,
    atk: 62,
    def: 30,
    haste: 86,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.1,
    tenacity: 0.5,
    physicalResist: 0.08,
  },
  opening: [THORNMAIL],
  skills: [IRON_FOR_IRON, SHIELD_BASH],
} as const;

/**
 * Band 4, and the Sundered Vault's Sealward Custodian rebuilt out of Dwarven parts.
 *
 * It taunts, so it is the only thing on the board a single-target party may hit — and it carries
 * `tenacity: 0.75` and both resists, so it is also the thing that party cannot open. The pair is the
 * band: reach is worth nothing while the door is shut, and the door is what the party has to go
 * through rather than around.
 *
 * ⚠️ **Every pool on it depletes and nothing on it refills.** No `recovery`, no regeneration, no
 * shield and no drain, which is the whole reason a board can be this defensive and still resolve. A
 * taunt in front of anything that puts health back is the ninety-second timeout wearing a boss's
 * stat block, which is the failure 15c found on the Dwarf Tower's roof and the Bound Marches teach
 * exactly once.
 *
 * ⚠️ **{@link DRAW_THE_OATH} carries a sixty-tick cooldown against a forty-five tick taunt**, and
 * that gap is a rule rather than tuning: `skills.spec.ts` holds it, and it is what leaves a
 * single-target party a window at whatever is standing behind this.
 *
 * {@link THE_ANVIL_FALLS} is the band's other half and it is on the same body on purpose: the door
 * is shut, and the turn the party's wall was going to spend getting through it is the turn this
 * takes. Both sit at priority 4 and the kit order decides, so it taunts first and hammers after.
 */
export const OATHSTONE_BASTION = {
  id: 'oathstone-bastion',
  name: 'Oathstone Bastion',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 1150,
    atk: 64,
    def: 42,
    haste: 70,
    critChance: 0.03,
    critDamageAmp: 0.6,
    critBlock: 0.12,
    critDamageResist: 0.15,
    tenacity: 0.75,
    physicalResist: 0.08,
    magicResist: 0.08,
  },
  skills: [DRAW_THE_OATH, THE_ANVIL_FALLS],
} as const;

/**
 * The thing that has been keeping the tally since the party came down out of the weald.
 *
 * The ladder's third **lieutenant**, and the shape is settled rather than new — see
 * {@link THE_GRAVEWRIGHT} and {@link THE_LONGSHADOW}. It stands on `c9-s10`, `c9-s20`, `c9-s30` and
 * `c9-s40` at rising levels, so the chapter has a recurring antagonist that gets harder because the
 * ladder does rather than four one-shot stat blocks.
 *
 * ⚠️ **Its recurring signature is {@link IRON_FOR_IRON} rather than a board-wide opening turn**,
 * which is the one way it differs from the two before it — and it differs because band 1 is a stat
 * block and cannot be applied by a turn at all. What that buys is better than the parallel would
 * have been: the Gravewright and the Longshadow set their board up on tick one and then stopped,
 * while this responds to what the party is *doing*, so its four appearances are four different
 * fights against the same block depending on how the party spends.
 *
 * {@link THE_ANVIL_FALLS} is band 4's half of it, arriving early on the mini-boss boards for the
 * reason the Gravewright's thorns did: a lieutenant is worth more than a stat block when it teaches
 * the chapter ahead of the chapter.
 *
 * ⚠️ **No healing, no drain and no shield**, which is the standing rule for anything a chapter fields
 * four times. Thorned from the first tick, and thorns are the one defensive thing that cannot
 * lengthen a fight.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`, and under {@link THE_ANVIL_CROWNED} as well** —
 * a lieutenant that matched the chapter's final would make the final the fifth time you fought it.
 */
export const THE_GRUDGEKEEPER = {
  id: 'the-grudgekeeper',
  name: 'The Grudgekeeper',
  faction: 'dwarf',
  tier: 'ascended',
  stats: {
    hp: 1520,
    atk: 89,
    def: 46,
    recovery: 6,
    haste: 92,
    critChance: 0.13,
    critDamageAmp: 0.85,
    critDamageResist: 0.15,
    critBlock: 0.1,
    tenacity: 0.7,
    physicalPierce: 0.22,
    physicalResist: 0.06,
  },
  opening: [THORNMAIL],
  skills: [IRON_FOR_IRON, THE_ANVIL_FALLS, GLACIAL_SLAM],
} as const;

/**
 * What the hold was built around, and the fifth body on the ladder fielded on exactly one stage.
 *
 * All four of the chapter's questions stand on it at once: `tenacity: 0.85` means nothing the party
 * writes on it lands at all, {@link THE_QUENCH} undoes whatever the party's healer has just done,
 * it is thorned from the first tick so every blow is billed, and {@link THE_ANVIL_FALLS} takes the
 * turn of the one body the party cannot do without.
 *
 * ⚠️ **The tenacity is the headline and it is a hard zero rather than a tax.** `statusChance` is
 * `authored + insight − tenacity` clamped at zero, and the largest authored chance in the game is
 * 0.9 — so a party that has spent eight chapters learning to open a wall with a Sunder opens this
 * one with nothing. That is the band-1 lock at boss weight, and it is why the rest of the board is
 * sized where it is: the fight is long enough already without the numbers being large.
 *
 * ⚠️ **It does not taunt**, which is 21a's finding and not this chapter's to re-derive: a boss that
 * draws every attack onto itself aims them at the body the party was going to focus anyway and
 * spends its own turns dealing nothing. {@link OATHSTONE_BASTION} wears the taunt, standing in
 * front, which is the shape that works.
 *
 * **The Grudgekeeper does not stand here, and that is this chapter's choice rather than a rule.**
 * What the rule forbids is a lieutenant being *the* fight; as support it is permitted, and `c7-s50`
 * fields the Gravewright for exactly that reason. ⚠️ **Check the survivor count before copying
 * either choice** — nothing asserts it once a later chapter takes over the top of the ladder.
 *
 * ⚠️ **No healing, no drain and no shield anywhere on it or its board.** Two things here already make
 * a party live longer than it can kill — a wall it cannot aim past and a board it cannot debuff —
 * and both are steps toward the timeout that is scored as a **defeat**. What keeps it resolving is
 * that a reflect only ever shortens a fight and a bomb is damage rather than delay.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds.
 */
export const THE_ANVIL_CROWNED = {
  id: 'the-anvil-crowned',
  name: 'The Anvil Crowned',
  faction: 'dwarf',
  tier: 'ascended',
  stats: {
    hp: 1750,
    atk: 97,
    def: 56,
    recovery: 7,
    haste: 94,
    critChance: 0.13,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    critBlock: 0.12,
    tenacity: 0.85,
    physicalPierce: 0.25,
    magicPierce: 0.25,
    physicalResist: 0.08,
    magicResist: 0.08,
  },
  opening: [THORNMAIL],
  skills: [THE_ANVIL_FALLS, THE_QUENCH, GLACIAL_SLAM],
} as const;

// ---------------------------------------------------------------------------------------
// The Bleeding Wild — milestone 21d
//
// Ten Monster blocks, which takes the faction 8 → **18** and finishes the four leans milestone 21
// fixed up front: undead, elf and dwarf are already at seventeen or eighteen apiece.
//
// ## What the chapter asks, and where each band's lock lives
//
// The barrows asked *how* the party's damage arrives, the weald *where* it lands and the anvil
// whether **anything the party does stays done**. This asks what the party's damage **does to the
// thing it is spent on** — because down here what you do to it is what arms it, and neither half of
// that wears off.
//
// | Band | The lock                                                    | Built from                     |
// | ---- | ----------------------------------------------------------- | ------------------------------ |
// | 1    | hurting it is what arms it                                  | {@link BLOOD_RISEN}            |
// | 2    | what it does to you does not come off by itself             | {@link RAKE}                   |
// | 3    | what you spread, you feed                                   | a pair: `lifeLeech` and a pack |
// | 4    | the one thing you may hit is the one you must not wound     | a pair: a taunt on a frenzy    |
// | 5    | all four, on a body that grows as it dies                   | {@link THE_EVERWOUND}          |
//
// ⚠️ **Band 4 is the Hollow Anvil's pair with a different sentence in it.** That chapter's taunt was
// worn by a body the party could not *open*; this one is worn by a body the party had better not
// **wound**, because it is carrying the chapter's own frenzy. Both leave the same two answers a
// taunt has always left — kill it inside the window, or bring a row attack — and neither is the
// answer the party has been reaching for since milestone 4, which is reach.
//
// ## Scale, and the two things a Monster chapter has to watch
//
// ⚠️ **`lifeLeech` is sustain, and sustain is a clock.** It is the faction's idiom and it stays, at
// the sizes the faction already carries (0.1 on the Bramblehide Ravener) — but it never stands on a
// board with a taunt, because sustain the party cannot aim at is a ninety-second timeout scored as
// a **defeat**, and it is never on the same block as a frenzy, because a body that hits harder for
// being hurt and heals from hitting is a closed loop wearing a stat block.
//
// ⚠️ **And nothing here is armoured by being hurt.** {@link BLOODRISEN} multiplies `atk`, so every
// version of this chapter's signature ends the fight *sooner*; the defensive mirror of it is the one
// shape of this idea nobody may author. The bulk is deliberately Monster-shaped for the same reason
// — high attack, thin armour, real `haste` — where the hold above was slow and thick.
//
// Both `ascended` blocks sit **under The Unmade on `hp` and `atk`**, which `enemies.spec.ts` holds.
// ---------------------------------------------------------------------------------------

/**
 * The chapter's first sentence, on the cheapest thing that can say it.
 *
 * A whelp is not dangerous and is not meant to be. What it costs is the habit eight chapters have
 * rewarded: opening with a row attack, chipping everything, and finishing at leisure. Chip this and
 * do not kill it, and it is a third stronger for the rest of the fight — and so is every other one
 * standing beside it.
 *
 * Quick and thin, because band 1 has to be **answerable by finishing** and a body that takes three
 * turns to put down is a body the party cannot help wounding.
 */
export const MIREWHELP = {
  id: 'mirewhelp',
  name: 'Mirewhelp',
  faction: 'monster',
  tier: 'common',
  stats: {
    hp: 520,
    atk: 58,
    def: 14,
    haste: 102,
    critChance: 0.06,
    critDamageAmp: 0.6,
    tenacity: 0.15,
    physicalPierce: 0.12,
  },
  skills: [BLOOD_RISEN, MAUL],
} as const;

/**
 * The same lock on a body that will not go down to a stray hit.
 *
 * ⚠️ **The Mirewhelp is answerable by finishing and this deliberately is not.** It is the fodder a
 * party *cannot* clear in one turn, so the frenzy is a matter of when rather than whether — which is
 * what stops band 1 from resolving into "kill the small ones first" and nothing else. What it does
 * with the frenzy is modest; what it does is make the party spend real damage on a common.
 */
export const THORNBACK_GRAZER = {
  id: 'thornback-grazer',
  name: 'Thornback Grazer',
  faction: 'monster',
  tier: 'common',
  stats: {
    hp: 940,
    atk: 46,
    def: 26,
    haste: 68,
    critChance: 0.02,
    critDamageAmp: 0.5,
    critBlock: 0.1,
    tenacity: 0.2,
    physicalResist: 0.14,
  },
  skills: [BLOOD_RISEN, GORE],
} as const;

/**
 * Band 2 at fodder weight, and the lock is meant to be **stacked** rather than met once.
 *
 * One {@link RAKE} is a wound the party's cleanse answers on the turn it lands. Three of these on a
 * board is three permanent wounds against one cleanse, which is the whole of the band: the party
 * cannot clear them all, so it is choosing which of its members bleeds until the fight ends.
 *
 * Fragile and fast, on the Cinderquench Bearer's reasoning — it is not meant to survive being
 * noticed, and what it costs the party is the answer rather than the body.
 */
export const RENDFANG_JACKAL = {
  id: 'rendfang-jackal',
  name: 'Rendfang Jackal',
  faction: 'monster',
  tier: 'common',
  stats: {
    hp: 560,
    atk: 62,
    def: 15,
    haste: 108,
    critChance: 0.09,
    critDamageAmp: 0.65,
    tenacity: 0.15,
    physicalPierce: 0.2,
  },
  skills: [RAKE],
} as const;

/**
 * The clock's counterweight, and the reason a wide board here is wide.
 *
 * Almost no health and the highest `haste` on a Monster block. It carries neither of the chapter's
 * locks on purpose: a board of nothing but bodies that punish being chipped would make a row attack
 * strictly wrong, and this is the thing a row attack is **right** about — five of them take turns
 * fast enough to matter and die to one swing.
 */
export const CARRION_SWARM = {
  id: 'carrion-swarm',
  name: 'Carrion Swarm',
  faction: 'monster',
  tier: 'common',
  stats: {
    hp: 400,
    atk: 54,
    def: 10,
    haste: 124,
    critChance: 0.12,
    critDamageAmp: 0.7,
    tenacity: 0.1,
    physicalPierce: 0.16,
  },
  skills: [FLENSE],
} as const;

/**
 * Band 1 at weight: the pack arms whatever the party has committed to.
 *
 * ⚠️ **This is what stops band 1 being answered by target order.** A frenzy on `self` is a body's
 * own decision, and a party that finishes what it starts pre-empts it. {@link BLOOD_CALLS_BLOOD}
 * arrives on the body the party has *already* decided to kill, on a turn the party does not
 * control — so the damage in flight is spent on something worth more than it was when the swing
 * started.
 *
 * It kills nothing itself, which is the Grudgeplate Smith's shape and the third time the ladder has
 * used it. Reaching past the front rank to remove it is the answer, and it is the answer this
 * chapter is most willing to give.
 */
export const GOREHIDE_MATRIARCH = {
  id: 'gorehide-matriarch',
  name: 'Gorehide Matriarch',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 1020,
    atk: 58,
    def: 26,
    haste: 84,
    critChance: 0.05,
    critDamageAmp: 0.6,
    tenacity: 0.3,
    physicalResist: 0.08,
  },
  skills: [BLOOD_CALLS_BLOOD, GORE],
} as const;

/**
 * Band 2 at weight, and it opens the one vein the party cannot spare.
 *
 * A Jackal bleeds whatever is in front of it. This goes past the wall at the party's own back rank,
 * where the healer stands — and a healer carrying a wound that never closes is a healer choosing
 * between mending somebody else and stopping its own. That is the band's second question, and it is
 * about **which** wound the party carries rather than how many.
 */
export const REDWATER_STALKER = {
  id: 'redwater-stalker',
  name: 'Redwater Stalker',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 880,
    atk: 78,
    def: 22,
    haste: 98,
    critChance: 0.12,
    critDamageAmp: 0.8,
    tenacity: 0.25,
    physicalPierce: 0.3,
    physicalResist: 0.04,
  },
  skills: [OPEN_THE_VEIN, RAKE],
} as const;

/**
 * Band 3, and the only sustain in the chapter: what the party spreads, this drinks.
 *
 * `lifeLeech` is the Monster faction's answer to having no healer — milestone 8e's decision, and the
 * reason giving this faction a support would solve a composition problem by deleting the faction. On
 * a board of whelps and swarms it is the thing that makes a long fight the wrong plan: the party
 * that chips five bodies has armed all of them, and this one is being paid for every blow it lands
 * while they answer.
 *
 * ⚠️ **It never stands on a board with a taunt and it never carries a frenzy**, which are the two
 * rules the chapter's leech is fenced by. Sustain the party cannot aim at is a ninety-second clock,
 * and sustain on a body that hits harder for being hurt is a closed loop.
 */
export const BLOODGORGE_HOUND = {
  id: 'bloodgorge-hound',
  name: 'Bloodgorge Hound',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 940,
    atk: 76,
    def: 24,
    haste: 96,
    critChance: 0.1,
    critDamageAmp: 0.75,
    lifeLeech: 0.12,
    tenacity: 0.25,
    physicalPierce: 0.18,
    physicalResist: 0.05,
  },
  skills: [RAKE, FLENSE],
} as const;

/**
 * Band 4: it stands up, and the only thing the party may hit is the thing it must not wound.
 *
 * ⚠️ **The pair, and the whole of what makes it different from the Oathstone Bastion.** That body
 * was a door the party could not open. This one is a door that **arms itself while the party
 * knocks** — {@link CHALLENGE_BELLOW} narrows the target pool before the row rule is consulted, and
 * {@link BLOOD_RISEN} is waiting for the damage that narrowing guarantees.
 *
 * ⚠️ **Sixty ticks of cooldown against a forty-five tick taunt**, which `skills.spec.ts` derives
 * and holds: a single-target party gets a window at the rest of the board, and a party with a row
 * attack was never shut out at all.
 *
 * ⚠️ **No leech, no recovery, no shield, and nothing on a board with it puts health back.** A taunt
 * in front of sustain is the timeout that is scored as a defeat, which is the failure 15c found on
 * the Dwarf Tower's roof. Every pool on this depletes.
 */
export const SCARBOUND_BELLOWER = {
  id: 'scarbound-bellower',
  name: 'Scarbound Bellower',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 1180,
    atk: 70,
    def: 34,
    haste: 76,
    critChance: 0.05,
    critDamageAmp: 0.7,
    critBlock: 0.1,
    critDamageResist: 0.15,
    tenacity: 0.35,
    physicalResist: 0.1,
    magicResist: 0.06,
  },
  skills: [CHALLENGE_BELLOW, BLOOD_RISEN, MAUL],
} as const;

/**
 * The thing that has been following the party since it came up out of the hold.
 *
 * The ladder's fourth **lieutenant**, on `c10-s10`, `c10-s20`, `c10-s30` and `c10-s40` at rising
 * levels. ⚠️ **Reactive rather than an opening turn, which is {@link THE_GRUDGEKEEPER}'s shape and
 * the second chapter running to take it** — and here it is forced rather than chosen: a chapter
 * about what the party's damage *does* cannot state its lock before the party has dealt any.
 *
 * {@link THE_PACK_ANSWERS} is the widest the frenzy goes, and one chipped body is enough to trigger
 * it. So the four boards it anchors are four different fights depending on how the party opens: a
 * row attack into the escort arms the escort, and a party that finishes one body at a time meets it
 * with the pack still whole.
 *
 * ⚠️ **No healing, no drain and no shield**, which is the standing rule for anything a chapter
 * fields four times, and no `lifeLeech` either — this is the block most likely to still be standing
 * at second sixty.
 *
 * ⚠️ **Sized under The Unmade on both stats and under {@link THE_EVERWOUND} as well**: a lieutenant
 * that matched the chapter's final would make the final the fifth time you fought it.
 */
export const THE_REDMAW = {
  id: 'the-redmaw',
  name: 'The Redmaw',
  faction: 'monster',
  tier: 'ascended',
  stats: {
    hp: 1480,
    atk: 91,
    def: 42,
    haste: 94,
    critChance: 0.14,
    critDamageAmp: 0.85,
    critDamageResist: 0.15,
    tenacity: 0.4,
    physicalPierce: 0.26,
    physicalResist: 0.05,
  },
  skills: [THE_PACK_ANSWERS, RAKE, TYRANTS_CLAIM],
} as const;

/**
 * All wound and nothing else, and the tenth body on the ladder fielded on exactly one stage.
 *
 * Every question the chapter has asked stands on it at once, and three of them are the same
 * question at three widths: {@link BLOOD_RISEN} means killing it is what makes it dangerous,
 * {@link THE_PACK_ANSWERS} means the escort rises with it, and {@link THE_LONG_BLEED} puts a wound
 * on all five members that only a cleanse will ever close.
 *
 * ⚠️ **A boss that gets permanently stronger as it dies is a race, and a race is the safe shape
 * here.** The alternative — a boss that got *harder to kill* as it was hurt — is the same idea
 * pointed at the ninety-second clock, and a timeout is scored as a defeat. Everything on this board
 * shortens the fight from one side or the other.
 *
 * ⚠️ **It does not taunt**, which is 21a's finding and not this chapter's to re-derive: a boss that
 * draws every attack onto itself aims them at the body the party was going to focus anyway. Here it
 * would be worse than neutral — it would hand the party the one thing this chapter is built to
 * withhold, which is a safe place to spend damage.
 *
 * **The Redmaw does not stand here**, on the Anvil Crowned's reasoning: a lieutenant as support is
 * permitted and this board does not need one. ⚠️ **Check the survivor count before copying that
 * choice** — nothing asserts it once a later chapter takes over the top of the ladder.
 *
 * ⚠️ **No healing, no drain, no shield and no `lifeLeech` anywhere on it**, which is the same
 * sentence the last two chapter finals carry and for the same reason.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds.
 */
export const THE_EVERWOUND = {
  id: 'the-everwound',
  name: 'The Everwound',
  faction: 'monster',
  tier: 'ascended',
  stats: {
    hp: 1720,
    atk: 98,
    def: 52,
    haste: 96,
    critChance: 0.15,
    critDamageAmp: 0.95,
    critDamageResist: 0.2,
    critBlock: 0.1,
    tenacity: 0.45,
    physicalPierce: 0.3,
    magicPierce: 0.2,
    physicalResist: 0.06,
    magicResist: 0.06,
  },
  skills: [THE_PACK_ANSWERS, THE_LONG_BLEED, BLOOD_RISEN, TYRANTS_CLAIM],
} as const;

// ---------------------------------------------------------------------------------------
// The Human Tower's second hundred floors — milestone 21e
//
// ## Four Undead blocks, and why a tower's are fewer than a chapter's
//
// A chapter is ten because it authors five bands each asking a different question. A tower is four
// because it asks **one** question a hundred more times: a floor is climbed exactly once and there
// is no way around one, so what a floor costs is the whole of it. These fill shape gaps in the
// Undead bench that a two-hundred-floor climb exposes and a fifty-stage chapter does not.
//
// Undead 17 → **21**, which is what 21e owes. The lean is the matchup matrix's: Undead counter
// Humans, so the tower that admits Humans is the one that fields them.
//
// | Block                            | The gap it fills                                          |
// | -------------------------------- | --------------------------------------------------------- |
// | {@link CHARNEL_DRUDGE}           | fodder a crit cannot delete                                 |
// | {@link NIGHTMARCH_OUTRIDER}      | reach, at speed, with a pool that answers back              |
// | {@link RELIQUARY_BEARER}         | sustain that cannot become the clock                        |
// | {@link THE_DEATHLESS_MARSHAL}    | a roof of its own, for a tower that had borrowed one        |
//
// ## ⚠️ No new status, and the vocabulary was never on the table
//
// Milestone 21's three-status budget was **spent and closed by 21d**, and a tower does not get to
// re-open it — "21d spent two" is no more an argument than "17 did it" was. All three new skills
// below are existing statuses on bodies that had not carried them.
//
// ## Scale
//
// The floors these stand on run to level 120, which is exactly twice the shipped hundred's top —
// so the *level line* is what makes the second hundred harder and these are sized against the
// bench they join rather than against the floors they will meet. {@link THE_DEATHLESS_MARSHAL} sits
// **under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds, and which every
// `ascended` block authored since 15c has respected rather than raised.
// ---------------------------------------------------------------------------------------

/**
 * What is left of the work gangs that dug the tower's foundations.
 *
 * **Fodder a burst party cannot delete, which the Undead bench did not have.** Every cheap Undead
 * body so far is either thin and fast or thick and slow; this is thick, slow, *and* wearing
 * `critBlock` on both resists — so the swing that clears three of these on the shipped hundred
 * clears two here and spends another turn on the third.
 *
 * ⚠️ **Nothing about it is a lock, and that is deliberate.** A tower's second hundred is a hundred
 * fights nobody re-tries, so what it needs from its commons is *cost*, not a question. A block that
 * taught something new every tenth floor would be a chapter wearing a tower's numbering.
 */
export const CHARNEL_DRUDGE = {
  id: 'charnel-drudge',
  name: 'Charnel Drudge',
  faction: 'undead',
  tier: 'common',
  stats: {
    hp: 840,
    atk: 52,
    def: 32,
    haste: 64,
    critChance: 0.02,
    critDamageAmp: 0.5,
    critBlock: 0.16,
    physicalResist: 0.12,
    magicResist: 0.1,
  },
  skills: [GORE],
} as const;

/**
 * It was cavalry once, and it still knows where the standards are kept.
 *
 * {@link NIGHT_RIDE} goes past the front rank at speed, which is the pressure a hundred-floor climb
 * has never put on the party's back row — the shipped tower's reach is {@link CUTPURSE} on a
 * `common`, and a `common`'s turn arrives too rarely to be a plan.
 *
 * ⚠️ **The `dodge` pool is a question rather than a tax, and the Human bench is what makes it
 * one.** Exactly one Human carries `accuracy` — Ysolde, who stands in the reference five — so this
 * is answerable by a crew that brought her and expensive for one that did not. That asymmetry is
 * the point: `MIN_HIT_CHANCE` floors a dodge pool at a tenth, so the crew without the answer is
 * slowed rather than stopped. **Kept modest, and never stacked**: two of these on one board is a
 * board a party without accuracy cannot plan around, which is a different and worse thing.
 */
export const NIGHTMARCH_OUTRIDER = {
  id: 'nightmarch-outrider',
  name: 'Nightmarch Outrider',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 760,
    atk: 78,
    def: 20,
    haste: 128,
    critChance: 0.12,
    critDamageAmp: 0.8,
    dodge: 0.12,
    physicalPierce: 0.15,
    magicResist: 0.04,
  },
  skills: [NIGHT_RIDE, CUTPURSE],
} as const;

/**
 * It carries the box, and the box is why the rest of them are still standing.
 *
 * ⚠️ **The only way a tower is allowed to have sustain, and the distinction is load-bearing.** 15c
 * measured what a healer on a roof is: the Dwarf Tower's boss was `Oathbreaker + Warden` behind a
 * Marsh Acolyte and no Dwarf five could close it inside ninety seconds, while the same board ten
 * floors lower cleared. A heal refills; against a party that cannot burst, that is the clock rather
 * than a lock. {@link RELIQUARY_SEAL} banks a pool **once** and it depletes — so this makes a floor
 * cost more turns and can never make one cost all of them.
 *
 * Almost no offence of its own, like every support the enemy side ships: what it costs the party is
 * the turns spent getting through what it put up.
 */
export const RELIQUARY_BEARER = {
  id: 'reliquary-bearer',
  name: 'Reliquary Bearer',
  faction: 'undead',
  tier: 'legendary',
  stats: {
    hp: 900,
    atk: 50,
    def: 36,
    recovery: 4,
    haste: 72,
    critChance: 0.03,
    critDamageAmp: 0.5,
    critBlock: 0.1,
    tenacity: 0.3,
    magicResist: 0.12,
  },
  skills: [RELIQUARY_SEAL, WITHERING_TOUCH],
} as const;

/**
 * Whoever gave the order that lost the tower, still giving it.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is The Oathbreaker — a Human
 * `ascended` block the campaign also fields — which was right for a tower that had one hundred
 * floors and no body of its own. A second hundred earns one.
 *
 * {@link THE_LAST_MUSTER} is what makes it a fight rather than a bigger stat block: the board's
 * attack goes up a third for forty-five ticks and then lapses, so the roof has a rhythm the party
 * can read and wait out. ⚠️ **It lapses on purpose**, unlike 21d's permanent rallies — a roof that
 * ratcheted upward and never came down would be the ninety-second clock with a name on it, which is
 * the shape `docs/combat.md` forbids outright.
 *
 * ⚠️ **No heal, no drain, no shield and no `lifeLeech`**, which is the sentence every chapter final
 * since the Chainsworn carries and which binds twice as hard here: a roof is the one fight in a
 * hundred-floor climb that a player cannot route around.
 *
 * ⚠️ **Sized under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds.
 */
export const THE_DEATHLESS_MARSHAL = {
  id: 'the-deathless-marshal',
  name: 'The Deathless Marshal',
  faction: 'undead',
  tier: 'ascended',
  stats: {
    hp: 1620,
    atk: 94,
    def: 48,
    haste: 92,
    critChance: 0.13,
    critDamageAmp: 0.9,
    critDamageResist: 0.18,
    critBlock: 0.1,
    tenacity: 0.4,
    physicalPierce: 0.28,
    magicPierce: 0.18,
    physicalResist: 0.06,
    magicResist: 0.06,
  },
  skills: [THE_LAST_MUSTER, TYRANTS_CLAIM, HEADSMANS_ARC],
} as const;

// ---------------------------------------------------------------------------------------
// The Dwarf Tower's second hundred floors — milestone 21f
//
// ## Four Human blocks, and Human was the thinnest faction in the game
//
// Nine, against Undead's and Elves' seventeen and Dwarves' and Monsters' eighteen — because
// milestone 21's four chapters each leaned somewhere else on purpose and Human was the one they
// left alone. Human 9 → **13** here, which is the lean the matchup matrix asks for: Humans counter
// Dwarves, so the tower that admits Dwarves is the one that fields them.
//
// A tower gets four where a chapter gets ten, for 21e's reason: a chapter authors five bands each
// asking a different question, and a tower asks **one** question a hundred more times.
//
// | Block                        | The gap it fills                                        |
// | ---------------------------- | ------------------------------------------------------- |
// | {@link FORLORN_LEVY}         | a common that costs turns rather than health            |
// | {@link KINGSWAY_LANCER}      | the Human bench's first `legendary` that is only damage |
// | {@link UNDERVAULT_SAPPER}    | armour that stops answering, aimed at the deepest of it |
// | {@link THE_BREACHLORD}       | a roof of its own, for a tower that had borrowed one    |
//
// ## ⚠️ Offence rather than bulk, and it is a measurement rather than a preference
//
// A Dwarf five carries the lowest `atk` in the game and the alternate arrangement is three tanks.
// So bulk is the one thing it beats by standing still — what it actually loses to is the
// ninety-second clock. Measured at the top floor's level, an *offensive* board and a *bulky* board
// of the same nominal weight read 33.0s against 45.7s, and the alternate five clears the first at
// 90% and the second at 63%. **Every one of these four spends its weight on what it does per
// turn.**
//
// ⚠️ That is the inverse of what 21e authored one tower over: the Human Tower's second hundred
// thins its anchors and thickens the board's own *support* — links, shields, a taunt. Against these
// crews a shield support at the top floor reads 28% for the reference five and **0%** for the
// alternate, because every point of enemy sustain is a second of clock a Dwarf party does not have.
// 15c's rule that anchors are sized per tower against its own crew generalises: so is the shape.
//
// ## No new status, and no sustain above the middle bands
//
// Milestone 21's three-status budget was spent and closed by 21d, and 21e recorded that a tower
// does not get to re-open it. {@link SUNDER} is the game's only defence shred and had never been
// pointed at Dwarves; that is the whole of the vocabulary these four use.
//
// {@link THE_BREACHLORD} carries no heal, no shield, no regeneration and no `lifeLeech`, which is
// 15c's finding on *this tower's own roof* written as a stat block: the Dwarf Tower's boss was
// `Oathbreaker + Warden` behind a Marsh Acolyte and no Dwarf five could close it inside ninety
// seconds, while the same board ten floors lower cleared.
//
// ⚠️ Sized **under The Unmade on both `hp` and `atk`**, which `enemies.spec.ts` holds — and well
// under it, because a roof is sized against the crew that has to take it and this crew is the
// slowest in the game.
// ---------------------------------------------------------------------------------------

/**
 * The first wave up the ladders, and the one nobody expects back.
 *
 * **A common that costs turns rather than health.** All three Human commons before it are ordinary
 * melee bodies at eight-and-a-half stone of haste; this is the fastest and hardest-hitting body the
 * faction has at its cheapest tier, and it is made of paper. Against a party that wins by refusing
 * to lose, a body that acts twice for every one of yours is worth more than a body that is hard to
 * kill — and a board that fields three of these is asking the party to spend swings it does not
 * have.
 *
 * ⚠️ **Not a lock, deliberately**, the same clause {@link CHARNEL_DRUDGE} carries: a tower's second
 * hundred is a hundred fights nobody re-tries, so what it needs from a common is *cost*. It carries
 * {@link GORE} because its identity is entirely its stat line.
 */
export const FORLORN_LEVY = {
  id: 'forlorn-levy',
  name: 'Forlorn Levy',
  faction: 'human',
  tier: 'common',
  stats: {
    hp: 520,
    atk: 56,
    def: 12,
    haste: 128,
    critChance: 0.16,
    critDamageAmp: 0.85,
    physicalPierce: 0.1,
  },
  skills: [GORE],
} as const;

/**
 * The road it is named for runs straight into the hold, and always did.
 *
 * ⚠️ **The first Human `legendary` that is only damage.** The faction fields a healer, a caster and
 * a taunt-wall at this tier, so every Human board so far has been able to answer the party and
 * unable to threaten it — which is exactly the board a Dwarf five is built to out-sit. What this
 * adds is a reason to hurry.
 *
 * {@link COUCHED_LANCE} is conditioned on the party being whole, so its weight lands early and the
 * block is a swinging body afterwards. **Front rank**, and the measurement is why: a body of this
 * output standing where a Dwarf party cannot reach it takes the reference crew from 100% to 10%.
 * Reach is the one thing that faction has least of, so pressure it cannot answer is a cliff rather
 * than a ramp.
 */
export const KINGSWAY_LANCER = {
  id: 'kingsway-lancer',
  name: 'Kingsway Lancer',
  faction: 'human',
  tier: 'legendary',
  stats: {
    hp: 800,
    atk: 78,
    def: 26,
    haste: 116,
    critChance: 0.15,
    critDamageAmp: 0.9,
    physicalPierce: 0.28,
    magicResist: 0.04,
  },
  skills: [COUCHED_LANCE, CUTPURSE],
} as const;

/**
 * Somebody has to go and find where the seams are.
 *
 * The answer to the thing that makes this faction's tower hard to author: Dwarves own the deepest
 * armour in the game, so a board that cannot open it is a board spending the whole ninety seconds
 * proving it. {@link UNDERMINE} is {@link SUNDER} across the front rank, which is where all of that
 * armour stands.
 *
 * ⚠️ **`insight` rather than a bigger `chance`, and the distinction is the faction it is aimed at.**
 * `statusChance` is `authored + insight − tenacity` clamped at zero, so a Dwarf carrying enough
 * `tenacity` refuses a debuff outright however confidently it is authored. Buying the pool is the
 * honest way to answer that; inflating the chance is the way that stops working the moment the
 * party invests in the stat the game gave it for exactly this.
 *
 * Almost no offence of its own, like every support the enemy side ships — what it costs the party
 * is what the rest of the board does through the hole.
 */
export const UNDERVAULT_SAPPER = {
  id: 'undervault-sapper',
  name: 'Undervault Sapper',
  faction: 'human',
  tier: 'legendary',
  stats: {
    hp: 760,
    atk: 66,
    def: 24,
    haste: 98,
    critChance: 0.08,
    critDamageAmp: 0.6,
    insight: 0.32,
    physicalPierce: 0.18,
    magicResist: 0.06,
  },
  skills: [UNDERMINE, SHIELD_BASH],
} as const;

/**
 * Whoever it was that first got over the wall, still at the top of it.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is `Oathbreaker + Warden` — two
 * Human `ascended` blocks the campaign also fields — which was right for a tower with a hundred
 * floors and no body of its own. A second hundred earns one.
 *
 * ⚠️ **Far lighter than {@link THE_DEATHLESS_MARSHAL}, and that is the point rather than an
 * oversight.** 15c measured that a tower's anchors are sized against its own crew and never to a
 * shared weight; this crew is the slowest in the game, and a roof at the Human Tower's weight reads
 * **0%** for both Dwarf arrangements at the top floor. What makes this one a fight is what it does
 * per turn — {@link THE_BREACH_GIVEN} opens the wall and {@link GATE_SLAM} takes the turn the party
 * was about to spend — not how long it takes to kill.
 *
 * ⚠️ **No heal, no drain, no shield, no regeneration and no `lifeLeech`.** This is the tower whose
 * roof taught the rule and it is the tower least able to survive breaking it.
 */
export const THE_BREACHLORD = {
  id: 'the-breachlord',
  name: 'The Breachlord',
  faction: 'human',
  tier: 'ascended',
  stats: {
    hp: 1300,
    atk: 78,
    def: 40,
    haste: 92,
    critChance: 0.14,
    critDamageAmp: 0.9,
    critDamageResist: 0.18,
    critBlock: 0.08,
    tenacity: 0.4,
    physicalPierce: 0.3,
    magicPierce: 0.18,
    physicalResist: 0.05,
    magicResist: 0.05,
  },
  skills: [THE_BREACH_GIVEN, GATE_SLAM],
} as const;

// ---------------------------------------------------------------------------------------
// The Elf Tower's second hundred floors — milestone 21g
//
// Four Dwarf blocks, which takes the faction 18 → **22**. Dwarves beat Elves in the matchup cycle,
// so this is the lean the matrix asks for and half of the shipped hundred already wears it.
//
// ⚠️ **All four are aimed at the faction the tower admits rather than at a gap in the Dwarf bench,
// and the Elf idiom is what makes that possible.** Elves are the game's `dodge` faction — 0.06 to
// 0.12 across both reference arrangements — and no Dwarf block in eighteen carried `accuracy`.
// `AGENTS.md` records that a dodge pool is answered by accuracy and nothing else, so three of these
// four buy the pool; what stops it being a flat tax is that the cheapest carrier is also the softest
// body on its board, so the answer is to spend a turn on it.
//
// The other half of the aim is `critBlock`. Elves run `critChance` 0.22 to 0.30 with
// `critDamageAmp` up to 0.9 — the sharpest crit profile in the game — and the highest `critBlock`
// anything shipped is {@link CHARNEL_DRUDGE}'s 0.16. {@link EDGETURN_WARDEN} exists to be the wall
// that a crit is worth nothing against, which is what buys the rest of the board its turns.
// ---------------------------------------------------------------------------------------

/**
 * The one who sights the line, so nothing on it has to guess.
 *
 * ⚠️ **The first Dwarf block in eighteen to carry `accuracy`, and it is deliberately the cheapest
 * tier that gets it.** Hit chance is `accuracy − dodge` floored at a tenth, so 1.18 cancels every
 * evasion pool either Elf arrangement fields outright — and putting that on fodder means a board of
 * commons connects, which is the thing an Elf five had been allowed to ignore.
 *
 * ⚠️ **Answerable, and the softness is what makes it so.** An enemy's accuracy is not a stat the
 * party can out-buy the way it out-buys a hostile status, so a block carrying it has to be killable
 * or it is simply a bigger number. This is 540 hp standing in a back rank with {@link CUTPURSE},
 * which means the party's *reach* is the answer — and reach is the one resource this tower spends
 * its whole second hundred asking for. Never stacked more than two to a board.
 */
export const PLUMBLINE_HAND = {
  id: 'plumbline-hand',
  name: 'Plumbline Hand',
  faction: 'dwarf',
  tier: 'common',
  stats: {
    hp: 540,
    atk: 52,
    def: 16,
    haste: 92,
    critChance: 0.08,
    critDamageAmp: 0.6,
    accuracy: 1.18,
    physicalPierce: 0.1,
  },
  skills: [CUTPURSE],
} as const;

/**
 * You do not climb into a canopy. You throw something over it.
 *
 * The burster the wall is protecting, and the reason this tower's second hundred is a decision
 * rather than a wall to chew through. {@link SLUNG_ANVIL} is ×2 into the rank an Elf five keeps its
 * support and its casters in, so the party's reach is contested: spend it on the wall and the back
 * rank pays, spend it here and the wall gets its turns.
 *
 * Slow on purpose — 84 haste against a faction that runs 118 to 152 — so it is a body the party
 * always has time to answer and never has time to ignore. It carries `accuracy` too, because a siege
 * engine that misses is a joke rather than a threat.
 */
export const IRONSLING_WRIGHT = {
  id: 'ironsling-wright',
  name: 'Ironsling Wright',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 80,
    def: 22,
    haste: 84,
    critChance: 0.1,
    critDamageAmp: 0.75,
    accuracy: 1.12,
    tenacity: 0.35,
    physicalPierce: 0.18,
  },
  skills: [SLUNG_ANVIL, SHIELD_BASH],
} as const;

/**
 * Stone laid so the edge turns rather than bites.
 *
 * The wall, and the highest `critBlock` and `critDamageResist` in the game — 0.24 against
 * {@link CHARNEL_DRUDGE}'s 0.16, and 0.32 against {@link SERAPHINE}'s 0.3. Both are steps beyond the
 * shipped maxima and both are the block's whole argument: an Elf five's damage is a crit profile,
 * and this is the body that refuses it. Against anything else on the board those numbers are worth
 * almost nothing, which is what keeps it a lean rather than a tax.
 *
 * ⚠️ **It taunts, and the taunt is what makes it a wall rather than a slow body.** Reach is the Elf
 * answer to a formation, so a wall that can be walked around is not a wall — {@link DRAW_THE_OATH}
 * narrows the pool before the row rule is consulted, which is the one thing in the game that does.
 * The clauses that keep that answerable hold here as everywhere: 45 ticks against a 60-tick
 * cooldown, so there is a window every fight; multi-target selections ignore it; and it is a skill
 * rather than an `opening`, which `enemies.spec.ts` enforces.
 *
 * ⚠️ **No sustain of any kind on it.** A taunt in front of anything that heals is the ninety-second
 * clock wearing a lock's clothes, which is 15c's finding and not this tower's to re-derive.
 */
export const EDGETURN_WARDEN = {
  id: 'edgeturn-warden',
  name: 'Edgeturn Warden',
  faction: 'dwarf',
  tier: 'legendary',
  stats: {
    hp: 1080,
    atk: 58,
    def: 44,
    haste: 68,
    critChance: 0.06,
    critDamageAmp: 0.6,
    critDamageResist: 0.32,
    critBlock: 0.24,
    tenacity: 0.5,
    physicalResist: 0.08,
  },
  skills: [DRAW_THE_OATH, SHIELD_BASH],
} as const;

/**
 * The Stonewright cut the stair. This one cut the wards that hold it up.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is `Colossus + Barrow Sovereign`
 * — two blocks the campaign also fields — which was right for a tower with a hundred floors and no
 * body of its own, and a second hundred earns one.
 *
 * ⚠️ **`accuracy: 1.25` is the highest in the game and it is this block's headline**, above
 * {@link THE_WITHERED_CROWN}'s 1.2. `dodge` is not a {@link ModifiableStat}, so nothing may take an
 * evasion pool away with a status — the honest way for a roof to say "your evasion is worth nothing
 * here" is to carry the stat that out-runs it, and this is the tower where that sentence belongs.
 *
 * Its two turns are the tower's thesis stated once each: {@link THE_LINE_TRUE} reaches the rank the
 * party has been protecting for a hundred floors, and {@link THE_WARDS_HOLD} is the wall the party
 * has to get through to stop it. Neither of them heals.
 *
 * ⚠️ **Sized against this tower's own crew, which is 15c's rule and the reason the numbers are where
 * they are.** An Elf five is the fastest and softest party in the game, so what threatens it is
 * never bulk — 1560 hp is under both of the Dwarf `ascended` bodies the campaign fields and well
 * under {@link UNMADE}, and the fight still costs the weaker arrangement three of its five. Making
 * it heavier was measured: at 1650 the weaker arrangement drops from 83% to 63%, and the stronger
 * one does not notice.
 */
export const THE_WARDWRIGHT = {
  id: 'the-wardwright',
  name: 'The Wardwright',
  faction: 'dwarf',
  tier: 'ascended',
  stats: {
    hp: 1560,
    atk: 92,
    def: 46,
    recovery: 6,
    haste: 88,
    critChance: 0.12,
    critDamageAmp: 0.85,
    critDamageResist: 0.2,
    critBlock: 0.14,
    tenacity: 0.6,
    accuracy: 1.25,
    physicalPierce: 0.2,
    physicalResist: 0.06,
  },
  skills: [THE_LINE_TRUE, THE_WARDS_HOLD, GLACIAL_SLAM],
} as const;

// ---------------------------------------------------------------------------------------
// The Undead Tower's second hundred floors — milestone 21h
//
// Four Elf blocks, taking the faction 17 → 21. The lean the matchup matrix asks for, and the four
// are aimed at what this tower's *own* crews cannot answer rather than at a gap in the Elf bench —
// which is 21g's discipline, and the measurement that set it is in `skills.ts` above {@link
// SUNFADE}.
//
// ⚠️ **The second hundred had eleven Elf blocks it had never met before any of these were
// written.** The first hundred fields 29 distinct archetypes out of a bench that has since doubled,
// so these four are not filling a hole in the *variety* — they are the four specific statements the
// bench could not make: an evasion pool worth a turn, an `atk` debuff aimed at a whole side, a
// legendary wall (the Elf bench had none: its heaviest legendary is 820 hp at 24 `def`), and a roof.
// ---------------------------------------------------------------------------------------

/**
 * Above the canopy there is light and wind, and nothing up here has ever had to hold still.
 *
 * The teaching body, and the cheapest possible statement of this tower's second hundred: **you will
 * miss.** `dodge: 0.3` is above the shipped common ceiling ({@link DUSKFERN_SKIRMISHER}'s 0.26) and
 * it sits on the softest frame in the Elf bench, which is the trade that keeps it honest — 500 hp
 * against a party that lands many small hits means the pool buys turns rather than the fight, and
 * one connection in three still removes it.
 *
 * ⚠️ **Cheap on purpose, because the mechanic wants density rather than size.** Two or three of
 * these on a board is what makes a floor read as evasion; one heavy evasive body would just read as
 * a bad anchor. That is also what keeps the answer legible: they die to anything that reaches them.
 */
export const SUNMOTE_DANCER = {
  id: 'sunmote-dancer',
  name: 'Sunmote Dancer',
  faction: 'elf',
  tier: 'common',
  stats: {
    hp: 500,
    atk: 58,
    def: 11,
    haste: 134,
    critChance: 0.1,
    critDamageAmp: 0.6,
    dodge: 0.3,
  },
  skills: [MOTE_LANCE],
} as const;

/**
 * The light gets into you, and afterwards there is less of you than there was.
 *
 * The other half of the lock, and the half that answers the party's answer to the first. Evasion
 * means a swing does not land; {@link SUNFADE} means the ones that do land return less — and every
 * Undead body siphons a fraction of the damage it deals, so an `atk` debuff is charged **twice**
 * against this crew. There is no third body in the game that this is specifically true of.
 *
 * Soft, fast, and standing in a back rank: it is a body the party has to *reach*, which is the
 * resource this tower charges for, and the one Undead skill that reaches a whole rank is an
 * ultimate. `dodge: 0.22` is texture rather than the argument — enough that spending a turn on it
 * is a decision, not enough to make it a second wall.
 */
export const SUNFADE_CHANTER = {
  id: 'sunfade-chanter',
  name: 'Sunfade Chanter',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 700,
    atk: 64,
    def: 18,
    haste: 110,
    critChance: 0.08,
    critDamageAmp: 0.65,
    dodge: 0.22,
    magicResist: 0.06,
  },
  skills: [SUNFADE, MOTE_LANCE],
} as const;

/**
 * Bark that has closed over the same wound a hundred times.
 *
 * ⚠️ **The first legendary wall the Elf bench has ever had, and the release valve the evasion bands
 * need.** Elf legendaries top out at 820 hp and 24 `def`; this is 1120 and 40. On a board where four
 * bodies are hard to connect with, it is the one that is not — so it is where a frustrated party's
 * damage goes, and going there is the trap. Nothing behind it is any easier to hit for the delay.
 *
 * ⚠️ **It taunts, and carries no evasion at all.** Those two clauses are one decision: a taunt
 * narrows the pool before the row rule is consulted, so a taunting body the party could not reliably
 * *hit* would be the ninety-second clock with a lock's name on it — which is the failure 15c found
 * on the Dwarf roof and this tower's crew is even slower. {@link DRAW_THE_OATH} runs 45 ticks
 * against a 60-tick cooldown, so there is a window at whatever stands behind it every fight, and
 * `enemies.spec.ts` holds that it can never become an `opening`.
 *
 * ⚠️ **No sustain of any kind, and no board in this tower pairs it with a heal.** That is the
 * clause 15c wrote and 21f made a rule of, and it binds harder here than anywhere: an Undead five
 * takes the shipped floor 100 in 34.4 seconds against a 90-second timer.
 */
export const CROWNBARK_BASTION = {
  id: 'crownbark-bastion',
  name: 'Crownbark Bastion',
  faction: 'elf',
  tier: 'legendary',
  stats: {
    hp: 1120,
    atk: 54,
    def: 40,
    haste: 62,
    critChance: 0.05,
    critDamageAmp: 0.6,
    critBlock: 0.12,
    tenacity: 0.45,
    physicalResist: 0.08,
  },
  skills: [DRAW_THE_OATH, SHIELD_BASH],
} as const;

/**
 * The Wyrdroot held the wood down. This is what the wood was reaching for.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is
 * `Wyrdroot Ancient + Colossus` — two blocks the campaign also fields — which was right for a tower
 * with a hundred floors and no body of its own, and a second hundred earns one.
 *
 * ⚠️ **`dodge: 0.24` is the headline, and it is the one stat no Undead five may answer.** `accuracy`
 * lives on four Elves and one Human, and there is none in `gear.ts` or `signature.ts`, so a
 * faction-locked Undead crew has no route to it anywhere in the game — while every one of its
 * bodies sustains on `drain` and `lifeLeech`, so a miss costs the hit *and* the health the hit
 * would have paid back. Same shape as 21c's finding that a chapter's headline lock can be a stat
 * block, and as 21g's roof carrying `accuracy: 1.25` for the mirror-image reason.
 *
 * ⚠️ **0.24 is deliberately under {@link THE_WITHERED_CROWN}'s 0.28 and well under
 * {@link WEALDSHADOW_STALKER}'s 0.34, on the heaviest body in the tower.** The licence this session
 * took was "pools on soft bodies, so focus fire is the answer" — an anchor this crew already
 * struggles to burst, carrying the deepest pool in the game, is exactly the shape that licence
 * excludes.
 *
 * Its three turns are the tower's thesis stated once each and **none of them restores anything**:
 * {@link THE_CANOPY_PARTS} reaches the rank an Undead five keeps its heal, its reach and two of its
 * three drains in; {@link THE_SUN_AT_NOON} presses all five at once, which is the pressure a shared
 * siphon cannot keep pace with; {@link HEADSMANS_ARC} finishes whoever the leech left lowest.
 *
 * ⚠️ **Sized against this tower's own crew, which is 15c's rule.** An Undead five is the slowest
 * party in the game, so what threatens it is never bulk — one Longshadow-weight anchor behind a wall
 * with three legendaries measured **73% / 23%**, unwinnable for both arrangements. 1520 hp is under
 * every `ascended` body the campaign fields at this end of the ladder and far under {@link UNMADE},
 * and the fight still costs the reference five three of its members.
 */
export const THE_SUNBOUGH = {
  id: 'the-sunbough',
  name: 'The Sunbough',
  faction: 'elf',
  tier: 'ascended',
  stats: {
    hp: 1520,
    atk: 90,
    def: 44,
    recovery: 6,
    haste: 106,
    critChance: 0.12,
    critDamageAmp: 0.85,
    dodge: 0.24,
    tenacity: 0.45,
    accuracy: 1.1,
    physicalPierce: 0.18,
    magicResist: 0.06,
  },
  skills: [THE_CANOPY_PARTS, THE_SUN_AT_NOON, HEADSMANS_ARC],
} as const;

// ---------------------------------------------------------------------------------------
// Milestone 21i — the Monster Tower's second hundred, floors 101–200.
//
// Four blocks, **one each in the four thinnest factions** — angel 11, demon 12, human 13, monster
// 18 — rather than four in one. ⚠️ **That is the tower rather than an exception to it.** Every
// other tower leans on the single faction that counters the one it admits; every faction counters
// Monsters, so "field what counters the crew" resolves to all seven and the blocks spread the way
// the boards do. `towers.spec.ts` reads the case off the matchup matrix rather than naming
// `monster`, so this must not be special-cased in content.
//
// It also evens the depth table, which is the other half of the "fix the leans up front" discipline
// 21a set: 21j takes Demons to 16 and 21k takes Angels to 15, and neither touches Humans — so
// without this session Human would close milestone 21 as the standout thin faction at 13 against
// Dwarf's 22, which is exactly the state 21f was written to get the game out of.
//
// The axis, the measurements behind it, and why a link is forbidden on these boards are all in
// `skills.ts` beside {@link INTERPOSE}. The short version: what escalates across this second hundred
// is **how many different questions one board asks**, because a Monster five answers any single
// question by out-damaging it and has no second answer to spend on two more.
// ---------------------------------------------------------------------------------------

/**
 * There is nothing to stand behind when the light is directly overhead.
 *
 * ⚠️ **The first common in the game to reach a whole rank.** Six blocks carry `enemy-row-back` and
 * every one of them is a legendary or an `ascended`, so reaching a back rank has always cost a board
 * one of its two heavy slots. That is the constraint this tower cannot pay: a Monster five's weight
 * ceiling is one anchor over four soft bodies, so a board buying reach at legendary weight can ask
 * at most two other questions — and the count of questions is what this band escalates through.
 *
 * ⚠️ **It is also Angels' first cheap question of any kind, which was the largest hole in the
 * bench.** Every other faction ships a common that asks something — a stun, a bomb, thorns, a link,
 * evasion, a slow, a permanent bleed — and Angel's three ({@link GILDED_SENTRY},
 * {@link VAULTLIGHT_CENSER}, {@link LUMEN_ACOLYTE}) are plain attackers, because the faction's
 * vocabulary of shields, links and taunts all sits at legendary and above. It mattered here more
 * than anywhere: celestials take ten percent off Monsters where the mortals manage five, so an Angel
 * body is the hardest thing a board can carry and this tower could not previously carry one cheaply.
 *
 * ⚠️ **Priced as chip rather than as a threat, and the frame is the trade.** ×0.75 is under
 * {@link PILLAR_OF_LIGHT}'s ×0.9 on a body carrying 480 hp and 12 `def` — the softest thing on any
 * board it stands on, and the first casualty of a row attack aimed the other way. What it sells a
 * board is that the crew's back rank is never *safe*; what it cannot do is make that rank unsafe on
 * its own.
 */
export const ZENITH_CHORISTER = {
  id: 'zenith-chorister',
  name: 'Zenith Chorister',
  faction: 'angel',
  tier: 'common',
  stats: {
    hp: 480,
    atk: 46,
    def: 12,
    haste: 106,
    critChance: 0.04,
    critDamageAmp: 0.55,
  },
  skills: [ZENITHFALL, MOTE_LANCE],
} as const;

/**
 * It goes over the front rank entirely, and it comes back heavier than it went.
 *
 * ⚠️ **The first block to reach a whole back rank and feed off what it finds there.**
 * `enemy-row-back` and `lifeLeech` have both been in the game since 15c and have never shared a
 * body: reach has been a way of skipping a wall and leech a way of standing in front of one. The
 * pairing is aimed at something specific about this crew — a Monster five keeps three of its five in
 * the back rank and *all* of its damage lives there, so a body that takes health out of that rank
 * and puts it into itself is trading in the only currency the crew can mint.
 *
 * ⚠️ **The leech is small and the block is soft on purpose.** 0.12 against
 * {@link BLOODPACT_FIEND}'s 0.25, on 780 hp and 20 `def` — a body the crew kills in a turn or two
 * once it decides to. What it is not allowed to be is durable: a leech pool behind a wall the party
 * cannot aim at is 21f's rule again, and this tower already fields a taunt at common weight.
 */
export const RUINWING_DEVOURER = {
  id: 'ruinwing-devourer',
  name: 'Ruinwing Devourer',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 780,
    atk: 72,
    def: 20,
    haste: 100,
    critChance: 0.06,
    critDamageAmp: 0.7,
    lifeLeech: 0.12,
  },
  skills: [RUINOUS_STOOP, WITHERING_TOUCH],
} as const;

/**
 * It waits until it knows which one of you is holding the others up.
 *
 * ⚠️ **The first block to aim {@link SAVAGED} at one chosen body.** The only hostile status in the
 * game that does not expire has always been applied broadly — `enemy-front` on four blocks,
 * `enemy-back` on {@link REDWATER_STALKER}, `enemy-all` on {@link THE_EVERWOUND} — which makes it
 * weather. Named at `enemy-highest` it is a decision, because `enemy-highest` on a Monster five is
 * always its tank: the one body it fields for the purpose of still being there at the end.
 *
 * ⚠️ **It is the crew's own targeting handed back to it, on the one tower where that is literally
 * true.** `enemy-highest` is Monster vocabulary — {@link TYRANT}, {@link THE_REDMAW},
 * {@link THE_EVERWOUND} on this side, Ozza and Vharok on the other — and `monster → monster` is the
 * matchup matrix's one self-edge, so this is the only ladder in the game where a faction meets the
 * thing that reads it best.
 *
 * ⚠️ **No `lifeLeech` and no {@link BLOODRISEN}, which are chapter 10's two rules and they hold
 * here.** A body that hits harder for being hurt and heals from hitting feeds itself; a leech pool
 * on a board that also carries a taunt is the ninety-second clock. This block does neither and its
 * boards pair it with neither.
 */
export const MARROWHUNT_ALPHA = {
  id: 'marrowhunt-alpha',
  name: 'Marrowhunt Alpha',
  faction: 'monster',
  tier: 'legendary',
  stats: {
    hp: 940,
    atk: 74,
    def: 24,
    haste: 92,
    critChance: 0.07,
    critDamageAmp: 0.75,
    tenacity: 0.2,
    physicalPierce: 0.14,
  },
  skills: [NAME_THE_QUARRY, GORE],
} as const;

/**
 * A hundred floors of banners, and one horn that all of them were listening for.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is
 * `Oathbreaker + Wyrdroot Ancient` — two blocks the campaign also fields — which was right for a
 * tower with a hundred floors and no body of its own, and a second hundred earns one.
 *
 * ⚠️ **Deliberately not a fifth Gate Slam.** All four Human `ascended` blocks —
 * {@link THE_BREACHLORD}, {@link OATHBREAKER}, {@link PALE_WARDEN}, {@link WARDEN} — carry
 * `stun@enemy-all` and nothing else identifies the faction as strongly. A roof that repeated it
 * would be the tower's climax stating the *lean's* idiom on a tower that has no lean, which is this
 * one shipped as a copy of another. Its three turns are three different factions' questions in human
 * hands instead, which is the band's axis compressed into a single body: {@link THE_HORN_SOUNDS}
 * takes the rank the crew keeps its damage in and takes the survivors' turns with it,
 * {@link THE_FIELD_CLOSES} presses all five at once because a Monster five's health is a shared pool
 * refilled out of whatever it lands, and {@link NAME_THE_QUARRY} puts a wound that will not close on
 * whichever body is holding the rest up.
 *
 * ⚠️ **Sized against this tower's own crew, which is 15c's rule and the reason it is not heavier.**
 * A Monster five's weight ceiling is the lowest of the five towers extended so far: at the roof's
 * level one anchor over four *legendaries* measures 95% / 3% and any two anchors at all is 8% / 0%.
 * So the roof is one anchor over four soft bodies, and 1560 hp sits under {@link UNMADE} on both
 * stats — the ceiling `enemies.spec.ts` holds and nothing may reach.
 *
 * ⚠️ **Nothing on it restores anything.** The discipline every roof in this milestone has kept, and
 * it is kept here even though this is the one crew fast enough that it could not have mattered.
 */
export const THE_HORNCALLER = {
  id: 'the-horncaller',
  name: 'The Horncaller',
  faction: 'human',
  tier: 'ascended',
  stats: {
    hp: 1560,
    atk: 91,
    def: 45,
    recovery: 6,
    haste: 98,
    critChance: 0.12,
    critDamageAmp: 0.85,
    tenacity: 0.4,
    physicalPierce: 0.18,
  },
  skills: [THE_HORN_SOUNDS, THE_FIELD_CLOSES, NAME_THE_QUARRY],
} as const;

// ---------------------------------------------------------------------------------------
// Milestone 21j — the Angel Tower's second hundred, floors 101–200.
//
// Four blocks, all **Demon**, which is the standing rule: a tower's new blocks belong to its lean,
// and Demons are the one faction that hits an Angel back. The faction goes 13 → 17.
//
// ⚠️ **The axis is not a mechanic, because no mechanic in the game moves an Angel five.** Twenty-two
// shapes were measured against both arrangements at the roof's level and the whole spread was 0.15
// survivors; the full table and the two dials that *do* move them are in `skills.ts` beside
// {@link CULL_THE_EMBERS}. The short version: what an Angel crew cannot answer is a board that
// arrives **before its wards do** and spends itself on the body its heals are already aimed at.
//
// ⚠️ **So these four blocks carry `haste` and aim, and nothing else identifies them.** None of them
// has a status the game did not already have, none is heavier than what the tower already fields, and
// three of the four are soft enough to die in a turn. That is the design rather than a shortfall: the
// crew's weight ceiling is two *medium* anchors — pairing any two of {@link ASHFALL_SOVEREIGN},
// {@link UNMADE} and {@link HOLLOW_SERAPH} takes the reference five to 5% or below — so weight is the
// one axis that was already spent.
// ---------------------------------------------------------------------------------------

/**
 * It steps over the ones still standing to reach the one already down.
 *
 * ⚠️ **Demons' first body below `ascended` tier to name `enemy-lowest`**, and the cheap carrier the
 * closing bands were short of. The faction has owned the aim only on {@link ASHFALL_SOVEREIGN}, so a
 * board wanting to contest the choir's heal has had to spend one of its two heavy slots on it — and
 * those slots are what this tower needs for weight. See {@link CULL_THE_EMBERS} for the measurement:
 * aim at `enemy-lowest` is worth 4.00 → 2.00 survivors against the alternate five where every lock in
 * the game is worth nothing.
 *
 * ⚠️ **`haste` 126 on 440 hp, which is the faction's second-fastest body and its softest.** Demons
 * have never shipped anything above {@link UNSEALED_WRETCH}'s 118 and this only just passes it,
 * because the speed dial belongs to the last two bands: what this block is for is arriving *often*
 * with a small hit rather than arriving *first* with a large one. It is the first casualty of any row
 * attack aimed at its rank, and it is meant to be.
 */
export const CINDER_CULLER = {
  id: 'cinder-culler',
  name: 'Cinder Culler',
  faction: 'demon',
  tier: 'common',
  stats: {
    hp: 440,
    atk: 50,
    def: 10,
    haste: 126,
    critChance: 0.09,
    critDamageAmp: 0.6,
    magicResist: 0.06,
  },
  skills: [CULL_THE_EMBERS],
} as const;

/**
 * The ward goes up. It was already behind the ward.
 *
 * ⚠️ **The fastest Demon in the game by eighteen points, and speed has never been this faction's
 * idiom.** Demons run 92 to 118 and every faction but Angels and Dwarves ships something above 124 —
 * Elves reach 152, the Undead 148 — so this is the session that gives Demons a tempo body, and the
 * reason it is *this* session is that an Angel five's every defence is behind a cooldown or an energy
 * bar. {@link AEGIS_SKILL} is 80 ticks, {@link DAWNWARD} 70, {@link SANCTUARY} an ultimate. A body
 * taking three turns to the crew's two is spending them in the window before any of that lands.
 *
 * ⚠️ **Thin, and that is the price of the mechanic rather than a discount on it.** 620 hp and 16
 * `def` is under {@link PYRE}, the softest legendary the faction had; measured, `haste` alone on a
 * *durable* body is worth almost nothing (4.00 → 3.75 at `haste` 160) and `haste` on a thin one is
 * the strongest single dial there is (→ 2.67 / 0.15). What makes it work is that it acts before the
 * ward, not that it survives to act again.
 *
 * ⚠️ **Both of its turns name the back rank and neither can touch a front rank at all.** That is what
 * a tempo body is *for* here — the crew keeps three of five behind, including every heal and both
 * shields — and it is why it never stands on a board above floor 180 without an anchor in front of it
 * to hold the party's own attention.
 */
export const RIFTSTEP_REAVER = {
  id: 'riftstep-reaver',
  name: 'Riftstep Reaver',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 620,
    atk: 68,
    def: 16,
    haste: 136,
    critChance: 0.12,
    critDamageAmp: 0.75,
    magicPierce: 0.15,
  },
  skills: [RIFTSTEP, CUTPURSE],
} as const;

/**
 * The choir sings a body back up, and the debt is collected on the way.
 *
 * ⚠️ **The first block in the game to drain `enemy-lowest`**, and the one board-piece that makes the
 * choir's own targeting a liability. Every Angel heal names `ally-lowest`, so a drain aimed at the
 * same body means the restoration is not outpaced but **taken**: it leaves the party and arrives in
 * the thing that took it. See {@link THE_DEBT_CALLED}.
 *
 * ⚠️ **It is the aim band's converter and it stops at floor 160.** {@link CINDER_CULLER} contests the
 * heal cheaply and cannot finish anybody; this finishes, at legendary weight, on a body the crew has
 * already decided to spend a turn on. What it may not do is stand where the fight is long: 21f's rule
 * — enemy sustain against a party that cannot burst is the clock rather than a lock — binds harder on
 * an Angel five than on the Dwarf five it was written for, and this block carries the only siphon
 * these hundred floors have.
 *
 * ⚠️ **No taunt ever shares a board with it.** The clause that binds everywhere is "no healer behind
 * a taunt", and a siphon is bounded by what its holder can land where a heal refills the board — but
 * the whole reason this tower is authored around tempo is that the alternate Angel five is the slowest
 * party in the game, so the narrower reading is not worth the seconds here.
 */
export const COVENANT_EXECUTOR = {
  id: 'covenant-executor',
  name: 'Covenant Executor',
  faction: 'demon',
  tier: 'legendary',
  stats: {
    hp: 820,
    atk: 74,
    def: 24,
    haste: 106,
    critChance: 0.1,
    critDamageAmp: 0.8,
    physicalPierce: 0.15,
  },
  skills: [THE_DEBT_CALLED, RUINOUS_ARC],
} as const;

/**
 * A hundred floors of answered verses, and one that is not.
 *
 * **Floor 200, and the first roof this tower has owned.** Floor 100 is `Unmade + Wrathborn` — blocks
 * the campaign also fields — which was right for a tower with a hundred floors and no body of its
 * own, and a second hundred earns one.
 *
 * ⚠️ **The fastest `ascended` block in the game at `haste` 112**, over {@link THE_LONGSHADOW}'s 108,
 * and that is the roof stating the band's axis in the one stat the axis is made of. What it is
 * deliberately *not* is heavier: 1540 hp and 92 `atk` sit under {@link UNMADE} on both, which is the
 * ceiling `enemies.spec.ts` holds, and it is under the roof bodies of two of the five towers extended
 * before it. Weight was measured out as an axis before anything here was authored — see the block
 * comment above.
 *
 * ⚠️ **Its two shipped turns are a pair, and neither says anything alone.**
 * {@link CINDER_STORM} has stood on demon boards since the first chapter and measures at nothing
 * against these crews; {@link RUINOUS_STOOP} takes the rank the choir keeps its heals in. Together
 * with {@link NO_ANSWER_COMES} they are a sequence rather than three attacks: burn all five so that
 * `enemy-lowest` resolves to whoever the choir is about to save, take the back rank's armour off, and
 * then remove that body before the verse lands.
 *
 * ⚠️ **No `recovery`, no leech, no shield and no status that restores anything** — the only roof body
 * in the game with no self-sustain of any kind, where three of the other four carry `recovery: 6`.
 * That is not decoration: against the slowest party in the game a roof that puts health back is the
 * ninety-second clock wearing a boss's stat block, and the measured cost of a *single* healer on one
 * of these boards is eleven seconds of the alternate five's fight.
 */
export const THE_UNANSWERED = {
  id: 'the-unanswered',
  name: 'The Unanswered',
  faction: 'demon',
  tier: 'ascended',
  stats: {
    hp: 1540,
    atk: 92,
    def: 44,
    haste: 112,
    critChance: 0.13,
    critDamageAmp: 0.88,
    tenacity: 0.4,
    physicalPierce: 0.2,
    magicPierce: 0.2,
  },
  skills: [NO_ANSWER_COMES, CINDER_STORM, RUINOUS_STOOP],
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
  GRAVEWAKE_THRALL,
  BARROWMIST_KEENER,
  SEPULCHRE_HOUND,
  CAIRNWARD_HUSK,
  CAIRNBOUND_SENTINEL,
  GRAVETIDE_HERALD,
  BONECHAIN_WARDEN,
  GRAVEMOURN_KEEPER,
  THE_GRAVEWRIGHT,
  THE_CAIRN_KING,
  DUSKFERN_SKIRMISHER,
  HOLLOWBARK_SENTRY,
  WHISPERLEAF_ARCHER,
  GLOAMVINE_CREEPER,
  WEALDSHADOW_STALKER,
  LONGBOUGH_MARKSMAN,
  HEARTROOT_TENDER,
  NIGHTCANOPY_SINGER,
  THE_LONGSHADOW,
  THE_WITHERED_CROWN,
  COLDFORGE_HAND,
  SLAGBOUND_DRUDGE,
  CINDERQUENCH_BEARER,
  DEEPGALLERY_RUNNER,
  COLDHEARTH_IRONSWORN,
  QUENCHWRIGHT,
  GRUDGEPLATE_SMITH,
  OATHSTONE_BASTION,
  THE_GRUDGEKEEPER,
  THE_ANVIL_CROWNED,
  MIREWHELP,
  THORNBACK_GRAZER,
  RENDFANG_JACKAL,
  CARRION_SWARM,
  GOREHIDE_MATRIARCH,
  REDWATER_STALKER,
  BLOODGORGE_HOUND,
  SCARBOUND_BELLOWER,
  THE_REDMAW,
  THE_EVERWOUND,
  CHARNEL_DRUDGE,
  NIGHTMARCH_OUTRIDER,
  RELIQUARY_BEARER,
  THE_DEATHLESS_MARSHAL,
  FORLORN_LEVY,
  KINGSWAY_LANCER,
  UNDERVAULT_SAPPER,
  THE_BREACHLORD,
  PLUMBLINE_HAND,
  IRONSLING_WRIGHT,
  EDGETURN_WARDEN,
  THE_WARDWRIGHT,
  SUNMOTE_DANCER,
  SUNFADE_CHANTER,
  CROWNBARK_BASTION,
  THE_SUNBOUGH,
  ZENITH_CHORISTER,
  RUINWING_DEVOURER,
  MARROWHUNT_ALPHA,
  THE_HORNCALLER,
  CINDER_CULLER,
  RIFTSTEP_REAVER,
  COVENANT_EXECUTOR,
  THE_UNANSWERED,
] as const;
