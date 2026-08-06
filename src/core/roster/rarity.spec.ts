// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  ascensionCost,
  clampRarityIndex,
  copyCost,
  fullAscensionCost,
  growthFloor,
  rarityAt,
  rarityFamily,
  rarityIndex,
  rarityLabel,
  startRarityIndex,
} from './rarity';
import {
  type AscensionRules,
  MAX_RARITY_INDEX,
  RARITIES,
  RARITY_FAMILIES,
  type RarityFamily,
} from './types';

/**
 * A synthetic ladder, not the shipped one.
 *
 * `core/` may not import `data/` — content arrives as an argument precisely so the algorithm can
 * be driven from fixtures — so this spec proves the **cost arithmetic** and `data/ascension.spec.ts`
 * proves the shipped tables hit their design targets. Splitting them that way means a retune of
 * the content cannot break a test of the arithmetic, or the other way round.
 *
 * The numbers are deliberately distinct per rung, so an off-by-one in the indexing shows up as a
 * wrong total rather than hiding inside a run of equal values. They are also deliberately *not*
 * the shipped ones, so a copy of the real table into a spec would be visible.
 */
const FIXTURE: AscensionRules = {
  //  common  common+  rare  rare+ │ elite  elite+  leg  leg+  myth  myth+ │ ★1 ★2 ★3 ★4 ★5
  mortal: [7, 9, 3, 5, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2],
  celestial: [7, 9, 3, 5, 1, 2, 2, 2, 2, 4, 2, 2, 2, 2, 2],
};

const ELITE = rarityIndex('elite');
const ASCENDED = rarityIndex('ascended');

describe('the ladder', () => {
  it('is sixteen rungs from common to ascended-5', () => {
    expect(RARITIES).toHaveLength(16);
    expect(RARITIES[0]).toBe('common');
    expect(RARITIES[MAX_RARITY_INDEX]).toBe('ascended-5');
  });

  it('clamps damaged indices into range rather than throwing', () => {
    expect(clampRarityIndex(-3)).toBe(0);
    expect(clampRarityIndex(99)).toBe(MAX_RARITY_INDEX);
    expect(clampRarityIndex(Number.NaN)).toBe(0);
    expect(clampRarityIndex(4.7)).toBe(4);
  });

  it('starts each of the three tiers on a rung of its own', () => {
    // The whole tier gap lives here. Every rung costs every character the same, so what a tier is
    // worth in copies is exactly the rungs it never has to climb.
    expect(startRarityIndex('ascended')).toBe(ELITE);
    expect(startRarityIndex('legendary')).toBe(rarityIndex('rare'));
    expect(startRarityIndex('common')).toBe(0);
  });

  it('anchors the stat ladder at rare, two rungs above where a common-tier character starts', () => {
    // ⚠️ The load-bearing asymmetry. `startRarityIndex` says where a tier joins the ladder;
    // `growthFloor` says where its multiplier starts counting. They differ only for common tier,
    // and only because the two rungs below `rare` were added to make that tier cost more rather
    // than to make it stronger. Paying them a multiplier would make every common-tier character
    // ×perAscension² stronger at every rarity and put the whole stage ladder out of tune.
    expect(growthFloor('common')).toBe(rarityIndex('rare'));
    expect(startRarityIndex('common')).toBe(rarityIndex('common'));

    // The other two tiers start at or above `rare`, so nothing about them moved.
    expect(growthFloor('legendary')).toBe(startRarityIndex('legendary'));
    expect(growthFloor('ascended')).toBe(startRarityIndex('ascended'));
  });

  it('labels rungs the way the UI shows them', () => {
    expect(rarityLabel(rarityIndex('common'))).toBe('Common');
    expect(rarityLabel(rarityIndex('common-plus'))).toBe('Common+');
    expect(rarityLabel(rarityIndex('rare'))).toBe('Rare');
    expect(rarityLabel(rarityIndex('rare-plus'))).toBe('Rare+');
    expect(rarityLabel(rarityIndex('legendary-plus'))).toBe('Legendary+');
    expect(rarityLabel(rarityIndex('ascended'))).toBe('Ascended');
    expect(rarityLabel(rarityIndex('ascended-3'))).toBe('Ascended ★★★');
    expect(rarityAt(MAX_RARITY_INDEX)).toBe('ascended-5');
  });

  it('reports an unknown rarity id as -1 rather than guessing', () => {
    expect(rarityIndex('mythril')).toBe(-1);
  });
});

/**
 * A rung costs a flat number of copies of the character itself, so the whole of the arithmetic is
 * a lookup and a sum over a slice. These are the properties that has to keep.
 */
