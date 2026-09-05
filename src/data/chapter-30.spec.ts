// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  applyBattleResult,
  fromSaveData,
  ladderShape,
  newGame,
  num,
  reconcileClearedStages,
  resolveLadder,
  toSaveData,
  toCurrencyAmounts,
  totalStages,
  type BattleResult,
  type ChapterData,
} from '../core';
import { SUMMON_RATE } from './banners';
import { CHAPTERS, CHAPTER_CURVE, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';
import { EMBLEM_RATE } from './emblems';
import { GEAR_RULES } from './gear';
import { LEVEL_CURVE } from './levels';

const chapters: readonly ChapterData[] = CHAPTERS;
const before = chapters.slice(0, 29);
const shape = ladderShape(chapters);
const oldShape = ladderShape(before);
const oldDepth = totalStages(oldShape);
const stages = resolveLadder(chapters, CHAPTER_CURVE, STAGE_REWARDS, GEAR_RULES);
const curves = { summons: SUMMON_RATE, emblem: EMBLEM_RATE };
const nowMs = 1_700_000_000_000;

function victory(index: number): BattleResult {
  const stage = stages[index];
  return {
    outcome: 'victory',
    ticks: 1,
    timedOut: false,
    events: [],
    final: [],
    stageId: stage.id,
    durationMs: 100,
    roster: [],
    reward: {
      gained: toCurrencyAmounts(stage.reward),
      rates: {
        gold: num(stage.rates.gold ?? 0),
        xp: num(stage.rates.xp ?? 0),
        essence: num(stage.rates.essence ?? 0),
      },
      firstClearSummons: num(stage.firstClearSummons ?? 0),
    },
  };
}

describe('continuing a save after chapter 30 is appended', () => {
  it('preserves the former endpoint and pays only the new first clear', () => {
    const endpoint = before[before.length - 1];
    const saved = reconcileClearedStages(
      {
        ...newGame({ seed: 123, nowMs }),
        chapter: before.length,
        stage: endpoint.stages.length,
        clearedStages: oldDepth,
      },
      oldShape,
      CHAPTER_CURVE,
      STAGE_REWARDS,
      curves,
    );
    const decoded = fromSaveData(toSaveData(saved), {
      fallbackSeed: 123,
      nowMs,
      characters: new Map(CHARACTERS.map((character) => [character.id, character])),
      levelCurve: LEVEL_CURVE,
    });
    expect(decoded.issues).toEqual([]);
    const loaded = reconcileClearedStages(
      decoded.state,
      shape,
      CHAPTER_CURVE,
      STAGE_REWARDS,
      curves,
    );
    expect(loaded.chapter).toBe(before.length);
    expect(loaded.stage).toBe(endpoint.stages.length);
    expect(loaded.clearedStages).toBe(oldDepth);
    expect(loaded.wallet.summons.eq(saved.wallet.summons)).toBe(true);

    const continued = applyBattleResult(loaded, victory(oldDepth - 1), shape, curves);
    expect(continued.chapter).toBe(before.length + 1);
    expect(continued.stage).toBe(1);
    expect(continued.clearedStages).toBe(oldDepth);
    expect(continued.wallet.summons.eq(loaded.wallet.summons)).toBe(true);

    const cleared = applyBattleResult(continued, victory(oldDepth), shape, curves);
    expect(cleared.stage).toBe(2);
    expect(cleared.clearedStages).toBe(oldDepth + 1);
    expect(
      cleared.wallet.summons
        .sub(continued.wallet.summons)
        .eq(num(stages[oldDepth].firstClearSummons ?? 0)),
    ).toBe(true);
    expect(cleared.rates.gold.gte(continued.rates.gold)).toBe(true);
  });
});
