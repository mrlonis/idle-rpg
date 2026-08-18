import {
  type AuthoredCurrencies,
  type EnemyFormationData,
  type EnemyGearData,
  type StageData,
  type StageKind,
} from './battle/types';
import { credit, type CurrencyAmounts } from './currency';
import { type EmblemDropData, rollEmblems } from './emblems';
import { addGear } from './gear/inventory';
import { rollDrops } from './gear/roll';
import { enemyGearBonuses, gearAtLadderPosition, gearLadderPosition } from './gear/stats';
import { type GearRulesData } from './gear/types';
import { num } from './numeric';
import { derivedStream } from './rng';
import { type GameState } from './state';

/**
 * Faction towers: a second thing to climb, and the first content that is not the campaign.
 *
 * ## What a tower is, in one paragraph
 *
 * Five hundred floors, climbed once each, crewed by five characters of a single faction. The enemy
 * level runs **1 to 236, linearly** — deliberately inside the campaign's own range, which reaches 605
 * by the end of chapter 25 — so a tower is not where difficulty lives. What a tower asks for is
 * **breadth**: seven of them is thirty-five invested characters against a campaign that has never
 * needed more than five.
 *
 * ⚠️ **The height is a rule for all seven and only the Human Tower is at it.** See `data/towers.ts`
 * for the `PENDING` discipline that keeps the other six honest while their floors are authored.
 *
 * ## The three ways it deliberately differs from the campaign
 *
 * - ⚠️ **A tower clear never touches `clearedStages`, the ladder position, or an idle rate.** The
 *   clear count drives the idle crystal rate, and `banners.spec.ts` bounds a cleared ladder at
 *   about ×3 the base where the shipped hundred stages already reach ×2 — seven towers of a
 *   hundred floors feeding that counter would take it to ×8. Towers keep their own progress, and
 *   the campaign stays the only thing that raises income.
 * - **A floor is climbed once.** There is no re-fighting a cleared floor, which is what keeps a
 *   tower a climb rather than a second farm. It also collapses the campaign's two payouts into
 *   one: "paid on every clear" and "paid on the first clear" describe the same event here.
 * - **The level is derived, not authored — and since the fourth hundred, so is the gear.** A campaign
 *   stage carries its own level and its own `{ grade, level }` because that curve has a tutorial ramp
 *   and a deliberate step at the healer lock. A tower's are straight lines by definition, so `data/`
 *   authors *who stands on each floor* while {@link floorLevel} says how big they are and
 *   {@link floorGear} says what they are wearing. Typing five hundred levels, or two hundred
 *   grade-and-level pairs, that must follow a formula is the retyping
 *   [testing](../../docs/testing.md) forbids.
 *
 * `core/` still cannot see `data/`: a tower arrives as {@link TowerData}, exactly as a chapter does.
 */

/**
 * The gear ramp a tower's upper floors climb, or absent for a tower whose bodies all fight naked.
 *
 * ## ⚠️ Derived from the floor index, exactly as the level is, and for the same reason
 *
 * A hundred authored `{ grade, level }` pairs that must follow a curve is the retyping
 * [testing](../../docs/testing.md) forbids — the same argument that keeps a floor's *level* out of
 * `data/`. What is authored here is where the ramp starts, where it ends, and the first floor it
 * applies to; {@link floorGear} draws the line.
 *
 * ## ⚠️ It is one axis, not two, and `gearLadderPosition` is why
 *
 * The ramp is linear in the **concatenated** grade ladder — Worn 1 through Relic 100 as one run of
 * 300 positions — rather than interpolating a grade and a level separately. A grade boundary is not
 * a level reset: Worn 20 is worth 1.176 of a piece's profile and Sturdy 1 is worth 1.35, so a ramp
 * that walked the grade up while restarting the level would be monotone only by luck. One position
 * makes "quality and level both rise across the hundred" true by construction.
 *
 * ## ⚠️ Why a tower cannot match the campaign's gear the way it matches its lump
 *
 * A floor's lump is read off the campaign stage fighting at the same enemy level, and the obvious
 * move is to read the gear the same way. **Measured, that yields no gear at all anywhere in any
 * tower**: the campaign's first geared stage is `c12-s1` at enemy **level 225**, and the tower's
 * ramp starts at floor 301, which fights at level 142. The tower reaches 225 only at floor **476**,
 * a hundred and seventy-five floors after it needs a grade, so a tower's
 * ramp has to be its own — there is nothing at its levels to match against.
 *
 * That is why this is a ramp on the *floors* and not a lookup, and it is also why the ramp may be
 * generous about grade where the campaign is not: at a tower's levels the campaign has no grade to
 * be out-geared *by*. What still binds is that gear is **texture rather than escalation** — see
 * [gear](../../docs/gear.md), where a whole grade step measured about ×1.15 against the ×3 it would
 * need to carry a band — so the authored boards, not this, are where a hundred gets harder.
 */
