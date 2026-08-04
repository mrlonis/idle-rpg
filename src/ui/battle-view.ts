import { Component, computed, inject } from '@angular/core';
import { type BattleEvent, MAX_ENERGY, ZERO } from '../core';
import {
  type BattleCombatantView,
  BattleService,
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
} from './battle.service';
import { formatAmounts, formatNumeric, formatRate } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/**
 * The battle screen.
 *
 * A screen in its own right: it replaces the home view for the length of a fight, rather than
 * sitting under it. Almost purely a view onto `BattleService` — the fight it shows has already
 * been resolved in full, and everything here reads signals the animator publishes as it walks
 * the event log, which is why changing playback speed needs no cooperation from this component.
 *
 * It reaches past the animator for exactly one thing, the run's idle income, because that is
 * what a victory is really paying out and it belongs in the same sentence as the gold.
 */
@Component({
  selector: 'app-battle-view',
  templateUrl: './battle-view.html',
  styleUrl: './battle-view.scss',
})
export class BattleView {
  private readonly battles = inject(BattleService);
  private readonly game = inject(GameLoopService);

  protected readonly speeds = PLAYBACK_SPEEDS;
  /** The denominator on every energy bar. One number for the whole game since 8b. */
  protected readonly maxEnergy = MAX_ENERGY;
  protected readonly playbackSpeed = this.battles.playbackSpeed;
  protected readonly stage = this.battles.stage;
  protected readonly isAuto = this.battles.isAuto;
  protected readonly isAutoUnlocked = this.battles.isAutoUnlocked;

  /**
   * Each side as its two ranks, front first.
   *
   * Assembled here rather than as four separate bindings so the template draws one rank block
   * and repeats it, which is what keeps the two sides from drifting apart every time a row
   * gains something to show.
   */
  protected readonly partyRanks = computed(() => [
    { row: 'front' as const, label: 'Front row', fighters: this.battles.partyFront() },
    { row: 'back' as const, label: 'Back row', fighters: this.battles.partyBack() },
  ]);

  protected readonly foeRanks = computed(() => [
    { row: 'front' as const, label: 'Front row', fighters: this.battles.foesFront() },
    { row: 'back' as const, label: 'Back row', fighters: this.battles.foesBack() },
  ]);

  /**
   * True once the fight is over and the board is final.
   *
   * Gates the only two controls that leave this screen. Before it, there is no way out on
   * purpose — a battle lasts seconds, can be sped up, and abandoning one halfway would throw
   * away rewards the player is moments from collecting.
   */
  protected readonly isSettled = computed(
    () => !this.battles.isFighting() && this.battles.outcome() !== null,
  );

  /** Names the stage the next fight enters: the one ahead after a win, the same one after a loss. */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    return next === null ? 'Fight again' : `Fight Stage ${next.number} — ${next.name}`;
  });

  /**
   * The closing line, or `null` while the fight is still playing.
   *
   * Safe to read the run's income here: the result is applied in the same pass that plays the
   * closing event, so by the time this has anything to say the raise has already landed.
   */
  protected readonly outcomeText = computed(() => {
    const outcome = this.battles.outcome();
    if (outcome === null) {
      return null;
    }
    if (outcome === 'defeat') {
      // One message for both ways to lose. A fight that ran the ninety seconds out is a fight the
      // party could not finish, which is the same thing the player needs to do about it — bring
      // more damage — and `timedOut` is a tuning signal rather than something to explain here.
      return 'Defeated. Your party regroups — try again when you are ready.';
    }
    const gained = this.battles.result()?.reward.gained ?? {};
    const earnings = `idle income now ${formatRate(this.game.goldPerSec())} gold`;
    const spoils = formatAmounts(gained);
    return spoils === null ? `Victory! ${earnings}` : `Victory! +${spoils} · ${earnings}`;
  });

  /** The visible tail of the battle log, already narrated. */
  protected readonly logLines = computed(() => {
    const names = this.battles.names();
    return this.battles
      .recentEvents()
      .map((event) => narrate(event, names))
      .filter((line): line is string => line !== null);
  });

  protected fight(): void {
    // The clock lives here, as it does everywhere else in `ui/`.
    this.battles.fight(Date.now());
  }

  protected close(): void {
    this.battles.close();
  }

  protected setSpeed(speed: PlaybackSpeed): void {
    this.battles.setSpeed(speed);
  }

  protected toggleAuto(): void {
    this.battles.setAuto(!this.isAuto(), Date.now());
  }

  /**
   * HP as `current / max`.
   *
   * Rounded up rather than down, so a combatant clinging on with a fraction of a point reads as
   * 1 rather than as 0 — a living combatant showing zero HP is a bug report waiting to happen.
   * Only exact zero displays as zero. One decimal place, not none: max HP passes 1000 by the
   * middle of the ladder, and at zero digits a 1300 HP Golem renders as "1K".
   */
  protected hpText(combatant: BattleCombatantView): string {
    return `${formatNumeric(combatant.hp.ceil(), 1)} / ${formatNumeric(combatant.maxHp.ceil(), 1)}`;
  }

  /**
   * The shield segment's width, as a percentage of the HP bar.
   *
   * Capped at whatever room is left beside the HP fill rather than allowed to overflow: a
   * barrier can legitimately be worth more than the target's maximum HP, and a bar that grew
   * past its track would push the layout around mid-fight.
   */
  protected shieldPercent(combatant: BattleCombatantView): number {
    if (combatant.shield.lte(ZERO)) {
      return 0;
    }
    const share = combatant.shield.div(combatant.maxHp).toNumber();
    if (!Number.isFinite(share)) {
      return 0;
    }
    return Math.min(share, 1 - combatant.fraction) * 100;
  }
}

