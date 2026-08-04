// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { clampEnergy, isCharged, MAX_ENERGY, toEnergyRules } from './energy';

describe('clampEnergy', () => {
  it('holds a total inside the bar', () => {
    expect(clampEnergy(0)).toBe(0);
    expect(clampEnergy(42)).toBe(42);
    expect(clampEnergy(MAX_ENERGY)).toBe(MAX_ENERGY);
  });

  it('caps an overfilled bar rather than banking the overflow', () => {
    // Banking it would make a full bar worth more than a full bar, so two ultimates could come
    // out of one charge and the meter would stop being readable off the bar.
    expect(clampEnergy(MAX_ENERGY + 40)).toBe(MAX_ENERGY);
  });

  it('treats a negative or damaged total as empty', () => {
    // Non-finite falls to the floor rather than the ceiling, matching every other clamp in the
    // parsing layer: damaged input should never resolve into the *strongest* reading of itself.
    expect(clampEnergy(-1)).toBe(0);
    expect(clampEnergy(Number.NaN)).toBe(0);
    expect(clampEnergy(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampEnergy(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('isCharged', () => {
  it('is the one condition an ultimate has', () => {
    expect(isCharged(MAX_ENERGY - 1)).toBe(false);
    expect(isCharged(MAX_ENERGY)).toBe(true);
  });
});

describe('toEnergyRules', () => {
  it('carries authored gains through', () => {
    expect(toEnergyRules({ onHit: 20, onHurt: 10, onHeal: 15 })).toEqual({
      onHit: 20,
      onHurt: 10,
      onHeal: 15,
    });
  });

  it('caps a single gain at the bar, so no one event charges an ultimate outright', () => {
    // A gain larger than the bar makes the meter a one-turn cooldown wearing a meter's clothes.
    const rules = toEnergyRules({ onHit: 5000, onHurt: 10, onHeal: 15 });

    expect(rules.onHit).toBe(MAX_ENERGY);
  });

  it('floors every gain at zero, so filling the bar is monotone', () => {
    // ⚠️ Not cosmetic. A negative gain would let acting push an ultimate *further* away, and a
    // combatant could then be driven to a state it can never leave — which is the shape of an
    // unbounded fight arriving through the meter rather than through the damage formula.
    const rules = toEnergyRules({ onHit: -30, onHurt: Number.NaN, onHeal: -0.5 });

    expect(rules).toEqual({ onHit: 0, onHurt: 0, onHeal: 0 });
  });
});
