import {
  AEGIS,
  BARRIER,
  BLEED,
  BURN,
  GUARD,
  HASTE,
  POISON,
  RALLY,
  REGENERATION,
  SLOW,
  STUN,
  SUNDER,
  WEAKEN,
} from './statuses';

/**
 * Every skill in the game.
 *
 * Plain data, and the only file that knows what a character or an enemy actually *does*.
 * `characters.ts` and `enemies.ts` are stat blocks that point here, which keeps a stat line
 * readable and means a kit can be retuned without touching the numbers it is attached to.
 *
 * ## How a turn is decided
 *
 * `core/battle/skills.ts` walks a combatant's kit in descending `priority` and takes the first
 * skill whose condition holds, whose cooldown has elapsed, that it can pay for, and that has
 * somebody to hit. Failing all of those it swings. So a kit is a **preference list**, and the
 * three ways to say "not this turn" are a condition, a cooldown and a price.
 *
 * ## The three costs, and why the game has all of them
 *
 * - **`none`** — metered by cooldown alone. Always eventually available, so each one has to be
 *   individually weaker. This is what a character with no magic at all gets.
 * - **`mp`** — a finite pool that regenerates slowly per turn. Front-loads: a caster opens
 *   strong and runs dry, which is what makes a long fight different from a short one and what
 *   guarantees a fight against a healer resolves instead of grinding forever.
 * - **`hp`** — pays in its own life, and never lethally. Converts durability into tempo, which
 *   is exactly the Undead's bargain: they have the largest HP pools in the game and almost no
 *   armour to protect them, so spending health is the one resource they have to spare.
 *
 * ## Cooldowns are in battle ticks
 *
 * A combatant acts every `1000 / haste` ticks, so a 40-tick cooldown is roughly every fourth
 * turn at a middling speed and every sixth for something fast. Quoting them in ticks rather
 * than turns means a haste genuinely shortens the wait, which it would not if cooldowns were
 * counted in the caster's own actions.
 *
 * ## Power numbers
 *
 * `power` multiplies the **result** of the damage formula, not the attack stat. A 1.5 hits for
 * half again what a basic attack does, and there is no quadratic surprise hiding in it. Single
 * target skills sit between 1.4 and 2.5; anything that hits a whole row lands between 0.75 and
 * 1.2, because five small hits against the diminishing-DEF curve are worth far less than one
 * big one and the multiplier has to be read against that, not against the target count.
 */

// ---------------------------------------------------------------------------------------
// Humans — versatile, and the only mortal faction with both a healer and a cleanse
// ---------------------------------------------------------------------------------------

/** Mira. Opens armour for whoever swings next, which is the most useful thing a generalist does. */
export const GUARD_BREAK = {
  id: 'guard-break',
  name: 'Guard Break',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.55 },
    { kind: 'status', status: SUNDER, chance: 0.9 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** Seren. A party-wide `atk` buff, and since 8a it is worth the same to a caster as to a blade. */
export const OATH_OF_ARMS = {
  id: 'oath-of-arms',
  name: 'Oath of Arms',
  target: 'ally-all',
  effects: [{ kind: 'status', status: RALLY }],
  cost: { kind: 'mp', amount: 14 },
  cooldown: 60,
  priority: 3,
} as const;

/** Seren's filler, so her turns between buffs are not merely basic attacks. */
export const SWORN_STRIKE = {
  id: 'sworn-strike',
  name: 'Sworn Strike',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.7 }],
  cooldown: 40,
  priority: 1,
} as const;

/** Aurelia. Both halves of a tempo buff at once, and the most expensive thing a Human casts. */
export const MARSHALS_CALL = {
  id: 'marshals-call',
  name: "Marshal's Call",
  target: 'ally-all',
  effects: [
    { kind: 'status', status: RALLY },
    { kind: 'status', status: HASTE },
  ],
  cost: { kind: 'mp', amount: 22 },
  cooldown: 85,
  priority: 3,
} as const;

/** Aurelia finishing something off. Ignores rank, which is what makes her a closer. */
export const DECISIVE_STRIKE = {
  id: 'decisive-strike',
  name: 'Decisive Strike',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2 }],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 40,
  priority: 2,
} as const;

