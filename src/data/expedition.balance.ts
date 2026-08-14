// Expeditions, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it.
import { describe, expect, it } from 'vitest';
import {
  adjacentCamps,
  applyDescentBonus,
  battleSeed,
  cardOffer,
  type CharacterData,
  cheapestStaminaTo,
  type CombatantData,
  type CombatantOpening,
  type CombatRules,
  type CombatRulesData,
  type DescentBonus,
  type DescentCard,
  descentBonus,
  exitReachable,
  type ExpeditionCampData,
  expeditionLump,
  type ExpeditionMapData,
  type ExpeditionRulesData,
  type FormationData,
  type GrowthData,
  type KitRulesData,
  type LevelCurveData,
  matchedStageIndex,
  MAX_BATTLE_TICKS,
  parseExpeditionGrid,
  type PartyOpening,
  resolveExpeditionCamp,
  resolveLadder,
  simulateBattle,
  type StageData,
  stagePayout,
  toBattleCombatant,
  toCombatRules,
} from '../core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';
import { COMBAT_RULES } from './combat';
import { DESCENT_FAMILIES } from './descent';
import { EXPEDITION_MAPS, EXPEDITION_RULES } from './expedition';
import { GEAR_RULES } from './gear';
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';

/**
 * What this file is measuring, which is neither what a chapter sweep nor the Descent's measures.
 *
 * A chapter sweep asks whether one stage is clearable; the Descent's asks whether a drawn day is
 * finishable. **An Expedition is a route**: the sweep has to *play* the map — pick camps, spend the
 * budget, carry damage, take cards — because no single fight says anything about a mode whose whole
 * question is which fights to take. The route policy here is deliberately the honest floor: follow
 * the cheapest way to the exit (re-priced as camps fall), take the highest-rank card offered, retry
 * a lost fight up to three times and then give the attempt up. A player who routes better, gears
 * up, or simply levels past the anchor does better than every number in this file.
 *
 * ## What has to hold, in order of how badly it fails
 *
 * 1. ⚠️ **No fight anywhere may time out.** Same clause as the Descent's sweep, same two pressures
 *    (carried damage, amplified leech), and here a timeout reads as an inexplicable defeat on a
 *    fight the player will immediately retry — the worst kind of wall.
 * 2. **Every map must be completable at every depth from the unlock up** — a floor is a route that
 *    exists; free retries make persistence cheap, but a map the reference policy cannot finish at
 *    all is a door the mode's sequential unlock then locks forever.
 * 3. **The last map has to be a commitment and the first has to be a welcome.** Measured at the
 *    unlock: the Ford finishes every attempt, the Spine finishes half of them — the same figure the
 *    Descent ships at that depth.
 *
 * ## The reference party is bisected, never solved
 *
 * The investment that just clears the campaign stage the mode anchors on — the same calibration
 * `descent.balance.ts` argues for, minus the faction lock, because this mode has none. No gear, no
 * signature items, so every figure here is a floor on the real experience rather than an estimate.
 */

const growth: GrowthData = GROWTH;
const kit: KitRulesData = KIT_RULES;
const levels: LevelCurveData = LEVEL_CURVE;
const rules: CombatRules = toCombatRules(COMBAT_RULES satisfies CombatRulesData);
const expedition: ExpeditionRulesData = EXPEDITION_RULES;
const maps: readonly ExpeditionMapData[] = EXPEDITION_MAPS;

const stages: readonly StageData[] = resolveLadder(
  CHAPTERS,
  CHAPTER_CURVE,
  STAGE_REWARDS,
  GEAR_RULES,
);
const campaignLevels: readonly number[] = stages.map((stage) => stage.level);

/** One seed for the whole file, for `descent.balance.ts`'s reason: two spellings measure two modes. */
const SEED = 0xe7ed1;

/** Attempts per map per depth. A route is five to seven fights, so this is already hundreds. */
const ATTEMPTS = 10;

/** Losses on one camp before the attempt is given up — the sweep's proxy for a player's patience. */
const RETRIES_PER_CAMP = 3;

function chapterEnd(chapter: number): number {
  return CHAPTERS.slice(0, chapter).reduce((sum, entry) => sum + entry.stages.length, 0);
}

/**
 * The campaign depths the mode is checked at. The first is the unlock, derived from the rules so
 * moving the gate re-aims the sweep — the same discipline `descent.balance.ts` records.
 */
const DEPTHS: readonly number[] = [
  chapterEnd(expedition.unlockChapters),
  chapterEnd(5),
  chapterEnd(7),
  stages.length,
];

function anchorAt(cleared: number): number {
  return campaignLevels[Math.min(Math.max(cleared, 1), campaignLevels.length) - 1];
}

