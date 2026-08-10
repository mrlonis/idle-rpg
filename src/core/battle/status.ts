import { num, type Numeric, ZERO } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import { type ActiveStatus, type CombatStats, type ModifiableStat, type StatusData } from './types';

/**
 * Statuses: what a buff, debuff, poison, shield or stun actually is once it is on somebody.
 *
 * Everything here is a pure function over a status list. The simulation holds the lists and
 * swaps them out; nothing in this file knows what a battle is, which is what makes each of
 * these individually testable without standing a fight up.
 *
 * ## Quantities are snapshotted at application, not recomputed
 *
 * A poison's damage, a regen's healing and a shield's pool are all resolved from the
 * applier's stats **once**, on the turn the status lands. Recomputing them per tick would
 * mean a debuff stopped mattering the moment its caster fell — which would quietly make
 * "kill the debuffer" the answer to every debuff, collapsing a whole category of lock into
 * the one the game already had.
 *
 * ## Refresh, never stack
 *
 * Re-applying a status by the same id replaces it rather than adding a second copy. Stacking
 * multiplies badly: two casters with the same 0.7× defence debuff would land 0.49×, three
 * would land 0.34×, and a wide enough enemy wave would delete a defensive stat by arithmetic
 * nobody authored. Refreshing keeps a status worth re-applying without making duplication the
 * strategy.
 */

/** Builds the live status from its authored form, resolving quantities against the applier. */
export function toActiveStatus(data: StatusData, applier: CombatStats, tick: number): ActiveStatus {
  // Never zero-length: a status that expires on the tick it lands is a status that never
  // happened, which is far harder to notice than one that lasts a moment too long.
  const duration = Number.isFinite(data.duration) ? Math.max(Math.floor(data.duration), 1) : 1;
  const base: ActiveStatus = {
    id: data.id,
    name: data.name,
    kind: data.kind,
    hostile: data.hostile,
    expiresAt: tick + duration,
  };

  switch (data.kind) {
    case 'stat-mod':
      return {
        ...base,
        stat: data.stat,
        multiplier: Number.isFinite(data.multiplier) ? Math.max(data.multiplier, 0) : 1,
      };
    case 'dot':
      return {
        ...base,
        damageType: data.damageType,
        // One `atk` since 8a, so a poison's bite no longer depends on which attack stat its
        // applier happened to favour. `damageType` still rides along, and it is still read: the
        // simulation settles it against the **target's** matching resist as the status lands,
        // which is a thing this function cannot do because it only ever sees the applier.
        amount: scaled(applier.atk, data.power),
      };
    case 'regen':
    case 'shield':
      return { ...base, amount: scaled(applier.atk, data.power) };
    case 'bomb':
      // Snapshotted exactly as a `dot` is, and for the same reason: the payload belongs to the
      // blow that planted it, not to whether its planter is still standing when it goes off.
      return { ...base, damageType: data.damageType, amount: scaled(applier.atk, data.power) };
    case 'reflect':
    case 'link':
      return { ...base, share: share(data.share) };
    case 'stun':
    case 'taunt':
      return base;
  }
}

function scaled(stat: Numeric, power: number): Numeric {
  return stat.mul(num(Number.isFinite(power) ? Math.max(power, 0) : 0));
}

/**
 * A proportion, clamped into `[0, 1]`.
 *
 * The upper bound is the one that matters. A `link` share above 1 would move more damage off a
 * target than the hit contained and hand the difference to its allies as a multiplier — content
 * inventing damage — and a `reflect` above 1 would return more than it received, which is the
 * shape of thing that ends a fight in one swing rather than in ninety seconds.
 */
function share(value: number): number {
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
}

/**
 * Adds a status, replacing any existing one with the same id.
 *
 * Position is preserved on a refresh so the badge row in the UI does not reshuffle every time
 * a debuffer takes its turn.
 */
