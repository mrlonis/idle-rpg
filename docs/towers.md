# Faction towers

Seven towers, one per faction, **five hundred floors each at enemy levels 1 to 236 — five of seven
complete.** The system shipped in milestone 15b with a single tower, the other six in 15c, the second
hundred floors across 21e–21k, the third across 21l–21r, and the fourth across 21s–21y — the Demon
Tower last, which is what closed that round. ⚠️ **A fifth round is open**: the height moved to 500 and
the Human Tower's floors 401–500 landed with it, then the Dwarf Tower's, the Elf Tower's, the Undead
Tower's and the Monster Tower's, and the other two stand at 400. Read [`core/towers.ts`](../src/core/towers.ts) before touching
them; [authoring](authoring.md) is the procedure for adding floors.

⚠️ **The `PENDING` lists are back, and they went back in the same session as the bump** — which is what
the fourth hundred's note asked for, and the half of the discipline that had never actually been done
before. `TOWER_RULES` is one rule for all seven, so the height moves in a single session while the floors arrive one tower at a time
— which means for six sessions running, towers are authored a hundred floors short; **three names
remain on the lists now that the Undead Tower's hundred has landed.** A tower in that
state sits on a literal `PENDING` list in [`towers.spec.ts`](../src/data/towers.spec.ts) and
[`towers.balance.ts`](../src/data/towers.balance.ts); it is **not damaged** (`clearedFloors` clamps, so
`nextFloor` reports it topped and every screen reads it right) but it **has no boss** — `floorKindAt`
reads the rules' height, so its last authored floor resolves as a mini-boss paying ×2 rather than ×5 —
⚠️ **and this round it does _not_ also go naked, which is a property of the endpoint rather than of
luck.** `floorGear` measures the ramp against the rules' height, so raising it re-draws the line under
floors that already shipped — but the fifth hundred's endpoint was **solved to continue the shipped
slope** (Fine 60 at floor 400 carries on to Relic 40 at floor 500), which leaves **90 of the 100 shipped
geared floors byte-identical** and moves the other ten by a single gear level. The fourth hundred's round
was far worse: a tower ending at 300 never reached `fromFloor` 301 and stayed entirely naked for six
sessions. **Solve the gear endpoint the way you solve the level line, and the second regression
disappears.**

That payout regression is licensed by one argument and one only — **no build carrying it has ever
reached a player.** ⚠️ **Each session deletes its own name and the last one deletes both lists along
with the branches they guard.** A filter — "the full height or three quarters of it" — would pass
forever and never notice a tower nobody went back for. It has now run to completion **three times**,
and each time the last session left behind the defensive shapes the list forced: `topFloors` reading the
**authored** height rather than `rules.floors`, and the roof-versus-band-opener comparison computed
**per tower**. Both are no-ops while every tower is the full height and both are what stop the sweep
reading an undefined stage the day the next bump lands. **Leave them; put the list back before the
first tower of the next bump is authored, not after.**

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
rate, and the shipped one thousand two hundred and ten stages already take it beyond ×5.5 the base —
seven towers of four hundred floors feeding it would add 2,800 more clears, and the roster-relative
ceiling in `banners.spec.ts` would put the whole roster inside days.

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
the first rung above `rare`.

Milestone 21e measured what happens without the margin: at `elite-plus` (three rungs, ×4.096) a
level-140 five takes **the heaviest board this game can author** — five `ascended` blocks with an
Unmade in front — at 100% with all five alive in nine seconds, and no line-up fixes it.

| Crew         | Rungs | The heaviest authorable board at the crew's own level |
| ------------ | ----- | ----------------------------------------------------- |
| `rare-plus`  | 1     | 0% — the crew loses                                   |
| `elite`      | 2     | 100%, 4.30 survivors                                  |
| `elite-plus` | 3     | 100%, 5.00 survivors, 9s                              |

### ⚠️ The fourth hundred is where the margin rule stopped being expressible as a cap comparison

For three hundred floors the rule was checked as two cap comparisons — "the roof closes above the top
band's rung cap" and "every band below the top closes at or under its own crew's cap". **Both broke at
the fourth hundred, in opposite directions, on content that did not change by one level:**

