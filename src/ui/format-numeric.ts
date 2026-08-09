import { CURRENCY_IDS, type CurrencyAmounts, type CurrencyId, type Numeric } from '../core';

/**
 * What each currency is called on screen.
 *
 * Ids are what the save and the simulation speak; these are what the player reads. `summons`
 * is displayed as "crystals" because that is the noun the summon screen uses for the thing
 * being spent — the id names the purpose, the label names the object.
 */
export const CURRENCY_LABELS: Readonly<Record<CurrencyId, string>> = {
  gold: 'gold',
  xp: 'XP',
  essence: 'essence',
  summons: 'crystals',
  spark: 'spark',
  alloy: 'alloy',
  emblem: 'emblems',
};

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
    if (Number.isInteger(asNumber)) {
      return String(asNumber);
    }
    // Below the requested precision a fixed number of decimals rounds to a flat zero, which is
    // the difference between "this earns a little" and "this earns nothing". Fall back to
    // significant figures so a genuinely small quantity still reads as one.
    const rounded = asNumber.toFixed(fractionDigits);
    return trimTrailingZeros(
      Number(rounded) === 0 ? asNumber.toPrecision(fractionDigits) : rounded,
    );
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
 * Below this, a rate is quoted per hour instead of per second.
 *
 * Summon crystals accrue at 0.0278/s on a fresh run and essence at 0.05/s at the top of the
 * ladder. Per second those read as "0.03/s" and "0.05/s" — technically true and completely
 * useless, since the number a player actually wants is "how long until I can pull". Per hour the
 * same rates are "100/hr" and "180/hr", which answers it directly, and the crystal one is
 * authored in exactly those units for exactly this reason.
 *
 * The threshold sits just under gold's opening rate of 0.5/s, so the currency a player watches
 * tick keeps its per-second reading and the two slow ones get a unit that suits them.
 */
const PER_HOUR_BELOW = 0.1;

/**
 * Formats a per-second rate, choosing the unit that makes it legible.
 *
 * Kept separate from {@link formatNumeric} so the unit and the quantity cannot drift apart
 * across the UI.
 */
export function formatRate(value: Numeric): string {
  if (value.lte(0)) {
    return '0/s';
  }
  if (value.lt(PER_HOUR_BELOW)) {
    return `${formatNumeric(value.mul(3600))}/hr`;
  }
  return `${formatNumeric(value)}/s`;
}

/**
 * Renders a per-currency payout as a readable list: `250 gold · 48 XP · 2 essence`.
 *
 * Currencies that paid nothing are omitted rather than shown as zero. A stage that grants gold
 * and XP should say so in four words, not in five clauses three of which are "0". Returns
 * `null` when nothing was paid at all, so callers can drop the sentence entirely instead of
 * printing an empty list.
 */
export function formatAmounts(amounts: CurrencyAmounts): string | null {
  const parts: string[] = [];
  for (const id of CURRENCY_IDS) {
    const amount = amounts[id];
    if (amount?.gt(0) === true) {
      parts.push(`${formatNumeric(amount)} ${CURRENCY_LABELS[id]}`);
    }
  }
  return parts.length === 0 ? null : parts.join(' · ');
}

/**
 * Renders a duration as a coarse human phrase, for the offline-progress summary.
 *
 * Deliberately imprecise: "about 3 hours" is what a returning player wants, not
 * "2h 58m 41s".
 *
 * **Days exist because there is no offline cap.** While the away window was clamped at ten
 * hours, stopping at an hours unit was sufficient by construction. Uncapped, a year away is a
 * supported outcome and "8760 hours" is a correct answer that no one can read.
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
  if (hours < 24) {
    const remainder = minutes % 60;
    if (remainder === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${hours}h ${remainder}m`;
  }
  const days = Math.floor(hours / 24);
  const remainder = hours % 24;
  if (remainder === 0) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  return `${days}d ${remainder}h`;
}
