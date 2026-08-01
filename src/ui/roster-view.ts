import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTY_SIZE, type RosterFailure } from '../core';
import { RosterService } from './roster.service';

/** Why a party change was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'party-full': `Your party is full. Remove someone before adding another — ${PARTY_SIZE} fight at a time.`,
  'not-owned': 'You do not own that character.',
  'duplicate-party-member': 'That character is already in your party.',
  'unknown-character': 'That character is no longer available.',
};

/**
 * The roster: everyone owned, and who is fighting.
 *
 * Party membership is a toggle on each row rather than a separate editing mode. There are three
 * slots and a list; a drag-and-drop reorder screen would be more machinery than the decision
 * deserves, and slot order is set by the order characters are added.
 */
@Component({
  selector: 'app-roster-view',
  imports: [RouterLink],
  templateUrl: './roster-view.html',
  styleUrl: './roster-view.scss',
})
export class RosterView {
  private readonly roster = inject(RosterService);

  protected readonly partySize = PARTY_SIZE;
  protected readonly entries = this.roster.entries;
  protected readonly party = this.roster.party;
  protected readonly openSlots = this.roster.openSlots;

  /** The last refusal, cleared as soon as anything succeeds. */
  protected readonly message = signal<string | null>(null);

  protected readonly summary = computed(() => {
    const total = this.entries().length;
    const fielded = this.party().length;
    return `${fielded} of ${this.partySize} fielded · ${total} ${total === 1 ? 'character' : 'characters'} owned`;
  });

  protected toggle(defId: string): void {
    const result = this.roster.toggleParty(defId);
    this.message.set(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'That did not work.'));
  }
}
