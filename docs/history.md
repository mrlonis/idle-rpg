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

| #       | What shipped                              | The decision worth remembering                                                                                                                                                |
| ------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Tick loop, one resource, save/load        | The architecture end to end before any game: `core/` purity, sim/render split, saves                                                                                          |
| 2       | Battles up a stage ladder                 | Combat resolves headlessly into an event log the UI animates — which is what makes 2x/4x/skip free                                                                            |
| 3       | Gacha, roster, ascension, levelling       | Pity is global and always on screen; duplicates are the progression path, not a consolation                                                                                   |
| 4       | Team composition affecting combat math    | Composition matters through **enemy design**, never flat synergy bonuses. No role-locked slots                                                                                |
| 5       | Offline catch-up                          | Closed form only. The segmented solver, `timeToClear` and `dropCarry` were cancelled here                                                                                     |
| 6       | Run on a physical iPhone                  | `padding: env(safe-area-inset-top)` put a 59px gutter on all four sides. Angular Material removed                                                                             |
| 7       | Auto-battle, then doubling the ladder     | Foreground-only, which is what keeps every idle rate constant across an offline window. Prestige cancelled                                                                    |
| 8a      | The stat block                            | One `atk`, one `def`; damage type moved onto the skill                                                                                                                        |
| 8b      | Energy and ultimates                      | MP deleted — and with it a termination argument, replaced by an assertion in the sweep                                                                                        |
| 8c      | How many skills a character gets          | 2/3/4 by tier, ultimate included. **A fight is ninety seconds and running the clock out is a defeat**                                                                         |
| 8d      | Faction lineup bonuses                    | The one knowing override of the synergy ban: a mono-faction bonus creates seven optimal teams, not one                                                                        |
| 8e      | Seven characters per faction              | 49 characters. Every faction owns sustain and a way past a front rank, in its own idiom                                                                                       |
| 9       | Resonance                                 | One level the roster shares, **derived on read and stored nowhere**                                                                                                           |
| 10      | Power that compounds                      | ×10⁹ levels, ×450 rungs. Both sides of the fight scale, or neither does                                                                                                       |
| 11      | Chapters                                  | Income became a function of position. A position is a _place_; a clear count is a _quantity earned_                                                                           |
| 12      | Gear                                      | Every bonus is a percentage — a flat one is an addition, which the rescale identity forbids                                                                                   |
| 13      | Settings, and the save-safety gap         | Settings are a second storage key, not a field on the save. First `@angular/cdk` overlay                                                                                      |
| 14a     | The ladder retune                         | **Closing pressure**: a timer is not a termination argument, it is what fires when one is missing                                                                             |
| 14b     | Achievements, dailies and bounties        | Both systems store a ledger and derive everything else — no write into the battle path                                                                                        |
| 15a     | Crews, and Home as the battle hub         | Eight live formations, not one live and seven templates                                                                                                                       |
| 15b     | The tower system, and the Human Tower     | A floor is climbed once. Tower clears may never touch `clearedStages`                                                                                                         |
| 15c     | The remaining six towers                  | Anchors are sized **per tower against its own crew**; a shared weight does not generalise                                                                                     |
| 16      | Signature items                           | One integer per character, not an object. No signature item may multiply healing                                                                                              |
| 17a     | Four statuses: taunt, reflect, link, bomb | All four ride the existing `status` effect, so `ui/` needed no change at all                                                                                                  |
| 17b     | Chapter 3 — The Bound Marches             | **A chapter must out-climb the rung it asks for**, because the enemy side has no rungs                                                                                        |
| 18      | Chapter 4 — The Sundered Vault            | A whole chapter with no new mechanic, built from **pairs** of known parts                                                                                                     |
| 19      | The six-chapter re-cut                    | Same two hundred stages, boundaries moved to where a session ends. No stage retuned                                                                                           |
| 20      | A second ascended-tier rank               | 56 characters, 14 signature items. The gacha dilution was accepted rather than compensated                                                                                    |
| 21a–21d | Chapters 7 through 10                     | The margin **grows** each chapter. Every closed form was wrong: **bisect, do not solve**                                                                                      |
| 21e–21k | Every tower to 200 floors                 | `topLevel` 120 is where the new slope meets the old, so the prescribed retune evaporated. Seven towers, seven escalations. **Now 95** — see the flattening below              |
| 22      | The Descent                               | The difficulty dial is a level **offset**, never a share — a share is ×3.4 easier at depth                                                                                    |
| 23      | Puzzle maps — Expeditions                 | The only content that is not a ladder. Solvability is a Dijkstra run on every test pass                                                                                       |
| 24      | The level line flattened to 0.50 a stage  | Runway 14 chapters → 42. The margin rule retired; the campaign trades its own difficulty gradient for length                                                                  |
| 25      | Chapter 11 — The Standing Line            | The first chapter authored on the flat line. Its lock is the **`condition` field** rather than a status, and it ships **no taunt at all**                                     |
| 26      | Towers to 300 floors, all seven landed    | `topLevel` **142** is where the new slope meets the old; 17 of 200 shipped floors move by one level. The `PENDING` lists are gone for the second time                         |
| 27      | Chapter 12 — The Rustwood, and enemy gear | The escalation axis milestone 24 promised. Measured at **roughly a twentieth** of what it needs to be; none of the three widened guards came back                             |
| 28      | Chapter 13 — The Quarry                   | The gear grade steps and it is worth **nothing**: a whole grade is +1.2s of fight and zero survivors. Two more dials found with the `gradeSoftness` diagnosis                 |
| 29      | Chapter 14 — The Shutgate                 | The difficulty gradient came back — from a **rarity cap**, not from gear. One of the three widened guards restored; a fourth guard retired                                    |
| 30      | Chapter 15 — The Underroad                | The cap's gradient priced: every block comes down by **half**. `mythic` ruled out by measurement, and the **tier growth premium** found to be the quantity to author against  |
| 31      | Chapter 16 — The Spoilfield               | The board budget falls **through the floor of the shipped enemy pool**. The gear ladder is exhausted at Relic 100; a mechanic's worth is a function of where its board stands |
| 32      | Chapter 17 — The Quickmire                | **57.7% new blocks and not by choice** — the pool cannot supply a returning majority. The seam falls below **1.00**. A synthetic control is not a board                       |
| 33      | Chapter 18 — The Slowgrowth               | The rung moves to `mythic`, **against** the log-space rule, because no chapter existed on the old one. Enemy health grades **0.00**; no scalar predicts a board               |
| 34      | Chapter 19 — The Backcut                  | Staying on a rung argued as hard as moving one. **A reflect prices where the party aims** — 0.00 on a protected back rank, the mirror of chapter 16's debuffer                |
| 35      | Chapter 20 — The Commonage                | **The first chapter longer than fifty** — the chapter-length cap becomes a schedule. A taunt measures **−0.65**, the first mechanic to price with the wrong sign              |

⚠️ **The table stops at 35, and chapters 21 through 25 have no milestone number at all.** That is a
fact rather than an omission to backfill: the numbered milestones were a build order for the systems,
and once every system had shipped a chapter stopped being a milestone and became content. **Do not
invent the next number** — a chapter-25 session wrote `milestone 40` into two source comments on the
assumption that the sequence had kept running, and it had not. The prose sections below are where a
chapter's findings go; refer to chapters by their number and their name.

**Two hundred stages became four hundred, seven hundred floors became fourteen hundred, and the
enemy roster went from 62 archetypes to 130** across milestone 21 alone — eleven sessions, no new
system, and nothing changed in `ui/` or `core/`. Chapter 11 took the campaign to **450 stages** and
the roster to **140**, on the same terms; chapters 12 and 13 take it to **550 stages** and **191
archetypes**, and chapter 14 to **600 stages** and **201** — still with no change in `ui/` or
`core/`. Chapter 15 takes it to **650 stages** and **211**; chapters 16 through 19 take it to
**850 stages** and **258 archetypes** — nineteen chapters, on the same terms, with no change in
`ui/` or `core/` in any of them. ⚠️ **Chapter 20 breaks that last clause**: The Commonage is
**sixty** stages, which took the campaign to **910 stages** and **272 archetypes** and needed
`chapterSize` in `core/ladder.ts` to learn a **cap schedule** — the first `core/` change a content
session had made since the run began, and the Human Tower's fourth hundred is the second (the tower gear
ramp). ⚠️ **Recompute these rather than reading them**; this paragraph had
gone three chapters stale before chapter 19 brought it current, which is the ordinary fate of a
running total carried by hand.

### The fifth hundred: the height is 500 and all seven towers are there

