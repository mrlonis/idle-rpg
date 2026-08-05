import { num, type Numeric, parseOr, serialize, tryParse, ZERO } from './numeric';

/**
 * The run's currencies, and the wallet that holds them.
 *
 * Milestone 1 had exactly one quantity and carried it as two fields on `GameState` —
 * `gold` and `goldPerSec`. Six currencies would be twelve such fields, and every one of them
 * would need its own line in `tick`, in `resume`, in the save encoder and in the repair
 * pass. A keyed record collapses all of that into one loop per operation, which is why the
 * flat fields are gone — and why milestone 12 adding a sixth cost one entry in one array.
 *
 * ## What each currency is for
 *
 * The three levelling currencies are deliberately **not** interchangeable, and their rates
 * are tuned far apart so each one bites at a different moment:
 *
 * - `gold` is the broad one, and since milestone 12 it genuinely is: levelling, gear levels and
 *   the forge all spend it. It is the fastest-accruing currency because it has the most claims on
 *   it, and its level-curve coefficient is the shallowest of the three for the same reason.
 * - `xp` only ever levels characters, so it accrues more slowly — there is nothing else
 *   competing for it and no reason to be generous with a currency with one use.
 * - `essence` is the bottleneck on purpose. It is charged only at breakthrough levels, and
 *   it trickles in stingily enough that it, not gold, is what decides how fast a character
 *   climbs late.
 * - `summons` buys gacha pulls. Alone among the rates it is **not** authored per stage: it is a
 *   flat base every run earns from the first minute, plus a permanent step for each first-time
 *   stage clear — see {@link SummonRateCurve} — on top of the first-clear lump. So progress is
 *   rewarded, and a player stuck on a stage never stops earning pulls.
 * - `spark` is one of two currencies with **no rate at all**. It exists solely as the overflow
 *   valve: copies of a character already at `Ascended★5` have nothing left to ascend, so
 *   they convert here and buy something from the shop instead of evaporating.
 * - `alloy` is the second rateless one, and it is spark's opposite number for gear: a piece the
 *   player does not want salvages into alloy, and alloy plus gold is what enhances the pieces they
 *   do. It has no rate because it is minted by drops rather than by time, and a rate would make
 *   the bag fill itself.
 *
 * ## Why gear material is a currency rather than a pile of items
 *
 * "Enhance this piece using those pieces" is the shape milestone 12 was asked for, and consuming
 * item instances directly is the obvious way to build it. It has one failure the closed form
 * avoids: a stage clear drops gear, auto-battle clears a stage a minute, and an evening of that is
 * thousands of item records in a save that the repair pass walks on every load. Bounding the bag
 * then means **throwing drops away**, which is the one outcome this project's economy rules out
 * everywhere else — a pull can never produce nothing, and neither should a fight.
 *
 * Salvaging into a quantity fixes both at once. The bag holds what the player chose to keep, the
 * overflow is worth exactly what it would have been worth as fodder, and the save stays flat.
 * `spark` is the precedent, and it is a close one: both are what a duplicate becomes when there is
 * nothing left to do with the object itself.
 */

/** Every currency the run can hold. */
export const CURRENCY_IDS = ['gold', 'xp', 'essence', 'summons', 'spark', 'alloy'] as const;

export type CurrencyId = (typeof CURRENCY_IDS)[number];

/**
 * The currencies that accrue at a per-second rate.
 *
 * A subset rather than the whole list, because two currencies genuinely have no rate: `spark` is
 * minted by duplicate pulls and `alloy` by salvaged gear, and nothing else mints either. Keeping
 * them out of `Rates` at the type level means the offline solver cannot silently start paying one
 * out, which is the failure this split exists to prevent.
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
  return { gold: ZERO, xp: ZERO, essence: ZERO, summons: ZERO, spark: ZERO, alloy: ZERO };
}

/**
 * All rates at zero.
 *
 * A new run earns **no gold, xp or essence** while idle, which is what makes the first battle
 * the only thing worth doing. Clearing a stage is what switches each of those on.
 *
 * `summons` is the exception and it is deliberately still zero here: its base is content
 * (`SUMMON_RATE` in `data/`), and `core/` cannot see content. `reconcileClearedStages` runs on
 * every load — including the first, for a run that has just been created — and is where the base
 * is established. Nothing between `newGame` and that repair pays a crystal, because nothing
 * between them advances the clock.
 */
export function zeroRates(): Rates {
  return { gold: ZERO, xp: ZERO, essence: ZERO, summons: ZERO };
}

/** Seconds in an hour. The crystal rate is authored per hour and stored per second. */
const SECONDS_PER_HOUR = 3600;

