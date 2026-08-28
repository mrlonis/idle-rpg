# Authoring content

The procedure for adding a chapter or a hundred tower floors, distilled from the sessions that
shipped fourteen hundred and fifty stages and thirty-five hundred floors. `AGENTS.md` states the rules and the
reference docs explain the systems; **this file is the order to do things in and the traps that
have actually fired.** Every trap below is one a session hit after a previous session had already
written it down.

Read [testing](testing.md) alongside this — the balance sweep is the only thing that reads the
boards, and a content session is mostly a conversation with it.

## What is shipped, and how to find out

| Unit             | Count                                        |
| ---------------- | -------------------------------------------- |
| Campaign         | 29 chapters, 1450 stages, enemy levels 1–725 |
| Towers           | 7 × 500 floors, enemy levels 1–236           |
| Enemy archetypes | 418                                          |
| Characters       | 56, with 14 signature items                  |
| The Descent      | 24 boards, 14 card families                  |
| Expeditions      | 3 maps                                       |

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

⚠️ **The slope is the rule and the span is a consequence, which chapter 20 is the first to
demonstrate.** The Commonage is sixty stages, so at the same half a level a stage it spans **thirty**
levels — `open + round(30 * (i - 1) / 59)`. **A longer chapter is a longer climb against a party
whose cap does not move**, and that is most of what the extra ten stages cost; see the chapter-20
section below before assuming ten more boards is ten more boards.

| Chapter | Opens | Closes | Span   |
| ------- | ----- | ------ | ------ |
| 4       | 30    | 50     | 20     |
| 5       | 50    | 75     | 25     |
| 6       | 75    | 100    | 25     |
| 7       | 100   | 125    | 25     |
| 8       | 125   | 150    | 25     |
| 9       | 150   | 175    | 25     |
| 10      | 175   | 200    | 25     |
| 11      | 200   | 225    | 25     |
| 12      | 225   | 250    | 25     |
| 13      | 250   | 275    | 25     |
| 14      | 275   | 300    | 25     |
| 15      | 300   | 325    | 25     |
| 16      | 325   | 350    | 25     |
| 17      | 350   | 375    | 25     |
| 18      | 375   | 400    | 25     |
| 19      | 400   | 425    | 25     |
| 20      | 425   | 455    | **30** |
| 21      | 455   | 485    | 30     |
| 22      | 485   | 515    | 30     |
| 23      | 515   | 545    | 30     |
| 24      | 545   | 575    | 30     |
| 25      | 575   | 605    | 30     |
| 26      | 605   | 635    | 30     |
| 27      | 635   | 665    | 30     |
| 28      | 665   | 695    | 30     |
| 29      | 695   | 725    | 30     |

⚠️ **Chapter 13 is the first to close _above_ its rung's cap since the margin rule was retired, and
it is not that rule coming back.** `legendary-plus` caps at 260 against The Quarry's close of 275, so
its seam party stands fifteen levels under the last board. That falls out of a flat line climbing
into the top of a cap, not out of a chapter sized to out-climb one — and it is what makes chapter
13's seam ratio 7.6774 rather than the 10.4858 chapters 11 and 12 shared. **Expect it from here on**:
every further chapter on this rung closes further above the cap.

### ⚠️ Chapter 14 is where that stopped being a footnote: the cap is now the difficulty gradient

The Shutgate closes at **300** against the same cap of 260, so its seam party stands **forty levels**
under the last board — ×2.29 at `perLevel.common`. The three most recent seam ratios read **10.4858,
7.6774, 4.5665**: ×0.732 and then ×0.595, compounding, from a ceiling that does not move.

⚠️ **This is the gradient milestone 24 traded away, arriving from somewhere nobody planned it, and it
brought one of the three widened guards back.** `chapters.balance.ts`'s "still costs that party
something at the top" is restored to `meanSurvivors < PARTY_SIZE`: the invested party takes The
Shutgate's final at **4.00 of five**, with zero timeouts. **Gear is not what restored it**, and the
other two are still out — the momentum ceiling cannot bind for a reason of its own shape, and the
longest-cleared-fight bar moves the wrong way as content lengthens fights. **One coming back does not
license moving either of the others.**

⚠️ **Two consequences a chapter-15 session meets immediately.** The seam chain has gone **degenerate**
— chapters 13 and 14 both clamp to 260, so `QUARRIED` and `INVESTED` are literally the same
combatants and the two assertions either side of the seam are one claim. And **the anchors have to
get lighter**; see the next section.

### ⚠️ Chapter 15 priced that gradient, and the four things it found are what the next chapter needs

The Underroad closes at **325** against the same cap of 260 — **sixty-five levels**, ×3.80 — and its
seam reads **2.7160**. The four most recent are **10.4858 → 7.6774 → 4.5665 → 2.7160**.

1. ⚠️ **The rate is arithmetic, not tuning.** Once a chapter closes entirely above its rung's cap the
   seam is divided by `perLevel.common ** 25` = **1.680** per chapter, by construction. Do not
   re-derive it; it will keep doing this until the rung moves.
2. ⚠️ **`mythic` is not the repair, and it was measured rather than reasoned about.** A degenerate
   chain makes "move the party up a rung" look obvious, and at chapter 15 `mythic`'s cap of 340 would
   for the first time put the party _level_ with the close. Measured, a `mythic` five at 325 takes
   chapter 14's final **unchanged** at 100% with all five alive in 3.9s and needs the board scaled
   **×2.4** — an anchor near **3,550 health** against the Unmade's ceiling of 1800, which
   `enemies.spec.ts` enforces. **The rung the log-space rule prefers is also the only one the enemy
   roster can legally be authored for.** Reaching for `mythic` is reaching for a `data/` rule change.
3. ⚠️ **The whole board halves, not just the anchor.** Chapter 14 recorded that what moves a tuned
   party is the anchor slot; that is a fact about _which slot the response lives in_, not a licence to
   prop a light anchor up with heavy support. With The Doorstone **deleted outright** the four
   remaining chapter-14 bodies at level 325 read **35% with 0.68 survivors**, three of them alone read
   0%, and scaling only the anchor to a tenth reads 0%. Only a uniform halving reads 4.00.
4. ⚠️ **Author against _common-equivalent_ weight, never raw health, and this gets worse every
   chapter.** An `ascended` block is worth **×2.587** of a `common` one at level 325 and **×1.608** of
   a `legendary` one, because `perLevel` is 1.024 / 1.0225 / 1.021 compounded over the whole level.
   Measured, `c15-s49` at 2,980 raw health reads 4.00 survivors while a 3,100 draft of the final read
   **0%** — a 4% difference in raw weight and the whole outcome, because in common-equivalent terms
   they were 4,283 and 5,581. The premium was ×1.550 at chapter 14's close and ×1.608 at chapter 15's.

⚠️ **And one method note that cost a session's worth of measurement.** The final first read **0% at
every anchor weight from 880/54 down to 520/34**, which looks like an inert anchor and is not: the
cause was a `RALLY`-on-`ally-all` body on the same board, worth more than the anchor's whole stat line
at that budget. Taking it off took the same board to 100%. **Check the control can move before
concluding anything from an anchor sweep** — the same discipline the Demon Tower's `critBlock` band
recorded, arriving from the opposite direction.

### ⚠️ Chapter 16 is where the budget fell through the floor of the enemy pool

The Spoilfield closes at **350** against the same cap of 260 — **ninety levels**, ×6.49 — and its seam
reads **1.6154**. The five most recent are **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154**, and the
last three factors are all exactly 0.595. The rate is now measured three times rather than predicted.

1. ⚠️ **The board budget is past what the shipped pool can supply, and this is the finding chapter 16
   exists to record.** Refielding chapter 15's final against chapter 16's party and gear: at level 325
   / Relic 59 it reads 100% / 3.58, at 330 / Relic 67 **0%**, and at 350 / Relic 100 it must be scaled
   to **×0.4** before it reads four survivors again. A board here totals **2,715 common-equivalent at
   s1 falling to 1,541 at s50**. Of the **211** blocks that existed before The Spoilfield, **48** sat
   at or under 560 health and exactly **one** under 250 — so its twenty-four returning blocks are very
   nearly the whole light tail of the game, and its four new commons (175, 200, 205, 220) are the
   lightest bodies the project has ever shipped outside the Wisp. ⚠️ **A seventeenth chapter on this
   rung cannot be authored out of the pool at all.**
2. ⚠️ **The gear ladder is exhausted.** Chapter 16 runs Relic 59 → 100, and Relic 100 is the top of the
   whole ladder. **Chapter 17 is the first chapter in five that cannot step this axis at all**, and a
   sixth grade is a `data/` rule change rather than a chapter. The ramp inside chapter 16 measured
   **0.08 of a survivor and a quarter more fight** end to end, which is the fourth consecutive chapter
   to measure gear as fight length rather than difficulty.
3. ⚠️ **A mechanic's worth is a function of where the board stands on the plateau, not of the
   mechanic**, and this is the sharpest measurement of that anywhere in the project. Against a
   calibrated control at level 350 / Relic 100, `THORNMAIL` across a whole board is worth **0.00**
   survivors at 900 total health, **0.20** at 1,060 and **1.33** at 1,160. **State the weight with the
   figure or the figure means nothing.** ⚠️ **And the first control built was saturated** — reading
   exactly 4.00 at every weight from 900 to 1,180, which made the entire vocabulary look inert. Aim the
   control into the band where it _moves_, then vary the mechanic.
4. ⚠️ **A debuff caster the party cannot reach is the sustain-behind-a-taunt failure wearing a
   different stat.** A `WEAKEN`-on-`enemy-all` body measured **4.00 survivors in the front rank and
   0.10 in the back**, at the same weight, because the party cannot aim past it and the status never
   lapses in practice. Chapter 16 puts its clerk in the front rank on every board as a rule.
5. ⚠️ **Raw health is now badly misleading and gets worse every chapter.** At level 350 an `ascended`
   block is worth **×2.784** of a `common` one and **×1.668** of a `legendary` one, up from ×2.587 and
   ×1.608 at chapter 15's close. The Inheritor's 250/24 is **696/67** in common-equivalent terms.

### ⚠️ Chapter 17 is where the pool stopped being able to supply a returning majority

The Quickmire closes at **375** against the same cap of 260 — **a hundred and fifteen levels**,
×10.91 — and its seam reads **0.9608**. The six most recent are **10.4858 → 7.6774 → 4.5665 →
2.7160 → 1.6154 → 0.9608**, and the last four factors are all exactly 0.595. The rate is now
measured four times.

1. ⚠️ **The seam has fallen below 1.00 and that is a threshold worth naming.** The top of the ladder
   is nominally _ahead_ of the party it is tuned for. Nothing the party gains fixes it — what keeps
   the chapter winnable is entirely that its boards are half the weight of the one below. A chapter
   18 on this rung reads **0.5718**.
2. ⚠️ **Chapter 16 predicted "a seventeenth chapter on this rung cannot be authored out of the pool"
   and it was right about the pool and wrong about the chapter.** It can be authored — by writing
   most of it. Of the **221** blocks that existed before The Quickmire, exactly **13** sit at or
   under 400 common-equivalent at level 375 and **5** at or under 250; the chapter fields **11** of
   those thirteen and authors **17** new ones. **The 25% rule inverts here: the chapter is 57.7%
   new, and not by choice.** The quota is a floor, so nothing is violated — but a session planning
   the next chapter should budget for ~15 new ordinary blocks rather than 8, because twenty-four
   light-enough returning blocks do not exist and no arrangement of the shipped pool produces them.
3. ⚠️ **The returning blocks thin monotonically across the bands and reach zero.** 11, 7, 4, 2 and
   **0** distinct across the five bands — the same shape The Spoilfield's non-lean texture took, one
   chapter further along, and the closing band is now the first in the campaign that fields nothing
   shipped at all.
4. ⚠️ **The gear ladder is exhausted and this is the first chapter that could not step it.** Every
   board carries Relic 100, flat. That is the honest reading rather than a loss: chapter 16's whole
   ramp measured 0.08 of a survivor, chapter 13's grade step ×1.15, and four consecutive chapters
   have measured this axis as fight length. **A sixth grade is a `data/` rule change, not a
   chapter.**
5. ⚠️ **A synthetic control is not a board, and the gap between them cost this session a whole tuning
   pass.** Fourteen sampled boards were tuned against generic stat blocks and every one read well;
   the authored chapter then failed **22 of 50** on the real sweep, because a block's _kit_ and its
   _escort_ are part of its weight and a stand-in has neither. The four `ascended` anchors had to
   come down 250→160, 240→165, 265→142 and 175→112. **Tune the control to find the mechanic's price;
   then measure every authored board before believing the chapter.**
6. ⚠️ **Field all four of a lieutenant's appearances before settling its stat line.** The Pacemaker
   at 265/21 graded **4.00 → 3.55 → 1.73 → fail** across levels 355, 360, 365 and 370: an `ascended`
   block climbs at 1.024 against a party frozen at its rung's cap, so a recurring anchor that is
   correct on its first board is unwinnable on its fourth. At 142/15 it reads 4.00 / 4.00 / 3.75 /
   3.85.

### ⚠️ What chapter 17 measured about tempo, and the three shapes that generalise

Priced against one calibrated control — an anchor of 230/18 behind four bodies of 110/20 at level
375 and Relic 100, **1,131 common-equivalent, reading 3.83 of five**, and it **moves** (4.00 at 931,
2.70 at 1,231, 0.00 at 1,431). Zero timeouts on every row.

| shape                                               | survivors | worth     |
| --------------------------------------------------- | --------- | --------- |
| `STUN` on a **selection**, one or two casters       | 3.85/3.88 | **0.00**  |
| board `haste` 100                                   | 3.80      | 0.03      |
| an `opening` turn dealing `enemy-all` damage        | 3.48      | 0.35      |
| `SLOW` on `enemy-all`, caster in the **front** rank | 2.00      | 1.83      |
| board `haste` 118                                   | 1.88      | 1.95      |
| `HASTE` on `ally-all`, one caster                   | 1.45      | 2.38      |
| `SLOW` on `enemy-all`, caster in the **back** rank  | 1.43      | 2.40      |
| `STUN` on a **scope** (`enemy-all`)                 | 1.23      | **2.60**  |
| board `haste` 130 / 144                             | 0.42/0.00 | 3.41/3.83 |

1. ⚠️ **Scope and selection are not degrees of the same thing.** The identical status is worth
   **0.00** on `enemy-highest` (at one caster _and_ at two) and **2.60** on `enemy-all`. A _scope_, a
   _reach_ and a _selection_ are three different things and conflating them has now shipped a false
   claim four times. Author the scope or do not author the mechanic.
2. ⚠️ **The register check has a sixth answer: a stat that works only _below_ its register.** `haste`
   ships at a ceiling of 152 over a median of 98, and 144 board-wide reads **0.00 of five**. That is
   the opposite of the Monster Tower's `physicalResist`, which had to step _past_ its register.
   ⚠️ **And the claim has to be scoped to what was measured** — chapter 17's _new blocks_ run 106–126
   while its _boards_ reach 148 on a returning Wisp. Say which.
3. ⚠️ **A tempo axis bites the real party harder than the difficulty probe reports.** Chapter 16
   reads 4.00 survivors at a probe threshold of 2,160 where chapter 17 reads 2.4–2.8 at the same
   threshold, because the probe scales a party uniformly and tempo is not a uniform quantity.
   **Tune a tempo band against survivors; use the probe only for the escalation shape.**
4. ⚠️ **Two board-wide turns on one board is the most expensive shape available and it is easy to
   author by accident.** `c17-s30` paired two `SLOW` casters and read 48%; `c17-s40` and `c17-s50`
   each paired a `SLOW` or `STUN` with the board-wide `HASTE` and read 30% and 78%. **One board-wide
   turn per board** is the rule the chapter ended up with.

### ⚠️ Chapter 18 is where the rarity-cap gradient ran out, and the answer was a rung

The Slowgrowth closes at **400**. On `legendary-plus` its seam would read **0.5718** and its board
budget **645 → 454** common-equivalent — **129 → 91 per body on a board of five**. ⚠️ **Of the 238
blocks that existed before it, five sit at or under 129 and none at or under 91**, and the lightest
body this game has ever shipped is 100. **There is no chapter 18 on that rung**, hard or otherwise.

1. ⚠️ **The rung moved to `mythic`, against the log-space rule rather than with it.** Against chapter
   17's seam of 0.9608, `legendary-plus` reads 0.5715 (|Δln| 0.5195) and `mythic` 4.8214 (|Δln|
   1.6131) — the rule prefers staying put by 1.09 of a nat. **The rule assumes the seam below it was
   correct and below 1.00 it is not.** Say which of the two a chapter is doing; this one is an
   override and says so.
2. ⚠️ **`mythic` was ruled out at chapter 15 on a measurement and the measurement inverted.** The
   Underroad recorded boards scaled ×2.4 — an anchor near 3,550 against the Unmade's 1800 — and
   chapters 16 and 17 quoted it unchanged while three further halvings happened underneath it.
   Measured at chapter 18 the budget is **5,442 → 3,830** common-equivalent, **1,088 → 766 per
   body**, against a pool median at level 400 of **1,295** and an Unmade of 5,820: **116 of 238
   blocks sit inside the ordinary-slot band where 13 did a chapter earlier.** Nothing in `data/` had
   to change. **Re-measure a projection before carrying it forward.**
3. ⚠️ **The rung move fixes the pool as well as the seam, and the quota lands at the quota again.**
   The Quickmire was 57.7% new and not by choice; The Slowgrowth is **25.8%** — eight new ordinary
   blocks against twenty-three returning — because the whole roster is fieldable again. Budget the
   normal **8 new ordinary blocks plus the lieutenant and the final**, not chapter 17's fifteen.
4. ⚠️ **The move is what both mode anchor caps were waiting for, and only one of them moved.**
   Expeditions passed unchanged at 322. The Descent's cap has **no working setting** — see
   [descent](descent.md) — and its deepest depth is pinned in `RUNG_TROUGH` instead. ⚠️ **Chapter 19
   showed that pin is a schedule rather than an instance**: the cap clamps the board from chapter 13
   on, so every new deepest depth is a walkover by construction and `RUNG_TROUGH` gains one entry a
   chapter until the `core/` repair lands. **Expect to add one, and do not derive the list.**

### ⚠️ What chapter 18 measured about weight, and the two shapes that generalise

Priced against a control of five walls at level 390 and Relic 100 against the `mythic` five.

| held fixed | swept                                    | reading                                     |
| ---------- | ---------------------------------------- | ------------------------------------------- |
| attack     | health ×1.0 → ×2.8 (abs 14,043 → 39,321) | **4.00 survivors at every row**, 0 timeouts |
| health     | attack ×1.0 → ×1.9 (abs held at 18,256)  | 4.00 → 4.00 → 3.92 → **0.00**               |

1. ⚠️ **Enemy health grades 0.00 across a ×2.8 range and buys only fight length** — 25.7s to 62.6s,
   which is walking toward the ninety-second clock rather than toward difficulty. It is the sharpest
   instance of the rule chapter 14 found across its refusal vocabulary and chapter 16 found on gear.
   **A durability chapter's identity is its health and its difficulty is the attack standing behind
   it**; no board in The Slowgrowth is five hides.
2. ⚠️ **No scalar predicts a board and three were tried.** Common-equivalent health,
   attack-equivalent and a throughput product all mis-rank the shipped boards: a five-wall board at
   12,673 absolute weight reads **4.00** where a five-attacker board at 12,920 reads **0.97**,
   because difficulty is throughput times fight length and fight length is set by the health. Use
   common-equivalent weight to **shortlist** and the **difficulty probe's own threshold** to budget a
   spine. The Slowgrowth's spine runs 8,281 → 17,048 with a worst adjacent ratio of **0.931**.
3. ⚠️ **4.00 survivors is a plateau on a `mythic` five, not a midpoint.** It loses one member to
   almost any real board and the other four to almost nothing until the board cliffs — the shape the
   Demon Tower's `critBlock` band records, arriving from the opposite direction. **Budget the
   escalation on the probe threshold and use survivors only as a legality check.**

### ⚠️ Chapter 19 is where staying on a rung had to be argued as hard as moving one

The Backcut closes at **425** and asks for **`mythic`** again. Against chapter 18's seam of 4.8214,
`mythic` reads **2.8677** (|Δln| **0.5196**) and `mythic-plus` **24.1942** (|Δln| **1.6130**) — the
rule prefers staying put by 1.09 of a nat, which is **numerically the same margin chapter 18
overrode**, and this chapter does not override it.

1. ⚠️ **An override is licensed by the seam below it being wrong, not by the size of the margin.**
   The Slowgrowth inherited 0.9608 — under 1.00 — and a budget of 129 common-equivalent per body
   against a pool whose lightest body is 100, so no chapter existed on the old rung. Here the seam is
   2.8677 and **166 of the 248 blocks that existed before it sit inside the band its ordinary slots use — 380 to 2,140 common-equivalent at level 425, median 760**. **Say which of
   the two a chapter is doing, every time.** Two chapters in a row have now had to, from opposite
   sides.
2. ⚠️ **The degenerate chain re-forms, and it is periodic rather than a one-off.** Chapters 18 and 19
   both clamp to `mythic`'s cap of 340, so `SLOWGROWTH` and `INVESTED` are one set of five — the
   shape chapters 13 through 17 recorded four times, one rung up. The Backcut stands **eighty-five
   levels** above the cap (×5.83) and each further chapter divides the seam by 1.680: chapter 20
   **1.7069**, chapter 21 **1.0161**, chapter 22 **0.6048**. **`mythic` buys about three chapters**,
   and as with `legendary-plus` the pool will run out before the arithmetic does. Re-measure at
   chapter 21 rather than carrying this forward.
3. ⚠️ **The 25% quota landed at the quota for the second chapter running** — 8 new ordinary of 32
   fielded, **25.0%** — which is the rung move still paying out. Budget the normal ten blocks.
4. ⚠️ **The `gearArchetype` bill was zero for the second chapter running**, because the lean was
   Dwarf and The Shutgate paid it five chapters ago (34 of 34 carry one), and the Undead texture was
   covered by The Underroad. **That is a fact about the lean, not a trend** — the bill still lands on
   whichever faction has not yet led a geared chapter.

### ⚠️ What chapter 19 measured about placement, and the four shapes that generalise

Priced against one calibrated control — an anchor of 620/60 behind four bodies of 300/48 at level 425
and Relic 100, **4,390 common-equivalent, reading 3.88 of five**, and it **moves** (4.00 at 3,900,
2.00 at 4,700). Zero timeouts on every row.

| shape                                       | survivors | worth    | longest |
| ------------------------------------------- | --------- | -------- | ------- |
| `THORNMAIL` on the **back three**           | 3.88      | **0.00** | 36.0s   |
| `SUNDER` on `enemy-all`, one front carrier  | 3.77      | 0.10     | 37.7s   |
| `ROOTBOUND` on the **back three**           | 3.77      | 0.10     | 37.0s   |
| `GUARD` on `ally-all`, one front carrier    | 3.73      | 0.15     | 37.7s   |
| `BLOODRISEN` on `self`, all five            | 3.73      | 0.15     | 36.8s   |
| `WEAKEN` on `enemy-all`, one front carrier  | 3.58      | 0.30     | 39.0s   |
| `THORNMAIL` on the **front two**            | 3.50      | 0.38     | 41.9s   |
| `SAVAGED` on `enemy-all`, one front carrier | 3.35      | 0.52     | 43.0s   |
| `THORNMAIL` on **all five**                 | 2.92      | 0.95     | 68.7s   |
| `ROOTBOUND` on **all five**                 | 2.83      | 1.05     | 46.0s   |
| `ROOTBOUND` all five + `THORNMAIL` anchor   | 2.25      | **1.63** | 55.0s   |
| `BLOODRISEN` on `ally-all`, one carrier     | **0.00**  | **3.88** | 33.2s   |

