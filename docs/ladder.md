# The ladder

The campaign, and how a run's position in it is expressed. **Sixteen chapters and seven hundred
stages** — 10, 20, 30, 40 and then twelve of fifty. Read [`core/ladder.ts`](../src/core/ladder.ts) before
touching progression, and [authoring](authoring.md) before adding a chapter.

The first six chapters are the two hundred stages the four-chapter cut carried, re-cut in milestone
19 so the boundaries land where a session does; chapters 7 through 10 are milestone 21, chapter 11
closed it, and chapter 12 — **The Rustwood** — is milestone 27, the first chapter whose enemies wear
gear. See [gear](gear.md) for what that turned out to be worth. Chapter 13 is **The Quarry** and
chapter 14 **The Shutgate**, which is where the campaign's difficulty gradient came back — not from
gear, but from a rarity cap the ladder has now climbed past. Chapter 15 is **The Underroad**, which
priced that gradient: every block it fields is roughly **half** the weight of chapter 14's. Chapter
16 is **The Spoilfield**, where the same arithmetic drove the board budget **through the floor of the
shipped enemy pool** — its blocks are roughly two fifths of chapter 15's, its final is 250/24, and it
is the last chapter that can step the gear ladder. See [authoring](authoring.md).

## The shape

`CHAPTER_CURVE` is a ramp to a permanent cap of fifty — base 10, step 10, band 1, max 50. **The long
ladder is more chapters, not longer ones.** The old banded growth toward two-hundred-stage chapters
is gone rather than deferred; revisit deliberately if fifty ever reads as too short at the far end.

**The chapter-size formula and the authored chapters are two statements of one fact.** `chapterSize`
says how long a chapter should be and `LadderShape` says how long the authored ones are;
`chapters.spec.ts` is what keeps them equal. ⚠️ **Never derive the shipped ladder's length from the
formula** — a build that ships thirteen chapters must not be talked into believing it has a hundred.

**Whether a stage is a mini-boss or a boss is a rule, not a field**: every tenth stage of a chapter
and the last one, so the rhythm is identical at either chapter length. What `data/` authors is a
line-up worthy of the slot it lands in, and `chapters.spec.ts` checks it did.

⚠️ **Every chapter ends on a boss fielded nowhere else, as a rule** — the Fenlord, the Pale Warden,
the First Cinder, the Ashfall Sovereign, the Chainsworn, the Hollow Seraph, The Cairn King, The
Withered Crown, The Anvil Crowned, The Everwound, The Last Order, The Ironbloom, The Undercut, The
Doorstone, The Unnumbered and The Inheritor. A re-cut that moves a boundary owes the new final a unique body before it ships.

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

**A rung per fifty-stage band** was the cadence under the margin rule. ⚠️ **The flattening halved it
and the reference parties are the record of that**: chapters 4–5 share `elite`, 6–7 share
`elite-plus`, 8–9–10 share `legendary`, and chapter 11 is the first rung move in three — to
`legendary-plus`, and it won the log-space comparison by five hundredths of a nat. ⚠️ **Chapter 12
stays on `legendary-plus` and that answer is exact rather than narrow**: its close of 250 sits under
that rung's cap of 260, so the level term vanishes and the ratio is `1.6 ** 5` = 10.4858 — |Δln|
**0.0000** against chapter 11's own seam, where `mythic` reads 16.777 at 0.470. Two chapters on one
rung is what the flat line produces whenever a cap is wide enough to hold both. ⚠️ **Chapter 13 makes
it three, which is the longest any rung has held on the flat line**, and it is the first seam since
the margin rule was retired where the level term does _not_ vanish: 275 is fifteen levels above the
cap, so `legendary-plus` reads **7.6774** (|Δln| 0.3117) against `mythic`'s 16.7772 (0.4700). That is
a flat line climbing into the top of a cap rather than the margin rule returning — **expect every
further chapter on this rung to close further above it.**

⚠️ **Chapter 14 makes it four, and the "expect it" above is now a measured trend rather than a
warning.** The Shutgate closes at 300, **forty levels** above the same cap: `legendary-plus` reads
**4.5665** (|Δln| 0.5197) against `mythic`'s 16.7772 (0.7816). The three most recent seam ratios run
**10.4858 → 7.6774 → 4.5665** — ×0.732 then ×0.595, compounding out of a ceiling that does not move.
⚠️ **That is the campaign's difficulty gradient returning from somewhere nobody planned it**, and it
brought back the first of the three guards milestone 24 widened against a promise about enemy gear:
`meanSurvivors < PARTY_SIZE` at the top of the ladder now holds, at 4.00 of five. ⚠️ **The cost is
that the seam chain has gone degenerate** — chapters 13 and 14 both clamp to 260, so the two parties
a seam compares are the same combatants. See [authoring](authoring.md).

⚠️ **Chapter 15 makes it five on one rung, and the decline now has a rate rather than a trend.** The
Underroad closes at 325, **sixty-five levels** above the cap: `legendary-plus` reads **2.7160** (|Δln|
0.5196) against `mythic`'s 16.7772 (1.3013). The four most recent seams run **10.4858 → 7.6774 →
4.5665 → 2.7160**, and the last two factors are both exactly `perLevel.common ** -25` = 0.595 — so
once a chapter closes entirely above its rung's cap the seam divides by **1.680** a chapter **by
construction**.

⚠️ **Chapter 16 makes it six, and the rate has now held three times, which retires it as a
prediction and makes it arithmetic.** The Spoilfield closes at 350, **ninety levels** above the cap:
`legendary-plus` reads **1.6154** (|Δln| 0.5196 — the same figure, because the factor is constant)
against `mythic`'s 13.6290 (1.6130). The five most recent seams run **10.4858 → 7.6774 → 4.5665 →
2.7160 → 1.6154**. ⚠️ **`mythic` is now further away rather than closer**: its cap of 340 sits _below_
the chapter's close as well, so the rung the arithmetic prefers wins by a wider margin every chapter,
and the boards a `mythic` party would need are past the Unmade's ceiling by more each time.

⚠️ **The seam chain is now degenerate three links deep.** Chapters 13, 14, 15 and 16 all clamp to 260,
so `QUARRIED`, `SHUTGATED`, `UNDERROAD` and `INVESTED` are **four consecutive names for one set of five
combatants**, and the eight assertions either side of those three boundaries are three claims. Recorded
rather than repaired, for the third chapter running. ⚠️ **And `mythic` is not the way out**: measured, a `mythic` five at 325 needs boards
scaled ×2.4, which is an anchor near 3,550 health against the Unmade's ceiling of 1800 that
`enemies.spec.ts` enforces. **The rung the arithmetic prefers is the only one the enemy roster can be
authored for.** What that costs instead is the stat line: The Unnumbered is 680/40 against The
Doorstone's 1480/88. Copies asked of a
mortal character by the end of each band: **20** by the fen's fifty stages, 24 by the Marches, 32 by
the Vault, 38 by the Barrows, 44 by the Weald, 50 by the Anvil, 62 by the Wild.

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
