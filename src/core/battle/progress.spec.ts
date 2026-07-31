// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
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

function outcome(kind: BattleOutcome, gold = '0', goldPerSec = '0'): BattleResult {
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
        ? { gold: num(gold), goldPerSec: num(goldPerSec) }
        : { gold: ZERO, goldPerSec: ZERO },
  };
}

describe('applyBattleResult', () => {
  it('advances the stage on a victory and banks the reward', () => {
    const state = run({ stage: 3, gold: num('500') });

    const next = applyBattleResult(state, outcome('victory', '160'), STAGE_COUNT);

    expect(next.stage).toBe(4);
    expect(next.gold.eq(660)).toBe(true);
  });

  it.each<BattleOutcome>(['defeat', 'stalemate'])('holds the stage on a %s', (kind) => {
    const state = run({ stage: 3, gold: num('500') });

    const next = applyBattleResult(state, outcome(kind), STAGE_COUNT);

    expect(next.stage).toBe(3);
    expect(next.gold.eq(500)).toBe(true);
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

    const next = applyBattleResult(state, outcome('victory', '650'), STAGE_COUNT);

    expect(next.stage).toBe(STAGE_COUNT);
    expect(next.gold.eq(650)).toBe(true);
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
      const state = run({ goldPerSec: ZERO });

      const next = applyBattleResult(state, outcome('victory', '25', '0.5'), STAGE_COUNT);

      expect(next.goldPerSec.eq('0.5')).toBe(true);
    });

    it.each<BattleOutcome>(['defeat', 'stalemate'])('leaves the rate alone on a %s', (kind) => {
      const state = run({ goldPerSec: num('4') });

      expect(applyBattleResult(state, outcome(kind), STAGE_COUNT).goldPerSec.eq(4)).toBe(true);
    });

    it('never lowers a rate the run already had', () => {
      // Re-clearing an earlier stage, or loading a save written against a different curve, must
      // not cut a player's income.
      const state = run({ goldPerSec: num('16') });

      const next = applyBattleResult(state, outcome('victory', '25', '0.5'), STAGE_COUNT);

      expect(next.goldPerSec.eq(16)).toBe(true);
    });

    it('is what makes an idle run pay at all', () => {
      // Ties the reward to the thing it feeds: `tick` multiplies by this rate, so a run that has
      // never won a battle accrues literally nothing.
      const untouched = run({ goldPerSec: ZERO });

      expect(tick(untouched, 60_000).gold.eq(0)).toBe(true);
      expect(
        tick(
          applyBattleResult(untouched, outcome('victory', '0', '0.5'), STAGE_COUNT),
          60_000,
        ).gold.eq(30),
      ).toBe(true);
    });
  });

  it('leaves the pull RNG position alone', () => {
    // Combat draws from a derived sub-stream. If a battle advanced `rng.calls`, fighting would
    // shift the gacha sequence and a replayed battle would change which characters you pull.
    const state = run({ rng: { seed: 0xc0ffee, calls: 317 } });

    expect(applyBattleResult(state, outcome('victory', '100'), STAGE_COUNT).rng).toEqual({
      seed: 0xc0ffee,
      calls: 317,
    });
  });

  it('does not mutate the state it is given', () => {
    const state = run({ stage: 2, battleCount: 5, gold: num('10') });

    applyBattleResult(state, outcome('victory', '100'), STAGE_COUNT);

    expect(state.stage).toBe(2);
    expect(state.battleCount).toBe(5);
    expect(state.gold.eq(10)).toBe(true);
  });

  it('leaves the clock alone, because core has none', () => {
    const state = run({ lastTickAt: T0 });

    expect(applyBattleResult(state, outcome('victory'), STAGE_COUNT).lastTickAt).toBe(T0);
  });
});
