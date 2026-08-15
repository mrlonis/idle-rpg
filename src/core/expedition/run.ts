import { type AuthoredCurrencies, type StageData } from '../battle/types';
import { credit, type CurrencyAmounts, type CurrencyId } from '../currency';
import {
  carriedStandings,
  type DescentBattleOutcome,
  type DescentDropAward,
  descentLump,
} from '../descent/run';
import { addGear } from '../gear/inventory';
import { rollDrops } from '../gear/roll';
import { num, type Numeric } from '../numeric';
import { derivedStream } from '../rng';
import { type GameState, type PartyFormation } from '../state';
import { adjacentCamps, exitReachable, parseExpeditionGrid, reachableChests } from './map';
import {
  EMPTY_EXPEDITION_RECORD,
  type ExpeditionCampData,
  type ExpeditionChestContents,
  type ExpeditionMapData,
  type ExpeditionRecord,
  type ExpeditionRulesData,
  type ExpeditionRun,
  type ExpeditionStatus,
} from './types';

/**
 * The attempt's lifecycle: starting, fighting, collecting, completing, walking away.
 *
 * ## Three things this file may never touch
 *
 * ⚠️ `clearedStages`, the ladder position, and any idle rate — the fence `core/towers.ts` and
 * `core/descent/run.ts` stand behind, for the same arithmetic. {@link applyExpeditionResult} is a
 * separate function from `applyBattleResult` so those fields are out of reach rather than merely
 * unwritten.
 *
 * ## Everything pays once, ever
 *
 * The permanent ledger in {@link GameState.expeditions} is consulted before anything is credited: a
 * camp's lump, crystals and gear on its first-ever clear; a chest's contents the first time it is
 * reached; the completion bonus the first time the exit is walked. A later attempt re-fights the
 * same camps — they still block, they still cost stamina — and is paid nothing for them. That is
 * what makes the free restart safe in both directions: nothing pays twice, and nothing is lost.
 *
 * ## The attempt is only ever written on a victory
 *
 * The Descent's rule, kept exactly: a defeat advances `battleCount` (so the retry is a fresh draw
 * rather than a replay) and changes nothing else. There is no life counter to spend, because a
 * one-time mode needs no daily cap on persistence — the ledger already caps what persistence can
 * earn.
 */

function wholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

/** The outcome and payout {@link applyExpeditionResult} reads — structurally the Descent's. */
export type ExpeditionBattleOutcome = DescentBattleOutcome;

/** The gear bundle a first-ever camp clear rolls — structurally the Descent's. */
export type ExpeditionDropAward = DescentDropAward;

/** The stage id a camp fights under. What `BattleService.settle` keys the payout path on. */
export function expeditionStageId(mapId: string, cell: string): string {
  return `expedition:${mapId}:${cell}`;
}

/** The attempt in flight, or `null`. There is at most one, across all maps. */
export function expeditionRunFor(state: GameState): ExpeditionRun | null {
  return state.expedition;
}

/** What `mapId` remembers forever. A map never attempted reads as the empty record. */
export function expeditionRecordFor(state: GameState, mapId: string): ExpeditionRecord {
  return state.expeditions[mapId] ?? EMPTY_EXPEDITION_RECORD;
}

/** How many maps have ever been completed. Derived — there is no stored counter to disagree with. */
export function expeditionsCompleted(state: GameState): number {
  return Object.values(state.expeditions).filter((record) => record.completed).length;
}

/** Whether the campaign has come far enough to open Expeditions at all. */
export function isExpeditionUnlocked(rules: ExpeditionRulesData, chaptersCleared: number): boolean {
  return wholeCount(chaptersCleared) >= wholeCount(rules.unlockChapters);
}

/**
 * Whether `mapId` may be entered: the first map is open with the mode, and each later map opens
 * when the one before it has been completed.
 *
 * Sequential by **authored order**, which is what gives three maps an arc without an authored
 * unlock field that could disagree with the order they are listed in.
 */
