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

- **[docs/ladder.md](../../docs/ladder.md)** — the campaign: twenty-nine chapters, one thousand four hundred and fifty
  stages, what a stage authors, position versus clear count, the rung cadence, and the guards that
  were retired. ⚠️ **Chapter 18 moved the ascension rung to `mythic`, chapter 22 to `mythic-plus` and
  chapter 25 to `ascended`; all three are overrides against the log-space rule, and they are the only
  three the campaign has.** Chapters 19, 20, 21, 23 and 24 all _stayed_ on the rung below them, and
  that a stay is a derivation rather than an override is the point: what licenses an override is the
  seam _below_ being wrong (under 1.00) **and** the pool being unable to supply a board — never the
  margin being large and never this chapter's own seam being small. ⚠️ **Chapter 21's own seam was
  0.8241, under 1.00, and it still did not license an override, because its chapter was authorable.**
  Chapter 22's is licensed because it is not: at level 515 the **five lightest bodies in the game read
  0% against a `mythic` five**. ⚠️ **What binds is the pool rather than the seam, and chapter 25 is
  the case where the two halves of the licence disagreed outright.** Its seam _below_ is **1.0711,
  above 1.00** — only its own (0.5740) is under — so the arithmetic half was **not** met, and the
  override is licensed by the pool alone: fielded at level 605, **4 of 312 shipped blocks stand
  against a `mythic-plus` five and 282 against an `ascended` one**, and chapter 24's own opening
  board, mid board and final all read 0%. **The pool has settled all three overrides; state which
  half you have when they disagree.** The degenerate chain reached four links on `mythic`, two on
  `mythic-plus`, and re-formed at chapter 26 exactly as predicted. ⚠️ **That fifth stretch is the
  first that can never end**, because the four before it were each closed by a rung move and there is
  no rung left to move to: chapter 27 took it to **three links**, chapter 28 to **four** and chapter
  29 to **five**, all on schedule, so expect the chain to deepen a link a chapter forever and do not
  read a sixth or seventh identical link as a bug.
- ⚠️ **`ascended` is the last rung whose cap the ladder has not already climbed past**, so the rung
  question stops having a tuning answer after chapter 25. `ascended-1` caps at 600 against chapter
  25's close of 605 and reads a seam of **61.94** — a walkover by two orders of magnitude, by
  construction rather than by tuning. A chapter that cannot be authored on `ascended` is a `data/`
  question about `LEVEL_CURVE.caps`, not a chapter. ⚠️ **Chapter 26 is the first chapter to live in
  that, and what it means in practice is that every chapter from here is pure squeeze**: thirty
  levels of board against a party frozen at cap 500, ×1.8654 a chapter. The Roughcast reads 2.5971
  against `ascended-1`'s 33.2031 — a preference for staying put of **1.30 nats**, the widest any
  chapter has had, and there is nothing to override toward. Chapter 27 reads 1.3922 against 17.7995
  chapter 28 **0.7463 against 9.5419** and chapter 29 **0.4001 against 5.1152** — the identical
  1.30-nat margin four chapters running, because the ratio is exactly `1.6 / perLevel.common ** 100`,
  fixed by the hundred levels between the two caps. ⚠️ **It is a constant, not a reading: quote it
  rather than re-deriving it a fifth time.** [ladder](../../docs/ladder.md)
- ⚠️ **Chapter 29 is where the stat vocabulary ran out, and `def` was the last unspent stat.**
  Chapter 23 took all four mitigation stats at once and 24 through 28 took `tenacity`,
  `physicalPierce`, `critChance`, `dodge` and `attackSpeed`; what was left reads 0.00 against the
  calibrated five (`accuracy`, because they carry `dodge` Σ0.00; `magicPierce`, because a pierce
  never touches a resist), is disqualified by the formula (`insight`), is a forbidden shape
  (sustain) or is a design reversal (an enemy `ultimate`). **A chapter 30 has no unspent stat**: the
  options are a **pairing** taken on super-additivity or a spent axis re-taken from the other side of
  the board. Measured at chapter 29's control, `critChance` 0.28 × `critDamageAmp` 1.15 reads 1.40
  and 0.05 alone and **3.90 together** at eight seconds of added fight, against `def`'s twenty-two.
  [authoring](../../docs/authoring.md)
- ⚠️ **`chapters.balance.ts` holds every sweep entry to a _mean_ fight under 60s, and that is a
  tighter bar than the 72s longest-cleared one.** A fight-lengthening chapter meets the mean first:
  chapter 29's first authored pass read 60.2s and 64.3s means on two boards while every max sat
  comfortably inside 72s. **Tune a refusal chapter against the mean.** [authoring](../../docs/authoring.md)
- ⚠️ **A refusal chapter's first authored pass is too _cold_, and only the difficulty probe says so.**
  Chapter 29's read every board at 100% inside both clock bars and still failed the probe twice — band
  4 opened at **0.680** of band 3's close, and the closing third read lighter than the opening third —
  because **the probe reads throughput and `def` is invisible to it**. The repair was one move: re-cut
  every new block **hotter and lighter**, which raised the probe and shortened the fights together.
  **On a refusal axis weight and heat move in opposite directions.** [authoring](../../docs/authoring.md)
- ⚠️ **A defensive stat grades in _value_ and an offensive one grades in _carrier count_**, which is
  what lets one chapter have a two-dimensional dial and refuses it to the next. `def` reads nine
  monotone steps across 17 → 28 and **0.00 / 0.06 / 0.10 / 0.10 / 1.70 / 2.96** across zero to five
  carriers — flat through the middle and a cliff at the end, which is the survivors metric
  saturating. Chapter 28's `attackSpeed` graded in both. **Check which dimension your axis has before
  planning six bands on it.** [authoring](../../docs/authoring.md)
- ⚠️ **Armour on a heavy body is the ninety-second clock, so a chapter about armour authors it on the
  light bodies.** Four light escorts at `def` 34 are worth **3.01 of five**, one heavy anchor at `def`
  80 is worth 2.74 at a 68.3s longest fight, and an anchor carrying both weight and armour runs
  **88.5s** — a timeout, which is a defeat. **That is the inverse of the Dwarven idiom**: the faction
  that owns the tankiest blocks in the game is the one whose chapter may not stack them.
  [authoring](../../docs/authoring.md)
- ⚠️ **`def` carries the tier premium, so a band table stated in authored `def` is not monotone.** At
  level 710 a `legendary` block is worth ×2.835 of a `common` one and an `ascended` ×8.03, so an
  authored 32 on a common and an authored 30 on a legendary are 32 and **86** on a board. **Convert
  `def` before comparing two bodies, exactly as with weight** — chapter 29 is the first where the
  conversion applies to the axis rather than to the budget. [authoring](../../docs/authoring.md)
- ⚠️ **The rank of a lone carrier has now been priced three chapters running and got three different
  answers, the third being none at all.** Chapter 27's `dodge` reads 3.25 in front against 3.70
  behind, chapter 28's `attackSpeed` **0.00 against 0.77**, and chapter 29's `def` **0.00 against
  0.01** at every value from 22 to 55. A dodge bills what is _aimed at_, an `attackSpeed` bills what
  is _left alive_, and `def` bills every blow that reaches the body whenever it arrives. **Rank is a
  priced dial in some chapters and not a dial at all in others; measure, never carry the precedent.**
  [authoring](../../docs/authoring.md)
- ⚠️ **`signature.balance.ts` can bind a chapter's final on an assertion that is _not_ the clock, and
  the two balance files can disagree about which escort body matters.** Chapter 29's final passed the
  ninety-second guard at 898 of 900 and failed _"never makes a character reach meaningfully less far
  as the item is levelled"_ on Seraphine, whose capstone unconditions an `ally-all` heal and trades
  damage threshold for sustain at exactly the edge that file measures (556 → 551, a ratio of 0.9910
  against a 0.995 tolerance). Every legal escort arrangement reads 4.00 of five at 62–68s on
  `chapters.balance.ts`; the same swaps read 0.9892 to 0.9964 there, and exactly one passes. **Run
  that file on the candidate final before the full sweep, and do not assume the assertion that binds
  is the timer.** [authoring](../../docs/authoring.md)
- ⚠️ **`levels.spec.ts`'s "leaves rungs unspent above everything the ladder asks for" fired at chapter
  29 and was retired rather than slid — the fifth guard retired this way.** It is the one guard in
  that file that genuinely could not decay, which is exactly why it was retired: it was measuring
  **how long the campaign is** rather than drift, and its own comment said the answer is a roadmap
  decision. **The answer, recorded in its place: 30 levels a chapter against a caps ladder topping out
  at 1000 gives the campaign a hard ceiling at chapter 38.** Each +100-level rung appended **above**
  `ascended-5` buys ~3.3 more chapters, and appending at the top of `RARITIES` is the one insertion
  that is not a save migration. ⚠️ **What the retirement costs: content whose level demands run away is
  now unguarded.** [history](../../docs/history.md)
- ⚠️ **A degenerate seam is where a measured price table transfers, and chapter 26 is the first to
  spend that deliberately.** The party is literally unchanged, so equal absolute weight is equal
  difficulty and chapter 25's table holds at **0.536×** the common-equivalent figure — **and the
  attack converts by the same factor**, which is chapter 23's rule at a seam where both halves move
  together. Spot-check rather than assume. Chapter 26's boards run 3,174 to 5,089 common-equivalent
  against chapter 25's 3,180 to 8,616, on new blocks of 300–1,100 health and 13–34 attack against
  420–1,350 and 16–58. [authoring](../../docs/authoring.md)
- ⚠️ **A stat's shipped register does not transfer up the ladder, and chapter 27 is the case that
  proves it.** `dodge` ships to a ceiling of **0.55** (`SHADE`, authored for enemy level 15–30) over a
  median of 0.22 and a p90 of 0.30 — and board-wide **0.40 is a total wipe** at chapter 27's weight,
  so the whole chapter is authored between 0.10 and 0.30 with its boss at 0.34 and never approaches
  its own ceiling. That is chapter 17's "a stat that works only _below_ its register" as a whole
  chapter rather than a band. **State which side of the register a band landed on, and say what level
  the register was set at.** [authoring](../../docs/authoring.md)
- ⚠️ **A chapter's lean may carry none of its axis, which the pool cannot tell you and the boards
  can.** `dodge` sat on 33 of 388 blocks and **0 of the 54 Human blocks** carried a point of it, so
  chapter 27's ten new Human blocks created that register from nothing while the six returning Elf
  blocks supplied the shipped one (0.14, 0.18, 0.20, 0.24, 0.26, 0.30) and the two ladders interleave.
  **An empty register is a licence to measure, never to author** — what turns it into one is the
  measurement plus a structure the boards can carry. [authoring](../../docs/authoring.md)
- ⚠️ **A dodge bills what is _aimed at_, so the rank a carrier stands in is a priced dial.** Measured
  on **one** body at chapter 27's control, a single carrier is worth **3.25 in front against 3.70
  behind** at 0.22, 3.15 against 3.80 at 0.30 and **2.17 against 3.17 at 0.40** — a spread growing
  0.45 → 1.00 with the value. That is `THORNMAIL`'s "only bills what is struck" wearing the party's
  **aim** instead of its damage, and the opposite sign to chapter 16's unreachable debuffer.
  [authoring](../../docs/authoring.md)
- ⚠️ **`signature.balance.ts` is a stricter clock guard than `chapters.balance.ts` and a refusal
  chapter is what finds it.** It bisects a five-of-one-character party to its own **edge**, which is
  where a fight is longest: a draft of chapter 27's final put Vurn Runewright at a maxed item on a
  victory at **exactly tick 900**, where chapter 26's own final already reads **897**. ⚠️ **Lowering
  the boss's `dodge` moved it not at all** — 0.34, 0.30 and 0.28 all read 900 — and **lightening the
  board did**. **Run that one file before the full sweep when a chapter's axis is refusal**; it is two
  minutes against half an hour, and the campaign sweep cannot see it. [authoring](../../docs/authoring.md)
- ⚠️ **A chapter's own axis can be worth zero on its boss, and that is the honest reading rather than
  a failure.** Chapter 27's final at 115/5 reads 100% with 4.00 of five at `dodge` 0.26, 0.30, 0.34
  **and** 0.40, buying 34.7s, 35.6s, 36.6s and 38.5s of fight and nothing else, while its weight
  grades 4.00 / 4.00 / 4.00 / 4.00 / 4.00 / 3.70 / 3.58 / **0.70** across 85/4 → 175/7. **Expect a
  boss's axis to be its identity and its weight to be its difficulty.** [authoring](../../docs/authoring.md)
