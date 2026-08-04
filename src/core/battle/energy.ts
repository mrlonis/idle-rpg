import { type EnergyRules, type EnergyRulesData } from './types';

/**
 * Energy: the meter every ultimate is paid from.
 *
 * One pool, one size, one price. A combatant fills {@link MAX_ENERGY} points from fighting and
 * spends the whole bar to cast its ultimate — there is no partial spend and no per-character
 * pool size. That uniformity is the entire reason this replaced MP: a pool that differed per
 * character and a cost that differed per skill meant "when does this come up" was arithmetic
 * nobody could do while watching a battle, and the answer changed every time a kit was retuned.
 *
 * ## It starts empty, and that inverts what MP did to pacing
 *
 * MP started **full**: a caster opened strong and ran dry, so a long fight was one the caster
 * had already lost the interesting half of. Energy starts at **zero**: an ultimate is a payoff
 * rather than an opener, and a long fight is one where more of them land.
 *
 * That is the trade milestone 8b made, and it is worth stating as an inversion rather than as a
 * loss. The pacing difference between a short fight and a long one survives; it changed sign.
 * What genuinely went with MP is the guarantee that a healer eventually stops healing — see the
 * note on termination below.
 *
 * ## ⚠️ Energy is not a termination argument, and MP was
 *
 * A pool that only ever refills cannot run out, so a fight against a healer is no longer bounded
 * by the healer's resources. It is bounded by `MAX_BATTLE_TICKS` alone, which reports a
 * `stalemate`. That is a real transfer of responsibility and it is why the ladder sweep asserts
 * **zero stalemates** on every reference party, winning or losing — that assertion is now the
 * only thing standing where the MP pool used to.
 *
 * Nothing here can make a fight longer in an unbounded way, though: every gain is non-negative
 * and the pool is clamped, so energy cannot loop, and an ultimate cannot be cast twice from one
 * bar.
 */

/**
 * The size of every combatant's energy bar, and the price of every ultimate.
 *
 * A core constant rather than a `data/` balance number, because it is the **denominator** rather
 * than a rate. Retuning how fast ultimates come up is done with {@link EnergyRulesData}, which
 * is where a balance number belongs; changing this would only rescale every gain by the same
 * factor and leave the game identical.
 */
export const MAX_ENERGY = 100;

/** Clamps an energy total into `[0, MAX_ENERGY]`, treating damaged input as empty. */
export function clampEnergy(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), MAX_ENERGY);
}

/** Whether a full bar is standing — the one condition an ultimate has. */
export function isCharged(energy: number): boolean {
  return energy >= MAX_ENERGY;
}

/**
 * Parses the authored energy gains.
 *
 * Each is clamped into `[0, MAX_ENERGY]`. The ceiling is not arbitrary: a single gain larger than
 * the bar would make one event enough to charge an ultimate from empty, which turns the meter
 * into a cooldown of one turn. The floor is what keeps every gain non-negative, so filling the
 * bar is monotone and an ultimate can never be pushed further away by acting.
 */
export function toEnergyRules(raw: EnergyRulesData): EnergyRules {
  return {
    onHit: clampEnergy(raw.onHit),
    onHurt: clampEnergy(raw.onHurt),
    onHeal: clampEnergy(raw.onHeal),
  };
}
