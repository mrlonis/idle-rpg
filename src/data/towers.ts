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
 * fodder. See [milestones](../../docs/milestones.md) for the whole argument.
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
 * **Inside the campaign's own range, deliberately.** The shipped ladder runs to level 588 and first
 * reaches 120 at `c5-s24`, so a tower's top floor is a fight the campaign asks for a quarter of the
 * way along it. That is the whole statement about where difficulty lives: a tower charges for roster
 * *breadth*, and charging for investment as well would make it a second campaign that a player
 * behind on the first one cannot enter.
 *
 * ⚠️ **{@link topLevel} is deliberately *not* a rarity cap, and the assertion that said it was is
 * gone.** A tower closes **above** the cap of the rung it asks for — the campaign's own margin rule
 * — because a rung is worth ×1.6 and the enemy side has no rungs at all. `elite` caps at 100 and the
 * roof is 120, so the top band's crew is still derived (the highest cap strictly below the roof)
 * without a crew standing at parity with content it out-ranks. `towers.spec.ts` holds the margin and
 * holds separately that the *halfway* floor's level is a cap, which is what band 1's crew rests on.
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
 * ⚠️ **Those are the figures for 21k, not for today.** Five of the seven have their second hundred
 * (21e through 21i), so the tower side stands at 373,500 and the ratio at **1.255** against a floor
 * of 0.7 that is itself a mid-milestone placeholder. `towers.spec.ts` carries the whole argument.
 * 21g is the session that took it back over parity with the campaign for the first time since the
 * four chapters landed, and each since has been worth about +0.105.
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
  topLevel: 120,
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
 * has at least nine. See [`enemies.ts`](./enemies.ts).
 *
 * ## ⚠️ Two of the seven are a hundred floors short, and that is milestone 21e–21k in progress
 *
 * {@link TOWER_RULES} is one rule for all seven, so the bump to two hundred floors landed in **one**
 * session while the floors themselves land in seven. Until the last of them, a tower that has not
 * been extended simply ends at its hundredth floor — `clearedFloors` clamps to what the tower
 * authors, so `nextFloor` reports it topped and nothing in `ui/` misreads it. What it does lose is
 * its boss: `floorKindAt` reads the *rules'* height, so floor 100 resolves as a mini-boss and pays
 * ×2 rather than ×5 while it waits.
 *
 * That is licensed by exactly one argument, the same one the save re-bases rest on: **no build
 * carrying this has ever reached a player.** `towers.spec.ts` holds the list of towers still
 * waiting, each session deletes its own name, and 21k deletes the list — so a session that forgets
 * fails loudly rather than shipping a tower that is quietly half a tower.
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
