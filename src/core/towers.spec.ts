// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type EnemyFormationData, type StatBlockData } from './battle/types';
import { type GearRulesData, type GearSlot, type GearStatProfile } from './gear/types';
import { num } from './numeric';
import { type GameState, newGame } from './state';
import {
  applyTowerResult,
  clearedFloors,
  emptyTowers,
  floorKindAt,
  floorLevel,
  floorsClearedIn,
  floorSummons,
  isTowerUnlocked,
  matchedStageIndex,
  nextFloor,
  parseTowers,
  resolveFloor,
  resolveTower,
  type TowerData,
  type TowerRulesData,
} from './towers';

const SEED = 0xc0ffee;
const T0 = 1_700_000_000_000;

/**
 * The shipped rules restated as a fixture, so retuning `data/` cannot rewrite these tests.
 *
 * A hundred floors from level 1 to 60 with the campaign's mini-boss rhythm — see `data/towers.ts`
 * for the argument that a tower sits *inside* the campaign's level range rather than above it.
 */
const RULES: TowerRulesData = {
  floors: 100,
  baseLevel: 1,
  topLevel: 60,
  miniBossEvery: 10,
  floorSummons: { base: 100, miniBossMultiplier: 2, bossMultiplier: 5 },
};

const BODY: StatBlockData = {
  hp: 300,
  atk: 25,
  def: 6,
  haste: 80,
  critChance: 0.03,
  critDamageAmp: 0.5,
};

const FOE = { id: 'foe', name: 'Foe', faction: 'undead', tier: 'common', stats: BODY } as const;

function enemies(count: number): EnemyFormationData {
  return { front: Array.from({ length: count }, () => FOE), back: [] };
}

/** A tower of `floors` floors, each holding one body. Line-ups are not what these tests measure. */
function tower(floors: number, overrides: Partial<TowerData> = {}): TowerData {
  return {
    id: 'tower-human',
    name: 'Human Tower',
    faction: 'human',
    unlockClears: 12,
    floors: Array.from({ length: floors }, (_, offset) => ({
      id: `t-human-f${offset + 1}`,
      name: `Floor ${offset + 1}`,
      enemies: enemies(1),
    })),
    ...overrides,
  };
}

const TOWER = tower(100);

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: SEED, nowMs: T0 }), ...overrides };
}

/** A victory paying a lump, in the shape `applyTowerResult` reads off a `BattleResult`. */
const WON = { outcome: 'victory', reward: { gained: { gold: num(40) } } };
const LOST = { outcome: 'defeat', reward: { gained: {} } };

