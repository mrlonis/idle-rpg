import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test, type TestInfo } from '@playwright/test';

/**
 * AGENTS.md makes accessibility a hard requirement — all AXE checks, WCAG AA minimums — so it
 * is checked mechanically rather than by eye.
 *
 * The game is two screens, and the battle replaces home rather than sitting under it, so neither
 * screen is reachable from a scan of the other. Each gets its own test.
 *
 * There is exactly one `analyze()` per screen. Re-scanning until a run comes back clean would be
 * checking different DOM each time and would launder a real violation into a flake — a scan that
 * passes on the fourth attempt has found a violation, not proved its absence.
 *
 * The battle screen is scanned once the fight has settled, which is not a shortcut: a settled
 * battle renders a strict superset of a playing one. Mid-fight the board, log and speed controls
 * are all present and identical; settling only *adds* the outcome text and the two action
 * buttons. Scanning the live state as well would cover no extra markup and would race the
 * animation.
 */
async function scan(page: Page, testInfo: TestInfo, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();

  // The full results, including passes and anything AXE could not decide, are worth having on
  // a failure — the assertion below is deliberately terse so its diff stays readable.
  await testInfo.attach(`axe-${label}.json`, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  const violations = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact ?? 'unknown impact'}): ${violation.help} — ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')}`,
  );

  expect(violations).toEqual([]);
}

test.describe('Accessibility', () => {
  test('the home screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('');

    // The Fight control renders only once the run has loaded, so waiting on it also proves the
    // save path resolved — the scan covers a real home screen, not a loading shell.
    await expect(page.getByRole('button', { name: /^Fight Stage/ })).toBeVisible();

    await scan(page, testInfo, 'home');
  });

  test('the battle screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('');

    await page.getByRole('button', { name: /^Fight Stage/ }).click();
    await expect(page.locator('.battle')).toBeVisible();

    // 4x so the wait below is about a second rather than four. Also exercises the one control
    // that exists mid-fight.
    await page.getByRole('button', { name: '4×' }).click();

    // The action buttons appear only when the battle is over, so this is the one-way transition
    // to wait on. A populated log proves combat actually ran rather than resolving instantly.
    await expect(page.locator('.log__line').first()).toBeVisible();
    await expect(page.locator('.actions')).toBeVisible({ timeout: 15_000 });

    await scan(page, testInfo, 'battle');
  });
});
