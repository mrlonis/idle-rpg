import {
  type AuthoredCurrencies,
  type StageData,
  type StageEncounterData,
  type StageKind,
} from './battle/types';

/**
 * The ladder, in chapters.
 *
 * Stages used to be one flat list and a run's position one integer. That worked at twenty-four
 * stages and does not survive the shape this game is heading for — hundreds of stages a chapter,
 * and eventually thousands of stages before the level cap is in reach. Two things had to change
 * and both live here:
 *
 * - **Where a run is, is a chapter and a stage within it** rather than a linear index. A linear
 *   index is only meaningful against the exact chapter sizes it was written under, so retuning a
 *   chapter's length would silently relocate every player mid-ladder. A chapter and a stage still
 *   means the same place afterwards.
 * - **What a stage pays is a function, not a table.** Nine and a half thousand hand-authored rate
 *   tables is not something anybody maintains, and the numbers in one are the least interesting
 *   part of a stage — the line-up and the level are the content. So `data/` authors the
 *   encounters and a handful of coefficients, and {@link stagePayout} evaluates the rest.
 *
 * `core/` still cannot see `data/`: the ladder arrives as a {@link LadderShape} and the
 * coefficients as a {@link StageRewardCurveData}, exactly as every other piece of content does.
 */

/**
 * Where a run is on the ladder. Both fields are 1-based.
 *
 * {@link GameState} satisfies this structurally, which is deliberate: it means every conversion
 * to a linear index goes through {@link stageIndex} rather than through arithmetic somebody wrote
 * inline, and it means a position can be passed around without unpacking it.
 */
export interface LadderPosition {
  readonly chapter: number;
  /** The stage **within that chapter**, not a position on the whole ladder. */
  readonly stage: number;
}

/**
 * The ladder this build actually ships, as the number of stages in each chapter.
 *
 * Sizes rather than the chapters themselves, because nothing in `core/` needs to know what a
 * chapter is called or who stands in it — progression is arithmetic over lengths. It is a list
 * rather than the {@link ChapterCurveData} formula on purpose: the formula says how long a
 * chapter *should* be, and this says how long the authored ones *are*. A build that ships two
 * chapters must not let a formula convince it that it has a hundred.
 */
export interface LadderShape {
  readonly chapters: readonly number[];
}

/** A chapter as authored in `data/`: a name, and the encounters in it, in order. */
export interface ChapterData {
  readonly id: string;
  readonly name: string;
  readonly stages: readonly StageEncounterData[];
}

/**
 * How long a chapter is, as a formula.
 *
 * Chapters get longer in bands: the first ten hold {@link baseStages} each, the next ten hold
 * {@link stepStages} more, and so on until {@link maxStages}. The shipped chapters are both in
 * the first band, so shipping them proves the chapter *flow* and not this — which is exactly why
 * it is a function with its own tests rather than something inferred from two chapters that
 * happen to be the same length.
 */
export interface ChapterCurveData {
  /** Stages in a chapter of the first band. */
  readonly baseStages: number;
  /** Stages a chapter gains with each band above the first. */
  readonly stepStages: number;
  /** Chapters per band. */
  readonly chaptersPerBand: number;
  /** The most stages a chapter may ever hold. Growth stops here rather than continuing. */
  readonly maxStages: number;
  /** Every nth stage of a chapter is a mini-boss. The chapter's last stage is a boss instead. */
  readonly miniBossEvery: number;
}

/**
 * What a stage pays, as coefficients.
 *
 * Idle income is `base * index ** exponent`, over the stage's **linear** index rather than its
 * position within a chapter — so income is continuous across a chapter boundary, which is what
 * makes the seam invisible to the player. Three things fall out of the shape that are worth
 * knowing before retuning it:
 *
 * - **A power law is a geometric curve that decelerates.** The per-stage multiplier is
 *   `1 + exponent / index`: roughly ×2 over the first stage, ×1.1 by stage ten, ×1.01 by stage
 *   a hundred. That is the shape the hand-authored ladder was already converging on — milestone 7
 *   bent its gold slope from ×1.4 a stage down to ×1.1 for exactly this reason — and it is the
 *   only family that survives a ladder this long: ×1.1 compounded over nine thousand stages is a
 *   number with three hundred digits in it.
 * - **It is calibrated against enemy level, not against stage count.** The coefficients are
 *   chosen so a stage pays roughly what the old twenty-four-stage ladder paid at the same enemy
 *   level. That is what stops "four times as many stages" from meaning "four times the income".
 * - **Every rate shares one exponent.** The three levelling currencies are meant to stay within
 *   about a third of each other in time-to-afford (see [economy](../../docs/economy.md)), and
 *   that is a statement about their ratio — which a shared exponent holds fixed for the whole
 *   ladder and a per-currency one would quietly drift.
 */
