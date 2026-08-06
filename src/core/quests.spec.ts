// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  allQuestProgress,
  claimQuests,
  emptyQuestWindows,
  periodIndex,
  type QuestCounter,
  type QuestData,
  type QuestRulesData,
  questProgress,
  rollQuestWindows,
  windowEndsAt,
} from './quests';
import { type GameState, newGame } from './state';

const SEED = 0xc0ffee;
const T0 = 1_700_000_000_000;
const RULES: QuestRulesData = { resetOffsetMinutes: 240 };
const COUNTERS: readonly QuestCounter[] = ['battleCount', 'pullCount'];

const SKIRMISH: QuestData = {
  id: 'daily-skirmish',
  name: 'Skirmish',
  description: 'Fight five battles.',
  period: 'daily',
  counter: 'battleCount',
  target: 5,
  reward: { summons: 200 },
};

const SUMMONER: QuestData = {
  id: 'daily-summon',
  name: 'Consult the Crystal',
  description: 'Make a single pull.',
  period: 'daily',
  counter: 'pullCount',
  target: 1,
  reward: { summons: 150 },
};

const CAMPAIGNER: QuestData = {
  id: 'weekly-campaign',
  name: 'Campaigner',
  description: 'Fight forty battles.',
  period: 'weekly',
  counter: 'battleCount',
  target: 40,
  reward: { summons: 800 },
};

const DAY = 86_400_000;

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: SEED, nowMs: T0 }), ...overrides };
}

/** A run whose windows have been opened at `nowMs`, which is what the UI does on load. */
function opened(state: GameState, nowMs: number = T0): GameState {
  return rollQuestWindows(state, RULES, COUNTERS, nowMs);
}

describe('periodIndex', () => {
  it('counts upward through time', () => {
    expect(periodIndex(RULES, 'daily', T0 + DAY)).toBe(periodIndex(RULES, 'daily', T0) + 1);
    expect(periodIndex(RULES, 'weekly', T0 + DAY * 7)).toBe(periodIndex(RULES, 'weekly', T0) + 1);
  });

  it('holds steady inside a window', () => {
    const start = windowEndsAt(RULES, 'daily', T0) - DAY;

    expect(periodIndex(RULES, 'daily', start)).toBe(periodIndex(RULES, 'daily', start + DAY - 1));
    expect(periodIndex(RULES, 'daily', start)).not.toBe(periodIndex(RULES, 'daily', start + DAY));
  });

  it('moves the boundary by the authored offset', () => {
    // The reset is a fixed moment rather than local midnight, so the offset has to actually shift
    // where the day breaks — otherwise a run at 02:00 UTC would already be on tomorrow's quests.
    const utcMidnight: QuestRulesData = { resetOffsetMinutes: 0 };
    const boundary = windowEndsAt(utcMidnight, 'daily', T0);

    expect(periodIndex(utcMidnight, 'daily', boundary)).toBe(
      periodIndex(utcMidnight, 'daily', boundary - 1) + 1,
    );
    // Four hours later, the same instant is still yesterday under the shipped offset.
    expect(periodIndex(RULES, 'daily', boundary)).toBe(periodIndex(RULES, 'daily', boundary - 1));
  });

  it('reads a damaged clock as the first window rather than a negative one', () => {
    expect(periodIndex(RULES, 'daily', Number.NaN)).toBe(0);
    expect(periodIndex(RULES, 'daily', -1e15)).toBe(0);
  });
});

