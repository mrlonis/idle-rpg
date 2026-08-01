// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { newGame, PARTY_SIZE, type GameState } from '../state';
import {
  owned,
  TEST_ALPHA,
  TEST_BETA,
  TEST_CHARACTERS,
  TEST_DELTA,
  TEST_GAMMA,
  TEST_LEVEL_CURVE as CURVE,
} from './fixtures';
import { levelCapFor } from './level';
import {
  findOwned,
  grantCopies,
  grantStarters,
  levelUp,
  levelUpToAffordable,
  repairOwned,
  setParty,
} from './roster';
import { MAX_RARITY_INDEX } from './types';

const T0 = 1_700_000_000_000;

function run(overrides: Partial<GameState> = {}): GameState {
  const base = newGame({ seed: 1, nowMs: T0 });
  return {
    ...base,
    wallet: { ...base.wallet, gold: num(1e12), xp: num(1e12), essence: num(1e12) },
    ...overrides,
  };
}

describe('grantCopies', () => {
  it('creates a character the player does not own, at its tier’s starting rarity', () => {
    const { state, isNew } = grantCopies(run(), TEST_ALPHA, 1);

    expect(isNew).toBe(true);
    expect(state.roster).toEqual([{ defId: 'alpha', rarity: 0, level: 1, copies: 0 }]);
  });

  it('starts an ascended-tier character at Elite, skipping the two cheapest rungs', () => {
    const { state } = grantCopies(run(), TEST_GAMMA, 1);

    expect(state.roster[0].rarity).toBe(2);
  });

  it('banks the remainder of a batch as spares rather than as extra entries', () => {
    const { state } = grantCopies(run(), TEST_ALPHA, 5);

    expect(state.roster).toHaveLength(1);
    expect(state.roster[0].copies).toBe(4);
  });

  it('adds to the spare count of a character already owned', () => {
    const state = run({ roster: [owned(TEST_ALPHA, 2)] });

    const { state: next, isNew } = grantCopies(state, TEST_ALPHA, 3);

    expect(isNew).toBe(false);
    expect(next.roster[0].copies).toBe(5);
  });

  it('reports overflow instead of banking copies for a fully ascended character', () => {
    // Nothing left to ascend, so the caller converts these to spark. Banking them would be
    // hoarding material that can never be spent.
    const state = run({
      roster: [{ defId: 'alpha', rarity: MAX_RARITY_INDEX, level: 1, copies: 0 }],
    });

    const { state: next, overflow } = grantCopies(state, TEST_ALPHA, 3);

    expect(overflow).toBe(3);
    expect(next.roster[0].copies).toBe(0);
  });

  it('lets a lucky pull arrive higher up the ladder', () => {
    const { state } = grantCopies(run(), TEST_BETA, 1, 2);

    expect(state.roster[0].rarity).toBe(2);
  });

  it('never places a character below its tier’s floor, whatever the override says', () => {
    // An ascended-tier character at Rare could not legally exist, and its ascension costs would
    // then be computed from a rung it was never on.
    const { state } = grantCopies(run(), TEST_GAMMA, 1, 0);

    expect(state.roster[0].rarity).toBe(2);
  });

  it.each([0, -2, Number.NaN])('does nothing for a count of %p', (count) => {
    const state = run();

    expect(grantCopies(state, TEST_ALPHA, count).state).toBe(state);
  });

  it('does not mutate the state it is given', () => {
    const state = run();

    grantCopies(state, TEST_ALPHA, 4);

    expect(state.roster).toEqual([]);
  });
});

