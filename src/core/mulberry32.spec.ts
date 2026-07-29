// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from './mulberry32';

/**
 * Direct tests for the PRNG primitive.
 *
 * `rng.spec.ts` exercises `mulberry32` heavily, but only as its own reference: it compares
 * `mulberry32` called N times against `resumeStream`, which calls `mulberry32` internally.
 * If the primitive itself were wrong, both sides would be wrong identically and every one of
 * those comparisons would still pass. Substituting `() => 0.5` for the whole generator
 * passes 166 of 167 tests in the rest of the suite.
 *
 * So these are the tests that actually constrain the generator's behaviour rather than its
 * self-consistency.
 */
describe('mulberry32 known-answer vectors', () => {
  // The load-bearing test in this file. A seed is a save-game promise: it has to reproduce
  // the same run on every future build. Any edit that changes the algorithm — a different
  // constant, a dropped xor, a "harmless" refactor — silently rerolls every existing
  // player's gacha history and invalidates every balance number measured against a seed.
  // Nothing else in the suite would notice. If these vectors change, that is a save-breaking
  // change and needs a deliberate decision, not a passing build.
  it.each([
    {
      seed: 0,
      expected: [
        0.26642920868471265, 0.0003297457005828619, 0.2232720274478197, 0.1462021479383111,
        0.46732782293111086, 0.5450490827206522, 0.6152513844426721, 0.6489853798411787,
      ],
    },
    {
      seed: 1,
      expected: [
        0.6270739405881613, 0.002735721180215478, 0.5274470399599522, 0.9810509674716741,
        0.9683778982143849, 0.281103502959013, 0.6128388606011868, 0.7207431411370635,
      ],
    },
    {
      seed: 123456789,
      expected: [
        0.2577907438389957, 0.9707721115555614, 0.7853280142880976, 0.20616457983851433,
        0.30307188746519387, 0.7470660470426083, 0.7787336520850658, 0.2845096290111542,
      ],
    },
    {
      seed: 0xdeadbeef,
      expected: [
        0.9413696140982211, 0.26719574979506433, 0.772033357527107, 0.35816076025366783,
        0.47554167779162526, 0.8382313968613744, 0.11277393717318773, 0.3172087538987398,
      ],
    },
  ])('seed $seed produces its recorded sequence', ({ seed, expected }) => {
    const draw = mulberry32(seed);

    expect(expected.map(() => draw())).toEqual(expected);
  });
});

describe('mulberry32 determinism', () => {
  it('gives two generators from the same seed the same sequence', () => {
    const a = mulberry32(99);
    const b = mulberry32(99);

    expect(Array.from({ length: 20 }, () => a())).toEqual(Array.from({ length: 20 }, () => b()));
  });

  it('keeps concurrent generators independent', () => {
    // Interleaving draws must not let one stream perturb the other; combat sub-streams run
    // alongside the main pull stream.
    const reference = mulberry32(7);
    const expected = Array.from({ length: 5 }, () => reference());

    const a = mulberry32(7);
    const b = mulberry32(7);
    const interleaved: number[] = [];
    for (let i = 0; i < 5; i++) {
      interleaved.push(a());
      b();
    }

    expect(interleaved).toEqual(expected);
  });

  it('gives different seeds different sequences', () => {
    const seeds = [0, 1, 2, 42, 123456789, 0xdeadbeef];
    const firsts = seeds.map((seed) => mulberry32(seed)());

    expect(new Set(firsts).size).toBe(seeds.length);
  });
});

describe('mulberry32 output range', () => {
  it('stays within [0, 1)', () => {
    const draw = mulberry32(2024);

    for (let i = 0; i < 100_000; i++) {
      const value = draw();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('returns finite numbers', () => {
    const draw = mulberry32(5);

    for (let i = 0; i < 1000; i++) {
      expect(Number.isFinite(draw())).toBe(true);
    }
  });
});

describe('mulberry32 distribution', () => {
  // These are what catch a generator that is deterministic and in-range but degenerate —
  // a constant, a short cycle, a stuck bit. Balance sweeps and gacha pity both depend on
  // the stream actually being uniform.
  const SAMPLES = 200_000;

  it('has a mean close to 0.5', () => {
    const draw = mulberry32(42);
    let sum = 0;
    for (let i = 0; i < SAMPLES; i++) {
      sum += draw();
    }

    expect(sum / SAMPLES).toBeCloseTo(0.5, 2);
  });

  it('fills all ten deciles roughly evenly', () => {
    const draw = mulberry32(42);
    const buckets = new Array<number>(10).fill(0);
    for (let i = 0; i < SAMPLES; i++) {
      buckets[Math.floor(draw() * 10)]++;
    }

    for (const count of buckets) {
      expect(count / SAMPLES).toBeGreaterThan(0.09);
      expect(count / SAMPLES).toBeLessThan(0.11);
    }
  });

  it('does not repeat a value within a short window', () => {
    const draw = mulberry32(123);
    const seen = new Set<number>();
    for (let i = 0; i < 50_000; i++) {
      seen.add(draw());
    }

    // A short cycle or stuck state would collapse this count dramatically.
    expect(seen.size).toBeGreaterThan(49_000);
  });
});

describe('mulberry32 seed normalisation', () => {
  // The implementation masks its state to a uint32 on construction and on every step. These
  // pin that contract: anything that reduces to the same uint32 must produce the same run.
  it.each([
    { label: 'negative seed', seed: -1, equivalent: 0xffffffff },
    { label: 'seed at 2^32', seed: 0x100000000, equivalent: 0 },
    { label: 'seed past 2^32', seed: 0x100000005, equivalent: 5 },
  ])('treats a $label as its uint32 equivalent', ({ seed, equivalent }) => {
    const a = mulberry32(seed);
    const b = mulberry32(equivalent);

    expect(Array.from({ length: 5 }, () => a())).toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('accepts a seed of zero', () => {
    const draw = mulberry32(0);

    expect(Number.isFinite(draw())).toBe(true);
  });

  it('stays exact past 2^53 worth of accumulated state', () => {
    // The widely copied version accumulates state as an unbounded float and starts drifting
    // at call 4,917,759 (2^53 / 0x6d2b79f5). Masking removes that ceiling; this checks the
    // generator is still producing valid, varied output well beyond it.
    const draw = mulberry32(1);
    const tail = new Set<number>();
    for (let i = 0; i < 5_000_000; i++) {
      const value = draw();
      if (i >= 4_999_990) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
        tail.add(value);
      }
    }

    expect(tail.size).toBe(10);
  });
});
