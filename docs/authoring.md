# Authoring content

The procedure for adding a chapter or a hundred tower floors, distilled from the sessions that
shipped four hundred stages and fourteen hundred floors. `AGENTS.md` states the rules and the
reference docs explain the systems; **this file is the order to do things in and the traps that
have actually fired.** Every trap below is one a session hit after a previous session had already
written it down.

Read [testing](testing.md) alongside this — the balance sweep is the only thing that reads the
boards, and a content session is mostly a conversation with it.

## What is shipped, and how to find out

| Unit             | Count                                       |
| ---------------- | ------------------------------------------- |
| Campaign         | 10 chapters, 400 stages, enemy levels 1–200 |
| Towers           | 7 × 200 floors, enemy levels 1–95           |
| Enemy archetypes | 130                                         |
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
stat blocks carry no gear, and that is the axis meant to supply it.

**Three guards were widened to record the trade rather than hide it**, each naming the condition
that restores it: `MOMENTUM_CEILING` (0.20 → 0.30), the survivors half of "still costs that party
something at the top" (retired), and the longest-cleared-fight bar (0.75 → 0.80 of the timer). ⚠️
**All three belong back where they were when enemy gear lands, and the honest test of that work is
whether they can be moved back** — not whether the sweep is green. Do not widen any of them a second
time.

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
_party's_ power, so it grows with the margin rule rather than with the stage count. It has gone
4,000 → 50,000 → 500,000 → **5,000,000**, and the two halves move on different schedules: a factor
of ten on the range costs almost nothing in resolution (0.030% → 0.028%) while one extra step nearly
halves it (→ 0.014%). Not widening presents as a difficulty curve flattening into a horizontal line
at the ceiling.

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

- **Deepen a thin faction rather than a deep one.** The seven now run human 14, angel 16, demon 17,
  monster 19, undead 21, elf 21, dwarf 22. Recompute before choosing.
- ⚠️ **Check what the remaining sessions already cover.** Milestone 21 fixed its four leans up front
  and still nearly closed with Human as a standout thin faction at 13 against Dwarf's 22, because
  three later sessions each leaned elsewhere.
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

A hundred and thirty archetypes ship, and the distribution is deliberately uneven — a chapter or
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

The shipped ten, with the level range each closes over:

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

**A chapter wants one sentence its whole board list answers**, and from chapter 7 on each is a
different question about the party's own damage rather than a new mechanic. That is what makes a
chapter read as a place rather than as the last one at a higher level.

**Names follow the landscape, and a transition is better mid-chapter than at a boundary.** The
Cinder Mire straddles the fen-to-ash seam on purpose: the change happens where a player can feel it,
rather than at a boundary where it would read as a new game.

### The seam party

Every chapter adds one to `chapters.balance.ts`: the previous chapter's `INVESTED` renamed to a
party defined by the chapter it has just finished, with `INVESTED` moved up to the rung the new
chapter asks for. The chain runs `BUILT` → `ARRIVED` → `MARCHED` → `VAULTED` → `BARROWED` →
`WEALDED` → `ANVILLED` → `INVESTED`.

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
a second hundred comes out at 66–86% against a 65% ceiling, every session, without exception. Fix
it **during** authoring by substituting comparable-weight bodies through the filler slots — and
⚠️ **draw the substitutes only from factions that also counter the tower's**, or the swap quietly
turns the lean off on that board.

### Extending a tower's height

⚠️ **Reach first for the top level at which the new slope meets the old one.** Doubling to 200
floors and doubling `topLevel` to 120 gives 119/199 = 0.5980 against the shipped 59/99 = 0.5960 —
**ten of the seven hundred shipped floors move, each by one level**, and the retune evaporates. The
prescribed 140 would have put 46 of those 700 floors under the 90% bar and taken six of seven roofs
from 100% to 0%.

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

### The two crews

`towers.balance.ts` fields one per band, both derived:

| Band | Floors  | Rung        | Level                    |
| ---- | ------- | ----------- | ------------------------ |
| 1    | 1–100   | `rare-plus` | `min(halfway floor, 60)` |
| 2    | 101–200 | `elite`     | `min(roof − 20, 100)`    |

