import { Dialog } from '@angular/cdk/dialog';
import { createNoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameLoopService } from './game-loop.service';
import { RESET_DIALOG_TITLE_ID, ResetDialog } from './reset-dialog';
import { PLAYBACK_SPEEDS, type PlaybackSpeed, SettingsService } from './settings.service';

/**
 * The settings screen.
 *
 * Two things live here today and the screen exists partly for the third: it is where anything
 * that is neither a currency nor a character goes, so a preference does not have to invent a home
 * on a screen about something else.
 *
 * **Combat speed is a setting, not a copy of one.** The 1×/2×/4× controls here and the ones on
 * the battle screen write to the same `SettingsService` value, so picking 4× mid-fight is picking
 * it here too. Nothing has to be kept in step because there is only one of it.
 *
 * **The reset is the reason this screen was blocked on a screen at all.** It is destructive and
 * irreversible, so it belongs somewhere a player arrives on purpose rather than somewhere a thumb
 * can reach it during a fight.
 */
@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.html',
  styleUrl: './settings-view.scss',
})
export class SettingsView {
  private readonly settings = inject(SettingsService);
  private readonly game = inject(GameLoopService);
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);

  protected readonly speeds = PLAYBACK_SPEEDS;
  protected readonly combatSpeed = this.settings.combatSpeed;

  /** Whether the two come-back reminders are scheduled. Defaults on; one tap from off. */
  protected readonly reminders = this.settings.reminders;

  /** Turns the come-back reminders on or off. */
  protected setReminders(enabled: boolean): void {
    this.settings.setReminders(enabled);
  }

  /** Set while the run is being wiped and rebuilt, so the control cannot be tapped twice. */
  protected readonly isResetting = signal(false);

  protected setCombatSpeed(speed: PlaybackSpeed): void {
    this.settings.setCombatSpeed(speed);
  }

  /**
   * Asks first, then wipes.
   *
   * The dialog is opened with two deliberate departures from CDK's defaults:
   *
   * - **`ariaModal`**, which CDK leaves off. The container already gets `role="dialog"` and
   *   everything behind it already gets `aria-hidden`, but `aria-modal` is what tells a screen
   *   reader the boundary is real rather than advisory.
   * - **A noop scroll strategy**, replacing CDK's default block. Blocking scroll works by putting
   *   `position: fixed; overflow-y: scroll` on `html` — which is a fix for a document that
   *   scrolls, and this document deliberately never does (see `styles.scss`). Applying it here
   *   would fight the shell's height chain to prevent something that cannot happen. The backdrop
   *   already stops a touch reaching the screen underneath.
   *
   * Escape and a backdrop tap both close with `undefined`, which is why this checks for `true`
   * rather than for anything falsy.
   */
  protected confirmReset(): void {
    const ref = this.dialog.open<boolean>(ResetDialog, {
      ariaModal: true,
      ariaLabelledBy: RESET_DIALOG_TITLE_ID,
      scrollStrategy: createNoopScrollStrategy(),
      width: 'min(24rem, calc(100% - 2rem))',
      maxHeight: 'calc(100% - 2rem)',
    });

    ref.closed.subscribe((confirmed) => {
      if (confirmed === true) {
        void this.reset();
      }
    });
  }

  /**
   * Wipes the run and shows the player the new one.
   *
   * Home rather than staying here, because a fresh run *is* the confirmation: stage 1-1, an empty
   * wallet and the starter party say it happened in a way no toast on the settings screen would.
   */
  private async reset(): Promise<void> {
    this.isResetting.set(true);
    try {
      await this.game.reset(Date.now());
      await this.router.navigate(['/']);
    } finally {
      this.isResetting.set(false);
    }
  }
}
