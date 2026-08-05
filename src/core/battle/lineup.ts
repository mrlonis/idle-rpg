import { ATB_THRESHOLD } from './clock';
import {
  type CombatStats,
  type LineupBonus,
  type LineupFactionCount,
  type LineupLadderStepData,
  type LineupRules,
  type LineupRulesData,
  type LineupSummary,
  type LineupTierData,
  type LineupTierMatch,
} from './types';

/**
 * The lineup bonus: what the party you brought is worth, before the fight starts.
 *
 * Three mechanisms stack — a **ladder of shapes** ("three of one faction", "three of one and two
 * of another"), a **rally faction** paying a flat share per member, and a **ladder faction** with
 * a cumulative track of its own. A **wildcard faction** counts as any faction, on the shapes
 * only. All four are named in `data/`; nothing here knows what a Monster is.
 *
 * ## Why this is allowed to exist
 *
 * The project rules forbid exactly this shape of bonus — "+10% if two Fire units" — because a
 * bonus for your own line-up asks nothing of the encounter and only produces a new single optimal
 * team. The override is deliberate and it rests on one observation: **a mono-faction bonus does
 * not create one optimal team, it creates seven.** Which of the seven to field is decided by the
 * matchup matrix, which is a statement about the fight in front of you — so the property the rule
 * was protecting survives. The player never chooses between the bonus and the matchup; they keep
 * the bonus and switch which mono-faction team carries it.
 *
 * ## The wildcard counts on the shapes and nowhere else
 *
 * A wildcard that also filled in for the rally and the ladder faction would be strictly the best
 * character in the game at every roster size, and the factions it stood in for would stop being
 * decisions. Restricting it to {@link LineupRulesData.tiers} keeps the other two tracks a real
 * commitment, and it is what the milestone's design note says: *counts as any faction for the
 * purpose of the ladder above*.
 *
 * ## Nothing here can fail to terminate, and one field needed checking
 *
 * Every quantity is bounded where the stat it lands on is bounded: `critChance` back into
 * `[0, 1]`, and ⚠️ `haste` back into `[1, ATB_THRESHOLD]`, which is the same termination argument
 * the authored value carries — above the threshold a combatant banks two actions in one tick. The
 * `hp`, `atk` and `def` multipliers are quantities and need no ceiling; a party that is merely
 * hard to kill is bounded by the battle timer, and the balance sweep's `timedOut` assertion is
 * what notices if one becomes so.
 */

/** Nothing qualified. Every field zero, so applying it is the identity. */
export const NO_LINEUP_BONUS: LineupBonus = {
  attack: 0,
  health: 0,
  defence: 0,
  critChance: 0,
  critDamageAmp: 0,
  haste: 0,
  injuredEnergyRegen: 0,
};

/** A composition that reached nothing — what an empty or enemy formation resolves to. */
export const NO_LINEUP: LineupSummary = {
  bonus: NO_LINEUP_BONUS,
  tier: null,
  counts: [],
  rallyCount: 0,
  ladderCount: 0,
};

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
}

/** A non-negative authored share, treating damaged content as nothing rather than as a penalty. */
function share(value: number | undefined): number {
  return value === undefined ? 0 : clamp(value, 0, Number.MAX_SAFE_INTEGER, 0);
}

/** A non-negative whole count of party members a rung asks for. */
function members(value: number): number {
  return Math.floor(clamp(value, 0, Number.MAX_SAFE_INTEGER, 0));
}

function toTier(raw: LineupTierData): LineupTierData {
  return {
    largest: members(raw.largest),
    second: members(raw.second),
    attack: share(raw.attack),
    health: share(raw.health),
  };
}

/**
 * Clamps one ladder step.
 *
 * Absent stays absent — a step says only what it adds — so an undefined field survives as
 * undefined rather than becoming an explicit zero nobody authored.
 */
