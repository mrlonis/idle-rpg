// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { toCombatStats } from '../battle/content';
import { num } from '../numeric';
import { owned, TEST_ALPHA, TEST_GAMMA, TEST_GROWTH as GROWTH } from './fixtures';
import { growthMultiplier, scaleStats, toBattleCombatant, type GrowthData } from './stats';
import { MAX_RARITY_INDEX } from './types';

const FLAT: GrowthData = {
  perLevel: { common: 1, legendary: 1, ascended: 1 },
  perAscension: 1,
};

describe('growthMultiplier', () => {
  it('is exactly one at level 1 and the starting rarity', () => {
    expect(growthMultiplier(GROWTH, 'common', 1, 0).eq(1)).toBe(true);
    expect(growthMultiplier(GROWTH, 'ascended', 1, 2).eq(1)).toBe(true);
  });

  it('compounds with level', () => {
    const at50 = growthMultiplier(GROWTH, 'common', 50, 0);
    const at100 = growthMultiplier(GROWTH, 'common', 100, 0);

    expect(at50.gt(1)).toBe(true);
    expect(at100.gt(at50)).toBe(true);
  });

  it('counts ascension rungs from the tier’s own floor, not from Rare', () => {
    // An ascended-tier character starts at Elite. Counting from Rare would hand it two rungs of
    // multiplier for a climb it never made.
    expect(growthMultiplier(GROWTH, 'ascended', 1, 2).eq(1)).toBe(true);
    expect(growthMultiplier(GROWTH, 'ascended', 1, 3).eq(GROWTH.perAscension)).toBe(true);
  });

  it('never shrinks a character for damaged growth content', () => {
    const damaged: GrowthData = {
      perLevel: { common: 0.5, legendary: Number.NaN, ascended: -2 },
      perAscension: 0,
    };

    expect(growthMultiplier(damaged, 'common', 100, 5).gte(1)).toBe(true);
    expect(growthMultiplier(damaged, 'legendary', 100, 5).gte(1)).toBe(true);
  });

  it.each([0, -3, Number.NaN])('treats an unusable level of %p as level 1', (level) => {
    expect(growthMultiplier(GROWTH, 'common', level, 0).eq(1)).toBe(true);
  });
});

describe('tier divergence', () => {
  it('leaves the tiers close together early', () => {
    // A common-tier character is meant to be a genuine early answer, not a consolation prize.
    const common = growthMultiplier(GROWTH, 'common', 50, 0).toNumber();
    const ascended = growthMultiplier(GROWTH, 'ascended', 50, 0).toNumber();

    expect(ascended / common).toBeLessThan(1.5);
  });

  it('pulls them far apart by the level cap', () => {
    // "Amazing early, a joke later" has to be a consequence of the math rather than an
    // assertion. A flat multiplier would leave common tier the same fixed distance behind
    // forever and never actually fall off.
    const common = growthMultiplier(GROWTH, 'common', 1000, 0).toNumber();
    const ascended = growthMultiplier(GROWTH, 'ascended', 1000, 0).toNumber();

    expect(ascended / common).toBeGreaterThan(10);
  });

  it('orders the tiers common < legendary < ascended at every level past the first', () => {
    for (const level of [50, 200, 1000]) {
      const common = growthMultiplier(GROWTH, 'common', level, 0);
      const legendary = growthMultiplier(GROWTH, 'legendary', level, 0);
      const ascended = growthMultiplier(GROWTH, 'ascended', level, 0);

      expect(legendary.gt(common), `level ${level}`).toBe(true);
      expect(ascended.gt(legendary), `level ${level}`).toBe(true);
    }
  });
});