export function applyStatus(
  statuses: readonly ActiveStatus[],
  next: ActiveStatus,
): readonly ActiveStatus[] {
  const index = statuses.findIndex((status) => status.id === next.id);
  if (index < 0) {
    return [...statuses, next];
  }
  const replaced = [...statuses];
  replaced[index] = next;
  return replaced;
}

/** Statuses that are still running at `tick`, and those that have just stopped. */
export function partitionExpired(
  statuses: readonly ActiveStatus[],
  tick: number,
): { readonly active: readonly ActiveStatus[]; readonly expired: readonly ActiveStatus[] } {
  const active: ActiveStatus[] = [];
  const expired: ActiveStatus[] = [];
  for (const status of statuses) {
    (tick >= status.expiresAt ? expired : active).push(status);
  }
  return { active, expired };
}

/**
 * Removes up to `count` hostile statuses, oldest first.
 *
 * Oldest first rather than "most harmful first" because a cleanse should be predictable: a
 * player who watched a stun land knows the next cleanse takes it, without having to reason
 * about which of two debuffs the game considers worse.
 */
export function cleanseStatuses(
  statuses: readonly ActiveStatus[],
  count: number,
): { readonly remaining: readonly ActiveStatus[]; readonly removed: readonly string[] } {
  const wanted = Number.isFinite(count) ? Math.max(Math.floor(count), 0) : 0;
  if (wanted === 0) {
    return { remaining: statuses, removed: [] };
  }

  const remaining: ActiveStatus[] = [];
  const removed: string[] = [];
  for (const status of statuses) {
    if (status.hostile && removed.length < wanted) {
      removed.push(status.id);
      continue;
    }
    remaining.push(status);
  }
  return { remaining, removed };
}

/** True while any stun is running. */
export function isStunned(statuses: readonly ActiveStatus[]): boolean {
  return statuses.some((status) => status.kind === 'stun');
}

/** True while this combatant is drawing single-target attacks onto itself. */
export function isTaunting(statuses: readonly ActiveStatus[]): boolean {
  return statuses.some((status) => status.kind === 'taunt');
}

/**
 * The first running status of one kind, or `undefined`.
 *
 * First rather than combined, which is the one place `reflect` and `link` differ from
 * {@link statModifier}. Two stat debuffs on one target genuinely stack their multipliers; two
 * thorns would compound a *share of a share*, and two links would each claim a slice of a hit the
 * other had already moved — arithmetic no author could predict from reading either status. One at
 * a time, oldest first, keeps both readable, and re-applying by the same id refreshes rather than
 * adds.
 */
export function runningStatus(
  statuses: readonly ActiveStatus[],
  kind: ActiveStatus['kind'],
): ActiveStatus | undefined {
  return statuses.find((status) => status.kind === kind);
}

/** The combined multiplier every active `stat-mod` places on one stat. */
export function statModifier(statuses: readonly ActiveStatus[], stat: ModifiableStat): number {
  let multiplier = 1;
  for (const status of statuses) {
    if (status.kind === 'stat-mod' && status.stat === stat) {
      multiplier *= status.multiplier ?? 1;
    }
  }
  return multiplier;
}

/** Remaining absorb across every shield. */
export function shieldTotal(statuses: readonly ActiveStatus[]): Numeric {
  let total = ZERO;
  for (const status of statuses) {
    if (status.kind === 'shield' && status.amount !== undefined) {
      total = total.add(status.amount);
    }
  }
  return total;
}

/**
 * Spends shields against incoming damage, oldest pool first.
 *
 * Returns the damage that got through as well as the amount swallowed, because the two are
 * shown differently: a hit that a shield ate is not a hit that missed, and a battle log that
 * conflated them would make a shielder look like it did nothing.
 */
