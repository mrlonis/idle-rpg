import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { CAMPAIGN_FORMATION } from '../core';
import { type CrewView, FormationService } from './formation.service';
import { FormationsView } from './formations-view';
import { type RosterEntryView } from './roster.service';

const NO_BONUS = {
  attack: 0,
  health: 0,
  defence: 0,
  critChance: 0,
  critDamageAmp: 0,
  haste: 0,
  injuredEnergyRegen: 0,
};

function row(name: string): RosterEntryView {
  return {
    defId: name.toLowerCase(),
    name,
    faction: 'elf',
    factionName: 'Elves',
    tier: 'common',
    role: 'ranger',
    rarity: 0,
    rarityLabel: 'Rare',
    rarityFamily: 'rare',
    level: 12,
    resonated: false,
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    crews: [],
    crewed: false,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 12,
    ascensionCost: null,
    canAscend: false,
  };
}

function crew(over: Partial<CrewView> = {}): CrewView {
  return {
    activity: { id: CAMPAIGN_FORMATION, name: 'Campaign', kind: 'campaign' },
    front: [],
    back: [],
    size: 0,
    open: { front: 2, back: 3 },
    lineup: { bonus: NO_BONUS, tier: null, counts: [], rallyCount: 0, ladderCount: 0 },
    eligible: [],
    lockFaction: null,
    away: [],
    ready: false,
    ...over,
  };
}

class FakeFormations {
  readonly summaries = signal<readonly CrewView[]>([crew()]);
}

async function render(configure?: (formations: FakeFormations) => void) {
  const formations = new FakeFormations();
  configure?.(formations);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [FormationsView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: FormationService, useValue: formations },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FormationsView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { formations, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('FormationsView', () => {
  it('lists one row per activity, linking into its editor', async () => {
    const { el } = await render((formations) =>
      formations.summaries.set([
        crew(),
        crew({
          activity: { id: 'tower-dwarf', name: 'The Deep Hold', kind: 'tower', faction: 'dwarf' },
          lockFaction: 'dwarf',
        }),
      ]),
    );

    const links = [...el.querySelectorAll<HTMLAnchorElement>('.crew__link')];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/formations/campaign',
      '/formations/tower-dwarf',
    ]);
  });

  it('names who is standing, in slot order, so a crew is readable without opening it', async () => {
    // The whole reason to have an index: remembering who is where without visiting eight screens.
    const { el } = await render((formations) =>
      formations.summaries.set([
        crew({ front: [row('Bran'), row('Mira')], back: [row('Rin')], size: 3, ready: true }),
      ]),
    );

    expect(el.querySelector('.crew__members')?.textContent?.trim()).toBe('Bran · Mira · Rin');
    expect(el.querySelector('.crew__status')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '3 of 5 standing',
    );
  });

  it('says a crew is empty rather than printing an empty line', async () => {
    const { el } = await render();

    expect(el.querySelector('.crew__members--empty')?.textContent?.trim()).toBe(
      'Nobody standing yet.',
    );
  });

  it('names the lock beside the count, since it decides who may go in', async () => {
    const { el } = await render((formations) =>
      formations.summaries.set([
        crew({
          activity: { id: 'tower-dwarf', name: 'The Deep Hold', kind: 'tower', faction: 'dwarf' },
          lockFaction: 'dwarf',
        }),
      ]),
    );

    expect(el.querySelector('.crew__status')?.textContent).toContain('Dwarves only');
  });

  it('flags a full crew that still cannot fight, and stays quiet otherwise', async () => {
    // A locked activity whose crew stopped satisfying the lock is five characters and no fight.
    // Saying "ready" on every other row would be reassurance nobody asked for, so only the
    // blocked case is announced.
    const { el } = await render((formations) =>
      formations.summaries.set([
        crew({ front: [row('Bran')], size: 1, ready: true }),
        crew({
          activity: { id: 'tower-dwarf', name: 'The Deep Hold', kind: 'tower', faction: 'dwarf' },
          front: [row('Rin')],
          size: 1,
          lockFaction: 'dwarf',
          ready: false,
        }),
      ]),
    );

    const blocked = [...el.querySelectorAll('.crew__blocked')];
    expect(blocked).toHaveLength(1);
    expect(blocked[0].textContent?.trim()).toBe('Cannot fight as it stands.');
  });

  it('sends the player back to the roster, which is where the link in came from', async () => {
    const { el } = await render();

    expect(el.querySelector('.head__back')?.getAttribute('href')).toBe('/roster');
  });
});
