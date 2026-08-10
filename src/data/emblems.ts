/**
 * Emblems: what they accrue at, and what a fight has to do to drop one.
 *
 * Emblems level signature items and nothing else in the game spends them — see
 * [`data/signature.ts`](./signature.ts) for what they buy and
 * [`docs/signature-items.md`](../../docs/signature-items.md) for the system. This file is the
 * faucet alone, and it is separated from the sink deliberately: the two are retuned against
 * different things. The sink is retuned when a signature item is too strong or too weak; the
 * faucet is retuned when the *wait* is wrong, which is a question about the shape of a run rather
 * than about any one character.
 *
 * ## The two sources, and which one actually matters
 *
 * There are two, and it is worth stating plainly which dominates, because the intuitive answer is
 * wrong by a wide margin. The idle rate is the one with the design argument attached — it steps
 * per **chapter**, it is the reason there is no unlock flag in the save, and it is what makes
 * emblems a thing that arrives with time. It is also **much the smaller faucet** for anybody
 * running auto-battle.
 *
 * ⚠️ **The number that matters is the boss rate, not the ordinary one, and that is not obvious.**
 * The campaign position stops climbing at the top of the authored ladder so the last stage stays
 * farmable — and the last stage of a chapter *is* a chapter boss. So the stage an auto-battler
 * actually grinds is the 25% row, not the 2% one. At roughly a stage a minute that is **15 emblems
 * an hour against an idle rate of 6 at a full clear**, not the ~1.2 an hour the `normal` row
 * would suggest.
 *
 * That is accepted rather than tuned away, because the binding constraint on this system is not
 * the currency — it is the `mythic` rarity gate on the other side, which is tens of thousands of
 * pulls deep. A faster faucet makes the stockpile waiting at that gate larger; it does not make
 * anything arrive sooner. What it would take to *change* is a reason to believe a player should
 * feel emblem-poor after the gate, and the design says the opposite.
 *
 * ⚠️ **Retuning the drop chances is an economy change of the same size as retuning the rate**, and
 * the naive reading — "drops are the garnish, the rate is the pacing" — is how it gets moved
 * carelessly. `data/emblems.spec.ts` measures both faucets, and specifically measures the **boss**
 * case rather than the ordinary one, so the figure the bound is written against is the figure a
 * real run produces.
 *
 * ## Why the drop chances are as low as they are
 *
 * They read as stingy beside the gear table, which drops one to three pieces on **every** win. The
 * difference is what the two currencies price against. Alloy prices against gear levels, which
 * compound; an emblem prices against a signature level, which is a flat integer forever — the same
 * relationship a crystal has to a flat `PULL_COST`. A faucet that scaled with how much a player
 * farmed would outrun a flat price exactly the way a compounding crystal rate would.
 *
 * ⚠️ **A missed emblem is not "a fight that produced nothing".** The rule that a fight always pays
 * is satisfied by the gear drop, which is unconditional and has a floor of one. Emblems sit on top
 * of that as an occasional extra, which is what licenses a *chance* here where `dropCount` was
 * required to clamp its minimum up to one.
 */

import { type EmblemDropData, type EmblemRateCurve } from '../core';

/**
 * How emblems accrue while idle: nothing until a chapter is finished, then one an hour per whole
 * chapter cleared.
 *
 * **There is no base, unlike the crystal rate**, and the asymmetry is deliberate. `SUMMON_RATE`
 * pays from the first minute so a new player watches the roster grow before they have done
 * anything. Nothing can spend an emblem until a character reaches `mythic` rarity, which is tens
 * of thousands of pulls away, so a base here would be a number climbing in a wallet with no screen
 * able to say what it was for.
 *
 * **The step is per chapter and not per stage**, which is the whole of the pacing argument. A
 * signature level costs a flat number of emblems forever, so the faucet has to grow slowly enough
 * that a flat price still means something a hundred stages later. Per stage over the shipped
 * two hundred would multiply the faucet by thirty-three; per chapter caps it at six an hour.
 *
 * It also puts the unlock somewhere that cannot rot: the rate is zero until a chapter is finished,
 * so "emblems are unlocked" is arithmetic over `clearedStages` rather than a boolean in the save.
 * There is no flag to lose, migrate, or repair.
 */
export const EMBLEM_RATE: EmblemRateCurve = {
  perChapterPerHour: 1,
};

/**
 * The chance one clear drops one emblem, by what kind of stage it was.
 *
 * A **chance of one** rather than a count range, which is the opposite choice from gear. Gear
 * needed a range because a fixed count makes every clear identical and the variance is what makes
 * a drop an event; an emblem is already an event at these odds, and a range on top would be
 * variance on variance for a currency whose whole job is to accumulate predictably.
 *
 * The three tiers are the same rhythm gear uses — ordinary, mini-boss, chapter boss — and they are
 * spread much wider than gear's, from one clear in fifty to one in four. That spread is the
 * incentive this table exists to create: with a flat chance there is no reason to fight anything
 * but the fastest stage on the ladder, and the whole point of a boss is that it is worth going to.
 *
 * ⚠️ **Flat across the ladder, deliberately.** Every other derived quantity in the game scales with
 * the linear stage index; this one does not, because an emblem is spent at a flat price and a
 * faucet that grew with position would let a late run outpace that price without bound. What a
 * later stage pays more of is gold, xp, essence and gear grades — the things that price against
 * curves that grow too.
 */
export const EMBLEM_DROPS: EmblemDropData = {
  /** One clear in fifty. The floor, and what auto-battle is actually earning. */
  normal: 0.02,
  /** One in ten. Every tenth stage of a chapter. */
  miniBoss: 0.1,
  /** One in four. The last stage of a chapter, and the roof of a tower. */
  boss: 0.25,
  /**
   * Whole chapters that must be cleared before any of the above pays out.
   *
   * The same threshold the idle rate crosses, and it is authored once here rather than twice so
   * the two cannot drift apart. A run that has not finished a chapter has neither faucet, which is
   * what makes "emblems unlock when you finish chapter 1" one fact rather than two that agree.
   */
  unlockChapters: 1,
};
