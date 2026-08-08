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
 * ## A hundred floors, levels 1 to 60
 *
 * **Inside the campaign's own range, deliberately.** The shipped ladder runs to level 85 by the end
 * of chapter 2, so a tower's top floor is a fight the campaign asks for a little past halfway. That
 * is the whole statement about where difficulty lives: a tower charges for roster *breadth*, and
 * charging for investment as well would make it a second campaign that a player behind on the first
 * one cannot enter.
 *
 * ⚠️ **The reference party's level is derived from this, not chosen.** `rare-plus` caps at level 60,
 * which is exactly {@link topLevel}, so the party the balance sweep fields tracks the content rather
 * than being a number somebody picked. Moving `topLevel` moves the target party with it — and if it
 * ever passes a rarity cap, `towers.balance.ts` fails loudly rather than measuring a party nobody
 * can field.
 *
 * ## The rhythm is the campaign's
 *
 * Every tenth floor is a mini-boss and the last one is a boss. A player who has learnt that every
 * tenth fight is harder should not have to learn a second rhythm, and reusing the interval means a
 * fifty-floor tower and a two-hundred-floor one need no new authoring to have peaks.
 *
 * ## The crystals, and why the per-floor figure is not the campaign's
 *
 * 100 a floor against the campaign's 250, ×2 on a mini-boss and ×5 on the roof — so one tower pays
 * 11,400 from floors alone, and seven pay about 80,000. ⚠️ **At parity the seven towers would pay
 * ~268,000, which is 3.9× the campaign's ~69,000 from stage clears alone**, and makes the ladder's
 * own rewards look pointless beside optional content. At 100 the seven come to roughly 149,000 with
 * the five-floor tracks and 219,000 with the completion awards — a bit over 3× the critical path for
 * 7× the content, on ladders gated behind roster depth.
 *
 * Flat in the floor, for the reason every crystal payout in this game is flat: a pull costs a flat
 * `PULL_COST` forever, so anything scaling with how far a run has come pays most to the player who
 * needs it least. The two multipliers are the whole of the climb's rhythm.
 */
export const TOWER_RULES = {
  floors: 100,
  baseLevel: 1,
  topLevel: 60,
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
 * has six. See [`enemies.ts`](./enemies.ts).
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
