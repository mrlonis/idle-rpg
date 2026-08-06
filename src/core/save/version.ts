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
 *
 * **Three because milestone 14 added achievements.** v2 → v3 is additive and is the cheapest
 * migration in the chain — one empty record — because the counters the tracks are paid against
 * were all already stored. A v2 save arrives having claimed nothing, which is the truth about it.
 *
 * **Four because the same milestone added quests.** v3 → v4 is additive for the same reason: a
 * quest window stores a baseline of counters the save already held, so nothing had to start being
 * recorded that was not already.
 *
 * **Five because the same milestone added the bounty board.** v4 → v5 is additive: a list of
 * running missions, each an id, a crew and a start time.
 *
 * ⚠️ **This exhausts the version burn.** The v0 re-base freed 1 through 5 and all five have now
 * been re-issued, so **no number below `SAVE_VERSION` still means "written before the baseline"**.
 * `migrate.spec.ts` and `save-recovery.spec.ts` both used to test that case against a real
 * pre-baseline number; there is none left, and both now test it against a *future* version
 * instead — which is the only remaining way a save can be unreadable. See [saves](../../../docs/saves.md).
 */
export const SAVE_VERSION = 5;
