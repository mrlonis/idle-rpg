import {
  type AscensionLadder,
  type AscensionPath,
  type AscensionRules,
  type CharacterTier,
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
 * A rung costs a flat number of base copies of the character being ascended, and nothing else.
 * `ascensionCost` is an array lookup and `fullAscensionCost` is a sum over a slice — which is
 * the whole of the arithmetic, and is why this file is short.
 *
 * ## What it replaced, and the rule that came out of it
 *
 * Rungs used to be quoted in *ascended* copies — "2 copies of any character of the same faction
 * at Elite+" — against a player who only ever holds base ones. Pricing that took a memoised
 * recursion with a cycle guard, and the recursion had a property worth remembering: cost
 * **compounded** down the ladder, so the two rungs below `elite` priced everything above them.
 * A `common`-tier character came out at 216 base copies to reach `ascended-5` against an
 * `ascended`-tier character's 24, and neither number appeared anywhere a person could read it.
 *
 * The flat table gives that up on purpose. It also gives up the 9× tier gap the compounding
 * produced for free, which is why the two rungs below `rare` are authored expensive: they are
 * now the *only* thing separating what a common-tier climb costs from what an ascended-tier one
 * does. Retuning them is retuning the tier gap — see [ascension](../../../docs/ascension.md).
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
 * Where a tier starts on the ladder. Three tiers, three distinct rungs.
 *
 * | Tier        | Starts at | Skips                                |
 * | ----------- | --------- | ------------------------------------ |
 * | `common`    | `common`  | nothing                              |
 * | `legendary` | `rare`    | the two `common` rungs               |
 * | `ascended`  | `elite`   | those two, plus the two `rare` rungs |
 *
 * **This is the only place tier and cost meet, and it carries the whole tier gap.** Every rung
 * costs every character the same, so what a tier is worth in copies is exactly the price of the
 * rungs it never has to climb — 20 for `legendary`, 28 for `ascended`. That is deliberate and it
 * is calibrated: a specific common-tier character arrives roughly 3× more often from a pull than
 * a specific legendary-tier one and roughly 10× more often than an ascended-tier one, so pricing
 * the bottom of the ladder is what keeps a full climb a comparable commitment at every tier.
 *
 * Before the ladder grew a bottom, `common` and `legendary` tier shared a start and therefore
 * cost identically despite that 3× gap. They no longer do.
 */
export function startRarityIndex(tier: CharacterTier): number {
  switch (tier) {
    case 'ascended':
      return rarityIndex('elite');
    case 'legendary':
      return rarityIndex('rare');
    default:
      return 0;
  }
}

/**
 * The rung a character's **stat multiplier** is counted from, which is not always where it starts.
 *
 * `startRarityIndex` says where a tier joins the ladder; this says where the ×`perAscension`
 * ladder begins for it. They agree for `legendary` and `ascended` tier and differ for `common`,
 * whose two rungs below `rare` are a **cap gate rather than a power gate** — they raise the level
 * ceiling from 20 to 30 to 40 and hand over no multiplier at all.
 *
 * ## Why those two rungs are worth nothing in stats, deliberately
 *
 * The copies-only rewrite put them there to make common-tier characters *cost* more, not to make them
 * stronger — a pull produces a specific common-tier character roughly ten times as often as a
 * specific ascended-tier one, and the 20 copies below `rare` are what prices that in.
 *
 * Paying them a multiplier as well would have made every common-tier character ×1.6² stronger at
 * every rarity it can reach, top to bottom. That is a power grant the whole stage ladder would
 * have had to be retuned around, and it was not what the change was for. Anchoring the stat
 * ladder at `rare` instead means a common-tier character at `rare` is exactly as strong as a
 * freshly pulled one used to be — so the cost moved and nothing else did, and every stage in
 * `data/` still means what it meant.
 *
 * ⚠️ **Level caps are indexed by rarity and are not affected by this.** `rare` still caps at 40
 * and `legendary` still at 200; the two new rungs slot in underneath at 20 and 30. It is only the
 * multiplier that starts late.
 */
export function growthFloor(tier: CharacterTier): number {
  return Math.max(startRarityIndex(tier), rarityIndex('rare'));
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

/** The ladder a path walks. */
function ladderFor(rules: AscensionRules, path: AscensionPath): AscensionLadder {
  return path === 'celestial' ? rules.celestial : rules.mortal;
}

/**
 * One rung's price, defended against a table that does not have one.
 *
 * A rung a shorter ladder never authored, and a damaged one, both read as free. That is the
 * deliberate choice over throwing: content arrives here as an argument, so a malformed table is a
 * visibly wrong number a spec can catch rather than a crash on a device.
 *
 * `Math.max(NaN, 0)` is `NaN`, so the finite check has to come first — clamping alone would let a
 * damaged entry through as a price nothing can ever afford.
 */
function rungCost(ladder: AscensionLadder, from: number): number {
  const cost = ladder[from];
  return cost === undefined || !Number.isFinite(cost) ? 0 : Math.max(Math.floor(cost), 0);
}

/**
 * What the **next single rung** costs, in base copies of the character itself, for a character
 * currently at `fromIndex`. `undefined` at the top of the ladder, where there is no next rung.
 *
 * A lookup. The rung a character is leaving indexes the table directly, and a rung a shorter
 * table does not author costs nothing rather than throwing — a fixture ladder is allowed to be
 * short, and a missing rung that reads as free is a visibly wrong number rather than a crash on
 * a device.
 */
export function ascensionCost(
  rules: AscensionRules,
  path: AscensionPath,
  fromIndex: number,
): number | undefined {
  const from = clampRarityIndex(fromIndex);
  if (from >= MAX_RARITY_INDEX) {
    return undefined;
  }
  return rungCost(ladderFor(rules, path), from);
}

/**
 * Base copies to take a character from `startIndex` to `targetIndex`, **not** counting the copy
 * it already is.
 *
 * Zero when the target is at or below the start: a character already at the rarity you asked
 * about costs nothing more to get there.
 */
export function copyCost(
  rules: AscensionRules,
  path: AscensionPath,
  startIndex: number,
  targetIndex: number,
): number {
  const start = clampRarityIndex(startIndex);
  const target = clampRarityIndex(targetIndex);
  const ladder = ladderFor(rules, path);

  let total = 0;
  for (let from = start; from < target; from++) {
    total += rungCost(ladder, from);
  }
  return total;
}

/**
 * Total base copies to take a character from its tier's starting rarity to `ascended-5`,
 * **including** the first copy — the one that got it onto the ladder.
 *
 * Including it is what makes this the number a player would count: "how many of this character
 * do I need to see, in total, to max it".
 */
export function fullAscensionCost(
  rules: AscensionRules,
  path: AscensionPath,
  tier: CharacterTier,
): number {
  return 1 + copyCost(rules, path, startRarityIndex(tier), MAX_RARITY_INDEX);
}
