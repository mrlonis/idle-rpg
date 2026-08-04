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
  MAX_RESIST,
  matchupKey,
  ticksPerAction,
  toAmount,
  toCombatant,
  toCombatRules,
  toCombatStats,
  toSkill,
} from './content';
import { MAX_ENERGY } from './energy';
import { PLAIN_COMBAT_RULES, TEST_COMBAT_RULES_DATA } from './fixtures';
import { type CombatRulesData, type SkillData, type StatBlockData } from './types';

const SOUND: StatBlockData = {
  hp: 500,
  atk: 40,
  def: 20,
  haste: 100,
  critChance: 0.1,
  critDamageAmp: 0.5,
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
    expect(stats.atk.eq(40)).toBe(true);
    expect(stats.def.eq(20)).toBe(true);
    expect(stats.haste).toBe(100);
    expect(stats.critChance).toBe(0.1);
    expect(stats.critDamageAmp).toBe(0.5);
  });

  it('defaults every optional stat to nothing, except accuracy which defaults to certainty', () => {
    // Which is what lets a Monster's stat block stay six lines instead of twenty-three: a stat
    // is mentioned only when it is part of the character's identity.
    const stats = toCombatStats(SOUND);

    expect(stats.recovery.eq(0)).toBe(true);
    expect(stats.attackSpeed).toBe(0);
    expect(stats.critDamageResist).toBe(0);
    expect(stats.critBlock).toBe(0);
    expect(stats.energyRegen).toBe(0);
    expect(stats.lifeLeech).toBe(0);
    expect(stats.insight).toBe(0);
    expect(stats.tenacity).toBe(0);
    expect(stats.physicalPierce).toBe(0);
    expect(stats.magicPierce).toBe(0);
    expect(stats.physicalResist).toBe(0);
    expect(stats.magicResist).toBe(0);
    expect(stats.healthRegen).toBe(0);
    expect(stats.receivedHealing).toBe(0);
    expect(stats.dodge).toBe(0);
    expect(stats.accuracy).toBe(1);
  });

  it('accepts string quantities so late content can exceed float64', () => {
    const stats = toCombatStats({ ...SOUND, hp: '1.5e+40', atk: '2e+20', recovery: '3e+18' });

    expect(stats.hp.eq('1.5e+40')).toBe(true);
    expect(stats.atk.eq('2e+20')).toBe(true);
    expect(stats.recovery.eq('3e+18')).toBe(true);
  });

  it.each([0, -1, -1000])('floors HP at 1 rather than accepting %p', (hp) => {
    // Zero HP means dead before the first tick, which yields a battle log nobody can read.
    expect(toCombatStats({ ...SOUND, hp }).hp.eq(1)).toBe(true);
  });

  it('floors attack, defence and recovery at zero', () => {
    const stats = toCombatStats({ ...SOUND, atk: -50, def: -50, recovery: -50 });

    expect(stats.atk.eq(0)).toBe(true);
    expect(stats.def.eq(0)).toBe(true);
    expect(stats.recovery.eq(0)).toBe(true);
  });

  it.each([0, -1, Number.NaN, Infinity])('clamps an unusable haste of %p up to 1', (haste) => {
    // A combatant that cannot fill its gauge never acts, and the simulation would spin until it
    // hit the tick cap waiting for a turn that can never come.
    expect(toCombatStats({ ...SOUND, haste }).haste).toBe(1);
  });

  it('caps haste at the gauge threshold', () => {
    // Above the threshold a combatant would bank more than one action per tick, and turn
    // ordering — which resolves each ready combatant exactly once per tick — would drop turns.
    expect(toCombatStats({ ...SOUND, haste: ATB_THRESHOLD * 5 }).haste).toBe(ATB_THRESHOLD);
  });

  it('bounds attack speed by the gauge threshold too', () => {
    // It is added to haste before the clamp, so an unbounded value here would breach the
    // scheduling guard by the back door.
    expect(toCombatStats({ ...SOUND, attackSpeed: ATB_THRESHOLD * 3 }).attackSpeed).toBe(
      ATB_THRESHOLD,
    );
    expect(toCombatStats({ ...SOUND, attackSpeed: -20 }).attackSpeed).toBe(0);
  });

  it.each([
    { label: 'below zero', critChance: -0.5, expected: 0 },
    { label: 'above one', critChance: 4, expected: 1 },
    { label: 'not a number', critChance: Number.NaN, expected: 0 },
  ])('clamps a crit chance $label', ({ critChance, expected }) => {
    expect(toCombatStats({ ...SOUND, critChance }).critChance).toBe(expected);
  });

  it('floors crit amplification and its resist at zero rather than at one', () => {
    // A point value, not a multiplier: a crit is worth `1 + max(amp - resist, 0)`, so zero is
    // "a crit does nothing extra" and a negative would be a critical hit that hurt less.
    expect(toCombatStats({ ...SOUND, critDamageAmp: -0.5 }).critDamageAmp).toBe(0);
    expect(toCombatStats({ ...SOUND, critDamageAmp: Number.NaN }).critDamageAmp).toBe(0);
    expect(toCombatStats({ ...SOUND, critDamageResist: -2 }).critDamageResist).toBe(0);
  });

  it('caps penetration below total, so a defensive stat can never be erased', () => {
    const stats = toCombatStats({ ...SOUND, physicalPierce: 5, magicPierce: 1 });

    expect(stats.physicalPierce).toBe(MAX_PENETRATION);
    expect(stats.magicPierce).toBe(MAX_PENETRATION);
    expect(MAX_PENETRATION).toBeLessThan(1);
  });

  it('caps resist below total, because an immune combatant is a battle that never ends', () => {
    // The termination guard, arriving from a third direction after the hit-chance floor and the
    // penetration cap. Resist multiplies the result, so unlike `def` it can reach zero.
    const stats = toCombatStats({ ...SOUND, physicalResist: 5, magicResist: 1 });

    expect(stats.physicalResist).toBe(MAX_RESIST);
    expect(stats.magicResist).toBe(MAX_RESIST);
    expect(MAX_RESIST).toBeLessThan(1);
  });

  it('allows accuracy above certainty but not without limit', () => {
    // Above 1 on purpose: hit chance is accuracy minus dodge, so an accuracy capped at certainty
    // could never answer an evasion build.
    expect(toCombatStats({ ...SOUND, accuracy: 1.4 }).accuracy).toBe(1.4);
    expect(toCombatStats({ ...SOUND, accuracy: 99 }).accuracy).toBe(MAX_ACCURACY);
    expect(MAX_ACCURACY).toBeGreaterThan(1);
  });

  it('bounds energy regen by the bar it fills', () => {
    // A regen above the bar means "charged every turn regardless", which is a one-turn cooldown
    // wearing a meter's clothes. The clamp is what stops a damaged stat block saying that.
    expect(toCombatStats({ ...SOUND, energyRegen: 12 }).energyRegen).toBe(12);
    expect(toCombatStats({ ...SOUND, energyRegen: 4000 }).energyRegen).toBe(MAX_ENERGY);
    expect(toCombatStats({ ...SOUND, energyRegen: -5 }).energyRegen).toBe(0);
    expect(toCombatStats({ ...SOUND, energyRegen: Number.NaN }).energyRegen).toBe(0);
  });
});

