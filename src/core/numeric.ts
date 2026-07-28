import Decimal from 'break_infinity.js';

/**
 * The numeric type for every quantity that can grow exponentially: gold, XP, damage, HP.
 *
 * Plain `number` is reserved for bounded counters (stage index, pity counter, RNG call
 * count, epoch milliseconds). Those never approach float64's limits and are far cheaper.
 *
 * ## What `break_infinity.js` actually buys, measured
 *
 * It extends **range**, not **precision**. Its mantissa is a float64, so it carries the
 * same ~17 significant digits a plain `number` does:
 *
 * - `Decimal(1e20).add(1)` equals `1e20` — identical to the plain-float64 behaviour.
 * - Past 2^53 neither type counts consecutive integers. Decimal does not fix that.
 * - What it does fix is the ceiling: float64 overflows to `Infinity` at ~1.8e308, while
 *   Decimal keeps going (`1.15^100000` ≈ 6.08e6069).
 *
 * Against the curve in AGENTS.md, a 1.15x-per-stage reward over 500 stages reaches ~2.2e30
 * — comfortably inside float64's native range. That curve does not reach 1e308 until stage
 * ~5075.
 *
 * So this alias is the hedge, not the verdict: every quantity in the game flows through
 * `Numeric`, `num()` and `tryParse()`, so swapping the backing implementation — to plain
 * `number` if the curve stays modest, or to `break_eternity.js` if it ever needs layered
 * exponents — is a change to this file rather than to the whole simulation.
 */
export type Numeric = Decimal;

export { Decimal };

/** Constructs a `Numeric` from a trusted literal. For untrusted input use {@link tryParse}. */
export function num(value: number | string): Numeric {
  return new Decimal(value);
}

export const ZERO: Numeric = num(0);
export const ONE: Numeric = num(1);

/**
 * The exponent `break_infinity.js` uses to represent an infinite value.
 *
 * Infinity is stored as `{ mantissa: 1, exponent: 9e15 }` — a sentinel that is itself a
 * finite number, so `Number.isFinite(exponent)` alone does not catch it. NaN is stored as
 * `{ mantissa: null, exponent: null }`.
 */
const EXPONENT_LIMIT = 9e15;

/**
 * `true` when a value is real and finite, and therefore safe to store in a save or use in
 * arithmetic. Both the NaN and the Infinity representations have to be screened out, and
 * they are encoded differently.
 */
export function isUsable(value: Numeric): boolean {
  return (
    typeof value.mantissa === 'number' &&
    Number.isFinite(value.mantissa) &&
    typeof value.exponent === 'number' &&
    Number.isFinite(value.exponent) &&
    Math.abs(value.exponent) < EXPONENT_LIMIT
  );
}

/**
 * Parses an untrusted value into a `Numeric`, returning `undefined` rather than throwing.
 *
 * `new Decimal(...)` is hostile to damaged input: it throws outright on `''`, `null`, and
 * plain objects, and yields NaN for unparseable strings. A save file is untrusted input,
 * and a throw during load costs the player their entire run, so every parse goes through
 * here.
 */
export function tryParse(raw: unknown): Numeric | undefined {
  if (raw instanceof Decimal) {
    return isUsable(raw) ? raw : undefined;
  }
  if (typeof raw !== 'number' && typeof raw !== 'string') {
    return undefined;
  }
  if (typeof raw === 'string' && raw.trim() === '') {
    return undefined;
  }
  let parsed: Numeric;
  try {
    parsed = new Decimal(raw);
  } catch {
    return undefined;
  }
  return isUsable(parsed) ? parsed : undefined;
}

/** Parses an untrusted value, falling back to `fallback` when it is unusable. */
export function parseOr(raw: unknown, fallback: Numeric): Numeric {
  return tryParse(raw) ?? fallback;
}

/**
 * Encodes a `Numeric` for persistence. Exponential-notation strings round-trip exactly and
 * stay readable in a save file, which matters when hand-inspecting a bug report.
 */
export function serialize(value: Numeric): string {
  return value.toString();
}
