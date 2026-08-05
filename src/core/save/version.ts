/**
 * The current save schema version.
 *
 * Bumping this without adding the matching entry to `MIGRATIONS` is a bug — the migration
 * chain will stall on the old version and refuse to reach current. The migration spec
 * asserts that every version below this one has a migration registered, so that mistake
 * fails in CI rather than on a player's device.
 *
 * **Zero because the chain was re-based, not because nothing has happened.** Five versions and
 * four migrations were collapsed into this baseline while the game was still pre-release — see
 * [saves](../../../docs/saves.md). A save declaring any other version is discarded and the run
 * starts fresh; there is nothing below this floor and there never will be.
 */
export const SAVE_VERSION = 0;
