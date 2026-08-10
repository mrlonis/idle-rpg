import { num, type Numeric, ZERO } from '../numeric';
import { isCharged } from './energy';
import { isTaunting } from './status';
import {
  type ActiveStatus,
  type Combatant,
  type Row,
  type Side,
  type Skill,
  type SkillConditionData,
  type SkillTarget,
} from './types';

/**
 * Choosing an action and choosing who it lands on.
 *
 * Both are **completely deterministic**. Nothing here draws from the RNG: the same battle
 * state always produces the same skill against the same targets, and the only randomness in a
 * fight is whether an attack connects, crits, or lands a status. That is what makes a replay
 * exact and a balance sweep meaningful — if target selection were random, two runs of the
 * same seed would diverge the first time a tie came up.
 *
 * ## The front row is a gate, not a taunt
 *
 * `enemy-front` — the rule the default basic attack uses, and therefore the rule most attacks
 * in the game follow — reaches the back row only once the front row is empty. That is the
 * whole mechanical content of a formation: a healer standing behind two walls is unreachable
 * by ordinary means, so an encounter built around one asks the party for something other than
 * "attack the weakest thing", which is what milestone 2's targeting could only ever say.
 *
 * The bypasses are what a sniper, a ranger or a mage is bought for. They are authored on
 * individual skills rather than granted by a stat, so reaching the back line is a decision
 * about which character to field rather than a number to accumulate.
 *
 * ## A taunt is the one thing that overrides the gate
 *
 * ⚠️ **`taunt` narrows the candidate pool before the row rule is consulted at all**, which makes it
 * the only mechanic in the game that can take a back-rank bypass away. That is precisely what it is
 * for: reach has been the answer to a protected healer since milestone 4, and an encounter that
 * wants to ask for something else has to be able to close that door. It stays answerable because
 * the door is only ever closed on **single-target** selections — `enemy-row-front`,
 * `enemy-row-back` and `enemy-all` ignore a taunt entirely, so a party is never left with no way
 * through, which is the failure milestone 4 rejected role-locked slots for.
 *
 * It also never empties a selection, so no skill becomes ineligible for want of a target — it
 * changes which opponent is chosen, never whether one exists.
 */

/**
 * The read-only view of a combatant that selection and targeting need.
 *
 * Deliberately narrower than the simulation's own mutable fighter. Everything in this file
 * works against this interface, so all of it can be tested against plain object literals
 * without standing up a battle — and the simulation can keep its working state mutable
 * without leaking that anywhere.
 */
export interface FighterView {
  readonly key: string;
  readonly side: Side;
  readonly row: Row;
  /** Position within its own side, front row first. The tie-break for every selection. */
  readonly slot: number;
  readonly maxHp: Numeric;
  readonly hp: Numeric;
  readonly energy: number;
  readonly statuses: readonly ActiveStatus[];
  /** Skill id to the battle tick at which it becomes usable again. */
  readonly cooldowns: ReadonlyMap<string, number>;
}

export function isAlive(fighter: FighterView): boolean {
  return fighter.hp.gt(ZERO);
}

function hostileCount(fighter: FighterView): number {
  return fighter.statuses.reduce((total, status) => total + (status.hostile ? 1 : 0), 0);
}

/** Remaining HP as a fraction of maximum. `maxHp` is at least 1 once content is parsed. */
function hpFraction(fighter: FighterView): Numeric {
  return fighter.hp.div(fighter.maxHp);
}

/**
 * The living opposition, narrowed to whoever is taunting when anybody is.
 *
 * Every single-target enemy selection goes through this and every multi-target one deliberately
 * does not — see the header. Narrowing rather than returning the taunter outright is what keeps
 * each selection's own rule intact: `enemy-highest` against two taunters still picks the larger of
 * the two, rather than a taunt quietly replacing the question the skill was asking.
 */
function singleTargetPool<T extends FighterView>(actor: T, fighters: readonly T[]): T[] {
  const opponents = livingOpponents(actor, fighters);
  const taunting = opponents.filter((fighter) => isTaunting(fighter.statuses));
  return taunting.length > 0 ? taunting : opponents;
}

function livingOpponents<T extends FighterView>(actor: T, fighters: readonly T[]): T[] {
  return fighters.filter((fighter) => fighter.side !== actor.side && isAlive(fighter));
}

function livingAllies<T extends FighterView>(actor: T, fighters: readonly T[]): T[] {
  return fighters.filter((fighter) => fighter.side === actor.side && isAlive(fighter));
}

/**
 * The first extreme under `worse`, with ties going to the earliest slot.
 *
 * A strict comparison is what makes the tie-break work: the candidates arrive in slot order,
 * so the first of several equals is kept and selection stays reproducible.
 */
function pick<T extends FighterView>(
  candidates: readonly T[],
  worse: (candidate: T, best: T) => boolean,
): T[] {
  let best: T | undefined;
  for (const candidate of candidates) {
    if (best === undefined || worse(candidate, best)) {
      best = candidate;
    }
  }
  return best === undefined ? [] : [best];
}