- ⚠️ **A non-lean texture that does not thin monotonically may be a budget rather than a fiction.**
  Chapter 27's Elf slots run **5, 7, 8, 7, 3, 2** against chapter 26's monotone 9, 7, 5, 4, 3, 2,
  because a shipped `dodge` carrier is a light body with a **hot attack** — the six returning Elf
  blocks run 40 to 58 common-equivalent attack where the chapter's own new commons run 15 to 19 — and
  a closing band already carrying three of the chapter's legendaries has no attack budget for one.
  **The carriers a chapter most wants at the top are the ones it can least afford.**
  [authoring](../../docs/authoring.md)
- ⚠️ **Owning a stat's whole shipped register is not the same as being able to field it, and chapter
  28 is the inverse of chapter 27.** `attackSpeed` sat on **4 of 398** blocks at 55, 70, 80 and 110
  and **all four are Elf** — the faction leading the chapter — and **not one is light enough to stand
  on a single board in it**: the lightest is 1,166 common-equivalent at level 665 against a board
  budget of about 2,000, and board-wide the stat is a total wipe at **40**, under its own shipped
  floor of 55. So the chapter runs 5 to 18 with its boss at 20. Chapter 27's lean carried none of its
  axis and its texture supplied the register; this one owns all of it and fields none.
  [authoring](../../docs/authoring.md)
- ⚠️ **Common-equivalent attack is blind to the gear archetype, and at Relic 100 that is worth a
  factor of 1.5.** `GEAR_PROFILES` pays `tank` **+46%** attack, `brawler` **+89%**, `ranger` **+112%**
  and `mage` **+120%**, so an authored 26 in a `mage` set bills **57** where an authored 24 in a
  `tank` set bills **35**. Weighted that way every chapter-28 board that failed in tuning failed
  between **246 and 364**; unweighted the same boards do not separate at all. **Weight the attack
  budget by archetype before comparing two boards** — and it is still a shortlist rather than a
  predictor. [authoring](../../docs/authoring.md)
- ⚠️ **A chapter can afford its own premise and not an ordinary hot body.** `c28-s57` carries **five**
  `attackSpeed` carriers summing 56 points of the stat at 127 gear-weighted attack and reads 4.00 of
  five; a draft at three carriers summing 41 at **173** read 0.63. **Measure which of the axis and the
  raw attack is binding rather than assuming it is the axis.** [authoring](../../docs/authoring.md)
- ⚠️ **`battleSeed` hashes `stage.id`, so a probe that renames a board measures a different forty
  fights.** Chapter 28's tuning pass ran under prefixed ids and read every board at 100% with a
  longest fight of **55.9s**; the identical boards under their shipped ids read the final at **95%
  and 73.6s**, past the 72s bar, and one other board at 93%. **Name a probe's stages exactly as they
  ship, and re-sweep the resolved ladder before believing a tuning pass.**
  [authoring](../../docs/authoring.md)
- ⚠️ **The rank of a lone carrier is a priced dial whose _sign_ does not carry between chapters.**
  Chapter 27's `dodge` carrier is worth 3.25 in front against 3.70 behind; chapter 28's `attackSpeed`
  carrier at 40 is worth **0.00 in front and 0.77 behind**, because a body the party cannot aim at
  keeps swinging. A dodge bills what is _aimed at_ and this bills what is _left alive_. **Two
  consecutive chapters priced the same thing and got opposite answers — carry the measurement, never
  the precedent.** [authoring](../../docs/authoring.md)
- ⚠️ **`attackSpeed` is the first campaign axis to grade in _both_ value and carrier count, and the
  cooldown is half the mechanic.** Against chapter 28's control it reads 0.23 → 3.90 across values
  4 → 36 **and** 3.92 / 3.88 / 3.02 / 2.10 / 1.38 across zero to five carriers at 20, zero timeouts.
  It accrues **only when a combatant's last action was a basic attack**, so every carrier is authored
  on a cooldown of 58 to 68 — **a short cooldown switches its own axis off**, which is what separates
  it from chapter 17's `haste` even though the two grade alike. **It was also chosen on the clock**:
  `def`, `physicalResist` and `magicResist` all grade and each buys nineteen to twenty-one seconds of
  fight where this buys five. [authoring](../../docs/authoring.md)
- ⚠️ **No enemy carries an `ultimate` and that is a decision rather than an omission.** `docs/combat.md`
  records it — energy is a character system, and an encounter's pacing is authored in cooldowns. It
  measures as a real axis (0.50 / 1.27 / 2.53 / 3.75 across power 1.2 → 1.9), so it will keep looking
  tempting; **taking it is a design reversal, not a content session's call.** ⚠️ **Three shipped blocks
  carry `energyRegen` with no ultimate to spend it on** — `DRUMMING_SHOAL`, `PACKCALL_WHISTLER`,
  `SALTBLEACH_CRIER` — and they are left in place deliberately, because deleting one changes a shipped
  block nobody measured without it. [combat](../../docs/combat.md)
- ⚠️ **Two chapters may build on the same stat without sharing an argument, and the register on the
  _party's_ side is what separates them.** Chapter 23 priced complete crit **denial** at 0.88 of one
  member because only two of the calibrated five carry crit worth denying. Chapter 26 builds on enemy
  `critChance` — the same stat from the other side — and it grades **0.20 → 3.23 across 0.12 → 0.45
  and 0.02 → 1.78 across zero to five carriers**, zero timeouts, because that same five carries
  `critBlock` **Σ0.05**, `critDamageResist` **Σ0.15** and `tenacity` **Σ0.00**. **Say which side of
  the board you measured.** ⚠️ **And a band claim about a stat every block carries cannot be about
  presence at all** — `critChance` sits on 378 of 378 — so state bodies per board at a threshold, and
  state the register you measured _against_: shipping ten blocks took the pool to 388 and the Monster
  ceiling from 0.18 to 0.28. [authoring](../../docs/authoring.md)
- ⚠️ **Reading `damage.ts` rather than the stat names has now disqualified two candidates outright.**
  `insight` is **not** a crit stat — `statusChance` computes `authored + insight − tenacity`, so it is
  chapter 24's `tenacity` axis wearing an offensive coat, and on a board carrying no hostile status it
  is worth 0.10. `magicPierce` is worth **exactly 0.00** against physical boards, because a pierce
  only opens the defence its own damage type is checked against. **Price the shortlist from the
  formula, not from the vocabulary.** [authoring](../../docs/authoring.md)
- ⚠️ **The 25% quota can fail on the _denominator_ while every block is right.** Chapter 26's first
  authored pass fielded **47** distinct archetypes against chapter 25's 33, which put eight new blocks
  at **17.8%**; no board had to move, and trimming the returning roster to sixteen Monster and six
  Dwarf took it to **26.7%**. **The quota constrains how many _different_ things a chapter fields,
  not how much of it is new — decide the returning roster size before authoring boards.**
  [authoring](../../docs/authoring.md)
- ⚠️ **Two heavy bodies in one front rank is chapter 19's failure and it has a campaign instance
  now, but the fix is per-board rather than a rule.** Chapter 26's `c26-s51` read 95% / 3.15 and
  `c26-s54` **8% / 0.20** with the heaviest two in front — and **removing any single body fixed
  either**, which is the tell that the arrangement is the fault. Moving the second-heaviest body back
  fixed both; applying that swap to all sixty broke two other boards, the final at **0%**. **The rank
  each body takes is tuning, settled by measuring every arrangement.** [authoring](../../docs/authoring.md)
- ⚠️ **When the survivor metric saturates, fight length is the only thing separating a final from an
  ordinary board.** Chapter 26's boss grades 4.00 / 4.00 / 4.00 / 4.00 / 3.95 / **0.42** across
  240/9 → 560/22 — four rows the metric cannot tell apart, then a cliff — and ships at 37.2s against a
  next-longest of 29.1s. **Quote the seconds, and check the escort moves it**: held at its shipped
  stat line, a heavier escort reads **0%** and four light bodies read 4.03. [authoring](../../docs/authoring.md)
- ⚠️ **An axis can be chosen on _fight length_ rather than on survivors, and chapter 25 is the first
  to do it.** At level 605 against an `ascended` five, `physicalPierce` across five grades **0.20 /
  0.41 / 0.51 / 0.58 / 0.93 / 1.13 / 1.35 / 1.67 / 2.06 / 2.33** over 0.08 → 0.45 — ten monotone
  steps, zero timeouts, and it grades in **carrier counts** as well (1.27 → 1.96 at one through five
  at 0.40). What chose it over every refusal stat is that it moves the control from 38.7s to only
  43.9s, where `def` (50.9 → 58.5s), `physicalResist` (43.5 → 56.4s), `dodge` (41.0 → 54.3s) and
  `tenacity` (40.8 → 49.4s) all walk toward the 72s bar that cost chapters 22 and 24 two boards each.
  **A chapter about attrition wants the axis that converts weight into deaths rather than into
  seconds** — the longest fight in the whole of chapter 25 is 29.0s. [authoring](../../docs/authoring.md)
- ⚠️ **`def` is a cliff at chapter 25's weight and was a dial at chapter 23's, and `THORNMAIL` on a
  back rank went from 0.00 to a total wipe.** `def` reads 1.78 at 20 and 3.65 at 40 where The
  Evenfall graded 0.40 / 1.65 / 3.55 across 46 / 70 / 110; and the back-three reflect chapter 19
  measured at exactly **0.00** and chapter 22 at less than nothing reads **4.00 of five** here. That
  is the fourth and fifth chapters running to invert a recorded reading. **Re-price the whole
  vocabulary against the new chapter's own control; the table never transfers except across a
  degenerate seam.** [authoring](../../docs/authoring.md)
- ⚠️ **A pool wall can be an _attack_ wall rather than a weight wall, and chapter 23 is where that
  happened.** When two chapters clamp to the same rung cap the party is **literally unchanged** while
  the boards climb, so an authored `atk` is worth `perLevel ** 30` = ×1.87 more than the identical
  number a chapter below. Filtering the shipped pool on common-equivalent weight alone passes 117 of
  292 blocks at level 545; **adding attack leaves 55**, and none from either celestial. ⚠️ **It fired
  as an authoring error first**: The Evenfall's ten new blocks were drafted with chapter-23 health and
  chapter-22 attack and **every board read 0%** — the lieutenant at all five appearances and the final
  at every stat line — and halving the authored `atk` alone fixed all six bands. **Convert attack as
  well as weight when carrying a budget across a chapter boundary.** [authoring](../../docs/authoring.md)
- ⚠️ **A filter is not a pool count, and chapter 24 is the correction to the rule above.** Screening
  the shipped pool on common-equivalent weight _and_ attack — exactly as chapter 23 describes — leaves
  **15 blocks at level 575, every one a Monster**, a reading that would have forced a third Monster
  lead on pool grounds. **Fielding** the same 302 blocks beside four light escorts instead of
  filtering them leaves **121**, spread across all seven factions. The attack finding is right; the
  screen built from it is not a census. **Field the pool; do not screen it** — and this is what
  licenses or refuses an override, so getting it wrong moves a rung.
  [authoring](../../docs/authoring.md)
- ⚠️ **`tenacity` is a six-step dial at chapter 24's weight and was measured _flat_ at chapter 21's,
  which makes three inverted negatives in seven chapters.** Against a control of 1,809
  common-equivalent at level 575 reading 3.94 of five it grades **0.80 / 1.53 / 2.43 / 3.21 / 3.61**
  across 0.20 → 0.85 with zero timeouts, entirely **inside** its shipped register (133 of 302 blocks,
  median 0.40, ceiling 0.85). The Longebb read 0.25 at 0.20 and 0.33 at 0.60 and declined it. ⚠️ **The
  register on the _party's_ side is why**: four of the calibrated five carry a hostile status, against
  the two of five that carried crit when chapter 23 priced crit denial at 0.88. **Check the register
  on both sides, and re-price a declined mechanic rather than inheriting the refusal.**
  [authoring](../../docs/authoring.md)
- ⚠️ **A conditioned enemy skill is worth zero to _negative_, and it is the most tempting shape left.**
  All six condition kinds — `ally-hurt`, `ally-afflicted`, `self-hurt`, `enemies-at-least`,
  `status-absent`, `always` — land within **±0.08** of the control at one carrier and at all five. On
  the payload axis a condition prices **−2.42**: at power 3.6 an always-on turn reads 1.46 of five
  where the identical turn behind `enemies-at-least 5` reads **3.88**, because it stops firing the
  moment the party loses anybody. **A condition is a restriction on the board and the party is the
  beneficiary** — chapter 20's wrong-sign finding, in a new place. [authoring](../../docs/authoring.md)
