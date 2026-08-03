// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { zeroRates } from './currency';
import { num } from './numeric';
import { accrueDiscrete, MIN_PLAUSIBLE_TICK_MS, resume } from './offline';
import { newGame, type GameState } from './state';
import { tick } from './tick';

const SEED = 0xc0ffee;
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

/** Relative error, which stays meaningful once values grow past what decimal places can express. */
function relativeError(actual: string, expected: string): number {
  const a = num(actual);
  const e = num(expected);
  if (e.eq(0)) {
    return a.eq(0) ? 0 : Infinity;
  }
  return Math.abs(a.sub(e).div(e).toNumber());
}

describe('resume', () => {
  it('pays out rate * elapsed', () => {
    const state = stateWithRate('250');

    const { state: resumed, report } = resume(state, T0 + 60_000);

    expect(report.elapsedMs).toBe(60_000);
    expect(report.earned.gold.toString()).toBe('15000');
    expect(resumed.wallet.gold.toString()).toBe('15000');
  });

  it('advances lastTickAt to the resume time', () => {
    const state = stateWithRate('1');

    const { state: resumed } = resume(state, T0 + 5_000);

    expect(resumed.lastTickAt).toBe(T0 + 5_000);
  });

  it('pays the whole window however long it is, because there is no cap', () => {
    // The genre caps offline income to force a daily session. This game does not: come back a
    // year later and it pays a year. Deleting this test is deleting a product decision.
    const state = stateWithRate('1');
    const year = 365 * 24 * 60 * 60 * 1000;

    const { report } = resume(state, T0 + year);

    expect(report.rawElapsedMs).toBe(year);
    expect(report.elapsedMs).toBe(year);
    expect(report.earned.gold.toString()).toBe(String(year / 1000));
  });

  it('pays nothing when lastTickAt predates the project, which is damage rather than absence', () => {
    // A timestamp of zero is finite and yields a positive delta, so it passes both other guards.
    // With no cap overhead there is nothing else to stop it paying out decades of income and
    // silently wrecking a run's pacing.
    const state = { ...withGold(stateWithRate('100'), '500'), lastTickAt: 0 };

    const { state: resumed, report } = resume(state, T0);

    expect(report.elapsedMs).toBe(0);
    expect(report.earned.gold.toString()).toBe('0');
    expect(resumed.wallet.gold.toString()).toBe('500');
  });

  it('treats the plausibility floor as inclusive, so a save written at the boundary still pays', () => {
    const state = { ...stateWithRate('2'), lastTickAt: MIN_PLAUSIBLE_TICK_MS };

    const { report } = resume(state, MIN_PLAUSIBLE_TICK_MS + 10_000);

    expect(report.elapsedMs).toBe(10_000);
    expect(report.earned.gold.toString()).toBe('20');
  });

  it('pays nothing when the device clock moved backwards, without going negative', () => {
    const state = withGold(stateWithRate('100'), '500');

    const { state: resumed, report } = resume(state, T0 - 60_000);

    expect(report.elapsedMs).toBe(0);
    expect(report.earned.gold.toString()).toBe('0');
    expect(resumed.wallet.gold.toString()).toBe('500');
  });

  it('treats a damaged lastTickAt as a zero-length window', () => {
    const state = { ...stateWithRate('100'), lastTickAt: Number.NaN };

    const { report } = resume(state, T0);

    expect(report.elapsedMs).toBe(0);
    expect(report.earned.gold.toString()).toBe('0');
  });

  it('does not mutate the state it is given', () => {
    const state = stateWithRate('10');

    resume(state, T0 + 10_000);

    expect(state.wallet.gold.toString()).toBe('0');
    expect(state.lastTickAt).toBe(T0);
  });
});

