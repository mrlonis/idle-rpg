# Testing and the balance sweep

`AGENTS.md` states the testing rules. This file is the reasoning behind the ones that are not
obvious, and the record of what the balance sweep has actually caught.

**There is no telemetry and there never will be**, because there is no server. Nobody will ever know
which stage players wall on, which characters go unused, or how many runs end in the first hour. The
genre tunes against millions of players; this game has a sample size of one. Two things follow, and
both are load-bearing:

- **The balance sweep is not a testing convenience, it is the substitute for players.** It is the
  only instrument this project will ever have for finding out whether the game is tuned.
- **A bad curve cannot be hotfixed.** Every balance change ships through App Store review, so the
  gap between shipping a wall and fixing it is measured in days. That is a standing argument for
  erring generous everywhere.

When evaluating balance, look at the **5th percentile** player, not the mean. In a paid game the
unlucky tail buys its way out; here they cannot, so they are the design target.

---

## Two suites, and where the line is

`npm run test:unit` runs the fast suite on save. `npm run test:balance` runs `src/**/*.balance.ts`
against `vitest.balance.config.ts`.

The split arrived in milestone 7 and the trigger is worth recording. Before milestone 4 a full sweep
of the ladder was milliseconds; skills, statuses and `Decimal` quantities made a battle roughly a
millisecond on its own; then milestone 7 doubled the ladder and added a third reference party, at
which point three parties across twenty-four stages at forty seeds was thousands of battles and more
than ten seconds. ⚠️ **Moving the sweep was the answer, not shrinking the sample** — a smaller
sample buys speed by making the answer less true.

- `data/chapters.spec.ts` keeps what is fast and structural: chapter lengths against the curve, ids,
  rank sizes, factions, the boss rhythm, and the monotonicity of the level, rate and reward curves.
- `data/chapters.balance.ts` holds what has to be simulated: the reference-party sweeps and the
  per-stage difficulty probe.
- `data/towers.spec.ts` and `data/towers.balance.ts` are the same split for the towers, and milestone
  15b drew the line in the same place twice over. Two blocks started life in the balance file and
  moved: a "floor pays less than the campaign stage of the same number" check, which needs no
  simulation _and_ turned out to be false — the tower's level line is steeper than the campaign's
  early on, so floor 26 legitimately matches stage 36 — and the whole-tower crystal total, which is
  arithmetic over resolved content. ⚠️ **The test to be suspicious of is the one in the balance
  project that never calls `simulateBattle`.**

`*.balance.ts` files are excluded from `tsconfig.app.json` so the app never bundles them, and
included in `tsconfig.spec.json` so typed linting still covers them. A new one needs both.

### Striding is not shrinking the sample

Milestone 11 is the one place this distinction is licensed. That milestone did not add difficulty,
it made the same range four times denser, so adjacent stages sit within about one percent of each
other — and the blocks measuring a _step_ (the difficulty probe, the matchup matrix) measure noise
at that spacing. Every fourth stage plus every chapter boss restores the per-sample gap to what the
twenty-four-stage ladder had, over the same range, at the same resolution.

**The load-bearing assertions still read every stage**: zero timeouts, the starter wall, and the
timer headroom.

---

## The guards that stand where a mechanic used to

### The zero-timeout guard

Milestone 8b deleted the MP pool, which was the guarantee that a fight against a healer resolves. A
single assertion replaced it: **no reference party ever runs the clock out, winning or losing.**

⚠️ **It reads `BattleResult.timedOut`, not the outcome.** A timeout and a wipe are the same `defeat`
on screen, so an outcome-based version passes forever while testing nothing. Do not rewrite it in
terms of the outcome, and do not narrow it to the parties that win.

Milestone 8c widened it with a `parties nobody tuned for` block covering solo and two-character
sustain parties, after finding 238 stalled battles that the five-character sweep could not see. What
that block asserts is deliberately not a balance claim: **those parties are allowed to lose, and not
allowed to lose slowly.** It also asserts a lone character can still clear _something_, so the
ninety-second timer never becomes a minimum party size by the back door.

Milestone 14a is where the hole finally closed for good — closing pressure in `core/battle/clock.ts`
is a termination argument rather than a timer. See [combat](combat.md).

### The timer-headroom assertion

