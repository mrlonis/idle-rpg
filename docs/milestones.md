# Milestones

The ordering exists so there is **always something playable**. Each milestone layers onto the
previous skeleton without changing its shape. Do not skip ahead: a later milestone built on an
unverified earlier one is where the hard-to-find bugs live.

Before starting work, check where the project actually is. **Do not assume this document is
current — verify against the code.**

This file is the single source of truth for the roadmap. [`README.md`](../README.md) and
[`AGENTS.md`](../AGENTS.md) link here rather than restating any of it.

---

## Status

| #   | Milestone                               | Status                                         |
| --- | --------------------------------------- | ---------------------------------------------- |
| 1   | Tick loop, one resource, save/load      | ✅ **Complete**                                |
| 2   | Battle up a stage ladder                | ✅ **Complete** — introduced `data/`           |
| 3   | Gacha, roster, ascension, levelling     | ✅ **Complete** — introduced routing           |
| 4   | Team composition affecting combat math  | ✅ **Complete** — introduced formations        |
| 5   | Offline catch-up on resume              | ✅ **Complete** — segmented solver ruled out   |
| 6   | Run on a physical iPhone                | ✅ **Complete** — removed Angular Material     |
| 7   | Auto-battle, then doubling the ladder   | ✅ **Complete** — prestige cancelled           |
| 8a  | The combat rework: the stat block       | ✅ **Complete** — one `atk`, one `def`         |
| 8b  | The combat rework: energy and ultimates | ✅ **Complete** — `mp` and `hp` costs gone     |
| 8c  | The combat rework: skill counts         | ✅ **Complete** — 30 skills, gated by rung     |
| 8d  | The combat rework: lineup bonuses       | ✅ **Complete** — party composition pays       |
| 8e  | Seven characters per faction            | ✅ **Complete** — 49 characters, 3/3/1         |
| 9   | Resonance — levels the roster shares    | ✅ **Complete** — one shared level, derived    |
| 10  | Power that compounds                    | ✅ **Complete** — ×10⁹ levels, enemy levels    |
| 11  | Chapters                                | ✅ **Complete** — 100 stages, income derived   |
| 12  | Gear                                    | ✅ **Complete** — percentage-based, 5 slots    |
| 13  | Settings, and the save-safety gap       | ✅ **Complete** — run reset, first CDK modal   |
| 14a | The ladder retune                       | ✅ **Complete** — closing pressure added       |
| 14b | Achievements, dailies and bounties      | ✅ **Complete** — three faucets, two reminders |
| 15  | Faction towers                          | ⬜                                             |
| 16  | Deep per-hero investment                | ⬜                                             |
| 17  | The roguelite run                       | ⬜                                             |
| 18  | Puzzle maps                             | ⬜                                             |

> **Milestone 14 was two milestones wearing one number, and is now split.** The number was claimed
> twice: once by the planned "dailies, bounties and notifications" entry written long in advance,
> and once — later, in the code and in a section further down this file — by an in-progress ladder
> retune. Both are real and both are written up below as **14a** and **14b**. Nothing above 14 was
> renumbered, because nothing above it had started.

---

These entries record **what each milestone decided and why**, in the shortest form that keeps the
reason recoverable. The systems are explained in the reference docs — [combat](combat.md),
[attributes](attributes.md), [economy](economy.md), [ascension](ascension.md),
[level resonance](level-resonance.md), [gear](gear.md), [saves](saves.md), [glossary](glossary.md) —
and three cross-cutting files carry what used to be spread across these entries:
[rejected](rejected.md) for everything ruled out, [platform](platform.md) for the shell and
accessibility, [testing](testing.md) for the balance sweep. Where any of them overlaps an entry here,
that file is the current statement and this is the history behind it. `AGENTS.md` states the rules;
entries below do not restate them.

**Save versions are not restated.** The chain was re-based to v0 twice; `SAVE_VERSION` is 0 and the
migration table is empty. See [saves](saves.md) and the two re-base entries near the end of this file.

## 1. Tick loop, one resource, save/load — **COMPLETE**

A gold counter that survives a refresh, which proves the architecture end to end: `core/` purity, the
sim/render split, and the save path. Accrues at 10Hz, samples into the UI at ~6Hz, persists through
`@capacitor/preferences`, settles offline earnings in closed form on resume. Underneath it, `Numeric`
wraps `break_infinity` so the numeric type is a one-file swap, the seeded mulberry32 PRNG resumes in
O(1) and derives sub-streams ready for combat, and the save layer carries a migration chain, fixtures
and repair that clamps damage rather than throwing.

Shipped: `core/numeric.ts`, `core/rng.ts`, `core/state.ts`, `core/tick.ts`, `core/save/`,
`core/offline.ts`, `ui/game-loop.service.ts`, `ui/save.service.ts`, `ui/format-numeric.ts`.

## 2. Player-initiated battles up a stage ladder — **COMPLETE**

`simulateBattle(team, stage, seed) => BattleResult` resolves instantly and headlessly into an event
log the UI animates afterwards. Turn order is an ATB gauge rather than fixed rounds, so haste buys
turns instead of just going first. See [combat](combat.md).

- **Combat is not driven by the render tick**, which is what makes 2x/4x/skip and offline resolution
  free — the speed control is one multiplication in the animator, not a second combat path.
- **Combat draws from a derived sub-stream**, so replaying a battle never shifts the gacha sequence.
  Hypothetical until milestone 3; every rework since has kept it.
- **The battle replaces the home screen and has no exit until it ends** — a fight is seconds long and
  can be sped up, and leaving early would discard rewards the player is moments from collecting.
- **Clearing a stage raises idle income permanently, and that is the real reward.** A run starts at
  `goldPerSec: 0`, which is what makes the first battle the only thing worth doing.
- **The result is applied when the animation finishes, not when the battle resolves** — applying it
  up front announces the outcome before the first blow lands. The cost is that a reload mid-animation
  pays nothing, acceptable because the player watches every fight, and auto-battle did not invert it
  because that loop is foreground-only too.

Targeting was deliberately naive — the living opponent with the least HP — until milestone 4 gave it
something to reason about. Shipped: `core/battle/`, the first `data/` content,
`ui/battle.service.ts`, and the two screens.

## 3. Gacha, roster, ascension and levelling — **COMPLETE**

`pull(state, banner, count)`, a keyed wallet and rate table rather than a field per currency, and the
two ascension ladders. [economy](economy.md) has the rates, [ascension](ascension.md) the rungs,
[glossary](glossary.md) the tier/rarity collision.

- **Pity is global and always on screen**, and soft pity passes certainty before the hard guarantee,
  so the guarantee is a floor rather than the mechanism. A paid gacha sells a bridge across a gap it
  manufactures; there is no bridge to sell here, so every reason to be stingy does not apply.
- **Tier is a slope, not a head start.** Base budgets are close across tiers — a higher tier buys a
  sharper version of its faction's identity — and the gap opens through per-level growth. _Modified
  once, knowingly, by 8c: tier also caps how many skills a character may field._
- **Only spare copies are ever consumed, never a character you have levelled.** Nobody can destroy a
  week's investment by tapping the wrong row, so the confirmation dance around irreversible loss does
  not exist. Milestone 7 rules out prestige on this; milestone 9's floor is monotonic because of it.
- **Duplicates are the primary progression path**, so a dupe is never wasted. Spark is late-game
  overflow, not a safety net; pity is the escape valve for bad luck, not the shop.
- **Routing arrived here**, on the trigger this file already named: a screen that survives a reload.
  The battle screen stays a signal-swapped mode and the tab bar hides during a fight, because
  navigation that refused to work would be worse than none.

⚠️ **A migration cannot always finish the job on its own.** The v2 → v3 step started the new
currencies at zero, stranding a returning player on gold-only income, and seeded `clearedStages` from
`stage - 1` — which looked careful and was exactly backwards, since the first-clear bonus did not
exist in the old version, so marking those stages settled closed the door on 3,000 crystals silently
and permanently. Neither was fixable inside a migration, because both need to know what stages grant
and `core/` cannot see `data/`. `reconcileClearedStages` is the repair, it runs on **every load**
rather than behind a version gate, and the rule it earned — **crediting progress and paying for it
are the same operation** — is in [saves](saves.md).

Shipped: `core/currency.ts`, `core/roster/`, `core/gacha/`, `data/` (ascension, banners, levels, the
first 21 characters across 7 factions), and the summon, roster, character and shop screens.

## 4. Team composition affecting combat math — **COMPLETE**

Composition matters through **enemy design**, not flat synergy bonuses: characters are keys to locks,
not rungs on a ladder. Milestone 3 built the lock-picking set and deliberately built nothing for
those niches to answer. [combat](combat.md) is the current statement of the formation, statuses,
skills, matrix and archetypes that shipped here.

- **Five slots in two ranks, two in front and three behind.** The front row is a _gate_ ordinary
  attacks work through, so the smaller rank keeps it a real cost. Reaching past it is a property of
  skills rather than a stat, which makes back-line access a decision about who to field.
- **Any character can stand in either rank** — role-locking would let an unlucky roster reach a state
  with no legal party. [rejected](rejected.md) records this as the reference failure four later
  decisions cite. `CharacterRole` was inert here; milestone 12 gave it a job.
- **Six archetypes, each naming the answer it wants**: reach or burst, a cleanse, `magicResist`,
  burst-not-chip, penetration, accuracy or volume. **A shielder is a different problem from a healer
  rather than a bigger one** — a barrier applied _before_ the damage arrives cannot be raced by chip.
- **A healer and a cleanse were added to the _mortal_ ladder because of a bad-luck failure mode**,
  not a gap in the fiction: Angels ascend on copies of themselves alone, so an unkind banner would
  otherwise leave a run with no sustain at any price. 8e generalised it to every faction.
- **Factions are a matchup matrix, not a synergy bonus** — every multiplier is a statement about the
  fight in front of you. The mortal cycle is closed, Monsters are a wildcard with a bill attached,
  and celestials taking nothing back from mortals is paid for by the luck-only ascension ladder.
  Edges are 1.05–1.10 on purpose; 8e measured them and left them alone.
- **A stunned combatant still consumes its turn**, so a stun costs turns rather than freezing its
  victim out of the schedule and a fight cannot deadlock behind one.
- **Statuses snapshot at application and refresh rather than stack** — a poison that stopped hurting
  when its caster died would make "kill the debuffer" the answer to every debuff, and stacking
  multipliers would delete a defensive stat by arithmetic nobody authored.

**Where the ladder was tuned to, and it has never been retuned since.** Three level-1 starters clear
the opening stages and **stop dead at stage 7, the healer lock** — a wall about _who_ is fighting
rather than how many levels they have, which is the right place for the early game to end. A built
party of five **common-tier** characters clears the whole ladder: the top may demand investment but
may not demand an ascended-tier pull nobody can buy. Every rework since has re-swept to confirm both.

