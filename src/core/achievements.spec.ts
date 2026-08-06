// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  type AchievementTrackData,
  allProgress,
  claimAchievements,
  counterValue,
  emptyAchievements,
  parseAchievements,
  trackProgress,
  unclaimedReward,
} from './achievements';
import { type LadderShape } from './ladder';
import { type GameState, newGame } from './state';

const SEED = 0xc0ffee;
const T0 = 1_700_000_000_000;

/**
 * A ladder whose chapters are **not** all the same length.
 *
 * ⚠️ Deliberately uneven, and the third chapter is the whole point: the shipped ladder is two
 * fifty-stage chapters, so a fixture that copied it would let a chapter track authored as a fixed
 * fifty-stage interval pass every test here. Sixty is what chapter 11 is under `CHAPTER_CURVE`.
 */
const LADDER: LadderShape = { chapters: [50, 50, 60] };

/** The shipped track's shape, restated as a fixture so retuning `data/` cannot rewrite the tests. */
const CLIMBER: AchievementTrackData = {
  id: 'stages-cleared',
  name: 'Stage Climber',
  description: 'Crystals for every five stages cleared.',
  counter: 'clearedStages',
  every: 5,
  reward: { summons: 250 },
};

const CHAPTERS: AchievementTrackData = {
  id: 'chapters-cleared',
  name: 'Chapter Conqueror',
  description: 'Crystals for every chapter finished.',
  counter: 'clearedChapters',
  every: 1,
  reward: { summons: 10_000 },
};

const PULLS: AchievementTrackData = {
  id: 'pulls-made',
  name: 'Summoner',
  description: 'Gold for every ten pulls.',
  counter: 'pullCount',
  every: 10,
  reward: { gold: 100 },
};

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: SEED, nowMs: T0 }), ...overrides };
}

describe('trackProgress', () => {
  it('pays nothing before the first interval is complete', () => {
    const progress = trackProgress(CLIMBER, run({ clearedStages: 4 }), LADDER);

    expect(progress.earned).toBe(0);
    expect(progress.unclaimed).toBe(0);
    expect(progress.nextAt).toBe(5);
    expect(progress.fraction).toBeCloseTo(0.8);
  });

  it('earns one award per interval, and keeps earning past the end of the shipped ladder', () => {
    // The point of an endless rule over an authored list: this has to mean the same thing at five
    // clears and at five thousand, because the ladder is a hundred stages now and shaped for
    // thousands.
    expect(trackProgress(CLIMBER, run({ clearedStages: 5 }), LADDER).earned).toBe(1);
    expect(trackProgress(CLIMBER, run({ clearedStages: 63 }), LADDER).earned).toBe(12);
    expect(trackProgress(CLIMBER, run({ clearedStages: 50_000 }), LADDER).earned).toBe(10_000);
  });

  it('subtracts what has already been taken', () => {
    const progress = trackProgress(
      CLIMBER,
      run({ clearedStages: 63, achievements: { 'stages-cleared': 9 } }),
      LADDER,
    );

    expect(progress.earned).toBe(12);
    expect(progress.claimed).toBe(9);
    expect(progress.unclaimed).toBe(3);
  });

  it('clamps a ledger claiming more than the run has earned', () => {
    // ⚠️ Damage of this shape is the dangerous kind: left alone, an over-claimed ledger withholds
    // every *future* award silently rather than failing once and visibly.
    const progress = trackProgress(
      CLIMBER,
      run({ clearedStages: 10, achievements: { 'stages-cleared': 999 } }),
      LADDER,
    );

    expect(progress.claimed).toBe(2);
    expect(progress.unclaimed).toBe(0);
  });

  it('reads a damaged counter as nothing cleared rather than paying out on it', () => {
    expect(trackProgress(CLIMBER, run({ clearedStages: Number.NaN }), LADDER).earned).toBe(0);
    expect(trackProgress(CLIMBER, run({ clearedStages: -40 }), LADDER).earned).toBe(0);
  });

  it('survives a track authored with a zero interval', () => {
    // A division by zero here would report an infinite number of unclaimed awards, and the claim
    // below would then pay every one of them.
    const broken: AchievementTrackData = { ...CLIMBER, every: 0 };

    expect(trackProgress(broken, run({ clearedStages: 7 }), LADDER).earned).toBe(7);
    expect(
      Number.isFinite(trackProgress(broken, run({ clearedStages: 7 }), LADDER).unclaimed),
    ).toBe(true);
  });

  it('reports position as the plain total for every counter the run stores', () => {
    // ⚠️ `position` only ever differs from `total` on a derived counter with coarse units. This is
    // what says the chapter track landed without moving the bar on any track that predates it.
    for (const cleared of [0, 4, 63, 50_000]) {
      const progress = trackProgress(CLIMBER, run({ clearedStages: cleared }), LADDER);

      expect(progress.position, `${cleared} cleared`).toBe(progress.total);
    }
  });
});

