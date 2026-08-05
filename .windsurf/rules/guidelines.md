# Project

A 2D incremental idle RPG for mobile (iOS-first, Android secondary): gacha pulls, idle
progression, team building, stage climbing. Solo dev project.

Stack: TypeScript, Angular 22 (zoneless), Capacitor 8. No backend, no UI framework — the
screens are hand-written components over the palette in `src/ui/theme.scss`.

---

## Design constraints (do not violate)

These are product decisions, not preferences. Do not propose changes to them and do not
write code that assumes otherwise.

- **Completely free. No IAP, no ads, no monetization of any kind, ever.** Do not add
  purchase flows, ad SDKs, receipt validation, "premium currency you can buy", or
  paywalls. There is no way to whale.
- **No server, no accounts, no network calls.** The game runs fully offline. Do not add
  HTTP clients, auth, telemetry, or remote config. `@angular/common/http` should not
  appear in this project.
- **No PvP, no leaderboards, no social comparison** in v1. Power is measured against the
  game's own content, not other players.
- **No anti-cheat.** A player editing their own save affects only their own run. Do not
  add obfuscation, checksums-as-security, or tamper detection.

Balance philosophy: this is a **time economy**, not a money economy. Commercial gacha
tuning (0.6% rates, 90-pull pity, manufactured scarcity) exists to sell a bridge across a
gap it creates. There is no bridge to sell here, so generosity is free. When suggesting
rates or pacing, err generous. Pity and duplicate-conversion are mandatory — an unlucky
player has no escape valve, so bad luck must be bounded. Both shipped in milestone 3: pity is
global and always on screen, and duplicates are the primary ascension path rather than a
consolation prize — a pull can never produce nothing.

---

## Reference documentation

Long-form references live in `docs/`. This file states rules; those files explain systems. When
the two disagree, the code is right and both are stale.

- **[docs/milestones.md](../../docs/milestones.md)** — the roadmap. The status of every milestone, what
  each one shipped, and the reasoning behind each decision. **Single source of truth for project
  status**; nothing else restates it.
- **[docs/glossary.md](../../docs/glossary.md)** — the vocabulary, and specifically the words that mean
  more than one thing. Read this before writing prose about tiers, rarities or factions — several
  terms collide by design and the collisions are listed there.
- **[docs/attributes.md](../../docs/attributes.md)** — the combatant stat block, which stats may scale
  and why, and what the milestone 8a collapse to one `atk` and one `def` cost.
- **[docs/ascension.md](../../docs/ascension.md)** — the rung ladder, the two ascension paths, and how
  rung prices resolve recursively into base copies. Since milestone 8c three of the rungs also hand
  over a skill.
- **[docs/combat.md](../../docs/combat.md)** — the ATB loop, the damage formula, targeting, skills,
  energy and ultimates, statuses, the event log, and the RNG draw discipline. **Rules marked ⚠️
  there are termination arguments, not balance knobs** — relaxing one lets `simulateBattle` fail to
  return.
  - **A fight is ninety seconds and running the clock out is a defeat.** There is no draw
    outcome; `MAX_BATTLE_TICKS` is the timer, and it is a rule of the game as much as a guard.
    The headroom over the longest tuned fight is **1.66×**, so a stage that takes longer than
    ninety seconds against the party it is meant for is unclearable — treat the timer as a budget
    every encounter has to fit inside, and expect the balance sweep to say so first. It was 1.9×
    until milestone 8e spent most of it on the mono-faction fives, and milestone 10 handed some
    back by re-authoring every archetype at level 1 — the old blocks had HP that far outgrew their
    attack, and a less spongy encounter resolves sooner. **The rescale itself moved it not at all**:
    scaling both sides by the same factor is an identity on fight length in ticks.
  - **The headroom assertion measures fights a party _clears_, and that scope is load-bearing.**
    A fight the party loses has no tuning claim on it — the margin exists so a stage stays
    clearable by the party it was tuned for. Losing fights are bounded separately, at 95% of the
    timer, and by the zero-timeout guard below. Do not widen the headroom assertion back to every
    fight in the sweep: it would fail on parties nothing is tuned for, which is not what it is
    for.
  - One termination argument lives outside `core/`: milestone 8b deleted the MP pool that
    guaranteed a fight against a healer resolves, so an assertion in the balance sweep stands in
    its place. It reads **`BattleResult.timedOut`, not the outcome** — a timeout and a wipe are the
    same `defeat` on screen, so an outcome-based version of that guard silently tests nothing. Do
    not rewrite it in terms of the outcome, and do not narrow it to the parties that win.
