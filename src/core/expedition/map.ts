import { type ExpeditionMapData } from './types';

/**
 * The map as geometry: parsing the grid, and everything derived from which camps have fallen.
 *
 * ## The reachable region is the whole of the movement model
 *
 * There is no position — see `core/expedition/types.ts`. One BFS from the start tile over open
 * ground answers every question a screen or a rule asks: which camps may be fought (adjacent to the
 * region), which chests have been walked over (inside it), and whether the exit is open (inside
 * it). A camp's tile is closed until that camp is beaten, and beating it opens the tile — that is
 * the only way the region ever grows, which is why the cleared-camp list is the entire input.
 *
 * ## The route search is for specs, not for play
 *
 * {@link cheapestStaminaTo} exists so `expedition.spec.ts` can hold "some route to the exit fits
 * the budget" and "no budget affords everything" **mechanically** — the roadmap named "no way to
 * know it is solvable except by solving it" as this milestone's whole risk, and a Dijkstra over
 * camp costs is that solve, run on every test pass. Nothing in play ever routes for the player.
 */

/** What one grid character means. */
export type ExpeditionTileKind = 'wall' | 'path' | 'start' | 'exit' | 'camp' | 'chest';

/** One tile of a parsed grid. */
export interface ExpeditionTile {
  readonly row: number;
  readonly col: number;
  readonly kind: ExpeditionTileKind;
  /** The camp letter or chest digit, for the two kinds that have one. */
  readonly cell?: string;
}

/** A parsed grid: the tiles in row-major order, and the shape they fill. */
export interface ExpeditionGrid {
  readonly width: number;
  readonly height: number;
  readonly tiles: readonly ExpeditionTile[];
}

function kindOf(char: string): ExpeditionTileKind {
  if (char === '.') {
    return 'path';
  }
  if (char === 'S') {
    return 'start';
  }
  if (char === 'X') {
    return 'exit';
  }
  if (char >= 'a' && char <= 'z') {
    return 'camp';
  }
  if (char >= '1' && char <= '9') {
    return 'chest';
  }
  // `#`, space, and anything unrecognised: a character a later build added reads as wall rather
  // than as open ground, because a wall that should be floor blocks a route the specs will catch,
  // where floor that should be wall silently breaks the puzzle's whole premise.
  return 'wall';
}

/**
 * Parses a map's grid into tiles.
 *
 * Ragged rows are tolerated by treating the missing tail as wall — the same safe direction as the
 * unknown-character rule above. `expedition.spec.ts` still holds shipped grids rectangular, because
 * tolerated is not the same as intended.
 */
export function parseExpeditionGrid(map: ExpeditionMapData): ExpeditionGrid {
  const height = map.grid.length;
  const width = map.grid.reduce((widest, row) => Math.max(widest, row.length), 0);
  const tiles: ExpeditionTile[] = [];
  for (let row = 0; row < height; row++) {
    const line = map.grid[row];
    for (let col = 0; col < width; col++) {
      const char = col < line.length ? line[col] : '#';
      const kind = kindOf(char);
      tiles.push(
        kind === 'camp' || kind === 'chest' ? { row, col, kind, cell: char } : { row, col, kind },
      );
    }
  }
  return { width, height, tiles };
}

/** The tile at `row, col`, or `undefined` off the edge. */
function tileAt(grid: ExpeditionGrid, row: number, col: number): ExpeditionTile | undefined {
  if (row < 0 || row >= grid.height || col < 0 || col >= grid.width) {
    return undefined;
  }
  return grid.tiles[row * grid.width + col];
}

const STEPS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

/** Whether a tile is open ground once `cleared` camps have fallen. */
function isOpen(tile: ExpeditionTile, cleared: ReadonlySet<string>): boolean {
  if (tile.kind === 'wall') {
    return false;
  }
  if (tile.kind === 'camp') {
    return tile.cell !== undefined && cleared.has(tile.cell);
  }
  return true;
}

/**
 * Every tile reachable from the start over open ground, as row-major indices.
 *
 * A grid with no start tile yields an empty region rather than a throw — a damaged map is content
 * nobody can enter, not a crash, which is the posture the save layer takes everywhere.
 */
