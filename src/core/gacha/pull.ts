import { canAfford, debit } from '../currency';
import { num } from '../numeric';
import { resumeStream } from '../rng';
import { type FactionLookup, pathFor } from '../roster/ascend';
import { copyCost, rarityIndex, startRarityIndex } from '../roster/rarity';
import { type CharacterLookup, grantCopies } from '../roster/roster';
import { type AscensionRules, type CharacterData, type CharacterTier } from '../roster/types';
import { type GameState } from '../state';
import {
  type BannerData,
  type GachaRulesData,
  type PityCurveData,
  type PullOutcome,
  type PullResult,
} from './types';

/**
 * The gacha draw.
 *
 * ## Exactly three draws per pull, always
 *
 * A pull consumes three values from the main stream — tier, character, elite upgrade —
 * **regardless of which branch it takes**. The elite-upgrade roll is drawn even for results
 * that can never be upgraded, and thrown away.
 *
 * That is the same discipline `damage.ts` applies to crits, for the same reason: if RNG
 * consumption depended on the outcome, `rng.calls` would no longer be enough to describe where
 * a run is in its sequence, and a save could not be resumed in O(1) or replayed for a bug
 * report. Three wasted bits of entropy is a very cheap price for "the pull sequence is a pure
 * function of seed and call count".
 *
 * Pulls advance `rng.calls`. Combat never does — it draws from a sub-stream derived by
 * `battleSeed` — so fighting a battle between two pulls cannot shift what the next pull gives.
 *
 * ## Pity is global and always visible
 *
 * `state.pity` counts pulls since the last ascended-tier character, `state.legendaryPity` pulls
 * since the last legendary-tier one **or better**, and both are shown in the UI at all times
 * alongside the current live rate. A gacha that hides its pity counter is hiding it to make the
 * next pull feel more urgent than it is; there is nothing to sell here, so there is nothing to
 * hide.
 *
 * ## Two counters, and the second one is a floor rather than a second draw
 *
 * The legendary curve does not get a roll of its own. It raises the **threshold** the single tier
 * roll is compared against, which is what keeps consumption at three draws per pull however many
 * curves are authored — a second curve that drew a second value would have broken the invariant
 * above the moment it shipped.
 *
 * ⚠️ **At base rate the floor is exactly the proportional split and therefore binds on nothing.**
 * With weights summing to 1, `ascended + legendary` *is* what the proportional rescale in
 * {@link pickTier} produces at the base ascended rate, so a run inside the flat stretch of both
 * curves draws precisely what it drew before the legendary curve existed. The floor is a floor:
 * it can only ever raise the legendary threshold, never lower it, so the two curves cannot fight
 * over the same roll and deep ascended pity is never *undone* by shallow legendary pity.
 */

/**
 * The live chance of a result at or above the tier `curve` guards, on the given pull number.
 *
 * `pullNumber` is 1-based within that curve's own cycle: the pull immediately after the counter
 * cleared is pull 1.
 */
function pityChance(curve: PityCurveData, base: number, pullNumber: number): number {
  const { softPityStart, softPityStep, hardPity } = curve;
  if (pullNumber >= hardPity) {
    return 1;
  }
  if (pullNumber <= softPityStart) {
    return clamp01(base);
  }
  return clamp01(base + softPityStep * (pullNumber - softPityStart));
}

/**
 * The live chance of an ascended-tier result on the given pull number.
 *
 * Exported because the summon screen shows it — a player should be able to read their odds off
 * the screen rather than infer them.
 */
export function ascendedChance(rules: GachaRulesData, pullNumber: number): number {
  return pityChance(rules.pity.ascended, rules.tierWeights.ascended, pullNumber);
}

/**
 * The live floor under a legendary-**or-better** result on the given pull number.
 *
 * A floor rather than a rate: what a pull actually resolves against is the larger of this and the
 * proportional split, which is why this is not simply "the chance of a legendary". At the base
 * rate the two are equal by construction — see the note at the top of this file — so this reads as
 * a rate everywhere it is displayed, and only diverges once the ramp has started.
 *
 * The base is `ascended + legendary` because an ascended-tier result is not a miss on the promise
 * this curve makes. Counting it as one would let a player who just pulled the best thing on the
 * banner be told they are owed a consolation prize for it.
 */
