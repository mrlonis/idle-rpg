// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { emptyWallet, type Wallet } from '../currency';
import { num, ZERO } from '../numeric';
import { TEST_LEVEL_CURVE as CURVE } from './fixtures';
import {
  canLevelUp,
  clampLevel,
  cumulativeLevelCost,
  levelCapFor,
  levelCost,
  maxAffordableLevel,
} from './level';
import { MAX_RARITY_INDEX } from './types';

function wallet(gold: number, xp: number, essence: number): Wallet {
  return { ...emptyWallet(), gold: num(gold), xp: num(xp), essence: num(essence) };
}

const RICH = wallet(1e12, 1e12, 1e12);

describe('level caps', () => {
  it('rises with every rung of the ladder', () => {
    for (let rarity = 1; rarity <= MAX_RARITY_INDEX; rarity++) {
      expect(levelCapFor(CURVE, rarity)).toBeGreaterThan(levelCapFor(CURVE, rarity - 1));
    }
  });

  it('tops out at the curve’s ceiling', () => {
    expect(levelCapFor(CURVE, MAX_RARITY_INDEX)).toBe(CURVE.maxLevel);
  });

  it('clamps a rarity outside the ladder rather than returning undefined', () => {
    expect(levelCapFor(CURVE, -4)).toBe(CURVE.caps[0]);
    expect(levelCapFor(CURVE, 999)).toBe(CURVE.maxLevel);
  });

  it('clamps a level into the rarity’s range', () => {
    expect(clampLevel(CURVE, 0, 0)).toBe(1);
    expect(clampLevel(CURVE, 9999, 0)).toBe(CURVE.caps[0]);
    expect(clampLevel(CURVE, Number.NaN, 0)).toBe(1);
    expect(clampLevel(CURVE, 7.9, 0)).toBe(7);
  });
});

describe('levelCost', () => {
  it('charges gold and XP on every level', () => {
    const cost = levelCost(CURVE, 5);

    expect(cost.gold?.gt(ZERO)).toBe(true);
    expect(cost.xp?.gt(ZERO)).toBe(true);
  });

  it('rises with level on both', () => {
    const early = levelCost(CURVE, 2);
    const late = levelCost(CURVE, 60);

    expect(late.gold?.gt(early.gold ?? ZERO)).toBe(true);
    expect(late.xp?.gt(early.xp ?? ZERO)).toBe(true);
  });

  it('charges essence only at breakthrough levels', () => {
    // Every tenth level, against the level being *reached* — so 9 → 10 is the first
    // breakthrough. Essence arriving in visible jumps is what makes it read as a gate rather
    // than as a third tax on every level.
    expect(levelCost(CURVE, 9).essence?.gt(ZERO)).toBe(true);
    expect(levelCost(CURVE, 19).essence?.gt(ZERO)).toBe(true);

    for (const level of [1, 5, 8, 10, 11, 15]) {
      expect(levelCost(CURVE, level).essence, `level ${level}`).toBeUndefined();
    }
  });

  it('steps essence up sharply between breakthroughs', () => {
    const first = levelCost(CURVE, 9).essence;
    const later = levelCost(CURVE, 89).essence;

    expect(later?.gt(first ?? ZERO)).toBe(true);
  });

  it('charges nothing at or above the ceiling', () => {
    expect(levelCost(CURVE, CURVE.maxLevel)).toEqual({});
    expect(levelCost(CURVE, CURVE.maxLevel + 50)).toEqual({});
  });

  it.each([0, -3, Number.NaN])('charges nothing for an unusable level of %p', (level) => {
    expect(levelCost(CURVE, level)).toEqual({});
  });
});

