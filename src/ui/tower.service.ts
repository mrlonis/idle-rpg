import { computed, inject, Service } from '@angular/core';
import {
  clearedFloors,
  floorLevel,
  type GameState,
  isTowerUnlocked,
  nextFloor,
  type TowerData,
} from '../core';
import { TOWER_LIST, TOWER_SHAPE, TOWERS_BY_ID } from './content';
import { GameLoopService } from './game-loop.service';

/**
 * Where a run stands in one tower.
 *
 * Three states rather than two booleans, because every screen that draws a tower has to say exactly
 * one thing about it and a pair of flags admits a fourth combination that means nothing.
 */
export type TowerStatus = 'locked' | 'climbing' | 'topped';

/**
 * One tower as the screens draw it.
 *
 * Facts only. The copy — what a locked row says, what the control is called — is written in the
 * component that shows it, for the reason the crew editor writes its own empty-section wording:
 * this service supplies the fact behind a sentence, not the sentence.
 */
export interface TowerView {
  readonly tower: TowerData;
  readonly status: TowerStatus;
  /** How high this run has climbed. */
  readonly cleared: number;
  /** How high the tower goes. */
  readonly floors: number;
  /** The floor the next fight enters, or `null` at the top and while locked. */
  readonly next: number | null;
  /** Campaign clears still needed before it opens. Zero once open. */
  readonly clearsNeeded: number;
  /** The level the next floor fights at, or the top floor's once the tower is topped. */
  readonly level: number;
  /** Progress as a 0–1 fraction, for a bar. */
  readonly fraction: number;
}

/**
 * The towers' read model: how far each has been climbed, and what the screens say about it.
 *
 * ## Why this is its own service, and what it deliberately does not do
 *
 * Three screens draw a tower and only one of them fights, so progress is the shared part and the
 * animator is not. Everything here is derived by `core/towers.ts` from the **one integer per tower**
 * the run stores; there is no state of its own, because a second copy of "how far have I climbed" is
 * how a screen and a save start disagreeing.
 *
 * ⚠️ **It does not decide which floor gets fought.** `BattleService` resolves that from
 * `GameLoopService.current` — the authoritative run — where this reads the ~6Hz snapshot every other
 * screen renders from. One of those is right for drawing a card and the other is right for starting a
 * fight, and using the sampled one to pick a floor is how a run pays for the same floor twice.
 *
 * ⚠️ **A tower's progress is not the campaign's.** `clearedStages` is read here for exactly one
 * question — whether a tower has opened yet — and never written. See `core/towers.ts` for why a tower
 * clear feeding that counter would take the idle crystal rate to roughly ×8 the base.
 */
@Service()
export class TowerService {
  private readonly game = inject(GameLoopService);

  /** Every tower this build ships, in the order the screens list them. */
  readonly towers = TOWER_LIST;

  /** One tower by id, or `null` for an activity that is not a tower this build ships. */
  tower(activityId: string): TowerData | null {
    return TOWERS_BY_ID.get(activityId) ?? null;
  }

  /**
   * Every tower's progress, for the screens that draw all of them.
   *
   * Empty until the run has loaded, so a card cannot flash "locked" at somebody who has climbed
   * ninety floors — the same call Home's campaign card makes by saying "Preparing…".
   */
  readonly rows = computed<readonly TowerView[]>(() => {
    const state = this.game.snapshot();
    return state === null ? [] : this.towers.map((tower) => viewOf(tower, state));
  });

  /** One tower's progress, or `null` before the run has loaded or for an activity that is not one. */
  view(activityId: string): TowerView | null {
    const tower = this.tower(activityId);
    const state = this.game.snapshot();
    return tower === null || state === null ? null : viewOf(tower, state);
  }
}

/**
 * Where `state` stands in `tower`.
 *
 * A free function rather than a method because it holds nothing: every clamp it needs is already in
 * `core/towers.ts`, which is what makes a damaged save read as untouched or as finished rather than
 * as a floor that does not exist.
 */
function viewOf(tower: TowerData, state: GameState): TowerView {
  const cleared = clearedFloors(state, tower);
  const unlocked = isTowerUnlocked(state, tower);
  const next = unlocked ? nextFloor(state, tower) : null;
  const floors = tower.floors.length;
  const clears = Math.max(Math.floor(state.clearedStages), 0);
  return {
    tower,
    status: !unlocked ? 'locked' : next === null ? 'topped' : 'climbing',
    cleared,
    floors,
    next,
    clearsNeeded: Math.max(tower.unlockClears - clears, 0),
    level: floorLevel(TOWER_SHAPE, next ?? Math.max(floors, 1)),
    fraction: floors === 0 ? 0 : cleared / floors,
  };
}
