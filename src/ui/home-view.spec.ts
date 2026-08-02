import { provideLocationMocks } from '@angular/common/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  emptyWallet,
  num,
  type OfflineReport,
  type RepairIssue,
  type Row,
  zeroRates,
} from '../core';
import { BattleService, type StageHeading } from './battle.service';
import { GameLoopService } from './game-loop.service';
import { HomeView } from './home-view';
import { type RosterEntryView, RosterService } from './roster.service';

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
  readonly wallet = signal(emptyWallet());
  readonly rates = signal(zeroRates());
  readonly gold = signal(num(0));
  readonly goldPerSec = signal(num(0));
  readonly summons = signal(num(0));
  readonly spark = signal(num(0));
}

/** One fielded character, which is all the home screen reads off the roster. */
function member(name: string, row: Row, rowSlot: number): RosterEntryView {
  return {
    defId: name.toLowerCase(),
    name,
    faction: 'elf',
    factionName: 'Elves',
    tier: 'common',
    role: 'ranger',
    rarity: 0,
    rarityLabel: 'Rare',
    level: 1,
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    inParty: true,
    row,
    rowSlot,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 1,
    ascensionCost: null,
    fodderAvailable: 0,
    canAscend: false,
  };
}

/** Only the formation, which is all the home screen asks of the roster. */
class FakeRoster {
  readonly frontRow = signal<readonly RosterEntryView[]>([member('Rin', 'front', 1)]);
  readonly backRow = signal<readonly RosterEntryView[]>([]);
  readonly fieldedCount = computed(() => this.frontRow().length + this.backRow().length);
  readonly openSlots = signal<Readonly<Record<Row, number>>>({ front: 1, back: 3 });
}

/** Only the two things the home screen asks of the animator. */
class FakeBattles {
  readonly nextStage = signal<StageHeading | null>({ name: 'Mossy Hollow', number: 1 });
  readonly fought: number[] = [];

  fight(nowMs: number): void {
    this.fought.push(nowMs);
  }
}

async function render(
  configure?: (game: FakeGameLoop, battles: FakeBattles, roster: FakeRoster) => void,
) {
  const game = new FakeGameLoop();
  const battles = new FakeBattles();
  const roster = new FakeRoster();
  configure?.(game, battles, roster);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [HomeView],
    providers: [
      // The screen links to the roster now, so `routerLink` needs a router to resolve against.
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
      { provide: BattleService, useValue: battles },
      { provide: RosterService, useValue: roster },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(HomeView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { game, battles, roster, fixture, el: fixture.nativeElement as HTMLElement };
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
      expect(el.querySelector('.hint')?.textContent).toContain('raises all four idle rates');
    });
  });

  describe('offline summary', () => {
    const report = (over: Partial<OfflineReport>): OfflineReport => ({
      rawElapsedMs: 3_600_000,
      elapsedMs: 3_600_000,
      wasCapped: false,
      earned: { gold: num('900'), xp: num('180'), essence: num(0), summons: num(0) },
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
        game.offlineReport.set(
          report({
            earned: { gold: num(0), xp: num(0), essence: num(0), summons: num(0) },
            elapsedMs: 0,
          }),
        ),
      );

      expect(el.textContent).not.toContain('While you were away');
    });
  });

  describe('the wallet strip', () => {
    it('lists every currency except gold, which has the hero treatment', async () => {
      const { el } = await render((game) => {
        game.wallet.set({
          gold: num('100'),
          xp: num('4200'),
          essence: num('17'),
          summons: num('350'),
          spark: num('2'),
        });
      });

      const labels = [...el.querySelectorAll('.wallet__label')].map((node) =>
        node.textContent?.trim(),
      );

      expect(labels).toEqual(['XP', 'Essence', 'Crystals', 'Spark']);
      expect(el.querySelector('.wallet__list')?.textContent).toContain('4.2K');
    });

    it('says where spark comes from rather than showing it a rate it does not have', async () => {
      // Spark is minted by duplicate pulls and nothing else, so a "/s" next to it would be a lie.
      const { el } = await render();

      expect(el.querySelector('.wallet__list')?.textContent).toContain('from duplicate pulls');
    });
  });

  describe('the party', () => {
    it('names who is fighting', async () => {
      const { el } = await render();

      expect(el.querySelector('.party__list')?.textContent).toContain('Rin');
    });

    it('refuses to start a fight with nobody fielded', async () => {
      // An empty party resolves as an immediate defeat, so the control says so instead of
      // letting the player walk into it.
      const { el, battles } = await render((_game, _battles, roster) => {
        roster.frontRow.set([]);
        roster.backRow.set([]);
        roster.openSlots.set({ front: 2, back: 3 });
      });

      const button = el.querySelector<HTMLButtonElement>('.fight');
      expect(button?.disabled).toBe(true);
      expect(el.querySelector('.hint')?.textContent).toContain('formation is empty');
      expect(battles.fought).toEqual([]);
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