describe('applyRowBonus', () => {
  const rows = {
    frontDefence: 1.05,
    frontCritDamageResist: 0.05,
    backAttack: 1.05,
    backCritDamageAmp: 0.05,
  };

  // Compared numerically rather than with `.eq()`. The bonus is a float multiplier, so 15 × 1.05
  // lands on 15.749999999999998 — which is exactly right for damage and exactly wrong for an
  // equality assertion. What matters here is which stat moved, not the last bit of it.
  const near = (value: Numeric, expected: number, label: string): void => {
    expect(value.toNumber(), label).toBeCloseTo(expected, 10);
  };

  it('sharpens the front rank: more defence, and more answer to a crit', () => {
    const stats = applyRowBonus(toCombatStats(SOUND), 'front', rows);

    near(stats.def, 21, 'def');
    expect(stats.critDamageResist).toBeCloseTo(0.05, 10);
  });

  it('sharpens the back rank: more attack, and more crit damage', () => {
    const stats = applyRowBonus(toCombatStats(SOUND), 'back', rows);

    near(stats.atk, 42, 'atk');
    expect(stats.critDamageAmp).toBeCloseTo(0.55, 10);
  });

  it('adds the crit halves as points rather than multiplying them', () => {
    // A percentage on a point value pays nothing at all to a combatant sitting at zero, which
    // is most of them — the failure mode that makes this worth its own assertion.
    const blank = applyRowBonus(toCombatStats({ ...SOUND, critDamageAmp: 0 }), 'back', rows);

    expect(blank.critDamageAmp).toBeCloseTo(0.05, 10);
  });

  it("leaves the other rank's half of the deal alone", () => {
    const back = applyRowBonus(toCombatStats(SOUND), 'back', rows);
    const front = applyRowBonus(toCombatStats(SOUND), 'front', rows);

    near(back.def, 20, 'back def');
    expect(back.critDamageResist).toBe(0);
    near(front.atk, 40, 'front atk');
    expect(front.critDamageAmp).toBe(0.5);
  });
});

