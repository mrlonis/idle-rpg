// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type EnemyFormationData, type StageEncounterData } from './battle/types';
import {
  advancePosition,
  type ChapterCurveData,
  chapterSize,
  clampPosition,
  ladderShape,
  type LadderShape,
  positionAt,
  resolveLadder,
  stageIndex,
  stageKindAt,
  stagePayout,
  type StageRewardCurveData,
  stagesInChapter,
  stagesThroughChapter,
  totalStages,
} from './ladder';

/**
 * The shipped chapter curve.
 *
 * The real numbers rather than round test ones, because the table in the milestone plan is what
 * this is being checked against — and half the point of a formula is that the plan's running
 * totals can be reproduced rather than trusted.
 */
const CURVE: ChapterCurveData = {
  baseStages: 50,
  stepStages: 10,
  chaptersPerBand: 10,
  maxStages: 200,
  miniBossEvery: 10,
};

const REWARDS: StageRewardCurveData = {
  baseRates: { gold: 0.5, xp: 0.1, essence: 0.0015 },
  exponent: 1.13,
  rewardSeconds: 40,
  firstClearSummons: { base: 200, perStage: 6, miniBossMultiplier: 2, bossMultiplier: 5 },
};

/** Two chapters of five and three, so nothing can pass by looking like the identity. */
const LADDER: LadderShape = { chapters: [5, 3] };

const NOBODY: EnemyFormationData = { front: [], back: [] };

function encounter(id: string): StageEncounterData {
  return { id, name: id, enemies: NOBODY, level: 1 };
}

describe('chapter size', () => {
  it('holds the first band at the base length', () => {
    for (let chapter = 1; chapter <= 10; chapter++) {
      expect(chapterSize(CURVE, chapter), `chapter ${chapter}`).toBe(50);
    }
  });

  it('steps once per band', () => {
    expect(chapterSize(CURVE, 11)).toBe(60);
    expect(chapterSize(CURVE, 20)).toBe(60);
    expect(chapterSize(CURVE, 21)).toBe(70);
    expect(chapterSize(CURVE, 100)).toBe(140);
  });

  it('stops growing at the cap rather than continuing', () => {
    // Without this a chapter becomes a career: ten stages a band puts chapter 500 at five thousand
    // stages on its own. Capping pushes the ladder's length into the chapter *count*, where it can
    // be paced.
    expect(chapterSize(CURVE, 151)).toBe(200);
    expect(chapterSize(CURVE, 500)).toBe(200);
    expect(chapterSize(CURVE, 5000)).toBe(200);
  });

  it('reproduces the running totals the roadmap is planned against', () => {
    // The reason this is a formula with a test rather than a table in a document. Both shipped
    // chapters sit in the first band, so nothing about the step or the cap is exercised by
    // content — it is exercised here or nowhere.
    expect(stagesThroughChapter(CURVE, 10)).toBe(500);
    expect(stagesThroughChapter(CURVE, 20)).toBe(1_100);
    expect(stagesThroughChapter(CURVE, 50)).toBe(3_500);
    expect(stagesThroughChapter(CURVE, 100)).toBe(9_500);
    expect(stagesThroughChapter(CURVE, 160)).toBe(20_000);
  });

  it('never returns a chapter nobody can fight, whatever the curve says', () => {
    const nonsense: ChapterCurveData = {
      baseStages: 0,
      stepStages: -5,
      chaptersPerBand: 0,
      maxStages: -1,
      miniBossEvery: 0,
    };

    expect(chapterSize(nonsense, 1)).toBeGreaterThanOrEqual(1);
    expect(chapterSize(CURVE, Number.NaN)).toBe(50);
    expect(chapterSize(CURVE, -3)).toBe(50);
  });
});

