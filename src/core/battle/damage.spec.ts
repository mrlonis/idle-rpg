// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { toCombatStats } from './content';
import {
  attackStat,
  baseDamage,
  effectiveDefence,
  factionMultiplier,
  hitChance,
  rollAttack,
  statusChance,
} from './damage';
import { NEUTRAL_COMBAT_RULES, TEST_COMBAT_RULES } from './fixtures';
import { type StatBlockData } from './types';

function stats(overrides: Partial<StatBlockData> = {}) {
  return toCombatStats({
    hp: 100,
    patk: 50,
    matk: 30,
    pdef: 10,
    mdef: 10,
    spd: 100,
    critChance: 0,
    critMultiplier: 2,
    ...overrides,
  });
}

/** A draw sequence, so a test can decide exactly which attacks hit and which crit. */
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

describe('damage types', () => {
  it('reads the attack stat the type names', () => {
    const attacker = stats({ patk: 70, matk: 20 });

    expect(attackStat(attacker, 'physical').eq(70)).toBe(true);
    expect(attackStat(attacker, 'magical').eq(20)).toBe(true);
  });

  it('measures each type against its own defence', () => {
    // The whole reason a wall is not automatically a wall against everything: a Golem's armour
    // does nothing about a spell, and a caster that neglected `mdef` dies to one.
    const attacker = stats();
    const defender = stats({ pdef: 60, mdef: 5 });

    expect(effectiveDefence(attacker, defender, 'physical').eq(60)).toBe(true);
    expect(effectiveDefence(attacker, defender, 'magical').eq(5)).toBe(true);
  });

  it('discounts defence by the attacker’s penetration rather than subtracting it', () => {
    // A fraction keeps penetration on the same diminishing curve. Flat penetration would be a
    // hard counter: enough of it deletes a defensive stat outright.
    const shredder = stats({ armorPen: 0.25, magicPen: 0.5 });
    const defender = stats({ pdef: 80, mdef: 40 });

    expect(effectiveDefence(shredder, defender, 'physical').eq(60)).toBe(true);
    expect(effectiveDefence(shredder, defender, 'magical').eq(20)).toBe(true);
  });

  it('never lets penetration erase a defence completely', () => {
    // `content.ts` caps penetration below 1 so the top of the DEF curve keeps working. A
    // defence of zero would make "stack penetration" collapse every defensive archetype at once.
    const shredder = stats({ armorPen: 5 });

    expect(effectiveDefence(shredder, stats({ pdef: 100 }), 'physical').gt(0)).toBe(true);
  });
});

describe('hitChance', () => {
  it('is certain by default, because most combatants author neither stat', () => {
    expect(hitChance(stats(), stats(), NEUTRAL_COMBAT_RULES)).toBe(1);
  });

  it('subtracts dodge from accuracy', () => {
    expect(hitChance(stats(), stats({ dodge: 0.4 }), NEUTRAL_COMBAT_RULES)).toBeCloseTo(0.6, 10);
  });

  it('lets accuracy above 1 out-run a dodge stack', () => {
    // Accuracy is deliberately allowed past certainty. Capped at 1, the only answer to an
    // evasion build would be more evasion.
    expect(hitChance(stats({ accuracy: 1.3 }), stats({ dodge: 0.4 }), NEUTRAL_COMBAT_RULES)).toBe(
      0.9,
    );
  });

  it('floors the chance so nothing is ever unhittable', () => {
    // A termination guard before it is a balance lever: a combatant nobody can hit turns every
    // fight against it into a run to the tick cap.
    const chance = hitChance(stats({ accuracy: 0 }), stats({ dodge: 1 }), NEUTRAL_COMBAT_RULES);

    expect(chance).toBe(NEUTRAL_COMBAT_RULES.minHitChance);
    expect(chance).toBeGreaterThan(0);
  });
});

describe('factionMultiplier', () => {
  it('applies an authored matchup', () => {
    expect(factionMultiplier(TEST_COMBAT_RULES, 'strong', 'weak')).toBe(2);
  });

  it('is neutral for a pairing nobody authored, in either direction', () => {
    // A new faction added to `data/` should fight everyone evenly until somebody says what it
    // is good against, rather than silently inheriting another faction's table.
    expect(factionMultiplier(TEST_COMBAT_RULES, 'weak', 'strong')).toBe(1);
    expect(factionMultiplier(TEST_COMBAT_RULES, 'nobody', 'weak')).toBe(1);
  });
});

