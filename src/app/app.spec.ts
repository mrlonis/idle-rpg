import { provideLocationMocks } from '@angular/common/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
  readonly nextStage = signal<StageHeading | null>({
    name: 'Mossy Hollow',
    chapter: 1,
    chapterName: 'The Sunken Fen',
    number: 1,
    level: 1,
  });
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

/**
 * Stands in for whatever the router would render.
 *
 * The shell's screens are lazily loaded routes now, and pulling the real ones in would drag
 * their services and content along with them — testing those instead of the shell. What the
 * shell is actually responsible for is choosing between *the outlet* and the battle view, so
 * one stub route is enough to tell those apart.
 */
@Component({ selector: 'app-stub-screen', template: '<p>stub screen</p>' })
class StubScreen {}

async function render(configure?: (game: FakeGameLoop, battles: FakeBattles) => void) {
  const game = new FakeGameLoop();
  const battles = new FakeBattles();
  configure?.(game, battles);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([{ path: '**', component: StubScreen }]),
      provideLocationMocks(),
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
    it('routes to a screen by default', async () => {
      const { el } = await render();

      expect(el.querySelector('router-outlet')).not.toBeNull();
      expect(el.querySelector('app-battle-view')).toBeNull();
    });

    it('replaces the routed screen with the battle view rather than stacking them', async () => {
      // The point of the swap: a fight is somewhere the player goes, not a panel that appears
      // underneath what they were already looking at. The battle view is deliberately not a
      // route — nothing it shows survives a reload.
      const { el, battles, fixture } = await render();

      battles.isOpen.set(true);
      fixture.detectChanges();

      expect(el.querySelector('app-battle-view')).not.toBeNull();
      expect(el.querySelector('router-outlet')).toBeNull();
    });

    it('returns to the routed screen when the battle closes', async () => {
      const { el, battles, fixture } = await render((_game, fake) => fake.isOpen.set(true));

      battles.close();
      fixture.detectChanges();

      expect(el.querySelector('router-outlet')).not.toBeNull();
      expect(el.querySelector('app-battle-view')).toBeNull();
    });

    it('shows neither before the run has loaded', async () => {
      const { el } = await render((game, fake) => {
        game.start = () => Promise.resolve();
        fake.isOpen.set(true);
      });

      expect(el.querySelector('app-battle-view')).toBeNull();
      expect(el.querySelector('router-outlet')).toBeNull();
    });
  });

  describe('the tab bar', () => {
    it('offers every screen once the run is ready', async () => {
      const { el } = await render();

      const labels = [...el.querySelectorAll('.tabs__label')].map((node) =>
        node.textContent?.trim(),
      );

      expect(labels).toEqual(['Home', 'Summon', 'Roster', 'Gear', 'Shop']);
    });

    it('disappears during a fight', async () => {
      // A battle has no exit until it ends, so navigation that refused to work would be worse
      // than none at all.
      const { el, battles, fixture } = await render();

      battles.isOpen.set(true);
      fixture.detectChanges();

      expect(el.querySelector('nav')).toBeNull();
    });

    it('hides its icons from assistive tech, since every tab is also labelled', async () => {
      const { el } = await render();

      for (const icon of el.querySelectorAll('.tabs__icon')) {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      }
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

    it('keeps the nav landmark a sibling of main rather than inside it', async () => {
      const { el } = await render();

      expect(el.querySelector('main nav')).toBeNull();
      expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    });
  });
});

describe('newGame contract used by the UI', () => {
  it('starts a run with an empty wallet and no income until a stage is cleared', () => {
    // The counter deliberately does not move on a fresh run. Idle income is switched on by
    // winning the first battle, which is what makes fighting the only thing worth doing at the
    // start rather than one option among several.
    const state = newGame({ seed: 1, nowMs: T0 });

    expect(state.wallet.gold.toString()).toBe('0');
    expect(state.rates.gold.toString()).toBe('0');
    expect(state.stage).toBe(1);
  });
});
