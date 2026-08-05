# Ascension

Duplicates are the primary progression path, so a pull can never produce nothing. This is how a
copy becomes power.

Authored in [`data/ascension.ts`](../src/data/ascension.ts), resolved by
[`core/roster/rarity.ts`](../src/core/roster/rarity.ts), and pinned against its design targets in
[`data/ascension.spec.ts`](../src/data/ascension.spec.ts).

See [glossary](glossary.md) if tier and rarity are running together; that distinction is the whole
foundation of this page.

---

## The ladder

Fourteen rungs, grouped into five families. An index into `RARITIES` **is** a rarity — all
comparison, clamping and cost arithmetic happens on the index.

| #    | Rung                        | Family    | Level cap |
| ---- | --------------------------- | --------- | --------- |
| 0    | `rare`                      | rare      | 40        |
| 1    | `rare-plus`                 | rare      | 60        |
| 2    | `elite`                     | elite     | 100       |
| 3    | `elite-plus`                | elite     | 140       |
| 4    | `legendary`                 | legendary | 200       |
| 5    | `legendary-plus`            | legendary | 260       |
| 6    | `mythic`                    | mythic    | 340       |
| 7    | `mythic-plus`               | mythic    | 420       |
| 8    | `ascended`                  | ascended  | 500       |
| 9–13 | `ascended-1` … `ascended-5` | ascended  | 600–1000  |

**Every cap is a multiple of ten**, so an ascension always lands a character directly in front of
a breakthrough level rather than stranded between two. The caps are front-loaded — the first five
rungs hand out 200 levels between them and the last five hand out 500 — because the early rungs
are the ones a new player is actually climbing, and headroom they cannot reach is not a reward.

**Where a character starts depends on its tier.** `common` and `legendary` tier start at `rare`;
`ascended` tier starts at `elite`, skipping the two cheapest rungs for free. **Every tier can
reach `ascended-5`** — deliberately, so an early favourite is a real investment rather than
something the game later tells you was a waste.

### Three rungs also hand over a skill

Since milestone 8c a rung buys more than a stat multiplier and a level cap. `elite`, `legendary` and
`ascended` each unlock the next skill in a character's kit, up to the ceiling its tier allows — two
skills at `common`, three at `legendary`, four at `ascended`. The ultimate is never gated. The rule
is in [`core/roster/kit.ts`](../src/core/roster/kit.ts) and the table in
[`data/kits.ts`](../src/data/kits.ts); [combat](combat.md) covers what it means in a fight.

Two consequences worth having in mind while reading the prices below:

- **The thresholds are absolute rarity**, so the head start `ascended` tier gets by starting at
  `elite` is now a skill as well as two rungs of cost.
- **The rungs are not evenly rewarding.** `elite`, `legendary` and `ascended` are the ones a player
  is saving toward; `elite-plus`, `mythic` and the five stars are stats alone. The character sheet
  says which of the two the next rung is, because the price does not.

This is what makes a rung the most valuable thing in the game — a skill is worth more than any stat
multiplier — and it was the strongest answer available to "ascensions should feel more dramatic"
until milestone 10 made good on the rest of it: `perAscension` is `1.6`, so a rung is now a
×1.6 stat multiplier as well, and the three that also hand over a skill are the ones a player
plans around.

---

## Two paths, expensive in different things

Faction decides the path, which is why it lives on the faction rather than on each character — a
character cannot be authored onto the wrong ladder.

### Mortal — Humans, Dwarves, Elves, Undead, Monsters

Spends **bodies**. Four rungs are paid in same-faction **fodder**: other characters of that
faction, themselves ascended to the required rarity and then consumed.

| Rung transition        | Price                             |
| ---------------------- | --------------------------------- |
| Rare → Rare+           | 2 self copies at `rare`           |
| Rare+ → Elite          | **2 faction** at `rare-plus`      |
| Elite → Elite+         | 1 self at `elite`                 |
| Elite+ → Legendary     | **2 faction** at `elite-plus`     |
| Legendary → Legendary+ | 1 self at `elite-plus`            |
| Legendary+ → Mythic    | **1 faction** at `legendary-plus` |
| Mythic → Mythic+       | **1 faction** at `legendary-plus` |
| Mythic+ → Ascended     | 2 self at `elite-plus`            |
| each star              | 1 self at `elite-plus`            |

