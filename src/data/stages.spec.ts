// @vitest-environment node
// Content is simulated, not played. This spec runs headless for the same reason `core/` does:
// checking a ladder by simulating it takes seconds, and checking it by hand takes an hour and
// only covers one seed.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  BACK_ROW_SIZE,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type FormationData,
  FRONT_ROW_SIZE,
  type GrowthData,
  scaleStats,
  simulateBattle,
  type StageData,
  toCombatRules,
} from '../core';
import { BRAN, CELIA, GNASH, MIRA, PYRA, RIN, STARTER_FORMATION } from './characters';
import { COMBAT_RULES } from './combat';
import { GROWTH } from './levels';
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
 * Enough to tell "reliable" from "a coin flip" without making this spec something people avoid
 * running. Combat is far heavier than it was before skills and statuses existed — a sweep of the
 * whole ladder is a couple of seconds rather than ten milliseconds — so this is the number where
 * the sweep still belongs in the fast suite. When it stops being, the answer is the separate
 * balance project AGENTS.md describes, not a smaller sample here.
 */
const TRIALS = 40;

interface Sweep {
  readonly winRate: number;
  readonly meanSeconds: number;
  readonly meanSurvivors: number;
  readonly stalemates: number;
}

/** One character resolved for level and rarity, exactly as `ui/` hands it to a battle. */
function at(character: CharacterData, level: number, rarity = 0): CombatantData {
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

/** The three characters a run starts with, at level 1, standing where the game puts them. */
const STARTERS: FormationData = {
  front: [at(BRAN, 1), at(MIRA, 1)],
  back: [at(RIN, 1)],
};

/**
 * A plausible mid-game party: five common-tier characters at level 80, none ascended.
 *
 * Deliberately all `common` tier. If the top of the ladder needed a lucky banner it would be a
 * wall in front of players who cannot buy their way past one, which in a game with no purchases
 * is a wall with nothing behind it.
 */
const BUILT: FormationData = {
  front: [at(BRAN, 80), at(GNASH, 80)],
  back: [at(RIN, 80), at(CELIA, 80), at(PYRA, 80)],
};

const starterSweeps = stages.map((stage) => ({ stage, ...sweep(STARTERS, stage) }));
const builtSweeps = stages.map((stage) => ({ stage, ...sweep(BUILT, stage) }));

/** Where the starter party is expected to stop: the healer lock. */
const WALL = stages.findIndex((stage) => stage.id === 'stage-7');

describe('stage content', () => {
  it('authors a non-empty ladder with unique ids', () => {
    expect(stages.length).toBeGreaterThan(0);
    expect(new Set(stages.map((stage) => stage.id)).size).toBe(stages.length);
  });

  it('gives every stage at least one enemy and a name', () => {
    for (const stage of stages) {
      expect(stage.enemies.front.length + stage.enemies.back.length, stage.id).toBeGreaterThan(0);
      expect(stage.name.length, stage.id).toBeGreaterThan(0);
    }
  });

  it('fields enemies within the same rank sizes the player has', () => {
    // Not a rule the simulation enforces — it will happily field six enemies in one rank — but a
    // stage that outnumbered the player's own front row would be asking a question about numbers
    // rather than about composition, which is the one thing this ladder is not for.
    for (const stage of stages) {
      expect(stage.enemies.front.length, stage.id).toBeLessThanOrEqual(FRONT_ROW_SIZE);
      expect(stage.enemies.back.length, stage.id).toBeLessThanOrEqual(BACK_ROW_SIZE);
    }
  });

  it('gives every enemy a faction, so the matchup matrix is never decoration', () => {
    for (const stage of stages) {
      for (const enemy of [...stage.enemies.front, ...stage.enemies.back]) {
        expect(enemy.faction, `${stage.id}/${enemy.id}`).toBeTruthy();
      }
    }
  });

  it('spreads the ladder across more than one enemy faction', () => {
    // A ladder of nothing but Monsters would make the four mortal factions that beat Monsters
    // strictly correct and the rest of the matrix pointless.
    const factions = new Set(
      stages.flatMap((stage) =>
        [...stage.enemies.front, ...stage.enemies.back].map((enemy) => enemy.faction),
      ),
    );

    expect(factions.size).toBeGreaterThanOrEqual(4);
  });

  it('pays more for every stage further up the ladder', () => {
    const rewards = stages.map((stage) => Number(stage.reward.gold));

    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i], stages[i].id).toBeGreaterThan(rewards[i - 1]);
    }
  });

  it.each(['gold', 'xp', 'essence', 'summons'] as const)(
    'raises the %s rate at every step, so no clear is ever a sidestep',
    (currency) => {
      // The rate is the real reward, and `applyBattleResult` only ever raises it. A stage
      // granting no more than the one before it would read to the player as a stage that paid
      // nothing — and that has to hold on every currency, not just the visible one.
      const rates = stages.map((stage) => Number(stage.rates[currency]));

      expect(rates[0]).toBeGreaterThan(0);
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i], stages[i].id).toBeGreaterThan(rates[i - 1]);
      }
    },
  );

  it('keeps each one-off lump in proportion to the income it unlocks', () => {
    // The lump should read as a bonus and the rate as the progression. Letting the lump drift to
    // minutes of idle income would invert that and make clears feel like the whole game.
    for (const stage of stages) {
      const secondsOfIncome = Number(stage.reward.gold) / Number(stage.rates.gold);
      expect(secondsOfIncome, stage.id).toBeGreaterThan(20);
      expect(secondsOfIncome, stage.id).toBeLessThan(60);
    }
  });

  it('never pays summon crystals for a repeat clear', () => {
    // Crystals come from the idle rate and from first clears, and from nowhere else. A repeatable
    // crystal payout would make tap-farming the opening stage the fastest way to pull, and the
    // correct play in a game about climbing a ladder would be to never leave the bottom of it.
    for (const stage of stages) {
      expect(stage.reward.summons, stage.id).toBeUndefined();
    }
  });

  it('pays enough first-clear crystals below the wall to fill the empty formation slots', () => {
    // A run starts with three characters in five slots and stalls at the healer lock. The
    // crystals banked before that point are the intended answer, so they have to add up to more
    // than a token: two more characters is two pulls, and this is many times that.
    const beforeTheWall = stages
      .slice(0, WALL)
      .reduce((sum, stage) => sum + Number(stage.firstClearSummons ?? 0), 0);

    for (const stage of stages) {
      expect(Number(stage.firstClearSummons ?? 0), stage.id).toBeGreaterThan(0);
    }
    expect(beforeTheWall).toBeGreaterThanOrEqual(1000);
  });

  it('keeps the reward curve well inside float64, so the curve is not the reason for Decimal', () => {
    // AGENTS.md asks for this to be checked rather than assumed. At ~1.5x per stage the top of
    // the ladder is in the low thousands; `Numeric` is a hedge against future curves, not this one.
    for (const stage of stages) {
      expect(Number(stage.reward.gold), stage.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    }
  });
});