/**
 * How summon crystals accrue: a flat base, plus a step for every stage ever cleared.
 *
 * The other three rates are authored per stage and applied with {@link raiseRates}. Crystals are
 * a **formula over `clearedStages`** instead, for two reasons:
 *
 * - **A rate should compound only if what it buys compounds.** Gold, xp and essence buy levels,
 *   and level costs compound, so those three belong on an exponential. A pull costs a flat
 *   `PULL_COST` and an ascension a flat number of copies, so a compounding crystal rate outruns
 *   its own prices exponentially — which is how pulls become effectively unlimited a chapter or
 *   two in, and how ascension quietly stops being a constraint on anything.
 * - **It survives content that has not been authored yet.** A per-stage table is a number
 *   somebody types per stage; a linear step is one number that means the same thing at stage 24
 *   and at stage 2,400.
 *
 * Authored in crystals **per hour** because that is the unit the number is legible in — a base
 * of 100 against a `PULL_COST` of 100 reads as "a pull an hour", where 0.0278 per second reads
 * as nothing at all.
 */
export interface SummonRateCurve {
  /** Crystals per hour before anything has been cleared. Every run earns this from the start. */
  readonly basePerHour: number;
  /** Crystals per hour added permanently by each stage's **first** clear. */
  readonly perClearPerHour: number;
}

/**
 * The crystal rate a run with `clearedStages` clears has earned, per second.
 *
 * Total rather than incremental: the whole point of deriving it is that the answer depends on
 * nothing but the clear count, so a save with a damaged or absent rate heals to exactly the
 * value it should have had rather than to whatever it can reconstruct.
 *
 * Clamps its inputs rather than trusting them. `clearedStages` comes off a save that may have
 * been damaged, and a negative or non-finite count must read as "nothing cleared" rather than
 * producing a negative rate that then has to be repaired somewhere else.
 */
export function summonRatePerSecond(curve: SummonRateCurve, clearedStages: number): Numeric {
  const cleared = Number.isFinite(clearedStages) ? Math.max(Math.floor(clearedStages), 0) : 0;
  const base = Number.isFinite(curve.basePerHour) ? Math.max(curve.basePerHour, 0) : 0;
  const step = Number.isFinite(curve.perClearPerHour) ? Math.max(curve.perClearPerHour, 0) : 0;
  return num(base + step * cleared).div(SECONDS_PER_HOUR);
}

/**
 * Raises the crystal rate to what `clearedStages` has earned.
 *
 * Goes through {@link raiseRates} rather than assigning, so the "income never falls" guarantee
 * holds here too: a save written by a build with a more generous base keeps that base instead of
 * being cut down to this one. It inherits the identity behaviour as well — an already-correct
 * run comes back as the same object, which is what lets this run on every load and after every
 * battle without republishing a snapshot that did not change.
 */
export function withSummonRate(rates: Rates, curve: SummonRateCurve, clearedStages: number): Rates {
  return raiseRates(rates, { summons: summonRatePerSecond(curve, clearedStages) });
}

/**
 * Adds a payout to a wallet.
 *
 * **Built key by key rather than spread-and-patch, and that is a performance decision.** This is
 * on the only hot path `core/` has — `tick` calls it ten times a second, and the offline
 * invariant in `offline.spec.ts` replays hundreds of thousands of ticks to prove the closed form
 * agrees with it. Object spread does not survive the dev and test pipeline intact: it is
 * downleveled to a helper that calls `Object.defineProperty` once per property, which measures
 * around 25× the cost of a plain store. Writing each key into a fresh object avoids the helper
 * entirely, and took `tick` from 1.6s to 0.3s over 360,000 iterations.
 *
 * The shipped browser bundle keeps native spread, so this is not a claim about the app being
 * slow. It is a claim about not paying twenty-five times over in the loop that has to run
 * hundreds of thousands of times for a test to say something true.
 *
 * `debit` below is deliberately left as it was: it runs once per purchase, so the same rewrite
 * would buy nothing and cost the symmetry.
 */
export function credit(wallet: Wallet, amounts: CurrencyAmounts): Wallet {
  const next = {} as Record<CurrencyId, Numeric>;
  for (const id of CURRENCY_IDS) {
    const amount = amounts[id];
    next[id] = amount === undefined ? wallet[id] : wallet[id].add(amount);
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
 *
 * **Returns the original object when nothing rose.** Callers use that identity to tell "this
 * changed the run" from "this was a no-op" — `reconcileClearedStages` leans on it to leave a
 * healthy save's snapshot alone rather than republishing it and re-rendering every screen on
 * every load.
 */
export function raiseRates(rates: Rates, offered: Readonly<Partial<Rates>>): Rates {
  let next: Record<RateCurrencyId, Numeric> | undefined;
  for (const id of RATE_CURRENCY_IDS) {
    const rate = offered[id];
    if (rate?.gt(rates[id]) === true) {
      next ??= { ...rates };
      next[id] = rate;
    }
  }
  return next ?? rates;
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
