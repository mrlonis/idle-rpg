// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  ascendedChance,
  type AscensionRules,
  type BannerData,
  type ChapterCurveData,
  type ChapterData,
  type FactionData,
  fullAscensionCost,
  type GachaRulesData,
  ladderShape,
  legendaryChance,
  rarityIndex,
  resolveLadder,
  type ShopOfferData,
  type StageRewardCurveData,
  summonRatePerSecond,
  type SummonRateCurve,
  totalStages,
} from '../core';
import { ASCENSION_RULES, FACTIONS } from './ascension';
import {
  BANNERS,
  DEFAULT_BANNER_ID,
  ELITE_UPGRADE_CHANCE,
  MULTI_PULL_COUNT,
  PITY,
  PULL_COST,
  SPARK_PER_COPY,
  SPARK_SHOP,
  SUMMON_RATE,
  TIER_WEIGHTS,
} from './banners';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';

const banners: readonly BannerData[] = BANNERS;
const offers: readonly ShopOfferData[] = SPARK_SHOP;
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;

/** How many stages this build ships, and every one of them resolved against the reward curve. */
const LADDER_LENGTH = totalStages(ladderShape(chapters));
const LADDER = resolveLadder(chapters, chapterCurve, rewards);

/** The crystal curve, typed as `core/` takes it — which is what makes a malformed one a build error. */
const summonRate: SummonRateCurve = SUMMON_RATE;

const ascensionRules: AscensionRules = ASCENSION_RULES;
const factions: readonly FactionData[] = FACTIONS;

/**
 * Every copy the shipped roster needs to be finished, derived rather than counted.
 *
 * The hard floor on what the gacha is *for*: a pull yields one copy, so this is the smallest number
 * of pulls that could ever max the roster, reached only by a player whose every pull landed on the
 * character they needed. The real figure is a few times larger once the tier weights are counted —
 * which is exactly why this is the right side to bound from. A guard that cannot be beaten by good
 * luck is one nobody can argue with.
 *
 * Through `fullAscensionCost` and the authored `FACTIONS` table rather than an arithmetic of rungs
 * repeated here: a new character, a new faction or a retuned rung has to move this.
 */
const ROSTER_COPIES = CHARACTERS.reduce((total, character) => {
  const path = factions.find((faction) => faction.id === character.faction)?.ascensionPath;
  return total + (path === undefined ? 0 : fullAscensionCost(ascensionRules, path, character.tier));
}, 0);

/**
 * Crystals per second after `cleared` first clears.
 *
 * Through `core/`'s own derivation rather than a re-implementation of it here: a spec that
 * retyped the arithmetic would keep passing if the two ever disagreed, which is the one thing it
 * is for.
 */
function crystalsPerSecond(cleared: number): number {
  return summonRatePerSecond(summonRate, cleared).toNumber();
}

const RULES: GachaRulesData = {
  pullCost: PULL_COST,
  tierWeights: TIER_WEIGHTS,
  pity: PITY,
  eliteUpgradeChance: ELITE_UPGRADE_CHANCE,
  sparkPerCopy: SPARK_PER_COPY,
};

describe('banners', () => {
  it('authors at least one, with unique ids', () => {
    expect(banners.length).toBeGreaterThan(0);
    expect(new Set(banners.map((banner) => banner.id)).size).toBe(banners.length);
  });

  it('opens on a banner that exists', () => {
    expect(banners.map((banner) => banner.id)).toContain(DEFAULT_BANNER_ID);
  });

  it('never names a character that does not exist', () => {
    const known = new Set<string>(CHARACTERS.map((character) => character.id));

    for (const banner of banners) {
      for (const id of banner.pool) {
        expect(known.has(id), `${banner.id} → ${id}`).toBe(true);
      }
    }
  });

  it('draws the standard banner from the whole roster', () => {
    // An empty pool means everyone, which is what makes a narrowed banner content rather than a
    // new code path.
    expect(banners.find((banner) => banner.id === DEFAULT_BANNER_ID)?.pool).toEqual([]);
  });
});

