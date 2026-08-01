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
 * Priced at 100 rather than 1 so the idle rate is a legible number: about 50 crystals an hour
 * at the top of the current ladder reads better on screen than 0.014 of a pull per second.
 */
export const PULL_COST = 100;

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
 * Worth far more than it looks: Elite is two rungs up a ladder whose bottom rungs cost the most
 * bodies, so this is the single most valuable non-ascended outcome on the banner. Kept at 8% so
 * it stays a genuinely good day rather than an expectation.
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
 * Spark only ever accrues *after* a character is maxed, so this is late-game overflow and is
 * priced as such. It is explicitly **not** the escape valve for early bad luck — pity is.
 *
 * Both kinds of offer exist because the two shortages are different. A player short of copies
 * needs `copy` offers to finish an ascension; a player who simply never saw a unit needs
 * `character` to get one at all. Pricing a targeted Elite copy well above a new character is
 * deliberate: breadth is cheap, and finishing a specific ladder is the expensive thing.
 */
export const SPARK_SHOP = [
  {
    id: 'rare-copy',
    name: 'Rare copy',
    description: 'A base copy of any character you already own. Ascension fodder, in bulk.',
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