- **[docs/gear.md](../../docs/gear.md)** — the third progression axis, added in milestone 12: five slots,
  five archetypes, a five-rung grade ladder, and an hourly forge.
  - ⚠️ **Every gear bonus is a percentage of the wearer's own stat, never a flat quantity.** A flat
    bonus is invisible against a levelling curve worth ×10⁹, and — the stronger argument — it is an
    **addition**, which is exactly what the whole-board rescale identity forbids. Anything proposed
    later that adds rather than multiplies has to answer this.
  - ⚠️ **The defensive share of the profiles is half what it looks like it should be, and that is a
    termination argument.** At twice the size a fully geared party ran the ninety-second clock out
    on `c2-s23`. Sweeping the ladder at ×1, ×0.5 and ×0 defence clears 75, 74 and 74 stages — so
    defence bought one stage in the fights the party wins and a stall in the ones it loses. Do not
    put it back without re-running `npm run test:balance`.
  - ⚠️ **Boots move `haste`, so gear inherits the clamp argument in `roster/stats.ts`.** The bound is
    a percentage sized so the fastest character reaches about 236 against an `ATB_THRESHOLD` of 1000,
    and `data/gear.spec.ts` **derives** it from the shipped profiles rather than restating it.
  - **Archetype gating is safe where placement gating would not be**, and the distinction is the
    whole of it: a piece the party cannot wear is **fodder**, not a dead end. This is what makes
    `CharacterRole` load-bearing without re-opening milestone 4's "no legal party" failure. The eight
    roles collapsed to five here; `healer` folding into `support` is the visible cost.
  - **Alignment is a bonus, never a restriction**, and it does not favour mono-faction parties —
    matching one character is one chance in eight either way.
  - **The shop's stock is derived from the seed and the refresh index, never stored.** That is what
    makes rerolling impossible rather than merely detectable, which is worth far more in a project
    with no anti-cheat. The refresh index is supplied by `ui/`; `core/` still has no clock.
  - **Drops roll from a derived sub-stream**, never the main one. Otherwise fighting a stage shifts
    the gacha sequence.
- **[docs/economy.md](../../docs/economy.md)** — the six currencies, income rates, the level curve,
  pull rates and pity, and offline accrual. **Since milestone 11 no rate is authored per stage**:
  income is `base × stageIndex ^ 1.13`, evaluated by `stagePayout` in `core/ladder.ts` from four
  coefficients in `data/chapters.ts`. The exponent is calibrated so a stage pays roughly what the
  old hand-tuned ladder paid at the same **enemy level**, which is what stops a longer ladder from
  meaning a richer one.
- **The ladder is chapters, and where a run is, is a chapter and a stage within it.** Read
  [`core/ladder.ts`](../../src/core/ladder.ts) before touching progression.
  - ⚠️ **`GameState.stage` is the stage within its chapter, not a position on the whole ladder.**
    It was one until milestone 11 and it kept its name, so reading it as a linear index is a bug
    that presents as a player being teleported — chapter 2 stage 3 and chapter 1 stage 3 are the
    same number. `stageIndex(ladder, position)` is the only way to a linear index, and it is what
    the clear count, the crystal rate and the reward curve are all functions of.
  - **The position is a pair and `clearedStages` is a count, and the asymmetry is deliberate.** A
    position is a _place_ and has to survive the ladder being re-cut around it; a clear count is a
    _quantity earned_ and means the same thing however the chapters are sliced.
  - **The chapter-size formula and the authored chapters are two statements of one fact.**
    `chapterSize` says how long a chapter should be and `LadderShape` says how long the authored
    ones are; `chapters.spec.ts` is what keeps them equal. Never derive the shipped ladder's length
    from the formula — a build that ships two chapters must not be talked into believing it has a
    hundred.
- **[docs/level-resonance.md](../../docs/level-resonance.md)** — the level the whole roster shares, added
  in milestone 9. Read it before writing anything that reads a character's level.
  - **`OwnedCharacter.level` is the level the player _paid for_, not the level anything fights at.**
    The effective level is `min(levelCapFor(rarity), max(investedLevel, resonanceFloor))`, derived
    on read and stored nowhere. Reading `owned.level` where the effective level belongs is a bug
    that presents as nothing at all — every screen keeps saying the right number while the battle
    resolves at the wrong one. That is why `toBattleCombatant` takes the level as an **argument**
    rather than reading it off the entry, and why the argument is required rather than defaulted.
  - **Levelling is charged from the effective level**, so nobody pays twice for what the floor
    already gave them. `levelUp`, `levelUpToAffordable` and `resonancePlan` all agree because all
    three go through `effectiveLevel`.
  - The **rarity cap still binds**, which is the clause that keeps ascension worth paying for. Do
    not relax it to make the bench feel better; it is the only thing resonance leaves individual.
- **[docs/saves.md](../../docs/saves.md)** — storage, the migration chain, load-time repair, and
  fixtures. **`SAVE_VERSION` is 1 since milestone 12**, and v0 → v1 is the first entry the chain
  walker has ever had to walk.

## Milestones

