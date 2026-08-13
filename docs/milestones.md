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

| #   | Milestone                               | Status                                               |
| --- | --------------------------------------- | ---------------------------------------------------- |
| 1   | Tick loop, one resource, save/load      | ✅ **Complete**                                      |
| 2   | Battle up a stage ladder                | ✅ **Complete** — introduced `data/`                 |
| 3   | Gacha, roster, ascension, levelling     | ✅ **Complete** — introduced routing                 |
| 4   | Team composition affecting combat math  | ✅ **Complete** — introduced formations              |
| 5   | Offline catch-up on resume              | ✅ **Complete** — segmented solver ruled out         |
| 6   | Run on a physical iPhone                | ✅ **Complete** — removed Angular Material           |
| 7   | Auto-battle, then doubling the ladder   | ✅ **Complete** — prestige cancelled                 |
| 8a  | The combat rework: the stat block       | ✅ **Complete** — one `atk`, one `def`               |
| 8b  | The combat rework: energy and ultimates | ✅ **Complete** — `mp` and `hp` costs gone           |
| 8c  | The combat rework: skill counts         | ✅ **Complete** — 30 skills, gated by rung           |
| 8d  | The combat rework: lineup bonuses       | ✅ **Complete** — party composition pays             |
| 8e  | Seven characters per faction            | ✅ **Complete** — 49 characters, 3/3/1               |
| 9   | Resonance — levels the roster shares    | ✅ **Complete** — one shared level, derived          |
| 10  | Power that compounds                    | ✅ **Complete** — ×10⁹ levels, enemy levels          |
| 11  | Chapters                                | ✅ **Complete** — 100 stages, income derived         |
| 12  | Gear                                    | ✅ **Complete** — percentage-based, 5 slots          |
| 13  | Settings, and the save-safety gap       | ✅ **Complete** — run reset, first CDK modal         |
| 14a | The ladder retune                       | ✅ **Complete** — closing pressure added             |
| 14b | Achievements, dailies and bounties      | ✅ **Complete** — three faucets, two reminders       |
| 15a | Crews, and Home as the battle hub       | ✅ **Complete** — eight formations, one editor       |
| 15b | The tower system, and the first tower   | ✅ **Complete** — Human Tower, 100 floors            |
| 15c | The remaining six towers                | ✅ **Complete** — seven towers, 42 archetypes        |
| 16  | Signature items                         | ✅ **Complete** — emblems, seven signature items     |
| 17a | Four mechanics and eight archetypes     | ✅ **Complete** — taunt, reflect, link, bomb         |
| 17b | Chapter 3 — The Bound Marches           | ✅ **Complete** — 150 stages, three guards moved     |
| 18  | Chapter 4 — The Sundered Vault          | ✅ **Complete** — 200 stages, pairs, no new mechanic |
| 19  | The six-chapter re-cut                  | ✅ **Complete** — same 200 stages, six finals        |
| 20  | A second ascended-tier rank             | ✅ **Complete** — 56 characters, 14 signature items  |
| 21a | Chapter 7 — The Waking Barrows          | ✅ **Complete** — 250 stages, 72 archetypes          |
| 21b | Chapter 8 — The Sunless Weald           | ✅ **Complete** — 300 stages, 82 archetypes          |
| 21c | Chapter 9 — The Hollow Anvil            | ✅ **Complete** — 350 stages, 92 archetypes          |
| 21d | Chapter 10 — The Bleeding Wild          | ✅ **Complete** — 400 stages, 102 archetypes         |
| 21e | Human Tower, floors 101–200             | ✅ **Complete** — 200 floors, 106 archetypes         |
| 21f | Dwarf Tower, floors 101–200             | ✅ **Complete** — 200 floors, 110 archetypes         |
| 21g | Elf Tower, floors 101–200               | ✅ **Complete** — 200 floors, 114 archetypes         |
| 21h | Undead Tower, floors 101–200            | ✅ **Complete** — 200 floors, 118 archetypes         |
| 21i | Monster Tower, floors 101–200           | ✅ **Complete** — 200 floors, 122 archetypes         |
| 21j | Angel Tower, floors 101–200             | ✅ **Complete** — 200 floors, 126 archetypes         |
| 21k | Demon Tower, floors 101–200             | ✅ **Complete** — 200 floors, 130 archetypes         |
| 22  | The roguelite run                       | ⬜                                                   |
| 23  | Puzzle maps                             | ⬜                                                   |

> **Milestone 14 was two milestones wearing one number, and is now split.** The number was claimed
> twice: once by the planned "dailies, bounties and notifications" entry written long in advance,
> and once — later, and in the code — by an in-progress ladder retune. Both are real and both are
> written up below as **14a** and **14b**. Nothing above 14 was renumbered, because nothing above it
> had started.
>
> **17 was the roguelite run and is now chapter 3; the roguelite and the puzzle maps moved down one.**
> Renumbering was safe for exactly the reason it was refused at 14: neither entry had started. The
> rule is about **work in progress**, not about the numbers.
>
> **They moved down once more when 19 became the six-chapter re-cut**, under the same rule: the
> roguelite was 20 and the puzzle maps 21, and neither had started.
>
> **And once more for milestone 20, the second ascended-tier rank** — same rule, same reason,
> fourth application. If either is ever started, this stops being free and the next entry gets
> appended instead.
>
> **Fifth and — on the current plan — last application: 21 is the content push.** Four chapters
> and seven tower extensions took the number; the roguelite is **22** and the puzzle maps are
> **23**. Neither had started, which is still the whole of the licence. ⚠️ **Both have now moved
> five times and the rule that keeps this honest has never been about the numbers** — it is that
> nothing renumbered has any work in it. The next thing that wants 22 has to check that again
> rather than citing this note.

---

These entries record **what each milestone decided and why**, in the shortest form that keeps the
reason recoverable. The systems are explained in the reference docs — [combat](combat.md),
[attributes](attributes.md), [economy](economy.md), [ascension](ascension.md),
[level resonance](level-resonance.md), [gear](gear.md), [signature items](signature-items.md),
[saves](saves.md), [navigation](navigation.md), [glossary](glossary.md) — and three cross-cutting files carry what used
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

> **Split into three.** The milestone as planned was one entry; building it made the seam obvious.
> **15a** is the plumbing every tower needs and the campaign wanted anyway — eight crews, one
> editor, and Home as the place a fight is chosen. **15b** is the tower system end to end with a
> single tower shipped, so the ladder, the rewards and the balance sweep are proven against content
> that exists before six more are authored. **15c** is the remaining six and the enemy archetypes
> they need. The reasoning below is the whole milestone's; each sub-entry records what it decided.

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

## 15a. Crews, and Home as the battle hub — **COMPLETE**

The note this entry replaces called saved team presets "pure quality of life… the cheapest thing in
this milestone and the one most likely to be cut for being unglamorous". **It was neither cheap nor
optional.** Seven towers plus the campaign is eight line-ups, and the game had exactly one — not as
a screen but as a _field_: `GameState.formation`, singular, read by the battle path, the bounty
board, the roster screen and the save layer. Towers cannot be built on top of that, so this
milestone rebuilt it and shipped no towers at all.

**No content, no ladder, no reward.** What changed is where a crew lives, who edits it, and where a
fight starts.

- **Eight live formations, not one live formation and seven templates.** A template model keeps
  `GameState.formation` as the thing that fights and makes the rest inert copies loaded into it —
  cheaper, and it spends a step of the player's attention on bookkeeping the game could do. A crew
  that has to be _loaded_ before it is real is a crew the player has to remember to load.
  `FormationBook` is a keyed record for the reason the wallet and the achievement ledger are: an
  eighth activity is a key and a row in `data/`, not a save migration.
- ⚠️ **One character may stand in several crews at once, and that is not damage.** Only one
  activity is fought at a time. What is still forbidden is standing twice _within_ one crew, which
  is the state that would let a fighter act twice — and the decoder's dedupe set is deliberately
  scoped per formation for exactly that reason.
- ⚠️ **The bounty board's disjointness rule was widened, and the widening is interim.**
  `fieldedMembers` now reads every crew, which keeps the invariant exactly as strong as it was. It
  also gets tighter as towers get crewed: eight crews is forty slots against forty-nine characters,
  so a player who fills every tower has almost no bench left to dispatch, and the board stops being
  a bench sink because there is no bench. **The agreed fix is to invert the rule rather than widen
  it** — let anybody be dispatched, and refuse to _fight_ with somebody who is away. That moves the
  check to the battle path, where it costs a crew the player must fill in rather than a mission they
  cannot start, and it must land before 15c crews all seven towers.
- **No save migration, and `SAVE_VERSION` stays 0.** A save written before the book carries the old
  `formation` object; the decoder reads it into the campaign key as **load-time repair**. Defaulting
  it away instead would have let `grantStarters` hand back the three starters and silently disband a
  party the player assembled — the plausible-looking wrong answer, which is the class of damage the
  save layer exists to prevent. See [saves](saves.md).
- **The roster screen stopped being a formation editor.** Not because eight crews would not fit in
  the markup, but because the screen would then answer two unrelated questions at once: _who is
  worth levelling_ and _who is going to which fight_. Placement moved out whole to `/formations`,
  and the roster kept the shared level, the faction groups and a link. The "Fielded" section and
  the fielded-first sort went with it — both answered "who is actually fighting" while five of
  forty-nine rows were in one formation, and with eight crews they would cover most of the roster
  and distinguish nothing.
- ⚠️ **The pre-battle step is a route, not a modal.** "Pop up the formation before every battle"
  was the requirement and a CDK dialog was the obvious build. A route wins on three counts: a full
  crew editor is more than a phone-sized overlay holds without scrolling inside a scroll container;
  a route survives a reload, which is this project's own stated trigger for routing; and the dialog
  would have to trap focus around forty-odd controls. `/formations/:activityId` and
  `/prepare/:activityId` are **one component** — a picker that could do less than the editor would
  send the player to the editor and back.
- ⚠️ **`prepare` is route data rather than a query parameter**, so a hand-typed
  `/formations/campaign?fight=1` cannot become a second, undocumented entry into the battle path.
- **Home is the battle hub, and its Fight control is a link that is never disabled.** It used to go
  inert with an empty formation, which left a new player on a dead button beside a hint pointing at
  another screen. An empty crew is now the best reason to follow the link: the screen it opens is
  where the crew is filled, and the Fight control _there_ is the one that waits.
- **Nothing empty ships for the towers.** Home's battle section holds one card and the formations
  index one row — the same call the Bag rename made, where the second heading arrives with the
  second kind of item.

The faction lock lives in `core/activity.ts` already, unused by any shipped activity: it is called
by the editor **and** by the battle path, and two implementations of one rule is how a screen ends
up promising a legal crew that the fight refuses.

Shipped: `core/activity.ts`, `FormationBook` in `core/state.ts`, `data/activities.ts`,
`ui/formation.service.ts`, `ui/lineup-copy.ts`, and the two screens.

## 15b. The tower system, and the first tower — **COMPLETE**

Everything a tower is, proven against one of them. A tower is **100 floors, enemy levels 1 to 60,
linear** — deliberately gentle, and well inside the campaign's own range, which runs to 85 by the
end of chapter 2.

### What shipped

- **`core/towers.ts`** — `floorLevel` (the derived linear curve), `floorKindAt` (the campaign's
  mini-boss rhythm reused), `nextFloor` (returning `null` at the top rather than clamping, which is
  the climb-once rule in one line), `matchedStageIndex` (level-matched lumps and gear grades),
  `floorSummons`, `resolveFloor`/`resolveTower`, `applyTowerResult` and `parseTowers`.
- **`GameState.towers`** — one integer per tower, the highest floor cleared. Serialized, parsed and
  clamped; absent decodes to `{}`, so no `SAVE_VERSION` bump and no migration.
- **The Human Tower** — a hundred authored floors in `data/tower-human.ts`, `TOWER_RULES` and
  `TOWERS` in `data/towers.ts`, and the activity row that gives it a crew.
- **Two achievement tracks** — Spire Climber every five floors, Spire Conqueror at the top — over a
  new `towerFloors` counter.
- **The battle path, generalised** — `StageHeading` now carries a rendered position rather than a
  chapter and a stage, `BattleService` resolves either kind of content, and `TowerService` is the
  read model three screens share. Home draws a row per tower.
- **The balance sweep** — `data/towers.balance.ts`, plus the structural half in `data/towers.spec.ts`
  and the unit spec for `core/towers.ts` the model had shipped without.
- **The bounty inversion**, which was scheduled into this milestone. See below.

### Where the difficulty landed, and what set it

The reference crew is **five Humans at `rare-plus`, level 60, no gear** — and the level is derived
rather than chosen, because `rare-plus`'s cap is exactly the tower's `topLevel`. It clears all
hundred floors; what ramps is **what a floor costs**. Floor 1 resolves in a second, floor 50 in
seven, floor 80 in twelve, and the roof in twenty-four with two of the five dead. Nobody dies below
floor 80.

**A 100% win rate the whole way is the intended shape, not a miss.** A floor is climbed once and
there is no way around one, so a floor the crew cannot pass stops the tower — which makes win rate
the wrong dial and cost the right one. The one measurement that _is_ contested is a second Human
five: it takes the roof 85% of the time, which is what says the tower is tuned against an investment
rather than against one solution.

⚠️ **The first pass was far too easy and the reason is worth keeping.** A `rare-plus` party has one
ascension rung (×1.6) and the mono-faction bonus (+25% attack and health) that the enemy side has no
equivalent of, so at _equal level_ it is comfortably ahead. Against a five-slot board the only lever
left is archetype weight, and it turns out to sit almost entirely in the **front rank**: two ascended
blocks in front of three legendaries is a real fight at level 60, while the same board with
legendary anchors is a formality. It is also sharply non-linear — pairing the two heaviest hitters
(an Unmade beside a Tyrant) takes the crew from a clean clear to a 3% win rate, so the top band
deliberately uses neither.

⚠️ **There is no ascended-tier Undead archetype**, which is the constraint that shaped the bias. An
undead-only board caps at legendary, so the heavy anchors on the top floors have to come from other
factions — which is why the counter-faction lean is a share of the **whole tower** (53% of enemy
slots) rather than a rule applied per floor.

### Measuring the bias took three attempts, and the two failures are the useful part

The decision being defended is that a tower's enemies lean toward the faction that counters it, "so
the matchup matrix stays live inside a tower rather than a mirror match, which would switch it off
entirely". Proving that turned out to be harder than stating it.

- ⚠️ **Comparing against another faction's five measures two things at once.** The obvious control is
  to sweep the same floors with an Undead five at the same investment. It came out _slower on every
  floor_ — because the Undead five available at that investment is simply a weaker party. That says
  nothing about the matrix.
- ⚠️ **Fight length is the wrong metric.** The matrix cuts both ways: the crew takes 5% more from the
  Undead half of the tower _and_ deals 5% more to the Monsters and Dwarves anchoring its front ranks.
  Measured in seconds the biased tower is marginally **faster** than a neutral one (780s against
  785s), so an assertion in those terms would have read as the bias making the tower easier.
- **What works is a mirror match, measured in party members lost.** Rewrite every enemy's faction to
  the tower's own — exactly the counterfactual the design rejected — and the bias costs about 5% more
  of the party over a full climb. Small in aggregate, because 95 of the 100 floors were never in
  doubt; on the one floor that _is_, the alternate five goes from 90% on the mirror to 85% on the
  real thing. That is the same reading `chapters.balance.ts` had to arrive at before the matchup
  edges could be sized at all: **the matrix decides fights at a party's ceiling and nothing else.**

### Three smaller things the wiring forced

- **`StageHeading` had to be generalised, and it now carries the rendered position rather than its
  parts.** A chapter and a stage within it is a shape only the campaign has; a floor is one number in
  one tower, and the two do not reduce to each other. So `where` is the big line (`2-14` or `F37`),
  `place` locates it, and no screen asks which kind it is drawing. ⚠️ **`label` is a fourth string
  and it earns its place**: a campaign stage wants its position spelled out beside its name, and a
  floor's name already _is_ its position, so one template would have read "F40 — Floor 40".
- ⚠️ **"The crew is legal" and "there is a fight behind it" are independent, and the first cut
  conflated them.** A tower the campaign has not opened, and a tower already topped, are both
  activities with five perfectly good characters standing in them and nothing to send them at.
  `BattleService.fight` refuses both, so a Fight control that only asked `CrewView.ready` would look
  live and silently do nothing — the same failure the away-guard note below warns about, arriving
  from the other direction.
- **An auto run needed a second ending.** The loop stopped on a loss and reported the stage that
  stopped it; a tower adds "ran out of floors", and reporting that as a loss would take credit off
  the player at the moment they earned the most. Told apart by asking whether the activity has
  anything left to fight.

### The bounty rule inverted, which 15a scheduled and this milestone paid

15a widened the disjointness check to read every crew, and recorded that as interim. It is now
inverted, which is what the widening was always going to have to become.

- **Anybody may be dispatched; a crew holding somebody away cannot fight.** The invariant is
  unchanged — nobody is in two places at once — and it is enforced in one place instead of three.
- **Why it had to move**: eight crews is forty slots against a forty-nine character roster, so a
  player who had crewed every tower had no bench, and the board starved exactly when the roster
  breadth it exists to reward was widest. The cost is now a crew the player fills in rather than a
  mission they cannot start — a formation is edited in seconds and a mission runs for hours.
- ⚠️ **`repairDispatches` now keeps a mission whose crew is also fielded.** That is an ordinary
  state a player reached on purpose; dropping it would take back hours of a wait, unpaid.
- ⚠️ **The battle guard is the away case only, never `CrewView.ready`.** The first cut used `ready`,
  which is also false for an **empty** crew — and an empty party resolving as an immediate defeat is
  behaviour `simulateBattle` owns and two auto-battle specs use to make a loss deterministic. The
  broad guard replaced a fight the player loses with a control that silently did nothing. The specs
  caught it.

### The decisions this milestone settled, so 15c is authoring rather than design

- ⚠️ **Tower clears may not feed `clearedStages`.** That counter drives the idle crystal rate, and
  `banners.spec.ts` bounds a cleared ladder at ×3 the base where the shipped hundred stages already
  put it at ×2. Seven towers at a hundred stages each would make it ×8. Towers keep their own
  progress, per tower.
- **A floor is climbed once.** No re-fighting a cleared floor, which keeps a tower a climb rather
  than a second farm — and collapses the campaign's two payouts into one, since "paid on every
  clear" and "paid on the first clear" describe the same event here.
- **A tower clear pays a lump, gear, and flat crystals — and no idle rate.** The campaign stays the
  income spine; a tower is the roster sink. The lump and the drop grades come off the campaign's own
  curves, read at the **matched enemy level** rather than the matching floor number: floor 100 is
  level 60 where campaign stage 100 is level 85, so index-matching would pay the top of the ladder
  for a fight two thirds as hard.
- **Enemies are drawn from every faction, biased toward the one that counters the tower's.** So the
  matchup matrix stays live inside a tower and a mono-faction crew meets fights it is favoured in
  and fights it is not — rather than a mirror match, which would switch the matrix off entirely.
- **Faction-locked, and open early** — around the auto-battle unlock at 12 clears, so a player
  walled at the chapter-1 healer lock already has somewhere to send an unlucky pull. A tower that
  cannot yet be crewed shows which faction it wants.
- **The Human tower ships first, and the choice is about content rather than theme.** Undead counter
  Humans and already have five archetypes; Monsters (six) and both celestials counter mortals too.
  It is the only tower that needs no new enemy blocks, which is what lets this milestone be about
  the system. Contrast the Angel tower, countered by Demons alone — three archetypes, and the
  thinnest pool of the seven.
- **The balance target is five of the tower's faction at `rare-plus`, level 60, no gear**, clearing
  floor 100. Three rungs, sitting between chapter 1's party (`common-plus` at its cap) and the
  ladder's finisher (`elite`, level 85). ⚠️ **The level is derived, not chosen**: `rare-plus`'s cap
  is 60, which is exactly the tower's top enemy level, so the party tracks the content.
  - **No gear, deliberately.** A player crewing seven towers has one bag to equip thirty-five
    characters from, so tuning against a fully geared five would tune for a party nobody with seven
    crews can field.
- **Crystals: 100 a floor, plus 500 per five floors, plus 10,000 for topping a tower.** Roughly
  149,000 across seven towers before the completion awards and about 219,000 with them, against the
  campaign's ~69,000 — a bit over 3× the critical path for 7× the content, on optional ladders gated
  behind roster depth. ⚠️ **The per-floor figure came down from the campaign's 250 for a reason
  worth keeping**: at parity the seven towers pay ~268,000, which is 3.9× the campaign from stage
  clears alone and makes the ladder's own rewards look pointless beside them.
  - **The completion award needs no new mechanism.** A track with `every: 100` over a hundred-floor
    counter pays exactly once, so "finish the tower" is an interval like any other.

## 15c. The remaining six towers — **COMPLETE**

Six more hundred-floor ladders, and the eighteen enemy archetypes they needed. The prediction above
was that this milestone would be authoring rather than design, and that was **half right**: the six
towers really are four files each, and the wiring took no new concept. What was not authoring is the
part below.

### What shipped

- **Six towers** — Dwarf, Elf, Undead, Monster, Angel and Demon, in `FACTIONS` order, a hundred
  floors each, all opening at twelve clears alongside the Human Tower. Every tower is now one row in
  `data/towers.ts`, one in `data/activities.ts`, two achievement tracks and its floors.
- **Eighteen enemy archetypes and nine skills**, taking every faction to six blocks — two `common`,
  three `legendary`, one `ascended`. The counts were monster 6, undead 5, human 5, dwarf 3, demon 3,
  **elf 1, angel 1**; the two ones were the Undead and Demon towers' whole lead faction.
- **`data/enemies.spec.ts`**, which is where "fields every archetype it ships" went. It was in
  `chapters.spec.ts` while the campaign was the only content, and it needed a file that can see
  every ladder.
- **Twelve achievement tracks**, and the heading resolution the fourteenth made necessary.
- **The balance sweep, at seven towers** — seven reference crews, seven alternates, and the mirror
  control regrouped. 65 seconds for the whole balance project, against 9 for one tower.

### The archetype counts were the milestone, not a prerequisite for it

Every tower leans toward the faction that counters the one it admits, so **the lead faction's
archetype count is the tower's variety**. Elves and Angels had one block each, which would have made
the Undead and Demon towers a Sky-Shrike and a Hierophant, a hundred times. Eighteen new blocks is
what six towers actually cost.

The tier split matters as much as the count. A tower runs from enemy level 1 to 60, so its lead has
to supply both ends: commons for the low floors, an `ascended` block to anchor a top band. Four
factions had no `common` at all and three had no `ascended`, which is why the shape is asserted per
faction in `enemies.spec.ts` rather than the count alone.

⚠️ **Two `ascended` blocks arrived and both are sized _under_ the campaign's heaviest, deliberately.**
The Barrow Sovereign closed the gap 15b recorded — no ascended Undead — and the Wyrdroot Ancient did
the same for Elves. Neither reaches the Unmade, and `enemies.spec.ts` holds that as a rule rather
than a coincidence: 15b measured that a top band is almost entirely its front rank's weight and that
the weight is sharply non-linear, so a third and fourth heavy anchor is the change that makes six
towers fail their sweep at once.

### The tolerance on a top band is narrower than 15b could see

15b tuned one tower against one crew and concluded that "two ascended blocks in front of three
legendaries" is the top band. Against seven crews that is **not a shared weight**, and three of the
six new towers failed their first sweep on exactly it:

- **The Dwarf five carries the lowest `atk` in the game.** `Oathbreaker + Colossus` — the Human
  Tower's roof, cleared at 90% — is 0% for Dwarves. The anchors came down to `Oathbreaker + Warden`,
  the lightest ascended pair in the game.
- **The Monster five has no healer**, only leech, and no faction it is favoured against inside its
  own tower. `Tyrant + Oathbreaker` was 33%.
- **The Angel five is four supports and a wall.** `Unmade + Hierophant` was 3%.

So anchors are sized **per tower against its own crew**, which is the thing the original note assumed
would generalise. It does not.

⚠️ **And one roof was a timeout rather than a fight.** The Dwarf boss at `Oathbreaker + Warden` behind
a Marsh Acolyte was unclearable at 28% — while floor 90, an identical board six enemy levels lower,
cleared cleanly. Against a party that cannot burst, a healer on the last floor stops being a lock and
becomes the ninety-second clock. The roof dropped the Acolyte; the mini-bosses below it kept theirs.

### Two towers the matchup matrix cannot point at, and one it points at from every direction

The bias rule assumed every tower has a counter faction and that a mirror match is the neutral
control. Both assumptions are false for three of the seven, and each exception is now **asserted**
rather than filtered out — a skip would have left the only interesting property of those towers
untested.