describe('cumulativeLevelCost', () => {
  it('sums every level in the range', () => {
    const oneAtATime = [levelCost(CURVE, 1), levelCost(CURVE, 2), levelCost(CURVE, 3)];
    const expectedGold = oneAtATime.reduce((sum, cost) => sum.add(cost.gold ?? ZERO), ZERO);

    expect(cumulativeLevelCost(CURVE, 1, 4).gold?.eq(expectedGold)).toBe(true);
  });

  it('is zero when the target is not above the start', () => {
    expect(cumulativeLevelCost(CURVE, 20, 20).gold?.eq(0)).toBe(true);
    expect(cumulativeLevelCost(CURVE, 20, 5).gold?.eq(0)).toBe(true);
  });

  it('stops at the curve’s ceiling rather than running past it', () => {
    const toCap = cumulativeLevelCost(CURVE, 1, CURVE.maxLevel);
    const beyond = cumulativeLevelCost(CURVE, 1, CURVE.maxLevel + 500);

    expect(beyond.gold?.eq(toCap.gold ?? ZERO)).toBe(true);
  });
});

describe('maxAffordableLevel', () => {
  it('spends everything it can without exceeding the rarity cap', () => {
    expect(maxAffordableLevel(CURVE, RICH, 1, 0)).toBe(CURVE.caps[0]);
    expect(maxAffordableLevel(CURVE, RICH, 1, MAX_RARITY_INDEX)).toBe(CURVE.maxLevel);
  });

  it('stops at the first level it cannot pay for', () => {
    const cost = levelCost(CURVE, 1);
    const exactlyOne = {
      ...emptyWallet(),
      gold: cost.gold ?? ZERO,
      xp: cost.xp ?? ZERO,
    };

    expect(maxAffordableLevel(CURVE, exactlyOne, 1, 5)).toBe(2);
  });

  it('stops when essence runs out even with gold and XP to spare', () => {
    // The bottleneck doing its job. Without essence a character stalls at the breakthrough and
    // no amount of gold moves it.
    const noEssence = wallet(1e12, 1e12, 0);

    expect(maxAffordableLevel(CURVE, noEssence, 1, 5)).toBe(9);
  });

  it('returns the current level when nothing is affordable', () => {
    expect(maxAffordableLevel(CURVE, emptyWallet(), 4, 5)).toBe(4);
  });

  it('never goes below the level it was given', () => {
    expect(maxAffordableLevel(CURVE, emptyWallet(), 25, 0)).toBeGreaterThanOrEqual(CURVE.caps[0]);
  });
});

describe('canLevelUp', () => {
  it('is true with the money and headroom to spend it', () => {
    expect(canLevelUp(CURVE, RICH, 1, 5)).toBe(true);
  });

  it('is false at the rarity’s cap, however rich the player is', () => {
    expect(canLevelUp(CURVE, RICH, CURVE.caps[0], 0)).toBe(false);
  });

  it('is false without the currency', () => {
    expect(canLevelUp(CURVE, emptyWallet(), 1, 5)).toBe(false);
  });
});

describe('the shape of the curve', () => {
  it('keeps all three currencies relevant rather than letting one dominate', () => {
    // The design target from `levels.ts`: no currency is decorative. Measured as time-to-afford
    // at the rates each is tuned to, the three should land within the same order of magnitude
    // over the levels a player actually spends their time in.
    const total = cumulativeLevelCost(CURVE, 1, 60);
    const goldTime = (total.gold ?? ZERO).div(16).toNumber();
    const xpTime = (total.xp ?? ZERO).div(3).toNumber();
    const essenceTime = (total.essence ?? ZERO).div(0.05).toNumber();

    for (const [a, b] of [
      [goldTime, xpTime],
      [xpTime, essenceTime],
      [goldTime, essenceTime],
    ]) {
      expect(Math.max(a, b) / Math.min(a, b)).toBeLessThan(10);
    }
  });

  it('makes each level cost more than the one before it', () => {
    for (let level = 2; level < 60; level++) {
      const previous = levelCost(CURVE, level - 1).gold ?? ZERO;
      const current = levelCost(CURVE, level).gold ?? ZERO;

      expect(current.gte(previous), `level ${level}`).toBe(true);
    }
  });
});
