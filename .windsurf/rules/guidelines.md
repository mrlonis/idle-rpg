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
consolation prize — a pull can never produce nothing. There are **two pity curves** now:
legendary-or-better within 10 pulls and ascended within 30, both global and both on screen.

---

## Reference documentation

Long-form references live in `docs/`. **This file states rules; those files explain systems and
carry the arguments.** When the two disagree, the code is right and both are stale.

⚠️ **A rule below is the short form. Read the doc that owns a system before changing it** — the
reasoning, the measured figures and the failures that produced each rule are there, and re-deriving
them is how they get reversed by accident.

**Start here**

- **[docs/glossary.md](../../docs/glossary.md)** — the vocabulary, and the words that mean more than one
  thing. **Read it before writing prose about tiers, rarities or factions**; several terms collide
  by design and the collisions are listed there.
- **[docs/history.md](../../docs/history.md)** — what shipped in what order, the decisions no system doc
  owns, and **what is still open**: presentation, onboarding, and how long the campaign is meant to
  be. Every numbered milestone is complete.
- **[docs/authoring.md](../../docs/authoring.md)** — the procedure for adding a chapter or a hundred tower
  floors: what a session owes, the level line (**bisect, do not solve**), the board constraints, the
  prose check, and the schedule of guards that fire next. **Read it before authoring content.**
- **[docs/rejected.md](../../docs/rejected.md)** — everything ruled out and why it stays ruled out:
  prestige, the segmented offline solver, `timeToClear`, `dropCarry`, the offline cap, role-locked
  placement, flat synergy bonuses, anti-cheat, export/import, and the genre systems this game will
  not have. **Read it before proposing anything on it**; the arguments are recorded so they do not
  have to be re-derived.
- **[docs/testing.md](../../docs/testing.md)** — the balance sweep and what it has caught: the fast/balance
  split, the two tuning targets, the guards that stand where a mechanic used to, striding versus
  shrinking the sample, derive-never-retype, and how to tell a rotting guard from real content drift.

**The simulation**

- **[docs/combat.md](../../docs/combat.md)** — the ATB loop, the damage formula, targeting, skills, energy
  and ultimates, statuses, the event log, and the RNG draw discipline. ⚠️ **Rules marked there are
  termination arguments, not balance knobs** — relaxing one lets `simulateBattle` fail to return.
- **[docs/attributes.md](../../docs/attributes.md)** — the combatant stat block, which stats may scale and
  why, and what the milestone 8a collapse to one `atk` and one `def` cost.

**Progression**

- **[docs/ladder.md](../../docs/ladder.md)** — the campaign: eleven chapters, four hundred and fifty stages, what a
  stage authors, position versus clear count, the rung cadence, and the guards that were retired.
- **[docs/ascension.md](../../docs/ascension.md)** — the sixteen-rung ladder, the two paths, what a rung
  costs, and the three rungs that also hand over a skill.
- **[docs/level-resonance.md](../../docs/level-resonance.md)** — the level the whole roster shares. **Read
  it before writing anything that reads a character's level.**
- **[docs/gear.md](../../docs/gear.md)** — the third progression axis: five slots, five archetypes, a
  five-rung grade ladder, and the hourly gear shop.
- **[docs/signature-items.md](../../docs/signature-items.md)** — the fourth axis: one item per
  ascended-tier character, unlocked at `mythic`, thirty levels bought with emblems.
- **[docs/economy.md](../../docs/economy.md)** — the seven currencies, income rates, the level curve, pull
  rates and pity, and offline accrual.

**Content modes**

- **[docs/towers.md](../../docs/towers.md)** — seven faction towers, three hundred floors each. What a
  tower is for, the three fields a clear may never touch, the three crews, and seven towers' worth of
  measured escalation findings.
- **[docs/descent.md](../../docs/descent.md)** — the daily roguelite run: three floors of three fights,
  attrition, and one card of three after every win. **The only content that asks a question
  mid-flight.**