function toStep(raw: LineupLadderStepData): LineupLadderStepData {
  return {
    ...(raw.defence === undefined ? {} : { defence: share(raw.defence) }),
    ...(raw.injuredEnergyRegen === undefined
      ? {}
      : { injuredEnergyRegen: share(raw.injuredEnergyRegen) }),
    // A rating is a probability and cannot exceed certainty, so the step is bounded by the stat.
    ...(raw.critChance === undefined ? {} : { critChance: clamp(raw.critChance, 0, 1, 0) }),
    ...(raw.critDamageAmp === undefined ? {} : { critDamageAmp: share(raw.critDamageAmp) }),
    // ⚠️ Bounded on its own as well as jointly, so a damaged step cannot overflow the gauge sum
    // before `applyLineupBonus` re-clamps it.
    ...(raw.haste === undefined ? {} : { haste: clamp(raw.haste, 0, ATB_THRESHOLD, 0) }),
  };
}

/** Parses the authored lineup rules. */
export function toLineupRules(raw: LineupRulesData): LineupRules {
  return {
    tiers: raw.tiers.map(toTier),
    wildcard: raw.wildcard,
    rally: {
      faction: raw.rally.faction,
      attack: share(raw.rally.attack),
      health: share(raw.rally.health),
    },
    ladder: { faction: raw.ladder.faction, steps: raw.ladder.steps.map(toStep) },
    // A fraction of a health bar. Zero disables the conditional bonus outright rather than
    // making it permanent, which is the safe direction for a damaged value.
    injuredBelow: clamp(raw.injuredBelow, 0, 1, 0),
  };
}

/**
 * The party's factions, counted, in the order they were fielded.
 *
 * Order of appearance rather than a sort, because it is the only ordering `core/` has: faction
 * order is authored in `data/` and the simulation never sees it. It is used solely to break ties
 * between two factions that qualify a party equally, so it decides wording, never numbers.
 */
function tally(factions: readonly string[]): readonly LineupFactionCount[] {
  const counts = new Map<string, number>();
  for (const faction of factions) {
    counts.set(faction, (counts.get(faction) ?? 0) + 1);
  }
  return [...counts].map(([faction, count]) => ({ faction, count }));
}

/**
 * Wildcards it would take to field `n` of `faction`.
 *
 * The wildcard faction is the interesting case and it is why this is a function rather than a
 * subtraction: reaching *n* wildcards **spends** *n* of them, because there they are the members
 * rather than stand-ins. Three Angels are three Angels; they are not also three Humans.
 */
function wildcardsFor(
  entry: LineupFactionCount | undefined,
  faction: string,
  wildcard: string,
  n: number,
) {
  if (faction === wildcard) {
    return n;
  }
  return Math.max(n - (entry?.count ?? 0), 0);
}

/** Whether `a` pays more than `b`: most attack, then most health. A total order, so it is stable. */
function pays(a: LineupTierMatch, b: LineupTierMatch | null): boolean {
  if (b === null) {
    return true;
  }
  return a.attack !== b.attack ? a.attack > b.attack : a.health > b.health;
}

/**
 * The best-paying rung this composition reaches, and the factions it reaches it on.
 *
 * **Every assignment is tried**, rather than the cheapest primary being assumed to be the right
 * one. Picking the primary greedily is correct only while every rung asks for at least as many of
 * its first faction as of its second, which is true of the authored table and is exactly the kind
 * of invariant that goes stale silently. A party is at most five and there are seven factions, so
 * exhaustive is a handful of comparisons and needs no invariant at all.
 *
 * Rungs are likewise all tried and the richest match wins, rather than the list being read as
 * ordered — the authored table has a mono-four paying more health than a three-and-two for the
 * same attack, and a rule that took the last match would make that depend on where somebody put a
 * row.
 *
 * Ties are broken towards the assignment spending **fewest wildcards**, then towards the order
 * the factions were fielded in. That is what makes three Humans and two wildcards report as five
 * Humans — the faction the player actually brought — rather than as whichever label came first.
 */
