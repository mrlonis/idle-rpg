import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type GameState, newGame, num, startDescent } from '../core';
import { DESCENT, FACTIONS_IN_ORDER } from './content';
import { DescentService } from './descent.service';
import { GameLoopService } from './game-loop.service';

/**
 * 04:00 UTC on a fixed day, so `periodIndex` resolves to a stable index.
 *
 * The clock is frozen rather than mocked away: this service reads `Date.now()` inside a `computed`
 * — which is safe here and unsafe in `QuestsService` — because nothing about a Descent day *rolls*.
 * A run carries the day it belongs to, so "is this today's run" is a comparison rather than a write.
 */
const NOON = Date.UTC(2026, 5, 12, 12, 0, 0);

/** A run that has cleared enough of the campaign to open the mode, several times over. */
function opened(over: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0xd35ce7, nowMs: NOON }), clearedStages: 250, ...over };
}

/**
 * The run in flight, or a thrown error.
 *
 * Helpers rather than non-null assertions, because the lint config forbids the assertion *and* the
 * cast that would stand in for it — and because narrowing here means every test below reads a real
 * `DescentRun` instead of restating that one exists.
 */
function runOf(state: GameState): NonNullable<GameState['descent']> {
  const run = state.descent;
  if (run === null) {
    throw new Error('the run is not in flight');
  }
  return run;
}

/** The authoritative run the service resolves a fight against. */
function currentOf(game: FakeGameLoop): GameState {
  if (game.current === null) {
    throw new Error('the run has not loaded');
  }
  return game.current;
}

class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(opened());
  current: GameState | null = this.snapshot();
  readonly persisted: number[] = [];

  apply(update: (state: GameState) => GameState): void {
    const next = update(this.current ?? opened());
    this.current = next;
    this.snapshot.set(next);
  }

  persist(): Promise<void> {
    this.persisted.push(1);
    return Promise.resolve();
  }
}

function make(configure?: (game: FakeGameLoop) => void) {
  const game = new FakeGameLoop();
  configure?.(game);

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: GameLoopService, useValue: game }],
  });

  return { game, service: TestBed.inject(DescentService) };
}

