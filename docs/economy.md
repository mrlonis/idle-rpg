# Economy

Five currencies, where they come from, what they buy, and the curves that decide how long
anything takes.

**This is a time economy, not a money economy.** Commercial gacha tuning — 0.6% rates, 90-pull
pity, manufactured scarcity — exists to sell a bridge across a gap it creates. There is no bridge
to sell here, so generosity is free. When in doubt, err generous.

See [ascension](ascension.md) for what copies cost and [milestones](milestones.md) for the
reasoning behind each number.

---

## The six currencies

`GameState` carries a keyed **wallet** and **rate table** rather than a field per currency — twelve
flat fields would have been twelve lines in every encoder, decoder and repair pass.

| Currency  | Idle rate? | Buys                                                    |
| --------- | ---------- | ------------------------------------------------------- |
| `gold`    | ✅         | Levels, gear levels, and the gear shop.                 |
| `xp`      | ✅         | Levels, and nothing else.                               |
| `essence` | ✅         | Breakthrough levels only — every tenth.                 |
| `summons` | ✅         | Pulls, at 100 crystals each.                            |
| `spark`   | ❌         | A new character, or a targeted copy, in the spark shop. |
| `alloy`   | ❌         | Gear levels, alongside gold.                            |

**Two currencies have no rate at all**, and the `Rates` type enforces it — `RATE_CURRENCY_IDS` is a
narrower list than `CURRENCY_IDS`, so the offline solver cannot silently start paying either out.
`spark` is minted solely by copies of a character already at `ascended-5`; `alloy` solely by
salvaging gear. Both are what a duplicate becomes when there is nothing left to do with the object
itself.

**Gold's claim finally arrived.** Four places in this codebase said gold's level-curve coefficient
was the shallowest of the three _because gear would spend it later_; milestone 12 is later.
Levelling one character to 200 is about 6.4M gold; kitting a party of five in fully enhanced relics
is about 32M. That roughly doubles what gold is for, taking it from the loosest of the three
levelling currencies to comparable with essence. See [gear](gear.md).

**The design target is that no currency is decorative.** Through level 140 all three levelling
currencies land within about a third of each other in time-to-afford, so a player is never idling
on one number while two others pile up unspent.

---

## Where income comes from

**Clearing a stage permanently raises all four idle rates, and that is the real reward.** A run
starts at zero on gold, xp and essence and earns none of them until the first stage falls — which
is what makes the first battle the only thing worth doing. The one-off lump is the smaller half,
tuned to exactly forty seconds of the income it unlocks.

**Since milestone 11 none of that is authored per stage — it is a function of the stage's position
on the ladder.** `STAGE_REWARDS` in [`chapters.ts`](../src/data/chapters.ts) is four numbers and
`stagePayout` in [`core/ladder.ts`](../src/core/ladder.ts) evaluates them:

```
rate = base * stageIndex ** 1.13      base: 1 gold, 0.2 xp, 0.003 essence per second
lump = 40 seconds of that rate
crystals on a first clear = a flat 250, ×2 on a mini-boss, ×5 on a chapter boss
```

Across the hundred stages of chapters 1 and 2:

| Stage | gold/s | xp/s | essence/s | enemy level |
| ----- | ------ | ---- | --------- | ----------- |
| 1     | 1.0    | 0.2  | 0.003     | 1           |
| 12    | 16.6   | 3.32 | 0.050     | 18          |
| 25    | 38.0   | 7.6  | 0.114     | 25          |
| 50    | 83.2   | 16.6 | 0.250     | 40          |
| 75    | 131.4  | 26.3 | 0.394     | 78          |
| 100   | 182.0  | 36.4 | 0.546     | 126         |

Three columns, not four: **the crystal rate is not part of this**. See below.

**The base rates doubled from 0.5 / 0.1 / 0.0015, and all three doubled together.** That is what
made it a safe edit rather than a re-derivation: every economy assertion in `levels.spec.ts` is
either a ratio between the three currencies or a comparison among them, and a common factor cancels
out of all of them. Essence still bites late and not early; gold is still the most comfortable; the
three still land within a third of each other in time-to-afford. The gear shop and the bounty board
are covered by the same cancellation, since both price in **seconds of the run's own income** rather
than in amounts — a doubled rate buys a doubled price.

⚠️ **The one thing that did move is the only number measured in absolute hours.** Levelling one
character to the 1000 ceiling went from 1,175 hours of top-of-ladder idle income to **588**, and the
guard in `levels.spec.ts` was lowered from 1,000 to 500 rather than the level curve being steepened
to absorb it — because progression being twice as fast _was_ the change, and a curve retuned to
cancel it would have left nothing but bigger numbers on screen. That threshold has now given way
once; the next thing that raises income has to move the curve instead.

