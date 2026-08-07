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

  it('keeps the celestial premium proportional rather than per-rung', () => {
    // The premium is sized against the TOTAL, not by scaling each rung, and the distinction is
    // the whole of this block. It was a flat x2 per rung when those rungs were 1s and 2s, which
    // came to +6 copies; the same x2 on the current rungs costs +38 and roughly triples the tax
    // in real terms. What is held is the ratio a celestial player actually experiences.
    const premium =
      fullAscensionCost(rules, 'celestial', 'ascended') /
      fullAscensionCost(rules, 'mortal', 'ascended');

    expect(premium).toBeGreaterThan(1.15);
    expect(premium).toBeLessThan(1.4);
  });

  it('charges the celestial premium on rungs 5-9 and nowhere else', () => {
    // `elite -> elite+` and the five stars are shared, which "expensive above elite" does not
    // say on its own. Anything that widens the premium to the whole block above `elite` is a
    // different ladder and should have to say so here.
    expect(ascensionCost(rules, 'celestial', ELITE)).toBe(ascensionCost(rules, 'mortal', ELITE));
    for (let star = ASCENDED; star < MAX_RARITY_INDEX; star++) {
      expect(ascensionCost(rules, 'celestial', star)).toBe(ascensionCost(rules, 'mortal', star));
    }
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
    ['common', 63, 93],
    ['legendary', 53, 83],
    ['ascended', 43, 73],
  ] as const)('takes a mortal %s-tier character %i to Ascended and %i to ★5', (tier, to, max) => {
    expect(1 + copyCost(rules, 'mortal', startRarityIndex(tier), ASCENDED)).toBe(to);
    expect(fullAscensionCost(rules, 'mortal', tier)).toBe(max);
  });

  it.each([
    ['common', 83, 113],
    ['legendary', 73, 103],
    ['ascended', 63, 93],
  ] as const)(
    'takes a celestial %s-tier character %i to Ascended and %i to ★5',
    (tier, to, max) => {
      expect(1 + copyCost(rules, 'celestial', startRarityIndex(tier), ASCENDED)).toBe(to);
      expect(fullAscensionCost(rules, 'celestial', tier)).toBe(max);
    },
  );

  it('charges six copies per star, on both ladders', () => {
    for (let star = ASCENDED; star < MAX_RARITY_INDEX; star++) {
      expect(ascensionCost(rules, 'mortal', star)).toBe(6);
      expect(ascensionCost(rules, 'celestial', star)).toBe(6);
    }
  });

  it('puts 20 copies below elite, which is the whole of the tier gap', () => {
    // Every rung costs every character the same, so a tier is worth exactly the rungs it skips.
    // These four numbers ARE the tier separation — retuning them is retuning the gap, and
    // nothing else in the ladder can substitute for them.
    expect(copyCost(rules, 'mortal', COMMON, RARE)).toBe(10);
    expect(copyCost(rules, 'mortal', RARE, ELITE)).toBe(10);
    expect(copyCost(rules, 'mortal', COMMON, ELITE)).toBe(20);
  });

  it('puts most of a climb above elite, so tier is a head start rather than a shortcut', () => {
    // The shape of the current tuning, and a deliberate inversion of what this ladder used to
    // say. The bottom used to carry the whole tier gap so that every tier was a comparable
    // commitment; it now carries a fifth of the ladder, and the stretch every tier walks carries
    // the rest. What separates the climbs is the pull rate feeding them — a specific
    // ascended-tier character arrives about 4× less often — rather than the copy counts, which
    // is why these land close together and the time-to-max does not.
    const belowElite = copyCost(rules, 'mortal', COMMON, ELITE);
    const aboveElite = copyCost(rules, 'mortal', ELITE, MAX_RARITY_INDEX);
    expect(aboveElite).toBeGreaterThan(belowElite * 3);

    const common = fullAscensionCost(rules, 'mortal', 'common');
    const legendary = fullAscensionCost(rules, 'mortal', 'legendary');
    const ascended = fullAscensionCost(rules, 'mortal', 'ascended');

    // Still ordered — a lower tier always costs more copies — but within a narrow band, because
    // the rungs they share dominate the rungs they do not.
    expect(common).toBeGreaterThan(legendary);
    expect(legendary).toBeGreaterThan(ascended);
    expect(common / ascended).toBeLessThan(1.5);
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
