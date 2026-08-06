// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import {
  owned,
  TEST_ASCENSION,
  TEST_BETA,
  TEST_CHARACTERS,
  TEST_FACTIONS,
  TEST_EPSILON,
  TEST_GACHA,
  TEST_GAMMA,
} from '../roster/fixtures';
import { startRarityIndex } from '../roster/rarity';
import { MAX_RARITY_INDEX } from '../roster/types';
import { newGame, type GameState } from '../state';
import { ascendedChance, pull } from './pull';
import { type BannerData, type GachaRulesData, type PullResult } from './types';

const T0 = 1_700_000_000_000;

const STANDARD: BannerData = { id: 'standard', name: 'Standard', description: '', pool: [] };

/** A banner narrowed to one character, so every pull is about that character. */
function only(defId: string): BannerData {
  return { id: 'focus', name: 'Focus', description: '', pool: [defId] };
}

function run(overrides: Partial<GameState> = {}): GameState {
  const base = newGame({ seed: 0xc0ffee, nowMs: T0 });
  return {
    ...base,
    wallet: { ...base.wallet, summons: num(100_000) },
    ...overrides,
  };
}

function draw(
  state: GameState,
  count = 1,
  banner: BannerData = STANDARD,
  rules: GachaRulesData = TEST_GACHA,
): { state: GameState; results: readonly PullResult[] } {
  const outcome = pull(state, banner, count, rules, TEST_ASCENSION, TEST_CHARACTERS, TEST_FACTIONS);
  if (!outcome.ok) {
    throw new Error(`expected a successful pull, got ${outcome.reason}`);
  }
  return { state: outcome.state, results: outcome.results };
}

describe('ascendedChance', () => {
  it('sits at the base rate until soft pity begins', () => {
    expect(ascendedChance(TEST_GACHA, 1)).toBeCloseTo(0.025, 10);
    expect(ascendedChance(TEST_GACHA, 30)).toBeCloseTo(0.025, 10);
  });

  it('ramps once soft pity starts', () => {
    expect(ascendedChance(TEST_GACHA, 31)).toBeCloseTo(0.085, 10);
    expect(ascendedChance(TEST_GACHA, 35)).toBeCloseTo(0.325, 10);
  });

  it('reaches certainty before the hard cap ever has to fire', () => {
    // The design intent: the guarantee is a floor, not the mechanism. Most cycles clear in the
    // high thirties, and a player is never actually walked to fifty.
    expect(ascendedChance(TEST_GACHA, 47)).toBe(1);
  });

  it('guarantees an ascended-tier result at hard pity', () => {
    expect(ascendedChance(TEST_GACHA, 50)).toBe(1);
    expect(ascendedChance(TEST_GACHA, 80)).toBe(1);
  });

  it('is far more generous than a commercial banner', () => {
    // Not a tuning assertion so much as a design one. There is nothing to sell here, so every
    // reason to be stingy is a reason that does not apply.
    expect(TEST_GACHA.tierWeights.ascended).toBeGreaterThanOrEqual(0.02);
    expect(TEST_GACHA.pity.hardPity).toBeLessThanOrEqual(60);
  });
});

