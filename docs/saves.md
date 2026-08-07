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
| `settings` | Player preferences. Not a save, and not versioned.   |

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
to stop the loop and replace the in-memory state, not merely empty the slots. `GameLoopService.reset`
is what does that, in an order that matters — see [milestone 13](milestones.md).

### Settings are a third key, and deliberately not a save

`ui/settings.service.ts` owns `settings`, and nothing about the save chain applies to it.

**A preference describes the app; a save describes a run.** Keeping them apart is what lets the run
reset leave the player's battle speed alone, and what stops a save this build cannot read from
taking their preferences down with it. It also keeps every future setting from being a
`SAVE_VERSION` bump and a migration and a fixture, for a value nothing in `core/` ever reads.

**There is no version field on it, and that is a decision.** A save needs one because its fields are
interdependent — a wallet without its rates is a broken run — so it needs a chain that can restate
the whole object. Settings are the opposite shape: every field is independent, optional, and has a
default that is always correct, so the repair is **per field, on read**. An unrecognised value
becomes the default, an unknown field is ignored, and a missing field defaults; that subsumes
migration in both directions. The bar for revisiting it is a key whose old and new meanings
**collide** — the exact trap the rarity shift below records for the save chain, where a stored value
kept its shape and changed what it denoted — and the answer there is a new key.

---

## Versioning and migration

`SAVE_VERSION` is **0**, and the migration table is **empty**. Every save carries its version.

**Bumping `SAVE_VERSION` without adding the matching migration is a bug.** The chain would stall
on the old version and never reach current. [`migrate.spec.ts`](../src/core/save/migrate.spec.ts)
asserts every version below current has a migration registered, so that mistake fails in CI rather
than on a device. It is vacuous at a one-version baseline and it is kept for exactly that reason —
it fired the moment the version first moved off zero, which is when nobody is thinking about it.

### The chain has been re-based twice, both times while nobody was playing

The first re-base collapsed five pre-release versions and four migrations:

| Step    | What it did                                                               |
| ------- | ------------------------------------------------------------------------- |
| v1 → v2 | Added `stage` and `battleCount`. The first real migration.                |
| v2 → v3 | Folded gold into the keyed wallet; added roster, party and pity.          |
| v3 → v4 | Replaced `activeParty` with `formation`, split in reading order.          |
| v4 → v5 | Cut the ladder into chapters: `stage` becomes a stage _within_ `chapter`. |

Six more accumulated on top of that baseline, and the second re-base collapsed all of them:

| Step    | What it did                                                                      |
| ------- | -------------------------------------------------------------------------------- |
| v0 → v1 | Gear: `alloy`, the per-character loadout, the bag, the mint counter, the ledger. |
| v1 → v2 | The ladder grew a bottom — every stored `roster[].rarity` shifted up by two.     |
| v2 → v3 | The achievement claim ledger.                                                    |
| v3 → v4 | The daily and weekly quest windows.                                              |
| v4 → v5 | The bounty board's dispatch list.                                                |
| v5 → v6 | The legendary pity counter.                                                      |

Everything those steps wrote is simply part of the baseline shape now, and the current shape is
**v0** again.

**The argument is narrow and it is the only one that licenses either re-base: no save written by any
of those versions has ever existed outside development.** Nobody has played this game but its
author, on dev servers whose storage does not survive the session — so the chain was six migrations,
seven historical shapes and seven fixtures maintained for an audience of zero, each one a thing to
keep working and to reason about on every subsequent schema change.

⚠️ **The rule this suspends is scoped, not softened.** It reads: _never delete or edit a migration
once a build carrying it has reached a player._ That condition is what makes the rule enforceable
rather than aspirational, and it is also what closes the door — the moment anyone outside
development loads a save, the chain is permanent and the next version is 1 forever.

⚠️ **What a re-base costs is the version numbers, and this one spent them twice.** 1 through 6 have
each meant two different things: the old v1 was milestone 1's gold counter and the second v1 was the
gear schema; the old v3 was the rate table and the second v3 was the achievement ledger. A build
cannot tell any pair apart from the number alone. What it does with one is at least the safe
direction — a save at any of those numbers is _newer than this build_ and is discarded rather than
repaired into something plausible — but it is still a run nothing can recover. That is harmless only
while the audience is zero, and it is the part of re-basing that is easiest to forget.

**A save is unreadable now only by being newer than this build**, or by carrying a version that is
not a non-negative integer. `migrate.spec.ts` asserts the fact itself — the baseline migrates
cleanly, and every number above it throws — and `save-recovery.spec.ts` derives its unreadable
fixture from `SAVE_VERSION + 1`. ⚠️ **That fixture went stale twice while the chain was growing**,
each time because a literal quietly became a live version; both times it failed loudly, and either
time it could instead have kept passing while testing nothing. Derive it, never write it down.

**The machinery survived the entries, both times, and that is what it was for.** `migrate()` still
walks a chain, and `migrate.spec.ts` still drives multi-step chaining against a synthetic history.
Proven code with no callers is a far better position than an unproven chain walker written on the
day the first real migration is urgent — which is precisely the position v0 → v1 landed in, and it
worked first time.

### What the deleted steps are worth remembering for

The migrations are gone; three of the things they taught are not.

**Five of the six were additive, and one was not.** `alloy`, the ledger, the quest windows, the
dispatch list and `legendaryPity` all _added_ a field, so getting one wrong loses something that was
never there. The rarity shift _reinterpreted_ one: `common` and `common-plus` went in below `rare` in
`RARITIES`, so a stored `4` meant `legendary` before and `elite` after, and an unmigrated save parsed
cleanly, validated cleanly and **demoted the entire roster two rungs** with nothing structural able
to see it. ⚠️ **Inserting a rung anywhere but the top of `RARITIES` is still a save migration, not a
content edit** — the re-base removed the code, not the rule, and `roster/types.ts` carries the
warning next to the array itself.