- ⚠️ **The difficulty probe reads throughput, so a lock that _slows_ a board reads as a step
  backwards.** Chapter 24 let `atk` and `haste` fall as its `tenacity` lock rose; the real party read
  4.00 of five on every board while the probe read the band-4 opener at **0.792** against the 0.85
  bar. One fast, hot body carrying the lock took it to 0.993 and moved nothing on the sweep. **Weight
  shortlists, the probe ranks — and a refusal stat is exactly the kind of lock the probe cannot see.**
  [authoring](../../docs/authoring.md)
- ⚠️ **A degenerate seam is the one time a chapter's measured price table transfers.** "Do not carry a
  table forward" is a rule about the _board under the mechanic_ changing; when the party is identical,
  equal absolute weight is equal difficulty and the chapter below's readings hold at 0.536× the
  common-equivalent figure. Spot-check rather than assume, and nothing priced against a different
  party transfers at all. [authoring](../../docs/authoring.md)
- ⚠️ **A chapter is fifty stages up to chapter 19 and sixty from chapter 20, and the cap is a
  _schedule_ rather than a constant** — `CHAPTER_CURVE.raisedMaxFromChapter` / `raisedMaxStages`, so
  the length stays derived and `chapters.spec.ts` still holds every chapter equal to `chapterSize`.
  ⚠️ **A raised cap may only ever apply forward and `chapterSize` refuses a lowering**: shortening a
  chapter that has shipped teleports every run standing past its new last stage. ⚠️ **The slope is
  the rule and the span is the consequence** — sixty stages at half a level a stage is **thirty**
  levels of climb rather than twenty-five, which is a further ×1.11 of squeeze on a party whose cap
  does not move. [ladder](../../docs/ladder.md)
- **[docs/ascension.md](../../docs/ascension.md)** — the sixteen-rung ladder, the two paths, what a rung
  costs, and the three rungs that also hand over a skill.
- **[docs/level-resonance.md](../../docs/level-resonance.md)** — the level the whole roster shares. **Read
  it before writing anything that reads a character's level.**
- **[docs/gear.md](../../docs/gear.md)** — the third progression axis: five slots, five archetypes, a
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
  three chapters. See [authoring](../../docs/authoring.md).
- **[docs/signature-items.md](../../docs/signature-items.md)** — the fourth axis: one item per
  ascended-tier character, unlocked at `mythic`, thirty levels bought with emblems.
- **[docs/economy.md](../../docs/economy.md)** — the seven currencies, income rates, the level curve, pull
  rates and pity, and offline accrual.

**Content modes**

- **[docs/towers.md](../../docs/towers.md)** — seven faction towers, **six hundred floors each at levels 1
  to 283 — the Human, Dwarf, Elf and Undead Towers complete and the other three at five hundred while a
  fifth round is in flight**. What a tower is for, the three fields a clear may never touch, the six crews,
  and thirty-two hundreds' worth of measured escalation findings.
- **[docs/descent.md](../../docs/descent.md)** — the daily roguelite run: three floors of three fights,
  attrition, and one card of three after every win. **The only content that asks a question
  mid-flight.** ⚠️ **Both this and Expeditions clamp the campaign anchor** — `anchorCap`, 316 and 322
  — because the anchor stopped standing for how strong the party is; read it before touching either
  mode's level line.
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
- ⚠️ **A geared chapter owes a `gearArchetype` on every block it fields, returning ones included**,
  and the ladder's grade level does **not** restart at 1 at a grade boundary — Worn 20 is worth 2.045
  and Sturdy 1 only 1.350, so a clean restart is a step backwards. [gear](../../docs/gear.md)
- ⚠️ **An enemy's `gearArchetype` is a bare string and an absent one is silent.** A stage authoring
  `gear` prices a bonus per archetype; a body that declares none looks it up under `undefined`, gets
  nothing, and fights naked on a board tuned as though it were kitted — nothing throws and nothing
  renders wrong. `chapters.spec.ts` asserts every body on a geared board declares one and
  `enemies.spec.ts` asserts every declared value is real. Same trap as a mistyped stat key.
  [gear](../../docs/gear.md)
- ⚠️ **`resolveStage`, `resolveLadder`, `resolveFloor` and `resolveTower` all take the gear rules,
  required and never defaulted.** A caller that omitted them would resolve every geared stage or floor
  as an ungeared one — every screen would keep saying the right thing and only the balance sweep would
  notice. The tower pair is required even though most floors are ungeared, precisely so that adding a
  ramp to a tower cannot silently miss a call site. [ladder](../../docs/ladder.md), [towers](../../docs/towers.md)
- ⚠️ **A geared _tower floor_ owes every body on it a `gearArchetype` too, and `towers.spec.ts` is what
  catches it.** Same silent failure as the campaign's: an absent archetype is looked up under
  `undefined`, the body fights naked on a board tuned as though it were kitted, and nothing throws.
  ⚠️ **A tower authors a gear _ramp_ in `TOWER_RULES.gear`, never a set per floor** — `floorGear`
  derives the pair, for the reason a floor's level is derived. [towers](../../docs/towers.md)
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
  **This now binds on both sides of the board**: enemy gear is the same percentage off the same
  tables, which is why a geared stage authors a grade and a level rather than a stat line.
- ⚠️ **Anything additive, or any authored constant compared against a scaling quantity, breaks it.**
  Audit for those rather than waiting to notice.
- **The exception is a bounded rate.** `critChance`, `critDamageAmp` and `lifeLeech` take **points**
  rather than percentages, because a percentage of a bounded rate pays almost nothing.
  [descent](../../docs/descent.md)
- ⚠️ **A level gap does not predict difficulty and the power ratio does, which is the same identity
  read backwards.** Party power is `perLevel ^ level × 1.6 ^ rung` and the ascension ladder moves the
  second term in **steps of 22.6 levels** (`ln(1.6) / ln(1.021)`) — so measured across nine Descent
  depths a gap of +44 read a full walkover and +49 read 3.75 survivors, while board-over-party power
  is monotone: 0.29 → 1.00 finished, 0.50 → 0.75, 1.02 → 0.00. **A ratio near 0.50 is a mode
  working.** Convert to power before picking a level for anything keyed off the campaign; the naive
  clamp to the rung's own cap reads 5.00 survivors because the party stands under its cap holding
  rungs. [descent](../../docs/descent.md)
- ⚠️ **A mode keyed off "the hardest campaign stage cleared" needs a ceiling on it.** That anchor was
  standing in for how strong the party is, and the two stopped moving together at chapter 13: the
  campaign now runs above the level cap of the rung it is tuned for, so its finals are authored
  _lighter_ every chapter and the calibrated party has been flat while the anchor climbed a hundred
  levels. Uncapped, the Descent and Expeditions both read **0.00 finished** at the deepest depth the
  moment chapter 16 shipped. ⚠️ **The caps move when a chapter asks for a _rung_ above
  `legendary-plus`, not when a chapter ships.** [descent](../../docs/descent.md)
- ⚠️ **A hand-picked list of sample depths acquires a hole every time the campaign grows; derive it
  from the chapter list.** Both mode sweeps sampled chapters 3, 5, 7 and the top, so **chapters 8
  through 15 went unmeasured** — and the Descent was reading 1.00 finished with **5.00 survivors** in
  the middle of that gap. ⚠️ **Deriving a sample silently re-points every index into it**: Expeditions
  measured its card control at `DEPTHS[3]`, the deepest sample before and chapter 6 after, and the
  assertion kept passing while measuring something else. **Name the depth; do not index the sample.**
  [descent](../../docs/descent.md)
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
  literals; do not derive the tail and do not drop the depths. ⚠️ **Eleven consecutive chapters have
  each added one and the schedule has never slipped**: the list is fourteen entries at chapter 28, and
  chapter 26's depth 1,270 is the first entry with **no rung behind it** — the party a depth implies now gains only
  the thirty levels between chapter finals, where depth 1,210's entry carried a whole ×8.36. ⚠️ **The rung ladder runs out at `ascended`, which
  changes the shape of the growth rather than ending it** — no later chapter can hand a depth another
  ×1.6, so from chapter 26 the gap widens on levels alone and each new entry is a shallower trough.
  **Do not read a smaller step as the schedule ending.** [descent](../../docs/descent.md)
- ⚠️ **When every reading saturates, tune against the sweep's own control rather than its outcome.**
  Expeditions is one-time content meant to become a completion, so every depth above its unlock reads
  1.00 finished by design and no anchor cap can be chosen on a finish rate. **A cap that reads 5.00
  survivors passes every assertion in that file while measuring nothing** — what chose it was the
  carded-against-bare margin: 0.00 at cap 316, +1.60 at 322, −1.30 at 328. Do not take the first green
  value. [expeditions](../../docs/expeditions.md)

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
- ⚠️ **A board's raw health total is the wrong quantity to compare against, and it gets more wrong
  every chapter.** `perLevel` is 1.024 / 1.0225 / 1.021, so at level 350 an `ascended` block is worth
  **×2.784** of a `common` one and **×1.668** of a `legendary` one — up from ×2.587 and ×1.608 at 325.
  Measured, one chapter-15 board at 2,980 raw health read 4.00 survivors and another at 3,100 read
  **0%**, because in common-equivalent terms they were 4,283 and 5,581; and chapter 16's final is
  authored at **250 health and 24 attack**, which is **696 and 67** in common-equivalent terms.
  **Convert to common-equivalent weight before comparing two boards, and certainly two chapters.**
  [authoring](../../docs/authoring.md)
- ⚠️ **A mechanic's worth is a function of where its board stands on the plateau, not of the
  mechanic, and a figure quoted without the weight it was measured at means nothing.** Measured at
  chapter 16's roof, `THORNMAIL` across a whole board is worth **0.00** survivors at 900 total
  health, **0.20** at 1,060 and **1.33** at 1,160 — the mechanic identical in all three rows. **State
  the weight with the figure.** [authoring](../../docs/authoring.md)
- ⚠️ **A debuff caster the party cannot reach is the sustain-behind-a-taunt failure wearing a
  different stat.** A `WEAKEN`-on-`enemy-all` body measured **4.00 survivors in the front rank and
  0.10 in the back** at the same weight, because the party cannot aim past it and the status never
  lapses in practice. Put a board-wide debuffer where it can be killed. [authoring](../../docs/authoring.md)
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
  on it.** [authoring](../../docs/authoring.md)
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
  [authoring](../../docs/authoring.md)
- ⚠️ **Two heavy anchors in one front rank is the failure, not any anchor, and it now has a campaign
  instance as well as a tower one.** At chapter 19's weight every returning Dwarf legendary reads
  100% with 4.00 of five **alone** behind four light bodies — the heaviest at 2,143 common-equivalent
  included — and two together read **0%**. ⚠️ **Two `enemy-back` turns on one body is the same trap
  on a stat line**: a 520/76 ranger carrying two read 0% beside any second legendary at 3,449
  common-equivalent where two other legendaries at 3,598 read 4.00. **Field each candidate anchor
  alone before concluding anything from a pair of stat lines.** [authoring](../../docs/authoring.md)
- ⚠️ **A stat can work only _below_ its shipped register, which is the sixth answer the register
  check has given.** `haste` ships at a ceiling of 152 over a median of 98, and a board-wide 144
  reads **0.00 of five** at chapter 17's weight where 100 reads 3.80 — the opposite of the Monster
  Tower's `physicalResist`, which had to step past its register. **State which side of the register a
  band landed on, and scope the claim to what was measured**: The Quickmire's new blocks run 106–126
  while its boards reach 148 on a returning body. [towers](../../docs/towers.md)
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
  vocabulary. [authoring](../../docs/authoring.md)
- ⚠️ **A wide skill is capped at power 1.2 and a mechanic priced on one that is not is a mechanic
  nobody may author.** `skills.spec.ts` holds `enemy-all`, `enemy-row-front` and `enemy-row-back` to
  1.2; single-target turns are uncapped. Chapter 22 priced its whole premise on `enemy-row-front` at
  power 1.55 to 3.10 and **every row described a skill the game refuses** — the cap caught it, not
  the sweep, and re-measuring on the legal single-target form roughly halved the axis (0.09 / 0.43 /
  0.83 / 1.72 across power 1.20 / 1.90 / 2.60 / 3.60). **Check what a target is allowed to carry
  before pricing a mechanic on it.** [authoring](../../docs/authoring.md)
- ⚠️ **The size of one instance of damage is a _dial_ where almost everything else at depth is a
  cliff, and that is what a six-band chapter needs** — but only as a **skill**. Traded on a single
  body's `atk` against its `haste` at held damage per second it is **non-monotone**: 3.08 / 2.39 /
  2.20 / **2.91** / 2.55 / **3.01** across ×1.0 to ×4.0 at 160 trials, because past about ×2.5 the
  body's period exceeds the fight and the second swing never lands. **Nominal damage per second stops
  describing a body once its cooldown is longer than the battle.** Board-wide the same trade is a
  dial to ×1.45 and then a cliff. [authoring](../../docs/authoring.md)