- **[docs/expeditions.md](../../docs/expeditions.md)** — the puzzle maps: three hand-authored grids solved
  once each, a stamina budget, and an exit sealed behind a boss.
- **[docs/achievements.md](../../docs/achievements.md)** — achievements and quests as ledgers over counters
  the run already keeps, which counters are legal, and the crystal payouts.
- **[docs/bounties.md](../../docs/bounties.md)** — the bounty board: bench characters on timed missions,
  the daily rotation, and the disjointness rule that bites on the way out.

**Shell and persistence**

- **[docs/navigation.md](../../docs/navigation.md)** — the tab bar's measured ceiling, Town as the hub,
  Home as the battle hub, the eight crews, and the routing rules. **Read it before adding a screen.**
- **[docs/platform.md](../../docs/platform.md)** — the Capacitor shell, safe areas, the accessibility bar
  and the incidents that set it, `@angular/cdk` overlays, local notifications, and what platform
  backup does and does not cover.
- **[docs/saves.md](../../docs/saves.md)** — storage, the migration chain, load-time repair, and fixtures.

---

## ⚠️ Rules that must be in context

The rules whose violation is **silent** — nothing fails, no test goes red, and the damage shows up
as a wrong number on a screen or a fight that never ends. Each names the doc carrying its argument.

### Seams where a caller can be silently wrong

- **`toBattleCombatant` takes the level as a required argument** and does not read it off the entry.
  `OwnedCharacter.level` is the level the player _paid for_; the effective level is
  `min(levelCapFor(rarity), max(investedLevel, resonanceFloor))`, derived on read and stored nowhere.
  Reading `owned.level` where the effective level belongs presents as **nothing at all** — every
  screen keeps saying the right number while the battle resolves at the wrong one.
  [level-resonance](../../docs/level-resonance.md)
- **`setFormation(state, activity, …)` takes the activity as required, never defaulted.** A caller
  that forgot which crew it was editing would silently rewrite the campaign's.
  [navigation](../../docs/navigation.md)
- **`trackProgress`, `allProgress` and `claimAchievements` all take a ladder, required.** A caller
  with no ladder reports the chapter track as having earned nothing, on every screen, forever.
  [achievements](../../docs/achievements.md)
- ⚠️ **`GameState.stage` is the stage within its chapter, not a position on the whole ladder.**
  Reading it as a linear index is a bug that presents as **a player being teleported**.
  `stageIndex(ladder, position)` is the only way to a linear index. [ladder](../../docs/ladder.md)
- ⚠️ **`chaptersCleared` and `clearedStages` are different numbers and both type-check.** Passing one
  where the other belongs is wrong by the size of a chapter. [ladder](../../docs/ladder.md)
- ⚠️ **`toBattleCombatant` does not carry `CombatantData.opening`.** A character authoring a passive
  has it silently dropped; the only player-side route to one is a signature rung. `toEnemyCombatant`
  does carry it. [combat](../../docs/combat.md)

### Save keys and permanence

- ⚠️ **`SAVE_VERSION` is 0 and the migration table is empty.** Five re-bases collapsed the chain, on
  the one argument that licenses it: **no save any of them wrote has ever existed outside
  development.** A build that reaches a player makes the chain permanent and the next version 1
  forever. **Never delete or edit a migration once a build carrying it has reached a player.**
- ⚠️ **An activity `id` is a save key and is permanent once shipped** — renaming one silently
  disbands the crew standing in it. Change the `name` freely; never the `id`. Expedition camp and
  chest letters are save keys the same way.
- ⚠️ **Inserting a rung anywhere but the top of `RARITIES` is a save migration, not a content edit.**
  It changes no field, only what one _means_ — an unmigrated save parses cleanly, validates cleanly
  and demotes the entire roster. [saves](../../docs/saves.md)
