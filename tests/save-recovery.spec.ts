import { expect, type Page, test } from '@playwright/test';
import {
  type ChapterCurveData,
  type ChapterData,
  ladderShape,
  num,
  positionAt,
  resolveLadder,
  type StageRewardCurveData,
  summonRatePerSecond,
  totalStages,
} from '../src/core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS, SUMMON_RATE } from '../src/data';
import { formatNumeric, formatRate } from '../src/ui/format-numeric';

/**
 * Regression cover for a real save-corrupting bug.
 *
 * The `v2 → v3` migration carried `goldPerSec` into the wallet's gold rate and started xp,
 * essence and summons at zero. A player returning from a pre-gacha build watched their gold tick
 * up while nothing else moved, and the only way to switch the other three on was to re-fight a
 * stage they had already beaten — which then also paid a first-clear bonus it should not have,
 * because the same migration undercounted `clearedStages` at the top of the ladder.
 *
 * These run against a real browser rather than a unit fake because the failure was in the
 * *load path*: migration, repair and the game loop composing correctly. The unit tests pin each
 * piece; this pins that a save on disk turns into a working run.
 *
 * Capacitor's Preferences web backend is `localStorage` under a `CapacitorStorage.` prefix, so a
 * save is seeded by writing that key before the app boots.
 */
const SAVE_KEY = 'CapacitorStorage.save';
const BACKUP_KEY = 'CapacitorStorage.save.bak';

/** Seeds a save that the app will read on its next load. */
async function seedSave(page: Page, save: unknown): Promise<void> {
  await page.addInitScript(
    ([key, backup, value]) => {
      localStorage.setItem(key, value);
      localStorage.removeItem(backup);
    },
    [SAVE_KEY, BACKUP_KEY, JSON.stringify(save)] as const,
  );
}

const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;

const LADDER = ladderShape(chapters);
const STAGES = resolveLadder(chapters, chapterCurve, rewards);
const CLEARS = totalStages(LADDER);

/**
 * How far the pre-gacha save below had climbed, and the stage whose rates it therefore carries.
 *
 * ⚠️ **Twenty-four rather than the whole ladder, and that is the point of the number.** A v2 save
 * is a linear stage number written by a build that shipped twenty-four stages, and since milestone
 * 11 the repair will not credit more clears than the position it is parked on has reached — a
 * guard that exists precisely because the rate curve was re-derived underneath every save, so an
 * old receipt read against the new curve says "cleared everything". Seeding a hundred here would
 * describe a save that cannot exist and would quietly stop testing the guard.
 */
const RECOVERED = 24;
const top = STAGES[RECOVERED - 1];

/**
 * The crystal rate a run credited with `RECOVERED` clears earns, per second.
 *
 * Derived rather than read off `top`, because no stage authors a crystal rate: it is a function
 * of the clear count, so repairing the count is what repairs this rate. That makes it the one
 * number on this screen that proves the two halves of the repair agreed.
 */
const crystalRate = summonRatePerSecond(SUMMON_RATE, RECOVERED);

/** Every first-clear bonus the repair is going to credit, which is what the run is owed. */
const owedCrystals = STAGES.slice(0, RECOVERED).reduce(
  (total, stage) => total + Number(stage.firstClearSummons ?? 0),
  0,
);

/** Where `RECOVERED` stages in lands, as a chapter and a stage within it. */
const parked = positionAt(LADDER, RECOVERED);

/**
 * What the home screen will render for a rate or a balance.
 *
 * Borrowed from `ui/` rather than restated, for the same reason the rates above are read from
 * `data/`. This file used to spell out the hourly form for essence and crystals, which was true
 * only while both sat under the formatter's per-second threshold — doubling the ladder pushed
 * essence over it, and the assertion started describing a screen the app no longer draws.
 */
const shownRate = (perSecond: number | string): string => formatRate(num(perSecond));
const shownAmount = (value: number | string): string => formatNumeric(num(value));

/** One currency's card in the home screen's wallet strip, gold included. */
function cardOf(page: Page, label: string) {
  return page.locator('.wallet__item').filter({ hasText: label });
}

/** The rate shown under one currency on the home screen, e.g. `3/s` or `180/hr`. */
function rateOf(page: Page, label: string) {
  return cardOf(page, label).locator('.wallet__rate');
}

/** The balance shown for one currency. */
function amountOf(page: Page, label: string) {
  return cardOf(page, label).locator('.wallet__amount');
}