The ordering exists so there is **always something playable**. Each milestone layers onto the
previous skeleton without changing its shape. Do not skip ahead: a later milestone built on an
unverified earlier one is where the hard-to-find bugs live.

Before starting work, check where the project actually is. **Do not assume the doc is current —
verify against the code.**

Read it before starting a milestone, and specifically before:

- reaching for **`@capacitor/app`** or a **run reset** — each is deliberately deferred, and the
  doc records the condition that has to be met first. **Angular Material is not deferred, it is
  removed**: it was uninstalled in milestone 6 after its scaffolded global theme turned out to be
  the cause of the app's broken first appearance on a real phone. Do not reinstall it.
  `@angular/cdk` is a separate question and the answer is different — see the accessibility
  section below;
- building anything that fights on its own — "auto-battle" means two separate features, and only
  one of them is built. The **unlockable repeat** shipped in milestone 7: it is foreground-only,
  it commits and persists at the end of every fight, and switching it off when the app leaves the
  foreground is a correctness requirement rather than a courtesy (see "Offline progression").
  **Ambient sparring on the idle screen is still deferred** and must never award anything;
- adding the **segmented offline solver**, `timeToClear`, or a `dropCarry` field — all three are
  cancelled rather than pending, and the doc records why each one stopped being needed.

---

## Architecture

```
src/
  core/   Pure TypeScript. The entire game simulation.
  data/   Content as plain data: characters, enemies, stages, upgrades, banners.
  ui/     Angular components and services that wrap core/.
```

### The `core/` boundary is the most important rule in this repo

`core/` MUST NOT import from:

- `@angular/*` (including signals — signals are an Angular concept)
- `@capacitor/*`
- `@ionic/*`
- `src/ui/*`
- any DOM API (`window`, `document`, `localStorage`, `navigator`)

`core/` must run headless in Node. This is what makes balance testable by simulating
thousands of hours instead of playing them. Enforced by ESLint `no-restricted-imports`;
do not disable that rule.

`data/` is plain data only — no logic, no imports from `core/` or `ui/`.

`ui/` may import from `core/` and `data/`. Never the reverse.

### Core is pure and deterministic

- Expose pure functions. Shipped: `tick(state, dtMs) => state`,
  `resume(state, nowMs) => { state, report }`,
  `simulateBattle(party, stage, seed, rules) => BattleResult`,
  `applyBattleResult(state, result, stageCount) => state`,
  `pull(state, banner, count, ...) => { state, results }`,
  `ascend(state, defId, plan, ...) => RosterResult`,
  `levelUp(state, defId, targetLevel, curve) => RosterResult`,
  `raiseResonance(state, target, curve) => RosterResult`. Nothing is planned but unbuilt —
  `timeToClear(state, stage)` was, and is cancelled; see [milestone 5](../../docs/milestones.md).
- Return new state; do not mutate arguments in place.
- **Never call `Math.random()`.** Use the seeded PRNG in `core/rng.ts`. Seed and call
  counter live in the save.
- **Never call `Date.now()` or `new Date()` inside `core/`.** Time is a parameter passed
  in from `ui/`. Core has no clock.
- Derive a sub-stream for combat so replaying a battle does not shift the pull sequence.
  **This is already built — do not write your own.** `core/rng.ts` exports:
  - `resumeStream(state.rng)` — the main stream, resumed at `calls` in O(1). Draw from this
    for pulls, then write `stream.commit()` back into state so `calls` advances.
  - `deriveSeed(seed, label)` and `derivedStream(seed, label)` — independent sub-streams.
    Use `deriveSeed(state.rng.seed, \`battle:${stageId}:${battleCount}\`)` for combat.

  Pulls advance `state.rng.calls`; combat never does.

Keep the simulation **server-ready but do not build a server.** Determinism is for
reproducible bugs and replayable balance runs.

---

## Simulation and change detection

The app is zoneless. The sim clock and the render clock are separate.

- Sim ticks ~10Hz inside `runOutsideAngular`.
- UI samples state into a signal at ~6Hz.
- Components read `computed()` values off that snapshot. Never push every state mutation
  into the view layer.
- Do not drive combat off the render tick. Battles resolve instantly and headlessly into
  an event log; the UI animates the log afterward. This is what makes 2x/4x/skip and
  offline resolution free.

---

## Saves

- `@capacitor/preferences` is the persistence layer. **Do not use `localStorage`** — on
  iOS, WKWebView local storage lives in a cache-class container that the OS can purge
  under storage pressure, which loses player saves.
- Every save carries a `version`. Bumping `SAVE_VERSION` without adding the matching
  migration is a bug.