describe('what a climb costs in base copies', () => {
  it('costs nothing more to be at a rarity already reached', () => {
    expect(copyCost(FIXTURE, 'mortal', ELITE, ELITE)).toBe(0);
    expect(copyCost(FIXTURE, 'mortal', ELITE, 0)).toBe(0);
  });

  it('reads a single rung straight off the table', () => {
    expect(ascensionCost(FIXTURE, 'mortal', 0)).toBe(7);
    expect(ascensionCost(FIXTURE, 'mortal', 1)).toBe(9);
    expect(ascensionCost(FIXTURE, 'celestial', ELITE)).toBe(1);
  });

  it('sums a span of rungs', () => {
    // The two rungs below rare, then the two below elite.
    expect(copyCost(FIXTURE, 'mortal', 0, 2)).toBe(16);
    expect(copyCost(FIXTURE, 'mortal', 0, ELITE)).toBe(24);
  });

  it('charges the celestial ladder more above elite and the same below it', () => {
    // The four rungs below elite are the tier gap, and a celestial common-tier character is
    // common-tier for the same reason everyone else's is. Charging twice for that would be
    // charging twice for one thing.
    expect(copyCost(FIXTURE, 'celestial', 0, ELITE)).toBe(copyCost(FIXTURE, 'mortal', 0, ELITE));
    expect(copyCost(FIXTURE, 'celestial', ELITE, ASCENDED)).toBeGreaterThan(
      copyCost(FIXTURE, 'mortal', ELITE, ASCENDED),
    );
  });

  it('rises monotonically up the ladder', () => {
    let previous = 0;
    for (let target = ELITE; target <= MAX_RARITY_INDEX; target++) {
      const total = copyCost(FIXTURE, 'mortal', ELITE, target);
      expect(total).toBeGreaterThanOrEqual(previous);
      previous = total;
    }
  });

  it('has no rung above the top of the ladder', () => {
    expect(ascensionCost(FIXTURE, 'mortal', MAX_RARITY_INDEX)).toBeUndefined();
  });

  it('sums the per-rung costs back to the full climb, plus the first copy', () => {
    // `fullAscensionCost` counts the copy that got the character onto the ladder, because that is
    // the number a player would count: how many of this character do I have to see in total.
    let total = 1;
    for (let from = ELITE; from < MAX_RARITY_INDEX; from++) {
      total += ascensionCost(FIXTURE, 'mortal', from) ?? 0;
    }
    expect(total).toBe(fullAscensionCost(FIXTURE, 'mortal', 'ascended'));
  });

  it('prices the three tiers apart by exactly the rungs each one skips', () => {
    const common = fullAscensionCost(FIXTURE, 'mortal', 'common');
    const legendary = fullAscensionCost(FIXTURE, 'mortal', 'legendary');
    const ascended = fullAscensionCost(FIXTURE, 'mortal', 'ascended');

    expect(common).toBeGreaterThan(legendary);
    expect(legendary).toBeGreaterThan(ascended);
    expect(common - legendary).toBe(copyCost(FIXTURE, 'mortal', 0, rarityIndex('rare')));
    expect(legendary - ascended).toBe(copyCost(FIXTURE, 'mortal', rarityIndex('rare'), ELITE));
  });

  it('treats a rung a short ladder does not author as free rather than throwing', () => {
    // A fixture ladder is allowed to be short. A missing rung that reads as free is a visibly
    // wrong number a spec can catch, which is the better failure than a crash on a device.
    const short: AscensionRules = { mortal: [4, 4], celestial: [] };

    expect(ascensionCost(short, 'mortal', 9)).toBe(0);
    expect(copyCost(short, 'mortal', 0, MAX_RARITY_INDEX)).toBe(8);
  });

  it('never charges a negative or fractional number of copies', () => {
    const damaged: AscensionRules = { mortal: [-5, 2.7, Number.NaN], celestial: [] };

    expect(ascensionCost(damaged, 'mortal', 0)).toBe(0);
    expect(ascensionCost(damaged, 'mortal', 1)).toBe(2);
    expect(ascensionCost(damaged, 'mortal', 2)).toBe(0);
  });
});

describe('rarity families', () => {
  it('sorts every rung on the ladder into a known family', () => {
    // Derived from RARITIES rather than from a retyped list, so a rung added without deciding
    // its family fails here instead of rendering uncoloured.
    const families = RARITIES.map((_, index) => rarityFamily(index));

    expect(families).toHaveLength(RARITIES.length);
    for (const family of families) {
      expect(RARITY_FAMILIES).toContain(family);
    }
  });

  it('keeps a rung and its +variant in the same family', () => {
    // The whole reason families exist: `Rare` and `Rare+` are one kind of thing, and the label
    // already carries the step within it.
    for (const [index, id] of RARITIES.entries()) {
      if (id.endsWith('-plus')) {
        expect(rarityFamily(index)).toBe(rarityFamily(index - 1));
      }
    }
  });

  it('folds all six ascended rungs together', () => {
    const ascended = RARITIES.map((_, index) => index).filter(
      (index) => rarityFamily(index) === 'ascended',
    );

    // `ascended` plus ★1–★5. Stars are a step inside the family, not a family each.
    expect(ascended).toHaveLength(6);
    expect(rarityAt(ascended[0])).toBe('ascended');
    expect(rarityAt(ascended.at(-1) ?? -1)).toBe('ascended-5');
  });

  it('names the family every rung starts in', () => {
    const at = (id: string): RarityFamily => rarityFamily(rarityIndex(id));

    expect(at('common')).toBe('common');
    expect(at('common-plus')).toBe('common');
    expect(at('rare')).toBe('rare');
    expect(at('elite-plus')).toBe('elite');
    expect(at('legendary')).toBe('legendary');
    expect(at('mythic-plus')).toBe('mythic');
    expect(at('ascended-3')).toBe('ascended');
  });

  it('clamps an out-of-range index rather than throwing', () => {
    // Same contract as rarityAt: a damaged save yields the bottom rung, not an exception.
    expect(rarityFamily(-5)).toBe('common');
    expect(rarityFamily(999)).toBe('ascended');
    expect(rarityFamily(Number.NaN)).toBe('common');
  });
});
