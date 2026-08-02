import { expect, test } from '@playwright/test';

test.describe('App', () => {
  test('shows the application title in the document title', async ({ page }) => {
    await page.goto('');

    await expect(page).toHaveTitle(/Idle RPG/);
  });

  /**
   * Routing arrived with the gacha, and the reason it did is that these screens describe saved
   * state — so a deep link has to actually work rather than bouncing to home. That is the whole
   * argument for them being routes at all, and it is worth checking against a real navigation
   * rather than an in-memory one.
   */
  test.describe('deep links', () => {
    for (const [path, title] of [
      ['/summon', /Summon/],
      ['/roster', /Roster/],
      ['/shop', /Spark Shop/],
    ] as const) {
      test(`loads ${path} directly`, async ({ page }) => {
        await page.goto(path);

        await expect(page).toHaveTitle(title);
        await expect(page.locator('main')).toBeVisible();
      });
    }

    test('lands a character sheet reached by URL on that character', async ({ page }) => {
      await page.goto('/roster/rin');

      await expect(page.getByRole('heading', { level: 1, name: 'Rin' })).toBeVisible();
    });

    test('sends an unknown route home rather than to a blank screen', async ({ page }) => {
      await page.goto('/nowhere');

      await expect(page.getByRole('button', { name: /^Fight Stage/ })).toBeVisible();
    });
  });

  /**
   * The character sheet hangs off `/roster/:defId`, but the roster is not the only way in — the
   * party on the home screen links straight to it. Its back link therefore reads the origin the
   * link that opened it carried, rather than assuming everybody arrived through the roster.
   */
  test.describe('the way out of a character sheet', () => {
    test('goes home when the party on the home screen opened it', async ({ page }) => {
      await page.goto('');

      await page.getByRole('link', { name: 'Rin' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Rin' })).toBeVisible();

      await page.getByRole('link', { name: '← Home' }).click();

      await expect(page.getByRole('button', { name: /^Fight Stage/ })).toBeVisible();
    });

    test('goes to the roster when the roster opened it', async ({ page }) => {
      await page.goto('/roster');

      await page.getByRole('link', { name: 'Rin' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Rin' })).toBeVisible();

      await page.getByRole('link', { name: '← Roster' }).click();

      await expect(page.getByRole('heading', { level: 1, name: 'Roster' })).toBeVisible();
    });

    test('offers the roster to a sheet opened by URL, which names no origin', async ({ page }) => {
      await page.goto('/roster/rin');

      await expect(page.getByRole('link', { name: '← Roster' })).toBeVisible();
    });
  });

  test.describe('the tab bar', () => {
    test('navigates between screens and marks the current one', async ({ page }) => {
      await page.goto('');

      await page.getByRole('link', { name: 'Summon' }).click();

      await expect(page.getByRole('heading', { level: 1, name: 'Summon' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Summon' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    test('disappears during a fight, which has no exit until it ends', async ({ page }) => {
      await page.goto('');

      await page.getByRole('button', { name: /^Fight Stage/ }).click();

      await expect(page.locator('.battle')).toBeVisible();
      await expect(page.getByRole('navigation')).toHaveCount(0);
    });
  });
});
