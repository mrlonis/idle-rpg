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
import { maxSignatureLevel, signatureTotalCost } from '../core';
import { ACHIEVEMENTS } from './achievements';
import { PULL_COST } from './banners';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { SIGNATURE_ITEMS, SIGNATURE_RULES } from './signature';

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

/**
 * The tracks measured against the **campaign**, which is what every derived figure below is about.
 *
 * A tower's tracks are counted in floors, so they pay nothing for climbing the ladder and belong to
 * a different economy — the one [`towers.spec.ts`](./towers.spec.ts) measures, and which is bounded
 * as a multiple of this one. Folding them in here would read as the ladder's own tracks having
 * doubled, and the ratio below would then pass for a reason that has nothing to do with the ladder.
 *
 * ⚠️ **Named positively rather than as "not a tower track", which is what it was.** Milestone 16
 * added two tracks counted in signature levels — a third economy, neither ladder nor tower — and
 * the old filter swept them in here, where `awardsOverLadder` promptly threw. That throw is the
 * design working: a track measured against the wrong thing reports a number that means nothing, and
 * this file would rather stop than publish one. Listing the two counters this measurement is
 * actually about is what keeps a fourth economy failing loudly instead of being absorbed.
 */
const LADDER_TRACKS: readonly AchievementTrackData[] = tracks.filter(
  (track) => track.counter === 'clearedStages' || track.counter === 'clearedChapters',
);

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

/** What every campaign track together pays over the shipped ladder, in crystals. */
const FROM_TRACKS = LADDER_TRACKS.reduce((sum, track) => sum + crystalsOverLadder(track), 0);

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

  it('is the largest single payout the ladder has', () => {
    // A chapter is fifty fights and its award is the ladder's punctuation. If a stage ever paid
    // more on its own, finishing a chapter would be an anticlimax on the fight that ends it.
    //
    // **The ladder, not the game.** Topping a tower matches this exactly, which is deliberate — a
    // hundred floors and a fifty-stage chapter are comparable events — and `towers.spec.ts` holds
    // the tie so it stays a decision rather than a coincidence.
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

  it('keeps a stage of the ladder worth a sane number of pulls', () => {
    // ⚠️ **This was a band on the ladder's whole total (500–900 pulls) and milestone 17 made it a
    // rate, which is a different assertion rather than a widened one.** A third chapter took the
    // total to 1,035 and would have failed it — correctly, in the sense that the number moved, and
    // uselessly, in the sense that *every* chapter moves it: the ladder pays a flat 250 a stage and
    // a flat 1,000 per five clears, so the total is linear in the length by construction and a
    // fixed band on it is a cap on how much content may ship.
    //
    // What the band was actually protecting is the **pacing** — how much a player is handed for
    // each fight they win — and that is per stage. It is unchanged at 6.9 across all three
    // chapters, which is the strongest evidence available that this is the quantity that was meant
    // all along. A chapter authored more or less generously than the ones below it still fails
    // here; a chapter that is merely *another* chapter does not.
    //
    // The idle rate is `SUMMON_RATE` and is measured in `banners.spec.ts`.
    const pulls = (FROM_TRACKS + FROM_FIRST_CLEARS) / PULL_COST / LADDER.length;

    expect(pulls).toBeGreaterThan(5);
    expect(pulls).toBeLessThan(9);
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

describe('the emblem and signature tracks', () => {
  const SIGNATURE_TRACKS = tracks.filter((track) => track.counter === 'signatureLevels');

  it('pays emblems only where an emblem is already being paid for the same event', () => {
    // ⚠️ **The rule is not "one track" — it is that a track paying emblems must sit on an event
    // that already pays them.** Finishing a chapter steps the emblem idle rate, and finishing a
    // Descent pays `DESCENT_RULES.completionEmblems`; in both cases the lump is the same event
    // saying the same thing louder rather than a second mechanism on the tightest currency in the
    // game. A track anywhere else would be a faucet nobody accounted for — see `docs/economy.md`,
    // where the emblem sources are enumerated.
    //
    // ⚠️ **Emphatically not the two signature tracks**, which spend emblems: an emblem award there
    // is a partial refund that makes the last levels cheaper than the first.
    const paying = tracks.filter((track) => (track.reward.emblem ?? 0) > 0);

    expect(paying.map((track) => track.id)).toEqual(['chapters-cleared', 'descent-mastered']);
    for (const track of SIGNATURE_TRACKS) {
      expect(track.reward.emblem ?? 0, track.id).toBe(0);
    }
  });

  it('keeps the chapter track worth far less in emblems than a signature item costs', () => {
    // A chapter's lump must not skip the climb. Derived against the real cost rather than a
    // literal, so retuning `SIGNATURE_RULES.cost` moves this bound with it.
    const perChapter = CONQUEROR?.reward.emblem ?? 0;
    const toMax = signatureTotalCost(SIGNATURE_RULES, maxSignatureLevel(SIGNATURE_RULES));

    expect(perChapter).toBeGreaterThan(0);
    expect(perChapter).toBeLessThan(toMax / 5);
  });

  it('never pays emblems on a track measured in signature levels', () => {
    // ⚠️ An emblem award on an emblem-spending track is a partial refund: it would make the last
    // levels cheaper than the first and quietly flatten a cost curve `data/signature.ts` keeps
    // linear on purpose.
    for (const track of SIGNATURE_TRACKS) {
      expect(track.reward.emblem ?? 0, track.id).toBe(0);
    }
  });

  it('ships a signature track a run can actually finish', () => {
    // The ceiling is seven items at thirty levels. A track whose interval outran that would be a
    // row that can never pay, which is content that compiles and ships and does nothing.
    const ceiling = SIGNATURE_ITEMS.length * maxSignatureLevel(SIGNATURE_RULES);

    expect(SIGNATURE_TRACKS.length).toBeGreaterThan(0);
    for (const track of SIGNATURE_TRACKS) {
      expect(track.every, track.id).toBeLessThanOrEqual(ceiling);
    }
  });

  it('gives the signature tracks names of their own', () => {
    // ⚠️ Unlike the tower tracks, which share two names between fourteen of them and are
    // disambiguated by `AchievementsService`. These are one-of-a-kind, so a shared name would be
    // two headings and two progress bars carrying the same accessible name — a WCAG failure.
    const names = SIGNATURE_TRACKS.map((track) => track.name);

    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(tracks.filter((track) => track.name === name)).toHaveLength(1);
    }
  });
});
