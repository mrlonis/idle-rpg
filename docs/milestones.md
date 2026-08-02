# Milestones

The ordering exists so there is **always something playable**. Each milestone layers onto
the previous skeleton without changing its shape. Do not skip ahead: a later milestone
built on an unverified earlier one is where the hard-to-find bugs live.

Before starting work, check where the project actually is. Do not assume this list is
current — verify against the code.

| #   | Milestone                              | Status                                           |
| --- | -------------------------------------- | ------------------------------------------------ |
| 1   | Tick loop, one resource, save/load     | ✅ **Complete**                                  |
| 2   | Battle up a stage ladder               | ✅ **Complete** — introduced `data/`             |
| 3   | Gacha, roster, ascension, levelling    | ✅ **Complete** — introduced routing             |
| 4   | Team composition affecting combat math | ⬜ Next                                          |
| 5   | Offline catch-up on resume             | 🟡 Continuous done; segmented solver outstanding |
| 6   | Run on a physical iPhone               | ⬜                                               |
| 7   | Prestige layer, then content           | ⬜                                               |

---

### 1. Tick loop, one resource, save/load — **COMPLETE**

A number counts up on screen and survives a refresh. This proves the whole architecture
end to end: `core/` purity, the sim/render split, and the save path.

Shipped: `core/numeric.ts` (`Numeric` over `break_infinity`), `core/rng.ts` (seeded
mulberry32 with O(1) resume and derived sub-streams), `core/state.ts`, `core/tick.ts`,
`core/save/` (versioned saves, migration chain, non-throwing repair, fixtures),
`core/offline.ts`, `ui/game-loop.service.ts`, `ui/save.service.ts`,
`ui/format-numeric.ts`.

### 2. Player-initiated battles up a stage ladder — **COMPLETE**

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
the first battle the only thing worth doing. The rate climbs 0.5/s to 16/s across the ladder,
and `applyBattleResult` only ever raises it. The one-off `goldReward` is the smaller half,
tuned to roughly 40 seconds of the income it unlocks.

Shipped:

- `core/battle/clock.ts` — the ATB constants and `ticksUntilReady()`. The simulation jumps
  straight to the tick of the next action rather than stepping tick by tick; the spec pins
  that jump against a brute-force per-tick count, the same way offline resume is pinned
  against stepwise accrual.
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
  the starter party; `data/stages.spec.ts` proves it by simulating the ladder.
- `ui/battle.service.ts` — `fight()` resolves then narrates, `close()` leaves.
- `ui/home-view.ts`, `ui/battle-view.ts` — the two screens; `app/app.ts` is the shell that
  swaps between them.
- Save v2: `stage` and `battleCount` in `GameState`, via the first real migration.

Two decisions worth not re-litigating:

- **The result is applied when the animation finishes, not when the battle resolves.**
  Applying it up front spoils every fight: the gold counter and the income rate both jump the
  instant the player taps, announcing the outcome before the first blow lands. The cost is that
  a battle abandoned by a reload mid-animation pays nothing — acceptable precisely because the
  player starts each fight and watches it, and going again is one tap. If an unattended loop is
  ever added, revisit this: for a loop that runs while nobody is looking, the trade inverts.
- **Targeting is the living opponent with the least HP, ties by slot.** Deliberately naive
  until enemy design gives it something to reason about; milestone 4 is where that lands.

### 3. Gacha, roster, ascension and levelling — **COMPLETE**

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

#### Two rarity axes, which is the thing to understand first

**Tier** is which character you pulled and never changes: `common`, `legendary`, `ascended`.
**Rarity** is how far that character has been ascended, `rare` → `ascended-5`. They share two
words (a `legendary`-tier character and the `legendary` rarity are unrelated) because that is
the genre's vocabulary; the types keep them apart.

Tier is a **slope, not a head start.** Base stat budgets are close across tiers — a higher tier
buys a sharper version of its faction's identity, not more of everything. The gap opens through
per-level growth: ×1.2 at level 50, ×19.5 at level 1000. That is what makes a common-tier
character a genuine early answer that genuinely falls off, as a consequence of the math rather
than as an assertion. Any character of any tier can reach `ascended-5`.

#### Ascension

Duplicates are the primary progression path, so a dupe is never wasted. Two ladders, authored
in `data/ascension.ts` and resolved by `core/roster/rarity.ts`:

- **Mortal** (Humans, Dwarves, Elves, Undead, Monsters) spends **bodies**: four rungs are paid
  with same-faction fodder. An ascended-tier unit costs 8 of its own Elite copies plus 180 Rare
  copies of fodder to reach Ascended, 18 Elite copies for ★5.
- **Celestial** (Angels, Demons) spends **luck**: every rung is copies of the character itself.
  14 Elite copies to Ascended, 24 for ★5, no fodder at all.

