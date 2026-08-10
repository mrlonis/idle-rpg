/**
 * Every lasting effect in the game, authored once and referenced by the skills that apply it.
 *
 * Plain data. `core/battle/status.ts` resolves these into live statuses, snapshotting each
 * quantity against the applier's stats at the moment it lands.
 *
 * ## Durations are in battle ticks, and that reads oddly until it doesn't
 *
 * A combatant acts every `1000 / haste` ticks, so a Human at `haste: 96` takes a turn roughly
 * every 11 ticks and a Wisp at 148 every 7. A 45-tick debuff is therefore about four turns for
 * the Human and six for the Wisp — which is the point. Quoting durations in *turns* would make
 * a debuff last longest on the slow target it was least needed against, because the slow
 * target's turns are the long ones.
 *
 * ## Sizing, and the one rule worth keeping
 *
 * A stat multiplier sits between 0.7 and 1.4, which is roughly a quarter to a third of the
 * stat. Big enough that spending a turn on it beats swinging, small enough that landing two of
 * them is not the whole fight. Damage-over-time is priced per proc against the applier's `atk`,
 * so a poison from a big attacker hurts more — the debuffer's own investment still matters
 * after the debuff has landed.
 *
 * ## Three statuses went with the stat collapse
 *
 * `CURSE`, `WARD` and `FOCUS` were the magical halves of `SUNDER`, `GUARD` and `RALLY`. With one
 * `atk` and one `def` they were the same status under a second name, so milestone 8a deleted
 * them rather than shipping duplicates. The axis they carried did not disappear — it moved onto
 * `physicalResist` and `magicResist`, which are percentages and therefore outside what a
 * `stat-mod` may move.
 *
 * Nothing here stacks. Re-applying by the same id refreshes it, which is enforced in `core/`
 * rather than here: two casters with the same 0.72 defence debuff would otherwise land 0.52,
 * three would land 0.37, and a wide enough enemy wave would delete a defensive stat by
 * arithmetic nobody authored.
 */

/** How long an ordinary buff or debuff runs. About four turns at a middling speed. */
const STANDARD = 45;

/** Longer, for effects that pay out gradually rather than all at once. */
const LINGERING = 60;

// ---------------------------------------------------------------------------------------
// Hostile — the things a cleanse exists to answer
// ---------------------------------------------------------------------------------------

/** Armour torn open. The setup a Monster's raw ATK wants, and now the only defence shred. */
export const SUNDER = {
  kind: 'stat-mod',
  id: 'sunder',
  name: 'Sundered',
  hostile: true,
  duration: STANDARD,
  stat: 'def',
  multiplier: 0.72,
} as const;

/** Blunted. The defensive answer to a hard-hitting front rank. */
export const WEAKEN = {
  kind: 'stat-mod',
  id: 'weaken',
  name: 'Weakened',
  hostile: true,
  duration: STANDARD,
  stat: 'atk',
  multiplier: 0.75,
} as const;

/**
 * Slowed. The most quietly powerful debuff in the game, because haste buys turns rather than
 * damage — a third off a Wisp's gauge fill is a third of everything it was ever going to do.
 */
export const SLOW = {
  kind: 'stat-mod',
  id: 'slow',
  name: 'Slowed',
  hostile: true,
  duration: STANDARD,
  stat: 'haste',
  multiplier: 0.7,
} as const;

/** A physical bleed, priced against the applier's `atk` and answered by physical resist. */
export const BLEED = {
  kind: 'dot',
  id: 'bleed',
  name: 'Bleeding',
  hostile: true,
  duration: STANDARD,
  damageType: 'physical',
  power: 0.3,
} as const;

/** Slower than a bleed and longer, so cleansing it early is worth more than cleansing late. */
export const POISON = {
  kind: 'dot',
  id: 'poison',
  name: 'Poisoned',
  hostile: true,
  duration: LINGERING,
  damageType: 'physical',
  power: 0.24,
} as const;