describe('rates', () => {
  it('sums the tier weights to one', () => {
    const total = TIER_WEIGHTS.ascended + TIER_WEIGHTS.legendary + TIER_WEIGHTS.common;

    expect(total).toBeCloseTo(1, 10);
  });

  it('orders them common > legendary > ascended', () => {
    expect(TIER_WEIGHTS.common).toBeGreaterThan(TIER_WEIGHTS.legendary);
    expect(TIER_WEIGHTS.legendary).toBeGreaterThan(TIER_WEIGHTS.ascended);
  });

  it('is far more generous than a commercial banner', () => {
    // A paid gacha tunes to sell a bridge across a gap it manufactures — 0.6% headline rates,
    // ninety-pull pity. There is no bridge to sell here, so every reason to be stingy is a
    // reason that does not apply.
    expect(TIER_WEIGHTS.ascended).toBeGreaterThanOrEqual(0.02);
    expect(PITY.ascended.hardPity).toBeLessThanOrEqual(60);
  });
});

/**
 * The two curves, checked against the same four properties rather than against their constants.
 *
 * Each is quoted with the live rate function the draw itself uses and the base that function is
 * built on, so a curve retuned in `banners.ts` re-runs all of this instead of being described by
 * it. That is what a spec in `data/` is for — a copy of the numbers next door would keep passing
 * against whatever they used to be.
 */
const CURVES = [
  {
    name: 'ascended',
    curve: PITY.ascended,
    base: TIER_WEIGHTS.ascended,
    chance: (pull: number) => ascendedChance(RULES, pull),
  },
  {
    name: 'legendary or better',
    curve: PITY.legendary,
    base: TIER_WEIGHTS.ascended + TIER_WEIGHTS.legendary,
    chance: (pull: number) => legendaryChance(RULES, pull),
  },
] as const;

/** The first pull the ramp alone makes certain, or the hard cap if it never does. */
function certainAt({ curve, chance }: (typeof CURVES)[number]): number {
  for (let pull = 1; pull <= curve.hardPity; pull++) {
    if (chance(pull) >= 1) {
      return pull;
    }
  }
  return curve.hardPity;
}

describe.each(CURVES)('the $name pity curve', (entry) => {
  const { curve, base, chance } = entry;

  it('holds the base rate until soft pity starts', () => {
    expect(chance(curve.softPityStart)).toBeCloseTo(base, 10);
  });

  it('ramps steeply enough that the hard cap is a floor, not the mechanism', () => {
    // The design claim in `banners.ts`: a player is essentially never walked to the guarantee,
    // because the ramp has already reached certainty. **Measured as a fraction of the cycle
    // rather than as a fixed number of pulls** — the two cycles are 30 and 10 long, so "three
    // pulls of headroom" would be a tenth of one and nearly a third of the other, which is two
    // different claims wearing one number.
    const headroom = (curve.hardPity - certainAt(entry)) / curve.hardPity;

    expect(headroom).toBeGreaterThan(0);
    expect(headroom).toBeGreaterThanOrEqual(0.05);
  });

  it('guarantees at the hard cap, and stays guaranteed past it', () => {
    // Past it matters: a counter is repaired by clamping rather than by being trusted, so a
    // damaged save arriving above the cap must not read as a rate that has wrapped back to zero.
    expect(chance(curve.hardPity)).toBe(1);
    expect(chance(curve.hardPity * 3)).toBe(1);
  });

  it('rises monotonically', () => {
    for (let pull = 2; pull <= curve.hardPity; pull++) {
      expect(chance(pull), `pull ${pull}`).toBeGreaterThanOrEqual(chance(pull - 1));
    }
  });
});

