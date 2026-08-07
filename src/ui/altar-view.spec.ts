import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { type RosterResult } from '../core';
import { AltarView } from './altar-view';
import { type AscensionRunView, type RosterEntryView, RosterService } from './roster.service';

/** One roster row, unremarkable, with only what a test cares about overridden. */
function entry(over: Partial<RosterEntryView> = {}): RosterEntryView {
  return {
    defId: 'rin',
    name: 'Rin',
    faction: 'elf',
    factionName: 'Elves',
    tier: 'common',
    role: 'ranger',
    rarity: 2,
    rarityLabel: 'Rare',
    rarityFamily: 'rare',
    level: 12,
    resonated: false,
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    inParty: false,
    row: null,
    rowSlot: null,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 12,
    ascensionCost: 4,
    canAscend: false,
    ...over,
  };
}

/**
 * A stand-in for the real roster.
 *
 * The component's job is presentation and dispatch: sort the roster into who can climb and who
 * cannot, say what a press did, and honour the `focus` parameter. Driving the real service would
 * pull in the game loop and end up testing `core/roster/ascend.ts`, which
 * [`ascend.spec.ts`](../core/roster/ascend.spec.ts) already does directly.
 */
class FakeRoster {
  readonly entries = signal<readonly RosterEntryView[]>([]);

  /** What a single ascension reports back. Defaults to the refusal, so a test opts into success. */
  ascendOutcome: RosterResult = { ok: false, reason: 'insufficient-copies' };

  /** What a whole pass reports back. */
  ascendAllOutcome: AscensionRunView = { characters: 0, rungs: 0, copies: 0 };

  readonly ascended: string[] = [];
  readonly passes: number[] = [];

  readonly ascendOnce = vi.fn((defId: string): RosterResult => {
    this.ascended.push(defId);
    return this.ascendOutcome;
  });

  readonly ascendAll = vi.fn((): AscensionRunView => {
    this.passes.push(this.passes.length);
    return this.ascendAllOutcome;
  });

  entry(defId: string): RosterEntryView | null {
    return this.entries().find((row) => row.defId === defId) ?? null;
  }
}

async function render(focus?: string) {
  const roster = new FakeRoster();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [AltarView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: RosterService, useValue: roster },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AltarView);
  if (focus !== undefined) {
    fixture.componentRef.setInput('focus', focus);
  }
  fixture.detectChanges();

  return { roster, fixture, el: fixture.nativeElement as HTMLElement };
}

function textOf(el: HTMLElement, selector: string): string[] {
  return [...el.querySelectorAll(selector)].map(
    (node) => node.textContent?.replace(/\s+/gu, ' ').trim() ?? '',
  );
}

function rows(el: HTMLElement, group: 'ready' | 'waiting'): HTMLElement[] {
  const selector =
    group === 'ready' ? '.character:not(.character--waiting)' : '.character--waiting';
  return [...el.querySelectorAll<HTMLElement>(selector)];
}

