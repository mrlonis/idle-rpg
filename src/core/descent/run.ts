import { type AuthoredCurrencies, type StageData, type StageKind } from '../battle/types';
import { credit, type CurrencyAmounts } from '../currency';
import { addGear } from '../gear/inventory';
import { rollDrops } from '../gear/roll';
import { type GearRulesData } from '../gear/types';
import { num, type Numeric } from '../numeric';
import { derivedStream } from '../rng';
import { type GameState, type PartyFormation } from '../state';
import {
  type DescentEncounterData,
  type DescentFight,
  type DescentRulesData,
  type DescentRun,
  type DescentStatus,
} from './types';

/**
 * The run's lifecycle: what a day draws, what a fight is worth, and what a win leaves behind.
 *
 * ## Three things this file may never touch
 *
 * ⚠️ `clearedStages`, the ladder position, and any idle rate. The same fence `core/towers.ts`
 * stands behind, and for the same arithmetic: the clear count drives the idle crystal rate, and
 * `banners.spec.ts` bounds a fully cleared campaign at about ×3 the base. A daily nine-fight mode
 * feeding that counter would raise a rate every day forever, which is the one shape of compounding
 * this economy has no answer to.
 *
 * `applyDescentResult` is therefore a separate function from `applyBattleResult` rather than a
 * branch inside it — not for tidiness, but so those three fields are **out of reach** rather than
 * merely unwritten.
 *
 * ## The run is only ever written on a victory
 *
 * A defeat costs one life and changes nothing else: not the health, not the energy, not the cards,
 * not the fight index. That is what makes the retry genuinely the same fight from the same state
 * rather than a reconstruction of it, and it is why the run needs no separate "state as it entered
 * this fight" snapshot to roll back to.
 */

function positiveInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 1) : fallback;
}

function wholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

/** How many fights a whole run is. */
export function descentFights(rules: DescentRulesData): number {
  return positiveInt(rules.floors, 1) * positiveInt(rules.fightsPerFloor, 1);
}

/**
 * How many cards a run hands out.
 *
 * One fewer than the fights: a card is taken *between* fights, and one offered after the last one
 * would be a choice with nothing to spend it on. That is also why {@link choiceProgress} saturates
 * on the eighth of nine rather than on the ninth.
 */
export function descentChoices(rules: DescentRulesData): number {
  return Math.max(descentFights(rules) - 1, 0);
}

/**
 * Where a fight sits: its floor, its step within that floor, and what kind of fight it is.
 *
 * ⚠️ **The kind is a rule over the slot, never a property of the board**, which is the same call
 * `stageKindAt` makes for a chapter and `floorKindAt` makes for a tower. The last fight of the run
 * is the boss even though it is also the last fight of its floor — a guardian that happened to land
 * last would otherwise pay a guardian's multiplier for the hardest fight in the mode.
 */
export function descentFightAt(rules: DescentRulesData, index: number): DescentFight {
  const perFloor = positiveInt(rules.fightsPerFloor, 1);
  const fights = descentFights(rules);
  const at = Math.min(positiveInt(index, 1), fights);
  const floor = Math.floor((at - 1) / perFloor) + 1;
  const step = ((at - 1) % perFloor) + 1;
  const kind: StageKind = at >= fights ? 'boss' : step === perFloor ? 'mini-boss' : 'normal';
  return { index: at, floor, step, kind };
}

/**
 * The level the enemies on `fight` stand at, read off the campaign this run has already beaten.
 *
 * `anchor` is the enemy level of the hardest campaign stage cleared — content, so it arrives as an
 * argument like everything else. The share runs from {@link DescentLevelData.baseShare} on the
 * first fight to `topShare` on the last, linearly.
 *
 * ⚠️ **This is the whole reason twenty-four authored boards stay a fight forever.** A tower's level
 * line is fixed and its roof is a snapshot of one moment in the campaign's growth; this one moves
 * with the run, so the mode neither decays into an empty square nor becomes unenterable when a
 * chapter ships. What it costs is that the sweep has to check the mode at several depths rather
 * than once — see `data/descent.balance.ts`.
 */
