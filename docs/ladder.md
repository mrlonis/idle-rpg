# The ladder

The campaign, and how a run's position in it is expressed. **Ten chapters and four hundred stages**
— 10, 20, 30, 40 and then six of fifty. Read [`core/ladder.ts`](../src/core/ladder.ts) before
touching progression, and [authoring](authoring.md) before adding a chapter.

The first six chapters are the two hundred stages the four-chapter cut carried, re-cut in milestone
19 so the boundaries land where a session does; the last four are milestone 21.

## The shape

`CHAPTER_CURVE` is a ramp to a permanent cap of fifty — base 10, step 10, band 1, max 50. **The long
ladder is more chapters, not longer ones.** The old banded growth toward two-hundred-stage chapters
is gone rather than deferred; revisit deliberately if fifty ever reads as too short at the far end.

**The chapter-size formula and the authored chapters are two statements of one fact.** `chapterSize`
says how long a chapter should be and `LadderShape` says how long the authored ones are;
`chapters.spec.ts` is what keeps them equal. ⚠️ **Never derive the shipped ladder's length from the
formula** — a build that ships ten chapters must not be talked into believing it has a hundred.

**Whether a stage is a mini-boss or a boss is a rule, not a field**: every tenth stage of a chapter
and the last one, so the rhythm is identical at either chapter length. What `data/` authors is a
line-up worthy of the slot it lands in, and `chapters.spec.ts` checks it did.

⚠️ **Every chapter ends on a boss fielded nowhere else, as a rule** — the Fenlord, the Pale Warden,
the First Cinder, the Ashfall Sovereign, the Chainsworn, the Hollow Seraph, The Cairn King, The
Withered Crown, The Anvil Crowned and The Everwound. A re-cut that moves a boundary owes the new
final a unique body before it ships.

⚠️ **The rule is about the _headline_ body and nothing else.** A lieutenant may stand on its
chapter's final as support and may not _be_ it. The Gravewright does on `c7-s50`; the Longshadow,
the Grudgekeeper and the Redmaw do not, and all four are correct — a comment claiming the first was
"deliberately absent" survived a whole milestone, and removing it measures as a chapter final 6%
harder than the stage before it that the tuned party clears with all five alive.

**Auto-battle unlocks when chapter 1 falls** (`AUTO_BATTLE_UNLOCK_CHAPTERS = 1`, resolved through
`chaptersCleared`), and all seven [towers](towers.md) open with it.

## A position is a pair; a clear count is a number

⚠️ **`GameState.stage` is the stage within its chapter, not a position on the whole ladder.** It was
one until milestone 11 and it kept its name, so reading it as a linear index is a bug that presents
as **a player being teleported** — chapter 2 stage 3 and chapter 1 stage 3 are the same number.
`stageIndex(ladder, position)` is the only way to a linear index, and it is what the clear count,
the crystal rate and the reward curve are all functions of.

**The asymmetry is deliberate.** A position is a _place_ and has to survive the ladder being re-cut
around it; a clear count is a _quantity earned_ and means the same thing however the chapters are
sliced.

⚠️ **The milestone-19 re-cut changed what a stored position means and wrote no migration.** Dev-only
saves clamp backward and re-climb; [saves](saves.md) records that along with the one-line exact
remap that becomes **mandatory** if chapters are ever re-cut after release.

## What a stage authors

**A stage authors its line-up and its level and nothing else.** Since milestone 11 the rates, the
lump and the first-clear crystals are derived from where the stage sits — `StageEncounterData` is
what `data/` writes, and `resolveStage` turns it into the `StageData` the simulation takes.

⚠️ **Do not add an authored payout back onto a stage.** It would be a second mechanism on the same
number, and because `raiseRates` takes the larger of the two, whichever happened to be bigger would
silently win. See [economy](economy.md) for the income curve itself.

## The rung cadence

**A rung per fifty-stage band.** It read "one rung per chapter" until milestone 19 multiplied the
boundaries without moving a rung ask. Copies asked of a mortal character by the end of each band:
**20** by the fen's fifty stages, 24 by the Marches, 32 by the Vault, 38 by the Barrows, 44 by the
Weald, 50 by the Anvil, 62 by the Wild.

