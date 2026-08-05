import { type CurrencyAmounts, type Wallet, canAfford } from '../currency';
import { ZERO } from '../numeric';
import { PARTY_SIZE } from '../state';
import { cumulativeLevelCost, type LevelCurveData, levelCapFor } from './level';
import { type OwnedCharacter } from './types';

/**
 * Resonance: the level the whole roster shares.
 *
 * Invest in five characters and every other character you own is carried to the same level.
 * Nothing gates it — no emblems, no slots, no currency. Owning a character is the only
 * requirement, which is the deliberate departure from the system this is modelled on.
 *
 * ## The rule
 *
 * Sort the roster by level, take the top {@link PARTY_SIZE}, and the **lowest of those five**
 * is the floor. Every character is then treated as being at least that level:
 *
 * ```
 * effectiveLevel = min(levelCapFor(rarity), max(investedLevel, resonanceFloor))
 * ```
 *
 * Three properties fall out of that, and they are the whole design:
 *
 * - **Hyper-levelling one character moves nothing.** The floor is the *fifth*-highest level, so
 *   it only rises once five characters have been invested in.
 * - **Ties need no tiebreak.** The floor is a level, not a character, so equal levels give the
 *   same answer whatever order they sort in — the derivation is deterministic without anyone
 *   having to decide what beats what.
 * - **The rarity cap still binds.** A `rare` character caps at 40; a floor of 200 lifts it to 40
 *   and no further. Resonance makes *levels* free and leaves *ascension* entirely individual,
 *   which is what keeps the bench worth spending on.
 *
 * **No edge case for a small roster, and that is worth understanding rather than adding one.**
 * With fewer than `PARTY_SIZE` characters owned the floor is the lowest level in the roster, so
 * everybody is already at or above it and nobody can benefit. The feature is self-neutralising
 * until the roster outgrows the party, at which point it starts working on its own.
 *
 * ## Derived, never stored
 *
 * `OwnedCharacter.level` stays the **invested** level — the one the player paid for. Nothing
 * here is written into a save. Baking a carried level in would be wrong the moment the top five
 * changed: a character recorded at 200 because the floor was 200 has no way back to what it
 * actually cost.
 *
 * ## The floor never falls
 *
 * Invested levels only rise, characters are never removed from the roster, and adding one can
 * only raise or hold the `PARTY_SIZE`-th highest value. So the floor is monotonically
 * non-decreasing and no displayed level can ever drop. The one exception is load-time repair
 * dropping a character `data/` no longer ships — recorded so that a floor which moved backwards
 * is recognised as a repair having run rather than as a bug here.
 */

/** One character the plan has to level, and the range it pays for. */
export interface ResonanceRaise {
  readonly defId: string;
  /** Where levelling starts: the **effective** level, so resonance is never paid for twice. */
  readonly from: number;
  readonly to: number;
}

/** What it takes to move the floor to a given level, priced in full before anything is spent. */
export interface ResonancePlan {
  /** The floor once the plan is applied. */
  readonly target: number;
  /**
   * Who has to be levelled. Anchors already at or above `target` are absent rather than listed
   * with a zero range, so an empty list means the floor is already there.
   */
  readonly raises: readonly ResonanceRaise[];
  readonly cost: CurrencyAmounts;
}

/** A level as the roster stores it, guarded against damaged content. */
function invested(owned: OwnedCharacter): number {
  return Number.isFinite(owned.level) ? Math.max(Math.floor(owned.level), 1) : 1;
}

/** How many characters have to stand at a level for it to be the floor. */
function anchorCount(roster: readonly OwnedCharacter[]): number {
  return Math.min(PARTY_SIZE, roster.length);
}

/**
 * The characters whose levels set the floor: the `PARTY_SIZE` highest-levelled, highest first.
 *
 * Sorted stably, so characters tied at the same level keep roster order and the list a screen
 * draws does not reshuffle between renders. Fewer than `PARTY_SIZE` owned returns the whole
 * roster, which is the same statement the floor makes.
 */
export function resonanceAnchors(roster: readonly OwnedCharacter[]): readonly OwnedCharacter[] {
  return [...roster].sort((a, b) => invested(b) - invested(a)).slice(0, anchorCount(roster));
}

/**
 * The level every owned character is carried to.
 *
 * Reads only invested levels, which is what keeps the derivation non-circular: a character
 * standing on the floor can never help hold it up.
 */
