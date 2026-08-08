// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  allBountyProgress,
  awayMembers,
  benchMembers,
  boardDayIndex,
  type BountyBoardRulesData,
  type BountyData,
  bountyPayout,
  bountyProgress,
  collectBounty,
  collectReadyBounties,
  dailyBoard,
  dispatchBounty,
  dispatchOpenBounties,
  emptyDispatches,
  isUnlocked,
  meetsRequirement,
  msUntilRotation,
  parseDispatches,
  repairDispatches,
  serializeDispatches,
} from './bounties';
import { num } from './numeric';
import { TEST_CHARACTERS } from './roster/fixtures';
import { setFormation } from './roster/roster';
import { CAMPAIGN_FORMATION, type GameState, newGame } from './state';

const SEED = 0xc0ffee;
const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const BOARD_RULES: BountyBoardRulesData = { resetOffsetMinutes: 240, missions: 6 };

/** The same rules with a smaller board, for the assertions that are about the size limit. */
function board(missions: number): BountyBoardRulesData {
  return { ...BOARD_RULES, missions };
}

const ERRAND: BountyData = {
  id: 'errand',
  tier: 'errand',
  name: 'Village Errand',
  description: 'One character, one hour.',
  durationMs: HOUR,
  crew: 1,
  payoutSeconds: 1200,
  unlockClears: 5,
};

const PATROL: BountyData = {
  id: 'patrol',
  tier: 'patrol',
  name: 'Border Patrol',
  description: 'Two characters, four hours.',
  durationMs: 4 * HOUR,
  crew: 2,
  payoutSeconds: 5400,
  unlockClears: 15,
};

const BOUNTIES = [ERRAND, PATROL];

/**
 * A second variant of each tier, so rotation has something to rotate between.
 *
 * `alpha`, `beta` and `gamma` are `test-mortal` and `delta` is `test-celestial`, which is what the
 * faction requirements below are matched against.
 */
const ERRAND_MORTAL: BountyData = {
  ...ERRAND,
  id: 'errand-mortal',
  name: 'Mortal Errand',
  requires: { faction: 'test-mortal', count: 1 },
};

const ERRAND_CELESTIAL: BountyData = {
  ...ERRAND,
  id: 'errand-celestial',
  name: 'Celestial Errand',
  requires: { faction: 'test-celestial', count: 1 },
};

const PATROL_MORTAL: BountyData = {
  ...PATROL,
  id: 'patrol-mortal',
  name: 'Mortal Patrol',
  requires: { faction: 'test-mortal', count: 2 },
};

/** A pool with three errand variants and two patrol variants. */
const POOL = [ERRAND, ERRAND_MORTAL, ERRAND_CELESTIAL, PATROL, PATROL_MORTAL];

/** A run owning the three test characters, with nobody fielded and enough clears to dispatch. */
function run(overrides: Partial<GameState> = {}): GameState {
  const base = newGame({ seed: SEED, nowMs: T0 });
  return {
    ...base,
    clearedStages: 50,
    rates: { gold: num(10), xp: num(2), essence: num(0.5), summons: num(0.03) },
    roster: [
      { defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'beta', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'gamma', rarity: 0, level: 1, copies: 0, gear: {} },
    ],
    ...overrides,
  };
}

/** The same run with `members` already away on the errand. */
function away(state: GameState, members: readonly string[], startedAt = T0): GameState {
  return { ...state, dispatches: [{ bountyId: ERRAND.id, members: [...members], startedAt }] };
}

describe('isUnlocked', () => {
  it('gates a mission behind a clear count', () => {
    expect(isUnlocked(PATROL, run({ clearedStages: 14 }))).toBe(false);
    expect(isUnlocked(PATROL, run({ clearedStages: 15 }))).toBe(true);
  });
});