export function expeditionMapOpen(
  maps: readonly ExpeditionMapData[],
  state: GameState,
  mapId: string,
): boolean {
  const index = maps.findIndex((map) => map.id === mapId);
  if (index < 0) {
    return false;
  }
  return index === 0 || expeditionRecordFor(state, maps[index - 1].id).completed;
}

/** The camps this attempt has beaten, as a set. */
export function expeditionCleared(run: ExpeditionRun): ReadonlySet<string> {
  return new Set(run.camps);
}

/** Stamina this attempt has spent: the sum of its cleared camps' costs. Derived, never stored. */
export function expeditionStaminaSpent(map: ExpeditionMapData, run: ExpeditionRun): number {
  let spent = 0;
  for (const cell of run.camps) {
    const camp = map.camps.find((entry) => entry.cell === cell);
    if (camp !== undefined && Number.isFinite(camp.stamina)) {
      spent += Math.max(camp.stamina, 0);
    }
  }
  return spent;
}

/** Stamina this attempt still holds. */
export function expeditionStaminaLeft(map: ExpeditionMapData, run: ExpeditionRun): number {
  const budget = Number.isFinite(map.stamina) ? Math.max(map.stamina, 0) : 0;
  return Math.max(budget - expeditionStaminaSpent(map, run), 0);
}

/**
 * The camps that may be fought right now: standing, adjacent to the reachable region, **and**
 * affordable.
 *
 * The geometry comes from `map.ts` and the budget bites here — the same division the file comment
 * there names. Returned as data rows rather than cells because every caller immediately wants the
 * cost and the board.
 */
export function fightableExpeditionCamps(
  map: ExpeditionMapData,
  run: ExpeditionRun,
): readonly ExpeditionCampData[] {
  const grid = parseExpeditionGrid(map);
  const beside = adjacentCamps(grid, expeditionCleared(run));
  const left = expeditionStaminaLeft(map, run);
  return map.camps.filter((camp) => beside.has(camp.cell) && camp.stamina <= left);
}

/** How many cards the attempt is owed. Zero or one in play: one is owed after every win. */
export function expeditionCardsOwed(run: ExpeditionRun): number {
  return Math.max(run.camps.length - run.cards.length, 0);
}

/**
 * Where the attempt stands.
 *
 * ⚠️ **A card is only owed while a fight remains possible.** After the last affordable camp falls,
 * the offer would be a choice with nothing to spend it on — the same reasoning that makes the
 * Descent's choices one fewer than its fights, arrived at by rule here because an attempt's fight
 * count is the player's route rather than a constant.
 */
export function expeditionStatus(map: ExpeditionMapData, run: ExpeditionRun): ExpeditionStatus {
  if (fightableExpeditionCamps(map, run).length === 0) {
    return 'spent';
  }
  return expeditionCardsOwed(run) > 0 ? 'choosing' : 'ready';
}

/** Whether the exit is open — independent of the fight loop, deliberately. */
export function expeditionExitOpen(map: ExpeditionMapData, run: ExpeditionRun): boolean {
  return exitReachable(parseExpeditionGrid(map), expeditionCleared(run));
}

/**
 * The camp `cell` names if it may be fought right now, or `null`.
 *
 * `null` while a card is owed, for a camp already down, one out of reach, or one over budget —
 * every one of those is a screen's business, and every one means the same thing here: nothing to
 * fight.
 */
export function nextExpeditionCamp(
  map: ExpeditionMapData,
  run: ExpeditionRun,
  cell: string,
): ExpeditionCampData | null {
  if (expeditionCardsOwed(run) > 0) {
    return null;
  }
  return fightableExpeditionCamps(map, run).find((camp) => camp.cell === cell) ?? null;
}

