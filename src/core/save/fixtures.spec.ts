import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSave } from './load';
import { type RepairOptions } from './serialize';
import { SAVE_VERSION } from './version';

/**
 * Every historical save version keeps a real fixture here, and this suite migrates all of
 * them to current.
 *
 * This is the test that makes the save layer trustworthy. It catches the migration written
 * three months ago and never exercised since — the one that breaks silently and costs a
 * returning player their run. Add a fixture whenever `SAVE_VERSION` is bumped; the
 * coverage assertion below fails if you forget.
 */
const FIXTURE_DIR = join(import.meta.dirname, 'fixtures');
const OPTIONS: RepairOptions = { fallbackSeed: 1, nowMs: 4_000_000_000_000 };

function fixtureFiles(): string[] {
  return readdirSync(FIXTURE_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort();
}

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURE_DIR, name), 'utf8'));
}

describe('save fixtures', () => {
  const files = fixtureFiles();

  it('has a fixture for every version up to current', () => {
    const present = new Set(files.map((name) => name.replace(/^v(\d+)\.json$/, '$1')));
    const missing: number[] = [];
    for (let version = 1; version <= SAVE_VERSION; version++) {
      if (!present.has(String(version))) {
        missing.push(version);
      }
    }

    expect(missing).toEqual([]);
  });

  it.each(files)('%s migrates to current without issues', (name) => {
    const result = loadSave(readFixture(name), OPTIONS);

    expect(result.fatal).toBeUndefined();
    expect(result.issues).toEqual([]);
    expect(result.state.version).toBe(SAVE_VERSION);
  });

  it.each(files)('%s produces a usable state', (name) => {
    const { state } = loadSave(readFixture(name), OPTIONS);

    expect(state.gold.mantissa).not.toBeNaN();
    expect(state.goldPerSec.mantissa).not.toBeNaN();
    expect(Number.isFinite(state.lastTickAt)).toBe(true);
    expect(Number.isInteger(state.rng.calls)).toBe(true);
    expect(state.rng.calls).toBeGreaterThanOrEqual(0);
  });
});

describe('v1 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    // Pinned so a change in parsing or serialisation shows up as a failing assertion
    // rather than as a quietly different save.
    const { state } = loadSave(readFixture('v1.json'), OPTIONS);

    expect(state.gold.eq('1.2345e+18')).toBe(true);
    expect(state.goldPerSec.eq('250')).toBe(true);
    expect(state.lastTickAt).toBe(1753574400000);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
  });

  it('preserves a gold value past float64 exact-integer range', () => {
    const { state } = loadSave(readFixture('v1.json'), OPTIONS);

    expect(state.gold.toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });
});
