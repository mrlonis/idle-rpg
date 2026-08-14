# The Descent

One run a day: three floors of three fights, damage that carries between them, and a card taken
after every win. Added in [milestone 22](history.md).

Companion references: [combat](combat.md) for the loop it fights in, [economy](economy.md) for what
it pays, [navigation](navigation.md) for where it sits, [glossary](glossary.md) for the vocabulary.

---

## Why this exists, and what it is the only place for

Every other fight in this game is decided at the crew editor and then watched. A campaign stage, a
tower floor, a bounty — all the same shape: arrange, confirm, observe.

**This is the only content that asks a question mid-flight.** The third fight's card depends on how
the second went, and the party at fight nine is not the party that walked in. That was the roadmap's
whole argument for the mode and it is what every decision below is measured against.

Two mechanics carry it, and both are **subtractive**:

- **Attrition.** Health and energy carry from fight to fight and the fallen do not come back. A clean
  win is worth more than a win, so the run's real currency is health rather than crystals.
- **A choice with an opportunity cost.** Three cards are offered and one is taken. Nothing is spent
  — but the two not taken are gone, which is the first irreversible decision in this game that is
  not an ascension.

---

## What a run is

| Thing       | Value                                                               |
| ----------- | ------------------------------------------------------------------- |
| Fights      | 9 — three floors of three                                           |
| Cards       | 8 — one after every win but the last                                |
| Attempts    | 2 — the run, and one retry across the whole of it                   |
| Crew        | 3 factions of 7, **drawn daily**, locked for the run once it starts |
| Enemy level | Derived from the hardest campaign stage the run has ever cleared    |
| Opens       | Chapter 3 cleared — 60 stages                                       |
| Resets      | 04:00 UTC, the same boundary quests and the bounty board roll on    |

Nine fights is the length at which attrition is the mechanic rather than a flavour. Three is too few
for the cards to compound into anything and fifteen is a chore on a daily timer; at nine a run makes
eight decisions, which is enough that two runs on one day's boards are genuinely different runs.

### ⚠️ The whole mode adds two save fields

`descent` — the run in flight — and `descentRuns`, a count of runs finished. Everything else is
derived: the day's nine boards, the day's three factions, the three cards on offer, every enemy
level and every payout.

That is not frugality. It is what makes **rerolling impossible rather than merely detectable**,
which is worth far more in a project with no anti-cheat than any amount of validation: force-quitting
and relaunching hands back the identical nine boards and the identical three cards, because there was
never a draw written down to re-take. The same three arguments `gearShopOffers` and `dailyBoard`
already run on.

---

## The daily lock

Three factions of seven, shuffled from the run's own seed against the day index and then sorted back
into authored order — so the shuffle decides _which_ and the content decides how they read.

⚠️ **A pure function of the seed and the day, never of what the run owns.** Weighting the draw toward
a run's roster was considered and is wrong: the roster changes during a day, so a roster-dependent
lock could move under a player mid-run — a crew legal at breakfast and illegal at lunch, for reasons
nothing on screen could explain.

⚠️ **A lock this build cannot fill is a weaker crew, never a locked door.** A short party is a legal
party; `simulateBattle` reads only an _empty_ one as an immediate defeat. So a run whose three
factions are thin fights shorthanded rather than being refused, which is the line
[rejected](rejected.md) drew when it rejected role-locked formation slots: content may be hard
to bring a good answer to, and may never reach a state where no answer exists.

Three rather than two or four is the number that says how much of a constraint there is.
Twenty-four characters eligible on a full roster is deep enough that a five is always buildable and
shallow enough that it is never the same five two days running.

---

## The crew is copied into the run

⚠️ **A run reads its own `party`, not the formation book.** A crew is a plan the player edits freely
and a run is a thing already underway; reading the book per fight would let a swap made between fight
four and fight five arrive at full health with none of the attrition the mode is about, and would let
a player walk a fresh five into the boss.

Stats are still resolved live off the roster, so a level bought between two fights is felt. That is
deliberate and generous — nothing here is a competition, and a player who spends essence has spent
essence.

### Health is a fraction, not a quantity

⚠️ Stored as a share of maximum, which is what makes it survive everything that can move a maximum
between two fights of one run: a level, a rung, a resonance floor, a gear swap, a signature level. An
absolute figure would read as a heal or a wound nobody administered — and against a ×10⁹ curve, a
very large one.

