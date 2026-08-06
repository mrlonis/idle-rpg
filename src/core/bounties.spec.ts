// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  allBountyProgress,
  awayMembers,
  type BountyData,
  bountyPayout,
  bountyProgress,
  collectBounty,
  collectReadyBounties,
  dispatchBounty,
  emptyDispatches,
  isUnlocked,
  parseDispatches,
  repairDispatches,
  serializeDispatches,
} from './bounties';
import { num } from './numeric';
import { TEST_CHARACTERS } from './roster/fixtures';
import { setFormation } from './roster/roster';
import { type GameState, newGame } from './state';

const SEED = 0xc0ffee;
const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;

const ERRAND: BountyData = {
  id: 'errand',
  name: 'Village Errand',
  description: 'One character, one hour.',
  durationMs: HOUR,
  crew: 1,
  payoutSeconds: 1200,
  unlockClears: 5,
};

const PATROL: BountyData = {
  id: 'patrol',
  name: 'Border Patrol',
  description: 'Two characters, four hours.',
  durationMs: 4 * HOUR,
  crew: 2,
  payoutSeconds: 5400,
  unlockClears: 15,
};

const BOUNTIES = [ERRAND, PATROL];

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
    const result = dispatchBounty(run(), ERRAND, ['alpha'], T0);

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
    const fielded = setFormation(run(), { front: ['alpha'], back: [] }, TEST_CHARACTERS);
    expect(fielded.ok).toBe(true);
    if (!fielded.ok) {
      return;
    }

    expect(dispatchBounty(fielded.state, ERRAND, ['alpha'], T0)).toEqual({
      ok: false,
      reason: 'in-formation',
    });
  });

  it('refuses somebody already away on another mission', () => {
    const state = away(run(), ['alpha']);

    expect(dispatchBounty(state, PATROL, ['alpha', 'beta'], T0)).toEqual({
      ok: false,
      reason: 'already-away',
    });
  });

  it('refuses a second crew for a mission already running', () => {
    const state = away(run(), ['alpha']);

    expect(dispatchBounty(state, ERRAND, ['beta'], T0)).toEqual({
      ok: false,
      reason: 'already-running',
    });
  });

  it('demands exactly the crew size, never fewer and never more', () => {
    expect(dispatchBounty(run(), PATROL, ['alpha'], T0)).toEqual({
      ok: false,
      reason: 'wrong-crew-size',
    });
    expect(dispatchBounty(run(), PATROL, ['alpha', 'beta', 'gamma'], T0)).toEqual({
      ok: false,
      reason: 'wrong-crew-size',
    });
  });

  it('refuses the same character twice in one crew', () => {
    expect(dispatchBounty(run(), PATROL, ['alpha', 'alpha'], T0)).toEqual({
      ok: false,
      reason: 'duplicate-member',
    });
  });

  it('refuses a character the run does not own', () => {
    expect(dispatchBounty(run(), ERRAND, ['nobody'], T0)).toEqual({
      ok: false,
      reason: 'not-owned',
    });
  });

  it('refuses a mission the run has not unlocked', () => {
    expect(dispatchBounty(run({ clearedStages: 0 }), ERRAND, ['alpha'], T0)).toEqual({
      ok: false,
      reason: 'locked',
    });
  });
});

describe('setFormation, against a dispatched character', () => {
  it('refuses to field somebody who is away', () => {
    // ⚠️ The other half of the invariant, and the half most likely to be left out. Enforcing only
    // the dispatch side would let a player send somebody from the bench and then walk that same
    // character into the formation.
    const state = away(run(), ['alpha']);

    expect(setFormation(state, { front: ['alpha'], back: [] }, TEST_CHARACTERS)).toEqual({
      ok: false,
      reason: 'character-away',
    });
  });

  it('still fields anybody who is not away', () => {
    const state = away(run(), ['alpha']);
    const result = setFormation(state, { front: ['beta'], back: ['gamma'] }, TEST_CHARACTERS);

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

    expect(setFormation(collected.state, { front: ['alpha'], back: [] }, TEST_CHARACTERS).ok).toBe(
      true,
    );
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
      formation: { front: ['alpha'], back: [] },
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
