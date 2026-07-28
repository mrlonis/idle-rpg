import { describe, expect, it } from 'vitest';
import { mulberry32 } from './mulberry32';
import { deriveSeed, derivedStream, resumeStream } from './rng';

const SEED = 123456789;

describe('resumeStream', () => {
  it('reproduces the same sequence from the same state', () => {
    const first = resumeStream({ seed: SEED, calls: 0 });
    const second = resumeStream({ seed: SEED, calls: 0 });

    const a = [first.next(), first.next(), first.next()];
    const b = [second.next(), second.next(), second.next()];

    expect(a).toEqual(b);
  });

  it('tracks draws in the committed call count', () => {
    const stream = resumeStream({ seed: SEED, calls: 10 });

    stream.next();
    stream.next();

    expect(stream.commit()).toEqual({ seed: SEED, calls: 12 });
  });

  it('commits an unchanged state when nothing was drawn', () => {
    const stream = resumeStream({ seed: SEED, calls: 7 });

    expect(stream.commit()).toEqual({ seed: SEED, calls: 7 });
  });

  it.each([0, 1, 5, 100, 65_535, 1_000_000])(
    'resuming at %i calls continues the sequence exactly',
    (calls) => {
      // The O(1) jump-ahead is the whole reason this abstraction exists: without it,
      // loading a save would replay every historical draw on launch.
      const sequential = mulberry32(SEED);
      for (let i = 0; i < calls; i++) {
        sequential();
      }
      const expected = [sequential(), sequential(), sequential()];

      const resumed = resumeStream({ seed: SEED, calls });
      const actual = [resumed.next(), resumed.next(), resumed.next()];

      expect(actual).toEqual(expected);
    },
  );

  it('stays exact past the call count where unmasked float state would drift', () => {
    // `2^53 / 0x6d2b79f5` is 4,917,758. A mulberry32 that accumulates its state as an
    // unbounded float64 starts emitting a different sequence just past there, which would
    // silently desync jump-ahead resume from stepwise draws. Both sides are masked to
    // uint32, so they agree at any count.
    const calls = 4_917_800;
    const sequential = mulberry32(SEED);
    for (let i = 0; i < calls; i++) {
      sequential();
    }

    expect(resumeStream({ seed: SEED, calls }).next()).toBe(sequential());
  });

  it('produces floats in [0, 1)', () => {
    const stream = resumeStream({ seed: SEED, calls: 0 });

    for (let i = 0; i < 1000; i++) {
      const value = stream.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces integers in [0, maxExclusive)', () => {
    const stream = resumeStream({ seed: SEED, calls: 0 });

    for (let i = 0; i < 1000; i++) {
      const value = stream.nextInt(6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
    }
  });
});

describe('deriveSeed', () => {
  it('is deterministic', () => {
    expect(deriveSeed(SEED, 'battle:12:3')).toBe(deriveSeed(SEED, 'battle:12:3'));
  });

  it('separates different labels', () => {
    expect(deriveSeed(SEED, 'battle:12:3')).not.toBe(deriveSeed(SEED, 'battle:12:4'));
    expect(deriveSeed(SEED, 'battle:12:3')).not.toBe(deriveSeed(SEED, 'battle:13:3'));
  });

  it('separates different seeds', () => {
    expect(deriveSeed(SEED, 'battle:1:1')).not.toBe(deriveSeed(SEED + 1, 'battle:1:1'));
  });

  it('returns a uint32', () => {
    for (const label of ['a', 'battle:99:1', '', 'a much longer label than usual']) {
      const derived = deriveSeed(SEED, label);
      expect(Number.isInteger(derived)).toBe(true);
      expect(derived).toBeGreaterThanOrEqual(0);
      expect(derived).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it('spreads adjacent labels across the output space', () => {
    // Sequential battle counts must not produce correlated seeds, or consecutive battles
    // would share a bias.
    const seeds = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      seeds.add(deriveSeed(SEED, `battle:1:${i}`));
    }

    expect(seeds.size).toBe(5000);
  });
});

describe('derivedStream', () => {
  it('replays a battle identically without touching the main call counter', () => {
    const main = resumeStream({ seed: SEED, calls: 40 });

    const first = derivedStream(SEED, 'battle:7:2');
    const replay = derivedStream(SEED, 'battle:7:2');

    expect([first(), first(), first()]).toEqual([replay(), replay(), replay()]);
    // Combat drew from its own stream, so the pull sequence is untouched.
    expect(main.commit()).toEqual({ seed: SEED, calls: 40 });
  });

  it('gives different battles independent sequences', () => {
    const a = derivedStream(SEED, 'battle:7:2');
    const b = derivedStream(SEED, 'battle:7:3');

    expect(a()).not.toBe(b());
  });
});
