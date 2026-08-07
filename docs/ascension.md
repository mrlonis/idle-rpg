# Ascension

Duplicates are the primary progression path, so a pull can never produce nothing. This is how a
copy becomes power.

**A rung costs copies of the character being ascended, and nothing else.** There is no second
currency, no material, and no other character involved.

Authored in [`data/ascension.ts`](../src/data/ascension.ts), resolved by
[`core/roster/rarity.ts`](../src/core/roster/rarity.ts), and pinned against its design targets in
[`data/ascension.spec.ts`](../src/data/ascension.spec.ts).

See [glossary](glossary.md) if tier and rarity are running together; that distinction is the whole
foundation of this page, and since the copies-only rewrite all three tier words collide with rung names.

---

## The ladder

Sixteen rungs, grouped into six families. An index into `RARITIES` **is** a rarity — all
comparison, clamping and cost arithmetic happens on the index.

| #     | Rung                        | Family    | Level cap |
| ----- | --------------------------- | --------- | --------- |
| 0     | `common`                    | common    | 20        |
| 1     | `common-plus`               | common    | 30        |
| 2     | `rare`                      | rare      | 40        |
| 3     | `rare-plus`                 | rare      | 60        |
| 4     | `elite`                     | elite     | 100       |
| 5     | `elite-plus`                | elite     | 140       |
| 6     | `legendary`                 | legendary | 200       |
| 7     | `legendary-plus`            | legendary | 260       |
| 8     | `mythic`                    | mythic    | 340       |
| 9     | `mythic-plus`               | mythic    | 420       |
| 10    | `ascended`                  | ascended  | 500       |
| 11–15 | `ascended-1` … `ascended-5` | ascended  | 600–1000  |

**Every cap is a multiple of ten**, so an ascension always lands a character directly in front of
a breakthrough level rather than stranded between two.

**Where a character starts depends on its tier, and all three now differ.** `common` tier starts
at `common`, `legendary` tier at `rare`, `ascended` tier at `elite`. **Every tier can reach
`ascended-5`** — deliberately, so an early favourite is a real investment rather than something the
game later tells you was a waste.

### Three rungs also hand over a skill

A rung buys more than a stat multiplier and a level cap. `elite`, `legendary` and `ascended` each
unlock the next skill in a character's kit, up to the ceiling its tier allows — two skills at
`common`, three at `legendary`, four at `ascended`. The ultimate is never gated. The rule is in
[`core/roster/kit.ts`](../src/core/roster/kit.ts) and the table in
[`data/kits.ts`](../src/data/kits.ts); [combat](combat.md) covers what it means in a fight.

**The thresholds are absolute rarity**, which has a consequence worth stating plainly: a
common-tier character now reaches its second skill **four rungs in** rather than two, because it
starts two rungs lower and the threshold did not move. That is a real cost of the ladder growing a
bottom, not an oversight.

---

## ⚠️ The two `common` rungs are a cap gate, not a power gate

**They raise the level ceiling — 20, then 30, then 40 — and hand over no stat multiplier at all.**
`growthFloor` in [`rarity.ts`](../src/core/roster/rarity.ts) anchors the ×`perAscension` ladder at
`rare` for every tier, so a common-tier character at `rare` is worth **exactly** what a freshly
pulled one was worth before those rungs existed.

This is the single most important thing on this page, because it is what the whole stage ladder
rests on. The copies-only rewrite added those rungs to make common-tier characters **cost** more — a
pull produces a specific common-tier character far more often than a specific ascended-tier one.
Paying them a multiplier as well would have made every common-tier character ×1.6² stronger at
every rarity it can reach, which is a power grant the entire ladder would have to be retuned around
and was not what the change was for.

⚠️ **Quote that ratio as ×4, not ×10, and know which one you are holding.** From `TIER_WEIGHTS`
alone it is exactly ×10 — `0.75/21` against `0.025/7`. Measured through `pull()` with both pity
curves live it is **×4.1**, because ascended pity lifts the effective ascended-tier rate from 2.5%
to 5.69% and nothing lifts common. The base-rate figure describes a banner nobody plays; every
pacing number on this page is derived from the measured one.

The evidence that this is the right anchor: every one of the 32 sweeps in
[`data/chapters.balance.ts`](../src/data/chapters.balance.ts) passes with **no change to any
stage**. If the two rungs are ever paid a multiplier, that stops being true and the ladder needs
re-deriving from scratch.

---

## Two paths, one shape

Faction decides the path, which is why it lives on the faction rather than on each character — a
character cannot be authored onto the wrong ladder.

Both ladders are paid in copies of the character itself. They are **identical below `elite`**, and
the celestial one is half again as expensive on the five rungs from `elite+` to `ascended`.