Rungs are quoted in _ascended_ copies and a player only holds _base_ ones, so every requirement
is **resolved recursively into base copies**. That recursion is why this is code and not a
lookup table, and `data/ascension.spec.ts` pins every derived total against its design target.

**Only spare copies are ever consumed, never a character you have levelled.** A deliberate
departure from the genre: nobody can destroy a week's investment by tapping the wrong row, so
the confirmation dance around irreversible loss does not exist, and a faction-mate stays both a
playable character and an ascension resource.

Copies of a character already at `ascended-5` convert to **spark**, which buys either a new
character or a targeted copy in the shop. Spark only accrues after something is maxed, so it is
late-game overflow — **pity is the escape valve for bad luck, not the shop.**

#### Levelling and the four currencies

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
`ascended-5` and is aspirational — the ladder is eight stages long, and rates rise with content.

**Only `hp`, `atk` and `def` scale.** `spd` is ATB gauge per tick against a fixed threshold and
`critChance` is a probability; a growing `spd` would hit the clamp within eighty levels and turn
the one stat that buys turns into a constant.

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

### 4. Team composition affecting combat math — **NEXT**

Composition matters through **enemy design**, not flat synergy bonuses — see
"Content and balance" in [AGENTS.md](../AGENTS.md). Characters are keys to locks, not rungs on
a ladder.

Milestone 3 built the lock-picking set: 21 characters across 7 factions, each faction expressing
one axis more sharply as tier rises. What it deliberately did **not** build is anything for those
niches to answer. Targeting is still "the living opponent with the least HP", every combatant
does one thing on its turn, and the only reason to field Thraun over Vharok is a stat line.

This milestone is where enemies get questions worth asking — a healer that has to be burst, a
wide wave that punishes single-target, a debuff that needs a cleanse — and where the naive
targeting from milestone 2 finally has something to reason about.

### 5. Offline catch-up — **PARTIALLY COMPLETE**

Done and tested: the continuous fixed-rate closed form, the `[0, CAP_MS]` clamp, the
backwards-clock guard, and `accrueDiscrete()` for expected-value drops with a carried
remainder.

Still outstanding:

- A drop source to feed `accrueDiscrete()`, plus the `dropCarry` field in `GameState`.
- The **segmented** closed form for a rate that changes mid-window — but not yet; see below.

**The segmented solver is not needed yet, and that is worth being precise about.** It exists to
price an away window in which the rate _changes_ — auto-progression clearing stages while nobody
is watching. Battles are player-initiated, so nothing clears a stage while the player is away:
**every** rate is constant across any offline window, and the fixed-rate closed form already
shipped is exactly right — it now settles four currencies in one pass rather than one. The gap
opens when the unlockable auto-battle lands (see "Later: the two auto-battles" below), because
that is the first thing that advances stages unattended. Build the segmented solver then,
against that feature, rather than speculatively now.

`timeToClear(state, stage)` is still the missing piece when that day comes, and
`BattleResult.durationMs` is its raw material — though a mean over several seeds, not one
battle, since crits make any single fight unrepresentative.

The migration chain no longer needs a first customer: save v2 exercised it for real when combat
landed.

### 6. Run it on a physical iPhone

Do this while the app is still small, so the signing and provisioning pain lands early
rather than next to a deadline. `npm run ios` builds, syncs, and opens Xcode.

### 7. Prestige layer, then content

Only after 1–6 are solid.

### Later: the two auto-battles

"Auto-battle" means two different features, and neither is milestone 2. Milestone 2 is a
button the player presses. Do not build either of these into it.

1. **Ambient sparring on the idle screen.** The party visibly fighting in the background while
   the player watches their income tick up — presentation, not simulation. It should not award
   anything, advance a stage, or touch `GameState`; if it did, it would be a second progression
   path competing with the real one. The event log a battle already produces is the natural
   thing to loop for it.
2. **An unlockable that re-enters stages until the party loses.** Earned after a certain
   stage. It keeps fighting on its own, and on a loss the player is dropped back to the idle
   screen to either watch their earnings or start again. This one **does** award and advance,
   which is why the note above about applying results at the end of the animation has to be
   revisited when it lands: an unattended loop is exactly the case where a battle lost to an
   autosave or a backgrounded app matters, and where skipping the animation entirely may be
   the better answer.

Both want milestone 5's offline work to exist first, since "what happens while nobody is
watching" is the same question in all three places.

### Deliberately deferred

- **Foreground/background handling via `@capacitor/app`.** The `visibilitychange` handling
  in `ui/game-loop.service.ts` covers the current need. Revisit it when the offline path pays
  out battle rewards (milestone 5) rather than before — that is when the difference between a
  web `visibilitychange` and a real iOS lifecycle event starts to matter.
- **Angular Material.** Installed but unused. Do not pull it in until a real control needs
  it. Milestone 3 added five screens' worth of buttons, tabs, a progress bar, a table and a
  disclosure without it, all AXE-clean — so the bar for reaching for it is higher now, not
  lower.
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
