// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type Numeric, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { MAX_BATTLE_TICKS, ticksToMs } from './clock';
import { toCombatRules } from './content';
import {
  LINEUP_COMBAT_RULES,
  LINEUP_COMBAT_RULES_DATA,
  PLAIN_COMBAT_RULES,
  PLAIN_COMBAT_RULES_DATA,
  TEST_COMBAT_RULES,
} from './fixtures';
import { battleSeed, simulateBattle } from './simulate';
import {
  type ActiveStatus,
  type BattleResult,
  type CombatantData,
  type CombatRules,
  type EnemyData,
  type FormationData,
  type SkillData,
  type StageData,
  type StatBlockData,
  type StatusData,
} from './types';

const SEED = 0xc0ffee;

function unit(
  id: string,
  stats: Partial<StatBlockData> = {},
  extra: Partial<Pick<CombatantData, 'faction' | 'basic' | 'skills' | 'opening'>> = {},
): CombatantData {
  return {
    id,
    name: id,
    faction: extra.faction ?? 'neutral',
    basic: extra.basic,
    skills: extra.skills,
    // An opening status is the cheapest way to put a taunt, a thorn or a link on the board without
    // spending turns getting one applied — which is how the enemy archetypes that carry them are
    // authored too, so the fixture matches the content rather than approximating it.
    opening: extra.opening,
    stats: {
      hp: 100,
      atk: 20,
      def: 5,
      haste: 100,
      critChance: 0,
      critDamageAmp: 1,
      ...stats,
    },
  };
}

/** A line-up in two ranks. Most specs only need a front rank, so the back one defaults to empty. */
function line(front: readonly CombatantData[], back: readonly CombatantData[] = []): FormationData {
  return { front, back };
}

/**
 * A stage fielding an ordinary line-up as its enemies.
 *
 * The formation is widened into an enemy formation here rather than at every call site: an enemy
 * needs a growth tier, and the fixtures' growth table is flat, so the tier is paperwork for these
 * specs rather than something any of them is measuring. `level: 1` for the same reason — the
 * "enemy levels" block at the bottom of this file is where the dial is actually turned.
 */
function stage(
  enemies: FormationData,
  goldReward: number | string = 100,
  goldPerSec: number | string = 2,
  level = 1,
): StageData {
  const archetype = (combatant: CombatantData): EnemyData => ({ ...combatant, tier: 'common' });

  return {
    id: 'test-stage',
    name: 'Test Stage',
    enemies: { front: enemies.front.map(archetype), back: enemies.back.map(archetype) },
    level,
    // Ordinary, because nothing in the simulation reads it: a boss is a line-up and a level, and
    // the kind is there so a screen can say "boss" and the reward curve can pay one.
    kind: 'normal',
    reward: { gold: goldReward },
    rates: { gold: goldPerSec },
  };
}

function fight(
  party: FormationData,
  encounter: StageData,
  seed = SEED,
  rules: CombatRules = PLAIN_COMBAT_RULES,
): BattleResult {
  return simulateBattle(party, encounter, seed, rules);
}

/**
 * Every observable detail of a battle, as a comparable string.
 *
 * Serialised generically rather than case by case: the event union has grown to thirteen kinds,
 * and a fingerprint that had to name each one would silently stop covering whichever kind was
 * added last — which is exactly the kind of gap a determinism test cannot afford. `Numeric`
 * values are recognised by their `mantissa` and serialised through `Decimal.toString`, because
 * `JSON.stringify` would otherwise emit their internal `{ mantissa, exponent }` shape and two
 * genuinely different damage numbers could round-trip to the same text.
 */
function fingerprint(result: BattleResult): string {
  const quantity = (value: unknown): value is Numeric =>
    typeof value === 'object' && value !== null && 'mantissa' in value;

  return JSON.stringify(
    {
      outcome: result.outcome,
      ticks: result.ticks,
      reward: (result.reward.gained.gold ?? ZERO).toString(),
      events: result.events,
    },
    (_key, value: unknown) => (quantity(value) ? value.toString() : (value as never)),
  );
}

function attackTicks(result: BattleResult): number[] {
  return result.events.filter((event) => event.kind === 'attack').map((event) => event.tick);
}

function attackTargets(result: BattleResult): string[] {
  return result.events.filter((event) => event.kind === 'attack').map((event) => event.target);
}

/**
 * The damage of the first landed attack in a battle.
 *
 * Zero when nothing connected, which is deliberately indistinguishable from a hit for nothing:
 * every caller here sets the line-up up so that the opening swing lands, so a zero is a broken
 * fixture rather than a case to branch on.
 */
function firstHit(result: BattleResult): Numeric {
  const hit = result.events.find((event) => event.kind === 'attack');
  return hit?.kind === 'attack' ? hit.damage : ZERO;
}

/** Every mutable thing the log is supposed to be able to reproduce, keyed by combatant. */
interface Board {
  readonly hp: Record<string, string>;
  readonly energy: Record<string, number>;
  readonly shield: Record<string, string>;
  readonly statuses: Record<string, readonly string[]>;
}

function boardOf(snapshots: BattleResult['final']): Board {
  return {
    hp: Object.fromEntries(snapshots.map((c) => [c.key, c.hp.toString()])),
    energy: Object.fromEntries(snapshots.map((c) => [c.key, c.energy])),
    shield: Object.fromEntries(snapshots.map((c) => [c.key, c.shield.toString()])),
    statuses: Object.fromEntries(
      snapshots.map((c) => [c.key, c.statuses.map((status) => status.id)]),
    ),
  };
}

/**
 * Walks the log the way `ui/battle.service.ts` does, and reports the board it lands on.
 *
 * Deliberately a second, independent implementation of the replay rather than a call into the
 * UI's: `core/` cannot import `ui/`, and a spec that reused the animator's own code could only
 * ever prove it agrees with itself.
 */
function replay(result: BattleResult): Board {
  const hp = new Map(result.roster.map((c) => [c.key, c.hp]));
  const energy = new Map(result.roster.map((c) => [c.key, c.energy]));
  const held = new Map<string, ActiveStatus[]>(result.roster.map((c) => [c.key, []]));

  const spend = (key: string, absorbed: Numeric): void => {
    let remaining = absorbed;
    const next: ActiveStatus[] = [];
    for (const status of held.get(key) ?? []) {
      const pool = status.kind === 'shield' ? (status.amount ?? ZERO) : undefined;
      if (pool === undefined || remaining.lte(ZERO) || pool.lte(ZERO)) {
        next.push(status);
        continue;
      }
      const taken = pool.lt(remaining) ? pool : remaining;
      remaining = remaining.sub(taken);
      const left = pool.sub(taken);
      if (left.gt(ZERO)) {
        next.push({ ...status, amount: left });
      }
    }
    held.set(key, next);
  };

  for (const event of result.events) {
    switch (event.kind) {
      case 'turn':
        energy.set(event.combatant, event.energy);
        break;
      case 'cast':
        energy.set(event.source, event.energy);
        break;
      case 'attack':
        hp.set(event.target, event.targetHp);
        spend(event.target, event.absorbed);
        energy.set(event.source, event.sourceEnergy);
        energy.set(event.target, event.targetEnergy);
        break;
      case 'tick-damage':
        hp.set(event.target, event.targetHp);
        spend(event.target, event.absorbed);
        break;
      case 'heal':
        hp.set(event.target, event.targetHp);
        energy.set(event.source, event.sourceEnergy);
        break;
      case 'tick-heal':
        hp.set(event.target, event.targetHp);
        break;
      case 'status':
        held.set(event.target, [
          ...(held.get(event.target) ?? []).filter((s) => s.id !== event.status.id),
          event.status,
        ]);
        break;
      case 'status-expired':
        held.set(
          event.target,
          (held.get(event.target) ?? []).filter((s) => s.id !== event.statusId),
        );
        break;
      case 'cleanse':
        held.set(
          event.target,
          (held.get(event.target) ?? []).filter((s) => !event.removed.includes(s.id)),
        );
        break;
      case 'defeat':
        held.set(event.combatant, []);
        break;
      default:
        break;
    }
  }

  const shield = (statuses: readonly ActiveStatus[]): Numeric =>
    statuses.reduce(
      (total, status) => (status.kind === 'shield' ? total.add(status.amount ?? ZERO) : total),
      ZERO,
    );

  return {
    hp: Object.fromEntries([...hp].map(([key, value]) => [key, value.toString()])),
    energy: Object.fromEntries(energy),
    shield: Object.fromEntries(
      [...held].map(([key, statuses]) => [key, shield(statuses).toString()]),
    ),
    statuses: Object.fromEntries(
      [...held].map(([key, statuses]) => [key, statuses.map((status) => status.id)]),
    ),
  };
}

