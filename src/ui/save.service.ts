import { Service } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  type GameState,
  loadSaveText,
  type LoadResult,
  type RepairIssue,
  type RepairOptions,
  toSaveData,
} from '../core';
import { CHARACTERS_BY_ID, LEVELS } from './content';

const PRIMARY_KEY = 'save';
const BACKUP_KEY = 'save.bak';

/**
 * What the repair pass needs to check a save against the content this build ships.
 *
 * A fresh seed per call is correct even though only one can ever be adopted: it is used solely
 * when the save has no usable seed of its own, and the two load attempts below are alternatives
 * rather than a sequence.
 */
function repairOptions(nowMs: number): RepairOptions {
  return {
    fallbackSeed: makeSeed(),
    nowMs,
    characters: CHARACTERS_BY_ID,
    levelCurve: LEVELS,
  };
}

/**
 * Persistence for the run.
 *
 * `@capacitor/preferences` rather than `localStorage`: on iOS, WKWebView local storage
 * lives in a cache-class container that the OS can purge under storage pressure, and
 * players have lost runs that way. Preferences is backed by `UserDefaults` on iOS and
 * `SharedPreferences` on Android, survives eviction, and is included in device backups. Its
 * web implementation keeps `ng serve` working in the browser.
 *
 * Everything that knows what time it is lives here rather than in `core/`.
 */
@Service()
export class SaveService {
  /**
   * Reads the run, falling back to the backup slot when the primary is unusable.
   *
   * Load never throws: `loadSaveText` clamps and defaults damaged fields, and a genuinely
   * unreadable save yields a fresh run rather than an exception.
   */
  async load(nowMs: number): Promise<LoadResult> {
    const primary = await this.read(PRIMARY_KEY);
    const result = loadSaveText(primary, repairOptions(nowMs));

    if (result.fatal === undefined) {
      return result;
    }

    // The primary slot could not be migrated. Try the backup before accepting a fresh run.
    const backup = await this.read(BACKUP_KEY);
    if (backup === null) {
      return result;
    }
    const fromBackup = loadSaveText(backup, repairOptions(nowMs));
    return fromBackup.fatal === undefined ? fromBackup : result;
  }

  /**
   * Writes the run, copying the previous contents to the backup slot first.
   *
   * The state is written exactly as given — `lastTickAt` is maintained by the game loop as
   * it simulates, and restamping it here would silently discard the sub-step remainder.
   *
   * `fatal` loads must not reach here: a save this build cannot read (because it came from a
   * newer build) is still perfectly good once the player updates, and overwriting it would
   * destroy a working run. `GameLoopService` enforces that.
   */
  async save(state: GameState): Promise<void> {
    const previous = await this.read(PRIMARY_KEY);
    if (previous !== null) {
      await Preferences.set({ key: BACKUP_KEY, value: previous });
    }
    await Preferences.set({ key: PRIMARY_KEY, value: JSON.stringify(toSaveData(state)) });
  }

  /** Clears both slots. For a deliberate "start over", never as error recovery. */
  async clear(): Promise<void> {
    await Preferences.remove({ key: PRIMARY_KEY });
    await Preferences.remove({ key: BACKUP_KEY });
  }

  private async read(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }
}

/**
 * Generates a run seed.
 *
 * Lives in `ui/` because `core/` must not call `Math.random()` — determinism is what makes
 * balance runs replayable and bug reports reproducible. The seed is rolled once per run and
 * then lives in the save forever.
 */
export function makeSeed(): number {
  const buffer = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buffer);
  return buffer[0] >>> 0;
}

export type { RepairIssue };