describe('the boss rhythm', () => {
  it('makes every tenth stage a mini-boss', () => {
    expect(stageKindAt(CURVE, 50, 10)).toBe('mini-boss');
    expect(stageKindAt(CURVE, 50, 40)).toBe('mini-boss');
    expect(stageKindAt(CURVE, 50, 9)).toBe('normal');
    expect(stageKindAt(CURVE, 50, 11)).toBe('normal');
  });

  it('makes the last stage of a chapter a boss even when it lands on the interval', () => {
    // A fifty-stage chapter's stage 50 is a boss, not a mini-boss that happens to be last. Getting
    // this the other way round would give the chapter no boss at all in exactly the chapters the
    // curve produces.
    expect(stageKindAt(CURVE, 50, 50)).toBe('boss');
    expect(stageKindAt(CURVE, 200, 200)).toBe('boss');
  });

  it('gives a longer chapter more mini-bosses and still one boss', () => {
    const kinds = Array.from({ length: 200 }, (_, index) => stageKindAt(CURVE, 200, index + 1));

    expect(kinds.filter((kind) => kind === 'mini-boss')).toHaveLength(19);
    expect(kinds.filter((kind) => kind === 'boss')).toHaveLength(1);
  });
});

describe('positions', () => {
  it('counts a linear index across chapter boundaries', () => {
    expect(stageIndex(LADDER, { chapter: 1, stage: 1 })).toBe(1);
    expect(stageIndex(LADDER, { chapter: 1, stage: 5 })).toBe(5);
    expect(stageIndex(LADDER, { chapter: 2, stage: 1 })).toBe(6);
    expect(stageIndex(LADDER, { chapter: 2, stage: 3 })).toBe(8);
  });

  it('round-trips every stage on the ladder', () => {
    for (let index = 1; index <= totalStages(LADDER); index++) {
      expect(stageIndex(LADDER, positionAt(LADDER, index)), `index ${index}`).toBe(index);
    }
  });

  it('rolls into the next chapter and stops at the top', () => {
    expect(advancePosition(LADDER, { chapter: 1, stage: 5 })).toEqual({ chapter: 2, stage: 1 });
    expect(advancePosition(LADDER, { chapter: 2, stage: 3 })).toEqual({ chapter: 2, stage: 3 });
  });

  it('lands a save from a content-richer build on the last stage this build ships', () => {
    // Which is where a player who has run out of content already is, and is the only answer that
    // does not either lose their place or point at a stage that does not exist.
    expect(clampPosition(LADDER, { chapter: 9, stage: 400 })).toEqual({ chapter: 2, stage: 3 });
    expect(clampPosition(LADDER, { chapter: 1, stage: 99 })).toEqual({ chapter: 1, stage: 5 });
  });

  it.each([
    { chapter: 0, stage: 0 },
    { chapter: -4, stage: -1 },
    { chapter: Number.NaN, stage: Infinity },
  ])('repairs a damaged position %p', (position) => {
    const clamped = clampPosition(LADDER, position);

    expect(clamped.chapter).toBeGreaterThanOrEqual(1);
    expect(clamped.stage).toBeGreaterThanOrEqual(1);
    expect(stagesInChapter(LADDER, clamped.chapter)).toBeGreaterThanOrEqual(clamped.stage);
  });

  it('answers a build with no content at all rather than throwing', () => {
    const empty: LadderShape = { chapters: [] };

    expect(totalStages(empty)).toBe(0);
    expect(clampPosition(empty, { chapter: 3, stage: 3 })).toEqual({ chapter: 1, stage: 1 });
    expect(positionAt(empty, 7)).toEqual({ chapter: 1, stage: 1 });
    expect(advancePosition(empty, { chapter: 1, stage: 1 })).toEqual({ chapter: 1, stage: 1 });
  });
});

