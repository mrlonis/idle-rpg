// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  summonRatePerSecond,
  type CurrencyAmounts,
  type Rates,
  type SummonRateCurve,
  zeroRates,
} from '../currency';
import { num, ZERO } from '../numeric';
import { newGame, type GameState } from '../state';
import { tick } from '../tick';
import { applyBattleResult, reconcileClearedStages, type StageProgressData } from './progress';
import { type BattleOutcome, type BattleResult } from './types';

const T0 = 1_700_000_000_000;
const STAGE_COUNT = 8;

/**
 * The crystal curve, as `data/` authors it.
 *
 * The shipped numbers rather than round test ones, because the two properties worth pinning here
 * are that a run earns the base before it has fought anything and that a clear is worth a step —
 * and both read as arithmetic a person can check when the constants are the real ones.
 */
const CRYSTALS: SummonRateCurve = { basePerHour: 100, perClearPerHour: 1 };

/** What the crystal rate should be after `cleared` stages, per second. */
function crystalsAfter(cleared: number): number {
  return (CRYSTALS.basePerHour + CRYSTALS.perClearPerHour * cleared) / 3600;
}

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
    const state = withGold(run({ stage: 3 }), '500');

    const next = applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(160) } }),
      STAGE_COUNT,
      CRYSTALS,
    );

    expect(next.stage).toBe(4);
    expect(next.wallet.gold.eq(660)).toBe(true);
  });

  it('banks every currency a stage pays, not just gold', () => {
    const next = applyBattleResult(
      run(),
      outcome('victory', { gained: { gold: num(650), xp: num(120), essence: num(5) } }),
      STAGE_COUNT,
      CRYSTALS,
    );

    expect(next.wallet.gold.eq(650)).toBe(true);
    expect(next.wallet.xp.eq(120)).toBe(true);
    expect(next.wallet.essence.eq(5)).toBe(true);
  });

  it.each<BattleOutcome>(['defeat'])('holds the stage on a %s', (kind) => {
    const state = withGold(run({ stage: 3 }), '500');

    const next = applyBattleResult(state, outcome(kind), STAGE_COUNT, CRYSTALS);

    expect(next.stage).toBe(3);
    expect(next.wallet.gold.eq(500)).toBe(true);
  });

  it.each<BattleOutcome>(['victory', 'defeat'])('counts the battle on a %s', (kind) => {
    // The counter feeds the battle RNG label. If a loss did not advance it, the retry would be
    // a bit-for-bit replay of the same loss and the stage would be a permanent wall for
    // reasons the player could never see.
    const state = run({ battleCount: 41 });

    expect(applyBattleResult(state, outcome(kind), STAGE_COUNT, CRYSTALS).battleCount).toBe(42);
  });

  it('stops at the last authored stage, which then repeats', () => {
    const state = run({ stage: STAGE_COUNT });

    const next = applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(650) } }),
      STAGE_COUNT,
      CRYSTALS,
    );

    expect(next.stage).toBe(STAGE_COUNT);
    expect(next.wallet.gold.eq(650)).toBe(true);
  });

  it('pulls a save from a content-richer build back into range', () => {
    // Loading a save whose stage number is past what this build ships must land somewhere real
    // rather than on a stage that does not exist.
    const state = run({ stage: 99 });

    expect(applyBattleResult(state, outcome('defeat'), STAGE_COUNT, CRYSTALS).stage).toBe(
      STAGE_COUNT,
    );
  });

  it.each([0, -5, Number.NaN, Infinity])(
    'treats an unusable stage count of %p as a single stage',
    (stageCount) => {
      const state = run({ stage: 4 });

      expect(applyBattleResult(state, outcome('victory'), stageCount, CRYSTALS).stage).toBe(1);
    },
  );

  describe('idle income', () => {
    it('raises the rate to what the cleared stage grants', () => {
      // The real reward. A run starts at zero income, so the first clear is what switches the
      // idle game on at all.
      const next = applyBattleResult(
        run(),
        outcome('victory', { rates: { gold: num('0.5'), xp: num('0.1') } }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.rates.gold.eq('0.5')).toBe(true);
      expect(next.rates.xp.eq('0.1')).toBe(true);
    });

    it.each<BattleOutcome>(['defeat'])('leaves the rate alone on a %s', (kind) => {
      const state = withGoldRate(run(), '4');

      expect(applyBattleResult(state, outcome(kind), STAGE_COUNT, CRYSTALS).rates.gold.eq(4)).toBe(
        true,
      );
    });

    it('raises nothing when the stage has been cleared before', () => {
      // The idle increase is a one-time unlock per stage, not a per-victory bonus. Re-running a
      // stage should not be reaching for the rate table at all.
      const state = run({ stage: 3, clearedStages: 5 });

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('99'), xp: num('99') } }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.rates.gold.eq(0)).toBe(true);
      expect(next.rates.xp.eq(0)).toBe(true);
    });

    it('still pays the one-off lump on a re-fight', () => {
      // Farming a stage you have already beaten is a legitimate way to spend an evening, and it
      // should pay — just not with permanent income.
      const state = run({ stage: 3, clearedStages: 5 });

      const next = applyBattleResult(
        state,
        outcome('victory', { gained: { gold: num(65), xp: num(12) }, rates: { gold: num('99') } }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.wallet.gold.eq(65)).toBe(true);
      expect(next.wallet.xp.eq(12)).toBe(true);
      expect(next.rates.gold.eq(0)).toBe(true);
    });

    it('never lowers a rate the run already had', () => {
      // Re-clearing an earlier stage, or loading a save written against a different curve, must
      // not cut a player's income.
      const state = withGoldRate(run(), '16');

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5') } }),
        STAGE_COUNT,
        CRYSTALS,
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
        STAGE_COUNT,
        CRYSTALS,
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
            STAGE_COUNT,
            CRYSTALS,
          ),
          60_000,
        ).wallet.gold.eq(30),
      ).toBe(true);
    });
  });

  describe('the crystal rate', () => {
    it('steps up by one an hour on a first clear', () => {
      const state = run({ stage: 3, clearedStages: 2 });

      const next = applyBattleResult(state, outcome('victory'), STAGE_COUNT, CRYSTALS);

      expect(next.clearedStages).toBe(3);
      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(3), 12);
    });

    it('does not move however many times a cleared stage is farmed', () => {
      // The rule that keeps farming the fastest fight from being the fastest way to pull. This is
      // the case auto-battle actually produces: parked at the top of the ladder, where `stage`
      // has stopped climbing, winning the same fight for hours.
      let state = run({ stage: STAGE_COUNT, clearedStages: STAGE_COUNT });

      for (let fight = 0; fight < 50; fight++) {
        state = applyBattleResult(state, outcome('victory'), STAGE_COUNT, CRYSTALS);
      }

      expect(state.clearedStages).toBe(STAGE_COUNT);
      expect(state.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(STAGE_COUNT), 12);
    });

    it('steps once per stage across a whole climb, and no more', () => {
      // Fifty fights from a standing start: eight of them are first clears and the rest are the
      // top of the ladder repeating, so the rate lands on the ladder's length rather than on the
      // number of battles won.
      let state = run();

      for (let fight = 0; fight < 50; fight++) {
        state = applyBattleResult(state, outcome('victory'), STAGE_COUNT, CRYSTALS);
      }

      expect(state.clearedStages).toBe(STAGE_COUNT);
      expect(state.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(STAGE_COUNT), 12);
    });

    it('does not move on a loss', () => {
      const state = run({ stage: 5, clearedStages: 4 });

      const next = applyBattleResult(state, outcome('defeat'), STAGE_COUNT, CRYSTALS);

      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(4), 12);
    });

    it('ignores whatever the stage itself claims to grant', () => {
      // Crystals are a function of the clear count, not a per-stage unlock. A stage authored with
      // a crystal rate — a save from an older build, or a fixture — must not be able to set one.
      const state = run({ stage: 1, clearedStages: 0 });

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5'), summons: num('0.0015') } }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(1), 12);
    });

    it('never falls below what the run already earns', () => {
      // A save written by a more generous build keeps its rate. The guard is the same
      // `raiseRates` every other currency goes through.
      const generous = { ...run(), rates: { ...zeroRates(), summons: num('9') } };

      const next = applyBattleResult(generous, outcome('victory'), STAGE_COUNT, CRYSTALS);

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
      const state = run({ stage: 3, clearedStages: 2 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '250' }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.wallet.summons.eq(250)).toBe(true);
      expect(next.clearedStages).toBe(3);
    });

    it('never pays it twice for the same stage', () => {
      // The case `stage` alone cannot answer: at the top of the ladder `stage` stops climbing,
      // so a player farming the last stage would re-earn its bonus on every single win.
      const state = run({ stage: STAGE_COUNT, clearedStages: STAGE_COUNT });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '800' }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.wallet.summons.eq(0)).toBe(true);
      expect(next.clearedStages).toBe(STAGE_COUNT);
    });

    it('credits the stage actually fought when the save came from a richer build', () => {
      // The UI clamps `stage` to the content it has before simulating, so this has to clamp it
      // the same way. Crediting stage 99 would park the counter above anything reachable and
      // silently withhold every remaining first-clear bonus.
      const state = run({ stage: 99, clearedStages: 3 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '800' }),
        STAGE_COUNT,
        CRYSTALS,
      );

      expect(next.clearedStages).toBe(STAGE_COUNT);
      expect(next.wallet.summons.eq(800)).toBe(true);
    });

    it('pays nothing on a loss and leaves the cleared count alone', () => {
      const state = run({ stage: 5, clearedStages: 4 });

      const next = applyBattleResult(state, outcome('defeat'), STAGE_COUNT, CRYSTALS);

      expect(next.wallet.summons.eq(0)).toBe(true);
      expect(next.clearedStages).toBe(4);
    });
  });

  it('leaves the pull RNG position alone', () => {
    // Combat draws from a derived sub-stream. If a battle advanced `rng.calls`, fighting would
    // shift the gacha sequence and a replayed battle would change which characters you pull.
    const state = run({ rng: { seed: 0xc0ffee, calls: 317 } });

    expect(
      applyBattleResult(
        state,
        outcome('victory', { gained: { gold: num(100) } }),
        STAGE_COUNT,
        CRYSTALS,
      ).rng,
    ).toEqual({ seed: 0xc0ffee, calls: 317 });
  });

  it('does not mutate the state it is given', () => {
    const state = withGold(run({ stage: 2, battleCount: 5 }), '10');

    applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(100) } }),
      STAGE_COUNT,
      CRYSTALS,
    );

    expect(state.stage).toBe(2);
    expect(state.battleCount).toBe(5);
    expect(state.wallet.gold.eq(10)).toBe(true);
  });

  it('leaves the clock alone, because core has none', () => {
    const state = run({ lastTickAt: T0 });

    expect(applyBattleResult(state, outcome('victory'), STAGE_COUNT, CRYSTALS).lastTickAt).toBe(T0);
  });
});