The ninety-second timer is a budget every encounter has to fit inside, so the sweep asserts the
margin directly — it should go red naming a stage before any win-rate assertion does. Headroom is
**1.44×** over the longest fight a party clears.

⚠️ **It measures fights a party _clears_, and that scope is load-bearing.** It used to read every
fight, which was accidentally fine while the sweep held four parties; adding seven mono-faction
fives made the longest fights in the file celestial parties dying slowly to a stage they clear three
percent of the time. A fight the party loses has no tuning claim on it. Losing fights are bounded
separately, at 95% of the timer, and by the zero-timeout guard. **Do not widen it back to every
fight** — it would fail on parties nothing is tuned for, which is not what it is for.

### Cap-checking the reference parties

Milestone 7 found the mid-game reference party was five characters at level 80 with no ascension at
all — and the rung below caps at level 40, so the number the whole mid-ladder was tuned against
described a party that **cannot exist**. `at()` scales whatever it is handed; only `levelUp` enforces
the cap, and no sweep goes through it. Parties are now checked against their own rarity's cap on the
way in.

### ⚠️ A rarity id protects against reordering, not against insertion

When the ascension ladder grew two rungs below `rare`, the sweep caught three things nothing else
would have — each of which passed type-checking and the unit suite first:

1. **The reference parties silently gained ×2.56.** `chapters.balance.ts` fielded them at
   `rarityIndex('rare')`, which the file had adopted specifically to survive the ladder being
   _reordered_. It does not survive the ladder gaining a rung _underneath_: `rare` stopped meaning
   "where a character starts" and started meaning "two ascensions in". **The starter wall evaporated
   and the sweep went on passing, describing a different game.**
2. **`BUILT`'s level was a literal** 40, because 40 _was_ the cap of the rung below. It derives from
   `LEVEL_CURVE.caps` now, and the party it describes stayed the party the prose describes.
3. **The level-vs-ascension ratio used a rarity index as a rung count.** They were the same number
   only while common-tier characters started at index 0.

**Anything meaning "how far has this been invested" has to count rungs from a floor**, never read an
id. The same insertion is also a save migration rather than a content edit — see [saves](saves.md).

### ⚠️ Two halves of one assertion must describe the same party

Chapter 3 found a fourth thing, of the same family and worse: "levelling and ascension are worth
about the same" measured `INVESTED`'s **level** against `LEGENDARY - RARE` **rungs** — and `INVESTED`
has never stood at `legendary`. The two halves of one ratio described **different parties**, and it
passed for six milestones because at level 85 the mismatch happened to cancel.

Nothing structural could have caught it: both halves type-check, both are derived from named
constants rather than literals, and the test's own prose ("the four rungs it also holds") reads as
though it had been checked. What exposed it was moving the ladder underneath it, which is the same
mechanism as everything above — content growing until a coincidence stops holding.

**The rule that generalises: when an assertion compares two quantities, derive both from the same
subject.** Both halves are now the climb from `BUILT` to `INVESTED`, so a party that changes moves
both of them or neither.

### ⚠️ A guard measured in absolute time will rot on a growing ladder

The third one chapter 3 tripped, and the only one where the right answer was to delete the
measurement rather than retune the content. `levels.spec.ts` held "level 1000 costs more than 500
hours of top-of-ladder income" — but income at the top of the ladder rises with every chapter **by
design**, so that figure has to fall forever: 1,175 → 588 → 372 across two changes, reaching a
weekend around chapter twelve with nothing wrong.

A threshold guaranteed to fail on all ninety-seven remaining chapters is not a guard being tripped;
it is a guard pointed at the wrong quantity. **Before retuning content to satisfy a failing
threshold, check whether the quantity it measures is one the roadmap requires to move.** If it is,
the fix is a ratio between two things the content supplies — income cancels out of those, which is
usually the tell that you have found the invariant.

### ⚠️ A ratio rots too, whenever only one side grows

Chapter 4 is where the lesson above stopped being about absolute quantities. **Three guards fired at
once and none of them was about chapter 4** — each was a ratio whose numerator and denominator grow
at different rates by construction, which is the same disease as measuring in hours and is much
harder to see, because a ratio _looks_ like the fix for the previous case.