/**
 * Wren. The mortal answer to needing a healer.
 *
 * Angels are the natural healers and they walk the luck-only ascension ladder, so a run that
 * never pulls one would otherwise have no sustain at all. That is the wrong kind of bad luck:
 * it is not a fight lost, it is a category of answer the player can never buy.
 */
export const FIELD_DRESSING = {
  id: 'field-dressing',
  name: 'Field Dressing',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.5 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 25,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** Wren again: a small heal attached to a cleanse, so a debuff wave is survivable. */
export const TRIAGE = {
  id: 'triage',
  name: 'Triage',
  target: 'ally-afflicted',
  effects: [
    { kind: 'cleanse', count: 1 },
    { kind: 'heal', power: 0.6 },
  ],
  cost: { kind: 'mp', amount: 14 },
  cooldown: 45,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// Dwarves — refusing to lose, and the cleanse that is not celestial
// ---------------------------------------------------------------------------------------

/** Bran. Free, on a long cooldown, and only ever about himself. */
export const SHIELD_WALL = {
  id: 'shield-wall',
  name: 'Shield Wall',
  target: 'self',
  effects: [{ kind: 'status', status: GUARD }],
  cooldown: 55,
  priority: 2,
} as const;

/** Korrin. The same armour, for everybody, at a price. */
export const ANVIL_STANCE = {
  id: 'anvil-stance',
  name: 'Anvil Stance',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  cost: { kind: 'mp', amount: 16 },
  cooldown: 70,
  priority: 3,
} as const;

/** Korrin's other half: he cannot kill anything, so he makes it hit less hard instead. */
export const HAMMER_CHECK = {
  id: 'hammer-check',
  name: 'Hammer Check',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.4 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** Thraun. A party-wide absorb pool, which is the most durability one turn can buy. */
export const DEEP_WARD = {
  id: 'deep-ward',
  name: 'Deep Ward',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  cost: { kind: 'mp', amount: 20 },
  cooldown: 75,
  priority: 3,
} as const;

/** Thraun's one offensive turn, and it is really a slow with damage attached. */
export const GROUND_SLAM = {
  id: 'ground-slam',
  name: 'Ground Slam',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 50,
  priority: 2,
} as const;

/** Dorn. Two debuffs off one ally, cheap and often — the cleanse a mortal roster can rely on. */
export const SALTBEARD_REMEDY = {
  id: 'saltbeard-remedy',
  name: 'Saltbeard Remedy',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 2 }],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 30,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/**
 * Dorn's contribution to a rank he is not standing in.
 *
 * Was the magical half of {@link SHIELD_WALL} before the defences collapsed into one. What
 * distinguishes it now is reach — every ally rather than the front row — which is the same
 * thing it was always for: covering the axis a Dwarf line-up is worst on.
 */
export const STOUT_WARD = {
  id: 'stout-ward',
  name: 'Stout Ward',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  cost: { kind: 'mp', amount: 14 },
  cooldown: 65,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Elves — speed, and the first answer to a back rank
// ---------------------------------------------------------------------------------------

/**
 * Rin. The reason a starting party can fight a formation at all.
 *
 * Free, on a short cooldown, and it reaches over the front rank. Every encounter built around
 * a protected healer or a protected caster is answerable from the first minute of a run
 * because this exists — which is what stops back-line design from being a wall the player has
 * to gamble their way past.
 */
export const PIERCING_SHOT = {
  id: 'piercing-shot',
  name: 'Piercing Shot',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.5 }],
  cooldown: 40,
  priority: 2,
} as const;

/** Lysha buying herself turns, which on a 134-speed body is worth more than any damage skill. */
export const WINDSTEP = {
  id: 'windstep',
  name: 'Windstep',
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 70,
  priority: 2,
} as const;

/** Lysha executing. Ignores rank entirely. */
export const THROAT_CUT = {
  id: 'throat-cut',
  name: 'Throat Cut',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.9 }],
  cost: { kind: 'mp', amount: 8 },
  cooldown: 35,
  priority: 3,
} as const;

/** Aelrindel. The sharpest back-line answer authored, and the reason a Warden hides badly. */
export const FIRST_ARROW = {
  id: 'first-arrow',
  name: 'First Arrow',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 40,
  priority: 3,
} as const;

/** Only worth a turn against a wide wave, which is exactly what the condition says. */
export const VOLLEY = {
  id: 'volley',
  name: 'Volley',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.75 }],
  cost: { kind: 'mp', amount: 16 },
  cooldown: 60,
  condition: { kind: 'enemies-at-least', count: 3 },
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Undead — enormous HP and almost no armour, so life is the currency they spend
// ---------------------------------------------------------------------------------------