describe('paying for a pull', () => {
  it('charges the banner cost per pull', () => {
    const state = run({ wallet: { ...run().wallet, summons: num(1000) } });

    const { state: next } = draw(state, 10);

    expect(next.wallet.summons.eq(0)).toBe(true);
  });

  it('refuses when the wallet cannot cover the whole batch', () => {
    // Charged up front. A ten-pull that ran out partway would sometimes silently become a
    // six-pull, and the player would have no way to tell which.
    const state = run({ wallet: { ...run().wallet, summons: num(999) } });

    const outcome = pull(
      state,
      STANDARD,
      10,
      TEST_GACHA,
      TEST_ASCENSION,
      TEST_CHARACTERS,
      TEST_FACTIONS,
    );

    expect(outcome).toEqual({ ok: false, reason: 'insufficient-currency' });
  });

  it.each([0, -1, Number.NaN, Infinity])('rejects a count of %p', (count) => {
    const outcome = pull(
      run(),
      STANDARD,
      count,
      TEST_GACHA,
      TEST_ASCENSION,
      TEST_CHARACTERS,
      TEST_FACTIONS,
    );

    expect(outcome).toEqual({ ok: false, reason: 'bad-count' });
  });

  it('reports an empty pool rather than drawing nothing', () => {
    const outcome = pull(
      run(),
      { id: 'ghost', name: 'Ghost', description: '', pool: ['nobody'] },
      1,
      TEST_GACHA,
      TEST_ASCENSION,
      TEST_CHARACTERS,
      TEST_FACTIONS,
    );

    expect(outcome).toEqual({ ok: false, reason: 'empty-pool' });
  });
});

describe('the RNG contract', () => {
  it('consumes exactly three draws per pull, whatever the outcome', () => {
    // The invariant the whole save layer leans on: `rng.calls` is enough to describe where a run
    // is in its sequence, which is what makes an O(1) resume and a replayable bug report
    // possible. If consumption depended on the branch taken, it would not be.
    for (const count of [1, 3, 10]) {
      const { state } = draw(run(), count);

      expect(state.rng.calls).toBe(count * 3);
    }
  });

  it('consumes the same three draws when pity forces the result', () => {
    const guaranteed = draw(run({ pity: 49 }), 1);
    const ordinary = draw(run({ pity: 0 }), 1);

    expect(guaranteed.state.rng.calls).toBe(3);
    expect(ordinary.state.rng.calls).toBe(3);
  });

  it('produces an identical batch from an identical seed and call count', () => {
    const first = draw(run(), 10);
    const second = draw(run(), 10);

    expect(first.results).toEqual(second.results);
    expect(first.state.rng).toEqual(second.state.rng);
  });

  it('produces a different batch from a different call count', () => {
    const fresh = draw(run(), 10);
    const later = draw(run({ rng: { seed: 0xc0ffee, calls: 30 } }), 10);

    expect(later.results).not.toEqual(fresh.results);
  });

  it('leaves the seed alone', () => {
    expect(draw(run(), 5).state.rng.seed).toBe(0xc0ffee);
  });
});

describe('pity', () => {
  it('counts up on anything but an ascended-tier result', () => {
    // The banner here can only produce a legendary-tier character, so every pull misses.
    const { state, results } = draw(run(), 5, only(TEST_BETA.id));

    expect(state.pity).toBe(5);
    expect(results.map((result) => result.pity)).toEqual([1, 2, 3, 4, 5]);
  });

  it('resets to zero the moment an ascended-tier character lands', () => {
    const { state, results } = draw(run({ pity: 49 }), 1, only(TEST_GAMMA.id));

    expect(results[0].tier).toBe('ascended');
    expect(results[0].wasGuaranteed).toBe(true);
    expect(state.pity).toBe(0);
  });

  it('carries mid-batch, so a ten-pull can clear and start counting again', () => {
    const { state, results } = draw(run({ pity: 45 }), 10, only(TEST_GAMMA.id));

    // Pull 5 of the batch is pity pull 50 and is guaranteed; everything after restarts the count.
    expect(results[4].pity).toBe(0);
    expect(state.pity).toBeLessThan(10);
  });

  it('is global rather than per-banner', () => {
    // Splitting pity per banner is a monetisation pattern — it makes each new banner a fresh
    // fifty-pull tax — and there is nothing here to monetise.
    const after = draw(run({ pity: 20 }), 3, only(TEST_BETA.id)).state;

    const onAnother = draw(after, 1, { id: 'other', name: 'Other', description: '', pool: [] });

    expect(onAnother.results[0].pity).toBe(24);
  });
});

