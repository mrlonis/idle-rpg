# The ladder

The campaign, and how a run's position in it is expressed. **Thirty chapters and one thousand
five hundred and ten stages** — 10, 20, 30, 40, then fifteen of fifty and eleven of sixty. ⚠️ **That
count was wrong here by three chapters and a hundred and eighty stages when chapter 26 read it**, so
recompute it rather than quoting it. Read [`core/ladder.ts`](../src/core/ladder.ts) before
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
is the last chapter that can step the gear ladder. Chapter 17 is **The Quickmire**, the first chapter
whose gear does not ramp at all (Relic 100 on every board), the first that had to be **57.7% new
blocks** because the pool cannot supply a returning majority at its weight, and the first whose seam
ratio falls **below 1.00**. Chapter 18 is **The Slowgrowth**, which is where that arithmetic ran out
and the campaign moved a rung for the first time in seven chapters — to `mythic`, against the
log-space rule rather than with it, because there is no chapter 18 on `legendary-plus` at all.
Chapter 19 is **The Backcut**, which **stays** on `mythic` — the rule and the pool agree for the
first time in eight chapters, so it is a derivation rather than an override, and the distinction is
the point. Chapters 20 and 21 — **The Commonage** and **The Longebb** — stay on it too and are the
first chapters longer than fifty. Chapter 22 is **The Downstroke**, which moves the rung to
`mythic-plus`: the campaign's **second override**, licensed because at level 515 the five lightest
bodies in the whole game read 0% against a `mythic` five. Chapter 23 is **The Evenfall**, which
**stays** on `mythic-plus` — a derivation, and the first chapter whose binding pool constraint is the
returning blocks' **attack** rather than their weight. Chapter 24 is **The Nevermark**, which stays
on it again, and which found that **a filter on weight and attack is not a pool count**: screening
the 302 shipped blocks the way chapter 23 described leaves 15, all Monster, where _fielding_ them
leaves 121 across all seven factions. It is also the chapter that inverted chapter 21's `tenacity`
reading — declined there as flat, and the only six-step dial available here. Chapter 25 is **The
Thinground**, the campaign's **third override**, moving the rung to **`ascended`** — and the first
where the two halves of the override licence disagreed: its seam _below_ is 1.0711, **above** 1.00,
so what licenses it is the pool alone (4 of 312 blocks stand at level 605 against a `mythic-plus`
five, 282 against an `ascended` one). It is also the first chapter to choose its axis on **fight
length** rather than on survivors. Chapter 26 is **The Roughcast**, which **stays** on `ascended` —
and is the first chapter for which the rung question has no tuning answer left at all, because
`ascended` is the last rung whose cap the ladder has not already climbed past. Its axis is enemy
`critChance`: the same stat chapter 23 built a chapter on, measured from the **other side of the
board**, and licensed by the party's own register (`critBlock` Σ0.05, `critDamageResist` Σ0.15,
`tenacity` Σ0.00 across five) rather than by the enemy pool's. Chapter 27 is **The Looseline**, which
stays on `ascended` for the same reason and takes the degenerate stretch to **three links** — the
first stretch in the campaign's history that no rung move can end, because there is no rung left to
move to. Its axis is enemy `dodge`, and it is the first chapter whose **lean carries none of its own
axis**: 0 of the 54 shipped Human blocks carried a point of it. It is also the first chapter that has
to author a stat **below** its shipped ceiling — `dodge` runs to 0.55 in the pool and to 0.34 here —
because that ceiling was set at enemy levels 15 to 236 against parties that could still buy accuracy.
Chapter 28 is **The Windthrow**, which stays on `ascended` for the third chapter running and takes the
degenerate stretch to **four links**, level with the deepest the campaign has ever had. Its axis is
enemy `attackSpeed` — swing speed rather than casting frequency, because it accrues only after a basic
attack — and it is the **first axis in the campaign to grade in both value and carrier count**, which
is what a six-band chapter wants. ⚠️ **It is also the exact inverse of The Looseline's register
finding**: all four shipped `attackSpeed` carriers are Elf, the chapter leans Elf, and **not one of
them is light enough to stand on a single board in it** — owning a register and being able to field
it are different things.

