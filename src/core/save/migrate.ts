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
 * v1 → v2: combat arrives, and with it the two fields that track where a run is in it.
 *
 * A save written before combat existed has no stage, so it starts at the first one. Gold and
 * the RNG position carry over untouched — a returning player's counter does not reset because
 * the game gained a feature.
 */
const migrateV1ToV2: Migration = (save) => ({
  ...save,
  version: 2,
  stage: 1,
  battleCount: 0,
});

/**
 * v2 → v3: the gacha release. Currencies become a keyed wallet, and characters become state.
 *
 * The two carried-over quantities are the interesting part. A v2 save's `gold` and
 * `goldPerSec` move into the wallet and rate table under the `gold` key and keep their exact
 * values — a returning player's balance and income are untouched by the schema growing around
 * them. Everything genuinely new starts empty: no roster, no party, no pity.
 *
 * An empty roster is deliberate and is not a hole. `core/` cannot see `data/`, so a migration
 * has no way to know who the starter characters are; `grantStarters` runs on load and is
 * idempotent, so a v2 save arrives with the same starting party a fresh run gets, and a v3
 * save that already has a roster is left alone.
 *
 * **`clearedStages` starts at zero, and that is not the same as "cleared nothing".** It means
 * "nothing has been *credited* yet". The first-clear summon bonus did not exist in v2, so a
 * returning player has not been paid a single one of them however far they climbed — seeding the
 * counter from `stage - 1` would mark all of that as settled and close the door on the whole
 * 3,000 crystals, silently and permanently.
 *
 * **This migration is deliberately incomplete, and `reconcileClearedStages` finishes the job.**
 * It cannot do the rest here, because all of it needs to know what the stages grant and `core/`
 * cannot see `data/`:
 *
 * - The three new rates start at zero, but stages the player already cleared had unlocked them.
 * - The clear count has to be re-derived, and every bonus it credits has to be paid.
 *
 * Both are recoverable from the gold rate this migration does carry across, and the repair runs
 * on every load. So the rule this file states at the top still holds: **do not edit this to try
 * to compute progression here.** What belongs here is the shape change and the two quantities
 * that survive it; what belongs in the repair is anything that needs content.
 */
const migrateV2ToV3: Migration = (save) => {
  const gold = typeof save['gold'] === 'string' ? save['gold'] : '0';
  const goldPerSec = typeof save['goldPerSec'] === 'string' ? save['goldPerSec'] : '0';
  const { gold: _gold, goldPerSec: _goldPerSec, ...rest } = save;

  return {
    ...rest,
    version: 3,
    wallet: { gold, xp: '0', essence: '0', summons: '0', spark: '0' },
    rates: { gold: goldPerSec, xp: '0', essence: '0', summons: '0' },
    clearedStages: 0,
    roster: [],
    activeParty: [],
    pity: 0,
    pullCount: 0,
  };
};

/**
 * v3 → v4: the party gains ranks.
 *
 * The old `activeParty` was a flat list of at most three; the new formation is two ranks of at
 * most two and three. A returning player's party is split in reading order — the first two
 * take the front, the rest fall in behind — which is the only mapping that preserves both
 * membership and the slot order that breaks ties in turn order.
 *
 * **The rank sizes are written out rather than imported from `core/state`.** A migration is
 * dated: it describes the shape that existed the day it shipped, and a constant that a later
 * release is free to retune would silently change what this step means for every save that
 * has not run it yet. That is exactly the hazard the note at the top of this file is about.
 *
 * Anything beyond membership is left to load-time repair. `grantStarters` runs on every load
 * and is idempotent, so a v3 save whose party was empty — or one whose three members no longer
 * fill five slots — arrives with a working formation without this step guessing at one.
 */
const migrateV3ToV4: Migration = (save) => {
  const party = Array.isArray(save['activeParty'])
    ? save['activeParty'].filter((id): id is string => typeof id === 'string')
    : [];
  const { activeParty: _activeParty, ...rest } = save;

  return {
    ...rest,
    version: 4,
    formation: { front: party.slice(0, 2), back: party.slice(2, 5) },
  };
};

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * **Never delete or edit an entry once it ships.** A player can return after any number of
 * releases and their save has to walk the whole chain from wherever it was written.
 */
export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map<number, Migration>([
  [1, migrateV1ToV2],
  [2, migrateV2ToV3],
  [3, migrateV3ToV4],
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
