import { provideLocationMocks } from '@angular/common/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_FORMATION,
  CURRENCY_IDS,
  type CurrencyId,
  emptyWallet,
  num,
  type OfflineReport,
  type RepairIssue,
  zeroRates,
} from '../core';
import { BattleService, type StageHeading } from './battle.service';
import { CURRENCY_LABELS } from './format-numeric';
import { type CrewView, FormationService } from './formation.service';
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
  readonly wallet = signal(emptyWallet());
  readonly rates = signal(zeroRates());
  // Derived from the wallet and the rate table, exactly as the real service derives them. Two
  // independent signals would let a test set a gold balance the real service could never
  // produce alongside its own wallet.
  readonly gold = computed(() => this.wallet().gold);
  readonly goldPerSec = computed(() => this.rates().gold);
  readonly summons = computed(() => this.wallet().summons);
  readonly spark = computed(() => this.wallet().spark);

  dismissOfflineReport(): void {
    this.offlineReport.set(null);
  }
}

/** A wallet holding one currency, since most tests care about exactly one. */
function walletWith(id: CurrencyId, amount: string) {
  return { ...emptyWallet(), [id]: num(amount) };
}

/** An hour away with something to show for it, which is the case the summary is drawn for. */
function report(over: Partial<OfflineReport> = {}): OfflineReport {
  return {
    rawElapsedMs: 3_600_000,
    elapsedMs: 3_600_000,
    earned: { gold: num('900'), xp: num('180'), essence: num(0), summons: num(0) },
    ...over,
  };
}

/**
 * The campaign crew, which is the whole of what the home screen asks about the roster.
 *
 * A `CrewView` rather than a list of rows: since milestone 15a the screen reads `size` and `open`
 * to write its hint and nothing else — placement moved to the formation editor, and so did every
 * assertion about it.
 */
function crew(over: Partial<CrewView> = {}): CrewView {
  return {
    activity: { id: CAMPAIGN_FORMATION, name: 'Campaign', kind: 'campaign' },
    front: [],
    back: [],
    size: 1,
    open: { front: 1, back: 3 },
    lineup: { bonus: EMPTY_BONUS, tier: null, counts: [], rallyCount: 0, ladderCount: 0 },
    eligible: [],
    lockFaction: null,
    away: [],
    ready: true,
    ...over,
  };
}

/** A lineup paying nothing, which is what a one-character crew earns. */
const EMPTY_BONUS = {
  attack: 0,
  health: 0,
  defence: 0,
  critChance: 0,
  critDamageAmp: 0,
  haste: 0,
  injuredEnergyRegen: 0,
};

/** Only the crew lookup, which is all the home screen asks of the formations. */
class FakeFormations {
  readonly campaign = signal<CrewView | null>(crew());

  crew(activityId: string): CrewView | null {
    return activityId === CAMPAIGN_FORMATION ? this.campaign() : null;
  }
}

/** Only the three things the home screen asks of the animator. */
class FakeBattles {
  readonly nextStage = signal<StageHeading | null>({
    name: 'Mossy Hollow',
    chapter: 1,
    chapterName: 'The Sunken Fen',
    number: 1,
    level: 1,
  });
  /** Set when an auto-battle run ended in a loss, which is what dropped the player back here. */
  readonly autoStoppedAt = signal<StageHeading | null>(null);
  readonly fought: number[] = [];

  fight(nowMs: number): void {
    this.fought.push(nowMs);
  }

  dismissAutoStopped(): void {
    this.autoStoppedAt.set(null);
  }
}

