// @vitest-environment node
// The towers' *shape*: floors, ids, the level line, the counter-faction bias, the payout arithmetic
// and the wiring that gives a tower a crew and an achievement track. Fast, structural, and derived
// from the content rather than retyped out of it.
//
// **The simulated sweep lives in [`towers.balance.ts`](./towers.balance.ts)**, in the separate
// balance project `AGENTS.md` describes, for the reason the ladder's does: a hundred floors across
// several parties at forty seeds is thousands of battles, and the rule is to move a sweep rather
// than shrink it.
import { describe, expect, it } from 'vitest';
import {
  type AchievementTrackData,
  type ActivityData,
  BACK_ROW_SIZE,
  type ChapterCurveData,
  type ChapterData,
  FRONT_ROW_SIZE,
  floorKindAt,
  floorLevel,
  floorSummons,
  matchedStageIndex,
  PARTY_SIZE,
  resolveLadder,
  resolveTower,
  type StageData,
  stagePayout,
  type StageRewardCurveData,
  type TowerData,
  type TowerRulesData,
} from '../core';
import { ACHIEVEMENTS } from './achievements';
import { ACTIVITIES } from './activities';
import { FACTIONS } from './ascension';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';
import { FACTION_MATCHUPS } from './combat';
import { ENEMIES } from './enemies';
import { LEVEL_CURVE } from './levels';
import { TOWER_RULES, TOWERS } from './towers';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so nothing
 * inside those files can reference `TowerData`. Assigning them to a typed local here is what turns a
 * malformed floor into a compile error instead of a runtime surprise, and it is the only thing that
 * makes the `towerFloors` tracks below prove they named a tower at all.
 */
const towers: readonly TowerData[] = TOWERS;
const rules: TowerRulesData = TOWER_RULES;
const activities: readonly ActivityData[] = ACTIVITIES;
const tracks: readonly AchievementTrackData[] = ACHIEVEMENTS;

/** The campaign, resolved exactly as `ui/content.ts` resolves it — what a tower's payout matches. */
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);
const campaignLevels: readonly number[] = stages.map((stage) => stage.level);

const ENEMY_FACTIONS = new Map<string, string>(
  ENEMIES.map((enemy) => [enemy.id, enemy.faction as string]),
);

/** Who beats `faction` by the matchup matrix — the factions a tower is meant to field against it. */
function countersOf(faction: string): readonly string[] {
  return FACTION_MATCHUPS.filter(
    (edge) => edge.defender === faction && edge.attacker !== faction,
  ).map((edge) => edge.attacker as string);
}

/** Every enemy slot in a tower, in climbing order. */
function slotsOf(tower: TowerData): readonly string[] {
  return tower.floors.flatMap((floor) => [
    ...floor.enemies.front.map((enemy) => enemy.id),
    ...floor.enemies.back.map((enemy) => enemy.id),
  ]);
}

/** What one full climb of one tower pays in crystals, floors plus its own achievement tracks. */
function crystalsPerTower(tower: TowerData): number {
  const floors = Array.from({ length: rules.floors }, (_, offset) =>
    floorSummons(rules, offset + 1),
  ).reduce((total, value) => total + value, 0);
  const awards = tracks
    .filter((track) => track.counter === 'towerFloors' && track.tower === tower.id)
    .reduce(
      (total, track) =>
        total + Math.floor(rules.floors / track.every) * (track.reward.summons ?? 0),
      0,
    );
  return floors + awards;
}

/** A tower's two achievement tracks, floor track first. */
function tracksFor(tower: TowerData): readonly AchievementTrackData[] {
  return tracks.filter((track) => track.counter === 'towerFloors' && track.tower === tower.id);
}

