import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CAMPAIGN_FORMATION,
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
import { FormationService } from './formation.service';
import { GameLoopService } from './game-loop.service';

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
 * The home screen: what the run is worth, and where every fight starts.
 *
 * ## It is the battle hub now, and that is milestone 15a
 *
 * Home used to carry one control, a Fight button that entered the campaign. Faction towers make
 * that eight destinations, and the choice of which to fight is not a thing to bury behind a tab —
 * so **Home is where a run picks what to do next**, with the campaign as the first card and the
 * towers arriving beside it. Nothing empty ships for them; the section holds one card until 15b.
 *
 * Who is fighting is deliberately not restated here. This screen carried a read-only copy of the
 * formation once, which said the same thing twice and could only ever be the poorer of the two.
 * What replaced it is a link: the card leads to the crew editor, the crew is confirmed there, and
 * the fight starts from that screen.
 *
 * Everything here is idle-side. The battle screen replaces this one entirely rather than appearing
 * beneath it, so a fight is somewhere the player goes and then leaves.
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
  private readonly formations = inject(FormationService);

  protected readonly loadFailure = this.game.loadFailure;
  protected readonly saveIssues = this.game.saveIssues;

  /**
   * The campaign crew, read for the hint underneath the battle card.
   *
   * ⚠️ **No longer read to decide whether the Fight control works.** The control is a link to the
   * crew editor now, and an empty crew is the best possible reason to follow it — see the note in
   * the template.
   */
  protected readonly campaign = computed(() => this.formations.crew(CAMPAIGN_FORMATION));

  /** Where the battle card goes: the crew editor, in its pre-battle mode. */
  protected readonly campaignLink = computed(() => ['/prepare', CAMPAIGN_FORMATION]);

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
    const crew = this.campaign();
    if (crew === null || crew.size === 0) {
      return 'Your crew is empty. Tap above to choose who fights.';
    }
    if (crew.open.front === FRONT_ROW_SIZE) {
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
