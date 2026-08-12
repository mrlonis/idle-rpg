// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type ChapterData,
  cumulativeLevelCost,
  type GrowthData,
  ladderShape,
  type LevelCurveData,
  levelCapFor,
  levelCost,
  MAX_RARITY_INDEX,
  RARITIES,
  stagePayout,
  type StageRewardCurveData,
  totalStages,
  ZERO,
} from '../core';
import { CHAPTERS, STAGE_REWARDS } from './chapters';
import { GROWTH, LEVEL_CURVE } from './levels';

const curve: LevelCurveData = LEVEL_CURVE;
const growth: GrowthData = GROWTH;
const chapters: readonly ChapterData[] = CHAPTERS;
const rewards: StageRewardCurveData = STAGE_REWARDS;

/**
 * The rates the top of the shipped ladder pays, **evaluated from `chapters.ts` rather than
 * retyped here.**
 *
 * The level curve is tuned against these, so every time-to-afford assertion below is really an
 * assertion about the two files agreeing. Copying the numbers across would have made that
 * agreement a comment: adding a chapter with higher rates would leave this spec measuring against
 * the old top forever, passing happily while the real time-to-max quietly collapsed. Deriving
 * them means new content re-runs all of it, and a curve that no longer fits the economy fails
 * here with the real hours in the message.
 *
 * Since milestone 11 income is a function rather than a table, so this goes through `stagePayout`
 * at the last stage of the ladder — which is the same derivation the game itself does, rather
 * than a second implementation of it.
 */
const top = stagePayout(rewards, totalStages(ladderShape(chapters))).rates;
const RATES = {
  gold: Number(top.gold),
  xp: Number(top.xp),
  essence: Number(top.essence),
};

/** Hours of idle income at the top of the ladder to take one character from 1 to `level`. */
function hoursTo(level: number): { gold: number; xp: number; essence: number } {
  const total = cumulativeLevelCost(curve, 1, level);
  return {
    gold: (total.gold ?? ZERO).toNumber() / RATES.gold / 3600,
    xp: (total.xp ?? ZERO).toNumber() / RATES.xp / 3600,
    essence: (total.essence ?? ZERO).toNumber() / RATES.essence / 3600,
  };
}

describe('level caps', () => {
  it('has one cap per rung of the ladder', () => {
    expect(curve.caps).toHaveLength(RARITIES.length);
  });

  it('rises strictly with rarity', () => {
    for (let rarity = 1; rarity <= MAX_RARITY_INDEX; rarity++) {
      expect(curve.caps[rarity], RARITIES[rarity]).toBeGreaterThan(curve.caps[rarity - 1]);
    }
  });

  it('reaches the ceiling exactly at Ascended★5', () => {
    expect(levelCapFor(curve, MAX_RARITY_INDEX)).toBe(curve.maxLevel);
    expect(curve.maxLevel).toBe(1000);
  });

  it('lands every cap on a breakthrough level', () => {
    // So an ascension puts a character directly in front of an essence gate rather than stranded
    // between two.
    for (const cap of curve.caps) {
      expect(cap % curve.essence.every, String(cap)).toBe(0);
    }
  });

  it('front-loads the headroom, because the early rungs are the ones players climb', () => {
    const firstFive = curve.caps[4] - curve.caps[0];
    const lastFive = curve.caps[13] - curve.caps[9];

    expect(firstFive).toBeLessThan(lastFive);
  });
});

describe('the cost curve', () => {
  it('charges gold and XP on every level below the ceiling', () => {
    for (const level of [1, 2, 50, 240, 999]) {
      const cost = levelCost(curve, level);

      expect(cost.gold?.gt(ZERO), `level ${level}`).toBe(true);
      expect(cost.xp?.gt(ZERO), `level ${level}`).toBe(true);
    }
  });

  it('charges essence only every tenth level', () => {
    for (let level = 1; level < 60; level++) {
      const charged = levelCost(curve, level).essence !== undefined;

      expect(charged, `level ${level} → ${level + 1}`).toBe((level + 1) % 10 === 0);
    }
  });

  it('starts cheap enough that the first few levels are immediate', () => {
    const first = levelCost(curve, 1);

    expect(first.gold?.toNumber()).toBeLessThan(50);
    expect(first.xp?.toNumber()).toBeLessThan(50);
  });
});

