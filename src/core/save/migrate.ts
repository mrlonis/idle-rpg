import { SAVE_VERSION } from './version';

/** A save as parsed from JSON, before it is decoded into runtime state. */
export type RawSave = Record<string, unknown>;

/**
 * One schema step. Pure `(old) => (new)`, bumping `version` by exactly one.
 *
 * **Never delete or edit a migration once a build carrying it has reached a player.** They can
 * return after any number of releases, and their save has to walk the whole chain; an edited
 * migration silently changes the meaning of every save that passes through it.
 *
 * That condition is what makes the rule enforceable rather than aspirational, and it is also what
 * has licensed deleting every migration this table has ever held — twice. It expires the day
 * somebody outside development loads a save.
 */
export type Migration = (save: RawSave) => RawSave;

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * **Empty, for the second time.** Six entries had accumulated on top of the v0 baseline — gear, the
 * two rungs the copies-only rewrite inserted below `rare`, the achievement ledger, the quest
 * windows, the bounty board and the legendary pity counter — and all six were folded back into v0,
 * on the same narrow argument the first re-base ran on: **no save any of those versions wrote has
 * ever existed outside development.** See [saves](../../../docs/saves.md).
 *
 * **The machinery below was deliberately kept when the entries went**, both times, on the argument
 * that an untested chain walker written on the day the first real migration is already urgent is
 * the worst possible time to be debugging one. `migrate.spec.ts` drives the walk against a
 * synthetic history throughout, so it stays proven while nothing is using it — which is exactly the
 * position it was in when the gear migration landed on it and worked first time.
 *
 * ⚠️ **What the deleted entries cost is recorded rather than forgotten.** Five of the six were
 * additive, so folding them in means the fields they wrote are simply part of the baseline shape.
 * The sixth — the rarity shift — *reinterpreted* a field, and that is the shape to be careful of
 * next time: a save at the old meaning parses cleanly, validates cleanly, and demotes the entire
 * roster two rungs with nothing structural able to see it. Inserting a rung anywhere but the top of
 * `RARITIES` is still a save migration rather than a content edit; there is simply no longer a save
 * in existence that needs one.
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
 * real player's run. The re-base removed the thing that guess was for: nothing below this baseline
 * exists, so an absent version now means damage, and damage is handled by starting over.
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
 * a synthetic history. That was already the arrangement when the real table held six entries, and
 * it is what makes an empty table safe: the walk stays proven while nothing is using it.
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