export interface TowerGearRampData {
  /**
   * The first floor whose bodies wear anything. Every floor below it is ungeared.
   *
   * ⚠️ **A floor, not a level.** The three hundred floors that shipped before this existed were
   * tuned naked and are still tuned naked; keying the ramp to a floor is what lets a new hundred
   * carry gear without re-tuning the ones below it. A ramp starting at floor 1 would silently
   * re-price every floor of every tower — 2,200 of them.
   */
  readonly fromFloor: number;
  /** The set {@link fromFloor} wears. */
  readonly from: EnemyGearData;
  /** The set the roof wears. Every floor between is linear on the concatenated grade ladder. */
  readonly to: EnemyGearData;
}

/** How every tower is shaped. One rule for all seven; a tower authors its line-ups and nothing else. */
export interface TowerRulesData {
  /** Floors in a tower. */
  readonly floors: number;
  /** The level the first floor's enemies fight at. */
  readonly baseLevel: number;
  /** The level the last floor's enemies fight at. Every floor between is linear in the two. */
  readonly topLevel: number;
  /** Every nth floor is a mini-boss. The last floor is a boss instead. */
  readonly miniBossEvery: number;
  /** The gear ramp the upper floors climb, or absent while no tower fields a geared board. */
  readonly gear?: TowerGearRampData;
  /**
   * Crystals paid the first — and only — time a floor falls.
   *
   * Flat, for the reason the campaign's are flat: a pull costs a flat `PULL_COST` forever, so
   * anything that scales with how far the run has come pays most to the player who needs it least.
   * The two multipliers are where the climb's rhythm pays out.
   */
  readonly floorSummons: {
    readonly base: number;
    readonly miniBossMultiplier: number;
    readonly bossMultiplier: number;
  };
}

/** One floor's authored content: who stands there, and what it is called. */
export interface TowerFloorData {
  readonly id: string;
  readonly name: string;
  /** The opposing side, in two rows. Repeating an archetype gives multiple copies. */
  readonly enemies: EnemyFormationData;
}

/** One tower, as `data/` authors it. */
export interface TowerData {
  /**
   * The activity id, which is also the {@link GameState.formations} and {@link GameState.towers}
   * key. Permanent once shipped: renaming one strands both the crew and the progress under it.
   */
  readonly id: string;
  readonly name: string;
  /** The faction this tower admits, and the one its enemies are chosen to punish. */
  readonly faction: string;
  /** Campaign stages that must have been cleared before this tower opens. */
  readonly unlockClears: number;
  /** The line-up on each floor, in climbing order. Levels are derived, never authored. */
  readonly floors: readonly TowerFloorData[];
}

/** How far each tower has been climbed, keyed by tower id. */
export type TowerProgress = Readonly<Record<string, number>>;

/** A run that has climbed nothing. */
export function emptyTowers(): TowerProgress {
  return {};
}

/** A count read off an untrusted save, as a whole number at or above zero. */
function wholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

function positiveInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 1) : fallback;
}

/** The highest floor of `tower` this run has cleared, clamped to the floors it actually ships. */
export function clearedFloors(state: GameState, tower: TowerData): number {
  return Math.min(wholeCount(state.towers[tower.id] ?? 0), tower.floors.length);
}

/**
 * The floor this run fights next, or `null` when the tower is finished.
 *
 * ⚠️ **`null` rather than clamping to the top floor**, and that is the whole difference between a
 * tower and the campaign: the campaign's position stops climbing so its last stage stays farmable,
 * and a tower simply ends. A caller handed the top floor forever would let a player re-clear it and
 * be paid again — which is the farm this design rejected.
 */
export function nextFloor(state: GameState, tower: TowerData): number | null {
  const cleared = clearedFloors(state, tower);
  return cleared >= tower.floors.length ? null : cleared + 1;
}

/** Whether this run has cleared enough of the campaign to enter `tower`. */
export function isTowerUnlocked(state: GameState, tower: TowerData): boolean {
  return wholeCount(state.clearedStages) >= Math.max(tower.unlockClears, 0);
}

/**
 * The level the enemies on `floor` fight at: a straight line from `baseLevel` to `topLevel`.
 *
 * Rounded rather than floored, so the line is symmetric about its midpoint — flooring spends an
 * extra floor at every level and lands the top one short. A single-floor tower resolves to
 * `baseLevel`, which is the only division by zero this can meet.
 */
