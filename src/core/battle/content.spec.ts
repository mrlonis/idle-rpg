// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { ATB_THRESHOLD } from './clock';
import { ticksPerAction, toCombatant, toCombatStats, toGoldReward } from './content';
import { type StatBlockData } from './types';

const SOUND: StatBlockData = {
  hp: 500,
  atk: 40,
  def: 20,
  spd: 100,
  critChance: 0.1,
  critMultiplier: 1.5,
};

describe('toCombatStats', () => {
  it('parses a well-formed stat block unchanged', () => {
    const stats = toCombatStats(SOUND);

    expect(stats.hp.eq(500)).toBe(true);
    expect(stats.atk.eq(40)).toBe(true);
    expect(stats.def.eq(20)).toBe(true);
    expect(stats.spd).toBe(100);
    expect(stats.critChance).toBe(0.1);
    expect(stats.critMultiplier).toBe(1.5);
  });

  it('accepts string quantities so late content can exceed float64', () => {
    const stats = toCombatStats({ ...SOUND, hp: '1.5e+40', atk: '2e+20' });

    expect(stats.hp.eq('1.5e+40')).toBe(true);
    expect(stats.atk.eq('2e+20')).toBe(true);
  });

  it.each([0, -1, -1000])('floors HP at 1 rather than accepting %p', (hp) => {
    // Zero HP means dead before the first tick, which yields a battle log nobody can read.
    expect(toCombatStats({ ...SOUND, hp }).hp.eq(1)).toBe(true);
  });

  it('floors ATK and DEF at zero', () => {
    const stats = toCombatStats({ ...SOUND, atk: -50, def: -50 });

    expect(stats.atk.eq(0)).toBe(true);
    expect(stats.def.eq(0)).toBe(true);
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
});

describe('toCombatant', () => {
  it('carries identity through and parses the stats', () => {
    const combatant = toCombatant({ id: 'slime', name: 'Slime', stats: SOUND });

    expect(combatant.id).toBe('slime');
    expect(combatant.name).toBe('Slime');
    expect(combatant.stats.hp.eq(500)).toBe(true);
  });
});

describe('toGoldReward', () => {
  it('parses numbers and strings', () => {
    expect(toGoldReward(250).eq(250)).toBe(true);
    expect(toGoldReward('1.5e+18').eq('1.5e+18')).toBe(true);
  });

  it.each([-100, Number.NaN, Infinity])('treats an unusable reward of %p as nothing', (raw) => {
    expect(toGoldReward(raw).eq(0)).toBe(true);
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
