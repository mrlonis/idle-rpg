/**
 * The public surface of the game's content.
 *
 * `data/` is **plain data only**: no logic, no functions, and no imports from `core/` or `ui/`.
 * Quantities are numbers or strings rather than `Numeric`, so every stat block here is
 * JSON-expressible and could be loaded from a file without changing a line of the simulation.
 *
 * The dependency rule runs one way. `ui/` composes content with `core/`; `core/` receives
 * content as arguments, which is what lets the simulation be driven with test fixtures instead
 * of shipped stages, and is enforced by `no-restricted-imports` in `eslint.config.js`.
 *
 * Balance numbers live here rather than inside `core/` logic. Retuning a stage, a pull rate, a
 * level cost or an ascension rung should never mean editing the simulation.
 */
export { ASCENSION_RULES, CELESTIAL_LADDER, FACTIONS, MORTAL_LADDER } from './ascension';
export {
  BASIC_ATTACK,
  COMBAT_RULES,
  FACTION_MATCHUPS,
  LINEUP_BONUSES,
  LINEUP_INJURED_BELOW,
  LINEUP_TIERS,
  MAX_PENETRATION,
  MIN_HIT_CHANCE,
  ROW_BONUSES,
} from './combat';
export {
  BANNERS,
  DEFAULT_BANNER_ID,
  ELITE_UPGRADE_CHANCE,
  MULTI_PULL_COUNT,
  PITY,
  PULL_COST,
  SPARK_PER_COPY,
  SPARK_SHOP,
  SUMMON_RATE,
  TIER_WEIGHTS,
} from './banners';
export {
  AELRINDEL,
  AURELIA,
  AZRATHOTH,
  BRAN,
  CELIA,
  CHARACTERS,
  CIRIEN,
  DORN,
  FAELEN,
  GHAUL,
  GHORRAK,
  GNASH,
  GRIMNA,
  HALRIC,
  HEDDA,
  ILYRA,
  ITHURIEL,
  IVO,
  KARSITH,
  KORRIN,
  LYSHA,
  MALAKAR,
  MIRA,
  MORTLACH,
  NAEL,
  NAERIN,
  NEKROS,
  NYXARA,
  ORIN,
  OSSUARY,
  OZZA,
  PYRA,
  RAZIEL,
  RIN,
  RUK,
  SABLE,
  SANGUINE,
  SEREN,
  SERAPHINE,
  SKARN,
  STARTER_FORMATION,
  SYLVARA,
  THRAUN,
  THREX,
  VESPER,
  VEXIS,
  VHAROK,
  WREN,
  YERRIK,
  YSOLDE,
  ZAPHIEL,
} from './characters';
export {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  ENEMIES,
  GOLEM,
  HAG,
  PYRE,
  RIMEPLATE,
  SHADE,
  SLIME,
  WARDEN,
  WISP,
} from './enemies';
export { GEAR_GRADES, GEAR_PROFILES, GEAR_RULES } from './gear';
export { KIT_RULES } from './kits';
export { GROWTH, LEVEL_CURVE } from './levels';
export { SKILLS } from './skills';
export { CHAPTER_1 } from './chapter-1';
export { CHAPTER_2 } from './chapter-2';
export { AUTO_BATTLE_UNLOCK_CLEARS, CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
export { STATUSES } from './statuses';