describe('simulateBattle', () => {
  it('resolves a winnable fight into a victory', () => {
    const result = fight(line([unit('hero', { hp: 1000, atk: 100 })]), stage(line([unit('mook')])));

    expect(result.outcome).toBe('victory');
    expect(result.stageId).toBe('test-stage');
    expect(result.events.at(-1)).toMatchObject({ kind: 'end', outcome: 'victory' });
  });

  it('resolves an unwinnable fight into a defeat', () => {
    const result = fight(
      line([unit('hero', { hp: 10, atk: 1 })]),
      stage(line([unit('titan', { hp: 100_000, atk: 500 })])),
    );

    expect(result.outcome).toBe('defeat');
    expect(result.final.filter((c) => c.side === 'ally' && c.hp.gt(0))).toEqual([]);
  });

  it('pays the stage reward on a victory and nothing otherwise', () => {
    const strong = line([unit('hero', { hp: 1000, atk: 100 })]);
    const weak = line([unit('hero', { hp: 10, atk: 1 })]);
    const opponent = stage(line([unit('titan', { hp: 100_000, atk: 500 })]), 250, 4);

    const won = fight(strong, stage(line([unit('mook')]), 250, 4)).reward;
    expect(won.gained.gold?.eq(250)).toBe(true);
    // The idle income the clear unlocks — the larger half of what a stage is worth.
    expect(won.rates.gold?.eq(4)).toBe(true);

    const lost = fight(weak, opponent).reward;
    // Empty rather than zeroed: a loss pays nothing at all, so there is nothing to list.
    expect(lost.gained).toEqual({});
    expect(lost.rates).toEqual({});
  });

  describe('determinism', () => {
    it('produces an identical battle from an identical seed', () => {
      const party = line(
        [unit('rin', { haste: 118, critChance: 0.25 })],
        [unit('bran', { haste: 70 })],
      );
      const encounter = stage(line([unit('slime', { critChance: 0.1 })], [unit('slime')]));

      expect(fingerprint(fight(party, encounter))).toBe(fingerprint(fight(party, encounter)));
    });

    it('produces a different battle from a different seed', () => {
      // Hits, crits and status applications are the only RNG consumers, so this is also what
      // makes a retry a genuinely new fight rather than a replay of the same loss.
      const party = line([unit('rin', { hp: 400, atk: 60, critChance: 0.5 })]);
      const encounter = stage(line([unit('slime', { hp: 300, atk: 15, critChance: 0.5 })]));

      const first = fight(party, encounter, battleSeed(SEED, 'test-stage', 0));
      const second = fight(party, encounter, battleSeed(SEED, 'test-stage', 1));

      expect(fingerprint(second)).not.toBe(fingerprint(first));
    });

    it('does not mutate the content it is handed', () => {
      // `data/` is shared, shipped content. A simulation that wrote to a stat block would
      // corrupt every later battle, and balance sweeps would drift as they ran.
      const party = line([unit('rin', { critChance: 0.3 }, { skills: [POISON_DART] })]);
      const encounter = stage(line([unit('slime'), unit('slime')]));
      const before = JSON.stringify({ party, encounter });

      fight(party, encounter);

      expect(JSON.stringify({ party, encounter })).toBe(before);
    });

    it('is unaffected by a previous simulation', () => {
      const party = line([unit('rin', { critChance: 0.3 })]);
      const encounter = stage(line([unit('slime')]));

      const first = fight(party, encounter);
      fight(party, stage(line([unit('other', { hp: 5000 })])), 99);

      expect(fingerprint(fight(party, encounter))).toBe(fingerprint(first));
    });

    it('chooses targets without consulting the RNG', () => {
      // Selection has to be a pure function of the battle state. If it drew, the tie-break in a
      // five-body wave would move with the seed and no replay would be exact.
      const party = line([unit('hero', { hp: 2000, atk: 40, critChance: 0 })]);
      const encounter = stage(line([unit('a', { hp: 90, atk: 0 }), unit('b', { hp: 60, atk: 0 })]));

      const first = attackTargets(fight(party, encounter, 1));
      const second = attackTargets(fight(party, encounter, 987_654));

      expect(second).toEqual(first);
    });
  });

  describe('turn order', () => {
    it('gives a combatant at twice the speed twice the turns', () => {
      // The whole reason for an ATB gauge rather than fixed rounds. The fast ally acts at ticks
      // 5, 10 and 15; the slow enemy gets its single turn at tick 10.
      const result = fight(
        line([unit('swift', { hp: 1000, atk: 10, def: 0, haste: 200 })]),
        stage(line([unit('slow', { hp: 25, atk: 0, def: 0, haste: 100 })])),
      );

      expect(result.outcome).toBe('victory');
      expect(attackTicks(result)).toEqual([5, 10, 10, 15]);
    });

    it('breaks a gauge tie towards the party', () => {
      const result = fight(
        line([unit('ally', { hp: 1000, atk: 10, def: 0, haste: 100 })]),
        stage(line([unit('foe', { hp: 1000, atk: 10, def: 0, haste: 100 })])),
      );

      const first = result.events.find((event) => event.kind === 'attack');
      expect(first).toMatchObject({ kind: 'attack', tick: 10, source: 'ally-0' });
    });

    it('lets the faster side strike first', () => {
      const result = fight(
        line([unit('slowpoke', { hp: 1000, atk: 10, def: 0, haste: 50 })]),
        stage(line([unit('quick', { hp: 1000, atk: 10, def: 0, haste: 250 })])),
      );

      expect(result.events.find((event) => event.kind === 'attack')).toMatchObject({
        source: 'enemy-0',
        tick: 4,
      });
    });

    it('opens every turn with a marker carrying regenerated energy', () => {
      // The animator's board moves only because an event said so, and a turn start is the one
      // place the drip half of the meter goes up. Without this event it would have to model
      // regeneration itself.
      //
      // The caster swings each turn and the mook is too slow to answer, so what accumulates is
      // 4 regen plus 10 for landing a hit — and the fight opens at zero rather than full, which
      // is the whole of what changed when energy replaced MP.
      const result = fight(
        line([unit('caster', { hp: 500, atk: 30, energyRegen: 4, haste: 100 })]),
        stage(line([unit('mook', { hp: 4000, atk: 5, haste: 1 })])),
      );

      const turns = result.events.filter(
        (event) => event.kind === 'turn' && event.combatant === 'ally-0',
      );
      expect(turns.slice(0, 3)).toMatchObject([
        { tick: 10, energy: 4 },
        { tick: 20, energy: 18 },
        { tick: 30, energy: 32 },
      ]);
    });

    it('pays attack speed only for the turn after a basic attack', () => {
      // The one mapping in the stat block with no precedent. Haste is gauge for everything;
      // attack speed is gauge for swinging, so a combatant machine-guns basics between its skill
      // windows and drops back to plain haste for the turn after a cast.
      //
      // The kit here is one skill on a 60-tick cooldown. Nothing has been used at tick 0, so the
      // opening turn arrives on haste alone for both fighters and is spent casting. The turn
      // after *that* is also plain — a cast is not a swing. From the first basic attack onward
      // the fast one pulls ahead.
      const swinger = unit(
        'swinger',
        { hp: 1000, atk: 10, def: 0, haste: 100, attackSpeed: 100 },
        { skills: [POISON_DART] },
      );
      const plain = unit(
        'plain',
        { hp: 1000, atk: 10, def: 0, haste: 100 },
        { skills: [POISON_DART] },
      );
      const dummy = () => stage(line([unit('mook', { hp: 100_000, atk: 0, haste: 1 })]));

      const fast = fight(line([swinger]), dummy());
      const slow = fight(line([plain]), dummy());
      const turnsOf = (result: BattleResult): number[] =>
        result.events.filter((event) => event.kind === 'turn').map((event) => event.tick);

      expect(turnsOf(fast).slice(0, 4)).toEqual([10, 20, 25, 30]);
      expect(turnsOf(slow).slice(0, 4)).toEqual([10, 20, 30, 40]);
    });

    it('keeps paying attack speed while a skill sits ineligible rather than on cooldown', () => {
      // Reading the *last* action rather than predicting the next one is what makes this true,
      // and it is the reason for the choice. A skill gated on a condition that is not met never
      // goes on cooldown — so "is everything in the kit on cooldown" would read as "no" forever
      // and suppress the bonus for the whole fight. Aelrindel's Volley wants three living
      // enemies; his attack speed is the largest in the game and must not depend on that.
      const gated: SkillData = {
        ...SNIPE,
        id: 'gated',
        cooldown: 40,
        condition: { kind: 'enemies-at-least', count: 3 },
      };
      const result = fight(
        line([
          unit(
            'archer',
            { hp: 1000, atk: 10, def: 0, haste: 100, attackSpeed: 100 },
            { skills: [gated] },
          ),
        ]),
        stage(line([unit('mook', { hp: 100_000, atk: 0, haste: 1 })])),
      );

      const turns = result.events.filter((event) => event.kind === 'turn').map((e) => e.tick);
      // The opening turn is a basic attack, because the gate never opens — so every turn after
      // it is paid at haste plus attack speed.
      expect(turns.slice(0, 4)).toEqual([10, 15, 20, 25]);
    });

    it('re-clamps haste and attack speed together, not one at a time', () => {
      // The termination argument. Two stats that individually respected the gauge bound and
      // jointly did not would bank two actions in a tick exactly as one oversized stat would, so
      // a combatant at the ceiling on both still acts once per tick and no more.
      const result = fight(
        line([
          unit(
            'blur',
            { hp: 1000, atk: 10, def: 0, haste: 1000, attackSpeed: 1000 },
            { skills: [POISON_DART] },
          ),
        ]),
        stage(line([unit('mook', { hp: 100_000, atk: 0, haste: 1 })])),
      );

      const turns = result.events.filter((event) => event.kind === 'turn').map((e) => e.tick);
      expect(turns.slice(0, 4)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('recovery', () => {
    it('heals at the top of a turn, amplified by health regen', () => {
      // A quantity rather than a percentage of maximum HP, so a deep pool does not heal faster
      // than a shallow one for free — and one of the four stats that scales, because a fixed
      // number measured against a health bar heading for ×10⁹ is a rounding error by then.
      const result = fight(
        line([
          unit('dwarf', { hp: 1000, atk: 1, def: 0, haste: 100, recovery: 20, healthRegen: 0.5 }),
        ]),
        stage(line([unit('mook', { hp: 100_000, atk: 300, def: 0, haste: 100 })])),
      );

      const healed = result.events.find(
        (event) => event.kind === 'heal' && event.target === 'ally-0' && event.tick > 10,
      );
      expect(healed).toBeDefined();
      expect(healed?.kind === 'heal' && healed.amount.eq(30)).toBe(true);
    });

    it('does not amplify its own recovery with received healing', () => {
      // "Received healing" means received from somebody else. Amplifying a self-heal would make
      // the stat a second `healthRegen` rather than the thing that makes a healer worth fielding.
      const result = fight(
        line([
          unit('dwarf', {
            hp: 1000,
            atk: 1,
            def: 0,
            haste: 100,
            recovery: 20,
            receivedHealing: 3,
          }),
        ]),
        stage(line([unit('mook', { hp: 100_000, atk: 300, def: 0, haste: 100 })])),
      );

      const healed = result.events.find(
        (event) => event.kind === 'heal' && event.target === 'ally-0' && event.tick > 10,
      );
      expect(healed?.kind === 'heal' && healed.amount.eq(20)).toBe(true);
    });

    it('amplifies a heal that came from an ally', () => {
      const result = fight(
        line(
          [unit('tank', { hp: 1000, atk: 5, def: 0, haste: 60, receivedHealing: 1 })],
          [unit('medic', { hp: 1000, atk: 40, haste: 100 }, { skills: [MEND] })],
        ),
        stage(line([unit('mook', { hp: 100_000, atk: 200, def: 0, haste: 100 })])),
      );

      const mended = result.events.find(
        (event) => event.kind === 'heal' && event.source === 'ally-1' && event.target === 'ally-0',
      );
      // 40 attack × power 1, doubled by the tank's amplifier. Compared as a number because the
      // amplifier is a float multiplier.
      expect(mended?.kind === 'heal' && mended.amount.toNumber()).toBeCloseTo(80, 6);
    });
  });

  describe('rows', () => {
    it('sends an ordinary attack into the front rank, not at the weakest body', () => {
      // The front row is a gate. A back-rank healer on 60 HP is unreachable while anything is
      // standing in front of it, which is the entire mechanical content of a formation.
      const result = fight(
        line([unit('hero', { hp: 1000, atk: 50, def: 0, haste: 100 })]),
        stage(
          line(
            [unit('wall', { hp: 400, atk: 0, haste: 1 })],
            [unit('healer', { hp: 60, atk: 0, haste: 1 })],
          ),
        ),
      );

      expect(attackTargets(result).slice(0, 3)).toEqual(['enemy-0', 'enemy-0', 'enemy-0']);
    });

    it('falls through to the back rank once the front is empty', () => {
      // Otherwise a party would stand there swinging at a rank nobody is in.
      const result = fight(
        line([unit('hero', { hp: 1000, atk: 100, def: 0, haste: 100 })]),
        stage(
          line(
            [unit('wall', { hp: 50, atk: 0, haste: 1 })],
            [unit('healer', { hp: 50, atk: 0, haste: 1 })],
          ),
        ),
      );

      expect(result.outcome).toBe('victory');
      expect(attackTargets(result)).toEqual(['enemy-0', 'enemy-1']);
    });

    it('lets a bypass skill reach the back rank straight away', () => {
      // What a sniper, a ranger or a mage is bought for, and the answer to a protected healer.
      const result = fight(
        line([unit('archer', { hp: 1000, atk: 50, def: 0, haste: 100 }, { skills: [SNIPE] })]),
        stage(
          line(
            [unit('wall', { hp: 4000, atk: 0, haste: 1 })],
            [unit('healer', { hp: 400, atk: 0, haste: 1 })],
          ),
        ),
      );

      expect(attackTargets(result)[0]).toBe('enemy-1');
    });

    it('numbers slots across both ranks, front first', () => {
      const result = fight(
        line([unit('a'), unit('b')], [unit('c')]),
        stage(line([unit('x')], [unit('y'), unit('z')])),
      );

      expect(result.roster.map((c) => [c.key, c.row])).toEqual([
        ['ally-0', 'front'],
        ['ally-1', 'front'],
        ['ally-2', 'back'],
        ['enemy-0', 'front'],
        ['enemy-1', 'back'],
        ['enemy-2', 'back'],
      ]);
    });

    it('applies the front rank’s defensive bonus and the back rank’s offensive one', () => {
      const encounter = stage(line([unit('mook', { hp: 5000, atk: 0, haste: 1 })]));
      const front = fight(
        line([unit('hero', { atk: 40, def: 20, haste: 100 })]),
        encounter,
        SEED,
        TEST_COMBAT_RULES,
      );
      const back = fight(
        line([], [unit('hero', { atk: 40, def: 20, haste: 100 })]),
        encounter,
        SEED,
        TEST_COMBAT_RULES,
      );

      // The back rank's five percent lands on `patk`, which the basic attack reads, so the hit
      // is strictly larger from behind. From the front the bonus went to the defences instead,
      // and the swing is exactly what the stat block authored.
      expect(firstHit(back).gt(firstHit(front))).toBe(true);
    });

    it('reaches the back rank when the front one is empty rather than refusing to act', () => {
      // A formation with nobody in front is legal — a player mid-reshuffle is entitled to one —
      // and the gate has to fall through rather than leaving both sides swinging at air.
      const result = fight(
        line([], [unit('hero', { hp: 1000, atk: 60, haste: 100 })]),
        stage(line([], [unit('mook', { hp: 200, atk: 10, haste: 100 })])),
      );

      expect(result.outcome).toBe('victory');
    });
  });

  describe('factions', () => {
    it('applies the matchup multiplier to damage', () => {
      const encounter = stage(
        line([unit('victim', { hp: 5000, atk: 0, def: 0, haste: 1 }, { faction: 'weak' })]),
      );
      const plain = fight(
        line([unit('hero', { atk: 50, def: 0 }, { faction: 'neutral' })]),
        encounter,
        SEED,
        TEST_COMBAT_RULES,
      );
      const favoured = fight(
        line([unit('hero', { atk: 50, def: 0 }, { faction: 'strong' })]),
        encounter,
        SEED,
        TEST_COMBAT_RULES,
      );

      expect(firstHit(plain).eq(50)).toBe(true);
      expect(firstHit(favoured).eq(100)).toBe(true);
    });
  });

  describe('skills', () => {
    it('opens every fight with an empty bar, on both sides', () => {
      // The single most consequential difference between energy and the MP pool it replaced. MP
      // started full, so a caster front-loaded and ran dry; energy starts at nothing, so an
      // ultimate is a payoff for a fight that has gone on rather than an opening move.
      const result = fight(
        line([
          unit('mage', { hp: 1000, atk: 60, energyRegen: 30, haste: 100 }, { skills: [FIREBALL] }),
        ]),
        stage(line([unit('mook', { hp: 5000, atk: 10, haste: 100 })])),
      );

      expect(result.roster.map((combatant) => combatant.energy)).toEqual([0, 0]);
    });

    it('holds an ultimate until the bar fills, then spends the whole of it', () => {
      // 30 regen a turn plus 10 for landing a hit reaches 100 on the third turn, and the cast
      // reports an emptied bar. The mook is too slow to answer, so nothing muddies the count
      // with `onHurt`.
      const result = fight(
        line([
          unit('mage', { hp: 1000, atk: 60, energyRegen: 30, haste: 100 }, { skills: [FIREBALL] }),
        ]),
        stage(line([unit('mook', { hp: 500_000, atk: 0, haste: 1 })])),
      );

      const casts = result.events.filter((event) => event.kind === 'cast');
      expect(casts.slice(0, 3)).toMatchObject([
        { skillId: 'fireball', tick: 30, energy: 0 },
        { skillId: 'fireball', tick: 60, energy: 0 },
        { skillId: 'fireball', tick: 90, energy: 0 },
      ]);
    });

    it('swings while the bar is refilling', () => {
      // The turns between ultimates are basic attacks rather than nothing, which is what makes a
      // slow-charging kit a real kit instead of a pause.
      const result = fight(
        line([
          unit('mage', { hp: 1000, atk: 60, energyRegen: 30, haste: 100 }, { skills: [FIREBALL] }),
        ]),
        stage(line([unit('mook', { hp: 500_000, atk: 0, haste: 1 })])),
      );

      const casts = new Set(
        result.events.filter((event) => event.kind === 'cast').map((event) => event.tick),
      );
      const swings = attackTicks(result).filter((tick) => !casts.has(tick));
      expect(swings.slice(0, 4)).toEqual([10, 20, 40, 50]);
    });

    // The fixture rules pay a round ten for each of the three energy sources — deliberately not
    // the shipped numbers, so these assertions fail when the rule changes rather than when the
    // ladder is retuned. See `TEST_COMBAT_RULES_DATA`.
    const GAIN = 10;

    /** A three-wide front rank of punchbags, for the two credit rules. */
    const punchbags = (): FormationData =>
      line([
        unit('mook-a', { hp: 500_000, atk: 0, haste: 1 }),
        unit('mook-b', { hp: 500_000, atk: 0, haste: 1 }),
        unit('mook-c', { hp: 500_000, atk: 0, haste: 1 }),
      ]);

    it('credits the attacker once for an action however many targets it reaches', () => {
      // ⚠️ The rule that stops a wide ultimate from refuelling itself. `onHit` is paid per
      // *action*, so a three-target sweep banks one gain rather than three — otherwise the widest
      // skill in the game would charge its own next cast and the meter would come off the fight.
      //
      // The bar is emptied by the cast, so what these three events report is the single credit.
      const result = fight(
        line([
          unit('sweeper', { hp: 1000, atk: 60, energyRegen: 100, haste: 100 }, { skills: [SWEEP] }),
        ]),
        stage(punchbags()),
      );

      const hits = result.events.filter((event) => event.kind === 'attack' && event.tick === 10);
      expect(hits).toHaveLength(3);
      expect(hits.map((event) => event.kind === 'attack' && event.sourceEnergy)).toEqual([
        GAIN,
        GAIN,
        GAIN,
      ]);
    });

    it('credits a defender for every hit it takes, so being focused charges fastest', () => {
      // The other half of the asymmetry, and the Undead's entire meter. `onHurt` is paid per
      // incoming hit, so the three targets of that same sweep each bank their own.
      const result = fight(
        line([
          unit('sweeper', { hp: 1000, atk: 60, energyRegen: 100, haste: 100 }, { skills: [SWEEP] }),
        ]),
        stage(punchbags()),
      );

      const hits = result.events.filter((event) => event.kind === 'attack' && event.tick === 10);
      expect(hits.map((event) => event.kind === 'attack' && event.targetEnergy)).toEqual([
        GAIN,
        GAIN,
        GAIN,
      ]);
    });

    it('pays energy for healing an ally and nothing for healing itself', () => {
      // The same line `receivedHealing` draws. A life leech and the natural recovery at the top of
      // a turn are a combatant healing itself, and paying for those would charge every bruiser in
      // the game for standing still.
      //
      // Measured as the move against the turn marker that opened the same turn, rather than as an
      // absolute: the medic swings on the turns it is not needed, so its bar is not empty by the
      // time somebody is hurt enough to heal.
      const result = fight(
        line(
          [unit('tank', { hp: 1000, atk: 5, def: 0, haste: 60, recovery: 50 })],
          [unit('medic', { hp: 1000, atk: 40, energyRegen: 0, haste: 100 }, { skills: [MEND] })],
        ),
        stage(line([unit('mook', { hp: 500_000, atk: 200, def: 0, haste: 100 })])),
      );

      /** Energy carried into `key`'s turn at or before `tick`. */
      const openedAt = (key: string, tick: number): number => {
        const turns = result.events.filter(
          (event) => event.kind === 'turn' && event.combatant === key && event.tick <= tick,
        );
        const last = turns[turns.length - 1];
        return last?.kind === 'turn' ? last.energy : 0;
      };

      const mended = result.events.find(
        (event) => event.kind === 'heal' && event.source === 'ally-1' && event.target === 'ally-0',
      );
      const recovered = result.events.find(
        (event) => event.kind === 'heal' && event.source === 'ally-0' && event.target === 'ally-0',
      );

      expect(mended?.kind === 'heal' && mended.sourceEnergy - openedAt('ally-1', mended.tick)).toBe(
        GAIN,
      );
      expect(
        recovered?.kind === 'heal' && recovered.sourceEnergy - openedAt('ally-0', recovered.tick),
      ).toBe(0);
    });

    it('holds an ordinary skill on cooldown however full the bar is', () => {
      // The other meter, and the one an ultimate never carries. A charged bar buys nothing here.
      const result = fight(
        line([
          unit('mage', { hp: 1000, atk: 60, energyRegen: 100, haste: 100 }, { skills: [SEAR] }),
        ]),
        stage(line([unit('mook', { hp: 500_000, atk: 0, haste: 1 })])),
      );

      const casts = result.events
        .filter((event) => event.kind === 'cast')
        .map((event) => event.tick);
      // 30-tick cooldown against a 10-tick turn: every third turn, not every turn.
      expect(casts.slice(0, 3)).toEqual([10, 40, 70]);
    });

    it('skips a heal nobody needs and casts it once somebody does', () => {
      const result = fight(
        line(
          [unit('tank', { hp: 300, atk: 5, def: 0, haste: 60 })],
          [unit('medic', { hp: 400, atk: 40, haste: 100 }, { skills: [MEND] })],
        ),
        stage(line([unit('mook', { hp: 4000, atk: 40, def: 0, haste: 100 })])),
      );

      const firstCast = result.events.find((event) => event.kind === 'cast');
      const firstEnemyHit = result.events.find(
        (event) => event.kind === 'attack' && event.source === 'enemy-0',
      );
      expect(firstCast).toBeDefined();
      expect(firstEnemyHit).toBeDefined();
      expect(firstCast?.tick).toBeGreaterThan(firstEnemyHit?.tick ?? 0);
    });
  });

  describe('statuses', () => {
    it('settles a poison against the target’s resist as it lands', () => {
      // The collapse to one `atk` took `damageType`'s old job away — it no longer chooses which
      // attack stat a poison is priced against — and this is the job it took on instead. Without
      // it the field would have no consumer at all, and a wall that shrugged off swords but not
      // bleeds would be a hole in the one axis 8a moved onto the resists.
      //
      // Settled at application rather than per tick, for the same reason the quantity itself is:
      // a poison does not stop hurting when its caster dies, so it should not start hurting more
      // when the body it is sitting on drops its guard.
      const dart = (defender: CombatantData): BattleResult =>
        fight(
          line([unit('rogue', { hp: 1000, atk: 40, haste: 100 }, { skills: [POISON_DART] })]),
          stage(line([defender])),
        );
      const bare = dart(unit('mook', { hp: 100_000, atk: 0, haste: 100 }));
      const armoured = dart(
        unit('golem', { hp: 100_000, atk: 0, haste: 100, physicalResist: 0.5 }),
      );
      const warded = dart(unit('ghost', { hp: 100_000, atk: 0, haste: 100, magicResist: 0.5 }));

      const bite = (result: BattleResult): number => {
        const tick = result.events.find((event) => event.kind === 'tick-damage');
        expect(tick).toBeDefined();
        return tick?.kind === 'tick-damage' ? tick.damage.toNumber() : 0;
      };

      expect(bite(armoured)).toBeCloseTo(bite(bare) / 2, 6);
      // The poison is physical, so a magic resist is the wrong answer to it.
      expect(bite(warded)).toBeCloseTo(bite(bare), 6);
    });

    it('ticks a poison on its host’s own turn and stops when it expires', () => {
      const result = fight(
        line([unit('rogue', { hp: 1000, atk: 40, haste: 100 }, { skills: [POISON_DART] })]),
        stage(line([unit('mook', { hp: 100_000, atk: 0, haste: 100 })])),
      );

      const ticks = result.events
        .filter((event) => event.kind === 'tick-damage')
        .map((event) => event.tick);
      expect(ticks.length).toBeGreaterThan(0);
      for (const tick of ticks) {
        expect(tick % 10).toBe(0);
      }
      expect(
        result.events.some(
          (event) => event.kind === 'status-expired' && event.statusId === 'test-poison',
        ),
      ).toBe(true);
    });

    it('spends a turn to a stun and still consumes the gauge, so a lock cannot deadlock', () => {
      const result = fight(
        line([unit('hero', { hp: 5000, atk: 60, haste: 100 })]),
        stage(
          line([unit('binder', { hp: 900, atk: 5, haste: 100, insight: 1 }, { skills: [BIND] })]),
        ),
      );

      const stunned = result.events.filter((event) => event.kind === 'stunned');
      expect(stunned.length).toBeGreaterThan(0);
      // The victim keeps arriving at the front of the queue rather than being frozen out of it.
      // Read off `timedOut` rather than the outcome: a stun lock would show up as the clock
      // running out, and since that reports `defeat` the outcome alone can no longer say so.
      expect(result.timedOut).toBe(false);
    });

    it('absorbs damage into a shield before HP, and reports both halves', () => {
      const result = fight(
        line([
          unit('guard', { hp: 1000, atk: 100, def: 0, haste: 200 }, { skills: [BARRIER_SKILL] }),
        ]),
        stage(line([unit('mook', { hp: 100_000, atk: 40, def: 0, haste: 100 })])),
      );

      const absorbed = result.events.find(
        (event) => event.kind === 'attack' && event.source === 'enemy-0' && event.absorbed.gt(ZERO),
      );
      expect(absorbed).toBeDefined();
      if (absorbed?.kind === 'attack') {
        expect(absorbed.damage.lt(absorbed.absorbed)).toBe(true);
      }
    });

    it('names the statuses a cleanse removed rather than counting them', () => {
      // A count cannot reproduce the board: an animator holding two debuffs and told "one was
      // removed" has to guess which badge to drop, and disagrees with the simulation from then on.
      const result = fight(
        line([
          unit('victim', { hp: 4000, atk: 5, haste: 100 }),
          unit('cleric', { hp: 4000, atk: 40, energyRegen: 20, haste: 100 }, { skills: [PURIFY] }),
        ]),
        stage(
          line([
            unit(
              'hexer',
              { hp: 100_000, atk: 30, haste: 100, insight: 1 },
              { skills: [POISON_DART] },
            ),
          ]),
        ),
      );

      const cleanse = result.events.find((event) => event.kind === 'cleanse');
      expect(cleanse).toMatchObject({ kind: 'cleanse', removed: ['test-poison'] });
    });

    it('refreshes a status rather than stacking a second copy of it', () => {
      // The target has to outlast the fight for its final statuses to be worth reading: a fallen
      // combatant drops everything it was carrying, which is what keeps the log's replay honest
      // about corpses.
      const result = fight(
        line([unit('rogue', { hp: 1000, atk: 40, haste: 200 }, { skills: [QUICK_DART] })]),
        stage(line([unit('mook', { hp: 300_000, atk: 0, haste: 1 })])),
      );

      const applied = result.events.filter((event) => event.kind === 'status');
      expect(applied.length).toBeGreaterThan(1);
      expect(result.final.find((c) => c.key === 'enemy-0')?.statuses).toHaveLength(1);
    });
  });

  describe('taunt', () => {
    /** A board with one body in front and something fragile standing behind it. */
    const guarded = (opening?: readonly StatusData[]): StageData =>
      stage(
        line(
          [unit('brute', { hp: 100_000, atk: 0, haste: 1 }, { opening })],
          [unit('mage', { hp: 100_000, atk: 0, haste: 1 })],
        ),
      );

    it('draws a back-rank bypass onto the taunter', () => {
      // ⚠️ **The whole point of the mechanic, and the one thing in the game that can close the
      // back door.** Reach has been the answer to a protected healer since milestone 4, so a
      // sniper aimed past the front rank is exactly the case that has to change — otherwise a
      // taunt is a status the party's best answer walks around.
      const sniper = line([unit('rin', { hp: 2000, atk: 60, haste: 100 }, { skills: [SNIPE] })]);

      expect(new Set(attackTargets(fight(sniper, guarded())))).toEqual(new Set(['enemy-1']));
      expect(new Set(attackTargets(fight(sniper, guarded([TAUNT]))))).toEqual(new Set(['enemy-0']));
    });

    it('is ignored by a skill that reaches a whole row', () => {
      // The clause that keeps an encounter built on a taunt answerable. A party with no way past
      // it at all would be the "no legal party" failure milestone 4 rejected role-locked slots
      // for — so the door closes on single targets and on nothing else.
      const volleyer = line([unit('rin', { hp: 2000, atk: 60, haste: 100 }, { skills: [VOLLEY] })]);

      expect(attackTargets(fight(volleyer, guarded([TAUNT])))).toContain('enemy-1');
    });

    it('can be put up mid-fight, and redirects only while it is running', () => {
      // Applied by a skill rather than carried from the opening, because the two are genuinely
      // different code paths — `toActiveStatus` against the applier, then `applyStatus` onto the
      // target — and an opening-only test would leave the second one unproven.
      // Rin is faster than the brute on purpose, so the fight has a window before the taunt is up
      // — otherwise the first swing already lands into one and the test proves only half of what
      // it claims.
      const sniper = line([unit('rin', { hp: 4000, atk: 40, haste: 200 }, { skills: [SNIPE] })]);
      const board = stage(
        line(
          [unit('brute', { hp: 100_000, atk: 0, haste: 100 }, { skills: [PROVOKE] })],
          [unit('mage', { hp: 100_000, atk: 0, haste: 1 })],
        ),
      );

      const targets = attackTargets(fight(sniper, board));

      // The first swing goes past the brute, because nothing is taunting yet; a later one does
      // not, because by then something is.
      expect(targets[0]).toBe('enemy-1');
      expect(targets).toContain('enemy-0');
    });
  });

  describe('reflect', () => {
    const thorned = (extra: Partial<StatBlockData> = {}): StageData =>
      stage(
        line([unit('bramble', { hp: 100_000, atk: 0, haste: 1, ...extra }, { opening: [THORNS] })]),
      );

    /** Every hit a status landed, by the status that landed it. */
    const statusHits = (result: BattleResult, statusId: string): Numeric[] =>
      result.events
        .filter((event) => event.kind === 'tick-damage' && event.statusId === statusId)
        .map((event) => (event.kind === 'tick-damage' ? event.damage : ZERO));

    it('returns a share of the damage it took to whoever dealt it', () => {
      const result = fight(line([unit('hero', { hp: 100_000, atk: 60, haste: 100 })]), thorned());
      const answered = statusHits(result, 'test-thorns');

      expect(answered.length).toBeGreaterThan(0);
      expect(answered[0].toNumber()).toBeCloseTo(firstHit(result).mul(0.5).toNumber(), 6);
    });

    it('answers the killing blow as well as every other one', () => {
      // ⚠️ Read off the target **before** the blow lands, because a fighter that falls drops
      // everything it was carrying. Without that, a party with enough burst to finish the job in
      // one swing would step around thorns entirely — taxing exactly the parties this is not
      // aimed at and sparing the one it is.
      const result = fight(
        line([unit('hero', { hp: 100_000, atk: 400, haste: 100 })]),
        stage(line([unit('bramble', { hp: 20, atk: 0, haste: 1 }, { opening: [THORNS] })])),
      );

      expect(result.outcome).toBe('victory');
      expect(statusHits(result, 'test-thorns')).toHaveLength(1);
    });

    it('is swallowed by a shield along with the blow that earned it', () => {
      // Measured against what reached HP rather than against what was dealt — the opposite of the
      // rule life leech follows, and deliberately: a siphon is the attacker's reward for the blow
      // it struck, and this is the answer to a blow that landed.
      const result = fight(
        line([unit('hero', { hp: 100_000, atk: 20, haste: 100 })]),
        stage(
          line([
            // A real `atk`, because the barrier's pool is sized off it — at zero the shield is
            // zero and the spec would be measuring an absorb that never happened.
            unit(
              'bramble',
              { hp: 100_000, atk: 50, haste: 100 },
              { opening: [THORNS], skills: [BARRIER_SKILL] },
            ),
          ]),
        ),
      );

      const shielded = result.events.findIndex(
        (event) => event.kind === 'status' && event.status.id === 'test-shield',
      );
      const afterwards = result.events
        .slice(shielded)
        .filter((event) => event.kind === 'attack' && event.absorbed.gt(ZERO));

      expect(shielded).toBeGreaterThanOrEqual(0);
      expect(afterwards.length).toBeGreaterThan(0);
      for (const hit of afterwards) {
        // Whatever the shield ate is not returned; only what got past it is.
        const answer = result.events.find(
          (event) =>
            event.kind === 'tick-damage' &&
            event.statusId === 'test-thorns' &&
            event.tick === hit.tick,
        );
        const returned = answer?.kind === 'tick-damage' ? answer.damage.toNumber() : 0;

        expect(returned).toBeCloseTo(hit.kind === 'attack' ? hit.damage.mul(0.5).toNumber() : 0, 6);
      }
    });

    it('never answers an answer, so two thorned combatants still resolve', () => {
      // ⚠️ **The termination argument, and it is structural rather than a depth counter.**
      // Reflected damage is applied as status damage, which cannot re-enter the attack path — so
      // there is no volley to bound. A cascade would not fail this assertion, it would blow the
      // stack before reaching it.
      const stats = { hp: 4000, atk: 60, haste: 100 };
      const result = fight(
        line([unit('hero', stats, { opening: [THORNS] })]),
        stage(line([unit('bramble', stats, { opening: [THORNS] })])),
      );

      expect(result.timedOut).toBe(false);
      expect(result.ticks).toBeLessThan(MAX_BATTLE_TICKS);
      // One answer per landed blow, from each side. Anything more is a cascade.
      const blows = result.events.filter((event) => event.kind === 'attack').length;
      expect(statusHits(result, 'test-thorns')).toHaveLength(blows);
    });

    it('can kill the attacker inside its own action, and stops the swing when it does', () => {
      // Nothing could kill an actor mid-action before this existed. A corpse must not finish
      // swinging through the rest of a row.
      const result = fight(
        line([unit('glass', { hp: 30, atk: 400, haste: 100 }, { skills: [VOLLEY] })]),
        stage(
          line(
            [unit('front', { hp: 100_000, atk: 0, haste: 1 })],
            [
              unit('bramble-a', { hp: 100_000, atk: 0, haste: 1 }, { opening: [THORNS] }),
              unit('bramble-b', { hp: 100_000, atk: 0, haste: 1 }, { opening: [THORNS] }),
            ],
          ),
        ),
      );

      // The first thorn kills the attacker, so the second bramble is never reached.
      expect(result.outcome).toBe('defeat');
      expect(attackTargets(result)).toEqual(['enemy-1']);
    });
  });

  describe('the damage link', () => {
    /** Three bound bodies, so a hit has two places to go. */
    const bound = (count: number): StageData => {
      const bodies = Array.from({ length: count }, (_, index) =>
        unit(`bound-${index}`, { hp: 100_000, atk: 0, haste: 1 }, { opening: [BOND] }),
      );
      return stage(line(bodies.slice(0, 1), bodies.slice(1)));
    };

    const spread = (result: BattleResult): Numeric[] =>
      result.events
        .filter((event) => event.kind === 'tick-damage' && event.statusId === 'test-bond')
        .map((event) => (event.kind === 'tick-damage' ? event.damage : ZERO));

    it('moves a share of the hit onto the linked allies and invents none of it', () => {
      // ⚠️ **Conservation is the termination argument.** The board's aggregate health falls by
      // exactly what the roll produced, so a link changes the order things die in and never how
      // long the side survives — which is what makes it safe to hand a whole enemy board.
      const result = fight(line([unit('hero', { hp: 100_000, atk: 60, haste: 100 })]), bound(3));

      // ⚠️ **The `attack` event reports what the target *took*, not what the roll produced** — the
      // link has already moved its share by the time the blow lands. So with a share of a half the
      // roll was twice this, and each of the two partners was handed half of the other half.
      const took = firstHit(result);
      const shares = spread(result).slice(0, 2);

      expect(shares).toHaveLength(2);
      for (const share of shares) {
        expect(share.toNumber()).toBeCloseTo(took.div(2).toNumber(), 6);
      }
      // Conservation, stated as arithmetic: the board lost exactly the roll, no more and no less.
      const total = shares.reduce((sum, share) => sum.add(share), took);
      expect(total.toNumber()).toBeCloseTo(took.mul(2).toNumber(), 6);
    });

    it('hands the whole hit to a holder with nobody left to share it with', () => {
      // ⚠️ Without this clause a lone survivor still carrying a link would shed a share of every
      // blow into nothing and become unkillable — a fight the ninety-second clock would have to
      // end, which is precisely the failure closing pressure exists to prevent.
      const result = fight(line([unit('hero', { hp: 100_000, atk: 60, haste: 100 })]), bound(1));
      const control = fight(
        line([unit('hero', { hp: 100_000, atk: 60, haste: 100 })]),
        stage(line([unit('bound-0', { hp: 100_000, atk: 0, haste: 1 })])),
      );

      expect(spread(result)).toEqual([]);
      expect(firstHit(result).toString()).toBe(firstHit(control).toString());
    });

    it('does not spread a share it was handed', () => {
      // The partners hold the same link, so a cascading implementation would move a share of
      // their share back and forth. Two events per blow is the whole of what one hit may produce.
      const result = fight(line([unit('hero', { hp: 100_000, atk: 60, haste: 100 })]), bound(3));

      const blows = result.events.filter((event) => event.kind === 'attack').length;
      expect(spread(result)).toHaveLength(blows * 2);
    });
  });

  describe('delayed detonation', () => {
    it('does nothing until it expires, and then lands in one piece', () => {
      const result = fight(
        line([unit('sapper', { hp: 100_000, atk: 50, haste: 20 }, { skills: [SEEDED_CHARGE] })]),
        stage(line([unit('mook', { hp: 100_000, atk: 0, haste: 1 })])),
      );

      const planted = result.events.find(
        (event) => event.kind === 'status' && event.status.id === 'test-bomb',
      );
      const landed = result.events.filter(
        (event) => event.kind === 'tick-damage' && event.statusId === 'test-bomb',
      );

      expect(planted).toBeDefined();
      expect(landed).toHaveLength(1);
      // Thirty ticks after it was planted, and worth four times the applier's `atk` in one go —
      // which is the difference from a poison of the same total, not a difference in size.
      expect(landed[0].tick - (planted?.tick ?? 0)).toBe(30);
      expect(landed[0].kind === 'tick-damage' ? landed[0].damage.toNumber() : 0).toBeCloseTo(
        200,
        6,
      );
    });

    it('is removed entirely by a cleanse spent before it lands', () => {
      // ⚠️ The counterplay, and the reason this is not simply a poison that pays late: a cleanse
      // against a poison saves whatever was left of it, and a cleanse against this saves all of
      // it. That is what makes *when* to spend the answer the decision.
      const result = fight(
        line([
          unit('mook', { hp: 100_000, atk: 0, haste: 1 }),
          unit('priest', { hp: 100_000, atk: 10, haste: 100 }, { skills: [PURIFY] }),
        ]),
        stage(
          line([unit('sapper', { hp: 100_000, atk: 50, haste: 20 }, { skills: [SEEDED_CHARGE] })]),
        ),
      );

      expect(
        result.events.some((event) => event.kind === 'status' && event.status.id === 'test-bomb'),
      ).toBe(true);
      expect(
        result.events.some(
          (event) => event.kind === 'tick-damage' && event.statusId === 'test-bomb',
        ),
      ).toBe(false);
    });

    it('ends the fight when the detonation is what finishes the last body', () => {
      // ⚠️ **The reason `decide` is called after the expiry pass at all.** Before bombs nothing
      // could kill at an expiry, so the last combatant could fall to one and the fight would run
      // on until somebody's turn came around to notice.
      const result = fight(
        line([unit('sapper', { hp: 100_000, atk: 50, haste: 20 }, { skills: [SEEDED_CHARGE] })]),
        stage(line([unit('mook', { hp: 150, atk: 0, haste: 1 })])),
      );

      expect(result.outcome).toBe('victory');
      const end = result.events.at(-1);
      const detonation = result.events
        .filter((event) => event.kind === 'tick-damage' && event.statusId === 'test-bomb')
        .at(-1);

      expect(detonation).toBeDefined();
      expect(end?.tick).toBe(detonation?.tick);
    });
  });

  describe('the event log', () => {
    it('reproduces the final standings exactly when replayed', () => {
      // The log is the only thing the UI is given, so it has to be complete: replaying it must
      // land on the same board the simulation finished with, or the animation and the run
      // disagree for the rest of the fight.
      //
      // **HP is not enough to check, and that is the whole reason this asserts four things.** A
      // damage-over-time tick against a barrier drains the barrier and reaches no HP at all, so
      // an event that carried only `targetHp` reported `0` and looked perfectly correct while the
      // animator's shield stayed full — which is precisely the bug this used to miss.
      const result = fight(
        line(
          [unit('bran', { hp: 900, atk: 80, haste: 90 }, { skills: [BARRIER_SKILL] })],
          [unit('rin', { hp: 400, atk: 60, critChance: 0.3 }, { skills: [POISON_DART] })],
        ),
        stage(
          line(
            [unit('slime', { hp: 900, atk: 22 }, { skills: [POISON_DART] })],
            [unit('shaman', { hp: 600, atk: 70, haste: 80 }, { skills: [BARRIER_SKILL] })],
          ),
        ),
      );

      const board = replay(result);

      expect(board.hp).toEqual(boardOf(result.final).hp);
      expect(board.energy).toEqual(boardOf(result.final).energy);
      expect(board.shield).toEqual(boardOf(result.final).shield);
      expect(board.statuses).toEqual(boardOf(result.final).statuses);
    });

    it('replays a board carrying thorns, a link and a delayed payload', () => {
      // The same promise against the milestone-17 statuses, and the reason it is a second fight
      // rather than a bigger first one: three of the four produce damage from **outside a turn** —
      // thorns answering a blow, a link paying an ally mid-hit, a bomb going off at an expiry —
      // and all three reach the animator as `tick-damage` on somebody who is not acting. An event
      // stream that dropped any of them would leave the board full of health the run had spent.
      const result = fight(
        line(
          [unit('bran', { hp: 1400, atk: 70, haste: 90 }, { skills: [SEEDED_CHARGE] })],
          [unit('rin', { hp: 500, atk: 55, haste: 110 }, { skills: [SNIPE] })],
        ),
        stage(
          line(
            [unit('warden', { hp: 1200, atk: 40, haste: 80 }, { opening: [TAUNT, THORNS, BOND] })],
            [unit('choir', { hp: 900, atk: 45, haste: 95 }, { opening: [BOND] })],
          ),
        ),
      );

      const board = replay(result);

      expect(board.hp).toEqual(boardOf(result.final).hp);
      expect(board.energy).toEqual(boardOf(result.final).energy);
      expect(board.shield).toEqual(boardOf(result.final).shield);
      expect(board.statuses).toEqual(boardOf(result.final).statuses);
    });

    it('records a defeat the moment a combatant reaches zero, and only once', () => {
      const result = fight(
        line([unit('hero', { hp: 1000, atk: 100 })]),
        stage(line([unit('mook', { hp: 50, atk: 0 })])),
      );

      const defeats = result.events.filter((event) => event.kind === 'defeat');
      expect(defeats).toHaveLength(1);
      expect(defeats[0]).toMatchObject({ combatant: 'enemy-0' });
    });

    it('never reports negative HP', () => {
      const result = fight(
        line([unit('hero', { hp: 1000, atk: 5000 })]),
        stage(line([unit('mook', { hp: 10, atk: 0 })])),
      );

      for (const event of result.events) {
        if (event.kind === 'attack') {
          expect(event.targetHp.gte(0)).toBe(true);
        }
      }
    });

    it('closes with exactly one end event', () => {
      const result = fight(line([unit('hero', { atk: 100 })]), stage(line([unit('mook')])));

      expect(result.events.filter((event) => event.kind === 'end')).toHaveLength(1);
      expect(result.events.at(-1)?.kind).toBe('end');
    });

    it('is ordered by tick throughout', () => {
      const result = fight(
        line(
          [unit('rin', { hp: 400, atk: 60, haste: 118 }, { skills: [POISON_DART] })],
          [unit('bran', { hp: 900, atk: 30, haste: 70 })],
        ),
        stage(
          line(
            [unit('slime', { hp: 400, atk: 22 })],
            [unit('wisp', { hp: 200, atk: 18, haste: 148 })],
          ),
        ),
      );

      let last = -1;
      for (const event of result.events) {
        expect(event.tick).toBeGreaterThanOrEqual(last);
        last = event.tick;
      }
    });

    it('stops acting once the battle is decided', () => {
      // A combatant killed earlier in the same tick must not still swing, and nothing may act
      // after the last enemy falls.
      const result = fight(
        line([
          unit('a', { hp: 1000, atk: 100, haste: 100 }),
          unit('b', { hp: 1000, atk: 100, haste: 100 }),
        ]),
        stage(line([unit('mook', { hp: 30, atk: 0, haste: 100 })])),
      );

      expect(result.events.filter((event) => event.kind === 'attack')).toHaveLength(1);
    });
  });

  describe('naming', () => {
    it('numbers repeated copies so the log stays readable', () => {
      const result = fight(
        line([unit('hero', { atk: 100 })]),
        stage(line([unit('slime'), unit('slime')], [unit('slime')])),
      );

      const enemies = result.roster.filter((c) => c.side === 'enemy');
      expect(enemies.map((c) => c.name)).toEqual(['slime 1', 'slime 2', 'slime 3']);
      expect(enemies.map((c) => c.key)).toEqual(['enemy-0', 'enemy-1', 'enemy-2']);
    });

    it('leaves a single copy unnumbered', () => {
      const result = fight(line([unit('hero', { atk: 100 })]), stage(line([unit('slime')])));

      expect(result.roster.find((c) => c.side === 'enemy')?.name).toBe('slime');
    });
  });

  describe('termination', () => {
    it('calls time on a fight nobody can finish, and calls it a defeat', () => {
      // The damage formula guarantees a battle ends eventually, but "eventually" can be 1e24
      // turns. A synchronous function on the main thread needs a hard ceiling, and a balance
      // sweep needs one even more.
      //
      // Running the clock out is losing. The party did not clear the stage, so `defeat` is what
      // the player is told — there is no third outcome to explain.
      const result = fight(
        line([unit('pebble', { hp: 1000, atk: 1, def: '1e12', haste: 100 })]),
        stage(line([unit('mountain', { hp: '1e12', atk: 0, def: '1e12', haste: 100 })])),
      );

      expect(result.outcome).toBe('defeat');
      expect(result.ticks).toBe(MAX_BATTLE_TICKS);
      expect(result.events.at(-1)).toMatchObject({ kind: 'end', outcome: 'defeat' });
    });

    it('records that the clock was what ended it, separately from the outcome', () => {
      // ⚠️ `timedOut` is the successor to the zero-stalemates balance assertion. On screen a
      // timeout and a wipe are the same defeat; in a sweep they are not remotely the same thing,
      // and an over-tuned sustain kit is invisible without this flag.
      const stalled = fight(
        line([unit('pebble', { hp: 1000, atk: 1, def: '1e12', haste: 100 })]),
        stage(line([unit('mountain', { hp: '1e12', atk: 0, def: '1e12', haste: 100 })])),
      );
      const killed = fight(
        line([unit('victim', { hp: 1, atk: 1, haste: 100 })]),
        stage(line([unit('killer', { hp: 5000, atk: 500, haste: 200 })])),
      );

      expect(stalled.timedOut).toBe(true);
      expect(killed.timedOut).toBe(false);
      expect(killed.outcome).toBe('defeat');
    });

    it('pays nothing for a fight the clock ended', () => {
      // `reward` keys off the outcome, and the outcome for a timed-out fight is now the same
      // `defeat` a wipe produces — so this asserts the timer cannot become a way to farm a stage
      // by standing in it.
      const result = fight(
        line([unit('pebble', { hp: 1000, atk: 1, def: '1e12', haste: 100 })]),
        stage(line([unit('mountain', { hp: '1e12', atk: 0, def: '1e12', haste: 100 })])),
      );

      expect(result.reward.gained).toEqual({});
      expect(result.reward.rates).toEqual({});
      expect(result.reward.firstClearSummons.eq(0)).toBe(true);
    });

    it('gives a fight ninety seconds, which is the rule and not only a guard', () => {
      // The cap is quoted in ticks and felt in seconds, and the two drifting apart is exactly how
      // a thirty-minute battle shipped unnoticed. Asserting the conversion keeps the number in
      // `clock.ts` honest about what it means.
      expect(ticksToMs(MAX_BATTLE_TICKS)).toBe(90_000);
    });

    it('breaks a sustain loop that neither side can win, without the clock deciding it', () => {
      // ⚠️ **The termination argument milestone 8b deleted and milestone 14 put back.** The MP
      // pool used to guarantee that a fight against a healer resolves; energy only ever refills,
      // so for six milestones this rested entirely on the ninety-second timer — which is not a
      // termination argument, it is what fires when one is missing.
      //
      // Two combatants that each out-heal the other's damage is the whole failure in miniature,
      // and it is exactly what the milestone-14 retune surfaced on `c2-s13` and `c2-s23`
      // (`c4-s3` and `c4-s13` since the six-chapter re-cut): a lone
      // Hierophant topping itself up against a party that had already killed everything else.
      // `pressureAt` amplifies damage and deliberately does not amplify healing, so the loop is
      // broken by arithmetic rather than by a timeout being reported as a defeat.
      // Tuned to a knife edge on purpose: at the neutral multiplier the heal just out-paces the
      // damage, so this fight is a genuine stalemate for its first fifty seconds and resolves
      // only because the multiplier climbs afterwards.
      const selfMend: SkillData = {
        id: 'self-mend',
        name: 'Self Mend',
        target: 'self',
        effects: [{ kind: 'heal', power: 1.2 }],
        cooldown: 25,
        condition: { kind: 'self-hurt', fraction: 0.99 },
        priority: 9,
      };
      const stats = { hp: 900, atk: 40, def: 40, haste: 100 };
      const result = fight(
        line([unit('warden', stats, { skills: [selfMend] })]),
        stage(line([unit('abbot', stats, { skills: [selfMend] })])),
      );

      expect(result.timedOut).toBe(false);
      expect(result.ticks).toBeLessThan(MAX_BATTLE_TICKS);
    });

    it('still finishes against a combatant that dodges almost everything', () => {
      // The hit-chance floor is the reason. Without it, a stacked dodge pool would make every
      // fight against it a run to the tick cap.
      const result = fight(
        line([unit('hero', { hp: 5000, atk: 60, accuracy: 0 })]),
        stage(line([unit('ghost', { hp: 200, atk: 0, dodge: 1, haste: 1 })])),
      );

      expect(result.outcome).toBe('victory');
      expect(result.ticks).toBeLessThan(MAX_BATTLE_TICKS);
    });

    it('resolves instantly when a side is empty', () => {
      const noEnemies = fight(line([unit('hero')]), stage(line([])));
      const noParty = fight(line([]), stage(line([unit('mook')])));

      expect(noEnemies.outcome).toBe('victory');
      expect(noEnemies.ticks).toBe(0);
      // A battle entered with nobody is a loss, not a walkover.
      expect(noParty.outcome).toBe('defeat');
      expect(fight(line([]), stage(line([]))).outcome).toBe('defeat');
    });

    it('prices the fight in game time', () => {
      const result = fight(
        line([unit('swift', { hp: 1000, atk: 10, def: 0, haste: 200 })]),
        stage(line([unit('slow', { hp: 25, atk: 0, def: 0, haste: 100 })])),
      );

      expect(result.durationMs).toBe(ticksToMs(result.ticks));
      expect(result.durationMs).toBe(ticksToMs(15));
    });
  });
});

describe('the lineup bonus in a battle', () => {
  /** Two of a faction is the fixture ladder's only rung, and it doubles attack and health. */
  const pair = (faction: string, stats: Partial<StatBlockData> = {}): FormationData =>
    line([unit('a', stats, { faction }), unit('b', stats, { faction })]);

  it('multiplies the opening health of a party that qualified', () => {
    const qualified = fight(pair('same'), stage(line([unit('foe')])), SEED, LINEUP_COMBAT_RULES);
    const rainbow = fight(
      line([unit('a', {}, { faction: 'one' }), unit('b', {}, { faction: 'two' })]),
      stage(line([unit('foe')])),
      SEED,
      LINEUP_COMBAT_RULES,
    );

    const health = (result: BattleResult): Numeric =>
      result.roster.find((combatant) => combatant.side === 'ally')?.maxHp ?? ZERO;

    expect(health(qualified).eq(health(rainbow).mul(2))).toBe(true);
  });

  it('does not pay one to the enemy formation', () => {
    // ⚠️ The decision `buildSide` documents, pinned. An enemy line-up is authored, so a bonus
    // derived from it is a stat block with a hidden step — and a symmetric rule would silently
    // retune every stage on the ladder, hardest at the mono-faction end where it is easiest.
    const foes = line([
      unit('foe', {}, { faction: 'same' }),
      unit('foe2', {}, { faction: 'same' }),
    ]);
    const withBonus = fight(line([unit('hero')]), stage(foes), SEED, LINEUP_COMBAT_RULES);
    const without = fight(line([unit('hero')]), stage(foes), SEED, PLAIN_COMBAT_RULES);

    const enemyHealth = (result: BattleResult): string =>
      result.roster
        .filter((c) => c.side === 'enemy')
        .map((c) => c.maxHp.toString())
        .join(',');

    expect(enemyHealth(withBonus)).toBe(enemyHealth(without));
  });

  it('pays the injured-energy clause only once health has actually fallen', () => {
    // The one clause that cannot be folded into a stat block, so it is the one that needs a
    // battle to test rather than a call to `applyLineupBonus`.
    //
    // Measured by varying **only the threshold**, against one party and one seed. These units
    // have no ultimate, so energy is never spent and never changes a decision — the two runs are
    // therefore the same fight tick for tick, and every difference in the numbers below is the
    // clause and nothing else. What a fight pays is zeroed out for the same reason: with the drip
    // as the only source, the meter is a direct readout of the thing under test.
    const threshold = (injuredBelow: number): CombatRules =>
      toCombatRules({
        ...LINEUP_COMBAT_RULES_DATA,
        energy: { onHit: 0, onHurt: 0, onHeal: 0 },
        lineup: { ...LINEUP_COMBAT_RULES_DATA.lineup, injuredBelow },
      });

    // Two of the ladder faction, which is what the fixture's second step asks for.
    const party = line([
      unit('a', { hp: 300, energyRegen: 3 }, { faction: 'ladder' }),
      unit('b', { hp: 300, energyRegen: 3 }, { faction: 'ladder' }),
    ]);
    const encounter = stage(line([unit('foe', { hp: 1500, atk: 30 })]));

    const drip = (rules: CombatRules): readonly number[] =>
      fight(party, encounter, SEED, rules)
        .events.filter((event) => event.kind === 'turn' && event.combatant === 'ally-0')
        .map((event) => (event.kind === 'turn' ? event.energy : 0));

    // A threshold of zero is a combatant that can never be below it, which disables the clause
    // outright — the same reading `toLineupRules` gives a damaged value.
    const never = drip(threshold(0));
    const injured = drip(threshold(0.5));

    expect(injured.length).toBe(never.length);
    // Full health at the opening bell, so the first turn is the authored drip either way.
    expect(injured[0]).toBe(never[0]);
    // Never behind, and ahead somewhere: the clause only ever adds, and it does add. Asserted as
    // "somewhere" rather than "at the end" because the bar is capped — two meters that both
    // reached full would agree again, which says nothing about how they got there.
    expect(injured.every((energy, turn) => energy >= never[turn])).toBe(true);
    expect(injured.some((energy, turn) => energy > never[turn])).toBe(true);
  });
});

describe('battleSeed', () => {
  it('derives a different seed per stage and per attempt', () => {
    const first = battleSeed(SEED, 'stage-1', 0);

    expect(battleSeed(SEED, 'stage-2', 0)).not.toBe(first);
    expect(battleSeed(SEED, 'stage-1', 1)).not.toBe(first);
    expect(battleSeed(SEED + 1, 'stage-1', 0)).not.toBe(first);
  });

  it('is stable for the same run, stage and attempt', () => {
    expect(battleSeed(SEED, 'stage-3', 7)).toBe(battleSeed(SEED, 'stage-3', 7));
  });

  it('uses the shared derivation rather than a private scheme', () => {
    // So that combat's sub-stream is provably independent of the pull stream, which is what
    // stops a replayed battle from shifting the gacha sequence.
    expect(battleSeed(SEED, 'stage-4', 2)).toBe(deriveSeed(SEED, 'battle:stage-4:2'));
  });

  it('returns a uint32', () => {
    const seed = battleSeed(SEED, 'stage-1', 0);

    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });
});

/**
 * Enemy levels: the milestone 10 dial, exercised where it is actually read.
 *
 * A stage authors archetypes at level 1 and a level to field them at, and the simulation resolves
 * the pair itself. These are the two things that has to be true — that the dial moves the enemy,
 * and that moving *both* sides by the same amount moves nothing.
 */
describe('enemy levels', () => {
  /** Doubling per level, so a level is a factor a spec can assert exactly. */
  const DOUBLING: CombatRules = toCombatRules({
    ...PLAIN_COMBAT_RULES_DATA,
    growth: { perLevel: { common: 2, legendary: 2, ascended: 2 }, perAscension: 1 },
  });

  it('fields an archetype at the stage level rather than as authored', () => {
    const encounter = stage(line([unit('ogre', { hp: 100 })]), 100, 2, 4);
    const result = simulateBattle(line([unit('hero')]), encounter, SEED, DOUBLING);
    const ogre = result.roster.find((combatant) => combatant.defId === 'ogre');

    // Level 4 on a doubling curve is three doublings, so 100 HP takes the field as 800.
    expect(ogre?.maxHp.toString()).toBe('800');
  });

  it('leaves a level-1 stage exactly as authored, whatever the curve says', () => {
    const encounter = stage(line([unit('ogre', { hp: 100 })]));
    const result = simulateBattle(line([unit('hero')]), encounter, SEED, DOUBLING);
    const ogre = result.roster.find((combatant) => combatant.defId === 'ogre');

    expect(ogre?.maxHp.toString()).toBe('100');
  });

  it('resolves the same fight when both sides are scaled together', () => {
    // ⚠️ **The property milestone 10 rests on**, and the reason a rescale of this size is safe at
    // all. Damage is `atk² / (atk + def)` and every status prices off the applier's `atk`, so
    // multiplying both sides by the same factor is an identity on the whole simulation: the same
    // number of hits land, in the same order, on the same tick. What compounds is the size of the
    // numbers, not the shape of the fight — which is why the ninety-second timer survived a ladder
    // that now spans ×370 instead of ×6, and why the faction matrix needed no rework.
    //
    // The multiplier is a **factor of two per level** rather than the shipped 1.021 on purpose:
    // `Decimal` is not exactly distributive, and a fight decided by a hit landing on the last
    // point of health could legitimately round the other way. Powers of two are exact, so a
    // failure here is a real asymmetry rather than a rounding artefact.
    const base = line([unit('hero', { hp: 400, atk: 60, def: 12 })]);
    const scaled = line([unit('hero', { hp: 3200, atk: 480, def: 96 })]);

    const small = simulateBattle(
      base,
      stage(line([unit('ogre', { hp: 500, atk: 45 })])),
      SEED,
      DOUBLING,
    );
    const large = simulateBattle(
      scaled,
      stage(line([unit('ogre', { hp: 500, atk: 45 })]), 100, 2, 4),
      SEED,
      DOUBLING,
    );

    expect(large.outcome).toBe(small.outcome);
    expect(large.ticks).toBe(small.ticks);
    expect(attackTicks(large)).toEqual(attackTicks(small));
    expect(attackTargets(large)).toEqual(attackTargets(small));
    // The numbers themselves did compound, which is the half of the claim the equalities above
    // cannot see: an identical fight and identical damage would mean the dial did nothing.
    expect(firstHit(large).div(firstHit(small)).toNumber()).toBeCloseTo(8);
  });
});

// ---------------------------------------------------------------------------------------
// Fixture kits
//
// Authored here rather than pulled from `data/`: `core/` cannot see content, and a spec built
// on the shipped skills would fail every time one was retuned — exactly the coupling the
// layering rule exists to prevent.
// ---------------------------------------------------------------------------------------

const SNIPE: SkillData = {
  id: 'snipe',
  name: 'Snipe',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  priority: 5,
};

const FIREBALL: SkillData = {
  id: 'fireball',
  name: 'Fireball',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2 }],
  ultimate: true,
  priority: 5,
};

/** A wide ultimate, for the once-per-action energy credit. */
const SWEEP: SkillData = {
  id: 'sweep',
  name: 'Sweep',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  ultimate: true,
  priority: 5,
};

/** The other meter: free, and gated by a cooldown alone. */
const SEAR: SkillData = {
  id: 'sear',
  name: 'Sear',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2 }],
  cooldown: 30,
  priority: 5,
};

const MEND: SkillData = {
  id: 'test-mend',
  name: 'Mend',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1 }],
  cooldown: 20,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 5,
};