- ⚠️ **The aim rule holds on a plain damage scope, and the first measurement of it was confounded.**
  The same escort body casting `enemy-all` at the wide cap is worth **0.07 of a survivor from the
  front rank and 0.42–0.64 from the back**. ⚠️ **A rank comparison must be carried on one body** —
  chapter 22's first table put the anchor in front and an escort behind and read the reverse. ⚠️ **And
  chapter 16's "put a board-wide caster where it can be killed" does not generalise from a debuff to
  damage**: that rule answers an unreachable status that never lapses (4.00 against 0.10), where a
  damage scope bills once and depletes. **Take the measurement, not the precedent.**
  [authoring](../../docs/authoring.md)
- ⚠️ **A returning block's _kit_ can invert its stat line, and weight will not warn you.** Chapter
  22's `c22-s58` read **8% with 0.10 survivors** with the Order Serjeant at 1,706 common-equivalent in
  an escort slot and **4.00** with the Edgeturn Warden at 2,247 — a board 5% heavier being the easy
  one, because the lighter body carries a board-wide `RALLY` that is a total wipe at that weight. The
  same block is affordable three bands earlier. **Read what a returning block does, not only what it
  weighs.** [authoring](../../docs/authoring.md)
- ⚠️ **A refusal can be a _joint_ condition on two stats, and stating only one of them ships a false
  claim.** Chapter 22 refuses fast bodies — but every board it lost in tuning lost to one that was
  fast **and** over 1,600 common-equivalent, while six blocks at haste 96–114 at or under 560 are fielded
  freely. Its header states the measurement (median `haste` 72 across 300 slots; everything above 92
  at or under 560) rather than the threshold it means. [authoring](../../docs/authoring.md)
- ⚠️ **A _negative_ result carries a weight the same way a positive one does, and chapter 23 inverted
  one nine chapters old.** Chapter 14 measured `def` past its register and `physicalResist` to 0.60 as
  worth **no more than 0.08 of a survivor** and concluded the refusal vocabulary was fight length
  rather than difficulty. Against chapter 23's control — 6,135 common-equivalent at level 545, reading
  3.55 of five — `def` 70 is worth **1.65**, `physicalResist` 0.30 **2.30** and 0.45 **3.50**, all with
  zero timeouts. **A recorded "X is inert" is a claim about a curve, and the curves in this project
  move.** [authoring](../../docs/authoring.md)
- ⚠️ **A lock is worth what the _party_ has staked on the thing it denies, which is the register check
  asked from the other side of the board.** Chapter 23's crit denial saturates inside its own shipped
  register — `critBlock` grades 0.42 → 0.75 across 0.16 → 0.28 and then flat, and **complete immunity
  to both crit chance and crit damage is worth 0.88 of one member** — because only two of the
  calibrated five carry crit worth denying (0.22 and 0.25) against the other three at 0.02–0.05. The
  Demon Tower's `critBlock` band read 0.59 at 0.24 against a crew _built_ on crit. **Check the
  register on both sides before building a band on a stat.** ⚠️ **And a pairing can beat either half
  pushed further**: both resists at 0.20 read 1.78 where `magicResist` alone at 0.30 reads 0.32.
  [authoring](../../docs/authoring.md)
- ⚠️ **A band claim about a _common_ stat cannot be about presence.** `physicalResist` sits on 139 of
  302 blocks at a median of 0.10, so "the skin arrives in band 3" is false the day it is written.
  Chapter 23's band table states **bodies per board at or above 0.12** (0–1, 0–1, 1–3, 3, 2–3, 1–3),
  which is the Demon Tower's counts-not-absolutes fix applied to a chapter — and it forced a block to
  be authored _without_ the stat, because that body stands on more opening-band boards than anything
  else. [authoring](../../docs/authoring.md)
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
  [authoring](../../docs/authoring.md)
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
  premise mechanic before authoring its boards.** [authoring](../../docs/authoring.md)
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
  whichever of the two the escort leaves free. [authoring](../../docs/authoring.md)
- ⚠️ **Make board weight smooth in the stage index when the locks step at band boundaries.** A
  per-band weight drop cancels against the new band's lock and reads as a step _backwards_ on the
  probe — `c20-s53` measured 0.780 against the 0.85 bar. ⚠️ **And a mini-boss is a peak nothing
  covers**: the boundary-skip in `chapters.balance.ts` is for a chapter _boss_ only, so the samples
  after a mini-boss are a chapter's thinnest margin (`c20-s13` read 0.860). Lift them — but **not in
  the closing band**, which has no weight to spare. ⚠️ **Chapter 21 fired the same rule at a _band_
  boundary rather than after a mini-boss**: `c21-s31` opens the first band to carry two locks at once
  and measured **0.849** against the 0.85 bar, because the weight drop that paid for the new lock is
  the only half the probe can see. **A band that adds a lock opens heavier, not lighter.**
  [authoring](../../docs/authoring.md)
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
  costs the matchup nothing. [authoring](../../docs/authoring.md)
- ⚠️ **A mechanic can be worth _only_ fight length, and that is the ninety-second clock rather than a
  difficulty.** Measured across chapter 14's whole refusal vocabulary — `def` past the register,
  `physicalResist` to 0.60, board-wide barriers, aegises, guards and weakens, and instance size at held
  damage per second — **none is worth more than 0.08 of a survivor and several are worth eleven seconds
  of fight.** What moves a tuned party is the anchor slot, and its response there is a cliff. **Count
  the timeouts and check the control can move before believing either a positive or a negative.**
  [testing](../../docs/testing.md)
- ⚠️ **Enemy _health_ is the sharpest instance of that rule and it grades 0.00.** Measured at chapter
  18's weight against five walls at level 390 with attack held fixed, health from **×1.0 to ×2.8** —
  absolute weight 14,043 to 39,321 — reads **4.00 survivors at every single row with zero timeouts**
  and buys nothing but fight length, 25.7s to 62.6s. Held the other way, attack from ×1.0 to ×1.9
  reads 4.00 → 4.00 → 3.92 → **0.00**. **A durability chapter's identity is its health and its
  difficulty is the attack standing behind it**; pushing health alone walks the chapter into the
  timer rather than making it hard. [authoring](../../docs/authoring.md)
- ⚠️ **A final that fails at every stat line is its escort, and the fight getting _longer_ as the
  boss shrinks is the tell.** Chapter 19's final read 0% from 660/70 down to 380/46 with the fight
  lengthening at every step; removing one legendary from its escort let the boss sit at 520/58
  reading 100% with 3.36 of five. Same rule as chapter 15's anchor sweep, on a final.
  [authoring](../../docs/authoring.md)
- ⚠️ **No scalar predicts a board, and three were tried at chapter 18.** Common-equivalent health,
  attack-equivalent and a throughput product all mis-rank the shipped boards — a five-wall board at
  12,673 absolute weight reads 4.00 survivors where a five-attacker board at 12,920 reads **0.97** —
  because difficulty is throughput times fight length and fight length is set by the health. Use
  common-equivalent weight to _shortlist_ and the **difficulty probe's own threshold** to budget a
  spine; measure every authored board before believing any of it. ⚠️ **Chapter 19 found the ordering
  can outright invert**: two tank escorts at 700/50 and 800/52 are _easier_ than two brawlers at
  620/52 and 640/60 despite more health, and `c19-s17` at 4,006 common-equivalent probes at 13,244
  where `c19-s25` at 4,244 probes at 11,593. [authoring](../../docs/authoring.md)
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
  before concluding anything from the pair of stat lines.** [towers](../../docs/towers.md)
- ⚠️ **A grade that costs survivors is difficulty; one that starts timing out is the ninety-second
  clock wearing a stat block. Count the timeouts explicitly** — a wipe and a timeout are the same
  `defeat`, so a win rate cannot tell them apart. This is what licensed enemy **durability** as the
  Undead Tower's third-hundred axis (four bodies from hp 700 to 2400 grade 3.85 → 1.30 survivors with
  zero timeouts anywhere) where enemy _sustain_ on the same crew is forbidden. ⚠️ **A board-wide ward
  is the shield rule in both directions**: worth a real 0.75 of a survivor mid-band, and on the roof
  it takes the same board from 100% to **75%** at 45s mean. A _self_-shield is worth 0.00, because it
  prices against the wearer's own `atk` on a body already dying. [towers](../../docs/towers.md)
- ⚠️ **Check both sides of a guard before calling it stale; the half that moves may not be the half
  the guard is written in.** `gear.spec.ts` bounds the top gear grade's share of end-of-ladder drops
  at `< 0.2` and that bound has **never moved in the project's history** — which reads exactly like a
  guard nobody maintains. It is the opposite: `gradeSoftness` in `data/gear.ts` moves to meet it, by
  hand, **once a chapter, twenty-three times now**, always to `stages / 2`, always restoring 18.7%. It is
  done by hand deliberately, so the saturating-tilt bug underneath stays visible. Chapter 24 nearly
  retired the bound on a `git log -S` over the spec alone. **Adding a chapter owes this edit**; chapter
  30 wants 755. [gear](../../docs/gear.md)
- ⚠️ **A tower's height is one rule for all seven, so a bump strands six of them.** A tower that has
  not been extended is not damaged — `clearedFloors` clamps — but it **loses its boss**, because
  `floorKindAt` reads the rules' height, **and it stays naked**, because `floorGear` reads the rules'
  height too. Track them with a **literal `PENDING` list** in `towers.spec.ts` and
  `towers.balance.ts`; a filter ("the full height or three quarters of it") passes forever and never
  notices a tower nobody went back for. ⚠️ **Both lists are back and a fifth round is in flight: the
  height is 600, the Human, Dwarf, Elf and Undead Towers are there and the other three are at 500**, and they went
  back **in the same session as the bump** for the second round running — between a bump and the first
  authored tower there is nothing at all holding the short ones. **Put the lists back with every bump, not with
  the first authored tower**, and keep the shapes they force — `topFloors` reading the **authored**
  height and the roof-versus-band-opener comparison computed **per tower** — which stop the sweep
  reading an undefined stage. ⚠️ **The "and it stays naked" half has not fired for two rounds and it
  is now structurally gone**: `TOWER_RULES.gear.via` pins floor 500 to the set it already wore, so
  **all 200 shipped geared floors are byte-identical** on every tower, pending or not.
  [towers](../../docs/towers.md)
- ⚠️ **The gear ladder is finite where the level line is not, and the sixth hundred is where that
  bit.** Five extensions running solved a single straight line; the concatenated grade ladder is
  exactly **300 positions** and the shipped ramp slope of 1.2010 a floor wants **360** at floor 600, so
  no `to` both preserves floors 301–500 and reaches the roof. ⚠️ **Re-solving the line anyway moves 197
  of the 200 shipped geared floors, every one of them _lighter_ — which the sweep cannot see**, because
  a lighter board reads as more survivors: the "band 3 is a walkover and nobody could tell" failure at
  1,400 boards. That is the condition four separate sessions' "piecewise stays the right answer if an
  extension ever cannot be solved this way" notes were written for. **The level line is still one
  solved line and should stay one; check which axis has actually run out.**
  [towers](../../docs/towers.md)
- ⚠️ **A refusal recorded on a _size_ expires, and Relic 100 is the case where the same endpoint was
  rightly refused and rightly taken.** The fifth hundred declined it at **+166.3%** — as the endpoint of
  the **301 → 500** ramp, where it is ×2.44 in effective tank health from Worn 1 and the ramp becomes
  the escalation. As the endpoint of a **501 → 600** segment starting at Relic 40 it is **×1.470**,
  against the shipped fourth hundred's ×1.526 and fifth's ×1.507 — gentler than either. **State the
  span a gear figure was measured over.** [towers](../../docs/towers.md)
- ⚠️ **A throughput axis can fail "gets harder as it is climbed" while every board is right**, because
  that guard is measured in mean fight **seconds** and `attackSpeed` adds 2.7 of them across its whole
  range. The Human sixth hundred's first authored pass held the survivor line by thinning its boards and
  read **12.2s in the lower half against 10.5s in the upper** — backwards. The repair was the **anchor**:
  cold heavy bodies in the closing bands (1100/24, 900/26) buy length without buying throughput, taking
  it to 12.4s → 17.0s. **On a throughput axis weight and difficulty come apart — put the seconds in the
  anchor.** [towers](../../docs/towers.md)
