// @vitest-environment node
// `core/` runs headless. A spec here needing a TestBed would mean the boundary had been violated.
import { describe, expect, it } from 'vitest';
import { type EnemyFormationData, type StatBlockData } from '../battle/types';
import { num, serialize } from '../numeric';
import { type GameState, newGame } from '../state';
import {
  applyDescentBonus,
  descentBonus,
  descentCard,
  descentCardId,
  descentCards,
  descentOffer,
  familyFloor,
  isNeutralDescentBonus,
  choiceProgress,
  rankWeight,
} from './cards';
import {
  applyDescentResult,
  canStartDescent,
  dailyDescentFactions,
  descentBoards,
  descentCardsOwed,
  descentChoices,
  descentFightAt,
  descentFights,
  descentFightSummons,
  descentLevel,
  descentLump,
  descentRunFor,
  descentStatus,
  isDescentUnlocked,
  nextDescentFight,
  parseDescent,
  resolveDescentFight,
  serializeDescent,
  startDescent,
  takeDescentCard,
  type DescentBattleOutcome,
} from './run';
import {
  type DescentEncounterData,
  type DescentFamilyData,
  type DescentRulesData,
  type DescentRun,
} from './types';

const T0 = 1_700_000_000_000;

const EMPTY: EnemyFormationData = { front: [], back: [] };

function board(id: string, floor: number, guardian: boolean): DescentEncounterData {
  return { id, name: id, floor, guardian, enemies: EMPTY };
}

/** A pool deep enough that a draw never runs out: five ordinary and three guardians per floor. */
const POOL: readonly DescentEncounterData[] = [1, 2, 3].flatMap((floor) => [
  ...[1, 2, 3, 4, 5].map((n) => board(`f${floor}-o${n}`, floor, false)),
  ...[1, 2, 3].map((n) => board(`f${floor}-g${n}`, floor, true)),
]);

const FAMILIES: readonly DescentFamilyData[] = [
  {
    id: 'edge',
    name: 'Edge',
    description: 'Crit.',
    rungs: [{ critChance: 0.04 }, { critChance: 0.08 }, { critChance: 0.16 }],
  },
  {
    id: 'blood',
    name: 'Blood',
    description: 'Leech.',
    rungs: [{ lifeLeech: 0.1 }, { lifeLeech: 0.2 }, { lifeLeech: 0.4 }],
  },
  {
    id: 'elves',
    name: 'Elves',
    description: 'Elves only.',
    faction: 'elf',
    rungs: [{ atk: 0.1 }, { atk: 0.2 }, { atk: 0.4 }],
  },
  {
    id: 'brawn',
    name: 'Brawn',
    description: 'Attack.',
    rungs: [{ atk: 0.05 }, { atk: 0.1 }, { atk: 0.2 }],
  },
];

const RULES: DescentRulesData = {
  floors: 3,
  fightsPerFloor: 3,
  lives: 2,
  offer: 3,
  lockFactions: 3,
  unlockChapters: 2,
  ranks: [
    { name: 'Lesser', start: 10, end: 1 },
    { name: 'Greater', start: 3, end: 5 },
    { name: 'Grand', start: 0, end: 8 },
  ],
  maxLifeLeech: 0.35,
  // A zero slope reproduces the pre-milestone-27 line exactly, which is what keeps every level
  // assertion in this file a statement about the two fixed offsets rather than about the anchor.
  level: { baseOffset: -10, topOffset: 5, anchorSlope: 0 },
  summons: { perFight: 100, guardianMultiplier: 2, bossMultiplier: 5, completion: 1000 },
  completionEmblems: 25,
  lumpMultipliers: { gold: 2, xp: 2, essence: 5 },
};

const DAY = 4242;

/** A day's lock that admits the one faction family in {@link FAMILIES}. */
const LOCK = ['elf', 'human', 'dwarf'];

/**
 * The run in flight, or a thrown error.
 *
 * A helper rather than a non-null assertion, because the lint config forbids the assertion *and*
 * the cast that would stand in for it — and because narrowing it here means every test below reads
 * a `DescentRun` rather than restating that one exists.
 */
function runOf(state: GameState): DescentRun {
  const run = state.descent;
  if (run === null) {
    throw new Error('the run is not in flight');
  }
  return run;
}