Chapter 29 is **The Overburden**, which stays on `ascended` for the fourth chapter running and takes
the degenerate stretch to **five links**. ⚠️ **It is the chapter where the stat vocabulary ran out.**
Its axis is enemy `def` — the last stat in the block that had never been a chapter's premise, after
chapter 23 took all four mitigation stats at once and 24 through 28 took `tenacity`,
`physicalPierce`, `critChance`, `dodge` and `attackSpeed`. Everything else either belongs to a
shipped chapter, reads 0.00 against the calibrated five (`accuracy`, `magicPierce`), is a forbidden
shape (sustain) or is a design reversal (an enemy `ultimate`). What it found: **a defensive stat
grades in value and an offensive one grades in carrier count**, so this cannot be the two-dimensional
dial chapter 28 had; **armour on a heavy body is the ninety-second clock**, so a Dwarven chapter
about armour has to put it on the light bodies; and **a lone `def` carrier is rank-neutral** — the
third chapter running to price a lone carrier's rank and the first to get no answer at all. ⚠️ **It
is also the chapter that retired `levels.spec.ts`'s rung-headroom guard and answered the roadmap
question behind it: the campaign's ceiling is chapter 38**, unless the ascension ladder grows.
See [authoring](authoring.md).

Chapter 30 is **The Gravefault**, levels **725–755**. It pairs enemy `critChance` with
`critDamageAmp`: can the party reach the body whose frequent critical hits also hit hard?
Undead lead, with Dwarf support thinning toward the close. The reference five remain at
`ascended` rarity and effective level 500, making the sixth identical seam link. The settled
1.30-nat preference for staying is unchanged. See [the measured plan](chapter-30-plan.md).

## The shape

`CHAPTER_CURVE` is a ramp to a cap — base 10, step 10, band 1, max 50 — and since chapter 20 the
**cap is a schedule rather than a constant**: `raisedMaxFromChapter` 20 and `raisedMaxStages` 60, so
chapters 1–19 hold fifty and 20 onward hold sixty. **The long ladder is still more chapters, not
longer ones**; this steps **once**, on the deliberate revisit the old "permanent cap of fifty" note
invited, and a second step needs its own argument rather than this one as precedent. Chapter 21 is
the first chapter for which sixty is simply what the formula says, with nothing to decide.

⚠️ **A raised cap only ever applies from its own chapter on, and `chapterSize` refuses a lowering.**
That is what makes the step cheap: `min(ramp, cap)` with the ramp already past every cap means no
chapter below the schedule changes length, no shipped stage id moves, and `SAVE_VERSION` does not
move — a run's position is a chapter plus a stage within it. A _lowering_ would shorten a chapter
that has shipped and teleport every run standing past its new last stage, which is why it is refused
rather than honoured.

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
Doorstone, The Unnumbered, The Inheritor, The Latecomer, The Last Ring, The Interest, The Undivided
and The Unreturned. A re-cut that moves a boundary owes the new final a unique body before it ships.

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

⚠️ **Chapter 17 makes it seven on one rung, and the seam has gone below 1.00 for the first time.**
The Quickmire closes at 375, **a hundred and fifteen levels** above the cap: `legendary-plus` reads
**0.9608** (|Δln| 0.5196 — the same figure again, because the factor is constant) against `mythic`'s
8.1062 (1.6130). The six most recent seams run **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 →
0.9608**. ⚠️ **Below 1.00 means the content at the top of the ladder is nominally ahead of the party
it is tuned for**, and nothing the party gains changes that — what keeps the chapter winnable is that
its boards are half the weight of the one below. A chapter 18 on this rung reads **0.5718**.

⚠️ **The seam chain went degenerate four links deep**: chapters 13 through 17 all clamp to 260, so
`QUARRIED`, `SHUTGATED`, `UNDERROAD`, `SPOILED` and `QUICKMIRED` are **five consecutive names for one
set of five combatants**. Recorded rather than repaired, for four chapters running — **and chapter 18
ends it.**

## ⚠️ Chapter 18 moves the rung to `mythic`, and it is an override rather than a derivation

The Slowgrowth closes at 400 and asks for **`mythic`**, the first rung move since chapter 11. Against
chapter 17's seam of 0.9608, `legendary-plus` reads **0.5715** (|Δln| 0.5195) and `mythic` reads
**4.8214** (|Δln| 1.6131) — so **the log-space rule prefers staying put, by 1.09 of a nat, and the
chapter overrides it.**

⚠️ **The rule assumes the seam below it was correct, and below 1.00 it is not.** What it would have
reproduced is a board budget of **645 → 454** common-equivalent, or **129 → 91 per body on a board of
five**. Of the 238 blocks that existed before The Slowgrowth, **five** sit at or under 129 and
**none** at or under 91; the lightest body ever shipped is 100. **There is no chapter 18 on
`legendary-plus`** — not a hard one, not any.

