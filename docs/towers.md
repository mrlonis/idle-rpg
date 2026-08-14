# Faction towers

Seven towers, one per faction, **three hundred floors each at enemy levels 1 to 142**. The system
shipped in milestone 15b with a single tower, the other six in 15c, and the second hundred floors
across 21e–21k. Read [`core/towers.ts`](../src/core/towers.ts) before touching them;
[authoring](authoring.md) is the procedure for adding floors.

⚠️ **The third hundred is in flight — Human, Dwarf, Elf, Undead and Monster have theirs; Angel and
Demon are still on two hundred.** `TOWER_RULES` is one rule for all seven, so the height moved to 300
in a single session while the floors arrive one tower at a time — exactly as the second hundred did.
A tower that has not been extended yet is on the `PENDING` list in
[`towers.spec.ts`](../src/data/towers.spec.ts) and
[`towers.balance.ts`](../src/data/towers.balance.ts), still authors 200 floors, and **has no boss
until its own hundred lands**: `floorKindAt` reads the rules' height, so its floor 200 resolves as a
mini-boss paying ×2 rather than ×5. That is licensed by one argument and one only — **no build
carrying this has ever reached a player.**

Adding a tower is a row in [`data/towers.ts`](../src/data/towers.ts), a matching row in
[`data/activities.ts`](../src/data/activities.ts), two achievement tracks, and its floors.
`data/towers.spec.ts` makes a missing one a failing test rather than a tower with no way in, and
holds **exactly one tower per faction** against `FACTIONS` rather than against a literal.

## What a tower is for

**Not more difficulty — more roster.** The campaign has never asked for more than five characters,
against a fifty-six character bench fed by a gacha generous enough to produce roughly 190 pulls a
day at post-ladder crystal rates. Seven towers of five, each locked to one faction, is demand for
**thirty-five invested characters**, so an unlucky pull becomes the answer to a tower instead of
fodder.

Two consequences follow and both are load-bearing:

- **A tower is a wall about who you own, in a game with no way to buy characters.** That is the
  failure mode role-locked formation slots were rejected for — see [rejected](rejected.md). Towers
  must be skippable, never on the critical path, and never the only source of anything.
- **What towers demand is per-faction depth, not roster size.** `data/characters.spec.ts` asserts
  every faction can field a mono-faction party and reads `PARTY_SIZE` off `core/`, so a formation
  that grew to six would fail that test rather than quietly leaving six towers uncrewable. **Two
  spare per faction is the entire margin.**

**Resonance is a hard prerequisite and it already shipped.** Nobody levels thirty-five characters
from scratch; [level resonance](level-resonance.md) carries the whole roster to the fifth-highest
level. What towers still cost is **ascension**, which resonance deliberately does not cover — so
crewing a tower is a real investment decision rather than a levelling grind. ⚠️ **If towers ever
feel free, the rarity-cap clause in level resonance is what has stopped working.**

## ⚠️ The three things a tower clear may never touch

**`clearedStages`, the ladder position, and any idle rate.** The clear count drives the idle crystal
rate, and the shipped four hundred and fifty stages already take it to ×5.5 the base — seven towers of
three hundred floors feeding it would reach ×24, and the roster-relative ceiling in `banners.spec.ts`
would put the whole roster inside three weeks.

Progress is **one integer per tower** in `GameState.towers`, and `applyTowerResult` is a separate
function from `applyBattleResult` rather than a branch inside it, precisely so the campaign fields
are not in reach.

## A floor is climbed once

`nextFloor` returns `null` at the top rather than clamping, which is the whole difference from the
campaign — whose position stops climbing so its last stage stays farmable. Clamping would let a
player re-clear the top floor and be paid again.

⚠️ **That `null` propagates all the way to the controls.** `BattleService.nextFight` returns `null`
for a topped tower **and** for one the campaign has not opened, and both the Go Again button and the
crew editor's Fight control are inert on it. A control that only asked whether the _crew_ was legal
would look live and silently do nothing.

## The level line

⚠️ **A floor's level is derived, never authored.** `data/` authors who stands on each floor;
`floorLevel` draws the straight line from `baseLevel` to `topLevel`. Typing a hundred levels that
must follow a formula is the retyping [testing](testing.md) forbids.

⚠️ **A tower closes _above_ the cap of the rung it asks for** — the campaign's own margin rule — and
`topLevel` being a rarity cap is the opposite of what makes a roof a fight. A rung is worth ×1.6 and
**the enemy side has no rungs at all**, so a crew at parity with the content is only a fair test at
the first rung above `rare`. The roof is **142 against an `elite-plus` crew capped at 140**.

Milestone 21e measured what happens without the margin: at `elite-plus` (three rungs, ×4.096) a
level-140 five takes **the heaviest board this game can author** — five `ascended` blocks with an
Unmade in front — at 100% with all five alive in nine seconds, and no line-up fixes it.

| Crew         | Rungs | The heaviest authorable board at the crew's own level |
| ------------ | ----- | ----------------------------------------------------- |
| `rare-plus`  | 1     | 0% — the crew loses                                   |
| `elite`      | 2     | 100%, 4.30 survivors                                  |
| `elite-plus` | 3     | 100%, 5.00 survivors, 9s                              |

### ⚠️ Extending a tower: solve for where the new slope meets the old one

`floorLevel` draws **one line from floor 1**, so raising `floors` re-draws it underneath content that
already shipped. Solving for the top level at which the new slope meets the old one is what makes the
expected retune disappear, and it has now worked twice:

| Extension | Floors    | topLevel | New slope | Old slope | Shipped floors that move |
| --------- | --------- | -------- | --------- | --------- | ------------------------ |
| 21e       | 100 → 200 | 60 → 120 | 0.5980    | 0.5960    | 10 of 700, by 1 level    |
| this one  | 200 → 300 | 95 → 142 | 0.4716    | 0.4724    | 17 of 200, by 1 level    |

**142 is where the two slopes meet**: 299 ≈ 1.5025 × 199 and 141 = 1.5 × 94.

