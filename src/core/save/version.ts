/**
 * The current save schema version.
 *
 * Bumping this without adding the matching entry to `MIGRATIONS` is a bug — the migration
 * chain will stall on the old version and refuse to reach current. The migration spec
 * asserts that every version below this one has a migration registered, so that mistake
 * fails in CI rather than on a player's device.
 *
 * **The floor is zero because the chain was re-based, not because nothing has happened.** Five
 * versions and four migrations were collapsed into a v0 baseline while the game was still
 * pre-release — see [saves](../../../docs/saves.md). There is nothing below that floor and there
 * never will be; a save declaring a version outside `[0, SAVE_VERSION]` is discarded and the run
 * starts fresh.
 *
 * **One above it because milestone 12 added gear.** v0 → v1 is additive and is the first entry the
 * chain walker has ever had to walk.
 *
 * **Two because the copies-only rewrite grew the ladder a bottom.** v1 → v2 is the first migration here that
 * *reinterprets* a field rather than adding one: two rungs went in below `rare`, so every stored
 * rarity index means a rung two lower than it did. That is the failure mode `RARITIES` is now
 * commented against — an insert anywhere but the top of that array is a save migration, not a
 * content edit.
 */
export const SAVE_VERSION = 2;