describe('what a pull produces', () => {
  it('creates a character the player does not own, at its tier’s starting rarity', () => {
    const { state, results } = draw(run(), 1, only(TEST_GAMMA.id));

    expect(results[0].isNew).toBe(true);
    expect(state.roster).toEqual([
      { defId: 'gamma', rarity: startRarityIndex('ascended'), level: 1, copies: 0, gear: {} },
    ]);
  });

  it('banks a duplicate as a spare copy rather than a second entry', () => {
    const state = run({ roster: [owned(TEST_GAMMA, 4)] });

    const { state: next, results } = draw(state, 1, only(TEST_GAMMA.id));

    expect(results[0].isNew).toBe(false);
    expect(next.roster).toHaveLength(1);
    expect(next.roster[0].copies).toBe(5);
  });

  it('gives a ten-pull of one new character a single entry and nine spares', () => {
    const { state } = draw(run(), 10, only(TEST_GAMMA.id));

    expect(state.roster).toHaveLength(1);
    expect(state.roster[0].copies).toBe(9);
  });

  it('counts every pull, for display', () => {
    expect(draw(run({ pullCount: 130 }), 10).state.pullCount).toBe(140);
  });

  it('always reports the tier of the character it actually granted', () => {
    // These come apart whenever a banner's pool has nobody at the rolled tier and the draw falls
    // back to the whole pool. Reporting the rolled tier would reset pity on a pull that produced
    // no ascended-tier character at all — a narrowed banner would hand out a free reset for a
    // common-tier unit.
    const focused = draw(run(), 40, only(TEST_BETA.id));

    for (const result of focused.results) {
      expect(result.tier).toBe(TEST_BETA.tier);
    }
    expect(focused.state.pity).toBe(40);
  });

  it('keeps tier and character consistent on the full pool too', () => {
    const { results } = draw(run(), 50);

    for (const result of results) {
      expect(result.tier).toBe(TEST_CHARACTERS.get(result.defId)?.tier);
    }
  });

  it('never mutates the state it was given', () => {
    const state = run();

    draw(state, 10);

    expect(state.roster).toEqual([]);
    expect(state.rng.calls).toBe(0);
    expect(state.wallet.summons.eq(100_000)).toBe(true);
  });
});

describe('duplicates of a maxed character', () => {
  const maxed = (): GameState =>
    run({ roster: [{ defId: 'gamma', rarity: MAX_RARITY_INDEX, level: 1, copies: 0, gear: {} }] });

  it('mints spark instead of a copy that has nowhere to go', () => {
    const { state, results } = draw(maxed(), 1, only(TEST_GAMMA.id));

    expect(results[0].copies).toBe(0);
    expect(results[0].spark).toBe(TEST_GACHA.sparkPerCopy.ascended);
    expect(state.wallet.spark.eq(TEST_GACHA.sparkPerCopy.ascended)).toBe(true);
  });

  it('leaves the spare count alone', () => {
    const { state } = draw(maxed(), 3, only(TEST_GAMMA.id));

    expect(state.roster[0].copies).toBe(0);
    expect(state.roster[0].rarity).toBe(MAX_RARITY_INDEX);
  });

  it('means no pull is ever worth nothing', () => {
    // The design guarantee: every copy is either ascension material or spark. There is no state
    // in which a player pulls and receives nothing at all.
    const { results } = draw(maxed(), 5, only(TEST_GAMMA.id));

    for (const result of results) {
      expect(result.copies > 0 || result.spark > 0 || result.isNew).toBe(true);
    }
  });
});