export function legendaryChance(rules: GachaRulesData, pullNumber: number): number {
  const base = rules.tierWeights.ascended + rules.tierWeights.legendary;
  return pityChance(rules.pity.legendary, base, pullNumber);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Base copies of a character it would take to reach `elite` from its own starting rarity.
 *
 * What an Elite-upgraded duplicate is worth, and it is worth a great deal: both ladders are
 * identical below `elite`, and that stretch is deliberately the expensive one — it is the only
 * thing separating what a common-tier climb costs from an ascended-tier one. A legendary-tier
 * character skips 8 copies' worth by arriving upgraded.
 *
 * At least 1, so an upgrade always counts for something even against a fixture ladder that
 * prices the stretch at nothing.
 */
function eliteUpgradeCopies(
  rules: AscensionRules,
  character: CharacterData,
  factions: FactionLookup,
): number {
  const start = startRarityIndex(character.tier);
  const elite = rarityIndex('elite');
  if (elite <= start) {
    return 1;
  }
  return Math.max(copyCost(rules, pathFor(character, factions), start, elite), 1);
}

/**
 * Picks a tier from the weights, with both curves already evaluated for this pull.
 *
 * One roll, two thresholds. `ascendedChanceNow` is the first; the second is the larger of the
 * proportional split and `legendaryFloorNow`, which is what makes the legendary curve a floor
 * rather than a competing draw.
 */
function pickTier(
  rules: GachaRulesData,
  roll: number,
  ascendedChanceNow: number,
  legendaryFloorNow: number,
): { tier: CharacterTier; wasGuaranteed: boolean } {
  if (roll < ascendedChanceNow) {
    return { tier: 'ascended', wasGuaranteed: ascendedChanceNow >= 1 };
  }
  // The remainder is split between the other two in proportion to their authored weights, so
  // the shape of the pool a player sees does not lurch as pity inflates the top rate — a
  // pity-heavy pull is still roughly three commons for every legendary.
  const legendary = Math.max(rules.tierWeights.legendary, 0);
  const common = Math.max(rules.tierWeights.common, 0);
  const total = legendary + common;
  const proportional =
    total > 0
      ? ascendedChanceNow + (1 - ascendedChanceNow) * (legendary / total)
      : ascendedChanceNow;
  const legendaryChanceNow = Math.max(proportional, clamp01(legendaryFloorNow));
  if (roll < legendaryChanceNow) {
    return { tier: 'legendary', wasGuaranteed: legendaryChanceNow >= 1 };
  }
  return { tier: 'common', wasGuaranteed: false };
}

/**
 * Resolves `count` pulls against a banner.
 *
 * The whole batch is paid for up front. A ten-pull that ran out of crystals partway would be
 * a ten-pull that sometimes silently became a six-pull, and the player would have no way to
 * tell which.
 */
export function pull(
  state: GameState,
  banner: BannerData,
  count: number,
  rules: GachaRulesData,
  ascensionRules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): PullOutcome {
  const pulls = Math.floor(count);
  if (!Number.isFinite(pulls) || pulls <= 0) {
    return { ok: false, reason: 'bad-count' };
  }

  const pool =
    banner.pool.length === 0
      ? [...characters.values()]
      : banner.pool
          .map((id) => characters.get(id))
          .filter((character): character is CharacterData => character !== undefined);
  if (pool.length === 0) {
    return { ok: false, reason: 'empty-pool' };
  }

  const cost = { summons: num(rules.pullCost).mul(pulls) };
  if (!canAfford(state.wallet, cost)) {
    return { ok: false, reason: 'insufficient-currency' };
  }

  const stream = resumeStream(state.rng);
  const results: PullResult[] = [];
  let next: GameState = { ...state, wallet: debit(state.wallet, cost) };
  let pity = Math.max(Math.floor(next.pity), 0);
  let legendaryPity = Math.max(Math.floor(next.legendaryPity), 0);
  let sparkEarned = 0;

  for (let i = 0; i < pulls; i++) {
    // Three draws, every time, whatever happens below. See the note at the top of this file.
    const tierRoll = stream.next();
    const pickRoll = stream.next();
    const upgradeRoll = stream.next();

    const chance = ascendedChance(rules, pity + 1);
    const floor = legendaryChance(rules, legendaryPity + 1);
    const rolled = pickTier(rules, tierRoll, chance, floor);

    const candidates = pool.filter((character) => character.tier === rolled.tier);
    const from = candidates.length > 0 ? candidates : pool;
    const character = from[Math.min(Math.floor(pickRoll * from.length), from.length - 1)];

    // **The character's own tier is what counts, not the tier that was rolled.** They differ
    // whenever a banner's pool has nobody at the rolled tier and the draw falls back to the
    // whole pool. Reporting the rolled tier there would be a lie with teeth: pity would reset on
    // a pull that produced no ascended-tier character at all, and a narrowed banner could hand
    // out an ascended-tier reset for a common-tier unit. Everything downstream — both pity
    // counters, spark, the elite upgrade — keys off what the player actually received.
    const tier = character.tier;
    // A guarantee the fallback did not honour is not a guarantee. Compared against the rolled
    // tier rather than named outright, so this stays correct for whichever curve was certain.
    const wasGuaranteed = rolled.wasGuaranteed && tier === rolled.tier;

    const upgraded = tier === 'legendary' && upgradeRoll < clamp01(rules.eliteUpgradeChance);
    const worth = upgraded ? eliteUpgradeCopies(ascensionRules, character, factions) : 1;

    const granted = grantCopies(
      next,
      character,
      worth,
      upgraded ? rarityIndex('elite') : undefined,
    );
    next = granted.state;

    const spark = granted.overflow * Math.max(rules.sparkPerCopy[tier] ?? 0, 0);
    sparkEarned += spark;
    pity = tier === 'ascended' ? 0 : pity + 1;
    // Cleared by legendary **or better**. An ascended-tier result is not a miss on this promise.
    legendaryPity = tier === 'common' ? legendaryPity + 1 : 0;

    results.push({
      defId: character.id,
      name: character.name,
      tier,
      rarity: upgraded ? rarityIndex('elite') : startRarityIndex(character.tier),
      isNew: granted.isNew,
      copies: granted.overflow > 0 ? 0 : worth,
      spark,
      pity,
      legendaryPity,
      wasGuaranteed,
    });
  }

  return {
    ok: true,
    state: {
      ...next,
      wallet:
        sparkEarned > 0
          ? { ...next.wallet, spark: next.wallet.spark.add(num(sparkEarned)) }
          : next.wallet,
      rng: stream.commit(),
      pity,
      legendaryPity,
      pullCount: next.pullCount + pulls,
    },
    results,
  };
}
