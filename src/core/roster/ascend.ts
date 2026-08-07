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

/** What one character gained in an {@link ascendAll} pass. */
export interface AscensionStep {
  readonly defId: string;
  /** The rung it was standing on. */
  readonly from: number;
  /** The rung it finished on. Always above {@link from} — a step that climbed nothing is not one. */
  readonly to: number;
  /** Spare copies consumed getting there. */
  readonly copies: number;
}

/** What a whole-roster pass did, and the run it left behind. */
export interface AscensionSummary {
  readonly state: GameState;
  /** One entry per character that climbed, in roster order. Empty when nothing could. */
  readonly steps: readonly AscensionStep[];
}

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

/**
 * Ascends every character as far as its own spare copies reach, in a single pass.
 *
 * ## Why this can be a loop rather than a decision
 *
 * A rung is paid entirely out of copies of the character climbing it, and copies have no other
 * use until `ascended-5` turns them into spark. So no two characters ever compete for the same
 * resource, and spending a copy costs the player nothing they could have spent elsewhere — which
 * is what makes "ascend everything" a well-defined answer rather than a strategy. There is
 * nothing here for a solver to optimise and nothing for a confirmation dialog to warn about.
 *
 * That is a property of the copies-only pricing, not a permanent one. If a rung ever costs
 * something shared — a currency, another character, anything with a second claim on it — this
 * stops being a loop and becomes a choice, and it should go back to the player rather than be
 * resolved greedily here.
 *
 * ⚠️ **The climb is bounded by the ladder, never by the copies.** A rung a short or damaged table
 * does not author reads as *free* (see `rungCost` in `rarity.ts`), so a loop that only stopped
 * when the copies ran out would not stop at all against one. Each iteration that continues climbs
 * exactly one rung and the ladder has `MAX_RARITY_INDEX` of them, so the bound is structural.
 *
 * Returns a {@link AscensionSummary} rather than a `RosterResult`: a batch over the whole roster
 * has no single reason to refuse, and "nobody could ascend" is an outcome to report rather than a
 * failure. Characters this build no longer ships are skipped, exactly as {@link ascend} refuses
 * them one at a time.
 */
export function ascendAll(
  state: GameState,
  rules: AscensionRules,
  characters: CharacterLookup,
  factions: FactionLookup,
): AscensionSummary {
  const steps: AscensionStep[] = [];

  const roster = state.roster.map((entry) => {
    const character = characters.get(entry.defId);
    if (character === undefined) {
      return entry;
    }
    const path = pathFor(character, factions);

    let rarity = entry.rarity;
    let copies = entry.copies;
    for (let rung = 0; rung < MAX_RARITY_INDEX; rung++) {
      const cost = ascensionCost(rules, path, rarity);
      if (cost === undefined || copies < cost) {
        break;
      }
      rarity += 1;
      copies -= cost;
    }

    if (rarity === entry.rarity) {
      return entry;
    }
    steps.push({
      defId: entry.defId,
      from: entry.rarity,
      to: rarity,
      copies: entry.copies - copies,
    });
    return { ...entry, rarity, copies };
  });

  // The state itself when nothing moved, rather than an equal copy of it. `ui/` publishes what it
  // is handed, so returning a new object would redraw every screen watching the run to show it
  // the same numbers.
  return { state: steps.length === 0 ? state : { ...state, roster }, steps };
}
