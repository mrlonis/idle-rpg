// The towers, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it. The structural half of
// the towers lives in [`towers.spec.ts`](./towers.spec.ts).
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type ChapterCurveData,
  type ChapterData,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type FormationData,
  floorLevel,
  type GrowthData,
  type KitRulesData,
  MAX_BATTLE_TICKS,
  matchedStageIndex,
  PARTY_SIZE,
  rarityIndex,
  resolveLadder,
  resolveTower,
  simulateBattle,
  type StageData,
  type StageRewardCurveData,
  stagePayout,
  ticksToMs,
  toBattleCombatant,
  toCombatRules,
  type TowerData,
  type TowerRulesData,
} from '../core';
import { FACTIONS } from './ascension';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import {
  AELRINDEL,
  AURELIA,
  AZRATHOTH,
  BRAN,
  CELIA,
  CIRIEN,
  DORN,
  FAELEN,
  GHAUL,
  GHORRAK,
  GNASH,
  GRIMNA,
  HALRIC,
  HEDDA,
  ILYRA,
  ITHURIEL,
  IVO,
  KARSITH,
  KORRIN,
  LYSHA,
  MALAKAR,
  MIRA,
  MORTLACH,
  NAEL,
  NAERIN,
  NEKROS,
  NYXARA,
  ORIN,
  OSSUARY,
  OZZA,
  PYRA,
  RAZIEL,
  RIN,
  RUK,
  SABLE,
  SANGUINE,
  SERAPHINE,
  SEREN,
  SKARN,
  SYLVARA,
  THRAUN,
  THREX,
  VESPER,
  VEXIS,
  VHAROK,
  WREN,
  YERRIK,
  YSOLDE,
  ZAPHIEL,
} from './characters';
import { COMBAT_RULES, FACTION_MATCHUPS } from './combat';
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';
import { TOWER_BAND_RUNGS, TOWER_BAND_UNIT, TOWER_RULES, TOWERS } from './towers';

/**
 * Conformance through typed locals, because `data/` may not import `core/`.
 *
 * The same discipline `chapters.balance.ts` runs on, and the same payoff: a malformed floor is a
 * compile error here rather than a stage the simulation quietly fails to parse.
 */
const towers: readonly TowerData[] = TOWERS;
const rules: TowerRulesData = TOWER_RULES;
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;
const growth: GrowthData = GROWTH;
const kit: KitRulesData = KIT_RULES;
const authoredRules: CombatRulesData = COMBAT_RULES;
const combat: CombatRules = toCombatRules(authoredRules);

/** The campaign, resolved exactly as `ui/content.ts` resolves it — what a floor's lump matches. */
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);
const campaignLevels: readonly number[] = stages.map((stage) => stage.level);

/** Every floor of every tower, resolved exactly as `ui/content.ts` resolves them. */
const floorsOf = (tower: TowerData): readonly StageData[] =>
  resolveTower(
    tower,
    rules,
    (level) => stagePayout(rewards, matchedStageIndex(campaignLevels, level)).reward,
  );

/**
 * Seeds per floor. The same forty the ladder's sweep uses, for the same reason: enough to tell
 * "reliable" from "a coin flip".
 */
const TRIALS = 40;

/**
 * Every fourth floor, plus the roof.
 *
 * ⚠️ **A stride over the tower, not a smaller sample of it** — the same licence milestone 11 took on
 * the ladder, and for the same reason. A hundred floors spans levels 1 to 60, so adjacent floors sit
 * within a level of each other and a block that measures a *step* measures noise at that spacing.
 * Striding restores the per-sample gap while covering the same range at the same resolution. The
 * load-bearing assertions — zero timeouts, the timer headroom, the top floor — read every floor.
 */
const STRIDE = 4;