describe('the clearedChapters counter', () => {
  const chapters = (clearedStages: number): number =>
    counterValue(run({ clearedStages }), 'clearedChapters', LADDER);

  it('counts a chapter only once every stage in it has fallen', () => {
    expect(chapters(0)).toBe(0);
    expect(chapters(49)).toBe(0);
    expect(chapters(50)).toBe(1);
    expect(chapters(99)).toBe(1);
    expect(chapters(100)).toBe(2);
  });

  it('follows the chapter boundary rather than a fixed number of stages', () => {
    // ⚠️ **The assertion this counter exists for.** Chapter 3 of the fixture is sixty stages, so a
    // track authored `every: 50` over `clearedStages` would hand over a third chapter's award at
    // 150 — ten stages before the chapter it is named for is finished. Chapter length is a band
    // function and the shipped fifty is only the first band's value.
    expect(chapters(150)).toBe(2);
    expect(chapters(159)).toBe(2);
    expect(chapters(160)).toBe(3);
    expect(Math.floor(150 / 50)).toBe(3);
  });

  it('stops at the top of the authored ladder rather than running away', () => {
    // Correct here, and the opposite of the rule for quests: an achievement that stops moving is
    // one the player has finished, and it starts again the day a chapter ships. A quest that
    // stopped moving would be permanently unfinishable.
    expect(chapters(160)).toBe(3);
    expect(chapters(5_000)).toBe(3);
  });

  it('reads a damaged clear count as nothing cleared', () => {
    expect(chapters(Number.NaN)).toBe(0);
    expect(chapters(-12)).toBe(0);
  });

  it('never credits a chapter that holds no stages', () => {
    // Malformed content — `chapters.spec.ts` is what stops it existing — but counting it would
    // hand over a chapter's award for clearing nothing at all.
    const gappy: LadderShape = { chapters: [50, 0, 50] };

    expect(counterValue(run({ clearedStages: 50 }), 'clearedChapters', gappy)).toBe(1);
    expect(counterValue(run({ clearedStages: 100 }), 'clearedChapters', gappy)).toBe(2);
  });

  it('reports an empty ladder as nothing to clear', () => {
    expect(counterValue(run({ clearedStages: 40 }), 'clearedChapters', { chapters: [] })).toBe(0);
  });
});

describe('a track counted in chapters', () => {
  it('earns one award per chapter finished', () => {
    expect(trackProgress(CHAPTERS, run({ clearedStages: 49 }), LADDER).earned).toBe(0);
    expect(trackProgress(CHAPTERS, run({ clearedStages: 50 }), LADDER).earned).toBe(1);
    expect(trackProgress(CHAPTERS, run({ clearedStages: 160 }), LADDER).earned).toBe(3);
  });

  it('moves its bar on every stage rather than once a chapter', () => {
    // ⚠️ The reason `position` and the sub-unit half of a counter reading exist. A chapter is
    // fifty fights, and a bar drawn from the whole count alone would sit at empty through all of
    // them and then jump — on the single largest reward in the game.
    const quarter = trackProgress(CHAPTERS, run({ clearedStages: 62 }), LADDER);

    expect(quarter.total).toBe(1);
    expect(quarter.position).toBeCloseTo(1.24);
    expect(quarter.fraction).toBeCloseTo(0.24);
    expect(quarter.nextAt).toBe(2);
  });

  it('scales the bar to the chapter it is actually in, not to the first one', () => {
    // Thirty stages into the sixty-stage third chapter is half way, where thirty into a
    // fifty-stage one would be three fifths. The denominator is the chapter, not a constant.
    const progress = trackProgress(CHAPTERS, run({ clearedStages: 130 }), LADDER);

    expect(progress.total).toBe(2);
    expect(progress.fraction).toBeCloseTo(0.5);
  });

  it('pays its award once, like every other track', () => {
    const before = run({ clearedStages: 100 });
    const first = claimAchievements(before, [CHAPTERS], LADDER);
    const second = claimAchievements(first.state, [CHAPTERS], LADDER);

    expect(first.awards).toBe(2);
    expect(first.gained.summons?.toString()).toBe('20000');
    expect(second.awards).toBe(0);
  });
});

describe('unclaimedReward', () => {
  it('multiplies the award by how many are owed', () => {
    const progress = trackProgress(CLIMBER, run({ clearedStages: 15 }), LADDER);

    expect(unclaimedReward(progress).summons?.toString()).toBe('750');
  });

  it('is empty when nothing is owed', () => {
    expect(unclaimedReward(trackProgress(CLIMBER, run({ clearedStages: 2 }), LADDER))).toEqual({});
  });
});

