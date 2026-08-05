// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  applyLineupBonus,
  ATB_THRESHOLD,
  type CombatRulesData,
  type FactionMatchupData,
  type LineupRulesData,
  type LineupTierData,
  lineupBonus,
  MAX_PENETRATION,
  MAX_RESIST,
  matchupKey,
  PARTY_SIZE,
  type SkillData,
  toCombatRules,
  toCombatStats,
} from '../core';
import { FACTIONS } from './ascension';
import {
  BASIC_ATTACK,
  COMBAT_RULES,
  FACTION_MATCHUPS,
  LINEUP_BONUSES,
  LINEUP_INJURED_BELOW,
  LINEUP_TIERS,
  ROW_BONUSES,
} from './combat';

/**
 * Conformance through typed locals, as everywhere else in `data/`: the files themselves cannot
 * reference `core/` types, so assigning them here is what turns a malformed table into a compile
 * error instead of a silently neutral matchup.
 */
const authored: CombatRulesData = COMBAT_RULES;
const matchups: readonly FactionMatchupData[] = FACTION_MATCHUPS;
const lineup: LineupRulesData = LINEUP_BONUSES;
const tiers: readonly LineupTierData[] = LINEUP_TIERS;
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
    for (const value of [ROW_BONUSES.frontDefence, ROW_BONUSES.backAttack]) {
      expect(value).toBeGreaterThan(1);
      expect(value).toBeLessThanOrEqual(1.1);
    }
  });

  it('pays the crit halves in points, because they are opposed rather than scaled', () => {
    // A crit is `1 + max(amp - resist, 0)`. A multiplier here would pay nothing at all to the
    // majority of the roster, which sits at zero on both — the exact failure the old
    // "higher of two attack stats" rule could not have, and this one can.
    for (const value of [ROW_BONUSES.frontCritDamageResist, ROW_BONUSES.backCritDamageAmp]) {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(0.1);
    }
  });
});

