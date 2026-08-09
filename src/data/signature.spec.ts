// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  type CharacterData,
  MAX_BATTLE_TICKS,
  maxSignatureLevel,
  rarityIndex,
  type SignatureItemData,
  type SignatureRulesData,
  signatureCost,
  signatureTotalCost,
  startRarityIndex,
  type StatusData,
} from '../core';
import { CHARACTERS } from './characters';
import { SIGNATURE_ITEMS, SIGNATURE_RULES } from './signature';
import { STATUSES } from './statuses';

/**
 * Conformance through a typed local, for the reason every `data/` spec uses one: `data/` may not
 * import `core/`, so this assignment is what turns a malformed item into a compile error rather
 * than content that ships and silently does nothing.
 */
const items: readonly SignatureItemData[] = SIGNATURE_ITEMS;
const rules: SignatureRulesData = SIGNATURE_RULES;

/**
 * The roster and the status table, widened out of their `as const` literal types.
 *
 * Without these every `skill.id` is a 130-way string union and every comparison against a plain
 * `string` is a type error — the same reason `chapters.spec.ts` takes a typed local of `CHAPTERS`.
 */
const characters: readonly CharacterData[] = CHARACTERS;
const statuses: readonly StatusData[] = STATUSES;

/** The ascended-tier characters, which is exactly the set that may hold a signature item. */
const ASCENDED = characters.filter((character) => character.tier === 'ascended');

/** One character's authored definition, or nothing when the id names nobody. */
function definitionOf(defId: string): CharacterData | undefined {
  return characters.find((entry) => entry.id === defId);
}

/** Every skill id in a character's authored kit. */
function kitSkillIds(defId: string): readonly string[] {
  return (definitionOf(defId)?.skills ?? []).map((skill) => skill.id);
}