**An additive migration credits nothing and owes nothing, unless there is a receipt to read.** Gear
arrived empty because nothing in an older save recorded a fight that would have dropped a piece;
the quest windows arrived at index `-1` so the first roll opens a fresh day; `legendaryPity` arrived
at zero rather than derived from `pity`, because the two cycles are independent and a guess dressed
as data is worse than a generous default. The counter-example is `reconcileClearedStages` below,
where a surviving gold rate genuinely _is_ a receipt for progress that was silently dropped.

⚠️ **A migration's constants are written out, never imported.** A migration is _dated_: it describes
the shape that existed the day it shipped, and a constant a later release is free to retune would
silently change what that step means for every save that has not run it yet. Every step in both
chains was written that way, and the next one should be too.

⚠️ **An unknown achievement track id is kept, not dropped** — the opposite of how the roster treats
an unknown character. A character this build does not ship cannot be fielded; a claim count for a
track it does not ship costs one integer, and dropping it is what would **re-pay every award on that
track** if it ever came back. The fixture carries a retired id for exactly this.

### The rules that still apply

Migrations are pure `(old) => (new)` steps, chained.

**Order matters: migrate the raw JSON shape first, then decode and repair.** Migrations are
written against historical shapes, so they have to run before anything tries to interpret fields.

**A save with no version at all is now unreadable rather than assumed to be the oldest.** It used
to be read as v1, because v1 predated versioning and guessing beat discarding a real player's run.
The re-base removed the thing that guess was for: nothing below this baseline exists, so an
absent version means damage.

---

## Repair

`fromSaveData` decodes and repairs in one pass, reporting a `RepairIssue[]` rather than throwing.
`NaN` gold becomes 0; unknown character ids are dropped; out-of-range values clamp.

`loadSave` never throws. When a save cannot be used at all it returns a fresh run with `fatal`
set, and **that fresh run is written over the unreadable bytes like any other.**

That reversed with the first re-base, and the trade is worth being explicit about. `fatal` used to bar
the way to the primary slot, on the grounds that the bytes might be a newer build's save and would
be good again after an update. What that bought was a run surviving a downgrade; what it cost was
a game that boots, plays, and silently never writes anything down — the worse failure of the two,
and the one a player actually hits. Two jobs remain and both earn their place:

- **The backup slot is still tried first.** `SaveService.load` only reaches a fresh run once the
  backup is unreadable too, so a corrupted primary costs nothing.
- **The player is still told.** The home screen says the run is fresh because the save could not
  be read, which is the difference between a bug you can report and a run that just vanished.

### Load-time repair is a separate thing from migration

Three functions run on **every load**, not behind a version gate:

- **`grantStarters`** — covers a save arriving with an empty roster.
- **`repairLoadouts`** — checks gear against the content this build ships. The save layer parses a
  piece's _shape_; whether the id resolves, whether the piece sits in the slot it claims, and whether
  its archetype still matches its wearer all need both the bag and the shipped content, and only
  `ui/` can see both. It only ever removes what cannot be rendered, so a healthy save comes back as
  the same object. **The archetype check is reachable with no corruption at all** — a build that
  re-authors a character's role gets there — which is why it is a load-time repair rather than a
  migration.
- **`reconcileClearedStages`** — re-derives the clear count from the surviving gold rate, restores
  every rate those stages unlock, and **pays the first-clear bonus for each stage it credits.** It
  only ever raises, so a healthy save passes through by reference and is not even republished.

  ⚠️ **The receipt is only good as far as the run has travelled, and milestone 11 is when that
  stopped being pedantry.** A gold rate is denominated in whatever the rate curve said the day it
  was written, and that curve was re-derived from scratch when the ladder went from twenty-four
  stages to a hundred — so a veteran arriving with the old ladder's top rate reads, against the new
  curve, as somebody who has cleared the entire game, and crediting that would hand over every
  first-clear bonus on the ladder for stages they have never seen. The repair now caps the receipt
  at the linear index of the position the save is parked on: **a run cannot have cleared more
  stages than it has reached.** That is true independently of any curve, which is why it is the
  right guard rather than a version check.

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
   happen". A long-deleted migration seeded `clearedStages` from `stage - 1`, which looked careful —
   "do not pay a bonus they already earned" — and was exactly backwards: the first-clear bonus did
   not exist in the version it was reading, so nothing had been earned, and marking those stages
   settled closed the door on all 3,000 crystals silently and permanently.

---

## Fixtures

[`src/core/save/fixtures/`](../src/core/save/fixtures/) holds one JSON save per historical
version — currently just `v0.json` — and
[`fixtures.spec.ts`](../src/core/save/fixtures.spec.ts) migrates every one of them to current.

The coverage assertion in that spec is what the file is worth having for while there is nothing to
chain: it is vacuous at a one-version baseline, and it fired the moment `SAVE_VERSION` first moved
off zero, which is exactly the job it had. `v0.json` otherwise pins what a current save looks like.

⚠️ **A fixture should store values a default would not produce.** `v0.json` carries a mid-cycle
`legendaryPity`, a worn loadout, an unaligned piece, a mint counter deliberately ahead of the bag,
and a retired achievement track alongside a live one. A fixture storing the empty value passes
identically whether the decoder reads the field or silently defaults it, which is precisely the
distinction it exists to make — and the empty value is always the obvious thing to write.

**Add a fixture whenever `SAVE_VERSION` is bumped.** A migration chain with no fixture for a
version is a chain nobody has proved works from that version. The coverage assertion in that spec
is what fails if the fixture is forgotten.

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
