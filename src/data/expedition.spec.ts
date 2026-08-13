// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type ActivityData,
  cheapestStaminaTo,
  type EnemyData,
  expeditionMapIssues,
  type ExpeditionMapData,
  type ExpeditionRulesData,
} from '../core';
import { ACTIVITIES } from './activities';
import { FACTIONS } from './ascension';
import { DESCENT_RULES } from './descent';
import { EXPEDITION_MAPS, EXPEDITION_RULES } from './expedition';
import { QUESTS } from './quests';

/**
 * Conformance through typed locals, because `data/` may not import `core/`. This is what turns a
 * malformed grid row, a camp with no board, or a chest naming a currency nothing ships into a
 * compile error rather than a map nobody can finish.
 */
const rules: ExpeditionRulesData = EXPEDITION_RULES;
const maps: readonly ExpeditionMapData[] = EXPEDITION_MAPS;
const activities: readonly ActivityData[] = ACTIVITIES;

const FACTION_IDS = FACTIONS.map((faction) => faction.id);

/** Every body on a camp's board, both ranks. */
const bodies = (camp: ExpeditionMapData['camps'][number]): readonly EnemyData[] => [
  ...camp.enemies.front,
  ...camp.enemies.back,
];

/**
 * The taunting and healing archetypes, named by id — the same lists, for the same reason and with
 * the same maintenance cost, as `descent.spec.ts`: a spec in `data/` cannot resolve a skill's
 * status list without importing `core/`'s parser. The rule they guard is 15c's — sustain the party
 * cannot aim at is the ninety-second clock wearing a boss's stat block — and here it would cost a
 * retry, which free restarts make cheap but a puzzle mode should still never author.
 */
const TAUNTERS = new Set([
  'free-blade',
  'barrow-sovereign',
  'oathshield-vanguard',
  'riven-marchwarden',
  'sealward-custodian',
  'cairnward-husk',
  'cairnbound-sentinel',
  'grudgeplate-smith',
  'oathstone-bastion',
  'bloodgorge-hound',
  'scarbound-bellower',
  'ironsling-wright',
  'edgeturn-warden',
  'sunfade-chanter',
  'crownbark-bastion',
]);

const HEALERS = new Set([
  'acolyte',
  'stormcaller',
  'hierophant',
  'tyrant',
  'unmade',
  'thornweald-warden',
  'chainsworn',
  'the-redmaw',
  'the-everwound',
  'the-deathless-marshal',
  'litany-bearer',
]);

describe('the rules', () => {
  it('opens with the Descent, and the agreement is asserted rather than imported', () => {
    // Two decisions that agree for one measured reason — cards and multi-body boards need rungs
    // more than levels. A milestone moving one owes this test an argument, which is the point.
    expect(rules.unlockChapters).toBe(DESCENT_RULES.unlockChapters);
  });

  it('shares the card ladder, the leech clamp and the lump idiom with the Descent by reference', () => {
    expect(rules.ranks).toBe(DESCENT_RULES.ranks);
    expect(rules.maxLifeLeech).toBe(DESCENT_RULES.maxLifeLeech);
    expect(rules.lumpMultipliers).toBe(DESCENT_RULES.lumpMultipliers);
  });

  it('offers a real choice and pays a boss like a boss', () => {
    expect(rules.offer).toBeGreaterThanOrEqual(2);
    expect(rules.summons.perCamp).toBeGreaterThan(0);
    expect(rules.summons.bossMultiplier).toBeGreaterThan(1);
    expect(rules.summons.completion).toBeGreaterThan(rules.summons.perCamp);
  });
});