export function descentLevel(rules: DescentRulesData, anchor: number, fight: number): number {
  const fights = descentFights(rules);
  const at = Math.min(positiveInt(fight, 1), fights);
  const base = Number.isFinite(rules.level.baseOffset) ? rules.level.baseOffset : 0;
  const top = Number.isFinite(rules.level.topOffset) ? rules.level.topOffset : base;
  const progress = fights <= 1 ? 1 : (at - 1) / (fights - 1);
  // ⚠️ Added, not multiplied. See {@link DescentLevelData}: enemy power is exponential in level, so
  // a *share* of the anchor is a different difficulty at every depth and a fixed number of levels is
  // the same one everywhere.
  const level = positiveInt(anchor, 1) + (base + (top - base) * progress);
  return Math.max(Math.round(level), 1);
}

/**
 * The factions today's run admits.
 *
 * ⚠️ **Three of seven, drawn from the seed and the day and nothing else.** Weighting the draw
 * toward what a run owns was considered and is wrong: the roster changes during a day, so a
 * roster-dependent lock could move under a player mid-run — a crew legal at breakfast and illegal
 * at lunch, for reasons nothing on screen could explain. A pure function of the day cannot do that.
 *
 * Shuffled over the **whole** faction list and then sorted back into authored order, which is the
 * discipline `dailyBoard` states: the shuffle decides *which*, and the content decides how they
 * read, so the row order on screen never depends on a draw.
 *
 * ⚠️ **A lock this build cannot fill is a weaker crew, never a locked door.** A short party is a
 * legal party — `simulateBattle` reads only an *empty* one as an immediate defeat — so a run whose
 * three factions are thin fights shorthanded rather than being refused. That is the line milestone
 * 4 drew when it rejected role-locked formation slots: content may be hard to bring a good answer
 * to, and may never reach a state where no answer exists.
 */
export function dailyDescentFactions(
  rules: DescentRulesData,
  factions: readonly string[],
  seed: number,
  day: number,
): readonly string[] {
  const size = Math.min(wholeCount(rules.lockFactions), factions.length);
  if (size === 0 || factions.length === 0) {
    return [];
  }
  const chosen = new Set(
    shuffled(factions, seed, `descent:lock:${wholeCount(day)}`).slice(0, size),
  );
  return factions.filter((faction) => chosen.has(faction));
}

/**
 * The boards today's run fights, in order.
 *
 * Each floor draws its ordinary fights and then its guardian, each without replacement inside its
 * own group. Drawing per group rather than over the whole pool is what keeps a floor-3 guardian off
 * floor 1: a board is authored for a position in the run's arc, and the draw decides which of the
 * candidates for that position turns up.
 *
 * A group with fewer boards than the slots it owes yields fewer fights, which a shipped pool cannot
 * do — `descent.spec.ts` holds every group deep enough. The guard is against a build that ships one
 * board, not against play.
 */
export function descentBoards(
  rules: DescentRulesData,
  pool: readonly DescentEncounterData[],
  seed: number,
  day: number,
): readonly DescentEncounterData[] {
  const floors = positiveInt(rules.floors, 1);
  const perFloor = positiveInt(rules.fightsPerFloor, 1);
  const label = `descent:boards:${wholeCount(day)}`;
  const boards: DescentEncounterData[] = [];

  for (let floor = 1; floor <= floors; floor++) {
    const ordinary = pool.filter((board) => board.floor === floor && !board.guardian);
    const guardians = pool.filter((board) => board.floor === floor && board.guardian);
    boards.push(...shuffled(ordinary, seed, `${label}:${floor}:ordinary`).slice(0, perFloor - 1));
    boards.push(...shuffled(guardians, seed, `${label}:${floor}:guardian`).slice(0, 1));
  }
  return boards;
}

