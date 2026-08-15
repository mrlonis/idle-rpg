# History

**Every numbered milestone is complete.** This is the record of what shipped in what order, kept
because three hundred code comments and most of the reference docs date a decision by the milestone
that made it, and a bare number needs something to resolve against.

⚠️ **This file is not where a rule lives.** The reference docs are the current statement of every
system and `AGENTS.md` states the rules; where this disagrees with either, they are right and this
is stale. What survives here is the ordering, the decisions no system doc owns, and the work that
is still open.

For the procedure a new chapter or tower follows, read [authoring](authoring.md).

---

## The order things shipped

The ordering existed so there was **always something playable**: each milestone layered onto the
previous skeleton without changing its shape.

| #       | What shipped                              | The decision worth remembering                                                                                                                                   |
| ------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Tick loop, one resource, save/load        | The architecture end to end before any game: `core/` purity, sim/render split, saves                                                                             |
| 2       | Battles up a stage ladder                 | Combat resolves headlessly into an event log the UI animates — which is what makes 2x/4x/skip free                                                               |
| 3       | Gacha, roster, ascension, levelling       | Pity is global and always on screen; duplicates are the progression path, not a consolation                                                                      |
| 4       | Team composition affecting combat math    | Composition matters through **enemy design**, never flat synergy bonuses. No role-locked slots                                                                   |
| 5       | Offline catch-up                          | Closed form only. The segmented solver, `timeToClear` and `dropCarry` were cancelled here                                                                        |
| 6       | Run on a physical iPhone                  | `padding: env(safe-area-inset-top)` put a 59px gutter on all four sides. Angular Material removed                                                                |
| 7       | Auto-battle, then doubling the ladder     | Foreground-only, which is what keeps every idle rate constant across an offline window. Prestige cancelled                                                       |
| 8a      | The stat block                            | One `atk`, one `def`; damage type moved onto the skill                                                                                                           |
| 8b      | Energy and ultimates                      | MP deleted — and with it a termination argument, replaced by an assertion in the sweep                                                                           |
| 8c      | How many skills a character gets          | 2/3/4 by tier, ultimate included. **A fight is ninety seconds and running the clock out is a defeat**                                                            |
| 8d      | Faction lineup bonuses                    | The one knowing override of the synergy ban: a mono-faction bonus creates seven optimal teams, not one                                                           |
| 8e      | Seven characters per faction              | 49 characters. Every faction owns sustain and a way past a front rank, in its own idiom                                                                          |
| 9       | Resonance                                 | One level the roster shares, **derived on read and stored nowhere**                                                                                              |
| 10      | Power that compounds                      | ×10⁹ levels, ×450 rungs. Both sides of the fight scale, or neither does                                                                                          |
| 11      | Chapters                                  | Income became a function of position. A position is a _place_; a clear count is a _quantity earned_                                                              |
| 12      | Gear                                      | Every bonus is a percentage — a flat one is an addition, which the rescale identity forbids                                                                      |
| 13      | Settings, and the save-safety gap         | Settings are a second storage key, not a field on the save. First `@angular/cdk` overlay                                                                         |
| 14a     | The ladder retune                         | **Closing pressure**: a timer is not a termination argument, it is what fires when one is missing                                                                |
| 14b     | Achievements, dailies and bounties        | Both systems store a ledger and derive everything else — no write into the battle path                                                                           |
| 15a     | Crews, and Home as the battle hub         | Eight live formations, not one live and seven templates                                                                                                          |
| 15b     | The tower system, and the Human Tower     | A floor is climbed once. Tower clears may never touch `clearedStages`                                                                                            |
| 15c     | The remaining six towers                  | Anchors are sized **per tower against its own crew**; a shared weight does not generalise                                                                        |
| 16      | Signature items                           | One integer per character, not an object. No signature item may multiply healing                                                                                 |
| 17a     | Four statuses: taunt, reflect, link, bomb | All four ride the existing `status` effect, so `ui/` needed no change at all                                                                                     |
| 17b     | Chapter 3 — The Bound Marches             | **A chapter must out-climb the rung it asks for**, because the enemy side has no rungs                                                                           |
| 18      | Chapter 4 — The Sundered Vault            | A whole chapter with no new mechanic, built from **pairs** of known parts                                                                                        |
| 19      | The six-chapter re-cut                    | Same two hundred stages, boundaries moved to where a session ends. No stage retuned                                                                              |
| 20      | A second ascended-tier rank               | 56 characters, 14 signature items. The gacha dilution was accepted rather than compensated                                                                       |
| 21a–21d | Chapters 7 through 10                     | The margin **grows** each chapter. Every closed form was wrong: **bisect, do not solve**                                                                         |
| 21e–21k | Every tower to 200 floors                 | `topLevel` 120 is where the new slope meets the old, so the prescribed retune evaporated. Seven towers, seven escalations. **Now 95** — see the flattening below |
| 22      | The Descent                               | The difficulty dial is a level **offset**, never a share — a share is ×3.4 easier at depth                                                                       |
| 23      | Puzzle maps — Expeditions                 | The only content that is not a ladder. Solvability is a Dijkstra run on every test pass                                                                          |
| 24      | The level line flattened to 0.50 a stage  | Runway 14 chapters → 42. The margin rule retired; the campaign trades its own difficulty gradient for length                                                     |
| 25      | Chapter 11 — The Standing Line            | The first chapter authored on the flat line. Its lock is the **`condition` field** rather than a status, and it ships **no taunt at all**                        |
| 26      | Towers to 300 floors, all seven landed    | `topLevel` **142** is where the new slope meets the old; 17 of 200 shipped floors move by one level. The `PENDING` lists are gone for the second time            |
| 27      | Chapter 12 — The Rustwood, and enemy gear | The escalation axis milestone 24 promised. Measured at **roughly a twentieth** of what it needs to be; none of the three widened guards came back                |
| 28      | Chapter 13 — The Quarry                   | The gear grade steps and it is worth **nothing**: a whole grade is +1.2s of fight and zero survivors. Two more dials found with the `gradeSoftness` diagnosis    |

