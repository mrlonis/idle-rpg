// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { formationMembers, PARTY_SIZE } from '../state';
import { TEST_CHARACTERS, TEST_LEVEL_CURVE } from './fixtures/content';
import v1 from './fixtures/v1.json';
import v2 from './fixtures/v2.json';
import v3 from './fixtures/v3.json';
import v4 from './fixtures/v4.json';
import v5 from './fixtures/v5.json';
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
 * Fixtures are registered statically rather than scanned off disk: the spec then has no
 * dependency on the working directory or on the test runner's module resolution, and it
 * type-checks. Registering a new fixture is two lines, and the coverage assertion below
 * fails if you bump `SAVE_VERSION` and forget.
 */
const FIXTURES: ReadonlyMap<number, unknown> = new Map<number, unknown>([
  [1, v1],
  [2, v2],
  [3, v3],
  [4, v4],
  [5, v5],
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

describe('v1 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    // Pinned so a change in parsing or serialisation shows up as a failing assertion
    // rather than as a quietly different save.
    const { state } = loadSave(v1, OPTIONS);

    expect(state.wallet.gold.eq('1.2345e+18')).toBe(true);
    expect(state.rates.gold.eq('250')).toBe(true);
    expect(state.lastTickAt).toBe(1753574400000);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
  });

  it('preserves a gold value past float64 exact-integer range', () => {
    const { state } = loadSave(v1, OPTIONS);

    expect(state.wallet.gold.toNumber()).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
  });

  it('starts a pre-combat save at the first stage rather than discarding it', () => {
    // The whole point of the migration chain: a save written before combat existed keeps its
    // gold and its RNG position, and simply joins the fight at the beginning.
    const { state } = loadSave(v1, OPTIONS);

    expect(state.stage).toBe(1);
    expect(state.battleCount).toBe(0);
    expect(state.wallet.gold.eq('1.2345e+18')).toBe(true);
  });

  it('walks the whole chain to a wallet, keeping gold and inventing nothing else', () => {
    // Two migrations deep. A pre-gacha save has no claim on the currencies that did not exist
    // when it was written, and starting them anywhere but zero would hand out progress.
    const { state } = loadSave(v1, OPTIONS);

    expect(state.wallet.xp.eq(0)).toBe(true);
    expect(state.wallet.essence.eq(0)).toBe(true);
    expect(state.wallet.summons.eq(0)).toBe(true);
    expect(state.wallet.spark.eq(0)).toBe(true);
    expect(state.pity).toBe(0);
  });
});

describe('v2 fixture contents', () => {
  it('loads its recorded values exactly', () => {
    const { state } = loadSave(v2, OPTIONS);

    expect(state.wallet.gold.eq('8.675309e+21')).toBe(true);
    expect(state.stage).toBe(5);
    expect(state.battleCount).toBe(143);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
  });

  it('moves gold and its rate into the wallet without changing either', () => {
    const { state } = loadSave(v2, OPTIONS);

    expect(state.wallet.gold.eq('8.675309e+21')).toBe(true);
    expect(state.rates.gold.eq('250')).toBe(true);
  });

  it('credits nothing on its own, leaving the clear count for the load-time repair', () => {
    // Zero means "nothing credited yet", not "cleared nothing". The first-clear summon bonus did
    // not exist in v2, so a returning player has been paid none of them however far they climbed
    // — seeding the counter from `stage - 1` here would mark all of it settled and close the door
    // on the whole 3,000 crystals. `reconcileClearedStages` re-derives the count from the gold
    // rate and pays every bonus it credits.
    const { state } = loadSave(v2, OPTIONS);

    expect(state.clearedStages).toBe(0);
    expect(state.stage).toBe(5);
  });

  it('arrives with an empty roster, for the load path to seed', () => {
    // A migration cannot know who the starter characters are — `core/` cannot see `data/`. The
    // UI's `grantStarters` fills this in on load, and is idempotent so it doubles as repair.
    const { state } = loadSave(v2, OPTIONS);

    expect(state.roster).toEqual([]);
    expect(state.formation).toEqual({ front: [], back: [] });
  });
});

describe('v3 fixture contents', () => {
  it('loads the whole gacha state exactly', () => {
    const { state } = loadSave(v3, OPTIONS);

    expect(state.wallet.summons.eq('350')).toBe(true);
    expect(state.wallet.spark.eq('12')).toBe(true);
    expect(state.rates.essence.eq('0.8')).toBe(true);
    expect(state.pity).toBe(37);
    expect(state.pullCount).toBe(139);
    expect(state.clearedStages).toBe(4);
  });

  it('round-trips the roster, keeping rarity, level and spare copies', () => {
    const { state } = loadSave(v3, OPTIONS);

    expect(state.roster).toEqual([
      { defId: 'alpha', rarity: 4, level: 46, copies: 11 },
      { defId: 'beta', rarity: 2, level: 22, copies: 3 },
      { defId: 'gamma', rarity: 3, level: 31, copies: 6 },
    ]);
  });

  it('keeps the party in the slot order it was saved in', () => {
    // Slot order breaks ties in ATB turn order, so re-sorting it here would silently change how
    // every one of that player's battles resolves.
    const { state } = loadSave(v3, OPTIONS);

    expect(state.formation).toEqual({ front: ['gamma', 'alpha'], back: ['beta'] });
  });
});
