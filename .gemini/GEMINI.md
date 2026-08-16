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

- **[docs/glossary.md](../docs/glossary.md)** — the vocabulary, and the words that mean more than one
  thing. **Read it before writing prose about tiers, rarities or factions**; several terms collide
  by design and the collisions are listed there.
- **[docs/history.md](../docs/history.md)** — what shipped in what order, the decisions no system doc
  owns, and **what is still open**: presentation, onboarding, and how long the campaign is meant to
  be. Every numbered milestone is complete.
- **[docs/authoring.md](../docs/authoring.md)** — the procedure for adding a chapter or a hundred tower
  floors: what a session owes, the level line (**bisect, do not solve**), the board constraints, the
  prose check, and the schedule of guards that fire next. **Read it before authoring content.**
- **[docs/rejected.md](../docs/rejected.md)** — everything ruled out and why it stays ruled out:
  prestige, the segmented offline solver, `timeToClear`, `dropCarry`, the offline cap, role-locked
  placement, flat synergy bonuses, anti-cheat, export/import, and the genre systems this game will
  not have. **Read it before proposing anything on it**; the arguments are recorded so they do not
  have to be re-derived.
- **[docs/testing.md](../docs/testing.md)** — the balance sweep and what it has caught: the fast/balance
  split, the two tuning targets, the guards that stand where a mechanic used to, striding versus
  shrinking the sample, derive-never-retype, and how to tell a rotting guard from real content drift.

**The simulation**

- **[docs/combat.md](../docs/combat.md)** — the ATB loop, the damage formula, targeting, skills, energy
  and ultimates, statuses, the event log, and the RNG draw discipline. ⚠️ **Rules marked there are
  termination arguments, not balance knobs** — relaxing one lets `simulateBattle` fail to return.
- **[docs/attributes.md](../docs/attributes.md)** — the combatant stat block, which stats may scale and
  why, and what the milestone 8a collapse to one `atk` and one `def` cost.

**Progression**

- **[docs/ladder.md](../docs/ladder.md)** — the campaign: twenty-two chapters, one thousand and thirty
  stages, what a stage authors, position versus clear count, the rung cadence, and the guards that
  were retired. ⚠️ **Chapter 18 moved the ascension rung to `mythic` and chapter 22 moved it to
  `mythic-plus`; both are overrides against the log-space rule, and they are the only two the
  campaign has.** Chapters 19, 20 and 21 all _stayed_ on `mythic`, and that a stay is a derivation
  rather than an override is the point: what licenses an override is the seam _below_ being wrong
  (under 1.00) **and** the pool being unable to supply a board — never the margin being large and
  never this chapter's own seam being small. ⚠️ **Chapter 21's own seam was 0.8241, under 1.00, and
  it still did not license an override, because its chapter was authorable.** Chapter 22's is
  licensed because it is not: at level 515 the **five lightest bodies in the game read 0% against a
  `mythic` five**. ⚠️ **What binds is the pool rather than the seam**, and the arithmetic has now been
  right and early twice — `mythic` was projected to buy three chapters and bought one and a half.
  **Measure the pool before re-deriving the seam.** The degenerate chain reached four links on
  `mythic` and restarts at one on `mythic-plus`.
- ⚠️ **A chapter is fifty stages up to chapter 19 and sixty from chapter 20, and the cap is a
  _schedule_ rather than a constant** — `CHAPTER_CURVE.raisedMaxFromChapter` / `raisedMaxStages`, so
  the length stays derived and `chapters.spec.ts` still holds every chapter equal to `chapterSize`.
  ⚠️ **A raised cap may only ever apply forward and `chapterSize` refuses a lowering**: shortening a
  chapter that has shipped teleports every run standing past its new last stage. ⚠️ **The slope is
  the rule and the span is the consequence** — sixty stages at half a level a stage is **thirty**
  levels of climb rather than twenty-five, which is a further ×1.11 of squeeze on a party whose cap
  does not move. [ladder](../docs/ladder.md)
- **[docs/ascension.md](../docs/ascension.md)** — the sixteen-rung ladder, the two paths, what a rung
  costs, and the three rungs that also hand over a skill.
- **[docs/level-resonance.md](../docs/level-resonance.md)** — the level the whole roster shares. **Read
  it before writing anything that reads a character's level.**
- **[docs/gear.md](../docs/gear.md)** — the third progression axis: five slots, five archetypes, a
  five-rung grade ladder, and the hourly gear shop. ⚠️ **Enemy gear is texture, not escalation** —
  measured four times, at three grades, and a whole grade step is worth about ×1.15 against the ×3 it
  would need; chapter 16's whole Relic ramp measured **0.08 of a survivor** and chapter 17's the same
  ramp **0.05**. Read it before planning a chapter's difficulty around it. ⚠️ **The grade ladder is
  exhausted and chapter 17 is the first chapter that could not step it** — every board in The
  Quickmire carries Relic 100 flat, and a sixth grade is a `data/` rule change rather than a chapter.
  ⚠️ **The campaign's gradient came from a rarity cap for six chapters and chapter 18 ended it.**
  Chapters 11 through 17 all sat on `legendary-plus`, whose cap of 260 the ladder passed at chapter
  12, so every chapter's boards had to fall by exactly `perLevel.common ** -25` = **0.595 a chapter,
  by construction** — the seam ran 10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 → **0.9608**, below
  1.00 for the first time, and the board budget fell through the floor of the shipped enemy pool
  (chapter 17 had to be authored **57.7% new** because only 13 of 221 blocks were light enough).
  ⚠️ **A chapter 18 on that rung was arithmetically impossible**: the budget would have been 129 → 91
  common-equivalent per body, and of 238 shipped blocks **five** sit at or under 129 and **none**
  at or under 91. **The move to `mythic` is what fixed it**, and it needed no `data/` rule change —
  see below. ⚠️ **The same arithmetic restarted one rung up at chapter 19**: `mythic` caps at 340
  against The Backcut's close of 425, so the 0.595-a-chapter halving resumes and the rung buys about
  three chapters. See [authoring](../docs/authoring.md).