- Migrations are pure `(old) => (new)` steps, chained. **Never delete or edit a migration once a
  build carrying it has reached a player** — they can return after any number of releases and
  their save has to walk the whole chain.
  - **`SAVE_VERSION` is 1.** Five versions and four migrations were collapsed into a v0 baseline
    while the game was pre-release, on the one argument that licenses it: no save any of them wrote
    has ever existed outside development. [saves](../../docs/saves.md) records the reset and the condition
    — a player loading a save — that closes the door on repeating it. The chain walker was kept and
    tested against a synthetic history through the whole v0 era so that the first real migration
    would land on proven code, and milestone 12's additive v0 → v1 is what it was kept for.
  - ⚠️ **The reset burned version numbers and v1 re-issued the first of them.** The old v1 was
    milestone 1's gold counter; this v1 is the gear schema, and nothing can tell them apart from the
    number alone. Safe only because no save carrying the old meaning exists outside development —
    **not safe in general**, and the cost of re-basing that is easiest to forget.
  - **A save this build cannot read is discarded and written over**, and the fresh run persists
    normally. `fatal` reports it on the home screen and drives the backup-slot fallback; it no
    longer gates persistence. The protection it used to give — a newer build's save surviving a
    downgrade — cost a game that boots, plays and silently never saves, which is the worse failure
    and the one a player actually hits.
- Loading must not throw on recoverable damage. Clamp and default (`NaN` gold becomes 0,
  unknown character IDs are dropped) rather than rejecting. A thrown error costs the
  player their entire run. Write to a backup slot before overwriting the primary.
- Persist on `visibilitychange`. `beforeunload` is unreliable in a WebView and iOS can
  suspend without warning.
- Keep fixture saves for each historical version in `src/core/save/fixtures/`, with a test
  that migrates every fixture to current.

---

## Offline progression

**Never replay offline time step by step.** Twelve hours at 10Hz is 432,000 iterations on
resume and will hang the device. Three cases:

1. **Continuous, fixed rate** (gold, stamina, XP) → closed form: `rate * elapsedSec`. **This is
   the only case this game has**, and `resume()` in `core/offline.ts` is it.
2. **Continuous, rate changes mid-window** (auto-progression advancing stages) →
   _segmented_ closed form. Solve time-to-clear per stage and loop over segments (~single
   digits of iterations), never per tick.
3. **Discrete drops** → expected value with deterministic rounding, carrying the
   fractional remainder in the save. **Do not roll RNG for offline loot** — it invites
   force-quit rerolling, and expected value reads as fair to players.

**Cases 2 and 3 do not arise and are not to be built.** Auto-battle is foreground-only, so no
stage clears while the player is away and no rate ever changes mid-window; and nothing drops
while they are away, so idle income is the four continuous rates and nothing else.

**"Foreground-only" is enforced in one line and it is load-bearing.** `BattleService` listens for
`visibilitychange` and switches the loop off on hide. Without it a hidden tab — which still steps
the animator at roughly 1Hz, clamped to a second per step — would keep climbing the ladder
unattended, and a rate that rises mid-window is exactly what makes the closed form wrong. Do not
"improve" this into a pause that keeps fighting. They are
documented because they are the right techniques _if_ those product decisions are ever reversed
— which would re-open [milestone 5](../../docs/milestones.md). Do not implement either speculatively,
and do not add a `dropCarry` field.

**There is no offline cap.** Come back a year later and the game pays a year. This is deliberate
and it is not to be reintroduced: the genre caps offline earnings to force a daily session, which
is the exact opposite of this game's pitch. It also costs nothing to allow — the closed form is
O(1) in elapsed time, so a year settles as fast as an hour, and `Numeric` is already a
`break_infinity` Decimal, so the quantities do not overflow.

Clamp elapsed to `[0, ∞)`. A negative delta means the device clock moved backwards; clamp to zero
rather than punishing. Do not add clock-tamper defenses — there is nothing to protect.

**The cap used to bound a damaged `lastTickAt`, and that job now needs doing on purpose.** A
timestamp of zero is finite and yields a positive delta, so it passes every guard `resume()` has
and would pay out decades of income — silently wrecking a run's pacing without the player ever
choosing it. Treat an implausible timestamp as damage rather than as an absence: anything
predating the project is corruption, and pays zero exactly as a non-finite delta does.

---

## Mobile / Capacitor

- `ios/` and `android/` are **committed source, not build artifacts.** Capacitor generates
  them once and never regenerates. Edit them; do not delete and re-add.
- `cap sync` copies web assets and updates native plugin deps. It does not touch signing,
  build settings, or capabilities.
- Prefer `capacitor.config.ts` over per-platform Xcode/Android Studio settings when the
  option exists in both.
