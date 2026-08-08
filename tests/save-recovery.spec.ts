import { expect, type Page, test } from '@playwright/test';
import {
  type ChapterCurveData,
  type ChapterData,
  ladderShape,
  num,
  positionAt,
  resolveLadder,
  SAVE_VERSION,
  type StageRewardCurveData,
  summonRatePerSecond,
  totalStages,
} from '../src/core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS, SUMMON_RATE } from '../src/data';
import { formatNumeric, formatRate } from '../src/ui/format-numeric';
import { FIGHT_LINK, startFight } from './flows';

/**
 * Regression cover for a real save-corrupting bug, kept pointed at what still does that job.
 *
 * A long-deleted migration carried `goldPerSec` into the wallet's gold rate and started xp,
 * essence and summons at zero. A player returning from a pre-gacha build watched their gold tick
 * up while nothing else moved, and the only way to switch the other three on was to re-fight a
 * stage they had already beaten — which then also paid a first-clear bonus it should not have,
 * because the same migration undercounted `clearedStages` at the top of the ladder.
 *
 * **That migration no longer exists.** The chain has twice been re-based to a v0 baseline while the
 * game was pre-release, so the specific save that produced the bug is now discarded rather than
 * repaired. `reconcileClearedStages` did not go with it, because the *shape* of damage it fixes has
 * nothing to do with migrations: a save whose rates say it climbed further than its clear count
 * admits is repairable from the rates alone, and the rule underneath it — crediting a stage and
 * paying for it are the same operation — is what stops crystals disappearing silently. So these
 * tests seed that damage directly instead of arriving at it through a migration.
 *
 * They run against a real browser rather than a unit fake because the failure was in the *load
 * path*: decode, repair and the game loop composing correctly. The unit tests pin each piece;
 * this pins that a save on disk turns into a working run.
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
 * How far the damaged save below had climbed, and the stage whose rates it therefore carries.
 *
 * ⚠️ **Well short of the whole ladder, and that is the point of the number.** The repair will not
 * credit more clears than the position it is parked on has reached — a guard that exists because
 * the rate curve can be re-derived underneath a save, so an old receipt read against a new curve
 * says "cleared everything". Parking the save on stage 24 and seeding stage 24's rates is what
 * exercises both halves: the receipt is believed, and it is believed only that far.
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

test.describe('recovering a save whose clear count was lost', () => {
  /**
   * A run parked on stage 24 earning stage 24's income, with its clear count at zero.
   *
   * The exact state the old migration used to produce, seeded directly now that the migration is
   * gone: rates that say the ladder was climbed, and a counter that says none of it was ever
   * credited or paid for.
   *
   * ⚠️ **Damaged in that one way and healthy in every other**, which is what keeps these tests
   * about `reconcileClearedStages`. A field left out is damage too — a missing `alloy` or
   * `gearMinted` is a reported repair issue, and the home screen draws a banner for those — so a
   * fixture that only half fills the current shape quietly tests the recovery banner as well as
   * the thing it names.
   */
  const lostItsClearCount = {
    version: 0,
    wallet: { gold: '1500000', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
    rates: { gold: String(top.rates.gold), xp: '0', essence: '0', summons: '0' },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    chapter: parked.chapter,
    stage: parked.stage,
    clearedStages: 0,
    battleCount: 214,
    roster: [
      { defId: 'rin', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'bran', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'mira', rarity: 0, level: 1, copies: 0, gear: {} },
    ],
    formations: { campaign: { front: ['bran', 'mira'], back: ['rin'] } },
    pity: 0,
    legendaryPity: 0,
    pullCount: 0,
    gear: [],
    gearMinted: 0,
    gearShop: { slot: 0, purchased: [] },
    achievements: {},
    quests: {
      daily: { index: -1, baseline: {}, claimed: [] },
      weekly: { index: -1, baseline: {}, claimed: [] },
    },
    dispatches: [],
  };

  test('restores every idle rate the run had already earned', async ({ page }) => {
    // The reported symptom: gold accumulating, nothing else. The surviving gold rate is enough
    // to know how far the run got, so none of this should need a fight to come back.
    await seedSave(page, lostItsClearCount);
    await page.goto('');

    await expect(page.getByRole('link', { name: FIGHT_LINK })).toBeVisible();

    await expect(rateOf(page, 'Gold')).toHaveText(shownRate(top.rates.gold));
    await expect(rateOf(page, 'XP')).toHaveText(shownRate(top.rates.xp));
    await expect(rateOf(page, 'Essence')).toHaveText(shownRate(top.rates.essence));
    await expect(rateOf(page, 'Crystals')).toHaveText(formatRate(crystalRate));
  });

  test('pays the first-clear bonuses the ladder had already earned', async ({ page }) => {
    // Marking those stages cleared without paying them would close the door for good —
    // `applyBattleResult` would never pay them either. A run that beat the whole ladder is owed
    // every bonus on it, the same as a new player earns for climbing the same stages.
    await seedSave(page, lostItsClearCount);
    await page.goto('');

    await expect(amountOf(page, 'Crystals')).toHaveText(shownAmount(owedCrystals));
  });

  test('leaves enough crystals to actually pull', async ({ page }) => {
    // The symptom underneath the symptom: a returning player with a fully cleared ladder could
    // not afford a single ten-pull, because none of the bonuses had ever been paid.
    await seedSave(page, lostItsClearCount);
    await page.goto('');

    await page.getByRole('link', { name: 'Town' }).click();
    await page.getByRole('link', { name: /^Summon/ }).click();

    await expect(page.getByRole('button', { name: /Pull ×10/ })).toBeEnabled();
  });

  test('keeps the gold balance and the stage the run was on', async ({ page }) => {
    // Repair must not cost the player anything it was meant to give back.
    await seedSave(page, lostItsClearCount);
    await page.goto('');

    await expect(amountOf(page, 'Gold')).toHaveText('1.5M');
    await expect(
      page.getByRole('link', { name: new RegExp(`^Fight ${parked.chapter}-${parked.stage} `) }),
    ).toBeVisible();
  });

  test('leaves a save written by this build alone on the second load', async ({ page }) => {
    // The repair runs on every load, so a healthy save has to pass through unchanged.
    await seedSave(page, lostItsClearCount);
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
   * A save sitting on stage 1 with the whole ladder already cleared — so the next fight is
   * unambiguously a re-fight, and it is the opening stage rather than the boss.
   */
  const clearedEverything = {
    version: 0,
    wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
    rates: {
      gold: String(atTheTop.rates.gold),
      xp: String(atTheTop.rates.xp),
      essence: String(atTheTop.rates.essence),
      summons: String(summonRatePerSecond(SUMMON_RATE, CLEARS)),
    },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    chapter: 1,
    stage: 1,
    clearedStages: CLEARS,
    battleCount: 214,
    roster: [
      { defId: 'rin', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'bran', rarity: 0, level: 1, copies: 0, gear: {} },
      { defId: 'mira', rarity: 0, level: 1, copies: 0, gear: {} },
    ],
    formations: { campaign: { front: ['bran', 'mira'], back: ['rin'] } },
    pity: 0,
    legendaryPity: 0,
    pullCount: 0,
    gear: [],
    gearMinted: 0,
    gearShop: { slot: 0, purchased: [] },
    achievements: {},
    quests: {
      daily: { index: -1, baseline: {}, claimed: [] },
      weekly: { index: -1, baseline: {}, claimed: [] },
    },
    dispatches: [],
  };

  test('pays the lump but never a second first-clear bonus', async ({ page }) => {
    // Stage 1's first-clear bonus is 200 crystals against an idle rate of 150/hr, so a bonus
    // firing again is unmistakable: the balance would jump past 200 rather than creeping up by
    // a fraction over the few seconds this test takes.
    await seedSave(page, clearedEverything);
    await page.goto('');

    await startFight(page);
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

    await startFight(page);
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

/**
 * What happens to a save this build cannot read at all.
 *
 * ⚠️ **The behaviour reversed with the first re-base, and this is where it is pinned.** An
 * unreadable save used to leave the game playable and permanently unable to write, on the grounds
 * that the bytes might belong to a newer build and would be good again after an update. That
 * protects a downgrade and strands everybody else, so it went: the run starts fresh and saves over
 * it.
 *
 * ⚠️ **This used to seed a pre-baseline version, and there is no longer one to seed.** The chain
 * has been folded into a single v0 twice over, so every number a save could carry is either the
 * baseline itself or above it — and the only way a save can be unreadable is by being *newer* than
 * this build.
 *
 * The version is therefore **derived from `SAVE_VERSION`** rather than written down. That is what
 * stops this fixture going stale a third time: two earlier versions of this comment each named a
 * literal that a later migration quietly turned into a live version, and the test failed only
 * because the *behaviour* changed — it could just as easily have kept passing while testing
 * nothing. The re-base has now made every such literal wrong again, which is the argument holding
 * rather than an accident.
 */
test.describe('a save this build cannot read', () => {
  const newerThanThisBuild = {
    version: SAVE_VERSION + 1,
    wallet: { gold: '1500000', xp: '0', essence: '0', summons: '0', spark: '0' },
    rates: { gold: '90', xp: '0', essence: '0', summons: '0' },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage: 24,
    clearedStages: 24,
    battleCount: 214,
    roster: [],
    activeParty: [],
    pity: 0,
    pullCount: 0,
  };

  test('starts a fresh run and says why', async ({ page }) => {
    await seedSave(page, newerThanThisBuild);
    await page.goto('');

    await expect(page.getByRole('alert')).toContainText('save could not be read');
    // A fresh run: the opening stage, and none of the gold the old save was carrying.
    await expect(page.getByRole('link', { name: /^Fight 1-1 / })).toBeVisible();
    await expect(amountOf(page, 'Gold')).toHaveText('0');
  });

  test('writes the fresh run to disk rather than leaving the game unable to save', async ({
    page,
  }) => {
    // The whole point of the reversal: before it, the unreadable bytes stayed on disk untouched
    // and every future launch started fresh again, for ever.
    //
    // Asserted against the storage slot rather than by reloading, because `seedSave` uses
    // `addInitScript` — which re-runs on every navigation, so a reload would put the bad save
    // straight back and prove nothing.
    await seedSave(page, newerThanThisBuild);
    await page.goto('');
    await expect(page.getByRole('alert')).toBeVisible();

    // Fight once, so what lands on disk is recognisably the fresh run having made progress.
    await startFight(page);
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.getByRole('button', { name: /^Close the battle/ })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^Close the battle/ }).click();
    await expect(page.getByRole('link', { name: /^Fight 1-2 / })).toBeVisible();

    const written = await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY);
    const saved = JSON.parse(written ?? '{}') as Record<string, unknown>;

    // Read off the constant rather than typed, so bumping the schema re-runs this rather than
    // leaving it asserting a version the build stopped writing. The version has moved off zero and
    // back to it since, which is what made that difference real twice.
    expect(saved['version']).toBe(SAVE_VERSION);
    expect(saved['chapter']).toBe(1);
    expect(saved['stage']).toBe(2);
    // The old save's gold did not survive, which is the honest half of "reset to nothing".
    expect(saved['wallet']).not.toMatchObject({ gold: '1500000' });
  });
});