/**
 * A Fisher–Yates shuffle of `items` under a labelled sub-stream.
 *
 * One stream per group rather than one for the whole draw, so adding a board to floor 2 cannot
 * change what floor 1 drew. That is the same property `dayOrder` protects by shuffling before
 * filtering: content growing must only ever *insert*, never reshuffle what a player already knows.
 */
function shuffled<T>(items: readonly T[], seed: number, label: string): readonly T[] {
  const draw = derivedStream(seed, label);
  const order = [...items];
  for (let index = order.length - 1; index > 0; index--) {
    const pick = Math.min(Math.floor(draw() * (index + 1)), index);
    [order[index], order[pick]] = [order[pick], order[index]];
  }
  return order;
}

/**
 * What a cleared fight's lump is, given the campaign lump for the level it was fought at.
 *
 * The multipliers live here rather than at the call site so that "a Descent fight pays four times
 * the essence" is one statement in `data/` read in one place, rather than a factor a second caller
 * could forget. Absent currencies stay absent — a campaign lump that rounded essence away has none
 * to multiply.
 */
export function descentLump(rules: DescentRulesData, base: AuthoredCurrencies): AuthoredCurrencies {
  const scale = (raw: number | string | undefined, factor: number): number | undefined => {
    if (raw === undefined) {
      return undefined;
    }
    const value = num(raw).mul(Math.max(Number.isFinite(factor) ? factor : 1, 0));
    const rounded = Math.round(value.toNumber());
    return Number.isFinite(rounded) && rounded > 0 ? rounded : undefined;
  };
  const gold = scale(base.gold, rules.lumpMultipliers.gold);
  const xp = scale(base.xp, rules.lumpMultipliers.xp);
  const essence = scale(base.essence, rules.lumpMultipliers.essence);
  return {
    ...(gold === undefined ? {} : { gold }),
    ...(xp === undefined ? {} : { xp }),
    ...(essence === undefined ? {} : { essence }),
  };
}

/**
 * A board, resolved into the {@link StageData} the simulation takes.
 *
 * ⚠️ **`rates` is empty and `firstClearSummons` is zero, deliberately** — the same two fields
 * `resolveFloor` leaves empty and for the same reason. They exist because `StageData` is one type
 * for every fight in the game, and filling either is how this mode would quietly acquire a
 * permanent income raise or a crystal payout routed through the campaign's own path. The Descent's
 * crystals are paid by {@link applyDescentResult} and nowhere else.
 *
 * The board's `floor` and `guardian` are deliberately **not** carried through: what kind of fight
 * this is comes from the slot it was drawn into, not from the board.
 */
export function resolveDescentFight(
  rules: DescentRulesData,
  board: DescentEncounterData,
  fight: number,
  anchor: number,
  lump: AuthoredCurrencies,
): StageData {
  return {
    id: board.id,
    name: board.name,
    enemies: board.enemies,
    level: descentLevel(rules, anchor, fight),
    kind: descentFightAt(rules, fight).kind,
    reward: lump,
    rates: {},
    firstClearSummons: 0,
  };
}

/** Crystals for clearing one fight of a run. */
export function descentFightSummons(rules: DescentRulesData, fight: number): number {
  const { kind } = descentFightAt(rules, fight);
  const summons = rules.summons;
  const base = Number.isFinite(summons.perFight) ? Math.max(summons.perFight, 0) : 0;
  const multiplier =
    kind === 'boss'
      ? Math.max(summons.bossMultiplier, 1)
      : kind === 'mini-boss'
        ? Math.max(summons.guardianMultiplier, 1)
        : 1;
  return Math.round(base * multiplier);
}

/** Whether the campaign has come far enough to open the Descent at all. */
export function isDescentUnlocked(rules: DescentRulesData, chaptersCleared: number): boolean {
  return wholeCount(chaptersCleared) >= wholeCount(rules.unlockChapters);
}

