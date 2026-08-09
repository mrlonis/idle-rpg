// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  emblemRatePerSecond,
  summonRatePerSecond,
  type CurrencyAmounts,
  type EmblemRateCurve,
  type IdleRateCurves,
  type Rates,
  type SummonRateCurve,
  zeroRates,
} from '../currency';
import { type GearRulesData, type GearSlot, type GearStatProfile } from '../gear/types';
import {
  type ChapterCurveData,
  chaptersCleared,
  type LadderShape,
  stagePayout,
  type StageRewardCurveData,
} from '../ladder';
import { num, type Numeric, ZERO } from '../numeric';
import { newGame, type GameState } from '../state';
import { tick } from '../tick';
import { applyBattleResult, reconcileClearedStages } from './progress';
import { type BattleOutcome, type BattleResult } from './types';

const T0 = 1_700_000_000_000;

/**
 * Eight stages, cut into two chapters of five and three.
 *
 * Two chapters rather than one, because the whole of what milestone 11 changed here is that a
 * position is a pair: a ladder of one chapter would let every `stageIndex` bug pass by looking
 * like the identity. Uneven lengths for the same reason — five and five would hide a slip between
 * "stages in chapter 1" and "stages in this chapter".
 */
const LADDER: LadderShape = { chapters: [5, 3] };

/** The last stage of the fixture ladder, as a position. */
const TOP = { chapter: 2, stage: 3 };

/** How the fixture ladder is cut, for the mini-boss and boss rhythm. */
const CHAPTER_RULES: ChapterCurveData = {
  baseStages: 5,
  stepStages: 0,
  chaptersPerBand: 10,
  maxStages: 5,
  miniBossEvery: 4,
};

/**
 * What a stage pays, with both boss multipliers at 1.
 *
 * A linear exponent so the eight gold rates are 0.5, 1, 1.5 … 4 and the eight first-clear bonuses
 * are 200, 250 … 550 — numbers a reader can add up in their head, which is the point of a fixture.
 * The multipliers are held at 1 so this file measures progression rather than the reward curve;
 * `ladder.spec.ts` is where the curve itself is pinned, and one test below re-introduces a boss
 * multiplier to check the repair pays it.
 */
const REWARDS: StageRewardCurveData = {
  baseRates: { gold: 0.5, xp: 0.1, essence: 0.001 },
  exponent: 1,
  rewardSeconds: 40,
  firstClearSummons: { base: 200, perStage: 50, miniBossMultiplier: 1, bossMultiplier: 1 },
};

/** The first-clear bonus for each of the eight stages, and the whole ladder's worth. */
const BONUSES = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (index) => stagePayout(REWARDS, index).firstClearSummons,
);
const TOTAL_BONUS = BONUSES.reduce((sum, bonus) => sum + bonus, 0);

/**
 * The crystal curve, as `data/` authors it.
 *
 * The shipped numbers rather than round test ones, because the two properties worth pinning here
 * are that a run earns the base before it has fought anything and that a clear is worth a step —
 * and both read as arithmetic a person can check when the constants are the real ones.
 */
const CRYSTALS: SummonRateCurve = { basePerHour: 100, perClearPerHour: 0.5 };

/**
 * The emblem curve.
 *
 * A step of 2 rather than the shipped 1, chosen so that "one chapter cleared" and "two chapters
 * cleared" produce rates a reader cannot confuse with the chapter *count* itself — at a step of 1
 * the rate and the count are the same number, and an assertion that passes for the wrong reason is
 * exactly what a spec over two similar integers invites.
 */
const EMBLEMS: EmblemRateCurve = { perChapterPerHour: 2 };

/** Both derived curves, in the shape `applyBattleResult` takes. */
const CURVES: IdleRateCurves = { summons: CRYSTALS, emblem: EMBLEMS };

/** What the crystal rate should be after `cleared` stages, per second. */
function crystalsAfter(cleared: number): number {
  return (CRYSTALS.basePerHour + CRYSTALS.perClearPerHour * cleared) / 3600;
}

/**
 * What the emblem rate should be after `chapters` whole chapters, per second.
 *
 * Built through `emblemRatePerSecond` rather than as `perChapterPerHour * chapters / 3600`, which
 * looks like circular reasoning and is not: what these tests measure is **which count is fed to
 * the curve**, not what the curve computes — `currency.spec.ts` owns the second question. Writing
 * the division out here would make every assertion below depend on `Decimal.div` and float64 `/`
 * agreeing in the last bit, which they do not.
 */
function emblemsAfter(chapters: number): Numeric {
  return emblemRatePerSecond(EMBLEMS, chapters);
}