The fallen leave `party` **and** the health table. Either alone would be a body on the board at zero
health that every targeting rule then has to step around, and one that goes on paying the lineup
bonus for somebody who is not fighting.

---

## The retry

Two attempts across the whole run rather than one per fight. A retry per fight makes the mode a
matter of persistence; one across nine makes _when to spend it_ part of the run, which is the same
shape the cards have.

⚠️ **The run is only ever written on a victory.** A defeat costs one life and changes nothing else —
not the health, not the energy, not the cards, not the fight index. That is what makes the retry
genuinely the same fight from the same state rather than a reconstruction of it, and it is why there
is no separate "as it entered this fight" snapshot to roll back to.

---

## The cards

Fourteen families of four rungs — fifty-six cards from fourteen rows.

### A family with rungs, rather than fifty-six flat cards

The rule the mode rests on is that a family already taken comes back **only higher**. Authored flat
that is a naming convention holding a mechanic together; authored as a family it is an array index,
and `descent.spec.ts` can assert every rung is strictly larger than the one below it — which is the
failure that would otherwise be silent, because a repeat offered as a _downgrade_ still reads as a
reward on screen.

A family's **floor** is one above the highest rung the run holds of it, so the offer physically
cannot contain a card the run already owns or anything below it.

### The seven universal families

| Family      | Moves           | Rung 0 | Rung 3 |
| ----------- | --------------- | ------ | ------ |
| Whetstone   | `atk`           | +6%    | +30%   |
| Aegis       | `def`           | +10%   | +50%   |
| Vitality    | `hp`            | +8%    | +40%   |
| Quickstep   | `haste`         | +4%    | +20%   |
| Keen Edge   | `critChance`    | +4pt   | +20pt  |
| Cruel Edge  | `critDamageAmp` | +10pt  | +50pt  |
| Bloodthirst | `lifeLeech`     | +3pt   | +15pt  |

Every family scales its base by roughly **1 / 2 / 3.4 / 5**. Doubling twice would put the top rung
at ×4 and make the ladder read as three steps and a shrug; ×5 with a 3.4 under it is the shape that
makes Grand worth holding out for and Sovereign worth the whole run. A family taken all four rungs is
×11.4 its base — the largest single-axis stack the mode can produce, and it costs **four of a run's
eight choices**.

⚠️ **Three of the seven move stats gear cannot**, which is the point of the mode having a bonus
vocabulary at all. Crit chance, crit damage and life leech are bounded rates, so gear's
percentage-of-your-own-stat rule pays nothing on them.

### ⚠️ Percentages and points, and why the split is a rescale argument

`hp`, `atk`, `def` and `haste` are **percentages of the wearer's own stat**. They are quantities that
climb with the level curve, so anything _added_ to one would be a no-op at ×10⁹ and would break the
whole-board rescale identity `simulate.spec.ts` asserts.

`critChance`, `critDamageAmp` and `lifeLeech` are **points added to a bounded rate**. Most of the
roster sits between 0.02 and 0.12 crit, so a percentage of what they already have would pay almost
nothing — and nothing compares a rate against a scaling quantity, so points survive a rescale
untouched. It is the same split [`LineupLadderStepData`](../src/core/battle/types.ts) already makes.

**Summed rather than compounded**, exactly as a gear loadout is summed. Compounding makes the _last_
card the most valuable, which rewards a run for how far it got rather than for what it chose.

### ⚠️ An absent stat is conjured, unlike gear

`applyGearBonus` leaves an absent stat absent, because a percentage of nothing is nothing.
`applyDescentBonus` **adds** to the three bounded rates whether or not the character declares them —
the whole point of a life-steal card is that it reaches a character with no leech at all, and a rule
that skipped them would make the family pay only the handful of Monsters who already siphon.

### The seven faction families

One per shipped faction, all identical in size, paying attack at ×1.67 Whetstone's and health at
×1.25 Vitality's — on the same rung, and to that faction's members only. `descent.spec.ts` derives the set from `FACTIONS`, so a faction
with no family is a failing test rather than a daily lock that hands a player three factions and a
card pool ignoring one of them.

