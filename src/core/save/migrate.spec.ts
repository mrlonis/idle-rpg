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
    // strictly better than discarding a real run. The re-base removed the thing that guess was
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

  it('has no version left below the baseline to discard, which is the burn spent twice over', () => {
    // ⚠️ **This assertion replaced a real one, and the replacement is the point.** The chain has
    // been re-based to a single v0 twice — five pre-release versions the first time, six more the
    // second — and for several milestones this block seeded one of the numbers they had used and
    // checked it was refused. Every one of those numbers is now either the baseline itself or above
    // it, so there is nothing left to seed.
    //
    // What is asserted instead is the fact itself, so that the moment somebody tries to write
    // "discard a pre-baseline save" again they find out why they cannot. A save is unreadable now
    // only by being *newer* than this build or by carrying nonsense — both covered above.
    for (let version = 0; version <= SAVE_VERSION; version++) {
      expect(() => migrate({ version }), `v${version}`).not.toThrow();
    }
    expect(() => migrate({ version: SAVE_VERSION + 1 })).toThrow(FutureSaveVersionError);
  });

  it.each([1, 2, 3, 4, 5, 6])('refuses version %i, which twice meant something real', (v) => {
    // ⚠️ **Each of these numbers has now meant two different things, and means neither.** The first
    // re-base issued 1–5 to the pre-release chain; the second issued 1–6 again, to gear, the
    // ladder's new bottom, the achievement ledger, the quest windows, the bounty board and the
    // legendary pity counter. Both sets are folded into v0, so a save at any of them is *newer than
    // this build* and is discarded rather than repaired into something plausible.
    //
    // Discarding is the safe direction and it is still a run nobody can recover, which is the whole
    // cost of re-basing and the part easiest to forget. It is licensed here for exactly one reason:
    // **no save carrying either meaning has ever existed outside development.** Nothing may be
    // re-issued once a build reaches a player.
    //
    // ⚠️ **The literals are deliberate and this block fails at the next bump.** Everywhere else a
    // version is derived from `SAVE_VERSION`, because a literal there goes stale silently; here the
    // numbers *are* the history, and re-issuing one for a third time should mean reading this
    // comment rather than editing an array.
    expect(v).toBeGreaterThan(SAVE_VERSION);
    expect(() => migrate({ version: v })).toThrow(FutureSaveVersionError);
  });
});

describe('migration chaining', () => {
  // A synthetic history rather than the real MIGRATIONS map, which is empty again and so exercises
  // no steps at all. Chaining is what has to keep working and what nothing shipped can currently
  // demonstrate, so it is driven from here — through the real `migrate` walk, with a table of its
  // own.
  //
  // **This block is why the walker survived both re-bases rather than being deleted with the
  // migrations it used to run.** It is proven machinery with no callers, which is a far better
  // position than an unproven chain walker written on the day the first real migration is already
  // urgent — and it is the position the gear migration landed on and worked in first time.
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