- **[docs/signature-items.md](../docs/signature-items.md)** — the fourth axis: one item per
  ascended-tier character, unlocked at `mythic`, thirty levels bought with emblems.
- **[docs/economy.md](../docs/economy.md)** — the seven currencies, income rates, the level curve, pull
  rates and pity, and offline accrual.

**Content modes**

- **[docs/towers.md](../docs/towers.md)** — seven faction towers, three hundred floors each. What a
  tower is for, the three fields a clear may never touch, the three crews, and seven towers' worth of
  measured escalation findings.
- **[docs/descent.md](../docs/descent.md)** — the daily roguelite run: three floors of three fights,
  attrition, and one card of three after every win. **The only content that asks a question
  mid-flight.** ⚠️ **Both this and Expeditions clamp the campaign anchor** — `anchorCap`, 316 and 322
  — because the anchor stopped standing for how strong the party is; read it before touching either
  mode's level line.
- **[docs/expeditions.md](../docs/expeditions.md)** — the puzzle maps: three hand-authored grids solved
  once each, a stamina budget, and an exit sealed behind a boss.
- **[docs/achievements.md](../docs/achievements.md)** — achievements and quests as ledgers over counters
  the run already keeps, which counters are legal, and the crystal payouts.
- **[docs/bounties.md](../docs/bounties.md)** — the bounty board: bench characters on timed missions,
  the daily rotation, and the disjointness rule that bites on the way out.

**Shell and persistence**

- **[docs/navigation.md](../docs/navigation.md)** — the tab bar's measured ceiling, Town as the hub,
  Home as the battle hub, the eight crews, and the routing rules. **Read it before adding a screen.**
- **[docs/platform.md](../docs/platform.md)** — the Capacitor shell, safe areas, the accessibility bar
  and the incidents that set it, `@angular/cdk` overlays, local notifications, and what platform
  backup does and does not cover.
- **[docs/saves.md](../docs/saves.md)** — storage, the migration chain, load-time repair, and fixtures.

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
  [level-resonance](../docs/level-resonance.md)
- **`setFormation(state, activity, …)` takes the activity as required, never defaulted.** A caller
  that forgot which crew it was editing would silently rewrite the campaign's.
  [navigation](../docs/navigation.md)
- **`trackProgress`, `allProgress` and `claimAchievements` all take a ladder, required.** A caller
  with no ladder reports the chapter track as having earned nothing, on every screen, forever.
  [achievements](../docs/achievements.md)
- ⚠️ **`GameState.stage` is the stage within its chapter, not a position on the whole ladder.**
  Reading it as a linear index is a bug that presents as **a player being teleported**.
  `stageIndex(ladder, position)` is the only way to a linear index. [ladder](../docs/ladder.md)
- ⚠️ **`chaptersCleared` and `clearedStages` are different numbers and both type-check.** Passing one
  where the other belongs is wrong by the size of a chapter. [ladder](../docs/ladder.md)
- ⚠️ **A geared chapter owes a `gearArchetype` on every block it fields, returning ones included**,
  and the ladder's grade level does **not** restart at 1 at a grade boundary — Worn 20 is worth 2.045
  and Sturdy 1 only 1.350, so a clean restart is a step backwards. [gear](../docs/gear.md)
- ⚠️ **An enemy's `gearArchetype` is a bare string and an absent one is silent.** A stage authoring
  `gear` prices a bonus per archetype; a body that declares none looks it up under `undefined`, gets
  nothing, and fights naked on a board tuned as though it were kitted — nothing throws and nothing
  renders wrong. `chapters.spec.ts` asserts every body on a geared board declares one and
  `enemies.spec.ts` asserts every declared value is real. Same trap as a mistyped stat key.
  [gear](../docs/gear.md)
- ⚠️ **`resolveStage` and `resolveLadder` take the gear rules, required and never defaulted.** A
  caller that omitted them would resolve every geared stage as an ungeared one — every screen would
  keep saying the right thing and only the balance sweep would notice. [ladder](../docs/ladder.md)
- ⚠️ **`toBattleCombatant` does not carry `CombatantData.opening`.** A character authoring a passive
  has it silently dropped; the only player-side route to one is a signature rung. `toEnemyCombatant`
  does carry it. [combat](../docs/combat.md)

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
  and demotes the entire roster. [saves](../docs/saves.md)
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
  in play, and it turns every recorded balance figure into a different number. [gear](../docs/gear.md)
- ⚠️ **Emblems roll from their own derived stream (`emblem:…`), never the gear sequence**, for the
  same reason. [economy](../docs/economy.md)
- ⚠️ **A pity curve is a floor under the same roll, never a second draw.** A curve drawing its own
  value breaks the invariant `rng.calls` rests on, and breaks it **silently**. [economy](../docs/economy.md)
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
  **This now binds on both sides of the board**: enemy gear is the same percentage off the same
  tables, which is why a geared stage authors a grade and a level rather than a stat line.