/** The magical damage-over-time, answered by magic resist rather than by physical. */
export const BURN = {
  kind: 'dot',
  id: 'burn',
  name: 'Burning',
  hostile: true,
  duration: STANDARD,
  damageType: 'magical',
  power: 0.34,
} as const;

/**
 * A turn taken away.
 *
 * Deliberately the shortest status in the game. A stun costs its victim the turn it had
 * already earned — the ATB gauge is still spent — so it is tempo denial rather than removal,
 * and a fight can never deadlock behind one.
 */
export const STUN = {
  kind: 'stun',
  id: 'stun',
  name: 'Stunned',
  hostile: true,
  duration: 16,
} as const;

// ---------------------------------------------------------------------------------------
// Friendly — buffs, shields and healing over time
// ---------------------------------------------------------------------------------------

/** More armour. What a Dwarf spends its turn on when nothing needs killing. */
export const GUARD = {
  kind: 'stat-mod',
  id: 'guard',
  name: 'Guarded',
  hostile: false,
  duration: STANDARD,
  stat: 'def',
  multiplier: 1.4,
} as const;

/** Sharpened. One `atk` since 8a, so it is worth the same to a caster as to a swordsman. */
export const RALLY = {
  kind: 'stat-mod',
  id: 'rally',
  name: 'Rallied',
  hostile: false,
  duration: STANDARD,
  stat: 'atk',
  multiplier: 1.3,
} as const;

/** Quickened. The mirror of {@link SLOW}, and worth as much for the same reason. */
export const HASTE = {
  kind: 'stat-mod',
  id: 'haste',
  name: 'Hastened',
  hostile: false,
  duration: STANDARD,
  stat: 'haste',
  multiplier: 1.35,
} as const;

/** Healing spread over several turns, which is worth less than the same total up front. */
export const REGENERATION = {
  kind: 'regen',
  id: 'regeneration',
  name: 'Regenerating',
  hostile: false,
  duration: LINGERING,
  power: 0.3,
} as const;

/**
 * An absorb pool.
 *
 * Strictly better than the same amount of healing on a full-health target and strictly worse
 * on a dying one, which is what makes shields and heals different tools rather than two
 * spellings of the same one.
 */
export const BARRIER = {
  kind: 'shield',
  id: 'barrier',
  name: 'Barrier',
  hostile: false,
  duration: 70,
  // Retuned upward in milestone 8a, deliberately rather than to make a test green. Shields
  // price against the applier's `atk`, and the characters authored to cast them are tanks and
  // healers — the lowest attack stats in the game. At 1.1 a Dwarf's barrier absorbed under four
  // percent of a health bar, which is a badge rather than a defence.
  power: 1.5,
} as const;

/** A bigger, briefer {@link BARRIER}. */
export const AEGIS = {
  kind: 'shield',
  id: 'aegis',
  name: 'Aegis',
  hostile: false,
  duration: 55,
  power: 2.3,
} as const;

/**
 * Every status, for the specs that check ids are unique and that nothing is orphaned.
 *
 * Kept as one list rather than derived from the exports above, because `data/` is plain data
 * and `Object.values(module)` is a function call.
 */
// ---------------------------------------------------------------------------------------
// Signature passives — the opening half of a signature ability's vocabulary
// ---------------------------------------------------------------------------------------

/**
 * How long a permanent passive runs, in ticks.
 *
 * ⚠️ **Longer than a fight can last, which is what "permanent" means here.** `MAX_BATTLE_TICKS` is
 * 900, so anything above it is permanent in every sense the simulation can observe. There is
 * deliberately no infinity value: keeping the field a plain number means nothing downstream — the
 * expiry sweep, the status panel, the event log — has to special-case a sentinel.
 *
 * It is not derived from `MAX_BATTLE_TICKS` because `data/` may not import `core/`;
 * `data/signature.spec.ts` asserts the relationship instead, so raising the tick cap without
 * raising this is a failing test rather than a passive that quietly expires late in long fights.
 */
const PERMANENT = 1000;

