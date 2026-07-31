import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { type GameState, newGame, num, type OfflineReport, type RepairIssue } from '../core';
import { BattleService, type StageHeading } from '../ui/battle.service';
import { GameLoopService } from '../ui/game-loop.service';
import { App } from './app';

const T0 = 1_700_000_000_000;

/**
 * A stand-in for the real loop.
 *
 * The shell's job is narrow — start the run, own the `main` landmark, pick a screen — so the
 * fakes only need to expose what the two child screens read. Presentation of the screens
 * themselves is covered by `home-view.spec.ts` and `battle.service.spec.ts`.
 */
class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(null);
  readonly offlineReport = signal<OfflineReport | null>(null);
  readonly saveIssues = signal<readonly RepairIssue[]>([]);
  readonly loadFailure = signal<string | undefined>(undefined);

  readonly isReady = signal(false);
  readonly gold = signal(num(0));
  readonly goldPerSec = signal(num(0));

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

class FakeBattles {
  readonly isOpen = signal(false);
  readonly isFighting = signal(false);
  readonly outcome = signal<string | null>(null);
  readonly stage = signal<StageHeading | null>(null);
  readonly nextStage = signal<StageHeading | null>({ name: 'Mossy Hollow', number: 1 });
  readonly party = signal([]);
  readonly foes = signal([]);
  readonly recentEvents = signal([]);
  readonly names = signal(new Map<string, string>());
  readonly playbackSpeed = signal(1);
  readonly result = signal(null);

  fight(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  setSpeed(): void {
    /* not exercised here */
  }
}

async function render(configure?: (game: FakeGameLoop, battles: FakeBattles) => void) {
  const game = new FakeGameLoop();
  const battles = new FakeBattles();
  configure?.(game, battles);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      { provide: GameLoopService, useValue: game },
      { provide: BattleService, useValue: battles },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { game, battles, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('App', () => {
  it('creates', async () => {
    const { fixture } = await render();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('starts the game loop with the current time', async () => {
    const before = Date.now();

    const { game } = await render();

    expect(game.startCalls).toHaveLength(1);
    expect(game.startCalls[0]).toBeGreaterThanOrEqual(before);
  });

  it('shows a loading state until the run is ready', async () => {
    const { el } = await render((game) => {
      game.start = () => Promise.resolve();
    });

    expect(el.textContent).toContain('Loading your run');
  });

  describe('choosing a screen', () => {
    it('shows the home screen by default', async () => {
      const { el } = await render();

      expect(el.querySelector('app-home-view')).not.toBeNull();
      expect(el.querySelector('app-battle-view')).toBeNull();
    });

    it('replaces home with the battle screen rather than stacking them', async () => {
      // The point of the swap: a fight is somewhere the player goes, not a panel that appears
      // underneath what they were already looking at.
      const { el, battles, fixture } = await render();

      battles.isOpen.set(true);
      fixture.detectChanges();

      expect(el.querySelector('app-battle-view')).not.toBeNull();
      expect(el.querySelector('app-home-view')).toBeNull();
    });

    it('returns to home when the battle screen closes', async () => {
      const { el, battles, fixture } = await render((_game, fake) => fake.isOpen.set(true));

      battles.close();
      fixture.detectChanges();

      expect(el.querySelector('app-home-view')).not.toBeNull();
      expect(el.querySelector('app-battle-view')).toBeNull();
    });

    it('shows neither screen before the run has loaded', async () => {
      const { el } = await render((game, fake) => {
        game.start = () => Promise.resolve();
        fake.isOpen.set(true);
      });

      expect(el.querySelector('app-battle-view')).toBeNull();
      expect(el.querySelector('app-home-view')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('exposes exactly one main landmark, whichever screen is showing', async () => {
      const { el, battles, fixture } = await render();

      expect(el.querySelectorAll('main')).toHaveLength(1);

      battles.isOpen.set(true);
      fixture.detectChanges();

      expect(el.querySelectorAll('main')).toHaveLength(1);
    });
  });
});

describe('newGame contract used by the UI', () => {
  it('starts a run with no gold and no income until a stage is cleared', () => {
    // The counter deliberately does not move on a fresh run. Idle income is switched on by
    // winning the first battle, which is what makes fighting the only thing worth doing at the
    // start rather than one option among several.
    const state = newGame({ seed: 1, nowMs: T0 });

    expect(state.gold.toString()).toBe('0');
    expect(state.goldPerSec.toString()).toBe('0');
    expect(state.stage).toBe(1);
  });
});
