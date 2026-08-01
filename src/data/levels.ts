/**
 * The level curve, the rarity level caps, and per-tier growth.
 *
 * Plain data: coefficients, not a thousand authored rows. `core/roster/level.ts` evaluates the
 * shape and `levels.spec.ts` pins the results at the levels that matter, which is what a table
 * was ever actually buying — with none of the thousand chances for a typo.
 *
 * ## The shape
 *
 * Cost to go from level `L` to `L + 1` is `coefficient * L ^ exponent`, per currency. Essence
 * is the exception: it is charged only when the level being reached is a multiple of ten, and
 * its exponent applies to the breakthrough number rather than the level, so it arrives in
 * visible jumps instead of creeping upward every level.
 *
 * ## Where it lands
 *
 * Measured against the top of the current stage ladder (16 gold/s, 3 xp/s, 0.05 essence/s),
 * for one character:
 *
 * | Level | Gold          | XP           | Essence     |
 * | ----- | ------------- | ------------ | ----------- |
 * | 40    | 102k  (1.8h)  | 30k  (2.8h)  | 214 (1.2h)  |
 * | 100   | 1.07M (18.6h) | 282k (26.2h) | 3.5k (19.7h)|
 * | 200   | 6.32M (110h)  | 1.52M (141h) | 32k  (179h) |
 * | 1000  | 385M  (6682h) | 75M  (6954h) | 6.1M (34066h)|
 *
 * Three things that table is chosen to show:
 *
 * 1. **No currency is decorative.** Through level 140 all three sit within about a third of
 *    each other in time-to-afford, so a player is never idling on one number while two others
 *    pile up unspent.
 * 2. **Essence takes over late.** It is the cheapest of the three before level 60 and the most
 *    expensive by level 200, which is the bottleneck it was asked to be — and it bites without
 *    ever being the thing that blocks a new player.
 * 3. **1000 is aspirational, not a grind to schedule.** At today's rates the cap is years
 *    away, and it should be: the ladder is eight stages long. Rates rise with content, and
 *    this curve is what that content will be tuned against.
 *
 * That last point is **enforced, not merely intended.** `levels.spec.ts` reads its income rates
 * off the top of `stages.ts` rather than restating them, so adding a stage re-runs every figure
 * in the table above. When it fails, the curve and the economy have come apart and the answer is
 * to retune one of them — not to move the threshold.
 *
 * ## Level caps
 *
 * Every cap is a multiple of ten, so an ascension always lands a character directly in front
 * of a breakthrough rather than stranded between two. The caps are front-loaded — the first
 * five rungs hand out 200 levels between them and the last five hand out 500 — because the
 * early rungs are the ones a new player is actually climbing, and headroom they cannot reach
 * is not a reward.
 */

/** Level cost coefficients, rarity caps, and the ceiling. */
export const LEVEL_CURVE = {
  /** The ceiling, at `ascended-5`. Deliberately far out of reach at current income. */
  maxLevel: 1000,

  // Shallowest slope of the three, because gold has the broadest claim on it: levelling
  // spends it now, and gear, gear levels and the shop will spend it later.
  gold: { coefficient: 22, exponent: 1.55 },

  // Steeper in effect than gold, because the rate behind it is far lower. XP does nothing but
  // level characters, so there is no reason to be generous with it.
  xp: { coefficient: 10, exponent: 1.42 },

  // Charged every tenth level. The steepest exponent in the file by a wide margin — this is
  // the bottleneck, and it is supposed to be felt.
  essence: { coefficient: 5, exponent: 2.3, every: 10 },

  /** Indexed to match `RARITIES` in `core/roster/types.ts`. */
  caps: [
    40, // rare
    60, // rare-plus
    100, // elite
    140, // elite-plus
    200, // legendary
    260, // legendary-plus
    340, // mythic
    420, // mythic-plus
    500, // ascended
    600, // ascended-1
    700, // ascended-2
    800, // ascended-3
    900, // ascended-4
    1000, // ascended-5
  ],
} as const;

/**
 * Per-level and per-ascension growth.
 *
 * ## Why these three numbers are so close together
 *
 * The per-level rates differ by about 0.3 percentage points, which looks like nothing and is
 * the entire design. Compounded across the level range it is worth:
 *
 * | Level | Common | Legendary | Ascended | Ascended ÷ Common |
 * | ----- | ------ | --------- | -------- | ----------------- |
 * | 50    | ×1.4   | ×1.6      | ×1.7     | 1.2×              |
 * | 200   | ×4.4   | ×5.9      | ×8.0     | 1.8×              |
 * | 1000  | ×1745  | ×7714     | ×34024   | 19.5×             |
 *
 * So a common-tier character is genuinely competitive early — 20% behind at level 50 is
 * nothing next to being ascended two rungs higher — and genuinely a joke at the cap. That is
 * the brief: amazing early, falls off later, *as a consequence of the math* rather than as an
 * assertion. A flat multiplier would leave common tier the same fixed distance behind forever
 * and never actually fall off.
 *
 * Base stat budgets in `characters.ts` are near-equal across tiers on purpose. Tier buys a
 * sharper niche and a steeper slope, not a bigger number at level one.
 */
export const GROWTH = {
  perLevel: {
    common: 1.0075,
    legendary: 1.009,
    ascended: 1.0105,
  },
  /**
   * Per rung climbed above a character's starting rarity.
   *
   * Worth ×4.36 across the full rare-start ladder and ×3.48 for an elite-start one. The
   * ascended tier getting *less* total ascension multiplier is intended: it skipped the two
   * cheapest rungs for free, and its steeper per-level slope more than settles the account.
   */
  perAscension: 1.12,
} as const;
