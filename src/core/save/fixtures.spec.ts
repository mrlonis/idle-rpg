// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { formationMembers, PARTY_SIZE } from '../state';
import { TEST_CHARACTERS, TEST_LEVEL_CURVE } from './fixtures/content';
import v0 from './fixtures/v0.json';
import v1 from './fixtures/v1.json';
import { loadSave } from './load';
import { type RepairOptions } from './serialize';
import { SAVE_VERSION } from './version';

/**
 * Every save version keeps a representative fixture here, and this suite migrates all of
 * them to current.
 *
 * This is the test that makes the save layer trustworthy. It catches the migration written
 * three months ago and never exercised since — the one that breaks silently and costs a
 * returning player their run.
 *
 * **There are two, and the second one is the point.** The chain was re-based to a v0 baseline while
 * the game was still pre-release — see [saves](../../../docs/saves.md) — leaving this file with a
 * single fixture and nothing to walk. Milestone 12 added gear and with it the v0 → v1 migration, so
 * the v0 fixture now exercises the chain rather than only the repair pass, and the v1 fixture pins
 * what a current save actually looks like. The coverage assertion below is what caught the missing
 * fixture the moment `SAVE_VERSION` moved, which is exactly the job it was left here to do.
 *
 * Fixtures are registered statically rather than scanned off disk: the spec then has no
 * dependency on the working directory or on the test runner's module resolution, and it
 * type-checks. Registering a new fixture is two lines.
 */
const FIXTURES: ReadonlyMap<number, unknown> = new Map<number, unknown>([
  [0, v0],
  [1, v1],
]);

const OPTIONS: RepairOptions = {
  fallbackSeed: 1,
  nowMs: 4_000_000_000_000,
  characters: TEST_CHARACTERS,
  levelCurve: TEST_LEVEL_CURVE,
};
const entries = [...FIXTURES.entries()];

describe('save fixtures', () => {
  it('has a fixture registered for every version up to current', () => {
    const missing: number[] = [];
    for (let version = 0; version <= SAVE_VERSION; version++) {
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

    expect(state.wallet.gold.mantissa).not.toBeNaN();
    expect(state.rates.gold.mantissa).not.toBeNaN();
    expect(Number.isFinite(state.lastTickAt)).toBe(true);
    expect(Number.isInteger(state.rng.calls)).toBe(true);
    expect(state.rng.calls).toBeGreaterThanOrEqual(0);
    expect(state.chapter).toBeGreaterThanOrEqual(1);
    expect(state.stage).toBeGreaterThanOrEqual(1);
    expect(state.clearedStages).toBeGreaterThanOrEqual(0);
    expect(state.battleCount).toBeGreaterThanOrEqual(0);
    expect(state.pity).toBeGreaterThanOrEqual(0);
    expect(formationMembers(state.formation).length).toBeLessThanOrEqual(PARTY_SIZE);
  });
});

describe('v0 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    // Pinned so a change in parsing or serialisation shows up as a failing assertion
    // rather than as a quietly different save.
    const { state } = loadSave(v0, OPTIONS);

    expect(state.wallet.gold.eq('8.675309e+21')).toBe(true);
    expect(state.wallet.summons.eq('350')).toBe(true);
    expect(state.wallet.spark.eq('12')).toBe(true);
    expect(state.rates.gold.eq('250')).toBe(true);
    expect(state.rates.essence.eq('0.8')).toBe(true);
    expect(state.lastTickAt).toBe(1753574400000);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
    expect(state.pity).toBe(37);
    expect(state.pullCount).toBe(139);
  });

  it('preserves a gold value past float64 exact-integer range', () => {
    const { state } = loadSave(v0, OPTIONS);

    expect(state.wallet.gold.toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });

  it('keeps the position as a chapter and a stage within it', () => {
    // Not a linear index. A fixture parked on chapter 2 is what would catch a decoder that read
    // the pair back as one number, which is the shape of bug milestone 11 made possible.
    const { state } = loadSave(v0, OPTIONS);

    expect(state.chapter).toBe(2);
    expect(state.stage).toBe(14);
    expect(state.clearedStages).toBe(63);
    expect(state.battleCount).toBe(143);
  });

  it('round-trips the roster, keeping rarity, level and spare copies', () => {
    const { state } = loadSave(v0, OPTIONS);

    expect(state.roster).toEqual([
      { defId: 'alpha', rarity: 4, level: 46, copies: 11, gear: {} },
      { defId: 'beta', rarity: 2, level: 22, copies: 3, gear: {} },
      { defId: 'gamma', rarity: 3, level: 31, copies: 6, gear: {} },
    ]);
  });

  it('keeps the party in the slot order it was saved in', () => {
    // Slot order breaks ties in ATB turn order, so re-sorting it here would silently change how
    // every one of that player's battles resolves.
    const { state } = loadSave(v0, OPTIONS);

    expect(state.formation).toEqual({ front: ['gamma', 'alpha'], back: ['beta'] });
  });
});