/**
 * The level `camp` fights at against `anchor` — a fixed offset along the curve, floored at 1.
 *
 * ⚠️ **The anchor is clamped by {@link ExpeditionRulesData.anchorCap} before the offset is applied**,
 * which is what stops the mode's difficulty running away from its own player: the anchor stands in
 * for how strong the party is, and the two stopped moving together once the campaign began running
 * above the level cap of the rung it is tuned for. An absent or non-finite cap leaves the anchor
 * alone, so a rules object without one reproduces the old line exactly.
 */
export function expeditionLevel(
  rules: ExpeditionRulesData,
  anchor: number,
  camp: ExpeditionCampData,
): number {
  const offset = Number.isFinite(camp.levelOffset) ? camp.levelOffset : 0;
  const cap = rules.anchorCap;
  const raw = Math.max(anchor, 1);
  const capped = Number.isFinite(cap) ? Math.min(raw, Math.max(cap, 1)) : raw;
  return Math.max(Math.round(capped + offset), 1);
}

/**
 * A camp, resolved into the {@link StageData} the simulation takes.
 *
 * `rates` empty and `firstClearSummons` zero for the reason `resolveDescentFight` leaves them so:
 * filling either is how this mode would quietly acquire a permanent income raise or a crystal
 * payout routed through the campaign's own path. Expeditions' crystals are paid by
 * {@link applyExpeditionResult} and nowhere else.
 */
export function resolveExpeditionCamp(
  rules: ExpeditionRulesData,
  map: ExpeditionMapData,
  camp: ExpeditionCampData,
  anchor: number,
  lump: AuthoredCurrencies,
): StageData {
  return {
    id: expeditionStageId(map.id, camp.cell),
    name: camp.name,
    enemies: camp.enemies,
    level: expeditionLevel(rules, anchor, camp),
    kind: camp.boss ? 'boss' : 'normal',
    reward: lump,
    rates: {},
    firstClearSummons: 0,
  };
}

/** What a camp's lump is, given the matched campaign lump — the Descent's own arithmetic. */
export function expeditionLump(
  rules: ExpeditionRulesData,
  base: AuthoredCurrencies,
): AuthoredCurrencies {
  return descentLump(rules, base);
}

/** Crystals a camp's first-ever clear pays. */
export function expeditionCampSummons(
  rules: ExpeditionRulesData,
  camp: ExpeditionCampData,
): number {
  const base = Number.isFinite(rules.summons.perCamp) ? Math.max(rules.summons.perCamp, 0) : 0;
  return Math.round(base * (camp.boss ? Math.max(rules.summons.bossMultiplier, 1) : 1));
}

/** What one chest pays, given the matched campaign lump for its multiplied half. */
export function expeditionChestPayout(
  contents: ExpeditionChestContents,
  base: AuthoredCurrencies,
): CurrencyAmounts {
  const payout: Partial<Record<CurrencyId, Numeric>> = {};
  const flat = (value: number | undefined): number =>
    value !== undefined && Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
  if (flat(contents.summons) > 0) {
    payout.summons = num(flat(contents.summons));
  }
  if (flat(contents.emblems) > 0) {
    payout.emblem = num(flat(contents.emblems));
  }
  for (const [currency, raw, factor] of [
    ['gold', base.gold, contents.gold],
    ['xp', base.xp, contents.xp],
    ['essence', base.essence, contents.essence],
  ] as const) {
    if (raw === undefined || factor === undefined || !Number.isFinite(factor) || factor <= 0) {
      continue;
    }
    const value = num(raw).mul(factor);
    if (value.gt(0)) {
      payout[currency] = value;
    }
  }
  return payout;
}

/**
 * Credits every chest the region has grown over that has never paid, and records it.
 *
 * Shared by {@link startExpedition} (a chest authored in the open pays the moment the attempt
 * begins) and {@link applyExpeditionResult} (a win grows the region). The ledger, not the attempt,
 * is what gates the pay — a chest re-reached on a later attempt is scenery.
 */