⚠️ **`mythic` was ruled out at chapter 15 on a measurement, and the measurement inverted.** The
Underroad recorded that a `mythic` five needs boards scaled ×2.4 — an anchor near 3,550 health against
the Unmade's ceiling of 1800 — and chapters 16 and 17 quoted it unchanged. Three further halvings
happened underneath the claim. Measured at chapter 18: the budget is **5,442 → 3,830**
common-equivalent, **1,088 → 766 per body**, against a pool median at level 400 of **1,295** and an
Unmade of 5,820. **116 of 238 blocks sit inside the ordinary-slot band where 13 did for The
Quickmire.** Nothing in `data/` had to change.

⚠️ **What the move does not do is give the campaign a difficulty gradient of its own.** A chapter is
×1.68 of party power and a rung ×1.60, so the two still nearly cancel; what the rarity cap was
supplying was a gradient made of the party being unable to keep up, which is a defect wearing a
gradient's clothes. The three guards milestone 24 widened stay where they are, and "still costs that
party something at the top" still holds at 4.00 of five with zero timeouts.

⚠️ **The move is also the event both mode anchor caps were written to wait for.**
`DescentLevelData.anchorCap` and `ExpeditionRulesData.anchorCap` were conditioned on "a chapter asks
for a rung above `legendary-plus`" rather than on a chapter shipping. This is the first time that
condition has fired. See [descent](descent.md) and [expeditions](expeditions.md).

## ⚠️ Chapter 19 stays on `mythic`, and that it is _not_ an override is the point

The Backcut closes at 425 and asks for **`mythic`** again. Against chapter 18's seam of 4.8214,
`mythic` reads **2.8677** (|Δln| **0.5196**) and `mythic-plus` **24.1942** (|Δln| **1.6130**) — so
the log-space rule prefers staying put by 1.09 of a nat, **numerically the same margin chapter 18
overrode**, and this chapter does not override it.

⚠️ **What licensed chapter 18's override was that the seam below it was wrong, and nothing of that
kind holds here.** The Slowgrowth inherited a seam of 0.9608 — under 1.00, meaning the content was
nominally ahead of the party it was tuned for — and a board budget of 129 common-equivalent per body
against a pool whose lightest body is 100. At 2.8677 this seam is comfortably above 1.00, and **166 of 248 blocks sit inside the band
its ordinary slots use**. **A rung move argues its own case
every time; "the chapter below moved one" is not a case.**

⚠️ **The degenerate seam chain restarts, one link deep, and it will deepen on schedule.** Chapters 18
and 19 both close above `mythic`'s cap of **340** and both clamp to it, so `SLOWGROWTH` and
`INVESTED` are the same five combatants — exactly the shape chapters 13 through 17 recorded four
times, one rung higher. The Backcut's last board stands **eighty-five levels** above the cap, ×5.83,
and every further chapter on this rung divides the seam by `perLevel.common ** 25` = 1.680 **by
construction**: chapter 20 reads **1.7069**, chapter 21 **1.0161**, chapter 22 **0.6048**.

⚠️ **So `mythic` buys about three chapters, and the board budget runs out before the arithmetic
does.** That is the same countdown `legendary-plus` ran, and the next rung — `mythic-plus`, cap 420 —
is not due yet. **Re-measure it at chapter 21 rather than carrying this projection forward**; the
chapter-15 projection about `mythic` was correct when written, quoted unchanged for three chapters,
and false by the time it mattered.

## ⚠️ Chapter 20 stays on `mythic` a second time, and what nearly moved it was the pool

The Commonage closes at **455** — the first chapter longer than fifty, so it climbs **thirty** levels
rather than twenty-five — and asks for `mythic` again. Against chapter 19's seam of 2.8677, `mythic`
reads **1.5373** (|Δln| **0.6237**) and `mythic-plus` **12.9700** (|Δln| **1.5099**): `mythic` by
0.886 of a nat, and comfortably above 1.00, so this is a **stay** on the same terms chapter 19 set.

⚠️ **The degenerate chain reaches three links, exactly as chapter 19 predicted.** Chapters 18, 19 and
20 all clamp to `mythic`'s cap of 340, so `SLOWGROWTH`, `BACKCUT` and `INVESTED` are one set of five.
The Commonage's last board stands **a hundred and fifteen levels** above the cap — ×10.98, the
sharpest gap the campaign has carried.

⚠️ **The projection that this rung buys about three chapters was right about the arithmetic and
wrong about the pool, which bought about one and a half.** The board budget here is **2,145 → 1,328**
common-equivalent against The Backcut's 3,745 → 5,875, and at level 455 the lightest five _shipped_
commons that can stand together read **3% and 0.03 survivors**. The chapter needed two bodies at 150
and 170 health authored before its closing bands could exist.

