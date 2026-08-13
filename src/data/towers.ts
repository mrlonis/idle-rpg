import { TOWER_ANGEL } from './tower-angel';
import { TOWER_DEMON } from './tower-demon';
import { TOWER_DWARF } from './tower-dwarf';
import { TOWER_ELF } from './tower-elf';
import { TOWER_HUMAN } from './tower-human';
import { TOWER_MONSTER } from './tower-monster';
import { TOWER_UNDEAD } from './tower-undead';

/**
 * How every tower is shaped, and the towers this build ships.
 *
 * `core/towers.ts` is where all of this is evaluated — the level line, the mini-boss rhythm, the
 * level-matched payout, the one integer of progress. What lives here is the content and four
 * coefficients, which is the same division [`chapters.ts`](./chapters.ts) makes with the reward
 * curve.
 *
 * ## What a tower is for
 *
 * Not more difficulty — **more roster**. The campaign has never asked for more than five characters,
 * against a forty-nine character bench fed by a gacha generous enough to produce roughly 190 pulls a
 * day at post-ladder crystal rates. Seven towers of five, each locked to one faction, is demand for
 * thirty-five invested characters, so an unlucky pull becomes the answer to a tower instead of
 * fodder. See [history](../../docs/history.md) for the whole argument.
 *
 * ⚠️ **A tower is therefore skippable, never on the critical path, and never the only source of
 * anything.** It is a wall about *who you own* in a game with no way to buy a character, which is
 * precisely the failure role-locked formation slots were rejected for in milestone 4. What keeps it
 * safe is that nothing behind it is required.
 */

/**
 * One rule for all seven towers.
 *
 * ## Two hundred floors, levels 1 to 120
 *
 * **Inside the campaign's own range, deliberately.** The shipped ladder runs to level 200 and first
 * reaches 95 at `c6-s40`, so a tower's top floor is a fight the campaign asks for about halfway
 * along it. That is the whole statement about where difficulty lives: a tower charges for roster
 * *breadth*, and charging for investment as well would make it a second campaign that a player
 * behind on the first one cannot enter.
 *
 * ⚠️ **That fraction moved from a quarter to a half when the campaign flattened**, and it is worth
 * watching rather than restating: the tower's level line is fixed while the campaign's is planned to
 * run for many more chapters, so the roof drifts back toward the *opening* of the ladder with every
 * chapter authored. It is the right direction — optional content should not creep up the spine — but
 * a roof that lands in the first tenth of the campaign has stopped charging for breadth at all.
 *
 * ⚠️ **{@link topLevel} is deliberately *not* a rarity cap, and the assertion that said it was is
 * gone.** A tower closes **above** the cap of the rung it asks for, because a rung is worth ×1.6 and
 * the enemy side has no rungs at all — so a crew standing at parity with content it out-ranks is not
 * a test. `rare-plus` caps at 60 and the roof is 95, so the roof stays a fight.
 *
 * ## ⚠️ 120 → 95, because the campaign moved under it
 *
 * The campaign flattened to 0.50 levels a stage and now tops out at 200 rather than 588. A floor's
 * lump is read off the campaign **at the stage fighting at the same level**, so a roof of 120 — which
 * the flattened campaign does not reach until stage 240 — paid a two-hundred-floor tower **more per
 * floor than the campaign pays per stage** (9,600 against 8,000). That is optional content displacing
 * the spine, which is the one thing tower payouts may never do. 95 is the highest roof that keeps the
 * lump under the campaign's stage-200 payout with real margin (7,600 against 8,000).
 *
 * ⚠️ **Do not "fix" this by moving the roof back up.** The bound is now the campaign's own level line
 * and it moves whenever that does; `towers.spec.ts` checks the payout directly. The index-based
 * version of that guard was **retired** in the same change — it compared a campaign stage index
 * against a tower floor count, two different units that only ever agreed while the two ladders were a
 * similar length.
 *
 * ⚠️ **The crews are the other half and they do not derive from the caps ladder any more.** Dropping
 * the roof used to drop each crew's *rung* as well, because `towers.balance.ts` read the rung off
 * `caps.indexOf(level)` — costing the crews ×1.6 where the content only lost its levels, which put
 * **all seven roofs at 0%**. The rungs are pinned now and only the levels derive. See that file.
 *
 * ## ⚠️ The second hundred is a single straight line, and the retune it was expected to cause
 * evaporated
 *
 * Milestone 21e took `floors` 100 → 200 and `topLevel` 60 → **120** rather than making
 * {@link floorLevel} piecewise, which would have preserved every shipped floor exactly at the cost
 * of a `core/` change in a milestone that has none.
 *
 * **120 is the level at which the new slope meets the old one**: 119/199 = 0.5980 against the
 * shipped 59/99 = 0.5960, so **ten of the seven hundred shipped floors move, each by exactly one
 * level**, and all seven hundred sweep with zero failures. That is arithmetic rather than luck —
 * 199 ≈ 2×99 + 1 and 119 ≈ 2×59 + 1 — and **any future extension of a tower should reach for it
 * first**: double the floors, double the top level, then ask whether the roof it implies is a fight.
 *
 * ⚠️ **The roadmap prescribed 140 and a retune of all seven hundred shipped floors, and 21e measured
 * both halves of that to be wrong.** At 140 the slope goes 59/99 → 139/199 — +5 levels at floor 50
 * and +10 at floor 100 — and against the crew those floors were tuned for (`rare-plus`, level 60)
 * **46 of the 700 shipped floors fall below the 90% bar** with six of seven roofs going from 100% to
 * 0%. No other crew measures the low band instead: an `elite` five at level 70 clears all seven
 * shipped hundreds with all five alive on every roof, because the rung hands over a second skill and
 * that dwarfs forty levels. And 140 produces a roof no board can make into a fight, which is the
 * finding that killed it — see the margin note above. **Nothing about the shipped hundreds needs
 * re-authoring**, in this session or any of 21f–21k.
 *
 * ## The rhythm is the campaign's
 *
 * Every tenth floor is a mini-boss and the last one is a boss. A player who has learnt that every
 * tenth fight is harder should not have to learn a second rhythm, and reusing the interval means a
 * fifty-floor tower and a two-hundred-floor one need no new authoring to have peaks.
 *
 * ## The crystals, and why the per-floor figure is not the campaign's
 *
 * 100 a floor against the campaign's 250, ×2 on a mini-boss and ×5 on the roof — so a two-hundred
 * floor tower pays **22,300** from floors alone, and **62,300** once its two achievement tracks are
 * counted. ⚠️ **At parity the seven towers would pay more than five times what the campaign's stage
 * clears do**, which makes the ladder's own rewards look pointless beside optional content. At 100 a
 * floor, seven towers of two hundred come to **156,100** from floors and **436,100** with both
 * tracks — against a ten-chapter campaign of ~297,500, on ladders gated behind roster depth.
 *
 * **All seven have their second hundred as of 21k**, so those are the shipped figures: 436,100
 * against 297,500, a ratio of **1.466**, and the floor is back at **1.3** where it stood before
 * milestone 21 rather than at the 0.7 placeholder it spent 21b–21j at. `towers.spec.ts` carries the
 * whole argument. 21g is the session that took it back over parity with the campaign for the first
 * time since the four chapters landed, and every one of the seven was worth **+0.1052 exactly** —
 * one tower's second hundred is 31,300 crystals, so the step is identical by construction.
 *
 * Flat in the floor, for the reason every crystal payout in this game is flat: a pull costs a flat
 * `PULL_COST` forever, so anything scaling with how far a run has come pays most to the player who
 * needs it least. The two multipliers are the whole of the climb's rhythm.
 *
 * ⚠️ **`Spire Conqueror` stays `every: 100` rather than becoming `every: 200`**, so a two-hundred
 * floor tower pays it **twice**. The tie it holds with a chapter's completion award is re-derived as
 * *per hundred floors* — which is the argument the tie always rested on, that a hundred floors and a
 * fifty-stage chapter are comparable events, now stated per unit. Re-authoring it as `every: 200` to
 * keep the tie literal would strip 70,000 crystals from the tower side. No save migration either
 * way: awards-taken is an integer, and a player who topped the old hundred has taken 1 and earned 1.
 */
