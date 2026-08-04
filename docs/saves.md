# Saves

How a run is persisted, migrated and repaired.

**The governing rule: loading must never throw.** A thrown error costs the player their entire
run, and there is no server to restore it from. Every failure path clamps, defaults, or falls back
to a fresh run without destroying what is on disk.

See [milestones](milestones.md) for the incidents that produced these rules.

---

## Storage

`@capacitor/preferences`, in two slots:

| Key        | Contents                                             |
| ---------- | ---------------------------------------------------- |
| `save`     | The primary save.                                    |
| `save.bak` | The previous primary, written before each overwrite. |

**Never use `localStorage`.** On iOS, WKWebView local storage lives in a cache-class container the
OS can purge under storage pressure — players have lost runs that way. Preferences is backed by
`UserDefaults` on iOS and `SharedPreferences` on Android, survives eviction, and is included in
device backups.

Because it lands in `Library/Preferences/<bundle>.plist`, **saves are already covered by iCloud
and Google backups with zero code.** What that does and does not cover is tabulated in milestone
12 — the short version is that a new phone restores fine and an iOS delete-and-reinstall does not.

### When it writes

- **`visibilitychange`** is the real trigger. `beforeunload` is unreliable in a WebView and iOS
  can suspend without warning.
- **At the end of every battle**, added in milestone 7. Results reach `GameState` when the
  animation finishes but used to reach storage only on the two triggers below, so a hard suspend
  could lose several _completed_ battles — most of an auto-battle climb at 4x. Writing per battle
  is what makes "losing the app costs the fight in flight and nothing else" true.
- **A 30-second autosave** is the backstop, not the mechanism.

⚠️ **Writes are serialised, and that is a correctness rule rather than a performance one.** One
write is a read-then-write across both slots — read the primary, copy it to the backup, overwrite
the primary. Two of those in flight together interleave: both read the same primary, and whichever
lands last wins, so an **older state can overwrite a newer one**. Persisting per battle is what
made that reachable, since at 4x it is about one write a second and on a device each is a bridge
round-trip rather than a microtask. `SaveService` therefore keeps at most one write in flight and
**coalesces** anything that arrives during it to the newest state — states are snapshots of one
monotonically advancing run, so a dropped intermediate costs nothing, whereas a queue growing with
the battle rate would be a backlog of writes that were stale before they started. Serialising at
the storage layer rather than pacing the caller keeps the game's frame rate off the disk's
critical path.

⚠️ **The store is injected, not imported.** `SaveService` takes its key/value backend from the
`KEY_VALUE_STORE` token, whose default factory returns `@capacitor/preferences`. That seam exists
for the spec: the unit-test builder shares one module registry across every spec file, so
`vi.mock('@capacitor/preferences')` is silently order-dependent and fails on some machines and not
others. Overriding a provider cannot be.

⚠️ **The running game overwrites external edits.** It holds authoritative state in memory and
persists on the way out, so clearing storage from inside the app is undone by the app. A reset has
to stop the loop and replace the in-memory state, not merely empty the slots.

---

## Versioning and migration

`SAVE_VERSION` is **4**. Every save carries its version.

**Bumping `SAVE_VERSION` without adding the matching migration is a bug.** The chain would stall
on the old version and never reach current. [`migrate.spec.ts`](../src/core/save/migrate.spec.ts)
asserts every version below current has a migration registered, so that mistake fails in CI rather
than on a device.

| Step    | What it did                                                      |
| ------- | ---------------------------------------------------------------- |
| v1 → v2 | Added `stage` and `battleCount`. The first real migration.       |
| v2 → v3 | Folded gold into the keyed wallet; added roster, party and pity. |
| v3 → v4 | Replaced `activeParty` with `formation`, split in reading order. |

Migrations are pure `(old) => (new)` steps, chained. **Never delete an old migration** — a save
from any historical version must still reach current.

**Order matters: migrate the raw JSON shape first, then decode and repair.** Migrations are
written against historical shapes, so they have to run before anything tries to interpret fields.

⚠️ **A migration's constants are written out, never imported.** The rank sizes in v3 → v4 are
literals rather than `FRONT_ROW_SIZE`. A migration is _dated_: it describes the shape that existed
the day it shipped, and a constant a later release is free to retune would silently change what
that step means for every save that has not run it yet.

---

## Repair

`fromSaveData` decodes and repairs in one pass, reporting a `RepairIssue[]` rather than throwing.
`NaN` gold becomes 0; unknown character ids are dropped; out-of-range values clamp.

`loadSave` never throws. When a save cannot be used at all it returns a fresh run with `fatal`
set — and **the UI must not overwrite the primary slot in that case.** The existing bytes are the
player's only copy, and a future-versioned save from a newer build becomes readable again as soon
as they update.

### Load-time repair is a separate thing from migration

Two functions run on **every load**, not behind a version gate:

- **`grantStarters`** — covers a save arriving with an empty roster.
- **`reconcileClearedStages`** — re-derives the clear count from the surviving gold rate, restores
  every rate those stages unlock, and **pays the first-clear bonus for each stage it credits.** It
  only ever raises, so a healthy save passes through by reference and is not even republished.

They live in `ui/` because they need `data/` — and `core/` may not import `data/`. **That
constraint is the whole reason they exist**, and it produced three rules worth more than the fix
that prompted them:

1. **When a migration cannot express something because it cannot see content, the missing half
   belongs in an idempotent load-time repair** — and the migration's doc comment should say so. A
   migration that quietly does half the job is worse than one that does none, because the half it
   did looks like success.
2. **Crediting progress and paying for it are the same operation.** Anything that advances
   `clearedStages` must settle what that stage owes in the same step. Marking a stage cleared
   without paying it is strictly worse than leaving it uncredited, because the normal reward path
   will then skip it forever and nothing will ever notice.
3. **A migration should default to crediting nothing.** Zero means "not yet settled", not "did not
   happen". The v2 → v3 migration seeded `clearedStages` from `stage - 1`, which looked careful —
   "do not pay a bonus they already earned" — and was exactly backwards: the first-clear bonus did
   not exist in v2, so nothing had been earned, and marking those stages settled closed the door on
   all 3,000 crystals silently and permanently.

---

## Fixtures

[`src/core/save/fixtures/`](../src/core/save/fixtures/) holds one JSON save per historical
version — `v1.json` through `v4.json` — and
[`fixtures.spec.ts`](../src/core/save/fixtures.spec.ts) migrates every one of them to current.

**Add a fixture whenever `SAVE_VERSION` is bumped.** A migration chain with no fixture for a
version is a chain nobody has proved works from that version.

---

## What is deliberately absent

**No anti-cheat.** A player editing their own save affects only their own run. Do not add
obfuscation, checksums-as-security, or tamper detection. This is also why save export/import has
none of the downsides it would have elsewhere — the usual objection is duping, and duping is
already permitted by design.

**No clock-tamper defence.** Winding the device clock forward costs nothing, because there is
nothing to protect. The offline guards exist to handle _damage_, not adversaries; see
[economy](economy.md).

**No save export or import**, currently. The decision and the gaps it leaves are recorded in
milestone 12 — the trigger to revisit is a real report of a lost run, not a hypothetical.
