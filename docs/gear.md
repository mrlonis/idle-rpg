# Gear

The third progression axis, alongside levels and ascension rungs. Added in
[milestone 12](history.md).

A character wears five pieces — head, arms, chest, legs, boots. Every piece names an **archetype**
it was forged for, a **grade** it dropped at, and a **faction** it is aligned to (or none). What it
is worth is a **percentage of the wearer's own stats**.

Companion references: [attributes](attributes.md) for the stat block gear multiplies,
[economy](economy.md) for the currencies it spends, [glossary](glossary.md) for the vocabulary.

---

## The one rule everything else follows from

⚠️ **Every gear bonus is a percentage, never a flat quantity.**

Levelling is worth ×10⁹ end to end and ascension ×450 (see [economy](economy.md)). A flat
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

It was authored at twice these numbers and the ladder sweep went red on `c2-s23` (`c4-s13` since
the six-chapter re-cut): a fully geared
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

⚠️ **The count draw is the first draw in `rollDrops`, and its position is load-bearing.** Every later
draw shifts by one, so moving it re-rolls every historical drop for a given seed — invisible in play,
and it turns every recorded balance figure into a different number. Same discipline as the bounty
board shuffling its whole pool before filtering.

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

⚠️ **Every gate lands inside the stages this build ships**, and that is the constraint the numbers
are picked against. The first version of this idea gated Sturdy behind a third chapter — which did not
exist at the time — leaving four of five grades unreachable. `gear.spec.ts` derives the ladder's
length from the shipped chapters and asserts every gate falls inside it, so the rule survived
that chapter arriving without anything here needing to change.

Among what is unlocked, the odds still tilt with depth: a grade's authored weight is multiplied by
`(1 + stageIndex / gradeSoftness) ** gradeIndex`. Two properties fall out of that shape:

- **The authored weights are the distribution at the stage a grade unlocks.** That is what the `1 +`
  buys. A bare ratio makes the top grade's weight `softness⁻⁴` at the bottom of the ladder — one in
  millions rather than one in hundreds — and the authored number stops describing anything a reader
  could predict from.
- **The bottom grade never becomes impossible**, it becomes rare — and a worn piece late in a run is
  still worth its salvage.

⚠️ **`gradeSoftness` is a rate _per stage_, so the ladder's length is the other half of every number
it produces — and milestone 18's chapter made that visible.** At 90 the top grade was 14.8% of
end-of-ladder drops over a hundred and fifty stages and **21.3%** over two hundred, past the `< 0.2`
bound in `gear.spec.ts` that exists to keep a relic a find rather than a routine drop. It went to
**100**: 18.7% over two hundred stages, 12.9% over a hundred and fifty.

Milestone 21a's chapter fired it again at two hundred and fifty stages — **24.5%** — taking it to
125; 21b's fired it at three hundred — **23.4%** — taking it to 150; 21c's at three hundred and fifty
— **22.6%** — taking it to 175; 21d's at four hundred — **22.1%** — taking it to 200; and The
Standing Line at four hundred and fifty — **21.7%** — taking it to **225**. Every one restores 18.7%
over the ladder that actually ships. Same move, longer ladder, six times now.

⚠️ **Six re-derivations landing on the same 18.7% is the tell that the number is being solved for
and the shape is not.** The solution is always `gradeSoftness = stages / 2` — the value at which the
tilt equals exactly 3.0 — so this is not a tuning constant at all, it is the ladder's length halved
and written down by hand once a chapter. A tilt linear in the stage index has no ceiling, so the top
grade's share climbs without bound and no constant is right for more than one chapter; chapter 12
will want 250. What this eventually wants is a tilt that **saturates** — a share that approaches a
ceiling instead of passing through it — and the thing to stop doing is picking another constant. It
is recorded rather than fixed because milestone 21 forbids taking the scope; see
[authoring](authoring.md).

⚠️ **Do not re-derive it several chapters ahead to save edits.** 21b declined 200, which would have
bought the whole milestone in one go, on the grounds that this quantity is **not** meant to move: at
200 it reads 12.9% at chapter 8 and watches nothing until chapter 10, which makes the saturating
tilt easier to forget rather than more likely to get written. That is the opposite of the call 21a
made on the level ceiling's ratio and on the tower:campaign floor, and the distinction is exactly
whether the quantity is _supposed_ to fall. Those two are; this one is a bug being papered over.