- ⚠️ **Anything additive, or any authored constant compared against a scaling quantity, breaks it.**
  Audit for those rather than waiting to notice.
- **The exception is a bounded rate.** `critChance`, `critDamageAmp` and `lifeLeech` take **points**
  rather than percentages, because a percentage of a bounded rate pays almost nothing.
  [descent](../docs/descent.md)
- ⚠️ **A level gap does not predict difficulty and the power ratio does, which is the same identity
  read backwards.** Party power is `perLevel ^ level × 1.6 ^ rung` and the ascension ladder moves the
  second term in **steps of 22.6 levels** (`ln(1.6) / ln(1.021)`) — so measured across nine Descent
  depths a gap of +44 read a full walkover and +49 read 3.75 survivors, while board-over-party power
  is monotone: 0.29 → 1.00 finished, 0.50 → 0.75, 1.02 → 0.00. **A ratio near 0.50 is a mode
  working.** Convert to power before picking a level for anything keyed off the campaign; the naive
  clamp to the rung's own cap reads 5.00 survivors because the party stands under its cap holding
  rungs. [descent](../docs/descent.md)
- ⚠️ **A mode keyed off "the hardest campaign stage cleared" needs a ceiling on it.** That anchor was
  standing in for how strong the party is, and the two stopped moving together at chapter 13: the
  campaign now runs above the level cap of the rung it is tuned for, so its finals are authored
  _lighter_ every chapter and the calibrated party has been flat while the anchor climbed a hundred
  levels. Uncapped, the Descent and Expeditions both read **0.00 finished** at the deepest depth the
  moment chapter 16 shipped. ⚠️ **The caps move when a chapter asks for a _rung_ above
  `legendary-plus`, not when a chapter ships.** [descent](../docs/descent.md)
- ⚠️ **A hand-picked list of sample depths acquires a hole every time the campaign grows; derive it
  from the chapter list.** Both mode sweeps sampled chapters 3, 5, 7 and the top, so **chapters 8
  through 15 went unmeasured** — and the Descent was reading 1.00 finished with **5.00 survivors** in
  the middle of that gap. ⚠️ **Deriving a sample silently re-points every index into it**: Expeditions
  measured its card control at `DEPTHS[3]`, the deepest sample before and chapter 6 after, and the
  assertion kept passing while measuring something else. **Name the depth; do not index the sample.**
  [descent](../docs/descent.md)
- ⚠️ **The Descent's difficulty sawtooths with the ascension ladder and no dial can flatten it.** The
  calibrated party gains a whole rung at once when the bisection crosses a level cap, so the power
  ratio dips to 0.29 at chapters 12–14 against ~0.52 elsewhere and those depths are walkovers.
  `anchorSlope`, `anchorCap` and the within-run ramp were each measured and each breaks other depths
  first — **the sawtooth is periodic in the ladder and every dial is smooth in the anchor.** The three
  depths — and, since chapter 18, the deepest one as well — are **pinned** by `RUNG_TROUGH` at
  4.85–5.00 survivors rather than dropped from the sample: visible, bounded, and self-deleting when a
  retune fixes it. ⚠️ **Chapter 19 turned the deepest-depth entry into a schedule**: `anchorCap`
  clamps the board at 316 from chapter 13 on, so depths 800 and 850 field the **identical** board
  while their parties are bisected against different finals — **one new entry per chapter, forever,
  until the board level is keyed off the calibrated party instead of the anchor.** Keep adding
  literals; do not derive the tail and do not drop the depths. [descent](../docs/descent.md)
- ⚠️ **When every reading saturates, tune against the sweep's own control rather than its outcome.**
  Expeditions is one-time content meant to become a completion, so every depth above its unlock reads
  1.00 finished by design and no anchor cap can be chosen on a finish rate. **A cap that reads 5.00
  survivors passes every assertion in that file while measuring nothing** — what chose it was the
  carded-against-bare margin: 0.00 at cap 316, +1.60 at 322, −1.30 at 328. Do not take the first green
  value. [expeditions](../docs/expeditions.md)

### The economy

- ⚠️ **No quest may be measured against `clearedStages`.** The test is not "is it monotonic" but
  **"can a player always make it move today"** — which also forbids `signatureLevels` and emblems
  held. `battleCount`, `pullCount` and `descentRuns` are the legal three.
  [achievements](../docs/achievements.md)
- ⚠️ **A tower or Expedition clear may never touch `clearedStages`, the ladder position, or an idle
  rate.** The clear count drives the idle crystal rate. [towers](../docs/towers.md)
- **Every quest reward is crystals and every achievement award is flat**; **a bounty pays a
  _duration_ of current idle income and never crystals.** The split is deliberate.
  [bounties](../docs/bounties.md)
- ⚠️ **Scale all three base rates together or none.** Every economy assertion is a ratio between the
  currencies, and a common factor cancels out of all of them. [economy](../docs/economy.md)
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
- ⚠️ **A board's raw health total is the wrong quantity to compare against, and it gets more wrong
  every chapter.** `perLevel` is 1.024 / 1.0225 / 1.021, so at level 350 an `ascended` block is worth
  **×2.784** of a `common` one and **×1.668** of a `legendary` one — up from ×2.587 and ×1.608 at 325.
  Measured, one chapter-15 board at 2,980 raw health read 4.00 survivors and another at 3,100 read
  **0%**, because in common-equivalent terms they were 4,283 and 5,581; and chapter 16's final is
  authored at **250 health and 24 attack**, which is **696 and 67** in common-equivalent terms.
  **Convert to common-equivalent weight before comparing two boards, and certainly two chapters.**
  [authoring](../docs/authoring.md)