- Do not edit `android/app/src/main/assets/public/` or `ios/App/App/public/` — generated.
- **Code-signing identity lives in `ios/signing.xcconfig`, which is git-ignored.** `DEVELOPMENT_TEAM`
  is deliberately absent from `project.pbxproj`; `ios/debug.xcconfig` and `ios/release.xcconfig`
  pull it in with `#include? "signing.xcconfig"` — the optional include, which Xcode skips without
  complaint when the file is missing, so a fresh clone builds and is simply asked for a team.
  Copy `ios/signing.example.xcconfig` to set yours up.

  The reason for the indirection, and the thing to know before "simplifying" it: with
  `CODE_SIGN_STYLE = Automatic`, choosing a team in Xcode's Signing & Capabilities tab writes
  `DEVELOPMENT_TEAM` **straight back into `project.pbxproj`**. Advice to "leave it unset in the
  shared project and just set it locally in Xcode" therefore does not stick on its own — the
  xcconfig is what makes it stick. If the line reappears in the project file, delete it there and
  put the value in `signing.xcconfig`; do not commit it.

  A team ID is an identifier, not a credential — it is the App ID prefix and ships inside every
  app Apple distributes, and it signs nothing without the private key in your keychain. So this
  is an ergonomics fix, not a secret-handling one. Do not treat a leaked team ID as an incident.

- Build order matters: `ng build` → `cap sync` → open. Syncing before building ships stale
  assets.
- Android needs a system back-button handler (`@capacitor/app`) that pops modals and
  navigates up, exiting only from the root. iOS has no equivalent.
- Safe-area handling is `env(safe-area-inset-*)` CSS on both platforms (Capacitor 8 moved
  Android edge-to-edge to the same mechanism). **Never write `padding: env(safe-area-inset-top)`.**
  The single-value shorthand reads as though it targets one side and does not — it puts the _top_
  inset on all four, which is a 59px gutter down both edges of an iPhone. This shipped, and it is
  what made the app's first run on real hardware look broken. Use the longhand
  (`padding-top: env(safe-area-inset-top)`); the only shorthand that means what it looks like is
  the fully spelled-out four-value form:

  ```css
  /* wrong — 59px on every side */
  padding: env(safe-area-inset-top);
  /* right */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);
  ```

  The trap generalises to any `env()` or `var()` in a shorthand: the value names a side, the
  property does not know that.

- **The document must not scroll; a container inside it does.** `html` and `body` are
  `height: 100%; overflow: hidden`, the shell is a flex column, and `main` is the scroll
  container. That removes iOS rubber-banding of the whole page and, with it, the reason to reach
  for `position: fixed` — a fixed element lays out against the _visual_ viewport, so it keeps
  filling the screen when the document does not, and any layout bug elsewhere then presents as a
  broken tab bar.
- **Set `backgroundColor` in `capacitor.config.ts`.** Left unset, `CAPBridgeViewController`
  falls back to `UIColor.systemBackground` — white in light mode — and that is what shows before
  the first paint and anywhere web content does not reach.
- Capacitor 8 already disables pinch-zoom (`zoomEnabled` defaults to false, which installs the
  pinch-blocking scroll delegate on iOS and turns off `setBuiltInZoomControls` on Android) and
  already sets `scrollView.bounces = false`. **Do not subclass `CAPBridgeViewController` to do
  either** — read `node_modules/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController.swift`
  before believing a native fix is needed for WebView chrome.
- **Do not put `maximum-scale=1, user-scalable=no` in the viewport meta.** It is the reflex fix
  for zoom in a shelled app and it is all cost here: AXE flags it under WCAG 1.4.4, and it buys
  nothing over the native `zoomEnabled: false` above plus `touch-action: manipulation` for
  double-tap. Keep `viewport-fit=cover` — that is what makes the safe-area insets report real
  values instead of zero.
- **No webfonts.** The app is offline-only, so a `fonts.googleapis.com` stylesheet is a network
  call on the critical rendering path that fails exactly when the player has no signal.
  `src/styles.scss` uses the platform system stack.
- Keep `browserslist` explicit and aligned with Capacitor 8's floors (iOS 15+, API 24+).
  Angular's default target can emit syntax that old Android System WebView cannot parse,
  which fails at parse time and renders a blank screen with no visible error.
- Never ship a build with `server.url` set in `capacitor.config.ts`. That is dev-only, and
  it triggers App Store rejection under Guideline 4.2.

---

## Content and balance

- Balance numbers live in `data/`, not hardcoded in `core/` logic.
- Depth comes from a modest number of systems that interact, not from volume of
  hand-authored content.
- Characters are **sidegrades with distinct niches**, not a strict power ladder. Two
  players should clear the same stage with different teams. This holds _within_ a tier;
  ascension and levelling are the vertical axis, and tier is a growth slope rather than a
  starting advantage (see [milestone 3](../../docs/milestones.md)) — with one deliberate exception since
  milestone 8c, which is that tier also caps how many skills a character may field.
