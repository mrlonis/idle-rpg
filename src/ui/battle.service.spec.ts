import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CAMPAIGN_FORMATION,
  formationIn,
  formationMembers,
  type GameState,
  type PartyFormation,
  newGame,
  num,
  positionAt,
  rarityIndex,
  stageIndex,
  startRarityIndex,
} from '../core';
import {
  AUTO_BATTLE_UNLOCK_CHAPTERS,
  CHAPTERS,
  HALRIC,
  IVO,
  MIRA,
  STARTER_FORMATION,
  TOWER_HUMAN,
  WREN,
  YSOLDE,
} from '../data';
import { BattleService, type StageHeading } from './battle.service';
import { CHAPTERS_IN_ORDER, CHARACTERS_BY_ID, LADDER, LEVELS, STAGES } from './content';
import { FormationService } from './formation.service';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';
import { KEY_VALUE_STORE, type KeyValueStore } from './save.service';
import { type PlaybackSpeed } from './settings.service';

/** An empty stand-in for the preferences store, so nothing here reaches the real plugin. */
class MemoryStore implements KeyValueStore {
  private readonly entries = new Map<string, string>();

  get({ key }: { key: string }): Promise<{ value: string | null }> {
    return Promise.resolve({ value: this.entries.get(key) ?? null });
  }

  set({ key, value }: { key: string; value: string }): Promise<void> {
    this.entries.set(key, value);
    return Promise.resolve();
  }

  remove({ key }: { key: string }): Promise<void> {
    this.entries.delete(key);
    return Promise.resolve();
  }
}

/**
 * The heading the service should produce for the `index`th stage of the ladder, 0-based.
 *
 * Derived from the shipped content rather than retyped, so a re-cut chapter or a renamed stage
 * re-runs every assertion below rather than silently describing a ladder that no longer exists.
 */
function heading(index: number): StageHeading {
  const position = positionAt(LADDER, index + 1);
  const where = `${position.chapter}-${position.stage}`;
  return {
    activity: CAMPAIGN_FORMATION,
    kind: 'campaign',
    where,
    name: STAGES[index].name,
    place: `Chapter ${position.chapter} · ${CHAPTERS_IN_ORDER[position.chapter - 1].name}`,
    label: `${where} — ${STAGES[index].name}`,
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
    signature: 0,
  }));
  return { ...state, roster, formations: { [CAMPAIGN_FORMATION]: STARTER_FORMATION } };
}

/**
 * The run the fake is holding.
 *
 * Throws rather than asserting non-null, because the fake is always seeded before these read it —
 * so a null here is a broken fixture and should say so rather than fail on a property access.
 */
function held(loop: FakeGameLoop): GameState {
  const state = loop.current;
  if (state === null) {
    throw new Error('the fake loop is holding no run');
  }
  return state;
}

/**
 * A run far enough up the ladder to have earned auto-battle.
 *
 * Derived from the shipped chapters rather than retyped: the unlock is a count of finished
 * chapters, so the clears that earn it are the stages those chapters hold.
 */
const clearsToUnlockAuto = CHAPTERS.slice(0, AUTO_BATTLE_UNLOCK_CHAPTERS).reduce(
  (total, chapter) => total + chapter.stages.length,
  0,
);

