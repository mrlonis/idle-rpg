// @vitest-environment node
// The ladder's *shape*: chapters, ids, ranks, levels and the boss rhythm. Fast, structural, and
// derived from the content rather than retyped out of it.
//
// **The simulated sweeps live in [`chapters.balance.ts`](./chapters.balance.ts)**, in the separate
// balance project `AGENTS.md` describes. They moved there when milestone 7 doubled the ladder and
// added a third reference party, and milestone 11 quadrupled it again — a hundred and fifty stages
// across twelve parties at forty seeds is tens of thousands of battles, and the rule is to move the
// sweep rather than shrink the sample.
import { describe, expect, it } from 'vitest';
import {
  BACK_ROW_SIZE,
  type ChapterCurveData,
  type ChapterData,
  chapterSize,
  FRONT_ROW_SIZE,
  ladderShape,
  resolveLadder,
  type StageData,
  type StageRewardCurveData,
  totalStages,
} from '../core';
import { AUTO_BATTLE_UNLOCK_CHAPTERS, CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { BRAN, MIRA, RIN, STARTER_FORMATION } from './characters';
import { ENEMIES } from './enemies';
import { LEVEL_CURVE } from './levels';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `ChapterData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;

/** The whole ladder, flattened and resolved exactly as the game resolves it. */
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);

/** Where the starter party is expected to stop: the healer lock. */
const WALL = stages.findIndex((stage) => stage.id === 'c1-s7');

describe('chapters', () => {
  it('ships more than one, with unique ids and names', () => {
    // More than one is not padding: the chapter boundary — income continuity across it, the boss
    // behind it, a position that has to roll over — is the whole of what milestone 11 built, and a
    // single chapter would exercise none of it.
    expect(chapters.length).toBeGreaterThan(1);
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(chapters.length);
    expect(new Set(chapters.map((chapter) => chapter.name)).size).toBe(chapters.length);
  });

  it('authors each chapter at exactly the length the curve says', () => {
    // The formula and the content are two statements of the same fact, and this is what keeps them
    // one fact. A chapter authored at forty-nine stages is a failing test rather than a boss that
    // quietly lands on the wrong square and a mini-boss that never fires.
    for (const [index, chapter] of chapters.entries()) {
      expect(chapter.stages.length, chapter.id).toBe(chapterSize(chapterCurve, index + 1));
    }
  });

  it('agrees with the ladder shape the simulation is handed', () => {
    expect(totalStages(ladderShape(chapters))).toBe(stages.length);
  });
});

describe('stage content', () => {
  it('authors a non-empty ladder with unique ids', () => {
    expect(stages.length).toBeGreaterThan(0);
    expect(new Set(stages.map((stage) => stage.id)).size).toBe(stages.length);
  });

  it('gives every stage at least one enemy and a name', () => {
    for (const stage of stages) {
      expect(stage.enemies.front.length + stage.enemies.back.length, stage.id).toBeGreaterThan(0);
      expect(stage.name.length, stage.id).toBeGreaterThan(0);
    }
  });

  it('names every stage distinctly, so no two are the same place', () => {
    expect(new Set(stages.map((stage) => stage.name)).size).toBe(stages.length);
  });

  it('fields enemies within the same rank sizes the player has', () => {
    // Not a rule the simulation enforces — it will happily field six enemies in one rank — but a
    // stage that outnumbered the player's own front row would be asking a question about numbers
    // rather than about composition, which is the one thing this ladder is not for.
    for (const stage of stages) {
      expect(stage.enemies.front.length, stage.id).toBeLessThanOrEqual(FRONT_ROW_SIZE);
      expect(stage.enemies.back.length, stage.id).toBeLessThanOrEqual(BACK_ROW_SIZE);
    }
  });

  it('gives every enemy a faction, so the matchup matrix is never decoration', () => {
    for (const stage of stages) {
      for (const enemy of [...stage.enemies.front, ...stage.enemies.back]) {
        expect(enemy.faction, `${stage.id}/${enemy.id}`).toBeTruthy();
      }
    }
  });

  it('spreads the ladder across more than one enemy faction', () => {
    // A ladder of nothing but Monsters would make the four mortal factions that beat Monsters
    // strictly correct and the rest of the matrix pointless.
    const factions = new Set(
      stages.flatMap((stage) =>
        [...stage.enemies.front, ...stage.enemies.back].map((enemy) => enemy.faction),
      ),
    );

    expect(factions.size).toBeGreaterThanOrEqual(4);
  });

  it('gives every archetype a growth tier', () => {
    // Conformance is a compile-time matter — `EnemyData` requires it and the typed local above is
    // what enforces that — so what this checks is the part the type cannot: that the ladder uses
    // more than one slope. A ladder of nothing but `common` archetypes would make the tier a
    // field rather than a decision, and a boss would never pull away from its escort.
    const tiers = new Set(ENEMIES.map((enemy) => enemy.tier));

    expect(tiers.size).toBeGreaterThan(1);
  });

  // ⚠️ **"Fields every archetype it ships" moved to [`enemies.spec.ts`](./enemies.spec.ts) in
  // milestone 15c**, and the rule was widened rather than relaxed. It used to read the campaign
  // alone because the campaign was the only content; eighteen of the forty-two blocks are now
  // authored for the towers and would have failed it as orphans. What the rule protects — an
  // archetype nobody ever meets is a stat block with a comment attached — is unchanged, and it
  // needs a file that can see every shipped ladder rather than this one, which is about chapters.
});

describe('the boss rhythm', () => {
  const ofKind = (kind: StageData['kind']): readonly StageData[] =>
    stages.filter((stage) => stage.kind === kind);

  it('closes every chapter with a boss and nothing else', () => {
    expect(ofKind('boss')).toHaveLength(chapters.length);
  });

  it('puts a mini-boss on every tenth stage of a chapter', () => {
    // Every tenth stage lands on the interval, and each chapter's last stage is a boss rather
    // than one more mini-boss — which is why the chapter count comes off the total. In the
    // ten-stage chapter 1 that leaves no mini-boss at all: stage 10 is both on the interval and
    // last, and last wins.
    const onTheInterval = chapters.reduce(
      (sum, chapter) =>
        sum +
        chapter.stages.filter((_, index) => (index + 1) % chapterCurve.miniBossEvery === 0).length,
      0,
    );

    expect(ofKind('mini-boss')).toHaveLength(onTheInterval - chapters.length);
  });

  it('fields a full board on every chapter boss', () => {
    // The authoring rule the rhythm asks for. A chapter's last stage is the one encounter a player
    // will remember, and a boss standing alone with one escort is a stage number rather than a
    // boss. Both ranks full is the shape, and it is checkable where "feels climactic" is not.
    for (const stage of ofKind('boss')) {
      expect(stage.enemies.front.length, stage.id).toBe(FRONT_ROW_SIZE);
      expect(stage.enemies.back.length, stage.id).toBe(BACK_ROW_SIZE);
    }
  });

  it('gives a chapter boss an ascended-tier body to build the fight around', () => {
    // Tier is the growth slope rather than a difficulty rating, so this is not "the boss has
    // bigger numbers" — it is that the thing at the head of a chapter pulls away from its escort
    // as the ladder climbs, instead of the two keeping a fixed distance forever.
    for (const stage of ofKind('boss')) {
      const tiers = [...stage.enemies.front, ...stage.enemies.back].map((enemy) => enemy.tier);

      expect(tiers, stage.id).toContain('ascended');
    }
  });

  it('gives every mini-boss at least four bodies and something above fodder', () => {
    for (const stage of ofKind('mini-boss')) {
      const fielded = [...stage.enemies.front, ...stage.enemies.back];

      expect(fielded.length, stage.id).toBeGreaterThanOrEqual(4);
      expect(
        fielded.some((enemy) => enemy.tier !== 'common'),
        stage.id,
      ).toBe(true);
    }
  });

  it('makes a boss worth stopping for in crystals', () => {
    // The one place the rhythm pays. It is deliberately crystals rather than gold: the lump is
    // pinned to forty seconds of the income the stage unlocks, so paying a boss more there would
    // have to come out of the income curve instead.
    for (const stage of ofKind('boss')) {
      const ordinary = stages[stages.indexOf(stage) - 1];

      expect(Number(stage.firstClearSummons), stage.id).toBeGreaterThan(
        Number(ordinary.firstClearSummons) * 2,
      );
    }
  });
});

describe('the level curve', () => {
  it('never fields an encounter at a lower level than the stage below it', () => {
    // Since milestone 10 the level is the ladder's difficulty dial, so a level that stepped back
    // is a stage that asks less than the one blocking the player. Non-decreasing rather than
    // strictly increasing on purpose: two consecutive stages at the same level, with the second
    // fielding a harder line-up, is a legitimate thing to author and the ladder does it often.
    const levels = stages.map((stage) => stage.level);

    expect(levels[0]).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i], stages[i].id).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  });

  it('opens at the level the party that fights it is actually on', () => {
    // The bottom of the ladder is climbed by three level-1 starters, so the enemies there are
    // level-1 too. This is what stops the opening stages being quietly rescaled by a dial that
    // did not exist when they were tuned — and it is why the archetype blocks in `enemies.ts` are
    // authored at level 1 rather than at some notional mid-ladder baseline.
    expect(stages[0].level).toBe(1);
    expect(stages[WALL - 1].level).toBeLessThan(10);
  });

  it('steps hard enough at the healer lock to make it a wall', () => {
    // ⚠️ Measured rather than chosen: the starting three take the Marsh Shrine reliably at enemy
    // level 6, most of the time at 8, and never from 14 up. The lock is a question about *who* is
    // fighting, but a party has to be held at a level where the question is asked at all — below
    // this the encounter answers itself and the early game loses its only wall.
    expect(stages[WALL].level).toBeGreaterThanOrEqual(14);
  });

  it('climbs gradually once the tutorial is over', () => {
    // The chapter's own promise, and the difference between a chapter and the twelve-stage ladder
    // it grew out of: past the healer lock no single stage may be worth more than a few levels of
    // investment, so a wall is always a wall about composition rather than a cliff.
    for (let index = WALL + 1; index < stages.length; index++) {
      expect(stages[index].level - stages[index - 1].level, stages[index].id).toBeLessThanOrEqual(
        5,
      );
    }
  });

  it('carries the level across the chapter boundary rather than stepping at it', () => {
    // A chapter boundary is a name change and a boss behind you, not a difficulty step. A player
    // who has just taken a chapter boss walks into an encounter tuned for exactly the party that
    // took it.
    let index = 0;
    for (const chapter of chapters.slice(0, -1)) {
      index += chapter.stages.length;
      const before = stages[index - 1];
      const after = stages[index];

      expect(after.level, `${before.id} → ${after.id}`).toBe(before.level);
    }
  });

  it('asks for more level than a player gets without ascending', () => {
    // Derived from the rarity caps rather than written down. The ladder is tuned so the fen
    // chapters close at the cap a player reaches *without ascending* and chapter 4 closes at the
    // `rare` cap, which is a deliberate statement that the opening two thirds are a breeze and the
    // difficulty arrives with chapter 5. See `docs/milestones.md`.
    //
    // ## ⚠️ The ceiling half of this was **retired** in milestone 21d rather than moved
    //
    // It read `top < LEVEL_CURVE.maxLevel / 2` under the comment "two chapters must not consume the
    // curve" — written when the ladder was two chapters long and meaning something entirely
    // different by the time it was ten. Chapter 10 closes at 588 against that bound of 500, and
    // **no margin the level rule permits would have satisfied it**: the rule is that each chapter
    // must close further past its rung's cap than the last, `ascended` caps at 500, and a chapter
    // closing below its own rung's cap is the walkover 21a measured.
    //
    // The claim it was making is worth keeping and is made properly one file over:
    // `levels.spec.ts`'s **"leaves rungs unspent above everything the ladder asks for"** says the
    // same thing in the currency the game actually progresses in, and it does not decay — there are
    // sixteen rungs however long the ladder gets, where a fraction of `maxLevel` falls every
    // chapter by construction. Two guards on one quantity in two units is how they end up
    // disagreeing; this is the second guard in this project to be retired rather than slid, after
    // `levels.spec.ts`'s hours-to-the-ceiling.
    //
    // ⚠️ **What 21d measured, and did not write a guard for**: the level line now adds about ninety
    // levels a chapter, so the curve is consumed around chapter 15 rather than the chapter 100 the
    // old prose assumed. Nothing about that is wrong today and the rung claim fires first — at
    // chapter 12 — which is the point at which somebody has to decide how long the campaign is.
    const top = stages[stages.length - 1].level;
    const withoutAscending = LEVEL_CURVE.caps[0];

    expect(top, 'the ladder must ask for at least one ascension').toBeGreaterThan(withoutAscending);
  });
});

describe('what the ladder pays', () => {
  it('pays more for every stage further up the ladder', () => {
    const rewardGold = stages.map((stage) => Number(stage.reward.gold));

    for (let i = 1; i < rewardGold.length; i++) {
      expect(rewardGold[i], stages[i].id).toBeGreaterThan(rewardGold[i - 1]);
    }
  });

  it.each(['gold', 'xp', 'essence'] as const)(
    'raises the %s rate at every step, so no clear is ever a sidestep',
    (currency) => {
      // The rate is the real reward, and `applyBattleResult` only ever raises it. A stage
      // granting no more than the one before it would read to the player as a stage that paid
      // nothing — and that has to hold on every currency, not just the visible one.
      const rates = stages.map((stage) => Number(stage.rates[currency]));

      expect(rates[0]).toBeGreaterThan(0);
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i], stages[i].id).toBeGreaterThan(rates[i - 1]);
      }
    },
  );

  it('never authors a crystal rate per stage', () => {
    // Three rates, not four. The crystal rate is `SUMMON_RATE` in `banners.ts`, derived from the
    // clear count — a stage that also carried one would put a second mechanism on the same
    // number, and because `raiseRates` takes the larger of the two, whichever happened to be
    // bigger would silently win.
    for (const stage of stages) {
      expect(stage.rates.summons, stage.id).toBeUndefined();
    }
  });

  it('never pays summon crystals for a repeat clear', () => {
    // Crystals come from the idle rate and from first clears, and from nowhere else. A repeatable
    // crystal payout would make tap-farming the opening stage the fastest way to pull, and the
    // correct play in a game about climbing a ladder would be to never leave the bottom of it.
    for (const stage of stages) {
      expect(stage.reward.summons, stage.id).toBeUndefined();
    }
  });

  it('pays enough first-clear crystals below the wall to fill the empty formation slots', () => {
    // A run starts with three characters in five slots and stalls at the healer lock. The
    // crystals banked before that point are the intended answer, so they have to add up to more
    // than a token: two more characters is two pulls, and this is many times that.
    const beforeTheWall = stages
      .slice(0, WALL)
      .reduce((sum, stage) => sum + Number(stage.firstClearSummons ?? 0), 0);

    for (const stage of stages) {
      expect(Number(stage.firstClearSummons ?? 0), stage.id).toBeGreaterThan(0);
    }
    expect(beforeTheWall).toBeGreaterThanOrEqual(1000);
  });

  it('keeps the reward curve well inside float64, so the curve is not the reason for Decimal', () => {
    // AGENTS.md asks for this to be checked rather than assumed. A power law over the stage index
    // grows slowly enough that the top of a hundred-chapter ladder is still a five-figure number;
    // `Numeric` is demanded by the *levelling* curve, not by this one.
    for (const stage of stages) {
      expect(Number(stage.reward.gold), stage.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    }
  });
});

describe('where auto-battle unlocks', () => {
  // The unlock is a count of finished chapters since the re-cut, so the clears it costs are
  // derived from the shipped chapter sizes rather than retyped.
  const unlockClears = chapters
    .slice(0, AUTO_BATTLE_UNLOCK_CHAPTERS)
    .reduce((total, chapter) => total + chapter.stages.length, 0);

  it('asks for whole chapters the ladder actually ships', () => {
    expect(AUTO_BATTLE_UNLOCK_CHAPTERS).toBeGreaterThan(0);
    expect(AUTO_BATTLE_UNLOCK_CHAPTERS).toBeLessThanOrEqual(chapters.length);
  });

  it('leaves real content on the far side of it', () => {
    // Auto-battle is a prerequisite for the rest of the ladder rather than a reward for finishing
    // the game: a chapter tapped through one fight at a time is worse the longer it gets. If the
    // unlock ever drifted towards the end, the feature would arrive with nothing left to do.
    expect(stages.length - unlockClears).toBeGreaterThanOrEqual(stages.length / 3);
  });

  it('unlocks past the wall, so it is never the answer to being stuck', () => {
    // A loop that re-enters the stage a party keeps losing is a loop that loses over and over. It
    // has to arrive well after the point where the game stops being about levels.
    expect(unlockClears).toBeGreaterThan(WALL + 1);
  });

  it('keeps the by-hand stretch a single short chapter', () => {
    // The re-cut tied the unlock to a chapter boundary so it can move by whole chapters; what
    // must not happen silently is the boundary itself drifting far enough that "clear chapter 1
    // by hand" stops being a first session. Bounded rather than pinned so a deliberate resize of
    // chapter 1 does not need this edited — only a change worth arguing about does.
    expect(unlockClears).toBeLessThanOrEqual(15);
  });
});

describe('the starting formation', () => {
  it('fills the front rank and leaves room to grow', () => {
    // Three characters in five slots is the intended shape, not a shortfall: the two empty places
    // are what makes the first summon worth something.
    expect(STARTER_FORMATION.front).toHaveLength(FRONT_ROW_SIZE);
    expect(STARTER_FORMATION.back.length).toBeLessThan(BACK_ROW_SIZE);
  });

  it('names characters that exist, exactly once each', () => {
    const members = [...STARTER_FORMATION.front, ...STARTER_FORMATION.back];

    expect(new Set(members).size).toBe(members.length);
    for (const id of members) {
      expect([BRAN.id, MIRA.id, RIN.id], id).toContain(id);
    }
  });

  it('keeps its only back-line answer out of the front rank', () => {
    // Rin is the party's sole way of reaching an enemy back row, and she does not survive standing
    // where the attacks land. Putting her behind Bran and Mira is what makes the opening ladder
    // answerable at all.
    expect(STARTER_FORMATION.back).toContain(RIN.id);
  });
});