⚠️ **The Human Tower's floors 401–500 landed with the bump, and the `PENDING` lists went back in the
same session** — which is what the fourth hundred's note asked for and the half of the discipline that
had never actually been done before. The Dwarf Tower's hundred followed, then the Elf Tower's, then the
Undead Tower's, then the Monster Tower's, then the Angel Tower's, and the **Demon Tower's closed the
round** — deleting the `PENDING` lists and the branches they guarded for the fourth time. While the
round was in flight a tower still at 400 lost its boss — worth **300 crystals apiece**, since
`floorKindAt` reads the rules' height and its floor 400 resolves as a mini-boss; ⚠️ **unlike the fourth
round, none of them went naked**, because the gear ramp's new endpoint was **solved to continue the
shipped slope** (Fine 60 at floor 400 carries on to Relic 40 at floor 500), leaving 90 of their 100
geared floors byte-identical. All seven now pay **1,087,100** crystals against the campaign's 351,500
of first clears, a ratio of **3.093** — exactly the figure the fourth hundred predicted a completed
round would reach.

The level line was solved the same way it has been four times before — `topLevel` 189 → **236**, which
moves 20 of the 400 shipped floors by one level and leaves all four band boundaries closing at exactly
48, 95, 142 and 189, so **no band's crew moved**. ⚠️ **The payout bound was checked first, as the fourth
hundred's note demanded, and it cleared with room**: the roof pays **18,880** against the campaign's
stage-500 lump of 20,000, and the highest legal roof is 249. `TOWER_BAND_RUNGS` gained a fifth entry,
`legendary-plus`/147, and the power ratio reads **1.600 / 1.689 / 1.676 / 1.663 / 1.649** across the five
bands without a line of the guard changing — which is what the fourth hundred's restatement of that
guard bought.

⚠️ **The crystal ratio was recomputed by hand, which is what replaced the retired guard.** With one
tower at 500 and six at 400 the seven pay **901,100** against the campaign's **351,500**, a ratio of
**2.563**; with the Dwarf Tower extended it reads **932,100** and **2.652**; with the Elf Tower as well
**963,100** and **2.740**, and with the Undead Tower **994,100** and **2.828**; seven towers of 500
would read 1,087,100 and **3.093**. That is the number to weigh before a
sixth hundred is proposed, and it is left as a design question rather than answered by a threshold.

⚠️ **The Ironpace is the first hundred anywhere whose "is it ours" table came back _no for every
candidate_.** Ten stat candidates and three pairings across all fourteen shipped arrangements rank the
binding Human arrangement between fifth and eleventh of fourteen — the Humans are the balanced faction,
mid-table on every defensive register, and the price of being balanced is that no lock is theirs. The
hundred took **`def` and `haste` carried together**, chosen on fight length (armour alone walks the
control to 36.1s for 2.88 survivors; the pair reads 26.1s for the same difficulty) and licensed on
**margin rather than exclusivity** — stated as such, which is the Angel third hundred's distinction and
the first time a hundred has had to take the weaker half knowingly. Its full findings are in
[towers](towers.md).

⚠️ **The Masterworks — the Dwarf Tower's fifth hundred — is the first built on a spent axis whose own
licence had expired.** Re-measured at band 5, this tower's own `physicalPierce` ranks **seventh of
fourteen** where the fourth hundred measured it first and second; what is authored instead is the
pierce **and** the attack behind it on one body, which is super-additive on this crew (0.47 and 0.82
alone, **1.97** together) — the Monster fourth hundred's licence for building on the axis below, taken
on the Ironpace's margin form (first of the twelve mortal arrangements, under the two Angel rows that
top every attack-shaped candidate at that depth). Everything stronger measured as the clock: enemy
`hp` at 72.0s max and a 38% win, `dodge` at 82.9s on a crew with zero `accuracy`. Crit came back dead
last of fourteen on the crew with the game's deepest `critBlock`, the second-anchor ban survived a
second rung of investment, and the roof was settled on its attack — the fourth tower roof running.
Full findings in [towers](towers.md).

⚠️ **The Trip-Hammers — the Elf Tower's fifth hundred — is the first hundred whose axis is one this
tower already owned, read backwards.** The fourth hundred found that nothing but throughput moves an
Elf five and named the mechanism — attack bills only for as long as the body carrying it lives, proved
on a Colossus that survives at 1250/88 because its `haste` is 58. The fifth authors the same attack
**arriving earlier**: `atk` and `haste` on one light body, worth 1.03 and **0.03** of five apart and
**2.03** together. ⚠️ **The axis this session set out to build measured inert and the measurement is the
finding.** Crit denial looked certain — every member of both swept Elf arrangements carries crit, the
deepest such register any party in the game has — and **complete immunity to both halves is worth 0.05
of a survivor**, because crit on that crew is a 13% throughput bonus rather than a mechanism. ⚠️ **A
refusal recorded on size expired here too**: `def`, `physicalResist` and `dodge`, all measured inert by
the fourth hundred, are worth 2.85, 2.70 and 3.25 at band 5 — and this is the one tower that can spend
them, because the same difficulty that takes an Elf five 16 seconds takes a Dwarf five 46. ⚠️ **Its
anchor-retirement check came back completely clean, the first time any hundred's has**: a band boundary
hands the crew a whole rung where the boards gain forty-seven levels, and ×1.6 outruns
`perLevel.ascended`. Full findings in [towers](towers.md).

⚠️ **The Thicket — the Undead Tower's fifth hundred — is the first content anywhere to field
`attackSpeed`, and the first hundred whose "is it ours" table came back _yes for every candidate_.**
Held at equal nominal damage, `attackSpeed` 130, `haste` 160–190, `atk` ×1.5 and enemy crit at ×1.88
expected damage all read the **same** 2.00 / 0.00 against this hundred's two controls, and every one
ranks the binding Undead arrangement first of the twelve non-Angel rows — because at band 5 that crew
is simply the most fragile mortal arrangement in the game and has no answer to anything. That is the
Ironpace's problem inverted, and it ends the same way: **the table cannot choose, so the axis is
chosen on something else.** Here it was fight length — `attackSpeed` is the fastest spelling of the
only curve left, adding 4.1 seconds where crit adds 4.5, `atk` adds 4.8 and `def` 110 adds **12.9** on
the slowest crew in the game — plus an **empty register**: the stat sat on 0 of 362 shipped blocks,
and because it accrues only after a basic attack, a hundred built on it runs 64–84-tick cooldowns
where The Coppice below it runs 34–40. ⚠️ **Its lean overshot to 94.8% on the first pass**, the worst
any tower has had and structural rather than sloppy: three new carriers and a roof, all Elven,
standing on nearly every board, spoke for 244 of 500 slots before a texture body was chosen. ⚠️ **And
a four-hundred trend broke**: each of this tower's first four hundreds closed faster than the one
below and the fifth closes 0.7 seconds slower, because the fourth had already spent its whole budget
on rate and there was nothing left to take out. Full findings in [towers](towers.md).

⚠️ **The Censing — the Monster Tower's fifth hundred — is the second hundred whose "is it ours" table
came back _no_ for everything, and the first to answer that by re-taking its own axis a third time.**
Thirteen stats and five mechanics priced across all fourteen shipped arrangements at band 5 rank the
Monster fives **eighth to fourteenth of fourteen on every one** — attack, crit, a poison, weight,
`haste`, `attackSpeed`, a second `ascended` anchor, `WEAKEN`, a board-wide `STUN`, and this tower's own
fourth-hundred `dodge`. That is the Ironpace's finding arriving for the opposite reason: the Humans are
mid-table on every register, and **this crew has no support to lose**, so pressure removes five
near-identical attackers one at a time and nothing cascades. The one exception is the plate this tower
built its third hundred on, whose licence has **not** expired — `physicalResist` costs monster-ref 0.95
and monster-alt 0.92, second and third of fourteen, over a field where six read at or under 0.38 and two
read negative — because a pierce never touches a resist and this is the only crew built on pierce.
⚠️ **The new half is a `dot`, the half of that tower's founding sentence it had never spent**: a poison
cannot be leeched back, bypasses `def` entirely, answers only `magicResist` — which a Monster five has
none of — and keeps billing after the body carrying it is dead. ⚠️ **Both halves turned out to be priced
in _seconds_, which is one mechanism rather than two**: measured on the shipped floors they are worth
0.00 and 0.00 at floor 420 where fights run 8.4 seconds, and 0.20 / 0.80 and 1.02 / 1.62 at floor 500
where they run 19.5. The plate buys the seconds and the poison bills them, and the boards get _lighter_
as the axis rises — 4,080 of health at floor 300, 3,260 at 400, **2,740** at 500. ⚠️ **Its retirement
check is the harshest any hundred has run — thirteen anchors — and it priced the axis before a board was
authored**: the heaviest block in the hundred below stands at 100% / 3.38 while one thirty health lighter
reads 0.00, and the difference is a board-wide burn. ⚠️ **And the prose check found a _board_ bug for the
second time in the project** — a returning block applying a **link**, which this tower forbade above
floor 100 two hundreds ago, on three floors the sweep was perfectly happy with. Full findings in
[towers](towers.md).

