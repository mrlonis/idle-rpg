// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { newGame } from '../state';
import { fromSaveData, toSaveData, type RepairOptions } from './serialize';
import { SAVE_VERSION } from './version';

const T0 = 1_700_000_000_000;
const OPTIONS: RepairOptions = { fallbackSeed: 0xabcdef, nowMs: T0 };

function issueFields(raw: unknown): string[] {
  return fromSaveData(raw, OPTIONS).issues.map((issue) => issue.field);
}

describe('toSaveData', () => {
  it('encodes Numeric fields as strings and stamps the current version', () => {
    const state = { ...newGame({ seed: 99, nowMs: T0 }), gold: num('1.5e+25') };

    expect(toSaveData(state)).toEqual({
      version: SAVE_VERSION,
      gold: '1.5e+25',
      goldPerSec: '1',
      lastTickAt: T0,
      rng: { seed: 99, calls: 0 },
      stage: 1,
      battleCount: 0,
    });
  });

  it('produces JSON-serialisable output', () => {
    const state = { ...newGame({ seed: 99, nowMs: T0 }), gold: num('1.5e+25') };

    expect(() => JSON.stringify(toSaveData(state))).not.toThrow();
  });
});

describe('round-trip', () => {
  it('preserves state exactly through save and load', () => {
    const original = {
      ...newGame({ seed: 0xdeadbeef, nowMs: T0 }),
      gold: num('9.87654321e+42'),
      goldPerSec: num('1234.5'),
      rng: { seed: 0xdeadbeef, calls: 8321 },
    };

    const { state, issues } = fromSaveData(
      JSON.parse(JSON.stringify(toSaveData(original))),
      OPTIONS,
    );

    expect(issues).toEqual([]);
    expect(state.gold.eq(original.gold)).toBe(true);
    expect(state.goldPerSec.eq(original.goldPerSec)).toBe(true);
    expect(state.lastTickAt).toBe(original.lastTickAt);
    expect(state.rng).toEqual(original.rng);
  });

  it('preserves magnitudes past float64 exact-integer range', () => {
    const original = { ...newGame({ seed: 1, nowMs: T0 }), gold: num('1.2345e+180') };

    const { state } = fromSaveData(JSON.parse(JSON.stringify(toSaveData(original))), OPTIONS);

    expect(state.gold.toString()).toBe('1.2345e+180');
  });
});

describe('fromSaveData repair', () => {
  it('never throws, whatever it is handed', () => {
    for (const raw of [null, undefined, 'string', 42, [], {}, { gold: {} }, { rng: 'no' }]) {
      expect(() => fromSaveData(raw, OPTIONS)).not.toThrow();
    }
  });

  it.each([
    { label: 'unparseable gold', raw: { gold: 'garbage' }, field: 'gold', expected: '0' },
    { label: 'NaN gold', raw: { gold: Number.NaN }, field: 'gold', expected: '0' },
    { label: 'null gold', raw: { gold: null }, field: 'gold', expected: '0' },
    { label: 'missing gold', raw: {}, field: 'gold', expected: '0' },
    { label: 'object gold', raw: { gold: { v: 1 } }, field: 'gold', expected: '0' },
  ])('defaults $label to 0 and reports it', ({ raw, field, expected }) => {
    const { state, issues } = fromSaveData(raw, OPTIONS);

    expect(state.gold.toString()).toBe(expected);
    expect(issues.map((issue) => issue.field)).toContain(field);
  });

  it('clamps negative gold to zero', () => {
    const { state, issues } = fromSaveData({ gold: '-500' }, OPTIONS);

    expect(state.gold.toString()).toBe('0');
    expect(issues.map((issue) => issue.problem).join()).toMatch(/negative/);
  });

  it('defaults a damaged goldPerSec to 1 rather than stalling progression', () => {
    expect(fromSaveData({ goldPerSec: 'garbage' }, OPTIONS).state.goldPerSec.toString()).toBe('1');
  });

  it('clamps a negative goldPerSec to zero', () => {
    expect(fromSaveData({ goldPerSec: '-3' }, OPTIONS).state.goldPerSec.toString()).toBe('0');
  });

  it.each([
    { label: 'missing', raw: {} },
    { label: 'NaN', raw: { lastTickAt: Number.NaN } },
    { label: 'a string', raw: { lastTickAt: 'yesterday' } },
    { label: 'negative', raw: { lastTickAt: -1 } },
  ])('falls back to now for a lastTickAt that is $label', ({ raw }) => {
    const { state, issues } = fromSaveData(raw, OPTIONS);

    expect(state.lastTickAt).toBe(T0);
    expect(issues.map((issue) => issue.field)).toContain('lastTickAt');
  });

  it('normalises a future lastTickAt to now so the offline window is never negative', () => {
    // The device clock moved backwards since the save was written.
    const { state, issues } = fromSaveData({ lastTickAt: T0 + 86_400_000 }, OPTIONS);

    expect(state.lastTickAt).toBe(T0);
    expect(issues.map((issue) => issue.field)).toContain('lastTickAt');
  });

  it('adopts the fallback seed when the save has none', () => {
    const { state, issues } = fromSaveData({ rng: {} }, OPTIONS);

    expect(state.rng.seed).toBe(0xabcdef);
    expect(issues.map((issue) => issue.field)).toContain('rng.seed');
  });

  it.each([
    { label: 'negative', calls: -5 },
    { label: 'fractional', calls: 1.5 },
    { label: 'NaN', calls: Number.NaN },
    { label: 'a string', calls: '100' },
  ])('resets an rng.calls that is $label to 0', ({ calls }) => {
    const { state } = fromSaveData({ rng: { seed: 1, calls } }, OPTIONS);

    expect(state.rng.calls).toBe(0);
  });

  it('reports no issues for a clean save', () => {
    const clean = toSaveData(newGame({ seed: 5, nowMs: T0 }));

    expect(issueFields(clean)).toEqual([]);
  });

  it('reports every damaged field, not just the first', () => {
    const fields = issueFields({ gold: 'x', goldPerSec: 'y', lastTickAt: 'z', rng: {} });

    expect(fields).toEqual(
      expect.arrayContaining(['gold', 'goldPerSec', 'lastTickAt', 'rng.seed', 'rng.calls']),
    );
  });

  it('always returns a state stamped at the current version', () => {
    expect(fromSaveData({ version: 1 }, OPTIONS).state.version).toBe(SAVE_VERSION);
  });
});
