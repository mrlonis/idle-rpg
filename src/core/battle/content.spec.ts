// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type Numeric } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import {
  applyRowBonus,
  MAX_ACCURACY,
  MAX_PENETRATION,
  matchupKey,
  ticksPerAction,
  toAmount,
  toCombatant,
  toCombatRules,
  toCombatStats,
  toSkill,
} from './content';
import { PLAIN_COMBAT_RULES, TEST_COMBAT_RULES_DATA } from './fixtures';
import { type CombatRulesData, type SkillData, type StatBlockData } from './types';

const SOUND: StatBlockData = {
  hp: 500,
  patk: 40,
  matk: 25,
  pdef: 20,
  mdef: 15,
  spd: 100,
  critChance: 0.1,
  critMultiplier: 1.5,
};

const STRIKE: SkillData = {
  id: 'strike',
  name: 'Strike',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.5 }],
};

describe('toCombatStats', () => {
  it('parses a well-formed stat block unchanged', () => {
    const stats = toCombatStats(SOUND);

    expect(stats.hp.eq(500)).toBe(true);
    expect(stats.patk.eq(40)).toBe(true);
    expect(stats.matk.eq(25)).toBe(true);
    expect(stats.pdef.eq(20)).toBe(true);
    expect(stats.mdef.eq(15)).toBe(true);
    expect(stats.spd).toBe(100);
    expect(stats.critChance).toBe(0.1);
    expect(stats.critMultiplier).toBe(1.5);
  });

  it('defaults every optional stat to nothing, except accuracy which defaults to certainty', () => {
    // Which is what lets a Dwarf's stat block stay eight lines instead of seventeen: a stat is
    // mentioned only when it is part of the character's identity.
    const stats = toCombatStats(SOUND);

    expect(stats.mp).toBe(0);
    expect(stats.mpRegen).toBe(0);
    expect(stats.lifesteal).toBe(0);
    expect(stats.effectHit).toBe(0);
    expect(stats.tenacity).toBe(0);
    expect(stats.armorPen).toBe(0);
    expect(stats.magicPen).toBe(0);
    expect(stats.dodge).toBe(0);
    expect(stats.accuracy).toBe(1);
  });

  it('accepts string quantities so late content can exceed float64', () => {
    const stats = toCombatStats({ ...SOUND, hp: '1.5e+40', patk: '2e+20' });

    expect(stats.hp.eq('1.5e+40')).toBe(true);
    expect(stats.patk.eq('2e+20')).toBe(true);
  });

  it.each([0, -1, -1000])('floors HP at 1 rather than accepting %p', (hp) => {
    // Zero HP means dead before the first tick, which yields a battle log nobody can read.
    expect(toCombatStats({ ...SOUND, hp }).hp.eq(1)).toBe(true);
  });

  it('floors every attack and defence at zero', () => {
    const stats = toCombatStats({ ...SOUND, patk: -50, matk: -50, pdef: -50, mdef: -50 });

    expect(stats.patk.eq(0)).toBe(true);
    expect(stats.matk.eq(0)).toBe(true);
    expect(stats.pdef.eq(0)).toBe(true);
    expect(stats.mdef.eq(0)).toBe(true);
  });

  it.each([0, -1, Number.NaN, Infinity])('clamps an unusable spd of %p up to 1', (spd) => {
    // A combatant that cannot fill its gauge never acts, and the simulation would spin until it
    // hit the tick cap waiting for a turn that can never come.
    expect(toCombatStats({ ...SOUND, spd }).spd).toBe(1);
  });

  it('caps spd at the gauge threshold', () => {
    // Above the threshold a combatant would bank more than one action per tick, and turn
    // ordering — which resolves each ready combatant exactly once per tick — would drop turns.
    expect(toCombatStats({ ...SOUND, spd: ATB_THRESHOLD * 5 }).spd).toBe(ATB_THRESHOLD);
  });

  it.each([
    { label: 'below zero', critChance: -0.5, expected: 0 },
    { label: 'above one', critChance: 4, expected: 1 },
    { label: 'not a number', critChance: Number.NaN, expected: 0 },
  ])('clamps a crit chance $label', ({ critChance, expected }) => {
    expect(toCombatStats({ ...SOUND, critChance }).critChance).toBe(expected);
  });

  it('never lets a critical hit reduce damage', () => {
    expect(toCombatStats({ ...SOUND, critMultiplier: 0.5 }).critMultiplier).toBe(1);
    expect(toCombatStats({ ...SOUND, critMultiplier: Number.NaN }).critMultiplier).toBe(1);
  });

  it('caps penetration below total, so a defensive stat can never be erased', () => {
    const stats = toCombatStats({ ...SOUND, armorPen: 5, magicPen: 1 });

    expect(stats.armorPen).toBe(MAX_PENETRATION);
    expect(stats.magicPen).toBe(MAX_PENETRATION);
    expect(MAX_PENETRATION).toBeLessThan(1);
  });

  it('allows accuracy above certainty but not without limit', () => {
    // Above 1 on purpose: hit chance is accuracy minus dodge, so an accuracy capped at certainty
    // could never answer an evasion build.
    expect(toCombatStats({ ...SOUND, accuracy: 1.4 }).accuracy).toBe(1.4);
    expect(toCombatStats({ ...SOUND, accuracy: 99 }).accuracy).toBe(MAX_ACCURACY);
    expect(MAX_ACCURACY).toBeGreaterThan(1);
  });

  it('keeps MP whole, because it is a budget counted against authored costs', () => {
    const stats = toCombatStats({ ...SOUND, mp: 40.9, mpRegen: 3.7 });

    expect(stats.mp).toBe(40);
    expect(stats.mpRegen).toBe(3);
  });
});

