import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { formationMembers, type GameState, newGame, num, startRarityIndex } from '../core';
import { STAGES, STARTER_FORMATION } from '../data';
import { BattleService, type PlaybackSpeed } from './battle.service';
import { CHARACTERS_BY_ID } from './content';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/** A run holding some gold, leaving every other currency at zero. */
function withGold(state: GameState, gold: string): GameState {
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

/** A run earning gold per second, leaving every other rate at zero. */
function withGoldRate(state: GameState, rate: string): GameState {
  return { ...state, rates: { ...state.rates, gold: num(rate) } };
}

const T0 = 1_700_000_000_000;

/**
 * A run with the starter party owned and fielded.
 *
 * Battles are fought by the roster now, so a state without one sends nobody and loses instantly.
 * Every spec below that expects a fight to happen needs a party in the state, which is exactly
 * the coupling that makes `simulateBattle` treating an empty party as a defeat the honest
 * behaviour rather than a trap.
 */
function withStarters(state: GameState): GameState {
  const starterIds = formationMembers(STARTER_FORMATION);
  const roster = starterIds.map((defId) => ({
    defId,
    rarity: startRarityIndex(CHARACTERS_BY_ID.get(defId)?.tier ?? 'common'),
    level: 1,
    copies: 0,
  }));
  return { ...state, roster, formation: STARTER_FORMATION };
}

/**
 * Stands in for the game loop, holding the run and applying transforms exactly as the real one
 * does. The animator only needs an owner of the state; wiring up saves, `requestAnimationFrame`
 * and a real sim loop would test those instead of playback.
 */
class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(null);
  readonly applied: GameState[] = [];

  get current(): GameState | null {
    return this.snapshot();
  }

  apply(update: (state: GameState) => GameState): void {
    const state = this.snapshot();
    if (state === null) {
      return;
    }
    const next = update(state);
    this.snapshot.set(next);
    this.applied.push(next);
  }
}

function build(state: GameState | null = newGame({ seed: 0xc0ffee, nowMs: T0 })) {
  const loop = new FakeGameLoop();
  loop.snapshot.set(state === null ? null : withStarters(state));

  // Reset up front rather than only in `afterEach`, so a test can stand up two independent
  // animators — comparing playback speeds needs two of them narrating the same battle.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [BattleService, RosterService, { provide: GameLoopService, useValue: loop }],
  });

  return { loop, battles: TestBed.inject(BattleService) };
}

/** Steps the animator in fixed slices, the way its timer would. */
function run(battles: BattleService, ms: number, stepMs = 100): void {
  const steps = Math.round(ms / stepMs);
  for (let step = 1; step <= steps; step++) {
    battles.advance(T0 + step * stepMs);
  }
}

/** Starts a fight and plays it to the end. */
function fightToTheEnd(battles: BattleService): void {
  battles.fight(T0);
  run(battles, (battles.result()?.durationMs ?? 0) + 1_000);
}

/**
 * The animator's own timer is never started in these specs. `advance` is driven directly, so
 * playback is deterministic rather than dependent on how long the test took to run — the same
 * reason `advance` and `fight` both take the clock as a parameter.
 */
