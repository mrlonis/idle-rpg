import { credit, raiseRates, type Rates } from '../currency';
import { type Numeric, ZERO } from '../numeric';
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
 * - The one-off `reward` is paid on **every** win, including a re-fight. Farming a stage you
 *   have already beaten is a legitimate way to spend an evening, and it should pay.
 * - The permanent idle-rate increase is paid on a **first clear only**. It is a one-time
 *   unlock per stage, not a per-victory bonus — "clearing a stage raises your income for good"
 *   describes something that happens once, and re-running it should not be reaching for the
 *   rate table at all.
 * - The first-clear summon bonus is likewise paid **once per stage, ever**.
 *
 * `clearedStages` is what makes both of those answerable: `stage` stops climbing at the top of
 * the ladder, so a player farming the last stage would otherwise re-earn its bonus on every win.
 *
 * `raiseRates` still guards against a rate ever falling, even though a first clear should never
 * offer less than the run already earns. It is one comparison per currency and it means a save
 * from a build with a different curve cannot cut a player's income — see `reconcileClearedStages`
 * for the repair path that leans on the same guarantee.
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
    // First clear only. A re-fight pays its lump and changes nothing about income.
    rates: isFirstClear ? raiseRates(state.rates, result.reward.rates) : state.rates,
    stage,
    clearedStages: isFirstClear ? current : state.clearedStages,
    battleCount: state.battleCount + 1,
  };
}

/** One stage's progression payload, as `reconcileClearedStages` needs it. */
export interface StageProgressData {
  /** The idle rates clearing this stage unlocks. */
  readonly rates: Readonly<Partial<Rates>>;
  /** Summon crystals paid the first time it falls, and never again. */
  readonly firstClearSummons: Numeric;
}

/**
 * Restores the idle rates and first-clear bonuses a run has already earned, and corrects an
 * undercounted clear.
 *
 * ## Why this exists
 *
 * The `v2 → v3` migration had a hole. It moved `goldPerSec` into the wallet's `gold` rate and
 * started `xp`, `essence` and `summons` at zero — correct in the sense that a pre-gacha save has
 * no claim on currencies that did not exist, and wrong in the sense that it *does*: those rates
 * are unlocked by stages the player demonstrably already cleared. The symptom was a returning
 * player whose gold ticked up while nothing else moved, with no way back except re-fighting.
 *
 * It also seeded `clearedStages` from `stage - 1`. That is exact mid-ladder, and one short at the
 * top, because `stage` stops climbing there — so a player who had beaten every stage was recorded
 * as having beaten all but the last, and re-fighting it counted as a first clear.
 *
 * ## How the lost progress is recovered
 *
 * The surviving gold rate is the receipt. Rates only ever rise and each stage grants strictly
 * more than the one below it, so the highest stage whose gold rate the run already meets is
 * exactly how far it got. That is enough to rebuild everything the migration dropped, without
 * asking the player to fight anything.
 *
 * ## Crediting a stage means paying for it
 *
 * Marking a stage cleared without paying its first-clear bonus is worse than leaving it
 * uncredited, because `applyBattleResult` will then never pay it either — the door closes
 * silently and the crystals are gone for good. So this pays the bonus for **every stage it newly
 * credits**, which for a v2 save that had beaten the ladder is the whole 3,000: exactly what a
 * new player earns for climbing the same eight stages, which is the only fair place to land.
 *
 * Stages already counted in `clearedStages` are not re-paid. That is what keeps it idempotent —
 * the second load credits nothing, so it owes nothing.
 *
 * This only ever **raises** — `clearedStages` never falls, no rate is ever cut, no crystals are
 * ever taken, and a run that is already consistent comes back untouched. That is what lets it run
 * on every load, like `grantStarters`, rather than being a one-shot fix that needs its own
 * version gate.
 *
 * `stages` is passed in because `core/` cannot import `data/`.
 */
export function reconcileClearedStages(
  state: GameState,
  stages: readonly StageProgressData[],
): GameState {
  if (stages.length === 0) {
    return state;
  }

  // The highest stage whose gold rate this run already meets. Ascending rates make this the
  // count of stages cleared; a fresh run meets none of them and lands on zero.
  let earned = 0;
  for (const [index, stage] of stages.entries()) {
    const gold = stage.rates.gold;
    if (gold !== undefined && gold.gt(ZERO) && state.rates.gold.gte(gold)) {
      earned = index + 1;
    }
  }

  const before = Math.min(Math.max(Math.floor(state.clearedStages), 0), stages.length);
  const cleared = Math.min(Math.max(before, earned), stages.length);

  let rates = state.rates;
  for (let stage = 0; stage < cleared; stage++) {
    rates = raiseRates(rates, stages[stage].rates);
  }

  // Only the stages this call is crediting for the first time. Anything already in
  // `clearedStages` was either fought under this build and paid, or credited by an earlier run
  // of this repair and paid then.
  let owed = ZERO;
  for (let stage = before; stage < cleared; stage++) {
    owed = owed.add(stages[stage].firstClearSummons);
  }

  if (cleared === state.clearedStages && rates === state.rates && owed.lte(ZERO)) {
    // Nothing to repair. Returning the original reference keeps a clean load from publishing a
    // new snapshot and re-rendering every screen watching it.
    return state;
  }
  return {
    ...state,
    clearedStages: cleared,
    rates,
    wallet: owed.gt(ZERO) ? credit(state.wallet, { summons: owed }) : state.wallet,
  };
}