⚠️ **This is the pattern `AGENTS.md` names and rejects, and the rejection does not reach it.**
"+10% if two Fire units" is forbidden because it resolves to one optimal party, decided before the
fight. This is **drawn**, three at a time out of fourteen, after the crew is locked for the run and
after a daily faction lock nobody chose. There is nothing to optimise into: a crew built in the hope
of Wyrdsong loses eight runs in nine. What it rewards is the crew you happened to bring — and what it
_asks_ is the only question a card can ask a party that is already assembled, which is whether a
narrow bonus on three of your five beats a broad one on all of them.

All seven pay the same, for the reason `towers.spec.ts` holds the tower tracks equal: paying more for
one faction than another would let the banner's luck decide which of these is worth drawing, and the
banner's luck already decides plenty.

### ⚠️ The offer is filtered by the day's lock, and it shipped without that

A faction family for a faction the day's lock **excludes** is a card that can pay nobody in any legal
crew. Seven faction families against a three-faction lock is four of fourteen — better than a quarter
of every offer — and three dead cards in one offer is a choice the player cannot make. It reached the
screen before it was caught, on a run holding a Wyrdsong on a Dwarf/Undead/Demon day.

Two things about the fix are worth carrying:

- **It belongs in `core/`, not in the caller.** `descentOffer` takes the lock, so `descent.spec.ts`
  can hold the rule rather than each call site remembering it. The lock is constant for a run's whole
  length — drawn per day, and a run belongs to one day — so filtering the _offer_ can never make a
  card the run already holds unresolvable.
- ⚠️ **It moved the balance, hard.** Every dead card the greedy sweep policy took was a wasted choice,
  so the mode's real strength jumped the moment they were filtered: the finish rate went from 0.79 to
  **0.96** with nothing else changed, and the level line had to be re-aimed from −16/+4 to −8/+12.
  **The offer and the level line are one dial with two halves.**

### The rank ladder saturates

Four ranks — Lesser, Greater, Grand, Sovereign — drawn by a weight interpolated across a run's own
eight choices.

| Rank      | First choice | Last choice |
| --------- | ------------ | ----------- |
| Lesser    | 12           | 1           |
| Greater   | 5            | 5           |
| Grand     | 1            | 8           |
| Sovereign | **0**        | 5           |

⚠️ **The tilt is authored as two ends rather than as a softness constant, and that is the fix
[gear](gear.md) names for `gradeSoftness`.** That constant tilts by `1 + stageIndex / softness`,
which climbs without bound — and the cost of it is one hand-correction per chapter, forever, always
to `stages / 2`. A weight interpolated across a run's own choices reaches its end value on the last
one however long the run is, so there is nothing here to re-derive when content grows.

Sovereign starts at **zero**, which is the strongest statement the ladder makes: the top rung cannot
be drawn on the first choice at all, so "the cards get better as you go deeper" is a fact about the
draw rather than an average somebody would have to notice.

### ⚠️ The life-steal clamp is a termination guard

`maxLifeLeech` is 0.35 against a full Bloodthirst stack of 0.34, so it binds on nothing that ships.

It is there because leech is taken off damage **dealt**, and closing pressure amplifies damage
without amplifying healing — which is what breaks a closed sustain loop everywhere else in this game.
A party siphoning enough of its own output back does not win; it stalls, the ninety-second clock runs
out, and a timeout is a **defeat**. The clamp is a backstop against a fifth rung or a second leeching
family, in exactly the sense `MAX_RESIST` is.

---

## Difficulty: an offset, not a share — plus a slope

The enemy level is the hardest campaign stage this run has ever cleared, plus **−11** on the first
fight and **+9** on the last, linearly between, **plus 0.11 levels per level of anchor**.

At the unlock's anchor of 30 the slope contributes +3.3, so the total is about −8 / +12 — the pair
the mode shipped with. At the top of the shipped ladder it contributes **+27.5**.

### ⚠️ A share was the first draft and it was measured wrong

The obvious authoring is a _share_ of the anchor — 0.65 to 0.90 — and it fails in a way that only
shows up when the mode is measured at more than one depth. Enemy power is `perLevel ^ level` with
`perLevel` around 1.021, so a share is not a difficulty at all: 0.9 of level 14 is one level down
while 0.9 of the top of the ladder is twenty levels down at today's 200, and was **fifty-nine** at
the 588 this was measured against — ×1.5 and ×3.4 easier respectively. Measured, that read as a mode
which is a wall at chapter 1 and a walkover with five bodies at full health from chapter 5 onward.

