import { num, type Numeric, ZERO } from '../numeric';
import { matchupKey } from './content';
import { type CombatRules, type CombatStats, type DamageType } from './types';

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
 * ## Two axes, two defences
 *
 * A hit declares its {@link DamageType} and is measured against the matching defence. That is
 * the whole reason a wall is not automatically a wall against everything: a Golem's enormous
 * `pdef` is worth nothing against a spell, and a caster that neglected `mdef` dies to one.
 *
 * ## Penetration multiplies, it does not subtract
 *
 * `def × (1 - pen)`, capped below 1 by `content.ts`. Flat penetration would be a hard counter
 * — enough of it deletes a defensive stat outright — while a fraction stays a *discount* on
 * the same diminishing curve. A shredder therefore makes a wall feel like a body rather than
 * like an empty square.
 *
 * ## Ordering, and why it is fixed
 *
 * `base × skill power × faction matchup × crit`. Power is applied to the **result** rather
 * than to the attack stat feeding it: the formula is quadratic in ATK, so scaling the input
 * would make a 2× skill hit for roughly 4× and turn every authored multiplier into a balance
 * trap.
 *
 * ## Randomness
 *
 * Exactly **two** draws per damage instance, always in the order hit-then-crit, and both
 * taken unconditionally — the crit draw happens even on a miss. A conditional draw would make
 * RNG consumption depend on an outcome rather than on the line-up, and two otherwise
 * identical replays would diverge. Status application spends one further draw per clause, on
 * the same terms.
 */

export interface AttackRoll {
  /** False when the target dodged. Damage is zero and no crit is reported. */
  readonly hit: boolean;
  /** Damage before any shield absorbs its share. Zero on a miss. */
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

/** The attack stat a damage type reads. */
export function attackStat(stats: CombatStats, type: DamageType): Numeric {
  return type === 'physical' ? stats.patk : stats.matk;
}

/**
 * The defence a damage type is measured against, after the attacker's penetration.
 *
 * Never below zero, so a damaged or hostile penetration value cannot turn a defensive stat
 * into a damage bonus.
 */
export function effectiveDefence(
  attacker: CombatStats,
  defender: CombatStats,
  type: DamageType,
): Numeric {
  const [def, pen] =
    type === 'physical'
      ? ([defender.pdef, attacker.armorPen] as const)
      : ([defender.mdef, attacker.magicPen] as const);
  const remaining = 1 - pen;
  return remaining <= 0 ? ZERO : def.mul(remaining);
}

/**
 * Chance an attack connects at all.
 *
 * Additive rather than multiplicative so the two stats read as one contest: accuracy above 1
 * exists precisely to out-run a dodge pool. Floored by the rules, because a hit chance that
 * can reach zero is a battle that can never end.
 */
export function hitChance(
  attacker: CombatStats,
  defender: CombatStats,
  rules: CombatRules,
): number {
  return Math.min(Math.max(attacker.accuracy - defender.dodge, rules.minHitChance), 1);
}

/**
 * The matchup multiplier for one ordered faction pairing.
 *
 * An unlisted pairing is neutral, which is also what an unknown faction gets. That is the
 * right default for content: a new faction added to `data/` fights everyone evenly until
 * somebody authors what it is good against, rather than silently inheriting somebody else's
 * table.
 */
export function factionMultiplier(rules: CombatRules, attacker: string, defender: string): number {
  return rules.matchups.get(matchupKey(attacker, defender)) ?? 1;
}

/**
 * Chance a status effect lands.
 *
 * `authored + effectHit - tenacity`, clamped to `[0, 1]`. Deliberately allowed to reach zero:
 * unlike a hit chance, a debuff that never lands cannot stall a battle, so a genuinely
 * immune-to-debuffs archetype is authorable. Most content leaves both stats at zero, in which
 * case this is exactly what the skill authored — debuffs are meant to land, and the answer to
 * one is a cleanse rather than a resistance race.
 */
export function statusChance(
  authored: number,
  attacker: CombatStats,
  defender: CombatStats,
): number {
  const base = Number.isFinite(authored) ? authored : 1;
  return Math.min(Math.max(base + attacker.effectHit - defender.tenacity, 0), 1);
}

/**
 * Resolves one damage instance, consuming exactly two draws from the battle's RNG stream.
 *
 * Both draws are taken before either is consulted, so the stream advances by two per instance
 * whatever happens — a miss costs the same randomness as a critical hit. See the note at the
 * top of this file for why that matters more than it looks like it should.
 *
 * @param power the skill's multiplier, applied to the result rather than to the attack stat
 * @param matchup the faction multiplier from {@link factionMultiplier}
 */
export function rollAttack(
  attacker: CombatStats,
  defender: CombatStats,
  type: DamageType,
  power: number,
  matchup: number,
  rules: CombatRules,
  draw: () => number,
): AttackRoll {
  const hitRoll = draw();
  const critRoll = draw();

  if (hitRoll >= hitChance(attacker, defender, rules)) {
    return { hit: false, damage: ZERO, crit: false };
  }

  const crit = critRoll < attacker.critChance;
  const scale = num(Number.isFinite(power) ? Math.max(power, 0) : 0).mul(
    Number.isFinite(matchup) ? Math.max(matchup, 0) : 1,
  );
  const base = baseDamage(
    attackStat(attacker, type),
    effectiveDefence(attacker, defender, type),
  ).mul(scale);

  return { hit: true, damage: crit ? base.mul(attacker.critMultiplier) : base, crit };
}