| Rung transition        | Mortal | Celestial |
| ---------------------- | ------ | --------- |
| Common → Common+       | 4      | 4         |
| Common+ → Rare         | 6      | 6         |
| Rare → Rare+           | 3      | 3         |
| Rare+ → Elite          | 7      | 7         |
| Elite → Elite+         | 4      | 4         |
| Elite+ → Legendary     | 8      | 12        |
| Legendary → Legendary+ | 5      | 8         |
| Legendary+ → Mythic    | 9      | 14        |
| Mythic → Mythic+       | 6      | 9         |
| Mythic+ → Ascended     | 10     | 15        |
| each star              | 6      | 6         |

**Mortal** — Humans, Dwarves, Elves, Undead, Monsters. The cheaper climb.

**Celestial** — Angels, Demons. Spends **luck**: half again the copies on rungs 5–9, which is what
the celestial advantage in combat is paid for with.

⚠️ **The premium sits on rungs 5–9 and nowhere else.** `Elite → Elite+` and all five stars are
shared, which "the celestial ladder is the expensive one above `elite`" does not say on its own.
`ascension.spec.ts` asserts both halves — that the premium exists, and that it does not extend to
those six rungs.

⚠️ **The size of the premium is chosen against the totals, not by scaling each rung.** It was a
flat ×2 per rung back when those rungs were 1s and 2s, which came to +6 copies and about ×1.2 on a
finished climb. Applying ×2 to the current rungs would cost +38 and reach ×1.5 — the same rule
charging a materially heavier tax, purely because the rungs underneath it grew. ×1.5 is what
reproduces the premium celestials have always actually paid, and the spec holds the **ratio**
rather than the factor for exactly that reason.

**The four rungs below `elite` are shared rather than scaled**, and that is deliberate: they are
the _tier_ gap, not the path difference. A celestial common-tier character is common-tier for the
same reason everyone else's is, and charging it twice would be charging twice for one thing.

---

## The totals

Counting the first copy, so these are "how many of this character do I have to see":

| Tier      | Starts at | To `ascended` | To `ascended-5` |
| --------- | --------- | ------------- | --------------- |
| common    | `common`  | 63 / 83       | 93 / 113        |
| legendary | `rare`    | 53 / 73       | 83 / 103        |
| ascended  | `elite`   | 43 / 63       | 73 / 93         |

(mortal / celestial). Each one is **derived** in
[`ascension.spec.ts`](../src/data/ascension.spec.ts) rather than restated as a constant, so a
retune that moves a total fails there naming the real number.

### Tier is a head start, not a shorter climb

Every rung costs every character the same, so **a tier is worth exactly the rungs it skips** — 10
copies for `legendary`, 20 for `ascended`. But only 20 of the ladder's 92 copies sit below `elite`;
the other 72 are the stretch that **every** tier walks. So the totals land close together, within
×1.27 from top to bottom.

What actually separates the climbs is the stream feeding them. Measured against the shipped banner
with pity live, a specific common-tier character arrives every ~30 pulls, a legendary-tier one
every ~87, an ascended-tier one every ~123. Near-identical copy counts drawn from a stream four
times thinner is what makes a higher tier the **longer** investment:

| Tier      | copies to ★5 | pulls  | days at full-clear income |
| --------- | ------------ | ------ | ------------------------- |
| common    | 93           | ~2,800 | ~52                       |
| legendary | 83           | ~7,200 | ~135                      |
| ascended  | 73           | ~9,000 | ~168                      |

(mortal; days assume ~53.5 pulls/day, which is endgame income — early-run is roughly half that, so
read these as floors.)

⚠️ **This inverts what this page used to argue, deliberately.** The bottom of the ladder used to
carry the whole tier gap — 28 of 45 copies — so that a climb was a comparable commitment whichever
tier you fell in love with, and an ascended-tier character maxed _fastest_. It now carries a fifth
of the ladder, and tier buys a head start on the level cap rather than a shorter road. Rungs 0–3
are still the only lever on how big that head start is; retuning them is retuning the gap.

### Pulls are shared, which is what sets the real pace

A copy of every character accrues from the same pulls, so "2,800 pulls to max a common-tier
character" is also **the point at which all twenty-one of them max**. Nobody grinds one character
at a time. The number that describes a run is therefore the slowest tier on the slowest ladder:
the full 49-character roster reaches `ascended-5` at roughly 11,400 pulls.

---

## What this replaced, and why

Until the copies-only rewrite the mortal ladder spent **bodies**: four of its rungs were paid in same-faction
**fodder** — other characters of that faction, themselves ascended to a required rarity and then
consumed.

