import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

/**
 * The id the heading carries, so the opener can point `aria-labelledby` at it.
 *
 * A constant rather than a generated id because only one of these can be open at a time — the
 * dialog is modal, and the control that opens it is behind the backdrop while it is up.
 */
export const RESET_DIALOG_TITLE_ID = 'reset-dialog-title';

/**
 * The confirmation in front of a run reset.
 *
 * **A real modal rather than an inline "are you sure", and CDK's rather than a hand-rolled one.**
 * `@angular/cdk` is installed for exactly this: focus trapping, focus restoration to the control
 * that opened it, `aria-hidden` on everything behind it, and Escape to dismiss are the four things
 * a hand-written dialog gets wrong, and they are the four AXE and WCAG care about. This is the
 * app's first overlay, so it is also the proof that the CDK path works here.
 *
 * The component itself is deliberately dumb: it closes with `true` or `false` and knows nothing
 * about saves. Wiping the run belongs to the screen that opened it — see `SettingsView`.
 *
 * **Cancel is first in the DOM on purpose.** CDK focuses the first tabbable element, so the
 * dialog opens with the harmless button under the finger rather than the destructive one. A
 * player who opened this by mis-tapping can dismiss it with the key or the tap already in flight.
 */
@Component({
  selector: 'app-reset-dialog',
  templateUrl: './reset-dialog.html',
  styleUrl: './reset-dialog.scss',
})
export class ResetDialog {
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);

  protected readonly titleId = RESET_DIALOG_TITLE_ID;

  protected cancel(): void {
    this.ref.close(false);
  }

  protected confirm(): void {
    this.ref.close(true);
  }
}
