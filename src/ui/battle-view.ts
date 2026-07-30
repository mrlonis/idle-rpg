import { Component, computed, inject } from '@angular/core';
import { type BattleEvent } from '../core';
import {
  type BattleCombatantView,
  BattleService,
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
} from './battle.service';
import { formatNumeric } from './format-numeric';

/**
 * The battle screen.
 *
 * Purely a view onto `BattleService`. The fight it shows has already been resolved in full;
 * everything here reads signals the animator publishes as it walks the event log, which is why
 * changing playback speed needs no cooperation from this component at all.
 */
@Component({
  selector: 'app-battle-view',
  templateUrl: './battle-view.html',
  styleUrl: './battle-view.scss',
})
export class BattleView {
  private readonly battles = inject(BattleService);

  protected readonly speeds = PLAYBACK_SPEEDS;
  protected readonly playbackSpeed = this.battles.playbackSpeed;
  protected readonly stage = this.battles.stage;
  protected readonly party = this.battles.party;
  protected readonly foes = this.battles.foes;
  protected readonly isReady = computed(() => this.battles.result() !== null);

  /**
   * The closing line, or `null` while the fight is still playing.
   *
   * The reward is read off the result rather than off the run's gold, which has already moved
   * on — the state was updated when the battle resolved, not when the animation reached the end.
   */
  protected readonly outcomeText = computed(() => {
    const outcome = this.battles.outcome();
    if (outcome === null) {
      return null;
    }
    if (outcome === 'defeat') {
      return 'Defeated. Regrouping for another attempt…';
    }
    if (outcome === 'stalemate') {
      return 'Stalemate — neither side could finish it.';
    }
    const gold = this.battles.result()?.reward.gold;
    return gold === undefined ? 'Victory!' : `Victory! +${formatNumeric(gold)} gold`;
  });

  /** The visible tail of the battle log, already narrated. */
  protected readonly logLines = computed(() => {
    const names = this.battles.names();
    return this.battles
      .recentEvents()
      .map((event) => narrate(event, names))
      .filter((line): line is string => line !== null);
  });

  protected setSpeed(speed: PlaybackSpeed): void {
    this.battles.setSpeed(speed);
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
}

/**
 * Turns one event into a line of prose.
 *
 * The closing event is deliberately dropped: the outcome has its own announced line, and
 * repeating it in the log would mean a screen reader hears it twice.
 */
function narrate(event: BattleEvent, names: ReadonlyMap<string, string>): string | null {
  switch (event.kind) {
    case 'attack': {
      const source = names.get(event.source) ?? event.source;
      const target = names.get(event.target) ?? event.target;
      const damage = formatNumeric(event.damage.round(), 1);
      return event.crit
        ? `${source} lands a critical hit on ${target} for ${damage}`
        : `${source} hits ${target} for ${damage}`;
    }
    case 'defeat':
      return `${names.get(event.combatant) ?? event.combatant} is defeated`;
    case 'end':
      return null;
  }
}
