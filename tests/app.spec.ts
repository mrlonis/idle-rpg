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

      await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();
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

      await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();
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

      await page.getByRole('button', { name: /^Fight \d+-\d+/ }).click();

      await expect(page.locator('.battle')).toBeVisible();
      await expect(page.getByRole('navigation')).toHaveCount(0);
    });
  });

  /**
   * The home screen's notices used to have no way off them. Reloading the page cleared one, which
   * is an escape hatch a shelled app on a phone does not have — there is no address bar to reload
   * from, so the line simply stayed there.
   *
   * Driven through a real browser because the interesting half is a *navigation*: `HomeView` is
   * lazily routed and is destroyed and rebuilt on every trip away, so a dismissal the component
   * kept for itself would pass every unit test and still put the notice back on screen.
   */
  test.describe('dismissing a notice', () => {
    /** A run that has been away an hour, which is what draws the offline summary. */
    const awaySave = {
      version: 0,
      wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0' },
      rates: { gold: '4', xp: '2', essence: '1', summons: '0.5' },
      lastTickAt: Date.now() - 3_600_000,
      rng: { seed: 3735928559, calls: 0 },
      chapter: 1,
      stage: 1,
      clearedStages: 1,
      battleCount: 1,
      roster: [
        { defId: 'rin', rarity: 0, level: 1, copies: 0 },
        { defId: 'bran', rarity: 0, level: 1, copies: 0 },
        { defId: 'mira', rarity: 0, level: 1, copies: 0 },
      ],
      formation: { front: ['bran', 'mira'], back: ['rin'] },
      pity: 0,
      pullCount: 0,
    };

    test('closes the offline summary, and it stays closed across a navigation', async ({
      page,
    }) => {
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
        'CapacitorStorage.save',
        JSON.stringify(awaySave),
      ] as const);
      await page.goto('');

      const notice = page.getByText('While you were away');
      await expect(notice).toBeVisible();

      await page.getByRole('button', { name: 'Dismiss offline earnings notice' }).click();
      await expect(notice).toBeHidden();

      // Scoped to the tab bar: the home screen has a "Manage roster" link of its own, and an
      // unscoped name matches both.
      const tabs = page.getByRole('navigation', { name: 'Main' });
      await tabs.getByRole('link', { name: 'Roster' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Roster' })).toBeVisible();
      await tabs.getByRole('link', { name: 'Home' }).click();

      await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();
      await expect(notice).toBeHidden();
    });
  });
});