async function render(
  configure?: (game: FakeGameLoop, battles: FakeBattles, formations: FakeFormations) => void,
) {
  const game = new FakeGameLoop();
  const battles = new FakeBattles();
  const formations = new FakeFormations();
  configure?.(game, battles, formations);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [HomeView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
      { provide: BattleService, useValue: battles },
      { provide: FormationService, useValue: formations },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(HomeView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { game, battles, formations, fixture, el: fixture.nativeElement as HTMLElement };
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
        battles.nextStage.set({
          name: 'Cutthroat Camp',
          chapter: 1,
          chapterName: 'The Sunken Fen',
          number: 5,
          level: 6,
        }),
      );

      expect(el.querySelector('.fight')?.textContent?.trim()).toBe('Fight 1-5 — Cutthroat Camp');
    });

    it('stays quiet about a stage it does not know yet', async () => {
      const { el } = await render((_game, battles) => battles.nextStage.set(null));

      expect(el.querySelector('.fight')?.textContent?.trim()).toBe('Preparing…');
    });

    it('links to the crew editor rather than starting the fight itself', async () => {
      // ⚠️ Every battle passes through the pre-battle screen now, so this control navigates and
      // starts nothing. A version that still called `fight()` would skip the step the whole of
      // milestone 15a exists to add.
      const { el, battles } = await render();

      const link = el.querySelector<HTMLAnchorElement>('.fight');
      expect(link?.getAttribute('href')).toBe('/prepare/campaign');
      expect(battles.fought).toEqual([]);
    });

    it('still points at the editor with nobody standing, and says why', async () => {
      // An empty crew used to disable the control, which left a new player on a dead button with
      // a hint pointing at another screen. The link is now the fix for the thing it reports.
      const { el } = await render((_game, _battles, formations) => {
        formations.campaign.set(crew({ size: 0, open: { front: 2, back: 3 }, ready: false }));
      });

      expect(el.querySelector<HTMLAnchorElement>('.fight')?.getAttribute('href')).toBe(
        '/prepare/campaign',
      );
      expect(el.querySelector('.hint')?.textContent).toContain('crew is empty');
    });
  });

  describe('the hint under the counter', () => {
    it('tells a fresh run which rate is already running and what starts the rest', async () => {
      // Crystals accrue from the first minute; the other three wait for a clear. A line that
      // said "idle earns nothing" would now be contradicted by the counter directly above it.
      const { el } = await render((game) => game.rates.set(zeroRates()));

      expect(el.querySelector('.hint')?.textContent).toContain('Crystals are already accruing');
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
    it('reports what was earned while away', async () => {
      const { el } = await render((game) => game.offlineReport.set(report({})));

      expect(el.textContent).toContain('1 hour');
      expect(el.textContent).toContain('900');
    });

    it('reports a very long absence in full, since there is no cap', async () => {
      const year = 365 * 24 * 60 * 60 * 1000;
      const { el } = await render((game) =>
        game.offlineReport.set(report({ rawElapsedMs: year, elapsedMs: year })),
      );

      expect(el.textContent).toContain('365 days');
      expect(el.textContent).not.toContain('capped');
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

  describe('dismissing a notice', () => {
    /** Clicks a close button and lets the removal render. */
    async function dismiss(fixture: Awaited<ReturnType<typeof render>>['fixture'], label: string) {
      const el = fixture.nativeElement as HTMLElement;
      el.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)?.click();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    it('closes the offline summary and clears it on the service', async () => {
      // Cleared on the service, not hidden by the screen: this component is lazily routed and
      // is rebuilt on every navigation, so a flag held here would restore the banner on the
      // player's next visit home.
      const { el, fixture, game } = await render((loop) => loop.offlineReport.set(report()));
      expect(el.textContent).toContain('While you were away');

      await dismiss(fixture, 'Dismiss offline earnings notice');

      expect(el.textContent).not.toContain('While you were away');
      expect(game.offlineReport()).toBeNull();
    });

    it('closes the auto-battle notice and clears it on the service', async () => {
      const { el, fixture, battles } = await render((_game, animator) =>
        animator.autoStoppedAt.set({
          name: 'Cutthroat Camp',
          chapter: 1,
          chapterName: 'The Sunken Fen',
          number: 5,
          level: 6,
        }),
      );
      expect(el.textContent).toContain('Auto-battle stopped');

      await dismiss(fixture, 'Dismiss auto-battle notice');

      expect(el.textContent).not.toContain('Auto-battle stopped');
      expect(battles.autoStoppedAt()).toBeNull();
    });

    it('leaves the save-health notices with no way to close them', async () => {
      // The two dismissible notices report something that has finished; this one reports what
      // this run *is* — started from nothing because the save on disk could not be read — and a
      // player who closed it would have no way to find that out again.
      const { el } = await render((game) => game.loadFailure.set('unreadable'));

      expect(el.querySelector('[role="alert"]')).not.toBeNull();
      expect(el.querySelectorAll('.notice__close')).toHaveLength(0);
    });

    it('keeps the close button out of the live region', async () => {
      // A live region announces its whole subtree on insertion, so a button inside one would
      // have the player told "Dismiss" as part of the news itself.
      const { el } = await render((game) => game.offlineReport.set(report()));

      const status = el.querySelector('[role="status"]');
      expect(status?.textContent).toContain('While you were away');
      expect(status?.querySelector('.notice__close')).toBeNull();
      expect(el.querySelector('.notice__close')).not.toBeNull();
    });

    it('gives the close button a name and a thumb-sized target', async () => {
      const { el } = await render((game) => game.offlineReport.set(report()));

      const close = el.querySelector<HTMLButtonElement>('.notice__close');
      expect(close?.getAttribute('aria-label')).toBe('Dismiss offline earnings notice');
      // `type` matters: a bare button inside a form would submit it.
      expect(close?.getAttribute('type')).toBe('button');
      // The glyph is decorative — the label above is what is announced.
      expect(close?.querySelector('[aria-hidden="true"]')?.textContent).toBe('×');
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
          alloy: num('880'),
        });
      });

      const { labels, amounts } = walletStrip(el);

      // Derived from `CURRENCY_IDS` rather than retyped, because the claim is "every currency" and
      // a hardcoded list of five silently stops testing that the moment a sixth is added — which
      // is exactly what milestone 12 did with `alloy`. The order matters as much as the contents:
      // gold sits *among* the others rather than above them, which is what stops one currency
      // reading as the score.
      expect(labels.map((label) => label?.toLowerCase())).toEqual(
        CURRENCY_IDS.map((id) => CURRENCY_LABELS[id].toLowerCase()),
      );
      expect(amounts).toEqual(['100', '4.2K', '17', '350', '2', '880']);
      // Nothing outside the strip is showing gold a second time.
      expect(el.querySelectorAll('.wallet__item')).toHaveLength(CURRENCY_IDS.length);
    });

    it('says where spark comes from rather than showing it a rate it does not have', async () => {
      // Spark is minted by duplicate pulls and nothing else, so a "/s" next to it would be a lie.
      const { el } = await render();

      expect(el.querySelector('.wallet__list')?.textContent).toContain('from duplicate pulls');
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
      // It says what happened rather than reassuring. This used to promise the old save was
      // intact, which was true only while a failed load barred the way to the primary slot —
      // since the v0 reset the fresh run replaces it, and copy that kept promising otherwise
      // would be the worst kind of stale: the kind a player relies on.
      expect(alert?.textContent).toContain('It has replaced the old one');
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
