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
 * v0 → v1: gear.
 *
 * Purely additive. Every field it writes is the empty value for something that did not exist, so a
 * migrated save is a run that owns no gear and has bought nothing — which is exactly what it is.
 *
 * ⚠️ **The empty values are written out here rather than imported from `core/gear/types.ts`.** A
 * migration is *dated*: it describes the shape that existed the day it shipped, and a constant a
 * later release is free to retune would silently change what this step means for every save that
 * has not run it yet. This is the same rule the v3 → v4 rank sizes were written out under, and it
 * is why `emptyGearShop()` is deliberately not called from in here even though it currently returns
 * exactly this object.
 *
 * It does **not** try to work out what gear a returning player "should" have. There is no receipt
 * to read — nothing in a v0 save records a fight that would have dropped a piece — so the honest
 * answer is none, and the next stage clear is where the bag starts filling. That is the opposite
 * situation to the v2 → v3 rate hole, where the surviving gold rate *was* a receipt for progress
 * the migration had silently dropped; see `reconcileClearedStages`.
 */
const migrateV0ToV1: Migration = (save) => {
  const wallet =
    typeof save['wallet'] === 'object' && save['wallet'] !== null ? save['wallet'] : {};
  const roster = Array.isArray(save['roster']) ? save['roster'] : [];
  return {
    ...save,
    version: 1,
    wallet: { ...(wallet as Record<string, unknown>), alloy: '0' },
    roster: roster.map((entry: unknown) => ({
      ...(typeof entry === 'object' && entry !== null ? entry : {}),
      gear: {},
    })),
    gear: [],
    gearMinted: 0,
    gearShop: { slot: 0, purchased: [] },
  };
};

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * **One entry, and it is the first this table has held since the reset.** Five schema versions and
 * four migrations were collapsed into a single v0 baseline while the game was still pre-release —
 * see [saves](../../../docs/saves.md) for the reset and the condition that closes the door on
 * repeating it. Everything from v0 upward is permanent.
 *
 * **The machinery below was deliberately kept when the old entries went**, on the argument that an
 * untested chain walker written on the day the first real migration is already urgent is the worst
 * possible time to be debugging one. `migrate.spec.ts` has proved the walk against a synthetic
 * history throughout; {@link migrateV0ToV1} is what it was being kept for.
 */
export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map<number, Migration>([
  [0, migrateV0ToV1],
]);

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
