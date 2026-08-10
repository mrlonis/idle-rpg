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

Long-form references live in `docs/`. This file states rules; those files explain systems. When
the two disagree, the code is right and both are stale.

- **[docs/milestones.md](docs/milestones.md)** — the roadmap. The status of every milestone, what
  each one shipped, and the reasoning behind each decision. **Single source of truth for project
  status**; nothing else restates it. It is the **numbered roadmap and nothing else** — work that
  shipped without a milestone number lives in the reference doc that owns the system.
- **[docs/navigation.md](docs/navigation.md)** — the tab bar's measured ceiling, Town as the hub,
  the test for what belongs there, the Bag rename, Home as the battle hub, and the routing rules.
  **Read it before adding a screen**; the "adding a tab at all" section below is stated there with
  its reasons.
- **[docs/rejected.md](docs/rejected.md)** — everything ruled out and why it stays ruled out:
  prestige, the segmented offline solver, `timeToClear`, `dropCarry`, the offline cap, role-locked
  placement, flat synergy bonuses, anti-cheat, and the genre systems this game will not have. It also
  carries the items **declined with a named trigger** (export/import, enemy gear, the enemy tier
  bands, stage generation) and the **fixes that were measured and failed**. Read it before proposing
  anything on it; the arguments are recorded so they do not have to be re-derived.
- **[docs/platform.md](docs/platform.md)** — the Capacitor shell, safe areas, the accessibility bar
  and the incidents that set it, `@angular/cdk` overlays, and what platform backup does and does not
  cover. The rules in "Mobile / Capacitor" and "Accessibility Requirements" below are stated there
  with their reasons.
- **[docs/testing.md](docs/testing.md)** — why the balance sweep exists and what it has caught: the
  fast/balance split, striding versus shrinking the sample, the zero-timeout and timer-headroom
  guards, derive-never-retype, the two traps in measuring a balance edge, and the single-slot
  composition probe nobody has managed to write.
- **[docs/glossary.md](docs/glossary.md)** — the vocabulary, and specifically the words that mean
  more than one thing. Read this before writing prose about tiers, rarities or factions — several
  terms collide by design and the collisions are listed there.
- **[docs/attributes.md](docs/attributes.md)** — the combatant stat block, which stats may scale
  and why, and what the milestone 8a collapse to one `atk` and one `def` cost.
- **[docs/ascension.md](docs/ascension.md)** — the sixteen-rung ladder, the two ascension paths,
  and what a rung costs. Since milestone 8c three of the rungs also hand over a skill.
  - **A rung costs copies of the character being ascended and nothing else.** Same-faction
    **fodder** was removed along with the recursion that priced it: rungs used to be quoted in
    _ascended_ copies and resolved into base ones, and they are now a flat integer per rung in
    [`data/ascension.ts`](src/data/ascension.ts). There is no `AscensionPlan`, no fodder pool, and
    no solver. A spare copy of a character you will never ascend is now inert — that is the
    known cost, and `docs/ascension.md` argues it.
  - ⚠️ **The two rungs below `rare` buy level cap and pay no stat multiplier.** `growthFloor`
    anchors the ×`perAscension` ladder at `rare` for **every** tier, which is why `common` tier
    starting two rungs lower did not make it stronger. This is what kept the entire stage ladder in
    tune across the change — all 32 balance sweeps pass with no stage edited — so paying those
    rungs a multiplier means re-deriving the ladder from scratch, not adjusting a constant.
  - **Tier is a head start, not a shorter climb.** Every rung charges every character the same, so a
    tier is worth exactly the rungs it skips: 10 copies for `legendary`, 20 for `ascended`. But only
    20 of the ladder's 92 copies sit below `elite` — the other 72 are the stretch every tier walks —
    so the totals land within ×1.27 of each other (93 / 83 / 73 mortal). What separates the climbs
    is the **stream**, not the price: measured through `pull()` with pity live, a specific
    ascended-tier character arrives ×4.1 less often than a common-tier one, so a higher tier is the
    **longer** investment (~2,800 / ~7,200 / ~9,000 pulls to ★5).
    - ⚠️ **This inverts what the ladder said before, deliberately.** The bottom used to carry the
      whole tier gap (28 of 45 copies) so every tier was a comparable commitment and ascended tier
      maxed _fastest_. Rungs 0–3 are still the only lever on the head start's size.
    - ⚠️ **Quote the tier rate ratio as ×4.1, not ×10.** ×10 is `TIER_WEIGHTS` alone; pity lifts the
      effective ascended rate 2.5% → 5.69% and lifts common not at all. Only the measured figure
      describes a banner anybody plays.
    - **Pulls are shared, so a per-character figure is a whole-tier figure.** The ~2,800 pulls that
      max one common-tier character max all twenty-one; the run-level number is the slowest case,
      ~11,400 pulls for the full 49-character roster.
  - ⚠️ **The celestial premium is sized against the total and lives on rungs 5–9 only.**
    `elite → elite+` and all five stars are shared. It was ×2 per rung when those rungs were 1s and
    2s (+6 copies, ~×1.2 on a climb); ×2 on today's rungs would cost +38 and reach ×1.5, the same
    rule charging a much heavier tax because the rungs underneath grew. It is ×1.5 now, and
    `ascension.spec.ts` holds the **ratio** rather than the factor for that reason.
  - ⚠️ **A rarity id protects against the ladder being reordered, not against a rung being inserted
    below it.** `chapters.balance.ts` fielded its reference parties at `rarityIndex('rare')` for
    exactly that protection and every one of them silently gained ×1.6² anyway. Anything meaning
    "how far has this been invested" must count rungs from a floor.
  - **Ascending happens at the Altar (`ui/altar-view.ts`, `/town/altar`) and nowhere else.** The
    character sheet keeps its Ascension panel — the price, and which skill the next rung unlocks —
    and links there instead of carrying a button. Do not put an ascend control back on the sheet:
    one rung per sheet meant a player holding duplicates of nine characters opened nine screens to
    make nine decisions that had no alternative in them.
  - **`ascendAll` climbs the whole roster greedily, and that is licensed by the pricing rather than
    by convenience.** Copies are spent on the character they are copies of and have no other use,
    so no two characters compete and nothing is foregone — which is why one press needs no
    confirmation. ⚠️ **A rung priced in anything shared makes this a choice again** and it goes back
    to the player rather than being resolved greedily. Its loop is bounded by the ladder, never by
    the copies: a rung a short table does not author reads as free.
