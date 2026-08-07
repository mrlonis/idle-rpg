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

The same class of bug returned when the ascension ladder grew a bottom: `BUILT`'s level was a
literal 40 because 40 _was_ the cap of the rung below. It derives from `LEVEL_CURVE.caps` now.

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
