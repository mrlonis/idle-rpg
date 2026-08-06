# Level resonance

Invest in five characters; every other character you own is carried to the same level.

Nothing gates it. No emblems, no slots, no currency, no unlock — unlike the system it is modelled
on, where slots meter how much of the roster benefits. **Owning a character is the only
requirement.**

Derived in [`core/roster/resonance.ts`](../src/core/roster/resonance.ts), spent through
`levelUp` and `raiseResonance` in [`core/roster/roster.ts`](../src/core/roster/roster.ts), and
shown on the roster screen. Shipped in milestone 9 — see [milestones](milestones.md) for why it
sits where it does in the order.

See [glossary](glossary.md) for invested versus effective level, [ascension](ascension.md) for the
rung ladder this deliberately does **not** touch, and [economy](economy.md) for the level curve it
charges against.

---

## The rule

Sort the roster by level, take the top `PARTY_SIZE`, and the **lowest of those five** is the
resonance floor. Every character is treated as being at least that level:

```
effectiveLevel = min(levelCapFor(rarity), max(investedLevel, resonanceFloor))
```

Three properties fall out of that formula, and they are the whole design.

**It cannot be gamed by hyper-levelling one character.** The floor is the _fifth_-highest level,
so it only rises once all five have been invested in. Pouring everything into a single favourite
moves nothing.

**Ties need no tiebreak.** The floor is a level, not a character, so equal levels produce the same
answer whatever order they sort in. The derivation is deterministic without anyone having to
decide what beats what.

**The rarity cap still binds, and that is what keeps ascension alive.** A character at `common`
rarity caps at level 20; a floor of 200 lifts it to 20 and no further. So resonance makes _levels_ free and
leaves _ascension_ entirely individual — the bench still has something to spend on, and raising a
cap is the only way to collect more of the floor. Without this clause the feature would make
ascension pointless for everyone outside the top five.

### No edge case for a small roster, and adding one would be dead code

With fewer than `PARTY_SIZE` characters owned the floor is the lowest invested level in the
roster — so every character is already at or above it and nobody can benefit. The feature is
**self-neutralising**: it does nothing until the roster exceeds five, at which point it starts
working on its own. A special case here would be code that cannot change an outcome.

The floor for an empty roster is 1, which is the same statement made about nobody.

---

## Derived, never stored

`OwnedCharacter.level` is the **invested** level — the one the player paid for. The floor is
computed from the roster on read and written nowhere. **There is no save migration, and that is
not a coincidence.**

Baking a resonated level into the save would be irreversible and wrong the moment the top five
changed: a character recorded at 200 because the floor was 200 has no way back to its real
invested level once the floor drops. Storing what was paid for and deriving the rest is the only
version that survives a reshuffle.

**Derived-not-stored only works if every reader derives**, and that is the failure this design has
to be built against — it is silent and one-sided. A screen showing 200 while the battle resolves
at level 1 looks like nothing at all until a fight is lost for no visible reason. Two seams carry
it:

- `toBattleCombatant(character, owned, growth, kit, level)` takes the level as an **argument**
  rather than reading `owned.level`. Rarity is still read off the entry, because ascension is
  individual and nothing carries it.
- `RosterEntryView.level` in `ui/roster.service.ts` is the effective level, and every level the
  row reports — the next cost, the affordable target, whether it is at cap — is measured from it.

`RosterService` resolves the floor once per snapshot rather than once per row: it is a property of
the whole roster, and deriving it inside the row mapper would re-sort the roster for every
character in it.

---

## The floor never falls, and that is provable

**No character ever loses a level to resonance.** The obvious worry — bench levels dropping when
the top five change — turns out to be impossible rather than merely unlikely. Three facts give it:

1. **Invested levels only rise.** There is no de-level mechanic and no plan for one.
2. **Characters are never removed from the roster.** Milestone 3 settled this for a different
   reason: ascension consumes only spare copies, never a character that has been levelled. There
   is no path that deletes a roster entry.
3. **Adding a character can only raise or hold the `PARTY_SIZE`-th highest value.** A new level-1
   entry sorts below the floor and cannot move it; a high-level one pushes the fifth-highest
   upward.

So `floor` is monotonically non-decreasing, and since `effectiveLevel` is a `max` against it, no
displayed level can fall. **The roster screen therefore needs one number, not two** — showing
"levelled to" and "carried to" separately would be defending against a state that cannot occur.
The row says `carried` in words instead, which is the whole of what the second number would have
said.

**The one exception is a damaged save.** Load-time repair drops unknown character ids, so a
character removed from `data/` disappears from the roster — and if it was among the top five, the
floor falls with it. That is rare, bounded, and strictly better than the alternative of refusing
to load. It is recorded here so that a floor which moved backwards is recognised as a repair
having run rather than as a bug in this feature.

---

## Levelling is charged from the effective level

