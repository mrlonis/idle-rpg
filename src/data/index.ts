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
 * Balance numbers live here rather than inside `core/` logic. Retuning a stage should never
 * mean editing the simulation.
 */
export { BRAN, MIRA, RIN, STARTER_TEAM } from './characters';
export { BANDIT, BOAR, GOLEM, SLIME, WARDEN, WISP } from './enemies';
export { STAGES } from './stages';