/**
 * One crew per hundred floors, every one of them derived rather than chosen.
 *
 * ## ⚠️ A single upgraded crew would stop this file saying anything about the low bands
 *
 * The tower is three hundred floors and two of those hundreds have already shipped. A crew built for
 * the roof walks floor 40 without noticing, so the levels the earlier bands carry would go unmeasured
 * on content that is already in players' hands. One crew per band is what keeps all of it watched —
 * the same move `chapters.balance.ts` makes with BUILT / ARRIVED / MARCHED / INVESTED and for the
 * same reason. ⚠️ **It also means a height bump is never just a height bump**: a new hundred needs a
 * new rung in `TOWER_BAND_RUNGS`, and `towers.spec.ts` fails if the list and the height disagree.
 *
 * ## ⚠️ The rungs are pinned in `data/`, and only the levels derive
 *
 * They used to come off the caps ladder — band 1 from `caps.indexOf(halfwayFloorLevel)`, band 2 from
 * the highest cap below the roof — which tied each crew's **rung** to its level. When the campaign
 * flattened and `topLevel` came down with it, that cost both crews a whole rung (×1.6) where the
 * content only lost its levels, and **all seven roofs measured 0%**. See {@link ROOF_MARGIN} and
 * {@link RUNG_LEVELS} for the two numbers the levels are derived from, and `data/towers.ts` for the
 * pinned list.
 *
 * ## ⚠️ The margin is mandatory, and milestone 21e measured why
 *
 * A rung is worth ×1.6 and **the enemy side has no rungs at all** — it climbs levels and nothing
 * else. So a crew standing at parity with the content is only a fair test at the *first* rung above
 * `rare`, which is exactly where band 1 sits. At `elite-plus` (three rungs, ×4.096) a party at level
 * 140 takes the heaviest board this game can author — five `ascended` blocks with an Unmade in front
 * — at **100% with all five alive in nine seconds**. No board fixes that; the level line has to,
 * which is why band 3's crew stands 43 levels under its roof rather than 20.
 *
 * This is the campaign's own margin rule arriving in the towers, and it means `topLevel` can never be
 * a rarity cap. `towers.spec.ts` holds the margin in place of the cap match it used to hold.
 */
/**
 * How far below its band's top floor a crew stands, in levels, before the rung correction below.
 *
 * ⚠️ **Measured, not chosen.** It is the gap the shipped build had — `topLevel` 120 against an
 * `elite` crew capped at 100 — and pinning it is what reproduces that tuning after the campaign
 * flattened to 0.50 levels a stage and brought `topLevel` down with it. The old derivation read the
 * crew's level *off the caps ladder* ("highest cap strictly below the roof"), which tied the crew's
 * **rung** to its level: dropping the roof by 40 dropped the crew a whole rung as well, costing it
 * ×1.6 where the content only lost ×2.29 in levels, and every one of the seven roofs measured 0%.
 * Pinning the rungs and deriving only the levels holds the bands at the ratios the shipped floors
 * were tuned at — 1.739 at floor 93 and 1.689 at the two-hundred-floor roof, to three decimals.
 */
const ROOF_MARGIN = 20;

/**
 * What one ascension rung is worth in levels, which is what makes {@link ROOF_MARGIN} generalise.
 *
 * ## ⚠️ Reusing the margin unchanged on a third band is a walkover, and it is not a small one
 *
 * A band's crew stands one rung further up than the band below it. A rung is ×1.6 flat while a level
 * is `perLevel.common`, so **each rung a crew takes has to be paid back in levels** or the crew pulls
 * away from content that only ever climbs levels. Measured against the shipped band 2 ratio of
 * ×1.689:
 *
 * | Band 3 crew                   | Ratio against a level-142 roof |
 * | ----------------------------- | ------------------------------ |
 * | `elite-plus`, margin 20 → 122 | **×2.703** — a victory lap     |
 * | `elite-plus`, margin 43 → 99  | ×1.676 — band 2's own figure   |
 * | `elite`, margin 42 → 100      | ×1.072 — content pulls ahead   |
 *
 * `ln(1.6) / ln(perLevel.common)` is **22.6**, so a rung costs 23 levels of margin and band 3 stands
 * 43 below its roof rather than 20. ⚠️ **Derived rather than typed**, because both inputs move: the
 * ×1.6 is `GROWTH.perAscension` and the 1.021 is `GROWTH.perLevel.common`, and a retune of either
 * silently re-tunes every band above the first.
 *
 * ⚠️ **This is the thing to check first if a band above 1 sweeps as a walkover.** The failure is
 * invisible in the output — every floor reads 100% with five alive, which is also what a correctly
 * tuned low band reads — so confirm the ratio before concluding anything about the boards.
 */
const RUNG_LEVELS = Math.round(Math.log(GROWTH.perAscension) / Math.log(GROWTH.perLevel.common));

