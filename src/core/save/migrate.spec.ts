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
    //
    // Vacuous at the v0 baseline and deliberately kept: it is the assertion that stops the *next*
    // bump from shipping without its step, which is exactly when nobody is thinking about it.
    const missing: number[] = [];
    for (let version = 0; version < SAVE_VERSION; version++) {
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

  it('discards a save with no version rather than guessing at one', () => {
    // It used to be read as the earliest schema, because v1 predated versioning and guessing was
    // strictly better than discarding a real run. The v0 reset removed the thing that guess was
    // for: nothing below this baseline exists, so an absent version is damage.
    expect(() => migrate({ gold: '100' })).toThrow(UnknownSaveVersionError);
  });

  it.each([
    { label: 'null', raw: null },
    { label: 'a string', raw: 'not a save' },
    { label: 'a number', raw: 7 },
    { label: 'an array', raw: [] },
  ])('throws UnknownSaveVersionError for $label', ({ raw }) => {
    expect(() => migrate(raw)).toThrow(UnknownSaveVersionError);
  });

  it.each([{ version: -1 }, { version: 1.5 }, { version: 'three' }])(
    'throws UnknownSaveVersionError for a nonsense version %p',
    (save) => {
      expect(() => migrate(save)).toThrow(UnknownSaveVersionError);
    },
  );

  it('throws FutureSaveVersionError when the save is newer than this build', () => {
    expect(() => migrate({ version: SAVE_VERSION + 1 })).toThrow(FutureSaveVersionError);
  });

  it.each([3, 4, 5])('discards a v%i save from before the baseline', (version) => {
    // ⚠️ **The reset, stated as behaviour rather than as an absence.** Five schema versions were
    // collapsed into v0 while the game was pre-release, so a save written by any of them has no
    // path to current and never will. It reads as newer-than-supported because the numbers were
    // re-based; either way `loadSave` turns it into a fresh run, which is the whole intent.
    expect(() => migrate({ version })).toThrow();
  });

  it.each([1, 2])('reads version %i as a post-baseline save, not as a pre-baseline one', (v) => {
    // ⚠️ **The reset burned version numbers, and two milestones have now re-issued them.** The old
    // v1 was milestone 1's gold counter and the old v2 was combat progression; this v1 is the gear
    // schema and this v2 is the ladder gaining a bottom. A build cannot tell either pair apart
    // from the number alone — so a genuine pre-reset save at one of these versions would be read
    // as a current one and repaired into something close to a fresh run rather than reported as
    // unreadable.
    //
    // That is safe here for exactly one reason, and it is the same reason the reset itself was
    // licensed: **no save carrying the old meaning has ever existed outside development.** It is
    // not safe in general, and it is the cost of re-basing that is easiest to forget — every
    // number below `SAVE_VERSION` now means something different from what it meant before the
    // reset. Nothing else may be re-issued once a build reaches a player.
    expect(() => migrate({ version: v })).not.toThrow();
    expect(migrate({ version: v })).toMatchObject({ version: SAVE_VERSION });
  });

  it('shifts every stored rarity by two on the way from v1 to v2', () => {
    // The migration this file exists for. v1 → v2 adds no field, so nothing structural can tell a
    // migrated save from an unmigrated one — this assertion is the only evidence that the shift
    // ran, and without it every returning player is silently demoted two rungs.
    const migrated = migrate({
      version: 1,
      roster: [
        { defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'beta', rarity: 4, level: 9, copies: 2, gear: {} },
      ],
    });

    expect(migrated).toMatchObject({
      version: 2,
      roster: [
        { defId: 'alpha', rarity: 2, level: 1, copies: 0, gear: {} },
        { defId: 'beta', rarity: 6, level: 9, copies: 2, gear: {} },
      ],
    });
  });

  it('leaves a damaged rarity for load-time repair rather than shifting it', () => {
    // Shifting a corrupt value only moves the corruption. `serialize` clamps to the character's
    // starting rarity, which is a better answer than any this step could invent.
    const migrated = migrate({
      version: 1,
      roster: [{ defId: 'alpha', rarity: 'elite', level: 1, copies: 0, gear: {} }],
    });

    expect(migrated).toMatchObject({
      roster: [{ defId: 'alpha', rarity: 'elite' }],
    });
  });
});

describe('migration chaining', () => {
  // A synthetic history rather than the real MIGRATIONS map, which now holds one entry and so
  // exercises a single step rather than a chain. Multi-step chaining is what has to keep working
  // and what nothing shipped can currently demonstrate, so it is driven from here — through the
  // real `migrate` walk, with a table of its own.
  //
  // **This block is why the walker survived the v0 reset rather than being deleted with the four
  // migrations it used to run.** It is proven machinery with no callers, which is a far better
  // position than an unproven chain walker written on the day the first real migration is already
  // urgent.
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
