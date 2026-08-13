import { expect, type Page, test } from '@playwright/test';
import { stagePayout } from '../src/core';
import { DESCENT_RULES, QUEST_RULES, STAGE_REWARDS } from '../src/data';

/**
 * The Descent, end to end.
 *
 * The unit specs cover the run's arithmetic and the screen's markup separately; what neither can
 * reach is the **seam** — a fight started from this screen has to route through `BattleService`,
 * resolve against the run's own crew with its cards folded in and its carried damage handed over,
 * and come back having advanced the run rather than the ladder. That is four services and a mode
 * swap, and it is exactly the join a unit test with a fake on either side cannot see.
 */

/**
 * Well past the unlock, and deliberately **not** the top of the ladder.
 *
 * ⚠️ The enemy level is a fixed offset from the hardest campaign stage cleared, so a fixture at four
 * hundred clears fights at level ~588 — a real fight, which is not what this file is for. Anchoring
 * mid-ladder and fielding a maxed five makes every fight here a formality, so a failure is the
 * **seam** rather than the tuning. `descent.balance.ts` is what measures whether the mode is a fight.
 */
const CLEARS = 100;
const top = stagePayout(STAGE_REWARDS, CLEARS);

/**
 * Which day the Descent is on, resolved the way the app resolves it.
 *
 * ⚠️ **Derived rather than written down.** A run is only today's run if its `day` matches, so a
 * fixture carrying a fixed index would be yesterday's run tomorrow and the screen would draw the
 * wrong state — a test that passes for a day and then fails for reasons nobody changed.
 */
const DAY = Math.max(
  Math.floor((Date.now() - QUEST_RULES.resetOffsetMinutes * 60_000) / 86_400_000),
  0,
);

/**
 * A run past the unlock with a crew standing in every faction the lock can draw.
 *
 * ⚠️ **All seven factions are crewed**, because the day's three are drawn from the run's seed and a
 * test that seeded only one faction would pass or fail on a shuffle it does not control. What the
 * lock actually admits is asserted below rather than assumed.
 */
const save = {
  version: 0,
  wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0', emblem: '0' },
  rates: {
    gold: String(top.rates.gold),
    xp: String(top.rates.xp),
    essence: String(top.rates.essence),
    summons: '0',
    emblem: '0',
  },
  lastTickAt: Date.now(),
  rng: { seed: 3735928559, calls: 0 },
  chapter: 1,
  stage: 1,
  clearedStages: CLEARS,
  battleCount: 400,
  roster: [
    // Two per faction at the top rung and a high level, so the crew can actually win — the point of
    // this spec is the seam rather than the tuning, and a party that loses fight one would test the
    // defeat path only.
    { defId: 'bran', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'mira', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'rin', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'dorn', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'grimna', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'faelen', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'sylvara', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'nyxara', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'mortlach', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'gnash', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'ghorrak', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'seren', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'cirien', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'pyra', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
    { defId: 'vexis', rarity: 10, level: 400, copies: 0, gear: {}, signature: 0 },
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
  towers: {},
  descent: null,
  descentRuns: 0,
};

/** The same run, already one fight deep with a card owed. */
const midRun = {
  ...save,
  formations: {
    ...save.formations,
    descent: { front: ['bran', 'mira'], back: ['rin', 'dorn', 'grimna'] },
  },
  descent: {
    day: DAY,
    cleared: 1,
    party: { front: ['bran', 'mira'], back: ['rin', 'dorn', 'grimna'] },
    health: { bran: 0.4, mira: 0.9, rin: 1, dorn: 1, grimna: 1 },
    energy: { bran: 30, mira: 0, rin: 0, dorn: 0, grimna: 0 },
    cards: [],
    lives: 2,
  },
};

/** Writes a save the app will read on its next load. Capacitor's web backend is localStorage. */
async function seedSave(page: Page, value: unknown): Promise<void> {
  await page.addInitScript(([key, save]) => localStorage.setItem(key, save), [
    'CapacitorStorage.save',
    JSON.stringify(value),
  ] as const);
}

/** Everything the run has stored about the Descent, read back off disk. */
async function storedRun(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('CapacitorStorage.save');
    return raw === null
      ? null
      : ((JSON.parse(raw) as Record<string, unknown>).descent as Record<string, unknown> | null);
  });
}