/**
 * A gear table that always drops exactly one plain piece, so an emblem assertion is never reading
 * a bag that happened to vary.
 *
 * Every number here is chosen to be inert rather than realistic: one grade, one profile, a fixed
 * drop count. What these tests measure is which **stream** a draw came from and whether a gate
 * bit, and a gear table with any variance in it would put noise into both readings.
 */
const PLAIN_PROFILE: Readonly<Record<GearSlot, GearStatProfile>> = {
  head: { hp: 0.1 },
  arms: { atk: 0.1 },
  chest: { hp: 0.2 },
  legs: { def: 0.1 },
  boots: { haste: 0.05 },
};

const EMPTY_GEAR_RULES: GearRulesData = {
  grades: [
    {
      id: 'plain',
      name: 'Plain',
      multiplier: 1,
      maxLevel: 5,
      salvage: 10,
      weight: 100,
      priceSeconds: 10,
      unlockIndex: 0,
    },
  ],
  profiles: {
    tank: PLAIN_PROFILE,
    brawler: PLAIN_PROFILE,
    mage: PLAIN_PROFILE,
    ranger: PLAIN_PROFILE,
    support: PLAIN_PROFILE,
  },
  perLevel: 0.25,
  alignmentBonus: 1.5,
  unalignedChance: 1,
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

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0xc0ffee, nowMs: T0 }), ...overrides };
}

/** A state holding `gold`, leaving every other currency alone. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

/** A state earning `gold` per second, leaving every other rate at zero. */
function withGoldRate(state: GameState, rate: string): GameState {
  return { ...state, rates: { ...zeroRates(), gold: num(rate) } };
}

interface RewardSpec {
  readonly gained?: CurrencyAmounts;
  readonly rates?: Readonly<Partial<Rates>>;
  readonly firstClearSummons?: string;
}

function outcome(kind: BattleOutcome, reward: RewardSpec = {}): BattleResult {
  return {
    stageId: 'test-stage',
    outcome: kind,
    // Progression keys off the outcome alone, so nothing here varies with how a defeat arrived.
    timedOut: false,
    ticks: 100,
    durationMs: 10_000,
    roster: [],
    final: [],
    events: [{ kind: 'end', tick: 100, outcome: kind }],
    reward:
      kind === 'victory'
        ? {
            gained: reward.gained ?? {},
            rates: reward.rates ?? {},
            firstClearSummons: num(reward.firstClearSummons ?? '0'),
          }
        : { gained: {}, rates: {}, firstClearSummons: ZERO },
  };
}

