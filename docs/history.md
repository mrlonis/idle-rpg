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
| 26      | Towers to 300 floors, six of seven landed | `topLevel` **142** is where the new slope meets the old; 17 of 200 shipped floors move by one level. Only the Demon Tower is still on the previous height        |

**Two hundred stages became four hundred, seven hundred floors became fourteen hundred, and the
enemy roster went from 62 archetypes to 130** across milestone 21 alone — eleven sessions, no new
system, and nothing changed in `ui/` or `core/`. Chapter 11 took the campaign to **450 stages** and
the roster to **140**, on the same terms.

### What the third hundreds established

Six of the seven towers now stand at 300 floors, one session each, and the findings that generalise
are in [towers](towers.md) and [authoring](authoring.md). Two are worth stating here because they are
about **method** rather than about a tower:

- ⚠️ **The previous hundred's roof board and the previous hundred's anchors are two questions.** Four
  towers found the board collapsing at the new roof's level and concluded the anchors had to get
  lighter; the Monster and Angel Towers found the board collapsing while every anchor on it read
  100%. In both of those the failure was the **pairing** — two `ascended` blocks in one front rank —
  which is a composition fix rather than a stat one. Ask both.
- ⚠️ **An escalation axis need not be a stat or a mechanic.** Five of the six are (support, front-rank
  weight, a hidden burster, durability, `physicalResist`); the Angel Tower's is the **size of one
  instance of damage**, held at constant damage per second. It is the only thing that moves a crew
  whose every heal names `ally-lowest` on a cooldown, and it grades that crew from 3.52 to 0.15
  survivors with **zero timeouts** — which is what makes it difficulty rather than the clock.

### What chapter 11 established, being the first chapter authored after the flattening

- ⚠️ **The seam rung is computed, and the answer can be a near-tie.** Chapters 8, 9 and 10 all share
  `legendary`; chapter 11 moves to `legendary-plus` by |Δln| **0.470 against 0.520**. Under the margin
  rule "the next rung up" was always right, and on the flat line it is a coin-flip that has to be
  evaluated. See [authoring](authoring.md).
- ⚠️ **A lean can reverse the faction ordering in one session.** Ten Human blocks took the faction
  from thinnest at 14 to deepest at 24, which means the two thinnest were then Angels and Demons —
  and **neither may lead a chapter**. The next lean is the first one that has to be chosen among
  three middling factions rather than read off the bottom of the list. ⚠️ **That ordering has since
  moved twice and is stale as written** — the third hundreds took Demons to 25 and Monsters to 23,
  leaving Angels the sole thinnest at 21. **Recompute it; do not read this sentence.**
- ⚠️ **A horizon in a doc is a claim about a curve, and this project's curves move.** `gear.spec.ts`'s
  kit-hours guard was recorded as firing at chapter 12 and actually fires around chapter **180**: the
  projection was made while `STAGE_REWARDS.exponent` was 1.45, and the flattening brought it to 1.00,
  turning a fast collapse into a `1 / stages` decay. **Re-measure, do not carry forward.**
- **The status vocabulary stayed closed and was not argued with.** The chapter's seven new turns are
  all shipped parts aimed somewhere new, and the sentence it asks — _what does the party spend its
  damage on first_ — is carried by `SkillConditionData`, which had seventeen enemy-side uses and
  fourteen of them in two shapes.

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