/**
 * Everyone a skill lands on, in resolution order.
 *
 * An empty result means the skill cannot be used at all — which is how a row nuke against an
 * empty back row, or a cleanse with nobody afflicted, is skipped in favour of something that
 * does something.
 */
export function selectTargets<T extends FighterView>(
  actor: T,
  fighters: readonly T[],
  target: SkillTarget,
): T[] {
  switch (target) {
    case 'self':
      return isAlive(actor) ? [actor] : [];

    case 'enemy-front':
    case 'enemy-back': {
      const preferred: Row = target === 'enemy-front' ? 'front' : 'back';
      const opponents = singleTargetPool(actor, fighters);
      const gated = opponents.filter((fighter) => fighter.row === preferred);
      // Falling through rather than returning nothing: an ordinary attack has to stay usable
      // once a row is cleared, or a party would stand there swinging at an empty rank.
      const reachable = gated.length > 0 ? gated : opponents;
      return pick(reachable, (candidate, best) => candidate.hp.lt(best.hp));
    }

    case 'enemy-lowest':
      return pick(singleTargetPool(actor, fighters), (candidate, best) => candidate.hp.lt(best.hp));

    case 'enemy-highest':
      return pick(singleTargetPool(actor, fighters), (candidate, best) => candidate.hp.gt(best.hp));

    case 'enemy-row-front':
      return livingOpponents(actor, fighters).filter((fighter) => fighter.row === 'front');

    case 'enemy-row-back':
      return livingOpponents(actor, fighters).filter((fighter) => fighter.row === 'back');

    case 'enemy-all':
      return livingOpponents(actor, fighters);

    case 'ally-lowest':
      return pick(livingAllies(actor, fighters), (candidate, best) =>
        hpFraction(candidate).lt(hpFraction(best)),
      );

    case 'ally-afflicted':
      return pick(
        livingAllies(actor, fighters).filter((fighter) => hostileCount(fighter) > 0),
        (candidate, best) => hostileCount(candidate) > hostileCount(best),
      );

    case 'ally-all':
      return livingAllies(actor, fighters);
  }
}

/**
 * Whether the actor can pay for a skill right now.
 *
 * One question, because there is one price. An ordinary skill is free and metered by its
 * cooldown; an ultimate costs a full bar and nothing else. Both halves of that used to be a
 * three-way switch over MP and HP costs, and collapsing it is most of what made energy worth
 * the swap.
 */
export function canAfford(actor: FighterView, skill: Skill): boolean {
  return !skill.ultimate || isCharged(actor.energy);
}

/** Whether a skill's cooldown has elapsed. */
export function isReady(actor: FighterView, skill: Skill, tick: number): boolean {
  return tick >= (actor.cooldowns.get(skill.id) ?? 0);
}

/**
 * Whether a skill is worth using at all.
 *
 * Conditions are what stop a healer from spending its pool on a party at full HP and a
 * debuffer from re-applying a poison that is already running. Without them the priority list
 * would have to be "always cast the biggest thing", and a support kit would be indexed
 * entirely on how often its cooldown came up rather than on whether it was needed.
 */
export function meetsCondition<T extends FighterView>(
  actor: T,
  condition: SkillConditionData,
  fighters: readonly T[],
): boolean {
  switch (condition.kind) {
    case 'always':
      return true;
    case 'ally-hurt': {
      const threshold = num(condition.fraction);
      return livingAllies(actor, fighters).some((ally) => hpFraction(ally).lt(threshold));
    }
    case 'ally-afflicted':
      return livingAllies(actor, fighters).some((ally) => hostileCount(ally) > 0);
    case 'self-hurt':
      return hpFraction(actor).lt(num(condition.fraction));
    case 'enemies-at-least':
      return livingOpponents(actor, fighters).length >= condition.count;
    case 'status-absent':
      return !livingOpponents(actor, fighters).some((enemy) =>
        enemy.statuses.some((status) => status.id === condition.statusId),
      );
  }
}

/** Whether a skill passes every gate: condition, cooldown, cost, and having somebody to hit. */
export function isEligible<T extends FighterView>(
  actor: T,
  skill: Skill,
  fighters: readonly T[],
  tick: number,
): boolean {
  return (
    meetsCondition(actor, skill.condition, fighters) &&
    isReady(actor, skill, tick) &&
    canAfford(actor, skill) &&
    selectTargets(actor, fighters, skill.target).length > 0
  );
}

/**
 * The action a combatant takes on its turn.
 *
 * A linear scan down a list already sorted by descending priority, falling back to the basic
 * attack. The basic attack is the floor rather than a candidate: it costs nothing, has no
 * cooldown and targets through the front-row gate, so it is always available and always the
 * least interesting thing to do.
 *
 * The fallback can still come back with no targets — a party facing nobody — which the
 * simulation reads as the battle already being over.
 */
export function chooseSkill<T extends FighterView>(
  actor: T,
  combatant: Combatant,
  fighters: readonly T[],
  tick: number,
): Skill {
  for (const skill of combatant.skills) {
    if (isEligible(actor, skill, fighters, tick)) {
      return skill;
    }
  }
  return combatant.basic;
}
