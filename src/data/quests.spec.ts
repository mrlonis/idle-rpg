// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import { type QuestData, type QuestPeriod, type QuestRulesData } from '../core';
import { PULL_COST, SUMMON_RATE } from './banners';
import { QUEST_RULES, QUESTS } from './quests';

/**
 * Conformance through typed locals, because `data/` may not import `core/`.
 *
 * This is what turns a quest naming a counter the run does not keep — `clearedStages`, most
 * obviously — into a compile error rather than a row that silently never completes.
 */
const quests: readonly QuestData[] = QUESTS;
const rules: QuestRulesData = QUEST_RULES;

const of = (period: QuestPeriod): readonly QuestData[] =>
  quests.filter((quest) => quest.period === period);

/** What one period pays if every quest in it is finished. */
const payout = (period: QuestPeriod): number =>
  of(period).reduce((sum, quest) => sum + (quest.reward.summons ?? 0), 0);

describe('quest content', () => {
  it('ships both periods, with unique ids', () => {
    const ids = quests.map((quest) => quest.id);

    expect(of('daily').length).toBeGreaterThan(0);
    expect(of('weekly').length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every quest and says what it asks for', () => {
    for (const quest of quests) {
      expect(quest.name.length, quest.id).toBeGreaterThan(0);
      expect(quest.description.length, quest.id).toBeGreaterThan(0);
    }
  });

  it('gives every quest a reachable target', () => {
    for (const quest of quests) {
      expect(Number.isInteger(quest.target), quest.id).toBe(true);
      expect(quest.target, quest.id).toBeGreaterThan(0);
    }
  });

  it('pays every quest in crystals and nothing else', () => {
    // ⚠️ The load-bearing content rule. Gold, xp and essence are spent against a level curve worth
    // ×10⁹, so a flat quantity of any of them is invisible a chapter or two in — the same argument
    // `docs/gear.md` makes for gear bonuses being percentages. A pull costs a flat `PULL_COST`
    // forever, so crystals are the one payout that means the same thing at stage 5 and stage 5,000.
    for (const quest of quests) {
      expect(Object.keys(quest.reward), quest.id).toEqual(['summons']);
      expect(quest.reward.summons, quest.id).toBeGreaterThan(0);
    }
  });

  it('measures every quest against a counter that never stops moving', () => {
    // ⚠️ `clearedStages` counts *first* clears, so it stops the moment a run reaches the top of the
    // authored ladder — and a daily a player at the end of the content can never finish is a
    // permanent empty row. The type already forbids it; this states why in the place somebody
    // would go to add one.
    // ⚠️ `descentRuns` is on this list and `signatureLevels` is not, which is the pair that says
    // what the rule actually is. The test is not "monotonic" — `clearedStages` is monotonic — it is
    // "can a player make this move today". The Descent is offered afresh every day forever; signature
    // levels stop dead once every item is maxed and do not move at all before the first one unlocks.
    for (const quest of quests) {
      expect(['battleCount', 'pullCount', 'descentRuns'], quest.id).toContain(quest.counter);
    }
  });
});

describe('quest pacing', () => {
  it('asks for a day of quests that a single sitting finishes', () => {
    // A battle is a tap and resolves in well under a minute. A daily that needed more than a
    // session would be a chore with a deadline, which is the pattern this project rejects.
    for (const quest of of('daily')) {
      expect(quest.target, quest.id).toBeLessThanOrEqual(10);
    }
  });

  it('never asks a player to have saved crystals up', () => {
    // ⚠️ Derived from the base rate rather than assumed: a run that has cleared nothing still earns
    // `basePerHour` crystals, so the pull quest has to be affordable out of a single day of the
    // most pessimistic income there is. Otherwise the quest that exists to pay a stuck player would
    // be gated behind the thing they are short of.
    const pullsAffordablePerDay = (SUMMON_RATE.basePerHour * 24) / PULL_COST;
    const pullQuests = quests.filter((quest) => quest.counter === 'pullCount');

    expect(pullQuests.length).toBeGreaterThan(0);
    for (const quest of pullQuests) {
      const perDay = quest.period === 'weekly' ? quest.target / 7 : quest.target;
      expect(perDay, quest.id).toBeLessThanOrEqual(pullsAffordablePerDay);
    }
  });

  it('makes the weekly tier a bonus for consistency rather than a second obligation', () => {
    // ⚠️ Not seven times the dailies. A player who does their dailies should finish the weeklies
    // without noticing; a weekly that demanded materially more would be the chore-with-a-deadline
    // shape again. If this fails after retuning, the weekly targets are what moved too far.
    for (const weekly of of('weekly')) {
      const daily = of('daily').find((quest) => quest.counter === weekly.counter);
      if (daily === undefined) {
        continue;
      }
      expect(weekly.target, weekly.id).toBeLessThanOrEqual(daily.target * 7);
    }
  });

  it('supplements idle income without replacing it', () => {
    // ⚠️ Both bounds are the design. Below the floor quests are decorative; above the ceiling they
    // out-earn the ladder and climbing stops being the point. Derived from `PULL_COST` and the
    // crystal rate so retuning either re-runs this rather than leaving it measuring the old economy.
    const questPullsPerDay = (payout('daily') + payout('weekly') / 7) / PULL_COST;
    const idlePullsPerDay = (SUMMON_RATE.basePerHour * 24) / PULL_COST;

    expect(questPullsPerDay).toBeGreaterThan(1);
    expect(questPullsPerDay).toBeLessThan(idlePullsPerDay * 3);
  });
});

describe('the reset boundary', () => {
  it('falls at a fixed moment rather than following a device', () => {
    // ⚠️ A reset that followed the device's timezone would hand a second day to anyone flying east
    // and take one from anyone flying west — and `core/` has no clock to read a timezone off.
    expect(Number.isInteger(rules.resetOffsetMinutes)).toBe(true);
    expect(rules.resetOffsetMinutes).toBeGreaterThanOrEqual(0);
    expect(rules.resetOffsetMinutes).toBeLessThan(24 * 60);
  });

  it('does not land in the middle of an evening session', () => {
    // A player still up at 00:30 is having tonight's session, not tomorrow's.
    expect(rules.resetOffsetMinutes).toBeGreaterThanOrEqual(2 * 60);
    expect(rules.resetOffsetMinutes).toBeLessThanOrEqual(6 * 60);
  });
});
