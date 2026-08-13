// @vitest-environment node
// `core/` runs headless. A spec here needing a TestBed would mean the boundary had been violated.
import { describe, expect, it } from 'vitest';
import { type AuthoredCurrencies, type EnemyFormationData } from '../battle/types';
import { num } from '../numeric';
import { type GameState, newGame } from '../state';
import {
  adjacentCamps,
  cheapestStaminaTo,
  exitReachable,
  expeditionMapIssues,
  parseExpeditionGrid,
  reachableChests,
  reachableTiles,
} from './map';
import {
  abandonExpedition,
  applyExpeditionResult,
  completeExpedition,
  expeditionCampSummons,
  expeditionCardsOwed,
  expeditionChestPayout,
  expeditionExitOpen,
  expeditionLevel,
  expeditionMapOpen,
  expeditionRecordFor,
  expeditionsCompleted,
  expeditionStageId,
  expeditionStaminaLeft,
  expeditionStaminaSpent,
  expeditionStatus,
  fightableExpeditionCamps,
  isExpeditionUnlocked,
  nextExpeditionCamp,
  parseExpedition,
  parseExpeditionRecords,
  resolveExpeditionCamp,
  serializeExpedition,
  serializeExpeditionRecords,
  startExpedition,
  takeExpeditionCard,
  type ExpeditionBattleOutcome,
} from './run';
import { type ExpeditionMapData, type ExpeditionRulesData, type ExpeditionRun } from './types';

const T0 = 1_700_000_000_000;

const EMPTY: EnemyFormationData = { front: [], back: [] };

/**
 * The synthetic map every test below walks:
 *
 * ```
 * S . a c X      a — camp, 2 stamina; c — the boss, 4
 * 1 # 2 # #      1 — chest open from the start; 2 — behind a
 * . b # # #      b — optional camp, 3 stamina
 * ```
 *
 * Budget 7 against a total camp cost of 9, so the cheapest completion (a + c = 6) fits and
 * everything (9) does not — the same shape `expedition.spec.ts` holds every shipped map to.
 */
const MAP: ExpeditionMapData = {
  id: 'trial',
  name: 'The Trial',
  description: 'A test map.',
  grid: ['S.acX', '1#2##', '.b###'],
  stamina: 7,
  camps: [
    { cell: 'a', name: 'First Camp', stamina: 2, levelOffset: -4, boss: false, enemies: EMPTY },
    { cell: 'b', name: 'Side Camp', stamina: 3, levelOffset: -2, boss: false, enemies: EMPTY },
    { cell: 'c', name: 'Gate Camp', stamina: 4, levelOffset: 2, boss: true, enemies: EMPTY },
  ],
  chests: [
    { cell: '1', name: 'Open Chest', contents: { summons: 50 } },
    { cell: '2', name: 'Hidden Chest', contents: { gold: 3, emblems: 5 } },
  ],
};

const LATER: ExpeditionMapData = {
  ...MAP,
  id: 'second',
  name: 'The Second',
};

const MAPS = [MAP, LATER];

const RULES: ExpeditionRulesData = {
  unlockChapters: 3,
  offer: 3,
  ranks: [
    { name: 'Lesser', start: 10, end: 1 },
    { name: 'Greater', start: 3, end: 5 },
    { name: 'Grand', start: 0, end: 8 },
  ],
  maxLifeLeech: 0.35,
  summons: { perCamp: 100, bossMultiplier: 5, completion: 1000 },
  completionEmblems: 25,
  lumpMultipliers: { gold: 2, xp: 2, essence: 5 },
};

const BASE_LUMP: AuthoredCurrencies = { gold: 100, xp: 40, essence: 4 };

/** The attempt in flight, or a thrown error — the same narrowing helper the Descent spec uses. */
function runOf(state: GameState): ExpeditionRun {
  if (state.expedition === null) {
    throw new Error('expected an attempt in flight');
  }
  return state.expedition;
}

function fresh(): GameState {
  return newGame({ seed: 12345, nowMs: T0 });
}

