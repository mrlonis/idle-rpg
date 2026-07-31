import { type GameState } from '../state';
import { type BattleResult } from './types';

/**
 * Folding a resolved battle back into the run.
 *
 * Separate from `simulateBattle` because the simulation knows nothing about the save: it is
 * handed a stage and a seed and hands back what happened. Deciding what that *means* for
 * progression is this function's job, and keeping the two apart is what lets a balance sweep
 * simulate ten thousand battles without ever constructing a `GameState`.
 */

/**
 * Applies a battle's outcome to the run.
 *
 * - `battleCount` always advances, win or lose. It feeds the battle RNG label, so a retry has
 *   to be a different fight rather than a replay of the same loss — otherwise a stage the
 *   party narrowly fails becomes a permanent wall for reasons the player cannot see.
 * - A victory advances the stage, stopping at the last one authored, which then repeats.
 * - Rewards are whatever the result carries, which is nothing on a loss.
 * - Idle income only ever goes **up**. A clear raises the rate to what the stage grants, and a
 *   stage granting less than the run already earns changes nothing. That guard costs one
 *   comparison and means neither replaying an early stage nor loading a save from a build with
 *   a different curve can ever cut a player's income.
 *
 * `stageCount` is passed in because `core/` cannot import `data/` — content reaches the
 * simulation as arguments, which is also what lets this be tested without shipped stages.
 */
export function applyBattleResult(
  state: GameState,
  result: BattleResult,
  stageCount: number,
): GameState {
  const lastStage = Number.isFinite(stageCount) ? Math.max(Math.floor(stageCount), 1) : 1;
  const stage =
    result.outcome === 'victory'
      ? Math.min(state.stage + 1, lastStage)
      : Math.min(state.stage, lastStage);

  return {
    ...state,
    gold: state.gold.add(result.reward.gold),
    goldPerSec: result.reward.goldPerSec.gt(state.goldPerSec)
      ? result.reward.goldPerSec
      : state.goldPerSec,
    stage,
    battleCount: state.battleCount + 1,
  };
}
