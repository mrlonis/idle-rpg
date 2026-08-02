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
  BANNERS,
  DEFAULT_BANNER_ID,
  ELITE_UPGRADE_CHANCE,
  MULTI_PULL_COUNT,
  PITY,
  PULL_COST,
  SPARK_PER_COPY,
  SPARK_SHOP,
  TIER_WEIGHTS,
} from './banners';
export {
  AELRINDEL,
  AURELIA,
  AZRATHOTH,
  BRAN,
  CELIA,
  CHARACTERS,
  GNASH,
  ITHURIEL,
  KORRIN,
  LYSHA,
  MALAKAR,
  MIRA,
  MORTLACH,
  NEKROS,
  PYRA,
  RIN,
  RUK,
  SABLE,
  SEREN,
  SERAPHINE,
  STARTER_CHARACTER_IDS,
  STARTER_TEAM,
  THRAUN,
  VHAROK,
} from './characters';
export { BANDIT, BOAR, GOLEM, SLIME, WARDEN, WISP } from './enemies';
export { GROWTH, LEVEL_CURVE } from './levels';
export { STAGES } from './stages';