- **Loading must not throw on recoverable damage.** Clamp and default; a thrown error costs the
  player their entire run. Write to a backup slot before overwriting the primary.
- ⚠️ **A run reset has to replace the state in memory, not just empty the slots.** The loop writes
  its state back on autosave and on `visibilitychange`, so clearing storage alone is undone by the
  app on its way out. Stop the loop, clear, replace, persist, restart — in that order.
- **Player settings are a second storage key, not a field on the save**, repaired per field on read.

### RNG draw order

- **Never call `Math.random()`.** Use `core/rng.ts`; seed and call counter live in the save.
- **Combat draws from a derived sub-stream** so replaying a battle never shifts the gacha sequence.
  `deriveSeed(state.rng.seed, \`battle:${stageId}:${battleCount}\`)`. Pulls advance `state.rng.calls`;
  combat never does. **This is already built — do not write your own.**
- ⚠️ **The count draw is the first draw in `rollDrops`, and its position is load-bearing.** Every
  later draw shifts by one, so moving it re-rolls every historical drop for a given seed — invisible
  in play, and it turns every recorded balance figure into a different number. [gear](../../docs/gear.md)
- ⚠️ **Emblems roll from their own derived stream (`emblem:…`), never the gear sequence**, for the
  same reason. [economy](../../docs/economy.md)
- ⚠️ **A pity curve is a floor under the same roll, never a second draw.** A curve drawing its own
  value breaks the invariant `rng.calls` rests on, and breaks it **silently**. [economy](../../docs/economy.md)
- **Derived-not-stored is what makes rerolling impossible rather than merely detectable**, and three
  systems rest on it: the gear shop's stock, the daily bounty board, and the Descent's day.

### Termination arguments — relaxing one means a fight that never ends

- ⚠️ **A fight is ninety seconds and running the clock out is a defeat.** `MAX_BATTLE_TICKS` is a
  rule of the game as much as a guard. Headroom over the longest tuned fight is **1.44×**.
- ⚠️ **Closing pressure is the termination argument and it is not a difficulty knob.** Past
  `PRESSURE_AFTER_TICKS` every damage instance is amplified without bound; **healing is deliberately
  not**. It applies to **both sides equally** and stays a function of the **tick** alone, which is
  what preserves the whole-board rescale identity. Never reach for it to make late content harder.
- ⚠️ **No signature item may multiply healing**, and this is the least intuitive rule in the project.
  A party made unkillable by sustain does not win — it stalls and times out, which is a defeat. **A
  shield is safe where a regeneration is not**: it banks a pool once and depletes.
- ⚠️ **Sustain on the enemy side behind something the party cannot aim past is a clock, not a
  difficulty.** No healer behind a taunt; no healer on a tower roof.
- ⚠️ **Reflect and link cannot cascade** — both resolve through `statusDamage`, which never re-enters
  the attack path. Structural rather than a depth counter; keep it that way.
- ⚠️ **A link conserves damage and a lone holder takes the whole hit.** Multiplying would be content
  inventing damage; a share moved off a holder with nobody to share to makes the last survivor
  unkillable.
- ⚠️ **A taunt is never a passive.** The applying skill's cooldown outlasts the status, multi-target
  selections ignore it, it never empties a selection, and no enemy `opening` may carry one — so a
  taunt can never be an ultimate either.
- ⚠️ **A status duration must stay below the cooldown of the skill applying it.** `BARRIER` at 70
  ticks recast every 60 kept a party-wide absorb up permanently.
- ⚠️ **The defensive mirror of a permanent wound-response — a body that armours itself as it is hurt
  — is the one shape nobody may author.** It is the ninety-second clock with a narrative attached.
- **`MAX_RESIST` is a termination guard, not the penetration cap.** `def` diminishes and can never
  reach zero; **resist multiplies and can.** `maxLifeLeech` is a guard in the same sense.

### The whole-board rescale identity

