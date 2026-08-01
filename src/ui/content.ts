import {
  type AscensionRules,
  type BannerData,
  type CharacterData,
  type CharacterLookup,
  type FactionData,
  type FactionLookup,
  type GachaRulesData,
  type GrowthData,
  type LevelCurveData,
  type ShopOfferData,
} from '../core';
import {
  ASCENSION_RULES,
  BANNERS,
  CHARACTERS,
  ELITE_UPGRADE_CHANCE,
  FACTIONS,
  GROWTH,
  LEVEL_CURVE,
  PITY,
  PULL_COST,
  SPARK_PER_COPY,
  SPARK_SHOP,
  STAGES,
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

/** How many stages are authored. `applyBattleResult` clamps progression against this. */
export const STAGE_COUNT = STAGES.length;

/** A character definition by id, for templates that hold only an id. */
export function characterById(defId: string): CharacterData | undefined {
  return CHARACTERS_BY_ID.get(defId);
}

/** A faction's display name, falling back to its id if content no longer ships it. */
export function factionName(factionId: string): string {
  return FACTIONS_BY_ID.get(factionId)?.name ?? factionId;
}
