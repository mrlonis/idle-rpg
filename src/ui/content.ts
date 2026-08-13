import {
  type AchievementTrackData,
  type ActivityData,
  type AscensionRules,
  type BannerData,
  type ChapterCurveData,
  type ChapterData,
  type CharacterData,
  type CharacterLookup,
  type CombatRules,
  type CombatRulesData,
  type DescentEncounterData,
  type DescentFamilyData,
  type DescentRulesData,
  type EmblemDropData,
  type FactionData,
  type FactionLookup,
  type GachaRulesData,
  type GearRulesData,
  type GrowthData,
  type IdleRateCurves,
  type KitRulesData,
  type LadderShape,
  ladderShape,
  type OwnedCharacter,
  type BountyBoardRulesData,
  type BountyData,
  type LevelCurveData,
  matchedStageIndex,
  type QuestCounter,
  type QuestData,
  type QuestRulesData,
  resolveLadder,
  resolveTower,
  type ShopOfferData,
  signatureBonus,
  signatureTier,
  signatureUnlocked,
  clampSignatureLevel,
  type SignatureAward,
  type SignatureItemData,
  type SignatureLookup,
  type SignatureRulesData,
  type StageData,
  stagePayout,
  type StageRewardCurveData,
  type SummonRateCurve,
  toCombatRules,
  type TowerData,
  type TowerRulesData,
} from '../core';
import {
  ACHIEVEMENTS,
  ACTIVITIES,
  ASCENSION_RULES,
  BOUNTIES,
  BOUNTY_BOARD,
  BANNERS,
  CHAPTER_CURVE,
  CHAPTERS,
  CHARACTERS,
  COMBAT_RULES,
  DESCENT_BOARDS,
  DESCENT_FAMILIES,
  DESCENT_RULES,
  ELITE_UPGRADE_CHANCE,
  EMBLEM_DROPS,
  EMBLEM_RATE,
  FACTIONS,
  GEAR_RULES,
  GROWTH,
  KIT_RULES,
  LEVEL_CURVE,
  PITY,
  PULL_COST,
  QUEST_RULES,
  QUESTS,
  SIGNATURE_ITEMS,
  SIGNATURE_RULES,
  SPARK_PER_COPY,
  SPARK_SHOP,
  STAGE_REWARDS,
  SUMMON_RATE,
  TIER_WEIGHTS,
  TOWER_RULES,
  TOWERS,
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

/**
 * The achievement tracks this build ships, in the order the screen lists them.
 *
 * A typed local for the reason everything else here is one: `data/` cannot reference `core/`, so
 * this assignment is what turns a track naming a counter nothing keeps into a compile error.
 */
export const ACHIEVEMENT_TRACKS: readonly AchievementTrackData[] = ACHIEVEMENTS;

/**
 * Everything a run can send a crew at, in the order the formations screen lists them.
 *
 * The campaign first and the towers after it, which is also the order Home draws them: the
 * campaign is the spine and a tower is somewhere a player goes with a roster they have built.
 *
 * The typed local is what turns an activity naming a faction that does not exist, or a `kind`
 * nothing handles, into a compile error rather than a locked door with no key.
 */
export const ACTIVITY_LIST: readonly ActivityData[] = ACTIVITIES;

/** Every activity, keyed by id — which is also its {@link GameState.formations} key. */
export const ACTIVITIES_BY_ID: ReadonlyMap<string, ActivityData> = new Map<string, ActivityData>(
  ACTIVITY_LIST.map((activity) => [activity.id, activity]),
);

/**
 * Every mission the board can ever offer, in tier order — shortest first.
 *
 * ⚠️ **The whole pool, not a day's board.** `dailyBoard` narrows this to one variant per tier;
 * everything that has to honour a *running* mission — `repairDispatches`, `collectReadyBounties`,
 * the tier guard in `dispatchBounty` — takes this instead, because a 24-hour campaign outlives the
 * board it was sent from.
 */
export const BOUNTY_LIST: readonly BountyData[] = BOUNTIES;

/** When the bounty board rotates. The same boundary the quest windows use. */
export const BOUNTY_BOARD_RULES: BountyBoardRulesData = BOUNTY_BOARD;

/** The daily and weekly quests this build ships, in the order the screen lists them. */
export const QUEST_LIST: readonly QuestData[] = QUESTS;

/** Where the quest day and week roll over. */
export const QUEST_WINDOW_RULES: QuestRulesData = QUEST_RULES;

/**
 * The counters a quest window takes a baseline of.
 *
 * Derived from the shipped quests rather than listed, so a quest over a counter nobody baselined
 * cannot ship — that quest would read the counter's whole lifetime total as today's progress and
 * complete itself the moment the window opened.
 */
export const QUEST_COUNTERS: readonly QuestCounter[] = [
  ...new Set(QUEST_LIST.map((quest) => quest.counter)),
];

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
 * The grade ladder, the stat profiles, and every gear price.
 *
 * The typed local is what turns a malformed profile into a compile error rather than a slot that
 * silently contributes nothing — which is the failure mode a percentage table has, since a missing
 * entry and a zero entry produce the same combatant.
 */
export const GEAR: GearRulesData = GEAR_RULES;

/**
 * The faction ids a dropped or stocked piece may be aligned to.
 *
 * Derived from {@link FACTIONS_IN_ORDER} rather than listed, so adding a faction widens the drop
 * table without anybody remembering to. It is the ids alone because that is all `core/gear/` needs:
 * alignment is compared against a character's `faction` string and never rendered from here.
 */
export const GEAR_ALIGNMENTS: readonly string[] = FACTIONS_IN_ORDER.map((faction) => faction.id);

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
 * The enemy level of every stage on the ladder, in ladder order.
 *
 * Exists for {@link matchedStageIndex} and nothing else: a tower floor's lump and its gear grades are
 * read off the campaign at the stage that fights at the **same level**, which is what stops floor 100
 * (level 60) from being paid what stage 100 (level 85) is paid.
 */
export const CAMPAIGN_LEVELS: readonly number[] = STAGES.map((stage) => stage.level);

/**
 * How every tower is shaped: its height, its level line, its rhythm and its crystals.
 *
 * The typed local is what makes a malformed rule a compile error — the same job {@link CHAPTER_RULES}
 * does for the chapters.
 */
export const TOWER_SHAPE: TowerRulesData = TOWER_RULES;

/**
 * The towers this build ships, in the order the screens list them.
 *
 * The typed local is what turns a floor naming an enemy nothing ships, or a rank wider than the
 * board, into a compile error rather than a floor the simulation quietly fails to parse.
 */
export const TOWER_LIST: readonly TowerData[] = TOWERS;

/** Every tower, keyed by id — which is also its `GameState.towers` and `formations` key. */
export const TOWERS_BY_ID: ReadonlyMap<string, TowerData> = new Map<string, TowerData>(
  TOWER_LIST.map((tower) => [tower.id, tower]),
);

/**
 * Where a resolved tower floor sits: which tower, how high, and what the campaign pays for it.
 *
 * `matchedStage` is the **campaign** index this floor's level matches, and it is carried rather than
 * recomputed because two things read it — the lump, already folded into {@link stage}, and the gear
 * grade weights, which `applyTowerResult` needs at drop time.
 */
export interface TowerFloor {
  readonly tower: TowerData;
  /** 1-based, and always inside the tower's authored floors. */
  readonly floor: number;
  readonly stage: StageData;
  readonly matchedStage: number;
}

/**
 * Every floor of every tower, resolved once at module scope exactly as {@link STAGES} is.
 *
 * The floors are content and what they pay is a function of the level they fight at, so something
 * has to put the two together — and this file is that seam. Doing it per battle would be the same
 * answer recomputed from static content for every floor of an auto-battled climb.
 */
export const TOWER_FLOORS: ReadonlyMap<string, readonly TowerFloor[]> = new Map(
  TOWER_LIST.map((tower) => [
    tower.id,
    resolveTower(
      tower,
      TOWER_SHAPE,
      (level) => stagePayout(STAGE_REWARD_CURVE, matchedStageIndex(CAMPAIGN_LEVELS, level)).reward,
    ).map((stage, offset) => ({
      tower,
      floor: offset + 1,
      stage,
      matchedStage: matchedStageIndex(CAMPAIGN_LEVELS, stage.level),
    })),
  ]),
);

/**
 * Every tower floor, keyed by the stage id it carries.
 *
 * What `BattleService.settle` looks a finished fight up in. It reads the stage back **off the
 * result** rather than remembering which floor it started — the animation can be a minute of
 * playback later, and a field set at the top of `fight` is one more thing that has to still be true
 * by then. Also what tells a tower fight from a campaign one: a stage id in here is a floor.
 */
export const TOWER_FLOOR_BY_STAGE: ReadonlyMap<string, TowerFloor> = new Map(
  [...TOWER_FLOORS.values()].flat().map((floor) => [floor.stage.id, floor]),
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

/**
 * The rates derived from **how far the run has come** rather than authored per stage.
 *
 * Crystals step per stage cleared and emblems per whole chapter, and both are evaluated by
 * `applyBattleResult` and `reconcileClearedStages`. Bundled because both of those need all of it —
 * it was a bare `SummonRateCurve` argument until emblems made it two curves, which is exactly the
 * growth the bundle exists to absorb.
 */
export const IDLE_RATE_CURVES: IdleRateCurves = {
  summons: SUMMON_RATE_CURVE,
  emblem: EMBLEM_RATE,
};

/**
 * How often a clear drops an emblem, and what gates it.
 *
 * ⚠️ **This is much the larger of the two emblem faucets, which is the opposite of how it reads.**
 * The idle rate is the one with the pacing argument attached, but auto-battle clears roughly a
 * stage a minute — and the stage it grinds is the **last** one, which is a chapter boss, because
 * the campaign position stops climbing so the top stage stays farmable. That is the 25% row.
 * Retuning these is an economy change of the same size as retuning the rate. See
 * [`data/emblems.ts`](../data/emblems.ts).
 */
export const EMBLEM_DROP_RULES: EmblemDropData = EMBLEM_DROPS;

/**
 * How the Descent is shaped: its floors, its lock, its level shares and every payout.
 *
 * The typed local is what makes a malformed rank ladder or a missing level share a compile error —
 * the same job {@link TOWER_SHAPE} does for the towers.
 */
export const DESCENT: DescentRulesData = DESCENT_RULES;

/**
 * Every card family the Descent may offer, universal first.
 *
 * The typed local is what turns a family with a short rung list, or a rung naming a stat nothing
 * reads, into a compile error rather than a card that is offered and pays nothing.
 */
export const DESCENT_CARDS: readonly DescentFamilyData[] = DESCENT_FAMILIES;

/**
 * Every board the Descent may draw, which is deliberately more than a day uses.
 *
 * The typed local is what turns a board naming an enemy nothing ships, or a rank wider than the
 * board, into a compile error — the same job {@link TOWER_LIST} does for a floor.
 */
export const DESCENT_POOL: readonly DescentEncounterData[] = DESCENT_BOARDS;

/**
 * Every Descent board, keyed by the stage id it carries.
 *
 * What `BattleService.settle` looks a finished fight up in, and what tells a Descent fight from a
 * campaign one — the same job {@link TOWER_FLOOR_BY_STAGE} does for a floor. It reads the stage back
 * **off the result** rather than remembering which fight it started, because the animation can be a
 * minute of playback later.
 */
export const DESCENT_BOARD_BY_STAGE: ReadonlyMap<string, DescentEncounterData> = new Map(
  DESCENT_POOL.map((board) => [board.id, board]),
);

/** When a signature item unlocks, how far it goes, and what a level costs. */
export const SIGNATURE: SignatureRulesData = SIGNATURE_RULES;

/**
 * Every signature item, keyed by the character it belongs to.
 *
 * A map rather than the list, because every read is "does this character have one" — the sheet
 * asks it once per character and the battle path once per crew member per fight.
 */
export const SIGNATURE_BY_DEF: SignatureLookup = new Map<string, SignatureItemData>(
  SIGNATURE_ITEMS.map((item) => [item.defId, item]),
);

/**
 * What a character's signature item contributes to a fight, or nothing when it contributes
 * nothing.
 *
 * The one place eligibility is resolved for the battle path, and it returns `undefined` in three
 * different situations that are worth keeping distinct in one's head even though the simulation
 * treats them identically: this build ships no item for the character, the character is not
 * ascended tier or not yet at `mythic`, or the item is authored but has never been levelled.
 *
 * ⚠️ **A stored level on an ineligible character reads as nothing here rather than being repaired
 * away.** `repairOwned` deliberately keeps the number — the emblems were spent — so this is the
 * gate that makes it inert. Both halves are needed: repairing would take back an investment, and
 * not gating would let a hand-edited save field an ability the rules do not allow.
 */
export function signatureAward(
  character: CharacterData,
  owned: OwnedCharacter,
): SignatureAward | undefined {
  const item = SIGNATURE_BY_DEF.get(character.id);
  if (item === undefined || !signatureUnlocked(SIGNATURE, character.tier, owned.rarity)) {
    return undefined;
  }
  const level = clampSignatureLevel(SIGNATURE, owned.signature);
  if (level <= 0) {
    return undefined;
  }
  return {
    bonus: signatureBonus(SIGNATURE, item, level),
    tier: signatureTier(SIGNATURE, item, level),
  };
}

/** A character definition by id, for templates that hold only an id. */
export function characterById(defId: string): CharacterData | undefined {
  return CHARACTERS_BY_ID.get(defId);
}

/** A faction's display name, falling back to its id if content no longer ships it. */
export function factionName(factionId: string): string {
  return FACTIONS_BY_ID.get(factionId)?.name ?? factionId;
}

/**
 * Several factions, as one readable clause: `Dwarves`, or `Elves, Angels and Demons`.
 *
 * ⚠️ **One helper rather than a sentence per activity kind.** A tower's lock names one faction and
 * the Descent's names three; the only thing that differs between the two sentences is the list, so
 * every screen that draws a lock reads this and none of them has to ask what kind of content it is
 * looking at — the same call `StageHeading` makes by carrying a rendered position.
 */
export function factionList(factionIds: readonly string[]): string {
  const names = factionIds.map(factionName);
  if (names.length <= 1) {
    return names[0] ?? '';
  }
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
