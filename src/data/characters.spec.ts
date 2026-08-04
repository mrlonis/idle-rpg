// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type CharacterData,
  type CharacterTier,
  type FactionData,
  growthMultiplier,
  MAX_ACCURACY,
  MAX_PENETRATION,
  MAX_RESIST,
  type SkillData,
  type StatBlockData,
  startRarityIndex,
} from '../core';
import { FACTIONS } from './ascension';
import { BRAN, CHARACTERS, MIRA, RIN, STARTER_FORMATION } from './characters';
import { GROWTH } from './levels';
import { SKILLS } from './skills';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `CharacterData`. Assigning them to a typed local here
 * is what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const characters: readonly CharacterData[] = CHARACTERS;
const factions: readonly FactionData[] = FACTIONS;
const skills: readonly SkillData[] = SKILLS;
const starters: readonly CharacterData[] = [...STARTER_FORMATION.front, ...STARTER_FORMATION.back]
  .map((id) => characters.find((character) => character.id === id))
  .filter((character): character is CharacterData => character !== undefined);

const TIERS: readonly CharacterTier[] = ['common', 'legendary', 'ascended'];

/** A rough power budget. Deliberately crude — it is a smell test, not a balance model. */
function budget(stats: StatBlockData): number {
  return Number(stats.hp) / 10 + Number(stats.atk) + Number(stats.def) * 2;
}