describe('floorLevel', () => {
  it('runs a straight line from the first floor to the last', () => {
    expect(floorLevel(RULES, 1)).toBe(1);
    expect(floorLevel(RULES, 100)).toBe(60);
  });

  it('is symmetric about its midpoint, which is why it rounds rather than floors', () => {
    // ⚠️ Flooring spends an extra floor at every level and lands the top one short. The symmetry is
    // the cheapest way to state that: floor `n` above the bottom must be as far up as floor `n`
    // below the top is down.
    for (const offset of [0, 1, 7, 24, 49]) {
      const up = floorLevel(RULES, 1 + offset) - RULES.baseLevel;
      const down = RULES.topLevel - floorLevel(RULES, 100 - offset);

      expect(up, `offset ${offset}`).toBe(down);
    }
  });

  it('never falls as the climb goes up', () => {
    let previous = 0;
    for (let floor = 1; floor <= RULES.floors; floor++) {
      const level = floorLevel(RULES, floor);

      expect(level, `floor ${floor}`).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });

  it('stays inside the authored band at every floor', () => {
    for (let floor = 1; floor <= RULES.floors; floor++) {
      expect(floorLevel(RULES, floor), `floor ${floor}`).toBeGreaterThanOrEqual(RULES.baseLevel);
      expect(floorLevel(RULES, floor), `floor ${floor}`).toBeLessThanOrEqual(RULES.topLevel);
    }
  });

  it('clamps a floor outside the tower rather than extrapolating off the top of it', () => {
    expect(floorLevel(RULES, 0)).toBe(1);
    expect(floorLevel(RULES, 5_000)).toBe(60);
    expect(floorLevel(RULES, Number.NaN)).toBe(1);
  });

  it('resolves a single-floor tower to its base level', () => {
    // The only division by zero the line can meet.
    expect(floorLevel({ ...RULES, floors: 1 }, 1)).toBe(RULES.baseLevel);
  });

  it('survives a band authored upside down', () => {
    const inverted: TowerRulesData = { ...RULES, baseLevel: 60, topLevel: 10 };

    expect(floorLevel(inverted, 1)).toBe(60);
    expect(floorLevel(inverted, 100)).toBe(60);
  });
});

describe('floorKindAt', () => {
  it('makes every tenth floor a mini-boss', () => {
    expect(floorKindAt(RULES, 9)).toBe('normal');
    expect(floorKindAt(RULES, 10)).toBe('mini-boss');
    expect(floorKindAt(RULES, 90)).toBe('mini-boss');
  });

  it('makes the last floor the boss even though it lands on the interval', () => {
    // The campaign's rule, reused: a hundredth floor is a boss, not a mini-boss that happens to be
    // last. A player who has learnt one rhythm should not have to learn a second.
    expect(floorKindAt(RULES, 100)).toBe('boss');
  });

  it('treats anything past the top as the boss rather than wrapping', () => {
    expect(floorKindAt(RULES, 400)).toBe('boss');
  });

  it('survives a zero interval', () => {
    expect(floorKindAt({ ...RULES, miniBossEvery: 0 }, 7)).toBe('mini-boss');
  });
});

describe('floorSummons', () => {
  it('pays the base on an ordinary floor and a multiple on the punctuation', () => {
    expect(floorSummons(RULES, 7)).toBe(100);
    expect(floorSummons(RULES, 10)).toBe(200);
    expect(floorSummons(RULES, 100)).toBe(500);
  });

  it('never pays less than the base, whatever a multiplier is authored as', () => {
    const stingy: TowerRulesData = {
      ...RULES,
      floorSummons: { base: 100, miniBossMultiplier: 0.1, bossMultiplier: -3 },
    };

    expect(floorSummons(stingy, 10)).toBe(100);
    expect(floorSummons(stingy, 100)).toBe(100);
  });

  it('pays nothing rather than NaN for a damaged base', () => {
    expect(floorSummons({ ...RULES, floorSummons: { ...RULES.floorSummons, base: -5 } }, 3)).toBe(
      0,
    );
    expect(
      floorSummons({ ...RULES, floorSummons: { ...RULES.floorSummons, base: Number.NaN } }, 3),
    ).toBe(0);
  });
});

describe('clearedFloors and nextFloor', () => {
  it('starts a fresh run at the bottom of the tower', () => {
    expect(clearedFloors(run(), TOWER)).toBe(0);
    expect(nextFloor(run(), TOWER)).toBe(1);
  });

  it('offers the floor above the highest one cleared', () => {
    expect(nextFloor(run({ towers: { 'tower-human': 36 } }), TOWER)).toBe(37);
  });

  it('returns null at the top rather than clamping to the last floor', () => {
    // ⚠️ **The whole difference between a tower and the campaign.** The campaign's position stops
    // climbing so its last stage stays farmable; a tower simply ends. A caller handed the top floor
    // forever would let a player re-clear it and be paid again.
    expect(nextFloor(run({ towers: { 'tower-human': 100 } }), TOWER)).toBeNull();
  });

  it('clamps progress to the floors this build actually ships', () => {
    // A save from a build with a taller tower. The climb is finished as far as this build can tell,
    // which is the only honest reading — and it must not index past the authored floors.
    const ahead = run({ towers: { 'tower-human': 250 } });

    expect(clearedFloors(ahead, TOWER)).toBe(100);
    expect(nextFloor(ahead, TOWER)).toBeNull();
  });

  it('reads a damaged floor count as nothing climbed', () => {
    expect(clearedFloors(run({ towers: { 'tower-human': Number.NaN } }), TOWER)).toBe(0);
    expect(clearedFloors(run({ towers: { 'tower-human': -12 } }), TOWER)).toBe(0);
    expect(clearedFloors(run({ towers: { 'tower-human': 12.9 } }), TOWER)).toBe(12);
  });
});

describe('isTowerUnlocked', () => {
  it('opens once the run has cleared enough of the campaign', () => {
    expect(isTowerUnlocked(run({ clearedStages: 11 }), TOWER)).toBe(false);
    expect(isTowerUnlocked(run({ clearedStages: 12 }), TOWER)).toBe(true);
  });

  it('is open from the first fight for a tower that asks for nothing', () => {
    expect(isTowerUnlocked(run(), tower(3, { unlockClears: 0 }))).toBe(true);
    expect(isTowerUnlocked(run(), tower(3, { unlockClears: -5 }))).toBe(true);
  });

  it('reads a damaged clear count as nothing cleared', () => {
    expect(isTowerUnlocked(run({ clearedStages: Number.NaN }), TOWER)).toBe(false);
  });
});

describe('matchedStageIndex', () => {
  /** A campaign whose levels climb the way the shipped one does: 1 to 85 over a hundred stages. */
  const LEVELS: readonly number[] = Array.from({ length: 100 }, (_, index) =>
    Math.round(1 + (84 * index) / 99),
  );

  it('finds the first campaign stage that fights at or above the level asked for', () => {
    expect(matchedStageIndex(LEVELS, 1)).toBe(1);
    expect(matchedStageIndex(LEVELS, LEVELS[49])).toBe(50);
  });

  it('matches by level rather than by index, which is the reason it exists', () => {
    // ⚠️ Tower floor 100 is level 60 where campaign stage 100 is level 85. Paying floor 100 what
    // stage 100 pays would hand over the top of the ladder's lump for a fight two thirds as hard.
    const top = matchedStageIndex(LEVELS, floorLevel(RULES, RULES.floors));

    expect(top).toBeLessThan(LEVELS.length);
    expect(LEVELS[top - 1]).toBeGreaterThanOrEqual(60);
  });

  it('climbs with the floor it is asked about', () => {
    let previous = 0;
    for (let floor = 1; floor <= RULES.floors; floor++) {
      const index = matchedStageIndex(LEVELS, floorLevel(RULES, floor));

      expect(index, `floor ${floor}`).toBeGreaterThanOrEqual(previous);
      previous = index;
    }
  });

  it('falls back to the top of the ladder for a level the campaign never reaches', () => {
    // A tower whose floors out-levelled the whole campaign has nothing better to match against.
    expect(matchedStageIndex(LEVELS, 5_000)).toBe(LEVELS.length);
  });

  it('answers for an empty ladder without indexing off the end of it', () => {
    expect(matchedStageIndex([], 40)).toBe(1);
  });
});

describe('resolveFloor', () => {
  const LUMP = { gold: 400, xp: 80 };

  it('derives the level and the kind, and keeps the authored line-up', () => {
    const floor = resolveFloor(TOWER, RULES, 10, LUMP);

    expect(floor.id).toBe('t-human-f10');
    expect(floor.name).toBe('Floor 10');
    expect(floor.level).toBe(floorLevel(RULES, 10));
    expect(floor.kind).toBe('mini-boss');
    expect(floor.enemies.front).toHaveLength(1);
    expect(floor.reward).toBe(LUMP);
  });

  it('leaves the rates empty and the first-clear crystals at zero', () => {
    // ⚠️ Both fields exist only because `StageData` is one type for every fight in the game, and
    // populating them is how a tower would quietly acquire the two things it must not have: a
    // permanent income raise, and a crystal payout routed through the campaign path.
    const floor = resolveFloor(TOWER, RULES, 40, LUMP);

    expect(floor.rates).toEqual({});
    expect(floor.firstClearSummons).toBe(0);
  });

  it('clamps a floor outside the tower onto one that exists', () => {
    expect(resolveFloor(TOWER, RULES, 5_000, LUMP).id).toBe('t-human-f100');
    expect(resolveFloor(TOWER, RULES, 0, LUMP).id).toBe('t-human-f1');
  });
});

describe('resolveTower', () => {
  it('resolves every floor in climbing order, each at its own level', () => {
    const lumpForLevel = (level: number) => ({ gold: level * 10 });
    const floors = resolveTower(tower(12), { ...RULES, floors: 12 }, lumpForLevel);

    expect(floors).toHaveLength(12);
    expect(floors.map((floor) => floor.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `t-human-f${index + 1}`),
    );
    expect(floors[0].level).toBe(1);
    expect(floors[11].level).toBe(60);
    expect(floors[11].kind).toBe('boss');
    // The lump is a function of the *level*, not of the floor number — which is what keeps a tower's
    // payout matched to the campaign at the same difficulty.
    expect(floors[11].reward).toEqual({ gold: 600 });
  });
});

describe('applyTowerResult', () => {
  it('records the floor, pays the lump and pays the crystals', () => {
    const before = run();
    const after = applyTowerResult(before, TOWER, RULES, 1, WON);

    expect(after.towers['tower-human']).toBe(1);
    expect(after.wallet.gold.toString()).toBe('40');
    expect(after.wallet.summons.toString()).toBe('100');
    expect(after.battleCount).toBe(1);
  });

  it('never touches the campaign fields, which is the whole reason it is a separate function', () => {
    // ⚠️ `clearedStages` drives the idle crystal rate, which `banners.spec.ts` bounds at about ×3
    // the base where the shipped hundred stages already reach ×2. Seven towers of a hundred floors
    // feeding that counter would take it to ×8.
    const before = run({ clearedStages: 40, chapter: 1, stage: 41 });
    const after = applyTowerResult(before, TOWER, RULES, 1, WON);

    expect(after.clearedStages).toBe(40);
    expect(after.chapter).toBe(1);
    expect(after.stage).toBe(41);
    expect(after.rates).toBe(before.rates);
  });

  it('advances the battle counter on a loss and pays nothing', () => {
    // The counter feeds the battle RNG label, so a retry has to be a different fight rather than a
    // replay of the same loss.
    const after = applyTowerResult(run(), TOWER, RULES, 1, LOST);

    expect(after.battleCount).toBe(1);
    expect(after.towers).toEqual({});
    expect(after.wallet.summons.toString()).toBe('0');
  });

  it('pays nothing for a floor already climbed', () => {
    // Nothing in the UI can reach this — `nextFloor` never offers a cleared floor — so it guards a
    // damaged save and a future caller rather than the screen. The battle counter still moves,
    // which is the honest record that a fight happened.
    const before = run({ towers: { 'tower-human': 40 } });
    const after = applyTowerResult(before, TOWER, RULES, 12, WON);

    expect(after.towers['tower-human']).toBe(40);
    expect(after.wallet.gold.toString()).toBe('0');
    expect(after.wallet.summons.toString()).toBe('0');
    expect(after.battleCount).toBe(1);
  });

  it('only ever raises progress, so a stale caller cannot walk a run back down its tower', () => {
    const before = run({ towers: { 'tower-human': 60 } });

    expect(applyTowerResult(before, TOWER, RULES, 61, WON).towers['tower-human']).toBe(61);
    expect(applyTowerResult(before, TOWER, RULES, 3, WON).towers['tower-human']).toBe(60);
  });

  it('leaves the progress of every other tower alone', () => {
    const before = run({ towers: { 'tower-human': 5, 'tower-dwarf': 90 } });
    const after = applyTowerResult(before, TOWER, RULES, 6, WON);

    expect(after.towers).toEqual({ 'tower-human': 6, 'tower-dwarf': 90 });
  });

  it('clamps a floor above the tower onto its top floor', () => {
    const after = applyTowerResult(
      run({ towers: { 'tower-human': 99 } }),
      TOWER,
      RULES,
      5_000,
      WON,
    );

    expect(after.towers['tower-human']).toBe(100);
    // The top floor is the boss, so it pays the boss multiple.
    expect(after.wallet.summons.toString()).toBe('500');
  });

  describe('drops', () => {
    /**
     * A fixture ladder rather than the shipped one: `core/` may not see `data/`, and a spec that
     * reached for the real grades would fail every time one was retuned.
     */
    const profile: Readonly<Record<GearSlot, GearStatProfile>> = {
      head: { hp: 0.1 },
      arms: { atk: 0.1 },
      chest: { hp: 0.2 },
      legs: { def: 0.1 },
      boots: { haste: 0.05 },
    };
    const gearRules: GearRulesData = {
      grades: [
        {
          id: 'plain',
          name: 'Plain',
          multiplier: 1,
          maxLevel: 5,
          salvage: 10,
          weight: 100,
          priceSeconds: 10,
          unlockIndex: 1,
        },
        {
          id: 'good',
          name: 'Good',
          multiplier: 2,
          maxLevel: 10,
          salvage: 40,
          weight: 20,
          priceSeconds: 60,
          unlockIndex: 4,
        },
      ],
      profiles: {
        tank: profile,
        brawler: profile,
        mage: profile,
        ranger: profile,
        support: profile,
      },
      perLevel: 0.25,
      alignmentBonus: 1.5,
      unalignedChance: 0.5,
      enhance: {
        alloy: { coefficient: 10, exponent: 1 },
        gold: { coefficient: 100, exponent: 2 },
      },
      drops: {
        normal: { min: 1, max: 1 },
        miniBoss: { min: 2, max: 2 },
        boss: { min: 4, max: 4 },
        gradeSoftness: 10,
      },
      shop: { offers: 3, refreshMs: 1000, minGoldPerSecond: 1 },
      inventoryLimit: 200,
    };

    const award = { rules: gearRules, factions: ['human', 'undead'], stageIndex: 40 };

    it('drops gear on a win, and is reproducible from the same seed and floor', () => {
      const before = run();
      const first = applyTowerResult(before, TOWER, RULES, 1, WON, award);
      const second = applyTowerResult(before, TOWER, RULES, 1, WON, award);

      expect(first.gear.length).toBeGreaterThan(0);
      expect(first.gear).toEqual(second.gear);
    });

    it('never advances the pull stream', () => {
      // ⚠️ Drops roll from a **derived** sub-stream keyed on the fight, exactly as the battle itself
      // is. Otherwise climbing a tower would shift the gacha sequence.
      const after = applyTowerResult(run(), TOWER, RULES, 1, WON, award);

      expect(after.rng.calls).toBe(0);
    });

    it('draws differently for two towers on the same floor at the same battle count', () => {
      const before = run();
      const other = tower(100, { id: 'tower-dwarf' });
      const human = applyTowerResult(before, TOWER, RULES, 4, WON, award);
      const dwarf = applyTowerResult(before, other, RULES, 4, WON, award);

      expect(human.gear).not.toEqual(dwarf.gear);
    });

    it('drops more from a boss floor than from an ordinary one', () => {
      const before = run({ towers: { 'tower-human': 98 } });
      const ordinary = applyTowerResult(before, TOWER, RULES, 99, WON, award);
      const boss = applyTowerResult(before, TOWER, RULES, 100, WON, award);

      expect(boss.gear.length).toBeGreaterThan(ordinary.gear.length);
    });

    it('drops nothing on a loss', () => {
      expect(applyTowerResult(run(), TOWER, RULES, 1, LOST, award).gear).toEqual([]);
    });

    it('drops nothing for a floor already climbed', () => {
      const before = run({ towers: { 'tower-human': 40 } });

      expect(applyTowerResult(before, TOWER, RULES, 12, WON, award).gear).toEqual([]);
    });
  });
});

describe('parseTowers', () => {
  const swallow = (): void => undefined;

  it('reads healthy progress through unchanged', () => {
    expect(parseTowers({ 'tower-human': 37 }, swallow)).toEqual({ 'tower-human': 37 });
  });

  it('keeps a tower id this build no longer ships', () => {
    // The same call the achievement ledger makes: one integer is cheap to carry, and dropping it
    // would cost a returning player a hundred floors every time they moved between builds.
    expect(parseTowers({ 'tower-retired': 88 }, swallow)).toEqual({ 'tower-retired': 88 });
  });

  it('floors a fractional count rather than carrying it', () => {
    expect(parseTowers({ 'tower-human': 12.9 }, swallow)).toEqual({ 'tower-human': 12 });
  });

  it('drops an entry that is not a usable count, and says so', () => {
    const issues: string[] = [];
    const progress = parseTowers(
      { good: 3, negative: -1, text: 'nine', broken: Number.NaN },
      (field) => issues.push(field),
    );

    expect(progress).toEqual({ good: 3 });
    expect(issues).toEqual(['towers.negative', 'towers.text', 'towers.broken']);
  });

  it('reads a missing record as nothing climbed, without reporting it as damage', () => {
    // A save written before towers existed has no such field, and a fresh run arrives with `{}`.
    // Neither is an error — which is what let towers ship with no `SAVE_VERSION` bump.
    const issues: string[] = [];

    expect(parseTowers(undefined, (field) => issues.push(field))).toEqual({});
    expect(issues).toEqual([]);
  });

  it('reports a record that is not an object at all', () => {
    const issues: string[] = [];

    expect(parseTowers('nope', (field) => issues.push(field))).toEqual({});
    expect(parseTowers([1, 2], (field) => issues.push(field))).toEqual({});
    expect(issues).toEqual(['towers', 'towers']);
  });
});

describe('floorsClearedIn', () => {
  it('reads a tower straight off the record, unclamped', () => {
    // ⚠️ Unclamped on purpose, unlike `clearedFloors`: the achievement ledger has no tower to clamp
    // against, and a track for a tower this build no longer ships still has to report the number
    // the save carries rather than zero.
    expect(floorsClearedIn({ 'tower-retired': 250 }, 'tower-retired')).toBe(250);
  });

  it('reads a tower the run has never entered as nothing climbed', () => {
    expect(floorsClearedIn({}, 'tower-human')).toBe(0);
    expect(floorsClearedIn({ 'tower-human': Number.NaN }, 'tower-human')).toBe(0);
  });
});

describe('emptyTowers', () => {
  it('starts a new run having climbed nothing', () => {
    expect(emptyTowers()).toEqual({});
    expect(newGame({ seed: SEED, nowMs: T0 }).towers).toEqual({});
  });
});
