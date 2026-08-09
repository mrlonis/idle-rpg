# Rejected and declined

Things this project decided **not** to build, and the arguments that keep them decided. They are
collected here because most of them arrive by reflex — from the genre, from an idle-game tutorial,
or from a plausible-looking fix to a real problem — and re-deriving the refusal each time is the
expensive part.

Three shelves: **cancelled outright**, **declined with a named trigger**, and **fixes that were
measured and failed**. A trigger is the only thing that moves an item off the second shelf; an item
on the first has no trigger by construction.

[milestones](milestones.md) records which milestone each decision belongs to.

---

## Cancelled outright

### A prestige layer

Milestone 7 planned one and cancelled it. Prestige trades a reset of one axis for a permanent
multiplier on another, and four things stop it fitting here:

1. **There is nothing to reset.** The only resettable axis is stage progress, and stage progress
   _is_ the income rate — the rate table is the reward. Wiping it takes everything and hands back
   fights the player has already won.
2. **The roster cannot be part of it, and that is settled law.** Ascension consumes only spare
   copies specifically so nobody can destroy a week's investment by tapping the wrong row.
3. **The job prestige normally does is already done.** Its usual purpose is an uncapped vertical
   axis so numbers keep growing past authored content. That is ascension plus the 1000-level curve,
   with years of it sitting unreachable. The problem was never a missing multiplier track.
4. **Its other purpose is content recycling** — making twelve stages feel like a hundred and twenty.
   That spends the player's time in place of authoring time, which is the tuning philosophy this
   project rejects everywhere else.

If the recycling idea returns, the form to consider is **difficulty tiers over existing stages**,
not a run reset: it keeps the reward shape and costs the player nothing they earned. It is still
recycling, and it still loses to authoring more ladder while there is ladder worth authoring.

The diagnosis that came with the cancellation is what the roadmap still runs on: **the game runs
out of _decisions_ long before it runs out of _numbers_.** Measure any proposal against that.

### The segmented offline solver, `timeToClear`, and `dropCarry`

All three are cancelled rather than pending, and a reader who finds a solver named across the
codebase should not assume somebody forgot it.

- **No segmented solver.** It prices an away window in which the rate _changes_, and rates change on
  exactly one event: a stage clearing. Auto-battle is foreground-only and commits each battle as it
  ends, so nothing clears while the player is away. Every rate is constant across every offline
  window, permanently — the fixed-rate closed form is exactly right and stays exactly right.
- **`timeToClear(state, stage)`** is cancelled with it; the solver was its only consumer.
- **No `dropCarry` field**, because nothing drops while the player is away. `accrueDiscrete()` has
  no caller and no planned one. It is kept rather than deleted because it is eight lines encoding a
  rule worth not re-deriving under pressure — offline loot is paid at expected value with
  deterministic rounding, never rolled, because rolling invites force-quit rerolling. **Do not wire
  it up to manufacture a use.**

The trigger for the first two would be genuinely unattended progression, which is not the design.
`AGENTS.md` records the technique in case that reverses.

### The offline cap

Deleted in milestone 11. Come back a year later and the game pays a year.

**The genre caps offline income to force a daily session.** There is no session to force here and
nothing to sell by forcing it, so the cap was inherited rather than chosen. It also cost nothing to
allow: `resume()` is a closed form, so a year settles in the same O(1) as an hour, and `Numeric` is
a `break_infinity` Decimal, so the quantities do not overflow.

⚠️ **The one thing the cap did on purpose now needs doing on purpose.** A `lastTickAt` of zero is
finite and yields a positive delta, so it passes every other guard and would pay out decades,
silently wrecking a run's pacing. `MIN_PLAUSIBLE_TICK_MS` treats a timestamp predating the project
as damage and pays zero, exactly as a non-finite delta does.

### Role-locked formation placement

Any character may stand in either rank. Role-locking would let an unlucky roster reach a state where
**no legal party exists**, and in a game with no way to buy characters that is a run with nowhere to
go. A bad front row is a far better failure than no front row.

This is the reference failure for a whole class of proposal, and later milestones keep citing it:
milestone 12's gear archetype gate is safe **because a piece the party cannot wear is fodder, not a
dead end**; 14b excludes celestial factions from bounty requirements for the same reason; 14b
forbids a quest measured against `clearedStages` because it becomes permanently unfinishable.

