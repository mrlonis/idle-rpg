import { DialogRef } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RESET_DIALOG_TITLE_ID, ResetDialog } from './reset-dialog';

class FakeDialogRef {
  readonly closedWith: (boolean | undefined)[] = [];

  close(result?: boolean): void {
    this.closedWith.push(result);
  }
}

async function render() {
  const ref = new FakeDialogRef();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [ResetDialog],
    providers: [{ provide: DialogRef, useValue: ref }],
  }).compileComponents();

  const fixture = TestBed.createComponent(ResetDialog);
  fixture.detectChanges();

  return { ref, fixture, el: fixture.nativeElement as HTMLElement };
}

function buttons(el: HTMLElement): HTMLButtonElement[] {
  return [...el.querySelectorAll<HTMLButtonElement>('.dialog__button')];
}

describe('ResetDialog', () => {
  it('names what is about to be lost, rather than only asking', async () => {
    const { el } = await render();

    expect(el.textContent).toMatch(/roster/i);
    expect(el.textContent).toMatch(/no undo/i);
  });

  /**
   * The opener points `aria-labelledby` at this id, so the dialog is announced by the heading the
   * player can see rather than by a label only assistive tech has.
   */
  it('carries the id its opener labels it by', async () => {
    const { el } = await render();

    expect(el.querySelector('h2')?.id).toBe(RESET_DIALOG_TITLE_ID);
  });

  /**
   * CDK focuses the first tabbable element, so the order here decides what is under the finger
   * when the dialog opens. Cancel first means a mis-tap that opened it can be undone by the tap
   * already on its way.
   */
  it('puts the harmless button first, where the initial focus lands', async () => {
    const { el } = await render();

    expect(buttons(el).map((button) => button.textContent?.trim())).toEqual([
      'Keep playing',
      'Reset run',
    ]);
  });

  it('closes with false when the player keeps playing', async () => {
    const { el, ref } = await render();

    buttons(el)[0].click();

    expect(ref.closedWith).toEqual([false]);
  });

  it('closes with true when the player confirms', async () => {
    const { el, ref } = await render();

    buttons(el)[1].click();

    expect(ref.closedWith).toEqual([true]);
  });
});