describe('where the curve lands, in hours of idle income', () => {
  it('keeps all three currencies relevant rather than letting one dominate', () => {
    // The design target: no currency is decorative. Through the levels a player actually spends
    // their time in, all three should sit within roughly a third of each other.
    const at140 = hoursTo(140);
    const times = [at140.gold, at140.xp, at140.essence];

    expect(Math.max(...times) / Math.min(...times)).toBeLessThan(1.5);
  });

  it('makes essence the bottleneck late, and not before', () => {
    // Cheapest of the three before level 60 and the most expensive by 200. It bites without ever
    // being the thing that blocks a new player.
    const early = hoursTo(40);
    const late = hoursTo(200);

    expect(early.essence).toBeLessThan(early.gold);
    expect(late.essence).toBeGreaterThan(late.gold);
    expect(late.essence).toBeGreaterThan(late.xp);
  });

  it('keeps gold the most comfortable of the three, since gear will spend it later', () => {
    const at200 = hoursTo(200);

    expect(at200.gold).toBeLessThan(at200.xp);
  });

  it('puts the first ascension cap within a session', () => {
    // Level 40 is the Rare cap. Measured at the top of the ladder, so this is the common case —
    // a character pulled once income is established and brought up to its first ascension —
    // rather than a brand-new run, which reaches it more slowly because its rates are lower.
    const at40 = hoursTo(40);

    expect(Math.max(at40.gold, at40.xp, at40.essence)).toBeLessThan(6);
  });

  it('leaves rungs unspent above everything the ladder asks for', () => {
    // **"The ceiling stays aspirational", stated in the currency the game actually progresses in.**
    // Hours inflate with income and rungs do not: there are sixteen of them, the ladder asks for one
    // roughly every fifty stages, and what an aspirational ceiling means concretely is that a player
    // who has finished the shipped content still has ascensions in front of them.
    //
    // Four rungs of headroom rather than one, because the last rungs hand out a hundred levels each
    // — a ladder whose top stage sat inside the final rung's band would be asking for the last
    // ascension in the game, and there would be nothing left for the chapters after it to want.
    // Derived from `caps`, so adding or repricing a rung moves it.
    //
    // ## ⚠️ This is the sole owner of that claim since milestone 21d, and two guards were retired
    // into it
    //
    // Both of them measured the same thing in units that decay as content ships, and both had
    // already been re-derived once each:
    //
    // - **`hoursTo(1000).gold > 500`**, retired in milestone 17. Income at the top of the ladder
    //   rises with every chapter *by design*, so hours-to-the-ceiling shrinks forever — 1,175 → 588
    //   → 372 — and would have reached a weekend around chapter twelve with nothing whatsoever
    //   wrong. It was replaced by a **ratio** of that figure to what the top stage demands, which
    //   income cancels out of.
    // - **That ratio**, retired here. It is *also* meant to fall — its own comment said so, and set
    //   its floor to 4 covering four chapters at once — and at chapter 10 it reads **3.62**. The
    //   question its comment said to ask when it fired was "has the ladder come far enough to have
    //   earned the distance it has closed", which is not a question a threshold can answer: the
    //   quantity it measures falls whether the answer is yes or no.
    // - **`chapters.spec.ts`'s `top < maxLevel / 2`**, retired in the same session for the same
    //   reason and with the same conclusion — see that file.
    //
    // ⚠️ **What replaces them is nothing, deliberately.** The two failure modes they were meant to
    // catch are both still covered: a flattened curve or inflated rates fire the floor of "charges
    // real time" below, and content whose level demands run away fire *this* — which cannot decay,
    // because the rung count is fixed however long the ladder gets.
    //
    // ⚠️ **What 21d measured while doing it**: the level line adds about ninety levels a chapter
    // now, so this assertion fires at **chapter 12** and the curve is consumed entirely around
    // chapter 15 — not the chapter 100 the old prose assumed, which was written before 21a's
    // corrected margin rule made the line superlinear. When it fires, the honest question is how
    // long the campaign is meant to be, and the answer is a roadmap decision rather than a number
    // that goes here.
    const topLevel = chapters.at(-1)?.stages.at(-1)?.level ?? 0;
    const headroom = curve.caps[curve.caps.length - 4];

    expect(topLevel).toBeGreaterThan(0);
    expect(topLevel).toBeLessThan(headroom);
  });

  it('charges real time for the level the top of the ladder asks for', () => {
    // The half of the old assertion that was genuinely about income, kept and made
    // content-relative. A stage is tuned for a party standing level with it, so the last stage of
    // the ladder is a statement about how much levelling the content demands — and what that
    // demand costs in hours is the honest measure of whether the rates and the curve still fit
    // each other.
    //
    // Two-sided on purpose. Under an hour and the levelling curve has stopped being a progression
    // system at the top of the ladder; over a day of unbroken idle income for one character and it
    // has become the wall rather than the content. Raising the reward exponent without touching
    // the curve fires the floor here, which is the failure the absolute-hours version used to
    // catch before a growing ladder drowned it out.
    const topLevel = chapters.at(-1)?.stages.at(-1)?.level ?? 0;
    const demanded = hoursTo(topLevel);
    const worst = Math.max(demanded.gold, demanded.xp, demanded.essence);

    expect(worst).toBeGreaterThan(1);
    expect(worst).toBeLessThan(24);
  });
});

