// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { ATB_THRESHOLD } from '../battle/clock';
import { toCombatStats } from '../battle/content';
import { num, ZERO } from '../numeric';
import { TEST_ALPHA, TEST_CHARACTERS, TEST_DELTA } from '../roster/fixtures';
import { type OwnedCharacter } from '../roster/types';
import { type GameState, newGame } from '../state';
import {
  addGear,
  alloyStep,
  canEnhance,
  enhance,
  enhanceCost,
  enhanceToAffordable,
  equip,
  equippedBy,
  findGear,
  goldStep,
  investedAlloy,
  repairLoadouts,
  salvage,
  salvageValue,
  unequip,
  unequippedGear,
  useAsMaterial,
} from './inventory';
import { dropCount, gradeWeights, rollDrops, weightedIndex } from './roll';
import { buyGear, gearShopOffers, gearShopSlot, msUntilRestock, offerPrice } from './shop';
import {
  applyGearBonus,
  clampGearLevel,
  gearLookup,
  gearScale,
  isAligned,
  itemBonus,
  loadoutBonus,
  maxGearLevel,
  maxLoadoutBonus,
} from './stats';
import { type GearItem, type GearRulesData } from './types';

/**
 * Gear, driven from fixtures rather than from shipped content.
 *
 * `core/` may not import `data/`, and a spec that reached for the real grade ladder would fail
 * every time a grade was retuned — which is the coupling that rule exists to prevent. The one
 * assertion here that genuinely has to hold against *shipped* numbers is the haste bound, and it
 * lives in `data/gear.spec.ts` where the shipped numbers are.
 */
const RULES: GearRulesData = {
  grades: [
    {
      id: 'plain',
      name: 'Plain',
      multiplier: 1,
      maxLevel: 5,
      salvage: 10,
      weight: 100,
      priceSeconds: 10,
    },
    {
      id: 'good',
      name: 'Good',
      multiplier: 2,
      maxLevel: 10,
      salvage: 40,
      weight: 20,
      priceSeconds: 60,
    },
  ],
  profiles: {
    tank: {
      head: { hp: 0.1 },
      arms: { atk: 0.1 },
      chest: { hp: 0.2 },
      legs: { def: 0.1 },
      boots: { haste: 0.05 },
    },
    brawler: {
      head: { hp: 0.05, atk: 0.05 },
      arms: { atk: 0.2 },
      chest: { hp: 0.2, def: 0.1 },
      legs: { def: 0.1 },
      boots: { haste: 0.1, atk: 0.05 },
    },
    mage: {
      head: { atk: 0.1 },
      arms: { atk: 0.3 },
      chest: { hp: 0.1 },
      legs: { def: 0.05 },
      boots: { haste: 0.1 },
    },
    ranger: {
      head: { atk: 0.1 },
      arms: { atk: 0.25 },
      chest: { hp: 0.1 },
      legs: { def: 0.05 },
      boots: { haste: 0.15 },
    },
    support: {
      head: { hp: 0.1 },
      arms: { atk: 0.05 },
      chest: { hp: 0.2 },
      legs: { def: 0.1 },
      boots: { haste: 0.08 },
    },
  },
  perLevel: 0.25,
  alignmentBonus: 1.5,
  unalignedChance: 0.5,
  enhance: {
    alloy: { coefficient: 10, exponent: 1 },
    gold: { coefficient: 100, exponent: 2 },
  },
  drops: { normal: 1, miniBoss: 2, boss: 3, gradeSoftness: 10 },
  shop: { offers: 3, refreshMs: 1000, minGoldPerSecond: 1 },
  inventoryLimit: 4,
};

const T0 = 1_700_000_000_000;

function item(over: Partial<GearItem> = {}): GearItem {
  return {
    id: 'g1',
    slot: 'chest',
    archetype: 'brawler',
    grade: 0,
    alignment: undefined,
    level: 1,
    ...over,
  };
}

/** A run holding `gear`, with `roster` wearing whatever their loadouts say. */
function run(over: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 42, nowMs: T0 }), ...over };
}

function owner(defId: string, gear: Record<string, string> = {}): OwnedCharacter {
  return { defId, rarity: 0, level: 1, copies: 0, gear };
}

