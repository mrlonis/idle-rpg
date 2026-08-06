import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { AchievementsService } from './achievements.service';
import { GameLoopService } from './game-loop.service';
import { QuestsService } from './quests.service';
import { RosterService } from './roster.service';
import { TownView } from './town-view';

/**
 * Only the balances the hub reads.
 *
 * The screen owns no state of its own — it is a list of links and the numbers behind them — so a
 * fake that exposes anything more would be testing the loop rather than the screen.
 */
class FakeGameLoop {
  readonly summons = signal(num(0));
  readonly gold = signal(num(0));
  readonly spark = signal(num(0));
}

/** The Altar's card counts characters rather than currency, and that count is the roster's. */
class FakeRoster {
  readonly readyToAscend = signal(0);
}

/** Achievements counts awards waiting, which is a quantity of nothing spendable. */
class FakeAchievements {
  readonly unclaimed = signal(0);
}

/** Quests counts finished-and-unclaimed, which is likewise not a currency. */
class FakeQuests {
  readonly claimable = signal(0);
}

async function render() {
  const game = new FakeGameLoop();
  const roster = new FakeRoster();
  const achievements = new FakeAchievements();
  const quests = new FakeQuests();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [TownView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
      { provide: RosterService, useValue: roster },
      { provide: AchievementsService, useValue: achievements },
      { provide: QuestsService, useValue: quests },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TownView);
  fixture.detectChanges();

  return { game, roster, achievements, quests, fixture, el: fixture.nativeElement as HTMLElement };
}

function cards(el: HTMLElement): HTMLAnchorElement[] {
  return [...el.querySelectorAll<HTMLAnchorElement>('.place')];
}

function textOf(el: HTMLElement, selector: string): string[] {
  return [...el.querySelectorAll(selector)].map((node) => node.textContent?.trim() ?? '');
}

describe('TownView', () => {
  it('offers every place behind it', async () => {
    const { el } = await render();

    expect(textOf(el, '.place__name')).toEqual([
      'Summon',
      'Altar',
      'Quests',
      'Achievements',
      'Gear Shop',
      'Spark Shop',
    ]);
  });

  it('sends each card to a child of /town, which is what keeps the tab lit inside it', async () => {
    // A flat `/summon` would work as a destination and would darken the Town tab on arrival, so
    // the prefix is load-bearing rather than tidy.
    const { el } = await render();

    expect(cards(el).map((card) => card.getAttribute('href'))).toEqual([
      '/town/summon',
      '/town/altar',
      '/town/quests',
      '/town/achievements',
      '/town/gear-shop',
      '/town/shop',
    ]);
  });

  it('carries the glyph each destination used to wear in the tab bar', async () => {
    // The toolbox included: it led to the forge when the forge was half of the gear tab, and it
    // followed the forge here rather than staying on the tab that became the Bag. The Altar is
    // the exception that proves nothing — it never had a tab, so its candle is new.
    const { el } = await render();

    expect(textOf(el, '.place__icon')).toEqual(['🔮', '🕯️', '📜', '🏆', '🧰', '✨']);
  });

  it('hides those glyphs from assistive tech, since every card is also named in text', async () => {
    const { el } = await render();

    for (const icon of el.querySelectorAll('.place__icon')) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('shows what each place spends, so a trip not worth taking can be seen before taking it', async () => {
    // The Altar's figure is not a wallet balance — copies are held per character, so what decides
    // the trip is how many characters could climb a rung right now.
    const { el, game, roster, achievements, quests, fixture } = await render();

    game.summons.set(num(1234));
    roster.readyToAscend.set(3);
    achievements.unclaimed.set(2);
    quests.claimable.set(1);
    game.gold.set(num(89_000));
    game.spark.set(num(7));
    fixture.detectChanges();

    expect(textOf(el, '.place__amount')).toEqual(['1.23K', '3', '1', '2', '89K', '7']);
    expect(textOf(el, '.place__unit')).toEqual([
      'crystals',
      'ready',
      'ready',
      'waiting',
      'gold',
      'spark',
    ]);
  });

  it('keeps the balances current as the wallet moves', async () => {
    const { el, game, fixture } = await render();

    expect(textOf(el, '.place__amount')).toEqual(['0', '0', '0', '0', '0', '0']);

    game.summons.set(num(50));
    fixture.detectChanges();

    expect(textOf(el, '.place__amount')).toEqual(['50', '0', '0', '0', '0', '0']);
  });

  it('draws the places as links rather than buttons, because they change where the player is', async () => {
    const { el } = await render();

    expect(cards(el)).toHaveLength(6);
    expect(el.querySelectorAll('.place button')).toHaveLength(0);
  });
});
