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

| #   | Milestone                              | Status                                       |
| --- | -------------------------------------- | -------------------------------------------- |
| 1   | Tick loop, one resource, save/load     | ✅ **Complete**                              |
| 2   | Battle up a stage ladder               | ✅ **Complete** — introduced `data/`         |
| 3   | Gacha, roster, ascension, levelling    | ✅ **Complete** — introduced routing         |
| 4   | Team composition affecting combat math | ✅ **Complete** — introduced formations      |
| 5   | Offline catch-up on resume             | ✅ **Complete** — segmented solver ruled out |
| 6   | Run on a physical iPhone               | 🟡 Next                                      |
| 7   | Prestige layer, then content           | ⬜                                           |

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

**Turn order is an ATB gauge** (`gauge += spd` per tick, act at 1000) rather than fixed rounds,
so SPD buys turns instead of just going first. Randomness comes from a sub-stream derived via
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
- `core/battle/content.ts` — parses and clamps authored content. `spd` is clamped to
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
`spd` is ATB gauge per tick against a fixed threshold and `critChance` is a probability; a
growing `spd` would hit the clamp within eighty levels and turn the one stat that buys turns into
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

**Placement is free.** Any character can stand in either rank. Role-locking was considered and
rejected for one reason: it would let an unlucky roster reach a state where no legal party
exists, and in a game with no way to buy characters that is a run with nowhere to go. A bad front
row is a far better failure than no front row. `CharacterRole` exists and **nothing in the
simulation reads it** — it is there so the roster screen can say "healer" instead of making a
player infer it from `matk` and a skill list.

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
| Pyre Caster   | is any of your durability magical?        | `mdef`, a Ward, or killing it     |
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
  vocabulary, and a thirteen-kind event log.
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
closed form settling all four rate-bearing currencies in one pass, the `[0, OFFLINE_CAP_MS]`
clamp at ten hours, the backwards-clock guard, and a non-finite guard for a damaged
`lastTickAt`. `resume()` is called on load from `ui/game-loop.service.ts` and its report is
rendered on the home screen, so the path is wired end to end rather than merely available.

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

- **Angular Material is uninstalled**, along with `@angular/cdk`. Nothing imported it; the only
  thing it did was own `styles.scss`, and what it did there was the bug. `styles.css` went from
  8.82 kB to 699 bytes. See the deferred list below, where it used to sit.
- **The document no longer scrolls.** `html` and `body` are `height: 100%; overflow: hidden`,
  the shell is a flex column, and `main` is the scroll container. This is the structural fix, not
  a cosmetic one: it removes page-level rubber-banding, and it lets the tab bar become a flex
  item instead of `position: fixed`. A bar that is a sibling in the layout cannot disagree with
  the content above it, and `main` stops having to carry a hard-coded 6rem of bottom padding to
  guess the bar's height — which was also dead space on the two screens that have no bar.
- **Safe-area insets moved to where they cannot scroll away.** Horizontal and top insets sit on
  the shell, so the top gutter is outside the scroll container and content cannot slide under the
  notch; the bottom inset sits on the tab bar, so its own surface colour fills the home-indicator
  strip rather than the page colour showing through.
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

## 7. Prestige layer, then content

Only after 1–6 are solid.

## Later: the two auto-battles

"Auto-battle" means two different features, and neither is milestone 2. Milestone 2 is a
button the player presses. Do not build either of these into it.

1. **Ambient sparring on the idle screen.** The party visibly fighting in the background while
   the player watches their income tick up — presentation, not simulation. It should not award
   anything, advance a stage, or touch `GameState`; if it did, it would be a second progression
   path competing with the real one. The event log a battle already produces is the natural
   thing to loop for it.
2. **An unlockable that re-enters stages until the party loses.** Earned after a certain
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

   That last part is a real change, not a description of today. Results reach `GameState` at
   animation end, but only reach storage on `visibilitychange` or the thirty-second backstop
   autosave — so a suspend without `visibilitychange` can lose several **completed** battles at
   4x. **Persist when each battle ends** as part of building this; it is what makes "we just
   lose the fight in flight" actually true.

   Because the loop is attended, milestone 2's decision to apply results at the end of the
   animation does **not** invert. Backgrounding already pauses the animator rather than
   abandoning the fight. Skipping the animation is a playback choice, not a correctness one.

Neither is blocked on milestone 5 any more — it is complete, and the foreground-only rule above
is what settled it.

## Deliberately deferred

- **Foreground/background handling via `@capacitor/app`.** The `visibilitychange` handling
  in `ui/game-loop.service.ts` covers the current need. Its old trigger — "when the offline path
  pays out battle rewards" — will never fire, because the offline path pays the four idle rates
  and nothing else. The live reason to revisit it is **auto-battle**: a loop that must stop when
  the app leaves the foreground is the first thing that cares about the difference between a web
  `visibilitychange` and a real iOS lifecycle event. Persisting at the end of each fight is what
  keeps that from being urgent, since a missed lifecycle event then costs one battle.
- **Angular Material.** **Removed, not deferred.** It was installed by `ng new` and never
  imported by a single component — five screens' worth of buttons, tabs, a progress bar, a table
  and a disclosure were built without it, all AXE-clean. The only thing it actually did was own
  the scaffolded global stylesheet, and what it did there broke the app's first run on real
  hardware (see milestone 6). It and `@angular/cdk` are uninstalled. If a control ever genuinely
  needs it, reinstalling is one command — but write the global styles by hand rather than
  accepting `mat.theme()`, which assumes a light scheme and a webfont this project cannot have.
- **Resetting a run.** `SaveService.clear()` exists and is documented for a deliberate "start
  over", and nothing calls it. That is intentional: wiping a run is destructive and
  irreversible, and it belongs **behind a settings menu**, not on the home screen where a
  mis-tap can reach it. Build it when the settings screen arrives — and note the method has
  never been executed by anything, including tests, so making it reachable means covering it.
  Until then, `README.md` documents clearing the save by hand.

  Worth knowing when that lands: **the running game overwrites external edits to the save.** It
  holds the authoritative state in memory and persists on autosave and on `visibilitychange`, so
  clearing storage from the app's own tab is undone by the app on the way out. A reset therefore
  has to stop the loop and replace the in-memory state, not just empty the slots.

Routing is **no longer deferred** — it shipped with milestone 3, for exactly the reason this
list used to give for waiting: the roster and the banner are screens that survive a reload. See
milestone 3 above. Note that routing is also what gives Android's hardware back button somewhere
to go; that question still arrives with `@capacitor/app`, not before.