- ⚠️ **A mechanic's worth is a function of where its board stands on the plateau, not of the
  mechanic, and a figure quoted without the weight it was measured at means nothing.** Measured at
  chapter 16's roof, `THORNMAIL` across a whole board is worth **0.00** survivors at 900 total
  health, **0.20** at 1,060 and **1.33** at 1,160 — the mechanic identical in all three rows. **State
  the weight with the figure.** [authoring](../docs/authoring.md)
- ⚠️ **A debuff caster the party cannot reach is the sustain-behind-a-taunt failure wearing a
  different stat.** A `WEAKEN`-on-`enemy-all` body measured **4.00 survivors in the front rank and
  0.10 in the back** at the same weight, because the party cannot aim past it and the status never
  lapses in practice. Put a board-wide debuffer where it can be killed. [authoring](../docs/authoring.md)
- ⚠️ **An anchor sweep that reads flat is usually a saturated control rather than an inert anchor.**
  Chapter 15's final measured 0% at every weight from 880/54 down to 520/34; the cause was a
  `RALLY`-on-`ally-all` body on the same board, worth more than the anchor's whole stat line at that
  budget, and removing it took the board to 100%. **Check the control can move before concluding
  anything.**
- ⚠️ **A scope, a reach and a selection are three different things, and the gap between the first
  and the third can be the whole mechanic.** Measured at chapter 17's weight, a `STUN` on
  `enemy-highest` is worth **0.00** survivors at one caster _and_ at two, while the identical status
  on `enemy-all` is worth **2.60**. Author the scope or do not author the mechanic — and say which of
  the three a prose claim is about, because conflating them has shipped a false claim four times.
  ⚠️ **Chapter 19 measured the sharpest version and it is a cliff with nothing in the middle**:
  `BLOODRISEN` from one carrier on `ally-all` is a **total wipe** — 3.88 survivors off a control at
  3.88 — from the front rank _or_ the back, where the same status on `self` across all five is worth
  0.15 and on `ally-lowest` 0.08. **There is nothing between 0.08 and 3.88, so no band can be built
  on it.** [authoring](../docs/authoring.md)
- ⚠️ **A reflect prices where the party is _aiming_, and on a protected back rank it prices at
  exactly 0.00 — the mirror image of a debuffer, same rank, opposite sign.** Chapter 16 measured a
  board-wide debuffer at 4.00 survivors in the front rank and 0.10 in the back, because the party
  cannot aim past it; chapter 19 measured `THORNMAIL` at **0.00 on the back three, 0.08 on the anchor
  alone, 0.38 on the front two and 0.95 across all five**, because a reflect only ever bills what is
  actually struck. **Neither is a fact about the status.** A whole chapter's difficulty curve can be
  one status walking forward a rank at a time. ⚠️ **And the all-five arrangement is a clock**: 0.95
  of a survivor at **68.7s** against the 0.80 bar's 72.0, where a link across the board plus a
  front-rank reflect is worth **1.63 at 55.0s** — harder _and_ thirteen seconds shorter. **Count the
  seconds as well as the survivors before choosing between two arrangements of one lock.**
  [authoring](../docs/authoring.md)
- ⚠️ **Two heavy anchors in one front rank is the failure, not any anchor, and it now has a campaign
  instance as well as a tower one.** At chapter 19's weight every returning Dwarf legendary reads
  100% with 4.00 of five **alone** behind four light bodies — the heaviest at 2,143 common-equivalent
  included — and two together read **0%**. ⚠️ **Two `enemy-back` turns on one body is the same trap
  on a stat line**: a 520/76 ranger carrying two read 0% beside any second legendary at 3,449
  common-equivalent where two other legendaries at 3,598 read 4.00. **Field each candidate anchor
  alone before concluding anything from a pair of stat lines.** [authoring](../docs/authoring.md)
- ⚠️ **A stat can work only _below_ its shipped register, which is the sixth answer the register
  check has given.** `haste` ships at a ceiling of 152 over a median of 98, and a board-wide 144
  reads **0.00 of five** at chapter 17's weight where 100 reads 3.80 — the opposite of the Monster
  Tower's `physicalResist`, which had to step past its register. **State which side of the register a
  band landed on, and scope the claim to what was measured**: The Quickmire's new blocks run 106–126
  while its boards reach 148 on a returning body. [towers](../docs/towers.md)
- ⚠️ **One board-wide turn per board.** Two is the most expensive shape available and it is easy to
  author by accident: chapter 17 paired two `SLOW` casters on one board and read 48%, and paired a
  `SLOW` or a `STUN` with a board-wide `HASTE` on two more and read 30% and 78%.
- ⚠️ **A synthetic control tells you a mechanic's price and nothing about a board.** Chapter 17 tuned
  fourteen sampled boards against generic stat blocks, all reading well, and the authored chapter
  then failed **22 of 50** on the real sweep — a block's kit and its escort are part of its weight and
  a stand-in has neither. **Measure every authored board before believing the chapter.**
- ⚠️ **Field all four of a lieutenant's appearances before settling its stat line.** An `ascended`
  block climbs at 1.024 against a party frozen at its rung's cap, so a recurring anchor correct on its
  first board is unwinnable on its fourth: chapter 17's graded **4.00 → 3.55 → 1.73 → fail** before it
  came down from 265/21 to 142/15.