1. ⚠️ **A reflect prices where the party is _aiming_, and on a protected back rank it prices at
   exactly 0.00.** That is the mirror image of chapter 16's finding that a board-wide debuffer is
   worth 4.00 survivors in the front rank and 0.10 in the back. **Same rank, opposite sign**: a
   debuffer is worth more where it cannot be reached and a reflect is worth nothing there, because it
   only bills what is actually struck. Neither is a fact about the status. **A whole chapter's
   difficulty curve can be one status walking from the back rank to the front to the whole board.**
2. ⚠️ **`BLOODRISEN` on a scope is a cliff and not a dial, and it is the sharpest
   scope-versus-selection reading on record.** One carrier applying it to `ally-all` on a wound
   condition is a **total wipe from either rank**, while the same status on `self` across all five
   reads 0.15 and on `ally-lowest` 0.08. **There is nothing between 0.08 and 3.88.** Chapter 17
   measured `STUN` at 0.00 on a selection against 2.60 on a scope; this is that at five times the
   spread, and it is why no board in The Backcut carries one.
3. ⚠️ **All-five reflect is a clock and the arrangement that is _harder_ is also eleven seconds
   shorter.** 0.95 of a survivor at **68.7s** against the 0.80 bar's 72.0, versus link-across-the-
   board-plus-front-rank-reflect at **1.63 at 55.0s**. Chapter 18's longest board was 34.4s and this
   chapter's is 48.0s. **Count the seconds as well as the survivors before choosing between two
   arrangements of one lock.**
4. ⚠️ **Most of the status vocabulary is inert at this weight** — `SUNDER`, `GUARD` and a back-rank
   link all read 0.10 to 0.15. A chapter spending boards on those is texture wearing a mechanic's
   clothes. **Reach for the stat block, or for placement, before the vocabulary.**

### ⚠️ Three ways chapter 19's authored boards failed where its control did not

The synthetic control read well and the first authored draft failed **21 of 50** — chapter 17's
finding, reproduced exactly. What the diagnosis turned up generalises:

1. ⚠️ **Two heavy anchors in one front rank is the failure, not any anchor.** Every returning Dwarf
   legendary reads 100% with 4.00 of five **alone** at level 425 behind four light bodies, the
   heaviest at 2,143 common-equivalent included. Two of them together read **0% at 5,536**. That is
   the Angel Tower's third-hundred finding arriving on a campaign board: **field each candidate
   anchor alone before concluding anything from a pair of stat lines**, and cap a board at one.
2. ⚠️ **Two `enemy-back` turns on one body is not a heavier body, it is the party's back rank
   deleted.** A 520/76 ranger carrying two of them read **0% beside any second legendary** at 3,449
   common-equivalent where two other legendaries at 3,598 read 4.00 — a board 4% lighter losing the
   whole fight. At one turn and 60 attack the same body reads 100% / 4.10 alone. **Chapter 18 caught
   this on a board; chapter 19 caught it on a stat line.**
3. ⚠️ **A final that fails at every stat line is the escort, and the fight getting _longer_ as the
   boss shrinks is the tell.** The Backcut's final read 0% from 660/70 all the way down to 380/46
   with the fight lengthening at each step. Removing one legendary from its escort let the boss sit
   at 520/58 reading 100% / 3.36 / 50.0s. **Check the control can move** — chapter 15's rule, on a
   final rather than on an anchor sweep.
4. ⚠️ **Composition beats weight so completely that a heavier escort can be the easier one.** Two
   tanks at 700/50 and 800/52 are **easier** than two brawlers at 620/52 and 640/60, and `c19-s17` at
   4,006 common-equivalent probes at 13,244 where `c19-s25` at 4,244 probes at 11,593. Chapter 18
   found no scalar predicts a board; this chapter found the ordering can **invert**. Weight
   shortlists; only the probe ranks.

### ⚠️ Chapter 20 is the first chapter longer than fifty, and the extra ten stages cost more than ten boards

The Commonage is **sixty stages, 425 → 455**, which needed `CHAPTER_CURVE.maxStages` to stop being a
constant. It is now a **schedule** — `raisedMaxFromChapter` 20, `raisedMaxStages` 60 — so the length
stays derived and `chapters.spec.ts` still holds every authored chapter equal to `chapterSize`.
⚠️ **A raised cap may only ever apply forward**; `chapterSize` refuses a lowering, because shortening
a chapter that has shipped teleports every run standing past its new last stage.

1. ⚠️ **The slope is the rule and the span is the consequence.** Sixty stages at half a level a stage
   is **thirty** levels of climb against a party cap that does not move, where every chapter before
   it climbed twenty-five. That is a further ×`perLevel.common ** 5` = **1.11** of squeeze on top of
   the usual 0.595 a chapter, and it is what pulled the pool wall forward by two chapters.
2. ⚠️ **The seam still says `mythic` and the pool nearly said otherwise.** Against chapter 19's
   2.8677, `mythic` reads **1.5373** (|Δln| 0.6237) and `mythic-plus` 12.9700 (|Δln| 1.5099) —
   `mythic` by 0.886 of a nat, and above 1.00, so this is a **stay** and not an override. But chapter
   19 projected the rung buying about three chapters on the arithmetic and **on the pool it bought
   about one and a half**. ⚠️ **Measure the pool before re-deriving the seam at chapter 21.**
3. ⚠️ **The board budget is 2,145 → 1,328 common-equivalent**, against The Backcut's 3,745 → 5,875
   one chapter below — roughly a third. At level 455 the lightest five _shipped_ commons that can
   stand together, 2,320, read **3% and 0.03 survivors**.
4. ⚠️ **The wall is a _faction_ squeeze rather than an absolute one, and that distinction is the
   finding.** Twelve blocks sit under 150 health and **every one of them is a Monster** — The
   Quickmire's seventeen are still the light tail of the whole pool. The four lightest Undead or
   Human blocks total 790 before a boss, so The Commonage had to author two bodies at 150 and 170 to
   have a closing band at all. **A chapter 21 leaning Monster does not hit this wall; every other
   lean does.** Check the lean's own light tail, not the pool's.

### ⚠️ What chapter 20 measured about aim, and the finding that inverted a whole chapter's premise

Priced against one calibrated control — four bodies at 300/40 behind an anchor of 420/46 at level 455
and Relic 100, **2,099 common-equivalent, reading 3.35 of five**, and it **moves** (3.95 at 2,018,
2.60 at 2,180, 1.18 at 2,220). Zero timeouts on every row.

| shape                                        | survivors | worth     |
| -------------------------------------------- | --------- | --------- |
| `OATHSHIELD` on the front anchor             | 4.00      | **−0.65** |
| `enemy-lowest` / `enemy-highest` stat bait   | 3.98      | −0.63     |
| `OATHSHIELD` on two carriers, front and back | 3.80      | −0.45     |
| `OATHSHIELD` from the back rank              | 3.63      | −0.28     |
| `ROOTBOUND` on the back three                | 3.17      | 0.18      |
| `WEAKEN` on `enemy-all`, front carrier       | 2.40      | 0.95      |
| `THORNMAIL` on the front two                 | 2.30      | 1.05      |
| `SLOW` on `enemy-all`, front carrier         | 1.95      | 1.40      |
| `CHAINBOND` cast on `ally-all`               | 1.57      | 1.78      |
| `THORNMAIL` on all five                      | 1.07      | 2.28      |
| `ROOTBOUND` on all five                      | 1.00      | **2.35**  |
| `ROOTBOUND` on all five **plus** a taunt     | 1.63      | 1.72      |

1. ⚠️ **A taunt is worth zero or _negative_ at this weight and never positive.** Confirmed off the
   synthetic control too: bolted onto the shipped `c19-s50` it reads 3.25 bare against 3.30 in the
   front rank and **3.63** from the back. The mechanism generalises — a taunt **concentrates** the
   party's damage, and concentration is what a party wants, because one body dying drops a board's
   throughput faster than five bodies being chipped. **It is the direct antidote to a link**: a
   board-wide `ROOTBOUND` reads 1.00 of five and 1.63 with a taunt added.
2. ⚠️ **This is the first measurement in the project to come back with the _wrong sign_ rather than
   with zero.** The register check has now given seven answers: worth nothing at its register, worth
   something at it, worth something only above it, worth something only below it, inert against a
   saturated control, a cliff with no middle — and now **worth less than nothing**. A chapter whose
   premise rests on a mechanic must price the mechanic _before_ the boards; The Commonage's premise
   survived only because the question ("does the party choose where its damage goes") had a second,
   opposite answer available.
3. ⚠️ **Baiting the party's own selection rules is worth −0.63, by the same mechanism.**
   Redistributing a board's health so one body is far below the rest (soaking `enemy-lowest`
   finishers) or far above it (soaking `enemy-highest` turns) reads 3.98 against 3.35. **"Reach for
   the stat block before the vocabulary" is a good rule and this is where it does not apply** — the
   stat-block version of a concentration mechanic has the same sign as the status version.

### ⚠️ Common-equivalent weight counts health, and the `ascended` premium is on every stat

The longest diagnosis of the chapter-20 session, and the correction to a habit four chapters old.
`ceq` normalises **health** to `perLevel.common`, so it says nothing about an `ascended` block's
defence, resists or attack — all of which carry the same ×3.792 premium at level 455.

- The final read **0% at every stat line from 230/56 down to 110/20**, with the fight lengthening at
  every step. That is chapter 19's "a final that fails at every stat line is its escort" signature
  **pointing at the boss itself**, and the escort was innocent: four escorts with no boss read 4.00.
- What settled it was the **attack**, not the health: at 200 health, attack 30 reads 0%, 16 reads
  13%, and 10 reads 73% at 64.0s. The lieutenant came down from **250/52 to 190/18** and the final
  from **230/56 to 175/16**.
- ⚠️ **So shortlist an anchor on common-equivalent weight and settle it on attack**, and expect an
  `ascended` anchor's authored attack to keep falling much faster than its authored health as the
  campaign climbs past its rung's cap.

### ⚠️ Two board-shaping rules chapter 20 added

1. ⚠️ **Make the board weight smooth in the stage index when the locks step at band boundaries.** A
   per-band weight drop cancels against the new band's lock and reads as a step _backwards_ on the
   probe: `c20-s53` measured **0.780** against the 0.85 bar for exactly that reason. Smooth weight
   under stepped locks is what makes a boundary read as a step up.
2. ⚠️ **A mini-boss is a peak and nothing covers the stages after it.** The boundary-skip in
   `chapters.balance.ts` covers a chapter _boss_ only, so the samples following a mini-boss are a
   chapter's thinnest probe margin — `c20-s13` read 0.860 before the three stages after each
   mini-boss were lifted toward the peak. ⚠️ **Do not lift them in the closing band**, which has no
   weight to spare: `c20-s51` reads 60% and 1.00 of five with the lift on.

### ⚠️ Chapter 21 is where a chapter stayed on a rung whose own seam is under 1.00

The Longebb closes at **485**, sixty stages again — the first chapter for which sixty is simply what
`CHAPTER_CURVE` says. Against chapter 20's seam of 1.5373, `mythic` reads **0.8241** (|Δln|
**0.6235**) and `mythic-plus` **6.9529** (|Δln| **1.5091**); `mythic` by 0.886 of a nat.

1. ⚠️ **A seam under 1.00 is the reading that licensed chapter 18's override, and it does not license
   one here.** The Slowgrowth's move rested on the seam **below** it being wrong (0.9608) _and_ on a
   budget of 129 common-equivalent per body against a pool whose lightest body was 100 — no chapter
   existed on the old rung. Here the seam below is 1.5373 and the chapter was authorable. **What
   licenses an override is the seam below being wrong, never this chapter's own seam being small.**
   Three chapters running have now had to say which of the two they are doing.
2. ⚠️ **The alternative was _fielded_ rather than reasoned about, which is the chapter-15 failure
   being avoided on purpose.** Chapter 20's own final refielded at level 485 reads **100% with all
   five alive in 3.2 seconds** against a `mythic-plus` five and **0%** against the `mythic` one.
   Record that a projection was checked, not just quoted.
3. ⚠️ **Chapter 20's pool projection was right and this chapter is the half it predicted.** The
   budget runs **1,445 → 804** common-equivalent, and the whole shipped Monster mid-weight tier reads
   **1.45 to 4.00 survivors at level 475** and **0.00 to 0.50 at 485** — a ten-level cliff. What is
   left is the eleven light Monsters The Quickmire authored, reading **3.75 of five unaided**.
   **Chapter 22 closes at 515 and nothing shipped can stand on one of its boards.**
4. ⚠️ **The quota landed at the quota for the third chapter running**: 32 distinct fielded, ten new —
   **26.7%** of ordinary archetypes under the shipped rule and 31.3% counting the lieutenant and the
   boss inside the fraction. Budget the normal ten blocks.
5. ⚠️ **The `gearArchetype` bill was zero for the third chapter running**, because The Quickmire paid
   the Monster bill and The Commonage the Undead one. Still a fact about the lean rather than a trend.

### ⚠️ What chapter 21 measured about worth, and the inversions it found

Priced against one calibrated control — an anchor of 255/29 behind four bodies of 148/23 at level 485
and Relic 100, **847 common-equivalent, reading 3.25 of five**, and it **moves** (3.98 at 813, 2.70 at
860, 2.17 at 890, 1.88 at 920). Zero timeouts on every row.

| shape                                     | survivors      | worth          |
| ----------------------------------------- | -------------- | -------------- |
| `SAVAGED` on `enemy-lowest`               | 3.88           | **−0.63**      |
| `SAVAGED` on `enemy-back`                 | 3.73           | −0.48          |
| `CHAINBOND` cast on `ally-all`            | 3.27           | **0.00**       |
| board `tenacity` 0.20 / 0.40 / 0.60       | 3.00/2.98/2.92 | 0.25–0.33      |
| board `lifeLeech` 0.05 → 0.40             | 3.08 → 2.40    | 0.17 → 0.85    |
| `THORNMAIL` on all five                   | 2.52           | 0.73           |
| board `physicalPierce` 0.15 / 0.30 / 0.45 | 2.65/1.60/0.20 | 0.60/1.65/3.05 |
| `SAVAGED` on `enemy-all`, one carrier     | 1.98           | **1.27**       |
| board `dodge` 0.10 / 0.20 / 0.30          | 2.95/1.93/0.65 | 0.30/1.32/2.60 |
| `ROOTBOUND` on all five                   | 1.73           | 1.52           |
| `BLOODRISEN` on `self`, all five          | 1.27           | **1.98**       |
| `SLOW` on `enemy-all`                     | 0.30           | 2.95           |
| `WEAKEN` on `enemy-all`                   | **0.00**       | **3.25**       |

1. ⚠️ **Four readings inverted against the chapters that measured them, all for one reason: the board
   under them is a third of chapter 20's weight.** `CHAINBOND` was 1.78 at chapter 20 and is **0.00**
   here; `WEAKEN` was 0.30 at chapter 19 and 0.95 at chapter 20 and is a **total wipe from one
   carrier**; `BLOODRISEN` on `self` across five was 0.15 at chapter 19 and is **1.98**. Chapter 16
   wrote "state the weight with the figure" and this is the widest spread it has produced. **Re-price
   the whole vocabulary against the new chapter's own control; do not carry a table forward.**
2. ⚠️ **`SAVAGED` now carries three signs on one status** — −0.63 on a selection, −0.48 on a reach,
   **+1.27** on a scope. Chapter 17 measured 0.00 against 2.60 and chapter 19 0.08 against 3.88; this
   is the first to come back **negative** on the aimed arm, by chapter 20's mechanism: an aimed wound
   concentrates the party's damage for it.
3. ⚠️ **`lifeLeech` is the rare reading that is a dial rather than a cliff** — monotone across an
   eightfold range with zero timeouts to 0.25 — which is why a whole chapter could be built on it.
   **When every other reading is a cliff, look for the one stat that grades.**
4. ⚠️ **`tenacity` is the register check's eighth answer and it is flat**: 0.25 at 0.20 and 0.33 at
   0.60. Declined on the measurement.

### ⚠️ An ascended anchor at this depth is fight length, which inverts chapter 20's rule

Chapter 21's final read **0% at every stat line from 120/12 down to 95/4**, and stripping its
`lifeLeech`, `tenacity`, `physicalPierce`, defence and then **all three of its skills** moved it by
nothing. The escort alone read 4.00. What separated them was **tier**:

| fifth body added to the same four | reading at level 485     |
| --------------------------------- | ------------------------ |
| `common` 150 health, attack 16→30 | **4.00 at every attack** |
| `ascended` 149 common-equivalent  | 4.00                     |
| `ascended` 248 common-equivalent  | 3.50                     |
| `ascended` 372 common-equivalent  | 1.85                     |
| `ascended` 496 common-equivalent  | **0.15**                 |

⚠️ **So the anchor sets the fight length and the escort sets the rate at which length becomes
deaths.** The same 496-weight anchor reads **0.15** behind an escort summing 89 attack and **3.92**
behind one summing 68. Chapter 20 settled its final on attack; this one settles on health, and the
difference is a fact about the escort. **Shortlist on weight, then measure which of the two the
escort leaves free.** ⚠️ **And more than a third of the final's whole price was one turn**: at 120/7
it reads 0% with its `WEAKEN` and **83% / 1.88 without it**.

### ⚠️ Two board-shaping rules chapter 21 added

1. ⚠️ **A band that adds a lock opens _heavier_ than the band below it closes.** `c21-s31` is the
   first board carrying the leech and the wound together and it measured **0.849** against the 0.85
   bar at 1,017 common-equivalent, because the weight drop that paid for the new lock is the only
   half the probe can see. It clears at 1,125. Chapter 20 found this after a mini-boss; this is the
   same rule at a plain band boundary.
2. ⚠️ **A lieutenant is an anchor, so its board may not carry a second one.** Trying to make the
   first three mini-bosses peaks by putting a returning mid-weight body beside `THE_UNDERTOW` read
   **68%, 0% and 3%**. What worked was the one returning block whose weight is not attack — the
   Tusked Boar at 620/37, which reads **3.00 at level 485** where Clefthorn Gorer at 620/60 reads
   0.07. **Escalate a lieutenant board with health, never with a second stat line.**

### ⚠️ Chapter 22 is the second override the campaign has, and what it measured about instance size

The Downstroke closes at **515** and asks for **`mythic-plus`**. Against chapter 21's seam of 0.8241,
`mythic` reads **0.4418** (|Δln| 0.6235) and `mythic-plus` **3.7273** (|Δln| 1.5091) — the rule
prefers staying put by 0.886 of a nat and this chapter overrides it.

1. ⚠️ **The licence is the same one chapter 18 had, and nothing weaker would do.** The seam _below_
   is 0.8241, under 1.00 — but chapter 21 had that reading too and correctly declined, because its
   chapter was authorable. What settles it here is the **pool**: at level 515 against a `mythic` five,
   the **five lightest bodies in the game** (100, 104, 106, 122 and 126 health) read **0% with 0.00
   survivors**, and so do the five heaviest of The Quickmire's light Monsters. The same five read
   100% / 4.00 at 485. **There is no chapter 22 on `mythic`.** Say which of the two a chapter is
   doing, every time; four chapters running have now had to.
2. ⚠️ **A rung move re-opens the pool and the quota lands at the quota.** 181 of 282 blocks sit inside
   the band chapter 22's ordinary slots use, against 116 of 238 after chapter 18's move, and the
   chapter is **26.7% new** under the shipped rule — the same two figures The Longebb landed on.
   Budget the normal ten blocks.
3. ⚠️ **Expect the boundary to be a walkover and expect to author _heavier_.** Chapter 21's final
   refielded at 515 reads 100% with all five alive in 3.1s against the new party. The Downstroke's
   boards are the first authored heavier than the chapter below them since chapter 13, and its blocks
   run 700–1,220 health where The Longebb's ran 150–400.
4. ⚠️ **The `gearArchetype` bill came back after three chapters of zero** — 19 of 36 Human blocks
   carried one, so eleven returning blocks took a one-line edit before a board could be authored. A
   fact about the lean, not a trend. All eleven appear only in ungeared content below chapter 12, so
   the edit changed nothing anywhere else; **check that before assuming an archetype edit is free.**

### ⚠️ What chapter 22 measured, and the rule that invalidated its first pass

Priced against one calibrated control — an anchor of 3,200/295 behind four bodies of 1,800/250 at
level 515 and Relic 100, **10,400 common-equivalent, reading 3.08 of five at 160 trials**, and it
**moves** (4.00 at 9,500, 2.63 at 10,700, 1.02 at 11,300, 0.00 at 11,900). Zero timeouts everywhere.

⚠️ **`skills.spec.ts` caps a wide skill at power 1.2, and the first pass priced the whole chapter on
one.** `enemy-all`, `enemy-row-front` and `enemy-row-back` may not carry a big blow at all;
single-target turns are uncapped. The premise was measured on `enemy-row-front` at power 1.55 to 3.10
and **every row described a skill the game refuses to let anybody author**. The unit suite caught it,
not the sweep. **Check what a target is allowed to carry before pricing a mechanic on it.**

On the legal single-target form, one front carrier:

| power / cooldown | survivors | worth | longest |
| ---------------- | --------- | ----- | ------- |
| 1.20 / 25        | 2.99      | 0.09  | 23.0s   |
| 1.90 / 42        | 2.64      | 0.43  | 25.0s   |
| 2.20 / 50        | 2.48      | 0.60  | 45.4s   |
| 2.60 / 60        | 2.25      | 0.83  | 45.4s   |
| 3.10 / 70        | 2.22      | 0.86  | 53.5s   |
| 3.60 / 80        | 1.36      | 1.72  | 55.9s   |

1. ⚠️ **Instance size is a _dial_ where almost everything else at this weight is a cliff**, monotone
   with zero timeouts on every row, which is exactly what a six-band chapter needs. Two carriers is
   worth about one power-step more (0.13 / 0.35 / 0.69 / 0.74 at 1.20 / 1.55 / 1.90 / 2.20); a reach
   on `enemy-back` is worth 0.33 / 0.55 / 0.72 at 1.90 / 2.40 / 2.90.
2. ⚠️ **The same idea as a stat trade works board-wide and is non-monotone on one body.** `atk` up
   against `haste` down at held damage per second reads 3.05 / 2.33 / 1.98 / 1.80 / **0.40** across
   the board at ×1.00 → ×1.60, and on a single body **3.08 / 2.39 / 2.20 / 2.91 / 2.55 / 3.01** at
   ×1.0 → ×4.0 (160 trials) — because past about ×2.5 the body's period exceeds the fight and the
   second swing never lands. **Nominal damage per second stops describing a body once its cooldown is
   longer than the battle.** Author a burst axis as a **skill**, not as a stat line.
