// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import {
  owned,
  TEST_ALPHA,
  TEST_BETA,
  TEST_CHARACTERS,
  TEST_GAMMA,
  TEST_ZETA,
} from '../roster/fixtures';
import { startRarityIndex } from '../roster/rarity';
import { findOwned } from '../roster/roster';
import { newGame, type GameState } from '../state';
import { isEligible, offerTargets, purchase, type ShopOfferData } from './shop';

const T0 = 1_700_000_000_000;

const COMMON_COPY: ShopOfferData = {
  id: 'common-copy',
  name: 'Common copy',
  description: '',
  kind: 'copy',
  rarity: 'common',
  cost: 3,
};

const RARE_COPY: ShopOfferData = {
  id: 'rare-copy',
  name: 'Rare copy',
  description: '',
  kind: 'copy',
  rarity: 'rare',
  cost: 8,
};

const ELITE_COPY: ShopOfferData = {
  id: 'elite-copy',
  name: 'Elite copy',
  description: '',
  kind: 'copy',
  rarity: 'elite',
  cost: 60,
};

const RECRUIT: ShopOfferData = {
  id: 'new-character',
  name: 'Recruit',
  description: '',
  kind: 'character',
  cost: 40,
};

function run(spark: number, overrides: Partial<GameState> = {}): GameState {
  const base = newGame({ seed: 1, nowMs: T0 });
  return { ...base, wallet: { ...base.wallet, spark: num(spark) }, ...overrides };
}

describe('isEligible', () => {
  it('matches each copy offer to exactly the one tier that starts on its rung', () => {
    // An equality test rather than a threshold, so the cheap offer can never be spent on a
    // character the expensive one is priced for. The three tiers now start on three different
    // rungs, so there is one offer each and no overlap anywhere.
    expect(isEligible(COMMON_COPY, TEST_ALPHA)).toBe(true);
    expect(isEligible(COMMON_COPY, TEST_BETA)).toBe(false);
    expect(isEligible(COMMON_COPY, TEST_GAMMA)).toBe(false);

    expect(isEligible(RARE_COPY, TEST_ALPHA)).toBe(false);
    expect(isEligible(RARE_COPY, TEST_BETA)).toBe(true);
    expect(isEligible(RARE_COPY, TEST_GAMMA)).toBe(false);
  });

  it('lets an elite-copy offer target elite-start characters only', () => {
    expect(isEligible(ELITE_COPY, TEST_GAMMA)).toBe(true);
    expect(isEligible(ELITE_COPY, TEST_ZETA)).toBe(true);
    expect(isEligible(ELITE_COPY, TEST_ALPHA)).toBe(false);
    expect(isEligible(ELITE_COPY, TEST_BETA)).toBe(false);
  });

  it('lets a character offer target anyone', () => {
    expect(isEligible(RECRUIT, TEST_ALPHA)).toBe(true);
    expect(isEligible(RECRUIT, TEST_GAMMA)).toBe(true);
  });
});

describe('offerTargets', () => {
  it('offers copies only of characters already owned', () => {
    const state = run(0, { roster: [owned(TEST_ALPHA)] });

    expect(offerTargets(state, COMMON_COPY, TEST_CHARACTERS).map((c) => c.id)).toEqual(['alpha']);
  });

  it('offers recruits only of characters not yet owned', () => {
    const state = run(0, { roster: [owned(TEST_ALPHA)] });

    const ids = offerTargets(state, RECRUIT, TEST_CHARACTERS).map((c) => c.id);

    expect(ids).not.toContain('alpha');
    expect(ids).toContain('gamma');
  });

  it('is empty when nothing qualifies', () => {
    expect(offerTargets(run(0), ELITE_COPY, TEST_CHARACTERS)).toEqual([]);
  });
});

describe('purchase', () => {
  it('grants a copy and charges the spark', () => {
    const state = run(100, { roster: [owned(TEST_ALPHA, 2)] });

    const result = purchase(state, COMMON_COPY, 'alpha', TEST_CHARACTERS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'alpha')?.copies).toBe(3);
      expect(result.state.wallet.spark.eq(97)).toBe(true);
    }
  });

  it('recruits a character the player does not own', () => {
    const result = purchase(run(100), RECRUIT, 'gamma', TEST_CHARACTERS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'gamma')?.rarity).toBe(startRarityIndex('ascended'));
      expect(result.state.wallet.spark.eq(60)).toBe(true);
    }
  });

  it('refuses without enough spark', () => {
    const state = run(2, { roster: [owned(TEST_ALPHA)] });

    expect(purchase(state, COMMON_COPY, 'alpha', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'insufficient-currency',
    });
  });

  it('refuses to recruit someone already owned', () => {
    const state = run(100, { roster: [owned(TEST_ALPHA)] });

    expect(purchase(state, RECRUIT, 'alpha', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'already-owned',
    });
  });

  it('refuses to buy a copy of someone not owned', () => {
    expect(purchase(run(100), COMMON_COPY, 'alpha', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'not-owned',
    });
  });

  it('refuses a target the offer does not cover', () => {
    const state = run(100, { roster: [owned(TEST_GAMMA)] });

    expect(purchase(state, RARE_COPY, 'gamma', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'ineligible-character',
    });
  });

  it('refuses a character this build does not ship', () => {
    expect(purchase(run(100), RECRUIT, 'ghost', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'unknown-character',
    });
  });

  it('spends nothing when it refuses', () => {
    const state = run(4, { roster: [owned(TEST_ALPHA)] });

    purchase(state, RARE_COPY, 'alpha', TEST_CHARACTERS);

    expect(state.wallet.spark.eq(4)).toBe(true);
  });

  it('prices a targeted elite copy well above a whole new character', () => {
    // Breadth is cheap and finishing a specific ladder is the expensive thing, which is the
    // shortage this shop is actually for.
    expect(ELITE_COPY.cost).toBeGreaterThan(RECRUIT.cost);
    expect(RECRUIT.cost).toBeGreaterThan(RARE_COPY.cost);
  });
});