- **Every archetype must be fielded somewhere**, and "somewhere" is every ladder rather than the
  campaign. Held by `data/enemies.spec.ts`, the only spec that sees both.
- ⚠️ **The status vocabulary is closed and does not renew.** Reach for the stat block before the
  vocabulary. [authoring](../docs/authoring.md)
- ⚠️ **A wide skill is capped at power 1.2 and a mechanic priced on one that is not is a mechanic
  nobody may author.** `skills.spec.ts` holds `enemy-all`, `enemy-row-front` and `enemy-row-back` to
  1.2; single-target turns are uncapped. Chapter 22 priced its whole premise on `enemy-row-front` at
  power 1.55 to 3.10 and **every row described a skill the game refuses** — the cap caught it, not
  the sweep, and re-measuring on the legal single-target form roughly halved the axis (0.09 / 0.43 /
  0.83 / 1.72 across power 1.20 / 1.90 / 2.60 / 3.60). **Check what a target is allowed to carry
  before pricing a mechanic on it.** [authoring](../docs/authoring.md)
- ⚠️ **The size of one instance of damage is a _dial_ where almost everything else at depth is a
  cliff, and that is what a six-band chapter needs** — but only as a **skill**. Traded on a single
  body's `atk` against its `haste` at held damage per second it is **non-monotone**: 3.08 / 2.39 /
  2.20 / **2.91** / 2.55 / **3.01** across ×1.0 to ×4.0 at 160 trials, because past about ×2.5 the
  body's period exceeds the fight and the second swing never lands. **Nominal damage per second stops
  describing a body once its cooldown is longer than the battle.** Board-wide the same trade is a
  dial to ×1.45 and then a cliff. [authoring](../docs/authoring.md)
- ⚠️ **The aim rule holds on a plain damage scope, and the first measurement of it was confounded.**
  The same escort body casting `enemy-all` at the wide cap is worth **0.07 of a survivor from the
  front rank and 0.42–0.64 from the back**. ⚠️ **A rank comparison must be carried on one body** —
  chapter 22's first table put the anchor in front and an escort behind and read the reverse. ⚠️ **And
  chapter 16's "put a board-wide caster where it can be killed" does not generalise from a debuff to
  damage**: that rule answers an unreachable status that never lapses (4.00 against 0.10), where a
  damage scope bills once and depletes. **Take the measurement, not the precedent.**
  [authoring](../docs/authoring.md)
- ⚠️ **A returning block's _kit_ can invert its stat line, and weight will not warn you.** Chapter
  22's `c22-s58` read **8% with 0.10 survivors** with the Order Serjeant at 1,706 common-equivalent in
  an escort slot and **4.00** with the Edgeturn Warden at 2,247 — a board 5% heavier being the easy
  one, because the lighter body carries a board-wide `RALLY` that is a total wipe at that weight. The
  same block is affordable three bands earlier. **Read what a returning block does, not only what it
  weighs.** [authoring](../docs/authoring.md)
- ⚠️ **A refusal can be a _joint_ condition on two stats, and stating only one of them ships a false
  claim.** Chapter 22 refuses fast bodies — but every board it lost in tuning lost to one that was
  fast **and** over 1,600 common-equivalent, while six blocks at haste 96–114 at or under 560 are fielded
  freely. Its header states the measurement (median `haste` 72 across 300 slots; everything above 92
  at or under 560) rather than the threshold it means. [authoring](../docs/authoring.md)
- ⚠️ **A status's price is a function of the board under it, and chapter 21 measured four inversions
  at once.** Against a control of 847 common-equivalent at level 485 reading 3.25 of five — roughly a
  third of chapter 20's weight — `CHAINBOND` on `ally-all` is worth **0.00** where chapter 20 read
  1.78; `WEAKEN` on `enemy-all` is a **total wipe from one carrier** (3.25) where chapter 19 read 0.30
  and chapter 20 read 0.95; `BLOODRISEN` on `self` across five is **1.98** where chapter 19 read 0.15.
  **Re-price every mechanic against this chapter's own control; a figure quoted without its weight
  means nothing.** ⚠️ **`SAVAGED` now carries _three signs on one status_** — −0.63 on a selection,
  −0.48 on a reach and **+1.27** on a scope — which is the scope-versus-selection rule with chapter
  20's negative arm attached. ⚠️ **`lifeLeech` is the rare reading that is a dial rather than a
  cliff**: 0.17 → 0.85 monotone across 0.05 → 0.40, zero timeouts to 0.25. ⚠️ **`tenacity` is the
  register check's eighth answer and it is flat** — 0.25 at 0.20 and 0.33 at 0.60.
  [authoring](../docs/authoring.md)
- ⚠️ **A mechanic can price with the _wrong sign_, and a taunt is the one that does.** Measured at
  chapter 20's control — 2,099 common-equivalent at level 455, reading 3.35 of five, and it moves —
  `OATHSHIELD` reads **4.00 on the front anchor, 3.80 on two carriers and 3.63 from the back rank**:
  worth **−0.65, −0.45 and −0.28**. Confirmed on the shipped `c19-s50` (3.25 bare, 3.63 with a
  back-rank taunt). The mechanism generalises: **a taunt concentrates the party's damage and
  concentration is what a party wants**, because one body dying drops a board's throughput faster
  than five bodies being chipped — which also makes it the **direct antidote to a link** (board-wide
  `ROOTBOUND` reads 1.00 of five and 1.63 with a taunt added). ⚠️ **Baiting the party's own
  `enemy-lowest` / `enemy-highest` selections with a stat line is worth −0.63 by the same mechanism**,
  so this is the one place "reach for the stat block first" does not help. **Price a chapter's
  premise mechanic before authoring its boards.** [authoring](../docs/authoring.md)
