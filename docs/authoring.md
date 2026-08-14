# Authoring content

The procedure for adding a chapter or a hundred tower floors, distilled from the sessions that
shipped four hundred and fifty stages and twenty-one hundred floors. `AGENTS.md` states the rules and the
reference docs explain the systems; **this file is the order to do things in and the traps that
have actually fired.** Every trap below is one a session hit after a previous session had already
written it down.

Read [testing](testing.md) alongside this — the balance sweep is the only thing that reads the
boards, and a content session is mostly a conversation with it.

## What is shipped, and how to find out

| Unit             | Count                                       |
| ---------------- | ------------------------------------------- |
| Campaign         | 12 chapters, 500 stages, enemy levels 1–250 |
| Towers           | 7 × 300 floors, enemy levels 1–142          |
| Enemy archetypes | 181                                         |
| Characters       | 56, with 14 signature items                 |
| The Descent      | 24 boards, 14 card families                 |
| Expeditions      | 3 maps                                      |

⚠️ **Recompute these rather than reading them.** Every count in this table has been quoted wrong
in a comment at some point, usually because a session spent a block outside its own lean and the
figure a roadmap had projected went stale the moment it landed. A one-line `tsx` script over
`data/` answers all of it, and the [prose check](#the-prose-check) below is the habit that makes it
routine.

---

## Adding a chapter

### What a chapter session owes

- `src/data/chapter-N.ts`, fifty stages, boss rhythm at s10/20/30/40/50.
- ~10 new blocks in `enemies.ts` — 8 ordinary, plus the lieutenant and the boss — with their
  skills in `skills.ts`, re-exports in `index.ts`, and the chapter wired into `CHAPTERS`.
- A new **seam party** in `chapters.balance.ts` (below).
- `npm run test:unit`, then `npm run test:balance`. ⚠️ **The balance sweep is not optional on a
  chapter.** It is the only thing that reads the boards.

### The level line: 0.50 levels a stage, flat

**A chapter opens on the level the last one closed at and adds half a level a stage.** A fifty-stage
chapter spans 25 levels, so the whole line is `open + round(25 * (i - 1) / 49)` — steps of 0 or 1,
each level standing for two stages. There is nothing to bisect and nothing to solve.

| Chapter | Opens | Closes | Span |
| ------- | ----- | ------ | ---- |
| 4       | 30    | 50     | 20   |
| 5       | 50    | 75     | 25   |
| 6       | 75    | 100    | 25   |
| 7       | 100   | 125    | 25   |
| 8       | 125   | 150    | 25   |
| 9       | 150   | 175    | 25   |
| 10      | 175   | 200    | 25   |
| 11      | 200   | 225    | 25   |
| 12      | 225   | 250    | 25   |

⚠️ **The margin rule is gone, and the whole bisect-the-final procedure with it.** Chapters used to
close _past_ the cap of the rung they asked for, by a margin that grew +12 to +18 a chapter (+20 at
chapter 5 up to +88 at chapter 10), because each chapter handed the party a fresh rung (×1.6) while
the content climbed only levels. The flattening reverses that: **a chapter now runs entirely inside
a cap the party already has**, which is how chapters 1 through 4 always worked. Nothing needs
bisecting because nothing is being held at an edge.

⚠️ **What this deliberately gives up, and where it is meant to come back from.** A 25-level chapter
is **×1.68** of party power at `perLevel.common` = 1.021, against **×1.60** for one ascension rung —
so finishing a chapter and taking its rung very nearly cancels the next chapter, and the campaign
has no difficulty gradient of its own. That is a chosen trade, not an oversight: the ladder is
planned for ~100 chapters, and **the escalation is intended to arrive from the enemy side** — enemy
stat blocks carried no gear, and that was the axis meant to supply it. ⚠️ **It landed in chapter 12
and it is roughly an order of magnitude too small** — see the measurement below before planning
around it.

**Three guards were widened to record the trade rather than hide it**, each naming the condition
that restores it: `MOMENTUM_CEILING` (0.20 → 0.30), the survivors half of "still costs that party
something at the top" (retired), and the longest-cleared-fight bar (0.75 → 0.80 of the timer). ⚠️
**All three belong back where they were when enemy gear lands, and the honest test of that work is
whether they can be moved back** — not whether the sweep is green. Do not widen any of them a second
time.

### ⚠️ Enemy gear landed in chapter 12 and none of the three came back. Here is the measurement

The Rustwood is the chapter that was supposed to close this, and it did not. Every figure below is
from the ladder sweep's own harness, calibrated against the recorded `vaulted vs c9-s9` reading of
**69.2s**, which it reproduces exactly.

**The gap.** Take chapter 11's final, refield it at chapter 12's roof level of 250, and scale the
enemy side by `k` — the pure form of what a gear percentage does:

| ×k                            | invested party               | the party one chapter behind |
| ----------------------------- | ---------------------------- | ---------------------------- |
| 1.00                          | 100% / 5.00 survivors / 4.6s | 100% / 5.00 / 8.2s           |
| 1.09 / 1.18 (a full Worn set) | 100% / 5.00 / 5.2–5.7s       | 100% / 5.00 / 8.6–9.3s       |
| 2.00                          | 100% / 5.00 / 9.4s           | 100% / 3.83 / 22.2s          |
| 3.00                          | 100% / **4.00** / 16.5s      | 0% / 0.00                    |
| 4.00                          | **0%** / 0.00                | 0% / 0.00                    |

Zero timeouts throughout, so weight up to ×3 is safe from the ninety-second clock, and the cliff
between ×3 and ×4 is sharp.

**What gear is worth.** A full Worn set is +8.6% health on a `tank` at level 1 and +17.6% at Worn's
cap; a full **Relic** set at 100 is +166%. So the axis needs **×3** and its whole ladder end to end
delivers about ×2.7 on one stat — **roughly an order of magnitude short at the bottom and still short
at the top.**

⚠️ **One of the three moves the wrong way.** Gear lengthens fights, so it _raises_ the
longest-cleared-fight quantity the 0.75 bar bounds rather than lowering it. Restoring that bar gets
harder as this axis grows, not easier.

⚠️ **Do not read this as "chapter 12 was authored too light".** The Rustwood carries the full Worn
ladder on every one of its fifty boards and the measurement is about the ladder, not the chapter. The
next session to touch this should either size an enemy-side gear axis for the job — a steeper grade
ladder, or a per-chapter grade step much larger than one rung — or accept that the campaign's
escalation has to come from somewhere else. **Widening any of the three a second time is still
forbidden.**

**The runway:** 0.50 a stage reaches level 1000 at about **chapter 42**. 100 chapters under the
current ceiling would need 0.20 a stage; 100 chapters _at_ 0.50 would need `maxLevel` ~2455 and
`perLevel.common` down to ~1.0085 to hold the ×10⁹ range — a retune of every balance figure in the
project, recorded here so it is a decision rather than a discovery.

⚠️ **The board is still not the difficulty dial.** Fix a step backwards with **weight** — a fifth
body, a heavier back rank — never with levels. Two stages needed exactly this after the flattening
(`c5-s45` and `c8-s23`): both sat at the _same_ level as the stage before them with a lighter board,
which the old line's +2 levels a stage had been masking. ⚠️ **The front rank holds two**; a fifth
body goes in the back.

⚠️ **Widen the difficulty probe's bracket, and add a step every few chapters.** It brackets the
_party's_ power, so it grows with what the content asks rather than with the stage count. It has gone
4,000 → 50,000 → 500,000 → **5,000,000**, and the two halves move on different schedules: a factor
of ten on the range costs almost nothing in resolution (0.030% → 0.028%) while one extra step nearly
halves it (→ 0.014%). Not widening presents as a difficulty curve flattening into a horizontal line
at the ceiling.

⚠️ **The flattening slowed this down roughly fourfold and did not remove it.** A chapter used to be
worth ×6.5 of party power and is now worth ×1.68, so the bracket that needed widening every two or
three chapters will now last closer to ten — **but it still only ever grows**. Check it rather than
assuming either schedule; the failure is silent and reads as a flat difficulty curve, which is now
also what a _correctly_ flat level line looks like. ⚠️ **Those two are indistinguishable on the probe
output**, so confirm the bracket before concluding anything about a chapter's escalation.

### The four constraints on a chapter's boards

All four have been broken by a session that had already written the rule down.

1. ⚠️ **Sustain the party cannot aim past is a clock, not a difficulty.** A timeout is scored a
   defeat. The safe inversion is the Sundered Vault's Sealward Custodian: put the durability **on
   the taunting body itself**, so the one thing the party may hit is the one thing it needs to kill
   and every pool depletes.
2. ⚠️ **The difficulty probe reads every fourth stage plus the bosses, so those samples are the
   chapter's spine and have to escalate.** Band openings _want_ to be light and the stride does not
   care. **Check which stages the stride samples before authoring** — chapters 9 and 10 both did,
   and both are the only chapters where this did not fire. Fix a step backwards with **weight**
   (five bodies, a legendary front rank), never with +3 enemy levels, which fights the level curve
   for ~13%.
   - ⚠️ **What a board _asks_ and what it _weighs_ are different numbers.** Chapter 7 authored a
     band opener deliberately heavy — five bodies, legendary front rank — and it still measured a
     step backwards, because thorns on fodder is a cheap question and the probe only reads weight.
3. ⚠️ **A chapter opens at the level the previous one closed on.** A name change and a boss behind
   you, not a step. The probe excludes that pair by name; do not author a step into it.
4. ⚠️ **Any new `ascended`-tier block stays under the Unmade on both stats.** `enemies.spec.ts`
   asserts it. What makes a boss the harder fight is the questions it asks and the level it is
   fielded at — every chapter boss since has respected the ceiling rather than raising it.

### The 25% rule, the boss and the lieutenant

**25% of the distinct archetypes a chapter fields must be blocks that did not exist before it**,
with the boss and the lieutenant excluded from both sides of the fraction. A fifty-stage chapter
fields 32–35 distinct archetypes, so the quota is **8 new ordinary blocks**.

⚠️ **The denominator is what the chapter _fields_, not the shipped pool.** Over the whole pool it
compounds to ~90 new blocks across four chapters and puts every per-faction depth guard under
pressure at once; over board slots it is satisfiable by five blocks used heavily. Fielded-distinct
is the reading that means "a quarter of what you meet here is something you have not met".

**Two unique bodies on top of that, so ten blocks in all:**

- **The chapter boss** — every chapter ends on a body fielded nowhere else, and a session that
  ships without one has not finished. ⚠️ **The rule is about the _headline_ body only**: a
  lieutenant may stand on its chapter's final as support and may not _be_ it.
- **A lieutenant** — one heavy block anchoring all four mini-boss boards (s10, s20, s30, s40) at
  rising levels, so the chapter has a recurring antagonist rather than four one-shot stat blocks.
  Deliberately not four unique bodies: twenty blocks each appearing on exactly one board is most of
  what `enemies.spec.ts`'s orphan rule exists to discourage.
  - **A lieutenant's signature does not have to be an opening turn**, and the better shape is a
    **conditioned** skill — it answers what the party is doing, so four appearances are four
    different fights against one block.

### Which faction to lean on

A chapter leans on one faction and its new blocks go there, which is what gives the chapter a
place and what keeps sessions touching non-overlapping slices of `enemies.ts`.

- **Deepen a thin faction rather than a deep one.** The seven now run angel 24, dwarf 24, monster 24,
  demon 25, undead 25, human 26, **elf 33** — The Rustwood's ten blocks took Elf from thinnest to
  deepest by nine, which is the second time a single lean has reversed the ordering outright.
  Recompute before choosing; **Angel, Dwarf and Monster are now joint-thinnest at 24**, and Angel is
  barred from leading a chapter.
- ⚠️ **Elf has now led twice — chapter 8 and chapter 12 — and that is the first repeat lead.** It was
  legal because four chapters after the Sunless Weald, Elf was still the thinnest legal lead at 23.
  What a repeat costs is that the chapter has to be a visibly different **place**: the Weald is the
  Elves at home and The Rustwood is the Elves out on somebody else's battlefield, picking it over.
- ⚠️ **The Rustwood's lean measures 92% of board slots, the heaviest any chapter has carried**,
  against the Weald's 81%, The Bleeding Wild's 84% and The Standing Line's 83%. Stated rather than
  rounded because it is out of family, and the cost is real: a pool that mono makes the faction
  matchup nearly constant across fifty boards, which is the one axis a mixed pool keeps live.
- ⚠️ **Check what the remaining sessions already cover.** Milestone 21 fixed its four leans up front
  and still nearly closed with Human as a standout thin faction at 13 against Dwarf's 22, because
  three later sessions each leaned elsewhere.
- ⚠️ **A lean is worth ten blocks, so it can reverse the ordering in one chapter.** The Standing Line
  took Human from **thinnest of the seven at 14 to deepest at 24** in a single session, which is why
  the depths are recomputed rather than read: the argument that picked a lean is stale the moment
  that lean ships. ⚠️ **Angels and Demons are no longer the thinnest and the constraint has not
  changed** — a celestial still may not lead a chapter, whatever the counts say, because the ×1.10
  is a fact about the matrix rather than about depth. **Elf at 23 is now the thinnest legal lead**,
  with Dwarf and Monster level behind it at 24.
  - **A tower may spend on a celestial where a chapter may not**, and the Elf Tower's third hundred
    is the worked example: Angels and Demons both counter Elves, so its four filler blocks went 2 to
    Angel and 1 to Demon behind a Dwarf lead, taking the two thinnest factions to 18 and 19. The
    standing ×1.10 that forbids a celestial-led _chapter_ is exactly what a tower is buying.
  - ⚠️ **A _celestial_ tower has only two factions to substitute into, and that is the matrix rather
    than a shortage.** `countersOf('angel')` is exactly `{demon, monster}`, so the Angel Tower's
    third hundred had one choice for its non-lean blocks and took it: two Demon (the recurring
    swinger and the roof) and two Monster, which moved Monsters off the joint-thinnest slot at 21.
    ⚠️ **The Demon Tower is the tighter version of the same problem and worth reading before the next
    celestial hundred**: `countersOf('demon')` is `{angel, monster}`, and Angel is already its lean —
    so the **only** substitute source is Monster, one faction rather than two. It spent 3 Angel (the
    spine, the texture body and the roof) and 1 Monster, taking Angels 21 → 24 off the thinnest slot
    and Monsters 23 → 24. That single substitute also has to hold the 65% share down, which is why
    its closing bands run **monster 29%** — in line with the Angel Tower's own 31.4%, and a fact
    about which shipped blocks carry a defensive stat rather than a choice.
- ⚠️ **A _tower's_ lean is fixed by the matrix, so when it lands on an already-deep faction the
  blocks go elsewhere.** The Dwarf Tower leans Human and Human was second-deepest at 24, so its third
  hundred put the boss and the recurring anchor there and spent the other three on Monsters and
  Demons — **all four of which counter Dwarves**, so the lean stays live. The test is
  `countersOf(tower.faction)`, not "the leader faction"; a substitute from outside that set quietly
  switches the matrix off on the board it lands on.
- ⚠️ **Do not lean a chapter on Angels or Demons.** A celestial deals ×1.10 to every mortal and the
  matrix has **no mortal → celestial row**, so a celestial-led board is a standing tax no mortal
  composition can answer — worth about nine levels of investment, silently, on top of whatever the
  level dial is doing. The Sundered Vault is the celestial chapter and it records why its lean had
  to be moderate rather than total. **One chapter may carry that; a second should not.**
- ⚠️ **Read a faction's idiom for the failure it makes easy before authoring against it.** Dwarves
  own the tankiest blocks in the game, so a Dwarven chapter is the one most able to run the
  ninety-second clock out — what makes it hard has to be **refusal, not health**. Monsters are the
  inverse: raw `atk`, thin armour and `lifeLeech` in place of a healer, so the risk is a **closed
  loop** rather than the clock.

### The enemy roster, and what `enemies.spec.ts` holds

A hundred and forty archetypes ship, and the distribution is deliberately uneven — a chapter or
tower leaning on a faction needs depth in it. The invariants:

- **Every faction carries at least four archetypes, and owns a `common`, a `legendary` and an
  `ascended`.** The tier split matters as much as the count: content runs from enemy level 1 upward,
  so a lean has to supply both ends. Four factions once had no `common` at all and three had no
  `ascended`, which is why the shape is asserted **per faction** rather than the count alone.
- ⚠️ **Every archetype must be fielded somewhere, and "somewhere" is every ladder rather than the
  campaign.** That rule lived in `chapters.spec.ts` while the campaign was the only content;
  eighteen tower-only blocks would have failed it as orphans, so it moved whole to
  `data/enemies.spec.ts`, the only spec that sees both. **Widened, not relaxed** — an archetype
  nobody ever meets is still a stat block with a comment attached.
- ⚠️ **Any new `ascended`-tier block stays under the Unmade on both stats.** The Unmade is the
  ceiling and nothing may reach it. Every chapter boss since respects it rather than raising it —
  what makes them the harder fights is the questions they ask and the level they are fielded at.
- **Ids and names are globally unique**, which is a check that only runs once everything has landed.
  ⚠️ **That is why parallel authoring sessions collide**: run them one at a time, each rebased on the
  last.

### The name, the setting and the signature

The shipped eleven, with the level range each closes over:

| #   | Name               | Stages | Levels    | What its boards have an opinion about           |
| --- | ------------------ | ------ | --------- | ----------------------------------------------- |
| 1   | The Sunken Fen     | 10     | 1 → 14    | the three opening locks, fought by hand         |
| 2   | The Drowned Ward   | 20     | 14 → 15   | teaching accuracy and penetration               |
| 3   | The Cinder Mire    | 30     | 15 → 30   | the fen giving way to the ash                   |
| 4   | The Ashfall Reach  | 40     | 30 → 50   | volume against the first real investment        |
| 5   | The Bound Marches  | 50     | 50 → 75   | routing: where damage is _allowed_ to go        |
| 6   | The Sundered Vault | 50     | 75 → 100  | pairs, and the celestial tax                    |
| 7   | The Waking Barrows | 50     | 100 → 125 | **how** the party's damage arrives              |
| 8   | The Sunless Weald  | 50     | 125 → 150 | **where** it lands                              |
| 9   | The Hollow Anvil   | 50     | 150 → 175 | whether anything the party does **stays done**  |
| 10  | The Bleeding Wild  | 50     | 175 → 200 | what the damage **does to what it is spent on** |
| 11  | The Standing Line  | 50     | 200 → 225 | what the party spends it on **first**           |
| 12  | The Rustwood       | 50     | 225 → 250 | how much of it **survives contact**             |

**A chapter wants one sentence its whole board list answers**, and from chapter 7 on each is a
different question about the party's own damage rather than a new mechanic. That is what makes a
chapter read as a place rather than as the last one at a higher level.

**Names follow the landscape, and a transition is better mid-chapter than at a boundary.** The
Cinder Mire straddles the fen-to-ash seam on purpose: the change happens where a player can feel it,
rather than at a boundary where it would read as a new game.

### The seam party

Every chapter adds one to `chapters.balance.ts`: the previous chapter's `INVESTED` renamed to a
party defined by the chapter it has just finished, with `INVESTED` re-pointed at the rung the new
chapter asks for. The chain runs `BUILT` → `ARRIVED` → `MARCHED` → `VAULTED` → `BARROWED` →
`WEALDED` → `ANVILLED` → `WILDED` → `INVESTED`.

⚠️ **Picking that rung is no longer "the next one up", and this is the trap the flattening left
here.** Under the margin rule each chapter out-climbed a fresh cap, so the rung advanced every
chapter and "move it up one" was correct. On the flat line **a new chapter often asks for the same
rung as the one below it** — chapters 4–5 share `elite`, 6–7 share `elite-plus`, and 8, 9 and 10 all
share `legendary`. Moving it up one anyway hands the party a ×1.6 the content never asked for, and
the sweep answers with walkovers three chapters deep rather than with a failure at the seam.

**Choose the rung that reproduces the power ratio the seam below it had**, which is
`pow(1.6, rung - rareIndex) * pow(perLevel.common, min(close, caps[rung]) - close)` — the party at
`min(chapter close, cap)` against content at the close. Compute it for every rung and take the
closest in **log** space; the caps ladder is coarse enough at this depth that the two candidates
either side of the answer can sit 20–40% out, and picking by eye picks the wrong one. This is how
the seven shipped seams were re-derived after the flattening.

⚠️ **The answer can be genuinely close, and chapter 11 is the worked example.** Chapter 10's seam
reads **6.5536**; against chapter 11's close of 225, `legendary` reads 3.898 (|Δln| **0.520**) and
`legendary-plus` reads 10.486 (|Δln| **0.470**). `legendary-plus` wins by five hundredths of a nat
after three chapters on one rung — so the log-space comparison is not a formality that confirms an
obvious answer, it is the thing that decides. **Compute both neighbours and print the margin**; a
near-tie is worth recording in the chapter header, because the sweep is what settles it and a later
retune of either side flips it.

**They accumulate rather than being re-pointed**, because re-aiming a single "arrived" party would
silently stop checking that the chapter below is still finishable by the party it was tuned for.
Two named parties per seam is what makes "clears the chapter behind it, walks only a little way
into the one ahead" checkable at both boundaries at once.

⚠️ **The level is derived, never typed**: `min(chapter's last stage level, LEVEL_CURVE.caps[rung])`.
A retyped level in this file survived six milestones once, passing by coincidence.

⚠️ **Nothing watches a chapter final once a later chapter ships.** "Still costs that party
something at the top" reads the last seam sweep, so every earlier chapter's final is unguarded the
moment it stops being the last one — which is how a four-body chapter-7 final would now pass
silently. A per-chapter version is the obvious shape and is **not** a mechanical addition: it needs
a measured pass over every final and would plausibly fail on the early ones for legitimate reasons.
Recorded rather than taken.

---

## Adding tower floors

### What a tower session owes

- 100 new floors in `src/data/tower-<faction>.ts`, ids continuing the scheme, mini-boss rhythm at
  every tenth floor and the boss at the roof.
- ~4 new blocks in `enemies.ts` for the tower's **lean** — the faction that counters the one it
  admits — with skills in `skills.ts` and re-exports in `index.ts`.
- The bias held: leader faction 35–65% of the board pool, ≥4 distinct counter blocks.
- `npm run test:unit`, then `npm run test:balance`.

⚠️ **A tower gets four blocks where a chapter gets ten, and the ratio is the point**: a chapter
authors five bands each asking a different question, where a tower asks one question a hundred more
times. A tower session deepens a faction exactly as a chapter session does, at four against ten.

⚠️ **Budget for the lean overshoot rather than discovering it.** Authored from the lean's own bench
a new hundred comes out at 66–86% against a 65% ceiling, every session, without exception — the
Human third hundred landed at 73.6%, taking the whole tower to 65.34%. Fix it **during** authoring
by substituting comparable-weight bodies through the filler slots — and ⚠️ **draw the substitutes
only from factions that also counter the tower's**, or the swap quietly turns the lean off on that
board.

⚠️ **Two ways of doing that substitution are not equivalent, and the obvious one is wrong.**
Replacing every occurrence of a handful of filler blocks hits whichever band leans hardest on
filler — which is the _opening_ band, since the late bands are mostly axis blocks. That reads as a
tower whose first twenty floors belong to a different faction. **Spread the swap across every band
instead**, converting one texture slot at a time in a fixed order and never touching an axis block
or an anchor.

⚠️ **If the swap has to take nearly every filler slot, the boards are too axis-dense.** The Human
third hundred first authored 192 Lancers across a hundred floors, which left the axis blocks alone
at 65.5% of the tower — so no arrangement of the remaining slots could reach the ceiling. Lower the
density and bring the lean's own bench back as texture; it fixes the share and the repetition at
once (37 distinct blocks over that hundred, against 13 before).

### Extending a tower's height

⚠️ **Solve for the top level at which the new slope meets the old one.** `floorLevel` draws one line
from floor 1, so raising `floors` re-draws it underneath content that already shipped — and solving
the slope is what makes the expected retune evaporate. It has worked twice: 100 → 200 floors at
`topLevel` 60 → 120 moved **10 of 700** shipped floors by one level, and 200 → 300 at 95 → **142**
moved **17 of 200**. The neighbours are much worse and the penalty is not smooth (141 moves 84, 143
moves 50), so solve rather than eyeball.

⚠️ **A round _slope_ is the trap.** Exactly 0.50 levels a floor wants a roof of 150 at 300 floors,
which moves 172 shipped floors by up to 5 levels **and** lands its lump exactly on the campaign's
stage-300 payout — the one bound a tower may never cross. Check the payout bound before the roof.

⚠️ **A height bump also needs a new rung in `TOWER_BAND_RUNGS`**, one per hundred floors, or
`towers.spec.ts` fails. See the crew table below for the margin that rung costs.

21e's roadmap prescribed 140 and a retune of all seven hundred shipped floors; it would have put 46
of those 700 under the 90% bar and taken six of seven roofs from 100% to 0%.

⚠️ **Check that the roof is a fight second; do not start from the roof.** A tower closes _above_ the
cap of the rung it asks for — the campaign's margin rule — and `topLevel` being a rarity cap is the
opposite of what makes a roof a fight. At `elite-plus` (three rungs, ×4.096) a level-140 five takes
**the heaviest board this game can author** at 100% with all five alive in nine seconds, and no
line-up fixes it.

⚠️ **If the height moves in one session and the floors move in seven, use a self-deleting
checklist.** `PENDING` was a literal list of names in both `towers.spec.ts` and
`towers.balance.ts`; each session deleted its own and the last deleted both lists along with the
branches they guarded. A filter — "either the full height or half of it" — would pass forever and
never notice a tower nobody went back for. A tower on that list is not damaged, but it loses its
**boss**: `floorKindAt` reads the rules' height, so its old top floor resolves as a mini-boss paying
×2 rather than ×5.

**It has now run to completion twice** — 21e–21k for the second hundred and 21l–21r for the third —
and both times the last session deleted the constant, the branches, and the prose describing them.
⚠️ **Leave the defensive shapes the list forced behind when you delete it**: `topFloors` reading the
**authored** height rather than `rules.floors`, and the roof-versus-band-opener comparison being
computed **per tower**. Both are no-ops while every tower is the full height and both are what stop
the sweep reading an undefined stage the day the next bump lands. The comments in
`towers.balance.ts` say so at each site.

### The two crews

`towers.balance.ts` fields one per band, both derived:

| Band | Floors  | Rung         | Level | Margin under its band's top floor |
| ---- | ------- | ------------ | ----- | --------------------------------- |
| 1    | 1–100   | `rare-plus`  | 48    | 0 — parity                        |
| 2    | 101–200 | `elite`      | 75    | 20 (`ROOF_MARGIN`)                |
| 3    | 201–300 | `elite-plus` | 99    | 43 (`ROOF_MARGIN` + 23)           |

⚠️ **Each further rung costs 23 more levels of margin**, because `ln(1.6) / ln(1.021)` is 22.6.
Reusing `ROOF_MARGIN` unchanged on a new band gives ×2.703 against band 2's ×1.689 — a walkover, and
one that is **invisible in the sweep output** because a walkover and a correctly tuned low band both
read 100% with five alive. The rungs are pinned in `data/towers.ts`; only the levels derive.

⚠️ **The rungs are pinned and only the levels derive, and that is a correction.** Band 1 used to take
its rung from `caps.indexOf(halfwayFloorLevel)` and band 2 from the highest cap below the roof —
which tied each crew's **rung** to its level. When the campaign flattened and `topLevel` came down
with it (120 → 95), that cost both crews a whole rung (×1.6) where the content only lost its levels,
and **all seven roofs measured 0%**. Pinning the rungs holds both bands at the ratios the shipped
fourteen hundred floors were tuned at — 1.739 at floor 93 and 1.689 at the two-hundred-floor roof.

No gear on either — a player crewing seven towers has one bag to equip thirty-five characters from.

⚠️ **A single upgraded crew would stop the sweep saying anything about the low bands**, on the
**two thousand and one hundred** floors this build ships. What ramps across a climb is **what a floor costs**, not
whether it is possible — a floor is climbed once and there is no way around one, so a floor the crew
cannot pass stops the tower outright.

### How it escalates is a per-tower answer

⚠️ **Fourteen hundreds gave fourteen answers, and no two towers escalate the same way. Read the
crew's failure mode before choosing; do not copy the last session's shape.** [towers](towers.md)
carries them all in full. What generalises is only the procedure:

1. **Measure before authoring.** Field both arrangements at the roof's level against a controlled
   board — one anchor plus four bodies all asking the same question — and vary only the mechanic.
   - ⚠️ **Calibrate the control's weight first, or the whole sweep reads as a flat line.** The
     Undead third hundred's first pass put the control at an anchor of 1300/84 behind bodies of
     780/74 and measured **2.00 survivors on nineteen shapes out of nineteen** — the same two members
     lived through everything and the other three died to everything, so the metric was saturated and
     said nothing. Dropping the control to 1100/74 and 700/62 moved it to 3.83 / 4.00 and the same
     nineteen shapes spread across 2.00 to 4.00. **Aim the control at ~4.00 of five** — the shipped
     ones read 4.13 / 4.05, 4.35 / 4.00 and 4.38 / 4.00 — so there is room to fall in and a little to
     rise into. Two or three throwaway sweeps buy this; it is the cheapest step here and skipping it
     invalidates every row below.
2. ⚠️ **Check both arrangements on every candidate board.** Which crew binds is not stable: two
   towers found the alternate binding, one found it flipping by mechanic, one found the reference
   much the stronger, and one found the two failing on **opposite axes** (weight breaks one, length
   breaks the other).
3. ⚠️ **A lock the crew cannot buy an answer to is licensed by _where it is put_, not by its size.**
   Evasion pools go on soft bodies, so reach and focus fire are the answer. And a lock being
   unanswerable is not the same as it being this tower's — **two towers with one lock is one tower
   shipped twice.**
4. ⚠️ **Check a stat's shipped register before building a band on it.** A magic ward reads well on
   paper and the highest `magicResist` on any shipped block is 0.14; at 0.15 the wall is worth
   nothing, and it only bites at four times anything authored. ⚠️ **The check can also come back
   positive, and that is the answer rather than a formality**: the Elf Tower's third hundred is built
   on `critChance`, whose shipped ceiling is 0.18, and four bodies **at** that ceiling take the weaker
   arrangement from 93% to 80%. The difference between the two cases is whether the crew has any of
   the answering stat — every Elf in both arrangements carries **zero** `critDamageResist` and zero
   `critBlock`.
   - ⚠️ **There is a third answer, and the Monster third hundred is it: the stat works, but only
     _above_ the register.** `physicalResist` ships at a ceiling of 0.23 that is a lone outlier — the
     next four blocks are 0.14, 0.12, 0.12, 0.12 — and the wall costs the reference five nothing
     until 0.45. It was taken anyway, on the measurement rather than on precedent: at the shipped
     0.23 it is already worth 0.35 of the binding arrangement and a quarter again on fight length,
     where the rejected magic ward was worth **0.00** at its own register. **A band that steps past
     the register does so in the header, in writing, with the figure at the register stated** — the
     Elf hundred built at its ceiling and stepped past only on the roof, and a later session must be
     able to see which of the two shapes it is looking at.
   - ⚠️ **The sharpest version of "is it ours" is a stat the crew answered with the _wrong_ stat.**
     Monsters carry the game's only real `physicalPierce` (mean 0.145 against ≤0.040 everywhere
     else), and pierce multiplies `def` while resist is applied afterwards untouched by it. The
     Elves are 100% physical too and lose **0.00** to the same wall. **Read the damage formula, not
     just the stat lines** — which stat answers which is not always what the names suggest.
