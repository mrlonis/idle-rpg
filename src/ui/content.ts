import {
  type AscensionRules,
  type BannerData,
  type CharacterData,
  type CharacterLookup,
  type CombatRules,
  type CombatRulesData,
  type FactionData,
  type FactionLookup,
  type GachaRulesData,
  type GrowthData,
  type KitRulesData,
  type LevelCurveData,
  type ShopOfferData,
  type StageProgressData,
  toAmount,
  toCombatRules,
  toRates,
} from '../core';
import {
  ASCENSION_RULES,
  BANNERS,
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

/** How many stages are authored. `applyBattleResult` clamps progression against this. */
export const STAGE_COUNT = STAGES.length;

/**
 * What each stage unlocks, parsed once, in ladder order.
 *
 * `reconcileClearedStages` needs these on every load to rebuild the income *and* the first-clear
 * bonuses a returning run has already earned. Parsing them per load would be the same answer
 * computed from static content every time the app opens.
 */
export const STAGE_PROGRESS: readonly StageProgressData[] = STAGES.map((stage) => ({
  rates: toRates(stage.rates),
  firstClearSummons: toAmount(stage.firstClearSummons),
}));

/** A character definition by id, for templates that hold only an id. */
export function characterById(defId: string): CharacterData | undefined {
  return CHARACTERS_BY_ID.get(defId);
}

/** A faction's display name, falling back to its id if content no longer ships it. */
export function factionName(factionId: string): string {
  return FACTIONS_BY_ID.get(factionId)?.name ?? factionId;
}