/** Mortlach. Free sustain, which is what keeps a body with 12 DEF standing. */
export const GRAVE_GRASP = {
  id: 'grave-grasp',
  name: 'Grave Grasp',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.3, siphon: 0.45 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * Sable. The clearest statement of the Undead bargain: pay 55 HP for a magical drain that
 * usually returns more than it cost, and lose the trade outright against high magic resist.
 */
export const BLOOD_PACT = {
  id: 'blood-pact',
  name: 'Blood Pact',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.7, siphon: 0.55 }],
  cost: { kind: 'hp', amount: 55 },
  cooldown: 40,
  priority: 2,
} as const;

/** Nekros. A wave-wide poison bought with a large slice of the biggest HP pool in the game. */
export const GRAVE_TIDE = {
  id: 'grave-tide',
  name: 'Grave Tide',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.95 },
    { kind: 'status', status: POISON, chance: 0.85 },
  ],
  cost: { kind: 'hp', amount: 90 },
  cooldown: 70,
  condition: { kind: 'enemies-at-least', count: 2 },
  priority: 3,
} as const;

/** Nekros paying himself back. */
export const SOUL_SIPHON = {
  id: 'soul-siphon',
  name: 'Soul Siphon',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.6 }],
  cooldown: 45,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Monsters — raw ATK, and the answer to armour
// ---------------------------------------------------------------------------------------

/** Gnash. A bleed priced against a Monster's `atk` is a lot of damage for a free skill. */
export const REND = {
  id: 'rend',
  name: 'Rend',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.65 },
    { kind: 'status', status: BLEED, chance: 0.85 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** Ruk. One enormous predictable hit, which is what the diminishing-DEF curve rewards. */
export const MOUNTAIN_BREAKER = {
  id: 'mountain-breaker',
  name: 'Mountain Breaker',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.2 }],
  cooldown: 55,
  priority: 2,
} as const;

/** Vharok going for the biggest thing on the field and opening it up for everyone else. */
export const WORLDS_MAW = {
  id: 'worlds-maw',
  name: "World's Maw",
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 2.45 },
    { kind: 'status', status: SUNDER, chance: 0.9 },
  ],
  cooldown: 60,
  priority: 3,
} as const;

/** Vharok's filler, and the only sustain a Monster gets. */
export const DEVOUR = {
  id: 'devour',
  name: 'Devour',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.5 }],
  cooldown: 45,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Angels — sustain, and the reason a party can lose a race and still win a fight
// ---------------------------------------------------------------------------------------

/** Celia. Cheap, frequent, single-target. The first real heal a run is likely to own. */
export const CHOIRLIGHT = {
  id: 'choirlight',
  name: 'Choirlight',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.7 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 25,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 3,
} as const;

/** Ithuriel. Less per target, but everybody, which answers a wave rather than a spike. */
export const VERSE_OF_DAWN = {
  id: 'verse-of-dawn',
  name: 'Verse of Dawn',
  target: 'ally-all',
  effects: [{ kind: 'heal', power: 0.95 }],
  cost: { kind: 'mp', amount: 20 },
  cooldown: 55,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** The celestial cleanse, and the deepest one in the game. */
export const ABSOLUTION = {
  id: 'absolution',
  name: 'Absolution',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 3 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 35,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/** Seraphine. A wave heal with a tail on it, and the most MP any single skill asks for. */
export const UNWAVERING_LIGHT = {
  id: 'unwavering-light',
  name: 'Unwavering Light',
  target: 'ally-all',
  effects: [
    { kind: 'heal', power: 1.05 },
    { kind: 'status', status: REGENERATION },
  ],
  cost: { kind: 'mp', amount: 24 },
  cooldown: 60,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 3,
} as const;

/** Absorb rather than restore, so it is worth casting *before* the party is hurt. */
export const AEGIS_SKILL = {
  id: 'aegis',
  name: 'Aegis',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cost: { kind: 'mp', amount: 20 },
  cooldown: 80,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Demons — magical damage, and the only faction that ignores armour entirely
// ---------------------------------------------------------------------------------------

/** Pyra. Magical, so a Dwarf's armour does nothing about it. */
export const EMBERBURST = {
  id: 'emberburst',
  name: 'Emberburst',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.6 },
    { kind: 'status', status: BURN, chance: 0.85 },
  ],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 35,
  priority: 2,
} as const;

/** Malakar reaching the back rank the way an Elf does, but with a spell rather than an arrow. */
export const GAMBLERS_CUT = {
  id: 'gamblers-cut',
  name: "Gambler's Cut",
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 40,
  priority: 3,
} as const;

/** Setup for everything magical that follows, including his own. */
export const HEXFIRE = {
  id: 'hexfire',
  name: 'Hexfire',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.35 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 45,
  priority: 2,
} as const;

/** Azrathoth against a wave. Expensive enough that he casts it roughly twice a fight. */
export const RUIN_UNBOUND = {
  id: 'ruin-unbound',
  name: 'Ruin Unbound',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.15 },
    { kind: 'status', status: SUNDER, chance: 0.75 },
  ],
  cost: { kind: 'mp', amount: 26 },
  cooldown: 70,
  condition: { kind: 'enemies-at-least', count: 3 },
  priority: 3,
} as const;