**Scaling both sides of a fight by the same factor is an identity on the entire simulation**, and it
is what let a ×10⁹ rescale ship with the timer, the faction matrix and every bounded stat untouched.
Asserted in `core/battle/simulate.spec.ts`.

- ⚠️ **Every gear and signature bonus is a percentage of the wearer's own stat, never a flat
  quantity.** A flat bonus is an **addition**, which is exactly what the identity forbids — and it is
  invisible against a curve worth ×10⁹ anyway. Bonuses are summed with each other, never compounded.
- ⚠️ **Anything additive, or any authored constant compared against a scaling quantity, breaks it.**
  Audit for those rather than waiting to notice.
- **The exception is a bounded rate.** `critChance`, `critDamageAmp` and `lifeLeech` take **points**
  rather than percentages, because a percentage of a bounded rate pays almost nothing.
  [descent](../../docs/descent.md)

### The economy

- ⚠️ **No quest may be measured against `clearedStages`.** The test is not "is it monotonic" but
  **"can a player always make it move today"** — which also forbids `signatureLevels` and emblems
  held. `battleCount`, `pullCount` and `descentRuns` are the legal three.
  [achievements](../../docs/achievements.md)
- ⚠️ **A tower or Expedition clear may never touch `clearedStages`, the ladder position, or an idle
  rate.** The clear count drives the idle crystal rate. [towers](../../docs/towers.md)
- **Every quest reward is crystals and every achievement award is flat**; **a bounty pays a
  _duration_ of current idle income and never crystals.** The split is deliberate.
  [bounties](../../docs/bounties.md)
- ⚠️ **Scale all three base rates together or none.** Every economy assertion is a ratio between the
  currencies, and a common factor cancels out of all of them. [economy](../../docs/economy.md)
- ⚠️ **`RATE_CURRENCY_IDS` and what a stage may _author_ are two different lists.** Adding `emblem`
  to the authorable set would be a second, **silent** mechanism on one currency — `raiseRates` takes
  the larger of the two. The same trap applies to putting an authored payout back on a stage.
- **There is no offline cap**, deliberately, and it is not to be reintroduced. Clamp elapsed to
  `[0, ∞)`; treat an implausible `lastTickAt` as damage and pay zero.

### Content authoring

- **A kit is authored at exactly its tier's ceiling** — two skills at `common`, three at `legendary`,
  four at `ascended`, ultimate included. Write the ultimate first, then in unlock order.
- ⚠️ **A new ascended-tier character needs a row in `data/signature.ts`, and it is not optional.**
  `signature.spec.ts` derives the item count from `CHARACTERS`, so one without an item is a failing
  test rather than a permanently empty panel.
- ⚠️ **Any new `ascended`-tier enemy block stays under the Unmade on both stats.** A third and fourth
  heavy anchor is what made six towers fail their sweep at once.
- **An enemy is a level-1 stat block plus a tier; a stage is archetypes plus a `level`.** Author an
  archetype's _shape_ and let the stage's level say how big it is.
- **Every archetype must be fielded somewhere**, and "somewhere" is every ladder rather than the
  campaign. Held by `data/enemies.spec.ts`, the only spec that sees both.
- ⚠️ **The status vocabulary is closed and does not renew.** Reach for the stat block before the
  vocabulary. [authoring](../../docs/authoring.md)
- ⚠️ **A tower band's crew owes 23 more levels of margin for every rung it takes past the first**,
  because `ln(1.6) / ln(perLevel.common)` is 22.6. Reusing `ROOF_MARGIN` unchanged on a new hundred
  gives ×2.703 against the shipped ×1.689 — and **the failure is invisible in the sweep**, because a
  walkover and a correctly tuned low band both read 100% with five alive. Confirm the power ratio
  before concluding anything about the boards. [towers](../../docs/towers.md)
