import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type GameState, type LoadResult, newGame, num, type RepairIssue } from '../core';
import { GameLoopService } from './game-loop.service';
import { SaveService } from './save.service';

/** A run earning gold per second, leaving every other rate at zero. */
function withGoldRate(state: GameState, rate: string): GameState {
  return { ...state, rates: { ...state.rates, gold: num(rate) } };
}

const T0 = 1_700_000_000_000;

class FakeSaveService {
  loadResult: LoadResult = { state: newGame({ seed: 1, nowMs: T0 }), issues: [] };
  readonly saved: GameState[] = [];

  /**
   * Every write and wipe, in order.
   *
   * A reset is only a reset if the slots are emptied *before* the fresh run is written — the
   * whole trap the method exists to avoid is an old run landing on top of a new one — so the
   * sequence is what has to be asserted, not just the final contents.
   */
  readonly operations: string[] = [];

  load(): Promise<LoadResult> {
    return Promise.resolve(this.loadResult);
  }

  save(state: GameState): Promise<void> {
    this.operations.push('save');
    this.saved.push(state);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.operations.push('clear');
    return Promise.resolve();
  }
}

function build(configure?: (saves: FakeSaveService) => void) {
  const saves = new FakeSaveService();
  configure?.(saves);

  TestBed.configureTestingModule({
    providers: [GameLoopService, { provide: SaveService, useValue: saves }],
  });

  return { saves, loop: TestBed.inject(GameLoopService) };
}

/** Reads the loop's authoritative state, failing loudly rather than asserting non-null. */
function stateOf(loop: GameLoopService): GameState {
  const state = loop.current;
  if (state === null) {
    throw new Error('expected the loop to have a loaded run');
  }
  return state;
}