describe('dispatchBounty', () => {
  it('sends a crew and records when they left', () => {
    const result = dispatchBounty(run(), ERRAND, ['alpha'], TEST_CHARACTERS, T0);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.state.dispatches).toEqual([
      { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
    ]);
  });

  it('refuses somebody standing in the formation', () => {
    // ⚠️ Half of the disjointness invariant. A character cannot be both fighting and away, and
    // without this the board is a free resource tap the best five characters run on a timer.
    const fielded = setFormation(
      run(),
      CAMPAIGN_FORMATION,
      { front: ['alpha'], back: [] },
      TEST_CHARACTERS,
    );
    expect(fielded.ok).toBe(true);
    if (!fielded.ok) {
      return;
    }

    expect(dispatchBounty(fielded.state, ERRAND, ['alpha'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'in-formation',
    });
  });

  it('refuses somebody standing in a crew other than the campaign', () => {
    // ⚠️ Milestone 15a widened the fielded set from one formation to all of them, and this is what
    // holds it there. A version reading only the campaign key would pass every other test in this
    // file and let a tower's crew be dispatched out from under it.
    const fielded = setFormation(
      run(),
      'tower:test',
      { front: ['alpha'], back: [] },
      TEST_CHARACTERS,
    );
    expect(fielded.ok).toBe(true);
    if (!fielded.ok) {
      return;
    }

    expect(dispatchBounty(fielded.state, ERRAND, ['alpha'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'in-formation',
    });
  });

  it('refuses somebody already away on another mission', () => {
    const state = away(run(), ['alpha']);

    expect(dispatchBounty(state, PATROL, ['alpha', 'beta'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'already-away',
    });
  });

  it('refuses a second crew for a mission already running', () => {
    const state = away(run(), ['alpha']);

    expect(dispatchBounty(state, ERRAND, ['beta'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'already-running',
    });
  });

  it('demands exactly the crew size, never fewer and never more', () => {
    expect(dispatchBounty(run(), PATROL, ['alpha'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'wrong-crew-size',
    });
    expect(dispatchBounty(run(), PATROL, ['alpha', 'beta', 'gamma'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'wrong-crew-size',
    });
  });

  it('refuses the same character twice in one crew', () => {
    expect(dispatchBounty(run(), PATROL, ['alpha', 'alpha'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'duplicate-member',
    });
  });

  it('refuses a character the run does not own', () => {
    expect(dispatchBounty(run(), ERRAND, ['nobody'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'not-owned',
    });
  });

  it('refuses a mission the run has not unlocked', () => {
    expect(
      dispatchBounty(run({ clearedStages: 0 }), ERRAND, ['alpha'], TEST_CHARACTERS, T0),
    ).toEqual({
      ok: false,
      reason: 'locked',
    });
  });

  it('allows a second mission on a tier that already has one out', () => {
    // ⚠️ Missions **stack**. A tier is an authoring group, not a limit — the only thing a second
    // simultaneous mission costs is the crew it takes off the bench, which is the scarcity this
    // system exists to create. An earlier build refused this, and that was a screen-layout rule
    // wearing a game rule's clothes.
    const state = away(run(), ['alpha']);
    const result = dispatchBounty(state, ERRAND_MORTAL, ['beta'], TEST_CHARACTERS, T0);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.state.dispatches.map((entry) => entry.bountyId)).toEqual([
      'errand',
      'errand-mortal',
    ]);
  });

  it('still refuses the same mission twice', () => {
    // Stacking is about *different* missions. One dispatch per mission id is what makes a board row
    // mean one crew.
    const state = away(run(), ['alpha']);

    expect(dispatchBounty(state, ERRAND, ['beta'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'already-running',
    });
  });

  it('refuses a crew that does not meet the faction the mission asks for', () => {
    // `delta` is `test-celestial`, and this mission wants a `test-mortal`.
    const state = run({
      roster: [{ defId: 'delta', rarity: 0, level: 1, copies: 0, gear: {} }],
    });

    expect(dispatchBounty(state, ERRAND_MORTAL, ['delta'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'wrong-faction',
    });
  });

  it('accepts a crew that meets the faction', () => {
    expect(dispatchBounty(run(), ERRAND_MORTAL, ['alpha'], TEST_CHARACTERS, T0).ok).toBe(true);
  });

  it('counts the requirement across the whole crew rather than needing all of it', () => {
    // Two of two here, so the mission is satisfied exactly.
    expect(dispatchBounty(run(), PATROL_MORTAL, ['alpha', 'beta'], TEST_CHARACTERS, T0).ok).toBe(
      true,
    );
  });

  it('reports an unowned character before a faction it also fails', () => {
    // The faction check runs last on purpose: a player told "wrong faction" about a character they
    // do not own has been given the problem they cannot act on.
    expect(dispatchBounty(run(), ERRAND_MORTAL, ['nobody'], TEST_CHARACTERS, T0)).toEqual({
      ok: false,
      reason: 'not-owned',
    });
  });
});

describe('meetsRequirement', () => {
  it('passes a mission that asks for nothing', () => {
    expect(meetsRequirement(ERRAND, [], TEST_CHARACTERS)).toBe(true);
  });

  it('counts only members of the named faction', () => {
    expect(meetsRequirement(ERRAND_MORTAL, ['alpha'], TEST_CHARACTERS)).toBe(true);
    expect(meetsRequirement(ERRAND_MORTAL, ['delta'], TEST_CHARACTERS)).toBe(false);
  });

  it('counts a character the build no longer ships for nothing', () => {
    // An id the lookup cannot resolve must not satisfy a requirement by being unrecognisable.
    expect(meetsRequirement(ERRAND_MORTAL, ['ghost'], TEST_CHARACTERS)).toBe(false);
  });
});

describe('boardDayIndex', () => {
  it('counts upward, one per day', () => {
    expect(boardDayIndex(BOARD_RULES, T0 + DAY) - boardDayIndex(BOARD_RULES, T0)).toBe(1);
  });

  it('does not roll until the offset boundary is crossed', () => {
    // The board rolls at 04:00 UTC, the same moment the quest windows do.
    const boundary = (Math.floor((T0 - 240 * 60_000) / DAY) + 1) * DAY + 240 * 60_000;

    expect(boardDayIndex(BOARD_RULES, boundary - 1)).toBe(boardDayIndex(BOARD_RULES, T0));
    expect(boardDayIndex(BOARD_RULES, boundary)).toBe(boardDayIndex(BOARD_RULES, T0) + 1);
  });

  it('reads a broken clock as the first day rather than a negative index', () => {
    expect(boardDayIndex(BOARD_RULES, Number.NaN)).toBe(0);
    expect(boardDayIndex(BOARD_RULES, -1e15)).toBe(0);
  });
});

describe('msUntilRotation', () => {
  it('counts down to the next boundary and never past a day', () => {
    const remaining = msUntilRotation(BOARD_RULES, T0);

    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(DAY);
  });

  it('agrees with the day index: the countdown expiring is the day rolling', () => {
    const rollsAt = T0 + msUntilRotation(BOARD_RULES, T0);

    expect(boardDayIndex(BOARD_RULES, rollsAt - 1)).toBe(boardDayIndex(BOARD_RULES, T0));
    expect(boardDayIndex(BOARD_RULES, rollsAt)).toBe(boardDayIndex(BOARD_RULES, T0) + 1);
  });

  it('stays positive before the first boundary, where the raw modulo would go negative', () => {
    expect(msUntilRotation(BOARD_RULES, 0)).toBeGreaterThan(0);
  });
});

describe('dailyBoard', () => {
  const ids = (board: readonly BountyData[]): readonly string[] => board.map((b) => b.id);

  it('offers as many missions as the rules ask for', () => {
    expect(dailyBoard(run(), POOL, board(3), 0)).toHaveLength(3);
    expect(dailyBoard(run(), POOL, board(5), 0)).toHaveLength(5);
  });

  it('offers the whole pool rather than inventing rows when the board is bigger than it', () => {
    expect(dailyBoard(run(), POOL, board(99), 0)).toHaveLength(POOL.length);
  });

  it('lists them in pool order, so the board still reads shortest-first', () => {
    // The shuffle decides *which*; `data/` decides how they read.
    const board6 = dailyBoard(run(), POOL, BOARD_RULES, 0);
    const order = board6.map((bounty) => POOL.indexOf(bounty));

    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('can offer two missions of the same tier at once', () => {
    // ⚠️ A tier is an authoring group, not a limit. An earlier build offered one variant per tier,
    // which was a screen-layout rule wearing a game rule's clothes.
    const wholePool = dailyBoard(run(), POOL, board(POOL.length), 0);
    const errands = wholePool.filter((bounty) => bounty.tier === 'errand');

    expect(errands.length).toBeGreaterThan(1);
  });

  it('offers the same board all day, from the seed alone', () => {
    // ⚠️ Derived rather than stored, which is what makes rerolling impossible rather than merely
    // detectable: there is nothing to re-take.
    expect(dailyBoard(run(), POOL, BOARD_RULES, 7)).toEqual(
      dailyBoard(run(), POOL, BOARD_RULES, 7),
    );
  });

  it('offers a different run a different board on the same day', () => {
    const other = run({ rng: { seed: 0xbeef, calls: 0 } });
    const days = [0, 1, 2, 3, 4, 5, 6, 7];
    const mine = days.map((day) => ids(dailyBoard(run(), POOL, board(2), day)).join());
    const theirs = days.map((day) => ids(dailyBoard(other, POOL, board(2), day)).join());

    expect(mine).not.toEqual(theirs);
  });

  it('rotates: over a week it does not offer the same missions every day', () => {
    const seen = new Set(
      [0, 1, 2, 3, 4, 5, 6].map((day) => ids(dailyBoard(run(), POOL, board(2), day)).join()),
    );

    expect(seen.size).toBeGreaterThan(1);
  });

  it('shuffles the whole pool before filtering, so an unlock inserts rather than reshuffles', () => {
    // ⚠️ Shuffling only the unlocked missions would make the draw a function of the clear count, so
    // crossing a threshold would change every row. Shuffling everything first means the missions
    // already on the board keep their relative order when a new tier opens.
    const early = run({ clearedStages: 5 });
    const later = run({ clearedStages: 50 });

    const before = ids(dailyBoard(early, POOL, board(POOL.length), 3));
    const after = ids(dailyBoard(later, POOL, board(POOL.length), 3));

    // Everything the early run could see is still there, in the same relative order.
    expect(after.filter((id) => before.includes(id))).toEqual(before);
  });

  it('offers only what the run has unlocked', () => {
    const early = run({ clearedStages: 5 });

    // Patrol opens at 15 clears.
    expect(ids(dailyBoard(early, POOL, board(POOL.length), 0))).not.toContain('patrol');
  });

  it('keeps a running mission on the board whatever the day drew', () => {
    // ⚠️ A 24-hour campaign crosses a rotation boundary by definition. If the board dropped it, the
    // crew a player was eleven hours into would be stranded with no way to collect them.
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'errand-celestial', members: ['alpha'], startedAt: T0 }],
    };

    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      expect(ids(dailyBoard(state, POOL, board(1), day))).toContain('errand-celestial');
    }
  });

  it('counts running missions against the board size', () => {
    // Send everything and the board is full; collect one and a new mission takes its place. A
    // running mission that did not count would let the board grow without bound.
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand-celestial', members: ['alpha'], startedAt: T0 },
        { bountyId: 'patrol-mortal', members: ['beta', 'gamma'], startedAt: T0 },
      ],
    };

    expect(dailyBoard(state, POOL, board(3), 0)).toHaveLength(3);
    expect([...ids(dailyBoard(state, POOL, board(2), 0))].sort()).toEqual([
      'errand-celestial',
      'patrol-mortal',
    ]);
  });

  it('never shows a mission twice when the day also drew a running one', () => {
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'errand', members: ['alpha'], startedAt: T0 }],
    };
    const shown = ids(dailyBoard(state, POOL, board(POOL.length), 0));

    expect(new Set(shown).size).toBe(shown.length);
  });

  it('reads a damaged day index as the first day rather than throwing', () => {
    expect(dailyBoard(run(), POOL, BOARD_RULES, Number.NaN)).toEqual(
      dailyBoard(run(), POOL, BOARD_RULES, 0),
    );
    expect(dailyBoard(run(), POOL, BOARD_RULES, -5)).toEqual(
      dailyBoard(run(), POOL, BOARD_RULES, 0),
    );
  });

  it('offers nothing when the build ships no missions, or the board holds none', () => {
    expect(dailyBoard(run(), [], BOARD_RULES, 0)).toEqual([]);
    expect(dailyBoard(run(), POOL, board(0), 0)).toEqual([]);
  });
});

describe('benchMembers', () => {
  it('lists everybody owned who is neither fielded nor away', () => {
    expect(benchMembers(run())).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('drops somebody away on a mission', () => {
    expect(benchMembers(away(run(), ['alpha']))).toEqual(['beta', 'gamma']);
  });

  it('drops somebody standing in the formation', () => {
    const fielded = setFormation(
      run(),
      CAMPAIGN_FORMATION,
      { front: ['beta'], back: [] },
      TEST_CHARACTERS,
    );
    expect(fielded.ok).toBe(true);
    if (!fielded.ok) {
      return;
    }

    expect(benchMembers(fielded.state)).toEqual(['alpha', 'gamma']);
  });
});

describe('dispatchOpenBounties', () => {
  it('fills the board from the top down, in board order', () => {
    // Errand takes one and patrol takes two, which is exactly the three on the bench.
    const result = dispatchOpenBounties(run(), BOUNTIES, TEST_CHARACTERS, T0);

    expect(result.dispatched).toBe(2);
    expect(result.state.dispatches).toEqual([
      { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
      { bountyId: 'patrol', members: ['beta', 'gamma'], startedAt: T0 },
    ]);
  });

  it('skips a mission the bench cannot fill rather than sending a short crew', () => {
    const thin = run({ roster: [{ defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} }] });
    const result = dispatchOpenBounties(thin, BOUNTIES, TEST_CHARACTERS, T0);

    expect(result.dispatched).toBe(1);
    expect(result.state.dispatches.map((entry) => entry.bountyId)).toEqual(['errand']);
  });

  it('skips a mission whose faction the bench cannot meet', () => {
    const celestial = run({
      roster: [{ defId: 'delta', rarity: 0, level: 1, copies: 0, gear: {} }],
    });

    expect(dispatchOpenBounties(celestial, [ERRAND_MORTAL], TEST_CHARACTERS, T0).dispatched).toBe(
      0,
    );
  });

  it('takes the faction it needs before filling the rest of the crew', () => {
    // ⚠️ Filling general seats first would let one of them take the only member of the faction the
    // mission wants, failing a crew that was there all along.
    const mixed = run({
      roster: [
        { defId: 'delta', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} },
      ],
    });
    const result = dispatchOpenBounties(mixed, [PATROL_MORTAL], TEST_CHARACTERS, T0);

    // `test-mortal` count of 2 cannot be met by one mortal, so nothing goes.
    expect(result.dispatched).toBe(0);

    const enough = run({
      roster: [
        { defId: 'delta', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'beta', rarity: 0, level: 1, copies: 0, gear: {} },
      ],
    });
    const filled = dispatchOpenBounties(enough, [PATROL_MORTAL], TEST_CHARACTERS, T0);

    expect(filled.dispatched).toBe(1);
    expect(filled.state.dispatches[0]?.members).toEqual(['alpha', 'beta']);
  });

  it('never sends the same character on two missions in one press', () => {
    const result = dispatchOpenBounties(run(), BOUNTIES, TEST_CHARACTERS, T0);
    const sent = result.state.dispatches.flatMap((entry) => entry.members);

    expect(new Set(sent).size).toBe(sent.length);
  });

  it('leaves a mission that already has a crew out alone', () => {
    const state = away(run(), ['alpha']);
    const result = dispatchOpenBounties(state, BOUNTIES, TEST_CHARACTERS, T0);

    expect(result.state.dispatches.map((entry) => entry.bountyId)).toEqual(['errand', 'patrol']);
    expect(result.dispatched).toBe(1);
  });

  it('fills two missions of the same tier when the board offers both', () => {
    // Stacking, through the one-press path. The bench is the only thing rationing this.
    const result = dispatchOpenBounties(run(), [ERRAND, ERRAND_MORTAL], TEST_CHARACTERS, T0);

    expect(result.dispatched).toBe(2);
    expect(result.state.dispatches.map((entry) => entry.bountyId)).toEqual([
      'errand',
      'errand-mortal',
    ]);
  });

  it('skips a locked mission', () => {
    const early = run({ clearedStages: 5 });

    expect(dispatchOpenBounties(early, BOUNTIES, TEST_CHARACTERS, T0).dispatched).toBe(1);
  });

  it('returns the same state object when nothing could be sent', () => {
    const empty = run({ roster: [] });

    expect(dispatchOpenBounties(empty, BOUNTIES, TEST_CHARACTERS, T0).state).toBe(empty);
  });

  it('is the same as dispatching each mission by hand', () => {
    // Dispatch all is a convenience over `dispatchBounty`, never a second code path with its own
    // rules — so the invariants tested above hold for it by construction.
    const byHand = dispatchBounty(run(), ERRAND, ['alpha'], TEST_CHARACTERS, T0);
    expect(byHand.ok).toBe(true);
    if (!byHand.ok) {
      return;
    }
    const thenPatrol = dispatchBounty(byHand.state, PATROL, ['beta', 'gamma'], TEST_CHARACTERS, T0);
    expect(thenPatrol.ok).toBe(true);
    if (!thenPatrol.ok) {
      return;
    }

    expect(dispatchOpenBounties(run(), BOUNTIES, TEST_CHARACTERS, T0).state).toEqual(
      thenPatrol.state,
    );
  });
});

describe('setFormation, against a dispatched character', () => {
  it('refuses to field somebody who is away', () => {
    // ⚠️ The other half of the invariant, and the half most likely to be left out. Enforcing only
    // the dispatch side would let a player send somebody from the bench and then walk that same
    // character into the formation.
    const state = away(run(), ['alpha']);

    expect(
      setFormation(state, CAMPAIGN_FORMATION, { front: ['alpha'], back: [] }, TEST_CHARACTERS),
    ).toEqual({
      ok: false,
      reason: 'character-away',
    });
  });

  it('still fields anybody who is not away', () => {
    const state = away(run(), ['alpha']);
    const result = setFormation(
      state,
      CAMPAIGN_FORMATION,
      { front: ['beta'], back: ['gamma'] },
      TEST_CHARACTERS,
    );

    expect(result.ok).toBe(true);
  });
});

describe('bountyProgress', () => {
  it('reports an idle mission as not running', () => {
    const progress = bountyProgress(ERRAND, run(), T0);

    expect(progress.running).toBe(false);
    expect(progress.ready).toBe(false);
    expect(progress.remainingMs).toBe(0);
  });

  it('counts down while it runs', () => {
    const state = away(run(), ['alpha']);

    expect(bountyProgress(ERRAND, state, T0 + HOUR / 4).remainingMs).toBe((HOUR * 3) / 4);
    expect(bountyProgress(ERRAND, state, T0 + HOUR / 4).fraction).toBeCloseTo(0.25);
    expect(bountyProgress(ERRAND, state, T0 + HOUR / 4).ready).toBe(false);
  });

  it('is ready exactly at the duration, and stays ready afterwards', () => {
    const state = away(run(), ['alpha']);

    expect(bountyProgress(ERRAND, state, T0 + HOUR).ready).toBe(true);
    expect(bountyProgress(ERRAND, state, T0 + HOUR * 100).ready).toBe(true);
    expect(bountyProgress(ERRAND, state, T0 + HOUR * 100).fraction).toBe(1);
  });

  it('clamps a clock that moved backwards rather than un-finishing a mission', () => {
    // ⚠️ The backwards-clock rule in this system. Negative elapsed time would produce a
    // `remainingMs` longer than the mission, so a player who changed timezone would watch a
    // finished mission become unfinished. Clamp; do not detect.
    const state = away(run(), ['alpha'], T0);

    expect(bountyProgress(ERRAND, state, T0 - HOUR * 10).remainingMs).toBe(HOUR);
    expect(bountyProgress(ERRAND, state, T0 - HOUR * 10).fraction).toBe(0);
  });

  it('survives a mission authored with no duration', () => {
    const broken: BountyData = { ...ERRAND, durationMs: 0 };
    const state = away(run(), ['alpha']);

    expect(Number.isFinite(bountyProgress(broken, state, T0).fraction)).toBe(true);
  });
});

describe('bountyPayout', () => {
  it('pays a duration of the idle income the run currently earns', () => {
    // ⚠️ The reason a bounty is worth the same at stage 5 and stage 5,000: it is priced in seconds
    // of whatever the player currently earns, not in a quantity that goes stale.
    const payout = bountyPayout(ERRAND, run().rates);

    expect(payout.gold?.toString()).toBe('12000');
    expect(payout.xp?.toString()).toBe('2400');
    expect(payout.essence?.toString()).toBe('600');
  });

  it('scales with the run rather than with the mission', () => {
    const rich = run({
      rates: { gold: num(1e9), xp: num(2e8), essence: num(5e7), summons: num(0.03) },
    });

    expect(bountyPayout(ERRAND, rich.rates).gold?.gt(num(1e12))).toBe(true);
  });

  it('never pays crystals', () => {
    // ⚠️ The crystal rate is linear in the clear count so it cannot outrun a flat `PULL_COST`.
    // Paying a multiple of it on a repeatable timer is the compounding that rule exists to stop.
    expect(bountyPayout(ERRAND, run().rates).summons).toBeUndefined();
  });

  it('drops a currency that rounds to nothing rather than paying a zero', () => {
    const poor = run({ rates: { gold: num(1), xp: num(0), essence: num(0), summons: num(0) } });
    const payout = bountyPayout(ERRAND, poor.rates);

    expect(payout.gold?.toString()).toBe('1200');
    expect(payout.xp).toBeUndefined();
    expect(payout.essence).toBeUndefined();
  });
});

describe('collectBounty', () => {
  it('pays a finished mission and brings the crew home', () => {
    const state = away(run(), ['alpha']);
    const result = collectBounty(state, ERRAND, T0 + HOUR);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.state.wallet.gold.toString()).toBe('12000');
    expect(result.state.dispatches).toEqual([]);
    expect(awayMembers(result.state).has('alpha')).toBe(false);
  });

  it('refuses an unfinished mission rather than paying part of it', () => {
    // A mission is a wait. Cashing one early would make the wait optional, which is the mechanic.
    const state = away(run(), ['alpha']);

    expect(collectBounty(state, ERRAND, T0 + HOUR / 2)).toEqual({
      ok: false,
      reason: 'not-finished',
    });
  });

  it('refuses a mission nobody is on', () => {
    expect(collectBounty(run(), ERRAND, T0 + HOUR)).toEqual({ ok: false, reason: 'not-running' });
  });

  it('frees the crew to be fielded again', () => {
    const state = away(run(), ['alpha']);
    const collected = collectBounty(state, ERRAND, T0 + HOUR);
    expect(collected.ok).toBe(true);
    if (!collected.ok) {
      return;
    }

    expect(
      setFormation(
        collected.state,
        CAMPAIGN_FORMATION,
        { front: ['alpha'], back: [] },
        TEST_CHARACTERS,
      ).ok,
    ).toBe(true);
  });
});

describe('collectReadyBounties', () => {
  it('collects everything finished in one pass, summing the payout', () => {
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
        { bountyId: 'patrol', members: ['beta', 'gamma'], startedAt: T0 },
      ],
    };
    const result = collectReadyBounties(state, BOUNTIES, T0 + 4 * HOUR);

    expect(result.missions).toBe(2);
    // 1200s + 5400s of a 10/s gold rate.
    expect(result.gained.gold?.toString()).toBe('66000');
    expect(result.state.dispatches).toEqual([]);
  });

  it('leaves an unfinished mission running while collecting a finished one', () => {
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
        { bountyId: 'patrol', members: ['beta', 'gamma'], startedAt: T0 },
      ],
    };
    const result = collectReadyBounties(state, BOUNTIES, T0 + HOUR);

    expect(result.missions).toBe(1);
    expect(result.state.dispatches.map((entry) => entry.bountyId)).toEqual(['patrol']);
  });

  it('returns the same state object when nothing is ready', () => {
    const state = away(run(), ['alpha']);

    expect(collectReadyBounties(state, BOUNTIES, T0).state).toBe(state);
  });
});