describe('the two curves together', () => {
  it('guarantees legendary or better far sooner than the top tier', () => {
    // They answer different questions — how long a dry spell can run, against how far away the
    // top tier can be — and a legendary cycle anywhere near the ascended one would mean the
    // shorter promise had stopped doing its own job.
    expect(PITY.legendary.hardPity).toBeLessThan(PITY.ascended.hardPity / 2);
  });

  it('bounds a ten-pull, which is the batch a player actually experiences', () => {
    // The sizing argument for the shorter curve: a ×10 that came back entirely common was the
    // worst thing this banner could produce, and it is now unreachable rather than merely rare.
    expect(PITY.legendary.hardPity).toBeLessThanOrEqual(MULTI_PULL_COUNT);
  });

  it('starts the legendary floor exactly where the proportional split already sits', () => {
    // ⚠️ The load-bearing coincidence, and the reason `TIER_WEIGHTS` must sum to 1. The legendary
    // curve is applied as a *floor* under the same roll the ascended curve resolves against, and
    // at base rate that floor equals what the proportional rescale produces on its own — so a run
    // inside the flat stretch of both curves draws precisely what it drew before this curve
    // existed. Weights summing to anything else would put the two mechanisms quietly out of step
    // from the first pull.
    const proportional =
      TIER_WEIGHTS.ascended +
      (1 - TIER_WEIGHTS.ascended) *
        (TIER_WEIGHTS.legendary / (TIER_WEIGHTS.legendary + TIER_WEIGHTS.common));

    expect(legendaryChance(RULES, 1)).toBeCloseTo(proportional, 10);
  });

  it('never floors legendary above the live ascended rate', () => {
    // The floor may only ever *raise* the legendary threshold. If it could sit below the ascended
    // chance, deep ascended pity would be silently undone by a freshly cleared legendary counter —
    // the one way two curves over one roll can fight each other.
    for (let ascendedPull = 1; ascendedPull <= PITY.ascended.hardPity; ascendedPull++) {
      for (let legendaryPull = 1; legendaryPull <= PITY.legendary.hardPity; legendaryPull++) {
        const top = ascendedChance(RULES, ascendedPull);
        expect(
          Math.max(legendaryChance(RULES, legendaryPull), top),
          `${ascendedPull}/${legendaryPull}`,
        ).toBeGreaterThanOrEqual(top);
      }
    }
  });
});

describe('pull economy', () => {
  it('prices a pull so the idle rate is a legible number', () => {
    expect(PULL_COST).toBeGreaterThan(1);
    expect(MULTI_PULL_COUNT).toBe(10);
  });

  it('pays enough first-clear crystals to build a real roster on the way up', () => {
    const total = LADDER.reduce((sum, stage) => sum + Number(stage.firstClearSummons ?? 0), 0);

    expect(total / PULL_COST).toBeGreaterThanOrEqual(20);
  });

  it('pays a run that has cleared nothing about a pull an hour', () => {
    // The one place idle income switches on for free, and the reason `PULL_COST` is 100: the base
    // is meant to read as "a pull an hour" on a screen, which is a statement about the two
    // numbers together rather than about either one.
    const pullsPerHour = SUMMON_RATE.basePerHour / PULL_COST;

    expect(pullsPerHour).toBeGreaterThanOrEqual(1);
    expect(pullsPerHour).toBeLessThanOrEqual(2);
  });

  it('never pays out the whole roster faster than a run can enjoy it', () => {
    // ⚠️ **The ceiling on idle crystals, and it replaced two bounds that could not hold.** Both of
    // the old ones measured the ladder against *itself* — pulls a day at full clear, and the
    // ladder's contribution as a multiple of the base — and the rate is `base + step × stages`, so
    // both grow linearly with the ladder and fire on every chapter forever whether or not anything
    // is wrong. They had already been moved twice, and chapter 4 was where the second one landed on
    // exactly its ceiling.
    //
    // **What was actually ever at risk is different, and `banners.ts` says so: a rate that
    // *compounds* past a flat `PULL_COST`.** A linear step cannot do that at any size — being
    // extravagant and compounding are different things, and only the second was the bug. So the step
    // stays at 1, "a pull an hour plus one an hour per stage ever cleared" survives as the legible
    // sentence it was chosen to be, and what is bounded instead is the thing that genuinely goes
    // wrong: a player holding more crystals than there is anything to spend them on.
    //
    // Measured against the roster rather than against the ladder, so it does not decay with content
    // — and it tracks **both** sides, because a roster that grows raises the ceiling exactly as a
    // ladder that grows lowers the floor under it. It fires when idle income really has outrun the
    // gacha's whole purpose, which at the current cadence is somewhere around chapter twelve, and
    // the answer then is to look at whether the roster has kept up rather than at this number.
    const perDay = (crystalsPerSecond(LADDER_LENGTH) * 86_400) / PULL_COST;
    const days = ROSTER_COPIES / perDay;

    expect(
      days,
      `${ROSTER_COPIES} copies at ${perDay.toFixed(0)} pulls a day is ${days.toFixed(0)} days`,
    ).toBeGreaterThan(30);
  });

  it('accrues enough with the ladder fully cleared to be worth having cleared it', () => {
    // The stated pacing target, measured where the rate actually comes from: the clear count.
    // Derived from the ladder's length rather than restated, so adding a chapter re-runs this.
    //
    // ⚠️ **Only the floor is left, and losing the ceiling was milestone 18's decision rather than
    // an omission.** The band was 20–40, then 20–60, then 20–75 — moved once per chapter, each time
    // because `base + step × stages` had grown, which is what it does. A bound that has to be
    // widened every chapter is not measuring anything; the ceiling moved to the assertion above,
    // where it is stated against the roster instead of against the ladder.
    //
    // What this half still says is worth keeping and does not decay: clearing the whole ladder has
    // to be worth materially more than not clearing it. Below twenty a day the climb has stopped
    // paying idle income in any noticeable way and the crystal rate may as well be the flat base.
    const pullsPerDay = (crystalsPerSecond(LADDER_LENGTH) * 86_400) / PULL_COST;

    expect(pullsPerDay).toBeGreaterThan(20);
  });

  it('keeps the whole ladder worth climbing', () => {
    // The other half of the same claim, from the other end: the ladder's contribution has to be a
    // real share of the rate rather than a rounding error on the base.
    //
    // ⚠️ **This had a ceiling of 3 and chapter 4 landed on exactly 3.0, which is what finally made
    // the shape of the bound visible.** `climbed` is `1 + step × stages / base` — it is the ladder's
    // length in disguise, so it rises without limit as chapters ship and says nothing at all about
    // whether the economy is sound. Its own comment predicted the failure to the chapter and
    // prescribed cutting the step; that prescription was declined, because the quantity it was
    // protecting turned out not to be one the roadmap requires to hold still. See the roster-relative
    // ceiling above, which is where "without letting it run away" now lives.
    const climbed = crystalsPerSecond(LADDER_LENGTH) / crystalsPerSecond(0);

    expect(climbed).toBeGreaterThan(1.1);
  });

  it('never pays a crystal rate that falls, or one that a repeat clear can move', () => {
    // The rate is a function of first clears only. Nothing in the curve may make it drop, and
    // nothing but a new clear may make it rise.
    let previous = 0;
    for (let cleared = 0; cleared <= LADDER_LENGTH; cleared++) {
      const rate = crystalsPerSecond(cleared);
      expect(rate, `${cleared} cleared`).toBeGreaterThan(previous);
      previous = rate;
    }
  });
});

