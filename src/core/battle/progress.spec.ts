// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type CurrencyAmounts, type Rates, zeroRates } from '../currency';
import { num, ZERO } from '../numeric';
import { newGame, type GameState } from '../state';
import { tick } from '../tick';
import { applyBattleResult } from './progress';
import { type BattleOutcome, type BattleResult } from './types';

const T0 = 1_700_000_000_000;
const STAGE_COUNT = 8;

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
    );

    expect(next.stage).toBe(4);
    expect(next.wallet.gold.eq(660)).toBe(true);
  });

  it('banks every currency a stage pays, not just gold', () => {
    const next = applyBattleResult(
      run(),
      outcome('victory', { gained: { gold: num(650), xp: num(120), essence: num(5) } }),
      STAGE_COUNT,
    );

    expect(next.wallet.gold.eq(650)).toBe(true);
    expect(next.wallet.xp.eq(120)).toBe(true);
    expect(next.wallet.essence.eq(5)).toBe(true);
  });

  it.each<BattleOutcome>(['defeat', 'stalemate'])('holds the stage on a %s', (kind) => {
    const state = withGold(run({ stage: 3 }), '500');

    const next = applyBattleResult(state, outcome(kind), STAGE_COUNT);

    expect(next.stage).toBe(3);
    expect(next.wallet.gold.eq(500)).toBe(true);
  });

  it.each<BattleOutcome>(['victory', 'defeat', 'stalemate'])(
    'counts the battle on a %s',
    (kind) => {
      // The counter feeds the battle RNG label. If a loss did not advance it, the retry would be
      // a bit-for-bit replay of the same loss and the stage would be a permanent wall for
      // reasons the player could never see.
      const state = run({ battleCount: 41 });

      expect(applyBattleResult(state, outcome(kind), STAGE_COUNT).battleCount).toBe(42);
    },
  );

  it('stops at the last authored stage, which then repeats', () => {
    const state = run({ stage: STAGE_COUNT });

    const next = applyBattleResult(
      state,
      outcome('victory', { gained: { gold: num(650) } }),
      STAGE_COUNT,
    );

    expect(next.stage).toBe(STAGE_COUNT);
    expect(next.wallet.gold.eq(650)).toBe(true);
  });

  it('pulls a save from a content-richer build back into range', () => {
    // Loading a save whose stage number is past what this build ships must land somewhere real
    // rather than on a stage that does not exist.
    const state = run({ stage: 99 });

    expect(applyBattleResult(state, outcome('defeat'), STAGE_COUNT).stage).toBe(STAGE_COUNT);
  });

  it.each([0, -5, Number.NaN, Infinity])(
    'treats an unusable stage count of %p as a single stage',
    (stageCount) => {
      const state = run({ stage: 4 });

      expect(applyBattleResult(state, outcome('victory'), stageCount).stage).toBe(1);
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
      );

      expect(next.rates.gold.eq('0.5')).toBe(true);
      expect(next.rates.xp.eq('0.1')).toBe(true);
    });

    it.each<BattleOutcome>(['defeat', 'stalemate'])('leaves the rate alone on a %s', (kind) => {
      const state = withGoldRate(run(), '4');

      expect(applyBattleResult(state, outcome(kind), STAGE_COUNT).rates.gold.eq(4)).toBe(true);
    });

    it('never lowers a rate the run already had', () => {
      // Re-clearing an earlier stage, or loading a save written against a different curve, must
      // not cut a player's income.
      const state = withGoldRate(run(), '16');

      const next = applyBattleResult(
        state,
        outcome('victory', { rates: { gold: num('0.5') } }),
        STAGE_COUNT,
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
      );

      expect(next.rates.gold.eq(16)).toBe(true);
      expect(next.rates.essence.eq('0.05')).toBe(true);
    });

    it('is what makes an idle run pay at all', () => {
      // Ties the reward to the thing it feeds: `tick` multiplies by this rate, so a run that has
      // never won a battle accrues literally nothing.
      const untouched = run();

      expect(tick(untouched, 60_000).wallet.gold.eq(0)).toBe(true);
      expect(
        tick(
          applyBattleResult(
            untouched,
            outcome('victory', { rates: { gold: num('0.5') } }),
            STAGE_COUNT,
          ),
          60_000,
        ).wallet.gold.eq(30),
      ).toBe(true);
    });
  });

  describe('first-clear bonus', () => {
    it('pays the summon bonus the first time a stage falls', () => {
      const state = run({ stage: 3, clearedStages: 2 });

      const next = applyBattleResult(
        state,
        outcome('victory', { firstClearSummons: '250' }),
        STAGE_COUNT,
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
      );

      expect(next.clearedStages).toBe(STAGE_COUNT);
      expect(next.wallet.summons.eq(800)).toBe(true);
    });

    it('pays nothing on a loss and leaves the cleared count alone', () => {
      const state = run({ stage: 5, clearedStages: 4 });

      const next = applyBattleResult(state, outcome('defeat'), STAGE_COUNT);

      expect(next.wallet.summons.eq(0)).toBe(true);
      expect(next.clearedStages).toBe(4);
    });
  });

  it('leaves the pull RNG position alone', () => {
    // Combat draws from a derived sub-stream. If a battle advanced `rng.calls`, fighting would
    // shift the gacha sequence and a replayed battle would change which characters you pull.
    const state = run({ rng: { seed: 0xc0ffee, calls: 317 } });

    expect(
      applyBattleResult(state, outcome('victory', { gained: { gold: num(100) } }), STAGE_COUNT).rng,
    ).toEqual({ seed: 0xc0ffee, calls: 317 });
  });

  it('does not mutate the state it is given', () => {
    const state = withGold(run({ stage: 2, battleCount: 5 }), '10');

    applyBattleResult(state, outcome('victory', { gained: { gold: num(100) } }), STAGE_COUNT);

    expect(state.stage).toBe(2);
    expect(state.battleCount).toBe(5);
    expect(state.wallet.gold.eq(10)).toBe(true);
  });

  it('leaves the clock alone, because core has none', () => {
    const state = run({ lastTickAt: T0 });

    expect(applyBattleResult(state, outcome('victory'), STAGE_COUNT).lastTickAt).toBe(T0);
  });
});
