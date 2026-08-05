import { SAVE_VERSION } from './version';

/** A save as parsed from JSON, before it is decoded into runtime state. */
export type RawSave = Record<string, unknown>;

/**
 * One schema step. Pure `(old) => (new)`, bumping `version` by exactly one.
 *
 * **Never delete or edit a migration once a build carrying it has reached a player.** They can
 * return after any number of releases, and their save has to walk the whole chain; an edited
 * migration silently changes the meaning of every save that passes through it.
 */
export type Migration = (save: RawSave) => RawSave;

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * **Empty, and that is the current state of the game rather than an oversight.** Five schema
 * versions and four migrations were collapsed into a single v0 baseline while the game was still
 * pre-release — see [saves](../../../docs/saves.md) for the reset and the condition that closes
 * the door on repeating it. A save written by any of those versions is not migrated; it is
 * discarded and the run starts fresh, which is what `loadSave` does with anything it cannot read.
 *
 * **The machinery below is deliberately kept rather than deleted with the entries.** It is forty
 * lines, `migrate.spec.ts` proves the walk against a synthetic history, and the alternative is
 * writing an untested chain walker on the day the first real migration is already urgent.
 */
export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map<number, Migration>();

export class UnknownSaveVersionError extends Error {
  constructor(readonly foundVersion: unknown) {
    super(`No migration path from save version ${JSON.stringify(foundVersion)} to ${SAVE_VERSION}`);
    this.name = 'UnknownSaveVersionError';
  }
}

export class FutureSaveVersionError extends Error {
  constructor(
    readonly foundVersion: number,
    supportedVersion: number = SAVE_VERSION,
  ) {
    super(`Save version ${foundVersion} is newer than this build supports (${supportedVersion}).`);
    this.name = 'FutureSaveVersionError';
  }
}

/**
 * Reads a save's declared version.
 *
 * **A save with no version is unreadable rather than assumed to be the oldest.** It used to be
 * read as v1, because v1 predated versioning and guessing was strictly better than discarding a
 * real player's run. The v0 reset removed the thing that guess was for: nothing below this
 * baseline exists, so an absent version now means damage, and damage is handled by starting over.
 */
function readVersion(save: RawSave): number {
  const raw = save['version'];
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
    throw new UnknownSaveVersionError(raw);
  }
  return raw;
}

/**
 * Walks a raw save up to `targetVersion`.
 *
 * Throws rather than guessing when there is no path — the caller (`loadSave`) turns that into a
 * fresh run. Throwing here is safe because it is never the last line of defence.
 *
 * `migrations` and `targetVersion` are injectable so the chaining algorithm can be tested against
 * a synthetic history. That was already the arrangement when the real table held four entries,
 * and it is what makes an empty table safe: the walk stays proven while nothing is using it.
 */
export function migrate(
  raw: unknown,
  migrations: ReadonlyMap<number, Migration> = MIGRATIONS,
  targetVersion: number = SAVE_VERSION,
): RawSave {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new UnknownSaveVersionError(raw);
  }

  let save = { ...(raw as RawSave) };
  let version = readVersion(save);

  if (version > targetVersion) {
    throw new FutureSaveVersionError(version, targetVersion);
  }

  while (version < targetVersion) {
    const step = migrations.get(version);
    if (!step) {
      throw new UnknownSaveVersionError(version);
    }
    save = step(save);
    const next = readVersion(save);
    if (next <= version) {
      throw new Error(
        `Migration from version ${version} did not advance the version (got ${next}). ` +
          'Each migration must bump `version` by exactly one.',
      );
    }
    version = next;
  }

  return save;
}