export function floorLevel(rules: TowerRulesData, floor: number): number {
  const floors = positiveInt(rules.floors, 1);
  const base = positiveInt(rules.baseLevel, 1);
  const top = Math.max(positiveInt(rules.topLevel, base), base);
  const index = Math.min(positiveInt(floor, 1), floors);
  if (floors <= 1) {
    return base;
  }
  return Math.round(base + ((top - base) * (index - 1)) / (floors - 1));
}

/**
 * What the bodies on `floor` are wearing, or `undefined` on an ungeared floor.
 *
 * A straight line on the concatenated grade ladder from `gear.from` at `gear.fromFloor` to
 * `gear.to` at the roof — the level line's own shape, applied to the second axis. Rounded rather
 * than floored for the reason {@link floorLevel} is: flooring spends an extra floor at every
 * position and lands the roof short of the set it is meant to be wearing.
 *
 * ⚠️ **The roof is `rules.floors`, not the tower's authored height**, so a tower still waiting for
 * its floors while a height bump is in flight gets the ramp its *own* last floor sits at rather than
 * the one the rules' roof would imply. That is the same asymmetry {@link floorKindAt} has, and it
 * costs a short tower a little gear exactly as that one costs it its boss.
 */
export function floorGear(
  rules: TowerRulesData,
  gearRules: GearRulesData,
  floor: number,
): EnemyGearData | undefined {
  const ramp = rules.gear;
  if (ramp === undefined) {
    return undefined;
  }
  const floors = positiveInt(rules.floors, 1);
  const index = Math.min(positiveInt(floor, 1), floors);
  const first = Math.min(positiveInt(ramp.fromFloor, 1), floors);
  if (index < first) {
    return undefined;
  }
  const start = gearLadderPosition(gearRules, ramp.from.grade, ramp.from.level);
  const end = gearLadderPosition(gearRules, ramp.to.grade, ramp.to.level);
  const span = floors - first;
  const position = span <= 0 ? end : start + ((end - start) * (index - first)) / span;
  return gearAtLadderPosition(gearRules, position);
}

/**
 * Whether a floor is ordinary, a mini-boss, or the tower's boss.
 *
 * The campaign's rhythm, reused deliberately: a player who has learnt that every tenth fight is
 * harder should not have to learn a second rhythm. The **last** floor is the boss even when it also
 * lands on the interval.
 */
export function floorKindAt(rules: TowerRulesData, floor: number): StageKind {
  const floors = positiveInt(rules.floors, 1);
  const index = positiveInt(floor, 1);
  if (index >= floors) {
    return 'boss';
  }
  return index % positiveInt(rules.miniBossEvery, 1) === 0 ? 'mini-boss' : 'normal';
}

/** Crystals for clearing `floor`, once. */
export function floorSummons(rules: TowerRulesData, floor: number): number {
  const kind = floorKindAt(rules, floor);
  const summons = rules.floorSummons;
  const base = Number.isFinite(summons.base) ? Math.max(summons.base, 0) : 0;
  const multiplier =
    kind === 'boss'
      ? Math.max(summons.bossMultiplier, 1)
      : kind === 'mini-boss'
        ? Math.max(summons.miniBossMultiplier, 1)
        : 1;
  return Math.round(base * multiplier);
}

/**
 * The campaign stage whose enemies fight at `level`, as a 1-based ladder index.
 *
 * ⚠️ **Matched by enemy level, not by floor number**, and the difference is large: tower floor 100
 * is level 60, where campaign stage 100 is level 85. Paying floor 100 what stage 100 pays would
 * hand over the top of the ladder's lump for a fight two thirds as hard.
 *
 * Matching against the shipped ladder rather than against a second authored curve is what keeps the
 * two in step: retuning the campaign's levels or its reward coefficients carries every tower with
 * it, and there is no tower-side number left to go stale. Both the lump and the gear grade weights
 * are read at this index, so a floor drops what the campaign drops where the fight is the same size.
 *
 * The first stage at or above `level` wins, and the top of the ladder is the fallback — a tower
 * whose floors out-levelled the whole campaign has nothing better to match against.
 */
export function matchedStageIndex(levels: readonly number[], level: number): number {
  if (levels.length === 0) {
    return 1;
  }
  const match = levels.findIndex((stageLevel) => stageLevel >= level);
  return match === -1 ? levels.length : match + 1;
}