function collectChests(
  wallet: GameState['wallet'],
  record: ExpeditionRecord,
  map: ExpeditionMapData,
  cleared: ReadonlySet<string>,
  chestBase: AuthoredCurrencies,
): { readonly wallet: GameState['wallet']; readonly record: ExpeditionRecord } {
  const inside = reachableChests(parseExpeditionGrid(map), cleared);
  const paid = new Set(record.chests);
  let credited = wallet;
  const collected: string[] = [];
  for (const chest of map.chests) {
    if (!inside.has(chest.cell) || paid.has(chest.cell)) {
      continue;
    }
    credited = credit(credited, expeditionChestPayout(chest.contents, chestBase));
    collected.push(chest.cell);
  }
  return collected.length === 0
    ? { wallet: credited, record }
    : { wallet: credited, record: { ...record, chests: [...record.chests, ...collected] } };
}

/**
 * Opens an attempt on `map` with `party` standing in it.
 *
 * Replaces whatever attempt was in flight — on this map or another — because there is one
 * {@link GameState.expedition} slot and walking away costs nothing that was not already banked.
 * The crew is copied rather than referenced, for the Descent's reason. Unlock and map order are
 * **not** checked here: those are content questions the caller that can see `data/` answers, the
 * same division `startDescent` draws around the faction lock.
 *
 * `chestBase` settles any chest authored inside the starting region on the spot — a teaching map's
 * free chest pays before the first fight, once, ever.
 */
export function startExpedition(
  state: GameState,
  map: ExpeditionMapData,
  party: PartyFormation,
  chestBase: AuthoredCurrencies,
): GameState {
  const record = expeditionRecordFor(state, map.id);
  const attempt = wholeCount(record.attempts) + 1;
  const opened = collectChests(
    state.wallet,
    { ...record, attempts: attempt },
    map,
    new Set(),
    chestBase,
  );
  return {
    ...state,
    wallet: opened.wallet,
    expeditions: { ...state.expeditions, [map.id]: opened.record },
    expedition: {
      mapId: map.id,
      attempt,
      party: { front: [...party.front], back: [...party.back] },
      health: {},
      energy: {},
      cards: [],
      camps: [],
    },
  };
}

/**
 * Takes one card into the attempt.
 *
 * Only while one is owed **and** a fight remains to spend it on — see {@link expeditionStatus}.
 * The id is not validated against the pool here, for `takeDescentCard`'s reason: an id naming
 * nothing is stored and pays nothing.
 */
export function takeExpeditionCard(
  state: GameState,
  map: ExpeditionMapData,
  cardId: string,
): GameState {
  const run = state.expedition;
  if (run === null) {
    return state;
  }
  if (run.mapId !== map.id || cardId === '' || expeditionStatus(map, run) !== 'choosing') {
    return state;
  }
  return { ...state, expedition: { ...run, cards: [...run.cards, cardId] } };
}

/**
 * Folds a finished camp fight back into the attempt.
 *
 * - `battleCount` advances win or lose, so a retry is a different draw rather than a replay.
 * - **A defeat writes nothing else.** No life spent, no stamina spent, no ledger touched.
 * - **A win banks the fight**: the survivors, the camp onto the attempt's list — and, first time
 *   ever only, the lump, the crystals, the gear, and any chests the region grew over.
 *
 * `cell` is validated against the attempt's own state rather than trusted, the same guard the
 * Descent's fight index gets: nothing in the UI can reach a mismatch, so it guards a damaged save
 * and a future caller.
 */
