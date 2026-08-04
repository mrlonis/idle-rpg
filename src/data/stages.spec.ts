// @vitest-environment node
// The ladder's *shape*: ids, ranks, rates and rewards. Fast, structural, and derived from the
// content rather than retyped out of it.
//
// **The simulated sweeps live in [`stages.balance.ts`](./stages.balance.ts)**, in the separate
// balance project `AGENTS.md` describes. They moved there when milestone 7 doubled the ladder and
// added a third reference party: three parties across twenty-four stages at forty seeds is nearly
// three thousand battles, and the rule is to move the sweep rather than shrink the sample.
import { describe, expect, it } from 'vitest';
import { BACK_ROW_SIZE, FRONT_ROW_SIZE, type StageData } from '../core';
import { BRAN, MIRA, RIN, STARTER_FORMATION } from './characters';
import { ENEMIES } from './enemies';
import { AUTO_BATTLE_UNLOCK_CLEARS, STAGES } from './stages';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `StageData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const stages: readonly StageData[] = STAGES;

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

  it('fields every enemy it ships somewhere on the ladder', () => {
    // An archetype nobody ever meets is a stat block with a comment attached. Each one names a
    // question, and a question that is never asked is not content.
    const fielded = new Set(
      stages.flatMap((stage) =>
        [...stage.enemies.front, ...stage.enemies.back].map((enemy) => enemy.id),
      ),
    );
    const orphans = ENEMIES.map((enemy) => enemy.id).filter((id) => !fielded.has(id));

    expect(orphans).toEqual([]);
  });
});

describe('where auto-battle unlocks', () => {
  it('lands on a stage the ladder actually has', () => {
    expect(AUTO_BATTLE_UNLOCK_CLEARS).toBeGreaterThan(0);
    expect(AUTO_BATTLE_UNLOCK_CLEARS).toBeLessThanOrEqual(stages.length);
  });

  it('leaves real content on the far side of it', () => {
    // Auto-battle is a prerequisite for the second half rather than a reward for finishing the
    // game: a ladder tapped through one fight at a time is worse the longer it gets. If the
    // unlock ever drifted to the last stage, the feature would arrive with nothing left to do.
    expect(stages.length - AUTO_BATTLE_UNLOCK_CLEARS).toBeGreaterThanOrEqual(stages.length / 3);
  });

  it('unlocks past the wall, so it is never the answer to being stuck', () => {
    // A loop that re-enters the stage a party keeps losing is a loop that loses over and over. It
    // has to arrive well after the point where the game stops being about levels.
    expect(AUTO_BATTLE_UNLOCK_CLEARS).toBeGreaterThan(WALL + 1);
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
