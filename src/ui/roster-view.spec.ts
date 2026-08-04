import { provideLocationMocks } from '@angular/common/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type FactionData, lineupBonus, type Row } from '../core';
import { COMBAT } from './content';
import { groupBench } from './roster-order';
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
    rarityFamily: 'rare',
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
  readonly fielded = computed(() => [...this.frontRow(), ...this.backRow()]);
  readonly fieldedCount = computed(() => this.fielded().length);
  readonly openSlots = signal<Readonly<Record<Row, number>>>({ front: 2, back: 3 });
  /** The real partition, so the template is exercised against the shape it actually receives. */
  readonly benchGroups = computed(() => groupBench(this.entries(), FACTIONS));
  /**
   * The real resolver against the shipped rules, exactly as the service does it.
   *
   * Faked no further than the roster itself: the point of the panel is that the screen and the
   * simulation agree about what a composition is worth, and a stub returning hand-written numbers
   * would test the template against an agreement that does not exist.
   */
  readonly lineup = computed(() =>
    lineupBonus(
      this.fielded().map((row) => row.faction),
      COMBAT.lineup,
    ),
  );
}

/** Three of the seven, which is enough to show a populated group beside two empty ones. */
const FACTIONS: readonly FactionData[] = [
  { id: 'elf', name: 'Elves', ascensionPath: 'mortal' },
  { id: 'dwarf', name: 'Dwarves', ascensionPath: 'mortal' },
  { id: 'angel', name: 'Angels', ascensionPath: 'celestial' },
];