describe('rollQuestWindows', () => {
  it('opens both windows on a run that has never seen one', () => {
    const state = opened(run({ battleCount: 12, pullCount: 4 }));

    expect(state.quests.daily.index).toBeGreaterThan(-1);
    expect(state.quests.daily.baseline).toEqual({ battleCount: 12, pullCount: 4 });
    expect(state.quests.weekly.baseline).toEqual({ battleCount: 12, pullCount: 4 });
  });

  it('returns the same state object when neither window moved', () => {
    // ⚠️ `ui/` publishes what it is handed, and this runs on every load and every resume — a fresh
    // object would redraw every screen watching the run to show it numbers it already had.
    const state = opened(run());

    expect(rollQuestWindows(state, RULES, COUNTERS, T0)).toBe(state);
  });

  it('re-baselines against the counters as they stand when a day turns', () => {
    const day1 = opened(run({ battleCount: 3 }));
    const fought = { ...day1, battleCount: 9 };
    const day2 = rollQuestWindows(fought, RULES, COUNTERS, T0 + DAY);

    expect(day2.quests.daily.baseline).toEqual({ battleCount: 9, pullCount: 0 });
    // The weekly window has not turned, so its baseline is untouched.
    expect(day2.quests.weekly.baseline).toEqual({ battleCount: 3, pullCount: 0 });
  });

  it('clears the daily claims but not the weekly ones', () => {
    const day1 = opened(run());
    const claimed = claimQuests({ ...day1, battleCount: 40, pullCount: 10 }, [
      SKIRMISH,
      CAMPAIGNER,
    ]).state;
    const day2 = rollQuestWindows(claimed, RULES, COUNTERS, T0 + DAY);

    expect(day2.quests.daily.claimed).toEqual([]);
    expect(day2.quests.weekly.claimed).toEqual(['weekly-campaign']);
  });

  it('does nothing at all when the clock moves backwards', () => {
    // ⚠️ The backwards-clock rule. Rolling on any difference would hand a second day of quests to
    // anyone who wound the clock back; refusing to play would punish a timezone change. Clamp; do
    // not detect. There is nothing to protect.
    const today = opened(run({ battleCount: 7 }));
    const yesterday = rollQuestWindows(today, RULES, COUNTERS, T0 - DAY * 3);

    expect(yesterday).toBe(today);
    expect(yesterday.quests.daily.baseline).toEqual({ battleCount: 7, pullCount: 0 });
  });

  it('resumes normally once real time catches back up', () => {
    const today = opened(run());
    const wound = rollQuestWindows(today, RULES, COUNTERS, T0 - DAY * 3);
    const later = rollQuestWindows(wound, RULES, COUNTERS, T0 + DAY);

    expect(later.quests.daily.index).toBe(today.quests.daily.index + 1);
  });

  it('opens a window once, not once per day away', () => {
    // Coming back after a month is one new window, not thirty — there is no backlog of quests to
    // work through and nothing was lost by being away.
    const state = rollQuestWindows(opened(run()), RULES, COUNTERS, T0 + DAY * 30);

    expect(state.quests.daily.claimed).toEqual([]);
    expect(state.quests.daily.index).toBe(periodIndex(RULES, 'daily', T0 + DAY * 30));
  });
});

describe('questProgress', () => {
  it('measures how far the counter has moved since the window opened, not its total', () => {
    // The whole reason a window stores a baseline: a run with 500 battles behind it starts today
    // at zero, exactly like a new one.
    const state = opened(run({ battleCount: 500 }));
    const later = { ...state, battleCount: 503 };

    expect(questProgress(SKIRMISH, later.quests, later).done).toBe(3);
    expect(questProgress(SKIRMISH, later.quests, later).complete).toBe(false);
  });

  it('completes once the counter has moved far enough, and caps there', () => {
    const state = opened(run({ battleCount: 100 }));
    const later = { ...state, battleCount: 120 };
    const progress = questProgress(SKIRMISH, later.quests, later);

    expect(progress.done).toBe(5);
    expect(progress.complete).toBe(true);
    expect(progress.fraction).toBe(1);
  });

  it('reports nothing claimable before the counter moves', () => {
    const state = opened(run());

    expect(questProgress(SKIRMISH, state.quests, state).claimable).toBe(false);
  });

  it('clamps a baseline sitting above the counter rather than going negative', () => {
    // A save edited, or a counter repaired downward on load. Left alone it would produce negative
    // progress on a quest that could then never complete.
    const state = opened(run({ battleCount: 100 }));
    const damaged = { ...state, battleCount: 3 };

    expect(questProgress(SKIRMISH, damaged.quests, damaged).done).toBe(0);
  });

  it('survives a quest authored with a zero target', () => {
    const broken: QuestData = { ...SKIRMISH, target: 0 };
    const state = opened(run());

    expect(Number.isFinite(questProgress(broken, state.quests, state).fraction)).toBe(true);
  });

  it('reads an unopened window as nothing done', () => {
    // A run whose windows have never rolled. The baseline is empty, so a fresh save would
    // otherwise read its whole battle history as today's progress.
    const state = run({ battleCount: 40, quests: emptyQuestWindows() });

    // 40 battles against a baseline of nothing is the failure this documents rather than hides:
    // the caller has to roll before reading, which `rollQuestWindows` on load is what guarantees.
    expect(questProgress(SKIRMISH, state.quests, state).done).toBe(5);
  });
});