describe('closed-form resume vs stepwise accrual', () => {
  // The highest-value invariant in the project: the offline shortcut and the live sim loop
  // must agree. If these ever diverge, players are silently paid a different rate for time
  // spent away than for time spent watching, and every balance number derived from one is
  // wrong for the other.
  it.each([
    { label: '1 minute at 10Hz', durationMs: 60_000, dtMs: 100, rate: '250' },
    { label: '1 hour at 10Hz', durationMs: 60 * 60 * 1000, dtMs: 100, rate: '1e6' },
    { label: '10 hours at 10Hz', durationMs: 10 * 60 * 60 * 1000, dtMs: 100, rate: '1' },
    { label: '1 hour at 6Hz', durationMs: 60 * 60 * 1000, dtMs: 160, rate: '1e18' },
  ])('matches within 1e-12 relative error: $label', ({ durationMs, dtMs, rate }) => {
    const start = stateWithRate(rate);

    const { report } = resume(start, T0 + durationMs);

    let stepwise = start;
    for (let elapsed = 0; elapsed < durationMs; elapsed += dtMs) {
      stepwise = tick(stepwise, Math.min(dtMs, durationMs - elapsed));
    }

    expect(
      relativeError(report.earned.gold.toString(), stepwise.wallet.gold.toString()),
    ).toBeLessThan(1e-12);
  });

  it('agrees at magnitudes far past float64 exact-integer range', () => {
    // 1e30 is roughly where a 1.15x-per-stage curve lands by stage 500, and is 14 orders of
    // magnitude past 2^53. Plain `number` cannot represent consecutive integers here.
    const start = stateWithRate('1e30');
    const durationMs = 60 * 60 * 1000;

    const { report } = resume(start, T0 + durationMs);

    let stepwise = start;
    for (let elapsed = 0; elapsed < durationMs; elapsed += 100) {
      stepwise = tick(stepwise, 100);
    }

    expect(
      relativeError(report.earned.gold.toString(), stepwise.wallet.gold.toString()),
    ).toBeLessThan(1e-12);
    expect(report.earned.gold.toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });
});

describe('accrueDiscrete', () => {
  it('awards whole units and carries the remainder', () => {
    const result = accrueDiscrete(0, 3.7);

    expect(result.whole).toBe(3);
    expect(result.carry).toBeCloseTo(0.7, 10);
  });

  it('completes a whole unit from carried fractions', () => {
    expect(accrueDiscrete(0.6, 0.5).whole).toBe(1);
  });

  it('accrues across many short sessions instead of rounding each one away', () => {
    // Without the carry, ten sessions of 0.9 expected drops would floor to zero every time
    // and the player would be paid nothing for nine drops' worth of play.
    let carry = 0;
    let total = 0;
    for (let session = 0; session < 10; session++) {
      const result = accrueDiscrete(carry, 0.9);
      total += result.whole;
      carry = result.carry;
    }

    // 10 x 0.9 = 9 in exact arithmetic. Binary floating point accumulates just under that,
    // so the tenth unit is still sitting in `carry` rather than lost — it is awarded on the
    // next session. The contract is that nothing evaporates, not that boundaries are exact.
    expect(total + carry).toBeCloseTo(9, 9);
    expect(total).toBeGreaterThanOrEqual(8);
    expect(total).toBeLessThanOrEqual(9);
  });

  it('never awards more than was earned', () => {
    let carry = 0;
    let total = 0;
    for (let session = 1; session <= 200; session++) {
      const result = accrueDiscrete(carry, 0.37);
      total += result.whole;
      carry = result.carry;
      expect(total).toBeLessThanOrEqual(session * 0.37 + 1e-9);
    }
  });

  it('keeps the carry in [0, 1)', () => {
    let carry = 0;
    for (let session = 0; session < 100; session++) {
      carry = accrueDiscrete(carry, 1.618).carry;
      expect(carry).toBeGreaterThanOrEqual(0);
      expect(carry).toBeLessThan(1);
    }
  });

  it('never rolls RNG: the same inputs always give the same payout', () => {
    const first = accrueDiscrete(0.25, 12.5);
    const second = accrueDiscrete(0.25, 12.5);

    expect(first).toEqual(second);
  });

  it.each([
    { label: 'negative carry', carry: -5, expected: 2, whole: 2 },
    { label: 'NaN carry', carry: Number.NaN, expected: 2, whole: 2 },
    { label: 'negative expected', carry: 0, expected: -3, whole: 0 },
    { label: 'infinite expected', carry: 0, expected: Infinity, whole: 0 },
  ])('clamps damaged input: $label', ({ carry, expected, whole }) => {
    expect(accrueDiscrete(carry, expected).whole).toBe(whole);
  });
});
