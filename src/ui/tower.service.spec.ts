import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { type GameState, newGame } from '../core';
import { TOWER_HUMAN } from '../data';
import { GameLoopService } from './game-loop.service';
import { TowerService } from './tower.service';

const T0 = 1_700_000_000_000;

/** Only the snapshot, which is the whole of what the tower read model asks of the loop. */
class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(null);
}

function build(state: GameState | null = newGame({ seed: 0xc0ffee, nowMs: T0 })) {
  const loop = new FakeGameLoop();
  loop.snapshot.set(state);

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [TowerService, { provide: GameLoopService, useValue: loop }],
  });

  return { loop, towers: TestBed.inject(TowerService) };
}

/** A run at a given point in the campaign and a given height up the tower. */
function run(clearedStages: number, floors?: number): GameState {
  return {
    ...newGame({ seed: 0xc0ffee, nowMs: T0 }),
    clearedStages,
    ...(floors === undefined ? {} : { towers: { [TOWER_HUMAN.id]: floors } }),
  };
}

const FLOORS = TOWER_HUMAN.floors.length;

describe('TowerService', () => {
  it('reports a tower the campaign has not opened as locked, counting down to the key', () => {
    // The card is a goal rather than a refusal, so the fact behind the copy is how many clears are
    // left — a number that visibly approaches — not merely that the door is shut.
    const { towers } = build(run(TOWER_HUMAN.unlockClears - 4));
    const view = towers.view(TOWER_HUMAN.id);

    expect(view?.status).toBe('locked');
    expect(view?.clearsNeeded).toBe(4);
    expect(view?.next).toBeNull();
  });

  it('opens the tower on the clear it says it will', () => {
    expect(build(run(TOWER_HUMAN.unlockClears)).towers.view(TOWER_HUMAN.id)?.status).toBe(
      'climbing',
    );
    expect(build(run(TOWER_HUMAN.unlockClears)).towers.view(TOWER_HUMAN.id)?.clearsNeeded).toBe(0);
  });

  it('points an open tower at the floor above the highest one cleared', () => {
    const { towers } = build(run(TOWER_HUMAN.unlockClears, 36));
    const view = towers.view(TOWER_HUMAN.id);

    expect(view?.status).toBe('climbing');
    expect(view?.cleared).toBe(36);
    expect(view?.next).toBe(37);
    expect(view?.floors).toBe(FLOORS);
    expect(view?.fraction).toBeCloseTo(0.36);
  });

  it('reports a level that rises with the climb and stops at the tower ceiling', () => {
    const low = build(run(TOWER_HUMAN.unlockClears, 0)).towers.view(TOWER_HUMAN.id);
    const high = build(run(TOWER_HUMAN.unlockClears, 90)).towers.view(TOWER_HUMAN.id);
    const topped = build(run(TOWER_HUMAN.unlockClears, FLOORS)).towers.view(TOWER_HUMAN.id);

    expect(low?.level).toBe(1);
    expect(high?.level).toBeGreaterThan(low?.level ?? 0);
    // A topped tower has no next floor, so the level it reports is its **top** one. Falling back to
    // floor 1 there would have a finished card claiming the tower is trivial.
    expect(topped?.level).toBeGreaterThan(high?.level ?? 0);
  });

  it('reports a finished tower as topped, with nothing left to fight', () => {
    // ⚠️ **A floor is climbed once.** `nextFloor` in `core/` returns `null` at the top rather than
    // clamping, and this is the screen-side half of that: a topped card must not be a link to a
    // Fight control that silently refuses.
    const { towers } = build(run(TOWER_HUMAN.unlockClears, FLOORS));
    const view = towers.view(TOWER_HUMAN.id);

    expect(view?.status).toBe('topped');
    expect(view?.next).toBeNull();
    expect(view?.cleared).toBe(FLOORS);
    expect(view?.fraction).toBe(1);
  });

  it('reads a save from a build with a taller tower as finished rather than out of range', () => {
    const { towers } = build(run(TOWER_HUMAN.unlockClears, FLOORS + 150));
    const view = towers.view(TOWER_HUMAN.id);

    expect(view?.status).toBe('topped');
    expect(view?.cleared).toBe(FLOORS);
    expect(view?.fraction).toBe(1);
  });

  it('reads a damaged floor count as nothing climbed', () => {
    const { towers } = build(run(TOWER_HUMAN.unlockClears, Number.NaN));

    expect(towers.view(TOWER_HUMAN.id)?.cleared).toBe(0);
    expect(towers.view(TOWER_HUMAN.id)?.next).toBe(1);
  });

  it('answers for an activity that is not a tower with null rather than a blank row', () => {
    const { towers } = build();

    expect(towers.view('campaign')).toBeNull();
    expect(towers.view('tower-nowhere')).toBeNull();
    expect(towers.tower('campaign')).toBeNull();
  });

  it('reports no rows at all until the run has loaded', () => {
    // ⚠️ Not "everything locked". A card that flashed "clear 12 stages to open" at somebody ninety
    // floors up would be the app appearing to have lost their progress — the same reason Home's
    // campaign card says "Preparing…" rather than naming stage 1.
    const { towers } = build(null);

    expect(towers.rows()).toEqual([]);
    expect(towers.view(TOWER_HUMAN.id)).toBeNull();
  });

  it('lists every shipped tower, in the order the content authors them', () => {
    const { towers } = build(run(TOWER_HUMAN.unlockClears));

    expect(towers.rows().map((row) => row.tower.id)).toEqual(towers.towers.map((row) => row.id));
    expect(towers.rows().length).toBeGreaterThan(0);
  });

  it('follows the run rather than holding a copy of it', () => {
    // No state of its own: a second copy of "how far have I climbed" is how a screen and a save
    // start disagreeing.
    const { loop, towers } = build(run(TOWER_HUMAN.unlockClears, 10));

    expect(towers.view(TOWER_HUMAN.id)?.next).toBe(11);
    loop.snapshot.set(run(TOWER_HUMAN.unlockClears, 40));

    expect(towers.view(TOWER_HUMAN.id)?.next).toBe(41);
    expect(towers.rows()[0].cleared).toBe(40);
  });
});