- ⚠️ **A heavy enemy block outgrows a mono-faction crew across a hundred floors, so a tower's
  _later_ anchors are lighter than its earlier ones.** `perLevel.ascended` is 1.024 and
  `perLevel.legendary` 1.0225 against a mostly-`common` five's 1.021, worth about ×1.15 over the
  forty-seven levels a third hundred spans: the Dwarf Tower's floor-200 board reads 100% with all
  five alive at its own level and **28%** at the third hundred's roof, the Elf Tower's **35%**, the
  Undead Tower's **53%**.
  **Field the previous hundred's roof board at the new roof's level before authoring anything**, and
  expect the escalation to come from the board's composition rather than from its anchor.
  ⚠️ **"Lighter" is not "absent", and check the previous hundred's _anchors_ too, not only its roof
  board.** Boards of five legendaries with no anchor measured **flat** across twenty-five floors, and
  the Elf Tower's own `THE_GRUDGEKEEPER` (1520/89) is heavier than the roof succeeding it (1300/84) —
  so a closing band may have to retire a block the tower has fielded since its first hundred. The
  Undead Tower's third hundred retired **two** on that arithmetic. [towers](../../docs/towers.md)
- ⚠️ **A grade that costs survivors is difficulty; one that starts timing out is the ninety-second
  clock wearing a stat block. Count the timeouts explicitly** — a wipe and a timeout are the same
  `defeat`, so a win rate cannot tell them apart. This is what licensed enemy **durability** as the
  Undead Tower's third-hundred axis (four bodies from hp 700 to 2400 grade 3.85 → 1.30 survivors with
  zero timeouts anywhere) where enemy _sustain_ on the same crew is forbidden. ⚠️ **A board-wide ward
  is the shield rule in both directions**: worth a real 0.75 of a survivor mid-band, and on the roof
  it takes the same board from 100% to **75%** at 45s mean. A _self_-shield is worth 0.00, because it
  prices against the wearer's own `atk` on a body already dying. [towers](../../docs/towers.md)
- ⚠️ **A tower's height is one rule for all seven, so a bump strands six of them.** A tower that has
  not been extended is not damaged — `clearedFloors` clamps — but it **loses its boss**, because
  `floorKindAt` reads the rules' height. Track them with a **literal `PENDING` list** in
  `towers.spec.ts` and `towers.balance.ts`; a filter ("the full height or two thirds of it") passes
  forever and never notices a tower nobody went back for. [towers](../../docs/towers.md)
- ⚠️ **A mistyped optional stat is silent in both directions.** An already-`as const` object is not a
  fresh literal, so TypeScript's excess-property check never runs on it. Audit the keys with a script
  whenever a session authors stat blocks; **delete a dead key rather than correcting it.**

### UI traps that fail silently

- ⚠️ **Per-screen state on a component bound to a route parameter must be a `linkedSignal` keyed on
  that parameter, never a plain `signal`.** Angular's default reuse strategy keeps the **same
  component instance** when only a parameter changes, so a refusal message or an open picker carries
  onto the next screen — where it is a statement about a character or crew the player is no longer
  looking at. Use `linkedSignal({ source, computation: () => null })`, not an `effect` that resets:
  an effect runs _after_ the change, so there is a frame in which the old value still renders. The
  test that catches it drives the parameter directly (`setInput`, or a router harness).
- ⚠️ **`visually-hidden` is a `@mixin` in `ui/theme.scss`, not a global class.** Angular scopes
  component styles, so a screen writing the class without including the mixin gets **no rule at all**
  and renders the text inline. Loud on screen, silent at authoring time — and the same trap waits for
  any class a component assumes is global.
- ⚠️ **Never write `padding: env(safe-area-inset-top)`.** The single-value shorthand puts the _top_
  inset on all four sides. The trap generalises to any `env()` or `var()` in a shorthand: the value
  names a side, the property does not know that.
