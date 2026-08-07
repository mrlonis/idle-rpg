import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type GameState, newGame, num, SAVE_VERSION, stampSaveTime, toSaveData } from '../core';
import { KEY_VALUE_STORE, type KeyValueStore, makeSeed, SaveService } from './save.service';

/** A run holding some gold, leaving every other currency at zero. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

/**
 * In-memory stand-in for the native key/value store, **provided rather than module-mocked**.
 *
 * `vi.mock('@capacitor/preferences')` is the obvious way to write this and it is the wrong one:
 * the Angular unit-test builder defaults `isolate` to false, so every spec shares one module
 * registry and the mock only wins if this file happens to import the plugin first. It does not
 * always, which is a green suite locally and a red one in CI. `SaveService` takes its store from
 * {@link KEY_VALUE_STORE} so this is a provider, and providers do not care about load order.
 */
class FakeStore implements KeyValueStore {
  readonly entries = new Map<string, string>();

  /**
   * Every operation, in order, so a test can assert on *interleaving* rather than only on the
   * final bytes.
   */
  readonly operations: string[] = [];

  /** How long an operation takes to settle. Raised by {@link beSlow} for the concurrency tests. */
  private settle: () => Promise<void> = () => Promise.resolve();

  /**
   * Settles after a handful of microtask turns, which is enough room for two writes to tear.
   *
   * On the web Preferences is `localStorage` behind an async wrapper and the gap between two
   * operations is a single microtask. On a device it is a real bridge round-trip — which is the
   * case worth testing, since that is where overlapping writes have room to interleave.
   */
  beSlow(): void {
    this.settle = async () => {
      for (let turn = 0; turn < 4; turn++) {
        await Promise.resolve();
      }
    };
  }

  async get({ key }: { key: string }): Promise<{ value: string | null }> {
    this.operations.push(`get:${key}`);
    await this.settle();
    return { value: this.entries.get(key) ?? null };
  }

  async set({ key, value }: { key: string; value: string }): Promise<void> {
    this.operations.push(`set:${key}`);
    await this.settle();
    this.entries.set(key, value);
  }

  async remove({ key }: { key: string }): Promise<void> {
    this.operations.push(`remove:${key}`);
    await this.settle();
    this.entries.delete(key);
  }
}

const T0 = 1_700_000_000_000;

