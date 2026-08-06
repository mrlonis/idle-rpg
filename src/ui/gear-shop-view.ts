import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type GearFailure, type Numeric } from '../core';
import { formatNumeric } from './format-numeric';
import { type GearOfferView, GearService } from './gear.service';

/**
 * How often the countdown is redrawn.
 *
 * Once a minute, because the only thing it moves is a countdown shown in minutes. A per-second
 * timer would wake the device sixty times as often to redraw the same string.
 */
const CLOCK_TICK_MS = 60_000;

/**
 * The gear shop: six pieces, the same six until the hour turns.
 *
 * A Town screen rather than half of a tab. It was the top of the old gear tab, next to the bag,
 * on the argument that a player weighing an offer wants to see what they already hold — but the
 * tab is an inventory now, and a currency sink is precisely what Town exists to hold. It sits
 * beside the spark shop, which is where a player with something to spend already looks.
 *
 * **What it spends is gold, and that is why gold is in the header.** Offers are priced against
 * what the run's ladder earns, so the number that decides whether an offer is reachable is the
 * one at the top of the screen — and Town's card carries the same figure, so the trip can be
 * judged before it is taken.
 *
 * ## The clock
 *
 * The countdown ticks from an interval this component owns, started on init and cleared on
 * destroy. It deliberately does not live in `GearService`: a service-level timer would keep
 * running for the life of the app to update something nobody is looking at, which is the same
 * reason `BattleService` only schedules a frame while there is a fight to narrate.
 */
@Component({
  selector: 'app-gear-shop-view',
  imports: [RouterLink],
  templateUrl: './gear-shop-view.html',
  styleUrl: './gear-shop-view.scss',
})
export class GearShopView implements OnInit, OnDestroy {
  private readonly gear = inject(GearService);

  private clockId: ReturnType<typeof setInterval> | undefined;

  protected readonly offers = this.gear.offers;
  protected readonly gold = this.gear.gold;

  /** What the last purchase said, when it said anything worth showing. */
  protected readonly notice = signal<string | null>(null);

  protected readonly restockIn = computed(() => formatCountdown(this.gear.msUntilRestock()));

  ngOnInit(): void {
    this.gear.refreshClock();
    this.clockId = setInterval(() => this.gear.refreshClock(), CLOCK_TICK_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockId);
  }

  /**
   * Buys an offer, and says what actually happened to it.
   *
   * ⚠️ **"Added to the bag" is not always true, which is why this reads `kept`.** The bag holds 240
   * unequipped pieces and `addGear` keeps the best of the union, so a purchase into a full bag
   * either displaces something worse — the ordinary case — or, when the offer was worse than
   * everything already held, is itself the piece that melts. Nothing is lost either way, because
   * the value comes back as alloy; but a confirmation that claimed otherwise would be the screen
   * lying about a transaction the player just paid gold for.
   */
  protected buy(offer: GearOfferView): void {
    const result = this.gear.buy(offer.index);
    if (!result.ok) {
      this.notice.set(SHOP_FAILURES[result.reason]);
      return;
    }

    const name = `${offer.item.gradeName} ${offer.item.slotLabel}`;
    if (!result.kept) {
      this.notice.set(
        `Your bag is full of better gear, so the ${name} was salvaged for ${offer.item.salvageValue} alloy.`,
      );
      return;
    }
    this.notice.set(
      result.salvaged > 0
        ? `${name} added to the bag. The bag was full, so ${result.salvaged} piece${result.salvaged === 1 ? '' : 's'} salvaged to make room.`
        : `${name} added to the bag.`,
    );
  }

  protected format(value: Numeric): string {
    return formatNumeric(value);
  }
}

/**
 * Why a purchase did not happen, in words a player can act on.
 *
 * Every reason `buyGear` can return gets a line. A reason with no message would surface as a
 * button that silently does nothing, which is the exact failure `core/gear/` returns reasons to
 * prevent — the mapping being exhaustive is what carries that promise through to the screen.
 */
const SHOP_FAILURES: Readonly<Record<GearFailure | 'unknown-offer' | 'already-purchased', string>> =
  {
    'unknown-item': 'That piece is no longer in your bag.',
    'unknown-character': 'That character is not in this build.',
    'not-owned': 'You do not own that character.',
    'wrong-archetype': 'That piece was forged for a different archetype.',
    'item-equipped': 'Take it off first — equipped gear is never consumed.',
    'slot-empty': 'Nothing is in that slot.',
    'max-level': 'Already at this grade’s maximum level.',
    'material-is-target': 'A piece cannot be its own material.',
    'insufficient-currency': 'Not enough gold.',
    'unknown-offer': 'That offer is gone — the shop has restocked.',
    'already-purchased': 'You have already bought that one.',
  };

/** A countdown as coarse as the thing it counts: hours and minutes, never seconds. */
function formatCountdown(ms: number): string {
  const minutes = Math.max(Math.ceil(ms / 60_000), 0);
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