- ⚠️ **An `@empty` block inside a `<ul>` is a serious AXE violation** — it renders as a sibling of
  the items, and a `<ul>` may contain only `<li>`. It sits on the state a new player sees first.
- ⚠️ **`StageHeading` carries the _rendered_ position, not its parts.** No screen asks which kind of
  content it is drawing.

---

## Before adding anything new

**Every numbered milestone is complete**; [history](../../docs/history.md) records what shipped in what
order and what is still open, and [authoring](../../docs/authoring.md) is the procedure for adding
content. Before starting work, check where the project actually is. ⚠️ **Do not assume any doc is
current — verify against the code.**

Read both before starting, and specifically before:

- reaching for **`@capacitor/app`** — deliberately deferred, and [platform](../../docs/platform.md)
  records the condition that has to be met first. The **run reset** is no longer on that list: it shipped in milestone
  13, behind the settings screen it was always waiting for. **Angular Material is not deferred, it
  is removed**: it was uninstalled in milestone 6 after its scaffolded global theme turned out to
  be the cause of the app's broken first appearance on a real phone. Do not reinstall it.
  `@angular/cdk` is a separate question and the answer is different — see the accessibility
  section below;
- **adding a tab at all.** Six is what fits across a small phone at a legible label size; a
  seventh has to shrink the text past reading or drop it, and a row of unlabelled glyphs is a
  puzzle rather than navigation. **The bar holds five, and the spare slot is not for spending** —
  Summon and Shop gave it back when they moved behind **Town** (`/town`, with `/town/summon`,
  `/town/shop`, `/town/altar` and `/town/gear-shop` nested under it so the tab stays lit inside
  them). Town _is_ the different shape of navigation that note used to promise the next screen
  would need: a hub costs one tap and has no ceiling, so **anything a player goes to _do_ with what
  they have earned goes in Town** rather than on the bar. The gear shop is the rule in action: it
  was half of the gear tab and moved, leaving that tab as the **Bag** (`/bag`) — an inventory named
  for what it holds, so the next item type is a section on a screen that exists rather than an
  argument for a sixth tab. The **Altar** (`/town/altar`) is the rule generalising: it is not a
  shop and spends no wallet currency, and it is still a Town card, because "somewhere you go
  deliberately, with something you have earned" is the test rather than "a currency sink". ⚠️
  **`/formations` is the counter-example and it belongs to neither**: a crew is not something a
  player has earned, it is something they arrange about the roster they already hold, so it hangs
  off the **Roster** rather than Town or the bar. **Home is the battle hub** — anything a player
  goes to _fight_ is a card there, which is where **The Descent** (`/descent`) landed in milestone
  22 and **Expeditions** (`/expeditions`) in milestone 23, and why neither cost the bar anything;
- building anything that fights on its own — "auto-battle" means two separate features, and only
  one of them is built. The **unlockable repeat** shipped in milestone 7: it is foreground-only,
  it commits and persists at the end of every fight, and switching it off when the app leaves the
  foreground is a correctness requirement rather than a courtesy (see "Offline progression").
  **Ambient sparring on the idle screen is still deferred** and must never award anything;
- adding the **segmented offline solver**, `timeToClear`, or a `dropCarry` field — all three are
  cancelled rather than pending, and [rejected](../../docs/rejected.md) records why each one stopped
  being needed.

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
  `timeToClear(state, stage)` was, and is cancelled; see [rejected](../../docs/rejected.md).
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
  their save has to walk the whole chain. `SAVE_VERSION` is 0 and the table is empty; see the
  re-base licence above and [saves](../../docs/saves.md) for the condition that closes it.
- **A save this build cannot read is discarded and written over**, and the fresh run persists
  normally. `fatal` reports it and drives the backup-slot fallback; it no longer gates persistence,
  because the protection it gave cost a game that boots, plays and silently never saves.
- Loading must not throw on recoverable damage. Clamp and default (`NaN` gold becomes 0,
  unknown character IDs are dropped) rather than rejecting.