- **A kit is authored at exactly its tier's ceiling**: two skills at `common`, three at
  `legendary`, four at `ascended`, ultimate included. Fewer leaves a character short of what its
  tier promises; more ships content no rung can ever reach. Write the ultimate first and the rest in
  the order they unlock — `elite`, `legendary`, `ascended` — which is what makes a kit readable as a
  progression. `data/characters.spec.ts` asserts all of it; the rule is in
  [`core/roster/kit.ts`](../../src/core/roster/kit.ts) and the table in
  [`data/kits.ts`](../../src/data/kits.ts).
- Team composition matters through **enemy design** (a healer that must be burst, a wide
  wave that punishes single-target, a debuff that needs a cleanse), not through flat
  synergy bonuses like "+10% if two Fire units" — those just create a new optimal team.
  The faction matchup matrix added in milestone 4 is **not** that pattern and the distinction
  is the whole of it: a synergy bonus rewards your own line-up and asks nothing of the
  encounter, while a matchup multiplier is a statement about the fight in front of you. Keep
  matchup edges small — five to ten percent — so they decide a fight that was already close
  rather than carrying a party that brought the wrong answer.
  - **Milestone 8d overrode the first half of that rule, once, knowingly, and the override does
    not generalise.** The faction lineup bonus in [`data/combat.ts`](../../src/data/combat.ts) pays a
    party for its own composition, which is exactly the pattern above. It survives on one
    argument: **a mono-faction bonus does not create one optimal team, it creates seven**, and
    which of the seven to bring is decided by the matchup — so it is still a statement about the
    fight in front of you. Any _new_ proposal of this shape has to make that argument on its own
    merits; "8d did it" is not the argument. A bonus for a set of specific characters, or for a
    role mix, or for anything that resolves to one best answer, is still the thing the rule
    forbids.
  - The premise is **true since milestone 8e**, which authored the roster it needed: seven
    characters per faction, so a mono-faction five is buildable everywhere without spending Angels
    as wildcards. `data/chapters.balance.ts` sweeps all seven and holds them within about a stage
    and a half of each other.
  - **The two faction mechanics answer different questions and are not rival levers.** The lineup
    rung pays every mono-faction five identically, so it cancels between them: it decides
    _whether_ to build a mono-faction team, and the matchup decides _which_ to bring. Comparing
    "+25% composition" against "5% matchup" as though the larger one wins is the reading that made
    this look unfinished for two milestones; they are never both on the table at once.
  - **The matchup edges are 1.05–1.10 because 8e measured them, not because nobody got to it.**
    On fights genuinely in doubt, switching the matrix off moves the win rate by roughly seventeen
    points. Two traps if you re-measure: averaging over the whole ladder makes the matrix look
    decorative, because at a fixed investment most stages were never in doubt; and "the matrix
    never turns a loss into a win" is a false assertion, because win rate near a party's damage
    threshold is a step function. Measure the edge in levels of investment instead.
- **A faction is only a team if it owns sustain and a way past a front rank.** Rank is a gate, not
  a damage reduction — a party with no back-rank targeting cannot _select_ a protected healer, so
  an encounter built around one is unwinnable rather than hard. Milestone 8e gave every faction
  both, in its own idiom, and `data/characters.spec.ts` asserts it. **Monsters are the deliberate
  exception on sustain**: they carry `lifeLeech` and a siphon rather than a healer, because giving
  that faction a support would solve a composition problem by deleting the faction.
- **The roster is three common, three legendary and at least one ascended per faction.** The first
  two are exact and meant to stay exact — they are the bench a mono-faction team is built from and
  the fodder the mortal ladder eats, and both jobs want a known depth. The third is a floor,
  because ascended tier is where new characters arrive. Changing the closed half is a design
  decision: edit the shape in `data/characters.spec.ts` and argue for it in `docs/milestones.md`,
  rather than letting it drift.
- Check the scaling curve against float64's safe range (9e15) before committing to it. **The curve
  demands `break_infinity` and the hedge is retired**: milestone 10 took levelling to ×10⁹ and the
  rung ladder to ×450, so a late-game stat block is past float64's safe range on its own. `Numeric`
  is the working type everywhere and there is no longer a version of this game that does without it.
- **An enemy is a level-1 stat block plus a tier, and a stage is archetypes plus a `level`.** Since
  milestone 10 both sides of the board climb the same curve, which is what keeps a lock a lock
  instead of letting it decay into an empty square as the party's own numbers run away. Author an
  archetype's _shape_ and let the stage's level say how big it is; do not write a second, bigger
  stat block for a later band. There is deliberately no ascension rung on the enemy side — see
  `toEnemyCombatant` for why the third dial was folded into the block.
- **A stage authors its line-up and its level and nothing else.** Since milestone 11 the rates, the
  lump and the first-clear crystals are derived from where the stage sits — `StageEncounterData` is
  what `data/` writes and `resolveStage` turns it into the `StageData` the simulation takes. Do not
  add an authored payout back onto a stage: it would be a second mechanism on the same number, and
  because `raiseRates` takes the larger of the two, whichever happened to be bigger would silently
  win.