5. ⚠️ **Check which floors the stride samples.** `towers.balance.ts` reads every fourth floor plus
   the roof, so heavy boards on odd floors are invisible to the spine. Same trap as a chapter's
   band openers.
6. ⚠️ **Do not try to make the bottom of a band 2 hard**, but measure how much room there is on the
   tower's own crew before deciding how little the opening bands may carry — the same measurement
   reads three tenths of a second of span against one crew and threefold against another.
7. ⚠️ **Field the _previous_ hundred's roof board at the new roof's level before authoring anything.**
   A heavy block climbs at `perLevel.ascended` 1.024 or `perLevel.legendary` 1.0225 while a
   mono-faction five is mostly `common` at 1.021, so across a hundred floors the anchors gain about
   ×1.15 on the crew. The Dwarf Tower's floor-200 board reads 100% with all five alive at its own
   level and **28% with 0.47 survivors** at the third hundred's roof; the Elf Tower's reads **35% with
   0.70** — so both hundreds' anchors had to get _lighter_ than the ones they succeeded, and the
   escalation came out of the board's other four slots instead. **This is not a Dwarf fact**; check it
   on every third hundred, because a band sized by eye against the hundred below will be unwinnable at
   the top and nothing says so until the sweep does.
   - ⚠️ **"Lighter" does not mean "absent", and that is the opposite error waiting on the other
     side.** The Elf third hundred first authored its closing bands as five legendaries with no anchor
     at all and measured **flat** — 4.00 reference survivors across twenty-five floors with the
     alternate at 4.38 to 4.88, _easier_ than the boards below. Restoring a mid-weight anchor was
     worth a full survivor. A band needs an anchor; it needs a **smaller** one.
   - ⚠️ **The check can also come back clean, and that is a result rather than a licence to skip
     it.** The Monster third hundred is the first where no anchor had to retire: all twelve
     `ascended` blocks its second hundred fields above floor 160 read 100% for both crews at the new
     roof's level behind light support, `THE_HORNCALLER` at 1560/91 included. What had collapsed was
     the floor-200 board's **support**, so the escalation came out of the four soft slots and the
     anchors stayed. ⚠️ **Which crew collapses is not stable either** — three towers found the
     reference five falling through the floor at the new roof and this one found the reference at
     100% / 3.45 with the **alternate** at 8%.
   - ⚠️ **Check the previous hundred's _anchors_ against the new roof, not only its roof board.** The
     Elf Tower's own `THE_GRUDGEKEEPER` (1520/89) is heavier than the roof that succeeds it
     (1300/84), so boards carrying it above level 140 measured harder than the roof — 2.85 reference
     survivors against the roof's 3.42. A closing band may have to retire a block the tower has fielded
     since its first hundred. **The Undead third hundred retired two**: at level 142 on a light board
     `THE_WITHERED_CROWN` reads 30% / 13% and `THE_SUNBOUGH` 13% / 10% against a roof of 100% / 93%,
     so their last floors are 265 and 284 and nothing but the new roof anchors the last fifteen.