/**
 * The repair for the `v2 → v3` migration's hole.
 *
 * That migration carried `goldPerSec` across and started xp, essence and summons at zero, so a
 * returning player watched their gold tick up while nothing else moved — with no way back except
 * re-fighting the ladder. It also seeded `clearedStages` from `stage - 1`, which is one short at
 * the top because `stage` stops climbing there.
 *
 * Both are recoverable without asking the player to fight anything, because the surviving gold
 * rate says exactly how far the run got.
 */
describe('reconcileClearedStages', () => {
  /** The shipped ladder's shape: ascending rates, and a first-clear bonus on every stage. */
  const BONUSES = [200, 200, 250, 300, 350, 400, 500, 800];
  const TOTAL_BONUS = BONUSES.reduce((sum, n) => sum + n, 0);

  const LADDER: readonly StageProgressData[] = [0.5, 1, 1.5, 2.5, 4, 6, 10, 16].map(
    (gold, index) => ({
      // Three rates, matching the shipped shape: crystals are not a per-stage unlock, so a stage
      // does not author one.
      rates: {
        gold: num(gold),
        xp: num(gold / 5),
        essence: num((index + 1) / 1000),
      },
      firstClearSummons: num(BONUSES[index]),
    }),
  );

  /** A save as the migration would have left it: gold intact, everything else zeroed. */
  function migrated(goldRate: string, clearedStages: number): GameState {
    return run({
      rates: { ...zeroRates(), gold: num(goldRate) },
      clearedStages,
      stage: 8,
    });
  }

  /** A run that has genuinely earned everything the ladder grants, crystal rate included. */
  function settled(clearedStages: number): GameState {
    return run({
      clearedStages,
      rates: {
        ...zeroRates(),
        ...LADDER[clearedStages - 1].rates,
        summons: summonRatePerSecond(CRYSTALS, clearedStages),
      },
    });
  }

  it('restores every rate a run had already earned', () => {
    // The reported bug, exactly: gold accumulating and nothing else.
    const broken = migrated('16', 7);

    const fixed = reconcileClearedStages(broken, LADDER, CRYSTALS);

    expect(fixed.rates.gold.eq(16)).toBe(true);
    expect(fixed.rates.xp.gt(0)).toBe(true);
    expect(fixed.rates.essence.gt(0)).toBe(true);
    // Crystals come back too, but from the clear count rather than from the table — which is why
    // this repair heals a rate no stage in `LADDER` grants.
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
  });

  it('gives a brand-new run the crystal base and nothing else', () => {
    // The path every fresh save takes: `newGame` cannot see the curve, so this is where the base
    // is switched on. Gold, xp and essence stay at zero — the first battle is still the only
    // thing worth doing.
    const fresh = run();

    const started = reconcileClearedStages(fresh, LADDER, CRYSTALS);

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
    const fixed = reconcileClearedStages(migrated('16', 7), LADDER, CRYSTALS);

    expect(fixed.clearedStages).toBe(8);
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(8), 12);
  });

  it('restores them to the highest cleared stage, not the first', () => {
    const fixed = reconcileClearedStages(migrated('16', 7), LADDER, CRYSTALS);

    expect(fixed.rates.xp.eq(LADDER[7].rates.xp ?? ZERO)).toBe(true);
    expect(fixed.rates.essence.eq(LADDER[7].rates.essence ?? ZERO)).toBe(true);
  });

  it('pays the first-clear bonus for every stage it credits', () => {
    // Crediting a stage without paying it is worse than leaving it uncredited: `applyBattleResult`
    // will never pay it either, so the crystals are gone for good and the player has no way to
    // even notice. A v2 save that had beaten the ladder is owed the whole 3,000 — the same as a
    // new player earns for climbing the same eight stages.
    const fixed = reconcileClearedStages(migrated('16', 0), LADDER, CRYSTALS);

    expect(fixed.wallet.summons.eq(TOTAL_BONUS)).toBe(true);
  });

  it('pays only for the stages it newly credits', () => {
    // A run already credited with five stages is owed the last three, not all eight.
    const partly = migrated('16', 5);

    const fixed = reconcileClearedStages(partly, LADDER, CRYSTALS);

    expect(fixed.wallet.summons.eq(BONUSES[5] + BONUSES[6] + BONUSES[7])).toBe(true);
  });

  it('never pays the same bonus twice across loads', () => {
    // The property that lets this run on every load. The second pass credits nothing, so it
    // owes nothing.
    const once = reconcileClearedStages(migrated('16', 0), LADDER, CRYSTALS);
    const twice = reconcileClearedStages(once, LADDER, CRYSTALS);

    expect(twice.wallet.summons.eq(TOTAL_BONUS)).toBe(true);
    expect(twice).toBe(once);
  });

  it('pays nothing to a run that has already been credited for everything', () => {
    expect(reconcileClearedStages(settled(8), LADDER, CRYSTALS).wallet.summons.eq(0)).toBe(true);
  });

  it('leaves a run able to afford a ten-pull, which is the point', () => {
    // The reported symptom underneath the symptom: a returning player with a fully cleared ladder
    // could not afford a single ten-pull, because none of the bonuses had ever been paid.
    const fixed = reconcileClearedStages(migrated('16', 0), LADDER, CRYSTALS);

    expect(fixed.wallet.summons.gte(1000)).toBe(true);
  });

  it('corrects a clear count the migration undercounted at the top of the ladder', () => {
    // `stage` stops at 8, so a player who beat everything was recorded as having beaten seven —
    // which is why re-fighting the last stage counted as a first clear and paid its bonus again.
    expect(reconcileClearedStages(migrated('16', 7), LADDER, CRYSTALS).clearedStages).toBe(8);
  });

  it('reads mid-ladder progress off the gold rate too', () => {
    const fixed = reconcileClearedStages(migrated('4', 0), LADDER, CRYSTALS);

    expect(fixed.clearedStages).toBe(5);
    expect(fixed.rates.xp.eq(LADDER[4].rates.xp ?? ZERO)).toBe(true);
  });

  it('credits a fresh run with no stages and owes it nothing', () => {
    const fresh = run();

    const started = reconcileClearedStages(fresh, LADDER, CRYSTALS);

    expect(started.clearedStages).toBe(0);
    expect(started.wallet).toBe(fresh.wallet);
  });

  it('leaves an already-consistent run untouched, by reference', () => {
    // It runs on every load, so a clean save must not churn the snapshot and re-render the UI.
    const healthy = settled(8);

    expect(reconcileClearedStages(healthy, LADDER, CRYSTALS)).toBe(healthy);
  });

  it('is idempotent', () => {
    const once = reconcileClearedStages(migrated('16', 7), LADDER, CRYSTALS);
    const twice = reconcileClearedStages(once, LADDER, CRYSTALS);

    expect(twice).toBe(once);
  });

  it('never lowers a clear count that is ahead of the gold rate', () => {
    // Only ever raises. A run whose rates were damaged some other way must not also lose credit
    // for the stages it cleared.
    const ahead = migrated('0.5', 6);

    expect(reconcileClearedStages(ahead, LADDER, CRYSTALS).clearedStages).toBe(6);
  });

  it('never cuts a rate that is already above what the ladder grants', () => {
    const generous = run({ clearedStages: 2, rates: { ...zeroRates(), gold: num('999') } });

    expect(reconcileClearedStages(generous, LADDER, CRYSTALS).rates.gold.eq(999)).toBe(true);
  });

  it('does not credit stages beyond the content this build ships', () => {
    const beyond = run({ clearedStages: 99, rates: { ...zeroRates(), gold: num('16') } });

    expect(reconcileClearedStages(beyond, LADDER, CRYSTALS).clearedStages).toBe(LADDER.length);
  });

  it('still pays the crystal base when the build ships no stages at all', () => {
    // There is nothing to reconcile without a ladder, but the crystal rate does not come from one
    // — it is a function of the clear count, and a build with no content still earns the base.
    const state = migrated('16', 7);

    const fixed = reconcileClearedStages(state, [], CRYSTALS);

    expect(fixed.clearedStages).toBe(7);
    expect(fixed.rates.gold.eq(16)).toBe(true);
    expect(fixed.rates.xp.eq(0)).toBe(true);
    expect(fixed.wallet).toBe(state.wallet);
    expect(fixed.rates.summons.toNumber()).toBeCloseTo(crystalsAfter(7), 12);
    expect(reconcileClearedStages(fixed, [], CRYSTALS)).toBe(fixed);
  });

  it('does not mutate the state it is given', () => {
    const broken = migrated('16', 7);

    reconcileClearedStages(broken, LADDER, CRYSTALS);

    expect(broken.rates.xp.eq(0)).toBe(true);
    expect(broken.clearedStages).toBe(7);
    expect(broken.wallet.summons.eq(0)).toBe(true);
  });

  it('touches nothing but the rates, the clear count and the crystals it owes', () => {
    const broken = { ...migrated('16', 7), pullCount: 12, pity: 30 };

    const fixed = reconcileClearedStages(broken, LADDER, CRYSTALS);

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
    const fixed = reconcileClearedStages(migrated('16', 7), LADDER, CRYSTALS);

    const after = applyBattleResult(
      fixed,
      outcome('victory', {
        gained: { gold: num(650) },
        rates: { gold: num('16'), xp: num('3') },
        firstClearSummons: '800',
      }),
      LADDER.length,
      CRYSTALS,
    );

    expect(after.rates).toBe(fixed.rates);
    expect(after.wallet.summons.eq(fixed.wallet.summons)).toBe(true);
    expect(after.wallet.gold.eq(fixed.wallet.gold.add(650))).toBe(true);
  });
});