**Two hundred stages became four hundred, seven hundred floors became fourteen hundred, and the
enemy roster went from 62 archetypes to 130** across milestone 21 alone — eleven sessions, no new
system, and nothing changed in `ui/` or `core/`. Chapter 11 took the campaign to **450 stages** and
the roster to **140**, on the same terms; chapters 12 and 13 take it to **550 stages** and **191
archetypes**, still with no change in `ui/` or `core/`.

### What the third hundreds established

All seven towers now stand at 300 floors, one session each, and the findings that generalise
are in [towers](towers.md) and [authoring](authoring.md). Three are worth stating here because they
are about **method** rather than about a tower:

- ⚠️ **The previous hundred's roof board and the previous hundred's anchors are two questions.** Four
  towers found the board collapsing at the new roof's level and concluded the anchors had to get
  lighter; the Monster and Angel Towers found the board collapsing while every anchor on it read
  100%. In both of those the failure was the **pairing** — two `ascended` blocks in one front rank —
  which is a composition fix rather than a stat one. Ask both.
- ⚠️ **An escalation axis need not be a stat or a mechanic.** Five of the seven are (support,
  front-rank weight, a hidden burster, durability, `physicalResist`); the Angel Tower's is the **size
  of one instance of damage**, held at constant damage per second. It is the only thing that moves a
  crew whose every heal names `ally-lowest` on a cooldown, and it grades that crew from 3.52 to 0.15
  survivors with **zero timeouts** — which is what makes it difficulty rather than the clock.
- ⚠️ **A control reading ~4.00 of five is not necessarily a control that can move, and a flat grade
  is the symptom.** The Demon Tower's crit-denial axis first measured **completely inert** across its
  entire range — including total crit immunity — because the control board sat on a plateau: that
  crew loses its glass cannon to anything and its other four to almost nothing. A heavier control at
  the same 4.00 reading graded the identical shapes from 3.92 down to 2.42. The Seedfall hit the
  mirror image of this at the bottom, saturating at 2.00 on nineteen shapes out of nineteen.
  **Confirm the control's survivor count actually moves before believing a negative result.**

### What chapter 11 established, being the first chapter authored after the flattening

- ⚠️ **The seam rung is computed, and the answer can be a near-tie.** Chapters 8, 9 and 10 all share
  `legendary`; chapter 11 moves to `legendary-plus` by |Δln| **0.470 against 0.520**. Under the margin
  rule "the next rung up" was always right, and on the flat line it is a coin-flip that has to be
  evaluated. See [authoring](authoring.md).
