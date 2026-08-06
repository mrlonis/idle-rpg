// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { newGame, type GameState } from '../state';
import { ascend, nextAscension, pathFor } from './ascend';
import {
  owned,
  TEST_ALPHA,
  TEST_ASCENSION as RULES,
  TEST_BETA,
  TEST_CHARACTERS,
  TEST_DELTA,
  TEST_FACTIONS,
  TEST_GAMMA,
  TEST_ZETA,
} from './fixtures';
import { fullAscensionCost, startRarityIndex } from './rarity';
import { findOwned } from './roster';
import { MAX_RARITY_INDEX } from './types';

const T0 = 1_700_000_000_000;

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 1, nowMs: T0 }), ...overrides };
}

const ascendGamma = (state: GameState) =>
  ascend(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS);

/** Where the fixture ladder puts each tier, so a rung index in a test is readable. */
const ELITE = startRarityIndex('ascended');

describe('pathFor', () => {
  it('reads the ladder off the character’s faction', () => {
    expect(pathFor(TEST_GAMMA, TEST_FACTIONS)).toBe('mortal');
    expect(pathFor(TEST_ZETA, TEST_FACTIONS)).toBe('celestial');
  });

  it('falls back to the mortal ladder for a faction this build no longer ships', () => {
    expect(pathFor({ ...TEST_ALPHA, faction: 'gone' }, TEST_FACTIONS)).toBe('mortal');
  });
});

describe('nextAscension', () => {
  it('quotes the next rung as a count of the character’s own copies', () => {
    const state = run({ roster: [owned(TEST_GAMMA)] });

    // gamma is ascended-tier, so it starts at Elite, and Elite → Elite+ is one copy of itself.
    expect(nextAscension(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBe(1);
  });

  it('quotes the expensive bottom rungs to the tier that has to climb them', () => {
    // The tier gap in one assertion: alpha is common-tier and starts four rungs lower, on the
    // stretch of ladder that is deliberately priced high.
    const state = run({ roster: [owned(TEST_ALPHA), owned(TEST_BETA)] });

    expect(nextAscension(state, 'alpha', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBe(4);
    expect(nextAscension(state, 'beta', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBe(2);
  });

  it('is undefined at the top of the ladder', () => {
    const state = run({
      roster: [{ defId: 'gamma', rarity: MAX_RARITY_INDEX, level: 1, copies: 99, gear: {} }],
    });

    expect(nextAscension(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBeUndefined();
  });

  it('is undefined for a character the player does not own', () => {
    expect(nextAscension(run(), 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBeUndefined();
  });
});

describe('ascend', () => {
  it('climbs a rung and consumes the character’s own copies', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 3)] });

    const result = ascendGamma(state);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'gamma')).toEqual({
        defId: 'gamma',
        gear: {},
        rarity: ELITE + 1,
        level: 1,
        copies: 2,
      });
    }
  });

  it('touches nothing else in the roster', () => {
    // The property the whole rewrite turns on: a rung is paid by one character, so no other
    // entry can lose a copy. This is what used to be four failure modes and a fodder plan.
    const state = run({
      roster: [owned(TEST_GAMMA, 3), owned(TEST_ALPHA, 12), owned(TEST_DELTA, 30)],
    });

    const result = ascendGamma(state);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'alpha')).toEqual(findOwned(state, 'alpha'));
      expect(findOwned(result.state, 'delta')).toEqual(findOwned(state, 'delta'));
    }
  });

  it('never touches the main copy, only spares', () => {
    // The deliberate departure from the genre: a player cannot destroy the character they spent
    // a week levelling by tapping the wrong row, so there is no irreversible-loss confirmation
    // to get wrong — and no roster entry ever disappears, which is what keeps the resonance
    // floor monotonic.
    const state = run({ roster: [owned(TEST_GAMMA, 3)] });

    const result = ascendGamma(state);

    expect(result.ok && findOwned(result.state, 'gamma')).toBeDefined();
    expect(result.ok && findOwned(result.state, 'gamma')?.level).toBe(1);
  });

  it('refuses without enough copies', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 0)] });

    expect(ascendGamma(state)).toEqual({ ok: false, reason: 'insufficient-copies' });
  });

  it('refuses at the top of the ladder', () => {
    const state = run({
      roster: [{ defId: 'gamma', rarity: MAX_RARITY_INDEX, level: 1, copies: 99, gear: {} }],
    });

    expect(ascendGamma(state)).toEqual({ ok: false, reason: 'max-rarity' });
  });

  it('refuses a character the player does not own', () => {
    expect(ascendGamma(run())).toEqual({ ok: false, reason: 'not-owned' });
  });

  it('refuses a character this build no longer ships', () => {
    const state = run({
      roster: [{ defId: 'ghost', rarity: 0, level: 1, copies: 99, gear: {} }],
    });

    expect(ascend(state, 'ghost', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toEqual({
      ok: false,
      reason: 'unknown-character',
    });
  });

  it('consumes nothing at all when it refuses', () => {
    // Checked in full before anything is spent, so a rejected ascension leaves no partial spend
    // to reason about or refund.
    const state = run({ roster: [owned(TEST_GAMMA, 0)] });

    ascendGamma(state);

    expect(findOwned(state, 'gamma')?.copies).toBe(0);
  });

  it('does not mutate the state it is given', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 3)] });

    ascendGamma(state);

    expect(findOwned(state, 'gamma')).toEqual({
      defId: 'gamma',
      gear: {},
      rarity: ELITE,
      level: 1,
      copies: 3,
    });
  });

  it('spends exactly the full climb getting from a tier’s start to the top', () => {
    // `fullAscensionCost` counts the first copy, so the copies *spent* are one fewer. Walking the
    // whole ladder a rung at a time and checking what was consumed is what proves the quoted
    // total and the charged total are the same number.
    const total = fullAscensionCost(RULES, 'celestial', 'ascended');
    const state = run({ roster: [owned(TEST_ZETA, 100)] });

    let current = state;
    for (let rung = startRarityIndex('ascended'); rung < MAX_RARITY_INDEX; rung++) {
      const result = ascend(current, 'zeta', RULES, TEST_CHARACTERS, TEST_FACTIONS);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      current = result.state;
    }

    expect(findOwned(current, 'zeta')?.rarity).toBe(MAX_RARITY_INDEX);
    expect(100 - (findOwned(current, 'zeta')?.copies ?? 0)).toBe(total - 1);
  });

  it('charges a common-tier character more than an ascended-tier one for the same ladder', () => {
    // Every rung costs every character the same, so the difference is exactly the rungs the
    // higher tier never has to climb. Without that, a common-tier character — which a pull
    // produces roughly ten times as often — would max out in a fraction of the time.
    expect(fullAscensionCost(RULES, 'mortal', 'common')).toBeGreaterThan(
      fullAscensionCost(RULES, 'mortal', 'legendary'),
    );
    expect(fullAscensionCost(RULES, 'mortal', 'legendary')).toBeGreaterThan(
      fullAscensionCost(RULES, 'mortal', 'ascended'),
    );
  });
});
