// The ladder, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type FormationData,
  type GrowthData,
  scaleStats,
  simulateBattle,
  type StageData,
  toCombatRules,
} from '../core';
import { BRAN, CELIA, GNASH, MIRA, PYRA, RIN } from './characters';
import { COMBAT_RULES } from './combat';
import { GROWTH, LEVEL_CURVE } from './levels';
import { STAGES } from './stages';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `StageData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const stages: readonly StageData[] = STAGES;
const growth: GrowthData = GROWTH;
const authoredRules: CombatRulesData = COMBAT_RULES;
const rules: CombatRules = toCombatRules(authoredRules);

/**
 * Seeds per stage.
 *
 * Enough to tell "reliable" from "a coin flip". This number is the reason the sweep lives in its
 * own project: three reference parties across twenty-four stages is nearly three thousand
 * battles, and shrinking the sample to fit the fast suite would have bought speed by making the
 * answer less true.
 */
const TRIALS = 40;

interface Sweep {
  readonly winRate: number;
  readonly meanSeconds: number;
  readonly meanSurvivors: number;
  readonly stalemates: number;
}

/** One character resolved for level and rarity, exactly as `ui/` hands it to a battle. */
function at(character: CharacterData, level: number, rarity: number): CombatantData {
  return {
    id: character.id,
    name: character.name,
    faction: character.faction,
    stats: scaleStats(character.stats, growth, character.tier, level, rarity),
    basic: character.basic,
    skills: character.skills,
  };
}

function sweep(party: FormationData, stage: StageData): Sweep {
  let wins = 0;
  let stalemates = 0;
  let ticks = 0;
  let survivors = 0;

  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(party, stage, battleSeed(0xc0ffee, stage.id, attempt), rules);
    if (result.outcome === 'victory') {
      wins++;
    }
    if (result.outcome === 'stalemate') {
      stalemates++;
    }
    ticks += result.ticks;
    survivors += result.final.filter((c) => c.side === 'ally' && c.hp.gt(0)).length;
  }

  return {
    winRate: wins / TRIALS,
    meanSeconds: ticks / TRIALS / 10,
    meanSurvivors: survivors / TRIALS,
    stalemates,
  };
}

/**
 * Levels here are checked against the rarity's own cap, because a party the game will not let a
 * player build is not a tuning target.
 *
 * This is not a technicality. The reference party used to be five characters at level 80 with no
 * ascension at all, and `rare` caps at level 40 — so the number the whole mid-ladder was tuned
 * against described a party that cannot exist. `at()` scales whatever it is handed; only the
 * roster's `levelUp` enforces the cap, and no sweep goes through it.
 */
function legal(level: number, rarity: number): number {
  expect(level, `level ${level} at rarity ${rarity}`).toBeLessThanOrEqual(LEVEL_CURVE.caps[rarity]);
  return level;
}

/** The three characters a run starts with, at level 1, standing where the game puts them. */
const STARTERS: FormationData = {
  front: [at(BRAN, 1, 0), at(MIRA, 1, 0)],
  back: [at(RIN, 1, 0)],
};

/**
 * The mid-game party: five common-tier characters at level 80, ascended to `elite`.
 *
 * Deliberately all `common` tier. If the ladder needed a lucky banner it would be a wall in front
 * of players who cannot buy their way past one, which in a game with no purchases is a wall with
 * nothing behind it. `elite` is simply the lowest rung whose cap (100) permits level 80.
 */
const BUILT: FormationData = {
  front: [at(BRAN, legal(80, 2), 2), at(GNASH, legal(80, 2), 2)],
  back: [at(RIN, legal(80, 2), 2), at(CELIA, legal(80, 2), 2), at(PYRA, legal(80, 2), 2)],
};

/**
 * The same five characters, invested to the top of the `legendary` rung: level 200, its cap.
 *
 * Still common tier, and still no pull anyone had to be lucky for — the second half of the ladder
 * asks for levels and ascension rungs, which are bought with time and duplicates, and for nothing
 * a player cannot earn.
 */
const INVESTED: FormationData = {
  front: [at(BRAN, legal(200, 4), 4), at(GNASH, legal(200, 4), 4)],
  back: [at(RIN, legal(200, 4), 4), at(CELIA, legal(200, 4), 4), at(PYRA, legal(200, 4), 4)],
};

const starterSweeps = stages.map((stage) => ({ stage, ...sweep(STARTERS, stage) }));
const builtSweeps = stages.map((stage) => ({ stage, ...sweep(BUILT, stage) }));
const investedSweeps = stages.map((stage) => ({ stage, ...sweep(INVESTED, stage) }));
const everySweep = [...starterSweeps, ...builtSweeps, ...investedSweeps];

/** Where the starter party is expected to stop: the healer lock. */
const WALL = stages.findIndex((stage) => stage.id === 'stage-7');

/** The end of the hand-climbed half, and the stage auto-battle unlocks behind. */
const HANDCLIMBED = stages.findIndex((stage) => stage.id === 'stage-12') + 1;

describe('ladder balance', () => {
  it('never stalls out on a fight either party is meant to have', () => {
    // A stalemate means neither side could finish inside the tick cap. That is a content bug: the
    // player sits through half an hour of battle time for nothing. Healers and shields make it a
    // real risk, which is why it is asserted on the parties that are losing as well as the ones
    // that are winning.
    const stalled = everySweep
      .filter((entry) => entry.stalemates > 0)
      .map((entry) => entry.stage.id);

    expect(stalled).toEqual([]);
  });

  it('lets three level-1 starters clear the opening ladder', () => {
    // The stages before the wall have to fall to the party the game hands out, because the
    // crystals they pay are how a player affords anything else.
    const unreliable = starterSweeps
      .slice(0, WALL)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('stops three level-1 starters at the healer lock and everything past it', () => {
    // The single most important number in the first half of the ladder. A starting party has two
    // empty formation slots, and this is where filling them stops being optional — the wall is a
    // question about *who* is fighting rather than about how many levels they have, which is what
    // makes it the right place for the early game to end.
    const cleared = starterSweeps
      .slice(WALL)
      .filter((entry) => entry.winRate > 0.05)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(cleared).toEqual([]);
  });

  it('lets a level-80 common-tier party clear the hand-climbed half', () => {
    // Milestone 4's promise, which 8a preserved through the stat collapse and 8b has to preserve
    // through energy: five common-tier characters at level 80 clear twelve stages. That half is
    // climbed one tap at a time, and auto-battle unlocks on finishing it.
    const unreliable = builtSweeps
      .slice(0, HANDCLIMBED)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the second half as well', () => {
    // The Ashfall Reach exists to be something auto-battle has to chew on. If the party that
    // finished the first half also finished the second without investing, twelve stages of
    // content would be a formality.
    const walked = builtSweeps
      .slice(HANDCLIMBED)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(1);
  });

  it('is clearable end to end by an invested party of common-tier characters', () => {
    // Without a lucky banner. The top of the ladder is allowed to demand investment; it is not
    // allowed to demand an ascended-tier pull, because there is no way to buy one.
    const unreliable = investedSweeps
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('still costs that party something at the top', () => {
    // A ladder cleared without ever losing a party member has no texture, and stage 24 would read
    // exactly like stage 1.
    const top = investedSweeps[investedSweeps.length - 1];

    expect(top.meanSurvivors).toBeLessThan(5);
    expect(top.meanSeconds).toBeGreaterThan(investedSweeps[0].meanSeconds * 3);
  });

  it('keeps every fight inside a watchable length', () => {
    // The UI animates the log in real time, so battle duration is screen time. The playback
    // control tops out at 4x, so a minute here is fifteen seconds for a player in a hurry — but
    // anything past that stops being a battle and starts being a wait. Auto-battle makes this
    // sharper rather than softer: a loop of overlong fights is an evening, not a session.
    const overlong = everySweep
      .filter((entry) => entry.meanSeconds > 60)
      .map((entry) => `${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });
});

