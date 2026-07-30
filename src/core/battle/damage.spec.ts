// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { toCombatStats } from './content';
import { baseDamage, rollAttack } from './damage';
import { type StatBlockData } from './types';

function stats(overrides: Partial<StatBlockData> = {}) {
  return toCombatStats({
    hp: 100,
    atk: 50,
    def: 10,
    spd: 100,
    critChance: 0,
    critMultiplier: 2,
    ...overrides,
  });
}

/** A draw sequence, so a test can decide exactly which attacks crit. */
function draws(...values: readonly number[]): () => number {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

describe('baseDamage', () => {
  it('deals full ATK against no defence', () => {
    // atk² / (atk + 0) = atk. The formula's anchor point, and the reason DEF reads as a
    // percentage reduction rather than a subtraction.
    expect(baseDamage(num(50), num(0)).eq(50)).toBe(true);
  });

  it('halves damage when DEF equals ATK', () => {
    expect(baseDamage(num(50), num(50)).eq(25)).toBe(true);
  });

  it('stays strictly positive no matter how much DEF is stacked', () => {
    // This is what makes the simulation terminate. Subtractive mitigation would be zero here,
    // and a battle where neither side can deal damage never ends.
    expect(baseDamage(num(10), num('1e12')).gt(0)).toBe(true);
    expect(baseDamage(num(1), num('1e30')).gt(0)).toBe(true);
  });

  it('gives DEF diminishing returns, so it never becomes the only stat', () => {
    const atk = num(100);
    const firstHundred = baseDamage(atk, num(0)).sub(baseDamage(atk, num(100)));
    const secondHundred = baseDamage(atk, num(100)).sub(baseDamage(atk, num(200)));

    expect(secondHundred.lt(firstHundred)).toBe(true);
  });

  it('increases monotonically with ATK', () => {
    const def = num(40);

    expect(baseDamage(num(60), def).gt(baseDamage(num(50), def))).toBe(true);
    expect(baseDamage(num('1e20'), def).gt(baseDamage(num('1e19'), def))).toBe(true);
  });

  it.each([0, -1, -1000])('deals nothing rather than NaN for an ATK of %p', (atk) => {
    // 0/0 would produce NaN, and a NaN HP value poisons every comparison downstream — a
    // combatant would be neither alive nor dead.
    const damage = baseDamage(num(atk), num(0));

    expect(damage.eq(0)).toBe(true);
    expect(damage.mantissa).not.toBeNaN();
  });

  it('works at magnitudes past float64 exact-integer range', () => {
    const damage = baseDamage(num('1e30'), num('1e30'));

    expect(damage.eq(num('5e29'))).toBe(true);
  });
});

describe('rollAttack', () => {
  it('applies the crit multiplier when the draw lands under the crit chance', () => {
    const attacker = stats({ atk: 50, critChance: 0.25, critMultiplier: 2 });

    const { damage, crit } = rollAttack(attacker, stats({ def: 0 }), draws(0.1));

    expect(crit).toBe(true);
    expect(damage.eq(100)).toBe(true);
  });

  it('does not crit when the draw lands on or above the crit chance', () => {
    const attacker = stats({ atk: 50, critChance: 0.25, critMultiplier: 2 });

    const { damage, crit } = rollAttack(attacker, stats({ def: 0 }), draws(0.25));

    expect(crit).toBe(false);
    expect(damage.eq(50)).toBe(true);
  });

  it('consumes exactly one draw per attack regardless of the attacker', () => {
    // RNG consumption must not depend on the line-up. If a zero-crit attacker skipped its draw,
    // two otherwise identical replays would diverge the moment a party composition changed.
    let calls = 0;
    const draw = (): number => {
      calls++;
      return 0.5;
    };

    rollAttack(stats({ critChance: 0 }), stats(), draw);
    rollAttack(stats({ critChance: 1 }), stats(), draw);

    expect(calls).toBe(2);
  });

  it('never crits at a chance of zero and always crits at one', () => {
    const draw = draws(0);

    expect(rollAttack(stats({ critChance: 0 }), stats(), draw).crit).toBe(false);
    expect(rollAttack(stats({ critChance: 1 }), stats(), draws(0.999999)).crit).toBe(true);
  });
});
