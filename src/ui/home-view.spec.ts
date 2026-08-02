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
  // Derived from the wallet and the rate table, exactly as the real service derives them. Two
  // independent signals would let a test set a gold balance the real service could never
  // produce alongside its own wallet.
  readonly gold = computed(() => this.wallet().gold);
  readonly goldPerSec = computed(() => this.rates().gold);
  readonly summons = computed(() => this.wallet().summons);
  readonly spark = computed(() => this.wallet().spark);
}

/** A wallet holding one currency, since most tests care about exactly one. */
function walletWith(id: 'gold' | 'xp' | 'essence' | 'summons' | 'spark', amount: string) {
  return { ...emptyWallet(), [id]: num(amount) };
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

/** The wallet strip, as three parallel lists in the order the cards are laid out. */
function walletStrip(el: HTMLElement) {
  const text = (selector: string) =>
    [...el.querySelectorAll(selector)].map((node) => node.textContent?.trim());

  return {
    labels: text('.wallet__label'),
    amounts: text('.wallet__amount'),
    rates: text('.wallet__rate'),
  };
}

describe('HomeView', () => {
  it('renders gold formatted, not as a raw Decimal', async () => {
    const { el } = await render((game) => game.wallet.set(walletWith('gold', '1234567')));

    // The whole reason formatNumeric exists: DecimalPipe cannot render a Decimal.
    expect(walletStrip(el).amounts[0]).toBe('1.23M');
    expect(el.textContent).not.toContain('[object Object]');
  });

  it('renders the rate with its unit', async () => {
    const { el } = await render((game) => game.rates.set({ ...zeroRates(), gold: num('250') }));

    expect(walletStrip(el).rates[0]).toBe('250/s');
  });

  it('renders values past float64 exact-integer range', async () => {
    const { el } = await render((game) => game.wallet.set(walletWith('gold', '1.2345e+30')));

    expect(walletStrip(el).amounts[0]).toBe('1.23No');
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
      const { el } = await render((game) => game.rates.set(zeroRates()));

      expect(el.querySelector('.hint')?.textContent).toContain('Win a stage');
    });

    it('stops saying that once income is flowing', async () => {
      // Leaving it up would be untrue, and would teach the player to ignore this line.
      const { el } = await render((game) => game.rates.set({ ...zeroRates(), gold: num('1.5') }));

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
    it('lists every currency, gold among them rather than above them', async () => {
      const { el } = await render((game) => {
        game.wallet.set({
          gold: num('100'),
          xp: num('4200'),
          essence: num('17'),
          summons: num('350'),
          spark: num('2'),
        });
      });

      const { labels, amounts } = walletStrip(el);

      expect(labels).toEqual(['Gold', 'XP', 'Essence', 'Crystals', 'Spark']);
      expect(amounts).toEqual(['100', '4.2K', '17', '350', '2']);
      // Nothing outside the strip is showing gold a second time.
      expect(el.querySelectorAll('.wallet__item')).toHaveLength(5);
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

    it('links each name to that character sheet', async () => {
      // Levelling somebody up is the reason to tap a name here, and the character sheet is
      // where that happens — going via the roster screen to reach it is a wasted step.
      const { el } = await render((_game, _battles, roster) => {
        roster.frontRow.set([member('Rin', 'front', 1)]);
        roster.backRow.set([member('Wren', 'back', 1)]);
      });

      const links = [...el.querySelectorAll<HTMLAnchorElement>('.party__name')];

      expect(links.map((link) => link.textContent?.trim())).toEqual(['Rin', 'Wren']);
      expect(links.map((link) => link.getAttribute('href'))).toEqual([
        '/roster/rin',
        '/roster/wren',
      ]);
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
    it('names the screen with a single top-level heading', async () => {
      // The gold hero block used to carry this screen's only `h1`. Folding it into the wallet
      // strip would have left the page with no `h1` at all.
      const { el } = await render();

      expect([...el.querySelectorAll('h1')].map((node) => node.textContent?.trim())).toEqual([
        'Home',
      ]);
    });

    it('labels the wallet strip with a heading rather than announcing every change', async () => {
      // An aria-live region here would fire ~6 times a second and make a screen reader
      // unusable. The labels name the values so they stay reachable on demand.
      const { el } = await render();

      const section = el.querySelector('.wallet');
      expect(section?.getAttribute('aria-labelledby')).toBe('wallet-label');
      expect(el.querySelector('#wallet-label')?.textContent).toContain('Currencies');
      expect(el.querySelector('.wallet__amount')?.getAttribute('aria-live')).toBeNull();
    });
  });
});
