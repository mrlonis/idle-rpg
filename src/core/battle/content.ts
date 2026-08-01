import { type CurrencyAmounts, type CurrencyId, type Rates, RATE_CURRENCY_IDS } from '../currency';
import { type Numeric, ONE, parseOr, ZERO } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import {
  type AuthoredAmount,
  type AuthoredCurrencies,
  type Combatant,
  type CombatantData,
  type CombatStats,
  type StatBlockData,
} from './types';

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

/** Parses an authored quantity, treating anything unusable as nothing. */
export function toAmount(raw: AuthoredAmount | undefined): Numeric {
  return raw === undefined ? ZERO : atLeast(parseOr(raw, ZERO), ZERO);
}

/**
 * Parses an authored per-currency block.
 *
 * Absent keys are left absent rather than defaulted to zero, so a payout carries only what a
 * stage actually grants — which is what lets the "while you were away" panel list the two
 * currencies that moved instead of five, three of them zero.
 */
export function toCurrencyAmounts(raw: AuthoredCurrencies): CurrencyAmounts {
  const parsed: Partial<Record<CurrencyId, Numeric>> = {};
  for (const id of RATE_CURRENCY_IDS) {
    const value = raw[id];
    if (value !== undefined) {
      parsed[id] = toAmount(value);
    }
  }
  return parsed;
}

/** Parses an authored rate block. Same shape, different destination. */
export function toRates(raw: AuthoredCurrencies): Readonly<Partial<Rates>> {
  return toCurrencyAmounts(raw);
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
