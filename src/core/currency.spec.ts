// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  credit,
  CURRENCY_IDS,
  emblemRatePerSecond,
  type EmblemRateCurve,
  emptyWallet,
  type Wallet,
  withEmblemRate,
  zeroRates,
} from './currency';
import { num, type Numeric } from './numeric';

/** A wallet with a different amount in every currency, so a crossed pair cannot look correct. */
function wallet(): Wallet {
  return {
    gold: num(100),
    xp: num(200),
    essence: num(300),
    summons: num(400),
    spark: num(500),
    alloy: num(600),
    emblem: num(700),
  };
}

describe('credit', () => {
  // `credit` is on the only hot path `core/` has, so it builds its result key by key instead of
  // spreading the wallet and patching it — see its doc comment. These pin the contract that
  // rewrite has to keep: every key present, absent amounts left exactly alone, nothing mutated.

  it('adds each amount to the currency it names', () => {
    const next = credit(wallet(), { gold: num(5), summons: num(50) });

    expect(next.gold.eq(105)).toBe(true);
    expect(next.summons.eq(450)).toBe(true);
  });

  it('leaves a currency the payout does not mention exactly as it was', () => {
    const held = wallet();

    const next = credit(held, { gold: num(5) });

    expect(next.xp.eq(200)).toBe(true);
    expect(next.essence.eq(300)).toBe(true);
    expect(next.spark.eq(500)).toBe(true);
    // The same value, not a recomputed one: an untouched balance is carried across by reference.
    expect(next.xp).toBe(held.xp);
  });

  it('returns a complete wallet, so no caller has to handle a missing currency', () => {
    const next = credit(emptyWallet(), {});

    for (const id of CURRENCY_IDS) {
      expect(next[id], id).toBeDefined();
      expect(next[id].eq(0), id).toBe(true);
    }
    expect(Object.keys(next).sort()).toEqual([...CURRENCY_IDS].sort());
  });

  it('does not mutate the wallet it is given', () => {
    const held = wallet();

    credit(held, { gold: num(5) });

    expect(held.gold.eq(100)).toBe(true);
  });

  it('returns a new object even when it pays nothing', () => {
    // `tick` publishes its result as the UI's snapshot, which is compared by reference.
    const held = wallet();

    expect(credit(held, {})).not.toBe(held);
  });

  it('adds a zero rather than treating it as absent', () => {
    // Zero and absent are the same arithmetic and different intent; neither may corrupt a balance.
    const next = credit(wallet(), { gold: num(0) });

    expect(next.gold.eq(100)).toBe(true);
  });
});

/** How far a computed rate sits from the expected one, as a fraction of the expected one. */
function relativeError(actual: Numeric, expected: number): number {
  return Math.abs(actual.toNumber() - expected) / expected;
}

describe('emblemRatePerSecond', () => {
  const CURVE: EmblemRateCurve = { perChapterPerHour: 3 };

  it('pays nothing at all until a whole chapter is finished', () => {
    // ⚠️ There is no separate "emblems are unlocked" flag anywhere in the save, and this is why:
    // the unlock *is* the rate being zero below one chapter. A base here would be the same
    // mistake as a stored flag — a second place the unlock could be true.
    expect(emblemRatePerSecond(CURVE, 0).eq(0)).toBe(true);
  });

  it('steps once per whole chapter, linearly', () => {
    // Relative error rather than exact equality, which is the project's rule for a derived
    // quantity and not a hedge: the rate is a division, and `Decimal.div` and float64 `/`
    // disagree in the last bit — so `.eq(3 / 3600)` fails on a claim the test never meant to
    // make. `toBeCloseTo` is the wrong tool for the same reason it always is here; it is absolute
    // decimal places, and these values are at the 1e-4 scale where that measures nothing.
    const perHour = CURVE.perChapterPerHour;

    expect(relativeError(emblemRatePerSecond(CURVE, 1), perHour / 3600)).toBeLessThan(1e-12);
    expect(relativeError(emblemRatePerSecond(CURVE, 4), (perHour * 4) / 3600)).toBeLessThan(1e-12);
  });

  it('reads a damaged count as nothing cleared rather than as negative income', () => {
    expect(emblemRatePerSecond(CURVE, -5).eq(0)).toBe(true);
    expect(emblemRatePerSecond(CURVE, Number.NaN).eq(0)).toBe(true);
  });

  it('ignores the fractional part of a count rather than paying for part of a chapter', () => {
    // Half a chapter is not half a step. The rate moves on a boundary or it does not move.
    expect(emblemRatePerSecond(CURVE, 2.9).eq(emblemRatePerSecond(CURVE, 2))).toBe(true);
  });
});

describe('withEmblemRate', () => {
  const CURVE: EmblemRateCurve = { perChapterPerHour: 1 };

  it('never cuts a rate a run already earns', () => {
    // The same guarantee every rate has: a save written by a build with a more generous curve
    // keeps what it earned rather than being trimmed to this one.
    const generous = { ...zeroRates(), emblem: num(99) };

    expect(withEmblemRate(generous, CURVE, 2).emblem.eq(99)).toBe(true);
  });

  it('returns the same object when nothing rose', () => {
    // Callers use this identity to tell "this changed the run" from "this was a no-op", which is
    // what lets the load-time repair leave a healthy save's snapshot alone instead of
    // republishing it and re-rendering every screen.
    const settled = withEmblemRate(zeroRates(), CURVE, 3);

    expect(withEmblemRate(settled, CURVE, 3)).toBe(settled);
  });

  it('leaves every other rate alone', () => {
    const raised = withEmblemRate({ ...zeroRates(), gold: num(40) }, CURVE, 1);

    expect(raised.gold.eq(40)).toBe(true);
    expect(raised.summons.eq(0)).toBe(true);
  });
});