const POISON_DART: SkillData = {
  id: 'poison-dart',
  name: 'Poison Dart',
  target: 'enemy-front',
  effects: [
    {
      kind: 'status',
      status: {
        kind: 'dot',
        id: 'test-poison',
        name: 'Poisoned',
        hostile: true,
        duration: 45,
        damageType: 'physical',
        power: 0.3,
      },
    },
  ],
  // Longer than the status it applies, so the spec can watch one expire rather than watching it
  // be refreshed forever.
  cooldown: 60,
  priority: 5,
};

/**
 * The same poison on a cooldown shorter than its own duration, so it is always running.
 *
 * The distinction from {@link POISON_DART} is the point of having both: that one is deliberately
 * slower than the status it applies so a spec can watch one expire, and this one is deliberately
 * faster so a spec can watch one be re-applied over a copy that has not.
 */
const QUICK_DART: SkillData = {
  ...POISON_DART,
  id: 'quick-dart',
  name: 'Quick Dart',
  cooldown: 20,
};

const BIND: SkillData = {
  id: 'bind',
  name: 'Bind',
  target: 'enemy-front',
  effects: [
    {
      kind: 'status',
      status: { kind: 'stun', id: 'test-stun', name: 'Stunned', hostile: true, duration: 25 },
    },
  ],
  cooldown: 40,
  priority: 5,
};

