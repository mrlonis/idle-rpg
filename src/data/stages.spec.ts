// @vitest-environment node
// Content is simulated, not played. This spec runs headless for the same reason `core/` does:
// checking a ladder by simulating it takes milliseconds, and checking it by hand takes an hour
// and only covers one seed.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  simulateBattle,
  type CombatantData,
  type StageData,
  type StatBlockData,
} from '../core';
import { STARTER_TEAM } from './characters';
import { STAGES } from './stages';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `StageData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const stages: readonly StageData[] = STAGES;
const team: readonly CombatantData[] = STARTER_TEAM;

/** Seeds per stage. Enough to distinguish "reliable" from "a coin flip" without being slow. */
const TRIALS = 200;

interface Sweep {
  readonly winRate: number;
  readonly meanSeconds: number;
  readonly meanSurvivors: number;
  readonly stalemates: number;
}

function sweep(stage: StageData): Sweep {
  let wins = 0;
  let stalemates = 0;
  let ticks = 0;
  let survivors = 0;

  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(team, stage, battleSeed(0xc0ffee, stage.id, attempt));
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

const sweeps = stages.map((stage) => ({ stage, ...sweep(stage) }));

describe('stage content', () => {
  it('authors a non-empty ladder with unique ids', () => {
    expect(stages.length).toBeGreaterThan(0);
    expect(new Set(stages.map((stage) => stage.id)).size).toBe(stages.length);
  });

  it('gives every stage at least one enemy and a name', () => {
    for (const stage of stages) {
      expect(stage.enemies.length, stage.id).toBeGreaterThan(0);
      expect(stage.name.length, stage.id).toBeGreaterThan(0);
    }
  });

  it('pays more for every stage further up the ladder', () => {
    const rewards = stages.map((stage) => Number(stage.goldReward));

    for (let i = 1; i < rewards.length; i++) {
      expect(rewards[i], stages[i].id).toBeGreaterThan(rewards[i - 1]);
    }
  });

  it('keeps the reward curve well inside float64, so the curve is not the reason for Decimal', () => {
    // AGENTS.md asks for this to be checked rather than assumed. At ~1.6x per stage the top of
    // the ladder is in the hundreds; `Numeric` is a hedge against future curves, not this one.
    for (const stage of stages) {
      expect(Number(stage.goldReward), stage.id).toBeLessThan(Number.MAX_SAFE_INTEGER);
    }
  });
});

describe('starter party', () => {
  it('fields characters with distinct ids', () => {
    expect(new Set(team.map((character) => character.id)).size).toBe(team.length);
  });

  it('is a set of sidegrades rather than a power ladder', () => {
    // The invariant is non-domination, not "everyone is best at something". A character can be
    // the middle of every axis and still be a real choice — what must never happen is one
    // character being at least as good as another on *every* axis, because then the worse one is
    // never worth fielding and "two players clear the same stage with different teams" is false.
    const axes: readonly (keyof StatBlockData)[] = ['hp', 'atk', 'def', 'spd', 'critChance'];
    const dominated: string[] = [];

    for (const candidate of team) {
      for (const rival of team) {
        if (candidate === rival) {
          continue;
        }
        const worseEverywhere = axes.every(
          (axis) => Number(rival.stats[axis]) >= Number(candidate.stats[axis]),
        );
        if (worseEverywhere) {
          dominated.push(`${candidate.id} is dominated by ${rival.id}`);
        }
      }
    }

    expect(dominated).toEqual([]);
  });
});

describe('ladder balance', () => {
  it('never stalls out', () => {
    // A stalemate means the party could not finish inside the tick cap. That is a content bug:
    // the player would sit through half an hour of battle time for nothing.
    const stalled = sweeps.filter((entry) => entry.stalemates > 0).map((entry) => entry.stage.id);

    expect(stalled).toEqual([]);
  });

  it('is clearable end to end by the starter party', () => {
    // Deliberate for this milestone: there is nothing to spend gold on yet, so a stage the party
    // simply cannot beat would be a permanent stop rather than a goal.
    const unreliable = sweeps
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('gets harder towards the top', () => {
    // Asserted as a gap between the ends rather than stage by stage, so retuning one encounter
    // does not fail the suite for a non-monotonic step that does not matter.
    const first = sweeps[0];
    const last = sweeps[sweeps.length - 1];

    expect(last.meanSeconds).toBeGreaterThan(first.meanSeconds * 2);
    expect(last.meanSurvivors).toBeLessThan(first.meanSurvivors);
  });

  it('keeps every fight inside a watchable length', () => {
    // The UI animates the log in real time, so battle duration is screen time. Anything much
    // past half a minute at 1x stops being ambient and starts being a wait.
    const overlong = sweeps
      .filter((entry) => entry.meanSeconds > 40)
      .map((entry) => `${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });

  it('costs the party something by the end', () => {
    // A ladder that is cleared without ever losing a party member has no texture, and stage 8
    // would read exactly like stage 1.
    expect(sweeps[sweeps.length - 1].meanSurvivors).toBeLessThan(team.length);
  });
});
