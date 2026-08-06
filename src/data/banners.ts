/**
 * Banners, pull rates, pity, and the spark shop.
 *
 * Plain data. `core/gacha/` does the drawing; every number that decides how it feels is here.
 *
 * ## These rates are not commercial rates, and that is the whole point
 *
 * A paid gacha tunes to sell a bridge across a gap it manufactures: 0.6% headline rates,
 * ninety-pull pity, and scarcity that exists so it can be relieved for money. There is no
 * bridge to sell here — the game is free, permanently, with nothing to buy — so every reason
 * to be stingy is a reason that does not apply. Generosity costs nothing.
 *
 * So: **2.5% base for an ascended-tier character, not 0.6%. Hard pity at 50, not 90.** Soft
 * pity ramps steeply enough that the real average is well under the hard cap. An unlucky
 * player here has no wallet to escape with, which is exactly why the floor has to be a floor.
 *
 * ## Duplicates are never wasted, at any point in a run
 *
 * Every copy of a character you already own is ascension material, which is the primary
 * progression path — so the classic "dupe of a unit I don't want" outcome does not exist.
 * Once a character is at `ascended-5` and has nothing left to ascend, further copies convert
 * to {@link SPARK_PER_COPY} spark and buy something in the shop instead. There is no state in
 * which a pull produces nothing.
 */

/**
 * What one pull costs, in summon crystals.
 *
 * Priced at 100 rather than 1 so the idle rate is a legible number: {@link SUMMON_RATE} is
 * then read as "a pull an hour, plus one more per hour for every stage you have ever cleared",
 * where 0.0278 of a crystal per second reads as nothing at all.
 */
export const PULL_COST = 100;

/**
 * How the idle crystal rate is earned, in crystals per hour.
 *
 * Unlike gold, xp and essence — each authored per stage in [`stages.ts`](./stages.ts) — this is a
 * flat base plus a linear step per first clear. Two decisions are folded into that:
 *
 * **The base is paid from the first minute of a run, before anything has been cleared.** That is
 * the one place this economy switches idle income on for free, and it is deliberate: at a
 * {@link PULL_COST} of 100 it is a pull an hour for a player who has not fought yet, which is the
 * game telling a new player that the roster is a thing that grows on its own. Gold, xp and
 * essence still start at zero, so the first battle is still the only thing worth doing — it is
 * just no longer the only thing that pays.
 *
 * **The step is linear, and per stage cleared for the first time.** A rate should compound only
 * if what it buys compounds: levels compound, so gold does; a pull is a flat 100 crystals and an
 * ascension a flat count of copies, so a compounding crystal rate would outrun its own prices and
 * make pulls effectively unlimited a chapter or two in. Linear keeps the full ladder worth
 * climbing — clearing the shipped hundred stages **doubles** the rate — without ever getting ahead
 * of what it is spent on.
 *
 * **The step halved when milestone 11 shipped chapters, and it has been put back.** Milestone 11
 * cut it from 1 to 0.5 because a hundred stages at the full step is five ten-pulls a day where the
 * ladder had been paying three, and that was past the band `banners.spec.ts` held at the time. The
 * band is what moved instead, deliberately and with the numbers on the table: at the full step a
 * cleared ladder pays **48 pulls a day** against 36, and the shape of the reward — flat base plus
 * linear step, once per stage, ever — did not change at all. What licenses it is the thing this
 * curve was ever actually guarding: the failure mode is a rate that **compounds** past a flat
 * `PULL_COST`, and a linear step cannot do that at any size. Being extravagant and compounding are
 * different things, and only the second one was ever the bug (see [economy](../../docs/economy.md)).
 *
 * ⚠️ **What still binds is the ratio, not the step.** The ladder's contribution is `step × stages`
 * against a base of 100, so the full step means the shipped hundred stages exactly double the base
 * — and a ladder twice as long would treble it. That is the number `banners.spec.ts` bounds, and
 * a third and fourth chapter walk it toward the ceiling. Adding chapters is what should force this
 * question again; the step is not free to raise a second time.
 *
 * The base did not move either way: a pull an hour from install is the number that makes this
 * economy legible.
 *
 * The step is paid **once per stage, ever**. Re-fighting a cleared stage, by hand or on
 * auto-battle, moves it by nothing at all: a repeatable crystal payout would make tap-farming
 * stage 1 the fastest way to pull, which is the incentive the whole ladder exists to avoid.
 */
export const SUMMON_RATE = {
  basePerHour: 100,
  perClearPerHour: 1,
} as const;

/** Pulls in a multi-pull. Ten is the genre convention and the pity counter is tuned to it. */
export const MULTI_PULL_COUNT = 10;

/**
 * Rarity-tier weights before pity is applied.
 *
 * As pity raises the ascended-tier chance, the other two are scaled down **in proportion to
 * each other** rather than one absorbing the whole change — so a pity-inflated pull is still
 * roughly three common-tier characters for every legendary-tier one, and the shape of the pool
 * a player experiences does not lurch as the counter climbs.
 */
