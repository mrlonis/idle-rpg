// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  ascensionCost,
  clampRarityIndex,
  copyCost,
  fodderBaseCopies,
  fullAscensionCost,
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
 * be driven from fixtures — so this spec proves the **cost resolution** and `data/ascension.spec.ts`
 * proves the shipped tables derive to their design targets. Splitting them that way means a
 * retune of the content cannot break a test of the arithmetic, or the other way round.
 *
 * The shape mirrors the real mortal ladder closely enough to exercise every branch: self clauses,
 * faction clauses, and a run of identical star rungs.
 */
const FIXTURE: AscensionRules = {
  mortal: [
    [{ scope: 'self', rarity: 0, count: 2 }], // rare → rare+
    [{ scope: 'faction', rarity: 1, count: 2 }], // rare+ → elite
    [{ scope: 'self', rarity: 2, count: 1 }], // elite → elite+
    [{ scope: 'faction', rarity: 3, count: 2 }], // elite+ → legendary
    [{ scope: 'self', rarity: 3, count: 1 }], // legendary → legendary+
    [{ scope: 'faction', rarity: 5, count: 1 }], // legendary+ → mythic
    [{ scope: 'faction', rarity: 5, count: 1 }], // mythic → mythic+
    [{ scope: 'self', rarity: 3, count: 2 }], // mythic+ → ascended
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
  ],
  celestial: [
    [{ scope: 'self', rarity: 0, count: 2 }],
    [{ scope: 'self', rarity: 1, count: 2 }],
    [{ scope: 'self', rarity: 2, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 2 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
  ],
};

const ELITE = rarityIndex('elite');
const ASCENDED = rarityIndex('ascended');

describe('the ladder', () => {
  it('is fourteen rungs from rare to ascended-5', () => {
    expect(RARITIES).toHaveLength(14);
    expect(RARITIES[0]).toBe('rare');
    expect(RARITIES[MAX_RARITY_INDEX]).toBe('ascended-5');
  });

  it('clamps damaged indices into range rather than throwing', () => {
    expect(clampRarityIndex(-3)).toBe(0);
    expect(clampRarityIndex(99)).toBe(MAX_RARITY_INDEX);
    expect(clampRarityIndex(Number.NaN)).toBe(0);
    expect(clampRarityIndex(4.7)).toBe(4);
  });

  it('starts ascended-tier characters at elite and everyone else at rare', () => {
    expect(startRarityIndex('ascended')).toBe(ELITE);
    expect(startRarityIndex('legendary')).toBe(0);
    expect(startRarityIndex('common')).toBe(0);
  });

  it('labels rungs the way the UI shows them', () => {
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
 * The heart of it: rungs are quoted in **ascended** copies, and a player only ever holds base
 * ones. Every requirement therefore has to be resolved recursively, and these are the numbers
 * that recursion produces.
 */
describe('resolving rungs into base copies', () => {
  it('costs one copy to be at a rarity already reached', () => {
    expect(copyCost(FIXTURE, 'mortal', ELITE, ELITE)).toEqual({ self: 1, faction: 0 });
    expect(copyCost(FIXTURE, 'mortal', ELITE, 0)).toEqual({ self: 1, faction: 0 });
  });

  it('resolves a self clause into the full cost of building that copy', () => {
    // `rare → rare+` asks for 2 more copies at rare, each costing exactly itself.
    expect(copyCost(FIXTURE, 'mortal', 0, 1)).toEqual({ self: 3, faction: 0 });
  });

  it('resolves a faction clause into fodder priced from the bottom of the ladder', () => {
    // `rare+ → elite` asks for 2 faction-mates at rare+, and each of those is 3 rare copies.
    expect(copyCost(FIXTURE, 'mortal', 0, 2)).toEqual({ self: 3, faction: 6 });
  });

  it('keeps the two halves separate, because they are not interchangeable', () => {
    // The `self` half can only ever be paid by that exact character — which is what makes an
    // unlucky banner painful — and the `faction` half by anyone sharing its faction.
    const cost = copyCost(FIXTURE, 'mortal', ELITE, ASCENDED);

    expect(cost.self).toBeGreaterThan(0);
    expect(cost.faction).toBeGreaterThan(0);
  });

  it('charges a celestial ladder entirely in the character itself', () => {
    for (let from = 0; from < MAX_RARITY_INDEX; from++) {
      expect(ascensionCost(FIXTURE, 'celestial', 0, from)?.faction).toBe(0);
    }
    expect(copyCost(FIXTURE, 'celestial', ELITE, ASCENDED).faction).toBe(0);
  });

  it('prices a rare-start character the same whether it is ascending or being fed', () => {
    // A character being ascended and a character being fed to something else walk the same
    // ladder, so the two prices have to agree. If they ever diverge, one of them is wrong.
    for (let target = 0; target <= MAX_RARITY_INDEX; target++) {
      const cost = copyCost(FIXTURE, 'mortal', 0, target);
      expect(cost.self + cost.faction).toBe(fodderBaseCopies(FIXTURE, target));
    }
  });

  it('rises monotonically up the ladder', () => {
    let previous = 0;
    for (let target = ELITE; target <= MAX_RARITY_INDEX; target++) {
      const cost = copyCost(FIXTURE, 'mortal', ELITE, target);
      const total = cost.self + cost.faction;
      expect(total).toBeGreaterThanOrEqual(previous);
      previous = total;
    }
  });

  it('has no rung above the top of the ladder', () => {
    expect(ascensionCost(FIXTURE, 'mortal', ELITE, MAX_RARITY_INDEX)).toBeUndefined();
  });

  it('sums the per-rung costs back to the cumulative cost', () => {
    let self = 1;
    let faction = 0;
    for (let from = ELITE; from < MAX_RARITY_INDEX; from++) {
      const step = ascensionCost(FIXTURE, 'mortal', ELITE, from);
      self += step?.self ?? 0;
      faction += step?.faction ?? 0;
    }
    expect({ self, faction }).toEqual(fullAscensionCost(FIXTURE, 'mortal', 'ascended'));
  });

  it('makes a rare-start character cost more than an elite-start one to max', () => {
    // The ascended tier's head start is most of what it is worth: the two rungs it skips are the
    // ones paid for with the largest volume of bodies.
    const rareStart = fullAscensionCost(FIXTURE, 'mortal', 'common');
    const eliteStart = fullAscensionCost(FIXTURE, 'mortal', 'ascended');

    expect(rareStart.self).toBeGreaterThan(eliteStart.self);
    expect(rareStart.faction).toBeGreaterThan(eliteStart.faction);
  });

  it('ignores a rung with a non-positive count instead of charging for it', () => {
    const zeroed: AscensionRules = {
      mortal: [[{ scope: 'self', rarity: 0, count: 0 }], ...FIXTURE.mortal.slice(1)],
      celestial: FIXTURE.celestial,
    };

    expect(copyCost(zeroed, 'mortal', 0, 1)).toEqual({ self: 1, faction: 0 });
  });

  it('terminates on a malformed ladder instead of hanging', () => {
    // A rung that asks for a copy at or above its own target rarity is a cycle. Authored content
    // is repo content, so this is a bug for a spec to catch — but it must surface as a wrong
    // number rather than as a frozen device.
    const cyclic: AscensionRules = {
      mortal: [[{ scope: 'self', rarity: 5, count: 1 }], [], [], [], [], [], [], [], [], [], []],
      celestial: [],
    };

    expect(() => copyCost(cyclic, 'mortal', 0, 6)).not.toThrow();
  });
});

describe('rarity families', () => {
  it('sorts every rung on the ladder into a known family', () => {
    // Derived from RARITIES rather than from a retyped list, so a fourteenth-and-a-half rung
    // added without deciding its family fails here instead of rendering uncoloured.
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

    expect(at('rare')).toBe('rare');
    expect(at('elite-plus')).toBe('elite');
    expect(at('legendary')).toBe('legendary');
    expect(at('mythic-plus')).toBe('mythic');
    expect(at('ascended-3')).toBe('ascended');
  });

  it('clamps an out-of-range index rather than throwing', () => {
    // Same contract as rarityAt: a damaged save yields the bottom rung, not an exception.
    expect(rarityFamily(-5)).toBe('rare');
    expect(rarityFamily(999)).toBe('ascended');
    expect(rarityFamily(Number.NaN)).toBe('rare');
  });
});
