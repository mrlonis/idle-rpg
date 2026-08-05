// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import { toCombatStats } from './content';
import {
  applyLineupBonus,
  isNeutralLineup,
  lineupBonus,
  NO_LINEUP_BONUS,
  toLineupRules,
} from './lineup';
import { type LineupRules, type LineupRulesData } from './types';

/**
 * Rules shaped like the shipped ones, with its own faction names.
 *
 * `core/` may not import `data/`, and a spec written against the shipped factions would fail
 * every time one was renamed — which is the coupling that rule exists to prevent. The *shape*
 * is what is under test here; `data/combat.spec.ts` is what checks the shipped numbers.
 */
const AUTHORED: LineupRulesData = {
  tiers: [
    { largest: 3, second: 0, attack: 0.1, health: 0.1 },
    { largest: 3, second: 2, attack: 0.15, health: 0.15 },
    { largest: 4, second: 0, attack: 0.15, health: 0.2 },
    { largest: 5, second: 0, attack: 0.25, health: 0.25 },
  ],
  wildcard: 'wild',
  rally: { faction: 'rally', attack: 0.02, health: 0.02 },
  ladder: {
    faction: 'track',
    steps: [
      { defence: 0.3 },
      { injuredEnergyRegen: 0.25 },
      { critChance: 0.15 },
      { critDamageAmp: 0.3 },
      { haste: 15 },
    ],
  },
  injuredBelow: 0.5,
};

const RULES: LineupRules = toLineupRules(AUTHORED);

/** What a party of these factions is worth, as the numbers the simulation folds in. */
const worth = (...factions: readonly string[]) => lineupBonus(factions, RULES);

describe('the composition ladder', () => {
  it('pays nothing to a party that never reaches three of anything', () => {
    const rainbow = worth('a', 'b', 'c', 'd', 'e');

    expect(rainbow.tier).toBeNull();
    expect(rainbow.bonus).toEqual(NO_LINEUP_BONUS);
  });

  it('pays nothing at all to an empty formation', () => {
    // Sending nobody is a defeat, not a bonus. Worth pinning because the resolver reduces over
    // lists and an empty reduce is the classic place a neutral element goes wrong.
    expect(worth().tier).toBeNull();
    expect(isNeutralLineup(worth().bonus)).toBe(true);
  });

  it('opens at three of one faction', () => {
    const three = worth('a', 'a', 'a', 'b', 'c');

    expect(three.tier).toEqual({
      faction: 'a',
      count: 3,
      secondFaction: null,
      secondCount: 0,
      attack: 0.1,
      health: 0.1,
    });
    expect(three.bonus.attack).toBe(0.1);
    expect(three.bonus.health).toBe(0.1);
  });

  it('pays a three-and-two split more than a bare three', () => {
    const split = worth('a', 'a', 'a', 'b', 'b');

    expect(split.tier?.faction).toBe('a');
    expect(split.tier?.secondFaction).toBe('b');
    expect(split.bonus.attack).toBe(0.15);
    expect(split.bonus.health).toBe(0.15);
  });

  it('prefers a mono four to a three-and-two, which pay the same attack', () => {
    // The one place rung order would decide the answer if the resolver read the list as ordered
    // rather than taking the best-paying match. Four is strictly better: same attack, more health.
    const four = worth('a', 'a', 'a', 'a', 'b');

    expect(four.tier?.count).toBe(4);
    expect(four.bonus.attack).toBe(0.15);
    expect(four.bonus.health).toBe(0.2);
  });

  it('tops out at five of one faction', () => {
    const five = worth('a', 'a', 'a', 'a', 'a');

    expect(five.tier?.count).toBe(5);
    expect(five.bonus.attack).toBe(0.25);
    expect(five.bonus.health).toBe(0.25);
  });
});