- ⚠️ **The celestial towers invert the mirror control, by construction.** An Angel deals ×1.10 to
  every mortal with nothing coming back, and only the other celestial trades evenly with one. So an
  all-Angel board is the **hardest** thing an Angel five can be pointed at, and
  `biased > mirrored` is not merely false there — it cannot be true. That is the celestial advantage
  `combat.ts` documents and prices on the luck-only ascension ladder, not something a tower may claw
  back, so `towers.balance.ts` asserts the inversion and a future matrix edit that removes the
  asymmetry fails loudly.
- ⚠️ **The Monster Tower has no lean, and that _is_ its lean.** Every faction counters Monsters —
  four mortals at ×1.05, both celestials at ×1.10, and Monsters themselves at ×1.10 — so "field what
  counters the crew" resolves to all seven and it ships as an even spread. `towers.spec.ts` derives
  that case off the matrix (`countersOf(faction).length === FACTIONS.length - 1`) rather than naming
  `monster`, and bounds the spread on both sides instead of asserting a leader.
- ⚠️ **The mirror is not a control for it either**, and for a different reason: `monster → monster`
  is the matrix's one self-edge, so mirroring that tower turns the matrix **up** rather than off. The
  exclusion is made load-bearing by asserting the self-edge exists, so removing that edge puts the
  tower back into the block where it would then belong.

**No two towers lean on the same faction**, which is now its own assertion. Human←undead,
dwarf←human, elf←dwarf, undead←elf, angel←demon, demon←angel, monster←everything. Seven towers
leaning on Monsters — the only faction deep enough to lead more than one before this milestone —
would have been one tower shipped seven times.

### Three smaller things

- **All seven open at twelve clears, together.** Which tower a run enters is meant to be settled by
  who it owns; staggering the unlocks would gate a player holding five Elves behind clears that have
  nothing to do with them.
- **The fourteen tower tracks share two names between them**, so the achievements screen resolves
  the heading as `Spire Climber — Dwarf Tower` from `TOWERS` rather than the faction being authored
  into each track. Not cosmetic: seven identical `<h2>`s and seven progress bars with the same
  accessible name is a WCAG failure.
- **No save migration, and `SAVE_VERSION` stays 0.** `GameState.towers` and `GameState.formations`
  are keyed records that already keep unknown keys on load — which is exactly what 15a and 15b built
  them for — so six towers add no field, no migration and nothing to repair.

**The bounty fix landed in 15b**, ahead of the towers that make it bite, so nothing here waited on
it. Eight crews is forty slots against a forty-nine character roster, and that arithmetic is now
real rather than projected.

## 16. Signature items — **COMPLETE**

**The answer to the question milestone 10 leaves open** — what a run invests in once a character
has nothing left to ascend. A per-character track that unlocks deep into the ladder, bought with a
currency that exists for nothing else, and worth both **stats and an ability**.

⚠️ **This entry used to describe a different feature and the difference is worth recording rather
than overwritten.** It specified a track that modified **behaviour rather than adding stats**, fed
by **duplicate copies**. Both halves were reversed deliberately:

- **Stats _and_ behaviour**, not behaviour alone. The old argument was that "at ×10⁹ raw power
  another multiplier is invisible", and that is simply not true of a _percentage_ — gear proved it
  two milestones earlier, where a relic set is worth the same +216% health at level 1 and at level 1000. What the argument was really reaching for is that thirty levels of pure stats is a
  treadmill, and the answer to that is the ability track, not the absence of stats. So a signature
  level buys a slice of stats **and** the tier marks buy an ability, and each is the reason the
  other is worth paying for.
- **Emblem-fed, not duplicate-fed.** The old reasoning was that copies past `ascended-5` convert to
  spark and spark buys more characters, "a loop with no exit". True, and this does not close it —
  duplicates still convert to spark. The fix for too many duplicates is more ascended-tier
  characters as the roster grows, which is content rather than a sink.

### What shipped

Read [signature items](signature-items.md) for the system. In short: an **Emblem** currency, and a
one-integer track per ascended-tier character.

- **Ascended tier only.** Seven of the forty-nine characters, one per faction. Common- and
  legendary-tier characters have no signature item by design.
- **Unlocks at `mythic`** — four rungs above where an ascended-tier character starts, which is 27
  copies for a mortal and 39 for an Angel or Demon.
- **Thirty levels**, costing `10 + 1.6 × (L − 1)` emblems each, **996 for the climb**. Level 1 is
  the unlock and is bought, never granted.
- **Stats every level**, roughly +150% split across two or three stats by level 30, authored per
  character to sharpen the niche it already has.
- **An ability at levels 1, 10, 20 and 30**, expressed as partial overrides merged over the
  character's own skills plus an opening status on the wearer. Merged once when the combatant is
  built, so the simulation loop never learns signature items exist.

### What it is worth, measured

`data/signature.balance.ts` fields each of the seven at the unlock rung and bisects for the highest
enemy level the party clears. A maxed item is worth **+11 to +35 enemy levels of reach**, ×1.03 to
×1.08.

⚠️ **That reads modest and is not, and the gap is the step function.** Measured instead as win rate
at a fixed contested level, the same items take four of the seven from **0.00 to 1.00**. An item
worth a few percent of reach is worth the entire fight at the margin, because the margin is where
every fight a player has not already won sits.

### ⚠️ Two things this milestone exposed that are not about signature items

- **There is no shipped content a signature item can be measured against.** `mythic` caps at level
  **340**; the hardest authored stage was the chapter 2 boss at level **85**. A party at the unlock
  rung is four times past the top of the ladder, so every campaign fight it takes is a walkover.
  The balance probe has to re-level the hardest encounter to the party's own level to make a
  contest at all — the same move `core/towers.ts` makes. Nothing is wrong; the gate is deliberately
  deep. But **a signature item has no authored content to matter in**, and no sweep over shipped
  stages can ever bound one.

  ⚠️ **Chapter 3 was named here as the thing that would close this, and it does not.** The Bound
  Marches top out at enemy level **160** against a `mythic` cap of 340, so the gap narrowed from
  ×4 to ×2 and the conclusion is unchanged. What would close it is a chapter reaching the low
  three hundreds — roughly chapter 6 or 7 at the current pacing — or a tower band that does.
  `data/signature.balance.ts` still re-levels its encounter and still has to.