| Guard                  | Ratio of                       | 2 ch | 3 ch | 4 ch     | 5 ch |
| ---------------------- | ------------------------------ | ---- | ---- | -------- | ---- |
| Levelling vs ascension | levels gained ÷ rungs gained   | 0.77 | 1.50 | **3.26** | 7.10 |
| Tower payout           | 7 fixed towers ÷ campaign      | 3.17 | 2.12 | **1.59** | 1.27 |
| Idle crystals          | rate at full clear ÷ base rate | 2.0  | 2.5  | **3.0**  | 3.5  |

The tell is the same in all three: **one side is a function of the ladder's length and the other is
not.** A fifty-stage band adds ~65 levels and exactly one rung; it adds stages and no tower
floors; it adds crystals an hour to a base that never moves. (The chapter columns above are the
pre-re-cut fifty-stage chapters; since milestone 19 the bands and the chapter numbers no longer
coincide, and the ratios move with the bands.) Nothing is wrong in any of the three —
the number moves because a chapter shipped, which is what chapters do.

Three ways out, and which one applies is worth thinking about rather than guessing:

- **Change the space.** Levelling-versus-ascension became the rungs' _share_ of the climb, measured
  in logs — the space multipliers actually compose in. The share falls slowly and asymptotes (55%,
  45%, 40%, → ~26%), so a floor under it holds indefinitely and still fails if ascension is ever
  reduced to a formality.
- **Change the denominator to something that grows with the numerator.** The crystal ceiling became
  "a full clear must not buy the roster's copies in under thirty days". A roster that grows raises
  it exactly as a ladder that grows lowers it.
- **Accept the decay and schedule the reminder.** The tower floor moved 2 → 1.5, which buys one
  chapter on purpose. Sometimes the ratio falling _is_ the signal — seven hundred floors really is
  becoming a smaller share of the game — and the honest response is a note that fires again soon
  rather than a bound engineered to stop asking.

⚠️ **What is not on that list is widening the band.** Every one of these had already been widened at
least once, and each widening bought exactly one chapter and hid the diagnosis for another milestone.

#### ⚠️ A rotting ratio can be the content's problem rather than the guard's, and chapter 7 is the case

Every example above is a guard pointed at a quantity the roadmap requires to move. **The reverse
happens too**, and it is much easier to mistake for the first kind because it presents identically —
a number that has drifted for three chapters and finally crosses a line.

`chapters.balance.ts` holds that the top of the ladder still **costs the reference party something**.
Party power ÷ the difficulty probe's threshold at each chapter's final read 1.08, 1.44 and then 2.08,
and at 2.08 the party finished the chapter boss with all five alive. That looks exactly like a ratio
rotting by construction — and it was, but the rot was in the **level line**, not in the assertion.
Each chapter hands the party a fresh ascension rung (×1.6) on top of the levels it climbs while the
content climbs only the levels, so the fixed +25-level margin the roadmap specified was paid once and
never again.

⚠️ **Milestone 21b then over-corrected in the other direction, which is worth knowing before trusting
any arithmetic here.** 21a's replacement rule — "+23 levels a chapter" — put chapter 8 at a margin of
+71, and the party it was tuned for took the final at **0%**. The missing term is the enemy's own
growth curve: an `ascended` block climbs on `perLevel.ascended` where the party climbs on
`perLevel.common`, and that 1.024-against-1.021 gap compounds over the **whole** level rather than
over the chapter — worth about fifteen levels a chapter at this depth. **Both corrections were found
the same way, by authoring a chapter to the rule and measuring it.** The transition is a step
function (100% at level 398, 85% at 400, 0% at 408), so bisect for the edge; the arithmetic is only
for knowing which direction to guess in.

**How to tell the two apart: ask what the assertion would have to become.** Widening this one means
saying the ladder's top may be a walkover, which is not a claim anybody would write down on purpose.
When the honest restatement of a guard is something you would refuse to author, the content is what
moved. See [milestones](milestones.md) for the corrected margins.

---

## Derive, never retype

A spec in `data/` that copies a number out of a neighbouring file has turned a coupling into a
comment: it keeps measuring the old value forever and passes happily while the thing it claimed to
protect drifts.

**Prefer a threshold that fails when content outgrows it to one that documents an intention.** When
such a test fails after new content lands, the right response is to retune deliberately — not to
move the threshold to make it green.

