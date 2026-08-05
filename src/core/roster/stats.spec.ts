// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { toCombatStats } from '../battle/content';
import { type EnemyData, type SkillData } from '../battle/types';
import { type GrowthData } from '../growth';
import { num } from '../numeric';
import {
  owned,
  TEST_ALPHA,
  TEST_GAMMA,
  TEST_GROWTH as GROWTH,
  TEST_KIT_RULES as KIT,
} from './fixtures';
import { growthMultiplier, scaleStats, toBattleCombatant, toEnemyCombatant } from './stats';
import { type CharacterData, MAX_RARITY_INDEX } from './types';

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
  it('scales the four quantities and nothing else', () => {
    const scaled = scaleStats({ ...TEST_ALPHA.stats, recovery: 3 }, GROWTH, 'common', 100, 5);

    expect(num(scaled.hp).gt(num(TEST_ALPHA.stats.hp))).toBe(true);
    expect(num(scaled.atk).gt(num(TEST_ALPHA.stats.atk))).toBe(true);
    expect(num(scaled.def).gt(num(TEST_ALPHA.stats.def))).toBe(true);
    expect(num(scaled.recovery ?? 0).gt(num(3))).toBe(true);
  });

  it('leaves an absent recovery absent rather than inventing one', () => {
    // A character with no natural recovery should not acquire one at level 2 because the scaler
    // visited the field.
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 500, 5);

    expect(TEST_ALPHA.stats.recovery).toBeUndefined();
    expect(scaled.recovery).toBeUndefined();
  });

  it('never scales haste, because it is a scheduling weight against a fixed threshold', () => {
    // A haste that grew with level would hit the ATB clamp within about eighty levels and then
    // be identical for every character in the game — turning the one stat that buys turns into a
    // constant, and breaking the simulation's termination argument on the way. Attack speed is
    // added to the same gauge and inherits the same reasoning.
    const scaled = scaleStats(
      { ...TEST_ALPHA.stats, attackSpeed: 20 },
      GROWTH,
      'common',
      1000,
      MAX_RARITY_INDEX,
    );

    expect(scaled.haste).toBe(TEST_ALPHA.stats.haste);
    expect(scaled.attackSpeed).toBe(20);
  });

  it('never scales a probability or a percentage amplifier', () => {
    const scaled = scaleStats(
      { ...TEST_ALPHA.stats, healthRegen: 0.3, receivedHealing: 0.2, physicalResist: 0.25 },
      GROWTH,
      'common',
      1000,
      MAX_RARITY_INDEX,
    );

    expect(scaled.critChance).toBe(TEST_ALPHA.stats.critChance);
    expect(scaled.critDamageAmp).toBe(TEST_ALPHA.stats.critDamageAmp);
    expect(scaled.healthRegen).toBe(0.3);
    expect(scaled.receivedHealing).toBe(0.2);
    expect(scaled.physicalResist).toBe(0.25);
  });

  it('leaves a level-1 starting-rarity character exactly as authored', () => {
    const scaled = scaleStats(TEST_ALPHA.stats, GROWTH, 'common', 1, 0);

    expect(num(scaled.hp).eq(num(TEST_ALPHA.stats.hp))).toBe(true);
    expect(num(scaled.atk).eq(num(TEST_ALPHA.stats.atk))).toBe(true);
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
    const combatant = toBattleCombatant(TEST_GAMMA, owned(TEST_GAMMA), GROWTH, KIT, 1);

    expect(combatant.id).toBe('gamma');
    expect(combatant.name).toBe('Gamma');
  });

  it('reflects the level and rarity the player has actually invested', () => {
    const base = toBattleCombatant(TEST_GAMMA, owned(TEST_GAMMA), GROWTH, KIT, 1);
    const invested = toBattleCombatant(
      TEST_GAMMA,
      { defId: 'gamma', rarity: 8, level: 200, copies: 0 },
      GROWTH,
      KIT,
      200,
    );

    expect(toCombatStats(invested.stats).hp.gt(toCombatStats(base.stats).hp)).toBe(true);
    expect(toCombatStats(invested.stats).atk.gt(toCombatStats(base.stats).atk)).toBe(true);
  });

  it('fights at the level it is handed, not at the one in the roster entry', () => {
    // The milestone 9 seam. `OwnedCharacter.level` is what the player paid for; resonance can
    // carry a character above it, and a version of this that read the entry would send a bench
    // character into a fight at a level no screen was showing.
    const entry = { defId: 'gamma', rarity: 8, level: 1, copies: 0 };

    const invested = toBattleCombatant(TEST_GAMMA, entry, GROWTH, KIT, 1);
    const carried = toBattleCombatant(TEST_GAMMA, entry, GROWTH, KIT, 200);

    expect(toCombatStats(carried.stats).hp.gt(toCombatStats(invested.stats).hp)).toBe(true);
  });

  it('produces a combatant the simulation can parse without special-casing', () => {
    const combatant = toBattleCombatant(
      TEST_ALPHA,
      { defId: 'alpha', rarity: 6, level: 300, copies: 0 },
      GROWTH,
      KIT,
      300,
    );
    const stats = toCombatStats(combatant.stats);

    expect(stats.haste).toBeGreaterThanOrEqual(1);
    expect(stats.critChance).toBeLessThanOrEqual(1);
    expect(stats.hp.gt(0)).toBe(true);
  });

  it('hands the simulation only the part of the kit the rungs have unlocked', () => {
    // The gate lives on this seam rather than inside combat, exactly as stat scaling does — so
    // `simulateBattle` never has to know what a tier or a rung is.
    const skills: readonly SkillData[] = [
      { id: 'ult', name: 'Ult', target: 'enemy-front', effects: [], ultimate: true },
      { id: 'second', name: 'Second', target: 'enemy-front', effects: [], cooldown: 10 },
    ];
    const armed: CharacterData = { ...TEST_ALPHA, skills };

    const rare = toBattleCombatant(armed, owned(armed), GROWTH, KIT, 1);
    const elite = toBattleCombatant(
      armed,
      { defId: armed.id, rarity: 2, level: 1, copies: 0 },
      GROWTH,
      KIT,
      1,
    );

    expect(rare.skills?.map((skill) => skill.id)).toEqual(['ult']);
    expect(elite.skills?.map((skill) => skill.id)).toEqual(['ult', 'second']);
  });
});