test.describe('recovering a pre-gacha save', () => {
  /** A v2 save from a player who had cleared the whole ladder that build shipped. */
  const v2AtTheTop = {
    version: 2,
    gold: '1500000',
    goldPerSec: String(top.rates.gold),
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage: RECOVERED,
    battleCount: 214,
  };

  test('restores every idle rate the run had already earned', async ({ page }) => {
    // The reported symptom: gold accumulating, nothing else. The surviving gold rate is enough
    // to know how far the run got, so none of this should need a fight to come back.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();

    await expect(rateOf(page, 'Gold')).toHaveText(shownRate(top.rates.gold));
    await expect(rateOf(page, 'XP')).toHaveText(shownRate(top.rates.xp));
    await expect(rateOf(page, 'Essence')).toHaveText(shownRate(top.rates.essence));
    await expect(rateOf(page, 'Crystals')).toHaveText(formatRate(crystalRate));
  });

  test('pays the first-clear bonuses the ladder had already earned', async ({ page }) => {
    // Marking those stages cleared without paying them would close the door for good —
    // `applyBattleResult` would never pay them either. A run that beat the whole ladder is owed
    // every bonus on it, the same as a new player earns for climbing the same stages.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    await expect(amountOf(page, 'Crystals')).toHaveText(shownAmount(owedCrystals));
  });

  test('leaves enough crystals to actually pull', async ({ page }) => {
    // The symptom underneath the symptom: a returning player with a fully cleared ladder could
    // not afford a single ten-pull, because none of the bonuses had ever been paid.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    await page.getByRole('link', { name: 'Summon' }).click();

    await expect(page.getByRole('button', { name: /Pull ×10/ })).toBeEnabled();
  });

  test('keeps the gold balance and the stage the run was on', async ({ page }) => {
    // Repair must not cost the player anything it was meant to give back.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    await expect(amountOf(page, 'Gold')).toHaveText('1.5M');
    await expect(
      page.getByRole('button', { name: new RegExp(`^Fight ${parked.chapter}-${parked.stage} `) }),
    ).toBeVisible();
  });

  test('leaves a save written by this build untouched', async ({ page }) => {
    // The repair runs on every load, so a healthy save has to pass through unchanged.
    await seedSave(page, v2AtTheTop);
    await page.goto('');
    await expect(rateOf(page, 'XP')).toHaveText(shownRate(top.rates.xp));

    // Second load, now reading the current-version save the first one wrote.
    await page.reload();

    await expect(rateOf(page, 'XP')).toHaveText(shownRate(top.rates.xp));
    await expect(rateOf(page, 'Crystals')).toHaveText(formatRate(crystalRate));
  });
});

test.describe('re-fighting a cleared stage', () => {
  /** The last stage of the shipped ladder, which is what a fully cleared run's rates are. */
  const atTheTop = STAGES[CLEARS - 1];

  /**
   * A v3 save sitting on stage 1 with the whole ladder already cleared — so the next fight is
   * unambiguously a re-fight, and it is the opening stage rather than the boss.
   *
   * Deliberately still written in the **v3** shape, `activeParty` and all. This is the only test
   * in the suite that exercises the migration chain end to end against a real browser, and
   * rewriting it into the current shape every time the schema moves would quietly convert it
   * into a test of nothing.
   */
  const clearedEverything = {
    version: 3,
    wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0' },
    rates: {
      gold: String(atTheTop.rates.gold),
      xp: String(atTheTop.rates.xp),
      essence: String(atTheTop.rates.essence),
      summons: String(summonRatePerSecond(SUMMON_RATE, CLEARS)),
    },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage: 1,
    clearedStages: CLEARS,
    battleCount: 214,
    roster: [
      { defId: 'rin', rarity: 0, level: 1, copies: 0 },
      { defId: 'bran', rarity: 0, level: 1, copies: 0 },
      { defId: 'mira', rarity: 0, level: 1, copies: 0 },
    ],
    activeParty: ['rin', 'bran', 'mira'],
    pity: 0,
    pullCount: 0,
  };

  test('pays the lump but never a second first-clear bonus', async ({ page }) => {
    // Stage 1's first-clear bonus is 200 crystals against an idle rate of 150/hr, so a bonus
    // firing again is unmistakable: the balance would jump past 200 rather than creeping up by
    // a fraction over the few seconds this test takes.
    await seedSave(page, clearedEverything);
    await page.goto('');

    await page.getByRole('button', { name: /^Fight 1-1 / }).click();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.getByRole('button', { name: /^Close the battle/ })).toBeVisible({
      timeout: 15_000,
    });

    // The one-off reward still lands — farming a beaten stage is meant to pay. Read off the
    // shipped curve rather than typed, like everything else in this file.
    await expect(page.locator('.battle__outcome')).toContainText(
      `${shownAmount(STAGES[0].reward.gold ?? 0)} gold`,
    );

    await page.getByRole('button', { name: /^Close the battle/ }).click();

    await expect(amountOf(page, 'Crystals')).not.toHaveText(/^\d{3,}/);
  });

  test('does not disturb the idle rates it already had', async ({ page }) => {
    await seedSave(page, clearedEverything);
    await page.goto('');

    await page.getByRole('button', { name: /^Fight 1-1 / }).click();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.getByRole('button', { name: /^Close the battle/ })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^Close the battle/ }).click();

    // Still the top-of-ladder rates, not stage 1's.
    await expect(rateOf(page, 'Gold')).toHaveText(shownRate(atTheTop.rates.gold));
    await expect(rateOf(page, 'XP')).toHaveText(shownRate(atTheTop.rates.xp));
    await expect(rateOf(page, 'Essence')).toHaveText(shownRate(atTheTop.rates.essence));
  });
});
