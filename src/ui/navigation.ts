/**
 * Where a screen that can be arrived at from more than one place sends the player back to.
 *
 * The character sheet was the first of those. It was reachable from the roster list and from the
 * party on the home screen, and a back link that always said "Roster" sent half of those trips
 * somewhere the player had never been. So whoever opens the sheet **names where they came from**
 * in a `from` query parameter, and the sheet reads it back out.
 *
 * The formation editor is the second, and it is the same bug in a new place: `/formations/descent`
 * is linked from the Descent's own screen and `/formations/expedition` from every expedition map,
 * and a back link that always said "Formations" sent both trips to an index the player had never
 * visited. Each caller now names itself, and an absent origin still resolves to the formations
 * index — the only place that linked here before origins existed, and the right answer for a
 * bookmark or a hand-typed URL.
 *
 * The home screen stopped linking to a sheet when its party section was removed — the roster
 * already showed the same rows and is the only place they can be changed — so the roster is
 * currently the only origin anything writes for a sheet. `home` stays registered rather than
 * being deleted: a URL carrying `?from=home` is still out there in a reload or a bookmark, and it
 * costs one line to keep answering it correctly instead of quietly falling back.
 *
 * A query parameter rather than the browser's history, for two reasons:
 *
 * - `history.back()` cannot name its destination, and naming it is the point — "← Roster" says
 *   where the tap goes before the player takes it, and "← Back" does not.
 * - A screen opened by a reload, a bookmark or a hand-typed URL has no in-app history behind it,
 *   so going back would walk out of the game entirely. A parameter is part of the URL, so it
 *   survives all three.
 *
 * Adding a screen that links to a detail view is two lines: an entry here, and `from` on its
 * link. An unknown or absent origin resolves to the caller's fallback rather than failing,
 * because a URL saved from an older build has to keep working and every screen needs a way out.
 */

import { EXPEDITION_MAP_BY_ID } from './content';

/** A screen a back link can return to. */
export interface Screen {
  /** Where the link goes. */
  readonly path: string;
  /** What the link calls it, which is also how a player recognises the destination. */
  readonly label: string;
}

/**
 * Every screen that can send a player to a detail view.
 *
 * Not the whole route table. Town, summon and the shop are absent because none of them links to a
 * character sheet or a crew editor; add them here the day one of them does.
 */
const SCREENS = {
  home: { path: '/', label: 'Home' },
  roster: { path: '/roster', label: 'Roster' },
  formations: { path: '/formations', label: 'Formations' },
  descent: { path: '/descent', label: 'The Descent' },
  expeditions: { path: '/expeditions', label: 'Expeditions' },
} as const satisfies Record<string, Screen>;

/** The screens a link may name as its origin, checked at compile time where one is written. */
export type ScreenId = keyof typeof SCREENS;

/**
 * A `Map` rather than an index into {@link SCREENS}, so a lookup can only ever find a screen.
 * `from` arrives out of the URL and is whatever the player typed: `SCREENS['constructor']` is a
 * function, and `'toString' in SCREENS` is true, so a plain object lookup has to be guarded
 * against its own prototype before it can be trusted.
 */
const BY_ID: ReadonlyMap<string, Screen> = new Map<string, Screen>(Object.entries(SCREENS));

/**
 * The one parameterised origin: a single expedition map's screen.
 *
 * Every other origin is a fixed route, but "Arrange your crew" sits on `/expeditions/:mapId`, and
 * going back to the index would drop the player one screen short of where they actually were. The
 * map id therefore rides inside the `from` value, and this builder is the only place the encoding
 * lives — a caller writes `expeditionOrigin(mapId)` and never the string.
 */
const EXPEDITION_PREFIX = 'expedition:';

/** Names an expedition map's screen as a link's origin, for its `from` query parameter. */
export function expeditionOrigin(mapId: string): string {
  return `${EXPEDITION_PREFIX}${mapId}`;
}

/**
 * Resolves an `expedition:<mapId>` origin, or `null` for anything else.
 *
 * The map id arrived out of the URL, so it is looked up rather than trusted: a real map's screen
 * gets the map's own name on the link, and an id this build does not ship — a stale bookmark from
 * a build whose maps differed — degrades to the Expeditions index instead of a dead end.
 */
function expeditionScreen(from: string): Screen | null {
  if (!from.startsWith(EXPEDITION_PREFIX)) {
    return null;
  }
  const mapId = from.slice(EXPEDITION_PREFIX.length);
  const map = EXPEDITION_MAP_BY_ID.get(mapId);
  if (map === undefined) {
    return SCREENS.expeditions;
  }
  return { path: `/expeditions/${mapId}`, label: map.name };
}

/**
 * Resolves a `from` query parameter into the screen a back link should return to.
 *
 * The fallback is the caller's, because it is "where did players arrive from before origins were
 * written down": the character sheet's is the roster, the formation editor's is the formations
 * index. It is a {@link ScreenId} rather than a `Screen` so a caller cannot invent a destination
 * the registry does not know.
 */
export function backTo(from: string | undefined, fallback: ScreenId = 'roster'): Screen {
  if (from !== undefined) {
    const direct = BY_ID.get(from);
    if (direct !== undefined) {
      return direct;
    }
    const expedition = expeditionScreen(from);
    if (expedition !== null) {
      return expedition;
    }
  }
  return SCREENS[fallback];
}
