import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CURRENCY_IDS, type CurrencyId, RATE_CURRENCY_IDS } from '../core';
import { BattleService } from './battle.service';
import {
  CURRENCY_LABELS,
  formatAmounts,
  formatDuration,
  formatNumeric,
  formatRate,
} from './format-numeric';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/** One currency as the wallet strip shows it. */
interface CurrencyRow {
  readonly id: CurrencyId;
  readonly label: string;
  readonly amount: string;
  /** `null` for spark, which is minted by duplicate pulls and has no rate at all. */
  readonly rate: string | null;
}

/** Sentence case for a label that reads mid-sentence elsewhere. */
function titleCase(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * The home screen: what the run is worth, who is fighting, and the way into a fight.
 *
 * Everything here is idle-side. The battle screen replaces this one entirely rather than
 * appearing beneath it, so a fight is somewhere the player goes and then leaves.
 */
@Component({
  selector: 'app-home-view',
  imports: [RouterLink],
  templateUrl: './home-view.html',
  styleUrl: './home-view.scss',
})
export class HomeView {
  private readonly game = inject(GameLoopService);
  private readonly battles = inject(BattleService);
  private readonly roster = inject(RosterService);

  protected readonly loadFailure = this.game.loadFailure;
  protected readonly saveIssues = this.game.saveIssues;

  protected readonly gold = computed(() => formatNumeric(this.game.gold()));
  protected readonly goldRate = computed(() => formatRate(this.game.goldPerSec()));

  protected readonly party = this.roster.party;

  /**
   * Every currency except gold, which has the hero treatment above.
   *
   * Spark is included even at zero: a player needs to know the currency exists and where it
   * comes from before they have any, and an empty row with a label is how they find that out.
   */
  protected readonly currencies = computed<readonly CurrencyRow[]>(() => {
    const wallet = this.game.wallet();
    const rates = this.game.rates();
    const hasRate = new Set<string>(RATE_CURRENCY_IDS);

    return CURRENCY_IDS.filter((id) => id !== 'gold').map((id) => ({
      id,
      label: titleCase(CURRENCY_LABELS[id]),
      amount: formatNumeric(wallet[id]),
      rate: hasRate.has(id) ? formatRate(rates[id as 'xp' | 'essence' | 'summons']) : null,
    }));
  });

  /** Names the stage on the Fight control, so the tap is never a leap in the dark. */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    return next === null ? 'Preparing…' : `Fight Stage ${next.number} — ${next.name}`;
  });

  /** A party of nobody loses instantly, so the control says so rather than letting it happen. */
  protected readonly canFight = computed(() => this.party().length > 0);

  /**
   * What to say under the counter.
   *
   * A run that has never won earns nothing at all, so the first message has to explain why the
   * number is not moving. Once income is flowing that sentence is simply untrue, and leaving it
   * up would teach the player to ignore this line.
   */
  protected readonly hint = computed(() => {
    if (this.party().length === 0) {
      return 'Your party is empty. Pick up to three characters in the Roster before fighting.';
    }
    return this.game.goldPerSec().lte(0)
      ? 'Idle earns nothing yet. Win a stage to start banking gold, XP, essence and crystals while you are away.'
      : 'Every stage you clear raises all four idle rates for good.';
  });

  /** Only worth showing when the player was away long enough to have earned something. */
  protected readonly offlineSummary = computed(() => {
    const report = this.game.offlineReport();
    if (report === null) {
      return null;
    }
    const earned = formatAmounts(report.earned);
    if (earned === null) {
      return null;
    }
    return {
      duration: formatDuration(report.elapsedMs),
      earned,
      wasCapped: report.wasCapped,
    };
  });

  protected fight(): void {
    // The clock lives here, as it does everywhere else in `ui/`. Opening the battle screen is
    // the service's business: the screen's lifetime is the battle session.
    this.battles.fight(Date.now());
  }
}
