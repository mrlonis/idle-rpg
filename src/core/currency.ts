import { type Numeric, parseOr, serialize, tryParse, ZERO } from './numeric';

/**
 * The run's currencies, and the wallet that holds them.
 *
 * Milestone 1 had exactly one quantity and carried it as two fields on `GameState` —
 * `gold` and `goldPerSec`. Five currencies would be ten such fields, and every one of them
 * would need its own line in `tick`, in `resume`, in the save encoder and in the repair
 * pass. A keyed record collapses all of that into one loop per operation, which is why the
 * flat fields are gone.
 *
 * ## What each currency is for
 *
 * The three levelling currencies are deliberately **not** interchangeable, and their rates
 * are tuned far apart so each one bites at a different moment:
 *
 * - `gold` is the broad one. Levelling spends it now; gear, gear levels and the shop will
 *   spend it later. It is the fastest-accruing currency because it has the most claims on it.
 * - `xp` only ever levels characters, so it accrues more slowly — there is nothing else
 *   competing for it and no reason to be generous with a currency with one use.
 * - `essence` is the bottleneck on purpose. It is charged only at breakthrough levels, and
 *   it trickles in stingily enough that it, not gold, is what decides how fast a character
 *   climbs late.
 * - `summons` buys gacha pulls. A slow idle rate plus a bonus for each first-time stage
 *   clear, so progress is rewarded but a player stuck on a stage never stops earning pulls.
 * - `spark` is the only currency with **no rate at all**. It exists solely as the overflow
 *   valve: copies of a character already at `Ascended★5` have nothing left to ascend, so
 *   they convert here and buy something from the shop instead of evaporating.
 */

/** Every currency the run can hold. */
export const CURRENCY_IDS = ['gold', 'xp', 'essence', 'summons', 'spark'] as const;

export type CurrencyId = (typeof CURRENCY_IDS)[number];

/**
 * The currencies that accrue at a per-second rate.
 *
 * A subset rather than the whole list, because `spark` genuinely has no rate — it is minted
 * by duplicate pulls and nothing else. Keeping it out of `Rates` at the type level means the
 * offline solver cannot silently start paying it out, which is the failure this split exists
 * to prevent.
 */
export const RATE_CURRENCY_IDS = ['gold', 'xp', 'essence', 'summons'] as const;

export type RateCurrencyId = (typeof RATE_CURRENCY_IDS)[number];

/** How much of each currency the run holds. */
export type Wallet = Readonly<Record<CurrencyId, Numeric>>;

/** Idle income, per second, for each currency that has one. */
export type Rates = Readonly<Record<RateCurrencyId, Numeric>>;

/** A partial wallet delta, as a cost or a payout. Absent keys mean zero. */
export type CurrencyAmounts = Readonly<Partial<Record<CurrencyId, Numeric>>>;

/** A wallet with nothing in it. A new run starts here and earns its way out. */
export function emptyWallet(): Wallet {
  return { gold: ZERO, xp: ZERO, essence: ZERO, summons: ZERO, spark: ZERO };
}

/**
 * All rates at zero.
 *
 * A new run earns **nothing** while idle, which is what makes the first battle the only
 * thing worth doing. Clearing a stage is what switches each rate on.
 */
export function zeroRates(): Rates {
  return { gold: ZERO, xp: ZERO, essence: ZERO, summons: ZERO };
}

/** Adds a payout to a wallet. */
export function credit(wallet: Wallet, amounts: CurrencyAmounts): Wallet {
  const next = { ...wallet };
  for (const id of CURRENCY_IDS) {
    const amount = amounts[id];
    if (amount !== undefined) {
      next[id] = wallet[id].add(amount);
    }
  }
  return next;
}

/**
 * Subtracts a cost from a wallet, clamping at zero.
 *
 * The clamp is a backstop, not the check: callers are expected to have asked
 * {@link canAfford} first. It is here because a negative balance is the kind of damage that
 * propagates silently through every later comparison, and the save layer would then have to
 * repair it on load anyway.
 */
export function debit(wallet: Wallet, amounts: CurrencyAmounts): Wallet {
  const next = { ...wallet };
  for (const id of CURRENCY_IDS) {
    const amount = amounts[id];
    if (amount !== undefined) {
      const remaining = wallet[id].sub(amount);
      next[id] = remaining.lt(ZERO) ? ZERO : remaining;
    }
  }
  return next;
}