/**
 * The passives a signature item's top rungs grant, applied to the **wearer** at tick 0.
 *
 * ## Why these are `stat-mod` and `shield` and never `regen`
 *
 * A permanent regeneration was the obvious fourth kind and it is deliberately absent. Closing
 * pressure amplifies every damage instance without bound past `PRESSURE_AFTER_TICKS` and
 * **deliberately does not amplify healing**, which is what breaks a closed sustain loop — so
 * permanent healing does not win fights, it stalls them, and a stalled fight runs the
 * ninety-second clock out into a **defeat**. A sustain passive that made a party unkillable would
 * therefore make it lose, which is the least intuitive failure this system can produce.
 *
 * A shield is safe where a regeneration is not, and the distinction is exactly the one closing
 * pressure cares about: a shield banks a pool once at tick 0 and depletes, so it cannot outrun
 * rising damage. A stat multiplier is safe because it is a multiplication on a board both sides
 * scale on.
 */

/** Aurelia, at the top of her banner: the Ninth still forming up behind her. */
export const SIG_RESOLVE = {
  kind: 'stat-mod',
  id: 'sig-resolve',
  name: 'Resolve',
  hostile: false,
  duration: PERMANENT,
  stat: 'atk',
  multiplier: 1.25,
} as const;

/**
 * Thraun, set before the first blow lands. The deepest permanent defence in the game.
 *
 * At the library's ceiling of 1.4 rather than above it. 1.5 was authored first and failed
 * `skills.spec.ts`, and the tempting reading was that the bound does not apply here — its stated
 * reason is turn economy ("spending a turn on it beats swinging") and a passive costs no turn.
 * That reasoning is what turns a real guard into a loophole, and the honest version is that a
 * permanent multiplier is *more* dangerous than a cast one rather than less: it is up for the
 * whole fight and cannot be played around. So it was retuned to fit the bound rather than the
 * bound widened to fit it, and the tenth of a point that cost is not worth an exception.
 */
export const SIG_BULWARK = {
  kind: 'stat-mod',
  id: 'sig-bulwark',
  name: 'Bulwark',
  hostile: false,
  duration: PERMANENT,
  stat: 'def',
  multiplier: 1.4,
} as const;

/** Aelrindel, already drawn. Modest by design — he carries the highest `haste` in the game. */
export const SIG_QUICKENING = {
  kind: 'stat-mod',
  id: 'sig-quickening',
  name: 'Quickening',
  hostile: false,
  duration: PERMANENT,
  stat: 'haste',
  multiplier: 1.2,
} as const;

/**
 * Nekros, warded by what he has already taken.
 *
 * A shield rather than the defence buff the other casters get, because his `def` is 7 — the
 * lowest in the game — and a multiplier on nearly nothing is nearly nothing. An absorb pool priced
 * off his `atk` is the version that means anything on this stat block.
 */
export const SIG_SOULGUARD = {
  kind: 'shield',
  id: 'sig-soulguard',
  name: 'Soulguard',
  hostile: false,
  duration: PERMANENT,
  power: 2.0,
} as const;

/** Vharok, hungry before the fight starts. */
export const SIG_HUNGER = {
  kind: 'stat-mod',
  id: 'sig-hunger',
  name: 'Hunger',
  hostile: false,
  duration: PERMANENT,
  stat: 'atk',
  multiplier: 1.3,
} as const;

/** Seraphine's own ward, which is the one sustain passive shaped so it cannot stall a fight. */
export const SIG_SANCTUARY = {
  kind: 'shield',
  id: 'sig-sanctuary',
  name: 'Sanctuary',
  hostile: false,
  duration: PERMANENT,
  power: 2.5,
} as const;

/** Azrathoth, unbound from the start. */
export const SIG_ENTROPY = {
  kind: 'stat-mod',
  id: 'sig-entropy',
  name: 'Entropy',
  hostile: false,
  duration: PERMANENT,
  stat: 'atk',
  multiplier: 1.3,
} as const;

