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
  floorGear,
  floorKindAt,
  floorLevel,
  gearLadderPosition,
  matchedStageIndex,
  PARTY_SIZE,
  type RarityId,
  rarityIndex,
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
import { GEAR_RULES } from './gear';
import { GROWTH, LEVEL_CURVE } from './levels';
import { TOWER_BAND_RUNGS, TOWER_BAND_UNIT, TOWER_RULES, TOWERS } from './towers';

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
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards, GEAR_RULES);
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

/** A tower's two achievement tracks, floor track first. */
function tracksFor(tower: TowerData): readonly AchievementTrackData[] {
  return tracks.filter((track) => track.counter === 'towerFloors' && track.tower === tower.id);
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

/**
 * The towers still authored at the previous height while the fourth hundred lands one tower at a time.
 *
 * ⚠️ **A literal list of names, and it has to stay literal.** `TOWER_RULES` is one rule for all seven,
 * so a height bump lands in a single session while the floors move in seven — and a *filter* ("the
 * full height, or three quarters of it") would pass forever and never notice a tower nobody went back
 * for. Each session deletes its own name; **the last one deletes this list and every branch that reads
 * it.** It has now been done this way three times: 21e–21k for the second hundred, again for the
 * third, and this.
 *
 * ⚠️ **A tower on this list is not damaged, but it does lose its boss.** `clearedFloors` clamps to
 * what the tower authors, so `nextFloor` reports it topped and every screen reads it right — but
 * `floorKindAt` reads the *rules'* height, so its floor 300 resolves as a **mini-boss paying ×2 rather
 * than ×5**. That is a real payout regression, and it is licensed by exactly one argument, the same
 * one the save re-bases rest on: **no build carrying it has ever reached a player.** If that stops
 * being true, extend all seven in one session or not at all.
 *
 * It also loses the top of the **gear ramp**, for the same reason and with the same shape:
 * `floorGear` measures the ramp against `rules.floors`, so a tower ending at 300 never reaches
 * `fromFloor` 301 and stays entirely naked. That is the correct behaviour rather than a second bug —
 * those three hundred floors were tuned naked.
 */
const PENDING: readonly string[] = ['tower-monster', 'tower-angel', 'tower-demon'];

/** The height a tower is actually authored at: the rules' height, or the band below for a pending one. */
const authoredHeight = (tower: TowerData): number =>
  PENDING.includes(tower.id) ? rules.floors - TOWER_BAND_UNIT : rules.floors;

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

  it('leaves a rung below the roof to stand on and one above it to climb toward', () => {
    // ⚠️ **This is what survives of "closes above the cap of the rung it asks for", and the fourth
    // hundred is what narrowed it.** The margin half of that guard has moved to the power-ratio
    // assertion below; see there for the whole argument. What is still worth holding here is the
    // weaker, structural claim: the roof sits **somewhere inside** the caps ladder rather than at
    // either end of it. A roof under the lowest cap would be content no rung is a fair test against,
    // and a roof above the highest would be a tower asking for an investment the game cannot sell.
    const caps = LEVEL_CURVE.caps as readonly number[];

    expect(
      caps.filter((cap) => cap < rules.topLevel).length,
      'a rung below the roof',
    ).toBeGreaterThan(0);
    expect(
      caps.filter((cap) => cap >= rules.topLevel).length,
      'a rung above the roof',
    ).toBeGreaterThan(0);
  });

  it('crews every band at the same power ratio against its own top floor', () => {
    // ⚠️ **This replaced two cap comparisons at the fourth hundred, and the replacement is the
    // quantity both were standing in for.** What has to hold is that a band's crew is a *fair test*
    // against the band's own closing floor: strong enough to clear it, not so strong that it walks it.
    // `towers.balance.ts` measures that in survivors; this holds the arithmetic that makes the
    // measurement mean the same thing in every band.
    //
    // ## Why the two cap comparisons had to go
    //
    // They were: "the roof closes above the top band's rung cap", and "every band below the top
    // closes at or under its own crew's cap". Both are exact restatements of the margin rule **while
    // a band's margin is smaller than the gap between its crew's level and its cap**, and the fourth
    // hundred is where that stopped being true in both directions at once:
    //
    // - Band 4 is `legendary`, which caps at **200** against a roof of **189**. Its crew stands at
    //   123 — 66 levels of margin, 77 levels of cap headroom — so the roof being *under* the cap says
    //   nothing at all about parity. The old guard would have demanded a roof of 201, which the
    //   campaign payout bound forbids outright (200 pays exactly the campaign's stage-400 lump) and
    //   which would move 291 of the 300 shipped floors by up to 9 levels.
    // - Band 3 closes at **142** against `elite-plus`'s cap of **140** and has done since the third
    //   hundred shipped, exempt only because it was then the *top* band. Adding a fourth band revoked
    //   that exemption on content that did not change by one level.
    //
    // ⚠️ **A guard that fires because the band *count* changed, on boards that are byte-identical, is
    // pointed at the wrong quantity** — the test `docs/authoring.md` records for the three guards it
    // has retired. So the ratio is asserted directly, and it is the same number the balance sweep's
    // `ROOF_MARGIN` / `RUNG_LEVELS` derivation produces, restated where `data/` can check it.
    //
    // ⚠️ **The bounds are wide on purpose.** This is not a tuning dial — it is the "band 3 is a
    // walkover and nobody could tell" failure, which measured ×2.703 against a correct ×1.676. Every
    // shipped band lands between 1.60 and 1.69; a band outside 1.55–1.85 is a band nothing is a fair
    // test against, and the sweep is where a band inside that window is actually tuned.
    const caps = LEVEL_CURVE.caps as readonly number[];
    const rungs: readonly RarityId[] = TOWER_BAND_RUNGS;
    // The sweep's own two constants, derived here the same way rather than imported from a spec.
    const roofMargin = 20;
    const rungLevels = Math.round(Math.log(GROWTH.perAscension) / Math.log(GROWTH.perLevel.common));
    const power = (level: number, rungsHeld: number): number =>
      GROWTH.perLevel.common ** level * GROWTH.perAscension ** rungsHeld;

    for (const [index, rung] of rungs.entries()) {
      const closes = floorLevel(rules, Math.min((index + 1) * TOWER_BAND_UNIT, rules.floors));
      const margin = index === 0 ? 0 : roofMargin + rungLevels * (index - 1);
      const level = Math.min(Math.max(closes - margin, 1), caps[rarityIndex(rung)]);
      // The crew holds `index + 1` rungs above `rare`; the board holds none, ever.
      const ratio = power(level, index + 1) / power(closes, 0);
      const note = `band ${index + 1} ${rung}/${level} against level ${closes}: ×${ratio.toFixed(3)}`;

      expect(ratio, note).toBeGreaterThan(1.55);
      expect(ratio, note).toBeLessThan(1.85);
    }
  });

  it('divides into bands of a hundred, each with a crew that can legally hold its level', () => {
    // `towers.balance.ts` splits the sweep every hundred floors so each shipped hundred keeps being
    // measured by a party that can lose to it. What that split needs is that **each band's crew can
    // legally hold the level its content asks for** — a cap at or above the level the band's own
    // crew stands at, one rung further up the ladder per band.
    //
    // ## ⚠️ This asserted the halfway floor's level *is* a cap until the campaign flattened
    //
    // The old derivation read band 1's rung off the caps ladder with `caps.indexOf(halfwayLevel)`,
    // so a halfway floor that missed a cap left the crew undefined — and the assertion existed to
    // catch that. ⚠️ **Tying the crew's rung to its level is exactly what broke when `topLevel` came
    // down with the campaign**: dropping the roof cost the crew a whole rung (×1.6) where the
    // content only lost its levels, and all seven roofs measured 0%. `towers.balance.ts` pins the
    // rungs and derives only the levels, so a band boundary is free to land anywhere and this checks
    // the property that actually has to hold.
    //
    // ## ⚠️ The rungs are a list, not a pair, and it has to keep up with the height
    //
    // The two-band version named `rare-plus` and `elite` inline. A third hundred needs a third rung,
    // and a fourth would need a fourth — so the height and this list are one decision. Deriving the
    // count off `rules.floors` is what makes a height bump that nobody wired a crew for a failing
    // test rather than a band swept by whichever crew happened to be last.
    const caps = LEVEL_CURVE.caps as readonly number[];
    const rungs: readonly RarityId[] = TOWER_BAND_RUNGS;
    const bands = Math.ceil(rules.floors / TOWER_BAND_UNIT);

    expect(rungs, `${bands} bands of ${TOWER_BAND_UNIT} floors`).toHaveLength(bands);

    // Strictly ascending, so a band is never crewed at or below the rung the band under it used.
    // The typed local above is what proves each name is a rung the ladder actually has.
    const indices = rungs.map((rung) => rarityIndex(rung));

    expect(indices, indices.join(' < ')).toEqual([...indices].sort((a, b) => a - b));
    expect(new Set(indices).size).toBe(indices.length);

    // ⚠️ **Every band's crew can legally hold the level it is fielded at**, which is the property the
    // split actually needs and the one thing the two retired cap comparisons were right about.
    // `towers.balance.ts` clamps a crew's level to its rung's cap, so a band whose derived level sits
    // above its cap is a band swept by a party quietly weaker than the derivation says — invisible in
    // the output, because a walkover and a correctly tuned band both read 100% with five alive.
    //
    // ⚠️ **This is deliberately *not* "the band closes under the crew's cap".** That version fired on
    // band 3 the moment a fourth band existed, on boards that did not change by one level — see the
    // power-ratio test above for why it was pointed at the wrong quantity. A band above the first is
    // *meant* to close above where its crew stands; what it may not do is ask for a crew the ladder
    // cannot legally field.
    const roofMargin = 20;
    const rungLevels = Math.round(Math.log(GROWTH.perAscension) / Math.log(GROWTH.perLevel.common));
    for (const [index, rung] of rungs.entries()) {
      const closes = floorLevel(rules, Math.min((index + 1) * TOWER_BAND_UNIT, rules.floors));
      const margin = index === 0 ? 0 : roofMargin + rungLevels * (index - 1);
      const cap = caps[rarityIndex(rung)];

      expect(
        Math.max(closes - margin, 1),
        `band ${index + 1} crews at ${closes - margin} against ${rung}'s cap ${cap}`,
      ).toBeLessThanOrEqual(cap);
    }
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
    // ⚠️ **Read through {@link PENDING}, because the fourth hundred is in flight.** `TOWER_RULES` is
    // one rule for all seven, so the height bump landed in a single session and the floors move in
    // seven — so for the six sessions in between, that literal list of names carries the towers still
    // on the old height. A filter — "the full height or three quarters of it" — would pass forever and
    // never notice a tower nobody went back for. Each session deletes its own name and the last one
    // deletes the list, restoring the plain equality. It has now happened three times: 21e–21k for the
    // second hundred, again for the third, and this. **Do it exactly this way every time the height
    // moves.**
    for (const tower of towers) {
      expect(tower.floors.length, tower.id).toBe(authoredHeight(tower));
    }
    // The list may only ever name a tower this build actually ships, and may never name all of them —
    // a `PENDING` list covering the whole set is a height bump nobody started.
    for (const id of PENDING) {
      expect(
        towers.map((tower) => tower.id),
        `pending ${id}`,
      ).toContain(id);
    }
    expect(PENDING.length, 'a pending list covering every tower').toBeLessThan(towers.length);
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

  it('draws a gear ramp that only ever rises, and only over floors it authors', () => {
    // The tower-side mirror of the level line's monotonicity test. ⚠️ **Monotone on the *concatenated*
    // grade ladder rather than on the grade and the level separately** — a grade boundary is not a
    // level reset, so a ramp interpolating the two would step down in level at every boundary while
    // both authored numbers rose. `gearLadderPosition` is the one number that cannot do that.
    if (rules.gear === undefined) {
      return;
    }
    const ramp = rules.gear;

    expect(ramp.fromFloor, 'the ramp starts inside the tower').toBeGreaterThan(0);
    expect(ramp.fromFloor, 'the ramp starts inside the tower').toBeLessThanOrEqual(rules.floors);
    // ⚠️ **Every floor below `fromFloor` stays naked**, which is what lets a geared hundred land
    // without re-pricing the two thousand one hundred floors that were tuned without gear (2,300 shipped,
    // 200 of them geared: the Human and Dwarf fourth hundreds).
    for (let floor = 1; floor < ramp.fromFloor; floor++) {
      expect(floorGear(rules, GEAR_RULES, floor), `floor ${floor}`).toBeUndefined();
    }

    let previous = 0;
    for (let floor = ramp.fromFloor; floor <= rules.floors; floor++) {
      const gear = floorGear(rules, GEAR_RULES, floor);

      expect(gear, `floor ${floor}`).toBeDefined();
      const position = gearLadderPosition(GEAR_RULES, gear?.grade ?? 0, gear?.level ?? 1);

      expect(position, `floor ${floor} on the grade ladder`).toBeGreaterThanOrEqual(previous);
      previous = position;
    }

    // The endpoints are what `data/` authored, exactly — a ramp that landed near its roof rather than
    // on it would be a tower whose last floor wears something nobody chose.
    expect(floorGear(rules, GEAR_RULES, ramp.fromFloor)).toEqual({
      grade: ramp.from.grade,
      level: ramp.from.level,
    });
    expect(floorGear(rules, GEAR_RULES, rules.floors)).toEqual({
      grade: ramp.to.grade,
      level: ramp.to.level,
    });
    // ⚠️ **The grade has to actually climb**, or "the enemies increase in quality" is a claim about a
    // ramp that spends a whole hundred inside one grade.
    expect(ramp.to.grade, 'the ramp climbs at least one grade').toBeGreaterThan(ramp.from.grade);
  });

  it('gives every body on a geared floor a gear archetype to look itself up under', () => {
    // ⚠️ **The silent trap, and the tower-side twin of the guard `chapters.spec.ts` holds.** An
    // enemy's `gearArchetype` is a bare string and an absent one is looked up under `undefined`: the
    // body gets nothing, fights naked on a board tuned as though it were kitted, and **nothing throws
    // and nothing renders wrong.** Only the balance sweep would ever notice, and only as a board that
    // was mysteriously easy.
    //
    // A hundred and seventy-one shipped blocks predate enemy gear, so the field stays optional — this
    // is what makes fielding one of them on a geared floor a failing test instead of a silent
    // regression. `enemies.spec.ts` is what proves the declared values are real archetypes.
    for (const tower of towers) {
      for (const [offset, floor] of tower.floors.entries()) {
        if (floorGear(rules, GEAR_RULES, offset + 1) === undefined) {
          continue;
        }
        for (const enemy of [...floor.enemies.front, ...floor.enemies.back]) {
          expect(
            enemy.gearArchetype,
            `${floor.id} fields ${enemy.id} on a geared floor with no archetype`,
          ).toBeDefined();
        }
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
      const height = tower.floors.length;
      const kinds = tower.floors.map((_, offset) => floorKindAt(rules, offset + 1));

      // ⚠️ **Branched on {@link PENDING} while the fourth hundred is in flight, and asserted rather
      // than skipped so the cost of leaving a tower on that list stays on the record.** A tower still
      // on the previous height has **no boss at all**: `floorKindAt` reads the *rules'* height, so its
      // last floor lands on the mini-boss interval and pays ×2 instead of ×5. Skipping those six would
      // hide a real payout regression; asserting the regression is what makes deleting a name from the
      // list flip this from one branch to the other. **Delete both branches with the list.**
      if (PENDING.includes(tower.id)) {
        expect(
          kinds[height - 1],
          `${tower.id} (pending): no boss until its own hundred lands`,
        ).toBe('mini-boss');
        expect(
          kinds.filter((kind) => kind === 'boss'),
          tower.id,
        ).toHaveLength(0);
      } else {
        expect(kinds[height - 1], tower.id).toBe('boss');
        expect(
          kinds.filter((kind) => kind === 'boss'),
          tower.id,
        ).toHaveLength(1);
      }
      expect(
        kinds.filter((kind) => kind === 'mini-boss'),
        tower.id,
      ).toHaveLength(
        PENDING.includes(tower.id)
          ? height / rules.miniBossEvery
          : Math.floor((rules.floors - 1) / rules.miniBossEvery),
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

  it('never pays a floor more than the campaign pays the stage at the same depth', () => {
    // **The half of this that protects the campaign**: a floor's lump is read off the campaign at
    // the stage fighting at the same *level*, so what has to stay true is that the roof's lump does
    // not overtake what the campaign pays a player who has walked as many stages as the tower has
    // floors. Towers are optional content and must not out-pay the spine.
    //
    // ## ⚠️ The index half was retired when the campaign flattened to 0.50 levels a stage
    //
    // It read `matchedStageIndex(campaignLevels, roofLevel) < rules.floors` under the claim that a
    // tower floor is an easier fight than the campaign stage at the same index — true while the
    // campaign climbed 1.5+ levels a stage against the tower's 0.6, and false the moment the
    // campaign came down to 0.5. The quantity it compares is **a campaign stage index against a
    // tower floor count**, which is two different units and only ever agreed by coincidence of the
    // two ladders being a similar length. On a campaign heading for ~100 chapters and a tower fixed
    // at 200 floors it cannot be made true by any `topLevel` that also satisfies the payout bound
    // below: the payout half needs the roof under the campaign's level at stage 200, and the band-2
    // crew derivation in `towers.balance.ts` needs it above — see that file.
    //
    // ⚠️ **The design claim it was making survives and is made better elsewhere.** "A tower charges
    // for roster breadth, not investment" is held by `TOWER_RULES`'s roof sitting inside the
    // campaign's own level range, which is checked directly rather than through an index. This is
    // the fourth guard in this project retired rather than slid, after the absolute
    // hours-to-the-ceiling, the ratio that replaced it, and the top stage under `maxLevel / 2`.
    expect(Number(lumpAt(rules.topLevel).gold ?? 0)).toBeLessThan(
      Number(stagePayout(rewards, rules.floors).reward.gold ?? 0),
    );
  });

  it('keeps the roof inside the campaign’s own level range', () => {
    // What the retired index half was really claiming, stated in levels rather than in indices so
    // it means the same thing however long either ladder gets. A roof the campaign never reaches
    // would be a second campaign gated behind roster depth.
    expect(rules.topLevel).toBeLessThan(campaignLevels[campaignLevels.length - 1]);
  });

  it('pays a lump that rises with the climb, and never a rate', () => {
    for (const tower of towers) {
      let previous = 0;

      for (const floor of resolveTower(tower, rules, lumpAt, GEAR_RULES)) {
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

  /*
   * ⚠️ **The tower:campaign crystal ratio used to be asserted here and has been retired.**
   *
   * It read `sum(crystalsPerTower) / campaignCrystals` against a floor of 1.3 and a ceiling of 4,
   * and the floor is what killed it. That quantity falls by construction every time a chapter ships
   * and rises in one step every time the towers grow, so the floor had been moved 2 → 1.5 → 1.3 →
   * 1.1 → 0.7 → 1.3 across five sessions and spent six of them parked at a placeholder watching
   * nothing. The third hundred takes the ratio from 1.40 to **2.09**, which would have meant a sixth
   * slide. `docs/authoring.md` records the alternative as a real option — three guards have been
   * retired rather than slid — on the test that applies here: **when the honest restatement of a
   * guard is a number you would refuse to author, the guard is pointed at the wrong quantity.**
   *
   * ⚠️ **The ceiling went with it, and that half was stable.** Keeping it would have meant keeping
   * `crystalsPerTower` and `campaignCrystals` for an assertion with roughly ×1.9 of slack. The
   * question both halves were really asking — *is seven towers still the right amount of optional
   * content beside the campaign of the day* — is a design question a threshold was never going to
   * answer, and it is now asked in prose in [`towers.ts`](./towers.ts) with the arithmetic written
   * out beside it. **Recompute both totals when extending either side.**
   */
  it('pays the climb its rhythm through the two multipliers, not the base', () => {
    // What survives of the retired arithmetic, and the half that is a genuine invariant rather than a
    // ratio between two totals that both move. A flat base is the rule every crystal payout in this
    // game follows — a pull costs a flat `PULL_COST` forever, so anything scaling with how far a run
    // has come pays most to the player who needs it least — which leaves the mini-boss and the roof
    // as the only places a climb is allowed to feel like it peaked.
    expect(rules.floorSummons.bossMultiplier).toBeGreaterThan(
      rules.floorSummons.miniBossMultiplier,
    );
    expect(rules.floorSummons.miniBossMultiplier).toBeGreaterThan(1);
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