- Band 4 is `legendary`, which caps at **200** against a roof of **189**. Its crew stands at 123 — 66
  levels of margin and 77 levels of cap headroom — so the roof being _under_ the cap says nothing about
  parity. The old guard would have demanded a roof of 201, which the payout bound forbids outright
  (200 pays exactly the campaign's stage-400 lump) and which moves 291 of the 300 shipped floors by up
  to 9 levels.
- Band 3 closes at **142** against `elite-plus`'s cap of **140**, and has since the third hundred
  shipped — exempt only because it was then the _top_ band. Adding a fourth band revoked the exemption.

⚠️ **A guard that fires because the band _count_ changed is pointed at the wrong quantity**, which is
the test [authoring](authoring.md) records for the three guards it has retired. Both were replaced by
the thing they were standing in for: **the power ratio, held at 1.55–1.85 in every band**, plus the
weaker structural claims that a rung exists below the roof and above it and that every band's crew can
legally hold the level it is fielded at. The ratios read **1.600 / 1.689 / 1.676 / 1.663**.

### ⚠️ Extending a tower: solve for where the new slope meets the old one

`floorLevel` draws **one line from floor 1**, so raising `floors` re-draws it underneath content that
already shipped. Solving for the top level at which the new slope meets the old one is what makes the
expected retune disappear, and it has now worked twice:

| Extension | Floors    | topLevel  | New slope | Old slope | Shipped floors that move |
| --------- | --------- | --------- | --------- | --------- | ------------------------ |
| 21e       | 100 → 200 | 60 → 120  | 0.5980    | 0.5960    | 10 of 700, by 1 level    |
| the third | 200 → 300 | 95 → 142  | 0.4716    | 0.4724    | 17 of 200, by 1 level    |
| this one  | 300 → 400 | 142 → 189 | 0.4712    | 0.4716    | 18 of 300, by 1 level    |

**236 is where the two slopes meet**: 1 + 0.4712 × 499 = 236.12, and the four band boundaries below it
— floors 100, 200, 300 and 400 — still close at 48, 95, 142 and 189, so **no band's crew moved by a
level.**

⚠️ **The neighbours are much worse and the penalty is not smooth**, so solve rather than eyeball.
Measured over the 400 shipped floors: 235 moves **179**, 237 moves **140**, 234 moves 282 and 233 moves
319, against 236's **20**. ⚠️ **A round _slope_ is the trap**: at 500 floors exactly 0.47 levels a floor
wants a roof of 235, which moves 179; at 400 floors 0.50 wanted 200, which moved **273 of 300 by up to 8
levels** and landed its lump exactly on the campaign's stage-400 payout, failing the one bound that may
never be crossed. ⚠️ **The payout bound was checked first at the fifth hundred, as the fourth hundred's
note demanded, and it cleared**: the roof of 236 pays **18,880** against the campaign's stage-500 lump of
20,000, and the highest legal roof is **249** — thirteen levels of margin where the fourth had ten.
Check it first again at the sixth; it is the constraint most likely to be the one that finally bites.

⚠️ **The moved floors are a real edit and it lands in all seven files, not in the extended one.** At
300 → 400 an 18-floor shift invalidated **fifteen band headers** across the seven tower files; at
400 → 500 a 20-floor shift invalidated **eight**, and **six of them were in files the session never
opened**. Each states the level range its floors span. They were found with a
script over `floorLevel` and fixed mechanically. **Re-run that check after every extension** — the
[prose check](authoring.md#the-prose-check) is the habit, and this is the case where the stale claims
are in files the session never opened.

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
not the campaign's 250. `Spire Conqueror` stays `every: 100`, so a four-hundred-floor tower pays it
**four** times; the tie it holds with a chapter's completion award is stated **per hundred floors**.

### ⚠️ The tower:campaign crystal ratio was asserted and has been retired

It read `sum(crystalsPerTower) / campaignCrystals` against a floor of 1.3 and a ceiling of 4. **The
floor is what killed it**: that quantity falls by construction every time a chapter ships and rises in
one step every time the towers grow, so it had been moved 2 → 1.5 → 1.3 → 1.1 → 0.7 → 1.3 across five
sessions and spent six of them parked at a placeholder watching nothing. It read 1.40 at two hundred
floors, 2.09 at three hundred, 2.475 at four and **2.563** now, which would have been a sixth, seventh
and eighth slide.
Retiring it is the call recorded in
[authoring](authoring.md) for three earlier guards, on the test that applies here: **when the honest
restatement of a guard is a number you would refuse to author, the guard is pointed at the wrong
quantity.**

⚠️ **The stable ceiling went with it, and the fourth hundred is where that started to matter.** Nothing
fails now that the towers pay **nearly three times** what the spine's first clears do. Recomputed by
hand with the Human, Dwarf, Elf, Undead and Monster Towers at five hundred floors and the other two at
four: the seven pay **1,024,500** against the 25-chapter campaign's **351,500**, a ratio of **2.915** — it
read 901,100 / 2.563, 932,100 / 2.652, 963,100 / 2.740 and 994,100 / 2.828 with one, two, three and four
towers extended. ⚠️ **Seven towers of five hundred
would read 1,087,100 and 3.093**, which is the number this round closes on if it runs to completion —
weigh it before proposing a sixth hundred. A five-hundred floor tower pays 55,300 from floors and
155,300 with both tracks, against a four-hundred floor tower's 44,300 and 124,300.

⚠️ **The direction is the finding, and it is the _ceiling_ that is under pressure rather than the
floor.** The retired guard's floor was expected to fall as chapters shipped; instead the campaign nearly
tripled in stage count between the third hundred and this one and its crystal total rose only about
12%, because `firstClearSummons` is nearly flat per stage where a tower's per-floor payout is not. The
question both halves were asking — _is seven towers still the right amount of optional content beside
the campaign of the day_ — is a design question a threshold was never going to answer. It was asked
here and left as it is, because a tower is gated behind roster depth the campaign never asks for.
**Recompute both totals when extending either side**; the arithmetic is a dozen lines and nothing does
it for you now.

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

| Band | Floors  | Rung             | Level | Against top floor | Power ratio |
| ---- | ------- | ---------------- | ----- | ----------------- | ----------- |
| 1    | 1–100   | `rare-plus`      | 48    | level 48          | ×1.600      |
| 2    | 101–200 | `elite`          | 75    | level 95          | ×1.689      |
| 3    | 201–300 | `elite-plus`     | 99    | level 142         | ×1.676      |
| 4    | 301–400 | `legendary`      | 123   | level 189         | ×1.663      |
| 5    | 401–500 | `legendary-plus` | 147   | level 236         | ×1.649      |

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
`ascended`, so band 3's crew is band 2's kit at ×1.6 and twenty-four more levels.

⚠️ **Band 4 is the opposite, and it is the largest step any band boundary has.** `legendary` _is_ a kit
rung, so that crew arrives with a **third skill** on top of its ×1.6 and its twenty-four levels — which
the three-hundred-floor doc predicted in as many words. **The power ratio counts the rung and cannot
count the skill**, so a fourth hundred is authored against measured survivors and the ratio is only a
legality check. The next kit step after this is `ascended`, which caps at 500 and is a long way off.

**No gear on any of them** — a player crewing seven towers has one bag to equip thirty-five
characters from, so tuning against a fully geared five would tune for a party nobody with seven crews
can field.

⚠️ **A single upgraded crew would stop the sweep saying anything about the low bands**, on the
**two thousand eight hundred** floors this build ships. A band-2 crew walks over floor 40.

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
  breaks the alternate. Band 3 keeps the split and sharpens it: on the cadence grade the reference
  five goes 4.00 → 2.33 while the alternate goes 3.52 → **0.15**, so every board in the third hundred
  is sized against the alternate, and the shipped roof closes at 100% / 3.63 against 90% / 2.42.
- **Demon Tower** — the **alternate** again, and by the widest margin of the seven. The whole
  crit-denial grade moves the reference five 4.00 → 3.98 and the alternate 3.92 → **2.42**; the
  floor-200 board at the third hundred's roof level reads 100% / 3.83 against **33% / 0.53**. Every
  board in that hundred is sized against the alternate, and the shipped roof closes at 100% / 3.88
  against 90% / 1.60.

**Check both arrangements on every candidate board.** "Size it against the alternate first" is true
of three towers and is still not a rule.

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
- **Human, fourth hundred** — the first hundred in any tower whose axis is **the gear its boards are
  wearing**, and the first geared boards outside the campaign. See below.
- **Dwarf, second hundred** — cannot do that. A Dwarf five out-lasts bulk and loses to the
  ninety-second clock, so it escalates in **front** and forbids a heal, a drain or a regeneration
  above floor 180. Measured at the top floor's level: one anchor plus a _bulky_ legendary reads
  90% / 45.7s and 63% for the alternate; the same weight as a _pressure_ legendary reads
  100% / 33.0s and 90%; a shield support in the back rank reads **28% / 0%**. ⚠️ **The back rank is a
  cliff rather than a dial** — moving one body of the same output from front to back takes the
  reference five from 100% to **10%**, because Dwarves carry the least reach in the game.
- **Dwarf, third hundred** — the first where the escalation had to come from **the board's
  composition rather than from any body on it**, because the anchors run out of room. See below.
- **Dwarf, fourth hundred** — the first whose axis is a stat aimed at **the stat the crew's whole
  identity is**: `physicalPierce` against the deepest armour in the game. The gear ramp arrives free
  here (it is one rule for all seven towers), so unlike the Human fourth hundred this one had to find an
  axis on top of it. See below.
- **Dwarf, fifth hundred** — the first hundred built on **a spent axis whose own licence had expired**:
  pierce alone re-measured seventh of fourteen at band 5, and what is authored instead is
  `physicalPierce` **and** `atk` carried together on light bodies — super-additive on this crew
  (0.47 + 0.82 alone against **1.97** together), which is the Monster fourth hundred's licence for
  building on the axis below, taken on margin exactly as the Human fifth hundred's was. See below.
- **Elf, second hundred** — can afford either (it takes the heaviest authorable board in eleven
  seconds against a ninety-second timer) but neither _threatens_ it: a shield support in the back rank
  leaves the weaker arrangement at 100% with 4.25 alive, while two anchors take it to 43%. It
  escalates through a **wall that hides a burster**, because what an Elf five is short of is health
  rather than time.
- **Elf, third hundred** — the first where the axis is a **defensive gap in the crew's own stat
  block** rather than anything about the board's shape. See below.
- **Elf, fourth hundred** — the first where the honest finding is that **the whole vocabulary is inert
  and only throughput is left**, so the axis is `atk` and the health standing under it, as a product.
  See below.
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
- **Undead, fourth hundred** — the exact inversion of the third: boards that **do not need to live**,
  escalating on `atk` and `haste` as a product with the authored weight falling underneath. The
  fourth geared hundred and the third to inherit the ramp rather than spend it. See below.
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
- **Angel, second hundred** — the first where the honest finding was that **no mechanic is available
  at all**.
  Twenty-two shapes measured against both arrangements at the roof's level — taunt, thorns, link,
  bomb, `SAVAGED`, `BLOODRISEN`, `dodge` 0.30, `tenacity` 0.60, a board stun, a board slow, a shield,
  `magicResist` 0.40, a healer, hex volume — and the **whole spread was 0.15 survivors of five**,
  every row between 3.92 and 4.00. An Angel five is `GUARD`, `BARRIER`, `AEGIS`, two or three heals
  and a cleanse, so the first question is free.
- **Angel, third hundred** — the first where the axis is **not a stat and not a mechanic**, but how
  large a single instance of damage is. See below.
- **Angel, fourth hundred** — the same question read the other way: how _often_ a blow finds the
  seam, which is `critChance` against the one crew in the game that answered crit with the wrong half
  of it. The sixth geared hundred, and the fifth to inherit the ramp rather than spend it. See below.
- **Demon, second hundred** — the last of that round, and about **scope** rather than a mechanic. See
  below.
- **Demon, third hundred** — the last of that round, and the first where the axis is a stat that
  **denies the crew's own signature stat**: `critBlock` and `critDamageResist` against the crit-heaviest
  roster in the game. See below.
- **Demon, fourth hundred** — **the last hundred of the tower system**, and the only one whose axis is a
  mechanic two towers had already measured and declined: `magicResist`, re-priced at band 4 against the
  only crew in the game whose damage is entirely magical and whose sole armour answer — the game's
  largest `magicPierce` — is the wrong stat by the damage formula. The seventh geared hundred and the
  sixth to inherit the ramp rather than spend it. See below.

### The Human Tower's fourth hundred: the equipment is the escalation

⚠️ **The Panoply is the first tower hundred whose axis is enemy gear, and it needed the first
`core/` change a tower content session has taken.** `TowerRulesData` gained a `gear` ramp,
`resolveFloor` and `resolveTower` gained a required `GearRulesData` and price `enemyGear` through the
same `setBonus` the player's bag goes through, and `floorGear` draws the ramp. The ramp runs **Worn 1 at
floor 301 to Fine 60 at floor 400**, linear on the **concatenated** grade ladder — Worn 1 through Relic
100 as one run of 300 positions — so quality and level both rise by construction rather than by luck.
The grade steps at floors 301, 318 and 351.

⚠️ **A tower cannot inherit the campaign's gear the way it inherits its lump.** Reading the gear off
the campaign stage at the same enemy level is the obvious move and it yields **no gear anywhere in any
tower**: the campaign's first geared stage is `c12-s1` at enemy **level 225** against a roof of 189. The
whole tower lives below the level the spine introduces gear at, so the ramp has to be the tower's own —
and it follows that a tower is _not_ out-gearing the campaign at equal level, because there is no grade
there to be out-geared by.

⚠️ **A gear ramp is _escalation_ on a tower where the campaign measured it as texture, and the
difference is whether the boards underneath it are being lightened.** [gear](gear.md) prices a whole
grade step at about ×1.15 and chapter 16's entire Relic ramp at **0.08 of a survivor** — measured while
the campaign's board budget fell 0.595 a chapter underneath the ramp. Hold a board still and add the
same gear and it is enormous. Against a calibrated control of an anchor at 1150/64 behind four bodies at
700/46 at level 189, reading **4.00 / 3.33 of five** naked:

| the same board wearing | reference | alternate      |
| ---------------------- | --------- | -------------- |
| nothing (control)      | 4.00      | 3.33           |
| Worn 1                 | 3.35      | 2.35           |
| Sturdy 20              | 2.38      | **1.05 · 93%** |
| Fine 60                | **0%**    | **0%**         |
| Relic 100              | 0% · 8.2s | 0% · 7.1s      |

**State whether the board under a gear figure was being lightened, or the figure means nothing.**

⚠️ **Relic 100 was measured and declined**, and it is the ramp's ceiling question rather than a tuning
one: +166% health on a `tank` against Fine 60's +66%, deleting the party in seven seconds. A ramp
ending at the top of the ladder leaves the authored weight nothing to be.

⚠️ **So the authored board total falls across the hundred, and that is the ramp working.** The budget
runs about 2,700 raw health at floor 301, peaks near 4,400 in the middle and closes at **2,810** —
where the third hundred's closing boards run 5,330. Holding one board constant across the whole hundred
already grades **5.00 → 3.52 survivors** on the level line and the ramp alone.

What the crew actually answers to, one carrier on the geared roof control, forty seeds, zero timeouts:

| shape                                        | ref / alt   | worth to the alternate        |
| -------------------------------------------- | ----------- | ----------------------------- |
| `magicResist` 0.60 — the damage-type control | 4.00 / 3.50 | **−0.17**                     |
| wide damage at the cap, back rank            | 3.98 / 3.52 | **−0.19**                     |
| reach on `enemy-back`, power 1.2             | 4.00 / 3.38 | −0.05                         |
| `physicalResist` 0.10 / 0.23 / 0.35 / 0.50   | see below   | 0.18 / 0.31 / 0.48 / **1.18** |
| `def` 70 / 110                               | —           | 0.33 / 0.53                   |
| `dodge` 0.30                                 | 3.73 / 2.77 | 0.56                          |
| burst, single-target power 3.10 / cd 80      | 3.92 / 2.70 | 0.63                          |
| `STUN` on `enemy-all`, front carrier         | 3.88 / 2.02 | **1.31**                      |
| pairing — two `ascended` anchors in front    | 2.27 / 1.43 | **1.90**                      |
| `haste` 144                                  | 2.65 / 0.88 | **2.45**                      |

- ⚠️ **`physicalResist` is the strongest stat dial here and it is deliberately not the axis, because it
  is the Monster Tower's.** `magicResist` 0.60 is worth **−0.17** — both Human fives are 100% physical —
  which is the mechanism control. **Two towers with one lock is one tower shipped twice**, so it stays at
  this tower's shipped median of 0.06 and never past its 0.23 ceiling.
- ⚠️ **The Monster Tower's own "is it ours" table recorded `physicalResist` 0.55 as worth 0.00 to
  `human-ref`, and that reading was taken on the arrangement that cannot fall.** The Human reference five
  is plateaued at 4.00 across a wide band here while the alternate grades cleanly. **Re-measure a
  cross-tower negative on the _binding_ arrangement before trusting it** — the saturated-control trap,
  arriving as a claim in another tower's file.
- ⚠️ **`def` is the texture, and the coherence is deliberate.** `GEAR_STATS` is `hp`, `atk`, `def`,
  `haste`, so the stat a kitted body shows off is one gear actually moves — and it reads as texture
  should.
- ⚠️ **Aim past the front rank is inert or negative for the fifth time across the seven towers**, and the
  second on this one. Every skill the hundred authors is `enemy-front`.

⚠️ **The roof's escort is the whole question and the boss needed no retune.** `THE_PANOPLY` at its
authored 1240/68 behind `PLATEBOUND_HUSK` reads **13% for the alternate**; behind four light bodies it
reads **98% with 1.73**. Nine escort shapes were fielded and every one left the boss's stat line alone —
chapter 19's "a final that fails at every stat line is its escort", arriving on a roof.

⚠️ **No anchor had to retire, the fourth clean answer to that check.** All 53 blocks this tower fields
stand as a roof anchor behind four light escorts at level 189 in Fine 60, the Hourless March at 1660/76
included (4.40 / 4.00). What collapses is the **board**: the shipped floor-300 board at the new roof's
level reads 100% / 1.93 against **53% / 0.55**.

⚠️ **`THE_PANOPLY` is the _second_ lightest tower roof on both axes, and it shipped claiming to be the
lightest.** The ten roofs read **1160**/72 (the Undead Tower's `THE_SPRINGWOOD`, the lightest on
health), 1200/**52** (the Dwarf Tower's `THE_PROOF_HOUSE`, the lightest on attack), 1240/64 (the Elf
Tower's `THE_PLATEWRIGHT`), 1240/68 (this), 1240/74, 1300/84, 1320/82, 1440/86,
1540/92, 1560/91 — the Dwarf fourth hundred took both records the
session after this one landed, and the Undead fourth hundred took the health record back one session
after that, all three being geared and spending their allowance on an axis as well as on the
grade. The fifth hundreds then took the attack record twice more — the Ironpace at 1160/**44** and the
Masterstroke at 1140/**40**, the lightest roof _anchor_ any hundred has shipped on both axes, though
the Monster Tower's Turnaway (820/58) remains the lightest roof _block_ on health. **The weight a roof
is allowed is what is left after the grade** — and ⚠️ **a superlative about
seven towers goes stale the moment the next hundred lands, so state the list.** The hundred closes at
**100% / 3.60 against 93% / 1.65**, zero timeouts, longest fight 28.6s.

⚠️ **The sustain claim is stated in counts, because the absolute version has shipped wrong four times.**
Zero of a hundred boards carry a heal effect, a `regen` status, a shield or a point of `healthRegen`.
What they do carry is the Undead idiom: `lifeLeech` on 5 of 24 blocks and 46 boards, a `drain` on 4
blocks and 51 boards, `recovery` on exactly one block standing on three. The roof carries no taunt and
the Reliquary Bearer is not fielded in the hundred at all.

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
the floor, the band is a composition problem rather than an anchor problem. ⚠️ **And field each
candidate anchor alone rather than reading the pair of stat lines** — the Demon Tower's heaviest
block survives at the new roof while the lighter block above it does not, because what fails there is
a board-wide turn rather than weight.

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

### The Dwarf Tower's fourth hundred: the armour the hold made, turned around

⚠️ **The Proof House is the first hundred whose axis attacks the stat the crew's whole identity is.**
Floors 301–400, levels 142–189, and the gear ramp arrives **free** — `TOWER_RULES.gear` is one rule for
all seven towers, Worn 1 to Fine 60 with grades stepping at 301, 318 and 351 — so where the Human fourth
hundred spent that ramp _as_ its axis, this one had to find an axis on top of it.

"Cannot close a fight; can refuse to lose one" is a sentence about armour. The two swept Dwarf
arrangements carry authored `def` **Σ163 / Σ186** against Human Σ119 / Σ122, Elf Σ83 / Σ75, Monster Σ76
and Undead Σ50 / Σ45; `core/battle/damage.ts` computes `def × (1 − pierce)`. Against a calibrated geared
control — an anchor at 1100/64 behind four bodies at 580/40 at level 189 in Fine 60, reading
**4.00 / 4.00**, and it moves — forty seeds, **zero timeouts on every row**:

| four bodies at        | reference | alternate  | worth to the alternate |
| --------------------- | --------- | ---------- | ---------------------- |
| 0.00 — the control    | 4.00      | 3.95       | —                      |
| `physicalPierce` 0.10 | 3.98      | 3.85       | 0.10                   |
| `physicalPierce` 0.18 | 3.80      | 3.38       | 0.57                   |
| `physicalPierce` 0.25 | 3.48      | 3.10       | 0.85                   |
| `physicalPierce` 0.35 | 3.05      | 2.92       | **1.03**               |
| `physicalPierce` 0.45 | 2.92      | 2.52       | **1.43**               |
| `physicalPierce` 0.60 | 1.68      | 1.63 · 90% | **2.32**               |

⚠️ **It grades in carrier _counts_ as well as in value**, which is what five bands need: at 0.35, by how
many of four carry it, 3.95 → 3.98 → 3.73 → 3.33 → **3.10**. The bands walk the count first (bodies at or
above `physicalPierce` 0.20 per board: 1–2, 2–3, 3–4, 3–4, 1–3) and the value second, and the closing band
trades count for the roof's own 0.40.

⚠️ **It was chosen on _fight length_, and on this tower nothing else could have chosen.** Three dials
measured stronger and all three are the ninety-second clock. Against the same control at 31.6s: `def` 110
is worth 1.33 at **58.2s**; enemy `hp` 1300 is worth 3.67 at **67.9s and a 20% win rate**; `haste` 143 is
worth 2.00 at 44.1s and is the second hundred's axis anyway. Pierce at 0.45 is worth 1.43 at **41.1s**.
This tower's third-hundred roof is the tightest cleared fight in the project at 62.5s against a 67.5s bar.

⚠️ **"Is it ours" comes back first of fourteen, and the naive argument for it is _false_.** As a change on
each crew's own control, calibrated per crew then given pierce 0.35: **dwarf-alt −1.08, dwarf-ref −1.00**,
monster-ref −0.88, undead-ref −0.79, monster-alt −0.75, human-alt −0.50, human-ref −0.38, angel-ref −0.29,
elf-alt −0.25, demon-ref −0.21, elf-ref −0.17, angel-alt −0.08, demon-alt −0.04, undead-alt −0.04.
⚠️ **But "they have the most `def` to lose" does not survive the table**: both Angel arrangements carry
_more_ authored `def` than the Dwarves (Σ195 and Σ174 against Σ186 and Σ163) and lose −0.08 and −0.29.
What makes it this crew's is that `def` is the **only** mitigation it has — zero `magicResist`, zero
`dodge`, Σ0.12 / Σ0.32 of `tenacity`, no `lifeLeech` — where an Angel five has armour _and_ a choir.
**Take the measurement, not the register.**

⚠️ **It is not the Monster Tower's lock under a new name, and the damage formula is why.** That tower's
axis is enemy `physicalResist` — the board refusing the crew's damage — and its own argument is that
pierce multiplies `def` while resist is applied afterwards untouched. This is the same sentence read from
the other side of the board.

⚠️ **The band is built inside the register and only the roof steps past** — the Splintering Yards' shape.
Measured **as the register stood before this hundred's own four blocks joined the pool**, which is the
only form of the figure that means anything: `physicalPierce` sat on **105 of 326** blocks at a median of
0.20 and a ceiling of 0.45 (the Ravager), and across 46 Human blocks on **22** carriers, median 0.20,
ceiling **0.30**. The three new legendaries run 0.20 / 0.25 / 0.30 and the roof alone reaches **0.40**,
still under the game's 0.45. (The pool now reads 109 of 330 and the Human ceiling is the roof's own 0.40 —
which is why the pre-authoring figure is the one stated.) At the register — 0.30 across four
bodies — the axis is already worth 0.85 of the binding arrangement.

Two negatives worth not re-measuring: **magical damage is worth 0.12** here where the third hundred read
0.48 (the crews carry no `magicResist` but only Σ0.29 / Σ0.42 of `physicalResist` to bypass, so the swap
is 6–8% of a hit), and **instance size at held damage per second is worth 0.05 / 0.33 / 0.70** across power
1.35 / 2.20 / 3.10 — a third of what it is worth on the Angel Tower.

⚠️ **The _gear archetype_ a body declares is a dial in its own right, and it is the one lever a geared
hundred has that a naked one does not.** Identical stat lines all-`tank` / `support` / `brawler` /
`ranger` / `mage` read 4.00 / 4.00 / 3.98 / **3.67** / 3.75 for the binding arrangement, and the
attack-and-haste profiles take **7.2 seconds off** the board as well. So the pierce carriers wear
`brawler` and the walls wear `tank` — a way to add pressure without adding seconds. Texture rather than
the axis, at a third of a survivor against pierce's 1.43.

What the boards found that the control did not:

- ⚠️ **The Crownworks collapse, again and harder.** The shipped floor-300 board reads 100% with all five
  alive at its own level 142, **5% with 0.05 naked at 189**, and **0% in Fine 60** — the gear turning a
  47-second loss into a 21-second one.
- ⚠️ **No anchor had to retire — the fifth clean answer to that check.** Every heavy block above floor 200
  stands as a lone anchor behind four light escorts at 189 in Fine 60 at 100%: `THE_BREACHLORD` at 1300/78
  reads 4.00 / 3.95, `THE_CROWN_WHEEL` at 1240/74 reads 4.00 / 4.00. What collapses is the board.
- ⚠️ **The roof failed at every escort and the fix was its _attack_, which inverts the Human roof
  finding.** There the escort was the whole question and the boss's line was never touched; here, weight
  held at 1200 hp, the roof reads **0% at `atk` 70**, 2.67 / 2.35 at **52**, 3.85 / 3.42 at 44, 4.00 / 3.95
  at 38 — and one turn instead of three at `atk` 70 reads 100% / 1.20 and 90% / 1.55. **Shortlist on
  weight; settle on attack**, on a roof. ⚠️ **The escort had to come down as well**: four low-`atk` commons
  read 100% / 2.67 and 100% / 2.35, swapping one for a 900/**48** body reads 48% / 53%, and a single pierce
  carrier in the escort reads **3% / 5%**. Both halves, not one.
- ⚠️ **The axis carries the last floor rather than riding along**: floor 400 with the roof's pierce stripped
  to zero reads 100% / 3.80 against 100% / 3.00 where the shipped board reads 2.67 and 2.35.
- ⚠️ **The second hundred's "escalate in front, the back rank is a cliff" does _not_ transfer to this axis,
  and a first pass nearly shipped the claim that it does.** On the shipped floor 398 moving a carrier
  between ranks is worth **−0.37 to +0.33**. The earlier reading that said otherwise was taken on a five
  whose third body also carried pierce, so moving one back put **two** carriers there — chapter 22's "a rank
  comparison must be carried on one body", intact. **The rank rule is about output and pierce is not
  output.**
- ⚠️ **The closing floors fall in weight and rise in heat.** A second _heavy_ carrier (880–900 hp at 78–80
  `atk`) in the back rank of floors 394–399 read **0% to 25%** at 68.8s; a light, hot skirmisher at 500–560
  hp in the same slot took them to 100% with 3.3 to 4.0 alive.
- ⚠️ **The lean overshoot had to be fixed on the _soft_ pool rather than the light one**, which is where it
  differs from the third hundred: the shipped low-attack commons are nearly all Human, so the swap reached
  for Monster tanks rather than light Monster texture. 77.6% on the first pass — which would have taken the
  whole tower to 65.44% and failed the ceiling — down to **63.4%**, and the tower to **61.82%**.

⚠️ **The sustain claim is stated in counts.** Of the 35 blocks the hundred fields, **zero** carry
`lifeLeech`, `recovery` or `healthRegen`; **zero** carry a heal, drain or shield effect; **zero** carry a
`regen`, ward or guard status; **zero** carry a taunt. No board pairs two `ascended` blocks — two in one
front rank at the roof's level in Fine 60 reads **0% / 0%**.

The hundred closes at **100% / 2.67 / 41.0s against 100% / 2.35 / 43.7s**, zero timeouts, longest cleared
attempt **60.9s** against the 67.5s bar. ⚠️ **A roof at `atk` 54 measured 62.5s on the nose — tying the
third hundred's record — and was declined for that alone**: it costs 0.22 of a survivor and buys nothing.

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

### The Elf Tower's fourth hundred: everything else is inert

⚠️ **The Plating Floor is the first hundred in the project whose axis is plain `atk`, and it is there
because the session measured the whole vocabulary and found nothing else.** Floors 301–400, levels
142–189, gear ramp inherited free. Against a calibrated geared control at level 189 in Fine 60 — an
anchor at 1000/58 behind four bodies at 520/36, reading **4.00 / 3.95**, and it moves — forty seeds,
zero timeouts on every row:

| four carriers at       | reference | alternate | worth to the alternate |
| ---------------------- | --------- | --------- | ---------------------- |
| 520 / 36 — the control | 4.00      | 3.95      | —                      |
| 520 / 44               | 3.95      | 3.20      | 0.75                   |
| 520 / 52               | 3.55      | 1.55      | 2.40                   |
| 700 / 36               | 4.00      | 3.77      | 0.18                   |
| 900 / 36               | 4.00      | 3.20      | 0.75                   |
| **700 / 52**           | 3.17      | **0.33**  | **3.62**               |
| **900 / 44**           | 3.50      | **0.85**  | **3.10**               |

**Neither half is worth much alone and together they are the whole board** — the Dwarf third hundred's
"weight and rate are a product" arriving on weight and _attack_. It grades in carrier counts as well:
at 700/52, by how many of four carry it, 3.95 → 3.88 → 3.13 → 1.75 → **0.33**.

⚠️ **The negative list is most of the finding and none of it is worth re-measuring.** Twelve hostile
statuses riding the swing across all four bodies span **±0.22**, and four of them (`savaged`,
`doombrand`, `ember-seed`, `bloodrisen`) leave the board _easier_. `tenacity` is **exactly flat** at
0.20 / 0.40 / 0.60 / 0.85. `magicResist` is **exactly 0.00** at 0.30 and 0.60. `critBlock` is worth
0.05, `accuracy` 0.05 and `physicalPierce` 0.10 — so the Demon Tower's lock, the Undead Tower's and
the Dwarf Tower's all price at nothing here. Every scope, reach and selection leaves a board _easier_
(`enemy-all` 4.05, `enemy-row-back` 4.38, `enemy-back` 4.45, `enemy-lowest` 4.38, `enemy-highest`
4.47) — the **sixth** tower to find it — and board-wide voice count is flat at 3.98 / 3.98 / 3.98 /
4.05, so the Monster Tower's axis is not this one's either.

⚠️ **Enemy sustain is worth 0.07 of a survivor across the entire vocabulary, and this is the one tower
where that could have been spent.** `lifeLeech` 0.45 on all four reads 3.92, `recovery` 30 reads 3.88,
`healthRegen` 22 reads **3.95 — exactly the control**, a back-rank healer 4.00 and `REGENERATION` on
`ally-all` 3.98. An Elf five clears its heaviest authorable board in ten seconds against a
ninety-second timer, so no amount of enemy sustain outpaces it. **The hundred still authors none**: a
hundred does not relax a termination argument because its own crew happens to be fast.

⚠️ **"Is it ours" comes back negative and the header says so.** As a change on each crew's own
calibrated control, the pair at ×1.44 attack and ×1.35 health: dwarf-ref −3.98, angel-ref −3.88,
angel-alt −3.80, **elf-alt −3.70**, demon-alt −2.92, undead-alt −2.88, human-alt −2.60, dwarf-alt
−2.60, human-ref −2.55, demon-ref −2.03, undead-ref −2.00, monster-ref −1.90, elf-ref −1.67,
monster-alt −1.08. **Fourth of fourteen — the licence is margin rather than exclusivity**, which is the
Angel third hundred's shape. The other half of the argument is the register on the party's side: an Elf
five is the lowest health in the game (2,305 / 2,180) on the lowest authored `def` (Σ83 / Σ75) with
**zero** `physicalResist`, `tenacity`, `critBlock`, `critDamageResist` and `lifeLeech`. There is no
refusal stat on that crew for a board to have to get past, which is exactly why nothing but throughput
reads.

⚠️ **The first calibration said attack was the Elves' lock and it was wrong, on a saturated control.**
A coarser weight ladder left ten of the fourteen crews reading 4.00 flat, which put elf-alt first of
fourteen by a factor of 2.35. Re-calibrating to _the heaviest board each crew still reads ≥3.75 on_
moved it to fourth. **Confirm every crew's control can fall before believing a cross-crew table** —
the Demon Tower's saturation trap, arriving on the "is it ours" test rather than on an axis.

⚠️ **Two of this tower's own roofs retired and the pair that went is not the heaviest.** Behind four
low-`atk` commons at 189 in Fine 60, `THE_GRUDGEKEEPER` at 1520/89 reads **78% / 2.15** and the
Adamant Colossus at 1250/88 reads **4.00 / 4.08**, while `THE_EDGEWRIGHT` at 1300/84 — the hundred
below's own roof — reads **5% / 0.05**, `THE_WARDWRIGHT` at 1560/92 reads 20% / 0.38, `THE_DOORSTONE`
at 1480/88 reads 0% and `THE_ANVIL_CROWNED` at 1750/97 reads 0%. The Edgewright fails on its
`critChance` 0.22 at amp 1.15 — the _third_ hundred's own axis, against a crew with zero of either
answering stat — and the Doorstone on its `def` 70 and `physicalResist` 0.30, which buy it 29 seconds
of swinging where the Grudgekeeper gets 17. ⚠️ **The Colossus stands because its `haste` is 58, the
lowest in the game**: attack only bills for as long as the body carrying it lives, and only as often as
it swings.

⚠️ **The lean overshoot was the worst of the four rounds.** Authored from the Dwarf bench the hundred
came out at **85.2% Dwarf**, taking the whole tower to **65.34%** and over the ceiling. Converting one
texture slot per affected board — spread across all five bands, never an axis carrier and never an
anchor, substitutes drawn only from monster, angel and demon — took it to 75.6% and the tower to
**62.99%**.

⚠️ **`THE_PLATEWRIGHT` is the lightest of the nine tower roofs on health and the third lightest on
attack** — 1240/64 against 1200/52, 1240/68, 1240/74, 1300/84, 1320/82, 1440/86, 1540/92, 1560/91 —
and it is **lighter than the Edgewright it succeeds on both stats.** The hundred closes at
**100% / 3.88 / 13.3s against 85% / 2.33 / 20.3s**, zero timeouts anywhere, longest single attempt
**32.0s** against the 67.5s bar.

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

### The Undead Tower's fourth hundred: the board that does not need to live

⚠️ **The Coppice is the exact inversion of the hundred below it, and that is the finding rather than
a flourish.** The Seedfall escalates through boards that will not die, on the argument that a crew
sustaining entirely on `lifeLeech` off damage dealt is starved by a board with no pool left to take
it from. The Coppice spends every point of its budget on `atk` and `haste` instead and lets the
weight fall away underneath: the board **does not need to live**, because the fight ends before
attrition can pay. Floors 301–400, levels 142–189, and the gear ramp arrives free — so, like the
Proof House and the Plating Floor, this hundred owed an axis on top of it.

⚠️ **Two controls rather than one, and that is the calibration step rather than a shortcut.** A
single board serving both arrangements leaves the alternate flat at 4.00 on **30 rows of 33** — the
saturated control the Long Amen and the Plating Floor each had to correct for. The reference five is
read on an anchor at 900/54 behind four at 460/36 and the alternate on 1100/64 behind four at 520/40,
each the heaviest board its own crew still reads ≥3.75 on. Forty seeds, **zero timeouts on every
row**:

| four carriers at  | reference  | alternate  | ref s | alt s (max) |
| ----------------- | ---------- | ---------- | ----- | ----------- |
| 36 / 96 — control | 3.77       | 3.92       | 19.2  | 19.6 (20.5) |
| 40 / 104          | 3.00       | 3.40       | 20.2  | 20.2 (21.8) |
| 44 / 112          | 2.15       | 2.15       | 21.4  | 22.7 (29.6) |
| 48 / 120          | 2.00       | 0.97 · 98% | 21.5  | 29.8 (33.0) |
| 52 / 128          | 1.65       | 0.03 · 3%  | 22.2  | 21.8 (30.0) |
| 56 / 136          | 0.93 · 88% | 0.00       | 24.3  | 18.2        |

⚠️ **It is a product and neither half is the axis.** `atk` 48 alone reads 2.52 / 2.58 and `haste` 120
alone 3.00 / 2.63; together they read 2.00 / **0.97**. It grades in carrier counts as well — at
48/120, by how many of four carry it: 3.85 → 3.38 → 3.00 → 2.05 → 2.00 and 4.00 → 3.98 → 2.73 →
1.88 → **0.95**.

⚠️ **The weight has to fall, and that is what separates it from the Plating Floor.** That hundred's
axis is `atk` × _health_; put health under this one and it is worse on the reference five and nine to
twelve seconds longer (700 hp / atk 48 reads 2.00 / 1.55 at 28.1s / 31.5s), and all three at once is
past the edge at 1.40 / 0.00.

⚠️ **It was chosen on fight length, and this is the crew that rule exists for.** The Undead Tower's
own shipped floor 100 is the longest fight in the project's towers at **51.2 seconds against a 67.5s
bar**. Every rival axis walks toward it — enemy `hp` 1000 costs 1.25 / 1.00 at 32.1s / 30.6s, `def`
110 costs 0.97 / 1.94 at 28.8s / 33.5s, a board-wide `WEAKEN` adds six seconds — where the **longest
fight in the whole hundred is 24.3 seconds** and the sharpest rows on the ladder are _faster_ than the
control. Each of this tower's hundreds has closed faster than the one below: 51.2s, 39.6s, 41.4s,
**24.3s**.

⚠️ **`magicResist` was the obvious axis and it is disqualified rather than merely weak.** Undead
skills are 14 magical to 6 physical and the crew's sustain is leech off damage _dealt_, so a magic
wall taxes the damage and the healing at once — the sharpest "is it ours" argument available on
paper. Measured, 0.45 reads 3.05 / 3.08 where `def` 70 reads 3.00 / 2.67 and `hp` 700 reads
3.00 / 3.17, **all three within a second of each other**. That is this tower's own third-hundred
finding — _the lever is the pool, whichever stat spells it_ — so a band on it would be the Seedfall
shipped twice. Cross-crew it is worth **0.00 to the binding alternate**. **A mechanism argument is
not a measurement; check whether the new stat lands on a curve the tower has already spent.**

The rest of the negative list, against the same two controls: `tenacity` 0.85 worth 0.17 / 0.19,
`critBlock` 0.50 worth 0.04 / **0.00**, `energyRegen` 18 worth −0.11 / −0.08, `physicalPierce` 0.60
worth 0.77 / 0.79, a full-chance 46-tick stun 0.77 / 0.94, `SUNDER` ×0.50 0.77 / 0.34, `SLOW` ×0.40
0.72 / 0.84, burst at power 3.10 / cd 126 worth 0.77 / 0.94. **Aim past the front rank leaves a board
easier than saying nothing** (`enemy-all` at the wide cap reads −0.11 / −0.08) — the **seventh of
seven** towers to find it, which closes that question for the project.

⚠️ **Is it ours comes back margin rather than exclusivity, and the margin is thin.** As a change on
each crew's own calibrated control — every crew re-calibrated to the heaviest board it still reads
≥3.75 on, mirror boards so the matchup is off — at 48/120: undead-alt **−2.02**, undead-ref
**−2.00**, dwarf-ref −1.93, elf-alt −1.88, dwarf-alt −1.73, monster-alt −1.60, human-alt −1.42,
monster-ref −1.00, demon-alt −1.00, human-ref −0.92, elf-ref −0.73, demon-ref −0.45, angel-ref and
angel-alt **0.00**. First and second of fourteen with dwarf-ref 0.09 behind, so the licence is the
Unmending's rather than the Closing's. On the tower's own elven boards the alternate's figure widens
to −2.58; **the mirror figure is the honest one and the header says which.**

⚠️ **An axis can stop being a crew's own, and both of this tower's earlier ones have.** Re-measured at
band 4's rung and kit, the third hundred's enemy `hp` costs dwarf-ref **−2.78** against these crews'
−1.25 / −1.00, and the second hundred's `dodge` costs dwarf-ref −1.05 against undead-ref's −0.85.
Neither was true when it was measured a band lower. **Re-run "is it ours" on the band being authored,
not on the band that recorded it.**

⚠️ **The register check is about a _pairing_ here, not a stat.** Measured before this hundred's own
four blocks joined the pool: across 334 shipped blocks `haste` ran a median of 94 to a ceiling of 152
and `atk` a median of 56 to a ceiling of 100, and the Elf pool of 53 read 96 / 152 and 56 / 99 — so
both halves of the three new legendaries sit **inside** both registers. What steps past is carrying
them together: only **5 of 334** blocks carried `haste` ≥ 118 _and_ `atk` ≥ 70. **Say which of the two
shapes a band is when the axis is a product.**

⚠️ **The Quickening's ration is lifted deliberately.** That band fields one fast body carrying real
`atk` per board and never two, because two behind an anchor at its own roof's level read **0%**. At
band 4 two read 3.00 / 2.73 and the closing bands field three. The hundred below is not wrong; the
crew meeting it is a different crew.

⚠️ **The Seedcrown collapses and one retirement nearly shipped inverted.** The floor-300 board reads
100% with all five alive at its own level 142, 4.35 / 5.00 at 161, 2.23 / 3.77 at 175 and **0% / 0%
at 189 in Fine 60**. Behind four light escorts at 189, `THE_SEEDFATHER` still stands at 1.93 / 2.38
and `WYRDROOT_ANCIENT` at 4.00 / 4.00, while `THE_SUNBOUGH` reads **0% / 13%** and
`THE_WITHERED_CROWN` **3% / 18% at 41 seconds** — both already retired below, both staying retired.
⚠️ **The Withered Crown first measured 3.10 / 3.63, comfortably safe, because it carries no
`gearArchetype` and was therefore fighting _naked_ on a board priced as though it were kitted.** The
missing-archetype trap is documented as a silent difficulty error; this is the first time it has been
caught **inverting the sign of an anchor-retirement check**. Nine blocks needed the one-line edit and
none of the nine stands on a geared campaign stage, so the bill was free — checked rather than
assumed.

⚠️ **The hundred fields no sustain, and the Wyrdroot Ancient is what that cost.** It passes the
retirement check outright and is still not fielded, because it carries `recovery` and `healthRegen`.
Stated in counts: of the 30 blocks the hundred fields, **zero** carry `recovery`, `lifeLeech` or
`healthRegen`, **zero** carry a heal, drain or shield effect, **zero** carry a `regen` status. The
Seedlight Keeper, whose board-wide ward the Seedfall measured as a clock at the top, is absent too.

⚠️ **Floor 399 is why the stride is not the check.** `towers.balance.ts` samples every fourth floor
plus the mini-bosses, and the first draft's floor 399 — three full carriers at the roof's own level
189 in Fine 60 — read **60%** while the floors either side read 100% and 98%. It is invisible to the
stride and caught only by the every-floor assertion. **Sweep every floor of a closing band before
believing a band that samples cleanly.**

The hundred opens at floor 301 in 6.8 seconds with all five alive, costs neither arrangement a member
until floor 330, and closes at **98% / 1.38 / 19.4s against 98% / 2.48 / 15.4s** — zero timeouts
anywhere, longest fight 24.3s. Its lean runs 53.8% elf, taking the tower to **60.44%**.

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

### The Monster Tower's fourth hundred: the plate that is not there when the blow lands

⚠️ **The Turning is the one hundred that builds on the axis below it rather than replacing it, and
the licence is that the two are measurably not the same curve.** The obvious reading says they are:
`physicalResist` and `dodge` both reduce the damage this crew deals, and a crew sustaining on
`lifeLeech` off damage _dealt_ is starved by either — which is exactly the mechanism argument that
disqualified `magicResist` on the Coppice. Measured at level 189 in Fine 60 against two calibrated
controls (reference 1300/68 behind four at 580/42, alternate 1060/58 behind four at 480/37, each the
heaviest board its own crew still reads ≥3.75 on), forty seeds, **zero timeouts on every row**:

| four carriers at      | reference | alternate |
| --------------------- | --------- | --------- |
| control               | 3.90      | 3.90      |
| `physicalResist` 0.45 | 2.92      | 3.00      |
| `dodge` 0.35          | 2.90      | 3.00      |
| **both**              | **1.32**  | **1.75**  |
| `physicalResist` 0.60 | 2.00      | 2.00      |
| `dodge` 0.45          | 2.65      | 2.75      |
| **both**              | **0.00**  | **0.03**  |

⚠️ **It is sharpest on a single body, which is the cleanest statement of it.** One anchor at 950/64
behind four light escorts at the roof reads alt **2.08** bare, **1.82** with the plate alone,
**1.82** with the evasion alone, and **0.20 at a 20% win rate with both**. Each half costs a quarter
of a member and the pair costs nearly two — the third hundred's own `def`-plus-wall finding and
chapter 23's "a pairing beats either half pushed further", one rung up.

⚠️ **"Is it ours" had to be re-run and it came back first and second of fourteen.** Each candidate
held to the magnitude that costs monster-ref about one member, as a change on each crew's own
calibrated control, mirror boards so the matrix is off, every arrangement re-calibrated to the
heaviest board it still reads ≥3.75 on: `physicalResist` **1st**, `dodge` **2nd**, `hp` 4th,
`physicalPierce` 5th, `def` and a board-wide `STUN` 7th, `haste` 9th, the Coppice's `atk` × `haste`
**11th**, `atk` 12th, burst **13th**. Worth 0.00 at any value: `magicResist`, `accuracy`,
`energyRegen`. `THORNMAIL` is worth **+0.10** — it leaves the board easier, which is this tower's
seventh reading of that kind.

⚠️ **A second `ascended` anchor grades cleanly over four steps and was rejected on that table, which
is the whole reason the table exists.** Lifting this tower's own two-hundred-floor ration — one
anchor a board and never two — grades **3.90 → 3.00 → 2.30 → 2.05 → 1.77** across a second body from
700/46 to 1300/68, monotone, zero timeouts, and it reads exactly like the Coppice's "the hundred
below is not wrong; the crew meeting it is a different crew". It costs dwarf-ref **−4.00** against
monster-ref's −1.98, **eighth of fourteen**. **A dial that grades is not the same thing as an axis
that is ours**, and weight axes tend to belong to whoever is slowest.

⚠️ **The four new blocks are Dwarves and the faction is a measurement, not a theme.** This is the one
tower with no counter-faction to author into, so the choice falls to the flat spread instead: Dwarf
was its thinnest row at **11.12%** of 1,439 slots against a demon leader at 17.16%. It leaves at
**20.17%** of 1,939, the leader now, over a floor of 12.22%, against bounds of 5% and 25%. ⚠️ **The
first pass ran 22.59%, which is 2.4 points off a ceiling that may never be crossed** — the overshoot
the procedure says to budget for, arriving on a tower that has no lean to overshoot with. Both named
fixes were needed: every non-new Dwarf texture block swapped for a comparable body from another
faction, **and the third carrier rationed to alternate floors** in the two middle bands.

⚠️ **The register check is about a pairing rather than a stat.** Measured before these four joined
the pool: `dodge` sits on **25 of 338** blocks at a median of 0.22 and a ceiling of 0.55,
`physicalResist` on 157 at a median of 0.10 and a ceiling of 0.40, and every value the hundred
authors is at or under the `dodge` median and inside the plate's upper half — it steps past neither
alone. What steps past is carrying them together: **0 of 338 blocks carry `dodge` ≥ 0.15 and
`physicalResist` ≥ 0.15**, and **not one Dwarf block in the game carries `dodge` at all** while the
Dwarves own three of the twelve blocks at plate 0.20 or better.

⚠️ **One board rule, and it is a cliff: the Turnaway never stands beside the Slipfast.** The roof
with those two together reads **35%** for the alternate and **90%** with the Slipfast moved one rank
back — the same board, one body, one rank. ⚠️ **Stated as the pair rather than as "one to a front
rank", which is what the first draft claimed and the mechanical prose check caught**: the hundred
authors exactly one front-rank pairing, the Turnaway beside the Glancework Smith on floors 393–400,
and that is the arrangement the 90% was measured on. Carriers per board run **1 / 2 / 2–3 / 2–3 /
2–3** across the five bands.

⚠️ **The anchor-retirement check was run twice and the first run was wrong in the safe direction.**
Sixteen of the blocks the third hundred fields — **forty-eight pool-wide** — carried no
`gearArchetype`, so they fought **naked** on boards priced as kitted: `THE_UNBITTEN` read a
comfortable 4.00 / 4.00 and reads **2.98 / 1.95** once given one, and `THE_HORNCALLER` 5.00 / 4.00
against **3.83 / 2.00**. All forty-eight have one now and none stood on a geared campaign stage or a
geared tower floor, so the bill was zero — checked rather than assumed. **No anchor retired.**

⚠️ **The roof is the lightest in the game and the alternate is what authored it.** `THE_TURNAWAY` is
**820/58** against `THE_UNBITTEN`'s 1300/76 one hundred floors below, and the reason is the cliff
rather than the usual `perLevel` correction: the same body at 900/62 with each stat stepped one notch
reads **18%** for the alternate where this line reads 83%, and at 980/66 it reads 8%. The hundred
carries **no sustain at all** — of the 58 blocks it fields, zero carry `recovery`, `lifeLeech` or
`healthRegen`, and zero carry a heal, drain or shield effect or a `regen` status. Counted as boards
over floors 201–300 the hundred below reads **43 carrying `recovery`, 15 `healthRegen`, 13
`lifeLeech` and 7 fielding a drain**. ⚠️ **The first draft of that sentence quoted this tower's own
161–300 figures against a 201–300 range** — a claim measured over one range attached to another, the
same failure the "above floor 160" note records, one step smaller. The prose check caught it.

The hundred opens at floor 301 in 7.3 seconds with all five alive, costs the alternate a member from
floor 330 and the reference from floor 350, and closes at **100% / 3.00 / 27.7s against
88% / 1.45 / 32.7s** — zero timeouts anywhere, longest fight 48.6s against a 67.5s bar. ⚠️ **Three of
five is a soft-looking roof and it is the binding arrangement that set it**; the two are 1.55
survivors apart on that board.

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

### The Angel Tower's third hundred: one blow, not four

⚠️ **The Unmending escalates through the _size of one instance of damage_, which is a cadence rather
than a mechanic, and the negatives are half the finding.** Controlled at one anchor plus four
identical bodies at the roof's level, forty seeds, against a **3.98 / 3.80** control — the shipped
register's own median pairing of power 1.35 on a 55-tick cooldown:

| Four bodies at            | reference          | alternate          |
| ------------------------- | ------------------ | ------------------ |
| `magicResist` 0.15 → 0.70 | 4.00 → 3.88        | 3.70 → 3.45        |
| `physicalResist` 0.45     | 4.00               | 3.77               |
| `dodge` 0.30 on a 500 hp  | 4.00               | 3.80               |
| `tenacity` 0.60           | 4.00               | 3.60               |
| hp 1000 / 1400 / 2000     | 3.98 / 3.30 / 3.60 | 3.45 / 3.08 / 2.25 |
| `critChance` 0.26 / 1.10  | 3.73               | 2.13               |
| aim `enemy-highest`       | **4.10**           | **4.05**           |

With damage per second **held constant** and both endpoints inside the shipped cooldown register of
35 to 80:

| Four bodies at     | reference      | alternate      |
| ------------------ | -------------- | -------------- |
| power 1.55 / cd 35 | 4.00           | 3.52           |
| power 2.20 / cd 50 | 3.38 · 93%     | 1.02 · 38%     |
| power 3.10 / cd 70 | **2.33 · 68%** | **0.15 · 13%** |

**Zero timeouts on every row**, and the burst body deals _less_ damage over a fight than the control
does — it basic-attacks between casts. Every Angel heal in the game names `ally-lowest` and is
metered by a cooldown or an energy bar, so a stream of chip is exactly what the choir is built to
answer and a body removed between two heal ticks cannot be healed at all. **A choir can out-heal a
river and cannot out-heal a hammer.**

⚠️ **The licence is margin rather than exclusivity, and that is weaker than the Closing's.** As a
change on each crew's own control — calibrated per crew to the heaviest board still reading ~4.00,
then swapping chip for burst — angel-alt **−2.38**, elf-alt −2.08, undead-alt −1.80, angel-ref −1.35,
demon-alt −1.27, human-ref −1.05, dwarf-ref −1.02, monster-ref −0.63. It costs everybody about a
member and costs the choir two. The other half of the argument is the register: the Angel crews
tolerate far more `atk` before falling than any other five in the game (calibrated at 96 and 88
against 48 to 72 for the rest), which is the same fact read from the other side.

⚠️ **The magic ward came back a second time and was declined a second time.** It looks designed for
this crew — no Angel skill deals physical damage, only the basic attack does, and the two
arrangements carry 0.12 and **0.00** of `magicPierce` — and it is worth 0.10 and 0.35 of five across
its entire range while adding six seconds a board. **A stat that reads as designed for a crew is not
evidence.**

⚠️ **The blow and the aim are a product**, so they arrive a band apart. Four bodies swinging 2.30 at
the front rank read 2.98 · 95% / 1.07 · 57%; four swinging _less_, at 2.10, and naming `enemy-lowest`
read **1.50 · 75% / 0.00**. No board carries more than two of the aimed version and the roof names
nothing but the front rank.

⚠️ **The band is built at the register and only the roof steps past** — the Splintering Yards' shape
rather than the Closing's. The ceiling on a single-target enemy swing is the Covenant Breaker's 2.30
at cd 45 over 215 damage effects whose median is 1.35; at exactly that pairing the blow is already
worth 1.00 and 2.73 of five, and only the roof's own turn at 2.60 goes beyond it.

⚠️ **`haste` is sharper still and was deliberately not spent again.** 126 on the same chassis reads
1.98 · 78% and 0.30 · 20% — but that is the second hundred's axis, its closing band already forbids
three bodies above 126, and both dials at once reads 0.00 for both arrangements.

⚠️ **The collapse check came apart into two questions here, and they gave opposite answers.** The
shipped floor-200 board reads 100% with all five alive at level 95, 100% / 5.00 at 125 and
**73% / 1.60 against 50% / 0.85** at 142 — a collapse — while all nine `ascended` blocks the tower
fields above floor 160 read 100% for both crews at 142 behind three soft bodies, the Unmade at
1800/100 included at 4.33 / 4.38. What fails is the **pairing**: two ascended in one front rank. The
new roof beside `THE_UNANSWERED` at level 142 reads **0%**. So no anchor retired — the second clean
answer after the Closing — and no board in the hundred carries two.

### The Angel Tower's fourth hundred: how often, not how large

⚠️ **The Hairline is the third hundred's question read from the other side, and the two are a
product rather than two dials.** The Unmending escalated on the size of one blow; this hundred
escalates on `critChance`, and the roof's own turn is **1.80 where the hundred below's is 2.60**.
Measured at level 189 in Fine 60 against a **4.00 / 3.79** control — an anchor at 1200/76 behind four
bodies at 640/54, 120 trials — four carriers:

| four carriers at  | reference | alternate | mean fight |
| ----------------- | --------- | --------- | ---------- |
| control           | 4.00      | 3.79      | 39.7s      |
| `critChance` 0.15 | 3.99      | 3.55      | 40.6s      |
| `critChance` 0.22 | 3.97      | 3.02      | 41.3s      |
| `critChance` 0.30 | 3.92      | 2.27      | 43.1s      |
| `critChance` 0.38 | 3.83      | 1.15      | 42.0s      |
| `critChance` 0.46 | 3.76      | 0.48      | 40.4s      |

**Six monotone steps, zero timeouts, and the whole walk costs half a second of fight.** That is what
chose it: `def` 110 is worth 1.18 of the alternate at **54.7s**, `dodge` 0.50 is worth 2.54 at
**51.5s**, enemy health 1100 is worth 1.58 at **55.2s**, and this crew's failure mode is the clock —
chapter 25's rule and the Proof House's, on the arrangement they were written for. It grades in
carrier counts as well: **3.78 / 3.76 / 3.54 / 2.84 / 2.47 / 1.10** across zero to five at 0.30.

⚠️ **The size half is flat where the frequency half is not, and that is the whole "is it ours"
argument.** Holding `critChance` at the shipped p90 of 0.15 and walking `critDamageAmp` 0.70 → 1.80
reads **3.58 / 3.58 / 3.08 / 3.07 / 2.94 / 2.14** — four steps inside 0.14 of a survivor, and it
takes 1.80, well past the shipped maximum of 1.15, to be worth what frequency is worth at 0.30.
`critDamageResist` is subtracted from an attacker's `critDamageAmp` and says nothing at all about how
often a crit lands, and **the two Angel arrangements are the only two of fourteen in the game
carrying a point of it** — 0.76 and 0.96 summed across five, against **0.00** for the other twelve.
The stat that would refuse the frequency, `critBlock`, sits at **0.06** across five here against the
Dwarves' 0.23 and 0.28. **The crew answered the wrong half.** The Monster third hundred's
"answered with the wrong stat", on the one crew that owns an answer at all.

⚠️ **The licence is exclusivity on the _binding arrangement_ and nothing at all on the other one, and
no earlier hundred has recorded that shape.** Cross-crew at 0.30 / 0.85, each of the fourteen
calibrated to the heaviest board it still reads at or above 3.75 survivors: **angel-alt 2.90**,
undead-alt 1.39, dwarf-alt 1.16, dwarf-ref 1.06, human-ref 0.84, undead-ref 0.83, monster-ref 0.79,
**angel-ref 0.79**, human-alt 0.66, elf-alt 0.63, elf-ref 0.61, monster-alt 0.58, demon-alt 0.55,
demon-ref 0.52. First by more than double over second — and **eighth for this tower's own other
five**, which is the tower's opposite-axes split read from a third side. Every board here is sized
against the alternate exactly as the third hundred's were.

⚠️ **It is not the Elf Tower's lock repeated, and the register check is what separates them.** That
hundred built on `critChance` because an Elf five carries **zero** `critDamageResist` and **zero**
`critBlock`, so any crit works there; at band 4 elf-alt ranks **tenth of fourteen** on this axis and
elf-ref **eleventh**. Same stat, opposite reason, and the answer changed because the crew gained a
rung and a kit — "re-run 'is it ours' on the band being authored" arriving on a stat rather than on a
mechanic.

⚠️ **The band is built at the register and only the roof steps past.** Over the **342** blocks
shipped before this hundred, `critChance` ran a median of 0.09, a p90 of 0.15 and a **maximum of
0.22**; `critDamageAmp` 0.70 / 0.85 / 1.15. The three new legendaries carry 0.22, 0.22 and 0.20 at
amps of 0.85, 0.80 and 0.85 — no number the game had not already fielded — and only `THE_HAIRLINE`
carries 0.30. At the ceiling exactly the axis is **already worth 1.66 of five** to the binding
arrangement, which is what licenses the step. ⚠️ **The register quoted is the one measured against,
before the hundred's own four landed** — shipping them takes the pool's maximum to 0.30, so a header
quoting the post-authoring figure would be claiming a band built at a ceiling the band itself created.

⚠️ **The band claim is bodies per board rather than an absolute**, because `critChance` sits on all
342 shipped blocks and "the crit arrives in band 3" would be false the day it was written. Bodies at
0.15 or above run **1–2 / 2–3 / 2–4 / 3–4 / 2–3** across the five bands; the closing band is lower
than the one below it because it trades voices for the roof's own 0.30.

⚠️ **Four anchors retire, which is the most any hundred in this project has retired — and the gear
ramp is most of why.** Fielded alone behind four soft bodies at level 189 in Fine 60, the Unmade
reads **3% / 15%**, `THE_UNANSWERED` **8% / 3%**, `THE_LAST_MERCY` — the third hundred's own roof —
**20% / 33%**, and the Ashfall Sovereign 95% / **45%**, which fails the alternate's bar. What survives
reads 100% with 4.00 of five for both crews: the First Cinder at 1350/72, the Wyrdroot Ancient, the
Adamant Colossus, the Oathbreaker and the Pale Warden. ⚠️ **The shipped floor-300 board carried to
floor 400 reads 0% for both arrangements**, against the 73% / 50% the same check gave a hundred below
on a naked board. **State whether the board under a retirement check is wearing gear.**

⚠️ **The front rank is sharply non-linear here and the roof is one slot from unwinnable.** Moving the
Cinderflaw Prover from the roof's back rank into the front beside the Hairline takes the alternate
from **92% to 0%** with nothing else changed, and putting the Riftedge Cantor behind it instead of a
light body reads **3%**. The shipped roof closes at **100% / 3.99 for the reference and 98% / 2.96 for
the alternate**, zero timeouts.

⚠️ **The prose check moved five blocks off the boards rather than only a sentence.** The first pass
drew its light Demon texture from the Bloodpact Fiend and its heavy from the Covenant Executor, the
Covenant Breaker, the Ruinwing Devourer and the Unsealed Wretch — every one of which carries a `drain`
or a point of `lifeLeech`, which this tower forbids above floor 160 — and all five were fielded above
floor 300 until the script said so. **A prose check can be a board bug, not a wording bug.** The
hundred's own counts, stated as counts: no board over 301–400 carries a `heal`, a `drain`, a `regen`
status or a point of `lifeLeech`; **51 carry `recovery` and 22 `healthRegen`**, against 111 and 29
over floors 161–300, all on the four surviving anchors.

### The Demon Tower's second hundred: scope, not size

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

### The Demon Tower's third hundred: the edge that finds nothing

⚠️ **The Long Amen escalates through crit denial, and it is the first axis that attacks the stat the
crew is named for.** The two swept Demon arrangements carry `critChance` **Σ1.21 / Σ1.43** (x̄ 0.242
and 0.286) and `critDamageAmp` **Σ4.50 / Σ5.05**, against the Elf five's 1.03 / 3.67 and every other
crew in the game at or under 0.77 / 3.40. Controlled at one anchor plus four identical bodies at the
roof's level, forty seeds, against a **4.00 / 3.92** control:

| Four bodies at                  | reference | alternate |
| ------------------------------- | --------- | --------- |
| `critBlock` 0.16                | 4.00      | 3.75      |
| `critBlock` 0.24 — the register | 4.00      | **3.33**  |
| `critBlock` 0.40                | 3.98      | **2.85**  |
| `critBlock` 0.50                | 4.00      | **2.50**  |
| `critDamageResist` 0.32 — reg.  | 4.00      | 3.73      |
| `critDamageResist` 1.10         | 3.98      | 2.92      |
| both, 0.40 + 0.75               | 4.00      | **2.42**  |

**Zero timeouts on every row**, fights 7.1s to 13.5s. ⚠️ **`critDamageResist` is much the weaker
half** — it needs three times its register to reach what `critBlock` does at 0.40 — so no board is
built on it alone.

⚠️ **The count matters more than the size until the register is reached.** At the register pair, by
how many of four carry it: 3.77 → 3.77 → 3.67 → **3.33** → 3.35. That is this tower's own
second-hundred thesis arriving on the other side of the board: the second hundred found a Demon five
is answered board-wide in what a board _does_, and the third finds the same about what a board _is_.

⚠️ **`core/battle/damage.ts` licenses this closing a door outright, and it is the only lock that
may.** Crit chance is `critChance − critBlock` clamped at zero, and the comment there says why: _a
hit that never crits still kills, so a crit-immune archetype cannot stall a battle the way an
unhittable one could._ Compare `MAX_RESIST`, which exists precisely because resist **can** reach
zero damage.

⚠️ **The first control measured the whole axis as inert, and the control was the bug.** Four bodies
at 780/**68** also read 4.00 / 3.92, and on that board the entire grade from `critBlock` 0.10 to full
crit immunity spans 4.00 to 3.92 — nothing at all. Both controls sit at ~4.00 and only one has
anywhere to fall: a Demon five loses its glass cannon to anything and its other four to almost
nothing, so **4.00 is a plateau rather than a midpoint**. This is the Seedfall's saturation trap
arriving from the opposite end — that one saturated at 2.00 and this one at 4.00. ⚠️ **Confirm the
control's survivor count actually moves under a heavier board before trusting a flat row.**

⚠️ **"Is it ours" comes back the sharpest it has for any tower.** As a change on each crew's own
control — calibrated per crew to the heaviest board still reading ~4.00, then the pair at 0.40 and
0.32: demon-alt **−1.25**, demon-ref −0.35, elf-ref −0.30, elf-alt −0.15, undead-alt −0.13,
undead-ref −0.05, human-alt −0.02, and **0.00 for every Human, Dwarf, Monster and Angel arrangement
swept**. The Elves are the only other crit-heavy roster and lose a quarter of what the Demons do.

⚠️ **The band is built at the register and only the roof steps past** — the Splintering Yards' shape.
The ceilings are the Edgeturn Warden's `critBlock` **0.24** over 44 blocks carrying any and
`critDamageResist` **0.32** over 27; the three new legendaries run 0.16 / 0.20 / 0.24 and
0.25 / 0.28 / 0.32, and only `THE_UNFALTERING` goes beyond at 0.34 and 0.52.

⚠️ **The Unison retires, and it is the tower's own _roof_ that had to go rather than its heaviest
body — the first time the collapse has come apart that way.** The shipped floor-200 board reads 100%
with all five alive at level 95, 100% / 4.78 at 125 and **33% / 0.53** at 142. But behind light
support at 142 the **Hollow Seraph at 1760/99 reads 100% / 3.83** while **The Unison at 1720/92 reads
98% / 0.23**: what fails is not weight but the board-wide turn the second hundred was built on,
against the glassier arrangement. Both stop at floor 200 and the new hundred fields neither.

⚠️ **"No board carries two `ascended` blocks" survives a whole rung of investment.** At 142 against
the band-3 crews, Hollow Seraph beside The Unison is **0% / 0%**, beside the Barrow Sovereign
100% / **5%**, beside the Wyrdroot Ancient 100% / **8%**. No board in the hundred pairs any.

The roof closes at **100% / 3.88 / 9.8s** against **90% / 1.60 / 18.7s**. ⚠️ **The axis carries it
rather than riding along**: the same five bodies with both stats stripped to zero read 100% / 4.00
and 100% / 3.65, so the refusal is worth 1.2 of five on the last floor.

### The Demon Tower's fourth hundred: the wall a pierce cannot pierce

**The last hundred of the tower system**, and it is built on the one mechanic two towers had already
measured and put down. This tower's own second hundred declined a magic ward on **size** — at the
shipped ceiling of 0.14 it was worth 0.00 to the reference five and 0.54 to the alternate — and the
Angel Tower's fourth hundred measured it again on its own crew and declined it again, at 0.10 to 0.35
of five across 0.15 → 0.70. The Undead Tower's fourth found it landed within a second of `def` and
`hp` and called it that tower's own third-hundred axis wearing a new stat. ⚠️ **All three are still
right about what they measured, and the refusal still expired.** Three further hundreds of blocks took
the ceiling from 0.14 to **0.26** and the crew gained a rung and a kit, and at band 4 the same stat is
the sharpest axis in the project. **A refusal on size is a claim about a curve, and the curves move.**

Measured at level 189 in Fine 60 before a floor was authored, against a control of one anchor
(1100/76) plus four bodies (580/64) reading **4.00 / 3.98**, forty seeds, four carriers:

| `magicResist`        | reference | alternate |
| -------------------- | --------- | --------- |
| 0.10                 | 4.00      | 3.95      |
| 0.18                 | 4.00      | 3.80      |
| 0.26 — _the ceiling_ | 4.00      | **3.70**  |
| 0.34                 | 3.98      | 3.38      |
| 0.42                 | 4.00      | 2.98      |
| 0.50                 | 4.00      | **2.85**  |
| 0.58                 | 4.00      | 2.55      |
| 0.66                 | 3.95      | 2.27      |
| 0.74                 | 3.92      | **1.95**  |

**Nine monotone steps, zero timeouts on every row**, fights 7.3s to 15.1s. ⚠️ **The reference five
moves 4.00 → 3.92 across the whole grade**, so every board is sized against the **alternate** — the
third hundred's answer again.

⚠️ **It is ours by the damage formula rather than by the stat names, which is the second time reading
`damage.ts` chose an axis.** `effectiveDefence` returns `def × (1 − pierce)` and `resistedShare`
multiplies by `1 − resist` **afterwards**, so a pierce never touches a resist. The two Demon
arrangements carry **nine and seven magical damage effects and zero physical** — their only physical
damage in the game is the basic attack, where the Elf, Human, Dwarf and Monster crews carry **zero
magical effects at all** — and they hold the game's largest `magicPierce` at Σ0.30 and Σ0.25 against
Σ0.15 everywhere else. **The crew built to open armour has no answer whatever to the wall that is not
armour.** That is the Monster third hundred's finding — the pierce crew meeting the resist it cannot
pierce — mirrored onto the other damage type and the other faction.

⚠️ **The cross-crew licence is the widest of the twenty-one hundreds.** Each of the fourteen
arrangements calibrated to the heaviest board it still reads at or above 3.75 survivors, then four
carriers at 0.45: **demon-alt 1.15**, undead-ref 0.82, undead-alt 0.52, **demon-ref 0.38**, angel-alt
0.15, elf-ref 0.08, elf-alt 0.05, dwarf-alt 0.02, and **0.00 for every Human, Dwarf, Monster and
Angel-reference arrangement swept**. Nine of fourteen at or under 0.15. ⚠️ **The licence is over the
_binding_ arrangement** — first by 40% over second place, with the tower's other five only fourth —
which is the Angel Tower's shape rather than the Monster Tower's.

⚠️ **The pairing is _worse_ than the half, which runs chapter 23's finding backwards.** Adding
`physicalResist` at the same size reads demon-alt **0.95** against `magicResist` alone's 1.15, and it
lifts every physical crew off 0.00 — monster-ref 0.85, dwarf-alt 0.97, dwarf-ref 0.73, elf-ref 0.68.
So the pair grades harder in the abstract and **dilutes the licence to nothing**. Chapter 23 measured
both resists at 0.20 worth 1.78 where `magicResist` alone at 0.30 read 0.32, against a mixed party;
here the party is not mixed. **Test the pairing and accept the answer in whichever direction it
comes.** No block authored here carries a point of `physicalResist`.

⚠️ **A ward is a share of the board rather than a stat on a body, and that is what set the board
shape.** Holding the total at 0.50: spread over four soft bodies it reads **3.00** for the alternate,
concentrated on the anchor 3.75, and on two heavy front bodies 3.73 — the party has to chew through
every body and each one taxes for the whole time it stands. ⚠️ **But a _lone_ carrier prices where the
party is aiming** — one body in the front rank is worth 0.31 of five and the identical body in the back
**0.00**, carried on one body as chapter 22 demands. So the carriers stand in front and the escalation
is how many there are.

⚠️ **The count is the weaker dial here, which inverts this tower's own third-hundred thesis.** At 0.30
the carrier counts read 3.98 / 3.90 / 3.83 / 3.80 / 3.63 across none to four — a span of 0.35 — where
the size at four carriers spans **2.05**. The third hundred found the opposite about its own axis, so
the bands escalate in **which** voices are present rather than how many: the Warden alone (0.34), the
Warden and the Canon (0.44), the Warden and the Keeper (0.52), all three, and all three with the weight
shed under them.

⚠️ **Two axes were measured and rejected, and the negatives are half the deliverable.**
`attackSpeed` is carried by **0 of 346** shipped blocks and grades six monotone steps on the reference
five — 4.00 / 3.88 / 3.75 / 3.35 / 3.10 / 2.85 / 2.10 across 0 → 130 — while adding only **2.6 seconds**
of fight. Cross-crew it costs angel-alt **4.00**, dwarf-alt 3.88, angel-ref 3.42 and undead-alt 3.25,
putting demon-alt **eighth of fourteen** and demon-ref tenth. **A speed tax belongs to whichever crew
is slowest**, which is the Monster Tower's warning about weight axes wearing a new stat; **an empty
register is a licence to measure, never a licence to author.** And `atk` at 100 — inside the shipped
register — costs demon-ref **1.65, fourteenth and last of fourteen** while wiping five other crews
outright. Against the same control `tenacity` is **flat** (3.85 / 3.92 / 3.95 across 0.30 → 0.85),
`magicPierce` 0.00 to 0.08, `energyRegen` **0.00**, `lifeLeech` 0.13, and `physicalResist` spans 0.06 to
0.46 over 0.15 → 0.60.

⚠️ **Four anchors retired, and the geared check is far harsher than the naked one a hundred below.** The
shipped floor-300 board carried to floor 400 reads **0% for both arrangements**, where that same board at
its own floor reads 100% with all five alive — the Angel Tower's finding, confirmed on a second tower.
Behind four light bodies at floor 400: The Unison **0% / 0%**, the Unmade 70% / **0%**, the Hollow Seraph
78% / **3%**, and **The Unfaltering — the hundred below's own roof — 100% / 5%**. What survives is
lighter and older: the Wyrdroot Ancient (1300/78) 100% / 4.38, the Colossus (1250/88) 100% / 4.15, the
Barrow Sovereign (1350/84) 100% / 98%. The Unbitten (1300/76) sits **exactly on the alternate's bar** at
100% / 75% and is fielded only below floor 360. ⚠️ **"No board carries two `ascended` blocks" survives a
second rung of investment**; with four of the tower's five heavy anchors gone, the new Silentvault
Keeper (980/58, `magicResist` 0.52 — the deepest ward any legendary in the game carries) is what a late
board anchors on instead.

The roof is The Unhearing (1340/74, ward 0.60) over a Hushglass Warden, a Zenith Chorister, a
Shardlight Acolyte and a Vaultlight Censer: **100% / 3.85 / 9.5s** against **83% / 1.90 / 15.3s**.
⚠️ **The axis carries the last floor rather than riding along** — the same five with the roof's ward
stripped read 100% / 4.00 and 100% / **3.63**, so the refusal is worth **1.73 of five** on the top floor
of the tower system. ⚠️ **And the roof was settled on its attack rather than its weight**, chapter 20's
rule for the third time on a roof: held at 1340 hp the alternate reads 33% at `atk` 88, 55% at 80,
**83% at 74** and 98% at 64, while held at `atk` 68 it reads 90% at 1500 hp and 95% at 1140. Its escort
may carry exactly one of the other three new blocks — the Warden 83%, the Canon 75% _on_ the bar, the
Keeper **73%** under it, and any two together **18% with 0.23**.

Every floor of 301–400 was swept individually against both arrangements rather than only the stride:
worst reference **100%**, worst alternate **83%** at the roof, **no floor times out**, longest fight
**25.3s** against a 67.5s bar.

⚠️ **The strong sustain absolute is sayable here and only here.** Over floors 301–400 **no board carries
a `heal`, a `drain`, a `shield`, a `regen`/`barrier`/`aegis` status, or a point of `lifeLeech`,
`recovery` or `healthRegen`** — against 26 boards carrying `recovery` and 36 carrying `lifeLeech` over
floors 201–300. Five towers have shipped a false sustain claim and every previous fix was the sentence;
this is the first hundred that could make the absolute, and only because the four retired anchors were
where nearly all of it sat. ⚠️ **It was still false on the first pass** — the Sealward Custodian
(`recovery` 5 plus an `aegis`) and the Seedlight Keeper (an `aegis`) stood on fourteen boards until the
prose check said so, **and the fix was the boards.**

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
- ⚠️ **Check a stat's shipped register before building a band on it — and re-check it later, because
  a refusal on _size_ expires as the register grows.** A magic ward was the obvious Demon axis from the
  second hundred onward: Demons are the only faction with **zero physical damage skills** (nine magical
  and zero physical on the alternate five, seven and zero on the reference; Undead next at six and
  four) and **no stat counters `magicResist`** — a pierce reduces `def` and a resist is applied
  afterwards untouched. It was declined **twice**, both times on size: at the shipped ceiling of 0.14 it
  was worth 0.00 / 0.54 to the Demon crews at the second hundred, and the Angel Tower's fourth hundred
  measured it again on its own five at 0.10 to 0.35 across 0.15 → 0.70 and declined it again. ⚠️ **The
  Demon fourth hundred took it, and both refusals were right about what they measured.** Three further
  hundreds of blocks moved the ceiling to **0.26** and the crew gained a rung and a kit; re-measured at
  band 4 it grades **nine monotone steps** (3.95 → 1.95 across 0.10 → 0.74) and reads first of fourteen
  cross-crew with **nine arrangements at or under 0.15**. At the register it is still worth 0.03, which
  is the earlier refusal reproduced exactly. **A recorded "declined on size" is a claim about a curve,
  and the curves move.**

### The fifth hundred — the Human Tower's Ironpace

- ⚠️ **"Is it ours" can come back _no_ for every candidate, and that is a finding rather than a failed
  search.** Ten stat candidates and three pairings were priced at the Human Tower's fifth hundred across
  all fourteen shipped arrangements, each crew calibrated to the heaviest control it still reads ≥3.60
  on. **Every one ranks the binding Human arrangement between fifth and eleventh of fourteen**: `def`
  110 costs undead-alt 4.00, dwarf-ref 3.60 and human-alt **1.88**; `dodge` 0.30 tops out at dwarf-ref
  3.40 against human-alt 1.60; `attackSpeed` 55 costs angel-alt and both Dwarf fives 3.90–4.00 against
  human-alt 2.15. **The Humans are the balanced faction — mid-table on every defensive register — and
  the price of being balanced is that no lock is exclusively theirs.** The hundred took its axis on
  **margin rather than exclusivity** and says so; that distinction is the Angel third hundred's, and
  this is the first hundred to have to take the weaker half knowingly.
- ⚠️ **An axis can be a _pairing whose halves each belong to somebody else_, chosen on fight length.**
  `def` alone walks the control from 19.2s to **36.1s** for 2.88 survivors — the ninety-second clock's
  direction — and `haste` alone is that tower's own third-hundred axis, already spent. Carried
  **together** the same difficulty reads **26.1s**, and the pair grades in carrier counts as well as in
  size: 0.90 / 1.55 / 1.98 / 2.50 / 3.18 across one to five carriers, zero timeouts. A body that is hard
  to kill _and_ spends the time it buys converts weight into deaths where armour alone converts it into
  seconds.
- ⚠️ **A register claim can be about the _pairing_ while each half stays inside its own.** Across the
  350 shipped blocks `def` runs a median of 26 to a ceiling of **70** and `haste` a median of 96 to a
  ceiling of **152**, and nothing in the hundred passes either — but **0 of 350 blocks carry `def` ≥ 60
  _and_ `haste` ≥ 116**, and 1 of 350 carries 50 with 110. The Undead fourth hundred's register shape,
  on a different pair.
- ⚠️ **A gear ramp that continues across an extension steps _down_ at each grade boundary, so the band
  after one opens heavier.** Floor 400 wears Fine 60 at +65.7% health on a `tank` and floor 401 wears
  Masterwork 1 at **+20.2%**; floor 467 wears Masterwork 80 at **+108%** and floor 468 wears Relic 1 at
  **+25.8%**. Both bands are authored heavier than the band they follow — the campaign's "a band that
  adds a lock opens heavier, not lighter" rule, with a grade boundary in place of the lock.
- ⚠️ **"An anchor retires" needs the floors it retires _from_.** Four retire from this hundred's closing
  bands — `THE_HOURLESS_MARCH` 53% / **0%**, `THE_DEATHLESS_MARSHAL` 93% / **8%**, `THE_GRAVEWRIGHT`
  100% / **10%**, `BARROW_SOVEREIGN` 100% / **45%** at floor 500 — while `TYRANT` at 1550/96, heavier
  than three of them, reads 100% / 3.02 and stands. But the Gravewright and the Sovereign **anchor
  boards in the opening two bands** and read 100% with five alive there, twenty-five levels lower.
  **Say which floors a retirement is about**, or the claim retires a block from content it is fine on.
- ⚠️ **The stride nearly shipped seven broken floors, for the second time.** Sampling every fourth floor
  plus the mini-bosses read the hundred clean while **f458, f462, f465, f466, f491, f494 and f495 failed
  between the samples** — all the lieutenant's boards, and f466 the floor wearing the ramp's heaviest
  set. The lieutenant then needed settling across **all twenty-seven** of its appearances, not four: its
  attack came down 58 → 36 with the pair held, failing 6, 4, 3, 2 and 0 boards at 58, 50, 44, 40 and 38.
- ⚠️ **A roof can fail on its own attack with the escort innocent, and the tell is the fight getting
  _shorter_ as the escort lightens.** Nine escort shapes all failed at 1160/60; attack settled it at
  **44** with the escort untouched (60 reads 8% for the binding arrangement, 52 reads 70%, 44 reads 83%
  with 2.00 of five). ⚠️ **This inverts the same tower's fourth-hundred roof finding**, where the escort
  was the whole question and the boss needed no retune. **Take the measurement, not the precedent.**

### The fifth hundred — the Dwarf Tower's Masterworks

- ⚠️ **A tower's own spent axis expires like anyone else's, and the pair built on it is a different
  curve.** Re-measured at band 5 across all fourteen arrangements — each calibrated to the heaviest
  mirror control it still reads ≥3.75 on — `physicalPierce` 0.35 alone costs dwarf-ref **0.50, seventh
  of fourteen**, and dwarf-alt 0.15, where the fourth hundred measured it first and second. What is
  authored instead is the pierce **and** the attack behind it on one body: pierce 0.25 is worth 0.47
  alone and `atk` 46 is worth 0.82 alone, and together they are worth **1.97** — ×1.53 over the sum,
  the super-additivity licence the Monster fourth hundred established, on a pair the damage formula
  explains (`atk² / (atk + def × (1 − pierce))` moves in both terms at once). It grades in value
  (0.98 → 3.88 across six steps) and in carrier counts (3.98 / 3.98 / 3.50 / 2.70 / **1.50** across
  zero to four at 0.25/48), zero timeouts anywhere on the grade.
- ⚠️ **The licence is margin, and the two rows above the Dwarves are a caveat worth recording.** On
  the same fourteen-way table the pair costs **angel-alt 3.72 and angel-ref 2.42** — a hammer is the
  choir's tax (the Angel third hundred's own finding), and an all-Angel mirror is the hardest board
  that crew has by construction, so its calibrated controls sit far heavier than anyone's and any
  attack-shaped candidate tops out there. **Dwarf-ref reads 1.17, first of the twelve mortal
  arrangements**, over elf-alt 1.10 and human-alt 1.03. The Human fifth hundred's shape: say which
  half of the licence you have.
- ⚠️ **Every dial stronger than the pair converts budget into seconds on this crew, which is the
  fourth hundred's finding surviving a rung.** Enemy `hp` 1100 is worth 3.47 of five at 58.6s mean,
  **72.0s max and a 38% win rate**; `dodge` 0.45 is worth 1.94 at **82.9s max** against a crew with
  zero `accuracy`; `def` 110 is worth 1.29 at 51.8s; `physicalResist` 0.30 is worth 0.90 at 46.6s.
  Worth-per-second is nearly constant (~0.17/s) across pierce, attack and their pairs, so what chose
  the pair over plain attack was the cross-crew table (plain `atk` +30% wipes five other crews harder
  than it taxes this one) and the counts grade the bands needed.
- ⚠️ **Crit is dead last of fourteen on the crew with the game's deepest `critBlock`** — dwarf-ref
  0.25 and dwarf-alt 0.05 at `critChance` 0.30 / amp 0.85, against monster-ref's 0.77 — which is the
  Angel fourth hundred's "the crew answered the wrong half" mirrored: this crew answered the right
  one, and the answer holds.
- ⚠️ **The second-anchor ban survives a second rung of investment.** Beside a calibrated anchor at
  band 5, a second `ascended` at 500/40 costs 3.00 of five and one at 650/44 reads **0% / 45%** — a
  cliff on this crew where the Monster crews graded it as a dial, so no board in the hundred pairs
  two. **A dial on one crew is a cliff on another; field the pairing on the crew being authored for.**
- ⚠️ **The rank rule returns at half size when the axis is half output.** A pair carrier in the back
  rank is worth **0.50 more** than the same body in front (3.48 against 3.98, carried on one body as
  chapter 22 demands) — the second hundred's back-rank cliff at half size, where pierce alone measured
  rank-neutral, because pierce is not output and the pair's attack half is. The Long Grain spends it
  deliberately: one carrier stands in the back rank through band 5 while the authored weight eases.
- ⚠️ **Which crew binds flipped between two hundreds of one tower**: the reference five reads lower
  on nearly every row at band 5 where the fourth hundred's alternate bound. Check both, every time.
- ⚠️ **The roof was settled on its attack — the fourth tower roof running** — at 50 it reads **0% for
  both arrangements**, 73% for the binding one at 44 and 100% / 1.68 at the shipped 40; and **the
  axis carries the last floor**: pierce stripped to zero reads 100% / 3.15 against the shipped 1.68,
  worth 1.47 of five and ten seconds of clock. The hundred closes at **100% / 1.68 / 53.7s against
  100% / 2.08 / 53.2s**, zero timeouts anywhere, longest fight **58.2s** against the 67.5s bar.
- ⚠️ **Two retired anchors came back for the opening bands and the tower's own roof did not.** At
  floor 500 behind light escorts the Proof House, the Breachlord and the Crown Wheel all read **0%**
  — the Crownworks collapse a fourth time — while the Warpick Lieutenant, the Proofmark Serjeant and
  the Quenchpit Ironhide stand at 100% / 4.00. The Breachlord anchors floor 410 and the Crown Wheel
  floor 420, twenty-five levels down, exactly as the Ironpace re-fielded the Gravewright; the Proof
  House itself stays retired. **Say which floors a retirement is about.**
- ⚠️ **The lean's first pass came out legal for the first time in this tower's history — 67.6%,
  shipped at 67.0% — and it is a property of the axis rather than of discipline**: hot, light
  carriers want the Monster tank-and-texture pool from the first draft. The tower closes at
  **62.87% Human over 2,459 slots**. Budget for the overshoot anyway.

### The fifth hundred — the Elf Tower's Trip-Hammers

- ⚠️ **A tower's own axis can be re-authored from the other end, and that is what "building on the
  hundred below" looks like when the mechanism is understood rather than merely measured.** The
  fourth hundred found that nothing but throughput moves an Elf five, and said why: _attack only
  bills for as long as the body carrying it lives_, proved on a Colossus that reads 4.00 of five
  alone at 1250/88 because its `haste` is 58. The fifth authors the same attack **arriving earlier**.
  Priced at level 236 in Relic 40 against the roof's own escort shape, forty seeds, zero timeouts:
  `atk` 38 alone is worth 0.00 / **1.03** of five, `haste` 108 alone 0.00 / **0.03**, and the two
  together **0.20 / 2.03** — ×1.93 over the sum of the halves. It grades in size (alt 3.98 / 3.50 /
  2.00 / 0.72 across 30/h96 → 42/h112) and in carrier counts (4.90 / 4.65 / 3.67 / 0.55 across zero
  to three).
- ⚠️ **`haste` alone being worth 0.03 is the whole shape of the axis.** A body that swings often and
  cannot hurt anybody is a body this crew ignores; a body that hits hard and slowly is one it removes
  before the second swing. Neither half is a lock and the product is.
- ⚠️ **The axis this session set out to build measured inert, and the negative is the more useful
  result.** Crit denial looked certain on the register: both swept Elf arrangements carry crit on
  **all five members** (Σ1.03 / Σ3.67 and Σ1.08 / Σ3.80 of chance and amp), the deepest such stake any
  party in this game has, against chapter 23's rule that a lock is worth what the party staked on what
  it denies. Measured, **complete immunity — `critBlock` 0.36 with `critDamageResist` 0.90 — is worth
  0.05 of five to the binding arrangement and 0.00 to the reference**, and buys one second of fight.
  **Chapter 23's rule is about a mechanism, and crit here is a 13% throughput bonus.** Expected damage
  is `1 + chance × amp` = 1.153, so denying all of it is a 13% cut on a control clearing in ten
  seconds. **Check whether what the party staked is a mechanism or a margin before pricing its
  denial.**
- ⚠️ **A refusal recorded on size expires on this tower too, and it expires into the one tower that
  can afford it.** At band 5 `def` 110 is worth 0.38 / **2.85**, `physicalResist` 0.40 0.38 / **2.70**
  and `dodge` 0.50 0.77 / **3.25** — the fourth hundred measured all three inert. What makes them
  _unauthorable everywhere else and merely expensive here_ is the clock: the same `def` 110 costs
  dwarf-alt 3.90 at **66 seconds** and elf-alt 2.85 at 27. **State the seconds beside the survivors;
  a refusal stat is a different mechanic on a crew that clears in ten seconds.**
- ⚠️ **The licence is margin rather than exclusivity and the margin is thin.** On the fourteen-way
  table — each crew calibrated to the heaviest mirror control it still reads ≥3.75 on — the pair puts
  **elf-alt fourth of fourteen** (3.95) behind angel-alt 4.00, dwarf-alt 3.98 and angel-ref 3.98, with
  elf-ref eleventh. The fourth hundred's own pair (`atk` × `hp`) re-measured at band 5 puts elf-alt
  fifth and elf-ref **thirteenth of fourteen** — the Undead Tower's "re-run 'is it ours' on the band
  being authored" firing again.
- ⚠️ **`attackSpeed` grades hard here and still is not this crew's**, which reproduces the Demon
  fourth hundred's finding exactly: 80 points is worth 1.13 / 3.88 and costs **angel-ref and angel-alt
  4.00 apiece**. An empty register is a licence to measure, never a licence to author.
- ⚠️ **The anchor-retirement check came back completely clean, which no hundred's had before.**
  Fielded alone behind four 300/18 commons at floor 500 in Relic 40, **every one of the fourth
  hundred's blocks stands**: the Grudgekeeper at 1520/89 reads 98% / 2.63 against 90% / 2.58, the
  Colossus 100% / 4.00, the Platewright 100% / 3.90 — where two of this tower's own roofs retired one
  hundred floors below. **A band boundary hands the crew a rung (×1.6) and twenty-four levels where
  the boards gain forty-seven, and ×1.6 outruns `perLevel.ascended`.** Expect the check to come back
  clean at a boundary that is also a rung, and run it anyway.
- ⚠️ **The board budget still falls, and what bounds a board is its hot bodies rather than its
  weight.** Floor 400's shipped board carried to floor 500 reads 100% / 2.40 against **3% / 0.05** —
  past the alternate's bar — and floor 350's reads **0% for both**, because floor 350 carries four
  bodies at `atk` ≥ 62 and floor 400 carries two. Floor 350 is 375 health _heavier_ and the gap
  between them is composition.
- ⚠️ **`SLOW` is a lock on this crew rather than texture, which is the second hundred's Cairn Sentinel
  note priced at depth.** The status multiplies `haste` by 0.7 and an Elf five carries the highest
  `haste` in the game (Σ580 / Σ620), so three carriers applying it took the binding arrangement to
  **0% at every roof attack from 28 down to 12**, where the identical board without it clears at 83%.
  None of the four new blocks carries it but the roof, and the boards carry it on **30 of 100** with
  one fielding two, against the fourth hundred's **62 of 100** with 18 fielding two and a peak of
  three. ⚠️ **The absolute form of that claim — "one floor, the roof" — was written first and was
  false**, because eight returning blocks apply it; the prose check is what caught it. **A status
  whose stat is the crew's identity is never texture, and the claim about it is a count.**
- ⚠️ **The roof was settled on its attack — the fifth tower roof running.** At `atk` 28 it reads 3%
  for the binding arrangement and at the shipped **24** it reads 100% / 3.80 against **83% / 2.00**;
  and the axis carries the floor rather than riding along — the same board with its carriers' `haste`
  dropped to 90 reads 4.00 and 4.03, so the beat is worth **0.20 of five to the reference and 2.03 to
  the alternate** on the top floor. At **1180/24** the Great Helve is the lightest roof anchor on
  attack any tower hundred has shipped; the roofs now read 1180/24, 1140/40, 1160/44, 1200/52, 820/58,
  1240/68, 1240/74, 1300/84, 1320/82, 1440/86, 1540/92 and 1560/91 — a list, because the superlative
  has gone stale twice.
- ⚠️ **A substitution pool has a second constraint when the band table is counted in a stat, and the
  first pass missed it.** The lean overshoot (88.8% Dwarf, taking the tower to 68.24% against a 65%
  ceiling) is corrected by swapping texture for monster, angel and demon bodies — and the light
  commons of those three factions are **fast** (104 to 126). Fielded as texture they count as carriers
  and **flattened the band table to three on every board of every band**. Drawing the substitutes from
  the slow tail of the same three factions restored 1 / 1–2 / 2 / 2 / 3 / 2–3. **Check a substitute
  against the stat the band table is counted in, not only against its faction and its weight.**
- ⚠️ **The same pass broke the one-board-wide-turn rule, and a generated hundred will break it every
  time.** The draft came out at a mean of 1.46 bodies a board carrying an `enemy-all` or row turn,
  with 45 boards over one and a peak of **four** — which is exactly the arrangement this tower's third
  hundred measured at 0% — against the shipped third and fourth hundreds' 0.62 and 1.03. Capped at two.
  **Count the voices per board mechanically; nobody reads a hundred boards and notices.**
- ⚠️ **The hundred makes the strict sustain claim and it cost four blocks.** Of the 43 blocks it
  fields, **zero** carry `lifeLeech`, `recovery` or `healthRegen`, a heal, drain or shield effect, a
  `regen`, ward or guard status, or a taunt. The Colossus and the Rimeplate went for `recovery`, the
  Riven Marchwarden for both, and the Edgeturn Warden for its taunt — all four fielded freely one
  hundred floors below, and all four still fielded there.
- ⚠️ **The closing five floors are pinned rather than composed**, because the returning pool puts
  1060/80 next to 720/70 and at these levels that reads as a saw. Measured one at a time so the
  alternate falls into the boss: 4.40 → 4.03 → 3.85 → 2.55 → 2.00. The tower closes at **63.60% Dwarf
  over 2,459 slots**, and the hundred's longest single attempt is **45.2s** against the 67.5s bar.

### The fifth hundred — the Undead Tower's Thicket

- ⚠️ **A crew's whole vocabulary can collapse to one curve, and then the cross-crew table cannot pick
  the axis.** At band 5 an Undead five has no answer to anything: held at equal nominal damage,
  `attackSpeed` 130, `haste` 160–190, `atk` ×1.5 and enemy crit at ×1.88 expected damage all read the
  same **2.00 / 0.00** against the hundred's two controls, and every one of them ranks undead-alt
  **first of the twelve non-Angel arrangements**. That ranking is a fact about the crew rather than
  about any stat. It is the exact inverse of the Human fifth hundred's problem — there nothing was
  theirs because that crew is balanced; here everything is, because that crew is the most fragile
  mortal arrangement at this band. **Both cases end the same way: the axis is chosen on something the
  table cannot see.**
- ⚠️ **What chose it is fight length, and an empty register is what stops it being the hundred below
  shipped twice.** `attackSpeed` sat on **0 of 362 shipped blocks** — the Demon fourth hundred and the
  Elf fifth both priced it and declined it, correctly, because on those crews it belonged to the
  Angels. Re-priced here it is the _fastest_ spelling of the only curve left: worth about 1.5 of five
  it adds 4.1 seconds where crit adds 4.5 and `atk` adds 4.8, and `def` 110 — the one candidate with an
  **exclusive** licence (undead-alt first of fourteen at 1.85) — adds **12.9** on the slowest crew in
  the game. And because the stat accrues **only when a body's last action was a basic attack**, it is
  `haste` a body has to pay a kit for: every turn in this hundred runs 64 to 84 ticks against a shipped
  median of 55, where The Coppice's run 34 to 40. Same curve, opposite skill shape.
- ⚠️ **It grades in size and in carrier counts.** Against calibrated controls at level 236 in Relic 40,
  four carriers read **3.48 / 3.75 → 2.70 / 1.52 → 2.00 / 0.78 → 2.00 / 0.00** across `attackSpeed`
  0 / 55 / 90 / 130, and by count at 130 read 3.20 / 3.00 / 2.00 / 2.00 and 3.42 / 2.17 / 0.95 / **0.00**
  across one to four. Zero timeouts on every row.
- ⚠️ **Which arrangement binds depends on what is being measured, and the two answers are opposite.**
  On the isolated axis grade the **alternate** collapses (0.00 at four carriers where the reference
  reads 2.00); on the shipped boards the **reference** binds on almost every floor, because those
  boards carry real weight and the alternate does not fall to weight. Weight breaks one and the axis
  breaks the other — the Angel Tower's split, on a fifth tower. **Check both on every board.**
- ⚠️ **The attack halves and the rate replaces it.** Floor 500's board and floor 400's weigh **exactly
  the same 2,610 health** and carry **188 attack against 238** — the weight barely moves across a
  hundred floors and the attack comes down a fifth on the board and by nearly a half on the carriers
  (74 / 78 / 82 in The Coppice against 44 / 42 / 40 here). Chapter 23's "convert the attack as well as
  the weight" on a tower boundary.
- ⚠️ **The anchor-retirement check came back almost entirely clean, which is what a rung boundary
  should do.** Twelve of the fourteen blocks The Coppice fields at 700 health or more read 100% with
  all five alive alone at floor 500 in Relic 40; only `THE_SEEDFATHER` (83% / 70% at **40 seconds**)
  and `THE_SPRINGWOOD` (95% / 88%) read under bar. The Elf fifth hundred's finding reproduced: a band
  boundary hands the crew a rung and twenty-four levels where the boards gain forty-seven, and ×1.6
  outruns `perLevel.ascended`. **The floor-400 board itself still collapses** — 100% with five alive at
  floor 401 and **0% / 8%** at floor 500 — which is the Crownworks collapse a fifth time on this tower.
- ⚠️ **The lean's first pass came out at 94.8% Elf, the worst overshoot any tower has had, and it is
  structural rather than sloppy.** Three of the four new blocks are carriers and the fourth is the
  roof, all Elven, and they stand on nearly every board: **244 of 500 slots were spoken for before a
  single texture body was chosen.** Corrected during authoring by converting one texture slot at a time
  across every band to Angel, Demon and Monster bodies of matched weight _and attack_, the hundred
  ships at 59.4% and the tower at **60.2%**. **When the axis blocks belong to the lean, the carriers
  alone can spend the whole allowance** — budget for it before choosing how many carriers a board
  carries.
- ⚠️ **A run of four is a run, not a law.** Each of this tower's first four hundreds closed faster than
  the one below — 51.2s, 39.6s, 41.4s, 24.3s — and the fifth closes at **25.0s**, 0.7 slower. The
  fourth hundred had already spent its whole budget on rate and let the weight fall away, so there was
  nothing left to take out. The claim worth keeping is the one underneath: this tower buys its
  difficulty as far from the clock as it can, and 25.0s against a 67.5s bar is what that looks like once
  the weight has gone.

### The fifth hundred — the Monster Tower's Censing

- ⚠️ **"Is it ours" came back _no_ for every candidate except the plate this tower already wears, and
  the reason is structural rather than a failed search.** Thirteen stats and five mechanics were
  priced across all fourteen shipped arrangements at band 5 — each crew calibrated to the heaviest
  **mirror** control it still reads ≥3.75 on — and every one ranks the Monster fives between
  **eighth and fourteenth of fourteen**: `atk` ×1.6 and a crit ramp 13th/14th, a poison 12th/13th,
  `hp` ×2.8 14th, `haste` 190 and `attackSpeed` 120 12th, a second `ascended` anchor 12th, `WEAKEN`
  11th, a board-wide `STUN` 10th, this tower's own fourth-hundred `dodge` 12th. That is the Human
  fifth hundred's finding on a second tower, arriving for the **opposite** reason: the Humans are
  mid-table on every register, and **this crew has no support to lose.** Five near-identical
  attackers with no interdependence means pressure removes them one at a time and nothing cascades —
  which is why its calibrated controls are the lightest in the game (975/68 behind four 488/44;
  794/60 behind four 397/39) and it still loses less to every lock than anybody.
- ⚠️ **A coarse calibration lies, and here it lied about three crews at once.** A ladder of ~10%
  weight steps put dwarf-alt at 3.83 and both Angel rows one notch from collapse, so they topped
  every row of the table by cliffing rather than by grading. Re-running on a **5% ladder** moved
  eight of the fourteen rankings. The Elf fourth hundred's warning, on a fifth tower.
- ⚠️ **The plate's licence has _not_ expired, which is what licensed building on it a third time.**
  `physicalResist` 0.45 on four bodies costs **monster-ref 0.95 (2nd of fourteen) and monster-alt
  0.92 (3rd)** against a field where six arrangements read at or under 0.38 and undead-alt (−0.02)
  and demon-alt (−0.13) read _negative_. The mechanism is the third hundred's, unchanged and read off
  `damage.ts` rather than off the stat names: `effectiveDefence` returns `def × (1 − pierce)` and
  `resistedShare` multiplies by `1 − resist` **afterwards**, so a pierce never touches a resist — and
  this is the only crew built on pierce (Σ0.56 / Σ0.70 against ≤0.15 everywhere else). **A recorded
  licence is a claim about a curve; re-measure it rather than assuming it has gone stale, too.**
- ⚠️ **The new half is a `dot`, and it is the half of the tower's founding sentence never spent.**
  That paragraph names two currencies a leech crew cannot pay in; the third and fourth hundreds both
  bought the same one, because armour and evasion each reduce _damage dealt_ and so starve
  `lifeLeech` at its input. `statusDamage` never re-enters the attack path, so leech returns nothing
  from a poison; the amount is `scaled(applier.atk, power)`, which **bypasses `def` entirely** and
  answers only `resistedShare`; and a Monster five carries **Σ0.00 `magicResist`**. It keeps billing
  after the body carrying it is dead.
- ⚠️ **Both halves are priced in _seconds_, and that is one mechanism rather than two.** Measured on
  the shipped floors by stripping each half in turn:

  ```
    floor   burn worth ref/alt   plate worth ref/alt   shipped ref / alt / mean
    f420        0.00 / 0.00          0.00 / 0.00        5.00 / 4.00 /  8.4s
    f445        0.05 / 0.05          0.00 / 0.05        4.00 / 3.95 / 12.9s
    f467        0.42 / 0.40          0.50 / 0.50        3.45 / 1.93 / 15.1s
    f490        0.20 / 0.43          0.27 / 0.48        2.77 / 1.25 / 17.3s
    f500        0.20 / 0.80          1.02 / 1.62        2.98 / 0.80 / 19.5s
  ```

  ⚠️ **A poison is worth nothing on a crew that clears in eight seconds, and this tower's opening band
  is eight seconds long.** `BURN` lands once in the first twenty floors. The plate buys the seconds
  and the poison bills them: floor 500 with the plate stripped off the four axis blocks reads
  **4.00 / 2.42 at 14.4s / 19.3s** against the shipped 2.98 / 0.80 at 19.5s / 31.2s. **State the
  seconds beside the survivors** — the Elf fifth hundred's rule, arriving from the other side.

- ⚠️ **The licence is over the _alternate_, and the poison cross-crew is not exclusive at all.** It
  ranks monster-alt 13th of fourteen because a dot is a flat tax priced off the applier and **the
  deepest health pool pays it least** (Monster Σ3,650 / Σ3,540 against Elf Σ2,305 / Σ2,180). What
  makes it authorable here is the pairing and the arrangement: on the roof it is worth 0.20 to the
  reference five and **0.80** to the alternate, which is the crew every board on this tower is sized
  against. The Angel fourth hundred's shape — **say which arrangement the licence is over.**
- ⚠️ **A stun is worth 0.00 at every scope but `enemy-all`, and then it is a cliff with nothing in the
  middle.** At two carriers on duration 25: `enemy-lowest` 0.27, `enemy-front` 0.85, `enemy-highest`
  0.90, `enemy-row-front` 0.85 — each of them exactly the plain damage the cast carries, so the stun
  itself is worth nothing — against **1.90 / 2.45** on `enemy-all`. By duration at one carrier it
  reads 0.00 at 15, 0.00 at 25, 1.88 at 35 and a **wipe** at 50. No band can be built on it.
  ⚠️ **A dot's scope table is not a stun's**: the same `BURN` reads **−0.10** on `enemy-row-back`,
  0.65 on `enemy-front`, 0.82 on `enemy-lowest`, 0.90 on `enemy-row-front` and 1.02 wide — so aim past
  the front rank leaves the board easier for the eighth time on this tower, and the wide scope is
  worth about twice the next best rather than everything.
- ⚠️ **Inert or refused at band 5, measured**: `magicResist` 0.50 worth **0.00 / −0.07** (this crew
  deals no magical damage, so a magic wall has nothing to answer — the third hundred's reading
  reproduced two bands up); `tenacity` 0.60 **0.00 / 0.02**; complete crit immunity — `critBlock` 0.30
  with `critDamageResist` 0.90 — **0.02 / −0.02**, because Σ0.22 of chance over Σ3.10 of amp across
  five is an expected multiplier of **1.027**; `physicalPierce` **flat from 0.40 all the way to 1.00**
  at 0.90 / 0.85, because Σ76 of `def` across five is fourth-lowest of the fourteen shipped
  arrangements and there is nothing to open.
- ⚠️ **The retirement check is the harshest any hundred has run — thirteen anchors — and it priced the
  hundred's axis before a board was authored.** All thirteen stand on floors 301–389 and are fine
  there; what they cannot do is 401–500. ⚠️ **The block that stands is the heaviest in the hundred
  below**: the Bonefall Tyrant at **1550/96** reads 100% / 3.38 against 100% / 2.70 alone behind four
  300/18 commons at floor 500, where The Last Mercy at **1520/91** reads 0.00 and 0.00. Thirty health
  and five attack apart, and what separates them is that three of the four blocks reading 0% carry a
  board-wide `BURN` at its shipped power. The floor-400 board carried to floor 500 reads 100% / 1.75
  against **0% / 0.00** — the Crownworks collapse a sixth time, and the alternate again.
- ⚠️ **The prose check found a board bug rather than a wording bug, for the second time in the
  project.** The first pass fielded the Passbell Ringer on three floors — a block that applies a
  **link**, which this tower has forbidden above floor 100 since it measured one — plus the Ashen
  Choir (`recovery` 4 and a barrier, four floors) and the Ebbdrift Latcher (`lifeLeech` 0.12, two).
  Nine slots, three swaps, and nothing in the sweep would ever have noticed because the boards were
  tuned with them on. Of the **42 distinct blocks** the hundred now fields, zero carry any of it.
- ⚠️ **The overshoot arrived exactly where the fourth hundred's did.** First pass 63.2% Angel over the
  hundred and **22.67%** over the tower — the fourth hundred's own first pass was 22.59% — corrected
  by converting one texture slot at a time across every band to the two thinnest rows left. Ships at
  51.2% over the hundred and **20.21% over 2,439 slots**, which makes Angel the leader and drops Dwarf
  from 20.17% to 17.63%. **Budget for it whichever way the faction is chosen.**
- ⚠️ **The roof settled on its attack — the sixth running — but the _health_ came down first and it
  was the bigger move.** At 1100 the roof board reads **0% for the alternate at every attack from 44
  down to 30**, because an `ascended` anchor is fight length and length is what a poison bills; at 900
  the same board grades 45% at `atk` 44, 93% at 40 and 100% / 1.20 at the shipped **38**. At 900/38 it
  is the second-lightest tower roof on health in the game and the third-lightest on attack — behind
  this tower's own Turnaway at 820/58 on the first count. Derived across all thirty-three shipped
  hundred-roofs the list opens 1180/24, 1180/34, **900/38**, 1140/40, 1160/44, 1200/52, 1050/56,
  820/58, 1240/64 and runs up to 1800/100.
- ⚠️ **Three hundreds running on this tower have closed faster than the one below, and the mechanism
  is the boards rather than the trend.** Longest single attempt 48.6s, 47.8s, **33.9s**; board weight
  at floors 300, 400 and 500 is 4,080, 3,260 and **2,740**. The axis is bought by taking weight _out_,
  which is what this tower's third hundred said it would have to be. The hundred opens at floor 401 in
  6.6s with all five alive, costs the alternate a member from floor 409 and the reference from 426,
  and closes at **100% / 2.98 / 19.5s against 80% / 0.80 / 31.2s**, zero timeouts anywhere.

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