/**
 * Towers still standing at the previous height, by id.
 *
 * ⚠️ **A literal list of names, deliberately, and it is self-deleting.** `TOWER_RULES` is one rule
 * for all seven, so a height bump lands in a single session while the floors move in seven. Every
 * other quantity in this file derives from `tower.floors.length` and therefore *adapts* to a short
 * tower — which is precisely why a list is needed: a derivation passes forever and never notices a
 * tower nobody went back for.
 *
 * Delete your tower's name as you author its floors. The session that empties it deletes this
 * constant, the `owed` branch below, and the matching list in
 * [`towers.spec.ts`](./towers.spec.ts).
 */
const PENDING = new Set([
  'tower-dwarf',
  'tower-elf',
  'tower-undead',
  'tower-monster',
  'tower-angel',
  'tower-demon',
]);

/** Bands of a hundred floors, so band `n` covers floors `(n-1)*100 + 1` through `n*100`. */
const BAND_FLOORS = TOWER_BAND_UNIT;
const BANDS = TOWER_BAND_RUNGS.length;

/** Which crew meets a floor. Band 1 takes the first hundred, band 2 the second, and so on. */
const bandOf = (floor: number): number => Math.min(Math.ceil(floor / BAND_FLOORS), BANDS) || 1;

/** The last floor band `band` is asked for — its own hundred, or the roof for the top band. */
const bandTopFloor = (band: number): number => Math.min(band * BAND_FLOORS, rules.floors);

/**
 * The rung and level each band's crew is fielded at, derived end to end.
 *
 * ⚠️ **Band 1 stands at parity with its own top floor and every band above it does not**, which
 * looks like an inconsistency and is the shipped tuning. Band 1's crew is `rare-plus` — one rung over
 * `rare`, the first rung at which a party is a fair test at all — so it has no rung to pay back and
 * `ROOF_MARGIN` does not apply to it. Every band above owes {@link ROOF_MARGIN} once, plus
 * {@link RUNG_LEVELS} for each *further* rung it has taken. The margins run 0, 20, 43 and the
 * resulting crews are `rare-plus`/48, `elite`/75 and `elite-plus`/99 — the first two exactly what the
 * shipped fourteen hundred floors were tuned against, which is the constraint this has to satisfy.
 *
 * Clamped to the rung's own cap, which is what "a crew that can legally hold the level its content
 * asks for" means — `towers.spec.ts` holds the same property from the data side.
 */
const BAND_CREWS = TOWER_BAND_RUNGS.map((rung, index) => {
  const rarity = rarityIndex(rung);
  const margin = index === 0 ? 0 : ROOF_MARGIN + RUNG_LEVELS * (index - 1);
  const level = Math.min(
    Math.max(floorLevel(rules, bandTopFloor(index + 1)) - margin, 1),
    LEVEL_CURVE.caps[rarity],
  );
  return { rung, rarity, level, margin };
});

/**
 * One character resolved for level and rung, exactly as `ui/` hands it to a battle.
 *
 * Through `toBattleCombatant` rather than reassembled here, because the kit is narrowed by tier and
 * rung as well as the stats being scaled — a sweep that built its own combatant would measure a party
 * fielding skills the game has not handed the player yet. ⚠️ **The rung is most of the difference
 * between the two bands, not the levels**: `elite` is where the second skill unlocks, and an
 * `elite` five at level 70 clears every floor of the shipped hundred with all five alive.
 *
 * **No gear, deliberately.** The tower's target is a party that has invested in *breadth*, and a
 * player crewing seven towers has one bag to equip them from. Measuring the tower against a fully
 * geared five would tune it for a party nobody with seven crews can field.
 */
function at(character: CharacterData, band: number): CombatantData {
  const { rarity, level } = BAND_CREWS[band - 1];

  expect(level, `level ${level} at rung ${rarity}`).toBeLessThanOrEqual(LEVEL_CURVE.caps[rarity]);
  return toBattleCombatant(
    character,
    { defId: character.id, rarity, level, copies: 0, gear: {}, signature: 0 },
    growth,
    kit,
    level,
  );
}

/** A crew as `data/` names it: five characters, resolved at whichever band is asking. */
type Bench = readonly [readonly CharacterData[], readonly CharacterData[]];

function five(front: readonly CharacterData[], back: readonly CharacterData[]): Bench {
  expect(front.length + back.length).toBe(PARTY_SIZE);
  return [front, back];
}