describe('gearScale', () => {
  it('is the grade multiplier alone at level 1, unaligned', () => {
    expect(gearScale(RULES, item({ grade: 1 }), 'test-mortal')).toBe(2);
  });

  it('grows linearly with enhancement level rather than compounding', () => {
    // The one place gear deliberately does not copy the character curve. An exponential of the
    // same reach would put a finished set orders of magnitude ahead of an empty one.
    const at = (level: number) => gearScale(RULES, item({ level }), undefined);

    expect(at(1)).toBe(1);
    expect(at(3)).toBeCloseTo(1.5, 10);
    expect(at(5)).toBeCloseTo(2, 10);
    expect(at(5) - at(4)).toBeCloseTo(at(3) - at(2), 10);
  });

  it('pays the alignment bonus only when the wearer’s faction matches', () => {
    const aligned = item({ alignment: 'test-mortal' });

    expect(gearScale(RULES, aligned, 'test-mortal')).toBe(1.5);
    expect(gearScale(RULES, aligned, 'test-celestial')).toBe(1);
    // An unaligned piece is worth the same on everybody — it is never worth *less*.
    expect(gearScale(RULES, item(), 'test-mortal')).toBe(1);
  });

  it('clamps a level above the grade’s cap rather than paying for it', () => {
    expect(clampGearLevel(RULES, 0, 99)).toBe(maxGearLevel(RULES, 0));
    expect(gearScale(RULES, item({ level: 99 }), undefined)).toBe(
      gearScale(RULES, item({ level: 5 }), undefined),
    );
  });

  it('treats a grade this build does not ship as worth nothing', () => {
    // Clamped rather than thrown on, and clamped *down*: inventing a grade would hand a player a
    // stat bonus for content that does not exist.
    expect(gearScale(RULES, item({ grade: 99 }), undefined)).toBe(2);
    expect(gearScale(RULES, item({ grade: -3 }), undefined)).toBe(1);
  });
});

describe('itemBonus and loadoutBonus', () => {
  it('reports only the stats the piece’s profile names', () => {
    expect(itemBonus(RULES, item({ slot: 'arms' }), undefined)).toEqual({ atk: 0.2 });
  });

  it('sums across the loadout rather than compounding', () => {
    // Summed, so every piece is worth what it says whatever else is worn. Compounding would make
    // the last piece the most valuable and a four-fifths set feel like a punishment.
    const bag = [item({ id: 'a', slot: 'arms' }), item({ id: 'b', slot: 'chest' })];

    expect(loadoutBonus(RULES, { arms: 'a', chest: 'b' }, gearLookup(bag), undefined)).toEqual({
      atk: 0.2,
      hp: 0.2,
      def: 0.1,
    });
  });

  it('contributes nothing for a slot pointing at a piece the run does not hold', () => {
    // A read path takes the save layer's posture: damage costs a stat bonus, never a run.
    expect(loadoutBonus(RULES, { chest: 'ghost' }, gearLookup([]), undefined)).toEqual({});
  });
});

describe('applyGearBonus', () => {
  const base = { hp: 1000, atk: 100, def: 50, haste: 80, critChance: 0.05, critDamageAmp: 0.6 };

  it('multiplies each stat by one plus its share', () => {
    const grown = applyGearBonus(base, { hp: 0.5, atk: 0.2, haste: 0.25 });

    expect(num(grown.hp).eq(1500)).toBe(true);
    expect(num(grown.atk).eq(120)).toBe(true);
    expect(num(grown.def).eq(50)).toBe(true);
    expect(grown.haste).toBe(100);
  });

  it('returns the block untouched when the bonus is empty', () => {
    // Identity rather than a re-encoded copy, so an ungeared character costs nothing to resolve.
    expect(applyGearBonus(base, {})).toBe(base);
  });

  it('keeps quantities exact past float64’s safe integer range', () => {
    const huge = applyGearBonus({ ...base, hp: '1e+21' }, { hp: 1 });

    expect(num(huge.hp).eq('2e+21')).toBe(true);
  });

  it('leaves haste a plain number the combat clamp can still read', () => {
    const grown = applyGearBonus(base, { haste: 0.5 });

    expect(typeof grown.haste).toBe('number');
    expect(toCombatStats(grown).haste).toBe(120);
  });

  it('cannot push haste past the ATB threshold even on absurd content', () => {
    // ⚠️ The termination argument, not a balance knob: a combatant gaining more than
    // `ATB_THRESHOLD` gauge per tick could bank two actions in one tick. `content.ts` is the
    // backstop; `data/gear.spec.ts` is what asserts the shipped numbers stay far away from it.
    const absurd = applyGearBonus(base, { haste: 1000 });

    expect(toCombatStats(absurd).haste).toBe(ATB_THRESHOLD);
  });
});