- Persist on `visibilitychange`. `beforeunload` is unreliable in a WebView and iOS can
  suspend without warning.
- Keep fixture saves for each historical version in `src/core/save/fixtures/`, with a test
  that migrates every fixture to current. ⚠️ **A fixture must store a value the default would not
  produce**, or it passes identically whether the decoder reads the field or silently defaults it.
- **A migration only does what it can see.** `core/` cannot import `data/`, so anything needing
  content belongs in an idempotent load-time repair instead — which runs on **every** load rather
  than behind a version gate, and only ever raises.

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
— which would re-open the arguments in [rejected](../../docs/rejected.md). Do not implement either speculatively,
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
  starting advantage (see [ascension](../../docs/ascension.md)) — with one deliberate exception since
  milestone 8c, which is that tier also caps how many skills a character may field.
- **A kit is authored at exactly its tier's ceiling**: two skills at `common`, three at
  `legendary`, four at `ascended`, ultimate included. Ultimate first, then in unlock order. Rule in
  [`core/roster/kit.ts`](../../src/core/roster/kit.ts), table in [`data/kits.ts`](../../src/data/kits.ts).
- Team composition matters through **enemy design** (a healer that must be burst, a wide wave that
  punishes single-target, a debuff that needs a cleanse), **not through flat synergy bonuses** like
  "+10% if two Fire units" — those just create a new optimal team. The faction matchup matrix is
  **not** that pattern: a synergy bonus rewards your own line-up and asks nothing of the encounter,
  while a matchup multiplier is a statement about the fight in front of you. Keep matchup edges
  small — five to ten percent.
  - ⚠️ **The faction lineup bonus overrode the first half of that rule, once, knowingly, and the
    override does not generalise.** It survives on one argument: **a mono-faction bonus does not
    create one optimal team, it creates seven**, and the matchup decides which to bring. Any _new_
    proposal of this shape argues its own case — "the lineup bonus did it" is not the argument. A
    bonus for specific characters, a role mix, or anything resolving to one best answer is still
    forbidden. See [rejected](../../docs/rejected.md) and [combat](../../docs/combat.md).
- **A faction is only a team if it owns sustain and a way past a front rank.** Rank is a gate, not a
  damage reduction — a party with no back-rank targeting cannot _select_ a protected healer, so an
  encounter built around one is unwinnable rather than hard. `data/characters.spec.ts` asserts it.
  **Monsters are the deliberate exception on sustain**: `lifeLeech` and a siphon rather than a
  healer, because giving that faction a support would solve a composition problem by deleting the
  faction.
- **The roster is three common, three legendary and at least one ascended per faction** — the first
  two exact, the third a floor, because ascended tier is where new characters arrive. Changing the
  closed half is a design decision: edit the shape in `data/characters.spec.ts` and record the
  argument in [history](../../docs/history.md) rather than letting it drift.
  - **A new ascended-tier character is four files and no `core/` change**, and ⚠️ **one of the four
    is a row in `data/signature.ts`, which is not optional.** **Fill a role the faction lacks**
    rather than sharpening the axis again.
- **`Numeric` wraps `break_infinity` and the hedge is retired.** Levelling is ×10⁹ and the rung
  ladder ×450, so a late-game stat block is past float64's safe range on its own.
- **An enemy is a level-1 stat block plus a tier, and a stage is archetypes plus a `level`.** Both
  sides of the board climb the same curve, which is what keeps a lock a lock instead of letting it
  decay into an empty square. Author an archetype's _shape_ and let the stage's level say how big it
  is; do not write a second, bigger stat block for a later band. There is deliberately **no
  ascension rung on the enemy side.**
- **A stage authors its line-up and its level and nothing else**; the rates, the lump and the
  first-clear crystals are derived from where it sits. Whether it is a mini-boss or a boss is a
  **rule, not a field**. See [ladder](../../docs/ladder.md).