Three times this has paid for itself:

- Milestone 7 doubled the ladder, and `levels.spec.ts` failed because it reads rates off the content
  rather than restating them. **The rate slope was retuned, not the threshold.**
- The same doubling tripled the crystal rate and `banners.spec.ts` fired. The crystal curve was
  flattened rather than the band widened.
- 14b's first draft shipped weekly quest targets of 40 and 10 against dailies worth 35 and 7.
  `quests.spec.ts` derives the bound from the daily targets; **the content was retuned**.

The counter-case is worth knowing too: when the crystal payout was flattened and redistributed, the
achievement track deliberately became worth _more_ than the ladder's first clears. Moving a
threshold to make a test green is forbidden, so the assertion was **replaced rather than adjusted** —
it now holds the ratio within a factor of two either way, which states the new intent and still
fires when one side is retuned without the other.

Conformance in `data/` is asserted through **typed locals** (`const chapters: readonly ChapterData[]
= CHAPTERS`) rather than annotations on the data itself, because `data/` may not import `core/`.
That assignment is what turns a malformed stat block into a compile error.

---

## Two traps in measuring a balance edge

Both were hit before milestone 8e got the matchup measurement right, and both generalise.

- ⚠️ **Averaging over the whole ladder makes any edge look decorative.** At a fixed investment the
  ladder is close to a step function — a party clears everything up to its level and nothing past it
  — so most stages were never in doubt and dilute the answer to nothing. **Sweep investment levels**
  to produce contested fights to measure. Done that way, switching the faction matrix off moves the
  fights genuinely in doubt by about **seventeen points of win rate**.
- ⚠️ **"The mechanic never turns a loss into a win" is the wrong assertion, and it fails.** A
  mono-Angel five goes from 0% to 79% on one stage with the matrix on. That is not a rescue, it is
  what a tiebreak looks like on a step function: "loses at zero percent" and "is one exchange short"
  read identically. The assertion that works measures the edge in the currency a player spends — a
  matchup-assisted fight must never beat the same fight ten levels higher with the matrix off.

**Win rate near a damage threshold is a step function** is the general form, and milestone 12 hit it
again from the other side: a continuous power dial like gear will always land some configuration on
a threshold, so what the zero-timeout guard really asserts is that no _reference_ party does.

### A third trap, from the towers: the control has to change one variable

Milestone 15b needed to show that a tower's counter-faction bias is worth something, and got there on
the third attempt.

- ⚠️ **Comparing a different party measures the party.** The obvious control for "is the Human tower
  harder for Humans" is to sweep it with an Undead five at the same investment. It was slower on every
  floor — because that five is simply a weaker party. Two variables, one number.
- ⚠️ **Fight length is not difficulty when the mechanic cuts both ways.** The matchup matrix costs the
  crew 5% against the Undead half of the tower and _pays_ it 5% against the Monsters and Dwarves
  anchoring the front ranks, so the biased tower measured **faster** than a neutral one. An assertion
  in seconds would have read as the bias making the tower easier.
- **What worked is a counterfactual built from the same content**, in the currency the mechanic
  actually charges: rewrite every enemy's faction to the tower's own — the mirror match the design
  explicitly rejected — and measure **party members lost**. About 5% more over a full climb.

⚠️ **And when a party is tuned to clear everything, win rate measures nothing.** A tower's reference
crew clears all hundred floors by design, so the assertions that carry weight are about **cost** —
fight length, survivors, and a ramp between the halves. The one contested measurement available is a
_second_ legal five, which is also the honest question: does the tower ask for an investment or for
one solution?

### A fourth trap, from signature items: the band may be narrower than the content

Milestone 16 hit the step function a third time, from a direction the earlier two do not cover, and
it took **three attempts** to measure a signature item at all.

- ⚠️ **A fixed enemy level measures nothing when the party outclasses every stage.** `mythic` caps
  at level **340**; the hardest authored stage is level **85**. A party at the signature unlock rung
  is four times past the top of the ladder, so the first probe — win rate against the nearest stage
  — reported a gain of exactly **zero on all seven characters**, because both sides of the
  comparison were pinned at 100%.