function rarityFor(level: number): number {
  for (let rarity = 0; rarity < levels.caps.length; rarity++) {
    if (levels.caps[rarity] >= level) {
      return rarity;
    }
  }
  return levels.caps.length - 1;
}

/**
 * The reference five: the first two tanks or brawlers in authored order up front, the first three
 * of everything else behind — the same arbitrary-but-constant choice the Descent's sweep makes, so
 * a failing map is a fact about the map rather than about a lineup the sweep happened to like.
 */
function partyFor(
  investment: { rarity: number; level: number },
  bonusFor?: (faction: string) => DescentBonus,
): FormationData {
  const isFront = (character: CharacterData): boolean =>
    character.role === 'tank' || character.role === 'brawler';
  const front = CHARACTERS.filter(isFront).slice(0, 2);
  const back = CHARACTERS.filter((character) => !isFront(character)).slice(0, 3);
  const build = (character: CharacterData): CombatantData => {
    const built = toBattleCombatant(
      character,
      {
        defId: character.id,
        rarity: investment.rarity,
        level: investment.level,
        copies: 0,
        gear: {},
        signature: 0,
      },
      growth,
      kit,
      investment.level,
    );
    return bonusFor === undefined
      ? built
      : { ...built, stats: applyDescentBonus(built.stats, bonusFor(character.faction)) };
  };
  return { front: front.map(build), back: back.map(build) };
}

/** The factions the reference five fields — what the card offer is filtered by in play. */
const PARTY_FACTIONS: readonly string[] = (() => {
  const sample = partyFor({ rarity: 0, level: 1 });
  const ids = new Set([...sample.front, ...sample.back].map((member) => member.id));
  return [
    ...new Set(CHARACTERS.filter((entry) => ids.has(entry.id)).map((entry) => entry.faction)),
  ];
})();

const CALIBRATION_SEEDS = 8;
const investments = new Map<number, { rarity: number; level: number }>();

/** Bisected against the real anchor stage — see the file comment and `descent.balance.ts`. */
function investmentFor(cleared: number): { rarity: number; level: number } {
  const hit = investments.get(cleared);
  if (hit !== undefined) {
    return hit;
  }
  const stage = stages[Math.min(Math.max(cleared, 1), stages.length) - 1];
  const clears = (level: number): boolean => {
    const party = partyFor({ rarity: rarityFor(level), level });
    let wins = 0;
    for (let attempt = 0; attempt < CALIBRATION_SEEDS; attempt++) {
      if (
        simulateBattle(party, stage, battleSeed(0xca11b, stage.id, attempt), rules).outcome ===
        'victory'
      ) {
        wins++;
      }
    }
    return wins / CALIBRATION_SEEDS >= 0.9;
  };
  let low = 1;
  let high = levels.maxLevel;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (clears(mid)) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  const found = { rarity: rarityFor(low), level: low };
  investments.set(cleared, found);
  return found;
}

/** Cheapest remaining stamina to open the exit, with already-cleared camps priced at nothing. */
function exitCostAfter(map: ExpeditionMapData, cleared: ReadonlySet<string>): number | null {
  const discounted: ExpeditionMapData = {
    ...map,
    camps: map.camps.map((camp) => (cleared.has(camp.cell) ? { ...camp, stamina: 0 } : camp)),
  };
  return cheapestStaminaTo(discounted, { kind: 'exit' });
}

/** What one attempt came to. */
interface AttemptResult {
  readonly finished: boolean;
  readonly losses: number;
  /** Bodies standing after the last won fight. */
  readonly survivors: number;
  readonly maxSeconds: number;
  readonly timedOut: number;
}

/** The surviving party rebuilt so the newest cards reach it — `descent.balance.ts`'s seam. */
function restand(
  standing: FormationData,
  investment: { rarity: number; level: number },
  bonusFor?: (faction: string) => DescentBonus,
): FormationData {
  const rebuilt = partyFor(investment, bonusFor);
  const alive = new Set([...standing.front, ...standing.back].map((member) => member.id));
  return {
    front: rebuilt.front.filter((member) => alive.has(member.id)),
    back: rebuilt.back.filter((member) => alive.has(member.id)),
  };
}

/**
 * Plays one attempt end to end: route greedily toward the exit, fight, carry, choose.
 *
 * `offsetShift` exists for the control that proves this sweep can move — see the note on the
 * assertion. ⚠️ **It reaches the resolved stage through `resolveExpeditionCamp`'s own input**, not
 * through an override a later refactor could strand: the Descent's sweep shipped an override that
 * reached one function and not the other, every row of a five-setting sweep printed identically,
 * and the lesson was written down as "add an assertion wherever a sweep takes an override".
 */