function unlocked(state: GameState): GameState {
  return { ...state, clearedStages: clearsToUnlockAuto };
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

  /** Derived from the snapshot rather than held apart, exactly as the real loop derives it. */
  readonly formations = computed(() => this.snapshot()?.formations ?? {});

  get current(): GameState | null {
    return this.snapshot();
  }

  formationFor(activity: string): PartyFormation {
    return formationIn(this.formations(), activity);
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
    providers: [
      BattleService,
      RosterService,
      FormationService,
      { provide: GameLoopService, useValue: loop },
      // The playback speed is a persisted setting since milestone 13, so the animator now reaches
      // a store. Provided empty rather than left to the real plugin: two animators built in one
      // test must not inherit a speed the previous one wrote.
      { provide: KEY_VALUE_STORE, useValue: new MemoryStore() },
    ],
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

  /**
   * The tower path: the one place the two kinds of content diverge.
   *
   * Everything past `targetFor` — the animator, the RNG label, the gear roll, every screen — takes a
   * stage and a heading and never asks which kind it came from. What these cover is the divergence
   * itself: which floor is fought, and which of the two payout functions folds the result back in.
   */
  describe('a tower', () => {
    /**
     * A run that has opened the tower, with a crew standing in it.
     *
     * Fielded at the investment `towers.balance.ts` tunes the tower against — five Humans at
     * `rare-plus`, levelled to that rung's cap — because several of these specs need the floor to
     * actually *fall*. The starters at level 1 lose floor 40, which would make "the climb advances"
     * a test of nothing.
     */
    function withTowerCrew(state: GameState, floors = 0): GameState {
      const crew = { front: [HALRIC.id, MIRA.id], back: [WREN.id, YSOLDE.id, IVO.id] };
      const rarity = rarityIndex('rare-plus');
      const roster = [HALRIC, MIRA, WREN, YSOLDE, IVO].map((character) => ({
        defId: character.id,
        rarity,
        level: LEVELS.caps[rarity],
        copies: 0,
        gear: {},
        signature: 0,
      }));
      return {
        ...state,
        roster,
        clearedStages: Math.max(state.clearedStages, TOWER_HUMAN.unlockClears),
        formations: { ...state.formations, [TOWER_HUMAN.id]: crew },
        ...(floors > 0 ? { towers: { [TOWER_HUMAN.id]: floors } } : {}),
      };
    }

    it('fights the floor above the highest one cleared', () => {
      const { loop, battles } = build();
      loop.snapshot.set(withTowerCrew(held(loop), 36));

      battles.fight(T0, TOWER_HUMAN.id);

      expect(battles.result()?.stageId).toBe(TOWER_HUMAN.floors[36].id);
      expect(battles.stage()?.where).toBe('F37');
      expect(battles.stage()?.kind).toBe('tower');
      expect(battles.stage()?.activity).toBe(TOWER_HUMAN.id);
    });

    it('advances the climb and pays crystals, and touches no campaign field', () => {
      // ⚠️ **The whole reason `applyTowerResult` is a separate function.** A tower clear feeding
      // `clearedStages` would drive the idle crystal rate, which `banners.spec.ts` bounds at about ×3
      // the base where the shipped hundred stages already reach ×2.
      const { loop, battles } = build();
      const before = withTowerCrew(held(loop));
      loop.snapshot.set(before);

      battles.fight(T0, TOWER_HUMAN.id);
      run(battles, (battles.result()?.durationMs ?? 0) + 1_000);
      const after = held(loop);

      expect(after.towers[TOWER_HUMAN.id]).toBe(1);
      expect(after.wallet.summons.gt(before.wallet.summons)).toBe(true);
      expect(after.clearedStages).toBe(before.clearedStages);
      expect(after.chapter).toBe(before.chapter);
      expect(after.stage).toBe(before.stage);
      expect(after.rates).toBe(before.rates);
    });

    it('refuses a tower the campaign has not opened yet', () => {
      // Not an error, and not a fight the party loses either: there is nothing behind the door. The
      // crew editor is what explains it — see `FormationView.blockedReason`.
      const { loop, battles } = build();
      const crewed = withTowerCrew(held(loop));
      loop.snapshot.set({ ...crewed, clearedStages: TOWER_HUMAN.unlockClears - 1 });

      battles.fight(T0, TOWER_HUMAN.id);

      expect(battles.isOpen()).toBe(false);
      expect(battles.nextFight(TOWER_HUMAN.id)).toBeNull();
    });

    it('refuses a tower already topped, rather than re-fighting its roof', () => {
      // ⚠️ **A floor is climbed once**, which is the whole difference from the campaign — whose
      // position stops climbing so its last stage stays farmable. Clamping to the top floor here
      // would let a player be paid for the boss for ever.
      const { loop, battles } = build();
      loop.snapshot.set(withTowerCrew(held(loop), TOWER_HUMAN.floors.length));

      battles.fight(T0, TOWER_HUMAN.id);

      expect(battles.isOpen()).toBe(false);
      expect(battles.nextFight(TOWER_HUMAN.id)).toBeNull();
      // And the campaign is never finished, which is what makes the two answers different.
      expect(battles.nextFight(CAMPAIGN_FORMATION)).not.toBeNull();
    });

    it('refuses an activity this build does not ship', () => {
      const { battles } = build();

      battles.fight(T0, 'tower-nowhere');

      expect(battles.isOpen()).toBe(false);
      expect(battles.nextFight('tower-nowhere')).toBeNull();
    });

    it('keeps auto-battle climbing the tower rather than switching to the campaign', () => {
      const { loop, battles } = build();
      loop.snapshot.set(unlocked(withTowerCrew(held(loop))));

      battles.fight(T0, TOWER_HUMAN.id);
      battles.setAuto(true, T0);
      for (let fight = 0; fight < 3; fight++) {
        run(battles, (battles.result()?.durationMs ?? 0) + 1_000);
      }

      expect(battles.activity()).toBe(TOWER_HUMAN.id);
      expect(loop.current?.towers[TOWER_HUMAN.id]).toBeGreaterThan(1);
      expect(loop.current?.clearedStages).toBe(TOWER_HUMAN.unlockClears);
    });

    it('ends an auto run at the top and says why, rather than spinning on a refusal', () => {
      // A win that leaves nothing to fight is the one ending the loop had no word for: the loss path
      // reports the stage that stopped the run, and reporting a finished tower the same way would
      // take credit off the player at the moment they earned the most.
      const { loop, battles } = build();
      const floors = TOWER_HUMAN.floors.length;
      loop.snapshot.set(unlocked(withTowerCrew(held(loop), floors - 1)));

      battles.fight(T0, TOWER_HUMAN.id);
      battles.setAuto(true, T0);
      run(battles, (battles.result()?.durationMs ?? 0) + 1_000);

      expect(loop.current?.towers[TOWER_HUMAN.id]).toBe(floors);
      expect(battles.isAuto()).toBe(false);
      expect(battles.autoStoppedAt()?.where).toBe(`F${floors}`);
      expect(battles.nextFight(TOWER_HUMAN.id)).toBeNull();
    });

    it('names the next floor on the session control, not the next campaign stage', () => {
      const { loop, battles } = build();
      loop.snapshot.set(withTowerCrew(held(loop), 39));

      battles.fight(T0, TOWER_HUMAN.id);
      run(battles, (battles.result()?.durationMs ?? 0) + 1_000);

      // The floor above the one just cleared, and the campaign's own next stage is unmoved.
      expect(battles.nextInSession()?.where).toBe('F41');
      expect(battles.nextStage()?.kind).toBe('campaign');
    });

    it('draws its gear from a stream the pull sequence never sees', () => {
      const { loop, battles } = build();
      const before = withTowerCrew(held(loop));
      loop.snapshot.set(before);

      battles.fight(T0, TOWER_HUMAN.id);
      run(battles, (battles.result()?.durationMs ?? 0) + 1_000);
      const after = held(loop);

      expect(after.gear.length).toBeGreaterThan(0);
      expect(after.rng.calls).toBe(before.rng.calls);
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
