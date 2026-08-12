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
import { TOWER_RULES, TOWERS } from './towers';

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
 * The two bands, and both crews derived rather than chosen.
 *
 * ## ⚠️ A single upgraded crew would stop this file saying anything about the low band
 *
 * The tower is two hundred floors now and the shipped hundred is the bottom half of it. A crew built
 * for the roof walks floor 40 without noticing, so the levels the first hundred carries would go
 * unmeasured on content that is already in players' hands. Two crews, split at the halfway floor,
 * is what keeps both halves watched — the same move `chapters.balance.ts` makes with BUILT /
 * ARRIVED / MARCHED / INVESTED and for the same reason.
 *
 * ## The rungs come off the level line, one from each end of it
 *
 * - **Band 1** stands at the cap that *equals* the level at the halfway floor. That floor is level
 *   60 and `rare-plus` caps at exactly 60, which is the derivation this file has always used.
 * - **Band 2** stands at the highest cap strictly *below* the top floor's level. The roof is 120 and
 *   `elite` caps at 100, so the tower closes **+20 above the rung it asks for**.
 *
 * ## ⚠️ That margin is mandatory, and milestone 21e measured why
 *
 * A rung is worth ×1.6 and **the enemy side has no rungs at all** — it climbs levels and nothing
 * else. So a crew standing at parity with the content is only a fair test at the *first* rung above
 * `rare`, which is exactly where the shipped hundred sits. At `elite-plus` (three rungs, ×4.096) a
 * party at level 140 takes the heaviest board this game can author — five `ascended` blocks with an
 * Unmade in front — at **100% with all five alive in nine seconds**. No board fixes that; the level
 * line has to.
 *
 * This is the campaign's own margin rule arriving in the towers, and it means `topLevel` can no
 * longer be a rarity cap. `towers.spec.ts` holds the margin in place of the cap match it used to
 * hold — see the note there for why the older, tighter-looking assertion was measuring nothing.
 */
const BAND_FLOORS = Math.floor(rules.floors / 2);
const BAND_1_LEVEL = floorLevel(rules, BAND_FLOORS);
const BAND_1_RARITY = (LEVEL_CURVE.caps as readonly number[]).indexOf(BAND_1_LEVEL);
const BAND_2_RARITY = (LEVEL_CURVE.caps as readonly number[]).reduce(
  (best, cap, index) => (cap < floorLevel(rules, rules.floors) ? index : best),
  0,
);
const BAND_2_LEVEL = LEVEL_CURVE.caps[BAND_2_RARITY];