- ⚠️ **When the axis blocks all belong to the lean, the _anchor_ is where the faction budget is.** All
  four of the Human sixth hundred's `attackSpeed` blocks are Undead and stand on nearly every closing
  board, so a first pass came out at **91.4% Undead** and would have taken the tower to 68.3% against its
  own 65% ceiling — and every cold heavy body in the Undead pool spends budget the tower has not got.
  Cold **Monster** anchors solved the fight length and the budget with one choice: 68.0% shipped, tower
  at 64.39%. The Demon fifth hundred's finding, from the other end. [towers](../../docs/towers.md)
- ⚠️ **The tower:campaign crystal ratio decays without anybody touching it, so recompute _both_ totals
  rather than carrying either.** The fifth hundred recorded 3.093 against "the 25-chapter campaign's
  351,500"; chapters 26–29 shipped, the campaign now pays **420,500**, and the same seven
  five-hundred-floor towers were really at **2.585**. It reads **2.878** now — four towers at six hundred
  floors and three pending — and a completed round is **3.101**. [towers](../../docs/towers.md)
- ⚠️ **A stat can split into the half a crew answers and the half it does not, and a _subtraction_ is
  what makes the two halves two different axes.** `critDamage` is `1 + max(critDamageAmp −
critDamageResist, 0)`, so the Angel fourth hundred took `critChance` — the frequency its crew cannot
  answer — and the Undead sixth took `critDamageAmp` **above** its shipped ceiling of 1.15. The Angel
  arrangements carry Σ0.76 / Σ0.96 of the resist, which is 0.19 a body, and they rank **thirteenth and
  eleventh of fourteen at amp 1.70 and first at 2.80**. **A subtraction defends against a small
  amplifier and evaporates against a large one; check where a register stops working before reading
  "two towers, one stat".** [towers](../../docs/towers.md)
- ⚠️ **On an _amplification_ axis the gear archetype multiplies the axis, which is the refusal-axis
  finding with the sign reversed and the second hundred running to find the archetype worth more than a
  step of its own axis.** Held at an identical stat line on one board at the Undead sixth hundred, four
  carriers at `critChance` 0.22 / `critDamageAmp` 1.70 leave the binding arrangement all-`mage` **1.45
  of five** and all-`ranger` 1.52, against all-`brawler` 1.98 and all-`tank` **2.65** — _above_ the 2.33
  the same board reads with no amplifier on it at all. An amplifier bills the attack it multiplies, and
  `GEAR_PROFILES` pays a tank +46% and a ranger +112% at Relic 100. [towers](../../docs/towers.md)
- ⚠️ **One tower can give opposite answers to the rank question on two of its own hundreds.** The Undead
  Tower's second hundred is `dodge`, which bills what is _aimed at_; its sixth is `critDamageAmp`, which
  bills what is _left alive_ — carried on one body with the escort held, a carrier is worth 0.15–0.30 of
  five in front against **1.00 behind** at floor 570 and 0.02–0.08 against **1.80–1.85** at floor 590,
  reproduced on all three carriers at both levels. **Carry the measurement, never the precedent — not
  even the same tower's.** [towers](../../docs/towers.md)
- ⚠️ **On a _throughput_ axis the gear archetype is worth more than the whole axis, and it is the
  largest reading that lever has had.** Held at an identical stat line at four carriers on the Angel
  sixth hundred, all-`tank` reads **4.00 of five** against all-`ranger`'s **0.03** and all-`mage`'s
  **0.00** — `GEAR_PROFILES` pays a tank +46% attack at Relic 100 and a mage +120%, where the Dwarf
  fourth hundred measured the same lever at **0.33** on a pierce axis. ⚠️ **The consequence is that the
  band must be authored far _below_ its own register**: `atk` has a shipped `legendary` median of 58
  and that hundred's carriers run 30, 32 and 36 with its roof at 24. **Fourth hundred running to find
  the archetype decisive; check which kind of axis you have first.** [towers](../../docs/towers.md)
- ⚠️ **The residual and the affordability licence are the same number with opposite signs, and may not
  both be applied to one axis.** A _tax_ that costs seconds is inflated by a slow crew and must be
  discounted; a _throughput_ axis bills a slow crew **because** it is slow, so the same correlation is
  the mechanism. The Angel sixth hundred's `atk` correlates 0.571 with control fight length and the
  residual puts its binding arrangement **tenth of fourteen** — but dwarf-ref, angel-ref and dwarf-alt
  calibrate to **32.01s, 32.07s and 32.07s** and `atk` costs them 3.41, **3.70** and 3.49. **Look for
  the counter-example first, and say which of the two the number is.** [towers](../../docs/towers.md)
- ⚠️ **The _tier_ is half of a body's heat and the authored line hides it.** A `legendary` 340/42 in a
  `mage` set and a `common` 440/50 in a `brawler` one read as the same body; at level 280 the first is
  worth **×1.51** of the second, and swapping one for the other moved a shipped floor's binding
  arrangement from **53% to 100%**. **Convert for tier before comparing two hot bodies, exactly as with
  weight** — the premium is on attack as well as health. [authoring](../../docs/authoring.md)
- ⚠️ **A retirement check can have an _escort-dependent_ answer.** Behind four 300/18 commons at floor
  600 five of the Angel Tower's six fifth-hundred anchors read 100% / 4.00 for both crews; **behind
  four 520/44 legendaries every one of the six reads 0% for both.** Two verdicts from one check.
  **State the escort with the verdict**, and name the floors the survivors stand on.
  [towers](../../docs/towers.md)
- ⚠️ **"Is it ours" can come back _no_ for every candidate _including the tower's own_, and then the
  only licence left is affordability.** At band 6 the Monster fives rank tenth to fourteenth of fourteen
  on **forty** candidates, and `physicalResist` — second and third for them at band 5 — has fallen to
  fifth and seventh behind the crew whose own sixth hundred took it one session earlier; fitting the
  fight-length confound moves them at most one place. What licensed the axis was the clock: of the ten
  arrangements above them on enemy **health**, dwarf-alt runs **58.1s**, angel-alt 54.5s, dwarf-ref
  53.1s and angel-ref 39.4s at the same grade against a 60s mean bar, where the Monster fives pay 27.6s
  and 30.9s. ⚠️ **That is the first time affordability has licensed a _weight_ axis**, which is the same
  tower's fourth-hundred warning — "weight axes belong to whichever crew is slowest" — answered rather
  than ignored. [towers](../../docs/towers.md)
- ⚠️ **On a _health_ axis the `tank` archetype switches the axis off, and that is a third distinct sign
  in three hundreds.** Held at an identical stat line, all-`tank` reads **3.00 of five** against
  all-`ranger`'s **2.00**, because a pool with nothing billing it is a long fight rather than a hard
  one. The Dwarf sixth found a tank set switching a **refusal** axis off, the Undead sixth found a hot
  set switching an **amplification** axis on, and this is a weight axis wanting the hot set for the
  opposite reason to the amplifier's. **Check which kind of axis you have before allocating
  archetypes, every time.** [towers](../../docs/towers.md)
- ⚠️ **A health carrier bills what is _aimed at_ and its rank spread _shrinks_ with its size** — 3.02 of
  five in front against 3.63 behind at ×1.8 and 2.98 against 3.05 at ×3.0, where a `dodge` carrier's
  spread grew 0.45 → 1.00 with its value. That is a fourth distinct answer to the rank question in four
  hundreds. **Measure the spread at the size you intend to author, not at one size.**
  [towers](../../docs/towers.md)
- ⚠️ **Run the sustain screen over the candidate _roster_ before authoring boards, not over the prose
  after.** The Monster sixth hundred had to hold its predecessor's absolute and the screen removed
  **eight** otherwise obvious returning blocks up front — and the prose check still caught a ninth
  afterwards, `CAIRNWARD_HUSK`, carrying a `THORNMAIL` reflect as an **`opening` passive** rather than
  in its kit or its stats. ⚠️ **Screen `opening` as well as `skills` and the stat block**; it is the one
  of the three that reads as a field rather than as behaviour. [authoring](../../docs/authoring.md)
- ⚠️ **A licence expires in both directions, and "is it ours" can come back _no_ for a crew that had
  every axis one band earlier.** At band 5 the Undead Tower's whole vocabulary collapsed to one curve and
  **every** throughput candidate ranked undead-alt first of the twelve non-Angel arrangements; one rung
  and twenty-four levels later the same crew is mid-table on nearly everything, and its sixth hundred is
  taken on **margin** — third of fourteen, first of the twelve non-Angel, third on the residual in a
  three-way tie inside 0.18. ⚠️ **And the candidate that looks decisive can lose on a dead heat**:
  `magicResist` against a crew dealing twelve magical damage effects and zero physical, six of them
  drains, ranks **second behind demon-alt at every size on both tables**, which makes it the Demon
  Tower's fourth hundred rather than this one's. [towers](../../docs/towers.md)
- ⚠️ **A refusal recorded on the _clock_ expires when the clock gets cheaper, which is a different
  expiry from the one recorded on size.** The Elf Tower's fourth hundred measured `def` inert and its
  fifth measured it at 0.38 / 2.85 and **declined it on seconds**; its sixth takes it, and nothing
  about the stat changed — the board weight reading ≥3.90 of five falls **14,268 → 3,864
  common-equivalent** across the hundred, so the twelve seconds armour buys are seconds the fallen
  weight gave back. **Say which of size or seconds a refusal was recorded on.** [towers](../../docs/towers.md)
- ⚠️ **The counter-example and the residual are both legitimate readings of a confounded cross-crew
  table, and which applies is a property of the table.** The Dwarf sixth hundred disproved the
  fight-length confound with a row that should have been first and was twelfth (correlation 0.177).
  The Elf sixth has the same confound at **0.79** and no such row — the three arrangements nearest the
  binding one are the three slowest in the game — so the residual is what settles it, putting elf-alt
  **first at +1.59 against +0.62**. **Look for the counter-example first.** [towers](../../docs/towers.md)
- ⚠️ **A defensive stat grades in _value_ and an offensive one in _carrier count_, on a tower as well
  as in a chapter.** `def` 70 reads 3.98 / 4.00 / 3.70 / 3.63 / **2.48** across zero to four carriers
  at the Elf sixth hundred's control — flat through the middle and a cliff at the end, the survivors
  metric saturating. **Check which dimension your axis has before planning six bands on it.**
  [towers](../../docs/towers.md)
- ⚠️ **Armour on the anchor is worth 0.00 and armour on the escorts is the axis, so a band table about
  armour counts the _light_ bodies.** `def` 70 on the anchor reads 4.00 of five against a 3.98
  control; the same value on four escorts reads 2.48. The Elf sixth hundred's table therefore counts
  bodies at common-equivalent `def` ≥ 60 **under 700 raw health**, while its opening band's boards
  carry two or three heavy bodies over that threshold where the measurement says they are worth
  nothing. **State which bodies a count is over.** [towers](../../docs/towers.md)
- ⚠️ **A rung boundary is only a reprieve on the retirement check when the hundred's _gear_ is flat.**
  The Elf fifth hundred's check came back clean because ×1.6 and twenty-four levels outrun
  `perLevel.ascended` over forty-seven; the sixth's retires **eight of that tower's fourteen
  `ascended` blocks**, because floors 401–500 climb Masterwork 1 → Relic 40 for ×1.09 in effective
  tank health where 501–600 climb Relic 41 → 100 for **×1.47**. **Multiply the gear step into the
  boundary before predicting the check.** [towers](../../docs/towers.md)
- ⚠️ **On a refusal axis at Relic 100 the gear archetype is worth more than the axis.** Held at an
  identical stat line, all-`tank` reads **4.05 of five** where all-`brawler` reads 1.77 and
  all-`ranger` **0.38** — `GEAR_PROFILES` pays a tank +46% attack and a ranger +112%. The Dwarf sixth
  hundred's finding at three times the size, because Relic 100 is the biggest gear in the game.
  [towers](../../docs/towers.md)
- ⚠️ **A hundred can be built on _refusing_ the axis of the hundreds below it, and the damage formula
  is what licenses it.** The Dwarf Tower spent its fourth hundred on `physicalPierce` and its fifth on
  that pierce carried with the attack behind it; `effectiveDefence` returns `def × (1 − pierce)` and
  `resistedShare` multiplies by `1 − resist` **afterwards, untouched by any pierce**, so the sixth
  hundred's `physicalResist` is the one wall those two hundred floors taught the player to open and
  cannot. It is the tower's **first exclusive licence** — dwarf-ref 1.35 and dwarf-alt 1.28, first and
  second of fourteen, 25% clear of third. ⚠️ **Not the Monster Tower's third-hundred lock wearing a new
  name**: that argument is about the _Monsters'_ pierce being the wrong stat, and a Dwarf five carries
  `physicalPierce` Σ0.15 against Σ0.70. **Two towers with one stat is a question about the argument.**
  [towers](../../docs/towers.md)