⚠️ **The neighbours are much worse and the penalty is not smooth**, so solve rather than eyeball —
141 moves 84 floors and 143 moves 50, against 142's 17. ⚠️ **A round _slope_ is the trap**: exactly
0.50 levels a floor wants a roof of 150, which moves 172 of the 200 shipped floors by up to 5 levels
**and** lands its lump exactly on the campaign's stage-300 payout, failing the one bound that may
never be crossed. The highest roof that clears it at 300 floors is 149.

⚠️ **Making `floorLevel` piecewise would preserve every shipped floor exactly**, and it has been
declined twice — it is a `core/` change and a content session may not take one. It stays the right
answer if a future extension cannot be solved this way; record it as a finding rather than reaching
for it.

21e's roadmap prescribed 140 and a retune of all seven hundred shipped floors, and both halves
measured wrong: it would have put **46 of those 700 floors under the 90% bar** and taken six of seven
roofs from 100% to 0%. **Check the roof is a fight second; do not start from the roof.**

⚠️ **If the height moves in one session and the floors move in seven, use a self-deleting
checklist.** `PENDING` was a literal list of tower names in both `towers.spec.ts` and
`towers.balance.ts`; each session deleted its own and the last deleted both lists along with the
branches they guarded. A filter — "either the full height or half of it" — would pass forever and
never notice a tower nobody went back for.

A tower on that list was **not damaged**: `clearedFloors` clamps to what it authors, so `nextFloor`
reported it topped and every screen read it right. What it lost while it waited was its **boss** —
`floorKindAt` reads the rules' height, so its hundredth floor resolved as a mini-boss paying ×2
rather than ×5.

## What a floor pays

A lump, gear, and flat crystals — **and no idle rate.** The campaign stays the income spine; a tower
is the roster sink.

**The lump and the gear grades are matched by _enemy level_, not by floor number.** Floor 100 is
level 60 where campaign stage 100 is level 85, so index-matching would pay the top of the ladder for
a fight two thirds as hard. `matchedStageIndex` scans the resolved campaign ladder, so retuning the
campaign carries every tower with it and no tower-side number can go stale.

⚠️ **It does not follow that a floor always pays less than the stage of the same number.** The
campaign's level curve is nearly flat through chapter 1's tail where the tower's is linear, so floor
26 (level 16) matches stage 36 and is paid more. That is correct: it is the harder fight.

Crystals are **100 a floor** (×2 mini-boss, ×5 roof), **500 per five floors**, and **10,000 per
hundred floors** — see [achievements](achievements.md) for why the per-floor figure is deliberately
not the campaign's 250. `Spire Conqueror` stays `every: 100`, so a three-hundred-floor tower pays it
three times; the tie it holds with a chapter's completion award is stated **per hundred floors**.

### ⚠️ The tower:campaign crystal ratio was asserted and has been retired

It read `sum(crystalsPerTower) / campaignCrystals` against a floor of 1.3 and a ceiling of 4. **The
floor is what killed it**: that quantity falls by construction every time a chapter ships and rises in
one step every time the towers grow, so it had been moved 2 → 1.5 → 1.3 → 1.1 → 0.7 → 1.3 across five
sessions and spent six of them parked at a placeholder watching nothing. The third hundred takes it
from 1.40 to **2.09**, which would have been a sixth slide. Retiring it is the call recorded in
[authoring](authoring.md) for three earlier guards, on the test that applies here: **when the honest
restatement of a guard is a number you would refuse to author, the guard is pointed at the wrong
quantity.**

⚠️ **The stable ceiling went with it, and what that gives up is real.** Nothing now fails if a future
session ships an eighth ladder or a fourth hundred and the towers quietly become the run's main
crystal income. The question both halves were asking — _is seven towers still the right amount of
optional content beside the campaign of the day_ — is a design question a threshold was never going
to answer. **Recompute both totals when extending either side**; the arithmetic is a dozen lines and
nothing does it for you now. At three hundred floors: seven towers pay **653,100** (233,100 from
floors, 420,000 from tracks) against an eleven-chapter campaign's **312,500**.

## The lock, and when towers open

**A tower is faction-locked, and the lock lives in [`core/activity.ts`](../src/core/activity.ts).**
`partyMeetsLock` is called by the editor **and** by the battle path — two implementations of one
rule is how a screen promises a legal crew that the fight then refuses.

**All seven open when chapter 1 falls** — ten clears, the auto-battle unlock, together. Which tower
a run enters is settled by who it owns, not by where the ladder has carried it, so staggering the
unlocks would gate a player holding five Elves behind clears that have nothing to do with them.
`towers.spec.ts` bounds the unlock under a fifth of the shipped ladder **and holds the agreement
with the auto-battle unlock** — each tower authors its own `unlockClears`, so the spec is what stops
the two silently splitting apart.

## The lean, and the mirror control

**Each tower leans toward the faction that counters the one it admits, and no two leans repeat.**
Human←undead, dwarf←human, elf←dwarf, undead←elf, angel←demon, demon←angel — the mortal cycle where
it applies and the celestial pairing where it does not. The lean holds 35–65% of every board, which
`towers.spec.ts` asserts.

The point is that **the matchup matrix stays live inside a tower** rather than resolving to a mirror
match, which would switch it off entirely.

⚠️ **The Monster Tower has no lean and that _is_ its lean.** Every faction counters Monsters — four
mortals at ×1.05, both celestials at ×1.10, and Monsters themselves at ×1.10 — so "field what
counters the crew" resolves to all seven and it ships as an even spread. `towers.spec.ts` derives
that case off the matrix (`countersOf(faction).length === FACTIONS.length - 1`) rather than naming
`monster`, bounds the spread on both sides instead of asserting a leader, and separately holds that
no two towers that _do_ lean lean on the same faction. Seven towers leaning on Monsters would be one
tower shipped seven times.

### ⚠️ The mirror control is valid for only four of the seven

`towers.balance.ts` rewrites every enemy to the tower's own faction, on the premise that a
mono-faction board is matchup-neutral. That premise fails twice, and **both exceptions are asserted
rather than skipped** — a skip would leave the only interesting property of those towers untested.

- **Celestials.** An Angel deals ×1.10 to every mortal with nothing coming back, so an all-Angel
  board is the **hardest** thing an Angel five can meet: `biased > mirrored` is not merely false
  there, it cannot be true. The spec asserts the **inversion**, so a future matrix edit removing the
  celestial advantage fails loudly.
