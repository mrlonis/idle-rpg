// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { ATB_THRESHOLD, BATTLE_TICK_MS, ticksToMs, ticksUntilReady } from './clock';

/** What `ticksUntilReady` claims, computed the slow, obvious way. */
function ticksUntilReadyByStepping(gauge: number, spd: number): number {
  let current = gauge;
  for (let ticks = 1; ticks <= ATB_THRESHOLD * 2; ticks++) {
    current += spd;
    if (current >= ATB_THRESHOLD) {
      return ticks;
    }
  }
  return Number.NaN;
}

describe('ticksUntilReady', () => {
  /**
   * The load-bearing invariant of the whole simulation.
   *
   * `simulateBattle` jumps straight to the tick of the next action rather than stepping one tick
   * at a time. That is only sound if the jump lands on exactly the tick a naive per-tick loop
   * would have stopped on — the same relationship the offline resume relies on between its
   * closed form and stepwise accrual. Every legal speed is checked against a brute-force count,
   * across gauges spanning empty to nearly full.
   */
  it('lands on exactly the tick that stepwise accumulation would', () => {
    const speeds = [1, 2, 3, 7, 17, 52, 70, 78, 96, 100, 118, 148, 333, 499, 500, 999, 1000];
    const gauges = [0, 1, 37, 250, 499, 500, 501, 750, 900, 999];

    const mismatches: string[] = [];
    for (const spd of speeds) {
      for (const gauge of gauges) {
        const jumped = ticksUntilReady(gauge, spd);
        const stepped = ticksUntilReadyByStepping(gauge, spd);
        if (jumped !== stepped) {
          mismatches.push(`gauge ${gauge} spd ${spd}: jumped ${jumped}, stepped ${stepped}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('never returns less than one tick, so a caller always makes progress', () => {
    // A full or overfull gauge should not report "zero ticks from now" — that is an infinite
    // loop in the caller rather than a fast battle.
    expect(ticksUntilReady(ATB_THRESHOLD, 100)).toBe(1);
    expect(ticksUntilReady(ATB_THRESHOLD * 3, 100)).toBe(1);
  });

  it('makes a doubled speed take half as many ticks', () => {
    // The point of an ATB gauge over fixed rounds: SPD buys turns, not just turn order.
    expect(ticksUntilReady(0, 100)).toBe(10);
    expect(ticksUntilReady(0, 200)).toBe(5);
  });

  it('acts every tick at the threshold speed', () => {
    expect(ticksUntilReady(0, ATB_THRESHOLD)).toBe(1);
  });
});

describe('ticksToMs', () => {
  it('prices a tick count in game milliseconds', () => {
    expect(ticksToMs(0)).toBe(0);
    expect(ticksToMs(10)).toBe(10 * BATTLE_TICK_MS);
  });

  it('makes a threshold-speed combatant act ten times a second', () => {
    // Pins the relationship the stat blocks are authored against: at spd 100 a combatant acts
    // once per second. Retuning either constant without the other silently rescales every fight.
    expect(ticksToMs(ticksUntilReady(0, 100))).toBe(1000);
  });
});
