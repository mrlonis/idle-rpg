import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { type GearFailure, type Numeric } from '../core';
import { formatNumeric } from './format-numeric';
import { type GearItemView, type GearOfferView, GearService } from './gear.service';

/**
 * The gear screen: the shop that restocks on the hour, and the bag everything else lands in.
 *
 * Two sections rather than two routes. They are the same subject read from opposite ends — the
 * shop is where a specific piece can be *chosen* and the bag is where the random ones pile up —
 * and a player deciding whether to buy a Fine chest piece wants to see what they already have
 * without navigating away and losing the offer they were looking at.
 *
 * **Equipping is not here.** A piece goes on from the character sheet, because "what is Rin
 * wearing" is a question about Rin and answering it from a list of two hundred objects means
 * holding a character in your head while you scroll. This screen is about the objects; the sheet
 * is about the character.
 *
 * ## The clock
 *
 * The countdown ticks from an interval this component owns, started on init and cleared on
 * destroy. It deliberately does not live in `GearService`: a service-level timer would keep
 * running for the life of the app to update something nobody is looking at, which is the same
 * reason `BattleService` only schedules a frame while there is a fight to narrate.
 *
 * Once a minute, because the only thing it moves is a countdown shown in minutes. A per-second
 * timer would wake the device sixty times as often to redraw the same string.
 */
const CLOCK_TICK_MS = 60_000;

@Component({
  selector: 'app-gear-view',
  templateUrl: './gear-view.html',
  styleUrl: './gear-view.scss',
})
export class GearView implements OnInit, OnDestroy {
  private readonly gear = inject(GearService);

  private clockId: ReturnType<typeof setInterval> | undefined;

  protected readonly offers = this.gear.offers;
  protected readonly loose = this.gear.loose;
  protected readonly alloy = this.gear.alloy;

  /**
   * The piece the bag is expanded on, or `null`.
   *
   * One at a time. A list of two hundred rows each carrying an enhance button, a salvage button
   * and a cost breakdown is a wall; a list of names with one open row is something a thumb can
   * work through.
   */
  protected readonly openId = signal<string | null>(null);

  /** What the last action said, when it said anything worth showing. */
  protected readonly notice = signal<string | null>(null);

  protected readonly restockIn = computed(() => formatCountdown(this.gear.msUntilRestock()));

  protected readonly hasGear = computed(() => this.loose().length > 0);

  ngOnInit(): void {
    this.gear.refreshClock();
    this.clockId = setInterval(() => this.gear.refreshClock(), CLOCK_TICK_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.clockId);
  }

  protected toggle(itemId: string): void {
    this.openId.update((open) => (open === itemId ? null : itemId));
    this.notice.set(null);
  }

  protected enhance(item: GearItemView): void {
    const result = this.gear.enhance(item.id);
    this.notice.set(
      result.ok
        ? `${item.gradeName} ${item.slotLabel} is now level ${item.level + 1}.`
        : FAILURES[result.reason],
    );
  }

  protected salvage(item: GearItemView): void {
    const result = this.gear.salvage([item.id]);
    if (result.ok) {
      this.openId.set(null);
    }
    this.notice.set(
      result.ok
        ? `Salvaged for ${item.salvageValue.toLocaleString()} alloy.`
        : FAILURES[result.reason],
    );
  }

  protected buy(offer: GearOfferView): void {
    const result = this.gear.buy(offer.index);
    this.notice.set(
      result.ok
        ? `${offer.item.gradeName} ${offer.item.slotLabel} added to the bag.`
        : SHOP_FAILURES[result.reason],
    );
  }

  protected format(value: Numeric): string {
    return formatNumeric(value);
  }

  /** `alloy` and `gold` as plain strings, for the cost line on an open row. */
  protected costOf(item: GearItemView): { alloy: string; gold: string } | null {
    const cost = item.enhanceCost;
    if (cost === null) {
      return null;
    }
    return {
      alloy: cost.alloy === undefined ? '0' : formatNumeric(cost.alloy),
      gold: cost.gold === undefined ? '0' : formatNumeric(cost.gold),
    };
  }
}

/**
 * Why an action did not happen, in words a player can act on.
 *
 * Every `GearFailure` gets a line. A reason with no message would surface as a button that
 * silently does nothing, which is the exact failure `core/gear/inventory.ts` returns reasons to
 * prevent — the mapping being exhaustive is what carries that promise through to the screen.
 */
const FAILURES: Readonly<Record<GearFailure, string>> = {
  'unknown-item': 'That piece is no longer in your bag.',
  'unknown-character': 'That character is not in this build.',
  'not-owned': 'You do not own that character.',
  'wrong-archetype': 'That piece was forged for a different archetype.',
  'item-equipped': 'Take it off first — equipped gear is never consumed.',
  'slot-empty': 'Nothing is in that slot.',
  'max-level': 'Already at this grade’s maximum level.',
  'material-is-target': 'A piece cannot be its own material.',
  'insufficient-currency': 'Not enough alloy or gold.',
};

const SHOP_FAILURES: Readonly<Record<GearFailure | 'unknown-offer' | 'already-purchased', string>> =
  {
    ...FAILURES,
    'unknown-offer': 'That offer is gone — the shop has restocked.',
    'already-purchased': 'You have already bought that one.',
    'insufficient-currency': 'Not enough gold.',
  };

/** A countdown as coarse as the thing it counts: hours and minutes, never seconds. */
function formatCountdown(ms: number): string {
  const minutes = Math.max(Math.ceil(ms / 60_000), 0);
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
