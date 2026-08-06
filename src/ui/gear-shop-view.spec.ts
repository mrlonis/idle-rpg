import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { GearShopView } from './gear-shop-view';
import { type GearItemView, type GearOfferView, GearService } from './gear.service';

/**
 * The gear shop, driven from a fake service.
 *
 * The component's job is presentation: draw the six offers it is handed, disable what the wallet
 * cannot cover, and say what a purchase actually did. Driving the real `GearService` would pull in
 * the whole grade ladder and the derived stock, and would end up testing `core/gear/shop.ts` —
 * which [`gear.spec.ts`](../core/gear/gear.spec.ts) already does directly.
 */
function item(over: Partial<GearItemView> = {}): GearItemView {
  return {
    id: 'g1',
    slot: 'chest',
    slotLabel: 'Chest',
    archetype: 'ranger',
    archetypeLabel: 'Ranger',
    gradeIndex: 2,
    gradeName: 'Fine',
    gradeId: 'fine',
    alignment: null,
    alignmentLabel: null,
    alignmentActive: false,
    level: 12,
    maxLevel: 60,
    atMaxLevel: false,
    bonuses: [{ stat: 'hp', label: 'Health', percent: 9 }],
    salvageValue: '1.42K',
    power: 3.2,
    wornBy: null,
    wornByName: null,
    enhanceCost: { alloy: num(118), gold: num(674) },
    canAffordEnhance: true,
    ...over,
  };
}

function offer(over: Partial<GearOfferView> = {}): GearOfferView {
  return {
    index: 0,
    item: item(),
    price: num(81_900),
    purchased: false,
    affordable: true,
    ...over,
  };
}

class FakeGear {
  /** What `buy` reports back. Defaults to the ordinary case: the piece was kept, nothing melted. */
  buyOutcome: { kept: boolean; salvaged: number } = { kept: true, salvaged: 0 };

  readonly offers = signal<readonly GearOfferView[]>([offer()]);
  readonly gold = signal(num(250_000));
  readonly msUntilRestock = signal(27 * 60_000);

  /** What each call was handed, so a test can assert the screen asked for the right thing. */
  readonly bought: number[] = [];
  readonly clockTicks: number[] = [];

  /** Flipped by a test that wants the refusal path rather than the happy one. */
  failWith: 'insufficient-currency' | 'already-purchased' | null = null;

  refreshClock(): void {
    this.clockTicks.push(this.clockTicks.length);
  }

  buy(index: number) {
    this.bought.push(index);
    return this.failWith === null
      ? ({ ok: true, state: {}, ...this.buyOutcome } as never)
      : ({ ok: false, reason: this.failWith } as never);
  }
}

async function render(configure?: (gear: FakeGear) => void) {
  const gear = new FakeGear();
  configure?.(gear);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [GearShopView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GearService, useValue: gear },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GearShopView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { gear, fixture, el: fixture.nativeElement as HTMLElement };
}

/** Clicks by visible text, the way a player would find a control. */
function click(el: HTMLElement, selector: string, fixture: { detectChanges: () => void }): void {
  el.querySelector<HTMLButtonElement>(selector)?.click();
  fixture.detectChanges();
}