- ⚠️ **Re-levelling the encounter is necessary and not sufficient.** Fielding the hardest line-up at
  the party's own level produced zero again, this time with everything at 100%; doubling it produced
  zero with everything at 0%. The contested band turned out to sit about **20% above** the party's
  level and to be roughly **forty levels wide** out of a thousand-level range. Any fixed choice is
  either a walkover or a wipe, and a level picked to make one measurement work stops measuring on
  the next retune.
- **What worked is bisecting for the edge**: the highest enemy level the party clears at least half
  the time. That answers the question that actually matters — how much further up the curve does
  this carry a party — in a unit that survives retuning. It is the same conclusion milestone 8e
  reached ("measure the edge in levels of investment"), arrived at independently because the earlier
  lesson was written about **averaging**, and this failure was about **choosing a point**.

⚠️ **The two units disagree wildly and both are honest.** In reach, a maxed signature item is worth
**+3% to +8%**. In win rate at a contested level, the same item takes four of seven characters from
**0.00 to 1.00**. Neither is the "real" number: a small gain in reach is the whole fight at the
margin, and the margin is where every fight a player has not already won sits. Quote whichever the
question calls for, and never cite the reach figure as evidence a mechanic is small.

**The corollary is a content fact rather than a testing one:** a mechanic gated far beyond the
authored ladder has nothing to be swept against, and no sweep over shipped stages can ever bound it.

### ⚠️ A fifth trap, from chapter 7: what a board asks and what it weighs are different numbers

The difficulty probe bisects for the **power multiplier** at which the reference five clear a stage.
That is the right unit for a difficulty curve and it is blind to everything a board is actually
_about_. Milestone 21a hit it twice in one chapter and the second one is the instructive one.

- **`c7-s21` was authored deliberately heavy** — five bodies with a legendary front rank, written
  that way _because_ the Sundered Vault had recorded the band-opener trap one chapter earlier — and
  it still measured a step backwards, 212 after 313. The board's question is thorns on **fodder**,
  which is expensive to answer and cheap to kill: a Cairnward Husk charges a quarter of what reaches
  it and then dies. Knowing about the trap did not help, because the fix the earlier lesson names
  ("fix it with weight, not levels") assumes the author can tell weight from difficulty by looking.
  **They cannot.** Run the probe over a chapter's samples before believing its spine escalates.
- **A boss that taunts measured _easier_ than one that does not.** The first Cairn King wore the
  chapter's own lock — a taunt on a thorned body — and it made the fight worse for the boss: a taunt
  aims every attack at the body the party was going to focus anyway, and the turn spent applying it
  deals nothing. 738 against the previous stage's 878, on a chapter _final_. A mechanic that is a
  lock when a wall wears it can be a **discount** when the thing behind the wall wears it.

The general rule: **a board's question and a board's weight are independent, and only one of them is
measured.** Author for the question, then check the weight, and expect them to disagree.

Milestone 21b hit the same trap a third time and got a number out of it. `c8-s23` and `c8-s19` are
the **same shape** — two legendaries in front, two legendaries and a common behind — and the first
measured 1,859 against the second's 2,588. What separates them is the lock: a **taunt in front of
archers** is worth about a quarter more than a **bound back rank**. A bind costs the party its route
and a taunt costs it its targets, and the probe reads the second as heavier. It took two passes of
adding weight to clear the tolerance.

### ⚠️ Check a chapter's header against its boards with a script, not by reading

Three sessions in four have found a chapter's own prose wrong about its own boards: chapter 7's Cairn
King note, chapter 8's "no celestial appears here", and chapter 10's "nothing that puts health back
stands on a board with a taunt" — which shipped a `lifeLeech` body behind the taunt on one board of
fifty. **The boards are swept and the prose is not**, so an absolute claim in a header is the one
kind of documentation nothing in the suite reads.

Every such claim is a two-line predicate over the chapter's `stages`: at most one taunter per board,
no sustain on a taunt board, no celestial anywhere, no other chapter's final. Running them takes
seconds. **Reading fifty boards carefully does not work** — it has now failed three times, and the
third failure was on the session that wrote the rule down.

These are deliberately **not** specs. A chapter's authoring rules are that chapter's rather than the
game's, so asserting them in `chapters.spec.ts` would either be wrong for the next chapter or grow a
per-chapter branch. A scratch script run once at the end of authoring is the right weight — the same
place the tuning probes sit.