/**
 * Turns one event into a line of prose.
 *
 * Two kinds of event are deliberately dropped. The closing event has its own announced line,
 * and repeating it would mean a screen reader hears the outcome twice; turn markers never reach
 * here at all, because the animator filters them out before publishing — a fight is many more
 * turns than it is interesting moments.
 */
function narrate(event: BattleEvent, names: ReadonlyMap<string, string>): string | null {
  const who = (key: string): string => names.get(key) ?? key;

  switch (event.kind) {
    case 'cast':
      return `${who(event.source)} uses ${event.skillName}`;
    case 'attack': {
      const damage = formatNumeric(event.damage.round(), 1);
      const absorbed = event.absorbed.gt(ZERO)
        ? ` (${formatNumeric(event.absorbed.round(), 1)} absorbed)`
        : '';
      return event.crit
        ? `${who(event.source)} lands a critical hit on ${who(event.target)} for ${damage}${absorbed}`
        : `${who(event.source)} hits ${who(event.target)} for ${damage}${absorbed}`;
    }
    case 'miss':
      return `${who(event.source)} misses ${who(event.target)}`;
    case 'heal':
      return event.source === event.target
        ? `${who(event.source)} drains ${formatNumeric(event.amount.round(), 1)}`
        : `${who(event.source)} heals ${who(event.target)} for ${formatNumeric(event.amount.round(), 1)}`;
    case 'status':
      return `${who(event.target)} is ${event.status.name}`;
    case 'status-resisted':
      return `${who(event.target)} resists ${event.statusName}`;
    case 'status-expired':
      return `${who(event.target)} is no longer ${event.statusName}`;
    case 'cleanse':
      // A count rather than the names, even though the event carries the ids it removed. The ids
      // are `weaken` and `slow`, not `Weakened` and `Slowed` — resolving them to display names
      // would mean threading a second lookup through here for a line that is read once and
      // scrolls away. What the count does have to say is what it counts, or "cleanses 2 from
      // Bran" leaves the reader to guess between effects, targets and stacks.
      return event.removed.length === 0
        ? null
        : `${who(event.source)} cleanses ${event.removed.length} ${
            event.removed.length === 1 ? 'effect' : 'effects'
          } from ${who(event.target)}`;
    case 'tick-damage':
      return `${who(event.target)} takes ${formatNumeric(event.damage.round(), 1)} from ${event.statusName}`;
    case 'tick-heal':
      return `${who(event.target)} recovers ${formatNumeric(event.amount.round(), 1)} from ${event.statusName}`;
    case 'stunned':
      return `${who(event.combatant)} is stunned and loses a turn`;
    case 'defeat':
      return `${who(event.combatant)} is defeated`;
    case 'turn':
    case 'end':
      return null;
  }
}
