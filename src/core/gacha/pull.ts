import { canAfford, debit } from '../currency';
import { num } from '../numeric';
import { resumeStream } from '../rng';
import { type FactionLookup, pathFor } from '../roster/ascend';
import { copyCost, rarityIndex, startRarityIndex } from '../roster/rarity';
import { type CharacterLookup, grantCopies } from '../roster/roster';
import { type AscensionRules, type CharacterData, type CharacterTier } from '../roster/types';
import { type GameState } from '../state';
import { type BannerData, type GachaRulesData, type PullOutcome, type PullResult } from './types';

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
 * `state.pity` counts pulls since the last ascended-tier character and is shown in the UI at
 * all times, alongside the current live rate. A gacha that hides its pity counter is hiding it
 * to make the next pull feel more urgent than it is; there is nothing to sell here, so there is
 * nothing to hide.
 */

/**
 * The live chance of an ascended-tier result on the given pull number.
 *
 * `pullNumber` is 1-based within the current pity cycle: the pull immediately after an
 * ascended-tier result is pull 1. Exported because the summon screen shows it — a player
 * should be able to read their odds off the screen rather than infer them.
 */
export function ascendedChance(rules: GachaRulesData, pullNumber: number): number {
  const { softPityStart, softPityStep, hardPity } = rules.pity;
  const base = clamp01(rules.tierWeights.ascended);
  if (pullNumber >= hardPity) {
    return 1;
  }
  if (pullNumber <= softPityStart) {
    return base;
  }
  return clamp01(base + softPityStep * (pullNumber - softPityStart));
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

/** Picks a tier from the weights, with `chance` already decided for the ascended tier. */
function pickTier(
  rules: GachaRulesData,
  roll: number,
  ascendedChanceNow: number,
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
  if (total <= 0) {
    return { tier: 'common', wasGuaranteed: false };
  }
  const span = 1 - ascendedChanceNow;
  const within = span > 0 ? (roll - ascendedChanceNow) / span : 0;
  return { tier: within < legendary / total ? 'legendary' : 'common', wasGuaranteed: false };
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
  let sparkEarned = 0;

  for (let i = 0; i < pulls; i++) {
    // Three draws, every time, whatever happens below. See the note at the top of this file.
    const tierRoll = stream.next();
    const pickRoll = stream.next();
    const upgradeRoll = stream.next();

    const chance = ascendedChance(rules, pity + 1);
    const rolled = pickTier(rules, tierRoll, chance);

    const candidates = pool.filter((character) => character.tier === rolled.tier);
    const from = candidates.length > 0 ? candidates : pool;
    const character = from[Math.min(Math.floor(pickRoll * from.length), from.length - 1)];

    // **The character's own tier is what counts, not the tier that was rolled.** They differ
    // whenever a banner's pool has nobody at the rolled tier and the draw falls back to the
    // whole pool. Reporting the rolled tier there would be a lie with teeth: pity would reset on
    // a pull that produced no ascended-tier character at all, and a narrowed banner could hand
    // out an ascended-tier reset for a common-tier unit. Everything downstream — pity, spark,
    // the elite upgrade — keys off what the player actually received.
    const tier = character.tier;
    const wasGuaranteed = rolled.wasGuaranteed && tier === 'ascended';

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

    results.push({
      defId: character.id,
      name: character.name,
      tier,
      rarity: upgraded ? rarityIndex('elite') : startRarityIndex(character.tier),
      isNew: granted.isNew,
      copies: granted.overflow > 0 ? 0 : worth,
      spark,
      pity,
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
      pullCount: next.pullCount + pulls,
    },
    results,
  };
}
