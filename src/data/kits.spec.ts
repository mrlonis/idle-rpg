// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  CHARACTER_TIERS,
  type CharacterTier,
  type KitRulesData,
  MAX_RARITY_INDEX,
  rarityIndex,
  startRarityIndex,
} from '../core';
import { KIT_RULES } from './kits';

/** Conformance through a typed local, for the reason every other `data/` spec uses one. */
const kits: KitRulesData = KIT_RULES;
const tiers: readonly CharacterTier[] = CHARACTER_TIERS;

describe('the kit rules', () => {
  it('names a rarity the ladder actually has at every threshold', () => {
    // The whole reason these are ids rather than indices. A typo here would cost a skill silently
    // — `ordinaryUnlock` reads an unknown rarity as a rung that never comes — so it is caught by
    // name instead.
    for (const threshold of kits.unlocks) {
      expect(rarityIndex(threshold), threshold).toBeGreaterThanOrEqual(0);
    }
  });

  it('authors a threshold for every skill the deepest ceiling promises', () => {
    // Derived from the ceilings rather than restated: raising `ascended` to five skills without
    // saying which rung hands over the fifth is a skill nobody can ever reach.
    const deepest = Math.max(...tiers.map((tier) => kits.ceiling[tier]));

    expect(kits.unlocks.length).toBeGreaterThanOrEqual(deepest - 1);
  });

  it('climbs, so a later skill never arrives before an earlier one', () => {
    const rungs = kits.unlocks.map(rarityIndex);

    for (let index = 1; index < rungs.length; index++) {
      expect(rungs[index], kits.unlocks[index]).toBeGreaterThan(rungs[index - 1]);
    }
  });

  it('keeps every threshold on the ladder rather than past the end of it', () => {
    // A rung above `ascended-5` is a skill the game has no way to sell.
    for (const threshold of kits.unlocks) {
      expect(rarityIndex(threshold), threshold).toBeLessThanOrEqual(MAX_RARITY_INDEX);
    }
  });

  it('rises with tier, and gives common tier something above its ultimate', () => {
    // A ceiling of one would be a tier whose characters are a stat block and an ultimate, and the
    // hand-climbed half is tuned against five common-tier characters with two skills each.
    expect(kits.ceiling.common).toBeGreaterThan(1);
    expect(kits.ceiling.legendary).toBeGreaterThan(kits.ceiling.common);
    expect(kits.ceiling.ascended).toBeGreaterThan(kits.ceiling.legendary);
  });

  it('hands ascended tier its second skill on arrival, which is the head start', () => {
    // Deliberate, and modifying milestone 3's "tier is a slope, not a head start" — so it is
    // asserted rather than left to be noticed. The thresholds are absolute rarity and
    // `ascended`-tier characters start at `elite`, which together mean the first ordinary skill
    // is already paid for the moment one is pulled.
    expect(rarityIndex(kits.unlocks[0])).toBeLessThanOrEqual(startRarityIndex('ascended'));
    expect(rarityIndex(kits.unlocks[0])).toBeGreaterThan(startRarityIndex('common'));
  });
});