export function applyExpeditionResult(
  state: GameState,
  rules: ExpeditionRulesData,
  map: ExpeditionMapData,
  cell: string,
  result: ExpeditionBattleOutcome,
  chestBase: AuthoredCurrencies,
  drops?: ExpeditionDropAward,
): GameState {
  const advanced: GameState = { ...state, battleCount: state.battleCount + 1 };
  const run = state.expedition;
  if (run === null) {
    return advanced;
  }
  if (run.mapId !== map.id) {
    return advanced;
  }
  const camp = nextExpeditionCamp(map, run, cell);
  if (camp === null) {
    return advanced;
  }

  if (result.outcome !== 'victory') {
    return advanced;
  }

  const { standing, health, energy } = carriedStandings(result.final);
  const camps = [...run.camps, cell];
  const cleared = new Set(camps);
  const record = expeditionRecordFor(state, map.id);
  const firstClear = !record.camps.includes(cell);

  let wallet = advanced.wallet;
  let updated = record;
  if (firstClear) {
    wallet = credit(wallet, result.reward.gained);
    const summons = expeditionCampSummons(rules, camp);
    if (summons > 0) {
      wallet = credit(wallet, { summons: num(summons) });
    }
    updated = { ...updated, camps: [...updated.camps, cell] };
  }
  const swept = collectChests(wallet, updated, map, cleared, chestBase);
  wallet = swept.wallet;
  updated = swept.record;

  const banked: GameState = {
    ...advanced,
    wallet,
    expeditions: { ...advanced.expeditions, [map.id]: updated },
    expedition: {
      ...run,
      camps,
      // ⚠️ The fallen leave the crew as well as the health table — either alone would be a body on
      // the board at zero health that every targeting rule steps around. The Descent's rule, kept.
      party: {
        front: run.party.front.filter((defId) => standing.has(defId)),
        back: run.party.back.filter((defId) => standing.has(defId)),
      },
      health,
      energy,
    },
  };

  if (drops === undefined || !firstClear) {
    return banked;
  }
  // ⚠️ **Keyed on the map and the camp alone — no battle count, no attempt.** A camp's gear drops
  // once, ever, so the draw needs no salt to stay fair, and a label that is a pure function of the
  // content is one more thing a force-quit cannot reroll.
  const draw = derivedStream(state.rng.seed, `gear:${expeditionStageId(map.id, cell)}`);
  const specs = rollDrops(
    drops.rules,
    drops.factions,
    drops.stageIndex,
    camp.boss ? 'boss' : 'normal',
    draw,
  );
  return addGear(banked, specs, drops.rules).state;
}

/**
 * Walks the attempt out of the open exit.
 *
 * Requires the exit to be reachable; pays the completion bonus the first time ever this map has
 * been finished, marks it completed — which is what opens the next map — and closes the attempt.
 * Returns the same state when nothing may complete, so callers can tell a change from a no-op.
 */
export function completeExpedition(
  state: GameState,
  rules: ExpeditionRulesData,
  map: ExpeditionMapData,
): GameState {
  const run = state.expedition;
  if (run === null) {
    return state;
  }
  if (run.mapId !== map.id || !expeditionExitOpen(map, run)) {
    return state;
  }
  const record = expeditionRecordFor(state, map.id);
  let wallet = state.wallet;
  if (!record.completed) {
    const summons = Math.max(wholeCount(rules.summons.completion), 0);
    const emblems = Math.max(wholeCount(rules.completionEmblems), 0);
    if (summons > 0) {
      wallet = credit(wallet, { summons: num(summons) });
    }
    if (emblems > 0) {
      wallet = credit(wallet, { emblem: num(emblems) });
    }
  }
  return {
    ...state,
    wallet,
    expedition: null,
    expeditions: { ...state.expeditions, [map.id]: { ...record, completed: true } },
  };
}

/**
 * Walks away from the attempt in flight.
 *
 * Costs nothing that was not already banked — every payout lives in the permanent ledger, and the
 * attempt held nothing but its own progress. Returns the same state when there was nothing to
 * abandon.
 */
export function abandonExpedition(state: GameState): GameState {
  return state.expedition === null ? state : { ...state, expedition: null };
}

/** How a run reads back off an untrusted save. */
type Note = (field: string, problem: string, recovered: string) => void;

