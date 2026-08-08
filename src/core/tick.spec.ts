// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { zeroRates } from './currency';
import { num } from './numeric';
import { SAVE_VERSION } from './save/version';
import { newGame, stampSaveTime, type GameState } from './state';
import { tick } from './tick';

const SEED = 42;
const T0 = 1_700_000_000_000;

function stateWithRate(goldPerSec: string): GameState {
  return {
    ...newGame({ seed: SEED, nowMs: T0 }),
    rates: { ...zeroRates(), gold: num(goldPerSec) },
  };
}

/** Sets a starting gold balance without disturbing the rest of the wallet. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

describe('tick', () => {
  it('accrues gold at goldPerSec over the elapsed duration', () => {
    const state = stateWithRate('10');

    expect(tick(state, 1000).wallet.gold.toString()).toBe('10');
    expect(tick(state, 100).wallet.gold.toString()).toBe('1');
  });

  it('accumulates across successive ticks', () => {
    let state = stateWithRate('10');

    for (let i = 0; i < 10; i++) {
      state = tick(state, 100);
    }

    expect(state.wallet.gold.toString()).toBe('10');
  });

  it('does not mutate the state it is given', () => {
    const state = stateWithRate('10');

    tick(state, 1000);

    expect(state.wallet.gold.toString()).toBe('0');
  });

  it('returns a new object so the UI can compare snapshots by reference', () => {
    const state = stateWithRate('10');

    expect(tick(state, 100)).not.toBe(state);
  });

  it.each([0, -1, -1000, Number.NaN, Infinity, -Infinity])(
    'returns the state untouched for a dtMs of %p',
    (dtMs) => {
      const state = stateWithRate('10');

      // A timer can fire with a zero or negative delta when the device clock is adjusted.
      // That must be a no-op, not a corrupted run.
      expect(tick(state, dtMs)).toBe(state);
    },
  );

  it('accrues correctly at magnitudes past float64 safe-integer range', () => {
    const state = withGold(stateWithRate('1e18'), '1e30');

    const result = tick(state, 1000);

    // 1e30 + 1e18: the increment is 1e-12 of the total and still lands.
    expect(result.wallet.gold.eq(num('1.000000000001e+30'))).toBe(true);
  });

  it('leaves the clock alone: core never advances lastTickAt', () => {
    const state = stateWithRate('10');

    expect(tick(state, 5000).lastTickAt).toBe(T0);
  });

  it('carries every field but the wallet through untouched', () => {
    // `tick` writes its result out field by field rather than spreading, for the reason given in
    // its doc comment. TypeScript catches a field that is *missing* from that literal; nothing but
    // this catches one that is present and wrong — `pity: state.pullCount` type-checks perfectly.
    //
    // Distinct values per field, so a crossed pair cannot coincidentally agree.
    const state: GameState = {
      ...stateWithRate('10'),
      lastTickAt: T0 + 11,
      stage: 12,
      clearedStages: 13,
      battleCount: 14,
      pity: 15,
      pullCount: 16,
      rng: { seed: 17, calls: 18 },
      formations: { campaign: { front: ['bran'], back: ['rin'] } },
    };

    const next = tick(state, 1000);

    expect(next.wallet.gold.toString()).toBe('10');
    // Everything else, compared against the original as a whole: a new field added to `GameState`
    // and mishandled here fails this without anyone having to remember to extend the list.
    expect({ ...next, wallet: state.wallet }).toEqual(state);
  });
});

describe('stampSaveTime', () => {
  it('records the supplied wall-clock time without touching the simulation', () => {
    const state = withGold(stateWithRate('10'), '123');

    const stamped = stampSaveTime(state, T0 + 9000);

    expect(stamped.lastTickAt).toBe(T0 + 9000);
    expect(stamped.wallet.gold.toString()).toBe('123');
  });

  it('does not mutate the state it is given', () => {
    const state = stateWithRate('10');

    stampSaveTime(state, T0 + 1);

    expect(state.lastTickAt).toBe(T0);
  });
});

describe('newGame', () => {
  it('starts at zero gold and stamps the supplied time', () => {
    const state = newGame({ seed: SEED, nowMs: T0 });

    expect(state.wallet.gold.toString()).toBe('0');
    expect(state.lastTickAt).toBe(T0);
    expect(state.rng).toEqual({ seed: SEED, calls: 0 });
  });

  it('normalises the seed to a uint32', () => {
    expect(newGame({ seed: -1, nowMs: T0 }).rng.seed).toBe(0xffffffff);
  });

  it('carries the current save version so migrations always have a floor', () => {
    // Against `SAVE_VERSION` rather than a literal floor: the chain has been re-based to a v0
    // baseline twice while the game was still pre-release, so any literal written here has twice
    // stopped being true without anything about the rule changing.
    expect(newGame({ seed: SEED, nowMs: T0 }).version).toBe(SAVE_VERSION);
  });
});
