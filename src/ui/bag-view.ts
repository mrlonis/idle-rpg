import { Component, computed, inject, signal } from '@angular/core';
import { type GearFailure, type Numeric } from '../core';
import { formatNumeric } from './format-numeric';
import { type GearItemView, GearService } from './gear.service';

/**
 * The bag: everything the run is holding that nobody is wearing.
 *
 * Named for what it will hold rather than for what is currently in it. Gear is the only kind of
 * object the game mints today, so today the bag is a list of gear — but an inventory is a shape
 * that takes a second kind of item without being re-cut, and "Gear" was a name that could not.
 * Sections arrive with the item types that need them; nothing empty ships in the meantime.
 *
 * **The forge left with the rename and is now `/town/gear-shop`.** The two were one screen because
 * they are the same subject read from opposite ends — the shop is where a specific piece can be
 * *chosen* and the bag is where the random ones pile up — and that argument held while gear had a
 * tab of its own. It stops holding once the tab is an inventory: a shop is somewhere a player
 * *goes*, which is what Town is for, and a bag is something they *carry*, which is what a tab is
 * for. The split also puts the forge beside the spark shop, so one screen now answers "what can I
 * spend this on".
 *
 * The cost of the split is real and was accepted: a player weighing a Fine chest piece can no
 * longer see what they already hold without leaving the offer. Town's cards exist to blunt exactly
 * that — what a place spends is readable before the trip — and the forge's stock is fixed for the
 * hour, so the offer is still there on the way back.
 *
 * **Equipping is not here.** A piece goes on from the character sheet, because "what is Rin
 * wearing" is a question about Rin and answering it from a list of two hundred objects means
 * holding a character in your head while you scroll. This screen is about the objects; the sheet
 * is about the character.
 */
@Component({
  selector: 'app-bag-view',
  templateUrl: './bag-view.html',
  styleUrl: './bag-view.scss',
})
export class BagView {
  private readonly gear = inject(GearService);

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

  protected readonly hasGear = computed(() => this.loose().length > 0);

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
      result.ok ? `Salvaged for ${item.salvageValue} alloy.` : FAILURES[result.reason],
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