describe('scaleStats', () => {
  it('scales the five quantities and nothing else', () => {
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 100, 5);

    expect(num(scaled.hp).gt(num(TEST_ALPHA.stats.hp))).toBe(true);
    expect(num(scaled.patk).gt(num(TEST_ALPHA.stats.patk))).toBe(true);
    expect(num(scaled.matk).gt(num(TEST_ALPHA.stats.matk))).toBe(true);
    expect(num(scaled.pdef).gt(num(TEST_ALPHA.stats.pdef))).toBe(true);
    expect(num(scaled.mdef).gt(num(TEST_ALPHA.stats.mdef))).toBe(true);
  });

  it('never scales SPD, because it is a scheduling weight against a fixed threshold', () => {
    // A SPD that grew with level would hit the ATB clamp within about eighty levels and then be
    // identical for every character in the game — turning the one stat that buys turns into a
    // constant, and breaking the simulation's termination argument on the way.
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 1000, MAX_RARITY_INDEX);

    expect(scaled.spd).toBe(TEST_ALPHA.stats.spd);
  });

  it('never scales crit, because a probability cannot exceed one', () => {
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 1000, MAX_RARITY_INDEX);

    expect(scaled.critChance).toBe(TEST_ALPHA.stats.critChance);
    expect(scaled.critMultiplier).toBe(TEST_ALPHA.stats.critMultiplier);
  });

  it('leaves a level-1 starting-rarity character exactly as authored', () => {
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 1, 0);

    expect(num(scaled.hp).eq(num(TEST_ALPHA.stats.hp))).toBe(true);
    expect(num(scaled.patk).eq(num(TEST_ALPHA.stats.patk))).toBe(true);
  });

  it('changes nothing at all under flat growth', () => {
    const scaled = scaleStats(TEST_ALPHA.stats, FLAT, 'common', 500, 9);

    expect(num(scaled.hp).eq(num(TEST_ALPHA.stats.hp))).toBe(true);
  });

  it('returns a JSON-safe block, so there is one path into the simulation', () => {
    // Quantities come back as exponential strings — the same shape `data/` authors and the same
    // shape `content.ts` parses. A second, parallel way to build a combatant is exactly what
    // this avoids.
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 400, 8);

    expect(typeof scaled.hp).toBe('string');
    expect(() => JSON.stringify(scaled)).not.toThrow();
    expect(toCombatStats(scaled).hp.gt(0)).toBe(true);
  });

  it('stays exact at magnitudes past float64 safe-integer range', () => {
    const scaled = scaleStats(
      { ...TEST_ALPHA.stats, hp: '1e30' },
      GROWTH,
      'ascended',
      900,
      MAX_RARITY_INDEX,
    );

    expect(num(scaled.hp).toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    expect(toCombatStats(scaled).hp.gt(num('1e30'))).toBe(true);
  });
});

describe('toBattleCombatant', () => {
  it('carries the character id through unchanged', () => {
    // Battle events, the roster and the save all have to speak the same ids.
    const combatant = toBattleCombatant(TEST_GAMMA, owned(TEST_GAMMA), GROWTH);

    expect(combatant.id).toBe('gamma');
    expect(combatant.name).toBe('Gamma');
  });

  it('reflects the level and rarity the player has actually invested', () => {
    const base = toBattleCombatant(TEST_GAMMA, owned(TEST_GAMMA), GROWTH);
    const invested = toBattleCombatant(
      TEST_GAMMA,
      { defId: 'gamma', rarity: 8, level: 200, copies: 0 },
      GROWTH,
    );

    expect(toCombatStats(invested.stats).hp.gt(toCombatStats(base.stats).hp)).toBe(true);
    expect(toCombatStats(invested.stats).patk.gt(toCombatStats(base.stats).patk)).toBe(true);
  });

  it('produces a combatant the simulation can parse without special-casing', () => {
    const combatant = toBattleCombatant(
      TEST_ALPHA,
      { defId: 'alpha', rarity: 6, level: 300, copies: 0 },
      GROWTH,
    );
    const stats = toCombatStats(combatant.stats);

    expect(stats.spd).toBeGreaterThanOrEqual(1);
    expect(stats.critChance).toBeLessThanOrEqual(1);
    expect(stats.hp.gt(0)).toBe(true);
  });
});