- **Monsters.** `monster → monster` is the matrix's one self-edge, so mirroring that tower turns the
  matrix **up** rather than off and is not a control at all. Its exclusion is made load-bearing by
  asserting the self-edge exists.

### How the bias was measured, and two ways that failed

- ⚠️ **Comparing against another faction's five measures two things at once.** Sweeping the same
  floors with an Undead five at the same investment came out slower on every floor — because the
  Undead five available at that investment is simply a weaker party.
- ⚠️ **Fight length is the wrong metric.** The matrix cuts both ways: the crew takes 5% more from the
  Undead half of the tower _and_ deals 5% more to the Monsters and Dwarves anchoring its front ranks.
  Measured in seconds the biased tower is marginally **faster** than a neutral one (780s against
  785s), so an assertion in those terms would read as the bias making the tower easier.
- **What works is the mirror, measured in party members lost.** The bias costs about 5% more of the
  party over a full climb — small in aggregate because 95 of 100 floors were never in doubt, and on
  the one floor that _is_, the alternate five goes from 90% on the mirror to 85% on the real thing.
  **The matrix decides fights at a party's ceiling and nothing else.**

## Difficulty is the front rank's weight, and it is sharply non-linear

Two ascended blocks in front of three legendaries is the top band; pairing the two _heaviest_ (an
Unmade beside a Tyrant) takes a reference crew from a clean clear to single-digit win rates.

⚠️ **15c re-measured this against six more crews and the tolerance is narrower than it looked.** The
same medium-plus-heavy pair the Human roof clears at 90% is unwinnable for the Dwarf five, which
carries the lowest `atk` in the game, and for the Angel five, which is four supports and a wall:

- `Oathbreaker + Colossus` — the Human Tower's roof, cleared at 90% — is **0%** for Dwarves.
- `Tyrant + Oathbreaker` is **33%** for Monsters, who have no healer and no faction they are
  favoured against inside their own tower.
- `Unmade + Hierophant` is **3%** for Angels.

**So anchors are sized per tower against its own crew, never to a shared weight.** Re-run
`npm run test:balance` after touching any band in the top third.

⚠️ **A healer on a roof is a timeout wearing a boss's stat block.** The Dwarf Tower's boss was
`Oathbreaker + Warden` behind a Marsh Acolyte and no Dwarf five could close it inside ninety seconds
— while an identical board ten floors lower, at six fewer enemy levels, cleared cleanly. Against a
party that cannot burst, the last floor is where sustain stops being a lock and becomes the clock.
The roof dropped the Acolyte; the mini-bosses below it kept theirs.

## The three crews, and which one binds

The balance target is **one crew per hundred floors, rungs pinned in `data/towers.ts` and every level
derived rather than chosen**:

| Band | Floors  | Rung         | Level | Against top floor | Power ratio |
| ---- | ------- | ------------ | ----- | ----------------- | ----------- |
| 1    | 1–100   | `rare-plus`  | 48    | level 48          | ×1.600      |
| 2    | 101–200 | `elite`      | 75    | level 95          | ×1.689      |
| 3    | 201–300 | `elite-plus` | 99    | level 142         | ×1.676      |

⚠️ **The rungs are pinned and only the levels derive, and that is a correction.** They used to come
off the caps ladder, which tied each crew's **rung** to its level — so when the campaign flattened and
`topLevel` came down with it, both crews lost a whole rung (×1.6) where the content only lost its
levels and **all seven roofs measured 0%**.

⚠️ **Band 1 stands at parity with its own top floor and the bands above it do not.** Band 1's crew is
one rung over `rare` — the first rung at which a party is a fair test at all — so it has no rung to
pay back. Every band above owes `ROOF_MARGIN` (20) once, **plus 23 levels for each further rung**,
because `ln(1.6) / ln(1.021)` is 22.6. The margins run 0, 20, 43.

⚠️ **Reusing the margin unchanged on a new band is a walkover, and it is not a small one.** Measured
against band 2's ×1.689 at a level-142 roof:

| Band 3 crew                   | Ratio      |
| ----------------------------- | ---------- |
| `elite-plus`, margin 20 → 122 | **×2.703** |
| `elite-plus`, margin 43 → 99  | ×1.676     |
| `elite`, margin 42 → 100      | ×1.072     |

The failure is **invisible in the output** — every floor reads 100% with five alive, which is also
what a correctly tuned low band reads — so confirm the ratio before concluding anything about boards.

⚠️ **`elite-plus` hands over no new skill.** `KIT_RULES.unlocks` is `elite` / `legendary` /
`ascended`, so band 3's crew is band 2's kit at ×1.6 and twenty-four more levels. The next kit step is
`legendary`, which caps at 200 and is a fourth hundred's business.

**No gear on any of them** — a player crewing seven towers has one bag to equip thirty-five
characters from, so tuning against a fully geared five would tune for a party nobody with seven crews
can field.

⚠️ **A single upgraded crew would stop the sweep saying anything about the low bands**, on fourteen
hundred floors that are already shipped. A band-2 crew walks over floor 40.

**A 100% win rate the whole way is the intended shape, not a miss.** A floor is climbed once and
there is no way around one, so a floor the crew cannot pass stops the tower outright — which makes
win rate the wrong dial and **cost** the right one. The crew clears everything, loses nobody below
floor 185, and takes the roof in twenty seconds with 3.4 of five alive.

### ⚠️ Which of the two arrangements binds is a per-tower and even a per-board answer

With both crews at parity with the content this never arose. In band 2 they come apart:

- **Human and Elf Towers** — the **alternate** five is the whole constraint. The pairs measure
  twelve and **nine** levels apart; the Elf roof board reads 100% for the alternate at level 118,
  83% at 120 and 2% at 126 while the reference five is still at 100% at 126. Every board that costs
  the reference crew a second member takes the alternate below its own 75% bar.
