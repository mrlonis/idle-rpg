import { type GameState } from '../state';
import { ascensionCost } from './rarity';
import { type CharacterLookup, findOwned, type RosterResult } from './roster';
import {
  type AscensionPath,
  type AscensionRules,
  type CharacterData,
  type FactionData,
  MAX_RARITY_INDEX,
} from './types';

/**
 * Ascension: spending duplicate copies of a character to climb its rarity ladder.
 *
 * ## A rung costs copies of the character being ascended, and nothing else
 *
 * There is no second currency, no material, and no other character involved. That makes the
 * whole of this file a bounds check and an arithmetic one: does the ladder have a next rung, and
 * are there enough spare copies to pay for it.
 *
 * It used to be considerably more. Four rungs of the mortal ladder were paid in **same-faction
 * fodder** — other characters of the faction, ascended to a required rarity and consumed — which
 * meant an ascension took a *plan* saying which faction-mates to burn, a pool query to build the
 * options, a cheapest-first solver to fill it in for a player who did not want to choose, and
 * three failure modes for a plan that named the wrong character, the player's own character, or
 * not enough of either.
 *
 * What that bought was a use for a spare copy of a character nobody wanted to play. What it cost
 * was a price no player could evaluate: fodder was quoted in ascended copies, so "2 faction
 * copies at Elite+" was really 36 base copies of somebody, and the number that mattered appeared
 * nowhere. The trade was made deliberately — see [ascension](../../../docs/ascension.md).
 *
 * ## Only spare copies are ever consumed, never a character you have levelled
 *
 * The main copy of a character — the one carrying its level and its gear — is never spent. It was
 * never spendable even when fodder existed, and the reason is unchanged: a player cannot destroy
 * the level-240 character they spent a week on by tapping the wrong row, so the entire "are you
 * sure?" confirmation dance around irreversible loss does not exist in this game.
 *
 * Nothing here removes a roster entry, which is also what keeps milestone 9's resonance floor
 * monotonic.
 */

/** Faction definitions, keyed by faction id. Built by `ui/` from `data/`. */
export type FactionLookup = ReadonlyMap<string, FactionData>;

/** The ascension path a character walks, defaulting to `mortal` for unknown factions. */
export function pathFor(character: CharacterData, factions: FactionLookup): AscensionPath {
  return factions.get(character.faction)?.ascensionPath ?? 'mortal';
}

/**
 * What the next rung costs a character right now, in spare copies of itself, or `undefined` if
 * it is already at the top of the ladder.
 */
export function nextAscension(
  state: GameState,
  defId: string,
  rules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): number | undefined {
  const owned = findOwned(state, defId);
  const character = characters.get(defId);
  if (owned === undefined || character === undefined) {
    return undefined;
  }
  return ascensionCost(rules, pathFor(character, factions), owned.rarity);
}

/**
 * Ascends a character one rung, consuming that many of its own spare copies.
 *
 * Nothing is consumed unless the whole cost can be paid, so a rejected ascension leaves the
 * roster exactly as it was — there is no partial spend to reason about or refund.
 */
export function ascend(
  state: GameState,
  defId: string,
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

  const cost = ascensionCost(rules, pathFor(character, factions), owned.rarity);
  if (cost === undefined) {
    return { ok: false, reason: 'max-rarity' };
  }
  if (owned.copies < cost) {
    return { ok: false, reason: 'insufficient-copies' };
  }

  const roster = state.roster.map((entry) =>
    entry.defId === defId
      ? { ...entry, rarity: entry.rarity + 1, copies: entry.copies - cost }
      : entry,
  );

  return { ok: true, state: { ...state, roster } };
}
