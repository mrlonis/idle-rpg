import { CHAPTER_1 } from './chapter-1';
import { CHAPTER_10 } from './chapter-10';
import { CHAPTER_2 } from './chapter-2';
import { CHAPTER_3 } from './chapter-3';
import { CHAPTER_4 } from './chapter-4';
import { CHAPTER_5 } from './chapter-5';
import { CHAPTER_6 } from './chapter-6';
import { CHAPTER_7 } from './chapter-7';
import { CHAPTER_8 } from './chapter-8';
import { CHAPTER_9 } from './chapter-9';

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
 * `rate = base * index ** 1.45`, over the stage's position on the whole ladder. Three things about
 * that number are worth knowing before touching it.
 *
 * **The exponent exists to make income track what the content asks of a party rather than how many
 * stages the party has walked past.** That is the only thing that stops "four times as many stages"
 * from meaning "four times the income", and it is the claim the number is calibrated against — not
 * any particular value of the number itself. It was originally set to **1.13** by matching the
 * hand-authored twenty-four stage ladder, which paid 25 gold a second at enemy level 40 and 90 at
 * level 126: income proportional to roughly `level ** 1.12`.
 *
 * ⚠️ **Milestone 21b raised it to 1.45 and the level-line flattening brought it back to 1.00, by
 * the same derivation both times.** 1.13 was calibrated when enemy level was very nearly *linear*
 * in the stage index. 21a's corrected margin rule made it superlinear — each chapter closed further
 * past its rung's cap than the last — and over that ladder level went as ~`index ** 1.5`, so income
 * at `index ** 1.13` was income proportional to `level ** 0.80`: **sub**-linear where the
 * calibration set it slightly super-linear. 1.45 restored `level ** 1.00`.
 *
 * ⚠️ **The flattening to 0.50 levels a stage made the level line linear again, so the exponent had
 * to come back with it.** Fitted over the new ladder past the tutorial, level goes as
 * `index ** 1.003` — so income linear in enemy level is an exponent of **1.00**, which is what this
 * is. The statement has never moved: *income tracks what the content asks of a party rather than
 * how many stages the party has walked past.* Only the ladder underneath it has.
 *
 * ⚠️ **Do not read the drop from 1.45 as an income cut in the sense that matters.** The top of the
 * ladder pays far less in absolute terms, but the level it *asks for* fell from 588 to 200 at the
 * same time, and the quantity a player experiences is the ratio: maxing a character against the top
 * of the ladder went from **16.1 hours to 7.5**, so progression is *faster*, not slower. What would
 * have been the real cut is leaving the exponent at 1.45 — that reads **0.50 hours** and fires the
 * floor of `levels.spec.ts`'s "charges real time", which is the guard saying the levelling curve
 * has stopped being a progression system at all. Neither number is a difficulty change: a party is
 * capped by its ascension rung, not by its income.
 *
 * ⚠️ **This is the lever milestone 21 named, and the alternatives were measured before it was
 * taken.** Flattening the essence curve was arithmetically insufficient: at an essence exponent of
 * 2.1 chapter 8 scrapes under the guard, "essence is the bottleneck late" breaks at level 200, and
 * chapters 9 and 10 still read 40h and 60h — and below 2.0 the binding currency becomes **xp**,
 * which alone reads 27.8h at chapter 9. Scaling `baseRates` again buys about one chapter per
 * doubling, because the divergence is between two exponents and no constant factor touches it. And
 * there is no level at which chapter 8 satisfies both the margin rule and the guard: 24 hours lands
 * at level ~330 and `mythic` caps at 340, so the chapter would have to close *below* the cap of the
 * rung it asks for, which is exactly the walkover 21a measured.
 *
 * ⚠️ **Doubling `baseRates` in milestone 14 broke the original correspondence on purpose.** The
 * exponent is what carries the *shape* and the base is what carries the *scale*; do not move one to
 * undo a change to the other.
 *
 * **A power law is a decelerating geometric curve, and deceleration is the whole requirement.**
 * The per-stage multiplier is `1 + 1.45 / index`: about ×2.7 across the first stage, ×1.15 by stage
 * ten, ×1.015 by stage a hundred. Milestone 7 already had to bend the authored gold slope from
 * ×1.4 a stage down to ×1.1 for the same reason, and nothing constant survives this ladder's
 * length — ×1.1 compounded over nine thousand stages has three hundred digits in it. Raising the
 * exponent steepens the curve without making it stop decelerating, which is the property that has
 * to survive any move of it.
 *
 * ⚠️ **`levels.spec.ts` used to read the top of this curve and assert level 1000 stays out of
 * reach, and milestone 21d retired the last of those assertions.** Every quantity of that shape —
 * hours to the ceiling, and then the *ratio* of that to what the top stage demands — falls with each
 * chapter by construction, because this curve raises income with every stage authored. Two of them
 * were re-derived once each and then retired rather than moved a third time. What still watches this
 * exponent is `levels.spec.ts`'s **"charges real time"**, which is two-sided: raising income without
 * touching the level curve trips its floor, and the level curve running away trips its ceiling.
 *
 * **The retired one fired when the rates doubled, and the deliberate answer then was to accept the
 * halving.** Level 1000 went from 1,175 hours of top-of-ladder idle income to 588, and the threshold
 * moved to 500 rather than the level curve moving to absorb it — because the point of doubling was
 * that progression be twice as fast, and a curve retuned to cancel that would have made the whole
 * change a no-op on screen. See [economy](../../docs/economy.md).
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
  exponent: 1.0,
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
 * Ten of them — 10, 20, 30, 40, and then six of fifty. The first six are the two hundred the
 * four-chapter ladder carried, re-cut in milestone 19 so the boundaries land where a session does;
 * the last four are milestones 21a through 21d, which take the ladder to four hundred stages.
 * [`chapters.spec.ts`](./chapters.spec.ts) checks each one is the length {@link CHAPTER_CURVE}
 * says it should be, so a chapter authored at forty-nine stages is a failing test rather than a
 * boss that quietly lands on the wrong square.
 *
 * ⚠️ **Every chapter ends on a boss fielded nowhere else, and the re-cut made that a rule.** The
 * Fenlord, the Pale Warden, the First Cinder and the Ashfall Sovereign were authored for it;
 * the Chainsworn and the Hollow Seraph already observed it, and The Cairn King, The Withered Crown,
 * The Anvil Crowned and The Everwound are the seventh through tenth. A re-cut that moves a boundary
 * owes the new final a unique body before it ships.
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
 * cost-in-hours. See [testing](../../docs/testing.md).
 */
export const CHAPTERS = [
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CHAPTER_5,
  CHAPTER_6,
  CHAPTER_7,
  CHAPTER_8,
  CHAPTER_9,
  CHAPTER_10,
] as const;