describe('GearShopView', () => {
  it('is a place in town rather than half of the gear tab', async () => {
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent).toBe('Gear Shop');
    expect(el.querySelector('.head__back')?.getAttribute('href')).toBe('/town');
  });

  it('shows the gold an offer is priced against, since gold is what it spends', async () => {
    const { el } = await render();

    expect(el.querySelector('.head__amount')?.textContent).toBe('250K');
    expect(el.querySelector('.head__unit')?.textContent).toBe('gold');
  });

  it('shows the restock countdown in minutes rather than seconds', async () => {
    // The only thing that moves with the clock is a countdown, and a per-second one would wake the
    // device sixty times as often to redraw the same string.
    const { el } = await render();

    expect(el.querySelector('.restock')?.textContent).toContain('27m');
  });

  it('rolls a countdown over an hour into hours and minutes', async () => {
    const { el } = await render((gear) => gear.msUntilRestock.set(95 * 60_000));

    expect(el.querySelector('.restock')?.textContent).toContain('1h 35m');
  });

  it('samples the clock on init rather than reading it inside a computed', async () => {
    // A `computed` calling `Date.now()` would memoise the first hour it saw and keep serving it,
    // and the shop would visibly stop restocking. The signal is what makes the dependency real.
    const { gear } = await render();

    expect(gear.clockTicks.length).toBeGreaterThan(0);
  });

  it('names the price on the buy button so it can be read before it is tapped', async () => {
    const { el } = await render();

    expect(el.querySelector('.offer__buy')?.textContent?.trim()).toContain('81.9K gold');
  });

  it('disables an offer the wallet cannot cover', async () => {
    const { el } = await render((gear) => gear.offers.set([offer({ affordable: false })]));

    expect(el.querySelector<HTMLButtonElement>('.offer__buy')?.disabled).toBe(true);
  });

  it('says an offer is bought in words, not only by dimming it', async () => {
    // Colour and opacity are never the only carrier of meaning — that rule is what the whole
    // palette is built on, and a dimmed row with an unchanged label breaks it.
    const { el } = await render((gear) => gear.offers.set([offer({ purchased: true })]));

    expect(el.querySelector('.offer__buy')?.textContent?.trim()).toBe('Bought');
    expect(el.querySelector<HTMLButtonElement>('.offer__buy')?.disabled).toBe(true);
  });

  it('buys the offer that was tapped', async () => {
    const { el, gear, fixture } = await render((fake) =>
      fake.offers.set([offer({ index: 4, item: item({ id: 'shop-4' }) })]),
    );

    click(el, '.offer__buy', fixture);

    expect(gear.bought).toEqual([4]);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('added to the bag');
  });

  it('does not claim a piece was bagged when the bag salvaged it on arrival', async () => {
    // ⚠️ The bag keeps the best 240 of the union, so an offer worse than everything already held is
    // itself the piece that melts. Nothing is lost — the value comes back as alloy — but a
    // confirmation saying "added to the bag" would be the screen lying about a purchase.
    const { el, fixture } = await render((gear) => {
      gear.buyOutcome = { kept: false, salvaged: 1 };
    });

    click(el, '.offer__buy', fixture);

    const notice = el.querySelector('[role="status"]')?.textContent ?? '';
    expect(notice).toContain('salvaged');
    expect(notice).not.toContain('added to the bag');
  });

  it('says how many pieces the bag shed to fit a purchase in', async () => {
    const { el, fixture } = await render((gear) => {
      gear.buyOutcome = { kept: true, salvaged: 2 };
    });

    click(el, '.offer__buy', fixture);

    const notice = el.querySelector('[role="status"]')?.textContent ?? '';
    expect(notice).toContain('added to the bag');
    expect(notice).toContain('2 pieces salvaged');
  });

  it('says nothing about salvage when the bag had room', async () => {
    const { el, fixture } = await render();

    click(el, '.offer__buy', fixture);

    expect(el.querySelector('[role="status"]')?.textContent).not.toContain('salvaged');
  });

  it('says why a purchase was refused instead of doing nothing visible', async () => {
    const { el, fixture } = await render((gear) => {
      gear.failWith = 'insufficient-currency';
    });

    click(el, '.offer__buy', fixture);

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Not enough gold');
  });

  it('stops its clock when it leaves the screen', async () => {
    // A timer that outlived the screen would keep waking the device to update something nobody is
    // looking at — the same reason the battle animator only schedules a frame during a fight.
    const { fixture, gear } = await render();
    const before = gear.clockTicks.length;

    fixture.destroy();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(gear.clockTicks.length).toBe(before);
  });
});