### Flat synergy bonuses for your own line-up

"+10% if two Fire units" asks nothing of the encounter and only ever produces a new optimal team.
The faction **matchup** matrix is the opposite shape: every multiplier is a statement about the
fight in front of you.

⚠️ **Milestone 8d overrode the first half of this rule once, knowingly, and the override does not
generalise.** The mono-faction lineup bonus does pay a party for its own composition. It survives on
one argument: **a mono-faction bonus does not create one optimal team, it creates seven**, and the
matchup decides which to bring. A bonus for a set of specific characters, or for a role mix, or for
anything resolving to one best answer, is still forbidden — "8d did it" is not the argument.

### Anti-cheat, and the reasons it never comes up

A player editing their own save affects only their own run. What this buys, repeatedly, is that
**removing an incentive structurally beats policing it**: the gear shop's stock and the bounty
board's rotation are both derived from the seed and an index rather than stored, so rerolling is
impossible rather than merely detectable. It is also why export/import has no downside here that it
would have elsewhere.

---

## Declined, with the trigger that would revisit it

| Declined                             | Trigger that revisits it                               |
| ------------------------------------ | ------------------------------------------------------ |
| Save export/import                   | A real report of a lost run, not a hypothetical        |
| `NSUbiquitousKeyValueStore` for iOS  | Same, and decide the "no network" tension as one       |
| Enemies wearing gear                 | Chapter 10, which does not exist                       |
| Enemy tier/rarity bands applied      | Chapter 11, where the band actually changes            |
| Generating stages from a curve       | "Authoring a chapter has stopped being an afternoon"   |
| Scaling ascension costs with chapter | Chapters needing a second lever on the crystal economy |
| Ambient sparring on the idle screen  | Nothing scheduled; it is presentation work             |
| `@capacitor/app` lifecycle handling  | A missed event costing something _unbounded_           |
| Any emblem or signature quest        | A monotonic emblem counter existing for another reason |

⚠️ **"Auto-battle" means two features and only one is built.** The unlockable repeat shipped in
milestone 7. **Ambient sparring — the party visibly fighting in the background while the player
watches their income tick up — is still deferred, and it must never award anything**, advance a
stage, or touch `GameState`. If it did, it would be a second progression path competing with the
real one. It is presentation rather than simulation, and the event log a battle already produces is
the natural thing to loop for it.

**Export/import** covers every backup gap including cross-platform, needs no account and no network.
The usual objection is save editing, and this project has no anti-cheat by design. It was declined
because platform backup already covers the common real loss — getting a new phone — and a manual
export is something most players would not do until after they had already lost the run. See
[platform](platform.md) for what backup does and does not cover.

**Enemy gear** is deliberately absent rather than missing: a geared party flying through content
tuned for an ungeared one is what makes gear feel like progress. When chapter 10 arrives, fold the
expected gear budget into the enemy's stat block or its level rather than building a second
equipment system on that side of the board.

**Stage generation** would keep mini-bosses and bosses authored and generate ordinary stages against
a tuned reference. Do not build it speculatively. The arithmetic that sets the trigger: 100 stages
for the first two chapters, 500 for the first band, 9,500 to reach chapter 100. The first band is a
real but finite job; chapter 100 is not hand-authorable by anyone.

---

### Emblem and signature quests — every available shape is forbidden or decorative

Milestone 16 was asked for quests alongside the achievement tracks, and there is no version of one
worth shipping. The three candidates and why each fails:

- **A quest over `signatureLevels`.** It is a fine _achievement_ counter and a forbidden _quest_
  one, for the exact reason `clearedStages` is banned from quests: it stops moving at 210 once all
  seven items are maxed, and — worse — it does not move at all for the tens of thousands of pulls
  before the first item unlocks. A daily row that cannot be finished on day one _or_ at the end of
  the content is a permanent empty row.
- **A quest over emblems held.** Not a counter at all. A quest window stores a **baseline** and
  progress is a subtraction, so a balance that goes _down_ when the player spends it reports
  negative progress. Every valid quest counter is monotonic; a wallet balance is not.
