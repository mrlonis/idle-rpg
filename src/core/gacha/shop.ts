import { canAfford, debit } from '../currency';
import { num } from '../numeric';
import { startRarityIndex } from '../roster/rarity';
import { type CharacterLookup, findOwned, grantCopies, type RosterResult } from '../roster/roster';
import { type CharacterData } from '../roster/types';
import { type GameState } from '../state';

/**
 * The spark shop.
 *
 * Spark is minted only by copies of a character already at `ascended-5` — a duplicate with
 * nowhere left to go. So this is late-game overflow, and explicitly **not** the escape valve
 * for early bad luck: pity is that, and it fires long before anyone has maxed anything.
 *
 * Two kinds of offer, because there are two different shortages. A player who never saw a
 * character needs `character` to get one at all; a player two copies short of an ascension
 * needs `copy` to finish it. Targeted copies are priced well above a whole new character on
 * purpose — breadth is cheap and finishing a specific ladder is the expensive thing.
 */

/** A shop offer as authored in `data/`. */
export interface ShopOfferData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /**
   * `copy` grants one base copy of a character the player already owns; `character` grants a
   * character they do not.
   */
  readonly kind: 'copy' | 'character';
  /**
   * For `copy` offers, which characters are eligible — by the rarity they *start* at.
   *
   * `rare` covers common- and legendary-tier characters, `elite` the ascended tier. A base
   * copy of an ascended-tier character is nine Rare copies deep by the fodder table and is the
   * scarcest thing in the game, which is what the price difference is measuring.
   */
  readonly rarity?: string;
  readonly cost: number;
}

/** Why a purchase could not be made. */
export type ShopFailure =
  | 'unknown-offer'
  | 'unknown-character'
  | 'insufficient-currency'
  | 'not-owned'
  | 'already-owned'
  | 'ineligible-character';

export type ShopResult = RosterResult | { readonly ok: false; readonly reason: ShopFailure };

/** `true` when `character` may be bought through `offer`. */
export function isEligible(offer: ShopOfferData, character: CharacterData): boolean {
  if (offer.kind === 'character') {
    return true;
  }
  if (offer.rarity === undefined) {
    return true;
  }
  const wanted = offer.rarity === 'elite' ? startRarityIndex('ascended') : 0;
  return startRarityIndex(character.tier) === wanted;
}

/** Every character this offer could currently be spent on. */
export function offerTargets(
  state: GameState,
  offer: ShopOfferData,
  characters: CharacterLookup,
): readonly CharacterData[] {
  return [...characters.values()].filter((character) => {
    if (!isEligible(offer, character)) {
      return false;
    }
    const owned = findOwned(state, character.id) !== undefined;
    return offer.kind === 'character' ? !owned : owned;
  });
}

/**
 * Spends spark on one offer, aimed at one character.
 *
 * The target is always explicit. A shop that picked for you would be a lottery inside a
 * lottery, and the entire reason spark exists is to be the part of the game where the player
 * chooses instead of rolling.
 */
export function purchase(
  state: GameState,
  offer: ShopOfferData,
  targetDefId: string,
  characters: CharacterLookup,
): ShopResult {
  const character = characters.get(targetDefId);
  if (character === undefined) {
    return { ok: false, reason: 'unknown-character' };
  }
  if (!isEligible(offer, character)) {
    return { ok: false, reason: 'ineligible-character' };
  }

  const owned = findOwned(state, targetDefId) !== undefined;
  if (offer.kind === 'character' && owned) {
    return { ok: false, reason: 'already-owned' };
  }
  if (offer.kind === 'copy' && !owned) {
    return { ok: false, reason: 'not-owned' };
  }

  const cost = { spark: num(Math.max(offer.cost, 0)) };
  if (!canAfford(state.wallet, cost)) {
    return { ok: false, reason: 'insufficient-currency' };
  }

  const paid: GameState = { ...state, wallet: debit(state.wallet, cost) };
  return { ok: true, state: grantCopies(paid, character, 1).state };
}