/**
 * The run belonging to `day`, or `null`.
 *
 * ⚠️ **This one comparison is the entire daily reset.** A stored run whose day is behind today's is
 * not today's run, so it neither continues nor blocks a fresh one — no roll pass, no expiry flag,
 * nothing to reconcile, and nothing owed for abandoning it because a run banks fight by fight.
 * `rollQuestWindows` needs a pass because a window carries a *baseline* that has to be re-taken;
 * this carries nothing that outlives its day.
 */
export function descentRunFor(state: GameState, day: number): DescentRun | null {
  const run = state.descent;
  return run !== null && run.day === wholeCount(day) ? run : null;
}

/** Whether a fresh run may be started today. */
export function canStartDescent(
  state: GameState,
  rules: DescentRulesData,
  chaptersCleared: number,
  day: number,
): boolean {
  return isDescentUnlocked(rules, chaptersCleared) && descentRunFor(state, day) === null;
}

/** How many cards the run is owed before its next fight may start. */
export function descentCardsOwed(rules: DescentRulesData, run: DescentRun): number {
  const earned = Math.min(wholeCount(run.cleared), descentChoices(rules));
  return Math.max(earned - run.cards.length, 0);
}

/** Where a run stands. */
export function descentStatus(rules: DescentRulesData, run: DescentRun): DescentStatus {
  if (wholeCount(run.cleared) >= descentFights(rules)) {
    return 'complete';
  }
  if (wholeCount(run.lives) <= 0) {
    return 'ended';
  }
  return descentCardsOwed(rules, run) > 0 ? 'choosing' : 'ready';
}

/** The fight a run enters next, or `null` when it has none left to fight. */
export function nextDescentFight(rules: DescentRulesData, run: DescentRun): number | null {
  return descentStatus(rules, run) === 'ready' ? wholeCount(run.cleared) + 1 : null;
}

/**
 * Opens a run for `day` with `party` standing in it.
 *
 * The crew is copied rather than referenced — see {@link DescentRun.party}. It is **not** checked
 * against the day's faction lock here: that is content, and the same division `core/activity.ts`
 * makes for a tower's lock, enforced by the caller that knows what a faction is.
 */
export function startDescent(
  state: GameState,
  rules: DescentRulesData,
  day: number,
  party: PartyFormation,
): GameState {
  return {
    ...state,
    descent: {
      day: wholeCount(day),
      cleared: 0,
      party: { front: [...party.front], back: [...party.back] },
      health: {},
      energy: {},
      cards: [],
      lives: positiveInt(rules.lives, 1),
    },
  };
}

/**
 * Takes one card into the run.
 *
 * ⚠️ **Only when one is owed**, which is what stops a caller from banking eight cards off one win.
 * The card id is not validated against the pool here — `core/` cannot see the families — so an id
 * naming nothing is stored and simply pays nothing when `descentCards` fails to resolve it. That is
 * the same posture the roster takes toward a character id a later build drops, and it is why the
 * offer is derived: the only way to reach this with an id that was never offered is to edit the
 * save, which this project does not defend against.
 *
 * Returns the same state when nothing was owed, so callers can tell a real change from a no-op.
 */
export function takeDescentCard(
  state: GameState,
  rules: DescentRulesData,
  day: number,
  cardId: string,
): GameState {
  const run = descentRunFor(state, day);
  if (run === null || descentCardsOwed(rules, run) <= 0 || cardId === '') {
    return state;
  }
  return { ...state, descent: { ...run, cards: [...run.cards, cardId] } };
}

/** One ally's standing at the end of a fight, which is all the run reads off a result. */
export interface DescentStanding {
  readonly side: string;
  readonly defId: string;
  readonly hp: Numeric;
  readonly maxHp: Numeric;
  readonly energy: number;
}

/**
 * The outcome and payout `applyDescentResult` needs, which is all it reads off a `BattleResult`.
 *
 * Structural rather than taking `BattleResult` itself, so a spec or a balance sweep can fold an
 * outcome into a run without constructing an event log — the same latitude
 * {@link TowerBattleOutcome} gets.
 */
export interface DescentBattleOutcome {
  readonly outcome: string;
  readonly reward: { readonly gained: CurrencyAmounts };
  /** Both sides' final standings. Only the allies are read. */
  readonly final: readonly DescentStanding[];
}