describe('applyBattleResult', () => {
  it('advances the stage on a victory and banks the reward', () => {
    const state = withGold(run({ chapter: 1, stage: 3 }), '500');

    const next = applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(160) } }),
      LADDER,
      CURVES,
    );

    expect({ chapter: next.chapter, stage: next.stage }).toEqual({ chapter: 1, stage: 4 });
    expect(next.wallet.gold.eq(660)).toBe(true);
  });

  it('rolls into the next chapter rather than stopping at the end of one', () => {
    // The seam milestone 11 added, and the one thing a flat stage number could never express. A
    // player who takes a chapter's boss is on the next chapter's first stage, not stuck on the
    // boss and not thrown back to the beginning.
    const state = run({ chapter: 1, stage: 5 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

    expect({ chapter: next.chapter, stage: next.stage }).toEqual({ chapter: 2, stage: 1 });
  });

  it('counts a clear by its place on the whole ladder, not within its chapter', () => {
    // ⚠️ The bug a chapter-and-stage pair makes possible and a flat number could not: chapter 2
    // stage 1 and chapter 1 stage 1 are the same `stage` field. Crediting the second stage of the
    // ladder for a clear of its sixth would hand back five first-clear bonuses.
    const state = run({ chapter: 2, stage: 1, clearedStages: 5 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

    expect(next.clearedStages).toBe(6);
  });

  it('banks every currency a stage pays, not just gold', () => {
    const next = applyBattleResult(
      run(),
      outcome('victory', { gained: { gold: num(650), xp: num(120), essence: num(5) } }),
      LADDER,
      CURVES,
    );

    expect(next.wallet.gold.eq(650)).toBe(true);
    expect(next.wallet.xp.eq(120)).toBe(true);
    expect(next.wallet.essence.eq(5)).toBe(true);
  });

  it.each<BattleOutcome>(['defeat'])('holds the stage on a %s', (kind) => {
    const state = withGold(run({ chapter: 1, stage: 3 }), '500');

    const next = applyBattleResult(state, outcome(kind), LADDER, CURVES);

    expect({ chapter: next.chapter, stage: next.stage }).toEqual({ chapter: 1, stage: 3 });
    expect(next.wallet.gold.eq(500)).toBe(true);
  });

  it.each<BattleOutcome>(['victory', 'defeat'])('counts the battle on a %s', (kind) => {
    // The counter feeds the battle RNG label. If a loss did not advance it, the retry would be
    // a bit-for-bit replay of the same loss and the stage would be a permanent wall for
    // reasons the player could never see.
    const state = run({ battleCount: 41 });

    expect(applyBattleResult(state, outcome(kind), LADDER, CURVES).battleCount).toBe(42);
  });

  it('stops at the last authored stage, which then repeats', () => {
    const state = run(TOP);

    const next = applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(650) } }),
      LADDER,
      CURVES,
    );

    expect({ chapter: next.chapter, stage: next.stage }).toEqual(TOP);
    expect(next.wallet.gold.eq(650)).toBe(true);
  });

  it('pulls a save from a content-richer build back into range', () => {
    // Loading a save that names a chapter this build does not ship must land somewhere real
    // rather than on a stage that does not exist.
    const state = run({ chapter: 9, stage: 40 });

    const next = applyBattleResult(state, outcome('defeat'), LADDER, CURVES);

    expect({ chapter: next.chapter, stage: next.stage }).toEqual(TOP);
  });

  it.each<LadderShape>([{ chapters: [] }, { chapters: [0] }])(
    'treats a ladder with no stages in it as a single stage',
    (empty) => {
      const state = run({ chapter: 4, stage: 4 });

      const next = applyBattleResult(state, outcome('victory'), empty, CURVES);

      expect({ chapter: next.chapter, stage: next.stage }).toEqual({ chapter: 1, stage: 1 });
    },
  );

  describe('idle income', () => {
    it('raises the rate to what the cleared stage grants', () => {
      // The real reward. A run starts at zero income, so the first clear is what switches the
      // idle game on at all.
      const next = applyBattleResult(
        run(),
        outcome('victory', { rates: { gold: num('0.5'), xp: num('0.1') } }),
        LADDER,
        CURVES,
      );

      expect(next.rates.gold.eq('0.5')).toBe(true);
      expect(next.rates.xp.eq('0.1')).toBe(true);
    });

    it.each<BattleOutcome>(['defeat'])('leaves the rate alone on a %s', (kind) => {
      const state = withGoldRate(run(), '4');

      expect(applyBattleResult(state, outcome(kind), LADDER, CURVES).rates.gold.eq(4)).toBe(true);
    });

    it('raises nothing when the stage has been cleared before', () => {
      // The idle increase is a one-time unlock per stage, not a per-victory bonus. Re-running a
      // stage should not be reaching for the rate table at all.
      const state = run({ chapter: 1, stage: 3, clearedStages: 5 });

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('99'), xp: num('99') } }),
        LADDER,
        CURVES,
      );

      expect(next.rates.gold.eq(0)).toBe(true);
      expect(next.rates.xp.eq(0)).toBe(true);
    });

    it('still pays the one-off lump on a re-fight', () => {
      // Farming a stage you have already beaten is a legitimate way to spend an evening, and it
      // should pay — just not with permanent income.
      const state = run({ chapter: 1, stage: 3, clearedStages: 5 });

      const next = applyBattleResult(
        state,
        outcome('victory', { gained: { gold: num(65), xp: num(12) }, rates: { gold: num('99') } }),
        LADDER,
        CURVES,
      );

      expect(next.wallet.gold.eq(65)).toBe(true);
      expect(next.wallet.xp.eq(12)).toBe(true);
      expect(next.rates.gold.eq(0)).toBe(true);
    });

    it('never lowers a rate the run already had', () => {
      // Re-clearing an earlier stage, or loading a save written against a different curve, must
      // not cut a player's income. Milestone 11 re-derived the whole rate curve, so the second
      // half of that sentence stopped being hypothetical.
      const state = withGoldRate(run(), '16');

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5') } }),
        LADDER,
        CURVES,
      );

      expect(next.rates.gold.eq(16)).toBe(true);
    });

    it('raises each currency independently', () => {
      // A stage that pays less gold than the run already earns but more essence must still raise
      // the essence rate — the guard is per currency, not all-or-nothing.
      const state = { ...run(), rates: { ...zeroRates(), gold: num('16') } };

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5'), essence: num('0.05') } }),
        LADDER,
        CURVES,
      );

      expect(next.rates.gold.eq(16)).toBe(true);
      expect(next.rates.essence.eq('0.05')).toBe(true);
    });

    it('is what makes an idle run pay at all', () => {
      // Ties the reward to the thing it feeds: `tick` multiplies by this rate, so a run that has
      // never won a battle accrues no gold at all. Crystals are the one exception and have their
      // own block below — the first battle is still the only thing worth doing, it is just no
      // longer the only thing that pays.
      const untouched = run();

      expect(tick(untouched, 60_000).wallet.gold.eq(0)).toBe(true);
      expect(
        tick(
          applyBattleResult(
            untouched,
            outcome('victory', { rates: { gold: num('0.5') } }),
            LADDER,
            CURVES,
          ),
          60_000,
        ).wallet.gold.eq(30),
      ).toBe(true);
    });
  });

  describe('the crystal rate', () => {
    it('steps up on a first clear', () => {
      const state = run({ chapter: 1, stage: 3, clearedStages: 2 });

      const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

      expect(next.clearedStages).toBe(3);
      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(3), 12);
    });

    it('does not move however many times a cleared stage is farmed', () => {
      // The rule that keeps farming the fastest fight from being the fastest way to pull. This is
      // the case auto-battle actually produces: parked at the top of the ladder, where the
      // position has stopped climbing, winning the same fight for hours.
      let state = run({ ...TOP, clearedStages: 8 });

      for (let fight = 0; fight < 50; fight++) {
        state = applyBattleResult(state, outcome('victory'), LADDER, CURVES);
      }

      expect(state.clearedStages).toBe(8);
      expect(state.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
    });

    it('steps once per stage across a whole climb, and no more', () => {
      // Fifty fights from a standing start: eight of them are first clears — across both chapters
      // — and the rest are the top of the ladder repeating, so the rate lands on the ladder's
      // length rather than on the number of battles won.
      let state = run();

      for (let fight = 0; fight < 50; fight++) {
        state = applyBattleResult(state, outcome('victory'), LADDER, CURVES);
      }

      expect(state.clearedStages).toBe(8);
      expect(state.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
    });

    it('does not move on a loss', () => {
      const state = run({ chapter: 1, stage: 5, clearedStages: 4 });

      const next = applyBattleResult(state, outcome('defeat'), LADDER, CURVES);

      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(4), 12);
    });

    it('ignores whatever the stage itself claims to grant', () => {
      // Crystals are a function of the clear count, not a per-stage unlock. A stage authored with
      // a crystal rate — a save from an older build, or a fixture — must not be able to set one.
      const state = run({ chapter: 1, stage: 1, clearedStages: 0 });

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5'), summons: num('0.0015') } }),
        LADDER,
        CURVES,
      );

      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(1), 12);
    });

    it('never falls below what the run already earns', () => {
      // A save written by a more generous build keeps its rate. The guard is the same
      // `raiseRates` every other currency goes through.
      const generous = { ...run(), rates: { ...zeroRates(), summons: num('9') } };

      const next = applyBattleResult(generous, outcome('victory'), LADDER, CURVES);

      expect(next.rates.summons.eq(9)).toBe(true);
    });

    it('pays out through `tick` like any other rate', () => {
      // The end of the chain, and the reason the rate is stored per second rather than derived on
      // read: an hour of a run that has cleared nothing is exactly one pull's worth.
      const state = {
        ...run(),
        rates: { ...zeroRates(), summons: summonRatePerSecond(CRYSTALS, 0) },
      };

      expect(tick(state, 3_600_000).wallet.summons.toNumber()).toBeCloseTo(CRYSTALS.basePerHour, 6);
    });
  });

  describe('first-clear bonus', () => {
    it('pays the summon bonus the first time a stage falls', () => {
      const state = run({ chapter: 1, stage: 3, clearedStages: 2 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '250' }),
        LADDER,
        CURVES,
      );

      expect(next.wallet.summons.eq(250)).toBe(true);
      expect(next.clearedStages).toBe(3);
    });

    it('never pays it twice for the same stage', () => {
      // The case the position alone cannot answer: at the top of the ladder it stops climbing,
      // so a player farming the last stage would re-earn its bonus on every single win.
      const state = run({ ...TOP, clearedStages: 8 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '800' }),
        LADDER,
        CURVES,
      );

      expect(next.wallet.summons.eq(0)).toBe(true);
      expect(next.clearedStages).toBe(8);
    });

    it('credits the stage actually fought when the save came from a richer build', () => {
      // The UI clamps the position to the content it has before simulating, so this has to clamp
      // it the same way. Crediting a chapter this build does not ship would park the counter above
      // anything reachable and silently withhold every remaining first-clear bonus.
      const state = run({ chapter: 9, stage: 40, clearedStages: 3 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '800' }),
        LADDER,
        CURVES,
      );

      expect(next.clearedStages).toBe(8);
      expect(next.wallet.summons.eq(800)).toBe(true);
    });

    it('pays nothing on a loss and leaves the cleared count alone', () => {
      const state = run({ chapter: 1, stage: 5, clearedStages: 4 });

      const next = applyBattleResult(state, outcome('defeat'), LADDER, CURVES);

      expect(next.wallet.summons.eq(0)).toBe(true);
      expect(next.clearedStages).toBe(4);
    });
  });

  it('leaves the pull RNG position alone', () => {
    // Combat draws from a derived sub-stream. If a battle advanced `rng.calls`, fighting would
    // shift the gacha sequence and a replayed battle would change which characters you pull.
    const state = run({ rng: { seed: 0xc0ffee, calls: 317 } });

    expect(
      applyBattleResult(state, outcome('victory', { gained: { gold: num(100) } }), LADDER, CURVES)
        .rng,
    ).toEqual({ seed: 0xc0ffee, calls: 317 });
  });

  it('does not mutate the state it is given', () => {
    const state = withGold(run({ chapter: 1, stage: 2, battleCount: 5 }), '10');

    applyBattleResult(state, outcome('victory', { gained: { gold: num(100) } }), LADDER, CURVES);

    expect(state.stage).toBe(2);
    expect(state.battleCount).toBe(5);
    expect(state.wallet.gold.eq(10)).toBe(true);
  });

  it('leaves the clock alone, because core has none', () => {
    const state = run({ lastTickAt: T0 });

    expect(applyBattleResult(state, outcome('victory'), LADDER, CURVES).lastTickAt).toBe(T0);
  });
});