describe('repairDispatches', () => {
  const swallow = (): void => undefined;

  it('leaves a healthy run untouched, as the same object', () => {
    const state = away(run(), ['alpha']);

    expect(repairDispatches(state, BOUNTIES, swallow)).toBe(state);
  });

  it('drops a mission this build no longer ships', () => {
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'retired', members: ['alpha'], startedAt: T0 }],
    };

    expect(repairDispatches(state, BOUNTIES, swallow).dispatches).toEqual([]);
  });

  it('drops a crew naming somebody the roster no longer holds', () => {
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'errand', members: ['ghost'], startedAt: T0 }],
    };

    expect(repairDispatches(state, BOUNTIES, swallow).dispatches).toEqual([]);
  });

  it('restores the invariant when a save has somebody both fielded and away', () => {
    // ⚠️ The one thing a hand-edited save is most likely to break, and the reason this pass exists
    // rather than trusting the two write paths.
    const state: GameState = {
      ...run(),
      formations: { [CAMPAIGN_FORMATION]: { front: ['alpha'], back: [] } },
      dispatches: [{ bountyId: 'errand', members: ['alpha'], startedAt: T0 }],
    };

    expect(repairDispatches(state, BOUNTIES, swallow).dispatches).toEqual([]);
  });

  it('drops the second of two missions claiming the same character', () => {
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
        { bountyId: 'patrol', members: ['alpha', 'beta'], startedAt: T0 },
      ],
    };

    expect(repairDispatches(state, BOUNTIES, swallow).dispatches.map((d) => d.bountyId)).toEqual([
      'errand',
    ]);
  });

  it('keeps two missions on the same tier, which is not damage', () => {
    // ⚠️ An earlier build dropped one of these. Missions stack; a tier is an authoring group, not a
    // limit, and repair pays nothing for what it drops — so dropping a healthy dispatch costs the
    // player a wait for no reason.
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
        { bountyId: 'errand-mortal', members: ['beta'], startedAt: T0 },
      ],
    };

    expect(repairDispatches(state, POOL, swallow)).toBe(state);
  });

  it('keeps two missions on different tiers', () => {
    const state: GameState = {
      ...run(),
      dispatches: [
        { bountyId: 'errand', members: ['alpha'], startedAt: T0 },
        { bountyId: 'patrol', members: ['beta', 'gamma'], startedAt: T0 },
      ],
    };

    expect(repairDispatches(state, POOL, swallow)).toBe(state);
  });

  it('pays nothing for what it drops', () => {
    // Paying would make damaging a save a way to collect instantly. Losing an in-flight mission
    // costs the player one wait; the alternative silently inflates a run.
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'retired', members: ['alpha'], startedAt: T0 }],
    };

    expect(repairDispatches(state, BOUNTIES, swallow).wallet.gold.toString()).toBe('0');
  });

  it('says what it repaired', () => {
    const issues: string[] = [];
    const state: GameState = {
      ...run(),
      dispatches: [{ bountyId: 'retired', members: ['alpha'], startedAt: T0 }],
    };

    repairDispatches(state, BOUNTIES, (field) => issues.push(field));

    expect(issues).toEqual(['dispatches.retired']);
  });
});