⚠️ **And the wall is a _faction_ squeeze rather than an absolute one.** Twelve blocks sit under 150
health and every one is a **Monster** — The Quickmire's seventeen are still the light tail of the
whole game — while the four lightest Undead or Human blocks total 790 before a boss. **A chapter 21
leaning Monster does not meet this wall; every other lean does.** Re-measure the lean's own light
tail at chapter 21, not the pool's. ⚠️ **Chapter 21 leaned Monster and the prediction held exactly**
— fifteen of the 272 blocks that preceded it sit at or under 200 common-equivalent at level 485, and
**eleven are Monsters**.

## ⚠️ Chapter 21 stays on `mythic` a third time, and its own seam is the first under 1.00 on it

The Longebb closes at **485** — sixty stages again, and the first chapter for which sixty is the
schedule rather than an exception. Against chapter 20's seam of 1.5373, `mythic` reads **0.8241**
(|Δln| **0.6235**) and `mythic-plus` **6.9529** (|Δln| **1.5091**): `mythic` by 0.886 of a nat.

⚠️ **The seam it lands on is 0.8241 — under 1.00, which is the reading that licensed chapter 18's
override — and it still does not license one.** The Slowgrowth's move rested on the seam **below** it
being wrong (0.9608) _and_ on a board budget of 129 common-equivalent per body against a pool whose
lightest body was 100, so no chapter existed on the old rung. Here the seam below is 1.5373 and the
chapter was authorable: sixty boards, all at 100%, zero timeouts, longest fight 29.1s against a 72s
bar. **What licenses an override is the seam below being wrong, never this chapter's own seam being
small.** Three chapters running have now had to say which of the two they are doing.

⚠️ **`mythic-plus` was _fielded_ rather than reasoned about, which chapter 15 failed to do.** Chapter
20's own final refielded at level 485 reads **100% with all five alive in 3.2 seconds** against a
`mythic-plus` five and **0%** against the `mythic` one. The arithmetic and the measurement agree
here; record that they were checked.

⚠️ **The degenerate chain reaches four links.** Chapters 18 through 21 all clamp to `mythic`'s cap of
340, so `SLOWGROWTH`, `BACKCUT`, `COMMONAGE` and `INVESTED` are one set of five. The Longebb's last
board stands **a hundred and forty-five levels** above the cap — ×20.36.

⚠️ **This is the half chapter 20's pool projection predicted, and the closing band is at the floor.**
The budget runs **1,445 → 804** common-equivalent, and the whole shipped Monster mid-weight tier —
Carrion Swarm through Driftmouth Choker — reads **1.45 to 4.00 survivors at level 475** and **0.00 to
0.50 at 485**. What is left at 485 is the eleven light Monsters The Quickmire authored, which read
**3.75 of five unaided**. **Chapter 22 closes at 515, where the same boards are worth ×1.86 more and
nothing shipped can stand on one** — expect `mythic-plus` on the pool while the log-space rule still
prefers staying put.

## ⚠️ Chapter 22 moves the rung to `mythic-plus`, and it is the campaign's second override

The Downstroke closes at **515** — sixty stages again — and asks for **`mythic-plus`**. Against
chapter 21's seam of 0.8241, `mythic` reads **0.4418** (|Δln| **0.6235**) and `mythic-plus`
**3.7273** (|Δln| **1.5091**): the log-space rule prefers staying put by 0.886 of a nat, **and this
chapter overrides it.** It is the second override the campaign has, after chapter 18, and the two
have the same shape.

⚠️ **What licenses an override is the seam _below_ being wrong, and this time it is.** Chapter 21
landed on 0.8241 — under 1.00 — and declined to override, correctly, because its own chapter was
still authorable out of the pool. Thirty levels later that is no longer true. Measured at level 515
against a `mythic` five:

| board                                                                 | reading       |
| --------------------------------------------------------------------- | ------------- |
| the **five lightest bodies in the game** (100/104/106/122/126 health) | **0% / 0.00** |
| the five heaviest of The Quickmire's light Monsters                   | **0% / 0.00** |
| (the same five lightest bodies at level 485)                          | 100% / 4.00   |

**There is no chapter 22 on `mythic`** — not a hard one, not any. Chapter 21 predicted exactly this
in writing and the prediction held.

