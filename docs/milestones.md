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
| 8d  | The combat rework: lineup bonuses       | 🟡 Next                                      |
| 8e  | Five characters per faction             | ⬜                                           |
| 9   | Resonance — levels the roster shares    | ⬜                                           |
| 10  | Power that compounds                    | ⬜                                           |
| 11  | Chapters                                | ⬜                                           |
| 12  | Gear                                    | ⬜                                           |
| 13  | Settings, and the save-safety gap       | ⬜                                           |
| 14  | Dailies, bounties and notifications     | ⬜                                           |
| 15  | Faction towers                          | ⬜                                           |
| 16  | Deep per-hero investment                | ⬜                                           |
| 17  | The roguelite run                       | ⬜                                           |
| 18  | Puzzle maps                             | ⬜                                           |

---

## 1. Tick loop, one resource, save/load — **COMPLETE**

A number counts up on screen and survives a refresh. This proves the whole architecture
end to end: `core/` purity, the sim/render split, and the save path.

Concretely: a gold counter that accrues at 10Hz, samples into the UI at ~6Hz, persists through
`@capacitor/preferences`, and settles offline earnings in closed form on resume. Underneath it,
`Numeric` wraps `break_infinity` so the backing numeric type is a one-file swap, the seeded
mulberry32 PRNG resumes in O(1) and derives sub-streams ready for combat, and the save layer
carries a migration chain, fixtures, and repair that clamps damage rather than throwing.

Shipped: `core/numeric.ts` (`Numeric` over `break_infinity`), `core/rng.ts` (seeded
mulberry32 with O(1) resume and derived sub-streams), `core/state.ts`, `core/tick.ts`,
`core/save/` (versioned saves, migration chain, non-throwing repair, fixtures),
`core/offline.ts`, `ui/game-loop.service.ts`, `ui/save.service.ts`,
`ui/format-numeric.ts`.

## 2. Player-initiated battles up a stage ladder — **COMPLETE**

`simulateBattle(team, stage, seed) => BattleResult` resolves instantly and headlessly into an
event log; the UI animates the log afterwards. Combat is not driven by the render tick — that
decision is what makes 2x/4x/skip and offline resolution free, and the 1x/2x/4x control that
shipped with it is one multiplication in the animator, not a second combat path.

**The player starts every battle, one at a time.** Nothing fights on its own. Tapping Fight
resolves one battle, narrates it, holds the finished board on screen, and stops. Neither kind
of auto-battle is built here — see "Later: the two auto-battles" below, and do not add either
to this milestone.

**Home and battle are two screens, and the battle replaces the home screen rather than sitting
under it.** `App` is the shell: it starts the run, owns the single `main` landmark, and swaps on
`BattleService.isOpen`. A fight has no exit until it ends — a battle is seconds long and can be
sped up, and leaving early would discard rewards the player is moments from collecting. When it
settles, two controls appear: fight the next stage without leaving, or close and return home.

**Clearing a stage raises idle income permanently, and that is the real reward.** A run starts
at `goldPerSec: 0` and earns nothing at all until the first stage falls, which is what makes
the first battle the only thing worth doing. The rate climbed 0.5/s to 16/s across the
eight-stage ladder as it stood here — milestone 4's twelve stages take the top to 25/s — and
`applyBattleResult` only ever raises it. The one-off `goldReward` is the smaller half, tuned to
roughly 40 seconds of the income it unlocks.

**Turn order is an ATB gauge** (`gauge += haste` per tick, act at 1000) rather than fixed rounds,
so haste buys turns instead of just going first. Randomness comes from a sub-stream derived via
`deriveSeed(seed, 'battle:<stageId>:<battleCount>')`, and the number of draws an action spends
never depends on how those draws came out — so replaying a battle is reproducible and never
shifts the gacha sequence, which stopped being hypothetical in milestone 3. Milestone 4 kept
every one of those properties and split the damage formula across two defences.

Shipped:

- `core/battle/clock.ts` — the ATB constants and `ticksUntilReady()`. The simulation jumps
  straight to the tick of the next action rather than stepping tick by tick;
  [`clock.spec.ts`](../src/core/battle/clock.spec.ts) pins that jump against a brute-force
  per-tick count, the same way offline resume is pinned against stepwise accrual.
- `core/battle/types.ts` — the two-layer content vocabulary. `...Data` types are the plain
  JSON-safe shapes `data/` authors; the runtime types are what the simulation works in.
- `core/battle/content.ts` — parses and clamps authored content. `haste` is clamped to
  `[1, ATB_THRESHOLD]`, and the simulation's termination argument depends on it.
- `core/battle/damage.ts` — `atk² / (atk + def)`, strictly positive so a battle always ends,
  with diminishing DEF returns. Crits are the only RNG consumer, at exactly one draw per
  attack so consumption never depends on the line-up.
- `core/battle/simulate.ts` — the ATB loop and `battleSeed()`.
- `core/battle/progress.ts` — `applyBattleResult()`. `battleCount` advances win or lose, so a
  retry is a new fight rather than a bit-for-bit replay of the same loss.
- `data/` — `enemies.ts`, `characters.ts`, `stages.ts`. Eight stages, cleared end to end by
  the starter party; [`data/stages.spec.ts`](../src/data/stages.spec.ts) proves it by simulating the ladder.
- `ui/battle.service.ts` — `fight()` resolves then narrates, `close()` leaves.
- `ui/home-view.ts`, `ui/battle-view.ts` — the two screens; `app/app.ts` is the shell that
  swaps between them.
- Save v2: `stage` and `battleCount` in `GameState`, via the first real migration.

Two decisions worth not re-litigating:

- **The result is applied when the animation finishes, not when the battle resolves.**
  Applying it up front spoils every fight: the gold counter and the income rate both jump the
  instant the player taps, announcing the outcome before the first blow lands. The cost is that
  a battle abandoned by a reload mid-animation pays nothing — acceptable precisely because the
  player starts each fight and watches it, and going again is one tap. This survived contact
  with auto-battle unchanged: that loop is foreground-only, so it is attended too and the trade
  never inverts. What auto-battle does need is to **persist** at the end of each fight rather
  than waiting for the next autosave; see "Later: the two auto-battles".
- **Targeting was the living opponent with the least HP, ties by slot.** Deliberately naive
  until enemy design gave it something to reason about, which milestone 4 did: an ordinary
  attack now goes through the **front rank** and only reaches the back one once the front is
  empty, and reaching past it is a property of individual skills rather than of a stat.

## 3. Gacha, roster, ascension and levelling — **COMPLETE**

`pull(state, banner, count) => { state, results }`. Pity lives in `GameState`, is **global
rather than per-banner**, and is visible in the UI at all times. Pulls advance
`state.rng.calls`; combat never does.

Rates are deliberately far more generous than commercial tuning: base ascended-tier 2.5%, soft
pity from pull 30 ramping +6%/pull, hard pity at 50 — and soft pity passes certainty around
pull 47, so the guarantee is a floor rather than the mechanism. A paid gacha tunes to sell a
bridge across a gap it manufactures. There is no bridge to sell here, so every reason to be
stingy is a reason that does not apply.

**A pull consumes exactly three RNG draws whatever it produces** — tier, character, elite
upgrade — including the upgrade roll on results that can never be upgraded. Same discipline as
crits in `damage.ts`, for the same reason: if consumption depended on the branch taken,
`rng.calls` would no longer describe where a run is in its sequence and O(1) resume would break.

### Two rarity axes, which is the thing to understand first

**Tier** is which character you pulled and never changes: `common`, `legendary`, `ascended`.
**Rarity** is how far that character has been ascended, `rare` → `ascended-5`. They share two
words (a `legendary`-tier character and the `legendary` rarity are unrelated) because that is
the genre's vocabulary; the types keep them apart.

Tier is a **slope, not a head start.** Base stat budgets are close across tiers — a higher tier
buys a sharper version of its faction's identity, not more of everything. The gap opens through
per-level growth: ×1.2 at level 50, ×19.5 at level 1000. That is what makes a common-tier
character a genuine early answer that genuinely falls off, as a consequence of the math rather
than as an assertion. Any character of any tier can reach `ascended-5`.

### Ascension

Duplicates are the primary progression path, so a dupe is never wasted. Two ladders, authored
in `data/ascension.ts` and resolved by `core/roster/rarity.ts`:

- **Mortal** (Humans, Dwarves, Elves, Undead, Monsters) spends **bodies**: four rungs are paid
  with same-faction fodder. An ascended-tier unit costs 8 of its own Elite copies plus 180 Rare
  copies of fodder to reach Ascended, 18 Elite copies for ★5.
- **Celestial** (Angels, Demons) spends **luck**: every rung is copies of the character itself.
  14 Elite copies to Ascended, 24 for ★5, no fodder at all.

Rungs are quoted in _ascended_ copies and a player only holds _base_ ones, so every requirement
is **resolved recursively into base copies**. That recursion is why this is code and not a
lookup table, and [`data/ascension.spec.ts`](../src/data/ascension.spec.ts) pins every derived total against its design target.

**Only spare copies are ever consumed, never a character you have levelled.** A deliberate
departure from the genre: nobody can destroy a week's investment by tapping the wrong row, so
the confirmation dance around irreversible loss does not exist, and a faction-mate stays both a
playable character and an ascension resource.

Copies of a character already at `ascended-5` convert to **spark**, which buys either a new
character or a targeted copy in the shop. Spark only accrues after something is maxed, so it is
late-game overflow — **pity is the escape valve for bad luck, not the shop.**

### Levelling and the four currencies

`GameState` carries a keyed **wallet** and **rate table** rather than a field per currency; ten
flat fields would have been ten lines in every encoder, decoder and repair pass.

- `gold` — broad. Levels now, gear later, so it is the most comfortable of the three.
- `xp` — characters only, so it accrues far more slowly.
- `essence` — charged only at breakthrough levels (every tenth) and the stingiest thing in the
  game. Cheapest of the three before level 60 and the most expensive by 200.
- `summons` — buys pulls. Slow idle trickle **plus a first-clear bonus**, and deliberately
  **not** a repeatable battle reward: stage 1 resolves in four seconds, so a repeatable crystal
  payout would make tap-farming the bottom of the ladder the fastest way to pull.
- `spark` — the only currency with no rate at all, enforced by the `Rates` type.

The design target is that no currency is decorative: through level 140 all three levelling
currencies land within about a third of each other in time-to-afford. Level cap is 1000 at
`ascended-5` and is aspirational — the ladder is twelve stages long, and rates rise with
content.

**Only the quantities scale** — `hp`, and after milestone 4 the four attack and defence stats.
`haste` is ATB gauge per tick against a fixed threshold and `critChance` is a probability; a
growing `haste` would hit the clamp within eighty levels and turn the one stat that buys turns into
a constant. Milestone 4 extended the same argument to `mp`, which is a budget measured against
authored skill costs rather than a quantity.

**A migration cannot finish the job on its own, and the v2 → v3 one proved it twice.** It carried
gold across and started xp, essence and summons at zero, leaving a returning player on gold-only
income with no way back except re-fighting stages they had already beaten. And it seeded
`clearedStages` from `stage - 1`, which looked careful — "do not pay a bonus they already earned"
— but was exactly backwards: the first-clear bonus **did not exist in v2**, so nothing had been
earned, and marking those stages settled closed the door on all 3,000 crystals silently and
permanently. Neither was fixable inside the migration, because both need to know what the stages
grant and `core/` cannot see `data/`.

`reconcileClearedStages` is the repair. It runs on **every** load next to `grantStarters` rather
than behind a version gate, re-derives the clear count from the surviving gold rate, restores
every rate those stages unlock, and **pays the first-clear bonus for each stage it credits**. It
only ever raises, so a healthy save passes through by reference and is not even republished.

Three rules came out of it, and they are worth more than the fix:

- **When a migration cannot express something because it cannot see content, the missing half
  belongs in an idempotent load-time repair** — and the migration's doc comment should say so. A
  migration that quietly does half the job is worse than one that does none, because the half it
  did looks like success.
- **Crediting progress and paying for it are the same operation.** Anything that advances
  `clearedStages` must settle what that stage owes in the same step. Marking a stage cleared
  without paying it is strictly worse than leaving it uncredited, because the normal reward path
  will then skip it forever and nothing will ever notice.
- **A migration should default to crediting nothing.** Zero means "not yet settled", not "did not
  happen". Guessing progress forward inside a migration is how the door got closed in the first
  place; the repair can always infer more later, but it can never un-pay something.

Shipped: `core/currency.ts`, `core/roster/` (`types`, `rarity`, `level`, `stats`, `roster`,
`ascend`), `core/gacha/` (`pull`, `shop`), `data/` (`ascension`, `banners`, `levels`, 21
characters across 7 factions), `ui/` (`content`, `roster.service`, `gacha.service`, and the
summon, roster, character and shop screens). Save v3 folds gold into the wallet and adds the
roster, party and pity.

**Routing arrived here**, and the trigger is the one this file already named: a screen that
survives a reload. Home, summon, roster and shop all describe saved state, so `/roster/rin` is
somewhere a player can come back to. The battle screen is still a signal-swapped **mode** — its
contents live only in memory — and the tab bar hides during a fight, because a battle has no
exit until it ends and navigation that refused to work would be worse than none.

## 4. Team composition affecting combat math — **COMPLETE**

Composition matters through **enemy design**, not flat synergy bonuses — see
"Content and balance". Characters are keys to locks, not rungs on a ladder.

Milestone 3 built the lock-picking set: characters across seven factions, each expressing one
axis more sharply as tier rises. What it deliberately did **not** build was anything for those
niches to answer. Targeting was "the living opponent with the least HP", every combatant did one
thing on its turn, and the only reason to field Thraun over Vharok was a stat line.

### The formation is the whole idea

Five slots in two ranks: **two in front, three behind**. The asymmetry is deliberate — the front
row is a _gate_ ordinary attacks have to work through, so making it the smaller rank keeps it a
real cost rather than a free wall.

- Front row: **+5% to both defences.**
- Back row: **+5% to whichever offensive stat is already higher, and only that one.** Not a flat
  attack bonus. Every basic attack in the game is physical, so a caster in the back gets all of
  it on `matk` — which nothing but its skills read — and none of it on the swing it spends most
  of its turns making. The bonus pays for standing where a character's damage actually comes
  from, and a caster that has run out of MP quietly stops benefiting from where it is standing.

