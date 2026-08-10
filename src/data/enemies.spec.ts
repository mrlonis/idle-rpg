// @vitest-environment node
// The enemy archetypes, checked against **every ladder this build ships** rather than against one
// of them. That scope is the whole reason this file exists separately from `chapters.spec.ts` and
// `towers.spec.ts`: each of those is about one kind of content, and an archetype belongs to the
// game rather than to a chapter or a tower.
import { describe, expect, it } from 'vitest';
import {
  type ChapterCurveData,
  type ChapterData,
  type EnemyData,
  resolveLadder,
  type StageData,
  type StageRewardCurveData,
  type TowerData,
} from '../core';
import { FACTIONS } from './ascension';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { ENEMIES } from './enemies';
import { TOWERS } from './towers';

/**
 * Conformance through typed locals, because `data/` may not import `core/`.
 *
 * `EnemyData` is what the simulation takes, so this assignment is what turns a malformed stat
 * block or a kit pointing at nothing into a compile error.
 */
const enemies: readonly EnemyData[] = ENEMIES;
const towers: readonly TowerData[] = TOWERS;
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);

/** Every archetype id fielded anywhere a player can fight: the campaign and every tower. */
const fielded = new Set<string>([
  ...stages.flatMap((stage) => [...stage.enemies.front, ...stage.enemies.back]).map((e) => e.id),
  ...towers
    .flatMap((tower) => tower.floors)
    .flatMap((floor) => [...floor.enemies.front, ...floor.enemies.back])
    .map((e) => e.id),
]);

describe('enemy archetypes', () => {
  it('gives every archetype a unique id and name', () => {
    expect(new Set(enemies.map((enemy) => enemy.id)).size).toBe(enemies.length);
    expect(new Set(enemies.map((enemy) => enemy.name)).size).toBe(enemies.length);
  });

  it('fields every archetype it ships somewhere a player can reach', () => {
    // ⚠️ **Widened from the campaign to every ladder in milestone 15c, not relaxed.** An archetype
    // nobody ever meets is a stat block with a comment attached: each one names a question, and a
    // question that is never asked is not content. Eighteen of these are authored for the towers
    // and meet nobody on the campaign — which is a tower doing its job, not an orphan.
    const orphans = enemies.map((enemy) => enemy.id).filter((id) => !fielded.has(id));

    expect(orphans).toEqual([]);
  });

  it('gives every faction the depth a tower biased toward it needs', () => {
    // ⚠️ **The constraint that made milestone 15c eighteen archetypes rather than six.** A tower
    // leans toward the faction that counters the one it admits, so a counter with one block is a
    // hundred floors of the same fight — which is exactly what Elves (1) and Angels (1) would have
    // been for the Undead and Demon towers. Derived from `FACTIONS` so a new faction fails here
    // rather than shipping a tower nothing can be built out of.
    for (const faction of FACTIONS) {
      const blocks = enemies.filter((enemy) => enemy.faction === faction.id);

      expect(blocks.length, `${faction.id} archetypes`).toBeGreaterThanOrEqual(4);
    }
  });

  it('gives every faction a body for the low floors and an anchor for the high ones', () => {
    // A tower runs from enemy level 1 to 60, so its lead faction has to supply both ends. A faction
    // of nothing but legendaries makes floor 1 a wall; a faction with no `ascended` block cannot
    // anchor a top band without borrowing from a faction the bias does not point at — which is the
    // constraint 15b recorded when the Undead had no ascended block at all.
    for (const faction of FACTIONS) {
      const tiers = new Set(
        enemies.filter((enemy) => enemy.faction === faction.id).map((enemy) => enemy.tier),
      );

      expect([...tiers].sort(), `${faction.id} tiers`).toEqual(['ascended', 'common', 'legendary']);
    }
  });

  it('never carries a taunt as a passive', () => {
    // ⚠️ **A permanent taunt is the one shape of this mechanic that can make an encounter
    // unanswerable.** Cast, it runs 45 ticks against a 60-tick cooldown and a single-target party
    // gets a window at whatever is standing behind the wall; as an `opening` it would hold that
    // door shut for the whole ninety seconds, and a party with no row attack would be fighting a
    // healer it is structurally unable to reach. The other three milestone-17 statuses are
    // deliberately fine here — thorns and a link both need to be true from the first tick.
    for (const enemy of enemies) {
      for (const status of enemy.opening ?? []) {
        expect(status.kind, `${enemy.id}/${status.id}`).not.toBe('taunt');
      }
    }
  });

  it('never lets a tower anchor outgrow the heaviest block the campaign already fields', () => {
    // ⚠️ **15b measured that a tower's difficulty is almost entirely its front rank's weight, and
    // that the weight is sharply non-linear** — pairing the two heaviest blocks in the game took the
    // reference crew from a clean clear to single digits. So a new `ascended` block is bounded by
    // the ones the campaign already fields rather than by an opinion: `UNMADE` is the ceiling and
    // nothing 15c authored may reach it.
    const ascended = enemies.filter((enemy) => enemy.tier === 'ascended');
    const heaviest = ascended.reduce((most, enemy) =>
      Number(enemy.stats.hp) > Number(most.stats.hp) ? enemy : most,
    );

    expect(heaviest.id).toBe('unmade');
    for (const enemy of ascended) {
      expect(Number(enemy.stats.atk), `${enemy.id} atk`).toBeLessThanOrEqual(
        Number(heaviest.stats.atk),
      );
    }
  });
});