- **[docs/combat.md](docs/combat.md)** — the ATB loop, the damage formula, targeting, skills,
  energy and ultimates, statuses, the event log, and the RNG draw discipline. **Rules marked ⚠️
  there are termination arguments, not balance knobs** — relaxing one lets `simulateBattle` fail to
  return.
  - **A fight is ninety seconds and running the clock out is a defeat.** There is no draw
    outcome; `MAX_BATTLE_TICKS` is the timer, and it is a rule of the game as much as a guard.
    The headroom over the longest tuned fight is **1.44×**, so a stage that takes longer than
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
  - ⚠️ **Closing pressure is the termination argument, and it is not a difficulty knob.** Past
    `PRESSURE_AFTER_TICKS` (500 — fifty seconds) every damage instance is multiplied by a factor
    rising `PRESSURE_PER_TICK` each tick without bound; **healing is deliberately not amplified**,
    which is what breaks any closed sustain loop. It applies to **both sides equally**, so it
    decides only _that_ a fight ends, never _who_ wins. Three things must stay true: every fight
    resolving inside the threshold stays bit-identical to what it was without this (which is what
    let it land on a shipped ladder with no stage re-derived); the factor stays a function of the
    **tick** alone, which is what preserves the whole-board rescale identity; and it is never
    reached for to make late content harder. Added in milestone 14a — see [combat](docs/combat.md).
  - One termination argument lives outside `core/`: milestone 8b deleted the MP pool that
    guaranteed a fight against a healer resolves, so an assertion in the balance sweep stands in
    its place. It reads **`BattleResult.timedOut`, not the outcome** — a timeout and a wipe are the
    same `defeat` on screen, so an outcome-based version of that guard silently tests nothing. Do
    not rewrite it in terms of the outcome, and do not narrow it to the parties that win.
  - **Four status kinds arrived in milestone 17 — `taunt`, `reflect`, `link` and `bomb` — and they
    are the last additions to a vocabulary that was fully in use.** All four ride the existing
    `status` effect rather than adding effect kinds, and the UI needed no change at all because
    `tick-damage` already says everything three of them produce.
    - **Milestone 18 held to that and shipped a whole chapter with no new mechanic**, which is what
      makes the claim above a rule rather than an intention. What it built from instead were
      **pairs** — two known parts on one block, asking what neither asks alone — and the matchup
      matrix leaned on hard enough to be a standing tax. ⚠️ **That well is real and it is not
      bottomless.** The next chapter that cannot find an unspent pair is the one that has to argue
      for growing the vocabulary again, on its own merits; "17 did it" is not the argument.
    - ⚠️ **A taunt overrides the row gate, which nothing else in the game does.** It narrows the
      pool **before** the row rule is consulted, so while one is up a back-rank bypass is worth
      nothing. Three clauses keep it answerable and all three are held by specs: multi-target
      selections ignore it entirely; it never empties a selection; and it is **never a passive** —
      the skill applying one carries a cooldown longer than the status, and no enemy `opening` may
      carry one. A permanent taunt in front of a healer is a fight a single-target party cannot
      finish, which the clock would have to end.
    - ⚠️ **Reflect and link cannot cascade, and the argument is structural rather than a depth
      counter.** Both resolve through `statusDamage`, which never re-enters the attack path — so
      thorns cannot answer thorns and a link cannot spread a share it was handed. Keep it that way:
      a counter is something a later edit can get wrong, and this cannot be.
    - ⚠️ **A link conserves damage and a lone holder takes the whole hit.** Both clauses are
      load-bearing: multiplying would be content inventing damage, and a share moved off a holder
      with nobody to share to would make the last survivor of a linked board unkillable.
    - **Reflect answers the killing blow**, read off the target before the hit resolves — otherwise
      a party with enough burst to finish in one swing steps around it entirely, taxing exactly the
      parties it is not aimed at. It is measured against what reached HP, so a shield swallows the
      answer along with the blow.
    - **A bomb is the mirror of a `dot`.** A poison punishes a slow kill continuously; a bomb
      punishes it once at a known tick, and a cleanse spent before that tick removes the whole
      thing — so the decision is _when_ to spend the answer rather than whether to.
    - ⚠️ **Two things in the loop changed shape and neither was reachable before.** An actor can now
      die inside its own action (a row attack into three thorned enemies is answered three times),
      so `act()` stops when it falls; and something can now die at a status expiry, so `decide` runs
      after the expiry pass. Do not remove either as dead code.
    - **`toEnemyCombatant` carries `opening` through**, which it did not until 17. That is how an
      archetype states a passive — thorns that are simply true of it, a link that binds a board from
      the first tick — rather than spending a turn on a skill to say what the stat block should say.
- **[docs/gear.md](docs/gear.md)** — the third progression axis, added in milestone 12: five slots,
  five archetypes, a five-rung grade ladder, and an hourly gear shop. The shop is a Town screen
  (`ui/gear-shop-view.ts`) and the bag is the fourth tab (`ui/bag-view.ts`); they were one screen
  until the tab became the Bag, and `docs/gear.md` records why the split was worth its one cost.
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
  - **How many pieces a clear drops is a range, rolled once per fight** — 1–3 ordinary, 2–5
    mini-boss, 4–8 boss. ⚠️ **The floor of 1 is a rule and the ceilings are tuning.** "A fight never
    produces nothing" is the same rule that makes a pull always produce something, so `dropCount`
    clamps the minimum up to 1 whatever `data/` authors — a range of `0..n` would reintroduce the
    drop _chance_ this design rejected. The ranges are meant to overlap; what `gear.spec.ts` holds
    is that each kind's floor **and** ceiling beat the rank below it.
  - ⚠️ **The count draw is the first draw in `rollDrops`, and its position is load-bearing.** Every
    later draw shifts by one, so moving it re-rolls every historical drop for a given seed —
    invisible in play, and it turns every recorded balance figure into a different number. The count
    is drawn once for the batch and the grade per piece, because they answer different questions:
    whether the _fight_ was lucky against whether the _piece_ was.
- **[docs/signature-items.md](docs/signature-items.md)** — the fourth progression axis, added in
  milestone 16: one **signature item** per ascended-tier character, unlocked at the `mythic` rung,
  thirty levels bought with **emblems**. Read it before touching `core/signature/` or
  `data/signature.ts`.
  - ⚠️ **A signature item is one integer on `OwnedCharacter`, not an object.** Zero is locked. There
    is exactly one per character, it can never move between them, be duplicated or be salvaged — so
    every field `GearItem` carries in order to be addressable would be dead weight. The character
    sheet drawing it as a slot is presentation.
  - **Ascended tier only, and both halves of the gate are enforced in `core/`.** `signatureUnlocked`
    checks the **tier** (which character was pulled) _and_ the **rung** (how far it was ascended) —
    the collision `docs/glossary.md` warns about, and here they are genuinely two different
    questions. An item pointed at a legendary-tier character is **inert** rather than an exception.
  - ⚠️ **A stored level survives a character no longer being eligible, and is not repaired away.**
    The emblems were spent; zeroing it would take back an investment to enforce a rule the player
    did not break. `repairOwned` keeps it and every consumer gates on `signatureUnlocked`, so it
    reads as inert. Both halves are needed.
  - **Stats every level, an ability at 1/10/20/30.** Neither works alone: thirty levels of stats is
    a treadmill with three interesting moments, and an ability with nothing between the marks makes
    twenty-seven levels purchases with nothing to show. ⚠️ Bonuses are **percentages summed with
    gear**, never flat and never compounded — same rule and same reason as `docs/gear.md`.
  - ⚠️ **An ability rung replaces the rung below it rather than stacking**, so each restates
    everything the earlier rungs did. That is why `skills` and `opening` are lists. The failure it
    makes possible: a rung that forgets a clause silently removes an upgrade the player just paid
    for, and nothing on screen shows it. `data/signature.balance.ts` measures reach at every rung.
  - ⚠️ **`effects` on an override replaces rather than appends.** "The same hit, harder" has to
    restate every clause including the status. An override naming a skill the kit lacks is inert.
  - **Merged at kit-build time in `toBattleCombatant`, never per tick** — the simulation loop never
    learns signature items exist, which is what makes an ability free at runtime.
  - ⚠️ **No signature item may multiply healing, and this is the least intuitive rule in the
    project.** Closing pressure amplifies damage without bound and deliberately does **not** amplify
    healing, so a party made unkillable by a sustain item does not win — it stalls, the ninety-second
    clock runs out, and a timeout is a **defeat**. The obvious signature item for a healer is the one
    that makes her lose. Seraphine's spends its rungs on shield uptime, dropped conditions and
    damage instead. A **shield is safe where a regeneration is not**: it banks a pool once and
    depletes, so it cannot outrun rising damage. `data/signature.spec.ts` asserts no opening status
    is a `regen`.
  - ⚠️ **No shipped content can measure one.** `mythic` caps at level **340**; the hardest authored
    stage is level **225**. A party at the unlock rung is half again past the top of the ladder, so
    every campaign fight is a walkover and `data/signature.balance.ts` has to re-level the hardest
    encounter to the party's own level — the same move `core/towers.ts` makes. ⚠️ **The Bound Marches
    and the Sundered Vault were each expected to close this and neither did**: the gap went
    ×4 → ×2 → ×1.5, narrowing by less each time because the level band flattens as content
    lengthens. What closes it is a chapter reaching the low three hundreds, roughly chapter 8 at
    the re-cut's fifty-stage cadence, or a tower band that does — check the number rather than
    assuming the next chapter is enough.
  - ⚠️ **Measure a signature item by bisecting for reach, never by win rate at a chosen level.** The
    contested band sits ~20% above the party's level and is ~40 levels wide out of a thousand, so
    any fixed choice is a walkover or a wipe — two versions of that probe reported a gain of exactly
    zero for two opposite reasons. In reach a maxed item is worth **+3% to +8%**; in win rate at a
    contested level the same item takes four of seven characters from **0.00 to 1.00**. Both are
    honest; never cite the reach figure as evidence the item is small.
  - **A new ascended-tier character needs a row in `data/signature.ts` and nothing else.**
    `data/signature.spec.ts` derives the count from `CHARACTERS`, so one without an item is a
    failing test rather than a permanently empty panel.
  - **`signatureLevels` is an achievement counter and must never be a quest one.** It is derived —
    the sum of `roster[].signature`, monotonic, storing nothing new — which is what makes it a
    legitimate achievement counter. As a **quest** counter it is the failure `clearedStages` is
    banned for and worse: it stops at 210 once all seven are maxed, and it does not move at all for
    the tens of thousands of pulls before the first item unlocks.
  - ⚠️ **No quest may be measured against emblems _held_ either**, for a different reason: a quest
    window stores a baseline and progress is a subtraction, so a balance that falls when spent
    reports negative progress. Every valid quest counter is monotonic and a wallet balance is not.
    See [rejected](docs/rejected.md) for the third candidate and the trigger that revisits all of it.
  - **Emblems are paid by exactly one achievement track — Chapter Conqueror, 100 a chapter.** ⚠️
    The two signature tracks pay **crystals**: an emblem award on an emblem-spending track is a
    partial refund that would make the last levels cheaper than the first and flatten a cost curve
    kept linear on purpose.
  - ⚠️ **"Not a tower track" is no longer a safe way to mean "a campaign track".** Signature tracks
    are a third economy, and both `data/achievements.spec.ts` and `data/towers.spec.ts` had helpers
    that inferred the campaign from that negation — one threw and the other silently measured
    signature awards against `stages.length`, inventing 85,000 crystals and taking the tower ratio
    from 3.2 to 1.4. Both now name the two campaign counters positively.
