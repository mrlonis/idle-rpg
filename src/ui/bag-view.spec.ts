import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { BagView } from './bag-view';
import {
  type GearBonusView,
  type GearItemView,
  GearService,
  type GearSlotView,
} from './gear.service';

/**
 * The bag, driven from a fake service.
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
    salvageValue: '1.42K',
    power: 3.2,
    wornBy: null,
    wornByName: null,
    enhanceCost: { alloy: num(118), gold: num(674) },
    canAffordEnhance: true,
    ...over,
  };
}

class FakeGear {
  readonly loose = signal<readonly GearItemView[]>([item()]);
  readonly alloy = signal(num(250_000));

  /** What each call was handed, so a test can assert the screen asked for the right thing. */
  readonly enhanced: string[] = [];
  readonly salvaged: string[][] = [];

  /** Flipped by a test that wants the refusal path rather than the happy one. */
  failWith: 'insufficient-currency' | 'item-equipped' | null = null;

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
    imports: [BagView],
    providers: [{ provide: GearService, useValue: gear }],
  }).compileComponents();

  const fixture = TestBed.createComponent(BagView);
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

describe('BagView', () => {
  it('is the bag, and no longer carries the shop that used to sit above it', async () => {
    // The forge went to `/town/gear-shop` with the other currency sinks. A tab named for a
    // category cannot also be half a shop, and a sink in Town costs exactly one tap to reach.
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent).toBe('Bag');
    expect(el.querySelector('.offers')).toBeNull();
    expect(el.querySelector('.restock')).toBeNull();
  });

  it('heads the gear it holds as a section, so a second item type can sit beside it', async () => {
    const { el } = await render();

    expect(el.querySelector('#bag-label')?.textContent).toBe('Gear');
  });

  it('shows what enhancement is charged against', async () => {
    const { el } = await render();

    expect(el.querySelector('.head__amount')?.textContent).toBe('250K');
    expect(el.querySelector('.head__unit')?.textContent).toBe('alloy');
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
    // Gear is the gold sink milestone 12 exists to create, so the gold half is not a footnote.
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

    expect(el.querySelector('.detail__salvage')?.textContent).toContain('1.42K alloy');
  });

  it('quotes the same salvage figure on the button and in the confirmation', async () => {
    // They disagreed once — one printing `3288` and the other `3,288`. The view model formats it
    // at the seam now, so there is no second place for a convention to be chosen.
    const { el, fixture } = await render();

    click(el, '.item__row', fixture);
    const onButton = el.querySelector('.detail__salvage')?.textContent ?? '';
    click(el, '.detail__salvage', fixture);

    expect(el.querySelector('[role="status"]')?.textContent).toContain('1.42K alloy');
    expect(onButton).toContain('1.42K alloy');
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
});