⚠️ **The rungs are pinned and only the levels derive, and that is a correction.** Band 1 used to take
its rung from `caps.indexOf(halfwayFloorLevel)` and band 2 from the highest cap below the roof —
which tied each crew's **rung** to its level. When the campaign flattened and `topLevel` came down
with it (120 → 95), that cost both crews a whole rung (×1.6) where the content only lost its levels,
and **all seven roofs measured 0%**. Pinning the rungs holds both bands at the ratios the shipped
seven hundred floors were tuned at — 1.739 at floor 93 and 1.689 at the roof, to three decimals.

No gear on either — a player crewing seven towers has one bag to equip thirty-five characters from.

⚠️ **A single upgraded crew would stop the sweep saying anything about the low band**, on seven
hundred floors that are already shipped. What ramps across a climb is **what a floor costs**, not
whether it is possible — a floor is climbed once and there is no way around one, so a floor the crew
cannot pass stops the tower outright.

### How it escalates is a per-tower answer

⚠️ **Seven towers gave seven answers. Read the crew's failure mode before choosing; do not copy the
last session's shape.** `AGENTS.md` carries all seven in full. What generalises is only the
procedure:

1. **Measure before authoring.** Field both arrangements at the roof's level against a controlled
   board — one anchor plus four bodies all asking the same question — and vary only the mechanic.
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
   nothing, and it only bites at four times anything authored.
5. ⚠️ **Check which floors the stride samples.** `towers.balance.ts` reads every fourth floor plus
   the roof, so heavy boards on odd floors are invisible to the spine. Same trap as a chapter's
   band openers.
6. ⚠️ **Do not try to make the bottom of a band 2 hard**, but measure how much room there is on the
   tower's own crew before deciding how little the opening bands may carry — the same measurement
   reads three tenths of a second of span against one crew and threefold against another.

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

---

## What fires next

The guards that are known to be approaching, with the answer each one wants. See
[testing](testing.md) for how to tell "content outgrew a threshold" from "this ratio moves every
chapter regardless" — **sort every failure into those two before touching anything.**

Recomputed after the level line flattened to 0.50 a stage. **Every horizon moved out**, because the
campaign now asks for 25 levels a chapter instead of ~90:

| Fires at    | Guard                                               | Reads now  | The answer                                                                                |
| ----------- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| chapter 11  | `gear.spec.ts` — top grade's share of drops         | 18.7%      | `gradeSoftness` → 225. It is always `stages / 2`; what it wants is a saturating tilt      |
| chapter 12  | `towers.spec.ts` — tower:campaign crystal ratio     | 1.466      | A third hundred, an eighth ladder, or accepting the campaign outgrew its optional content |
| chapter 12  | `gear.spec.ts` — "roughly doubles what gold is for" | floor 1    | Gear costs that scale with content, a milestone-sized retune of `data/gear.ts`            |
| chapter 13+ | `banners.spec.ts` — roster-relative crystal ceiling | ~41 days   | Whether the roster kept up, not what number makes it green                                |
| chapter 16  | `levels.spec.ts` — "charges real time"              | 7.5h / 24h | Income is the question again — 21.0h at chapter 15, 26.2h at 16. No retired guard left    |
| chapter 30  | `levels.spec.ts` — rungs unspent above the ladder   | 200 < 700  | Was chapter 12 before the flattening. **How long is the campaign meant to be**            |
| ~chapter 42 | The level curve is consumed entirely                | 200 / 1000 | A roadmap decision, not a threshold. Was ~chapter 15                                      |

⚠️ **The gear guard is now the first to fire and it is the only one still on its old schedule**,
because it is a function of the **stage count** rather than the level line — `gradeSoftness` is
always `stages / 2`, and the flattening did not change how many stages a chapter has. Sort by what a
guard actually reads, not by where it used to sit in this table.

⚠️ **`gradeSoftness` is the one to re-derive by hand, once a chapter, deliberately.** It has landed
on 18.7% five times and the solution has been `stages / 2` every time, which is what turned a tuning
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