## 5. Offline catch-up — **COMPLETE**

Shipped in [`core/offline.ts`](../src/core/offline.ts): the continuous fixed-rate closed form
settling all four rate-bearing currencies in one pass, the backwards-clock guard, and a non-finite
guard for a damaged `lastTickAt`. `resume()` is called on load and its report renders on the home
screen, so the path is wired end to end rather than merely available. The project's highest-value
invariant — the closed form agreeing with stepwise accrual — is pinned in `offline.spec.ts`; see
[testing](testing.md).

**This milestone closed by ruling work out rather than building it.** The segmented solver,
`timeToClear` and `dropCarry` are cancelled rather than pending, and the ten-hour cap it shipped with
was later deleted outright; [rejected](rejected.md) carries all four arguments. The one genuine gap
it identified — completed battles reaching `GameState` but not storage until the next autosave — was
auto-battle's to fix, and milestone 7 fixed it.

## 6. Run it on a physical iPhone — **COMPLETE**

Done while the app was still small, so signing and provisioning pain landed early rather than next to
a deadline. `npm run ios` builds, syncs, and opens Xcode.

**It found one bug, and that bug is why [platform](platform.md) exists.** The app worked and looked
broken; the cause was `padding: env(safe-area-inset-top)` in the CLI's scaffolded stylesheet putting
a 59px gutter down all four sides. Angular Material was uninstalled with it, the document stopped
scrolling, zoom went off natively rather than through the viewport meta, and the Google Fonts links
went. All of it — plus the accessibility incidents and the Capacitor 8 defaults that meant no Swift
was written — is in [platform](platform.md).

## 7. Auto-battle, then doubling the ladder — **COMPLETE**

The unlockable repeat loop, twelve new stages with twelve new enemies and six new locks, and the
separate balance project the sweeps had outgrown. **The prestige layer this milestone originally
planned is cancelled** — see [rejected](rejected.md).

- ⚠️ **Foreground-only, enforced by switching the loop off on `visibilitychange`.** A hidden tab
  still steps the animator at ~1Hz, so an unattended loop would climb the ladder in the background —
  and a stage clearing while the player is away is exactly what would stop every idle rate being
  constant across an offline window, which is why milestone 5 needs no segmented solver. **A pause
  that keeps fighting re-opens milestone 5.**
- **Off rather than paused**, so a running loop is always one the player can see they started.
- **Persist at the end of every battle**, not just auto ones — the one requirement auto-battle placed
  on the rest of the app, and what makes "losing the app costs the fight in flight and nothing else"
  true rather than aspirational. **It also made a latent save race reachable**: a write is a
  read-then-write across two slots, so two in flight can land an older state on a newer one.
  `SaveService` now keeps at most one write in flight and coalesces the rest — **serialising at the
  storage layer rather than making the next fight wait**, because gating the loop on disk latency
  would put a slow bridge in the animation's critical path.
- **It reads `clearedStages` rather than `stage`**, because `stage` stops climbing at the top of the
  ladder and a stage-number check would answer "not yet" forever for a run that had beaten everything.
- **No save migration** — `isAuto` is session state, since a flag surviving a reload would be a loop
  the player armed yesterday resuming without them.

**The gold slope was retuned rather than the level curve or the threshold.** Continuing the fitted
×1.4-a-stage slope to twenty-four stages put level 1000 at 75 hours and `levels.spec.ts` failed
exactly as designed. The shipped slope decelerates from ×1.4 to ×1.1, which is also the
forward-compatible shape — milestone 11's power law is that bend as a closed form. A second derived
threshold fired the same way in `banners.spec.ts`. **Both are "derive, never retype" paying for
itself**; see [testing](testing.md), which also carries the balance project and the gap it could not
close.

**Six of the twelve new enemies ask a question nothing was asking**, and four use targeting or
conditions authorable since milestone 4 and never used — worth checking before inventing a mechanic:
**the vocabulary is usually already there.** The other six are new stat blocks rather than reused old
ones, because the party arriving at stage 13 is several times the party that cleared stage 12, and a
300-HP Slime in front of it is not an easy fight, it is an empty square.

## 8. The combat rework

Four interlocking changes: the stat block, energy and ultimates, how many skills a character gets,
and faction lineup bonuses. It sits before the compounding rework and the chapters because milestone
10 retunes all scaling and milestone 11 authors a hundred stages, and doing either against a combat
model about to change means doing it again.

**It was split twice, at the boundary between a mechanic and its content.** Shipping them together
means a red ladder sweep with three possible causes; shipping them apart means each sweep names its
own culprit — which is exactly what happened in 8b, where the failure turned out to be one enemy.

⚠️ **MP survived 8a untouched, and that is what made the first split safe.** Deleting it before
energy existed would have left every healer unmetered, and the MP pool guaranteed a fight against one
resolves. **A milestone that removes a termination argument and replaces it two milestones later is
not a smaller milestone, it is a broken one.**

## 8a. The stat block — **COMPLETE**

Two collapses are the whole of it: `patk`/`matk` → `atk`, `pdef`/`mdef` → `def`, with **damage type
moved onto the skill**. [attributes](attributes.md) carries what the collapse cost, the replacement
row bonus, and the `haste`/`attackSpeed` split.

- ⚠️ **`MAX_RESIST` is a new termination guard, not the penetration cap wearing a hat.** `def`
  diminishes a hit and can never reach zero; **resist multiplies the result and can** — a combatant
  at resist 1 cannot be damaged by that type at all.
- **`damageType` on a damage-over-time was given a new job rather than deleted**: it selects the
  _target's_ resist as the status lands, so a Golem shrugs off a bleed as it shrugs off a sword.
- **Shields and regeneration had to be re-priced**, because they scale off the applier's `atk` and
  the characters authored to cast them are tanks and healers. The test that caught it had to be
  rewritten to catch it — the old assertion compared `matk` against `patk`, a question that can no
  longer be asked.
- **`recovery` and `healthRegen` both survived** the plan's charge of near-redundancy: collapsing
  them would remove the ability to say "recovers unusually well **for its size**".
- ⚠️ **`attackSpeed` keys off the action already taken, not "is every skill on cooldown".** The
  cheap-looking version is not equivalent — a skill gated on an unmet condition never goes on
  cooldown, so it suppresses the bonus for the whole fight.

The re-sweep needed no retuning; the identity pass — giving the new stats to the factions they
describe — closed the two gaps the mechanical conversion left.

## 8b. Energy and ultimates — **COMPLETE**

`mp`, `mpRegen` and HP costs are gone. Every character declares exactly one **ultimate**, metered by
a 0–100 energy bar; every other skill costs nothing but its cooldown.

- **The bar opens empty, which inverted the pacing rather than deleting it.** MP started full, so a
  caster opened strong and faded; energy starts at zero, so its marquee turn arrives once both sides
  have committed. A support that is not needed charges slowly, so an ultimate arrives because the
  fight went badly rather than on a metronome. **MP could not express that**, and the plan had
  expected a loss here.
- ⚠️ **What broke was the termination argument, exactly where the plan said.** A single zero-timeout
  assertion in the balance sweep stands where the MP pool did; see [testing](testing.md) for why it
  reads `timedOut` rather than the outcome. Milestone 14a is where the hole finally closed properly.
- **It bit immediately, and the obvious fix was the wrong one.** The Ashen Hierophant was the one
  enemy whose pool genuinely metered it. Raising `MEND`'s cooldown turns the sweep green — but `MEND`
  is shared with the stage-7 Acolyte, whose pool never metered it, so that would have weakened the
  ladder's most important early lock to solve a problem at its last. The Hierophant got its own heal,
  and **the two locks now tune independently, which they always should have.**
- **`onHit` is double `onHurt`, and the ladder decided that.** `onHurt` is paid per incoming hit and
  `onHit` once per action, so paying ten for each put the slowest meter in the game on the rank where
  damage is fielded. Both halves are load-bearing — per-hit `onHurt` is the Undead's entire meter,
  once-per-action `onHit` stops a row nuke charging its own next cast five times over — so doubling
  restores symmetry without giving up either.
- **The Undead kept their bargain by inverting it**: the **drain** vocabulary was already there, and
  `onHurt` is the largest energy source in the game while the Undead are the faction with no armour.
  They are handed tempo for having been hit, and take the life back out of whatever hit them.
- **Enemies have no ultimates**, deliberately — an encounter is read as a rhythm authored in
  cooldowns, which is also what keeps skills shareable between enemies.

## 8c. How many skills a character gets — **COMPLETE**

**Both axes.** Tier sets the ceiling — 2 / 3 / 4, ultimate included — and ascension rungs unlock up
to it. Rule in [`core/roster/kit.ts`](../src/core/roster/kit.ts), data in
[`data/kits.ts`](../src/data/kits.ts), thresholds in [ascension](ascension.md).

- **The rung mapping is absolute rarity, and it is a deliberate head start.** An ascended-tier
  character starts at `elite` and arrives with its second skill already unlocked. Counting rungs from
  each character's own start would have preserved "tier is a slope" exactly; absolute rarity was
  picked instead, so that promise is modified twice over — **deliberately rather than discovered**.
- **What keeps it fair is the tuning target that already exists**: the mid-game reference party must
  still clear the hand-climbed half. Milestone 10 moved that party below the gate and the promise
  came out stronger — **a capability arriving with the content that needs it is a better answer than
  one arriving before it.**
- **Every kit is authored at exactly its tier's ceiling**, ultimate first then unlock order. A
  readability convention rather than a mechanism, deliberately: a kit authored out of convention
  degrades to a confusing sheet rather than a broken fight.
- ⚠️ **The ultimate is never gated, unconditionally** — not "unlocked at the tier's starting rung",
  which is the same thing until a damaged save hands the simulation a combatant whose energy bar
  fills and can never be spent. A condition on an ultimate means "wait", never "never".
- **Nothing derives from a hand-maintained tally.** The plan's skill counts had both gone stale while
  their difference stayed right, so the headline survived while everything supporting it rotted; 8e
  authored sixty-six more skills without touching a number in this file.

⚠️ **A fight is ninety seconds. Run the clock out and you lose.** `MAX_BATTLE_TICKS` went 18,000 →
900 and the `stalemate` outcome was deleted. The trigger was a solo sustain character running to the
tick cap — thirty minutes for nothing — which **predated** this milestone (238 stalled battles
against the 8b kits) while the shipped guard passed throughout, because it swept parties of five:
**the assertion that replaced the MP termination argument covered the parties a tuned ladder is
measured against, not every party a player can legally field.**

**What the measurement showed is that the cap was never bounding anything** — the longest fight any
reference party had was 48.5s against a cap of thirty minutes. _The fight is decided_ and _the fight
has finished_ had drifted apart. So the fix is a timer rather than machinery, and **it is a rule of
the game rather than a guard bolted on beside one**: what the ladder was already being tuned to
without anyone writing it down. No reference win flipped, while 59 overlong fights went to zero.
Three candidate fixes died on measurement first ([rejected](rejected.md)), and the guard was widened
at the same time ([testing](testing.md)).

