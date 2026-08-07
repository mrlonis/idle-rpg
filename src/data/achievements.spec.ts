// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type AchievementTrackData,
  type ChapterCurveData,
  type ChapterData,
  resolveLadder,
  type StageData,
  type StageRewardCurveData,
} from '../core';
import { ACHIEVEMENTS } from './achievements';
import { PULL_COST } from './banners';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';

/**
 * Conformance through a typed local, because `data/` may not import `core/`.
 *
 * That assignment is what turns a track naming a counter nothing keeps, or an interval of the
 * wrong type, into a compile error rather than content that silently never pays.
 */
const tracks: readonly AchievementTrackData[] = ACHIEVEMENTS;
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;
const LADDER: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);

/** Where the starter party stops — the stage-7 healer lock. */
const WALL = LADDER.findIndex((stage) => stage.id === 'c1-s7');

/**
 * How many awards the whole shipped ladder pays a track, derived rather than restated.
 *
 * Throws on a counter it has not been taught, which is deliberate: a track added on `battleCount`
 * would otherwise be measured against stage clears and quietly report a number that means nothing.
 */
function awardsOverLadder(track: AchievementTrackData): number {
  switch (track.counter) {
    case 'clearedStages':
      return Math.floor(LADDER.length / track.every);
    case 'clearedChapters':
      return Math.floor(chapters.length / track.every);
    default:
      throw new Error(`no ladder measure for the ${track.counter} counter`);
  }
}

/** What a track pays over the shipped ladder, in crystals. */
function crystalsOverLadder(track: AchievementTrackData): number {
  return awardsOverLadder(track) * (track.reward.summons ?? 0);
}

/** What every track together pays over the shipped ladder, in crystals. */
const FROM_TRACKS = tracks.reduce((sum, track) => sum + crystalsOverLadder(track), 0);

/** What the ladder's own first clears pay over the same stretch. */
const FROM_FIRST_CLEARS = LADDER.reduce(
  (sum, stage) => sum + Number(stage.firstClearSummons ?? 0),
  0,
);

const CLIMBER = tracks.find((track) => track.id === 'stages-cleared');
const CONQUEROR = tracks.find((track) => track.id === 'chapters-cleared');

describe('achievement tracks', () => {
  it('ships at least one track, and gives every one a unique id', () => {
    const ids = tracks.map((track) => track.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('authors every track with a usable interval and a reward that is worth something', () => {
    for (const track of tracks) {
      expect(Number.isInteger(track.every), track.id).toBe(true);
      expect(track.every, track.id).toBeGreaterThan(0);

      const amounts = Object.values(track.reward);
      expect(amounts.length, track.id).toBeGreaterThan(0);
      for (const amount of amounts) {
        expect(amount, track.id).toBeGreaterThan(0);
      }
    }
  });

  it('names every track and says what it is for', () => {
    // The screen has nothing else to show. A track with an empty description is a row that reads
    // as a bug rather than as a reward.
    for (const track of tracks) {
      expect(track.name.length, track.id).toBeGreaterThan(0);
      expect(track.description.length, track.id).toBeGreaterThan(0);
    }
  });

  it('prices every award as a whole number of pulls', () => {
    // A pull is a flat `PULL_COST` forever, so an award that is 2.5 of them is a number the player
    // has to do arithmetic on. This is the legibility argument `PULL_COST` itself is priced for.
    for (const track of tracks) {
      expect((track.reward.summons ?? 0) % PULL_COST, track.id).toBe(0);
    }
  });
});

describe('the stage-clear track', () => {
  it('is shipped', () => {
    expect(CLIMBER).toBeDefined();
  });

  it('lands its first award inside the opening run, before the healer lock', () => {
    // ⚠️ The screen has to have something on it the first time a player finds it. The stage-7
    // lock is where the starter party stops, so an interval that outran it would make this a
    // promise rather than a reward — and the first award is exactly when a run is shortest of
    // crystals.
    expect(CLIMBER?.every).toBeLessThan(7);
  });
});

describe('the chapter-clear track', () => {
  it('is shipped, and pays for every chapter rather than every nth one', () => {
    expect(CONQUEROR).toBeDefined();
    expect(CONQUEROR?.every).toBe(1);
  });

  it('counts chapters rather than a fixed number of stages', () => {
    // ⚠️ **The assertion that keeps this correct past chapter 10.** A chapter is `baseStages` long
    // through the first band and `stepStages` longer in each one after, so a track authored as an
    // interval over `clearedStages` would be right only for the band it was written in and then
    // pay a "chapter" award part way into the next chapter, forever. Counting chapters is right at
    // every size; `core/achievements.spec.ts` proves the counter follows the boundary.
    expect(CONQUEROR?.counter).toBe('clearedChapters');
    expect(CHAPTER_CURVE.stepStages).toBeGreaterThan(0);
  });

  it('is the largest single payout in the game', () => {
    // A chapter is fifty fights and its award is the ladder's punctuation. If a stage ever paid
    // more on its own, finishing a chapter would be an anticlimax on the fight that ends it.
    const biggestStage = Math.max(
      ...LADDER.map((stage) => Number(stage.firstClearSummons ?? 0)),
      ...(CLIMBER === undefined ? [] : [CLIMBER.reward.summons ?? 0]),
    );

    expect(CONQUEROR?.reward.summons ?? 0).toBeGreaterThan(biggestStage);
  });
});

describe('the crystal economy the tracks are half of', () => {
  it('pays achievements and first clears within a factor of two of each other', () => {
    // ⚠️ **This bound replaces one that read "a top-up of roughly 8%", and replacing it was the
    // point rather than a threshold being moved to go green.** Flattening the first-clear payout
    // to 250 a stage cut that side by more than
    // half, and the tracks are where it came back — so achievements are now a peer of climbing
    // rather than a garnish on it. Retuning either side alone is what this catches: a change that
    // moves one and not the other lands outside the band.
    const ratio = FROM_TRACKS / FROM_FIRST_CLEARS;

    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(2);
  });

  it('keeps the whole ladder worth a sane number of pulls', () => {
    // ⚠️ Derived from the ladder, so adding a chapter re-runs it rather than leaving this
    // measuring the old one. The band is the pacing statement for everything a *clear* pays; the
    // idle rate is `SUMMON_RATE` and is measured in `banners.spec.ts`. If a future chapter pushes
    // this out of range the answer is to retune deliberately, not to move the threshold.
    const pulls = (FROM_TRACKS + FROM_FIRST_CLEARS) / PULL_COST;

    expect(pulls).toBeGreaterThan(500);
    expect(pulls).toBeLessThan(900);
  });

  it('banks enough before the healer lock to fill the empty formation slots', () => {
    // ⚠️ A run starts with three characters in five slots and stalls at stage 7. The crystals
    // banked before that point are the intended answer, and since the flattening the *track* is
    // most of them — which is the whole argument for a flat award over a scaling one. Counted
    // across both faucets, because a player does not care which one paid.
    if (CLIMBER === undefined) {
      throw new Error('the stage-clear track is not shipped');
    }
    const fromStages = LADDER.slice(0, WALL).reduce(
      (sum, stage) => sum + Number(stage.firstClearSummons ?? 0),
      0,
    );
    const fromTrack = Math.floor(WALL / CLIMBER.every) * (CLIMBER.reward.summons ?? 0);

    expect((fromStages + fromTrack) / PULL_COST).toBeGreaterThanOrEqual(20);
  });
});