⚠️ **The flattening to 0.50 levels a stage shrank the spread but did not change the finding, and the
spread grows straight back as chapters are added.** A share's error is a function of how deep the
ladder goes, and this one is planned for ~100 chapters — so re-deriving the offset as a share would
fail again, later and more quietly. The offset is correct for a reason that does not depend on the
current top.

An offset is the same number of steps along one exponential wherever it lands. That is what lets
twenty-four authored boards serve a five-hundred-stage campaign with nothing to re-derive per
chapter — milestone 10's argument applied to content fought once a day for the life of a run.

### ⚠️ But the party is not a fixed distance from the anchor either, and that is what the slope fixes

The paragraph above is right about the **boards** and it does not finish the argument. A fixed offset
is the same difficulty everywhere only if the party meeting it is a fixed distance from the anchor,
and it is not: the campaign stage the calibration anchors on is a chapter **final**, whose
`legendary` and `ascended` blocks climb at 1.0225 and 1.024 against a mostly-`common` five's 1.021,
and the ascension ladder hands the party a ×1.6 every time it crosses a cap. Both compound over the
whole level range rather than over a chapter.

Measured across the five sampled depths at a flat −8/+12, survivors of five:

| anchor         | 30   | 50   | 75   | 125  | 250      |
| -------------- | ---- | ---- | ---- | ---- | -------- |
| flat offset    | 3.20 | 4.15 | 4.15 | 4.80 | **5.00** |
| with the slope | 3.20 | 4.10 | 3.70 | 4.05 | **4.15** |

**Monotonic, ending in a full walkover** — at the deepest sample nobody ever died. Raising the fixed
offsets cannot fix that: +24 levels brings the deep end to a healthy 4.15 and takes the _shallowest_
from a 0.50 finish rate to **0.00**. The shape was wrong, not the number.

⚠️ **A slope of zero reproduces the original line exactly**, which is what makes the field safe to
author and what the level-dial override in the sweep still relies on. And note what this is **not**:
it is not the _share_ rejected above. A share replaces the anchor; this adds to it, so the mode is
still an offset along one exponential — the offset just grows with how far the party has come.

### ⚠️ The top offset is negative and the mode is still hard

The anchor is a stage the party cleared with a _full-health best five_. A Descent crew is drawn from
three factions it did not choose, arrives at fight nine carrying eight fights of damage, and may be
down to three bodies. Ten levels below a stage a run has already beaten is a harder fight than the
stage was.

### ⚠️ It opens at chapter 3, and the sweep moved it there

It was authored at chapter 1 alongside the towers, because everything optional in this game opens at
once. What stopped it is that the mode is not **finishable** at chapter 1 or 2: measured over twenty
days at each depth, a run finishes **0 times in 20** at both. A party with no ascension rung fields
**one skill each** — the kit gate opens at `elite` — against boards of four and five bodies with
legendary anchors, and no level offset fixes that because the binding constraint is board weight
rather than level.

What forced the move rather than merely suggesting it is the **daily quest**. "Finish a Descent" is
measured against `descentRuns`, and [`core/quests.ts`](../src/core/quests.ts) forbids a quest a player
cannot make move today — the same rule that keeps `clearedStages` off that list. A mode that is
visible and unfinishable would have shipped exactly that: a permanent empty row, for two chapters.

---

## The boards

Twenty-four authored, nine drawn each day: two ordinary fights and one guardian from each floor's own
group, without replacement. Twenty ordered pairs of ordinary boards times three guardians is sixty
shapes a floor, and 216,000 distinct nine-fight runs.

### ⚠️ Every board is mixed-faction, and that is the rule that makes this pool unlike a tower's

The crew's factions are **drawn** and the board's are not. A mono-faction board would make roughly a
seventh of days a walkover and a seventh a wall, decided by a matchup nobody chose — the exact
opposite of what the matrix is for, which is deciding a fight the player brought an answer to. Every
board fields at least three factions, and no faction holds more than a quarter of the pool.

That is the deliberate inverse of a tower, where boards lean hard on one faction _because_ the crew is
known: a tower is a question with a fixed answer, and this is a question asked of an answer that
changes daily.

### What escalates across the floors

Floor 1 is four bodies of mostly commons and exists to be cleared cheaply — a run that arrives at
floor 2 already wounded has lost, and a first floor that could do that would make the mode a coin
flip on the opening draw. Floor 2 goes to five bodies with a legendary front. Floor 3 fields two
legendaries in front, and its guardians are the only boards with an `ascended` anchor.