export const TOWER_RULES = {
  floors: 200,
  baseLevel: 1,
  topLevel: 95,
  /** The campaign's interval, reused. See {@link CHAPTER_CURVE}. */
  miniBossEvery: 10,
  floorSummons: {
    base: 100,
    miniBossMultiplier: 2,
    bossMultiplier: 5,
  },
} as const;

/**
 * The towers this build ships, in the order the screens list them.
 *
 * **Seven of seven, one per faction, in `FACTIONS` order** — which is also the order the roster
 * screen groups by, so a player who knows where their Elves are knows where the Elf Tower is.
 * `towers.spec.ts` holds the one-per-faction shape rather than this paragraph.
 *
 * The Human Tower shipped alone in milestone 15b because it is the only one that needed no new
 * enemy archetypes: Undead counter Humans and already had five blocks, which is what let that
 * milestone be about the *system*. 15c is the other six, and the eighteen blocks they needed — the
 * counts were lopsided (monster 6, undead 5, human 5, dwarf 3, demon 3, **elf 1, angel 1**) and a
 * tower biased toward a faction with one block is the same fight a hundred times. Every faction now
 * has at least fourteen. See [`enemies.ts`](./enemies.ts).
 *
 * ## ⚠️ All seven are two hundred floors, and the interim is worth remembering
 *
 * {@link TOWER_RULES} is one rule for all seven, so the bump to two hundred floors landed in **one**
 * session (21e) while the floors themselves landed in seven (21e–21k). For six sessions in between,
 * a tower that had not been extended simply ended at its hundredth floor — `clearedFloors` clamps to
 * what the tower authors, so `nextFloor` reported it topped and nothing in `ui/` misread it. What it
 * lost while it waited was its boss: `floorKindAt` reads the *rules'* height, so its floor 100
 * resolved as a mini-boss and paid ×2 rather than ×5.
 *
 * That was licensed by exactly one argument, the same one the save re-bases rest on: **no build
 * carrying this has ever reached a player.** What kept it honest was a hand-maintained `PENDING`
 * list of names in `towers.spec.ts` and `towers.balance.ts` that each session shrank and 21k
 * deleted — a filter reading "either the full height or half of it" would have passed forever and
 * never noticed a tower nobody went back for. **Do it the same way if the height ever moves again.**
 *
 * ⚠️ **A tower's `id` is a save key twice over** — it is what `GameState.towers` files the climb
 * under *and* what `GameState.formations` files the crew under. Renaming one strands both. Change
 * the `name` freely; never the `id`. Every tower also needs a matching row in
 * [`activities.ts`](./activities.ts), which is what gives it a crew at all;
 * [`towers.spec.ts`](./towers.spec.ts) is what makes a missing one a failing test rather than a
 * tower with no way in.
 */
export const TOWERS = [
  TOWER_HUMAN,
  TOWER_DWARF,
  TOWER_ELF,
  TOWER_UNDEAD,
  TOWER_MONSTER,
  TOWER_ANGEL,
  TOWER_DEMON,
] as const;
