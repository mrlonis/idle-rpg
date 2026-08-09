import {
  credit,
  type IdleRateCurves,
  raiseRates,
  type Rates,
  withEmblemRate,
  withSummonRate,
} from '../currency';
import { type EmblemDropData, rollEmblems } from '../emblems';
import { addGear } from '../gear/inventory';
import { rollDrops } from '../gear/roll';
import { type GearRulesData } from '../gear/types';
import {
  advancePosition,
  type ChapterCurveData,
  chaptersCleared,
  type LadderShape,
  positionAt,
  stageIndex,
  stageKindAt,
  stagePayout,
  stagesInChapter,
  type StageRewardCurveData,
  totalStages,
} from '../ladder';
import { num, type Numeric, ZERO } from '../numeric';
import { derivedStream } from '../rng';
import { type GameState } from '../state';
import { type AuthoredAmount, type BattleResult, type StageKind } from './types';

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
 * - A victory advances the position, rolling into the next chapter and stopping at the last stage
 *   authored, which then repeats.
 * - The one-off `reward` is paid on **every** win, including a re-fight. Farming a stage you
 *   have already beaten is a legitimate way to spend an evening, and it should pay.
 * - The permanent idle-rate increase is paid on a **first clear only**. It is a one-time
 *   unlock per stage, not a per-victory bonus — "clearing a stage raises your income for good"
 *   describes something that happens once, and re-running it should not be reaching for the
 *   rate table at all.
 * - The first-clear summon bonus is likewise paid **once per stage, ever**.
 * - The crystal rate is not read off the stage at all. It is a function of `clearedStages`
 *   (see {@link SummonRateCurve}), so a first clear steps it up and a re-fight cannot: the
 *   count is what moved, not the stage that was fought.
 *
 * `clearedStages` is what makes all of those answerable: the position stops climbing at the top
 * of the ladder, so a player farming the last stage would otherwise re-earn its bonus on every
 * win. It is compared against the **linear index** of the stage that was fought, which is the one
 * place a chapter and a stage have to become a single number.
 *
 * `raiseRates` still guards against a rate ever falling, even though a first clear should never
 * offer less than the run already earns. It is one comparison per currency and it means a save
 * from a build with a different curve cannot cut a player's income — which stopped being
 * hypothetical in milestone 11, when the rates for a given stage number were re-derived from
 * scratch. See `reconcileClearedStages` for the repair path that leans on the same guarantee.
 *
 * `ladder` and `curves` are passed in because `core/` cannot import `data/` — content reaches the
 * simulation as arguments, which is also what lets this be tested without shipped stages.
 */
export function applyBattleResult(
  state: GameState,
  result: BattleResult,
  ladder: LadderShape,
  curves: IdleRateCurves,
  drops?: DropAward,
): GameState {
  const won = result.outcome === 'victory';

  // The stage actually fought, clamped to the content this build ships — which is what the UI
  // clamped it to before simulating. Reading the position raw here would let a save from a
  // content-richer build credit a clear for a stage that does not exist, and the first-clear
  // counter would then sit permanently above anything reachable, silently withholding every
  // remaining bonus.
  const current = stageIndex(ladder, state);
  const position = won ? advancePosition(ladder, state) : positionAt(ladder, current);

  const isFirstClear = won && current > state.clearedStages;
  const bonus = isFirstClear ? result.reward.firstClearSummons : ZERO;

  let wallet = credit(state.wallet, result.reward.gained);
  if (bonus.gt(ZERO)) {
    wallet = credit(wallet, { summons: bonus });
  }

  const clearedStages = isFirstClear ? current : state.clearedStages;

  // First clear only. A re-fight pays its lump and changes nothing about income.
  const unlocked = isFirstClear ? raiseRates(state.rates, result.reward.rates) : state.rates;
  // Both applied on every battle rather than only on a first clear, because both are functions of
  // a count that did not necessarily change. That costs one comparison per currency on a loss and
  // means a run whose crystal or emblem rate somehow sits below what its clears have earned heals
  // on the next fight instead of waiting for a reload.
  //
  // The emblem rate steps per **chapter**, so it is fed the derived chapter count rather than
  // `clearedStages`. Handing it the stage count type-checks and is wrong by the size of a chapter
  // — an income fifty times too large, which presents as a generous run rather than as a bug.
  const withCrystals = withSummonRate(unlocked, curves.summons, clearedStages);
  const rates = withEmblemRate(
    withCrystals,
    curves.emblem,
    chaptersCleared(ladder, clearedStages).total,
  );

  const advanced: GameState = {
    ...state,
    wallet,
    rates,
    chapter: position.chapter,
    stage: position.stage,
    clearedStages,
    battleCount: state.battleCount + 1,
  };

  if (!won || drops === undefined) {
    return advanced;
  }
  // Rolled from a **derived** stream keyed on the battle that produced them, exactly as the fight
  // itself is. Drawing from the main stream would make clearing a stage shift the pull sequence,
  // which is the hazard `core/rng.ts` exists to remove; `state.battleCount` is in the label rather
  // than `advanced.battleCount` so a drop belongs to the fight that dropped it.
  const draw = derivedStream(state.rng.seed, `gear:${current}:${state.battleCount}`);
  const specs = rollDrops(drops.rules, drops.factions, current, drops.kind, draw);
  const withGear = addGear(advanced, specs, drops.rules).state;

  if (drops.emblems === undefined) {
    return withGear;
  }
  // ⚠️ **A separate stream, not another draw from the gear one.** The count draw in `rollDrops` is
  // the first draw it takes and every later draw shifts by one, so adding a draw to that sequence
  // re-rolls every historical gear drop for a given seed — invisible in play, and it turns every
  // recorded balance figure into a different number. A different label costs nothing and makes the
  // two faucets independent forever.
  const emblemDraw = derivedStream(state.rng.seed, `emblem:${current}:${state.battleCount}`);
  // The chapter count **after** this clear is credited, so the chapter boss that finishes chapter 1
  // is itself able to drop. Gating on the count before it would make the clear that unlocks emblems
  // the one clear that cannot produce one.
  const earned = rollEmblems(
    drops.emblems,
    drops.kind,
    chaptersCleared(ladder, clearedStages).total,
    emblemDraw,
  );
  if (earned <= 0) {
    return withGear;
  }
  return { ...withGear, wallet: credit(withGear.wallet, { emblem: num(earned) }) };
}

