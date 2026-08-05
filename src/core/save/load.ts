import { type GameState, newGame } from '../state';
import { migrate } from './migrate';
import { fromSaveData, type RepairIssue, type RepairOptions } from './serialize';

export interface LoadResult {
  readonly state: GameState;
  /** Fields that were damaged and recovered. Empty on a clean load. */
  readonly issues: readonly RepairIssue[];
  /**
   * Set when the save could not be used at all and `state` is a fresh run.
   *
   * ## It reports, and no longer forbids
   *
   * This used to mean "the UI must not overwrite the primary slot": the bytes were the player's
   * only copy, and a future-versioned save from a newer build becomes readable again as soon as
   * they update. That protection is retired along with the v0 reset, and the trade is worth being
   * explicit about — **a save this build cannot read is now replaced by the fresh run that
   * replaced it.** What it bought was a run that survives a downgrade; what it cost was a game
   * that boots, plays, and silently never writes anything down, which is the worse failure of the
   * two and the one a player would actually hit.
   *
   * Two jobs remain, and both are worth keeping:
   *
   * - **The backup slot is still tried first.** `SaveService.load` only falls through to a fresh
   *   run once the backup is unreadable too, so a corrupted primary costs nothing.
   * - **The player is told.** The home screen says the run is fresh because the save could not be
   *   read, which is the difference between a bug you can report and a run that just vanished.
   */
  readonly fatal?: string;
}

/**
 * The never-throwing entry point for loading a save.
 *
 * Order matters: migrate the raw JSON shape first, then decode and repair. Migrations are
 * written against historical shapes, so they have to run before anything tries to
 * interpret fields.
 */
export function loadSave(raw: unknown, options: RepairOptions): LoadResult {
  if (raw === undefined || raw === null) {
    return { state: newGame({ seed: options.fallbackSeed, nowMs: options.nowMs }), issues: [] };
  }

  let migrated: unknown;
  try {
    migrated = migrate(raw);
  } catch (error) {
    return {
      state: newGame({ seed: options.fallbackSeed, nowMs: options.nowMs }),
      issues: [],
      fatal: error instanceof Error ? error.message : String(error),
    };
  }

  const { state, issues } = fromSaveData(migrated, options);
  return { state, issues };
}

/**
 * Parses save text and loads it. Malformed JSON is treated the same as a missing save:
 * report it as fatal and hand back a fresh run rather than throwing at the caller.
 */
export function loadSaveText(text: string | null | undefined, options: RepairOptions): LoadResult {
  if (text === null || text === undefined || text.trim() === '') {
    return { state: newGame({ seed: options.fallbackSeed, nowMs: options.nowMs }), issues: [] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      state: newGame({ seed: options.fallbackSeed, nowMs: options.nowMs }),
      issues: [],
      fatal: `Save is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  return loadSave(parsed, options);
}