export const TIER_WEIGHTS = {
  ascended: 0.025,
  legendary: 0.225,
  common: 0.75,
} as const;

/**
 * The pity curve, in pulls since the last ascended-tier character.
 *
 * `softPityStart` is the last pull still at the base rate; every pull after it adds
 * `softPityStep`. With a 6-point step the chance passes 100% a few pulls before `hardPity`
 * ever has to fire, so the hard cap is a guarantee rather than the mechanism — the counter is
 * usually cleared in the high thirties.
 */
export const PITY = {
  softPityStart: 30,
  softPityStep: 0.06,
  hardPity: 50,
} as const;

/**
 * Chance that a legendary-tier pull arrives already at Elite rather than Rare.
 *
 * Worth far more than it looks: Elite is two rungs up, and the rungs below it are deliberately the
 * expensive stretch — they are the only thing separating what a common-tier climb costs from an
 * ascended-tier one. Arriving upgraded skips 8 copies, which makes this the single most valuable
 * non-ascended outcome on the banner. Kept at 8% so it stays a genuinely good day rather than an
 * expectation.
 */
export const ELITE_UPGRADE_CHANCE = 0.08;

/**
 * Spark minted by one copy of a character already at `ascended-5`, by tier.
 *
 * Scaled by tier because that is what the copy was worth: an ascended-tier copy that arrives
 * with nowhere to go is a 2.5% result being spent on nothing, and it should convert like one.
 */
export const SPARK_PER_COPY = {
  common: 1,
  legendary: 3,
  ascended: 10,
} as const;

/**
 * The spark shop.
 *
 * Spark accrues only from copies of a character already at `ascended-5`, so it is still gated
 * behind maxing something. It is explicitly **not** the escape valve for early bad luck — pity
 * is.
 *
 * **It stopped being purely late-game overflow when ascension became copies-only, and the prices deliberately did
 * not move.** Maxing a common-tier character went from 216 base copies to 46, which is inside
 * what a single full climb of pulls delivers — so where spark was previously a currency almost
 * no player ever minted, it is now one they hold and spend. That is the intended outcome rather
 * than a side effect: an unspendable currency was doing nothing for anyone.
 *
 * Both kinds of offer exist because the two shortages are different. A player short of copies
 * needs `copy` offers to finish an ascension; a player who simply never saw a unit needs
 * `character` to get one at all. Pricing a targeted Elite copy well above a new character is
 * deliberate: breadth is cheap, and finishing a specific ladder is the expensive thing.
 *
 * ## Why the copy offers are priced 3 / 8 / 60
 *
 * One offer per tier, because the three tiers start on three different rungs. The ratios track
 * **how many pulls it takes to see one**, which is `TIER_WEIGHTS` divided by how many characters
 * share each tier — a specific ascended-tier character is roughly 3× scarcer than a specific
 * legendary-tier one and roughly 10× scarcer than a common-tier one. `banners.spec.ts` derives
 * that from the weights and the roster rather than restating it here.
 *
 * That is a different argument from the one these prices used to rest on, which was the fodder
 * exchange rate — an Elite copy was worth nine Rare ones, and 60:8 was that. Fodder was the only
 * mechanism that ever made copies of different characters interchangeable, so when it went there
 * was no rate left to quote and scarcity is what remains.
 */
export const SPARK_SHOP = [
  {
    id: 'common-copy',
    name: 'Common copy',
    description: 'A base copy of any common-tier character you already own.',
    kind: 'copy',
    rarity: 'common',
    cost: 3,
  },
  {
    id: 'rare-copy',
    name: 'Rare copy',
    description: 'A base copy of any legendary-tier character you already own.',
    kind: 'copy',
    rarity: 'rare',
    cost: 8,
  },
  {
    id: 'new-character',
    name: 'Recruit',
    description: 'Any character you do not yet own, at their starting rarity.',
    kind: 'character',
    cost: 40,
  },
  {
    id: 'elite-copy',
    name: 'Elite copy',
    description: 'An Elite copy of any ascended-tier character. The expensive shortage.',
    kind: 'copy',
    rarity: 'elite',
    cost: 60,
  },
] as const;

/**
 * The banners on offer.
 *
 * One for now. `bannerId` exists in the `pull()` signature and in the save from the start so
 * that adding a second — a faction banner, a rate-up — is content rather than a schema change.
 * Pity is **global**, not per-banner: splitting it is a monetisation pattern (it makes each new
 * banner a fresh 50-pull tax) and there is nothing here to monetise.
 */
export const BANNERS = [
  {
    id: 'standard',
    name: 'Standard Summon',
    description: 'Every character in the game, at the rates shown. Pity carries across banners.',
    /** Empty means the whole roster. A future banner narrows the pool with this. */
    pool: [],
  },
] as const;

/** The banner a new run opens on. */
export const DEFAULT_BANNER_ID = 'standard';
