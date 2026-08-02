import { Component, computed, inject, signal } from '@angular/core';
import {
  type CharacterData,
  num,
  offerTargets,
  purchase,
  type ShopFailure,
  type ShopOfferData,
} from '../core';
import { CHARACTERS_BY_ID, SHOP_OFFERS } from './content';
import { formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/** Why a purchase was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<ShopFailure, string>> = {
  'insufficient-currency': 'Not enough spark yet.',
  'already-owned': 'You already own that character.',
  'not-owned': 'You can only buy copies of characters you already own.',
  'ineligible-character': 'That character is not eligible for this offer.',
  'unknown-character': 'That character is no longer available.',
};

/** One offer, with its eligible targets already resolved. */
interface OfferView {
  readonly offer: ShopOfferData;
  readonly cost: string;
  readonly affordable: boolean;
  readonly targets: readonly CharacterData[];
}

/**
 * The spark shop.
 *
 * Spark is minted only by copies of a character already at `Ascended★5`, so this screen is
 * empty for most of a run and that is correct — it is the overflow valve, not the safety net.
 * Pity is the safety net, and it fires within fifty pulls from the very first one.
 *
 * Every offer names its target explicitly. A shop that picked for you would be a lottery inside
 * a lottery, and choosing is the entire reason this currency exists.
 */
@Component({
  selector: 'app-shop-view',
  templateUrl: './shop-view.html',
  styleUrl: './shop-view.scss',
})
export class ShopView {
  private readonly game = inject(GameLoopService);

  /** Which offer's target list is expanded. Only one at a time — the lists are long. */
  protected readonly openOffer = signal<string | null>(null);

  /** The last outcome, success or refusal, as a sentence. */
  protected readonly message = signal<string | null>(null);

  protected readonly spark = computed(() => formatNumeric(this.game.spark()));

  protected readonly offers = computed<readonly OfferView[]>(() => {
    const state = this.game.snapshot();
    const balance = this.game.spark();
    return SHOP_OFFERS.map((offer) => ({
      offer,
      cost: formatNumeric(num(offer.cost)),
      affordable: balance.gte(num(offer.cost)),
      targets: state === null ? [] : offerTargets(state, offer, CHARACTERS_BY_ID),
    }));
  });

  protected toggle(offerId: string): void {
    this.openOffer.update((open) => (open === offerId ? null : offerId));
    this.message.set(null);
  }

  protected buy(offer: ShopOfferData, target: CharacterData): void {
    const state = this.game.current;
    if (state === null) {
      return;
    }
    const result = purchase(state, offer, target.id, CHARACTERS_BY_ID);
    if (result.ok) {
      this.game.apply(() => result.state);
      this.message.set(`Bought ${offer.name.toLowerCase()}: ${target.name}.`);
      this.openOffer.set(null);
      return;
    }
    this.message.set(FAILURE_MESSAGES[result.reason as ShopFailure] ?? 'That did not work.');
  }
}
