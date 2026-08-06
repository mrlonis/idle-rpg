// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type AscensionRules,
  ascensionCost,
  copyCost,
  type FactionData,
  fullAscensionCost,
  MAX_RARITY_INDEX,
  RARITIES,
  rarityIndex,
  startRarityIndex,
} from '../core';
import { ASCENSION_RULES, CELESTIAL_LADDER, FACTIONS, MORTAL_LADDER } from './ascension';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `AscensionRules`. Assigning them to a typed local
 * here is what turns a malformed rung into a compile error instead of a runtime surprise.
 */
const rules: AscensionRules = ASCENSION_RULES;
const factions: readonly FactionData[] = FACTIONS;

const COMMON = rarityIndex('common');
const RARE = rarityIndex('rare');
const ELITE = rarityIndex('elite');
const ASCENDED = rarityIndex('ascended');

describe('the authored ladders', () => {
  it('has one rung for every step of the ladder, and none off the top', () => {
    expect(MORTAL_LADDER).toHaveLength(RARITIES.length - 1);
    expect(CELESTIAL_LADDER).toHaveLength(RARITIES.length - 1);
  });

  it('charges at least one copy for every rung', () => {
    // A free rung is an ascension that happens on its own, which is not a thing the ladder is
    // allowed to contain. It used to be: the rungs paid entirely in fodder cost zero copies of
    // the character itself, and with fodder gone that zero would have been a free ascension.
    for (const [name, ladder] of [
      ['mortal', MORTAL_LADDER],
      ['celestial', CELESTIAL_LADDER],
    ] as const) {
      ladder.forEach((cost, from) => {
        expect(cost, `${name} rung ${from}`).toBeGreaterThan(0);
        expect(Number.isInteger(cost), `${name} rung ${from}`).toBe(true);
      });
    }
  });

  it('prices the two ladders identically below elite', () => {
    // The rungs below `elite` are the tier gap, not the path difference. A celestial common-tier
    // character is common-tier for the same reason everyone else's is, and charging it twice
    // would be charging twice for one thing.
    expect(CELESTIAL_LADDER.slice(0, ELITE)).toEqual(MORTAL_LADDER.slice(0, ELITE));
  });

  it('makes the celestial ladder the expensive one above elite', () => {
    // What the celestial advantage in combat is paid for with. Derived rather than restated, so
    // a retune that accidentally inverts it fails here.
    expect(copyCost(rules, 'celestial', ELITE, MAX_RARITY_INDEX)).toBeGreaterThan(
      copyCost(rules, 'mortal', ELITE, MAX_RARITY_INDEX),
    );
  });
});

/**
 * The design targets, derived from the tables rather than re-typed.
 *
 * These are the headline numbers the ascension economy is tuned around, and every one is a
 * **total including the first copy** — how many of a character a player has to see, not how many
 * they spend. A retune that moves one should fail here naming the real number.
 */
describe('what a full ascension costs', () => {
  it.each([
    ['common', 36, 46],
    ['legendary', 16, 26],
    ['ascended', 8, 18],
  ] as const)('takes a mortal %s-tier character %i to Ascended and %i to ★5', (tier, to, max) => {
    expect(1 + copyCost(rules, 'mortal', startRarityIndex(tier), ASCENDED)).toBe(to);
    expect(fullAscensionCost(rules, 'mortal', tier)).toBe(max);
  });

  it.each([
    ['common', 42, 52],
    ['legendary', 22, 32],
    ['ascended', 14, 24],
  ] as const)(
    'takes a celestial %s-tier character %i to Ascended and %i to ★5',
    (tier, to, max) => {
      expect(1 + copyCost(rules, 'celestial', startRarityIndex(tier), ASCENDED)).toBe(to);
      expect(fullAscensionCost(rules, 'celestial', tier)).toBe(max);
    },
  );

  it('charges two copies per star, on both ladders', () => {
    for (let star = ASCENDED; star < MAX_RARITY_INDEX; star++) {
      expect(ascensionCost(rules, 'mortal', star)).toBe(2);
      expect(ascensionCost(rules, 'celestial', star)).toBe(2);
    }
  });

  it('puts 20 copies below rare, which is the whole of the tier gap', () => {
    // Every rung costs every character the same, so a tier is worth exactly the rungs it skips.
    // These four numbers ARE the tier separation — retuning them is retuning the gap, and
    // nothing else in the ladder can substitute for them.
    expect(copyCost(rules, 'mortal', COMMON, RARE)).toBe(20);
    expect(copyCost(rules, 'mortal', RARE, ELITE)).toBe(8);
  });

  it('keeps every tier a comparable commitment against how often a pull produces one', () => {
    // The calibration behind those numbers. A specific common-tier character arrives from a pull
    // roughly 10× more often than a specific ascended-tier one and roughly 3× more often than a
    // legendary-tier one, so the climbs are priced to land within a factor of each other rather
    // than to be equal. Loose bounds on purpose: this is asserting the shape of the tuning, not
    // pinning a number the other blocks already pin exactly.
    const common = fullAscensionCost(rules, 'mortal', 'common');
    const legendary = fullAscensionCost(rules, 'mortal', 'legendary');
    const ascended = fullAscensionCost(rules, 'mortal', 'ascended');

    expect(common / ascended).toBeLessThan(10);
    expect(legendary / ascended).toBeLessThan(3);
    expect(common).toBeGreaterThan(legendary);
    expect(legendary).toBeGreaterThan(ascended);
  });

  it('lets a common-tier character reach Ascended★5 too, for more', () => {
    // Deliberately possible: an early favourite is a real investment rather than something the
    // game later tells you was a waste. It costs more because it starts four rungs lower.
    expect(fullAscensionCost(rules, 'mortal', 'common')).toBeGreaterThan(
      fullAscensionCost(rules, 'mortal', 'ascended'),
    );
  });
});

describe('factions', () => {
  it('authors seven, with unique ids', () => {
    expect(factions).toHaveLength(7);
    expect(new Set(factions.map((faction) => faction.id)).size).toBe(factions.length);
  });

  it('puts Angels and Demons on the celestial ladder and everyone else on the mortal one', () => {
    const celestial = factions
      .filter((faction) => faction.ascensionPath === 'celestial')
      .map((faction) => faction.id);

    expect(celestial.sort()).toEqual(['angel', 'demon']);
  });
});