⚠️ **The Unlacing — the Angel Tower's fifth hundred — is the first axis that tower has taken that is
not aimed at a heal, and the third fifth hundred running whose "is it ours" table could not choose
it.** Its second hundred arrives before the wards, its third swings too large to heal, its fourth
finds the seam too often; this one goes after the only other thing keeping an Angel five alive.
**That crew carries the largest authored `def` in the game and among the least of everything else** —
Σ195 and Σ174 against a field median of Σ90, with Σ0.15 and Σ0.21 of `physicalResist` +
`magicResist` + `dodge` combined and zero `dodge` on either — and `effectiveDefence` returns
`def × (1 − physicalPierce)`, so a pierce prices exactly what the party put into armour. Seven
monotone steps at all five carriers, zero timeouts, and **the fight gets shorter as it grades**
(43s down to 30s against a 42.5s control), which is what chose it: this tower's alternate five is the
**slowest arrangement in the game** and every candidate that buys seconds walks it into the bar.

⚠️ **The Dwarf fourth hundred measured this exact axis as _not_ the Angels' — correctly — and the
reading inverts one band later.** It read pierce 0.35 costing dwarf-ref/alt −1.00 / −1.08 against
angel-ref/alt −0.08 / −0.29, reasoning that "`def` is the Dwarves' only mitigation where an Angel five
has armour **and** a choir"; at band 5 the choir has been out-scaled and the armour is what is left.
⚠️ **The table failed for a third distinct reason, and it is the one that generalises**: the Humans
ranked mid-table because that crew is balanced and the Undead ranked first on everything because that
crew is fragile, but the **Angels rank first-and-second on nearly everything because they are the
strongest arrangement at band 5** — calibrated in 2.5% steps they take a control 10% heavier than any
other crew, so they stand on the steepest part of every curve. What separated the lock from the steep
curve was a **correlation rather than a ranking**: pierce's cost correlates 0.834 with each
arrangement's authored `def` where `critChance`'s correlates 0.645.

⚠️ **A `bomb` is the project's cleanest instance of a mechanism argument being wrong.** It bypasses
`def` through `statusDamage`, cannot be stopped by killing the caster, and the Angel cleanse is on a
cooldown — every clause true of the crew whose recorded failure is "a body removed between two heal
ticks" — and at all five carriers, power 1.0 through 2.5, it reads **4.00 survivors at every row**.
⚠️ **Its retirement check came back entirely clean where the hundred below retired four anchors**, the
most any hundred has, and `THE_HAIRLINE` — the fourth hundred's own roof — stands at floor 500.
⚠️ **And the closing band is two percent of common-equivalent weight wide**: on floor 499 the
Clefthorn Gorer at 4,432 reads 100% / 95% and the Riftstep Reaver at 4,688 reads 88% / **0%**, where
both boards weigh **3,320 raw** — which is what the first draft got wrong, sweeping clean on the
stride while floors 497, 498 and 499 read 23%, 0% and 30%. Full findings in [towers](towers.md).

⚠️ **The Processional — the Demon Tower's fifth hundred — closes the round, and its axis is the first
taken on _affordability_ rather than on exclusivity or margin.** `dodge` grades eight monotone steps on
**both** Demon arrangements with zero timeouts (3.98 → 1.71 and 3.64 → 0.14 across 0.08 → 0.50), and it
is the first axis in five hundred floors the reference five feels at all — the third hundred's crit
denial moved it 4.00 → 3.98 and the fourth hundred's ward 4.00 → 3.92.

⚠️ **The cross-crew table ranks it sixth of fourteen, and that is the finding rather than a refusal.**
`dodge`'s cost correlates **0.772** with how long a crew's fights already are — it is mostly a tax on
slow crews, and the four arrangements clearly above demon-alt are the four slowest in the game
(angel-alt 41.6s, dwarf-ref 28.1s, dwarf-alt 28.0s, angel-ref 27.4s). **Fit that trend and rank the
residual and demon-alt is first of fourteen at +0.76**, 55% clear of second. ⚠️ **A cross-crew ranking
on a stat whose cost is dominated by a confound must be read as a residual, not as a rank** — a new
shape, and the fourth distinct way that table has failed to choose an axis outright.

⚠️ **The Angel Tower's fifth hundred measured this exact stat one tower earlier and declined it,
correctly**, at 1.38 of five for 54.5s against a 67.5s bar. The Demon fives clear their control in
8.7s and 9.9s, the shortest in the game, so eighteen seconds is affordable here and nowhere else.
**Every earlier "chosen on fight length" finding picked the axis that made fights shorter because the
crew was walking into the bar; this is the first that could pick one for making them longer.**

