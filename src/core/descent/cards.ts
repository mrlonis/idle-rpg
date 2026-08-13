import { type StatBlockData } from '../battle/types';
import { num, serialize } from '../numeric';
import { derivedStream } from '../rng';
import {
  type DescentBonus,
  type DescentCard,
  type DescentFamilyData,
  type DescentRulesData,
  type DescentStat,
  DESCENT_STATS,
  NO_DESCENT_BONUS,
} from './types';

/**
 * What a run's cards are worth, and how the next three are drawn.
 *
 * ## The offer is derived, and the run stores only what it took
 *
 * A choice is a pure function of the seed, the day, which choice it is, and the cards already
 * taken. Nothing about a pending offer is persisted, which buys the same three things
 * `gearShopOffers` buys: no save field, nothing to migrate, and ⚠️ **rerolling is impossible rather
 * than merely detectable** — force-quitting and reloading hands back the identical three cards,
 * because there was never a draw stored to re-take.
 *
 * ⚠️ **The cards taken are an input to the draw, and that is what makes "a repeat only comes back
 * higher" a rule rather than a convention.** A family's *floor* is one above the highest rung the
 * run holds of it, so the offer physically cannot contain a card the run already owns or anything
 * below it.
 */

/** How many rungs the ladder has. Never below one: an empty ladder would make every family inert. */
function rankCount(rules: DescentRulesData): number {
  return Math.max(rules.ranks.length, 1);
}

/** The stored id of one card. */
export function descentCardId(familyId: string, rank: number): string {
  return `${familyId}:${Math.max(Math.floor(rank), 0)}`;
}

/**
 * Resolves a stored id back into a card, or `undefined` when this build no longer ships it.
 *
 * `undefined` rather than a throw, and rather than a placeholder: a run carrying a card from a
 * build with a family this one dropped should lose that card's bonus and keep the rest of its run,
 * which is the same posture the save layer takes toward a character id nothing ships.
 */
export function descentCard(
  families: readonly DescentFamilyData[],
  rules: DescentRulesData,
  id: string,
): DescentCard | undefined {
  const split = id.lastIndexOf(':');
  if (split <= 0) {
    return undefined;
  }
  const familyId = id.slice(0, split);
  const rank = Number(id.slice(split + 1));
  if (!Number.isInteger(rank) || rank < 0 || rank >= rankCount(rules)) {
    return undefined;
  }
  const family = families.find((entry) => entry.id === familyId);
  if (family?.rungs[rank] === undefined) {
    return undefined;
  }
  return { family, rank, id: descentCardId(familyId, rank) };
}

/** Every card a run holds, in the order it took them, skipping anything this build has dropped. */
export function descentCards(
  families: readonly DescentFamilyData[],
  rules: DescentRulesData,
  ids: readonly string[],
): readonly DescentCard[] {
  const cards: DescentCard[] = [];
  for (const id of ids) {
    const card = descentCard(families, rules, id);
    if (card !== undefined) {
      cards.push(card);
    }
  }
  return cards;
}

/**
 * The lowest rung of `familyId` a run may still be offered.
 *
 * One above the highest it holds, which is the "a repeat comes back higher" rule stated as
 * arithmetic. A family the run has never taken floors at zero, and one it has taken to the top
 * floors past the ladder and is therefore never offered again.
 */
export function familyFloor(cards: readonly DescentCard[], familyId: string): number {
  let floor = 0;
  for (const card of cards) {
    if (card.family.id === familyId) {
      floor = Math.max(floor, card.rank + 1);
    }
  }
  return floor;
}

/**
 * What a run's cards are worth to one member of its party.
 *
 * A faction family pays only its own faction; everything else pays the whole party. The wearer's
 * faction is an argument rather than looked up here, for the reason `loadoutBonus` takes one: the
 * answer depends on who is wearing it, and a stat pipeline that reached for the roster would be a
 * second way into content this module cannot see.
 *
 * ⚠️ **Life leech is clamped and nothing else is.** See {@link DescentRulesData.maxLifeLeech} — it
 * is the one stat here that can stop a fight from ending, and it is clamped at the point the run's
 * total is known rather than per card, because it is the total that has to be bounded.
 */
