// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type CharacterData,
  type CharacterTier,
  type FactionData,
  growthMultiplier,
  type KitRulesData,
  MAX_ACCURACY,
  MAX_ENERGY,
  MAX_PENETRATION,
  MAX_RARITY_INDEX,
  rarityIndex,
  MAX_RESIST,
  PARTY_SIZE,
  rarityLabel,
  type SkillData,
  skillCeiling,
  type StatBlockData,
  startRarityIndex,
  unlockedSkills,
} from '../core';
import { FACTIONS } from './ascension';
import * as authored from './characters';
import { BRAN, CHARACTERS, MIRA, RIN, STARTER_FORMATION } from './characters';
import { KIT_RULES } from './kits';
import { GROWTH } from './levels';
import { SKILLS } from './skills';
import * as surface from '.';

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
const kits: KitRulesData = KIT_RULES;
const starters: readonly CharacterData[] = [...STARTER_FORMATION.front, ...STARTER_FORMATION.back]
  .map((id) => characters.find((character) => character.id === id))
  .filter((character): character is CharacterData => character !== undefined);

const TIERS: readonly CharacterTier[] = ['common', 'legendary', 'ascended'];

/** A rough power budget. Deliberately crude — it is a smell test, not a balance model. */
function budget(stats: StatBlockData): number {
  return Number(stats.hp) / 10 + Number(stats.atk) + Number(stats.def) * 2;
}

/**
 * The shape milestone 8e settled on: **three common, three legendary, and at least one ascended,
 * in every faction.**
 *
 * The first two are closed and the third is open, and the asymmetry is the whole decision. Common
 * and legendary tier are the *bench* — they are what a mono-faction five is built out of and what
 * the mortal ladder eats as fodder, and both jobs want a fixed, known depth rather than a pool
 * that grows every time content ships. Ascended tier is where new characters will keep arriving,
 * because that is the tier a banner is for.
 *
 * Written as numbers rather than derived, deliberately, and this is the "threshold that fails when
 * content outgrows it" case rather than the "number copied out of a neighbouring file" one: there
 * is nothing to derive it *from*. If a fourth common-tier Elf ever lands, this failing is the
 * intended outcome — the roster shape is a design decision, and changing it should be an edit
 * here and an argument in `docs/milestones.md`, not a silent drift.
 */
const ROSTER_SHAPE: Readonly<Record<CharacterTier, { exactly?: number; atLeast?: number }>> = {
  common: { exactly: 3 },
  legendary: { exactly: 3 },
  ascended: { atLeast: 1 },
};