/**
 * The repair for the `v2 → v3` migration's hole.
 *
 * That migration carried `goldPerSec` across and started xp, essence and summons at zero, so a
 * returning player watched their gold tick up while nothing else moved — with no way back except
 * re-fighting the ladder. It also seeded `clearedStages` from `stage - 1`, which is one short at
 * the top because the position stops climbing there.
 *
 * Both are recoverable without asking the player to fight anything, because the surviving gold
 * rate says roughly how far the run got — bounded by how far it has actually travelled, which is
 * the guard milestone 11 had to add when it re-derived the rate curve underneath every save.
 */
describe('reconcileClearedStages', () => {
  const repair = (state: GameState, ladder: LadderShape = LADDER): GameState =>
    reconcileClearedStages(state, ladder, CHAPTER_RULES, REWARDS, CURVES);

  /** A save as the migration would have left it: gold intact, everything else zeroed. */
  function migrated(goldRate: string, clearedStages: number): GameState {
    return run({ rates: { ...zeroRates(), gold: num(goldRate) }, clearedStages, ...TOP });
  }

  /**
   * A run that has genuinely earned everything the ladder grants — every rate, both derived ones
   * included.
   *
   * Every rate is **derived** from `clearedStages` rather than written out, which is what makes
   * the identity assertion below mean something: if any rate here were a literal, `settled` would
   * drift from what the repair actually computes and the test would report a repair that changed
   * something when the truth was that the fixture was wrong. The emblem rate is the case that
   * proved it — eight stages of a `[5, 3]` ladder is two whole chapters, so a hardcoded zero made
   * a healthy run look damaged.
   */
  function settled(clearedStages: number): GameState {
    const payout = stagePayout(REWARDS, clearedStages);
    return run({
      ...TOP,
      clearedStages,
      rates: {
        gold: num(payout.rates.gold ?? 0),
        xp: num(payout.rates.xp ?? 0),
        essence: num(payout.rates.essence ?? 0),
        summons: summonRatePerSecond(CRYSTALS, clearedStages),
        emblem: emblemRatePerSecond(EMBLEMS, chaptersCleared(LADDER, clearedStages).total),
      },
    });
  }

  it('restores every rate a run had already earned', () => {
    // The reported bug, exactly: gold accumulating and nothing else.
    const broken = migrated('4', 7);

    const fixed = repair(broken);

    expect(fixed.rates.gold.eq(4)).toBe(true);
    expect(fixed.rates.xp.gt(0)).toBe(true);
    expect(fixed.rates.essence.gt(0)).toBe(true);
    // Crystals come back too, but from the clear count rather than from the curve — which is why
    // this repair heals a rate no stage grants.
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
  });

  it('gives a brand-new run the crystal base and nothing else', () => {
    // The path every fresh save takes: `newGame` cannot see the curve, so this is where the base
    // is switched on. Gold, xp and essence stay at zero — the first battle is still the only
    // thing worth doing.
    const fresh = run();

    const started = repair(fresh);

    expect(started.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(0), 12);
    expect(started.rates.gold.eq(0)).toBe(true);
    expect(started.rates.xp.eq(0)).toBe(true);
    expect(started.rates.essence.eq(0)).toBe(true);
    expect(started.wallet.summons.eq(0)).toBe(true);
    expect(started.clearedStages).toBe(0);
  });

  it('rebuilds the crystal rate from the clear count it just corrected', () => {
    // The two repairs are one repair: the count is read off the gold rate, and the crystal rate
    // is read off the count. A save credited with seven of eight stages comes back earning the
    // eight-stage rate, not the seven-stage one.
    const fixed = repair(migrated('4', 7));

    expect(fixed.clearedStages).toBe(8);
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
  });

  it('restores them to the highest cleared stage, not the first', () => {
    const top = stagePayout(REWARDS, 8).rates;
    const fixed = repair(migrated('4', 7));

    expect(fixed.rates.xp.eq(num(top.xp ?? 0))).toBe(true);
    expect(fixed.rates.essence.eq(num(top.essence ?? 0))).toBe(true);
  });

  it('pays the first-clear bonus for every stage it credits', () => {
    // Crediting a stage without paying it is worse than leaving it uncredited: `applyBattleResult`
    // will never pay it either, so the crystals are gone for good and the player has no way to
    // even notice. A v2 save that had beaten the ladder is owed the whole 3,000 — the same as a
    // new player earns for climbing the same eight stages.
    const fixed = repair(migrated('4', 0));

    expect(fixed.wallet.summons.eq(TOTAL_BONUS)).toBe(true);
  });

  it('pays only for the stages it newly credits', () => {
    // A run already credited with five stages is owed the last three, not all eight.
    const fixed = repair(migrated('4', 5));

    expect(fixed.wallet.summons.eq(BONUSES[5] + BONUSES[6] + BONUSES[7])).toBe(true);
  });

  it('pays a boss what a boss is worth, rather than an ordinary stage', () => {
    // The one place the chapter rhythm reaches this function. A chapter boss is worth five
    // ordinary stages in crystals, and the repair has to know that or a returning player is
    // quietly shorted every boss they ever beat.
    const generous: StageRewardCurveData = {
      ...REWARDS,
      firstClearSummons: { ...REWARDS.firstClearSummons, bossMultiplier: 5 },
    };
    const owed = reconcileClearedStages(migrated('4', 4), LADDER, CHAPTER_RULES, generous, CURVES)
      .wallet.summons;

    // Stages 5 to 8: stage 5 closes chapter 1 and stage 8 closes chapter 2, so two of the four
    // are bosses and pay five times over.
    const expected = BONUSES[4] * 5 + BONUSES[5] + BONUSES[6] + BONUSES[7] * 5;
    expect(owed.eq(expected)).toBe(true);
  });

  it('never pays the same bonus twice across loads', () => {
    // The property that lets this run on every load. The second pass credits nothing, so it
    // owes nothing.
    const once = repair(migrated('4', 0));
    const twice = repair(once);

    expect(twice.wallet.summons.eq(TOTAL_BONUS)).toBe(true);
    expect(twice).toBe(once);
  });

  it('pays nothing to a run that has already been credited for everything', () => {
    expect(repair(settled(8)).wallet.summons.eq(0)).toBe(true);
  });

  it('leaves a run able to afford a ten-pull, which is the point', () => {
    // The reported symptom underneath the symptom: a returning player with a fully cleared ladder
    // could not afford a single ten-pull, because none of the bonuses had ever been paid.
    const fixed = repair(migrated('4', 0));

    expect(fixed.wallet.summons.gte(1000)).toBe(true);
  });

  it('corrects a clear count the migration undercounted at the top of the ladder', () => {
    // The position stops at the last stage, so a player who beat everything was recorded as having
    // beaten seven — which is why re-fighting the last stage counted as a first clear and paid its
    // bonus again.
    expect(repair(migrated('4', 7)).clearedStages).toBe(8);
  });

  it('reads mid-ladder progress off the gold rate too', () => {
    const fixed = repair(migrated('2.5', 0));

    expect(fixed.clearedStages).toBe(5);
    expect(fixed.rates.xp.eq(num(stagePayout(REWARDS, 5).rates.xp ?? 0))).toBe(true);
  });

  it('never credits more stages than the run has actually reached', () => {
    // ⚠️ The guard milestone 11 had to add, and the reason is worth keeping. A receipt is
    // denominated in whatever the rate curve said the day it was written, and that curve was
    // re-derived from scratch when the ladder went from twenty-four stages to a hundred. A veteran
    // arriving with the old ladder's top gold rate reads, against the new curve, as somebody who
    // has cleared the entire game — and crediting that hands over every first-clear bonus on the
    // ladder for stages they have never seen.
    const veteran = run({
      chapter: 1,
      stage: 2,
      clearedStages: 1,
      rates: { ...zeroRates(), gold: num('999') },
    });

    const fixed = repair(veteran);

    expect(fixed.clearedStages).toBe(2);
    expect(fixed.wallet.summons.eq(BONUSES[1])).toBe(true);
  });

  it('credits a fresh run with no stages and owes it nothing', () => {
    const fresh = run();

    const started = repair(fresh);

    expect(started.clearedStages).toBe(0);
    expect(started.wallet).toBe(fresh.wallet);
  });

  it('leaves an already-consistent run untouched, by reference', () => {
    // It runs on every load, so a clean save must not churn the snapshot and re-render the UI.
    const healthy = settled(8);

    expect(repair(healthy)).toBe(healthy);
  });

  it('is idempotent', () => {
    const once = repair(migrated('4', 7));
    const twice = repair(once);

    expect(twice).toBe(once);
  });

  it('never lowers a clear count that is ahead of the gold rate', () => {
    // Only ever raises. A run whose rates were damaged some other way must not also lose credit
    // for the stages it cleared.
    const ahead = migrated('0.5', 6);

    expect(repair(ahead).clearedStages).toBe(6);
  });

  it('never cuts a rate that is already above what the ladder grants', () => {
    const generous = run({ ...TOP, clearedStages: 2, rates: { ...zeroRates(), gold: num('999') } });

    expect(repair(generous).rates.gold.eq(999)).toBe(true);
  });

  it('does not credit stages beyond the content this build ships', () => {
    const beyond = run({ ...TOP, clearedStages: 99, rates: { ...zeroRates(), gold: num('4') } });

    expect(repair(beyond).clearedStages).toBe(8);
  });

  it('still pays the crystal base when the build ships no stages at all', () => {
    // There is nothing to reconcile without a ladder, but the crystal rate does not come from one
    // — it is a function of the clear count, and a build with no content still earns the base.
    const state = migrated('4', 7);

    const fixed = repair(state, { chapters: [] });

    expect(fixed.clearedStages).toBe(7);
    expect(fixed.rates.gold.eq(4)).toBe(true);
    expect(fixed.rates.xp.eq(0)).toBe(true);
    expect(fixed.wallet).toBe(state.wallet);
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(7), 12);
    expect(repair(fixed, { chapters: [] })).toBe(fixed);
  });

  it('does not mutate the state it is given', () => {
    const broken = migrated('4', 7);

    repair(broken);

    expect(broken.rates.xp.eq(0)).toBe(true);
    expect(broken.clearedStages).toBe(7);
    expect(broken.wallet.summons.eq(0)).toBe(true);
  });

  it('touches nothing but the rates, the clear count and the crystals it owes', () => {
    const broken = { ...migrated('4', 7), pullCount: 12, pity: 30 };

    const fixed = repair(broken);

    expect(fixed.roster).toBe(broken.roster);
    expect(fixed.rng).toEqual(broken.rng);
    expect(fixed.pity).toBe(30);
    expect(fixed.pullCount).toBe(12);
    // Only the crystal balance moves; the other four currencies are untouched.
    expect(fixed.wallet.gold.eq(broken.wallet.gold)).toBe(true);
    expect(fixed.wallet.xp.eq(broken.wallet.xp)).toBe(true);
    expect(fixed.wallet.spark.eq(broken.wallet.spark)).toBe(true);
    expect(fixed.wallet.summons.eq(BONUSES[7])).toBe(true);
  });

  it('leaves a repaired run with nothing left for a re-fight to give back', () => {
    // The end-to-end guarantee. After repair, re-fighting the last stage is worth its lump and
    // nothing more — no rate change, no second first-clear bonus.
    const fixed = repair(migrated('4', 7));

    const after = applyBattleResult(
      fixed,
      outcome('victory', {
        gained: { gold: num(650) },
        rates: { gold: num('4'), xp: num('0.8') },
        firstClearSummons: '800',
      }),
      LADDER,
      CURVES,
    );

    expect(after.rates).toBe(fixed.rates);
    expect(after.wallet.summons.eq(fixed.wallet.summons)).toBe(true);
    expect(after.wallet.gold.eq(fixed.wallet.gold.add(650))).toBe(true);
  });
});

