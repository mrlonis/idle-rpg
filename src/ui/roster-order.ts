import { CHARACTER_TIERS, type CharacterTier, type FactionData } from '../core';
import { type RosterEntryView } from './roster.service';

/**
 * How the roster list is ordered and grouped.
 *
 * Pure, and separate from `RosterService` so it can be tested against plain rows rather than
 * through a service that owns the game loop, `Preferences` and wall-clock time. Nothing here
 * touches Angular.
 */

/** One faction's worth of characters, plus what the group knows about itself. */
export interface RosterGroup {
  readonly factionId: string;
  readonly label: string;
  /** Members, in display order. Empty is a legitimate state and still renders. */
  readonly members: readonly RosterEntryView[];
  /**
   * Owned characters of this faction.
   *
   * ⚠️ **Equal to `members.length` on the roster screen and smaller on the formation editor**,
   * which is the only reason it is still a separate field. The editor passes the rows a crew may
   * still add, so a group can be empty because you own none of that faction *or* because all of
   * them are already standing — and a heading reading "none owned" over a faction whose members
   * are all in the crew below it would simply be wrong.
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
 * Faction by faction, and within a faction by **level**, because level is what a player is
 * deciding about when they open this screen: who is worth taking further. Tier breaks a level tie,
 * since at equal investment the steeper growth slope is the better character, and rarity breaks a
 * tier tie for the same reason one rung further up the ladder is worth more than the same level
 * below it. Name last, so the order is total and a re-render never reshuffles two identical rows.
 *
 * ⚠️ **Fielded characters no longer sort to the top, and that is milestone 15a rather than a
 * regression.** They did while there was one formation and five of forty-nine rows were in it —
 * pinning them answered "who is actually fighting" at a glance. With eight crews the pin would
 * cover most of the roster and distinguish nothing, and the question it answered has a better home:
 * the formation editor, which shows one crew at a time in rank order. What the roster screen shows
 * instead is `crews`, per row.
 */
export function compareEntries(
  a: RosterEntryView,
  b: RosterEntryView,
  factionRank: (factionId: string) => number,
): number {
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
 * Splits an already-ordered roster into one group per faction.
 *
 * Every authored faction gets a group whether or not anything is in it, so the seven factions
 * are a fixed shape a player can learn the position of rather than a list that reorders itself
 * as the roster fills. A faction the content no longer ships still gets a trailing group if
 * something owned claims it — dropping those rows would lose a character off the screen
 * entirely, which is a far worse failure than an oddly-named heading.
 *
 * `include` decides which rows become {@link RosterGroup.members} while every row still counts
 * toward {@link RosterGroup.owned}. That split is what lets the formation editor list only the
 * characters a crew may still add and still say "you own three Dwarves, all of them are already
 * standing" rather than "none owned". The roster screen includes everything and the two numbers
 * coincide.
 *
 * `entries` must already be sorted by {@link compareEntries}; this preserves the order it finds
 * rather than sorting again.
 */
export function groupByFaction(
  entries: readonly RosterEntryView[],
  factions: readonly FactionData[],
  include: (entry: RosterEntryView) => boolean = () => true,
): readonly RosterGroup[] {
  const listed = new Map<string, RosterEntryView[]>();
  const owned = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const entry of entries) {
    owned.set(entry.faction, (owned.get(entry.faction) ?? 0) + 1);
    labels.set(entry.faction, entry.factionName);
    if (include(entry)) {
      const members = listed.get(entry.faction);
      if (members === undefined) {
        listed.set(entry.faction, [entry]);
      } else {
        members.push(entry);
      }
    }
  }

  const groups: RosterGroup[] = factions.map((faction) => ({
    factionId: faction.id,
    label: faction.name,
    members: listed.get(faction.id) ?? [],
    owned: owned.get(faction.id) ?? 0,
  }));

  const authored = new Set(factions.map((faction) => faction.id));
  for (const [factionId, count] of owned) {
    if (!authored.has(factionId)) {
      groups.push({
        factionId,
        label: labels.get(factionId) ?? factionId,
        members: listed.get(factionId) ?? [],
        owned: count,
      });
    }
  }

  return groups;
}
