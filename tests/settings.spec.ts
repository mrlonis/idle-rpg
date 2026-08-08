import { expect, type Page, test } from '@playwright/test';
import {
  type ChapterData,
  ladderShape,
  positionAt,
  stagePayout,
  type StageRewardCurveData,
  summonRatePerSecond,
} from '../src/core';
import { CHAPTERS, STAGE_REWARDS, SUMMON_RATE } from '../src/data';
import { startFight } from './flows';

/**
 * The settings screen, driven through a real browser.
 *
 * Both features here are only *true* end to end, which is why they are tested here rather than
 * only in unit specs:
 *
 * - **The run reset has a trap in it that a fake cannot reproduce.** The game loop holds the
 *   authoritative run in memory and writes it back on autosave and on `visibilitychange`, so a
 *   reset that only emptied the save slots would look correct until the app was backgrounded and
 *   then quietly hand the old run back. The test below backgrounds the page on purpose.
 * - **Battle speed is a preference that outlives the run.** It is stored under its own key rather
 *   than inside the save, and the only convincing proof of that is a reset and a reload.
 *
 * Capacitor's Preferences web backend is `localStorage` under a `CapacitorStorage.` prefix, so a
 * save is seeded by writing that key before the app boots.
 */
const SAVE_KEY = 'CapacitorStorage.save';
const BACKUP_KEY = 'CapacitorStorage.save.bak';
const SETTINGS_KEY = 'CapacitorStorage.settings';

const chapters: readonly ChapterData[] = CHAPTERS;
const rewards: StageRewardCurveData = STAGE_REWARDS;
const LADDER = ladderShape(chapters);

/**
 * How far the run below has climbed. Every assertion about "the old run" reads this number, so it
 * lives here rather than being written out beside each one.
 */
const CLEARED = 13;
const parked = positionAt(LADDER, CLEARED + 1);
const earned = stagePayout(rewards, CLEARED);

/**
 * A run with plenty to lose: gold banked, income earned, and a dozen stages behind it.
 *
 * ⚠️ **Written at the current `SAVE_VERSION`, with every field of that shape filled in.** A version
 * this build does not know is treated as newer than itself and discarded, so a stale one here does
 * not fail — it quietly hands every test below a *fresh* run, which sits on stage 1-1 with nothing
 * banked and passes the reset assertions for the wrong reason. A field merely left out is milder
 * and still wrong: it is reported as damage and draws the recovery banner.
 *
 * ⚠️ **The rates are the ones {@link CLEARED} clears actually earn, derived rather than invented.**
 * `reconcileClearedStages` credits a run for every stage its gold rate says it can already afford,
 * so a rate typed out generously is not a harmless detail — it silently promotes the run past the
 * clear count the tests below assert on, and does it only once an autosave happens to fire.
 */
