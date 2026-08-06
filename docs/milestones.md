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

| #   | Milestone                               | Status                                       |
| --- | --------------------------------------- | -------------------------------------------- |
| 1   | Tick loop, one resource, save/load      | ✅ **Complete**                              |
| 2   | Battle up a stage ladder                | ✅ **Complete** — introduced `data/`         |
| 3   | Gacha, roster, ascension, levelling     | ✅ **Complete** — introduced routing         |
| 4   | Team composition affecting combat math  | ✅ **Complete** — introduced formations      |
| 5   | Offline catch-up on resume              | ✅ **Complete** — segmented solver ruled out |
| 6   | Run on a physical iPhone                | ✅ **Complete** — removed Angular Material   |
| 7   | Auto-battle, then doubling the ladder   | ✅ **Complete** — prestige cancelled         |
| 8a  | The combat rework: the stat block       | ✅ **Complete** — one `atk`, one `def`       |
| 8b  | The combat rework: energy and ultimates | ✅ **Complete** — `mp` and `hp` costs gone   |
| 8c  | The combat rework: skill counts         | ✅ **Complete** — 30 skills, gated by rung   |
| 8d  | The combat rework: lineup bonuses       | ✅ **Complete** — party composition pays     |
| 8e  | Seven characters per faction            | ✅ **Complete** — 49 characters, 3/3/1       |
| 9   | Resonance — levels the roster shares    | ✅ **Complete** — one shared level, derived  |
| 10  | Power that compounds                    | ✅ **Complete** — ×10⁹ levels, enemy levels  |
| 11  | Chapters                                | ✅ **Complete** — 100 stages, income derived |
| 12  | Gear                                    | ✅ **Complete** — percentage-based, 5 slots  |
| 13  | Settings, and the save-safety gap       | ✅ **Complete** — run reset, first CDK modal |
| 14  | Dailies, bounties and notifications     | ⬜                                           |
| 15  | Faction towers                          | ⬜                                           |
| 16  | Deep per-hero investment                | ⬜                                           |
| 17  | The roguelite run                       | ⬜                                           |
| 18  | Puzzle maps                             | ⬜                                           |

---

These entries record **what each milestone decided and why**. The systems themselves are explained
in the reference docs — [combat](combat.md), [attributes](attributes.md), [economy](economy.md),
[ascension](ascension.md), [level resonance](level-resonance.md), [saves](saves.md),
[glossary](glossary.md) — and where the two overlap, those files are the current statement and
these are the history behind it.

## 1. Tick loop, one resource, save/load — **COMPLETE**

A number counts up on screen and survives a refresh. This proves the whole architecture end to end:
`core/` purity, the sim/render split, and the save path.

Concretely: a gold counter that accrues at 10Hz, samples into the UI at ~6Hz, persists through
`@capacitor/preferences`, and settles offline earnings in closed form on resume. Underneath it,
`Numeric` wraps `break_infinity` so the backing numeric type is a one-file swap, the seeded
mulberry32 PRNG resumes in O(1) and derives sub-streams ready for combat, and the save layer carries
a migration chain, fixtures, and repair that clamps damage rather than throwing.

Shipped: `core/numeric.ts`, `core/rng.ts`, `core/state.ts`, `core/tick.ts`, `core/save/`,
`core/offline.ts`, `ui/game-loop.service.ts`, `ui/save.service.ts`, `ui/format-numeric.ts`.

## 2. Player-initiated battles up a stage ladder — **COMPLETE**

`simulateBattle(team, stage, seed) => BattleResult` resolves instantly and headlessly into an event
log; the UI animates the log afterwards. **Combat is not driven by the render tick** — that decision
is what makes 2x/4x/skip and offline resolution free, and the speed control that shipped with it is
one multiplication in the animator rather than a second combat path.

Turn order is an ATB gauge rather than fixed rounds, so haste buys turns instead of just going
first, and combat draws from a derived sub-stream so replaying a battle never shifts the gacha
sequence — which stopped being hypothetical in milestone 3. Every rework since has kept both. See
[combat](combat.md) for the loop and the determinism rules.

Three decisions worth not re-litigating:

- **Home and battle are two screens, and the battle replaces the home screen rather than sitting
  under it.** `App` is the shell: it starts the run, owns the single `main` landmark, and swaps on
  `BattleService.isOpen`. A fight has no exit until it ends — a battle is seconds long and can be
  sped up, and leaving early would discard rewards the player is moments from collecting.
- **Clearing a stage raises idle income permanently, and that is the real reward.** A run starts at
  `goldPerSec: 0` and earns nothing at all until the first stage falls, which is what makes the
  first battle the only thing worth doing. `applyBattleResult` only ever raises a rate, and the
  one-off `goldReward` is the smaller half.
- **The result is applied when the animation finishes, not when the battle resolves.** Applying it
  up front spoils every fight: the gold counter and the income rate both jump the instant the player
  taps, announcing the outcome before the first blow lands. The cost is that a battle abandoned by a
  reload mid-animation pays nothing — acceptable precisely because the player starts each fight and
  watches it. This survived contact with auto-battle unchanged: that loop is foreground-only, so it
  is attended too and the trade never inverts.

**The player started every battle here, one at a time.** Nothing fought on its own until milestone
7's unlockable repeat; ambient sparring is still deferred. Targeting was deliberately naive — the
living opponent with the least HP — until enemy design gave it something to reason about, which
milestone 4 did.

Shipped: `core/battle/` (`clock`, `types`, `content`, `damage`, `simulate`, `progress`), the first
`data/` content, `ui/battle.service.ts` and the two screens. Save v2 adds `stage` and `battleCount`
via the first real migration.

## 3. Gacha, roster, ascension and levelling — **COMPLETE**

`pull(state, banner, count) => { state, results }`, a keyed wallet and rate table rather than a
field per currency, and the two ascension ladders. [economy](economy.md) has the rates and the level
curve, [ascension](ascension.md) the rungs, [glossary](glossary.md) the tier/rarity collision.

**Pity is global rather than per-banner, and is visible in the UI at all times.** Rates are
deliberately far more generous than commercial tuning, and soft pity passes certainty before the
hard guarantee is reached, so the guarantee is a floor rather than the mechanism. A paid gacha tunes
to sell a bridge across a gap it manufactures. There is no bridge to sell here, so every reason to
be stingy is a reason that does not apply.

Three decisions the rest of the project now rests on:

- **Tier is a slope, not a head start.** Base stat budgets are close across tiers — a higher tier
  buys a sharper version of its faction's identity, not more of everything. The gap opens through
  per-level growth, which is what makes a common-tier character a genuine early answer that
  genuinely falls off, as a consequence of the math rather than as an assertion. Any character of
  any tier can reach `ascended-5`. _Modified once, knowingly, by 8c: tier also caps how many skills
  a character may field, and the rung mapping hands the higher tiers a head start on reaching it._
- **Only spare copies are ever consumed, never a character you have levelled.** A deliberate
  departure from the genre: nobody can destroy a week's investment by tapping the wrong row, so the
  confirmation dance around irreversible loss does not exist, and a faction-mate stays both a
  playable character and an ascension resource. Milestone 7 rules out prestige on this, and
  milestone 9's resonance floor is monotonic because of it.
- **Duplicates are the primary progression path, so a dupe is never wasted**, and spark — what
  copies of a maxed character convert to — is late-game overflow rather than a safety net. **Pity is
  the escape valve for bad luck, not the shop.**

The design target for the economy is that no currency is decorative: through level 140 all three
levelling currencies land within about a third of each other in time-to-afford. Level cap 1000 is
aspirational, and milestone 11 makes it a chapter-100 target.

### The migration that could not finish its own job

**A migration cannot always finish the job on its own, and the v2 → v3 one proved it twice.** It
carried gold across and started xp, essence and summons at zero, leaving a returning player on
gold-only income with no way back except re-fighting stages they had already beaten. And it seeded
`clearedStages` from `stage - 1`, which looked careful — "do not pay a bonus they already earned" —
but was exactly backwards: the first-clear bonus **did not exist in v2**, so nothing had been
earned, and marking those stages settled closed the door on all 3,000 crystals silently and
permanently.

Neither was fixable inside the migration, because both need to know what the stages grant and
`core/` cannot see `data/`. `reconcileClearedStages` is the repair, it runs on every load rather
than behind a version gate, and the three rules it produced are the durable part — they are stated
in [saves](saves.md), which points back here for the incident.

Shipped: `core/currency.ts`, `core/roster/`, `core/gacha/`, `data/` (`ascension`, `banners`,
`levels`, and the first roster of 21 characters across 7 factions), and the summon, roster,
character and shop screens. Save v3 folds gold into the wallet and adds the roster, party and pity.

**Routing arrived here**, and the trigger is the one this file already named: a screen that survives
a reload. Home, summon, roster and shop all describe saved state, so `/roster/rin` is somewhere a
player can come back to. The battle screen is still a signal-swapped **mode** — its contents live
only in memory — and the tab bar hides during a fight, because a battle has no exit until it ends
and navigation that refused to work would be worse than none.

## 4. Team composition affecting combat math — **COMPLETE**

Composition matters through **enemy design**, not flat synergy bonuses. Characters are keys to
locks, not rungs on a ladder.

Milestone 3 built the lock-picking set: characters across seven factions, each expressing one axis
more sharply as tier rises. What it deliberately did **not** build was anything for those niches to
answer. Targeting was "the living opponent with the least HP", every combatant did one thing on its
turn, and the only reason to field one character over another was a stat line.

This milestone shipped the formation, statuses, skills with conditions and cooldowns, the faction
matchup matrix, and six enemy archetypes to answer. [combat](combat.md) is the current statement of
all of it. What belongs here is the reasoning.

### The formation, and why placement is free

Five slots in two ranks, **two in front and three behind**. The asymmetry is deliberate — the front
row is a _gate_ ordinary attacks have to work through, so making it the smaller rank keeps it a real
cost rather than a free wall. Reaching past it is a property of individual skills rather than of a
stat, which makes back-line access a decision about who to field rather than a number to accumulate.

**Any character can stand in either rank.** Role-locking was considered and rejected for one reason:
it would let an unlucky roster reach a state where no legal party exists, and in a game with no way
to buy characters that is a run with nowhere to go. A bad front row is a far better failure than no
front row. `CharacterRole` exists and **nothing in the simulation reads it** — it is there so the
roster screen can say "healer" instead of making a player infer it from a stat block.

The rank bonuses shipped here were written against two attack stats and were replaced when 8a
collapsed them. The asymmetry they existed to protect is unchanged.

### The locks, and the bad-luck failure mode they exposed

Six enemy archetypes, each naming the answer it wants: a healer behind two bodies (reach, or burst),
a party-wide debuff (a cleanse), a magical attacker (`magicResist`), a refreshed absorb (burst, not
chip), both defences up (penetration), and a dodge wall (accuracy, or volume). **A shielder is a
different problem from a healer rather than a bigger one**: a barrier applied _before_ the damage
arrives cannot be raced by chip damage at all.

**Two characters were added because of a bad-luck failure mode, not a gap in the fiction.** A healer
and a cleanse landed on the **mortal** ladder. Angels are the natural support and they ascend on
copies of themselves alone, so a run whose banners are unkind would otherwise have no sustain at any
price — which is not a fight lost, it is a _category of answer_ the player can never buy.
[`characters.spec.ts`](../src/data/characters.spec.ts) still asserts both exist on the mortal ladder
at common tier; 8e generalised it, giving every faction sustain of its own.

### Factions are a matchup matrix, not a synergy bonus

The rule in "Content and balance" is about bonuses for **your own team's composition** — "+10% if
two Fire units" — because those ask nothing of the encounter and only ever produce a new optimal
team. This is the opposite shape: every multiplier is a statement about the _matchup_, so it rewards
bringing the right answer to the fight in front of you. A Dwarf wall is not better in general; it is
better against Elves and worse against Humans.

The mortal cycle is closed, so no mortal faction is anybody's strict answer; Monsters are a wildcard
with a bill attached; and the one asymmetry — celestials taking nothing back from mortals — is paid
for by the luck-only ascension ladder. **The numbers are small on purpose.** Five percent does not
decide a fight; it decides a fight that was already close, and the counterweight to the celestial
advantage is enemy design rather than arithmetic.