/**
 * What a cleared fight drops, as the caller has to describe it.
 *
 * A mirror of {@link TowerDropAward}, optional for the same reason, and **without the emblem
 * table**: the Descent pays its emblems once on completion rather than per fight, so a per-fight
 * emblem roll would be a second faucet on the same currency with nothing on screen to say which
 * one paid.
 */
export interface DescentDropAward {
  readonly rules: GearRulesData;
  readonly factions: readonly string[];
  /** The **campaign** index this fight's level matched — see `matchedStageIndex`. */
  readonly stageIndex: number;
}

/**
 * Folds a Descent fight back into the run.
 *
 * - `battleCount` advances win or lose, exactly as the campaign and the towers do. It feeds the
 *   battle RNG label, so a retry is a different draw rather than a replay of the loss.
 * - **A defeat costs one life and writes nothing else.** See the note at the top of this file.
 * - **A win banks the fight**: the survivors' health and energy, the crew minus the fallen, the
 *   crystals, the lump and the gear.
 * - **Finishing pays the completion bonus and advances `descentRuns`**, which is the only mark a
 *   run leaves on the save once its day has passed.
 *
 * `fight` is compared against the run's own progress rather than trusted, which is the guard
 * `applyTowerResult` gives a floor: nothing in the UI can reach a mismatch, so it is a guard
 * against a damaged save and a future caller.
 */
export function applyDescentResult(
  state: GameState,
  rules: DescentRulesData,
  day: number,
  fight: number,
  result: DescentBattleOutcome,
  drops?: DescentDropAward,
): GameState {
  const advanced: GameState = { ...state, battleCount: state.battleCount + 1 };
  const run = descentRunFor(state, day);
  if (run === null || nextDescentFight(rules, run) !== Math.floor(fight)) {
    return advanced;
  }

  if (result.outcome !== 'victory') {
    return { ...advanced, descent: { ...run, lives: Math.max(wholeCount(run.lives) - 1, 0) } };
  }

  const health: Record<string, number> = {};
  const energy: Record<string, number> = {};
  const standing = new Set<string>();
  for (const fighter of result.final) {
    if (fighter.side !== 'ally' || fighter.hp.lte(0) || fighter.maxHp.lte(0)) {
      continue;
    }
    standing.add(fighter.defId);
    // A fraction rather than a quantity, and clamped into `(0, 1]`: a maximum can move between two
    // fights of one run — a level, a rung, a resonance floor, a gear swap — and only a share
    // survives that without reading as a wound nobody administered.
    const share = fighter.hp.div(fighter.maxHp).toNumber();
    health[fighter.defId] = Number.isFinite(share) ? Math.min(Math.max(share, 0), 1) : 1;
    energy[fighter.defId] = Number.isFinite(fighter.energy) ? Math.max(fighter.energy, 0) : 0;
  }

  const cleared = wholeCount(run.cleared) + 1;
  const finished = cleared >= descentFights(rules);
  const summons =
    descentFightSummons(rules, fight) +
    (finished ? Math.max(wholeCount(rules.summons.completion), 0) : 0);
  const emblems = finished ? Math.max(wholeCount(rules.completionEmblems), 0) : 0;

  let wallet = credit(advanced.wallet, result.reward.gained);
  if (summons > 0) {
    wallet = credit(wallet, { summons: num(summons) });
  }
  if (emblems > 0) {
    wallet = credit(wallet, { emblem: num(emblems) });
  }

  const banked: GameState = {
    ...advanced,
    wallet,
    descentRuns: finished ? wholeCount(state.descentRuns) + 1 : state.descentRuns,
    descent: {
      ...run,
      cleared,
      // ⚠️ The fallen leave the crew as well as the health table. Either alone would be a body on
      // the board at zero health, which every targeting rule would then have to step around — and
      // which would go on paying the lineup bonus for a fighter who is not fighting.
      party: {
        front: run.party.front.filter((defId) => standing.has(defId)),
        back: run.party.back.filter((defId) => standing.has(defId)),
      },
      health,
      energy,
    },
  };

  if (drops === undefined) {
    return banked;
  }
  // A derived stream keyed on the fight that produced them, exactly as the campaign and the towers
  // do it. `state.battleCount` rather than the advanced one, so a drop belongs to the fight that
  // dropped it; the day is in the label so two runs on the same fight index are different draws.
  const draw = derivedStream(
    state.rng.seed,
    `gear:descent:${run.day}:${fight}:${state.battleCount}`,
  );
  const kind = descentFightAt(rules, fight).kind;
  const specs = rollDrops(drops.rules, drops.factions, drops.stageIndex, kind, draw);
  return addGear(banked, specs, drops.rules).state;
}