describe('the elite upgrade', () => {
  const always: GachaRulesData = { ...TEST_GACHA, eliteUpgradeChance: 1 };
  const never: GachaRulesData = { ...TEST_GACHA, eliteUpgradeChance: 0 };

  const ELITE = startRarityIndex('ascended');
  const RARE = startRarityIndex('legendary');

  it('lands a new legendary-tier character at Elite rather than Rare', () => {
    const { state, results } = draw(run(), 1, only(TEST_BETA.id), always);

    expect(results[0].rarity).toBe(ELITE);
    expect(state.roster[0].rarity).toBe(ELITE);
  });

  it('pays a duplicate the copies it would have taken to get there', () => {
    // Worth a great deal: the rungs below Elite are deliberately the expensive stretch, because
    // they are the only thing separating what a common-tier climb costs from an ascended-tier
    // one. Five on the fixture ladder — the two rungs from Rare to Elite.
    const state = run({ roster: [owned(TEST_BETA, 0)] });

    const { state: next, results } = draw(state, 1, only(TEST_BETA.id), always);

    expect(results[0].copies).toBe(5);
    expect(next.roster[0].copies).toBe(5);
  });

  it('is worth the same on either ladder, because they only differ above Elite', () => {
    // The two paths are identical below Elite on purpose: those rungs are the *tier* gap, not the
    // path difference, and a celestial common-tier character is common-tier for the same reason
    // everyone else's is. This used to be the opposite assertion — the celestial ladder charged
    // 9 against the mortal ladder's 3, because only the celestial one paid in its own copies.
    const mortal = draw(run({ roster: [owned(TEST_BETA, 0)] }), 1, only(TEST_BETA.id), always);
    const celestial = draw(
      run({ roster: [owned(TEST_EPSILON, 0)] }),
      1,
      only(TEST_EPSILON.id),
      always,
    );

    expect(celestial.results[0].copies).toBe(mortal.results[0].copies);
  });

  it('never upgrades an ascended-tier result, which already starts at Elite', () => {
    const { results } = draw(run(), 1, only(TEST_GAMMA.id), always);

    expect(results[0].rarity).toBe(ELITE);
    expect(results[0].copies).toBe(1);
  });

  it('leaves a legendary-tier result at Rare when it does not fire', () => {
    const { results } = draw(run(), 1, only(TEST_BETA.id), never);

    expect(results[0].rarity).toBe(RARE);
    expect(results[0].copies).toBe(1);
  });

  it('draws its roll whether or not it can apply, keeping consumption fixed', () => {
    const upgraded = draw(run(), 4, only(TEST_BETA.id), always);
    const plain = draw(run(), 4, only(TEST_GAMMA.id), never);

    expect(upgraded.state.rng.calls).toBe(12);
    expect(plain.state.rng.calls).toBe(12);
  });
});

describe('tier distribution', () => {
  it('lands roughly on the authored weights over many pulls', () => {
    // Not an exact assertion — it is a sampled distribution. What matters is that the shape is
    // the authored one rather than, say, uniform across three tiers.
    let state = run({ wallet: { ...run().wallet, summons: num(1_000_000) } });
    const counts = { common: 0, legendary: 0, ascended: 0 };

    for (let batch = 0; batch < 100; batch++) {
      const drawn = draw(state, 10);
      state = drawn.state;
      for (const result of drawn.results) {
        counts[result.tier]++;
      }
    }

    expect(counts.common).toBeGreaterThan(counts.legendary);
    expect(counts.legendary).toBeGreaterThan(counts.ascended);
    expect(counts.common / 1000).toBeGreaterThan(0.6);
    expect(counts.common / 1000).toBeLessThan(0.85);
  });

  it('clears pity often enough that the hard cap is rarely what fires', () => {
    // The tuning claim in `banners.ts`: soft pity is steep enough that the guarantee is a floor.
    let state = run({ wallet: { ...run().wallet, summons: num(1_000_000) } });
    let guaranteed = 0;
    let ascended = 0;

    for (let batch = 0; batch < 100; batch++) {
      const drawn = draw(state, 10);
      state = drawn.state;
      for (const result of drawn.results) {
        if (result.tier === 'ascended') {
          ascended++;
        }
        if (result.wasGuaranteed) {
          guaranteed++;
        }
      }
    }

    expect(ascended).toBeGreaterThan(0);
    expect(guaranteed).toBeLessThan(ascended);
  });
});
