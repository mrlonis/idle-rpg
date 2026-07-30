import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { type GameState, newGame, num } from '../core';
import { STAGES } from '../data';
import { BattleService, type PlaybackSpeed } from './battle.service';
import { GameLoopService } from './game-loop.service';

const T0 = 1_700_000_000_000;

/**
 * Stands in for the game loop, holding the run and applying transforms exactly as the real one
 * does. The animator only needs an owner of the state; wiring up saves, `requestAnimationFrame`
 * and a real sim loop would test those instead of playback.
 */
class FakeGameLoop {
  current: GameState | null = null;
  readonly applied: GameState[] = [];

  apply(update: (state: GameState) => GameState): void {
    if (this.current === null) {
      return;
    }
    this.current = update(this.current);
    this.applied.push(this.current);
  }
}

function build(state: GameState | null = newGame({ seed: 0xc0ffee, nowMs: T0 })) {
  const loop = new FakeGameLoop();
  loop.current = state;

  // Reset up front rather than only in `afterEach`, so a test can stand up two independent
  // animators — comparing playback speeds needs two of them narrating the same battle.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [BattleService, { provide: GameLoopService, useValue: loop }],
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

/**
 * The animator's own timer is never started in these specs. `advance` is driven directly, so
 * playback is deterministic rather than dependent on how long the test took to run — the same
 * reason `advance` is a public method in the first place.
 */
describe('BattleService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows nothing before the first battle is resolved', () => {
    const { battles } = build();

    expect(battles.result()).toBeNull();
    expect(battles.stage()).toBeNull();
    expect(battles.combatants()).toEqual([]);
  });

  it('idles harmlessly until the run has loaded', () => {
    const { battles } = build(null);

    run(battles, 5_000);

    expect(battles.result()).toBeNull();
  });

  it('resolves the first battle on the first step', () => {
    const { battles } = build();

    battles.advance(T0 + 100);

    expect(battles.result()).not.toBeNull();
    expect(battles.stage()).toEqual({ name: STAGES[0].name, number: 1 });
  });

  it('applies the result to the run immediately, not when the animation ends', () => {
    // The alternative loses a won battle to any autosave, reload or backgrounding that lands
    // mid-animation. The run is always consistent with what has been saved.
    const { loop, battles } = build();

    battles.advance(T0 + 100);

    expect(loop.applied).toHaveLength(1);
    expect(loop.current?.battleCount).toBe(1);
    expect(battles.outcome()).toBeNull();
  });

  it('opens with everyone at full HP and the outcome withheld', () => {
    const { battles } = build();

    battles.advance(T0 + 100);

    const combatants = battles.combatants();
    expect(combatants.length).toBeGreaterThan(0);
    for (const combatant of combatants) {
      expect(combatant.fraction, combatant.name).toBe(1);
      expect(combatant.isDown, combatant.name).toBe(false);
    }
    expect(battles.outcome()).toBeNull();
  });

  it('narrates the log gradually rather than all at once', () => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const atStart = battles.recentEvents().length;
    run(battles, 1_000);
    const afterASecond = battles.recentEvents().length;

    expect(atStart).toBe(0);
    expect(afterASecond).toBeGreaterThan(0);
    expect(battles.outcome()).toBeNull();
  });

  it('reveals the outcome only once the whole log has played', () => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const total = battles.result()?.durationMs ?? 0;

    run(battles, total - 200);
    expect(battles.outcome()).toBeNull();

    run(battles, 400);
    expect(battles.outcome()).toBe('victory');
  });

  it('gets further through the same fight at 4x', () => {
    // The claim the whole sim/render split is for: playback speed is a multiplication in
    // `advance`, not a second combat implementation. Both runs narrate a bit-for-bit identical
    // battle — the fast one is simply further into it after the same amount of real time.
    const slow = narrateOpening(1);
    const fast = narrateOpening(4, slow.windowMs);

    expect(fast.totalMs).toBe(slow.totalMs);
    expect(fast.events).toBe(slow.events);
    // Neither has finished, so neither has rolled into the next battle — which would reset HP to
    // full and invert the comparison.
    expect(fast.battles.outcome()).toBeNull();
    expect(fast.remaining).toBeLessThan(slow.remaining);
  });

  it('takes a speed change mid-fight without restarting the fight', () => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const opening = battles.result();
    run(battles, 500);
    battles.setSpeed(4);
    run(battles, 500);

    expect(battles.result()).toBe(opening);
    expect(battles.playbackSpeed()).toBe(4);
  });

  it('moves on to the next battle after an intermission', () => {
    const { loop, battles } = build();

    battles.advance(T0 + 100);
    const first = battles.result();
    const length = battles.result()?.durationMs ?? 0;

    run(battles, length + 3_000);

    expect(battles.result()).not.toBe(first);
    expect(loop.applied.length).toBeGreaterThan(1);
  });

  it('climbs the ladder as battles are won', () => {
    const { loop, battles } = build();

    // Long enough to clear several stages at speed.
    battles.setSpeed(4);
    run(battles, 240_000);

    expect(loop.current?.stage).toBeGreaterThan(1);
    expect((loop.current?.stage ?? 0) <= STAGES.length).toBe(true);
  });

  it('keeps rows from one battle from being mistaken for rows in the next', () => {
    // Slot keys repeat every battle, so the view needs a battle-scoped identity or the HP bar
    // animates from the previous fight's value.
    const { battles } = build();

    battles.advance(T0 + 100);
    const firstKeys = battles.combatants().map((c) => c.viewKey);
    run(battles, (battles.result()?.durationMs ?? 0) + 3_000);
    const secondKeys = battles.combatants().map((c) => c.viewKey);

    expect(firstKeys).not.toEqual(secondKeys);
    expect(battles.combatants().map((c) => c.key)).toContain('ally-0');
  });

  it('does not blast through a fight after a long gap', () => {
    // A backgrounded tab throttles the timer and returning delivers one enormous delta. Without
    // the step clamp the whole log would drain at once and the player would miss the battle.
    const { battles } = build();

    battles.advance(T0 + 100);
    battles.advance(T0 + 100 + 10 * 60 * 1000);

    expect(battles.outcome()).toBeNull();
  });

  it.each([0, -1_000, Number.NaN])('ignores a step of %p', (delta) => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const before = battles.recentEvents().length;
    battles.advance(T0 + 100 + delta);

    expect(battles.recentEvents().length).toBe(before);
  });

  it('resumes an existing run on the stage it left off', () => {
    const { battles } = build({
      ...newGame({ seed: 0xc0ffee, nowMs: T0 }),
      stage: 3,
      battleCount: 42,
      gold: num('5000'),
    });

    battles.advance(T0 + 100);

    expect(battles.stage()).toEqual({ name: STAGES[2].name, number: 3 });
  });

  it('pulls a stage number past the shipped content back into range', () => {
    const { battles } = build({ ...newGame({ seed: 1, nowMs: T0 }), stage: 999 });

    battles.advance(T0 + 100);

    expect(battles.stage()?.number).toBe(STAGES.length);
  });

  it('splits the roster into party and foes', () => {
    const { battles } = build();

    battles.advance(T0 + 100);

    expect(battles.party().every((c) => c.side === 'ally')).toBe(true);
    expect(battles.foes().every((c) => c.side === 'enemy')).toBe(true);
    expect(battles.party().length + battles.foes().length).toBe(battles.combatants().length);
  });

  it('names every combatant in the log', () => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const names = battles.names();

    for (const combatant of battles.combatants()) {
      expect(names.get(combatant.key), combatant.key).toBe(combatant.name);
    }
  });

  it('stops stepping once stopped', () => {
    const { battles } = build();

    battles.advance(T0 + 100);
    const before = battles.recentEvents().length;
    battles.stop();
    battles.stop();

    expect(battles.recentEvents().length).toBe(before);
  });
});

/** Total HP across every combatant, as a measure of how far into a fight playback has got. */
function hpTotal(battles: BattleService): number {
  return battles.combatants().reduce((total, combatant) => total + combatant.fraction, 0);
}

/**
 * Narrates the opening battle at `speed` for a slice of real time, and reports how far it got.
 *
 * The default window is an eighth of the fight, which is half of it at 4x — long enough for the
 * two speeds to be clearly apart, short enough that neither finishes.
 */
function narrateOpening(speed: PlaybackSpeed, windowMs?: number) {
  const { battles } = build();
  battles.setSpeed(speed);
  battles.advance(T0 + 100);

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