## 8d. Faction lineup bonuses — **COMPLETE**

Three stacking tracks — a composition table topping out at +25% attack and health for a mono-faction
five, a per-member Monster share, and a cumulative Demon track — with Angels as a wildcard on the
composition table only. [combat](combat.md) carries the numbers and the clauses.

- ⚠️ **This is the pattern `AGENTS.md` names and rejects, overridden knowingly.** It survives because
  **a mono-faction bonus does not create one optimal team, it creates seven**, and the matchup decides
  which to bring. The player is not choosing between the two: they keep the +25% and switch which
  mono-faction team fields it. **The argument is specific to _faction_ composition** — see
  [rejected](rejected.md).
- **The premise was false the day it shipped, and 8e made it true.** With three characters per
  faction a mono-five was unreachable without Angels. That also killed the plan to resize the matchup
  edges here — **both compared teams are mono, so the lineup bonus cancels out of the comparison.**
- **The resolver tries every rung, not just the last that matched**, because a mono-four pays the
  same attack as a three-and-two and more health, so reading in order would make the answer depend on
  where somebody put a row. It tries every faction assignment rather than the cheapest — a party is
  five people against seven factions, so exhaustive costs nothing and needs no invariant. **A
  wildcard cannot be spent twice.**
- **The ladder needed no retuning, which was not obvious in advance**: the reference party is a
  rainbow, so it reaches no rung at all. A real buff that moved no win-rate assertion.
- **`BOOSTED` is a guard, not a tuning target** — nothing asserts it should beat anything. It watches
  for ⚠️ a party surviving a fight it cannot win until the ninety seconds run out.

## 8e. Seven characters per faction — **COMPLETE**

**Forty-nine characters, sixty-six new skills**, every kit at its 8c ceiling. No banner change was
needed — `BANNERS` carries an empty `pool`, which already means the whole roster.

- **Three common, three legendary, at least one ascended — only the first two are closed.** The exact
  counts are the bench a mono-faction team is built from, and that job wants a known depth rather
  than a number that drifts. The ascended floor is where new characters keep arriving.
- **A mono-faction five costs two legendary-tier pulls**, since a faction holds three commons. A mild
  gate and deliberately not a free one: a composition worth +25% should cost something.
- **Every faction got sustain and reach, in its own idiom** — the count was never the real
  requirement. **Monsters were the deliberate exception on sustain**: `lifeLeech` and a siphon rather
  than a healer, because giving that faction a support would solve a composition problem by deleting
  the faction. ⚠️ **Rank is a gate, not a damage reduction** — a party with no back-rank targeting
  cannot _select_ a protected healer, so such an encounter is unwinnable rather than hard.
- **Two factions needed the opposite correction**: Dwarves were four walls and no way to close a
  fight, which is the ninety-second timeout with a stat block on; Angels were three healers with the
  same problem.
- **All seven fives clear within about a stage and a half of each other** — genuinely sidegrades.
  Three fixes the sweep found and nothing else would have: a Demon healer out-healing an Angel one
  because restoration prices against `atk`; Angels given two walls when they needed one; and
  `BOOSTED` quietly ceasing to watch the worst case once a mono-five became reachable.
- **The lineup ladder and the matchup edges were both measured and left alone** — see
  [rejected](rejected.md) and [testing](testing.md). ⚠️ **The timer headroom shrank here**, and the
  assertion measuring it was narrowed to fights a party clears; that is a live constraint rather than
  history, and [testing](testing.md) carries it.

**This is the same roster pressure faction towers create in milestone 15**, which was a point in
favour of doing it here. 15 now arrives with its prerequisite met.

## 9. Resonance — levels the roster shares — **COMPLETE**

**Invest in five characters; every other character you own is carried to the same level.** The
mechanic, the derivation and the invariant it rests on live in
**[level-resonance](level-resonance.md)**.

- **Closer to a prerequisite than a convenience.** 8d's bonuses are reachable only by fielding a
  _different_ five per encounter, and milestone 15 demands thirty-five invested characters —
  seven times the cost of five against an economy tuned for one team. It is positioned after the
  rework only because the rework decides what a level is worth.
- ⚠️ **Derived, never stored.** Baking a carried level into the save would be irreversible and wrong
  the moment the top five changed. The cost is that **every reader has to derive**, so
  `toBattleCombatant` takes the level as an argument — the one seam where a screen and a battle could
  otherwise have disagreed silently.
- **The rarity cap still binds, and that is what keeps ascension alive.** Resonance makes _levels_
  free and leaves _ascension_ individual; without that clause the bench would have nothing to spend
  on. It deliberately does not cover milestone 16's per-character track.
- **Levelling is charged from the effective level.** Charging from the invested one would sell those
  levels back, and every purchase below the floor would buy nothing the player could see — a trap
  rather than a balance decision.
- **The floor never falls, and that is cheaper to prove than to defend against.** Invested levels
  only rise and characters are never removed, so no displayed level can drop — which is why the
  roster screen shows one number and not two.
- **The button raises the floor, not a character.** Only the lowest of the five moves it, so
  levelling "the top five" by one step would charge for five levels to buy one. `raiseResonance`
  levels whoever it takes, **atomically** — a partial application drifts the anchors apart — and
  prices the operation in full first, because breakthrough levels are lumpy enough that a shortfall
  discovered partway through is a real outcome. **The cap stall has two exits and the planner allows
  both**: ascend the fifth-highest character, or level a sixth past it.

Shipped: `core/roster/resonance.ts`, `raiseResonance`, `raiseResonanceToAffordable`, and a resonance
panel. **No save migration**, because nothing about it is stored.

## 10. Power that compounds — **COMPLETE**

**Both sides of the fight scale, or neither does.** Raising the player's curve without raising the
enemy's does not create a power fantasy, it deletes the content — so these were one job, not two.

| Per level | Common | Legendary | Ascended | Ascended ÷ Common |
| --------- | ------ | --------- | -------- | ----------------- |
| was       | 1.0075 | 1.009     | 1.0105   | 19.5× at the cap  |
| is        | 1.021  | 1.0225    | 1.024    | 18.7× at the cap  |

- **Every tier's multiplier-at-cap was raised by the same factor.** Common tier compounds to ×1.04e9
  across the range where it reached ×1745. Scaling the _exponents_ by a common factor reads like the
  same idea and is not — see [rejected](rejected.md). `levels.spec.ts` pins the ratio.
- **`perAscension` went 1.12 → 1.6**: ×450 across the rung ladder rather than ×4.36. Against a
  billion-fold levelling curve the old number would have made the gacha decoration. Sized against
  the levelling curve rather than in isolation — a rung raises the level cap by 20 to 100, itself
  worth ×1.5 to ×7.9.
- **The `break_infinity` hedge is retired**: `AGENTS.md` said to add it only if the curve demands it,
  and the curve demands it.
- **An enemy is a level-1 stat block plus a tier; a stage is archetypes plus a level.** Re-authoring
  all twenty-four archetypes to a common level-1 budget is what lets a Marsh Acolyte reappear two
  hundred stages later as the same question rather than an empty square. **The rarity dial was folded
  into the stat block**, because a rung is a flat multiplier — per stage a ×1.6 cliff on a dial
  `level` already turns smoothly, per archetype a multiplier on a block the author is writing anyway.
  Nothing was lost and a dial nobody could explain was not shipped.
- ⚠️ **Scaling both sides is an identity, and that is why nothing else broke.** The faction matrix,
  every status, the energy budget and the ninety-second timer all needed no change; the only thing
  that genuinely moved was the difficulty probe's search bracket.

**The stomp is what actually retuned the ladder.** Eight hours bought two stages, then one, then
none — and the cause was not the rescale, it was holding "five common-tier at level 200 clear the
ladder" while a rung went from ×1.12 to ×1.6, leaving a stage costing seventeen levels where a day of
income bought six. **So the ladder came down to meet it**: reference parties at level 40 `rare-plus`
and level 90 `legendary`, with stage levels solved against a smooth ×1.26-a-stage curve rather than
hand-guessed. **Levelling and rungs then land within a few percent of each other** — levels are the
steady drip, rungs the leap — and the sweep holds that ratio in `[0.5, 2]`.

The price was paid knowingly: the ladder is **a shorter climb in wall-clock terms**, and **nothing
here fixes the density**, because a 24-stage ladder cannot span the interesting level range _and_
cost a couple of levels a stage. ⚠️ **What grows once a character reaches 1000 is still unanswered** —
milestone 7's diagnosis moved further down the ladder rather than filled, and **milestone 16 is the
intended answer.**

## 11. Chapters — **COMPLETE**

Stages group into chapters; chapter size steps every ten chapters and caps at 200. Read
[`core/ladder.ts`](../src/core/ladder.ts) before touching progression.

| Chapters | Stages each | Running total |
| -------- | ----------- | ------------- |
| 1–10     | 50          | 500           |
| 11–20    | 60          | 1,100         |
| 21–30    | 70          | 1,800         |
| 41–50    | 90          | 3,500         |
| 91–100   | 140         | 9,500         |
| 151+     | 200 (cap)   | 20,000 at 160 |

- **The boss rhythm is a rule rather than an authored field**, so it is identical at either chapter
  length and `data/` only authors a line-up worthy of the slot it lands in.
- ⚠️ **A position is a _place_ and a clear count is a _quantity earned_**, which is why one became a
  pair and the other stayed a number: a position has to survive the ladder being re-cut around it.
  **`state.stage` changed meaning without changing its name.**
- **Income became a function of position because nine and a half thousand authored rate tables is
  not something anyone maintains.** **The exponent was chosen by matching the old hand-tuned ladder
  at equal enemy levels**, not by picking a shape — which is what stops "four times as many stages"
  meaning "four times the income", and why `levels.spec.ts` passed untouched. **A power law is the
  only family that survives this ladder's length**: `1 + exponent / index` is milestone 7's
  hand-bent slope as a closed form.
- ⚠️ **The receipt had to be capped, and that is the sharp edge of this milestone.**
  `reconcileClearedStages` reads the surviving gold rate as a receipt for how far a run got,
  denominated in whatever the curve said the day it was written — so a veteran arriving with the old
  ladder's 90 gold a second reads, on the new curve, as having cleared all hundred stages. The fix
  is a sentence true independently of any curve: **a run cannot have cleared more stages than it has
  reached.**
- ⚠️ **Summon crystals came off the exponential, because a rate should compound only if what it buys
  compounds.** Gold, xp and essence buy levels whose costs compound; crystals buy a pull at a flat
  `PULL_COST`, and the old curve reached a million pulls a day by the end of chapter 1. **The damage
  is to ascension rather than the gacha**, since milestones 15 and 16 both rest on it staying a
  constraint — and **this was not a reason to be less generous**: the floor moved from 5.4 crystals
  an hour to 100.
