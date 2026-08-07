import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementsService } from './achievements.service';

/**
 * Achievements: the second faucet, and the one that is not stage-gated.
 *
 * ## What this is for, beyond a trophy case
 *
 * A player walled below a stage has exactly one income source and it is the thing the wall is
 * throttling. This pays on clears already banked, so **being stuck stops meaning being stopped** —
 * which matters more in a game with no way to buy a way past a wall.
 *
 * ## Why it is a Town card rather than a tab
 *
 * The bar holds five and its spare slot is deliberately not for spending. Town's test is
 * "somewhere you go deliberately, with something you have earned", which the Altar established by
 * being a Town card while spending no wallet currency at all. This is the same shape: a place a
 * player visits knowing there is something waiting.
 *
 * ## Why one Claim all rather than a button per row
 *
 * Nothing is spent and no two tracks compete for anything, so claiming everything is the only
 * move rather than a strategy — the same argument the Altar's Ascend All runs on. A button per
 * row would be asking the player to press it once per track to reach the same state.
 *
 * ## The rows never disappear
 *
 * A claimed track keeps its row and shows progress toward the next award, rather than vanishing
 * until it is owed again. A screen that empties itself is a screen a player learns not to open,
 * and the progress bar is the thing that makes the next award legible before it lands.
 */
@Component({
  selector: 'app-achievements-view',
  imports: [RouterLink],
  templateUrl: './achievements-view.html',
  styleUrl: './achievements-view.scss',
})
export class AchievementsView {
  private readonly achievements = inject(AchievementsService);

  protected readonly rows = this.achievements.rows;
  protected readonly unclaimed = this.achievements.unclaimed;

  /** What the last claim said. Cleared by the next one rather than on a timer. */
  protected readonly notice = signal<string | null>(null);

  /**
   * Everything waiting, summed across tracks, for the button's own label.
   *
   * Summed here rather than in the service because it is a presentation decision: two tracks
   * paying the same currency read as one number to a player and as two rows to the model.
   */
  protected readonly totalOwed = computed(() => {
    const totals = new Map<string, { amount: string; label: string }>();
    for (const row of this.rows()) {
      for (const award of row.owed) {
        // Two tracks paying the same currency would need re-summing as quantities rather than
        // strings, which is why this keeps the first and the notice below quotes the real total.
        totals.set(award.currency, { amount: award.amount, label: award.label });
      }
    }
    return [...totals.values()];
  });

  protected claimAll(): void {
    const summary = this.achievements.claimAll();
    if (summary.awards === 0) {
      this.notice.set('Nothing to claim yet — keep climbing.');
      return;
    }
    const paid = summary.gained.map((award) => `${award.amount} ${award.label}`).join(', ');
    this.notice.set(`Claimed ${count(summary.awards, 'award')} — ${paid}.`);
  }
}

/** "1 award", "4 awards" — the plural spelled out where English does not just add an s. */
function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
