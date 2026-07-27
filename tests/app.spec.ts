import { expect, test } from '@playwright/test';

test.describe('App', () => {
  test('shows the application title in the document title', async ({ page }) => {
    await page.goto('');

    await expect(page).toHaveTitle(/IdleRpg/);
  });
});