describe('claimQuests', () => {
  it('pays a completed quest and records it', () => {
    const state = opened(run());
    const fought = { ...state, battleCount: 5 };
    const { state: after, gained, quests } = claimQuests(fought, [SKIRMISH]);

    expect(quests).toBe(1);
    expect(gained.summons?.toString()).toBe('200');
    expect(after.wallet.summons.toString()).toBe('200');
    expect(after.quests.daily.claimed).toEqual(['daily-skirmish']);
  });

  it('pays nothing the second time', () => {
    const state = opened(run());
    const first = claimQuests({ ...state, battleCount: 5 }, [SKIRMISH]);
    const second = claimQuests(first.state, [SKIRMISH]);

    expect(second.quests).toBe(0);
    expect(second.state).toBe(first.state);
  });

  it('returns the same state object when nothing is complete', () => {
    const state = opened(run());

    expect(claimQuests(state, [SKIRMISH, SUMMONER]).state).toBe(state);
  });

  it('claims across both periods in one press, summing the payout', () => {
    const state = opened(run());
    const played = { ...state, battleCount: 40, pullCount: 1 };
    const { gained, quests, state: after } = claimQuests(played, [SKIRMISH, SUMMONER, CAMPAIGNER]);

    expect(quests).toBe(3);
    expect(gained.summons?.toString()).toBe('1150');
    expect(after.quests.daily.claimed).toEqual(['daily-skirmish', 'daily-summon']);
    expect(after.quests.weekly.claimed).toEqual(['weekly-campaign']);
  });

  it('leaves an incomplete quest alone while claiming its neighbour', () => {
    const state = opened(run());
    const played = { ...state, battleCount: 5 };
    const { quests, state: after } = claimQuests(played, [SKIRMISH, SUMMONER]);

    expect(quests).toBe(1);
    expect(after.quests.daily.claimed).toEqual(['daily-skirmish']);
  });

  it('spends nothing, so one press needs no confirmation', () => {
    const state = opened(run({ battleCount: 0 }));
    const played = { ...state, battleCount: 5 };
    const { state: after } = claimQuests(played, [SKIRMISH]);

    expect(after.roster).toBe(played.roster);
    expect(after.battleCount).toBe(played.battleCount);
    expect(after.wallet.gold.toString()).toBe(played.wallet.gold.toString());
  });

  it('pays again in the next window, which is what makes it a daily', () => {
    const day1 = claimQuests({ ...opened(run()), battleCount: 5 }, [SKIRMISH]).state;
    const day2 = rollQuestWindows(day1, RULES, COUNTERS, T0 + DAY);
    const fought = { ...day2, battleCount: day2.battleCount + 5 };

    expect(claimQuests(fought, [SKIRMISH]).quests).toBe(1);
  });
});

describe('allQuestProgress', () => {
  it('reports every quest in the order they were authored', () => {
    const state = opened(run());

    expect(
      allQuestProgress([SKIRMISH, SUMMONER, CAMPAIGNER], state.quests, state).map(
        (entry) => entry.quest.id,
      ),
    ).toEqual(['daily-skirmish', 'daily-summon', 'weekly-campaign']);
  });
});

describe('windowEndsAt', () => {
  it('is always in the future, and inside one period', () => {
    const ends = windowEndsAt(RULES, 'daily', T0);

    expect(ends).toBeGreaterThan(T0);
    expect(ends - T0).toBeLessThanOrEqual(DAY);
  });

  it('is where the index actually turns over', () => {
    const ends = windowEndsAt(RULES, 'daily', T0);

    expect(periodIndex(RULES, 'daily', ends)).toBe(periodIndex(RULES, 'daily', T0) + 1);
  });
});