describe('the elite upgrade', () => {
  it('stays a good day rather than an expectation', () => {
    expect(ELITE_UPGRADE_CHANCE).toBeGreaterThan(0);
    expect(ELITE_UPGRADE_CHANCE).toBeLessThan(0.2);
  });
});

describe('spark', () => {
  it('converts by tier, because that is what the copy was worth', () => {
    expect(SPARK_PER_COPY.legendary).toBeGreaterThan(SPARK_PER_COPY.common);
    expect(SPARK_PER_COPY.ascended).toBeGreaterThan(SPARK_PER_COPY.legendary);
  });

  it('authors a shop with unique ids and positive prices', () => {
    expect(new Set(offers.map((offer) => offer.id)).size).toBe(offers.length);

    for (const offer of offers) {
      expect(offer.cost, offer.id).toBeGreaterThan(0);
      expect(offer.name.length, offer.id).toBeGreaterThan(0);
    }
  });

  it('offers both a new character and a targeted copy', () => {
    // Two shortages, two kinds of offer. A player who never saw a character needs one; a player
    // two copies short of an ascension needs the other.
    expect(offers.some((offer) => offer.kind === 'character')).toBe(true);
    expect(offers.some((offer) => offer.kind === 'copy')).toBe(true);
  });

  it('names only rarities that exist', () => {
    for (const offer of offers) {
      if (offer.rarity !== undefined) {
        expect(rarityIndex(offer.rarity), offer.id).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('prices a targeted elite copy above everything else', () => {
    // Breadth is cheap; finishing a specific ladder is the expensive thing.
    const elite = offers.find((offer) => offer.rarity === 'elite');
    const others = offers.filter((offer) => offer !== elite);

    for (const offer of others) {
      expect(elite?.cost ?? 0, offer.id).toBeGreaterThan(offer.cost);
    }
  });
});