describe('grantStarters', () => {
  it('seeds a fresh run and fields the party', () => {
    const state = grantStarters(run(), ['alpha', 'beta', 'gamma'], TEST_CHARACTERS);

    expect(state.roster.map((entry) => entry.defId)).toEqual(['alpha', 'beta', 'gamma']);
    expect(state.activeParty).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('is idempotent, so it doubles as repair on every load', () => {
    // Called on every load rather than only at new-game time, because `core/` cannot see `data/`
    // and so a migration cannot seed a roster. A save that already has one must be left alone.
    const once = grantStarters(run(), ['alpha', 'beta'], TEST_CHARACTERS);
    const twice = grantStarters(once, ['alpha', 'beta'], TEST_CHARACTERS);

    expect(twice.roster).toEqual(once.roster);
    expect(twice.activeParty).toEqual(once.activeParty);
  });

  it('leaves an existing party alone rather than re-fielding the starters', () => {
    const state = run({
      roster: [owned(TEST_ALPHA), owned(TEST_BETA)],
      activeParty: ['beta'],
    });

    expect(grantStarters(state, ['alpha', 'beta'], TEST_CHARACTERS).activeParty).toEqual(['beta']);
  });

  it('rebuilds a party for a save whose roster survived but whose party did not', () => {
    const state = run({ roster: [owned(TEST_ALPHA), owned(TEST_BETA)], activeParty: [] });

    expect(grantStarters(state, [], TEST_CHARACTERS).activeParty).toEqual(['alpha', 'beta']);
  });

  it('never fields more than the party size', () => {
    const state = run({
      roster: [owned(TEST_ALPHA), owned(TEST_BETA), owned(TEST_GAMMA), owned(TEST_DELTA)],
      activeParty: [],
    });

    expect(grantStarters(state, [], TEST_CHARACTERS).activeParty).toHaveLength(PARTY_SIZE);
  });

  it('skips a starter id this build no longer ships', () => {
    const state = grantStarters(run(), ['alpha', 'ghost'], TEST_CHARACTERS);

    expect(state.roster.map((entry) => entry.defId)).toEqual(['alpha']);
  });
});

describe('setParty', () => {
  const stocked = (): GameState =>
    run({ roster: [owned(TEST_ALPHA), owned(TEST_BETA), owned(TEST_GAMMA), owned(TEST_DELTA)] });

  it('keeps the order it is given, because slot order decides turn-order ties', () => {
    const result = setParty(stocked(), ['gamma', 'alpha', 'beta'], TEST_CHARACTERS);

    expect(result.ok && result.state.activeParty).toEqual(['gamma', 'alpha', 'beta']);
  });

  it('allows an empty party, since a player mid-reshuffle has done nothing wrong', () => {
    const result = setParty(stocked(), [], TEST_CHARACTERS);

    expect(result.ok && result.state.activeParty).toEqual([]);
  });

  it('refuses a party larger than the party size', () => {
    const result = setParty(stocked(), ['alpha', 'beta', 'gamma', 'delta'], TEST_CHARACTERS);

    expect(result).toEqual({ ok: false, reason: 'party-full' });
  });

  it('refuses a repeated member', () => {
    const result = setParty(stocked(), ['alpha', 'alpha'], TEST_CHARACTERS);

    expect(result).toEqual({ ok: false, reason: 'duplicate-party-member' });
  });

  it('refuses a character the player does not own', () => {
    const result = setParty(run(), ['alpha'], TEST_CHARACTERS);

    expect(result).toEqual({ ok: false, reason: 'not-owned' });
  });

  it('refuses a character this build does not ship', () => {
    const result = setParty(stocked(), ['ghost'], TEST_CHARACTERS);

    expect(result).toEqual({ ok: false, reason: 'unknown-character' });
  });
});

describe('levelUp', () => {
  it('raises the level and spends the currency', () => {
    const state = run({ roster: [owned(TEST_ALPHA)] });

    const result = levelUp(state, 'alpha', 5, CURVE);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findOwned(result.state, 'alpha')?.level).toBe(5);
      expect(result.state.wallet.gold.lt(state.wallet.gold)).toBe(true);
      expect(result.state.wallet.xp.lt(state.wallet.xp)).toBe(true);
    }
  });

  it('charges essence when the range crosses a breakthrough', () => {
    const state = run({ roster: [owned(TEST_ALPHA)] });

    const belowBreak = levelUp(state, 'alpha', 9, CURVE);
    const acrossBreak = levelUp(state, 'alpha', 10, CURVE);

    expect(belowBreak.ok && belowBreak.state.wallet.essence.eq(state.wallet.essence)).toBe(true);
    expect(acrossBreak.ok && acrossBreak.state.wallet.essence.lt(state.wallet.essence)).toBe(true);
  });

  it('refuses to go past the rarity’s cap rather than clamping', () => {
    // Clamping would spend the player's currency on fewer levels than they asked for, which is
    // worse than telling them to ascend first.
    const state = run({ roster: [owned(TEST_ALPHA)] });

    expect(levelUp(state, 'alpha', levelCapFor(CURVE, 0) + 1, CURVE)).toEqual({
      ok: false,
      reason: 'level-capped',
    });
  });

  it('refuses when the wallet cannot cover the whole range', () => {
    const base = run({ roster: [owned(TEST_ALPHA)] });
    const broke = { ...base, wallet: { ...base.wallet, gold: num(1) } };

    expect(levelUp(broke, 'alpha', 8, CURVE)).toEqual({
      ok: false,
      reason: 'insufficient-currency',
    });
  });

  it('spends nothing at all when it refuses', () => {
    const base = run({ roster: [owned(TEST_ALPHA)] });
    const broke = { ...base, wallet: { ...base.wallet, gold: num(500) } };

    const result = levelUp(broke, 'alpha', 30, CURVE);

    expect(result.ok).toBe(false);
    expect(broke.wallet.gold.eq(500)).toBe(true);
  });

  it('is a no-op for a target at or below the current level', () => {
    const state = run({ roster: [{ defId: 'alpha', rarity: 0, level: 6, copies: 0 }] });

    const result = levelUp(state, 'alpha', 3, CURVE);

    expect(result.ok && result.state).toBe(state);
  });

  it('refuses for a character the player does not own', () => {
    expect(levelUp(run(), 'alpha', 2, CURVE)).toEqual({ ok: false, reason: 'not-owned' });
  });
});

