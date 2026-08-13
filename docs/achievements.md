# Achievements and quests

Two ledgers over counters the run already keeps, added in milestone 14b. Read
[`core/achievements.ts`](../src/core/achievements.ts) and [`core/quests.ts`](../src/core/quests.ts)
before touching either.

**The retention framing undersells what quests are for: they are a faucet that is not stage-gated.**
A player stuck below a wall has one income source and it is the thing the wall is throttling, so
being stuck stops meaning being stopped — which matters more in a game with no way to buy a way past.

## ⚠️ Neither adds a field to the battle path, and that is the whole design

- An **achievement track** stores **one integer** — awards _taken_ — and derives what is earned by
  division.
- A **quest window** stores a **baseline** of the counters as they stood when it opened, and
  progress is a subtraction.

Giving either a running total incremented from `applyBattleResult` is a write into the hottest path
in the game for a derivable number, and a second place for progress to disagree with itself. It also
keeps both cheap to extend: a second track is an entry in `data/` and a key in a record, not a save
migration.

## Which counters are legal

⚠️ **No quest may be measured against `clearedStages`.** It counts _first_ clears, so it stops moving
at the top of the authored ladder and the quest becomes permanently unfinishable. The type forbids
it; `battleCount`, `pullCount` and `descentRuns` always move.

**An achievement measured against it is fine, and one is shipped.** A quest that stops moving is
unfinishable; an achievement that stops moving is one the player has finished.

⚠️ **The test is not "is it monotonic" — it is "can a player always make it move today".**
`clearedStages` is monotonic and forbidden. `signatureLevels` stops dead at 420 and does not move at
all before the first item unlocks, so it is forbidden too. The Descent is offered afresh every day
forever, which is what made `descentRuns` the third legal counter.

⚠️ **That rule also constrains where content may _open_.** Milestone 22 moved the Descent's unlock
from chapter 1 to chapter 3 because a mode that is visible and unfinishable makes its own daily quest
a permanent empty row. See [rejected](rejected.md) for the emblem and signature quest shapes that all
fail, and the trigger that would revisit them.

## "Counters the run already keeps" is about the stored field, not the counter

`clearedChapters` is **derived** — `clearedStages` resolved against the shipped `LadderShape` — and
adds no save field, no migration and nothing to the battle path, which is the whole of what that rule
protects.

It is why `trackProgress`, `allProgress` and `claimAchievements` all take a ladder, **required rather
than defaulted**: a caller with no ladder would report the chapter track as having earned nothing, on
every screen, forever.

- ⚠️ **A chapter is not an interval of stages.** `every: 50` over `clearedStages` is the obvious
  authoring and it is wrong from chapter 11, where `CHAPTER_CURVE` steps to sixty — it would pay a
  "chapter" award part way into the next chapter, silently, forever.
- ⚠️ **`towerFloors` is the one counter that cannot identify itself, so `AchievementTrackData` is a
  discriminated union** rather than an interface with an optional `tower`. Every other counter is a
  single number on the run; a tower track has to say _which_ tower, and one that forgot would read
  floor zero of nowhere — content that compiles, ships and silently never pays. The typed local in
  `ui/content.ts` is what turns that into a compile error. Each tower gets **two** tracks, and
  summing the seven is forbidden: it would make the completion award payable by climbing a hundred
  floors spread across seven towers.
- ⚠️ **Fourteen of the sixteen shipped tracks share two names between them** — every tower has a
  Spire Climber and a Spire Conqueror — so a track's `name` identifies a _kind_ of track rather than
  a track. `AchievementsService` resolves the heading as `name — tower name`, reading the tower off
  `TOWERS`; authoring the faction into each track would put it in two places and let them disagree.
  **Load-bearing rather than cosmetic**: seven identical `<h2>`s and seven progress bars carrying the
  same accessible name is a WCAG failure.
- **A coarse counter needs `AchievementProgress.position`** — `total` plus how far into the next unit
  the run has come. A chapter is fifty fights, so a bar drawn from the whole count alone sits empty
  through all of them and then jumps, on the largest reward in the game. It equals `total` for every
  stored counter, and `aria-valuenow` follows it so the announced value cannot contradict the fill.

## What they pay

⚠️ **Every quest reward is crystals, and every achievement award is flat.** Gold, xp and essence
price against a level curve worth ×10⁹, so a flat quantity of any of them is invisible within a
chapter or two; a pull costs a flat `PULL_COST` forever. A reward that _scaled_ would also pay most
to the player whose ladder is already moving, which is the opposite of what these exist for.

**Nothing in the crystal economy is linear in the stage index.** A first clear pays a flat 250 (×2
mini-boss, ×5 chapter boss), Stage Climber 1,000 per five clears, Chapter Conqueror 10,000 per
chapter.

⚠️ **The flattening and the track raises are one redistribution and only balance when read
together** — the ladder's first clears fell from ~58,800 to 29,000 and the tracks rose from 5,000 to
40,000. Retuning either half alone moves the pacing; `data/achievements.spec.ts` measures the sum and
holds the ratio inside a factor of two. The idle rate in `SUMMON_RATE` is the one thing still linear,
and it is linear in the **clear count** rather than the index.

**Emblems are paid by exactly one track — Chapter Conqueror, 100 a chapter.** ⚠️ The two signature
tracks pay **crystals**: an emblem award on an emblem-spending track is a partial refund that would
make the last levels cheaper than the first and flatten a cost curve kept linear on purpose. The
rule as `achievements.spec.ts` now states it is that a track paying emblems must sit on an event that
**already** pays them.

