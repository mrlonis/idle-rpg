import { CHAPTER_1 } from './chapter-1';
import { CHAPTER_2 } from './chapter-2';

/**
 * The ladder, in chapters: how long a chapter is, what a stage pays, and the chapters shipped.
 *
 * `core/ladder.ts` is where all of this is evaluated. What lives here is the content and the
 * coefficients, which is the same division `levels.ts` makes with the level curve — a handful of
 * numbers rather than a thousand authored rows, and a spec that pins the results where they
 * matter.
 */

/**
 * Stages that must have been cleared before auto-battle unlocks.
 *
 * Twelve, which is where it has always been: the end of the opening run of locks, which is the
 * stretch that teaches a player what a party is for. Everything after it is a chapter to chew
 * through, and a chapter of fifty stages tapped one fight at a time would be worse than a
 * twelve-stage ladder, not better.
 *
 * A count of clears rather than a position, because `clearedStages` is the field that keeps
 * counting after the position stops climbing at the top of the ladder — see `applyBattleResult`.
 */
export const AUTO_BATTLE_UNLOCK_CLEARS = 12;

/**
 * How long a chapter is.
 *
 * | Chapters | Stages each | Running total |
 * | -------- | ----------- | ------------- |
 * | 1–10     | 50          | 500           |
 * | 11–20    | 60          | 1,100         |
 * | 21–30    | 70          | 1,800         |
 * | …        | …           | …             |
 * | 91–100   | 140         | 9,500         |
 * | 151+     | 200 (cap)   | 20,000 at 160 |
 *
 * **Both shipped chapters sit in the first band, so shipping them proves the chapter _flow_ and
 * not this table** — the boundary, the boss, and income continuity across the seam all get
 * exercised, and the step to sixty stages does not arrive until chapter 11. That is exactly why
 * it is a formula with its own tests rather than something inferred from two chapters that
 * happen to be the same length.
 *
 * The cap is what stops a chapter becoming a career. Growth of ten stages a band would put
 * chapter 500 at five thousand stages on its own; stopping at two hundred keeps a chapter a thing
 * a player finishes, and pushes the ladder's length into the chapter *count* instead, where it
 * can be paced.
 */
export const CHAPTER_CURVE = {
  baseStages: 50,
  stepStages: 10,
  chaptersPerBand: 10,
  maxStages: 200,
  /**
   * Every tenth stage of a chapter is a mini-boss; the last one is a boss instead.
   *
   * A rhythm rather than a size: a fifty-stage chapter gets four mini-bosses and a boss, and a
   * two-hundred stage one gets nineteen and a boss, without either being authored as such.
   */
  miniBossEvery: 10,
} as const;

/**
 * What a stage pays, as four numbers instead of a table.
 *
 * ## The rates
 *
 * `rate = base * index ** 1.13`, over the stage's position on the whole ladder. Two things about
 * that number are worth knowing before touching it.
 *
 * **It reproduces the hand-authored ladder at matching enemy levels, which is how it was
 * chosen.** The old twenty-four stage ladder paid 25 gold a second at enemy level 40 and 90 at
 * level 126; this curve pays about 42 at chapter 1's level-40 boss and about 91 at chapter 2's
 * level-126 one. Income tracks what the content asks of a party, not how many stages the party
 * has walked past — which is the only thing that stops "four times as many stages" from meaning
 * "four times the income".
 *
 * **A power law is a decelerating geometric curve, and deceleration is the whole requirement.**
 * The per-stage multiplier is `1 + 1.13 / index`: about ×2 across the first stage, ×1.1 by stage
 * ten, ×1.01 by stage a hundred. Milestone 7 already had to bend the authored gold slope from
 * ×1.4 a stage down to ×1.1 for the same reason, and nothing constant survives this ladder's
 * length — ×1.1 compounded over nine thousand stages has three hundred digits in it.
 *
 * ⚠️ **`levels.spec.ts` reads the top of this curve and asserts level 1000 stays out of reach.**
 * It is the assertion that fires when a new chapter raises income without the level curve being
 * revisited, and it is meant to: the right answer then is to retune deliberately.
 *
 * ## The two payouts
 *
 * The lump is forty seconds of the income the stage unlocks — a duration rather than an amount,
 * so it cannot drift away from the thing it is measured against — and it is deliberately the
 * smaller half of the deal, because a rate compounds with time away and a lump does not.
 *
 * First-clear crystals are **flat in the stage index** — 250 a stage, wherever the stage sits.
 * They used to climb by 6 a stage off a base of 200, which was already the conservative choice
 * against a flat `PULL_COST` (a compounding crystal income outruns what it is spent on, and
 * ascension quietly stops being a constraint on anything). Flat is that argument taken the rest of
 * the way, for the reason `achievements.ts` gives for a flat award: a linear payout is worth least
 * exactly where a run is shortest of crystals. `perStage` is kept at zero rather than deleted
 * because it is the knob that would have to move to undo this, and `ladder.spec.ts` still asserts
 * the step is constant — which is what forbids a later retune from reaching for a geometric one.
 *
 * ⚠️ **Flattening the per-stage payout cut the ladder's first-clear crystals by more than half**
 * (about 58,800 over the shipped hundred stages, down to 29,000). That was paid back deliberately
 * on the achievement side rather than absorbed — see [`achievements.ts`](./achievements.ts), where
 * the stage track quadrupled and a chapter track arrived. The two halves are one decision and the
 * totals only balance when read together; `banners.spec.ts` pins what is left here.
 *
 * The two multipliers survive the flattening, and they are the whole of the chapter's rhythm now
 * that the base does not move: a mini-boss is worth two ordinary stages and a chapter boss five,
 * which is a real payday without touching the income curve.
 *
 * **Crystals are deliberately absent from the lump.** They accrue idly, and on a first clear, and
 * nowhere else — a repeatable crystal payout would make tap-farming the shortest stage the
 * fastest way to pull, and the correct play in a game about climbing a ladder would be to never
 * leave the bottom of it.
 */
export const STAGE_REWARDS = {
  /**
   * What the first stage of the ladder unlocks, per second.
   *
   * Unchanged from the hand-authored ladder's opening stage, because the opening is the one part
   * of the curve a player experiences at full resolution: a run starts at zero on all three and
   * the first battle is what switches idle income on.
   */
  baseRates: {
    gold: 0.5,
    xp: 0.1,
    essence: 0.0015,
  },
  exponent: 1.13,
  rewardSeconds: 40,
  firstClearSummons: {
    base: 250,
    /** Zero on purpose: the payout is flat. See the note above before making it climb again. */
    perStage: 0,
    miniBossMultiplier: 2,
    bossMultiplier: 5,
  },
} as const;

/**
 * The chapters this build ships, in the order they are climbed.
 *
 * Two of them, fifty stages each. [`chapters.spec.ts`](./chapters.spec.ts) checks each one is the
 * length {@link CHAPTER_CURVE} says it should be, so a chapter authored at forty-nine stages is a
 * failing test rather than a boss that quietly lands on the wrong square.
 */
export const CHAPTERS = [CHAPTER_1, CHAPTER_2] as const;