function bestTier(
  tiers: readonly LineupTierData[],
  counts: readonly LineupFactionCount[],
  wildcard: string,
): LineupTierMatch | null {
  const wildcards = counts.find((entry) => entry.faction === wildcard)?.count ?? 0;
  let best: LineupTierMatch | null = null;
  let bestSpent = 0;

  const consider = (match: LineupTierMatch, spent: number): void => {
    if (pays(match, best) || (best !== null && !pays(best, match) && spent < bestSpent)) {
      best = match;
      bestSpent = spent;
    }
  };

  for (const tier of tiers) {
    if (tier.largest <= 0) {
      continue;
    }
    for (const primary of counts) {
      const spentOnPrimary = wildcardsFor(primary, primary.faction, wildcard, tier.largest);
      if (spentOnPrimary > wildcards) {
        continue;
      }

      if (tier.second <= 0) {
        consider(
          {
            faction: primary.faction,
            count: tier.largest,
            secondFaction: null,
            secondCount: 0,
            attack: tier.attack,
            health: tier.health,
          },
          spentOnPrimary,
        );
        continue;
      }

      for (const secondary of counts) {
        if (secondary.faction === primary.faction) {
          continue;
        }
        const spent =
          spentOnPrimary + wildcardsFor(secondary, secondary.faction, wildcard, tier.second);
        if (spent > wildcards) {
          continue;
        }
        consider(
          {
            faction: primary.faction,
            count: tier.largest,
            secondFaction: secondary.faction,
            secondCount: tier.second,
            attack: tier.attack,
            health: tier.health,
          },
          spent,
        );
      }
    }
  }

  return best;
}

/**
 * Resolves a formation's factions into what its composition is worth.
 *
 * Takes a flat list rather than a `FormationData` because rows have nothing to do with it: where
 * a character stands is the row bonus's business, and who you brought is this one's.
 */
export function lineupBonus(factions: readonly string[], rules: LineupRules): LineupSummary {
  const counts = tally(factions);
  const tier = bestTier(rules.tiers, counts, rules.wildcard);
  const count = (faction: string): number =>
    counts.find((entry) => entry.faction === faction)?.count ?? 0;

  const rallyCount = count(rules.rally.faction);
  const ladderCount = count(rules.ladder.faction);
  // Steps past the party size simply never fire, so a ladder authored longer than a formation
  // costs nothing and needs no guard of its own.
  const steps = rules.ladder.steps.slice(0, ladderCount);
  const total = (read: (step: LineupLadderStepData) => number | undefined): number =>
    steps.reduce((sum, step) => sum + (read(step) ?? 0), 0);

  return {
    bonus: {
      // Additive between the two tracks rather than multiplicative: a screen has to be able to
      // say "+35% attack" as one number, and 1.25 × 1.10 is not a number anybody reads off a
      // pair of authored percentages.
      attack: (tier?.attack ?? 0) + rallyCount * rules.rally.attack,
      health: (tier?.health ?? 0) + rallyCount * rules.rally.health,
      defence: total((step) => step.defence),
      critChance: total((step) => step.critChance),
      critDamageAmp: total((step) => step.critDamageAmp),
      haste: total((step) => step.haste),
      injuredEnergyRegen: total((step) => step.injuredEnergyRegen),
    },
    tier,
    counts,
    rallyCount,
    ladderCount,
  };
}

/** Whether a bonus would change any stat, so the common case costs no `Decimal` arithmetic. */
export function isNeutralLineup(bonus: LineupBonus): boolean {
  return (
    bonus.attack === 0 &&
    bonus.health === 0 &&
    bonus.defence === 0 &&
    bonus.critChance === 0 &&
    bonus.critDamageAmp === 0 &&
    bonus.haste === 0
  );
}

/**
 * Folds a lineup bonus into a stat block.
 *
 * Applied **after** the row bonus, which is the order the two read in: what a character is, then
 * where it is standing, then who it was brought with.
 *
 * {@link LineupBonus.injuredEnergyRegen} is deliberately absent — it is conditional on current
 * health, and a stat block is fixed for the whole fight. The simulation applies that one at the
 * top of a turn.
 */
export function applyLineupBonus(stats: CombatStats, bonus: LineupBonus): CombatStats {
  if (isNeutralLineup(bonus)) {
    return stats;
  }
  return {
    ...stats,
    hp: stats.hp.mul(1 + bonus.health),
    atk: stats.atk.mul(1 + bonus.attack),
    def: stats.def.mul(1 + bonus.defence),
    critChance: clamp(stats.critChance + bonus.critChance, 0, 1, stats.critChance),
    critDamageAmp: Math.max(stats.critDamageAmp + bonus.critDamageAmp, 0),
    // ⚠️ Re-clamped rather than trusted. `effectiveSpeed` clamps the sum again when a status is
    // moving haste, but `base` is documented as already being in range and half the simulation
    // reads it directly.
    haste: clamp(stats.haste + bonus.haste, 1, ATB_THRESHOLD, stats.haste),
  };
}
