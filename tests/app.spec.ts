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
      ['/town', /Town/],
      ['/town/summon', /Summon/],
      ['/roster', /Roster/],
      ['/town/shop', /Spark Shop/],
      ['/town/gear-shop', /Gear Shop/],
      ['/town/achievements', /Achievements/],
      ['/town/quests', /Quests/],
      ['/bag', /Bag/],
      ['/settings', /Settings/],
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
   * The character sheet hangs off `/roster/:defId`, but the route is not the same claim as the
   * origin. Its back link reads the origin the link that opened it carried, and answers for a
   * sheet that carries none — a bookmark, a reload, a hand-typed URL — rather than leaving the
   * player with no way out.
   */
  test.describe('the way out of a character sheet', () => {
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

  /**
   * Every currency sink is two taps away now rather than one, and the whole of what makes that
   * acceptable is that the hub is honest about where it goes and the tab bar keeps saying where
   * the player is. Both halves are checked through a real navigation, because both are claims
   * about the router rather than about markup.
   */
  test.describe('town', () => {
    for (const [card, heading] of [
      [/^Summon/, 'Summon'],
      [/^Quests/, 'Quests'],
      [/^Achievements/, 'Achievements'],
      [/^Gear Shop/, 'Gear Shop'],
      [/^Spark Shop/, 'Spark Shop'],
    ] as const) {
      test(`reaches ${heading} and comes back`, async ({ page }) => {
        await page.goto('/town');

        await page.getByRole('link', { name: card }).click();
        await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

        // The way out names its destination, the same as the character sheet's does.
        await page.getByRole('link', { name: '← Town' }).click();

        await expect(page.getByRole('heading', { level: 1, name: 'Town' })).toBeVisible();
      });
    }

    test('keeps the Town tab current while the player is inside one of its screens', async ({
      page,
    }) => {
      // The argument for nesting these under `/town` rather than leaving them at `/summon`. A
      // flat path works as a destination and then darkens the tab that sent the player there,
      // which reads as having navigated out of the app rather than into it.
      await page.goto('/town/summon');

      const tabs = page.getByRole('navigation', { name: 'Main' });

      await expect(tabs.getByRole('link', { name: 'Town' })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });
  });

  test.describe('the tab bar', () => {
    test('navigates between screens and marks the current one', async ({ page }) => {
      await page.goto('');

      await page.getByRole('link', { name: 'Town' }).click();

      await expect(page.getByRole('heading', { level: 1, name: 'Town' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Town' })).toHaveAttribute(
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

      // Scoped to the tab bar. The home screen no longer carries a "Manage roster" link that an
      // unscoped name would also match, but naming the navigation is what makes this step read as
      // "leave and come back" rather than "click whatever says Roster".
      const tabs = page.getByRole('navigation', { name: 'Main' });
      await tabs.getByRole('link', { name: 'Roster' }).click();
      await expect(page.getByRole('heading', { level: 1, name: 'Roster' })).toBeVisible();
      await tabs.getByRole('link', { name: 'Home' }).click();

      await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();
      await expect(notice).toBeHidden();
    });
  });
});