**The curve was calibrated against enemy level rather than stage count**, which is the thing to
understand before retuning it. The old twenty-four stage ladder paid 25 gold a second at enemy
level 40 and 90 at level 126; the curve that replaced it paid about 42 and about 91 at the same two
levels — income tracking what the content asks of a party rather than how many stages the party has
walked past, which is what stops "four times as many stages" from meaning "four times the income".

⚠️ **The doubling broke that correspondence deliberately, and the shape is what survives.** The
same two levels now pay about 83 and 182, so the curve no longer reproduces the hand-tuned ladder —
it is that ladder times two. What still holds, and what the calibration was really protecting, is
that income is a function of the stage's **position** rather than of the ladder's length: adding a
chapter still cannot make the game richer at a given enemy level. Read the ×2 as the tuning
decision it is, not as the calibration having drifted.

`applyBattleResult` **only ever raises** a rate. Rates never fall, which is what lets load-time
repair re-derive progress from the gold rate alone — and what kept every existing save whole when
milestone 11 re-derived the whole curve underneath them.

**A power law is a decelerating geometric curve, and the deceleration is the requirement.** The
per-stage multiplier is `1 + 1.13 / index`: about ×2 across the first stage, ×1.1 by stage ten,
×1.01 by stage a hundred. Milestone 7 already had to bend the authored gold slope from ×1.4 a stage
down to ×1.1 for the same reason, and nothing constant survives this ladder's length — ×1.1
compounded over the nine thousand stages that reach chapter 100 has three hundred digits in it.

### The crystal rate is a formula, not a table

`SUMMON_RATE` in [`banners.ts`](../src/data/banners.ts) is the whole of it, in crystals per hour:

```
rate = basePerHour + perClearPerHour × clearedStages     // 100 + 1 × clears
```

| Cleared          | Crystals/hr | Pulls/day |
| ---------------- | ----------- | --------- |
| 0 (a fresh save) | 100         | 24        |
| 12               | 112         | 27        |
| 50 (chapter 1)   | 150         | 36        |
| 100 (the ladder) | 200         | 48        |

**Milestone 11 halved the step to 0.5, and it has been put back to 1.** The halving was real
tuning — a hundred stages at the full step is five ten-pulls a day where the twenty-four stage
ladder had been paying three, which was past the band `banners.spec.ts` held. This time the band
moved instead, deliberately: a cleared ladder pays **48 pulls a day** against 36, and the shape of
the curve did not change at all. The failure mode this curve exists to prevent is a rate that
**compounds** past a flat `PULL_COST`, and a linear step cannot do that at any size — being
extravagant and compounding are different things, and only the second one was ever the bug.

⚠️ **What binds the step is the ratio, and it is nearly spent.** The ladder's contribution is
`step × stages` against a base of 100, so the shipped hundred stages now **double** the base where
the half-step added 50%. A third chapter takes that to ×2.5 and a fourth to ×3, where
`banners.spec.ts` fails — and the right answer there is to retune the step, not the threshold.
Raising the step spent that headroom rather than finding it free.

The base did not move either time: a pull an hour from install is the number that makes this
economy legible.

Four things about that are decisions rather than arithmetic:

- **The base is paid before anything has been cleared.** It is the one place idle income switches
  on for free, and at a `PULL_COST` of 100 it reads as a pull an hour for a player who has not
  fought yet. Gold, xp and essence still start at zero, so the first battle is still the only
  thing worth doing — it is just no longer the only thing that pays.