8. ⚠️ **A stat can be the axis where every mechanic is inert, and the negative list is the
   deliverable.** The Undead third hundred measured nineteen shapes and found the whole status
   vocabulary worth 0.10 to 0.63 survivors, aim and scope worth _less than nothing_, and question
   count flat — while plain enemy **durability** graded 3.85 → 1.30 across four bodies at hp 700 to
   2400 with **zero timeouts**. ⚠️ **The timeout count is what tells that apart from the clock**: a
   grade that costs survivors while every fight still ends in a death is difficulty; one that starts
   timing out is the ninety seconds with a stat block attached. Check it explicitly rather than
   inferring it from the win rate, because a wipe and a timeout are the same `defeat`.
   - ⚠️ **A board-wide ward is the shipped shield rule in both directions, measured.** One back-rank
     body warding `ally-all` is worth a real 0.75 of a survivor mid-band, and the **same body on the
     roof** takes it from 100% / 93% to **75% / 55%** at 45s mean and 56s worst — a clock, not a
     lock. A _self_-shield is worth 0.00: it prices against the wearer's own `atk` on a body that is
     already dying.
9. ⚠️ **`attackSpeed` is not the free novelty it looks like.** It is the one `StatBlockData` field no
   shipped block uses, which makes it tempting when a tower's axis is tempo and the tower above has
   already spent `haste`. Measured: `atk` 72 with `attackSpeed` 45 reads 3.77 / 2.63 against `haste`
   143's 3.48 / 2.35 — the same number — and `effectiveSpeed` sums the two before applying the slow
   multiplier, so it is not even proof against a `slow`. **Do not spend a session re-measuring it.**

