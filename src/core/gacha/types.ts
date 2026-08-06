import { type CharacterTier } from '../roster/types';
import { type GameState } from '../state';

/**
 * The gacha vocabulary. Shapes here, numbers in `data/banners.ts`, drawing in `pull.ts`.
 */

/** A banner as authored in `data/`. */
export interface BannerData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /**
   * Character ids this banner can produce. **Empty means the whole roster** — the standard
   * banner, and the reason a narrowed pool is content rather than a new code path.
   */
  readonly pool: readonly string[];
}

/** One pity curve, as authored in `data/`. */
export interface PityCurveData {
  /** The last pull still at the base rate. Every pull after this one adds `softPityStep`. */
  readonly softPityStart: number;
  readonly softPityStep: number;
  /** The pull at which the tier this curve guards is guaranteed outright. */
  readonly hardPity: number;
}

/**
 * The two pity curves.
 *
 * **Two counters, two cycles, and the shorter one is not a weaker copy of the longer.** They guard
 * different promises: {@link ascended} is "the top tier is never further away than this", and
 * {@link legendary} is "a pull is never a long run of nothing". A player on a bad streak feels the
 * second one long before the first, which is why a single counter could not do both jobs — an
 * ascended cycle short enough to also bound dry spells would have made the top tier routine.
 *
 * Both count **the tier or better**: an ascended-tier result clears both, because it is not a miss
 * on the legendary promise.
 */
export interface PityRulesData {
  /** Pulls since the last ascended-tier character. */
  readonly ascended: PityCurveData;
  /** Pulls since the last character of legendary tier **or better**. */
  readonly legendary: PityCurveData;
}

/** Everything that decides what a pull produces. */
export interface GachaRulesData {
  /** Summon crystals per single pull. */
  readonly pullCost: number;
  /** Pre-pity tier weights. Need not sum to 1 — they are normalised. */
  readonly tierWeights: Readonly<Record<CharacterTier, number>>;
  readonly pity: PityRulesData;
  /** Chance a legendary-tier result arrives at Elite rather than its usual Rare. */
  readonly eliteUpgradeChance: number;
  /** Spark minted per copy of a character already at `ascended-5`, by tier. */
  readonly sparkPerCopy: Readonly<Record<CharacterTier, number>>;
}

/** What one pull produced. */
export interface PullResult {
  readonly defId: string;
  readonly name: string;
  readonly tier: CharacterTier;
  /**
   * The ladder index this copy is worth.
   *
   * Usually the tier's starting rarity. Higher when a legendary-tier result was upgraded to
   * Elite, which is the best non-ascended outcome on the banner.
   */
  readonly rarity: number;
  /** `true` when the player did not already own this character. */
  readonly isNew: boolean;
  /** Base copies added to the roster. Zero when the character was already at `ascended-5`. */
  readonly copies: number;
  /** Spark minted because the character had nothing left to ascend. */
  readonly spark: number;
  /** The ascended pity counter after this pull. Zero when this pull produced an ascended-tier result. */
  readonly pity: number;
  /**
   * The legendary pity counter after this pull.
   *
   * Zero whenever this pull produced legendary tier **or better** — an ascended-tier result clears
   * this counter too, because it is not a miss on the promise this one makes.
   */
  readonly legendaryPity: number;
  /**
   * `true` when this result was certain before it was drawn.
   *
   * Covers both curves, and both the soft ramp reaching 100% and the hard cap firing — from the
   * player's side those are the same event, and the screen labels it the same way.
   */
  readonly wasGuaranteed: boolean;
}

/** Why a pull could not be made. */
export type PullFailure = 'unknown-banner' | 'empty-pool' | 'insufficient-currency' | 'bad-count';

export type PullOutcome =
  | { readonly ok: true; readonly state: GameState; readonly results: readonly PullResult[] }
  | { readonly ok: false; readonly reason: PullFailure };