describe('the maps', () => {
  it('ships three, uniquely named, in a fixed unlock order', () => {
    expect(maps.length).toBe(3);
    expect(new Set(maps.map((map) => map.id)).size).toBe(maps.length);
    expect(new Set(maps.map((map) => map.name)).size).toBe(maps.length);
  });

  it('is structurally sound: one start, one exit, one boss gating it, every cell resolved', () => {
    for (const map of maps) {
      expect(expeditionMapIssues(map), map.id).toEqual([]);
    }
  });

  it('names camps with letters and chests with digits, uniquely within each map', () => {
    for (const map of maps) {
      for (const camp of map.camps) {
        expect(camp.cell, `${map.id} camp`).toMatch(/^[a-z]$/);
        expect(camp.name, `${map.id} camp ${camp.cell}`).not.toBe('');
      }
      for (const chest of map.chests) {
        expect(chest.cell, `${map.id} chest`).toMatch(/^[1-9]$/);
        expect(chest.name, `${map.id} chest ${chest.cell}`).not.toBe('');
      }
    }
  });

  it('affords a route to the exit and refuses the whole map — the puzzle, held mechanically', () => {
    // The roadmap named "no way to know it is solvable except by solving it" as this milestone's
    // whole risk. This is that solve, run on every shipped grid, every test pass.
    for (const map of maps) {
      const exit = cheapestStaminaTo(map, { kind: 'exit' });
      const total = map.camps.reduce((sum, camp) => sum + camp.stamina, 0);

      expect(exit, `${map.id} has no route to its exit`).not.toBeNull();
      expect(exit ?? Infinity, `${map.id} exit`).toBeLessThanOrEqual(map.stamina);
      expect(total, `${map.id} budget affords everything`).toBeGreaterThan(map.stamina);
    }
  });

  it('leaves real slack past the cheapest route, so completing is never a perfect line', () => {
    for (const map of maps) {
      const exit = cheapestStaminaTo(map, { kind: 'exit' }) ?? Infinity;

      expect(map.stamina - exit, map.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('puts every chest within the budget — a reward nobody can take is content that lies', () => {
    for (const map of maps) {
      for (const chest of map.chests) {
        const cost = cheapestStaminaTo(map, { kind: 'chest', cell: chest.cell });

        expect(cost, `${map.id} chest ${chest.cell}`).not.toBeNull();
        expect(cost ?? Infinity, `${map.id} chest ${chest.cell}`).toBeLessThanOrEqual(map.stamina);
      }
    }
  });

  it('pays something from every chest, in known currencies at positive sizes', () => {
    for (const map of maps) {
      for (const chest of map.chests) {
        const entries = Object.entries(chest.contents).filter(([, value]) => value !== undefined);

        expect(entries.length, `${map.id} chest ${chest.cell}`).toBeGreaterThan(0);
        for (const [key, value] of entries) {
          expect(['summons', 'emblems', 'gold', 'xp', 'essence'], `${map.id} ${key}`).toContain(
            key,
          );
          expect(value, `${map.id} chest ${chest.cell} ${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('prices every camp at a positive cost a budget can weigh', () => {
    for (const map of maps) {
      for (const camp of map.camps) {
        expect(camp.stamina, `${map.id} camp ${camp.cell}`).toBeGreaterThanOrEqual(1);
        expect(camp.stamina, `${map.id} camp ${camp.cell}`).toBeLessThanOrEqual(map.stamina / 2);
      }
    }
  });
});

describe('the boards', () => {
  it('fills both ranks within the party size', () => {
    for (const map of maps) {
      for (const camp of map.camps) {
        expect(camp.enemies.front.length, `${map.id} ${camp.cell} front`).toBeGreaterThan(0);
        expect(camp.enemies.front.length, `${map.id} ${camp.cell} front`).toBeLessThanOrEqual(2);
        expect(camp.enemies.back.length, `${map.id} ${camp.cell} back`).toBeLessThanOrEqual(3);
        expect(bodies(camp).length, `${map.id} ${camp.cell}`).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('mixes at least three factions on every board', () => {
    // The Descent pool's rule, inherited with a different argument: there is no lock here, so a
    // player *can* counter-pick — and a mono-faction board would turn the matchup matrix into the
    // puzzle's answer, which is a routing decision decided by a table instead of the map.
    for (const map of maps) {
      for (const camp of map.camps) {
        const factions = new Set(bodies(camp).map((enemy) => enemy.faction));

        expect(factions.size, `${map.id} ${camp.cell}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('spreads the mode across factions without leaning on one', () => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const map of maps) {
      for (const camp of map.camps) {
        for (const enemy of bodies(camp)) {
          counts.set(enemy.faction, (counts.get(enemy.faction) ?? 0) + 1);
          total++;
        }
      }
    }

    for (const faction of FACTION_IDS) {
      const share = (counts.get(faction) ?? 0) / total;

      expect(share, faction).toBeGreaterThan(0.04);
      expect(share, faction).toBeLessThan(0.25);
    }
  });

  it('never pairs a taunt with a healer', () => {
    for (const map of maps) {
      for (const camp of map.camps) {
        const ids = bodies(camp).map((enemy) => enemy.id);
        const taunts = ids.some((id) => TAUNTERS.has(id));
        const heals = ids.some((id) => HEALERS.has(id));

        expect(taunts && heals, `${map.id} ${camp.cell}`).toBe(false);
      }
    }
  });

  it('fields at most one ascended anchor, and only where the last map has earned one', () => {
    for (const map of maps) {
      for (const camp of map.camps) {
        const anchors = bodies(camp).filter((enemy) => enemy.tier === 'ascended');

        expect(anchors.length, `${map.id} ${camp.cell}`).toBeLessThanOrEqual(1);
        if (anchors.length > 0) {
          expect(map.id, `${map.id} ${camp.cell} carries an ascended anchor`).toBe(
            maps[maps.length - 1].id,
          );
          expect(camp.levelOffset, `${map.id} ${camp.cell}`).toBeGreaterThanOrEqual(4);
        }
      }
    }
  });

  it('borrows no chapter final, no lieutenant and no Unmade', () => {
    const RESERVED = new Set([
      'fenlord',
      'pale-warden',
      'first-cinder',
      'ashfall-sovereign',
      'chainsworn',
      'hollow-seraph',
      'the-cairn-king',
      'the-withered-crown',
      'the-anvil-crowned',
      'the-everwound',
      'the-gravewright',
      'the-longshadow',
      'the-grudgekeeper',
      'the-redmaw',
      'unmade',
    ]);

    for (const map of maps) {
      for (const camp of map.camps) {
        for (const enemy of bodies(camp)) {
          expect(RESERVED.has(enemy.id), `${map.id} ${camp.cell} fields ${enemy.id}`).toBe(false);
        }
      }
    }
  });

  it('runs each map’s boss hottest, and each map hotter than the one before', () => {
    let previousBoss = -Infinity;
    for (const map of maps) {
      const boss = map.camps.find((camp) => camp.boss);
      const rest = map.camps.filter((camp) => !camp.boss);
      const hottest = Math.max(...rest.map((camp) => camp.levelOffset));

      expect(boss, map.id).toBeDefined();
      expect(boss?.levelOffset ?? -Infinity, map.id).toBeGreaterThan(hottest);
      expect(boss?.levelOffset ?? -Infinity, map.id).toBeGreaterThan(previousBoss);
      previousBoss = boss?.levelOffset ?? -Infinity;
    }
  });

  it('keeps every offset inside the band the Descent tuned', () => {
    // The Descent measured −8..+12 as the band a carried, locked crew can fight at anchor depth;
    // this mode picks its crew freely and retries freely, so the same band is conservative.
    for (const map of maps) {
      for (const camp of map.camps) {
        expect(camp.levelOffset, `${map.id} ${camp.cell}`).toBeGreaterThanOrEqual(-14);
        expect(camp.levelOffset, `${map.id} ${camp.cell}`).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe('the finite pool', () => {
  it('bounds the mode’s whole crystal purse to the order of one chapter’s award', () => {
    // ⚠️ Every crystal here pays once, ever — that is the entire economy argument for the mode, so
    // the *sum* is the number worth guarding. A fourth map fails this on purpose: growing the pool
    // is fine, and it should be a decision with this number in front of it.
    let pool = 0;
    for (const map of maps) {
      for (const camp of map.camps) {
        pool += rules.summons.perCamp * (camp.boss ? rules.summons.bossMultiplier : 1);
      }
      for (const chest of map.chests) {
        pool += chest.contents.summons ?? 0;
      }
      pool += rules.summons.completion;
    }

    expect(pool).toBeGreaterThan(5_000);
    expect(pool).toBeLessThan(15_000);
  });

  it('bounds the emblem purse to the order of two chapter tracks', () => {
    let pool = 0;
    for (const map of maps) {
      for (const chest of map.chests) {
        pool += chest.contents.emblems ?? 0;
      }
      pool += rules.completionEmblems;
    }

    expect(pool).toBeGreaterThan(50);
    expect(pool).toBeLessThan(300);
  });
});

describe('the wiring Expeditions need to be reachable at all', () => {
  it('ships exactly one expedition activity, with no authored faction', () => {
    const rows = activities.filter((entry) => entry.kind === 'expedition');

    expect(rows.length).toBe(1);
    // No lock at all — `null`, not a faction and not a drawn set. The crew editor reads `lockOf`,
    // which turns an absent faction into "anybody may stand", and the card offer is what adapts to
    // the crew rather than the crew to a lock.
    expect(rows[0].faction).toBeUndefined();
    expect(rows[0].id).toBe('expedition');
  });

  it('asks no quest of a counter that stops moving', () => {
    // Three maps is three completions, ever. `core/quests.ts` forbids a quest a player cannot make
    // move today, and once the third map falls nothing here moves again — so the mode ships no
    // quest, and this asserts nobody adds one against it later without meeting that rule head-on.
    for (const quest of QUESTS) {
      expect(quest.counter, quest.id).not.toBe('expeditionsCompleted');
    }
  });
});