describe('toEnemyCombatant', () => {
  /** A stand-in archetype, authored at level 1 exactly as `data/enemies.ts` authors its own. */
  const OGRE: EnemyData = {
    id: 'ogre',
    name: 'Ogre',
    faction: 'monster',
    tier: 'common',
    stats: {
      hp: 400,
      atk: 30,
      def: 12,
      recovery: 5,
      haste: 80,
      critChance: 0.1,
      critDamageAmp: 0.5,
      dodge: 0.2,
    },
  };

  it('fields an archetype as authored at level 1', () => {
    const stats = toCombatStats(toEnemyCombatant(OGRE, GROWTH, 1).stats);

    expect(stats.hp.eq(400)).toBe(true);
    expect(stats.atk.eq(30)).toBe(true);
  });

  it('grows the four quantities with the level and nothing else', () => {
    // The same rule the roster side follows, asserted separately because an enemy takes a
    // different route into the simulation: a scheduling weight or a probability that quietly
    // started growing on this side would be a termination bug rather than a balance one.
    const stats = toCombatStats(toEnemyCombatant(OGRE, GROWTH, 200).stats);
    const base = toCombatStats(toEnemyCombatant(OGRE, GROWTH, 1).stats);
    const ratio = stats.hp.div(base.hp).toNumber();

    expect(ratio).toBeGreaterThan(1);
    expect(stats.atk.div(base.atk).toNumber()).toBeCloseTo(ratio);
    expect(stats.def.div(base.def).toNumber()).toBeCloseTo(ratio);
    expect(stats.recovery.div(base.recovery).toNumber()).toBeCloseTo(ratio);
    expect(stats.haste).toBe(base.haste);
    expect(stats.critChance).toBe(base.critChance);
    expect(stats.dodge).toBe(base.dodge);
  });

  it('climbs the tier it declares', () => {
    // Fodder is `common` and a gate is `ascended`, so the boss of an encounter pulls away from
    // the escort standing in front of it as the ladder climbs rather than the two staying a
    // fixed distance apart forever.
    const fodder = toCombatStats(toEnemyCombatant(OGRE, GROWTH, 300).stats);
    const gate = toCombatStats(toEnemyCombatant({ ...OGRE, tier: 'ascended' }, GROWTH, 300).stats);

    expect(gate.hp.gt(fodder.hp)).toBe(true);
  });

  it('takes no ascension rungs, whatever its tier starts on', () => {
    // An `ascended`-tier character starts two rungs up the ladder and is paid for them. An enemy
    // has no owner and no duplicates behind it, so the only dial on this side is the level — see
    // the note on `toEnemyCombatant` for why the rung was folded into the stat block instead.
    const flat: GrowthData = { ...GROWTH, perLevel: { common: 1, legendary: 1, ascended: 1 } };
    const gate = toCombatStats(toEnemyCombatant({ ...OGRE, tier: 'ascended' }, flat, 50).stats);

    expect(gate.hp.eq(400)).toBe(true);
  });
});