function runAttempt(
  map: ExpeditionMapData,
  cleared0: number,
  attemptIndex: number,
  useCards: boolean,
  offsetShift = 0,
): AttemptResult {
  const anchor = anchorAt(cleared0);
  const investment = investmentFor(cleared0);
  const grid = parseExpeditionGrid(map);
  const budget = map.stamina;

  const cards: DescentCard[] = [];
  let carried: PartyOpening = new Map<string, CombatantOpening>();
  let standing: FormationData | null = null;
  const clearedCamps = new Set<string>();
  let spent = 0;
  let fightIndex = 0;
  let losses = 0;
  let survivors = 5;
  let longest = 0;
  let timedOut = 0;

  while (!exitReachable(grid, clearedCamps)) {
    const beside = adjacentCamps(grid, clearedCamps);
    const candidates = map.camps.filter(
      (camp) => beside.has(camp.cell) && camp.stamina <= budget - spent,
    );
    let best: ExpeditionCampData | null = null;
    let bestTotal = Infinity;
    for (const camp of candidates) {
      const after = exitCostAfter(map, new Set([...clearedCamps, camp.cell]));
      if (after === null) {
        continue;
      }
      const total = camp.stamina + after;
      if (spent + total > budget) {
        continue;
      }
      if (
        total < bestTotal ||
        (total === bestTotal && camp.stamina < (best?.stamina ?? Infinity))
      ) {
        best = camp;
        bestTotal = total;
      }
    }
    if (best === null) {
      return { finished: false, losses, survivors, maxSeconds: longest, timedOut };
    }

    const tuned = { ...best, levelOffset: best.levelOffset + offsetShift };
    const lump = expeditionLump(
      expedition,
      stagePayout(STAGE_REWARDS, matchedStageIndex(campaignLevels, anchor + tuned.levelOffset))
        .reward,
    );
    const stage = resolveExpeditionCamp(map, tuned, anchor, lump);

    let won = false;
    for (let retry = 0; retry < RETRIES_PER_CAMP && !won; retry++) {
      const bonus = useCards
        ? (faction: string) => descentBonus(expedition, cards, faction)
        : undefined;
      const party: FormationData =
        standing === null ? partyFor(investment, bonus) : restand(standing, investment, bonus);
      const result = simulateBattle(
        party,
        stage,
        battleSeed(SEED, stage.id, attemptIndex * 1000 + fightIndex * 10 + retry),
        rules,
        carried,
      );
      fightIndex++;
      longest = Math.max(longest, result.ticks / 10);
      if (result.timedOut) {
        timedOut++;
      }
      if (result.outcome !== 'victory') {
        losses++;
        continue;
      }
      won = true;
      const next = new Map<string, CombatantOpening>();
      const alive = new Set<string>();
      for (const fighter of result.final) {
        if (fighter.side !== 'ally' || fighter.hp.lte(0)) {
          continue;
        }
        alive.add(fighter.defId);
        next.set(fighter.defId, {
          health: Math.min(Math.max(fighter.hp.div(fighter.maxHp).toNumber(), 0), 1),
          energy: fighter.energy,
        });
      }
      carried = next;
      survivors = alive.size;
      standing = {
        front: party.front.filter((member) => alive.has(member.id)),
        back: party.back.filter((member) => alive.has(member.id)),
      };
    }
    if (!won) {
      return { finished: false, losses, survivors, maxSeconds: longest, timedOut };
    }
    clearedCamps.add(best.cell);
    spent += best.stamina;

    if (useCards) {
      const offer = cardOffer(
        expedition,
        DESCENT_FAMILIES,
        PARTY_FACTIONS,
        SEED,
        `expedition:cards:${map.id}:${attemptIndex}:${cards.length}`,
        Math.min(spent / budget, 1),
        cards,
      );
      let taken = offer[0];
      for (const card of offer) {
        if (taken === undefined || card.rank > taken.rank) {
          taken = card;
        }
      }
      if (taken !== undefined) {
        cards.push(taken);
      }
    }
  }
  return { finished: true, losses, survivors, maxSeconds: longest, timedOut };
}

/** Every attempt at one map and depth, folded into one reading. Cached — the file re-reads it. */
const readings = new Map<string, ReturnType<typeof fold>>();

function fold(runs: readonly AttemptResult[]) {
  return {
    finished: runs.filter((run) => run.finished).length / runs.length,
    meanSurvivors: runs.reduce((sum, run) => sum + run.survivors, 0) / runs.length,
    maxSeconds: Math.max(...runs.map((run) => run.maxSeconds)),
    timedOut: runs.reduce((sum, run) => sum + run.timedOut, 0),
  };
}