3. ⚠️ **The aim rule holds on plain damage, and the first table of it was confounded.** The same
   escort body casting `enemy-all` at the wide cap is worth **0.07 from the front rank and 0.42–0.64
   from the back**. The first version read the reverse because the front arm was carried by the
   board's anchor and the back arm by an escort — **a rank comparison has to be carried on one body.**
   ⚠️ **And chapter 16's "put a board-wide caster where it can be killed" does not carry over from a
   debuff to damage**: that rule answers an unreachable status that never lapses (4.00 against 0.10),
   where a damage scope bills once and depletes. The Downstroke takes the back-rank arrangement on the
   measurement. **Take the measurement, not the precedent.**
4. ⚠️ **The whole tempo half of the vocabulary is a total wipe from one carrier at this weight** —
   `HASTE`, `RALLY`, `WEAKEN`, `SLOW` and `STUN` all read 0.03 to 0.07 of five — and a **reflect is
   worth less than nothing** on all three arrangements (−0.38 to −0.95) where chapter 21 read +0.73,
   because the turn spent applying it is a turn not spent attacking. `SAVAGED` on a scope now has a
   **fourth sign**: −0.18 here against +1.27 one chapter below. **The table cannot be carried between
   chapters at all.**

### ⚠️ Three board-shaping rules chapter 22 added

1. ⚠️ **A returning block's kit can invert its stat line and weight will not warn you.** `c22-s58`
   read **8% with 0.10 survivors** with the Order Serjeant at 1,706 common-equivalent in an escort
   slot and **4.00** with the Edgeturn Warden at 2,247 — the heavier board being the easy one, because
   the lighter body carries a board-wide `RALLY`. The same block is affordable three bands earlier.
   **Read what a returning block does, not only what it weighs.**
2. ⚠️ **A refusal can be a _joint_ condition on two stats, and stating one of them ships a false
   claim.** The chapter's premise is slowness, but every board it lost in tuning lost to a body that
   was fast **and** over 1,600 common-equivalent, while six blocks at haste 96–114 at or under 560 are
   fielded freely as texture. ⚠️ **The premise can also disagree with the lean**: Human's median
   `haste` is 92 and only eleven usable returning Human blocks sit at 92 or under, so a first draft
   leaned Dwarf to make up weight and came out **55% Human with 25 distinct archetypes**. What fixed
   it was five returning Humans in the 1,700–2,400 band the draft was not using. **Check the lean's
   own register against the premise, not just its light tail.**
3. ⚠️ **Two boards came down off the ninety-second clock rather than off a survivor count** — 71.0s
   and 71.7s against a 72s bar, both three heavy slow bodies plus two carriers. The guard reads the
   longest fight a party actually **clears**, so a marginal clear is exactly the fight that lands in
   it. **Count the seconds as well as the survivors.**

### ⚠️ Chapter 23 is where the pool wall stopped being a weight wall and became an attack wall

The Evenfall closes at **545** and **stays** on `mythic-plus`. Against chapter 22's seam of 3.7273,
`mythic` reads **0.2368** (|Δln| 2.7561), `mythic-plus` **1.9981** (|Δln| **0.6235**) and `ascended`
**16.8578** (|Δln| **1.5091**) — `mythic-plus` by 0.886 of a nat, and both the seam below and this
chapter's own are above 1.00, so nothing licenses an override. Five chapters running have now had to
say which of the two they are doing.

1. ⚠️ **The party is unchanged from the chapter below, and that is the finding this chapter exists to
   record.** Chapters 22 and 23 both clamp to `mythic-plus`'s cap of 420, so the seam is degenerate at
   one link and the five combatants are literally the same. What moved is only the **boards**, thirty
   levels — so an authored stat here is worth `perLevel ** 30` = **×1.87** more than the identical
   number one chapter below, and the board budget is **×0.536** of chapter 22's in common-equivalent
   terms (2,200 to 4,000 against 7,400 to 9,500).
2. ⚠️ **A degenerate seam makes the chapter below's measured price table transferable, which is the
   one time that is true.** Chapter 21 wrote "do not carry a table forward" about four inversions in
   one chapter, and the reason was always that the _board under the mechanic_ had changed. Here the
   party is identical and equal **absolute** weight is equal difficulty, so chapter 22's readings hold
   at 0.536× the common-equivalent figure. **Spot-check it rather than assuming it**; what does not
   transfer is anything priced against a chapter whose party differs.
3. ⚠️ **The binding pool constraint is _attack_, not weight, and this is the first chapter where the
   two disagreed outright.** Filtering the 292 shipped blocks on common-equivalent weight alone passes
   **117**; adding an attack filter at what chapter 22's boards actually carried leaves **55** — 15
   Elf, 15 Undead, 10 Dwarf, 10 Monster, 5 Human, and **none** from either celestial. That is chapter
   21's Undead-texture finding ("the tail can be bounded by attack rather than by weight") arriving as
   the chapter's _main_ constraint rather than as a note about one faction's texture.
4. ⚠️ **It fired as an authoring error before it was understood as a rule.** The chapter's ten new
   blocks were first drafted with chapter-23 _health_ and chapter-22 _attack_, and **every board read
   0%** — the lieutenant at all five of its appearances, the final at every stat line from 300/24 down
   to 165/13, and bands 5 and 6 outright. Halving the authored `atk` and changing nothing else took
   the six band representatives to 5.00 / 5.00 / 5.00 / 4.08 / 4.00 / 4.00. **An anchor sets the fight
   length and the escort sets the rate at which length becomes deaths** — chapter 21 measured that and
   this chapter is what it looks like when you get it wrong.
5. ⚠️ **The quota landed at the quota for the fourth chapter running**: 32 distinct fielded, ten new —
   **26.7%** of ordinary archetypes under the shipped rule and **31.3%** counting the lieutenant and
   the boss inside the fraction. Budget the normal ten blocks. The `gearArchetype` bill was **zero**
   for the fourth chapter running, because The Rustwood and The Slowgrowth paid the Elf one and The
   Commonage the Undead one.

### ⚠️ What chapter 23 measured, and the nine-chapter inversion it found

Priced against one calibrated control — an anchor of 1,887/174 behind four bodies of 1,062/147 at
level 545 and Relic 100, **6,135 common-equivalent, reading 3.55 of five**, and it **moves** (3.98 at
5,892, 2.90 at 6,355, 2.70 at 6,412). Zero timeouts on every row.

| shape                                  | survivors | worth    |
| -------------------------------------- | --------- | -------- |
| `magicResist` 0.16 across five         | 3.35      | 0.20     |
| `def` 46 across five                   | 3.15      | 0.40     |
| `critBlock` 0.16 across five           | 3.13      | 0.42     |
| `critBlock` 0.28 on the front two      | 2.95      | 0.60     |
| `critBlock` 0.28 across five           | 2.80      | 0.75     |
| **complete crit immunity** across five | 2.67      | **0.88** |
| `physicalResist` 0.18 across five      | 2.55      | 1.00     |
| `magicResist` 0.75 across five         | 2.38      | 1.17     |
| `dodge` 0.20 across five               | 2.20      | 1.35     |
| `def` 70 across five                   | 1.90      | 1.65     |
| both resists at 0.20 across five       | 1.77      | 1.78     |
| `physicalResist` 0.30 across five      | 1.25      | 2.30     |
| `dodge` 0.30 across five               | 1.23      | 2.32     |
| `physicalResist` 0.45 across five      | 0.05      | **3.50** |
| `def` 110 across five                  | 0.00      | 3.55     |

1. ⚠️ **This inverts chapter 14's refusal finding outright, nine chapters later.** The Shutgate
   measured `def` past its register and `physicalResist` to 0.60 as worth **no more than 0.08 of a
   survivor** and concluded the whole refusal vocabulary was fight length rather than difficulty. Here
   `def` 70 is worth **1.65** and `physicalResist` 0.30 is worth **2.30**, both with zero timeouts.
   **A negative result has a weight attached to it exactly as a positive one does**, and a nine-chapter
   old refusal list is not a fact about the vocabulary.
2. ⚠️ **A lock is worth what the party has staked on the thing it denies, which is the register check
   asked from the _party's_ side.** Crit denial saturates inside its own shipped register — `critBlock`
   grades 0.42 → 0.75 across 0.16 → 0.28 and then flat (0.34 reads 2.77, 0.45 reads 2.73), and
   **complete immunity to both crit chance and crit damage is worth 0.88 of one member.** The cause is
   the calibrated five: only Rin (0.22) and Pyra (0.25) carry crit worth denying and the other three
   sit at 0.02 to 0.05. The Demon Tower's `critBlock` band read 0.59 at 0.24 against a crew _built_ on
   crit. **Check the register on both sides of the board before building a band on a stat.**
3. ⚠️ **Everything else in the refusal vocabulary is a cliff, so the chapter is built on the dial and
   textured with the cliffs.** `physicalResist` runs 1.00 → 2.30 → **3.50** across 0.18 → 0.30 → 0.45
   and `def` 0.40 → 1.65 → **3.55** across 46 → 70 → 110; neither steps six times. No shipped board
   carries `physicalResist` above 0.24 or `def` past its register.
4. ⚠️ **A pairing can be worth more than either half at twice the value.** Both resists at 0.20
   together read **1.78** where `physicalResist` alone at 0.30 reads 2.30 and `magicResist` alone at
   0.30 reads 0.32 — so the closing band buys its step from the _combination_ rather than from pushing
   one stat further into a cliff.
5. ⚠️ **A stat that is common in the pool cannot carry a band claim about presence.** `physicalResist`
   is on 139 of 302 blocks at a median of 0.10, so "the skin arrives in band 3" is false the day it is
   written. The Evenfall's band table states **bodies per board at or above 0.12** — 0–1, 0–1, 1–3, 3,
   2–3, 1–3 — which is the Demon Tower's counts-not-absolutes fix applied to a chapter, and it also
   forced a shipped block to be re-authored: {@link GLASSBARK_SENTRY} carries **no `physicalResist` at
   all** because it stands on more opening-band boards than anything else.

### ⚠️ Chapter 25 is the campaign's third override, and the two halves of the licence disagreed

The Thinground closes at **605** and moves the rung to **`ascended`**. Against chapter 24's seam of
1.0711, `mythic-plus` reads **0.5740** (|Δln| **0.6238**) and `ascended` **4.8443** (|Δln|
**1.5092**) — the rule prefers staying put by 0.885 of a nat, numerically the same margin chapters
18 and 22 overrode and chapters 19, 20, 21, 23 and 24 stayed on. **Seven chapters running have now
had to say which of the two they are doing.**

1. ⚠️ **The standing licence is "the seam below is wrong _and_ the pool cannot supply a board", and
   here only the second half holds.** The seam below is **1.0711, above 1.00**; only this chapter's
   own is under it, which is exactly the reading chapter 21 declined an override on. What separates
   them is that chapter 21's chapter was **authorable**. **When the two halves disagree, the pool is
   the half that decides — and say in writing which one you have.**
2. ⚠️ **The pool was measured by _fielding_ it, which is chapter 24's correction applied.** Every one
   of the 312 shipped blocks was fielded as an ordinary body beside four light escorts at level 605:

   | party fielding the board at 605 | blocks that stand                         |
   | ------------------------------- | ----------------------------------------- |
   | the `mythic-plus` five, cap 420 | **4 of 312**, every one a Monster         |
   | an `ascended` five, cap 500     | **282 of 312**, across all seven factions |

   And chapter 24's **own** opening board, mid board and final all read **0%** refielded at 605
   against the rung it was fought on, where the `ascended` five takes all three at 100% with all five
   alive in 3.0s, 7.6s and 7.3s. **There is no chapter 25 on `mythic-plus`.**

3. ⚠️ **This is the last chapter for which the rung question has a tuning answer.** `ascended` caps
   at 500; `ascended-1` caps at **600**, five levels under this chapter's own close, and reads a seam
   of **61.94**. Every rung above `ascended` is a walkover by construction rather than by tuning, so
   a chapter that cannot be authored on `ascended` is a `data/` question about `LEVEL_CURVE.caps`
   rather than a chapter. **Chapter 26 inherits 4.8443 and a fresh rung; 27 reads 1.3901 and 28
   0.7446.**
4. ⚠️ **A rung move re-opens the pool and the quota lands at the quota, for the sixth chapter
   running** — 33 distinct fielded, ten new, **25.8%** of ordinary archetypes (8 of 31) and **30.3%**
   counting the lieutenant and the boss inside the fraction. Budget the normal ten blocks.
5. ⚠️ **The `gearArchetype` bill was zero for the sixth chapter running, and for a reason worth
   distinguishing from the usual one.** Nine of the 49 Undead blocks carry none, so the lean had
   **not** been paid for — none of the nine is fielded, because every one is either too heavy for a
   board at this budget or carries a second `enemy-back` turn. **That is a fact about which blocks
   the budget reached rather than about the faction**, and the bill is still owed the next time
   Undead leads at a weight that can afford them.

### ⚠️ What chapter 25 measured, and the first axis ever chosen on fight length

Priced against one calibrated control — an anchor of 2,209/51 behind four bodies of 1,250/40, each
carrying one ordinary turn, at level 605 and Relic 100: **17,996 common-equivalent, reading 3.91 of
five at 38.7s**, and it **moves** (4.00 at 16,555, 3.25 at 18,714, 2.23 at 19,438; on attack alone at
held weight, 3.38 at 54, 2.38 at 57, 0.63 at 60). Zero timeouts on every row.

