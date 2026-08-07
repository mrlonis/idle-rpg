# Gear

The third progression axis, alongside levels and ascension rungs. Added in
[milestone 12](milestones.md#12-gear--complete).

A character wears five pieces — head, arms, chest, legs, boots. Every piece names an **archetype**
it was forged for, a **grade** it dropped at, and a **faction** it is aligned to (or none). What it
is worth is a **percentage of the wearer's own stats**.

Companion references: [attributes](attributes.md) for the stat block gear multiplies,
[economy](economy.md) for the currencies it spends, [glossary](glossary.md) for the vocabulary.

---

## The one rule everything else follows from

⚠️ **Every gear bonus is a percentage, never a flat quantity.**

Levelling is worth ×10⁹ end to end and ascension ×450 (see [milestone 10](milestones.md)). A flat
`+400 atk` authored against a level-40 stat block is a rounding error by level 400 and invisible by
level 1000 — so flat gear needs its own exponential curve, and then that curve needs re-tuning every
time the ladder extends. That is precisely the failure milestone 10 deleted from the **enemy** side
of the board by giving enemies levels instead of bigger authored stat blocks.

A percentage has none of it. A relic chest piece is worth the same +38% health at level 1 and at
level 1000, so gear stays a third axis for the whole run and never needs a second curve.

It also preserves the identity `simulate.spec.ts` asserts: scaling both sides of the board by a
common factor leaves the whole simulation unchanged, which is what let milestone 10 rescale
everything by ×10⁹ without touching the ninety-second timer or the faction matrix. A percentage is a
multiplication, so it commutes with that rescale. **A flat bonus is an addition, and an addition is
exactly what the identity forbids.**

---

## What a piece is

| Field         | What it is                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| **slot**      | `head`, `arms`, `chest`, `legs`, `boots`. Where it goes.                     |
| **archetype** | `tank`, `brawler`, `mage`, `ranger`, `support`. Who may wear it.             |
| **grade**     | An index into the grade ladder. Sets the multiplier and the enhancement cap. |
| **alignment** | A faction id, or absent. Pays 1.3× on a character of that faction.           |
| **level**     | 1 to its grade's cap. The only mutable thing about a piece.                  |

There is no per-item progress bar. A level is bought outright with alloy and gold, and material that
does not reach the next step stays in the wallet where it can go into something else.

### Archetype is the roster's `CharacterRole`, collapsed to five

The roster used to carry eight roles — `tank`, `bruiser`, `assassin`, `ranger`, `sniper`, `mage`,
`healer`, `support`. Three of them were distinctions with nothing downstream: an assassin is a
bruiser that opens on the back rank, a sniper is a ranger with longer reach, and a healer is the
support that restores health. All three are statements about a **kit**, and the kit says them more
precisely than a label can.

Collapsing to five made a gear archetype and a role the same word rather than two vocabularies to
keep in sync — and this project already carries three meanings of "rarity", which is the argument for
not minting a fourth near-synonym. **The cost is real**: the roster screen no longer says "healer"
about the seven characters that heal. What tells a player Cirien heals is Cirien's skill list.

⚠️ **This made `CharacterRole` load-bearing for the first time**, reversing a comment that used to
say keeping it inert was the point. That comment was about **placement**: a role that gates which
rank a character may stand in lets an unlucky roster reach a state with no legal party, which is why
milestone 4 rejected role-locked ranks. Gear gating is a different question, and the difference is
what makes it safe — **a piece the party cannot wear is fodder, not a dead end.** It enhances
something else, at full value, on the turn it drops.

### Alignment is a bonus, never a restriction

Any character may wear any piece. A matching faction simply pays 1.3× on that piece.

The restriction version was on the table and lost to the argument milestone 4 made when it added a
mortal healer: a drop that is unusable rather than merely suboptimal is a category of answer the
player cannot buy — and combined with the archetype gate, a piece would have had to match on two
axes before it was worth anything at all.

**It does not favour mono-faction parties.** Matching one character's faction is one chance in eight
per drop whether the party is mono or rainbow, so alignment does not stack with the lineup bonus the
way a set bonus would. It is a reason to keep a piece for a particular character, not a reason to
build a particular party.

---

## The grade ladder

Five rungs, each better on two axes at once — a bigger multiplier **and** a higher enhancement
ceiling. That is the arrangement `LEVEL_CURVE.caps` makes for characters: a rung is worth having
partly because of the headroom it unlocks. A relic at level 1 is barely better than a fine piece at
level 1; it is better because it can be taken to 100.

| Grade      | Multiplier | Max level | Salvage | Drop weight | Price  | Unlocks at |
| ---------- | ---------- | --------- | ------- | ----------- | ------ | ---------- |
| Worn       | ×1.00      | 20        | 100     | 100         | 60s    | 1          |
| Sturdy     | ×1.35      | 40        | 240     | 46          | 260s   | 10         |
| Fine       | ×1.80      | 60        | 560     | 18          | 900s   | 25         |
| Masterwork | ×2.35      | 80        | 1,250   | 6           | 2,600s | 45         |
| Relic      | ×3.00      | 100       | 2,700   | 1.6         | 7,200s | 70         |

### ⚠️ The ladder overlaps, and that is a decision rather than an oversight

A piece at its grade's cap is worth **more** than a fresh piece one grade up — a worn piece at 20 is
×2.05 against a sturdy piece at 1 at ×1.35. Strict grade dominance was proposed and measured:
holding "a level-100 worn piece always loses to a level-1 sturdy one" requires each grade step to
exceed the level span, which at 100 levels and 5.5% a level means either **×575 more gear power at
the top** or flattening enhancement to +0.8% a level. Alignment's ×1.3 breaks it a second time.

Overlap is what keeps enhancement worth doing, and it costs nothing: **auto-equip never needed
dominance.** Every candidate for a slot is already filtered to one archetype and one slot, so they
share an authored profile and `gearScale` is a total order over them. `data/gear.spec.ts` asserts
the overlap so it cannot drift into its opposite.

**The names deliberately avoid every word this project already overloads.** `rare`, `elite`,
`legendary`, `mythic`, `ascended` and `common` are all spoken for by `CharacterTier`, `RarityId` or
`RarityFamily` — see [glossary](glossary.md), which already has to explain three meanings of
"rarity". A sixth ladder sharing those words would be the collision that finally makes a sentence
about this game unparseable. `gear.spec.ts` asserts no grade id is one of them.

A grade is **fixed at drop**. You find better gear rather than upgrading into it, and the old piece
is material for the new one.

---

## What a set is worth

A full five-piece set at the top grade, fully enhanced, unaligned:

| Archetype | hp    | atk   | def  | haste |
| --------- | ----- | ----- | ---- | ----- |
| tank      | +166% | +46%  | +68% | +19%  |
| brawler   | +112% | +89%  | +43% | +31%  |
| mage      | +73%  | +120% | +29% | +35%  |
| ranger    | +81%  | +112% | +29% | +43%  |
| support   | +128% | +58%  | +50% | +39%  |

Roughly ×2 on the two stats an archetype cares about. That is a real prize and nowhere near the
×10⁹ the level curve pays — **a player with no gear at all is behind, not locked out.**

The per-archetype **budgets** sit within a few percent of each other, weighted by what each stat is
worth; `gear.spec.ts` asserts it. So the table above is emphasis rather than one archetype getting
more, and a hand-edited cell that quietly widened one is a failing test.

A piece is worth `profile[stat] × grade.multiplier × (1 + 0.055 × (level − 1))`, times 1.3 when
aligned. **Linear in level, where the character curve is exponential** — an exponential of the same
reach would put a finished set orders of magnitude ahead of an empty one, at which point gear is not
a third axis, it is the game.

A loadout **sums** its pieces rather than compounding them. Compounding makes the last piece the
most valuable and a four-fifths set feel like a punishment; summed, every piece is worth what it
says whatever else is on.

### ⚠️ Defence is half the size it looks like it should be

It was authored at twice these numbers and the ladder sweep went red on `c2-s23`: a fully geared
party ran the ninety seconds out against a stage it could not beat — the stall class milestone 8c's
timer exists to bound, and what the zero-timeout guard is there to catch.

The measurement is the useful part. Sweeping the whole ladder with the defensive share at ×1, ×0.5
and ×0 clears **75, 74 and 74** stages. So defence was buying one stage in the fights the party
wins, and a ninety-second stall in the ones it loses. That follows from the damage formula:
`atk² / (atk + def)` has sharply diminishing returns once the attacker's `atk` outruns the
defender's `def` — the situation on every stage tuned above the party — while `def` and `hp`
multiply each other to extend a fight nobody is going to win.

Halving it keeps defence as an identity (a tank's is still more than twice a mage's) and takes the
longest fight in the sweep from 90.0s back to 54.2s. **Do not put it back without re-running the
sweep.**

### ⚠️ Haste is bounded, and the bound is a termination argument

Boots are the only piece that moves `haste`, and `haste` is the one stat here with a hard ceiling.
`content.ts` clamps it to `[1, ATB_THRESHOLD]` because the simulation's termination argument depends
on nobody banking two actions in one tick, and `roster/stats.ts` explains why nothing in a stat
block may grow into that clamp: **a bound that binds turns the one stat that buys turns into a
constant every combatant shares.**

The largest haste bonus this content can produce is the ranger's +43%, or +55% aligned. The fastest
character in the game is authored at 152 haste, so a fully geared, perfectly aligned ranger reaches
about 236 against a threshold of 1000. `gear.spec.ts` **derives** that from the shipped profiles
rather than restating it, and also asserts what a percentage guarantees structurally: gear cannot
reorder who is fastest.

Concentrating all the haste in one slot is what makes this a statement about boots rather than
something to re-derive every time any other slot is retuned.

---

## Where gear comes from

**Every win drops at least one piece.** A drop chance was the alternative and it loses on this
project's own terms: a pull can never produce nothing, so neither should a fight, and a piece
useless to the party is still alloy.

**How many is a range, drawn once per fight:**

| Stage kind   | Pieces | Average |
| ------------ | ------ | ------- |
| Ordinary     | 1–3    | 2       |
| Mini-boss    | 2–5    | 3.5     |
| Chapter boss | 4–8    | 6       |

The counts were fixed at 1 / 2 / 4 until the ranges landed, and the floors are those old numbers —
so nothing pays less than it used to, and the ceilings roughly double the average haul. A fixed
count makes every ordinary clear identical; the variance is what makes a drop an event rather than
an increment, which is the same reason the grade is rolled rather than assigned.

⚠️ **The floor of 1 is a rule and the ceilings are tuning**, and the distinction matters when
retuning: `dropCount` clamps the minimum up to 1 whatever `data/` authors, so a range of `0..n`
cannot reintroduce the drop _chance_ this design rejected.

**The ranges overlap on purpose.** An unlucky boss and a lucky mini-boss can pay the same, which is
what makes the count a roll rather than a rank readout. What `gear.spec.ts` holds is that each
kind's floor and ceiling both beat the rank below it, so the chapter's rhythm survives the overlap.

The grade is rolled **per piece**, so a boss dropping six is six independent chances at a relic
rather than one chance counted six times. The two rolls answer different questions — the count asks
whether the _fight_ was lucky, the grade whether the _piece_ was — which is why the count is drawn
once for the batch rather than folded into the per-piece draw.

⚠️ **More drops means more alloy and a faster-filling bag, and both are bounded already.**
`inventoryLimit` caps the bag and the overflow salvages at full value, so a bigger haul costs the
save nothing — see the note on why gear material is a currency rather than a pile of items.

### The unlock gate, then the tilt

A grade cannot drop or be stocked below its `unlockIndex`. Worn is ungated, so **the opening ten
stages hand out one grade and nothing else** — every piece is comparable to every other and a drop
asks only which slot it fills.

⚠️ **This reverses a position this document used to hold**, and the old argument is worth keeping
because it is still half right: _"a hard band gate would make the first stage of each band a cliff
and everything below it garbage the instant it was crossed."_ The cliff is real and it is the price.
What the argument missed is the opening, where a soft tilt hands a new run a lottery ticket it
cannot cash — the gold to enhance a lucky relic is twenty hours away, and the piece sits at level 1
meanwhile.

Two things bound the cliff: a gate only ever **widens** the table, since the grades below keep
dropping at their authored weight; and the bottom grade is ungated by construction, so the ladder
always drops something.

⚠️ **Every gate lands inside the hundred stages this build ships**, and that is the constraint the
numbers are picked against. The first version of this idea gated Sturdy behind chapter 3 — which
does not exist — leaving four of five grades unreachable. `gear.spec.ts` derives the ladder's length
from the shipped chapters and asserts every gate falls inside it.

Among what is unlocked, the odds still tilt with depth: a grade's authored weight is multiplied by
`(1 + stageIndex / 90) ** gradeIndex`. Two properties fall out of that shape:

- **The authored weights are the distribution at the stage a grade unlocks.** That is what the `1 +`
  buys. A bare ratio makes the top grade's weight `softness⁻⁴` at the bottom of the ladder — one in
  millions rather than one in hundreds — and the authored number stops describing anything a reader
  could predict from.
- **The bottom grade never becomes impossible**, it becomes rare — and a worn piece late in a run is
  still worth its salvage.

⚠️ **Drops are rolled from a derived sub-stream**, keyed on the stage index and the battle count —
never from the main stream. Drawing from the main stream would make **fighting a stage shift the
gacha sequence**, which is the hazard `core/rng.ts` exists to remove.

### The gear shop

Six pieces, gold-priced, restocked on the hour. It lives at `/town/gear-shop`, beside the spark
shop; it was the top half of the gear tab until that tab became the **Bag**.

The split is worth stating because the original arrangement had an argument behind it: the shop and
the bag are the same subject read from opposite ends, so a player weighing a Fine chest piece could
see what they already held without leaving the offer. That held while gear was a tab of its own. It
stops holding once the tab is an inventory — a shop is somewhere a player _goes_, which is what Town
is for, and a bag is something they _carry_, which is what a tab is for. What blunts the cost is
Town's own rule: every card names the currency its destination spends, so the trip is judged before
it is taken, and the stock is fixed for the hour, so the offer is still there on the way back.

⚠️ **Nothing about the stock is stored.** It is derived from the run's seed and the refresh index,
so it is the same six items however many times the app is relaunched inside the hour. Force-quitting
to reroll a shop is the reflex any generated stock invites, and the usual answer is to persist the
roll so it cannot be re-taken; deriving it is the stronger version of the same guarantee — **there
is nothing to re-take.** This project has no anti-cheat by design, so an approach that removes the
incentive structurally is worth far more than one that would have to police it.

The save holds two numbers: which stocking the run last bought from, and which offers it took.

**Prices are seconds of the run's own gold income**, the same trick `rewardSeconds` plays on the
stage lump. A flat gold price is unaffordable in chapter 1 and pocket change in chapter 4, so it
would have to be authored per band — one more table to keep aligned with a ladder that runs to
thousands of stages. The rate is floored at the income the first stage unlocks, because a brand-new
run earns nothing per second and a price computed from zero is a free relic.

**A run that was away five hours gets one shop, not five.** Missed stockings are simply not offered.
A backlog of shops would be a reason to log in on a schedule, which is the pattern this project
rejects.

`core/` has no clock: the shop takes a **refresh index**, and `ui/` divides `Date.now()` by the
authored period and hands the quotient in — the same arrangement `resume(state, nowMs)` has.

---

## Alloy, and why gear material is a currency

`alloy` is the sixth currency and the second with no idle rate. Spark is the precedent and a close
one: both are what a duplicate becomes when there is nothing left to do with the object itself.

"Enhance this piece using those pieces" is the shape milestone 12 was asked for, and consuming item
instances directly is the obvious way to build it. It has one failure the closed form avoids: a
stage clear drops gear, auto-battle clears a stage a minute, and an evening of that is thousands of
item records in a save the repair pass walks on every load. Bounding the bag then means **throwing
drops away**, which is the one outcome this project's economy rules out everywhere else.

Salvaging into a quantity fixes both at once. The bag holds what the player chose to keep, the
overflow is worth exactly what it would have been worth as fodder, and the save stays flat.

The screen still offers the action the way it was asked for — "use as material" salvages and spends
in one tap — and whatever the material was worth beyond the levels it bought stays in the wallet.

### Salvage returns everything ever invested

A piece is worth its grade's base value **plus every point of alloy ever spent on it**. Deliberate
generosity rather than an oversight: a salvage tax exists in other games to punish "wasting"
investment on the wrong piece, and the punishment lands entirely on players who did not yet know
which piece was the right one. Full return means a player can always undo an enhancement decision by
feeding the piece into a better one — the same promise `ascend` makes by never consuming a character
somebody levelled.

---

## What enhancement costs

Cost to take a piece from level `L` to `L + 1` is `6 × L^1.2` alloy and `6 × L^1.9` gold.

| Grade      | Cap | Alloy to cap | Gold to cap |
| ---------- | --- | ------------ | ----------- |
| Worn       | 20  | 1,878        | 11,393      |
| Sturdy     | 40  | 8,875        | 88,272      |
| Fine       | 60  | 21,861       | 289,616     |
| Masterwork | 80  | 41,355       | 671,122     |
| Relic      | 100 | 67,753       | 1,286,557   |

**Gold is the binding constraint and material is the soft one**, by design. Four places in this
codebase say gold's level-curve coefficient is the shallowest of the three **because gear will spend
it later**; this is later. Kitting a party of five in fully enhanced relics is twenty-five pieces and
about **32M gold**, which at the 91 gold/s the top of chapter 2 pays is a hundred hours. Levelling
one character to 200 is about 6.4M, or twenty hours. So gear roughly doubles what gold is for, which
takes it from the loosest of the three levelling currencies to comparable with essence.

68k alloy is about 280 sturdy pieces salvaged, and every win drops at least one. **A player who
fights is never short of material; what they are short of is gold.**

`gear.spec.ts` asserts the ratio directly, derived from `STAGE_REWARDS` — so extending the ladder
re-runs it. If alloy ever binds harder than gold, gear has stopped being a gold sink and the level
curve should be revisited with it.

---

## Auto-equip

One button on the character sheet fills all five slots with the best pieces in the bag. Five slots
each needing a tap into a picker, times a roster, is what it answers.

⚠️ **It draws only from unequipped gear and never takes a piece off another character** — the one
place it deliberately does less than `equip`, which does steal. The asymmetry is the point: a manual
equip is a player naming one piece and one wearer, so moving it is what they asked for; a bulk
action carries no such statement, and one that silently stripped four other characters would be a
button to be afraid of. The cost is real and the screen says it out loud: the best piece in the game
for this character can sit on a benched character and this will not fetch it.

A slot changes only when a candidate is **strictly** better, so a second press is a no-op rather
than a shuffle between two identical pieces.

**Ranking is one scalar, and the archetype gate is what makes it one.** Candidates are already
filtered to this character's archetype and the slot in question, so they share an authored profile
and `gearScale` totally orders them. This is why the ladder is free to overlap — see the grade
ladder above — and why nothing here needs grades to be strictly ordered.

## Two rules that are not conveniences

⚠️ **Equipped gear can never be consumed.** Not by salvage, not as material, not indirectly through
the inventory cap. This is the gear spelling of milestone 3's settled law — _only spare copies are
ever consumed, never a character you have levelled_ — and it exists for the same reason: it removes
the entire category of "I destroyed a week of investment by tapping the wrong row", and with it the
confirmation dance that category demands.

⚠️ **Nothing a fight drops is ever thrown away.** The bag holds 240 unequipped pieces, so something
has to give when it fills, and what gives is the **object** rather than the **value**: the worst
piece of the union salvages into alloy worth exactly what it would have been worth as material. A
drop arriving into a full bag of junk keeps the drop.

**The one case worth surfacing is a purchase into a full bag.** "Best of the union" cuts both ways:
if the offer is worse than all 240 pieces already held, the piece just bought is the one that melts.
Gold is still spent and the offer is still marked taken, and that is correct — the value comes back
as alloy — but a confirmation reading "added to the bag" would be the screen lying about a
transaction the player just paid for. So `buyGear` reports `kept` and `salvaged` rather than only
`ok`, and the gear shop says which of the three things happened: bagged, bagged after shedding
_n_ pieces, or salvaged on arrival.

Refusing the purchase instead was the alternative and it loses on the same grounds `useAsMaterial`
keeps a salvage that did not add up to a level — the outcome is honest and actionable either way,
and a refusal would mean "your bag is full" blocking a purchase whose fix is a chore.

---

## Enemies and gear

**Enemies wear none, and are not planned to until chapter 10.** Difficulty on that side of the board
is purely the stage's `level` against the archetype's tier — see [milestone 10](milestones.md).

That is deliberate and it is the point of the milestone: a geared party flies through content tuned
for an ungeared one, which is what makes gear feel like progress rather than a tax. The balance
sweep measures it — the same five characters at the same investment clear meaningfully further with
gear on, and further still with a full set.

Chapters 3 through 10 do not exist, so nothing implements enemy gear today and nothing should.
When chapter 10 arrives, the shape to reach for is the one milestone 10 already established: fold
the expected player gear budget into the enemy's authored stat block or its level, rather than
building a second equipment system on the enemy side. `toEnemyCombatant` records why the enemy side
has one fewer dial than the player side, and that argument applies here unchanged.

---

## Where it lives

| Module                                                    | What it holds                                          |
| --------------------------------------------------------- | ------------------------------------------------------ |
| [`core/gear/types.ts`](../src/core/gear/types.ts)         | The vocabulary, and the percentage argument in full    |
| [`core/gear/stats.ts`](../src/core/gear/stats.ts)         | What a piece and a loadout are worth, and how it lands |
| [`core/gear/inventory.ts`](../src/core/gear/inventory.ts) | Minting, equipping, salvage, enhancement, load repair  |
| [`core/gear/roll.ts`](../src/core/gear/roll.ts)           | Drop rolls and the grade tilt                          |
| [`core/gear/shop.ts`](../src/core/gear/shop.ts)           | The derived hourly stock and its pricing               |
| [`data/gear.ts`](../src/data/gear.ts)                     | Grades, profiles, costs, drop and shop coefficients    |
| [`ui/gear.service.ts`](../src/ui/gear.service.ts)         | The seam, and the only clock in the system             |
| [`ui/bag-view.ts`](../src/ui/bag-view.ts)                 | The bag: everything nobody is wearing                  |
| [`ui/character-view.ts`](../src/ui/character-view.ts)     | The equipment panel, and the auto-equip button         |
| [`ui/gear-shop-view.ts`](../src/ui/gear-shop-view.ts)     | The hourly shop, in Town                               |

Gear enters the simulation on the same seam as level and rung: `toBattleCombatant` takes a
`GearBonus` and applies it **after** growth. Both operations are multiplications so they commute,
but the order matters for what the number _means_ — a percentage of the level-1 block is a fixed
quantity the level curve leaves behind within a few dozen levels.

`repairLoadouts` runs on every load beside `reconcileClearedStages` and `grantStarters`. The save
layer parses gear's **shape**; the content check — does the id resolve, is the piece in the slot it
claims, does its archetype still match its wearer — needs both the bag and the content this build
ships, and only `ui/` can see both.
