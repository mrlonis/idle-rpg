// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type EmblemDropData, emblemDropChance, rollEmblems } from './emblems';
import { derivedStream } from './rng';

/**
 * Chances far apart from one another, and none of them the shipped values.
 *
 * Spread wide so a swapped pair fails loudly: at 0.02/0.10/0.25 a mini-boss read as an ordinary
 * stage is a difference of eight percentage points, which a thousand-sample measurement can miss.
 * At these it cannot.
 */
const DROPS: EmblemDropData = {
  normal: 0.1,
  miniBoss: 0.5,
  boss: 0.9,
  unlockChapters: 1,
};

/** Fraction of `samples` fights that dropped, at a given kind and chapter count. */
function dropRate(
  drops: EmblemDropData,
  kind: Parameters<typeof rollEmblems>[1],
  chapters: number,
  samples = 20_000,
): number {
  let dropped = 0;
  for (let index = 0; index < samples; index++) {
    dropped += rollEmblems(drops, kind, chapters, derivedStream(0xe4b1e, `fight:${index}`));
  }
  return dropped / samples;
}

describe('emblemDropChance', () => {
  it('pays a boss more than a mini-boss and a mini-boss more than an ordinary stage', () => {
    // The spread is the whole incentive this table exists to create. With a flat chance there is
    // no reason to fight anything but the fastest stage on the ladder.
    expect(emblemDropChance(DROPS, 'boss')).toBeGreaterThan(emblemDropChance(DROPS, 'mini-boss'));
    expect(emblemDropChance(DROPS, 'mini-boss')).toBeGreaterThan(emblemDropChance(DROPS, 'normal'));
  });

  it('clamps a damaged chance into [0, 1] rather than trusting content', () => {
    const damaged: EmblemDropData = {
      normal: -1,
      miniBoss: Number.NaN,
      boss: 4,
      unlockChapters: 1,
    };

    expect(emblemDropChance(damaged, 'normal')).toBe(0);
    expect(emblemDropChance(damaged, 'mini-boss')).toBe(0);
    expect(emblemDropChance(damaged, 'boss')).toBe(1);
  });
});

describe('rollEmblems', () => {
  it('drops at about the authored rate for each kind of stage', () => {
    expect(dropRate(DROPS, 'normal', 1)).toBeCloseTo(0.1, 1);
    expect(dropRate(DROPS, 'mini-boss', 1)).toBeCloseTo(0.5, 1);
    expect(dropRate(DROPS, 'boss', 1)).toBeCloseTo(0.9, 1);
  });

  it('drops nothing at all before the chapter gate is met', () => {
    // Not "less often" — nothing. A boss at 0.9 is the sharpest case: if the gate were applied as
    // a discount rather than a gate, this is the reading that would still be well above zero.
    expect(dropRate(DROPS, 'boss', 0)).toBe(0);
  });

  it('drops once the gate is exactly met, not only once it is exceeded', () => {
    // An off-by-one here means emblems unlock a whole chapter late, which is a wait long enough
    // that nobody would report it as a bug rather than as the intended design.
    expect(dropRate(DROPS, 'boss', 1)).toBeGreaterThan(0);
  });

  it('returns at most one, so a caller can credit the count directly', () => {
    for (let index = 0; index < 500; index++) {
      const earned = rollEmblems(DROPS, 'boss', 1, derivedStream(0x5eed, `fight:${index}`));
      expect(earned === 0 || earned === 1).toBe(true);
    }
  });

  it('takes the same number of draws whether or not the gate is met', () => {
    // ⚠️ Load-bearing rather than incidental. A version that returned early on the gate would
    // consume a different number of draws before and after chapter 1, which makes "what did seed X
    // drop on stage Y" a question with two answers depending on run history — and turns every
    // recorded balance figure into a value that cannot be reproduced.
    const gated = derivedStream(0xd15c, 'shared');
    const open = derivedStream(0xd15c, 'shared');

    rollEmblems(DROPS, 'boss', 0, gated);
    rollEmblems(DROPS, 'boss', 5, open);

    expect(gated()).toBe(open());
  });

  it('is reproducible from the same seed and label', () => {
    const first = rollEmblems(DROPS, 'normal', 3, derivedStream(0xabcdef, 'emblem:12:44'));
    const second = rollEmblems(DROPS, 'normal', 3, derivedStream(0xabcdef, 'emblem:12:44'));

    expect(first).toBe(second);
  });

  it('treats a damaged gate as no gate rather than as an impassable one', () => {
    // The direction that cannot strand a run. A non-finite threshold read as infinity would mean
    // emblems never drop again, on a save the player cannot repair from inside the game.
    const damaged: EmblemDropData = { ...DROPS, unlockChapters: Number.NaN };

    expect(dropRate(damaged, 'boss', 0)).toBeGreaterThan(0);
  });
});
