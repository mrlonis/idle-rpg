/**
 * The public surface of the game simulation.
 *
 * `ui/` imports from here. Nothing in `core/` imports from `ui/`, Angular, Capacitor, or
 * any DOM API — the whole module graph runs headless in Node, which is what makes balance
 * testable by simulating thousands of hours instead of playing them.
 *
 * **Snapshotting for the UI:** every core function returns a new state and never mutates
 * its argument, so the UI can hold a returned state directly as its snapshot. Do not run it
 * through `structuredClone` — `Numeric` values are `Decimal` instances, and
 * `structuredClone` strips the prototype, leaving a plain `{ mantissa, exponent }` object
 * whose `.add()` throws at the next tick. The copy is unnecessary given purity and actively
 * breaks the numbers.
 */
export {
  ATB_THRESHOLD,
  BATTLE_TICK_MS,
  MAX_BATTLE_TICKS,
  ticksToMs,
  ticksUntilReady,
} from './battle/clock';
export {
  applyRowBonus,
  MAX_ACCURACY,
  MAX_PENETRATION,
  MAX_RESIST,
  matchupKey,
  ticksPerAction,
  toAmount,
  toCombatant,
  toCombatRules,
  toCombatStats,
  toCurrencyAmounts,
  toRates,
  toSkill,
} from './battle/content';
export { clampEnergy, isCharged, MAX_ENERGY, toEnergyRules } from './battle/energy';
export {
  applyLineupBonus,
  isNeutralLineup,
  lineupBonus,
  NO_LINEUP,
  NO_LINEUP_BONUS,
  toLineupRules,
} from './battle/lineup';
export {
  baseDamage,
  critChance,
  critMultiplier,
  effectiveDefence,
  factionMultiplier,
  hitChance,
  resistedShare,
  rollAttack,
  statusChance,
  type AttackRoll,
} from './battle/damage';
export {
  applyBattleResult,
  reconcileClearedStages,
  type StageProgressData,
} from './battle/progress';
export { battleSeed, simulateBattle } from './battle/simulate';
export { chooseSkill, selectTargets, type FighterView } from './battle/skills';
export {
  absorbDamage,
  applyStatus,
  cleanseStatuses,
  effectiveStats,
  isStunned,
  nextExpiry,
  partitionExpired,
  shieldTotal,
  statModifier,
  toActiveStatus,
} from './battle/status';
export {
  ROWS,
  type ActiveStatus,
  type AuthoredAmount,
  type AuthoredCurrencies,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type BattleReward,
  type Combatant,
  type CombatantData,
  type CombatantSnapshot,
  type CombatRules,
  type CombatRulesData,
  type CombatStats,
  type DamageType,
  type FactionMatchupData,
  type FormationData,
  type LineupBonus,
  type LineupLadderStepData,
  type LineupRules,
  type LineupRulesData,
  type LineupSummary,
  type LineupTierData,
  type LineupTierMatch,
  type ModifiableStat,
  type Row,
  type RowBonusData,
  type Side,
  type Skill,
  type EnergyRules,
  type EnergyRulesData,
  type SkillConditionData,
  type SkillData,
  type SkillEffectData,
  type SkillTarget,
  type StageData,
  type StatBlockData,
  type StatusData,
} from './battle/types';
export {
  accrue,
  canAfford,
  credit,
  CURRENCY_IDS,
  debit,
  emptyWallet,
  isEmpty,
  parseRates,
  parseWallet,
  raiseRates,
  RATE_CURRENCY_IDS,
  serializeRates,
  serializeWallet,
  summonRatePerSecond,
  withSummonRate,
  zeroRates,
  type CurrencyAmounts,
  type CurrencyId,
  type RateCurrencyId,
  type Rates,
  type SummonRateCurve,
  type Wallet,
} from './currency';
export { ascendedChance, pull } from './gacha/pull';
export {
  isEligible,
  offerTargets,
  purchase,
  type ShopFailure,
  type ShopOfferData,
  type ShopResult,
} from './gacha/shop';
export {
  type BannerData,
  type GachaRulesData,
  type PityRulesData,
  type PullFailure,
  type PullOutcome,
  type PullResult,
} from './gacha/types';
export {
  ascend,
  autoFodderPlan,
  fodderPool,
  fodderValue,
  nextAscension,
  pathFor,
  type AscensionPlan,
  type FactionLookup,
  type FodderOption,
} from './roster/ascend';
export {
  kitSlots,
  nextSkillUnlock,
  ordinaryUnlock,
  skillCeiling,
  unlockedSkills,
  type KitRulesData,
  type KitSlot,
} from './roster/kit';
export {
  canLevelUp,
  clampLevel,
  cumulativeLevelCost,
  levelCapFor,
  levelCost,
  maxAffordableLevel,
  type CostTermData,
  type LevelCurveData,
} from './roster/level';
export {
  ascensionCost,
  clampRarityIndex,
  copyCost,
  fodderBaseCopies,
  fullAscensionCost,
  rarityAt,
  rarityFamily,
  rarityIndex,
  rarityLabel,
  startRarityIndex,
} from './roster/rarity';
export {
  effectiveLevel,
  isResonated,
  maxAffordableResonance,
  resonanceAnchors,
  resonanceCeiling,
  resonanceFloor,
  resonancePlan,
  type ResonancePlan,
  type ResonanceRaise,
} from './roster/resonance';
export {
  benchMember,
  findOwned,
  grantCopies,
  grantStarters,
  levelUp,
  levelUpToAffordable,
  placeInRow,
  raiseResonance,
  raiseResonanceToAffordable,
  repairOwned,
  setFormation,
  withoutMember,
  type CharacterLookup,
  type RosterFailure,
  type RosterResult,
} from './roster/roster';
export { growthMultiplier, scaleStats, toBattleCombatant, type GrowthData } from './roster/stats';
export {
  CHARACTER_TIERS,
  MAX_RARITY_INDEX,
  RARITIES,
  RARITY_FAMILIES,
  type AscensionLadder,
  type AscensionPath,
  type AscensionRequirement,
  type AscensionRules,
  type AscensionScope,
  type CharacterData,
  type CharacterRole,
  type CharacterTier,
  type CopyCost,
  type FactionData,
  type OwnedCharacter,
  type RarityFamily,
  type RarityId,
} from './roster/types';
export {
  Decimal,
  isUsable,
  num,
  ONE,
  parseOr,
  serialize as serializeNumeric,
  tryParse,
  ZERO,
  type Numeric,
} from './numeric';
export {
  accrueDiscrete,
  EMPTY_OFFLINE_REPORT,
  MIN_PLAUSIBLE_TICK_MS,
  paidNothing,
  resume,
  type DiscreteAccrual,
  type OfflineReport,
} from './offline';
export { deriveSeed, derivedStream, resumeStream, type RngState, type RngStream } from './rng';
export { loadSave, loadSaveText, type LoadResult } from './save/load';
export {
  FutureSaveVersionError,
  migrate,
  MIGRATIONS,
  UnknownSaveVersionError,
  type Migration,
  type RawSave,
} from './save/migrate';
export {
  type AnySaveData,
  type CurrentSaveData,
  type SaveDataV1,
  type SaveDataV2,
  type SaveDataV3,
  type SaveDataV4,
} from './save/schema';
export {
  fromSaveData,
  toSaveData,
  type RepairIssue,
  type RepairOptions,
  type RepairResult,
} from './save/serialize';
export { SAVE_VERSION } from './save/version';
export {
  BACK_ROW_SIZE,
  emptyFormation,
  formationMembers,
  formationSize,
  FRONT_ROW_SIZE,
  newGame,
  PARTY_SIZE,
  rowCapacity,
  stampSaveTime,
  type GameState,
  type NewGameOptions,
  type PartyFormation,
} from './state';
export { tick } from './tick';
