// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import v1 from './fixtures/v1.json';
import v2 from './fixtures/v2.json';
import { loadSave } from './load';
import { type RepairOptions } from './serialize';
import { SAVE_VERSION } from './version';

/**
 * Every historical save version keeps a real fixture here, and this suite migrates all of
 * them to current.
 *
 * This is the test that makes the save layer trustworthy. It catches the migration written
 * three months ago and never exercised since — the one that breaks silently and costs a
 * returning player their run.
 *
 * Fixtures are imported statically rather than scanned off disk: the spec then has no
 * dependency on the working directory or on the test runner's module resolution, and it
 * type-checks. Registering a new fixture is two lines, and the coverage assertion below
 * fails if you bump `SAVE_VERSION` and forget.
 */
const FIXTURES: ReadonlyMap<number, unknown> = new Map<number, unknown>([
  [1, v1],
  [2, v2],
]);

const OPTIONS: RepairOptions = { fallbackSeed: 1, nowMs: 4_000_000_000_000 };
const entries = [...FIXTURES.entries()];

describe('save fixtures', () => {
  it('has a fixture registered for every version up to current', () => {
    const missing: number[] = [];
    for (let version = 1; version <= SAVE_VERSION; version++) {
      if (!FIXTURES.has(version)) {
        missing.push(version);
      }
    }

    expect(missing).toEqual([]);
  });

  it.each(entries)('v%i migrates to current without issues', (_version, fixture) => {
    const result = loadSave(fixture, OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.issues).toEqual([]);
    expect(result.state.version).toBe(SAVE_VERSION);
  });

  it.each(entries)('v%i produces a usable state', (_version, fixture) => {
    const { state } = loadSave(fixture, OPTIONS);

    expect(state.gold.mantissa).not.toBeNaN();
    expect(state.goldPerSec.mantissa).not.toBeNaN();
    expect(Number.isFinite(state.lastTickAt)).toBe(true);
    expect(Number.isInteger(state.rng.calls)).toBe(true);
    expect(state.rng.calls).toBeGreaterThanOrEqual(0);
    expect(state.stage).toBeGreaterThanOrEqual(1);
    expect(state.battleCount).toBeGreaterThanOrEqual(0);
  });
});

describe('v1 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    // Pinned so a change in parsing or serialisation shows up as a failing assertion
    // rather than as a quietly different save.
    const { state } = loadSave(v1, OPTIONS);

    expect(state.gold.eq('1.2345e+18')).toBe(true);
    expect(state.goldPerSec.eq('250')).toBe(true);
    expect(state.lastTickAt).toBe(1753574400000);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
  });

  it('preserves a gold value past float64 exact-integer range', () => {
    const { state } = loadSave(v1, OPTIONS);

    expect(state.gold.toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });

  it('starts a pre-combat save at the first stage rather than discarding it', () => {
    // The whole point of the migration chain: a save written before combat existed keeps its
    // gold and its RNG position, and simply joins the fight at the beginning.
    const { state } = loadSave(v1, OPTIONS);

    expect(state.stage).toBe(1);
    expect(state.battleCount).toBe(0);
    expect(state.gold.eq('1.2345e+18')).toBe(true);
  });
});

describe('v2 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    const { state } = loadSave(v2, OPTIONS);

    expect(state.gold.eq('8.675309e+21')).toBe(true);
    expect(state.stage).toBe(5);
    expect(state.battleCount).toBe(143);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
  });
});