/**
 * A floor, resolved into the {@link StageData} the simulation takes.
 *
 * ⚠️ **`rates` is empty and `firstClearSummons` is zero, deliberately.** Both fields exist because
 * `StageData` is one type for every fight in the game, and populating them is how a tower would
 * quietly acquire the two things it must not have: a permanent income raise, and a crystal payout
 * routed through `applyBattleResult`'s campaign path. A tower's crystals are paid by
 * {@link applyTowerResult} against its own progress and nowhere else.
 *
 * `lump` is handed in rather than computed, because matching the campaign's payout means reading
 * the resolved campaign ladder — which is content, and content reaches `core/` as an argument.
 *
 * ⚠️ **`gearRules` is required and never defaulted**, for the reason `resolveStage` and
 * `resolveLadder` take theirs that way: a caller that omitted it would resolve every geared floor as
 * an ungeared one. The boards would field naked bodies at levels tuned for kitted ones, every screen
 * would keep saying the right thing, and only the balance sweep would ever notice. It is required
 * even though most floors are ungeared, precisely so that adding a ramp to a tower cannot silently
 * miss a call site.
 */
export function resolveFloor(
  tower: TowerData,
  rules: TowerRulesData,
  floor: number,
  lump: AuthoredCurrencies,
  gearRules: GearRulesData,
): StageData {
  const index = Math.min(positiveInt(floor, 1), tower.floors.length);
  const encounter = tower.floors[index - 1];
  const gear = floorGear(rules, gearRules, index);
  return {
    ...encounter,
    level: floorLevel(rules, index),
    kind: floorKindAt(rules, index),
    reward: lump,
    rates: {},
    firstClearSummons: 0,
    // Spread rather than assigned, so an ungeared floor carries neither key at all — which is what
    // `toEnemyCombatant` reads to decide a body fights naked, and what keeps the two thousand one
    // hundred floors authored before the ramp existed byte-identical once resolved.
    ...(gear === undefined
      ? {}
      : { gear, enemyGear: enemyGearBonuses(gearRules, gear.grade, gear.level) }),
  };
}

/** Every floor of a tower, resolved in climbing order. */
export function resolveTower(
  tower: TowerData,
  rules: TowerRulesData,
  lumpForLevel: (level: number) => AuthoredCurrencies,
  gearRules: GearRulesData,
): readonly StageData[] {
  return tower.floors.map((_, offset) =>
    resolveFloor(tower, rules, offset + 1, lumpForLevel(floorLevel(rules, offset + 1)), gearRules),
  );
}

/**
 * What a cleared floor drops, as the caller has to describe it.
 *
 * A mirror of `DropAward` on the campaign path, optional for the same reason: the balance sweep
 * folds results into a run without caring about the bag, and a required argument would make it
 * construct drop content it has no use for.
 *
 * `stageIndex` is the **campaign** index this floor matched — see {@link matchedStageIndex} — so a
 * floor drops the grades the campaign drops where the fight is the same size, rather than the
 * grades its own floor number would imply.
 */
export interface TowerDropAward {
  readonly rules: GearRulesData;
  /** The factions a dropped piece may be aligned to. Content, so it arrives as an argument. */
  readonly factions: readonly string[];
  readonly stageIndex: number;
  /**
   * Whole **campaign** chapters the run has cleared, which is what gates an emblem drop.
   *
   * A second campaign-derived fact beside {@link stageIndex}, and it arrives the same way and for
   * the same reason: a tower knows its own floors and nothing about the ladder, and `core/` has no
   * route from one to the other that does not involve handing `applyTowerResult` a `LadderShape`
   * it has no other use for.
   *
   * ⚠️ **The pre-fight count is the correct one here, unlike on the campaign path.** A tower clear
   * may never touch `clearedStages`, so no tower fight can ever change how many chapters have been
   * cleared — the count before and after are the same number, and there is no chapter-boss case to
   * be generous about.
   */
  readonly clearedChapters: number;
  /** The emblem drop table, or absent to drop no emblems. Optional separately from the bundle. */
  readonly emblems?: EmblemDropData;
}

/**
 * The outcome and payout `applyTowerResult` needs, which is all it reads off a `BattleResult`.
 *
 * Structural rather than taking `BattleResult` itself, so a spec can fold an outcome into a run
 * without constructing an event log — the same latitude `applyBattleResult` gets from its optional
 * gear bundle.
 */
export interface TowerBattleOutcome {
  readonly outcome: string;
  readonly reward: { readonly gained: CurrencyAmounts };
}