describe('the roll-call', () => {
  it('reports what was fielded, in the order it was fielded', () => {
    expect(worth('b', 'a', 'a').counts).toEqual([
      { faction: 'b', count: 1 },
      { faction: 'a', count: 2 },
    ]);
  });

  it('is empty for an empty formation', () => {
    expect(worth().counts).toEqual([]);
  });

  it('counts wildcards as themselves, whatever rung they bought', () => {
    // ⚠️ The distinction the whole field exists for. The rung says five of `a`; the roll-call says
    // three of `a` and two wildcards, and **the roll-call is the one the flat tracks agree with**,
    // because those only ever count real members. A screen given the rung alone would present an
    // effect it could not attribute to anybody on the board.
    const filled = worth('a', 'a', 'a', 'wild', 'wild');

    expect(filled.tier?.count).toBe(5);
    expect(filled.counts).toEqual([
      { faction: 'a', count: 3 },
      { faction: 'wild', count: 2 },
    ]);
  });

  it('agrees with the flat tracks about how many are fielded', () => {
    const mixed = worth('rally', 'rally', 'track', 'wild', 'wild');
    const count = (faction: string): number =>
      mixed.counts.find((entry) => entry.faction === faction)?.count ?? 0;

    expect(count('rally')).toBe(mixed.rallyCount);
    expect(count('track')).toBe(mixed.ladderCount);
  });
});

describe('the wildcard faction', () => {
  it('reads three of a faction plus two wildcards as five of that faction', () => {
    // The worked example from the milestone's design note, and the reason the wildcard is the
    // only route to a mono-five on the roster as it stands.
    const filled = worth('a', 'a', 'a', 'wild', 'wild');

    expect(filled.tier?.faction).toBe('a');
    expect(filled.tier?.count).toBe(5);
    expect(filled.bonus.attack).toBe(0.25);
  });

  it('names the faction actually brought rather than the wildcard', () => {
    // Both qualify the party for a mono-three here. Reporting "three of a" is what a formation
    // screen has to say for the bonus to be a decision the player can chase.
    const mixed = worth('a', 'a', 'wild', 'wild', 'wild');

    expect(mixed.tier?.faction).toBe('a');
    expect(mixed.tier?.count).toBe(5);
  });

  it('counts as itself when nothing else is fielded', () => {
    const pure = worth('wild', 'wild', 'wild');

    expect(pure.tier?.faction).toBe('wild');
    expect(pure.tier?.count).toBe(3);
  });

  it('cannot be spent twice across the two halves of a split', () => {
    // Three of `a` needs two wildcards, leaving one — and a split's second half asks for two. A
    // resolver that read the wildcard count without deducting what the first half spent would
    // hand this party the richer rung.
    const stretched = worth('a', 'wild', 'wild', 'b', 'c');

    expect(stretched.tier?.count).toBe(3);
    expect(stretched.tier?.secondFaction).toBeNull();
    expect(stretched.bonus.attack).toBe(0.1);
  });

  it('does not stand in for the rally or the ladder faction', () => {
    // Deliberate, and the reason is a balance one: a wildcard that filled in everywhere would be
    // strictly the best character in the game, and the two flat tracks would stop being choices.
    const wildcards = worth('wild', 'wild', 'wild', 'wild', 'wild');

    expect(wildcards.rallyCount).toBe(0);
    expect(wildcards.ladderCount).toBe(0);
    expect(wildcards.bonus.defence).toBe(0);
  });
});

describe('the rally faction', () => {
  it('pays per member rather than at a threshold', () => {
    expect(worth('rally', 'a', 'b', 'c', 'd').bonus.attack).toBeCloseTo(0.02);
    expect(worth('rally', 'rally', 'a', 'b', 'c').bonus.attack).toBeCloseTo(0.04);
  });

  it('stacks on top of whatever rung the composition reached', () => {
    const mono = worth('rally', 'rally', 'rally', 'rally', 'rally');

    // Five of a faction is +25%, and five rally members are +10% on top: additive, so a screen
    // can name one number.
    expect(mono.bonus.attack).toBeCloseTo(0.35);
    expect(mono.bonus.health).toBeCloseTo(0.35);
  });
});

describe('the ladder faction', () => {
  it('awards nothing until the first member is fielded', () => {
    expect(worth('a', 'b', 'c', 'd', 'e').bonus.defence).toBe(0);
  });

  it('is cumulative, so a fifth member holds everything the first four earned', () => {
    const full = worth('track', 'track', 'track', 'track', 'track');

    expect(full.ladderCount).toBe(5);
    expect(full.bonus.defence).toBeCloseTo(0.3);
    expect(full.bonus.injuredEnergyRegen).toBeCloseTo(0.25);
    expect(full.bonus.critChance).toBeCloseTo(0.15);
    expect(full.bonus.critDamageAmp).toBeCloseTo(0.3);
    expect(full.bonus.haste).toBe(15);
  });

  it('hands over one step at a time', () => {
    expect(worth('track').bonus.defence).toBeCloseTo(0.3);
    expect(worth('track').bonus.injuredEnergyRegen).toBe(0);
    expect(worth('track', 'track').bonus.injuredEnergyRegen).toBeCloseTo(0.25);
    expect(worth('track', 'track').bonus.critChance).toBe(0);
  });

  it('stacks with the composition ladder rather than replacing it', () => {
    const mono = worth('track', 'track', 'track', 'track', 'track');

    expect(mono.bonus.attack).toBeCloseTo(0.25);
    expect(mono.bonus.defence).toBeCloseTo(0.3);
  });
});