describe('maxLoadoutBonus', () => {
  it('is every slot at the top grade, fully enhanced and aligned', () => {
    // Derived rather than restated, which is what lets the haste bound be asserted against
    // content that is still being retuned.
    const top = maxLoadoutBonus(RULES, 'mage');
    const scale = 2 * (1 + 0.25 * 9) * 1.5;

    expect(top.atk).toBeCloseTo(0.4 * scale, 10);
    expect(top.haste).toBeCloseTo(0.1 * scale, 10);
  });
});

describe('addGear', () => {
  it('mints ids from the counter rather than reusing one', () => {
    const first = addGear(
      run(),
      [{ slot: 'head', archetype: 'tank', grade: 0, alignment: undefined }],
      RULES,
    );
    const second = addGear(
      first.state,
      [{ slot: 'head', archetype: 'tank', grade: 0, alignment: undefined }],
      RULES,
    );

    expect(first.state.gear[0]?.id).toBe('g1');
    expect(second.state.gear[1]?.id).toBe('g2');
    expect(second.state.gearMinted).toBe(2);
  });

  it('keeps the best pieces and salvages the rest when the bag overflows', () => {
    // ⚠️ The bag is bounded and the value never is. A drop that overflows salvages the *worst*
    // piece of the union, so a relic arriving into a bag of junk keeps the relic.
    const junk = Array.from({ length: 4 }, () => ({
      slot: 'head' as const,
      archetype: 'tank' as const,
      grade: 0,
      alignment: undefined,
    }));
    const full = addGear(run(), junk, RULES);

    const overflowed = addGear(
      full.state,
      [{ slot: 'head', archetype: 'tank', grade: 1, alignment: undefined }],
      RULES,
    );

    expect(overflowed.state.gear).toHaveLength(RULES.inventoryLimit);
    expect(overflowed.salvaged).toBe(1);
    expect(overflowed.state.gear.some((held) => held.grade === 1)).toBe(true);
    // The value of the salvaged piece is in the wallet, not gone.
    expect(overflowed.state.wallet.alloy.eq(RULES.grades[0]?.salvage ?? 0)).toBe(true);
  });

  it('never salvages an equipped piece to make room', () => {
    // ⚠️ Milestone 3's settled law, in its gear spelling: only spares are ever consumed.
    const stocked = addGear(
      run(),
      Array.from({ length: 4 }, () => ({
        slot: 'chest' as const,
        archetype: 'brawler' as const,
        grade: 0,
        alignment: undefined,
      })),
      RULES,
    );
    const worn = { ...stocked.state, roster: [owner(TEST_ALPHA.id, { chest: 'g1' })] };

    const after = addGear(
      worn,
      [{ slot: 'chest', archetype: 'brawler', grade: 0, alignment: undefined }],
      RULES,
    );

    expect(after.state.gear.some((held) => held.id === 'g1')).toBe(true);
    expect(unequippedGear(after.state)).toHaveLength(RULES.inventoryLimit);
  });
});