- **A quest paying emblems.** The rule is that every quest reward is crystals, and its stated
  reasoning — flat rewards for currencies that price against flat costs — would actually permit
  emblems, since a signature level costs a fixed number forever. It fails on size instead: drops
  already pay about **15 emblems an hour** to anyone auto-battling, so a daily award small enough
  not to distort that is decorative, and "no currency is decorative" is its own rule.

**The trigger that revisits this:** a monotonic emblems-earned counter existing for some other
reason. If one ever does — a lifetime-earned total kept for a statistics screen, say — the first
candidate becomes viable and this is worth reopening. Adding a stored field _for the quest_ is not
that trigger; it is the thing `core/achievements.ts` forbids.

## Fixes that were measured and failed

Kept because each looked reasonable, and because the reason each failed generalises.

### Three answers to the stalling-fight problem (milestone 8c)

- **A damage floor** — a minimum fraction off any hit. Damage is already never zero, and the
  deadlocks were never "damage rounds away", they were **sustain out-pacing damage**. A floor big
  enough to beat the best heal in the game is a global damage buff wearing a guard's clothes.
- **A minimum formation size.** Dead on the numbers: a two-character sustain pair stalls 4/4 against
  the stages a solo one does. Party size correlates with the failure and does not define it; **total
  party damage** does.
- **A stall detector** — end the fight when neither side has reached a new low for N ticks. Sized so
  it never cuts a legitimate fight short it needs a ~4,000-tick window, leaving the mean stalled
  fight at fourteen minutes; and a party being ground down slowly _is_ making progress, so some
  stalls never trigger it at all.

What shipped instead was the ninety-second timer, and what finally closed the hole was milestone
14a's closing pressure. See [combat](combat.md).

### Two content fixes for the same stalls (milestone 14a)

A global 15% enemy HP cut **broke the starter wall** and was reverted. Weakening the Hierophant and
the front ranks made the timer-headroom guard _worse_, converting timeouts into ninety-second wins.

⚠️ **Neither could have worked.** A stall where neither side can finish is not made to resolve by
making one side weaker; it is made to resolve _later_, or it swaps a timeout for a ninety-second
win, which is the same failure with a better outcome attached.

### Shrinking the gear budget instead of its defensive share (milestone 12)

The instinct on a geared party stalling was to shrink the whole budget. The probe showed ×0.5 and
×0.65 both stall somewhere too, because a party sitting exactly at its damage threshold always
produces some long fights. **The dial was the ratio, not the size** — see [gear](gear.md).

### Scaling the growth exponents by a common factor (milestone 10)

Multiplying each per-level rate's excess over 1 by ~2.8 reads like "raise every tier equally". It is
not: raising a tier ratio of 19.5 to the power 2.8 gives 3,600. Common tier would be five times
behind at level 200 rather than 1.8 — a retune of milestone 3's central promise arriving as an
arithmetic detail. What shipped raises every tier's **multiplier at cap** by the same factor.

### Reweighting the lineup ladder to fix faction stalls (milestone 8e)

Reweighting toward attack, and zeroing its health entirely, both failed to fix the stalls and
introduced new ones. The cause was the characters, not the bonus.

---

## Genre systems this game will not have

Standard in the genre, and they arrive by reflex. Listed so that not having them is visibly a
decision rather than an oversight.

- **Limited-time banners and event FOMO.** Manufactured scarcity with no bridge to sell — the exact
  pattern the balance philosophy rejects. A banner may rotate; it may not expire in a way that costs
  a player something they can never get back.
- **Energy or stamina gates on modes.** This is already a time economy. A second one only subtracts,
  and it exists in paid games to sell refills.
- **Guilds, co-op bosses, friend lists.** Ruled out by "no server, no accounts" and "no social
  comparison". They carry a great deal of the genre's retention, so the honest position is that this
  game replaces them with nothing and accepts the cost — not that the gap is not there.
- **Login streaks that punish a miss.** A streak that resets is a scarcity mechanic wearing a
  generosity costume. Cumulative login rewards are fine; escalating ones that reset are not. 14b
  holds the line: no streaks, no countdown that costs anything, and unclaimed awards accumulate
  indefinitely.