⚠️ **The escalation a player actually feels is their own health**, which is why the boards escalate
less steeply than a chapter's. Nine fights at a flat difficulty already ramp, because the party
entering fight nine is not the party that entered fight one.

### Two rules every board obeys

- ⚠️ **No board pairs a taunt with a healer.** Sustain the party cannot aim at is the ninety-second
  clock wearing a boss's stat block — the failure milestone 15c found on the Dwarf Tower roof. It
  bites harder here than anywhere: a timeout costs a life, and a run has two.
- ⚠️ **No board fields two `ascended` blocks.** One anchor is the top band in a tower and this mode
  fights with a wounded party.

The three floor-3 guardians are anchored by the Gate Warden, the Barrow Sovereign and the Wyrdroot
Ancient. ⚠️ **None of them is a chapter final, a chapter lieutenant, a tower roof or the Unmade** —
every chapter ends on a boss fielded nowhere else, which is a rule `chapters.ts` states, and the
Unmade is the ceiling `enemies.spec.ts` holds every later block under.

---

## What a run pays

| Event               | Pays                                                     |
| ------------------- | -------------------------------------------------------- |
| Every cleared fight | 120 crystals (×2 on a guardian, ×5 on the last fight)    |
| Every cleared fight | ×5 gold, ×5 xp, ×15 essence of the matched campaign lump |
| Every cleared fight | Gear, rolled at the matched campaign stage's grades      |
| Finishing the run   | 1,200 crystals and 50 emblems                            |

A clean run is 3,000 crystals — thirty pulls. ⚠️ **Sized against a day of idle income rather than
against nine fights.** A fully cleared ladder earns twenty to seventy-five pulls a day idly, so this
is a supplement of roughly the same order; against the near-nothing a run stuck at a wall earns, it
is most of what they get, which is the same asymmetry quests are built on.

⚠️ **Flat, and it must stay flat.** [`core/bounties.ts`](../src/core/bounties.ts) states the rule this
obeys: the crystal rate is linear in the clear count precisely so it cannot outrun a flat
`PULL_COST`, and a _multiple of that rate_ on a repeatable timer is the compounding it exists to
prevent. A daily mode is the most repeatable timer in the game.

### The lump is a duration, and essence is the exception

A cleared fight pays a multiple of the campaign lump at the stage fighting at the same enemy level —
the idiom `resolveFloor` already uses, so retuning the campaign's reward curve carries the Descent
with it and there is no Descent-side number left to go stale.

⚠️ **Essence is three times the other two, which is the one place this mode breaks "scale all three
together or none".** That rule protects `baseRates`, where a common factor cancels out of every ratio
`levels.spec.ts` measures — and this moves no rate at all. Essence is the currency a run is genuinely
bottlenecked on late, so it is the one worth paying here: a finished run earns roughly ninety minutes
of its own essence income, and half an hour of gold and xp.

### ⚠️ Emblems on completion only

Emblems already have two faucets — an idle rate that steps per chapter and a drop chance on a clear —
and [economy](economy.md) records that the intuitive reading of which is larger is backwards. A third
_per-fight_ source would be a third mechanism on the tightest currency in the game with nothing on
screen to say which one paid. Fifty a day against the ~500 a fully cleared run already earns is a
bonus, not a bypass.

---

## The three fields it may never touch

⚠️ `clearedStages`, the ladder position, and any idle rate. The same fence `core/towers.ts` stands
behind, and for the same arithmetic: the clear count drives the idle crystal rate, and
`banners.spec.ts` bounds a fully cleared campaign at about ×3 the base. A daily nine-fight mode
feeding that counter would raise a rate every day forever, which is the one shape of compounding this
economy has no answer to.

`applyDescentResult` is a **separate function** from `applyBattleResult` rather than a branch inside
it — not for tidiness, but so those three fields are out of reach rather than merely unwritten.

---

## Auto-battle does not run here

⚠️ **The mode's premise rather than a limitation.** Auto-battle is a repeat loop, and a Descent fight
cannot be repeated without a card being chosen first — so the loop would win one fight and stop,
reporting "there is nothing left to fight" about a run that is eight fights from over. A control that
always does one thing and then lies is worse than no control.

---

## `descentRuns` is the only mark a run leaves