- ⚠️ **A lean can reverse the faction ordering in one session.** Ten Human blocks took the faction
  from thinnest at 14 to deepest at 24, which means the two thinnest were then Angels and Demons —
  and **neither may lead a chapter**. The next lean is the first one that has to be chosen among
  three middling factions rather than read off the bottom of the list. ⚠️ **That ordering has since
  moved three times and is stale as written** — the third hundreds ended with Angels and Monsters
  both at 24 and **Elf the thinnest at 23**, which is the flattest the roster has ever been.
  **Recompute it; do not read this sentence.**
- ⚠️ **A horizon in a doc is a claim about a curve, and this project's curves move.** `gear.spec.ts`'s
  kit-hours guard was recorded as firing at chapter 12 and actually fires around chapter **180**: the
  projection was made while `STAGE_REWARDS.exponent` was 1.45, and the flattening brought it to 1.00,
  turning a fast collapse into a `1 / stages` decay. **Re-measure, do not carry forward.**
- **The status vocabulary stayed closed and was not argued with.** The chapter's seven new turns are
  all shipped parts aimed somewhere new, and the sentence it asks — _what does the party spend its
  damage on first_ — is carried by `SkillConditionData`, which had seventeen enemy-side uses and
  fourteen of them in two shapes.

### What chapter 12 established, being the chapter that tested the enemy-gear promise

- ⚠️ **Enemy gear shipped and it is not the escalation axis.** Milestone 24 flattened the level line
  and traded the campaign's difficulty gradient away against a written promise: the escalation would
  come back from the enemy side, and `MOMENTUM_CEILING`, the survivors half of "still costs that
  party something at the top" and the longest-cleared-fight bar were widened to hold the trade in
  view until it did. **The Rustwood is that chapter and none of the three came back.** Measured, the
  enemy side needs **×3 to ×4**; a full Worn set is **×1.09 to ×1.18** and the whole grade ladder end
  to end is about ×2.7 on one stat. One of the three moves the wrong way — gear lengthens fights, so
  it raises the quantity the 0.75 bar bounds. See [authoring](authoring.md) for the table.
- **The mechanism is still worth having**, and it is deliberately small: a stage authors a grade and
  a level, an enemy archetype names a gear archetype, and `resolveStage` prices it off the same
  tables the player's bag uses. It is derived rather than authored, so retuning `data/gear.ts` moves
  both sides at once — which is what makes a bigger enemy-side axis a retune rather than a rewrite.
- ⚠️ **A type-only import cycle decided the shape.** `gear/types.ts` imported `ModifiableStat` from
  `battle/types.ts`, so `battle/` could not name a gear type back without tripping `import/no-cycle`.
  The five shared names moved **down** into `battle/types.ts` and are re-exported — the same move
  `gear/types.ts` already makes for `GEAR_ARCHETYPES` against `roster/`. That is what put the
  resolved bonus on `StageData` rather than on `CombatRulesData`, and the required `gearRules`
  parameter on `resolveLadder` follows from it.
- ⚠️ **A guard fired that no horizon table listed, and it found a real design bug in another mode.**
  `descent.balance.ts` samples `stages.length` as its deepest depth, so the top sample moves every
  chapter. What it caught was that the Descent got **easier the deeper it went** — survivors
  3.20 / 4.15 / 4.15 / 4.80 / **5.00** across the five depths, the deepest a full walkover where
  nobody ever died, and depth 250 already one hundredth under the bar before chapter 12 existed.
  The cause was a **flat** level offset against a party that is not a fixed distance from the anchor;
  `DescentLevelData.anchorSlope` fixes the shape and the readings are now flat across depth. **The
  bar was not widened, no board moved, and the chapter was not touched.**
- ⚠️ **Two plausible fixes were measured and rejected first**, which is worth keeping because both
  look right on paper. Deriving the calibration's rung from the anchor weakens the party ×0.70 at
  three of five depths and breaks two passing guards; softening the chapter final does nothing at
  all, because a rung-6 party at level 200 takes no board of that weight and a rung-7 party at 201
  takes every one. **A dial with no setting that works at both ends of its range is the wrong shape**
  — the same finding `gradeSoftness` has produced once a chapter for seven chapters running.
- ⚠️ **A retired guard kept its horizon for three chapters.** The tower:campaign crystal ratio was
  listed as firing at chapter 12; `towers.spec.ts` had already retired it. A horizon is a claim about
  a **guard** as well as about a curve.

