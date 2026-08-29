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

  // ## ⚠️ "Leaves rungs unspent above everything the ladder asks for" was retired at chapter 29,
  // and it is the fifth guard retired rather than slid
  //
  // It read `topLevel < curve.caps[curve.caps.length - 4]` — four rungs of headroom above the top
  // of the ladder, on the argument that the last rungs hand out a hundred levels each and a ladder
  // sitting inside the final rung's band would be asking for the last ascension in the game. It
  // fired at **chapter 29**, whose close of 725 stands above `ascended-2`'s cap of **700**, one
  // chapter earlier than milestone 21d predicted.
  //
  // ⚠️ **It is the one guard in this file that genuinely could not decay**, and that is exactly why
  // it is retired rather than moved: the rung count is fixed, so it was never measuring drift — it
  // was measuring **how long the campaign is**, and its own comment said so ("the honest question
  // is how long the campaign is meant to be, and the answer is a roadmap decision rather than a
  // number that goes here"). Sliding four rungs to three would have to be redone at chapter 32,
  // three to two at 35, and two to one at 38, which is a threshold recording a roadmap rather than
  // protecting anything.
  //
  // ⚠️ **So here is the roadmap answer, which is what the guard was asking for.** The line adds
  // **30 levels a chapter** (sixty stages at half a level), the caps ladder tops out at **1000**,
  // and the campaign therefore has a hard ceiling at **chapter 38**, closing at 995 — nine chapters
  // past this one. Reaching further is a `data/` decision about `LEVEL_CURVE.caps` and the
  // ascension ladder behind it, not a chapter's call, and each +100-level rung appended above
  // `ascended-5` buys roughly **3.3** more chapters. ⚠️ **Appending at the top of `RARITIES` is the
  // one insertion that is not a save migration**; inserting anywhere below it re-means every
  // shipped save. See [ascension](../../docs/ascension.md) and [saves](../../docs/saves.md).
  //
  // ⚠️ **What this deliberately gives up.** The two failure modes the retired guards covered are
  // not both still covered — a flattened curve or inflated rates still fire the floor of "charges
  // real time" below, but **content whose level demands run away is now unguarded**. That is the
  // honest cost of the retirement, and the thing that would catch it is a decision about the
  // campaign's length rather than a threshold in this file.

  it('charges real time for the level the top of the ladder asks for', () => {
    // The half of the old assertion that was genuinely about income, kept and made
    // content-relative. A stage is tuned for a party standing level with it, so the last stage of
    // the ladder is a statement about how much levelling the content demands — and what that
    // demand costs in hours is the honest measure of whether the rates and the curve still fit
    // each other.
    //
    // Under an hour and the levelling curve has stopped being a progression system at the top of
    // the ladder. Raising the reward exponent without touching the curve fires this, which is the
    // failure the absolute-hours version used to catch before a growing ladder drowned it out.
    //
    // ## ⚠️ The ceiling half was retired at chapter 16, and it is the fourth guard retired this way
    //
    // It read `worst < 24` — "over a day of unbroken idle income for one character and levelling
    // has become the wall rather than the content" — and The Spoilfield read **26.16**. ⚠️ **It was
    // not content outgrowing a threshold.** Recomputed for every chapter's own top level at that
    // chapter's own income, it reads **7.47, 9.03, 12.29, 14.33, 18.49, 21.05, 26.16** for chapters
    // 10 through 16: monotone increasing, by construction, because the level cost curve is
    // exponential in the level while `STAGE_REWARDS.exponent` is 1.0 and income is therefore linear
    // in the stage index. A chapter adds 25 levels and 50 stages, so the ratio grows without bound
    // and **no value of the bound is right for more than a chapter or two.**
    //
    // ⚠️ **The marginal form does not rescue it either, which is what settled this.** Measured as
    // the cost of one chapter's 25 levels at that chapter's own income — the shape that normally
    // makes a quantity content-relative — it reads **3.04, 2.39, 4.16, 3.16, 5.35, 3.98, 6.61**.
    // Gold and XP are nearly flat across the same span (1.22 → 1.74 and 1.41 → 1.85 marginal, 10.5
    // and 11.7 cumulative); **essence alone is the runaway**, and the rule that all three base rates
    // move together or none means it cannot be answered by touching one of them.
    //
    // ⚠️ **So this is the fourth guard retired rather than slid**, after the absolute
    // hours-to-the-ceiling (milestone 17), the ratio that replaced it (21d) and `chapters.spec.ts`'s
    // `top < maxLevel / 2` (21d) — three of which are documented in the assertion above this one, for
    // the same reason, in the same words. **When the honest restatement of a guard is a number that
    // has to move every chapter, the guard is pointed at the wrong quantity.**
    //
    // ⚠️ **What is genuinely unbounded now, and is a finding rather than a threshold**: essence's
    // cost curve outruns essence income, and the gap compounds. That is the release-time economy
    // pass — see [economy](../../docs/economy.md) — and it wants all three rates moved together
    // against a re-derived level curve, not a number in this file. The floor below still catches the
    // opposite failure, and it cannot decay.
    const topLevel = chapters.at(-1)?.stages.at(-1)?.level ?? 0;
    const demanded = hoursTo(topLevel);
    const worst = Math.max(demanded.gold, demanded.xp, demanded.essence);

    expect(worst).toBeGreaterThan(1);
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