- ⚠️ **A single well-chosen counter-example disproves a confound where a regression only discounts it.**
  A Dwarf five is the **slowest mortal arrangement in the game** and calibrates to a 27.9s control
  against most crews' 8–16s, which is exactly the shape the Demon fifth hundred says demands a
  residual. It needed none: **angel-alt is the slowest of all fourteen at 35.7s and reads 0.15,
  twelfth**, with a correlation of 0.177 across the table. **Look for the row that should be first and
  is not, before fitting a trend.** [towers](../../docs/towers.md)
- ⚠️ **The rank a carrier stands in is priced by its _output_, not by the axis it carries — and two
  carriers on one hundred can disagree.** At the Dwarf sixth hundred, carried on one body, the
  lieutenant (the heaviest carrier, and the only one with a second turn) reads **2.25 of five in front
  against 3.02 behind** while the middle carrier reads **4.00 either way**. That is a **third distinct
  answer in four hundreds**: a dodge bills what is _aimed at_ (0.75 / 0.28), an `attackSpeed` bills
  what is _left alive_ (0.00 / 0.77), and a resist bills every blow that reaches the body whenever it
  arrives. **Carry the measurement, never the precedent.** [towers](../../docs/towers.md)
- ⚠️ **On a refusal axis the `tank` gear archetype switches the axis off.** Held at an identical stat
  line on one board, all-`tank` reads **5.00 of five** where all-`brawler` reads 4.00 — a tank set pays
  its grade into health, which buys the party seconds rather than costing it members. The Dwarf fourth
  hundred's allocation finding with the opposite sign, because the axis is the opposite kind.
  ⚠️ **And `attackSpeed` is refused on a tower whose tempo is spent even when it grades**: `effectiveSpeed`
  adds it to `haste`, and its cost correlates **0.726** with how long each crew's fights already are —
  the highest of anything measured there. **A speed tax belongs to whichever crew is slowest.**
  [towers](../../docs/towers.md)
- ⚠️ **A cross-crew ranking must be read as a _residual_ when one confound dominates the stat.** The
  Demon fifth hundred's `dodge` ranks the binding arrangement **sixth of fourteen**, which by the usual
  test is a refusal — but `dodge`'s cost correlates **0.772** with how long a crew's fights already
  are, and the four arrangements clearly above it are the **four slowest in the game** (27.4s to 41.6s
  on their own controls against demon-alt's 9.9s). Fit that trend and rank the residual and demon-alt
  is **first of fourteen at +0.76**, 55% clear of second. **Ask what else a ranking could be measuring
  before reading it as a verdict.** ⚠️ **And an axis can be taken on _affordability_, which reverses
  every earlier fight-length finding**: the Dwarf fourth, Undead fourth, Angel fifth and chapter 25 all
  chose the axis that made fights **shorter** because their crews were walking into the 67.5s bar,
  where the Demon fives clear their control in 8.7s and 9.9s and can afford eighteen seconds nobody
  else can — the Angel Tower measured that same stat one hundred earlier and declined it at 1.38 of
  five for **54.5s**. **Fight length licenses an axis as well as vetoing one; check which side of it
  the crew is on.** [towers](../../docs/towers.md)
- ⚠️ **Once a carrier count is fixed, the _rank_ each carrier takes is most of the remaining tuning.**
  The Demon fifth hundred measured one body at `dodge` 0.40 worth **0.75 of five in front and 0.28 in
  the back**, then spent that spread: every one of its hundred boards has a carrier in front, yet
  **134 of its 245 carrier slots are in front and 111 behind**, because four carriers all standing
  forward is not a board that crew clears. **A back-rank placement is a priced discount, not an
  oversight** — chapter 22's rule is about _measuring_ the spread on one body, not about refusing to
  use it. [towers](../../docs/towers.md)
- ⚠️ **On a _celestial_ tower the counter-faction inversion guard binds the lean far harder than the
  65% ceiling does, and it only bites on a band hard enough to cost members.** The Demon fifth hundred
  authored the obvious way — all three new carriers of the lean's faction on 234 of 500 slots — came
  out at 81.8% and took the tower to 65.84%, over the ceiling; **but the ceiling is not what failed.**
  `towers.balance.ts` requires a celestial tower to cost its crew _fewer_ members than a mirror board
  of the crew's own faction, and the Demon Tower had carried that inversion by **1.1 members across
  four hundred floors** before the new hundred took it to 93.7 against 92.7. Against a Demon five an
  Angel board is ×1.05 out **and** ×1.05 in where the mirror is neutral both ways, so a glassy five
  loses more to the incoming edge than it saves on the outgoing: varying faction alone, all-Angel costs
  **58.1** members, the mirror **55.7**, all-Monster **54.5**. ⚠️ **The premise holds for the Angel
  Tower by construction and for this one only empirically**, and it is invisible in the low bands —
  floors 1–300 lose 4.3, 6.3 and 8.1 members and each is _favourably_ biased. ⚠️ **The fix is who
  carries the axis, not a lighter band, and that is checkable**: 57.9 members lost sat mid-range across
  the seven towers (Undead 141.0 … Angel 36.7), so the two **returning** carriers of the other
  counter-faction took half the carrier slots instead — hundred at 67.4% Monster, tower at 55.84%
  Angel, inversion back at 84.2 against 84.9. **Check the band's losses against the other towers'
  before softening anything.** [towers](../../docs/towers.md)
- ⚠️ **A first-place cross-crew ranking is not a licence when the crew is the one furthest up its own
  ladder, and that is the third fifth hundred running where the table could not choose the axis.** The
  Humans ranked mid-table on everything because that crew is balanced and the Undead ranked first on
  everything because that crew is fragile; the **Angels rank first-and-second on nearly everything
  because they are the _strongest_ arrangement at band 5** — calibrated in 2.5% steps they take a
  control 10% heavier than any other crew (×1.10 / ×1.025 against a field of 0.625–0.975), so they
  stand on the steepest part of every curve: `critChance` 2.35 / 1.72, `attackSpeed` 3.17 / 2.59,
  `dodge` 2.72 / 2.42, `physicalPierce` 2.42 / 1.96. ⚠️ **What separates a lock from a steep curve is
  whether the axis is aimed at a _register_, and the test is a correlation rather than a ranking**:
  pierce's cost correlates **0.834** with each arrangement's authored `def` where `critChance`'s
  correlates **0.645**. [towers](../../docs/towers.md)
- ⚠️ **A mechanism argument is not a measurement, and a `bomb` is the cleanest instance the project
  has.** It bills its whole payload at expiry through `statusDamage`, which bypasses `def` entirely —
  an Angel five's largest register — it cannot be stopped by killing the caster, and every Angel
  cleanse sits behind a cooldown. Against the crew whose recorded failure is "a body removed between
  two heal ticks", measured at all five carriers, power 1.0 → 2.5 reads **4.00 survivors at every
  single row**. A `dot` reads 4.00 / 3.99 / 3.91 for the same reason: a stream of chip is what a choir
  is built for. **Price the shape before believing the story about it.** ⚠️ **The Demon fifth hundred
  repeated it on a _register_ rather than a status**: the Demon arrangements are the only two of
  fourteen carrying a point of `lifeLeech` (Σ0.22 against Σ0.00 everywhere else) and all their sustain
  is a share of damage _dealt_, so a missed swing ought to cost them the damage **and** the healing —
  stripping `lifeLeech` to zero and re-running the whole grade moves the cost from **1.82 to 1.84**.
  Σ0.22 across five is too small to be the mechanism, and the axis was right for a different reason.
  [towers](../../docs/towers.md)
- ⚠️ **An axis a neighbouring tower measured as _not_ this crew's can invert one band later.** The
  Dwarf fourth hundred read `physicalPierce` 0.35 costing dwarf-ref/alt −1.00 / −1.08 against
  angel-ref/alt **−0.08 / −0.29**, on the argument that "`def` is the Dwarves' only mitigation where an
  Angel five has armour **and** a choir". At band 5 the choir is out-scaled and the armour is what is
  left, and the Angels take first and second. **Both readings are right about what they measured;
  re-run "is it ours" on the band being authored.** [towers](../../docs/towers.md)
- ⚠️ **A closing band can be two percent of common-equivalent weight wide, and raw health calls the two
  rows identical.** Holding four of five bodies on the Angel Tower's floor 499 fixed: a `common` at
  **4,432** common-equivalent reads 100% / 95% and a `legendary` at **4,688** reads 88% / **0%** —
  both boards weighing **3,320 raw**, because at level 236 a `legendary` block is worth ×1.41 of a
  `common` one and an `ascended` ×1.99. ⚠️ **The stride swept clean while floors 497, 498 and 499 read
  23%, 0% and 30%** — the Undead fifth hundred's rule, on a sixth tower. [towers](../../docs/towers.md)
- ⚠️ **A crew's whole vocabulary can collapse to one curve, and then the cross-crew table cannot choose
  the axis.** At the Undead Tower's fifth hundred, `attackSpeed` 130, `haste` 160–190, `atk` ×1.5 and
  enemy crit at ×1.88 expected damage read the **same** 2.00 / 0.00 held at equal nominal damage, and
  every one ranks the binding Undead arrangement **first of the twelve non-Angel rows** — because that
  crew is the most fragile mortal arrangement at that band and has no answer to anything. That is the
  Human fifth hundred's problem inverted (nothing theirs because balanced; everything theirs because
  fragile) and **both end the same way: the axis is chosen on something the table cannot see.** There it
  was fight length — `attackSpeed` adds 4.1 seconds where crit adds 4.5, `atk` 4.8 and `def` 110
  **12.9** — plus an **empty register**: 0 of 362 shipped blocks carried the stat, and because it
  accrues only after a basic attack, a hundred built on it runs 64–84-tick cooldowns where the hundred
  below runs 34–40. **An empty register is a licence to measure; what turns it into a licence to author
  is the measurement plus a reason the boards can tell it apart from the curve it shares.**
  [towers](../../docs/towers.md)
- ⚠️ **When the axis blocks belong to the lean, the carriers alone can spend the whole faction
  allowance.** Three new carriers and a roof, all of the lean's faction and standing on nearly every
  board, spoke for **244 of 500 slots** before a texture body was chosen — a first pass of 94.8% against
  a 65% ceiling, the worst overshoot any tower has had, and structural rather than sloppy. **Decide the
  carrier density and the substitution budget together.** [authoring](../../docs/authoring.md)
- ⚠️ **A run of four is a run, not a law.** Four consecutive Undead hundreds each closed faster than the
  one below (51.2s, 39.6s, 41.4s, **24.3s**) and the fifth closes 0.7 seconds slower at 25.0s, because
  the fourth had already spent its whole budget on rate and let the weight fall away. **State the
  mechanism a trend rests on, not the trend.** [towers](../../docs/towers.md)
- ⚠️ **A refusal recorded on _size_ expires, and the Demon fourth hundred is the case that proves it.**
  `magicResist` was declined twice — by that tower's own second hundred (worth **0.00 / 0.54** at the
  then-ceiling of 0.14) and again by the Angel Tower's fourth (0.10 to 0.35 across 0.15 → 0.70) — and
  disqualified once by the Undead Tower's fourth as its own third-hundred axis wearing a new stat. All
  three were right about what they measured. Three further hundreds of blocks took the ceiling to **0.26**
  and the crew gained a rung and a kit, and re-measured at band 4 it grades **nine monotone steps** with
  zero timeouts (3.95 → 1.95 across 0.10 → 0.74) and reads **first of fourteen cross-crew with nine
  arrangements at or under 0.15** — the widest licence of the twenty-one hundreds. At the register it is
  still worth 0.03, reproducing the refusal exactly. **Re-measure a declined mechanic against the band
  being authored and state the register you measured against.** [towers](../../docs/towers.md)
- ⚠️ **Reading `damage.ts` rather than the stat names has now chosen an axis twice, and the second is the
  mirror of the first.** `effectiveDefence` returns `def × (1 − pierce)` and `resistedShare` multiplies by
  `1 − resist` **afterwards**, so **a pierce never touches a resist**. Monsters carry the game's only real
  `physicalPierce` and had no answer to the Monster Tower's `physicalResist`; the Demon fives carry the
  game's largest `magicPierce` (Σ0.30 / Σ0.25 against Σ0.15 everywhere else) and **nine and seven magical
  damage effects with zero physical**, so they have no answer to a magic ward — where the Elf, Human,
  Dwarf and Monster crews carry **zero magical effects at all** and read 0.00. **The crew built to open
  armour is the crew with no answer to the wall that is not armour.** [towers](../../docs/towers.md)