- **[docs/economy.md](docs/economy.md)** — the seven currencies, income rates, the level curve,
  pull rates and pity, and offline accrual. **Since milestone 11 no rate is authored per stage**:
  income is `base × stageIndex ^ 1.13`, evaluated by `stagePayout` in `core/ladder.ts` from four
  coefficients in `data/chapters.ts`. The exponent is calibrated so a stage pays roughly what the
  old hand-tuned ladder paid at the same **enemy level**, which is what stops a longer ladder from
  meaning a richer one.
  - **The base rates are 1 gold, 0.2 xp and 0.003 essence, doubled from the ladder they were
    derived against.** ⚠️ **Scale all three together or none.** Every economy assertion in
    `levels.spec.ts` is a ratio between the currencies or a comparison among them, and a common
    factor cancels out of all of them — the gear shop and the bounty board too, since both price in
    **seconds of the run's own income** rather than in amounts. Doubling one currency moves every
    one of those; doubling all three moves none.
  - ⚠️ **The one number not covered by that cancellation is the level ceiling in absolute hours,
    and its guard has already been spent.** Doubling took level 1000 from 1,175 hours of
    top-of-ladder idle income to 588, and `levels.spec.ts` was lowered from 1,000 to 500 rather
    than the level curve being steepened — because progression being twice as fast _was_ the
    change. **The next thing that raises income has to move the level curve, not that threshold.**
  - **Emblems are the seventh currency and the fifth rate**, added in milestone 16, and they buy
    signature item levels and nothing else. ⚠️ **The idle rate steps per _chapter_, not per stage** —
    a signature level costs a flat number of emblems forever, so a per-stage step over the shipped
    two hundred would multiply the faucet by thirty-three where a per-chapter step caps it at six.
    The re-cut opens the faucet in the first session (chapter 1 is ten stages), which changes
    nothing that matters: nothing can spend an emblem until `mythic`, so an earlier trickle only
    grows the stockpile waiting at that gate.
    - **There is no unlock flag anywhere in the save.** The rate is zero below one cleared chapter,
      which is the same fact expressed as arithmetic — nothing to lose, migrate or repair. There is
      no base either, unlike crystals: nothing can spend an emblem until a character reaches
      `mythic`, so a base would be a number climbing in a wallet with no screen able to explain it.
    - ⚠️ **`RATE_CURRENCY_IDS` and what a stage may _author_ are now two different lists.** `emblem`
      has a rate and no stage may pay one; `STAGE_CURRENCY_IDS` in `core/battle/types.ts` is the
      authorable set and `satisfies` the keys of `AuthoredCurrencies` so they cannot drift. Adding
      `emblem` there would be a third mechanism on one currency, and a **silent** one — `raiseRates`
      takes the larger of the two, so whichever happened to be bigger would quietly win.
    - ⚠️ **Drops still outweigh the idle rate (~15 an hour against 6 at a full clear), and the
      intuitive reading is backwards.** The naive sum is `60 fights/hr × 2% = 1.2/hr`, but the stage
      an auto-battler grinds is the **last** one — the position stops climbing so the top stage
      stays farmable, and the last stage of a chapter is a **boss**, the 25% row. That is ~15/hr.
      Retuning a drop chance is an economy change of the same size as retuning the rate, and
      `data/emblems.spec.ts` measures the **boss** case for that reason.
    - ⚠️ **Emblems roll from their own derived stream (`emblem:…`), never from the gear sequence.**
      The count draw in `rollDrops` is its first draw, so adding a draw there re-rolls every
      historical gear drop for a given seed. A miss is not "a fight that produced nothing" — the gear
      drop already pays unconditionally — but that licence is narrow and would need a floor if gear
      drops ever became conditional.
    - **`chaptersCleared` lives in `core/ladder.ts` and is derived, never stored.** Both the emblem
      rate and the achievement chapter track read it; two implementations is how a progress bar ends
      up disagreeing with the income drawn beside it. ⚠️ Passing `clearedStages` where the chapter
      count belongs type-checks and is wrong by the size of a chapter.
  - **The banner keeps two pity curves, not one**: legendary-or-better within 10 pulls (soft from 6
    at +25pt, certain at 9), ascended within 30 (soft from 20 at +15pt, certain at 27). They bound
    different complaints — how long a run of nothing can get, against how far away the top tier can
    be — and one counter cannot do both. `GameState` stores both; `state.pity` is still the
    ascended one.
    - ⚠️ **The legendary curve is a floor under the same roll, never a second draw.** It raises the
      threshold the single tier roll is compared against, which is what keeps consumption at exactly
      three draws per pull. A curve drawing its own value breaks the invariant `rng.calls` rests on,
      and breaks it silently — nothing about the results would look wrong.
    - ⚠️ **At base rate that floor equals the proportional split exactly, and `TIER_WEIGHTS` summing
      to 1 is what makes it so.** A run inside the flat stretch of both curves therefore draws
      precisely what it drew before the second curve existed, and the floor can only ever raise the
      legendary threshold — which is what stops deep ascended pity being undone by a freshly cleared
      legendary counter. Weights summing to anything else put the two mechanisms quietly out of step
      from the first pull.
    - ⚠️ **A hard cap moved is a soft ramp re-derived, not clipped.** Taking ascended pity from 50 to
      30 left `softPityStart` at 30, which is a flat 2.5% for twenty-nine pulls and then a cliff —
      no ramp at all. The "certainty arrives before the cap" assertion in `banners.spec.ts` is
      **proportional to the cycle** for the same reason: three pulls of headroom is a tenth of a
      thirty-pull cycle and nearly a third of a ten-pull one.
    - **The base weights did not move, and holding them steady was the decision.** A rate is what a
      player is promised and pity is what they actually get; lowering the weights to keep the
      effective rate flat would be a rate cut dressed as a floor.
