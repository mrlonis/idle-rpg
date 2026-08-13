import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { type ExpeditionBattleOutcome, type GameState, newGame, num } from '../core';
import { CHARACTERS } from '../data';
import { CAMPAIGN_LEVELS, EXPEDITION_LIST } from './content';
import { ExpeditionService } from './expedition.service';
import { GameLoopService } from './game-loop.service';

const T0 = 1_700_000_000_000;

/** The first shipped map, which every walk below plays. */
const FORD = EXPEDITION_LIST[0];

/** A run deep enough that the mode is open several times over. */
function opened(over: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0xe7ed1, nowMs: T0 }), clearedStages: 250, ...over };
}

/** The enemy level of the hardest stage a run at 250 clears has beaten. */
const ANCHOR = CAMPAIGN_LEVELS[249];

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

  return { game, service: TestBed.inject(ExpeditionService) };
}

/** A five from the shipped roster: the first two of any role in front, three behind. */
function crew() {
  const ids = CHARACTERS.map((character) => character.id);
  return { front: ids.slice(0, 2), back: ids.slice(2, 5) };
}

/** A clean win for `party`, everybody standing at the given share of health. */
function victory(party: { front: string[]; back: string[] }, share = 0.6): ExpeditionBattleOutcome {
  return {
    outcome: 'victory',
    reward: { gained: { gold: num(100) } },
    final: [...party.front, ...party.back].map((defId) => ({
      side: 'ally',
      defId,
      hp: num(share * 100),
      maxHp: num(100),
      energy: 10,
    })),
  };
}

/** The authoritative state, narrowed — the lint config forbids the non-null assertion. */
function currentOf(game: FakeGameLoop): GameState {
  if (game.current === null) {
    throw new Error('the run has not loaded');
  }
  return game.current;
}

/** Starts an attempt on the Ford and clears camp `a`, which is the mode's opening walk. */
function walked(service: ExpeditionService, game: FakeGameLoop) {
  service.start(FORD.id, crew());
  const hit = { map: FORD, camp: FORD.camps.find((camp) => camp.cell === 'a') ?? FORD.camps[0] };
  game.apply((state) => service.settle(state, hit, victory(crew())));
}