⚠️ **And the mechanism that looked obvious was measured and was wrong.** The Demon arrangements are the
only two of fourteen carrying a point of `lifeLeech` (Σ0.22 against Σ0.00) and all their sustain is a
share of damage _dealt_, so a miss ought to cost them twice — stripping it moves the grade from 1.82 to
**1.84**. ⚠️ **Its retirement check came back entirely clean**, and `THE_UNSTRUCK` ships at 1250/**44**
— settled on attack, chapter 20's rule for the fourth time on a roof — with floor 500 reading
100% / 3.83 against 85% / 1.95.

⚠️ **What the hundred exists to record, though, is a guard nobody had seen bite: on a _celestial_ tower
the counter-faction inversion binds the lean far harder than the 65% ceiling does.** Authored the
obvious way — all three new carriers Angel, on 234 of 500 slots — the hundred came out at 81.8% Angel
and the tower at 65.84%, over the ceiling; but what actually went red was `towers.balance.ts`'s
requirement that a celestial tower cost its crew _fewer_ members than a mirror of its own faction, which
the Demon Tower had been carrying by only **1.1 members across four hundred floors**. Against a Demon
five an Angel board is ×1.05 out **and** ×1.05 in where the mirror is neutral, so a glassy five loses
more to the incoming edge than it saves on the outgoing: varying faction alone, all-Angel costs **58.1**
members, the mirror 55.7, all-Monster **54.5**. ⚠️ **It is invisible until a band is hard enough to kill
somebody** — bands 1–3 are all favourably biased. The band was **not** lightened (its 57.9 losses sit
mid-range across the seven towers); instead the two returning **Monster** carriers took half the carrier
slots, leaving the hundred at 67.4% Monster and the tower at 55.84% Angel, and the inversion back at
84.2 against 84.9. Full findings in [towers](towers.md).

### What the fourth hundred established, being the first geared content outside the campaign

⚠️ **The height was 400 and all seven towers reached it**; the `PENDING` lists were emptied, the third
time that discipline ran end to end. The Panoply is the first tower hundred whose escalation
axis is **the gear its boards wear**, and it needed the first `core/` change a tower content session has
taken: `TowerRulesData` gained a gear **ramp**, `resolveFloor`/`resolveTower` gained a required
`GearRulesData`, and `floorGear` derives what each floor wears from the ramp exactly as `floorLevel`
derives its level. Three findings are worth stating here because they are about **method**:

- ⚠️ **A measured figure is a claim about the board it was measured on, and "enemy gear is texture" was
  a claim about a board that was being lightened.** Every campaign measurement of that axis was taken
  while the chapter budget fell 0.595 a chapter _underneath_ the ramp. A tower's does not fall, and on a
  board held still Worn 1 costs the binding crew **0.82 of five** and Fine 60 reads **0%** — where
  chapter 16's whole Relic ramp measured 0.08 of a survivor. This is the "state the weight with the
  figure" rule with a second variable attached: **state whether the board was moving too.**
- ⚠️ **A guard can fire because a _count_ changed rather than because content did, and that is the
  signal it is pointed at the wrong quantity.** Both cap comparisons standing for the tower margin rule
  broke at the fourth band — one because `legendary`'s cap of 200 is above a roof of 189, the other
  because band 3 lost a top-band exemption on boards that did not move a level. They were replaced by
  the **power ratio** they had always been standing in for, not slid. Same call this project has now
  made for five guards.
- ⚠️ **A cross-tower negative can be an artefact of which arrangement it was read on.** The Monster
  Tower recorded `physicalResist` 0.55 as worth **0.00** to the Human reference five; re-measured on the
  Human _alternate_ — the binding arrangement — the same stat is a clean dial worth up to 1.18 of five.
  The reference five is plateaued at 4.00 across a wide band and cannot fall. **Re-measure a borrowed
  negative on the arrangement that binds.** (It changed nothing: `physicalResist` is still the Monster
  Tower's lock and the Panoply does not build on it.)

The **Dwarf Tower's** fourth hundred is the second to land and the first to inherit the ramp rather than
spend it, since `TOWER_RULES.gear` is one rule for all seven. It needed **no `core/` change at all** — four
blocks, four skills, a hundred floors, four one-line `gearArchetype` edits, and a name off both `PENDING`
lists. Three findings there are about method:

- ⚠️ **A geared hundred after the first has to find an axis _on top of_ the ramp, and the ramp is not
  available as one twice.** The Proof House's is `physicalPierce` — `def × (1 − pierce)` against the
  deepest armour in the game (Dwarf `def` Σ163 / Σ186 against Undead's Σ50 / Σ45) — and it graded seven
  monotone steps with zero timeouts where every stronger dial measured was the ninety-second clock.
- ⚠️ **A party-side register can point at the right crew for the wrong reason, and the measurement is the
  only arbiter.** Both **Angel** arrangements carry _more_ authored `def` than the Dwarves and lose −0.08
  and −0.29 to the same wall where the Dwarves lose −1.00 and −1.08. `def` is the Dwarves' _only_
  mitigation; the Angels have armour and a choir. **State what the register is a share of.**
- ⚠️ **An inherited board-shaping rule can fail to transfer to a new axis, and a confounded first
  measurement can make it look like it transferred.** This tower's "escalate in front; the back rank is a
  cliff" is a rule about **output**, and moving a pierce carrier between ranks is worth −0.37 to +0.33. The
  reading that said otherwise had a third pierce body on the board, so moving one back put two carriers
  there — chapter 22's "carry a rank comparison on one body", caught before it shipped.

The **Elf Tower's** fourth hundred is the third to land, and the first hundred anywhere whose axis is
**plain throughput** — `atk` and the health standing under it, as a product. It needed no `core/` change
either: four blocks, four skills, a hundred floors, four one-line `gearArchetype` edits, and a name off
both `PENDING` lists. Three findings there are about method:

- ⚠️ **"No mechanic is available" can be the honest answer, and then the negative list is the
  deliverable.** Twelve hostile status riders span **±0.22** with four of them negative; `tenacity` is
  exactly flat and `magicResist` exactly 0.00; the Demon Tower's `critBlock`, the Undead Tower's `dodge`
  answer and the Dwarf Tower's `physicalPierce` all price at 0.05–0.10; every scope, reach and selection
  leaves the board _easier_ (the sixth tower to find it); and the entire enemy-sustain vocabulary spans
  **0.07 of a survivor**. An Elf five carries zero `physicalResist`, `tenacity`, `critBlock`,
  `critDamageResist` and `lifeLeech` on the lowest health in the game — there is no refusal stat for a
  board to have to get past, so nothing but throughput reads.
- ⚠️ **A cross-crew "is it ours" table is only as good as the weakest crew's calibration.** The first
  pass left ten of fourteen crews reading 4.00 flat and made attack look like the Elves' own lock by a
  factor of 2.35 over the next crew. Re-calibrating to the heaviest board each crew still reads ≥3.75 on
  moved elf-alt from **first of fourteen to fourth** — which changed the licence from exclusivity to
  **margin**, and the header now says so. The saturated-control trap, arriving on the test rather than on
  an axis.
- ⚠️ **The anchor that retires can be the one whose kit was the previous hundred's axis.** Two of this
  tower's own roofs had to go — `THE_EDGEWRIGHT` (1300/84) on the `critChance` the _third_ hundred was
  built on, and `THE_WARDWRIGHT` (1560/92) — while the heavier, older `THE_GRUDGEKEEPER` (1520/89) and
  the Adamant Colossus (1250/88) both stand. The Colossus stands on `haste` **58**, the lowest in the
  game: attack bills only as often as it swings. **Weight predicts none of it.**

The **Undead Tower's** fourth hundred is the fourth to land, and its axis is `atk` and `haste` **as a
product**, on authored weight that falls across the hundred. Same shape of session: four blocks, four
skills, a hundred floors, nine one-line `gearArchetype` edits, and a name off both `PENDING` lists.
The Coppice is the exact inversion of the tower's own third hundred — that one escalates through
boards that will not die, on the argument that a crew sustaining on `lifeLeech` off damage dealt is
starved by a board with no pool left; this one fields boards that **do not need to live**, so the
fight ends before attrition can pay. Five findings there are about method:

- ⚠️ **An axis can be a product where neither half is worth much alone.** `atk` 48 alone reads
  2.52 / 2.58 and `haste` 120 alone 3.00 / 2.63; together 2.00 / **0.97**. The Dwarf third hundred's
  "weight and rate are a product" and the Elf fourth's "attack and health are a product", arriving on
  the two halves neither of them paired.
- ⚠️ **It is the first axis chosen because it makes fights _shorter_.** This tower's binding case is
  its own shipped floor 100 at **51.2 seconds against a 67.5s bar**, and every rival walks toward it
  (enemy `hp` 1000 at 32.1s, `def` 110 at 33.5s, a board-wide `WEAKEN` at +6s). The longest fight in
  the whole hundred is **24.3s**, and each of this tower's four hundreds has now closed faster than the
  one below it.
- ⚠️ **A mechanism argument is not a measurement.** `magicResist` had the sharpest "is it ours" story
  available on paper — Undead deal 14 magical skills to 6, and their sustain is leech off damage
  _dealt_, so a magic wall taxes both at once — and it measured **within a second of `def` and `hp`**,
  which makes it that tower's own third-hundred axis wearing a different stat and worth **0.00** to the
  binding arrangement cross-crew. It was disqualified rather than merely declined.
- ⚠️ **An axis stops being a crew's own when the crew gains a rung and a kit.** Re-measured at band 4,
  this tower's _third_-hundred axis costs dwarf-ref **−2.78** against its own crews' −1.25 / −1.00, and
  its _second_-hundred `dodge` costs dwarf-ref −1.05 against undead-ref's −0.85. Re-run the test on the
  band being authored.
- ⚠️ **The missing-`gearArchetype` trap can invert the sign of an anchor-retirement check.**
  `THE_WITHERED_CROWN` measured 3.10 / 3.63 — safe — while fighting **naked** on a board priced as
  though it were kitted, and reads **3% / 18% at 41 seconds** once given one. Supply the archetypes
  before the check, not after.

Also worth recording: **the stride is not the check on a closing band.** `towers.balance.ts` samples
every fourth floor plus the mini-bosses, and the every-floor assertion is what caught a floor 399 at
**60%** between neighbours reading 100% and 98%. And ⚠️ **aim past the front rank is now inert or
negative on all seven towers**, which closes that question rather than extending it.

Also worth recording because it is the failure the prose check exists for: the Panoply's own header
claimed to be the lightest tower roof on attack and tied on health, and the Proof House took **both**
records one session later at 1200/52 — and the Coppice's `THE_SPRINGWOOD` took the health record back
at **1160**/72 one session after that. Every file now states the list of roofs rather than a
superlative — and it is a list of **ten** now, which is the point.

The **Monster Tower's** fourth hundred is the fifth to land, and it is the first hundred anywhere that
**builds on the axis below it** rather than replacing one. Same shape of session: four blocks, five
skills, a hundred floors, and a name off both `PENDING` lists.
The Turning escalates through `dodge` joining the `physicalResist` its own third hundred is built on:
plate that is not there when the blow lands. Four findings there are about method:

- ⚠️ **The mechanism argument gets it wrong in _both_ directions, and the test is super-additivity.**
  The Coppice disqualified `magicResist` because it landed on a curve its tower had already spent, and
  `dodge` has the identical story on paper — plate and evasion both cut the damage a `lifeLeech` crew
  sustains on. Measured, the two are **not one curve**: at 0.60 and 0.45 they are worth 1.90 and 1.25
  of five alone and **3.90 together**, and on a single anchor each half costs 0.26 of the binding
  arrangement where the pair costs **1.88**. The mechanism said "spent"; the measurement said the
  sharpest thing on the tower. **Test the pairing before believing either answer.**
- ⚠️ **A dial that grades is not the same thing as an axis that is _ours_.** A second `ascended` anchor
  grades 3.90 → 3.00 → 2.30 → 2.05 → **1.77** with zero timeouts, and lifting that ration is exactly
  the Coppice's own licence — the hundred below is not wrong, the crew meeting it is a different crew.
  It costs dwarf-ref **−4.00** against monster-ref's −1.98, **eighth of fourteen**, and was rejected on
  that alone. Weight axes tend to belong to whichever crew is slowest.
