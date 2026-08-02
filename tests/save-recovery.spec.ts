import { expect, type Page, test } from '@playwright/test';
import { STAGES } from '../src/data';

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

/**
 * The top of the ladder, read from `data/` rather than retyped.
 *
 * A v2 save carries exactly one thing repair can work from — the gold rate — so "a run that beat
 * everything" means "a run whose gold rate is the last stage's". Hard-coding 16/s and 3,000
 * crystals is what this file used to do, and the moment the ladder grew past eight stages both
 * numbers quietly started describing a different save than the one the test claimed to be about.
 */
const top = STAGES[STAGES.length - 1];

/** Every first-clear bonus on the ladder, which is what a fully cleared run is owed. */
const owedCrystals = STAGES.reduce(
  (total, stage) => total + Number(stage.firstClearSummons ?? 0),
  0,
);

/** The hourly form the home screen switches to for the two rates that are tiny per second. */
function perHour(perSecond: number): string {
  return `${Number((perSecond * 3600).toPrecision(12))}/hr`;
}

/** The rate shown under one currency on the home screen, e.g. `3/s` or `180/hr`. */
function rateOf(page: Page, label: string) {
  return page.locator('.wallet__item').filter({ hasText: label }).locator('.wallet__rate');
}

test.describe('recovering a pre-gacha save', () => {
  /** A v2 save from a player who had cleared the whole ladder. */
  const v2AtTheTop = {
    version: 2,
    gold: '1500000',
    goldPerSec: String(top.rates.gold),
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage: STAGES.length,
    battleCount: 214,
  };

  test('restores every idle rate the run had already earned', async ({ page }) => {
    // The reported symptom: gold accumulating, nothing else. The surviving gold rate is enough
    // to know how far the run got, so none of this should need a fight to come back.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    await expect(page.getByRole('button', { name: /^Fight Stage/ })).toBeVisible();

    await expect(page.locator('.resource__rate')).toHaveText(`${top.rates.gold}/s`);
    await expect(rateOf(page, 'XP')).toHaveText(`${top.rates.xp}/s`);
    await expect(rateOf(page, 'Essence')).toHaveText(perHour(top.rates.essence));
    await expect(rateOf(page, 'Crystals')).toHaveText(perHour(top.rates.summons));
  });

  test('pays the first-clear bonuses the ladder had already earned', async ({ page }) => {
    // Marking those stages cleared without paying them would close the door for good —
    // `applyBattleResult` would never pay them either. A run that beat the whole ladder is owed
    // every bonus on it, the same as a new player earns for climbing the same stages.
    await seedSave(page, v2AtTheTop);
    await page.goto('');

    const crystals = page.locator('.wallet__item').filter({ hasText: 'Crystals' });
    await expect(crystals.locator('.wallet__amount')).toHaveText(
      `${(owedCrystals / 1000).toFixed(1).replace(/\.0$/, '')}K`,
    );
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

    await expect(page.locator('.resource__value')).toHaveText('1.5M');
    await expect(
      page.getByRole('button', { name: new RegExp(`^Fight Stage ${STAGES.length}`) }),
    ).toBeVisible();
  });

  test('leaves a save written by this build untouched', async ({ page }) => {
    // The repair runs on every load, so a healthy save has to pass through unchanged.
    await seedSave(page, v2AtTheTop);
    await page.goto('');
    await expect(rateOf(page, 'XP')).toHaveText(`${top.rates.xp}/s`);

    // Second load, now reading the current-version save the first one wrote.
    await page.reload();

    await expect(rateOf(page, 'XP')).toHaveText(`${top.rates.xp}/s`);
    await expect(rateOf(page, 'Crystals')).toHaveText(perHour(top.rates.summons));
  });
});

test.describe('re-fighting a cleared stage', () => {
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
      gold: String(top.rates.gold),
      xp: String(top.rates.xp),
      essence: String(top.rates.essence),
      summons: String(top.rates.summons),
    },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage: 1,
    clearedStages: STAGES.length,
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
    // Stage 1's first-clear bonus is 200 crystals against an idle rate of 50.4/hr, so a bonus
    // firing again is unmistakable: the balance would jump past 200 rather than creeping up by
    // a fraction over the few seconds this test takes.
    await seedSave(page, clearedEverything);
    await page.goto('');

    await page.getByRole('button', { name: /^Fight Stage 1/ }).click();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.getByRole('button', { name: /^Close the battle/ })).toBeVisible({
      timeout: 15_000,
    });

    // The one-off reward still lands — farming a beaten stage is meant to pay.
    await expect(page.locator('.battle__outcome')).toContainText('25 gold');

    await page.getByRole('button', { name: /^Close the battle/ }).click();

    const crystals = page.locator('.wallet__item').filter({ hasText: 'Crystals' });
    await expect(crystals.locator('.wallet__amount')).not.toHaveText(/^\d{3,}/);
  });

  test('does not disturb the idle rates it already had', async ({ page }) => {
    await seedSave(page, clearedEverything);
    await page.goto('');

    await page.getByRole('button', { name: /^Fight Stage 1/ }).click();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.getByRole('button', { name: /^Close the battle/ })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /^Close the battle/ }).click();

    // Still the top-of-ladder rates, not stage 1's.
    await expect(page.locator('.resource__rate')).toHaveText(`${top.rates.gold}/s`);
    await expect(rateOf(page, 'XP')).toHaveText(`${top.rates.xp}/s`);
    await expect(rateOf(page, 'Essence')).toHaveText(perHour(top.rates.essence));
  });
});
