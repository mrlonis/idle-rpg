import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CURRENCY_IDS,
  type CurrencyId,
  FRONT_ROW_SIZE,
  RATE_CURRENCY_IDS,
  type RateCurrencyId,
} from '../core';
import { BattleService } from './battle.service';
import {
  CURRENCY_LABELS,
  formatAmounts,
  formatDuration,
  formatNumeric,
  formatRate,
} from './format-numeric';
import { GameLoopService } from './game-loop.service';
import { type ScreenId } from './navigation';
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

const RATE_BEARING = new Set<CurrencyId>(RATE_CURRENCY_IDS);

/** Narrows to the currencies `Rates` is keyed by, so reading a rate needs no cast. */
function hasRate(id: CurrencyId): id is RateCurrencyId {
  return RATE_BEARING.has(id);
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

  /**
   * What this screen calls itself on links out to a character sheet, so the sheet's back link
   * comes back here rather than to the roster. Typed, so a screen that is not registered in
   * `navigation.ts` is a compile error rather than a link that silently lands on the fallback.
   */
  protected readonly screenId: ScreenId = 'home';

  /**
   * The party, as the two ranks it fights in.
   *
   * Shown by rank rather than as one list because the rank is the decision: "who is standing in
   * front" is the thing a player changes between attempts at a stage they just lost.
   */
  protected readonly partyRanks = computed(() => [
    { row: 'front' as const, label: 'Front', members: this.roster.frontRow() },
    { row: 'back' as const, label: 'Back', members: this.roster.backRow() },
  ]);

  protected readonly fieldedCount = this.roster.fieldedCount;

  /**
   * Every currency, gold included and shown exactly like the rest.
   *
   * Gold used to have a hero block of its own above this strip, four times the height of these
   * cards. It was pulled into the row because that size made a claim the balance does not: gold
   * is the broadest currency, but essence is the one a run is actually bottlenecked on, and a
   * counter that large points a player at the wrong number.
   *
   * Spark is included even at zero: a player needs to know the currency exists and where it
   * comes from before they have any, and an empty row with a label is how they find that out.
   */
  protected readonly currencies = computed<readonly CurrencyRow[]>(() => {
    const wallet = this.game.wallet();
    const rates = this.game.rates();

    return CURRENCY_IDS.map((id) => ({
      id,
      label: titleCase(CURRENCY_LABELS[id]),
      amount: formatNumeric(wallet[id]),
      rate: hasRate(id) ? formatRate(rates[id]) : null,
    }));
  });

  /** Names the stage on the Fight control, so the tap is never a leap in the dark. */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    return next === null ? 'Preparing…' : `Fight Stage ${next.number} — ${next.name}`;
  });

  /** A party of nobody loses instantly, so the control says so rather than letting it happen. */
  protected readonly canFight = computed(() => this.fieldedCount() > 0);

  /**
   * What to say under the counter.
   *
   * A run that has never won earns nothing at all, so the first message has to explain why the
   * number is not moving. Once income is flowing that sentence is simply untrue, and leaving it
   * up would teach the player to ignore this line.
   */
  protected readonly hint = computed(() => {
    if (this.fieldedCount() === 0) {
      return 'Your formation is empty. Place characters in the Roster before fighting.';
    }
    if (this.roster.openSlots().front === FRONT_ROW_SIZE) {
      return 'Nobody is in your front row. Attacks reach the back row first when the front is empty.';
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
