/**
 * Every lasting effect in the game, authored once and referenced by the skills that apply it.
 *
 * Plain data. `core/battle/status.ts` resolves these into live statuses, snapshotting each
 * quantity against the applier's stats at the moment it lands.
 *
 * ## Durations are in battle ticks, and that reads oddly until it doesn't
 *
 * A combatant acts every `1000 / spd` ticks, so a Human at `spd: 96` takes a turn roughly
 * every 11 ticks and a Wisp at 148 every 7. A 45-tick debuff is therefore about four turns for
 * the Human and six for the Wisp — which is the point. Quoting durations in *turns* would make
 * a debuff last longest on the slow target it was least needed against, because the slow
 * target's turns are the long ones.
 *
 * ## Sizing, and the one rule worth keeping
 *
 * A stat multiplier sits between 0.7 and 1.4, which is roughly a quarter to a third of the
 * stat. Big enough that spending a turn on it beats swinging, small enough that landing two of
 * them is not the whole fight. Damage-over-time is priced per proc against the applier's
 * attack stat, so a poison from a big attacker hurts more — the debuffer's own investment
 * still matters after the debuff has landed.
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

/** Physical armour torn open. The setup a Monster's raw ATK wants. */
export const SUNDER = {
  kind: 'stat-mod',
  id: 'sunder',
  name: 'Sundered',
  hostile: true,
  duration: STANDARD,
  stat: 'pdef',
  multiplier: 0.72,
} as const;

/** The magical half of {@link SUNDER}. */
export const CURSE = {
  kind: 'stat-mod',
  id: 'curse',
  name: 'Cursed',
  hostile: true,
  duration: STANDARD,
  stat: 'mdef',
  multiplier: 0.72,
} as const;

/** Blunted. The defensive answer to a hard-hitting front rank. */
export const WEAKEN = {
  kind: 'stat-mod',
  id: 'weaken',
  name: 'Weakened',
  hostile: true,
  duration: STANDARD,
  stat: 'patk',
  multiplier: 0.75,
} as const;

/**
 * Slowed. The most quietly powerful debuff in the game, because SPD buys turns rather than
 * damage — a third off a Wisp's speed is a third of everything it was ever going to do.
 */
export const SLOW = {
  kind: 'stat-mod',
  id: 'slow',
  name: 'Slowed',
  hostile: true,
  duration: STANDARD,
  stat: 'spd',
  multiplier: 0.7,
} as const;

/** A physical bleed, priced against the applier's `patk`. */
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

/** The magical damage-over-time, measured against `mdef` rather than armour. */
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
  stat: 'pdef',
  multiplier: 1.4,
} as const;

/** The magical half of {@link GUARD}. */
export const WARD = {
  kind: 'stat-mod',
  id: 'ward',
  name: 'Warded',
  hostile: false,
  duration: STANDARD,
  stat: 'mdef',
  multiplier: 1.4,
} as const;

/** Sharpened. Lands on `patk`, so it is worth most to a front rank. */
export const RALLY = {
  kind: 'stat-mod',
  id: 'rally',
  name: 'Rallied',
  hostile: false,
  duration: STANDARD,
  stat: 'patk',
  multiplier: 1.3,
} as const;

/** The caster's half of {@link RALLY}. */
export const FOCUS = {
  kind: 'stat-mod',
  id: 'focus',
  name: 'Focused',
  hostile: false,
  duration: STANDARD,
  stat: 'matk',
  multiplier: 1.3,
} as const;

/** Quickened. The mirror of {@link SLOW}, and worth as much for the same reason. */
export const HASTE = {
  kind: 'stat-mod',
  id: 'haste',
  name: 'Hastened',
  hostile: false,
  duration: STANDARD,
  stat: 'spd',
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
  power: 1.1,
} as const;

/** A bigger, briefer {@link BARRIER}. */
export const AEGIS = {
  kind: 'shield',
  id: 'aegis',
  name: 'Aegis',
  hostile: false,
  duration: 55,
  power: 1.8,
} as const;

/**
 * Every status, for the specs that check ids are unique and that nothing is orphaned.
 *
 * Kept as one list rather than derived from the exports above, because `data/` is plain data
 * and `Object.values(module)` is a function call.
 */
export const STATUSES = [
  SUNDER,
  CURSE,
  WEAKEN,
  SLOW,
  BLEED,
  POISON,
  BURN,
  STUN,
  GUARD,
  WARD,
  RALLY,
  FOCUS,
  HASTE,
  REGENERATION,
  BARRIER,
  AEGIS,
] as const;
