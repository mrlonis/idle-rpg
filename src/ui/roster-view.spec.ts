import { provideLocationMocks } from '@angular/common/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type Row } from '../core';
import { RosterView } from './roster-view';
import { type RosterEntryView, RosterService } from './roster.service';

/** One roster row, benched and unremarkable, with only what a test cares about overridden. */
function entry(over: Partial<RosterEntryView> = {}): RosterEntryView {
  return {
    defId: 'rin',
    name: 'Rin',
    faction: 'elf',
    factionName: 'Elves',
    tier: 'common',
    role: 'ranger',
    rarity: 0,
    rarityLabel: 'Rare',
    level: 12,
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
    ascensionCost: null,
    fodderAvailable: 0,
    canAscend: false,
    ...over,
  };
}

/**
 * A stand-in for the real roster.
 *
 * The component's job is presentation: decide what each row says and what the next tap does.
 * Driving the real service would pull in the game loop, `Preferences` and wall-clock time, and
 * would end up testing `core/roster` rather than the template.
 */
class FakeRoster {
  readonly entries = signal<readonly RosterEntryView[]>([entry()]);
  readonly frontRow = computed(() => this.entries().filter((row) => row.row === 'front'));
  readonly backRow = computed(() => this.entries().filter((row) => row.row === 'back'));
  readonly fieldedCount = computed(() => this.entries().filter((row) => row.inParty).length);
  readonly openSlots = signal<Readonly<Record<Row, number>>>({ front: 2, back: 3 });
}

async function render(configure?: (roster: FakeRoster) => void) {
  const roster = new FakeRoster();
  configure?.(roster);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [RosterView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: RosterService, useValue: roster },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(RosterView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { roster, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('RosterView', () => {
  describe('the ascension-ready signal', () => {
    it('marks the copies count when the next rung is payable', async () => {
      // The whole point: a player should be able to scan the list for who can be ascended
      // rather than opening every character sheet to find out.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ copies: 4, canAscend: true })]),
      );

      const copies = el.querySelector('.roster__copies');
      expect(copies?.textContent?.trim()).toBe('4 spare copies');
      expect(copies?.classList.contains('roster__copies--ready')).toBe(true);
    });

    it('leaves the count unmarked when the copies are not enough yet', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ copies: 4, canAscend: false })]),
      );

      expect(el.querySelector('.roster__copies')?.classList.contains('roster__copies--ready')).toBe(
        false,
      );
      expect(el.querySelector('.roster__ready')).toBeNull();
    });

    it('says so in words as well as in colour', async () => {
      // WCAG 1.4.1: the tint on the number cannot be the only thing carrying the meaning.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ copies: 4, canAscend: true })]),
      );

      expect(el.querySelector('.roster__ready')?.textContent?.trim()).toBe('ready to ascend');
    });

    it('flags a rung payable entirely in faction fodder, which has no copies to tint', async () => {
      // Four of the mortal ladder's rungs cost `self: 0` — nothing of the character itself. The
      // count is absent from the row entirely, so the words are the only signal there is.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ copies: 0, fodderAvailable: 12, canAscend: true })]),
      );

      expect(el.querySelector('.roster__copies')).toBeNull();
      expect(el.querySelector('.roster__ready')?.textContent?.trim()).toBe('ready to ascend');
    });

    it('stays quiet for a character at the top of the ladder', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ copies: 9, isMaxRarity: true, canAscend: false })]),
      );

      expect(el.querySelector('.roster__ready')).toBeNull();
      expect(el.textContent).toContain('9 spare copies');
    });
  });
});