- **The ladder is chapters, and where a run is, is a chapter and a stage within it.** Read
  [`core/ladder.ts`](src/core/ladder.ts) before touching progression.
  - **Six chapters ship — 10, 20, 30, 40, 50 and 50 stages — the same two hundred the four-chapter
    cut carried, re-cut in milestone 19 so the boundaries land where a session does.** The curve is
    a ramp to a permanent cap of fifty (base 10, step 10, band 1, max 50); the long ladder is more
    chapters, not longer ones. ⚠️ **Every chapter ends on a boss fielded nowhere else, as a rule**:
    the Fenlord, the Pale Warden, the First Cinder, the Ashfall Sovereign, the Chainsworn and the
    Hollow Seraph — a re-cut that moves a boundary owes the new final a unique body before it
    ships. Auto-battle unlocks when chapter 1 falls (`AUTO_BATTLE_UNLOCK_CHAPTERS = 1`, resolved
    through `chaptersCleared`), and all seven towers open with it.
  - ⚠️ **The re-cut changed what a stored position means and wrote no migration** — dev-only saves
    clamp backward and re-climb, which [saves](docs/saves.md) records along with the one-line exact
    remap that becomes mandatory if chapters are ever re-cut after release.
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
    from the formula — a build that ships six chapters must not be talked into believing it has a
    hundred.
  - ⚠️ **A chapter that asks for a new ascension rung has to out-climb the rung it asks for**, and
    the Bound Marches (chapter 5) are the first content where that bites. A rung is worth ×1.6 and
    the enemy side has **no rungs at all**, so a party matching the enemy's level from one rung
    higher is ×1.6 ahead of it — every stage a walkover, with nothing in the numbers looking wrong.
    Twenty-three levels is what ×1.6 costs at `perLevel.common`. The Bound Marches therefore close
    at enemy level **160** against `elite-plus`'s cap of 140, and the Sundered Vault (chapter 6) at
    **225** against `legendary`'s cap of 200 — the reference party finishes each twenty and
    twenty-five levels below the thing it is fighting. Chapters 1 through 4 never met this because
    each ran inside a cap the party already had.
  - **A rung per fifty-stage band is the cadence** — it read "one rung per chapter" until milestone
    19 multiplied the boundaries without moving a rung ask — and it is load-bearing well beyond the
    ladder: 20 copies by the end of the fen's fifty stages, 24 by the Marches, 32 by the Vault. ⚠️
    **It is the assumption under the levelling-versus-ascension guard** — a band climbs ~65 levels
    and a rung only pays for 22.6, so the two axes drift apart by construction and the guard
    measures the **share** rather than the ratio for that reason.
  - **Adding a chapter is an economy change as much as a content one**, and expect roughly four
    guards to fire. Only some of them will be about the chapter. ⚠️ **Sort them first into "content
    outgrew a threshold" and "this ratio moves every chapter regardless"** — the first is a real
    retune and the second is a guard that needs re-deriving, and milestone 18 found three of the
    second kind at once. See [economy](docs/economy.md) and [testing](docs/testing.md).
- **[docs/level-resonance.md](docs/level-resonance.md)** — the level the whole roster shares, added
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
- **There is no "the formation". There are eight crews, keyed by activity**, since milestone 15a.
  Read [`core/activity.ts`](src/core/activity.ts) and `FormationBook` in
  [`core/state.ts`](src/core/state.ts) before writing anything that reads who is fighting.
  - ⚠️ **`GameState.formations` is a record, and `state.formation` no longer exists.** Every write
    goes through `setFormation(state, activity, …)` with the activity **required rather than
    defaulted** — for the reason `toBattleCombatant` takes a level rather than reading one: a caller
    that forgot which crew it was editing would silently rewrite the campaign's, and every screen
    would keep showing the right thing until the player started a fight with the wrong five.
  - **An unknown activity key is kept on load, not dropped** — the same call `parseAchievements`
    makes. A crew for a tower this build has not shipped costs two short arrays; dropping it costs a
    player their line-up every time they move between builds.
  - ⚠️ **One character may stand in several crews at once, and that is not damage.** Only one
    activity is fought at a time. What stays forbidden is standing twice _within_ one crew, which is
    the state that would let a fighter act twice — so the decoder's dedupe set is scoped **per
    formation** and must stay that way.
  - **A faction lock is content, so `core/` does not enforce it — `partyMeetsLock` does, and both
    the editor and the battle path call it.** Two implementations of one rule is how a screen ends
    up promising a legal crew that the fight then refuses. The lock filters the pool rather than
    refusing a tap: a character it forbids can never enter, so listing them above the ones who can
    is a screen hiding its own answer.
  - ⚠️ **Standing in a crew reserves nobody.** Milestone 15b inverted the bounty board's
    disjointness rule, so a fielded character may be dispatched and a crew holding somebody away
    cannot fight. See the bounty section below; the one thing to carry here is that neither
    `setFormation` nor anything else in the formation path may refuse on the grounds that a
    character is busy elsewhere.
  - **Adding an activity is a row in [`data/activities.ts`](src/data/activities.ts) and nothing
    else.** ⚠️ An `id` is a save key and is permanent once shipped — renaming one silently disbands
    the crew standing in it. Change the `name` freely; never the `id`.
