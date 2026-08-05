import { num, type Numeric } from './numeric';

/**
 * Compounding growth: the three slopes, and the multiplier a combatant carries because of them.
 *
 * ## Why this is its own module rather than part of `roster/`
 *
 * It was part of `roster/` until milestone 10, and the reason it moved is the reason that
 * milestone exists. Growth used to describe **characters**: a tier was how fast the thing you
 * pulled got stronger, and the other side of the board was a set of hand-authored stat blocks
 * that never grew at all. That works while the whole ladder spans a factor of forty. It stops
 * working the moment the player's own curve spans a factor of a billion, because a fixed stat
 * block is then a rounding error and every lock the ladder taught quietly becomes an empty
 * square.
 *
 * So an enemy is now a definition plus a level, climbing the same three slopes — and the
 * vocabulary that decides a slope belongs to neither side of the board. `roster/types.ts` and
 * `battle/types.ts` both read it from here, which is also what keeps the module graph a tree:
 * `roster/` already depends on `battle/`, so `battle/` could not have reached back into it.
 *
 * ## What growth may and may not touch
 *
 * Only quantities — `hp`, `atk`, `def` and `recovery`. Everything else in a stat block is a
 * scheduling weight, a probability, or a budget measured against a fixed bar, and the argument
 * for each is in `roster/stats.ts`. Nothing here knows about stat blocks at all; it returns a
 * multiplier and leaves the decision about what to multiply to the caller.
 */

/**
 * How a character is pulled and how it grows, **in ascending order of growth slope**.
 *
 * - `common` starts at `rare`, is the weakest per level, and carries the early game. It can
 *   still be taken all the way to `ascended-5` — deliberately, so an early favourite is a
 *   real investment rather than something the game later tells you was a waste.
 * - `legendary` starts at `rare` too but grows faster and hits harder in its niche. Mid-game.
 * - `ascended` starts at `elite`, skipping the bottom two rungs entirely, and grows fastest.
 *   Late-game, and the thing the pity counter is pointed at.
 *
 * Since milestone 10 an **enemy** declares one too, and it means the same thing: fodder is
 * `common`, a lock is `legendary`, a gate is `ascended`. A stage fields every archetype at one
 * level, so the tier is what makes the boss of an encounter pull away from its escort as the
 * ladder climbs instead of the two staying a fixed distance apart forever.
 *
 * An array rather than a bare union: the order is a fact about the tiers, so anything ranking
 * them should read it here rather than keep its own copy. A fourth tier is then a compile error
 * everywhere that ranking is exhaustive.
 */
export const CHARACTER_TIERS = ['common', 'legendary', 'ascended'] as const;

export type CharacterTier = (typeof CHARACTER_TIERS)[number];

/** Growth rates as authored in `data/`. */
export interface GrowthData {
  /** Multiplier applied per level, per tier. Compounds — see `roster/stats.ts` on divergence. */
  readonly perLevel: Readonly<Record<CharacterTier, number>>;
  /** Multiplier applied per rung climbed above the character's starting rarity. */
  readonly perAscension: number;
}

/** A growth factor, guarded so damaged content cannot shrink a combatant to nothing. */
function factor(value: number): number {
  return Number.isFinite(value) && value >= 1 ? value : 1;
}

/**
 * The multiplier a combatant's quantities carry at a given level and rung count.
 *
 * Takes **rungs above the tier's own starting rarity** rather than a rarity index, which is what
 * lets this sit below `roster/rarity.ts` rather than beside it. `growthMultiplier` in
 * `roster/stats.ts` is the rarity-flavoured wrapper the roster and the UI actually call.
 *
 * ⚠️ `Math.max(NaN, 1)` is `NaN`, so a damaged level has to be screened out *before* the clamp
 * rather than by it — otherwise every quantity on the combatant comes back `NaN` and the battle
 * it walks into cannot resolve.
 */
export function growthAt(
  growth: GrowthData,
  tier: CharacterTier,
  level: number,
  rungs: number,
): Numeric {
  const levels = (Number.isFinite(level) ? Math.max(Math.floor(level), 1) : 1) - 1;
  const climbed = Number.isFinite(rungs) ? Math.max(Math.floor(rungs), 0) : 0;
  return num(factor(growth.perLevel[tier]))
    .pow(levels)
    .mul(num(factor(growth.perAscension)).pow(climbed));
}