function started(): GameState {
  return startExpedition(fresh(), MAP, { front: ['rin'], back: ['wren'] }, BASE_LUMP);
}

/** A clean victory: both members standing, half health, some energy. */
function victory(): ExpeditionBattleOutcome {
  return {
    outcome: 'victory',
    reward: { gained: { gold: num(200) } },
    final: [
      { side: 'ally', defId: 'rin', hp: num(50), maxHp: num(100), energy: 30 },
      { side: 'ally', defId: 'wren', hp: num(80), maxHp: num(100), energy: 10 },
      { side: 'enemy', defId: 'husk', hp: num(0), maxHp: num(100), energy: 0 },
    ],
  };
}

function defeat(): ExpeditionBattleOutcome {
  return { outcome: 'defeat', reward: { gained: {} }, final: [] };
}

describe('the grid', () => {
  it('parses kinds and cells off the characters', () => {
    const grid = parseExpeditionGrid(MAP);
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(3);
    expect(grid.tiles[0].kind).toBe('start');
    expect(grid.tiles[2]).toMatchObject({ kind: 'camp', cell: 'a' });
    expect(grid.tiles[4].kind).toBe('exit');
    expect(grid.tiles[5]).toMatchObject({ kind: 'chest', cell: '1' });
    expect(grid.tiles[6].kind).toBe('wall');
  });

  it('grows the reachable region as camps fall', () => {
    const grid = parseExpeditionGrid(MAP);
    expect(reachableTiles(grid, new Set()).size).toBe(4); // S, the path beside it, chest 1, the floor below it
    expect(reachableTiles(grid, new Set(['a'])).size).toBe(6); // + a's tile and chest 2
  });

  it('offers only the camps beside the region', () => {
    const grid = parseExpeditionGrid(MAP);
    expect([...adjacentCamps(grid, new Set())].sort()).toEqual(['a', 'b']);
    // The boss is behind a: reachable only once a falls.
    expect([...adjacentCamps(grid, new Set(['a']))].sort()).toEqual(['b', 'c']);
  });

  it('reveals chests when the region reaches them and the exit only past the boss', () => {
    const grid = parseExpeditionGrid(MAP);
    expect([...reachableChests(grid, new Set())]).toEqual(['1']);
    expect([...reachableChests(grid, new Set(['a']))].sort()).toEqual(['1', '2']);
    expect(exitReachable(grid, new Set(['a', 'b']))).toBe(false);
    expect(exitReachable(grid, new Set(['a', 'c']))).toBe(true);
  });

  it('prices the cheapest route with a node-weight Dijkstra', () => {
    expect(cheapestStaminaTo(MAP, { kind: 'exit' })).toBe(6); // a (2) + c (4)
    expect(cheapestStaminaTo(MAP, { kind: 'chest', cell: '1' })).toBe(0);
    expect(cheapestStaminaTo(MAP, { kind: 'chest', cell: '2' })).toBe(2);
    const walled: ExpeditionMapData = { ...MAP, grid: ['S#acX', '1#2##', '.b###'] };
    expect(cheapestStaminaTo(walled, { kind: 'exit' })).toBeNull();
  });

  it('reports a well-formed map clean and names what is wrong with a damaged one', () => {
    expect(expeditionMapIssues(MAP)).toEqual([]);
    const openExit: ExpeditionMapData = { ...MAP, grid: ['S.a.X', '1#2##', '.b#c#'] };
    expect(expeditionMapIssues(openExit)).toContain(
      'the exit is reachable without beating the boss camp',
    );
    const missingRow: ExpeditionMapData = { ...MAP, camps: MAP.camps.slice(0, 2) };
    expect(expeditionMapIssues(missingRow).join(' ')).toContain('no data row');
    const twoStarts: ExpeditionMapData = { ...MAP, grid: ['SSacX', '1#2##', '.b###'] };
    expect(expeditionMapIssues(twoStarts).join(' ')).toContain('exactly one start');
  });
});

