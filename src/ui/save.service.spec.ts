import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type GameState, newGame, num, SAVE_VERSION, stampSaveTime, toSaveData } from '../core';

/** A run holding some gold, leaving every other currency at zero. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

/** In-memory stand-in for the native key/value store. */
const store = new Map<string, string>();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: ({ key }: { key: string }) => Promise.resolve({ value: store.get(key) ?? null }),
    set: ({ key, value }: { key: string; value: string }) => {
      store.set(key, value);
      return Promise.resolve();
    },
    remove: ({ key }: { key: string }) => {
      store.delete(key);
      return Promise.resolve();
    },
  },
}));

const { makeSeed, SaveService } = await import('./save.service');

const T0 = 1_700_000_000_000;

describe('SaveService', () => {
  let service: InstanceType<typeof SaveService>;

  beforeEach(() => {
    store.clear();
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
