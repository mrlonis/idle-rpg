import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { KEY_VALUE_STORE, type KeyValueStore } from './save.service';
import { PLAYBACK_SPEEDS, SettingsService } from './settings.service';

/**
 * In-memory stand-in for the native store, **provided rather than module-mocked** — the same
 * reasoning as `save.service.spec.ts`, and the reason `KEY_VALUE_STORE` exists at all.
 */
class FakeStore implements KeyValueStore {
  readonly entries = new Map<string, string>();

  /** Every operation in order, so a test can assert on interleaving rather than only the bytes. */
  readonly operations: string[] = [];

  /** Resolves a read only when a test releases it, for the "a slow read must not undo a tap" case. */
  private held: (() => void) | null = null;
  private gate: Promise<void> = Promise.resolve();

  /** Makes the next read block until {@link release}. */
  holdReads(): void {
    this.gate = new Promise<void>((resolve) => {
      this.held = resolve;
    });
  }

  release(): void {
    this.held?.();
    this.held = null;
  }

  async get({ key }: { key: string }): Promise<{ value: string | null }> {
    this.operations.push(`get:${key}`);
    await this.gate;
    return { value: this.entries.get(key) ?? null };
  }

  set({ key, value }: { key: string; value: string }): Promise<void> {
    this.operations.push(`set:${key}`);
    this.entries.set(key, value);
    return Promise.resolve();
  }

  remove({ key }: { key: string }): Promise<void> {
    this.operations.push(`remove:${key}`);
    this.entries.delete(key);
    return Promise.resolve();
  }
}

/** What the store holds under the settings key, parsed. */
function stored(store: FakeStore): unknown {
  const value = store.entries.get('settings');
  return value === undefined ? undefined : JSON.parse(value);
}

describe('SettingsService', () => {
  let store: FakeStore;

  beforeEach(() => {
    store = new FakeStore();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: KEY_VALUE_STORE, useValue: store }],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  /** Builds the service and waits for its opening read, which happens in the constructor. */
  async function build(): Promise<SettingsService> {
    const settings = TestBed.inject(SettingsService);
    await settings.ready;
    return settings;
  }

  describe('the opening read', () => {
    it('starts at 1x when nothing has been stored', async () => {
      const settings = await build();

      expect(settings.combatSpeed()).toBe(1);
    });

    it('restores a speed a previous session chose', async () => {
      store.entries.set('settings', JSON.stringify({ combatSpeed: 4 }));

      const settings = await build();

      expect(settings.combatSpeed()).toBe(4);
    });

    /**
     * The repair strategy, stated as a test: every field defaults independently on read, which is
     * what stands in for a version field and a migration chain. See `SettingsService`.
     */
    it.each([
      ['a speed this build does not offer', JSON.stringify({ combatSpeed: 3 })],
      ['a speed of the wrong type', JSON.stringify({ combatSpeed: '4' })],
      ['a blob with no speed in it', JSON.stringify({ somethingElse: true })],
      ['a value that is not an object', JSON.stringify(4)],
      ['bytes that are not JSON at all', '{ truncated'],
    ])('falls back to the default given %s', async (_label, value) => {
      store.entries.set('settings', value);

      const settings = await build();

      expect(settings.combatSpeed()).toBe(1);
    });
  });

  describe('choosing a speed', () => {
    it.each(PLAYBACK_SPEEDS)('publishes and persists %ix', async (speed) => {
      const settings = await build();

      settings.setCombatSpeed(speed);

      expect(settings.combatSpeed()).toBe(speed);
      await settings.written;
      expect(stored(store)).toEqual({ combatSpeed: speed });
    });

    /**
     * Writes are chained rather than fired in parallel, so the value that lands is the one chosen
     * last. Without the chain two overlapping writes could complete in either order, and the
     * earlier tap would be the one on disk.
     */
    it('lands the last choice on disk when several are made in a row', async () => {
      const settings = await build();

      settings.setCombatSpeed(4);
      settings.setCombatSpeed(2);
      settings.setCombatSpeed(1);

      await settings.written;

      expect(stored(store)).toEqual({ combatSpeed: 1 });
      // In order, so the assertion above is about sequencing rather than about the last call
      // happening to win a race.
      expect(store.operations.filter((op) => op.startsWith('set:'))).toHaveLength(3);
    });

    /**
     * The load is asynchronous and the battle screen is live throughout it. A stored speed
     * arriving after the player has picked one would silently overrule them, which is the one
     * ordering bug this seam can have.
     */
    it('does not let a slow read overrule a choice already made', async () => {
      store.entries.set('settings', JSON.stringify({ combatSpeed: 4 }));
      store.holdReads();

      const settings = TestBed.inject(SettingsService);
      settings.setCombatSpeed(1);
      store.release();
      await settings.ready;

      expect(settings.combatSpeed()).toBe(1);
    });
  });

  /**
   * Settings are stored beside the save rather than inside it, which is what keeps a run reset
   * from taking the player's preferences with it.
   */
  it('writes to a key of its own, never to the save', async () => {
    const settings = await build();

    settings.setCombatSpeed(2);
    await settings.written;

    expect([...store.entries.keys()]).toEqual(['settings']);
  });
});
