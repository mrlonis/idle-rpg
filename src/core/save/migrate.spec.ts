// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  FutureSaveVersionError,
  migrate,
  MIGRATIONS,
  UnknownSaveVersionError,
  type Migration,
} from './migrate';
import { SAVE_VERSION } from './version';

describe('MIGRATIONS table', () => {
  it('has a migration registered for every version below current', () => {
    // Bumping SAVE_VERSION without adding the matching migration is the classic way to
    // brick every existing save. This turns that mistake into a CI failure.
    const missing: number[] = [];
    for (let version = 1; version < SAVE_VERSION; version++) {
      if (!MIGRATIONS.has(version)) {
        missing.push(version);
      }
    }

    expect(missing).toEqual([]);
  });

  it('registers no migration at or above the current version', () => {
    const stray = [...MIGRATIONS.keys()].filter((version) => version >= SAVE_VERSION);

    expect(stray).toEqual([]);
  });
});

describe('migrate', () => {
  it('returns a current-version save untouched', () => {
    const save = { version: SAVE_VERSION, gold: '100' };

    expect(migrate(save)).toEqual(save);
  });

  it('does not mutate the input', () => {
    const save = { version: SAVE_VERSION, gold: '100' };

    migrate(save);

    expect(save).toEqual({ version: SAVE_VERSION, gold: '100' });
  });

  it('treats a save with no version as the earliest schema rather than discarding it', () => {
    // Pre-versioning saves should still be recoverable.
    expect(() => migrate({ gold: '100' })).not.toThrow();
  });

  it.each([
    { label: 'null', raw: null },
    { label: 'a string', raw: 'not a save' },
    { label: 'a number', raw: 7 },
    { label: 'an array', raw: [] },
  ])('throws UnknownSaveVersionError for $label', ({ raw }) => {
    expect(() => migrate(raw)).toThrow(UnknownSaveVersionError);
  });

  it.each([{ version: 0 }, { version: -1 }, { version: 1.5 }, { version: 'three' }])(
    'throws UnknownSaveVersionError for a nonsense version %p',
    (save) => {
      expect(() => migrate(save)).toThrow(UnknownSaveVersionError);
    },
  );

  it('throws FutureSaveVersionError when the save is newer than this build', () => {
    // The player downgraded. Their save is not corrupt and must not be overwritten.
    expect(() => migrate({ version: SAVE_VERSION + 1 })).toThrow(FutureSaveVersionError);
  });
});

describe('migration chaining', () => {
  // The real MIGRATIONS map is empty at v1, so these drive the real `migrate` walk with a
  // synthetic history. The algorithm is therefore covered before there is any history to
  // migrate — on the day a v2 first ships, the chaining logic is already known good.
  const table = new Map<number, Migration>([
    [1, (s) => ({ ...s, version: 2, stamina: 0 })],
    [2, (s) => ({ ...s, version: 3, rng: { seed: 7, calls: 0 } })],
  ]);

  it('walks every intermediate step to reach the target', () => {
    const result = migrate({ version: 1, gold: '50' }, table, 3);

    expect(result).toEqual({
      version: 3,
      gold: '50',
      stamina: 0,
      rng: { seed: 7, calls: 0 },
    });
  });

  it('preserves fields the migrations do not touch', () => {
    const result = migrate({ version: 1, gold: '50', keepMe: 'intact' }, table, 3);

    expect(result['keepMe']).toBe('intact');
  });

  it('starts mid-chain when the save is partly current', () => {
    const result = migrate({ version: 2, gold: '50', stamina: 4 }, table, 3);

    expect(result['stamina']).toBe(4);
    expect(result['rng']).toEqual({ seed: 7, calls: 0 });
  });

  it('throws rather than guessing when a step is missing', () => {
    const gapped = new Map<number, Migration>([[1, (s) => ({ ...s, version: 2 })]]);

    expect(() => migrate({ version: 1 }, gapped, 3)).toThrow(UnknownSaveVersionError);
  });

  it('rejects a migration that fails to advance the version instead of looping forever', () => {
    // Without this guard a migration that forgets to bump `version` hangs the app on
    // launch — an infinite loop before the first frame, with no error to diagnose.
    const stalled = new Map<number, Migration>([[1, (s) => ({ ...s, version: 1 })]]);

    expect(() => migrate({ version: 1 }, stalled, 2)).toThrow(/did not advance the version/);
  });

  it('rejects a migration that moves the version backwards', () => {
    const backwards = new Map<number, Migration>([[2, (s) => ({ ...s, version: 1 })]]);

    expect(() => migrate({ version: 2 }, backwards, 3)).toThrow(/did not advance the version/);
  });
});
