import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { newGame } from '../state';
import { loadSave, loadSaveText } from './load';
import { type RepairOptions, toSaveData } from './serialize';
import { SAVE_VERSION } from './version';

const T0 = 1_700_000_000_000;
const OPTIONS: RepairOptions = { fallbackSeed: 777, nowMs: T0 };

describe('loadSave', () => {
  it('round-trips a saved state', () => {
    const original = { ...newGame({ seed: 12345, nowMs: T0 }), gold: num('5e+20') };

    const result = loadSave(toSaveData(original), OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.issues).toEqual([]);
    expect(result.state.gold.eq('5e+20')).toBe(true);
  });

  it.each([
    { label: 'null', raw: null },
    { label: 'undefined', raw: undefined },
  ])('starts a fresh run for a $label save, with no fatal error', ({ raw }) => {
    // A first launch is not an error condition.
    const result = loadSave(raw, OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.state.gold.toString()).toBe('0');
    expect(result.state.rng.seed).toBe(777);
  });

  it('never throws, whatever it is handed', () => {
    for (const raw of ['nonsense', 42, [], { version: 'x' }, { version: 999 }, { gold: {} }]) {
      expect(() => loadSave(raw, OPTIONS)).not.toThrow();
    }
  });

  it('reports a fatal error and a fresh run for an unmigratable save', () => {
    const result = loadSave({ version: 0 }, OPTIONS);

    expect(result.fatal).toBeDefined();
    expect(result.state.gold.toString()).toBe('0');
  });

  it('flags a future-versioned save as fatal so the caller does not overwrite it', () => {
    // The player downgraded the app. Their save is intact and becomes readable again on
    // update — clobbering it here would destroy a perfectly good run.
    const result = loadSave({ version: SAVE_VERSION + 5 }, OPTIONS);

    expect(result.fatal).toMatch(/newer than this build supports/);
  });

  it('recovers a damaged-but-migratable save instead of discarding it', () => {
    const result = loadSave({ version: SAVE_VERSION, gold: 'garbage', rng: {} }, OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.state.gold.toString()).toBe('0');
  });

  it('keeps the undamaged fields of a partly damaged save', () => {
    const result = loadSave(
      {
        version: SAVE_VERSION,
        gold: '4e+10',
        goldPerSec: 'broken',
        lastTickAt: T0 - 1000,
        rng: { seed: 5, calls: 3 },
      },
      OPTIONS,
    );

    expect(result.state.gold.eq('4e+10')).toBe(true);
    expect(result.state.rng).toEqual({ seed: 5, calls: 3 });
    expect(result.issues.map((issue) => issue.field)).toEqual(['goldPerSec']);
  });
});

describe('loadSaveText', () => {
  it('parses and loads valid save text', () => {
    const original = { ...newGame({ seed: 1, nowMs: T0 }), gold: num('42') };

    const result = loadSaveText(JSON.stringify(toSaveData(original)), OPTIONS);

    expect(result.state.gold.toString()).toBe('42');
    expect(result.fatal).toBeUndefined();
  });

  it.each([
    { label: 'null', text: null },
    { label: 'undefined', text: undefined },
    { label: 'empty', text: '' },
    { label: 'whitespace', text: '   ' },
  ])('starts a fresh run for $label text without a fatal error', ({ text }) => {
    const result = loadSaveText(text, OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.state.gold.toString()).toBe('0');
  });

  it('reports malformed JSON as fatal rather than throwing', () => {
    const result = loadSaveText('{ not json', OPTIONS);

    expect(result.fatal).toMatch(/not valid JSON/);
    expect(result.state.gold.toString()).toBe('0');
  });
});