- **Faction towers are a second thing to climb**, and **all seven ship** — the system in milestone
  15b, the other six towers and the eighteen enemy archetypes they needed in 15c. Read
  [`core/towers.ts`](src/core/towers.ts) before touching them. Each is a hundred floors at enemy
  levels 1 to 60. Adding a tower is a row in [`data/towers.ts`](src/data/towers.ts), a matching row
  in [`data/activities.ts`](src/data/activities.ts), two achievement tracks, and its floors;
  `data/towers.spec.ts` makes a missing one a failing test rather than a tower with no way in, and
  holds **exactly one tower per faction** against `FACTIONS` rather than a literal.
  - ⚠️ **A tower clear may never touch `clearedStages`, the ladder position, or an idle rate.** The
    clear count drives the idle crystal rate, and the shipped two hundred stages already take it to
    ×3 the base — seven towers of a hundred floors feeding it would reach ×10, and the roster-relative
    ceiling in `banners.spec.ts` would put the whole roster inside three weeks. Progress is one
    integer per tower in `GameState.towers`, and
    `applyTowerResult` is a separate function from `applyBattleResult` rather than a branch inside
    it, precisely so the campaign fields are not in reach.
  - **A floor is climbed once.** `nextFloor` returns `null` at the top rather than clamping, which
    is the whole difference from the campaign — whose position stops climbing so its last stage
    stays farmable. Clamping instead would let a player re-clear the top floor and be paid again.
    ⚠️ **That `null` propagates all the way to the controls**: `BattleService.nextFight` returns
    `null` for a topped tower and for one the campaign has not opened, and both the Go Again button
    and the crew editor's Fight control are inert on it. A control that only asked whether the
    _crew_ was legal would look live and silently do nothing.
  - ⚠️ **A floor's level is derived, never authored.** `data/` authors who stands on each floor;
    `floorLevel` draws the straight line from `baseLevel` to `topLevel`. Typing a hundred levels
    that must follow a formula is the retyping [testing](docs/testing.md) forbids.
  - **The lump and the gear grades are matched by _enemy level_, not by floor number.** Floor 100 is
    level 60 where campaign stage 100 is level 85, so index-matching would pay the top of the ladder
    for a fight two thirds as hard. `matchedStageIndex` scans the resolved campaign ladder, so
    retuning the campaign carries every tower with it and no tower-side number can go stale.
    ⚠️ **It does not follow that a floor always pays less than the stage of the same number** — the
    campaign's level curve is nearly flat through chapter 1's tail where the tower's is linear, so
    floor 26 (level 16) matches stage 36 and is paid more. That is correct: it is the harder fight.
  - **A tower is faction-locked, and the lock lives in [`core/activity.ts`](src/core/activity.ts).**
    `partyMeetsLock` is called by the editor **and** the battle path — two implementations of one
    rule is how a screen promises a legal crew that the fight refuses.
  - **All seven open when chapter 1 falls — ten clears, the auto-battle unlock — together.** Which
    tower a run enters is settled by who it owns, not by where the ladder has carried it, so
    staggering the unlocks would gate a player holding five Elves behind clears that have nothing
    to do with them. `towers.spec.ts` bounds the unlock under a fifth of the shipped ladder **and
    holds the agreement with the auto-battle unlock** — each tower authors its own `unlockClears`,
    so the spec is what stops the two silently splitting apart.
  - **Each tower leans on a different faction, and no two leans repeat.** Human←undead,
    dwarf←human, elf←dwarf, undead←elf, angel←demon, demon←angel — the mortal cycle where it
    applies and the celestial pairing where it does not. ⚠️ **The Monster Tower has no lean and that
    _is_ its lean**: every faction counters Monsters, so "field what counters the crew" resolves to
    all seven, and it ships as an even spread. `towers.spec.ts` derives that case off the matrix
    (`countersOf(faction).length === FACTIONS.length - 1`) rather than naming `monster`, bounds the
    spread on both sides instead of asserting a leader, and separately holds that no two towers that
    _do_ lean lean on the same faction — seven towers leaning on Monsters would be one tower shipped
    seven times.
  - ⚠️ **The mirror control in `towers.balance.ts` is only valid for four of the seven, and both
    exceptions are asserted rather than skipped.** The control rewrites every enemy to the tower's
    own faction on the premise that a mono-faction board is matchup-neutral, and that premise fails
    twice. **Celestials**: an Angel deals ×1.10 to every mortal with nothing coming back, so an
    all-Angel board is the _hardest_ thing an Angel five can meet — `biased > mirrored` is false by
    construction there, and the spec asserts the **inversion** so a future matrix edit that removes
    the celestial advantage fails loudly. **Monsters**: `monster → monster` is the matrix's one
    self-edge, so mirroring that tower turns the matrix _up_ rather than off and is not a control at
    all; its exclusion is made load-bearing by asserting the self-edge exists.
  - ⚠️ **Difficulty in a tower is the front rank's weight, and it is sharply non-linear.** Two
    ascended blocks in front of three legendaries is the top band; pairing the two _heaviest_
    (an Unmade beside a Tyrant) takes the reference crew from a clean clear to single-digit win
    rates. **15c re-measured this against six more crews and the tolerance is narrower than it
    looked**: the same medium-plus-heavy pair the Human roof clears at 90% is unwinnable for the
    Dwarf five, which carries the lowest `atk` in the game, and for the Angel five, which is four
    supports and a wall. So the anchors are sized **per tower against its own crew**, not to a
    shared weight. Re-run `npm run test:balance` after touching any band in the top third.
  - ⚠️ **A healer on a roof is a timeout wearing a boss's stat block.** The Dwarf Tower's boss was
    `Oathbreaker + Warden` behind a Marsh Acolyte and no Dwarf five could close it inside ninety
    seconds — an identical board ten floors lower, at six fewer enemy levels, cleared. Against a
    party that cannot burst, the last floor is where sustain on the enemy side stops being a lock
    and becomes the clock.
  - **Every faction carries at least six archetypes and all three tiers**, which is what 15c's
    eighteen new blocks bought and what [`data/enemies.spec.ts`](src/data/enemies.spec.ts) holds — a
    floor of four per faction and every faction owning a `common`, a `legendary` and an `ascended`.
    Fifty-eight ship, and the distribution is deliberately uneven: milestone 18 took Angels to eleven
    and Demons to ten, because a chapter leaning on a faction needs depth in it. The old note here
    recorded that there was **no ascended-tier Undead archetype**; the Barrow Sovereign closed that,
    and the Wyrdroot Ancient did the same for Elves. ⚠️ **A new `ascended` block is bounded by the
    ones the campaign already fields** rather than by an opinion — the Unmade is the ceiling and
    nothing may reach it, asserted in `enemies.spec.ts`, because a third and fourth heavy anchor is
    what makes six towers fail their sweep at once. **Both chapter bosses since respect that ceiling
    rather than raising it**: the Chainsworn and the Hollow Seraph are each authored under the Unmade
    on both stats, and what makes them the harder fights is the questions they ask and the level they
    are fielded at.
  - ⚠️ **An archetype must be fielded somewhere, and "somewhere" is every ladder rather than the
    campaign.** That rule lived in `chapters.spec.ts` while the campaign was the only content;
    eighteen tower-only blocks would have failed it as orphans, so it moved whole to
    `data/enemies.spec.ts`, which is the only spec that sees both. It was **widened, not relaxed**:
    an archetype nobody ever meets is still a stat block with a comment attached.
  - **The balance target is five of the tower's faction at `rare-plus`, level 60, no gear, clearing
    every floor** — and ⚠️ **the level is derived from `topLevel`, not chosen**: `rare-plus`'s cap is
    exactly 60, so the party tracks the content. What ramps across the climb is **what a floor
    costs**, not whether it is possible: the crew clears all hundred, loses nobody below floor 80,
    and finishes the roof in twenty-four seconds with two of the five dead. A floor the crew cannot
    pass stops the tower outright, because a floor is climbed once and there is no way around one.
  - **Home draws a row per tower and it has three states**, only one of which is a link:
    `climbing` goes to `/prepare/:id`, and `locked` and `topped` are inert rows that say why. ⚠️ The
    locked row is where 15a's "nothing empty ships for the towers" rule is deliberately spent — it
    names the clears remaining and the faction it wants, because a visible destination is most of
    what a tower is for.
  - ⚠️ **`StageHeading` was generalised for this and carries the _rendered_ position, not its
    parts.** A chapter-and-stage pair is a shape only the campaign has. `where` is the big line
    (`2-14` or `F37`), `place` locates it, `label` names it on a button, and no screen asks which
    kind of content it is drawing. `label` exists because the two kinds want opposite halves: a
    floor's name already is its position, so a shared template would read "F40 — Floor 40".