/**
 * What climbing the whole shipped campaign pays in crystals: first clears plus its own tracks.
 *
 * ⚠️ **Both halves, because they are one decision.** `chapters.ts` flattened the first-clear payout
 * and `achievements.ts` paid the difference back on the tracks — see either file — so a comparison
 * against the first clears alone measures half of a redistribution and reads the campaign as five
 * times poorer than it is.
 */
function campaignCrystals(): number {
  const clears = stages
    .map((stage, index) => stagePayout(rewards, index + 1, stage.kind).firstClearSummons)
    .reduce((total, value) => total + value, 0);
  const awards = tracks.reduce((total, track) => {
    if (track.counter === 'towerFloors') {
      return total;
    }
    const counter = track.counter === 'clearedChapters' ? chapters.length : stages.length;
    return total + Math.floor(counter / track.every) * (track.reward.summons ?? 0);
  }, 0);
  return clears + awards;
}

describe('tower rules', () => {
  it('ships a hundred floors climbing to a level the campaign also reaches', () => {
    // ⚠️ **Inside the campaign's range, deliberately.** A tower charges for roster breadth, not for
    // investment, so its top floor has to be a fight the campaign asks for well before its own end.
    // Derived from the shipped ladder rather than restated, so extending the campaign cannot
    // silently turn this into a claim about content that no longer exists.
    const campaignTop = campaignLevels[campaignLevels.length - 1];

    expect(rules.floors).toBeGreaterThan(0);
    expect(rules.baseLevel).toBe(1);
    expect(rules.topLevel).toBeGreaterThan(rules.baseLevel);
    expect(rules.topLevel).toBeLessThan(campaignTop);
  });

  it('tops out at exactly a rarity cap, so the reference party is derived rather than chosen', () => {
    // The balance target is five of the tower's faction at `rare-plus`, and `rare-plus` caps at 60.
    // If `topLevel` ever leaves the set of caps the sweep's party stops tracking the content, and
    // this is the test that says so rather than the sweep quietly measuring the wrong five.
    expect(LEVEL_CURVE.caps as readonly number[]).toContain(rules.topLevel);
  });

  it('reuses the mini-boss interval the campaign already taught', () => {
    expect(rules.miniBossEvery).toBe(chapterCurve.miniBossEvery);
  });

  it('draws a level line that rises, starts at the bottom and ends at the top', () => {
    expect(floorLevel(rules, 1)).toBe(rules.baseLevel);
    expect(floorLevel(rules, rules.floors)).toBe(rules.topLevel);

    let previous = 0;
    for (let floor = 1; floor <= rules.floors; floor++) {
      const level = floorLevel(rules, floor);

      expect(level, `floor ${floor}`).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });
});

describe('tower content', () => {
  it('ships at least one tower, with unique ids and names', () => {
    expect(towers.length).toBeGreaterThan(0);
    expect(new Set(towers.map((tower) => tower.id)).size).toBe(towers.length);
    expect(new Set(towers.map((tower) => tower.name)).size).toBe(towers.length);
  });

  it('authors every tower at exactly the height the rules say', () => {
    // The formula and the content are two statements of one fact. A tower authored at ninety-nine
    // floors is a failing test rather than a boss that quietly lands on the wrong floor and a
    // completion award nothing ever reaches.
    for (const tower of towers) {
      expect(tower.floors.length, tower.id).toBe(rules.floors);
    }
  });

  it('gives every floor a unique id, a name, and somebody to fight', () => {
    for (const tower of towers) {
      const ids = tower.floors.map((floor) => floor.id);

      expect(new Set(ids).size, tower.id).toBe(ids.length);
      for (const floor of tower.floors) {
        expect(floor.name.length, floor.id).toBeGreaterThan(0);
        expect(floor.enemies.front.length + floor.enemies.back.length, floor.id).toBeGreaterThan(0);
      }
    }
  });

  it('keeps every floor id clear of the campaign', () => {
    // Battle RNG is seeded on the stage id, and `BattleService` looks a stage's kind up by it. A
    // floor sharing an id with a campaign stage would make both wrong in ways nothing else notices.
    const campaign = new Set(stages.map((stage) => stage.id));

    for (const tower of towers) {
      for (const floor of tower.floors) {
        expect(campaign.has(floor.id), floor.id).toBe(false);
      }
    }
  });

  it('never authors a rank wider than the board', () => {
    for (const tower of towers) {
      for (const floor of tower.floors) {
        expect(floor.enemies.front.length, floor.id).toBeLessThanOrEqual(FRONT_ROW_SIZE);
        expect(floor.enemies.back.length, floor.id).toBeLessThanOrEqual(BACK_ROW_SIZE);
      }
    }
  });

  it('names only enemies this build ships', () => {
    for (const tower of towers) {
      for (const id of slotsOf(tower)) {
        expect(ENEMY_FACTIONS.has(id), `${tower.id} fields ${id}`).toBe(true);
      }
    }
  });

  it('names a faction that exists and one a crew can actually be built from', () => {
    // ⚠️ The failure milestone 4 rejected role-locked formation slots for: a lock the roster cannot
    // satisfy is a ladder with no legal party. Derived from the shipped roster, so narrowing a
    // faction's bench is a failing test here rather than an unfinishable tower.
    const factions = new Set(FACTIONS.map((faction) => faction.id as string));

    for (const tower of towers) {
      const bench = CHARACTERS.filter((character) => character.faction === tower.faction).length;

      expect(factions.has(tower.faction), tower.id).toBe(true);
      expect(bench, `${tower.id} bench`).toBeGreaterThanOrEqual(PARTY_SIZE);
    }
  });

  it('opens early enough to be somewhere a walled player can go', () => {
    // A tower exists so a run stuck on the campaign has somewhere to send an unlucky pull, so an
    // unlock deep in the ladder would defeat the point. Bounded against the shipped ladder rather
    // than against a literal.
    for (const tower of towers) {
      expect(tower.unlockClears, tower.id).toBeGreaterThan(0);
      expect(tower.unlockClears, tower.id).toBeLessThan(stages.length * 0.2);
    }
  });

  it('puts a mini-boss on every tenth floor and the boss on the roof', () => {
    for (const tower of towers) {
      const kinds = tower.floors.map((_, offset) => floorKindAt(rules, offset + 1));

      expect(kinds[rules.floors - 1]).toBe('boss');
      expect(kinds.filter((kind) => kind === 'boss')).toHaveLength(1);
      expect(kinds.filter((kind) => kind === 'mini-boss')).toHaveLength(
        Math.floor((rules.floors - 1) / rules.miniBossEvery),
      );
    }
  });

  it('numbers the ordinary floors and names the ones a climb is remembered by', () => {
    // A tower is one place with a hundred floors, where a chapter is fifty places — so an ordinary
    // floor is its number and the punctuation carries a name. Asserted so a later band cannot
    // quietly start naming all of them or stop naming any.
    for (const tower of towers) {
      for (const [offset, floor] of tower.floors.entries()) {
        const named = floor.name.includes('—');

        expect(named, floor.id).toBe(floorKindAt(rules, offset + 1) !== 'normal');
        expect(floor.name.startsWith(`Floor ${offset + 1}`), floor.id).toBe(true);
      }
    }
  });
});

describe('the counter-faction bias', () => {
  it('leans on a faction that actually counters the tower', () => {
    // Derived from the matchup matrix rather than named here, so retuning the cycle cannot leave a
    // tower biased toward a faction that no longer beats it.
    for (const tower of towers) {
      const slots = slotsOf(tower);
      const share = (faction: string): number =>
        slots.filter((id) => ENEMY_FACTIONS.get(id) === faction).length / slots.length;
      const leader = [...new Set(slots.map((id) => ENEMY_FACTIONS.get(id) ?? ''))].reduce(
        (best, faction) => (share(faction) > share(best) ? faction : best),
      );

      expect(countersOf(tower.faction), `${tower.id} leans on ${leader}`).toContain(leader);
      // ⚠️ **A lean, not a mirror.** Roughly half: enough that the tower reads as the answer to its
      // own faction, and far enough from all of it that the matchup matrix stays live in both
      // directions. A tower fielding one faction would switch the matrix off entirely.
      expect(share(leader), `${tower.id} ${leader} share`).toBeGreaterThan(0.35);
      expect(share(leader), `${tower.id} ${leader} share`).toBeLessThan(0.65);
    }
  });

  it('still draws on every faction, so the crew meets fights it is favoured in', () => {
    for (const tower of towers) {
      const fielded = new Set(slotsOf(tower).map((id) => ENEMY_FACTIONS.get(id)));

      expect(fielded.size, tower.id).toBe(FACTIONS.length);
    }
  });

  it('never leans on a faction whose blocks this build barely has', () => {
    // The reason the Human tower shipped first: its counter already has five archetypes. A tower
    // biased toward a faction with one block would be the same fight a hundred times.
    for (const tower of towers) {
      const counters = new Set(countersOf(tower.faction));
      const blocks = ENEMIES.filter((enemy) => counters.has(enemy.faction as string)).length;

      expect(blocks, `${tower.id} counter blocks`).toBeGreaterThanOrEqual(4);
    }
  });
});

describe('what a tower pays', () => {
  /** A floor's lump, read off the campaign at the stage that fights at the same level. */
  const lumpAt = (level: number) =>
    stagePayout(rewards, matchedStageIndex(campaignLevels, level)).reward;

  it('matches the campaign by enemy level rather than by floor number', () => {
    // ⚠️ **The difference is large.** The top floor is level 60 where campaign stage 100 is level 85,
    // so index-matching would pay the top of the ladder's lump for a fight two thirds as hard.
    const byLevel = matchedStageIndex(campaignLevels, floorLevel(rules, rules.floors));

    expect(byLevel).toBeLessThan(rules.floors);
    expect(Number(lumpAt(rules.topLevel).gold ?? 0)).toBeLessThan(
      Number(stagePayout(rewards, rules.floors).reward.gold ?? 0),
    );
  });

  it('pays a lump that rises with the climb, and never a rate', () => {
    for (const tower of towers) {
      let previous = 0;

      for (const floor of resolveTower(tower, rules, lumpAt)) {
        const gold = Number(floor.reward.gold ?? 0);

        expect(gold, floor.id).toBeGreaterThanOrEqual(previous);
        previous = gold;
        // ⚠️ Either of these populated would be a tower quietly acquiring a permanent income raise
        // and a crystal payout routed through the campaign's first-clear path. See `resolveFloor`.
        expect(floor.rates, floor.id).toEqual({});
        expect(floor.firstClearSummons, floor.id).toBe(0);
      }
    }
  });

  it('pays less per floor than the campaign pays per stage', () => {
    // ⚠️ **The number that keeps the campaign the spine.** At parity the seven towers would pay
    // about 3.9× the ladder's own first clears, which makes climbing look pointless beside optional
    // content.
    expect(rules.floorSummons.base).toBeLessThan(rewards.firstClearSummons.base);
  });

  it('makes seven towers a multiple of the campaign rather than a replacement for it', () => {
    // Measured over the shipped content, both halves on both sides: floors and their tracks against
    // first clears and theirs. Seven towers is roughly 3× the critical path for 7× the content, on
    // ladders gated behind roster depth. The seven is `FACTIONS.length` rather than a literal,
    // because that is what "one tower per faction" means and 15c is what fills it in.
    const seven = crystalsPerTower(towers[0]) * FACTIONS.length;
    const campaign = campaignCrystals();
    const note = `seven towers ${seven} against a campaign of ${campaign}`;

    expect(seven / campaign, note).toBeGreaterThan(2);
    expect(seven / campaign, note).toBeLessThan(4);
  });
});

describe('the wiring a tower needs to be reachable at all', () => {
  it('gives every tower an activity row with the same id, name and lock', () => {
    // ⚠️ Two files, one fact. Without the row a tower has no crew and no way in; with a mismatched
    // `faction` the editor's pool and the tower's enemies would disagree about who it is for.
    for (const tower of towers) {
      const activity = activities.find((entry) => entry.id === tower.id);

      expect(activity, tower.id).toBeDefined();
      expect(activity?.kind, tower.id).toBe('tower');
      expect(activity?.faction, tower.id).toBe(tower.faction);
      expect(activity?.name, tower.id).toBe(tower.name);
    }
  });

  it('leaves no activity claiming to be a tower this build does not ship', () => {
    const shipped = new Set(towers.map((tower) => tower.id));

    for (const activity of activities.filter((entry) => entry.kind === 'tower')) {
      expect(shipped.has(activity.id), activity.id).toBe(true);
    }
  });

  it('locks every tower and leaves the campaign unlocked', () => {
    for (const activity of activities) {
      expect(activity.faction === undefined, `${activity.id} lock`).toBe(
        activity.kind === 'campaign',
      );
    }
  });

  it('gives every tower a floor track and a completion track, and nothing extra', () => {
    for (const tower of towers) {
      expect(tracksFor(tower), tower.id).toHaveLength(2);
    }

    expect(tracks.filter((track) => track.counter === 'towerFloors')).toHaveLength(
      towers.length * 2,
    );
  });

  it('sizes the completion track at exactly the height of its tower', () => {
    // ⚠️ `data/` holds no logic, so the height is restated on the track — which makes this the only
    // thing standing between a completion award that pays twice and one that never pays at all.
    for (const tower of towers) {
      const intervals = tracksFor(tower)
        .map((track) => track.every)
        .sort((a, b) => a - b);

      expect(intervals[intervals.length - 1], tower.id).toBe(rules.floors);
      // And the other one is the rhythm of the climb rather than a second completion award.
      expect(intervals[0], tower.id).toBeLessThan(rules.floors);
    }
  });

  it('pays every tower the same, so the banner cannot pick which ladder is worth climbing', () => {
    const byInterval = new Map<number, Set<string>>();
    for (const track of tracks) {
      if (track.counter !== 'towerFloors') {
        continue;
      }
      const seen = byInterval.get(track.every) ?? new Set<string>();
      seen.add(JSON.stringify(track.reward));
      byInterval.set(track.every, seen);
    }

    for (const [every, paid] of byInterval) {
      expect(paid.size, `interval ${every}`).toBe(1);
    }
  });

  it('makes topping a tower worth exactly what finishing a chapter is worth', () => {
    // A deliberate tie rather than a coincidence: a hundred floors and a fifty-stage chapter are
    // comparable events, so they pay the same. `achievements.spec.ts` narrows its own "largest
    // payout" claim to the ladder for this reason, and this is the other half of that decision.
    const chapterAward =
      tracks.find((track) => track.counter === 'clearedChapters')?.reward.summons ?? 0;

    for (const tower of towers) {
      const completion = tracksFor(tower).find((track) => track.every === rules.floors);

      expect(completion?.reward.summons ?? 0, tower.id).toBe(chapterAward);
    }
  });

  it('keeps a tower track off the counters the campaign owns', () => {
    // ⚠️ **A tower clear may never feed `clearedStages`** — it drives the idle crystal rate, which
    // `banners.spec.ts` bounds at about ×3 the base where the shipped hundred stages already reach
    // ×2. This is the authoring half of that rule: a track named for a tower and counted in stages
    // would pay for campaign progress under a tower's name.
    for (const track of tracks) {
      expect(track.counter === 'towerFloors', track.id).toBe(track.id.startsWith('tower-'));
    }
  });
});