describe('the shape of the climb', () => {
  /**
   * The smallest all-round power multiplier at which the reference five clear a stage reliably.
   *
   * This is what "difficulty" actually means here, measured rather than asserted. The party's
   * multiplier rises smoothly with levels and ascension rungs, so the curve this returns has to
   * rise smoothly too — a flat step is a stage that asks for nothing, and a spike is a wall the
   * economy cannot be climbed over.
   *
   * The probe scales the five quantities directly instead of picking levels, so it sweeps power
   * continuously rather than in the lumps the level curve happens to provide.
   */
  const threshold = (stage: StageData): number => {
    const flat: GrowthData = {
      perLevel: { common: 1, legendary: 1, ascended: 1 },
      perAscension: 1,
    };
    const party = (multiplier: number): FormationData => {
      const scaled = (character: CharacterData): CombatantData => {
        const base = scaleStats(character.stats, flat, character.tier, 1, 0);
        const grow = (value: number | string): string => String(Number(value) * multiplier);
        return {
          id: character.id,
          name: character.name,
          faction: character.faction,
          stats: {
            ...base,
            hp: grow(base.hp),
            atk: grow(base.atk),
            def: grow(base.def),
            ...(base.recovery === undefined ? {} : { recovery: grow(base.recovery) }),
          },
          basic: character.basic,
          skills: character.skills,
        };
      };
      return {
        front: [scaled(BRAN), scaled(GNASH)],
        back: [scaled(RIN), scaled(CELIA), scaled(PYRA)],
      };
    };

    const clears = (multiplier: number): boolean => {
      let wins = 0;
      for (let attempt = 0; attempt < 20; attempt++) {
        const seed = battleSeed(0xc0ffee, stage.id, attempt);
        if (simulateBattle(party(multiplier), stage, seed, rules).outcome === 'victory') {
          wins++;
        }
      }
      return wins / 20 >= 0.9;
    };

    let low = 0.05;
    let high = 40;
    expect(clears(high), `${stage.id} is unclearable at any power`).toBe(true);
    for (let step = 0; step < 9; step++) {
      const mid = Math.sqrt(low * high);
      if (clears(mid)) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return high;
  };

  const thresholds = stages.map(threshold);

  it('never asks meaningfully less of the player than the stage below it', () => {
    // A little unevenness is texture: a stage that trades a bigger stat block for a sharper
    // question can legitimately read as slightly easier to a party that happens to hold the
    // answer. A real step backwards is a bug — it means a player who just lost can beat the
    // stage after the one blocking them.
    const backwards = thresholds
      .map((needed, index) => ({ id: stages[index].id, needed, before: thresholds[index - 1] }))
      .filter((entry) => entry.before !== undefined && entry.needed < entry.before * 0.92)
      .map((entry) => `${entry.id} ${entry.needed.toFixed(2)} after ${entry.before.toFixed(2)}`);

    expect(backwards).toEqual([]);
  });

  it('makes real progress over any two steps', () => {
    const stalled = thresholds
      .map((needed, index) => ({ id: stages[index].id, needed, twoBack: thresholds[index - 2] }))
      .filter((entry) => entry.twoBack !== undefined && entry.needed <= entry.twoBack)
      .map((entry) => entry.id);

    expect(stalled).toEqual([]);
  });

  it('asks several times more at the top of each half than at its foot', () => {
    // The half that exists so auto-battle has something to chew on has to be a climb, not a
    // victory lap. Both halves should cost multiples, not percentages.
    const first = thresholds[HANDCLIMBED - 1] / thresholds[0];
    const second = thresholds[thresholds.length - 1] / thresholds[HANDCLIMBED - 1];

    expect(first).toBeGreaterThan(3);
    expect(second).toBeGreaterThan(3);
  });
});