- ⚠️ **A tower with no lean still overshoots its faction share.** This is the one tower with no
  counter-faction to author into, so its four blocks were chosen by the flat spread's **thinnest** row
  (Dwarf, 11.12% of 1,439 slots) — and the first pass still landed at **22.59%** against a 25% bound
  that may never be crossed. Both named fixes were needed, and the second one is new: swap that
  faction's non-new texture out, **and ration the axis carriers to alternate floors** so the band claim
  is a range rather than a constant.
- ⚠️ **The missing-`gearArchetype` trap was never one tower's problem.** It fired again one session
  later at **48 of 338** shipped blocks, sixteen of them on this tower's own third hundred, and it
  again inverted the retirement check in the safe direction: `THE_UNBITTEN` read a comfortable
  4.00 / 4.00 and reads **2.98 / 1.95** once given one. All 48 have one now; none stood on a geared
  board, so the bill was zero — **checked rather than assumed**.

Also worth recording because it is the second thing the prose check has caught before it shipped: the
hundred's own header claimed "at most one of the four stands in a front rank" while eight boards put
the roof beside a legendary, and quoted the tower's **161–300** sustain figures against a **201–300**
range. Both were claims measured over one range attached to another. The fix was the claims — the
boards measure correctly — and both now state the pair and the range they were taken over.

The **Angel Tower's** fourth hundred is the sixth to land, and its axis is `critChance` — how _often_
a blow finds the seam, against the one crew in the game that answered crit with the wrong half of it.
Same shape of session: four blocks, five skills, a hundred floors, and a name off both `PENDING`
lists, leaving one — the Demon Tower. The Hairline is the third hundred's question read from
the other side — that hundred escalated on how _large_ a single blow was — and the two are a product,
so the roof's own turn is **1.80 where the hundred below's is 2.60**. Four findings there are about
method:

- ⚠️ **A stat can split into the half a crew answers and the half it does not, and only one of them is
  an axis.** `critDamageResist` is subtracted from an attacker's `critDamageAmp` and says nothing about
  how often a crit lands. The two Angel arrangements are the **only two of fourteen carrying a point of
  it** — 0.76 and 0.96 across five against **0.00** everywhere else — while `critBlock`, the half that
  refuses frequency, sits at **0.06** across five there against the Dwarves' 0.23 and 0.28. Measured,
  `critChance` grades **3.73 → 0.48** across 0.09 → 0.46 with zero timeouts, while `critDamageAmp` at
  held chance is flat from 0.85 to 1.40 and needs 1.80 — past the shipped maximum of 1.15 — to be worth
  what frequency is worth at 0.30. **Ask which half of a stat the answer covers before calling it
  spent.**
- ⚠️ **The same stat can be two towers' axes for opposite reasons, and it is the register that
  separates them.** The Elf third hundred built on `critChance` because an Elf five carries **zero**
  `critDamageResist` and **zero** `critBlock`; this one builds on it because the crew carries the most
  `critDamageResist` in the game and none of the other. At band 4 the two Elf arrangements rank
  **tenth and eleventh of fourteen** on the same axis (elf-alt then elf-ref) — the crew gained a rung
  and a kit and the answer moved. "Two towers with one lock" is a question about the argument, not the stat name.
- ⚠️ **A cross-crew licence can be exclusive on the _binding_ arrangement and inert on the other, which
  no earlier hundred recorded.** Angel-alt reads **2.90** and angel-ref **0.79, eighth of fourteen**,
  against a second place of 1.39. On a tower whose two arrangements already fail on opposite axes that
  is the right answer rather than a weak one — but it has to be **said which arrangement the licence is
  over**, because "first of fourteen" and "first and second of fourteen" are different claims.
- ⚠️ **The prose check can be a _board_ bug rather than a wording bug.** The first pass fielded five
  blocks carrying a `drain` or a point of `lifeLeech` above floor 300 — on a tower whose own rule
  forbids enemy sustain above floor 160 — and the sweep was green, because the boards had been tuned
  with them on. The script found them while checking a sentence. Third session running that the check
  has caught something before it shipped, and the first time what it caught was content.

⚠️ **It also gave the retirement check its harshest reading yet, and the gear ramp is most of why.**
The shipped floor-300 board carried to floor 400 reads **0% for both arrangements**, where the same
check a hundred below read 73% / 50% on a naked board. **Four anchors retire** — the Unmade at 3% /
15% alone behind four soft bodies, `THE_UNANSWERED` at 8% / 3%, the third hundred's own roof
`THE_LAST_MERCY` at 20% / 33%, and the Ashfall Sovereign at 95% / **45%**, which fails the alternate's
bar — against the Elf and Undead pairs and the Monster and Angel clean answers a hundred below. **State
whether the board under a retirement figure is wearing gear.**

The **Demon Tower's** fourth hundred is the seventh and last to land, and it **closes the fourth-hundred
round and the tower system with it**: all seven towers stand at 400 floors, and the last session deleted
both `PENDING` lists along with every branch that read them — third time that discipline has run end to
end. Same shape of session as the six before it: four blocks, five skills, a hundred floors, and no
`core/` change. Its axis is **`magicResist`**, and it is the only one of the twenty-one hundreds whose
axis is a mechanic two towers had already measured and put down. Five findings there are about **method**:

- ⚠️ **A refusal on _size_ expires, and this is the case that proves it.** This tower's own second
  hundred declined a magic ward because at the shipped ceiling of 0.14 it was worth 0.00 to the
  reference five and 0.54 to the alternate; the Angel Tower's fourth declined it again on its own crew
  at 0.10 to 0.35 across 0.15 → 0.70; the Undead Tower's fourth disqualified it as its own
  third-hundred axis wearing a new stat. **All three were right about what they measured.** Three
  further hundreds of blocks took the ceiling to **0.26** and the crew gained a rung and a kit, and
  re-measured at band 4 the same stat grades **nine monotone steps** with zero timeouts (3.95 → 1.95
  across 0.10 → 0.74) and comes back first of fourteen cross-crew. At the register it is _still_ worth
  0.03, which reproduces the earlier refusal exactly. **A recorded negative is a claim about a curve;
  re-measure rather than inherit, and record which register you measured against.**
- ⚠️ **Reading the damage formula chose an axis for the second time.** `effectiveDefence` returns
  `def × (1 − pierce)` and `resistedShare` multiplies by `1 − resist` **afterwards**, so a pierce never
  touches a resist. The Demon fives carry **nine and seven magical damage effects and zero physical** —
  their only physical damage is the basic attack, where the Elf, Human, Dwarf and Monster crews carry
  **zero magical effects at all** — and they hold the game's largest `magicPierce` at Σ0.30 / Σ0.25
  against Σ0.15 everywhere else. **The crew built to open armour has no answer to the wall that is not
  armour**: the Monster third hundred's finding mirrored onto the other damage type. The licence is the
  widest of the twenty-one — demon-alt **1.15** against a second place of 0.82, with **nine of fourteen
  arrangements at or under 0.15** — and it is over the **binding** arrangement, demon-ref only fourth.
- ⚠️ **A pairing can be _worse_ than the half, which runs chapter 23's finding backwards.** Adding
  `physicalResist` at the same size read demon-alt **0.95** against `magicResist` alone's 1.15 **and
  lifted every physical crew off 0.00** (dwarf-alt 0.97, monster-ref 0.85, dwarf-ref 0.73). Harder in
  the abstract, and the licence diluted to nothing. The Monster fourth hundred had just established that
  a pairing is what licenses building on a spent axis; this is the same test coming back the other way.
  **Test the pairing and accept whichever direction the answer arrives from.**
- ⚠️ **A stat carried by _zero_ shipped blocks can grade beautifully and still not be yours.**
  `attackSpeed` sits on **0 of 346** blocks, grades six monotone steps on this tower's reference five
  (4.00 → 2.10 across 0 → 130) and adds only **2.6 seconds** of fight — the shape chapter 25 and three
  towers now select for. Cross-crew it costs angel-alt **4.00**, dwarf-alt 3.88 and angel-ref 3.42,
  putting demon-alt **eighth of fourteen**. **A speed tax belongs to whichever crew is slowest**, which
  is the Monster fourth hundred's warning about weight axes wearing a new stat. **An empty register is a
  licence to measure, never a licence to author.**