describe('salvage and enhancement', () => {
  const stocked = (): GameState => {
    const seeded = addGear(
      run(),
      [
        { slot: 'chest', archetype: 'brawler', grade: 1, alignment: undefined },
        { slot: 'head', archetype: 'brawler', grade: 0, alignment: undefined },
      ],
      RULES,
    );
    return { ...seeded.state, wallet: { ...seeded.state.wallet, gold: num(1e9), alloy: num(1e6) } };
  };

  it('charges alloy and gold to raise a level', () => {
    const before = stocked();
    const cost = enhanceCost(RULES, findGear(before, 'g1') ?? item());
    const result = enhance(before, 'g1', RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findGear(result.state, 'g1')?.level).toBe(2);
      expect(before.wallet.alloy.sub(result.state.wallet.alloy).eq(cost.alloy ?? ZERO)).toBe(true);
      expect(before.wallet.gold.sub(result.state.wallet.gold).eq(cost.gold ?? ZERO)).toBe(true);
    }
  });

  it('refuses at the grade’s cap rather than charging for nothing', () => {
    const capped = { ...stocked() };
    const maxed = {
      ...capped,
      gear: capped.gear.map((held) =>
        held.id === 'g1' ? { ...held, level: maxGearLevel(RULES, held.grade) } : held,
      ),
    };

    expect(canEnhance(RULES, findGear(maxed, 'g1') ?? item())).toBe(false);
    expect(enhance(maxed, 'g1', RULES)).toEqual({ ok: false, reason: 'max-level' });
  });

  it('refuses when the wallet cannot cover the step', () => {
    const broke = { ...stocked(), wallet: { ...stocked().wallet, gold: ZERO } };

    expect(enhance(broke, 'g1', RULES)).toEqual({ ok: false, reason: 'insufficient-currency' });
  });

  it('raises as far as the wallet reaches and stops without erroring', () => {
    const thin = stocked();
    const budget = {
      ...thin,
      wallet: {
        ...thin.wallet,
        gold: num(alloyStep(RULES, 1) + goldStep(RULES, 1) + goldStep(RULES, 2)),
      },
    };

    const result = enhanceToAffordable(budget, 'g1', RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findGear(result.state, 'g1')?.level).toBeGreaterThan(1);
    }
  });

  it('returns every point ever invested when a piece is salvaged', () => {
    // Deliberate generosity: a player can always undo an enhancement decision by feeding the
    // piece into a better one, which is the same promise `ascend` makes about levelled characters.
    const raised = enhanceToAffordable(stocked(), 'g1', RULES);
    expect(raised.ok).toBe(true);
    if (!raised.ok) {
      return;
    }
    const piece = findGear(raised.state, 'g1') ?? item();
    const expected = (RULES.grades[1]?.salvage ?? 0) + investedAlloy(RULES, piece);

    const melted = salvage(raised.state, ['g1'], RULES);

    expect(salvageValue(RULES, piece)).toBe(expected);
    expect(melted.ok).toBe(true);
    if (melted.ok) {
      expect(melted.state.wallet.alloy.sub(raised.state.wallet.alloy).eq(expected)).toBe(true);
      expect(findGear(melted.state, 'g1')).toBeUndefined();
    }
  });

  it('refuses to salvage anything when one of the named pieces is worn', () => {
    // All or nothing rather than a partial success: a multi-select destructive action reporting
    // "done" while having skipped some of the selection is how a player loses track of what went.
    const worn = { ...stocked(), roster: [owner(TEST_ALPHA.id, { chest: 'g1' })] };

    expect(salvage(worn, ['g1', 'g2'], RULES)).toEqual({ ok: false, reason: 'item-equipped' });
    expect(findGear(worn, 'g2')).toBeDefined();
  });

  it('feeds pieces into another one in a single action, banking the remainder', () => {
    const before = { ...stocked(), wallet: { ...stocked().wallet, alloy: ZERO } };

    const result = useAsMaterial(before, 'g1', ['g2'], RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findGear(result.state, 'g2')).toBeUndefined();
      // Whatever the material was worth beyond the levels it bought stays spendable rather than
      // evaporating into the piece it was fed to.
      expect(result.state.wallet.alloy.gte(ZERO)).toBe(true);
    }
  });

  it('refuses to feed a piece into itself', () => {
    expect(useAsMaterial(stocked(), 'g1', ['g1'], RULES)).toEqual({
      ok: false,
      reason: 'material-is-target',
    });
  });

  it('keeps the salvage when the material does not add up to a level', () => {
    // The pieces are gone and their alloy is in the wallet, which is the honest outcome. Reporting
    // failure would discard the salvage and leave the player short the gear they chose to melt.
    const poor = { ...stocked(), wallet: { ...stocked().wallet, gold: ZERO, alloy: ZERO } };

    const result = useAsMaterial(poor, 'g1', ['g2'], RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findGear(result.state, 'g2')).toBeUndefined();
      expect(result.state.wallet.alloy.gt(ZERO)).toBe(true);
    }
  });
});

