import { credit, raiseRates } from '../currency';
import { ZERO } from '../numeric';
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
 * - Idle income only ever goes **up**, on every currency. A clear raises each rate to what the
 *   stage grants, and a stage granting less than the run already earns changes nothing. That
 *   guard costs one comparison per currency and means neither replaying an early stage nor
 *   loading a save from a build with a different curve can ever cut a player's income.
 * - The first-clear summon bonus is paid **once per stage, ever**. `clearedStages` is what
 *   makes that answerable: `stage` stops climbing at the top of the ladder, so a player farming
 *   the last stage would otherwise re-earn its bonus on every win.
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
  const won = result.outcome === 'victory';

  // The stage actually fought, clamped to the content this build ships — which is what the UI
  // clamped it to before simulating. Reading `state.stage` raw here would let a save from a
  // content-richer build credit a clear for a stage number that does not exist, and the
  // first-clear counter would then sit permanently above anything reachable, silently
  // withholding every remaining bonus.
  const current = Math.min(Math.max(Math.floor(state.stage), 1), lastStage);
  const stage = won ? Math.min(current + 1, lastStage) : current;

  const isFirstClear = won && current > state.clearedStages;
  const bonus = isFirstClear ? result.reward.firstClearSummons : ZERO;

  let wallet = credit(state.wallet, result.reward.gained);
  if (bonus.gt(ZERO)) {
    wallet = credit(wallet, { summons: bonus });
  }

  return {
    ...state,
    wallet,
    rates: raiseRates(state.rates, result.reward.rates),
    stage,
    clearedStages: isFirstClear ? current : state.clearedStages,
    battleCount: state.battleCount + 1,
  };
}