/** The headings the list is currently showing, in document order. */
function headings(el: HTMLElement): readonly string[] {
  return [...el.querySelectorAll('.group__title')].map((node) =>
    (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
  );
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
  describe('the faction groups', () => {
    it('pins the party above the factions and gives every faction a heading', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([
          entry({ defId: 'kestrel', name: 'Kestrel', inParty: true, row: 'front', rowSlot: 1 }),
          entry({ defId: 'rin', name: 'Rin', faction: 'elf', factionName: 'Elves' }),
        ]),
      );

      expect(headings(el)).toEqual(['Fielded 1', 'Elves 1', 'Dwarves', 'Angels']);
    });

    it('does not reuse the formation panel’s heading for the fielded group', async () => {
      // Two level-2 headings named "Formation" and "In your formation" are indistinguishable
      // to anyone navigating this screen by heading, which is most of the point of having them.
      const { el } = await render();

      const level2 = [...el.querySelectorAll('h2')].map((node) =>
        (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
      );
      expect(new Set(level2).size).toBe(level2.length);
    });

    it('says a faction is unowned rather than that it is empty', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ faction: 'elf', factionName: 'Elves' })]),
      );

      const groups = [...el.querySelectorAll('.group')];
      expect(groups[3]?.querySelector('.group__empty')?.textContent?.trim()).toBe(
        'None owned yet.',
      );
    });

    it('distinguishes a faction emptied by fielding from one you own none of', async () => {
      // The two look identical on screen and mean opposite things: one is a reason to summon,
      // the other is a reason to look at your formation.
      const { el } = await render((roster) =>
        roster.entries.set([
          entry({
            defId: 'dorn',
            name: 'Dorn',
            faction: 'dwarf',
            factionName: 'Dwarves',
            inParty: true,
            row: 'front',
            rowSlot: 1,
          }),
        ]),
      );

      const empties = [...el.querySelectorAll('.group__empty')].map((n) => n.textContent?.trim());
      expect(empties).toEqual([
        'None owned yet.',
        'Everyone you own is fielded.',
        'None owned yet.',
      ]);
    });

    it('tells a player with nobody fielded what to do about it', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ faction: 'elf', factionName: 'Elves' })]),
      );

      expect(el.querySelector('.group__empty')?.textContent?.trim()).toBe(
        'Nobody is fielded. Field somebody from a faction below.',
      );
    });

    it('labels each section by its own heading, so the regions are navigable', async () => {
      // A section with an `aria-labelledby` pointing at nothing is worse than no landmark: a
      // screen reader announces an unnamed region and the grouping stops being navigable.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ faction: 'elf', factionName: 'Elves' })]),
      );

      for (const section of el.querySelectorAll('section.group')) {
        const id = section.getAttribute('aria-labelledby');
        expect(id).toBeTruthy();
        expect(el.querySelector(`#${id}`)?.classList.contains('group__title')).toBe(true);
      }
    });

    it('lists a character exactly once, in its faction group and not the party', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ defId: 'rin', name: 'Rin', faction: 'elf' })]),
      );

      expect([...el.querySelectorAll('.roster__name')].map((n) => n.textContent?.trim())).toEqual([
        'Rin',
      ]);
    });

    it('names itself on the way to a character sheet, so the sheet can send them back', async () => {
      // The sheet is reachable from here and from the party on the home screen, and its back
      // link reads this parameter to decide which one it returns to.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ defId: 'rin', name: 'Rin', faction: 'elf' })]),
      );

      expect(el.querySelector('.roster__name')?.getAttribute('href')).toBe(
        '/roster/rin?from=roster',
      );
    });
  });

  describe('the rarity label', () => {
    it('carries its family as a class so the palette can colour it', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([entry({ rarityLabel: 'Mythic+', rarityFamily: 'mythic' })]),
      );

      const label = el.querySelector('.rarity');
      expect(label?.textContent?.trim()).toBe('Mythic+');
      expect(label?.classList.contains('rarity--mythic')).toBe(true);
    });

    it('spells the rung out in text, so the colour is never the only signal', async () => {
      // A `+` rung shares its family's colour — the suffix in the label is what distinguishes
      // Elite from Elite+, and it has to survive for anyone who cannot tell the hues apart.
      const { el } = await render((roster) =>
        roster.entries.set([
          entry({ defId: 'a', rarityLabel: 'Elite', rarityFamily: 'elite' }),
          entry({ defId: 'b', rarityLabel: 'Elite+', rarityFamily: 'elite' }),
        ]),
      );

      const labels = [...el.querySelectorAll('.rarity')];
      expect(labels.map((n) => n.textContent?.trim())).toEqual(['Elite', 'Elite+']);
      expect(labels.every((n) => n.classList.contains('rarity--elite'))).toBe(true);
    });
  });

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

  describe('the lineup bonus panel', () => {
    /** A fielded character of a given faction, in whichever rank still has room. */
    const fieldedOf = (faction: string, index: number): RosterEntryView =>
      entry({
        defId: `${faction}-${index}`,
        name: `${faction} ${index}`,
        faction,
        factionName: faction,
        inParty: true,
        row: index < 2 ? 'front' : 'back',
        rowSlot: index < 2 ? index + 1 : index - 1,
      });

    const effects = (el: HTMLElement): readonly string[] =>
      [...el.querySelectorAll('.lineup__effect')].map((node) => (node.textContent ?? '').trim());

    it('tells a party that qualified for nothing what would qualify', async () => {
      // The panel's real job. A bonus with no visible next rung is a number rather than a
      // decision, and this screen is where the decision is made.
      const { el } = await render((roster) =>
        roster.entries.set([fieldedOf('human', 0), fieldedOf('dwarf', 1)]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('No faction bonus yet');
      expect(effects(el)).toEqual([]);
      expect(el.querySelector('.lineup__hint')?.textContent).toContain('Angels');
    });

    it('names the composition and what it is worth', async () => {
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('dwarf', 0),
          fieldedOf('dwarf', 1),
          fieldedOf('dwarf', 2),
          fieldedOf('elf', 3),
          fieldedOf('elf', 4),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('Dwarves ×3 · Elves ×2');
      expect(effects(el)).toEqual(['+15% attack', '+15% health']);
    });

    it('credits Angels to the faction they stood in for', async () => {
      // The wildcard is what makes a mono five reachable at all on this roster, so the panel has
      // to read as five of the faction the player was building towards rather than as a mix.
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('human', 0),
          fieldedOf('human', 1),
          fieldedOf('human', 2),
          fieldedOf('angel', 3),
          fieldedOf('angel', 4),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('Humans ×5');
      expect(effects(el)).toEqual(['+25% attack', '+25% health']);
    });

    it('names the flat tracks separately, so a bonus without a rung is still attributable', async () => {
      // One Demon reaches no rung at all and is still worth fielding. "+30% defence" with no
      // composition line beside it is a number a player cannot act on.
      const { el } = await render((roster) =>
        roster.entries.set([fieldedOf('demon', 0), fieldedOf('monster', 1), fieldedOf('elf', 2)]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe(
        'Monsters ×1 · Demons ×1',
      );
      expect(effects(el)).toEqual(['+2% attack', '+2% health', '+30% defence']);
    });

    it('follows the formation rather than the whole roster', async () => {
      // Three Dwarves owned, one fielded. A panel counting the bench would promise a bonus the
      // battle does not pay, which is the one thing this screen must never do.
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('dwarf', 0),
          entry({ defId: 'benched-1', faction: 'dwarf' }),
          entry({ defId: 'benched-2', faction: 'dwarf' }),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('No faction bonus yet');
    });
  });
});