- **Whether a stage is a mini-boss or a boss is a rule, not a field.** Every tenth stage of a
  chapter and the last one, so the rhythm is identical in a fifty-stage chapter and a two-hundred
  stage one. What `data/` authors is a line-up worthy of the slot it lands in, and
  `chapters.spec.ts` checks it did.
- **Scaling both sides by the same factor is an identity on the whole simulation.** Damage is
  `atk² / (atk + def)` and every status prices off the applier's `atk`, so the same hits land in the
  same order on the same tick. That is why the ninety-second timer, the faction matrix and every
  bounded stat survived a ×10⁹ rescale untouched, and it is asserted in
  `core/battle/simulate.spec.ts`. Anything additive, or any authored constant compared against a
  scaling quantity, breaks it — audit for those rather than waiting to notice.

---

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.
- The bar above is load-bearing, not aspirational — it is what caught `user-scalable=no` in
  milestone 6, within a minute of it being written. When a fix and the accessibility suite
  disagree, the suite is usually telling you the fix was a reflex. Look for the option that
  satisfies both before reaching to silence one.
- **`@angular/cdk` is installed and is the sanctioned answer for modals**, unlike Angular
  Material, which is removed. It is not a UI framework — it is an accessibility primitives
  library, and `cdkTrapFocus` / `Overlay` cover focus trapping, focus restoration, background
  `inert` and scroll blocking. Those are where a hand-rolled dialog fails AXE, so do not
  hand-roll them. Nothing imports CDK today; it is on hand deliberately, and its presence is
  **not** a precedent for installing anything else speculatively.
  - When that day comes, CDK wants two prebuilt global stylesheets — `a11y-prebuilt.css` for
    `.cdk-visually-hidden`, `overlay-prebuilt.css` for overlay positioning. Add them
    deliberately, at that point, and read them first: `overlay-prebuilt.css` declares
    `.cdk-overlay-container { position: fixed; height: 100%; width: 100% }`, which is correct
    only because the shell now guarantees the document fills the viewport. Wiring a global
    stylesheet in without reading it is the exact mistake Material's scaffold made.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Signals belong in `ui/` only. Game state lives in plain objects owned by `core/`.

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## AI Instruction Source of Truth

- Do not manually edit generated AI instruction files such as `.claude/CLAUDE.md`, `.gemini/GEMINI.md`, `.github/copilot-instructions.md`, `.junie/guidelines.md`, `.windsurf/rules/guidelines.md`, or `.cursor/rules/cursor.mdc`.
- Edit only `AGENTS.md`.
- After editing, run:
  - `npm run sync:agent-instructions`
  - `npm run sync:agent-instructions:check`
- **Author every link relative to the repository root**, exactly as it resolves from `AGENTS.md`
  — `[the roadmap](docs/milestones.md)`, not `[the roadmap](../docs/milestones.md)`. The copies
  live at three different depths, and the sync script rewrites each href for its target. It also
  fails, without writing anything, if a link points at a path that does not exist. Do not
  hand-adjust a link to suit one target.

## Long-running processes

**Never end a turn with a process you started still running.** Whoever starts one stops it.
Leaving a dev server alive means the human has to hunt down a PID and kill it by hand, and a
stale server on port 4200 silently serves the next session a build nobody asked for.

- This covers `npm start`, `npm run watch`, `ng serve`, any preview/dev-server tooling, and
  anything launched with a background flag.
- Start it, verify what you needed to verify, stop it — in the same turn. Do not keep it up
  "in case it is useful later"; restarting takes seconds.
- Before finishing, confirm nothing is left: `lsof -iTCP:4200 -sTCP:LISTEN`. Stop it through
  the tooling that started it where possible, and kill the process directly otherwise.
- Reporting "the dev server is still up" at the end of a turn is the bug, not a courtesy.

One-shot commands that exit on their own — `ng build`, `ng test --no-watch`, `ng lint` — are
not long-running and need none of this.

## Linting Guidelines

- Run linting for every change set; linting is required for all changes, not optional.
- Use the lint command that matches the files you changed:
  - Angular app files: `npm run lint:angular`
  - Playwright files: `npm run lint:playwright`
  - Mixed changes (Angular + Playwright) or full-repo linting: `npm run lint`
- For scoped linting, pass extra arguments through the matching script (for example: `npm run lint:angular -- <args>` or `npm run lint:playwright -- <args>`).
- Treat lint failures as real issues to fix in code rather than bypass.
- Never disable ESLint rules to make code pass linting.
  - Do not disable rules in root/shared ESLint config files.
  - Do not disable rules at the file level.
  - Do not disable rules inline (for example with `eslint-disable` comments).

## Testing Guidelines