describe('SaveService', () => {
  let service: SaveService;
  let store: FakeStore;
  let operations: string[];

  beforeEach(() => {
    store = new FakeStore();
    operations = store.operations;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: KEY_VALUE_STORE, useValue: store }],
    });
    service = TestBed.inject(SaveService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /** Raises the store's latency for the tests that are about two writes overlapping. */
  function slowStore(): void {
    store.beSlow();
  }

  it('round-trips a run', async () => {
    const state = withGold(newGame({ seed: 4242, nowMs: T0 }), '5e+20');

    await service.save(state);
    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeUndefined();
    expect(loaded.state.wallet.gold.eq('5e+20')).toBe(true);
    expect(loaded.state.rng.seed).toBe(4242);
  });

  it('starts a fresh run when there is no save, without reporting an error', async () => {
    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeUndefined();
    expect(loaded.state.wallet.gold.toString()).toBe('0');
  });

  it('stamps the save time so the offline window can be measured', async () => {
    const state = newGame({ seed: 1, nowMs: T0 });

    await service.save(stampSaveTime(state, T0 + 90_000));

    expect(await service.load(T0 + 90_000).then((r) => r.state.lastTickAt)).toBe(T0 + 90_000);
  });

  it('copies the previous save to the backup slot before overwriting', async () => {
    const first = withGold(newGame({ seed: 1, nowMs: T0 }), '111');
    const second = withGold(newGame({ seed: 1, nowMs: T0 }), '222');

    await service.save(first);
    await service.save(second);

    expect(store.entries.get('save')).toContain('222');
    expect(store.entries.get('save.bak')).toContain('111');
  });

  it('falls back to the backup when the primary slot is unreadable', async () => {
    // The exact scenario the backup exists for: a torn or corrupted primary write.
    const good = withGold(newGame({ seed: 7, nowMs: T0 }), '999');
    store.entries.set('save.bak', JSON.stringify(toSaveData(good)));
    store.entries.set('save', '{ not json at all');

    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeUndefined();
    expect(loaded.state.wallet.gold.eq('999')).toBe(true);
  });

  it('reports the failure when both slots are unusable', async () => {
    store.entries.set('save', '{ broken');
    store.entries.set('save.bak', 'also broken');

    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeDefined();
    expect(loaded.state.wallet.gold.toString()).toBe('0');
  });

  it('surfaces a future-versioned save as fatal rather than silently resetting', async () => {
    // The player downgraded the app. Since the v0 reset the fresh run does write over their save
    // rather than tiptoeing around it, so *reporting* is the whole of what is left — a run that
    // vanished with no explanation is indistinguishable from a bug.
    store.entries.set('save', JSON.stringify({ version: SAVE_VERSION + 3, wallet: { gold: '5' } }));

    const loaded = await service.load(T0);

    expect(loaded.fatal).toMatch(/newer than this build supports/);
  });

  it('recovers a damaged-but-migratable save and reports what it repaired', async () => {
    store.entries.set(
      'save',
      JSON.stringify({ version: SAVE_VERSION, wallet: { gold: 'garbage' }, rng: {} }),
    );

    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeUndefined();
    expect(loaded.issues.length).toBeGreaterThan(0);
    expect(loaded.state.wallet.gold.toString()).toBe('0');
  });

  describe('overlapping writes', () => {
    /**
     * Auto-battle is what made this worth guarding.
     *
     * A battle persists as it ends, and at 4x that can be one write a second — so two writes are
     * genuinely in flight together on a device. Each one is a read-then-write across two slots, so
     * without serialisation an older save can finish last and overwrite a newer one, which is
     * progress loss rather than a cosmetic ordering wobble.
     */
    it('never lets an earlier write finish after a later one', async () => {
      slowStore();
      const first = withGold(newGame({ seed: 1, nowMs: T0 }), '111');
      const second = withGold(newGame({ seed: 1, nowMs: T0 }), '222');

      // Deliberately not awaited in turn: this is the shape `settle()` produces.
      await Promise.all([service.save(first), service.save(second)]);

      expect(store.entries.get('save')).toContain('222');
    });

    it('keeps the read-then-write pair of each save intact', async () => {
      // The tearing, stated as a sequence rather than as an outcome. One write is
      // `get:save`, `set:save.bak`, `set:save` — and two of those interleaved is how the backup
      // ends up describing a save that was never the primary.
      slowStore();
      await service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '111'));
      operations.length = 0;

      await Promise.all([
        service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '222')),
        service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '333')),
      ]);

      // Every `get:save` is followed by its own backup and primary write before the next one.
      const pairs = operations.join(',');
      expect(pairs).not.toMatch(/get:save,(?!set:save\.bak,set:save)/);
    });

    it('writes only the newest state when several pile up', async () => {
      // Coalescing, not queueing. States are snapshots of one monotonically advancing run, so an
      // intermediate one that never reaches disk costs nothing — and a queue that grew with the
      // battle rate would be a backlog of writes nobody wants.
      slowStore();
      const saves = [
        service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '111')),
        service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '222')),
        service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '333')),
      ];
      await Promise.all(saves);

      expect(store.entries.get('save')).toContain('333');
      expect(operations.filter((op) => op === 'set:save')).toHaveLength(2);
    });

    it('resolves a caller only once its state, or a newer one, is on disk', async () => {
      // The contract that makes `void persist()` safe to fire and forget: nothing is told the run
      // is durable while an older snapshot is the one on disk.
      slowStore();
      const second = withGold(newGame({ seed: 1, nowMs: T0 }), '222');

      const first = service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '111'));
      const later = service.save(second);
      await first;

      expect(store.entries.get('save')).toContain('222');
      await later;
    });
  });

  /**
   * A deliberate "start over". Reachable from the settings screen since milestone 13, which is
   * what made the two cases below worth having: a wipe that raced the write queue would leave the
   * run the player just deleted sitting in one of the slots.
   */
  describe('clearing', () => {
    it('clears both slots on request', async () => {
      await service.save(newGame({ seed: 1, nowMs: T0 }));
      await service.save(newGame({ seed: 1, nowMs: T0 }));

      await service.clear();

      expect(store.entries.size).toBe(0);
    });

    it('waits for a write already in flight rather than removing the slots under it', async () => {
      slowStore();

      const writing = service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '111'));
      await service.clear();
      await writing;

      // The write finished and *then* both slots went, rather than the removals landing between
      // the backup copy and the primary overwrite.
      expect(store.entries.size).toBe(0);
      expect(operations.indexOf('remove:save')).toBeGreaterThan(operations.lastIndexOf('set:save'));
    });

    it('drops a state that was still queued, so a wipe cannot be undone by it', async () => {
      slowStore();

      const first = service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '111'));
      const queued = service.save(withGold(newGame({ seed: 1, nowMs: T0 }), '222'));
      await service.clear();
      await first;
      await queued;

      expect(store.entries.size).toBe(0);
    });
  });
});

describe('KEY_VALUE_STORE', () => {
  it('resolves to a plain object, so the injector finds no destroy hook on it', () => {
    // ⚠️ The regression this exists for: `factory: () => Preferences` hands Angular the Capacitor
    // plugin proxy, which answers *every* property with a callable. `R3Injector` decides a provider
    // needs tearing down by testing `typeof value.ngOnDestroy === 'function'`, so it registers the
    // plugin and calls `ngOnDestroy()` on teardown — a native method that does not exist, which
    // rejects. It presents as a green suite that still exits 1, attributed to whichever spec was
    // running. Asserting on the shape of the default is the only place it can be caught cheaply.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const store: KeyValueStore = TestBed.inject(KEY_VALUE_STORE);

    expect((store as { ngOnDestroy?: unknown }).ngOnDestroy).toBeUndefined();
    expect(Object.keys(store).sort()).toEqual(['get', 'remove', 'set']);
  });
});

describe('makeSeed', () => {
  it('returns a uint32', () => {
    for (let i = 0; i < 50; i++) {
      const seed = makeSeed();
      expect(Number.isInteger(seed)).toBe(true);
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it('varies between runs', () => {
    const seeds = new Set(Array.from({ length: 50 }, () => makeSeed()));

    expect(seeds.size).toBeGreaterThan(40);
  });
});
