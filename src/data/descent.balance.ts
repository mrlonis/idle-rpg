// The Descent, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type CharacterData,
  type CombatantData,
  type CombatantOpening,
  type CombatRules,
  type CombatRulesData,
  dailyDescentFactions,
  type DescentBonus,
  type DescentCard,
  descentBoards,
  descentBonus,
  descentChoices,
  descentFightAt,
  descentFights,
  type DescentFamilyData,
  descentLevel,
  descentLump,
  descentOffer,
  type DescentRulesData,
  type FormationData,
  type GrowthData,
  type KitRulesData,
  applyDescentBonus,
  type LevelCurveData,
  matchedStageIndex,
  MAX_BATTLE_TICKS,
  num,
  type PartyOpening,
  resolveDescentFight,
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
import { DESCENT_BOARDS, DESCENT_FAMILIES, DESCENT_RULES } from './descent';
import { GEAR_RULES } from './gear';
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';

/**
 * What this file is measuring, which is not what a chapter sweep measures.
 *
 * A chapter sweep asks whether one authored stage is clearable by one party. **The Descent has no
 * such thing**: what it authors is a pool, the day draws nine of it, the enemy level is read off
 * whatever campaign the run has already beaten, and the party changes shape as it goes. So every
 * assertion here is over a **whole run**, and over several days, at several depths of the campaign.
 *
 * ## Three things this has to hold, in order of how badly they fail
 *
 * 1. ⚠️ **No fight anywhere may time out.** Two of the mode's own mechanics push toward it — a
 *    party carrying eight fights' worth of damage takes longer to kill things, and Bloodthirst
 *    siphons damage the closing pressure is amplifying. A timeout costs a life, and a run has two.
 * 2. **A run has to be finishable at every depth**, by the party that depth implies, without being
 *    a walkover at any of them.
 * 3. **Attrition has to be real.** If a run ends with five bodies at full health the mode is nine
 *    unrelated fights with a shared reward, and none of its decisions mean anything.
 *
 * ## The party is derived, never authored
 *
 * A day's lock names three factions and the party is drawn from them, at the rung and level the
 * campaign depth implies. ⚠️ **That is the only honest reference party this mode can have** — a
 * fixed five would be measuring one seventh of the days, and which seventh would depend on a
 * shuffle nobody chose.
 */

const growth: GrowthData = GROWTH;
const kit: KitRulesData = KIT_RULES;
const levels: LevelCurveData = LEVEL_CURVE;
const rules: CombatRules = toCombatRules(COMBAT_RULES satisfies CombatRulesData);
const descent: DescentRulesData = DESCENT_RULES;
const families: readonly DescentFamilyData[] = DESCENT_FAMILIES;

/** The campaign, resolved exactly as `ui/content.ts` resolves it — the Descent reads its levels. */
const stages: readonly StageData[] = resolveLadder(
  CHAPTERS,
  CHAPTER_CURVE,
  STAGE_REWARDS,
  GEAR_RULES,
);
const campaignLevels: readonly number[] = stages.map((stage) => stage.level);

const FIGHTS = descentFights(descent);
const CHOICES = descentChoices(descent);

/**
 * Seeds per run.
 *
 * Fewer than a chapter sweep's forty, and the reason is that a *run* is nine battles rather than
 * one — so twelve days at four depths is already over four thousand fights. What buys the
 * resolution back is that this measures a run's outcome rather than a stage's win rate: a run that
 * finishes 11 days in 12 and one that finishes 40 times in 40 are not different findings.
 */
const DAYS = 20;

/**
 * The seed every run in this file is drawn from.
 *
 * One constant rather than a literal at each call site, because the day's boards, the day's faction
 * lock and every card offer are functions of it — two spellings would be two different modes being
 * measured in one file.
 */
const SEED = 0xd35ce7;