⚠️ **21d confirmed that call and the confirmation is worth recording**, because "declining a
labour-saving edit" is the kind of decision that looks like fussiness a year later. Had 200 been
written in 21b, the fourth and fifth landings would both have been silent — and it is the fifth that
turned "always 18.7%" into "always `stages / 2`", which is the finding that makes the saturating tilt
writable at all. The batched call on the level ceiling's ratio went the other way: that guard watched
nothing for four chapters and was then **retired** in 21d rather than re-derived, so nothing was lost
by batching it.

### ⚠️ Gear's gold cost is a constant, and the economy around it is not

`gear.spec.ts`'s "roughly doubles what gold is for" measures the hours of top-of-ladder income it
takes to kit a party of five in fully enhanced top-grade pieces. Milestone 21b found two things
wrong with it at once.

**It was retyping the ladder's length.** The comment said "derived from `STAGE_REWARDS`, so extending
the ladder re-runs it" — and the _exponent_ came from there while the **index** was the literal
`100`, which is how long the ladder was when it was written. So for four chapters it measured gear
against chapter-4 income and re-ran nothing, which is exactly the failure [testing](testing.md)
names. Correctly derived it would have fired at **chapter 7**, at 17.4 hours against a floor of 20.

⚠️ **And the quantity falls forever by construction.** The top grade costs what it costs at chapter 1
and at chapter 10 — gear's gold cost is a **constant** — while top-of-ladder income grows with every
chapter by design. So this decays on every chapter whatever anybody authors: 2.3 hours at three
hundred stages, about 1.5 at four hundred. Unlike the level ceiling there is **no invariant to
restate it as**: measured against levelling instead of against income it decays _faster_, because
level cost grows as `L ** 2.55`.

**What closes it is gear costs that scale with the content**, which is a retune on the scale of a
milestone, and milestone 21 says in as many words that a chapter finding it needs one writes it down
rather than taking the scope. The floor is 1 so the guard still catches a gear curve authored at
nothing, and it fires again around chapter twelve — at which point the question is whether gear costs
have been made to scale, not what number goes there.

This is the one guard milestone 18 tripped where the content genuinely had outgrown the threshold, and
it is worth contrasting with the three it tripped that had not — see
[testing](testing.md), which sets out how to tell the two cases apart. Here the number was doing
exactly its job: a softness tuned against one ladder length silently gets more generous every time a
chapter ships, and nothing else would have said so.

⚠️ **Raising this is safe for the starter wall; lowering it would not be.** `gradeWeights` tilts the
whole distribution, and the guard that three level-1 starters cannot gear their way through the
stage-7 lock fields grade 0 at level 1 **explicitly** rather than rolling for it. The dial that
would move that guard is Worn's own multiplier, which sits at 0.175 against a 0.2 limit and is not
free.

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
stage lump. A flat gold price is unaffordable in the fen and pocket change at the top of the
ladder, so it
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

**Enemies wore none until chapter 12, and from The Rustwood on a campaign stage may author a set.**
Below chapter 12, and on every tower floor, every Descent board and every Expedition, difficulty on
that side of the board is still purely the stage's `level` against the archetype's tier.

That gap was the point of milestone 12: a geared party flies through content tuned for an ungeared
one, which is what makes gear feel like progress rather than a tax. The balance sweep still measures
it — the same five characters at the same investment clear meaningfully further with gear on, and
further still with a full set.

### How a stage wears one

- An **enemy archetype** names a `gearArchetype` — one of the five the player's bag uses. It says
  what a body _is_, so a wall gets health out of a set and a glass cannon gets attack out of the
  same one.
- A **stage** authors `gear: { grade, level }` — a full five-piece set, not five slots. There is
  nothing on that side of the board to equip, salvage or enhance, so five numbers that could only
  ever be filled in would be a second inventory system for a side with no inventory.
- `resolveStage` prices it into one `GearBonus` per archetype and hangs it on `StageData.enemyGear`,
  beside the three derived payout fields. `toEnemyCombatant` applies it after growth, exactly as
  `toBattleCombatant` does for the player.

