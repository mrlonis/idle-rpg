// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { MAX_BATTLE_TICKS, ticksToMs } from './clock';
import { battleSeed, simulateBattle } from './simulate';
import { type BattleResult, type CombatantData, type StageData, type StatBlockData } from './types';

const SEED = 0xc0ffee;

function unit(id: string, stats: Partial<StatBlockData> = {}): CombatantData {
  return {
    id,
    name: id,
    stats: {
      hp: 100,
      atk: 20,
      def: 5,
      spd: 100,
      critChance: 0,
      critMultiplier: 2,
      ...stats,
    },
  };
}

function stage(
  enemies: readonly CombatantData[],
  goldReward: number | string = 100,
  goldPerSec: number | string = 2,
): StageData {
  return {
    id: 'test-stage',
    name: 'Test Stage',
    enemies,
    reward: { gold: goldReward },
    rates: { gold: goldPerSec },
  };
}

/** Every observable detail of a battle, as a comparable string. */
function fingerprint(result: BattleResult): string {
  return JSON.stringify({
    outcome: result.outcome,
    ticks: result.ticks,
    reward: (result.reward.gained.gold ?? ZERO).toString(),
    events: result.events.map((event) => {
      switch (event.kind) {
        case 'attack':
          return [
            event.kind,
            event.tick,
            event.source,
            event.target,
            event.damage.toString(),
            event.crit,
            event.targetHp.toString(),
          ];
        case 'defeat':
          return [event.kind, event.tick, event.combatant];
        case 'end':
          return [event.kind, event.tick, event.outcome];
      }
    }),
  });
}

function attackTicks(result: BattleResult): number[] {
  return result.events.filter((event) => event.kind === 'attack').map((event) => event.tick);
}

function attackTargets(result: BattleResult): string[] {
  return result.events.filter((event) => event.kind === 'attack').map((event) => event.target);
}

function hpByKey(snapshots: BattleResult['final']): Record<string, string> {
  return Object.fromEntries(snapshots.map((s) => [s.key, s.hp.toString()]));
}