> **Superseded by 8a.** The collapse to a single `atk` left that rule nothing to choose between.
> Each rank now sharpens the role it already has — front `def × 1.05` and
> `critDamageResist + 0.05`, back `atk × 1.05` and `critDamageAmp + 0.05`. The asymmetry it
> existed to protect is unchanged; see [8a](#8a-the-stat-block--complete).

**Placement is free.** Any character can stand in either rank. Role-locking was considered and
rejected for one reason: it would let an unlucky roster reach a state where no legal party
exists, and in a game with no way to buy characters that is a run with nowhere to go. A bad front
row is a far better failure than no front row. `CharacterRole` exists and **nothing in the
simulation reads it** — it is there so the roster screen can say "healer" instead of making a
player infer it from a stat block and a skill list.

### The proof it works, as a number

[`data/stages.spec.ts`](../src/data/stages.spec.ts) simulates two parties that differ in exactly one slot against stage 7 —
two Boars guarding a Marsh Acolyte:

- With **Rin**, whose Piercing Shot is free, comes off a short cooldown and targets the enemy
  _back_ row, the party wins almost every time.
- With **Gnash** in the same slot, who hits harder and can only hit what is in front of him, the
  party wins almost never.

Gnash is the better character on raw damage. Under milestone 2's targeting both parties would
have spent the fight on the Boars and the Acolyte's presence would have changed nothing but the
duration. That gap is the milestone.

### The stat block, and why most of it does not scale

> **The names here are pre-8a.** The reasoning survived the rework intact; the vocabulary did not.
> [attributes](attributes.md) has the current block, and [8a](#8a-the-stat-block--complete) has
> what changed.

Seventeen stats: `hp`, `patk`, `matk`, `pdef`, `mdef`, `spd`, `critChance`, `critMultiplier`,
`mp`, `mpRegen`, `lifesteal`, `effectHit`, `tenacity`, `armorPen`, `magicPen`, `dodge`,
`accuracy`. Only the **five quantities** scale with level and rarity, and that is not a
simplification:

- `spd` is ATB gauge per tick against a fixed threshold and would hit its clamp within eighty
  levels, turning the one stat that buys turns into a constant.
- Every probability is bounded by 1 by definition.
- Penetration is capped below 1 so a defensive stat can never be erased outright, and is a
  **percentage** rather than a subtraction, so a shredder makes a wall feel like a body rather
  than like an empty square.
- `mp` is a **budget measured against authored skill costs**, so growing it would silently delete
  the metering that makes a healer's pool run out.

Two of those guards are termination arguments rather than balance opinions. Hit chance is
`accuracy - dodge` **floored above zero**, because a combatant nobody can hit turns every fight
against it into a run to the tick cap. And a `spd` moved by a haste or a slow is re-clamped for
the same reason the authored one is.

### Skills, and the three ways to meter one

Every combatant has a basic attack — physical, single target, into the front rank — plus a kit.
Selection walks the kit by descending priority and takes the first skill whose **condition**
holds, whose **cooldown** has elapsed, that it can **pay for**, and that has somebody to hit.

- **`none`** — metered by cooldown alone, so each one has to be individually weaker.
- **`mp`** — a finite pool regenerating per turn. Front-loads, then runs dry. This is what makes
  a long fight different from a short one, and it is what **guarantees a fight against a healer
  resolves** instead of grinding against a heal that never stops.
- **`hp`** — pays in the caster's own life, and never lethally. The Undead's bargain: the largest
  HP pools in the game and almost no armour to protect them, so health is the resource they have
  to spare.

Conditions are what stop a healer spending its pool on a party at full HP. Without them a
priority list would have to say "always cast the biggest thing", and a support kit would be
indexed on how often its cooldown came up rather than on whether it was needed.

### The locks

Six new enemy archetypes, each naming the answer it wants:

| Enemy         | The question                              | The answer                        |
| ------------- | ----------------------------------------- | --------------------------------- |
| Marsh Acolyte | can you reach a healer behind two bodies? | reach, or burst through the front |
| Bog Hag       | can you survive a party-wide debuff?      | a cleanse                         |
| Pyre Caster   | is any of your durability magical?        | `magicResist`, or killing it      |
| Iron Bulwark  | can you out-damage a refreshed absorb?    | burst, not chip                   |
| Rimeplate     | what do you do when both defences are up? | penetration, or Sunder            |
| Fen Shade     | what do you do when it dodges half of it? | accuracy, or volume               |

A shielder is a different problem from a healer rather than a bigger one: a barrier applied
_before_ the damage arrives cannot be raced by chip damage at all.

**Two new characters exist because of a bad-luck failure mode, not a gap in the fiction.** Wren
(Human, healer) and Dorn Saltbeard (Dwarf, cleanse) put sustain and a cleanse on the **mortal**
ladder. Angels are the natural support and they ascend on copies of themselves alone, so a run
whose banners are unkind would otherwise have no sustain at any price — which is not a fight
lost, it is a _category of answer_ the player can never buy. [`characters.spec.ts`](../src/data/characters.spec.ts) asserts both
exist at common tier.

### Factions are a matchup matrix, not a synergy bonus

The rule in "Content and balance" is about bonuses for **your own team's composition** — "+10% if
two Fire units" — because those ask nothing of the encounter and only ever produce a new optimal
team. This is the opposite shape: every multiplier is a statement about the _matchup_, so it
rewards bringing the right answer to the fight in front of you. A Dwarf wall is not better in
general; it is better against Elves and worse against Humans.

- **human → dwarf → elf → undead → human**, +5% each. A closed cycle, so no mortal faction is
  anybody's strict answer.
- **Monsters** hit everything for +5% and take +5% back from the four other mortal factions — a
  wildcard with a bill attached. Monster-on-monster is +10%, so the answer to an all-Monster wave
  is Monsters of your own.
- **Celestials** deal +10% to every mortal with nothing coming back. The one asymmetry, and a
  deliberate one: it is paid for by the **luck-only** ascension ladder, which asks for copies of
  the character itself at every rung and never accepts a faction-mate. Angel↔Demon is +5% both
  ways, so the answer to a celestial wall is the celestial you also had to be lucky to own.

The numbers are small on purpose. Five percent does not decide a fight; it decides a fight that
was already close. The counterweight to the celestial advantage is **enemy design, not
arithmetic** — no matchup multiplier lets a 380-HP Azrathoth stand in a front rank.

### Where the ladder is tuned to

Twelve stages. **The three starting characters clear the opening ladder and stop dead at stage 7,
the healer lock.** That boundary is the single most important number in `stages.ts`, and it is a
wall about _who_ is fighting rather than about how many levels they have — which is exactly the
right place for the early game to end. Two of the five formation slots start empty, and the
first-clear crystals banked below the wall are the intended answer.

A built party of five **common-tier** characters at level 80 clears the whole ladder, and stage
12 still costs it a member. Common tier deliberately: the top of the ladder may demand
investment, but it may not demand an ascended-tier pull, because there is no way to buy one.

Shipped:

- `core/battle/types.ts` — rows, formations, the seventeen-stat block, the skill and status
  vocabulary, and a fourteen-kind event log.
- `core/battle/status.ts` — buffs, debuffs, damage-over-time, shields and stuns. Quantities are
  **snapshotted at application**, so a poison does not stop hurting when its caster dies; that
  would make "kill the debuffer" the answer to every debuff, which is the same lock twice.
  Statuses **refresh rather than stack**, because two casters of the same 0.72 defence debuff
  would land 0.52 and a wide enough wave would delete a defensive stat by arithmetic nobody
  authored.
- `core/battle/skills.ts` — targeting and selection, both **completely deterministic**. Nothing
  here draws RNG, so the whole of a fight's randomness is "did it hit, did it crit, did it stick".
- `core/battle/damage.ts` — two defences, percentage penetration, an accuracy-versus-dodge hit
  roll, and the faction matrix. **Exactly two draws per damage instance and one per status
  clause, taken whatever happens** — including against a target the preceding clause just killed.
- `core/battle/simulate.ts` — a turn is upkeep first, action second. A stunned combatant **still
  consumes its turn**, which is what bounds a stun lock: a stun costs its victim turns rather
  than freezing it out of the schedule, so a fight cannot deadlock behind one.
- `data/combat.ts`, `data/statuses.ts`, `data/skills.ts`, plus re-authored characters, enemies
  and a twelve-stage ladder.
- Save v4: `formation` replaces `activeParty`, split in reading order by the migration.

Three decisions worth not re-litigating:

- **The rank sizes in the v3 → v4 migration are written out rather than imported from
  `core/state`.** A migration is dated: it describes the shape that existed the day it shipped,
  and a constant a later release is free to retune would silently change what that step means for
  every save that has not run it yet.
- **A cleanse event names the ids it removed, not how many.** The log's promise is that replaying
  it reproduces the final standings, and a count cannot do that — an animator holding two debuffs
  and told "one was removed" has to guess, and disagrees with the simulation from then on. The
  same reasoning is why turn starts and status expiries are events at all.
- **Reading a combatant's current speed does not build a stat block.** The scheduling loop asks
  every living combatant for its speed twice per iteration, and a full effective stat block costs
  four `Decimal` multiplications it immediately throws away. Doing that made a sweep of the whole
  ladder take twenty seconds; `effectiveSpeed` makes it a rounding error. The sweep still belongs
  in the fast suite — but it is now seconds rather than milliseconds, so the separate
  `*.balance.ts` project described under "Testing `core/`" is closer than it was.

## 5. Offline catch-up — **COMPLETE**

Shipped and tested in [`core/offline.ts`](../src/core/offline.ts): the continuous fixed-rate
closed form settling all four rate-bearing currencies in one pass, the backwards-clock guard, and
a non-finite guard for a damaged `lastTickAt`. `resume()` is called on load from
`ui/game-loop.service.ts` and its report is rendered on the home screen, so the path is wired end
to end rather than merely available.

**The ten-hour cap this originally shipped with has since been deleted** — see milestone 11.
There is no offline cap at all: a year away pays a year. The closed form was always O(1) in
elapsed time, so the ceiling was never buying performance; it was a genre reflex, and the only
thing it did on purpose was bound a corrupt timestamp — a job `MIN_PLAUSIBLE_TICK_MS` now does
deliberately.

The project's highest-value invariant is pinned in
[`offline.spec.ts`](../src/core/offline.spec.ts): the closed form agrees with stepwise accrual,
asserted on relative error and checked at magnitudes past float64's exact-integer range.

**This milestone closed by ruling work out, not by building it.** Two items sat on it for a
long time and both were cancelled by design decisions rather than implemented. That is worth
recording, because a future reader will otherwise see a solver named all over the codebase and
assume somebody forgot it.

### Why there is no segmented solver

The segmented closed form prices an away window in which the rate _changes_. Rates change on
exactly one event: a stage clearing. **Auto-battle is foreground-only** — it runs with the app
open and the player on the battle screen, and each battle is committed as it ends, so closing
the app costs at most the fight in flight (see "Later: the two auto-battles"). Nothing clears a
stage while the player is away.

So every rate is constant across every offline window, permanently. The fixed-rate closed form
is not an approximation that will need replacing; it is exactly right, and stays exactly right.
The trigger would be genuinely unattended progression — stages advancing with the app closed —
which is not the design. **Do not build the segmented solver speculatively.** If that product
decision is ever reversed, `AGENTS.md` still records the technique to use.

`timeToClear(state, stage)` is cancelled with it: the segmented solver was its only consumer.
`BATTLE_TICK_MS` and `BattleResult.durationMs` remain useful raw material for balance sweeps —
a mean over several seeds, not one battle, since crits make any single fight unrepresentative.

### Why `accrueDiscrete()` has no caller

It converts an expected quantity of discrete drops into whole units plus a carried remainder,
and it is built, exported and tested. It has **no consumer, and no planned one**: nothing drops
while the player is away. Idle income is the four continuous rates and nothing else, so there
was never a `dropCarry` field in `GameState` and there is no longer a reason to add one.

Kept rather than deleted because it is eight lines, fully specified, and encodes a rule worth
not re-deriving under pressure — offline loot is paid at expected value with deterministic
rounding, never rolled, because rolling invites force-quit rerolling. If a drop mechanic ever
arrives it is ready; if one never does, it costs nothing. Do not wire it up to manufacture a
use.

### What did not need revisiting

Milestone 2 applies a battle's result when the animation finishes and notes that the trade
"inverts for an unattended loop". It does not invert here, because the loop is attended by
definition. Backgrounding already pauses the animator rather than abandoning the fight, so
auto-battle inherits the existing behaviour unchanged.

One genuine gap belongs to **auto-battle, not to this milestone**: results reach `GameState` at
animation end but only reach storage on `visibilitychange` or the thirty-second backstop
autosave. A hard suspend can therefore lose completed battles, which the auto-battle section
records as a requirement to fix there.

The migration chain no longer needs a first customer: save v2 exercised it for real when combat
landed.

## 6. Run it on a physical iPhone

Do this while the app is still small, so the signing and provisioning pain lands early
rather than next to a deadline. `npm run ios` builds, syncs, and opens Xcode.

### What the first run on real hardware found

The app worked and looked broken: a narrow column of content down the middle of the screen,
white margins on all four sides, and a full-width dark tab bar that did not line up with
anything above it. The obvious reading is that the page is zoomed out — on iOS a `position: fixed`
element lays out against the _visual_ viewport, so it keeps filling the screen while a scaled-down
document does not, and that is exactly the signature.

It was not zoom. Reproduced headlessly in Chromium at 393×852 with CDP's safe-area inset
override and the scale pinned at 1.0, the screenshot matches the phone pixel for pixel. The
cause was three lines of the Angular CLI's scaffolded `src/styles.scss`, never edited since
`ng new`:

```scss
body {
  color-scheme: light; // → --mat-sys-surface resolved to rgb(255, 248, 248)
  background-color: var(--mat-sys-surface);
  padding: env(safe-area-inset-top); // → 59px on ALL FOUR sides
}
```

`padding` with a single value applies it to every side, so the **top** inset became a 59px
gutter down both edges as well — a 275px content column in a 393px viewport. The fixed tab bar
stayed 393px because fixed elements do not care what the document is doing. `min-height: 100dvh`
on both the shell and `main`, on top of 118px of body padding, put `scrollHeight` at 1142 against
an 852px viewport, which is the white below the fold.

Worth keeping: **the tell that says "zoom" also says "the document is narrower than the
viewport", and the second is far more likely.** Measure before theorising — `getComputedStyle`
on `body` would have ended this in a minute.

### What changed

- **Angular Material is uninstalled.** Nothing imported it; the only thing it did was own
  `styles.scss`, and what it did there was the bug. `styles.css` went from 8.82 kB to 699 bytes.
  `@angular/cdk` went with it and was then put back deliberately — see the deferred list below,
  which records why the two got different answers.
- **The document no longer scrolls.** `html` and `body` are `height: 100%; overflow: hidden`,
  the shell is a flex column, and `main` is the scroll container. This is the structural fix, not
  a cosmetic one: it removes page-level rubber-banding, and it lets the tab bar become a flex
  item instead of `position: fixed`. A bar that is a sibling in the layout cannot disagree with
  the content above it, and `main` stops having to carry a hard-coded 6rem of bottom padding to
  guess the bar's height — which was also dead space on the two screens that have no bar.
- **Safe-area insets moved to where they cannot scroll away.** Horizontal and top insets sit on
  the shell, so the top gutter is outside the scroll container and content cannot slide under the
  notch; the bottom inset sits on the tab bar, so its own surface colour fills the home-indicator
  strip rather than the page colour showing through. That split is the part to preserve — moving
  the bottom inset up to the shell alongside the other three looks tidier and puts the tab bar's
  touch targets over the home indicator. Measured at 393×852 with a 34px bottom inset: the links
  are 64px tall and end at y=818, exactly where the indicator strip begins, and the bar's surface
  still reaches y=852.
- **Zoom is off on both platforms, and the viewport meta was not the way to do it.** The reflex
  fix is `maximum-scale=1, user-scalable=no`; it was written, and the accessibility suite
  immediately failed all six screens on AXE's `meta-viewport` rule (WCAG 1.4.4). It turned out to
  buy nothing: `zoomEnabled: false` in `capacitor.config.ts` disables the pinch recogniser
  natively on iOS and `setBuiltInZoomControls` on Android, and `touch-action: manipulation`
  handles double-tap. The meta is back to `width=device-width, initial-scale=1,
viewport-fit=cover`, zoom is still off on device, and the AXE run is clean. The accessibility
  bar caught this within a minute of it being written, which is the argument for having it.
- **`backgroundColor` is set in `capacitor.config.ts`**, globally and per platform. Unset, the
  native window falls back to `UIColor.systemBackground` — white — which is what shows for a
  frame before first paint.
- **The Google Fonts `<link>`s are gone.** Roboto and Material Icons were being fetched over the
  network by an app whose first design constraint is that it never touches the network. Neither
  was used: the components already asked for the system stack.
- WebView chrome that has no place in a game surface is off — tap highlight, long-press callout,
  text selection, overscroll chaining — with selection turned back **on** for the battle log,
  which is the one screen showing prose a player might want to copy.

### The native change that turned out not to be needed

The standard advice for this class of problem ends with "subclass `CAPBridgeViewController` and
disable the pinch recogniser and `scrollView.bounces` yourself". **Capacitor 8 already does
both.** `CAPBridgeViewController.swift` sets `bounces = false` unconditionally, and installs the
scroll delegate that blocks zooming whenever `zoomEnabled` is false — which is its default since
Capacitor 6. `capacitor.config.ts` now states `zoomEnabled: false` and `contentInset: 'never'`
anyway, because a silent default is not a decision anyone can find later, but no Swift was
written and `ios/` was not touched. Read the pod source before accepting that a WebView problem
needs a native fix — and note that the config option is also what let the viewport meta stay
accessible, so the two are not independent choices.

## 7. Auto-battle, then doubling the ladder — **COMPLETE**

Shipped: the unlockable repeat loop, twelve new stages with twelve new enemies and six new locks,
and the separate balance project the sweeps had outgrown.

Four decisions were taken while building it, and each is written up in the section it belongs to
below:

1. **Twenty-four stages**, not nineteen — the ladder is literally doubled.
2. **The gold slope decelerates** across the second half rather than continuing at ×1.4, because
   the alternative was putting level 1000 inside a fortnight. See "the tuning collision".
3. **Auto-battle unlocks on twelve clears**, exactly where the hand-climbed half ends.
4. **It switches itself off when the app leaves the foreground** rather than pausing.

### What shipped

- `data/enemies.ts` — twelve new stat blocks for the Ashfall Reach, six of them locks:
  Sky-Shrike (the whole back rank as the target), Barbed Ravager (penetration, so armour stops
  working), Wrathborn (gets worse as it dies), Ashen Hierophant (a healer and a shielder in one
  body), Gallows Headsman (executes the lowest-HP ally regardless of rank), Adamant Colossus
  (0.85 tenacity, so debuffs bounce off). Bonefall Tyrant, The Oathbreaker, The Unmade, Ash
  Revenant, Cairn Sentinel and Fen Stormcaller are the bodies and support they stand with.
- `data/skills.ts` — six new enemy skills. Four exist to use vocabulary that had never been used:
  Shrike Dive (`enemy-row-back`), Headsman's Arc (`enemy-lowest`), Tyrant's Claim
  (`enemy-highest`) and Wrath Unbound (the `self-hurt` condition). Flense and Ruinous Arc are the
  ordinary turns the Ravager and the Wrathborn take between them.
- `data/stages.ts` — stages 13–24, plus `AUTO_BATTLE_UNLOCK_CLEARS`.
- `ui/battle.service.ts` — `isAuto`, `isAutoUnlocked`, `autoStoppedAt`, `setAuto()`, the
  `visibilitychange` listener, and persistence at the end of **every** battle.
- `ui/battle-view.*` — the Auto toggle beside the speed controls; `ui/home-view.*` — the notice
  that says which stage ended an auto run.
- `vitest.balance.config.ts` and `data/stages.balance.ts` — the balance project.
- **No save migration.** `isAuto` is session state on purpose: a flag that survived a reload
  would be a loop the player armed yesterday resuming without them, which is the opposite of
  foreground-only.

### 1. Auto-battle — the unlockable repeat

Unlocks at **twelve clears** — the whole of the ladder as it stood before this milestone. The
first half is climbed one tap at a time and the second is what the loop exists to chew on, so the
unlock lands exactly where the new content starts. It reads `clearedStages` rather than `stage`,
because `stage` stops climbing at the top of the ladder and a stage-number check would answer "not
yet" forever for a run that had beaten everything.

Three things about it are load-bearing rather than cosmetic:

- **Foreground-only, enforced by switching off on `visibilitychange`.** This is the half that is
  easy to get wrong. A hidden tab still steps the animator at roughly 1Hz, and `MAX_STEP_MS`
  clamps each step to a second — so playback keeps advancing in real time while nobody is
  watching, and an unattended loop would climb the ladder in the background. A stage clearing
  while the player is away is precisely what would stop every idle rate being constant across an
  offline window, which is the entire reason milestone 5 needs no segmented solver. **A pause that
  keeps fighting is not an improvement, it re-opens milestone 5.**
- **Off rather than paused.** The toggle the player left on is visibly off when they come back, so
  a running loop is always a loop they can see they started. Resuming silently would be a loop
  running because of a decision made in another session.
- **Persist at the end of every battle**, not just auto ones. This was the one requirement
  auto-battle placed on the rest of the app, and it is what makes "losing the app costs the fight
  in flight and nothing else" true rather than aspirational. There is no pause/resume state
  machine and nothing to reconcile on next launch, because everything already finished is banked.

  **Doing that made a latent save race reachable, and the fix belongs with it.** A write is a
  read-then-write across the primary and backup slots, so two in flight together interleave and an
  older state can land on top of a newer one. Nothing had ever written often enough for that to
  matter; one write a second at 4x does, and on a device each write is a bridge round-trip rather
  than a microtask. `SaveService` now keeps at most one write in flight and coalesces whatever
  arrives during it down to the newest state. **Serialising at the storage layer rather than
  making the next fight wait for the previous write** is the deliberate half: gating the loop on
  disk latency would put a slow bridge into the animation's critical path, and the ordering
  problem belongs to the two slots rather than to the battle loop. See [saves](saves.md).

The battle in flight when the app hides is left alone: it finishes, banks and persists, and
nothing follows it.

**A loss ends the run and drops the player back to the idle screen**, as this milestone always
specified. That leaves one gap the spec did not: the board explaining the loss is gone by the time
they can read it, so `autoStoppedAt` carries the stage out and the home screen says which one.

**`@capacitor/app` stayed deferred.** It was named here as the first thing that would genuinely
care about a real iOS lifecycle event versus a web `visibilitychange`, and it turned out not to be
needed — because persisting per battle is exactly what bounds the cost of a missed event to one
fight. The condition for revisiting it is unchanged.

**Ambient sparring on the idle screen is still deferred.** It awards nothing and touches no state,
so it buys no progression and blocks nothing.

### 2. Doubling the ladder, and the tuning collision

Twelve new stages, and the first thing they ran into was a test doing its job.

[`levels.spec.ts`](../src/data/levels.spec.ts) asserts that one character to level 1000 costs more
than a thousand hours of income at the top of the ladder, and it reads the rates off `STAGES`
rather than restating them. Continuing this milestone's own fitted ×1.4-a-stage slope to
twenty-four stages puts gold at ~1,417/s and level 1000 at **75 hours**. The spec failed exactly
as designed.

**The section above predicted that and called it the goal. Milestone 11 retracts it**, and
milestone 11 wins: level 1000 is a chapter-100 target, thousands of stages out, and the cap being
unreachable in chapter 1 is the intent. So the thing that got retuned was **the rate slope** —
neither the level curve nor the threshold:

|                   | gold/s at the top | level 1000  |
| ----------------- | ----------------- | ----------- |
| 12 stages         | 25                | ~4,280h     |
| 24 at ×1.4/stage  | 1,417             | ~75h ❌     |
| **24 as shipped** | **90**            | **~1,190h** |

The slope decelerates smoothly from about ×1.4 a stage to about ×1.1. That is also the
forward-compatible shape: milestone 11 replaces authored rates with a derived curve over ~100
stages a chapter, and ×1.4 compounded over a hundred stages is a number with fourteen zeros in it.

**A second derived threshold fired for the same reason**, and is worth recording because it is the
same lesson twice. [`banners.spec.ts`](../src/data/banners.spec.ts) pins "roughly a ten-pull a day
at the top of the ladder" and measures it against whichever stage is last, so doubling the ladder
at the old crystal slope tripled the rate to 36 pulls a day. Crystals were never the bottleneck,
so the answer was to flatten their curve almost completely across the second half rather than to
widen the band. **Both of these are the "derive, never retype" rule paying for itself** — neither
would have been noticed if the specs had copied their numbers across.

### 3. The new stages are locks, not multipliers — mostly

Six of the twelve new enemies exist to ask a question nothing was asking, and four of those use
targeting or conditions that had been authorable since milestone 4 and never used. That was the
richest seam available, and it is worth checking before inventing a mechanic: the vocabulary is
usually already there.

The other six are bodies and support. **They needed to be new stat blocks rather than the old ones
reused**, and the reason is not a preference: the party arriving at stage 13 is several times the
party that cleared stage 12, so a 300-HP Slime in front of it is not an easy fight, it is an empty
square. Scaling attack and defence together leaves a fight the same _length_ while making it a
fight between bigger numbers, which is what keeps the second half feeling like the first.

**One thing to be honest about: the second half has no single-slot composition proof as sharp as
milestone 4's.** That milestone could show Rin-versus-Gnash on the Marsh Shrine at 85% versus 15%,
and no comparable pair was found here — swapping one character against any of the new locks moves
the win rate by a few points, not by seventy. Rather than ship a threshold that barely passes and
call it a proof, the balance project asserts the two things that _are_ true and measurable: every
enemy is fielded somewhere, and the per-stage difficulty curve rises smoothly. If milestone 8c's
skill counts or 8d's lineup bonuses make a sharper comparison available, this is the gap to close.

### 4. The balance project now exists

The sweep outgrew the fast suite here, exactly as `AGENTS.md` predicted. Three reference parties
across twenty-four stages at forty seeds, plus a bisecting difficulty probe, is thousands of
battles and more than ten seconds. **The sample was not shrunk** — that buys speed by making the
answer less true. `npm run test:balance` runs `src/**/*.balance.ts` against
`vitest.balance.config.ts`, and `data/stages.spec.ts` kept only what is fast and structural.

The reference parties also got a correction worth knowing about. The mid-game party was five
characters at **level 80 with no ascension at all** — and `rare` caps at level 40, so the number
the whole mid-ladder was tuned against described a party that cannot exist. `at()` scales whatever
it is handed; only `levelUp` enforces the cap, and no sweep goes through it. The parties are now
checked against their own rarity's cap on the way in:

| Party    | Composition                                | Clears           |
| -------- | ------------------------------------------ | ---------------- |
| Starters | three at level 1                           | 1–6              |
| Built    | five common-tier at level 80, `elite`      | the first twelve |
| Invested | five common-tier at level 200, `legendary` | all twenty-four  |

Still common tier at the top, and still no pull anyone had to be lucky for: the second half asks
for levels and ascension rungs, which are bought with time and duplicates.

### The original plan, and what survived of it

**The prestige layer is cancelled, not deferred.** This milestone used to read "prestige layer,
then content", and neither half had been checked against what the game actually looks like when
the ladder runs out. The check is below: the second half is right, the first half is answering a
question this game does not have, and the ordering was backwards.

#### What the top of the ladder looked like

Idle income rises on exactly one event — a stage clearing. Once stage 12 falls, all four rates
are frozen permanently at 25 gold/s, 4.7 xp/s, 0.08 essence/s and 0.018 summons/s. The level
curve, meanwhile, runs to 1000. One character from level 1 to the cap, at those frozen rates:

| Currency | Cost | Time at post-ladder income |
| -------- | ---- | -------------------------- |
| gold     | 385M | ~178 days                  |
| xp       | 75M  | ~185 days                  |
| essence  | 6.1M | **~882 days**              |

Per character, and the party is five. Essence binds by roughly 5×, exactly as
[`levels.ts`](../src/data/levels.ts) intends — but it was tuned against a ladder that would keep
growing, and the ladder stopped. Crystals do not take up the slack either: 0.018/s is about 190
pulls a day at 8 crystals each, so collection is not the bottleneck and never becomes one.

**So the post-ladder state is nothing left to clear, income that can never rise again, and a
vertical axis two and a half years out of reach.** The game runs out of _decisions_ long before
it runs out of _numbers_. That is the hole this milestone exists to fill, and it is the thing to
measure any proposal against.

#### Why there is no prestige layer

Prestige trades a reset of one axis for a permanent multiplier on another. Four reasons it does
not fit here, recorded so it does not get re-proposed on genre instinct:

1. **There is nothing to reset.** The only resettable axis is stage progress, and stage progress
   _is_ the income rate — the rate table is the reward. Wiping it takes everything and hands
   back twelve fights the player has already won.
2. **The roster cannot be part of it, and that is settled law.** Ascension consumes only spare
   copies specifically so that nobody can destroy a week's investment by tapping the wrong row
   (see milestone 3). A prestige that eats levelled characters contradicts the most
   player-protective decision in the design.
3. **The job prestige normally does is already done.** Its usual purpose is an uncapped vertical
   axis so numbers keep growing past authored content. That is ascension plus the 1000-level
   curve, and the table above shows two and a half years of it sitting unreachable. The problem
   is not a missing multiplier track; it is income that cannot reach the one already built.
4. **Its other purpose is content recycling** — making twelve stages feel like a hundred and
   twenty. That is the same shape as the tuning philosophy this project rejects everywhere else:
   a structural answer to "we ran out of content" that spends the player's time in place of
   authoring time. There is nothing to sell here, so the honest version is to author the stages.

If the recycling idea ever does come back, the form to consider is **difficulty tiers over
existing stages**, not a run reset — it keeps the reward shape (a cleared stage raises rates
forever) and costs the player nothing they already earned. It is still recycling, and it still
loses to authoring more ladder while there is ladder worth authoring.

#### The plan for auto-battle

**This came first because it is a prerequisite for the content, not a peer of it.** A
twenty-four stage ladder climbed by tapping Fight is worse than a twelve stage one; doubling the
content without it makes the game worse. It is also the cheapest item here, because it is
already fully specified under "Later: the two auto-battles" below, constraints included.

Two of those constraints are load-bearing and are not to be relaxed while building it:

- **Foreground-only.** It never advances a stage while nobody is watching. That is what keeps
  every idle rate constant across every offline window, which is the entire reason milestone 5
  needs no segmented solver. Making it run unattended re-opens milestone 5.
- **Persist at the end of each battle.** Results reach `GameState` at animation end but only
  reach storage on `visibilitychange` or the thirty-second backstop, so a hard suspend can
  currently lose several _completed_ battles at 4x. Fixing that is what makes "losing the app
  costs the fight in flight and nothing else" actually true.

**Ambient sparring on the idle screen is not part of this** and stays deferred. It awards
nothing and touches no state, so it buys no progression and blocks nothing.

This is also the first thing that genuinely cares about the difference between a web
`visibilitychange` and an iOS lifecycle event, so `@capacitor/app` may stop being deferred here.
Persisting per battle is what keeps that from being urgent: a missed lifecycle event then costs
one fight.

#### The plan for the ladder

This is the native mechanism and it closes the gap on its own. The twelve authored stages
multiply income about 50× end to end, roughly ×1.4 a stage. Continuing that slope, against the
essence cost of level 1000:

| Ladder length | Essence rate | One character to level 1000 |
| ------------- | ------------ | --------------------------- |
| 12 (today)    | 0.08/s       | ~882 days                   |
| 19            | ~0.84/s      | ~84 days                    |
| 24            | ~4.5/s       | ~16 days                    |

**Everything prestige was gesturing at is delivered by the system already built.** Gold stops
binding entirely by stage 24 (about three days to cap) and essence stays the wall, which is the
role [`levels.ts`](../src/data/levels.ts) assigns it — the shape of the economy survives the
extension rather than needing a retune.

Note that ×1.4 a stage is **fitted to the existing curve, not derived from a tuning target**.
The table says what the current slope implies; it does not say that 19 or 24 is the right ladder
length. That is a design decision this informs rather than settles.

**Milestone 11 settles it, and moves the goalposts.** The table above treats "level 1000 in a
reasonable time" as the target to tune toward. Under the chapter structure that target is wrong:
1000 is deliberately a chapter-100 goal, roughly 9,500 stages out, and the cap being unreachable
in chapter 1 is the intent rather than the bug. What survives from this section is the diagnosis
— income that freezes permanently with nothing left to clear — not the prescription.

So treat this milestone's stages as **the last of the flat, hand-tuned ladder**: enough content
to exercise auto-battle against something, and the opening stretch of what becomes chapter 1.
Their rates get re-derived in milestone 11 when rates stop being an authored field, and the whole
curve is retuned in milestone 10. **Do not over-invest in tuning them here** — anything past
"auto-battle has a ladder to chew on" is work that gets done twice.

Two things guard the work. [`levels.spec.ts`](../src/data/levels.spec.ts) reads its income rates
off the top of `STAGES` rather than restating them, so **every stage added re-runs the entire
time-to-afford table**; when it fails, the curve and the economy have come apart and the answer
is to retune one of them deliberately, never to move the threshold. And
[`stages.spec.ts`](../src/data/stages.spec.ts) sweeps the ladder at forty seeds, so a stage that
is unclearable by the intended party fails on the way in.

The new stages need locks, not bigger numbers. Milestone 4's six archetypes each name a question
and an answer; the twenty-three character roster has answers nothing currently asks for. Reach
for those before authoring a stat block that is stage 12 with a multiplier on it.

### Gear moves to milestone 12

Gear is a promise with no home. Four places in the codebase state that gold's coefficient is
deliberately the shallowest of the three **because** gear, gear levels and the shop will spend
it later — [`core/currency.ts`](../src/core/currency.ts),
[`core/roster/level.ts`](../src/core/roster/level.ts),
[`data/levels.ts`](../src/data/levels.ts), and an assertion in
[`levels.spec.ts`](../src/data/levels.spec.ts) that keeps it true. So gold is currently the most
comfortable currency in the game for a reason that has not shipped, and the ladder extension
above makes it comfortable to the point of meaninglessness.

That makes gear its own milestone rather than part of this one: it is a second sink and a second
axis of decision, and it is large enough that folding it in here would be the same mistake as
"prestige layer, then content" — two milestones on one line. It sits at **12**, after the
scaling rework and the chapter structure, so its power budget is designed against the curve it
has to live in rather than being tuned twice.

## 8. The combat rework

Four interlocking changes: the stat block, energy and ultimates, how many skills a character
gets, and faction lineup bonuses.

It sits here, before the compounding rework and the chapters, because milestone 10 retunes all
scaling and milestone 11 authors a hundred stages, and doing either against a combat model that is
about to change means doing it again. It is independent of auto-battle at 7, which is
model-agnostic — and auto-battle earns its place first by making the re-sweep cheap.

**It was split twice.** The plan said the four changes could not ship apart, and that was half
right: the _authoring_ cannot be done twice, but the vocabulary can land first and the rest can be
written against it. So 8a took the stat block alone. Then 8b took energy alone, and the remaining
two became 8c and 8d — with the roster growth 8d turns out to depend on becoming 8e.

**The second split was made at the boundary between a mechanic and its content**, and the reason
is worth recording because it is the same reason each time. Energy is a swap with a fixed content
surface: convert twenty-six existing kits and re-sweep. Skill counts are an authoring job of thirty
new skills against a mechanic that is by then settled. Lineup bonuses are a party-composition layer
that sits outside the combatant entirely and needs its own tuning pass. Shipping them together
means a red ladder sweep with three possible causes; shipping them apart means each sweep names its
own culprit — which is exactly what happened in 8b, where the failure turned out to be one enemy.

What made the first split safe is worth keeping too. **MP survived 8a untouched.** Deleting it
before energy existed would have left every healer unmetered, and the MP pool was the thing that
guaranteed a fight against one resolves — see [combat](combat.md). A milestone that removed a
termination argument and replaced it two milestones later is not a smaller milestone, it is a
broken one.

## 8a. The stat block — **COMPLETE**

Seventeen stats became twenty-three, and the two collapses are the whole of it: `patk`/`matk` →
`atk`, `pdef`/`mdef` → `def`. **Damage type moved onto the skill**, where it now selects the
attacker's pierce and the defender's resist rather than which stat is read.

Shipped: the block in [attributes](attributes.md), the formula in [combat](combat.md), every
character and enemy re-authored, three statuses deleted, the row bonus replaced, and the whole
ladder re-swept.

### What the collapse actually cost, and what paid for it

- **The two damage axes survive on `physicalResist` and `magicResist`.** A Golem is still a wall
  against swords and a liability against spells; it says so with a resist rather than with a
  second defence stat. Had that not worked the collapse would have been a genuine loss of design,
  not a simplification.
- **`MAX_RESIST` is a new termination guard, and it is not the penetration cap wearing a hat.**
  `def` diminishes a hit and can never reach zero; **resist multiplies the result and can.** A
  combatant at resist 1 cannot be damaged by that type at all, and a fight against one runs to the
  tick cap every time. Same value as the penetration cap, different argument.
- **Three statuses were deleted rather than duplicated.** `CURSE`, `WARD` and `FOCUS` were the
  magical halves of `SUNDER`, `GUARD` and `RALLY`, and with one `atk` and one `def` they were the
  same status under a second name. `ModifiableStat` is now `atk | def | haste`.
- **`damageType` on a damage-over-time had to be given a new job, or deleted.** Its old one was
  choosing between `patk` and `matk`, which the collapse took away. It now selects the **target's**
  resist, settled into the snapshot as the status lands — so a Golem shrugs off a bleed exactly as
  it shrugs off a sword. Left alone it would have been a live field with no consumer, and a hole
  in the one axis this milestone claims moved onto the resists.
- **Shields and regeneration had to be re-priced, and that was not on the plan.** They scale off
  the applier's `atk` — and the characters authored to cast them are tanks and healers, which
  carry the lowest attack stats in the game. At the old power a Dwarf's barrier absorbed under
  four percent of a health bar. `BARRIER` went 1.1 → 1.5 and `AEGIS` 1.8 → 2.3. **The test that
  caught it had to be rewritten to catch it**: the old assertion compared `matk` against `patk`,
  which is not a question that can be asked any more, and the successor measures restoration
  against a typical health bar instead. That is the `data/` testing rule doing its job — a
  threshold that fails when content outgrows it, retuned deliberately rather than moved.

### The back-row bonus, replaced rather than dropped

"+5% to whichever offensive stat is already higher, and only that one" had nothing left to choose
between. The replacement makes **each rank sharpen the role it already has**:

| Rank  | Gets                                    |
| ----- | --------------------------------------- |
| Front | `def × 1.05`, `critDamageResist + 0.05` |
| Back  | `atk × 1.05`, `critDamageAmp + 0.05`    |

The crit halves are **points, not multipliers.** A crit is `1 + max(amp − resist, 0)`, so a
percentage on a point value would pay nothing at all to the majority of the roster, which sits at
zero on both. That is the failure mode the old rule could not have and this one can, so it has its
own assertion.

Neither rank pays a tax to the other. The cost of the front row is that it is the rank getting
hit, which is a fact about the formation rather than a number in `data/`.

### `haste` and `attackSpeed`, the one mapping with no precedent — validated

The doc's own instruction was to validate this against a sweep rather than treat it as settled, so:
**haste is gauge for everything; attack speed is extra gauge that accrues only when the last
action was a basic attack.** Elves are the only faction authored with it, and the ladder sweep
holds with them carrying 22–30 points of it.

**The first implementation predicted the next action instead, and it was wrong in a way worth
recording** — it read "would the next action be a basic attack" as "is every skill on cooldown",
which is cheap and looks equivalent. It is not: a skill gated on a condition that is not currently
met never goes on cooldown, so it suppresses the bonus _for the whole fight_. Aelrindel's Volley
wants three living enemies, so the largest attack speed in the game would have paid out only on
wide waves — on the character the stat exists to describe.

Keying off the action already taken fixes that and is strictly cheaper: no kit scan, and no
scheduling boundary of its own, because the flag can only move inside an action and an action is a
tick boundary already. The rejected reading needed the simulation to jump to the moment a cooldown
elapsed, purely to stop crediting gauge for ticks nobody spent swinging.

### `recovery` and `healthRegen` both survived

The plan flagged them as near-redundant and worth collapsing. They were kept: `recovery` is the
scaling quantity and `healthRegen` the percentage amplifier on it. Collapsing to one would have
removed the ability to say "this character recovers unusually well **for its size**", which is
what distinguishes a Dwarf from a big Undead health pool. `recovery` is the fourth scaling stat
and had to be — a fixed number measured against a health bar heading for ×10⁹ is a rounding error
by then.

### What the re-sweep says

The milestone-4 promise held through the rework without retuning the ladder: three level-1
starters clear to the healer lock at stage 7, five common-tier characters at level 80 clear the
hand-climbed half, and an invested common-tier party clears all twenty-four with 3.7 survivors and
a 43-second fight at the top. The identity pass — giving the new stats to the factions they
describe — is what closed the two gaps the mechanical conversion left.

### The original plan for the stat block, kept for its reasoning

_What follows is the 8a design note as written before the work. [attributes](attributes.md) is what
actually shipped; where the two differ, the difference is recorded above._

**One `atk` and one `def`. Damage type becomes a property of the skill rather than of the stat**
— a skill declares physical or magic, reads the single attack stat, and is reduced by defence
plus the matching resist. That is the AFK Arena shape and it collapses four stats into two.

Seventeen stats become roughly twenty-two:

| Disposition   | Stats                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Kept as-is    | `hp`, `critChance`, `accuracy`, `dodge`, `lifesteal`, `tenacity`                                                               |
| Kept, renamed | `armorPen`/`magicPen` → physical/magic pierce, `spd` → haste, `effectHit` → insight                                            |
| Collapsed     | `patk`/`matk` → `atk`, `pdef`/`mdef` → `def`                                                                                   |
| Reshaped      | `critMultiplier` → crit damage amplification, opposed by a new crit damage resistance                                          |
| **Deleted**   | `mp`, `mpRegen`                                                                                                                |
| New           | magic resist, physical resist, crit damage resistance, crit block rate, recovery, health regen, received healing, attack speed |

Four things worth knowing before starting:

- **Half of this vocabulary is already built.** Four of the new stats are _opposed pairs_ —
  accuracy vs dodge, insight vs tenacity, crit damage amplification vs resistance, crit rating vs
  crit block. The first two already work exactly that way in `damage.ts`. This is not a foreign
  system bolted on; it is the pattern already there, extended consistently.
- **Recovery has to scale, and nothing else new does.** At the ×10⁹ health milestone 10 is aiming
  for, a non-scaling recovery is a no-op — the same argument that keeps a budget stat fixed, run
  backwards. So the scaling set is health, attack, defence and recovery; everything else new is a
  percentage or a point value, which is where they belong.
- **Haste and attack speed collapse in an ATB system unless separated on purpose.** AFK Arena is
  real-time, so casting frequency and attack animation speed are genuinely different things. Here
  `gauge += spd` per tick makes both just gauge fill. The proposed split: **haste** is gauge fill
  for everything, clamped exactly as `spd` is today because the termination argument has not
  changed; **attack speed** is extra gauge that accrues only while the actor's next action would
  be a basic attack, so a high-attack-speed character machine-guns basics between skill windows.
  **Validate this against a sweep rather than treating it as settled** — it is the one mapping
  here with no precedent in the codebase.
- **Collapsing `patk`/`matk` deletes milestone 4's back-row bonus.** "+5% to whichever offensive
  stat is already higher, and only that one" has no meaning with a single attack stat, and the
  reasoning behind it — that a caster gets the bonus where its damage actually comes from — goes
  with it. It needs replacing, not dropping: the front/back asymmetry is what makes the front rank
  a real cost. Deciding what replaces it is part of this milestone, not an afterthought.

## 8b. Energy and ultimates — **COMPLETE**

`mp` and `mpRegen` are gone, and so are HP costs. Every character now declares exactly one
**ultimate**, metered by a 0–100 energy bar and nothing else; every other skill costs nothing but
its cooldown. Milestone 4's "three ways to meter a skill" is two.

Shipped: [`core/battle/energy.ts`](../src/core/battle/energy.ts), `energyRegen` on every character,
the gains in [`data/combat.ts`](../src/data/combat.ts), all twenty-six character kits and every
enemy kit re-metered, the energy bar in the battle view, and the ladder re-swept.

### The bar opens empty, and that inverted the pacing rather than deleting it

The plan said MP's job was "front-load and then run dry", and worried that energy "never runs dry,
so fights converge on ultimates-on-cooldown". Half of that was right and the interesting half was
not. **MP started full; energy starts at zero.** So a caster no longer opens strong and fades — it
opens with basic attacks and cheap cooldowns, and its marquee turn arrives once both sides have
committed. The difference between a short fight and a long one survived; it changed sign.

That is a better shape than the one it replaced, and it is worth stating because the plan expected
a loss. A kit's ultimate is now its answer to a fight going long. A support that is not needed
charges slowly — a healer holding at 13 regen with nothing to heal takes about eight turns, against
three under pressure — so an ultimate arrives because the fight went badly rather than on a
metronome. MP could not express that at all.

### ⚠️ What actually broke was the termination argument, exactly where the plan said

The plan recorded that the healer guarantee transfers onto `MAX_BATTLE_TICKS`. It does, and the
thing now standing where the MP pool used to is a single assertion: **the ladder sweep requires that
no reference party ever runs the clock out, winning or losing.** That assertion is no longer a
nice-to-have and should not be relaxed.

_Two things about it changed after 8c, and the shape did not._ The assertion was written against a
`stalemate` outcome that no longer exists — a timeout is now a defeat — so it reads
`BattleResult.timedOut` instead. And `MAX_BATTLE_TICKS` went from 18,000 to 900. Both are recorded
under [the battle timer](#the-battle-timer-and-the-guard-that-was-not-guarding) below.

It bit immediately. The **Ashen Hierophant** at stage 24 turned out to be the one enemy in the game
whose pool genuinely metered it — a healer _and_ a shielder spending 28 a cycle against 6 a turn —
and losing that pool handed it an unmetered heal every second turn. Stage 24 went to a 102-second
attrition war the invested reference party won 43% of the time.

**Two things about that failure are worth keeping.** First, the fix had to be enemy design, which
is what the plan predicted the answer would have to be. Second, the obvious fix was the wrong one:
raising `MEND`'s cooldown turns the sweep green at 32, but `MEND` is shared with the stage-7
Acolyte, whose pool was exactly break-even and therefore never metered it at all. That would have
weakened the ladder's most important early lock to solve a problem at its last. The Hierophant got
its own heal instead, and the two locks now tune independently — which they always should have.

### `onHit` is double `onHurt`, and the ladder is what decided that

The first pass paid ten for each source and the sweep failed at stage 24 with a 43% win rate. The
cause was not the enemy: **`onHurt` is paid per incoming hit while `onHit` is paid once per action**,
so a front-liner absorbing three attacks a turn banked thirty while the damage dealer behind it
banked ten. That put the slowest meter in the game on the rank where damage is fielded.

Both halves of that asymmetry are load-bearing, so neither could simply go. Per-hit `onHurt` is the
Undead's entire meter and is what makes a wide enemy wave charge a whole party at once; once-per-
action `onHit` is what stops a row nuke from charging its own next cast five times over. Doubling
`onHit` to 20 restores the symmetry without giving up either. The reference party's ultimates land
every 2.5–3.9 turns after it, against cooldowns of 35–55 ticks before — which was the target.

### What the re-sweep says

The milestone-4 promise held. Three level-1 starters clear to the healer lock at stage 7, five
common-tier characters at level 80 clear the hand-climbed half, and an invested common-tier party
clears all twenty-four. Nothing decided by the clock anywhere, and no fight over sixty seconds.

### The Undead kept their bargain by inverting it

HP costs went with MP, so Sable and Nekros no longer buy their best turns with their own life. The
faction identity survived because the **drain** vocabulary was already there: every Undead kit is
now built on it, and their meter is the one thing their stat block guarantees — `onHurt` is the
largest energy source in the game and the Undead are the faction with no armour. They are handed
tempo for having been hit, and take the life back out of whatever hit them.

### Enemies have no ultimates, and that asymmetry is deliberate

Energy is a **character** system: a bar the player watches, and what 8c hangs its skill ceiling on.
An enemy has no roster screen, does not ascend, and is read as a rhythm — so its pacing is authored
directly in cooldowns, where an encounter designer sets it exactly.

It is also what keeps skills shareable. `ultimate` is a property of the skill, and several enemies
field the same one; marking `TYRANTS_CLAIM` and `CINDER_STORM` would have made the Unmade a
combatant with two ultimates sharing one bar, where the lower-priority of them could never fire.

**Deleting the enemy MP pools cost almost nothing**, which is the useful thing to know before
retuning any of it: in every case but the Hierophant's the pool regenerated more between casts than
the cast cost, so the cooldown was already the binding meter and the pool was decoration.

### What 8c starts from

- The stat vocabulary and the metering are both settled, so kits can be authored once.
- Every character has exactly one ultimate, asserted in
  [`characters.spec.ts`](../src/data/characters.spec.ts) — which is the predicate 8c's skill gating
  needs, since the ultimate is the one skill a ceiling must never gate.
- The ladder is tuned against the new meter, so a skill-count change is measured against a baseline
  that is already true.

## 8c. How many skills a character gets — **COMPLETE**

**Both axes.** Tier sets the ceiling and ascension rungs unlock up to it:

| Tier      | Ceiling          |
| --------- | ---------------- |
| common    | 2 — ultimate + 1 |
| legendary | 3 — ultimate + 2 |
| ascended  | 4 — ultimate + 3 |

**The rung mapping is absolute rarity, and it is a deliberate head start**: the ultimate from the
start, the second skill at `elite`, the third at `legendary`, the fourth at `ascended`. Because an
ascended-tier character starts at `elite` rather than `rare`, it arrives with its second skill
already unlocked while a common-tier one climbs two rungs for the same thing.

That was chosen with the alternative on the table. Counting rungs from each character's own start
would have given tier a higher ceiling and no free unlock, preserving milestone 3's "tier is a
slope, not a head start" exactly. Absolute rarity was picked instead, so the promise is being
modified twice over — a capability gate _and_ a head start on reaching it — and that has to be
deliberate rather than discovered.

**What keeps it fair is the tuning target that already exists.** Five common-tier characters at
level 80 clear the hand-climbed half, asserted in [`stages.spec.ts`](../src/data/stages.spec.ts)
and swept in [`stages.balance.ts`](../src/data/stages.balance.ts). Hold that with two skills each
and the promise survives in substance — the top of the ladder still cannot demand a pull nobody can
buy. Let it fail and quietly retune it, and the game has become tier-gated without anyone deciding
to.

Shipped: the rule in [`core/roster/kit.ts`](../src/core/roster/kit.ts), the table in
[`data/kits.ts`](../src/data/kits.ts), thirty new skills, every kit re-authored at its ceiling, the
gate applied on the same seam that scales stats, and the sheet showing what is still locked.

### The authoring job, which was most of this milestone

Thirty-seven skills existed across the roster; the ceilings asked for sixty-seven. That was thirty
new ones:

| Tier      | Characters | Had | Ceiling asks | Authored |
| --------- | ---------- | --- | ------------ | -------- |
| common    | 9          | 11  | 18           | 7        |
| legendary | 7          | 12  | 21           | 9        |
| ascended  | 7          | 14  | 28           | 14       |

**The counts in the plan were wrong and the total was right**, which is worth recording because it
is the failure mode a hand-maintained tally always has: the plan said twenty-six skills existed and
the ceilings asked for fifty-six, and both numbers had gone stale — but their difference was still
thirty, so the headline survived while everything supporting it rotted. The table above is the
measured version. Nothing derives from it; `characters.spec.ts` asserts each kit against
`skillCeiling` directly, so the next time content moves it is the spec that fails rather than this
paragraph that quietly stops being true.

Two things settled in 8b that this authoring did not relitigate. **An ultimate carries no cooldown**
— the bar is the cooldown, and `toSkill` discards one authored on it. And **a condition on an
ultimate means "wait", never "never"**: a healer holding its bar until an ally is hurt is the system
working, but an ultimate gated on three living enemies is a bar the player watches fill and never
spend on a boss stage. `characters.spec.ts` asserts both.

### Three conventions the kits now keep, and one of them is load-bearing

- **Every kit is authored at exactly its tier's ceiling.** Never fewer, or a character is short of
  what its tier promises; never more, or content ships that no amount of ascending could reach.
- **The ultimate is written first, then the ordinary skills in unlock order.** The list order _is_
  the progression, so reading a kit top to bottom reads what the player gets and when. This is a
  readability convention rather than a mechanism — `unlockedSkills` finds the ultimate by its flag,
  and combat still sorts by `priority` — which is deliberate: a kit authored out of convention
  degrades to a confusing sheet rather than to a broken fight.
- **The ultimate is never gated, unconditionally.** Not "unlocked at the tier's starting rung",
  which is the same thing until a damaged save holds an ascended-tier character below `elite` and
  hands the simulation a combatant whose energy bar fills and can never be spent.

### The re-sweep found nothing to retune, and the reason is worth knowing

The milestone-4 promise held without touching the ladder: five common-tier characters at level 80
clear the hand-climbed half **with two skills each**, and the invested party still clears all
twenty-four. What moved was smaller than expected — the top of the ladder went from 98% to 100% for
the invested party, and nothing else changed a win rate at all.

**That is because the reference five are the conservative half of the authoring job, by
construction.** Bran, Gnash, Rin, Celia and Pyra are what the ladder is tuned against, so their
second skills were authored knowing the sweep would measure them: a weaker Hammer Check, a plain
Maul, a slow rather than a second arrow, half a Choirlight, a smaller Emberburst. A new skill on a
50-tick cooldown replaces a basic attack roughly one turn in five, so a 1.5× where a 1.0× used to be
is worth single-digit percent — which is the size a milestone that must not move an already-tuned
ladder should be aiming for.

**Where the gate is visible is the top half of the roster**, and that is the progression it was
built to sell. An ascended-tier party held at one level, with the rung as the only variable, clears
to stage 14 at `elite` with two skills, to stage 18 at `legendary` with three, and the whole ladder
at `ascended` with four — and the rungs that unlock nothing (`elite+`, `mythic`) move it far less
than the two that do.

### A pre-existing stalemate gap this milestone measured but did not open — **CLOSED**

⚠️ **A solo sustain character against a stage it cannot kill ran to the tick cap** — thirty minutes
of battle time for nothing. Fielding one character is legal, and a wall with 29 `atk` behind a
regeneration is exactly the shape the zero-stalemates guard exists to catch.

It **predated 8c**: the same scan against the 8b kits finds 238 stalled battles across the roster
and ladder, with Thraun alone accounting for 110 of them. The new skills made it worse rather than
possible — 308 after, and the growth was concentrated in the sustain kits this milestone added
(Celia 27 → 50, Seraphine 20 → 34, Korrin 30 → 43).

**The shipped guard passed throughout**, because it sweeps three reference parties of five and none
of them stalls anywhere. That was the gap: the assertion that replaced the MP termination argument
in 8b covered the parties a tuned ladder is measured against, not every party a player can legally
field. It was fixed immediately after 8c, and the fix is below.

### The battle timer, and the guard that was not guarding

**A fight is ninety seconds. Run the clock out and you lose.** `MAX_BATTLE_TICKS` went from 18,000
to 900, the `stalemate` outcome was deleted, and `BattleResult.timedOut` took over the job of saying
which kind of defeat it was.

**Three candidate fixes were written down first and all three died on measurement**, which is worth
recording because each looked reasonable:

- **A damage floor** — a minimum fraction off any hit, so no fight can be raced indefinitely. It
  does not work, and the reason generalises: damage is `atk² / (atk + def)` and is already never
  zero. The deadlocks were never "damage rounds away", they were **sustain out-pacing damage**. A
  floor big enough to beat the best heal in the game is a global damage buff wearing a guard's
  clothes.
- **A minimum formation size** — declare one-character parties unsupported. Dead on the numbers:
  Thraun + Celia is two characters and stalls 4/4 against stages 18 and 19. Party size correlates
  with the failure and does not define it; **total party damage** does.
- **A stall detector** — end the fight when neither side has reached a new low for N ticks. This
  was the most promising and still failed. Sized so it never cuts a legitimate fight short it needs
  a window of ~4,000 ticks, which left the mean stalled fight at fourteen minutes; and some stalls
  never trigger it at all, because a party being ground down slowly _is_ making progress — just not
  progress anyone wants to watch.

**What the measurement actually showed is that the cap was never bounding anything.** The longest
fight any reference party has is **48.5 seconds**, against a cap of thirty minutes — a 37× budget on
a number nothing approached. Two things had drifted apart: _the fight is decided_ and _the fight has
finished_. A party that cannot out-damage a healer has lost inside the first minute, and the clock
was the only participant that had not noticed.

So the fix is a timer rather than machinery, and **it is a rule of the game rather than a guard
bolted on beside one** — the genre convention, and what the ladder was already being tuned to
without anyone writing it down.

**It cost nothing in tuned content and everything in pathological content**, which is the right
direction:

|                                     | Before      | After                      |
| ----------------------------------- | ----------- | -------------------------- |
| Longest reference-party fight       | 48.5s       | 48.5s — unchanged          |
| Reference wins flipped to defeats   | —           | **0**, at 40 seeds a stage |
| Longest fight, any legal party      | 30 min      | **90s**                    |
| Solo / sustain-pair fights over 90s | 59 of 3,552 | **0**                      |

**The guard was widened at the same time, and its shape changed.** `stages.balance.ts` grew a
`parties nobody tuned for` block covering solo and two-character sustain parties — the
configurations the three reference parties never described. What it asserts is deliberately not a
balance claim: **those parties are allowed to lose, and not allowed to lose slowly.** It also
asserts a lone character can still clear _something_, so the timer never becomes a minimum party
size by the back door.

⚠️ **The assertion reads `timedOut`, never the outcome.** A timeout and a wipe are the same `defeat`
on screen now, so the obvious rewrite in terms of `outcome` would pass forever while testing
nothing. That is the one way to break this guard without noticing.

**The margin is now 1.9× rather than 37×, and that is the real cost.** Ninety seconds is a budget
every encounter has to fit inside, which milestone 10's rescale and milestone 11's hundred stages
both have to respect. A stage tuned to take longer than the timer against the party it is meant for
is unclearable, so the sweep asserts the margin directly — it should go red naming a stage before
any win-rate assertion does.

## 8d. Faction lineup bonuses — **NEXT**

The AFK Arena ladder, applied to the party's own composition:

| Composition             | Bonus                    |
| ----------------------- | ------------------------ |
| 3 of a faction          | +10% attack, +10% health |
| 3 of one + 2 of another | +15% attack, +15% health |
| 4 of a faction          | +15% attack, +20% health |
| 5 of a faction          | +25% attack, +25% health |

**Monsters** give all allies +2% attack and +2% health each. **Angels** count as any faction for
the purpose of the ladder above. **Demons** have their own ladder, stacking with everything else:
1 → +30% defence, 2 → +25% energy recovery when injured, 3 → +15% crit rating, 4 → +30% crit
damage, 5 → +15 haste. The last of those has to respect the haste clamp, for the same termination
reason the authored value does — and the second now has a stat to multiply, since `energyRegen`
shipped in 8b.

**This is the pattern AGENTS.md names and rejects** — "+10% if two Fire units… those just create a
new optimal team". The rule is being overridden knowingly, and the reason it survives in substance
is worth writing down rather than leaving as a contradiction:

**A mono-faction bonus does not create one optimal team, it creates seven — and the encounter's
faction matchup decides which one to bring.** That is still a statement about the fight in front
of you, which was the whole distinction the rule was drawing. Note what it is _not_: the player is
not choosing between the lineup bonus and the matchup. They keep the +25% and switch which
mono-faction team fields it. The two are complementary, not competing.

That only works under two conditions, and both are real work:

- **The matchup edges have to come up.** They are 1.05–1.10 today, sized on the assumption that
  nothing bigger sat alongside them. Against a +25% lineup bonus they are decorative. The
  constraint to tune against is that the swing between the right faction and the wrong one must
  exceed the quality gap between a player's best and second-best faction team — otherwise nobody
  ever switches. That is a sweep question, not a number to pick at a desk; the 40-seed ladder
  sweep already exists to answer it.
- **The roster has to grow**, and that is now 8e rather than a hidden half of this milestone. The
  mechanic ships against the current twenty-three; the premise it is sold on does not become true
  until the roster does.

**One bad-luck failure mode to design against, and it is why 8e exists.** Angels counting as any
faction makes them enormously valuable, and celestials ascend on copies of themselves alone — no
fodder, no substitute. Worse, with three characters in most factions and four Humans, an Angel
wildcard is today the _only_ route to a mono-five at all: three Humans plus two Angels reads as five
Humans. So the wildcard is not a luxury, it is the path — which is precisely the shape milestone 4
added Wren and Dorn to fix. Not a fight lost, but a category of answer that cannot be bought.

## 8e. Five characters per faction

Twenty-three characters across seven factions is roughly three each: four Humans, four Dwarves, and
three of everything else. **A mono-faction five is unreachable in every faction without an Angel**,
which makes 8d's premise — field a different mono-faction team per encounter — false the day it
ships.

Roughly twelve new characters, each with a full kit at its tier's 8c ceiling. Deliberately its own
milestone rather than a half of 8d: it is a content-authoring job of a size that would hide inside a
mechanics milestone and swallow it, and the mechanics are testable without it.

**This is the same roster pressure faction towers create in milestone 15**, which is a point in
favour of both. Doing it here means 15 arrives with its prerequisite already met rather than
carrying it.

## 9. Resonance — levels the roster shares

**Invest in five characters; every other character you own is carried to the same level.** No
resource gates it and no slots limit it — unlike the system it is modelled on, where emblems and
slots meter how much of the roster benefits. Owning a character is the only requirement.

### The rule

Sort the roster by level, take the top `PARTY_SIZE`, and the **lowest of those five** is the
resonance floor. Every character is treated as being at least that level.

```
effectiveLevel = min(levelCapFor(rarity), max(investedLevel, resonanceFloor))
```

Three properties fall out of that formula, and they are the whole design:

- **It cannot be gamed by hyper-levelling one character.** The floor is the _fifth_-highest level,
  so it only rises once all five have been invested in. Pouring everything into a single favourite
  moves nothing.
- **Ties need no tiebreak.** The floor is a level, not a character, so equal levels produce the
  same answer whatever order they sort in. The derivation is deterministic without anyone having
  to decide what beats what.
- **The rarity cap still binds, and that is what keeps ascension alive.** A `rare` character caps
  at level 40; a floor of 200 lifts it to 40 and no further. So resonance makes _levels_ free and
  leaves _ascension_ entirely individual — the bench still has something to spend on, and raising a
  cap is the only way to collect more of the floor. Without this clause the feature would make
  ascension pointless for everyone outside the top five.

**The rule needs no edge case for a small roster, and it is worth understanding why rather than
adding one.** With fewer than `PARTY_SIZE` characters owned the floor is the lowest invested level
in the roster — so every character is already at or above it and nobody can benefit. The feature
is self-neutralising: it does nothing until the roster exceeds five, at which point it starts
working on its own. A special case here would be code that cannot change an outcome.

### This is not only quality of life

Milestone 8d introduces mono-faction lineup bonuses worth up to +25% attack and health, which are
only reachable by fielding a _different_ five-character team per encounter — and 8e authors the
roster that makes that possible. Milestone 15 does the same thing harder, with seven faction towers
demanding thirty-five invested characters.

**Neither is affordable without this.** Levelling thirty-five characters individually is seven
times the cost of levelling five, against an economy tuned for one team. So resonance is closer to
a prerequisite for milestone 8d's faction bonuses than a convenience that follows them — it is
positioned after the rework only because the rework decides what a level is worth.

What it deliberately does not cover: ascension, and milestone 16's per-character investment track.
Those stay individual, which is what stops the roster becoming a single undifferentiated blob with
one number attached.

### Derived, never stored

`OwnedCharacter.level` stays exactly what it is today — the **invested** level, the one the player
paid for. The floor is computed from the roster on read and written nowhere.

**No save migration, and that is not a coincidence.** Baking a resonated level into the save would
be irreversible and wrong the moment the top five changes: a character recorded at 200 because the
floor was 200 has no way back to its real invested level once the floor drops. Storing what was
paid for and deriving the rest is the only version that survives a reshuffle.

### The floor never falls, and that is a provable invariant

**No character ever loses a level to resonance.** This is worth stating as an invariant and
testing as one, because the obvious worry — bench levels dropping when the top five change — turns
out to be impossible rather than merely unlikely. Three facts give it:

1. **Invested levels only rise.** There is no de-level mechanic and no plan for one.
2. **Characters are never removed from the roster.** Milestone 3 settled this for a different
   reason: ascension consumes only spare copies, never a character that has been levelled. There
   is no path that deletes a roster entry.
3. **Adding a character can only raise or hold the `PARTY_SIZE`-th highest value.** A new level-1
   entry sorts below the floor and cannot move it; a high-level one pushes the fifth-highest
   upward.

So `floor` is monotonically non-decreasing, and since `effectiveLevel` is a `max` against it, no
displayed level can fall. **The roster screen therefore needs one number, not two** — showing
"levelled to" and "carried to" separately would be defending against a state that cannot occur.

**The one exception is a damaged save.** Load-time repair drops unknown character ids, so a
character removed from `data/` disappears from the roster — and if it was among the top five, the
floor falls with it. That is rare, bounded, and strictly better than the alternative of refusing
to load; it is recorded here so that a floor that moved backwards is recognised as a repair having
run rather than a bug in this feature.

### Levelling the five without visiting five screens

A button that levels the whole top five together, because the alternative is five screens for one
step of the floor.

Worth knowing when building it: **only the lowest of the five moves the floor.** Levelling a
character already above it buys that character's own power — they are in the party, so this is
real — but buys nothing for the roster until the laggard catches up. Levelling all five together
sidesteps the distinction entirely by keeping them equal, which makes the steady state "the top
five share a level, and that level is the floor". That is the mental model worth protecting, and
the button is what protects it.

Two details that decide whether it feels good:

- **Make it atomic.** `maxAffordableLevel` already exists, so a partial application is easy to
  write and is the wrong behaviour: levelling three of five because the fourth is unaffordable
  drifts them apart and quietly breaks the model above. Level all five or none.
- **Breakthrough levels are lumpy.** Essence is charged only every tenth level, so the cost of one
  step is uneven and occasionally five times its neighbours. The button should price the whole
  operation before committing to it, rather than discovering the shortfall partway through.

## 10. Power that compounds

**Both sides of the fight scale, or neither does.** This milestone makes levelling and ascension
dramatically more powerful, and gives enemies their own levels so the ladder survives it. Those
are one job, not two: raising the player's curve without raising the enemy's does not create a
power fantasy, it deletes the content. Splitting them across two milestones would leave the game
unplayable in between, which is the one thing the ordering exists to prevent.

### What "more dramatic" has to mean numerically

Today the game grows at `1.0075` per level at common tier and `1.12` per ascension rung. Across
the full level range that is three orders of magnitude — a gentle slope, not an incremental
game. The shape to aim for:

| Per level      | Multiplier at level 1000 |
| -------------- | ------------------------ |
| 1.0075 (today) | ×1.7e3                   |
| 1.014          | ×1.1e6                   |
| 1.021          | ×1.0e9                   |
| 1.028          | ×9.6e11                  |

**This costs nothing architecturally, and that is not luck.** `core/numeric.ts` already wraps
`break_infinity`, so quantities past float64's 9e15 are already the working type everywhere.
AGENTS.md hedged that dependency — "add `break_infinity.js` only if the curve actually demands
it". The curve now demands it, and the hedge can be retired.

### The stomp requirement is testable, so test it

"Go idle for a long time, come back, level up, and stomp stages until the next wall" is a
property, not a feeling: **an idle window of length T must buy levels that convert into a run of
at least N cleared stages.** Write that as a spec over the ladder and tune against it. Tuning
compounding curves by feel is how an incremental game ends up either trivial or a wall, and the
5th-percentile player is the one who finds out first.

### Ascension has to move more than levelling does

`perAscension` is `1.12`, worth ×4.36 across the full rung ladder. If levelling delivers ×10⁹
and ascension delivers ×4, **the gacha stops mattering** — duplicates are the primary
progression path by design, and a progression path worth ×4 against a levelling path worth a
billion is decoration. For scale: ×1.35 a rung is ×49 across the ladder, ×1.6 is ×450, ×2.0 is
×8,192. Pick the ascension multiplier against the levelling one deliberately, in that order.

### Enemies become instances rather than stat blocks

An enemy becomes a definition plus a level, tier and rarity — the machinery `core/roster/`
already runs for characters, pointed at the other side of the board. Two consequences, and the
second is why hand-authored chapters are viable at all:

1. **Locks stay locks.** A Marsh Acolyte with a fixed stat block is a puzzle the player solves
   once and never again; at ×10⁹ it is a rounding error. Milestone 4's whole thesis — that
   composition matters because enemies ask questions — holds late-game **only** if the enemy
   asking scales alongside the party answering. That is the real reason the vision says
   composition matters more late than early, and it is a consequence of this change rather than
   an assertion about it.
2. **Authoring collapses.** A stage stops being a set of authored stat blocks and becomes a short
   line naming archetypes and a level. See milestone 11.

### What survives the rescale and what quietly does not

- **Multiplicative edges survive at any magnitude.** The faction matrix's 5–10% is 5–10% whether
  the numbers are 10² or 10¹². Milestone 4's matchup design needs no rework, which is a point in
  favour of how it was built.
- **Anything additive or threshold-shaped does not.** A flat bonus, or any authored constant
  compared against a scaling quantity, silently becomes a no-op. Audit for these rather than
  waiting to notice.
- **The non-scaling stats stay non-scaling.** `haste`, the probabilities, penetration, resist and
  `mp` are
  bounded for termination and metering reasons a bigger power curve does not touch — see
  milestone 4. A compounding game makes it **more** important that `haste` cannot grow, not less.
- **The tier fall-off is the thing to preserve on purpose.** Common tier is meant to be a genuine
  early answer that becomes a joke at cap. Steepening every tier by the same factor preserves
  that ratio; steepening them unevenly is a retune of milestone 3's central promise and should be
  a decision somebody made, not a side effect of picking three numbers.

**No save migration.** Growth lives in `data/` and levels are stored rather than power, so every
existing save re-derives its stats on load.

**One thing this milestone does not answer:** what the growth axis is once a character actually
reaches 1000. The cap is deliberately ~100 chapters out, so it is not urgent — but it is the same
hole milestone 7 diagnosed, moved further down the ladder rather than filled. **Milestone 16 is
the intended answer**; it is that far out because nothing before it is close enough to the cap to
care.

## 11. Chapters

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
has nineteen mini-bosses. The level cap is sized against this: reaching level 1000 around chapter
100 is roughly **9.5 stages per level**, which is the anchor to tune income and cost against.

### Idle income becomes a function, and that is what makes the scale survivable

`rates` is authored per stage today. Nine and a half thousand authored rate tables is not
something anyone maintains, so income becomes a function of chapter and stage index. **Every
clear still raises all four rates** — that contract is the whole idle loop and it is not up for
negotiation at 50 stages a chapter any more than it was at 12.

Two things fall out of it, and both are improvements:

- **`reconcileClearedStages` gets simpler, not harder.** Rates become a function of the
  high-water mark, so the load-time repair evaluates a function instead of re-summing an authored
  table — and the rule it exists to enforce (crediting progress and paying for it are the same
  operation, see milestone 3) gets easier to hold, not harder.
- **`clearedStages` stops being a per-stage record.** Progression is linear, so a high-water mark
  carries the same information at a fraction of the save footprint. Thousands of individual
  entries in a save that has to survive repair is a cost with nothing bought by it.

#### Summon crystals must come off the exponential curve

**A rate should compound only if what it buys compounds.** Gold, xp and essence buy levels, and
level costs compound, so those three belong on the exponential. Summon crystals buy a pull at a
flat 8 crystals, feeding an ascension at a flat 8 elite plus 180 rare copies. A compounding rate
against a flat price outruns it exponentially, and the current curve does exactly that — summons
climb ×1.25 a stage against gold's ×1.43, which looks conservative and is not:

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
what makes that viable: a stage is a short line naming archetypes and a level, not a set of
hand-written stat blocks. Fifty such lines is an afternoon, and it buys deliberate pacing that a
difficulty curve cannot.

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

### Ship two chapters

Chapters 1 and 2, 50 stages each. The existing twelve become chapter 1's opening.

**Both sit in the first band, so shipping them proves the chapter _flow_ but not the size
formula** — the boundary, the boss, whatever unlocks on clearing a chapter, and income
continuity across the seam all get exercised; the step to 60 stages does not arrive until chapter 11. Build the formula anyway and test it directly rather than inferring it from two chapters that
happen to be the same length.

Save v5: `stage` becomes a chapter and a stage within it. Existing saves map to chapter 1 — and
per milestone 3's rule, the migration credits nothing it cannot pay for, leaving the load-time
repair to settle rates from the high-water mark.

## 12. Gear

The second progression axis, and the third leg of the power fantasy alongside levels and
ascension. Milestone 7 records why it is owed: four places in the codebase state that gold's
coefficient is the shallowest of the three **because** gear will spend it later, and the ladder
extension makes gold comfortable to the point of meaninglessness.

It lands here, last, because its power budget only means something against the curve from
milestone 10 and the content shape from milestone 11. Built earlier, it gets tuned twice — and the
second tuning would be against numbers nine orders of magnitude away from the first.

## 13. Settings, and the save-safety gap

A small milestone that clears a backlog. Three things have been waiting on a settings screen —
the run reset, combat speed defaults, and somewhere to put whatever accumulates next.

**The run reset is the one with a trap in it.** `SaveService.clear()` exists, is documented, and
has never been executed by anything including tests, so making it reachable means covering it.
And per "Deliberately deferred" below: the running game holds authoritative state in memory and
persists on autosave and `visibilitychange`, so clearing storage from inside the app is undone by
the app on the way out. A reset has to stop the loop and replace the in-memory state, not merely
empty the slots.

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

**Verify the backup path on real hardware as part of this milestone.** It costs one restore, and
it is the only way to know the table above survives contact with a device — the same argument
milestone 6 made for running on a phone early, which found a bug nothing else would have.

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
slots against twenty-three characters, fed by a gacha generous enough to produce roughly 190
pulls a day at post-ladder crystal rates. Every decision in milestones 3 and 4 — sidegrades with
distinct niches, seven factions, two players clearing the same stage with different teams — is
funded by a game that only ever asks for five characters. **The generosity is producing material
with nowhere to go.**

Seven towers, one per faction, five slots each, restricted to that faction. That is demand for
**thirty-five invested characters against a roster of twenty-three**, so an unlucky pull becomes
the answer to a tower instead of fodder, duplicates gain a second use, and a wall in chapter 3
has somewhere to send the player.

Two consequences to design for rather than discover:

- **A tower is a wall about who you own, in a game with no way to buy characters.** That is the
  failure mode role-locked formation slots were rejected for in milestone 4: an unlucky roster
  reaching a state where no legal party exists. Towers must therefore be skippable, never on the
  critical path, and never the only source of anything.
- **The roster is smaller than the demand, and that is a decision to make on purpose.**
  Twenty-three characters across seven factions is roughly three per faction against five slots,
  so no tower is fully crewed the day it ships. That is a content driver, but it means this
  milestone either arrives with more characters or arrives with towers that visibly cannot be
  finished. Pick one; do not let it happen by accident.

### Resonance is a hard prerequisite, and it already shipped

**Nobody levels thirty-five characters from scratch.** Towers are only affordable because
milestone 9 already carries the whole roster to the fifth-highest level — without it this
milestone is seven times the levelling cost of one team, against an economy tuned for one team.

What towers still cost is **ascension**, which resonance deliberately does not cover: the rarity
cap is what limits how much of the floor a bench character can collect. So crewing a tower is a
real investment decision, just not a levelling grind. That is the intended shape — if towers ever
feel free, the cap clause in milestone 9 is the thing that has stopped working.

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
- **`@angular/cdk`.** Uninstalled alongside Material, then **deliberately reinstalled** while
  milestone 6 was still open. Nothing imports it yet, which is the one thing about this entry
  worth being honest about: it is a dependency on hand for a use case that has not arrived.
  That was a considered call rather than a drift, so the reasoning is recorded here instead of
  being re-argued later.

  The case for it is that CDK is not a UI framework, it is an accessibility primitives library,
  and this project's bar is a clean AXE run against WCAG AA. The first modal — pull results, a
  roster detail sheet — needs a focus trap, focus restoration on close, the background made
  `inert`, scroll blocking and Escape handling. That is a list of things that are individually
  easy to write and collectively easy to get subtly wrong, and getting them wrong is an
  accessibility bug rather than a cosmetic one. `cdkTrapFocus` and `Overlay` are the answer, and
  "no UI framework" was never meant to forbid them.

  The case against installing it _early_ is the one this milestone just lived through: an
  unused dependency is how Material got in, and CDK versions in lockstep with Angular, so
  waiting would have cost nothing but an `npm i`. **Its presence is not a precedent.** Do not
  read it as a licence to install anything else against a future need.

  One thing to read before wiring it up: CDK ships prebuilt global stylesheets, and
  `overlay-prebuilt.css` declares `.cdk-overlay-container { position: fixed; height: 100%;
width: 100% }`. That is correct here only because the shell now guarantees the document fills
  the viewport — under the old layout it would have had the same mismatch as the tab bar. Add
  those stylesheets when the first overlay lands, not before, and read them rather than pasting
  them.

- **Resetting a run.** `SaveService.clear()` exists and is documented for a deliberate "start
  over", and nothing calls it. That is intentional: wiping a run is destructive and
  irreversible, and it belongs **behind a settings menu**, not on the home screen where a
  mis-tap can reach it. **The settings screen is milestone 13**, so this lands there — and note
  the method has never been executed by anything, including tests, so making it reachable means
  covering it.
  Until then, `README.md` documents clearing the save by hand.

  Worth knowing when that lands: **the running game overwrites external edits to the save.** It
  holds the authoritative state in memory and persists on autosave and on `visibilitychange`, so
  clearing storage from the app's own tab is undone by the app on the way out. A reset therefore
  has to stop the loop and replace the in-memory state, not just empty the slots.

Routing is **no longer deferred** — it shipped with milestone 3, for exactly the reason this
list used to give for waiting: the roster and the banner are screens that survive a reload. See
milestone 3 above. Note that routing is also what gives Android's hardware back button somewhere
to go; that question still arrives with `@capacitor/app`, not before.
