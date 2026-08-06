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
 * The two rungs the copies-only rewrite inserted below `rare`, and therefore the amount every stored rarity
 * index is out by.
 *
 * ⚠️ **Written as a literal, not derived from `RARITIES`.** A migration is dated: it describes the
 * ladder as it was the day it shipped. Deriving this from the live array would mean a *third*
 * rung inserted later silently changed what this step does to saves that have not run it yet —
 * they would be shifted by the new total instead of the old one, and every character would land
 * on a rung it never earned. Same rule as the v0 → v1 gear literals above.
 */
const RUNGS_INSERTED_BELOW_RARE = 2;

/**
 * v1 → v2: the ladder grew a bottom.
 *
 * `common` and `common-plus` went in below `rare`, so `RARITIES` index 0 stopped meaning `rare`
 * and started meaning `common`. Every rarity a v1 save recorded is therefore a claim about a rung
 * two places lower than the one the player earned, and left alone it would demote the entire
 * roster — an `elite` character reading as `rare`, with its level cap collapsing from 100 to 40
 * and its second skill disappearing.
 *
 * Shifting every entry up by two maps each rung to *itself*: what was `rare` is `rare` again, what
 * was `elite` is `elite` again. Nobody gains a rung and nobody loses one. Common-tier characters
 * come out sitting at `rare` — two rungs above the new floor, which they never paid for — and that
 * is the intended reading rather than an oversight: they earned their place on the old ladder, and
 * the new rungs are beneath where they already stand.
 *
 * A missing or damaged rarity is left for load-time repair rather than guessed at here. `serialize`
 * clamps it to the character's starting rarity, which is a better answer than any this step could
 * invent, and shifting a corrupt value would only make it corrupt somewhere else.
 */
const migrateV1ToV2: Migration = (save) => {
  const roster = Array.isArray(save['roster']) ? save['roster'] : [];
  return {
    ...save,
    version: 2,
    roster: roster.map((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) {
        return entry;
      }
      const record = entry as Record<string, unknown>;
      const rarity = record['rarity'];
      return typeof rarity === 'number' && Number.isFinite(rarity)
        ? { ...record, rarity: rarity + RUNGS_INSERTED_BELOW_RARE }
        : record;
    }),
  };
};

/**
 * v2 → v3: the achievement claim ledger.
 *
 * Additive, and the cheapest step in the chain. Every counter an achievement track is paid against
 * — `clearedStages`, `battleCount`, `pullCount` — was already stored by v2, so the only thing
 * missing is the record of what has been *taken*, and for a save written before achievements
 * existed the honest answer is nothing.
 *
 * **A returning player is therefore owed every award their clear count has already earned**, and
 * that is the intended reading rather than an oversight. It is the same position `reconcileClearedStages`
 * takes on a first-clear bonus the migration would otherwise have closed the door on: crediting
 * progress the player demonstrably made is the only fair place to land, and here it costs nothing
 * to get right because the earned side is derived rather than stored.
 *
 * ⚠️ The empty record is written out rather than imported from `core/achievements.ts`. A migration
 * is *dated* — it describes the shape that existed the day it shipped — and `emptyAchievements()`
 * is a function a later release is free to change. Same rule as the v0 → v1 gear literals above.
 */
const migrateV2ToV3: Migration = (save) => ({ ...save, version: 3, achievements: {} });

/**
 * v3 → v4: the daily and weekly quest windows.
 *
 * Additive. Both windows arrive at index `-1`, which is below any real period index, so the first
 * roll after load opens them against the counters as they stand — a returning player gets a fresh
 * day of quests rather than one that is already half spent, and nothing is owed for battles fought
 * before quests existed.
 *
 * ⚠️ Written out as literals rather than through `emptyQuestWindows()`, for the reason the v0 → v1
 * gear fields are: a migration is dated, and a helper a later release is free to change would
 * silently alter what this step means for every save that has not run it yet.
 */
const migrateV3ToV4: Migration = (save) => ({
  ...save,
  version: 4,
  quests: {
    daily: { index: -1, baseline: {}, claimed: [] },
    weekly: { index: -1, baseline: {}, claimed: [] },
  },
});

/**
 * The migration chain, keyed by the version being migrated *from*.
 *
 * **Four entries, and they are the first this table has held since the reset.** Five schema
 * versions and four migrations were collapsed into a single v0 baseline while the game was still
 * pre-release — see [saves](../../../docs/saves.md) for the reset and the condition that closes
 * the door on repeating it. Everything from v0 upward is permanent.
 *
 * **The machinery below was deliberately kept when the old entries went**, on the argument that an
 * untested chain walker written on the day the first real migration is already urgent is the worst
 * possible time to be debugging one. `migrate.spec.ts` has proved the walk against a synthetic
 * history throughout; {@link migrateV0ToV1} is what it was being kept for.
 *
 * They differ in kind, and {@link migrateV1ToV2} is the more dangerous shape: the other three
 * *add* fields, so getting one wrong loses something that was never there, while v1 → v2
 * *reinterprets* one, so getting it wrong silently rewrites progress a player earned.
 */
export const MIGRATIONS: ReadonlyMap<number, Migration> = new Map<number, Migration>([
  [0, migrateV0ToV1],
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
