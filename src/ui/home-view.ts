import { Component, computed, inject } from '@angular/core';
import { BattleService } from './battle.service';
import { formatDuration, formatNumeric, formatRate } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/**
 * The home screen: what the run is worth, and the way into a fight.
 *
 * Everything here is idle-side. The battle screen replaces this one entirely rather than
 * appearing beneath it, so a fight is somewhere the player goes and then leaves.
 */
@Component({
  selector: 'app-home-view',
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
})
export class HomeView {
  private readonly game = inject(GameLoopService);
  private readonly battles = inject(BattleService);

  protected readonly loadFailure = this.game.loadFailure;
  protected readonly saveIssues = this.game.saveIssues;

  protected readonly gold = computed(() => formatNumeric(this.game.gold()));
  protected readonly rate = computed(() => formatRate(this.game.goldPerSec()));

  /** Names the stage on the Fight control, so the tap is never a leap in the dark. */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    return next === null ? 'Preparing…' : `Fight Stage ${next.number} — ${next.name}`;
  });

  /**
   * What to say under the counter.
   *
   * A run that has never won earns nothing at all, so the first message has to explain why the
   * number is not moving. Once income is flowing that sentence is simply untrue, and leaving it
   * up would teach the player to ignore this line.
   */
  protected readonly hint = computed(() =>
    this.game.goldPerSec().lte(0)
      ? 'Idle earns nothing yet. Win a stage to start banking gold while you are away.'
      : 'Every stage you clear raises your idle income for good.',
  );

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

  protected fight(): void {
    // The clock lives here, as it does everywhere else in `ui/`. Opening the battle screen is
    // the service's business: the screen's lifetime is the battle session.
    this.battles.fight(Date.now());
  }
}