describe('the emblem rate', () => {
  it('pays nothing until a whole chapter has been cleared', () => {
    // The fixture ladder's first chapter is five stages, so a run four deep has finished none.
    const state = run({ chapter: 1, stage: 4, clearedStages: 3 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

    expect(next.clearedStages).toBe(4);
    expect(next.rates.emblem.eq(0)).toBe(true);
  });

  it('switches on with the clear that finishes a chapter, not the one after', () => {
    // ⚠️ The off-by-one worth guarding: the chapter count is read **after** this clear is
    // credited, so the boss that finishes chapter 1 is the fight that turns the faucet on. Reading
    // it before would delay the whole system by a stage, silently.
    const state = run({ chapter: 1, stage: 5, clearedStages: 4 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

    expect(next.rates.emblem.eq(emblemsAfter(1))).toBe(true);
  });

  it('steps again on the next whole chapter and not in between', () => {
    // A clear in the middle of chapter 2 moves the count and not the rate.
    const midway = run({ chapter: 2, stage: 2, clearedStages: 6 });
    const stepped = applyBattleResult(midway, outcome('victory'), LADDER, CURVES);

    expect(stepped.clearedStages).toBe(7);
    expect(stepped.rates.emblem.eq(emblemsAfter(1))).toBe(true);

    // The clear that finishes chapter 2 moves both.
    const closing = run({ chapter: 2, stage: 3, clearedStages: 7 });

    expect(
      applyBattleResult(closing, outcome('victory'), LADDER, CURVES).rates.emblem.eq(
        emblemsAfter(2),
      ),
    ).toBe(true);
    expect(
      applyBattleResult(closing, outcome('defeat'), LADDER, CURVES).rates.emblem.eq(
        emblemsAfter(1),
      ),
    ).toBe(true);
  });

  it('is a function of chapters rather than of stages', () => {
    // The bug this exists to catch is passing `clearedStages` where `clearedChapters` belongs. It
    // type-checks, and on this eight-stage ladder it would report a rate seven steps too high.
    const state = run({ ...TOP, clearedStages: 7 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES);

    expect(next.rates.emblem.eq(emblemsAfter(2))).toBe(true);
  });
});

describe('emblem drops', () => {
  /** The drop table with every kind certain, so a miss is a gate rather than a coin flip. */
  const CERTAIN = { normal: 1, miniBoss: 1, boss: 1, unlockChapters: 1 };
  const GEAR_FREE = { rules: EMPTY_GEAR_RULES, factions: [], kind: 'normal' as const };

  it('credits an emblem on a win once the gate is met', () => {
    const state = run({ ...TOP, clearedStages: 7 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES, {
      ...GEAR_FREE,
      emblems: CERTAIN,
    });

    expect(next.wallet.emblem.eq(1)).toBe(true);
  });

  it('drops nothing before the gate, however certain the table is', () => {
    const state = run({ chapter: 1, stage: 2, clearedStages: 1 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES, {
      ...GEAR_FREE,
      emblems: CERTAIN,
    });

    expect(next.wallet.emblem.eq(0)).toBe(true);
  });

  it('drops nothing on a defeat', () => {
    const state = run({ ...TOP, clearedStages: 7 });

    const next = applyBattleResult(state, outcome('defeat'), LADDER, CURVES, {
      ...GEAR_FREE,
      emblems: CERTAIN,
    });

    expect(next.wallet.emblem.eq(0)).toBe(true);
  });

  it('leaves the wallet alone when the bundle carries no emblem table', () => {
    // The `emblems` field is optional separately from the bundle so a caller can take gear without
    // emblems, which is what lets every gear spec keep asserting what it asserted before.
    const state = run({ ...TOP, clearedStages: 7 });

    const next = applyBattleResult(state, outcome('victory'), LADDER, CURVES, GEAR_FREE);

    expect(next.wallet.emblem.eq(0)).toBe(true);
  });

  it('rolls from a stream the gear drop cannot shift', () => {
    // ⚠️ The whole reason emblems draw from `emblem:` rather than from the gear sequence. If they
    // shared a stream, changing how many pieces a fight drops would silently re-roll every
    // historical emblem for a given seed — and the reverse.
    const state = run({ ...TOP, clearedStages: 7 });
    const table = { normal: 0.5, miniBoss: 0.5, boss: 0.5, unlockChapters: 1 };

    const lean = applyBattleResult(state, outcome('victory'), LADDER, CURVES, {
      ...GEAR_FREE,
      rules: {
        ...EMPTY_GEAR_RULES,
        drops: { ...EMPTY_GEAR_RULES.drops, normal: { min: 1, max: 1 } },
      },
      emblems: table,
    });
    const fat = applyBattleResult(state, outcome('victory'), LADDER, CURVES, {
      ...GEAR_FREE,
      rules: {
        ...EMPTY_GEAR_RULES,
        drops: { ...EMPTY_GEAR_RULES.drops, normal: { min: 5, max: 5 } },
      },
      emblems: table,
    });

    expect(lean.gear.length).not.toBe(fat.gear.length);
    expect(lean.wallet.emblem.eq(fat.wallet.emblem)).toBe(true);
  });
});
