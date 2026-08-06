import { Component, computed, inject } from '@angular/core';
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
 * The home screen: what the run is worth, and the way into a fight.
 *
 * Who is fighting is the roster screen's job and is not restated here. This screen used to
 * carry a read-only copy of the formation, which said the same thing twice and could only ever
 * be the poorer of the two — the roster shows the same rows, and is the only place they can be
 * *changed*. What stays is the part the formation still decides here: whether a fight can start
 * at all, and the hint that says why not.
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
  private readonly roster = inject(RosterService);

  protected readonly loadFailure = this.game.loadFailure;
  protected readonly saveIssues = this.game.saveIssues;

  /**
   * Not shown, but read: it is what decides whether the Fight control is live, and what the hint
   * underneath explains when it is not.
   */
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

  /**
   * Names the stage on the Fight control, so the tap is never a leap in the dark.
   *
   * `2-14` rather than "Chapter 2, Stage 14": the control is one line on a phone and the long form
   * pushes the stage's own name off it, which is the half a player actually reads. The chapter is
   * named in full on the battle screen's heading.
   */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    return next === null ? 'Preparing…' : `Fight ${next.chapter}-${next.number} — ${next.name}`;
  });

  /** A party of nobody loses instantly, so the control says so rather than letting it happen. */
  protected readonly canFight = computed(() => this.fieldedCount() > 0);

  /**
   * Why the player is suddenly back on this screen.
   *
   * An auto-battle run ends by dropping them here, which means the board that explained the loss
   * is already gone. Without this line the transition reads as the app having lost their place.
   */
  protected readonly autoStoppedAt = this.battles.autoStoppedAt;

  /**
   * What to say under the counter.
   *
   * A run that has never won earns crystals and nothing else, so the first message says which of
   * the four numbers is moving and what starts the rest. Once income is flowing that sentence is
   * simply untrue, and leaving it up would teach the player to ignore this line.
   */
  protected readonly hint = computed(() => {
    if (this.fieldedCount() === 0) {
      return 'Your formation is empty. Place characters in the Roster before fighting.';
    }
    if (this.roster.openSlots().front === FRONT_ROW_SIZE) {
      return 'Nobody is in your front row. Attacks reach the back row first when the front is empty.';
    }
    return this.game.goldPerSec().lte(0)
      ? 'Crystals are already accruing while you are away. Win a stage to start banking gold, XP and essence too.'
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
    };
  });

  protected fight(): void {
    // The clock lives here, as it does everywhere else in `ui/`. Opening the battle screen is
    // the service's business: the screen's lifetime is the battle session.
    this.battles.fight(Date.now());
  }

  /**
   * Closes one of the two notices that report something that already happened.
   *
   * Both delegate to the service that owns the signal rather than hiding the line locally: this
   * screen is lazily routed and is destroyed and rebuilt on every navigation, so a flag held
   * here would put the notice straight back on the player's next visit.
   *
   * Only these two are dismissible. The save-health notices above them describe a condition that
   * is still true — a run whose save could not be read is not being written to disk for the rest
   * of the session — and a warning that is still costing the player something should not be
   * closable.
   */
  protected dismissAutoStopped(): void {
    this.battles.dismissAutoStopped();
  }

  protected dismissOfflineSummary(): void {
    this.game.dismissOfflineReport();
  }
}