/** Azrathoth against one enormous thing, which is the other half of what a gate is. */
export const UNMAKING = {
  id: 'unmaking',
  name: 'Unmaking',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.45 }],
  cost: { kind: 'mp', amount: 14 },
  cooldown: 45,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Enemy kits — the locks
// ---------------------------------------------------------------------------------------

/**
 * A Wisp reaching past the front rank.
 *
 * The first thing in the ladder that punishes assuming the back row is safe. It is small, and
 * it is meant to be: the lesson it teaches is that a rank is cover rather than immunity.
 */
export const MOTE_LANCE = {
  id: 'mote-lance',
  name: 'Mote Lance',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.1 }],
  cooldown: 60,
  priority: 2,
} as const;

/** A Boar committing to one target hard enough to matter. */
export const GORE = {
  id: 'gore',
  name: 'Gore',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.55 },
    { kind: 'status', status: BLEED, chance: 0.7 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/** A Bandit going for the soft target, because that is what a bandit is. */
export const CUTPURSE = {
  id: 'cutpurse',
  name: 'Cutpurse',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.35 }],
  cooldown: 60,
  priority: 2,
} as const;

/** A Golem punishing a crowded front rank, and taking the party's tempo with it. */
export const STONE_FIST = {
  id: 'stone-fist',
  name: 'Stone Fist',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.15 },
    { kind: 'status', status: SLOW, chance: 0.6 },
  ],
  cooldown: 65,
  priority: 2,
} as const;

/**
 * The Warden's answer to everything: hit the whole party, and take a turn off somebody.
 *
 * Priced in MP against a shallow pool, so it lands roughly twice a fight. A stun on a cooldown
 * this long is a spike to survive, not a lock to be held under.
 */
export const GATE_SLAM = {
  id: 'gate-slam',
  name: 'Gate Slam',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.85 },
    { kind: 'status', status: STUN, chance: 0.35 },
  ],
  cost: { kind: 'mp', amount: 30 },
  cooldown: 75,
  priority: 3,
} as const;

/**
 * The healer lock, and the clearest thing this milestone builds.
 *
 * An Acolyte standing behind two bodies out-heals a party's chip damage indefinitely. The
 * answer is not more damage — it is *reach*: a Piercing Shot, a Gambler's Cut, a First Arrow,
 * or killing the front rank fast enough to get behind it. An encounter with one of these in it
 * asks a question that milestone 2's "attack whatever has the least HP" could not even hear.
 */
export const MEND = {
  id: 'mend',
  name: 'Mend',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.6 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 20,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 3,
} as const;

/**
 * The debuff lock. Party-wide, and re-applied only once it has worn off.
 *
 * `status-absent` is what makes this worth cleansing: without it the Hag would spend every
 * cooldown refreshing a debuff that was already running, and a cleanse would buy the party a
 * few ticks. With it, removing the debuff genuinely costs the Hag its next cast.
 */
export const WITHERHEX = {
  id: 'witherhex',
  name: 'Witherhex',
  target: 'enemy-all',
  effects: [{ kind: 'status', status: WEAKEN, chance: 0.9 }],
  cost: { kind: 'mp', amount: 14 },
  cooldown: 55,
  condition: { kind: 'status-absent', statusId: 'weaken' },
  priority: 3,
} as const;