const BARRIER_SKILL: SkillData = {
  id: 'test-barrier',
  name: 'Barrier',
  target: 'self',
  effects: [
    {
      kind: 'status',
      status: {
        kind: 'shield',
        id: 'test-shield',
        name: 'Barrier',
        hostile: false,
        duration: 200,
        power: 2,
      },
    },
  ],
  cooldown: 400,
  priority: 5,
};

const PURIFY: SkillData = {
  id: 'purify',
  name: 'Purify',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 2 }],
  cooldown: 20,
  condition: { kind: 'ally-afflicted' },
  priority: 5,
};

// ---------------------------------------------------------------------------------------
// The four milestone-17 statuses
//
// Authored as long-running openings wherever a spec only needs one on the board, because what
// almost every assertion below is about is what happens to a *hit*, not how the status got there.
// The two skills exist for the two questions that are about application: whether a taunt can be
// put up mid-fight, and whether a bomb can be cleansed off before it lands.
// ---------------------------------------------------------------------------------------

/**
 * Durations deliberately outlast the ninety-second timer.
 *
 * A status that expires mid-fight would make every assertion below a statement about the first
 * `duration` ticks and about nothing afterwards — which is how the first draft of these specs
 * quietly measured a taunt for two thirds of a fight and untaunted targeting for the rest.
 */