Two rules that bind everywhere:

- ⚠️ **No healer on a roof.** Against a party that cannot burst, sustain on the last floor is the
  ninety-second clock rather than a lock. A **shield** is the safe form of the same idea: a pool
  banked once depletes where a heal refills. Measured across shipped content, taunt-plus-`lifeLeech`
  appears on 36 tower boards and 21 campaign stages while taunt-plus-**healer** appears on zero.
- ⚠️ **Difficulty is the front rank's weight and it is sharply non-linear.** Size the top band
  against **this tower's own crew**, never to a shared weight.

---

## The prose check

⚠️ **When a chapter or a rules file makes an absolute claim about its own content, check it with a
script before shipping — not by reading.** Three sessions in four found a shipped absolute claim
that was wrong about the boards underneath it, and one found a `TOWER_RULES` doc block still
prescribing a retune that had been measured and rejected a session earlier.

⚠️ **Check the claims the file _already_ makes, not only the ones you are about to add.** The Dwarf
Tower's third hundred found `tower-dwarf.ts` claiming "no board above floor 180 carries sustain of
any kind" while three boards above it did — the Oathshield Vanguard's `recovery` on floors 186 and
194 and the Sepulchre Hound's `lifeLeech` on 188. **The honest fix was the claim, not the boards**:
what the tower actually forbids up there is a heal, a drain or a regeneration, and restating it that
way keeps every measured figure valid where retuning three shipped floors would not.