- **Undead Tower** — the pair **swaps places by mechanic**, and band 3 gave a third answer again. In
  band 1 the alternate is far the stronger (floor 100 costs it 1.6 of five against the reference
  crew's 3.0); on a `dodge` board at the roof's level it is far the weaker (65% against 95%), because
  that arrangement's kit is three single-target drains. In band 3 the **reference** five is the
  weaker on nineteen of twenty measured shapes — the alternate sits at exactly 4.00 on most of them —
  **except** under weight and rate together, which is the one place it drops below (1.75 against
  2.00) and therefore the only place the closing bands could be sized against it.
- **Monster Tower** — the **reference** five is much the stronger, and band 3 turns that from a note
  into the whole constraint: at the third hundred's roof level the shipped floor-200 board reads
  100% / 3.45 for the reference against **8% with 0.07 survivors** for the alternate. Every board in
  that hundred is sized against the alternate, and the shipped roof closes at 100% / 2.85 against
  100% / 1.75.
- **Angel Tower** — the two fail on **opposite axes**: weight breaks the reference five, length
  breaks the alternate.

**Check both arrangements on every candidate board.** "Size it against the alternate first" is true
of two towers and is not a rule.

### ⚠️ The bottom of a band 2 is not a fight — but how little composition buys there is a fact about the crew

Band 2's crew stands at level 100 while the band **opens at 61** — a 39-level deficit worth ×2.24 of
party power — so the level line has not caught up and the escalation belongs in the last thirty
floors either way.

But the size of the effect does not transfer. At the Elf Tower's floor 101 the lightest authorable
board resolves in 2.6 seconds and the heaviest in **2.9** — three tenths of a second across the
whole range. Against the Undead pair the same measurement reads **2.7s and 8.4s**, a threefold span.
21g concluded "composition buys nothing down here" from an Elf five, which is the fastest party in
the game. **Measure it on the tower's own crew**, and author the opening bands for rhythm regardless.

## Seven towers, seven escalations

⚠️ **How a second hundred escalates is a per-tower answer. Read the crew's failure mode before
choosing; do not copy the last session's shape.**

- **Human, second hundred** — thins its anchors and thickens the board's **support** (links,
  shields, a taunt), the inverse of the first hundred's climax. The alternate clears two-anchor
  boards to about level 108 and falls off a cliff by 117.
- **Human, third hundred** — the first where the answer was **the stat block and nothing else**, and
  the negative results are the finding. Ten statuses one at a time span **0.14 survivors in total**
  (2.88–3.02 against a 2.95 control); question _count_ is worth nothing (2.90 → 2.92 → 2.92 across
  one, two and four); aim is inert or **negative** (`enemy-front` 2.98 against `enemy-back` 3.90);
  and the second hundred's own support axis is spent (taunt 4.78, link 4.83, shield 4.75 against a
  4.92 control, the alternate flat at 4.00 for all four). What moves is **`haste` on a body that
  survives to use it**: at `haste` 144 a 420-hp body leaves the alternate at 3.77 and an 1120-hp body
  at **1.07**. ⚠️ **The exact inverse of the Angel Tower's rule**, and the shipped register encodes
  the Angel version — **every one of the 140 blocks above `haste` 125 is thin**, the heaviest being
  the Nightmarch Outrider at 760 hp. So that hundred is where speed stops costing softness, and its
  four blocks are the only ones in the game that break the pairing. Crit is the second dial and
  arrives a band late; the two at once are past the edge.
  - ⚠️ **It also found a shipped doc claim to be wrong.** `NIGHT_RIDE` reaches for `enemy-back` on
    the argument that it is the row the party's healing lives in. Measured at the band it ships in
    with the chassis held constant, `enemy-back` reads 4.83 / 4.00 where `enemy-front` reads
    4.00 / 3.88 — **reaching past the front rank makes a Human board easier**, because the alternate
    fields no tank and damage taken off its front row is time it did not have to buy. The floors are
    fine; the reason written on them was not.
- **Dwarf, second hundred** — cannot do that. A Dwarf five out-lasts bulk and loses to the
  ninety-second clock, so it escalates in **front** and forbids a heal, a drain or a regeneration
  above floor 180. Measured at the top floor's level: one anchor plus a _bulky_ legendary reads
  90% / 45.7s and 63% for the alternate; the same weight as a _pressure_ legendary reads
  100% / 33.0s and 90%; a shield support in the back rank reads **28% / 0%**. ⚠️ **The back rank is a
  cliff rather than a dial** — moving one body of the same output from front to back takes the
  reference five from 100% to **10%**, because Dwarves carry the least reach in the game.
- **Dwarf, third hundred** — the first where the escalation had to come from **the board's
  composition rather than from any body on it**, because the anchors run out of room. See below.
- **Elf, second hundred** — can afford either (it takes the heaviest authorable board in eleven
  seconds against a ninety-second timer) but neither _threatens_ it: a shield support in the back rank
  leaves the weaker arrangement at 100% with 4.25 alive, while two anchors take it to 43%. It
  escalates through a **wall that hides a burster**, because what an Elf five is short of is health
  rather than time.
- **Elf, third hundred** — the first where the axis is a **defensive gap in the crew's own stat
  block** rather than anything about the board's shape. See below.
- **Undead, second hundred** — the first that is **structural rather than a matter of weight**. At the roof's level,
  controlled at one anchor plus two legendaries and two commons: `dodge` reads 95% / **65%** where
  burst reads 100% / 95%, a healer 98% / 90%, and slow, link and reach all 100% / 100%. `dodge` is
  the only shape that fails a bar, because **no Undead character carries a point of `accuracy`** (it
  is on four Elves and one Human, and in no gear archetype or signature item) and every Undead body
  sustains on `drain` and `lifeLeech` — so a miss costs the hit _and_ the health it would have
  returned.
- **Undead, third hundred** — the first where the axis is **not a mechanic at all**, but how long the
  board takes to kill. The same sustain engine the second hundred attacked at the source, attacked
  instead by arithmetic. See below.
- **Monster, second hundred** — the first that is a **count** rather than a shape. Controlled at one anchor, one
  legendary and three commons at the roof's level, mean survivors of five: nothing 4.35 / 4.00, one
  lock repeated four times 4.13 / 3.92, three questions 4.00 / 2.70, **five questions 3.58 / 0.85**.
  Repeating a lock is worth almost nothing and the count is worth everything — a Monster five answers
  any single question by out-damaging it and has no second answer to spend on two more. The bands
  escalate two → three → four → five distinct questions. **Monsters are the only faction with no
  heal, no regeneration and no shield**, and no character carries `tenacity`, `accuracy` or `dodge`.