export function resonanceFloor(roster: readonly OwnedCharacter[]): number {
  const count = anchorCount(roster);
  if (count === 0) {
    return 1;
  }
  const levels = roster.map(invested).sort((a, b) => b - a);
  return levels[count - 1];
}

/** The level a character actually fights and displays at. */
export function effectiveLevel(
  curve: LevelCurveData,
  owned: OwnedCharacter,
  floor: number,
): number {
  const carried = Number.isFinite(floor) ? Math.max(Math.floor(floor), 1) : 1;
  return Math.min(levelCapFor(curve, owned.rarity), Math.max(invested(owned), carried));
}

/** `true` when this character is standing above its own investment because of the floor. */
export function isResonated(curve: LevelCurveData, owned: OwnedCharacter, floor: number): boolean {
  return effectiveLevel(curve, owned, floor) > invested(owned);
}

/**
 * The highest floor the roster could ever reach, ignoring the wallet.
 *
 * The `PARTY_SIZE`-th highest **level cap** in the roster, because moving the floor to a level
 * needs that many characters able to stand on it. This is what stalls when the fifth-highest
 * character is at its rarity's ceiling, and the answer to a stall is an ascension — or a sixth
 * character levelled past the one that is stuck.
 */
export function resonanceCeiling(roster: readonly OwnedCharacter[], curve: LevelCurveData): number {
  const count = anchorCount(roster);
  if (count === 0) {
    return 1;
  }
  const caps = roster.map((owned) => levelCapFor(curve, owned.rarity)).sort((a, b) => b - a);
  return Math.min(caps[count - 1], Math.max(Math.floor(curve.maxLevel), 1));
}

/**
 * What it would cost to move the floor to `target`, or `null` when nothing can.
 *
 * **The set it prices is the cheapest one, and picking it is not a search.** Every candidate
 * pays the same curve, so the cost of reaching `target` falls monotonically with the level a
 * character is already at — the cheapest `PARTY_SIZE` are simply the highest-levelled among
 * those whose rarity cap allows `target` at all. Characters below the floor are legitimate
 * candidates and cost exactly what an anchor does, because levelling starts from the effective
 * level; they sort last only because the ties have to break somewhere and "the top five stay
 * the top five" is the model the screen teaches.
 *
 * Returns `null` rather than a partial plan when fewer than `PARTY_SIZE` characters can reach
 * `target`, and for a `target` at or below the current floor — in both cases there is no move
 * to price.
 */
export function resonancePlan(
  roster: readonly OwnedCharacter[],
  curve: LevelCurveData,
  target: number,
): ResonancePlan | null {
  const required = anchorCount(roster);
  const floor = resonanceFloor(roster);
  const to = Math.floor(target);
  if (required === 0 || !Number.isFinite(to) || to <= floor) {
    return null;
  }

  const anchors = roster
    .filter((owned) => levelCapFor(curve, owned.rarity) >= to)
    .sort((a, b) => invested(b) - invested(a))
    .slice(0, required);
  if (anchors.length < required) {
    return null;
  }

  const raises: ResonanceRaise[] = [];
  let gold = ZERO;
  let xp = ZERO;
  let essence = ZERO;
  for (const owned of anchors) {
    const from = effectiveLevel(curve, owned, floor);
    if (from >= to) {
      continue;
    }
    const cost = cumulativeLevelCost(curve, from, to);
    gold = gold.add(cost.gold ?? ZERO);
    xp = xp.add(cost.xp ?? ZERO);
    essence = essence.add(cost.essence ?? ZERO);
    raises.push({ defId: owned.defId, from, to });
  }

  return { target: to, raises, cost: { gold, xp, essence } };
}

/**
 * The highest floor the wallet can pay for in one go.
 *
 * Binary search rather than the level-by-level walk `maxAffordableLevel` uses, because the
 * price here is a whole-plan question: the set being levelled can change as rarity caps drop
 * candidates out, so there is no running total to carry from one level to the next. The search
 * is sound because the price is monotonic — the set chosen for a higher target is also a legal
 * set for a lower one, and costs more to reach it.
 *
 * Returns the current floor when nothing is affordable, so a caller can compare against
 * {@link resonanceFloor} to decide whether the button does anything.
 */
export function maxAffordableResonance(
  roster: readonly OwnedCharacter[],
  wallet: Wallet,
  curve: LevelCurveData,
): number {
  const floor = resonanceFloor(roster);
  let low = floor;
  let high = resonanceCeiling(roster, curve);

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const plan = resonancePlan(roster, curve, mid);
    if (plan !== null && canAfford(wallet, plan.cost)) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}