/**
 * Decodes the attempt in flight.
 *
 * ⚠️ Everything degrades to `null`, for `parseDescent`'s reason: a damaged attempt costs a restart
 * of optional content, where a half-repaired one is a crew that no longer matches its health table.
 */
export function parseExpedition(raw: unknown, note: Note): ExpeditionRun | null {
  if (raw === undefined || raw === null) {
    return null;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    note('expedition', `not an object (${JSON.stringify(raw) ?? 'undefined'})`, 'no attempt');
    return null;
  }
  const record = raw as Record<string, unknown>;
  const mapId = record['mapId'];
  const attempt = record['attempt'];
  if (
    typeof mapId !== 'string' ||
    mapId === '' ||
    typeof attempt !== 'number' ||
    !Number.isInteger(attempt) ||
    attempt < 1
  ) {
    note('expedition', 'mapId or attempt is unusable', 'no attempt');
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
        note(`expedition.${key}.${defId}`, 'unusable', 'dropped');
      }
    }
    return out;
  };
  const strings = (key: 'cards' | 'camps'): string[] => {
    const value = record[key];
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  };

  return {
    mapId,
    attempt,
    party: { front: rank('front'), back: rank('back') },
    health: shares('health', 1),
    energy: shares('energy', Number.MAX_SAFE_INTEGER),
    cards: strings('cards'),
    camps: strings('camps'),
  };
}

/**
 * Decodes the permanent ledger.
 *
 * ⚠️ **A malformed entry is dropped; a well-formed entry for a map this build does not ship is
 * kept** — the same posture `parseAchievements` and the formation book take toward an unknown key.
 * A ledger row costs a few strings; dropping it costs a player rewards being paid twice when the
 * map comes back.
 */
export function parseExpeditionRecords(raw: unknown, note: Note): Record<string, ExpeditionRecord> {
  const out: Record<string, ExpeditionRecord> = {};
  if (raw === undefined || raw === null) {
    return out;
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    note('expeditions', `not an object (${JSON.stringify(raw) ?? 'undefined'})`, 'no records');
    return out;
  }
  for (const [mapId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      note(`expeditions.${mapId}`, 'not an object', 'dropped');
      continue;
    }
    const entry = value as Record<string, unknown>;
    const cells = (key: 'camps' | 'chests'): string[] => {
      const list = entry[key];
      return Array.isArray(list) ? list.filter((id): id is string => typeof id === 'string') : [];
    };
    const attempts = entry['attempts'];
    out[mapId] = {
      camps: cells('camps'),
      chests: cells('chests'),
      completed: entry['completed'] === true,
      attempts:
        typeof attempts === 'number' && Number.isInteger(attempts) && attempts >= 0 ? attempts : 0,
    };
  }
  return out;
}

/** Encodes the attempt in flight as plain JSON, or `null` when there is none. */
export function serializeExpedition(run: ExpeditionRun | null): {
  mapId: string;
  attempt: number;
  party: { front: string[]; back: string[] };
  health: Record<string, number>;
  energy: Record<string, number>;
  cards: string[];
  camps: string[];
} | null {
  if (run === null) {
    return null;
  }
  return {
    mapId: run.mapId,
    attempt: run.attempt,
    party: { front: [...run.party.front], back: [...run.party.back] },
    health: { ...run.health },
    energy: { ...run.energy },
    cards: [...run.cards],
    camps: [...run.camps],
  };
}

/** Encodes the permanent ledger as plain JSON. */
export function serializeExpeditionRecords(
  records: Readonly<Record<string, ExpeditionRecord>>,
): Record<string, { camps: string[]; chests: string[]; completed: boolean; attempts: number }> {
  const out: Record<
    string,
    { camps: string[]; chests: string[]; completed: boolean; attempts: number }
  > = {};
  for (const [mapId, record] of Object.entries(records)) {
    out[mapId] = {
      camps: [...record.camps],
      chests: [...record.chests],
      completed: record.completed,
      attempts: record.attempts,
    };
  }
  return out;
}