⚠️ **It is derived, never authored as percentages.** A chapter that wrote "+8.6% health" beside a
Worn set would keep asserting 8.6% while `GEAR_PROFILES` was retuned underneath it — the coupling
turned into a comment that [testing](testing.md) names as the `data/` failure mode. The chapter
authors a grade and a level; what a grade is worth is `data/gear.ts`'s business on both sides.

⚠️ **An enemy set is never aligned.** Alignment is the player's 1.3× for matching a piece's faction
to its wearer's; an enemy's set has no faction on it, and an aligned one would be a thirty percent
difficulty step decided by nothing an author wrote down.

⚠️ **Absent `gearArchetype` on a geared board is silent**, which is why `chapters.spec.ts` asserts
every body a geared stage fields declares one, and `enemies.spec.ts` asserts every declared value is
a real archetype. `setBonus` returns nothing for an archetype it does not recognise, so a typo puts a
naked body on a board tuned as though it were kitted and nothing anywhere says so.

### ⚠️ It is roughly an order of magnitude too small to be the escalation axis

This is the finding milestone 27 was supposed to test, and the answer is negative. Measured against
the campaign's own seam parties:

|                                        | worth                                                       |
| -------------------------------------- | ----------------------------------------------------------- |
| Full **Worn** set, level 1             | +8.6% hp / +2.4% atk on a `tank`; +3.8% / +6.2% on a `mage` |
| Full **Worn** set at its cap of 20     | +17.6% hp / +4.9% atk on a `tank`                           |
| Full **Relic** set at 100              | +166% hp / +46% atk on a `tank`                             |
| **What the enemy side actually needs** | **×3 to ×4**                                                |

A chapter final refielded at the next chapter's roof needs the enemy side scaled ×3 before the tuned
party stops taking it with all five alive, and ×4 before it loses. Worn is ×1.09 to ×1.18 — no
measurable change at all — and the whole grade ladder end to end is still short of ×3.

So **the three guards widened against the promise of this axis do not come back**, and one of them
moves the wrong way: gear lengthens fights, so adding it _raises_ the longest-cleared-fight quantity
the 0.75 bar bounds. [authoring](authoring.md) records what each one measured.

**What would close it is a gear axis sized for the enemy side rather than borrowed from the
player's** — a steeper grade ladder, a per-chapter grade step much larger than one rung, or an
escalation that is not gear at all. That is a milestone-sized retune and milestone 27 wrote it down
rather than taking it.

---

## Where it lives

| Module                                                    | What it holds                                         |
| --------------------------------------------------------- | ----------------------------------------------------- |
| [`core/gear/types.ts`](../src/core/gear/types.ts)         | The vocabulary, and the percentage argument in full   |
| [`core/gear/stats.ts`](../src/core/gear/stats.ts)         | What a piece, a loadout and an authored set are worth |
| [`core/gear/inventory.ts`](../src/core/gear/inventory.ts) | Minting, equipping, salvage, enhancement, load repair |
| [`core/gear/roll.ts`](../src/core/gear/roll.ts)           | Drop rolls and the grade tilt                         |
| [`core/gear/shop.ts`](../src/core/gear/shop.ts)           | The derived hourly stock and its pricing              |
| [`data/gear.ts`](../src/data/gear.ts)                     | Grades, profiles, costs, drop and shop coefficients   |
| [`ui/gear.service.ts`](../src/ui/gear.service.ts)         | The seam, and the only clock in the system            |
| [`ui/bag-view.ts`](../src/ui/bag-view.ts)                 | The bag: everything nobody is wearing                 |
| [`ui/character-view.ts`](../src/ui/character-view.ts)     | The equipment panel, and the auto-equip button        |
| [`ui/gear-shop-view.ts`](../src/ui/gear-shop-view.ts)     | The hourly shop, in Town                              |

Gear enters the simulation on the same seam as level and rung: `toBattleCombatant` takes a
`GearBonus` and applies it **after** growth. Both operations are multiplications so they commute,
but the order matters for what the number _means_ — a percentage of the level-1 block is a fixed
quantity the level curve leaves behind within a few dozen levels.

`repairLoadouts` runs on every load beside `reconcileClearedStages` and `grantStarters`. The save
layer parses gear's **shape**; the content check — does the id resolve, is the piece in the slot it
claims, does its archetype still match its wearer — needs both the bag and the content this build
ships, and only `ui/` can see both.