describe('equip and unequip', () => {
  const stocked = (): GameState => {
    const seeded = addGear(
      run(),
      [
        { slot: 'chest', archetype: 'brawler', grade: 0, alignment: undefined },
        { slot: 'chest', archetype: 'mage', grade: 0, alignment: undefined },
      ],
      RULES,
    );
    return { ...seeded.state, roster: [owner(TEST_ALPHA.id), owner(TEST_DELTA.id)] };
  };

  it('puts a matching piece in its own slot', () => {
    const result = equip(stocked(), TEST_ALPHA.id, 'g1', TEST_CHARACTERS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.roster[0]?.gear).toEqual({ chest: 'g1' });
    }
  });

  it('refuses a piece forged for a different archetype', () => {
    // ⚠️ Checked here rather than only in the UI. Hiding the option leaves a stale snapshot or a
    // deep link able to produce a loadout the simulation would happily pay out on.
    expect(equip(stocked(), TEST_ALPHA.id, 'g2', TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'wrong-archetype',
    });
  });

  it('takes the piece off whoever else was wearing it rather than refusing', () => {
    // One object has one wearer. "Unequip it from Rin first" is a step that exists only to make
    // the player navigate somewhere else and come back.
    const shared = {
      ...stocked(),
      roster: [owner(TEST_ALPHA.id, { chest: 'g1' }), owner('beta')],
    };

    const result = equip(shared, 'beta', 'g1', TEST_CHARACTERS);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.roster[0]?.gear).toEqual({});
      expect(result.state.roster[1]?.gear).toEqual({ chest: 'g1' });
      expect([...equippedBy(result.state).entries()]).toEqual([['g1', 'beta']]);
    }
  });

  it('reports an empty slot rather than silently doing nothing', () => {
    expect(unequip(stocked(), TEST_ALPHA.id, 'chest')).toEqual({ ok: false, reason: 'slot-empty' });
  });

  it('leaves an unequipped piece in the bag', () => {
    const worn = { ...stocked(), roster: [owner(TEST_ALPHA.id, { chest: 'g1' })] };

    const result = unequip(worn, TEST_ALPHA.id, 'chest');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(findGear(result.state, 'g1')).toBeDefined();
      expect(unequippedGear(result.state)).toHaveLength(2);
    }
  });
});

describe('repairLoadouts', () => {
  const bag = (gear: readonly GearItem[], roster: readonly OwnedCharacter[]): GameState =>
    run({ gear, roster, gearMinted: gear.length });

  it('leaves a healthy save as the same object', () => {
    // Identity is what lets this run on every load, like `reconcileClearedStages`, without
    // republishing a snapshot and re-rendering every screen.
    const healthy = bag([item({ id: 'g1' })], [owner(TEST_ALPHA.id, { chest: 'g1' })]);

    expect(repairLoadouts(healthy, TEST_CHARACTERS, RULES)).toBe(healthy);
  });

  it('drops a piece naming a slot or archetype this build does not ship', () => {
    const damaged = bag(
      [
        item({ id: 'g1', slot: 'greaves' as GearItem['slot'] }),
        item({ id: 'g2', archetype: 'druid' as GearItem['archetype'] }),
      ],
      [],
    );

    expect(repairLoadouts(damaged, TEST_CHARACTERS, RULES).gear).toEqual([]);
  });

  it('clamps a level above its grade’s cap instead of dropping the piece', () => {
    // The object is real; only its progress is wrong. Same distinction `readRoster` draws.
    const damaged = bag([item({ id: 'g1', level: 500 })], []);

    expect(repairLoadouts(damaged, TEST_CHARACTERS, RULES).gear[0]?.level).toBe(
      maxGearLevel(RULES, 0),
    );
  });

  it('drops a reference to a piece sitting in the wrong slot', () => {
    const damaged = bag(
      [item({ id: 'g1', slot: 'head' })],
      [owner(TEST_ALPHA.id, { chest: 'g1' })],
    );

    expect(repairLoadouts(damaged, TEST_CHARACTERS, RULES).roster[0]?.gear).toEqual({});
  });

  it('drops a reference whose archetype no longer matches its wearer', () => {
    // Reachable with no corruption at all: a build that re-authors a character's role gets here.
    const stale = bag(
      [item({ id: 'g1', archetype: 'mage' })],
      [owner(TEST_ALPHA.id, { chest: 'g1' })],
    );

    expect(repairLoadouts(stale, TEST_CHARACTERS, RULES).roster[0]?.gear).toEqual({});
  });

  it('leaves a doubly claimed piece with the first claimant only', () => {
    // ⚠️ Leaving both is the one shape that pays a bonus twice.
    const doubled = bag(
      [item({ id: 'g1' })],
      [owner(TEST_ALPHA.id, { chest: 'g1' }), owner('beta', { chest: 'g1' })],
    );

    const repaired = repairLoadouts(doubled, TEST_CHARACTERS, RULES);

    expect(repaired.roster[0]?.gear).toEqual({ chest: 'g1' });
    expect(repaired.roster[1]?.gear).toEqual({});
  });

  it('salvages a bag that arrives over the limit, keeping equipped pieces', () => {
    const over = bag(
      [
        item({ id: 'g1', grade: 1 }),
        item({ id: 'g2' }),
        item({ id: 'g3' }),
        item({ id: 'g4' }),
        item({ id: 'g5' }),
        item({ id: 'g6' }),
      ],
      [owner(TEST_ALPHA.id, { chest: 'g6' })],
    );

    const repaired = repairLoadouts(over, TEST_CHARACTERS, RULES);

    expect(unequippedGear(repaired)).toHaveLength(RULES.inventoryLimit);
    expect(findGear(repaired, 'g6')).toBeDefined();
    expect(findGear(repaired, 'g1')).toBeDefined();
    expect(repaired.wallet.alloy.gt(ZERO)).toBe(true);
  });
});

