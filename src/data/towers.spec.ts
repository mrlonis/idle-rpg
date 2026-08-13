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
import { AUTO_BATTLE_UNLOCK_CHAPTERS, CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
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

/**
 * Whether **everything** beats this faction, which is true of exactly one of the seven.
 *
 * Monsters trade defence for reach: they hit every faction for five percent more and take it back
 * from all four mortal factions, from both celestials, and from each other. So countering a Monster
 * five is not a job for one faction — it is what the whole matrix does — and the Monster Tower is
 * authored as an even spread rather than as a lean. That is the *same* decision every other tower
 * makes (field what counters the crew), not an exception to it, which is why this is derived off
 * the matrix rather than being a named special case for `monster`.
 */
function evenlyCountered(faction: string): boolean {
  return new Set(countersOf(faction)).size === FACTIONS.length - 1;
}

/** What share of `tower`'s slots each faction takes. */
function sharesIn(tower: TowerData): ReadonlyMap<string, number> {
  const slots = slotsOf(tower);
  const shares = new Map<string, number>();
  for (const id of slots) {
    const faction = ENEMY_FACTIONS.get(id) ?? '';
    shares.set(faction, (shares.get(faction) ?? 0) + 1 / slots.length);
  }
  return shares;
}

/** The faction taking the most of `tower`'s slots. */
function leaderOf(tower: TowerData): string {
  return [...sharesIn(tower)].reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0];
}

/** Every enemy slot in a tower, in climbing order. */
function slotsOf(tower: TowerData): readonly string[] {
  return tower.floors.flatMap((floor) => [
    ...floor.enemies.front.map((enemy) => enemy.id),
    ...floor.enemies.back.map((enemy) => enemy.id),
  ]);
}

/**
 * What one full climb of one tower pays in crystals, floors plus its own achievement tracks.
 *
 * ⚠️ **Measured over the floors the tower actually authors, not the height the rules state.** Those
 * are the same number now that all seven are the full height, and they differed for every session of
 * 21e–21k while six of them were not — counting the rules' height would have measured a projection
 * rather than the game, which is the exact mistake 15c fixed when it stopped multiplying one tower's
 * payout by `FACTIONS.length`.
 */