- **Monster, third hundred** — the first where the axis is a stat the crew **answered with the wrong
  stat**, and the first where the previous hundred's axis was exhausted by arithmetic rather than by
  measurement: five questions is the size of a board. See below.
- **Angel** — the first where the honest finding was that **no mechanic is available at all**.
  Twenty-two shapes measured against both arrangements at the roof's level — taunt, thorns, link,
  bomb, `SAVAGED`, `BLOODRISEN`, `dodge` 0.30, `tenacity` 0.60, a board stun, a board slow, a shield,
  `magicResist` 0.40, a healer, hex volume — and the **whole spread was 0.15 survivors of five**,
  every row between 3.92 and 4.00. An Angel five is `GUARD`, `BARRIER`, `AEGIS`, two or three heals
  and a cleanse, so the first question is free.
- **Demon** — the last, and about **scope** rather than a mechanic. See below.

### The Dwarf Tower's third hundred: the anchors run out of room

⚠️ **A heavy enemy block outgrows a mono-faction crew across a hundred floors, and this is the first
hundred where that decided the shape.** `perLevel.ascended` is 1.024 and `perLevel.legendary` 1.0225
against a mostly-`common` five's 1.021, so over the 47 levels the third hundred spans the anchors
gain about ×1.15 on the party. The shipped floor-200 board, fielded up its own level line against the
band-3 crew, reads 100% with all five alive at level 95, 100% / 4.97 at 125, and **28% with 0.47** at 142. **The previous hundred's climax is unwinnable at this one's roof**, so the new anchors are
_lighter_ than the ones they succeed — `THE_CROWN_WHEEL` is 1240/74 against `THE_BREACHLORD`'s
1300/78 — and the escalation comes out of the other four slots: one body a board that swings, then
two, then two behind a wall, then three, then nothing else at all.

⚠️ **This generalises to every third hundred and nobody should re-derive it.** Check the previous
hundred's roof board at the new roof's level **before** authoring anything; if it has fallen through
the floor, the band is a composition problem rather than an anchor problem.

What a Dwarf five actually answers to, one anchor plus four bodies at the roof's level, forty seeds:

| Four bodies at        | reference | alternate |
| --------------------- | --------- | --------- |
| `atk` 72, `haste` 98  | 4.00      | 4.00      |
| `atk` 86, `haste` 98  | 4.00      | 3.25      |
| `atk` 72, `haste` 126 | 4.00      | 3.05      |
| `atk` 86, `haste` 126 | **2.88**  | **1.77**  |

**Weight and rate are a product rather than two dials**, which is what makes the third hundred
distinct from the second — that one escalated them separately.

⚠️ **Spread damage makes a Dwarf board _easier_, which inverts the Demon Tower exactly.** Against a
4.38 / 4.00 control: `enemy-row-back` 5.00 / 4.28, `enemy-back` 5.00 / 4.17, `enemy-highest`
5.00 / 4.25, `enemy-all` 4.95 / 4.00, `enemy-lowest` 4.92 / 4.00 — every scope and every aim at or
_above_ saying nothing. A Dwarf five heals, shields and guards `ally-all`, so spreading damage is
feeding the one thing it is built to do. Riders are inert too (a 50% stun 4.13 / 4.00, a poison
4.08 / 4.00, a bomb 4.08 / 4.00).

⚠️ **Two gaps that look like locks and are worth a tenth each.** No Dwarf character carries a point
of `insight`, so `tenacity` cannot be bought past — and at 0.40 / 0.60 / 0.85 it reads
3.45 / 3.23 / 3.08. Not one Dwarf in either swept arrangement carries any `magicResist` while four of
five carry 0.08–0.12 `physicalResist`, the highest mean in the game — and four magical bodies read
3.40 against a physical board's 3.88. ⚠️ **`insight` is absent from _every_ faction's roster** (two
Monster characters aside), so tenacity is not this tower's lock any more than `dodge` was the Monster
Tower's — the same "unanswerable is not the same as ours" test that shelved that one.

⚠️ **`attackSpeed` is `haste` under another name and the measurement is worth not repeating.** It is
the one `StatBlockData` field no shipped block uses, which makes it look like free novelty. `atk` 72
with `attackSpeed` 45 reads 3.77 / 2.63 against `haste` 143's 3.48 / 2.35, and `effectiveSpeed` adds
the two before applying the `slow` multiplier — so it is not even proof against the slow both Dwarf
arrangements carry.

**What is worth something beside the swing is a taunt on the body that is itself the durability** —
3.98 / **3.02** at hp 1400 / def 45, the Sealward Custodian inversion. It arrives a band after the
swing and never stands on the roof: with it on the last board the alternate reads **15%** against its
own 75% bar, and 95% without it.

### The Elf Tower's third hundred: the crew's own missing stat

⚠️ **The Splintering Yards escalate through being crit at, and the negative results are most of the
finding.** Controlled at one anchor plus four identical bodies at the roof's level, forty seeds:

| Four bodies at               | reference | alternate      |
| ---------------------------- | --------- | -------------- |
| plain front-hitter (control) | 3.25      | 2.25 · 93%     |
| `critChance` 0.18 / amp 1.00 | 3.20      | 1.73 · **80%** |
| `critChance` 0.22 / amp 1.00 | 3.00      | 1.07 · **57%** |
| `critChance` 0.26 / amp 1.10 | 2.92      | 0.72 · **48%** |

⚠️ **Every other shape measured was inert or a cliff, and none is worth re-measuring.** `enemy-all`
reads 98 / 90 / 75% across one, two and three voices and then **0%** at four — a trap rather than a
dial, and the reason no board in that hundred carries four wide voices. `enemy-row-front` is flat at
every count from zero to four. Reach (`enemy-back`, 98%) and `enemy-highest` (100%) leave a board
**easier** than saying nothing, which is the Human Tower's `NIGHT_RIDE` correction arriving on a
second tower. A link takes the weaker five from 2.08 survivors to **4.97**.

⚠️ **It is this tower's lock rather than merely an unanswerable one**, which is the test that shelved
`dodge` on the Monster Tower. Both swept Elf arrangements carry **zero `critDamageResist` and zero
`critBlock`** — the only crew in the game with neither, against the Dwarf five's 0.23 of block and the
Angel five's 0.76 of resist — on the lowest mean HP in the game at 461. And the tower's own second
hundred already made crit its conversation in the mirror direction: the Edgeturn Warden holds the
game's highest `critBlock` for the sole purpose of refusing an Elf five's crits, so the third hundred
is the works turning that around.

