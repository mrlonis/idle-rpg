import { type CurrencyAmounts, type Wallet, canAfford } from '../currency';
import { num, type Numeric, ZERO } from '../numeric';
import { clampRarityIndex } from './rarity';

/**
 * Levelling: what a level costs, and how far a rarity lets you climb.
 *
 * ## Why a curve rather than a table
 *
 * The cap is 1000. A thousand hand-authored rows would be a thousand chances for a typo, and
 * every retune would be a thousand edits — so `data/` authors a handful of coefficients and
 * the shape is evaluated here. `data/levels.spec.ts` pins the resulting costs at the levels
 * that matter, which is the part a table was ever really buying.
 *
 * ## The three currencies, and why all three bite
 *
 * Costs share a shape but not a slope, and the rates they are paid from are tuned far apart.
 * The design target is that no currency is decorative — at level 200 all three land within
 * roughly a third of each other in time-to-afford, so a player is never simply waiting on one
 * number while the other two pile up unused:
 *
 * - **Gold** is the shallowest climb but the broadest claim. Levelling is comfortable on it
 *   today precisely because gear, gear levels and the shop will spend it tomorrow.
 * - **XP** only ever levels characters, and accrues far more slowly to match. It is the
 *   steady squeeze across the whole run.
 * - **Essence** is charged only at breakthrough levels — every tenth — and is the stingiest
 *   thing in the game. Early on it is barely noticeable; past level 100 it is what actually
 *   decides how fast a character climbs.
 */

/** A cost term of the form `coefficient * level ^ exponent`. */
export interface CostTermData {
  readonly coefficient: number;
  readonly exponent: number;
}

/** The level curve as authored in `data/`. Plain numbers, no `Numeric`. */
export interface LevelCurveData {
  /** The highest level any character can reach, at `ascended-5`. */
  readonly maxLevel: number;
  readonly gold: CostTermData;
  readonly xp: CostTermData;
  /**
   * Essence, charged only on levels that are a multiple of `every`.
   *
   * The exponent applies to the *breakthrough number* (level / every), not the level, which
   * is what makes essence step up in visible jumps rather than creeping.
   */
  readonly essence: CostTermData & { readonly every: number };
  /**
   * Level cap per rarity, indexed to match `RARITIES`.
   *
   * Every cap is a multiple of the essence interval, so ascending always lands a character
   * directly in front of a breakthrough rather than partway between two.
   */
  readonly caps: readonly number[];
}

function term(cost: CostTermData, at: number): number {
  return Math.round(cost.coefficient * Math.pow(at, cost.exponent));
}

/** The highest level a character at `rarityIndex` may reach. */
export function levelCapFor(curve: LevelCurveData, rarityIndex: number): number {
  const cap = curve.caps[clampRarityIndex(rarityIndex)];
  return Number.isFinite(cap) ? Math.max(Math.floor(cap), 1) : 1;
}

/** Clamps a level into `[1, cap]`. */
export function clampLevel(curve: LevelCurveData, level: number, rarityIndex: number): number {
  const cap = levelCapFor(curve, rarityIndex);
  if (!Number.isFinite(level)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(level), 1), cap);
}

/**
 * What it costs to go **from** `level` **to** `level + 1`.
 *
 * Essence is charged against the level being reached, so the jump from 9 to 10 is the first
 * breakthrough. Returns zero for a level at or above the curve's ceiling.
 */
export function levelCost(curve: LevelCurveData, level: number): CurrencyAmounts {
  const from = Math.floor(level);
  if (!Number.isFinite(from) || from < 1 || from >= curve.maxLevel) {
    return {};
  }
  const to = from + 1;
  const every = Math.max(Math.floor(curve.essence.every), 1);
  const essence = to % every === 0 ? term(curve.essence, to / every) : 0;

  return {
    gold: num(term(curve.gold, from)),
    xp: num(term(curve.xp, from)),
    ...(essence > 0 ? { essence: num(essence) } : {}),
  };
}

/** Adds every level's cost across `(from, to]`. Zero when `to` is not above `from`. */
export function cumulativeLevelCost(
  curve: LevelCurveData,
  from: number,
  to: number,
): CurrencyAmounts {
  let gold = ZERO;
  let xp = ZERO;
  let essence = ZERO;
  const start = Math.max(Math.floor(from), 1);
  const end = Math.min(Math.floor(to), curve.maxLevel);

  for (let level = start; level < end; level++) {
    const cost = levelCost(curve, level);
    gold = gold.add(cost.gold ?? ZERO);
    xp = xp.add(cost.xp ?? ZERO);
    essence = essence.add(cost.essence ?? ZERO);
  }
  return { gold, xp, essence };
}

/**
 * The highest level the wallet can reach from `level`, without exceeding the rarity's cap.
 *
 * Walked one level at a time rather than solved, because the curve has a step in it — essence
 * is charged every tenth level — so there is no closed form to solve, and the loop is bounded
 * by the level cap rather than by anything the player controls. This is a UI affordance
 * ("level up as far as I can"), not an offline path: nothing here runs per tick.
 */
export function maxAffordableLevel(
  curve: LevelCurveData,
  wallet: Wallet,
  level: number,
  rarityIndex: number,
): number {
  const cap = levelCapFor(curve, rarityIndex);
  let current = clampLevel(curve, level, rarityIndex);
  let gold: Numeric = wallet.gold;
  let xp: Numeric = wallet.xp;
  let essence: Numeric = wallet.essence;

  while (current < cap) {
    const cost = levelCost(curve, current);
    const costGold = cost.gold ?? ZERO;
    const costXp = cost.xp ?? ZERO;
    const costEssence = cost.essence ?? ZERO;
    if (gold.lt(costGold) || xp.lt(costXp) || essence.lt(costEssence)) {
      break;
    }
    gold = gold.sub(costGold);
    xp = xp.sub(costXp);
    essence = essence.sub(costEssence);
    current++;
  }
  return current;
}

/** `true` when the wallet covers the next single level and the rarity allows it. */
export function canLevelUp(
  curve: LevelCurveData,
  wallet: Wallet,
  level: number,
  rarityIndex: number,
): boolean {
  return (
    level < levelCapFor(curve, rarityIndex) &&
    canAfford(wallet, levelCost(curve, Math.floor(level)))
  );
}