This is what makes a bad pull genuinely useful: it is both an early-game unit and future fodder
for the ascended-tier character standing next to it. **It is also why a faction needs bodies in it
rather than one favourite.**

### Celestial — Angels, Demons

Spends **luck**. Every rung is copies of the character itself, and **no fodder at any point** —
trivial to ascend if the banner is kind, impossible if it is not.

The authored table starts at `elite`, because the tier this path was designed around starts there.
The two rungs below exist for common- and legendary-tier celestials and are **derived rather than
authored**: the defining property of the path is that it never asks for fodder, so `Rare+ → Elite`
is the mortal rung with its faction clause turned into a self clause.

---

## The totals, and why they are code rather than a table

**Rungs are quoted in _ascended_ copies and a player only ever holds _base_ ones.** A price of
"2 faction copies at `elite-plus`" means two copies that have themselves been ascended to
`elite-plus`, each of which cost copies to get there. So every requirement is **resolved
recursively down into base copies**. That recursion is the reason this is code and not a lookup
table.

The design targets, each asserted in
[`ascension.spec.ts`](../src/data/ascension.spec.ts) rather than restated as a constant:

| Path      | Tier     | To `ascended`                    | To `ascended-5` |
| --------- | -------- | -------------------------------- | --------------- |
| Mortal    | ascended | 8 elite copies + 180 rare fodder | 18 elite copies |
| Celestial | ascended | 14 elite copies, no fodder       | 24 elite copies |

Stars add no fodder on either path, and cost two elite copies each. Common- and legendary-tier
characters can reach the top too, for more — they start two rungs lower and pay for those rungs.

**Neither path is cheaper overall.** They are expensive in different resources, which is the
point: the celestial advantage in combat is paid for by the luck-only ladder.

---

## Only spare copies are ever consumed

**Never a character you have levelled.** This is a deliberate departure from the genre, and it has
consequences worth keeping:

- Nobody can destroy a week's investment by tapping the wrong row, so the confirmation dance
  around irreversible loss does not exist.
- A faction-mate stays **both** a playable character and an ascension resource. It is never one or
  the other.
- Nothing removes a roster entry, which is what makes milestone 9's resonance floor monotonic.

Copies are counted, not tracked individually — there is one record per character, not one per
copy. The only question ever asked of a spare is "how many do I have".

---

## Spark, and where bad luck actually gets its escape valve

A copy of a character already at `ascended-5` converts to **spark**, which buys a new character or
a targeted copy in the shop.

**Spark only accrues after something is maxed, so it is late-game overflow.** It is explicitly
_not_ the answer to early bad luck — **pity is**, and pity is global rather than per-banner and
visible at all times. Reading the shop as the bad-luck mechanism gets the economy backwards.

---

## Ascension is the only individual cost

Since milestone 9, **levels are shared and rungs are not.** Resonance carries every character in
the roster to the fifth-highest level for free — but **the rarity cap still binds**, so raising a
cap is the only way for a bench character to collect more of the floor. That is what leaves the
bench something to spend on, and what makes crewing a faction tower an investment decision rather
than a levelling grind. See [level resonance](level-resonance.md); if a bench character ever feels
free to bring, the cap clause is what has stopped working.

The two prices are also spent from different pockets: levels come out of the wallet, rungs out of
duplicate copies. Nothing about resonance touches the copies.

---

## Planned changes

_Not built. Recorded here so this page does not quietly go stale._

- **Ascension costs may need to scale with chapter.** Summon crystals currently compound at ×1.25
  a stage against a flat pull price and a flat ascension price, which stops being a constraint
  entirely by chapter 2. Milestone 11 records the fix.