const fielded = (bench: Bench, band: number): FormationData => ({
  front: bench[0].map((character) => at(character, band)),
  back: bench[1].map((character) => at(character, band)),
});

/**
 * The crew each tower is tuned against: five of its own faction, the way a player would build them.
 *
 * ⚠️ **Three commons and two legendaries wherever the roster allows it**, which is the deepest a
 * faction goes without an ascended-tier pull — the same "no lucky banner" rule the ladder's reference
 * parties follow. A tower behind a lucky pull would be a wall in front of a player with no way to buy
 * past it, which is the failure the whole milestone is written around.
 *
 * The Human five is the one `chapters.balance.ts` fields for its mono-faction sweep, restated here
 * rather than imported because the two files field it at different investments and sharing the list
 * would make one of them look like it followed from the other.
 */
const CREWS: ReadonlyMap<string, Bench> = new Map([
  ['tower-human', five([HALRIC, MIRA], [WREN, YSOLDE, IVO])],
  ['tower-dwarf', five([BRAN, HEDDA], [DORN, GRIMNA, ORIN])],
  ['tower-elf', five([CIRIEN, RIN], [FAELEN, NAERIN, SYLVARA])],
  ['tower-undead', five([GHAUL, MORTLACH], [VESPER, OSSUARY, KARSITH])],
  ['tower-monster', five([SKARN, YERRIK], [GNASH, GHORRAK, OZZA])],
  ['tower-angel', five([NAEL, RAZIEL], [CELIA, ILYRA, ZAPHIEL])],
  ['tower-demon', five([THREX, VEXIS], [PYRA, NYXARA, SANGUINE])],
]);

/**
 * A second five per faction, for the question a single reference party cannot answer.
 *
 * A tower asks for five of one faction, and a player who owns seven of them has choices — so the
 * interesting failure is not "the reference five cannot climb" but "only one arrangement can". Each
 * of these is the faction's other three plus two the reference five also uses, which is as
 * different as a seven-deep bench gets.
 *
 * ⚠️ **Every one of them fields the faction's `ascended`-tier character, which the reference fives
 * deliberately do not.** That is not a second investment level, it is the *other* thing a player
 * might own: the reference five is what a run with no lucky banner can build, and this is what a run
 * that got one builds instead. Both have to be able to climb, which is why this block's threshold is
 * lower than the reference crew's rather than equal to it.
 */
const ALTERNATES: ReadonlyMap<string, Bench> = new Map([
  ['tower-human', five([AURELIA, SEREN], [WREN, MIRA, IVO])],
  ['tower-dwarf', five([THRAUN, HEDDA], [GRIMNA, KORRIN, ORIN])],
  ['tower-elf', five([LYSHA, CIRIEN], [FAELEN, AELRINDEL, RIN])],
  ['tower-undead', five([GHAUL, KARSITH], [VESPER, NEKROS, SABLE])],
  ['tower-monster', five([SKARN, VHAROK], [GNASH, RUK, YERRIK])],
  ['tower-angel', five([RAZIEL, NAEL], [SERAPHINE, ITHURIEL, ILYRA])],
  ['tower-demon', five([THREX, MALAKAR], [AZRATHOTH, VEXIS, SANGUINE])],
]);

interface Sweep {
  readonly winRate: number;
  readonly meanSeconds: number;
  readonly maxSeconds: number;
  readonly meanSurvivors: number;
  /** Fights that ran the ninety seconds out instead of ending in a death. */
  readonly timedOut: number;
}

function sweep(party: FormationData, stage: StageData, using: CombatRules = combat): Sweep {
  let wins = 0;
  let timedOut = 0;
  let ticks = 0;
  let longest = 0;
  let survivors = 0;

  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(party, stage, battleSeed(0xc0ffee, stage.id, attempt), using);
    if (result.outcome === 'victory') {
      wins++;
    }
    if (result.timedOut) {
      timedOut++;
    }
    ticks += result.ticks;
    longest = Math.max(longest, result.ticks);
    survivors += result.final.filter(
      (fighter) => fighter.side === 'ally' && fighter.hp.gt(0),
    ).length;
  }

  return {
    winRate: wins / TRIALS,
    meanSeconds: ticks / TRIALS / 10,
    maxSeconds: longest / 10,
    meanSurvivors: survivors / TRIALS,
    timedOut,
  };
}

