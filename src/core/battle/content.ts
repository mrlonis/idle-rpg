import { type Numeric, ONE, parseOr, ZERO } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import { type Combatant, type CombatantData, type CombatStats, type StatBlockData } from './types';

/**
 * The boundary between authored content and the simulation.
 *
 * `data/` holds plain numbers and strings; the simulation needs `Numeric` quantities and
 * speeds it can rely on. Everything crosses through here.
 *
 * Unlike the save layer, this does not report what it repaired: content is authored in this
 * repo rather than read off a player's device, so a bad stat block is a bug for a spec to
 * catch, not damage to recover and explain. The clamping exists because the simulation's
 * termination argument depends on it — a `spd` of 0 would leave a combatant unable to ever
 * act, and a `spd` above the gauge threshold would let one bank two actions in a single tick
 * and break turn ordering.
 */

/**
 * Smallest HP a combatant can be authored with. Zero HP means dead before the first tick,
 * which produces a battle log nobody can read.
 */
const MIN_HP: Numeric = ONE;

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
}

function atLeast(value: Numeric, floor: Numeric): Numeric {
  return value.lt(floor) ? floor : value;
}

/** Parses and clamps an authored stat block into the form the simulation uses. */
export function toCombatStats(raw: StatBlockData): CombatStats {
  return {
    hp: atLeast(parseOr(raw.hp, MIN_HP), MIN_HP),
    atk: atLeast(parseOr(raw.atk, ZERO), ZERO),
    def: atLeast(parseOr(raw.def, ZERO), ZERO),
    spd: clamp(raw.spd, 1, ATB_THRESHOLD, 1),
    critChance: clamp(raw.critChance, 0, 1, 0),
    critMultiplier: clamp(raw.critMultiplier, 1, Number.MAX_SAFE_INTEGER, 1),
  };
}

/** Parses an authored combatant. */
export function toCombatant(raw: CombatantData): Combatant {
  return { id: raw.id, name: raw.name, stats: toCombatStats(raw.stats) };
}

/** Parses an authored gold reward, treating anything unusable as nothing. */
export function toGoldReward(raw: number | string): Numeric {
  return atLeast(parseOr(raw, ZERO), ZERO);
}

/**
 * Ticks a combatant needs to fill its gauge from empty.
 *
 * The clearest way to read what a speed value actually buys, which is why it is exported
 * rather than inlined: balance work and specs both reason in actions, not in gauge points.
 */
export function ticksPerAction(spd: number): number {
  return Math.ceil(ATB_THRESHOLD / clamp(spd, 1, ATB_THRESHOLD, 1));
}
