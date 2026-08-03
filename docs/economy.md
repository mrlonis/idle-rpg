# Economy

Five currencies, where they come from, what they buy, and the curves that decide how long
anything takes.

**This is a time economy, not a money economy.** Commercial gacha tuning — 0.6% rates, 90-pull
pity, manufactured scarcity — exists to sell a bridge across a gap it creates. There is no bridge
to sell here, so generosity is free. When in doubt, err generous.

See [ascension](ascension.md) for what copies cost and [milestones](milestones.md) for the
reasoning behind each number.

---

## The five currencies

`GameState` carries a keyed **wallet** and **rate table** rather than a field per currency — ten
flat fields would have been ten lines in every encoder, decoder and repair pass.

| Currency  | Idle rate? | Buys                                              |
| --------- | ---------- | ------------------------------------------------- |
| `gold`    | ✅         | Levels now; gear, gear levels and the shop later. |
| `xp`      | ✅         | Levels, and nothing else.                         |
| `essence` | ✅         | Breakthrough levels only — every tenth.           |
| `summons` | ✅         | Pulls, at 8 crystals each.                        |
| `spark`   | ❌         | A new character, or a targeted copy, in the shop. |

**`spark` is the only currency with no rate at all**, and the `Rates` type enforces it. It is
minted solely by copies of a character already at `ascended-5`, which makes it late-game overflow
by construction.

**The design target is that no currency is decorative.** Through level 140 all three levelling
currencies land within about a third of each other in time-to-afford, so a player is never idling
on one number while two others pile up unspent.

---

## Where income comes from

**Clearing a stage permanently raises all four idle rates, and that is the real reward.** A run
starts at zero income and earns nothing at all until the first stage falls — which is what makes
the first battle the only thing worth doing. The one-off `goldReward` is the smaller half, tuned
to roughly forty seconds of the income it unlocks.

Across the twelve authored stages:

| Stage | gold/s | xp/s | essence/s | summons/s |
| ----- | ------ | ---- | --------- | --------- |
| 1     | 0.5    | 0.1  | 0.0015    | 0.0015    |
| 6     | 5.5    | 1.05 | 0.017     | 0.008     |
| 12    | 25     | 4.7  | 0.08      | 0.018     |

`applyBattleResult` **only ever raises** a rate. Rates never fall, which is what lets load-time
repair re-derive progress from the gold rate alone.

**Summons are deliberately not a repeatable battle reward.** Stage 1 resolves in four seconds, so
a repeatable crystal payout would make tap-farming the bottom of the ladder the fastest way to
pull. They accrue idly, plus a **first-clear bonus** per stage.

---

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

**Level 1000 is aspirational, not a grind to schedule.** The ladder is twelve stages long and the
curve is tuned against content that does not exist yet.
[`levels.spec.ts`](../src/data/levels.spec.ts) reads its income rates off the top of `STAGES`
rather than restating them, so **adding a stage re-runs every time-to-afford assertion**. When it
fails, the curve and the economy have come apart, and the answer is to retune one of them
deliberately — never to move the threshold.

### Growth

Only the **quantities** scale — see [attributes](attributes.md) for why the rest may not.

| Per level     | Common | Legendary | Ascended |
| ------------- | ------ | --------- | -------- |
| rate          | 1.0075 | 1.009     | 1.0105   |
| at level 50   | ×1.4   | ×1.6      | ×1.7     |
| at level 200  | ×4.4   | ×5.9      | ×8.0     |
| at level 1000 | ×1745  | ×7714     | ×34024   |

**Those three numbers differ by about 0.3 percentage points, and that is the entire design.**
Compounded across the level range it is the difference between a common-tier character being 20%
behind at level 50 — nothing, next to being ascended two rungs higher — and being a joke at the
cap. Amazing early, falls off later, _as a consequence of the math_ rather than as an assertion. A
flat multiplier would leave common tier the same fixed distance behind forever and never actually
fall off.

`perAscension` is `1.12`, worth ×4.36 across a full rare-start ladder and ×3.48 for an elite-start
one. The ascended tier getting _less_ total ascension multiplier is intended: it skipped the two
cheapest rungs for free, and its steeper per-level slope more than settles the account.

---

## Pulls

**2.5% base for an ascended-tier character, not 0.6%. Hard pity at 50, not 90.**

| Knob             | Value |
| ---------------- | ----- |
| base ascended    | 0.025 |
| soft pity starts | 30    |
| soft pity step   | +0.06 |
| hard pity        | 50    |

Soft pity ramps steeply enough that certainty arrives a few pulls before the hard cap, so **the
guarantee is a floor rather than the mechanism.** Pity lives in `GameState`, is **global rather
than per-banner**, and is on screen at all times.

As pity raises the ascended chance, the other two tiers scale down **in proportion to each other**
rather than one absorbing the whole change — so a pity-inflated pull is still a fair draw between
the tiers it can produce.

**Pity is the escape valve for bad luck, not the shop.** Spark only accrues after something is
maxed, so reading the shop as the bad-luck mechanism gets the economy backwards.

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

## The one economy bug already known about

**Summon crystals compound against a flat price.** Gold, xp and essence buy levels whose costs
compound, so those rates should compound. A pull costs a flat 8 crystals and an ascension a flat
8 elite + 180 rare copies — so a compounding crystal rate outruns them exponentially:

| Stage                | Pulls per day |
| -------------------- | ------------- |
| 12 (today)           | 194           |
| 24                   | 2,924         |
| 50 (chapter 1 ends)  | 1,039,386     |
| 110 (chapter 2 ends) | 8 × 10¹¹      |

The damage is not to the gacha, it is to **ascension** — which stops being a constraint entirely,
taking two later milestones' central arguments with it.

**The rule worth extracting: a rate should compound only if what it buys compounds.** Fix it when
rates become a function in milestone 11. **This is not a reason to be less generous** — the idle
crystal rate is the most distinctive thing about this economy and should stay extravagant. What
has to change is that it stops compounding against a price that does not.