describe('levelUpToAffordable', () => {
  it('spends everything it can in one call', () => {
    const state = run({ roster: [owned(TEST_ALPHA)] });

    const result = levelUpToAffordable(state, 'alpha', CURVE);

    expect(result.ok && findOwned(result.state, 'alpha')?.level).toBe(levelCapFor(CURVE, 0));
  });

  it('reports the cap when there is nowhere left to go', () => {
    const state = run({
      roster: [{ defId: 'alpha', rarity: 0, level: levelCapFor(CURVE, 0), copies: 0 }],
    });

    expect(levelUpToAffordable(state, 'alpha', CURVE)).toEqual({
      ok: false,
      reason: 'level-capped',
    });
  });

  it('reports the wallet when it is the wallet that stops it', () => {
    const base = run({ roster: [owned(TEST_ALPHA)] });
    const broke = { ...base, wallet: { ...base.wallet, gold: num(0) } };

    expect(levelUpToAffordable(broke, 'alpha', CURVE)).toEqual({
      ok: false,
      reason: 'insufficient-currency',
    });
  });
});

describe('repairOwned', () => {
  it('clamps a rarity outside the ladder', () => {
    const repaired = repairOwned(
      { defId: 'alpha', rarity: 99, level: 1, copies: 0 },
      TEST_ALPHA,
      CURVE,
    );

    expect(repaired.rarity).toBe(MAX_RARITY_INDEX);
  });

  it('lifts a character below its tier’s floor back onto a rung it could be on', () => {
    const repaired = repairOwned(
      { defId: 'gamma', rarity: 0, level: 1, copies: 0 },
      TEST_GAMMA,
      CURVE,
    );

    expect(repaired.rarity).toBe(2);
  });

  it('clamps a level to the repaired rarity’s cap', () => {
    const repaired = repairOwned(
      { defId: 'alpha', rarity: 0, level: 9999, copies: 0 },
      TEST_ALPHA,
      CURVE,
    );

    expect(repaired.level).toBe(levelCapFor(CURVE, 0));
  });

  it.each([-5, Number.NaN, 3.7])('repairs a copy count of %p', (copies) => {
    const repaired = repairOwned(
      { defId: 'alpha', rarity: 0, level: 1, copies },
      TEST_ALPHA,
      CURVE,
    );

    expect(Number.isInteger(repaired.copies)).toBe(true);
    expect(repaired.copies).toBeGreaterThanOrEqual(0);
  });
});