const progressedSave = {
  version: 0,
  wallet: { gold: '123456', xp: '900', essence: '40', summons: '5', spark: '0', alloy: '0' },
  rates: {
    gold: String(earned.rates.gold),
    xp: String(earned.rates.xp),
    essence: String(earned.rates.essence),
    summons: String(summonRatePerSecond(SUMMON_RATE, CLEARED)),
  },
  lastTickAt: Date.now(),
  rng: { seed: 3735928559, calls: 7 },
  chapter: parked.chapter,
  stage: parked.stage,
  clearedStages: CLEARED,
  battleCount: 20,
  roster: [
    { defId: 'rin', rarity: 0, level: 9, copies: 2, gear: {} },
    { defId: 'bran', rarity: 0, level: 9, copies: 0, gear: {} },
    { defId: 'mira', rarity: 0, level: 9, copies: 0, gear: {} },
  ],
  formations: { campaign: { front: ['bran', 'mira'], back: ['rin'] } },
  pity: 3,
  legendaryPity: 0,
  pullCount: 7,
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

async function seedSave(page: Page, save: unknown): Promise<void> {
  await page.addInitScript(
    ([key, backup, value]) => {
      localStorage.setItem(key, value);
      localStorage.removeItem(backup);
    },
    [SAVE_KEY, BACKUP_KEY, JSON.stringify(save)] as const,
  );
}

/** Reads a Preferences key out of the page, parsed. */
async function readKey(page: Page, key: string): Promise<Record<string, unknown> | null> {
  const raw = await page.evaluate((k) => localStorage.getItem(k), key);
  return raw === null ? null : (JSON.parse(raw) as Record<string, unknown>);
}

/**
 * Backgrounds the page, which is what makes the loop write the run it is holding.
 *
 * This is the whole point of the reset test: if the reset had emptied the slots and left the old
 * run in memory, this is the moment the old run would come back.
 */
async function background(page: Page): Promise<void> {
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

test.describe('Settings', () => {
  test.describe('battle speed', () => {
    test('is remembered across a reload', async ({ page }) => {
      await page.goto('/settings');

      await page.getByRole('radio', { name: '4×' }).check();
      await expect.poll(async () => (await readKey(page, SETTINGS_KEY))?.['combatSpeed']).toBe(4);

      await page.reload();

      await expect(page.getByRole('radio', { name: '4×' })).toBeChecked();
    });

    /**
     * The battle screen's controls and this screen's radios are one setting seen twice. A speed
     * chosen mid-fight is therefore the speed the *next* fight opens at, and the settings screen
     * agrees without anybody keeping two values in step.
     */
    test('is the same setting the battle screen changes', async ({ page }) => {
      await page.goto('');

      await startFight(page);
      await page.getByRole('button', { name: '4×' }).click();
      await expect(page.locator('.actions')).toBeVisible({ timeout: 15_000 });
      await page.getByRole('button', { name: 'Close the battle and return home' }).click();

      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Settings' })
        .click();

      await expect(page.getByRole('radio', { name: '4×' })).toBeChecked();
    });
  });

  test.describe('reminders', () => {
    test('is on by default, and one tap from off', async ({ page }) => {
      // ⚠️ On by default is the deliberate choice. Defaulting off would mean the feature does not
      // exist — nobody opens a settings screen to enable a notification they have never seen — so
      // what makes it honest is that the switch is easy to find, not that it starts silent.
      await page.goto('/settings');

      const toggle = page.getByRole('checkbox', { name: 'Send me reminders' });
      await expect(toggle).toBeChecked();

      await toggle.click();
      await expect(toggle).not.toBeChecked();
    });

    test('is remembered across a reload', async ({ page }) => {
      await page.goto('/settings');
      await page.getByRole('checkbox', { name: 'Send me reminders' }).click();
      await expect(page.getByRole('checkbox', { name: 'Send me reminders' })).not.toBeChecked();

      await page.reload();

      await expect(page.getByRole('checkbox', { name: 'Send me reminders' })).not.toBeChecked();
    });

    test('says plainly that ignoring them costs nothing', async ({ page }) => {
      // Load-bearing copy: nothing in this game expires, so the screen must not imply otherwise.
      await page.goto('/settings');

      await expect(page.getByText(/costs you nothing/)).toBeVisible();
    });
  });

  test.describe('resetting the run', () => {
    test('asks first, and does nothing if the player backs out', async ({ page }) => {
      await seedSave(page, progressedSave);
      await page.goto('/settings');

      // Opened from the keyboard rather than by a click, deliberately. WebKit does not leave focus
      // on a button it was clicked on — that is a platform convention, not a bug — so a mouse-driven
      // version of this test would be asserting that focus returns to something that never had it.
      // Pressing Enter is also the state a keyboard or switch user is in, which is who focus
      // restoration exists for.
      const reset = page.getByRole('button', { name: 'Reset run' });
      await reset.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Reset this run?' });
      await expect(dialog).toBeVisible();

      await dialog.getByRole('button', { name: 'Keep playing' }).click();

      await expect(dialog).toBeHidden();
      // Focus goes back to the control that opened the dialog, which is CDK's job and one of the
      // four things a hand-rolled overlay would have had to get right.
      await expect(reset).toBeFocused();
      expect((await readKey(page, SAVE_KEY))?.['clearedStages']).toBe(CLEARED);
    });

    test('is dismissed by Escape without touching the run', async ({ page }) => {
      await seedSave(page, progressedSave);
      await page.goto('/settings');

      await page.getByRole('button', { name: 'Reset run' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.getByRole('dialog')).toBeHidden();
      expect((await readKey(page, SAVE_KEY))?.['clearedStages']).toBe(CLEARED);
    });

    /**
     * ⚠️ The load-bearing test. Backgrounding after the reset is what would expose a reset that
     * emptied storage and left the old run in memory: the loop persists on hide, and the run it
     * persists is whatever it is holding.
     */
    test('wipes the run, and the app does not write the old one back', async ({ page }) => {
      await seedSave(page, progressedSave);
      await page.goto('/settings');

      await page.getByRole('button', { name: 'Reset run' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Reset run' }).click();

      // A fresh run is its own confirmation: stage 1-1 and an empty wallet.
      await expect(page.getByRole('link', { name: /^Fight 1-1/ })).toBeVisible();

      // The old run is not hiding in the backup slot either — the slots are emptied before the
      // fresh run is written, so a write has nothing to copy across.
      expect((await readKey(page, BACKUP_KEY))?.['clearedStages']).not.toBe(CLEARED);

      // Emptied on purpose, so what the app writes next can only have come from what it is
      // holding in memory. Without this the assertions below would also pass against an app that
      // never wrote anything on hide at all.
      await page.evaluate((key) => localStorage.removeItem(key), SAVE_KEY);
      await background(page);
      await expect.poll(async () => (await readKey(page, SAVE_KEY)) !== null).toBe(true);

      const save = await readKey(page, SAVE_KEY);
      expect(save?.['clearedStages']).toBe(0);
      expect(save?.['stage']).toBe(1);
      expect((save?.['wallet'] as Record<string, string>)['gold']).toBe('0');
    });

    test('keeps the player settings it did not ask about', async ({ page }) => {
      await seedSave(page, progressedSave);
      await page.goto('/settings');

      await page.getByRole('radio', { name: '4×' }).check();
      await expect.poll(async () => (await readKey(page, SETTINGS_KEY))?.['combatSpeed']).toBe(4);

      await page.getByRole('button', { name: 'Reset run' }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Reset run' }).click();
      await expect(page.getByRole('link', { name: /^Fight 1-1/ })).toBeVisible();

      expect((await readKey(page, SETTINGS_KEY))?.['combatSpeed']).toBe(4);
    });
  });
});