> 8d added a second faction mechanic — a bonus for the party's _own_ composition, which is the
> pattern this section rejects. It survives on an argument specific to mono-faction bonuses, and 8e
> measured the two against each other: they answer different questions and are not rival levers. See
> [8d](#8d-faction-lineup-bonuses--complete) and [8e](#8e-seven-characters-per-faction--complete).

### The proof it worked, and where that proof went

The milestone shipped a spec that simulated two parties differing in exactly one slot against the
stage-7 healer lock: with a character whose skill reached the enemy _back_ row the party won almost
every time, and with a harder-hitting one who could only reach the front it won almost never. The
second was better on raw damage, and under milestone 2's targeting the swap would have changed
nothing but the fight's duration. That gap was the milestone.

**That probe did not survive milestone 7's split into a balance project, and nothing replaced it.**
What is asserted today is the boundary itself — three level-1 starters clear to the healer lock and
stop — which is a statement about investment rather than about composition. Milestone 7 records the
missing single-slot probe as an open gap.

### Where the ladder was tuned to

**The three starting characters clear the opening ladder and stop dead at stage 7, the healer
lock.** That boundary is the single most important number in `stages.ts`, and it is a wall about
_who_ is fighting rather than about how many levels they have — which is exactly the right place for
the early game to end. Two of the five formation slots start empty, and the first-clear crystals
banked below the wall are the intended answer.

A built party of five **common-tier** characters clears the whole ladder. Common tier deliberately:
the top of the ladder may demand investment, but it may not demand an ascended-tier pull, because
there is no way to buy one. **That promise has survived every rework since, unretuned**, and it is
the thing each of them re-swept to confirm.

### Three more decisions worth not re-litigating

- **The rank sizes in the v3 → v4 migration are written out rather than imported from
  `core/state`.** A migration is dated: it describes the shape that existed the day it shipped, and
  a constant a later release is free to retune would silently change what that step means for every
  save that has not run it yet.
- **A stunned combatant still consumes its turn**, which is what bounds a stun lock: a stun costs
  its victim turns rather than freezing it out of the schedule, so a fight cannot deadlock behind
  one.
- **Statuses snapshot at application and refresh rather than stack**, because a poison that stopped
  hurting when its caster died would make "kill the debuffer" the answer to every debuff, and
  stacking multipliers would delete a defensive stat by arithmetic nobody authored.

Shipped: `core/battle/status.ts`, `core/battle/skills.ts`, rows and formations in `types.ts`, the
faction matrix in `damage.ts`, `data/combat.ts`, `data/statuses.ts`, `data/skills.ts`, re-authored
content, and save v4, where `formation` replaces `activeParty`.

## 5. Offline catch-up — **COMPLETE**

Shipped and tested in [`core/offline.ts`](../src/core/offline.ts): the continuous fixed-rate closed
form settling all four rate-bearing currencies in one pass, the backwards-clock guard, and a
non-finite guard for a damaged `lastTickAt`. `resume()` is called on load from
`ui/game-loop.service.ts` and its report is rendered on the home screen, so the path is wired end to
end rather than merely available.

The ten-hour cap this originally shipped with **has since been deleted** — see milestone 11. There
is no offline cap at all. Bounding a corrupt timestamp was the only thing the ceiling did on
purpose, and `MIN_PLAUSIBLE_TICK_MS` now does that deliberately.

The project's highest-value invariant is pinned in
[`offline.spec.ts`](../src/core/offline.spec.ts): the closed form agrees with stepwise accrual,
asserted on relative error and checked at magnitudes past float64's exact-integer range.

**This milestone closed by ruling work out, not by building it.** Two items sat on it for a long
time and both were cancelled by design decisions rather than implemented — worth recording, because
a future reader will otherwise see a solver named all over the codebase and assume somebody forgot
it.

**There is no segmented solver.** It prices an away window in which the rate _changes_, and rates
change on exactly one event: a stage clearing. Auto-battle is foreground-only and commits each
battle as it ends, so nothing clears a stage while the player is away. Every rate is therefore
constant across every offline window, permanently — the fixed-rate closed form is not an
approximation that will need replacing, it is exactly right and stays exactly right. **Do not build
it speculatively.** The trigger would be genuinely unattended progression, which is not the design;
if that decision is ever reversed, `AGENTS.md` still records the technique.

`timeToClear(state, stage)` is cancelled with it — the segmented solver was its only consumer.

**`accrueDiscrete()` has no caller and no planned one**, because nothing drops while the player is
away. Idle income is the four continuous rates and nothing else, so there was never a `dropCarry`
field and there is no longer a reason to add one. It is kept rather than deleted because it is eight
lines and encodes a rule worth not re-deriving under pressure — offline loot is paid at expected
value with deterministic rounding, never rolled, because rolling invites force-quit rerolling. **Do
not wire it up to manufacture a use.**

The one genuine gap this milestone identified — completed battles reaching `GameState` but not
storage until the next autosave — was auto-battle's to fix, and milestone 7 fixed it.

## 6. Run it on a physical iPhone — **COMPLETE**

Done while the app was still small, so the signing and provisioning pain landed early rather than
next to a deadline. `npm run ios` builds, syncs, and opens Xcode.

### What the first run on real hardware found

The app worked and looked broken: a narrow column of content down the middle of the screen, white
margins on all four sides, and a full-width dark tab bar that did not line up with anything above
it. The obvious reading is that the page is zoomed out — on iOS a `position: fixed` element lays out
against the _visual_ viewport, so it keeps filling the screen while a scaled-down document does not,
and that is exactly the signature.

It was not zoom. Reproduced headlessly in Chromium at 393×852 with CDP's safe-area inset override
and the scale pinned at 1.0, the screenshot matched the phone pixel for pixel. The cause was three
lines of the Angular CLI's scaffolded `src/styles.scss`, never edited since `ng new`:

```scss
body {
  color-scheme: light; // → --mat-sys-surface resolved to rgb(255, 248, 248)
  background-color: var(--mat-sys-surface);
  padding: env(safe-area-inset-top); // → 59px on ALL FOUR sides
}
```

`padding` with a single value applies it to every side, so the **top** inset became a 59px gutter
down both edges as well — a 275px content column in a 393px viewport. The fixed tab bar stayed 393px
because fixed elements do not care what the document is doing.

Worth keeping: **the tell that says "zoom" also says "the document is narrower than the viewport",
and the second is far more likely.** Measure before theorising — `getComputedStyle` on `body` would
have ended this in a minute.

### What changed

- **Angular Material is uninstalled.** Nothing imported it; the only thing it did was own
  `styles.scss`, and what it did there was the bug. `styles.css` went from 8.82 kB to 699 bytes.
  `@angular/cdk` went with it and was then put back deliberately — see "Deliberately deferred",
  which records why the two got different answers.
- **The document no longer scrolls.** `html` and `body` are `height: 100%; overflow: hidden`, the
  shell is a flex column, and `main` is the scroll container. This is the structural fix, not a
  cosmetic one: it removes page-level rubber-banding, and it lets the tab bar become a flex item
  instead of `position: fixed`. A bar that is a sibling in the layout cannot disagree with the
  content above it.
- **Safe-area insets moved to where they cannot scroll away**, and the split is the part to
  preserve: horizontal and top insets on the shell so content cannot slide under the notch, bottom
  inset on the tab bar so its own surface fills the home-indicator strip. Moving the bottom inset up
  alongside the other three looks tidier and puts the tab bar's touch targets over the home
  indicator.
- **Zoom is off on both platforms, and the viewport meta was not the way to do it.** The reflex fix
  is `maximum-scale=1, user-scalable=no`; it was written, and the accessibility suite immediately
  failed all six screens on AXE's `meta-viewport` rule (WCAG 1.4.4). It bought nothing:
  `zoomEnabled: false` disables the pinch recogniser natively on both platforms, and `touch-action:
manipulation` handles double-tap. **The accessibility bar caught this within a minute of it being
  written, which is the argument for having it.**
- **`backgroundColor` is set in `capacitor.config.ts`**, globally and per platform. Unset, the
  native window falls back to `UIColor.systemBackground` — white — which is what shows for a frame
  before first paint.
- **The Google Fonts `<link>`s are gone.** Roboto and Material Icons were being fetched over the
  network by an app whose first design constraint is that it never touches the network, and neither
  was used.
- WebView chrome that has no place in a game surface is off, with text selection turned back **on**
  for the battle log.

### The native change that turned out not to be needed

The standard advice for this class of problem ends with "subclass `CAPBridgeViewController` and
disable the pinch recogniser and `scrollView.bounces` yourself". **Capacitor 8 already does both.**
`capacitor.config.ts` states `zoomEnabled: false` and `contentInset: 'never'` anyway, because a
silent default is not a decision anyone can find later, but no Swift was written and `ios/` was not
touched. **Read the pod source before accepting that a WebView problem needs a native fix** — and
note that the config option is also what let the viewport meta stay accessible, so the two are not
independent choices.

## 7. Auto-battle, then doubling the ladder — **COMPLETE**

Shipped: the unlockable repeat loop, twelve new stages with twelve new enemies and six new locks,
and the separate balance project the sweeps had outgrown. **The prestige layer this milestone
originally planned is cancelled**, not deferred; the reasoning is at the end.

Four decisions were taken while building it: twenty-four stages rather than nineteen; a gold slope
that **decelerates** across the second half rather than continuing at ×1.4; auto-battle unlocking on
twelve clears, exactly where the hand-climbed half ends; and the loop switching itself **off** when
the app leaves the foreground rather than pausing.

Shipped: twelve enemy stat blocks for the Ashfall Reach and six new enemy skills; stages 13–24 and
`AUTO_BATTLE_UNLOCK_CLEARS`; `isAuto`, `isAutoUnlocked`, `autoStoppedAt`, `setAuto()`, the
`visibilitychange` listener and per-battle persistence in `ui/battle.service.ts`; the Auto toggle
and the home-screen notice; and `vitest.balance.config.ts` with `data/stages.balance.ts`. **No save
migration** — `isAuto` is session state on purpose, since a flag that survived a reload would be a
loop the player armed yesterday resuming without them.

### 1. Auto-battle — the unlockable repeat

It reads `clearedStages` rather than `stage`, because `stage` stops climbing at the top of the
ladder and a stage-number check would answer "not yet" forever for a run that had beaten everything.

Three things about it are load-bearing rather than cosmetic:

- ⚠️ **Foreground-only, enforced by switching off on `visibilitychange`.** This is the half that is
  easy to get wrong. A hidden tab still steps the animator at roughly 1Hz, and `MAX_STEP_MS` clamps
  each step to a second — so playback keeps advancing in real time while nobody is watching, and an
  unattended loop would climb the ladder in the background. A stage clearing while the player is
  away is precisely what would stop every idle rate being constant across an offline window, which
  is the entire reason milestone 5 needs no segmented solver. **A pause that keeps fighting is not
  an improvement, it re-opens milestone 5.**
- **Off rather than paused.** The toggle the player left on is visibly off when they come back, so a
  running loop is always a loop they can see they started.
- **Persist at the end of every battle**, not just auto ones. This was the one requirement
  auto-battle placed on the rest of the app, and it is what makes "losing the app costs the fight in
  flight and nothing else" true rather than aspirational. There is no pause/resume state machine and
  nothing to reconcile on next launch, because everything already finished is banked.

  **Doing that made a latent save race reachable, and the fix belongs with it.** A write is a
  read-then-write across two slots, so two in flight together interleave and an older state can land
  on top of a newer one. Nothing had ever written often enough for that to matter; one write a
  second at 4x does. `SaveService` now keeps at most one write in flight and coalesces the rest.
  **Serialising at the storage layer rather than making the next fight wait for the previous write**
  is the deliberate half: gating the loop on disk latency would put a slow bridge into the
  animation's critical path, and the ordering problem belongs to the two slots rather than to the
  battle loop. See [saves](saves.md).

**A loss ends the run and drops the player back to the idle screen**; because the board explaining
the loss is gone by the time they can read it, `autoStoppedAt` carries the stage out and the home
screen says which one.

**`@capacitor/app` stayed deferred.** It was named as the first thing that would genuinely care
about a real iOS lifecycle event versus a web `visibilitychange`, and it turned out not to be needed
— persisting per battle is exactly what bounds the cost of a missed event to one fight. **Ambient
sparring on the idle screen is still deferred**; it awards nothing and blocks nothing.

### 2. Doubling the ladder, and the tuning collision

Twelve new stages, and the first thing they ran into was a test doing its job.

[`levels.spec.ts`](../src/data/levels.spec.ts) asserts that one character to level 1000 costs more
than a thousand hours of income at the top of the ladder, and it reads the rates off `STAGES` rather
than restating them. Continuing this milestone's own fitted ×1.4-a-stage slope to twenty-four stages
puts gold at ~1,417/s and level 1000 at **75 hours**. The spec failed exactly as designed.

The plan had called that the goal. **Milestone 11 retracts it and wins**: level 1000 is a
chapter-100 target, thousands of stages out, and the cap being unreachable in chapter 1 is the
intent. So what got retuned was **the rate slope** — neither the level curve nor the threshold:

|                   | gold/s at the top | level 1000  |
| ----------------- | ----------------- | ----------- |
| 12 stages         | 25                | ~4,280h     |
| 24 at ×1.4/stage  | 1,417             | ~75h ❌     |
| **24 as shipped** | **90**            | **~1,190h** |

The slope decelerates smoothly from about ×1.4 a stage to about ×1.1. That is also the
forward-compatible shape: milestone 11 replaced authored rates with a derived curve over ~100 stages
a chapter, and ×1.4 compounded over a hundred stages is a number with fourteen zeros in it. The
curve that shipped is a power law, whose per-stage multiplier decays as `1 + 1.13 / index` — this
deceleration as a closed form.

**A second derived threshold fired for the same reason.**
[`banners.spec.ts`](../src/data/banners.spec.ts) pins "roughly a ten-pull a day at the top of the
ladder" against whichever stage is last, so doubling the ladder at the old crystal slope tripled the
rate. Crystals were never the bottleneck, so the answer was to flatten their curve across the second
half rather than to widen the band. **Both of these are the "derive, never retype" rule paying for
itself** — neither would have been noticed if the specs had copied their numbers across.

### 3. The new stages are locks, not multipliers — mostly

Six of the twelve new enemies exist to ask a question nothing was asking, and four of those use
targeting or conditions that had been authorable since milestone 4 and never used. That was the
richest seam available, and it is worth checking before inventing a mechanic: **the vocabulary is
usually already there.**

The other six are bodies and support. **They needed to be new stat blocks rather than the old ones
reused**, and the reason is not a preference: the party arriving at stage 13 is several times the
party that cleared stage 12, so a 300-HP Slime in front of it is not an easy fight, it is an empty
square. Scaling attack and defence together leaves a fight the same _length_ while making it a fight
between bigger numbers, which is what keeps the second half feeling like the first.

**The open gap: there is no single-slot composition proof anywhere in the project any more.**
Milestone 4 shipped one and it did not survive the move to the balance project. No comparable pair
was found for the second half either — swapping one character against any of the new locks moves the
win rate by a few points, not by seventy. Rather than ship a threshold that barely passes and call
it a proof, the balance project asserts what _is_ measurable: every enemy is fielded somewhere, and
the per-stage difficulty curve rises smoothly.

**Three later milestones were each expected to close it and none did**, which is worth recording so
it is not tried a fourth time. 8c's skill gating moves a party's power without changing which
question it answers; 8d's lineup bonus pays every faction the same rung for the same shape, so it
separates _compositions_ rather than characters; and 8e's seven-deep factions do make two genuinely
different answers to one lock fieldable, but the sweeps it added compare _factions_, and the
per-stage spread it measures is a statement about composition again. **Closing this needs a probe
that swaps one character for another in an otherwise fixed party**, which nothing in the file does.

### 4. The balance project now exists

The sweep outgrew the fast suite here, exactly as `AGENTS.md` predicted: three reference parties
across twenty-four stages at forty seeds, plus a bisecting difficulty probe, is thousands of battles
and more than ten seconds. **The sample was not shrunk** — that buys speed by making the answer less
true. `npm run test:balance` runs `src/**/*.balance.ts`, and `data/stages.spec.ts` kept only what is
fast and structural.

The reference parties also got a correction worth knowing about. The mid-game party was five
characters at **level 80 with no ascension at all** — and `rare` caps at level 40, so the number the
whole mid-ladder was tuned against described a party that cannot exist. `at()` scales whatever it is
handed; only `levelUp` enforces the cap, and no sweep goes through it. The parties are now checked
against their own rarity's cap on the way in:

| Party    | Composition                                | Clears           |
| -------- | ------------------------------------------ | ---------------- |
| Starters | three at level 1                           | 1–6              |
| Built    | five common-tier at level 80, `elite`      | the first twelve |
| Invested | five common-tier at level 200, `legendary` | all twenty-four  |

Still common tier at the top, and still no pull anyone had to be lucky for: the second half asks for
levels and ascension rungs, which are bought with time and duplicates.

**Those two investments are the milestone 7 numbers and milestone 10 replaced them** — level 40 at
`rare-plus` and level 90 at `legendary`. The rows above are kept as written because the correction
they record is about the _cap check_, which still stands; what each party is made of lives in
[`stages.balance.ts`](../src/data/stages.balance.ts).

### Why there is no prestige layer

This milestone used to read "prestige layer, then content". Checking that against what the game
actually looks like when the ladder runs out found the ordering backwards and the first half
answering a question this game does not have.

**The diagnosis was right and is what the roadmap still runs on.** Idle income rises on exactly one
event — a stage clearing — so once the last stage falls all four rates freeze permanently, while the
level curve runs to 1000 with essence binding by roughly 5×. The post-ladder state is nothing left
to clear, income that can never rise again, and a vertical axis years out of reach. **The game runs
out of _decisions_ long before it runs out of _numbers_.** That is the thing to measure any proposal
against. (The prescription that came with it — extend the ladder until level 1000 is reachable in
weeks — is superseded by milestone 11, which makes 1000 a chapter-100 target on purpose.)

Prestige trades a reset of one axis for a permanent multiplier on another. Four reasons it does not
fit here, recorded so it does not get re-proposed on genre instinct:

1. **There is nothing to reset.** The only resettable axis is stage progress, and stage progress
   _is_ the income rate — the rate table is the reward. Wiping it takes everything and hands back
   fights the player has already won.
2. **The roster cannot be part of it, and that is settled law.** Ascension consumes only spare
   copies specifically so that nobody can destroy a week's investment by tapping the wrong row.
3. **The job prestige normally does is already done.** Its usual purpose is an uncapped vertical axis
   so numbers keep growing past authored content. That is ascension plus the 1000-level curve, and
   there are years of it sitting unreachable. The problem is not a missing multiplier track; it is
   income that cannot reach the one already built.
4. **Its other purpose is content recycling** — making twelve stages feel like a hundred and twenty.
   That is the same shape as the tuning philosophy this project rejects everywhere else: a
   structural answer to "we ran out of content" that spends the player's time in place of authoring
   time. There is nothing to sell here, so the honest version is to author the stages.

If the recycling idea ever does come back, the form to consider is **difficulty tiers over existing
stages**, not a run reset — it keeps the reward shape and costs the player nothing they already
earned. It is still recycling, and it still loses to authoring more ladder while there is ladder
worth authoring.

**Treat this milestone's stages as the last of the flat, hand-tuned ladder**: enough content to
exercise auto-battle against something, and the opening stretch of what becomes chapter 1. Their
rates were re-derived in milestone 11 when rates stopped being an authored field, and the whole
curve was retuned in milestone 10. The stages themselves survived both: the twelve are chapter 1's
opening and the Ashfall twelve are chapter 2's spine.

## 8. The combat rework

Four interlocking changes: the stat block, energy and ultimates, how many skills a character gets,
and faction lineup bonuses.

It sits here, before the compounding rework and the chapters, because milestone 10 retunes all
scaling and milestone 11 authors a hundred stages, and doing either against a combat model that is
about to change means doing it again. It is independent of auto-battle at 7, which is
model-agnostic — and auto-battle earns its place first by making the re-sweep cheap.

**It was split twice.** The plan said the four changes could not ship apart, and that was half
right: the _authoring_ cannot be done twice, but the vocabulary can land first and the rest can be
written against it. So 8a took the stat block alone, 8b took energy alone, and the remaining two
became 8c and 8d — with the roster growth 8d turns out to depend on becoming 8e.

**The second split was made at the boundary between a mechanic and its content**, and the reason is
the same each time. Energy is a swap with a fixed content surface: convert existing kits and
re-sweep. Skill counts are an authoring job against a mechanic that is by then settled. Lineup
bonuses are a party-composition layer that sits outside the combatant entirely. Shipping them
together means a red ladder sweep with three possible causes; shipping them apart means each sweep
names its own culprit — which is exactly what happened in 8b, where the failure turned out to be one
enemy.

What made the first split safe is worth keeping too. **MP survived 8a untouched.** Deleting it
before energy existed would have left every healer unmetered, and the MP pool was the thing that
guaranteed a fight against one resolves. A milestone that removed a termination argument and
replaced it two milestones later is not a smaller milestone, it is a broken one.

## 8a. The stat block — **COMPLETE**

Two collapses are the whole of it: `patk`/`matk` → `atk`, `pdef`/`mdef` → `def`, with **damage type
moved onto the skill**. [attributes](attributes.md) is the current block and carries what the
collapse cost, the replacement row bonus, and the `haste`/`attackSpeed` split in full.

Shipped: every character and enemy re-authored, three statuses deleted, the row bonus replaced, and
the whole ladder re-swept.

Four things this milestone settled that are not obvious from the result:

- ⚠️ **`MAX_RESIST` is a new termination guard, and it is not the penetration cap wearing a hat.**
  `def` diminishes a hit and can never reach zero; **resist multiplies the result and can.** A
  combatant at resist 1 cannot be damaged by that type at all, and a fight against one runs to the
  tick cap every time. Same value as the penetration cap, different argument.
- **`damageType` on a damage-over-time had to be given a new job, or deleted.** Its old one was
  choosing between `patk` and `matk`. It now selects the **target's** resist as the status lands —
  so a Golem shrugs off a bleed exactly as it shrugs off a sword. Left alone it would have been a
  live field with no consumer, and a hole in the one axis this milestone claims moved onto the
  resists.
- **Shields and regeneration had to be re-priced, and that was not on the plan.** They scale off the
  applier's `atk`, and the characters authored to cast them are tanks and healers — the lowest
  attack stats in the game. **The test that caught it had to be rewritten to catch it**: the old
  assertion compared `matk` against `patk`, which is not a question that can be asked any more, and
  the successor measures restoration against a typical health bar. That is the `data/` testing rule
  doing its job — a threshold that fails when content outgrows it, retuned rather than moved.
- **`recovery` and `healthRegen` both survived**, though the plan flagged them as near-redundant.
  Collapsing to one would have removed the ability to say "this character recovers unusually well
  **for its size**", which is what distinguishes a Dwarf from a big Undead health pool. `recovery`
  is the fourth scaling stat and had to be — a fixed number measured against a health bar heading
  for ×10⁹ is a rounding error by then.

**The `attackSpeed` mapping was the one with no precedent, and the first implementation was wrong in
a way worth recording.** It predicted the next action by reading "is every skill on cooldown", which
is cheap and looks equivalent. It is not: a skill gated on a condition that is not currently met
never goes on cooldown, so it suppresses the bonus _for the whole fight_ — meaning the largest
attack speed in the game would have paid out only on the wide waves its owner's kit wanted. Keying
off the action already taken fixes that and is strictly cheaper.

**The re-sweep needed no retuning of the ladder.** Three level-1 starters clear to the healer lock,
five common-tier characters at level 80 clear the hand-climbed half, and an invested common-tier
party clears all twenty-four. The identity pass — giving the new stats to the factions they describe
— is what closed the two gaps the mechanical conversion left.

## 8b. Energy and ultimates — **COMPLETE**

`mp` and `mpRegen` are gone, and so are HP costs. Every character declares exactly one **ultimate**,
metered by a 0–100 energy bar and nothing else; every other skill costs nothing but its cooldown.
Milestone 4's "three ways to meter a skill" is two — see [combat](combat.md).

Shipped: [`core/battle/energy.ts`](../src/core/battle/energy.ts), `energyRegen` on every character,
the gains in [`data/combat.ts`](../src/data/combat.ts), every character and enemy kit re-metered,
the energy bar in the battle view, and the ladder re-swept.

### The bar opens empty, and that inverted the pacing rather than deleting it

The plan said MP's job was "front-load and then run dry", and worried that energy "never runs dry,
so fights converge on ultimates-on-cooldown". Half of that was right and the interesting half was
not. **MP started full; energy starts at zero.** So a caster no longer opens strong and fades — it
opens with basic attacks and cheap cooldowns, and its marquee turn arrives once both sides have
committed. The difference between a short fight and a long one survived; it changed sign.

That is a better shape than the one it replaced, and it is worth stating because the plan expected a
loss. A support that is not needed charges slowly — a healer holding at 13 regen with nothing to
heal takes about eight turns, against three under pressure — so an ultimate arrives because the
fight went badly rather than on a metronome. MP could not express that at all.

### ⚠️ What actually broke was the termination argument, exactly where the plan said

The MP pool was the guarantee that a fight against a healer resolves. What now stands in its place
is a single assertion: **the ladder sweep requires that no reference party ever runs the clock out,
winning or losing.** It reads `BattleResult.timedOut` rather than the outcome — a timeout and a wipe
are the same `defeat` on screen since 8c, so an outcome-based version would pass forever while
testing nothing. That assertion is not a nice-to-have and should not be relaxed or narrowed.

It bit immediately. The **Ashen Hierophant** at stage 24 turned out to be the one enemy in the game
whose pool genuinely metered it — a healer _and_ a shielder spending 28 a cycle against 6 a turn —
and losing that pool handed it an unmetered heal every second turn. Stage 24 went to a 102-second
attrition war the invested reference party won 43% of the time.

**Two things about that failure are worth keeping.** First, the fix had to be enemy design, which is
what the plan predicted. Second, the obvious fix was the wrong one: raising `MEND`'s cooldown turns
the sweep green, but `MEND` is shared with the stage-7 Acolyte, whose pool was exactly break-even
and therefore never metered it at all. That would have weakened the ladder's most important early
lock to solve a problem at its last. The Hierophant got its own heal instead, and the two locks now
tune independently — which they always should have.

### `onHit` is double `onHurt`, and the ladder is what decided that

The first pass paid ten for each source and the sweep failed at stage 24. The cause was not the
enemy: **`onHurt` is paid per incoming hit while `onHit` is paid once per action**, so a front-liner
absorbing three attacks a turn banked thirty while the damage dealer behind it banked ten. That put
the slowest meter in the game on the rank where damage is fielded.

Both halves of that asymmetry are load-bearing, so neither could simply go. Per-hit `onHurt` is the
Undead's entire meter and is what makes a wide enemy wave charge a whole party at once;
once-per-action `onHit` is what stops a row nuke from charging its own next cast five times over.
Doubling `onHit` to 20 restores the symmetry without giving up either.

### Two identity decisions that came with it

**The Undead kept their bargain by inverting it.** HP costs went with MP, so they no longer buy
their best turns with their own life. The identity survived because the **drain** vocabulary was
already there, and their meter is the one thing their stat block guarantees — `onHurt` is the
largest energy source in the game and the Undead are the faction with no armour. They are handed
tempo for having been hit, and take the life back out of whatever hit them.

**Enemies have no ultimates**, deliberately: energy is a character system, and an encounter is read
as a rhythm authored directly in cooldowns. It is also what keeps skills shareable between enemies.
**Deleting the enemy MP pools cost almost nothing** — in every case but the Hierophant's the pool
regenerated more between casts than the cast cost, so the cooldown was already the binding meter.

## 8c. How many skills a character gets — **COMPLETE**

**Both axes.** Tier sets the ceiling — 2 at common, 3 at legendary, 4 at ascended, ultimate included
— and ascension rungs unlock up to it. The table and the rung thresholds are in
[combat](combat.md) and [ascension](ascension.md); the rule is
[`core/roster/kit.ts`](../src/core/roster/kit.ts) and the data is
[`data/kits.ts`](../src/data/kits.ts).

**The rung mapping is absolute rarity, and it is a deliberate head start.** Because an ascended-tier
character starts at `elite` rather than `rare`, it arrives with its second skill already unlocked
while a common-tier one climbs two rungs for the same thing. That was chosen with the alternative on
the table: counting rungs from each character's own start would have given tier a higher ceiling and
no free unlock, preserving milestone 3's "tier is a slope, not a head start" exactly. Absolute
rarity was picked instead, so the promise is modified twice over — a capability gate _and_ a head
start on reaching it — and that has to be deliberate rather than discovered.

**What keeps it fair is the tuning target that already exists.** Five common-tier characters at
level 80 clear the hand-climbed half, swept in
[`stages.balance.ts`](../src/data/stages.balance.ts). Hold that with two skills each and the promise
survives in substance — the top of the ladder still cannot demand a pull nobody can buy. Let it fail
and quietly retune it, and the game has become tier-gated without anyone deciding to.

**Milestone 10 moved that party below the gate and the promise came out stronger.** The mid-game
reference is now level 40 at `rare-plus` — one skill each — so the hand-climbed half asks for no
rung-gated skill at all, and what the second skill gates is the Ashfall Reach. A capability arriving
with the content that needs it is a better answer than a capability arriving before it.

Shipped: thirty new skills, every kit re-authored at its ceiling, the gate applied on the same seam
that scales stats, and the sheet showing what is still locked.

### The authoring job, and the tally that rotted

The ceilings asked for thirty more skills than the roster had. **The counts in the plan were wrong
and the total was right**, which is the failure mode a hand-maintained tally always has: the plan's
"skills that exist" and "skills the ceilings ask for" had both gone stale, but their difference was
still thirty, so the headline survived while everything supporting it rotted. Nothing derives from a
tally here — `characters.spec.ts` asserts each kit against `skillCeiling` directly, so the next time
content moves it is the spec that fails rather than a paragraph that quietly stops being true. (8e
authored sixty-six more skills and did not have to touch a number in this file, which is the
arrangement working.)

Three conventions the kits now keep:

- **Every kit is authored at exactly its tier's ceiling.** Never fewer, or a character is short of
  what its tier promises; never more, or content ships that no amount of ascending could reach.
- **The ultimate is written first, then the ordinary skills in unlock order**, so reading a kit top
  to bottom reads the progression. This is a readability convention rather than a mechanism — which
  is deliberate: a kit authored out of convention degrades to a confusing sheet rather than to a
  broken fight.
- ⚠️ **The ultimate is never gated, unconditionally.** Not "unlocked at the tier's starting rung",
  which is the same thing until a damaged save holds an ascended-tier character below `elite` and
  hands the simulation a combatant whose energy bar fills and can never be spent. A condition on an
  ultimate likewise means "wait", never "never" — one gated on three living enemies is a bar the
  player watches fill and never spend on a boss stage.

### The re-sweep found nothing to retune, and the reason is worth knowing

What moved was smaller than expected: the top of the ladder went from 98% to 100% for the invested
party, and nothing else changed a win rate at all. **That is because the reference five are the
conservative half of the authoring job, by construction** — they are what the ladder is tuned
against, so their second skills were authored knowing the sweep would measure them. A new skill on a
50-tick cooldown replaces a basic attack roughly one turn in five, so a 1.5× where a 1.0× used to be
is worth single-digit percent, which is the size a milestone that must not move an already-tuned
ladder should be aiming for.

**Where the gate is visible is the top half of the roster**, and that is the progression it was built
to sell. An ascended-tier party held at one level, with the rung as the only variable, clears to
stage 14 at `elite` with two skills, to stage 18 at `legendary` with three, and the whole ladder at
`ascended` with four — and the rungs that unlock nothing move it far less than the two that do.

### The battle timer, and the guard that was not guarding

**A fight is ninety seconds. Run the clock out and you lose.** `MAX_BATTLE_TICKS` went from 18,000
to 900, the `stalemate` outcome was deleted, and `BattleResult.timedOut` took over the job of saying
which kind of defeat it was.

The trigger was a gap this milestone measured rather than opened. ⚠️ **A solo sustain character
against a stage it cannot kill ran to the tick cap** — thirty minutes of battle time for nothing.
Fielding one character is legal, and a wall behind a regeneration is exactly the shape the
zero-timeout guard exists to catch. It **predated 8c**: the same scan against the 8b kits finds 238
stalled battles, and the new skills made it worse rather than possible. The shipped guard passed
throughout, because it swept reference parties of five and none of them stalls anywhere — **that was
the gap**: the assertion that replaced the MP termination argument covered the parties a tuned
ladder is measured against, not every party a player can legally field.

**Three candidate fixes were written down first and all three died on measurement**, which is worth
recording because each looked reasonable:

- **A damage floor** — a minimum fraction off any hit. The reason it fails generalises: damage is
  already never zero, and the deadlocks were never "damage rounds away", they were **sustain
  out-pacing damage**. A floor big enough to beat the best heal in the game is a global damage buff
  wearing a guard's clothes.
- **A minimum formation size** — declare one-character parties unsupported. Dead on the numbers: a
  two-character sustain pair stalls 4/4 against stages 18 and 19. Party size correlates with the
  failure and does not define it; **total party damage** does.
- **A stall detector** — end the fight when neither side has reached a new low for N ticks. The most
  promising and still a failure. Sized so it never cuts a legitimate fight short it needs a window
  of ~4,000 ticks, which left the mean stalled fight at fourteen minutes; and some stalls never
  trigger it at all, because a party being ground down slowly _is_ making progress — just not
  progress anyone wants to watch.

**What the measurement actually showed is that the cap was never bounding anything.** The longest
fight any reference party had was 48.5 seconds against a cap of thirty minutes. Two things had
drifted apart: _the fight is decided_ and _the fight has finished_. A party that cannot out-damage a
healer has lost inside the first minute, and the clock was the only participant that had not
noticed. So the fix is a timer rather than machinery, and **it is a rule of the game rather than a
guard bolted on beside one** — the genre convention, and what the ladder was already being tuned to
without anyone writing it down. It cost nothing in tuned content and everything in pathological
content: no reference win flipped to a defeat, while the 59 overlong solo and sustain-pair fights
went to zero.

**The guard was widened at the same time, and its shape changed.** `stages.balance.ts` grew a
`parties nobody tuned for` block covering solo and two-character sustain parties. What it asserts is
deliberately not a balance claim: **those parties are allowed to lose, and not allowed to lose
slowly.** It also asserts a lone character can still clear _something_, so the timer never becomes a
minimum party size by the back door.

**The margin is the real cost.** Ninety seconds is a budget every encounter has to fit inside, which
milestone 10's rescale and milestone 11's hundred stages both have to respect. A stage tuned to take
longer than the timer against the party it is meant for is unclearable, so the sweep asserts the
margin directly — it should go red naming a stage before any win-rate assertion does. It was 1.9×
here; **8e spent most of it and it is 1.40× now**, with the assertion narrowed to fights a party
actually clears.

## 8d. Faction lineup bonuses — **COMPLETE**

The AFK Arena ladder, applied to the party's own composition: three tracks that stack — a
composition table topping out at +25% attack and health for a mono-faction five, a per-member
Monster share, and a cumulative Demon track — with Angels as a wildcard on the composition table
only. [combat](combat.md) carries the numbers, the wildcard restriction, the haste re-clamp and the
injured-energy clause.

**This is the pattern AGENTS.md names and rejects** — "+10% if two Fire units… those just create a
new optimal team". The rule is being overridden knowingly, and the reason it survives in substance:
**a mono-faction bonus does not create one optimal team, it creates seven — and the encounter's
faction matchup decides which one to bring.** That is still a statement about the fight in front of
you, which was the whole distinction the rule was drawing. Note what it is _not_: the player is not
choosing between the lineup bonus and the matchup. They keep the +25% and switch which mono-faction
team fields it. The two are complementary, not competing. ⚠️ The argument is specific to _faction_
composition and does not license a bonus for a set of characters or a role mix.

**That premise was false the day it shipped, and 8e is what made it true.** With three characters in
most factions a mono-faction five was unreachable without spending Angels as wildcards, so the
mechanic shipped against a roster that could not express it. Two questions moved to 8e with the
content that makes them answerable:

- **The matchup edges stayed at 1.05–1.10**, and the plan to resize them here was wrong on its own
  terms. The constraint named was that the swing between the right faction and the wrong one must
  exceed the quality gap between a player's best and second-best faction team — but **both teams are
  mono, so both hold the same +25% and the lineup bonus cancels out of the comparison entirely.**
- **The Angel wildcard was the only route to a mono-five**, which is the shape milestone 4 added a
  mortal healer and cleanse to fix: not a fight lost, but a category of answer that cannot be
  bought. 8e made it a luxury again — a way to reach the top rung while short a body, rather than
  the path. [`combat.spec.ts`](../src/data/combat.spec.ts) still asserts the wildcard reaches a
  mono-five, and now describes a convenience instead of a dependency.

### What the resolver had to get right

- **Every rung is tried, not just the last one that matched.** A mono-four pays the same attack as a
  three-and-two and more health, so a resolver reading the table in order would make the answer
  depend on where somebody put a row. It also tries every faction assignment rather than the
  cheapest — greedy is correct only while each rung asks for at least as many of its first faction
  as its second, and a party is five people against seven factions, so exhaustive costs nothing and
  needs no invariant.
- **A wildcard cannot be spent twice.** The `3 + 2` rung asks for two factions, so what the first
  half spends has to come off what the second half may.

### The ladder needed no retuning, which was not obvious in advance

The full 40-seed sweep passed unchanged, because the reference party is a rainbow — one each of
Dwarf, Monster, Elf, Angel and Demon — so it reaches **no rung at all** and collects only the
Monster share and the first Demon step. That is a real buff and it did not move a single win-rate
assertion.

The sweep grew a fourth party rather than leaving it there. `BOOSTED` fields the highest composition
bonus anything legal can reach, and it is a **guard, not a tuning target**: nothing asserts it should
beat anything. What it watches for is the failure mode more health and more defence make likelier,
which is ⚠️ a party surviving a fight it cannot win until the ninety seconds run out. It reads
`timedOut`, like everything else standing where the MP pool used to. 8e had to rebuild it — see
below.

## 8e. Seven characters per faction — **COMPLETE**

Twenty-three characters across seven factions was roughly three each. **A mono-faction five was
unreachable in every faction without an Angel**, which made 8d's premise false the day it shipped.
That is the state this milestone started from rather than a risk it was guarding against.

### The roster shape: three, three, one — and only two of them are closed

The plan was "roughly twelve new characters, five per faction". **What shipped is twenty-six new
characters and seven per faction**, and the widening was deliberate: the bench a mono-faction team
is built from is also the fodder the mortal ascension ladder eats, and both jobs want a known depth
rather than a number that drifts every time content ships.

- **Exactly three common and exactly three legendary**, per faction, asserted as exact counts in
  [`characters.spec.ts`](../src/data/characters.spec.ts). This is the closed half, and it is
  intended to stay closed.
- **At least one ascended**, asserted as a floor. This is where new characters will keep arriving,
  because that is the tier a banner is for. One each for now.

Forty-nine characters, sixty-six new skills, every kit authored at its tier's 8c ceiling. No banner
change was needed — `BANNERS` carries an empty `pool`, which already means the whole roster.

**A mono-faction five costs two legendary-tier pulls**, since a faction only holds three commons. At
22.5% base that is a mild gate and deliberately not a free one: a composition worth +25% attack and
health should cost something. The balance sweep's seven reference fives are all built this way —
three commons and two legendaries, no ascended pull.

### Every faction got sustain and reach, in its own idiom

The count was never the real requirement. A mono-faction five needs two things it cannot substitute
for, and without them the lineup bonus is a trap rather than a decision:

- **An answer to health.** Humans were "the only mortal faction with both a healer and a cleanse",
  and that line was spent here on purpose: every faction now owns sustain. **Monsters were the
  deliberate exception** — they got `lifeLeech` and a siphon instead of a healer, because giving
  that faction a support would have solved a composition problem by deleting the faction.
- **An answer to a back rank.** Rank is a gate, not a damage reduction: a party with no back-rank
  targeting cannot _select_ a protected healer, so an encounter built around one is unwinnable
  rather than hard. Monsters were the last faction with no answer at all, and a wide, blunt trample
  is it where an Elf's is one precise shot.

Two factions needed the opposite correction. Dwarves were four walls and no way to close a fight,
which is the ninety-second timeout with a stat block on, so one of them is authored as the Dwarf who
kills something. Angels were three healers with the same problem, so their three new characters are
a body and two attackers.

### What the sweep caught, which is the part worth reading

All seven fives clear within about a stage and a half of each other on twenty-four — they are
genuinely sidegrades. Getting there took three fixes the sweep found and nothing else would have:

1. **A Demon healer out-healed an Angel one while her doc comment claimed the opposite.**
   Restoration prices against `atk` and a Demon's is high, so her heal at its first authored power
   restored more than an Angel's ultimate — and a mono-Demon five out-sustained stage 18 into a
   timeout nine times in twenty-four.
2. **Angels were given two walls when they needed one.** Two new characters both authored as tanks
   made the sustain faction take seventy-six seconds to lose a fight it never had a chance in. One
   is now a durable attacker instead.
3. **`BOOSTED` had stopped watching the worst case.** It was three Demons and two Angels, which was
   the maximum only while a mono-five was unreachable; the Angels stood in as wildcards and paid
   nothing on the Demon track. It is five Demons now, which reaches all five steps.

**The lineup ladder was measured and left alone.** Reweighting it toward attack, and zeroing its
health entirely, both failed to fix the stalls and introduced new ones elsewhere — the cause was the
characters, not the bonus.

### ⚠️ The timer headroom shrank, and the assertion measuring it was narrowed

This is the one thing in the milestone that a future reader should treat as a live constraint rather
than as history.

[`stages.balance.ts`](../src/data/stages.balance.ts) asserts the longest fight leaves the
ninety-second timer real headroom. It used to read every fight in the sweep, which was fine while
the sweep held four parties and accidentally true — the longest fight in it happened to be one
`BUILT` mostly loses. Adding seven mono-faction fives made the accident visible: the longest fights
in the file are now celestial fives dying slowly to stage 18, which they clear zero and three
percent of the time.

**The set was narrowed to fights a party actually clears; the bar itself did not move.** The
justification is the assertion's own sentence — a stage past the margin is unclearable _by the party
it was tuned for_ — and a fight the party loses has no tuning claim on it. Losing fights are covered
separately, by a 95%-of-timer bound and by the zero-timeout guard, which is the load-bearing one.

Be honest about the cost, because it is a real reduction rather than a reclassification:

- Longest _cleared_ fight before 8e: about 47s, so **1.9× headroom**.
- Longest cleared fight after: **64.5s**, a mono-Dwarf five taking stage 16 — four walls and one
  attacker, winning the way that faction wins. **1.40× headroom.**
- Longest fight of any kind: **84.7s** against a 90s timer, on a stage nobody clears.

Content added from here has substantially less room than it had. Milestone 10's rescale and
milestone 11's chapters both need to expect the headroom assertion to fail first.

**Milestone 10 gave some of it back, which was not the plan and is worth knowing why.** Re-authoring
every archetype at level 1 replaced blocks whose HP had grown far faster than their attack, and a
less spongy encounter resolves sooner: the longest cleared fight is 54.1s and the headroom is
**1.66×**. The rescale itself contributed nothing either way — scaling both sides is an identity on
fight _length_, measured in ticks.

### The matchup retune it inherited: measured, and deliberately not applied

8d expected to resize the 1.05–1.10 edges and could not. 8e could measure it, and the answer was to
leave the numbers alone.

**The assertion that had been standing in was true and irrelevant.** It pinned that the composition
ladder's top rung is worth several times the largest matchup edge — which is true, and never entered
the comparison it was being compared in, because the rung pays every mono-faction five identically
and cancels.

What replaced it measures the matrix directly: sweep the seven fives across the ladder at five
investment levels, switch the matrix off, and look at the fights that were genuinely in doubt. It
moves those by about **seventeen points of win rate**. The edges are already doing their job.

**Two traps in that measurement, both hit before getting it right:**

- **Averaging over the whole ladder makes the matrix look decorative.** At a fixed investment the
  ladder is close to a step function — a party clears everything up to its level and nothing past it
  — so twenty-one of twenty-four stages were never in doubt and dilute the answer to nothing.
  Sweeping investment levels is what produces contested fights to measure.
- **"The matrix never turns a loss into a win" is the wrong assertion, and it fails.** A mono-Angel
  five at level 90 goes from 0% to 79% on stage 18 with the matrix on. That is not a rescue, it is
  what a tiebreak looks like on a step function: either the party out-damages the encounter's
  sustain or it does not, and "loses at zero percent" and "is one exchange short" read identically.
  The assertion that works measures the edge in the currency a player spends — a matchup-assisted
  fight must never beat the same fight ten levels higher with the matrix off.

**This is the same roster pressure faction towers create in milestone 15**, which was a point in
favour of doing it here. 15 now arrives with its prerequisite met.

## 9. Resonance — levels the roster shares — **COMPLETE**

**Invest in five characters; every other character you own is carried to the same level.** The
mechanic, the derivation, the invariant it rests on and the reasoning behind each of them live in
**[level-resonance](level-resonance.md)** rather than here. What follows is what this milestone
decided.

Shipped: `core/roster/resonance.ts`, `raiseResonance` and `raiseResonanceToAffordable` in
`core/roster/roster.ts`, and a resonance panel on the roster screen. **No save migration**, because
nothing about it is stored.

### Why here, and why it is not only quality of life

Milestone 8d shipped mono-faction lineup bonuses worth up to +25% attack and health, reachable only
by fielding a _different_ five-character team per encounter, and 8e authored the seven-deep roster
that makes that possible. Milestone 15 does the same thing harder, with seven faction towers
demanding thirty-five invested characters.

**Neither is affordable without this.** Levelling thirty-five characters individually is seven
times the cost of levelling five, against an economy tuned for one team. So resonance is closer to
a prerequisite for 8d's faction bonuses than a convenience that follows them — it is positioned
after the rework only because the rework decides what a level is worth.

### Three decisions the rest of the project now rests on

- **Derived, never stored.** `OwnedCharacter.level` stays the invested level and the floor is
  computed on read. Baking a carried level into the save would be irreversible and wrong the moment
  the top five changed. The cost of that choice is that **every reader has to derive** — so
  `toBattleCombatant` now takes the level as an argument rather than reading it off the roster
  entry, which is the one seam where a screen and a battle could otherwise have disagreed silently.
- **The rarity cap still binds, and that is what keeps ascension alive.** Resonance makes _levels_
  free and leaves _ascension_ entirely individual. Without that clause the feature would make
  ascension pointless for everyone outside the top five, and the bench would have nothing left to
  spend on. It also deliberately does not cover milestone 16's per-character investment track.
- **Levelling is charged from the effective level, not the invested one.** A carried character pays
  for the level above the floor and never for the climb to it. The alternative is a trap rather
  than a balance decision: charging from the invested level would sell those levels back, and every
  purchase below the floor would buy nothing the player could see.

### The floor never falls, and it is cheaper to prove than to defend against

Invested levels only rise, characters are never removed from the roster, and adding one can only
raise or hold the `PARTY_SIZE`-th highest value. So the floor is monotonically non-decreasing and
no displayed level can drop.

**That is why the roster screen shows one number and not two.** "Levelled to 6, carried to 200"
would be defending against a state that cannot occur; the row says `carried` in words instead. The
full argument, and the one exception — load-time repair dropping a character `data/` no longer
ships — is in [level-resonance](level-resonance.md).

### The button raises the floor, not a character

Only the lowest of the five moves the floor, so a control that levelled "the top five" by one step
would charge for five levels to buy one. `raiseResonance` targets the floor and levels whoever it
takes, atomically — a partial application drifts the anchors apart and breaks the model the whole
feature teaches. It prices the operation in full first, because breakthrough levels are lumpy
enough that discovering the shortfall partway through is a real outcome.

**The cap stall has two exits and the planner has to allow both.** When the fifth-highest character
is at its rarity's ceiling the floor stops moving: ascend that character, _or_ level a sixth past
it. Pinning the anchor set once would have supported only the first, while a player could watch the
second work by hand — so the plan re-picks its five per target, filtered by which rarity caps allow
it. [level-resonance](level-resonance.md) has why that pick is arithmetic rather than a search.

## 10. Power that compounds — **COMPLETE**

**Both sides of the fight scale, or neither does.** Levelling and ascension became dramatically
more powerful and enemies got their own levels so the ladder survived it. Those were one job, not
two: raising the player's curve without raising the enemy's does not create a power fantasy, it
deletes the content.

Shipped: new coefficients in [`levels.ts`](../src/data/levels.ts), a shared
[`core/growth.ts`](../src/core/growth.ts), `EnemyData` and `StageData.level` in
[`battle/types.ts`](../src/core/battle/types.ts), `toEnemyCombatant` beside `toBattleCombatant` in
[`roster/stats.ts`](../src/core/roster/stats.ts), all twenty-four enemy archetypes re-authored at
level 1, all twenty-four stages given a level, and a stomp spec in
[`stages.balance.ts`](../src/data/stages.balance.ts). **No save migration** — growth lives in
`data/` and levels are stored rather than power, so every existing save re-derives on load.

### The three numbers, and the two ways to pick them

| Per level | Common | Legendary | Ascended | Ascended ÷ Common |
| --------- | ------ | --------- | -------- | ----------------- |
| was       | 1.0075 | 1.009     | 1.0105   | 19.5× at the cap  |
| is        | 1.021  | 1.0225    | 1.024    | 18.7× at the cap  |

Common tier now compounds to ×1.04e9 across the level range where it reached ×1745 — six orders of
magnitude steeper, which is the difference between a gentle slope and an incremental game.

**Every tier's multiplier-at-cap was raised by the same factor, and that was the decision.** The
obvious alternative is to scale the _exponents_ by a common factor — multiply each rate's excess
over 1 by ~2.8 and you get 1.021 / 1.0252 / 1.0294, which reads like the same idea. It is not:
raising a ratio of 19.5 to the power 2.8 is a ratio of 3,600. Common tier would be five times
behind at level 200 rather than 1.8, which is a retune of milestone 3's central promise arriving as
an arithmetic detail. `data/levels.spec.ts` pins the ratio so the choice cannot be un-made by
accident.

`perAscension` went `1.12` → `1.6`: ×450 across the full rung ladder rather than ×4.36. Against a
billion-fold levelling curve the old number would have made the gacha decoration, and duplicates
are this game's _primary_ ascension path. It was sized against the levelling curve rather than in
isolation — a rung raises the level cap by 20 to 100, itself worth ×1.5 to ×7.9, so a rung paying
×1.6 sits inside the range of the headroom it unlocks.

**The `break_infinity` hedge is retired.** AGENTS.md said to add it "only if the curve actually
demands it"; the curve demands it.

### Enemies are instances, and one of the three dials was folded away

An archetype in [`enemies.ts`](../src/data/enemies.ts) is now a **level-1 stat block plus a tier**,
and a stage names archetypes and a **level**. All twenty-four were re-authored down to a common
level-1 budget, which is what makes them comparable to a character's own level-1 block and what
lets a Marsh Acolyte reappear two hundred stages later as the same question rather than an empty
square. Tier is the growth slope, not a difficulty rating: fodder is `common`, the locks are
`legendary`, the gates are `ascended`, so a boss pulls away from its escort as the ladder climbs.

The plan said "a definition plus a level, tier and rarity". **The rarity was folded into the stat
block and the reason is worth keeping.** A rung is a flat multiplier: per stage it is a ×1.6 cliff
on a dial `level` already turns smoothly, and per archetype it multiplies a block the author is
writing anyway. Both spellings say what the block already says. Nothing was lost and a dial nobody
could explain was not shipped.

Authoring did collapse as predicted — a stage is a line of archetypes and a number — which is what
makes milestone 11's hundreds of stages an afternoon rather than a career.

### Scaling both sides is an identity, and that is why nothing else broke

Damage is `atk² / (atk + def)` and every status prices off the applier's `atk`, so multiplying both
sides by the same factor reproduces the fight exactly: same hits, same order, same tick.
`simulate.spec.ts` asserts it on a doubling curve, where the arithmetic is exact.

That property is why the audit the plan called for came back nearly empty. The faction matrix's
5–10% is 5–10% at any magnitude. Every status in `statuses.ts` was already a multiplier or a share
of `atk`. Energy gains were already flat points against a fixed bar — `battle/types.ts` had written
the argument down in advance. The ninety-second timer needed no change, because fight _length_ in
ticks is invariant under the rescale — the headroom actually **rose from 1.40× to 1.66×**, since
re-authoring the archetypes replaced blocks whose HP had outgrown their attack. The one thing that
genuinely moved was the difficulty probe's search bracket, which used to top out at ×40 against a
ladder that now asks ×370.

### The stomp is what actually retuned the ladder

"Go idle for a long time, come back, level up, and stomp stages until the next wall" was written as
a spec: an idle window must buy levels that convert into a run of cleared stages, measured at three
points on the ladder, with the budget divided by `PARTY_SIZE` first because resonance means raising
the party by one level costs five.

**Measured against the anchors as they stood, eight hours bought two stages, then one, then none.**
The cause was not the rescale — it was holding "five common-tier at level 200 clear the ladder"
while a rung went from ×1.12 to ×1.6. The ladder then had to absorb the whole ascension gain on top
of the levelling one, which left a stage costing seventeen levels where a day of income bought six.
A wall wearing a compounding curve's clothes.

So the ladder came down to meet it. The reference parties are now **level 40 at `rare-plus`** for
the hand-climbed half and **level 90 at `legendary`** for all twenty-four, and the twenty-four
stage levels were solved against a smooth ×1.26-a-stage curve rather than hand-guessed. A night
away buys one to two stages; a day away buys three to four. Both are asserted.

**Where that leaves the two axes is the number to keep.** Levelling to `INVESTED` is worth ×6.4 and
its four rungs are worth ×6.6, so across the ladder the two are within a few percent of each other
— levels are the steady drip, rungs are the leap, and neither is decoration. The balance sweep
asserts that ratio stays inside `[0.5, 2]`.

Three consequences of flattening, stated rather than discovered:

- **The ladder is a shorter climb in wall-clock terms**, because level 90 across five characters is
  a fraction of what level 200 cost. That is the price of the stomp and it was paid knowingly;
  milestone 11 is where the content to spend the rest of the curve on arrives, and it did — a
  hundred stages spanning the same level range the old twenty-four did.
- **The mid-game party sits below the skill gate**, at one skill each rather than two. The promise
  in milestone 8c came out stronger for it — see the note there.
- **Nothing here fixes the density properly.** A 24-stage ladder cannot span the interesting level
  range _and_ cost a couple of levels a stage. Milestone 11's own anchor is roughly 9.5 stages per
  level, sixty times flatter again, and that is where "stomp" starts meaning what it sounds like.

### What survives the rescale, revisited

- **Multiplicative edges survive at any magnitude**, as predicted. Milestone 4's matchup design
  needed no rework, which is a point in favour of how it was built.
- **The non-scaling stats stayed non-scaling.** `haste`, the probabilities, penetration, resist and
  the energy budget are bounded for termination and metering reasons a bigger power curve does not
  touch. A compounding game makes it **more** important that `haste` cannot grow, not less — see
  [attributes](attributes.md).
- **The tier fall-off was preserved on purpose**, and is the one place a plausible-looking
  alternative would have quietly retuned milestone 3.

**One thing this milestone does not answer:** what the growth axis is once a character actually
reaches 1000. The cap is deliberately ~100 chapters out, so it is not urgent — but it is the same
hole milestone 7 diagnosed, moved further down the ladder rather than filled. **Milestone 16 is
the intended answer**; it is that far out because nothing before it is close enough to the cap to
care.

## 11. Chapters — **COMPLETE**

Stages group into chapters. Chapter size steps every ten chapters and caps at 200:

| Chapters | Stages each | Running total |
| -------- | ----------- | ------------- |
| 1–10     | 50          | 500           |
| 11–20    | 60          | 1,100         |
| 21–30    | 70          | 1,800         |
| 31–40    | 80          | 2,600         |
| 41–50    | 90          | 3,500         |
| …        | …           | …             |
| 91–100   | 140         | 9,500         |
| 151+     | 200 (cap)   | 20,000 at 160 |

**Every tenth stage is a mini-boss formation and the last stage of a chapter is a true boss.** A
50-stage chapter has mini-bosses at 10, 20, 30 and 40 with its boss at 50; a 200-stage chapter
has nineteen mini-bosses. It is a **rule** rather than an authored field — `stageKindAt` — so the
rhythm is the same at either length, and what `data/` authors is a line-up worthy of the slot it
lands in. `chapters.spec.ts` checks it did: a chapter boss fields a full board of five with an
ascended-tier body in it, a mini-boss fields at least four with something above fodder.

The level cap is sized against this: reaching level 1000 around chapter 100 is roughly **9.5
stages per level**, which is the anchor to tune income and cost against. The shipped income curve
lands it without being aimed at it — see below.

### Idle income becomes a function, and that is what makes the scale survivable — **DONE**

`rates` was authored per stage. Nine and a half thousand authored rate tables is not something
anyone maintains, so income is now a function of the stage's position on the ladder. **Every clear
still raises all four rates** — that contract is the whole idle loop and it was not up for
negotiation at 50 stages a chapter any more than it was at 12.

Two things fell out of it, and both were improvements, as predicted:

- **`reconcileClearedStages` got simpler, not harder.** The rates are strictly increasing in the
  stage index, so the top cleared stage's rates dominate every stage below it and one evaluation
  replaced a `raiseRates` call per cleared stage. At a hundred stages that is tidiness; at
  thousands it is the difference between a load that is free and one that is not. The rule it
  exists to enforce — crediting progress and paying for it are the same operation, see milestone 3
  — is unchanged, and it grew one guard: see "the receipt had to be capped" below.
- **`clearedStages` was already a count**, so nothing had to change there. What was worth deciding
  is that it _stayed_ one while the position became a pair — see "a position is a chapter and a
  stage" below.

#### Summon crystals came off the exponential curve — **DONE**

Shipped ahead of this milestone, on the same reasoning as the offline cap below: the rest of this
section is the argument that produced it, kept as written.

**What shipped.** `STAGES` no longer authors a `summons` rate at all. `SUMMON_RATE` in
[`banners.ts`](../src/data/banners.ts) is a flat **100 crystals an hour**, plus **1 an hour for
every stage ever cleared for the first time** — 100/hr on a save that has never fought, 124/hr
with the whole ladder down. Three consequences worth knowing:

- **The base pays before the first battle**, which is a real change to the opening. Gold, xp and
  essence still start at zero, so the first fight is still the only thing worth doing; it is no
  longer the only thing that pays. At a `PULL_COST` of 100 the number is legible on purpose — a
  pull an hour, from install.
- **The rate is derived from `clearedStages`, not stored per stage.** That is the shape this
  milestone wanted anyway ("`reconcileClearedStages` gets simpler, not harder"), arriving one
  currency early: the repair evaluates a function, and it is also what establishes the base for a
  brand-new run, because `newGame` cannot see content.
- **Linear was chosen over logarithmic** because it keeps the answer to "what is climbing worth"
  a sentence long — a stage is worth a fixed slice of a crystal an hour, forever — and because it
  stays sane at chapter scale without a second mechanism. `banners.spec.ts` bounds the whole
  ladder's raise between ×1.1 and ×2, so a chapter of 500 stages fails that assertion and gets
  retuned deliberately rather than silently. **That is exactly what happened at a hundred stages**:
  the step halved to 0.5 an hour a clear and the pacing target stayed where it was, which is the
  spec doing the job it was written for.

The pull-price argument below said 8 crystals; the shipped price is 100, which changes the
absolute numbers in the table and none of the reasoning. The per-clear step was 1 an hour when
this shipped and is 0.5 since the ladder reached a hundred stages.

**A rate should compound only if what it buys compounds.** Gold, xp and essence buy levels, and
level costs compound, so those three belong on the exponential. Summon crystals buy a pull at a
flat 8 crystals, feeding an ascension at a flat 8 elite plus 180 rare copies. A compounding rate
against a flat price outruns it exponentially, and the curve at the time did exactly that —
summons climbed ×1.25 a stage against gold's ×1.43, which looks conservative and is not:

| Stage                | Pulls per day |
| -------------------- | ------------- |
| 12 (today)           | 194           |
| 24                   | 2,924         |
| 50 (chapter 1 ends)  | 1,039,386     |
| 110 (chapter 2 ends) | 8 × 10¹¹      |

**The damage is not to the gacha, it is to ascension.** Milestone 15 rests on towers costing
ascension even though resonance makes levelling free, and milestone 16 is fed by duplicates. Both
arguments collapse if pulls are effectively unlimited by chapter 2 — ascension stops being a
constraint and two milestones lose the thing that made them decisions.

Fix it here, when the curve is being written down, rather than discovering it at chapter 3. The
options are to take summons off the exponential entirely (linear or logarithmic in stage index),
to scale ascension costs with chapter, or both. **This is not a reason to be less generous.** The
crystal rate is the most distinctive thing about this game's economy and it should stay
extravagant; what has to change is that it stops compounding against a price that does not.

The first option is the one that shipped, and generosity went **up** rather than down: the floor
moved from 5.4 crystals an hour to 100. Ascension costs were left alone — one lever was enough,
and scaling them with chapter is still available if chapters need it.

### The offline cap is gone — **DONE**

Shipped ahead of this milestone, because leaving `AGENTS.md` saying "there is no offline cap"
while `OFFLINE_CAP_MS` still clamped would have had every later session building on a false
premise. Come back a year later and the game pays a year.

It cost nothing to allow, which is the point: `resume()` is a closed form, so a year settles in
the same O(1) as an hour — 315 million ticks that never run — and `Numeric` is a
`break_infinity` Decimal, so the quantities do not overflow. **The genre caps offline income to
force a daily session.** There is no session to force here and nothing to sell by forcing it, so
the cap was inherited rather than chosen.

Two things came with it that were not obvious from the outside:

- **The cap was bounding a damaged `lastTickAt`, and nothing else was.** A timestamp of zero is
  finite and produces a positive delta, so it passes both other guards; without the ceiling it
  pays out decades and silently destroys a run's pacing without the player ever choosing it —
  the same class of harm as the milestone 3 migration bug. `MIN_PLAUSIBLE_TICK_MS` replaces it:
  a `lastTickAt` before 2020 is damage rather than an absence and pays zero, exactly as a
  non-finite delta already does. A constant, not a save field, and no migration.
- **`formatDuration` only went up to hours**, which was sufficient by construction while the
  window was clamped at ten. Uncapped, a year away is a supported outcome and "8760 hours" is a
  correct answer nobody can read, so it now carries days.

`OFFLINE_CAP_MS` and `OfflineReport.wasCapped` are deleted, along with the home screen's "come
back sooner" notice — which was the cap's only user-facing artefact and is now a lie.

### Stages are hand-authored, and here is when that stops working

**The decision is that every stage is authored by hand rather than generated.** Milestone 10 is
what made that viable, and it shipped: a stage is a short line naming archetypes and a level, not a
set of hand-written stat blocks. Fifty such lines is an afternoon, and it buys deliberate pacing that a
difficulty curve cannot.

**A hundred of them turned out to be an afternoon, and the estimate is now measured rather than
hoped for.** What it cost beyond the typing was four difficulty inversions, each named by the
balance probe with its numbers attached and fixed by rewriting one encounter.

The arithmetic is recorded here so the decision stays re-checkable instead of becoming folklore:
**100 stages** for the first two chapters, **500** for the first band, **9,500** to reach chapter
100, **18,000** by the time the 200-stage cap arrives at chapter 151. The first two chapters are
comfortably hand-authored. The first band is a real but finite job. Chapter 100 is not
hand-authorable by anyone, and the honest form of this plan says so rather than discovering it at
chapter 30.

If the ladder genuinely heads that far, the technique is **generation from a difficulty curve
with hand-authored set-pieces** — mini-bosses and bosses stay authored, ordinary stages get
generated against a tuned reference. Do not build that speculatively; this paragraph is the
trigger, and the trigger is "authoring a chapter has stopped being an afternoon", not a stage
count.

### Enemy tier and rarity across the bands

**Not applied yet, and deliberately.** Chapters 1 and 2 reuse the twenty-four existing archetypes
at their existing tiers, several of which are `legendary` or `ascended` where the table below says
`common`. Re-tiering them would have re-tuned every lock on the ladder to satisfy a table nothing
reads, so the trigger is chapter 11 — where the band actually changes and a new tier has to mean
something.

From the long-term vision, normalised — the original had chapter 20 in two bands:

| Chapters | Enemy tiers          |
| -------- | -------------------- |
| 1–10     | common               |
| 11–20    | common + legendary   |
| 21–30    | legendary            |
| 31–40    | legendary + ascended |
| 41–50    | ascended             |

Mini-bosses and chapter bosses sit a step above their band. Past chapter 50 the three tiers are
exhausted, and **enemy rarity — the ascension ladder — takes over**, with level scaling
underneath the whole way. That is what the vision's "enemies should have their own levels _and_
ascensions" actually buys: two axes that outlast the tier vocabulary, so the enemy side has
somewhere to go for as long as the player side does.

### Ship two chapters — **DONE**

Chapters 1 and 2, 50 stages each. The existing twelve became chapter 1's opening, re-levelled; the
Ashfall twelve became chapter 2's spine.

**Both sit in the first band, so shipping them proves the chapter _flow_ but not the size
formula** — the boundary, the boss, and income continuity across the seam all get exercised; the
step to 60 stages does not arrive until chapter 11. So the formula was built and tested directly
rather than inferred from two chapters that happen to be the same length:
[`ladder.spec.ts`](../src/core/ladder.spec.ts) reproduces every running total in the table above,
including the 20,000 at chapter 160 that no content will reach for years.

Shipped: [`core/ladder.ts`](../src/core/ladder.ts) — the chapter geometry, the position type, the
boss rhythm and the reward curve; `StageEncounterData` split out of `StageData` in
[`battle/types.ts`](../src/core/battle/types.ts); `data/chapters.ts` with the two curves, and
`data/chapter-1.ts` and `data/chapter-2.ts` with a hundred encounters; `chapter` on `GameState`
and save **v5**; `LADDER` and a resolved `STAGES` in [`ui/content.ts`](../src/ui/content.ts); and
the sweeps re-pointed at chapters in `data/chapters.balance.ts`.

**The user's steer set the difficulty, and it is the one number worth restating.** Chapter 1 ends
on level-40 enemies and chapter 2 opens on them — early chapters are early game, and are meant to
be a breeze for anyone playing straight through. So the two chapters **stretch the old ladder's
difficulty range over four times the stages** rather than extending it: the old ladder went from
enemy level 1 to 126 in twenty-four stages, and these go the same distance in a hundred. That is
also why the reference parties survived unchanged.

| Party    | Composition                          | Clears                                       |
| -------- | ------------------------------------ | -------------------------------------------- |
| Starters | three at level 1                     | chapter 1 stages 1–6, stop at the lock       |
| Built    | five common at level 40, `rare-plus` | all of chapter 1, then 8 stages of chapter 2 |
| Invested | five common at level 90, `legendary` | everything, losing a member at the top       |

### A position is a chapter and a stage, and a clear count is a number

Save **v5** stores the pair. The asymmetry with `clearedStages`, which stayed a linear count, is
the decision worth keeping: **a position is a _place_ and has to survive the ladder being re-cut
around it**, whereas a clear count is a _quantity earned_ and means the same thing however the
chapters are sliced. A linear index for the position would relocate every save mid-ladder the day
a chapter's length is retuned; a pair for the count would buy nothing and cost a save field per
stage at a scale where chapters run to hundreds.

⚠️ **The bug shape that creates is worth naming before it happens.** `state.stage` changed meaning
without changing its name, and chapter 2 stage 3 and chapter 1 stage 3 are the same number.
`stageIndex(ladder, position)` is the only way to a linear index, and `GameState extends
LadderPosition` so nothing has to unpack the pair by hand.

The migration is the cleanest instance of "a migration's constants are written out" so far: every
v4 save is a chapter 1 save, and that is _arithmetic_ rather than a convention — the v4 ladder was
twenty-four stages and chapter 1 holds fifty, so no v4 position can have reached chapter 2.

### The receipt had to be capped, and that is the sharp edge of this milestone

`reconcileClearedStages` reads the surviving gold rate as a receipt for how far a run got. **That
receipt is denominated in whatever the rate curve said the day it was written, and this milestone
re-derived the curve from scratch.** A veteran arriving with the old ladder's 90 gold a second
reads, against the new curve, as somebody who has cleared all hundred stages — and crediting that
would have paid out every first-clear bonus on the ladder for stages they had never seen. The same
class of harm as the milestone 3 migration bug, arriving from the opposite direction.

The fix is a sentence that is true independently of any curve: **a run cannot have cleared more
stages than it has reached.** The receipt is capped at the linear index of the position the save is
parked on. It is a better repair than it was before — the old version would have over-credited any
future rate retune too, silently.

**Nothing else about save compatibility needed doing**, because `raiseRates` was already there. A
returning player keeps the 90 gold a second they earned and simply arrives over-rich for the
content, which the curve catches up with around stage 100.

### Income is a function, and it is calibrated against enemy level

`STAGE_REWARDS` is four numbers: `rate = base × stageIndex ^ 1.13`, a lump of forty seconds of that
rate, and first-clear crystals linear in the index with ×2 on a mini-boss and ×5 on a chapter boss.

**The exponent was chosen by matching the old hand-tuned ladder at equal enemy levels**, not by
picking a shape. The old ladder paid 25 gold a second at level 40 and 90 at level 126; this pays
about 42 and about 91 at the same two levels. That is the thing that stops "four times as many
stages" from meaning "four times the income", and it is why
[`levels.spec.ts`](../src/data/levels.spec.ts) — which asserts level 1000 costs more than a
thousand hours at the top of the ladder — passed without being touched.

**A power law is the only family that survives this ladder's length, and that is the argument for
it.** Its per-stage multiplier is `1 + exponent / index`: ×2 across the first stage, ×1.1 by stage
ten, ×1.01 by stage a hundred. Milestone 7 had already bent the authored gold slope from ×1.4 to
×1.1 by hand for exactly this reason; a power law is that bend as a closed form. It also lands the
roadmap's own anchor without being aimed at it — at stage 9,500 the curve pays about 15,600 gold a
second, which puts level 1000 a few hours away, which is what "reachable around chapter 100" means.

**One number was retuned deliberately: the crystal step halved, from 1 an hour a clear to 0.5.** A
hundred stages at the old step is five ten-pulls a day against a pacing target of three, and
[`banners.spec.ts`](../src/data/banners.spec.ts) said in advance that a longer ladder should fail
there and be retuned rather than have the threshold moved. The base did not move — a pull an hour
from install is what makes this economy legible.

### The sweep got four times the ladder, and the answer was a stride

The balance file now sweeps a hundred stages. Two blocks could not afford it, and the fix is worth
distinguishing from the thing `AGENTS.md` forbids: **striding over the ladder is not shrinking the
sample.** This milestone did not add difficulty, it made the same range four times denser, so
adjacent stages now sit within about one percent of each other — and the difficulty probe and the
matchup matrix both measure _steps_, which at that spacing is noise. Every fourth stage plus every
chapter boss restores the per-sample gap to what the twenty-four stage ladder had, over the same
range, at the same resolution, at the same cost. The load-bearing assertions — zero timeouts, the
starter wall, the timer headroom — still read every stage for every tuned party.

**Authoring a hundred encounters found four genuine difficulty inversions and nothing else.** The
probe named them by id with the numbers attached, four stages were rewritten, and everything else
— the win-rate assertions, the ninety-second headroom, the seven mono-faction fives, the stomp —
passed on the first full run against re-authored content. That is the difficulty probe paying for
itself, and it is the argument for keeping a curve-shaped assertion rather than a per-stage one.

### What this leaves for later

**The band table's enemy tiers were not applied.** Chapters 1–10 are supposed to be common-tier
enemies with mini-bosses a step above; what shipped reuses the existing twenty-four archetypes at
their existing tiers, several of which are `legendary` or `ascended`. Re-tiering them would have
re-tuned every lock on the ladder to fix a table nothing reads yet. The trigger is chapter 11,
where the band actually changes.

**Nothing unlocks on clearing a chapter.** The plan listed it as something to exercise and there
was nothing to exercise: auto-battle unlocks on a clear count and everything else is a rate. A
chapter-completion reward is a real idea and belongs with something to spend it on — milestone 12
or 14.

## 12. Gear — **COMPLETE**

The third leg of the power fantasy alongside levels and ascension. Milestone 7 records why it was
owed: four places in the codebase state that gold's coefficient is the shallowest of the three
**because** gear will spend it later, and the ladder extension made gold comfortable to the point of
meaninglessness.

It landed here, last, because its power budget only means something against the curve from milestone
10 and the content shape from milestone 11. Built earlier it would have been tuned twice, and the
second tuning would have been against numbers nine orders of magnitude away from the first.

[gear](gear.md) is the current statement of the system. What belongs here is the reasoning, and the
four decisions that were not obvious going in.

Shipped: `core/gear/` (`types`, `stats`, `inventory`, `roll`, `shop`), `data/gear.ts`, a sixth
currency, the gear screen and the character sheet's equipment panel, two new accessibility scans,
and **save v1** — the first entry the migration chain has ever had to walk. (That one screen is
since two: the bag kept the tab and the shop moved to Town — see the entry near the end of this
file. Nothing in `core/gear/` changed with it.)

### 1. Every bonus is a percentage, and that decision made the rest easy

A flat `+400 atk` authored against a level-40 stat block is invisible against a curve worth ×10⁹, so
flat gear needs its own exponential and then needs re-tuning every time the ladder extends. That is
the failure milestone 10 had just finished deleting from the enemy side of the board.

⚠️ **The stronger argument is the identity.** `simulate.spec.ts` asserts that scaling both sides by a
common factor leaves the whole simulation unchanged; that is what let milestone 10 rescale everything
by ×10⁹ without touching the ninety-second timer or the faction matrix. A percentage is a
multiplication, so it commutes with that rescale and the identity survives untouched. **A flat bonus
is an addition, and an addition is exactly what the identity forbids.** Anything proposed later that
adds rather than multiplies has to answer this.

### 2. The roster's eight roles became five, and role stopped being inert

Gear gates on archetype, and the roster already had a `CharacterRole`. Rather than mint a parallel
five-value enum plus a mapping to keep in sync, the eight roles were collapsed to the five the brief
asked for — `assassin` folded into `brawler`, `sniper` into `ranger`, `healer` into `support`. All
three were distinctions with nothing downstream of them: each is a statement about a **kit**, and the
kit says it more precisely than a label can. This project already carries three meanings of "rarity",
which is the argument for not adding a fourth near-synonym.

⚠️ **This reverses a comment that said keeping role inert was the point**, and the reversal is
deliberate rather than an oversight. That comment was about **placement**: a role that gates which
rank a character may stand in lets an unlucky roster reach a state with no legal party, which is why
milestone 4 rejected role-locked ranks. Gear gating is a different question, and the difference is
what makes it safe — **a piece the party cannot wear is fodder, not a dead end.** It enhances
something else at full value on the turn it drops. There is no roster this gate can make unplayable.

**The cost is real and worth naming**: the roster screen no longer says "healer" about the seven
characters that heal. What tells a player Cirien heals is Cirien's skill list.

### 3. The zero-timeout guard caught a real regression, and the measurement is the interesting part

The defensive half of the gear profiles was authored at twice what shipped, and the ladder sweep went
red on `c2-s23` — a fully geared party running the ninety seconds out against a stage it could not
beat. That is the stall class 8c's timer exists to bound, and exactly what the guard is for.

The instinct was to shrink the whole gear budget. **The measurement said something better.** Sweeping
the ladder with the defensive share at ×1, ×0.5 and ×0 clears **75, 74 and 74** stages — so defence
was buying one stage in the fights the party wins and a ninety-second stall in the ones it loses.
That follows from the damage formula: `atk² / (atk + def)` has sharply diminishing returns once the
attacker's `atk` outruns the defender's `def`, which is the situation on every stage tuned above the
party, while `def` and `hp` multiply each other to extend a fight nobody is going to win.

Halving defence keeps it as an identity — a tank's is still more than twice a mage's — and took the
longest fight in the sweep from 90.0s to 54.2s. **Scaling the whole budget would not have worked**:
the probe shows ×0.5 and ×0.65 both stall somewhere too, because a party sitting exactly at its
damage threshold against a stage always produces some long fights. The dial was the ratio, not the
size.

⚠️ Worth keeping: **win rate near a damage threshold is a step function**, which 8e already recorded
about the matchup matrix. A continuous power dial like gear will always land some configuration on a
threshold; what the guard is really asserting is that no _reference_ party does.

### 4. Gear material is a currency, because the alternative throws drops away

"Enhance this piece using those pieces" was the brief, and consuming item instances directly is the
obvious build. It has one failure: auto-battle clears a stage a minute and every clear drops, so an
evening is thousands of item records in a save the repair pass walks on every load. Bounding the bag
then means **throwing drops away**, which is the one outcome this project's economy rules out
everywhere else — a pull can never produce nothing, and neither should a fight.

`alloy` is the sixth currency and the second with no idle rate. Spark is the precedent and a close
one: both are what a duplicate becomes when there is nothing left to do with the object itself. The
bag holds what the player chose to keep, overflow is worth exactly what it would have been as fodder,
and the screen still offers the action as one tap.

**It cost the offline invariant its timeout margin**, which is worth recording because it is the kind
of thing that looks like a flake. `credit` loops over the wallet, so a sixth currency is 13% more work
in the hot path — measured at 313ms → 354ms uninstrumented — and `offline.spec.ts`'s 360,000-tick
replay was already at ~98% of vitest's 5s default under v8 coverage. The case now carries an explicit
30s timeout. **Do not shrink the replay to fit**; the step count is what makes the project's
highest-value invariant mean anything.

### The save chain has its first real migration

`SAVE_VERSION` went 0 → 1, purely additive. The alternative was to widen v0 in place — nobody outside
development has loaded one, so it would have been legal under the same argument the reset itself ran
on — and it was declined. **The chain walker has been sitting proven and unused since the reset
specifically so the first real migration would land on tested code**, and taking the free option here
would have deferred that to a day when it was urgent.

⚠️ **The reset burned version numbers and this re-issued the first of them.** The old v1 was milestone
1's gold counter; this v1 is the gear schema, and a build cannot tell them apart from the number
alone. That is safe for exactly one reason, and it is the reason the reset was licensed: no save
carrying the old meaning has ever existed outside development. It is **not safe in general**, and it
is the cost of re-basing that is easiest to forget. `migrate.spec.ts` states it as behaviour so it
cannot be rediscovered by accident.

### What this leaves for later

**Enemies wear no gear, and are not planned to until chapter 10** — which does not exist. That is the
point of the milestone rather than a gap: a geared party flies through content tuned for an ungeared
one, which is what makes gear feel like progress. When chapter 10 arrives, the shape to reach for is
the one milestone 10 established — fold the expected gear budget into the enemy's stat block or its
level, rather than building a second equipment system on that side of the board.

**Nothing chapter-gated arrived with it.** Milestone 11 left "a chapter-completion reward is a real
idea and belongs with something to spend it on — milestone 12 or 14". Gear gave it something to spend
on and it still was not built, because a chapter boss already pays four drops and a crystal
multiplier. It belongs with 14's claim ledger, which is the machinery it actually needs.

## 13. Settings, and the save-safety gap — **COMPLETE**

A small milestone that clears a backlog. Three things had been waiting on a settings screen — the
run reset, combat speed defaults, and somewhere to put whatever accumulates next.

Shipped: `/settings` and a sixth tab; `ui/settings.service.ts` persisting preferences to a key of
their own; battle speed as a **sticky setting** rather than a per-fight control; `ui/reset-dialog.ts`,
the app's first CDK overlay; and `GameLoopService.reset`. **No save migration** — the settings are
not in the save, which is the decision the rest of this section is mostly about.

**Export/import was considered and declined**, and the reasoning below is unchanged: platform backup
already covers the common loss, and a manual export is something most players would not do until
after they had already lost the run. The gaps are recorded so nobody mistakes "it is in iCloud" for
"it is safe".

### Settings are a second key, not a field on the save

The obvious place to put a preference is `GameState`, and it is the wrong one for two reasons that
only become visible once the reset exists beside it.

**A preference describes the app; a save describes a run.** Put them in one blob and resetting the
run also resets how fast battles play — which nobody asked for, and which the confirmation dialog
would then have to admit to. Worse, a save this build could not read would take the player's
settings down with it, for no reason at all.

**It also keeps the save chain out of it.** Every setting added later would otherwise be a
`SAVE_VERSION` bump and a migration and a fixture, for a value nothing in `core/` ever reads. The
chain is expensive on purpose — see the note on v1 re-issuing a burned version number — and
spending it on a playback speed is not what it is for.

**There is no version field on the settings, and that is a decision rather than an omission.** The
save carries one because its fields are interdependent: a wallet without its rates is a broken run,
so it needs a chain that can restate the whole object. Settings are the opposite shape — every field
is independent, optional, and has a default that is always correct — so the repair is **per field,
on read**. An unrecognised value becomes the default, an unknown field is ignored, and a missing
field defaults. That subsumes migration in both directions for free. The bar for revisiting it is a
key whose old and new meanings **collide**, which is the exact trap `SAVE_VERSION` 1 records; the
answer there is a new key, not a version number.

### The speed is sticky, and that makes it one value rather than two

The battle screen's 1×/2×/4× buttons and the settings screen's radios write to the same
`SettingsService` value. Nothing has to be kept in step because there is only one of it —
`BattleService.playbackSpeed` **is** the setting's signal, not a copy of it.

The alternative was a "default speed" that in-battle taps did not write back. It was rejected on the
grounds that the speed a player wants is a property of the player rather than of the stage in front
of them, and a 4× that had to be re-tapped every fight is a setting pretending to be a control.

One ordering bug is possible here and is guarded: the read is asynchronous while the battle screen
is already live, so a stored speed arriving after the player has tapped one would silently overrule
them. `SettingsService` drops the late read instead.

### The reset had the trap the notes promised

`SaveService.clear()` existed, was documented, and had one test. Making it reachable was not the
work; **replacing the in-memory run was.** The loop owns the authoritative state and writes it back
on autosave and on `visibilitychange`, so a reset that only emptied storage would look correct until
the app was backgrounded and then hand the old run back.

`GameLoopService.reset` therefore does four things in an order that is itself the argument:

1. **Stop the loop**, so no frame, autosave or visibility handler can write the old run back
   part-way through.
2. **Clear both slots.** `clear()` drops what is queued and waits for a write already in flight.
   Clearing _before_ writing is also what keeps the old run out of the **backup** slot — a write
   copies the primary across first, and there is nothing to copy once both are gone.
3. **Replace the state**, through the same content-aware repairs a loaded run goes through.
   `newGame` cannot seed a roster or a crystal rate, because `core/` cannot see the content that
   decides either.
4. **Persist immediately**, so the reset survives the app dying before the first autosave.

The end-to-end test backgrounds the page on purpose after the reset, having first emptied the save
key — so what the app writes next can only have come from what it is holding. That is the assertion
a unit fake cannot make.

**A fresh run is its own confirmation**, so the screen navigates home rather than showing a toast.
Stage 1-1 and an empty wallet say it happened in a way no message would.

### The first CDK overlay, and what it corrected

The dialog is the first thing in this project to use `@angular/cdk`, which has been installed and
unused since milestone 6. Three things came out of wiring it up:

- **The two prebuilt global stylesheets are no longer needed.** The note in `AGENTS.md` said to add
  `a11y-prebuilt.css` and `overlay-prebuilt.css` when the first overlay landed. CDK 22 self-loads
  both through `_CdkPrivateStyleLoader`, so nothing was added to `angular.json` and the overlay
  renders correctly regardless. The old advice was true and had gone stale, which is the general
  lesson: read `node_modules` before believing a dependency needs configuring.
- ⚠️ **CDK's default scroll strategy is wrong for this shell.** Blocking scroll works by putting
  `position: fixed; overflow-y: scroll` on `html` — a fix for a document that scrolls, and this one
  deliberately never does. It is replaced with `createNoopScrollStrategy()`; the backdrop already
  stops a touch reaching the screen underneath.
- **`aria-modal` is off by default.** CDK supplies `role="dialog"` and `aria-hidden` on everything
  behind it, but the flag that tells a screen reader the boundary is real has to be asked for.

**Cancel is first in the DOM**, so CDK's initial focus lands on the harmless button. A player who
opened the dialog by mis-tapping can dismiss it with the tap already in flight.

Testing focus restoration turned up a browser difference worth recording: **WebKit does not leave
focus on a button it was clicked on.** That is a platform convention rather than a bug, and it means
a mouse-driven restoration test asserts nothing there. The test opens the dialog with `Enter`, which
is both the state a keyboard user is in and the only way the assertion means something in all three
browsers.

### The tab bar is full

Six tabs is what fits across a 375pt phone at a legible label size — measured, not guessed: the
widest label is 52px inside a 63px tab. At 320pt it is tight but still one line per label.

**A seventh entry is not the answer.** It would have to shrink the text past reading or drop it, and
a row of unlabelled glyphs is a puzzle rather than navigation. The next screen needs a different
shape: a "more" tab that opens a list, or moving settings off the bar entirely and onto a control in
a screen header — the second is what most games this size do, and it frees a slot for something a
player uses more than once. That decision belongs with the milestone that needs the seventh screen,
which is 14.

> **Answered early, and differently — see [Town](#not-a-milestone-town-is-the-hub-the-tab-bar-needed)
> below.** The shape that landed is a hub rather than either option above, and it arrived before 14
> rather than with it.

### Saves are already backed up, which is not the same as safe

Verified rather than assumed. `@capacitor/preferences` on iOS writes to `UserDefaults.standard`,
which lands in `Library/Preferences/<bundle>.plist` — inside the backed-up part of the app
container. Android's manifest already carries `android:allowBackup="true"`, so Auto Backup covers
SharedPreferences. **Both platforms back up player saves today, with zero code.**

| Scenario                                   | iOS | Android |
| ------------------------------------------ | --- | ------- |
| New device, restore from backup at setup   | ✅  | ✅      |
| Device erased and restored                 | ✅  | ✅      |
| **App deleted, then re-downloaded**        | ❌  | ✅      |
| App _offloaded_, then re-downloaded        | ✅  | ✅      |
| Backup disabled, or the account over quota | ❌  | ❌      |
| Moving between iOS and Android             | ❌  | ❌      |

**The decision is to rely on this and build nothing.** It covers the common real loss — getting a
new phone — and export/import is manual enough that most players would not use it until after
they had already lost the run.

The gaps are recorded so nobody later mistakes "it is in iCloud" for "it is safe". Deleting an
app on iOS destroys its container, and iOS never restores per-app data on re-download; iCloud
Backup restores at device setup and nowhere else. **"Offload App" preserves data and looks
identical to the player**, which is exactly how this gets misdiagnosed as working. And iCloud's
free tier is 5GB, so a large share of users sit over quota with backups that have silently not
completed in months.

The trigger to revisit is a real report of a lost run, not a hypothetical. Two answers exist:

- **Export/import.** Covers every row above including cross-platform, needs no account and no
  network. It has no downside here that it would have elsewhere: the usual objection is save
  editing and duping, and this project has **no anti-cheat by design** — a player editing their
  own save affects only their own run. The standard reason to resist it does not apply.
- **`NSUbiquitousKeyValueStore`.** Closes the iOS reinstall row automatically — 1MB and 1024 keys
  against a save needing a fraction of it. Costs an iCloud entitlement, an Apple ID dependency,
  and network sync, which is a real tension with "no server, no accounts, no network calls".
  Decide it as one rather than absorbing it quietly, and note it leaves Android needing its own
  answer.

⚠️ **The backup path is still unverified on real hardware, and the table above is therefore read
from the platform docs rather than from a device.** This was scoped into the milestone and is the
one part of it not done: it needs a physical phone and a restore, which is not something the test
suite can stand in for. It costs one restore and it is the only way to know the table survives
contact with a device — the same argument milestone 6 made for running on a phone early, which
found a bug nothing else would have. Carry it forward rather than dropping it.

## 14. Dailies, bounties, and a reason to open the app tomorrow

Nothing currently rewards opening the app except idle income the player would collect anyway.

**The retention framing undersells it: quests are a faucet that is not stage-gated.** A player
stuck below a wall has exactly one income source today, and it is the thing the wall is
throttling. Dailies pay whether or not the ladder is moving, so being stuck stops meaning being
stopped — which matters more in a game with no way to buy a way past.

Scope: daily quests that reset, a weekly tier, and one-off achievements over counters `GameState`
already keeps — stages cleared, pulls made, characters ascended, levels reached. What is missing
is the claim ledger and the reset clock.

**The reset clock is the hard part, and it is a `core/` purity question.** Core has no clock —
time is a parameter passed in from `ui/`, exactly as `resume(state, nowMs)` takes it. A daily
reset boundary is therefore supplied by the caller and never read from `new Date()` inside the
simulation. The backwards-clock rule applies unchanged: a device clock that moves back must not
hand out a second day of rewards and must not punish either. Clamp; do not detect. There is
nothing to protect.

### The bounty board

Dispatch characters on timed missions that pay out on a clock. It belongs in this milestone
rather than its own because it needs exactly the machinery dailies already build — a claim ledger
and a caller-supplied time boundary — and building that twice would be the waste.

It earns its place for a reason dailies do not cover: **it is the only system that pays you for
characters you are not fighting with.** Dispatched characters come off the bench, so a wide roster
becomes worth something before faction bonuses or towers ask for it, and a duplicate-heavy run has
a use for breadth from the moment it starts. It is also the gentlest return hook in the genre — a
mission finishing in four hours is a reason to come back that costs the player nothing if they
do not.

Keep dispatch and the formation **disjoint**: a character cannot be both fighting and away. That
is what makes it a bench sink rather than a free resource tap, and it is the whole of the design.

### Local notifications

`@capacitor/local-notifications` schedules **on-device** — no network, no account, no server — so
it is compatible with the offline constraint in a way push notifications never could be.
Schedule on background, cancel on foreground.

**Removing the offline cap removed the only earned reason to send one, and that is worth facing
rather than working around.** The justification used to be that the ten-hour ceiling was a real
event with a real cost to ignoring it — income you had stopped accruing. With no cap, staying
away costs nothing. Nothing is lost, so there is nothing to warn about.

What is left is weak and should be judged as weak. A finished bounty is the only candidate, and
even that is not a real cost: a completed mission sits there indefinitely, so the player loses
nothing by not hearing about it.

**So the default is to ship no notifications at all.** The rule this project holds everywhere else
is that a notification existing to manufacture a session is the pattern it rejects — and once
absence is free, every notification is that pattern by definition. Reintroduce them only if some
future system creates a genuine cost to being away, and note that such a system would itself be
worth questioning.

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

Standard in the genre, and they arrive by reflex. Listed so that not having them is visibly a
decision rather than an oversight.

- **Limited-time banners and event FOMO.** Manufactured scarcity with no bridge to sell — the
  exact pattern the balance philosophy rejects. A banner may rotate; it may not expire in a way
  that costs a player something they can never get back.
- **Energy or stamina gates on modes.** This is already a time economy. A second one only
  subtracts, and it exists in paid games to sell refills.
- **Guilds, co-op bosses, friend lists.** Ruled out by "no server, no accounts" and "no social
  comparison". They carry a great deal of the genre's retention, so the honest position is that
  this game replaces them with nothing and accepts the cost — not that the gap is not there.
- **Login streaks that punish a miss.** A streak that resets is a scarcity mechanic wearing a
  generosity costume. Cumulative login rewards are fine; escalating ones that reset are not.

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
