import { SAVE_VERSION } from './version';

/** A save as parsed from JSON, before it is decoded into runtime state. */
export type RawSave = Record<string, unknown>;

/**
 * One schema step. Pure `(old) => (new)`, bumping `version` by exactly one.
 *
 * **Never delete or edit a migration once it ships.** A player can return after any number
 * of releases, and their save has to walk the whole chain. An edited migration silently
 * changes the meaning of every save that passes through it.
 */
export type Migration = (save: RawSave) => RawSave;

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * Empty at v1 because there is no history yet. The first entry lands the day `SAVE_VERSION`
 * becomes 2 — for example, when combat adds a stage field:
 *
 * ```ts
 * [1, (s) => ({ ...s, version: 2, stage: 1 })],
 * ```
 */
export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map<number, Migration>([]);

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
    super(
      `Save version ${foundVersion} is newer than this build supports (${supportedVersion}). ` +
        'The save was left untouched.',
    );
    this.name = 'FutureSaveVersionError';
  }
}

function readVersion(save: RawSave): number {
  const raw = save['version'];
  // A save with no version predates versioning; treat it as the earliest known schema
  // rather than discarding it.
  if (raw === undefined || raw === null) {
    return 1;
  }
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 1) {
    throw new UnknownSaveVersionError(raw);
  }
  return raw;
}

/**
 * Walks a raw save up to `targetVersion`.
 *
 * Throws rather than guessing when there is no path — the caller (`loadSave`) decides
 * whether to fall back to the backup slot or start fresh. Throwing here is safe because it
 * is never the last line of defence.
 *
 * `migrations` and `targetVersion` are injectable so the chaining algorithm can be tested
 * against a synthetic history. The real table is empty until the first schema change, and
 * testing the walk only against the real table would be vacuous today and untested on the
 * day it first matters.
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