describe('ExpeditionService', () => {
  describe('the gate and the sequence', () => {
    it('is locked below the unlock chapter and open past it', () => {
      const locked = make((game) => {
        game.snapshot.set(opened({ clearedStages: 20 }));
      });
      expect(locked.service.isUnlocked()).toBe(false);
      expect(locked.service.chaptersNeeded()).toBeGreaterThan(0);

      const { service } = make();
      expect(service.isUnlocked()).toBe(true);
      expect(service.mapRows()[0].status).toBe('open');
    });

    it('opens each later map only when the one before it is completed', () => {
      const { service } = make();
      expect(service.mapOpen(EXPEDITION_LIST[1].id)).toBe(false);
      expect(service.mapRows()[1].status).toBe('locked');
    });
  });

  describe('starting and fighting', () => {
    it('copies the crew in, and pays the start-open chest once ever', () => {
      const { game, service } = make();
      const before = currentOf(game).wallet.summons.toNumber();

      expect(service.start(FORD.id, crew())).toBe(true);
      const run = service.runOn(FORD.id);
      expect(run?.party).toEqual(crew());
      // Chest 1 sits inside the Ford's starting region: 150 crystals, banked on the spot.
      expect(currentOf(game).wallet.summons.toNumber()).toBe(before + 150);

      service.abandon();
      service.start(FORD.id, crew());
      // The ledger, not the attempt, gates the pay.
      expect(currentOf(game).wallet.summons.toNumber()).toBe(before + 150);
      expect(game.persisted.length).toBeGreaterThan(0);
    });

    it('refuses a map whose turn has not come', () => {
      const { service } = make();
      expect(service.start(EXPEDITION_LIST[1].id, crew())).toBe(false);
    });

    it('resolves a queued, fightable camp into a stage and nothing else', () => {
      const { game, service } = make();
      service.start(FORD.id, crew());

      // Nothing queued: nothing to fight.
      expect(service.target(currentOf(game))).toBeNull();

      // The boss is behind the lanes and cannot be queued yet.
      service.queue('f');
      expect(service.target(currentOf(game))).toBeNull();

      service.queue('a');
      const target = service.target(currentOf(game));
      expect(target?.stage.id).toBe(`expedition:${FORD.id}:a`);
      expect(target?.stage.level).toBe(ANCHOR - 12);
      expect(target?.stage.rates).toEqual({});
      expect(target?.stage.firstClearSummons).toBe(0);
    });

    it('banks a win: the camp, the survivors, the crystals — and a card owed', () => {
      const { game, service } = make();
      const before = currentOf(game).wallet.summons.toNumber();
      walked(service, game);

      const run = service.runOn(FORD.id);
      expect(run?.camps).toEqual(['a']);
      expect(service.staminaSpent(FORD.id)).toBe(2);
      // The camp's 150, on top of the start chest's 150.
      expect(currentOf(game).wallet.summons.toNumber()).toBe(before + 300);
      expect(service.cardsOwed(FORD.id)).toBe(1);
      expect(service.statusOn(FORD.id)).toBe('choosing');
      // A fight is refused while the card is owed.
      service.queue('c');
      expect(service.target(currentOf(game))).toBeNull();
    });

    it('draws the tiles the way the rules read them', () => {
      const { game, service } = make();
      service.start(FORD.id, crew());
      const flat = service.tiles(FORD.id).flat();

      const campA = flat.find((tile) => tile.kind === 'camp' && tile.cell === 'a');
      expect(campA?.camp?.fightable).toBe(true);
      expect(campA?.camp?.level).toBe(ANCHOR - 12);
      const boss = flat.find((tile) => tile.kind === 'camp' && tile.cell === 'f');
      expect(boss?.camp?.boss).toBe(true);
      expect(boss?.camp?.fightable).toBe(false);
      const chest1 = flat.find((tile) => tile.kind === 'chest' && tile.cell === '1');
      expect(chest1?.chest?.taken).toBe(true);

      walked(service, game);
      const after = service.tiles(FORD.id).flat();
      expect(after.find((tile) => tile.cell === 'a')?.camp?.cleared).toBe(true);
      // Chest 2 sits behind camp a and paid the moment the region grew over it.
      expect(after.find((tile) => tile.cell === '2')?.chest?.taken).toBe(true);
    });
  });

  describe('the cards', () => {
    it('offers only cards the standing crew can wear, and only while one is owed', () => {
      const { game, service } = make();
      service.start(FORD.id, crew());
      expect(service.offer(FORD.id)).toEqual([]);

      walked(service, game);
      const offer = service.offer(FORD.id);
      expect(offer.length).toBeGreaterThan(0);
      const factions = new Set<string>(
        CHARACTERS.filter((character) =>
          [...crew().front, ...crew().back].includes(character.id),
        ).map((character) => character.faction),
      );
      for (const card of offer) {
        expect(card.faction === null || factions.has(card.faction), card.name).toBe(true);
      }
    });

    it('takes only a card that is genuinely on offer, and unblocks the next fight', () => {
      const { game, service } = make();
      walked(service, game);

      service.take('not-a-card:0');
      expect(service.cardsOwed(FORD.id)).toBe(1);

      const [first] = service.offer(FORD.id);
      service.take(first.id);
      expect(service.cardsOwed(FORD.id)).toBe(0);
      expect(service.held(FORD.id).map((card) => card.id)).toEqual([first.id]);
      expect(service.statusOn(FORD.id)).toBe('ready');
    });
  });

  describe('completing and walking away', () => {
    it('refuses the exit while the boss stands, and pays completion once ever', () => {
      const { game, service } = make();
      walked(service, game);
      expect(service.exitOpen(FORD.id)).toBe(false);
      expect(service.complete(FORD.id)).toBe(false);

      const [card] = service.offer(FORD.id);
      service.take(card.id);
      const boss = FORD.camps.find((camp) => camp.boss) ?? FORD.camps[0];
      game.apply((state) => service.settle(state, { map: FORD, camp: boss }, victory(crew())));

      expect(service.exitOpen(FORD.id)).toBe(true);
      const before = currentOf(game).wallet.summons.toNumber();
      const emblemsBefore = currentOf(game).wallet.emblem.toNumber();
      expect(service.complete(FORD.id)).toBe(true);
      expect(currentOf(game).wallet.summons.toNumber()).toBe(before + 1500);
      expect(currentOf(game).wallet.emblem.toNumber()).toBe(emblemsBefore + 50);
      expect(service.runOn(FORD.id)).toBeNull();
      expect(service.recordFor(FORD.id)?.completed).toBe(true);
      // Which is what opens the second map.
      expect(service.mapOpen(EXPEDITION_LIST[1].id)).toBe(true);
    });

    it('abandons for free and leaves the ledger where it was', () => {
      const { game, service } = make();
      walked(service, game);
      const before = currentOf(game).wallet.summons.toNumber();

      service.abandon();
      expect(service.runOn(FORD.id)).toBeNull();
      expect(currentOf(game).wallet.summons.toNumber()).toBe(before);
      expect(service.recordFor(FORD.id)?.camps).toEqual(['a']);
    });
  });
});