describe('the roster', () => {
  it('populates every faction at all three tiers', () => {
    for (const faction of factions) {
      for (const tier of TIERS) {
        const matching = characters.filter(
          (character) => character.faction === faction.id && character.tier === tier,
        );

        expect(matching.length, `${faction.id} ${tier}`).toBeGreaterThanOrEqual(1);
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

  it('offers a healer and a cleanse on the mortal ladder, not only the celestial one', () => {
    // The failure this guards against is not a fight lost, it is a *category of answer* a player
    // can never buy. Angels are the natural support and they ascend on copies of themselves
    // alone, so a run whose banners are unkind would otherwise have no sustain at any price.
    const mortalFactions = new Set(
      factions.filter((faction) => faction.ascensionPath === 'mortal').map((faction) => faction.id),
    );
    const mortals = characters.filter((character) => mortalFactions.has(character.faction));

    const heals = mortals.filter((character) =>
      (character.skills ?? []).some((skill) =>
        skill.effects.some((effect) => effect.kind === 'heal'),
      ),
    );
    const cleanses = mortals.filter((character) =>
      (character.skills ?? []).some((skill) =>
        skill.effects.some((effect) => effect.kind === 'cleanse'),
      ),
    );

    expect(heals.length).toBeGreaterThan(0);
    expect(cleanses.length).toBeGreaterThan(0);
    // And both have to be reachable early, or "available at any price" is still false in practice.
    expect(heals.some((character) => character.tier === 'common')).toBe(true);
    expect(cleanses.some((character) => character.tier === 'common')).toBe(true);
  });

  it('keeps every stat inside the range the simulation can use', () => {
    for (const character of characters) {
      const stats = character.stats;

      expect(Number(stats.hp), character.id).toBeGreaterThan(0);
      expect(Number(stats.atk), character.id).toBeGreaterThan(0);
      expect(Number(stats.def), character.id).toBeGreaterThanOrEqual(0);
      expect(Number(stats.recovery ?? 0), character.id).toBeGreaterThanOrEqual(0);
      // Haste is ATB gauge per tick against a threshold of 1000; above it a combatant would bank
      // two actions in a single tick and break turn ordering. Attack speed is added to the same
      // gauge, so the pair has to respect the bound between them.
      expect(stats.haste, character.id).toBeGreaterThanOrEqual(1);
      expect(stats.haste + (stats.attackSpeed ?? 0), character.id).toBeLessThanOrEqual(1000);
      expect(stats.attackSpeed ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(stats.critChance, character.id).toBeGreaterThanOrEqual(0);
      expect(stats.critChance, character.id).toBeLessThanOrEqual(1);
      expect(stats.critDamageAmp, character.id).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps every optional stat inside the bounds `content.ts` would clamp it to', () => {
    // Authored content that needed clamping is a bug for this spec to catch rather than damage to
    // repair: `content.ts` clamps because a *player's* save is untrusted, not because `data/` is.
    for (const character of characters) {
      const {
        lifeLeech,
        insight,
        tenacity,
        critBlock,
        physicalPierce,
        magicPierce,
        physicalResist,
        magicResist,
        critDamageResist,
        healthRegen,
        receivedHealing,
        dodge,
        accuracy,
        mp,
        mpRegen,
      } = character.stats;

      for (const [label, value] of [
        ['lifeLeech', lifeLeech],
        ['insight', insight],
        ['tenacity', tenacity],
        ['critBlock', critBlock],
        ['dodge', dodge],
      ] as const) {
        expect(value ?? 0, `${character.id} ${label}`).toBeGreaterThanOrEqual(0);
        expect(value ?? 0, `${character.id} ${label}`).toBeLessThanOrEqual(1);
      }
      expect(physicalPierce ?? 0, character.id).toBeLessThanOrEqual(MAX_PENETRATION);
      expect(magicPierce ?? 0, character.id).toBeLessThanOrEqual(MAX_PENETRATION);
      // Resist is the termination guard, not a balance number: a combatant nothing can damage
      // is a fight that runs to the tick cap.
      expect(physicalResist ?? 0, character.id).toBeLessThanOrEqual(MAX_RESIST);
      expect(magicResist ?? 0, character.id).toBeLessThanOrEqual(MAX_RESIST);
      expect(critDamageResist ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(healthRegen ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(receivedHealing ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(accuracy ?? 1, character.id).toBeLessThanOrEqual(MAX_ACCURACY);
      expect(mp ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(mpRegen ?? 0, character.id).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps every stat well inside float64, so the curve is not the reason for Decimal', () => {
    for (const character of characters) {
      expect(Number(character.stats.hp), character.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    }
  });
});

describe('kits', () => {
  it('gives every character at least one skill above its basic attack', () => {
    // A character with no kit is a stat block, and a stat block cannot be the answer to a lock.
    for (const character of characters) {
      expect((character.skills ?? []).length, character.id).toBeGreaterThan(0);
    }
  });

  it('only ever points at skills the library actually authors', () => {
    const known = new Set(skills.map((skill) => skill.id));

    for (const character of characters) {
      for (const skill of character.skills ?? []) {
        expect(known.has(skill.id), `${character.id}/${skill.id}`).toBe(true);
      }
    }
  });

  it('funds every metered skill from the pool of the character carrying it', () => {
    // A 24-MP skill on a 20-MP character is a skill that never fires, and nothing in the
    // simulation would report it — the character would simply swing for the whole fight.
    for (const character of characters) {
      for (const skill of character.skills ?? []) {
        if (skill.cost?.kind === 'mp') {
          expect(character.stats.mp ?? 0, `${character.id}/${skill.id}`).toBeGreaterThanOrEqual(
            skill.cost.amount ?? 0,
          );
        }
        if (skill.cost?.kind === 'hp') {
          // Strictly greater: an HP cost is never allowed to be lethal, so a skill priced at the
          // caster's whole health pool could never be used either.
          expect(Number(character.stats.hp), `${character.id}/${skill.id}`).toBeGreaterThan(
            skill.cost.amount ?? 0,
          );
        }
      }
    }
  });

  it('gives every free skill a cooldown, so nothing is both unmetered and unlimited', () => {
    for (const character of characters) {
      for (const skill of character.skills ?? []) {
        if ((skill.cost?.kind ?? 'none') === 'none') {
          expect(skill.cooldown ?? 0, `${character.id}/${skill.id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('puts every kit above the basic attack in the selection order', () => {
    // The basic attack sits at priority 0 and is the floor rather than a candidate. A skill at or
    // below it would never be chosen and would read as a bug in the simulation instead of in the
    // content.
    for (const character of characters) {
      for (const skill of character.skills ?? []) {
        expect(skill.priority ?? 1, `${character.id}/${skill.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('authors more than one way to reach an enemy back rank', () => {
    // The front rank is a gate, and an encounter built around a protected healer is only fair if
    // more than one character can answer it — otherwise the lock has exactly one key and the
    // gacha decides whether the player owns it.
    const reachers = characters.filter((character) =>
      (character.skills ?? []).some(
        (skill) => skill.target === 'enemy-back' || skill.target === 'enemy-row-back',
      ),
    );

    expect(reachers.length).toBeGreaterThanOrEqual(3);
    // At least one of them common tier, so the answer does not depend on a lucky banner.
    expect(reachers.some((character) => character.tier === 'common')).toBe(true);
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
    const axes: readonly (keyof StatBlockData)[] = [
      'hp',
      'atk',
      'def',
      'recovery',
      'haste',
      'attackSpeed',
      'critChance',
    ];
    const peers = characters.filter((character) => character.tier === tier);
    const dominated: string[] = [];

    for (const candidate of peers) {
      for (const rival of peers) {
        if (candidate === rival) {
          continue;
        }
        const worseEverywhere = axes.every(
          (axis) => Number(rival.stats[axis] ?? 0) >= Number(candidate.stats[axis] ?? 0),
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
    //
    // Read across the three canonical tiers rather than across every member: Humans and Dwarves
    // now carry a fourth character each — the mortal healer and the mortal cleanse — and neither
    // is on their faction's axis, which is exactly why they were added.
    const axisOf: Readonly<Record<string, keyof StatBlockData>> = {
      dwarf: 'def',
      elf: 'haste',
      monster: 'atk',
      demon: 'critChance',
      undead: 'hp',
      angel: 'def',
    };
    const canonical: Readonly<Record<string, readonly string[]>> = {
      dwarf: ['bran', 'korrin', 'thraun'],
      elf: ['rin', 'lysha', 'aelrindel'],
      monster: ['gnash', 'ruk', 'vharok'],
      demon: ['pyra', 'malakar', 'azrathoth'],
      undead: ['mortlach', 'sable', 'nekros'],
      angel: ['celia', 'ithuriel', 'seraphine'],
    };

    for (const [faction, axis] of Object.entries(axisOf)) {
      const values = canonical[faction].map((id) =>
        Number(characters.find((character) => character.id === id)?.stats[axis] ?? 0),
      );

      expect(values[1], `${faction} ${axis}`).toBeGreaterThan(values[0]);
      expect(values[2], `${faction} ${axis}`).toBeGreaterThan(values[1]);
    }
  });
});

describe('the starting formation', () => {
  it('names three characters that exist, with distinct ids', () => {
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

  it('stands the wall and the generalist in front and the ranger behind', () => {
    // Load-bearing in three separate ways: the front rank is what enemy attacks work through,
    // Rin is the party's only answer to an enemy back rank, and at 430 HP she does not survive
    // being reached.
    expect([...STARTER_FORMATION.front]).toEqual([BRAN.id, MIRA.id]);
    expect([...STARTER_FORMATION.back]).toEqual([RIN.id]);
  });
});