describe('growth', () => {
  it('orders the tiers common < legendary < ascended', () => {
    expect(growth.perLevel.legendary).toBeGreaterThan(growth.perLevel.common);
    expect(growth.perLevel.ascended).toBeGreaterThan(growth.perLevel.legendary);
  });

  it('never shrinks a character', () => {
    expect(growth.perLevel.common).toBeGreaterThanOrEqual(1);
    expect(growth.perAscension).toBeGreaterThanOrEqual(1);
  });

  it('keeps the per-level rates close enough that early tiers stay competitive', () => {
    // About a third of a percentage point apart. It looks like nothing, and compounded across a
    // thousand levels it is the entire design.
    expect(growth.perLevel.ascended - growth.perLevel.common).toBeLessThan(0.01);
  });

  it('compounds to roughly a billion across the level range', () => {
    // Milestone 10's headline number, and the one every other quantity in the game is sized
    // against — `battle/types.ts` reasons about health bars at this scale when it argues that
    // energy gains have to be flat points rather than a share of damage. Three orders of magnitude
    // was the old curve, and it is a gentle slope rather than an incremental game.
    const atCap = Math.pow(growth.perLevel.common, curve.maxLevel - 1);

    expect(atCap).toBeGreaterThan(1e8);
    expect(atCap).toBeLessThan(1e10);
  });

  it('preserves the tier fall-off the rescale could have quietly destroyed', () => {
    // ⚠️ The decision milestone 10 had to make on purpose. Multiplying each tier's *multiplier* by
    // a common factor leaves this ratio where milestone 3 put it; multiplying each tier's
    // *exponent* by a common factor looks like the same change and raises 19 to the power 2.8.
    // That would make a common-tier character three thousand times behind at the cap rather than
    // nineteen — a retune of "amazing early, falls off later" arriving as a side effect.
    const common = Math.pow(growth.perLevel.common, curve.maxLevel - 1);
    const ascended = Math.pow(growth.perLevel.ascended, curve.maxLevel - 1);

    expect(ascended / common).toBeGreaterThan(10);
    expect(ascended / common).toBeLessThan(40);
  });

  it('leaves ascension worth more than a garnish against it', () => {
    // The other half of the same decision. Duplicates are this game's primary ascension path, so a
    // rung ladder worth ×4 against a levelling path worth ×10⁹ would make the gacha decoration —
    // milestone 10's words. Measured across the full ladder rather than per rung, because per rung
    // the number is small enough to look harmless.
    const ladder = Math.pow(growth.perAscension, MAX_RARITY_INDEX);

    expect(ladder).toBeGreaterThan(100);
  });
});