- ⚠️ **A pairing can be _worse_ than the half, which is chapter 23's finding running backwards.** Adding
  `physicalResist` beside the Demon fourth hundred's `magicResist` at the same size read demon-alt **0.95**
  against the half's 1.15 **and lifted every physical crew off 0.00** (dwarf-alt 0.97, monster-ref 0.85,
  dwarf-ref 0.73): harder in the abstract, and the licence diluted to nothing. Chapter 23 measured both
  resists at 0.20 worth 1.78 where `magicResist` alone at 0.30 read 0.32, against a **mixed** party. **Test
  the pairing and accept whichever direction the answer arrives from.** [authoring](../../docs/authoring.md)
- ⚠️ **A stat carried by _zero_ shipped blocks can grade beautifully and still not be yours.**
  `attackSpeed` sits on **0 of 346** blocks, grades six monotone steps on the Demon reference five
  (4.00 → 2.10 across 0 → 130) and adds only **2.6 seconds** of fight — the shape chapter 25 and three
  towers select for. Cross-crew it costs angel-alt **4.00**, dwarf-alt 3.88 and angel-ref 3.42, putting
  demon-alt **eighth of fourteen**. **A speed tax belongs to whichever crew is slowest**, exactly as a
  weight axis does. **An empty register is a licence to measure, never a licence to author.**
  [towers](../../docs/towers.md)
- ⚠️ **A ward is a share of the board rather than a stat on a body, and a _lone_ carrier is the opposite
  case.** Holding a `magicResist` total at 0.50, spread over four soft bodies it costs the binding Demon
  arrangement **1.00 of five** where concentrating it on the anchor costs 0.25 and on two heavy front
  bodies 0.25 — the party chews through every body and each one taxes for as long as it stands. But one
  carrier alone is worth 0.31 in the **front** rank and **0.00** in the back. Neither reading is a fact
  about the status; carry the rank comparison on one body. [towers](../../docs/towers.md)
- ⚠️ **The strong "this hundred restores nothing" claim is sayable only after the anchors retire, and it
  was still false on the first pass.** Five towers have shipped a false sustain claim and every earlier
  fix was the sentence; the Demon fourth hundred is the first that could make the absolute — no board over
  its hundred carries a `heal`, `drain`, `shield`, `regen`/`barrier`/`aegis` status, or a point of
  `lifeLeech`, `recovery` or `healthRegen`, against 26 and 36 boards a hundred below — and only after the
  prose check found two Angel legendaries carrying `recovery` and an `aegis` on **fourteen** boards. **Run
  the check; expect to fix content, not wording.** [authoring](../../docs/authoring.md)
- ⚠️ **A stat can split into the half a crew answers and the half it does not, and only one of them is
  an axis.** The Angel fourth hundred is built on `critChance` because `critDamageResist` is subtracted
  from an attacker's `critDamageAmp` and says nothing about how _often_ a crit lands: the two Angel
  arrangements are the **only two of fourteen carrying a point of it** (0.76 and 0.96 across five
  against 0.00 everywhere else), while `critBlock` — the half that refuses frequency — sits at **0.06**
  across five there against the Dwarves' 0.23 and 0.28. At level 189 in Fine 60 against a 4.00 / 3.79
  control, four carriers grade `critChance` **3.73 / 3.55 / 3.02 / 2.27 / 1.15 / 0.48** across
  0.09 → 0.46 with zero timeouts and **half a second of added fight**, where `critDamageAmp` at held
  chance is flat from 0.85 to 1.40 and needs 1.80 — past the shipped max of 1.15 — to match. ⚠️ **The
  same stat is the Elf third hundred's axis for the opposite reason** (an Elf five carries zero of
  both), and at band 4 elf-alt ranks **tenth of fourteen** on it and elf-ref **eleventh**. "Two towers
  with one lock" is a question about the argument, not the stat name. [towers](../../docs/towers.md)
- ⚠️ **A cross-crew licence can be exclusive on the _binding_ arrangement and inert on the other**, which
  is a shape no earlier hundred recorded: angel-alt 2.90 against angel-ref **0.79, eighth of fourteen**,
  over a second place of 1.39. **Say which arrangement the licence is over.** ⚠️ **And a retirement check
  on a geared hundred is far harsher than on a naked one** — the Angel floor-300 board carried to floor
  400 reads **0% for both** where the same check a hundred below read 73% / 50%, and **four anchors
  retire**, the most any hundred has. [towers](../../docs/towers.md)
- ⚠️ **The prose check can be a _board_ bug rather than a wording bug.** The Angel fourth hundred's first
  pass fielded five blocks carrying a `drain` or a point of `lifeLeech` above floor 300, on a tower whose
  own rule forbids enemy sustain above floor 160 — and the sweep was green, because the boards had been
  tuned with them on. **Check the claim; expect to fix the content.** [authoring](../../docs/authoring.md)
- ⚠️ **An escalation axis can be a _product of two stats_ where neither half is worth much alone, and
  the Undead fourth hundred is that case.** At level 189 in Fine 60, four carriers walked from
  `atk` 36 / `haste` 96 to 56/136 grade **3.77 → 0.93** and **3.92 → 0.00** with zero timeouts, while
  `atk` 48 alone reads 2.52 / 2.58 and `haste` 120 alone 3.00 / 2.63 against the pair's 2.00 / **0.97**.
  ⚠️ **It is chosen on _fight length_ and it is the first axis that makes fights _shorter_** — the
  longest fight in that hundred is **24.3s** where enemy `hp` costs 1.25 at 32.1s and `def` 110 costs
  1.94 at 33.5s, against a tower whose own binding case is a 51.2s floor. **A crew that loses to the
  clock wants the axis that converts budget into deaths rather than into pool.** [towers](../../docs/towers.md)
- ⚠️ **A mechanism argument is not a measurement, and the sharpest-sounding one on that tower was
  disqualified rather than merely weak.** `magicResist` taxes an Undead five twice on paper — 14
  magical skills to 6, and sustain that is `lifeLeech` off damage _dealt_ — and measured it lands
  **within a second of `def` and `hp`** (3.05 / 3.08 against 3.00 / 2.67 and 3.00 / 3.17), which makes
  it that tower's own third-hundred axis wearing a new stat, and worth **0.00** to the binding
  arrangement cross-crew. **Check whether a new stat lands on a curve the tower has already spent.**
  [towers](../../docs/towers.md)
- ⚠️ **But the same argument gets it wrong in the other direction too, and the test is
  super-additivity rather than the mechanism.** The Monster fourth hundred's `dodge` reads on paper as
  its own third hundred's `physicalResist` wearing a second stat — both cut the damage a `lifeLeech`
  crew sustains on — and measured the two are **not one curve**: 0.60 and 0.45 are worth 1.90 and 1.25
  of five alone and **3.90 together**, and on a single anchor each half costs 0.26 of the binding
  arrangement where the pair costs **1.88**. **Test the pairing before accepting or rejecting a second
  stat on a spent axis**, and a hundred that builds on the one below it is licensed by that number.
  [towers](../../docs/towers.md)
- ⚠️ **A dial that grades is not the same thing as an axis that is _ours_, and only the cross-crew
  table separates them.** A second `ascended` anchor grades 3.90 → 3.00 → 2.30 → 2.05 → **1.77** on the
  Monster crews with zero timeouts, and it lifts a ration that tower has held for two hundred floors —
  the Coppice's own licence. It costs dwarf-ref **−4.00** against monster-ref's −1.98, **eighth of
  fourteen**. **Weight axes tend to belong to whichever crew is slowest**, not to the one being
  authored for. [towers](../../docs/towers.md)
- ⚠️ **A tower with no lean still overshoots its faction share, and what it overshoots is the
  flat-spread ceiling.** The Monster Tower has no counter-faction to author into, so its four new
  blocks were chosen by the spread's **thinnest** row (Dwarf, 11.12%) — and the first pass still landed
  at **22.59%** against a 25% bound. Both named fixes were needed: swap that faction's non-new texture
  out, **and ration the axis carriers** so the band claim is a range rather than a constant.
  [authoring](../../docs/authoring.md)
- ⚠️ **An axis can stop being a crew's own when the crew gains a rung and a kit.** Re-measured at band
  4, the Undead Tower's _third_-hundred axis (enemy `hp`) costs dwarf-ref **−2.78** against the Undead
  crews' −1.25 / −1.00, and its _second_-hundred axis (`dodge`) costs dwarf-ref −1.05 against
  undead-ref's −0.85. **Re-run "is it ours" on the band being authored, never on the band that
  recorded it.** [towers](../../docs/towers.md)
- ⚠️ **A register check can be about a _pairing_ rather than a stat, and then it is the pairing you
  state.** The Undead fourth hundred sits inside both shipped registers on each stat alone (`haste`
  median 94 / ceiling 152, `atk` 56 / 100 over 334 blocks) and steps past on carrying them together:
  **5 of 334** blocks had `haste` ≥ 118 _and_ `atk` ≥ 70 before it. [authoring](../../docs/authoring.md)
- ⚠️ **The missing-`gearArchetype` trap can invert the sign of an anchor-retirement check.** On a
  geared floor a block with no archetype fights **naked** on a board priced as though it were kitted:
  `THE_WITHERED_CROWN` measured 3.10 / 3.63 — safe — and reads **3% / 18%** once given one. **Supply
  the archetypes before running the retirement check, not after.** ⚠️ **It fired a second time one
  tower later and it was never one tower's problem**: **48 of 338** shipped blocks carried no
  archetype, sixteen of them on the Monster Tower's own third hundred, and supplying them moved
  `THE_UNBITTEN` from a comfortable 4.00 / 4.00 to **2.98 / 1.95** and `THE_HORNCALLER` from
  5.00 / 4.00 to **3.83 / 2.00**. All 48 have one now and none stood on a geared board, so the bill was
  zero — **checked rather than assumed**, which is the half of the fix that is not optional.
  [towers](../../docs/towers.md)
- ⚠️ **The stride is not the check on a closing band.** `towers.balance.ts` samples every fourth floor
  plus the mini-bosses, and its every-floor assertion is what caught an Undead floor 399 at **60%**
  between neighbours reading 100% and 98%. **Sweep every floor of the closing band before believing a
  band that samples cleanly.** [towers](../../docs/towers.md)
- ⚠️ **Aim past the front rank is now inert or negative on all _seven_ towers**, which closes the
  question rather than adding a data point: the Undead fourth hundred reads `enemy-all` at the wide
  cap as **−0.11 / −0.08** against its controls. [towers](../../docs/towers.md)
- ⚠️ **A hundred can measure its whole vocabulary as inert, and then the axis is plain throughput —
  `atk` and the health standing under it, as a _product_.** The Elf fourth hundred is that case: at level
  189 in Fine 60 against a 3.95 control, twelve hostile status riders span **±0.22** (four negative),
  `tenacity` is **exactly flat**, `magicResist` **exactly 0.00**, `critBlock` 0.05, `accuracy` 0.05,
  `physicalPierce` 0.10, every scope/reach/selection leaves the board _easier_ (the sixth tower to find
  it), voice count is flat, and the entire sustain vocabulary spans **0.07 of a survivor**. What is left
  grades: 520/52 is worth 2.40 and 900/36 is worth 0.75, while **700/52 is worth 3.62**. ⚠️ **A body
  bills its attack only for as long as it lives** — `atk` 70 reads 3.98 of five on 340 health and 3.08 on
  1100, and the same 202 points of board attack reads 4.88 on a soft escort and 2.75 on the anchor.
  [towers](../../docs/towers.md)
- ⚠️ **A cross-crew "is it ours" table needs every crew's control able to fall, and a coarse calibration
  lies.** Calibrating each crew to the ladder rung nearest 4.00 left ten of fourteen reading 4.00 flat and
  made attack look like the Elves' own lock by a factor of 2.35; re-calibrating to **the heaviest board
  each crew still reads ≥3.75 on** moved elf-alt from first of fourteen to **fourth**, changing the licence
  from exclusivity to **margin**. Say which of the two you have. [towers](../../docs/towers.md)