| shape                                                         | survivors           | worth              | mean fight   |
| ------------------------------------------------------------- | ------------------- | ------------------ | ------------ |
| `physicalPierce` 0.08 → 0.45 across five                      | 3.71 → 1.58         | 0.20 → **2.33**    | 38.7 → 43.9s |
| `magicResist` 0.16 → 0.75 across five                         | 3.88 → 2.38         | 0.08 → 1.48        | 40.2 → 49.6s |
| `physicalResist` 0.12 → 0.45 across five                      | 3.40 → 0.53         | 0.55 → 3.43        | 43.5 → 56.4s |
| `dodge` 0.10 / 0.20 / 0.30                                    | 3.70/3.08/1.48      | 0.25/0.88/2.48     | 41.0 → 54.3s |
| `tenacity` 0.20 → 0.85 across five                            | 3.10 → 0.00         | 0.85 → 3.95        | 40.8 → 49.4s |
| `critChance` 0.15 / 0.30 / 0.45                               | 3.00/1.25/0.42      | 0.95/2.70/3.53     | 40.6 → 41.7s |
| `critBlock` 0.16 / 0.28 / 0.45                                | 3.52/3.20/3.20      | 0.43/0.75/**0.75** | 43.6 → 45.8s |
| `def` 20 / 40 / 70 / 110                                      | 2.17/0.30/0.00/0.00 | 1.78 → 3.95        | 50.9 → 58.5s |
| `haste` 90 / 100 / 115                                        | 2.45/0.75/0.00      | 1.50/3.20/3.95     | 40.1 → 35.8s |
| `THORNMAIL` on `ally-all`, one carrier                        | 0.80                | **3.15**           | 49.0s        |
| `BLOODRISEN` on `ally-all`, one carrier                       | 2.45                | 1.50               | 41.8s        |
| `HASTE` on `ally-all`, one carrier                            | 2.80                | 1.15               | 39.4s        |
| `STUN` on `enemy-all`, one carrier                            | 2.98                | 0.98               | 53.2s        |
| `SUNDER` / `GUARD` / `CHAINBOND` / `ROOTBOUND` / `OATHSHIELD` | 4.00                | **−0.05**          | 37–41s       |

1. ⚠️ **`physicalPierce` is the cleanest axis on record: ten monotone steps in _value_ and five in
   _count_.** By carrier count at 0.40 it reads 1.27 / 1.34 / 1.50 / 1.57 / 1.96 at one through five.
   That two-dimensional grid is what six bands need, and it is entirely **inside** the shipped
   register (94 of 312 blocks, median 0.20, p75 0.24, ceiling 0.45) — the Elf Tower's `critChance`
   shape rather than the Monster Tower's `physicalResist` one. Chapter 21 found `lifeLeech` was the
   one stat that graded and chapter 24 found `tenacity` was; **when everything else is a cliff, look
   for the one stat that grades** keeps finding the chapter.
2. ⚠️ **Fight length is what chose it, and no previous chapter has picked an axis that way.** Every
   refusal stat that works walks the control toward the 72s bar; pierce moves it five seconds across
   its whole range, because it kills rather than delays. Chapters 22 and 24 each brought two boards
   down off the clock rather than off a survivor count. **The longest fight anywhere in The
   Thinground is 29.0s.** Count the seconds when you _choose_ the axis, not only when you tune the
   boards.
3. ⚠️ **Two more recorded readings inverted, which makes five chapters running.** `def` is a **cliff**
   here — 1.78 at 20, 3.65 at 40 — where chapter 23 graded it 0.40 / 1.65 / 3.55 across 46 / 70 /
   110; and **`THORNMAIL` on the back three is a total wipe (4.00 of five)** where chapter 19
   measured that exact arrangement at **0.00** and chapter 22 at less than nothing. `critBlock`
   saturating at 0.75 by 0.28 is the one reading that reproduced chapter 23 exactly. **The table does
   not transfer except across a degenerate seam.**
4. ⚠️ **The whole "tempo half" of the vocabulary came back to life.** `HASTE` on `ally-all` from one
   carrier is worth 1.15 and `STUN` on `enemy-all` 0.98, where chapter 22 read the entire tempo
   vocabulary at 0.03 to 0.07 of five. Meanwhile `SUNDER`, `GUARD`, `CHAINBOND`, `ROOTBOUND` and
   `OATHSHIELD` are all inside the noise at **−0.05** — the taunt reading is chapter 20's negative
   sign, still there at a rung and eighty levels higher.

### ⚠️ Three things chapter 25's boards found that its control did not

1. ⚠️ **A final that fails at every stat line is its escort — chapter 19's signature, reproduced
   exactly.** Behind `QUICKLIME_SERJEANT` (1000/52 at haste 144) the boss read **0% at every stat
   line from 1000/26 down to 340/10**. Behind two `LASTFEW_WARDEN` the identical body grades 4.00 /
   3.67 / 1.65 / 0.00 across 430/14, 540/18, 700/22 and 1000/26. **Check the control can move before
   concluding anything from a boss sweep.**
2. ⚠️ **The lieutenant was settled on all five appearances, not the first.** At 900/30 it graded 5.00
   / 5.00 / 4.83 / 3.52 / **0.05** across s10 to s50 — chapter 17's trap, an `ascended` block
   climbing at 1.024 against a party frozen at its rung's cap. At **420/18** it reads 5.00 / 5.00 /
   5.00 / 4.00 / 4.00.
3. ⚠️ **Calibrating the control first is what made the first authored draft nearly clean.** Chapter
   17's first draft failed 22 of 50 boards and chapter 19's 21 of 50; this chapter's failed **1 of
   60**, and the twelve boards that had to move were moved by the **mechanical claim check** (two
   `enemy-back` turns on one board, two board-wide turns on one board) rather than by the sweep.
   **Run the claim check before the sweep, not after it** — it is seconds against minutes, and it
   catches a different class of thing.

### ⚠️ Chapter 26 is the first chapter with no rung question left, and the seam is degenerate forever

The Roughcast closes at **635** and stays on **`ascended`**. Against chapter 25's seam of 4.8443,
`ascended` reads **2.5971** (|Δln| **0.6234**) and `ascended-1` **33.2031** (|Δln| **1.9248**) — the
rule prefers staying put by **1.30 nats**, the widest margin any chapter has had, and there is
nothing to override toward.

1. ⚠️ **The rung question no longer has a tuning answer, which chapter 25 predicted and this is the
   first chapter to live in.** `ascended` caps at 500 and `ascended-1` at 600, which the ladder
   passed at chapter 25 itself. **Every further chapter is pure squeeze**: thirty levels of board
   against a party that cannot move, ×1.8654 a chapter, forever. A chapter that cannot be authored
   on `ascended` is a `data/` question about `LEVEL_CURVE.caps`, not a chapter.
2. ⚠️ **The degenerate stretch that re-formed here can never end**, which is new. The four before it
   were each closed by a rung move; nothing can close this one, so the chain deepens a link a chapter
   from now on. **Do not read a fifth or sixth identical link as a bug.**
3. ⚠️ **What a degenerate seam buys is the only case where a price table transfers**, and chapter 26
   is where that was used deliberately rather than noted. The party is literally unchanged, so equal
   absolute weight is equal difficulty and chapter 25's table holds at **0.536×** the
   common-equivalent figure. Spot-check it; do not assume it.
4. ⚠️ **The pool was not a wall and there was no argument to have.** Fielded as ordinary bodies
   beside four light escorts at level 635, **246 of 378 shipped blocks stand**, across all seven
   factions and 47 of them Monster. Budget the normal ten blocks.
5. ⚠️ **The board budget falls even though the levels climb.** Refielded, chapter 25's own final
   reads 100% with 3.95 of five at 605 and **0% at 615**; its mid board reads 100% / 5.00 at 605 and
   **40% / 0.82** at 635. So chapter 26's boards run **3,174 to 5,089 common-equivalent** against The
   Thinground's 3,180 to 8,616, on new blocks of **300 to 1,100 health and 13 to 34 attack** against
   420 to 1,350 and 16 to 58. **Convert the attack as well as the weight**, which is chapter 23's
   rule; at this seam both convert by the same 0.536.

### ⚠️ What chapter 26 measured, and the axis that is the same stat as chapter 23's from the other side

Priced against one calibrated control — an `ascended` anchor of 300/14 behind four bodies of 620/34,
each carrying one ordinary turn, at level 620 and Relic 100: **4,335 common-equivalent, reading 4.28
of five at 13.2s**, and it **moves** (3.95 at escort attack 34, 2.25 at 38, 0.72 at 40). Zero
timeouts on every row.

| shape                                      | survivors   | worth           | mean fight   |
| ------------------------------------------ | ----------- | --------------- | ------------ |
| `critChance` 0.12 → 0.45 across five       | 3.02 → 0.00 | 0.20 → **3.23** | 22.9 → 40.3s |
| `dodge` 0.04 → 0.28 across five            | 3.05 → 0.30 | 0.18 → 2.93     | 24.4 → 39.3s |
| `critDamageAmp` 1.15 across five           | 2.92        | 0.30            | 23.2s        |
| `insight` 0.32 across five                 | 3.13        | 0.10            | 23.1s        |
| `accuracy` 1.25 across five                | 3.20        | 0.02            | 22.7s        |
| `magicPierce` 0.40 across five             | 3.23        | **0.00**        | 23.1s        |
| `energyRegen` 7 across five                | 3.27        | **−0.05**       | 23.0s        |
| `attackSpeed` 60 / `haste` 120 across five | 0.00        | total wipe      | 19.7 / 29.2s |

1. ⚠️ **`critChance` grades in both dimensions**: 0.20 / 0.60 / 0.88 / 1.13 / 1.80 / 1.95 / 2.45 /
   2.65 / 3.23 across 0.12 → 0.45, and 0.02 / 0.08 / 0.25 / 0.65 / 1.18 / 1.78 by carrier count at
   0.28. **When every other reading is a cliff, look for the one stat that grades** has now found
   four chapters running — `lifeLeech` at 21, `tenacity` at 24, `physicalPierce` at 25, this.
2. ⚠️ **The licence is the register read from the _party's_ side, and it is chapter 23 inverted.**
   That chapter priced complete crit _denial_ at 0.88 of one member because only two of the
   calibrated five carry crit worth denying. The same five carry `critBlock` **Σ0.05**,
   `critDamageResist` **Σ0.15** and `tenacity` **Σ0.00**, so the identical stat that saturated as a
   lock grades as a threat. **Two chapters may share a stat name without sharing the argument — say
   which side of the board you measured.**
3. ⚠️ **`insight` is not a crit stat, and reading `damage.ts` rather than the stat names is what
   caught it.** `statusChance` computes `authored + insight − tenacity`, so `insight` is the
   offensive mirror of chapter 24's axis and says nothing about a critical hit; on a board carrying no
   hostile status it is worth 0.10. `magicPierce` is worth **exactly 0.00** for the neighbouring
   reason: a pierce only opens the defence its own damage type is checked against, and these boards
   deal physical damage. **That is the third and fourth time reading the formula has settled a
   shortlist.**
4. ⚠️ **`critChance` is the rare axis the difficulty probe _can_ see**, because it is throughput
   rather than refusal. Chapter 24 lost a band opener to a probe that could not see its `tenacity`
   lock; nothing here needed that repair for the same reason.
5. ⚠️ **A universal stat makes the counts-not-absolutes rule mandatory rather than advisable.**
   `critChance` sits on **378 of 378** blocks, so no band claim can be about presence at all. State
   bodies per board at a threshold — and state the register you measured **against**: shipping ten
   new blocks took the pool to 388, the p90 from 0.15 to 0.16 and the Monster ceiling from 0.18 to
   0.28.

### ⚠️ Three things chapter 26's boards found that its control did not

1. ⚠️ **Two heavy bodies in one front rank is chapter 19's failure and it now has a campaign
   instance.** A first pass put the heaviest two of every board in front: `c26-s51` read 95% / 3.15
   and `c26-s54` read **8% / 0.20** — and **removing any single body from either fixed it**, which is
   the tell that the arrangement is the fault rather than a block. Moving the second-heaviest body
   back took both to 100% / 4.00. ⚠️ **But the swap is not a rule**: applied to all sixty it broke
   `c26-s58` (63% / 1.50) and the final (**0%**). **The rank each body takes is per-board tuning** —
   the Demon fifth hundred's finding, arriving on a chapter — and it was settled by measuring every
   arrangement of every board.
2. ⚠️ **The 25% quota can fail on the _denominator_ while every block is right, and that is a shape
   no earlier chapter recorded.** The first authored pass fielded **47** distinct archetypes against
   chapter 25's 33, which put eight new blocks at **17.8%**. Nothing about the blocks was wrong and
   no board had to move: trimming the returning roster to sixteen Monster and six Dwarf took the
   chapter to **26.7%**. **The quota constrains how many _different_ things a chapter fields, not how
   much of it is new** — so decide the returning roster size before authoring boards, not after.
3. ⚠️ **When the survivor metric plateaus, fight length is the only thing left that separates the
   final from an ordinary board.** Behind its shipped escort the boss grades 4.00 / 4.00 / 4.00 /
   4.00 / 3.95 / **0.42** across 240/9 → 560/22 — four rows the metric cannot tell apart and then a
   cliff. It ships at 340/13 reading 4.00 at **37.2s** against a next-longest of 29.1s. **Quote the
   seconds when the survivors saturate**, and check the escort moves it: held at 340/13, a heavier
   escort reads **0%** and four light bodies read 4.03.

### ⚠️ Chapter 27 is the second chapter with no rung question, and the first whose lean carries none of its axis

The Looseline closes at **665** and stays on **`ascended`**. Against chapter 26's seam of 2.5971,
`ascended` reads **1.3922** (|Δln| **0.6235**) and `ascended-1` **17.7995** (|Δln| **1.9248**) — the
rule prefers staying put by 1.30 nats, which is the same margin chapter 26 read and for the same
reason. **The rung question is over; there is nothing to override toward.**

1. ⚠️ **The degenerate stretch reaches three links, exactly as chapter 26 predicted, and it will keep
   going.** `THINGROUND`, `ROUGHCAST` and `INVESTED` are one set of five on `ascended`'s cap of 500.
   **Expect a fourth at chapter 28 and do not read it as a bug** — the four earlier stretches were
   each closed by a rung move and this one has no rung to move to.
2. ⚠️ **The board budget falls again on the same arithmetic.** Refielded, chapter 26's mid board reads
   100% with 4.00 of five at 635 and **0% at 650**; its final reads 100% / 4.00 at 635 and **33% /
   1.07** at 645. So chapter 27's boards run **1,897 to 2,808 common-equivalent** against The
   Roughcast's 3,174 to 5,089, on new blocks of **85 to 620 health and 4 to 19 attack** against 300 to
   1,100 and 13 to 34. The 0.536× transfer holds on both halves for the second seam running.
3. ⚠️ **The pool is still not a wall, and the wall is now the _attack_ rather than the weight.**
   Fielded beside four light escorts, **284 of 388 shipped blocks stand at level 635 and 150 at 665**,
   across all seven factions. Every board that failed in tuning failed at **172 to 212
   common-equivalent attack** and every fix was an attack cut — never a weight cut. Chapter 23's rule,
   now the only one that binds.
4. ⚠️ **The lean carries none of the axis, which is a first for a chapter.** `dodge` sat on 33 of 388
   shipped blocks and **0 of the 54 Human blocks** carried a point of it; Elves carry 16 of the 33.
   That is the Demon fifth hundred's "an empty register is a licence to measure, not to author"
   arriving on a chapter, and what turns it into a licence is the measurement below plus a structure
   the boards can carry: the six returning Elf blocks supply the **shipped** register (0.14, 0.18,
   0.20, 0.24, 0.26, 0.30) and the ten new Human blocks interleave with it from 0.10 to 0.34.

### ⚠️ What chapter 27 measured, and the stat it had to author _below_ its own register

Priced against one calibrated control — an `ascended` anchor of 160/6 behind four `legendary` bodies
of 240/16, each carrying one ordinary turn, at level 650 and Relic 100: **3,563 common-equivalent,
reading 3.80 of five at 30.1s**, and it **moves** (4.00 at escort attack 14, 0.80 at 18). Zero
timeouts on every row.

| shape                                 | survivors   | worth           | mean fight   |
| ------------------------------------- | ----------- | --------------- | ------------ |
| `dodge` 0.04 → 0.30 across five       | 3.80 → 0.30 | 0.00 → **3.50** | 30.6 → 50.2s |
| `physicalResist` 0.10 → 0.40          | 3.08 → 0.00 | 0.75 → 3.83     | 34.0 → 51.5s |
| `attackSpeed` 10 → 55 across five     | 3.02 → 0.00 | 0.77 → 3.80     | 30.6 → 36.1s |
| `magicResist` 0.20 → 0.60 across five | 3.48 → 1.13 | 0.32 → 2.67     | 32.0 → 51.7s |
| `def` 40 / 55 across five             | 1.90 / 0.00 | 1.93 / 3.83     | 41.3 / 53.5s |
| `critDamageAmp` 1.15 across five      | 3.45        | 0.35            | 30.2s        |
| `accuracy` 1.25 across five           | 3.80        | **0.03**        | 30.0s        |

1. ⚠️ **The register check has a seventh answer, and it is the sharpest instance of the sixth.**
   Chapter 17 found a stat that works only _below_ its register; this is a whole chapter that has to
   be authored there. `dodge` ships at a median of 0.22, a p90 of 0.30 and a **ceiling of 0.55**
   ({@link SHADE}, authored for chapter 3, at enemy level 15–30), and a board-wide 0.40 is a total
   wipe at chapter 27's weight. The chapter runs 0.10 to 0.30 with its boss at 0.34 and **never
   approaches its own shipped ceiling**. **A register set at low levels against parties that could
   still buy the answer does not transfer up the ladder** — state which side of the register a band
   landed on, and say what the register was measured at.
2. ⚠️ **The licence is `damage.ts` rather than the stat names, for the fifth time.** `hitChance` is
   `clamp(attacker.accuracy − defender.dodge, minHitChance, 1)`, and the five that arrive carry
   `dodge` **Σ0.00** and `accuracy` **1.10 on one member with the other four at the default 1.00**.
   The mirror stat proves it: enemy `accuracy` at the pool ceiling of 1.25 is worth **0.03**, because
   a party with no evasion has nothing for an accuracy stat to beat. `magicResist` was disqualified
   the same way — **one** of the five deals magical damage, which is why it needs the pool ceiling of
   0.60 to be worth 2.67 where `dodge` is worth 3.17 at 0.26.
3. ⚠️ **Chapter 8 built the Sunless Weald on this stat and that is the argument rather than an
   objection.** The Weald taught a party at levels 125–150 that accuracy answers a dodge pool; this is
   the same stat five hundred levels later against a party that never bought the answer. **Two
   chapters may share a stat without sharing the argument** — chapter 26's rule, and the second
   chapter running to need it. `physicalResist` grades just as well here and was declined on
   ownership: chapter 23 already states its band counts at 0.12.
4. ⚠️ **A dodge bills what is _aimed at_, so the rank a carrier stands in is a priced dial.** Measured
   on **one** body — chapter 22's rule — a single carrier is worth **3.25 in the front rank against
   3.70 in the back** at 0.22, 3.15 against 3.80 at 0.30 and **2.17 against 3.17 at 0.40**: a spread
   that grows with the value, 0.45 → 0.65 → 1.00 of a survivor. That is `THORNMAIL`'s "only bills what
   is struck" wearing the party's **aim** instead of its damage, and the opposite sign to chapter 16's
   unreachable debuffer.

### ⚠️ Three things chapter 27's boards found that its control did not

1. ⚠️ **The carriers a chapter most wants at the top are the ones it can least afford, and this is
   what breaks the monotone-thinning texture.** A shipped `dodge` carrier is a light body with a hot
   attack — the six returning Elf blocks run **40 to 58** common-equivalent attack where the chapter's
   own new commons run **15 to 19** — so a closing band already carrying three of this chapter's
   legendaries has no attack budget for one. `c27-s47` read **40%** at 172 common-equivalent attack
   and 100% / 4.00 at 129 with a single body swapped. **That is why the Elf texture runs 5, 7, 8, 7,
   3, 2 rather than thinning monotonically**; the shape is a budget, not a fiction.
2. ⚠️ **The clock is the ceiling on a refusal chapter, and the guard that binds lives in a file the
   session never opened.** A dodge pool lengthens a fight by construction: the control walks 30.6s →
   50.2s across the axis, and the final at 150/6 reads 100% with 3.58 of five and a **longest single
   fight of 81.4s** — inside the 90s timer and past the 72s bar `chapters.balance.ts` holds cleared
   fights to. ⚠️ **`signature.balance.ts` is stricter than either**, because it bisects a
   five-of-one-character party to its own **edge**, which is where a fight is longest: a draft of the
   final put Vurn Runewright at a maxed item on a victory at **exactly tick 900**, and chapter 26's
   own final already reads **897** there — the headroom was gone before this chapter touched it.
   ⚠️ **Lowering the boss's `dodge` moved that reading not at all** (0.34, 0.30 and 0.28 all read
   900); **lightening the board is what moved it**. **Run `signature.balance.ts` before the full sweep
   when a chapter's axis is refusal** — the campaign sweep cannot see this, and the whole file is two
   minutes against the sweep's half hour.
3. ⚠️ **The final's stat line is a five-row plateau the survivor metric cannot read, and its own axis
   is worth nothing on it.** Behind its shipped escort the boss grades **4.00 / 4.00 / 4.00 / 4.00 /
   4.00 / 3.70 / 3.58 / 0.70** across 85/4 → 175/7 while the fight walks 31.2s → 44.5s, and its
   `dodge` at 0.26, 0.30, 0.34 and 0.40 reads 100% / 4.00 at every value, buying 34.7s, 35.6s, 36.6s
   and 38.5s and nothing else. The escort is what moves it: held at 115/5, a heavier escort reads
   **0%**, four light bodies read **20%** and an escort carrying the axis reads **0%**. **Quote the
   seconds when the survivors saturate**, and expect a chapter's own axis to be the boss's identity
   rather than its difficulty.

### ⚠️ Chapter 28 is the third chapter with no rung question, and the first whose lean owns its whole axis and can field none of it

The Windthrow closes at **695** and stays on **`ascended`**. Against chapter 27's seam of 1.3922,
`ascended` reads **0.7463** (|Δln| **0.6235**) and `ascended-1` **9.5419** (|Δln| **1.9248**) — the
rule prefers staying put by 1.30 nats, which is the **identical** margin chapters 26 and 27 both
read. **Three chapters on one figure is what "no tuning answer" looks like once it is a constant;
stop re-deriving it and record the number.**

1. ⚠️ **The degenerate stretch reaches four links, exactly as chapter 27 predicted.** `THINGROUND`,
   `ROUGHCAST`, `LOOSELINE` and `INVESTED` are one set of five on `ascended`'s cap of 500 — level
   with the deepest stretch the campaign has ever had, and the first that cannot be closed.
   **Expect a fifth at chapter 29.**
2. ⚠️ **The board budget falls again on the same arithmetic, and the whole of chapter 27 refields
   as a cliff between 665 and 680.** Every one of `c27-s1`, `c27-s15`, `c27-s30`, `c27-s45`,
   `c27-s59` and `c27-s60` reads 100% at **665** and **0% at 680** — six boards, one threshold,
   fifteen levels wide. Chapter 28's ten new blocks run **54 to 480 authored health and 2 to 15
   attack** against chapter 27's 85 to 620 and 4 to 19.
3. ⚠️ **The pool is still not a wall.** Fielded beside four light escorts, **159 of 408 shipped
   blocks stand at level 665, 141 at 680 and 52 at 695**, across all seven factions. ⚠️ **The
   non-lean texture was chosen on that tail rather than on the fiction**: at 695 Monster supplies
   **18 of the 52** against Elf's 5, Undead's 11, Human's 8 and Dwarf's 7. **Field the pool at the
   chapter's _close_, not at its open — the two counts differ by a factor of three.**
4. ⚠️ **The lean owns the entire shipped register of the axis and cannot afford one body of it,
   which is the exact inverse of chapter 27.** `attackSpeed` sat on **4 of 398** blocks at 55, 70,
   80 and 110 and **all four are Elf**; the lightest is 1,166 common-equivalent at level 665 against
   a whole board's budget of about 2,000, so **not one of them stands on any board in the chapter**.
   Chapter 27's lean carried none of its axis and its texture supplied the register; this one owns
   all of it and fields none. **Owning a register is not the same as being able to use it.**

### ⚠️ What chapter 28 measured, and the first axis that grades in two dimensions

Priced against one calibrated control — an `ascended` anchor of 90/3 behind four `legendary` bodies
of 150/7.5, each carrying one ordinary turn, at level 680 and Relic 100: **2,286 common-equivalent,
reading 3.98 of five at 38.1s**, and it **moves** (4.00 at escort attack 7, 2.52 at 8, 0.38 at 8.5).
Zero timeouts on every row.

| shape                                | survivors          | worth              | mean fight          |
| ------------------------------------ | ------------------ | ------------------ | ------------------- |
| `attackSpeed` 4 → 36 across five     | 3.75 → 0.07        | 0.23 → **3.90**    | 38.8 → 54.0s        |
| `haste` 100 → 124 across five        | 3.77 → 0.00        | 0.20 → 3.98        | 38.3 → 41.0s        |
| `def` 30 / 46 / 70 across five       | 0.13 / 0.00 / 0.00 | 3.88 / 3.98 / 3.98 | 59.4 / 48.0 / 46.5s |
| `physicalResist` 0.18 / 0.40         | 3.00 / 0.10        | 1.00 / 3.90        | 46.1 / 59.5s        |
| `magicResist` 0.60 (pool max)        | 1.15               | 2.85               | 56.7s               |
| `critChance` 0.30 (pool max)         | 1.07               | 2.92               | 52.6s               |
| `critBlock` 0.34 (pool max)          | 3.35               | 0.65               | 45.4s               |
| `magicPierce` 0.40 / `accuracy` 1.25 | 3.95 / 3.92        | **0.05 / 0.08**    | 38.5 / 38.6s        |

1. ⚠️ **It is the first axis in the campaign to grade in _both_ value and carrier count, and a
   six-band chapter is exactly what needs that.** By value across five it reads 0.23 / 0.40 / 0.90 /
   1.15 / 2.13 / 2.88 / 3.42 / 3.58 / 3.90 over 4 → 36; by carrier count it grades at every value a
   board actually uses — 3.92 / 3.88 / 3.02 / 2.10 / 1.38 at zero through five carriers at 20, and
   3.98 / 3.65 / 2.95 / 1.57 / 1.00 at 24. Zero timeouts anywhere. **Earlier chapters had to pick
   one dial and ration the other; this one has two and spends them independently.**
2. ⚠️ **The licence is `simulate.ts` rather than the stat names, for the sixth time, and the
   cooldown is half the mechanic.** `attackSpeed` accrues **only when a combatant's last action was
   a basic attack**, so a body that casts rarely swings often. Every new block here carries a
   cooldown of **58 to 68** for that reason. **A short cooldown on an `attackSpeed` carrier switches
   its own axis off** — which is why this is not chapter 17's `haste` wearing a new name even though
   the two grade alike against this control.
3. ⚠️ **`haste` and `physicalResist` were declined on ownership and `def` on the clock.** `def` 30
   buys twenty-one seconds of fight for its 3.88, `physicalResist` 0.40 buys twenty-one for 3.90 and
   `magicResist` 0.60 nineteen for 2.85, where `attackSpeed` buys **five** across the usable half of
   its range. Chapter 27 shipped with `signature.balance.ts` reading **897 of 900** ticks, so a
   fight-lengthening axis had nothing to spend. **When the clock guard is already at its edge, the
   axis is chosen on seconds before it is chosen on survivors.**
4. ⚠️ **An enemy `ultimate` is a real axis and a design reversal, and a content session may not take
   it.** **0 of 398** blocks carries one and `docs/combat.md` records that as a decision — "energy is
   a character system… an encounter is read as a rhythm instead". Measured anyway at this control, a
   single-target ultimate grades 0.50 / 1.27 / 2.53 / 3.75 across power 1.2 → 1.9 and 3.92 / 3.23 /
   1.50 / 0.15 across one to four carriers at power 2.2 — narrower than the axis taken, and not a
   chapter's call. ⚠️ **It also found three dead keys**: `energyRegen` sits on
   {@link DRUMMING_SHOAL}, {@link PACKCALL_WHISTLER} and {@link SALTBLEACH_CRIER}, none of which has
   an ultimate, so all three fill a bar nothing can spend. Left in place and recorded rather than
   deleted, because deleting one is a behaviour change to three shipped blocks nobody measured
   without it.

### ⚠️ Six things chapter 28's boards found that its control did not

1. ⚠️ **Common-equivalent attack is blind to the gear archetype, and at Relic 100 that is worth a
   factor of 1.5 — this is the scalar that finally ranked the boards.** `GEAR_PROFILES` pays `tank`
   **+46%** attack, `brawler` **+89%**, `ranger` **+112%** and `mage` **+120%**, so a body authored
   at 26 attack in a `mage` set bills **57** where one at 24 in a `tank` set bills **35**. Weighted
   that way and scaled by `perLevel.common ** (level − open)`, every board that failed in tuning
   failed between **246 and 364**, and every fix was an attack cut; unweighted the same boards do
   not separate at all (a passing board at 155 sits beside a failing one at 143). **Weight the
   attack budget by archetype before comparing two boards — and it is a shortlist, not a predictor:
   two boards at 155 and 165 still read 4.00 and 0.63.**
2. ⚠️ **A chapter can be able to afford its own premise and unable to afford an ordinary body.**
   `c28-s57` carries **five** carriers summing 56 points of `attackSpeed` at 127 gear-weighted
   attack and reads 100% with 4.00 of five; a draft at three carriers summing 41 at **173** read 42%
   with 0.63. The axis is cheap and the raw attack is the wall — chapter 23's attack wall with the
   chapter's own mechanic on the safe side of it. **Do not assume the axis is what a board cannot
   afford; measure which of the two is binding.**
3. ⚠️ **A carrier is worth more in the _back_ rank than in front, which is the opposite sign to
   chapter 27's dodge on the same measurement.** Measured on **one** body at chapter 28's control, a
   lone carrier at 40 is worth **0.00 of five in the front rank and 0.77 in the back**, because a
   body the party cannot aim at is a body that keeps swinging. A dodge bills what is _aimed at_;
   this bills what is _left alive_. **Two consecutive chapters priced the rank of a lone carrier and
   got opposite signs — carry the measurement, never the precedent.**
4. ⚠️ **The final is settled by its escort's _arrangement_, and swapping which escort body stands in
   front flips the board.** Held at 58/2, `THE_WINDTHROW` reads 100% with **3.85 of five at 48.9s**
   behind its shipped escort; putting the other escort body in the front rank reads **0%**, a heavier
   escort reads **0%**, a _cooler_ one reads 3.58 at a longest fight of **74.5s**, and an escort
   carrying no axis at all reads **57%**. Its own attack is the other half: 58/2 reads 3.85 where
   **58/3 reads 0%**. ⚠️ **And its `attackSpeed` buys clock rather than difficulty**: 8 through 34
   reads 3.75 / 3.60 / **3.85** / 3.48 / 3.40, no order at all, while the longest fight runs 73.6s,
   67.5s, **57.2s**, 73.6s and 74.5s — **the shipped value is the one inside the bar, not the
   hardest.** **Expect a boss's axis to be its identity and its escort to be its difficulty**, which
   is chapter 27's finding with the rank of a single escort body added to it.
5. ⚠️ **`signature.balance.ts` binds a chapter's final now, and it is chaotic rather than monotone in
   the boss's weight.** That file bisects a five-of-one-character party against the ladder's
   **highest-level** board — which is always the newest chapter's final — and chapter 28's at boss
   weight 62 put Vurn Runewright at a maxed item on a victory at **exactly tick 900**. 58 reads the
   standing **897** chapter 26's final set; 54 reads 900 again, 50 reads 900 and 46 reads 897.
   **Do not interpolate — check the weight you are shipping.** ⚠️ **And the other repair costs the
   board**: removing the escort's one heavy tank also fixes the clock and every replacement for it
   read 0% to 18% on the campaign sweep, because the board is held together by one cold, bulky body.
   **Run that file on the candidate final before the full sweep.**
6. ⚠️ **`battleSeed` hashes `stage.id`, so a probe that renames a board measures a different forty
   fights — and chapter 28 is where that cost a full sweep.** A tuning pass under prefixed ids read
   every board at 100% with a longest fight of **55.9s**; the same boards under their shipped ids read
   `c28-s60` at **95% and 73.6s**, past the 72s bar, and `c28-s19` at 93%. The boards were identical.
   **Name a probe's stages exactly as they will ship**, and re-run the whole sweep against the
   resolved ladder before believing any of it — `resolveLadder(CHAPTERS, CHAPTER_CURVE, …)` and the
   real ids, not a synthetic encounter.

### ⚠️ Chapter 29 is the chapter where the stat vocabulary ran out, and the last unspent stat is `def`

The Overburden closes at **725** and stays on **`ascended`**. Against chapter 28's seam of 0.7463,
`ascended` reads **0.4001** (|Δln| **0.6235**) and `ascended-1` **5.1152** (|Δln| **1.9248**) — the
rule prefers staying put by **1.30 nats**, the identical margin chapters 26, 27 and 28 all read.
**Four chapters on one figure. It is `1.6 / perLevel.common ** 100` and it will not move; quote it.**

1. ⚠️ **The stat block is spent, and this is the chapter that says so.** Chapter 23 took all four
   mitigation stats at once — `critBlock`, `critDamageResist`, `physicalResist`, `magicResist` —
   then 24 `tenacity`, 25 `physicalPierce`, 26 enemy `critChance`, 27 `dodge`, 28 `attackSpeed`.
   What was left that both grades and belongs to nobody is **`def`**, which has been measured five
   times across fifteen chapters and never been a premise. Everything else reads **0.00**
   (`accuracy`, `magicPierce`), is disqualified by the formula (`insight`), is a forbidden shape
   (`recovery`, `healthRegen`, `receivedHealing`), or is a design reversal (an enemy `ultimate`).
   **A chapter 30 has no unspent stat at all**; see the note below on what is actually left.
2. ⚠️ **`def` grades in _value_ and not in carrier count, which is the exact inverse of chapter 28
   and generalises.** Against a control of an `ascended` 26/1.4 behind four `legendary` 44/4.0 at
   level 710 and Relic 100, reading 3.98 of five at 36.4s: by value it reads **0.02 / 0.10 / 0.58 /
   0.73 / 1.20 / 1.73 / 2.23 / 3.13 / 3.60** across 17 → 28, nine monotone steps with zero timeouts;
   by carrier count at 26 it reads **0.00 / 0.06 / 0.10 / 0.10 / 1.70 / 2.96**, flat through the
   middle and a cliff at the end. That is the survivors metric saturating, and the rule it yields is
   **a defensive stat grades in value and an offensive one grades in carrier count** — which is why
   `attackSpeed` could be a dial in two dimensions and this cannot. A six-band chapter on a defensive
   axis moves value and count together and lets the board weight carry the rest.
3. ⚠️ **Armour on a heavy body is the ninety-second clock, which inverts the lean's own idiom.**
   Four light escorts at `def` 34 are worth **3.01 of five**; one heavy anchor at `def` 80 is worth
   2.74 at a 68.3s longest fight; and an anchor carrying both weight and armour (hp 78, `def` 44)
   runs **88.5s** — a timeout, scored a defeat. **The faction that owns the tankiest blocks in the
   game is the one whose chapter may not stack them.** Every board here keeps the axis on the light
   bodies, and the chapter's longest fight is 66.6s.
4. ⚠️ **A lone `def` carrier is rank-neutral, which is the third answer in three chapters and the
   first that is _no answer at all_.** Carried on **one** body and moved between ranks it reads
   **0.00 of five in front and 0.01 in the back** at 22, 30, 40 _and_ 55, where chapter 27's `dodge`
   read 3.25 against 3.70 and chapter 28's `attackSpeed` 0.00 against 0.77. A dodge bills what is
   _aimed at_, an `attackSpeed` bills what is _left alive_, and `def` bills every blow that reaches
   the body whenever it arrives. **Rank was most of the remaining tuning in the last two chapters and
   is not a dial here at all — check, do not assume it is one.**
5. ⚠️ **`def` carries the tier premium, so the band table has to be stated in common-equivalent
   terms or it is not monotone.** At level 710 a `legendary` block is worth ×2.835 of a `common` one
   and an `ascended` ×8.03, so an authored 32 on a common and an authored 30 on a legendary are 32
   and **86** on a board. Reading the authored column alone says the closing band steps _down_ from
   band 3. **Convert `def` before comparing two bodies, exactly as with weight** — this is the first
   chapter where the conversion applies to the axis itself rather than to the budget.
6. ⚠️ **The two balance files disagreed about which escort body matters, and only running both
   found it.** Every legal escort arrangement of the final reads **4.00 of five at 62–68s** on
   `chapters.balance.ts`; `signature.balance.ts` reads the same swaps as 0.9892 to **0.9964** on
   Seraphine's rung-20-to-30 step against a 0.995 tolerance, and exactly one arrangement passes.
   ⚠️ **And the assertion that bound was not the clock.** The ninety-second guard passed on the first
   draft at 898 of 900; what failed was _"never makes a character reach meaningfully less far as the
   item is levelled"_, because Seraphine's capstone unconditions an `ally-all` heal and trades damage
   threshold for sustain at exactly the edge that file measures. **Run that file on the candidate
   final, and do not assume the assertion that binds is the timer.**
7. ⚠️ **The pool wall is on _attack_ and the lean's own cold tail is five blocks wide.** Fielded
   beside four light escorts, **154 of 408 shipped blocks stand at level 695, 110 at 710 and 53 at
   725**. Of the Dwarf blocks that stand at 725, exactly **five** are cold enough for an ordinary
   board — 39 to 45 gear-weighted common-equivalent attack — and every other affordable Dwarf block
   sits at **62 or above** and can only ever anchor a board alone. That is what set the fielded
   roster at 27 against chapter 28's 32 and the quota at 32.0% rather than 26.7%. **Chapter 17's
   situation, one rung and twelve chapters later.**
8. ⚠️ **The refield cliff is ten levels wide, down from chapter 28's fifteen.** `c28-s60` reads
   100% with 3.85 of five at **695** and **0% at 705**; `c28-s1` and `c28-s30` read 0% at 695. **The
   whole chapter below refields as a cliff inside this chapter's first ten stages**, and the cliff
   narrows by five levels a chapter.
9. ⚠️ **A refusal chapter's first authored pass is too _cold_, and only the difficulty probe says
   so.** Chapter 29's first pass read every board at 100% inside the max bar and still failed the
   probe twice: band 4 opened at **0.680** of band 3's close and the closing third read lighter than
   the opening third. **The probe reads throughput and `def` is invisible to it** — chapter 24's
   finding — so the repair was to re-cut all ten new blocks **hotter and lighter**: health ×0.86 and
   attack ×1.14 on the bodies that stand beside a returning anchor, ×0.76 and ×1.6 on the late-band
   legendaries that stand alone. That raised the probe **and** shortened every fight. **On a refusal
   axis weight and heat move in opposite directions, and the probe is the only instrument that sees
   which one is short.**

### ⚠️ What chapter 29 leaves for chapter 30, and it is not a stat

Three things a chapter-30 session should read before shortlisting anything.

- ⚠️ **There is no unspent stat left.** The honest options are a **pairing** taken on
  super-additivity (the Human-Tower-fifth-hundred and Monster-Tower-fourth-hundred shape), or a
  spent axis re-taken **from the other side of the board** (chapter 26 did this to chapter 23's
  crit). Measured at chapter 29's control, the strongest pairing available is `critChance` 0.28 ×
  `critDamageAmp` 1.15 — **1.40 and 0.05 alone, 3.90 together**, and the cheapest thing left on the
  clock at eight seconds against `def`'s twenty-two — but half of it is chapter 26's whole axis.
  `def` 20 + `physicalResist` 0.14 reads **2.38** against 0.73 + 0.48 for the halves.
- ⚠️ **The clock has stopped being a filter and become the budget, and the bar that binds is the
  _mean_ rather than the max.** `chapters.balance.ts` holds every sweep entry to a mean under **60s**
  as well as the longest cleared fight to 0.80 of the timer, and chapter 29's first authored pass met
  the mean bar first — two boards at 60.2s and 64.3s while every max sat comfortably inside 72s. It
  ships at a worst mean of **58.6s** and a worst max of 61.5s, and `signature.balance.ts` sits at
  **897 of 900**. Every remaining defensive candidate buys eleven to twenty-two seconds. **A chapter
  30 on another fight-lengthening axis has nowhere to put it**; the axis has to be chosen on seconds
  first and survivors second, which is chapter 28's rule now binding rather than advising.
- ⚠️ **The level guard is gone and the campaign's ceiling is chapter 38.** `levels.spec.ts`'s
  "leaves rungs unspent above everything the ladder asks for" fired here and was **retired rather
  than slid** — the fifth guard retired this way. The line adds 30 levels a chapter and the caps
  ladder tops out at 1000, so the campaign closes at 995 in chapter 38. Reaching further is a
  `data/` decision about `LEVEL_CURVE.caps` and the ascension ladder behind it, and each +100-level
  rung appended **above** `ascended-5` buys roughly 3.3 chapters. ⚠️ **Appending at the top of
  `RARITIES` is the one insertion that is not a save migration.** What the retirement costs is
  stated in the spec: content whose level demands run away is now unguarded.

### ⚠️ Field the previous chapter's final at the new roof before authoring, exactly as a tower does

The campaign has reached the rule the towers' third hundreds established. Chapter 13's own final
board, refielded against chapter 14's seam party:

| `c13-s50`'s board, refielded | reading                      |
| ---------------------------- | ---------------------------- |
| level 275, Fine 26           | 100% / 5.00 survivors / 9.3s |
| level 285, Fine 40           | 100% / 4.88 / 13.6s          |
| level 290, Fine 47           | 100% / 3.40 / 21.1s          |
| level 295, Fine 54           | **43%** / 1.15 / 33.0s       |
| level 300, Fine 60           | **0%** / 0.00                |

So chapter 14's final is **1480/88 against The Undercut's 1780/99**, and its lieutenant 1400/84
against The Deepcut's 1500/88 — **the first time a chapter final has been authored lighter than the
one before it.** That is the level line doing the work: The Doorstone stands ×1.81 higher on the
growth curve, so it is a bigger body written as a smaller stat block. **Expect to keep coming down.**

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

⚠️ **From chapter 17 the quota stopped being the binding constraint and the pool started being
one.** The Quickmire fields 26 ordinary archetypes of which **15 are new — 57.7%** — because only 13
shipped blocks are light enough to stand on any of its boards and only 5 on its closing ones. The
rule is a floor and is satisfied; what a session needs to budget for is **~15 new ordinary blocks
rather than 8**, and a closing band that fields nothing shipped at all.

⚠️ **Nothing asserts this rule, and chapter 26 is where that cost something.** There is no test in
`data/` that reads the quota — it is a convention held by discipline alone, so a chapter that misses
it ships green. Chapter 26's first authored pass sat at **17.8%** with every block correct and every
board passing the sweep; only the mechanical claim check caught it. **Compute the fraction yourself
before believing a chapter is finished.** A per-chapter assertion is the obvious shape and is **not**
mechanical: the early chapters are 100% new by construction and the re-cut ones would need their own
reading, so it wants a measured pass over all twenty-six rather than a threshold dropped in.
Recorded rather than taken.

⚠️ **The denominator is what the chapter _fields_, not the shipped pool.** Over the whole pool it
compounds to ~90 new blocks across four chapters and puts every per-faction depth guard under
pressure at once; over board slots it is satisfiable by five blocks used heavily. Fielded-distinct
is the reading that means "a quarter of what you meet here is something you have not met".

⚠️ **A geared chapter owes a `gearArchetype` on every block it fields, including the returning
ones, and this is the cost nobody prices in.** `chapters.spec.ts` fails on a geared board fielding a
body that declares none. Only 34 archetypes carried one after The Rustwood, so The Quarry had to add
one to **26** returning blocks before a single board could be authored. Do it first: it is mechanical,
it changes nothing anywhere else (an archetype is a statement about what a body _is_, and gear only
applies where a stage authors it), and discovering it after the boards are written means a red suite
in the middle of tuning. Blocks that carry one but are not fielded on a geared board are legal and
worth leaving in place — they make the next geared chapter cheaper.

⚠️ **Chapter 15 is the first where that cost was near zero, and the reason is worth knowing**: it
leaned Undead, which had **1** of 25 blocks carrying a `gearArchetype`, and the sixteen returning
Undead blocks it fields took sixteen one-line edits. The Dwarf texture cost nothing at all, because
The Shutgate had already paid for it. **The bill lands on whichever faction has not led a geared
chapter yet**, so it is a fact about the lean rather than about the chapter.

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

- **Deepen a thin faction rather than a deep one.** The seven now run demon 33, angel 36, **human 64**,
  undead 67, monster 71, elf 71, **dwarf 76** — chapter 29's ten Dwarf blocks took Dwarf from
  third-thinnest legal to deepest of all seven, so **Human at 64 is the thinnest legal lead** for the
  third chapter running, with Undead at 67 behind it. ⚠️ **Chapter 29 was decided by the rotation
  against the counts, which is the fourth time the depth argument has been overruled**: Human was
  thinnest by two blocks and was passed over because it led chapter 27, and the leads have run
  undead, monster, human, elf, dwarf since chapter 20 in a clean five-cycle that puts Dwarf at 29.
  ⚠️ **The axis was the tiebreak and it should be**: Dwarf owns the shipped `def` ceiling at 70
  against Undead's 62, Demon's 58 and 54 for the remaining four. ⚠️ **Dwarf's leads are perfectly
  periodic — chapters 9, 14, 19, 24, 29** — which is worth knowing because it makes the rotation
  checkable rather than remembered. The reading before chapter 29: demon 33, angel 36, **human 64**,
  dwarf 66, undead 67, monster 71, elf 71 — chapter 28's ten Elf blocks took Elf from thinnest legal
  to joint-deepest, so **Human at 64 is the thinnest legal lead**, with Dwarf at 66 and Undead at 67
  behind it. ⚠️ **The leads have run undead, monster, human, elf, dwarf, undead, monster, human, elf
  since chapter 20 — a clean five-cycle for nine chapters — so the rotation says Dwarf at chapter 29
  where the counts say Human.** Human led chapter 27, two chapters back, which is what overruled the
  counts at chapters 25 and 26; **say which argument you used.** The reading before chapter 28: demon
  33, angel 36, **elf 61**,
  human 64, dwarf 66, undead 67, monster 71 — chapter 27's ten Human blocks took Human from thinnest
  legal to fourth-deepest, so **Elf at 61 was the thinnest legal lead**, with Human at 64 and Dwarf at
  66 behind it. ⚠️ **The four mortal factions behind Monster now sit within six of each other, so the
  depth argument has stopped discriminating and the rotation is what is left.** The leads have run
  undead, monster, human, elf, dwarf, undead, monster, human since chapter 20 — a clean five-cycle —
  and chapter 28 is Elf on both readings for the first time in three chapters. ⚠️ **Chapter 27 is the
  first chapter in three where the two arguments agreed**, which is worth saying because chapters 25
  and 26 were both decided by recency against the counts. The reading before it: demon 33, angel 36,
  **human 54**, elf 61, dwarf 66, undead 67, monster 71 — chapter 26's ten Monster blocks took Monster
  from joint-third-deepest to deepest outright, so **Human at 54 was the thinnest legal lead**, with
  Elf at 61 and Dwarf at 66 behind it. ⚠️ **Chapter 26 is the third time the depth argument was overruled,
  and the second running to be overruled by _recency_.** Human was thinnest and was passed over
  because it had led The Downstroke four chapters earlier — its third lead — where Monster had last
  led five chapters back. ⚠️ **And the table in this file was four tower hundreds out of date when
  chapter 26 read it**, still saying angel 24 / demon 25 where the pool held 36 and 33: the five
  tower fifth-hundreds shipped between chapters 25 and 26 moved every celestial count. **Recompute
  before choosing; the table is a record of what a session found, not a current reading.** The
  reading before it: angel 24, demon 25, **human
  46**, elf 53, dwarf 54, undead 59, monster 61 — chapter 25's ten Undead blocks took Undead from
  third-thinnest to second-deepest, so **Human at 46 was the thinnest legal lead**, with Elf at 53 and
  Dwarf at 54 behind it. ⚠️ **Chapter 25 is the second time the depth argument was overruled, and by
  _recency_ rather than by the pool.** Human was thinnest at 46 and was passed over because it had
  led The Downstroke two chapters earlier — its third lead — where Undead had last led five chapters
  back. Chapter 21 was overruled by the budget; this one by the rotation. **Say which argument you
  used, because the counts alone would have picked differently both times.** ⚠️ **A lean is worth ten
  blocks and the mortal five are now spread 46 to 61**, so the ordering is one chapter away from
  reversing again. The reading before it: angel 24, demon 25, dwarf 44,
  **human 46**, undead 49, elf 53, monster 61 — chapter 23's ten Elf blocks took Elf from thinnest
  legal to second-deepest, so **Dwarf at 44 was the thinnest legal lead**, with Human at 46 and Undead
  at 49 behind it. ⚠️ **A lean is worth ten blocks and that is now enough to move a faction across
  the whole ordering in one session**, for the ninth time. The reading before it: angel 24, demon 25,
  elf 43, dwarf 44, **human 46**, undead 49, monster 61 — chapter 22's ten Human blocks took Human
  off the thinnest legal slot, so **Elf at 43 was the thinnest legal lead** and the four mortal
  factions ran 43, 44, 46, 49 within six of each other. The reading before it: angel 24, demon 25, human 36,
  elf 43, dwarf 44, undead 49, **monster 61** — and ⚠️ **chapter 21 is the first time the depth
  argument was overruled outright by the pool.** Monster was already deepest by seven and led again
  anyway, because it is the only faction whose bench is light enough to stand on a board at level 485. **When the budget and the depth argument disagree, the budget wins and the chapter says so.**
  The older reading, kept because the reasoning still applies: angel 24, demon 25, elf 33,
  dwarf 34, undead 35, human 36, **monster 51** — The Quickmire's seventeen blocks took Monster from
  joint-middle to deepest of all seven by a margin of fifteen, which is the **seventh** time a single
  lean has reversed the ordering outright and the sixth in a row. Recompute before choosing.
  - ⚠️ **A lean is now worth seventeen blocks rather than ten**, for the pool reason above, so it
    moves the ordering further and faster than the entries below describe. **Elf at 33 is the
    thinnest legal lead**; angel 24 and demon 25 remain barred.
  - ⚠️ **The thinnest legal lead is now Elf at 33, and the gap to the celestials is enormous.** Angel
    at 24 and Demon at 25 are both barred, and the five mortal factions now run 33, 34, 34, 35, 36 —
    within three of each other. **The depth argument has stopped discriminating between the legal
    leads**, so the next chapter picks on setting and on which faction's idiom fits the question,
    with depth as a tiebreak. The celestials' 24 and 25 remain a tower's problem rather than a
    chapter's.
  - ⚠️ **The bottom of the list is now two celestials deep, so it cannot be read off any more.** Angel
    at 24 and Demon at 25 are the two thinnest and **both are barred from leading a chapter**, so the
    thinnest legal lead is **Human at 26** — eight blocks clear of the bottom. A chapter-16 session
    picking by the counts alone will pick a faction it may not have. The celestials' depth is a
    tower's problem to fix rather than a chapter's.
- ⚠️ **Monster is the one lean that costs the faction matchup nothing, and it is worth knowing before
  picking a heavy one.** `FACTION_MATCHUPS` gives every faction ×1.05 into Monsters and Monsters ×1.05
  into all seven, ×1.10 into themselves — the wildcard row — so a mono-Monster pool still reads
  differently to every party. That is the exact cost The Rustwood's 92% mono-Elf lean paid, and The
  Quarry did not pay it. **No other faction has this property.**
- ⚠️ **Human is the second repeat lead, at chapters 11 and 16, and it paid the gear bill instead.**
  The Standing Line is the Humans as an army holding a line; The Spoilfield is the Humans after every
  army has gone through, making a living off what the armies left. Same faction, no shared fiction,
  and only the seven lightest of its blocks in common — because the weight budget could not afford the
  rest. ⚠️ **The `gearArchetype` bill landed here as predicted**: only 3 of 26 Human blocks carried
  one, so the seven it fields cost six one-line edits before a board could be authored. It was cheap
  only because the budget let it field seven Humans rather than twenty.
- ⚠️ **Elf has now led twice — chapter 8 and chapter 12 — and that is the first repeat lead.** It was
  legal because four chapters after the Sunless Weald, Elf was still the thinnest legal lead at 23.
  What a repeat costs is that the chapter has to be a visibly different **place**: the Weald is the
  Elves at home and The Rustwood is the Elves out on somebody else's battlefield, picking it over.
- **The Overburden is 89.7%**, counted after the boards landed — in family, between The Windthrow's
  89.3% and The Roughcast's 90.0%. Its 31 non-Dwarf slots are all Monster
  and thin monotonically across the bands — **8, 7, 6, 5, 3, 2** — chosen on the **pool** rather
  than the fiction: at level 725 Monster supplies 18 of the 53 blocks that stand against Dwarf's 6.
  ⚠️ **It is Dwarf's fourth lead in a row of five-chapter periods and the overlap with The Nevermark
  is deliberate**: six of that chapter's blocks return, because they are among the five coldest
  Dwarf blocks in the game and nothing else stands at this weight.
- **The Windthrow is 89.3%**, counted after the boards landed — level with The Looseline and between
  The Underroad's 86.4% and The Roughcast's 90.0%. Its 32 non-Elf slots are all Monster and thin
  monotonically across the bands — **9, 7, 6, 5, 3, 2** — which is The Roughcast's shape rather than
  The Looseline's, and it is chosen on the **pool** rather than on the fiction: at level 695 Monster
  supplies 18 of the 52 blocks that stand against Elf's 5. ⚠️ **Elf's fourth lead overlaps its first
  barely at all**, because at this weight only the coldest bodies in the faction stand — the boles,
  brambles and sentries rather than the archers the Sunless Weald was built on.
- **The Looseline is 89.3%**, counted after the boards landed — in family, between The Underroad's
  86.4% and The Roughcast's 90.0%. Its 32 non-Human slots are all Elf and run **5, 7, 8, 7, 3, 2**
  across the bands, which is **not** the monotone thinning The Roughcast and The Spoilfield recorded,
  and the reason is measured rather than narrative: see the chapter-27 section below.
- **The Roughcast is 90.0%**, counted after the boards landed — in family, between The Underroad's
  86.4% and The Rustwood's 92%. Its 30 non-Monster slots are all Dwarf and thin monotonically across
  the bands — **9, 7, 5, 4, 3, 2** — which is The Spoilfield's shape doing a fiction's job: the
  dwarven work the ground would not hold. ⚠️ **A Monster lean is the one that costs the faction
  matchup nothing**, so 90% here buys what 90% of anything else would not.
- **The Spoilfield is 84.0%**, counted after the boards landed rather than written from the intent —
  in family, between The Bleeding Wild's 83.9% and The Quarry's 85.2%. Its 40 non-Human slots over 17
  blocks **thin monotonically across the bands — 15, 12, 9, 3, 1** — which is a fiction (the field's
  other scavengers give out as the party nears the trade itself) doing the job the weight budget
  needed anyway: the late bands cannot afford a 500-health returning body.
- **The Shutgate is 85.2% and so was The Quarry**, against the Weald's 81.5%, The Bleeding Wild's
  83.9% and The Standing Line's 83.2%. ⚠️ **The Shutgate's first draft measured 90.0% while its header
  already claimed 85.2%** — the header was written from the intent and the boards were never counted
  until the prose check ran. The fix was twelve board slots rather than the sentence. **Count the
  share; do not write the one you meant to author.**
- **The Quarry came back to 85.2%**, against the Weald's 81.5%, The Bleeding Wild's 83.9% and The
  Standing Line's 83.2% — in family, and deliberately so after the note below. What bought it was six
  returning blocks from **one** other faction rather than a scatter: a dwarven quarry needs the crew
  that cut it, so the non-lean texture is a place rather than a filler list.
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

The shipped twenty-nine, with the level range each closes over:

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
| 13  | The Quarry         | 50     | 250 → 275 | whether it lands **at all**                     |
| 14  | The Shutgate       | 50     | 275 → 300 | whether it arrives **big enough**               |
| 15  | The Underroad      | 50     | 300 → 325 | whether there is **an end to it**               |
| 16  | The Spoilfield     | 50     | 325 → 350 | whether it is **the party's own damage at all** |
| 17  | The Quickmire      | 50     | 350 → 375 | whether it can be **spent fast enough**         |
| 18  | The Slowgrowth     | 50     | 375 → 400 | whether it **adds up**                          |
| 19  | The Backcut        | 50     | 400 → 425 | whether the party can **afford** to spend it    |
| 20  | The Commonage      | **60** | 425 → 455 | whether it gets to **choose where it goes**     |
| 21  | The Longebb        | 60     | 455 → 485 | whether it **still holds its value**            |
| 22  | The Downstroke     | 60     | 485 → 515 | whether it **arrives all at once**              |
| 23  | The Evenfall       | 60     | 515 → 545 | whether it **ever lands well**                  |
| 24  | The Nevermark      | 60     | 545 → 575 | whether anything it does **takes hold**         |
| 25  | The Thinground     | 60     | 575 → 605 | whether there is **anyone left to spend it**    |
| 26  | The Roughcast      | 60     | 605 → 635 | whether any of it **can be counted on**         |
| 27  | The Looseline      | 60     | 635 → 665 | whether it can be **made to connect**           |
| 28  | The Windthrow      | 60     | 665 → 695 | whether it ever gets **a gap to land in**       |
| 29  | The Overburden     | 60     | 695 → 725 | whether it **counts for what it costs**         |

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
`WEALDED` → `ANVILLED` → `WILDED` → `LINED` → `RUSTED` → `QUARRIED` → `SHUTGATED` → `UNDERROAD` →
`SPOILED` → `QUICKMIRED` → `SLOWGROWTH` → `BACKCUT` → `COMMONAGE` → `LONGEBB` → `DOWNSTROKE` →
`EVENFALL` → `NEVERMARK` → `THINGROUND` → `ROUGHCAST` → `LOOSELINE` → `INVESTED`. ⚠️ **Chapter 25's rung move ended the `mythic-plus` degenerate
stretch at two links** — `DOWNSTROKE`, `EVENFALL` and `NEVERMARK` are one set of five on that rung's
cap of 420, and `INVESTED` is the first party in four chapters that is genuinely different, eighty
levels and a rung above them (×8.36). **Expect the chain to re-form at chapter 26**, as it has after
every rung move. ⚠️ **The degenerate stretch ended at chapter 18
and restarted at chapter 19**: `QUARRIED` through `QUICKMIRED` are five names for one set of five
combatants on `legendary-plus`, and `SLOWGROWTH` and `INVESTED` are now two names for one set on
`mythic`. **Expect a second identical link at chapter 20 and a third at 21** — the chain is a
function of a cap the ladder has climbed past, so it re-forms every time a rung move stops being
recent. ⚠️ **Chapter 20 delivered the second exactly as predicted and chapter 21 the third**: `SLOWGROWTH`,
`BACKCUT`, `COMMONAGE` and `INVESTED` are one set of five on `mythic`'s cap of 340, **four links
deep** — one deeper than the five-name stretch chapters 13 through 17 produced one rung down.

⚠️ **The last _two_ links are now degenerate, and a chapter-16 session should expect a third.**
Chapters 13, 14 and 15 all close above `legendary-plus`'s cap of 260, so `QUARRIED`, `SHUTGATED` and
`INVESTED` all clamp to 260 and are **the same five characters at the same level at the same rung**. The two
assertions the seam exists to make either side of a boundary are therefore one claim, and the
momentum ceiling — already non-binding for its own separate reason — is vacuous by construction.
Recorded rather than repaired: the repair is the share-of-the-slice one `MOMENTUM_CEILING` already
names, and it re-derives every seam in the file at once.

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

⚠️ **"Roughly 25% new" is a count with a precedent behind it, not a fraction to solve for.** Four blocks
over the Human fourth hundred's 24 distinct fielded archetypes is **16.7%**, four over the Dwarf fourth
hundred's 35 is **11.4%**, and the hundreds before them land in the same place. Restating the quota as a
percentage of fielded-distinct is how a session talks itself into authoring twice as many; the blocks are
what cost the time, and a hundred floors does not need eight new questions. ⚠️ **The four are three
legendaries and one `ascended` roof, and the mini-bosses are the same set arranged heavier** — a floor's
kind is a rule (`floorKindAt`, every tenth floor) rather than a field, so a dedicated mini-boss body is a
fifth block nobody has ever needed.

⚠️ **Budget for the lean overshoot rather than discovering it.** Authored from the lean's own bench
a new hundred comes out at 66–86% against a 65% ceiling, every session, without exception — the
Human third hundred landed at 73.6%, taking the whole tower to 65.34%. Fix it **during** authoring
by substituting comparable-weight bodies through the filler slots — and ⚠️ **draw the substitutes
only from factions that also counter the tower's**, or the swap quietly turns the lean off on that
board.

⚠️ **Which _pool_ the substitution comes out of depends on what the late bands are made of, and the
answer changed at the Dwarf fourth hundred.** That hundred's closing bands are built from **low-attack**
bodies rather than light skirmishers — the axis needed pressure without seconds — and the shipped
low-attack commons are nearly all Human, so the swap had to reach for Monster _tanks_
(`CHALKHIDE_BROWSER`, `THORNBACK_GRAZER`, `BOAR`) where the third hundred reached for light Monster
texture. First pass **77.6%**, which would have taken the whole tower to 65.44% and failed the ceiling
outright; corrected to 63.4%, and the tower to 61.82%. **Check the substitute pool against the shape the
late bands actually want, not against the shape the last hundred wanted.**

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
the slope is what makes the expected retune evaporate. It has worked three times: 100 → 200 floors at
`topLevel` 60 → 120 moved **10 of 700** shipped floors by one level, 200 → 300 at 95 → **142** moved
**17 of 200**, and 300 → 400 at 142 → **189** moved **18 of 300**. The neighbours are much worse and
the penalty is not smooth — at 400 floors, 188 moves 132 and 190 moves 94 against 189's 18 — so solve
rather than eyeball.

⚠️ **A round _slope_ is the trap.** Exactly 0.50 levels a floor wants a roof of 150 at 300 floors and
200 at 400, and both land the roof's lump **exactly** on the campaign's stage-of-the-same-number payout
— the one bound a tower may never cross — while moving 172 and **273** shipped floors by up to 5 and 8
levels. Check the payout bound before the roof.

⚠️ **At four hundred floors that bound stopped being a comfortable margin.** The highest legal roof is
**199** against a solved slope of 189, so the two are ten levels apart where they were once tens. **A
fifth hundred has to check the payout first and may not be solvable at all** — that is the case
[towers](towers.md) records as the one that finally licenses making `floorLevel` piecewise.

⚠️ **The moved floors are a real edit and it lands in files the session never opened.** Eighteen floors
shifting by one level invalidated **fifteen band headers across all seven tower files**, each stating
the level range its floors span. Find them with a script over `floorLevel` and fix them mechanically;
two of the fifteen were in the extended tower and thirteen were not.

⚠️ **A height bump also needs a new rung in `TOWER_BAND_RUNGS`**, one per hundred floors, or
`towers.spec.ts` fails. See the crew table below for the margin that rung costs.

21e's roadmap prescribed 140 and a retune of all seven hundred shipped floors; it would have put 46
of those 700 under the 90% bar and taken six of seven roofs from 100% to 0%.

⚠️ **Check that the roof is a fight second; do not start from the roof.** A tower closes _above_ the
cap of the rung it asks for — the campaign's margin rule — and `topLevel` being a rarity cap is the
opposite of what makes a roof a fight. At `elite-plus` (three rungs, ×4.096) a level-140 five takes
**the heaviest board this game can author** at 100% with all five alive in nine seconds, and no
line-up fixes it.

⚠️ **The fourth hundred is where "closes above the rung's cap" stopped being checkable as a cap
comparison, and two guards were restated rather than slid.** Band 4's rung is `legendary`, capped at
**200** against a roof of **189** — so the top crew _could_ legally out-level its own roof while
standing 66 levels under it; and band 3, which closes at 142 against `elite-plus`'s 140, lost its
top-band exemption the moment a fourth band existed. **Both fired because the band _count_ changed on
boards that did not move by one level**, which is the test this file records for the guards it has
retired. What replaced them is the quantity they stood in for — **the power ratio, bounded 1.55–1.85 in
every band** — plus the weaker structural claims that a rung exists either side of the roof and that
every band's crew can legally hold the level it is fielded at.

⚠️ **If the height moves in one session and the floors move in seven, use a self-deleting
checklist.** `PENDING` was a literal list of names in both `towers.spec.ts` and
`towers.balance.ts`; each session deleted its own and the last deleted both lists along with the
branches they guarded. A filter — "either the full height or half of it" — would pass forever and
never notice a tower nobody went back for. A tower on that list is not damaged, but it loses its
**boss**: `floorKindAt` reads the rules' height, so its old top floor resolves as a mini-boss paying
×2 rather than ×5.

**It has now run to completion three times** — 21e–21k for the second hundred, 21l–21r for the third,
and 21s–21y for the fourth, the Demon Tower last. All three rounds ended with the last session deleting
the constant, the branches, and the prose describing them. ⚠️ **Put the list back before the first tower
of the next bump is authored, not after** — between the bump and the first name being added there is
nothing at all holding the six short towers.
⚠️ **Leave the defensive shapes the list forced behind when you delete it**: `topFloors` reading the
**authored** height rather than `rules.floors`, and the roof-versus-band-opener comparison being
computed **per tower**. Both are no-ops while every tower is the full height and both are what stop
the sweep reading an undefined stage the day the next bump lands — and the fourth hundred is the bump
that proved it, because both were already correct when it landed. The comments in `towers.balance.ts`
say so at each site.

⚠️ **A pending tower now loses a second thing besides its boss, and it is the right behaviour rather
than a second bug.** `floorGear` measures the gear ramp against `rules.floors`, so a tower ending at 300
never reaches a `fromFloor` of 301 and stays entirely naked. Those floors were tuned naked, so that is
what they should be — but say it out loud, because "the ramp is keyed to the rules' height" and "the
ramp is keyed to the authored height" differ by a whole hundred floors of difficulty on six towers.

### The two crews

`towers.balance.ts` fields one per band, both derived:

| Band | Floors  | Rung             | Level | Margin under its band's top floor |
| ---- | ------- | ---------------- | ----- | --------------------------------- |
| 1    | 1–100   | `rare-plus`      | 48    | 0 — parity                        |
| 2    | 101–200 | `elite`          | 75    | 20 (`ROOF_MARGIN`)                |
| 3    | 201–300 | `elite-plus`     | 99    | 43 (`ROOF_MARGIN` + 23)           |
| 4    | 301–400 | `legendary`      | 123   | 66 (`ROOF_MARGIN` + 46)           |
| 5    | 401–500 | `legendary-plus` | 147   | 89 (`ROOF_MARGIN` + 69)           |

⚠️ **Band 4 is the first band whose rung is a _kit_ rung, and it is the largest step any boundary
has.** `KIT_RULES.unlocks` is `elite` / `legendary` / `ascended`, so bands 2 and 4 hand over a skill and
bands 1 and 3 do not — that crew arrives with a **third skill** on top of its ×1.6 and its 24 levels.
**The power ratio counts the rung and cannot count the skill** (it still lands at ×1.663), so a fourth
hundred is authored against measured survivors and the ratio is only a legality check.

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
**two thousand eight hundred** floors this build ships. What ramps across a climb is **what a floor costs**, not
whether it is possible — a floor is climbed once and there is no way around one, so a floor the crew
cannot pass stops the tower outright.

### How it escalates is a per-tower answer

⚠️ **Thirty-two hundreds gave thirty-two answers — every second, third, fourth and fifth hundred of
all seven towers, and the sixth of the Human, Dwarf, Elf and Undead — and no two escalate the same way. Read the crew's failure mode before choosing;
do not copy the last session's shape.** [towers](towers.md)

⚠️ **The cross-crew table has now failed to choose the axis four fifth hundreds running, for four
different reasons, and the fourth is below.** The Humans ranked mid-table on
everything because that crew is balanced; the Undead ranked first on everything because that crew is
fragile; the **Angels** rank first-and-second on nearly everything because that crew is the
**strongest** at band 5 — calibrated in 2.5% steps they take a control 10% heavier than any other
arrangement (×1.10 and ×1.025 against a field of 0.625 to 0.975), so they stand on the steepest part
of every curve. `critChance` 2.35 / 1.72, `attackSpeed` 3.17 / 2.59, `dodge` 2.72 / 2.42,
`physicalPierce` 2.42 / 1.96 — four first places for one crew. **A first-place ranking is not a
licence when the crew is the one furthest up its own ladder.**

⚠️ **What separates a lock from a steep curve is whether the axis is aimed at a _register_, and the
test is a correlation rather than a ranking.** Across the fourteen shipped arrangements, the Angel
fifth hundred's `physicalPierce` cost correlates **0.834** with each arrangement's authored `def`
where `critChance`'s correlates **0.645**: the four heaviest-armoured arrangements are the four
costliest rows on pierce (angel-alt Σ195 → 2.42, angel-ref Σ174 → 1.96, dwarf-alt Σ186 → 1.17,
dwarf-ref Σ163 → 0.74), where crit's ordering breaks at the bottom (undead-alt reads 1.17 on Σ45 of
`def`). **Correlate the cost against the register the axis is pointed at.** [towers](towers.md)

⚠️ **A stat can split into a half one crew answers and a half it does not, and the two halves are
two different axes on two different towers.** `critDamageResist` is _subtracted_ from the attacker's
`critDamageAmp` and says nothing about how often a crit lands, so the Angel fourth hundred built on
`critChance` — the frequency its crew cannot answer — and the Undead sixth built on `critDamageAmp`
above its register. ⚠️ **What licenses the second is that a subtraction evaporates**: the Angel
arrangements carry Σ0.76 / Σ0.96 of `critDamageResist`, which is 0.19 a body, and measured they rank
**thirteenth and eleventh of fourteen at `critDamageAmp` 1.70 and first at 2.80**. **A subtraction
defends against a small amplifier and not against a large one — check where a register stops working
before reading "two towers, one stat".** [towers](towers.md)

⚠️ **On an _amplification_ axis the gear archetype multiplies the axis, which is the refusal-axis
finding with the sign reversed.** Held at an identical stat line on one board at the Undead sixth
hundred, four carriers at `critChance` 0.22 / `critDamageAmp` 1.70 leave the binding arrangement
all-`mage` **1.45 of five** and all-`ranger` 1.52, against all-`brawler` 1.98 and all-`tank`
**2.65** — _above_ the 2.33 the same board reads with no amplifier on it at all. `GEAR_PROFILES` pays
a tank +46% attack and a ranger +112% at Relic 100, and an amplifier bills the attack it multiplies.
**Two hundreds running have now found the archetype worth more than a step of their own axis; check
which kind of axis you have before allocating them.** [towers](towers.md)

⚠️ **One tower can give opposite answers to the rank question on two of its own hundreds.** The
Undead Tower's second hundred is `dodge`, which bills what is _aimed at_; its sixth is
`critDamageAmp`, which bills what is _left alive_ — carried on one body with the escort held, a
carrier is worth 0.15–0.30 of five in front and **1.00 behind** at floor 570 and 0.02–0.08 in front
against **1.80–1.85 behind** at floor 590, reproduced on all three carriers at both levels. **Carry
the measurement, never the precedent — not even the same tower's.** [towers](towers.md)

⚠️ **"Is it ours" can come back _no_ for a crew that had every axis one band earlier.** At band 5 the
Undead Tower's whole vocabulary collapsed to one curve and **every** throughput candidate ranked
undead-alt first of the twelve non-Angel arrangements, so the table could not choose between the
spellings. One rung and twenty-four levels later the same crew is mid-table on nearly everything and
its sixth hundred had to be taken on **margin** — third of fourteen, first of the twelve non-Angel,
third on the residual in a three-way tie inside 0.18. **A licence expires in both directions.**
[towers](towers.md)

⚠️ **A refusal recorded on the _clock_ expires when the clock gets cheaper, which is a different
expiry from the one recorded on size.** The Elf Tower's fourth hundred measured `def` inert and its
fifth measured it at 0.38 / 2.85 and **declined it on seconds**, taking the half of the vocabulary
that converts budget into deaths. Its sixth takes it, and nothing about the stat changed: the board
weight that reads ≥3.90 of five falls from **14,268 common-equivalent at floor 501 to 3,864 at floor
600**, a factor of 3.69, so the twelve seconds armour buys are seconds the fallen weight gave back.
**Re-price a mechanic a neighbouring band declined, and say which of size or seconds the refusal was
recorded on.** [towers](towers.md)

⚠️ **The residual and the counter-example are both legitimate readings of a confounded table, and
which one applies is a property of the table rather than of the session.** The Dwarf sixth hundred
disproved the fight-length confound with a counter-example — angel-alt, the slowest arrangement of
all fourteen, ranked twelfth — and the correlation was 0.177, so no residual was needed. The Elf
sixth hundred has the same confound at **0.79** and no such row: the three arrangements nearest the
binding one are the three slowest in the game. Fitting the trend puts elf-alt **first at +1.59
against a second place of +0.62, 156% clear**. **Look for the counter-example first; fit the residual
only when it is not there.** [towers](towers.md)

⚠️ **A defensive stat grades in _value_ and an offensive one in _carrier count_, and a tower hundred
reproduces chapter 29's rule exactly.** At the Elf sixth hundred's control, `def` 70 reads
3.98 / 4.00 / 3.70 / 3.63 / **2.48** across zero to four carriers — flat through the middle and a
cliff at the end, which is the survivors metric saturating — where the same walk at `def` 54 spans
0.38 in total. So the bands walk the **value** and only the closing three walk the count. **Check
which dimension your axis has before planning six bands on it.** [towers](towers.md)

⚠️ **Armour on the anchor is worth 0.00 and armour on the escorts is the whole axis, so a band table
about armour is a count over the _light_ bodies.** Held on one board at the Elf sixth hundred, `def`
70 on the anchor reads 4.00 of five against a 3.98 control; the same value on the four escorts reads
2.48. Its band table therefore counts bodies at common-equivalent `def` ≥ 60 **under 700 raw health**
and reads 0 / 0–1 / 1–2 / 2 / 2–3 / 2–3, while the opening band's boards carry two or three heavy
bodies over that threshold where the measurement says they are worth nothing. **State which bodies a
count is over** — chapter 29's rule, and the counts-not-absolutes fix stacked on top of it.
[towers](towers.md)

⚠️ **A rung boundary is only a reprieve on the retirement check when the hundred's _gear_ is flat.**
The Elf fifth hundred's check came back completely clean and reasoned that a band boundary hands the
crew ×1.6 and twenty-four levels where the boards gain forty-seven, and ×1.6 outruns
`perLevel.ascended`. The sixth's check, at the same kind of boundary, retires **eight of the tower's
fourteen `ascended` blocks outright** — because floors 401–500 climb Masterwork 1 → Relic 40 for
×1.09 in effective tank health where 501–600 climb Relic 41 → Relic 100 for **×1.47**. **Multiply the
gear step into the boundary before predicting the check.** [towers](towers.md)

⚠️ **Two mechanism arguments for an armour axis are both false, and each looks decisive.** "The crew
with the smallest attack loses most to `def`" — `baseDamage` is `atk²/(atk + def)`, and the Elf
arrangements carry Σ292 / Σ304, second and third of the fourteen behind monster-alt's Σ306 — which
pays 0.45 and ranks thirteenth; the cost correlates **−0.31** with attack. "The crew with no pierce to open it" — they carry `physicalPierce`
Σ0.12 / Σ0.20, the alternate's second only to the Monsters', at **−0.17**. What the table actually
tracks is the **absence** register: those two arrangements are the only two of fourteen carrying zero
`physicalResist`, `tenacity`, `critBlock`, `critDamageResist` **and** `lifeLeech` at once, on the
lowest health pool in the game. **Take the measurement, not the register.** [towers](towers.md)

⚠️ **A hundred can be built on _refusing_ the axis of the hundreds below it, and reading the damage
formula is what licenses it.** The Dwarf Tower spent two hundred floors on `physicalPierce` — the Proof
House on the pick and the Masterworks on the pick with the attack behind it — and its sixth hundred is
`physicalResist`, because `effectiveDefence` returns `def × (1 − pierce)` and `resistedShare`
multiplies by `1 − resist` **afterwards, untouched**. It is that tower's first **exclusive** licence in
six hundred floors (dwarf-ref 1.35, dwarf-alt 1.28, first and second of fourteen). **A spent axis can
be spent again from the other side of the formula.** [towers](towers.md)

⚠️ **A single well-chosen counter-example disproves a confound where a residual only discounts it.**
The Dwarf fives are the **slowest mortal arrangement in the game** and calibrate to a 27.9s control
against most crews' 8–16s — exactly the shape the Demon fifth hundred says must be read as a residual.
It needed none: **angel-alt, the slowest arrangement of all fourteen at a 35.7s control, reads 0.15 and
ranks twelfth**, and the correlation across the table is 0.177. **Before fitting a trend, look for the
row the confound predicts should be at the top and check whether it is.** [towers](towers.md)

⚠️ **The rank a carrier stands in is priced by its _output_ rather than by the axis, and two carriers
on one hundred can disagree.** Carried on one body at the Dwarf sixth hundred, the lieutenant — the
heaviest carrier and the only one with a second turn — reads **2.25 of five in front against 3.02
behind**, where the middle carrier reads **4.00 either way**. That is the tower's own "escalate in
front; the back rank is a cliff" landing on the body carrying the turn and missing the body carrying
the stat, and a **third distinct answer in four hundreds**. [towers](towers.md)

⚠️ **On a refusal axis the `tank` gear archetype switches the axis off, which is the opposite sign to
the finding that established the dial.** Held at an identical stat line on one board, all-`tank` reads
**5.00 of five** where all-`brawler` reads 4.00: a tank set pays its grade into health, and on a
refusal axis health buys the party seconds rather than costing it members. The Dwarf fourth hundred
read the same lever the other way on a pierce axis. **Check which kind of axis you have before
allocating archetypes.** [towers](towers.md)

⚠️ **A retirement check can come back with the _whole_ ascended roster retiring, and the seconds say
what killed each one.** All four of the Dwarf Tower's ascended blocks read 0% at floor 600 behind four
light escorts — but the Breachlord dies at **22.3s** and the Masterstroke at **58.1s**. **The heavy
ones lose to damage and the light ones lose to the clock**, and only the second kind is a sign the
board is too slow rather than too big. All four still anchor the opening bands. [towers](towers.md)

⚠️ **A cross-crew ranking must be read as a _residual_ when one confound dominates the stat, and the
Demon fifth hundred is where that arrived.** Ranked on raw mean cost its `dodge` axis puts the binding
Demon arrangement **sixth of fourteen** — which by the usual test is a refusal. But `dodge`'s cost
correlates **0.772** with how long a crew's fights already are: it is mostly a tax on slow crews, and
the four arrangements clearly above demon-alt are the **four slowest of the fourteen** (angel-alt
41.6s, dwarf-ref 28.1s, dwarf-alt 28.0s, angel-ref 27.4s on their own controls, against demon-alt's
9.9s). Fit the trend and rank the residual and demon-alt is **first of fourteen at +0.76**, 55% clear
of second. **Ask what else the ranking could be measuring before reading it as a verdict** — this is
the Angel fifth hundred's correlation test used to _rescue_ an axis rather than to disqualify one.
[towers](towers.md)

⚠️ **An axis can be taken on _affordability_, which is the reverse of every previous fight-length
finding and the fourth distinct licence a hundred has used.** The Dwarf fourth, Undead fourth, Angel
fifth and chapter 25 all chose the axis that made fights **shorter**, because their crews were already
walking into the 67.5s bar. The Demon fives clear their control in 8.7s and 9.9s — **the shortest in
the game** — so an axis costing eighteen seconds is affordable there and nowhere else, and the Angel
Tower measured that same stat one hundred earlier and declined it at 1.38 of five for **54.5s**. **Fight
length can license an axis as well as veto one; check which side of it the crew is on.**
[towers](towers.md)

⚠️ **On a _celestial_ tower the counter-faction inversion guard binds the lean far harder than the 65%
ceiling does, and it only bites on a band hard enough to cost members.** The Demon fifth hundred
authored the obvious way — all three new carriers of the lean's faction, on 234 of 500 slots — came out
at 81.8% and took the whole tower to 65.84%, over the ceiling. **But the ceiling is not what failed.**
`towers.balance.ts` requires a celestial tower to cost its crew _fewer_ members than a mirror board of
the crew's own faction, and the Demon Tower had been carrying that inversion by **1.1 members across
four hundred floors**; the new hundred took it to 93.7 against 92.7 and the tower went red. Against a
Demon five an Angel board is ×1.05 out **and** ×1.05 in where the all-Demon mirror is neutral both ways,
so a glassy five loses more to the incoming five percent than it saves on the outgoing — varying faction
alone, all-Angel costs **58.1** members, the mirror **55.7**, all-Monster **54.5**. ⚠️ **The guard's
premise — "its own mirror is the hardest board it has" — holds for the Angel Tower by construction and
for the Demon Tower only empirically**, which is why it took five hundred floors to bite. ⚠️ **And it is
invisible in the low bands**: floors 1–300 lose 4.3, 6.3 and 8.1 members and each is _favourably_
biased, because there the outgoing edge only shortens fights the party was never losing. **Check the
inversion, not just the share, whenever a celestial tower gains a band that kills anybody.**
[towers](towers.md)

⚠️ **The fix for that is _who carries the axis_, not a lighter band — and which one you reach for is
checkable.** The Demon fifth hundred's 57.9 members lost sat mid-range across the seven towers (Undead
141.0, Monster 88.1, Human 68.8, **Demon 57.9**, Dwarf 48.2, Elf 38.3, Angel 36.7), so lightening it
would have been tuning content to a guard. What moved instead were the carriers: the two **returning**
carriers of the other counter-faction took roughly half the carrier slots, and the anchors and texture
came from that half of the lean — leaving the hundred at 67.4% Monster and 32.6% Angel, the tower at
55.84%, and the inversion at 84.2 against 84.9. ⚠️ **Check the band's losses against the other towers'
before you soften anything**; the honest fix is usually composition rather than weight, and it makes the
axis a property of the tower rather than of three new bodies. [towers](towers.md)

⚠️ **Once a carrier count is fixed, the _rank_ each carrier takes is most of the remaining tuning.**
The Demon fifth hundred measured one body at `dodge` 0.40 worth **0.75 of five in the front rank and
0.28 in the back** — and then spent that spread deliberately: every one of its hundred boards has a
carrier in front, its lieutenant stands nowhere else across fifty-four appearances, and yet **134 of
its 261 carrier slots are in front and 127 behind**, because four carriers all standing forward is not
a board that crew clears. **A back-rank placement is a priced discount, not an oversight** — say which
you mean, because chapter 22's rule that a rank comparison must be carried on one body is about
_measuring_ the spread, not about refusing to use it. [towers](towers.md)

⚠️ **A mechanism argument is not a measurement, and the Angel fifth hundred is the cleanest instance
the project has.** A `bomb` bills its whole payload at expiry through `statusDamage`, which bypasses
`def` entirely — an Angel five's largest register by far — it cannot be stopped by killing the
caster, and every Angel cleanse sits behind a cooldown. Against a crew whose recorded failure is
exactly "a body removed between two heal ticks", every one of those is true, and measured at all five
carriers a bomb at power 1.0 → 2.5 reads **4.00 survivors at every single row**. **Price the shape
before believing the story about it.** ⚠️ **The Demon fifth hundred repeated it on a register rather
than a status**: the Demon arrangements are the **only two of fourteen carrying a point of
`lifeLeech`** (Σ0.22 against Σ0.00 everywhere else) and all their sustain is a share of damage
_dealt_, so a missed swing ought to cost them the damage **and** the healing. Stripping `lifeLeech` to
zero and re-running the whole grade moves the cost from **1.82 to 1.84** — Σ0.22 across five is simply
too small to be the mechanism, and the axis was right for an entirely different reason.
[towers](towers.md)

⚠️ **An axis a neighbouring tower measured as _not_ this crew's can invert one band later, and the
Angel fifth hundred is the third instance.** The Dwarf fourth hundred read `physicalPierce` 0.35
costing dwarf-ref/alt −1.00 / −1.08 against angel-ref/alt **−0.08 / −0.29**, and reasoned that "`def`
is the Dwarves' only mitigation where an Angel five has armour **and** a choir". At band 5 the choir
has been out-scaled and the armour is what is left, and the Angels take first and second. **Both
readings are right about what they measured; re-run "is it ours" on the band being authored.**
[towers](towers.md)
carries them all in full. What generalises is only the procedure:

⚠️ **A crew's whole vocabulary can collapse to one curve, and then the cross-crew table cannot choose
the axis.** At the Undead Tower's fifth hundred, `attackSpeed` 130, `haste` 160–190, `atk` ×1.5 and
enemy crit at ×1.88 expected damage all read the **same** 2.00 / 0.00 held at equal nominal damage,
and every one of them ranks the binding Undead arrangement first of the twelve non-Angel rows —
because that crew is simply the most fragile mortal arrangement at that band. That is the Human fifth
hundred's problem inverted (nothing was theirs because they are balanced; everything is theirs because
they are fragile), and **both end the same way: the axis has to be chosen on something the table
cannot see.** There it was fight length, and an **empty register** as the thing that stops one
spelling of a curve from being the hundred below shipped twice. `attackSpeed` accrues only after a
basic attack, so a hundred built on it runs 64–84-tick cooldowns against a median of 55 where the
hundred below it runs 34–40.

⚠️ **When the axis blocks belong to the lean, the carriers alone can spend the whole faction
allowance.** Three new carriers and a roof, all of the lean's faction, standing on nearly every board,
put **244 of 500 slots** beyond reach before a single texture body was chosen — a first pass of 94.8%
against a 65% ceiling, the worst overshoot any tower has had. It is structural rather than sloppy.
**Decide the carrier density and the substitution budget together**, and convert one texture slot at a
time across every band rather than replacing a filler block wholesale.

⚠️ **A run of four is a run, not a law.** Four consecutive Undead hundreds each closed faster than the
one below (51.2s, 39.6s, 41.4s, 24.3s) and the fifth closes 0.7 seconds slower at 25.0s — because the
fourth had already spent its whole budget on rate and let the weight fall away, so there was nothing
left to take out. **State the mechanism a trend rests on, not the trend.**

⚠️ **A tower's own spent axis expires like any other crew's, and re-running "is it ours" can license
the pair where it refuses the half.** At band 5 the Dwarf Tower's own `physicalPierce` re-measured
**seventh of fourteen** (it was first and second when the fourth hundred took it), and the pierce
carried _with_ the attack behind it came back super-additive (0.47 and 0.82 alone, **1.97**
together) and first of the twelve mortal arrangements — the Monster fourth hundred's
super-additivity licence and the Human fifth hundred's margin licence, needed together on one axis.
⚠️ **The two Angel arrangements top every attack-shaped candidate at that depth** — a hammer is the
choir's tax and their mirror control is the hardest board they have by construction — so a cross-crew
table read at band 5 wants that caveat stated rather than silently absorbed.

⚠️ **A hundred may build on the axis below it, and the licence is super-additivity rather than a
mechanism argument.** The Monster fourth hundred is the one case: `dodge` reads on paper as the third
hundred's `physicalResist` wearing a second stat — both cut the damage a `lifeLeech` crew sustains on
— which is precisely the reasoning that disqualified `magicResist` on the Coppice. Measured, the two
are **not one curve**: at 0.60 and 0.45 they are worth 1.90 and 1.25 of five alone and **3.90
together**, and on one anchor each half costs 0.26 of the binding arrangement where the pair costs
**1.88**. **Test the pairing before accepting or rejecting a second stat on a spent axis** — the
mechanism argument gets it wrong in both directions.

⚠️ **A dial that grades is not the same thing as an axis that is ours, and the cross-crew table is
the only thing that tells them apart.** A second `ascended` anchor grades **3.90 → 3.00 → 2.30 → 2.05
→ 1.77** on the Monster crews with zero timeouts — four monotone steps, and it lifts a ration that
tower has held for two hundred floors, which is the Coppice's own "the crew meeting it is a different
crew". It costs dwarf-ref **−4.00** against monster-ref's −1.98, **eighth of fourteen**. Weight axes
tend to belong to whichever crew is slowest, not to the crew being authored for.

⚠️ **A tower with no lean still overshoots, and the thing it overshoots is the flat-spread ceiling.**
The Monster Tower has no counter-faction to author into, so its four new blocks were chosen by the
spread's **thinnest row** — Dwarf at 11.12% — and the first pass still landed at **22.59%** against a
25% bound that may never be crossed. Both named fixes were needed: swap the non-new texture blocks of
that faction out, **and ration the axis carriers** so the band claim is a range rather than a
constant. The overshoot arrives whichever way the faction is chosen.

⚠️ **"Is it ours" can come back _no_ twice for opposite reasons, and the second answer is to re-take
the tower's own axis.** The Monster fifth hundred ranks its crews eighth to fourteenth of fourteen on
thirteen stats and five mechanics — the Ironpace's finding, arriving because that crew **has no support
to lose** rather than because it is balanced. Its own third-hundred `physicalResist` still reads second
and third of fourteen, so the hundred re-took it and paired something new on top. **A recorded licence
is a claim about a curve in both directions: re-measure before assuming it has gone stale.**

⚠️ **A `dot` is priced in _seconds_, so it is worth 0.00 on a crew that clears in eight of them.**
Measured on the Monster fifth hundred's shipped floors, `BURN` at its shipped power is worth 0.00 at
floor 420 (8.4s fights), 0.42 / 0.40 at floor 467 (15.1s) and 0.20 / **0.80** at floor 500 (19.5s) —
and the `physicalResist` beside it grades the same way, 0.00 → 0.50 → **1.02 / 1.62**, because the plate
buys the seconds the poison bills. **That is one mechanism rather than two**, and it is why the boards
get _lighter_ as the axis rises: 4,080 of health at floor 300, 3,260 at 400, 2,740 at 500. ⚠️ **A dot's
scope table is not a stun's either** — the same `BURN` reads −0.10 on `enemy-row-back`, 0.65 front, 0.82
on `enemy-lowest`, 0.90 on `enemy-row-front` and 1.02 wide, where a **stun is worth exactly 0.00 at every
scope but `enemy-all`** and then cliffs from nothing at duration 25 to a wipe at 50.

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
   paper and the highest `magicResist` on any shipped block was 0.14 when it was first checked; at 0.15
   the wall was worth nothing, and it only bit at four times anything authored. ⚠️ **That refusal
   expired, and the Demon fourth hundred is where.** Three further hundreds of blocks took the ceiling
   to **0.26** and the crew gained a rung and a kit, and the same stat then graded **nine monotone
   steps** and came back **first of fourteen cross-crew with nine arrangements at or under 0.15** — the
   sharpest licence any hundred has measured. At the register it is still worth 0.03 of a survivor, so
   both earlier refusals were right about what they measured. **A refusal on _size_ is a claim about a
   curve; re-measure it rather than inheriting it, and record the register you measured against.** ⚠️
   **The check can also come back positive, and that is the answer rather than a formality**: the Elf
   Tower's third hundred is built
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
5. ⚠️ **An escalation axis does not have to be a stat, a mechanic or a composition — the Human fourth
   hundred's is the _gear its boards are wearing_, and it is the first geared content outside the
   campaign.** A tower authors a **ramp** in `TOWER_RULES.gear` rather than a set per floor, walked as
   one position on the concatenated grade ladder so quality and level both rise by construction.
   - ⚠️ **The campaign's "gear is texture" figures do not transfer, and the reason is the board
     underneath them.** [gear](gear.md) prices a whole grade step at ×1.15 and chapter 16's entire
     Relic ramp at **0.08 of a survivor** — all measured while the campaign's budget fell 0.595 a
     chapter _underneath_ the ramp. Hold a tower board still and add the same gear and it is enormous:
     **Worn 1 costs the binding crew 0.82 of five, Sturdy 20 takes it to 93% with 1.05, and Fine 60 on
     an unlightened board reads 0%.** **State whether the board under a gear figure was being
     lightened, or the figure means nothing.**
   - ⚠️ **Relic 100 is not authorable as a ramp endpoint.** +166% health on a `tank` against Fine 60's
     +66%; the control dies in 7.1 seconds. A ramp ending at the top of the ladder leaves the authored
     weight nothing to be, which is the reverse of the ninety-second clock and just as unauthorable.
   - ⚠️ **A tower cannot read its gear off the campaign the way it reads its lump.** Matched by enemy
     level that yields **no gear anywhere in any tower**: the campaign's first geared stage is `c12-s1`
     at level **225** and the tallest tower roof is 189. The whole tower system lives below where the
     spine introduces gear, so the ramp is the tower's own — and it follows that a tower is not
     out-gearing the spine at equal level, because there is no grade there to be out-geared by.
   - ⚠️ **Key the ramp to a _floor_, never a level.** The **2,100** floors below `fromFloor` were tuned
     naked and stay naked; a ramp from floor 1 re-prices all of them. (Of 2,800 shipped floors, 700 are
     geared — every tower's fourth hundred.)
   - ⚠️ **A geared tower floor owes every body on it a `gearArchetype`, and an absent one is silent** —
     the body looks itself up under `undefined`, gets nothing, and fights naked on a board tuned as
     though it were kitted. `towers.spec.ts` now holds the tower-side twin of the guard
     `chapters.spec.ts` has. Nine of the Human Tower's blocks needed the one-line edit and four of the
     Dwarf Tower's did, and **none of the thirteen stands on a geared campaign stage**, so the bill was
     free both times — check that before assuming it is, exactly as chapter 22 had to.
   - ⚠️ **The ramp is one rule for all seven towers, so only the _first_ geared hundred may spend it as an
     axis.** Every one after it inherits the ramp for free and owes an axis of its own on top — the Dwarf
     fourth hundred is the second to land and had to go and find one. ⚠️ **What a geared hundred does get
     that a naked one does not is the _archetype allocation_**: `GEAR_PROFILES` splits each archetype's
     budget differently, so the same stat line in `ranger` gear is a different board from one in `tank`
     gear once the grade prices it. Identical lines all-`tank` / `support` / `brawler` / `ranger` / `mage`
     read 4.00 / 4.00 / 3.98 / **3.67** / 3.75 for the binding Dwarf crew, and the attack-and-haste
     profiles take **7.2 seconds** off the board. Texture at a third of a survivor — but it is the one
     lever that pressures a clock-bound crew without slowing it.
   - ⚠️ **A hundred whose axis is a stat aimed at the crew's own defence is the sharpest form of "is it
     ours", and the party-side register can still point at the wrong crew.** The Dwarf fourth hundred's
     `physicalPierce` (`def × (1 − pierce)`, against authored `def` Σ163 / Σ186 versus Undead's Σ50 / Σ45)
     costs dwarf-alt **−1.08** and dwarf-ref −1.00, first of fourteen crews — but both **Angel**
     arrangements carry _more_ `def` (Σ195 / Σ174) and lose −0.08 and −0.29, because `def` is the Dwarves'
     only mitigation and the Angels have armour _and_ a choir. **State what a register is a share of, not
     just its size.**
   - ⚠️ **Pick the axis on _fight length_ when the crew's failure mode is the clock.** Three dials measured
     stronger for that crew and all three walk into the timer: `def` 110 worth 1.33 at 58.2s, enemy `hp`
     1300 worth 3.67 at **67.9s and a 20% win rate**, `haste` 143 worth 2.00 at 44.1s — against pierce
     0.45 worth 1.43 at **41.1s** on a 31.6s control. Chapter 25's rule, on a tower.
   - ⚠️ **An inherited board-shaping rule may not transfer to a new axis, and a confounded first pass can
     make it look like it did.** The Dwarf Tower's own "escalate in front; the back rank is a cliff" is a
     rule about **output**, and moving a _pierce_ carrier between ranks is worth −0.37 to +0.33. The first
     reading said otherwise because that five's third body also carried pierce, so moving one back put
     **two** carriers there. Carry a rank comparison on one body.
   - ⚠️ **A roof can fail on its own `atk` rather than on its escort, and both halves may have to come
     down.** The Human roof needed nine escort shapes and never touched the boss's line; the Dwarf roof,
     weight held at 1200 hp, reads **0% at `atk` 70** and 2.67 / 2.35 at **52** — and its escort had to
     come down too (four low-`atk` commons read 100% / 2.67; one 900/48 body among them reads 48% / 53%;
     one pierce carrier in the escort reads **3% / 5%**). **Shortlist on weight, settle on attack.**
   - ⚠️ **A superlative about seven towers goes stale the moment the next hundred lands.** The Panoply
     shipped as "the lightest tower roof on attack, tied on health"; the Proof House took both records one
     session later at 1200/52, the Ironpace at 1160/44 and the Masterstroke at 1140/40 took the attack
     record twice more. Both files now state the list of roofs instead — twelve of them now.
   - ⚠️ **A hundred can measure the whole vocabulary as inert, and then the axis is plain throughput.**
     The Elf fourth hundred is the case: twelve hostile statuses ride the swing within **±0.22** (four
     of them negative), `tenacity` is **exactly flat**, `magicResist` **exactly 0.00**, `critBlock`
     0.05, `accuracy` 0.05, `physicalPierce` 0.10, every scope/reach/selection leaves the board
     _easier_, board-wide voice count is flat, and the entire sustain vocabulary — leech 0.45,
     `recovery` 30, `healthRegen` 22, a healer, a board-wide regeneration — spans **0.07 of a
     survivor**. What is left is `atk` and the health standing under it, **as a product**: at level 189
     in Fine 60, 520/52 is worth 2.40 and 900/36 is worth 0.75, while **700/52 is worth 3.62**. A body
     only bills its attack for as long as it lives — one body at `atk` 70 reads 3.98 of five on 340
     health and **3.08** on 1100 — and the same 202 points of board attack reads **4.88** on one soft
     escort and **2.75** on the anchor. **Write the negative list down; it is the deliverable when the
     axis is this plain.**
   - ⚠️ **A cross-crew "is it ours" table needs every crew's control to be able to fall, and the coarse
     version lies.** That hundred's first pass calibrated each crew to the ladder rung nearest 4.00 and
     left ten of fourteen reading 4.00 flat, which made attack look like the Elves' own lock by a factor
     of 2.35. Re-calibrating to **the heaviest board each crew still reads ≥3.75 on** moved elf-alt from
     first of fourteen to **fourth** (dwarf-ref −3.98, angel-ref −3.88, angel-alt −3.80, elf-alt −3.70),
     which changed the licence from exclusivity to **margin** — and the header now says which it is. The
     Demon Tower's saturation trap, arriving on the test rather than on an axis.
   - ⚠️ **An axis can be a _product of two stats_ where neither half is worth much alone, and it can be
     the one shape that makes fights _shorter_.** The Undead fourth hundred walks `atk` and `haste`
     together on weight that falls: at level 189 in Fine 60, four carriers from 36/96 to 56/136 grade
     **3.77 → 0.93** and **3.92 → 0.00** with zero timeouts, where `atk` 48 alone reads 2.52 / 2.58 and
     `haste` 120 alone 3.00 / 2.63 against the pair's 2.00 / **0.97**. It grades in carrier counts as
     well (3.85 → 2.00 and 4.00 → 0.95 across zero to four). **The longest fight in that hundred is
     24.3s** against rivals at 32–34s, on a tower whose own binding case is a 51.2s floor 100 — chapter
     25's rule and the Proof House's, on the crew they were written for.
     - ⚠️ **It is distinct from the Plating Floor's `atk` × _health_, and the difference is measurable
       rather than editorial.** Put health under it and it is worse on the binding crew and nine to
       twelve seconds longer (700 hp / atk 48 reads 2.00 / 1.55 at 28.1s / 31.5s); all three at once is
       past the edge. **A hundred whose crew loses to the clock has to escalate on rate and shed the
       weight**, which is the exact inversion of that tower's own hundred below.
   - ⚠️ **A mechanism argument is not a measurement.** `magicResist` looked like the sharpest "is it
     ours" available — Undead deal 14 magical to 6 physical and sustain on `lifeLeech` off damage
     _dealt_, so a magic wall taxes damage and healing at once — and it measured **within a second of
     `def` and `hp`** (3.05 / 3.08 against 3.00 / 2.67 and 3.00 / 3.17), which is that tower's own
     third-hundred axis wearing a different stat, and **0.00** to the binding arrangement cross-crew.
     **Check whether a new stat lands on a curve the tower has already spent.**
   - ⚠️ **An axis stops being a crew's own when the crew gains a rung and a kit, so re-run the test on
     the band being authored.** At band 4 the Undead Tower's third-hundred axis (enemy `hp`) costs
     dwarf-ref **−2.78** against its own crews' −1.25 / −1.00, and its second-hundred `dodge` costs
     dwarf-ref −1.05 against undead-ref's −0.85. Neither was true a band lower.
   - ⚠️ **A register check can be about a _pairing_, and then the pairing is what the header states.**
     That hundred sits inside both shipped registers on each stat alone — `haste` median 94 / ceiling
     152 and `atk` 56 / 100 over 334 blocks, the Elf pool 96 / 152 and 56 / 99 — and steps past only on
     carrying them together: **5 of 334** blocks had `haste` ≥ 118 _and_ `atk` ≥ 70 beforehand.
   - ⚠️ **Supply the missing `gearArchetype`s _before_ the anchor-retirement check, not after.** A block
     with none fights naked on a board priced as though it were kitted, and that inverted a retirement:
     `THE_WITHERED_CROWN` measured 3.10 / 3.63 — safe — and **3% / 18% at 41s** once given one. Nine of
     the Undead Tower's blocks needed the edit and none stood on a geared campaign stage, so the bill
     was free again — but that is three towers running where it was checked rather than assumed.
   - ⚠️ **The stride is not the check on a closing band.** `towers.balance.ts` samples every fourth
     floor plus the mini-bosses; its **every-floor** assertion is what caught a floor 399 reading
     **60%** between neighbours at 100% and 98%, three full carriers standing at the roof's own level.
     **Sweep every floor of the closing band before believing a band that samples cleanly.**
   - ⚠️ **Aim past the front rank is inert or negative on all _seven_ towers now**, which closes the
     question rather than extending it: `enemy-all` at the wide cap reads **−0.11 / −0.08** there.
   - ⚠️ **A retiring anchor can be a block whose kit was the _previous hundred's axis_, and the pair
     that goes is not the heaviest.** At the Elf Tower's new roof behind four low-`atk` commons,
     `THE_GRUDGEKEEPER` (1520/89) reads 78% / 2.15 and the Adamant Colossus (1250/88) reads 4.00 / 4.08,
     while `THE_EDGEWRIGHT` (1300/84 — the hundred below's own roof) reads **5% / 0.05** on its
     `critChance` 0.22, `THE_WARDWRIGHT` (1560/92) 20% / 0.38 and `THE_DOORSTONE` (1480/88) **0%** on
     `def` 70 plus `physicalResist` 0.30, which buy it 29 seconds of swinging against the Grudgekeeper's 17. ⚠️ **The Colossus survives the check on `haste` 58, the lowest in the game** — attack bills only
     as often as it swings. **Two roofs retired while an older, heavier block stayed.**

   - ⚠️ **The last hundred's axis was a mechanic two towers had already declined, and the licence came
     back the widest of the nineteen.** The Demon fourth hundred's `magicResist` costs demon-alt **1.15**
     against a second place of 0.82, with **nine of fourteen arrangements at or under 0.15** and 0.00 for
     every Human, Dwarf, Monster and Angel-reference five. What makes it theirs is the damage formula
     rather than the stat names, for the second time: `def × (1 − pierce)` is computed and _then_
     multiplied by `1 − resist`, so **a pierce never touches a resist** — and the Demon fives carry nine
     and seven magical damage effects with **zero physical**, plus the game's largest `magicPierce`
     (Σ0.30 / Σ0.25 against Σ0.15 everywhere else). The crew built to open armour has no answer to the
     wall that is not armour, which is the Monster third hundred's finding mirrored onto the other damage
     type.
   - ⚠️ **A pairing can be _worse_ than the half, which is chapter 23's finding running backwards.**
     Adding `physicalResist` at the same size read demon-alt 0.95 against `magicResist` alone's 1.15 **and
     lifted every physical crew off 0.00** (monster-ref 0.85, dwarf-alt 0.97, dwarf-ref 0.73) — harder in
     the abstract and **the licence diluted to nothing**. Chapter 23 found both resists at 0.20 worth 1.78
     where `magicResist` alone at 0.30 read 0.32, on a mixed party. **Test the pairing and accept the
     answer in whichever direction it comes.**
   - ⚠️ **A stat carried by _zero_ shipped blocks can grade beautifully and still not be yours.**
     `attackSpeed` sits on **0 of 346** blocks, grades six monotone steps on the Demon reference five
     (4.00 → 2.10 across 0 → 130) and adds only **2.6 seconds** of fight — and cross-crew it costs
     angel-alt **4.00**, dwarf-alt 3.88 and angel-ref 3.42, putting demon-alt **eighth of fourteen**. **A
     speed tax belongs to whichever crew is slowest**, which is the Monster Tower's warning about weight
     axes wearing a new stat. An empty register is a licence to measure, never a licence to author.
   - ⚠️ **The strong sustain absolute is sayable exactly once and only after the anchors retire.** Five
     towers have shipped a false sustain claim and the fix has always been the sentence; the Demon fourth
     hundred is the first that could make the absolute — **no board over its hundred carries a heal, a
     drain, a shield, a `regen`/`barrier`/`aegis` status, or a point of `lifeLeech`, `recovery` or
     `healthRegen`** — and only because four retired anchors were where nearly all of it sat. It was still
     false on the first pass: two Angel legendaries carrying `recovery` and an `aegis` stood on fourteen
     boards, and the fix was **the boards**. **Run the check; expect to fix content.**
   - ⚠️ **A stat can be split into the half a crew answers and the half it does not, and only one of
     them is the axis.** The Angel fourth hundred is the case: `critDamageResist` is subtracted from
     an attacker's `critDamageAmp` and says nothing about how _often_ a crit lands, and the two Angel
     arrangements are the **only two of fourteen carrying a point of it** (0.76 and 0.96 across five
     against 0.00 everywhere else) while `critBlock` — the half that refuses frequency — sits at 0.06
     across five there against the Dwarves' 0.23 and 0.28. Measured, `critChance` grades **3.73 →
     0.48** across 0.09 → 0.46 while `critDamageAmp` at held chance is flat from 0.85 to 1.40 (four
     steps inside 0.14 of a survivor) and needs 1.80, past the shipped maximum of 1.15, to be worth
     what frequency is worth at 0.30. **Ask which half of a stat the crew's answer actually covers
     before concluding the stat is spent or inert.**
   - ⚠️ **The same stat can be two different towers' axes for opposite reasons, and the register check
     is what separates them.** The Elf third hundred built on `critChance` because an Elf five carries
     **zero** `critDamageResist` and **zero** `critBlock`; the Angel fourth built on it because that
     crew carries the most `critDamageResist` in the game and none of the other. At band 4 the two Elf
     arrangements rank **eleventh and tenth of fourteen** on the same axis — the crew gained a rung and
     a kit and the answer moved. **"Two towers with one lock" is a question about the argument, not
     about the stat name.**
   - ⚠️ **A cross-crew table can come back exclusive on the _binding_ arrangement and inert on the
     other one, which is a shape no earlier hundred recorded.** Angel-alt reads 2.90 and angel-ref
     **0.79, eighth of fourteen**, against a second place of 1.39 — so the licence is exclusivity where
     it matters and nothing where it does not, on a tower whose two arrangements fail on opposite axes
     to begin with. **Say which arrangement the licence is over**, because "first of fourteen" and
     "first and second of fourteen" are different claims.
   - ⚠️ **A retirement check on a geared hundred is far harsher than the same check on a naked one, and
     four anchors can go.** The Angel fourth hundred's floor-300 board carried to floor 400 reads
     **0% for both arrangements** where the same check a hundred below read 73% / 50%; the Unmade
     reads 3% / 15% alone behind four soft bodies, the previous hundred's own roof 20% / 33%, and the
     Ashfall Sovereign 95% / **45%**, which fails the alternate's bar. That is the most any hundred has
     retired, against the Elf and Undead pairs and the Monster and Angel clean answers. **State whether
     the board under a retirement figure is wearing gear**, exactly as [gear](gear.md) demands of a
     gear figure.
   - ⚠️ **The prose check can be a _board_ bug rather than a wording bug, and that is the strongest
     reason to run it as a script.** The Angel fourth hundred's first pass fielded five blocks carrying
     a `drain` or a point of `lifeLeech` above floor 300 — on a tower whose own rule forbids enemy
     sustain above floor 160 — and nothing in the sweep noticed, because the boards were tuned with
     them on. The script found them while checking a sentence. **Check the claim; expect to fix the
     content.**

6. ⚠️ **Check which floors the stride samples.** `towers.balance.ts` reads every fourth floor plus
   the roof, so heavy boards on odd floors are invisible to the spine. Same trap as a chapter's
   band openers.
7. ⚠️ **Do not try to make the bottom of a band 2 hard**, but measure how much room there is on the
   tower's own crew before deciding how little the opening bands may carry — the same measurement
   reads three tenths of a second of span against one crew and threefold against another.
8. ⚠️ **Field the _previous_ hundred's roof board at the new roof's level before authoring anything.**
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
9. ⚠️ **A stat can be the axis where every mechanic is inert, and the negative list is the
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
10. ⚠️ **`attackSpeed` is not the free novelty it looks like.** It is the one `StatBlockData` field no
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

| Fires at       | Guard                                                          | Reads now   | The answer                                                                                            |
| -------------- | -------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| every chapter  | `descent.balance.ts` — per-depth finish rate                   | 0.50 deep   | `anchorSlope`, re-derived. **The shape is wrong**; see below                                          |
| every chapter  | `gear.spec.ts` — top grade's share of drops                    | 18.7%       | `gradeSoftness` → 755 at chapter 30. It is always `stages / 2`; what it wants is a saturating tilt    |
| every chapter  | `descent.balance.ts` / `expedition.balance.ts` — deepest depth | **red**     | Re-anchor both modes. `anchorSlope` has no working setting; see below                                 |
| chapter 17     | `gear.spec.ts` — the grade ladder is exhausted                 | Relic 100   | Nothing. There is no sixth grade; write it down                                                       |
| ~~chapter 29~~ | `levels.spec.ts` — rungs unspent above the ladder              | **retired** | Fired at 29 (725 against 700) and was **retired rather than slid** — the fifth guard retired this way |
| chapter 38     | The level curve is consumed entirely                           | 725 / 1000  | 30 levels a chapter against a cap of 1000. Append rungs above `ascended-5`, or the campaign closes    |
| ~chapter 180   | `gear.spec.ts` — "roughly doubles what gold is for"            | —           | Gear costs that scale with content, a milestone-sized retune of `data/gear.ts`                        |

⚠️ **`gradeSoftness` fired again at chapter 21 and read 20.3% at nine hundred and seventy stages;
`stages / 2` = 485 restored 18.7% for the fifteenth time.** That is fifteen landings on one figure
with one solution, and it remains the strongest evidence in the project that the _shape_ is wrong
rather than the number. ⚠️ **Predict it from `CHAPTER_CURVE` rather than from the last chapter's
length** — chapter 20's prediction was wrong by five only because it assumed a fifty-stage chapter,
and chapter 21's, predicted a chapter ahead as 485, was right. ⚠️ **Chapter 22 landed on it and
wanted 515, exactly as predicted — the sixteenth landing and the third correct prediction.** It read
20.2% at 1,030 stages. Chapter 23 wants **545**; a session with the appetite should write the
saturating tilt rather than re-derive `stages / 2` a seventeenth time. ⚠️ **Chapter 23 landed on it and wanted
545, exactly as predicted — the seventeenth landing and the fourth prediction checked a chapter
ahead.** It read 20.2% at 1,090 stages. Chapter 24 wanted **575**. ⚠️ **Chapter 25 landed on it and wanted
605, exactly as predicted — the nineteenth landing and the sixth prediction checked a chapter
ahead.** ⚠️ **Chapter 26 landed on it and wanted 635, exactly as predicted — the twentieth landing
and the seventh prediction checked a chapter ahead.** ⚠️ **Chapter 27 landed on it and wanted 665,
exactly as predicted — the twenty-first landing and the eighth prediction checked a chapter ahead.**
⚠️ **Chapter 28 landed on it and wanted 695, exactly as predicted — the twenty-second landing and the
ninth prediction checked a chapter ahead.** ⚠️ **Chapter 29 landed on it and wanted 725, exactly as
predicted — the twenty-third landing and the tenth prediction checked a chapter ahead.** Chapter 30
wants **755**. **Twenty-one landings is well past the point where re-deriving is
learning anything**; the next session in `data/gear.ts` for any reason should write the saturating
tilt while it is already there.

### ⚠️ Chapter 16 retired the "charges real time" ceiling — the fourth guard retired rather than slid

`levels.spec.ts` held the top of the ladder's levelling demand under 24 hours of idle income and The
Spoilfield read **26.16**. ⚠️ **It was not content outgrowing a threshold.** Recomputed for every
chapter's own top level at that chapter's own income it reads **7.47, 9.03, 12.29, 14.33, 18.49,
21.05, 26.16** for chapters 10 through 16 — monotone increasing by construction, because the level
cost curve is exponential in the level while `STAGE_REWARDS.exponent` is 1.0 and income is therefore
linear in the stage index.

⚠️ **The marginal form does not rescue it, which is what settled it.** Measured as one chapter's 25
levels at that chapter's own income — the shape that normally makes a quantity content-relative — it
reads **3.04, 2.39, 4.16, 3.16, 5.35, 3.98, 6.61**. Gold and XP are nearly flat (1.22 → 1.74 and 1.41
→ 1.85 marginal; 10.5 and 11.7 cumulative); **essence alone runs away**, and "scale all three base
rates together or none" means it cannot be answered by moving one of them. The floor is kept, the
ceiling is gone, and what is left is a **finding** for the release-time economy pass rather than a
number in a spec file.

### ⚠️ Chapter 16 put the Descent and Expeditions red, and the fix was to stop trusting the anchor

Both modes derived board levels from the campaign **level** at a depth, which climbs 25 a chapter,
while the party each depth implies is **bisected against the chapter final** — and finals have been
getting _lighter_ for three chapters because of the rarity cap's gradient. Measured, the bisected
party reads 244.7 at depth 600, 247.7 at 650 and **242.7 at 700**: flat, then backwards.

⚠️ **`anchorSlope` was swept and no value passed** — 0.022, 0.010, 0.005 and 0.000 all read 0.00
finished at the deep end, and 0.000 already broke the mid-campaign walkover bar in the other
direction. **A dial with no setting that works at both ends of its range is the wrong dial**, the
third time this project has reached that conclusion after `gradeSoftness` and the flat Descent offset.

**Both modes now clamp the anchor** — `DescentLevelData.anchorCap` at 316 and
`ExpeditionRulesData.anchorCap` at 322 — and the clamp binds only above its own value, so **no depth
below it moved and no offset had to be re-derived**.

### ⚠️ Two findings from that work worth carrying into any mode keyed off the campaign

1. ⚠️ **The level gap does not predict difficulty; the power ratio does.** Measured across nine
   depths, a gap of +44 read a full walkover and +49 read 3.75 survivors — because party power is
   `perLevel ^ level × 1.6 ^ rung` and the ascension ladder moves the second term in **steps of 22.6
   levels** (`ln(1.6) / ln(1.021)`). Board-over-party power, by contrast, is monotone: **0.29 → 1.00
   finished, 0.42 → 1.00, 0.50 → 0.75, 0.54 → 0.40, 1.02 → 0.00.** A ratio near **0.50** is a mode
   working. **Convert to power before picking a level**; the naive clamp to the rung's own cap of 260
   reads 5.00 survivors — a walkover — because the party stands 17 levels under its cap holding five
   rungs.
2. ⚠️ **When every reading saturates, tune against the sweep's own control instead.** Expeditions is
   one-time content meant to become a completion, so every depth above its unlock reads 1.00 finished
   by design and no cap can be chosen on a finish rate. What chose it was the carded-against-bare
   control: 0.00 survivors of margin at cap 316, **+1.60 at 322**, −1.30 at 328. ⚠️ **A cap that reads
   5.00 survivors passes every assertion in that file while measuring nothing** — do not take the
   first green value.

⚠️ **Both caps move when a chapter asks for a _rung_ above `legendary-plus`, not when a chapter
ships.** That is the whole gain: `anchorSlope` needed re-deriving once a chapter for four chapters
running, and this needs it once a rung.

### ⚠️ Both modes' depth samples were hand-picked and both had the same hole

The Descent's `DEPTHS` sampled chapters 3, 4, 5, 7 and the top of the ladder; Expeditions' sampled 3,
5, 7 and the top — so **chapters 8 through 15 were unmeasured in both**. Both are now **derived from
the chapter list**: every chapter end from the unlock up. ⚠️ **A hand-picked sample acquires a hole
every time the campaign grows and a derived one cannot**, which is the same argument that put
`chapterEnd(unlockChapters)` in place of a literal in the first entry.

⚠️ **Deriving a sample silently re-points every index into it.** Expeditions measured its card
control at `DEPTHS[3]` — the deepest sample under the old list, and chapter 6 under the new one — and
every such assertion kept passing while measuring something else. **Name the depth; do not index the
sample.**

### ⚠️ Closing that hole found a sawtooth, and it is not tunable

The Descent's difficulty **sawtooths with the ascension ladder**. The party a depth implies is
bisected against that chapter's final and given `rarityFor(that level)`, so its power is
`perLevel ^ level × 1.6 ^ rung` and the second term steps by **22.6 levels** at each cap. Measured
across all fourteen depths, the power ratio dips exactly on the crossings — 0.42 at chapter 7 and
**0.29 / 0.34 / 0.34** at chapters 12 to 14 against about 0.52 elsewhere — and chapters 12 to 14 read
**5.00 / 4.90 / 4.90** survivors of five: walkovers.

**Three levers were measured and none flattens it**: `anchorSlope` breaks chapter 10 before it moves
the trough, `anchorCap` can only lower a board where the trough needs raising, and widening the
within-run ramp puts seven depths under the floor before the trough breaks. ⚠️ **The reason is
structural — the sawtooth is periodic in the ascension ladder and every dial is a smooth function of
the anchor.** Cancelling it needs a board that steps where the _party_ steps, and the party's rung is
a fact about how each chapter final was authored rather than anything the anchor knows.

⚠️ **So the trough is pinned rather than dropped.** `RUNG_TROUGH` names those three depths and
asserts what is true of them — 4.85 to 5.00 survivors — which keeps the defect visible, stops it
spreading, and **self-deletes**: a retune that fixes it makes that assertion fail, and the response is
to delete the block rather than widen anything. **Dropping the depths instead would have put the hole
straight back where the derived sample was written to close it.**

### ⚠️ The roster-relative crystal ceiling fired at chapter 14 and was **retired**, which is the fourth

`banners.spec.ts`'s "never pays out the whole roster faster than a run can enjoy it" read **29.99
days** against a bar of 30 the day the ladder reached six hundred stages, and it is gone.

⚠️ **It failed in exactly the way it was written to fix, and that is the finding.** It replaced two
bounds that measured the ladder against itself, on the argument that measuring against the **roster**
would make it independent of content. It is not: the roster is _static_ content and the ladder is
_growing_ content, so `ROSTER_COPIES` is a constant while `pullsPerDay` climbs linearly. Measured —
38.2 days at 450 stages, 35.0 at 500, 32.3 at 550, **30.0 at 600**, 26.2 at 700, 19.1 at 1000 — it is
monotone decreasing and nothing has to be wrong for it to fire.

⚠️ **The answer its own comment prescribed was measured and is not available.** "Look at whether the
roster has kept up" costs **five new ascended-tier characters per chapter, forever**: 5 to hold 30
days at 650 stages, 10 at 700, 20 at 800, and roughly 200 by the ~100 chapters the campaign is planned
for. Milestone 20 added **seven** and was a whole milestone; seven here buys 33.3 days and fails again
at chapter 15. **When the honest restatement of a guard is a number that has to move every chapter, the
guard is pointed at the wrong quantity.** What is still bounded is the thing that was ever at risk — a
crystal rate that _compounds_ past a flat `PULL_COST` — and `SUMMON_RATE.perStage` stays at 1.

### ⚠️ Two more guards now have the `gradeSoftness` diagnosis, and both arrived in chapter 13

**The Descent's `anchorSlope` is the second dial whose shape is wrong.** Milestone 27 added it at
**0.11** because the mode's deepest depth had stopped being a fight; one chapter later that depth read
**0.30 finished and 2.45 survivors** against a floor of 0.40 — the same dial overshot in the opposite
direction, in one chapter. 0.10 restores 0.50 / 3.50 and moves the four shallower depths by at most
one reading.

⚠️ **The arithmetic says it will fire every chapter and that no constant fixes it.** A chapter raises
the anchor by 25, which raises the Descent's boards by 25 **plus the slope's own 2.75**, while the
party the depth implies is bisected against the chapter final and rose only **20** (201 at anchor 250,
221 at 275). So the gap widens about **7.75 levels a chapter, by construction**. The reason the party
gains less is a **rung**, and it is a step: at anchor 250 the bisection landed on 201, one level past
`legendary`'s cap of 200, and arrived carrying a fresh ×1.6; at 275 it lands 39 levels inside the same
rung and carries nothing. **Milestone 27 recorded that step as a red herring for the easiness it was
fixing; it is the direct cause of the hardness measured here.** What it wants is a board level keyed
off the _calibrated party's own level_ rather than off the anchor, so the rung step cancels instead of
accumulating.

**`chapters.balance.ts`'s `MOMENTUM_CEILING` has stopped being able to bind at the newest seam, and
the fault is its denominator.** It is a share of the **whole ladder** while the slice it is applied to
is only the chapters above the seam — so at 550 stages the bar is 165 boards and the newest slice is 50. Measured, chapter 12's party clears all fifty of The Quarry and the assertion passes. It went
vacuous for the newest seam at 167 stages and now cannot bind for the three newest: 150 boards, 100,
50, all against 165. ⚠️ **This is not a threshold content outgrew — nothing drifted, the guard's shape
stopped matching the ladder** the moment a chapter became smaller than the share. The honest repair is
a share of the _slice_, which re-derives every seam assertion at once. **Do not widen it**; widening is
the wrong direction and is forbidden anyway.

**`signature.balance.ts`'s adjacent-rung reach check needed a tolerance, and it is not slack for
noise.** The Quarry moved `contested()` from `c12-s50` to `c13-s50` and Seraphine's top rung measured
**430 against 431** at the rung below — checked at fourteen bisection steps and 200 trials instead of
ten and 60, and it still reads −1, so quantization is ruled out. The cause is her capstone doing what
it says: it makes `unwavering-light`, an `ally-all` heal that is her **ultimate**, unconditional — so
at the damage margin where reach is measured, a healing turn is a turn not spent on Judgement. **It is
the only rung in fourteen characters that trades in that direction, because it is the only one that
unconditions a heal.** The guard now allows a half-percent drop, stated as a fraction so it does not
need moving as reach grows; a dropped clause still reads three to seven times that.

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

⚠️ **0.11, then 0.10, then 0.075, and now 0.022** — a fourth setting in four chapters, each with a
one-chapter life, which is the shape finding stated as a schedule rather than as an argument.

⚠️ **And chapter 15 is where the closed form that replaced the bisection broke, which is a second
finding about the same dial.** Solving "hold the party-to-board gap where it was" predicted **0.075**
for chapter 14 exactly; for chapter 15 it predicted **0.058** and the answer was **0.022**, three
times out. The form assumes the calibrated party rises about 20 levels a chapter, which held while
chapter finals were authored at a steady weight — and The Underroad's final is roughly _half_ The
Doorstone's stat line, so the bisection rose only **9.7** (235 → 244.7 across the three sampled locks)
against an anchor that rose the full 25. **Measure the bisection at both depths before predicting**,
and do not carry the per-chapter figure forward: it is a fact about how the chapter above was
authored, not about this dial. The stale note below is the milestone-27 reading — the table below is
the milestone-27 reading and the deep column is stale. See the `anchorSlope` finding above for why no constant here lasts, and
`data/descent.ts` for the arithmetic.

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
on 18.7% ten times and the solution has been `stages / 2` every time, which is what turned a tuning
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
