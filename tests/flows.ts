import { expect, type Page } from '@playwright/test';

/**
 * Flows several specs walk, kept in one place.
 *
 * ⚠️ **Starting a fight became two steps in milestone 15a**, and it is now the most-repeated flow
 * in this directory. Home's control is a *link* to the crew editor and the editor's control is the
 * button that actually fights, so every spec that used to click one button clicks two — and a
 * change to either screen would otherwise mean editing five files.
 */

/** Matches Home's battle link, which names the stage it leads to: "Fight 1-5 — Cutthroat Camp". */
export const FIGHT_LINK = /^Fight \d+-\d+/;

/**
 * Goes from wherever the player is to a battle in progress.
 *
 * Waits for the link before clicking it, which also proves the run has loaded: the control renders
 * off the resolved ladder, so its presence is the app's readiness signal.
 */
export async function startFight(page: Page): Promise<void> {
  await openPrepare(page);
  await page.getByRole('button', { name: 'Fight', exact: true }).click();
  await expect(page.locator('.battle')).toBeVisible();
}

/** The first half on its own, for specs that assert something about the crew editor itself. */
export async function openPrepare(page: Page): Promise<void> {
  const link = page.getByRole('link', { name: FIGHT_LINK });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Before you fight' })).toBeVisible();
}
