// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  cumulativeLevelCost,
  type GrowthData,
  type LevelCurveData,
  levelCapFor,
  levelCost,
  MAX_RARITY_INDEX,
  RARITIES,
  ZERO,
} from '../core';
import { GROWTH, LEVEL_CURVE } from './levels';
import { STAGES } from './stages';

const curve: LevelCurveData = LEVEL_CURVE;
const growth: GrowthData = GROWTH;

/**
 * The rates the top of the authored stage ladder pays, **read from `stages.ts` rather than
 * retyped here.**
 *
 * The level curve is tuned against these, so every time-to-afford assertion below is really an
 * assertion about the two files agreeing. Copying the numbers across would have made that
 * agreement a comment: adding a stage 9 with higher rates would leave this spec measuring
 * against stage 8's forever, passing happily while the real time-to-max quietly collapsed.
 * Deriving them means new content re-runs all of it, and a curve that no longer fits the
 * economy fails here with the real hours in the message.
 */
const top = STAGES[STAGES.length - 1].rates;
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

  it('leaves the ceiling aspirational rather than a grind to schedule', () => {
    // The cap should stay far out of reach at whatever the ladder currently pays — it is two
    // dozen stages long, and a reachable level 1000 would mean the curve had been flattened or
    // the rates inflated past what the content justifies.
    //
    // Because the rates are read from `stages.ts`, this is the assertion that fires when new
    // content raises income without the curve being revisited. It is meant to fail then: the
    // right response is to retune deliberately, not to raise the threshold here.
    expect(hoursTo(curve.maxLevel).gold).toBeGreaterThan(1000);
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
