import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuestsService } from './quests.service';

/**
 * Quests: the daily and weekly tier, and the reason being stuck stops meaning being stopped.
 *
 * ## What this is actually for
 *
 * The genre framing — "a reason to open the app tomorrow" — undersells it and points at the wrong
 * design. A player walled below a stage has exactly one income source and it is the thing the wall
 * is throttling. Quests pay whether or not the ladder is moving, which matters far more in a game
 * with no way to buy a way past.
 *
 * That is also why **nothing here punishes a miss**. There is no streak, no escalating bonus that
 * resets, and no countdown that costs anything when it runs out — those are scarcity mechanics
 * wearing a generosity costume, and `docs/rejected.md` rules them out by name. The reset time is
 * shown because a player asking "is this worth doing now" deserves an answer, not because missing
 * it takes anything away.
 *
 * ## Why the weekly tier asks for exactly seven dailies
 *
 * A player who does their dailies has finished the weeklies without noticing. The weekly row is a
 * bonus for consistency rather than a second obligation — a weekly demanding more than the dailies
 * add up to would be a chore with a deadline, which is the shape this project rejects.
 *
 * ## One Claim all
 *
 * Nothing is spent and no two quests compete, so claiming everything is the only move rather than
 * a strategy — the same argument the Altar's Ascend All runs on.
 */
@Component({
  selector: 'app-quests-view',
  imports: [RouterLink],
  templateUrl: './quests-view.html',
  styleUrl: './quests-view.scss',
})
export class QuestsView {
  private readonly quests = inject(QuestsService);

  protected readonly groups = this.quests.groups;
  protected readonly claimable = this.quests.claimable;

  /** What the last claim said. Replaced by the next one rather than cleared on a timer. */
  protected readonly notice = signal<string | null>(null);

  protected claimAll(): void {
    const summary = this.quests.claimAll();
    if (summary.quests === 0) {
      this.notice.set('Nothing finished yet — go and fight something.');
      return;
    }
    const paid = summary.gained.map((award) => `${award.amount} ${award.label}`).join(', ');
    this.notice.set(`Claimed ${count(summary.quests, 'quest')} — ${paid}.`);
  }
}

/** "1 quest", "3 quests" — the plural spelled out where English does not just add an s. */
function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