**A carried character pays for the level above the floor, never for the climb to it.** A level-1
character under a floor of 200 spends the level-200 price to reach 201, and its invested level
goes straight from 1 to 201.

This is the only coherent choice, and the alternative is a trap rather than a balance decision:
charging from the invested level would sell those two hundred levels back, and the first two
hundred purchases would each buy _nothing visible at all_ — the screen would keep saying 200 while
the wallet emptied. Starting the meter at the effective level is what makes "levels are free below
the floor" true of the price as well as of the display.

It cannot let a character lose a level, because the target is always above where the charging
started. `levelUp` refuses a target at or below the effective level as a no-op rather than
charging for it.

The rule shows up in three places, and they agree by construction because all three go through
`effectiveLevel`:

| Where                               | What it does                                      |
| ----------------------------------- | ------------------------------------------------- |
| `levelUp(state, defId, target)`     | Charges `[effective, target)`, sets invested.     |
| `levelUpToAffordable(state, defId)` | Walks the wallet up from the effective level.     |
| `resonancePlan(roster, curve, to)`  | Prices every anchor from its own effective level. |

---

## Raising the floor

**Only the lowest of the five moves the floor.** Levelling a character already above it buys that
character's own power — they are in the party, so this is real — but buys nothing for the roster
until the laggard catches up. The roster screen therefore has a control that raises the _floor_
rather than a character, and the anchors standing on it are flagged `moves the floor` so the
distinction is visible rather than inferred.

The steady state that produces is "the top five share a level, and that level is the floor", which
is the mental model worth protecting.

### Choosing who to level is not a search

`resonancePlan(roster, curve, target)` picks the cheapest set, and picking it is arithmetic:

- Every candidate pays the same curve, so the cost of reaching `target` falls monotonically with
  the level a character is already at.
- Therefore the cheapest `PARTY_SIZE` are simply the **highest-levelled** among those whose rarity
  cap allows `target` at all.
- Characters below the floor are legitimate candidates and cost exactly what an anchor does, since
  levelling starts from the effective level. They sort last only because the ties have to break
  somewhere, and "the top five stay the top five" is the model the screen teaches.

The cap filter is what makes this worth doing rather than pinning the anchor set once. When the
fifth-highest character is at its rarity's ceiling the floor stalls, and there are **two** ways
out: ascend that character, or level a sixth past it. A fixed anchor set would be stuck on the
first, while the player could see the second working by hand.

### Atomic, and priced before it commits

Level all five or none. `maxAffordableLevel` makes a partial application easy to write and it is
the wrong behaviour: levelling three of five because the fourth is unaffordable drifts them apart
and quietly breaks the model above.

**Breakthrough levels are lumpy** — essence is charged only every tenth level, so the cost of one
step is uneven and occasionally several times its neighbours. So the plan prices the whole
operation up front rather than discovering the shortfall partway through, and the screen shows the
price before the tap.

### `maxAffordableResonance` binary-searches where `maxAffordableLevel` walks

The level-by-level walk that works for one character does not work here, because the **set** being
levelled can change as rarity caps drop candidates out — there is no running total to carry from
one level to the next.

Binary search is sound because the price is monotonic in the target: the set chosen for a higher
target is also a legal set for a lower one, and costs more to reach it. Affordability is a
conjunction of three monotonic comparisons, so the affordable targets are a prefix.

`resonanceCeiling` bounds the search at the `PARTY_SIZE`-th highest **level cap** in the roster,
which is the highest floor the roster could reach with an unlimited wallet.

---

## What this is not

**Not only quality of life.** Milestone 8d shipped mono-faction lineup bonuses worth up to +25%
attack and health, reachable only by fielding a _different_ five-character team per encounter, and
8e authored the seven-deep roster that makes that possible. Milestone 15's faction towers do the
same thing harder, demanding thirty-five invested characters. Levelling thirty-five characters
individually is seven times the cost of levelling five, against an economy tuned for one team.
**Neither is affordable without this**, so resonance is closer to a prerequisite for the faction
bonuses than a convenience that follows them.

**It does not cover ascension**, and it does not cover milestone 16's per-character investment
track. Those stay individual, which is what stops the roster becoming a single undifferentiated
blob with one number attached.

**It is not an offline or idle mechanic.** Nothing here runs per tick. The floor is derived on
read, and every function in the module is O(roster) or a bounded search over the level range.

---

## Where it is tested

- [`core/roster/resonance.spec.ts`](../src/core/roster/resonance.spec.ts) — the derivation: the
  fifth-highest rule, the cap clause, tie-independence, the monotonicity invariant, and the
  planner's cheapest-set and cap-stall behaviour.
- [`core/roster/roster.spec.ts`](../src/core/roster/roster.spec.ts) — the transactions: charging
  from the floor, atomicity, and never dragging an anchor back down.
- [`ui/roster.service.spec.ts`](../src/ui/roster.service.spec.ts) — the seam, against shipped
  content: the party fights at the carried level, and the row reports it.