- ⚠️ **The strong sustain absolute is sayable once and only after the anchors retire — and it was still
  false on the first pass.** Five towers have shipped a false sustain claim and every previous fix was
  the sentence. This hundred can say the absolute — **no board over 301–400 carries a `heal`, a `drain`,
  a `shield`, a `regen`/`barrier`/`aegis` status, or a point of `lifeLeech`, `recovery` or
  `healthRegen`**, against 26 and 36 boards over 201–300 — but only because the four retired anchors were
  where nearly all of it sat, and only after the prose check found the Sealward Custodian and the
  Seedlight Keeper standing on **fourteen** boards. Fourth session running the check caught something
  before it shipped, and the second time what it caught was **content**.

⚠️ **Its retirement check is the harshest of the seven and confirms the Angel Tower's reading rather
than merely repeating it.** The shipped floor-300 board carried to floor 400 reads **0% for both
arrangements**, where that board at its own floor reads 100% with all five alive. **Four anchors
retire** — The Unison 0% / 0%, the Unmade 70% / **0%**, the Hollow Seraph 78% / **3%**, and The
Unfaltering, the hundred below's own roof, 100% / **5%** — leaving the tower with no ascended anchor it
can field above floor 360, which is why a **legendary** carrying the deepest ward in the game anchors
its closing bands instead. Two towers have now retired four each on a geared hundred against pairs and
clean answers on the naked ones below. **State whether the board under a retirement figure is wearing
gear.**

### What the third hundreds established

All seven towers reached 300 floors, one session each, and the findings that generalise
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

### What chapter 15 established, being the chapter that had to price the cap's gradient

- ⚠️ **The gradient chapter 14 celebrated has a rate, and the rate is arithmetic rather than
  tuning.** Every chapter that closes entirely above `legendary-plus`'s cap of 260 divides the seam
  ratio by `perLevel.common ** 25` = **1.680**, by construction. The four most recent read
  **10.4858 → 7.6774 → 4.5665 → 2.7160**, and The Underroad's party stands **sixty-five levels**
  under its last board where The Shutgate's stood forty and The Quarry's fifteen.
- ⚠️ **What that costs is that every block comes down by roughly half, and the whole board with it —
  not just the anchor.** Chapter 14 recorded that what moves a tuned party is the anchor slot; that
  is a fact about _which slot the response lives in_, not a licence to prop a light anchor up with
  heavy support. Measured: chapter 14's final board at level 325 reads 0% in 11.5s; **with The
  Doorstone deleted outright** the four remaining bodies still read 35% with 0.68 survivors, and
  three of them alone read 0%. Only a uniform halving reads 4.00.
- ⚠️ **`mythic` was ruled out by measurement, and this is the finding a chapter-16 session needs
  first.** A degenerate seam chain makes "move the party up a rung" look like the obvious repair, and
  at chapter 15 `mythic`'s cap of 340 would for the first time in four chapters put the party _level_
  with the close. Measured, a `mythic` five at 325 takes chapter 14's final **unchanged** at 100% with
  all five alive in 3.9 seconds, and needs the board scaled **×2.4** — an anchor near **3,550 health**
  against the Unmade's ceiling of 1800. **So the rung the log-space rule prefers is also the only
  one the enemy roster can legally be authored for**, and reaching for `mythic` is reaching for a
  `data/` rule change rather than for a chapter.
- ⚠️ **A board's raw health total is the wrong quantity to author against, and it gets more wrong
  every chapter.** An `ascended` block is worth **×2.587** of a `common` one at level 325 and
  **×1.608** of a `legendary` one, because `perLevel` is 1.024 / 1.0225 / 1.021 compounded over the
  level. Measured, `c15-s49` at 2,980 raw health reads 4.00 survivors and a 3,100 first draft of the
  final read **0%** — a 4% difference in raw weight and the whole outcome, because in
  common-equivalent terms they were 4,283 and 5,581. **Convert to common-equivalent weight before
  comparing two boards, and certainly before comparing two chapters.**
- ⚠️ **An anchor sweep that reads flat is a saturated control, not an inert anchor.** The final first
  measured **0% at every weight from 880/54 down to 520/34** — the boss's stat line completely inert.
  The cause was the Stepfall Standard on the same board: a ×1.3 `atk` buff across five is worth
  more than the anchor's whole stat line at this budget. Taking it off took the same board to 100%.
  **Check the control can move before concluding anything from an anchor sweep** — the same discipline
  the Demon Tower's `critBlock` band recorded.
- **`lifeLeech` was permitted where chapter 14 carried none**, and the argument is the shield
  argument in a third form: a leech is bounded by the damage its holder deals and stops when the
  holder dies, where a `recovery` pays on a clock nobody has to earn. Twelve of fifty boards carry
  one; zero carry `recovery`, `healthRegen`, a heal or a pool; **zero timeouts** across the chapter.
- ⚠️ **The prose check earned its place for the fifth session running, and this time about the
  faction share.** The header claimed an 85.2% lean written from the intent; the boards measured
  **86.4%**, because the closing band's weight budget pushed three Dwarf commons off boards that could
  not afford them. The measured figure shipped and the boards did not move — which is the fix chapter
  14's own header prescribes after making the identical mistake.

### What chapter 14 established, being the chapter the rung's cap ran out under

- ⚠️ **The campaign's difficulty gradient is back and enemy gear is not what brought it.** Milestone
  24 flattened the level line, traded the gradient away, and named enemy gear as the axis that would
  restore it; chapters 12 and 13 measured that axis at a twentieth of what it needs and then at ×1.15
  a grade. What restored it is `legendary-plus`'s **cap of 260**, which the campaign passed at chapter
  12: The Shutgate closes at 300, so the party it is tuned for stands **forty levels** under its last
  board. The three most recent seam ratios read **10.4858 → 7.6774 → 4.5665**, ×0.595 a chapter and
  compounding. ⚠️ **One of the three widened guards came back on that** — `meanSurvivors < PARTY_SIZE`
  at the top of the ladder, measured at 4.00 of five with zero timeouts — **and it does not license
  moving either of the other two**, whose problems are their own shapes rather than the gradient.
- ⚠️ **The seam chain has gone degenerate, which is a second and sharper instance of chapter 13's
  finding.** Chapters 13 and 14 both close above the same cap, so `QUARRIED` and `INVESTED` clamp to
  260 and are literally the same combatants: the two assertions a seam exists to make either side of a
  boundary are now one claim, and the momentum ceiling is vacuous by construction rather than by
  arithmetic.
- ⚠️ **A later chapter's anchors are now the _lighter_ ones, and the campaign has reached the rule the
  towers' third hundreds established.** Chapter 13's final board refielded at chapter 14's roof level
  reads **0% with nobody standing**, so The Doorstone is 1480/88 against The Undercut's 1780/99 — the
  first chapter final authored lighter than the one before it. **Field the previous chapter's final at
  the new roof before authoring anything.**
- ⚠️ **The chapter's own subject measured inert, and the negative list is the deliverable.** The
  Shutgate asks whether the party's damage arrives _big enough_, and against the party it is tuned for
  **every refusal mechanic in the game is worth 0.03 survivors or less**: `def` from 44 to 170 reads
  4.03 → 4.00, board-wide `physicalResist` from 0.08 to 0.60 reads 4.03 → 4.00, and a board-wide
  barrier, aegis, guard or weaken all read 4.00 — while the fight grows by between half a second and
  eleven. **Refusal is a fight-length axis, which is the ninety-second clock rather than a difficulty**,
  and it is exactly the failure a Dwarf lean is warned about. What moves this crew is the anchor slot,
  and its response there is a cliff: board-wide `atk` ×1.6 reads 3.98, ×2.0 reads 1.43, ×2.5 reads 0.00.
- ⚠️ **A fourth guard was retired rather than slid.** `banners.spec.ts`'s roster-relative crystal
  ceiling fired at 29.99 days against 30, and it failed the way it was written to fix — it measured
  against the roster to avoid decaying with content, but the roster is static and the ladder grows, so
  it falls on every chapter by construction. Holding it needs five new ascended-tier characters per
  chapter, forever. See [economy](economy.md).
- ⚠️ **The prose check earned its place again, twice in one session.** The chapter header claimed an
  85.2% lean while the boards measured **90.0%**, and claimed 10 boards carrying a shield where the
  count was **20**. It also found a dead stat key — `receivedHealing` on the Ashen Hierophant — that had
  shipped silently since the stat collapse, and deleted rather than corrected it.

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
- `levels.spec.ts`'s "charges real time" fired at **chapter 16** and its **ceiling half was
  retired** — the fourth guard in the project retired rather than slid. Recomputed per chapter it
  reads 7.47, 9.03, 12.29, 14.33, 18.49, 21.05, **26.16** for chapters 10–16: monotone increasing by
  construction, because level cost is exponential and income is linear in the stage index. ⚠️ **The
  marginal form does not rescue it either** (3.04 → 6.61 over the same span), and **essence alone is
  the runaway** — gold and XP sit at 10.5h and 11.7h. The floor is kept; the finding is that essence's
  cost curve outruns essence income and compounds, which is the release-time economy pass;