describe('starting an attempt', () => {
  it('copies the crew in, counts the attempt, and pays the start-open chest once ever', () => {
    const state = started();
    const run = runOf(state);
    expect(run.mapId).toBe('trial');
    expect(run.attempt).toBe(1);
    expect(run.party).toEqual({ front: ['rin'], back: ['wren'] });
    expect(run.camps).toEqual([]);
    // Chest 1 sits inside the starting region: 50 crystals, on the spot, recorded forever.
    expect(state.wallet.summons.toNumber()).toBe(fresh().wallet.summons.toNumber() + 50);
    expect(expeditionRecordFor(state, 'trial').chests).toEqual(['1']);

    const again = startExpedition(state, MAP, { front: ['rin'], back: [] }, BASE_LUMP);
    expect(runOf(again).attempt).toBe(2);
    // The ledger, not the attempt, gates the pay: the second walk past the same chest is scenery.
    expect(again.wallet.summons.toNumber()).toBe(state.wallet.summons.toNumber());
  });

  it('replaces whatever attempt was in flight', () => {
    const state = startExpedition(started(), LATER, { front: ['rin'], back: [] }, BASE_LUMP);
    expect(runOf(state).mapId).toBe('second');
  });
});

describe('the fight loop', () => {
  it('derives stamina from the cleared list and gates fightability on budget and adjacency', () => {
    const state = started();
    const run = runOf(state);
    expect(expeditionStaminaSpent(MAP, run)).toBe(0);
    expect(expeditionStaminaLeft(MAP, run)).toBe(7);
    // The boss is adjacent to nothing reachable yet.
    expect(fightableExpeditionCamps(MAP, run).map((camp) => camp.cell)).toEqual(['a', 'b']);
    expect(expeditionStatus(MAP, run)).toBe('ready');
    expect(nextExpeditionCamp(MAP, run, 'c')).toBeNull();
    expect(nextExpeditionCamp(MAP, run, 'a')?.cell).toBe('a');
  });

  it('banks a victory: the camp, the survivors, the first-clear pay and the chest behind it', () => {
    const before = started();
    const state = applyExpeditionResult(before, RULES, MAP, 'a', victory(), BASE_LUMP);
    const run = runOf(state);
    expect(state.battleCount).toBe(before.battleCount + 1);
    expect(run.camps).toEqual(['a']);
    expect(run.health).toEqual({ rin: 0.5, wren: 0.8 });
    expect(run.energy).toEqual({ rin: 30, wren: 10 });
    expect(expeditionStaminaSpent(MAP, run)).toBe(2);
    // First-ever clear: the fight's lump, the camp's crystals, and chest 2's contents together.
    expect(state.wallet.gold.toNumber()).toBe(
      before.wallet.gold.toNumber() + 200 + 100 * 3, // the fight's lump + the chest's gold multiplier
    );
    expect(state.wallet.summons.toNumber()).toBe(before.wallet.summons.toNumber() + 100);
    expect(state.wallet.emblem.toNumber()).toBe(before.wallet.emblem.toNumber() + 5);
    const record = expeditionRecordFor(state, 'trial');
    expect(record.camps).toEqual(['a']);
    expect([...record.chests].sort()).toEqual(['1', '2']);
    // A card is owed before the next fight.
    expect(expeditionCardsOwed(run)).toBe(1);
    expect(expeditionStatus(MAP, run)).toBe('choosing');
    expect(nextExpeditionCamp(MAP, run, 'c')).toBeNull();
  });

  it('drops the fallen from the crew and the health table together', () => {
    const fallen: ExpeditionBattleOutcome = {
      outcome: 'victory',
      reward: { gained: {} },
      final: [{ side: 'ally', defId: 'rin', hp: num(25), maxHp: num(100), energy: 0 }],
    };
    const state = applyExpeditionResult(started(), RULES, MAP, 'a', fallen, BASE_LUMP);
    const run = runOf(state);
    expect(run.party).toEqual({ front: ['rin'], back: [] });
    expect(run.health).toEqual({ rin: 0.25 });
  });

  it('writes nothing but the battle count on a defeat', () => {
    const before = started();
    const state = applyExpeditionResult(before, RULES, MAP, 'a', defeat(), BASE_LUMP);
    expect(state.battleCount).toBe(before.battleCount + 1);
    expect(state.expedition).toEqual(before.expedition);
    expect(state.wallet.gold.toNumber()).toBe(before.wallet.gold.toNumber());
    expect(expeditionRecordFor(state, 'trial').camps).toEqual([]);
  });

  it('pays a re-fought camp nothing on a later attempt', () => {
    const first = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    const second = startExpedition(first, MAP, { front: ['rin'], back: ['wren'] }, BASE_LUMP);
    const refought = applyExpeditionResult(second, RULES, MAP, 'a', victory(), BASE_LUMP);
    // The camp still blocked and still cost stamina — but every payout stayed where it was.
    expect(expeditionStaminaSpent(MAP, runOf(refought))).toBe(2);
    expect(refought.wallet.gold.toNumber()).toBe(second.wallet.gold.toNumber());
    expect(refought.wallet.summons.toNumber()).toBe(second.wallet.summons.toNumber());
  });

  it('refuses a fight while a card is owed, and a card while nothing is owed', () => {
    const owing = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    const stillOwing = applyExpeditionResult(owing, RULES, MAP, 'b', victory(), BASE_LUMP);
    // Only the battle count moved: the fight was refused.
    expect(runOf(stillOwing).camps).toEqual(['a']);
    expect(stillOwing.battleCount).toBe(owing.battleCount + 1);

    const notOwing = started();
    expect(takeExpeditionCard(notOwing, MAP, 'edge:0')).toBe(notOwing);
    const taken = takeExpeditionCard(owing, MAP, 'edge:0');
    expect(runOf(taken).cards).toEqual(['edge:0']);
    expect(expeditionStatus(MAP, runOf(taken))).toBe('ready');
  });

  it('goes spent when no remaining camp is affordable, and owes no card there', () => {
    // Fight a (2) then b (3): 5 of 7 spent, and the boss costs 4.
    let state = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    state = takeExpeditionCard(state, MAP, 'edge:0');
    state = applyExpeditionResult(state, RULES, MAP, 'b', victory(), BASE_LUMP);
    const run = runOf(state);
    expect(expeditionStaminaLeft(MAP, run)).toBe(2);
    expect(fightableExpeditionCamps(MAP, run)).toEqual([]);
    expect(expeditionStatus(MAP, run)).toBe('spent');
    // A card is nominally owed but there is nothing to spend it on, so taking one is refused.
    expect(takeExpeditionCard(state, MAP, 'edge:1')).toBe(state);
    expect(expeditionExitOpen(MAP, run)).toBe(false);
  });
});