export function reachableTiles(
  grid: ExpeditionGrid,
  cleared: ReadonlySet<string>,
): ReadonlySet<number> {
  const region = new Set<number>();
  const queue: number[] = [];
  for (const tile of grid.tiles) {
    if (tile.kind === 'start') {
      const index = tile.row * grid.width + tile.col;
      region.add(index);
      queue.push(index);
    }
  }
  // `for-of` over an array that only grows: the array iterator visits elements appended during
  // iteration, which is exactly a breadth-first frontier with no assertion the types cannot see.
  for (const index of queue) {
    const row = Math.floor(index / grid.width);
    const col = index % grid.width;
    for (const [dr, dc] of STEPS) {
      const next = tileAt(grid, row + dr, col + dc);
      if (next === undefined || !isOpen(next, cleared)) {
        continue;
      }
      const nextIndex = next.row * grid.width + next.col;
      if (!region.has(nextIndex)) {
        region.add(nextIndex);
        queue.push(nextIndex);
      }
    }
  }
  return region;
}

/**
 * The camps that may be fought right now: standing, and adjacent to the reachable region.
 *
 * Affordability is deliberately not consulted here — this is geometry, and "adjacent but over
 * budget" is a thing the screen has to draw differently from "out of reach". `core/expedition/run.ts`
 * is where the budget bites.
 */
export function adjacentCamps(
  grid: ExpeditionGrid,
  cleared: ReadonlySet<string>,
): ReadonlySet<string> {
  const region = reachableTiles(grid, cleared);
  const open: string[] = [];
  for (const tile of grid.tiles) {
    if (tile.kind !== 'camp' || tile.cell === undefined || cleared.has(tile.cell)) {
      continue;
    }
    const beside = STEPS.some(([dr, dc]) => {
      const next = tileAt(grid, tile.row + dr, tile.col + dc);
      return next !== undefined && region.has(next.row * grid.width + next.col);
    });
    if (beside) {
      open.push(tile.cell);
    }
  }
  return new Set(open);
}

/** The chest cells inside the reachable region. */
export function reachableChests(
  grid: ExpeditionGrid,
  cleared: ReadonlySet<string>,
): ReadonlySet<string> {
  const region = reachableTiles(grid, cleared);
  const inside: string[] = [];
  for (const tile of grid.tiles) {
    if (
      tile.kind === 'chest' &&
      tile.cell !== undefined &&
      region.has(tile.row * grid.width + tile.col)
    ) {
      inside.push(tile.cell);
    }
  }
  return new Set(inside);
}

/** Whether the exit tile is inside the reachable region. */
export function exitReachable(grid: ExpeditionGrid, cleared: ReadonlySet<string>): boolean {
  const region = reachableTiles(grid, cleared);
  return grid.tiles.some(
    (tile) => tile.kind === 'exit' && region.has(tile.row * grid.width + tile.col),
  );
}

/** A camp's stamina cost by cell, defensively non-negative. */
function costOf(map: ExpeditionMapData): ReadonlyMap<string, number> {
  const costs = new Map<string, number>();
  for (const camp of map.camps) {
    costs.set(camp.cell, Number.isFinite(camp.stamina) ? Math.max(camp.stamina, 0) : 0);
  }
  return costs;
}

/**
 * The least stamina that opens a route from the start to `target`, or `null` when no route exists
 * at any price.
 *
 * A Dijkstra over the grid where entering a camp tile costs that camp's stamina and everything else
 * is free. `target` picks a tile: the exit, or one chest by cell. ⚠️ **This is the spec's solver**
 * — see the file comment — and it deliberately prices a *route*, not a strategy: fighting a camp
 * off the route to open a shortcut elsewhere cannot price below the direct answer, because camp
 * costs are non-negative and the search already considers every path.
 */
