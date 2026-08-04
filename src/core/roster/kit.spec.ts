// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type SkillData } from '../battle/types';
import { TEST_KIT_RULES as RULES } from './fixtures';
import {
  kitSlots,
  type KitRulesData,
  nextSkillUnlock,
  ordinaryUnlock,
  skillCeiling,
  unlockedSkills,
} from './kit';
import { rarityIndex } from './rarity';
import { type CharacterTier } from './types';

/** Rarity indices by name, so the expectations below read as rungs rather than as numbers. */
const RARE = rarityIndex('rare');
const ELITE = rarityIndex('elite');
const LEGENDARY = rarityIndex('legendary');
const ASCENDED = rarityIndex('ascended');

function skill(id: string, ultimate = false): SkillData {
  return {
    id,
    name: id,
    target: 'enemy-front',
    effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
    ...(ultimate ? { ultimate: true } : { cooldown: 30 }),
  };
}

/** A kit in the shape `data/` authors: the ultimate first, then ordinary skills in unlock order. */
const KIT: readonly SkillData[] = [
  skill('ultimate', true),
  skill('second'),
  skill('third'),
  skill('fourth'),
];

const ids = (skills: readonly SkillData[]): readonly string[] => skills.map((entry) => entry.id);

describe('skillCeiling', () => {
  it('reads the authored table', () => {
    expect(skillCeiling(RULES, 'common')).toBe(2);
    expect(skillCeiling(RULES, 'legendary')).toBe(3);
    expect(skillCeiling(RULES, 'ascended')).toBe(4);
  });

  it('never drops below one, because every kit has an ultimate', () => {
    // A ceiling of zero would be a combatant whose energy bar fills and can never be spent, which
    // reads as a simulation bug rather than as content. Damaged rules land on the floor instead.
    const damaged: KitRulesData = {
      ceiling: { common: 0, legendary: Number.NaN, ascended: -3 },
      unlocks: RULES.unlocks,
    };

    for (const tier of ['common', 'legendary', 'ascended'] as CharacterTier[]) {
      expect(skillCeiling(damaged, tier), tier).toBe(1);
    }
  });
});

describe('ordinaryUnlock', () => {
  it('maps the ordinals onto the authored rungs', () => {
    expect(ordinaryUnlock(RULES, 'ascended', 0)).toBe(ELITE);
    expect(ordinaryUnlock(RULES, 'ascended', 1)).toBe(LEGENDARY);
    expect(ordinaryUnlock(RULES, 'ascended', 2)).toBe(ASCENDED);
  });

  it('stops at the tier’s ceiling rather than at the end of the rung list', () => {
    // Common tier is ultimate + 1: the second and third rungs unlock nothing for it, however many
    // thresholds the table happens to author.
    expect(ordinaryUnlock(RULES, 'common', 0)).toBe(ELITE);
    expect(ordinaryUnlock(RULES, 'common', 1)).toBeUndefined();
    expect(ordinaryUnlock(RULES, 'legendary', 1)).toBe(LEGENDARY);
    expect(ordinaryUnlock(RULES, 'legendary', 2)).toBeUndefined();
  });

  it('treats a threshold that is not a rarity as a rung that never comes', () => {
    // Locked rather than free. A typo should cost a skill visibly, not hand out one nobody
    // authored a price for — and `data/kits.spec.ts` catches it before either happens.
    const damaged: KitRulesData = { ceiling: RULES.ceiling, unlocks: ['elite', 'wildly-rare'] };

    expect(ordinaryUnlock(damaged, 'ascended', 0)).toBe(ELITE);
    expect(ordinaryUnlock(damaged, 'ascended', 1)).toBeUndefined();
    expect(ordinaryUnlock(damaged, 'ascended', 2)).toBeUndefined();
  });
});

