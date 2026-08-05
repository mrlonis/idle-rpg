// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { credit, CURRENCY_IDS, emptyWallet, type Wallet } from './currency';
import { num } from './numeric';

/** A wallet with a different amount in every currency, so a crossed pair cannot look correct. */
function wallet(): Wallet {
  return {
    gold: num(100),
    xp: num(200),
    essence: num(300),
    summons: num(400),
    spark: num(500),
    alloy: num(600),
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