describe('parseDispatches', () => {
  const swallow = (): void => undefined;

  it('reads a healthy list through unchanged', () => {
    const raw = [{ bountyId: 'errand', members: ['alpha'], startedAt: T0 }];

    expect(parseDispatches(raw, swallow)).toEqual(raw);
  });

  it('reads a missing list as nobody away, without reporting damage', () => {
    const issues: string[] = [];

    expect(parseDispatches(undefined, (field) => issues.push(field))).toEqual([]);
    expect(issues).toEqual([]);
  });

  it.each([
    { label: 'a missing id', raw: { members: ['alpha'], startedAt: T0 } },
    { label: 'a missing crew', raw: { bountyId: 'errand', startedAt: T0 } },
    { label: 'a missing start time', raw: { bountyId: 'errand', members: ['alpha'] } },
    { label: 'a negative start time', raw: { bountyId: 'errand', members: ['a'], startedAt: -1 } },
    { label: 'a non-id crew member', raw: { bountyId: 'errand', members: [7], startedAt: T0 } },
  ])('drops an entry with $label', ({ raw }) => {
    expect(parseDispatches([raw], swallow)).toEqual([]);
  });

  it('round-trips through serialization', () => {
    const state = away(run(), ['alpha', 'beta']);

    expect(parseDispatches(serializeDispatches(state.dispatches), swallow)).toEqual(
      state.dispatches,
    );
  });
});

describe('allBountyProgress', () => {
  it('reports every mission in the order they were authored', () => {
    const progress = allBountyProgress(BOUNTIES, run(), T0);

    expect(progress.map((entry) => entry.bounty.id)).toEqual(['errand', 'patrol']);
  });
});

describe('emptyDispatches', () => {
  it('starts a new run with nobody away', () => {
    expect(emptyDispatches()).toEqual([]);
    expect(newGame({ seed: SEED, nowMs: T0 }).dispatches).toEqual([]);
  });
});