- **Two chapters shipped, stretching the old ladder's difficulty range over four times the stages
  rather than extending it** — early chapters are early game and meant to be a breeze, which is also
  why the reference parties survived. **Both sit in the first band, so they prove the chapter _flow_
  but not the size formula**, which was therefore built and tested directly against the table above.
- **Stages are hand-authored rather than generated**, which milestone 10 made viable: a hundred was
  an afternoon plus four difficulty inversions the balance probe named with their numbers attached.

[rejected](rejected.md) holds the trigger that would make generation worth building, the two things
left for later (the band table's enemy tiers, and the chapter-completion reward that landed in 14b),
and the offline cap deleted here. [testing](testing.md) has the stride that answered four times the
ladder. Shipped: `core/ladder.ts`, `StageEncounterData` split out of `StageData`, `data/chapters.ts`,
the two chapter files, `chapter` on `GameState`, and `LADDER` in `ui/content.ts`.

## 12. Gear — **COMPLETE**

The third leg of the power fantasy, owed since milestone 7: four places in the codebase state that
gold's coefficient is the shallowest of the three **because** gear will spend it later. It landed
last because its power budget only means something against milestone 10's curve and milestone 11's
content shape — built earlier it would have been tuned twice, the second time against numbers nine
orders of magnitude away from the first. [gear](gear.md) is the current statement.

- ⚠️ **Every bonus is a percentage, and that decision made the rest easy.** A flat `+400 atk` is
  invisible against a curve worth ×10⁹ — but the stronger argument is the identity: a percentage
  commutes with the whole-board rescale, and **a flat bonus is an addition, which is what the
  identity forbids.**
- **The roster's eight roles became five, and role stopped being inert.** All three collapsed
  distinctions were statements about a **kit** that the kit says more precisely. ⚠️ **This reverses a
  comment that said keeping role inert was the point, deliberately** — that comment was about
  **placement**, and **a piece the party cannot wear is fodder, not a dead end.** The cost is real:
  the roster screen no longer says "healer" about the seven characters that heal.
- ⚠️ **The defensive share of the profiles is half what it looks like it should be.** At twice the
  size a fully geared party ran the clock out on `c2-s23`. Sweeping at ×1, ×0.5 and ×0 defence clears
  **75, 74 and 74** stages — defence bought one stage in the fights the party wins and a stall in the
  ones it loses, which follows from `atk² / (atk + def)` diminishing sharply once the attacker
  outruns the defender while `def` and `hp` multiply each other to extend a fight nobody wins.
  **The dial was the ratio, not the size** — see [rejected](rejected.md).
- **Gear material is a currency, because the alternative throws drops away.** Consuming item
  instances directly is the obvious build, and auto-battle clears a stage a minute — an evening is
  thousands of records the repair pass walks on every load, and bounding the bag then means
  **throwing drops away**, the one outcome this economy rules out everywhere else. `alloy` is what a
  duplicate becomes when there is nothing left to do with the object itself; spark is the precedent.
- **The chain walker's first real migration landed on tested code and worked immediately.** Widening
  the baseline in place would have been legal and was declined: the walker had been sitting proven
  and unused specifically so the first real migration would not be written on a day it was urgent.

Shipped: `core/gear/`, `data/gear.ts`, a sixth currency, the gear screen and the sheet's equipment
panel, and two new accessibility scans. It also cost the offline invariant its timeout margin — see
[testing](testing.md). **Enemies wear no gear** and are not planned to until chapter 10, which is the
point of the milestone rather than a gap; see [rejected](rejected.md).

## 13. Settings, and the save-safety gap — **COMPLETE**

A small milestone clearing a backlog: the run reset, combat speed defaults, and somewhere to put
whatever accumulates next.

- ⚠️ **Settings are a second key, not a field on the save.** A preference describes the app; a save
  describes a run. In one blob, resetting the run also resets how fast battles play, and an unreadable
  save takes the player's settings down with it for no reason. **It also keeps the save chain out of
  it** — every later setting would otherwise be a `SAVE_VERSION` bump for a value nothing in `core/`
  reads.
- **There is no version field on the settings, and that is a decision.** The save carries one because
  its fields are interdependent; settings are the opposite shape — every field independent, always
  with a correct default — so the repair is **per field, on read**, which subsumes migration in both
  directions. The bar for revisiting it is a key whose old and new meanings **collide**, and the
  answer there is a new key, not a version number.
- **The speed is sticky, so it is one value rather than two** — `BattleService.playbackSpeed` **is**
  the setting's signal. A "default speed" that in-battle taps did not write back was rejected: the
  speed a player wants is a property of the player, not of the stage in front of them.
- ⚠️ **A run reset has to replace the state in memory, not just empty the slots.** `clear()` already
  existed; **replacing the in-memory run was the work**, because the loop writes its state back on
  autosave and on `visibilitychange`, so a reset that only emptied storage looks correct until the
  app is backgrounded and then hands the old run back. `AGENTS.md` carries the four-step order that
  fixes it; the reason it clears _before_ writing is that a write copies the primary into the backup
  first.
- **A fresh run is its own confirmation**, so the screen navigates home rather than showing a toast.
  The end-to-end test backgrounds the page after the reset, having first emptied the save key, so
  what the app writes next can only have come from what it is holding — an assertion a unit fake
  cannot make.
- **The tab bar is full.** Six tabs is what fits across a 375pt phone at a legible label size —
  measured, not guessed: the widest label is 52px inside a 63px tab. **Answered early and differently
  by [Town](#not-a-milestone-town-is-the-hub-the-tab-bar-needed).**

The first CDK overlay landed here and corrected three pieces of stale advice; **saves turned out to
be backed up on both platforms with zero code**, which is not the same as safe. Both are in
[platform](platform.md), along with the one part of this milestone that is not done — verifying the
backup table on real hardware. Export/import was considered and declined; see [rejected](rejected.md).

## 14a. The ladder retune — **COMPLETE**

The shipped hundred stages were tuned to be climbed; this re-aims them so **the shipped content is a
breeze and the difficulty arrives with chapter 3**. Nothing structural changed — chapters, boss
rhythm, income curve and stage count are untouched — but almost every enemy level did.

|                                    | Before                        | After                          |
| ---------------------------------- | ----------------------------- | ------------------------------ |
| Chapter 1 enemy levels             | 1 → 40                        | 1 → **16**                     |
| Chapter 2 enemy levels             | 40 → 126                      | 16 → **85**                    |
| The party chapter 1 is tuned for   | five at level 40, three rungs | five at level 30, **one rung** |
| The party that finishes the ladder | level 90 at `legendary`       | level **85 at `elite`**        |

The tutorial ramp (stages 1–6) and the stage-7 healer lock are **untouched**, including the level-14
step into the wall. That was the constraint everything else was authored around.

- ⚠️ **Levels are not the early power curve in this game — rungs are.** "Chapter 1 clearable with no
  ascensions" was measured and rejected: `perLevel.common` is 1.021 — it has to be, to reach ×10⁹
  across a thousand levels — so a character taken to its unascended cap of 20 is worth **×1.48**
  against a wall built to stop ×1.00, and a five at level 20 with no rungs failed eight stages, one
  at a **5% win rate**. **One ascension is worth more than nineteen levels**, so any claim of the
  form "a player at level N should be able to…" has to be checked against the rung count.
- ⚠️ **A barrier that could never lapse.** `BARRIER` lasts 70 ticks and `BULWARK` recast it every 60,
  so a party-wide absorb stayed up _permanently_ — and every stall the retune exposed was a stage
  carrying one of the two. The old ladder hid it by killing parties before it mattered. The cooldown
  is 85 now and **must stay above the status's duration**: a termination argument, not a knob.

⚠️ **How it finished: the termination argument milestone 8b deleted, put back.** Four red assertions
looked like a tuning problem and were not. Every fight that ran the clock out ended in the same
picture: a **lone healer** topping itself up faster than what remained could chip it down — on
`c2-s23`, a party at 52% health against a single Hierophant at 10%, a fight the player had
unambiguously won, reported as a defeat because the simulation could not finish it. **A timer is not
a termination argument — it is what fires when one is missing.**

**Closing pressure** in `core/battle/clock.ts` is the replacement, and `AGENTS.md` and
[combat](combat.md) carry its numbers and the three properties that made it safe to add to a shipped
ladder. The argument in one line: every closed sustain loop breaks by arithmetic, because HP is
finite, the multiplier is not, and the heal that answered the damage does not grow with it — while
both sides are amplified identically, so it decides only _that_ a fight ends, never _who_ wins.

`simulate.spec.ts` has the property test that matters — two mutually-healing combatants tuned to a
knife edge, which **times out with the mechanism disabled and resolves with it on.** Across thirteen
sweep parties over a hundred stages, timeouts went from 9 in 1,300 to **0**, the longest cleared
fight from 75.1s to **62.7s**, the longest of any kind from 90.0s to **63.5s**. All 32 assertions
pass; headroom is **1.44×**. Two content fixes were tried first and both failed instructively — see
[rejected](rejected.md).

## 14b. Achievements, dailies and bounties — **COMPLETE**

Nothing rewarded opening the app except idle income the player would collect anyway. **The retention
framing undersells it: quests are a faucet that is not stage-gated.** A player stuck below a wall has
one income source and it is the thing the wall is throttling, so being stuck stops meaning being
stopped — which matters more in a game with no way to buy a way past.

`AGENTS.md` states the resulting rules for all three systems; what follows is why each has the shape
it does.

- ⚠️ **Both systems store a ledger and derive everything else, and that is the decision the milestone
  rests on.** The obvious build increments a running total from `applyBattleResult` — a write into
  the hottest path in the game for a derivable number, and a second place for progress to disagree
  with itself. Deriving also keeps both cheap to extend: a second track is an entry in `data/` and a
  key in a record, not a save migration.
- **The stage-clear track is endless, flat and claimed.** Endless because a bounded list is either
  finite content that runs out or the per-stage authoring problem milestone 11 spent a milestone
  removing. Flat because first-clear crystals are _already_ linear in how far the run has come, and a
  track paying more later helps least exactly where help is needed. Claimed because crediting would
  mix the crystals into a stage clear's payout; the claim buys a _moment_.
- **Crystals are the only currency a quest reward could be** against a level curve worth ×10⁹, and
  **paying a _percentage_ of income would fix the scaling and break the point** — it would pay most
  to the player whose ladder is already moving, when the whole reason quests exist is the one whose
  ladder is not. Bounties take the opposite answer for the opposite reason: they reward roster
  breadth, and being stuck is not what the board is for.
- **The bounty board earns its place for a reason neither other system covers**: it is the only thing
  that pays you for characters you are **not** fighting with, so a wide roster becomes worth
  something before faction towers ask for it.
- ⚠️ **Missions stack, and the rule that briefly said otherwise was a layout rule in disguise.** It
  ran on "the board shows one row per tier, so a second mission would be a crew with no visible way
  to collect it" — every word true, and an argument about **the screen** whose premise was itself a
  choice. ⚠️ **A constraint that argues for itself is the tell**: the rows and the cap went together.
  What rations the board is the **bench**, and a cap on top spends the player's roster breadth twice.
- ⚠️ **"Dispatch all" is not `ascendAll`, and the licence is different.** Crews genuinely compete for
  one bench, so it really does resolve a choice. It ships because the stakes are a **wait rather than
  a loss** — and what that buys is an obligation to be **predictable rather than clever** rather than
  a general licence for one-press bulk actions.
- **All three screens are Town cards, and that settles what Town is**: none spends a wallet currency
  and all three quote a count of things waiting. The hub's test was always **"somewhere you go
  deliberately, with something you have earned"**, not "a currency sink".

Two bugs worth keeping. The board shipped its first screenshot with a button reading _"Choose a crew
for Village Errand Send"_ — see [platform](platform.md) for the `visually-hidden` trap. And
`duration` documented that a mission under a minute out reads "under a minute", then tested
`Math.ceil(ms / 60_000) < 1`, which is false for every positive duration: **the comment described the
intended behaviour correctly and the code never had it**, with nothing failing to say so. ⚠️ **A
rounded quantity cannot answer a question about the quantity it was rounded from.**

### ⚠️ Local notifications — the decision reversed, deliberately

**This project argued for shipping none, and now ships two.** The old argument is preserved rather
than deleted, because it is still the reason the feature has the shape it has:

> Removing the offline cap removed the only _earned_ reason to send one. With no cap, staying away
> costs nothing — so nothing is lost, and there is nothing to warn about. A notification existing to
> manufacture a session is the pattern this project rejects, and once absence is free every
> notification is that pattern by definition.

What changed is the product call above it, not the reasoning under it, and **that is recorded as a
reversal rather than folded away** so anybody wondering why this game nudges a player who has lost
nothing finds the objection rather than a blank. Every constraint `AGENTS.md` lists — two ever, fixed
ids, cancelled on foreground, copy that promises nothing is lost, a setting defaulting on, permission
at the first backgrounding — follows from keeping that objection in view.

Two smaller things. **The 24-hour reminder and the longest bounty are the same number, and that is
not a coincidence** — a full day is where the board has nothing left to give, so it is the one moment
the app has something concrete to say. And the copy guard **caught the first draft**, whose "Nothing
expires and nothing is lost" was true and unmatchable by a regex that cannot tell it from "expires
soon": **the copy was reworded rather than the guard weakened.**

## 15. Faction towers, and something for a roster to be

**The problem here is not "more content".** Through milestone 12 the game has exactly one thing
to do, so a wall in the campaign is a wall in the entire game. It also fields five formation
slots against forty-nine characters, fed by a gacha generous enough to produce roughly 190
pulls a day at post-ladder crystal rates. Every decision in milestones 3 and 4 — sidegrades with
distinct niches, seven factions, two players clearing the same stage with different teams — is
funded by a game that only ever asks for five characters. **The generosity is producing material
with nowhere to go.**

Seven towers, one per faction, five slots each, restricted to that faction. That is demand for
**thirty-five invested characters** — seven times what the campaign has ever asked for — so an
unlucky pull becomes the answer to a tower instead of fodder, duplicates gain a second use, and a
wall in chapter 3 has somewhere to send the player.

One consequence to design for rather than discover, and one risk this milestone used to carry
that has since been closed:

- **A tower is a wall about who you own, in a game with no way to buy characters.** That is the
  failure mode role-locked formation slots were rejected for in milestone 4: an unlucky roster
  reaching a state where no legal party exists. Towers must therefore be skippable, never on the
  critical path, and never the only source of anything.
- **Every tower can be crewed, and milestone 8e is what made that true.** This bullet used to
  warn that twenty-three characters over seven factions was roughly three each against five
  slots, so no tower could be finished the day it shipped — and it ended "pick one; do not let it
  happen by accident". **8e picked**, for its own reasons: forty-nine characters, seven per
  faction. Five slots out of seven crews every tower with two to spare.

  **What towers demand is per-faction depth, not roster size**, and that is the part of the
  original reasoning still doing work. A hundred characters distributed unevenly would strand the
  thin factions just as completely as twenty-three did. It is guarded rather than assumed:
  `data/characters.spec.ts` asserts every faction can field a mono-faction party and reads
  `PARTY_SIZE` off `core/`, so a formation that grew to six would fail that test rather than
  quietly leaving six towers unfinishable. Two spare per faction is the entire margin — treat
  anything that widens a tower past `PARTY_SIZE`, or narrows the roster shape, as re-opening this.

  What is left is not bodies but **investment**, which the next section is about.

### Resonance is a hard prerequisite, and it already shipped

**Nobody levels thirty-five characters from scratch.** Towers are only affordable because
milestone 9 already carries the whole roster to the fifth-highest level — without it this
milestone is seven times the levelling cost of one team, against an economy tuned for one team.

What towers still cost is **ascension**, which resonance deliberately does not cover: the rarity
cap is what limits how much of the floor a bench character can collect. So crewing a tower is a
real investment decision, just not a levelling grind. That is the intended shape — if towers ever
feel free, the cap clause in [level resonance](level-resonance.md) is what has stopped working.

### Saved team presets

Pure quality of life, and it becomes unavoidable precisely here. Seven towers plus the campaign is
eight lineups, and by milestone 17 it is more than that — all reassembled slot by slot from a
roster of dozens every time the player switches mode.

**The absence of this is what makes multi-mode content feel like admin rather than depth.** It is
the cheapest thing in this milestone and the one most likely to be cut for being unglamorous; the
note is here so that cutting it is a decision rather than an oversight.

## 16. Deep per-hero investment

**The answer to the question milestone 10 leaves open** — what grows once a character reaches
level 1000. A per-character track that unlocks late, is fed by duplicates, and modifies
**behaviour rather than adding stats**: an extra target, a condition dropped from a skill, a
cooldown crossing a threshold that changes what the kit does.

Behaviour rather than stats, for a reason milestone 10 makes sharp. At ×10⁹ raw power another
multiplier is invisible and another _ability_ is not. It is also the only way composition can
keep mattering late, which the long-term vision asks for explicitly: a stat track makes the late
game a bigger version of the early game, and a behaviour track makes it a different one.

Duplicate-fed, because copies past `ascended-5` currently convert to spark and spark buys more
characters — which at this point in a run is a loop with no exit. This gives late duplicates
somewhere to go that is not the shop.

## 17. The roguelite run

A multi-battle run where damage carries between fights, a choice of relic or buff arrives between
them, and the whole thing resets. **Second of the two alternate ladders, deliberately.** It is a
far larger build than towers and it wants a roster deep enough to field several teams at once —
which towers are what create.

What it adds that neither the campaign nor a tower does: **decisions inside a run rather than
before one.** Everything else in this game is decided at the formation screen and then watched. A
run where the third fight's relic depends on how the second went is the only place the game asks
a question mid-flight.

**Do not build it before towers.** It is the most interesting thing on this list and the least
structural, and taking it first would be choosing the fun problem over the one blocking
everything else.

## 18. Puzzle maps

**The only content shape on this roadmap that is not a ladder.** Campaign, towers and the
roguelite are all "fight upward against bigger numbers". Puzzle maps are content you _solve_: a
small authored map with a restricted roster, one-way gates, teleporters, buffs found along the
way, and a correct route through it. Peaks of Time is the reference.

It is fully offline and it needs no system this project lacks — the battle simulator, the
formation, and the status vocabulary already do everything a map needs. What it needs is
**authoring**, and that is the whole of the argument against it: every map is hand-designed with
no curve to generate from, no sweep to validate it, and no way to know it is solvable except by
solving it. Milestone 11 records the point at which hand-authoring stages stops scaling; this is
that problem without the escape hatch of generation.

So it is last, and it is honestly the one item here a solo developer might decide not to want.
It is written down because it is the thing that makes the genre's best games feel like more than
a number going up — and skipping it should be a decision made on the cost, not a gap nobody
noticed.

## Not a milestone: Town is the hub the tab bar needed

Milestone 13 ended with a bar at capacity and three named ways out — a "more" tab, moving settings
off the bar, or a hub — deferred to whichever milestone needed the seventh screen. **The hub was
built early instead**, because the two screens that most obviously belonged behind one were already
on the bar: Summon and the spark shop.

`/town` replaces both tabs, at Summon's old position, and the two screens move to `/town/summon` and
`/town/shop`. The bar is Home · Town · Roster · Gear · Settings — five, with a spare slot that is
deliberately not for spending. (The fourth entry is the **Bag** now, and the gear shop is a third
card in Town; see the entry below.)

**Why a hub beat the other two options.** A "more" tab spends a slot to say "there is more", which
is a tab that is never the destination. Moving settings off the bar frees a slot and then leaves the
next screen in the same position one screen later, because a bar with a ceiling of six is a queue
whatever order it is filled in. A hub has no ceiling at all: the seventh sink is a card in Town, and
so is the eighth.

**Summon and the shop are the right two to demote**, and the argument is about how often a screen is
_visited_ rather than how important it is. Both are places a player goes deliberately, having decided
to spend something — unlike the roster or gear, which are read while deciding. A deliberate trip
survives one extra tap; an idle glance does not.

Three decisions inside it:

- ⚠️ **The nesting under `/town` is load-bearing, not tidiness.** `routerLinkActive` marks the tab
  non-exactly, so `/town/summon` keeps the Town tab lit and `aria-current="page"` on it. Left flat at
  `/summon`, the tab would go dark the instant the player arrived where it sent them — which reads as
  having navigated out of the app's structure rather than into it. `tests/app.spec.ts` asserts it.
- **Each card carries its currency's balance**, which is the same argument the summon screen makes
  for putting pity on screen before the pull: the number that decides whether the trip is worth
  taking should be readable without taking it. Spark in particular is zero for most of a run.
- **The icons are the ones the tabs wore** — 🔮 and ✨ — because a player who learned to find
  summoning by its crystal ball should find the same crystal ball on the card rather than learning
  the screen twice. Town takes 🏘, which is distinct from Home's 🏕 at tab size.

**No compatibility route was added for `/summon` or `/shop`.** The game is pre-release, so no
bookmark, deep link or reload carrying one of those paths exists. This is the same argument that
licensed the v0 re-base below, and it expires the same way: the moment anyone outside development
has a URL, a moved route needs a redirect.

## Not a milestone: the gear tab became the Bag, and its shop moved to Town

The hub above was built on the promise that **a new currency sink is a card in Town rather than a
tab**. The gear shop is the first thing to test it, and it was not new — it was already on the bar,
as the top half of the Gear tab, above the bag of loose pieces.

Three changes, one argument:

- the forge is now **`/town/gear-shop`**, a Town screen beside the spark shop, with the toolbox 🧰
  it wore in the tab bar;
- the tab that is left is the **Bag** at `/bag`, with 🎒 — named for what it holds rather than for a
  system;
- the bar is Home · Town · Roster · Bag · Settings. Still five, still with a spare slot that is not
  for spending.

**Splitting the two sections cost something real, and it is worth naming.** They were one screen on
a good argument: the shop is where a specific piece is _chosen_ and the bag is where the random ones
pile up, so a player weighing a Fine chest piece could see what they already held without leaving
the offer. That argument was about **gear**, and it held while the tab was gear. It stops holding
once the tab is an inventory. A shop is somewhere a player _goes_, having decided to spend — the
same test that demoted Summon and the spark shop — and a bag is something they _carry_. Two of the
three currency sinks were already in Town; leaving the third on the bar was the inconsistency.

What blunts the cost is the hub's own rule: the card names the gold the shop spends, so the trip is
judged before it is taken, and the stock is **fixed for the hour**, so the offer is still there on
the way back. Neither would be true of a shop that rerolled.

**Renaming the tab is the half that pays forward.** "Gear" was a tab named after a progression
system, so the second item type the game mints — materials, consumables, whatever milestone 14's
dailies hand out — would have had nowhere to land but a sixth tab. "Bag" is a container: a new item
type is a section on a screen that already exists. Nothing empty ships for it, though. The bag is
one section, headed **Gear**, and the second heading arrives with the second kind of item.

**No redirect from `/gear`**, for the reason `/summon` got none: the game is pre-release. That
licence expires the moment a URL exists outside development.

## Not a milestone: ascension became copies of the hero alone

Housekeeping in the same sense the v0 re-base was: no new system, one system made much smaller.
**A rung now costs copies of the character being ascended and nothing else.** Same-faction
**fodder** is gone, and with it four rungs of the mortal ladder, the plan naming which
faction-mates to burn, the cheapest-first solver, the fodder picker on the character sheet, and
three of `ascend()`'s six failure modes. `docs/ascension.md` carries the design; this records why.

### The recursion was the thing worth deleting

Rungs used to be quoted in _ascended_ copies — "2 faction copies at `elite-plus`" — against a
player who only ever holds base ones. Pricing that took a memoised recursion with a cycle guard,
a `{ self, faction }` cost type, and a spec whose job was proving the authored ladder was
well-founded enough for the recursion to terminate. `data/ascension.ts` is now two arrays of
fifteen integers and `ascensionCost` is an array lookup.

**What fodder bought was real and is worth naming as a loss:** a spare copy of a character you
would never play was still worth something. It is now inert until that character is worth
investing in. **What it cost** was a price no player could evaluate — the headline numbers were 8
elite copies plus 180 rare fodder, or 216 base copies for a common-tier character, and none of
them appeared anywhere a person could read them.

### The ladder grew a bottom, and that is the part with consequences

`common` and `common-plus` went in below `rare`, so all three tiers now start on different rungs:
common-tier at `common`, legendary-tier at `rare`, ascended-tier at `elite`.

The reason is arithmetic. The old recursion made cost **compound** down the ladder, which produced
a ~9× gap between a common-tier climb and an ascended-tier one _for free_ — and that gap was doing
real work, because a pull produces a specific common-tier character roughly ten times as often as
a specific ascended-tier one. A flat table gives the compounding up, so the gap had to be authored
somewhere. It is the 20 copies below `rare`.

⚠️ **The two new rungs pay level cap and no stat multiplier, and that is the load-bearing
decision.** `growthFloor` anchors the ×`perAscension` ladder at `rare` for every tier. Paying them
a multiplier would have made every common-tier character ×1.6² stronger at every rarity it can
reach — a power grant the entire stage ladder would have needed retuning around, when the change
was only ever about cost. **The evidence it was the right call: all 32 balance sweeps pass with no
change to any stage.**

### Three things the balance sweep caught that nothing else would have

Worth recording because each one passed type-checking and the unit suite first.

1. **The reference parties silently gained ×2.56.** `chapters.balance.ts` fielded them at
   `rarityIndex('rare')`, which the file had adopted specifically to survive the ladder being
   _reordered_. It does not survive the ladder gaining a rung _underneath_ — `rare` stopped
   meaning "where a character starts" and started meaning "two ascensions in". The starter wall
   evaporated and the sweep went on passing, describing a different game.
2. **`BUILT`'s level was a literal.** It read 40 because 40 was the cap of the rung below it; that
   cap is now two slots along. It is derived from `LEVEL_CURVE.caps` now, and the party it
   describes stayed the party the prose describes.
3. **The level-vs-ascension ratio used a rarity index as a rung count.** They were the same number
   only while common-tier characters started at index 0.

The general rule: **a rarity id protects against reordering, not against insertion.** Anything
that means "how far has this been invested" has to count rungs from a floor.

### It is also the first save migration that changes no shape

> ⚠️ **Superseded** — this migration was folded into the v0 baseline with the rest; see "the save
> chain was re-based to v0 a second time" below. **The rule it earned outlived the code**: inserting
> a rung anywhere but the top of `RARITIES` is still a save migration, not a content edit.

`SAVE_VERSION` went to **2**. v1 → v2 adds no field — it shifts every `roster[].rarity` by two,
because the index means a rung two lower than it did. A v1 save fed to a v2 reader parses cleanly,
validates cleanly, and demotes the entire roster. See [saves](saves.md); the rule it earns is that
inserting a rung anywhere but the top of `RARITIES` is a migration, not a content edit.

### Spark stopped being theoretical

Maxing a common-tier character went from 216 base copies to 46 — inside a single full climb's worth
of pulls. Spark is minted only by copies of an `ascended-5` character, so it was previously a
currency almost nobody ever saw. Prices did not move; the shop gained a third copy offer because
the three tiers now start on three different rungs. See [economy](economy.md).

## Not a milestone: ascension moved to the Altar, and gained an Ascend all

The screen the copies-only rewrite above should have got at the time. **`/town/altar` is now the
only place in the game that ascends anybody**, and it does the whole roster in one press.

The complaint was ordinary and correct: ascending meant opening a character sheet, tapping one
button, going back, and opening the next one. With duplicates of nine characters that is nine
screens for nine decisions — and the rewrite above is exactly what made those decisions empty. A
rung costs copies of one character and nothing else, so there is no plan to choose, no fodder to
pick, and no reason to be looking at the sheet while making it.

### What the sheet keeps, and what it loses

The **panel stays; the button goes.** The half of a rung that is genuinely about one character —
its price in its own copies, whether it can pay, and which skill the next rung unlocks — is the
thing a list of twenty-three rows has no room for, and it is already written. What the sheet is bad
at is being the _only_ way to ascend.

In its place is a link to the Altar carrying `?focus=<defId>`, which moves focus to that
character's row on arrival. Focus rather than a scroll, because focus scrolls anyway _and_ tells a
screen reader where the player now is. A panel that quotes a price and offers no way to pay it is a
dead end, which is the one thing removing the button could have cost.

### Ascend all needs no confirmation, and the reason is not convenience

Copies are spent on the character they are copies of and have no other use until `ascended-5` turns
them into spark. So no two characters compete for the same resource, and spending a copy forecloses
nothing — "ascend everything" is a well-defined answer rather than a strategy, and a dialog would
be asking the player to confirm the only move. Nothing is lost either: rungs consume spares, never
a character, so the irreversible-loss confirmation this game does not have stays absent.

⚠️ **That is a property of the pricing, not a licence.** `core/roster/ascend.ts` records the
condition that ends it: a rung costing anything with a second claim on it makes this a choice
again, and it belongs back with the player rather than resolved greedily. Any future "do it all"
button has to make the same argument from scratch.

Two smaller things worth keeping:

- **The climb is bounded by the ladder, never by the copies.** A rung a short or damaged table does
  not author reads as _free_, so a loop that stopped when the copies ran out would not stop.
- **A pass that moves nothing returns the same state object**, not an equal one. `ui/` publishes
  what it is handed, so a fresh object would redraw every screen watching the run to show it the
  numbers it already had.

### Town is not a row of shops

The Altar is the first card in Town that spends no wallet currency, and its balance figure is a
count of characters rather than a quantity of anything. That settles what the hub is: **somewhere
you go deliberately, with something you have earned** — which is the test, rather than "a currency
sink". The bar is still Home · Town · Roster · Bag · Settings, still five, still with a spare slot
that is not for spending.

### What AXE caught, within a minute, again

The "Not yet" rows were dimmed with `opacity: 0.7`. Dimming a card dims its text with it, and
`$muted` is 6.4:1 on `$surface` — 70% of that is under the 4.5:1 floor, and the scan failed in all
three browsers. They are drawn as outlines on the page background instead, where `$muted` measures
7.2:1. **Do not reach for opacity to quiet a row whose text is the whole of what it has to say.**

## Not a milestone: the save chain was re-based to v0

Housekeeping rather than a milestone, done straight after chapters shipped. `SAVE_VERSION` went
from 5 to **0**, the four migrations and five historical shapes were deleted, and the five
fixtures became one.

**The one argument that licenses it, and the condition that closes the door.** No save written by
v1 through v5 has ever existed outside development — nobody has played this game but its author,
on dev servers whose storage does not survive the session — so the chain was four migrations, five
schema interfaces and five fixtures maintained for an audience of zero, each a thing to keep
working and to reason about on every schema change. The rule in `AGENTS.md` was therefore
**scoped rather than softened**: _never delete or edit a migration once a build carrying it has
reached a player._ That condition is what makes it enforceable, and it is what makes this
unrepeatable — the moment anyone outside development loads a save, the chain is permanent.

Three decisions inside it worth keeping:

- **The chain walker survived the entries it used to run.** `migrate()` still walks a table and
  `migrate.spec.ts` still drives that walk against a synthetic history. Proven machinery with no
  callers is a far better position than an unproven walker written on the day the first real
  migration is already urgent — which is exactly the day nobody wants to be debugging one.
- ⚠️ **An unreadable save is now discarded and written over, which reverses the highest-stakes
  rule the UI had.** `fatal` used to bar the way to the primary slot, on the grounds that the
  bytes might belong to a newer build and would be readable again after an update. What that
  bought was a run surviving a downgrade; what it cost was a game that boots, plays, and silently
  never writes anything down — the worse failure of the two, and the one a player actually hits.
  `fatal` still reports on the home screen and still drives the backup-slot fallback, so a
  corrupted primary costs nothing and a genuine failure is visible rather than mysterious.
- **A save with no `version` is now damage rather than the oldest schema.** Reading it as v1 was
  right while v1 predated versioning and guessing beat discarding a real run. Nothing below the v0
  baseline exists, so the guess had nothing left to be for.

The load-time repair was untouched and is the reason this cost so little.
`reconcileClearedStages` fixes a shape of damage — rates that say the run climbed further than its
clear count admits — that has nothing to do with migrations, so the e2e cover for it simply seeds
that damage directly instead of arriving at it through a v2 save.

## Not a milestone: the save chain was re-based to v0 a second time

The same housekeeping, on the same argument, after six migrations had grown back on top of the
first baseline. `SAVE_VERSION` went from 6 to **0**, the six migrations and six historical shapes
were deleted, and the seven fixtures became one. **This supersedes every `SAVE_VERSION` figure in
the milestone entries above**, all of which are left as the history of what those milestones
decided.

What was folded in, and what each step had been:

| Step    | What it did                                                                      |
| ------- | -------------------------------------------------------------------------------- |
| v0 → v1 | Gear: `alloy`, the per-character loadout, the bag, the mint counter, the ledger. |
| v1 → v2 | The ladder grew a bottom — every stored `roster[].rarity` shifted up by two.     |
| v2 → v3 | The achievement claim ledger.                                                    |
| v3 → v4 | The daily and weekly quest windows.                                              |
| v4 → v5 | The bounty board's dispatch list.                                                |
| v5 → v6 | The legendary pity counter.                                                      |

Every field they wrote is simply part of the baseline shape now, so `schema.ts` is one interface
again and `data`-facing behaviour is unchanged — the whole unit suite passed with no assertion
retuned, which is what "the chain was maintained for an audience of zero" looks like from the
inside.

**The licence is unchanged and so is the condition that ends it.** No save any of those versions
wrote has ever existed outside development. The rule stays scoped rather than softened: _never
delete or edit a migration once a build carrying it has reached a player_ — and the moment one
does, the chain is permanent and the next version is 1 forever.

Three things worth carrying:

- ⚠️ **The version numbers are now burned twice over.** 1 through 6 have each meant two different
  things — the old v1 was milestone 1's gold counter and the second v1 was the gear schema — and a
  build cannot tell any pair apart from the number alone. What it does with one is at least the
  safe direction: a save at any of those numbers is _newer than this build_, so it is discarded and
  reported rather than repaired into something plausible. It is still a run nothing can recover.
  The previous re-base wrote that "nothing else may be re-issued once a build reaches a player";
  that sentence was doing its job, and this is the second re-base spending exactly what it said was
  spendable while the audience is zero.
- ⚠️ **The tests that named a version number are the ones this breaks, and they broke quietly the
  first time.** `save-recovery.spec.ts` had already gone stale twice by writing a literal, which is
  why it derives from `SAVE_VERSION + 1` — and that derivation is the only reason it still tests
  what it claims to. `migrate.spec.ts` gained the inverse assertion in the same spirit: 1 through 6
  are now each _refused_, and the block says why rather than leaving the next person to rediscover
  it.
- **The chain walker survived a second time**, for the reason it survived the first. It is still
  driven against a synthetic history, and gear's v0 → v1 is the proof that pays for it: the first
  real migration in the project's life landed on tested code and worked immediately.

The deleted steps left three rules behind, recorded in [saves](saves.md) rather than in the code
that used to carry them: the rarity shift is the shape nothing structural can verify, so inserting
a rung anywhere but the top of `RARITIES` is still a save migration; an additive step credits
nothing unless there is a genuine receipt to read; and a migration's constants are written out,
never imported, because a migration is dated.

## Not a milestone: the simulation harness is the only feedback loop

**There is no telemetry and there never will be**, because there is no server. Nobody will ever
know which stage players actually wall on, which characters go unused, or how many runs end in the
first hour. The genre's tuning is done against millions of players; this game has a sample size of
one, and that one already knows the answers.

Two things follow, and both are load-bearing:

- **The balance sweep is not a testing convenience, it is the substitute for players.** AGENTS.md
  defers a separate `*.balance.ts` project until the fast suite "stops being tolerable", which
  frames it as a performance concern. It is not — it is the only instrument this project will ever
  have for finding out whether the game is tuned. Milestones 8 through 11 each change what a
  battle costs, and a sweep is the only thing that will notice.
- **A bad curve cannot be hotfixed.** Every balance change ships through App Store review, so the
  gap between shipping a wall and fixing it is measured in days. That is a standing argument for
  erring generous everywhere: an over-tuned wall you cannot see and cannot quickly fix is the one
  failure mode with no recovery, and the philosophy this project already holds is also its
  insurance policy.

## Not a milestone: the crystal payout was flattened and redistributed

No new system. One number curve replaced by a constant, and the difference handed to the
achievement tracks that shipped in 14b. Three edits, one decision:

- a stage's **first clear pays a flat 250** crystals instead of 200 rising 6 a stage. The ×2
  mini-boss and ×5 chapter-boss multipliers survive untouched;
- **Stage Climber pays 1,000** every five clears instead of 250;
- **Chapter Conqueror** is new: **10,000 crystals for finishing a chapter**, the largest single
  payout in the game.

**Read as three changes it looks like a nerf followed by two buffs. It is one redistribution.**
Over the shipped hundred stages the ladder's first clears fell from about 58,800 crystals to
29,000, and the tracks rose from 5,000 to 40,000 — 69,000 against 63,800, a few percent more in
total. What actually moved is _when_: the old curve paid least at the bottom of the ladder, which
is precisely where a run is three characters short of a full formation and has no other way to fix
it. Crystals banked before the stage-7 healer lock went from 1,750 to 2,500.

### The levelling rates doubled, and gear drops became a range

Two more edits on the same pass, neither of them about crystals:

- **`STAGE_REWARDS.baseRates` doubled** — 1 gold, 0.2 xp, 0.003 essence a second at stage 1, from
  0.5 / 0.1 / 0.0015. The lump followed automatically, being forty seconds of the rate.
- **A stage clear drops a _range_ of gear** — 1–3 ordinary, 2–5 mini-boss, 4–8 boss, where all three
  were fixed at 1 / 2 / 4. The floors are the old fixed counts, so nothing pays less than it did.

**Doubling all three rates together is what made the first one cheap.** Every economy assertion in
`levels.spec.ts` is either a ratio between the currencies or a comparison among them, and a common
factor cancels out of every one: essence still bites late and not early, gold is still the most
comfortable of the three, and all three still land within a third of each other in time-to-afford.
The gear shop and the bounty board are covered by the same cancellation, because both price in
**seconds of the run's own income** rather than in amounts — a doubled rate buys a doubled price.
Doubling _one_ currency would have moved all of it.

⚠️ **The exception is the only assertion denominated in absolute hours, and it is a guard that has
now been spent.** Levelling one character to the 1000 ceiling fell from 1,175 hours of
top-of-ladder idle income to 588, and `levels.spec.ts` says in its own comment that the right
answer when it fires is to retune the curve rather than the threshold. The threshold moved anyway,
to 500, on the one argument available: the _point_ of the change was that progression be twice as
fast, so a level curve steepened to absorb it would have left nothing but larger numbers on screen.
588 hours is still around twenty-five days of unbroken idle for one character, on content that is
two percent of the planned ladder. **The next thing that raises income has to move the curve.**

**The gear range is a rule and a knob wearing the same shape, and telling them apart is the point.**
The floor of 1 is the rule — "a fight never produces nothing" is the same statement as "a pull never
produces nothing", so `dropCount` clamps the minimum up to 1 whatever `data/` authors, and a range
of `0..n` cannot smuggle back the drop _chance_ this design rejected in milestone 12. The ceilings
are the knob. The ranges deliberately overlap, so an unlucky boss and a lucky mini-boss can pay the
same; `gear.spec.ts` holds the rhythm by requiring each kind's floor _and_ ceiling to beat the rank
below it rather than requiring the ranges to be disjoint.

⚠️ **The count draw is the first draw in `rollDrops` and its position is load-bearing**, in the way
every RNG sequence in this project is: every later draw shifts by one, so moving it re-rolls every
historical drop for a given seed. One draw for the batch and a grade per piece, because the two
answer different questions — whether the fight was lucky, and whether the piece was.

### The idle step went back to 1/hr, and that is a threshold moving rather than a curve

A fourth edit, after the three above and on the same currency: `SUMMON_RATE.perClearPerHour` is **1
again**, undoing milestone 11's halving. A fully cleared ladder pays 200 crystals an hour instead
of 150 — **48 pulls a day against 36** — and a fresh save still earns the same pull an hour it
always did, because the base did not move.

⚠️ **This one is honestly a threshold being moved, and it is worth being plain about that** rather
than dressing it as a retune. Milestone 11 halved the step _to stay inside_ the band
`banners.spec.ts` held; this time the step won and the band followed. Two things license it. The
failure mode the curve was ever guarding is a rate that **compounds** past a flat `PULL_COST` — the
old per-stage crystal curve reached a million pulls a day by the end of chapter 1 — and a linear
step cannot do that at any size, so the shape is intact and only the generosity moved. And
generosity is the house position: this is a time economy with nothing to sell, so paying more is
free in a way it would not be in a game with a bridge across the gap.

**The ceiling that is left is the ratio, and it is nearly met.** The ladder's contribution is
`step × stages` against a base of 100, so a hundred stages at a step of 1 exactly **double** the
base where the half-step added 50%. Chapter 3 takes it to ×2.5, chapter 4 to ×3, and that is where
the spec fails — at which point the step is what should give, not the threshold. The band was
widened to 20–60 pulls a day and the ratio ceiling from 2 to 3, both sized so a _doubled_ ladder
still fires them.

### The tier that was in the per-stage curve is still there, one level up

Flattening the base did not flatten the ladder's rhythm — it moved the rhythm off the _stage index_
and onto the _stage kind_, where it was already half-expressed. A mini-boss is still worth two
ordinary stages and a chapter boss five; what is gone is the part that paid a player more for
standing further along, which is the same "worth least where it is needed most" objection the flat
achievement award was authored against in the first place. **Nothing in the crystal economy is
linear in the stage index any more.** The idle rate is still linear in the clear count, and that is
the one place linearity earns its keep — see [economy](economy.md).

### The chapter track needed a counter that does not exist, and got one without a save field

The obvious authoring is `every: 50` over `clearedStages`, and it is wrong in a way that would not
surface for a very long time. Chapters are fifty stages through chapter 10 and sixty from chapter
11 — `CHAPTER_CURVE` is a band function — so a fixed stage interval is correct for exactly the band
it was written in and then pays a "chapter" award ten stages into the next chapter, silently,
forever.

So `AchievementCounter` gained **`clearedChapters`**, which is derived from `clearedStages` against
the shipped ladder rather than stored. ⚠️ **The rule that counters must be things the run already
keeps is about the stored field, not about the counter** — a derived one adds no save version, no
migration, and nothing to the battle path, which is the whole of what that rule protects. The cost
is that `trackProgress`, `allProgress` and `claimAchievements` all take a `LadderShape` now, and it
is **required rather than defaulted**, for the reason `toBattleCombatant` takes a level: a caller
with no ladder to hand would report the chapter track as having earned nothing, on every screen,
forever.

**A coarse counter breaks the progress bar, and fixing that is why `AchievementProgress` grew a
`position`.** A chapter is fifty fights; a bar drawn from the whole count alone sits at empty
through all of them and then jumps, on the single largest reward in the game. So a counter reading
is a whole value _plus_ how far into the next unit the run has come, and `position` is the sum. It
equals `total` for every stored counter, which is what let this land without redrawing the bar on
the track that predates it — and `aria-valuenow` follows `position` so the announced value cannot
contradict a fill the player can see.

### What the specs had to be re-authored to say

`data/achievements.spec.ts` used to assert the track was **3–20% of** what first clears pay, and
called it "a second faucet on progress, not a second income curve". That is now false by design:
achievements pay more than the ladder does. Moving a threshold to make a test green is the thing
this repo's testing rules forbid, so the assertion was **replaced rather than adjusted** — the ratio
is now held within a factor of two either way, which states the new intent (the two are peers) and
still fires when one side is retuned without the other. The old `expect(reward.summons).toBe(250)`
went too: it was a restatement of content, which the same rules warn against, and what replaced it
measures the sum of both faucets in pulls.

## Not a milestone: the gacha grew a second pity curve

No new system, one more counter. The banner now makes two promises instead of one:

- **legendary tier or better within 10 pulls** — new. Soft pity from pull 6 at +25 points, certain
  at 9;
- **ascended tier within 30 pulls**, down from 50. The ramp had to be **re-derived rather than
  clipped**: it used to start at pull 30, which under a cap of 30 would have meant no ramp at all —
  a flat 2.5% for twenty-nine pulls and then a cliff. It starts at 20 with a +15 point step, which
  puts certainty at 27 and keeps the relationship the old curve had: two thirds of the cycle at base
  rate, the last tenth guaranteed.

`SAVE_VERSION` reached **6** — v5 → v6 adds `legendaryPity`, and was the first version number since
the re-base that had only ever meant one thing. ⚠️ **Superseded**: the chain was re-based to v0 a
second time and 6 has now meant two things like every number below it. `legendaryPity` is a baseline
field, and the fixture still stores it mid-cycle for the reason that migration's fixture did.

### What it is worth, and why the base weights did not move

Measured over the stationary distribution rather than inferred from the weights: an ascended-tier
character every **17.6 pulls** against 23.4, and a legendary-or-better every **3.36** against 3.79.
`TIER_WEIGHTS` is untouched at 2.5 / 22.5 / 75.

That split is the point rather than an omission. **A rate is what a player is promised and pity is
what they actually get**, and this project has no reason to make the two agree — the whole argument
in `banners.ts` is that generosity is free here because there is no bridge to sell. Lowering the base
weights to hold the effective rate steady would have been a rate cut dressed as a floor.

### The second curve is a floor under the same roll, not a second draw

⚠️ It raises the **threshold** the single tier roll is compared against. A curve that drew a value of
its own would have broken the three-draws-per-pull invariant the entire save layer leans on — and it
would have broken it silently, because nothing about the results would look wrong. `pull.spec.ts`
asserts consumption is unchanged with the floor active.

⚠️ **At base rate the floor equals the proportional split exactly, and that is load-bearing rather
than a coincidence worth admiring.** With `TIER_WEIGHTS` summing to 1, what the existing proportional
rescale produces at the base ascended rate _is_ `ascended + legendary` — so a run inside the flat
stretch of both curves draws precisely what it drew before this existed, and the floor can only ever
raise the legendary threshold, never lower it. That is what stops deep ascended pity from being
silently undone by a freshly cleared legendary counter, which is the one way two curves over one roll
can fight each other. Weights summing to anything else put them quietly out of step from pull one, in
whichever direction the total leaned; `banners.spec.ts` asserts the sum and the equality.

### The specs stopped restating the curve and started deriving from it

The pity block in `banners.spec.ts` was four assertions against `PITY.hardPity`. It is now the same
four run over **both** curves through `describe.each`, quoted with the live rate function the draw
itself uses.

⚠️ **The "hard cap is a floor, not the mechanism" assertion had to become proportional.** It read
`certainAt < hardPity - 2`. Three pulls of headroom is a tenth of a thirty-pull cycle and nearly a
third of a ten-pull one — one number making two different claims, and it would have failed the
legendary curve for being correctly shaped. It is now a fraction of the cycle.

### Two counters, because a dry spell and a drought are different complaints

One counter cannot bound both. The interval that keeps the top tier from feeling remote is far too
long to keep a session from feeling empty, and an ascended cycle short enough to do that job would
have made the top tier routine.

The shorter cycle is sized to `MULTI_PULL_COUNT` deliberately: **a ten-pull is the unit a player
actually experiences**, and one that came back entirely common was the worst thing this banner could
produce. It is now unreachable rather than merely rare — asserted against the batch rather than
against the counter, and across batches too, so pulling one at a time is not a way to walk past it.

On screen both counters are shown and **only one gets a bar**. The legendary cycle clears three times
inside one ascended cycle, so a second bar of equal weight would read as two competing goals rather
than one goal and a floor beneath it; it gets a line carrying the same two facts the bar does.

## Not a milestone: the presentation track

**Every milestone here is a system, and the genre's draw is at least half aesthetic.** Art,
animation, effects, sound. This project is hand-written components over the palette in
`ui/theme.scss`, and at some point "it works and looks like a spreadsheet" becomes the actual
blocker rather than any missing mechanic.

It is unnumbered because it does not sequence like the rest: it is continuous, it has no
completion state, and it gates nothing. It is written down because a solo developer without an
artist has one constraint most likely to decide whether this ships, and it is this one rather
than any system above.

Equally absent and equally unnumbered: **onboarding**. There is no first-session experience
anywhere in this plan, and the first ninety seconds decide more than milestones 13 through 17
combined.

## Ruled out: genre systems this game will not have

Moved to **[rejected](rejected.md)**, which is now the single list of everything this project decided
not to build — the genre systems (limited-time banners, energy gates, guilds, login streaks) alongside
prestige, the segmented offline solver, the offline cap, role-locked placement, and the fixes that
were measured and failed.

## Later: the two auto-battles

"Auto-battle" means two different features, and neither is milestone 2. Milestone 2 is a
button the player presses. **The second one shipped in milestone 7**; the first stays deferred
indefinitely, and the split below is why. Everything under item 2 is now a description of built
behaviour rather than a plan — it is kept because the constraints are the reason the feature has
the shape it does.

1. **Ambient sparring on the idle screen.** The party visibly fighting in the background while
   the player watches their income tick up — presentation, not simulation. It should not award
   anything, advance a stage, or touch `GameState`; if it did, it would be a second progression
   path competing with the real one. The event log a battle already produces is the natural
   thing to loop for it.
2. **Milestone 7 — an unlockable that re-enters stages until the party loses.** Earned after a certain
   stage. It keeps fighting on its own, and on a loss the player is dropped back to the idle
   screen to either watch their earnings or start again. This one **does** award and advance.

   **It is foreground-only, and that is a design decision with consequences well beyond this
   feature.** It runs with the app open and the player on the battle screen. It does not run
   with the app closed, backgrounded or suspended, and it never advances a stage while nobody
   is watching. That is what keeps every idle rate constant across every offline window, which
   is the entire reason milestone 5 needs no segmented solver — so this is not a detail to
   quietly relax later. Making it run unattended re-opens milestone 5.

   **Each battle is committed when it ends.** Losing the app mid-fight costs that fight and
   nothing else: no pause/resume state machine, no reconciliation on next launch, no partial
   battle to recover. Everything already finished is already banked.

   That last part was a real change rather than a description of the app at the time: results
   reached `GameState` at animation end but only reached storage on `visibilitychange` or the
   thirty-second backstop, so a suspend could lose several **completed** battles at 4x.
   `BattleService.settle` now persists at the end of every fight, auto or not.

   Because the loop is attended, milestone 2's decision to apply results at the end of the
   animation does **not** invert. Backgrounding already pauses the animator rather than
   abandoning the fight. Skipping the animation is a playback choice, not a correctness one.

Neither is blocked on milestone 5 any more — it is complete, and the foreground-only rule above
is what settled it.

## Deliberately deferred

- **Foreground/background handling via `@capacitor/app`.** Still deferred, and milestone 7 is the
  evidence for why rather than a reason to revisit it. Auto-battle was named as the first feature
  that would genuinely care about the difference between a web `visibilitychange` and a real iOS
  lifecycle event, and it shipped without needing one: `BattleService` listens for
  `visibilitychange` and switches the loop off, and because every battle persists as it ends, a
  lifecycle event the web API misses costs exactly one fight. `ui/game-loop.service.ts` covers the
  save side the same way. The trigger to watch for is something whose cost on a missed event is
  **unbounded** rather than one battle — that is what would make the native API worth the
  dependency.
- **Angular Material.** **Removed, not deferred.** It was installed by `ng new` and never
  imported by a single component — five screens' worth of buttons, tabs, a progress bar, a table
  and a disclosure were built without it, all AXE-clean. The only thing it actually did was own
  the scaffolded global stylesheet, and what it did there broke the app's first run on real
  hardware (see milestone 6). If a control ever genuinely needs it, reinstalling is one command —
  but write the global styles by hand rather than accepting `mat.theme()`, which assumes a light
  scheme and a webfont this project cannot have.

Routing is **no longer deferred** — it shipped with milestone 3, for exactly the reason this
list used to give for waiting: the roster and the banner are screens that survive a reload. See
milestone 3 above. Note that routing is also what gives Android's hardware back button somewhere
to go; that question still arrives with `@capacitor/app`, not before.

**`@angular/cdk` and the run reset are both off this list as of milestone 13.** CDK was installed
during milestone 6 and then sat unused for six milestones, which was recorded here as a considered
call rather than a drift; the first overlay is `ui/reset-dialog.ts`, and the entry's argument — that
CDK is an accessibility primitives library rather than a UI framework, and that a hand-rolled dialog
gets focus trapping, restoration, background `aria-hidden` and Escape individually easy and
collectively wrong — held up. The one thing it got wrong was the advice to add CDK's prebuilt global
stylesheets when the first overlay landed: CDK 22 self-loads them, so nothing was added. **Its
presence is still not a precedent** for installing anything else against a future need.

The reset landed where this list always said it would — behind a settings menu, not on the home
screen where a mis-tap can reach it — and it hit the trap the entry warned about: the running game
overwrites external edits to the save, so clearing storage from the app's own tab is undone by the
app on the way out. See milestone 13 for the order that fixes it.
