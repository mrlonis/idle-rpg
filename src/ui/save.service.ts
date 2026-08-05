import { inject, InjectionToken, Service } from '@angular/core';
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
 * The three operations this service needs from a key/value store.
 *
 * Structurally what `@capacitor/preferences` already exposes, so the real plugin satisfies it
 * without an adapter.
 */
export interface KeyValueStore {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
  remove(options: { key: string }): Promise<void>;
}

/**
 * Where saves are written. Defaults to `@capacitor/preferences`; overridden in tests.
 *
 * **This token exists so the spec never has to mock a module**, and that is worth explaining
 * because "just `vi.mock` the plugin" is the obvious alternative and it is a trap here. The
 * Angular unit-test builder runs with `isolate` **false** by default, so every spec file shares
 * one module registry — which makes `vi.mock` order-dependent across the whole suite. Whichever
 * file imports `@capacitor/preferences` first wins, and the specs that reach it transitively
 * (anything bootstrapping the app or the game loop) are exactly the ones whose order nobody
 * controls. That failed in CI and not locally, which is the worst shape a test failure can have.
 *
 * Injecting the store makes the seam a provider rather than a module-graph side effect, so it
 * cannot depend on load order at all. Turning isolation on would also have worked, and was
 * rejected: it slows the suite that runs on save, to fix one file's design.
 */
export const KEY_VALUE_STORE = new InjectionToken<KeyValueStore>('KEY_VALUE_STORE', {
  providedIn: 'root',
  factory: () => Preferences,
});

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
  private readonly store = inject(KEY_VALUE_STORE);

  /**
   * The newest state waiting to be written, and the drain that is working through them.
   *
   * Together these make {@link save} **serialised and coalescing**. Both halves matter and they
   * answer different problems — see the note on {@link save}.
   */
  private queued: GameState | null = null;
  private draining: Promise<void> | null = null;

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
   * **A run that started fresh because the save was unreadable writes over it like any other.**
   * That reversed with the v0 reset: `fatal` used to bar the way here, on the grounds that the
   * bytes might belong to a newer build. {@link load} still tries the backup slot before ever
   * reaching that point, so what is overwritten is a save neither slot could read.
   *
   * ## Two writes must never be in flight together
   *
   * A write is a **read-then-write across two slots** — read the primary, copy it to the backup,
   * then overwrite the primary. Run two of those concurrently and they interleave: both read the
   * same primary, and whichever finishes last wins, so an *older* state can land on top of a
   * newer one. That is lost progress, and the backup can end up describing a save that was never
   * the primary.
   *
   * It became a real risk when auto-battle landed. Persisting at the end of every battle is what
   * makes "losing the app costs the fight in flight and nothing else" true, but at 4x that is
   * about one write a second, and on a device each one is a bridge round-trip rather than the
   * microtask `localStorage` costs on the web. So the guarantee that motivated the frequent
   * writes is exactly the guarantee the frequency would have broken.
   *
   * **Serialising here rather than pacing the caller** is deliberate. Making the next auto-battle
   * fight wait for the previous write would couple the game's pacing to disk latency, so a slow
   * bridge would stutter the animation. The ordering problem belongs to the two slots, so the
   * ordering lives with them, and the loop stays free-running.
   *
   * ## Coalescing, not queueing
   *
   * A caller that arrives while a write is in progress **replaces** whatever was waiting instead
   * of joining a queue. Every state is a snapshot of one monotonically advancing run, so an
   * intermediate one that never reaches disk costs nothing — whereas a queue that grew with the
   * battle rate would be a backlog of writes that were stale before they started.
   *
   * The returned promise still resolves only once **that state, or a newer one**, is on disk,
   * which is what makes `void persist()` safe to fire and forget.
   */
  async save(state: GameState): Promise<void> {
    this.queued = state;
    this.draining ??= this.drain();
    await this.draining;
  }

  /**
   * Writes queued states until none is left.
   *
   * The loop re-checks {@link queued} after each write rather than capturing it up front, which
   * is what lets a state that arrived mid-write be picked up by the drain already running instead
   * of starting a second one.
   */
  private async drain(): Promise<void> {
    try {
      while (this.queued !== null) {
        const next = this.queued;
        this.queued = null;
        await this.write(next);
      }
    } finally {
      // Cleared here rather than after the loop so a failed write cannot wedge the service into
      // a state where every later save awaits a promise that already rejected.
      this.draining = null;
    }
  }

  /** One state to disk: backup first, then the primary. Only ever called from {@link drain}. */
  private async write(state: GameState): Promise<void> {
    const previous = await this.read(PRIMARY_KEY);
    if (previous !== null) {
      await this.store.set({ key: BACKUP_KEY, value: previous });
    }
    await this.store.set({ key: PRIMARY_KEY, value: JSON.stringify(toSaveData(state)) });
  }

  /**
   * Clears both slots. For a deliberate "start over", never as error recovery.
   *
   * Drops anything waiting to be written and lets a write already in progress finish, so the two
   * slots are never removed out from under a half-completed write. That is not the whole of a
   * reset: the running game holds the authoritative state in memory and will persist it again on
   * the next autosave, so a reset has to stop the loop and replace that state as well. See
   * `docs/milestones.md`.
   */
  async clear(): Promise<void> {
    this.queued = null;
    await this.draining;
    await this.store.remove({ key: PRIMARY_KEY });
    await this.store.remove({ key: BACKUP_KEY });
  }

  private async read(key: string): Promise<string | null> {
    const { value } = await this.store.get({ key });
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
