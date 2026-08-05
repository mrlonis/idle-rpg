import { expect, type Page, test } from '@playwright/test';
import {
  type ChapterCurveData,
  type ChapterData,
  ladderShape,
  positionAt,
  resolveLadder,
  type StageRewardCurveData,
  summonRatePerSecond,
  totalStages,
} from '../src/core';
import {
  AUTO_BATTLE_UNLOCK_CLEARS,
  CHAPTER_CURVE,
  CHAPTERS,
  STAGE_REWARDS,
  SUMMON_RATE,
} from '../src/data';

/**
 * Auto-battle, driven through a real browser.
 *
 * The unit specs pin the loop's decisions against a fake game loop. What only a browser can show
 * is that the whole path composes: a save that has earned the unlock renders the control, the
 * control keeps re-entering stages without another tap, and a loss puts the player back on the
 * idle screen knowing why.
 *
 * Capacitor's Preferences web backend is `localStorage` under a `CapacitorStorage.` prefix, so a
 * save is seeded by writing that key before the app boots — the same trick `save-recovery.spec.ts`
 * uses, and for the same reason: the interesting behaviour is downstream of the load path.
 */
const SAVE_KEY = 'CapacitorStorage.save';
const BACKUP_KEY = 'CapacitorStorage.save.bak';

const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;

const LADDER = ladderShape(chapters);
const STAGES = resolveLadder(chapters, chapterCurve, rewards);
const CLEARS = totalStages(LADDER);
const top = STAGES[CLEARS - 1];

/**
 * A run that has earned auto-battle, standing on the `index`th stage of the ladder, 1-based.
 *
 * The rates are the top of the ladder as well as the clear count, because
 * `reconcileClearedStages` takes the larger of the two — a save claiming clears it cannot back up
 * gets corrected, and the unlock would go with it.
 */
function unlockedRun(index: number) {
  const { chapter, stage } = positionAt(LADDER, index);
  return {
    version: 5,
    chapter,
    wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0' },
    rates: {
      gold: String(top.rates.gold),
      xp: String(top.rates.xp),
      essence: String(top.rates.essence),
      // Derived, not read off the stage: no stage authors a crystal rate. Seeding a wrong one
      // here is not harmless — an unparseable rate makes the app draw a save-repair notice, and
      // these tests read `.notice` to find out why auto-battle stopped.
      summons: String(summonRatePerSecond(SUMMON_RATE, CLEARS)),
    },
    lastTickAt: Date.now(),
    rng: { seed: 3735928559, calls: 0 },
    stage,
    clearedStages: CLEARS,
    battleCount: 214,
    roster: [
      { defId: 'rin', rarity: 0, level: 1, copies: 0 },
      { defId: 'bran', rarity: 0, level: 1, copies: 0 },
      { defId: 'mira', rarity: 0, level: 1, copies: 0 },
    ],
    formation: { front: ['bran', 'mira'], back: ['rin'] },
    pity: 0,
    pullCount: 0,
  };
}

async function seed(page: Page, save: unknown): Promise<void> {
  await page.addInitScript(
    ([key, backup, value]) => {
      localStorage.setItem(key, value);
      localStorage.removeItem(backup);
    },
    [SAVE_KEY, BACKUP_KEY, JSON.stringify(save)] as const,
  );
}

/** Opens the battle screen at 4x, which is what makes these tests seconds rather than minutes. */
async function enterBattle(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Fight \d+-\d+/ }).click();
  await expect(page.locator('.battle')).toBeVisible();
  await page.getByRole('button', { name: '4×' }).click();
}

test.describe('auto-battle', () => {
  test('is offered only once the run has earned it', async ({ page }) => {
    // A fresh run has cleared nothing, so the control is absent rather than present-and-disabled:
    // a button that explains why it will not work is still a button in the way.
    await page.goto('');
    await enterBattle(page);

    await expect(page.getByRole('button', { name: 'Auto' })).toBeHidden();
  });

  test('appears on a run that has cleared the hand-climbed half', async ({ page }) => {
    await seed(page, unlockedRun(1));
    await page.goto('');
    await enterBattle(page);

    const auto = page.getByRole('button', { name: 'Auto' });
    await expect(auto).toBeVisible();
    await expect(auto).toHaveAttribute('aria-pressed', 'false');
  });

  test('keeps re-entering stages without another tap', async ({ page }) => {
    // The whole feature, as one assertion: one click, and the ladder climbs on its own. The
    // starters win the opening stages, so the heading has to move off stage 1 by itself.
    await seed(page, unlockedRun(1));
    await page.goto('');
    await enterBattle(page);

    await page.getByRole('button', { name: 'Auto' }).click();

    await expect(page.getByRole('button', { name: 'Auto' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('.battle__stage')).toContainText('1-2', { timeout: 30_000 });
    await expect(page.locator('.battle__stage')).toContainText('1-3', { timeout: 30_000 });
  });

  test('drops the player back to the idle screen on a loss, and says where', async ({ page }) => {
    // Stage 7 is the healer lock, which three level-1 starters lose to reliably — see
    // `stages.balance.ts`. The run ends there and the player lands back on home, which is the
    // one moment the board that explained the loss is already gone.
    await seed(page, unlockedRun(7));
    await page.goto('');
    await enterBattle(page);

    await page.getByRole('button', { name: 'Auto' }).click();

    await expect(page.getByRole('heading', { name: 'Home', level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('.notice')).toContainText('Auto-battle stopped');
    await expect(page.locator('.notice')).toContainText(STAGES[6].name);
  });

  test('is switched off by the time the player is back on the idle screen', async ({ page }) => {
    await seed(page, unlockedRun(7));
    await page.goto('');
    await enterBattle(page);
    await page.getByRole('button', { name: 'Auto' }).click();
    await expect(page.getByRole('heading', { name: 'Home', level: 1 })).toBeVisible({
      timeout: 30_000,
    });

    // Straight back in: the loop must not still be armed from the run that just ended.
    await page.getByRole('button', { name: /^Fight \d+-\d+/ }).click();

    await expect(page.getByRole('button', { name: 'Auto' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('unlocks on the clear count rather than the stage number', async ({ page }) => {
    // A run parked at the top of the ladder still has it, which is the case a stage-number check
    // would get wrong forever.
    await seed(page, unlockedRun(CLEARS));
    await page.goto('');
    await enterBattle(page);

    expect(CLEARS).toBeGreaterThanOrEqual(AUTO_BATTLE_UNLOCK_CLEARS);
    await expect(page.getByRole('button', { name: 'Auto' })).toBeVisible();
  });
});
