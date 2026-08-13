import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpeditionService } from './expedition.service';

/**
 * The Expeditions index: three maps, in the order they unlock.
 *
 * A list screen and nothing else — the map screen owns everything about playing one. Every row
 * says what it is and what to do about it, which is the rule Home's locked tower row is spent on:
 * a locked map names what opens it, a completed one what it paid, an underway one where the
 * attempt stands.
 */
@Component({
  selector: 'app-expeditions-view',
  imports: [RouterLink],
  templateUrl: './expeditions-view.html',
  styleUrl: './expeditions-view.scss',
})
export class ExpeditionsView {
  private readonly expeditions = inject(ExpeditionService);

  protected readonly rows = this.expeditions.mapRows;
  protected readonly isUnlocked = this.expeditions.isUnlocked;
  protected readonly chaptersNeeded = this.expeditions.chaptersNeeded;
  protected readonly completed = this.expeditions.completed;
  protected readonly total = this.expeditions.maps.length;

  /** What a row's status chip says. */
  protected statusLabel(status: 'locked' | 'open' | 'underway' | 'completed'): string {
    switch (status) {
      case 'locked':
        return 'Locked';
      case 'open':
        return 'Open';
      case 'underway':
        return 'Attempt underway';
      case 'completed':
        return 'Completed';
    }
  }
}
