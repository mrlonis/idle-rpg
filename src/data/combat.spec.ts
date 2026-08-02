// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type CombatRulesData,
  type FactionMatchupData,
  MAX_PENETRATION,
  matchupKey,
  type SkillData,
  toCombatRules,
} from '../core';
import { FACTIONS } from './ascension';
import { BASIC_ATTACK, COMBAT_RULES, FACTION_MATCHUPS, ROW_BONUSES } from './combat';

/**
 * Conformance through typed locals, as everywhere else in `data/`: the files themselves cannot
 * reference `core/` types, so assigning them here is what turns a malformed table into a compile
 * error instead of a silently neutral matchup.
 */
const authored: CombatRulesData = COMBAT_RULES;
const matchups: readonly FactionMatchupData[] = FACTION_MATCHUPS;
const basic: SkillData = BASIC_ATTACK;
const rules = toCombatRules(authored);

const MORTAL_CYCLE: readonly string[] = ['human', 'dwarf', 'elf', 'undead'];
const CELESTIALS: readonly string[] = ['angel', 'demon'];
const MORTALS: readonly string[] = [...MORTAL_CYCLE, 'monster'];

/** What `attacker` deals to `defender`, with an unlisted pairing reading as neutral. */
function against(attacker: string, defender: string): number {
  return rules.matchups.get(matchupKey(attacker, defender)) ?? 1;
}

describe('the matchup matrix', () => {
  it('only names factions that exist', () => {
    const known: ReadonlySet<string> = new Set(FACTIONS.map((faction) => faction.id));

    for (const matchup of matchups) {
      expect(known.has(matchup.attacker), matchup.attacker).toBe(true);
      expect(known.has(matchup.defender), matchup.defender).toBe(true);
    }
  });

  it('never lists the same pairing twice', () => {
    // A duplicate would still resolve — the later entry wins — but it would mean the table said
    // two different things and only one of them was true.
    const keys = matchups.map((matchup) => matchupKey(matchup.attacker, matchup.defender));

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps every edge small enough to break a tie rather than decide a fight', () => {
    // If a matchup edge were large enough to carry a bad party, the ladder would stop being about
    // enemy design, which is the thing this milestone exists to build.
    for (const matchup of matchups) {
      expect(matchup.multiplier, matchupKey(matchup.attacker, matchup.defender)).toBeGreaterThan(1);
      expect(
        matchup.multiplier,
        matchupKey(matchup.attacker, matchup.defender),
      ).toBeLessThanOrEqual(1.1);
    }
  });

  it('closes the mortal cycle, so no faction is anybody’s strict answer', () => {
    // human → dwarf → elf → undead → human. Whoever counters you is countered by somebody else,
    // which is what stops the cycle from producing a single correct faction.
    for (let i = 0; i < MORTAL_CYCLE.length; i++) {
      const attacker = MORTAL_CYCLE[i];
      const defender = MORTAL_CYCLE[(i + 1) % MORTAL_CYCLE.length];

      expect(against(attacker, defender), `${attacker}>${defender}`).toBeGreaterThan(1);
      // And it only runs one way: a cycle where both directions were favoured is not a cycle.
      expect(against(defender, attacker), `${defender}>${attacker}`).toBe(1);
    }
  });

  it('gives Monsters reach against everything and hands the bill back to the mortals', () => {
    // A wildcard with a cost attached rather than a free upgrade.
    for (const faction of [...MORTALS, ...CELESTIALS]) {
      expect(against('monster', faction), `monster>${faction}`).toBeGreaterThan(1);
    }
    for (const faction of MORTAL_CYCLE) {
      expect(against(faction, 'monster'), `${faction}>monster`).toBeGreaterThan(1);
    }
  });

  it('makes Monsters their own best answer', () => {
    // The answer to a formidable all-Monster wave is Monsters of your own, and it is the only
    // self-matchup in the table.
    const selfMatchups = matchups.filter((matchup) => matchup.attacker === matchup.defender);

    expect(selfMatchups.map((matchup) => matchup.attacker)).toEqual(['monster']);
    expect(against('monster', 'monster')).toBeGreaterThan(against('monster', 'human'));
  });

  it('gives celestials a one-way edge over every mortal faction', () => {
    // The one asymmetry in the table, and a deliberate one: Angels and Demons walk the luck-only
    // ascension ladder, which asks for copies of the character itself at every single rung and
    // never accepts a faction-mate. They are cheap in bodies and brutally expensive in banners.
    for (const celestial of CELESTIALS) {
      for (const mortal of MORTALS) {
        expect(against(celestial, mortal), `${celestial}>${mortal}`).toBeGreaterThan(1);
      }
    }
    // Nothing mortal hits back, except Monsters — whose reach is universal by construction.
    for (const celestial of CELESTIALS) {
      for (const mortal of MORTAL_CYCLE) {
        expect(against(mortal, celestial), `${mortal}>${celestial}`).toBe(1);
      }
    }
  });

  it('makes each celestial the other’s answer, symmetrically', () => {
    // Which is why the answer to a celestial wall is the celestial you also had to be lucky to
    // own, rather than nothing at all.
    expect(against('angel', 'demon')).toBe(against('demon', 'angel'));
    expect(against('angel', 'demon')).toBeGreaterThan(1);
    // And smaller than what either does to a mortal, so the celestial edge is still real.
    expect(against('angel', 'demon')).toBeLessThan(against('angel', 'human'));
  });
});

describe('row bonuses', () => {
  it('is worth enough to notice and not enough to decide', () => {
    for (const value of [ROW_BONUSES.frontDefence, ROW_BONUSES.backOffence]) {
      expect(value).toBeGreaterThan(1);
      expect(value).toBeLessThanOrEqual(1.1);
    }
  });
});

describe('the default basic attack', () => {
  it('is physical, single target, and goes through the front-rank gate', () => {
    // All three are load-bearing. Physical is why the back row's `matk` bonus only pays off on a
    // cast; single-target is what makes a wide wave a genuine question; and going through the
    // gate is what turns a formation into a puzzle rather than a seating chart.
    expect(basic.target).toBe('enemy-front');
    expect(basic.effects).toEqual([{ kind: 'damage', damageType: 'physical', power: 1 }]);
  });

  it('costs nothing, has no cooldown, and sits below every authored skill', () => {
    expect(basic.cost).toBeUndefined();
    expect(basic.cooldown).toBeUndefined();
    expect(basic.priority).toBe(0);
  });
});

describe('the guards', () => {
  it('floors the hit chance above zero, which is what makes a battle terminate', () => {
    // A dodge pool that could reach certainty would turn every fight against it into a run to the
    // tick cap. This is a termination guard before it is a balance number.
    expect(rules.minHitChance).toBeGreaterThan(0);
    expect(rules.minHitChance).toBeLessThan(1);
  });

  it('leaves some defence standing whatever the penetration', () => {
    expect(rules.maxPenetration).toBeGreaterThan(0);
    expect(rules.maxPenetration).toBeLessThanOrEqual(MAX_PENETRATION);
  });
});
