import { CHAPTER_1 } from './chapter-1';
import { CHAPTER_2 } from './chapter-2';
import { CHAPTER_3 } from './chapter-3';
import { CHAPTER_4 } from './chapter-4';
import { CHAPTER_5 } from './chapter-5';
import { CHAPTER_6 } from './chapter-6';

/**
 * The ladder, in chapters: how long a chapter is, what a stage pays, and the chapters shipped.
 *
 * `core/ladder.ts` is where all of this is evaluated. What lives here is the content and the
 * coefficients, which is the same division `levels.ts` makes with the level curve — a handful of
 * numbers rather than a thousand authored rows, and a spec that pins the results where they
 * matter.
 */

/**
 * Chapters that must have been finished before auto-battle unlocks.
 *
 * One: the re-cut ladder's chapter 1 is the ten-stage stretch that teaches a player what a party
 * is for, and its boss is the graduation. Everything after it is a chapter to chew through, and a
 * chapter tapped one fight at a time would be worse than a ten-stage ladder, not better.
 *
 * ⚠️ **A count of chapters rather than of clears**, resolved through `chaptersCleared` against the
 * shipped `LadderShape` — which is what makes moving the unlock a one-integer edit however the
 * chapters are ever re-cut again. It was `AUTO_BATTLE_UNLOCK_CLEARS = 12` while the unlock sat
 * mid-chapter; tying it to a chapter boundary is what the re-cut bought. Derived from
 * `clearedStages` rather than the position, because `clearedStages` is the field that keeps
 * counting after the position stops climbing at the top of the ladder — see `applyBattleResult`.
 */
export const AUTO_BATTLE_UNLOCK_CHAPTERS = 1;

/**
 * How long a chapter is.
 *
 * | Chapter | Stages | Running total |
 * | ------- | ------ | ------------- |
 * | 1       | 10     | 10            |
 * | 2       | 20     | 30            |
 * | 3       | 30     | 60            |
 * | 4       | 40     | 100           |
 * | 5+      | 50 (cap) | 150, 200, … |
 *
 * A ramp and then a plateau: each chapter is ten stages longer than the last until fifty, and
 * fifty is the cap. The six-chapter re-cut chose this shape because a chapter should be finished
 * when its questions are — the opening chapter has three locks and a boss in it, not fifty
 * stages of anything — and because short early chapters put the first boss, the first
 * chapter-award and the auto-battle unlock inside a new player's first session.
 *
 * ⚠️ **Fifty is the permanent cap under this curve, and the long ladder is chapters rather than
 * longer chapters.** The pre-re-cut curve grew chapters by ten stages per band of ten toward a
 * cap of two hundred; that growth is gone, not deferred — a ladder reaching the level-1000
 * ceiling is now ~190 chapters of at most fifty rather than 160 of up to two hundred. Revisit
 * deliberately if a fifty-stage chapter ever starts reading as too short at the far end;
 * `chapters.spec.ts` holds the authored chapters equal to this formula, so the revisit is a
 * formula change and a retune, never a drift.
 */
export const CHAPTER_CURVE = {
  baseStages: 10,
  stepStages: 10,
  chaptersPerBand: 1,
  maxStages: 50,
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
 * **The exponent was chosen to reproduce the hand-authored ladder at matching enemy levels.** The
 * old twenty-four stage ladder paid 25 gold a second at enemy level 40 and 90 at level 126, and
 * this curve paid about 42 at chapter 1's level-40 boss and about 91 at chapter 2's level-126 one.
 * Income tracks what the content asks of a party, not how many stages the party has walked past —
 * which is the only thing that stops "four times as many stages" from meaning "four times the
 * income".
 *
 * ⚠️ **Doubling `baseRates` broke that correspondence on purpose; those two levels now pay about
 * 83 and 182.** The exponent is untouched, so what the calibration was actually protecting still
 * holds: income is a function of a stage's **position**, so a longer ladder still cannot make the
 * game richer at a given enemy level. Do not "restore" the old figures by moving the exponent —
 * that would change the curve's shape to undo a change to its scale.
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
 * **It fired when the rates doubled, and the deliberate answer was to accept the halving.** Level
 * 1000 went from 1,175 hours of top-of-ladder idle income to 588, and the threshold moved to 500
 * rather than the level curve moving to absorb it — because the point of doubling was that
 * progression be twice as fast, and a curve retuned to cancel that would have made the whole change
 * a no-op on screen. See [milestones](../../docs/milestones.md); the threshold has now been moved
 * once and is not free to move again.
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
   * **Doubled from the hand-authored ladder's opening stage** (0.5 / 0.1 / 0.0015), which it had
   * matched until then — the opening is the one part of the curve a player experiences at full
   * resolution, and a run still starts at zero on all three so the first battle is still what
   * switches idle income on.
   *
   * ⚠️ **All three doubled together, and that is what made it safe.** Every assertion in
   * `levels.spec.ts` about the economy is either a *ratio* between the three currencies or a
   * comparison among them, and a common factor cancels out of all of them: essence still bites
   * late and not early, gold is still the most comfortable, and the three still land within a third
   * of each other in time-to-afford. Doubling one would have moved every one of those. The same
   * cancellation covers the gear shop and the bounty board, both of which price in *seconds of the
   * run's own income* rather than in amounts.
   *
   * What it did move is the one thing measured in absolute hours — see the ceiling note below.
   */
  baseRates: {
    gold: 1,
    xp: 0.2,
    essence: 0.003,
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
 * Six of them — 10, 20, 30, 40, 50 and 50 stages, the same two hundred stages the four-chapter
 * ladder carried, re-cut in milestone 19 so the boundaries land where a session does.
 * [`chapters.spec.ts`](./chapters.spec.ts) checks each one is the length {@link CHAPTER_CURVE}
 * says it should be, so a chapter authored at forty-nine stages is a failing test rather than a
 * boss that quietly lands on the wrong square.
 *
 * ⚠️ **Every chapter ends on a boss fielded nowhere else, and the re-cut made that a rule.** The
 * Fenlord, the Pale Warden, the First Cinder and the Ashfall Sovereign were authored for it;
 * the Chainsworn and the Hollow Seraph already observed it. A re-cut that moves a boundary owes
 * the new final a unique body before it ships.
 *
 * ⚠️ **Adding one is an economy change as much as a content one.** Three guards are functions of
 * how long the ladder is — the idle crystal rate in `banners.spec.ts`, everything a clear pays in
 * `achievements.spec.ts`, and the level ceiling's cost in hours in `levels.spec.ts` — and all
 * three fired on chapter 3. See [economy](../../docs/economy.md) for what each one was answered
 * with and which of the answers is a deferral rather than a fix.
 *
 * ⚠️ **Chapter 4 added a fourth, and it is not an economy guard.** "Levelling and ascension are
 * worth about the same across the ladder" in `chapters.balance.ts` is a **ratio between two
 * quantities that grow at different rates by construction** — a chapter adds about sixty-five
 * levels and exactly one rung, and one rung only pays for twenty-three levels — so it climbs every
 * chapter forever and the rungs run out at sixteen while the levels run to a thousand. It was
 * re-derived rather than widened, the same move milestone 17 made on the level ceiling's
 * cost-in-hours. See [milestones](../../docs/milestones.md).
 */
export const CHAPTERS = [CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4, CHAPTER_5, CHAPTER_6] as const;
