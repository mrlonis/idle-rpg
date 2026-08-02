import { type GameState } from '../state';
import { ascensionCost, fodderBaseCopies, startRarityIndex } from './rarity';
import { type CharacterLookup, findOwned, type RosterResult } from './roster';
import {
  type AscensionPath,
  type AscensionRules,
  type CharacterData,
  type CopyCost,
  type FactionData,
  MAX_RARITY_INDEX,
} from './types';

/**
 * Ascension: spending duplicate copies to climb the rarity ladder.
 *
 * ## Only spares are ever consumed, never a character you have levelled
 *
 * A rung quoted as "2 copies of any character of the same faction at Elite+" is paid here out
 * of faction-mates' **spare** copies, resolved into base copies by `rarity.ts`. The main copy
 * of a character — the one carrying its level — is never eligible as fodder.
 *
 * That is a deliberate departure from the genre, and it buys two things. A player can never
 * destroy the level-240 character they spent a week on by tapping the wrong row, so the whole
 * "are you sure?" confirmation dance around irreversible loss simply does not exist. And a
 * faction-mate stays simultaneously a playable character and an ascension resource, which is
 * what makes a common-tier pull genuinely good news rather than a consolation prize.
 *
 * ## Fodder is valued, not counted
 *
 * The fodder tables are quoted in Rare copies, so one base copy of a `rare`-start character is
 * worth exactly 1. A base copy of an `ascended`-tier character starts at Elite, which is 9
 * Rare copies deep, so it counts for 9. Feeding one is therefore legal, efficient by the
 * count, and a terrible idea by the value — which is why {@link autoFodderPlan} reaches for
 * the cheapest spares first and the UI shows what a plan actually costs.
 */

/** Faction definitions, keyed by faction id. Built by `ui/` from `data/`. */
export type FactionLookup = ReadonlyMap<string, FactionData>;

/**
 * Which spares to burn, keyed by character id, counted in **base copies**.
 *
 * The player chooses. A rung's faction clause names no particular character, and picking
 * between "burn nine Mira copies" and "burn one Aurelia copy" is a real decision about what
 * the roster is for.
 */
export interface AscensionPlan {
  readonly fodder: Readonly<Record<string, number>>;
}

/** One eligible source of fodder, as the ascend screen lists them. */
export interface FodderOption {
  readonly defId: string;
  readonly name: string;
  /** Spare base copies the player holds. */
  readonly available: number;
  /** What one of those base copies is worth against the requirement, in Rare copies. */
  readonly valuePerCopy: number;
}

/** The ascension path a character walks, defaulting to `mortal` for unknown factions. */
export function pathFor(character: CharacterData, factions: FactionLookup): AscensionPath {
  return factions.get(character.faction)?.ascensionPath ?? 'mortal';
}

/**
 * What one base copy of a character is worth against a faction requirement.
 *
 * Its starting rarity priced through the fodder table: 1 for a `rare`-start character, 9 for
 * an `elite`-start one.
 */
export function fodderValue(rules: AscensionRules, character: CharacterData): number {
  return fodderBaseCopies(rules, startRarityIndex(character.tier));
}

/**
 * What the next rung costs a character right now, or `undefined` if it is already at the top.
 */
export function nextAscension(
  state: GameState,
  defId: string,
  rules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): CopyCost | undefined {
  const owned = findOwned(state, defId);
  const character = characters.get(defId);
  if (owned === undefined || character === undefined) {
    return undefined;
  }
  return ascensionCost(
    rules,
    pathFor(character, factions),
    startRarityIndex(character.tier),
    owned.rarity,
  );
}

/**
 * Every faction-mate whose spares could pay part of a rung.
 *
 * Excludes the character being ascended: its own copies are already spent against the rung's
 * `self` clause, and letting them count twice would silently halve the price.
 */
export function fodderPool(
  state: GameState,
  defId: string,
  rules: AscensionRules,
  characters: CharacterLookup,
): readonly FodderOption[] {
  const character = characters.get(defId);
  if (character === undefined) {
    return [];
  }
  const options: FodderOption[] = [];
  for (const owned of state.roster) {
    if (owned.defId === defId || owned.copies <= 0) {
      continue;
    }
    const mate = characters.get(owned.defId);
    if (mate?.faction !== character.faction) {
      continue;
    }
    options.push({
      defId: mate.id,
      name: mate.name,
      available: owned.copies,
      valuePerCopy: fodderValue(rules, mate),
    });
  }
  return options;
}

