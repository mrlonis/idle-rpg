import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { GameLoopService } from './game-loop.service';
import { TownView } from './town-view';

/**
 * Only the two balances the hub reads.
 *
 * The screen owns no state of its own — it is two links and the numbers behind them — so a fake
 * that exposes anything more would be testing the loop rather than the screen.
 */
class FakeGameLoop {
  readonly summons = signal(num(0));
  readonly spark = signal(num(0));
}

async function render() {
  const game = new FakeGameLoop();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [TownView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TownView);
  fixture.detectChanges();

  return { game, fixture, el: fixture.nativeElement as HTMLElement };
}

function cards(el: HTMLElement): HTMLAnchorElement[] {
  return [...el.querySelectorAll<HTMLAnchorElement>('.place')];
}

function textOf(el: HTMLElement, selector: string): string[] {
  return [...el.querySelectorAll(selector)].map((node) => node.textContent?.trim() ?? '');
}

describe('TownView', () => {
  it('offers both places behind it', async () => {
    const { el } = await render();

    expect(textOf(el, '.place__name')).toEqual(['Summon', 'Spark Shop']);
  });

  it('sends each card to a child of /town, which is what keeps the tab lit inside it', async () => {
    // A flat `/summon` would work as a destination and would darken the Town tab on arrival, so
    // the prefix is load-bearing rather than tidy.
    const { el } = await render();

    expect(cards(el).map((card) => card.getAttribute('href'))).toEqual([
      '/town/summon',
      '/town/shop',
    ]);
  });

  it('carries the glyph each destination used to wear in the tab bar', async () => {
    const { el } = await render();

    expect(textOf(el, '.place__icon')).toEqual(['🔮', '✨']);
  });

  it('hides those glyphs from assistive tech, since every card is also named in text', async () => {
    const { el } = await render();

    for (const icon of el.querySelectorAll('.place__icon')) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('shows what each place spends, so a trip not worth taking can be seen before taking it', async () => {
    const { el, game, fixture } = await render();

    game.summons.set(num(1234));
    game.spark.set(num(7));
    fixture.detectChanges();

    expect(textOf(el, '.place__amount')).toEqual(['1.23K', '7']);
    expect(textOf(el, '.place__unit')).toEqual(['crystals', 'spark']);
  });

  it('keeps the balances current as the wallet moves', async () => {
    const { el, game, fixture } = await render();

    expect(textOf(el, '.place__amount')).toEqual(['0', '0']);

    game.summons.set(num(50));
    fixture.detectChanges();

    expect(textOf(el, '.place__amount')).toEqual(['50', '0']);
  });

  it('draws the places as links rather than buttons, because they change where the player is', async () => {
    const { el } = await render();

    expect(cards(el)).toHaveLength(2);
    expect(el.querySelectorAll('.place button')).toHaveLength(0);
  });
});