⚠️ **"Not a tower track" is not a safe way to mean "a campaign track".** Signature tracks are a third
economy, and both `data/achievements.spec.ts` and `data/towers.spec.ts` once had helpers that
inferred the campaign from that negation — one threw and the other silently measured signature awards
against `stages.length`, inventing 85,000 crystals and taking the tower ratio from 3.2 to 1.4. Both
now name the two campaign counters positively.

### A tower's crystals are the same shape at a smaller size

**100 a floor** (×2 mini-boss, ×5 roof), **500 per five floors**, **10,000 per hundred floors**.

⚠️ **`Spire Conqueror` stayed `every: 100` when the towers doubled, so a two-hundred-floor tower
earns it twice.** Re-authoring it as `every: 200` to keep "topping a tower" one event strips 70,000
crystals from the tower side and drops the ratio below under its own floor. The tie with a chapter
always rested on "a hundred floors and a fifty-stage chapter are comparable events", so it is
**stated per unit** and the number did not move. No save migration either way: awards-taken is an
integer, and a player who topped the old hundred has taken 1 and earned 1.

⚠️ **The per-floor figure is deliberately _not_ the campaign's 250.** At parity the seven towers pay
~268,000 against the campaign's ~69,000 — 3.9×, which makes the ladder's own rewards look pointless
beside optional content. At 100 it is ~219,000.

**A hundred floors pays exactly what finishing a chapter pays**, a deliberate tie rather than a
coincidence: `achievements.spec.ts` narrows its "largest single payout" claim to the ladder, and
`towers.spec.ts` holds the tie.

## ⚠️ The tower:campaign crystal ratio

`data/towers.spec.ts` measures it and **compares both halves on both sides** — floors and their
tracks against first clears and theirs — because comparing against first clears alone reads the
campaign as five times poorer than it is. It **sums the towers that actually ship** rather than
multiplying one tower by `FACTIONS.length`, which measured a projection while six were unwritten.

⚠️ **Only the ceiling is stable; the floor falls as content ships, by construction.** While the
towers were fixed at seven hundred floors and the campaign grew, it read 3.17 at two fifty-stage
chapters, 2.12 at three, 1.59 at four — and the six-chapter re-cut moved it to ~1.37 without adding
a stage, because two more boundaries pay two more Chapter Conqueror awards. Chapters 7 through 10
took it to 1.13, 0.96, 0.83 and **0.74**.

Doubling the towers reversed it for the first time since the guard was written: 0.835, 0.940, 1.045,
1.150, 1.255, 1.361, **1.466**. ⚠️ **The step is exactly 31,300 crystals — one tower's second hundred
— so it is exactly +0.1052 every time by construction.** Do not verify it by subtracting the rounded
ratios; 1.255 → 1.361 looks like +0.106.

**The floor is 1.3, which is where it stood before milestone 21 rather than a new bar.** It was
lowered once, to 0.7, in a single edit covering three chapters whose landings were all known in
advance — because re-deriving a quantity that is _supposed_ to fall three times over is three edits
that measure nothing. ⚠️ **That is the opposite of the call made on `gradeSoftness`, and the
distinction is whether the quantity is meant to move.** The acknowledged price was that it watched
nothing until the towers restored it.

⚠️ **1.3 rather than 1.4, and the reason is the next chapter rather than the measured 1.466.** An
eleventh fifty-stage chapter takes it to **1.314** and a twelfth to **1.190**, so 1.3 survives
chapter 11 and fires at chapter 12 where 1.4 would have fired on the very next chapter shipped. **A
failure there is the original question rather than a number to slide** — the towers are no longer
fixed while the campaign grows, so the honest answers are a third hundred, an eighth ladder, or
accepting that the campaign has outgrown its optional content.

## ⚠️ What a clear pays is bounded per stage, not in total

The band was 500–900 pulls for the whole ladder and milestone 17's chapter took it to 1,035 —
correctly in the sense that the number moved, uselessly in the sense that every chapter moves it. The
ladder pays a flat 250 a stage and a flat 1,000 per five clears, so the total is **linear in the
length by construction** and a fixed band on it is a cap on how much content may ship.

Per stage it was 6.9 across four fifty-stage chapters; the re-cut moved it to ~8.0 by adding two
boundaries without touching a stage, and each chapter since dilutes it slightly — 7.76, 7.62, 7.51,
**7.44**.

## The quest window

- **A weekly is exactly seven of its daily and never more.** The weekly tier is a bonus for
  consistency, not a second obligation. `data/quests.spec.ts` derives that bound from the daily
  targets rather than restating it.
- **The window roll lives in `GameLoopService.advance`**, the only place holding both the
  authoritative run and a real `nowMs`. Not a `computed` (Angular forbids the signal write) and not a
  `setInterval` (a second clock that would not survive backgrounding).
- ⚠️ **A window rolls only when the computed index is _greater_ than the stored one** — `>`, never
  `!==` — so a clock moved backwards does nothing rather than handing out a second day. **Clamp; do
  not detect.**
- **Nothing punishes a miss.** No streaks, no escalating bonus that resets, no countdown that costs
  anything. Unclaimed awards accumulate indefinitely.

## Where they sit

All three of the achievements, quests and [bounties](bounties.md) screens are Town cards, **and that
settles what Town is**: none spends a wallet currency and all three quote a count of things waiting.
The hub's test was always "somewhere you go deliberately, with something you have earned", not "a
currency sink". See [navigation](navigation.md).
