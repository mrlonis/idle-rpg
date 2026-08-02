import { CHARACTER_TIERS, type CharacterTier, type FactionData } from '../core';
import { type RosterEntryView } from './roster.service';

/**
 * How the roster list is ordered and grouped.
 *
 * Pure, and separate from `RosterService` so it can be tested against plain rows rather than
 * through a service that owns the game loop, `Preferences` and wall-clock time. Nothing here
 * touches Angular.
 */

/** One faction's worth of benched characters, plus what the group knows about itself. */
export interface RosterGroup {
  readonly factionId: string;
  readonly label: string;
  /** Benched members, in display order. Empty is a legitimate state and still renders. */
  readonly members: readonly RosterEntryView[];
  /**
   * Owned characters of this faction, fielded ones included.
   *
   * An empty group has two very different causes — you own none of this faction, or every one
   * you own is standing in the formation — and a heading that said "none owned" over a faction
   * whose only member is fighting would simply be wrong.
   */
  readonly owned: number;
}

/** Growth slope as a number, so a sort can compare two tiers. */
function tierRank(tier: CharacterTier): number {
  return CHARACTER_TIERS.indexOf(tier);
}

/**
 * Display order for the whole roster.
 *
 * Fielded characters come first in formation order — the roster's most common use is checking
 * on who is actually fighting. Everyone else is ordered faction by faction, and within a
 * faction by **level**, because level is what a player is deciding about when they open this
 * screen: who is worth taking further. Tier breaks a level tie, since at equal investment the
 * steeper growth slope is the better character, and rarity breaks a tier tie for the same
 * reason one rung further up the ladder is worth more than the same level below it. Name last,
 * so the order is total and a re-render never reshuffles two identical rows.
 */
export function compareEntries(
  a: RosterEntryView,
  b: RosterEntryView,
  factionRank: (factionId: string) => number,
): number {
  if (a.inParty !== b.inParty) {
    return a.inParty ? -1 : 1;
  }
  if (a.inParty && b.inParty) {
    // Front rank first, then order within the rank — the same order the battle board draws.
    const rank = (entry: RosterEntryView): number => (entry.row === 'front' ? 0 : 1);
    return rank(a) - rank(b) || (a.rowSlot ?? 0) - (b.rowSlot ?? 0);
  }
  return (
    factionRank(a.faction) - factionRank(b.faction) ||
    b.level - a.level ||
    tierRank(b.tier) - tierRank(a.tier) ||
    b.rarity - a.rarity ||
    a.name.localeCompare(b.name)
  );
}

/** A faction's position in the authored order; anything unrecognised sorts to the end. */
export function factionRanker(factions: readonly FactionData[]): (factionId: string) => number {
  const order = new Map(factions.map((faction, index) => [faction.id, index]));
  return (factionId) => order.get(factionId) ?? factions.length;
}

/**
 * Splits the benched half of an already-ordered roster into one group per faction.
 *
 * Every authored faction gets a group whether or not anything is in it, so the seven factions
 * are a fixed shape a player can learn the position of rather than a list that reorders itself
 * as the roster fills. A faction the content no longer ships still gets a trailing group if
 * something owned claims it — dropping those rows would lose a character off the screen
 * entirely, which is a far worse failure than an oddly-named heading.
 *
 * `entries` must already be sorted by {@link compareEntries}; this preserves the order it finds
 * rather than sorting again.
 */
export function groupBench(
  entries: readonly RosterEntryView[],
  factions: readonly FactionData[],
): readonly RosterGroup[] {
  const benched = new Map<string, RosterEntryView[]>();
  const owned = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const entry of entries) {
    owned.set(entry.faction, (owned.get(entry.faction) ?? 0) + 1);
    labels.set(entry.faction, entry.factionName);
    if (!entry.inParty) {
      const members = benched.get(entry.faction);
      if (members === undefined) {
        benched.set(entry.faction, [entry]);
      } else {
        members.push(entry);
      }
    }
  }

  const groups: RosterGroup[] = factions.map((faction) => ({
    factionId: faction.id,
    label: faction.name,
    members: benched.get(faction.id) ?? [],
    owned: owned.get(faction.id) ?? 0,
  }));

  const authored = new Set(factions.map((faction) => faction.id));
  for (const [factionId, count] of owned) {
    if (!authored.has(factionId)) {
      groups.push({
        factionId,
        label: labels.get(factionId) ?? factionId,
        members: benched.get(factionId) ?? [],
        owned: count,
      });
    }
  }

  return groups;
}