⚠️ **The move re-opens the pool, which is the other half of what an override buys.** Against the
`mythic-plus` five a board at 515 reads 4.00 of five at about 9,500 common-equivalent and 0.00 at
11,900, and **181 of the 282 blocks that preceded The Downstroke sit inside the band its ordinary
slots use** — against 116 of 238 after chapter 18's move. Nothing in `data/` had to change, and the
chapter's boards are the **first authored heavier than the chapter below them since chapter 13**.

⚠️ **The boundary is a walkover and that is the honest consequence of a rung move.** Chapter 21's own
final refielded at level 515 reads **100% with all five alive in 3.1 seconds** against the new party.
Chapter 18's boundary read the same way.

⚠️ **The degenerate chain ended at four links and restarts at one.** Chapters 18 through 21 all
clamped to `mythic`'s cap of 340; `LONGEBB` and `INVESTED` are now genuinely different fives, so the
seam assertions either side of that boundary say something for the first time since chapter 17. The
Downstroke's last board stands **ninety-five levels** above `mythic-plus`'s cap of 420.

⚠️ **Each further sixty-stage chapter on this rung divides the seam by `perLevel.common ** 30` =
1.867**: chapter 23 reads **1.9981**, chapter 24 **1.0711**, chapter 25 **0.5733**. So the arithmetic
buys about two and a half chapters — and `mythic` was projected to buy three and the **pool** gave one
and a half. **Measure the pool before re-deriving the seam.** The next rung, `ascended`, caps at 500
and is the last the campaign can spend.

⚠️ **Chapters 22, 23 and 24 all clamped to `mythic-plus`'s cap of 420, so the degenerate chain
reached two links, and chapter 25's rung move ended it.** The Nevermark's last board stands **a
hundred and fifty-five levels** above that cap — ×24.63 — and its seam of **1.0711** is the first
this rung produced within a tenth of 1.00.

⚠️ **Chapter 25 moved to `ascended`, and it is the case where the two halves of the override licence
came apart.** Its own seam on `mythic-plus` reads **0.5740**, under 1.00 — but the seam _below_ it is
**1.0711, above** 1.00, so the arithmetic half of the licence was **not** met, and chapter 21 declined
an override on exactly that shape. What settles it is the pool, measured by **fielding** all 312
shipped blocks beside four light escorts at level 605: **4 stand against a `mythic-plus` five, every
one of them a Monster, and 282 against an `ascended` one**, across all seven factions. Chapter 24's
own opening board, mid board and final all read **0%** refielded at 605. **There is no chapter 25 on
`mythic-plus`, and the pool has now settled all three of the campaign's overrides.**

⚠️ **`ascended` is the last rung whose cap the ladder has not already climbed past, so the rung
question stops having a tuning answer here.** ⚠️ **Chapter 26 is the first chapter to live in that,
and what it means in practice is that every chapter from here is pure squeeze** — thirty levels of
board against a party frozen at cap 500, ×1.8654 a chapter, with the seam degenerate and **no rung
move able to end it**, unlike the four degenerate stretches before it. The Roughcast reads 2.5971
against `ascended-1`'s 33.2031, a preference for staying put of **1.30 nats**, the widest any chapter
has had. `ascended` caps at 500 against chapter 25's close of
605; `ascended-1` caps at **600**, five levels under that close, and reads a seam of **61.94** — a
walkover by two orders of magnitude, by construction rather than by tuning. Chapter 26 inherits
**4.8443**, 27 reads **1.3922** and 28 **0.7463** — both landed as projected. A chapter that cannot be
authored on `ascended` is a `data/` question about `LEVEL_CURVE.caps` rather than a chapter.

⚠️ **Three chapters have now read the same 1.30-nat preference for staying put, so it has stopped
being a finding and become a constant.** Chapter 26 read 2.5971 against `ascended-1`'s 33.2031,
chapter 27 1.3922 against 17.7995 and chapter 28 **0.7463 against 9.5419** — the ratio is exactly
`1.6 / perLevel.common ** 100`, fixed by the hundred levels between `ascended`'s cap and
`ascended-1`'s, so it will read 1.30 for every chapter from here. **Compute it once and quote it;
re-deriving it a fourth time is not learning anything.** The seam itself keeps halving on the old
arithmetic: chapter 29 projects **0.4001** and chapter 30 **0.2145**.

⚠️ **The degenerate stretch reached four links at chapter 28** — `THINGROUND`, `ROUGHCAST`,
`LOOSELINE` and `INVESTED` are one set of five — level with the deepest the campaign has ever had, on
`mythic` at chapters 18 through 21. The difference is that that one was closed by a rung move and this
one cannot be. **Expect a fifth link at chapter 29 and one more every chapter after that.**

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