describe('BattleService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('before anything is fought', () => {
    it('shows no battle, and the battle screen is closed', () => {
      const { battles } = build();

      expect(battles.result()).toBeNull();
      expect(battles.stage()).toBeNull();
      expect(battles.combatants()).toEqual([]);
      expect(battles.isFighting()).toBe(false);
      expect(battles.isOpen()).toBe(false);
    });

    it('never starts a fight on its own, however long it is left alone', () => {
      // The heart of this milestone: nothing happens without the player. An animator that
      // begins a battle on a timer is what the previous shape got wrong.
      const { loop, battles } = build();

      run(battles, 600_000);

      expect(battles.result()).toBeNull();
      expect(battles.isFighting()).toBe(false);
      expect(loop.applied).toEqual([]);
    });

    it('names the stage the player would enter', () => {
      const { battles } = build();

      expect(battles.nextStage()).toEqual({ name: STAGES[0].name, number: 1 });
    });

    it('idles harmlessly until the run has loaded', () => {
      const { battles } = build(null);

      battles.fight(T0);
      run(battles, 5_000);

      expect(battles.result()).toBeNull();
    });
  });

  describe('starting a fight', () => {
    it('resolves the battle, opens the screen, and begins narrating it', () => {
      const { battles } = build();

      battles.fight(T0);

      expect(battles.result()).not.toBeNull();
      expect(battles.isFighting()).toBe(true);
      expect(battles.isOpen()).toBe(true);
      expect(battles.stage()).toEqual({ name: STAGES[0].name, number: 1 });
    });

    it('opens with everyone at full HP and the outcome withheld', () => {
      const { battles } = build();

      battles.fight(T0);

      const combatants = battles.combatants();
      expect(combatants.length).toBeGreaterThan(0);
      for (const combatant of combatants) {
        expect(combatant.fraction, combatant.name).toBe(1);
        expect(combatant.isDown, combatant.name).toBe(false);
      }
      expect(battles.outcome()).toBeNull();
    });

    it('ignores a second tap while a battle is already playing', () => {
      // A double tap must not start two fights or abandon the one on screen halfway through.
      const { battles } = build();

      battles.fight(T0);
      const opening = battles.result();
      run(battles, 500);
      battles.fight(T0 + 500);

      expect(battles.result()).toBe(opening);
    });
  });

  describe('while the fight plays', () => {
    it('touches nothing in the run until the animation finishes', () => {
      // Applying up front would spoil every battle: gold and the income rate would both jump the
      // instant the player tapped, announcing the outcome before the first blow landed.
      const { loop, battles } = build();

      battles.fight(T0);
      run(battles, (battles.result()?.durationMs ?? 0) - 200);

      expect(battles.outcome()).toBeNull();
      expect(loop.applied).toEqual([]);
      expect(loop.current?.battleCount).toBe(0);
    });

    it('narrates the log gradually rather than all at once', () => {
      const { battles } = build();

      battles.fight(T0);
      const atStart = battles.recentEvents().length;
      run(battles, 1_000);

      expect(atStart).toBe(0);
      expect(battles.recentEvents().length).toBeGreaterThan(0);
      expect(battles.outcome()).toBeNull();
    });

    it('does not blast through a fight after a long gap', () => {
      // A backgrounded tab throttles the timer and returning delivers one enormous delta. Without
      // the step clamp the whole log would drain at once and the player would miss the battle.
      const { battles } = build();

      battles.fight(T0);
      battles.advance(T0 + 10 * 60 * 1000);

      expect(battles.outcome()).toBeNull();
      expect(battles.isFighting()).toBe(true);
    });

    it.each([0, -1_000, Number.NaN])('ignores a step of %p', (delta) => {
      const { battles } = build();

      battles.fight(T0);
      run(battles, 500);
      const before = battles.recentEvents().length;
      battles.advance(T0 + 500 + delta);

      expect(battles.recentEvents().length).toBe(before);
    });
  });

  describe('playback speed', () => {
    it('gets further through the same fight at 4x', () => {
      // The claim the whole sim/render split is for: playback speed is a multiplication in
      // `advance`, not a second combat implementation. Both runs narrate a bit-for-bit identical
      // battle — the fast one is simply further into it after the same amount of real time.
      const slow = narrateOpening(1);
      const fast = narrateOpening(4, slow.windowMs);

      expect(fast.totalMs).toBe(slow.totalMs);
      expect(fast.events).toBe(slow.events);
      expect(fast.battles.outcome()).toBeNull();
      expect(fast.remaining).toBeLessThan(slow.remaining);
    });

    it('takes a speed change mid-fight without restarting the fight', () => {
      const { battles } = build();

      battles.fight(T0);
      const opening = battles.result();
      run(battles, 500);
      battles.setSpeed(4);
      run(battles, 500);

      expect(battles.result()).toBe(opening);
      expect(battles.playbackSpeed()).toBe(4);
    });
  });

  describe('when the fight ends', () => {
    it('banks the result and the outcome together', () => {
      const { loop, battles } = build();

      fightToTheEnd(battles);

      expect(battles.outcome()).toBe('victory');
      expect(loop.applied).toHaveLength(1);
      expect(loop.current?.battleCount).toBe(1);
    });

    it('returns to idle and stays there', () => {
      const { loop, battles } = build();

      fightToTheEnd(battles);
      const afterFirst = battles.result();
      run(battles, 600_000);

      expect(battles.isFighting()).toBe(false);
      // No second battle starts on its own, no matter how long the player leaves it.
      expect(battles.result()).toBe(afterFirst);
      expect(loop.applied).toHaveLength(1);
    });

    it('holds the final board on screen so the player can read it', () => {
      const { battles } = build();

      fightToTheEnd(battles);

      expect(battles.combatants().length).toBeGreaterThan(0);
      expect([...battles.foesFront(), ...battles.foesBack()].every((foe) => foe.isDown)).toBe(true);
    });

    it('raises idle income on a win, from a standing start of zero', () => {
      const { loop, battles } = build();

      expect(loop.current?.rates.gold.eq(0)).toBe(true);
      fightToTheEnd(battles);

      expect(loop.current?.rates.gold.eq(STAGES[0].rates.gold)).toBe(true);
      expect(loop.current?.wallet.gold.eq(STAGES[0].reward.gold)).toBe(true);
    });

    it('points the next fight at the following stage after a win', () => {
      const { battles } = build();

      fightToTheEnd(battles);

      expect(battles.nextStage()).toEqual({ name: STAGES[1].name, number: 2 });
      // The board still names the stage that was just fought.
      expect(battles.stage()).toEqual({ name: STAGES[0].name, number: 1 });
    });

    it('lets the player go again, on the next stage', () => {
      const { loop, battles } = build();

      fightToTheEnd(battles);
      const first = battles.result();
      battles.fight(T0);

      expect(battles.result()).not.toBe(first);
      expect(battles.stage()).toEqual({ name: STAGES[1].name, number: 2 });
      expect(loop.applied).toHaveLength(1);
    });

    it('stays on the battle screen so the player can read the result', () => {
      const { battles } = build();

      fightToTheEnd(battles);

      expect(battles.isOpen()).toBe(true);
      expect(battles.isFighting()).toBe(false);
    });

    it('keeps rows from one battle from being mistaken for rows in the next', () => {
      // Slot keys repeat every battle, so the view needs a battle-scoped identity or the HP bar
      // animates from the previous fight's value.
      const { battles } = build();

      fightToTheEnd(battles);
      const firstKeys = battles.combatants().map((c) => c.viewKey);
      battles.fight(T0);

      expect(battles.combatants().map((c) => c.viewKey)).not.toEqual(firstKeys);
      expect(battles.combatants().map((c) => c.key)).toContain('ally-0');
    });
  });

  describe('closing the battle screen', () => {
    it('returns to home and clears the board behind it', () => {
      const { battles } = build();

      fightToTheEnd(battles);
      battles.close();

      expect(battles.isOpen()).toBe(false);
      expect(battles.result()).toBeNull();
      expect(battles.stage()).toBeNull();
      expect(battles.outcome()).toBeNull();
      expect(battles.combatants()).toEqual([]);
      expect(battles.recentEvents()).toEqual([]);
    });

    it('refuses while a fight is still playing', () => {
      // Leaving mid-battle would discard a fight the player is moments from being paid for. A
      // battle is seconds long and can be sped up, so there is nothing to escape from.
      const { battles } = build();

      battles.fight(T0);
      run(battles, 500);
      battles.close();

      expect(battles.isOpen()).toBe(true);
      expect(battles.result()).not.toBeNull();
    });

    it('keeps everything the run earned', () => {
      // Closing is a navigation, not an undo. The result was banked when the animation finished.
      const { loop, battles } = build();

      fightToTheEnd(battles);
      const banked = loop.current;
      battles.close();

      expect(loop.current).toBe(banked);
      expect(loop.current?.stage).toBe(2);
      expect(loop.current?.rates.gold.eq(STAGES[0].rates.gold)).toBe(true);
    });

    it('lets the player go straight back in', () => {
      const { battles } = build();

      fightToTheEnd(battles);
      battles.close();
      battles.fight(T0);

      expect(battles.isOpen()).toBe(true);
      expect(battles.stage()).toEqual({ name: STAGES[1].name, number: 2 });
    });

    it('is harmless when nothing is open', () => {
      const { battles } = build();

      battles.close();

      expect(battles.isOpen()).toBe(false);
    });
  });

  describe('resuming a run', () => {
    it('fights the stage the run left off on', () => {
      const { battles } = build({
        ...withGold(newGame({ seed: 0xc0ffee, nowMs: T0 }), '5000'),
        stage: 3,
        battleCount: 42,
      });

      battles.fight(T0);

      expect(battles.stage()).toEqual({ name: STAGES[2].name, number: 3 });
    });

    it('pulls a stage number past the shipped content back into range', () => {
      const { battles } = build({ ...newGame({ seed: 1, nowMs: T0 }), stage: 999 });

      expect(battles.nextStage()?.number).toBe(STAGES.length);
      battles.fight(T0);
      expect(battles.stage()?.number).toBe(STAGES.length);
    });

    it('never lowers an income a returning player already had', () => {
      const { loop, battles } = build(withGoldRate(newGame({ seed: 0xc0ffee, nowMs: T0 }), '500'));

      fightToTheEnd(battles);

      expect(loop.current?.rates.gold.eq(500)).toBe(true);
    });
  });

  describe('the view model', () => {
    it('splits the board into party and foe ranks', () => {
      const { battles } = build();

      battles.fight(T0);

      const party = [...battles.partyFront(), ...battles.partyBack()];
      const foes = [...battles.foesFront(), ...battles.foesBack()];
      expect(battles.partyFront().every((c) => c.side === 'ally' && c.row === 'front')).toBe(true);
      expect(battles.partyBack().every((c) => c.side === 'ally' && c.row === 'back')).toBe(true);
      expect(battles.foesFront().every((c) => c.side === 'enemy' && c.row === 'front')).toBe(true);
      expect(battles.foesBack().every((c) => c.side === 'enemy' && c.row === 'back')).toBe(true);
      expect(battles.partyFront()).toHaveLength(STARTER_FORMATION.front.length);
      expect(battles.partyBack()).toHaveLength(STARTER_FORMATION.back.length);
      expect(battles.foesFront()).toHaveLength(STAGES[0].enemies.front.length);
      expect(battles.foesBack()).toHaveLength(STAGES[0].enemies.back.length);
      expect(party.length + foes.length).toBe(battles.combatants().length);
    });

    it('names every combatant in the log', () => {
      const { battles } = build();

      battles.fight(T0);
      const names = battles.names();

      for (const combatant of battles.combatants()) {
        expect(names.get(combatant.key), combatant.key).toBe(combatant.name);
      }
    });
  });
});

/** Total HP across every combatant, as a measure of how far into a fight playback has got. */
function hpTotal(battles: BattleService): number {
  return battles.combatants().reduce((total, combatant) => total + combatant.fraction, 0);
}

/**
 * Fights the opening battle at `speed` for a slice of real time, and reports how far it got.
 *
 * The default window is an eighth of the fight, which is half of it at 4x — long enough for the
 * two speeds to be clearly apart, short enough that neither finishes.
 */
function narrateOpening(speed: PlaybackSpeed, windowMs?: number) {
  const { battles } = build();
  battles.setSpeed(speed);
  battles.fight(T0);

  const totalMs = battles.result()?.durationMs ?? 0;
  const window = windowMs ?? Math.floor(totalMs / 8);
  run(battles, window);

  return {
    battles,
    totalMs,
    windowMs: window,
    events: battles.result()?.events.length ?? 0,
    remaining: hpTotal(battles),
  };
}