describe('drops', () => {
  it('pays the chapter rhythm: more from a mini-boss, most from a boss', () => {
    expect(dropCount(RULES, 'normal')).toBe(1);
    expect(dropCount(RULES, 'mini-boss')).toBe(2);
    expect(dropCount(RULES, 'boss')).toBe(3);
  });

  it('keeps the authored weights as the stage-1 distribution', () => {
    // The `1 +` in the tilt is what buys this. A bare ratio would make the top grade's weight
    // `softness ** -n` at the bottom of the ladder, so the authored number would stop describing
    // anything a reader could predict from.
    const [plain, good] = gradeWeights(RULES, 1);

    expect((good ?? 0) / (plain ?? 1)).toBeCloseTo((20 / 100) * (1 + 1 / 10), 10);
  });

  it('tilts toward better grades with depth without ever gating one out', () => {
    const shallow = gradeWeights(RULES, 1);
    const deep = gradeWeights(RULES, 500);
    const share = (weights: readonly number[]) =>
      (weights[1] ?? 0) / weights.reduce((sum, weight) => sum + weight, 0);

    expect(share(deep)).toBeGreaterThan(share(shallow));
    // Neither end ever reaches zero: a top-grade piece is reachable at stage 1, and a bottom-grade
    // one still drops (and is still worth its salvage) at the top.
    expect(share(shallow)).toBeGreaterThan(0);
    expect(deep[0]).toBeGreaterThan(0);
  });

  it('rolls a grade per piece rather than once per batch', () => {
    // What makes a boss meaningfully better than three ordinary stages rather than merely faster.
    let calls = 0;
    const draw = () => {
      calls += 1;
      return 0.999;
    };

    rollDrops(RULES, ['test-mortal'], 400, 'boss', draw);

    // Four draws per piece (slot, archetype, alignment gate, faction) plus one for the grade.
    expect(calls).toBeGreaterThanOrEqual(dropCount(RULES, 'boss') * 4);
  });

  it('is deterministic for a given draw sequence', () => {
    const sequence = () => {
      let index = 0;
      const values = [0.1, 0.3, 0.9, 0.2, 0.05, 0.4, 0.7, 0.8, 0.6, 0.5];
      return () => values[index++ % values.length] ?? 0;
    };

    expect(rollDrops(RULES, ['a', 'b'], 50, 'mini-boss', sequence())).toEqual(
      rollDrops(RULES, ['a', 'b'], 50, 'mini-boss', sequence()),
    );
  });

  it('falls back to the last entry rather than undefined on a weightless table', () => {
    expect(weightedIndex([0, 0, 0], () => 0.5)).toBe(2);
    expect(weightedIndex([], () => 0.5)).toBe(0);
  });
});

