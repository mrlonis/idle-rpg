import { type GachaRulesData } from '../gacha/types';
import { emptyLoadout } from '../gear/types';
import { type GrowthData } from '../growth';
import { type FactionLookup } from './ascend';
import { type KitRulesData } from './kit';
import { type LevelCurveData } from './level';
import { type CharacterLookup } from './roster';
import {
  type AscensionRules,
  type CharacterData,
  type FactionData,
  type OwnedCharacter,
} from './types';

/**
 * Stand-in content for the roster, gacha and save specs.
 *
 * `core/` may not import `data/` — content arrives as an argument precisely so the simulation
 * can be driven from fixtures — and a spec that used the shipped roster would fail every time a
 * character was retuned, which is exactly the coupling that rule exists to prevent.
 *
 * Deliberately small and deliberately complete: two factions, one on each ascension path, with
 * all three tiers in each. That is the smallest content that exercises every branch — a
 * `rare`-start character and an `elite`-start one, a ladder that asks for fodder and one that
 * never does, and two factions so "same faction" is a real constraint rather than a tautology.
 */

/**
 * The mortal fixtures walk the fodder-hungry ladder.
 *
 * Kits are deliberately absent: every one of these falls back to whatever basic attack the
 * rules supply, so a roster or save spec is never accidentally testing a skill. The battle
 * specs build their own combatants precisely so that these can stay this plain.
 */
export const TEST_ALPHA: CharacterData = {
  id: 'alpha',
  name: 'Alpha',
  faction: 'test-mortal',
  tier: 'common',
  role: 'brawler',
  stats: {
    hp: 100,
    atk: 10,
    def: 4,
    haste: 100,
    critChance: 0.1,
    critDamageAmp: 0.5,
  },
};

export const TEST_BETA: CharacterData = {
  id: 'beta',
  name: 'Beta',
  faction: 'test-mortal',
  tier: 'legendary',
  role: 'brawler',
  stats: {
    hp: 120,
    atk: 12,
    def: 6,
    haste: 105,
    critChance: 0.12,
    critDamageAmp: 0.6,
  },
};

export const TEST_GAMMA: CharacterData = {
  id: 'gamma',
  name: 'Gamma',
  faction: 'test-mortal',
  tier: 'ascended',
  role: 'brawler',
  stats: {
    hp: 140,
    atk: 14,
    def: 6,
    haste: 110,
    critChance: 0.15,
    critDamageAmp: 0.7,
  },
};

/** Celestials pay in their own copies and never ask for fodder. */
export const TEST_DELTA: CharacterData = {
  id: 'delta',
  name: 'Delta',
  faction: 'test-celestial',
  tier: 'common',
  role: 'mage',
  stats: {
    hp: 110,
    atk: 12,
    def: 8,
    haste: 95,
    critChance: 0.05,
    critDamageAmp: 0.4,
  },
};

export const TEST_EPSILON: CharacterData = {
  id: 'epsilon',
  name: 'Epsilon',
  faction: 'test-celestial',
  tier: 'legendary',
  role: 'mage',
  stats: {
    hp: 115,
    atk: 15,
    def: 8,
    haste: 100,
    critChance: 0.2,
    critDamageAmp: 0.8,
  },
};

export const TEST_ZETA: CharacterData = {
  id: 'zeta',
  name: 'Zeta',
  faction: 'test-celestial',
  tier: 'ascended',
  role: 'mage',
  stats: {
    hp: 130,
    atk: 18,
    def: 6,
    haste: 108,
    critChance: 0.25,
    critDamageAmp: 1,
  },
};

export const TEST_CHARACTER_LIST: readonly CharacterData[] = [
  TEST_ALPHA,
  TEST_BETA,
  TEST_GAMMA,
  TEST_DELTA,
  TEST_EPSILON,
  TEST_ZETA,
];

export const TEST_CHARACTERS: CharacterLookup = new Map(
  TEST_CHARACTER_LIST.map((character) => [character.id, character]),
);

const TEST_FACTION_LIST: readonly FactionData[] = [
  { id: 'test-mortal', name: 'Test Mortals', ascensionPath: 'mortal' },
  { id: 'test-celestial', name: 'Test Celestials', ascensionPath: 'celestial' },
];

export const TEST_FACTIONS: FactionLookup = new Map(
  TEST_FACTION_LIST.map((faction) => [faction.id, faction]),
);

/** The same shape as the shipped ladders, so derived costs are representative. */
export const TEST_ASCENSION: AscensionRules = {
  mortal: [
    [{ scope: 'self', rarity: 0, count: 2 }],
    [{ scope: 'faction', rarity: 1, count: 2 }],
    [{ scope: 'self', rarity: 2, count: 1 }],
    [{ scope: 'faction', rarity: 3, count: 2 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'faction', rarity: 5, count: 1 }],
    [{ scope: 'faction', rarity: 5, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 2 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
  ],
  celestial: [
    [{ scope: 'self', rarity: 0, count: 2 }],
    [{ scope: 'self', rarity: 1, count: 2 }],
    [{ scope: 'self', rarity: 2, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 2 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
    [{ scope: 'self', rarity: 3, count: 1 }],
  ],
};

/** A level curve with the shipped shape and far smaller caps, so specs stay legible. */
export const TEST_LEVEL_CURVE: LevelCurveData = {
  maxLevel: 100,
  gold: { coefficient: 10, exponent: 1.5 },
  xp: { coefficient: 5, exponent: 1.4 },
  essence: { coefficient: 2, exponent: 2, every: 10 },
  caps: [10, 20, 30, 40, 50, 55, 60, 65, 70, 80, 85, 90, 95, 100],
};

export const TEST_GROWTH: GrowthData = {
  perLevel: { common: 1.0075, legendary: 1.009, ascended: 1.0105 },
  perAscension: 1.12,
};

/**
 * The shipped ceilings and the shipped rungs.
 *
 * Unlike the ladders and the level curve above, this is not shrunk to keep specs legible: the
 * table is three numbers and three rarity names, and a fixture that used different ones would
 * make every kit assertion in `kit.spec.ts` a statement about the fixture rather than about the
 * rule. The fixture characters carry no kits at all — see the note at the top of this file — so
 * nothing else here is affected by it.
 */
export const TEST_KIT_RULES: KitRulesData = {
  ceiling: { common: 2, legendary: 3, ascended: 4 },
  unlocks: ['elite', 'legendary', 'ascended'],
};

export const TEST_GACHA: GachaRulesData = {
  pullCost: 100,
  tierWeights: { ascended: 0.025, legendary: 0.225, common: 0.75 },
  pity: { softPityStart: 30, softPityStep: 0.06, hardPity: 50 },
  eliteUpgradeChance: 0.08,
  sparkPerCopy: { common: 1, legendary: 3, ascended: 10 },
};

/** A roster entry at its tier's starting rarity, level 1, with `copies` spares. */
export function owned(character: CharacterData, copies = 0, rarity?: number): OwnedCharacter {
  return {
    defId: character.id,
    rarity: rarity ?? (character.tier === 'ascended' ? 2 : 0),
    level: 1,
    copies,
    gear: emptyLoadout(),
  };
}