/**
 * The campaign depths the mode is checked at, as clear counts.
 *
 * ⚠️ **Five rather than one, and that is the cost of deriving the level from progress.** A tower's
 * level line is fixed, so its sweep checks one thing; this one moves with the campaign, so a
 * setting that works at the unlock and fails at four hundred clears is a setting that ships broken
 * for everybody who plays past it. The five run from the chapter the mode opens on to the top of
 * the shipped ladder.
 *
 * ⚠️ **The first is the unlock and it is derived from `DESCENT_RULES.unlockChapters`**, so moving
 * the unlock re-aims this instead of leaving it measuring a depth nobody can reach. Everything
 * below the unlock is deliberately unmeasured — the mode does not exist there.
 */
const DEPTHS: readonly number[] = [
  chapterEnd(descent.unlockChapters),
  chapterEnd(descent.unlockChapters + 1),
  chapterEnd(5),
  chapterEnd(7),
  stages.length,
];

/** Stages through the end of chapter `chapter`. */
function chapterEnd(chapter: number): number {
  return CHAPTERS.slice(0, chapter).reduce((sum, entry) => sum + entry.stages.length, 0);
}

/** The enemy level of the hardest stage a run with `cleared` clears has beaten. */
function anchorAt(cleared: number): number {
  return campaignLevels[Math.min(Math.max(cleared, 1), campaignLevels.length) - 1];
}

/** The cheapest rung whose cap admits `level`. */
function rarityFor(level: number): number {
  for (let rarity = 0; rarity < levels.caps.length; rarity++) {
    if (levels.caps[rarity] >= level) {
      return rarity;
    }
  }
  return levels.caps.length - 1;
}

/** Seeds per step of the calibration bisection. Enough to tell a clear from a coin flip. */
const CALIBRATION_SEEDS = 8;
const investments = new Map<string, { rarity: number; level: number }>();

/**
 * The investment a Descent five of `lock` needs to just clear the campaign stage it anchors on.
 *
 * ⚠️ **Bisected against the real stage, never solved.** Two closed forms were tried and both were
 * wrong, in opposite directions. "The highest rung whose cap sits below the anchor" is what the
 * campaign's margin rule implies and it lags badly through the early chapters, where a party is
 * *above* the rung its content asks for; power parity on `perLevel.common` is right in shape and
 * wrong in size, because enemy blocks climb `perLevel.legendary` and `perLevel.ascended` and that
 * gap compounds over the whole level rather than over a chapter. Milestone 21b recorded the same
 * finding about the campaign's own margin rule and reached the same conclusion: **bisect; do not
 * solve.**
 *
 * Cached per lock and depth, because the bisection is ten steps of eight fights and the sweep asks
 * for the same handful of locks over and over.
 */
