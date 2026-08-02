import {
  type AscensionPath,
  type AscensionRules,
  type CharacterTier,
  type CopyCost,
  MAX_RARITY_INDEX,
  RARITIES,
  type RarityFamily,
  type RarityId,
} from './types';

/**
 * The ascension ladder, and what climbing it costs in copies.
 *
 * ## The one idea in this file
 *
 * Rungs are authored in terms of *ascended* copies — "2 copies of any character of the same
 * faction at Elite+" — but a player never holds an ascended spare. They hold base copies, as
 * pulled. So every requirement is resolved **recursively into base copies**: an Elite+ fodder
 * unit is itself 18 base copies of some faction-mate, which is what makes the headline number
 * for a mortal ascended-tier character 8 of its own Elite copies plus 180 Rare copies of
 * fodder rather than the six copies the table appears to ask for.
 *
 * That recursion is the whole reason this is code rather than a lookup table. The authored
 * tables are short and readable; the numbers they imply are neither, and deriving them means
 * retuning a rung cannot silently leave a stale total behind.
 *
 * `rarity.spec.ts` pins the derived totals against the authored design targets, so a change
 * to either table shows up as a failed expectation with the real number in it.
 */

/** Turns a rarity id into its ladder index, or `-1` if it is not a rarity. */
export function rarityIndex(id: string): number {
  return (RARITIES as readonly string[]).indexOf(id);
}

/** The rarity at a ladder index, clamped into range. */
export function rarityAt(index: number): RarityId {
  return RARITIES[clampRarityIndex(index)];
}

/** Clamps any number to a valid ladder index. */
export function clampRarityIndex(index: number): number {
  if (!Number.isFinite(index)) {
    return 0;
  }
  return Math.min(Math.max(Math.floor(index), 0), MAX_RARITY_INDEX);
}

/**
 * Where a tier starts on the ladder.
 *
 * `ascended`-tier characters skip `rare` and `rare-plus` entirely and arrive at `elite`.
 * That head start is most of what makes them worth the pity counter: the two rungs they skip
 * are the ones paid for with the largest volume of bodies.
 */
export function startRarityIndex(tier: CharacterTier): number {
  return tier === 'ascended' ? rarityIndex('elite') : 0;
}

/**
 * Which family a rung belongs to: `rare-plus` is a Rare, `ascended-3` an Ascended.
 *
 * Derived by stripping the suffix rather than by a lookup table, for the same reason the cost
 * arithmetic above is derived — a table would have to be edited in lockstep with `RARITIES` and
 * would go stale quietly. The suffixes are the only two the ladder uses, and `rarity.spec.ts`
 * proves every rung still strips to a known family.
 */
export function rarityFamily(index: number): RarityFamily {
  return rarityAt(index).replace(/-(?:plus|\d+)$/, '') as RarityFamily;
}

/** Human-readable rarity, with the stars spelled out. */
export function rarityLabel(index: number): string {
  const id = rarityAt(index);
  const stars = /^ascended-(\d)$/.exec(id);
  if (stars !== null) {
    return `Ascended ${'★'.repeat(Number(stars[1]))}`;
  }
  return id
    .split('-')
    .map((part) => (part === 'plus' ? '+' : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('')
    .replace(/([a-z])\+/, '$1+');
}

function add(a: CopyCost, b: CopyCost, times = 1): CopyCost {
  return { self: a.self + b.self * times, faction: a.faction + b.faction * times };
}

/**
 * Memo table, keyed first by the rules object so that two different rule sets — the shipped
 * one and a fixture — cannot contaminate each other's results. A `WeakMap` because the memo
 * should not be what keeps a test's rules object alive.
 */
const memo = new WeakMap<AscensionRules, Map<string, CopyCost>>();

function cacheFor(rules: AscensionRules): Map<string, CopyCost> {
  let cache = memo.get(rules);
  if (cache === undefined) {
    cache = new Map();
    memo.set(rules, cache);
  }
  return cache;
}

/**
 * Base copies needed to produce **one** unit at `targetIndex`, starting from base copies at
 * `startIndex`.
 *
 * Returns `{ self: 1, faction: 0 }` when the target is at or below the start: a copy that is
 * already at the rarity you need costs exactly itself.
 *
 * Requirements always reference a rarity strictly below the rung's target, so the recursion
 * terminates on any well-formed ladder. `visiting` is a guard against a malformed authored
 * table turning that into a hang — a cycle yields a finite (wrong) answer that a spec can
 * catch, rather than freezing the device.
 */
export function copyCost(
  rules: AscensionRules,
  path: AscensionPath,
  startIndex: number,
  targetIndex: number,
  visiting: ReadonlySet<string> = new Set(),
): CopyCost {
  const start = clampRarityIndex(startIndex);
  const target = clampRarityIndex(targetIndex);
  if (target <= start) {
    return { self: 1, faction: 0 };
  }

  const key = `${path}:${start}:${target}`;
  const cache = cacheFor(rules);
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (visiting.has(key)) {
    // A cycle in the authored ladder. Bail with the base case rather than recursing forever;
    // `rarity.spec.ts` asserts the shipped tables are well-founded.
    return { self: 1, faction: 0 };
  }
  const nested = new Set(visiting).add(key);

  const ladder = path === 'celestial' ? rules.celestial : rules.mortal;
  let total = copyCost(rules, path, start, target - 1, nested);

  for (const requirement of ladder[target - 1] ?? []) {
    const count = Math.max(Math.floor(requirement.count), 0);
    if (count === 0) {
      continue;
    }
    if (requirement.scope === 'self') {
      total = add(total, copyCost(rules, path, start, requirement.rarity, nested), count);
    } else {
      total = add(total, { self: 0, faction: fodderBaseCopies(rules, requirement.rarity) }, count);
    }
  }

  cache.set(key, total);
  return total;
}

/**
 * Base copies of a same-faction character needed to field one fodder unit at `rarityIndex`.
 *
 * Fodder is always priced as a `rare`-start character on the `mortal` ladder: only the mortal
 * ladder ever asks for fodder, and a player feeding an `elite`-start character into a rung
 * would be burning something far more expensive than the requirement asks for. The two halves
 * of the cost collapse into one number here because fodder is fungible — which faction-mate
 * supplied a copy stops mattering the moment it is consumed.
 */
export function fodderBaseCopies(rules: AscensionRules, rarityIndex: number): number {
  const cost = copyCost(rules, 'mortal', 0, rarityIndex);
  return cost.self + cost.faction;
}

/**
 * What the **next single rung** costs, in base copies, for a character currently at
 * `fromIndex`.
 *
 * The difference of two cumulative costs rather than a sum over one rung's requirements,
 * because a rung's price is quoted in ascended copies and the player pays in base ones. This
 * is the number the ascend screen shows and the number {@link canAscend} checks.
 */
export function ascensionCost(
  rules: AscensionRules,
  path: AscensionPath,
  startIndex: number,
  fromIndex: number,
): CopyCost | undefined {
  const from = clampRarityIndex(fromIndex);
  if (from >= MAX_RARITY_INDEX) {
    return undefined;
  }
  const current = copyCost(rules, path, startIndex, from);
  const next = copyCost(rules, path, startIndex, from + 1);
  return { self: next.self - current.self, faction: next.faction - current.faction };
}

/** Total base copies to take a character from its starting rarity to `ascended-5`. */
export function fullAscensionCost(
  rules: AscensionRules,
  path: AscensionPath,
  tier: CharacterTier,
): CopyCost {
  return copyCost(rules, path, startRarityIndex(tier), MAX_RARITY_INDEX);
}