⚠️ **A claim phrased as a threshold has its range grow underneath it, so re-run the check on the
claims you write _this_ session too.** The Monster third hundred found `tower-monster.ts` claiming
"above floor 160 nothing on any board restores anything" while 29 of those 40 boards carried
`recovery` — the same incident as the Dwarf one, same fix — and then **made the mistake a second time
in the correction**: the replacement counts were measured over floors 161–200 and attached to the
phrase "above floor 160", which the new hundred had just extended to 161–300, where the same counts
read 21, 23, 26 and 72. **State the range you measured, not the threshold you mean**, and run the
check again after the floors land.

⚠️ **The fourth instance was about _aim_, not sustain, which is what proves this is not a fact about
the word "regeneration".** The Demon third hundred's check found the Angel Tower's roof shipped
"**It restores nothing and names nothing but the front rank**" while carrying `CINDER_STORM` at
`enemy-all` and `RUINOUS_STOOP` at `enemy-row-back` — **both named in the very next sentence of the
same doc comment**, which is how a session writes a contradiction without seeing it. A _scope_
(`enemy-all`), a _reach_ (`enemy-row-back`, `enemy-back`) and a _selection_ (`enemy-lowest`,
`enemy-highest`) are three different things and none of them is "the front rank". The fix was the
claim in both places, and the Demon roof's own version was rewritten the same way before it shipped.