/** The Hag's other half: tempo denial on whoever is standing in front. */
export const MIRE = {
  id: 'mire',
  name: 'Mire',
  target: 'enemy-row-front',
  effects: [{ kind: 'status', status: SLOW, chance: 0.8 }],
  cost: { kind: 'mp', amount: 10 },
  cooldown: 60,
  condition: { kind: 'status-absent', statusId: 'slow' },
  priority: 2,
} as const;

/**
 * The wide-wave lock: a caster that hits the whole party for magical damage every few turns.
 *
 * Punishes a party built entirely of physical resist, which is otherwise the cheapest durability
 * in the game. The answer is magic resist, or killing it — and it is fragile precisely so that
 * killing it is a real option for a party that can reach it.
 */
export const CINDER_STORM = {
  id: 'cinder-storm',
  name: 'Cinder Storm',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.9 },
    { kind: 'status', status: BURN, chance: 0.6 },
  ],
  cost: { kind: 'mp', amount: 18 },
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The shielder lock: absorb, refreshed, on everything.
 *
 * Different from a healer in the way that matters here — a barrier applied before the damage
 * arrives cannot be raced by chip damage at all, so the party either has burst or has a
 * problem.
 */
export const BULWARK = {
  id: 'bulwark',
  name: 'Bulwark',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  cost: { kind: 'mp', amount: 16 },
  cooldown: 60,
  priority: 3,
} as const;

/** The Bulwark's filler. It is not there to kill anybody. */
export const SHIELD_BASH = {
  id: 'shield-bash',
  name: 'Shield Bash',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.2 }],
  cooldown: 40,
  priority: 1,
} as const;

/**
 * The armour gate, on both axes at once.
 *
 * A Golem is a physical wall and folds to a spell; a Rimeplate does not, which makes
 * penetration and {@link SUNDER} the only real answers rather than "bring the other damage
 * type". That is deliberately the last lock the ladder teaches.
 */
export const GLACIAL_SLAM = {
  id: 'glacial-slam',
  name: 'Glacial Slam',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.8 },
    { kind: 'status', status: SLOW, chance: 0.5 },
  ],
  cooldown: 60,
  priority: 2,
} as const;

/**
 * The evasion lock. A Shade dodges more than half of what is aimed at it.
 *
 * The floor under hit chance is what keeps this beatable at all; beyond that the answers are
 * accuracy, or enough attacks that the misses stop mattering.
 */
export const FADE = {
  id: 'fade',
  name: 'Fade',
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 70,
  priority: 2,
} as const;

/** A Shade draining what it does connect with, which is why ignoring one does not work. */
export const WITHERING_TOUCH = {
  id: 'withering-touch',
  name: 'Withering Touch',
  target: 'enemy-back',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.3, siphon: 0.5 }],
  cooldown: 45,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Enemy kits — the late locks
//
// Most of these exist because the vocabulary in `core/battle/types.ts` had targets and a
// condition that nothing in the game had ever used. `enemy-row-back` (Shrike Dive),
// `enemy-lowest` (Headsman's Arc), `enemy-highest` (Tyrant's Claim) and the `self-hurt` condition
// (Wrath Unbound) were all authorable from milestone 4 onward and all sat idle, which meant four
// questions the roster already had answers to that nothing was asking. Flense and Ruinous Arc are
// the ordinary turns the Ravager and the Wrathborn take between them — a lock still has to be
// attached to something that fights.
//
// Named rather than counted on purpose: a count goes stale the first time this list grows, and
// this comment has already done that once.
// ---------------------------------------------------------------------------------------

/**
 * The back-rank lock: the whole of it, at once.
 *
 * A Wisp's Mote Lance taught that a rank is cover rather than immunity, one target at a time.
 * This says the same thing to a party that took the lesson and stacked three fragile carries
 * behind two bodies anyway — which by the second half of the ladder is most parties, because
 * every encounter below has rewarded it. The answers are durability on the carries, a barrier
 * that lands before the dive does, or killing something with 24 `def` before it acts twice.
 *
 * Deliberately not enormous per target. Three back-rank hits at 0.95 against the party's softest
 * three stat blocks is already the widest damage in the game by the value it actually lands.
 */
export const SHRIKE_DIVE = {
  id: 'shrike-dive',
  name: 'Shrike Dive',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.95 }],
  cooldown: 50,
  priority: 2,
} as const;

