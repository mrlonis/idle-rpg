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
   * The UI **must not** overwrite the primary save slot when this is set — the existing
   * bytes are the player's only copy, and a future-versioned save (from a newer build)
   * becomes readable again as soon as they update.
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