- ⚠️ **Common-equivalent weight counts _health_ and the `ascended` premium is on every stat**, which
  is what makes an ascended anchor mis-shortlist. At level 455 the premium is ×3.792 on defence and
  attack as well, and chapter 20's final read **0% at every stat line from 230/56 down to 110/20**
  with the fight lengthening at each step — chapter 19's escort signature pointing at the boss
  itself, with an innocent escort (four escorts and no boss read 4.00). What settled it was the
  **attack**: at 200 health, 30 reads 0%, 16 reads 13%, 10 reads 73%. Its lieutenant came down
  250/52 → **190/18** and its final 230/56 → **175/16**. **Shortlist on weight; settle on attack.**
  ⚠️ **Chapter 21 inverted the second half of that, so measure which of the two binds.** At level 485
  a fifth **`common`** body is free at any attack from 16 to 30 — 4.00 of five across the whole sweep
  — while a fifth **`ascended`** body grades **4.00 / 3.50 / 1.85 / 0.15** across 149 / 248 / 372 /
  496 common-equivalent with its attack held at 5. **An ascended anchor is fight length and the
  escort is the rate that converts length into deaths**: the same 496-weight anchor reads 0.15 behind
  an escort summing 89 attack and **3.92** behind one summing 68. Shortlist on weight, then settle on
  whichever of the two the escort leaves free. [authoring](../docs/authoring.md)
- ⚠️ **Make board weight smooth in the stage index when the locks step at band boundaries.** A
  per-band weight drop cancels against the new band's lock and reads as a step _backwards_ on the
  probe — `c20-s53` measured 0.780 against the 0.85 bar. ⚠️ **And a mini-boss is a peak nothing
  covers**: the boundary-skip in `chapters.balance.ts` is for a chapter _boss_ only, so the samples
  after a mini-boss are a chapter's thinnest margin (`c20-s13` read 0.860). Lift them — but **not in
  the closing band**, which has no weight to spare. ⚠️ **Chapter 21 fired the same rule at a _band_
  boundary rather than after a mini-boss**: `c21-s31` opens the first band to carry two locks at once
  and measured **0.849** against the 0.85 bar, because the weight drop that paid for the new lock is
  the only half the probe can see. **A band that adds a lock opens heavier, not lighter.**
  [authoring](../docs/authoring.md)
- ⚠️ **A pool wall can be a _faction_ wall, and chapter 20 is where that distinction mattered.**
  Twelve blocks sit under 150 health and **every one is a Monster**, while the four lightest Undead
  or Human blocks total 790 — so The Commonage had to author bodies at 150 and 170 to have a closing
  band while the light bodies it needed already existed in a faction it could not field. **Check the
  lean's own light tail, not the pool's.** ⚠️ **And the tail can be bounded by _attack_ rather than
  by weight, which chapter 21 is where it mattered.** The Longebb's Undead texture blocks are light
  enough for any board it authors — 150, 170 and 210 health — and carry **30 to 36 attack** against
  the light Monsters' 16 to 24, so its non-lean slots run **6, 6, 1, 6, 0, 0** across six bands and
  the closing two field none. That took the lean to **93.7% of board slots, the heaviest any chapter
  has carried**, which is only legal because Monster is the wildcard row of `FACTION_MATCHUPS` and
  costs the matchup nothing. [authoring](../docs/authoring.md)
- ⚠️ **A mechanic can be worth _only_ fight length, and that is the ninety-second clock rather than a
  difficulty.** Measured across chapter 14's whole refusal vocabulary — `def` past the register,
  `physicalResist` to 0.60, board-wide barriers, aegises, guards and weakens, and instance size at held
  damage per second — **none is worth more than 0.08 of a survivor and several are worth eleven seconds
  of fight.** What moves a tuned party is the anchor slot, and its response there is a cliff. **Count
  the timeouts and check the control can move before believing either a positive or a negative.**
  [testing](../docs/testing.md)
- ⚠️ **Enemy _health_ is the sharpest instance of that rule and it grades 0.00.** Measured at chapter
  18's weight against five walls at level 390 with attack held fixed, health from **×1.0 to ×2.8** —
  absolute weight 14,043 to 39,321 — reads **4.00 survivors at every single row with zero timeouts**
  and buys nothing but fight length, 25.7s to 62.6s. Held the other way, attack from ×1.0 to ×1.9
  reads 4.00 → 4.00 → 3.92 → **0.00**. **A durability chapter's identity is its health and its
  difficulty is the attack standing behind it**; pushing health alone walks the chapter into the
  timer rather than making it hard. [authoring](../docs/authoring.md)
- ⚠️ **A final that fails at every stat line is its escort, and the fight getting _longer_ as the
  boss shrinks is the tell.** Chapter 19's final read 0% from 660/70 down to 380/46 with the fight
  lengthening at every step; removing one legendary from its escort let the boss sit at 520/58
  reading 100% with 3.36 of five. Same rule as chapter 15's anchor sweep, on a final.
  [authoring](../docs/authoring.md)