### What chapter 13 established, being the chapter that stepped the gear grade

- ⚠️ **A grade step is worth nothing either, and that is the second independent measurement.** The
  Quarry runs the whole **Sturdy** ladder, 11 to 40, on all fifty boards. Chapter 12's final refielded
  at level 275 against The Quarry's own seam party reads **100% with all five alive at every rung of
  it**, and the ladder end to end moves the fight from **8.8s to 10.0s**. So a whole grade is ×1.15 of
  one archetype's headline stat against the ×3 the axis needs, and at one grade a chapter the ladder
  is exhausted by chapter 16 having delivered ×2.7. **Two chapters, two grades, one answer: enemy
  gear is texture, not escalation.** None of the three widened guards came back here either.
- ⚠️ **A grade boundary is a step _backwards_ unless the level is carried over, and the arithmetic is
  easy to miss.** Worn at its cap of 20 is worth `1.00 × (1 + 0.055 × 19)` = **2.045** and Sturdy at
  level 1 is **1.350**, so restarting the level at 1 makes the new chapter's first board weaker than
  the old chapter's last. The Quarry opens at **Sturdy 11** (2.093), the first level of the new grade
  that clears the old grade's cap.
- ⚠️ **A geared chapter owes a `gearArchetype` on every block it fields, including the returning
  ones.** Only 34 archetypes carried one after The Rustwood, so this chapter added one to **26**
  returning blocks before a board could be authored. `chapters.spec.ts` catches it, loudly, in the
  middle of tuning — do it first.
- ⚠️ **Two more dials now have the `gradeSoftness` diagnosis, and both were found by guards firing
  outside the chapter's own suite.** The Descent's `anchorSlope`, added at 0.11 one chapter ago to
  stop the deep end being a walkover, overshot to **0.30 finished / 2.45 survivors** in a single
  chapter and came down to 0.10; the gap it corrects widens ~7.75 levels a chapter by construction,
  because party power is a **step** function of the rung the bisection lands in and board level is
  continuous. And `chapters.balance.ts`'s `MOMENTUM_CEILING` has stopped being able to bind at the
  newest seam — it is a share of the whole ladder against a slice that is only the chapters above the
  seam, so the bar is 165 boards and the slice is 50. **Neither is a threshold content outgrew.**
- ⚠️ **A monotonicity guard was measuring a real trade rather than the bug it was written for.**
  `signature.balance.ts` compares a signature rung's reach against the rung below; Seraphine's top
  rung read **430 against 431** on the new top-of-ladder board. Checked at fourteen bisection steps
  and 200 trials, so not quantization: her capstone makes `unwavering-light` — an `ally-all` heal that
  is her **ultimate** — unconditional, and at the damage margin where reach is measured a healing turn
  is a turn not spent on Judgement. **The only rung in fourteen characters that trades in that
  direction, because it is the only one that unconditions a heal.**
- **Monster is the only lean that costs the faction matchup nothing.** Every faction is ×1.05 into
  Monsters and Monsters are ×1.05 into all seven — the wildcard row — so an 85% mono-Monster pool
  still reads differently to every party, which is exactly the cost The Rustwood's 92% mono-Elf lean
  paid.

---

## Decisions no system doc owns

### Renumbering was allowed five times, and the rule is about work rather than numbers

Milestone 14 was two milestones wearing one number and was **split** rather than renumbered,
because both had work in them. Everything above it has been renumbered five times — the roguelite
and the puzzle maps moved down once each for chapter 3, the re-cut, the second ascended rank and
the content push — and each was free for the same reason: **nothing renumbered had any work in it.**

⚠️ **The rule that keeps this honest has never been about the numbers.** Anything that wants to
renumber has to check that again rather than citing the precedent.

### Local notifications: the decision reversed, deliberately

This project argued for shipping none, and ships two. The old argument is preserved rather than
deleted, because it is still why the feature has the shape it has:

> Removing the offline cap removed the only _earned_ reason to send one. With no cap, staying away
> costs nothing — so nothing is lost, and there is nothing to warn about. A notification existing to
> manufacture a session is the pattern this project rejects, and once absence is free every
> notification is that pattern by definition.