- ⚠️ **The anchor that has to retire can be the one whose kit was the _previous hundred's axis_, and two
  can go while a heavier, older block stays.** At the Elf Tower's fourth-hundred roof, `THE_GRUDGEKEEPER`
  (1520/89) reads 78% and the Adamant Colossus (1250/88) 100% / 4.08, while `THE_EDGEWRIGHT` (1300/84 —
  the hundred below's own roof) reads **5%** on its `critChance`, and `THE_DOORSTONE` (1480/88) **0%** on
  the `def` and `physicalResist` that buy it 29 seconds of swinging against the Grudgekeeper's 17. ⚠️ **The
  Colossus survives on `haste` 58, the lowest in the game.** [towers](../../docs/towers.md)
- ⚠️ **A tower's escalation axis can be the _gear its boards wear_, and the campaign's "gear is
  texture" figures do not transfer.** Every one of those was measured while the campaign's board budget
  fell 0.595 a chapter _underneath_ the ramp. Hold a tower board still and add the same gear: **Worn 1
  costs the binding crew 0.82 of five, Sturdy 20 takes it to 93%, and Fine 60 reads 0%** — where
  chapter 16's whole Relic ramp measured 0.08 of a survivor. **State whether the board under a gear
  figure was being lightened.** ⚠️ **Relic 100 is not an authorable ramp endpoint** (the control dies in
  7.1s), and ⚠️ **a tower cannot read its gear off the campaign at matched level** — that yields no gear
  anywhere, because `c12-s1` is level 225 and the tallest roof is 189. [towers](../../docs/towers.md)
- ⚠️ **The gear ramp is one rule for all seven towers, so only the _first_ geared hundred may spend it as
  an axis. Every one after inherits it and owes an axis on top.** The Dwarf fourth hundred's is
  `physicalPierce`, and it is the first axis aimed at the stat a crew's whole identity is:
  `core/battle/damage.ts` computes `def × (1 − pierce)`, and the Dwarf fives carry authored `def`
  **Σ163 / Σ186** against Undead's Σ50 / Σ45. It grades 0.10 / 0.57 / 0.85 / 1.03 / 1.43 / 2.32 across
  0.10 → 0.60, **and in carrier counts as well** (3.95 → 3.10 across zero to four at 0.35), with zero
  timeouts. ⚠️ **It was chosen on _fight length_** — `def` 110 is worth 1.33 at 58.2s, enemy `hp` 1300 is
  worth 3.67 at 67.9s and a 20% win rate, `haste` 143 is worth 2.00 at 44.1s, and pierce 0.45 is worth
  1.43 at **41.1s** against a 31.6s control. Chapter 25's rule, on a tower whose own third-hundred roof is
  the tightest cleared fight in the project. [towers](../../docs/towers.md)
- ⚠️ **A party-side register can point at the right crew for the wrong reason, and only the measurement
  settles it.** "The Dwarves have the most `def` to lose" is false: both **Angel** arrangements carry
  _more_ authored `def` (Σ195 / Σ174 against Σ186 / Σ163) and lose **−0.08 and −0.29** to pierce 0.35 where
  the Dwarves lose **−1.00 and −1.08**, first of fourteen crews. `def` is the Dwarves' _only_ mitigation —
  no `magicResist`, no `dodge`, Σ0.12 / Σ0.32 of `tenacity`, no `lifeLeech` — where an Angel five has armour
  **and** a choir. **State what a register is a share of, not just its size.** [towers](../../docs/towers.md)
- ⚠️ **An inherited board-shaping rule can fail to transfer to a new axis, and a confounded first pass can
  make it look like it transferred.** The Dwarf Tower's own "escalate in front; the back rank is a cliff"
  is a rule about **output**, and moving a pierce carrier between ranks is worth **−0.37 to +0.33**. The
  first reading said 1.93 and 1.80 against 2.52 — because that five's _third_ body also carried pierce, so
  moving one back put **two** carriers there. Chapter 22's "a rank comparison must be carried on one body",
  caught before it shipped. [towers](../../docs/towers.md)
- ⚠️ **A roof can fail on its own _attack_ rather than on its escort, which inverts the Human roof
  finding, and both halves may need to come down.** With weight held at 1200 hp the Dwarf fourth
  hundred's roof reads **0% at `atk` 70**, 2.67 / 2.35 at **52**, 4.00 / 3.95 at 38 — and one turn instead
  of three at `atk` 70 reads 100% / 1.20. Its escort had to come down too: four low-`atk` commons read
  100% / 2.67, swapping one for a 900/**48** body reads 48% / 53%, and one pierce carrier in the escort
  reads **3% / 5%**. **Shortlist on weight, settle on attack** — chapter 20's rule, on a roof.
  ⚠️ **And a superlative about seven towers goes stale the moment the next hundred lands**: the Panoply
  shipped as "the lightest tower roof on attack, tied on health" and the Proof House took both records one
  session later at 1200/52. Both files now state the list, which is nine long now. [towers](../../docs/towers.md)
- ⚠️ **A session's own new blocks move the register it is citing, so state the register you _measured
  against_.** The Dwarf fourth hundred built on `physicalPierce` at a pool of **105 of 326** blocks, median
  0.20, Human ceiling **0.30** — and shipping its own four carriers took the pool to **109 of 330** and the
  Human ceiling to the roof's own **0.40**. A header quoting the post-authoring figure would be claiming its
  band was built at a register the band itself created. Same family as "a threshold claim has its range grow
  underneath it", one step earlier. [towers](../../docs/towers.md)
- ⚠️ **The roof-above-the-rung's-cap guard stopped working at the fourth hundred and was restated
  rather than slid.** `legendary` caps at 200 against a roof of 189, so the top crew _could_ legally
  out-level its own roof while standing 66 levels under it — and band 3, unchanged since it shipped,
  lost its top-band exemption the moment a fourth band existed. **Both fired because the band _count_
  changed on boards that did not move a level.** What replaced them is the quantity they stood in for:
  the **power ratio**, bounded 1.55–1.85, reading 1.600 / 1.689 / 1.676 / 1.663.
  ⚠️ **Band 4's rung is the first that is also a _kit_ rung** — that crew gains a third skill, which the
  ratio cannot see — so a fourth hundred is tuned on survivors and the ratio is a legality check.
  [towers](../../docs/towers.md)
- ⚠️ **The payout bound is the binding constraint on a tower's roof, and it is the first thing an
  extension checks.** A floor's lump is read off the campaign at matched level; at five hundred floors
  the roof of 236 pays **18,880** against the stage-500 lump of 20,000, and the highest legal roof is
  **249** (250 pays exactly 20,000 and fails outright) against a solved slope of 236. ⚠️ **The fourth
  hundred doubted a fifth would be solvable and it was, with thirteen levels of margin where the fourth
  had ten** — but the margin is the quantity to watch, and a sixth hundred is the case most likely to
  finally license making `floorLevel` piecewise. [towers](../../docs/towers.md)
- ⚠️ **"Is it ours" can come back _no_ for every candidate, and that is a finding rather than a failed
  search.** At the Human Tower's fifth hundred, ten stat candidates and three pairings priced across all
  fourteen shipped arrangements — each crew calibrated to the heaviest control it still reads ≥3.60 on —
  rank the **binding** Human arrangement between fifth and eleventh of fourteen on every one: `def` 110
  costs undead-alt 4.00 and human-alt **1.88**, `dodge` 0.30 tops out at dwarf-ref, `attackSpeed` 55 at
  angel-alt and both Dwarf fives. **The Humans are the balanced faction — mid-table on every defensive
  register — and the price of being balanced is that no lock is exclusively theirs.** Take the axis on
  **margin rather than exclusivity** and say which of the two you have. [towers](../../docs/towers.md)
- ⚠️ **An axis can be a _pairing whose halves each belong to somebody else_, chosen on fight length.**
  `def` alone walks that hundred's control from 19.2s to **36.1s** for 2.88 survivors — the
  ninety-second clock's direction — and `haste` alone is that tower's own third-hundred axis, spent.
  Together the same difficulty reads **26.1s**, and the pair grades in carrier counts as well as in size
  (0.90 / 1.55 / 1.98 / 2.50 / 3.18 across one to five, zero timeouts). ⚠️ **The register claim is then
  about the _pairing_ while each half stays inside its own**: `def` ceiling 70 and `haste` ceiling 152
  across 350 blocks, nothing past either, but **0 of 350 carry `def` ≥ 60 _and_ `haste` ≥ 116**.
  [towers](../../docs/towers.md)
- ⚠️ **A continuing gear ramp steps _down_ at every grade boundary, so the band after one opens
  heavier.** Floor 400 wears Fine 60 at +65.7% health on a `tank` and floor 401 wears Masterwork 1 at
  **+20.2%**; floor 467 wears Masterwork 80 at **+108%** and floor 468 wears Relic 1 at **+25.8%**. The
  campaign's "a band that adds a lock opens heavier, not lighter" rule, with a grade boundary in place of
  the lock. [towers](../../docs/towers.md)
- ⚠️ **"An anchor retires" needs the floors it retires _from_.** Four retire from the Human fifth
  hundred's closing bands at floor 500 — 53% / **0%**, 93% / **8%**, 100% / **10%**, 100% / **45%** —
  while `TYRANT` at 1550/96, heavier than three of them, reads 100% / 3.02 and stands. Two of the four
  **anchor boards in the opening two bands and read 100% with five alive there**, twenty-five levels
  lower. A bare "it retired" retires a block from content it is fine on. [towers](../../docs/towers.md)
- ⚠️ **A roof can fail on its own attack with the escort innocent, and the tell is the fight getting
  _shorter_ as the escort lightens.** Nine escort shapes all failed at 1160/60 on the Human fifth
  hundred's roof; attack settled it at **44** with the escort untouched (60 → 8%, 52 → 70%, 44 → 83%).
  ⚠️ **That inverts the same tower's fourth-hundred roof finding**, where the escort was the whole
  question and the boss needed no retune. **Take the measurement, not the precedent.** ⚠️ **And settle a
  lieutenant across _every_ appearance**: its attack came down 58 → 36 with the pair held, failing 6, 4,
  3, 2 and 0 of its **twenty-seven** boards at 58, 50, 44, 40 and 38 — and the stride hid seven of the
  failures. [towers](../../docs/towers.md)
- ⚠️ **Extending a tower moves shipped floors by a level, and the stale claims land in files the
  session never opened.** 400 → 500 moved 20 of 400 floors and invalidated **eight band headers, six of
  them in files the session never opened**; 300 → 400 moved 18 of 300 and invalidated **fifteen band headers
  across all seven tower files** — thirteen of them outside the tower being extended. Find them with a
  script over `floorLevel`. [authoring](../../docs/authoring.md)
- ⚠️ **An escalation axis does not have to be a stat or a mechanic. The _size of one instance of
  damage_ is one, and on a crew that heals `ally-lowest` on a cooldown it is the only one.** Hold
  damage per second constant and make each blow bigger and rarer: against the Angel crews at the
  third hundred's roof level that grades 4.00 → 3.38 → 2.33 and 3.52 → 1.02 → 0.15 across power
  1.55/cd 35, 2.20/cd 50 and 3.10/cd 70, **with zero timeouts** — the burst body deals _less_ over a
  fight, because it basic-attacks between casts. A choir can out-heal a river and cannot out-heal a
  hammer. ⚠️ **The licence there is margin rather than exclusivity**, which is weaker than a
  Monster-Tower-style lock: the same swap costs every crew about a member (−0.63 to −2.08) and the
  Angel alternate 2.38. Say which of the two it is. [towers](../../docs/towers.md)
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
  [towers](../../docs/towers.md)
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
  say which one a claim is about. [authoring](../../docs/authoring.md)
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
  before believing a native fix is needed for WebView chrome. The one shipped subclass
  (`ios/App/App/BridgeViewController.swift`, double-tap zoom) passed that test rather than
  skipping it: the pod source covers pinch and never double-tap.
- **Do not put `maximum-scale=1, user-scalable=no` in the viewport meta.** It is the reflex fix
  for zoom in a shelled app and it is all cost here: AXE flags it under WCAG 1.4.4, and it buys
  nothing over the native `zoomEnabled: false` above plus `touch-action: manipulation` for
  double-tap. Keep `viewport-fit=cover` — that is what makes the safe-area insets report real
  values instead of zero. ⚠️ **`touch-action: manipulation` cannot stop WKWebView's double-tap
  zoom, and neither can any one-shot native disable — WebKit re-decides recogniser enablement on
  every rendered commit and attaches recognisers on its own schedule.** The CSS stays (`*` in
  `src/styles.scss`, for the tap delay; the property does not inherit, so `html`-only reached
  nothing), but the shell defeats the gesture in `ios/App/App/BridgeViewController.swift`: a
  blocker recogniser whose delegate answers `shouldBeRequiredToFailBy` for every one-finger
  double-tap — per-gesture, so it survives both the decay and the timing — plus an action that
  resets any drifted scale to 1. Both halves matter: WebKit arms double-tap zoom everywhere the
  moment the page leaves its initial scale, and Capacitor's pinch block fires only _inside_ the
  first pinch, which is exactly the leak that creates the drift and then strands the player at
  the zoomed scale. Proof is `ios/App/AppUITests/ZoomTests.swift` — XCUITest, the only harness
  that injects real double-taps; see [platform](../../docs/platform.md) for the full account and how
  to run it.
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
