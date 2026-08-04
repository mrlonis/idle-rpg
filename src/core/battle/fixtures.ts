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
  // Round numbers, and deliberately not the shipped ones: a spec asserting "the bar filled by
  // ten" should fail when this fixture changes, not when the ladder is retuned.
  energy: { onHit: 10, onHurt: 10, onHeal: 10 },
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
export const PLAIN_COMBAT_RULES: CombatRules = toCombatRules({
  ...TEST_COMBAT_RULES_DATA,
  rows: { frontDefence: 1, frontCritDamageResist: 0, backAttack: 1, backCritDamageAmp: 0 },
  matchups: [],
});