/**
 * What a stage clear drops, as the caller has to describe it.
 *
 * A bundle rather than four more parameters, and **optional** rather than required: the balance
 * sweep and every combat spec fold results into a run without caring about the bag, and a required
 * argument would make each of them construct drop content they have no use for.
 *
 * The stage `kind` is passed in rather than derived because `applyBattleResult` is handed a ladder
 * *shape* — chapter lengths — and not the chapter curve that decides where the mini-bosses fall.
 * The caller already resolved the stage it fought, so it already knows. Both drop tables read it,
 * which is most of the argument for one bundle rather than two.
 */
export interface DropAward {
  readonly rules: GearRulesData;
  /** The factions a dropped piece may be aligned to. Content, so it arrives as an argument. */
  readonly factions: readonly string[];
  readonly kind: StageKind;
  /**
   * The emblem drop table, or absent to drop no emblems at all.
   *
   * Optional **separately** from the bundle it sits in, so a caller can take gear without emblems.
   * That is not hypothetical tidiness: it is what lets the gear specs keep asserting exactly what
   * they asserted before milestone 16, against a state whose wallet this cannot have touched.
   */
  readonly emblems?: EmblemDropData;
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
 * top, because the position stops climbing there — so a player who had beaten every stage was
 * recorded as having beaten all but the last, and re-fighting it counted as a first clear.
 *
 * ## How the lost progress is recovered
 *
 * The surviving gold rate is the receipt. Rates only ever rise and each stage grants strictly
 * more than the one below it, so the highest stage whose gold rate the run already meets is
 * roughly how far it got. That is enough to rebuild everything the migration dropped, without
 * asking the player to fight anything.
 *
 * ⚠️ **The receipt can only be trusted as far as the run has actually travelled, and milestone 11
 * is when that stopped being pedantry.** A receipt is denominated in whatever the rate curve said
 * on the day it was written, and that curve was re-derived from scratch when the ladder went from
 * twenty-four stages to a hundred — so a veteran arriving with the old ladder's top gold rate
 * reads, against the new curve, as somebody who has cleared the entire game. Crediting that would
 * hand over every first-clear bonus on the ladder for stages they have never seen. So the receipt
 * is capped at the linear index of the position the save is parked on: **a run cannot have
 * cleared more stages than it has reached.** That is true independently of any curve, which is
 * why it is the right guard rather than a version check.
 *
 * ## Crediting a stage means paying for it
 *
 * Marking a stage cleared without paying its first-clear bonus is worse than leaving it
 * uncredited, because `applyBattleResult` will then never pay it either — the door closes
 * silently and the crystals are gone for good. So this pays the bonus for **every stage it newly
 * credits**, which for a v2 save that had beaten the ladder is the whole of it: exactly what a
 * new player earns for climbing the same stages, which is the only fair place to land.
 *
 * Stages already counted in `clearedStages` are not re-paid. That is what keeps it idempotent —
 * the second load credits nothing, so it owes nothing.
 *
 * ## Rates are a function now, and that made this simpler rather than harder
 *
 * The three unlocked rates used to be re-summed out of an authored table, one `raiseRates` call
 * per cleared stage. They are a function of the linear index and strictly increasing in it, so
 * the top cleared stage's rates dominate every stage below it and one evaluation replaces the
 * loop. At a hundred stages that is a tidiness; at the thousands this ladder is shaped for it is
 * the difference between a load that is free and one that is not.
 *
 * The crystal rate is a function of the clear count in the same way, which makes this the natural
 * place to evaluate it — and the only place that can, for a run that has never fought: `newGame`
 * cannot see content, so a brand-new save arrives with a zero crystal rate and leaves this
 * function earning the base.
 *
 * The emblem rate is the same kind of thing one level up: a function of the **chapter** count,
 * itself derived from the clear count against this ladder. That it is derived here rather than
 * stored is what makes a re-cut ladder safe — a save mid-way through a chapter that a later build
 * lengthened comes out of this with the rate its clears actually earn under the new shape, with
 * nothing to migrate.
 *
 * This only ever **raises** — `clearedStages` never falls, no rate is ever cut, no crystals are
 * ever taken, and a run that is already consistent comes back untouched. That is what lets it run
 * on every load, like `grantStarters`, rather than being a one-shot fix that needs its own
 * version gate.
 *
 * Every piece of content it needs is passed in because `core/` cannot import `data/`.
 */
export function reconcileClearedStages(
  state: GameState,
  ladder: LadderShape,
  chapterCurve: ChapterCurveData,
  rewards: StageRewardCurveData,
  curves: IdleRateCurves,
): GameState {
  const total = totalStages(ladder);
  if (total === 0) {
    // No ladder to reconcile against, but the crystal base does not come from the ladder — a
    // build shipping no stages still earns it, and returning early without it would make the
    // rate depend on content it has nothing to do with.
    //
    // The emblem rate is not in the same position and deliberately gets no such exception: it has
    // no base, and with no chapters there is no chapter to have cleared, so zero is the true
    // answer rather than a value waiting to be repaired.
    const rates = withSummonRate(state.rates, curves.summons, state.clearedStages);
    return rates === state.rates ? state : { ...state, rates };
  }

  // The highest stage whose gold rate this run already meets, never more than it has reached.
  // Ascending rates make the first half a count of stages cleared; a fresh run meets none of them
  // and lands on zero.
  const reached = stageIndex(ladder, state);
  let earned = 0;
  for (let index = 1; index <= reached; index++) {
    if (state.rates.gold.gte(num(stagePayout(rewards, index).rates.gold ?? 0))) {
      earned = index;
    }
  }

  const before = Math.min(Math.max(Math.floor(state.clearedStages), 0), total);
  const cleared = Math.min(Math.max(before, earned), total);

  // One evaluation rather than a sum: the rates are strictly increasing in the index, so the top
  // cleared stage already grants at least what every stage below it did.
  let rates = state.rates;
  if (cleared > 0) {
    rates = raiseRates(rates, toRateAmounts(stagePayout(rewards, cleared).rates));
  }
  rates = withSummonRate(rates, curves.summons, cleared);
  rates = withEmblemRate(rates, curves.emblem, chaptersCleared(ladder, cleared).total);

  // Only the stages this call is crediting for the first time. Anything already in
  // `clearedStages` was either fought under this build and paid, or credited by an earlier run
  // of this repair and paid then.
  let owed = ZERO;
  for (let index = before + 1; index <= cleared; index++) {
    const kind = kindOf(ladder, chapterCurve, index);
    owed = owed.add(stagePayout(rewards, index, kind).firstClearSummons);
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

/** What kind of stage the `index`th stage of the ladder is, given how the chapters are cut. */
function kindOf(ladder: LadderShape, chapterCurve: ChapterCurveData, index: number): StageKind {
  const position = positionAt(ladder, index);
  return stageKindAt(chapterCurve, stagesInChapter(ladder, position.chapter), position.stage);
}

/**
 * A payout's authored rates, as the `Numeric` partial `raiseRates` compares against.
 *
 * Deliberately narrow: `raiseRates` is keyed by every rate-bearing currency including `summons`,
 * and the crystal rate is emphatically not a per-stage unlock — letting one through here would
 * put a second mechanism on the same number, with whichever happened to be larger silently
 * winning.
 */
function toRateAmounts(rates: {
  readonly gold?: AuthoredAmount;
  readonly xp?: AuthoredAmount;
  readonly essence?: AuthoredAmount;
}): Readonly<Partial<Rates>> {
  const offered: { gold?: Numeric; xp?: Numeric; essence?: Numeric } = {};
  if (rates.gold !== undefined) {
    offered.gold = num(rates.gold);
  }
  if (rates.xp !== undefined) {
    offered.xp = num(rates.xp);
  }
  if (rates.essence !== undefined) {
    offered.essence = num(rates.essence);
  }
  return offered;
}