/**
 * Builds the cheapest plan that satisfies a rung, or `undefined` if the roster cannot.
 *
 * Cheapest by **value**, not by count: spares worth 1 Rare copy each are spent before spares
 * worth 9, so a player who taps "ascend" without thinking about it does not lose an
 * ascended-tier duplicate to a requirement that a handful of commons would have covered.
 *
 * Within an equal value, the deepest pile is drawn from first. Spreading the cost thin across
 * every faction-mate would leave several piles too small to be useful later, where taking it
 * from one leaves the rest intact.
 */
export function autoFodderPlan(
  state: GameState,
  defId: string,
  rules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): AscensionPlan | undefined {
  const cost = nextAscension(state, defId, rules, characters, factions);
  if (cost === undefined) {
    return undefined;
  }
  if (cost.faction <= 0) {
    return { fodder: {} };
  }

  const candidates = [...fodderPool(state, defId, rules, characters)].sort(
    (a, b) => a.valuePerCopy - b.valuePerCopy || b.available - a.available,
  );

  const fodder: Record<string, number> = {};
  let remaining = cost.faction;
  for (const option of candidates) {
    if (remaining <= 0) {
      break;
    }
    const wanted = Math.min(option.available, Math.ceil(remaining / option.valuePerCopy));
    if (wanted > 0) {
      fodder[option.defId] = wanted;
      remaining -= wanted * option.valuePerCopy;
    }
  }
  return remaining > 0 ? undefined : { fodder };
}

/**
 * Ascends a character one rung, consuming its own spare copies and the planned fodder.
 *
 * The plan is checked in full before anything is consumed, so a rejected ascension leaves the
 * roster exactly as it was — there is no partial spend to reason about or refund.
 */
export function ascend(
  state: GameState,
  defId: string,
  plan: AscensionPlan,
  rules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): RosterResult {
  const owned = findOwned(state, defId);
  if (owned === undefined) {
    return { ok: false, reason: 'not-owned' };
  }
  const character = characters.get(defId);
  if (character === undefined) {
    return { ok: false, reason: 'unknown-character' };
  }
  if (owned.rarity >= MAX_RARITY_INDEX) {
    return { ok: false, reason: 'max-rarity' };
  }

  const cost = ascensionCost(
    rules,
    pathFor(character, factions),
    startRarityIndex(character.tier),
    owned.rarity,
  );
  if (cost === undefined) {
    return { ok: false, reason: 'max-rarity' };
  }
  if (owned.copies < cost.self) {
    return { ok: false, reason: 'insufficient-copies' };
  }

  let contributed = 0;
  const spend = new Map<string, number>();
  for (const [fodderId, rawCount] of Object.entries(plan.fodder)) {
    const count = Math.floor(rawCount);
    if (!Number.isFinite(count) || count <= 0) {
      continue;
    }
    if (fodderId === defId) {
      return { ok: false, reason: 'fodder-is-self' };
    }
    const mate = characters.get(fodderId);
    if (mate === undefined) {
      return { ok: false, reason: 'unknown-character' };
    }
    if (mate.faction !== character.faction) {
      return { ok: false, reason: 'wrong-faction' };
    }
    const ownedMate = findOwned(state, fodderId);
    if (ownedMate === undefined) {
      return { ok: false, reason: 'not-owned' };
    }
    if (ownedMate.copies < count) {
      return { ok: false, reason: 'insufficient-fodder' };
    }
    spend.set(fodderId, count);
    contributed += count * fodderValue(rules, mate);
  }

  if (contributed < cost.faction) {
    return { ok: false, reason: 'insufficient-fodder' };
  }

  const roster = state.roster.map((entry) => {
    if (entry.defId === defId) {
      return { ...entry, rarity: entry.rarity + 1, copies: entry.copies - cost.self };
    }
    const burned = spend.get(entry.defId);
    return burned === undefined ? entry : { ...entry, copies: entry.copies - burned };
  });

  return { ok: true, state: { ...state, roster } };
}