export function descentBonus(
  rules: DescentRulesData,
  cards: readonly DescentCard[],
  faction: string | undefined,
): DescentBonus {
  const total: Partial<Record<DescentStat, number>> = {};
  let any = false;

  for (const card of cards) {
    if (card.family.faction !== undefined && card.family.faction !== faction) {
      continue;
    }
    const rung = card.family.rungs[card.rank];
    if (rung === undefined) {
      continue;
    }
    for (const stat of DESCENT_STATS) {
      const value = rung[stat];
      if (value !== undefined && Number.isFinite(value) && value > 0) {
        total[stat] = (total[stat] ?? 0) + value;
        any = true;
      }
    }
  }

  if (!any) {
    return NO_DESCENT_BONUS;
  }
  const ceiling = Number.isFinite(rules.maxLifeLeech) ? Math.max(rules.maxLifeLeech, 0) : 0;
  if (total.lifeLeech !== undefined && total.lifeLeech > ceiling) {
    total.lifeLeech = ceiling;
  }
  return total;
}

/** `true` when this bonus would leave a stat block exactly as it found it. */
export function isNeutralDescentBonus(bonus: DescentBonus): boolean {
  return DESCENT_STATS.every((stat) => {
    const value = bonus[stat];
    return value === undefined || !(value > 0);
  });
}

/**
 * Folds a run's cards into an authored stat block.
 *
 * Returns a {@link StatBlockData} rather than resolved `CombatStats`, for the reason
 * `applyGearBonus` does: everything still enters the simulation through `content.ts` rather than
 * through a second, parallel way to build a combatant — which is also what re-clamps `haste` into
 * `[1, ATB_THRESHOLD]` and `critChance` into `[0, 1]` afterwards.
 *
 * ⚠️ **Unlike `applyGearBonus`, an absent stat is conjured rather than left absent, and only for
 * the three additive ones.** Gear may not invent a stat a character was authored without, because a
 * percentage of nothing is nothing and a silent identity change would be the alternative. Here the
 * whole point of a life-leech card is that it reaches a character with no leech at all — a rule
 * that skipped them would make the family pay only the handful of Monsters who already siphon,
 * which is precisely backwards. The multiplicative three keep gear's rule, because a percentage of
 * an absent quantity is still nothing.
 */
export function applyDescentBonus(stats: StatBlockData, bonus: DescentBonus): StatBlockData {
  if (isNeutralDescentBonus(bonus)) {
    return stats;
  }
  const grow = (raw: number | string, share: number | undefined): string =>
    serialize(num(raw).mul(1 + (share ?? 0)));

  return {
    ...stats,
    hp: grow(stats.hp, bonus.hp),
    atk: grow(stats.atk, bonus.atk),
    def: grow(stats.def, bonus.def),
    haste: stats.haste * (1 + (bonus.haste ?? 0)),
    critChance: stats.critChance + (bonus.critChance ?? 0),
    critDamageAmp: stats.critDamageAmp + (bonus.critDamageAmp ?? 0),
    lifeLeech: (stats.lifeLeech ?? 0) + (bonus.lifeLeech ?? 0),
  };
}

/**
 * How far through a run's card choices `choice` is, in `[0, 1]`.
 *
 * ⚠️ **The saturating half of the rank tilt.** A run has a fixed number of choices, so this reaches
 * exactly 1 on the last one however the run's length is retuned — which is what stops the tilt from
 * climbing without bound the way `gradeSoftness` does, and is why there is no softness constant
 * here to re-derive when the mode grows.
 */
export function choiceProgress(choices: number, choice: number): number {
  const total = Number.isFinite(choices) ? Math.floor(choices) : 0;
  if (total <= 1) {
    return 1;
  }
  const index = Number.isFinite(choice) ? Math.min(Math.max(Math.floor(choice), 0), total - 1) : 0;
  return index / (total - 1);
}

/** What one rank is worth in the draw at `progress` through the run. Never below zero. */
export function rankWeight(rules: DescentRulesData, rank: number, progress: number): number {
  const rung = rules.ranks[rank];
  if (rung === undefined) {
    return 0;
  }
  const start = Number.isFinite(rung.start) ? Math.max(rung.start, 0) : 0;
  const end = Number.isFinite(rung.end) ? Math.max(rung.end, 0) : 0;
  return Math.max(start + (end - start) * progress, 0);
}

