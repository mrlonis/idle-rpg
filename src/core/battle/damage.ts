import { type Numeric, ZERO } from '../numeric';
import { type CombatStats } from './types';

/**
 * The damage formula, and the only place combat draws RNG.
 *
 * ## Why `atk² / (atk + def)`
 *
 * Subtractive mitigation (`atk - def`) has two failure modes an idle game cannot tolerate.
 * It goes to zero — and then negative — as soon as DEF catches ATK, which turns a merely
 * unfavourable matchup into an unwinnable one and leaves the simulation grinding against a
 * stalemate it can never resolve. And it makes DEF a hard wall, so a single point of it can
 * flip a fight, which is miserable to tune.
 *
 * This form is strictly positive whenever ATK is, so a battle always terminates. It also
 * behaves the way the design wants at both ends: with `def = 0` a hit lands for full ATK,
 * `def = atk` halves it, and each further point of DEF is worth less than the last. That
 * diminishing return is what stops a defensive stat from becoming the only stat.
 *
 * ## Randomness
 *
 * Crits are the single RNG consumer. There is deliberately no damage variance on top:
 * variance adds noise to every balance sweep without adding a decision for the player, while
 * a crit chance is a stat with a real tradeoff against raw ATK. Keeping the draw count at
 * exactly one per attack also keeps a battle's RNG consumption easy to reason about when
 * comparing two replays.
 */

export interface AttackRoll {
  readonly damage: Numeric;
  readonly crit: boolean;
}

/**
 * Damage before the crit multiplier.
 *
 * Guards the degenerate case rather than producing `NaN`: `atk = 0` would otherwise divide
 * zero by zero, and a `NaN` HP value silently poisons every comparison downstream, so a
 * combatant with no attack simply deals nothing.
 */
export function baseDamage(atk: Numeric, def: Numeric): Numeric {
  if (atk.lte(ZERO)) {
    return ZERO;
  }
  return atk.mul(atk).div(atk.add(def));
}

/**
 * Resolves one attack, consuming exactly one draw from the battle's RNG stream.
 *
 * The draw is taken unconditionally — before the crit chance is even consulted — so that the
 * stream advances by one per attack regardless of the attacker's stats. A conditional draw
 * would make RNG consumption depend on the line-up, and two otherwise identical replays
 * would diverge.
 */
export function rollAttack(
  attacker: CombatStats,
  defender: CombatStats,
  draw: () => number,
): AttackRoll {
  const roll = draw();
  const crit = roll < attacker.critChance;
  const base = baseDamage(attacker.atk, defender.def);
  return { damage: crit ? base.mul(attacker.critMultiplier) : base, crit };
}