describe('applyRowBonus', () => {
  const rows = { frontDefence: 1.05, backOffence: 1.05 };

  // Compared numerically rather than with `.eq()`. The bonus is a float multiplier, so 15 × 1.05
  // lands on 15.749999999999998 — which is exactly right for damage and exactly wrong for an
  // equality assertion. What matters here is which stat moved, not the last bit of it.
  const near = (value: Numeric, expected: number, label: string): void => {
    expect(value.toNumber(), label).toBeCloseTo(expected, 10);
  };

  it('raises both defences in the front rank', () => {
    // Symmetric, so putting a body forward is worth the same whatever is thrown at it.
    const stats = applyRowBonus(toCombatStats(SOUND), 'front', rows);

    near(stats.pdef, 21, 'pdef');
    near(stats.mdef, 15.75, 'mdef');
    near(stats.patk, 40, 'patk');
  });

  it('raises only the higher offensive stat in the back rank', () => {
    // Not a flat attack bonus. A caster gets all of it on `matk`, which only its skills read —
    // so the bonus pays for standing where a character's damage actually comes from.
    const brawler = applyRowBonus(toCombatStats(SOUND), 'back', rows);
    const caster = applyRowBonus(toCombatStats({ ...SOUND, patk: 20, matk: 60 }), 'back', rows);

    near(brawler.patk, 42, 'brawler patk');
    near(brawler.matk, 25, 'brawler matk');
    near(caster.matk, 63, 'caster matk');
    near(caster.patk, 20, 'caster patk');
  });

  it('gives a tie to the physical stat, which is what the basic attack reads', () => {
    const stats = applyRowBonus(toCombatStats({ ...SOUND, patk: 30, matk: 30 }), 'back', rows);

    near(stats.patk, 31.5, 'patk');
    near(stats.matk, 30, 'matk');
  });

  it('leaves defences alone in the back rank and offence alone in the front', () => {
    const back = applyRowBonus(toCombatStats(SOUND), 'back', rows);
    const front = applyRowBonus(toCombatStats(SOUND), 'front', rows);

    near(back.pdef, 20, 'back pdef');
    near(front.patk, 40, 'front patk');
    near(front.matk, 25, 'front matk');
  });
});

describe('toSkill', () => {
  it('defaults everything a terse kit leaves out', () => {
    const skill = toSkill(STRIKE);

    expect(skill.costKind).toBe('none');
    expect(skill.costAmount).toBe(0);
    expect(skill.cooldown).toBe(0);
    expect(skill.condition).toEqual({ kind: 'always' });
    expect(skill.priority).toBe(1);
  });

  it('carries an authored cost, cooldown and condition through', () => {
    const skill = toSkill({
      ...STRIKE,
      cost: { kind: 'mp', amount: 12 },
      cooldown: 45,
      condition: { kind: 'ally-hurt', fraction: 0.8 },
      priority: 3,
    });

    expect(skill.costKind).toBe('mp');
    expect(skill.costAmount).toBe(12);
    expect(skill.cooldown).toBe(45);
    expect(skill.condition).toEqual({ kind: 'ally-hurt', fraction: 0.8 });
    expect(skill.priority).toBe(3);
  });

  it('charges nothing for a skill whose cost kind is none, whatever amount it names', () => {
    expect(toSkill({ ...STRIKE, cost: { kind: 'none', amount: 40 } }).costAmount).toBe(0);
  });
});