describe('completing and walking away', () => {
  function completedOnce(): { readonly before: GameState; readonly after: GameState } {
    let state = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    state = takeExpeditionCard(state, MAP, 'edge:0');
    state = applyExpeditionResult(state, RULES, MAP, 'c', victory(), BASE_LUMP);
    return { before: state, after: completeExpedition(state, RULES, MAP) };
  }

  it('refuses while the boss stands and pays the completion bonus once ever', () => {
    const midway = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    expect(completeExpedition(midway, RULES, MAP)).toBe(midway);

    const { before, after } = completedOnce();
    expect(after.expedition).toBeNull();
    expect(expeditionRecordFor(after, 'trial').completed).toBe(true);
    expect(after.wallet.summons.toNumber()).toBe(before.wallet.summons.toNumber() + 1000);
    expect(after.wallet.emblem.toNumber()).toBe(before.wallet.emblem.toNumber() + 25);
    expect(expeditionsCompleted(after)).toBe(1);

    // Solve it again: the exit still opens, and the bonus does not come back.
    let replay = startExpedition(after, MAP, { front: ['rin'], back: [] }, BASE_LUMP);
    replay = applyExpeditionResult(replay, RULES, MAP, 'a', victory(), BASE_LUMP);
    replay = takeExpeditionCard(replay, MAP, 'edge:0');
    replay = applyExpeditionResult(replay, RULES, MAP, 'c', victory(), BASE_LUMP);
    const again = completeExpedition(replay, RULES, MAP);
    expect(again.expedition).toBeNull();
    expect(again.wallet.summons.toNumber()).toBe(replay.wallet.summons.toNumber());
  });

  it('opens the next map on completion and not before', () => {
    expect(expeditionMapOpen(MAPS, fresh(), 'trial')).toBe(true);
    expect(expeditionMapOpen(MAPS, fresh(), 'second')).toBe(false);
    const { after } = completedOnce();
    expect(expeditionMapOpen(MAPS, after, 'second')).toBe(true);
    expect(expeditionMapOpen(MAPS, after, 'unshipped')).toBe(false);
  });

  it('abandons for free', () => {
    const state = started();
    const walked = abandonExpedition(state);
    expect(walked.expedition).toBeNull();
    expect(walked.wallet.gold.toNumber()).toBe(state.wallet.gold.toNumber());
    expect(abandonExpedition(walked)).toBe(walked);
  });
});