describe('unlockedSkills', () => {
  it('gives a common-tier character its ultimate at Rare and its second skill at Elite', () => {
    expect(ids(unlockedSkills(KIT.slice(0, 2), RULES, 'common', RARE))).toEqual(['ultimate']);
    expect(ids(unlockedSkills(KIT.slice(0, 2), RULES, 'common', ELITE))).toEqual([
      'ultimate',
      'second',
    ]);
  });

  it('never unlocks past the tier’s ceiling, however far a character is ascended', () => {
    // The ceiling is the tier's promise. A common-tier character at the top of the ladder is a
    // fully invested common-tier character, not a legendary one.
    expect(ids(unlockedSkills(KIT.slice(0, 2), RULES, 'common', ASCENDED))).toEqual([
      'ultimate',
      'second',
    ]);
  });

  it('hands an ascended-tier character its second skill for free at its starting rung', () => {
    // The head start, stated as a test. `ascended` tier starts at `elite`, the thresholds are read
    // against the ladder rather than against each character's own floor, and the two together mean
    // it arrives already holding what a common-tier character climbs two rungs for.
    expect(ids(unlockedSkills(KIT, RULES, 'ascended', ELITE))).toEqual(['ultimate', 'second']);
    expect(ids(unlockedSkills(KIT, RULES, 'ascended', LEGENDARY))).toEqual([
      'ultimate',
      'second',
      'third',
    ]);
    expect(ids(unlockedSkills(KIT, RULES, 'ascended', ASCENDED))).toEqual([
      'ultimate',
      'second',
      'third',
      'fourth',
    ]);
  });

  it('unlocks ordinary skills in the order the kit authors them', () => {
    // The list order *is* the progression, which is what lets `data/` express it by writing a kit
    // top to bottom rather than by numbering each skill.
    const reordered: readonly SkillData[] = [
      skill('ultimate', true),
      skill('later'),
      skill('earlier'),
    ];

    expect(ids(unlockedSkills(reordered, RULES, 'legendary', ELITE))).toEqual([
      'ultimate',
      'later',
    ]);
  });

  it('never gates the ultimate, even below the tier’s own starting rung', () => {
    // A damaged save can hold an `ascended`-tier character at `rare`. Losing stats to that is
    // recoverable; losing the one skill the energy bar meters is a fight that cannot be read.
    expect(ids(unlockedSkills(KIT, RULES, 'ascended', RARE))).toEqual(['ultimate']);
    expect(ids(unlockedSkills(KIT, RULES, 'ascended', Number.NaN))).toEqual(['ultimate']);
  });

  it('finds the ultimate wherever the kit puts it', () => {
    // The flag decides, not the position — so a kit authored out of convention still fights with
    // its ultimate, and the convention stays a readability rule rather than a load-bearing one.
    const trailing: readonly SkillData[] = [skill('second'), skill('ultimate', true)];

    expect(ids(unlockedSkills(trailing, RULES, 'common', RARE))).toEqual(['ultimate']);
  });

  it('returns nothing for an empty kit rather than inventing a slot', () => {
    expect(unlockedSkills([], RULES, 'common', ASCENDED)).toEqual([]);
  });
});

describe('kitSlots', () => {
  it('reports the whole kit, locked entries included, so the sheet can show what is coming', () => {
    const slots = kitSlots(KIT, RULES, 'ascended', ELITE);

    expect(slots.map((slot) => slot.unlocked)).toEqual([true, true, false, false]);
    expect(slots.map((slot) => slot.unlocksAt)).toEqual([ELITE, ELITE, LEGENDARY, ASCENDED]);
  });

  it('marks a skill past the tier’s ceiling as locked with no rung that would unlock it', () => {
    // Nothing ships in this state — `data/characters.spec.ts` asserts every kit is authored
    // exactly at its ceiling — but "locked forever" is the honest answer for content that no
    // amount of ascending could reach.
    const slots = kitSlots(KIT, RULES, 'common', ASCENDED);

    expect(slots.map((slot) => slot.unlocked)).toEqual([true, true, false, false]);
    expect(slots[2].unlocksAt).toBeUndefined();
    expect(slots[3].unlocksAt).toBeUndefined();
  });
});

describe('nextSkillUnlock', () => {
  it('names the skill the next rung buys', () => {
    expect(nextSkillUnlock(KIT, RULES, 'ascended', ELITE)?.skill.id).toBe('third');
    expect(nextSkillUnlock(KIT, RULES, 'ascended', ELITE)?.unlocksAt).toBe(LEGENDARY);
  });

  it('is undefined once there is nothing left to buy', () => {
    // What the ascension card checks before promising anything: a fully unlocked kit says nothing
    // rather than saying "next rung unlocks —".
    expect(nextSkillUnlock(KIT, RULES, 'ascended', ASCENDED)).toBeUndefined();
    expect(nextSkillUnlock(KIT.slice(0, 2), RULES, 'common', ELITE)).toBeUndefined();
  });
});