describe('DescentService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOON);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("the day's draw", () => {
    it('admits exactly the authored number of factions, all of them shipped', () => {
      const { service } = make();
      const shipped = new Set(FACTIONS_IN_ORDER.map((faction) => faction.id));

      expect(service.lock()).toHaveLength(DESCENT.lockFactions);
      for (const faction of service.lock()) {
        expect(shipped.has(faction), faction).toBe(true);
      }
    });

    it('resolves the same lock twice in a row and a different one tomorrow', () => {
      // ⚠️ Rerolling is impossible rather than merely detectable: there is nothing stored to re-take.
      const { service } = make();
      const today = [...service.lock()];

      expect([...service.lock()]).toEqual(today);

      vi.setSystemTime(NOON + 86_400_000);
      TestBed.resetTestingModule();
      const tomorrow = make().service.lock();

      expect([...tomorrow]).not.toEqual(today);
    });

    it('draws one board per fight and names the level each is fought at', () => {
      const { service } = make();
      const rows = service.fightRows();

      expect(rows).toHaveLength(service.fights);
      expect(rows.map((row) => row.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      // The line climbs across the run, which is what makes the last fight the fight.
      expect(rows[8].level).toBeGreaterThan(rows[0].level);
      for (const row of rows) {
        expect(row.name.length, `fight ${row.index}`).toBeGreaterThan(0);
      }
    });

    it('reports nothing before the run has loaded', () => {
      const { service } = make((game) => {
        game.snapshot.set(null);
        game.current = null;
      });

      expect(service.lock()).toEqual([]);
      expect(service.fightRows()).toEqual([]);
      expect(service.run()).toBeNull();
    });
  });

  describe('where the run stands', () => {
    it('is locked until the campaign has come far enough, and names what is owed', () => {
      const { service } = make((game) => {
        const state = opened({ clearedStages: 0 });
        game.snapshot.set(state);
        game.current = state;
      });

      expect(service.phase()).toBe('locked');
      expect(service.chaptersNeeded()).toBe(DESCENT.unlockChapters);
    });

    it('is available once open and has not been started', () => {
      const { service } = make();

      expect(service.phase()).toBe('available');
      expect(service.chaptersNeeded()).toBe(0);
    });

    it('moves to ready when a run is started, and back to available tomorrow', () => {
      // ⚠️ **The whole daily reset.** A run dated to yesterday is simply not today's run — no roll
      // pass, no expiry flag, nothing to reconcile.
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });

      expect(service.phase()).toBe('ready');

      vi.setSystemTime(NOON + 86_400_000);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: GameLoopService, useValue: game }],
      });

      expect(TestBed.inject(DescentService).phase()).toBe('available');
    });

    it('refuses a second run on the same day', () => {
      const { service } = make();

      expect(service.start({ front: ['a'], back: [] })).toBe(true);
      expect(service.start({ front: ['b'], back: [] })).toBe(false);
    });

    it('refuses to start at all while the mode is locked', () => {
      const { service } = make((game) => {
        const state = opened({ clearedStages: 0 });
        game.snapshot.set(state);
        game.current = state;
      });

      expect(service.start({ front: ['a'], back: [] })).toBe(false);
    });

    it('persists immediately rather than waiting for the autosave', () => {
      // A run started and then lost to a backgrounded app would hand the player a fresh day.
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });

      expect(game.persisted.length).toBeGreaterThan(0);
    });
  });

  describe('the card offer', () => {
    it('is empty until a card is owed', () => {
      const { service } = make();
      expect(service.offer()).toEqual([]);

      service.start({ front: ['a'], back: [] });
      expect(service.offer()).toEqual([]);
    });

    it('offers three once a fight has been won, each named by its rank', () => {
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });
      game.apply((state) => ({
        ...state,
        descent: { ...runOf(state), cleared: 1 },
      }));

      const offer = service.offer();
      expect(offer).toHaveLength(DESCENT.offer);
      for (const card of offer) {
        expect(card.name, card.id).toContain(card.rankName);
        expect(card.effects.length, card.id).toBeGreaterThan(0);
      }
    });

    it('takes only a card that is actually on offer', () => {
      // ⚠️ Re-derived against the authoritative run rather than trusted off the screen. The only way
      // to reach a card that is not on today's offer is a stale render, and the honest answer to a
      // stale render is nothing at all.
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });
      game.apply((state) => ({
        ...state,
        descent: { ...runOf(state), cleared: 1 },
      }));

      service.take('not-a-card:9');
      expect(service.held()).toEqual([]);

      service.take(service.offer()[0].id);
      expect(service.held()).toHaveLength(1);
      expect(service.phase()).toBe('ready');
    });

    it('reports what the run is carrying, per faction', () => {
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });
      game.apply((state) => ({
        ...state,
        descent: { ...runOf(state), cleared: 1 },
      }));
      service.take(service.offer()[0].id);

      const card = service.held()[0];
      const paid = service.bonusFor(card.faction ?? 'human');
      const others = service.bonusFor('nobody');

      expect(Object.keys(paid).length).toBeGreaterThan(0);
      if (card.faction !== null) {
        // A faction family pays its own faction and nobody else.
        expect(others).toEqual({});
      }
    });
  });

  describe('what a run carries into its next fight', () => {
    it('opens everybody at full health before a fight has been won', () => {
      const { service } = make();
      service.start({ front: ['a'], back: ['b'] });

      expect([...service.opening().entries()]).toEqual([
        ['a', { health: 1, energy: 0 }],
        ['b', { health: 1, energy: 0 }],
      ]);
    });

    it('carries the fractions the run recorded, and nobody who has fallen', () => {
      const { service, game } = make();
      service.start({ front: ['a'], back: ['b'] });
      game.apply((state) => ({
        ...state,
        descent: {
          ...runOf(state),
          cleared: 1,
          party: { front: ['a'], back: [] },
          health: { a: 0.3 },
          energy: { a: 55 },
        },
      }));

      expect([...service.opening().entries()]).toEqual([['a', { health: 0.3, energy: 55 }]]);
    });
  });

  describe('the fight it hands the battle path', () => {
    it('is null until a run is started and while a card is owed', () => {
      const { service, game } = make();
      expect(service.target(currentOf(game))).toBeNull();

      service.start({ front: ['a'], back: [] });
      expect(service.target(currentOf(game))?.fight).toBe(1);

      game.apply((state) => ({
        ...state,
        descent: { ...runOf(state), cleared: 1 },
      }));
      expect(service.target(currentOf(game))).toBeNull();
    });

    it('carries no rates and no first-clear crystals', () => {
      // ⚠️ Both would be how this mode quietly acquired a permanent income raise or a payout routed
      // through the campaign's own path.
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });
      const target = service.target(currentOf(game));

      expect(target?.stage.rates).toEqual({});
      expect(target?.stage.firstClearSummons).toBe(0);
      expect(num(target?.stage.reward.gold ?? 0).gt(0)).toBe(true);
    });

    it('resolves the fight from the state it is handed, not from the sampled snapshot', () => {
      // The call that decides which fight a run is paid for. A stale read is a run banking the same
      // fight twice.
      const { service, game } = make();
      service.start({ front: ['a'], back: [] });
      const authoritative = startDescent(
        { ...currentOf(game), descent: null },
        DESCENT,
        service.day(),
        { front: ['a'], back: [] },
      );
      const advanced: GameState = {
        ...authoritative,
        descent: {
          ...runOf(authoritative),
          cleared: 2,
          cards: [service.offer()[0]?.id ?? 'whetstone:0', 'whetstone:1'],
        },
      };

      expect(service.target(advanced)?.fight).toBe(3);
    });
  });
});