const FOREVER = MAX_BATTLE_TICKS * 2;

const TAUNT: StatusData = {
  kind: 'taunt',
  id: 'test-taunt',
  name: 'Taunting',
  hostile: false,
  duration: FOREVER,
};

const THORNS: StatusData = {
  kind: 'reflect',
  id: 'test-thorns',
  name: 'Thorned',
  hostile: false,
  duration: FOREVER,
  share: 0.5,
};

const BOND: StatusData = {
  kind: 'link',
  id: 'test-bond',
  name: 'Bound',
  hostile: false,
  duration: FOREVER,
  share: 0.5,
};

/** Reaches a whole row, so the spec can show a taunt does not touch multi-target selection. */
const VOLLEY: SkillData = {
  id: 'volley',
  name: 'Volley',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  cooldown: 20,
  priority: 6,
};

const PROVOKE: SkillData = {
  id: 'provoke',
  name: 'Provoke',
  target: 'self',
  effects: [{ kind: 'status', status: TAUNT }],
  cooldown: 400,
  priority: 5,
};

/**
 * A charge that lands nothing now and a great deal in thirty ticks.
 *
 * Deliberately far bigger than a poison of the same total: the whole question a bomb asks is
 * whether the answer arrives before the tick does, and a payload small enough to eat is a payload
 * nobody has to answer.
 */
const SEEDED_CHARGE: SkillData = {
  id: 'seeded-charge',
  name: 'Seeded Charge',
  target: 'enemy-front',
  effects: [
    {
      kind: 'status',
      status: {
        kind: 'bomb',
        id: 'test-bomb',
        name: 'Seeded',
        hostile: true,
        duration: 30,
        damageType: 'physical',
        power: 4,
      },
    },
  ],
  // Longer than the fight, so a spec watching one payload is watching one payload. At 400 it was
  // cast three times inside the ninety seconds and "fires exactly once" measured three bombs.
  cooldown: FOREVER,
  priority: 5,
};
