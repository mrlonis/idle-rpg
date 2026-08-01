// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type CharacterData,
  type CharacterTier,
  type FactionData,
  growthMultiplier,
  type StatBlockData,
  startRarityIndex,
} from '../core';
import { FACTIONS } from './ascension';
import { CHARACTERS, STARTER_CHARACTER_IDS, STARTER_TEAM } from './characters';
import { GROWTH } from './levels';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `CharacterData`. Assigning them to a typed local here
 * is what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const characters: readonly CharacterData[] = CHARACTERS;
const factions: readonly FactionData[] = FACTIONS;
const starters: readonly CharacterData[] = STARTER_TEAM;

const TIERS: readonly CharacterTier[] = ['common', 'legendary', 'ascended'];

/** A rough power budget. Deliberately crude — it is a smell test, not a balance model. */
function budget(stats: StatBlockData): number {
  return Number(stats.hp) / 10 + Number(stats.atk) + Number(stats.def);
}

describe('the roster', () => {
  it('authors one character per tier per faction', () => {
    expect(characters).toHaveLength(factions.length * TIERS.length);

    for (const faction of factions) {
      for (const tier of TIERS) {
        const matching = characters.filter(
          (character) => character.faction === faction.id && character.tier === tier,
        );

        expect(matching, `${faction.id} ${tier}`).toHaveLength(1);
      }
    }
  });

  it('gives every character a unique id and a name', () => {
    expect(new Set(characters.map((character) => character.id)).size).toBe(characters.length);

    for (const character of characters) {
      expect(character.name.length, character.id).toBeGreaterThan(0);
    }
  });

  it('never names a faction that does not exist', () => {
    const known = new Set(factions.map((faction) => faction.id));

    for (const character of characters) {
      expect(known.has(character.faction), character.id).toBe(true);
    }
  });

  it('keeps every stat inside the range the simulation can use', () => {
    for (const character of characters) {
      const { hp, atk, def, spd, critChance, critMultiplier } = character.stats;

      expect(Number(hp), character.id).toBeGreaterThan(0);
      expect(Number(atk), character.id).toBeGreaterThan(0);
      expect(Number(def), character.id).toBeGreaterThanOrEqual(0);
      // SPD is ATB gauge per tick against a threshold of 1000; above it a combatant would bank
      // two actions in a single tick and break turn ordering.
      expect(spd, character.id).toBeGreaterThanOrEqual(1);
      expect(spd, character.id).toBeLessThanOrEqual(1000);
      expect(critChance, character.id).toBeGreaterThanOrEqual(0);
      expect(critChance, character.id).toBeLessThanOrEqual(1);
      expect(critMultiplier, character.id).toBeGreaterThanOrEqual(1);
    }
  });

  it('keeps every stat well inside float64, so the curve is not the reason for Decimal', () => {
    for (const character of characters) {
      expect(Number(character.stats.hp), character.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    }
  });
});

describe('tier is a slope, not a head start', () => {
  it('keeps base budgets close across the tiers within a faction', () => {
    // Higher tier buys a sharper version of the faction's identity and a steeper growth rate,
    // not simply more of everything. A common-tier character has to be a genuine early answer.
    for (const faction of factions) {
      const mates = characters.filter((character) => character.faction === faction.id);
      const budgets = mates.map((character) => budget(character.stats));

      expect(Math.max(...budgets) / Math.min(...budgets), faction.id).toBeLessThan(1.6);
    }
  });

  it('gives ascended tier its edge through growth rather than base stats', () => {
    // The gap at level 1 should be small and the gap at the cap should be enormous. That is what
    // makes "amazing early, falls off later" a consequence of the math.
    const early = growthMultiplier(GROWTH, 'ascended', 1, 2).div(
      growthMultiplier(GROWTH, 'common', 1, 0),
    );
    const late = growthMultiplier(GROWTH, 'ascended', 1000, 2).div(
      growthMultiplier(GROWTH, 'common', 1000, 0),
    );

    expect(early.eq(1)).toBe(true);
    expect(late.toNumber()).toBeGreaterThan(10);
  });

  it('starts ascended tier at Elite and everyone else at Rare', () => {
    for (const character of characters) {
      const expected = character.tier === 'ascended' ? 2 : 0;

      expect(startRarityIndex(character.tier), character.id).toBe(expected);
    }
  });
});

describe('characters are sidegrades within a tier', () => {
  it.each(TIERS)('has no dominated character at %s tier', (tier) => {
    // The invariant is non-domination, not "everyone is best at something". A character can be
    // the middle of every axis and still be a real choice — what must never happen is one
    // character being at least as good as another on *every* axis, because then the worse one is
    // never worth fielding.
    const axes: readonly (keyof StatBlockData)[] = ['hp', 'atk', 'def', 'spd', 'critChance'];
    const peers = characters.filter((character) => character.tier === tier);
    const dominated: string[] = [];

    for (const candidate of peers) {
      for (const rival of peers) {
        if (candidate === rival) {
          continue;
        }
        const worseEverywhere = axes.every(
          (axis) => Number(rival.stats[axis]) >= Number(candidate.stats[axis]),
        );
        if (worseEverywhere) {
          dominated.push(`${candidate.id} is dominated by ${rival.id}`);
        }
      }
    }

    expect(dominated).toEqual([]);
  });

  it('expresses each faction’s axis more sharply as tier rises', () => {
    // Dwarves get more defensive, Elves faster, Monsters harder-hitting, Demons swingier. The
    // tier sharpens the niche in both directions rather than lifting every number.
    const axisOf: Readonly<Record<string, keyof StatBlockData>> = {
      dwarf: 'def',
      elf: 'spd',
      monster: 'atk',
      demon: 'critChance',
      undead: 'hp',
    };

    for (const [faction, axis] of Object.entries(axisOf)) {
      const byTier = TIERS.map((tier) =>
        characters.find((character) => character.faction === faction && character.tier === tier),
      );

      const values = byTier.map((character) => Number(character?.stats[axis] ?? 0));

      expect(values[1], `${faction} ${axis}`).toBeGreaterThan(values[0]);
      expect(values[2], `${faction} ${axis}`).toBeGreaterThan(values[1]);
    }
  });
});

describe('the starter party', () => {
  it('matches the id list the save layer seeds from', () => {
    // Written out rather than derived with a `.map()`, because `data/` is plain data. This is
    // the assertion that buys back what the `.map()` would have.
    expect(STARTER_CHARACTER_IDS).toEqual(starters.map((character) => character.id));
  });

  it('fields three characters with distinct ids', () => {
    expect(starters).toHaveLength(3);
    expect(new Set(starters.map((character) => character.id)).size).toBe(3);
  });

  it('is all common tier, so the gacha has somewhere to go', () => {
    for (const character of starters) {
      expect(character.tier, character.id).toBe('common');
    }
  });

  it('spans three factions, so three ascension ladders are open from the first minute', () => {
    // Three of one faction would leave the other four ladders unusable until the player pulled
    // into them, and fodder is same-faction only.
    expect(new Set(starters.map((character) => character.faction)).size).toBe(3);
  });

  it('is drawn from the authored roster rather than defined separately', () => {
    for (const character of starters) {
      expect(characters, character.id).toContain(character);
    }
  });
});
