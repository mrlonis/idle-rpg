import { toCombatRules } from './content';
import { type CombatRules, type CombatRulesData } from './types';

/**
 * Stand-in combat rules for the battle specs.
 *
 * `core/` may not import `data/` — the rules arrive as an argument precisely so the simulation
 * can be driven from fixtures — and a spec that used the shipped matrix would fail every time a
 * faction was retuned, which is exactly the coupling that rule exists to prevent.
 *
 * Deliberately minimal and deliberately *not* neutral. There are two factions with a one-way
 * edge between them, because a matchup table that did nothing would let a bug where the
 * multiplier is dropped entirely pass every test in the suite.
 */
export const TEST_COMBAT_RULES_DATA: CombatRulesData = {
  rows: {
    frontDefence: 1.05,
    frontCritDamageResist: 0.05,
    backAttack: 1.05,
    backCritDamageAmp: 0.05,
  },
  matchups: [{ attacker: 'strong', defender: 'weak', multiplier: 2 }],
  // Inert by default, so a battle spec measuring damage or scheduling is never quietly reading a
  // composition bonus as well. `lineup.spec.ts` supplies its own rules, and the specs that want
  // one here reach for {@link LINEUP_COMBAT_RULES_DATA} below.
  lineup: {
    tiers: [],
    wildcard: 'wildcard',
    rally: { faction: 'rally', attack: 0, health: 0 },
    ladder: { faction: 'ladder', steps: [] },
    injuredBelow: 0.5,
  },
  // Round numbers, and deliberately not the shipped ones: a spec asserting "the bar filled by
  // ten" should fail when this fixture changes, not when the ladder is retuned.
  energy: { onHit: 10, onHurt: 10, onHeal: 10 },
  // Flat, so a battle spec fields exactly the stat block it authored. Every fixture encounter is
  // `level: 1` and would be unscaled anyway; this is the belt to that pair of braces, and it also
  // means a spec that *wants* to see scaling has to say so.
  growth: { perLevel: { common: 1, legendary: 1, ascended: 1 }, perAscension: 1 },
  minHitChance: 0.1,
  maxPenetration: 0.9,
  maxResist: 0.9,
  basicAttack: {
    id: 'basic-attack',
    name: 'Attack',
    target: 'enemy-front',
    effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
    priority: 0,
  },
};

export const TEST_COMBAT_RULES: CombatRules = toCombatRules(TEST_COMBAT_RULES_DATA);

/**
 * Rules with an inert matchup table, for specs measuring something other than the matrix.
 *
 * Worth having as its own fixture rather than as an inline object at each call site: a damage
 * assertion that quietly picked up a 2× multiplier would look like a broken formula rather
 * than like a badly chosen faction.
 */
export const NEUTRAL_COMBAT_RULES: CombatRules = toCombatRules({
  ...TEST_COMBAT_RULES_DATA,
  matchups: [],
});

/** Rules with no row bonuses either, so a stat block arrives in the simulation as authored. */
export const PLAIN_COMBAT_RULES_DATA: CombatRulesData = {
  ...TEST_COMBAT_RULES_DATA,
  rows: { frontDefence: 1, frontCritDamageResist: 0, backAttack: 1, backCritDamageAmp: 0 },
  matchups: [],
};

export const PLAIN_COMBAT_RULES: CombatRules = toCombatRules(PLAIN_COMBAT_RULES_DATA);

/**
 * Rules with a composition ladder, for the specs that are about one.
 *
 * Round numbers again, and deliberately unlike the shipped table: a spec asserting "two of a kind
 * doubled the party's attack" should fail when this fixture changes, not when milestone 8d's
 * ladder is retuned. Two members is enough of a threshold to reach with a fixture party, which
 * the shipped three is not.
 */
export const LINEUP_COMBAT_RULES_DATA: CombatRulesData = {
  ...TEST_COMBAT_RULES_DATA,
  rows: { frontDefence: 1, frontCritDamageResist: 0, backAttack: 1, backCritDamageAmp: 0 },
  matchups: [],
  lineup: {
    tiers: [{ largest: 2, second: 0, attack: 1, health: 1 }],
    wildcard: 'wildcard',
    rally: { faction: 'rally', attack: 0.5, health: 0.5 },
    ladder: {
      faction: 'ladder',
      steps: [{ defence: 1 }, { injuredEnergyRegen: 1 }, { critChance: 0.5 }],
    },
    injuredBelow: 0.5,
  },
};

export const LINEUP_COMBAT_RULES: CombatRules = toCombatRules(LINEUP_COMBAT_RULES_DATA);
