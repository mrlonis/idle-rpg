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
  OFFLINE_CAP_MS,
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
export { type AnySaveData, type CurrentSaveData, type SaveDataV1 } from './save/schema';
export {
  fromSaveData,
  toSaveData,
  type RepairIssue,
  type RepairOptions,
  type RepairResult,
} from './save/serialize';
export { SAVE_VERSION } from './save/version';
export { newGame, stampSaveTime, type GameState, type NewGameOptions } from './state';
export { tick } from './tick';