/**
 * Folds a tower fight back into the run.
 *
 * The counterpart to `applyBattleResult`, and a separate function rather than a branch inside it,
 * because almost nothing the two do is shared. This advances one integer, pays a lump and some
 * crystals, and rolls drops. It does **not** advance the ladder position, does **not** touch
 * `clearedStages`, and does **not** raise a rate — see the note at the top of this file for why
 * each of those would be a bug rather than an omission.
 *
 * - `battleCount` advances win or lose, exactly as the campaign does. It feeds the battle RNG
 *   label, so a retry is a different fight rather than a replay of the same loss.
 * - **A win on a floor already cleared pays nothing.** `floor` is compared against stored progress
 *   rather than trusted, which is the guard `clearedStages` gives the campaign. Nothing in the UI
 *   can reach that state — `nextFloor` never offers a cleared floor — so it is a guard against a
 *   damaged save and a future caller, not against the screen.
 * - Progress only ever rises: `Math.max`, never assignment, so a stale caller cannot walk a run
 *   back down its own tower.
 */
export function applyTowerResult(
  state: GameState,
  tower: TowerData,
  rules: TowerRulesData,
  floor: number,
  result: TowerBattleOutcome,
  drops?: TowerDropAward,
): GameState {
  const advanced: GameState = { ...state, battleCount: state.battleCount + 1 };
  if (result.outcome !== 'victory') {
    return advanced;
  }

  const index = Math.min(positiveInt(floor, 1), tower.floors.length);
  const cleared = clearedFloors(state, tower);
  if (index <= cleared) {
    // A floor already climbed. Nothing is owed and nothing moves but the battle counter, which is
    // the honest record that a fight happened — even one the tower had no reward left for.
    return advanced;
  }

  const summons = floorSummons(rules, index);
  let wallet = credit(advanced.wallet, result.reward.gained);
  if (summons > 0) {
    wallet = credit(wallet, { summons: num(summons) });
  }

  const banked: GameState = {
    ...advanced,
    wallet,
    towers: { ...state.towers, [tower.id]: Math.max(cleared, index) },
  };

  if (drops === undefined) {
    return banked;
  }
  // Rolled from a **derived** stream keyed on the fight that produced them, exactly as the campaign
  // does it and exactly as the battle itself is. The label carries the tower id, so two towers on
  // the same floor at the same battle count are still different draws; `state.battleCount` rather
  // than the advanced one, so a drop belongs to the fight that dropped it.
  const kind = floorKindAt(rules, index);
  const draw = derivedStream(state.rng.seed, `gear:${tower.id}:${index}:${state.battleCount}`);
  const specs = rollDrops(drops.rules, drops.factions, drops.stageIndex, kind, draw);
  const withGear = addGear(banked, specs, drops.rules).state;

  if (drops.emblems === undefined) {
    return withGear;
  }
  // A separate stream from the gear one, for the reason the campaign path uses a separate one: a
  // draw added to the gear sequence re-rolls every historical gear drop for a given seed.
  //
  // The **kind** is the floor's own — a roof is a boss and pays a boss's odds — while the
  // **grades** above are matched by campaign index. That split is not an inconsistency: a grade is
  // a question about how hard the fight was, and an emblem chance is a question about what rank of
  // fight it was. Floor 100 is a roof whether or not it matches a campaign stage two thirds as
  // hard.
  const emblemDraw = derivedStream(
    state.rng.seed,
    `emblem:${tower.id}:${index}:${state.battleCount}`,
  );
  const earned = rollEmblems(drops.emblems, kind, drops.clearedChapters, emblemDraw);
  if (earned <= 0) {
    return withGear;
  }
  return { ...withGear, wallet: credit(withGear.wallet, { emblem: num(earned) }) };
}

/**
 * Decodes tower progress from an untrusted save.
 *
 * **An unknown tower id is kept**, the same call `parseAchievements` makes and for the same reason:
 * one integer is a cheap thing to carry, and dropping it would cost a returning player a hundred
 * floors every time they moved between builds. Nothing reads a key it was not asked for.
 */
export function parseTowers(
  raw: unknown,
  note: (field: string, problem: string, recovered: string) => void,
): TowerProgress {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    if (raw !== undefined) {
      note('towers', `not an object (${JSON.stringify(raw) ?? 'undefined'})`, 'nothing climbed');
    }
    return {};
  }
  const progress: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      note(`towers.${id}`, `unusable (${JSON.stringify(value) ?? 'undefined'})`, '0');
      continue;
    }
    progress[id] = Math.floor(value);
  }
  return progress;
}

/**
 * Floors cleared in one tower, read straight off the progress record.
 *
 * Unclamped, unlike {@link clearedFloors}, because the achievement ledger has no tower to clamp
 * against — a track for a tower this build no longer ships still has to report the number the save
 * carries rather than zero.
 */
export function floorsClearedIn(progress: TowerProgress, towerId: string): number {
  return wholeCount(progress[towerId] ?? 0);
}