describe('the shipped signature items', () => {
  it('ships exactly one per ascended-tier character', () => {
    // ⚠️ Derived from `CHARACTERS` rather than asserted as seven. A new ascended-tier character
    // without an item is a character whose panel is permanently empty, which is content that
    // compiles, ships and silently never pays — the same failure `towers.spec.ts` guards for a
    // tower with no way in.
    expect(items).toHaveLength(ASCENDED.length);
    expect(items.map((item) => item.defId).sort()).toEqual(
      ASCENDED.map((character) => character.id).sort(),
    );
  });

  it('never names a character that is not ascended tier', () => {
    // The other direction, and the one that would be inert rather than missing: `signatureUnlocked`
    // checks the tier, so an item pointed at a legendary-tier character would never activate.
    for (const item of items) {
      const character = definitionOf(item.defId);
      expect(character?.tier, item.id).toBe('ascended');
    }
  });

  it('gives every item a unique id', () => {
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
  });

  it('authors one ability rung per tier mark', () => {
    // Four at the shipped numbers — levels 1, 10, 20 and 30. Derived from the rules rather than
    // written as four, so raising `maxLevel` without authoring the rungs to fill it fails here.
    const expected = Math.floor(maxSignatureLevel(rules) / rules.tierEvery) + 1;

    for (const item of items) {
      expect(item.tiers, item.id).toHaveLength(expected);
    }
  });

  it('gives every rung a name and a description', () => {
    for (const item of items) {
      for (const tier of item.tiers) {
        expect(tier.name.length, `${item.id} ${tier.name}`).toBeGreaterThan(0);
        expect(tier.description.length, `${item.id} ${tier.name}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('skill overrides', () => {
  it('only ever names a skill the character actually has', () => {
    // ⚠️ An override naming a missing skill is **inert** rather than an error at runtime, which is
    // the right behaviour and the reason this test has to exist: nothing at all would go wrong on
    // screen, and the ability would simply never happen.
    for (const item of items) {
      const known = new Set<string>(kitSkillIds(item.defId));
      for (const tier of item.tiers) {
        for (const override of tier.skills ?? []) {
          expect(known.has(override.skillId), `${item.id}: ${override.skillId}`).toBe(true);
        }
      }
    }
  });

  it('never takes an ordinary skill to a cooldown below the floor', () => {
    // ⚠️ A cooldown-free ordinary skill is a strictly better basic attack available every single
    // turn, which does not make a character strong so much as collapse its whole kit into one row
    // of the event log. The ultimate is exempt because it is metered by energy and carries no
    // cooldown at all.
    const FLOOR = 15;

    for (const item of items) {
      const character = definitionOf(item.defId);
      const ultimates = new Set<string>(
        (character?.skills ?? []).filter((skill) => skill.ultimate).map((skill) => skill.id),
      );
      for (const tier of item.tiers) {
        for (const override of tier.skills ?? []) {
          if (override.cooldown !== undefined && !ultimates.has(override.skillId)) {
            expect(override.cooldown, `${item.id}: ${override.skillId}`).toBeGreaterThanOrEqual(
              FLOOR,
            );
          }
        }
      }
    }
  });

  it('never shortens a cooldown past what the skill was authored with', () => {
    // A signature item that made a skill *slower* is content nobody would author on purpose, and
    // it would read on the sheet as an upgrade. Cheap to hold, and it catches a transposed pair.
    for (const item of items) {
      const character = definitionOf(item.defId);
      for (const tier of item.tiers) {
        for (const override of tier.skills ?? []) {
          const authored = (character?.skills ?? []).find(
            (skill) => skill.id === override.skillId,
          )?.cooldown;
          if (override.cooldown !== undefined && authored !== undefined) {
            expect(override.cooldown, `${item.id}: ${override.skillId}`).toBeLessThanOrEqual(
              authored,
            );
          }
        }
      }
    }
  });

  it('never leaves a damaging skill with no effects at all', () => {
    // `effects` **replaces** rather than appends, so an override that means "the same hit, harder"
    // has to restate every clause. Forgetting one is how a skill silently stops applying its
    // status — an override with an empty list is the loudest version of that mistake.
    for (const item of items) {
      for (const tier of item.tiers) {
        for (const override of tier.skills ?? []) {
          if (override.effects !== undefined) {
            expect(override.effects.length, `${item.id}: ${override.skillId}`).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

describe('opening passives', () => {
  it('only grants statuses this build actually authors', () => {
    const known = new Set<string>(statuses.map((status) => status.id));

    for (const item of items) {
      for (const tier of item.tiers) {
        for (const status of tier.opening ?? []) {
          expect(known.has(status.id), `${item.id}: ${status.id}`).toBe(true);
        }
      }
    }
  });

  it('never grants a hostile status to its own wearer', () => {
    for (const item of items) {
      for (const tier of item.tiers) {
        for (const status of tier.opening ?? []) {
          expect(status.hostile, `${item.id}: ${status.id}`).toBe(false);
        }
      }
    }
  });

  it('outlasts the longest fight, so a permanent passive really is permanent', () => {
    // ⚠️ Derived against `MAX_BATTLE_TICKS` rather than restated as 1000. Raising the tick cap
    // without raising the duration would leave every passive quietly expiring in long fights —
    // which is exactly the fights where it mattered.
    for (const item of items) {
      for (const tier of item.tiers) {
        for (const status of tier.opening ?? []) {
          expect(status.duration, `${item.id}: ${status.id}`).toBeGreaterThan(MAX_BATTLE_TICKS);
        }
      }
    }
  });

  it('never grants a regeneration, because sustain that cannot lose stalls into a defeat', () => {
    // ⚠️ The least intuitive rule in this file. Closing pressure amplifies damage without bound
    // past `PRESSURE_AFTER_TICKS` and deliberately does **not** amplify healing, so a permanent
    // regeneration does not win fights — it stops anything dying, runs the ninety-second clock
    // out, and a timeout is a defeat. A shield is safe where a regeneration is not: it banks a
    // pool once and depletes, so it cannot outrun rising damage.
    for (const item of items) {
      for (const tier of item.tiers) {
        for (const status of tier.opening ?? []) {
          expect(status.kind, `${item.id}: ${status.id}`).not.toBe('regen');
        }
      }
    }
  });

  it('reserves passives for the rungs that are actually deep', () => {
    // A passive at rung 0 would arrive at level 1, which is the unlock — it belongs to the climb.
    for (const item of items) {
      expect(item.tiers[0].opening, item.id).toBeUndefined();
    }
  });
});

describe('the stat profiles', () => {
  /** Every stat share in an item's profile, summed. */
  function budget(item: SignatureItemData): number {
    return Object.values(item.perLevel).reduce((sum, share) => sum + (share ?? 0), 0);
  }

  it('sits in a narrow band around five percent a level', () => {
    // Roughly +150% at level 30, comparable to a maxed gear set's attack contribution. The band
    // is deliberately narrow rather than exact: the four stats are not worth the same per point,
    // so a haste-heavy profile carries a smaller total. Anything outside this is a retune to make
    // deliberately, not a threshold to widen.
    for (const item of items) {
      expect(budget(item), item.id).toBeGreaterThanOrEqual(0.04);
      expect(budget(item), item.id).toBeLessThanOrEqual(0.06);
    }
  });

  it('gives the haste-moving items the smallest budgets', () => {
    // ⚠️ Turn frequency is `ceil(1000 / haste)`, which is sharply non-linear — the one stat where
    // a percentage buys more than the percentage suggests. This is what stops a future retune
    // handing a haste profile the same total as a defence one.
    const moved = items.filter((item) => (item.perLevel.haste ?? 0) > 0);
    const still = items.filter((item) => (item.perLevel.haste ?? 0) === 0);

    expect(moved.length).toBeGreaterThan(0);
    expect(Math.max(...moved.map(budget))).toBeLessThanOrEqual(Math.min(...still.map(budget)));
  });

  it('never authors a share that is zero or negative', () => {
    // A zero share and an absent one produce the same combatant, so a zero is a line that reads
    // as a bonus and is not one.
    for (const item of items) {
      for (const [stat, share] of Object.entries(item.perLevel)) {
        expect(share, `${item.id}: ${stat}`).toBeGreaterThan(0);
      }
    }
  });

  it('moves at least two stats on every item, so no profile is a single spike', () => {
    for (const item of items) {
      expect(Object.keys(item.perLevel).length, item.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('the rules', () => {
  it('unlocks at a rarity the ladder actually has', () => {
    expect(rarityIndex(rules.unlockRarity)).toBeGreaterThanOrEqual(0);
  });

  it('unlocks above where an ascended-tier character starts', () => {
    // ⚠️ The whole of what makes this a *deep* investment track. An unlock at or below the
    // starting rung would hand a signature item over with the character, which is milestone 16's
    // opposite. Derived from `startRarityIndex` rather than compared against a literal 8.
    expect(rarityIndex(rules.unlockRarity)).toBeGreaterThan(startRarityIndex('ascended'));
  });

  it('prices the whole climb within a factor of the stated total', () => {
    // The number quoted everywhere else — 996 — measured rather than restated, so a retune of
    // either coefficient fails here naming the real figure.
    expect(signatureTotalCost(rules, maxSignatureLevel(rules))).toBeGreaterThan(900);
    expect(signatureTotalCost(rules, maxSignatureLevel(rules))).toBeLessThan(1100);
  });

  it('charges more for a later level than an earlier one', () => {
    expect(signatureCost(rules, maxSignatureLevel(rules))).toBeGreaterThan(signatureCost(rules, 1));
  });

  it('puts a tier mark on the last level rather than past it', () => {
    // `maxLevel` divisible by `tierEvery` is what makes the top rung land exactly on the ceiling.
    // Off by one and the last ten levels buy no ability at all.
    expect(maxSignatureLevel(rules) % rules.tierEvery).toBe(0);
  });
});
