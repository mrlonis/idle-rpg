/**
 * The current save schema version.
 *
 * Bumping this without adding the matching entry to `MIGRATIONS` is a bug — the migration
 * chain will stall on the old version and refuse to reach current. The migration spec
 * asserts that every version below this one has a migration registered, so that mistake
 * fails in CI rather than on a player's device.
 *
 * **Zero, and it has been re-based to zero twice.** The first re-base folded five pre-release
 * versions and four migrations into a v0 baseline; the second folded the six that had accumulated
 * on top of it — gear, the ladder's new bottom, the achievement ledger, the quest windows, the
 * bounty board and the legendary pity counter — back into this one. Both ran on the single argument
 * that licenses either: **no save any of those versions wrote has ever existed outside
 * development.** See [saves](../../../docs/saves.md) for the reset and the condition that closes
 * the door on repeating it.
 *
 * ⚠️ **The version numbers are burned again, and more thoroughly than the first time.** 1 through 6
 * have each now meant two different things — the old v1 was milestone 1's gold counter and the
 * second v1 was the gear schema — and a build cannot tell any pair apart from the number alone. A
 * genuine save at one of those numbers would be read as *newer than this build* and discarded,
 * which is at least the safe direction; it is still a save nothing can recover. That is harmless
 * only while the audience is zero, and it is the cost of re-basing that is easiest to forget.
 *
 * **A save is unreadable now only by being newer than this build**, or by carrying a version that
 * is not a non-negative integer. There is nothing below this floor and there never will be. ⚠️ Any
 * test for the unreadable case must **derive** its version from `SAVE_VERSION` rather than write a
 * literal — a fixture naming a number went stale twice while the chain was growing, and a literal
 * written today is a test that quietly stops testing anything the first time the chain grows again.
 */
export const SAVE_VERSION = 0;
