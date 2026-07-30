/**
 * Playable character stat blocks.
 *
 * Same plain-data rules as `enemies.ts`: numbers and strings only, no imports outside `data/`.
 *
 * These three are **sidegrades, not a power ladder.** Each is the best answer to a different
 * encounter and the worst answer to another: Rin melts anything with low DEF and dies to
 * anything that reaches her, Bran cannot kill a Golem this side of lunchtime but cannot be
 * killed by a Wisp either, and Mira is the one who is never wrong and never decisive. Two
 * players should be able to clear the same stage with different parties.
 *
 * There is no roster or ownership yet — gacha lands in milestone 3, and until then
 * {@link STARTER_TEAM} is simply who you have.
 */

/** Fast, sharp, and made of glass. High crit makes her damage swingy, which is the tradeoff
 * for the raw ATK: she is the only one who meaningfully dents a high-DEF target. */
export const RIN = {
  id: 'rin',
  name: 'Rin',
  stats: { hp: 430, atk: 63, def: 14, spd: 118, critChance: 0.22, critMultiplier: 1.8 },
} as const;

/** Slow and nearly unkillable early. His DEF is what keeps the party alive long enough for the
 * others to finish a fight, and his ATK is why he cannot finish one himself. */
export const BRAN = {
  id: 'bran',
  name: 'Bran',
  stats: { hp: 940, atk: 34, def: 42, spd: 70, critChance: 0.05, critMultiplier: 1.5 },
} as const;

/** The middle of every axis. Unexciting on purpose: she is the control against which the other
 * two are read, and the reason a party is never simply "more Rin". */
export const MIRA = {
  id: 'mira',
  name: 'Mira',
  stats: { hp: 580, atk: 48, def: 23, spd: 96, critChance: 0.12, critMultiplier: 1.6 },
} as const;

/**
 * The party, in slot order.
 *
 * Slot order is load-bearing: it breaks ties in ATB turn order, and enemies target the ally
 * with the least HP remaining rather than the front slot.
 */
export const STARTER_TEAM = [RIN, BRAN, MIRA] as const;
