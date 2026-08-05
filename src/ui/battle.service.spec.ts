import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  formationMembers,
  type GameState,
  newGame,
  num,
  positionAt,
  stageIndex,
  startRarityIndex,
} from '../core';
import { AUTO_BATTLE_UNLOCK_CLEARS, STARTER_FORMATION } from '../data';
import { BattleService, type PlaybackSpeed } from './battle.service';
import { CHAPTERS_IN_ORDER, CHARACTERS_BY_ID, LADDER, STAGES } from './content';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/**
 * The heading the service should produce for the `index`th stage of the ladder, 0-based.
 *
 * Derived from the shipped content rather than retyped, so a re-cut chapter or a renamed stage
 * re-runs every assertion below rather than silently describing a ladder that no longer exists.
 */
function heading(index: number): {
  name: string;
  chapter: number;
  chapterName: string;
  number: number;
  level: number;
} {
  const position = positionAt(LADDER, index + 1);
  return {
    name: STAGES[index].name,
    chapter: position.chapter,
    chapterName: CHAPTERS_IN_ORDER[position.chapter - 1].name,
    number: position.stage,
    level: STAGES[index].level,
  };
}

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
function withStarters(state: GameState, level = 1): GameState {
  const starterIds = formationMembers(STARTER_FORMATION);
  const roster = starterIds.map((defId) => ({
    defId,
    rarity: startRarityIndex(CHARACTERS_BY_ID.get(defId)?.tier ?? 'common'),
    level,
    copies: 0,
    gear: {},
  }));
  return { ...state, roster, formation: STARTER_FORMATION };
}

/** A run far enough up the ladder to have earned auto-battle. */
function unlocked(state: GameState): GameState {
  return { ...state, clearedStages: AUTO_BATTLE_UNLOCK_CLEARS };
}

/**
 * Runs `body` with the document reporting itself as backgrounded.
 *
 * `visibilityState` is a prototype getter, so this shadows it with an own property and removes
 * that again afterwards rather than assigning — leaving it stubbed would make every later spec in
 * the file think the app was hidden.
 */
function whileHidden(body: () => void): void {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'hidden',
  });
  try {
    document.dispatchEvent(new Event('visibilitychange'));
    body();
  } finally {
    Reflect.deleteProperty(document, 'visibilityState');
  }
}

/**
 * Stands in for the game loop, holding the run and applying transforms exactly as the real one
 * does. The animator only needs an owner of the state; wiring up saves, `requestAnimationFrame`
 * and a real sim loop would test those instead of playback.
 */
class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(null);
  readonly applied: GameState[] = [];
  /** Every state handed to `persist`, so "one write per battle" is checkable rather than assumed. */
  readonly persisted: GameState[] = [];

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

  persist(): Promise<void> {
    const state = this.snapshot();
    if (state !== null) {
      this.persisted.push(state);
    }
    return Promise.resolve();
  }
}

/**
 * Stands up an animator over a run.
 *
 * `party: false` leaves the formation empty, which `simulateBattle` resolves as an immediate
 * defeat — the only way to make a loss deterministic rather than a matter of which seed came up.
 * `level` raises the starters instead, for the specs that need a win to be just as certain.
 */