function fresh(): GameState {
  return newGame({ seed: 0xbeef, nowMs: T0 });
}

function running(over: Partial<DescentRun> = {}): GameState {
  const state = startDescent(fresh(), RULES, DAY, { front: ['a', 'b'], back: ['c'] });
  return { ...state, descent: { ...runOf(state), ...over } };
}

/** A victory with everyone standing, in the shape `applyDescentResult` reads one. */
function victory(
  standing: readonly { defId: string; hp: number; maxHp: number; energy: number }[],
): DescentBattleOutcome {
  return {
    outcome: 'victory',
    reward: { gained: { gold: num(10) } },
    final: standing.map((entry) => ({
      side: 'ally',
      defId: entry.defId,
      hp: num(entry.hp),
      maxHp: num(entry.maxHp),
      energy: entry.energy,
    })),
  };
}

const DEFEAT: DescentBattleOutcome = { outcome: 'defeat', reward: { gained: {} }, final: [] };

describe('the shape of a run', () => {
  it('is floors times fights, with one fewer card than fights', () => {
    expect(descentFights(RULES)).toBe(9);
    // ⚠️ A card after the last fight would be a choice with nothing to spend it on.
    expect(descentChoices(RULES)).toBe(8);
  });

  it('closes each floor with a guardian and the run with a boss', () => {
    expect(descentFightAt(RULES, 1)).toEqual({ index: 1, floor: 1, step: 1, kind: 'normal' });
    expect(descentFightAt(RULES, 3).kind).toBe('mini-boss');
    expect(descentFightAt(RULES, 6).kind).toBe('mini-boss');
    // ⚠️ The last fight is the **boss** even though it also closes its floor, so it pays a boss's
    // multiplier rather than a guardian's — the same rule `stageKindAt` follows for a chapter.
    expect(descentFightAt(RULES, 9)).toEqual({ index: 9, floor: 3, step: 3, kind: 'boss' });
  });

  it('clamps a fight index rather than reading off the end', () => {
    expect(descentFightAt(RULES, 99).index).toBe(9);
    expect(descentFightAt(RULES, 0).index).toBe(1);
    expect(descentFightAt(RULES, Number.NaN).index).toBe(1);
  });

  it('pays a guardian double and the last fight five times', () => {
    expect(descentFightSummons(RULES, 1)).toBe(100);
    expect(descentFightSummons(RULES, 3)).toBe(200);
    expect(descentFightSummons(RULES, 9)).toBe(500);
  });
});

describe('the enemy level', () => {
  it('is an offset from the anchor rather than a share of it', () => {
    // ⚠️ **The whole reason this is an offset.** Enemy power is exponential in level, so the same
    // *share* is a different difficulty at every depth — 0.9 of 20 is two levels and 0.9 of 600 is
    // sixty. An offset is the same number of steps along one exponential wherever it lands, which
    // is what lets twenty-four authored boards serve a four-hundred-stage campaign.
    expect(descentLevel(RULES, 100, 1)).toBe(90);
    expect(descentLevel(RULES, 100, 9)).toBe(105);
    expect(descentLevel(RULES, 600, 1)).toBe(590);
    expect(descentLevel(RULES, 600, 9)).toBe(605);
  });

  it('climbs across the run', () => {
    const line = Array.from({ length: 9 }, (_, index) => descentLevel(RULES, 200, index + 1));

    expect(line).toEqual([...line].sort((a, b) => a - b));
    expect(line[8]).toBeGreaterThan(line[0]);
  });

  it('never goes below level 1, however small the anchor', () => {
    expect(descentLevel(RULES, 1, 1)).toBe(1);
    expect(descentLevel(RULES, 5, 1)).toBe(1);
  });
});