function crystalsPerTower(tower: TowerData): number {
  const height = tower.floors.length;
  const floors = Array.from({ length: height }, (_, offset) =>
    floorSummons(rules, offset + 1),
  ).reduce((total, value) => total + value, 0);
  const awards = tracks
    .filter((track) => track.counter === 'towerFloors' && track.tower === tower.id)
    .reduce(
      (total, track) => total + Math.floor(height / track.every) * (track.reward.summons ?? 0),
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
  // ⚠️ **Only the tracks measured against campaign progress**, named rather than inferred from
  // "not a tower track". That inference was what this did, and milestone 16 broke it: the two
  // signature tracks are neither campaign nor tower, and being read as campaign ones meant their
  // interval was measured against `stages.length` — inventing 85,000 crystals the ladder does not
  // pay and taking this ratio from 3.2 to 1.4. A track counting something else entirely is a third
  // category, and the honest thing is for this to say which two it means.
  const awards = tracks.reduce((total, track) => {
    if (track.counter !== 'clearedStages' && track.counter !== 'clearedChapters') {
      return total;
    }
    const counter = track.counter === 'clearedChapters' ? chapters.length : stages.length;
    return total + Math.floor(counter / track.every) * (track.reward.summons ?? 0);
  }, 0);
  return clears + awards;
}

/**
 * The unit a tower's completion award is paid per, and the unit its tie with a chapter is stated in.
 *
 * A hundred floors. ⚠️ **Written down rather than derived, because there is nothing honest to derive
 * it from** — reading it off the track it checks would make the assertions circular, and reading it
 * off `rules.floors` would restate the bug it exists to catch. What it buys instead is that the
 * interval on the track and the height of the tower can no longer drift apart silently: the tower
 * has to be a whole number of these, and each one has to be worth exactly one chapter.
 */
const TOWER_UNIT = 100;

describe('tower rules', () => {
  it('ships a ladder of floors climbing to a level the campaign also reaches', () => {
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

  it('closes above the cap of the rung it asks for, by a margin', () => {
    // ⚠️ **This replaced "`topLevel` is exactly a rarity cap" in 21e, and the older assertion looked
    // stricter while measuring nothing.** Its argument was that a cap match makes the sweep's party
    // derived rather than chosen — true, and still true here, since the rung below is just as
    // derived as the rung on. What it missed is that **the enemy side has no ascension rungs at
    // all.** A rung is worth ×1.6, so a party standing at parity with the content is only a fair
    // test at the first rung above `rare`. At `elite-plus` — three rungs, ×4.096 — a level-140 five
    // takes the heaviest board this game can author (five `ascended` blocks with an Unmade in front)
    // at 100% with all five alive in nine seconds, and no line-up fixes that.
    //
    // So a tower closes above the cap of the rung it asks for, which is the campaign's own margin
    // rule arriving here — see the level-line note in `docs/milestones.md` for chapters 5 onward.
    // Both bounds are derived from the caps: there must be a rung below the roof for a crew to stand
    // on, and the roof must not reach the rung above it, which would be content asking for an
    // investment it never rewards.
    const caps = LEVEL_CURVE.caps as readonly number[];
    const below = caps.filter((cap) => cap < rules.topLevel);
    const above = caps.filter((cap) => cap >= rules.topLevel);

    expect(below.length, 'a rung for the top band to stand on').toBeGreaterThan(0);
    expect(above.length, 'a rung the roof does not reach').toBeGreaterThan(0);

    const margin = rules.topLevel - below[below.length - 1];

    expect(margin, `margin ${margin} over the crew's cap`).toBeGreaterThan(0);
    expect(margin, `margin ${margin} over the crew's cap`).toBeLessThan(
      above[0] - below[below.length - 1],
    );
  });

  it('halves into two bands, each with a rung a crew can actually be built to', () => {
    // `towers.balance.ts` splits the sweep at the halfway floor so the shipped hundred keeps being
    // measured by a party that can lose to it. That split only means anything if the halfway floor's
    // level *is* a cap — otherwise band 1's crew stops tracking its own content, which is the half
    // of the old assertion worth keeping.
    const half = floorLevel(rules, Math.floor(rules.floors / 2));

    expect(LEVEL_CURVE.caps as readonly number[]).toContain(half);
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
  it('ships exactly one tower per faction, with unique ids and names', () => {
    // ⚠️ **"One per faction" is what a tower *is*** — the whole design is demand for five invested
    // characters of every faction, so a build shipping six towers has a faction whose bench has
    // nowhere to go, and one shipping eight has a tower two factions can crew. Derived from
    // `FACTIONS` rather than restated, so adding a faction fails here rather than shipping a roster
    // with no ladder behind it.
    expect(towers.length).toBe(FACTIONS.length);
    expect(new Set(towers.map((tower) => tower.faction)).size).toBe(towers.length);
    expect(new Set(towers.map((tower) => tower.id)).size).toBe(towers.length);
    expect(new Set(towers.map((tower) => tower.name)).size).toBe(towers.length);
  });

  it('authors every tower at exactly the height the rules say', () => {
    // The formula and the content are two statements of one fact. A tower authored at ninety-nine
    // floors is a failing test rather than a boss that quietly lands on the wrong floor and a
    // completion award nothing ever reaches.
    //
    // ⚠️ **This carried a `PENDING` literal through milestones 21e–21k and 21k deleted it**, which
    // is the whole reason it was a hand-maintained list of names rather than a filter. `TOWER_RULES`
    // is one rule for all seven, so the height doubled in a single session while the floors moved in
    // seven — and a filter reading "either the full height or half of it" would have passed forever
    // and never noticed a tower nobody went back for. All seven are now the full height and this is
    // a plain equality again.
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

  it('opens at the auto-battle unlock, which is the end of chapter 1', () => {
    // Two decisions that agree rather than one fact stated twice — each tower authors its own
    // `unlockClears`, and this is what holds the agreement the tower files promise. Derived from
    // the shipped chapters rather than retyped, so re-cutting chapter 1 fires here instead of
    // silently splitting the two unlocks apart.
    const autoBattleClears = chapters
      .slice(0, AUTO_BATTLE_UNLOCK_CHAPTERS)
      .reduce((total, chapter) => total + chapter.stages.length, 0);

    for (const tower of towers) {
      expect(tower.unlockClears, tower.id).toBe(autoBattleClears);
    }
  });

  it('puts a mini-boss on every tenth floor and the boss on the roof', () => {
    for (const tower of towers) {
      const kinds = tower.floors.map((_, offset) => floorKindAt(rules, offset + 1));

      expect(kinds[rules.floors - 1], tower.id).toBe('boss');
      expect(
        kinds.filter((kind) => kind === 'boss'),
        tower.id,
      ).toHaveLength(1);
      expect(
        kinds.filter((kind) => kind === 'mini-boss'),
        tower.id,
      ).toHaveLength(Math.floor((rules.floors - 1) / rules.miniBossEvery));
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
    for (const tower of towers.filter((entry) => !evenlyCountered(entry.faction))) {
      const leader = leaderOf(tower);
      const share = sharesIn(tower).get(leader) ?? 0;

      expect(countersOf(tower.faction), `${tower.id} leans on ${leader}`).toContain(leader);
      // ⚠️ **A lean, not a mirror.** Roughly half: enough that the tower reads as the answer to its
      // own faction, and far enough from all of it that the matchup matrix stays live in both
      // directions. A tower fielding one faction would switch the matrix off entirely.
      expect(share, `${tower.id} ${leader} share`).toBeGreaterThan(0.35);
      expect(share, `${tower.id} ${leader} share`).toBeLessThan(0.65);
    }
  });

  it('spreads the one tower everything counters evenly instead of leaning', () => {
    // ⚠️ **The Monster Tower, and it is the rule rather than an exception to it.** Every faction
    // counters Monsters, so "field what counters the crew" resolves to *all seven* — and picking one
    // of them to lean on would field six percent of a tower against the faction it admits while
    // calling the seventh its answer. Bounded on both sides: nothing may run away with it, and
    // nothing may be token either, which is what stops "even" from meaning "five factions and a
    // gesture".
    const even = 1 / FACTIONS.length;

    for (const tower of towers.filter((entry) => evenlyCountered(entry.faction))) {
      for (const [faction, share] of sharesIn(tower)) {
        const note = `${tower.id} ${faction} share ${(share * 100).toFixed(1)}%`;

        expect(share, note).toBeLessThan(even * 1.75);
        expect(share, note).toBeGreaterThan(even * 0.35);
      }
    }
  });

  it('never gives two towers the same climb', () => {
    // ⚠️ **Seven towers leaning on the same faction would be one tower shipped seven times**, which
    // is the failure the whole 15c enemy-authoring half exists to prevent — and it is exactly what
    // would have happened without it, because Monsters were the only faction deep enough to lead
    // more than one. Distinctness is checked over the towers that *have* a lead, since the evenly
    // countered one has none to collide with.
    const leads = towers
      .filter((tower) => !evenlyCountered(tower.faction))
      .map((tower) => leaderOf(tower));

    expect(new Set(leads).size, leads.join(', ')).toBe(leads.length);
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
    // first clears and theirs. **Summed over the towers that actually ship** since 15c filled the
    // roster in — it was one tower's payout times `FACTIONS.length` while six of them were still
    // unwritten, which measured a projection rather than the game.
    //
    // ⚠️ **The two bounds are not the same kind of claim, and only one of them is stable.** The
    // ceiling — towers must not replace the campaign — compares two totals that both grow, and it
    // holds indefinitely. The floor did not, for as long as the towers were fixed at seven ladders
    // of a hundred floors while the campaign grew a chapter at a time: this ratio then fell by
    // construction as content shipped. Over the four-chapter ladder it read 3.17 at two chapters,
    // 2.12 at three, 1.59 at four, and the floor had been moved 2 → 1.5 to buy exactly that chapter.
    //
    // **The six-chapter re-cut then moved the ratio without adding a stage**: the same two hundred
    // stages hold six chapter boundaries instead of four, so Chapter Conqueror pays 60,000 against
    // the old 40,000 and the ratio reads ~1.37. That was accepted deliberately — the award stayed
    // 10,000 because it is what tower-topping ties to and because a linear payout cannot compound
    // past a flat `PULL_COST` — so the floor was re-derived to 1.3, which bought **the re-cut and
    // nothing more**, with the prediction written into it that chapter 7 would fire it again and
    // that the answer would be to grow the towers rather than to move the number.
    //
    // ## ⚠️ Chapter 7 fired it, the answer *was* to grow the towers, and milestone 21 did that
    //
    // **It landed in eleven sessions rather than one.** Its four chapters moved only the campaign
    // side while the tower side stayed at the shipped 219,100, so the ratio fell all the way through
    // them: 1.37 → **1.13** at chapter 7 (21a) → **0.96** at 8 (21b) → **0.83** at 9 → **0.74** at
    // 10. Sessions 21e–21k then doubled every tower to two hundred floors and took the tower side to
    // **436,100** against the ten-chapter campaign's 297,500: 0.74 → 0.835 (Human) → 0.940 (Dwarf) →
    // 1.045 (Elf) → 1.150 (Undead) → 1.255 (Monster) → 1.361 (Angel) → **1.466** (Demon).
    //
    // ⚠️ **The step is exactly 31,300 crystals — one tower's second hundred — so it is exactly
    // +0.1052 every time by construction**, seven for seven. Do not check it by subtracting the
    // rounded figures: 1.255 → 1.361 looks like +0.106.
    //
    // ## ⚠️ The floor was a placeholder for six sessions and 21k is what restores it
    //
    // It was 1.3 before milestone 21, 1.1 for 21a alone, and then **0.7 in a single edit covering
    // 21b through 21d** — because re-deriving a quantity that is *supposed* to fall, three times, to
    // three numbers all known in advance, is three edits that measure nothing. The acknowledged
    // price was that it watched nothing from 21b until now. That was the same call 21a made on
    // `levels.spec.ts`'s ceiling ratio and the opposite of the one 21b made on `gear.ts`'s
    // `gradeSoftness`; the distinction is whether the quantity is meant to move.
    //
    // **It is back at 1.3, which is where it was before the milestone rather than a new bar.** The
    // measured 1.466 leaves about 11% of headroom, and that headroom is the point: this ratio falls
    // again as soon as the campaign grows, reading **1.314** after an eleventh fifty-stage chapter
    // and **1.190** after a twelfth. So 1.3 survives chapter 11 and fires at chapter 12 — and 1.4,
    // which was the alternative, would have fired on the very next chapter shipped.
    //
    // ⚠️ **A failure here now is the original question again rather than a number to slide**:
    // whether seven towers of two hundred floors is still the right amount of optional content
    // beside the campaign of the day. The towers are no longer fixed while the campaign grows —
    // growing them is what this milestone was — so the honest answers are a third hundred, an eighth
    // ladder, or accepting that the campaign has outgrown its optional content.
    const seven = towers.reduce((total, tower) => total + crystalsPerTower(tower), 0);
    const campaign = campaignCrystals();
    const note = `seven towers ${seven} against a campaign of ${campaign}`;

    expect(seven / campaign, note).toBeGreaterThan(1.3);
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

  it('gives every tower an authored lock and leaves the unlocked kinds unlocked', () => {
    // ⚠️ **The Descent is excluded rather than expected either way, because its lock is neither
    // authored nor absent — it is drawn daily from the run's seed, and `dailyDescentFactions`
    // through `FormationService.lockFor` is what answers for it. Expeditions and the campaign
    // genuinely carry no lock at all**: `lockOf` turns their absent faction into "anybody may
    // stand", and the mode's adaptation runs through the card offer instead. Reading this test as
    // "faction absent means anybody may enter" is exactly right for those two and silently wrong
    // for the Descent, which is why the scope is spelled out rather than widened.
    for (const activity of activities.filter((entry) => entry.kind !== 'descent')) {
      expect(activity.faction === undefined, `${activity.id} lock`).toBe(activity.kind !== 'tower');
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

  it('sizes the completion track at a hundred floors, which the tower is a whole number of', () => {
    // ⚠️ **`Spire Conqueror` stayed `every: 100` when the towers doubled, so it pays twice.** The
    // alternative was `every: 200` to keep "topping a tower" a single event, and it was declined:
    // that strips 70,000 crystals from the tower side and drops the tower:campaign ratio below its
    // own floor — breaking the guard milestone 21 exists to fix. What the tie always rested on is
    // that a hundred floors and a fifty-stage chapter are comparable events, so it is restated **per
    // hundred floors** and the interval stays put.
    //
    // No save migration either way: awards-taken is an integer, and a player who topped the old
    // hundred has taken 1 and earned 1.
    //
    // `data/` holds no logic, so the interval is still a literal on the track — which makes this the
    // only thing standing between an award that pays three times and one that never pays at all.
    for (const tower of towers) {
      const intervals = tracksFor(tower)
        .map((track) => track.every)
        .sort((a, b) => a - b);
      const completion = intervals[intervals.length - 1];

      expect(completion, tower.id).toBe(TOWER_UNIT);
      expect(rules.floors % completion, `${tower.id} height in whole units`).toBe(0);
      // And the other one is the rhythm of the climb rather than a second completion award.
      expect(intervals[0], tower.id).toBeLessThan(completion);
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

  it('makes a hundred floors worth exactly what finishing a chapter is worth', () => {
    // A deliberate tie rather than a coincidence: a hundred floors and a fifty-stage chapter are
    // comparable events, so they pay the same. `achievements.spec.ts` narrows its own "largest
    // payout" claim to the ladder for this reason, and this is the other half of that decision.
    //
    // ⚠️ **Stated per hundred floors since 21e, which is what the tie always meant.** Read as "per
    // tower" it would have had to change when the towers doubled; read per unit it did not move at
    // all, and a tower simply became two of the events it was one of.
    const chapterAward =
      tracks.find((track) => track.counter === 'clearedChapters')?.reward.summons ?? 0;

    for (const tower of towers) {
      const completion = tracksFor(tower).find((track) => track.every === TOWER_UNIT);

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
