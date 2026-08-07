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
> and once — later, and in the code — by an in-progress ladder retune. Both are real and both are
> written up below as **14a** and **14b**. Nothing above 14 was renumbered, because nothing above it
> had started.

---

These entries record **what each milestone decided and why**, in the shortest form that keeps the
reason recoverable. The systems are explained in the reference docs — [combat](combat.md),
[attributes](attributes.md), [economy](economy.md), [ascension](ascension.md),
[level resonance](level-resonance.md), [gear](gear.md), [saves](saves.md),
[navigation](navigation.md), [glossary](glossary.md) — and three cross-cutting files carry what used
to be spread across these entries: [rejected](rejected.md) for everything ruled out,
[platform](platform.md) for the shell and accessibility, [testing](testing.md) for the balance sweep.
Where any of them overlaps an entry here, that file is the current statement and this is the history
behind it. `AGENTS.md` states the rules; entries below do not restate them.

**This file is the numbered roadmap and nothing else.** Work that shipped without a milestone number
— the Town hub, the Bag rename, copies-only ascension, the Altar, the two save re-bases, the crystal
flattening, the second pity curve — is recorded in the reference doc that owns the system, not here.

**Save versions are not restated.** The chain was re-based to v0 twice; `SAVE_VERSION` is 0 and the
migration table is empty. [saves](saves.md) carries both re-bases, what the deleted steps are worth
remembering for, and the rules that outlived them.

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
  measured, not guessed: the widest label is 52px inside a 63px tab. It named three ways out and
  **was answered early and differently, by the Town hub** — see [navigation](navigation.md).

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

## Unnumbered: presentation, and the onboarding gap

**Every milestone here is a system, and the genre's draw is at least half aesthetic.** Art,
animation, effects, sound. This project is hand-written components over the palette in
`ui/theme.scss`, and at some point "it works and looks like a spreadsheet" becomes the actual
blocker rather than any missing mechanic.

It is unnumbered because it does not sequence like the rest: it is continuous, it has no completion
state, and it gates nothing. It is written down because a solo developer without an artist has one
constraint most likely to decide whether this ships, and it is this one rather than any system above.

Equally absent and equally unnumbered: **onboarding**. There is no first-session experience anywhere
in this plan, and the first ninety seconds decide more than milestones 13 through 17 combined.