describe("the day's draw", () => {
  it('draws one board per fight, in floor order, guardians last on each floor', () => {
    const boards = descentBoards(RULES, POOL, 0xbeef, DAY);

    expect(boards).toHaveLength(9);
    expect(boards.map((entry) => entry.floor)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
    expect(boards.map((entry) => entry.guardian)).toEqual([
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false,
      true,
    ]);
  });

  it('never repeats a board inside one day', () => {
    const ids = descentBoards(RULES, POOL, 0xbeef, DAY).map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is a pure function of the seed and the day, so it cannot be rerolled', () => {
    // ⚠️ The whole argument for deriving rather than storing: force-quitting and relaunching hands
    // back the identical nine boards, because there was never a draw written down to re-take.
    const first = descentBoards(RULES, POOL, 0xbeef, DAY).map((entry) => entry.id);
    const again = descentBoards(RULES, POOL, 0xbeef, DAY).map((entry) => entry.id);
    const tomorrow = descentBoards(RULES, POOL, 0xbeef, DAY + 1).map((entry) => entry.id);

    expect(again).toEqual(first);
    expect(tomorrow).not.toEqual(first);
  });

  it('draws the day s factions in authored order, however the shuffle fell', () => {
    const factions = ['human', 'dwarf', 'elf', 'undead', 'monster', 'angel', 'demon'];
    const lock = dailyDescentFactions(RULES, factions, 0xbeef, DAY);

    expect(lock).toHaveLength(3);
    // Sorted back into pool order, so the row order on screen never depends on a draw — the same
    // discipline `dailyBoard` states.
    expect(lock).toEqual(factions.filter((faction) => lock.includes(faction)));
  });

  it('never asks for more factions than exist', () => {
    expect(dailyDescentFactions(RULES, ['human', 'elf'], 0xbeef, DAY)).toHaveLength(2);
    expect(dailyDescentFactions(RULES, [], 0xbeef, DAY)).toEqual([]);
  });
});

describe('a resolved fight', () => {
  it('carries no rates and no first-clear crystals', () => {
    // ⚠️ Both fields exist because `StageData` is one type for every fight in the game, and filling
    // either is how this mode would quietly acquire a permanent income raise or a crystal payout
    // routed through the campaign's own path.
    const stage = resolveDescentFight(RULES, POOL[0], 4, 100, { gold: 5 });

    expect(stage.rates).toEqual({});
    expect(stage.firstClearSummons).toBe(0);
    expect(stage.reward).toEqual({ gold: 5 });
    expect(stage.level).toBe(descentLevel(RULES, 100, 4));
    expect(stage.kind).toBe(descentFightAt(RULES, 4).kind);
  });

  it('multiplies the campaign lump, essence hardest', () => {
    const paid = descentLump(RULES, { gold: 100, xp: 40, essence: 10 });

    expect(paid).toEqual({ gold: 200, xp: 80, essence: 50 });
  });

  it('leaves a currency the campaign rounded away absent rather than paying zero', () => {
    expect(descentLump(RULES, { gold: 100 })).toEqual({ gold: 200 });
  });
});

describe('the card ladder', () => {
  it('floors a family one rung above the highest it holds', () => {
    const held = descentCards(FAMILIES, RULES, ['edge:0', 'brawn:1']);

    expect(familyFloor(held, 'edge')).toBe(1);
    expect(familyFloor(held, 'brawn')).toBe(2);
    expect(familyFloor(held, 'blood')).toBe(0);
  });

  it('never offers a family at or below a rung the run already holds', () => {
    const held = descentCards(FAMILIES, RULES, ['edge:0', 'edge:1']);
    const offer = descentOffer(RULES, FAMILIES, LOCK, 0xbeef, DAY, 8, 4, held);

    for (const card of offer) {
      if (card.family.id === 'edge') {
        expect(card.rank).toBe(2);
      }
    }
  });

  it('never offers the same family twice in one choice', () => {
    for (let choice = 0; choice < 8; choice++) {
      const offer = descentOffer(RULES, FAMILIES, LOCK, 0xbeef, DAY, 8, choice, []);
      const ids = offer.map((card) => card.family.id);

      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('stops offering a family the run has taken to the top', () => {
    const held = descentCards(FAMILIES, RULES, ['edge:0', 'edge:1', 'edge:2']);
    const offer = descentOffer(RULES, FAMILIES, LOCK, 0xbeef, DAY, 8, 6, held);

    expect(offer.some((card) => card.family.id === 'edge')).toBe(false);
  });

  it('never offers a faction family the day s lock excludes', () => {
    // ⚠️ **A card that can pay nobody in any legal crew is a dead offer slot**, and with seven
    // faction families against a three-faction lock it would be four of fourteen — better than a
    // quarter of every offer, and three dead cards in one offer is a choice the player cannot make.
    // It shipped that way and the screen is what caught it.
    for (let choice = 0; choice < 8; choice++) {
      for (const card of descentOffer(RULES, FAMILIES, ['human'], 0xbeef, DAY, 8, choice, [])) {
        expect(card.family.faction ?? 'human', card.id).toBe('human');
      }
    }
  });

  it('offers everything when the lock admits everybody', () => {
    // An empty lock is what content shipping no lock at all would mean, and it must not filter.
    const ids = new Set<string>();
    for (let choice = 0; choice < 8; choice++) {
      for (const card of descentOffer(RULES, FAMILIES, [], 0xbeef, DAY, 8, choice, [])) {
        ids.add(card.family.id);
      }
    }

    expect(ids.has('elves')).toBe(true);
  });

  it('offers fewer cards than asked for only when the pool genuinely runs out', () => {
    const one: readonly DescentFamilyData[] = [FAMILIES[0]];

    expect(descentOffer(RULES, one, LOCK, 0xbeef, DAY, 8, 0, [])).toHaveLength(1);
    expect(descentOffer(RULES, FAMILIES, LOCK, 0xbeef, DAY, 8, 0, [])).toHaveLength(3);
  });

  it('saturates its tilt across the run rather than climbing without bound', () => {
    // ⚠️ The fix `docs/gear.md` names for `gradeSoftness`, taken up front. A weight interpolated
    // across a run's own choices reaches its end value on the last one however long the run is, so
    // there is no softness constant here to re-derive when content grows.
    expect(choiceProgress(8, 0)).toBe(0);
    expect(choiceProgress(8, 7)).toBe(1);
    expect(choiceProgress(8, 99)).toBe(1);
    expect(choiceProgress(1, 0)).toBe(1);
  });

  it('cannot draw the top rung on the first choice and favours it on the last', () => {
    expect(rankWeight(RULES, 2, choiceProgress(8, 0))).toBe(0);
    expect(rankWeight(RULES, 2, choiceProgress(8, 7))).toBeGreaterThan(
      rankWeight(RULES, 0, choiceProgress(8, 7)),
    );
    expect(rankWeight(RULES, 0, choiceProgress(8, 0))).toBeGreaterThan(
      rankWeight(RULES, 2, choiceProgress(8, 0)),
    );
  });

  it('resolves an id this build no longer ships as nothing rather than throwing', () => {
    expect(descentCard(FAMILIES, RULES, 'gone:1')).toBeUndefined();
    expect(descentCard(FAMILIES, RULES, 'edge:99')).toBeUndefined();
    expect(descentCard(FAMILIES, RULES, 'nonsense')).toBeUndefined();
    // ⚠️ The run keeps its other cards. A card a later build drops costs its bonus, not the run.
    expect(descentCards(FAMILIES, RULES, ['gone:1', 'edge:0'])).toHaveLength(1);
  });

  it('round-trips an id', () => {
    expect(descentCard(FAMILIES, RULES, descentCardId('edge', 2))?.rank).toBe(2);
  });
});

describe('what the cards are worth', () => {
  it('sums rather than compounding', () => {
    const held = descentCards(FAMILIES, RULES, ['brawn:0', 'brawn:1']);

    // 0.05 + 0.10 rather than 1.05 × 1.10. Compounding would make the *last* card the most
    // valuable, which rewards a run for how far it got rather than for what it chose.
    expect(descentBonus(RULES, held, 'human').atk).toBeCloseTo(0.15, 10);
  });

  it('pays a faction family only to its own faction', () => {
    const held = descentCards(FAMILIES, RULES, ['elves:2']);

    expect(descentBonus(RULES, held, 'elf').atk).toBeCloseTo(0.4, 10);
    expect(descentBonus(RULES, held, 'human')).toEqual({});
  });

  it('clamps the life leech a whole run can accumulate', () => {
    // ⚠️ **A termination guard, not a balance knob.** Leech is taken off damage dealt and closing
    // pressure amplifies damage without amplifying healing, so a party siphoning enough of its own
    // output back stalls until the ninety-second clock ends the fight in a defeat.
    const held = descentCards(FAMILIES, RULES, ['blood:0', 'blood:1', 'blood:2']);

    expect(descentBonus(RULES, held, 'human').lifeLeech).toBe(RULES.maxLifeLeech);
  });

  it('reports a run holding nothing as neutral', () => {
    expect(isNeutralDescentBonus(descentBonus(RULES, [], 'human'))).toBe(true);
  });
});

describe('folding a bonus into a stat block', () => {
  const BLOCK: StatBlockData = {
    hp: 1000,
    atk: 100,
    def: 50,
    haste: 100,
    critChance: 0.05,
    critDamageAmp: 0.6,
  };

  it('multiplies the quantities and adds points to the bounded rates', () => {
    const grown = applyDescentBonus(BLOCK, {
      hp: 0.5,
      atk: 0.2,
      def: 0.1,
      haste: 0.1,
      critChance: 0.2,
      critDamageAmp: 0.4,
    });

    expect(grown.hp).toBe(serialize(num(1500)));
    expect(grown.atk).toBe(serialize(num(120)));
    expect(grown.def).toBe(serialize(num(55)));
    expect(grown.haste).toBeCloseTo(110, 10);
    // ⚠️ Points rather than a percentage. Most of the roster sits between 0.02 and 0.12 crit, so a
    // percentage of what they already have would pay almost nothing — the same split the lineup
    // ladder already makes, and the reason it survives the ×10⁹ level curve.
    expect(grown.critChance).toBeCloseTo(0.25, 10);
    expect(grown.critDamageAmp).toBeCloseTo(1.0, 10);
  });

  it('conjures life steal on a character authored without any', () => {
    // ⚠️ **The deliberate difference from `applyGearBonus`, which leaves an absent stat absent.**
    // The whole point of a life-steal card is that it reaches a character with no leech at all; a
    // rule that skipped them would make the family pay only the handful of Monsters who already
    // siphon, which is precisely backwards.
    expect(BLOCK.lifeLeech).toBeUndefined();
    expect(applyDescentBonus(BLOCK, { lifeLeech: 0.2 }).lifeLeech).toBeCloseTo(0.2, 10);
  });

  it('returns the block untouched when the run holds nothing', () => {
    expect(applyDescentBonus(BLOCK, {})).toBe(BLOCK);
  });
});

describe('starting and holding a run', () => {
  it('is locked until the campaign has come far enough', () => {
    expect(isDescentUnlocked(RULES, 1)).toBe(false);
    expect(isDescentUnlocked(RULES, 2)).toBe(true);
    expect(canStartDescent(fresh(), RULES, 1, DAY)).toBe(false);
    expect(canStartDescent(fresh(), RULES, 2, DAY)).toBe(true);
  });

  it('copies the crew rather than referring to it', () => {
    const state = startDescent(fresh(), RULES, DAY, { front: ['a'], back: ['b'] });

    expect(state.descent?.party).toEqual({ front: ['a'], back: ['b'] });
    expect(state.descent?.cleared).toBe(0);
    expect(state.descent?.lives).toBe(RULES.lives);
  });

  it('treats a run from a past day as no run at all', () => {
    // ⚠️ **The entire daily reset.** No roll pass, no expiry flag, nothing to reconcile — and
    // nothing owed for abandoning it, because a run banks fight by fight.
    const state = running();

    expect(descentRunFor(state, DAY)).not.toBeNull();
    expect(descentRunFor(state, DAY + 1)).toBeNull();
    expect(canStartDescent(state, RULES, 5, DAY)).toBe(false);
    expect(canStartDescent(state, RULES, 5, DAY + 1)).toBe(true);
  });

  it('refuses a second run on the same day even once it is finished', () => {
    const finished = running({ cleared: 9 });

    expect(descentStatus(RULES, runOf(finished))).toBe('complete');
    expect(canStartDescent(finished, RULES, 5, DAY)).toBe(false);
  });
});

describe('where a run stands', () => {
  it('reads ready before the first fight and choosing after a win', () => {
    expect(descentStatus(RULES, runOf(running()))).toBe('ready');
    expect(descentStatus(RULES, runOf(running({ cleared: 1 })))).toBe('choosing');
    expect(descentStatus(RULES, runOf(running({ cleared: 1, cards: ['edge:0'] })))).toBe('ready');
  });

  it('reads complete at the top and ended when the lives run out', () => {
    expect(descentStatus(RULES, runOf(running({ cleared: 9 })))).toBe('complete');
    expect(descentStatus(RULES, runOf(running({ lives: 0 })))).toBe('ended');
    // ⚠️ Complete beats ended: a run that finished on its last life finished.
    expect(descentStatus(RULES, runOf(running({ cleared: 9, lives: 0 })))).toBe('complete');
  });

  it('owes one card per win, and none after the last fight', () => {
    const held = (cleared: number, cards: number): DescentRun =>
      runOf(running({ cleared, cards: Array(cards).fill('edge:0') }));

    expect(descentCardsOwed(RULES, held(8, 7))).toBe(1);
    // ⚠️ The ninth win owes nothing: a card after the last fight is a choice with nothing to spend
    // it on, which is why `descentChoices` is one fewer than `descentFights`.
    expect(descentCardsOwed(RULES, held(9, 8))).toBe(0);
    expect(descentCardsOwed(RULES, held(0, 0))).toBe(0);
  });

  it('offers no next fight while a card is owed or the run is over', () => {
    expect(nextDescentFight(RULES, runOf(running()))).toBe(1);
    expect(nextDescentFight(RULES, runOf(running({ cleared: 1 })))).toBeNull();
    expect(nextDescentFight(RULES, runOf(running({ cleared: 9 })))).toBeNull();
    expect(nextDescentFight(RULES, runOf(running({ lives: 0 })))).toBeNull();
  });
});

describe('taking a card', () => {
  it('takes one when one is owed', () => {
    const state = takeDescentCard(running({ cleared: 1 }), RULES, DAY, 'edge:0');

    expect(state.descent?.cards).toEqual(['edge:0']);
  });

  it('refuses a second card off one win', () => {
    // ⚠️ What stops a caller banking eight cards off one fight.
    const once = takeDescentCard(running({ cleared: 1 }), RULES, DAY, 'edge:0');
    const twice = takeDescentCard(once, RULES, DAY, 'edge:1');

    expect(twice).toBe(once);
  });

  it('refuses a card for a day that is not the run s', () => {
    const state = running({ cleared: 1 });

    expect(takeDescentCard(state, RULES, DAY + 1, 'edge:0')).toBe(state);
  });
});

describe('folding a fight back into the run', () => {
  it('advances the battle counter win or lose', () => {
    const state = running();

    expect(applyDescentResult(state, RULES, DAY, 1, DEFEAT).battleCount).toBe(1);
    expect(
      applyDescentResult(
        state,
        RULES,
        DAY,
        1,
        victory([{ defId: 'a', hp: 5, maxHp: 10, energy: 3 }]),
      ).battleCount,
    ).toBe(1);
  });

  it('costs a life on a defeat and changes nothing else', () => {
    // ⚠️ **This is what makes the retry the same fight from the same state.** The health, the
    // energy, the cards and the fight index are only ever written on a victory, so there is no
    // separate "as it entered this fight" snapshot to roll back to.
    const before = running({ cleared: 2, cards: ['edge:0', 'brawn:0'] });
    const after = applyDescentResult(before, RULES, DAY, 3, DEFEAT);

    expect(after.descent?.lives).toBe(RULES.lives - 1);
    expect(after.descent?.cleared).toBe(2);
    expect(after.descent?.cards).toEqual(['edge:0', 'brawn:0']);
    expect(after.wallet.summons.toNumber()).toBe(0);
  });

  it('never takes the lives below zero', () => {
    const out = applyDescentResult(running({ lives: 0 }), RULES, DAY, 1, DEFEAT);

    expect(out.descent?.lives).toBe(0);
  });

  it('records the survivors health as a fraction and drops the fallen from the crew', () => {
    const state = applyDescentResult(
      running(),
      RULES,
      DAY,
      1,
      victory([
        { defId: 'a', hp: 3, maxHp: 12, energy: 40 },
        { defId: 'c', hp: 12, maxHp: 12, energy: 0 },
      ]),
    );

    expect(state.descent?.health).toEqual({ a: 0.25, c: 1 });
    expect(state.descent?.energy).toEqual({ a: 40, c: 0 });
    // ⚠️ The fallen leave the crew as well as the health table. Either alone would be a body on the
    // board at zero health that every targeting rule then has to step around — and one that goes on
    // paying the lineup bonus for somebody who is not fighting.
    expect(state.descent?.party).toEqual({ front: ['a'], back: ['c'] });
  });

  it('pays the fight s crystals and the lump', () => {
    const state = applyDescentResult(
      running(),
      RULES,
      DAY,
      1,
      victory([{ defId: 'a', hp: 1, maxHp: 1, energy: 0 }]),
    );

    expect(state.wallet.summons.toNumber()).toBe(100);
    expect(state.wallet.gold.toNumber()).toBe(10);
  });

  it('pays the completion bonus and the emblems only on the last fight', () => {
    const mid = applyDescentResult(
      running({ cleared: 7, cards: Array(7).fill('edge:0') }),
      RULES,
      DAY,
      8,
      victory([{ defId: 'a', hp: 1, maxHp: 1, energy: 0 }]),
    );
    const last = applyDescentResult(
      running({ cleared: 8, cards: Array(8).fill('edge:0') }),
      RULES,
      DAY,
      9,
      victory([{ defId: 'a', hp: 1, maxHp: 1, energy: 0 }]),
    );

    expect(mid.wallet.emblem.toNumber()).toBe(0);
    expect(mid.descentRuns).toBe(0);
    expect(last.wallet.emblem.toNumber()).toBe(RULES.completionEmblems);
    expect(last.wallet.summons.toNumber()).toBe(500 + RULES.summons.completion);
    // The only mark a run leaves once its day has passed.
    expect(last.descentRuns).toBe(1);
  });

  it('refuses a fight index the run is not on', () => {
    // A guard against a damaged save and a future caller. Nothing in the UI can reach it —
    // `nextDescentFight` never offers anything else.
    const state = running();
    const wrong = applyDescentResult(
      state,
      RULES,
      DAY,
      4,
      victory([{ defId: 'a', hp: 1, maxHp: 1, energy: 0 }]),
    );

    expect(wrong.descent?.cleared).toBe(0);
    expect(wrong.wallet.summons.toNumber()).toBe(0);
  });

  it('never touches the ladder, the clear count or an idle rate', () => {
    // ⚠️ **The fence this mode stands behind.** The clear count drives the idle crystal rate, and a
    // daily nine-fight mode feeding it would raise a rate every day forever.
    const before = running();
    const after = applyDescentResult(
      before,
      RULES,
      DAY,
      1,
      victory([{ defId: 'a', hp: 1, maxHp: 1, energy: 0 }]),
    );

    expect(after.clearedStages).toBe(before.clearedStages);
    expect(after.chapter).toBe(before.chapter);
    expect(after.stage).toBe(before.stage);
    expect(after.rates).toEqual(before.rates);
  });
});

describe('reading a run off an untrusted save', () => {
  it('round-trips a run', () => {
    const run = runOf(running({ cleared: 3, cards: ['edge:0'], health: { a: 0.5 } }));

    expect(parseDescent(serializeDescent(run), () => undefined)).toEqual(run);
  });

  it('encodes no run as null', () => {
    expect(serializeDescent(null)).toBeNull();
    expect(parseDescent(null, () => undefined)).toBeNull();
    expect(parseDescent(undefined, () => undefined)).toBeNull();
  });

  it('discards a run whose counters are damaged rather than half-repairing it', () => {
    // ⚠️ **The safe direction here, unlike elsewhere in the save layer.** A damaged run costs one
    // day of optional content; a half-repaired one could carry a crew that no longer matches its
    // health table, which is a fight opening with somebody at full health who should not be.
    const notes: string[] = [];
    const note = (field: string): void => {
      notes.push(field);
    };

    expect(parseDescent({ day: -1, cleared: 0, lives: 2 }, note)).toBeNull();
    expect(parseDescent({ day: 1, cleared: 1.5, lives: 2 }, note)).toBeNull();
    expect(parseDescent('nonsense', note)).toBeNull();
    expect(notes.length).toBeGreaterThan(0);
  });

  it('clamps a health share above one', () => {
    const run = parseDescent(
      { day: 1, cleared: 0, lives: 2, party: { front: ['a'], back: [] }, health: { a: 9 } },
      () => undefined,
    );

    expect(run?.health).toEqual({ a: 1 });
  });

  it('drops a non-numeric health entry rather than the whole run', () => {
    const notes: string[] = [];
    const run = parseDescent(
      {
        day: 1,
        cleared: 0,
        lives: 2,
        party: { front: ['a', 'b'], back: [] },
        health: { a: 0.5, b: 'half' },
      },
      (field) => {
        notes.push(field);
      },
    );

    expect(run?.health).toEqual({ a: 0.5 });
    expect(notes).toContain('descent.health.b');
  });
});