- **The emblem faucet is dominated by drops, not by the idle rate.** The idle rate is the half with
  the pacing argument attached and it is the smaller half by roughly ×7 for anybody running
  auto-battle — because the campaign position stops at the last stage so it stays farmable, and the
  last stage of a chapter is a **boss**, which is the 25% drop row. See
  [economy](economy.md#emblems).

### Where it surfaces

- **A panel on the character sheet**, drawn only for the seven. ⚠️ Absent is not the same as
  locked: a locked panel names the rung that unlocks it, and a character that can never have one
  gets no section at all, because a permanently empty panel reads as content that is missing.
  **No "buy as far as I can afford" control** — emblems are shared across every ascended-tier
  character, so spending them _is_ the decision, unlike a character level, which competes with
  nobody, and unlike `ascendAll`, whose copies are spendable on one character.
- **Two achievement tracks** over a new derived counter, `signatureLevels` — the sum of
  `roster[].signature`. It stores nothing new and is monotonic. Both pay **crystals**: an emblem
  award on an emblem-spending track is a partial refund that would flatten the cost curve.
- **Emblems on Chapter Conqueror**, 100 a chapter. The one track paying two currencies, and the
  right one — finishing a chapter is already what steps the emblem rate.

### No quests, and that is a decision rather than an omission

All three available shapes fail: a quest over `signatureLevels` stops moving at 210 and does not
move at all before the first unlock (the ban `clearedStages` carries); a quest over emblems _held_
is not a counter, because a quest measures a delta from a baseline and a balance goes down when
spent; and a quest _paying_ emblems is decorative beside a drop faucet already worth ~15/hr. See
[rejected](rejected.md), which records the trigger that would revisit it.

## 17. Chapter 3, and the vocabulary it needed

> **Split into two.** **17a** is four new mechanics in `core/battle` and the eight archetypes that
> field them — provable against the shipped ladder and the seven towers before a single stage is
> authored. **17b** is the fifty stages and the three economy guards a longer ladder trips. The
> reasoning below is the whole milestone's.

**The chapter is the deliverable; the mechanics are what made it worth authoring.** Chapter 2's
argument for new archetypes was that `core/battle/types.ts` held vocabulary nothing had used —
`enemy-row-back`, `enemy-lowest`, the `self-hurt` condition. By milestone 17 **every targeting,
status and effect kind was in use**, so the honest options were a ninth spelling of "hits the front
rank harder" or growing the vocabulary once, deliberately.

### 17a. Four mechanics and eight archetypes — **COMPLETE**

Four new `StatusData` kinds, chosen so all four ride the existing `status` effect rather than adding
effect kinds: **taunt**, **reflect**, **link** and **bomb**. Three of the four are about _where a hit
is allowed to go_ rather than how big it is, which is the lever nothing in the game had — and the
reason the chapter reads as a different place rather than as the Ashfall Reach at a higher level.
[combat](combat.md) carries what each one does and the termination argument under it.

- ⚠️ **A taunt is the only thing in the game that can close the back door**, and that is both why it
  is worth having and the whole of its risk. Reach has answered a protected healer since milestone
  4; this takes that answer away. Two clauses keep it fair and both are held by specs: multi-target
  selections ignore it entirely, and the skill applying it has a **cooldown longer than the status**
  so a single-target party always gets a window. ⚠️ **No `opening` may carry one** — a permanent
  taunt in front of a healer is a ninety-second clock, which is a defeat rather than a hard fight.
- ⚠️ **Reflect and link cannot cascade, and the argument is structural rather than a depth counter.**
  Both resolve through the same `statusDamage` path, which never re-enters the attack path — so
  thorns cannot answer thorns and a link cannot spread a share it was handed. A link **conserves**
  damage rather than multiplying it, and a lone holder takes the whole hit; without that second
  clause the last survivor of a linked board would be unkillable.
- **A bomb is the mirror of a poison and asks the opposite question.** A poison punishes a slow kill
  continuously; a bomb punishes it once, at a known tick, and a cleanse spent before that tick
  removes the whole thing. So the decision is _when_ to spend the answer rather than whether to.
- ⚠️ **Two things in the engine changed shape and both were invisible until now.** `toEnemyCombatant`
  **dropped `opening`** — the field arrived for signature items and nothing on the enemy side had
  used one — so an archetype could not state a passive; and `act()` had no liveness check, because
  before reflect nothing could kill an actor inside its own action. Neither was a bug anybody could
  have hit; both are now.
- **The whole change is bit-identical for shipped content.** All 1,961 unit tests and all 32 balance
  assertions passed before a stage was authored, which is what the split was for.

### 17b. Chapter 3 — The Bound Marches — **COMPLETE**

Fifty stages, enemy levels 85 to 160, thirty-two archetypes — **eight new, twenty-four returning**,
a quarter new. Twelve of the returning ones were authored for the towers in 15c and had never
appeared in the campaign at all. The four mini-bosses and the boss field boards that appear nowhere
else, and the boss fields a **block** that appears nowhere else: The Chainsworn stands on `c3-s50`
and on no other stage in the game.

- ⚠️ **A chapter that asks for a new rung has to out-climb the rung it asks for**, and this is the
  arithmetic that made the first draft a walkover. It was authored at 85 → 130 with the reference
  party at `elite-plus` and **every stage fell to the party it was meant for**. An ascension rung is
  worth ×1.6 and the enemy side has **no rungs at all** — `toEnemyCombatant` never grew that third
  dial — so a party matching the enemy's level from one rung higher is ×1.6 ahead of it. Twenty-three
  levels is what ×1.6 costs at `perLevel.common`, and that is where the extra thirty at the top came
  from. Chapters 1 and 2 never met this because each ran inside a cap the party already had.
- **So the ladder now climbs past the cap of the rung it asks for**, and the reference party finishes
  it **twenty levels below the thing it is fighting**. That is the difficulty statement rather than
  an accident: `INVESTED` is `Math.min(top stage, the rung's cap)` for the first time.
- **A third reference party arrived with it.** `ARRIVED` is the five that just took The Unmade,
  unchanged, and it makes the seam measurable from both sides — it clears chapter 2 end to end and
  is bounded on how far it walks into chapter 3, exactly as `BUILT` is against chapter 2.
- ⚠️ **Only one board in the chapter puts a healer behind a taunt**, and it is the stage-10 mini-boss
  where the lock is stated and the party is far above the level. 15c's Dwarf Tower roof is why:
  sustain behind something the party cannot aim past is the clock, not a fight.
- ⚠️ **The difficulty probe found a blind spot the ladder had always had.** A chapter boss is a peak
  and the next chapter opens at the level the last one closed on, so the step down across a boundary
  is the ladder working — and it had never fired only because the stride's phase happens to skip
  `c2-s1` and happens to sample `c3-s1`. The case is now named and excluded rather than tolerated.
- ⚠️ **A retyped constant in the balance sweep survived six milestones and chapter 3 found it.**
  "Levelling and ascension are worth about the same" measured `INVESTED`'s level against
  `LEGENDARY - RARE` rungs — and `INVESTED` has never stood at `legendary`, so the two halves
  described **different parties**. It passed at level 85 by coincidence. Both halves are the climb
  from `BUILT` to `INVESTED` now.

**Three economy guards fire on any third chapter, and each was answered differently** — see
[economy](economy.md), which carries all three with their numbers. In short: the idle crystal band
was **widened as a deliberate deferral** rather than the step retuned, which is a decision recorded
against this project's own advice and with its cost stated; the ladder's total pull payout became a
**per-stage** band, because a fixed band on a total is a cap on how much content may ship; and the
level-ceiling guard was **re-derived**, because measuring the ceiling in absolute hours at the top of
a growing ladder is a number guaranteed to fall on every chapter forever.

## 18. Chapter 4 — The Sundered Vault — **COMPLETE**

Fifty stages, enemy levels 160 to 225, thirty-five archetypes — **eight new, twenty-seven
returning**. It asks for the `legendary` rung, which is thirty-two duplicate copies of each of the
five against chapter 3's twenty-four, and it closes **twenty-five levels above the cap that rung
buys**.

### ⚠️ No new mechanics, and that is the milestone's central decision

Milestone 17 grew the combat vocabulary once and recorded that it was the last time: every
targeting, status and effect kind is now in use, and a ninth spelling of an existing skill is
exactly what that milestone refused to ship. Chapter 4 holds to that. What it is built from
instead is two things that were always available and had never been spent:

- **Pairs.** A taunt welded to an absorb pool (the Sealward Custodian), a cleanse welded to a tempo
  buff (the Antiphon Archon), a wide hit that switches off once the party has lost somebody (the
  Riftborn Harrower), a body that only becomes lethal after it has been wounded (the Covenant
  Breaker). Each is two known parts on one block, and each asks something neither part asks alone.
- ⚠️ **The matchup matrix, pointed one way.** An Angel or a Demon deals ×1.10 to every mortal and
  **nothing comes back** — the matrix has no mortal → celestial row, by design. Everywhere else on
  the ladder the matrix is a tiebreak a party answers by choosing who to bring; in a celestial-led
  chapter it is a **standing tax no mortal composition can answer**, worth roughly nine levels of
  investment. That is the Vault's difficulty signature, and it is why the lean is moderate rather
  than total: at every board it stops being a texture and becomes a second level dial stacked on
  the first.

**Be honest about what this means for future chapters.** "New bodies asking old questions in new
pairs" is a real well of content and it is not bottomless. The next chapter that cannot find an
unspent pair is the one that has to argue for growing the vocabulary again, on its own merits.

### The safe inversion of chapter 3's forbidden shape

⚠️ Chapter 3 fields exactly one healer behind a taunt, at stage 10, where the party is far above the
level — because sustain the party cannot aim at is a ninety-second clock and a timeout is scored a
**defeat**. The Sealward Custodian puts the durability **on the taunting body itself**, which
inverts the failure rather than repeating it: the one thing the party is permitted to hit is the
one thing it needs to kill. **No board in this chapter fields a healer at all**, and the boss board
deliberately has no heal, no regeneration and no ally shield on it — three of its five make the
party live longer than it can kill, and every pool on it depletes.

### What the sweep and the guards found

- ⚠️ **The difficulty probe caught a step backwards at `c4-s31`** — 84.4 after 100.9, inside its
  0.85 tolerance. A band opener authored as a teaching board (four bodies, two of them commons) that
  happened to land on a sampled stage. Chapter 3 wrote this rule down and chapter 4 broke it anyway:
  the sampled stages are the chapter's spine, composition moves difficulty by far more than six
  levels do, and a light board after a heavy one is a step down however the levels read. Fixed by
  weight, not by level.
- **Four guards fired, and only one of them was about chapter 4.** The gear tilt genuinely outgrew
  its threshold and was retuned. The other three were **ratios between quantities that grow at
  different rates by construction**, and all three were re-derived rather than widened — see below.

### ⚠️ Three guards that were measuring the ladder's length, not the game

This is the same failure milestone 17 named when it retired "level 1000 costs more than 500 hours of
top-of-ladder income". A guard whose value moves every chapter regardless of whether anything is
wrong is not guarding; it is a number somebody has to widen on a schedule.

- **Levelling versus ascension** was a ratio of the two multipliers bounded to (0.5, 2). A chapter
  adds ~65 levels and exactly **one** rung, and a rung only pays for `ln(1.6) / ln(1.021)` ≈ 22.6
  levels — so it multiplied by ~2.2 every chapter: 0.77, 1.50, **3.26**, 7.10. It is now the
  **rungs' share of the climb in log space**, which is the space multipliers compose in: 55%, 45%,
  40%, asymptotic to ~26%. Bounded both ends, because either axis becoming the whole game is a
  failure.
- **The tower payout ratio** compares seven fixed ladders against a campaign that grows: 3.17, 2.12,
  **1.59**, 1.27. Its floor moved 2 → 1.5, which buys this chapter and no more — deliberately, as a
  reminder scheduled for chapter 5. ⚠️ **The right answer there is to grow the towers**, not to nudge
  the number again.
- **The idle crystal ceiling** was two bounds — pulls a day at full clear, and the ladder's
  contribution as a multiple of the base — and both are `base + step × stages` in disguise. The
  second landed on **exactly** its ceiling of 3.0, and its own comment predicted the chapter and
  prescribed cutting `perClearPerHour` from 1. ⚠️ **That prescription was declined, on the owner's
  call, and the reasoning is in `banners.ts` already**: the failure mode was ever only a rate that
  **compounds** past a flat `PULL_COST`, and a linear step cannot do that at any size. Extravagant
  and compounding are different things. The step stays at 1, "a pull an hour plus one an hour per
  stage ever cleared" survives as the legible sentence it was chosen to be, and the ceiling is now
  stated **against the roster**: a full clear must not buy the roster's 4,487 copies in under thirty
  days. That tracks both sides — a roster that grows raises it exactly as a ladder that grows lowers
  it — and it fires when income has genuinely outrun the gacha's whole purpose, at roughly chapter
  twelve.

### The gear tilt was the one real retune

`gradeSoftness` is a **rate per stage**, so a longer ladder tilts further: the top grade went from
14.8% of end-of-ladder drops at a hundred and fifty stages to **21.3%** at two hundred, past the
`< 0.2` bound that keeps a relic a find rather than routine. Retuned 90 → 100, which is 18.7% over
two hundred. ⚠️ Raising it is safe for the starter wall and lowering it would not be — that guard
fields grade 0 at level 1 explicitly, and the dial that would move it is Worn's own multiplier,
which sits at 0.175 against a 0.2 limit.

### A fourth reference party, and why they accumulate

`MARCHED` is chapter 3's `INVESTED` kept under a new name rather than re-pointed. Every chapter from
here adds one — a party defined by the chapter it has just finished — because re-aiming a single
"arrived" party would silently stop checking that the chapter below is still finishable by the party
it was tuned for. Two named parties per seam is what makes "clears the chapter behind it, walks only
a little way into the one ahead" checkable at both boundaries at once.

## 19. The six-chapter re-cut — **COMPLETE**

The same two hundred stages, re-cut from four fifty-stage chapters into six of 10, 20, 30, 40, 50
and 50 — so the boundaries land where a session does. Chapter 1 is now the ten-stage stretch a
player fights by hand: three locks, a boss, auto-battle. **No stage was re-tuned**: every board
kept its line-up and its level except the four that became chapter finals, and the whole balance
sweep passed on the first run because the linear ladder underneath did not move.

### What it decided

- **Every chapter ends on a boss fielded nowhere else, as a rule rather than a precedent.** The
  Chainsworn and the Hollow Seraph already observed it; the re-cut authored **The Fenlord**
  (c1-s10), **The Pale Warden** (c2-s20), **The First Cinder** (c3-s30) and **The Ashfall
  Sovereign** (c4-s40) to close the gap — each built entirely from skills already in the file,
  recombined, and each sized under the Unmade ceiling. The Sovereign took the Unmade's old slot at
  stage 100; the Unmade keeps its nine other boards as the Reach's heaviest presence. The First
  Cinder closes chapter 3 at level 30 — one above the old board it replaced — so the boundary rule
  ("the next chapter opens at the level the boss closed on") holds exactly.
- **Chapter names follow the landscape, and chapter 3 straddles the seam on purpose.** The Sunken
  Fen (1), The Drowned Ward (2), The Cinder Mire (3 — twenty fen stages, then the first ten of the
  ash), The Ashfall Reach (4), The Bound Marches (5), The Sundered Vault (6). The fen-to-ash
  transition happens mid-chapter where a player can feel it, rather than at a boundary where it
  would read as a new game.
- **The auto-battle unlock is a count of chapters now** — `AUTO_BATTLE_UNLOCK_CHAPTERS = 1`,
  resolved through `chaptersCleared`, so moving it is a one-integer edit however the chapters are
  ever cut again. It was twelve clears; it is now ten, and the two teaching stages it used to wait
  for (the accuracy gate and the penetration check) open chapter 2 instead. All seven towers moved
  with it, 12 → 10, and `towers.spec.ts` now holds that agreement instead of a comment promising
  it.
- **`CHAPTER_CURVE` became a ramp to a permanent cap of fifty** (base 10, step 10, band 1, max
  50). The old banded growth toward two-hundred-stage chapters is gone, not deferred: the long
  ladder is more chapters, not longer ones. Revisit deliberately if fifty ever reads as too short
  at the far end.
- **Chapter Conqueror kept its 10,000 crystals + 100 emblems.** Six boundaries over the same
  stages means +20,000 crystals and +200 emblems across the run, and finishing the ten-stage
  chapter 1 now pays a real early bankroll — accepted under the err-generous philosophy, and
  because the award is what tower-topping ties to. The tower:campaign ratio floor was re-derived
  1.5 → 1.3 as a re-cut artifact rather than a retune; it fires again at chapter 7, and the answer
  then is still to grow the towers.
- **Stored positions changed meaning and no migration was written.** `{chapter, stage}` names a
  different place under the new shape; `clampPosition` pulls an out-of-range pair backward and a
  player re-climbs with no re-pay (`clearedStages` is untouched). Accepted because no save exists
  outside development — [saves](saves.md) records the decision and why it must not be repeated
  after release.
- **Stage ids were renumbered to match their new chapters** (old c1-s31 is c3-s1, old c2-s50 is
  c4-s40, chapters 3 and 4 became 5 and 6 wholesale). Nothing in the save stores a stage id;
  derived battle streams shift, which is invisible in play and re-measured by the sweeps.

### What the balance file keeps that chapters no longer name

The fen's fifty boards are still one tuning span even though they now cross a chapter boundary, so
`chapters.balance.ts` measures `BUILT` against **`FEN_END`** — derived from the Frozen Gate's id,
the fen's last board and once chapter 1's boss, now chapter 3's second mini-boss. The seam parties
re-keyed by place, not by index: `ARRIVED` to the end of chapter 4, `MARCHED` to the end of
chapter 5. "One rung per chapter" became **one rung per fifty-stage band** — the re-cut multiplied
the boundaries without moving a single rung ask, which is exactly why the levelling-versus-ascension
guard measures the share over the whole ladder rather than anything per chapter.

## 20. A second ascended-tier rank — **COMPLETE**

Seven new ascended-tier characters, one per faction, taking the roster from 49 to **56** and the
signature items from seven to **fourteen**. `ROSTER_SHAPE` in `characters.spec.ts` already said
`{ atLeast: 1 }` for ascended tier, so the shape was authored to be grown here and nothing about
the roster's closed half moved: it is still three common and three legendary per faction, exactly.

### What shipped

| Faction | Character                 | Role    | The hook it carries                     |
| ------- | ------------------------- | ------- | --------------------------------------- |
| Human   | Corvane, the Sworn Word   | mage    | `link` — the party wears a Chainbond    |
| Dwarf   | Vurn Runewright           | mage    | `reflect` — thorns over the whole party |
| Elf     | Maelis, the Warded Bough  | tank    | `taunt` — drawn onto 0.2 `dodge`        |
| Undead  | Carrow, the Last Fletcher | ranger  | —                                       |
| Monster | Vrakk, the Bile Throat    | mage    | —                                       |
| Angel   | Cassiel, the Drawn Sword  | brawler | —                                       |
| Demon   | Nazreth, the Patient      | ranger  | `bomb` — a Hexbrand on the largest body |

Twenty-eight new skills, one new status, seven new signature passives, seven new signature items.
No change to `core/` at all.

### Every one of them fills a role its faction did not have

The gap list decided six of the seven outright and left one real choice. Humans and Dwarves had no
mage; Elves had no tank; Undead had no ranger; Angels had neither a brawler nor a ranger; Demons had
neither a tank nor a ranger. Monsters had three gaps — ranger, mage and support — and **support is
excluded by faction identity rather than by oversight**, so that one was a straight choice between
the other two. Undead took ranger because it was their only gap, which left Monsters mage.

Two of these are worth naming because they are answers to failures already on the record:

- **Cassiel is the second half of milestone 8e's Angel fix.** Three healers made a mono-Angel five a
  fight nobody could finish — a timeout, which is a defeat. Nael and Raziel were the first half: a
  wall, so the healers had something to heal. He is the opposite body, and **nothing in his kit
  restores anything**, which makes him the only Angel that is true of.
- **Vurn is the second answer to "Dwarves cannot close a fight".** Hedda was the first and she is an
  exception bought by being less of a Dwarf. Thorns are the other route: a faction that wins by
  refusing to lose gets _paid_ for the refusing, and nothing about the faction has to change.

### The party had never held any of the milestone-17 vocabulary, and now holds all four

`OATHSHIELD`, `THORNMAIL` and `CHAINBOND` were all authored `hostile: false` in milestone 17 —
usable by either side — and for three milestones nothing on the party's side used any of them. Four
of the seven new characters do, and three of the four needed no new content beyond the skill that
casts them.

Two clauses fell out of the vocabulary rather than being chosen:

- ⚠️ **A taunt can never be an ultimate.** `skills.spec.ts` requires the applying skill's cooldown to
  outlast the status, so a party with only single-target reach is left a window at whatever stands
  behind the taunter — and an ultimate carries no cooldown at all. The obvious version of Maelis
  does not compile past that spec, which is the spec working.
- ⚠️ **A permanent party-wide `reflect` is safe, and it is worth knowing why**: reflected damage
  resolves through `statusDamage` and never re-enters the attack path, so it cannot answer itself.
  It is strictly extra damage on a schedule the party controls, and it can only ever _shorten_ a
  fight — which on the faction whose failure mode is the ninety-second timeout is the direction that
  matters.

### ⚠️ The bomb did not survive being handed to the party, and the fix is a new status

The plan was to reuse all four milestone-17 statuses and add none. Three of them transferred
untouched. `EMBER_SEED` did not, and the measurement is the whole of the argument: pointed at the
enemy back rank the way the Bound Marches point it at the party's, **not one of 57 seeds across
forty fights ever detonated** — 53 died with their carrier.

The reason generalises past this character. **The two sides of the board kill at completely
different speeds.** An enemy plants on the party's back rank, which nothing on the enemy side
concentrates on; a party plants on a board every one of its five members is actively trying to
delete, and the back rank is where all of its reach already converges. A forty-tick fuse fits one
of those and not the other.

Two changes, both measured rather than guessed:

- **The seed aims at `enemy-highest`** — the largest remaining health pool is the only body a party
  reliably cannot delete. Aiming wide was tested too and is worse: `enemy-row-front` and
  `enemy-all` plant far more and detonate a _smaller_ fraction of what they plant, at lower power.
- **`HEXBRAND` is its own status at twenty-four ticks**, roughly two turns at a middling `haste` of
  92, and smaller per instance than either enemy bomb — a payload that reliably lands should not
  also be the larger one.

Detonation is now ~⅓ of plants in contested fights and zero in walkovers and in losses, which is the
correct shape: those are the fights whose outcome was never in doubt.

⚠️ **The mono-five control in `signature.balance.ts` provably cannot measure this**, and that is now
recorded in the file. Five copies of one caster all aim at the same target and delete it, so the
bomb detonates 0 of 77 times there. Nazreth's measured figures are a **floor**, and any future
character whose kit turns on something happening _later_ inherits the same blind spot.

### What the seven items are worth, measured

`signature.balance.ts` bisects for reach at the unlock rung, party at level 340:

```
Aurelia   422 (+31)  Corvane 421 (+31)  Thraun    406 (+15)  Vurn    410 (+18)
Aelrindel 441 (+29)  Maelis  421 (+18)  Nekros    432 (+26)  Carrow  436 (+34)
Vharok    431 (+35)  Vrakk   429 (+34)  Seraphine 433 ( +9)  Cassiel 430 (+31)
Azrathoth 448 (+33)  Nazreth 436 (+30)
```

The seven new items land inside the same +2% to +8% band as the shipped seven. ⚠️ **Read that band
with milestone 16's warning attached**: measured instead as win rate at a fixed contested level, the
same items take characters from 0.00 to 1.00. A few percent of reach is the whole fight at the
margin.

⚠️ **The seven original figures also moved, with no item or stat block changed.** `contested()` seeds
off `stage.id`; milestone 19 renamed the hardest stage `c4-s50` → `c6-s50`; every trial drew a
different sequence. Nothing was wrong before or after — but these numbers are only comparable within
one cut of the ladder, and the file now says so.

### ⚠️ Not one new item widens a skill's target, unlike three of the shipped seven

Vharok's, Aelrindel's and Azrathoth's top rungs all widen, and all three work. But widening trades
per-target power for coverage, so whether it is an upgrade **depends on how many bodies happen to
stand in the row the probe aims at** — and `signature.balance.ts` asserts that reach never falls
between one rung and the next, which a trade cannot promise. Every new rung is therefore a lower
cooldown, a certain status where one was a roll, a deeper siphon, or a bigger number. The three that
widen keep doing so because they are measured doing it.

### The gacha dilution was accepted, deliberately

Fourteen ascended-tier characters share the tier's weight where seven did, so a **specific**
ascended character's rate halves: 0.81% → 0.406% a pull at the pity-inflated 5.69% effective tier
rate. Time to ★5 on a named ascended character goes from ~9,000 pulls to ~18,000.

Raising `TIER_WEIGHTS.ascended` from 0.025 to 0.05 to hold it flat was on the table and was
declined. **The base weights have never moved, and holding them steady is the standing decision** —
a rate is what a player is promised. It is also consistent with what the ladder already says: tier
is the _longer_ investment, not the shorter one, and this makes that more true rather than less.

### What it cost the guards: nothing, and one of them gained

`ROSTER_COPIES` grows 4,487 → **5,038** (+551: five mortal climbs at 73 copies, two celestial at 93),
which moves the roster-relative crystal ceiling in `banners.spec.ts` from 62 days to **70** — further
from its floor of 30, not closer. That guard was written to track both sides and this is the first
time the roster side has moved it.

Nothing else needed retuning. The mono-faction sweeps in `chapters.balance.ts` are hand-authored from
three commons and two legendaries per faction, so no new body enters them; the achievement ratios
name the two campaign counters positively, so the doubled signature-track ceiling stays out of them;
and `achievements.spec.ts` derives that ceiling from `SIGNATURE_ITEMS.length`, so it doubled on its
own. All 1,972 unit tests and all 66 balance tests pass with no threshold moved.

## 21. More content — four chapters and a second hundred floors

**Two hundred new stages and seven hundred new floors: nine hundred boards, and no new system.**
The campaign goes from six chapters to ten, every tower goes from a hundred floors to two hundred,
and the enemy roster goes from 62 archetypes to **130**. Nothing in `ui/` changes and nothing in
`core/` changes — every screen, every service and every simulation rule already does all of this.

**It is eleven sessions, not one**, and they are numbered individually (21a–21k) because each is a
self-contained authoring job with its own acceptance criteria and its own balance sweep. What makes
them one milestone rather than eleven is that they share a set of economy guards, and those guards
only balance when the whole thing has landed.

### Why this before the roguelite and the puzzle maps

Both of those are **new systems**, and this project has eleven of them. What it does not have is
enough content to exercise the ones it built: an ascended-tier character caps at level 1000 and the
hardest fight in the game is level 225, a signature item cannot be measured against anything that
ships, and a tower tops out at an enemy level the campaign passes in chapter 4. **Adding a twelfth
system to a game whose top content is a quarter of the way up its own curves is the wrong order.**
This milestone is what makes the existing systems reach their own ceilings.

### What it ships

| Unit    | Content                             | New blocks | Level range   |
| ------- | ----------------------------------- | ---------- | ------------- |
| 21a     | Chapter 7, 50 stages, lean undead   | 10         | 225 → 305     |
| 21b     | Chapter 8, 50 stages, lean elf      | 10         | 305 → **396** |
| 21c     | Chapter 9, 50 stages, lean dwarf    | 10         | 396 → **490** |
| 21d     | Chapter 10, 50 stages, lean monster | 10         | 490 → **588** |
| 21e–21k | Seven towers, floors 101–200        | 4 each, 28 | 61 → **120**  |

⚠️ **The level column was 285 / 365 / 445 / 525 when this was written, and 21a measured it wrong.**
See "The level line, and the rung each chapter asks for" below: a constant +25 margin does not pay
for the rung each chapter hands the party, so the margins have to grow. The remaining figures are
approximate on purpose — each chapter derives its own close by measurement, and the closed form
under-predicts by a few levels.

Sixty-eight new archetypes, 62 → **130**. Two hundred new stages, 200 → **400**. Seven hundred new
floors, 700 → **1,400**.

---

### 21a–21d. Chapters 7 through 10

#### The level line, and the rung each chapter asks for

**One rung per chapter, which is the standing cadence** — a rung per fifty-stage band, unchanged
since milestone 19 made the bands and the chapters the same thing again.

| Chapter | Levels        | Rung it asks for | Cap | Margin  |
| ------- | ------------- | ---------------- | --- | ------- |
| 7       | 225 → 305     | `legendary-plus` | 260 | +45     |
| 8       | 305 → **396** | `mythic`         | 340 | **+56** |
| 9       | 396 → **490** | `mythic-plus`    | 420 | **+70** |
| 10      | 490 → **588** | `ascended`       | 500 | **+88** |

⚠️ **The 8, 9 and 10 rows were ~+71, ~+94 and ~+117 until 21b measured the first of them, and then
~+38 and ~+20 until 21c measured the second.** A constant margin cancels (21a's finding) but "+23 a
chapter" over-corrects, because the enemy's own `perLevel.ascended` compounds against the party's
`perLevel.common` over the _whole_ level — worth about fifteen levels a chapter at this depth, so
21b's corrected growth is nearer **+8**. That corrected rule then **under**-predicted chapter 9 by
four levels, and the ~+38 in the old table was wrong by more than thirty.

⚠️ **All four are measured now, and the margins are +45, +56, +70, +88 — so the growth is nearer
+12 to +18 a chapter and rising, not +8.** Every closed form tried across this milestone has been
wrong, in both directions, and 21d's estimate of ~570 was eighteen levels low. **The arithmetic is a
starting bracket and the bisect is the answer**: field the party the chapter is tuned for, find the
90% edge, and back off to where it keeps three or four of five.

⚠️ **This table read +25 for all four, and 21a authored chapter 7 to it, measured the result and
found the rule wrong.** The correction is the most useful thing that milestone found and it is
arithmetic rather than taste.

The rule as written: a rung is worth ×1.6, the enemy side has no rungs at all, so a party matching
the enemy's level from one rung higher is ×1.6 ahead of the content with nothing in the numbers
looking wrong; twenty-three levels is what ×1.6 costs at `perLevel.common`, so close +25 past the
cap. **That is correct for the chapter where a cap is first out-climbed and wrong for every chapter
after it.** Each chapter hands the party a fresh rung **on top of** the levels it climbs while the
content climbs only the levels, so a _constant_ deficit is paid once and never again and the gap
compounds. Measured as party power ÷ the difficulty probe's threshold at each chapter's final:

| Chapter              | Reference party         | Ratio    |
| -------------------- | ----------------------- | -------- |
| 5 (+20)              | `elite-plus` at 140     | 1.08     |
| 6 (+25)              | `legendary` at 200      | 1.44     |
| 7 at 285, as briefed | `legendary-plus` at 260 | **2.08** |
| 7 at 305, as shipped | `legendary-plus` at 260 | ~1.16    |

At +25 every stage in chapter 7 was a walkover for the party it was tuned for — the reference five
finished The Cairn King with all of them alive in seven seconds — and ⚠️ **no board fixes that**: a
board heavy enough to cost that party a member needed **three** ascended bodies and measured 1.86×
the stage before it, which is a cliff and the shape milestone 15c warns makes six towers fail their
sweep at once. So **the margin has to grow by about twenty-three levels a chapter**.

⚠️ **Derive each chapter's close by measurement rather than from the formula.** Enemy `ascended`
blocks scale a little faster than `perLevel.common`, so the closed form under-predicts by a few
levels — it said 308 for chapter 7 and 305 lands the ratio at 1.16. The figures for 8 through 10 are
approximate for that reason. The test is the probe threshold at the chapter's final against
`pow(1.021, level - 1) * pow(1.6, rungsAboveRare)`, and it wants to land near **1.1–1.4**.

That works out to ~1.6 levels a stage for chapter 7 and over two a stage after it, against the
Marches' 1.5 and the Vault's 1.3. Copies asked of a mortal character go **32 → 62** across the four.

#### ⚠️ Chapter 8 is where a signature item becomes measurable, and that closes a three-milestone gap — **it did**

`docs/signature-items.md` has carried this since milestone 16: `mythic` caps at level **340** and the
hardest authored stage was **225**, so a party at the signature unlock rung is half again past the top
of the ladder and every campaign fight is a walkover. `data/signature.balance.ts` has to re-level the
hardest encounter to the party's own level to measure anything at all. **The Bound Marches and the
Sundered Vault were each expected to close it and neither did — and chapter 7 does not either**, at
305 against 340, though it narrows the gap from ×1.51 to ×1.11.

Chapter 8 closed at **396** — lower than the ~411 predicted here, for the reason above, and still
comfortably the first shipped content above the `mythic` cap. `contested()` no longer re-levels, and
⚠️ **all fourteen recorded figures moved**, but not because the re-levelling went: `reach()`
overwrites `level` on every trial, so the override was dead on arrival. What moved them is that the
hardest stage is now `c8-s50` rather than `c6-s50` — a different board under a different id seeding a
different sequence. **Re-measure the whole table or none of it.**

#### The 25% rule, and what the percentage is over

**25% of the distinct archetypes a chapter fields must be blocks that did not exist before it**, with
the chapter's boss and lieutenant excluded from both sides of that fraction. Chapter 5 fields 32
distinct archetypes and chapter 6 fields 35, so the quota is **8 new ordinary blocks a chapter**.

⚠️ **The denominator is what the chapter fields, not the shipped pool.** Over the whole pool it would
compound to ~90 new blocks across four chapters and would put every per-faction depth guard under
pressure at once; over board slots it could be satisfied by five blocks used heavily. Fielded-distinct
is the reading that means "a quarter of what you meet here is something you have not met".

**Two unique bodies a chapter on top of that**, so ten new blocks each:

- **The chapter boss**, which is the standing rule — every chapter ends on a body fielded nowhere
  else, and a session that ships without one has not finished.
- **A lieutenant**, new here: one heavy block anchoring all four mini-boss boards (s10, s20, s30,
  s40) at rising levels. That is what gives a chapter a recurring antagonist rather than four
  one-shot stat blocks, and it is deliberately not four unique bodies — twenty blocks each appearing
  on exactly one board is most of what `enemies.spec.ts`'s orphan rule exists to discourage.

#### The four leans are fixed up front, and they are the four thinnest factions

A chapter leans on one faction and its new blocks go there. The leans are named by this milestone
rather than left to each session, because they are what makes the four sessions touch
**non-overlapping slices** of `enemies.ts` — and because picking the thinnest four is what evens out
a depth table that milestone 18 left lopsided.

| Chapter | Lean    | Before | After |
| ------- | ------- | ------ | ----- |
| 7       | Undead  | 7      | 17    |
| 8       | Elf     | 7      | 17    |
| 9       | Dwarf   | 8      | 18    |
| 10      | Monster | 8      | 18    |

Demon (12), Angel (11) and Human (9) are untouched by 21a–21d — they are the three the Sundered Vault
and milestone 18 already deepened. The setting, the name and the band structure of each chapter are
the session's to choose; the lean is not.

⚠️ **Do not lean a chapter on Angels or Demons.** The Sundered Vault is the celestial chapter and it
records why the lean there had to be _moderate rather than total_: a celestial deals ×1.10 to every
mortal and the matrix has no mortal → celestial row, so a celestial-led board is a standing tax no
mortal composition can answer — worth about nine levels of investment, silently, on top of whatever
the level dial is already doing. One chapter may carry that. Four may not.

#### The vocabulary budget: three statuses across four chapters, and they must ride `status`

Milestone 18 shipped a whole chapter with no new mechanic, and `AGENTS.md` records the standing
position: the next chapter that cannot find an unspent pair is the one that has to argue for growing
the vocabulary again, on its own merits. **Four chapters is more pairs than the well plausibly
holds**, so this milestone licenses a bounded growth rather than pretending otherwise.

- **Allowed**: up to **three** new statuses across 21a–21d, each riding the existing `status` effect
  exactly as milestone 17's four did; new skills; new archetypes; new pairs of known parts.
- ⚠️ **Forbidden**: any new `EffectKind`, any new `TargetKind`, and anything requiring a change in
  `ui/`. Milestone 17 needed no UI change at all because `tick-damage` already said everything three
  of its four statuses produced. That is the bar.
- **Each one is argued in its own chapter's entry.** "The budget allowed it" is not the argument. A
  chapter that finds an unspent pair instead should spend nothing — the budget is a ceiling, not a
  quota, and a chapter that comes in under it is the better outcome.

⚠️ **All three are spent and the budget is closed: 21a none, 21b one (`ROOTBOUND`), 21c none, 21d two
(`BLOODRISEN`, `SAVAGED`).** Three of the four chapters came in under the ceiling, which is the
outcome this was written for, and the two that were spent both went on the same shape of argument —
a permanent version of something the game only had as a window. **The next chapter that wants a new
status is back to milestone 17's position and has to argue it from nothing**; "21 had a budget" is
not an argument, and neither is "21d spent two".

#### The four constraints on a chapter's boards, restated because all four have been broken before

1. ⚠️ **Sustain on the enemy side behind something the party cannot aim past is a clock, not a
   difficulty.** A timeout is scored as a defeat. The safe inversion is the Sundered Vault's Sealward
   Custodian: put the durability on the taunting body itself, so the one thing the party is permitted
   to hit is the one thing it needs to kill and every pool depletes.
2. ⚠️ **The difficulty probe reads every fourth stage plus the bosses, so those samples are the
   chapter's spine and have to escalate.** Band openings _want_ to be light and the stride does not
   care — the Sundered Vault wrote this rule down and then broke it anyway, landing a four-body
   teaching board on a sample after a heavier one. **Check which stages are samples before
   authoring**, and fix a step backwards with **weight** (five bodies, a legendary front rank), never
   with +3 enemy levels, which fights the level curve for ~13%.
3. ⚠️ **A chapter opens at the level the previous one closed on.** 285, 365, 445 — a name change and
   a boss behind you, not a step.
4. ⚠️ **Any new `ascended`-tier block stays under the Unmade on both stats.** `enemies.spec.ts`
   asserts it. A third and fourth heavy anchor is what made six towers fail their sweep at once in
   15c, and both chapter bosses since have respected the ceiling rather than raising it — what makes
   them the harder fights is the questions they ask and the level they are fielded at.

#### What a chapter session owes

- `src/data/chapter-N.ts`, 50 stages, levels per the table, boss rhythm at s10/20/30/40/50.
- ~10 new blocks in `enemies.ts` (8 ordinary + lieutenant + boss), their skills in `skills.ts`,
  re-exports in `index.ts`, and the chapter wired into `CHAPTERS` in `chapters.ts`.
- A new seam party in `chapters.balance.ts`. The pattern is `ARRIVED` / `MARCHED` / `INVESTED`:
  `BUILT_FRONT` and `BUILT_BACK` fielded at the rung the chapter asks for, level derived as
  `min(chapter's last stage level, LEVEL_CURVE.caps[rung])` — **derived, never typed**.
- `npm run test:unit`, then `npm run test:balance`. The balance sweep is not optional on a chapter;
  it is the only thing that reads the boards.

---

### 21e–21k. The second hundred floors

#### The level line doubles, and floors 1–100 come through it almost untouched

`TOWER_RULES` goes `floors: 100 → 200` and `topLevel: 60 → **120**`. `floorLevel` stays a single
straight line and `core/towers.ts` is untouched.

```
slope 59/99 = 0.5960       →   slope 119/199 = 0.5980
floor  10 →   6                floor  10 →   6
floor  50 →  30                floor  50 →  30
floor 100 →  60                floor 100 →  60
                               floor 150 →  90
                               floor 200 → 120
```

⚠️ **This section said 140 and prescribed retuning all seven hundred shipped floors. 21e measured
both halves of that and both were wrong** — see the 21e entry below for the numbers. In short: 140
breaks the shipped hundred (46 floors fall under the 90% bar) _and_ produces a roof no board can make
into a fight, because the band-2 crew it implies is three ascension rungs above `rare` where the
enemy side has none. 120 is the level at which the new slope coincides with the old one: **ten of the
seven hundred shipped floors move, each by a single level**, and the retune evaporates.

**What 140 bought was a rarity-cap match, and that turned out to be worth nothing.** A tower has to
close _above_ the cap of the rung it asks for, which is the campaign's own margin rule; `topLevel`
being a cap is the opposite of what makes the top floor a fight.

#### Two crews, one per band

⚠️ **A single upgraded crew would stop the sweep saying anything about the low band.** A band-2 crew
walks over floor 40, so the levels the first hundred carries would go unmeasured on 700 floors that
are already shipped. So `towers.balance.ts` fields two:

| Band | Floors  | Rung        | Level           | Against       |
| ---- | ------- | ----------- | --------------- | ------------- |
| 1    | 1–100   | `rare-plus` | 60 (`caps[3]`)  | level 60 top  |
| 2    | 101–200 | `elite`     | 100 (`caps[4]`) | level 120 top |

Band 1's level is the cap that **equals** the halfway floor's level; band 2's is the highest cap
strictly **below** the roof, so the tower closes +20 over it. Both derived, neither chosen. This is
the same move `chapters.balance.ts` already makes with BUILT / ARRIVED / MARCHED / INVESTED, for the
same reason. The load-bearing assertions — zero timeouts, the timer headroom, the top floor — still
read **every** floor.

The balance target for band 2 is the band-1 target restated one band up: five of the tower's faction
at `elite`, level 100, **no gear**, clearing every floor, losing nobody below floor 185.

#### Four archetypes a tower, authored for the faction it leans on

Each tower authors ~4 new blocks, and they belong to its **lean** — the faction that counters the one
it admits — because that is where the floors actually need variety: the lean holds 35–65% of every
board, which `towers.spec.ts` asserts.

| Tower   | Leans on | Blocks | Faction after 21a–21d | After |
| ------- | -------- | ------ | --------------------- | ----- |
| Human   | Undead   | 4      | 17                    | 21    |
| Dwarf   | Human    | 4      | 9                     | 13    |
| Elf     | Dwarf    | 4      | 18                    | 22    |
| Undead  | Elf      | 4      | 17                    | 21    |
| Monster | — (even) | 4      | spread                | —     |
| Angel   | Demon    | 4      | 12                    | 16    |
| Demon   | Angel    | 4      | 11                    | 15    |

⚠️ **The Monster Tower has no lean and that is its lean.** Every faction counters Monsters, so "field
what counters the crew" resolves to all seven and it ships as an even spread. Its four blocks spread
too. `towers.spec.ts` derives that case off the matrix rather than naming `monster`, so do not
special-case it in content.

#### ⚠️ Sequential, not parallel — 21e through 21k in that order

Seven sessions each writing into `enemies.ts` (1,897 lines) and `skills.ts` (3,437 lines) will
collide, and `enemies.spec.ts` enforces global uniqueness on both ids **and** names — which is a
check that only runs once everything has landed. So they run one at a time, each rebased on the last,
and each session sees the blocks its predecessors added.

**21e (Human) sets the pattern.** It is the tower that shipped alone in 15b for the same reason, and
it is the one that eats the `TOWER_RULES` change, the two-crew rewrite of `towers.balance.ts` and the
Spire Conqueror re-derivation. **21f–21k are then a hundred floors and four blocks each**, against a
rule that has already been proven.

⚠️ **The height moves in one session and the floors move in seven, so six towers are short in
between.** `TOWER_RULES` is one rule for all of them and `towers.spec.ts` asserts every tower is
exactly that tall. The answer is a **self-deleting checklist**: `PENDING`, a literal list of the
towers still on their first hundred, in `towers.spec.ts` and `towers.balance.ts`. Each session
deletes its own name and **21k deletes both lists**. A filter — "either the full height or half of
it" — would pass forever and never notice a tower nobody went back for.

A tower on that list is not damaged: `clearedFloors` clamps to what it authors, so `nextFloor`
reports it topped and every screen reads it correctly. What it loses while it waits is its **boss** —
`floorKindAt` reads the rules' height, so its hundredth floor resolves as a mini-boss and pays ×2
rather than ×5. Licensed by the one argument every save re-base rests on: no build carrying this has
ever reached a player.

#### What a tower session owes

- 100 new floors in `src/data/tower-<faction>.ts`, ids continuing the existing scheme, mini-boss
  rhythm at every tenth floor and the boss at 200.
- The tower's name deleted from `PENDING` in **both** `towers.spec.ts` and `towers.balance.ts`.
- ~4 new blocks in `enemies.ts` for its lean faction, skills in `skills.ts`, re-exports in `index.ts`.
- The bias held: leader faction 35–65% of counter blocks, ≥4 distinct counter blocks.
- ⚠️ **Difficulty in a tower is the front rank's weight and it is sharply non-linear.** Pairing the
  two heaviest ascended blocks took the 15b reference crew from a clean clear to single digits, and
  15c found the tolerance narrower still: the same medium-plus-heavy pair the Human roof clears at
  90% is unwinnable for the Dwarf five (lowest `atk` in the game) and the Angel five (four supports
  and a wall). **Size the top band against this tower's own crew, never to a shared weight.**
- ⚠️ **No healer on the roof.** The Dwarf Tower's boss was `Oathbreaker + Warden` behind a Marsh
  Acolyte and no Dwarf five could close it inside ninety seconds, while an identical board ten floors
  lower cleared. Against a party that cannot burst, sustain on the last floor is the clock, not a
  lock. A **shield** is the safe form of the same idea and 21e authored one for it: a pool banked
  once depletes, where a heal refills.
- ⚠️ **The alternate five is the binding constraint in band 2, not the reference five.** 21e measured
  the Human pair twelve levels apart in capability, and any board that challenges the reference crew
  at the roof wipes the alternate. Size the roof against the **alternate** and check the reference
  crew second — the reverse of how the shipped hundred was authored, where both stood at parity with
  the content and the question never arose.
- ⚠️ **A second `ascended` block is what the alternate five cannot take at the top of band 2.** It
  clears two-anchor boards up to about level 108 and falls off a cliff by 117, so the last twenty
  floors escalate through the **level line and the board's own support density** instead — links,
  shields and a taunt — rather than by stacking anchors. That is the inverse of the shipped hundred's
  climax and it is a finding rather than a preference.
- `npm run test:unit`, then `npm run test:balance`.

---

### The guards, sorted into the two kinds

⚠️ **Sort every failure into "content outgrew a threshold" and "this ratio moves every chapter
regardless" before touching anything.** The first is a real retune; the second is a guard that needs
re-deriving. Milestone 18 found three of the second kind at once and this milestone is four chapters.

#### Fires, and needs re-deriving — all three are the second kind

- **`levels.spec.ts` — "leaves the ceiling aspirational".** `hoursTo(1000) / hoursTo(top stage)`,
  floored at 25. It reads ~37 at level 225 and lands around **~4.8** at 525. ⚠️ **Its own comment says
  it is meant to fall as the ladder grows**, and it has already been re-derived once for the same
  reason (×84 at three chapters, ×37 at six). Lower it to ~4 and record that it fell four chapters'
  worth in one milestone. It fires again around chapter 13.
- **`levels.spec.ts` — "charges real time for the level the top of the ladder asks for".** Two-sided,
  `1h < hoursTo(top stage) < 24h`, and ⚠️ **the 24-hour ceiling is at risk** — cost grows as `L^2.55`
  while top-of-ladder income grows as `index^1.13`, so the quantity decays by construction. Rough
  arithmetic puts it in the low twenties at level 525, which is close enough that it has to be
  measured rather than assumed. **If it fires, it is the same kind of guard as the one above** — but
  it also carries a real design claim ("a day of income is the wall rather than the content"), so a
  large overshoot is a signal that 1.6 levels a stage is outrunning the income exponent, not just a
  threshold to move.
- **`towers.spec.ts` — "topping a tower pays what finishing a chapter pays".** `Spire Conqueror` is
  authored `every: 100`, so at 200 floors it fires **twice**: 20,000 a tower against a chapter's
  10,000. ⚠️ **Keep `every: 100` and re-derive the tie as _per hundred floors_** — which is the
  argument the tie always rested on ("a hundred floors and a fifty-stage chapter are comparable
  events"), now stated per unit. Re-authoring it as `every: 200` to keep the tie literal strips
  70,000 crystals from the tower side and drops the tower:campaign ratio to **1.23**, under its own
  floor of 1.3 — breaking the guard this milestone exists to fix. No save migration either way:
  awards-taken is an integer and a player who topped the old hundred has taken 1 and earned 1.

#### Green, with the margin worth knowing

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 219,100 / 159,500 = **1.37** today against
  a floor of 1.3, and `AGENTS.md` predicts it fires at chapter 7 with the answer being "grow the
  towers, and that is milestone-sized work". **This is that work.** Four chapters take the campaign to
  297,500 and seven doubled towers take the tower side to 436,100: the ratio _rises_ to **1.47**. The
  floor stays at 1.3 and does not need re-deriving — for the first time since it was written, both
  sides moved.
- **`banners.spec.ts` — the roster-relative crystal ceiling.** 400 clears is 500 crystals an hour,
  120 pulls a day, and 5,038 copies at that rate is **~42 days** against a floor of 30. Green, and the
  margin halves (70 → 42). It fires around 600 clears — chapter 13 or 14 — and the question then is
  whether the roster kept up, not what number makes it green.
- **`achievements.spec.ts` — pulls per stage.** 7.98 → **7.44**, band 5–9. Green; four fifty-stage
  chapters dilute the boundary awards the re-cut concentrated.
- **`levels.spec.ts` — rungs unspent above the ladder's demand.** 525 < `caps[12]` = 700. Green, and
  this is the structural guard that answers the ceiling question without an opinion in it. It fires
  at chapter 13.
- **`towers.spec.ts` — `topLevel < campaignTop`** (140 < 525), **`unlockClears < stages.length * 0.2`**
  (10 < 80), **`matchedStageIndex(topLevel) < floors`** (~138 < 200). All green with room.
- **`emblems`** — the idle rate steps per chapter, so it caps at 10 an hour rather than 6. No guard,
  no unlock flag, nothing to migrate; the rate is zero below one cleared chapter, which is the same
  fact expressed as arithmetic.

#### Expect to move, and re-derive rather than retune

- **`chapters.balance.ts` — the levelling-versus-ascension share.** ⚠️ **A ratio between two
  quantities that grow at different rates by construction**: a band climbs ~65 levels and a rung only
  pays for 22.6, so the two axes drift apart forever. It has been re-derived rather than widened once
  before. Four bands at once will move it four bands' worth.

### What this milestone deliberately does not do

- **No new characters.** The roster stays at 56 and 14 signature items. Chapter 10 asks for the
  `ascended` rung, which the shipped roster reaches — content is the axis being grown here, and a
  roster grown in the same milestone would make it impossible to tell which one moved a guard.
- **No sixth gear grade**, no new currency, no new screen, no `core/` change. If a chapter or a tower
  appears to need one, that is a finding to write down, not scope to take.
- **No re-cut of chapters 1–6.** Milestone 19 moved every boundary once and `docs/saves.md` records
  the one-line exact remap that becomes mandatory if it is ever done after release. Chapters 7–10 are
  appended; nothing below them moves.
- **`CHAPTER_CURVE` is untouched.** Fifty is the permanent cap and chapters 7–10 are all fifty, which
  is the curve working rather than a coincidence to check.

### 21a. Chapter 7 — The Waking Barrows — **COMPLETE**

Fifty stages, enemy levels **225 → 305**, ten new Undead archetypes and three new skills. The ladder
goes 200 → **250** stages and the enemy roster 62 → **72**. Nothing in `ui/` and nothing in `core/`
changed, which is what this milestone promised of every one of its eleven sessions.

#### What it ships

- **`src/data/chapter-7.ts`**, five bands of ten. The chapter's signature is that every board has an
  opinion about _how_ the party's damage arrives: a thorned wall it is forced onto, a fuse planted on
  the member it never cleanses, a field where going wide is answered once per body reached, and a
  link that undoes the focus fire six chapters have rewarded.
- **Ten Undead blocks**: four `common`, four `legendary`, and two `ascended` — The Gravewright, the
  ladder's first **lieutenant**, standing on all four mini-boss boards at rising levels, and The
  Cairn King on `c7-s50` and nowhere else. Undead goes 7 → **17**, which is the depth this milestone
  fixed its leans to produce.
- **Three skills, no new status.** Milestone 21 allows three statuses across four chapters and this
  spent none of them: `BARROW_TITHE` is a bomb aimed at `enemy-highest`, `THE_BARROW_FORGETS` is the
  first `ally-afflicted` turn on the enemy side, and `WAKE_THE_BONE` applies `THORNMAIL` by a skill
  where it has only ever been an `opening`. The other two locks are **board pairs** and needed
  nothing at all.
- **A fifth reference party.** `VAULTED` is chapter 6's `INVESTED` under a new name — the third time
  that has been needed — and `INVESTED` moves to `legendary-plus` at 260.

#### The level line was the finding, and it corrected the milestone's own rule

Authored at the briefed 285, the chapter measured as a **walkover for the party it was tuned for**:
the reference five took The Cairn King with all five alive in seven seconds. The cause is above, in
"The level line, and the rung each chapter asks for" — a constant +25 margin cancels, so each
chapter's fresh rung is free and the gap compounds (1.08 → 1.44 → 2.08). ⚠️ **The board was not the
problem and could not be the fix**: making the final cost that party a member at level 285 needed
three `ascended` bodies on one board, measuring 1.86× the stage before it. Closed at **305** instead,
which lands the ratio at ~1.16 with no board change, and the roadmap's remaining three chapters are
re-derived accordingly.

Two authoring traps were hit and are recorded on the boards themselves. **The Sundered Vault's
band-opener trap fired again even knowing about it**: `c7-s21` was authored deliberately heavy — five
bodies, legendary front rank — and still measured a step backwards, because thorns on fodder is a
cheap question and the probe only reads weight. ⚠️ **What a board _asks_ and what it _weighs_ are
different numbers.** And **a boss that taunts itself is easier, not harder**: it aims every attack at
the body the party was going to focus anyway and spends the boss's own turns dealing nothing. The
taunt belongs on the wall in front, which is the Hollow Seraph's shape and the reason that shape
works.

#### Four guards fired; three were the "moves every chapter regardless" kind

- **`levels.spec.ts` — "leaves the ceiling aspirational"**, predicted. Floor 25 → **4**, which is
  milestone 21's landing rather than 21a's: 37.1 at chapter 6, 20.9 at 7-as-briefed, 17.8 as shipped,
  and ~4.8 at chapter 10. ⚠️ The cost is that it watches nothing until chapter 10 and the margin
  there is nineteen percent.
- **`towers.spec.ts` — the tower:campaign crystal ratio**, predicted, and the prediction included
  chapter 7 firing it. 1.37 → **1.13** against a floor of 1.3, because the campaign side moved and
  the tower side cannot until 21e. Floor lowered to **1.1** as an explicit mid-milestone placeholder;
  ⚠️ **restoring it to at least 1.3 is a deliverable of 21k**, where the doubled towers take it to
  ~1.47.
- **`gear.spec.ts` — the top grade's share of end-of-ladder drops.** ⚠️ **Not predicted by the
  brief.** `gradeSoftness` is a rate per stage so the tilt has no ceiling: 18.7% → **24.5%** against a
  `< 0.2` bound, re-derived 100 → **125** exactly as chapter 4 re-derived it 90 → 100. It reads 22.3%,
  26.7% and 30.8% at chapters 8, 9 and 10, so **expect it once per chapter for the rest of the push**
  — and what it eventually wants is a tilt that _saturates_ rather than a fifth constant.
- **`chapters.balance.ts` — "still costs that party something at the top."** The one that caught the
  level line. See above.

#### Green, with the margin worth knowing

- **`levels.spec.ts` — "charges real time for the level the top of the ladder asks for."** 10.2 hours
  at chapter 6, **21.7** at chapter 7, against a two-sided `1h < x < 24h`. ⚠️ **The brief guessed
  "low twenties at level 525" and that is the figure chapter _7_ reads** — it lands past 24 at
  chapter 8 and past 76 by chapter 10. It carries a real design claim ("a day of income is the wall
  rather than the content"), so 21b has to decide whether the level cadence or the income exponent
  moves; it is not a threshold to slide.
- **`banners.spec.ts` — the roster-relative crystal ceiling.** 250 clears is 84 pulls a day and 5,038
  copies is ~60 days against a floor of 30.
- **`achievements.spec.ts` — pulls per stage.** 7.98 → **7.76**, band 5–9.
- **`chapters.balance.ts` — the levelling-versus-ascension share.** 0.40 → **0.37**, band 0.2–0.8.
  It falls slowly and asymptotes, exactly as milestone 18 re-derived it to.

#### ⚠️ Correction, found during 21b: the Cairn King's board contradicted its own comment

`c7-s50` fields **five** bodies — `THE_CAIRN_KING` and `CAIRNBOUND_SENTINEL` in front,
`THE_GRAVEWRIGHT`, `BONECHAIN_WARDEN` and `GRAVEMOURN_KEEPER` behind — while two comments said the
Gravewright was "deliberately absent", and the same comment's own enumeration of the board describes
only four of them. `enemies.ts`'s note on `THE_CAIRN_KING` repeated it.

**The board is right and both comments were wrong**, and measurement rather than taste settles it.
Remove the Gravewright and the difficulty probe reads **1,484** against `c7-s49`'s **1,404** — a
chapter _final_ six percent harder than the stage before it — and `BARROWED`, the party this chapter
is tuned for, finishes it with **all five alive** where the shipped board leaves 3.55. That is the
identical defect the taunting-King draft was rejected for, two paragraphs earlier in the same
comment. ⚠️ **And while chapter 7 was the top of the ladder, `chapters.balance.ts`'s
`meanSurvivors < 5` read this stage**, so a four-body board could not have shipped green. The
contradiction is prose that was never true.

**The rule is narrowed to what it actually protects: a lieutenant may stand on its chapter's final
as support, and may not _be_ it.** The headline body is what must be new — the Cairn King stands on
one stage and nowhere else, and so does The Withered Crown. Chapter 7 fields its lieutenant behind
its boss and chapter 8 does not, and both are correct: `c8-s50` measures a real fight (3.88
survivors) without one.

⚠️ **The finding worth more than the fix: nothing watches a chapter final once a later chapter
ships.** "Still costs that party something at the top" reads `investedSweeps[investedSweeps.length -
1]`, so chapter 8 shipping moved it from `c7-s50` to `c8-s50` and the four-body board would now pass
silently. Every earlier chapter's final is unguarded the moment it stops being the last one. A
per-chapter version — each seam party against the final of the chapter it finished — is the obvious
shape and is **not** a mechanical addition: it needs a measured pass over all six finals and would
plausibly fail on the early ones for legitimate reasons. Recorded here rather than taken.

### 21b. Chapter 8 — The Sunless Weald — **COMPLETE**

Fifty stages, enemy levels **305 → 396**, ten new Elf archetypes, three new skills and **one new
status** — the first of milestone 21's three to be spent. The ladder goes 250 → **300** stages and
the enemy roster 72 → **82**. Nothing in `ui/` and nothing in `core/` changed.

#### What it ships

- **`src/data/chapter-8.ts`**, five bands of ten. The chapter's signature is that every board has an
  opinion about _where_ the party's damage lands, where chapter 7's was about _how_ it arrives: a
  `dodge` pool that makes a swing a coin, a back rank the party has never had to defend, roots that
  turn reach into spread, and a bind cast on whatever the party commits to.
- **Ten Elf blocks**: four `common`, four `legendary`, and two `ascended` — The Longshadow, the
  chapter **lieutenant**, on all four mini-boss boards, and The Withered Crown on `c8-s50` and
  nowhere else. Elves go 7 → **17**, which is the depth milestone 21 fixed its leans to produce.
- **Three skills and one status.** `ROOTWAKE` applies the new status by a turn, `THE_LONG_LOOSE` is
  the first debuff aimed at `enemy-row-back`, and `DRAW_INTO_THE_ROOT` casts a link **reactively**
  on `ally-lowest` where the game has only ever cast a heal there.
- **A sixth reference party.** `BARROWED` is chapter 7's `INVESTED` under a new name — the fourth
  time that has been needed — and `INVESTED` moves to `mythic` at 340.

#### ⚠️ The status budget: one of three spent, and the argument is band 3's

Milestone 21 licenses up to three new statuses across its four chapters and 21a spent none. This
chapter spends one, and "the budget allowed it" is not the argument. `ROOTBOUND` is a **partial,
permanent** link: `spreadLink` in `core/battle/simulate.ts` matches partners on the **status id**
rather than on the side, so a board can bind its back rank to itself and leave its wall out of it,
and a lone holder takes the whole hit.

**No pair of shipped parts says that.** `CHAINBOND` is cast, lapses after sixty ticks and binds a
whole side — a statement about focus fire in general. Band 3's question is narrower and aimed at one
specific habit: since milestone 4 the answer to a protected back rank has been **reach**, and here
reaching a bound archer hands a third of the blow to the archers beside it. The reach still works;
what it buys is spread rather than a kill.

It rides the existing `status` effect exactly as milestone 17's four did — no new `EffectKind`, no
new `TargetKind`, no change in `ui/`, and `enemies.spec.ts` already permitted a link as an `opening`
where it forbids a taunt. **Two remain for 21c and 21d**, and each argues its own.

⚠️ **The chapter's other headline lock cost nothing at all, and could not have cost anything.**
Evasion is a stat block: `ModifiableStat` is `atk`, `def` and `haste`, so `dodge` cannot be a status
without a `core/` change this milestone forbids. That turned out to be the better outcome — what
answers `dodge` is `accuracy`, which five characters have carried since 8e and which no content has
ever made matter, four of them Elves.

#### ⚠️ The level line was the finding again, and it corrects 21a's correction

21a replaced "+25 past the rung's cap, always" with "the margin grows by about twenty-three levels a
chapter". **That is right in shape and wrong in size at this end of the ladder**, and the chapter
authored to it — closing at the roadmap's 411, a margin of +71 — was unclearable: the party it is
tuned for took the final at **0%**.

⚠️ **The board was not the variable and could not be the fix.** Chapter 7's own final re-levelled to
411 also reads 0% for the same party, and chapter 8's final at 380 reads 100%. What the chapter ran
into is the level line and nothing else — and the transition is a **step function**, exactly as
`docs/testing.md` warns: 100% at 398, 85% at 400, 45% at 402, 0% at 408.

**The correction is arithmetic and it is the enemy's own growth curve.** 21a derived +23 from
`perLevel.common`, because that is what the party climbs on. An enemy `ascended` block climbs on
`perLevel.ascended` — 1.024 against 1.021 — and that gap compounds over the **whole** level rather
than over the chapter: `(1.024 / 1.021) ** 411` is ×3.34 where `** 305` is ×2.45. So the enemy side
takes about **fifteen levels' worth** of head start across one chapter at this depth, straight off
the margin: +23 − 15 ≈ **+8**. Measured, +45 → **+56** is +11.

| Chapter | Party                   | Margin | Ratio |
| ------- | ----------------------- | ------ | ----- |
| 6       | `legendary` at 200      | +25    | 1.44  |
| 7       | `legendary-plus` at 260 | +45    | ~1.16 |
| 8       | `mythic` at 340         | +56    | 1.10  |

⚠️ **So chapters 9 and 10 are re-derived downward, and this rule is not the way to do it either.**
The roadmap's ~514 and ~617 assume the uncorrected rule; the corrected one points lower again. Both
are estimates and the second term keeps growing. **Bisect the final for the 90% edge, back off to
where the tuned party keeps three or four of five, and check the ratio** — the arithmetic is for
knowing which direction to guess in, not for choosing the number.

The band-opener trap fired for a third consecutive chapter, and this time it took **two** passes to
clear. `c8-s23` measured 1,859 after `c8-s19`'s 2,588, and a legendary wall plus a second bound body
still only reached 2,092 against a 0.85 tolerance. ⚠️ **What that measured is the gap between two
locks:** the two boards are the same shape — two legendaries in front, two legendaries and a common
behind — and **taunt-in-front-of-archers is worth about a quarter more than a bound back rank**. A
bind costs the party its route; a taunt costs it its targets, and the probe reads the second as
heavier.

#### ⚠️ The income exponent moved, which is the decision 21a handed forward

`levels.spec.ts`'s "charges real time for the level the top of the ladder asks for" (`1h < x < 24h`)
read **48.7 hours** at the chapter as first authored and **41.4** as shipped. 21a recorded that this
carries a real design claim and is not a threshold to slide, and named the two levers. Both
alternatives were measured and neither works:

- **Flattening the essence curve is arithmetically insufficient.** At an essence exponent of 2.1
  chapter 8 scrapes under, "essence is the bottleneck late" breaks at level 200, and chapters 9 and
  10 still read 40h and 60h. Below 2.0 the binding currency becomes **xp**, which alone reads 27.8h
  at chapter 9.
- **Scaling `baseRates` buys about one chapter per doubling**, because the divergence is between two
  exponents and no constant factor touches it.
- ⚠️ **And there is no level at which chapter 8 satisfies both the margin rule and the guard.** 24
  hours lands at level ~330; `mythic` caps at 340. The chapter would have to close _below_ the cap
  of the rung it asks for, which is exactly the walkover 21a measured.

So `STAGE_REWARDS.exponent` goes **1.13 → 1.45**, and the derivation is that the relation the number
was calibrated against had quietly inverted. 1.13 was set when enemy level was very nearly _linear_
in the stage index; 21a's corrected margins made it superlinear, so over the shipped ladder level
grows as ~`index ** 1.5` and income at `index ** 1.13` is income proportional to `level ** 0.80` —
**sub**-linear, where the original calibration set it slightly super-linear at `level ** 1.12`. At
1.45 it reads `level ** 1.00`.

⚠️ **1.45 is the conservative end of a band and that is deliberate.** A full restoration would be
**1.60**; the failing guard needed only **1.42**. chapter 8 reads **6.7h**, and against the roadmap's (too high)
levels for chapters 9 and 10 it would read 12.8h and 18.9h — about a fifth of the guard's headroom
left at the end of the milestone rather than a twentieth, and more than that once those two chapters
are re-derived downward (~8.5h and ~11.2h at the corrected margins). What it costs is
legible: a stage-100 clear pays ×4.4 and a stage-10 clear ×2.1, so mid-ladder progression is roughly
twice as fast in wall-clock time. It makes **no content easier** — a party is capped by its
ascension rung, not by its income — and both stomp assertions are one-sided, so they stay green.

#### ⚠️ The signature gap closed, five milestones after it opened

`mythic` caps at 340 and the hardest authored stage is now **396**, so for the first time shipped
content sits above the unlock rung. `signature.balance.ts`'s `contested()` stops re-levelling and
returns the stage as `data/` wrote it.

⚠️ **Removing the override changed none of the numbers, and that is worth stating plainly.**
`reach()` overwrites `level` on every trial, so the field was dead on arrival — what it bought was a
claim about the probe's method, not an input to it. All fourteen figures moved anyway, for a
different reason: the hardest stage is now `c8-s50` rather than `c6-s50`, a different board under a
different id seeding a different sequence. **Do not read the move as evidence about the items.**

#### Five guards fired; two were not predicted

- **`levels.spec.ts` — "charges real time".** Predicted, named as 21b's decision, and answered above.
  41.4h → **6.7h**.
- **`gear.spec.ts` — the top grade's share of end-of-ladder drops.** Predicted by 21a, to the
  chapter. 18.7% → **23.4%** against a `< 0.2` bound; `gradeSoftness` re-derived 125 → **150**, which
  restores 18.7% for the third time. ⚠️ **Two hundred would have bought the whole milestone in one
  edit and was declined**, which is the opposite of the call 21a made on the ceiling ratio — that
  quantity is _meant_ to fall, this one is a bug being papered over, and hiding it for two chapters
  makes the saturating tilt it actually wants easier to forget.
- **`towers.spec.ts` — the tower:campaign crystal ratio.** Predicted. 1.13 → **0.96** against a floor
  of 1.1, because the campaign side moves and the tower side cannot until 21e. Floor lowered to
  **0.7** in one edit covering 21b–21d (0.96 / 0.83 / 0.74 are all known in advance). ⚠️ **Restoring
  it to at least 1.3 is still a deliverable of 21k.**
- **⚠️ `gear.spec.ts` — "roughly doubles what gold is for". Not predicted, and it was hiding a stale
  retype.** The comment claimed derivation from `STAGE_REWARDS`; the _exponent_ came from there and
  the **index** was the literal `100`, which is how long the ladder was when it was written. So it
  measured gear against chapter-4 income for four chapters. Correctly derived it would have fired at
  **chapter 7** (17.4h against a floor of 20). ⚠️ **The quantity falls forever by construction** —
  gear's gold cost is a _constant_ and top-of-ladder income grows every chapter — and unlike the
  level ceiling there is no invariant to restate it as: measured against levelling instead it decays
  _faster_, because level cost grows as `L ** 2.55`. **What closes it is gear costs that scale with
  content**, which is a milestone-sized retune of `data/gear.ts`; milestone 21 says a chapter finding
  it needs one writes it down rather than taking the scope, so the floor is 1 and it fires again
  around chapter twelve.
- **⚠️ `chapters.balance.ts` — the difficulty probe's bracket. Not predicted.** `high` was 4,000 and
  chapter 8 walked through it, which presents as a threshold of _exactly_ the ceiling on every stage
  past `c8-s31` — a difficulty curve silently flattening into a horizontal line. The `expect(clears(
high))` beside the bisection is what turns that into a failure rather than a plausible number.
  Widened to **50,000** with two more steps; expect to widen it again roughly every other chapter,
  and to add a step with it or the resolution decays.

#### Green, with the margin worth knowing

- **`levels.spec.ts` — "leaves the ceiling aspirational."** 17.8 at chapter 7 → **9.4**, against the
  floor of 4 that 21a set for the whole milestone. Income cancels out of this ratio, so the exponent
  change did not touch it.
- **`levels.spec.ts` — rungs unspent above the ladder's demand.** 396 < `caps[12]` = 700.
- **`banners.spec.ts` — the roster-relative crystal ceiling.** 300 clears is 96 pulls a day and 5,038
  copies is ~52 days against a floor of 30.
- **`achievements.spec.ts` — pulls per stage.** 7.76 → **7.62**, band 5–9.
- **`chapters.balance.ts` — the levelling-versus-ascension share.** 0.37 → **0.34**, band 0.2–0.8.

### 21c. Chapter 9 — The Hollow Anvil — **COMPLETE**

Fifty stages, enemy levels **396 → 490**, ten new Dwarven archetypes, three new skills and **no new
status**. The ladder goes 300 → **350** stages and the enemy roster 82 → **92**. Nothing in `ui/` and
nothing in `core/` changed.

#### What it ships

- **`src/data/chapter-9.ts`**, five bands of ten. The chapter's signature is that every board has an
  opinion about whether anything the party does **stays done** — where chapter 7 asked _how_ its
  damage arrives and chapter 8 _where_ it lands. Eight chapters have taught the same opening, which
  is to Sunder the wall and Weaken the carry; down here none of it lands, and what does land is
  taken off again.
- **Ten Dwarven blocks**: four `common`, four `legendary`, and two `ascended` — The Grudgekeeper, the
  chapter **lieutenant**, on all four mini-boss boards, and The Anvil Crowned on `c9-s50` and nowhere
  else. Dwarves go 8 → **18**, the depth milestone 21 fixed its leans to produce, and all eight of
  the Dwarven blocks the ladder already had are fielded here — the garrison the party has been
  meeting one at a time since the fen, standing in its own halls.
- **Three skills and no status.** `THE_QUENCH` is the **first status of any kind aimed at
  `enemy-lowest`**, `IRON_FOR_IRON` is the first reflect applied to a chosen ally and the first
  reactive one, and `THE_ANVIL_FALLS` is the first stun aimed at one body rather than the whole
  board.
- **A sixth reference party.** `WEALDED` is chapter 8's `INVESTED` under a new name — the fifth time
  that has been needed — and `INVESTED` moves to `mythic-plus` at 420.

#### ⚠️ The status budget: none of the two spent, and the argument is that four aimings were free

Milestone 21 licenses three statuses across four chapters; 21a spent none, 21b spent one, and **two
still remain for 21d**. "The budget allowed it" was never the argument and neither is "21c managed
without" — but what this chapter found is worth recording, because it is the third data point on a
question 17 opened.

Every one of the four bands is either a stat block or an existing part pointed somewhere new:

| Band | The lock                                             | What it cost                              |
| ---- | ---------------------------------------------------- | ----------------------------------------- |
| 1    | your setup does not land                             | `tenacity`, on the stat blocks            |
| 2    | what you put back does not stay                      | a bomb on `enemy-lowest`                  |
| 3    | what you commit to is what charges you               | a reflect on `ally-lowest`, reactively    |
| 4    | the one thing you may hit is the one you cannot open | a pair: a taunt worn by a `tenacity` wall |

**Band 2 is the one worth reading twice.** `ally-lowest` is where every heal in the game is pointed,
so a payload aimed at `enemy-lowest` lands on exactly the body the party's healer has just committed
to — the heal arrives, the fuse arrives on top of it, and the cleanse and the heal want the same
turn. The barrows' two bombs both ask _where to spend the cleanse_; this asks whether the cleanse is
worth more than the heal on the one member the party has already decided to save, and it re-asks it
every time the party succeeds.

⚠️ **Band 1 is a stat block, which is the Sunless Weald's move on a different stat and the second
chapter running to make it.** `ModifiableStat` is `atk`, `def` and `haste`, so `tenacity` cannot be a
status without a `core/` change this milestone forbids. What answers it is `insight`, which **two**
characters carry against `accuracy`'s five. And it is sharper than the weald's: `statusChance` is
`authored + insight − tenacity` **clamped at zero**, where `dodge` is floored by `MIN_HIT_CHANCE` at
a tenth — so a high enough pool refuses a debuff outright rather than taxing it. The Anvil Crowned at
0.85 takes the largest authored chance in the game to nothing.

#### The level line, measured — and the corrected rule under-predicts

21b replaced "+23 a chapter" with "+23 less whatever the enemy's own curve has taken", worth about
+8 at that depth. Solving that forward reproduces chapter 8's shipped 396 almost exactly and points
chapter 9 at **486** — and 486 measures as a **walkover**: the party the chapter is tuned for takes
the final with **4.75 of five still standing**, which is the failure 21a's whole correction exists to
catch.

The transition is the step function `docs/testing.md` warns about, and it is sharper here than it was
in the weald: **100% at 496, 85% at 498, 25% at 500 and 0% at 502.** Backing off the 90% edge to
where the tuned party keeps three or four of five lands at **490** — margin **+70**, probe ratio
**1.21** against the 1.1–1.4 target, 3.65 survivors, and the longest fight 20 seconds against a
ninety-second clock.

| Chapter | Party                   | Margin | Ratio |
| ------- | ----------------------- | ------ | ----- |
| 7       | `legendary-plus` at 260 | +45    | ~1.16 |
| 8       | `mythic` at 340         | +56    | 1.10  |
| 9       | `mythic-plus` at 420    | +70    | 1.21  |

⚠️ **The arithmetic has now been wrong in both directions — high in 21b, low here — so it is a
starting bracket and not an answer.** The roadmap's ~+38 for this chapter was wrong by more than
thirty levels and its ~514 was wrong the other way; both came from taking a formula at its word. The
row for chapter 10 is still an estimate.

**The band-opener trap did not fire, for the first time in four chapters.** The stride puts chapter
9's samples on s1, s5, s9 … s49 plus the boss, so **s21 and s41** are band openers on samples where
chapter 8's were s11 and s31 — and both were authored heavy up front rather than discovered in the
sweep. Checking the phase before authoring is the whole of what changed.

#### ⚠️ The ladder is ten levels from a guard nobody wrote it for

`chapters.spec.ts` holds the top stage under `LEVEL_CURVE.maxLevel / 2` = 500, and this chapter
closes at **490**. The assertion's own comment says "two chapters must not consume the curve" — it
was written when the ladder was two chapters long and it is about to mean something entirely
different. **Chapter 10 cannot satisfy it at any margin the rule permits**, so 21d has to decide
whether the claim is still the one worth making rather than sliding the number. It is the second
guard in this project to outlive its argument; `levels.spec.ts`'s retired hours-to-the-ceiling is the
shape of the answer.

#### One guard fired, and it was the predicted one

- **`gear.spec.ts` — the top grade's share of end-of-ladder drops.** Predicted by 21a and 21b to the
  decimal: **22.6%** against a `< 0.2` bound. `gradeSoftness` re-derived 150 → **175**, restoring
  18.7% for the fourth time. ⚠️ **Four landings and every one of them is 18.7%, which is the finding
  rather than the number**: the solution is always `stages / 2`, the value at which the tilt equals
  3.0. The constant is the ladder's length halved, written by hand once a chapter, and what it wants
  is a tilt that **saturates**. 200 — which would buy chapter 10 — was left for chapter 10 to make,
  holding to 21b's call.

#### Green, with the margin worth knowing

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 0.96 → **0.83**, landing on 21b's
  projection to two decimal places, against the placeholder floor of 0.7 that 21b lowered to cover
  this chapter and the next. ⚠️ **Restoring it to at least 1.3 is still a deliverable of 21k.**
- **`levels.spec.ts` — "leaves the ceiling aspirational."** 9.4 → **5.6** against a floor of 4. ⚠️
  **21a projected ~7 here and the real figure is lower**, because the chapter closed at 490 rather
  than the roadmap's ~458 — so **chapter 10 lands below the floor**, and it is the chapter that has
  to answer the question 21a deferred rather than move the number again.
- **`levels.spec.ts` — "charges real time."** 6.7h → **11.2h** against a two-sided `1h < x < 24h`.
  21b projected ~8.5h; the same closing level explains the gap. Chapter 10 lands in the high teens,
  which is the last of the 1.45 exponent's headroom.
- **`levels.spec.ts` — rungs unspent above the ladder's demand.** 490 < `caps[12]` = 700.
- **`banners.spec.ts` — the roster-relative crystal ceiling.** 350 clears is 108 pulls a day and
  5,038 copies is ~47 days against a floor of 30.
- **`achievements.spec.ts` — pulls per stage.** 7.62 → **7.51**, band 5–9.
- **`chapters.balance.ts` — the levelling-versus-ascension share.** Green in band 0.2–0.8.
- **The difficulty probe's bracket**, widened 50,000 → **500,000** with two more steps. Not a
  failure — 21b predicted it — but worth stating as a standing expectation: the bracket spans the
  _party's_ power, `1.021 ** (level - 1) × 1.6 ** rungs`, which grows with the margin rule rather
  than with the stage count. Expect it every chapter at this depth, and **add steps with it or the
  resolution decays**.

#### ⚠️ Two corrections to shipped prose, both the "never true of the boards under it" kind

**Chapter 8 claimed no celestial appears in it and The Unmade stands on `c8-s42` and `c8-s47`.** The
same sentence said chapter 7 "used them sparingly", and chapter 7 fields a celestial on **twenty of
its fifty boards**. The boards are swept and the prose is not, so the prose is what moved: the rule
chapter 8 actually follows is that no celestial _leads_ a board. This is the same class of defect
21b found in 21a's Cairn King note, and the second time in three sessions — **when a chapter's header
makes an absolute claim about its own boards, check it against the boards.** Chapter 9 makes the
stronger claim and it was checked mechanically before it was written down: no celestial appears there
at all, deliberately, because `tenacity` is already a tax no composition answers and two of those on
one board is one too many.

**The fourteen signature reach figures moved again**, for the third cut of the ladder: `contested()`
picks the hardest stage and it is now `c9-s50`. ⚠️ **The useful part is what did _not_ move.** Bare
reach rose fifteen to thirty levels because the probe's base board got harder, while **eleven of the
fourteen gains landed within three of their previous values** and Seraphine's is +9 for the third cut
running. The gain column is what survives a change of base; the reach column is not. Expect to
re-measure once a chapter for the rest of milestone 21.

### 21d. Chapter 10 — The Bleeding Wild — **COMPLETE**

Fifty stages, enemy levels **490 → 588**, ten new Monster archetypes, seven new skills and **both of
milestone 21's two remaining statuses**. The ladder goes 350 → **400** stages and the enemy roster 92
→ **102**. Nothing in `ui/` and nothing in `core/` changed.

#### What it ships

- **`src/data/chapter-10.ts`**, five bands of ten. The chapter's signature is what the party's damage
  **does to the thing it is spent on** — where chapter 7 asked how its damage arrives, chapter 8
  where it lands, and chapter 9 whether it stays done. Nine chapters have taught that damage is
  simply progress; out here what the party puts into a body is what arms it, and what it takes back
  does not stop.
- **Ten Monster blocks**: four `common`, four `legendary`, and two `ascended` — The Redmaw, the
  chapter **lieutenant**, on all four mini-boss boards, and The Everwound on `c10-s50` and nowhere
  else. Monsters go 8 → **18**, which finishes the four leans milestone 21 fixed up front (undead 17,
  elf 17, dwarf 18, monster 18). All seven Monster blocks the ladder already had are fielded here;
  The Fenlord is the one that cannot be, because it is chapter 3's final.
- **Both remaining statuses, and seven skills to aim them.** `BLOODRISEN` is a permanent
  `stat-mod` a body gives itself when wounded; `SAVAGED` is a permanent hostile `dot`. Three of
  the seven skills apply the first at three widths — `self`, `ally-lowest`, `ally-all` — which is the
  shape `IRON_FOR_IRON` and `DRAW_INTO_THE_ROOT` proved on their own statuses.
- **A seventh reference party.** `ANVILLED` is chapter 9's `INVESTED` under a new name — the sixth
  time that has been needed — and `INVESTED` moves to `ascended` at 500.

#### The status budget: both spent, and what each one says that nothing shipped does

Milestone 21 licensed three statuses across four chapters. 21a spent none, 21b spent one, 21c spent
none, and this chapter spends the last two. "The budget allowed it" was never the argument, so here
is the argument for each:

| Status       | Kind       | What no pair of shipped parts says                      |
| ------------ | ---------- | ------------------------------------------------------- |
| `BLOODRISEN` | `stat-mod` | the first answer to being wounded that does not lapse   |
| `SAVAGED`    | `dot`      | the first hostile status of any kind that never expires |

**`BLOODRISEN` is `WRATH_UNBOUND` with the timer taken off, and the timer was the whole of it.** The
Wrathborn has answered its own wound since the fen — rally and haste for forty-five ticks below half
health — and the Ashfall Sovereign carries the same turn. That is a **window**: a party that survives
four turns has survived it. Permanent, the question stops being whether the party can weather
something and becomes **how it spends its damage** — chipping five bodies without killing them arms
five of them for the whole fight, and finishing one at a time arms at most one. ⚠️ **It is the exact
inverse of the Sunless Weald's third band**, which is why the two stand a chapter apart: `ROOTBOUND`
punishes focus and rewards spreading, and this punishes spreading and rewards finishing, so a party
arriving with the weald's habit is holding the wrong one.

**`SAVAGED` changes what a cleanse _is_.** Every hostile status shipped expires — the debuffs at 45
ticks, a poison at 60, the bombs between 24 and 50, a stun at 16 — so a cleanse has always been an
optimisation: spend it and take less, skip it and take the rest. This is the first status where a
cleanse is the **only** exit, and a party fielding none carries every wound it takes to the end of
the fight.

⚠️ **It shipped at 0.08 and that was measurably wrong**, which is worth recording because the error
is invisible in every reading of the number and obvious in one measurement. A dot ticks on its
holder's own turn, so a permanent one is worth `power × turns survived` where a Bleed is worth
`power × four`; on `c10-s50`, which runs fourteen seconds, a carrier takes **ten procs**. At 0.08
that is 0.8 of the applier's `atk` against a Bleed's 1.2 — **the status that never expires was worth
less than the one that lapses after four turns**, so the mechanic read as a decision while doing
nothing worth spending a turn on. At **0.12** it is level with a bleed in the chapter's hardest fight
and strictly more in any longer one, which is the statement it exists to make. It costs 0.08 of a
survivor at the final and moves no other stage.

⚠️ **Both are safe to be permanent for the reason `THORNMAIL` is: they can only ever shorten a
fight.** One is extra damage on the party and the other is extra damage from the board; neither puts
health back. **The defensive mirror — a body that armoured itself as it was hurt — is the one shape
of this idea nobody may author**, because it is the same idea pointed at the ninety-second clock.

**Bands 3 and 4 spend nothing.** The pack is `lifeLeech`, the faction's own idiom since 8e, on boards
wide enough that chipping them arms everything; the bellow is a taunt worn by a body carrying the
frenzy. ⚠️ **That last is deliberately the Hollow Anvil's pair with a different sentence in it** —
there the one thing the party could hit was the one thing it could not _open_, and here it is the one
thing it must not **wound**.

#### The level line, measured — and the closed form was wrong again

The roadmap said ~570 and 21b's corrected arithmetic pointed near +70. At 570 the party the chapter is
tuned for takes the final with **all five alive in eight seconds**, which is the walkover 21a's whole
correction exists to catch. Bisecting instead: **100% at 592, 68% at 594, 25% at 596, 5% at 598** —
the same step function every chapter since the weald. Backing off to where the tuned party keeps four
of five lands at **588**: margin **+88**, probe ratio **1.12** against the 1.1–1.4 target, 4.00
survivors, and the longest fight in the chapter 19 seconds against a ninety-second clock.

| Chapter | Party                   | Margin | Ratio |
| ------- | ----------------------- | ------ | ----- |
| 7       | `legendary-plus` at 260 | +45    | ~1.16 |
| 8       | `mythic` at 340         | +56    | 1.10  |
| 9       | `mythic-plus` at 420    | +70    | 1.21  |
| 10      | `ascended` at 500       | +88    | 1.12  |

⚠️ **Four measured margins is enough to say the growth is +12 to +18 a chapter and rising**, not the
+8 21b derived from the two curves. The derivation is not wrong — the enemy's own growth curve really
does take about fifteen levels a chapter back — it is just not the only term. **Bisect; do not
solve.**

**The band-opener trap did not fire, for the second chapter running.** The stride puts this chapter's
samples on s3, s7, s11 … s47 plus the boss, so **s11 and s31** are band openers on samples. Both were
authored heavy up front — five bodies with a legendary pair in front — rather than discovered in the
sweep. Checking the phase before authoring is the whole of what changed, two chapters ago.

#### ⚠️ Two guards were retired rather than moved, and that was 21d's real decision

`chapters.spec.ts` held the top stage under `LEVEL_CURVE.maxLevel / 2` = 500 and `levels.spec.ts`
held a ratio of what the ceiling costs to what the top stage demands, floor 4. Chapter 10 fails both:
588 against 500, and **3.62** against 4.

**Neither could be satisfied by any chapter the level rule permits.** The rule is that each chapter
closes further past its rung's cap than the last; `ascended` caps at 500; a chapter closing below its
own rung's cap is the walkover 21a measured. And both quantities **fall on every chapter forever** —
the first is a fraction of a fixed ceiling and the second is hours-based with income rising by design
— so moving either is buying one chapter at the price of pretending the guard still watches
something. `levels.spec.ts`'s own comment said as much: when it fires, "the question to ask is not
what number goes here but whether the ladder has come far enough to have earned the distance it has
closed", and that is not a question a threshold can answer.

**What owns the claim now is `levels.spec.ts`'s "leaves rungs unspent above everything the ladder
asks for"** — the top stage must stay below `caps[12]` = 700, three rungs from the end. It cannot
decay: the rung count is fixed however long the ladder gets. This is the **third** guard in this
project retired rather than slid, after `levels.spec.ts`'s absolute hours-to-the-ceiling and the
ratio that replaced it.

⚠️ **What 21d measured while doing it, and deliberately did not write a guard for.** The level line
now adds about ninety levels a chapter (80, 91, 94, 98), so:

- the rungs-unspent claim fires at **chapter 12**;
- the level curve is consumed entirely around **chapter 15**, not the chapter 100 the retired prose
  assumed — that figure was written when the level line was very nearly linear and has not been true
  since 21a's correction.

That is a roadmap question rather than a threshold: **how long is the campaign meant to be?** It is
recorded here and in both spec files, and left open. Nothing about it is wrong today.

#### One guard fired, and it was the predicted one

- **`gear.spec.ts` — the top grade's share of end-of-ladder drops.** Predicted by 21a, 21b and 21c:
  **22.1%** against a `< 0.2` bound. `gradeSoftness` re-derived 175 → **200**, restoring 18.7% for the
  fifth time. ⚠️ **Five landings and every one of them is 18.7%** — the solution is always
  `stages / 2`, the value at which the tilt equals 3.0, so the constant is the ladder's length halved
  and not a tuning number at all. 21b declined to write 200 early and **that was right**: had it, this
  landing would have been silent and the finding would rest on three points instead of five. What it
  wants is a tilt that **saturates**; chapter 11 will want 225.

#### Green, with the margins worth knowing

- **`levels.spec.ts` — "charges real time."** 11.2h → **16.1h** against a two-sided `1h < x < 24h`.
  21c projected "high teens"; a third of the 1.45 exponent's headroom is left, so chapter 11 is where
  income is the question again.
- **`levels.spec.ts` — rungs unspent above the ladder's demand.** 588 < `caps[12]` = 700, and this is
  now the sole owner of the aspirational-ceiling claim.
- **`towers.spec.ts` — the tower:campaign crystal ratio.** 0.83 → **0.74**, landing on 21b's
  projection exactly, against the placeholder floor of 0.7 that 21b lowered to cover chapters 8
  through 10. The campaign side is **297,500** against the tower side's 219,100 — the figure 21b
  projected for the end of 21d, to the crystal. ⚠️ **Restoring the floor to at least 1.3 is a
  deliverable of 21k**, and it is now the only thing standing between this guard and watching nothing.
- **`achievements.spec.ts` — pulls per stage.** 7.51 → **7.44**, band 5–9.
- **`banners.spec.ts` — the roster-relative crystal ceiling.** 400 clears against 5,038 copies is ~41
  days, floor 30.
- **`chapters.balance.ts` — the levelling-versus-ascension share.** Green in band 0.2–0.8.
- **The difficulty probe's bracket**, widened 500,000 → **5,000,000** with a seventeenth step.
  `c10-s50` asks about 1,193,000. Expect it every chapter at this depth — the bracket spans the
  _party's_ power, which grows with the margin rule rather than with the stage count. ⚠️ A step buys
  back far more than a factor of ten costs (0.03% → 0.014%), so the **count** only needs moving every
  few widenings, but the ceiling needs moving every time.

#### ⚠️ One correction to this chapter's own boards, found the way the last two were

The header claims nothing that puts health back stands on a board with the Bellower's taunt — the
rule that keeps a taunt from being a ninety-second clock. `c10-s36` shipped a **Sepulchre Hound**
behind it, which carries `lifeLeech: 0.1`. It was caught by walking all fifty boards against the
header mechanically, not by reading them.

**This is the third session in four to find a chapter's absolute claim wrong about its own boards**
— 21b found chapter 7's Cairn King note, 21c found chapter 8's "no celestial appears" — and the
lesson has now graduated from an observation to a procedure: **when a chapter's header makes an
absolute claim about its boards, check it with a script before shipping, not by reading.** The three
rules this chapter states are each a two-line predicate over `CHAPTER_10.stages`; running them takes
seconds and reading fifty boards carefully does not work. The Barrowmist Keener replaced the Hound:
same faction, same weight, nothing to refill.

#### The fourteen signature figures moved again, and 21c's rule for how they move did not survive

`contested()` picks the hardest stage, so the base board is `c10-s50` now and all fourteen were
re-measured. ⚠️ **21c recorded that bare reach rises fifteen to thirty levels while the gains stay
still. This cut saw the opposite shape**: bare reach rose **nought to seven** while five of the
fourteen gains moved by five — including Seraphine's, which had been +9 for three cuts running and is
**+14** here.

So the honest rule is weaker than 21c's and worth more: **the gains move less** (all fourteen within
five, eight within three) and a reach figure is meaningless outside its own cut. **Re-measure the
whole table rather than predicting what will move.** All 1,971 unit tests and all 74 balance tests pass.

### 21e. The Human Tower, floors 101–200 — **COMPLETE**

A hundred new floors, `TOWER_RULES` doubled, four new Undead archetypes and three new skills. Every
tower goes 100 → **200** floors and enemy levels 1–60 → **1–120**; the Human Tower is the first with
its second hundred authored, and the enemy roster goes 102 → **106**. Nothing in `ui/` and nothing in
`core/` changed.

#### ⚠️ The plan's two central numbers were both wrong, and measuring them is most of this session

The section above prescribed `topLevel: 140` and a retune of all seven hundred shipped floors. Both
were tested first, because 21a–21d had established that a level line is bisected rather than solved.

**140 breaks the shipped hundred.** Against the crew those floors were tuned for — five of the
faction at `rare-plus`, level 60 — **46 of the 700 shipped floors fall below the 90% bar** and six of
seven roofs go from 100% to **0%**. The damage starts around floor 80, not floor 95, because the
shipped boards climb in weight _with_ the level line: steepening the line breaks the pair everywhere
the board was already at the crew's ceiling.

**And no other crew measures the low band instead.** An `elite`-rung five at level 70 — one rung and
ten levels up — clears all seven shipped hundreds with **all five alive on every roof**. The rung is
what does it: `elite` is where the second skill unlocks, and that dwarfs forty levels.

**140 also produces a roof no board can make into a fight.** This is the more important finding. The
crew `topLevel: 140` implies is `elite-plus` — three rungs above `rare`, ×4.096 — and **the enemy
side has no rungs at all**. At level 140 that five takes the heaviest board this game can author
(five `ascended` blocks with an Unmade in front) at **100%, all five alive, nine seconds**. It needs
content around level 165 to be tested at all.

| Crew         | Rungs | Heaviest authorable board at the crew's own level |
| ------------ | ----- | ------------------------------------------------- |
| `rare-plus`  | 1     | 0% — the crew loses                               |
| `elite`      | 2     | 100%, 4.30 survivors                              |
| `elite-plus` | 3     | 100%, 5.00 survivors, 9s                          |

So **no rarity cap above 60 can be a testable roof**, and the whole argument for 140 — that it is a
cap, which keeps the sweep's party derived — was buying nothing. What a tower needs is the campaign's
**margin rule**: it closes _above_ the cap of the rung it asks for.

#### 120, and the retune that evaporated

`topLevel: 120` with `floors: 200` gives a slope of 119/199 = 0.5980 against the shipped 59/99 =
0.5960. **Ten of the seven hundred shipped floors move, each by exactly one level**, and all 700
sweep with zero failures. The retune is not smaller than the plan expected — it does not exist.

That is arithmetic rather than luck: 199 ≈ 2×99 + 1 and 119 ≈ 2×59 + 1, so doubling the floor count
and _doubling the top level_ is the transformation that leaves the line where it was. **Any future
extension of a tower should reach for that first** — the level at which the new slope meets the old
one — and only then ask whether the roof it implies is a fight.

- **Band 1** — floors 1–100, `rare-plus` at 60, the cap that **equals** the halfway floor's level.
- **Band 2** — floors 101–200, `elite` at 100, the highest cap strictly **below** the roof's 120.

`towers.spec.ts`'s "tops out at exactly a rarity cap" is replaced by the margin rule and a second
assertion that the halfway floor's level _is_ a cap — which is the half of the old claim worth
keeping, and the half band 1 depends on.

#### ⚠️ The alternate five is the binding constraint in band 2, and that is new

The shipped hundred put both Human arrangements at parity with the content, so the question never
arose. With a +20 margin the two come apart: measured at level 120, **any board that gives the
reference five a real fight wipes the alternate**. A two-`ascended` board reads 93% / 2.4 survivors
for the reference crew and **7%** for the alternate, against its own 75% bar.

The alternate clears two-anchor boards to about level 108 and falls off a cliff by 117. So the last
twenty floors escalate through the **level line and the board's own support density** — links,
shields and a taunt — rather than by stacking anchors, which is the exact inverse of the shipped
hundred's climax. The roof is `The Deathless Marshal` beside a Bonechain Warden over a Reliquary
Bearer: **95% / 3.38 survivors / 20.3s** for the reference five, **83% / 1.93** for the alternate.

#### Four Undead blocks, three skills, and no new status

Undead 17 → **21**, the lean the matchup matrix asks for. ⚠️ **A tower gets four where a chapter gets
ten**, and the ratio is the point: a chapter authors five bands each asking a different question,
where a tower asks one question a hundred more times. What these fill are shape gaps a
two-hundred-floor climb exposes.

- **Charnel Drudge** (`common`) — fodder a crit cannot delete. The Undead bench had thin-and-fast and
  thick-and-slow, and nothing wearing `critBlock` on both resists.
- **Nightmarch Outrider** (`legendary`) — reach at speed, plus a `dodge` pool. ⚠️ **Answerable rather
  than a tax, and the Human bench is what makes it so**: exactly one Human carries `accuracy`, and
  she stands in the reference five. Never stacked two to a board.
- **Reliquary Bearer** (`legendary`) — the only shape of sustain a tower may have. 15c measured what
  a healer on a roof is; a **shield banks a pool once and depletes**, so it can make a floor cost more
  turns and can never make one cost all of them.
- **The Deathless Marshal** (`ascended`) — floor 200, and the first roof this tower has owned. Floor
  100 is The Oathbreaker, a block the campaign also fields, which was right for a tower with one
  hundred floors and no body of its own.

`THE_LAST_MUSTER` is the first board-wide `atk` buff any Undead block carries, and ⚠️ **it lapses on
purpose** — forty-five ticks against a seventy-tick cooldown — unlike 21d's permanent rallies. A roof
that ratcheted upward and never came down is the ninety-second clock with a name on it. Milestone
21's status budget was spent and closed by 21d and a tower does not re-open it; all three skills are
existing statuses on bodies that had not carried them.

#### Spire Conqueror pays twice, which is the tie restated rather than broken

`every: 100` stays, so a two-hundred-floor tower earns it **twice**. Re-authoring it as `every: 200`
to keep "conquering a spire" a single event was declined: it strips 70,000 crystals from the tower
side and drops the tower:campaign ratio under its own floor, breaking the guard this milestone exists
to fix. The tie always rested on "a hundred floors and a fifty-stage chapter are comparable events",
so it is **stated per unit** and the number did not move. No save migration: awards-taken is an
integer, and a player who topped the old hundred has taken 1 and earned 1.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 0.74 → **0.835**, against the placeholder
  floor of 0.7. The Human Tower alone goes 31,000 → **62,300**; the seven now pay 248,300 against a
  campaign of 297,500. ⚠️ At 21k the seven reach **436,100** and the ratio **1.466** — 21b's
  projection to three decimal places — at which point the floor goes back to at least 1.3.
- **`towers.spec.ts` — the faction lean.** Fired at 69.8% against a 65% ceiling: a hundred new floors
  authored from the lean's own deepened bench is more Undead than the shipped hundred was. Answered
  by substituting non-Undead legendaries of comparable weight through the filler slots — 60.7%
  overall now, and the second hundred reads 67.2%.
- **`towers.balance.ts` — "gets harder as it is climbed"** is now measured **within a band**. A
  band-2 crew is a rung and forty levels above a band-1 crew, so it takes its own opening floors
  faster than band 1 takes the shipped hundred's closing ones — 3.9s at floor 101 against 23.7s at
  floor 100. Comparing halves of the whole tower would read a ramp as a decline, and the thing that
  changed would be the party rather than the content.
- **"Still costs that crew something near the top"** now compares the roof against **its own band's
  opening floor** rather than the tower's floor 1, for the same reason.
- **Two UI specs had the tower's height retyped** and both failed: a `fraction` of 0.36 for floor 36,
  and a `rare-plus` fixture crew that can no longer take the roof it is asked to top. Both now derive
  from the shipped tower. ⚠️ These are the first tests outside `data/` that the derive-never-retype
  rule has caught, and a UI fixture that _fights real content_ is exactly where it hides.

All 1,972 unit tests and all 74 balance tests pass. The tower sweep runs in 49s against 42s before,
despite one tower being twice as tall.

### 21f. The Dwarf Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new Human archetypes and three new skills. Human was the thinnest faction
in the game at nine blocks and goes to **13**; the enemy roster goes 106 → **110**. Two of seven
towers now have their second hundred. Nothing in `ui/` and nothing in `core/` changed, and
`TOWER_RULES` was not touched — 21e's height moved once for all seven.

#### The rule 21e proved held, and the shape it set did not

21f is the first session run against 21e's pattern rather than inventing one, and **the pattern held
everywhere it was structural and failed everywhere it was aesthetic.** What transferred without
argument: two crews split at the halfway floor, four blocks rather than ten, no new status, a roof of
the tower's own, the lean substituted back down through the filler slots. What did not transfer is
**how the second hundred escalates**, and that is the finding this session owns.

#### ⚠️ Offence rather than bulk, measured

A Dwarf five carries the lowest `atk` in the game and the alternate arrangement is **three tanks**.
So the thing it beats by standing still is bulk, and the thing it loses to is the ninety-second
clock. Measured against both crews at the top floor's level:

| Board at level 120                              | reference five   | alternate five |
| ----------------------------------------------- | ---------------- | -------------- |
| one anchor + a _bulky_ legendary, 3 legendaries | 90% / **45.7s**  | **63%**        |
| one anchor + a _pressure_ legendary, same back  | 100% / **33.0s** | **90%**        |
| one anchor + a shield support in the back rank  | **28%**          | **0%**         |

Same nominal weight, twelve seconds apart, and only the offensive board is clearable by both
arrangements. ⚠️ **That third row is 21e's own climax shape** — thin the anchors, thicken the board's
support — and against these crews it is not a hard floor, it is an unwinnable one. Every point of
enemy sustain is a second of clock a party that cannot burst does not have. **15c's rule that anchors
are sized per tower against its own crew generalises from the anchors to the whole shape**, and that
is the sentence 21g–21k should carry: read the crew's failure mode before choosing how to escalate.

⚠️ **The back rank is a cliff rather than a dial.** Moving one body of the same output from the front
rank to the back takes the reference five from 100% to **10%** and the alternate from 100% to **3%**.
Dwarves carry the least reach in the game, so pressure they cannot aim at is a different fight rather
than a harder one. The second hundred escalates in front.

#### ⚠️ The roof is far lighter than the Human Tower's, and had to be

A roof at The Deathless Marshal's weight reads **0%** for both Dwarf arrangements, and no line-up
underneath it recovers that — the first version authored here was 1520 hp / 92 atk with a board-wide
`SUNDER`-and-damage turn, and every back rank tried under it wiped. The shipped block is **1300 /
78** with a single-target version of the same turn. It is the lightest `ascended` body any roof
fields, which is 15c's rule doing exactly what it is for.

The roof is `The Breachlord` beside a Kingsway Lancer over a Fen Stormcaller, a Seraph Adjudicant and
an Undervault Sapper: **98% / 2.33 survivors / 36.3s** for the reference five, **88% / 1.52** for the
alternate, against bars of 90% and 75%. Band 2 reads 5.5s at floor 101, 14.3s at 160 and 36.3s at
200; nobody dies below floor 185.

#### Four Human blocks, three skills, and no new status

Human 9 → **13**, the lean the matchup matrix asks for. ⚠️ **Human was the thinnest faction in the
game** — nine against Undead's and Elves' seventeen and Dwarves' and Monsters' eighteen — because
milestone 21's four chapters each leaned somewhere else on purpose. This is the session that closes
that gap, and `AGENTS.md`'s note that Human "is the one to lean a later chapter on" can be retired.

- **Forlorn Levy** (`common`) — a body that costs turns rather than health. The fastest and
  hardest-hitting body the faction has at its cheapest tier, and made of paper.
- **Kingsway Lancer** (`legendary`) — ⚠️ **the first Human `legendary` that is only damage.** The
  faction fields a healer, a caster and a taunt-wall at that tier, so every Human board so far could
  answer a party and not threaten it. `COUCHED_LANCE` is conditioned on the party being **whole**, so
  its weight lands early and the block swings afterwards — the deliberate mirror of
  `HEADSMANS_ARC`, which only becomes interesting once somebody is hurt.
- **Undervault Sapper** (`legendary`) — `SUNDER` across the front rank, which is where a Dwarf party
  keeps everything it is proud of. ⚠️ **`insight` rather than a bigger `chance`**: `statusChance` is
  `authored + insight − tenacity` clamped at zero, so a faction that invests in `tenacity` refuses a
  debuff outright however confidently it is authored.
- **The Breachlord** (`ascended`) — floor 200, and the first roof this tower has owned. Floor 100 is
  `Oathbreaker + Warden`, two blocks the campaign also fields.

`SUNDER` is the game's only defence shred and had never been pointed at the faction with the deepest
armour in it — which is the whole of the vocabulary these three skills use. Milestone 21's
three-status budget was spent and closed by 21d; 21e recorded that a tower does not re-open it, and
this session did not need to.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 0.835 → **0.940**, against the placeholder
  floor of 0.7. The Dwarf Tower goes 31,000 → 62,300 and the seven now pay 279,600 against a campaign
  of 297,500. Still on track for **1.466** at 21k.
- **`towers.spec.ts` — the faction lean.** Authored from the lean's own bench the second hundred came
  out at **86.2%** against a 65% ceiling — worse than 21e's 69.8%, because Human is a bench this
  session had just deepened and nothing else was competing for the slots. Answered the same way, by
  substituting non-Human bodies of comparable weight through the filler slots: **61.6%** in the second
  hundred and **60.2%** over the tower. ⚠️ **Expect this every session and budget for it**; it is not
  a surprise any more.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored.

#### ⚠️ The prose in `data/towers.ts` was a session behind, and it was prescribing work

`TOWER_RULES`'s doc block still described `topLevel: 140` as shipped — "levels 1 to 140", "it is
`elite-plus`'s cap exactly", "46 of the 700 shipped floors fall below the 90% bar" — and closed by
instructing that **"the top of each shipped hundred is re-authored in that tower's own session"**.
Every word of that is the plan 21e measured and rejected; the shipped value is 120 and the retune
evaporated. Two smaller ones went with it: the crystals paragraph quoted 22,900 a tower where the
arithmetic gives **22,300**, and both `towers.ts` and `tower-human.ts` placed level 120 in "chapter
3" where the ladder first reaches it at **`c5-s24`**.

⚠️ **This is the failure mode `docs/testing.md` records for content prose, arriving in a rules file.**
The constant moved and the paragraph explaining it did not, and because it reads as an instruction it
would have cost each of 21g–21k a wasted retune. Checked mechanically this time — the crystal
figures, the level-to-chapter claim and the band-level headers were all recomputed from the shipped
content rather than read. **Do that at the start of a tower session, not the end.**

All 1,972 unit tests and all 74 balance tests pass, with no new test added and no threshold moved —
every spec that reads this content derives from it.

### 21g. The Elf Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new Dwarf archetypes and three new skills. Dwarves go 18 → **22** and the
enemy roster goes 110 → **114**. Three of seven towers now have their second hundred. Nothing in
`ui/` and nothing in `core/` changed, and `TOWER_RULES` was not touched.

#### ⚠️ Neither shipped escalation transfers, and this is the session that makes that a rule

21f found that 21e's climax shape was unusable on its own crew and concluded "read the crew's failure
mode before choosing how to escalate". 21g is the test of that sentence, and it holds: **a third
tower produced a third answer.** Measured against both Elf arrangements at the top floor's level,
before anything was authored:

| Board at level 120                           | reference five | alternate five        |
| -------------------------------------------- | -------------- | --------------------- |
| 1 anchor + a wall, 3 legendaries behind      | 100% / 10.3s   | 100% / 4.03 alive     |
| 1 anchor + a shield support in the back rank | 100% / 9.6s    | **100%** / 4.25 alive |
| 1 anchor + a _pressure_ legendary            | 100% / 10.4s   | **80%**               |
| 2 anchors (Grudgekeeper + Colossus)          | 100% / 12.5s   | **90%**               |
| 2 anchors (Colossus + Barrow Sovereign)      | 100% / 11.7s   | **43%**               |
| six bodies of fodder                         | 100% / 6.2s    | 100% / 5.00 alive     |

⚠️ **21e's climax shape is worth nothing here** — a shield support in the back rank is a walkover for
the arrangement it is supposed to threaten. And ⚠️ **21f's rule does not bind here either**: it
forbids sustain because a Dwarf five cannot burst and every point of it is a second of the
ninety-second clock, but an Elf five takes the heaviest authorable board in **eleven seconds** and
has eighty of headroom. So a wall is affordable, and what is scarce is **health**. The shape that
shipped is the wall _and_ what the wall is hiding: a taunting body that refuses a crit, with the
reach behind it aimed at the rank the party has been protecting for a hundred floors.

#### ⚠️ Below level 108 no board in this tower is a fight, and that is the band split rather than the content

The finding worth carrying to 21h–21k. Band 2's crew stands at level 100 — the highest cap strictly
below the roof — while the band **opens at level 61**, a 39-level deficit worth ×2.24 of party power.
Measured at floor 101's level, the lightest authorable board resolves in **2.6 seconds** and the
heaviest — the roof itself — in **2.9**, both with all five alive for both arrangements.

**Composition buys three tenths of a second across the entire authorable range.** The two towers
before this one hid it: a Dwarf five carries the lowest `atk` in the game, so its own band-2 opener
read 5.5 seconds and looked like content. It was the crew, not the boards.

⚠️ **So do not try to make the bottom of a band 2 hard.** Author it for rhythm and variety, and put
the escalation where the level line has caught up. Here that is the last thirty floors, and the band
reads 2.5s at floor 101, 3.9 at 140, 4.8 at 160, 6.9 at 180 and 12.0 at the roof, with the first
member lost at floor 180 for the reference five and 144 for the alternate. Band 1 is untouched and
still reads 0.9s at floor 1, 5.2 at 50 and 10.8 at 100.

⚠️ **Check which floors the stride samples before authoring, which this session got wrong once.**
`towers.balance.ts` reads every fourth floor, and the first draft of the final band put every heavy
board on an odd one — so the spine climbed through twenty floors of the boards that were not the
point. This is `chapters.balance.ts`'s band-opener trap arriving in a tower.

#### The two arrangements are nine levels apart, and the reference five is never in danger

21e recorded the Human pair twelve levels apart; the Elf pair is nine, with a far steeper edge. The
roof board re-levelled: the alternate reads 100% at 118, **83% at 120**, 43% at 122 and 2% at 126,
while the reference is still at 100% at 126 and only breaks at 130.

The consequence is sharper than 21e's version: **every board that costs the reference five a second
member takes the alternate below its own 75% bar.** So the reference crew clears this tower at 100%
end to end and the alternate is the entire constraint. That is honest rather than a miss — a roof is
sized against the arrangement that struggles — but it means the reference number says nothing here.

The roof is `The Wardwright` beside an Edgeturn Warden over an Ironsling Wright, a Runewarden and a
Plumbline Hand: **100% / 4.00 survivors / 12.0s** for the reference five, **83% / 2.10 / 23.4s** for
the alternate, against bars of 90% and 75%.

#### Four Dwarf blocks, three skills, and no new status

Dwarf 18 → **22**, the lean the matchup matrix asks for. All four are aimed at the faction the tower
**admits** rather than at a gap in the Dwarf bench, which the Elf idiom is what makes possible.

- **Plumbline Hand** (`common`) — ⚠️ **the first Dwarf block in eighteen to carry `accuracy`**, and
  deliberately at the cheapest tier. Elves are the game's `dodge` faction and 1.18 cancels every pool
  either arrangement fields. What stops it being a flat tax — an enemy's accuracy is not a stat a
  party can out-buy — is that it is 540 hp in a back rank with `CUTPURSE`, so the answer is to spend
  **reach** on it, which is the resource this tower charges for.
- **Ironsling Wright** (`legendary`) — the burster the wall is protecting. `SLUNG_ANVIL` is ×2 into
  the rank an Elf five keeps its support and its casters in; the faction's shipped reach is ×1.35 and
  ×1.1, which is chip damage a party absorbs while it works on the wall.
- **Edgeturn Warden** (`legendary`) — `critBlock` 0.24 and `critDamageResist` 0.32, both steps beyond
  the shipped maxima (0.16 and 0.3), on the one block whose entire argument is that stat pair. It
  taunts, because reach means a wall that can be walked around is not a wall.
- **The Wardwright** (`ascended`) — floor 200, and the first roof this tower has owned. Floor 100 is
  `Colossus + Barrow Sovereign`, two blocks the campaign also fields.

⚠️ **`accuracy: 1.25` is the roof's headline, and it is the honest form of a thing that cannot be a
status.** `dodge` is not a `ModifiableStat`, so nothing may take an evasion pool away — a roof that
means "your evasion is worth nothing here" has to carry the stat that out-runs it. Same shape as
21c's finding that a chapter's headline lock can be a stat block.

⚠️ **A design guard refused the first version of `THE_LINE_TRUE` and the content moved, not the
guard.** It was authored at ×1.35 on `enemy-row-back` and `skills.spec.ts` caps a wide skill at ×1.2,
because five small hits against the diminishing-DEF curve are worth far less than one big one. Cutting
it to the ceiling moved the roof from 80% to **83%** for the alternate — the multiplier was not
load-bearing at all, which is the usual outcome when a threshold is right.

Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a tower does not
re-open it, 21f did not need to, and neither did this.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 0.940 → **1.045**, against the placeholder
  floor of 0.7 — **the first reading back over parity with the campaign since chapter 8 landed**. The
  Elf Tower goes 31,000 → 62,300 and the seven now pay 310,900 against a campaign of 297,500. Still
  on track for 1.466 at 21k; roughly +0.105 a tower, four to go.
- **`towers.spec.ts` — the faction lean.** ⚠️ **Budgeted for rather than discovered**, which is the
  one thing 21f asked its successors to do differently. Authored from the lean's own bench the second
  hundred came out at 78.7% and the tower at 65.2% against a 65% ceiling — the same overshoot as
  21e's 69.8% and 21f's 86.2% — and the substitution was made during authoring rather than after:
  **58.6%** over the tower and 66.0% in the second hundred, with 46 distinct blocks rather than 37.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored.

#### The prose check, run at the start this time

21f's instruction was to recompute rather than read, at the beginning of the session. Done
mechanically: the crystal figures (22,300 a tower from floors, 62,300 with both tracks, and the 21k
projection of 436,100 / **1.466** to three decimal places), the band-level headers for all eleven
bands, the floor ids and the mini-boss rhythm, and a walk of all two hundred floors checking that no
board pairs a taunt with anything that **refills**. That last one found nothing, and it also found
the shipped precedent worth writing down: taunt-plus-`lifeLeech` appears on 36 tower boards and 21
campaign stages, while taunt-plus-_healer_ appears on **zero** tower boards. The rule that binds is
the healer, not the leech.

Three stale claims were corrected: `towers.ts` said five of seven were short (four now) and quoted
the pre-21g crystal figures, and `towers.spec.ts`'s ratio comment still described the towers as
"fixed at seven ladders of a hundred floors", which stopped being true at 21e.

All 1,972 unit tests and all 74 balance tests pass, with no new test added and no threshold moved.

### 21h. The Undead Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new Elf archetypes and three new skills. Elves go 17 → **21** and the
enemy roster goes 114 → **118**. Four of seven towers now have their second hundred. Nothing in
`ui/` and nothing in `core/` changed, and `TOWER_RULES` was not touched.

#### A fourth tower, a fourth escalation — and the first one the crew has no answer to buy

21f concluded "read the crew's failure mode before choosing how to escalate" and 21g proved it by
producing a third answer. This is the fourth, and it is the first that is **structural rather than
a matter of weight**. Measured against both Undead arrangements at the roof's level before anything
was authored, controlled at one anchor, two legendaries and two commons so only the mechanic varies:

| Mechanic on the board | reference five | alternate five | mean / max  |
| --------------------- | -------------- | -------------- | ----------- |
| **`dodge`**           | 95% · 1.55     | **65%** ❌     | 29.2s / 39s |
| burst behind a wall   | 100% · 1.90    | 95% · 2.25     | 22.9s / 30s |
| **healer**            | 98% · 2.33     | 90% · 3.30     | 30.8s / 50s |
| party-wide slow       | 100% · 2.35    | 100% · 3.42    | 25.4s / 31s |
| `rootbound` link      | 100% · 2.80    | 100% · 3.48    | 24.9s / 30s |
| reach at the back     | 100% · 3.35    | 100% · 3.85    | 19.2s / 23s |

Bars are 90% for the reference five and 75% for the alternate. **`dodge` is the only shape that
fails one**, and the reason is not tuning:

- **No Undead character carries a point of `accuracy`.** The stat lives on four Elves and one Human,
  and there is none in `gear.ts` or `signature.ts` either. A tower faction-locked to Undead is
  therefore the one place in the game where an evasion pool has no answer a player can buy.
- **Every Undead body sustains on `drain` and `lifeLeech`.** A miss costs the hit _and_ the health
  the hit would have returned, so evasion attacks the faction's engine at the source rather than
  taxing its damage.

⚠️ **What licenses it is where the pools go, and that is the whole of the argument.** They sit on
soft bodies — the Sunmote Dancer is 500 hp at `dodge: 0.3` — so reach and focus fire are the answer,
which is the same case 21g made for the Plumbline Hand's `accuracy`. The heaviest body on the tower
carries **less** evasion than the legendaries around it, not more. And unlike `tenacity`, which can
refuse a debuff outright, `dodge` is a chance floored by `MIN_HIT_CHANCE`: it costs turns, it never
closes a door.

#### ⚠️ 21f's sustain rule binds on its second tower, and it forbids this tower's own thesis at the top

An Undead five takes the shipped floor 100 in **34.4 seconds with two of five alive** — the slowest
crew reading in any tower, against an Elf five's 10.8 — and the healer board above runs 30.8s mean
and 50s max. So sustain near the roof is the ninety-second clock rather than a lock, exactly as it is
for a Dwarf five.

That is awkward rather than convenient, because **a heal the party cannot out-drain is the first
hundred's own thesis**: the Thornweald Warden's Wilding Bloom is what this tower has always been
about. It is spent in the middle band (the Green Vigil, floors 141–160, closing on a mini-boss that
is the last board to carry one) and **nothing above floor 160 restores anything**. Checked by walking
all two hundred floors with a script rather than by reading them.

#### ⚠️ Which crew binds flips by mechanic, which is new

21e measured the Human pair twelve levels apart and 21g the Elf pair nine, and in both the alternate
five was the whole constraint. Here neither five is:

- In **band 1** the alternate is far the stronger — floor 100 costs it 1.6 of five where the
  reference crew loses 3.0.
- On a **dodge board at the roof's level** it is far the weaker — 65% against 95% — because Nekros's
  kit is three single-target drains and the reference crew's Ossuary reaches a whole rank.

So "size it against the alternate and check the reference second" does not transfer either. **Check
both arrangements per board**; on this tower the answer does not keep.

#### ⚠️ Composition buys much more at the bottom of a band 2 than 21g found

21g recorded that at floor 101's level the lightest and heaviest authorable boards were 2.6s and 2.9s
apart, and concluded "do not try to make the bottom of a band 2 hard". Against the Undead pair the
same measurement reads **2.7s and 8.4s** — a threefold span rather than three tenths of a second.

That claim was a fact about the **Elf crew's damage**, not about the band split. The band still opens
gently here — 2.5s at floor 101 — but for rhythm rather than because nothing else was possible.

#### Four Elf blocks, three skills, and no new status

Elf 17 → **21**, the lean the matchup matrix asks for. ⚠️ **The second hundred had eleven Elf blocks
it had never met before any of these were written**, so these four are not filling a hole in the
variety — they are the four specific statements the bench could not make.

- **Sunmote Dancer** (`common`) — the teaching body. `dodge: 0.3` is above the shipped common ceiling
  (the Duskfern Skirmisher's 0.26) on the softest frame in the Elf bench, which is the trade that
  keeps it honest. Cheap on purpose: the mechanic wants **density** rather than size, and one heavy
  evasive body would just read as a bad anchor.
- **Sunfade Chanter** (`legendary`) — the other half of the lock. `SUNFADE` is an `enemy-all` hit at
  ×0.85 carrying `WEAKEN`, and against this faction an `atk` debuff is charged **twice**: once on the
  hit and once on the health the siphon would have paid back. No other body in the game is
  specifically true of.
- **Crownbark Bastion** (`legendary`) — ⚠️ **the first legendary wall the Elf bench has ever had.**
  Elf legendaries top out at 820 hp and 24 `def`; this is 1120 and 40. It is the release valve on an
  evasion board: the one body that is not hard to connect with, which is why going there is the trap.
  It taunts and carries **no evasion at all** — those two clauses are one decision, since a taunting
  body the party could not reliably hit is 15c's Dwarf-roof timeout with a lock's name on it.
- **The Sunbough** (`ascended`) — floor 200, and the first roof this tower has owned. Floor 100 is
  `Wyrdroot Ancient + Colossus`, two blocks the campaign also fields. `dodge: 0.24` is the headline
  and is deliberately **under** the Withered Crown's 0.28 and well under the Wealdshadow Stalker's
  0.34. Its three turns are the thesis stated once each and none of them restores anything.

⚠️ **This crew's weight ceiling is the lowest of the four towers.** One Longshadow-weight anchor
behind a wall with three legendaries measures **73% / 23%** — unwinnable for both arrangements — and
two anchors of any pairing is 0%. The Elf Tower's roof carries an anchor, a legendary wall and three
more bodies; this one cannot, so the roof is one anchor over four soft bodies, four of the five
carrying evasion.

The roof is `The Sunbough` beside a Duskfern Skirmisher over a Sunfade Chanter, a Sunmote Dancer and
a Whisperleaf Archer: **93% / 1.88 survivors / 26.7s** for the reference five and **93% / 2.30 /
26.2s** for the alternate, against bars of 90% and 75%.

⚠️ **The tower's longest fight is still the shipped floor 100, at 51.2 seconds** — the second
hundred's longest is 39.6. Against the sweep's bound on a _cleared_ fight (0.75 × the ninety-second
timer, so 67.5s) that band-1 board is this tower's binding case, which is the other half of why the
heal is spent at floor 160 rather than near the roof.

Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a tower does not
re-open it, and neither 21f, 21g nor this needed to.

#### ⚠️ The substitutions are drawn only from factions that also counter Undead

The second hundred came out at **83.2% Elf** on the first pass — the same overshoot as 21e's 69.8%,
21f's 86.2% and 21g's 78.7% — and the correction was made during authoring, four sessions for four.
What is new is that the _choice of substitute_ is now a rule rather than a matter of comparable
weight: Angels, Demons and Monsters all counter Undead in the matrix (the celestials at ×1.1, above
the Elves' own ×1.05), so swapping in one of those keeps the counter-faction bias
`towers.balance.ts` measures. A Human, Dwarf or Undead body of the same weight would quietly turn the
lean off on that board.

Shipped: **65.7% Elf** in the second hundred and **62.3%** over the tower, against a 65% ceiling, with
60 distinct blocks rather than 29.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 1.045 → **1.150**, against the placeholder
  floor of 0.7. The Undead Tower goes 31,000 → 62,300 and the seven now pay 342,200 against a campaign
  of 297,500. The step has now been **+0.105 four times running, to three decimal places**; three
  towers to go and the 21k projection of 436,100 / 1.466 is unchanged.
- **`towers.spec.ts` — the faction lean.** Budgeted for rather than discovered, as 21f asked.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored.

#### The prose check, run at the start again

Recomputed rather than read: the crystal figures, the band-level headers for all eleven bands, the
floor ids and the mini-boss rhythm, the faction shares, and a walk of all two hundred floors checking
that no board pairs a taunt with anything that refills and that nothing above floor 160 restores at
all. Two stale claims were corrected in `towers.ts` — it said four of seven were short (three now)
and quoted the pre-21h crystal figures.

---

### 21i. The Monster Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new archetypes — **one each in the four thinnest factions** — and five new
skills. The enemy roster goes 118 → **122** (angel 11 → 12, demon 12 → 13, human 13 → 14,
monster 18 → 19). Five of seven towers now have their second hundred. Nothing in `ui/` and nothing in
`core/` changed, and `TOWER_RULES` was not touched.

#### The blocks spread rather than lean, because this tower does

Every other tower session authors its four blocks for the single faction that counters the one it
admits. Every faction counters Monsters, so "field what counters the crew" resolves to **all seven**
and the blocks spread the way the boards do. `towers.spec.ts` reads that case off the matchup matrix
rather than naming `monster`, so it is not a special case in content.

It also evens the depth table on the way past, which is the other half of 21a's "fix the leans up
front" discipline: 21j takes Demons to 16 and 21k takes Angels to 15, and **neither touches Humans**
— so without this session Human would have closed milestone 21 as the standout thin faction at 13
against Dwarf's 22, which is the state 21f was written to get the game out of.

#### ⚠️ A fifth tower, a fifth escalation — and the first one that is a _count_ rather than a shape

21f concluded "read the crew's failure mode before choosing how to escalate", 21g proved it and 21h
produced a fourth answer. This is the fifth and it is none of theirs. Measured against both Monster
arrangements at the roof's level before anything was authored, controlled at one anchor, one
legendary and three commons so only the mechanic varies — mean survivors of five:

| Board              | reference | alternate |
| ------------------ | --------- | --------- |
| nothing            | 4.35      | 4.00      |
| **one lock, ×4**   | 4.13      | 3.92      |
| two questions      | 4.05      | 3.90      |
| three questions    | 4.00      | 2.70      |
| **five questions** | 3.58      | **0.85**  |

**Repeating one lock is worth almost nothing and the count is worth everything.** That is a fact
about this crew rather than about board design: a Monster five answers any single question by
out-damaging it, and has no second answer to spend when a board asks two more. So the bands escalate
two → three → four → five, and it lands on the one tower that already had the reason to do it.

The per-mechanic table underneath says the same thing from the other side. Only three shapes threaten
these arrangements at all — turn denial (`slow ×4`: alt 100% → **38%**), reach (`reach ×3`: the only
board that costs the _reference_ five real bodies, 2.35 of 5, but alt **8%**) and `dodge` (alt 95% →
50%). Everything else — a link, a healer, a board-wide stun, shields, thorns, bombs, `bloodrisen`, an
armour wall — leaves both crews above 3.5 survivors.

#### ⚠️ `dodge` is unanswerable here too, and it was left on the shelf for that reason

No Monster character carries a point of `accuracy` — exactly the structural gap 21h built the Undead
Tower's whole second hundred on — so an evasion board reads 100% / 50% against these crews. **Two
towers with one lock is one tower shipped twice**, so it appears only at the density the shipped
hundred already used. A lock being available is not the same as it being this tower's.

#### ⚠️ A link makes these boards _easier_, which no previous tower found

On a five-question board at the roof's level, `rootbound` took the alternate five from 2.42 survivors
to **3.33** and a cast `chainbond` to **3.85**. A link is a defence against **focus fire**, and this
is the one crew in the game that does not focus: four of its eight bodies open with a row attack and
three of its four drains name `enemy-lowest`, so spreading a share of every blow is a board
volunteering to die evenly. **No board above floor 100 carries one**, checked by walking all two
hundred rather than by reading them.

#### ⚠️ Two things were authored, measured and cut, and both are worth keeping

- **A taunt at common weight.** The idea was that a taunt narrows the pool _before_ the row rule is
  consulted, so a soft one would make a five-question board answer itself in the board's order rather
  than the party's. It does the opposite: on an otherwise plain board it took the reference five from
  4.42 survivors to **4.70**. A taunt on a body the party kills in a turn is not a door, it is a
  **cheap target volunteered** — and a multi-target selection ignores a taunt entirely, so this crew's
  four row attacks never see it. Every taunt in the game is a legendary carrying 1020 to 1180 hp, and
  that turns out to be the mechanic's **price** rather than a habit of how it has been authored.
- **An "armoured runt" — a small HP pool behind a huge `def`.** Three of the crew's four drains name
  `enemy-lowest`, so the intent was to magnetise them onto a body that returns nothing. It does
  nothing at all (hp 300 / def 70 measured identical to a plain common), and **two of them made the
  board easier**. Damage is `atk² / (atk + def)`, so at the roof's level the crew's `atk` swamps any
  authorable `def`. Also measured and now recorded: **a shield does not deny a drain** —
  `simulate.ts` takes leech off damage _dealt_, shield included — where thorns is measured against
  what reached HP.

#### ⚠️ Sizing is bounded by the alternate five, and the gap here is the widest of the five towers

Both arrangements fall off between level 120 and 130, about eight to ten levels apart — but at the
roof's own level the reference five clears boards the alternate is at 3% on. One anchor over four
_legendaries_ measures **95% / 3%** and any two anchors is **8% / 0%**, which is the lowest weight
ceiling of the five towers extended so far. So a board above floor 160 gets one anchor and four soft
bodies, and the honest consequence is that **the roof cannot cost the reference crew much**: the best
board clearing both bars leaves it 3.95 of five. The same trade the Human and Elf Towers recorded, at
a wider spread.

Also new: the reference five is much the stronger arrangement here, where 21e and 21g both found the
alternate binding and 21h found it flipping by mechanic. **Three towers, three answers — check both
per board.**

#### Four blocks, five skills, and no new status

- **Zenith Chorister** (angel, `common`) — **the first common in the game to reach a whole rank.**
  All six `enemy-row-back` carriers are legendaries or `ascended`, so reaching a back rank has always
  cost a board one of its two heavy slots — the exact constraint a five-question board cannot pay. It
  is also **Angels' first cheap question of any kind**: every other faction ships a common that asks
  something, and Angel's three were plain attackers because its shields, links and taunts all sit at
  legendary and above. Priced as chip (×0.75 on 480 hp), because it sells a board "your back rank is
  never safe", not a threat on its own.
- **Ruinwing Devourer** (demon, `legendary`) — **the first block to reach a whole back rank and feed
  off what it finds there.** `enemy-row-back` and `lifeLeech` have both existed since 15c and have
  never shared a body. Against a crew that keeps three of five in the back rank with all of its damage
  there, and whose own sustain is leech, it trades in the only currency the crew can mint.
- **Marrowhunt Alpha** (monster, `legendary`) — **the first block to aim `SAVAGED` at one chosen
  body.** The only non-expiring hostile status has always been applied broadly, which makes it
  weather; named at `enemy-highest` it is a decision, because `enemy-highest` on a Monster five is
  always its tank. It is the crew's own targeting handed back to it on the one tower where
  `monster → monster` — the matrix's single self-edge — is literally true. No `lifeLeech` and no
  `BLOODRISEN`, which are chapter 10's two rules.
- **The Horncaller** (human, `ascended`) — floor 200, the first roof this tower has owned. ⚠️
  **Deliberately not a fifth Gate Slam**: all four Human `ascended` blocks carry `stun@enemy-all`, and
  a roof repeating it would state a _lean's_ idiom on a tower with no lean. Its three turns are three
  different factions' questions in one body, which is the band's axis compressed. 1560 hp, under
  `UNMADE` on both stats.

The roof is `The Horncaller` beside a Marrowhunt Alpha over a Ruinwing Devourer, a Moonsong Weaver and
a Cinderquench Bearer — **five factions and five questions on one board**, which is the tower's own
thesis stated once: **100% / 3.95 survivors / 13.8s** for the reference five and **85% / 1.38 /
21.6s** for the alternate, against bars of 90% and 75%.

Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a tower does not
re-open it, and neither 21f, 21g, 21h nor this needed to.

#### The spread, budgeted for rather than discovered

The second hundred came out at **14.0% to 14.6% across all seven factions** on the first pass, because
the composer draws each slot from whichever faction the hundred has leaned on least. That is the
fourth session running where the faction bias was handled during authoring rather than corrected after
— and the first where "even" rather than "leaning" was the target. Over the whole tower it reads
angel 16.4% down to dwarf 12.6%, against a band of 5.0% to 25.0%, with **97 distinct blocks rather
than 41**.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 1.150 → **1.255**, against the placeholder
  floor of 0.7. The Monster Tower goes 31,000 → 62,300 and the seven now pay 373,500 against a
  campaign of 297,500. The step has now been **+0.105 five times running, to three decimal places**;
  two towers to go and the 21k projection of 436,100 / 1.466 is unchanged.
- **`towers.spec.ts` — the faction spread.** Budgeted for rather than discovered.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored.

#### The prose check, run at the start again

Recomputed rather than read: the crystal figures, the band-level headers for all five new bands, the
floor ids and the mini-boss rhythm, the faction shares, and a walk of all two hundred floors checking
that no board carries a link, that no board pairs a taunt with a healer, and that nothing above floor
160 restores anything — with **a shield deliberately exempt**, because a pool banked once depletes
where a heal refills. Two stale claims were corrected in `towers.ts`: it said three of seven were
short (two now) and quoted the pre-21i crystal figures.

---

### 21j. The Angel Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new archetypes and four new skills. The enemy roster goes 122 → **126**,
all four Demon, which takes that faction 13 → **17**. Six of seven towers now have their second
hundred. Nothing in `ui/` and nothing in `core/` changed, and `TOWER_RULES` was not touched.

⚠️ **The roadmap said "21j takes Demons to 16" and that was written before 21i, which spent one of
its four spread blocks on a Demon.** The standing rule is four blocks for the tower's lean, so the
faction lands on 17 and 21k will take Angels to 16 rather than 15. The rule did not move; the count
it was quoted against did.

#### ⚠️ A sixth tower, and the first whose axis is not a mechanic at all

21f concluded "read the crew's failure mode before choosing how to escalate", and the five sessions
before this produced five different answers. This one is none of theirs, and it is the first where
the honest finding was that **the whole category is unavailable**. Measured against both Angel
arrangements at the roof's level before anything was authored, controlled at one anchor plus four
bodies all asking the same question so only the mechanic varies — mean survivors of five:

| ×4 board                                                             | reference | alternate |
| -------------------------------------------------------------------- | --------- | --------- |
| nothing                                                              | 4.00      | 4.00      |
| taunt · thorns · link · bomb · `SAVAGED` · `BLOODRISEN` · hex volume | 3.95–4.00 | 3.92–4.00 |
| `dodge` 0.30 · board stun · board slow · shield · `magicResist` 0.40 | 3.98–4.00 | 3.98–4.00 |
| `tenacity` 0.60                                                      | 4.00      | 4.00      |
| a healer                                                             | 4.00      | 4.00      |

**Twenty-two shapes and the entire spread is 0.15 survivors.** An Angel five carries `GUARD`,
`BARRIER`, `AEGIS`, two or three heals and — in one arrangement — a cleanse, and a single body asking
a single question is answered before it matters. ⚠️ **21i's count of distinct questions does not
transfer either**, and for a reason worth keeping: that axis works because a Monster five answers any
one question by out-damaging it and has no second answer. Here the first question is already free.

#### What does move them: when the damage lands, and where it is aimed

| ×4 board                   | reference | alternate |
| -------------------------- | --------- | --------- |
| plain front-hitter         | 4.00      | 4.00      |
| names `enemy-lowest`       | 3.00      | **2.00**  |
| drains `enemy-lowest`      | 3.33      | 2.88      |
| reaches `enemy-back`       | 3.85      | 3.10      |
| `haste` 140 on a thin body | **2.67**  | **0.15**  |
| names `enemy-highest`      | 4.50      | 4.33      |

⚠️ **Every Angel heal in the game names `ally-lowest`** — Choirlight, Soothing Verse, Vigil — and
every shield the crew has is behind a cooldown or an energy bar: Aegis at 80 ticks, Dawnward at 70,
Sanctuary and Keeper's Charge as ultimates. So a board that arrives _before_ the ward and spends
itself on the body the choir has just committed to is racing the crew's own cooldowns rather than
trying to out-weigh them. **Aiming at `enemy-highest` makes a board easier**, because that is where
the two tanks stand — which is the exact inverse of 21i's Marrowhunt Alpha, and the reason is the
same fact read from the other side.

⚠️ **`haste` on a _durable_ body is worth almost nothing** (4.00 → 3.75 at `haste` 160). It is
`haste` on a thin one that is the strongest dial in the measurement, which is why three of the four
new blocks are soft enough to die in a turn. Softness is the price of the mechanic, not a discount.

⚠️ **Both dials at once is past the edge and the numbers say so**: fast _and_ naming the lowest reads
0.00 / 0.00. The aim therefore arrives in 121–160 and the speed from 161, and the closing band never
carries three bodies above `haste` 126.

#### ⚠️ The two arrangements fail on opposite axes, which no earlier tower found

21e and 21g found the alternate binding, 21h found it flipping by mechanic, 21i found the reference
much the stronger. Here neither is "the" constraint, because the two are not on the same axis:

| board                                 | reference     | alternate       |
| ------------------------------------- | ------------- | --------------- |
| Cinder + Ashfall (two medium anchors) | 100% / 3.70   | 100% / 4.00     |
| Ashfall + Unmade                      | **5% / 0.05** | 65% / 2.50      |
| Ashfall + Hollow Seraph               | **5% / 0.07** | 38% / 1.43      |
| Unmade + Hollow Seraph                | **0% / 0.00** | 15% / 0.55      |
| Unmade + healer + three healers       | 100% / 27.9s  | 95% / **47.3s** |

**Weight breaks the reference five; length breaks the alternate.** The alternate survives boards the
reference is at 5% on because it is four supports and a wall — and it is the slowest party in the
game for the same reason, fielding **four** damage skills across its five characters at `elite`. So
the roof had to thread both bars rather than be sized against one crew, which was the call taken
before authoring.

⚠️ **Denial is a cost on this tower, not an escalation.** A healer, a slow, a shield or a resist wall
leaves both crews at 4.00 survivors and buys nothing but seconds — four healers take the alternate's
mean from 26.0s to 37.8s against a cleared-fight headroom bar of 67.5s. So **no board above floor 160
carries a heal, a regeneration, a drain or `lifeLeech`**, and that rule is what pushed the Headsman
(`lifeLeech` 0.2) out of the last two bands in favour of the Quenchwright and the Cinderquench
Bearer, which state the same aim and return nothing.

#### Four blocks, four skills, and no new status

- **Cinder Culler** (demon, `common`) — ⚠️ **Demons' first body below `ascended` tier to name
  `enemy-lowest`.** The faction has owned the aim only on the Ashfall Sovereign, so contesting the
  choir's heal has always cost a board one of its two heavy slots — and those slots are what this
  tower needs for weight, which makes a _cheap_ carrier the missing piece rather than a stronger one.
  ×0.85 on 440 hp: it contests, and it cannot finish anybody.
- **Riftstep Reaver** (demon, `legendary`) — **the fastest Demon in the game by eighteen points.**
  Demons run 92 to 118 and every faction but Angels and Dwarves ships something above 124, so speed
  has never been this faction's idiom; the reason it is this session's is that every Angel defence is
  on a cooldown. Both its turns name the back rank and neither can touch a front rank at all.
- **Covenant Executor** (demon, `legendary`) — ⚠️ **the first block in the game to drain
  `enemy-lowest`.** Both halves have shipped for a long time separately; against a crew whose every
  heal names `ally-lowest` the pairing means the restoration is not outpaced but **collected**. It
  stops at floor 160 with the rest of the sustain.
- **The Unanswered** (demon, `ascended`) — floor 200, the first roof this tower has owned. **The
  fastest `ascended` block in the game at `haste` 112**, over the Longshadow's 108, and 1540 hp / 92
  `atk` sits under the Unmade on both — the ceiling `enemies.spec.ts` holds. Its three turns are a
  sequence rather than three attacks: `CINDER_STORM` burns all five so that `enemy-lowest` resolves
  to whoever the choir is about to save, `RUINOUS_STOOP` takes that rank's armour off, and
  `NO_ANSWER_COMES` removes the body before the verse lands. ⚠️ **The only roof body in the game with
  no self-sustain of any kind** — no `recovery`, where three of the other four carry 6.

The roof is The Unanswered beside the First Cinder over a Riftstep Reaver, a Quenchwright and a
Cinder Culler — **100% / 2.73 survivors / 22.1s** for the reference five and **98% / 1.90 / 37.0s**
for the alternate, against bars of 90% and 75%. Every floor of 161–200 was swept individually — the
worst reference reading is 100% and the worst alternate **95%**, at floor 198 — and the stride over
the whole new hundred reads 100% / 98%. The longest fight anywhere is 55.0s against a 67.5s bar, and
no floor times out.

Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a tower does not
re-open it, and neither 21f, 21g, 21h, 21i nor this needed to.

#### ⚠️ Three dead stat keys from 21i, found by auditing rather than by a failing test

`ZENITH_CHORISTER` and `RUINWING_DEVOURER` carried `magicalPierce` and `THE_HORNCALLER` carried
`magicalResist`. Neither is a field on `StatBlockData` — the names are `magicPierce` and
`magicResist` — so all three did nothing, and **nothing caught it**: `data/` asserts conformance by
assigning `ENEMIES` to a typed local, and an already-`as const` object is not a fresh literal, so
TypeScript's excess-property check never runs on it. The keys were **deleted** rather than corrected,
which is a zero-behaviour-change fix and keeps every figure 21i recorded valid; correcting them would
have handed a common 10% and a legendary 12% magic pierce they were never measured with. ⚠️ **The
class of bug is worth remembering: a mistyped optional stat is silent in both directions.** The audit
is one script over `StatBlockData`'s keys and the rest of `data/` is clean.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio.** 1.255 → **1.361**, against the placeholder
  floor of 0.7. The Angel Tower goes 31,000 → 62,300 and the seven now pay 404,800 against a campaign
  of 297,500. ⚠️ **The step is exactly 31,300 crystals, so it is exactly +0.1052 and identical every
  time by construction** — six for six, and the reason "+0.105 five times running" read as a
  coincidence in earlier entries is that it never was one. Do not check it by subtracting the rounded
  ratios: 1.255 → 1.361 looks like +0.106. One tower to go, and the 21k projection of 436,100 / 1.466
  is unchanged.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored. All 1,972 unit tests and all 74 balance tests pass.

#### The prose check, run at the start again

Recomputed rather than read: the crystal figures, the archetype depth per faction, the band-level
headers for all five new bands, the floor ids and the mini-boss rhythm, the faction shares (demon
56.6% against a 35–65% band, all seven present, 64 distinct blocks), and a walk of all two hundred
floors checking that nothing above floor 160 restores anything, that no board pairs a taunt with a
healer, that no board pairs two heavy anchors, and that nothing above floor 180 carries three bodies
above `haste` 126. The new hundred has **no repeated board**; the five repeats the walk reports are
all in the shipped first hundred. Two stale claims were corrected in `towers.ts` — it said two of
seven were short (one now) and quoted the pre-21j crystal figures — and the tower file's own header
still said "a hundred floors, enemy levels 1 to 60".

### 21k. The Demon Tower, floors 101–200 — **COMPLETE**

A hundred new floors, four new archetypes and six new skills. The enemy roster goes 126 → **130**,
all four Angel, which takes that faction 12 → **16**. **All seven towers are two hundred floors**,
milestone 21 is closed, and both `PENDING` lists are deleted. Nothing in `ui/` and nothing in
`core/` changed, and `TOWER_RULES` was not touched.

#### ⚠️ The seventh answer, and the first that is about scope rather than about a mechanic

Measured against both Demon arrangements at the roof's level before anything was authored,
controlled at one anchor plus four bodies all asking the same question, forty seeds — mean survivors
of five against a **4.13 / 4.05** control:

| one body at a time                                              | reference | alternate |
| --------------------------------------------------------------- | --------- | --------- |
| stun · slow · weaken · sunder · poison · `SAVAGED` · `HEXBRAND` | 4.17–4.38 | 4.05–4.17 |
| a taunt                                                         | **4.78**  | **4.85**  |

**Seven mechanics one body at a time, and every one of them leaves the board _easier_ than saying
nothing.** The reference five carries 9,416 to 12,822 hp a body at `elite`, so a question put to one
of them is a turn the other four do not have to answer; a taunt is worse still, because it narrows a
pool the crew's damage largely does not consult — the same reading 21i recorded from the other side.

| the same turn, aimed at all five | reference | alternate |
| -------------------------------- | --------- | --------- |
| wide damage alone                | 4.53      | 3.88      |
| wide damage + `SLOW`             | 4.03      | **2.88**  |
| wide damage + `STUN`             | **3.95**  | **1.85**  |

⚠️ **The status has to ride the attack rather than cost a turn** — the same statuses on a skill of
their own are the first table. A board that spends one turn saying something and the next doing
something is a board this crew out-damages either way. So the bands escalate in the **scope** of
what a board does rather than in its size: one voice, then a voice with a rider, then the rider
becoming the turn, then two voices, then three.

⚠️ **This is a fact about these two crews and not a structural gap only Demons have, and the entry
does not claim one.** The identical board reads 2.40 / 0.60 against the Elf crews and 0.88 / 0.00
against the Monster crews. What makes it this tower's is that nothing _else_ moves the Demon pair —
and the control that says so is the Angel five, where the same board reads **4.00 / 3.95**, the crew
21j found nothing moves at all.

⚠️ **Weight is not available as the axis, which is the other half of the finding.** At the roof's
level The Unison beside a Hierophant reads 95% / 3.17 for the reference five and **5%** for the
alternate; beside a Colossus 70% / 0%; beside the Hollow Seraph 5% / 0%. No board in the new hundred
carries two `ascended` blocks.

⚠️ **The licence for a lock the crew cannot answer is placement, exactly as it is for an evasion
pool.** Neither Demon arrangement unlocks a cleanse at `elite` — Sanguine's `CRIMSON_SIGIL` is her
third skill — and no Demon in the game carries a point of `tenacity`, so every one of these lands
with certainty and there is nothing to buy. What keeps it a question is that the voices are soft: the
Knell Chanter is 660 hp and the Stillness Cantor 700, against an Angel legendary register running 590
to 1080. **The answer is to kill the voice.**

#### ⚠️ Two candidate axes were measured and declined, and one of them looked like the obvious one

- **The magic ward.** Demons are the only faction in the game with **zero physical damage skills**
  (19 magical / 0 physical; the next closest is Undead at 14 / 6), and no stat counters `magicResist`
  — a structurally clean lock that reads as invisible to five of the seven crews. It was declined on
  **size**: the highest `magicResist` on any of the 126 shipped blocks was 0.14, and at 0.15 on a
  heavy body the wall is worth 0.00 / 0.54 survivors. It only bites at 0.60, which is four times
  anything authored, and that is a new bar rather than a new board. Recorded because it is real and
  someone will find it again.
- **Weight, as the shipped hundred did.** Declined because it is the sixth tower in a row and, at
  this crew's sensitivity, it has no room: one heavy anchor is 100% / 4.00 against 75% / 1.58, and
  two is 48% / 0%.

#### Four blocks, six skills, and no new status

- **Litany Bearer** (angel, `common`) — **Angels' first common with a board-wide turn**, and the band
  that teaches the second half. 520 hp, `MASSED_LITANY` at ×0.7 and no rider at all: what it changes
  is that a slot on these boards is now spent on _everybody_. A cheap carrier for the same reason
  21j's Cinder Culler is a common on the mirror tower — the closing bands need their heavy slots.
- **Stillness Cantor** (angel, `legendary`) — the first rider, and `SLOW` rather than `STUN` because
  a slow is the half of turn theft a party can still play around. 700 hp / 22 `def`, `HUSH_THE_MANY`
  at 0.75 against the three shipped board-wide slows' 0.7 to 0.85.
- **Knell Chanter** (angel, `legendary`) — **only the third board-wide stun in the game and the first
  that is a body's whole turn** rather than punctuation on an anchor's. 660 hp, `THE_KNELL` at 0.4,
  `haste` 108 so it gets the first word rather than a second one.
- **The Unison** (angel, `ascended`) — floor 200, the first roof this tower has owned. **The only
  block in the game with three board-wide turns** (Stormcaller is the only other with even two), and
  the three are a sequence: `ONE_VOICE` weakens all five, `NOTHING_IS_SPARED` takes their gauge, and
  `THE_LAST_VERSE` takes the turn. 1720 hp / 92 `atk`, under the Unmade on both. ⚠️ **Its stun stays
  at 0.4 — the one number not raised with the body carrying it** — because the Knell Chanter's chance
  is licensed by being killable and this is not; a certain board-wide stun from a body that survives
  the fight is the ninety-second clock with a boss's stat block on.

The roof is The Unison over a Litany Bearer, a Knell Chanter, a Stillness Cantor and a Lumen Acolyte
— **100% / 4.10 survivors / 9.6s** for the reference five and **88% / 1.98 / 17.2s** for the
alternate, against bars of 90% and 75%. Every floor of 181–200 was swept individually: the worst
reference reading is 100% and the worst alternate **78%**, at floor 194. The longest cleared fight
anywhere in the new hundred is 37.5s against a 67.5s bar, and no floor times out.

Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a tower does not
re-open it, and none of 21f through 21k needed to.

#### What the guards did

- **`towers.spec.ts` — the tower:campaign crystal ratio, and this is the one 21k owed.** 1.361 →
  **1.466**, and the floor goes back from the 0.7 placeholder to **1.3**, where it stood before
  milestone 21. The Demon Tower goes 31,000 → 62,300 and the seven now pay **436,100** against a
  campaign of 297,500 — 21b's projection to three decimal places, seven sessions out. ⚠️ **The step
  was exactly 31,300 crystals and therefore exactly +0.1052 every time, seven for seven**; do not
  check it by subtracting the rounded ratios.
  - ⚠️ **1.3 rather than 1.4, and the reason is the next chapter.** This ratio falls again as soon as
    the campaign grows: an eleventh fifty-stage chapter takes it to **1.314** and a twelfth to
    **1.190**. So 1.3 survives chapter 11 and fires at chapter 12, where 1.4 would have fired on the
    very next chapter shipped. **A failure there is the original question rather than a number to
    slide** — the towers are no longer fixed while the campaign grows, so the honest answers are a
    third hundred, an eighth ladder, or accepting that the campaign has outgrown its optional content.
- **Both `PENDING` lists deleted**, and with them the branches they guarded: `towers.spec.ts`'s
  height check collapses back to a plain equality and its boss check loses its else-branch;
  `towers.balance.ts`'s `extended` filter is gone and three assertions now read over every tower,
  with `expect(topFloors.length).toBe(towers.length)` in place of `toBeGreaterThan(0)` so the loop
  still cannot become a loop over nothing.
- **Nothing else moved.** No threshold was touched, `TOWER_RULES` was not touched, and no shipped
  floor was re-authored. All 1,972 unit tests and all 74 balance tests pass.

#### The prose check, run at the start and again at the end

Recomputed rather than read, and **five claims written during this session were wrong before the
script caught them**: that ×1.1 is the heaviest board-wide damage in the file (it is 1.15, on
`DEVOURING_TIDE` and `RUIN_UNBOUND`); that `MOONSONG` is the only other board-wide slow (there are
three); that `THE_KNELL` is the fifth board-wide stun (it is the third); that the Knell Chanter and
Stillness Cantor are the two lightest legendary bodies above floor 140 (they are fourth and sixth —
Moonsong Weaver is 560); and that The Unison is the only block whose every turn is board-wide (ten
blocks qualify — what is unique is having **three**). Also checked: the faction depth table, the band
level headers for all five new bands, the floor ids and mini-boss rhythm, the faction shares (angel
58.8% in the new hundred and **59.9%** overall against a 35–65% band, all seven present, 40 distinct
blocks), no repeated board anywhere in the new hundred and none repeating a shipped one, no board
pairing a taunt with a healer, and the crystal figures. Three stale claims were corrected in
`towers.ts` — it said one of seven was short, quoted the pre-21k crystal figures, and said every
faction has at least twelve archetypes (fourteen now).

## 22. The Descent — **COMPLETE**

The roguelite run, shipped. One run a day: three floors of three fights, health and energy carrying
between them, the fallen staying down, and one card of three taken after every win. Twenty-four
authored boards of which nine are drawn daily, fourteen card families of four rungs, a three-faction
lock redrawn every day, and an enemy level read off the campaign the run has already cleared.

Full reference: **[descent](descent.md)**. What follows is what was decided and what the numbers said.

### What it adds that nothing else in this game does

**Decisions inside a run rather than before one**, which is the roadmap's own argument for it and the
thing every choice below was measured against. Two mechanics carry it and both are _subtractive_:
attrition, so a clean win is worth more than a win; and a choice with an opportunity cost, since the
two cards not taken are gone. That second one is the first irreversible decision in this game that is
not an ascension.

### ⚠️ Two save fields, and everything else derived

`descent` — the run in flight — and `descentRuns`. The day's nine boards, the day's three factions,
the three cards on offer, every enemy level and every payout are pure functions of the run's seed,
the day index and what the run has already taken.

That is the `gearShopOffers` and `dailyBoard` idiom, taken as far as it goes: **rerolling is
impossible rather than merely detectable**. Force-quitting and relaunching hands back the identical
nine boards and the identical three cards, because there was never a draw written down to re-take.

**The daily reset is one comparison.** A run carries the day it belongs to, so a run dated to
yesterday is simply not today's run — no roll pass, no expiry flag, nothing to reconcile, and nothing
owed for abandoning it because a run banks fight by fight. Compare `rollQuestWindows`, which _does_
need a pass, because a window carries a baseline that has to be re-taken against counters that moved.

### ⚠️ The difficulty dial was a share, and the sweep said it could not be

The obvious authoring is a _share_ of the hardest campaign stage the run has cleared — 0.65 of it on
the first fight to 0.90 on the last. It shipped in the first draft and it is wrong in a way that only
appears when the mode is measured at more than one depth.

Enemy power is `perLevel ^ level` with `perLevel` around 1.021, so a share is not a difficulty:
**0.9 of level 14 is one level down and 0.9 of level 588 is fifty-nine**, which is ×3.4 easier.
Measured over twelve days at each depth it read as a wall at chapter 1 (0/12 finished) and a walkover
from chapter 5 on (12/12, **5.00 of five bodies at full health**).

An **offset** is the same number of steps along one exponential wherever it lands. It ships at −8 on
the first fight and +12 on the last, and the mode reads 0.50 to 1.00 finished with 3.2 to 4.7
survivors across every depth from the unlock to the top of the ladder.

⚠️ **The top offset is negative and the mode is still hard**, which is the reading most likely to
look wrong. The anchor is a stage the party cleared with a full-health _best_ five; a Descent crew is
drawn from three factions it did not choose, arrives at fight nine carrying eight fights of damage,
and may be three bodies by then.

### ⚠️ The reference party is bisected, and two closed forms were wrong in opposite directions

There is no authored stage to sweep here, so the sweep needs a party for a _depth_ — and both
arithmetic answers failed:

- **"The highest rung whose cap sits below the anchor"** is what the campaign's margin rule implies,
  and it lags badly through the early chapters, where a party stands _above_ the rung its content
  asks for. It gave a party ×1.6 at anchor 85 and ×4.1 at anchor 160, which is a discontinuity
  nothing about the game has.
- **Power parity on `perLevel.common`** is right in shape and wrong in size: enemy blocks climb
  `perLevel.legendary` and `perLevel.ascended`, and that gap compounds over the _whole_ level rather
  than over a chapter. It read as a mode getting monotonically harder with depth — 20/20 at chapter 3
  and 0/20 at chapter 10.

So the party is **bisected against the real campaign stage**, at the level that clears it 90% of the
time, cached per lock and depth. Milestone 21b recorded the same finding about the campaign's own
margin rule and reached the same conclusion: **bisect; do not solve.**

### ⚠️ It opens at chapter 3, not with the towers, and the daily quest is what forced it

It was authored at chapter 1 — everything optional in this game opens at once, and the daily faction
lock was meant to be what paced it. The sweep says the mode is not **finishable** at chapter 1 or 2:
**0 runs in 20 at both**. A party with no ascension rung fields _one skill each_ — the kit gate opens
at `elite` — against boards of four and five bodies with legendary anchors, and no level offset fixes
that, because the binding constraint is board weight rather than level.

What made that a blocker rather than a shrug is the **daily quest**. "Finish a Descent" reads
`descentRuns`, and `core/quests.ts` forbids a quest a player cannot make move today — the same rule
that keeps `clearedStages` off that list. Shipping it at chapter 1 would have shipped a permanent
empty row for two chapters.

### The card ladder, and the `gradeSoftness` fix taken up front

Fourteen families of four rungs. A family already taken comes back **only higher**, which is an array
index rather than a naming convention: `descent.spec.ts` asserts every rung is strictly larger than
the one below it, because a repeat offered as a _downgrade_ still reads as a reward on screen.

⚠️ **The rank tilt is authored as two ends rather than as a softness constant.** `gradeWeights` tilts
by `1 + stageIndex / gradeSoftness`, which climbs without bound and has been hand-corrected once a
chapter, five times, always to `stages / 2` — [gear](gear.md) records it as a standing tax and names
the fix. This is that fix: a weight interpolated across a run's own eight choices reaches its end
value on the last one however long the run is, so there is nothing to re-derive when content grows.
Sovereign's weight is **zero** on the first choice, so "the cards get better as you go deeper" is a
fact about the draw rather than an average somebody would have to notice.

⚠️ **Three of the seven universal families move stats gear cannot** — crit chance, crit damage and
life leech are bounded rates, so gear's percentage-of-your-own-stat rule pays nothing on them. They
are **points**, and the four quantities are **percentages**, which is the same rescale split
`LineupLadderStepData` already makes: an addition to a scaling quantity breaks the whole-board
identity, and a percentage of a bounded rate pays almost nothing.

⚠️ **`applyDescentBonus` conjures an absent stat where `applyGearBonus` leaves one absent.** The
whole point of a life-steal card is that it reaches a character with no leech; a rule that skipped
them would make the family pay only the handful of Monsters who already siphon.

### ⚠️ The card offer shipped without the lock filter, and the screen is what caught it

A faction family for a faction the day's lock **excludes** is a card that can pay nobody in any legal
crew. Seven faction families against a three-faction lock is four of fourteen — better than a quarter
of every offer — and three dead cards in one offer is a choice the player cannot make. Every test
passed: the offer had three cards, they were the right ranks, the repeat rule held. It was visible in
one glance at the screen, on a run holding a Wyrdsong on a Dwarf/Undead/Demon day.

⚠️ **The fix moved the balance harder than the difficulty dial did.** Every dead card the sweep's
greedy policy took was a wasted choice, so filtering them raised the finish rate from **0.79 to
0.96** with nothing else changed, and the level line had to be re-aimed from −16/+4 to **−8/+12**.
**The offer and the level line are one dial with two halves**; anything that changes what a card is
worth re-aims the other.

The rule now lives in `core/` rather than at the call site, so `descent.spec.ts` holds it instead of
each caller remembering — and the two cases are both asserted, because "the lock filters" and "an
empty lock filters nothing" fail in opposite directions.

### ⚠️ A tuning sweep that cannot move is worse than no sweep

Re-aiming the offsets meant running `descent.balance.ts` with an overridden `level`, and the override
reached `descentLevel` but not `resolveDescentFight` — which computes the level again from the rules
it is handed. **Every row of a five-setting sweep printed identically.** The reading that produces is
"the difficulty dial does nothing", which is a conclusion somebody would act on.

`descent.balance.ts` now carries a permanent assertion that a much harder setting measures harder,
which is the cheapest possible guard on the plumbing every future retune goes through.

### ⚠️ A faction card is the pattern `AGENTS.md` rejects, and the rejection does not reach it

"+10% if two Fire units" is forbidden because it resolves to one optimal party, decided before the
fight. This is **drawn**, three at a time out of fourteen, after the crew is locked for the run and
after a daily faction lock nobody chose. There is nothing to optimise into — a crew built in the hope
of Wyrdsong loses eight runs in nine — and what it _asks_ is the only question a card can ask a party
that is already assembled: whether a narrow bonus on three of your five beats a broad one on all of
them. **That argument does not generalise**; the next proposal of this shape makes its own.

### ⚠️ Life steal is the one family with a termination argument

Leech is taken off damage **dealt**, and closing pressure amplifies damage without amplifying
healing — which is what breaks a closed sustain loop everywhere else. A party siphoning enough of its
own output back does not win; it stalls, the ninety-second clock runs out, and a timeout is a
**defeat**, costing one of a run's two lives. `maxLifeLeech` is 0.35 against a full stack of 0.34, so
it binds on nothing shipped and exists for the fifth rung nobody has authored — the sense in which
`MAX_RESIST` is a guard rather than a knob.

### ⚠️ Every board is mixed-faction, which is the inverse of a tower

The crew's factions are **drawn** and the board's are not. A mono-faction board would make roughly a
seventh of days a walkover and a seventh a wall, decided by a matchup nobody chose — the exact
opposite of what the matrix is for. Every board fields at least three factions and no faction holds
more than a quarter of the pool.

Two rules every board obeys: **no taunt paired with a healer** (the failure 15c found on the Dwarf
Tower roof, and it costs a life here), and **no two `ascended` blocks**. The three floor-3 guardians
are the Gate Warden, the Barrow Sovereign and the Wyrdroot Ancient — ⚠️ none of them a chapter final,
a chapter lieutenant, a tower roof or the Unmade.

### The retry is per run, and a defeat writes one field

Two attempts across nine fights rather than one per fight: a retry per fight makes the mode a matter
of persistence, and one across nine makes _when to spend it_ part of the run.

⚠️ **The run is only ever written on a victory.** A defeat costs one life and changes nothing else,
which is what makes the retry genuinely the same fight from the same state rather than a
reconstruction of it — and why there is no "as it entered this fight" snapshot to roll back to.

### What `simulateBattle` gained, and what it did not

One optional fifth parameter: a `PartyOpening` of health fractions and energy, keyed by character id
and applied to the **ally side alone**. Omitting it is bit-identical to the behaviour before it
existed, which is what keeps the whole-board rescale identity and every recorded balance figure
valid.

⚠️ **Health is a fraction, never a quantity.** A maximum can move between two fights of one run — a
level, a rung, a resonance floor, a gear swap, a signature level — and only a share survives that
without reading as a wound nobody administered. The fallen leave the run's `party` **and** the health
table: either alone would be a body on the board at zero health that every targeting rule has to step
around, and one that goes on paying the lineup bonus for somebody who is not fighting.

**The cards never reach the simulation.** They are folded into the authored stat block at party-build
time exactly as gear and a signature item are, so nothing in `core/battle/` learns the mode exists.

### ⚠️ `descentRuns` is the first counter added partly because a track pays against it

`core/achievements.ts` warns about exactly this. What keeps it honest is that a run stores nothing
else that survives its own day, so without it the mode has no long-term record at all and its own
screen is the first thing that prints it — the same standing `pullCount` has. Two tracks read it at
two intervals rather than a second stored integer for "fights won"; one counter says the same two
things a second field would have.

It is also the **third legal quest counter**. The test is not "is it monotonic" — `clearedStages` is
monotonic — but "can a player always make it move today", and the Descent is offered afresh every day
forever.

### The lock became a list, and one resolver answers for both kinds

`ActivityData.faction` is a tower's whole lock, authored once. The Descent's is three factions drawn
daily, so the two cannot share a field: `FactionLock` is `readonly string[] | null`, and
`FormationService.lockFor` resolves the static one for a tower and the daily one here. Both the crew
editor and the battle path go through it — two implementations of one rule is how a screen ends up
promising a legal crew that the fight refuses.

⚠️ **`null` and `[]` are different answers**: `null` is "anybody may stand here" and `[]` is "nobody
may", which is what a build shipping a lock over zero factions would mean. Keeping them distinct is
what stops a missing lock from silently reading as an empty crew.

### Auto-battle does not run in the Descent

⚠️ The mode's premise rather than a limitation: a Descent fight cannot be repeated without a card
being chosen first, so the loop would win one fight and stop, reporting "there is nothing left to
fight" about a run that is eight fights from over.

### The accessibility suite caught two things, both in the same pass

- ⚠️ **A cleared fight row shipped at `opacity: 0.55`**, which drags `$muted` on `$surface` from
  6.4:1 past the 4.5:1 floor — taking the level and the payout, the two things a cleared row still
  says, below the bar along with the name. Replaced by a muted **name**, exactly as a locked tower row
  does it.
- ⚠️ **An `@empty` block inside a `<ul>` is a serious AXE violation**, because `@empty` renders its
  content as a sibling of the items and a `<ul>` may directly contain only `<li>`. It sat on the one
  state a new player sees first. Moved outside the list.

Both are milestone 6's rule in action: when a fix and the suite disagree, look for the option that
satisfies both.

### What the guards did

- **`towers.spec.ts` — "locks every tower and leaves the campaign unlocked".** Narrowed to the two
  activity kinds that carry an _authored_ lock. The Descent correctly has no `faction` and is
  correctly not unlocked, and reading the old assertion as "faction absent means anybody may enter"
  is what would have made that silently wrong.
- **`achievements.spec.ts` — "pays emblems on the chapter track and on no other".** Rewritten as the
  rule it was always standing for: a track paying emblems must sit on an event that **already** pays
  them. Finishing a chapter steps the emblem idle rate; finishing a Descent pays
  `completionEmblems`. It now also asserts the two signature tracks pay none, which is the clause
  that was doing the real work.
- **`quests.spec.ts` — the counter allow-list.** `descentRuns` added, with the pair that says what
  the rule actually is: it is on the list and `signatureLevels` is not.
- **Nothing else moved.** No threshold was retuned, no shipped stage, floor or character was
  re-authored, and `SAVE_VERSION` stayed at 0 — the fourth and last re-base, on the same licence as
  the other three. All 2,101 unit tests, 86 balance tests and 291 end-to-end tests pass.

### What was left undone, on purpose

- **The mode ships no new status and no new effect kind.** Milestone 21's three-status budget was
  spent and closed by 21d, and this needed nothing from it: everything a card does is a percentage or
  a point on a stat the block already carries.
- **No new enemy archetype.** Twenty-four boards out of the shipped 130, which is what the pool being
  mixed-faction makes easy — and it is the first content milestone since 15c to add none.
- **Nothing on the tab bar.** The Descent is a card on Home, which is the battle hub;
  [navigation](navigation.md) is unchanged.

## 23. Puzzle maps

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
in this plan, and the first ninety seconds decide more than milestones 13 through 22 combined.