export function absorbDamage(
  statuses: readonly ActiveStatus[],
  damage: Numeric,
): {
  readonly statuses: readonly ActiveStatus[];
  readonly absorbed: Numeric;
  readonly through: Numeric;
} {
  if (damage.lte(ZERO) || shieldTotal(statuses).lte(ZERO)) {
    return { statuses, absorbed: ZERO, through: damage.lt(ZERO) ? ZERO : damage };
  }

  const next: ActiveStatus[] = [];
  let remaining = damage;
  let absorbed = ZERO;

  for (const status of statuses) {
    const pool = status.kind === 'shield' ? (status.amount ?? ZERO) : undefined;
    if (pool === undefined || remaining.lte(ZERO) || pool.lte(ZERO)) {
      next.push(status);
      continue;
    }

    const taken = pool.lt(remaining) ? pool : remaining;
    absorbed = absorbed.add(taken);
    remaining = remaining.sub(taken);
    const left = pool.sub(taken);
    // A spent shield is dropped rather than kept at zero, so the badge disappears the moment
    // it stops protecting anything.
    if (left.gt(ZERO)) {
      next.push({ ...status, amount: left });
    }
  }

  return { statuses: next, absorbed, through: remaining };
}

/**
 * The stat block a combatant is currently fighting with.
 *
 * `haste` is re-clamped after modification and nothing else is. That asymmetry is the
 * simulation's termination argument showing through: a haste that pushed past
 * `ATB_THRESHOLD` would let a combatant bank two actions in one tick, and a slow that pushed
 * it below 1 would leave it unable to ever act again. The quantities have no such bound —
 * they are allowed to go anywhere, because the damage formula is well behaved across the
 * whole range.
 */
export function effectiveStats(stats: CombatStats, statuses: readonly ActiveStatus[]): CombatStats {
  if (statuses.length === 0) {
    return stats;
  }
  return {
    ...stats,
    atk: stats.atk.mul(statModifier(statuses, 'atk')),
    def: stats.def.mul(statModifier(statuses, 'def')),
    haste: clampHaste(stats.haste * statModifier(statuses, 'haste')),
  };
}

/**
 * Just the current gauge fill, without building a whole stat block for it.
 *
 * The scheduling loop asks for this on every combatant on every iteration, and it is the only
 * stat it needs — but the quantities in a full {@link effectiveStats} are `Decimal`s, so
 * producing one costs arbitrary-precision multiplications. Doing that ten times an iteration
 * to read a plain number made a balance sweep of the whole ladder take twenty seconds; this
 * makes the same sweep a rounding error. Same arithmetic, same clamp, no allocation.
 *
 * `swinging` — whether the combatant's **last** action was a basic attack — is what separates
 * {@link CombatStats.attackSpeed} from haste. It is passed in rather than derived here because
 * the answer lives on the fighter, and this file deliberately knows nothing about fighters.
 * **The sum is re-clamped**, not each half: two stats that individually respected the gauge
 * bound and jointly did not would break turn ordering exactly as one oversized stat would.
 */
export function effectiveSpeed(
  stats: CombatStats,
  statuses: readonly ActiveStatus[],
  swinging = false,
): number {
  const extra = swinging ? stats.attackSpeed : 0;
  const modifier = statuses.length === 0 ? 1 : statModifier(statuses, 'haste');
  return clampHaste((stats.haste + extra) * modifier);
}

function clampHaste(haste: number): number {
  if (!Number.isFinite(haste)) {
    return 1;
  }
  return Math.min(Math.max(haste, 1), ATB_THRESHOLD);
}

/**
 * The earliest tick at which any of these statuses stops, or `undefined` when none do.
 *
 * The simulation jumps straight to the next thing that happens rather than stepping tick by
 * tick, so it has to know about expiries as well as actions — otherwise a stun would outlive
 * itself whenever the next turn was further away than the stun was long.
 */
export function nextExpiry(statuses: readonly ActiveStatus[]): number | undefined {
  let soonest: number | undefined;
  for (const status of statuses) {
    if (soonest === undefined || status.expiresAt < soonest) {
      soonest = status.expiresAt;
    }
  }
  return soonest;
}