export interface StageRewardCurveData {
  /** Idle income per second unlocked by the **first** stage of the ladder, per currency. */
  readonly baseRates: {
    readonly gold: number;
    readonly xp: number;
    readonly essence: number;
  };
  /** The power the linear stage index is raised to. */
  readonly exponent: number;
  /**
   * The one-off lump, in **seconds of the income the stage unlocks**.
   *
   * Expressed as a duration rather than as an amount so it cannot drift away from the rate it is
   * measured against. The lump is deliberately the smaller half of the deal: a rate compounds
   * with time away and a lump sum does not.
   */
  readonly rewardSeconds: number;
  /**
   * Summon crystals paid the **first** time a stage falls, and never again.
   *
   * Linear in the stage index, for the reason the crystal *rate* is linear in the clear count: a
   * pull costs a flat price, so anything compounding outruns what it is spent on. The two
   * multipliers are where a chapter's rhythm pays out — a mini-boss and a chapter boss are worth
   * stopping for, and crystals are the reward that says so without touching the income curve.
   */
  readonly firstClearSummons: {
    readonly base: number;
    readonly perStage: number;
    readonly miniBossMultiplier: number;
    readonly bossMultiplier: number;
  };
}

/** What clearing one stage is worth, evaluated from the curve. */
export interface StagePayout {
  /** Idle income the run is raised to. */
  readonly rates: AuthoredCurrencies;
  /** The one-off lump, paid on every clear. */
  readonly reward: AuthoredCurrencies;
  /** Crystals paid on the first clear only. */
  readonly firstClearSummons: number;
}

function positiveInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 1) : fallback;
}

/**
 * How many stages chapter `chapter` holds.
 *
 * Clamps rather than trusting, like everything else that reads authored numbers: a curve with a
 * zero step or a `maxStages` below `baseStages` still yields a chapter somebody can fight.
 */
export function chapterSize(curve: ChapterCurveData, chapter: number): number {
  const base = positiveInt(curve.baseStages, 1);
  const step = Number.isFinite(curve.stepStages) ? Math.max(Math.floor(curve.stepStages), 0) : 0;
  const perBand = positiveInt(curve.chaptersPerBand, 1);
  const max = Math.max(positiveInt(curve.maxStages, base), base);
  const index = positiveInt(chapter, 1);
  const band = Math.floor((index - 1) / perBand);
  return Math.min(base + step * band, max);
}

/** Every stage in chapters 1..`chapters`, which is where a chapter number lands on the ladder. */
export function stagesThroughChapter(curve: ChapterCurveData, chapters: number): number {
  const last = Number.isFinite(chapters) ? Math.max(Math.floor(chapters), 0) : 0;
  let total = 0;
  for (let chapter = 1; chapter <= last; chapter++) {
    total += chapterSize(curve, chapter);
  }
  return total;
}

/**
 * Whether a stage is an ordinary one, a mini-boss, or the chapter's boss.
 *
 * The chapter's **last** stage is always the boss, even when it also lands on the mini-boss
 * interval — a fifty-stage chapter's stage 50 is a boss, not a mini-boss that happens to be last.
 */
export function stageKindAt(
  curve: ChapterCurveData,
  chapterStages: number,
  stage: number,
): StageKind {
  const size = positiveInt(chapterStages, 1);
  const index = positiveInt(stage, 1);
  if (index >= size) {
    return 'boss';
  }
  const every = positiveInt(curve.miniBossEvery, 1);
  return index % every === 0 ? 'mini-boss' : 'normal';
}

/** How many stages the whole authored ladder holds. */
export function totalStages(shape: LadderShape): number {
  let total = 0;
  for (const stages of shape.chapters) {
    total += Number.isFinite(stages) ? Math.max(Math.floor(stages), 0) : 0;
  }
  return total;
}

/** How many stages the authored chapter `chapter` holds, or zero if this build has no such chapter. */
export function stagesInChapter(shape: LadderShape, chapter: number): number {
  const size = shape.chapters[Math.floor(chapter) - 1];
  return size !== undefined && Number.isFinite(size) ? Math.max(Math.floor(size), 0) : 0;
}

/**
 * Clamps a position into the ladder this build ships.
 *
 * The reason positions are stored rather than a linear index is also the reason this exists: a
 * save written by a content-richer build names a chapter this one does not have, and it has to
 * land somewhere sensible rather than on `undefined`. It lands on the **last stage this build
 * ships**, which is where a player who has run out of content already is.
 *
 * An empty ladder resolves to chapter 1, stage 1 — a build with no content still has to answer
 * "where am I", and the only honest answer is "at the beginning".
 */
export function clampPosition(shape: LadderShape, position: LadderPosition): LadderPosition {
  const chapters = shape.chapters.length;
  if (chapters === 0) {
    return { chapter: 1, stage: 1 };
  }
  const chapter = Math.min(positiveInt(position.chapter, 1), chapters);
  const size = Math.max(stagesInChapter(shape, chapter), 1);
  return { chapter, stage: Math.min(positiveInt(position.stage, 1), size) };
}

/**
 * The 1-based linear index of a position: how many stages deep into the ladder it is.
 *
 * The clear count, the crystal rate and the reward curve are all functions of this rather than of
 * the position, because all three are quantities *earned* rather than places — "how many stages
 * have I ever beaten" means the same thing whatever shape the ladder is cut into.
 */
