import { type Numeric } from '../core';

/**
 * Short-scale suffixes, one per power of 1000. Covers up to 1e36; past that the formatter
 * falls back to exponential notation, which stays readable where invented suffixes stop
 * being recognisable.
 */
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'] as const;

const MAX_SUFFIX_EXPONENT = SUFFIXES.length * 3;

/**
 * Formats a game quantity for display.
 *
 * Angular's `DecimalPipe` cannot be used for this: game quantities are `Numeric`
 * (`break_infinity` `Decimal`) rather than `number`, and the values routinely exceed what a
 * `number` can express. This is the presentation layer's counterpart to `core/numeric.ts`.
 *
 * Below 1000 the value is shown plainly so early progression reads exactly; above that it
 * switches to a suffix with three significant figures, and past 1e36 to exponential.
 */
export function formatNumeric(value: Numeric, fractionDigits = 2): string {
  if (!Number.isFinite(value.mantissa) || !Number.isFinite(value.exponent)) {
    return '—';
  }
  if (value.lt(0)) {
    return `-${formatNumeric(value.neg(), fractionDigits)}`;
  }
  if (value.lt(1000)) {
    // Small numbers read better without a suffix, and whole values without a decimal point.
    const asNumber = value.toNumber();
    return Number.isInteger(asNumber) ? String(asNumber) : asNumber.toFixed(fractionDigits);
  }

  const exponent = value.exponent;
  if (exponent >= MAX_SUFFIX_EXPONENT) {
    return value.toExponential(fractionDigits).replace('e+', 'e');
  }

  const tier = Math.floor(exponent / 3);
  const scaledMantissa = value.mantissa * Math.pow(10, exponent - tier * 3);
  return `${trimTrailingZeros(scaledMantissa.toFixed(fractionDigits))}${SUFFIXES[tier]}`;
}

/** `1.50K` reads worse than `1.5K`, and `1.00K` worse than `1K`. */
function trimTrailingZeros(text: string): string {
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

/**
 * Formats a per-second rate. Kept separate from {@link formatNumeric} so the unit and the
 * quantity cannot drift apart across the UI.
 */
export function formatRate(value: Numeric): string {
  return `${formatNumeric(value)}/s`;
}

/**
 * Renders a duration as a coarse human phrase, for the offline-progress summary.
 *
 * Deliberately imprecise: "about 3 hours" is what a returning player wants, not
 * "2h 58m 41s".
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) {
    return 'no time';
  }
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) {
    return 'less than a minute';
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }
  return `${hours}h ${remainder}m`;
}
