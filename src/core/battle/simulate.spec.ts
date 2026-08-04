// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type Numeric, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { MAX_BATTLE_TICKS, ticksToMs } from './clock';
import { PLAIN_COMBAT_RULES, TEST_COMBAT_RULES } from './fixtures';
import { battleSeed, simulateBattle } from './simulate';
import {
  type ActiveStatus,
  type BattleResult,
  type CombatantData,
  type CombatRules,
  type FormationData,
  type SkillData,
  type StageData,
  type StatBlockData,
} from './types';

const SEED = 0xc0ffee;

function unit(
  id: string,
  stats: Partial<StatBlockData> = {},
  extra: Partial<Pick<CombatantData, 'faction' | 'basic' | 'skills'>> = {},
): CombatantData {
  return {
    id,
    name: id,
    faction: extra.faction ?? 'neutral',
    basic: extra.basic,
    skills: extra.skills,
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

function stage(
  enemies: FormationData,
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
      expect(result.outcome).not.toBe('stalemate');
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
    it('gives up as a stalemate rather than running forever', () => {
      // The damage formula guarantees a battle ends eventually, but "eventually" can be 1e24
      // turns. A synchronous function on the main thread needs a hard ceiling, and a balance
      // sweep needs one even more.
      const result = fight(
        line([unit('pebble', { hp: 1000, atk: 1, def: '1e12', haste: 100 })]),
        stage(line([unit('mountain', { hp: '1e12', atk: 0, def: '1e12', haste: 100 })])),
      );

      expect(result.outcome).toBe('stalemate');
      expect(result.ticks).toBe(MAX_BATTLE_TICKS);
      expect(result.events.at(-1)).toMatchObject({ kind: 'end', outcome: 'stalemate' });
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
