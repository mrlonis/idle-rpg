/**
 * Enemy stat blocks.
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
 * - Damage is `atk² / (atk + def)`. DEF has diminishing returns and can never reduce a hit to
 *   zero, so a high-DEF enemy is a soft wall that punishes low ATK rather than a hard one that
 *   makes a fight unwinnable.
 *
 * ## Design intent
 *
 * These are **locks, not rungs on a ladder.** Each archetype asks a different question of the
 * party, which is how composition is meant to matter — through enemy design rather than flat
 * "+10% if two Fire units" synergies, which only ever produce a new single optimal team.
 * Milestone 4 is where the questions get sharper (cleanses, backline threats, burst windows);
 * these are the blunt first versions.
 */

/** Fodder. Establishes the baseline every other archetype is read against. */
export const SLIME = {
  id: 'slime',
  name: 'Slime',
  stats: { hp: 260, atk: 22, def: 6, spd: 78, critChance: 0.03, critMultiplier: 1.5 },
} as const;

/** Fragile but very fast: asks whether the party can kill something before it acts four times.
 * A slow party bleeds to these even though each hit is trivial. */
export const WISP = {
  id: 'wisp',
  name: 'Wisp',
  stats: { hp: 170, atk: 19, def: 4, spd: 148, critChance: 0.08, critMultiplier: 1.6 },
} as const;

/** A plain meat wall. Asks for sustained damage rather than a burst window. */
export const BOAR = {
  id: 'boar',
  name: 'Tusked Boar',
  stats: { hp: 540, atk: 33, def: 15, spd: 84, critChance: 0.05, critMultiplier: 1.5 },
} as const;

/** Hits hard and often. Asks whether the party's fragile damage dealer survives the opening. */
export const BANDIT = {
  id: 'bandit',
  name: 'Bandit',
  stats: { hp: 410, atk: 41, def: 18, spd: 106, critChance: 0.12, critMultiplier: 1.7 },
} as const;

/** Enormous DEF and HP, barely moves. Because of the diminishing-return damage curve this
 * punishes a party of many small hits far more than a party with one big one. */
export const GOLEM = {
  id: 'golem',
  name: 'Stone Golem',
  stats: { hp: 1300, atk: 54, def: 62, spd: 52, critChance: 0.02, critMultiplier: 2 },
} as const;

/** The gate at the end of the authored content: high on every axis at once. */
export const WARDEN = {
  id: 'warden',
  name: 'Gate Warden',
  stats: { hp: 900, atk: 58, def: 34, spd: 98, critChance: 0.1, critMultiplier: 1.8 },
} as const;
