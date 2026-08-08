import { describe, expect, it } from 'vitest';
import { type FactionData } from '../core';
import { compareEntries, factionRanker, groupByFaction } from './roster-order';
import { type RosterEntryView } from './roster.service';

/** The authored factions, trimmed to the three the ordering tests need. */
const FACTIONS: readonly FactionData[] = [
  { id: 'human', name: 'Humans', ascensionPath: 'mortal' },
  { id: 'dwarf', name: 'Dwarves', ascensionPath: 'mortal' },
  { id: 'angel', name: 'Angels', ascensionPath: 'celestial' },
];

const rank = factionRanker(FACTIONS);

/** One unremarkable roster row, standing in no crew, with only what a test overrides. */
function entry(over: Partial<RosterEntryView> = {}): RosterEntryView {
  return {
    defId: over.name?.toLowerCase() ?? 'rin',
    name: 'Rin',
    faction: 'human',
    factionName: 'Humans',
    tier: 'common',
    role: 'ranger',
    rarity: 0,
    rarityLabel: 'Rare',
    rarityFamily: 'rare',
    level: 10,
    resonated: false,
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    crews: [],
    crewed: false,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 10,
    ascensionCost: null,
    canAscend: false,
    ...over,
  };
}

/** Sorts a list the way `RosterService.entries` does, and reports the names in order. */
function order(entries: readonly RosterEntryView[]): readonly string[] {
  return [...entries].sort((a, b) => compareEntries(a, b, rank)).map((e) => e.name);
}

describe('compareEntries', () => {
  it('does not pin crewed characters above the rest', () => {
    // ⚠️ Milestone 15a removed that pin deliberately. It answered "who is actually fighting" while
    // five of forty-nine rows were in one formation; with eight crews it would cover most of the
    // roster and distinguish nothing. Faction and level decide the order now, whoever is standing.
    const names = order([
      entry({ name: 'Idle', faction: 'human', level: 99, crews: [], crewed: false }),
      entry({ name: 'Busy', faction: 'human', level: 1, crews: ['campaign'], crewed: true }),
    ]);

    expect(names).toEqual(['Idle', 'Busy']);
  });

  it('groups the roster by faction in the authored order', () => {
    // Levels deliberately run against the faction order: faction wins, or the grouping the
    // list is built from would be interleaved with characters that belong elsewhere.
    const names = order([
      entry({ name: 'Seraph', faction: 'angel', level: 90 }),
      entry({ name: 'Dorn', faction: 'dwarf', level: 50 }),
      entry({ name: 'Wren', faction: 'human', level: 10 }),
    ]);

    expect(names).toEqual(['Wren', 'Dorn', 'Seraph']);
  });

  it('puts the highest level on top within a faction', () => {
    const names = order([
      entry({ name: 'Low', level: 12 }),
      entry({ name: 'High', level: 80 }),
      entry({ name: 'Mid', level: 41 }),
    ]);

    expect(names).toEqual(['High', 'Mid', 'Low']);
  });

  it('breaks a level tie on tier, steepest growth slope first', () => {
    const names = order([
      entry({ name: 'Common', tier: 'common', level: 40 }),
      entry({ name: 'Ascended', tier: 'ascended', level: 40 }),
      entry({ name: 'Legendary', tier: 'legendary', level: 40 }),
    ]);

    expect(names).toEqual(['Ascended', 'Legendary', 'Common']);
  });

  it('lets a lower tier outrank a higher one on level alone', () => {
    // The point of ordering by level first: investment is what the player is deciding about,
    // and a levelled common is more use right now than an ascended-tier pull left at 1.
    const names = order([
      entry({ name: 'Fresh', tier: 'ascended', level: 1 }),
      entry({ name: 'Levelled', tier: 'common', level: 60 }),
    ]);

    expect(names).toEqual(['Levelled', 'Fresh']);
  });

  it('breaks a tier tie on rarity, then on name, so the order is total', () => {
    const names = order([
      entry({ name: 'Zara', level: 40, rarity: 4 }),
      entry({ name: 'Aldric', level: 40, rarity: 4 }),
      entry({ name: 'Mira', level: 40, rarity: 8 }),
    ]);

    expect(names).toEqual(['Mira', 'Aldric', 'Zara']);
  });

  it('sorts a faction the content no longer ships to the end', () => {
    const names = order([
      entry({ name: 'Stray', faction: 'wyrm', level: 99 }),
      entry({ name: 'Seraph', faction: 'angel', level: 1 }),
    ]);

    expect(names).toEqual(['Seraph', 'Stray']);
  });
});

describe('groupByFaction', () => {
  it('emits every authored faction, in order, even with nothing in it', () => {
    const groups = groupByFaction([entry({ name: 'Wren', faction: 'human' })], FACTIONS);

    expect(groups.map((group) => group.factionId)).toEqual(['human', 'dwarf', 'angel']);
    expect(groups.map((group) => group.label)).toEqual(['Humans', 'Dwarves', 'Angels']);
    expect(groups.map((group) => group.members.length)).toEqual([1, 0, 0]);
  });

  it('lists every row when no predicate narrows it, which is the roster screen', () => {
    const groups = groupByFaction(
      [
        entry({ name: 'Standing', faction: 'human', crews: ['campaign'], crewed: true }),
        entry({ name: 'Spare', faction: 'human' }),
      ],
      FACTIONS,
    );

    expect(groups[0]?.members.map((member) => member.name)).toEqual(['Standing', 'Spare']);
  });

  it('narrows the members by the predicate while still counting them as owned', () => {
    // The split the formation editor needs: it lists only who a crew may still add, and `owned` is
    // what lets an empty heading say "everyone you own is already standing" rather than claiming
    // you own none of that faction.
    const groups = groupByFaction(
      [entry({ name: 'Kestrel', faction: 'human', crews: ['campaign'], crewed: true })],
      FACTIONS,
      (member) => !member.crewed,
    );

    expect(groups[0]).toMatchObject({ factionId: 'human', owned: 1 });
    expect(groups[0]?.members).toEqual([]);
  });

  it('reports nothing owned for a faction the player has never pulled', () => {
    const groups = groupByFaction([entry({ faction: 'human' })], FACTIONS);

    expect(groups[2]).toMatchObject({ factionId: 'angel', owned: 0, members: [] });
  });

  it('preserves the order it is given rather than sorting again', () => {
    const groups = groupByFaction(
      [
        entry({ name: 'First', faction: 'dwarf', level: 1 }),
        entry({ name: 'Second', faction: 'dwarf', level: 99 }),
      ],
      FACTIONS,
    );

    expect(groups[1]?.members.map((member) => member.name)).toEqual(['First', 'Second']);
  });

  it('keeps a character whose faction the content no longer ships, in a trailing group', () => {
    // Dropping the row would lose a character off the roster screen entirely — a far worse
    // failure than a heading named after an id.
    const groups = groupByFaction(
      [entry({ name: 'Stray', faction: 'wyrm', factionName: 'wyrm' })],
      FACTIONS,
    );

    expect(groups.map((group) => group.factionId)).toEqual(['human', 'dwarf', 'angel', 'wyrm']);
    expect(groups[3]?.members.map((member) => member.name)).toEqual(['Stray']);
  });
});