/** Which crew meets a floor: the halfway floor is the last one band 1 is asked for. */
const bandOf = (floor: number): 1 | 2 => (floor <= BAND_FLOORS ? 1 : 2);

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
function at(character: CharacterData, band: 1 | 2): CombatantData {
  const rarity = band === 1 ? BAND_1_RARITY : BAND_2_RARITY;
  const level = band === 1 ? BAND_1_LEVEL : BAND_2_LEVEL;

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

const fielded = (bench: Bench, band: 1 | 2): FormationData => ({
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
  readonly band: 1 | 2;
  readonly stage: StageData;
}

function sweepTower(
  tower: TowerData,
  bench: Bench,
  label: string,
  every: number,
): readonly Entry[] {
  const floors = floorsOf(tower);
  const parties = { 1: fielded(bench, 1), 2: fielded(bench, 2) } as const;
  const entries: Entry[] = [];
  for (const [offset, stage] of floors.entries()) {
    const floor = offset + 1;
    if (floor % every !== 0 && floor !== 1 && floor !== floors.length) {
      continue;
    }
    const band = bandOf(floor);
    entries.push({ label, tower: tower.id, floor, band, stage, ...sweep(parties[band], stage) });
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

/**
 * The towers whose second hundred floors have not been authored yet.
 *
 * ⚠️ **A checklist, and it deletes itself.** `TOWER_RULES` is one rule for all seven, so the height
 * moved in a single session (21e) while the floors move in seven (21e–21k). A tower still on its
 * first hundred is not damaged — `clearedFloors` clamps to what it authors and `nextFloor` reports
 * it topped — but it has no roof, so the assertions about a roof have nothing to read.
 *
 * Each session deletes its own name here and in `towers.spec.ts`; **21k deletes both lists and this
 * comment**. A session that forgets fails loudly instead of shipping half a tower, which is the
 * whole reason this is a literal rather than a filter on the height.
 *
 * ⚠️ **Only the roof and the second band are suspended.** Floors 1–100 of all seven are swept
 * against band 1 exactly as before, because the level line barely moved under them: the new slope
 * (119/199) sits within 0.002 of the old (59/99), so ten of the seven hundred shipped floors gained
 * a single level and none of them lost a fight over it.
 */
const PENDING = new Set([
  'tower-dwarf',
  'tower-elf',
  'tower-undead',
  'tower-monster',
  'tower-angel',
  'tower-demon',
]);

const extended = towers.filter((tower) => !PENDING.has(tower.id));

/** Every floor of every tower against its own crew, for the load-bearing guards. */
const everyFloor = towers.flatMap((tower) => sweepTower(tower, crewOf(tower, CREWS), 'crew', 1));

/** The stride, for everything that measures the *shape* of the climb rather than one floor. */
const sampled = towers.flatMap((tower) => sweepTower(tower, crewOf(tower, CREWS), 'crew', STRIDE));
const alternates = towers.flatMap((tower) =>
  sweepTower(tower, crewOf(tower, ALTERNATES), 'alternate', STRIDE),
);

const topFloors = extended.map((tower) => {
  const floors = floorsOf(tower);
  const stage = floors[floors.length - 1];
  return {
    tower: tower.id,
    stage,
    ...sweep(fielded(crewOf(tower, CREWS), bandOf(floors.length)), stage),
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
    // Read over {@link extended} rather than every tower, because a tower still on its first hundred
    // has no roof to take: `floorKindAt` reads the *rules'* height, so its last authored floor is a
    // mini-boss. The count is asserted so this cannot quietly become a loop over nothing.
    expect(topFloors.length).toBeGreaterThan(0);
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
    // ⚠️ **Against the opening floor of the roof's own band, not the tower's floor 1.** The two
    // bands are fought by two different crews, so a roof measured against floor 1 would be reading a
    // fight the band-2 party never has — and the ratio would say more about the rung between them
    // than about the climb. Band 2's opener is the honest comparison and it is the same five.
    const opening = everyFloor.filter((entry) => entry.floor === BAND_FLOORS + 1);

    // One per finished tower, because band 2's opening floor is the first floor of the second
    // hundred — a tower still on {@link PENDING} has not authored it yet.
    expect(opening.length).toBe(extended.length);
    for (const top of topFloors) {
      const first = opening.find((entry) => entry.tower === top.tower);

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
    // ⚠️ **Within a band, never across the two.** A band-2 crew is a rung and forty levels above a
    // band-1 crew, so it takes its own opening floors *faster* than band 1 takes the shipped
    // hundred's closing ones — the Human roof resolves in twenty seconds where floor 100 takes
    // twenty-four. Comparing halves of the whole tower would therefore read a ramp as a decline, and
    // the thing that changed would be the party rather than the content.
    const mean = (entries: readonly Entry[]): number =>
      entries.reduce((sum, entry) => sum + entry.meanSeconds, 0) / Math.max(entries.length, 1);

    for (const tower of towers) {
      for (const band of [1, 2] as const) {
        const mine = sampled.filter((entry) => entry.tower === tower.id && entry.band === band);
        if (mine.length === 0) {
          // A tower still on its first hundred has no band 2. {@link PENDING} is what says so.
          expect(PENDING.has(tower.id), `${tower.id} band ${band}`).toBe(true);
          continue;
        }
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
  const parties = { 1: fielded(bench, 1), 2: fielded(bench, 2) } as const;
  return floorsOf(tower).reduce((total, stage, offset) => {
    const fought = mirrored ? mirror(tower, stage) : stage;
    return total + (PARTY_SIZE - sweep(parties[bandOf(offset + 1)], fought).meanSurvivors);
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
