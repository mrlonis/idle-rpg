import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type BountyData, type BountyFailure } from '../core';
import { type BountyRowView, BountiesService } from './bounties.service';

/** Why a dispatch was refused, in words a player can act on. */
const FAILURE_MESSAGES: Record<BountyFailure, string> = {
  'unknown-bounty': 'That mission is not in this build.',
  'already-running': 'That mission already has a crew out.',
  'not-running': 'Nobody is on that mission.',
  'wrong-crew-size': 'That mission needs a different number of characters.',
  'not-owned': 'You do not own one of those characters.',
  'duplicate-member': 'A character cannot go twice.',
  'in-formation': 'Somebody in that crew is in your party. Bench them first.',
  'already-away': 'Somebody in that crew is already out on another mission.',
  'not-finished': 'That mission is still running.',
  locked: 'Clear more stages to open that mission.',
};

/**
 * The bounty board: the only place that pays for characters you are not fighting with.
 *
 * ## Why this is a bench sink rather than a resource tap
 *
 * ⚠️ **Dispatch and the formation are disjoint.** A character cannot be both fighting and away, so
 * the board is worth something only once a roster is wider than its five formation slots — which is
 * the entire design. The picker below therefore lists only characters who are neither fielded nor
 * already out; offering somebody `core/` would refuse is how a player learns a rule by being told
 * "no" instead of by seeing it.
 *
 * ## Why a mission pays a duration rather than an amount
 *
 * Every payout is *seconds of the run's own current idle income*. A flat quantity of gold, xp or
 * essence is worthless a chapter or two later against a level curve worth ×10⁹; a multiple of what
 * the player currently earns means the same thing forever. The screen therefore quotes the payout
 * at today's rates rather than as an authored number.
 *
 * ## The crew picker is a toggle list, not a drag target
 *
 * Five slots and a roster of dozens makes ordering irrelevant here — unlike the formation, where
 * slot order breaks ties in ATB turn order. A crew is a *set*, so the control that expresses it is
 * a set of toggles, which is also the one that works with a keyboard and a screen reader without
 * any of the pointer machinery a drag target needs.
 */
@Component({
  selector: 'app-bounties-view',
  imports: [RouterLink],
  templateUrl: './bounties-view.html',
  styleUrl: './bounties-view.scss',
})
export class BountiesView {
  private readonly bounties = inject(BountiesService);

  protected readonly rows = this.bounties.rows;
  protected readonly ready = this.bounties.ready;
  protected readonly available = this.bounties.available;

  /** Which mission's crew picker is open, by id. Only one at a time. */
  protected readonly picking = signal<string | null>(null);

  /** The crew being assembled for the open picker. */
  protected readonly chosen = signal<readonly string[]>([]);

  protected readonly notice = signal<string | null>(null);

  /** The mission the open picker belongs to. */
  protected readonly pickingFor = computed(() =>
    this.rows().find((row) => row.bounty.id === this.picking()),
  );

  /** Whether the assembled crew is exactly the size the open mission wants. */
  protected readonly crewComplete = computed(() => {
    return this.chosen().length === this.pickingFor()?.bounty.crew;
  });

  protected openPicker(row: BountyRowView): void {
    this.notice.set(null);
    this.picking.set(row.bounty.id);
    this.chosen.set([]);
  }

  protected closePicker(): void {
    this.picking.set(null);
    this.chosen.set([]);
  }

  protected isChosen(defId: string): boolean {
    return this.chosen().includes(defId);
  }

  /**
   * Adds or removes a character from the crew being assembled.
   *
   * Stops adding at the crew size rather than silently swapping somebody out: a toggle that
   * removed a choice the player did not make is the kind of control people stop trusting.
   */
  protected toggle(defId: string): void {
    const row = this.pickingFor();
    if (row === undefined) {
      return;
    }
    this.chosen.update((crew) => {
      if (crew.includes(defId)) {
        return crew.filter((id) => id !== defId);
      }
      return crew.length >= row.bounty.crew ? crew : [...crew, defId];
    });
  }

  protected send(): void {
    const row = this.pickingFor();
    if (row === undefined) {
      return;
    }
    const refusal = this.bounties.dispatch(row.bounty, this.chosen());
    if (refusal !== null) {
      this.notice.set(FAILURE_MESSAGES[refusal]);
      return;
    }
    this.notice.set(`${row.bounty.name} is under way — back in ${row.duration}.`);
    this.closePicker();
  }

  protected collect(bounty: BountyData): void {
    const summary = this.bounties.collect(bounty);
    if (summary.missions === 0) {
      this.notice.set('That mission is not finished yet.');
      return;
    }
    this.notice.set(`${bounty.name} paid ${describe(summary.gained)}.`);
  }

  protected collectAll(): void {
    const summary = this.bounties.collectAll();
    if (summary.missions === 0) {
      this.notice.set('Nothing has come back yet.');
      return;
    }
    this.notice.set(
      `Collected ${count(summary.missions, 'mission')} — ${describe(summary.gained)}.`,
    );
  }
}

/** "12K gold, 2.4K XP" — or "nothing" for a run that earns no idle income yet. */
function describe(gained: readonly { amount: string; label: string }[]): string {
  return gained.length === 0
    ? 'nothing — clear a stage to start earning idle income'
    : gained.map((award) => `${award.amount} ${award.label}`).join(', ');
}

/** "1 mission", "3 missions" — the plural spelled out where English does not just add an s. */
function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
