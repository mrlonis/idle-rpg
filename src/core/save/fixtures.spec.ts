// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { CAMPAIGN_FORMATION, formationIn, formationMembers, PARTY_SIZE } from '../state';
import { TEST_CHARACTERS, TEST_LEVEL_CURVE } from './fixtures/content';
import v0 from './fixtures/v0.json';
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
 * **There is one, for the second time.** Seven fixtures had accumulated as the chain grew from the
 * v0 baseline to v6; all six migrations were folded back into v0 — see
 * [saves](../../../docs/saves.md) — leaving this file with a single fixture and nothing to walk.
 *
 * **The coverage assertion below is what keeps this file worth having while it has nothing to
 * chain.** It is vacuous at a one-entry baseline, and it is exactly what fired the moment
 * `SAVE_VERSION` first moved off zero — which is when nobody is thinking about fixtures.
 *
 * **The fixture stores values a default would not produce**, which is what separates "the field was
 * decoded" from "the field defaulted": a mid-cycle `legendaryPity`, a gear loadout, a mint counter
 * deliberately ahead of the bag, a part-climbed tower, and a **retired achievement track** alongside
 * a live one — plus a retired *tower* alongside a live one, which is the same distinction one level
 * down. Those two are the one thing about a keyed ledger a shape check would not otherwise reach,
 * since a build that stops shipping a track or a tower has to keep the entry rather than drop it:
 * dropping it re-pays every award on the track, and costs a returning player a hundred floors.
 *
 * Fixtures are registered statically rather than scanned off disk: the spec then has no
 * dependency on the working directory or on the test runner's module resolution, and it
 * type-checks. Registering a new fixture is two lines.
 */
const FIXTURES: ReadonlyMap<number, unknown> = new Map<number, unknown>([[0, v0]]);

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
    expect(state.legendaryPity).toBeGreaterThanOrEqual(0);
    for (const formation of Object.values(state.formations)) {
      expect(formationMembers(formation).length).toBeLessThanOrEqual(PARTY_SIZE);
    }
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
    expect(state.wallet.alloy.eq('2450')).toBe(true);
    expect(state.rates.gold.eq('250')).toBe(true);
    expect(state.rates.essence.eq('0.8')).toBe(true);
    expect(state.lastTickAt).toBe(1753574400000);
    expect(state.rng).toEqual({ seed: 3735928559, calls: 417 });
    expect(state.pity).toBe(37);
    expect(state.pullCount).toBe(139);
  });

  it('decodes a part-climbed tower, and keeps one this build no longer ships', () => {
    // Two things at once, both of which an empty record would hide: that the field is read at all,
    // and that an unknown tower id survives — a crew and a climb filed under a tower a later build
    // dropped cost two short arrays and one integer, and dropping them costs a player the climb.
    const { state } = loadSave(v0, OPTIONS);

    expect(state.towers['tower-human']).toBe(36);
    expect(state.towers['tower-retired']).toBe(12);
  });

  it('decodes a legendary cycle already part way through', () => {
    // A fixture storing the empty value could not tell a decoder that reads the field from one that
    // quietly defaults it — which is the one distinction a fixture for an optional counter exists to
    // make. Every field this save carries is now a v0 field, so that trap applies to all of them.
    expect(loadSave(v0, OPTIONS).state.legendaryPity).toBe(4);
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

  it('round-trips the roster, keeping rarity, level, spare copies and what is worn', () => {
    const { state } = loadSave(v0, OPTIONS);

    expect(state.roster).toEqual([
      {
        defId: 'alpha',
        rarity: 6,
        level: 46,
        copies: 11,
        gear: { head: 'g1', chest: 'g2', boots: 'g4' },
      },
      { defId: 'beta', rarity: 4, level: 22, copies: 3, gear: { arms: 'g3' } },
      { defId: 'gamma', rarity: 5, level: 31, copies: 6, gear: {} },
    ]);
  });

  it('keeps a claim count for a track this build no longer ships', () => {
    // The opposite of how the roster treats an unknown character. A claim count costs one integer,
    // and dropping it is what would re-pay every award on that track if it ever came back.
    const { state } = loadSave(v0, OPTIONS);

    expect(state.achievements).toEqual({ 'stages-cleared': 9, 'retired-track': 4 });
  });

  it('keeps the party in the slot order it was saved in', () => {
    // Slot order breaks ties in ATB turn order, so re-sorting it here would silently change how
    // every one of that player's battles resolves.
    const { state } = loadSave(v0, OPTIONS);

    expect(formationIn(state.formations, CAMPAIGN_FORMATION)).toEqual({
      front: ['gamma', 'alpha'],
      back: ['beta'],
    });
  });

  it('keeps every crew, not just the campaign’s', () => {
    // ⚠️ Why the fixture carries a second crew at all. A book holding only `campaign` would decode
    // identically against an implementation that read that one key and dropped the rest — which is
    // exactly the distinction a fixture exists to make, and exactly the bug that would strand
    // seven tower crews the first time a save round-tripped.
    const { state } = loadSave(v0, OPTIONS);

    expect(formationIn(state.formations, 'tower:test')).toEqual({
      front: ['beta'],
      back: ['gamma'],
    });
  });
});