export function stageIndex(shape: LadderShape, position: LadderPosition): number {
  const clamped = clampPosition(shape, position);
  let index = 0;
  for (let chapter = 1; chapter < clamped.chapter; chapter++) {
    index += stagesInChapter(shape, chapter);
  }
  return index + clamped.stage;
}

/** The inverse of {@link stageIndex}: where the `index`th stage of the ladder sits. */
export function positionAt(shape: LadderShape, index: number): LadderPosition {
  const total = totalStages(shape);
  if (total === 0) {
    return { chapter: 1, stage: 1 };
  }
  let remaining = Math.min(positiveInt(index, 1), total);
  for (let chapter = 1; chapter <= shape.chapters.length; chapter++) {
    const size = stagesInChapter(shape, chapter);
    if (remaining <= size) {
      return { chapter, stage: Math.max(remaining, 1) };
    }
    remaining -= size;
  }
  return clampPosition(shape, { chapter: shape.chapters.length, stage: Number.MAX_SAFE_INTEGER });
}

/**
 * The stage after this one, rolling into the next chapter and stopping at the top of the ladder.
 *
 * Stopping rather than wrapping is what makes the last stage farmable, and it is why
 * `clearedStages` exists as a separate counter: once this stops climbing it can no longer answer
 * "was that a first clear".
 */
export function advancePosition(shape: LadderShape, position: LadderPosition): LadderPosition {
  return positionAt(shape, stageIndex(shape, position) + 1);
}

function rateAt(base: number, exponent: number, index: number): number {
  if (!Number.isFinite(base) || base <= 0) {
    return 0;
  }
  const power = Number.isFinite(exponent) ? exponent : 1;
  return base * Math.pow(index, power);
}

/**
 * What the `index`th stage of the ladder pays.
 *
 * Rates are left unrounded — they are compared, multiplied and formatted, never read — while the
 * two payouts are whole numbers, because a lump of 20.4 gold is a number the player would have to
 * be shown. Essence is dropped from the lump when it rounds to nothing rather than being paid as
 * a zero: the early ladder's essence income is small on purpose, and "+0 essence" on a results
 * screen reads as a bug.
 */
export function stagePayout(
  curve: StageRewardCurveData,
  index: number,
  kind: StageKind = 'normal',
): StagePayout {
  const stage = positiveInt(index, 1);
  const gold = rateAt(curve.baseRates.gold, curve.exponent, stage);
  const xp = rateAt(curve.baseRates.xp, curve.exponent, stage);
  const essence = rateAt(curve.baseRates.essence, curve.exponent, stage);

  const seconds = Number.isFinite(curve.rewardSeconds) ? Math.max(curve.rewardSeconds, 0) : 0;
  const lumpEssence = Math.round(essence * seconds);

  const summons = curve.firstClearSummons;
  const base = Number.isFinite(summons.base) ? Math.max(summons.base, 0) : 0;
  const perStage = Number.isFinite(summons.perStage) ? Math.max(summons.perStage, 0) : 0;
  const multiplier =
    kind === 'boss'
      ? Math.max(summons.bossMultiplier, 1)
      : kind === 'mini-boss'
        ? Math.max(summons.miniBossMultiplier, 1)
        : 1;

  return {
    rates: { gold, xp, essence },
    reward: {
      gold: Math.max(Math.round(gold * seconds), 1),
      xp: Math.max(Math.round(xp * seconds), 1),
      ...(lumpEssence > 0 ? { essence: lumpEssence } : {}),
    },
    firstClearSummons: Math.round((base + perStage * (stage - 1)) * multiplier),
  };
}

/**
 * An authored encounter plus what clearing it pays: the {@link StageData} the simulation takes.
 *
 * Composed here rather than in `data/`, which may hold no logic, and rather than inside
 * `simulateBattle`, which is handed a stage and should not have to know where on the ladder it
 * sits. `ui/` builds the resolved ladder once at module scope and the balance sweep does the
 * same, so this runs a hundred times a session rather than once a battle.
 */
export function resolveStage(
  encounter: StageEncounterData,
  index: number,
  kind: StageKind,
  curve: StageRewardCurveData,
): StageData {
  const payout = stagePayout(curve, index, kind);
  return {
    ...encounter,
    kind,
    reward: payout.reward,
    rates: payout.rates,
    firstClearSummons: payout.firstClearSummons,
  };
}

/** The whole authored ladder, flattened and resolved, in the order it is climbed. */
export function resolveLadder(
  chapters: readonly ChapterData[],
  chapterCurve: ChapterCurveData,
  rewardCurve: StageRewardCurveData,
): readonly StageData[] {
  const resolved: StageData[] = [];
  for (const chapter of chapters) {
    for (const [offset, encounter] of chapter.stages.entries()) {
      const kind = stageKindAt(chapterCurve, chapter.stages.length, offset + 1);
      resolved.push(resolveStage(encounter, resolved.length + 1, kind, rewardCurve));
    }
  }
  return resolved;
}

/** The shape of an authored ladder, which is all `core/` ever needs of it. */
export function ladderShape(chapters: readonly ChapterData[]): LadderShape {
  return { chapters: chapters.map((chapter) => chapter.stages.length) };
}
