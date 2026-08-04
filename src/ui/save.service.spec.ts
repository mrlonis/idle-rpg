import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type GameState, newGame, num, SAVE_VERSION, stampSaveTime, toSaveData } from '../core';

/** A run holding some gold, leaving every other currency at zero. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

/** In-memory stand-in for the native key/value store. */
const store = new Map<string, string>();

/**
 * Every operation the store saw, in order, so a test can assert on *interleaving* rather than
 * only on the final bytes.
 *
 * On the web Preferences is `localStorage` behind an async wrapper and the gap between two
 * operations is a microtask. On a device it is a real bridge round-trip, which is where two
 * overlapping writes have room to tear — so the settling delay below is configurable and the
 * ordering assertions are written against this log rather than against timing.
 */
const operations: string[] = [];

/** How long a store operation takes to settle. Raised in the tests that exercise concurrency. */
let settle: () => Promise<void> = () => Promise.resolve();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: async ({ key }: { key: string }) => {
      operations.push(`get:${key}`);
      await settle();
      return { value: store.get(key) ?? null };
    },
    set: async ({ key, value }: { key: string; value: string }) => {
      operations.push(`set:${key}`);
      await settle();
      store.set(key, value);
    },
    remove: async ({ key }: { key: string }) => {
      operations.push(`remove:${key}`);
      await settle();
      store.delete(key);
    },
  },
}));

/** Settles after a handful of microtask turns, which is enough room for two writes to tear. */
function slowStore(): void {
  settle = async () => {
    for (let turn = 0; turn < 4; turn++) {
      await Promise.resolve();
    }
  };
}

const { makeSeed, SaveService } = await import('./save.service');

const T0 = 1_700_000_000_000;

describe('SaveService', () => {
  let service: InstanceType<typeof SaveService>;

  beforeEach(() => {
    store.clear();
    operations.length = 0;
    settle = () => Promise.resolve();
    service = new SaveService();
  });

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

    expect(store.get('save')).toContain('222');
    expect(store.get('save.bak')).toContain('111');
  });

  it('falls back to the backup when the primary slot is unreadable', async () => {
    // The exact scenario the backup exists for: a torn or corrupted primary write.
    const good = withGold(newGame({ seed: 7, nowMs: T0 }), '999');
    store.set('save.bak', JSON.stringify(toSaveData(good)));
    store.set('save', '{ not json at all');

    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeUndefined();
    expect(loaded.state.wallet.gold.eq('999')).toBe(true);
  });

  it('reports the failure when both slots are unusable', async () => {
    store.set('save', '{ broken');
    store.set('save.bak', 'also broken');

    const loaded = await service.load(T0);

    expect(loaded.fatal).toBeDefined();
    expect(loaded.state.wallet.gold.toString()).toBe('0');
  });

  it('surfaces a future-versioned save as fatal rather than silently resetting', async () => {
    // The player downgraded the app. Their run is intact and becomes readable again on
    // update, so this must not be mistaken for corruption.
    store.set('save', JSON.stringify({ version: SAVE_VERSION + 3, wallet: { gold: '5' } }));

    const loaded = await service.load(T0);

    expect(loaded.fatal).toMatch(/newer than this build supports/);
  });

  it('recovers a damaged-but-migratable save and reports what it repaired', async () => {
    store.set(
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

      expect(store.get('save')).toContain('222');
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

      expect(store.get('save')).toContain('333');
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

      expect(store.get('save')).toContain('222');
      await later;
    });
  });

  it('clears both slots on request', async () => {
    await service.save(newGame({ seed: 1, nowMs: T0 }));
    await service.save(newGame({ seed: 1, nowMs: T0 }));

    await service.clear();

    expect(store.size).toBe(0);
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