describe('simulateBattle', () => {
  it('resolves a winnable fight into a victory', () => {
    const result = simulateBattle([unit('hero', { hp: 1000, atk: 100 })], stage([unit('mook')]), 1);

    expect(result.outcome).toBe('victory');
    expect(result.stageId).toBe('test-stage');
    expect(result.events.at(-1)).toMatchObject({ kind: 'end', outcome: 'victory' });
  });

  it('resolves an unwinnable fight into a defeat', () => {
    const result = simulateBattle(
      [unit('hero', { hp: 10, atk: 1 })],
      stage([unit('titan', { hp: 100_000, atk: 500 })]),
      1,
    );

    expect(result.outcome).toBe('defeat');
    expect(result.final.filter((c) => c.side === 'ally' && c.hp.gt(0))).toEqual([]);
  });

  it('pays the stage reward on a victory and nothing otherwise', () => {
    const strong = [unit('hero', { hp: 1000, atk: 100 })];
    const weak = [unit('hero', { hp: 10, atk: 1 })];
    const opponent = stage([unit('titan', { hp: 100_000, atk: 500 })], 250, 4);

    const won = simulateBattle(strong, stage([unit('mook')], 250, 4), 1).reward;
    expect(won.gained.gold?.eq(250)).toBe(true);
    // The idle income the clear unlocks — the larger half of what a stage is worth.
    expect(won.rates.gold?.eq(4)).toBe(true);

    const lost = simulateBattle(weak, opponent, 1).reward;
    // Empty rather than zeroed: a loss pays nothing at all, so there is nothing to list.
    expect(lost.gained).toEqual({});
    expect(lost.rates).toEqual({});
  });

  describe('determinism', () => {
    it('produces an identical battle from an identical seed', () => {
      const team = [unit('rin', { spd: 118, critChance: 0.25 }), unit('bran', { spd: 70 })];
      const encounter = stage([unit('slime', { critChance: 0.1 }), unit('slime')]);

      const first = simulateBattle(team, encounter, SEED);
      const second = simulateBattle(team, encounter, SEED);

      expect(fingerprint(second)).toBe(fingerprint(first));
    });

    it('produces a different battle from a different seed', () => {
      // Crits are the only RNG consumer, so this is also what makes a retry a genuinely new
      // fight rather than a replay of the same loss.
      const team = [unit('rin', { hp: 400, atk: 60, critChance: 0.5 })];
      const encounter = stage([unit('slime', { hp: 300, atk: 15, critChance: 0.5 })]);

      const first = simulateBattle(team, encounter, battleSeed(SEED, 'test-stage', 0));
      const second = simulateBattle(team, encounter, battleSeed(SEED, 'test-stage', 1));

      expect(fingerprint(second)).not.toBe(fingerprint(first));
    });

    it('does not mutate the content it is handed', () => {
      // `data/` is shared, shipped content. A simulation that wrote to a stat block would
      // corrupt every later battle, and balance sweeps would drift as they ran.
      const team = [unit('rin', { critChance: 0.3 })];
      const encounter = stage([unit('slime'), unit('slime')]);
      const before = JSON.stringify({ team, encounter });

      simulateBattle(team, encounter, SEED);

      expect(JSON.stringify({ team, encounter })).toBe(before);
    });

    it('is unaffected by a previous simulation', () => {
      const team = [unit('rin', { critChance: 0.3 })];
      const encounter = stage([unit('slime')]);

      const first = simulateBattle(team, encounter, SEED);
      simulateBattle(team, stage([unit('other', { hp: 5000 })]), 99);
      const again = simulateBattle(team, encounter, SEED);

      expect(fingerprint(again)).toBe(fingerprint(first));
    });
  });

  describe('turn order', () => {
    it('gives a combatant at twice the speed twice the turns', () => {
      // The whole reason for an ATB gauge rather than fixed rounds. The fast ally acts at ticks
      // 5, 10 and 15; the slow enemy gets its single turn at tick 10.
      const result = simulateBattle(
        [unit('swift', { hp: 1000, atk: 10, def: 0, spd: 200 })],
        stage([unit('slow', { hp: 25, atk: 0, def: 0, spd: 100 })]),
        SEED,
      );

      expect(result.outcome).toBe('victory');
      expect(attackTicks(result)).toEqual([5, 10, 10, 15]);
    });

    it('breaks a gauge tie towards the party', () => {
      const result = simulateBattle(
        [unit('ally', { hp: 1000, atk: 10, def: 0, spd: 100 })],
        stage([unit('foe', { hp: 1000, atk: 10, def: 0, spd: 100 })]),
        SEED,
      );

      const [first] = result.events;
      expect(first).toMatchObject({ kind: 'attack', tick: 10, source: 'ally-0' });
    });

    it('lets the faster side strike first', () => {
      const result = simulateBattle(
        [unit('slowpoke', { hp: 1000, atk: 10, def: 0, spd: 50 })],
        stage([unit('quick', { hp: 1000, atk: 10, def: 0, spd: 250 })]),
        SEED,
      );

      expect(result.events[0]).toMatchObject({ source: 'enemy-0', tick: 4 });
    });
  });

  describe('targeting', () => {
    it('focuses the opponent with the least HP remaining', () => {
      const result = simulateBattle(
        [unit('hero', { hp: 1000, atk: 50, def: 0, spd: 100 })],
        stage([
          unit('healthy', { hp: 400, atk: 0, spd: 1 }),
          unit('wounded', { hp: 60, atk: 0, spd: 1 }),
        ]),
        SEED,
      );

      // The wounded enemy is in the second slot, so slot order alone would have picked the other
      // one. It should be dead before the healthy one is touched at all.
      expect(attackTargets(result).slice(0, 2)).toEqual(['enemy-1', 'enemy-1']);
    });
  });

  describe('the event log', () => {
    it('reproduces the final standings exactly when replayed', () => {
      // The log is the only thing the UI is given, so it has to be complete: replaying it must
      // land on the same HP the simulation finished with, or the animation and the run disagree.
      const result = simulateBattle(
        [unit('rin', { hp: 400, atk: 60, critChance: 0.3 }), unit('bran', { hp: 900, atk: 30 })],
        stage([unit('slime', { hp: 260, atk: 22 }), unit('slime', { hp: 260, atk: 22 })]),
        SEED,
      );

      const replayed = Object.fromEntries(result.roster.map((c) => [c.key, c.hp.toString()]));
      for (const event of result.events) {
        if (event.kind === 'attack') {
          replayed[event.target] = event.targetHp.toString();
        }
      }

      expect(replayed).toEqual(hpByKey(result.final));
    });

    it('records a defeat the moment a combatant reaches zero, and only once', () => {
      const result = simulateBattle(
        [unit('hero', { hp: 1000, atk: 100 })],
        stage([unit('mook', { hp: 50, atk: 0 })]),
        SEED,
      );

      const defeats = result.events.filter((event) => event.kind === 'defeat');
      expect(defeats).toHaveLength(1);
      expect(defeats[0]).toMatchObject({ combatant: 'enemy-0' });
    });

    it('never reports negative HP', () => {
      const result = simulateBattle(
        [unit('hero', { hp: 1000, atk: 5000 })],
        stage([unit('mook', { hp: 10, atk: 0 })]),
        SEED,
      );

      for (const event of result.events) {
        if (event.kind === 'attack') {
          expect(event.targetHp.gte(0)).toBe(true);
        }
      }
    });

    it('closes with exactly one end event', () => {
      const result = simulateBattle([unit('hero', { atk: 100 })], stage([unit('mook')]), SEED);

      expect(result.events.filter((event) => event.kind === 'end')).toHaveLength(1);
      expect(result.events.at(-1)?.kind).toBe('end');
    });

    it('stops acting once the battle is decided', () => {
      // A combatant killed earlier in the same tick must not still swing, and nothing may act
      // after the last enemy falls.
      const result = simulateBattle(
        [unit('a', { hp: 1000, atk: 100, spd: 100 }), unit('b', { hp: 1000, atk: 100, spd: 100 })],
        stage([unit('mook', { hp: 30, atk: 0, spd: 100 })]),
        SEED,
      );

      expect(result.events.filter((event) => event.kind === 'attack')).toHaveLength(1);
    });
  });

  describe('naming', () => {
    it('numbers repeated copies so the log stays readable', () => {
      const result = simulateBattle(
        [unit('hero', { atk: 100 })],
        stage([unit('slime'), unit('slime'), unit('slime')]),
        SEED,
      );

      const enemies = result.roster.filter((c) => c.side === 'enemy');
      expect(enemies.map((c) => c.name)).toEqual(['slime 1', 'slime 2', 'slime 3']);
      expect(enemies.map((c) => c.key)).toEqual(['enemy-0', 'enemy-1', 'enemy-2']);
    });

    it('leaves a single copy unnumbered', () => {
      const result = simulateBattle([unit('hero', { atk: 100 })], stage([unit('slime')]), SEED);

      expect(result.roster.find((c) => c.side === 'enemy')?.name).toBe('slime');
    });
  });

  describe('termination', () => {
    it('gives up as a stalemate rather than running forever', () => {
      // The damage formula guarantees a battle ends eventually, but "eventually" can be 1e24
      // turns. A synchronous function on the main thread needs a hard ceiling, and a balance
      // sweep needs one even more.
      const result = simulateBattle(
        [unit('pebble', { hp: 1000, atk: 1, def: '1e12', spd: 100 })],
        stage([unit('mountain', { hp: '1e12', atk: 0, def: '1e12', spd: 100 })]),
        SEED,
      );

      expect(result.outcome).toBe('stalemate');
      expect(result.ticks).toBe(MAX_BATTLE_TICKS);
      expect(result.events.at(-1)).toMatchObject({ kind: 'end', outcome: 'stalemate' });
    });

    it('resolves instantly when a side is empty', () => {
      const noEnemies = simulateBattle([unit('hero')], stage([]), SEED);
      const noParty = simulateBattle([], stage([unit('mook')]), SEED);

      expect(noEnemies.outcome).toBe('victory');
      expect(noEnemies.ticks).toBe(0);
      // A battle entered with nobody is a loss, not a walkover.
      expect(noParty.outcome).toBe('defeat');
      expect(simulateBattle([], stage([]), SEED).outcome).toBe('defeat');
    });

    it('prices the fight in game time', () => {
      const result = simulateBattle(
        [unit('swift', { hp: 1000, atk: 10, def: 0, spd: 200 })],
        stage([unit('slow', { hp: 25, atk: 0, def: 0, spd: 100 })]),
        SEED,
      );

      expect(result.durationMs).toBe(ticksToMs(result.ticks));
      expect(result.durationMs).toBe(ticksToMs(15));
    });
  });
});

describe('battleSeed', () => {
  it('derives a different seed per stage and per attempt', () => {
    const first = battleSeed(SEED, 'stage-1', 0);

    expect(battleSeed(SEED, 'stage-1', 1)).not.toBe(first);
    expect(battleSeed(SEED, 'stage-2', 0)).not.toBe(first);
    expect(battleSeed(SEED + 1, 'stage-1', 0)).not.toBe(first);
  });

  it('is stable for the same run, stage and attempt', () => {
    expect(battleSeed(SEED, 'stage-3', 7)).toBe(battleSeed(SEED, 'stage-3', 7));
  });

  it('uses the shared derivation rather than a private scheme', () => {
    // Pins the label format. Combat must draw from a sub-stream of the run seed so replaying a
    // battle is reproducible and never shifts the pull sequence.
    expect(battleSeed(SEED, 'stage-4', 12)).toBe(deriveSeed(SEED, 'battle:stage-4:12'));
  });

  it('returns a uint32', () => {
    const seed = battleSeed(0xffffffff, 'stage-1', 999);

    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});