// ---------------------------------------------------------------------------------------
// The Bound Marches — milestone 17's four, and the vocabulary chapter 3 is built on
//
// Each one names an answer the roster already owns and nothing was asking for, which is the same
// test the Ashfall set was authored against. What is new here is that three of the four are about
// **who a hit lands on** rather than about how big it is — a lever nothing in the game had.
// ---------------------------------------------------------------------------------------

/**
 * Every single-target attack is drawn onto the wearer.
 *
 * ⚠️ **Deliberately not permanent, and the duty cycle is the whole of what keeps it fair.** It
 * overrides the row gate, so while it is up a party's back-rank reach is worth nothing — and a
 * party whose only answers are single-target has to be given a window at the thing behind it.
 * `data/skills.spec.ts` holds that every skill applying one has a cooldown longer than this, which
 * is the same rule `BULWARK`'s comment argues for a barrier and for a different reason: there it
 * was termination, here it is that an encounter must stay answerable.
 */
export const OATHSHIELD = {
  kind: 'taunt',
  id: 'oathshield',
  name: 'Oathshield',
  hostile: false,
  duration: STANDARD,
} as const;

/**
 * Spines: a quarter of what reaches the wearer is dealt straight back.
 *
 * Permanent, and safe to be, because it can only ever *shorten* a fight — it is strictly extra
 * damage on a schedule the party controls. A quarter rather than the half the engine allows: this
 * taxes the one thing every party does on every turn, so it is felt at a size that would read as
 * arbitrary anywhere else.
 */
export const THORNMAIL = {
  kind: 'reflect',
  id: 'thornmail',
  name: 'Thorned',
  hostile: false,
  duration: PERMANENT,
  share: 0.25,
} as const;

/**
 * A board bound together: two fifths of any hit is split across everything else still standing.
 *
 * The answer to focus fire, which is the habit every stage in the game has rewarded. It costs the
 * board nothing in total health — damage is conserved — so what it buys is **time**, by making the
 * party's usual route of removing one threat at a time stop working while it is up.
 */
export const CHAINBOND = {
  kind: 'link',
  id: 'chainbond',
  name: 'Chained',
  hostile: false,
  duration: LINGERING,
  share: 0.4,
} as const;

/**
 * A payload that lands in one piece forty ticks after it is planted.
 *
 * Bigger per instance than any damage-over-time and roughly the same in total, which is the point
 * of both halves: a poison asks whether the party can afford the attrition, and this asks whether
 * the cleanse arrives before the tick does. Magical, so the resist that answers a Pyre answers this
 * too.
 */
export const EMBER_SEED = {
  kind: 'bomb',
  id: 'ember-seed',
  name: 'Seeded',
  hostile: true,
  duration: 40,
  damageType: 'magical',
  power: 1.4,
} as const;

/**
 * The Chainsworn's, on the whole party at once, and smaller per head for exactly that reason.
 *
 * Five payloads against a cleanse that removes a fixed count is the same shape of question
 * {@link SEVENFOLD_HEX} asks, moved from *how many statuses* to *how many bodies* — the party has
 * the answer and cannot spend it everywhere.
 */
export const DOOMBRAND = {
  kind: 'bomb',
  id: 'doombrand',
  name: 'Doomed',
  hostile: true,
  duration: 50,
  damageType: 'physical',
  power: 1.2,
} as const;

export const STATUSES = [
  SUNDER,
  WEAKEN,
  SLOW,
  BLEED,
  POISON,
  BURN,
  STUN,
  GUARD,
  RALLY,
  HASTE,
  REGENERATION,
  BARRIER,
  AEGIS,
  SIG_RESOLVE,
  SIG_BULWARK,
  SIG_QUICKENING,
  SIG_SOULGUARD,
  SIG_HUNGER,
  SIG_SANCTUARY,
  SIG_ENTROPY,
  OATHSHIELD,
  THORNMAIL,
  CHAINBOND,
  EMBER_SEED,
  DOOMBRAND,
] as const;
