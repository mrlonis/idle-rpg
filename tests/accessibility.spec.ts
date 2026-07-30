import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * AGENTS.md makes accessibility a hard requirement — all AXE checks, WCAG AA minimums — so it
 * is checked mechanically rather than by eye.
 *
 * The screen this scans is genuinely live: battles resolve and animate continuously, the log
 * rewrites itself several times a second, and the roster rows are replaced outright at the start
 * of every fight. That shapes the test in two ways.
 *
 * First, the wait is for *structure*, not for a moment in the animation. `.battle` appearing and
 * the log having lines are both one-way transitions, so waiting on them is stable; waiting for
 * some particular battle state would not be.
 *
 * Second, there is exactly one `analyze()` call. Re-scanning until a run comes back clean would
 * be checking different DOM each time and would launder a real violation into a flake — a scan
 * that passes on the fourth attempt has found a violation, not proved its absence.
 */
test.describe('Accessibility', () => {
  test('the game screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('');

    // The panel renders only once the first battle has been resolved, so reaching it also proves
    // the run loaded and combat ran — the scan covers a playing fight, not an empty shell.
    await expect(page.locator('.battle')).toBeVisible();
    // A populated log rather than an empty <ol>. The fastest combatant acts around 700ms into
    // playback, so this settles well inside the default expect timeout.
    await expect(page.locator('.log__line').first()).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    // The full results, including passes and anything AXE could not decide, are worth having on
    // a failure — the assertion below is deliberately terse so its diff stays readable.
    await testInfo.attach('axe-results.json', {
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
  });
});
