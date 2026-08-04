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
] as const;