That made the price **recursive**. A rung was quoted in _ascended_ copies ("2 faction copies at
`elite-plus`") against a player who only ever holds base ones, so every requirement had to be
resolved down into base copies by a memoised recursion with a cycle guard. The headline numbers it
produced — 8 elite copies plus 180 rare fodder for a mortal ascended-tier character, 216 base
copies for a common-tier one — appeared nowhere a person could read them.

**What fodder bought:** a spare copy of a character you would never play was still worth
something. **What it cost:** a price nobody could evaluate, a plan naming which faction-mates to
burn, a cheapest-first solver for players who did not want to choose, and three failure modes for
a plan that named the wrong character. It also made `common` tier the awkward case — there is no
tier of fodder beneath it.

Two properties of the old system are worth remembering because they explain the new numbers:

- **Cost compounded down the ladder**, so the two rungs below `elite` priced everything above
  them. That produced a ~9× gap between a common-tier climb and an ascended-tier one _for free_.
  The flat table gives that up, which is why the rungs below `rare` are authored expensive — they
  now carry that gap explicitly.
- **The two paths were expensive in different resources.** That distinction went with fodder; what
  is left is a straight price difference.

**The cost of the change, stated plainly:** a spare copy of a character you will never ascend is
now inert until that character is worth investing in. It is no longer fodder for the ascended-tier
character standing next to it.

---

## Only spare copies are ever consumed

**Never a character you have levelled.** This is a deliberate departure from the genre, and it has
consequences worth keeping:

- Nobody can destroy a week's investment by tapping the wrong row, so the confirmation dance
  around irreversible loss does not exist.
- Nothing removes a roster entry, which is what makes milestone 9's resonance floor monotonic.

Copies are counted, not tracked individually — there is one record per character, not one per
copy. The only question ever asked of a spare is "how many do I have".

---

## Spark, and where bad luck actually gets its escape valve

A copy of a character already at `ascended-5` converts to **spark**, which buys a new character or
a targeted copy in the shop.

**Spark stopped being unreachable with the copies-only rewrite**, and the retune that followed
pushed it back out without undoing that. Maxing a common-tier character went 216 base copies → 46 →
**93**, so the first spark of a run is minted at roughly 2,800 pulls rather than 1,400 — about
seven weeks in at full-clear income rather than three and a half.

⚠️ **That is the number to watch if the ladder is ever made more expensive again.** Spark is minted
only by a copy arriving at a character already at `ascended-5`, so the cost of maxing a common-tier
character is not one input to when spark appears — it _is_ the gate. 216 was the figure at which
almost nobody ever saw any, and an unspendable currency does nothing for anyone.

It is still explicitly _not_ the answer to early bad luck — **pity is**, and pity is global rather
than per-banner and visible at all times. Reading the shop as the bad-luck mechanism gets the
economy backwards.

There is **one copy offer per tier**, because the three tiers now start on three different rungs.
The prices track how many pulls it takes to see one, derived in `banners.spec.ts` from
`TIER_WEIGHTS` and the roster's tier counts. That is a different argument from the one they used
to rest on — 60:8 was the fodder exchange rate, an Elite copy being worth nine Rare ones — and
fodder was the only mechanism that ever made copies of different characters interchangeable, so
when it went there was no rate left to quote.

---

## Where ascending happens: the Altar

**One place, and it is not the character sheet.** `ui/altar-view.ts` at `/town/altar` is the only
screen in the game that ascends anybody.

It used to be a button on each sheet, which is the natural place for it and the wrong one at scale.
A rung costs copies of one character and nothing else, so opening a sheet to ascend is opening a
screen to make a decision that has no alternative in it — and a player holding duplicates of nine
characters did that nine times. The sheet keeps the **panel**, because the half of a rung that is
genuinely about this character — the price in its own copies, and which skill the next rung unlocks
— does not fit on a list of twenty-three rows. It links to the Altar, focused on the row it came
from; a panel that quotes a price and offers no way to pay it is a dead end.

The screen offers both:

- **one rung at a time**, per row, exactly as the sheet's button did; and
- **Ascend all**, which climbs every character as far as its own spare copies reach.

### Ascend all is one press with no confirmation, and the reason is the pricing

Copies are spent on the character they are copies of, and have no other use until `ascended-5`
turns them into spark. So no two characters compete for the same resource and spending a copy
forecloses nothing — "ascend everything" is a well-defined answer rather than a strategy. A dialog
would be asking the player to confirm the only move. There is nothing here to lose either: a rung
never consumes a character, only spares, so the confirmation dance around irreversible loss stays
absent for the same reason it always was.

⚠️ **This is a property of copies-only pricing, not a permanent one.** If a rung ever costs
something with a second claim on it — a currency, a material, another character — `ascendAll`
stops being a loop and becomes a choice, and it belongs back with the player rather than resolved
greedily in `core/`. The note is on the function.

Everyone is listed, ready first, in two groups. Not a filtered list: a character three copies short
is the reason to go summoning, and hiding it would leave the screen empty for most of a run.

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

- **Ascension costs may need to scale with chapter.** Summon crystals currently compound against a
  flat pull price and a flat ascension price. Milestone 11 records the fix.