describe('the small arithmetic', () => {
  it('gates the mode on chapters cleared', () => {
    expect(isExpeditionUnlocked(RULES, 2)).toBe(false);
    expect(isExpeditionUnlocked(RULES, 3)).toBe(true);
  });

  it('offsets the level off the anchor and floors it at 1', () => {
    const [a, , c] = MAP.camps;
    expect(expeditionLevel(100, a)).toBe(96);
    expect(expeditionLevel(100, c)).toBe(102);
    expect(expeditionLevel(2, a)).toBe(1);
  });

  it('resolves a camp into a stage that cannot touch the campaign payout path', () => {
    const [a, , c] = MAP.camps;
    const stage = resolveExpeditionCamp(MAP, a, 50, { gold: 10 });
    expect(stage.id).toBe(expeditionStageId('trial', 'a'));
    expect(stage.kind).toBe('normal');
    expect(stage.level).toBe(46);
    expect(stage.rates).toEqual({});
    expect(stage.firstClearSummons).toBe(0);
    expect(resolveExpeditionCamp(MAP, c, 50, {}).kind).toBe('boss');
  });

  it('multiplies the boss camp crystals and prices a chest off both idioms', () => {
    const [a, , c] = MAP.camps;
    expect(expeditionCampSummons(RULES, a)).toBe(100);
    expect(expeditionCampSummons(RULES, c)).toBe(500);
    const payout = expeditionChestPayout({ summons: 10, gold: 2, essence: 3 }, BASE_LUMP);
    expect(payout.summons?.toNumber()).toBe(10);
    expect(payout.gold?.toNumber()).toBe(200);
    expect(payout.essence?.toNumber()).toBe(12);
    expect(payout.xp).toBeUndefined();
  });
});

describe('the save round trip', () => {
  const quiet = (): void => undefined;

  it('round-trips the attempt and the ledger', () => {
    const state = applyExpeditionResult(started(), RULES, MAP, 'a', victory(), BASE_LUMP);
    const run = runOf(state);
    expect(parseExpedition(serializeExpedition(run), quiet)).toEqual(run);
    expect(parseExpeditionRecords(serializeExpeditionRecords(state.expeditions), quiet)).toEqual(
      state.expeditions,
    );
    expect(serializeExpedition(null)).toBeNull();
  });

  it('degrades a damaged attempt to null and keeps an unknown map ledger entry', () => {
    expect(parseExpedition(undefined, quiet)).toBeNull();
    expect(parseExpedition(42, quiet)).toBeNull();
    expect(parseExpedition({ mapId: '', attempt: 1 }, quiet)).toBeNull();
    expect(parseExpedition({ mapId: 'trial', attempt: 0 }, quiet)).toBeNull();

    const records = parseExpeditionRecords(
      {
        future: { camps: ['a'], chests: [], completed: true, attempts: 3 },
        broken: 'not an object',
      },
      quiet,
    );
    expect(records['future']).toEqual({ camps: ['a'], chests: [], completed: true, attempts: 3 });
    expect(records['broken']).toBeUndefined();
  });
});