⚠️ **The register was checked before the band was built on it**, and this is the case that shows the
check can also come back positive. The shipped ceilings are `critChance` 0.18 (Headsman) and
`critDamageAmp` 1.00 (Golem); every legendary in the hundred sits at or under both, and only the roof
steps past — exactly as the Wardwright set the game's `accuracy` ceiling one hundred below. Contrast
the rejected Demon magic ward, which was worth 0.00 at its own shipped register.

#### ⚠️ Two opposite anchor mistakes, both made in the first draft

The floor-200 board fielded up its own level line against the band-3 crew reads 100% with all five
alive at level 95, 100% / 4.90 at 125, and **35% with 0.70** at 142 — the Dwarf Tower's collapse
again, so `THE_EDGEWRIGHT` is lighter than `THE_WARDWRIGHT` (1300/84 against 1560/92).

- ⚠️ **Thinning the anchors out _entirely_ is the opposite error.** Boards of five legendaries with no
  anchor measured **flat** across floors 271–295: 4.00 reference survivors with the alternate at 4.38
  to 4.88, which is _easier_ than the boards below them. The Dwarf finding is that a third hundred's
  anchors get lighter, **not that they go away**. Restoring a mid-weight anchor was worth a full
  survivor (4.88 → 4.03 for the alternate at level 133).
- ⚠️ **The arithmetic also applies to the tower's _own_ existing heavy.** `THE_GRUDGEKEEPER` is
  1520/89 — heavier than the new roof — so a board carrying it above level 140 is harder than the roof
  itself, which measured floor 298 at 2.85 reference survivors against the roof's 3.42. The band drops
  it after floor 294 and nothing but the Edgewright anchors the last six floors. **Check the previous
  hundred's anchors against the new roof, not only the previous hundred's roof board.**

### The Undead Tower's third hundred: the board that will not die

⚠️ **The Seedfall escalates through enemy durability, and it is the only tower where that is a
lever at all.** Controlled at one anchor plus four identical bodies at the roof's level, forty seeds:

| Four bodies at   | reference | alternate |
| ---------------- | --------- | --------- |
| hp 700 (control) | 3.85      | 4.00      |
| hp 1000          | 3.00      | 4.00      |
| hp 1300          | 2.63      | 3.10      |
| hp 1600          | **2.00**  | 2.38      |
| hp 2000          | 2.00      | 1.07      |
| hp 2400          | 1.30      | **0.05**  |

**Zero timeouts anywhere on that grade**, which is the whole of what separates it from the clock —
the alternate's collapse at 2400 is a wipe, not a fight that ran out. Fights run 16s to 48s against
a 90-second timer.

