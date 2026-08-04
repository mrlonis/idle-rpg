// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { toCombatStats } from './content';
import {
  baseDamage,
  critChance,
  critMultiplier,
  effectiveDefence,
  factionMultiplier,
  hitChance,
  resistedShare,
  rollAttack,
  statusChance,
} from './damage';
import { NEUTRAL_COMBAT_RULES, TEST_COMBAT_RULES } from './fixtures';
import { type StatBlockData } from './types';

function stats(overrides: Partial<StatBlockData> = {}) {
  return toCombatStats({
    hp: 100,
    atk: 50,
    def: 10,
    haste: 100,
    critChance: 0,
    critDamageAmp: 1,
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
  it('reads one attack stat whatever the type declares', () => {
    // The collapse, asserted rather than assumed. A caster's swing and its spells come off the
    // same number now; what the type still decides is which pierce and which resist apply.
    const attacker = stats({ atk: 70 });
    const defender = stats({ def: 0 });
    const physical = rollAttack(
      attacker,
      defender,
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );
    const magical = rollAttack(
      attacker,
      defender,
      'magical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );

    expect(physical.damage.eq(70)).toBe(true);
    expect(magical.damage.eq(70)).toBe(true);
  });

  it('measures both types against the same defence', () => {
    const attacker = stats();
    const defender = stats({ def: 60 });

    expect(effectiveDefence(attacker, defender, 'physical').eq(60)).toBe(true);
    expect(effectiveDefence(attacker, defender, 'magical').eq(60)).toBe(true);
  });

  it('keeps the two axes alive through the resists instead', () => {
    // The whole reason a wall is not automatically a wall against everything: a Golem's armour
    // does nothing about a spell. That statement used to live in `pdef` vs `mdef`; it lives in
    // `physicalResist` vs `magicResist` now, and it has to still be true.
    const wall = stats({ physicalResist: 0.4 });

    expect(resistedShare(wall, 'physical')).toBeCloseTo(0.6, 10);
    expect(resistedShare(wall, 'magical')).toBe(1);
  });

  it('never lets resist reach zero damage, whatever content authors', () => {
    // The termination guard. Resist multiplies the result, so unlike `def` it can reach zero —
    // and a combatant nothing can hurt is a fight that runs to the tick cap.
    const immune = stats({ physicalResist: 5, magicResist: 5 });

    expect(resistedShare(immune, 'physical')).toBeGreaterThan(0);
    expect(resistedShare(immune, 'magical')).toBeGreaterThan(0);
  });

  it('discounts defence by the attacker’s matching pierce rather than subtracting it', () => {
    // A fraction keeps penetration on the same diminishing curve. Flat penetration would be a
    // hard counter: enough of it deletes a defensive stat outright.
    const shredder = stats({ physicalPierce: 0.25, magicPierce: 0.5 });
    const defender = stats({ def: 80 });

    expect(effectiveDefence(shredder, defender, 'physical').eq(60)).toBe(true);
    expect(effectiveDefence(shredder, defender, 'magical').eq(40)).toBe(true);
  });

  it('never lets penetration erase a defence completely', () => {
    // `content.ts` caps penetration below 1 so the top of the DEF curve keeps working. A
    // defence of zero would make "stack penetration" collapse every defensive archetype at once.
    const shredder = stats({ physicalPierce: 5 });

    expect(effectiveDefence(shredder, stats({ def: 100 }), 'physical').gt(0)).toBe(true);
  });
});

describe('the crit pair', () => {
  it('subtracts the target’s crit block from the attacker’s rating', () => {
    expect(critChance(stats({ critChance: 0.5 }), stats({ critBlock: 0.2 }))).toBeCloseTo(0.3, 10);
  });

  it('lets crit block reach immunity, because a hit that never crits still kills', () => {
    // Unlike the hit chance, which is a termination guard: this one is allowed to floor at zero.
    expect(critChance(stats({ critChance: 0.4 }), stats({ critBlock: 1 }))).toBe(0);
  });

  it('resolves crit damage as one plus the point difference', () => {
    expect(critMultiplier(stats({ critDamageAmp: 0.8 }), stats())).toBeCloseTo(1.8, 10);
    expect(critMultiplier(stats({ critDamageAmp: 0.8 }), stats({ critDamageResist: 0.3 }))).toBe(
      1.5,
    );
  });

  it('never lets a critical hit land for less than an ordinary one', () => {
    // Floored at 1 rather than allowed to invert. A "critical" that reduced damage is a mechanic
    // nobody could read off a battle log.
    expect(critMultiplier(stats({ critDamageAmp: 0.2 }), stats({ critDamageResist: 5 }))).toBe(1);
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

  it('adds the applier’s insight and subtracts the target’s tenacity', () => {
    expect(statusChance(0.8, stats({ insight: 0.15 }), stats())).toBeCloseTo(0.95, 10);
    expect(statusChance(0.8, stats(), stats({ tenacity: 0.3 }))).toBeCloseTo(0.5, 10);
  });

  it('clamps to [0, 1], so a bulwark can be genuinely immune', () => {
    // Unlike a hit chance, a debuff that never lands cannot stall a battle — so this one is
    // allowed to reach zero and an immune-to-debuffs archetype is authorable.
    expect(statusChance(1, stats(), stats({ tenacity: 1 }))).toBe(0);
    expect(statusChance(1, stats({ insight: 0.5 }), stats())).toBe(1);
  });
});

describe('rollAttack', () => {
  it('applies the crit multiplier when the second draw lands under the crit chance', () => {
    const attacker = stats({ atk: 50, critChance: 0.25, critDamageAmp: 1 });

    const { damage, crit, hit } = rollAttack(
      attacker,
      stats({ def: 0 }),
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
    const attacker = stats({ atk: 50, critChance: 0.25, critDamageAmp: 1 });

    const { damage, crit } = rollAttack(
      attacker,
      stats({ def: 0 }),
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
    const attacker = stats({ atk: 50 });
    const defender = stats({ def: 50 });

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
      stats({ atk: 50 }),
      stats({ def: 0 }),
      'physical',
      1,
      1.1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );

    expect(roll.damage.eq(55)).toBe(true);
  });

  it('multiplies by the defender’s matching resist and by nothing else', () => {
    const armoured = stats({ def: 0, physicalResist: 0.4 });
    const physical = rollAttack(
      stats({ atk: 50 }),
      armoured,
      'physical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );
    const magical = rollAttack(
      stats({ atk: 50 }),
      armoured,
      'magical',
      1,
      1,
      NEUTRAL_COMBAT_RULES,
      draws(0, 1),
    );

    // Compared numerically: resist is a float multiplier, so 50 × 0.6 lands a bit either side
    // of 30. What matters is which type it touched, not the last bit of it.
    expect(physical.damage.toNumber()).toBeCloseTo(30, 10);
    expect(magical.damage.toNumber()).toBeCloseTo(50, 10);
  });
});
