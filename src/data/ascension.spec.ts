// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type AscensionRules,
  ascensionCost,
  copyCost,
  type FactionData,
  fodderBaseCopies,
  fullAscensionCost,
  MAX_RARITY_INDEX,
  RARITIES,
  rarityIndex,
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

const ELITE = rarityIndex('elite');
const ASCENDED = rarityIndex('ascended');

describe('the authored ladders', () => {
  it('has one rung for every step of the ladder, and none off the top', () => {
    expect(MORTAL_LADDER).toHaveLength(RARITIES.length - 1);
    expect(CELESTIAL_LADDER).toHaveLength(RARITIES.length - 1);
  });

  it('agrees with core on where each named rarity sits', () => {
    // `data/` names its ladder indices with local constants because it cannot import `RARITIES`.
    // If the two ever drift, every ascension price silently becomes a price for a different rung.
    expect(rarityIndex('rare')).toBe(0);
    expect(rarityIndex('rare-plus')).toBe(1);
    expect(rarityIndex('elite')).toBe(2);
    expect(rarityIndex('elite-plus')).toBe(3);
    expect(rarityIndex('legendary-plus')).toBe(5);
  });

  it('never references a rarity at or above the rung it is paying for', () => {
    // What makes the cost recursion well-founded. A rung that asked for a copy at its own target
    // would be a cycle, and `copyCost` would bail with a wrong answer rather than the real price.
    for (const [ladderName, ladder] of [
      ['mortal', MORTAL_LADDER],
      ['celestial', CELESTIAL_LADDER],
    ] as const) {
      ladder.forEach((rung, from) => {
        for (const requirement of rung) {
          expect(requirement.rarity, `${ladderName} rung ${from}`).toBeLessThan(from + 1);
          expect(requirement.count, `${ladderName} rung ${from}`).toBeGreaterThan(0);
        }
      });
    }
  });

  it('asks for no fodder anywhere on the celestial ladder', () => {
    // The defining property of Angels and Demons: expensive in luck, never in bodies.
    for (const rung of CELESTIAL_LADDER) {
      for (const requirement of rung) {
        expect(requirement.scope).toBe('self');
      }
    }
  });
});

/**
 * The design targets, derived from the tables rather than re-typed.
 *
 * These are the headline numbers the ascension economy is tuned around. A retune that moves one
 * of them should fail here, naming the real number — which is the whole reason the resolution is
 * code and these totals are not a lookup table sitting next to it going stale.
 */
describe('what a full ascension costs', () => {
  it.each([
    ['rare-plus', 3],
    ['elite', 9],
    ['elite-plus', 18],
    ['legendary', 54],
    ['legendary-plus', 72],
  ])('prices one %s fodder unit at %i rare copies', (rarity, expected) => {
    expect(fodderBaseCopies(rules, rarityIndex(rarity))).toBe(expected);
  });

  it('takes a mortal ascended-tier character 8 elite copies and 180 rare fodder to Ascended', () => {
    expect(copyCost(rules, 'mortal', ELITE, ASCENDED)).toEqual({ self: 8, faction: 180 });
  });

  it('takes 18 elite copies in total to reach Ascended★5, the stars adding no fodder', () => {
    expect(fullAscensionCost(rules, 'mortal', 'ascended')).toEqual({ self: 18, faction: 180 });
  });

  it('charges two elite copies per star', () => {
    for (let star = ASCENDED; star < MAX_RARITY_INDEX; star++) {
      expect(ascensionCost(rules, 'mortal', ELITE, star)).toEqual({ self: 2, faction: 0 });
    }
  });

  it('takes a celestial ascended-tier character 14 elite copies to Ascended, and no fodder', () => {
    expect(copyCost(rules, 'celestial', ELITE, ASCENDED)).toEqual({ self: 14, faction: 0 });
  });

  it('takes 24 elite copies in total to reach Ascended★5 on the celestial ladder', () => {
    expect(fullAscensionCost(rules, 'celestial', 'ascended')).toEqual({ self: 24, faction: 0 });
  });

  it('lets a common- or legendary-tier character reach Ascended★5 too, for more', () => {
    // Deliberately possible: an early favourite is a real investment rather than something the
    // game later tells you was a waste. It costs more because it starts two rungs lower.
    const common = fullAscensionCost(rules, 'mortal', 'common');

    expect(common).toEqual(fullAscensionCost(rules, 'mortal', 'legendary'));
    expect(common.self).toBeGreaterThan(18);
    expect(common.faction).toBeGreaterThan(180);
  });

  it('makes the two paths expensive in different resources rather than one being cheaper', () => {
    // Neither ladder is the easy one. Mortal spends bodies, celestial spends luck.
    const mortal = fullAscensionCost(rules, 'mortal', 'ascended');
    const celestial = fullAscensionCost(rules, 'celestial', 'ascended');

    expect(celestial.self).toBeGreaterThan(mortal.self);
    expect(mortal.faction).toBeGreaterThan(celestial.faction);
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