- the level curve is consumed entirely around **chapter 42**, where it used to be ~15.

⚠️ **42 is still not the ~100 chapters the campaign is planned for**, and closing that needs either
0.20 levels a stage or a `maxLevel` past 2,400 with `perLevel.common` retuned to match — a change to
every balance figure in the project. **How long the campaign is meant to be is still open.**

⚠️ **Chapter 18 moved the campaign's rung to `mythic`, which is the first rung move in seven
chapters and closes one of the open questions above.** Chapters 11 through 17 all sat on
`legendary-plus`, whose cap of 260 the ladder passed at chapter 12, so every chapter's boards had to
fall by `perLevel.common ** -25` = 0.595 to stay winnable — six halvings that drove the seam below
1.00 and the board budget through the floor of the shipped enemy pool. **A chapter 18 on that rung
was arithmetically impossible**: 129 → 91 common-equivalent per body, against five shipped blocks at
or under 129 and none at or under 91. The move needed no `data/` rule change, because three chapters
of halving had quietly made the chapter-15 measurement that ruled `mythic` out false. ⚠️ **`mythic`
is the signature-item unlock, so the campaign now reaches it** — the note below is superseded on
that point. See [ladder](ladder.md).

⚠️ **Chapter 19 stayed on `mythic`, and it is worth recording that a chapter had to argue for
_staying_ as hard as chapter 18 argued for moving.** The Backcut's close of 425 gives `mythic` a seam
of 2.8677 against `mythic-plus`'s 24.1942 — the log-space rule prefers staying put by 1.09 of a nat,
**numerically the same margin chapter 18 overrode**. What licensed that override was the seam below
it being _wrong_ (0.9608, under 1.00, with a board budget under the lightest body the game ships);
nothing of that kind holds here. **An override is licensed by the seam below it, not by the size of
the margin**, and the two chapters are now on record from opposite sides. The degenerate seam chain
has re-formed one link deep, and the countdown resumes: chapter 20 reads 1.7069, chapter 21 1.0161,
chapter 22 0.6048, so **`mythic` buys about three chapters** exactly as `legendary-plus` bought
seven.

⚠️ **Chapter 20 stayed on `mythic` a second time and chapter 21 a third, and the countdown the entry
above wrote down was right about the arithmetic and wrong about the pool.** The projection said the
rung buys about three chapters; chapter 20 measured it buying about one and a half, and The Longebb
is the half. Its seam is **0.8241** — the first reading under 1.00 on this rung, and the first time a
chapter has stayed on a rung whose seam is under 1.00. **That is still a derivation rather than an
override**, because what licenses an override is the seam _below_ being wrong and chapter 20's is
1.5373: the chapter was authorable and its sixty boards all clear at 100% with zero timeouts.
`mythic-plus` was fielded rather than assumed this time and takes chapter 20's own final at level 485
with all five alive in 3.2 seconds — a walkover three chapters deep. **What moves the rung next is
the pool**, and it is one chapter away: chapter 22 closes at 515, where the whole shipped Monster
light tail is worth ×1.86 less than a board needs.

