import { provideLocationMocks } from '@angular/common/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { type FactionData, lineupBonus, num, type RosterResult, type Row } from '../core';
import { COMBAT } from './content';
import { groupBench } from './roster-order';
import { RosterView } from './roster-view';
import { type ResonanceView, type RosterEntryView, RosterService } from './roster.service';

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
    ascensionCost: null,
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
  /**
   * The shared level, stubbed rather than derived.
   *
   * The opposite call from {@link lineup} above, and for a reason: the lineup panel exists to
   * prove the screen and the simulation agree, whereas resonance's derivation is `core/`'s and is
   * pinned in `core/roster/resonance.spec.ts`. What is left for the component to get right is the
   * copy — which is exactly what a stub lets a test drive into a state on purpose.
   */
  readonly resonance = signal<ResonanceView>({
    floor: 12,
    anchors: [],
    carried: 0,
    stepCost: { gold: num(100), xp: num(40) },
    affordable: 12,
    ceiling: 40,
    capped: false,
  });
  readonly resonateOnce = vi.fn<() => RosterResult>(() => ({ ok: false, reason: 'not-owned' }));
  readonly resonateMax = vi.fn<() => RosterResult>(() => ({ ok: false, reason: 'not-owned' }));
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
        roster.entries.set([entry({ copies: 0, canAscend: true })]),
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
      // to say the party counts as five Humans. It says it in the hint rather than in the
      // roll-call, because the roll-call has to keep agreeing with the flat tracks — which count
      // real members and would disagree with a headline of "Humans ×5".
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('human', 0),
          fieldedOf('human', 1),
          fieldedOf('human', 2),
          fieldedOf('angel', 3),
          fieldedOf('angel', 4),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('Humans ×3 · Angels ×2');
      expect(el.querySelector('.lineup__hint')?.textContent).toContain('Counts as Humans ×5');
      expect(effects(el)).toEqual(['+25% attack', '+25% health']);
    });

    it('does not claim a substitution when none happened', async () => {
      // Five real Humans reach the same rung with no wildcard involved, so "counts as Humans ×5"
      // under "Humans ×5" would be the panel explaining itself to itself.
      const { el } = await render((roster) =>
        roster.entries.set([0, 1, 2, 3, 4].map((index) => fieldedOf('human', index))),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('Humans ×5');
      expect(el.querySelector('.lineup__hint')?.textContent).not.toContain('Counts as');
    });

    it('names a faction once when it is both half of a rung and a flat track', async () => {
      // Monsters here are the second half of a three-and-two *and* the rally track, and the panel
      // has one line for both facts. Naming them twice makes the line read as though seven
      // characters were fielded, which is the worst kind of wrong: plausible.
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('human', 0),
          fieldedOf('human', 1),
          fieldedOf('human', 2),
          fieldedOf('monster', 3),
          fieldedOf('monster', 4),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe(
        'Humans ×3 · Monsters ×2',
      );
    });

    it('reports what was fielded rather than what the rung counted it as', async () => {
      // Three Demons and two Angels reaches a mono five, but the Demon track only ever counts real
      // Demons — so a line saying "Demons ×5" beside three rungs' worth of Demon effects invites
      // the player to wonder where the other two rungs went. The rung goes in the hint instead.
      const { el } = await render((roster) =>
        roster.entries.set([
          fieldedOf('demon', 0),
          fieldedOf('demon', 1),
          fieldedOf('demon', 2),
          fieldedOf('angel', 3),
          fieldedOf('angel', 4),
        ]),
      );

      expect(el.querySelector('.lineup__shape')?.textContent?.trim()).toBe('Demons ×3 · Angels ×2');
      expect(el.querySelector('.lineup__hint')?.textContent).toContain('Demons ×5');
      // Three Demons, so three rungs of the track and not five.
      expect(effects(el)).toEqual([
        '+25% attack',
        '+25% health',
        '+30% defence',
        '+15% crit rating',
        '+25% energy recovery while hurt',
      ]);
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

  describe('the resonance panel', () => {
    it('states the shared level as a sentence rather than as a bare figure', async () => {
      const { el } = await render();

      expect(el.querySelector('.resonance__floor')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        'Everyone you own fights at level 12 or their own, whichever is higher.',
      );
    });

    it('names the characters holding the floor up, one per item', async () => {
      // A floor is a number with no visible cause without this, and it is the only place the
      // screen says which five are doing the lifting. A list rather than a joined sentence
      // because two shipped names contain commas — "Azrathoth, Ruin Unbound" is one person.
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({
          ...view,
          anchors: [
            entry({ name: 'Azrathoth, Ruin Unbound', level: 30 }),
            entry({ defId: 'dorn', name: 'Dorn', level: 12 }),
          ],
        })),
      );

      const rows = [...el.querySelectorAll('.resonance__anchor')];
      const names = rows.map((node) => (node.textContent ?? '').replace(/\s+/g, ' ').trim());
      expect(names).toEqual(['Azrathoth, Ruin Unbound 30', 'Dorn 12 moves the floor']);

      // `&ngsp;` is an **Angular** pseudo-entity, not an HTML one — the compiler registers it in
      // `NAMED_ENTITIES` and substitutes a real space after whitespace removal. It reads like a
      // typo, so this asserts the rendered markup rather than only the collapsed text: without
      // it the flag would run on as "12moves", and with a genuinely unknown entity the literal
      // characters would survive into the accessible name.
      expect(rows.map((node) => node.innerHTML).join()).not.toContain('&amp;ngsp;');
      expect(rows[1].textContent).toContain('12 moves');
    });

    it('marks only the anchors that are actually standing on the floor', async () => {
      // Levelling somebody already above it buys that character's own power and moves the roster
      // nothing, which is the distinction the whole panel exists to make visible.
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({
          ...view,
          anchors: [entry({ name: 'Rin', level: 30 }), entry({ defId: 'dorn', name: 'Dorn' })],
        })),
      );

      const lagging = [...el.querySelectorAll('.resonance__anchor--lagging')].map((node) =>
        (node.textContent ?? '').trim(),
      );
      expect(lagging).toHaveLength(1);
      expect(lagging[0]).toContain('Dorn');
    });

    it('tells a small roster that nothing is being carried yet', async () => {
      const { el } = await render();

      expect(el.querySelector('.resonance__carried')?.textContent?.trim()).toBe(
        'Nobody is being carried yet — resonance starts working once you own more than 5.',
      );
    });

    it('counts the characters standing above what was paid for', async () => {
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({ ...view, carried: 4 })),
      );

      expect(el.querySelector('.resonance__carried')?.textContent?.trim()).toBe(
        '4 characters are being carried above what you paid for.',
      );
    });

    it('prices the next level before it is committed to', async () => {
      // Breakthrough levels are lumpy, so "what does this cost" is a real question rather than a
      // decoration — and the answer has to be visible before the tap, not after it.
      const { el } = await render();

      expect(el.querySelector('.resonance__cost')?.textContent?.trim()).toBe(
        'Next level of shared power costs 100 gold · 40 XP',
      );
    });

    it('names the level each button lands on, so the two are not the same control twice', async () => {
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({ ...view, affordable: 19 })),
      );

      const labels = [...el.querySelectorAll('.resonance__actions .button')].map((node) =>
        node.textContent?.trim(),
      );
      expect(labels).toEqual(['Raise to 13', 'Raise to 19']);
    });

    it('disables both buttons when the wallet reaches nowhere and the floor is capped', async () => {
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({ ...view, capped: true, stepCost: null })),
      );

      const buttons = [...el.querySelectorAll<HTMLButtonElement>('.resonance__actions .button')];
      expect(buttons.map((button) => button.disabled)).toEqual([true, true]);
    });

    it('sends a capped roster to ascension rather than to the wallet', async () => {
      const { el } = await render((roster) =>
        roster.resonance.update((view) => ({ ...view, capped: true, stepCost: null })),
      );

      expect(el.querySelector('.resonance__hint')?.textContent?.trim()).toContain(
        'is at its rarity’s level cap',
      );
    });

    it('does not blame a cap on a screen with no characters on it', async () => {
      // The pre-load window and a roster repaired down to nothing both reach here with no plan
      // to price, which is not the same fact as a cap-stalled roster. `RosterService` keeps the
      // two apart at the flag; this is the copy that would have conflated them.
      const { el } = await render((roster) => {
        roster.entries.set([]);
        roster.resonance.set({
          floor: 1,
          anchors: [],
          carried: 0,
          stepCost: null,
          affordable: 1,
          ceiling: 1,
          capped: false,
        });
      });

      const hint = el.querySelector('.resonance__hint')?.textContent?.trim() ?? '';
      expect(hint).not.toContain('level cap');
      expect(hint).not.toContain('everybody already stands above the floor');
      expect(el.querySelector('.resonance__carried')?.textContent?.trim()).toBe(
        'Nothing to share yet.',
      );
    });

    it('keeps both buttons disabled with nobody owned', async () => {
      const { el } = await render((roster) => {
        roster.entries.set([]);
        roster.resonance.set({
          floor: 1,
          anchors: [],
          carried: 0,
          stepCost: null,
          affordable: 1,
          ceiling: 1,
          capped: false,
        });
      });

      const buttons = [...el.querySelectorAll<HTMLButtonElement>('.resonance__actions .button')];
      expect(buttons.map((button) => button.disabled)).toEqual([true, true]);
    });

    it('says why a refused raise was refused', async () => {
      const { el, roster } = await render();
      roster.resonateOnce.mockReturnValue({ ok: false, reason: 'level-capped' });

      el.querySelector<HTMLButtonElement>('.resonance__actions .button')?.click();
      await Promise.resolve();

      expect(roster.resonateOnce).toHaveBeenCalled();
    });
  });

  describe('a carried level', () => {
    it('is marked on the row it belongs to, in words as well as in colour', async () => {
      const { el } = await render((roster) => roster.entries.set([entry({ resonated: true })]));

      expect(el.querySelector('.roster__carried')?.textContent?.trim()).toBe('carried');
    });

    it('shows one number, never the invested level beside it', async () => {
      // The floor is monotonically non-decreasing, so a carried level can never revert — a
      // second figure would be defending against a state that cannot occur.
      const { el } = await render((roster) =>
        roster.entries.set([entry({ resonated: true, level: 40, levelCap: 40 })]),
      );

      expect(el.querySelector('.roster__stats')?.textContent?.replace(/\s+/g, ' ')).toContain(
        'Level 40/40 carried',
      );
    });

    it('leaves an ordinarily-levelled row unmarked', async () => {
      const { el } = await render();

      expect(el.querySelector('.roster__carried')).toBeNull();
    });
  });
});