What changed is the product call above it, not the reasoning under it. Every constraint `AGENTS.md`
lists — two ever, fixed ids, cancelled on foreground, copy that promises nothing is lost, a setting
defaulting on, permission at the first backgrounding — follows from keeping that objection in view.

⚠️ **Recorded as a reversal rather than folded away**, so anybody wondering why this game nudges a
player who has lost nothing finds the objection rather than a blank.

### Milestone 16 shipped the opposite of what it specified

The signature-item entry originally specified a track that modified **behaviour rather than adding
stats**, fed by **duplicate copies**. Both halves were reversed:

- **Stats _and_ behaviour.** The old argument — "at ×10⁹ raw power another multiplier is invisible"
  — is simply not true of a _percentage_, which gear had proved two milestones earlier. What it was
  reaching for is that thirty levels of pure stats is a treadmill, and the answer to that is the
  ability track rather than the absence of stats.
- **Emblem-fed, not duplicate-fed.** Copies past the top rung convert to spark and spark buys more
  characters — a loop with no exit, and this does not close it. The fix for too many duplicates is
  more ascended-tier characters as the roster grows, which is content rather than a sink.

Kept because a specification that was wrong in a recoverable way is worth more than one quietly
overwritten.

---

## What is still open

Everything below is unstarted. None of it is a system, none of it sequences like the milestones
above, and all of it is written down because it will otherwise be discovered late.

### Presentation

**Every milestone above is a system, and the genre's draw is at least half aesthetic.** Art,
animation, effects, sound. This project is hand-written components over the palette in
`ui/theme.scss`, and at some point "it works and looks like a spreadsheet" becomes the actual
blocker rather than any missing mechanic.

It was never numbered because it does not sequence like the rest: it is continuous, it has no
completion state, and it gates nothing. ⚠️ **It is written down because a solo developer without an
artist has one constraint most likely to decide whether this ships, and it is this one rather than
any system.**

### Onboarding

Equally absent and equally unnumbered. **There is no first-session experience anywhere in this
project**, and the first ninety seconds decide more than most of the systems above combined.

The pieces that exist are incidental rather than designed: a run starts at `goldPerSec: 0`, so the
first battle is the only thing worth doing; three level-1 starters clear the opening stages and stop
dead at the stage-7 healer lock, which is a wall about _who_ is fighting rather than how many levels
they have; and chapter 1 is the ten-stage stretch a player fights by hand before auto-battle opens.
That is a good shape and nothing explains it to anybody.

### How long is the campaign meant to be?

⚠️ **The level line was flattened to 0.50 levels a stage and every horizon below moved out by about
a factor of three.** It added ~90 levels a chapter (80, 91, 94, 98 across chapters 7–10) and now adds
**25**, so chapter 10 closes at **200** rather than 588 and chapter 11 at **225**:

- `levels.spec.ts`'s "leaves rungs unspent above everything the ladder asks for" fires at
  **chapter 30** — the top stage must stay below `caps[12]` = 700 — where it used to fire at 12;
- `levels.spec.ts`'s "charges real time" is now the **first** of the long-range ones to fire, at
  **chapter 16** (9.0h of 24 after chapter 11, 21.0h at chapter 15, 26.2h at 16);
- the level curve is consumed entirely around **chapter 42**, where it used to be ~15.

⚠️ **42 is still not the ~100 chapters the campaign is planned for**, and closing that needs either
0.20 levels a stage or a `maxLevel` past 2,400 with `perLevel.common` retuned to match — a change to
every balance figure in the project. **How long the campaign is meant to be is still open.**

⚠️ **The margin rule went with the flattening.** Chapters no longer close past the cap of the rung
they ask for; every one runs inside a cap the party already holds, the campaign consumes 7 of 16
rungs rather than 11, and `mythic` — the signature-item unlock — is deliberately outside it. The
trade is that the campaign has no difficulty gradient of its own: a chapter is ×1.68 of party power
and a rung is ×1.60, so the two cancel. **The escalation is expected to arrive from enemy gear**,
and three widened guards name that as the condition for restoring them — see
[authoring](authoring.md).

**This is a roadmap decision rather than a threshold**, which is exactly why the guard that owns it
was chosen to be one that cannot decay: the rung count is fixed however long the ladder gets. It is
recorded in both spec files and left open. Nothing about it is wrong today.

[authoring](authoring.md) carries the full schedule of guards that fire before then, with the answer
each one wants.