function measure(map: ExpeditionMapData, depth: number, useCards = true, offsetShift = 0) {
  const key = `${map.id}|${depth}|${useCards}|${offsetShift}`;
  const hit = readings.get(key);
  if (hit !== undefined) {
    return hit;
  }
  const found = fold(
    Array.from({ length: ATTEMPTS }, (_, index) =>
      runAttempt(map, depth, index, useCards, offsetShift),
    ),
  );
  readings.set(key, found);
  return found;
}

describe('an Expedition fight resolves', () => {
  it('never runs the ninety-second clock out, at any depth on any map', () => {
    // ⚠️ The load-bearing assertion — see the file comment. Measured: zero, everywhere.
    for (const map of maps) {
      for (const depth of DEPTHS) {
        expect(measure(map, depth).timedOut, `${map.id} depth ${depth}`).toBe(0);
      }
    }
  });

  it('leaves real headroom over the timer on every fight', () => {
    // Longest fight measured anywhere: 25.5s against the 81s bar — the mode fights at and below
    // the anchor, so its fights resolve faster than the campaign stage the anchor names.
    const bar = (MAX_BATTLE_TICKS / 10) * 0.9;
    for (const map of maps) {
      for (const depth of DEPTHS) {
        expect(measure(map, depth).maxSeconds, `${map.id} depth ${depth}`).toBeLessThan(bar);
      }
    }
  });
});

describe('the arc across the three maps', () => {
  it('welcomes at the Ford and the Causeway: finished at every depth, from the unlock up', () => {
    // Measured 1.00 everywhere for both. The floor is set below that so a character retune does
    // not flip the suite over a single unlucky seed, but these two are the mode's on-ramp and a
    // reading under 0.9 here is a real regression, not noise.
    for (const map of maps.slice(0, 2)) {
      for (const depth of DEPTHS) {
        expect(measure(map, depth).finished, `${map.id} depth ${depth}`).toBeGreaterThanOrEqual(
          0.9,
        );
      }
    }
  });

  it('makes the Spine a commitment at the unlock and a completion by mid-campaign', () => {
    // Measured 0.50 / 0.80 / 1.00 / 1.00 across the four depths — the unlock figure is the same
    // 0.50 the Descent ships at that depth, reached the same way (three-retry patience, no gear).
    // ⚠️ The first draft measured 0.00 at two depths and the fix was **weight, not level**: the
    // route stacked four guardian-weight boards in a row, and offsets moved the reading barely at
    // all until the mid-route camps were rebuilt to a one-to-three-anchor ramp.
    const spine = maps[2];
    expect(measure(spine, DEPTHS[0]).finished).toBeGreaterThanOrEqual(0.3);
    expect(measure(spine, DEPTHS[1]).finished).toBeGreaterThanOrEqual(0.6);
    expect(measure(spine, DEPTHS[2]).finished).toBeGreaterThanOrEqual(0.9);
    expect(measure(spine, DEPTHS[3]).finished).toBeGreaterThanOrEqual(0.9);
  });

  it('orders the maps: nothing earlier is harder than anything later, at the unlock', () => {
    const rates = maps.map((map) => measure(map, DEPTHS[0]).finished);
    for (let index = 1; index < rates.length; index++) {
      expect(rates[index], maps[index].id).toBeLessThanOrEqual(rates[index - 1] + 1e-9);
    }
  });

  it('makes attrition real where the mode is meant to bite', () => {
    // A run that ends with five bodies at full strength is a mode whose cards and carried damage
    // mean nothing. Measured at the unlock: 4.10 on the Causeway, 2.90 on the Spine.
    expect(measure(maps[1], DEPTHS[0]).meanSurvivors).toBeLessThan(5);
    expect(measure(maps[2], DEPTHS[0]).meanSurvivors).toBeLessThan(4);
  });
});

describe('the sweep itself can move', () => {
  it('measures a much harder setting as harder', () => {
    // ⚠️ Permanent, and the Descent's milestone wrote down why: a tuning sweep whose override
    // reaches nothing prints identical rows for every setting and reads as "the dial does
    // nothing". Eighteen levels is about ×1.45 of enemy power — measured, it takes the Spine's
    // unlock finish rate from 0.50 to 0.00.
    const shipped = measure(maps[2], DEPTHS[0]);
    const harder = measure(maps[2], DEPTHS[0], true, 18);

    expect(harder.finished).toBeLessThan(shipped.finished);
  });

  it('measures the cards as worth taking', () => {
    // The same run at the top of the shipped campaign, with and without cards: 4.80 against 4.10
    // mean survivors. The margin is the point — cards are a lean, not a solution, exactly as the
    // Descent tuned them.
    const carded = measure(maps[2], DEPTHS[3], true);
    const bare = measure(maps[2], DEPTHS[3], false);

    expect(carded.meanSurvivors).toBeGreaterThanOrEqual(bare.meanSurvivors);
    expect(carded.finished).toBeGreaterThanOrEqual(bare.finished);
  });
});