- **Achievements and quests are ledgers over counters the run already keeps**, added in milestone
  14b. Read [`core/achievements.ts`](src/core/achievements.ts) and
  [`core/quests.ts`](src/core/quests.ts) before touching either.
  - ⚠️ **Neither adds a field to the battle path, and that is the whole design.** An achievement
    track stores **one integer** — awards _taken_ — and derives what is earned by division. A quest
    window stores a **baseline** of the counters as they stood when it opened, and progress is a
    subtraction. Giving either a running total incremented from `applyBattleResult` is a write into
    the hottest path in the game for a derivable number, and a second place for progress to
    disagree with itself.
  - ⚠️ **Every quest reward is crystals, and every achievement award is flat.** Gold, xp and
    essence price against a level curve worth ×10⁹, so a flat quantity of any of them is invisible
    within a chapter or two; a pull costs a flat `PULL_COST` forever. A reward that _scaled_ would
    also pay most to the player whose ladder is already moving, which is the opposite of what these
    exist for.
  - ⚠️ **No quest may be measured against `clearedStages`.** It counts _first_ clears, so it stops
    moving at the top of the authored ladder and the quest becomes permanently unfinishable. The
    type forbids it; `battleCount` and `pullCount` always move. **An achievement measured against it
    is fine and one is shipped** — a quest that stops moving is unfinishable, an achievement that
    stops moving is one the player has finished.
  - **"Counters the run already keeps" is a rule about the stored field, not about the counter.**
    `clearedChapters` is **derived** — `clearedStages` resolved against the shipped `LadderShape` —
    and adds no save field, no migration and nothing to the battle path, which is the whole of what
    that rule protects. It is why `trackProgress`, `allProgress` and `claimAchievements` all take a
    ladder, **required rather than defaulted**: a caller with no ladder would report the chapter
    track as having earned nothing, on every screen, forever.
    - ⚠️ **A chapter is not an interval of stages.** `every: 50` over `clearedStages` is the
      obvious authoring and it is wrong from chapter 11, where `CHAPTER_CURVE` steps to sixty — it
      pays a "chapter" award part way into the next chapter, silently, forever.
    - ⚠️ **Fourteen of the sixteen shipped tracks share two names between them** — every tower has a
      Spire Climber and a Spire Conqueror — so a track's `name` identifies a _kind_ of track rather
      than a track. `AchievementsService` resolves the heading as `name — tower name`, reading the
      tower off `TOWERS`; authoring the faction into each track would put it in two places and let
      them disagree. It is load-bearing rather than cosmetic: seven identical `<h2>`s and seven
      progress bars carrying the same accessible name is a WCAG failure.
    - ⚠️ **`towerFloors` is the one counter that cannot identify itself, so `AchievementTrackData`
      is a discriminated union rather than an interface with an optional `tower`.** Every other
      counter is a single number on the run; a tower track has to say _which_ tower, and one that
      forgot would read floor zero of nowhere — content that compiles, ships and silently never
      pays. The typed local in `ui/content.ts` is what turns that into a compile error. Each tower
      gets **two** tracks, and summing the seven is forbidden: it would make the completion award
      payable by climbing a hundred floors spread across seven towers.
    - **A coarse counter needs `AchievementProgress.position`, which is `total` plus how far into
      the next unit the run has come.** A chapter is fifty fights, so a bar drawn from the whole
      count alone sits empty through all of them and then jumps, on the largest reward in the game.
      It equals `total` for every stored counter, and `aria-valuenow` follows it so the announced
      value cannot contradict the fill.
  - **Nothing in the crystal economy is linear in the stage index.** A first clear pays a flat 250
    (×2 mini-boss, ×5 chapter boss), Stage Climber 1,000 per five clears, Chapter Conqueror 10,000
    per chapter. ⚠️ **The flattening and the track raises are one redistribution and only balance
    when read together** — the ladder's first clears fell from ~58,800 to 29,000 and the tracks rose
    from 5,000 to 40,000. Retuning either half alone moves the pacing; `data/achievements.spec.ts`
    measures the sum and holds the ratio inside a factor of two. The idle rate in `SUMMON_RATE` is
    the one thing still linear, and it is linear in the **clear count** rather than the index.
    - **A tower's crystals are the same shape at a smaller size**: 100 a floor (×2 mini-boss, ×5
      roof), 500 per five floors, 10,000 for topping it. ⚠️ **The per-floor figure is deliberately
      _not_ the campaign's 250** — at parity the seven towers pay ~268,000 against the campaign's
      ~69,000, which is 3.9× and makes the ladder's own rewards look pointless beside optional
      content. At 100 it is ~219,000. `data/towers.spec.ts` measures that ratio and bounds it, and
      ⚠️ **it compares both halves on both sides** — floors and their tracks against first clears and
      theirs — because comparing against first clears alone reads the campaign as five times poorer
      than it is. Since 15c it **sums the towers that actually ship** rather than multiplying one
      tower by `FACTIONS.length`, which measured a projection while six of them were unwritten.
    - ⚠️ **Only the ceiling on that ratio is stable; the floor falls as content ships, by
      construction.** Towers are fixed at seven hundred floors while the campaign grows, so it read
      3.17 at two fifty-stage chapters, 2.12 at three, **1.59** at four — and the six-chapter
      re-cut then moved it to ~1.37 without adding a stage, because two more chapter boundaries pay
      two more Chapter Conqueror awards. The floor moved 2 → 1.5 in milestone 18 and 1.5 → **1.3**
      in milestone 19; it buys the re-cut and nothing more, and fires again at chapter 7. **The
      real answer when it next fires is to grow the towers**, and that is milestone-sized work.
    - **Topping a tower pays exactly what finishing a chapter pays**, which is a deliberate tie
      rather than a coincidence: `achievements.spec.ts` therefore narrows its "largest single
      payout" claim to the ladder, and `towers.spec.ts` holds the tie.
  - ⚠️ **`perClearPerHour` is 1 and it stays 1. The ceiling that kept catching it was the thing that
    was wrong.** The ladder's crystal contribution is `step × stages` against a base of 100, so both
    of the old bounds — pulls a day at full clear, and the contribution as a multiple of the base —
    are the ladder's **length in disguise**. They were moved once per chapter (20–40, then 20–60,
    then 20–75) and milestone 18's chapter landed on exactly the ×3 ceiling that its own comment
    had predicted and prescribed cutting the step for.
    - ⚠️ **That prescription was declined on the owner's call, and `banners.ts` already carried the
      argument for declining it**: the failure mode was ever only a rate that **compounds** past a
      flat `PULL_COST`, and a linear step cannot do that at any size. Extravagant and compounding are
      different things and only the second was the bug. "A pull an hour, plus one an hour for every
      stage you have ever cleared" survives as the legible sentence it was chosen to be.
    - **The ceiling is stated against the roster now, not the ladder**: a full clear must not buy the
      roster's copies — derived through `fullAscensionCost` over `CHARACTERS`, 4,487 today — in under
      thirty days. It is 62 days over the shipped two hundred stages. ⚠️ **It tracks both sides**, so a roster that grows
      raises it exactly as a ladder that grows lowers it, and it first fires around chapter twelve —
      at which point the question is whether the roster kept up, not what number makes it green.
    - **The floors were kept and did not move**: the climb must still be worth more than the base
      (×1.1) and still pay more than 20 pulls a day at a full clear. Those do not decay.
  - ⚠️ **What a clear pays is bounded _per stage_, not in total.** The band was 500–900 pulls for
    the whole ladder and milestone 17's chapter took it to 1,035 — correctly in the sense that the
    number moved, uselessly in the sense that every chapter moves it. The ladder pays a flat 250 a
    stage and a flat 1,000 per five clears, so the total is linear in the length by construction
    and a fixed band on it is a **cap on how much content may ship**. Per stage it was 6.9 across
    the four fifty-stage chapters, unchanged from three; the re-cut moved it to ~8.0 by adding two
    chapter boundaries without touching a stage, which milestone 19 records as a decision.
  - ⚠️ **The level ceiling is guarded by ratios now, not by hours.** "Level 1000 costs more than 500
    hours of top-of-ladder income" was retired rather than moved a third time: income at the top
    rises with every chapter **by design**, so that figure falls forever (1,175 → 588 → 372) and
    would reach a weekend around chapter twelve with nothing wrong. Three assertions replaced it —
    the ceiling against what the ladder asks for, rungs left unspent above that demand, and the
    demand itself costing between an hour and a day. **Before retuning content to satisfy a failing
    threshold, check whether the quantity it measures is one the roadmap requires to move.**
  - **A weekly is exactly seven of its daily and never more** — the weekly tier is a bonus for
    consistency, not a second obligation. `data/quests.spec.ts` derives that bound from the daily
    targets rather than restating it.
  - **The window roll lives in `GameLoopService.advance`**, which is the only place holding both
    the authoritative run and a real `nowMs`. Not a `computed` (Angular forbids the signal write)
    and not a `setInterval` (a second clock that would not survive backgrounding). ⚠️ **A window
    rolls only when the computed index is _greater_ than the stored one** — `>`, never `!==` — so a
    clock moved backwards does nothing rather than handing out a second day. Clamp; do not detect.
  - **Nothing punishes a miss.** No streaks, no escalating bonus that resets, no countdown that
    costs anything. Unclaimed awards accumulate indefinitely.
