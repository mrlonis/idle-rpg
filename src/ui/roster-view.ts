import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BACK_ROW_SIZE, FRONT_ROW_SIZE, PARTY_SIZE, type RosterFailure, type Row } from '../core';
import { RosterService } from './roster.service';

/** Why a formation change was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'row-full': `Both rows are full — ${FRONT_ROW_SIZE} in front, ${BACK_ROW_SIZE} behind. Bench somebody first.`,
  'not-owned': 'You do not own that character.',
  'duplicate-party-member': 'That character is already in your formation.',
  'unknown-character': 'That character is no longer available.',
};

/** What the next tap on a row's control will do. */
interface PlacementAction {
  readonly label: string;
  /** Spelled out for assistive technology, because the visible label repeats down the list. */
  readonly description: string;
}

/**
 * The roster: everyone owned, and where they are standing.
 *
 * Placement is one control per row that **cycles** front → back → benched rather than three
 * buttons or a drag-and-drop board. Two rows of two and three is a small enough space that
 * cycling reaches every state in at most two taps, and a drag target is the worst possible
 * control on a phone — this whole screen is a list, and a list is a thing you tap.
 *
 * Which row a character stands in is entirely the player's call. Nothing here consults a
 * character's role: role-locking would let an unlucky roster reach a state with no legal
 * formation, and a bad front row is a far better failure than no front row.
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
  protected readonly openSlots = this.roster.openSlots;

  /** The two ranks, front first, for the formation panel above the list. */
  protected readonly ranks = computed(() => [
    {
      row: 'front' as const,
      label: 'Front row',
      capacity: FRONT_ROW_SIZE,
      hint: 'Attacks come here first. +5% to both defences.',
      members: this.roster.frontRow(),
    },
    {
      row: 'back' as const,
      label: 'Back row',
      capacity: BACK_ROW_SIZE,
      hint: 'Shielded while the front row holds. +5% to whichever attack stat is higher.',
      members: this.roster.backRow(),
    },
  ]);

  /** The last refusal, cleared as soon as anything succeeds. */
  protected readonly message = signal<string | null>(null);

  protected readonly summary = computed(() => {
    const total = this.entries().length;
    const fielded = this.roster.fieldedCount();
    return `${fielded} of ${this.partySize} fielded · ${total} ${total === 1 ? 'character' : 'characters'} owned`;
  });

  /** Where a character stands, in words, for the row's meta line. */
  protected placementLabel(row: Row | null, slot: number | null): string {
    if (row === null) {
      return 'Benched';
    }
    return `${row === 'front' ? 'Front' : 'Back'} ${slot ?? 1}`;
  }

  /**
   * What the next tap does, given where the character is now and what room is left.
   *
   * Computed rather than hard-coded so the button never promises something the cycle will not
   * do: with a full back row, a front-row character's next tap benches it, and the label says
   * so.
   */
  protected nextAction(row: Row | null, name: string): PlacementAction {
    const open = this.openSlots();
    if (row === 'front') {
      return open.back > 0
        ? { label: 'To back', description: `Move ${name} to the back row` }
        : { label: 'Bench', description: `Bench ${name}` };
    }
    if (row === 'back') {
      return { label: 'Bench', description: `Bench ${name}` };
    }
    if (open.front > 0) {
      return { label: 'To front', description: `Field ${name} in the front row` };
    }
    if (open.back > 0) {
      return { label: 'To back', description: `Field ${name} in the back row` };
    }
    return { label: 'Field', description: `Field ${name} — both rows are full` };
  }

  protected cycle(defId: string): void {
    const result = this.roster.cyclePlacement(defId);
    this.message.set(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'That did not work.'));
  }
}
