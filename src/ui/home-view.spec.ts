import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { num, type OfflineReport, type RepairIssue } from '../core';
import { BattleService, type StageHeading } from './battle.service';
import { GameLoopService } from './game-loop.service';
import { HomeView } from './home-view';

/**
 * A stand-in for the real loop.
 *
 * The component's job is presentation: format what the service exposes and decide what to show.
 * Driving the real service here would pull in `requestAnimationFrame`, `Preferences` and
 * wall-clock time, and would end up testing the loop rather than the template.
 */
class FakeGameLoop {
  readonly offlineReport = signal<OfflineReport | null>(null);
  readonly saveIssues = signal<readonly RepairIssue[]>([]);
  readonly loadFailure = signal<string | undefined>(undefined);
  readonly gold = signal(num(0));
  readonly goldPerSec = signal(num(0));
}

/** Only the two things the home screen asks of the animator. */
class FakeBattles {
  readonly nextStage = signal<StageHeading | null>({ name: 'Mossy Hollow', number: 1 });
  readonly fought: number[] = [];

  fight(nowMs: number): void {
    this.fought.push(nowMs);
  }
}

async function render(configure?: (game: FakeGameLoop, battles: FakeBattles) => void) {
  const game = new FakeGameLoop();
  const battles = new FakeBattles();
  configure?.(game, battles);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [HomeView],
    providers: [
      { provide: GameLoopService, useValue: game },
      { provide: BattleService, useValue: battles },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(HomeView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { game, battles, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('HomeView', () => {
  it('renders gold formatted, not as a raw Decimal', async () => {
    const { el } = await render((game) => game.gold.set(num('1234567')));

    // The whole reason formatNumeric exists: DecimalPipe cannot render a Decimal.
    expect(el.querySelector('.resource__value')?.textContent?.trim()).toBe('1.23M');
    expect(el.textContent).not.toContain('[object Object]');
  });

  it('renders the rate with its unit', async () => {
    const { el } = await render((game) => game.goldPerSec.set(num('250')));

    expect(el.querySelector('.resource__rate')?.textContent?.trim()).toBe('250/s');
  });

  it('renders values past float64 exact-integer range', async () => {
    const { el } = await render((game) => game.gold.set(num('1.2345e+30')));

    expect(el.querySelector('.resource__value')?.textContent?.trim()).toBe('1.23No');
  });

  describe('the way into a fight', () => {
    it('names the stage on the button', async () => {
      const { el } = await render((_game, battles) =>
        battles.nextStage.set({ name: 'Cutthroat Camp', number: 5 }),
      );

      expect(el.querySelector('.fight')?.textContent?.trim()).toBe(
        'Fight Stage 5 — Cutthroat Camp',
      );
    });

    it('starts a battle when pressed, stamped with the current time', async () => {
      const before = Date.now();
      const { el, battles } = await render();

      el.querySelector<HTMLButtonElement>('.fight')?.click();

      expect(battles.fought).toHaveLength(1);
      expect(battles.fought[0]).toBeGreaterThanOrEqual(before);
    });

    it('stays quiet about a stage it does not know yet', async () => {
      const { el } = await render((_game, battles) => battles.nextStage.set(null));

      expect(el.querySelector('.fight')?.textContent?.trim()).toBe('Preparing…');
    });
  });

  describe('the hint under the counter', () => {
    it('explains why a fresh run earns nothing', async () => {
      const { el } = await render((game) => game.goldPerSec.set(num(0)));

      expect(el.querySelector('.hint')?.textContent).toContain('Win a stage');
    });

    it('stops saying that once income is flowing', async () => {
      // Leaving it up would be untrue, and would teach the player to ignore this line.
      const { el } = await render((game) => game.goldPerSec.set(num('1.5')));

      expect(el.querySelector('.hint')?.textContent).not.toContain('Win a stage');
      expect(el.querySelector('.hint')?.textContent).toContain('raises your idle income');
    });
  });

  describe('offline summary', () => {
    const report = (over: Partial<OfflineReport>): OfflineReport => ({
      rawElapsedMs: 3_600_000,
      elapsedMs: 3_600_000,
      wasCapped: false,
      gold: num('900'),
      ...over,
    });

    it('reports what was earned while away', async () => {
      const { el } = await render((game) => game.offlineReport.set(report({})));

      expect(el.textContent).toContain('1 hour');
      expect(el.textContent).toContain('900');
    });

    it('mentions the cap when the away window was clamped', async () => {
      const { el } = await render((game) => game.offlineReport.set(report({ wasCapped: true })));

      expect(el.textContent).toContain('capped');
    });

    it('stays hidden when nothing was earned', async () => {
      // A fresh run, or a return after a few seconds, should not show an empty brag panel.
      const { el } = await render((game) =>
        game.offlineReport.set(report({ gold: num(0), elapsedMs: 0 })),
      );

      expect(el.textContent).not.toContain('While you were away');
    });
  });

  describe('save health', () => {
    it('tells the player when a damaged save was recovered', async () => {
      const { el } = await render((game) =>
        game.saveIssues.set([{ field: 'gold', problem: 'unparseable', recovered: '0' }]),
      );

      expect(el.textContent).toContain('recovered');
    });

    it('warns, with an alert role, when the save could not be read at all', async () => {
      const { el } = await render((game) =>
        game.loadFailure.set('Save version 9 is newer than this build supports'),
      );

      const alert = el.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      // The player needs to know their old save is intact, or they will assume it is gone.
      expect(alert?.textContent).toContain('has not been overwritten');
    });

    it('does not also show the recovery notice when the load failed outright', async () => {
      const { el } = await render((game) => {
        game.loadFailure.set('unreadable');
        game.saveIssues.set([{ field: 'gold', problem: 'x', recovered: '0' }]);
      });

      expect(el.textContent).not.toContain('was recovered');
    });
  });

  describe('accessibility', () => {
    it('labels the gold figure with a heading rather than announcing every change', async () => {
      // An aria-live region here would fire ~6 times a second and make a screen reader
      // unusable. The heading names the value so it stays reachable on demand.
      const { el } = await render();

      const section = el.querySelector('.resource');
      expect(section?.getAttribute('aria-labelledby')).toBe('gold-label');
      expect(el.querySelector('#gold-label')?.textContent).toContain('Gold');
      expect(el.querySelector('.resource__value')?.getAttribute('aria-live')).toBeNull();
    });
  });
});