### ⚠️ A sixth trap: the probe's bracket is content-sized, and it fails silently upward

`threshold()` bisects in log space between a `low` and a `high`, and `high` was 4,000 — set when
milestone 10's rescale took the top stage from asking ×6 of the reference five to ×370. Chapter 8
walked through it. **What that looks like is not an error**: `high` never moves, so the function
returns exactly the bracket ceiling, on every stage past the point the ladder outgrew it — a
difficulty curve that silently flattens into a horizontal line at a plausible-looking number, with
every "does this stage ask more than the last" assertion passing on ties.

The one line that catches it is the `expect(clears(high))` beside the bisection, which asserts the
bracket actually spans the stage. **Keep it, and widen the bracket and its step count together**: a
bisection halves its log range per step, so a wider bracket at a fixed step count silently coarsens
the resolution instead.

⚠️ **"Roughly every other chapter" turned out to be _every_ chapter at this depth**, and the reason is
worth carrying: the bracket has to span the **party's** power, `1.021 ** (level - 1) × 1.6 ** rungs`,
which grows with the margin rule rather than with the stage count. It went 4,000 → 50,000 over 14
steps, → 500,000 over 16 (chapter 9, asking 135,000), → **5,000,000 over 17** (chapter 10, asking
1,193,000).

⚠️ **The ceiling and the step count do not move on the same schedule, which is the half that reads
backwards.** A factor of ten on the range costs almost nothing in resolution because `2^n` is already
enormous — 16 steps over `[0.05, 500000]` resolves to 0.03% and over `[0.05, 5000000]` to 0.028% —
while a single extra step nearly halves it, to 0.014%. So **widen the ceiling every chapter and add a
step every few**, and check the arithmetic rather than applying a rule of thumb.

### Scope a timeout guard to fights the party wins

⚠️ Milestone 16 re-learned this the direct way. The signature probe's ninety-second guard read the
longest fight of **every** trial, and Thraun broke it immediately: a five of him carries 29 `atk`,
so five walls do not lose a fight — they fail to finish one, and every losing trial is a timeout by
construction. The guard reported the wall as breaking the timer.

A mono-Thraun five is not a party anybody can field, since the roster ships one of him. So that was
the **control** failing, not the content — and the fix is the scope `chapters.balance.ts` already
uses and [combat](combat.md) already argues for: **measure the longest fight the party wins.** A
fight the party loses has no tuning claim on it.

---

## `core/` specs

They run in `environment: 'node'` with no Angular TestBed. **If a core spec needs a TestBed, the
boundary has been violated.** Determinism makes exact assertions possible; prefer them over
tolerance ranges where the seed is fixed.

The project's highest-value invariant is pinned in `core/offline.spec.ts`: **the closed-form offline
resume agrees with stepwise accrual**, asserted on relative error (not `toBeCloseTo`, which is
absolute decimal places and fails once numbers get large) and checked at magnitudes past float64's
exact-integer range.

⚠️ **That case carries an explicit 30s timeout and the replay must not be shrunk to fit.** Its
360,000-tick replay was already at ~98% of vitest's 5s default under v8 coverage when gear added a
sixth currency — `credit` loops over the wallet, so that is 13% more work in the hot path. The step
count is what makes the invariant mean anything.

---

## The gap nobody has closed

**There is no single-slot composition proof anywhere in the project.** Milestone 4 shipped one — two
parties differing in exactly one slot against the stage-7 healer lock, where the party with back-row
reach won almost every time and the harder-hitting front-only one won almost never — and it did not
survive the move to the balance project.

⚠️ **Three later milestones were each expected to close it and none did**, which is recorded so it
is not tried a fourth time:

- **8c's skill gating** moves a party's power without changing which question it answers.
- **8d's lineup bonus** pays every faction the same rung for the same shape, so it separates
  _compositions_ rather than characters.
- **8e's seven-deep factions** do make two genuinely different answers to one lock fieldable, but
  the sweeps it added compare _factions_, and the per-stage spread it measures is a statement about
  composition again.

Closing this needs a probe that swaps **one character for another in an otherwise fixed party**,
which nothing in the file does. What is asserted today is the boundary itself — three level-1
starters clear to the healer lock and stop — which is a statement about investment rather than
composition.
