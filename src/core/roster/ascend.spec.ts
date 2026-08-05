// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { newGame, type GameState } from '../state';
import { ascend, autoFodderPlan, fodderPool, fodderValue, nextAscension, pathFor } from './ascend';
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
import { findOwned } from './roster';
import { MAX_RARITY_INDEX } from './types';

const T0 = 1_700_000_000_000;

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 1, nowMs: T0 }), ...overrides };
}

const ascendGamma = (state: GameState, plan = { fodder: {} }) =>
  ascend(state, 'gamma', plan, RULES, TEST_CHARACTERS, TEST_FACTIONS);

describe('pathFor', () => {
  it('reads the ladder off the character’s faction', () => {
    expect(pathFor(TEST_GAMMA, TEST_FACTIONS)).toBe('mortal');
    expect(pathFor(TEST_ZETA, TEST_FACTIONS)).toBe('celestial');
  });

  it('falls back to the mortal ladder for a faction this build no longer ships', () => {
    expect(pathFor({ ...TEST_ALPHA, faction: 'gone' }, TEST_FACTIONS)).toBe('mortal');
  });
});

describe('fodderValue', () => {
  it('is one for a rare-start character', () => {
    expect(fodderValue(RULES, TEST_ALPHA)).toBe(1);
    expect(fodderValue(RULES, TEST_BETA)).toBe(1);
  });

  it('is nine for an elite-start character, which is how deep Elite sits', () => {
    // Feeding one is legal, efficient by the count, and a terrible idea by the value.
    expect(fodderValue(RULES, TEST_GAMMA)).toBe(9);
  });
});