function investmentFor(
  cleared: number,
  lock: readonly string[],
): { rarity: number; level: number } {
  const key = `${cleared}|${lock.join(',')}`;
  const hit = investments.get(key);
  if (hit !== undefined) {
    return hit;
  }
  const stage = stages[Math.min(Math.max(cleared, 1), stages.length) - 1];
  const clears = (level: number): boolean => {
    const party = partyFor(lock, { rarity: rarityFor(level), level });
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
  investments.set(key, found);
  return found;
}

/**
 * A five drawn from today's three factions, at the investment the depth implies.
 *
 * Two in front and three behind, and the split is by **role** rather than by stat: `tank` and
 * `brawler` stand in front, everything else behind, which is what a player would do and what the
 * gear archetypes already encode. Within that it takes the first of each in authored order, which
 * is arbitrary and — crucially — the same arbitrary choice on every day, so a run that fails is a
 * fact about the boards rather than about which five the sweep happened to like.
 */
function partyFor(
  lock: readonly string[],
  investment: { rarity: number; level: number },
  bonusFor?: (faction: string) => DescentBonus,
): FormationData {
  const pool = CHARACTERS.filter((character) => lock.includes(character.faction));
  const isFront = (character: CharacterData): boolean =>
    character.role === 'tank' || character.role === 'brawler';
  const front = pool.filter(isFront).slice(0, 2);
  const back = pool.filter((character) => !isFront(character)).slice(0, 3);

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

/** Today's nine fights, resolved into the stages the simulation takes. */
function runStages(
  seed: number,
  day: number,
  anchor: number,
  tuned: DescentRulesData = descent,
): readonly StageData[] {
  return descentBoards(tuned, DESCENT_BOARDS, seed, day).map((board, offset) => {
    const fight = offset + 1;
    const level = descentLevel(tuned, anchor, fight);
    const lump = descentLump(
      descent,
      stagePayout(STAGE_REWARDS, matchedStageIndex(campaignLevels, level)).reward,
    );
    return resolveDescentFight(tuned, board, fight, anchor, lump);
  });
}

/** What one whole run came to. */
interface RunResult {
  /** Fights won before the run ended. */
  readonly cleared: number;
  readonly finished: boolean;
  /** Bodies still standing at the end. */
  readonly survivors: number;
  /** The longest single fight, in seconds. */
  readonly maxSeconds: number;
  /** Fights that ran the ninety seconds out rather than ending in a death. */
  readonly timedOut: number;
  /** Cards taken, in order. */
  readonly cards: readonly DescentCard[];
}

/**
 * How the sweep picks a card.
 *
 * ⚠️ **Greedy on the highest rank, ties broken by the offer's own order — deliberately not
 * "optimally".** A policy that knew which family was strongest would measure the ceiling of the
 * mode rather than the middle of it, and the thing being asserted is that a run is finishable
 * *without* solving it. It is also the policy a player who is not thinking hard would follow, which
 * is the honest floor.
 */
function pick(offer: readonly DescentCard[]): DescentCard | undefined {
  let best = offer[0];
  for (const card of offer) {
    if (best === undefined || card.rank > best.rank) {
      best = card;
    }
  }
  return best;
}

/** Runs one whole day end to end, taking a card after every win. */
function runDay(
  seed: number,
  day: number,
  cleared: number,
  useCards = true,
  tuned: DescentRulesData = descent,
): RunResult {
  const anchor = anchorAt(cleared);
  const lock = dailyDescentFactions(
    descent,
    [...new Set(CHARACTERS.map((character) => character.faction))],
    seed,
    day,
  );
  const investment = investmentFor(cleared, lock);
  const boards = runStages(seed, day, anchor, tuned);

  const cards: DescentCard[] = [];
  // Health as a fraction and energy in points, exactly as a run stores them — this is the loop the
  // mode *is*, and running it any other way would measure a mode nobody plays.
  let carried = new Map<string, CombatantOpening>();
  let standing: FormationData | null = null;
  let lives = descent.lives;
  let won = 0;
  let survivors = 0;
  let longest = 0;
  let timedOut = 0;

  for (let fight = 1; fight <= FIGHTS && lives > 0;) {
    const bonus = useCards ? (faction: string) => descentBonus(descent, cards, faction) : undefined;
    const party: FormationData =
      standing === null
        ? partyFor(lock, investment, bonus)
        : restand(standing, lock, investment, bonus);
    const opening: PartyOpening = carried;
    const stage = boards[fight - 1];
    const result = simulateBattle(
      party,
      stage,
      battleSeed(seed, stage.id, day * 100 + fight),
      rules,
      opening,
    );
    longest = Math.max(longest, result.ticks / 10);
    if (result.timedOut) {
      timedOut++;
    }
    if (result.outcome !== 'victory') {
      lives--;
      continue;
    }

    won = fight;
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

    if (useCards && fight <= CHOICES) {
      const offer = descentOffer(descent, families, lock, seed, day, CHOICES, cards.length, cards);
      const taken = pick(offer);
      if (taken !== undefined) {
        cards.push(taken);
      }
    }
    fight++;
  }

  return {
    cleared: won,
    finished: won >= FIGHTS,
    survivors,
    maxSeconds: longest,
    timedOut,
    cards,
  };
}

/**
 * The surviving party, rebuilt so the run's newest cards reach it.
 *
 * ⚠️ **Rebuilt rather than reused, because a card is folded into the stat block** — the same seam
 * `FormationService.resolveParty` uses, and the reason nothing in `simulateBattle` knows the mode
 * exists. Keeping last fight's combatants would silently measure a run whose cards stopped applying
 * after the first one.
 */
function restand(
  standing: FormationData,
  lock: readonly string[],
  investment: { rarity: number; level: number },
  bonusFor?: (faction: string) => DescentBonus,
): FormationData {
  const rebuilt = partyFor(lock, investment, bonusFor);
  const alive = new Set([...standing.front, ...standing.back].map((member) => member.id));
  return {
    front: rebuilt.front.filter((member) => alive.has(member.id)),
    back: rebuilt.back.filter((member) => alive.has(member.id)),
  };
}

/** Every day at one depth, folded into one reading. */
function sweepDepth(cleared: number, useCards = true) {
  const runs = Array.from({ length: DAYS }, (_, day) => runDay(SEED, day, cleared, useCards));
  return {
    finished: runs.filter((run) => run.finished).length / runs.length,
    meanCleared: runs.reduce((sum, run) => sum + run.cleared, 0) / runs.length,
    meanSurvivors: runs.reduce((sum, run) => sum + run.survivors, 0) / runs.length,
    maxSeconds: Math.max(...runs.map((run) => run.maxSeconds)),
    timedOut: runs.reduce((sum, run) => sum + run.timedOut, 0),
    runs,
  };
}

describe('a Descent run resolves', () => {
  it('never runs the ninety-second clock out, at any depth', () => {
    // ⚠️ **The load-bearing assertion in this file, and the mode pushes on it from two sides.** A
    // party carrying eight fights of damage kills more slowly, and Bloodthirst siphons damage that
    // closing pressure is amplifying without amplifying the healing. A timeout is a defeat on
    // screen, it costs one of two lives, and nothing tells the player why.
    for (const cleared of DEPTHS) {
      expect(sweepDepth(cleared).timedOut, `depth ${cleared}`).toBe(0);
    }
  });

  it('leaves real headroom over the timer on the fights it wins', () => {
    // The same margin the campaign holds itself to. A run's fights are shorter than a chapter's
    // because the party is above the level it is fighting at; what this watches is the tail.
    const bar = (MAX_BATTLE_TICKS / 10) * 0.9;
    for (const cleared of DEPTHS) {
      expect(sweepDepth(cleared).maxSeconds, `depth ${cleared}`).toBeLessThan(bar);
    }
  });
});

describe('a Descent run is a fight at every depth', () => {
  it('is finishable by the party the depth implies', () => {
    // Not "always finishable". Two lives and nine fights means a bad draw can end a run, which is
    // the whole reason the retry exists — but a mode a player rarely finishes is a daily they stop
    // opening, and the quest measured against it is one they can never claim.
    //
    // Measured over twenty days: **0.50 at the unlock, then 0.85 / 0.70 / 0.85 / 0.80**. ⚠️ **The
    // per-depth floor is deliberately below the worst reading and the mean is what carries the
    // claim** — the bisection that calibrates a party lands on a step, so a single depth can sit a
    // level either side of where a real player stands, and a tight per-depth bar would be measuring
    // that step rather than the mode.
    //
    // ⚠️ **Those figures moved in milestone 27** — they read 0.50 / 0.90 / 0.85 / 1.00 / 1.00 under
    // the flat level offset, and the two 1.00s are the tell: the deep end had stopped being a fight
    // at all. See {@link DescentLevelData.anchorSlope}.
    //
    // ⚠️ **The party here carries no gear and no signature items**, where a real player at these
    // depths carries both. So this is a floor on the real finish rate rather than an estimate of it.
    const rates = DEPTHS.map((cleared) => sweepDepth(cleared).finished);
    for (const [index, rate] of rates.entries()) {
      expect(rate, `depth ${DEPTHS[index]} finish rate`).toBeGreaterThanOrEqual(0.4);
    }
    expect(rates.reduce((sum, rate) => sum + rate, 0) / rates.length).toBeGreaterThanOrEqual(0.6);
  });

  it('gets most of the way down even when it does not finish', () => {
    // What makes a lost run acceptable: every fight pays as it is cleared, so a run that ends at
    // fight eight has banked eight fights. Measured at **7.85 to 8.70** of nine.
    for (const cleared of DEPTHS) {
      expect(sweepDepth(cleared).meanCleared, `depth ${cleared}`).toBeGreaterThan(FIGHTS * 0.75);
    }
  });

  it('is not a walkover at any depth', () => {
    // ⚠️ **Attrition is the mechanic, so this measures survivors rather than the win rate.** A run
    // finished with five bodies at full health is nine unrelated fights with a shared reward, and
    // every decision in it was free. Measured at **3.20 to 4.15** of five, averaging **3.84**.
    //
    // ⚠️ **The mean carries the claim and the per-depth bar is the backstop**, for the reason the
    // finish rate is stated the same way: the bisection that calibrates a party lands on a step, so
    // one depth can sit a level either side of where a real player stands. A tight per-depth bar
    // would be measuring that step.
    //
    // ## ⚠️ This is the guard that caught the flat level offset, and the bar was **not** widened
    //
    // It went 4.75 → 4.85 once, when the campaign flattened, on a plateau argument. Chapter 12 sent
    // it past 4.85 again — depth 500 read a clean **5.00**, nobody ever dying — and the readings
    // across the five depths were **3.20 / 4.15 / 4.15 / 4.80 / 5.00**: monotonic in depth, with
    // depth 250 already one hundredth under the bar before that chapter existed.
    //
    // **A monotonic quantity cannot be bounded by a constant**, so a third widening would have been
    // the guard measuring a drift rather than the mode. What it was actually reporting is that the
    // Descent got easier the deeper it went, because the level offset was flat while the party the
    // depth implies is not a fixed distance from the anchor. `anchorSlope` is the fix and the
    // readings above are flat across depth rather than climbing. **The bar stayed at 4.85.**
    //
    // ⚠️ **Neither the boards nor chapter 12 were touched for this.** A boss cut by 30%, every
    // escort swap and dropping both of that chapter's suppressions all left the calibration exactly
    // where it was; the only lever that moved anything was the one that was the wrong shape.
    const survivors = DEPTHS.map((cleared) => sweepDepth(cleared).meanSurvivors);
    for (const [index, mean] of survivors.entries()) {
      expect(mean, `depth ${DEPTHS[index]} survivors`).toBeLessThan(4.85);
    }
    expect(survivors.reduce((sum, mean) => sum + mean, 0) / survivors.length).toBeLessThan(4.4);
  });

  it('answers the level dial at all', () => {
    // ⚠️ **A guard against the sweep's own plumbing, and it is here because the plumbing broke.**
    // Retuning the offsets means running this file with an overridden `level`, and the override has
    // to reach `resolveDescentFight` as well as `descentLevel` — the first attempt threaded it
    // through one and not the other, and **every row of a five-setting sweep printed identically**.
    // A tuning sweep that cannot move is worse than no sweep: it reads as "the dial does nothing",
    // which is a conclusion somebody would act on.
    // Slope held at the shipped value so this moves the one dial it is named for. Overriding the
    // whole `level` block is what makes that explicit rather than inherited.
    const harder: DescentRulesData = {
      ...descent,
      level: { baseOffset: 40, topOffset: 60, anchorSlope: descent.level.anchorSlope },
    };
    const runs = Array.from({ length: DAYS }, (_, day) =>
      runDay(SEED, day, DEPTHS[DEPTHS.length - 1], true, harder),
    );

    expect(runs.filter((run) => run.finished).length / runs.length).toBeLessThan(
      sweepDepth(DEPTHS[DEPTHS.length - 1]).finished,
    );
  });

  it('gets harder as it goes down rather than only longer', () => {
    // The floors escalate in weight and the level line climbs across the run, so the fights a run
    // loses should cluster at the bottom. Measured as "the last floor is where runs end", which is
    // what makes the third floor worth authoring differently from the first.
    const ends = DEPTHS.flatMap((cleared) =>
      sweepDepth(cleared)
        .runs.filter((run) => !run.finished)
        .map((run) => run.cleared),
    );
    if (ends.length === 0) {
      // Nothing failed anywhere, which the finish-rate test above already permits. Nothing to say.
      return;
    }
    expect(ends.reduce((sum, at) => sum + at, 0) / ends.length).toBeGreaterThan(FIGHTS / 3);
  });
});

describe('the cards are worth taking', () => {
  it('carries a run further than the same run without them', () => {
    // ⚠️ **The one assertion that measures the cards rather than the boards**, and it is stated as
    // a comparison rather than as a threshold for the reason `signature.balance.ts` bisects for
    // reach: any fixed level is a walkover or a wipe, and only the *difference* between two runs of
    // the same nine boards says what the cards did.
    const withCards = sweepDepth(DEPTHS[DEPTHS.length - 1], true);
    const without = sweepDepth(DEPTHS[DEPTHS.length - 1], false);

    expect(withCards.meanCleared).toBeGreaterThan(without.meanCleared);
  });

  it('hands out a card after every win but the last', () => {
    for (const run of sweepDepth(DEPTHS[DEPTHS.length - 1]).runs) {
      expect(run.cards.length).toBe(Math.min(run.cleared, CHOICES));
    }
  });

  it('never offers a family below a rung the run already holds', () => {
    // ⚠️ The repeat rule, measured through the draw rather than trusted from the content. A family
    // coming back *lower* still reads as a reward on screen and is a downgrade the player pays a
    // choice for.
    for (const run of sweepDepth(DEPTHS[DEPTHS.length - 1]).runs) {
      const highest = new Map<string, number>();
      for (const card of run.cards) {
        const held = highest.get(card.family.id);
        if (held !== undefined) {
          expect(card.rank, `${card.family.id} repeat`).toBeGreaterThan(held);
        }
        highest.set(card.family.id, card.rank);
      }
    }
  });

  it('tilts toward the top of the ladder as a run goes deeper', () => {
    // The saturating half of the rank weights. Measured over the whole sample rather than per run,
    // because a single run's eight draws are far too few to see a tilt in.
    const early: number[] = [];
    const late: number[] = [];
    for (const run of sweepDepth(DEPTHS[DEPTHS.length - 1]).runs) {
      run.cards.forEach((card, index) => {
        (index < CHOICES / 2 ? early : late).push(card.rank);
      });
    }
    const mean = (values: readonly number[]): number =>
      values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

    expect(mean(late)).toBeGreaterThan(mean(early));
  });
});

describe('what a run pays', () => {
  it('pays a lump matched to the campaign stage fighting at the same level', () => {
    // Derived rather than restated: retuning the campaign's reward curve carries the Descent with
    // it, and there is no Descent-side number left to go stale.
    const anchor = anchorAt(stages.length);
    for (let fight = 1; fight <= FIGHTS; fight++) {
      const level = descentLevel(descent, anchor, fight);
      const matched = matchedStageIndex(campaignLevels, level);
      const base = stagePayout(STAGE_REWARDS, matched).reward;
      const paid = descentLump(descent, base);

      expect(num(paid.gold ?? 0).toNumber(), `fight ${fight} gold`).toBeGreaterThan(
        num(base.gold ?? 0).toNumber(),
      );
      // ⚠️ Essence is the one currency paid at a different multiple, and this is where that is
      // measured rather than asserted from the constant. See `DESCENT_RULES.lumpMultipliers`.
      expect(
        num(paid.essence ?? 0).toNumber() / Math.max(num(base.essence ?? 0).toNumber(), 1),
      ).toBeGreaterThan(
        num(paid.gold ?? 0).toNumber() / Math.max(num(base.gold ?? 0).toNumber(), 1),
      );
    }
  });

  it('escalates the crystals through a floor and again at the last fight', () => {
    const summonsAt = (fight: number): number =>
      descentFightAt(descent, fight).kind === 'boss'
        ? descent.summons.perFight * descent.summons.bossMultiplier
        : descentFightAt(descent, fight).kind === 'mini-boss'
          ? descent.summons.perFight * descent.summons.guardianMultiplier
          : descent.summons.perFight;

    expect(summonsAt(3)).toBeGreaterThan(summonsAt(2));
    expect(summonsAt(FIGHTS)).toBeGreaterThan(summonsAt(FIGHTS - 3));
  });
});