⚠️ **Three of those were quoted wrong by one or two for several milestones**, which is the ordinary
cost of carrying a running total by hand: `MORTAL_LADDER` alternates cheap and expensive rungs
(3, 7, 4, 8, 5, 9, 6, 10), so the step between chapters alternates 6 and 10 rather than being
constant, and "six more than the last chapter" was true twice and then repeated on faith.
**Recompute it.**

⚠️ **The cadence is the assumption under the levelling-versus-ascension guard.** A band climbed ~65
levels and a rung only pays for 22.6, so the two axes drifted apart by construction — which is why
the guard measures the rungs' **share** of the climb in log space rather than a ratio. See
[testing](testing.md).

⚠️ **The flattening inverted that drift and it is the single most important consequence of the
retune.** A band now climbs **25** levels — ×1.68 of party power — against a rung worth **×1.60**, so
the two axes very nearly _cancel_ instead of drifting apart. A player who finishes a chapter and buys
the rung it paid for is level with the next chapter rather than behind it, which is why the campaign
has no difficulty gradient of its own and why the escalation is expected to arrive from enemy gear
instead. [authoring](authoring.md) records the three guards widened to hold that trade in view and
the condition that restores each.

## ⚠️ Two guards that measured "the ladder must not consume the curve" were retired

`chapters.spec.ts` held the top stage under `LEVEL_CURVE.maxLevel / 2` = 500, and `levels.spec.ts`
held a ratio of what the ceiling costs to what the top stage demands, floor 4. Under the old line
chapter 10 closed at **588** and read **3.62**, failing both.

⚠️ **Both would pass again today — chapter 10 now closes at 200 — and neither is coming back.** A
guard that a retune happens to satisfy is not thereby a good guard: the reasoning below is why they
were retired, and it is about what they _measure_, not about what they read on any one ladder.

**Neither was satisfiable by any chapter the margin rule permits.** `ascended` caps at 500, and a
chapter closing below its own rung's cap is a walkover. And **both quantities fall on every chapter
by construction**, so moving either buys one chapter at the price of pretending the guard still
watches something.

**What owns the claim now** is `levels.spec.ts`'s **"leaves rungs unspent above everything the ladder
asks for"** — the top stage must stay below `caps[12]` = 700. It cannot decay, because the rung count
is fixed however long the ladder gets. That is the third guard in this project retired rather than
slid, after the absolute hours-to-the-ceiling and the ratio that replaced it.

⚠️ **What was measured then and deliberately not guarded**: the level line added ~90 levels a chapter
(80, 91, 94, 98), so the rung claim fired at **chapter 12** and the curve was consumed around
**chapter 15**.

⚠️ **The flattening to 0.50 levels a stage moved both horizons out by a factor of about three.** A
chapter now adds **25** levels, so the rung claim fires at **chapter 30** and the curve is consumed
around **chapter 42**. That is what the retune bought, and it is the reason for it: the campaign is
planned for ~100 chapters and the old line ran out at 14. ⚠️ **42 is still not 100** — reaching a
hundred needs either 0.20 levels a stage or a `maxLevel` past 2400 with `perLevel.common` retuned to
match. **How long the campaign is meant to be is still a roadmap decision**; see
[history](history.md).

## Adding a chapter

The procedure, the level line and the board constraints are all in [authoring](authoring.md). Two
things belong here because they are facts about the ladder rather than about a session:

- ⚠️ **The margin rule is retired: a chapter no longer out-climbs the rung it asks for.** It read
  "a chapter that asks for a new ascension rung has to out-climb it", because a rung is worth ×1.6
  and the enemy side has **no rungs at all** — so a party matching the enemy's level from one rung
  higher is ×1.6 ahead of the content. That held from chapter 5 (the Bound Marches) through chapter
  10, with the margin growing +20 → +88. **The flattening to 0.50 levels a stage reversed it**: every
  chapter now runs entirely inside a cap the party already has, which is how chapters 1 through 4
  always worked. The campaign consumes 7 of 16 rungs rather than 11, and `mythic` — the signature-item
  unlock — is deliberately **outside** it now. See [authoring](authoring.md) for the line and for the
  difficulty gradient this knowingly trades away.
- **Adding a chapter is an economy change as much as a content one**, and four or five guards will
  fire. Only some will be about the chapter. ⚠️ **Sort them first into "content outgrew a threshold"
  and "this ratio moves every chapter regardless"** — the first is a real retune and the second needs
  re-deriving. See [economy](economy.md) and [testing](testing.md).