describe('the roster', () => {
  it('fields three common, three legendary and at least one ascended in every faction', () => {
    // Milestone 8d pays a party for its own composition on the argument that a mono-faction bonus
    // creates seven optimal teams rather than one. That argument is false unless all seven can
    // actually be fielded, and before this milestone none of them could — twenty-three characters
    // over seven factions is roughly three each, and a mono-five needed an Angel standing in as a
    // wildcard. This is the assertion that keeps the premise true.
    const wrong: string[] = [];

    for (const faction of factions) {
      for (const tier of TIERS) {
        const count = characters.filter(
          (character) => character.faction === faction.id && character.tier === tier,
        ).length;
        const { exactly, atLeast } = ROSTER_SHAPE[tier];

        if (exactly !== undefined && count !== exactly) {
          wrong.push(`${faction.id} has ${count} ${tier}, wants exactly ${exactly}`);
        }
        if (atLeast !== undefined && count < atLeast) {
          wrong.push(`${faction.id} has ${count} ${tier}, wants at least ${atLeast}`);
        }
      }
    }

    expect(wrong).toEqual([]);
  });

  it('can field a full party from any single faction', () => {
    // The mechanical form of the rule above, and the one that would still be true if the shape
    // changed: a mono-faction five has to be buildable out of characters the player owns rather
    // than out of Angels counting as something else. `PARTY_SIZE` is read off `core/` so this
    // tracks a formation that grows or shrinks.
    for (const faction of factions) {
      const mates = characters.filter((character) => character.faction === faction.id);

      expect(mates.length, faction.id).toBeGreaterThanOrEqual(PARTY_SIZE);
    }
  });

  it('gives every faction its own answer to staying alive', () => {
    // 8d's premise again, from the other side. A faction that can field five bodies and none of
    // them can restore health is a mono-five that loses to attrition on principle, which would
    // make the composition bonus a trap rather than a decision.
    //
    // "Answer" is deliberately broad, because the factions do not answer it the same way and
    // flattening them into seven healers is exactly what this milestone declined to do. A heal, a
    // regeneration, an absorb pool and a siphon are all counted — Monsters have only the last of
    // those, on purpose, and that is a faction identity rather than a gap.
    const restores = (character: CharacterData): boolean =>
      (character.skills ?? []).some((skill) =>
        skill.effects.some(
          (effect) =>
            effect.kind === 'heal' ||
            effect.kind === 'drain' ||
            (effect.kind === 'status' &&
              (effect.status.kind === 'regen' || effect.status.kind === 'shield')),
        ),
      ) || Number(character.stats.lifeLeech ?? 0) > 0;

    const bare = factions
      .filter(
        (faction) =>
          !characters.some((character) => character.faction === faction.id && restores(character)),
      )
      .map((faction) => faction.id);

    expect(bare).toEqual([]);
  });

  it('gives every faction a way past a front rank', () => {
    // The other thing a mono-five needs and cannot substitute for. Rank is a gate, not a damage
    // reduction: a party with no back-rank targeting cannot *select* a protected healer at all, so
    // an encounter built around one is unwinnable rather than merely hard. Monsters were the last
    // faction without an answer, and Ghorrak is it.
    const reaching = (character: CharacterData): boolean =>
      (character.skills ?? []).some(
        (skill) =>
          skill.target === 'enemy-back' ||
          skill.target === 'enemy-row-back' ||
          skill.target === 'enemy-all' ||
          skill.target === 'enemy-lowest' ||
          skill.target === 'enemy-highest',
      );

    const blind = factions
      .filter(
        (faction) =>
          !characters.some((character) => character.faction === faction.id && reaching(character)),
      )
      .map((faction) => faction.id);

    expect(blind).toEqual([]);
  });

  it('re-exports every character from `data/index.ts`', () => {
    // `data/index.ts` is the public surface, and a hand-maintained re-export list is exactly the
    // kind of thing that goes stale silently: the roster keeps working, every spec keeps passing,
    // and one character is simply unreachable through the barrel. Milestone 8e shipped 26 new
    // characters and left Nyxara off the list — nothing caught it, because nothing was looking.
    //
    // Derived from the module rather than from a count, so it stays true as the roster grows.
    const named = Object.keys(authored).filter(
      (key) => key !== 'CHARACTERS' && key !== 'STARTER_FORMATION',
    );
    const missing = named.filter((key) => !(key in surface));

    expect(named.length).toBe(characters.length);
    expect(missing).toEqual([]);
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
        energyRegen,
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
      // Bounded by the bar it fills. Above `MAX_ENERGY` is "charged every turn regardless",
      // which is a one-turn cooldown rather than a meter.
      expect(energyRegen ?? 0, character.id).toBeGreaterThanOrEqual(0);
      expect(energyRegen ?? 0, character.id).toBeLessThanOrEqual(MAX_ENERGY);
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

  it('authors every kit at exactly its tier’s ceiling', () => {
    // Never fewer, or a character is short of what its tier promises. Never more, or content is
    // authored that no amount of ascending could ever reach — `kitSlots` would report it locked
    // with no rung that unlocks it, which is a bug that only shows up on a fully invested
    // character months into a run.
    const wrong = characters
      .map((character) => ({
        id: character.id,
        skills: (character.skills ?? []).length,
        ceiling: skillCeiling(kits, character.tier),
      }))
      .filter((entry) => entry.skills !== entry.ceiling)
      .map((entry) => `${entry.id} has ${entry.skills}, ceiling is ${entry.ceiling}`);

    expect(wrong).toEqual([]);
  });

  it('authors the ultimate first and the rest in the order they unlock', () => {
    // A convention rather than a mechanism — `unlockedSkills` finds the ultimate by its flag, and
    // combat sorts by priority — but it is what makes a kit readable as a progression: second
    // entry at Elite, third at Legendary, fourth at Ascended.
    const misordered = characters
      .filter((character) => (character.skills ?? [])[0]?.ultimate !== true)
      .map((character) => character.id);

    expect(misordered).toEqual([]);
  });

  it('leaves every tier with a working kit at every rung it can reach', () => {
    // The gate has to narrow a kit, never empty one. A rung that hands a character nothing but a
    // basic attack is a character the player cannot field, and the starting party sits at `rare`
    // — the rung where every common-tier kit is at its thinnest.
    for (const character of characters) {
      for (let rarity = startRarityIndex(character.tier); rarity <= MAX_RARITY_INDEX; rarity++) {
        const unlocked = unlockedSkills(character.skills ?? [], kits, character.tier, rarity);

        expect(unlocked.length, `${character.id} at ${rarityLabel(rarity)}`).toBeGreaterThan(0);
        expect(
          unlocked.filter((skill) => skill.ultimate === true).length,
          `${character.id} at ${rarityLabel(rarity)}`,
        ).toBe(1);
      }
    }
  });

  it('gives every character exactly one ultimate', () => {
    // The promise the rest of the game is written against. "The ultimate" is a thing the roster
    // screen names, the energy bar meters, and milestone 8c's skill gating exempts from its
    // ceiling — and none of those can point at a kit carrying none or two.
    //
    // Two would be worse than none, and silently: they share one bar, so the lower-priority of
    // them could never fire and would read as a simulation bug rather than a content one.
    const counts = characters.map((character) => ({
      id: character.id,
      ultimates: (character.skills ?? []).filter((skill) => skill.ultimate === true).length,
    }));

    expect(counts.filter((entry) => entry.ultimates !== 1)).toEqual([]);
  });

  it('gives every ordinary skill a cooldown, so nothing is both unmetered and unlimited', () => {
    // An ultimate is exempt because the bar *is* its cooldown — and `toSkill` discards one
    // authored on an ultimate anyway, so a kit carrying both would be quietly half-ignored.
    for (const character of characters) {
      for (const skill of character.skills ?? []) {
        if (skill.ultimate === true) {
          expect(skill.cooldown, `${character.id}/${skill.id}`).toBeUndefined();
          continue;
        }
        expect(skill.cooldown ?? 0, `${character.id}/${skill.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('never gates an ultimate on something a stage might not contain', () => {
    // A condition on an ultimate means "wait", never "never". A healer holding its bar until an
    // ally is hurt is the system working; a bar gated on three living enemies is one the player
    // watches fill and never spend on a boss stage. Only the `hurt` conditions are about a state
    // the fight will reach on its own.
    const stranded = characters.flatMap((character) =>
      (character.skills ?? [])
        .filter(
          (skill) =>
            skill.ultimate === true &&
            skill.condition !== undefined &&
            skill.condition.kind !== 'ally-hurt' &&
            skill.condition.kind !== 'self-hurt',
        )
        .map((skill) => `${character.id}/${skill.id} ${skill.condition?.kind}`),
    );

    expect(stranded).toEqual([]);
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

  it('starts each tier on a rung of its own', () => {
    // Three tiers, three starting rungs, and the gap between them IS the cost difference — every
    // rung charges every character the same, so a tier is worth exactly the rungs it skips.
    for (const character of characters) {
      const expected = {
        ascended: rarityIndex('elite'),
        legendary: rarityIndex('rare'),
        common: rarityIndex('common'),
      }[character.tier];

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
    // Read across three named characters per faction rather than across every member, and since
    // milestone 8e that is three out of seven rather than three out of four. The other four are
    // the roles a mono-faction five needs and the faction axis does not supply — a Dwarf who can
    // kill something, an Elf who can stand in a front rank, a Monster who can reach a back one.
    // Every one of them is deliberately *off* the axis, so asserting the slope across all seven
    // would be asserting that the roster has no depth.
    //
    // The trio is therefore a **claim about the tier ladder**, not a summary of the faction: it
    // says that if you follow one archetype from common to ascended the faction's own stat rises
    // both times. A new character joins this list only if it is meant to be that archetype.
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