/** One entry per floor swept, carrying which tower, which floor and which band it was. */
interface Entry extends Sweep {
  readonly label: string;
  readonly tower: string;
  readonly floor: number;
  readonly band: number;
  readonly stage: StageData;
}

function sweepTower(
  tower: TowerData,
  bench: Bench,
  label: string,
  every: number,
): readonly Entry[] {
  const floors = floorsOf(tower);
  const parties = BAND_CREWS.map((_, index) => fielded(bench, index + 1));
  const entries: Entry[] = [];
  for (const [offset, stage] of floors.entries()) {
    const floor = offset + 1;
    if (floor % every !== 0 && floor !== 1 && floor !== floors.length) {
      continue;
    }
    const band = bandOf(floor);
    entries.push({
      label,
      tower: tower.id,
      floor,
      band,
      stage,
      ...sweep(parties[band - 1], stage),
    });
  }
  return entries;
}

const crewOf = (tower: TowerData, from: ReadonlyMap<string, Bench>): Bench => {
  const party = from.get(tower.id);
  if (party === undefined) {
    // ⚠️ Not a skip. A tower with no reference party is a tower nothing is tuned against, and 15c
    // adds six of them — so the sweep has to fail rather than quietly cover one of seven.
    throw new Error(`no reference crew for ${tower.id}`);
  }
  return party;
};

/** Every floor of every tower against its own crew, for the load-bearing guards. */
const everyFloor = towers.flatMap((tower) => sweepTower(tower, crewOf(tower, CREWS), 'crew', 1));

/** The stride, for everything that measures the *shape* of the climb rather than one floor. */
const sampled = towers.flatMap((tower) => sweepTower(tower, crewOf(tower, CREWS), 'crew', STRIDE));
const alternates = towers.flatMap((tower) =>
  sweepTower(tower, crewOf(tower, ALTERNATES), 'alternate', STRIDE),
);

/**
 * Each tower's last **authored** floor, against the crew for the band that floor falls in.
 *
 * ⚠️ **Authored rather than the rules' height, and that is what makes it read a real fight while a
 * height bump is in flight.** A tower on the `PENDING` list closes inside band 2 and is swept by
 * band 2's crew; `floorKindAt` will call that floor a mini-boss until its own hundred lands, which
 * costs it a payout but not a fight. Reading `rules.floors` here would sweep an undefined stage.
 */
const topFloors = towers.map((tower) => {
  const resolved = floorsOf(tower);
  const stage = resolved[resolved.length - 1];
  return {
    tower: tower.id,
    floors: resolved.length,
    stage,
    ...sweep(fielded(crewOf(tower, CREWS), bandOf(resolved.length)), stage),
  };
});

