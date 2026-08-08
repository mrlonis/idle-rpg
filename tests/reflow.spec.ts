import { expect, type Page, test } from '@playwright/test';
import { startFight } from './flows';

/**
 * WCAG 2.1 AA 1.4.10 (Reflow): content must be presentable at 320 CSS px wide without requiring
 * scrolling in two dimensions. AGENTS.md makes WCAG AA a hard requirement, and this is the clause
 * AXE cannot check for us — reflow is a layout property, so `accessibility.spec.ts` scans every
 * screen in the app and would not have seen any of this.
 *
 * ⚠️ **The three configured Playwright projects are all desktop viewports, which makes them
 * structurally blind to this.** The app caps its content at 32rem and centres it, so a control that
 * overflows its container by 34px still lands hundreds of pixels inside a 1280px window — the
 * overflow is real on every one of those runs and reaches the viewport edge on none of them. That
 * is not an argument for adding a mobile project to the config: it would re-run all 231 existing
 * tests for one property. It is the argument for this file, which pins the narrow viewport and
 * asserts the one thing the desktop runs cannot see.
 *
 * This shipped. Milestone 15a turned Home's Fight control from a `<button>` into an `<a>`, which
 * silently changed its `box-sizing` from the UA default of `border-box` to `content-box` — so
 * `width: 100%` plus the button mixin's padding and border put the campaign card 34px past the
 * screen and gave the whole app a horizontal scrollbar on a phone.
 */

/**
 * The scroll container, which is `main` — `html` and `body` are `overflow: hidden`, so the document
 * itself can never report a scrollbar and asserting on it would prove nothing at all.
 *
 * ⚠️ `.game` sets only `overflow-y: auto`. CSS resolves the other axis of a non-visible `overflow`
 * to `auto` as well, which is why overflowing content on the horizontal axis presents as a
 * scrollbar rather than being clipped — and why the assertion below belongs on this element.
 */
const SCROLLER = 'main';

/**
 * The narrowest viewport WCAG names. Every phone this ships to is wider, so a screen that reflows
 * here reflows everywhere — and the extra 55px an iPhone SE would give is exactly the margin that
 * lets a near-miss hide until somebody looks at it on hardware.
 */
test.use({ viewport: { width: 320, height: 812 } });

/**
 * Asserts nothing on the page sticks out past the scroll container.
 *
 * The failure message names the offending elements rather than only the overflow width, because
 * the number on its own sends you looking at whichever screen you happened to be on: the overflow
 * is measured on the shell's scroll container, which no component stylesheet mentions. The bug this
 * file exists for was 34px reported against `main` and caused by a rule in `home-view.scss`.
 */
async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const report = await page.evaluate((selector) => {
    const scroller = document.querySelector(selector);
    if (scroller === null) {
      return { overflow: -1, culprits: [`No element matched \`${selector}\`.`] };
    }

    const limit = scroller.clientWidth;
    const overflow = scroller.scrollWidth - limit;
    const culprits =
      overflow <= 0
        ? []
        : [...scroller.querySelectorAll('*')]
            .filter((element) => element.getBoundingClientRect().right > limit)
            .map((element) => {
              const classes = [...element.classList].map((name) => `.${name}`).join('');
              const right = element.getBoundingClientRect().right.toFixed(1);
              return `${element.tagName.toLowerCase()}${classes} reaches ${right}px`;
            });

    return { overflow, culprits };
  }, SCROLLER);

  expect(
    report.overflow,
    `Content overflows ${SCROLLER} horizontally by ${report.overflow}px: ${report.culprits.join('; ')}`,
  ).toBeLessThanOrEqual(0);
}

/**
 * Every route a fresh run can reach, and the heading that proves it rendered rather than the app
 * having redirected or still been loading.
 *
 * Deliberately not seeded with the fixtures `accessibility.spec.ts` builds. A screen's *empty*
 * state is not the weaker case for reflow — a row of content shrinks and wraps, whereas the
 * full-width controls and headings that overflow are drawn whatever the run holds. What a fixture
 * would buy here is list rows, and what it would cost is a second copy of five save shapes.
 */
const ROUTES: readonly (readonly [path: string, heading: string])[] = [
  ['/', 'Home'],
  ['/town', 'Town'],
  ['/town/summon', 'Summon'],
  ['/town/shop', 'Spark Shop'],
  ['/town/altar', 'Altar'],
  ['/town/gear-shop', 'Gear Shop'],
  ['/town/bounties', 'Bounty Board'],
  ['/town/quests', 'Quests'],
  ['/town/achievements', 'Achievements'],
  ['/roster', 'Roster'],
  ['/roster/rin', 'Rin'],
  ['/formations', 'Formations'],
  ['/formations/campaign', 'Campaign'],
  ['/bag', 'Bag'],
  ['/settings', 'Settings'],
  ['/prepare/campaign', 'Before you fight'],
];

test.describe('Reflow at 320px', () => {
  for (const [path, heading] of ROUTES) {
    test(`${path} does not scroll horizontally`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

      await expectNoHorizontalOverflow(page);
    });
  }

  /**
   * The battle screen, which is the one place in the app that is not a route — it replaces Home
   * rather than sitting at a URL of its own, so the loop above cannot reach it.
   *
   * Checked once the fight has settled, for the same reason `accessibility.spec.ts` scans it then:
   * a settled battle is a strict superset of a playing one, adding the outcome text and the two
   * action buttons to a board and log that are otherwise identical.
   */
  test('the battle screen does not scroll horizontally', async ({ page }) => {
    await page.goto('');

    await startFight(page);
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.locator('.actions')).toBeVisible({ timeout: 15_000 });

    await expectNoHorizontalOverflow(page);
  });
});