describe('the lineup bonus', () => {
  /** The party the shipped rules make of these factions, resolved through `core/`. */
  const worth = (...factions: readonly string[]) => lineupBonus(factions, rules.lineup);

  it('only names factions that exist', () => {
    // The three named tracks are plain strings by design — `core/` looks factions up and never
    // enumerates them — so a rule naming a faction that has been renamed simply stops firing.
    // Silently. This is what makes that loud instead.
    const known: ReadonlySet<string> = new Set(FACTIONS.map((faction) => faction.id));

    expect(known.has(lineup.wildcard)).toBe(true);
    expect(known.has(lineup.rally.faction)).toBe(true);
    expect(known.has(lineup.ladder.faction)).toBe(true);
  });

  it('keeps the three tracks on three different factions', () => {
    // Stacking is the design; stacking on one faction would not be. A faction holding two tracks
    // would be strictly the best thing to field, which is the single-optimal-team failure this
    // whole mechanic is overriding a project rule to avoid.
    const named = [lineup.wildcard, lineup.rally.faction, lineup.ladder.faction];

    expect(new Set(named).size).toBe(named.length);
  });

  it('never asks for more of a faction than a party has room for', () => {
    // A rung nobody can reach is content that ships and never fires. `second` is what a split's
    // other half asks for, so the two together are the whole party.
    for (const tier of tiers) {
      expect(tier.largest + tier.second, `${tier.largest}+${tier.second}`).toBeLessThanOrEqual(
        PARTY_SIZE,
      );
    }
    expect(lineup.ladder.steps.length).toBeLessThanOrEqual(PARTY_SIZE);
  });

  it('pays more for a bigger commitment, all the way up the ladder', () => {
    // Derived by resolving parties rather than by re-reading the table, so this measures what a
    // player would actually be paid. A rung that paid less than a smaller one would make the
    // fifth member of a faction a downgrade.
    const climb = [
      worth('human', 'human', 'human', 'dwarf', 'elf'),
      worth('human', 'human', 'human', 'dwarf', 'dwarf'),
      worth('human', 'human', 'human', 'human', 'dwarf'),
      worth('human', 'human', 'human', 'human', 'human'),
    ].map((summary) => summary.bonus);

    for (let step = 1; step < climb.length; step++) {
      expect(climb[step].attack, `step ${step}`).toBeGreaterThanOrEqual(climb[step - 1].attack);
      expect(climb[step].health, `step ${step}`).toBeGreaterThanOrEqual(climb[step - 1].health);
      expect(
        climb[step].attack + climb[step].health,
        `step ${step} pays no more than the one below`,
      ).toBeGreaterThan(climb[step - 1].attack + climb[step - 1].health);
    }
  });

  it('pays a rainbow party nothing, which is what makes the ladder a decision', () => {
    const rainbow = worth('human', 'dwarf', 'elf', 'undead', 'monster');

    // Except the Monster share, which is per member and therefore has no threshold to miss.
    expect(rainbow.tier).toBeNull();
    expect(rainbow.bonus.attack).toBeCloseTo(lineup.rally.attack);
  });

  it('lets Angels stand in for a mono five, which is the roster’s only route to one today', () => {
    // ⚠️ The bad-luck failure mode milestone 8e exists to close, pinned here so it is a measured
    // fact rather than a claim in a document. Four Humans is the deepest faction on the roster,
    // and every faction is three deep or less otherwise — so without the wildcard, the top of
    // this ladder is unreachable, and the wildcard walks the luck-only ascension path.
    const filled = worth('human', 'human', 'human', 'angel', 'angel');

    expect(filled.tier?.faction).toBe('human');
    expect(filled.tier?.count).toBe(PARTY_SIZE);
    expect(filled.bonus.attack).toBe(tiers[tiers.length - 1].attack);
  });

  it('keeps the wildcard off the other two tracks', () => {
    const angels = worth('angel', 'angel', 'angel', 'angel', 'angel');

    expect(angels.rallyCount).toBe(0);
    expect(angels.ladderCount).toBe(0);
    // It is still five of a faction, so the composition ladder pays in full.
    expect(angels.tier?.count).toBe(PARTY_SIZE);
  });

  it('opens the Demon track on the stat its own faction is worst at', () => {
    // One Demon is worth fielding next to anything, which is what stops the track being all or
    // nothing — and defence is the right opener because the roster's Demons are glass.
    const one = worth('demon', 'human', 'dwarf', 'elf', 'undead');

    expect(one.bonus.defence).toBeGreaterThan(0);
    expect(one.bonus.haste).toBe(0);
  });

  it('makes the Demon track cumulative rather than a choice of one rung', () => {
    const full = worth('demon', 'demon', 'demon', 'demon', 'demon');
    const three = worth('demon', 'demon', 'demon', 'human', 'dwarf');

    expect(full.bonus.defence).toBe(three.bonus.defence);
    expect(full.bonus.critChance).toBe(three.bonus.critChance);
    expect(full.bonus.haste).toBeGreaterThan(three.bonus.haste);
  });

  it('respects the haste clamp with the largest party the track can be fielded by', () => {
    // ⚠️ A termination argument rather than a balance one. The slowest thing in the game plus the
    // whole track still has to sit inside the gauge bound, or a combatant banks two actions in a
    // single tick and turn ordering stops meaning anything.
    const slowest = toCombatStats({
      hp: 1,
      atk: 1,
      def: 1,
      haste: 1,
      critChance: 0,
      critDamageAmp: 0,
    });
    const fastest = toCombatStats({
      hp: 1,
      atk: 1,
      def: 1,
      haste: ATB_THRESHOLD,
      critChance: 0,
      critDamageAmp: 0,
    });
    const bonus = worth('demon', 'demon', 'demon', 'demon', 'demon').bonus;

    expect(applyLineupBonus(slowest, bonus).haste).toBeGreaterThanOrEqual(1);
    expect(applyLineupBonus(fastest, bonus).haste).toBeLessThanOrEqual(ATB_THRESHOLD);
  });

  it('agrees with the roster about when a character counts as injured', () => {
    // The Demon track's energy clause is a comeback mechanic, and a comeback mechanic that
    // disagreed with every `self-hurt` skill in the game about what "hurt" means would be a
    // second definition nobody asked for.
    expect(rules.lineup.injuredBelow).toBe(LINEUP_INJURED_BELOW);
    expect(LINEUP_INJURED_BELOW).toBeGreaterThan(0);
    expect(LINEUP_INJURED_BELOW).toBeLessThan(1);
  });

  it('is worth several times a matchup edge, because it asks for the whole party', () => {
    // The relationship the milestone's design note is about. A matchup is a tiebreaker you get
    // for free; the top of this ladder costs all five slots, so it has to be worth visibly more
    // or nobody would ever build for it.
    const biggestEdge = Math.max(...matchups.map((matchup) => matchup.multiplier)) - 1;
    const top = worth('human', 'human', 'human', 'human', 'human').bonus;

    expect(top.attack).toBeGreaterThan(biggestEdge * 2);
  });
});

describe('the default basic attack', () => {
  it('is physical, single target, and goes through the front-rank gate', () => {
    // All three are load-bearing. Physical is the type every `physicalResist` wall is authored
    // against, so a magical kit is what gets past one; single-target is what makes a wide wave a
    // genuine question; and going through the gate is what turns a formation into a puzzle
    // rather than a seating chart.
    expect(basic.target).toBe('enemy-front');
    expect(basic.effects).toEqual([{ kind: 'damage', damageType: 'physical', power: 1 }]);
  });

  it('is not an ultimate, has no cooldown, and sits below every authored skill', () => {
    // The floor. It is what happens when nothing better is available, so it can carry neither
    // meter — an unchargeable basic attack would leave a combatant with no action at all.
    expect(basic.ultimate).toBeUndefined();
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

  it('lets some damage through whatever the resist', () => {
    // The same guard as the hit-chance floor, arriving from the other side: resist multiplies
    // the result rather than diminishing an input, so at 1 it is an immunity and a fight against
    // one runs to the tick cap.
    expect(rules.maxResist).toBeGreaterThan(0);
    expect(rules.maxResist).toBeLessThanOrEqual(MAX_RESIST);
    expect(rules.maxResist).toBeLessThan(1);
  });
});