- ⚠️ **No scalar predicts a board, and three were tried at chapter 18.** Common-equivalent health,
  attack-equivalent and a throughput product all mis-rank the shipped boards — a five-wall board at
  12,673 absolute weight reads 4.00 survivors where a five-attacker board at 12,920 reads **0.97** —
  because difficulty is throughput times fight length and fight length is set by the health. Use
  common-equivalent weight to _shortlist_ and the **difficulty probe's own threshold** to budget a
  spine; measure every authored board before believing any of it. ⚠️ **Chapter 19 found the ordering
  can outright invert**: two tank escorts at 700/50 and 800/52 are _easier_ than two brawlers at
  620/52 and 640/60 despite more health, and `c19-s17` at 4,006 common-equivalent probes at 13,244
  where `c19-s25` at 4,244 probes at 11,593. [authoring](../docs/authoring.md)
- ⚠️ **Re-measure a projection before carrying it forward; chapter 18 is where one inverted.**
  Chapter 15 measured that a `mythic` party would need boards past the Unmade's ceiling and chapters
  16 and 17 both quoted it unchanged. Three further halvings happened underneath the claim, and by
  chapter 18 it was false by a wide margin: the `mythic` budget is 1,088 → 766 common-equivalent per
  body against a pool median of 1,295, and **116 of 238 blocks sit inside that band where 13 did a
  chapter earlier**. A horizon is a claim about a curve, and the curves in this project move.
- ⚠️ **A tower band's crew owes 23 more levels of margin for every rung it takes past the first**,
  because `ln(1.6) / ln(perLevel.common)` is 22.6. Reusing `ROOF_MARGIN` unchanged on a new hundred
  gives ×2.703 against the shipped ×1.689 — and **the failure is invisible in the sweep**, because a
  walkover and a correctly tuned low band both read 100% with five alive. Confirm the power ratio
  before concluding anything about the boards. [towers](../docs/towers.md)
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
  Undead Tower's third hundred retired **two** on that arithmetic. ⚠️ **The check can also come back
  clean, and which crew collapses is not stable** — the Monster Tower's floor-200 board reads
  100% / 3.45 for its _reference_ five at the new roof and **8%** for its alternate, the reverse of
  the other three, and none of its twelve anchors had to retire. Run the check regardless; a clean
  answer is a result. ⚠️ **The board and its anchors are two separate questions and the Angel Tower
  is where they came apart**: its floor-200 board reads **73% / 1.60 against 50% / 0.85** at the new
  roof, and every one of the nine `ascended` blocks it fields above floor 160 reads 100% for both
  crews there, the Unmade at 1800/100 included at 4.33 / 4.38. What failed was the **pairing** — two
  ascended in one front rank — so no anchor retired and no board in the new hundred carries two.
  ⚠️ **And the block that has to retire is not necessarily the heaviest — the Demon Tower is where
  that came apart.** Its floor-200 board reads **33% / 0.53** at the new roof, and behind light
  support at that level its heaviest block, `HOLLOW_SERAPH` at 1760/99, reads **100% / 3.83** while
  `THE_UNISON` at 1720/92 reads **98% / 0.23**. What fails there is the board-wide turn the previous
  hundred was built on rather than the weight carrying it, so **field each candidate anchor alone
  before concluding anything from the pair of stat lines.** [towers](../docs/towers.md)
- ⚠️ **A grade that costs survivors is difficulty; one that starts timing out is the ninety-second
  clock wearing a stat block. Count the timeouts explicitly** — a wipe and a timeout are the same
  `defeat`, so a win rate cannot tell them apart. This is what licensed enemy **durability** as the
  Undead Tower's third-hundred axis (four bodies from hp 700 to 2400 grade 3.85 → 1.30 survivors with
  zero timeouts anywhere) where enemy _sustain_ on the same crew is forbidden. ⚠️ **A board-wide ward
  is the shield rule in both directions**: worth a real 0.75 of a survivor mid-band, and on the roof
  it takes the same board from 100% to **75%** at 45s mean. A _self_-shield is worth 0.00, because it
  prices against the wearer's own `atk` on a body already dying. [towers](../docs/towers.md)
- ⚠️ **A tower's height is one rule for all seven, so a bump strands six of them.** A tower that has
  not been extended is not damaged — `clearedFloors` clamps — but it **loses its boss**, because
  `floorKindAt` reads the rules' height. Track them with a **literal `PENDING` list** in
  `towers.spec.ts` and `towers.balance.ts`; a filter ("the full height or two thirds of it") passes
  forever and never notices a tower nobody went back for. [towers](../docs/towers.md)
- ⚠️ **An escalation axis does not have to be a stat or a mechanic. The _size of one instance of
  damage_ is one, and on a crew that heals `ally-lowest` on a cooldown it is the only one.** Hold
  damage per second constant and make each blow bigger and rarer: against the Angel crews at the
  third hundred's roof level that grades 4.00 → 3.38 → 2.33 and 3.52 → 1.02 → 0.15 across power
  1.55/cd 35, 2.20/cd 50 and 3.10/cd 70, **with zero timeouts** — the burst body deals _less_ over a
  fight, because it basic-attacks between casts. A choir can out-heal a river and cannot out-heal a
  hammer. ⚠️ **The licence there is margin rather than exclusivity**, which is weaker than a
  Monster-Tower-style lock: the same swap costs every crew about a member (−0.63 to −2.08) and the
  Angel alternate 2.38. Say which of the two it is. [towers](../docs/towers.md)