- **The step is linear, not exponential.** A rate should compound only if what it buys compounds;
  see [the section below](#the-economy-bug-that-was-fixed-here), which is the argument this
  replaced a per-stage curve to settle.
- **It is a function of `clearedStages`, so it is derived rather than authored.** `newGame` cannot
  evaluate it — the curve is content and `core/` cannot see content — so `reconcileClearedStages`
  establishes it on every load, including a run's first. `applyBattleResult` steps it after a
  first clear. Both go through `raiseRates`, so it can never fall.
- **The step is per stage, once, ever.** Stage 1 resolves in four seconds, so a per-victory step
  would make tap-farming the bottom of the ladder the fastest way to pull. Re-fighting a cleared
  stage, by hand or on auto-battle for an hour, moves the rate by nothing.

**Summons are deliberately not a repeatable battle reward either**, for the same reason. They
accrue idly, plus a **first-clear bonus** per stage — a flat 250, so 29,000 across the full climb,
roughly 290 pulls.

⚠️ **The first-clear bonus used to rise 6 a stage off a base of 200, totalling about 59,000, and
flattening it halved that on purpose.** The missing 30,000 did not leave the economy — it moved to
the achievement tracks below, which is where the same crystals now arrive on a schedule that pays
the early game rather than the late one. **Read the two together or neither number means
anything**: the whole climb is worth about 69,000 crystals, up a few percent from the 63,800 it was
worth before the redistribution. `data/achievements.spec.ts` is what measures the sum.

---

## The three faucets that are not the ladder

Added in milestone 14b.

|                   | Pays                          | Over                                 |
| ----------------- | ----------------------------- | ------------------------------------ |
| **Stage Climber** | 1,000 crystals per 5 clears   | `clearedStages`, endlessly           |
| **Chapter Conq.** | 10,000 crystals per chapter   | `clearedChapters`, endlessly         |
| **Daily quests**  | 200 + 150 crystals            | 5 battles, 1 pull — resets 04:00 UTC |
| **Weekly quests** | 800 + 600 crystals            | 35 battles, 7 pulls                  |
| **Bounties**      | 20m–12h **of current income** | 1–4 bench characters, 1h–24h         |

The first three pay **crystals only**.

⚠️ **Crystals rather than gold, xp or essence, and the reason is the level curve.** Those three are
spent against a curve worth ×10⁹, so a flat quantity of any of them is invisible within a chapter
or two — the same argument [gear](gear.md) makes for gear bonuses being percentages. A pull costs a
flat `PULL_COST` forever, so a flat crystal reward means the same thing at stage 5 and stage 5,000.

⚠️ **Achievements are a peer of the ladder now, not a top-up on it, and that is a reversal.** They
paid 5,000 crystals against the ladder's ~58,800 when they shipped — about 8%, deliberately a
garnish. Over the same hundred stages the two tracks now pay **40,000** against the flattened
29,000, so more crystals reach a player through achievements than through first clears. The
argument for the swap is the one the flat award was always making: _when_ a crystal arrives matters
more than how many arrive in total, and the old shape paid least at the bottom of the ladder where
a run is trying to fill three empty formation slots. `data/achievements.spec.ts` holds the ratio
inside a factor of two either way, which is what catches one side being retuned without the other.

Quests are still sized to supplement: 350 a day plus 1,400 a week, roughly 5.5 pulls a day, against
the 20–40 a day a fully cleared ladder produces idly.

**The asymmetry is the whole design.** Against a player whose ladder is moving, achievements and
quests are a modest top-up. Against a player walled below a stage — whose only income source is the
thing the wall is throttling — they are most of what arrives. That is why neither scales with
progress: a reward that grew with the stage index would help least exactly where help is needed.

### ⚠️ Bounties are the deliberate exception, and pay a duration instead

A mission pays **seconds of the run's own current idle income** in gold, xp and essence — the same
idiom `STAGE_REWARDS.rewardSeconds` uses for a stage's lump, and for the same reason: those three
are spent against a ×10⁹ level curve, so a flat quantity goes stale within a chapter or two while a
multiple of the player's current rate never does.

Scaling is right here and wrong above because the two answer different questions. Quests exist to
pay a **stuck** player; bounties exist to reward **roster breadth**, which is not a stuck player's
problem. The pair is the point rather than an inconsistency.

⚠️ **No bounty pays crystals, and none may.** The crystal rate is linear in the clear count
precisely so it cannot outrun a flat `PULL_COST`; a multiple of it on a repeatable timer is exactly
that compounding. Crystals come from quests and achievements, idle income comes from bounties, and
keeping the two faucets on different currencies is what stops either being the only one worth
engaging with.

**Every mission pays less than it runs for** — roughly a third to a half. One paying its own
duration back would make dispatching free, since the characters are idle anyway, and the board
would be a button rather than a decision.

**Rotation costs the economy nothing, which is why it was affordable.** The board offers one
variant of each tier per day out of a pool of twelve, and ⚠️ **every variant of a tier is worth
exactly the same** — same duration, crew, payout and unlock. So the numbers in the table above
describe the board on every day it can ever show, and what rotates is which faction a mission asks
for. A variant that paid differently would make the daily draw a payout lottery, and would put a
second, invisible variable into every figure on this page.

## Levelling

Cost from level `L` to `L + 1` is `coefficient × L ^ exponent`, per currency.

| Currency  | Coefficient | Exponent | Charged           |
| --------- | ----------- | -------- | ----------------- |
| `gold`    | 22          | 1.55     | every level       |
| `xp`      | 10          | 1.42     | every level       |
| `essence` | 5           | 2.3      | every tenth level |

Essence's exponent applies to the **breakthrough number** rather than the level, so it arrives in
visible jumps instead of creeping up every level.

- **Gold has the shallowest slope** because it has the broadest claim on itself — levels now, gear
  later. That promise is stated in four places in the codebase and is not yet paid.
- **XP is steeper in effect** than gold despite a lower exponent, because the rate behind it is far
  lower. XP does nothing but level characters, so there is no reason to be generous with it.
- **Essence is the bottleneck and is supposed to be felt.** Cheapest of the three before level 60,
  most expensive by 200.

**Level 1000 is aspirational, not a grind to schedule.** It is a chapter-100 target and two
chapters are shipped. [`levels.spec.ts`](../src/data/levels.spec.ts) evaluates the reward curve at
the last stage of the ladder rather than restating its rates, so **adding a chapter re-runs every
time-to-afford assertion**. When it fails, the curve and the economy have come apart, and the
answer is to retune one of them deliberately — never to move the threshold.

That is not hypothetical: doubling the ladder in milestone 7 is exactly what made it fire, and the
thing that got retuned was the **rate slope**, not the curve and not the threshold. At the top of
the ladder as it stands, one character from level 1 to 1000 costs about 588 hours of gold — half
what it was before the base rates doubled, as recorded above — and resonance means a party costs
five times that, so the ceiling is still years away, which is where it belongs.

### Growth

Only the **quantities** scale — see [attributes](attributes.md) for why the rest may not.

| Per level     | Common  | Legendary | Ascended |
| ------------- | ------- | --------- | -------- |
| rate          | 1.021   | 1.0225    | 1.024    |
| at level 50   | ×2.8    | ×3.0      | ×3.2     |
| at level 200  | ×62.6   | ×83.8     | ×112     |
| at level 1000 | ×1.04e9 | ×4.5e9    | ×1.95e10 |

**Those three numbers differ by about 0.3 percentage points, and that is the entire design.**
Compounded across the level range it is the difference between a common-tier character being 20%
behind at level 50 — nothing, next to being ascended two rungs higher — and being a joke at the
cap. Amazing early, falls off later, _as a consequence of the math_ rather than as an assertion. A
flat multiplier would leave common tier the same fixed distance behind forever and never actually
fall off.

**Milestone 10 multiplied every cap multiplier by the same factor, not every exponent.** The rates
were 1.0075 / 1.009 / 1.0105, worth ×1745 / ×7714 / ×34024. Scaling the exponents instead is the
change that looks identical from here and is not: it would raise the ascended-over-common ratio
from 19 to about 3,600, which is a retune of the paragraph above wearing an arithmetic detail's
clothes. The right-hand column moved by six orders of magnitude and the ratios between the columns
did not move at all.

`perAscension` is `1.6`, worth ×450 across a full rare-start ladder and ×176 for an elite-start
one. The ascended tier getting _less_ total ascension multiplier is intended: it skipped the two
cheapest rungs for free, and its steeper per-level slope more than settles the account.

**It was `1.12`, and against a billion-fold levelling curve ×4.36 end to end would have made the
gacha decoration** — which matters here more than in most games, because duplicates are the primary
ascension path by design. The size was picked against the levelling curve rather than in isolation:
a rung raises the level cap by 20 to 100, itself worth ×1.5 to ×7.9 at 1.021, so a rung paying ×1.6
sits inside the range of the headroom it unlocks rather than an order of magnitude below it.

⚠️ **The two `common` rungs added by the copies-only rewrite pay no multiplier at all** — they raise the cap
from 20 to 30 to 40 and nothing else. `growthFloor` anchors this ladder at `rare` for every tier,
which is what keeps a common-tier character at `rare` worth exactly what a freshly pulled one was
worth before those rungs existed, and is why not one stage had to be retuned. See
[ascension](ascension.md).

---

## Pulls

**2.5% base for an ascended-tier character, not 0.6%. Hard pity at 30, not 90.**

There are **two pity curves**, because a dry spell and a drought are different complaints and one
counter cannot bound both. The interval that keeps the top tier from feeling remote is far too long
to keep a session from feeling empty, and an ascended cycle short enough to do that job would have
made the top tier routine.

| Knob             | Ascended | Legendary or better |
| ---------------- | -------- | ------------------- |
| base             | 0.025    | 0.25                |
| soft pity starts | 20       | 6                   |
| soft pity step   | +0.15    | +0.25               |
| certain at       | 27       | 9                   |
| hard pity        | 30       | 10                  |

Both ramp steeply enough that certainty arrives before the hard cap, so **each guarantee is a floor
rather than the mechanism.** Both counters live in `GameState`, are **global rather than
per-banner**, and are on screen at all times.

The legendary cycle is sized to `MULTI_PULL_COUNT` deliberately: a ten-pull is the unit a player
actually experiences, and one that came back entirely common was the worst thing this banner could
produce. It is now unreachable rather than merely rare.

What the two curves are worth, measured over the stationary distribution rather than from the base
weights: an ascended-tier character every **17.6 pulls** (against 23.4 under the old single 30/+6/50
curve), and a legendary-or-better every **3.36** (against 3.79).

### The legendary curve is a floor under the same roll, not a second draw

It raises the **threshold** the single tier roll is compared against. That is what keeps consumption
at exactly three draws per pull however many curves are authored — a curve that drew a value of its
own would have broken the invariant the whole save layer leans on, silently, since nothing about the
results would look wrong.

⚠️ **At base rate the floor equals the proportional split exactly, and that is load-bearing.** As
pity raises the ascended chance, the other two tiers scale down **in proportion to each other**
rather than one absorbing the whole change — and with `TIER_WEIGHTS` summing to 1, what that rescale
produces at the base ascended rate _is_ `ascended + legendary`. So a run inside the flat stretch of
both curves draws precisely what it drew before the legendary curve existed, and the floor can only
ever raise the legendary threshold, never lower it. Weights summing to anything else would put the
two mechanisms quietly out of step from the first pull; `banners.spec.ts` asserts both the sum and
the coincidence.

**Pity is the escape valve for bad luck, not the shop.** Spark only accrues after something is
maxed, so reading the shop as the bad-luck mechanism gets the economy backwards.

**Spark is a currency players actually hold since the copies-only rewrite, and that is deliberate.** Maxing a
common-tier character went from 216 base copies to 46 — inside what a single full climb of pulls
delivers — so where spark was previously minted by almost nobody, it is now earned and spent. The
prices did not move; what moved is how reachable `ascended-5` is. An unspendable currency was
doing nothing for anyone.

There is **one copy offer per tier** now, because the three tiers start on three different rungs.
The 3 / 8 / 60 spread tracks how many pulls it takes to see one, derived in `banners.spec.ts` from
`TIER_WEIGHTS` and the roster's tier counts rather than restated. It used to rest on the fodder
exchange rate — an Elite copy was worth nine Rare ones — and fodder was the only thing that ever
made copies of different characters interchangeable, so with it gone there is no rate to quote.

---

## Offline income

`resume(state, nowMs)` settles time away in **closed form**: `rate × elapsedSec`, one
multiplication per currency. Never replay offline time tick by tick — a year at 10Hz is 315
million iterations.

**There is no offline cap.** Come back a year later and the game pays a year. The closed form is
O(1) in elapsed time, so a long absence costs nothing to settle, and `Numeric` wraps
`break_infinity` so the quantities do not overflow.

Three guards, none of them anti-cheat:

- Negative delta → zero. The device clock moved backwards; do not punish a timezone change.
- Non-finite delta → zero. `lastTickAt` was damaged.
- `lastTickAt` before `MIN_PLAUSIBLE_TICK_MS` (2020-01-01) → zero. **Damage rather than an
  absence** — a timestamp of zero is finite and yields a positive delta, so nothing else catches
  it, and it would pay out decades.

**The rates are constant across every offline window, permanently**, because auto-battle is
foreground-only and nothing clears a stage while the player is away. That is what makes the
fixed-rate closed form exactly right rather than merely close, and why there is no segmented
solver.

---

## The economy bug that was fixed here

**Summon crystals used to compound against a flat price.** Gold, xp and essence buy levels whose
costs compound, so those rates should compound. A pull costs a flat `PULL_COST` and an ascension a
flat 8 elite + 180 rare copies — so the old per-stage crystal curve, climbing ×1.25 a stage
against gold's ×1.43, outran its own prices exponentially. Extrapolated into
[milestone 11](milestones.md)'s chapters it reached a million pulls a day by the end of chapter 1.

The damage was never to the gacha, it was to **ascension** — which stops being a constraint
entirely, taking two later milestones' central arguments with it.

**The rule worth extracting: a rate should compound only if what it buys compounds.** The fix was
scheduled for milestone 11, when rates become a function, and landed early because the same
question came up in tuning: crystals now accrue at a flat base plus a linear step per clear, and
the exponential is gone rather than slowed. **It was not a reason to be less generous** — a fresh
save earns a pull an hour, where the old curve paid a fifth of that at stage 1 and reached a
ten-pull a day only at the very top of the ladder. Being extravagant and compounding are
different things, and it is the second one that had to go.