describe('nextAscension', () => {
  it('quotes the next rung in base copies', () => {
    const state = run({ roster: [owned(TEST_GAMMA)] });

    // gamma starts at Elite; Elite → Elite+ is one more copy of itself and no fodder.
    expect(nextAscension(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toEqual({
      self: 1,
      faction: 0,
    });
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

describe('fodderPool', () => {
  it('lists faction-mates with spares, and nobody else', () => {
    const state = run({
      roster: [owned(TEST_GAMMA, 5), owned(TEST_ALPHA, 12), owned(TEST_DELTA, 30)],
    });

    const pool = fodderPool(state, 'gamma', RULES, TEST_CHARACTERS);

    // delta is a different faction; gamma is the character being ascended.
    expect(pool.map((option) => option.defId)).toEqual(['alpha']);
    expect(pool[0].available).toBe(12);
    expect(pool[0].valuePerCopy).toBe(1);
  });

  it('excludes the character being ascended, so its copies cannot count twice', () => {
    // Its own copies already pay the rung's `self` clause. Letting them count again would
    // silently halve the price.
    const state = run({ roster: [owned(TEST_GAMMA, 40)] });

    expect(fodderPool(state, 'gamma', RULES, TEST_CHARACTERS)).toEqual([]);
  });

  it('excludes faction-mates with no spares to give', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 5), owned(TEST_ALPHA, 0)] });

    expect(fodderPool(state, 'gamma', RULES, TEST_CHARACTERS)).toEqual([]);
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
        rarity: 3,
        level: 1,
        copies: 2,
      });
    }
  });

  it('consumes planned fodder from faction-mates’ spares', () => {
    // Elite+ → Legendary asks for 2 faction-mates at Elite+, which is 36 base copies of a
    // rare-start character.
    const state = run({
      roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 40)],
    });

    const result = ascendGamma(state, { fodder: { alpha: 36 } });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'gamma')?.rarity).toBe(4);
      expect(findOwned(result.state, 'alpha')?.copies).toBe(4);
    }
  });

  it('never touches the main copy of a faction-mate, only its spares', () => {
    // The deliberate departure from the genre: a player cannot destroy the character they spent
    // a week levelling by tapping the wrong row, so there is no irreversible-loss confirmation
    // to get wrong.
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 40)] });

    const result = ascendGamma(state, { fodder: { alpha: 36 } });

    expect(result.ok && findOwned(result.state, 'alpha')).toBeDefined();
    expect(result.ok && findOwned(result.state, 'alpha')?.level).toBe(1);
  });

  it('refuses without enough copies of the character itself', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 0)] });

    expect(ascendGamma(state)).toEqual({ ok: false, reason: 'insufficient-copies' });
  });

  it('refuses without enough fodder', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 5)] });

    expect(ascendGamma(state, { fodder: { alpha: 5 } })).toEqual({
      ok: false,
      reason: 'insufficient-fodder',
    });
  });

  it('refuses fodder from another faction', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_DELTA, 99)] });

    expect(ascendGamma(state, { fodder: { delta: 99 } })).toEqual({
      ok: false,
      reason: 'wrong-faction',
    });
  });

  it('refuses to feed a character to itself', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 99, 3)] });

    expect(ascendGamma(state, { fodder: { gamma: 36 } })).toEqual({
      ok: false,
      reason: 'fodder-is-self',
    });
  });

  it('refuses fodder the player does not hold enough of', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 10)] });

    expect(ascendGamma(state, { fodder: { alpha: 36 } })).toEqual({
      ok: false,
      reason: 'insufficient-fodder',
    });
  });

  it('refuses at the top of the ladder', () => {
    const state = run({
      roster: [{ defId: 'gamma', rarity: MAX_RARITY_INDEX, level: 1, copies: 99, gear: {} }],
    });

    expect(ascendGamma(state)).toEqual({ ok: false, reason: 'max-rarity' });
  });

  it('consumes nothing at all when it refuses', () => {
    // Checked in full before anything is spent, so a rejected ascension leaves no partial spend
    // to reason about or refund.
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 10)] });

    ascendGamma(state, { fodder: { alpha: 10 } });

    expect(findOwned(state, 'alpha')?.copies).toBe(10);
    expect(findOwned(state, 'gamma')?.copies).toBe(4);
  });

  it('values an elite-start fodder copy at nine', () => {
    const state = run({ roster: [owned(TEST_BETA, 4, 3), owned(TEST_GAMMA, 4)] });

    // beta at Elite+ needs 2 faction-mates at Elite+ = 36 rare copies. Four gamma spares are
    // worth 36.
    const result = ascend(
      state,
      'beta',
      { fodder: { gamma: 4 } },
      RULES,
      TEST_CHARACTERS,
      TEST_FACTIONS,
    );

    expect(result.ok).toBe(true);
  });

  it('never asks a celestial character for fodder', () => {
    const state = run({ roster: [owned(TEST_ZETA, 20)] });
    let current = state;

    for (let rung = 2; rung < MAX_RARITY_INDEX; rung++) {
      const cost = nextAscension(current, 'zeta', RULES, TEST_CHARACTERS, TEST_FACTIONS);
      expect(cost?.faction).toBe(0);
      const result = ascend(current, 'zeta', { fodder: {} }, RULES, TEST_CHARACTERS, TEST_FACTIONS);
      if (!result.ok) {
        break;
      }
      current = result.state;
    }

    expect(findOwned(current, 'zeta')?.rarity).toBeGreaterThan(2);
  });

  it('does not mutate the state it is given', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 3)] });

    ascendGamma(state);

    expect(findOwned(state, 'gamma')).toEqual({
      defId: 'gamma',
      gear: {},
      rarity: 2,
      level: 1,
      copies: 3,
    });
  });
});

describe('autoFodderPlan', () => {
  it('is empty for a rung that asks for no fodder', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 3)] });

    expect(autoFodderPlan(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toEqual({
      fodder: {},
    });
  });

  it('spends the cheapest spares first', () => {
    // A tap that fed an ascended-tier duplicate to a rung a handful of commons would cover is
    // exactly the mistake this exists to prevent.
    const state = run({
      roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 40), owned(TEST_BETA, 40)],
    });

    const plan = autoFodderPlan(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS);

    expect(plan).toBeDefined();
    const total = Object.values(plan?.fodder ?? {}).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(36);
  });

  it('draws from the deepest pile first, leaving small piles intact', () => {
    const state = run({
      roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 40), owned(TEST_BETA, 4)],
    });

    const plan = autoFodderPlan(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS);

    expect(plan?.fodder['alpha']).toBe(36);
    expect(plan?.fodder['beta']).toBeUndefined();
  });

  it('is undefined when the roster simply cannot pay', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 2)] });

    expect(autoFodderPlan(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS)).toBeUndefined();
  });

  it('produces a plan that ascend actually accepts', () => {
    const state = run({
      roster: [owned(TEST_GAMMA, 4, 3), owned(TEST_ALPHA, 40)],
    });

    const plan = autoFodderPlan(state, 'gamma', RULES, TEST_CHARACTERS, TEST_FACTIONS);
    const result = ascendGamma(state, plan ?? { fodder: {} });

    expect(result.ok).toBe(true);
  });
});
