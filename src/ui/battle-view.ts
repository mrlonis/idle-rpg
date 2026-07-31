import { Component, computed, inject } from '@angular/core';
import { type BattleEvent } from '../core';
import {
  type BattleCombatantView,
  BattleService,
  PLAYBACK_SPEEDS,
  type PlaybackSpeed,
} from './battle.service';
import { formatNumeric, formatRate } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/**
 * The battle screen.
 *
 * Almost purely a view onto `BattleService`: the fight it shows has already been resolved in
 * full, and everything here reads signals the animator publishes as it walks the event log —
 * which is why changing playback speed needs no cooperation from this component at all.
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
  protected readonly playbackSpeed = this.battles.playbackSpeed;
  protected readonly stage = this.battles.stage;
  protected readonly party = this.battles.party;
  protected readonly foes = this.battles.foes;
  protected readonly isFighting = this.battles.isFighting;
  protected readonly hasBattle = computed(() => this.battles.result() !== null);

  /** Label for the Fight control. Names the stage so the tap is never a leap in the dark. */
  protected readonly fightLabel = computed(() => {
    const next = this.battles.nextStage();
    if (next === null) {
      return 'Preparing…';
    }
    return this.isFighting()
      ? `Fighting Stage ${next.number}…`
      : `Fight Stage ${next.number} — ${next.name}`;
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
      return 'Defeated. Your party regroups — try again when you are ready.';
    }
    if (outcome === 'stalemate') {
      return 'Stalemate — neither side could finish it.';
    }
    const gold = this.battles.result()?.reward.gold;
    const earnings = `idle income now ${formatRate(this.game.goldPerSec())}`;
    return gold === undefined
      ? `Victory! ${earnings}`
      : `Victory! +${formatNumeric(gold)} gold · ${earnings}`;
  });

  /**
   * What to say when no battle is on screen.
   *
   * A run that has never won earns nothing at all, so the first message has to explain why the
   * counter is not moving. Once income is flowing that sentence is simply untrue, and leaving it
   * up would teach the player to ignore this line.
   */
  protected readonly hint = computed(() =>
    this.game.goldPerSec().lte(0)
      ? 'Your party is idle, and idle earns nothing. Win a stage to start banking gold while you are away.'
      : 'Your party is resting. Every stage you clear raises your idle income for good.',
  );

  protected fight(): void {
    // The clock lives here, as it does everywhere else in `ui/`.
    this.battles.fight(Date.now());
  }

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
