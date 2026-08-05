import {
  type AscensionRules,
  type BannerData,
  type ChapterCurveData,
  type ChapterData,
  type CharacterData,
  type CharacterLookup,
  type CombatRules,
  type CombatRulesData,
  type FactionData,
  type FactionLookup,
  type GachaRulesData,
  type GrowthData,
  type KitRulesData,
  type LadderShape,
  ladderShape,
  type LevelCurveData,
  resolveLadder,
  type ShopOfferData,
  type StageData,
  type StageRewardCurveData,
  type SummonRateCurve,
  toCombatRules,
} from '../core';
import {
  ASCENSION_RULES,
  BANNERS,
  CHAPTER_CURVE,
  CHAPTERS,
  CHARACTERS,
  COMBAT_RULES,
  ELITE_UPGRADE_CHANCE,
  FACTIONS,
  GROWTH,
  KIT_RULES,
  LEVEL_CURVE,
  PITY,
  PULL_COST,
  SPARK_PER_COPY,
  SPARK_SHOP,
  STAGE_REWARDS,
  SUMMON_RATE,
  TIER_WEIGHTS,
} from '../data';

/**
 * Where authored content meets the simulation.
 *
 * `core/` never imports `data/` — it takes content as arguments — so something has to hand one
 * to the other, and that something belongs in `ui/`, the only layer allowed to see both. This
 * is that seam and nothing else: it builds lookups, it does not decide anything.
 *
 * Everything here is module-level and built once. The content is static, immutable and known
 * at build time; rebuilding these maps per call would be work done thousands of times to
 * produce the same answer.
 */

/** Every playable character, keyed by id. */
export const CHARACTERS_BY_ID: CharacterLookup = new Map<string, CharacterData>(
  CHARACTERS.map((character) => [character.id, character]),
);

/**
 * Every faction, in the order they are authored.
 *
 * That order is the one the roster groups by — the four mortal factions of the matchup cycle,
 * then Monsters, then the two celestials — so a player who has learnt the cycle finds the same
 * shape on the roster screen. It is a list rather than a derived sort because there is no rule
 * that produces it; it is the order somebody chose.
 */
export const FACTIONS_IN_ORDER: readonly FactionData[] = FACTIONS;

/** Every faction, keyed by id. Faction is what decides a character's ascension ladder. */
export const FACTIONS_BY_ID: FactionLookup = new Map<string, FactionData>(
  FACTIONS.map((faction) => [faction.id, faction]),
);

/** The ascension ladders, in the shape `core/roster/` takes. */
export const ASCENSION: AscensionRules = ASCENSION_RULES;

/** The level curve and rarity level caps. */
export const LEVELS: LevelCurveData = LEVEL_CURVE;

/** Per-tier and per-ascension stat growth. */
export const GROWTH_RULES: GrowthData = GROWTH;

/** How many skills a tier may field, and which rung unlocks each one. */
export const KIT: KitRulesData = KIT_RULES;

/**
 * The combat rules, parsed once.
 *
 * Every battle reads the faction matrix, and parsing the authored list into a map per fight
 * would be the same answer recomputed from static content thousands of times over a balance
 * sweep. The typed local is also what makes a malformed matchup a compile error rather than a
 * silently neutral pairing.
 */
export const COMBAT: CombatRules = toCombatRules(COMBAT_RULES satisfies CombatRulesData);

/** Every banner, keyed by id. */
export const BANNERS_BY_ID: ReadonlyMap<string, BannerData> = new Map<string, BannerData>(
  BANNERS.map((banner) => [banner.id, banner]),
);

/** Everything that decides what a pull produces, assembled from the authored constants. */
export const GACHA_RULES: GachaRulesData = {
  pullCost: PULL_COST,
  tierWeights: TIER_WEIGHTS,
  pity: PITY,
  eliteUpgradeChance: ELITE_UPGRADE_CHANCE,
  sparkPerCopy: SPARK_PER_COPY,
};

/** The spark shop's offers, in the order they are displayed. */
export const SHOP_OFFERS: readonly ShopOfferData[] = SPARK_SHOP;

/** Every chapter, in the order they are climbed. */
export const CHAPTERS_IN_ORDER: readonly ChapterData[] = CHAPTERS;

/** How long a chapter is, and where its mini-bosses fall. */
export const CHAPTER_RULES: ChapterCurveData = CHAPTER_CURVE;

/** What a stage pays, as coefficients over its position on the ladder. */
export const STAGE_REWARD_CURVE: StageRewardCurveData = STAGE_REWARDS;

/**
 * The ladder this build ships, as the length of each chapter.
 *
 * All `core/` ever needs of the chapters: progression is arithmetic over lengths, and nothing in
 * the simulation cares what a chapter is called. It is the *authored* lengths rather than
 * {@link CHAPTER_RULES} evaluated, deliberately — the formula says how long a chapter should be,
 * and a build that ships two chapters must not be talked into believing it has a hundred.
 */
export const LADDER: LadderShape = ladderShape(CHAPTERS_IN_ORDER);

/**
 * Every stage in the game, flattened into ladder order and resolved against the reward curve.
 *
 * Built once at module scope. The encounters are authored in `data/` and what they pay is a
 * function of where they sit, so something has to put the two together — and this file is that
 * seam. Doing it per battle would be the same answer recomputed from static content thousands of
 * times over an auto-battle evening.
 *
 * The typed local is what makes a malformed encounter a compile error rather than a stage the
 * simulation quietly fails to parse.
 */
export const STAGES: readonly StageData[] = resolveLadder(
  CHAPTERS_IN_ORDER,
  CHAPTER_RULES,
  STAGE_REWARD_CURVE,
);

/**
 * How the idle crystal rate is earned: a flat base, plus a step per stage first cleared.
 *
 * The one rate that is not in {@link STAGE_REWARD_CURVE}, because it is a function of the clear
 * count rather than of a stage — `applyBattleResult` and `reconcileClearedStages` both derive it
 * from `clearedStages`, and both need this to do it. The typed local is what makes a malformed
 * curve a compile error.
 */
export const SUMMON_RATE_CURVE: SummonRateCurve = SUMMON_RATE;

/** A character definition by id, for templates that hold only an id. */
export function characterById(defId: string): CharacterData | undefined {
  return CHARACTERS_BY_ID.get(defId);
}

/** A faction's display name, falling back to its id if content no longer ships it. */
export function factionName(factionId: string): string {
  return FACTIONS_BY_ID.get(factionId)?.name ?? factionId;
}