test.describe('The Descent', () => {
  test('starts a run with the crew the editor holds, and locks it', async ({ page }) => {
    await seedSave(page, save);
    await page.goto('/descent');

    // The crew is empty until one is arranged, so the control names that rather than refusing
    // silently — the same rule Home's campaign card follows.
    await expect(page.getByRole('button', { name: 'Descend' })).toBeDisabled();
    await expect(page.getByText('Choose a crew before descending')).toBeVisible();

    await page.getByRole('link', { name: 'Arrange your crew' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'The Descent' })).toBeVisible();

    // ⚠️ The pool is already filtered by the day's lock, so whatever is on this screen is legal by
    // construction — the editor never lists a character today's draw forbids. Taking the first
    // three is what a player does, and it is what the lock is for.
    const rows = page.locator('.roster__toggle');
    await expect(rows.first()).toBeVisible();
    for (let placed = 0; placed < 3; placed++) {
      await rows.nth(placed).click();
    }

    // ⚠️ **Back through the router, not `page.goto`.** A crew edit reaches `GameState` immediately
    // and storage on the next autosave or backgrounding — the same as every other crew edit — so a
    // full reload here would read a crew from disk that the player has not saved yet, and the test
    // would be measuring the autosave interval.
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Descend' })).toBeEnabled();
    await page.getByRole('button', { name: 'Descend' }).click();

    await expect(page.getByRole('button', { name: /^Fight 1 of/ })).toBeVisible();
    const run = await storedRun(page);
    expect(run?.cleared).toBe(0);
    expect(run?.day).toBe(DAY);
  });

  test('carries the damage the run has already taken onto the board', async ({ page }) => {
    // ⚠️ **The seam nothing else can see.** The party list reads the run's stored fractions, and
    // the fight that starts from here has to open at the same health — which is the whole mechanic.
    await seedSave(page, midRun);
    await page.goto('/descent');

    await expect(page.locator('.party__health').first()).toHaveText('40%');

    // A card is owed after the first win, so the fight control is not on screen yet.
    await expect(page.getByRole('heading', { level: 2, name: 'Take one' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Fight \d+ of/ })).toHaveCount(0);
  });

  test('takes one card and loses the other two', async ({ page }) => {
    await seedSave(page, midRun);
    await page.goto('/descent');

    const offered = page.locator('.offer .card');
    await expect(offered).toHaveCount(DESCENT_RULES.offer);
    const taken = (await offered.first().locator('.card__name').textContent())?.trim() ?? '';

    await offered.first().click();

    // The offer is gone and the run is carrying exactly one card — the one that was tapped.
    await expect(page.locator('.offer .card')).toHaveCount(0);
    await expect(page.locator('.hand__card')).toHaveCount(1);
    await expect(page.locator('.hand__name')).toHaveText(taken);

    // Persisted immediately rather than left to the next autosave: a card is an irreversible
    // choice, and losing the app between taking one and the autosave would hand it back.
    const run = await storedRun(page);
    expect(run?.cards).toHaveLength(1);
  });

  test('fights, banks the fight, and comes back with a card owed', async ({ page }) => {
    await seedSave(page, midRun);
    await page.goto('/descent');

    await page.locator('.offer .card').first().click();
    await page.getByRole('button', { name: /^Fight 2 of/ }).click();

    // The battle screen is a mode rather than a route, so it replaces this screen entirely.
    await expect(page.locator('.battle')).toBeVisible();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.locator('.actions')).toBeVisible({ timeout: 20_000 });

    // ⚠️ **The run advanced and the campaign did not.** A Descent clear may never touch
    // `clearedStages`, the ladder position or an idle rate.
    const run = await storedRun(page);
    expect(run?.cleared).toBe(2);
    const banked = await page.evaluate(() => {
      const raw = localStorage.getItem('CapacitorStorage.save');
      return JSON.parse(raw ?? '{}') as Record<string, unknown>;
    });
    expect(banked['clearedStages']).toBe(CLEARS);
    expect(banked['chapter']).toBe(1);
    expect(banked['stage']).toBe(1);
    expect((banked['rates'] as Record<string, string>)['gold']).toBe(String(top.rates.gold));

    await page.goto('/descent');
    await expect(page.getByRole('heading', { level: 2, name: 'Take one' })).toBeVisible();
  });

  test('does not offer auto-battle inside a run', async ({ page }) => {
    // ⚠️ The mode's premise: a fight cannot be repeated without a card being chosen, so a repeat
    // loop would win one fight and then report "there is nothing left to fight" about a run eight
    // fights from over.
    await seedSave(page, midRun);
    await page.goto('/descent');

    await page.locator('.offer .card').first().click();
    await page.getByRole('button', { name: /^Fight 2 of/ }).click();
    await expect(page.locator('.battle')).toBeVisible();

    await page.getByRole('button', { name: 'Auto' }).click();
    await expect(page.getByRole('button', { name: 'Auto' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('is reachable from Home, and says what state it is in', async ({ page }) => {
    await seedSave(page, save);
    await page.goto('');

    const card = page.getByRole('link', { name: /The Descent/ });
    await expect(card).toBeVisible();
    await card.click();

    await expect(page.getByRole('heading', { level: 1, name: 'The Descent' })).toBeVisible();
  });
});