describe('the shop', () => {
  it('derives its refresh index from a clock the caller supplies', () => {
    // `core/` has no clock. The caller divides `Date.now()` by the authored period, exactly as
    // `resume(state, nowMs)` takes the time.
    expect(gearShopSlot(RULES, 5_500)).toBe(5);
    expect(msUntilRestock(RULES, 5_500)).toBe(500);
  });

  it('offers the same stock for a slot however many times it is asked', () => {
    // ⚠️ The reason there is nothing a force-quit could reroll: the stock is a function of the
    // seed and the hour, not a roll that was taken once and stored.
    const state = run();

    expect(gearShopOffers(state, RULES, ['test-mortal'], 7)).toEqual(
      gearShopOffers(state, RULES, ['test-mortal'], 7),
    );
  });

  it('offers different stock in a different hour', () => {
    const state = run();
    const ids = (slot: number) =>
      gearShopOffers(state, RULES, ['test-mortal'], slot).map(
        (offer) => `${offer.item.slot}:${offer.item.archetype}:${offer.item.grade}`,
      );

    expect(ids(7)).not.toEqual(ids(8));
  });

  it('prices in seconds of the run’s own gold income', () => {
    const earning = run({ rates: { ...newGame({ seed: 1, nowMs: T0 }).rates, gold: num(100) } });

    expect(offerPrice(RULES, 1, earning.rates.gold).eq(100 * 60)).toBe(true);
  });

  it('floors the rate so a brand-new run is not handed the shop for free', () => {
    // A fresh run earns nothing per second, and a price computed from zero is a free top-grade
    // piece on the first launch.
    expect(offerPrice(RULES, 1, ZERO).eq(RULES.shop.minGoldPerSecond * 60)).toBe(true);
  });

  it('sells an offer once and marks it taken until the shop restocks', () => {
    const rich = run({ wallet: { ...newGame({ seed: 1, nowMs: T0 }).wallet, gold: num(1e9) } });

    const bought = buyGear(rich, RULES, ['test-mortal'], 7, 1);
    expect(bought.ok).toBe(true);
    if (!bought.ok) {
      return;
    }

    expect(bought.state.gear).toHaveLength(1);
    expect(bought.state.gearShop).toEqual({ slot: 7, purchased: [1] });
    expect(gearShopOffers(bought.state, RULES, ['test-mortal'], 7)[1]?.purchased).toBe(true);
    expect(buyGear(bought.state, RULES, ['test-mortal'], 7, 1)).toEqual({
      ok: false,
      reason: 'already-purchased',
    });
  });

  it('resets the ledger on the first purchase of a new stocking', () => {
    // The reset happens the first time anybody looks after the hour turns, which is the only
    // moment it can be observed — nothing has to run on the hour.
    const rich = run({
      wallet: { ...newGame({ seed: 1, nowMs: T0 }).wallet, gold: num(1e9) },
      gearShop: { slot: 7, purchased: [0, 1, 2] },
    });

    const bought = buyGear(rich, RULES, ['test-mortal'], 8, 2);

    expect(bought.ok).toBe(true);
    if (bought.ok) {
      expect(bought.state.gearShop).toEqual({ slot: 8, purchased: [2] });
    }
  });

  it('refuses an offer index the stocking does not have', () => {
    expect(buyGear(run(), RULES, ['test-mortal'], 7, 99)).toEqual({
      ok: false,
      reason: 'unknown-offer',
    });
  });

  it('refuses when the wallet cannot cover the price', () => {
    expect(buyGear(run(), RULES, ['test-mortal'], 7, 0)).toEqual({
      ok: false,
      reason: 'insufficient-currency',
    });
  });
});

describe('isAligned', () => {
  it('is false for an unaligned piece whatever the wearer is', () => {
    expect(isAligned(item(), 'test-mortal')).toBe(false);
    expect(isAligned(item({ alignment: 'test-mortal' }), 'test-mortal')).toBe(true);
    expect(isAligned(item({ alignment: 'test-mortal' }), undefined)).toBe(false);
  });
});