describe('the starting formation', () => {
  it('fills the front rank and leaves room to grow', () => {
    // Three characters in five slots is the intended shape, not a shortfall: the two empty places
    // are what makes the first summon worth something.
    expect(STARTER_FORMATION.front).toHaveLength(FRONT_ROW_SIZE);
    expect(STARTER_FORMATION.back.length).toBeLessThan(BACK_ROW_SIZE);
  });

  it('names characters that exist, exactly once each', () => {
    const members = [...STARTER_FORMATION.front, ...STARTER_FORMATION.back];

    expect(new Set(members).size).toBe(members.length);
    for (const id of members) {
      expect([BRAN.id, MIRA.id, RIN.id], id).toContain(id);
    }
  });

  it('keeps its only back-line answer out of the front rank', () => {
    // Rin is the party's sole way of reaching an enemy back row, and at 430 HP she does not
    // survive standing where the attacks land. Putting her behind Bran and Mira is what makes the
    // opening ladder answerable at all.
    expect(STARTER_FORMATION.back).toContain(RIN.id);
  });
});

describe('ladder balance', () => {
  it('never stalls out on a fight either party is meant to have', () => {
    // A stalemate means neither side could finish inside the tick cap. That is a content bug: the
    // player sits through half an hour of battle time for nothing. Healers and shields make it a
    // real risk now in a way it was not before, which is exactly why it is asserted on both the
    // party that is losing and the party that is winning.
    const stalled = [...starterSweeps, ...builtSweeps]
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
    // The single most important number in the ladder. A starting party has two empty formation
    // slots, and this is where filling them stops being optional — the wall is a question about
    // *who* is fighting rather than about how many levels they have, which is what makes it the
    // right place for the early game to end.
    const cleared = starterSweeps
      .slice(WALL)
      .filter((entry) => entry.winRate > 0.05)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(cleared).toEqual([]);
  });

  it('is clearable end to end by a built party of common-tier characters', () => {
    // Without a lucky banner. The top of the ladder is allowed to demand investment; it is not
    // allowed to demand an ascended-tier pull, because there is no way to buy one.
    const unreliable = builtSweeps
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('still costs a built party something at the top', () => {
    // A ladder cleared without ever losing a party member has no texture, and stage 12 would read
    // exactly like stage 1.
    const top = builtSweeps[builtSweeps.length - 1];

    expect(top.meanSurvivors).toBeLessThan(5);
    expect(top.meanSeconds).toBeGreaterThan(builtSweeps[0].meanSeconds * 3);
  });

  it('keeps every fight inside a watchable length', () => {
    // The UI animates the log in real time, so battle duration is screen time. The playback
    // control tops out at 4x, so a minute here is fifteen seconds for a player in a hurry — but
    // anything past that stops being a battle and starts being a wait.
    const overlong = [...starterSweeps, ...builtSweeps]
      .filter((entry) => entry.meanSeconds > 60)
      .map((entry) => `${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });
});

describe('composition, which is what this ladder exists to prove', () => {
  it('turns the healer lock on whether the party can reach a back rank at all', () => {
    // The thesis of the whole milestone, stated as a number.
    //
    // Two parties, identical but for one slot. One holds Rin, whose Piercing Shot is free, comes
    // off a short cooldown and targets the enemy *back* row. The other holds Gnash, who hits
    // harder and can only hit what is in front of him. Against two Boars guarding an Acolyte, the
    // first wins almost always and the second wins almost never — and Gnash is the better
    // character on raw damage.
    //
    // That gap is the entire point of milestone 4. Under milestone 2's targeting — "attack the
    // opponent with the least HP" — both parties would have spent the whole fight on the Boars
    // and the Acolyte's presence would have changed nothing but the duration.
    const shrine = stages[WALL];
    const withReach: FormationData = { front: [at(BRAN, 20), at(MIRA, 20)], back: [at(RIN, 20)] };
    const withoutReach: FormationData = {
      front: [at(BRAN, 20), at(MIRA, 20)],
      back: [at(GNASH, 20)],
    };

    expect(sweep(withReach, shrine).winRate).toBeGreaterThan(0.85);
    expect(sweep(withoutReach, shrine).winRate).toBeLessThan(0.15);
  });
});