- ⚠️ **Check a stat's shipped register before building a band on it, and say in the header which
  side of it the band landed on.** Five answers have come back: the Demon magic ward was worth
  **0.00** at its register and was declined; the Elf Tower's `critChance` worked **at** the shipped
  0.18 and only its roof stepped past; the Monster Tower's `physicalResist` works **only above**
  a register whose 0.23 ceiling is a lone outlier over a field of 0.12s, and was taken anyway on the
  measurement; the magic ward came back a second time on the Angel crew — which deals no
  physical damage but its basic attack and carries 0.12 of `magicPierce` across five — and was worth
  **0.10 and 0.35 of five from 0.15 all the way to 0.70**, so it was declined again; and the Demon
  Tower's `critBlock` worked **at** the Edgeturn Warden's shipped 0.24, costing the binding crew
  0.59 of five there against 1.50 at 0.50, with only the roof past it. ⚠️ **A stat that
  reads as designed for a crew is not evidence; measure it.** ⚠️ **Read the damage formula rather than the stat names to decide whether a lock is
  _this_ crew's**: Monsters carry the game's only real `physicalPierce`, and pierce multiplies `def`
  while resist is applied afterwards untouched — so the crew built to open armour has no answer to
  that wall, while the Elves, equally 100% physical, lose 0.00 to it. ⚠️ **And check the control can
  move before believing a flat grade** — the Demon crit grade first measured **completely inert**
  against a control that also read ~4.00 of five, because a Demon five loses its glass cannon to
  anything and its other four to almost nothing, so 4.00 there is a plateau rather than a midpoint.
  [towers](../docs/towers.md)
- ⚠️ **A prose claim phrased as a threshold has its range grow underneath it.** "Above floor 160"
  meant forty boards when it was measured and a hundred and forty after the next hundred landed —
  which is how one session shipped a false claim, corrected it, and got the correction wrong the
  same way. **State the range you measured, not the threshold you mean**, and re-run the prose check
  after the new content lands rather than only before it. ⚠️ **Three towers have now shipped the
  same wrong claim, and it is always the word "regeneration"** — Dwarf, Monster and Angel each said
  no board above some floor carried one while `recovery` sat on the anchors underneath. `recovery`
  and `healthRegen` are a regeneration in the plain sense and a `regen` **status** is not the same
  thing; name the four separately or the claim is false the day it is written. The fix is always the
  claim, never the boards. ⚠️ **The Demon third hundred is what the fix looks like written down
  first**: rather than an absolute, its header states the counts it measured — 26 boards carrying
  `recovery`, 36 `lifeLeech`, one `healthRegen`, 21 fielding a heal, drain or shield kit — and makes
  its only absolute claim about **the roof**, which is one board and stays checkable. ⚠️ **The same
  failure has now happened once about _aim_ rather than sustain, so it is not a fact about the word
  "regeneration".** The Angel Tower's roof shipped "names nothing but the front rank" while carrying
  an `enemy-all` turn and an `enemy-row-back` one — **named in the very next sentence of its own doc
  comment**. A _scope_ (`enemy-all`), a _reach_ (`enemy-row-back`, `enemy-back`) and a _selection_
  (`enemy-lowest`, `enemy-highest`) are three different things and none of them is "the front rank";
  say which one a claim is about. [authoring](../docs/authoring.md)
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

**Every numbered milestone is complete**; [history](../docs/history.md) records what shipped in what
order and what is still open, and [authoring](../docs/authoring.md) is the procedure for adding
content. Before starting work, check where the project actually is. ⚠️ **Do not assume any doc is
current — verify against the code.**

Read both before starting, and specifically before:

- reaching for **`@capacitor/app`** — deliberately deferred, and [platform](../docs/platform.md)
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
  cancelled rather than pending, and [rejected](../docs/rejected.md) records why each one stopped
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
  `timeToClear(state, stage)` was, and is cancelled; see [rejected](../docs/rejected.md).
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
  re-base licence above and [saves](../docs/saves.md) for the condition that closes it.
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
— which would re-open the arguments in [rejected](../docs/rejected.md). Do not implement either speculatively,
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
  starting advantage (see [ascension](../docs/ascension.md)) — with one deliberate exception since
  milestone 8c, which is that tier also caps how many skills a character may field.
- **A kit is authored at exactly its tier's ceiling**: two skills at `common`, three at
  `legendary`, four at `ascended`, ultimate included. Ultimate first, then in unlock order. Rule in
  [`core/roster/kit.ts`](../src/core/roster/kit.ts), table in [`data/kits.ts`](../src/data/kits.ts).
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
    forbidden. See [rejected](../docs/rejected.md) and [combat](../docs/combat.md).
- **A faction is only a team if it owns sustain and a way past a front rank.** Rank is a gate, not a
  damage reduction — a party with no back-rank targeting cannot _select_ a protected healer, so an
  encounter built around one is unwinnable rather than hard. `data/characters.spec.ts` asserts it.
  **Monsters are the deliberate exception on sustain**: `lifeLeech` and a siphon rather than a
  healer, because giving that faction a support would solve a composition problem by deleting the
  faction.
- **The roster is three common, three legendary and at least one ascended per faction** — the first
  two exact, the third a floor, because ascended tier is where new characters arrive. Changing the
  closed half is a design decision: edit the shape in `data/characters.spec.ts` and record the
  argument in [history](../docs/history.md) rather than letting it drift.
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
  **rule, not a field**. See [ladder](../docs/ladder.md).
- **The board constraints, the level line and what a session owes are in
  [authoring](../docs/authoring.md).** Read it before authoring a chapter or tower floors.

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