⚠️ **Chapter 22 moved the rung to `mythic-plus`, and it is the campaign's second override — the
prediction one entry above being checked and holding.** The Downstroke closes at 515, where `mythic`
reads 0.4418 against `mythic-plus`'s 3.7273: the log-space rule prefers staying put by 0.886 of a nat
and the chapter overrides it. **What licenses it is the pool, exactly as chapter 21 said it would
be** — at level 515 the **five lightest bodies in the entire game** read 0% with 0.00 survivors
against a `mythic` five, so there is no chapter 22 on that rung at all. The move re-opens the pool
(181 of 282 blocks land inside the ordinary-slot band, against 116 of 238 after chapter 18's move),
ends the four-link degenerate chain, and makes The Downstroke's boards the **first authored heavier
than the chapter below them since chapter 13**. The countdown restarts: chapter 23 reads 1.9981,
chapter 24 1.0711, chapter 25 0.5742, so the arithmetic buys about two and a half chapters and the
pool will run out first — **as it has both times now.** `ascended` at cap 500 is the last rung the
campaign can spend.

⚠️ **Chapter 23 stayed on `mythic-plus`, and the pool wall it found is a different shape from the two
before it.** The Evenfall closes at 545, where `mythic-plus` reads 1.9981 against `ascended`'s
16.8578 — the rule prefers staying put by 0.886 of a nat, both seams are above 1.00, and the chapter
was authorable, so it is a **derivation**. What it measured on the way is new: every previous pool
wall was a **weight** wall, and this one is an **attack** wall. Because chapters 22 and 23 clamp to
the same cap of 420, the party is literally unchanged while the boards climb thirty levels — so an
authored `atk` is worth ×1.87 more than the identical number a chapter below. Filtering the 292
shipped blocks on weight alone passes 117; adding attack leaves **55**, and none at all from either
celestial. ⚠️ **It fired as an authoring error before it was understood as a rule**: the chapter's ten
new blocks were first drafted with chapter-22 attack values and every board read 0%, including the
lieutenant at all five appearances and the final at every stat line. **The escort is the constraint at
this depth, not the anchor.** The chapter also inverted chapter 14's refusal finding outright, nine
chapters later — `def` past its register and `physicalResist` were measured worth ≤0.08 of a survivor
at The Shutgate's weight and are worth 1.65 and 2.30 here.

⚠️ **Chapter 24 stayed on `mythic-plus` for the second chapter running, and what it found was about
_method_ rather than about the campaign.** The Nevermark closes at 575, where `mythic-plus` reads
1.0711 against `ascended`'s 9.0371 — the rule prefers staying put by 0.886 of a nat, both seams are
above 1.00, and the chapter was authorable, so it is a **derivation**. Three things it recorded:

1. ⚠️ **A filter on weight and attack is not a pool count.** Chapter 23's finding — that the binding
   constraint at this depth is attack rather than weight — is right, and screening the 302 shipped
   blocks that way leaves **15, every one a Monster**, which would have forced a third Monster lead
   on pool grounds. **Fielding** the same 302 instead of filtering them leaves **121**, across all
   seven factions. The chapter leaned Dwarf, the thinnest legal lead at 44. **Field the pool; do not
   screen it.**
2. ⚠️ **`tenacity` inverted, three chapters after The Longebb declined it.** Chapter 21 measured it as
   the register check's eighth answer and **flat** — 0.25 at 0.20 and 0.33 at 0.60 — and declined it
   on the measurement. Against chapter 24's own control it is a **six-step monotone dial with zero
   timeouts**: 0.80 / 1.53 / 2.43 / 3.21 / 3.61 across 0.20 → 0.85, entirely inside its shipped
   register. What changed is the board under it and the fight length above it. That is the third time
   a recorded negative has inverted (chapter 18 on `mythic`, chapter 23 on chapter 14's refusal list),
   and it is now the rule rather than the exception: **a negative result is a claim about a curve.**
3. ⚠️ **The chapter's first premise priced at zero and was abandoned before any board was authored.**
   Conditioned enemy kits — a board that answers what the party just did — read within ±0.08 of the
   control on all six condition kinds, and **negative** on the payload axis: at power 3.6 an always-on
   turn reads 1.46 of five where the identical turn behind `enemies-at-least 5` reads 3.88. A
   condition is a restriction on the board and the party is the beneficiary, which is chapter 20's
   wrong-sign finding in a new place. **Price a chapter's premise before authoring its boards** cost
   one measurement here and would have cost sixty boards.

⚠️ **Chapter 25 moved the rung to `ascended` — the campaign's third override, and the first where
the two halves of the licence disagreed.** The Thinground closes at 605, where `mythic-plus` reads
0.5740 against `ascended`'s 4.8443: the log-space rule prefers staying put by 0.885 of a nat and the
chapter overrides it. The standing licence is that an override needs the seam **below** to be wrong
_and_ the pool to be unable to supply a board — and here the seam below is **1.0711, above 1.00**, so
only the pool half holds. That is precisely the shape chapter 21 declined an override on; what
separates them is that chapter 21's chapter was **authorable** and this one is not. Measured by
fielding all 312 shipped blocks beside four light escorts at level 605, **4 stand against a
`mythic-plus` five — every one a Monster — and 282 against an `ascended` one**, and chapter 24's own
opening board, mid board and final all read 0%. **The pool has now settled all three overrides; when
the halves disagree, say which one you have.** Three further things:

1. ⚠️ **It is the last chapter for which the rung question has a tuning answer.** `ascended` caps at
   500; `ascended-1` caps at **600**, five levels under this chapter's own close, and reads a seam of
   **61.94** — a walkover by two orders of magnitude, by construction. Chapter 26 inherits 4.8443, 27
   reads 1.3901 and 28 0.7446. **A chapter that cannot be authored on `ascended` is a `data/`
   question about `LEVEL_CURVE.caps` rather than a chapter**, and that question is now on the table
   alongside "how long is the campaign meant to be".
2. ⚠️ **The first axis ever chosen on _fight length_ rather than on survivors.** `physicalPierce`
   grades in ten monotone steps (0.20 → 2.33 across 0.08 → 0.45) **and** in carrier counts (1.27 →
   1.96 at one through five), with zero timeouts — but what chose it is that it moves the control
   from 38.7s to only 43.9s, where `def`, `physicalResist`, `dodge` and `tenacity` all walk toward
   the 72s bar that cost chapters 22 and 24 two boards each. The longest fight in the whole chapter
   is **29.0s**. A chapter about attrition wants the axis that converts weight into deaths rather
   than into seconds.
3. ⚠️ **Two more recorded readings inverted, making five chapters running.** `def` is a **cliff**
   here — 1.78 at 20, 3.65 at 40 — where chapter 23 graded it 0.40 / 1.65 / 3.55; and `THORNMAIL` on
   the back three is a **total wipe** where chapter 19 measured that exact arrangement at 0.00 and
   chapter 22 at less than nothing. Only `critBlock` reproduced chapter 23 exactly. **The table does
   not transfer except across a degenerate seam.**

⚠️ **Its lean was chosen against the depth ordering, for the second time and on a new argument.**
Undead led at 49 blocks where Human was thinnest at 46 — because Human had led The Downstroke two
chapters earlier, its third lead, and Undead had last led five chapters back. Chapter 21's overrule
was the **budget**; this one is the **rotation**. The seven now run angel 24, demon 25, human 46, elf
53, dwarf 54, undead 59, monster 61.

⚠️ **Calibrating the control before authoring is what made the difference, measurably.** Chapter 17's
first authored draft failed 22 of 50 boards and chapter 19's 21 of 50; chapter 25's failed **1 of
60**. The twelve boards that did have to move were moved by a **mechanical claim check** — two
`enemy-back` turns on one board, two board-wide turns on one board — run before the sweep rather than
after it, which is seconds against minutes and catches a different class of thing.

⚠️ **Chapter 26 — The Roughcast — is the first chapter with no rung question left, and the first
whose degenerate seam can never be broken.** It closes at 635 and stays on `ascended`: 2.5971 against
`ascended-1`'s 33.2031, a preference for staying put of **1.30 nats**, the widest margin any chapter
has had. `ascended` caps at 500 and the ladder passed `ascended-1`'s cap of 600 at chapter 25, so
there is nothing to override toward. **From here every chapter is pure squeeze** — thirty levels of
board against a party frozen at cap 500, ×1.8654 a chapter — and the seam chain deepens a link a
chapter forever, because the four degenerate stretches before this one were each closed by a rung
move and nothing can close this one. **Do not read a fifth or sixth identical link as a bug.** Five
things:

1. ⚠️ **The pool was not a wall and there was nothing to argue about.** Fielded as ordinary bodies
   beside four light escorts at level 635, **246 of 378 shipped blocks stand**, across all seven
   factions and 47 of them Monster. The quota landed at the quota for the seventh chapter running.
2. ⚠️ **The board budget falls while the levels climb, which is the squeeze made concrete.** Chapter
   25's own final reads 100% with 3.95 of five at 605 and **0% at 615**; its mid board reads
   100% / 5.00 at 605 and **40% / 0.82** at 635. So The Roughcast's boards run **3,174 to 5,089
   common-equivalent** against The Thinground's 3,180 to 8,616, on new blocks of 300 to 1,100 health
   and 13 to 34 attack against 420 to 1,350 and 16 to 58. **Both weight and attack convert by the
   same 0.536 at a degenerate seam**, which is the one case a measured price table transfers at all.
3. ⚠️ **Its axis is the same stat as chapter 23's, read from the other side of the board.** Chapter
   23 priced complete crit _denial_ at 0.88 of one member because only two of the calibrated five
   carry crit worth denying; the same five carry `critBlock` **Σ0.05**, `critDamageResist` **Σ0.15**
   and `tenacity` **Σ0.00**, so enemy `critChance` grades where refusing it saturated — 0.20 → 3.23
   across 0.12 → 0.45 and 0.02 → 1.78 across zero to five carriers, zero timeouts. **Two chapters may
   share a stat name without sharing the argument; say which side you measured.**
4. ⚠️ **Reading `damage.ts` rather than the stat names disqualified two candidates outright.**
   `insight` is not a crit stat at all — `statusChance` computes `authored + insight − tenacity`, so
   it is chapter 24's axis wearing an offensive coat and is worth 0.10 on a board carrying no hostile
   status. `magicPierce` is worth **exactly 0.00**, because a pierce only opens the defence its own
   damage type is checked against and these boards deal physical damage.
5. ⚠️ **The 25% quota failed on the _denominator_ while every block was right, which is a new
   shape.** The first authored pass fielded **47** distinct archetypes against chapter 25's 33, which
   put eight new blocks at **17.8%**. No board had to move: trimming the returning roster to sixteen
   Monster and six Dwarf took it to **26.7%**. **The quota constrains how many _different_ things a
   chapter fields, not how much of it is new** — decide the returning roster size before authoring
   boards.

⚠️ **Two board findings and a stale table.** Two heavy bodies in one front rank is chapter 19's
failure and now has a campaign instance — `c26-s51` read 95% / 3.15 and `c26-s54` **8% / 0.20**, with
**removing any single body fixing either**, and moving the second-heaviest body back fixing both; but
applying that swap to all sixty broke two other boards, so **the rank each body takes is per-board
tuning** and was settled by measuring every arrangement. And the boss grades 4.00 / 4.00 / 4.00 /
4.00 / 3.95 / **0.42** across 240/9 → 560/22 — four rows the survivor metric cannot tell apart and
then a cliff — so **fight length is the only thing separating the final from an ordinary board**
(37.2s against a next-longest of 29.1s). ⚠️ **Its lean was chosen against the depth ordering for the
third time and by recency for the second running**: Monster led at 61 where Human was thinnest at 54,
because Human had led The Downstroke four chapters earlier and Monster had last led five back. ⚠️
**And `authoring.md`'s depth table was four tower hundreds out of date when the chapter read it** —
still saying angel 24 / demon 25 where the pool held 36 and 33. The seven now run demon 33, angel 36,
human 54, elf 61, dwarf 66, undead 67, monster 71.

⚠️ **It also nearly retired a working guard, which is worth more than the chapter.** `gear.spec.ts`
bounds the top grade's share of end-of-ladder drops at `< 0.2`, and adding sixty stages pushed it to
0.2003. `git log -S` showed the bound had **never moved in the project's history** — which reads
exactly like a guard nobody maintains, and the proposal was to replace both its arms with assertions
about shape. That is backwards: the bound has never moved _because it is not supposed to_.
`gradeSoftness` in `data/gear.ts` moves to meet it, by hand, once a chapter — **twenty times now**,
always to `stages / 2`, always restoring 18.7% — and it is done by hand on purpose, so the saturating
tilt it is papering over stays visible. Chapter 24's landing was **575**, chapter 25's **605** and
chapter 26's **635**; chapter 27 wants **665**. ⚠️ **Check both sides of a
guard before calling it stale; the half that moves may not be the half the guard is written in.**

⚠️ **The margin rule went with the flattening.** Chapters no longer close past the cap of the rung
they ask for; every one runs inside a cap the party already holds, and the campaign consumed 7 of 16
rungs rather than 11 until chapter 18 took the eighth. The
trade is that the campaign has no difficulty gradient of its own: a chapter is ×1.68 of party power
and a rung is ×1.60, so the two cancel. **The escalation is expected to arrive from enemy gear**,
and three widened guards name that as the condition for restoring them — see
[authoring](authoring.md).

**This is a roadmap decision rather than a threshold**, which is exactly why the guard that owns it
was chosen to be one that cannot decay: the rung count is fixed however long the ladder gets. It is
recorded in both spec files and left open. Nothing about it is wrong today.

[authoring](authoring.md) carries the full schedule of guards that fire before then, with the answer
each one wants.