describe('GameLoopService', () => {
  beforeEach(() => {
    // requestAnimationFrame is not driven here: these cover load, resume and persistence
    // policy. Frame pacing is timing-dependent and belongs in an e2e check.
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('is not ready before start', () => {
    const { loop } = build();

    expect(loop.isReady()).toBe(false);
    expect(loop.snapshot()).toBeNull();
  });

  it('publishes a snapshot once started', async () => {
    const { loop } = build();

    await loop.start(T0);

    expect(loop.isReady()).toBe(true);
    expect(loop.gold().toString()).toBe('0');
    loop.stop();
  });

  it('settles offline progress on start instead of replaying it', async () => {
    // One hour away at 250/s is exactly 900,000 — closed form, not 36,000 ticks.
    const { loop } = build((saves) => {
      saves.loadResult = {
        state: {
          ...withGoldRate(newGame({ seed: 1, nowMs: T0 }), '250'),
          lastTickAt: T0 - 3_600_000,
        },
        issues: [],
      };
    });

    await loop.start(T0);

    expect(loop.gold().eq('900000')).toBe(true);
    expect(loop.offlineReport()?.elapsedMs).toBe(3_600_000);
    loop.stop();
  });

  it('exposes repaired fields from a damaged save', async () => {
    const issues: RepairIssue[] = [{ field: 'gold', problem: 'unparseable', recovered: '0' }];
    const { loop } = build((saves) => {
      saves.loadResult = { state: newGame({ seed: 1, nowMs: T0 }), issues };
    });

    await loop.start(T0);

    expect(loop.saveIssues()).toEqual(issues);
    loop.stop();
  });

  it('persists on request', async () => {
    const { loop, saves } = build();
    await loop.start(T0);

    await loop.persist();

    expect(saves.saved).toHaveLength(1);
    loop.stop();
  });

  it('persists over a save it could not read, and says that it could not', async () => {
    // ⚠️ **This assertion is the inverse of the one it replaced, deliberately.** The loop used to
    // refuse to write while `fatal` was set, on the grounds that the bytes were probably a newer
    // build's save and would be good again after an update. The v0 reset retired that: a run that
    // plays normally and silently never writes anything down is the worse failure of the two, and
    // the one a player actually hits. `SaveService.load` has already tried the backup slot by
    // this point, so what gets overwritten is a save neither slot could read.
    const { loop, saves } = build((s) => {
      s.loadResult = {
        state: newGame({ seed: 1, nowMs: T0 }),
        issues: [],
        fatal: 'Save version 9 is newer than this build supports',
      };
    });
    await loop.start(T0);

    await loop.persist();

    expect(saves.saved).toHaveLength(1);
    // Still reported, because the difference between "my run vanished" and "my save could not be
    // read, here is a fresh one" is the difference between a bug report and a mystery.
    expect(loop.loadFailure()).toMatch(/newer than this build/);
    loop.stop();
  });

  it('does not start twice', async () => {
    const { loop } = build();

    await loop.start(T0);
    await loop.start(T0);

    // A second start would install a second rAF chain and double the sim rate.
    expect(loop.isReady()).toBe(true);
    loop.stop();
  });

  it('stops cleanly and tolerates a redundant stop', async () => {
    const { loop } = build();
    await loop.start(T0);

    loop.stop();

    expect(() => loop.stop()).not.toThrow();
  });

  it('does not persist before a run is loaded', async () => {
    const { loop, saves } = build();

    await loop.persist();

    expect(saves.saved).toHaveLength(0);
  });

  /**
   * The run reset, reachable from the settings screen since milestone 13.
   *
   * ⚠️ **Emptying the save slots is not a reset**, and every assertion here is about the half of
   * the job that is easy to leave out. This service holds the authoritative run in memory and
   * writes it back on autosave and on `visibilitychange`, so a reset that only cleared storage
   * would be undone by the app on its way out — the player sees a fresh run until the next
   * backgrounding hands the old one back.
   */
  describe('resetting the run', () => {
    /** A run with something to lose: gold in the wallet and a stage climbed. */
    async function progressedRun() {
      const { loop, saves } = build();
      await loop.start(T0);
      loop.apply((state) => ({
        ...withGoldRate(state, '10'),
        wallet: { ...state.wallet, gold: num('5000') },
        clearedStages: 12,
        stage: 13,
      }));
      return { loop, saves };
    }

    it('replaces the run in memory, not only on disk', async () => {
      const { loop } = await progressedRun();

      await loop.reset(T0);

      expect(stateOf(loop).wallet.gold.eq(0)).toBe(true);
      expect(stateOf(loop).clearedStages).toBe(0);
      expect(stateOf(loop).stage).toBe(1);
      expect(stateOf(loop).chapter).toBe(1);
      loop.stop();
    });

    it('leaves the fresh run playable, with a party and the base income', async () => {
      // `newGame` cannot seed either: `core/` cannot see the content that decides who the starters
      // are or what a cleared ladder pays. A reset that skipped the repairs would hand back a run
      // with nobody in it.
      const { loop } = await progressedRun();

      await loop.reset(T0);

      expect(stateOf(loop).roster.length).toBeGreaterThan(0);
      expect(loop.formation().front.length + loop.formation().back.length).toBeGreaterThan(0);
      loop.stop();
    });

    it('empties both slots before writing the new run', async () => {
      const { loop, saves } = await progressedRun();
      saves.operations.length = 0;

      await loop.reset(T0);

      expect(saves.operations).toEqual(['clear', 'save']);
      loop.stop();
    });

    it('writes the fresh run rather than the one it replaced', async () => {
      // The assertion that would fail if the reset stopped at clearing storage: whatever this
      // service holds is what the next write puts back.
      const { loop, saves } = await progressedRun();

      await loop.reset(T0);
      await loop.persist();

      const written = saves.saved[saves.saved.length - 1];
      expect(written.wallet.gold.eq(0)).toBe(true);
      expect(written.clearedStages).toBe(0);
      loop.stop();
    });

    it('takes down notices that describe the run it deleted', async () => {
      const { loop } = build((saves) => {
        saves.loadResult = {
          state: { ...withGoldRate(newGame({ seed: 1, nowMs: T0 }), '10'), lastTickAt: T0 - 3.6e6 },
          issues: [{ field: 'gold', problem: 'unparseable', recovered: '0' }],
          fatal: 'Save version 9 is newer than this build supports',
        };
      });
      await loop.start(T0);
      expect(loop.offlineReport()).not.toBeNull();

      await loop.reset(T0);

      expect(loop.offlineReport()).toBeNull();
      expect(loop.saveIssues()).toEqual([]);
      expect(loop.loadFailure()).toBeUndefined();
      loop.stop();
    });

    it('leaves the loop running, so the new run accrues and persists like any other', async () => {
      const { loop } = await progressedRun();

      await loop.reset(T0);
      // A fresh run earns nothing until a stage is cleared, so give it a rate to measure. Half a
      // second because five 100ms slices is the per-frame ceiling — a whole second would be the
      // backlog guard rather than the accrual.
      loop.apply((state) => withGoldRate(state, '10'));
      loop.advance(500, T0 + 500);

      expect(stateOf(loop).wallet.gold.eq('5')).toBe(true);
      loop.stop();
    });
  });
});

describe('GameLoopService time accounting', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  function startedLoop(goldPerSec: string) {
    const saves = new FakeSaveService();
    saves.loadResult = {
      state: withGoldRate(newGame({ seed: 1, nowMs: T0 }), goldPerSec),
      issues: [],
    };
    TestBed.configureTestingModule({
      providers: [GameLoopService, { provide: SaveService, useValue: saves }],
    });
    return { saves, loop: TestBed.inject(GameLoopService) };
  }

  it('accrues at the configured rate across frames', async () => {
    const { loop } = startedLoop('10');
    await loop.start(T0);

    // Ten 100ms frames = one second.
    for (let i = 1; i <= 10; i++) {
      loop.advance(100, T0 + i * 100);
    }

    expect(stateOf(loop).wallet.gold.eq('10')).toBe(true);
    loop.stop();
  });

  it('advances lastTickAt as it simulates, so foreground time is accounted for', () => {
    const { loop } = startedLoop('1');

    return loop.start(T0).then(() => {
      for (let i = 1; i <= 10; i++) {
        loop.advance(100, T0 + i * 100);
      }

      expect(stateOf(loop).lastTickAt).toBe(T0 + 1000);
      loop.stop();
    });
  });

  it('does not pay twice for time already simulated in the foreground', async () => {
    // The regression this exists for. `tick()` never touches `lastTickAt` because core has
    // no clock. If the loop does not advance it either, `lastTickAt` stays at load time and
    // the next resume re-pays the whole session — an exploit that scales with how long the
    // player has had the app open.
    const { loop } = startedLoop('1');
    await loop.start(T0);

    // Sixty seconds of active foreground play.
    for (let i = 1; i <= 600; i++) {
      loop.advance(100, T0 + i * 100);
    }
    const afterForeground = stateOf(loop).wallet.gold;

    // Then the player switches away and returns 10 seconds later.
    loop.settle(T0 + 60_000 + 10_000);

    // 60s ticked + 10s away = 70 gold. A double-count would show ~130.
    expect(stateOf(loop).wallet.gold.eq('70')).toBe(true);
    expect(afterForeground.eq('60')).toBe(true);
    loop.stop();
  });

  it('does not let a trivial settle overwrite a real offline report', async () => {
    // Found by running the app: the page loads, settles a genuine hour away, then the tab
    // regains focus a second later and settles again. Without a floor, that second settle
    // replaces "you earned 3,600 gold" with "you earned 1 gold" before it can be read.
    const { loop } = startedLoop('1');
    await loop.start(T0);
    loop.settle(T0 + 3_600_000);
    const realReport = loop.offlineReport();

    loop.settle(T0 + 3_600_000 + 1_000);

    expect(loop.offlineReport()).toBe(realReport);
    expect(loop.offlineReport()?.elapsedMs).toBe(3_600_000);
    loop.stop();
  });

  it('still credits the gold for a settle too short to report', async () => {
    // The summary is suppressed, not the earnings.
    const { loop } = startedLoop('1');
    await loop.start(T0);

    loop.settle(T0 + 5_000);

    expect(stateOf(loop).wallet.gold.eq('5')).toBe(true);
    expect(loop.offlineReport()).toBeNull();
    loop.stop();
  });

  it('ignores a non-positive or non-finite delta', async () => {
    const { loop } = startedLoop('1');
    await loop.start(T0);

    for (const delta of [0, -500, Number.NaN, Infinity]) {
      loop.advance(delta, T0);
    }

    expect(stateOf(loop).wallet.gold.toString()).toBe('0');
    loop.stop();
  });

  it('drops a backlog instead of spiralling, without claiming the dropped time later', async () => {
    const { loop } = startedLoop('1');
    await loop.start(T0);

    // A 10-second stall in one frame: capped at MAX_STEPS_PER_FRAME steps.
    loop.advance(10_000, T0 + 10_000);

    expect(stateOf(loop).wallet.gold.eq('0.5')).toBe(true);
    // Time is marked as covered, so a later resume does not re-pay the dropped backlog.
    expect(stateOf(loop).lastTickAt).toBe(T0 + 10_000);
    loop.stop();
  });
});