function build(
  state: GameState | null = newGame({ seed: 0xc0ffee, nowMs: T0 }),
  { party = true, level = 1 }: { party?: boolean; level?: number } = {},
) {
  const loop = new FakeGameLoop();
  loop.snapshot.set(state === null || !party ? state : withStarters(state, level));

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

      expect(battles.nextStage()).toEqual(heading(0));
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
      expect(battles.stage()).toEqual(heading(0));
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

      expect(loop.current?.rates.gold.eq(String(STAGES[0].rates.gold))).toBe(true);
      expect(loop.current?.wallet.gold.eq(String(STAGES[0].reward.gold))).toBe(true);
    });

    it('points the next fight at the following stage after a win', () => {
      const { battles } = build();

      fightToTheEnd(battles);

      expect(battles.nextStage()).toEqual(heading(1));
      // The board still names the stage that was just fought.
      expect(battles.stage()).toEqual(heading(0));
    });

    it('lets the player go again, on the next stage', () => {
      const { loop, battles } = build();

      fightToTheEnd(battles);
      const first = battles.result();
      battles.fight(T0);

      expect(battles.result()).not.toBe(first);
      expect(battles.stage()).toEqual(heading(1));
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
      expect(loop.current?.chapter).toBe(1);
      expect(loop.current?.rates.gold.eq(String(STAGES[0].rates.gold))).toBe(true);
    });

    it('lets the player go straight back in', () => {
      const { battles } = build();

      fightToTheEnd(battles);
      battles.close();
      battles.fight(T0);

      expect(battles.isOpen()).toBe(true);
      expect(battles.stage()).toEqual(heading(1));
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
        chapter: 1,
        stage: 3,
        battleCount: 42,
      });

      battles.fight(T0);

      expect(battles.stage()).toEqual(heading(2));
    });

    it('pulls a position past the shipped content back into range', () => {
      const { battles } = build({ ...newGame({ seed: 1, nowMs: T0 }), chapter: 99, stage: 999 });
      const last = heading(STAGES.length - 1);

      expect(battles.nextStage()).toEqual(last);
      battles.fight(T0);
      expect(battles.stage()).toEqual(last);
    });

    it('never lowers an income a returning player already had', () => {
      const { loop, battles } = build(withGoldRate(newGame({ seed: 0xc0ffee, nowMs: T0 }), '500'));

      fightToTheEnd(battles);

      expect(loop.current?.rates.gold.eq(500)).toBe(true);
    });
  });

  describe('persisting a finished battle', () => {
    it('writes the run at the end of every fight rather than waiting for an autosave', () => {
      // Auto-battle's one hard requirement on the rest of the app. Results reached `GameState`
      // here already, but only reached storage on `visibilitychange` or the thirty-second
      // backstop — so a hard suspend could lose several *completed* battles. This is what makes
      // "losing the app costs the fight in flight and nothing else" true.
      const { loop, battles } = build();

      fightToTheEnd(battles);

      expect(loop.persisted).toHaveLength(1);
      expect(loop.persisted[0].battleCount).toBe(1);
    });

    it('writes nothing while a fight is still playing', () => {
      const { loop, battles } = build();

      battles.fight(T0);
      run(battles, (battles.result()?.durationMs ?? 0) - 200);

      expect(loop.persisted).toEqual([]);
    });
  });

  describe('auto-battle', () => {
    const fresh = () => newGame({ seed: 0xc0ffee, nowMs: T0 });

    it('stays locked until the ladder behind it has been cleared', () => {
      const { battles } = build();

      battles.fight(T0);
      battles.setAuto(true, T0);

      expect(battles.isAutoUnlocked()).toBe(false);
      expect(battles.isAuto()).toBe(false);
    });

    it('unlocks on the clear count, not on the stage number', () => {
      // `stage` stops climbing at the top of the ladder, so a run that had beaten everything
      // would answer "not yet" forever if this read that field instead.
      const { battles } = build({ ...unlocked(fresh()), chapter: 2, stage: 50 });

      expect(battles.isAutoUnlocked()).toBe(true);
    });

    it('refuses to arm away from the battle screen', () => {
      // The loop's only stopping condition is a loss, and there is nowhere for a player who is
      // not on the battle screen to watch one happen.
      const { battles } = build(unlocked(fresh()));

      battles.setAuto(true, T0);

      expect(battles.isAuto()).toBe(false);
      expect(battles.isOpen()).toBe(false);
    });

    it('starts the next fight the moment it is switched on between battles', () => {
      // A toggle that armed something and then waited for a tap would be asking the player to do
      // the thing they just asked not to do.
      const { battles } = build(unlocked(fresh()), { level: 200 });

      fightToTheEnd(battles);
      expect(battles.isFighting()).toBe(false);

      battles.setAuto(true, T0);

      expect(battles.isAuto()).toBe(true);
      expect(battles.isFighting()).toBe(true);
    });

    it('keeps re-entering stages while it wins', () => {
      const { loop, battles } = build(unlocked(fresh()), { level: 200 });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 120_000);

      expect(loop.applied.length).toBeGreaterThan(3);
      expect(stageIndex(LADDER, loop.current ?? { chapter: 1, stage: 1 })).toBeGreaterThan(3);
      // One write per battle, still — the loop does not batch them up.
      expect(loop.persisted).toHaveLength(loop.applied.length);
    });

    it('stops on a loss and drops the player back to the idle screen', () => {
      const { battles } = build(unlocked(fresh()), { party: false });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 5_000);

      expect(battles.isAuto()).toBe(false);
      expect(battles.isOpen()).toBe(false);
      expect(battles.result()).toBeNull();
    });

    it('names the stage the run died on, since the board is gone by then', () => {
      const { battles } = build({ ...unlocked(fresh()), chapter: 1, stage: 3 }, { party: false });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 5_000);

      expect(battles.autoStoppedAt()).toEqual(heading(2));
    });

    it('clears that notice as soon as another fight starts', () => {
      const { battles } = build(unlocked(fresh()), { party: false });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 5_000);
      expect(battles.autoStoppedAt()).not.toBeNull();

      battles.fight(T0);

      expect(battles.autoStoppedAt()).toBeNull();
    });

    it('lets the battle on screen finish when switched off mid-fight, then stops', () => {
      const { loop, battles } = build(unlocked(fresh()), { level: 200 });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 300);
      battles.setAuto(false, T0);
      run(battles, 120_000);

      expect(loop.applied).toHaveLength(1);
      expect(battles.isFighting()).toBe(false);
      expect(battles.isOpen()).toBe(true);
    });

    it('switches itself off when the app leaves the foreground', () => {
      // The load-bearing half of "foreground-only". A hidden tab still advances playback at
      // roughly 1Hz, so an unattended loop would climb the ladder in the background — and stages
      // clearing while the player is away is exactly what would stop every idle rate being
      // constant across an offline window, which is why `core/offline.ts` needs no segmented
      // solver.
      const { battles } = build(unlocked(fresh()), { level: 200 });

      battles.fight(T0);
      battles.setAuto(true, T0);
      whileHidden(() => {
        expect(battles.isAuto()).toBe(false);
      });
    });

    it('does not abandon the fight that was in flight when it switched off', () => {
      const { loop, battles } = build(unlocked(fresh()), { level: 200 });

      battles.fight(T0);
      battles.setAuto(true, T0);
      whileHidden(() => undefined);
      run(battles, 120_000);

      // The fight already running still banks and still persists. Everything finished is banked;
      // only what follows is cancelled.
      expect(loop.applied).toHaveLength(1);
      expect(loop.persisted).toHaveLength(1);
    });

    it('cannot outlive the battle screen it runs on', () => {
      // Closing is the player's own way out of a loop they switched off mid-fight, and it is the
      // reason `close` resets the flag rather than trusting whatever set it.
      const { battles } = build(unlocked(fresh()), { level: 200 });

      battles.fight(T0);
      battles.setAuto(true, T0);
      run(battles, 300);
      battles.setAuto(false, T0);
      run(battles, 120_000);
      battles.close();

      expect(battles.isAuto()).toBe(false);
      expect(battles.isOpen()).toBe(false);
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
