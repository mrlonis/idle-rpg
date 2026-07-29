import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type GameState, newGame, num, type OfflineReport, type RepairIssue } from '../core';
import { GameLoopService } from '../ui/game-loop.service';
import { App } from './app';

const T0 = 1_700_000_000_000;

/**
 * A stand-in for the real loop.
 *
 * The component's job is presentation: format what the service exposes and decide what to
 * show. Driving the real service here would pull in `requestAnimationFrame`, `Preferences`
 * and wall-clock time, and would end up testing the loop rather than the template.
 */
class FakeGameLoopService {
  readonly snapshot = signal<GameState | null>(null);
  readonly offlineReport = signal<OfflineReport | null>(null);
  readonly saveIssues = signal<readonly RepairIssue[]>([]);
  readonly loadFailure = signal<string | undefined>(undefined);

  readonly isReady = signal(false);
  readonly gold = signal(num(0));
  readonly goldPerSec = signal(num(1));

  readonly startCalls: number[] = [];

  start(nowMs: number): Promise<void> {
    this.startCalls.push(nowMs);
    this.isReady.set(true);
    return Promise.resolve();
  }

  stop(): void {
    /* nothing to tear down in the fake */
  }
}

async function render(configure?: (fake: FakeGameLoopService) => void) {
  const fake = new FakeGameLoopService();
  configure?.(fake);

  await TestBed.configureTestingModule({
    imports: [App],
    providers: [{ provide: GameLoopService, useValue: fake }],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fake, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('App', () => {
  it('creates', async () => {
    const { fixture } = await render();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts the game loop with the current time', async () => {
    const before = Date.now();

    const { fake } = await render();

    expect(fake.startCalls).toHaveLength(1);
    expect(fake.startCalls[0]).toBeGreaterThanOrEqual(before);
  });

  it('shows a loading state until the run is ready', async () => {
    const { el } = await render((fake) => {
      fake.start = () => Promise.resolve();
    });

    expect(el.textContent).toContain('Loading your run');
  });

  it('renders gold formatted, not as a raw Decimal', async () => {
    const { el } = await render((fake) => {
      fake.isReady.set(true);
      fake.gold.set(num('1234567'));
    });

    // The whole reason formatNumeric exists: DecimalPipe cannot render a Decimal.
    expect(el.querySelector('.resource__value')?.textContent?.trim()).toBe('1.23M');
    expect(el.textContent).not.toContain('[object Object]');
  });

  it('renders the rate with its unit', async () => {
    const { el } = await render((fake) => {
      fake.isReady.set(true);
      fake.goldPerSec.set(num('250'));
    });

    expect(el.querySelector('.resource__rate')?.textContent?.trim()).toBe('250/s');
  });

  it('renders values past float64 exact-integer range', async () => {
    const { el } = await render((fake) => {
      fake.isReady.set(true);
      fake.gold.set(num('1.2345e+30'));
    });

    expect(el.querySelector('.resource__value')?.textContent?.trim()).toBe('1.23No');
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
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.offlineReport.set(report({}));
      });

      expect(el.textContent).toContain('1 hour');
      expect(el.textContent).toContain('900');
    });

    it('mentions the cap when the away window was clamped', async () => {
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.offlineReport.set(report({ wasCapped: true }));
      });

      expect(el.textContent).toContain('capped');
    });

    it('stays hidden when nothing was earned', async () => {
      // A fresh run, or a return after a few seconds, should not show an empty brag panel.
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.offlineReport.set(report({ gold: num(0), elapsedMs: 0 }));
      });

      expect(el.textContent).not.toContain('While you were away');
    });
  });

  describe('save health', () => {
    it('tells the player when a damaged save was recovered', async () => {
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.saveIssues.set([{ field: 'gold', problem: 'unparseable', recovered: '0' }]);
      });

      expect(el.textContent).toContain('recovered');
    });

    it('warns, with an alert role, when the save could not be read at all', async () => {
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.loadFailure.set('Save version 9 is newer than this build supports');
      });

      const alert = el.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      // The player needs to know their old save is intact, or they will assume it is gone.
      expect(alert?.textContent).toContain('has not been overwritten');
    });

    it('does not also show the recovery notice when the load failed outright', async () => {
      const { el } = await render((fake) => {
        fake.isReady.set(true);
        fake.loadFailure.set('unreadable');
        fake.saveIssues.set([{ field: 'gold', problem: 'x', recovered: '0' }]);
      });

      expect(el.textContent).not.toContain('was recovered');
    });
  });

  describe('accessibility', () => {
    it('labels the gold figure with a heading rather than announcing every change', async () => {
      // An aria-live region here would fire ~6 times a second and make a screen reader
      // unusable. The heading names the value so it stays reachable on demand.
      const { el } = await render((fake) => {
        fake.isReady.set(true);
      });

      const section = el.querySelector('.resource');
      expect(section?.getAttribute('aria-labelledby')).toBe('gold-label');
      expect(el.querySelector('#gold-label')?.textContent).toContain('Gold');
      expect(el.querySelector('.resource__value')?.getAttribute('aria-live')).toBeNull();
    });

    it('exposes exactly one main landmark', async () => {
      const { el } = await render((fake) => {
        fake.isReady.set(true);
      });

      expect(el.querySelectorAll('main')).toHaveLength(1);
    });
  });
});

describe('newGame contract used by the UI', () => {
  it('starts a run at zero gold with a positive rate', () => {
    const state = newGame({ seed: 1, nowMs: T0 });

    expect(state.gold.toString()).toBe('0');
    expect(state.goldPerSec.gt(0)).toBe(true);
  });
});