Run it **at the start of a session, not the end.** Each claim is a two-line predicate over the
content; running them takes seconds and reading fifty boards carefully does not work. Things worth
recomputing every time:

- every count the session will quote — archetypes per faction, crystal figures, distinct blocks,
  faction shares;
- the band-level headers, the floor or stage ids, and the mini-boss rhythm;
- every absolute claim the header makes ("no celestial appears here", "nothing above floor 160
  restores anything", "no board pairs a taunt with a healer", "no board carries two anchors");
- ⚠️ **the stat keys themselves.** A mistyped optional stat is **silent in both directions** —
  `data/` asserts conformance by assigning to a typed local, and an already-`as const` object is not
  a fresh literal, so TypeScript's excess-property check never runs on it. Three dead keys shipped
  this way and no test noticed. One script over `StatBlockData`'s keys is the whole audit.

⚠️ **Delete a dead key rather than correcting it.** Deleting is the zero-behaviour-change fix and
keeps every figure the authoring session recorded valid; correcting one hands a block stats it was
never measured with.

⚠️ **The check caught two wrong claims in chapter 12's own header before it shipped, which is what
it is for.** The header said **6** boards carry `recovery` and the script said **10** — the fourth
session running to miscount its own sustain — and it described the lean as "about eighty percent"
where the measurement was **92%**. Both were fixed to the measured figure rather than the boards
being changed to fit the prose. **Run it at the start and again after the boards land**; the first
run cannot see counts that do not exist yet.

---

## What fires next

The guards that are known to be approaching, with the answer each one wants. See
[testing](testing.md) for how to tell "content outgrew a threshold" from "this ratio moves every
chapter regardless" — **sort every failure into those two before touching anything.**

**Every reading below was re-measured after chapter 11 landed**, and two of the horizons moved a long
way — one of them because its previous entry was still describing the pre-flattening income curve.
Measure, do not copy this table forward.

| Fires at     | Guard                                               | Reads now  | The answer                                                                           |
| ------------ | --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| chapter 13   | `gear.spec.ts` — top grade's share of drops         | 18.7%      | `gradeSoftness` → 275. It is always `stages / 2`; what it wants is a saturating tilt |
| chapter 14   | `banners.spec.ts` — roster-relative crystal ceiling | —          | Whether the roster kept up, not what number makes it green                           |
| chapter 16   | `levels.spec.ts` — "charges real time"              | —          | Income is the question again. No retired guard left                                  |
| chapter 30   | `levels.spec.ts` — rungs unspent above the ladder   | 250 < 700  | Was chapter 12 before the flattening. **How long is the campaign meant to be**       |
| ~chapter 42  | The level curve is consumed entirely                | 250 / 1000 | A roadmap decision, not a threshold. Was ~chapter 15                                 |
| ~chapter 180 | `gear.spec.ts` — "roughly doubles what gold is for" | —          | Gear costs that scale with content, a milestone-sized retune of `data/gear.ts`       |

⚠️ **`gradeSoftness` fired at chapter 12 exactly as predicted and read 21.3% at five hundred stages;
`stages / 2` = 250 restored 18.7% for the seventh time.** That is now seven landings on one figure
with one solution, and it remains the strongest evidence in the project that the _shape_ is wrong
rather than the number.

⚠️ **The tower:campaign crystal ratio was listed here at chapter 12 and it did not fire, because the
guard no longer exists** — `towers.spec.ts` retired it, and this table went on projecting a horizon
for it anyway. That is the same method failure the gear kit-hours correction records, in a smaller
form: **a horizon is a claim about a guard as well as about a curve, and a retired guard has no
horizon.** Check the guard is still there before carrying its row forward.

⚠️ **One guard fired that this table never listed: `descent.balance.ts`'s per-depth walkover bar.**
It is not in the campaign's own suite, and it fires because the Descent's deepest sample is
`stages.length` — so the top depth moves every time a chapter ships. See the note below.

⚠️ **The gear kit-hours guard was listed at chapter 12 and it is actually ~180**, which is the
largest correction this table has ever carried and worth reading as a method failure rather than an
arithmetic one. The quantity is `kit gold / (base × stages ** exponent)`, and the **exponent came
down from 1.45 to 1.00 with the level line** — so income now grows _linearly_ in the stage count
where it used to grow superlinearly, and a quantity that was collapsing fast is now decaying as
`1 / stages`. From 19.85 hours it needs the ladder to reach about 8,900 stages to touch the floor of

1. Nothing about the guard changed; the curve underneath it did, and the entry was never re-measured.
   **Re-measure a horizon rather than carrying it forward** — a projected chapter number is a claim
   about a curve, and the curves in this project move.

### ⚠️ The Descent's per-depth walkover bar, and why a chapter can trip it without being wrong

`descent.balance.ts` samples five campaign depths and the deepest is `stages.length`, so **the top
sample moves every time a chapter ships**. The mode's party at each depth is _bisected_ — the minimum
level at which a three-faction five clears the campaign stage there — and its rung comes from
`rarityFor(level)`, the cheapest rung whose cap admits that level.

That makes party power a **step function of level**, jumping ×1.6 at each cap. Chapter 12 put the
top depth's anchor at level 250, where the bisection lands at **201** — one level above `legendary`'s
cap of **200** — so the calibrated party crosses a rung and arrives up to ×1.6 stronger than "just
clears" means. It then walks the Descent: 5.00 survivors of five, against a bar of 4.85.

**Measured, so the next session does not re-derive it:**

| campaign stage the depth anchors on | its level | bisected party level | rung  |
| ----------------------------------- | --------- | -------------------- | ----- |
| `c7-s50`                            | 125       | 101                  | 5     |
| `c9-s50`                            | 175       | 132–134              | 5     |
| `c10-s50`                           | 200       | 141                  | 6     |
| `c11-s50`                           | 225       | 168–170              | 6     |
| `c11-s50` refielded at 250          | 250       | 192–193              | **6** |
| `c12-s50`                           | 250       | **201**              | **7** |

⚠️ **The rung crossing is a red herring, and chasing it is how this was nearly mis-fixed.** Deriving
the party's rung from the **anchor** instead of from the bisected level looks like the obvious repair.
Measured, it weakens the party by ×0.70 at three of the five depths, breaks two guards that were
passing, and still leaves the deep end at **4.90**. The overshoot is real and it is not what the guard
was reporting.

⚠️ **Softening the chapter final does not fix it either.** A boss cut by 30%, every escort swap and
dropping both of that chapter's suppressions all still read 201, because a level-200 rung-6 party
cannot take any board of that weight and a level-201 rung-7 party takes all of them.

**What the guard was actually reporting is that the Descent got easier the deeper it went** —
monotonically, by construction, and with depth 250 already one hundredth under the bar before chapter
12 existed. A monotonic quantity cannot be bounded by a constant, so a third widening would have been
the guard measuring a drift rather than the mode.

**The cause is that the level offset was flat while the party a depth implies is not a fixed distance
from the anchor.** The calibration anchors on a chapter _final_, whose `legendary` and `ascended`
blocks climb at 1.0225 and 1.024 against a mostly-`common` five's 1.021, and the ascension ladder hands
the party a ×1.6 at every cap — both compounding over the whole level range while the offset did not
move at all. `DescentLevelData.anchorSlope` is the fix: **0.11 levels per level of anchor**, with the
two fixed offsets brought down by 3 so the shallow end is untouched.

| survivors of five | anchor 30 | 50   | 75   | 125  | 250      |
| ----------------- | --------- | ---- | ---- | ---- | -------- |
| flat offset       | 3.20      | 4.15 | 4.15 | 4.80 | **5.00** |
| with the slope    | 3.20      | 4.10 | 3.70 | 4.05 | **4.15** |

**The bar stayed at 4.85, no board moved, and the chapter was not touched.**

⚠️ **A flat offset could not have been retuned into this**, which is the general lesson: +24 levels
brings the deep end to 4.15 and takes the shallowest from a 0.50 finish rate to **0.00**. When a dial
has no setting that works at both ends of the range it is measured over, the dial is the wrong shape —
the same finding `gradeSoftness` has been producing once a chapter for seven chapters.

⚠️ **`gradeSoftness` is the one to re-derive by hand, once a chapter, deliberately.** It has landed
on 18.7% six times and the solution has been `stages / 2` every time, which is what turned a tuning
number into a finding. Writing it several chapters ahead to save edits was tried and declined, and
the decline was right: the landing that made the pattern visible would have been silent.

⚠️ **The opposite call is right for a quantity that is _meant_ to fall.** The tower ratio's floor was
lowered once in a single edit covering three chapters whose landings were all known in advance,
because re-deriving a number three times measures nothing. **The distinction is whether the quantity
is supposed to move.**

⚠️ **Three guards have been retired rather than slid**, and that is a real option: the absolute
hours-to-the-ceiling, the ratio that replaced it, and the top stage under `maxLevel / 2`. When the
honest restatement of a guard is something you would refuse to author, the guard is pointed at the
wrong quantity.

---

## What a content session may not do

- **No new `EffectKind`, no new `TargetKind`, and nothing requiring a change in `ui/`.** Milestone
  17 needed no UI change at all because `tick-damage` already said everything three of its four
  statuses produced. That is the bar.
- ⚠️ **The status vocabulary is closed and does not renew.** Milestone 21 licensed three across four
  chapters, spent them, and closed. A later chapter wanting one argues from nothing exactly as 17
  did — "21 had a budget" is not an argument. **Reach for the stat block before the vocabulary**:
  two chapters running found their headline lock was a stat (`dodge`, then `tenacity`), neither of
  which can be a status without a `core/` change.
- ⚠️ **The defensive mirror of a permanent wound-response — a body that armours itself as it is hurt
  — is the one shape nobody may author.** It is the ninety-second clock with a narrative attached.
- **If a chapter or a tower appears to need a new currency, gear grade, screen or `core/` change,
  that is a finding to write down, not scope to take.**
