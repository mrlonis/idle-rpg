import { Dialog } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { GameLoopService } from './game-loop.service';
import { ResetDialog } from './reset-dialog';
import { SettingsView } from './settings-view';
import { SettingsService } from './settings.service';

/** Stands in for the persisted settings, so nothing here reaches a store. */
class FakeSettings {
  readonly speed = signal<number>(1);
  readonly combatSpeed = this.speed.asReadonly();

  /** Every speed the screen asked for, so a test can assert it wrote through. */
  readonly chosen: number[] = [];

  setCombatSpeed(speed: number): void {
    this.chosen.push(speed);
    this.speed.set(speed);
  }
}

class FakeGameLoop {
  readonly resets: number[] = [];

  reset(nowMs: number): Promise<void> {
    this.resets.push(nowMs);
    return Promise.resolve();
  }
}

class FakeRouter {
  readonly navigations: unknown[][] = [];

  navigate(commands: unknown[]): Promise<boolean> {
    this.navigations.push(commands);
    return Promise.resolve(true);
  }
}

/**
 * Stands in for CDK's `Dialog`.
 *
 * The overlay itself is CDK's to get right — focus trapping, `aria-hidden` behind it, Escape —
 * and driving the real one here would test their code through a jsdom that renders nothing. What
 * belongs to this screen is narrower and is what these tests are about: that the destructive
 * action happens *only* on a confirmed close.
 */
class FakeDialog {
  readonly opened: { component: unknown; config: unknown }[] = [];
  private readonly result = new Subject<boolean | undefined>();

  open(component: unknown, config: unknown) {
    this.opened.push({ component, config });
    return { closed: this.result.asObservable() };
  }

  /** Closes the dialog the way the player would: confirming, cancelling, or pressing Escape. */
  respond(answer: boolean | undefined): void {
    this.result.next(answer);
  }
}

async function render() {
  const settings = new FakeSettings();
  const game = new FakeGameLoop();
  const router = new FakeRouter();
  const dialog = new FakeDialog();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [SettingsView],
    providers: [
      { provide: SettingsService, useValue: settings },
      { provide: GameLoopService, useValue: game },
      { provide: Router, useValue: router },
      { provide: Dialog, useValue: dialog },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SettingsView);
  fixture.detectChanges();

  return {
    settings,
    game,
    router,
    dialog,
    fixture,
    el: fixture.nativeElement as HTMLElement,
  };
}

/** The three speed radios, in the order they are drawn. */
function speedInputs(el: HTMLElement): HTMLInputElement[] {
  return [...el.querySelectorAll<HTMLInputElement>('.speeds__input')];
}

describe('SettingsView', () => {
  describe('battle speed', () => {
    it('offers every speed as a single-selection radio group', async () => {
      const { el } = await render();

      const inputs = speedInputs(el);
      expect(inputs.map((input) => input.type)).toEqual(['radio', 'radio', 'radio']);
      // One name across the group is what makes the platform treat them as one choice, and what
      // gives arrow-key selection for free.
      expect(new Set(inputs.map((input) => input.name)).size).toBe(1);
      expect(
        [...el.querySelectorAll('.speeds__text')].map((node) => node.textContent?.trim()),
      ).toEqual(['1×', '2×', '4×']);
    });

    it('checks the speed the settings currently hold', async () => {
      const { el, settings, fixture } = await render();

      settings.speed.set(4);
      fixture.detectChanges();

      expect(speedInputs(el).map((input) => input.checked)).toEqual([false, false, true]);
    });

    it('writes a chosen speed through to the settings', async () => {
      const { el, settings } = await render();

      speedInputs(el)[1].click();

      expect(settings.chosen).toEqual([2]);
    });
  });

  describe('resetting the run', () => {
    it('asks before doing anything', async () => {
      const { el, dialog, game } = await render();

      el.querySelector<HTMLButtonElement>('.reset')?.click();

      expect(dialog.opened).toHaveLength(1);
      expect(dialog.opened[0].component).toBe(ResetDialog);
      // Nothing has happened yet — the dialog is still open.
      expect(game.resets).toEqual([]);
    });

    it('wipes the run and shows the player the new one once confirmed', async () => {
      const { el, dialog, game, router } = await render();

      el.querySelector<HTMLButtonElement>('.reset')?.click();
      dialog.respond(true);
      await Promise.resolve();
      await Promise.resolve();

      expect(game.resets).toHaveLength(1);
      expect(router.navigations).toEqual([['/']]);
    });

    /**
     * Escape and a backdrop tap both close with `undefined` rather than `false`, so a check for
     * "not cancelled" would delete the run of anybody who dismissed the dialog.
     */
    it.each([
      ['cancelled', false],
      ['dismissed with Escape or the backdrop', undefined],
    ])('does nothing when the dialog is %s', async (_label, answer) => {
      const { el, dialog, game, router } = await render();

      el.querySelector<HTMLButtonElement>('.reset')?.click();
      dialog.respond(answer);
      await Promise.resolve();

      expect(game.resets).toEqual([]);
      expect(router.navigations).toEqual([]);
    });

    it('opens the dialog as a modal, labelled by its own heading', async () => {
      const { el, dialog } = await render();

      el.querySelector<HTMLButtonElement>('.reset')?.click();

      expect(dialog.opened[0].config).toMatchObject({
        ariaModal: true,
        ariaLabelledBy: 'reset-dialog-title',
      });
    });
  });
});