- **The board constraints, the level line and what a session owes are in
  [authoring](../../docs/authoring.md).** Read it before authoring a chapter or tower floors.

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
- **`@angular/cdk` is the sanctioned answer for modals**, unlike Angular Material, which is
  removed. It is not a UI framework — it is an accessibility primitives library. **It is in use
  since milestone 13**: `ui/reset-dialog.ts` is the app's first and so far only overlay, opened
  through the headless `Dialog` from `@angular/cdk/dialog`. Its presence is still **not** a
  precedent for installing anything else speculatively.
  - **Use `Dialog`, not a hand-rolled overlay.** Focus trapping, focus restoration to the control
    that opened it, `aria-hidden` on everything behind it, and Escape to dismiss are four things a
    hand-written dialog gets wrong and four things AXE and WCAG care about. `settings.spec.ts`
    covers the restoration case, and it needs a **keyboard** open (`press('Enter')`) — WebKit does
    not leave focus on a clicked button, so a mouse-driven version asserts nothing.
  - ⚠️ **Override the scroll strategy with `createNoopScrollStrategy()`.** CDK defaults to
    blocking, which works by putting `position: fixed; overflow-y: scroll` on `html` — a fix for a
    document that scrolls, and this one deliberately never does. The backdrop already stops a touch
    reaching the screen underneath.
  - **The two prebuilt global stylesheets are no longer needed, and adding them is the mistake
    now.** CDK 22 self-loads both through `_CdkPrivateStyleLoader` — `_CdkOverlayStyleLoader`
    carries what was `overlay-prebuilt.css`, `_VisuallyHiddenLoader` what was `a11y-prebuilt.css`.
    Nothing is wired into `angular.json`, and the overlay renders correctly without it. Advice to
    add them is real but stale; read `node_modules/@angular/cdk/fesm2022/` before believing it.
  - **Set `ariaModal: true` explicitly.** CDK gives `role="dialog"` and hides the background, but
    leaves `aria-modal` off by default.

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
  — `[the history](docs/history.md)`, not `[the history](../docs/history.md)`. The copies
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
    an `InjectionToken` whose default factory reaches the real thing, so the test overrides a
    provider rather than a module. `KEY_VALUE_STORE` in `ui/save.service.ts` is the worked
    example, and its doc comment records why the obvious alternative was rejected.
  - ⚠️ **A token wrapping a Capacitor plugin must _forward_ to it, never hand back the plugin
    object.** A plugin is a `Proxy` whose `get` trap answers **every** property with a callable, so
    `typeof plugin.ngOnDestroy === 'function'` — which is exactly the test `R3Injector` uses to
    decide a provider needs tearing down. Angular then calls `ngOnDestroy()` on it at teardown, that
    reaches the bridge, finds no such native method, and rejects. `factory: () => Preferences` is
    the obvious authoring and it is the bug. Both shipped tokens now return a plain object of
    one-line forwarders, which is the whole reason to keep the interface beside them narrow.
    - **It presents as a green suite that still fails the build.** Every test passes and vitest
      exits 1 on unhandled rejections, one per injector teardown, attributed to whichever spec was
      running rather than to the token. Nothing types wrong and no assertion fails, so the guard is
      a test on the **shape of the resolved default** — in `save.service.spec.ts` and
      `notifications.service.spec.ts`.
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
  time-to-afford assertion. The same applies to `data/ascension.spec.ts`, which derives every
  per-tier total from the authored rungs rather than restating them as constants.
- **Prefer a threshold that fails when content outgrows it** to one that documents an intention.
  When such a test fails after new content lands, the right response is to retune deliberately —
  not to move the threshold to make it green.
- Conformance is asserted through **typed locals** (`const chapters: readonly ChapterData[] =
CHAPTERS`) rather than annotations on the data itself, because `data/` may not import `core/`.
  That assignment is what turns a malformed stat block into a compile error.
