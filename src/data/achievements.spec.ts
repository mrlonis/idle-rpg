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

/** What the whole shipped ladder pays a track, derived rather than restated. */
function awardsOverLadder(track: AchievementTrackData): number {
  return Math.floor(LADDER.length / track.every);
}

const CLIMBER = tracks.find((track) => track.id === 'stages-cleared');

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

  it('tops the ladder up by a useful fraction without becoming a second income curve', () => {
    // ⚠️ **Derived from the ladder, so adding a chapter re-runs it rather than leaving this
    // measuring the old one.** The bounds are the design statement: large enough that a player
    // notices, small enough that first clears stay the reason to climb. If a future chapter pushes
    // this out of range the answer is to retune deliberately, not to move the threshold.
    if (CLIMBER === undefined) {
      throw new Error('the stage-clear track is not shipped');
    }
    const fromTrack = awardsOverLadder(CLIMBER) * (CLIMBER.reward.summons ?? 0);
    const fromFirstClears = LADDER.reduce(
      (sum, stage) => sum + Number(stage.firstClearSummons ?? 0),
      0,
    );

    expect(fromTrack / fromFirstClears).toBeGreaterThan(0.03);
    expect(fromTrack / fromFirstClears).toBeLessThan(0.2);
  });

  it('pays the shipped ladder a meaningful number of pulls', () => {
    if (CLIMBER === undefined) {
      throw new Error('the stage-clear track is not shipped');
    }
    const pulls = (awardsOverLadder(CLIMBER) * (CLIMBER.reward.summons ?? 0)) / PULL_COST;

    expect(pulls).toBeGreaterThanOrEqual(10);
  });

  it('is flat rather than scaling, so it is worth most when a run has fewest crystals', () => {
    // ⚠️ The first-clear payout is already linear in the stage index. A track that also scaled
    // would be that curve counted twice, and would help least exactly where help is needed.
    expect(CLIMBER?.reward.summons).toBe(250);
  });
});