- **The bounty board dispatches bench characters on timed missions**, added in milestone 14b. Read
  [`core/bounties.ts`](src/core/bounties.ts) before touching it.
  - ⚠️ **A character cannot be both fighting and away, and milestone 15b moved where that is
    enforced.** It used to bite on the way _in_ — `dispatchBounty` refused anybody fielded,
    `setFormation` refused anybody away, `repairDispatches` dropped a crew that was both. That was
    right for one formation and wrong for eight: forty slots against a forty-nine character roster
    means a player who has crewed every tower has no bench left, and the board starves exactly when
    the roster breadth it rewards is at its widest.
    - **The rule now bites on the way _out_: anybody may be dispatched, and a crew holding somebody
      away cannot fight.** Enforced in **one** place — `CrewView.ready` for the screen and the away
      guard in `BattleService.fight` for the loop, because auto-battle re-enters without passing the
      pre-battle screen again. `dispatchBounty`, `setFormation` and `repairDispatches` no longer
      check it at all, and `in-formation` and `character-away` are gone from the failure unions.
    - ⚠️ **Do not put a refusal back on the dispatch side.** It reads as tightening an invariant and
      it is the change that makes the board unusable. The invariant is unchanged; only its
      enforcement point moved.
    - ⚠️ **`repairDispatches` must keep a mission whose crew is also fielded.** That is an ordinary
      state a player reached on purpose now, and dropping it would take back hours of a wait — the
      pass never pays for what it drops.
    - **The battle guard is the away case only, never `CrewView.ready`.** `ready` is also false for
      an empty crew, and an empty party resolving as an immediate defeat is behaviour
      `simulateBattle` owns and the specs use to make a loss deterministic. Widening the guard
      replaces a fight the player loses with a control that silently does nothing.
  - ⚠️ **A mission pays a _duration_ of the run's current idle income, never a flat amount** — the
    same idiom as `STAGE_REWARDS.rewardSeconds`. And **never crystals**: the crystal rate is linear
    in the clear count so it cannot outrun a flat `PULL_COST`, and a multiple of it on a repeatable
    timer is that compounding. The split with quests is deliberate — quests pay flat crystals
    because they help a player whose ladder stopped; bounties scale because roster breadth is not a
    stuck player's problem.
  - **Every mission pays less than it runs for.** One paying its own duration back would make
    dispatching free and the board a button rather than a decision. `data/bounties.spec.ts` derives
    that ratio and the crew sizes rather than restating them.
  - **`repairDispatches` pays nothing for what it drops**, because paying would make damaging a
    save a way to collect instantly. ⚠️ It deliberately does **not** check the faction requirement:
    that gates _starting_ a mission, and dropping an in-flight crew because a later build retuned
    the content would punish a player for a change they did not make.
  - **The board rotates daily and is derived from the seed and the day index, never stored** —
    `data/` authors a **pool** of twelve, and `dailyBoard` stands `BOUNTY_BOARD.missions` of them.
    Same three arguments as the gear shop's stock: no save field, nothing to migrate, and ⚠️
    **rerolling is impossible rather than merely detectable**. It rolls on the **same 04:00 UTC
    boundary the quest windows use**, asserted equal against `QUEST_RULES` rather than restated —
    two daily clocks would mean two "tomorrows" in one game.
    - ⚠️ **The shuffle covers the whole pool before anything is filtered.** Shuffling only the
      unlocked missions makes the draw a function of the clear count, so crossing an unlock
      threshold reshuffles every row; shuffling everything first means an unlock can only
      **insert**. Same discipline as the count draw in `rollDrops`.
    - ⚠️ **A dispatch outlives the board it was sent from.** A 24-hour mission crosses a rotation
      boundary by definition, so **every running mission holds a place on the board**, and
      `repairDispatches` and `collectReadyBounties` take the **whole pool** rather than the day's
      board. Wiring either to the board strands a crew a player is eleven hours into, silently and
      unpaid. Running missions **count against the board size**, so collecting one frees a slot.
    - **Every variant of a tier is worth exactly the same** — duration, crew, payout and unlock.
      Rotation changes _what is asked for_, never _what the day is worth_; a variant paying
      differently makes the daily draw a payout lottery.
    - ⚠️ **Missions stack, and a tier is an authoring group rather than a limit.** An earlier build
      allowed one per tier, guarded in three places — a **screen-layout rule wearing a game rule's
      clothes**, since its whole premise ("the board shows one row per tier") was itself a choice.
      What rations the board is the **bench**; a cap on top spends the player's roster breadth
      twice. Two dispatches on one tier are **not damage** and `repairDispatches` must not drop one.
    - ⚠️ **`BOUNTY_BOARD.missions` is a balance number, not a layout one.** Each mission pays a
      third to a half of idle income while it runs, and they stack, so the board's ceiling is the
      **sum** — 2.8× at six missions. `data/bounties.spec.ts` derives that worst case and bounds it
      under 4×. Widening the board is an economy change.
  - ⚠️ **A faction requirement never names a celestial faction.** Angels and Demons ascend on copies
    of themselves alone, so an unlucky run can own none of either indefinitely — a mission requiring
    one is a row that player can never run, which is the failure milestone 4 rejected role-locked
    formation slots for. `data/bounties.spec.ts` derives the mortal/celestial split from `FACTIONS`
    rather than listing it, and also holds that a requirement never exceeds the crew size or the
    shipped roster's depth, and that **every tier keeps one variant asking for nothing**.
  - ⚠️ **`dispatchOpenBounties` ("Dispatch all") is not `ascendAll`, and the licence is different.**
    Crews compete for one bench, so it genuinely resolves a choice. What allows it with no
    confirmation is that the stakes are a **wait rather than a loss** — nothing is consumed and
    everybody comes back — and what that buys is an obligation to be **predictable rather than
    clever**: board order top to bottom, roster order within a mission, and faction seats filled
    before general ones. It is a convenience over `dispatchBounty`, never a second path with its own
    rules, and the spec asserts one press equals dispatching each mission by hand.
- **Two local notifications ship, at 12h and 24h**, and milestone 14b records this as a
  **deliberate reversal** of the earlier "ship none" decision rather than deleting that argument.
  See [`ui/notifications.service.ts`](src/ui/notifications.service.ts).
  - ⚠️ **Cancelled on foreground and on launch.** A player who has come back must not be told to
    come back.
  - **Two, ever** — not a daily drumbeat and not one per finished bounty. **Fixed ids**, so
    re-scheduling replaces rather than accumulates.
  - **The copy promises nothing is lost, because nothing is.** No expiring reward, no streak, no
    penalty — and the spec asserts both the promise and the absence of urgency words.
  - **A setting, defaulting on**, which also cancels anything queued when switched off. Permission
    is requested at the first backgrounding, never at launch.
- ⚠️ **Per-screen state on a component bound to a route parameter must be a `linkedSignal` keyed
  on that parameter, never a plain `signal`.** Angular's default reuse strategy keeps the **same
  component instance** when only a parameter changes, so `/roster/rin` → `/roster/wren` updates the
  input and leaves every local signal exactly as it was. A refusal message, an open picker or a
  status note then carries onto the next screen, where it is a statement about a character or crew
  the player is no longer looking at.
  - It shipped on `character-view` (four signals: the refusal, the open gear slot, the auto-equip
    note and the signature refusal) and on `formation-view`, which serves **two** parameterised
    routes — `/formations/:activityId` and `/prepare/:activityId`.
  - **`linkedSignal({ source, computation: () => null })` rather than an `effect` that resets
    them.** It is declarative, needs no scheduling, and cannot be reached stale: an effect runs
    _after_ the change that triggered it, so there is a frame in which the old value still renders.
  - The test that catches it drives the parameter directly — `setInput`, or a router harness
    navigating between two parameterised URLs — because that is exactly what the router does to a
    reused component.
- ⚠️ **`visually-hidden` is a `@mixin` in `ui/theme.scss`, not a global class.** Angular scopes
  component styles, so a screen that writes the class without including the mixin gets **no rule at
  all** and renders the text inline — it shipped a button reading "Choose a crew for Village Errand
  Send". The failure is loud on screen and silent at authoring time. The same trap waits for any
  class a component assumes is global.
