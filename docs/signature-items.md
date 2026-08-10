# Signature items

The fourth progression axis, alongside levels, ascension rungs and gear. Added in
[milestone 16](milestones.md#16-signature-items--complete).

One per **ascended-tier** character — seven of the forty-nine, one per faction. It unlocks at the
`mythic` rung, runs thirty levels, and is bought with **emblems**, a currency that buys nothing
else. Every level adds stats; levels 1, 10, 20 and 30 each hand over a stronger version of the
character's ability.

Companion references: [economy](economy.md) for emblems, [ascension](ascension.md) for the rung it
gates on, [combat](combat.md) for the skill vocabulary an ability overrides, [gear](gear.md) for
the percentage-bonus rule it inherits, [glossary](glossary.md) for the tier/rarity collision this
page has to keep straight.

---

## It is one integer, not an item

⚠️ **`OwnedCharacter.signature` is the whole of it.** Zero is locked.

Calling it an "item" is the genre's word and it is worth being precise about what it is not. A
`GearItem` is an **object**: minted with an id, held in a bag, moved between characters, salvaged,
and two of them are two different things a player picks between. A signature item is none of those.
There is exactly one per character, it can never move, it can never be duplicated, and it can never
be salvaged. Strip away everything `GearItem` carries in order to be addressable and what is left is
one number.

The character sheet draws it as a slot. That is presentation, and it is fully compatible with the
storage being an integer.

## Two axes, and they grow differently

- **Stats** grow **every level**, smoothly.
- **The ability** grows in **four steps**, at levels 1, 10, 20 and 30.

Neither works alone. Thirty levels of nothing but stats is a treadmill with three interesting
moments in it; an ability with no stats between the marks makes twenty-seven of the thirty levels
purchases with nothing to show for them. Each is the reason the other is worth buying.

## Who can have one

Two conditions, both checked in `signatureUnlocked`:

1. **Ascended tier** — which character was pulled, and it never changes.
2. **At or above the `mythic` rung** — how far that character has been ascended.

⚠️ Those two words are the collision this project carries on purpose (see
[glossary](glossary.md)). "Ascended" is both a tier and a rarity rung and they are unrelated here:
the gate wants a top-**tier** character that has also been invested in, which is why it reads both.

Both are enforced in `core/`, not left to authoring. A signature item accidentally pointed at a
legendary-tier character is **inert** rather than a quiet exception to the rule.

### What the gate costs

`mythic` is four rungs above where an ascended-tier character starts:

| Path      | Copies to `mythic` | Rough pulls | Rough days at a full clear |
| --------- | ------------------ | ----------- | -------------------------- |
| mortal    | 27                 | ~3,300      | ~70                        |
| celestial | 39                 | ~4,800      | ~100                       |

This is deliberately the last thing a run reaches for.

## What a level costs

`10 + 1.6 × (L − 1)` emblems, for the level being **bought**. Level 1 costs 10 and is the unlock —
a signature item is never granted. Level 30 costs 56. The whole climb is **996 emblems**.

⚠️ **Linear, not the `coefficient × L ** exponent` shape gear and character levels use.** Those
price against curves that compound, so their costs have to compound to keep pace. A signature level
is worth a flat slice of one stat profile and a tenth of the way to a tier mark, so a linear price
is what keeps the thirtieth level as worth buying as the first.

Smooth rather than stepped per tier, too. A stepped price sits flat for nine levels and then jumps
by a factor the player did not see coming; a ramp moves every time they look at it.

⚠️ **There is no "buy as many levels as I can afford" control**, unlike character levelling. Emblems
are shared across every ascended-tier character a run owns, so spending them **is** the decision the
currency exists to create — and this is not `ascendAll`, which is licensed precisely because copies
are spendable on one character and nothing competes.

## The stats

Every value is a **fraction of the wearer's own scaled stat**, multiplied by the level. A profile of
`{ atk: 0.05 }` is +5% attack at level 1 and +150% at level 30.

⚠️ **Never a flat quantity.** A flat bonus is invisible against a levelling curve worth ×10⁹, and —
the stronger argument — it is an _addition_, which is what the whole-board rescale identity in
`simulate.spec.ts` forbids. Same rule as [gear](gear.md), same reason.

**Summed with gear rather than compounded.** Gear +60% and a signature item +150% is +210%, not
+300%. Compounding would make whichever bonus was applied last the more valuable one, which is a
property no panel can explain and no player would guess.

### The budget is not identical across the seven

Roughly 5% per level, varying between 4.5% and 5.5%, because the four stats are not worth the same
per point:

- ⚠️ **`haste` is worth the most and gets the smallest budgets.** Turn frequency is
  `ceil(1000 / haste)` — sharply non-linear. Aelrindel at 152 going to 243 is a turn every 5 ticks
  instead of every 7, a ×1.4 on his whole output before a point of `atk` is counted.
- **`def` is worth the least and gets the largest.** It sits under a diminishing-returns curve, and
  [gear](gear.md) records that the defensive share of its profiles is already deliberately half what
  it looks like it should be.
- **`hp` is worth less than `atk`** on a board where damage is `atk² / (atk + def)`.

`data/signature.spec.ts` holds the band and holds that the haste-moving items carry the smaller
totals.

## The ability

Two kinds, and between them they are the whole vocabulary:

### Skill overrides

A **partial override** merged over one of the character's authored skills — any of `target`,
`cooldown`, `condition` or `effects`. A field left absent keeps what the skill said, which is
deliberately different from setting it to a falsy value: `cooldown: 0` is a skill available every
turn and omitting `cooldown` is a skill the item does not touch.

One mechanism rather than a union of edit kinds (retarget, shorten, drop-condition, amplify),
because a partial override expresses all of them as _the field being present_ — so the vocabulary
cannot fall behind what a `SkillData` can say.

⚠️ **`effects` replaces rather than appends.** An override meaning "the same hit, harder" has to
restate every clause, including the status the skill applied. Forgetting one is how a skill silently
stops applying its debuff. An append-only field could not express it without applying the original
clause twice, and matching clauses by position would be an index doing the job an id does everywhere
else.

⚠️ **Merged at kit-build time, never per tick.** `toBattleCombatant` resolves it once while
assembling the combatant, so the simulation loop never learns signature items exist. That is what
makes an ability free at runtime and is the reason to prefer this over a modifier consulted inside
`chooseSkill`.

An override naming a skill the kit does not have is **inert**, which keeps a stale `skillId` a
content bug for `data/signature.spec.ts` to catch rather than a runtime surprise.

### Opening statuses

A `StatusData` applied to the **wearer** at tick 0, reusing the status vocabulary whole rather than
inventing a passive language. Everything a passive would want to say — a lasting stat multiplier, a
shield, an aura — is already a status, and statuses already have a duration, a hostile flag, a
cleanse interaction and a name every screen knows how to draw.

⚠️ **The wearer only.** There is no way to spell "and my whole party starts with this". Applying a
status to somebody else at setup means picking targets before the first tick, which is what a skill
is for.

⚠️ **A permanent passive is a duration longer than a fight can last.** `MAX_BATTLE_TICKS` is 900 and
the shipped passives run 1000. There is deliberately no infinity value: keeping the field a plain
number means nothing downstream has to special-case a sentinel. `data/signature.spec.ts` derives the
relationship, so raising the tick cap without raising the duration is a failing test.

### ⚠️ No signature item multiplies healing, and that is a rule rather than an oversight

Closing pressure amplifies every damage instance without bound past `PRESSURE_AFTER_TICKS` and
**deliberately does not amplify healing** — see [combat](combat.md). So a party made unkillable by a
sustain item does not win. It stalls, the ninety-second clock runs out, and **a timeout is a
defeat**.

The obvious signature item for a healer is therefore the one that makes her lose. Seraphine's spends
its rungs on shield uptime, on removing the conditions that make her stand idle, and on Judgement's
damage instead. A **shield is safe where a regeneration is not**, and the distinction is exactly
what closing pressure cares about: a shield banks a pool once and depletes, so it cannot outrun
rising damage.

`data/signature.spec.ts` asserts no opening status is a `regen`.

### Four authored rungs, and each one replaces the last

⚠️ **A tier does not stack on the tier below it.** Only the reached rung is applied, so every rung
restates everything the earlier rungs did and adds to it. That is why the fourth entry of every item
is the longest.

Authored outright rather than scaled by a factor per tier, because the half that matters is an
ability **gaining a clause** — a target widened, a condition dropped — which a multiplier cannot
express. It also keeps every scaling decision in `data/`, where balance numbers live.

The failure this shape makes possible: a rung that forgets to restate an earlier clause silently
takes an upgrade away at the moment the player pays for it, and nothing on screen would show it —
the sheet still reads "Tier III" and the stats still climb. `data/signature.balance.ts` measures
reach at every rung for exactly this.

## What one is worth, measured

`data/signature.balance.ts` fields each of the seven at the unlock rung and **bisects for the
highest enemy level the party clears at least half the time**. A maxed item buys:

| Character | Bare reach | Gain |
| --------- | ---------- | ---- |
| Aurelia   | 409        | +27  |
| Thraun    | 398        | +14  |
| Aelrindel | 417        | +25  |
| Nekros    | 417        | +25  |
| Vharok    | 418        | +35  |
| Seraphine | 421        | +11  |
| Azrathoth | 429        | +29  |

⚠️ **+3% to +8% reads modest and is not.** Measured instead as win rate at a fixed contested level,
the same items take Aurelia, Aelrindel, Nekros and Vharok from **0.00 to 1.00**. Win rate near a
party's damage threshold is a step function, so an item worth a few percent of reach is worth the
entire fight at the margin — and the margin is where every fight a player has not already won sits.
Quote whichever figure the question calls for; do not read the reach number as evidence the item is
small.

### ⚠️ Why the probe re-levels its own encounter

`mythic` caps at level **340**. The hardest authored stage is the chapter 2 boss at level **85**. A
party at the unlock rung is four times past the top of the ladder, so **no shipped stage can measure
a signature item** — the first two versions of this probe reported a gain of exactly zero on all
seven characters, once because everything was a 100% walkover and once because everything was a 0%
wipe.

So the probe takes the hardest authored line-up and fields it at the party's own level, which is the
same move `core/towers.ts` makes: `data/` authors who stands there, and the level is derived. Both
sides then sit on the same growth curve, which `simulate.spec.ts` proves is an identity.

The consequence worth carrying: **a signature item still has no authored content to matter in.**

⚠️ **Chapter 3 was the named trigger and it did not close this.** The Bound Marches top out at enemy
level **160** against a `mythic` cap of **340**, so the gap went from ×4 to ×2 and the probe still
has to re-level its encounter. What would close it is a chapter reaching the low three hundreds —
roughly chapter 8 at the re-cut's fifty-stage cadence — or a tower band that does. Do not treat "the next
chapter" as the trigger again without checking the number.

### The sweep's timeout guard counts victories only

⚠️ Scoped the same way `chapters.balance.ts` scopes its headroom assertion, and for the reason
[combat](combat.md) gives: a fight the party loses has no tuning claim on it.

It was not scoped that way at first and Thraun found the gap immediately. A five of him carries 29
`atk` — five walls do not lose a fight, they fail to finish one — so his losing trials are timeouts
by construction and an unscoped reading reported the wall as breaking the ninety-second guard. A
mono-Thraun five is not a party anybody can field, since the roster ships one of him, so that was
the control failing rather than the item.

## Adding one

A new ascended-tier character needs a row in `data/signature.ts` and nothing else.
`data/signature.spec.ts` derives the count from `CHARACTERS` rather than asserting seven, so a new
ascended-tier character **without** an item is a failing test rather than a character whose panel is
permanently empty.

What the spec holds: one item per ascended-tier character and no others; a rung per tier mark, both
derived from the rules; every override naming a skill the character actually has; no ordinary skill
taken below a 15-tick cooldown floor or below what it was authored with; every opening status known,
non-hostile, longer than a fight, and never a `regen`; and the stat budget inside its band.