describe('claimAchievements', () => {
  it('credits the wallet and records what was taken', () => {
    const before = run({ clearedStages: 15 });
    const { state, gained, awards } = claimAchievements(before, [CLIMBER], LADDER);

    expect(awards).toBe(3);
    expect(gained.summons?.toString()).toBe('750');
    expect(state.wallet.summons.toString()).toBe('750');
    expect(state.achievements['stages-cleared']).toBe(3);
  });

  it('pays nothing the second time, which is what makes the ledger a ledger', () => {
    const first = claimAchievements(run({ clearedStages: 15 }), [CLIMBER], LADDER);
    const second = claimAchievements(first.state, [CLIMBER], LADDER);

    expect(second.awards).toBe(0);
    expect(second.state.wallet.summons.toString()).toBe('750');
  });

  it('returns the same state object when nothing was owed', () => {
    // ⚠️ `ui/` publishes what it is handed, so a fresh object would redraw every screen watching
    // the run in order to show it numbers it already had.
    const before = run({ clearedStages: 3 });

    expect(claimAchievements(before, [CLIMBER], LADDER).state).toBe(before);
  });

  it('claims every track in one pass, summing currencies that overlap', () => {
    const before = run({ clearedStages: 10, pullCount: 30 });
    const goldToo: AchievementTrackData = { ...PULLS, reward: { gold: 100, summons: 5 } };
    const { state, gained, awards } = claimAchievements(before, [CLIMBER, goldToo], LADDER);

    expect(awards).toBe(5);
    // 2 climber awards at 250 crystals, plus 3 pull awards at 5 crystals.
    expect(gained.summons?.toString()).toBe('515');
    expect(gained.gold?.toString()).toBe('300');
    expect(state.achievements).toEqual({ 'stages-cleared': 2, 'pulls-made': 3 });
  });

  it('leaves a track with nothing owed out of the ledger entirely', () => {
    const { state } = claimAchievements(
      run({ clearedStages: 10, pullCount: 4 }),
      [CLIMBER, PULLS],
      LADDER,
    );

    expect(state.achievements).toEqual({ 'stages-cleared': 2 });
  });

  it('writes an over-claimed ledger back down, so the damage costs one press and not the run', () => {
    // ⚠️ Without this the clamp in `trackProgress` would make the screen right and leave the save
    // wrong: the run would owe nothing until it genuinely passed 999 awards, withholding every
    // award in between and never saying why.
    const before = run({ clearedStages: 10, achievements: { 'stages-cleared': 999 } });
    const { state, awards, gained } = claimAchievements(before, [CLIMBER], LADDER);

    expect(awards).toBe(0);
    expect(gained).toEqual({});
    expect(state.wallet.summons.toString()).toBe('0');
    expect(state.achievements['stages-cleared']).toBe(2);

    const later = run({ clearedStages: 20, achievements: state.achievements });
    expect(trackProgress(CLIMBER, later, LADDER).unclaimed).toBe(2);
  });

  it('never spends anything, so claiming can be one press with no confirmation', () => {
    const before = run({ clearedStages: 15 });
    const { state } = claimAchievements(before, [CLIMBER], LADDER);

    expect(state.roster).toBe(before.roster);
    expect(state.wallet.gold.toString()).toBe(before.wallet.gold.toString());
    expect(state.clearedStages).toBe(before.clearedStages);
  });
});

describe('allProgress', () => {
  it('reports every track in the order they were authored', () => {
    const progress = allProgress(
      [CLIMBER, PULLS],
      run({ clearedStages: 5, pullCount: 10 }),
      LADDER,
    );

    expect(progress.map((entry) => entry.track.id)).toEqual(['stages-cleared', 'pulls-made']);
    expect(progress.every((entry) => entry.unclaimed === 1)).toBe(true);
  });
});

describe('parseAchievements', () => {
  const swallow = (): void => undefined;

  it('reads a healthy ledger through unchanged', () => {
    expect(parseAchievements({ 'stages-cleared': 9 }, swallow)).toEqual({ 'stages-cleared': 9 });
  });

  it('keeps a track id this build no longer ships', () => {
    // The opposite of how the roster treats an unknown character id, and deliberately so: dropping
    // the entry is what would re-pay every award on that track if it ever came back.
    expect(parseAchievements({ retired: 4 }, swallow)).toEqual({ retired: 4 });
  });

  it('drops an entry that is not a usable count, and says so', () => {
    const issues: string[] = [];
    const ledger = parseAchievements(
      { good: 3, negative: -1, text: 'nine', broken: Number.NaN },
      (field) => issues.push(field),
    );

    expect(ledger).toEqual({ good: 3 });
    expect(issues).toEqual(['achievements.negative', 'achievements.text', 'achievements.broken']);
  });

  it('reads a missing ledger as nothing claimed, without reporting it as damage', () => {
    // A v2 save has no such field, and a migrated one arrives with `{}`. Neither is an error.
    const issues: string[] = [];

    expect(parseAchievements(undefined, (field) => issues.push(field))).toEqual({});
    expect(issues).toEqual([]);
  });

  it('reports a ledger that is not an object at all', () => {
    const issues: string[] = [];

    expect(parseAchievements('nope', (field) => issues.push(field))).toEqual({});
    expect(issues).toEqual(['achievements']);
  });
});

describe('emptyAchievements', () => {
  it('starts a new run having claimed nothing', () => {
    expect(emptyAchievements()).toEqual({});
    expect(newGame({ seed: SEED, nowMs: T0 }).achievements).toEqual({});
  });
});