describe('parsing the authored rules', () => {
  it('treats a damaged share as nothing rather than as a penalty', () => {
    const repaired = toLineupRules({
      ...AUTHORED,
      tiers: [{ largest: 3, second: 0, attack: Number.NaN, health: -1 }],
      rally: { faction: 'rally', attack: Number.POSITIVE_INFINITY, health: 0.02 },
    });

    expect(repaired.tiers[0].attack).toBe(0);
    expect(repaired.tiers[0].health).toBe(0);
    expect(repaired.rally.attack).toBe(0);
  });

  it('bounds a step by the stat it lands on', () => {
    const repaired = toLineupRules({
      ...AUTHORED,
      ladder: {
        faction: 'track',
        steps: [{ critChance: 4, haste: ATB_THRESHOLD * 10, defence: -2 }],
      },
    });

    // ⚠️ Haste in particular. Above the gauge threshold a combatant banks two actions in one
    // tick, which is a termination argument rather than a balance opinion.
    expect(repaired.ladder.steps[0].critChance).toBe(1);
    expect(repaired.ladder.steps[0].haste).toBe(ATB_THRESHOLD);
    expect(repaired.ladder.steps[0].defence).toBe(0);
  });

  it('leaves a step saying only what it adds', () => {
    const repaired = toLineupRules({
      ...AUTHORED,
      ladder: { faction: 'track', steps: [{ defence: 0.3 }] },
    });

    expect(repaired.ladder.steps[0]).toEqual({ defence: 0.3 });
  });

  it('disables the injured clause outright when its threshold is damaged', () => {
    // The safe direction: a broken threshold should stop the bonus paying, not make it permanent.
    expect(toLineupRules({ ...AUTHORED, injuredBelow: Number.NaN }).injuredBelow).toBe(0);
    expect(toLineupRules({ ...AUTHORED, injuredBelow: 4 }).injuredBelow).toBe(1);
  });
});

describe('folding a bonus into a stat block', () => {
  const base = toCombatStats({
    hp: 1000,
    atk: 100,
    def: 50,
    haste: 100,
    critChance: 0.1,
    critDamageAmp: 0.6,
  });

  it('leaves a stat block untouched when nothing qualified', () => {
    expect(applyLineupBonus(base, NO_LINEUP_BONUS)).toBe(base);
  });

  it('multiplies the quantities and adds the points', () => {
    const boosted = applyLineupBonus(
      base,
      worth('track', 'track', 'track', 'track', 'track').bonus,
    );

    expect(boosted.hp.eq(num(1250))).toBe(true);
    expect(boosted.atk.eq(num(125))).toBe(true);
    expect(boosted.def.eq(num(65))).toBe(true);
    expect(boosted.critChance).toBeCloseTo(0.25);
    expect(boosted.critDamageAmp).toBeCloseTo(0.9);
    expect(boosted.haste).toBe(115);
  });

  it('holds crit rating at certainty rather than past it', () => {
    const boosted = applyLineupBonus(base, { ...NO_LINEUP_BONUS, critChance: 5 });

    expect(boosted.critChance).toBe(1);
  });

  it('re-clamps haste into the gauge bound', () => {
    // ⚠️ The termination guard, arriving from the lineup side. `effectiveSpeed` clamps the sum
    // again when a status is moving haste, but `base` is documented as already being in range and
    // much of the simulation reads it directly.
    const fast = applyLineupBonus(base, { ...NO_LINEUP_BONUS, haste: ATB_THRESHOLD });
    const slow = applyLineupBonus({ ...base, haste: 1 }, { ...NO_LINEUP_BONUS, haste: 0 });

    expect(fast.haste).toBe(ATB_THRESHOLD);
    expect(slow.haste).toBe(1);
  });

  it('leaves the injured clause out, because a stat block is fixed for the fight', () => {
    const boosted = applyLineupBonus(base, { ...NO_LINEUP_BONUS, injuredEnergyRegen: 1 });

    expect(boosted).toBe(base);
  });
});