/** `true` when the wallet covers every currency in `cost`. */
export function canAfford(wallet: Wallet, cost: CurrencyAmounts): boolean {
  return CURRENCY_IDS.every((id) => {
    const amount = cost[id];
    return amount === undefined || wallet[id].gte(amount);
  });
}

/**
 * Raises each rate to the greater of the current and the offered value.
 *
 * Idle income only ever goes **up**. Replaying an early stage, or loading a save written by
 * a build with a different reward curve, must never cut what a player already earns. That is
 * one comparison per currency and it removes a whole class of "my income went down" bug
 * report.
 */
export function raiseRates(rates: Rates, offered: Readonly<Partial<Rates>>): Rates {
  const next = { ...rates };
  for (const id of RATE_CURRENCY_IDS) {
    const rate = offered[id];
    if (rate?.gt(rates[id]) === true) {
      next[id] = rate;
    }
  }
  return next;
}

/**
 * Multiplies every rate by a duration in seconds, giving what accrues over that window.
 *
 * Returns a **complete** record rather than a partial one — every rate-bearing currency is
 * always present, even at zero. That is the honest type: this fills all four keys
 * unconditionally, and typing it as partial would make every caller handle an `undefined` that
 * cannot occur. It stays assignable to {@link CurrencyAmounts} for {@link credit}.
 */
export function accrue(rates: Rates, seconds: number): Readonly<Record<RateCurrencyId, Numeric>> {
  const earned = {} as Record<RateCurrencyId, Numeric>;
  for (const id of RATE_CURRENCY_IDS) {
    earned[id] = rates[id].mul(seconds);
  }
  return earned;
}

/** `true` when every amount in the record is zero or absent. */
export function isEmpty(amounts: CurrencyAmounts): boolean {
  return CURRENCY_IDS.every((id) => {
    const amount = amounts[id];
    return amount === undefined || amount.lte(ZERO);
  });
}

/** Encodes a wallet for persistence, one exponential-notation string per currency. */
export function serializeWallet(wallet: Wallet): Record<CurrencyId, string> {
  const encoded = {} as Record<CurrencyId, string>;
  for (const id of CURRENCY_IDS) {
    encoded[id] = serialize(wallet[id]);
  }
  return encoded;
}

/** Encodes the rate table for persistence. */
export function serializeRates(rates: Rates): Record<RateCurrencyId, string> {
  const encoded = {} as Record<RateCurrencyId, string>;
  for (const id of RATE_CURRENCY_IDS) {
    encoded[id] = serialize(rates[id]);
  }
  return encoded;
}

/** A field that could not be loaded as written, in the shape the save layer reports. */
type Note = (field: string, problem: string, recovered: string) => void;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * Decodes a wallet from an untrusted save, defaulting anything damaged to zero.
 *
 * Zero rather than a guess, for the same reason the rates below default to zero: inventing
 * a balance would hand out progress that was never made, and the player earns it back at the
 * rate they already have.
 */
export function parseWallet(raw: unknown, note: Note): Wallet {
  const record = asRecord(raw);
  const wallet = {} as Record<CurrencyId, Numeric>;
  for (const id of CURRENCY_IDS) {
    let value = parseOr(record[id], ZERO);
    if (tryParse(record[id]) === undefined) {
      note(`wallet.${id}`, `unparseable (${JSON.stringify(record[id]) ?? 'undefined'})`, '0');
    }
    if (value.lt(ZERO)) {
      note(`wallet.${id}`, `negative (${value.toString()})`, '0');
      value = ZERO;
    }
    wallet[id] = value;
  }
  return wallet;
}

/**
 * Decodes the rate table from an untrusted save.
 *
 * A damaged rate self-heals: the next stage clear raises it back to whatever that stage
 * grants, so defaulting to zero costs the player income until their next win rather than
 * permanently.
 */
export function parseRates(raw: unknown, note: Note): Rates {
  const record = asRecord(raw);
  const rates = {} as Record<RateCurrencyId, Numeric>;
  for (const id of RATE_CURRENCY_IDS) {
    let value = parseOr(record[id], ZERO);
    if (tryParse(record[id]) === undefined) {
      note(`rates.${id}`, `unparseable (${JSON.stringify(record[id]) ?? 'undefined'})`, '0');
    }
    if (value.lt(ZERO)) {
      note(`rates.${id}`, `negative (${value.toString()})`, '0');
      value = ZERO;
    }
    rates[id] = value;
  }
  return rates;
}