describe('what a stage pays', () => {
  it('opens on the rates the hand-authored ladder opened on', () => {
    // The opening is the one part of the curve a player experiences at full resolution — a run
    // starts at zero on all three and the first battle is what switches idle income on — so it is
    // pinned rather than left to fall out of the exponent.
    const first = stagePayout(REWARDS, 1);

    expect(Number(first.rates.gold)).toBeCloseTo(0.5, 10);
    expect(Number(first.rates.xp)).toBeCloseTo(0.1, 10);
    expect(first.reward.gold).toBe(20);
  });

  it('rises strictly, so no clear is ever a sidestep', () => {
    let previous = 0;
    for (let index = 1; index <= 500; index++) {
      const gold = Number(stagePayout(REWARDS, index).rates.gold);
      expect(gold, `stage ${index}`).toBeGreaterThan(previous);
      previous = gold;
    }
  });

  it('decelerates, which is the whole requirement of the shape', () => {
    // ⚠️ The property a constant per-stage multiplier cannot have and this ladder cannot do
    // without: ×1.1 a stage compounded over nine thousand stages is a number with three hundred
    // digits in it. A power law's per-stage multiplier is `1 + exponent / index`, so it falls away
    // on its own.
    const step = (index: number): number =>
      Number(stagePayout(REWARDS, index + 1).rates.gold) /
      Number(stagePayout(REWARDS, index).rates.gold);

    expect(step(1)).toBeGreaterThan(step(10));
    expect(step(10)).toBeGreaterThan(step(100));
    expect(step(100)).toBeLessThan(1.02);
  });

  it('keeps the lump in proportion to the income it unlocks', () => {
    // The lump should read as a bonus and the rate as the progression. It is authored as a
    // duration precisely so it cannot drift away from the thing it is measured against.
    for (const index of [1, 7, 50, 99, 100]) {
      const payout = stagePayout(REWARDS, index);
      const seconds = Number(payout.reward.gold) / Number(payout.rates.gold);

      expect(seconds, `stage ${index}`).toBeGreaterThan(20);
      expect(seconds, `stage ${index}`).toBeLessThan(60);
    }
  });

  it('never pays a lump of nothing, however small the rate', () => {
    // A stage that paid zero gold would read as a bug on the results screen. Essence is the one
    // that is allowed to be absent, because "+0 essence" reads worse than no line at all.
    const first = stagePayout(REWARDS, 1);

    expect(Number(first.reward.gold)).toBeGreaterThan(0);
    expect(Number(first.reward.xp)).toBeGreaterThan(0);
    expect(first.reward.essence).toBeUndefined();
    expect(Number(stagePayout(REWARDS, 100).reward.essence)).toBeGreaterThan(0);
  });

  it('pays a mini-boss and a boss real crystals for the trouble', () => {
    const ordinary = stagePayout(REWARDS, 40).firstClearSummons;

    expect(stagePayout(REWARDS, 40, 'mini-boss').firstClearSummons).toBe(ordinary * 2);
    expect(stagePayout(REWARDS, 40, 'boss').firstClearSummons).toBe(ordinary * 5);
  });

  it('never lets a crystal payout compound, whatever the stage index', () => {
    // A pull costs a flat price and an ascension a flat count of copies, so a compounding crystal
    // income outruns what it is spent on — which is how ascension quietly stops being a
    // constraint on anything. Linear is the fix, and this is what says it stayed linear.
    const step = (index: number): number =>
      stagePayout(REWARDS, index + 1).firstClearSummons -
      stagePayout(REWARDS, index).firstClearSummons;

    expect(step(1)).toBe(step(500));
  });
});

describe('resolving a ladder', () => {
  const chapters = [
    { id: 'one', name: 'One', stages: [1, 2, 3, 4, 5].map((n) => encounter(`a${n}`)) },
    { id: 'two', name: 'Two', stages: [1, 2, 3].map((n) => encounter(`b${n}`)) },
  ];

  it('flattens chapters into the order they are climbed', () => {
    const stages = resolveLadder(chapters, CURVE, REWARDS);

    expect(stages.map((stage) => stage.id)).toEqual([
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'b1',
      'b2',
      'b3',
    ]);
  });

  it('pays each stage by its place on the whole ladder, not within its chapter', () => {
    // Income is continuous across a chapter boundary, which is what makes the seam invisible: the
    // first stage of chapter 2 pays more than the last stage of chapter 1, not less.
    const stages = resolveLadder(chapters, CURVE, REWARDS);
    const rates = stages.map((stage) => Number(stage.rates.gold));

    for (let index = 1; index < rates.length; index++) {
      expect(rates[index], stages[index].id).toBeGreaterThan(rates[index - 1]);
    }
  });

  it('marks the last stage of each chapter a boss', () => {
    const stages = resolveLadder(chapters, CURVE, REWARDS);

    expect(stages.map((stage) => stage.kind)).toEqual([
      'normal',
      'normal',
      'normal',
      'normal',
      'boss',
      'normal',
      'normal',
      'boss',
    ]);
  });

  it('describes the ladder it just resolved', () => {
    expect(ladderShape(chapters)).toEqual({ chapters: [5, 3] });
    expect(totalStages(ladderShape(chapters))).toBe(resolveLadder(chapters, CURVE, REWARDS).length);
  });
});