describe('tower balance', () => {
  it('never runs the clock out on a fight the tower is meant for', () => {
    // ⚠️ **The load-bearing assertion, and the same one the ladder's sweep opens with.** Every fight
    // a tuned party has should end because somebody died, not because ninety seconds elapsed. It
    // reads `timedOut` rather than the outcome, because a timeout and a wipe are the same `defeat` on
    // screen and an outcome-based version of this would silently test nothing.
    const stalled = everyFloor
      .filter((entry) => entry.timedOut > 0)
      .map((entry) => `${entry.label} vs ${entry.stage.id}`);

    expect(stalled).toEqual([]);
  });

  it('lets the tower crew take the roof', () => {
    // ⚠️ **The whole balance target**, and the only assertion here that says a tower is clearable at
    // all: five of its faction at the band-2 rung, no gear. If this goes red the answer is the top
    // band's line-ups in `tower-<faction>.ts`, not the party — the party is derived from the tower's
    // own level line.
    //
    // ⚠️ **Read over every tower since 21k, and it was read over a `PENDING` filter before that.**
    // The height doubled in one session (21e) and the floors moved in seven, so for six sessions a
    // tower still on its first hundred had no roof for this to read — `floorKindAt` reads the
    // *rules'* height, so its last authored floor resolved as a mini-boss. All seven are the full
    // height now. The count is still asserted so this cannot quietly become a loop over nothing.
    expect(topFloors.length).toBe(towers.length);
    for (const top of topFloors) {
      expect(
        top.winRate,
        `${top.tower} roof ${(top.winRate * 100).toFixed(0)}%`,
      ).toBeGreaterThanOrEqual(0.9);
    }
  });

  it('lets that crew climb every floor below it', () => {
    // A tower is a climb rather than a wall with a hundred steps: a floor a player cannot pass stops
    // the whole thing, because a floor is climbed once and there is no way around it.
    const unreliable = everyFloor
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('still costs that crew something near the top', () => {
    // A climb that never loses anybody has no texture, and the roof would read like floor 1.
    for (const top of topFloors) {
      expect(top.meanSurvivors, `${top.tower} survivors`).toBeLessThan(PARTY_SIZE);
    }
    // ⚠️ **Against the opening floor of the roof's own band, not the tower's floor 1.** Each band is
    // fought by a different crew, so a roof measured against floor 1 would be reading a fight the top
    // band's party never has — and the ratio would say more about the rungs between them than about
    // the climb. The top band's own opener is the honest comparison and it is the same five.
    //
    // ⚠️ **Per tower, because a PENDING tower's top band is not the rules' top band.** A tower still
    // on the previous height closes inside band 2, so reading band 3's opener for it would find
    // nothing and silently compare the roof against zero.
    for (const top of topFloors) {
      const band = bandOf(top.floors);
      const first = everyFloor.find(
        (entry) => entry.tower === top.tower && entry.floor === (band - 1) * BAND_FLOORS + 1,
      );

      expect(first, `${top.tower} band ${band} opener`).toBeDefined();
      expect(top.meanSeconds, `${top.tower} roof against its own band's opener`).toBeGreaterThan(
        (first?.meanSeconds ?? 0) * 2,
      );
    }
  });

  it('is climbable by more than one arrangement of the faction', () => {
    // ⚠️ **What makes a tower a demand on the roster rather than on one lucky five.** A player who
    // owns seven Humans has choices, and a tower only one arrangement can climb is a tower tuned
    // against a solution rather than against an investment.
    const unreliable = alternates
      .filter((entry) => entry.winRate < 0.75)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('keeps every fight inside a watchable length', () => {
    // Battle duration is screen time: the animator plays the log in real time and the playback
    // control tops out at 4×. A tower is a hundred fights, so this bites harder here than on the
    // ladder — a loop of overlong floors is an evening rather than a session.
    const overlong = [...everyFloor, ...alternates]
      .filter((entry) => entry.meanSeconds > 60)
      .map((entry) => `${entry.label} vs ${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });

  it('leaves the timer real headroom over the longest fight a tower actually has', () => {
    // The same margin `chapters.balance.ts` defends, measured over the fights a party **clears** for
    // the same reason: a fight the party loses has no tuning claim on it, and the margin exists so a
    // floor stays clearable by the crew it was tuned for.
    const cleared = [...everyFloor, ...alternates].filter((entry) => entry.winRate >= 0.9);
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    expect(cleared.length).toBeGreaterThan(0);

    const worst = cleared.reduce((slowest, entry) =>
      entry.maxSeconds > slowest.maxSeconds ? entry : slowest,
    );

    expect(
      worst.maxSeconds,
      `longest cleared fight ${worst.maxSeconds.toFixed(1)}s — ${worst.label} vs ` +
        `${worst.stage.id} — against a ${timer}s timer`,
    ).toBeLessThan(timer * 0.75);
  });

  it('finishes every fight it loses inside the clock, with room to spare', () => {
    const longest = Math.max(...[...everyFloor, ...alternates].map((entry) => entry.maxSeconds));
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    expect(longest, `longest fight ${longest.toFixed(1)}s against a ${timer}s timer`).toBeLessThan(
      timer * 0.95,
    );
  });

  it('gets harder as it is climbed', () => {
    // A tower whose top half was no harder than its bottom half would be a hundred floors of the same
    // fight. Measured as fight *length* rather than win rate, because the crew is meant to clear all
    // of it — a win rate that stays at 1.0 the whole way up is the intended shape and says nothing
    // about the ramp.
    //
    // ⚠️ **Within a band, never across two.** Each band's crew is a rung and tens of levels above the
    // one below it, so it takes its own opening floors *faster* than the band below takes its closing
    // ones — the Human band-2 roof resolves in twenty seconds where floor 100 takes twenty-four.
    // Comparing halves of the whole tower would therefore read a ramp as a decline, and the thing
    // that changed would be the party rather than the content.
    const mean = (entries: readonly Entry[]): number =>
      entries.reduce((sum, entry) => sum + entry.meanSeconds, 0) / Math.max(entries.length, 1);

    for (const tower of towers) {
      // ⚠️ **The height a tower is *expected* to have, not the height it has.** Deriving the band
      // count from `tower.floors.length` would make this a filter — it would pass forever on a tower
      // nobody went back for, which is the exact failure `PENDING` exists to prevent. A tower off the
      // list owes every band the rules describe.
      const owed = PENDING.has(tower.id) ? BANDS - 1 : BANDS;

      for (let band = 1; band <= owed; band++) {
        const mine = sampled.filter((entry) => entry.tower === tower.id && entry.band === band);

        // An empty band is a tower that lost its floors rather than one waiting for them — a PENDING
        // tower's missing band is subtracted above rather than skipped here.
        expect(mine.length, `${tower.id} band ${band} samples`).toBeGreaterThan(0);
        const half = Math.floor(mine.length / 2);

        expect(mean(mine.slice(half)), `${tower.id} band ${band} upper half`).toBeGreaterThan(
          mean(mine.slice(0, half)),
        );
      }
    }
  });
});

/** The same floors with every enemy wearing the tower's own faction. */
const mirror = (tower: TowerData, stage: StageData): StageData => ({
  ...stage,
  enemies: {
    front: stage.enemies.front.map((enemy) => ({ ...enemy, faction: tower.faction })),
    back: stage.enemies.back.map((enemy) => ({ ...enemy, faction: tower.faction })),
  },
});

/** Party members lost across a whole climb, which is what the bias actually charges. */
const losses = (tower: TowerData, bench: Bench, mirrored: boolean): number => {
  const parties = BAND_CREWS.map((_, index) => fielded(bench, index + 1));
  return floorsOf(tower).reduce((total, stage, offset) => {
    const fought = mirrored ? mirror(tower, stage) : stage;
    return total + (PARTY_SIZE - sweep(parties[bandOf(offset + 1) - 1], fought).meanSurvivors);
  }, 0);
};

/**
 * Both climbs, per tower, computed **once**.
 *
 * A full mirrored climb is a hundred floors at forty seeds, so recomputing it per assertion is four
 * thousand battles a test. Hoisting it is what keeps the whole balance project inside its timeout
 * now that there are seven towers rather than one.
 */
const BIAS = towers.map((tower) => {
  const party = crewOf(tower, CREWS);
  return {
    tower,
    biased: losses(tower, party, false),
    mirrored: losses(tower, party, true),
  };
});

/** Whether `faction` walks the celestial ascension ladder, derived rather than listed. */
const CELESTIAL = new Set(
  FACTIONS.filter((faction) => faction.ascensionPath === 'celestial').map(
    (faction) => faction.id as string,
  ),
);

/** Whether the matrix gives `faction` an edge against **itself**, which is true of exactly one. */
const selfEdged = (faction: string): boolean =>
  FACTION_MATCHUPS.some((edge) => edge.attacker === faction && edge.defender === faction);

/**
 * The counter-faction bias, measured against the counterfactual the design rejected.
 *
 * ## Why the control is a mirror match rather than another faction's five
 *
 * The obvious control — sweep the same floors with a five of the faction the enemies are drawn from —
 * measures two things at once and cannot separate them: a different five is a different party, and the
 * Undead five available at this investment is simply weaker than the Human one. It came out *slower*
 * on every floor, which says nothing about the matrix.
 *
 * So the control is the tower with **every enemy's faction rewritten to the tower's own**. That is
 * exactly the shape 15b rejected — "a mirror match, which would switch the matrix off entirely" — and
 * it changes one variable, because a mono-faction party against mono-faction enemies of its own
 * faction has no edge in either direction.
 *
 * ## Two traps, both of which the ladder's sweep already recorded
 *
 * ⚠️ **Fight length is the wrong metric here.** The matrix cuts both ways: the crew takes 5% more from
 * the Undead half of the tower *and* deals 5% more to the Monsters and Dwarves anchoring its front
 * ranks. Measured in seconds the biased tower comes out marginally **faster** (780s against 785s), so
 * an assertion in those terms would read as the bias making the tower easier. What it actually costs
 * is party members, which is what this measures.
 *
 * ⚠️ **In aggregate the effect is small, and that is the matrix working as designed.** Over a climb
 * the crew clears end to end it is worth about 5% more of the party — because 95 of the 100 floors
 * were never in doubt. Where it shows up is at a party's ceiling: on the one floor that *is* in doubt,
 * the alternate five goes from 90% on the mirror to 85% on the real thing. That is the same reading
 * `chapters.balance.ts` had to arrive at before the edges could be sized at all.
 *
 * ## ⚠️ The control is only valid for four of the seven towers, and milestone 15c is where that bit
 *
 * The mirror is a control on one premise: **a board of the crew's own faction is matchup-neutral.**
 * That premise fails twice in the shipped matrix, and both failures are documented decisions rather
 * than gaps, so each gets an assertion of its own instead of a skip.
 *
 * - **Celestials.** An Angel deals ten percent more to every mortal with nothing coming back, and the
 *   only faction that trades evenly with one is the other celestial. So an all-Angel board is the
 *   **hardest** thing an Angel five can be pointed at, and `biased > mirrored` is not merely false
 *   here, it is false by construction. That is the advantage `combat.ts` documents and prices on the
 *   luck-only ascension ladder — not something a tower may claw back — so the inversion is asserted
 *   in its own right below.
 * - **Monsters.** Monster-on-monster is the matrix's one self-edge, at ten percent. Rewriting a
 *   Monster Tower to its own faction therefore does not switch the matrix off, it turns both sides up
 *   — so the mirror is a *different* board rather than a neutral one and cannot be a control at all.
 *   The Monster Tower is authored as an even spread for the same underlying reason: everything
 *   counters Monsters. See `tower-monster.ts`.
 */
describe('the counter-faction bias', () => {
  it('costs the faction it admits more of its own party than a mirror match would', () => {
    // ⚠️ **The whole reason the enemies are biased at all.** A tower whose enemies were its own
    // faction would switch the matchup matrix off inside it, and the lock on the door would be the
    // only thing making it a *faction* tower. Deterministic rather than statistical: fixed seeds, so
    // this is a fact about the shipped content and not a sample of it.
    for (const entry of BIAS.filter(
      ({ tower }) => !CELESTIAL.has(tower.faction) && !selfEdged(tower.faction),
    )) {
      const note =
        `${entry.tower.id}: biased ${entry.biased.toFixed(1)} lost, ` +
        `mirror ${entry.mirrored.toFixed(1)}`;

      expect(entry.biased, note).toBeGreaterThan(entry.mirrored);
    }
  });

  it('inverts on the celestial towers, which is the advantage they already paid for', () => {
    // ⚠️ **Asserted rather than skipped.** A celestial five is favoured against everything mortal and
    // level with the other celestial, so its own mirror is the hardest board it has — and the two
    // celestial towers lean as hard as they legally can on the one faction that trades evenly with
    // them. Holding the inversion here is what makes a future matrix edit that removes the celestial
    // asymmetry fail loudly instead of quietly turning two towers into something else.
    for (const entry of BIAS.filter(({ tower }) => CELESTIAL.has(tower.faction))) {
      const note =
        `${entry.tower.id}: biased ${entry.biased.toFixed(1)} lost, ` +
        `mirror ${entry.mirrored.toFixed(1)}`;

      expect(entry.biased, note).toBeLessThan(entry.mirrored);
    }
  });

  it('leaves the mirror out of it entirely where the matrix has a self-edge', () => {
    // The Monster Tower's exclusion, made load-bearing rather than left as a gap in a filter: the
    // reason it is excluded is that `monster → monster` exists at all, so if that edge is ever
    // removed this fails and the tower goes back into the block above where it would then belong.
    const excluded = towers.filter((tower) => selfEdged(tower.faction));

    expect(excluded.map((tower) => tower.id)).toEqual(['tower-monster']);
  });

  it('does not make it hopeless for them', () => {
    // The other side, and the clause that keeps a tower skippable rather than unwinnable: the bias is
    // a lean, not a wall, so it may not cost the crew a large multiple of what a neutral tower would.
    // That the crew still clears every floor is asserted above; this bounds the price of getting
    // there. Applied to every tower, because "not a wall" is true whichever way the comparison runs.
    for (const entry of BIAS) {
      expect(entry.biased / Math.max(entry.mirrored, 1), entry.tower.id).toBeLessThan(1.5);
    }
  });
});