describe('statusChance', () => {
  it('is exactly what the skill authored when neither stat is set', () => {
    // Which is the common case. Debuffs are meant to land; the answer to one is a cleanse.
    expect(statusChance(0.8, stats(), stats())).toBeCloseTo(0.8, 10);
  });

  it('adds the applier’s effect hit and subtracts the target’s tenacity', () => {
    expect(statusChance(0.8, stats({ effectHit: 0.15 }), stats())).toBeCloseTo(0.95, 10);
    expect(statusChance(0.8, stats(), stats({ tenacity: 0.3 }))).toBeCloseTo(0.5, 10);
  });

  it('clamps to [0, 1], so a bulwark can be genuinely immune', () => {
    // Unlike a hit chance, a debuff that never lands cannot stall a battle — so this one is
    // allowed to reach zero and an immune-to-debuffs archetype is authorable.
    expect(statusChance(1, stats(), stats({ tenacity: 1 }))).toBe(0);
    expect(statusChance(1, stats({ effectHit: 0.5 }), stats())).toBe(1);
  });
});

describe('rollAttack', () => {
  it('applies the crit multiplier when the second draw lands under the crit chance', () => {
    const attacker = stats({ patk: 50, critChance: 0.25, critMultiplier: 2 });

    const { damage, crit, hit } = rollAttack(
      attacker,
      stats({ pdef: 0 }),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 0.1),
    );

    expect(hit).toBe(true);
    expect(crit).toBe(true);
    expect(damage.eq(100)).toBe(true);
  });

  it('does not crit when the draw lands on or above the crit chance', () => {
    const attacker = stats({ patk: 50, critChance: 0.25, critMultiplier: 2 });

    const { damage, crit } = rollAttack(
      attacker,
      stats({ pdef: 0 }),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 0.25),
    );

    expect(crit).toBe(false);
    expect(damage.eq(50)).toBe(true);
  });

  it('reports a miss and deals nothing when the hit roll fails', () => {
    const roll = rollAttack(
      stats(),
      stats({ dodge: 0.5 }),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0.9, 0),
    );

    expect(roll.hit).toBe(false);
    expect(roll.crit).toBe(false);
    expect(roll.damage.eq(0)).toBe(true);
  });

  it('consumes exactly two draws per instance regardless of the outcome', () => {
    // RNG consumption must not depend on an outcome. If a miss skipped the crit draw, or a
    // zero-crit attacker skipped it, two otherwise identical replays would diverge the moment a
    // party composition changed.
    let calls = 0;
    const draw = (): number => {
      calls++;
      return 0.99;
    };

    rollAttack(stats({ critChance: 0 }), stats(), 'physical', 1, 1, NEUTRAL_COMBAT_RULES, draw);
    rollAttack(
      stats({ critChance: 1 }),
      stats({ dodge: 1 }),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draw,
    );

    expect(calls).toBe(4);
  });

  it('never crits at a chance of zero and always crits at one', () => {
    const zero = rollAttack(
      stats({ critChance: 0 }),
      stats(),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0),
    );
    const one = rollAttack(
      stats({ critChance: 1 }),
      stats(),
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 0.999999),
    );

    expect(zero.crit).toBe(false);
    expect(one.crit).toBe(true);
  });

  it('scales the result by the skill power rather than the attack stat', () => {
    // The formula is quadratic in ATK, so scaling the input would make a 2× skill hit for
    // roughly 4× — which turns every authored multiplier into a balance trap.
    const attacker = stats({ patk: 50 });
    const defender = stats({ pdef: 50 });

    const single = rollAttack(
      attacker,
      defender,
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );
    const double = rollAttack(
      attacker,
      defender,
      'physical',
      2,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );

    expect(single.damage.eq(25)).toBe(true);
    expect(double.damage.eq(50)).toBe(true);
  });

  it('multiplies by the faction matchup', () => {
    const roll = rollAttack(
      stats({ patk: 50 }),
      stats({ pdef: 0 }),
      'physical',
      1,
      1.1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );

    expect(roll.damage.eq(55)).toBe(true);
  });
});