describe('toCombatant', () => {
  it('carries identity through and parses the stats', () => {
    const combatant = toCombatant(
      { id: 'slime', name: 'Slime', faction: 'monster', stats: SOUND },
      PLAIN_COMBAT_RULES,
      'front',
    );

    expect(combatant.id).toBe('slime');
    expect(combatant.name).toBe('Slime');
    expect(combatant.faction).toBe('monster');
    expect(combatant.stats.hp.eq(500)).toBe(true);
  });

  it('falls back to the rules’ basic attack when a combatant authors none', () => {
    const combatant = toCombatant(
      { id: 'slime', name: 'Slime', faction: 'monster', stats: SOUND },
      PLAIN_COMBAT_RULES,
      'front',
    );

    expect(combatant.basic.id).toBe(PLAIN_COMBAT_RULES.basicAttack.id);
    expect(combatant.skills).toEqual([]);
  });

  it('sorts the kit by descending priority, so selection is a linear scan', () => {
    const combatant = toCombatant(
      {
        id: 'mage',
        name: 'Mage',
        faction: 'demon',
        stats: SOUND,
        skills: [
          { ...STRIKE, id: 'low', priority: 1 },
          { ...STRIKE, id: 'high', priority: 5 },
          { ...STRIKE, id: 'mid', priority: 3 },
        ],
      },
      PLAIN_COMBAT_RULES,
      'back',
    );

    expect(combatant.skills.map((skill) => skill.id)).toEqual(['high', 'mid', 'low']);
  });

  it('caps penetration against the authored ceiling rather than the module’s own', () => {
    // The ceiling is a balance number, so `data/` owns it. Reading it off the constant here
    // instead would make retuning `maxPenetration` in `data/combat.ts` silently do nothing —
    // which is exactly the trap a value that is authored, parsed and never read lays.
    const tight = toCombatRules({ ...TEST_COMBAT_RULES_DATA, maxPenetration: 0.25 });
    const shredder = toCombatant(
      { id: 'ruk', name: 'Ruk', faction: 'monster', stats: { ...SOUND, armorPen: 0.8 } },
      tight,
      'front',
    );

    expect(shredder.stats.armorPen).toBe(0.25);
  });

  it('applies the row bonus as it places the combatant', () => {
    const front = toCombatant(
      { id: 'a', name: 'A', faction: 'human', stats: SOUND },
      toCombatRules(TEST_COMBAT_RULES_DATA),
      'front',
    );

    expect(front.stats.pdef.eq(21)).toBe(true);
  });
});

describe('toCombatRules', () => {
  it('resolves the matchup list into a lookup keyed by attacker and defender', () => {
    const rules = toCombatRules(TEST_COMBAT_RULES_DATA);

    expect(rules.matchups.get(matchupKey('strong', 'weak'))).toBe(2);
    expect(rules.matchups.get(matchupKey('weak', 'strong'))).toBeUndefined();
  });

  it('lets a later duplicate pairing win, so an override reads the way it looks', () => {
    const rules = toCombatRules({
      ...TEST_COMBAT_RULES_DATA,
      matchups: [
        { attacker: 'a', defender: 'b', multiplier: 1.05 },
        { attacker: 'a', defender: 'b', multiplier: 1.5 },
      ],
    });

    expect(rules.matchups.get(matchupKey('a', 'b'))).toBe(1.5);
  });

  it('never lets the hit-chance floor reach zero', () => {
    // A hit chance that can reach zero is a battle that can never end, so this clamp is part of
    // the simulation's termination argument rather than a balance choice.
    const damaged: CombatRulesData = { ...TEST_COMBAT_RULES_DATA, minHitChance: 0 };

    expect(toCombatRules(damaged).minHitChance).toBeGreaterThan(0);
  });

  it('caps the authored penetration ceiling at the module’s own', () => {
    const rules = toCombatRules({ ...TEST_COMBAT_RULES_DATA, maxPenetration: 1 });

    expect(rules.maxPenetration).toBe(MAX_PENETRATION);
  });
});

describe('toAmount', () => {
  it('parses numbers and strings', () => {
    expect(toAmount(250).eq(250)).toBe(true);
    expect(toAmount('1.5e+18').eq('1.5e+18')).toBe(true);
  });

  it.each([-100, Number.NaN, Infinity])('treats an unusable amount of %p as nothing', (raw) => {
    expect(toAmount(raw).eq(0)).toBe(true);
  });

  it('treats an absent amount as nothing, so a stage can omit what it does not pay', () => {
    expect(toAmount(undefined).eq(0)).toBe(true);
  });
});

describe('ticksPerAction', () => {
  it('reports how many ticks a speed needs to fill the gauge', () => {
    expect(ticksPerAction(100)).toBe(10);
    expect(ticksPerAction(ATB_THRESHOLD)).toBe(1);
  });

  it('rounds up, because a partial tick is not a turn', () => {
    // spd 300 reaches 900 at tick 3 and 1200 at tick 4.
    expect(ticksPerAction(300)).toBe(4);
  });
});