/**
 * The cards on offer at one choice of one day's run.
 *
 * Two draws per slot and a fixed number of slots, so the sequence is stable in the way
 * `rollDrops`' count draw is: what matters is that the number of draws does not depend on the
 * answers, because a variable-length draw makes every later card a function of the earlier ones in
 * a way nobody can reason about.
 *
 * - **The family is drawn uniformly** from those with a rung left that the run does not already
 *   hold. Uniform rather than weighted, because a weighted family draw would make some of the
 *   fourteen rare, and rarity is what the *rank* ladder is for — two rarities on one card is a card
 *   nobody can read.
 * - **The rank is drawn by weight** from that family's remaining rungs, tilted toward the top as
 *   the run goes deeper. A family already taken to rung 2 can only come back at 3, which is the
 *   whole of the repeat rule.
 *
 * Offers fewer than `rules.offer` only if the pool genuinely runs dry, which a shipped pool cannot
 * do — the guard is against a build that ships two families, not against play.
 */
export function descentOffer(
  rules: DescentRulesData,
  families: readonly DescentFamilyData[],
  lock: readonly string[],
  seed: number,
  day: number,
  choices: number,
  choice: number,
  taken: readonly DescentCard[],
): readonly DescentCard[] {
  const size = Number.isFinite(rules.offer) ? Math.max(Math.floor(rules.offer), 0) : 0;
  if (size === 0 || families.length === 0) {
    return [];
  }

  const ladder = rankCount(rules);
  const available = families
    .filter((family) => canPay(family, lock))
    .map((family) => ({ family, floor: familyFloor(taken, family.id) }))
    .filter(
      (entry) =>
        entry.floor < ladder &&
        entry.floor < entry.family.rungs.length &&
        entry.family.rungs.length > 0,
    );

  const draw = derivedStream(seed, `descent:cards:${day}:${choice}`);
  const progress = choiceProgress(choices, choice);
  const offer: DescentCard[] = [];

  while (offer.length < size && available.length > 0) {
    // `Math.min` guards the 1.0 a stream is not supposed to produce and an index would fall off —
    // the same guard `dayOrder` applies to its Fisher–Yates pick.
    const pick = Math.min(Math.floor(draw() * available.length), available.length - 1);
    const [entry] = available.splice(pick, 1);
    const top = Math.min(ladder, entry.family.rungs.length) - 1;
    offer.push({
      family: entry.family,
      rank: weightedRank(rules, entry.floor, top, progress, draw()),
      id: '',
    });
  }

  // The id is assembled once here rather than in the loop above so that {@link descentCardId} is the
  // only place the format is written down — a second spelling of it would be two ids for one card,
  // and the run stores one of them.
  return offer.map((card) => ({ ...card, id: descentCardId(card.family.id, card.rank) }));
}

/**
 * Whether a family can pay anybody today.
 *
 * ⚠️ **A faction family for a faction the day's lock excludes is a card that can never pay a single
 * member of any legal crew** — a dead offer slot, and with seven faction families against a
 * three-faction lock it would be four of fourteen, so better than a quarter of every offer. That is
 * not a small leak: three dead cards in one offer is a choice the player cannot make.
 *
 * The lock is constant for a run's whole length — it is drawn per day and a run belongs to one day —
 * so filtering here cannot make a card the run already holds unresolvable. A universal family always
 * pays; an empty lock admits everybody, which is what `null`-shaped content would mean.
 */
function canPay(family: DescentFamilyData, lock: readonly string[]): boolean {
  return family.faction === undefined || lock.length === 0 || lock.includes(family.faction);
}

/**
 * Picks a rung in `[floor, top]` by weight, using one already-taken draw.
 *
 * Takes the roll rather than the stream, so the caller keeps the number of draws per slot visible
 * and fixed. A ladder whose weights all read zero at this depth falls back to the floor rather than
 * to nothing: an offer slot that resolved to no card would silently shrink the choice.
 */
function weightedRank(
  rules: DescentRulesData,
  floor: number,
  top: number,
  progress: number,
  roll: number,
): number {
  let total = 0;
  for (let rank = floor; rank <= top; rank++) {
    total += rankWeight(rules, rank, progress);
  }
  if (total <= 0) {
    return floor;
  }
  let cursor = roll * total;
  for (let rank = floor; rank <= top; rank++) {
    cursor -= rankWeight(rules, rank, progress);
    if (cursor < 0) {
      return rank;
    }
  }
  return top;
}
