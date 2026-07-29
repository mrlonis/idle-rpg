import { Component, computed, inject, OnInit } from '@angular/core';
import { formatDuration, formatNumeric, formatRate } from '../ui/format-numeric';
import { GameLoopService } from '../ui/game-loop.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly game = inject(GameLoopService);

  protected readonly isReady = this.game.isReady;
  protected readonly loadFailure = this.game.loadFailure;
  protected readonly saveIssues = this.game.saveIssues;

  protected readonly gold = computed(() => formatNumeric(this.game.gold()));
  protected readonly rate = computed(() => formatRate(this.game.goldPerSec()));

  /** Only worth showing when the player was away long enough to have earned something. */
  protected readonly offlineSummary = computed(() => {
    const report = this.game.offlineReport();
    if (report === null || report.gold.lte(0)) {
      return null;
    }
    return {
      duration: formatDuration(report.elapsedMs),
      gold: formatNumeric(report.gold),
      wasCapped: report.wasCapped,
    };
  });

  ngOnInit(): void {
    // The clock lives here: core takes time as a parameter and never reads one itself.
    void this.game.start(Date.now());
  }
}