/** How a run reads back off an untrusted save. */
type Note = (field: string, problem: string, recovered: string) => void;

/**
 * Decodes the run in flight.
 *
 * ⚠️ **Everything degrades to `null`, and that is the safe direction here in a way it is not
 * elsewhere.** A damaged run costs the player one day of optional content; a half-repaired one
 * could carry a crew that no longer matches its health table, which is a fight that opens with
 * somebody at full health who should not be. There is nothing to salvage that is worth the risk of
 * salvaging it wrongly.
 */
export function parseDescent(raw: unknown, note: Note): DescentRun | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    note('descent', `not an object (${JSON.stringify(raw) ?? 'undefined'})`, 'no run in flight');
    return null;
  }
  const record = raw as Record<string, unknown>;
  const day = record['day'];
  const cleared = record['cleared'];
  const lives = record['lives'];
  if (
    typeof day !== 'number' ||
    !Number.isInteger(day) ||
    day < 0 ||
    typeof cleared !== 'number' ||
    !Number.isInteger(cleared) ||
    cleared < 0 ||
    typeof lives !== 'number' ||
    !Number.isInteger(lives) ||
    lives < 0
  ) {
    note('descent', 'day, cleared or lives is unusable', 'no run in flight');
    return null;
  }

  const party = record['party'];
  const partyRecord =
    typeof party === 'object' && party !== null ? (party as Record<string, unknown>) : {};
  const rank = (row: 'front' | 'back'): string[] => {
    const value = partyRecord[row];
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  };

  const shares = (key: 'health' | 'energy', max: number): Record<string, number> => {
    const value = record[key];
    const out: Record<string, number> = {};
    if (typeof value !== 'object' || value === null) {
      return out;
    }
    for (const [defId, amount] of Object.entries(value as Record<string, unknown>)) {
      if (typeof amount === 'number' && Number.isFinite(amount) && amount >= 0) {
        out[defId] = Math.min(amount, max);
      } else {
        note(`descent.${key}.${defId}`, 'unusable', 'dropped');
      }
    }
    return out;
  };

  const cards = record['cards'];
  return {
    day,
    cleared,
    party: { front: rank('front'), back: rank('back') },
    health: shares('health', 1),
    // Clamped against the bar's own maximum by `clampEnergy` on the way into a fight; the ceiling
    // here is only so a hand-edited save cannot carry an absurd number into the repair report.
    energy: shares('energy', Number.MAX_SAFE_INTEGER),
    cards: Array.isArray(cards) ? cards.filter((id): id is string => typeof id === 'string') : [],
    lives,
  };
}

/** Encodes the run in flight as plain JSON, or `null` when there is none. */
export function serializeDescent(run: DescentRun | null): {
  day: number;
  cleared: number;
  party: { front: string[]; back: string[] };
  health: Record<string, number>;
  energy: Record<string, number>;
  cards: string[];
  lives: number;
} | null {
  if (run === null) {
    return null;
  }
  return {
    day: run.day,
    cleared: run.cleared,
    party: { front: [...run.party.front], back: [...run.party.back] },
    health: { ...run.health },
    energy: { ...run.energy },
    cards: [...run.cards],
    lives: run.lives,
  };
}