describe('AltarView', () => {
  it('lists everyone, with the characters that can climb a rung first', async () => {
    // Not a filtered list: a character three copies short is the reason to go summoning, and
    // dropping it would leave the screen empty for most of a run.
    const { el, roster, fixture } = await render();

    roster.entries.set([
      entry({ defId: 'rin', name: 'Rin', copies: 1, canAscend: false }),
      entry({ defId: 'bran', name: 'Bran', copies: 4, canAscend: true }),
    ]);
    fixture.detectChanges();

    expect(textOf(el, '.character__name')).toEqual(['Bran', 'Rin']);
    expect(rows(el, 'ready')).toHaveLength(1);
    expect(rows(el, 'waiting')).toHaveLength(1);
  });

  it('shows the rung a character is on and the one the next ascension buys', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([
      entry({ rarity: 2, rarityLabel: 'Rare', rarityFamily: 'rare', copies: 4, canAscend: true }),
    ]);
    fixture.detectChanges();

    expect(textOf(el, '.character__meta')).toEqual(['Elves · Rare → ascends to Rare+']);
  });

  it('says a maxed character is done rather than quoting it a price', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ isMaxRarity: true, ascensionCost: null, copies: 9 })]);
    fixture.detectChanges();

    expect(textOf(el, '.character__copies')).toEqual([
      'Fully ascended — further copies convert to spark.',
    ]);
  });

  it('quotes each row as copies held against copies needed', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ copies: 2, ascensionCost: 4 })]);
    fixture.detectChanges();

    expect(textOf(el, '.character__copies')).toEqual(['2 / 4 spare copies']);
  });

  it('counts the ready characters in the header, which is what Town’s card promises', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([
      entry({ defId: 'rin', canAscend: true }),
      entry({ defId: 'bran', canAscend: true }),
      entry({ defId: 'mira', canAscend: false }),
    ]);
    fixture.detectChanges();

    expect(el.querySelector('.head__amount')?.textContent?.trim()).toBe('2');
  });

  it('disables Ascend all when nobody can climb, and enables it when somebody can', async () => {
    const { el, roster, fixture } = await render();

    const button = el.querySelector<HTMLButtonElement>('.ascend-all');
    expect(button?.disabled).toBe(true);

    roster.entries.set([entry({ canAscend: true, copies: 4 })]);
    fixture.detectChanges();

    expect(button?.disabled).toBe(false);
  });

  it('runs one pass for the whole roster and reports what it did', async () => {
    // One press, one commit, one sentence. The rows have already redrawn to show their new rungs,
    // so the notice is counts rather than a roll-call of names.
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ canAscend: true, copies: 4 })]);
    roster.ascendAllOutcome = { characters: 4, rungs: 9, copies: 62 };
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.ascend-all')?.click();
    fixture.detectChanges();

    expect(roster.passes).toHaveLength(1);
    expect(el.querySelector('.notice')?.textContent?.trim()).toBe(
      'Ascended 4 characters — 9 rungs for 62 copies.',
    );
  });

  it('singularises the counts, because one rung is the common case', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ canAscend: true, copies: 4 })]);
    roster.ascendAllOutcome = { characters: 1, rungs: 1, copies: 1 };
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.ascend-all')?.click();
    fixture.detectChanges();

    expect(el.querySelector('.notice')?.textContent?.trim()).toBe(
      'Ascended 1 character — 1 rung for 1 copy.',
    );
  });

  it('says so when a pass found nothing to do', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ canAscend: true, copies: 4 })]);
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.ascend-all')?.click();
    fixture.detectChanges();

    expect(el.querySelector('.notice')?.textContent?.trim()).toBe(
      'Nobody is holding enough spare copies for their next rung.',
    );
  });

  it('climbs one rung from a row, exactly as the character sheet’s button used to', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ defId: 'bran', name: 'Bran', canAscend: true, copies: 4 })]);
    roster.ascendOutcome = { ok: true, state: {} as never };
    fixture.detectChanges();

    rows(el, 'ready')[0].querySelector<HTMLButtonElement>('.character__ascend')?.click();
    fixture.detectChanges();

    expect(roster.ascended).toEqual(['bran']);
  });

  it('says why a single ascension was refused rather than doing nothing visible', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([entry({ canAscend: true, copies: 4 })]);
    fixture.detectChanges();

    rows(el, 'ready')[0].querySelector<HTMLButtonElement>('.character__ascend')?.click();
    fixture.detectChanges();

    expect(el.querySelector('.notice')?.textContent?.trim()).toBe(
      'Not enough spare copies of that character.',
    );
  });

  it('names who each row’s button applies to, since the visible label repeats down the list', async () => {
    const { el, roster, fixture } = await render();

    roster.entries.set([
      entry({ defId: 'rin', name: 'Rin', canAscend: true }),
      entry({ defId: 'bran', name: 'Bran', canAscend: true }),
    ]);
    fixture.detectChanges();

    expect(textOf(el, '.character__ascend .visually-hidden')).toEqual([
      'Ascend Rin to Rare+',
      'Ascend Bran to Rare+',
    ]);
  });

  it('moves focus to the character a sheet sent the player to look at', async () => {
    // The sheet's panel quotes a price and links here; landing at the top of a roster of
    // twenty-three would make the player find the row again by hand.
    const { el, roster, fixture } = await render('bran');

    roster.entries.set([
      entry({ defId: 'rin', name: 'Rin', canAscend: true }),
      entry({ defId: 'bran', name: 'Bran', canAscend: true }),
    ]);
    fixture.detectChanges();

    const focused = el.querySelector('.character--focused');
    expect(focused?.querySelector('.character__name')?.textContent?.trim()).toBe('Bran');
    expect(document.activeElement).toBe(focused);
  });

  it('finds a focused character in the waiting group too', async () => {
    // Which is the case that matters most: a player who came from a sheet quoting a shortfall.
    const { el, roster, fixture } = await render('rin');

    roster.entries.set([entry({ defId: 'rin', copies: 1, canAscend: false })]);
    fixture.detectChanges();

    expect(document.activeElement).toBe(el.querySelector('.character--waiting'));
  });

  it('does not steal focus back after an ascension redraws the rows', async () => {
    // The rows re-render on every press, and an effect that refocused each time would yank focus
    // out of the button the player is using.
    const { el, roster, fixture } = await render('rin');

    roster.entries.set([entry({ defId: 'rin', canAscend: true, copies: 4 })]);
    roster.ascendOutcome = { ok: true, state: {} as never };
    fixture.detectChanges();

    const button = rows(el, 'ready')[0].querySelector<HTMLButtonElement>('.character__ascend');
    button?.focus();
    button?.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('ignores a focus parameter naming somebody the player does not own', async () => {
    const { el, roster, fixture } = await render('ghost');

    roster.entries.set([entry({ defId: 'rin', canAscend: true })]);
    fixture.detectChanges();

    expect(el.querySelector('.character--focused')).toBeNull();
  });
});
