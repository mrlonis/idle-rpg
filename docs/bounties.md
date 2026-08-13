# The bounty board

Bench characters dispatched on timed missions, added in milestone 14b. Read
[`core/bounties.ts`](../src/core/bounties.ts) before touching it.

**It earns its place for a reason neither achievements nor quests cover: it is the only thing that
pays you for characters you are _not_ fighting with**, so a wide roster becomes worth something
before [faction towers](towers.md) ask for it.

## ⚠️ A character cannot be both fighting and away — and the rule bites on the way _out_

It used to bite on the way **in**: `dispatchBounty` refused anybody fielded, `setFormation` refused
anybody away, `repairDispatches` dropped a crew that was both. That was right for one formation and
wrong for eight — forty slots against a fifty-six character roster means a player who has crewed
every tower has no bench left, and **the board starves exactly when the roster breadth it rewards is
at its widest.**

**The rule now: anybody may be dispatched, and a crew holding somebody away cannot fight.** The
invariant is unchanged — nobody is in two places at once — and it is enforced in **one** place
instead of three: `CrewView.ready` for the screen, and the away guard in `BattleService.fight` for
the loop, because auto-battle re-enters without passing the pre-battle screen again.
`dispatchBounty`, `setFormation` and `repairDispatches` no longer check it at all, and
`in-formation` and `character-away` are gone from the failure unions.

- ⚠️ **Do not put a refusal back on the dispatch side.** It reads as tightening an invariant and it
  is the change that makes the board unusable. The invariant is unchanged; only its enforcement point
  moved. The cost is now a crew the player fills in rather than a mission they cannot start — a
  formation is edited in seconds and a mission runs for hours.
- ⚠️ **`repairDispatches` must keep a mission whose crew is also fielded.** That is an ordinary state
  a player reached on purpose, and dropping it would take back hours of a wait, unpaid.
- ⚠️ **The battle guard is the away case only, never `CrewView.ready`.** `ready` is also false for an
  **empty** crew, and an empty party resolving as an immediate defeat is behaviour `simulateBattle`
  owns and two auto-battle specs use to make a loss deterministic. The broad guard replaces a fight
  the player loses with a control that silently does nothing. The specs caught it.

## What a mission pays

⚠️ **A duration of the run's current idle income, never a flat amount** — the same idiom as
`STAGE_REWARDS.rewardSeconds`.

⚠️ **And never crystals.** The crystal rate is linear in the clear count so it cannot outrun a flat
`PULL_COST`, and a multiple of it on a repeatable timer is exactly that compounding. **The split with
quests is deliberate**: quests pay flat crystals because they help a player whose ladder stopped;
bounties scale because roster breadth is not a stuck player's problem.

**Every mission pays less than it runs for.** One paying its own duration back would make dispatching
free and the board a button rather than a decision. `data/bounties.spec.ts` derives that ratio and
the crew sizes rather than restating them.

**`repairDispatches` pays nothing for what it drops**, because paying would make damaging a save a
way to collect instantly. ⚠️ It deliberately does **not** check the faction requirement: that gates
_starting_ a mission, and dropping an in-flight crew because a later build retuned the content would
punish a player for a change they did not make.

## The daily board

**Derived from the seed and the day index, never stored.** `data/` authors a **pool of twelve**, and
`dailyBoard` stands `BOUNTY_BOARD.missions` of them. Same three arguments as the gear shop's stock:
no save field, nothing to migrate, and ⚠️ **rerolling is impossible rather than merely detectable**.

It rolls on the **same 04:00 UTC boundary the quest windows use**, asserted equal against
`QUEST_RULES` rather than restated — two daily clocks would mean two "tomorrows" in one game.

- ⚠️ **The shuffle covers the whole pool before anything is filtered.** Shuffling only the unlocked
  missions makes the draw a function of the clear count, so crossing an unlock threshold reshuffles
  every row; shuffling everything first means an unlock can only **insert**. Same discipline as the
  count draw in `rollDrops`.
- ⚠️ **A dispatch outlives the board it was sent from.** A 24-hour mission crosses a rotation
  boundary by definition, so **every running mission holds a place on the board**, and
  `repairDispatches` and `collectReadyBounties` take the **whole pool** rather than the day's board.
  Wiring either to the board strands a crew a player is eleven hours into, silently and unpaid.
  Running missions **count against the board size**, so collecting one frees a slot.
- **Every variant of a tier is worth exactly the same** — duration, crew, payout and unlock. Rotation
  changes _what is asked for_, never _what the day is worth_; a variant paying differently makes the
  daily draw a payout lottery.

### ⚠️ Missions stack, and a tier is an authoring group rather than a limit

An earlier build allowed one per tier, guarded in three places — a **screen-layout rule wearing a
game rule's clothes**, since its whole premise ("the board shows one row per tier") was itself a
choice. ⚠️ **A constraint that argues for itself is the tell**: the rows and the cap went together.

What rations the board is the **bench**; a cap on top spends the player's roster breadth twice. Two
dispatches on one tier are **not damage** and `repairDispatches` must not drop one.

### ⚠️ `BOUNTY_BOARD.missions` is a balance number, not a layout one

Each mission pays a third to a half of idle income while it runs, and they stack, so the board's
ceiling is the **sum** — 2.8× at six missions. `data/bounties.spec.ts` derives that worst case and
bounds it under 4×. **Widening the board is an economy change.**

## ⚠️ A faction requirement never names a celestial faction

Angels and Demons ascend on copies of themselves alone, so an unlucky run can own none of either
indefinitely — a mission requiring one is a row that player can never run, which is the failure
role-locked formation slots were rejected for (see [rejected](rejected.md)).

`data/bounties.spec.ts` derives the mortal/celestial split from `FACTIONS` rather than listing it,
and also holds that a requirement never exceeds the crew size or the shipped roster's depth, and that
**every tier keeps one variant asking for nothing**.

## ⚠️ "Dispatch all" is not `ascendAll`, and the licence is different

Crews genuinely compete for one bench, so `dispatchOpenBounties` really does resolve a choice —
unlike `ascendAll`, whose copies are spendable on exactly one character each.

What allows it with no confirmation is that the stakes are a **wait rather than a loss**: nothing is
consumed and everybody comes back. **What that buys is an obligation to be predictable rather than
clever** — board order top to bottom, roster order within a mission, and faction seats filled before
general ones. It is a convenience over `dispatchBounty`, never a second path with its own rules, and
the spec asserts one press equals dispatching each mission by hand.

⚠️ **It is not a general licence for one-press bulk actions.** The next one makes its own argument.

## A bug worth keeping

`duration` documented that a mission under a minute out reads "under a minute", then tested
`Math.ceil(ms / 60_000) < 1` — false for every positive duration. **The comment described the
intended behaviour correctly and the code never had it**, with nothing failing to say so. ⚠️ **A
rounded quantity cannot answer a question about the quantity it was rounded from.** See
[testing](testing.md).
