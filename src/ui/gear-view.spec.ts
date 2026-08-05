import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { GearView } from './gear-view';
import {
  type GearBonusView,
  type GearItemView,
  type GearOfferView,
  GearService,
  type GearSlotView,
} from './gear.service';

/**
 * The gear screen, driven from a fake service.
 *
 * The component's job is presentation: draw what it is handed, disable what cannot be done, and
 * say why when an action is refused. Driving the real `GearService` would pull in the whole grade
 * ladder and the run's state, and would end up testing `core/gear/` — which
 * [`gear.spec.ts`](../core/gear/gear.spec.ts) already does directly.
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
    salvageValue: 1420,
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
  readonly offers = signal<readonly GearOfferView[]>([offer()]);
  readonly loose = signal<readonly GearItemView[]>([item()]);
  readonly alloy = signal(num(250_000));
  readonly msUntilRestock = signal(27 * 60_000);

  /** What each call was handed, so a test can assert the screen asked for the right thing. */
  readonly enhanced: string[] = [];
  readonly salvaged: string[][] = [];
  readonly bought: number[] = [];
  readonly clockTicks: number[] = [];

  /** Flipped by a test that wants the refusal path rather than the happy one. */
  failWith: 'insufficient-currency' | 'item-equipped' | null = null;

  refreshClock(): void {
    this.clockTicks.push(this.clockTicks.length);
  }

  enhance(itemId: string) {
    this.enhanced.push(itemId);
    return this.failWith === null
      ? ({ ok: true, state: {} } as never)
      : ({ ok: false, reason: this.failWith } as never);
  }

  salvage(itemIds: readonly string[]) {
    this.salvaged.push([...itemIds]);
    return this.failWith === null
      ? ({ ok: true, state: {} } as never)
      : ({ ok: false, reason: this.failWith } as never);
  }

  buy(index: number) {
    this.bought.push(index);
    return this.failWith === null
      ? ({ ok: true, state: {} } as never)
      : ({ ok: false, reason: this.failWith } as never);
  }

  slots(): readonly GearSlotView[] {
    return [];
  }

  bonusFor(): readonly GearBonusView[] {
    return [];
  }
}

async function render(configure?: (gear: FakeGear) => void) {
  const gear = new FakeGear();
  configure?.(gear);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [GearView],
    providers: [{ provide: GearService, useValue: gear }],
  }).compileComponents();

  const fixture = TestBed.createComponent(GearView);
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

describe('GearView', () => {
  it('lists the forge and the bag as separate sections', async () => {
    const { el } = await render();

    expect(el.querySelector('#shop-label')?.textContent).toBe('Forge');
    expect(el.querySelector('#bag-label')?.textContent).toBe('Bag');
  });

  it('shows the restock countdown in minutes rather than seconds', async () => {
    // The only thing that moves with the clock is a countdown, and a per-second one would wake the
    // device sixty times as often to redraw the same string.
    const { el } = await render();

    expect(el.querySelector('.shop__restock')?.textContent).toContain('27m');
  });

  it('rolls a countdown over an hour into hours and minutes', async () => {
    const { el } = await render((gear) => gear.msUntilRestock.set(95 * 60_000));

    expect(el.querySelector('.shop__restock')?.textContent).toContain('1h 35m');
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

  it('says why a purchase was refused instead of doing nothing visible', async () => {
    const { el, fixture } = await render((gear) => {
      gear.failWith = 'insufficient-currency';
    });

    click(el, '.offer__buy', fixture);

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Not enough gold');
  });

  it('tells a run with nothing spare where gear comes from', async () => {
    const { el } = await render((gear) => gear.loose.set([]));

    expect(el.querySelector('.empty')?.textContent).toContain('Every stage clear drops a piece');
    expect(el.querySelector('.item')).toBeNull();
  });

  it('keeps a bag row collapsed until it is opened', async () => {
    // One open row at a time. Two hundred rows each carrying two buttons and a cost breakdown is
    // a wall; a list of names with one open row is something a thumb can work through.
    const { el, fixture } = await render();

    expect(el.querySelector('.detail')).toBeNull();
    expect(el.querySelector('.item__row')?.getAttribute('aria-expanded')).toBe('false');

    click(el, '.item__row', fixture);

    expect(el.querySelector('.detail')).not.toBeNull();
    expect(el.querySelector('.item__row')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes an open row when it is tapped again', async () => {
    const { el, fixture } = await render();

    click(el, '.item__row', fixture);
    click(el, '.item__row', fixture);

    expect(el.querySelector('.detail')).toBeNull();
  });

  it('quotes both halves of the enhancement price', async () => {
    // Gear is the gold sink this milestone exists to create, so the gold half is not a footnote.
    const { el, fixture } = await render();

    click(el, '.item__row', fixture);

    const cost = el.querySelector('.detail__cost')?.textContent;
    expect(cost).toContain('118');
    expect(cost).toContain('674');
  });

  it('enhances the piece whose row is open', async () => {
    const { el, gear, fixture } = await render((fake) =>
      fake.loose.set([item({ id: 'g7', level: 3 })]),
    );

    click(el, '.item__row', fixture);
    click(el, '.detail__enhance', fixture);

    expect(gear.enhanced).toEqual(['g7']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('level 4');
  });

  it('disables enhancement at the grade cap and says so on the button', async () => {
    const { el, fixture } = await render((gear) =>
      gear.loose.set([item({ atMaxLevel: true, enhanceCost: null })]),
    );

    click(el, '.item__row', fixture);

    expect(el.querySelector<HTMLButtonElement>('.detail__enhance')?.disabled).toBe(true);
    expect(el.querySelector('.detail__enhance')?.textContent?.trim()).toBe('Maxed');
    expect(el.querySelector('.detail__cost')?.textContent).toContain('maximum level');
  });

  it('disables enhancement the wallet cannot cover, and says which problem it is', async () => {
    const { el, fixture } = await render((gear) =>
      gear.loose.set([item({ canAffordEnhance: false })]),
    );

    click(el, '.item__row', fixture);

    expect(el.querySelector('.detail__enhance')?.textContent?.trim()).toBe('Cannot afford');
  });

  it('names what salvage pays before it is tapped', async () => {
    const { el, fixture } = await render();

    click(el, '.item__row', fixture);

    expect(el.querySelector('.detail__salvage')?.textContent).toContain('1420 alloy');
  });

  it('closes the row it just salvaged, since the piece is gone', async () => {
    const { el, gear, fixture } = await render();

    click(el, '.item__row', fixture);
    click(el, '.detail__salvage', fixture);

    expect(gear.salvaged).toEqual([['g1']]);
    expect(el.querySelector('.detail')).toBeNull();
  });

  it('explains a refused salvage in terms of the rule behind it', async () => {
    // "Equipped gear is never consumed" is settled law rather than a validation quirk, so the
    // message names the rule instead of just reporting the refusal.
    const { el, fixture } = await render((gear) => {
      gear.failWith = 'item-equipped';
    });

    click(el, '.item__row', fixture);
    click(el, '.detail__salvage', fixture);

    expect(el.querySelector('[role="status"]')?.textContent).toContain('never consumed');
  });

  it('wires each disclosure to the panel it controls', async () => {
    // The attribute pair is what makes a disclosure announce as one; without it the panel is
    // markup that appears out of nowhere for anybody not looking at the screen.
    const { el } = await render();

    const row = el.querySelector('.item__row');
    expect(row?.getAttribute('aria-controls')).toBe('gear-g1');
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