/** The Ravager opening both front bodies up for its own penetration. */
export const FLENSE = {
  id: 'flense',
  name: 'Flense',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.15 },
    { kind: 'status', status: BLEED, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * The escalation lock: a thing that gets worse the closer it is to dying.
 *
 * `self-hurt` is the condition this exists to use. Every other meter in the game says "not yet" —
 * a cooldown, a pool, an ally who is not hurt enough to be worth healing. This one says "not
 * until you have already committed", which inverts the usual shape: chipping a Wrathborn down is
 * the thing that turns it on. Burst it through the window, or blunt the window with a slow.
 */
export const WRATH_UNBOUND = {
  id: 'wrath-unbound',
  name: 'Wrath Unbound',
  target: 'self',
  effects: [
    { kind: 'status', status: RALLY },
    { kind: 'status', status: HASTE },
  ],
  cooldown: 60,
  condition: { kind: 'self-hurt', fraction: 0.5 },
  priority: 3,
} as const;

/** The Wrathborn's ordinary turn, so the fight before the window is not a formality. */
export const RUINOUS_ARC = {
  id: 'ruinous-arc',
  name: 'Ruinous Arc',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.7 }],
  cost: { kind: 'mp', amount: 12 },
  cooldown: 40,
  priority: 2,
} as const;

/**
 * The execution lock: rank buys nobody safety, and the weakest member is the target.
 *
 * `enemy-lowest` is the player's own executioner rule — Throat Cut, Decisive Strike, Devour —
 * pointed back at them. What it asks for is the one thing a party that has been winning by
 * out-damaging everything has not needed: keeping a nearly-dead member alive rather than
 * finishing the fight before it matters.
 */
export const HEADSMANS_ARC = {
  id: 'headsmans-arc',
  name: "Headsman's Arc",
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * The wall-breaker lock: it goes for the biggest thing you brought.
 *
 * The mirror of {@link HEADSMANS_ARC}, and a sharper question than it looks. A front rank works
 * because ordinary attacks have to pass through it; a Tyrant does not attack *through* anything,
 * it attacks the party's largest HP pool — which is the wall itself. Sundering it on the way
 * means the second hit lands harder than the first, so the answer is sustain on the tank or a
 * cleanse, not a second body.
 */
export const TYRANTS_CLAIM = {
  id: 'tyrants-claim',
  name: "Tyrant's Claim",
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 2.05 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * Every skill, for the specs that check ids are unique and that every kit points at a real one.
 *
 * One list rather than `Object.values(module)`, because `data/` is plain data and that is a
 * function call.
 */
export const SKILLS = [
  GUARD_BREAK,
  OATH_OF_ARMS,
  SWORN_STRIKE,
  MARSHALS_CALL,
  DECISIVE_STRIKE,
  FIELD_DRESSING,
  TRIAGE,
  SHIELD_WALL,
  ANVIL_STANCE,
  HAMMER_CHECK,
  DEEP_WARD,
  GROUND_SLAM,
  SALTBEARD_REMEDY,
  STOUT_WARD,
  PIERCING_SHOT,
  WINDSTEP,
  THROAT_CUT,
  FIRST_ARROW,
  VOLLEY,
  GRAVE_GRASP,
  BLOOD_PACT,
  GRAVE_TIDE,
  SOUL_SIPHON,
  REND,
  MOUNTAIN_BREAKER,
  WORLDS_MAW,
  DEVOUR,
  CHOIRLIGHT,
  VERSE_OF_DAWN,
  ABSOLUTION,
  UNWAVERING_LIGHT,
  AEGIS_SKILL,
  EMBERBURST,
  GAMBLERS_CUT,
  HEXFIRE,
  RUIN_UNBOUND,
  UNMAKING,
  MOTE_LANCE,
  GORE,
  CUTPURSE,
  STONE_FIST,
  GATE_SLAM,
  MEND,
  WITHERHEX,
  MIRE,
  CINDER_STORM,
  BULWARK,
  SHIELD_BASH,
  GLACIAL_SLAM,
  FADE,
  WITHERING_TOUCH,
  SHRIKE_DIVE,
  FLENSE,
  WRATH_UNBOUND,
  RUINOUS_ARC,
  HEADSMANS_ARC,
  TYRANTS_CLAIM,
] as const;