export function cheapestStaminaTo(
  map: ExpeditionMapData,
  target: { readonly kind: 'exit' } | { readonly kind: 'chest'; readonly cell: string },
): number | null {
  const grid = parseExpeditionGrid(map);
  const costs = costOf(map);
  const best = new Map<number, number>();
  // A binary heap would be faster and these grids are dozens of tiles; a sorted scan keeps the
  // solver simple enough to be obviously right, which is what a spec's oracle is for.
  const frontier: { index: number; paid: number }[] = [];

  for (const tile of grid.tiles) {
    if (tile.kind === 'start') {
      const index = tile.row * grid.width + tile.col;
      best.set(index, 0);
      frontier.push({ index, paid: 0 });
    }
  }

  while (frontier.length > 0) {
    let at = 0;
    for (let i = 1; i < frontier.length; i++) {
      if (frontier[i].paid < frontier[at].paid) {
        at = i;
      }
    }
    const [current] = frontier.splice(at, 1);
    if ((best.get(current.index) ?? Infinity) < current.paid) {
      continue;
    }
    const tile = grid.tiles[current.index];
    if (
      (target.kind === 'exit' && tile.kind === 'exit') ||
      (target.kind === 'chest' && tile.kind === 'chest' && tile.cell === target.cell)
    ) {
      return current.paid;
    }
    const row = Math.floor(current.index / grid.width);
    const col = current.index % grid.width;
    for (const [dr, dc] of STEPS) {
      const next = tileAt(grid, row + dr, col + dc);
      if (next === undefined || next.kind === 'wall') {
        continue;
      }
      const toll =
        next.kind === 'camp' && next.cell !== undefined ? (costs.get(next.cell) ?? 0) : 0;
      const paid = current.paid + toll;
      const nextIndex = next.row * grid.width + next.col;
      if (paid < (best.get(nextIndex) ?? Infinity)) {
        best.set(nextIndex, paid);
        frontier.push({ index: nextIndex, paid });
      }
    }
  }
  return null;
}

/**
 * Structural problems with a map, as sentences.
 *
 * Empty for a well-formed map; `expedition.spec.ts` asserts exactly that for everything shipped.
 * Returned as a list rather than thrown because the caller is a spec that wants to print all of
 * them, not a loader that wants to stop on the first.
 */
export function expeditionMapIssues(map: ExpeditionMapData): readonly string[] {
  const issues: string[] = [];
  const grid = parseExpeditionGrid(map);

  if (map.grid.some((row) => row.length !== grid.width)) {
    issues.push('grid rows are not all the same length');
  }

  const starts = grid.tiles.filter((tile) => tile.kind === 'start').length;
  const exits = grid.tiles.filter((tile) => tile.kind === 'exit').length;
  if (starts !== 1) {
    issues.push(`expected exactly one start tile, found ${starts}`);
  }
  if (exits !== 1) {
    issues.push(`expected exactly one exit tile, found ${exits}`);
  }

  const placed = (kind: 'camp' | 'chest'): Map<string, number> => {
    const seen = new Map<string, number>();
    for (const tile of grid.tiles) {
      if (tile.kind === kind && tile.cell !== undefined) {
        seen.set(tile.cell, (seen.get(tile.cell) ?? 0) + 1);
      }
    }
    return seen;
  };
  const campTiles = placed('camp');
  const chestTiles = placed('chest');

  for (const [cell, count] of [...campTiles, ...chestTiles]) {
    if (count > 1) {
      issues.push(`cell ${cell} appears ${count} times in the grid`);
    }
  }
  for (const camp of map.camps) {
    if (!campTiles.has(camp.cell)) {
      issues.push(`camp ${camp.cell} has no tile in the grid`);
    }
  }
  for (const chest of map.chests) {
    if (!chestTiles.has(chest.cell)) {
      issues.push(`chest ${chest.cell} has no tile in the grid`);
    }
  }
  for (const cell of campTiles.keys()) {
    if (!map.camps.some((camp) => camp.cell === cell)) {
      issues.push(`grid camp ${cell} has no data row`);
    }
  }
  for (const cell of chestTiles.keys()) {
    if (!map.chests.some((chest) => chest.cell === cell)) {
      issues.push(`grid chest ${cell} has no data row`);
    }
  }

  const campCells = new Set(map.camps.map((camp) => camp.cell));
  const chestCells = new Set(map.chests.map((chest) => chest.cell));
  if (campCells.size !== map.camps.length) {
    issues.push('two camps share a cell');
  }
  if (chestCells.size !== map.chests.length) {
    issues.push('two chests share a cell');
  }

  const bosses = map.camps.filter((camp) => camp.boss);
  if (bosses.length !== 1) {
    issues.push(`expected exactly one boss camp, found ${bosses.length}`);
  }
  const boss = bosses[0];
  if (boss !== undefined) {
    // The boss gates the exit: with every camp but the boss cleared, the exit must still be closed.
    const allButBoss = new Set([...campCells].filter((cell) => cell !== boss.cell));
    if (exitReachable(grid, allButBoss)) {
      issues.push('the exit is reachable without beating the boss camp');
    }
  }

  return issues;
}