describe('toSkill', () => {
  it('defaults everything a terse kit leaves out', () => {
    const skill = toSkill(STRIKE);

    expect(skill.ultimate).toBe(false);
    expect(skill.cooldown).toBe(0);
    expect(skill.condition).toEqual({ kind: 'always' });
    expect(skill.priority).toBe(1);
  });

  it('carries an authored cooldown and condition through', () => {
    const skill = toSkill({
      ...STRIKE,
      cooldown: 45,
      condition: { kind: 'ally-hurt', fraction: 0.8 },
      priority: 3,
    });

    expect(skill.ultimate).toBe(false);
    expect(skill.cooldown).toBe(45);
    expect(skill.condition).toEqual({ kind: 'ally-hurt', fraction: 0.8 });
    expect(skill.priority).toBe(3);
  });

  it('discards a cooldown authored on an ultimate, so the two meters stay exclusive', () => {
    // The bar *is* the cooldown. A skill carrying both would make "when does this come up" the
    // product of a meter and a timer, which is the unreadability energy replaced MP to fix.
    const skill = toSkill({ ...STRIKE, ultimate: true, cooldown: 45 });

    expect(skill.ultimate).toBe(true);
    expect(skill.cooldown).toBe(0);
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
      { id: 'ruk', name: 'Ruk', faction: 'monster', stats: { ...SOUND, physicalPierce: 0.8 } },
      tight,
      'front',
    );

    expect(shredder.stats.physicalPierce).toBe(0.25);
  });

  it('caps resist against the authored ceiling rather than the module’s own', () => {
    // Same trap as penetration, and a worse failure: a resist that is not clamped where content
    // says it should be is a combatant that cannot be damaged.
    const tight = toCombatRules({ ...TEST_COMBAT_RULES_DATA, maxResist: 0.2 });
    const wall = toCombatant(
      { id: 'golem', name: 'Golem', faction: 'monster', stats: { ...SOUND, physicalResist: 0.8 } },
      tight,
      'front',
    );

    expect(wall.stats.physicalResist).toBe(0.2);
  });

  it('applies the row bonus as it places the combatant', () => {
    const front = toCombatant(
      { id: 'a', name: 'A', faction: 'human', stats: SOUND },
      toCombatRules(TEST_COMBAT_RULES_DATA),
      'front',
    );

    expect(front.stats.def.eq(21)).toBe(true);
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