- **[docs/saves.md](docs/saves.md)** — storage, the migration chain, load-time repair, and
  fixtures. **`SAVE_VERSION` is 0 and the migration table is empty.** The chain has been re-based
  three times: five pre-release versions and four migrations the first time; the six that
  accumulated on top of that baseline the second — gear (v0 → v1), the ladder's new bottom
  (v1 → v2), the achievement ledger, the quest windows, the bounty board and the legendary pity
  counter; and milestone 16's three fields the third — `wallet.emblem`, `rates.emblem` and
  `roster[].signature`. Every field they wrote is simply part of the baseline shape now.
  - ⚠️ **The third re-base is the least defensible use of the licence, precisely because it was the
    cheapest.** All three fields default correctly to zero, so the migration they did not need would
    have been three assignments of the value the decoder already produces for a missing key — and a
    version bump would have cost almost nothing. The reason not to take it was consistency with an
    empty chain, not any property of those fields. **Weigh that before re-basing a fourth time.**
    One visible cost, dev-only: a save from before it reports two repair issues on load, heals to
    zero, and is otherwise fine.
  - ⚠️ **A re-base is licensed by one argument and nothing else: no save any of those versions
    wrote has ever existed outside development.** The rule it suspends is scoped rather than
    softened — _never delete or edit a migration once a build carrying it has reached a player_ —
    and the moment one does, the chain is permanent and the next version is 1 forever.
  - ⚠️ **The re-base spent the version numbers twice.** 1 through 6 have each meant two different
    things and now mean neither, so a save at any of them reads as _newer than this build_ and is
    discarded rather than repaired. Discarding is the safe direction and still a run nothing can
    recover. A save is unreadable now only by being newer or by carrying a version that is not a
    non-negative integer; **any test for that case must derive its version from `SAVE_VERSION`,
    never write a literal** — that fixture went stale twice while the chain was growing, and the
    re-base has now made every such literal wrong again.
  - ⚠️ **A fixture must store a value the default would not produce.** `v0.json` carries a
    mid-cycle `legendaryPity`, a worn loadout and a mint counter ahead of the bag, because a fixture
    holding the empty value passes identically whether the decoder reads the field or silently
    defaults it — the one distinction the fixture exists to make. The empty value is always the
    obvious thing to write.
  - ⚠️ **The deleted rarity shift is the one worth remembering.** It changed no field, only what one
    _means_, which makes it the shape nothing structural can verify: an unmigrated save parses
    cleanly, validates cleanly and demotes the entire roster two rungs. **Inserting a rung anywhere
    but the top of `RARITIES` is a save migration, not a content edit** — the re-base removed the
    code, not the rule.
  - **Player settings are a second key, not a field on the save**, since milestone 13. A
    preference describes the app; a save describes a run. Keeping them apart is what lets a run
    reset leave the battle speed alone, and it keeps every future setting from being a
    `SAVE_VERSION` bump for a value nothing in `core/` reads. `ui/settings.service.ts` repairs
    **per field on read** rather than carrying a version — every setting is independent and always
    has a correct default, so that subsumes migration in both directions. Add a new key rather
    than re-using one whose meaning changed.
  - ⚠️ **A run reset has to replace the state in memory, not just empty the slots.** The game loop
    is the authoritative owner and writes back on autosave and on `visibilitychange`, so clearing
    storage alone is undone by the app on its way out — the player sees a fresh run until the next
    backgrounding hands the old one back. `GameLoopService.reset` stops the loop, clears, replaces,
    persists, and only then restarts; the order is load-bearing and the reason it clears _before_
    writing is that a write copies the primary slot into the backup first.

## Milestones

The ordering exists so there is **always something playable**. Each milestone layers onto the
previous skeleton without changing its shape. Do not skip ahead: a later milestone built on an
unverified earlier one is where the hard-to-find bugs live.

Before starting work, check where the project actually is. **Do not assume the doc is current —
verify against the code.**

Read it before starting a milestone, and specifically before:

- reaching for **`@capacitor/app`** — deliberately deferred, and the doc records the condition
  that has to be met first. The **run reset** is no longer on that list: it shipped in milestone
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
  goes to _fight_ is a card there;
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
  `timeToClear(state, stage)` was, and is cancelled; see [milestone 5](docs/milestones.md).
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
  - **`SAVE_VERSION` is 0, and the table is empty.** Two re-bases collapsed eleven versions and ten
    migrations into this one shape, both on the one argument that licenses it: no save any of them
    wrote has ever existed outside development. [saves](docs/saves.md) records the resets and the
    condition — a player loading a save — that closes the door on repeating them. **The chain walker
    survived both**, tested against a synthetic history the whole time so that the first real
    migration would land on proven code; that is exactly how gear's v0 → v1 landed, and it worked
    first time.
  - ⚠️ **The re-bases burned version numbers 1 through 6, twice each.** The old v1 was milestone 1's
    gold counter and the second v1 was the gear schema; the old v3 was the rate table and the second
    v3 was the achievement ledger. Nothing can tell any pair apart from the number alone, so a save
    at one of them is treated as newer than this build and discarded. Safe only because no save
    carrying either meaning exists outside development — **not safe in general**, and the cost of
    re-basing that is easiest to forget.
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
— which would re-open [milestone 5](docs/milestones.md). Do not implement either speculatively,
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
  starting advantage (see [milestone 3](docs/milestones.md)) — with one deliberate exception since
  milestone 8c, which is that tier also caps how many skills a character may field.
- **A kit is authored at exactly its tier's ceiling**: two skills at `common`, three at
  `legendary`, four at `ascended`, ultimate included. Fewer leaves a character short of what its
  tier promises; more ships content no rung can ever reach. Write the ultimate first and the rest in
  the order they unlock — `elite`, `legendary`, `ascended` — which is what makes a kit readable as a
  progression. `data/characters.spec.ts` asserts all of it; the rule is in
  [`core/roster/kit.ts`](src/core/roster/kit.ts) and the table in
  [`data/kits.ts`](src/data/kits.ts).
- Team composition matters through **enemy design** (a healer that must be burst, a wide
  wave that punishes single-target, a debuff that needs a cleanse), not through flat
  synergy bonuses like "+10% if two Fire units" — those just create a new optimal team.
  The faction matchup matrix added in milestone 4 is **not** that pattern and the distinction
  is the whole of it: a synergy bonus rewards your own line-up and asks nothing of the
  encounter, while a matchup multiplier is a statement about the fight in front of you. Keep
  matchup edges small — five to ten percent — so they decide a fight that was already close
  rather than carrying a party that brought the wrong answer.
  - **Milestone 8d overrode the first half of that rule, once, knowingly, and the override does
    not generalise.** The faction lineup bonus in [`data/combat.ts`](src/data/combat.ts) pays a
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
  two are exact and meant to stay exact — they are the bench a mono-faction team is built from, and
  that job wants a known depth. The third is a floor,
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
- **Four things a chapter's boards have to answer to, learned authoring chapters 3 and 4.**
  - ⚠️ **Sustain on the enemy side behind something the party cannot aim past is a clock, not a
    difficulty.** A healer standing behind a taunt is the same failure 15c found on the Dwarf Tower
    roof, and a timeout is a defeat rather than a hard fight. The Bound Marches field exactly one
    such board, at stage 10, where the party is far above the level and the lock is being taught.
    - **The safe inversion is to put the durability on the taunting body itself**, which is what the
      Sundered Vault's Sealward Custodian does: the one thing the party is permitted to hit is the
      one thing it needs to kill, every pool on it depletes, and nothing refills. A board built that
      way can be as defensive as it likes and still resolve.
  - ⚠️ **The difficulty probe reads every fourth stage plus the bosses, so those samples are the
    chapter's spine and have to escalate.** Composition varies by more than the ~13% six levels
    buys, so a light board landing on a sample after a heavy one reads as a step backwards. Author
    the spine deliberately rather than discovering it in the sweep. **The Bound Marches wrote this
    down and the Sundered Vault broke it anyway** — a band opener authored as a teaching board, four
    bodies and two of them commons, landing on `c4-s31` (`c6-s31` since the re-cut) and measuring
    84.4 after 100.9. ⚠️ **The trap is that band
    openings _want_ to be light and the stride does not care.** Check which stages are samples
    before authoring, and fix a step backwards with **weight rather than level**: five bodies and a
    legendary front rank, not +3 enemy levels, which would fight the level curve for ~13%.
  - **A chapter boss is a peak and the stage after it is the next chapter opening at the same
    level**, so the step down across a boundary is the ladder working. The probe skips that pair —
    it had never fired only because the stride's phase happened to hide the chapter 1–2 seam.
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