- This project uses `vitest` (v4) for unit testing. Write and update unit tests using Vitest APIs and patterns.
- When running tests, prefer scoped commands that target only the changed project or spec file.
- Example:
  - To run tests for just the `/src/app/app.spec.ts` file: `npm run test:unit -- --include src/app/app.spec.ts`
- Place tests close to the code they verify, and keep test setup focused on behavior rather than implementation details.
- Prefer clear Arrange-Act-Assert structure with descriptive test names that document expected behavior.
- Cover happy paths, edge cases, and error handling for components, services, and utility functions.
- Keep tests deterministic: avoid time, network, and global state coupling unless explicitly mocked.
- Mock only what is necessary, and prefer lightweight fakes/stubs over deep or brittle mocks.
- Ensure tests are fast and isolated so they can run reliably in CI.
- **Never `vi.mock()` a module.** The Angular unit-test builder defaults `isolate` to **false** —
  every spec file shares one module registry in one thread — so a module mock only wins if that
  spec happens to import the module before any other spec does. File order is not controlled and
  differs between machines, which makes this a green suite locally and a red one in CI. There are
  no `vi.mock` calls left in this repo, and adding one is how that class of failure comes back.
  - **Inject the seam instead.** A dependency that a test needs to replace should arrive through
    an `InjectionToken` whose default factory returns the real thing, so the test overrides a
    provider rather than a module. `KEY_VALUE_STORE` in `ui/save.service.ts` is the worked
    example, and its doc comment records why the obvious alternative was rejected.
  - Raising `isolate` to true would also fix it, and was considered and rejected: it slows the
    suite that runs on save in order to paper over one file's design.

### Testing `core/`

- `core/` specs run in `environment: 'node'` with no Angular TestBed. If a core spec needs
  a TestBed, the boundary has been violated.
- Determinism makes exact assertions possible. Prefer them over tolerance ranges where the
  seed is fixed.
- The highest-value invariant in the project: **closed-form offline resume must match
  stepwise accrual.** Assert relative error, not `toBeCloseTo` (which is absolute decimal
  places and will fail once numbers get large).
- Slow statistical balance sweeps belong in the separate vitest project — `*.balance.ts`, run by
  `npm run test:balance` against `vitest.balance.config.ts` — not in the fast unit suite that runs
  on save. **That project exists now**, and the trigger it was waiting for is worth recording:
  before milestone 4 a full sweep of the ladder was milliseconds; skills, statuses and `Decimal`
  quantities made a battle roughly a millisecond on its own; and milestone 7 doubled the ladder
  and added a third reference party, at which point three parties across twenty-four stages at 40
  seeds was thousands of battles. **Moving the sweep was the answer, not shrinking the sample** —
  a smaller sample buys speed by making the answer less true.
  - `data/chapters.spec.ts` keeps what is fast and structural: chapter lengths against the curve,
    ids, rank sizes, factions, the boss rhythm, and the monotonicity of the level, rate and reward
    curves.
  - `data/chapters.balance.ts` holds what has to be simulated: the reference-party sweeps and the
    per-stage difficulty probe.
  - **Striding over the ladder is not shrinking the sample, and milestone 11 is the one place that
    distinction is licensed.** That milestone did not add difficulty, it made the same range four
    times denser, so adjacent stages sit within about one percent of each other — and the blocks
    that measure a _step_ (the difficulty probe, the matchup matrix) measure noise at that spacing.
    Every fourth stage plus every chapter boss restores the per-sample gap to what the
    twenty-four stage ladder had, over the same range, at the same resolution. The load-bearing
    assertions — zero timeouts, the starter wall, the timer headroom — still read every stage.
  - `*.balance.ts` files are excluded from `tsconfig.app.json` so the app never bundles them, and
    included in `tsconfig.spec.json` so typed linting still covers them. A new one needs both.
- When evaluating balance, look at the **5th percentile** player, not the mean. In a paid
  game the unlucky tail buys its way out; here they cannot, so they are the design target.

### Testing `data/`

- **Derive from the content, never retype it.** A spec in `data/` that copies a number out of a
  neighbouring file has turned a coupling into a comment: it keeps measuring the old value
  forever and passes happily while the thing it claimed to protect drifts. `data/levels.spec.ts`
  evaluates the reward curve at the last stage of the ladder for exactly this reason — the level
  curve is tuned against the top of the ladder, so adding a chapter has to re-run every
  time-to-afford assertion. The same applies to `data/ascension.spec.ts`, which derives its totals
  from the authored rungs rather than restating "8 self, 180 fodder" as a constant.
- **Prefer a threshold that fails when content outgrows it** to one that documents an intention.
  When such a test fails after new content lands, the right response is to retune deliberately —
  not to move the threshold to make it green.
- Conformance is asserted through **typed locals** (`const chapters: readonly ChapterData[] =
CHAPTERS`) rather than annotations on the data itself, because `data/` may not import `core/`.
  That assignment is what turns a malformed stat block into a compile error.
