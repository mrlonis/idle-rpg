import { expect, test } from '@playwright/test';
import { FIGHT_LINK, startFight } from './flows';

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
      ['/town/bounties', /Bounty Board/],
      ['/bag', /Bag/],
      ['/formations', /Formations/],
      ['/formations/campaign', /Formation/],
      ['/formations/tower-human', /Formation/],
      ['/prepare/campaign', /Before you fight/],
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

      await expect(page.getByRole('link', { name: FIGHT_LINK })).toBeVisible();
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
      [/^Bounty Board/, 'Bounty Board'],
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

      await startFight(page);

      await expect(page.getByRole('navigation')).toHaveCount(0);
    });
  });

  /**
   * The tower path, end to end through a real browser.
   *
   * Every part of this is covered by a unit spec somewhere; what only a browser can show is that the
   * three screens agree — Home's row, the crew editor's lock, and a battle heading that names a
   * *floor* rather than a chapter and a stage. A fresh run is used deliberately, so the tower starts
   * locked and the row has to say so.
   */
  test.describe('a faction tower', () => {
    /**
     * A run past the tower's unlock, holding four Humans with a crew already standing in the tower.
     *
     * ⚠️ **Every field of the current shape is written, including the empty ones.** A field left out
     * is reported as damage, and the recovery banner it draws would sit on the screen this walks.
     * The crew is pre-arranged rather than assembled by clicking: what this test is for is that the
     * three screens agree about a *tower*, and the placement control is covered by its own specs.
     */
    const towerSave = {
      version: 0,
      wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
      rates: { gold: '4', xp: '2', essence: '1', summons: '0.5' },
      lastTickAt: Date.now(),
      rng: { seed: 3735928559, calls: 0 },
      chapter: 1,
      stage: 20,
      clearedStages: 19,
      battleCount: 19,
      roster: [
        { defId: 'mira', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'wren', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'halric', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'ysolde', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'bran', rarity: 0, level: 1, copies: 0, gear: {} },
        { defId: 'rin', rarity: 0, level: 1, copies: 0, gear: {} },
      ],
      formations: {
        campaign: { front: ['bran', 'mira'], back: ['rin'] },
        'tower-human': { front: ['halric', 'mira'], back: ['wren', 'ysolde'] },
      },
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
      towers: {},
    };

    test('starts locked, and the row says what opens it', async ({ page }) => {
      await page.goto('');

      // Not a link, and it names both the key and the faction it wants — a tower that cannot yet be
      // crewed should still say who it is for. Scoped by name rather than by class alone: all seven
      // towers draw an inert row on a fresh run, which is the point of them.
      const row = page.locator('.tower--inert', { hasText: 'Human Tower' });
      await expect(row).toContainText('Human Tower');
      await expect(row).toContainText(/Clear \d+ more stages? to open/);
      await expect(row).toContainText('Humans only');
      await expect(page.getByRole('link', { name: /Human Tower/ })).toHaveCount(0);
    });

    test('arranges a crew from the Humans only, and fights a floor', async ({ page }) => {
      // Seeded past the unlock with three Humans owned, which is what makes the tower enterable and
      // the pool non-trivial. Written through the same storage key the app reads on load.
      await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
        'CapacitorStorage.save',
        JSON.stringify(towerSave),
      ] as const);
      await page.goto('');

      await page.getByRole('link', { name: /Human Tower/ }).click();

      await expect(page.getByRole('heading', { level: 1, name: 'Before you fight' })).toBeVisible();
      await expect(page.locator('.head__lock')).toContainText('Humans');

      await page.getByRole('button', { name: 'Fight', exact: true }).click();

      // The generalised heading: a floor, not a chapter and a stage.
      await expect(page.locator('.battle__stage')).toContainText('F1');
      await expect(page.locator('.battle__stage-chapter')).toContainText('Human Tower');
      await expect(page.locator('.battle__stage-chapter')).toContainText('Floor 1 of 100');
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
    /**
     * A run that has been away an hour, which is what draws the offline summary.
     *
     * ⚠️ **Every field of the current shape is written, including the empty ones.** A field left
     * out is damage — a missing `alloy`, `legendaryPity` or `gearMinted` is a reported repair issue
     * — and the recovery banner it draws is a second `.notice` beside the one this test dismisses.
     */
    const awaySave = {
      version: 0,
      wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
      rates: { gold: '4', xp: '2', essence: '1', summons: '0.5' },
      lastTickAt: Date.now() - 3_600_000,
      rng: { seed: 3735928559, calls: 0 },
      chapter: 1,
      stage: 1,
      clearedStages: 1,
      battleCount: 1,
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

      await expect(page.getByRole('link', { name: FIGHT_LINK })).toBeVisible();
      await expect(notice).toBeHidden();
    });
  });
});