⚠️ **It is the first counter in this save added partly because a track is paid against it**, which
[`core/achievements.ts`](../src/core/achievements.ts) warns about. What keeps it honest: a run stores
nothing else that survives its own day — the run in flight is wiped at 04:00 — so without it the mode
has no long-term record at all, and its own screen is the first thing that prints it. That is the same
standing `pullCount` has, which is documented as display-only and is an achievement counter besides.

Two achievement tracks read it at two intervals — Delver every five runs, Deep Delver every thirty —
rather than a second stored integer for "fights won". One counter says the same two things a second
field would have: a rhythm for the habit, and a milestone for the month it takes to reach.

⚠️ **It is also a legal _quest_ counter**, unlike `clearedStages` and unlike `signatureLevels`. The
test is not "is it monotonic" — `clearedStages` is monotonic — but "can a player always make it move
today". The Descent is offered afresh every day forever.

---

## What the balance sweep measures

`data/descent.balance.ts`, and it measures a **whole run over several days at several campaign
depths** rather than one stage against one party. There is no authored stage to sweep: the pool is
drawn from, the level is read off progress, and the party changes shape as it goes.

### ⚠️ The reference party is bisected, never solved

Two closed forms were tried and both were wrong, in opposite directions:

- **"The highest rung whose cap sits below the anchor"** is what the campaign's margin rule implies,
  and it lags badly through the early chapters where a party stands _above_ the rung its content asks
  for.
- **Power parity on `perLevel.common`** is right in shape and wrong in size, because enemy blocks
  climb `perLevel.legendary` and `perLevel.ascended` and that gap compounds over the whole level
  rather than over a chapter.

So the party is bisected against the real campaign stage it anchors on, at the level that clears it
90% of the time. Milestone 21b recorded the same finding about the campaign's own margin rule and
reached the same conclusion: **bisect; do not solve.**

⚠️ **The party carries no gear and no signature items**, where a real player at these depths carries
both — so every figure below is a **floor** on the real experience rather than an estimate of it.

### What it reads, over twenty days at each of five depths

| Clears | Finish rate | Fights cleared | Survivors | Longest fight | Timeouts |
| ------ | ----------- | -------------- | --------- | ------------- | -------- |
| 60     | 0.50        | 7.85           | 3.20      | 35.2s         | 0        |
| 100    | 1.00        | 9.00           | 4.55      | 48.7s         | 0        |
| 150    | 0.60        | 8.20           | 3.55      | 54.1s         | 0        |
| 250    | 1.00        | 9.00           | 4.65      | 61.0s         | 0        |
| 400    | 1.00        | 9.00           | 4.05      | 67.6s         | 0        |

⚠️ **The per-depth finish-rate floor is deliberately below the worst reading and the mean is what
carries the claim.** The bisection that calibrates a party lands on a step, so a single depth can sit
a level either side of where a real player stands, and a tight per-depth bar would be measuring that
step rather than the mode.

The longest fight anywhere is 67.6 seconds against a ninety-second timer — ×1.33 headroom — and
nothing times out at any depth. That is the load-bearing assertion in the file, and the mode pushes on
it from two sides: a party carrying eight fights of damage kills more slowly, and Bloodthirst siphons
damage the closing pressure is amplifying.

---

## Where it sits on screen

`/descent`, linked from a card on **Home** — the battle hub, so anything a player goes to _fight_ is
a card there rather than a Town errand. It is a route and not a mode, unlike the battle screen,
because a run in flight is entirely saved state: the floor map, the carried damage and the hand of
cards all survive a reload.

⚠️ **The Fight control lives on the Descent screen rather than on the crew editor**, which is the one
place the mode departs from "every battle passes through the crew editor". A run in progress has to
come back _here_ between fights, and routing it through the editor every time would ask the player to
re-confirm a crew that is locked for the rest of the run and cannot be changed. The crew is still
edited by the one editor, at `/formations/descent`.

Six states, and every one names the next thing to do — the same rule Home's locked tower row is spent
on: `locked` names the chapters still owed, `available` names today's factions, `choosing` is the
offer, `ready` is the fight, `complete` and `ended` say when the way opens again.

⚠️ **Home's card is only a link in the five states that are not `locked`.** It was a link in all six
until the locked screen was read as a player first meets it. That branch is two paragraphs — what
the mode is, and the chapters still owed — and the second is the card's own line again. Today's
lock, the boards and the party all sit in the `@default` branch, so there is nothing behind the
locked card but the sentence the player has already read and no control to press. The card is the
tower row's inert grey while locked.
