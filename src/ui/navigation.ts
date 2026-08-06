/**
 * Where a screen that can be arrived at from more than one place sends the player back to.
 *
 * The character sheet is the first of those. It was reachable from the roster list and from the
 * party on the home screen, and a back link that always said "Roster" sent half of those trips
 * somewhere the player had never been. So whoever opens the sheet **names where they came from**
 * in a `from` query parameter, and the sheet reads it back out.
 *
 * The home screen stopped linking to a sheet when its party section was removed — the roster
 * already showed the same rows and is the only place they can be changed — so the roster is
 * currently the only origin anything writes. `home` stays registered rather than being deleted:
 * a URL carrying `?from=home` is still out there in a reload or a bookmark, and it costs one
 * line to keep answering it correctly instead of quietly falling back.
 *
 * A query parameter rather than the browser's history, for two reasons:
 *
 * - `history.back()` cannot name its destination, and naming it is the point — "← Roster" says
 *   where the tap goes before the player takes it, and "← Back" does not.
 * - A sheet opened by a reload, a bookmark or a hand-typed URL has no in-app history behind it,
 *   so going back would walk out of the game entirely. A parameter is part of the URL, so it
 *   survives all three.
 *
 * Adding a screen that links to a sheet is two lines: an entry here, and `from` on its link. An
 * unknown or absent origin resolves to {@link FALLBACK} rather than failing, because a URL saved
 * from an older build has to keep working and every screen needs a way out.
 */

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
 * character sheet; add them here the day one of them does.
 */
const SCREENS = {
  home: { path: '/', label: 'Home' },
  roster: { path: '/roster', label: 'Roster' },
} as const satisfies Record<string, Screen>;

/** The screens a link may name as its origin, checked at compile time where one is written. */
export type ScreenId = keyof typeof SCREENS;

/** Where a detail view opened without a usable origin sends the player. */
const FALLBACK: ScreenId = 'roster';

/**
 * A `Map` rather than an index into {@link SCREENS}, so a lookup can only ever find a screen.
 * `from` arrives out of the URL and is whatever the player typed: `SCREENS['constructor']` is a
 * function, and `'toString' in SCREENS` is true, so a plain object lookup has to be guarded
 * against its own prototype before it can be trusted.
 */
const BY_ID: ReadonlyMap<string, Screen> = new Map<string, Screen>(Object.entries(SCREENS));

/** Resolves a `from` query parameter into the screen a back link should return to. */
export function backTo(from: string | undefined): Screen {
  const target = from === undefined ? undefined : BY_ID.get(from);
  return target ?? SCREENS[FALLBACK];
}