⚠️ **The "is it ours" test comes back clean, and this is the case that shows what a positive answer
looks like.** At hp 1600 the same board costs the Undead reference five three members and the
alternate 2.62, while the **Elf** five takes it at 4.00 in twelve seconds and the **Dwarf** five at
4.00 in **thirty-four** — the Dwarves are in the fight just as long and lose nobody, so length alone
is not what is doing it. An Undead five is the only crew in the game whose sustain is entirely
`lifeLeech` off damage dealt (0.36–0.40 summed across five, against the Monster crews' 0.27 and the
Demon crews' 0.22) plus `recovery` on its own turn. What it takes scales with the length of a fight;
what it gets back is capped by the enemy's pool. **A board that will not die is a board that starves
it.**

⚠️ **`def` and `hp` are one dial and neither is special.** `def` 70 on a 700-hp body reads 3.00 at
21.6s; hp 1050 at `def` 20 reads 3.00 at 22.5s. The Dwarf Tower's "def is not a lever at these
levels" survives intact — what is a lever is the **pool**, whichever stat spells it. `physicalResist`
grades gently on top (0.10 / 0.20 / 0.30 → 3.55 / 3.33 / 3.13) and `magicResist` flattens after 0.14.

⚠️ **Almost every mechanic measured inert, and the list is the finding.** Against a 3.83 / 4.00
control: `enemy-lowest`, `enemy-back`, `enemy-highest` and `enemy-all` all read **4.00 / 4.00** —
_easier_ than saying nothing, the third tower to find that. A status one at a time is worth 0.10 to
0.63 of the reference five and **exactly zero** of the alternate, `SAVAGED` — the permanent wound
this crew has no cleanse for — worst of all at 3.73. Stun does not grade (0.35 → 3.27, 0.60 → 3.30).
Question _count_ is nearly flat (3.88 → 3.42 → 3.45 → 3.10 → 3.00 across zero to four), so the
Monster Tower's axis is not this one's. A link, thorns, a `tenacity` 0.60 wall and a `magicResist`
0.14 wall all sit inside a third of a survivor.

⚠️ **The second dial is tempo, and with weight it is a product rather than a sum.** Four bodies at
`haste` 126 read 2.98 / 3.77 and four at hp 1200 read 2.88 / 3.77; four at **both** read
2.00 / **1.75** — the one measurement in the set where the alternate is the weaker five. The
shipped bands spend one fast body carrying real `atk` per board and never two: two behind an anchor
at the roof's level reads **0%**.

⚠️ **A board-wide ward is worth a real 0.75 and is a clock at the top, which is both halves of the
shipped shield rule.** One back-rank body warding `ally-all` reads 3.00 (`BARRIER`) and 2.98
(`AEGIS`) against the 3.83 control — but the roof carrying one reads **75% / 55% at 45.1s mean and
56s worst**, and the roof carrying one behind the bulk anchor reads 25% / 13%. The same roof without
it reads 100% / 93%. So the Seedlight Keeper's last floor is 265, exactly as this tower's own first
hundred spends its heal in the Green Vigil and stops. ⚠️ **A _self_-shield is worth nothing at all**
(3.98): a pool priced against the wearer's own `atk` on a body the party is already killing.

⚠️ **The Crownworks collapse, a third time.** The shipped floor-200 board fielded up its own level
line against the band-3 crew reads 100% with all five alive at level 95, 100% / 5.00 at 120, and
**53% with 0.88** at 142 — so `THE_SEEDFATHER` is 1320/82 against `THE_SUNBOUGH`'s 1520/90 and
`THE_WITHERED_CROWN`'s 1740/98. And the tower's own anchors had to retire on the way up, the Elf
Tower's `THE_GRUDGEKEEPER` lesson arriving again: at level 142 on a light board the Withered Crown
reads **30% / 13%** and the Sunbough **13% / 10%**, both harder than the roof they precede. Their
last floors are 265 and 284; nothing but the Seedfather anchors 286 to 300.

### The Monster Tower's third hundred: armour the crew's penetration does not cut

⚠️ **The Closing escalates through `physicalResist`, and the three negative results are half the
finding.** Controlled at one anchor plus four identical bodies at the roof's level, forty seeds,
against a **4.00 / 3.35** control:

| Four bodies at                | reference          | alternate          |
| ----------------------------- | ------------------ | ------------------ |
| `tenacity` 0.40 / 0.60 / 0.85 | 4.00 / 4.00 / 4.00 | 3.48 / 3.52 / 3.50 |
| aim `enemy-back`              | 4.08               | 4.00               |
| aim `enemy-row-back`          | **4.42**           | 4.00               |
| aim `enemy-highest`           | 4.25               | 4.00               |
| `physicalResist` 0.23         | 4.00               | 3.00               |
| `physicalResist` 0.34         | 4.00               | 3.00               |
| `physicalResist` 0.45         | 3.80               | 2.88               |
| `physicalResist` 0.55         | 3.02               | 2.00               |
| `physicalResist` 0.70         | 2.02               | **0.00**           |

**Zero timeouts anywhere on that grade**, so it is difficulty rather than the clock. A `tenacity`
wall is worth **nothing at any value** — this crew's kits are almost pure damage, so there is nothing
to refuse — and every aim past the front rank leaves a board _easier_ than saying nothing, which is
now the fourth tower to find it.

⚠️ **The control that makes it a mechanism rather than a wall is the damage type.** The identical
block spelled `magicResist` 0.55 reads **4.00 / 3.42**: the control exactly, worth nothing. Every
damage effect in both swept arrangements is `physical` — eleven of eleven and twelve of twelve.

⚠️ **And this is why it is theirs.** Monsters carry the game's only real armour-cutting: mean
`physicalPierce` **0.145** against 0.040 or less for every other faction. In `core/battle/damage.ts`
pierce multiplies **`def`**, and `resistedShare` is applied afterwards with no pierce term in it — so
the one defence this crew is built to open is the one this hundred does not use. Measured: `def` 70
alone costs it 0.00 / 0.35, the wall at 0.40 alone 0.02 / 0.35, and **both together 1.00 / 1.22**.

⚠️ **The "is it ours" test, as a change on each crew's own control**, wall at 0.55, band-3
investment: monster-alt **−1.30**, monster-ref **−0.98**, undead-ref −1.00, dwarf-ref −0.42 (but
19.3s → 34.6s), demon-ref −0.17, elf-alt −0.15, angel-ref −0.03, **elf-ref 0.00**, human-ref 0.00.
The Elves are the _other_ 100%-physical roster and they barely notice, because they kill the wall
before it matters. It is the slow, high-`atk`, leech-sustained five a resist starves.

⚠️ **The one thing this band knowingly does that the Splintering Yards did not: it steps past the
register across the whole hundred.** The shipped `physicalResist` ceiling is the Golem's **0.23** and
that is a lone outlier — the next four blocks are 0.14, 0.12, 0.12, 0.12. The Closing runs its
legendaries at 0.20–0.34 and its roof at 0.40. The licence is the measurement rather than precedent:
at the shipped 0.23 the wall is already worth 0.35 of the alternate and a quarter again on fight
length, which is the opposite of the rejected Demon magic ward — that one was worth **0.00** at its
own register. **Record which side of that line a future band lands on before building it.**

⚠️ **The collapse lands on the _alternate_ here, which is the reverse of the other three.** The
shipped floor-200 board fielded up its own level line against the band-3 crew reads 100% with all
five alive at 95, 100% / 5.00 and 4.00 at 125, and 100% / 3.45 against **8% with 0.07** at 142. So
every board in the Closing is sized against the alternate.

⚠️ **No anchor had to be retired, and that is the first third hundred where the check came back
clean.** All twelve `ascended` blocks the second hundred fields above floor 160 read 100% for both
crews at level 142 behind light support — `THE_HORNCALLER` at 1560/91 is 100% / 4.00 and
100% / 3.15. What broke floor 200 up there is its _support_ rather than its anchor. **Run the check
anyway**: a clean answer is a result, not a reason to skip it.

The bands escalate by how many plated bodies stand on a board — one, two, three, then four with the
rate joining the wall — and the plate rotates across all seven factions rather than sitting on the
three blocks the session authored, which is what keeps the tower's flat spread flat: it closes at
demon 17.16% to dwarf 11.12% over 1,439 slots, against bounds of 5% and 25%.

### The Angel Tower: tempo and aim, not mechanics

| ×4 board                   | reference | alternate |
| -------------------------- | --------- | --------- |
| plain front-hitter         | 4.00      | 4.00      |
| names `enemy-lowest`       | 3.00      | **2.00**  |
| drains `enemy-lowest`      | 3.33      | 2.88      |
| reaches `enemy-back`       | 3.85      | 3.10      |
| `haste` 140 on a thin body | **2.67**  | **0.15**  |
| names `enemy-highest`      | 4.50      | 4.33      |

⚠️ **Every Angel heal names `ally-lowest`** — Choirlight, Soothing Verse, Vigil — and every shield is
behind a cooldown or an energy bar (Aegis at 80 ticks, Dawnward at 70, Sanctuary and Keeper's Charge
as ultimates). A board that arrives _before_ the ward and spends itself on the body the choir has
just committed to is racing the crew's own cooldowns rather than trying to out-weigh them. **Aiming
at `enemy-highest` makes a board easier**, because that is where the two tanks stand.

⚠️ **`haste` on a _durable_ body is worth almost nothing** (4.00 → 3.75 at 160). It is `haste` on a
**thin** one that is the strongest dial there is, so softness is the mechanic's price rather than a
discount on it. ⚠️ **Both dials at once is past the edge**: fast _and_ naming the lowest reads 0.00 /
0.00, so aim and speed arrive one band apart and the closing band carries no more than two bodies
above `haste` 126.

⚠️ **Denial is a cost there rather than an escalation.** A healer, slow, shield or resist wall leaves
both crews at 4.00 survivors and buys only seconds — four healers take the alternate 26.0s → 37.8s
against a 67.5s cleared-fight bar. Its bands therefore forbid a heal, a regeneration, a drain **and**
`lifeLeech` above floor 160. **A faction that cannot burst turns every second of enemy sustain into
the clock.**

### The Demon Tower: scope, not size

Controlled at one anchor plus four bodies all asking the same question at the roof's level, forty
seeds, against a **4.13 / 4.05** control:

| one body at a time                                              | reference | alternate |
| --------------------------------------------------------------- | --------- | --------- |
| stun · slow · weaken · sunder · poison · `SAVAGED` · `HEXBRAND` | 4.17–4.38 | 4.05–4.17 |
| a taunt                                                         | **4.78**  | **4.85**  |

| the same turn, aimed at all five | reference | alternate |
| -------------------------------- | --------- | --------- |
| wide damage alone                | 4.53      | 3.88      |
| wide damage + `SLOW`             | 4.03      | **2.88**  |
| wide damage + `STUN`             | **3.95**  | **1.85**  |

**Seven mechanics one body at a time, and every one leaves the board _easier_ than saying nothing.**
The reference five carries 9,416 to 12,822 hp a body at `elite`, so a question put to one of them is
a turn the other four do not have to answer. The bands escalate one voice → a voice with a rider →
the rider becoming the turn → two voices → three.

⚠️ **The status must ride the attack rather than cost a turn.** ⚠️ **And this is a fact about these
two crews, not a structural gap only Demons have**: the identical board reads 2.40 / 0.60 against the
Elf crews and 0.88 / 0.00 against the Monster crews. The control that makes it this tower's is the
Angel five, where it reads 4.00 / 3.95.

⚠️ **Weight is not available there at all.** The Unison beside a Hierophant reads 95% / 3.17 for the
reference five and **5%** for the alternate; beside a Colossus 70% / 0%. No board in that hundred
carries two `ascended` blocks.

## What the measurements settled, tower by tower

These are findings a later session should not have to re-derive.

- ⚠️ **A lock the crew cannot buy an answer to is licensed by _where it is put_, not by its size.**
  Evasion pools go on soft bodies — the Sunmote Dancer is 500 hp at `dodge: 0.3` — so reach and focus
  fire are the answer, the same case made for the Plumbline Hand's `accuracy` in the mirror
  direction. The heaviest body on that tower carries **less** evasion than the legendaries around it.
  And `dodge` is a chance floored by `MIN_HIT_CHANCE`, unlike `tenacity`, which refuses a debuff
  outright: it costs turns and never closes a door.
- ⚠️ **A lock being unanswerable is not the same as it being this tower's.** No Monster character
  carries `accuracy` either, so `dodge` reads 100% / 50% there too — the same structural gap the
  Undead Tower built a whole second hundred on. It was left on the shelf: **two towers with one lock
  is one tower shipped twice.**
- ⚠️ **A taunt on a soft body is a gift, not a door.** A common taunt was authored on the argument
  that a taunt narrows the pool _before_ the row rule is consulted, and measured taking the reference
  five from 4.42 survivors to **4.70**. A body the party kills in a turn is a **cheap target
  volunteered**, and a multi-target selection ignores a taunt entirely. Every taunt in the game is a
  legendary carrying 1020 to 1180 hp, and that is the mechanic's **price** rather than a habit.
- ⚠️ **A link is a defence against focus fire, so it makes a board _easier_ against a crew that
  spreads.** On a five-question Monster board `rootbound` took the weaker arrangement from 2.42
  survivors to **3.33** and a cast `chainbond` to **3.85** — four of that crew's eight bodies open
  with a row attack and three of its four drains name `enemy-lowest`. No board above floor 100 of
  that tower carries one.
- ⚠️ **`def` is not a lever at these levels, and a shield does not deny a drain.** An "armoured
  runt" — a small HP pool behind a huge `def`, meant to magnetise `enemy-lowest` drains onto a body
  returning nothing — measured **identical to a plain common** at hp 300 / def 70, and two of them
  made the board easier. Damage is `atk² / (atk + def)`, so at a roof's level the crew's `atk` swamps
  anything authorable. And `simulate.ts` takes leech off damage **dealt, shield included** — only
  thorns is measured against what reached HP.
- ⚠️ **Check a stat's shipped register before building a band on it.** A magic ward was the obvious
  Demon axis — Demons are the only faction with **zero physical damage skills** (19 magical / 0
  physical; Undead are next at 14 / 6) and no stat counters `magicResist`. At 0.60 a wall reads 3.21 /
  1.46 while leaving five of the seven crews within 0.25. It was declined on **size**: the highest
  `magicResist` on any shipped block is **0.14**, and at 0.15 the same wall is worth 0.00 / 0.54.

## Where it sits on screen

**Home draws a row per tower and it has three states**, only one of which is a link: `climbing` goes
to `/prepare/:id`, and `locked` and `topped` are inert rows that say why.

⚠️ **The locked row is where "nothing empty ships for the towers" is deliberately spent** — it names
the clears remaining and the faction it wants, because a visible destination is most of what a tower
is for.

⚠️ **`StageHeading` was generalised for this and carries the _rendered_ position, not its parts.** A
chapter-and-stage pair is a shape only the campaign has; a floor is one number in one tower, and the
two do not reduce to each other. `where` is the big line (`2-14` or `F37`), `place` locates it,
`label` names it on a button, and no screen asks which kind of content it is drawing. **`label`
earns its place** because the two kinds want opposite halves: a floor's name already _is_ its
position, so a shared template would read "F40 — Floor 40".

**An auto run needed a second ending.** The loop stopped on a loss and reported the stage that
stopped it; a tower adds "ran out of floors", and reporting that as a loss would take credit off the
player at the moment they earned the most. The two are told apart by asking whether the activity has
anything left to fight.
