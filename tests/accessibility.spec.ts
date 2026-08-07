import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page, test, type TestInfo } from '@playwright/test';
import {
  ascensionCost,
  ladderShape,
  MAX_RARITY_INDEX,
  stagePayout,
  totalStages,
} from '../src/core';
import {
  ACHIEVEMENTS,
  ASCENSION_RULES,
  BOUNTIES,
  CHAPTERS,
  MORTAL_LADDER,
  QUEST_RULES,
  STAGE_REWARDS,
} from '../src/data';

/**
 * A run that has cleared the ladder, so the battle screen renders its auto-battle control.
 *
 * The rates are the top of the ladder as well as the clear count, because `reconcileClearedStages`
 * takes the larger of the two — and both are evaluated from the shipped curve rather than typed
 * out, so a new chapter re-runs this rather than leaving it describing an old ladder.
 */
const CLEARS = totalStages(ladderShape(CHAPTERS));
const top = stagePayout(STAGE_REWARDS, CLEARS);
const unlockedSave = {
  version: 0,
  wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0' },
  rates: {
    gold: String(top.rates.gold),
    xp: String(top.rates.xp),
    essence: String(top.rates.essence),
    summons: '0',
  },
  lastTickAt: Date.now(),
  rng: { seed: 3735928559, calls: 0 },
  chapter: 1,
  stage: 1,
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

/**
 * The same run, an hour stale, so the home screen draws its "while you were away" notice.
 *
 * That notice carries a dismiss button, and an icon button whose whole accessible name lives in
 * `aria-label` is exactly the markup that ends up announcing nothing. A fresh run has neither
 * notice, so no scan below would otherwise ever see one.
 */
const awaySave = { ...unlockedSave, lastTickAt: Date.now() - 3_600_000 };

/**
 * A run with gear in the bag, one piece worn, and enough gold to buy from the gear shop.
 *
 * A fresh run's bag is empty, so no scan above would ever see a gear row, a grade badge, an
 * expanded enhance panel or an affordable shop button. This is written at the **current** schema
 * rather than migrated from v0, because the fields under test are the ones v1 added.
 *
 * Rin is a ranger and Bran a tank, so the pieces below are the archetypes those two can actually
 * equip — a bag of gear nobody in the party can wear would scan the empty-picker branch and never
 * reach the list.
 */
const gearedSave = {
  ...unlockedSave,
  version: 1,
  wallet: { gold: '5e+7', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '250000' },
  roster: [
    { defId: 'rin', rarity: 0, level: 1, copies: 0, gear: { chest: 'g1' } },
    { defId: 'bran', rarity: 0, level: 1, copies: 0, gear: {} },
    { defId: 'mira', rarity: 0, level: 1, copies: 0, gear: {} },
  ],
  gear: [
    { id: 'g1', slot: 'chest', archetype: 'ranger', grade: 3, alignment: 'elf', level: 40 },
    { id: 'g2', slot: 'chest', archetype: 'ranger', grade: 1, level: 8 },
    { id: 'g3', slot: 'boots', archetype: 'ranger', grade: 4, alignment: 'human', level: 12 },
    { id: 'g4', slot: 'head', archetype: 'tank', grade: 0, level: 1 },
  ],
  gearMinted: 4,
  gearShop: { slot: 0, purchased: [] },
};

/**
 * A run holding duplicates, so the Altar renders all three of the states a row can be in.
 *
 * The copies are **derived from the shipped ladder**, not typed out: retuning a rung would
 * otherwise leave Rin one copy short and quietly scan the empty-ready branch instead of the rows
 * this test exists for. The *most expensive* rung rather than the one Rin happens to be facing,
 * because a v0 save's rarities are shifted up two by the v1 → v2 migration before this screen ever
 * sees them — so the rung this pays for is not the one written below.
 */
const READY_COPIES = Math.max(
  ...MORTAL_LADDER.map((_, from) => ascensionCost(ASCENSION_RULES, 'mortal', from) ?? 0),
);
const duplicatesSave = {
  ...unlockedSave,
  roster: [
    // Ready: enough for any single rung, so the row's Ascend button is enabled.
    { defId: 'rin', rarity: 0, level: 1, copies: READY_COPIES },
    // Short: a row quoting a price it cannot pay, which is the "Not yet" group's ordinary case.
    { defId: 'bran', rarity: 0, level: 1, copies: 1 },
    // Done: the top of the ladder, where copies become spark and there is no next rung to name.
    { defId: 'mira', rarity: MAX_RARITY_INDEX, level: 1, copies: 3 },
  ],
};

/**
 * The track the fixture below partly claims: the one counted in stage clears, which
 * {@link unlockedSave} has already taken to the top of the ladder.
 *
 * Found by its counter rather than named, so the seeded ledger key and the locator in the test
 * both come from one place. Retyping either would turn the coupling into a comment — the fixture
 * would go on claiming a track id nothing ships and quietly scan the unclaimed branch, which is
 * the exact state this fixture exists to avoid.
 */
const CLAIMED_TRACK = ACHIEVEMENTS.find((track) => track.counter === 'clearedStages');
if (CLAIMED_TRACK === undefined) {
  throw new Error('No achievement track is counted in stage clears; `achievementsSave` is stale.');
}

/**
 * Awards {@link CLAIMED_TRACK} has already taken.
 *
 * One, and it must stay the only track with a non-zero count: the test locates the partly-claimed
 * row by this number, which is unambiguous precisely because every other track has claimed nothing.
 */
const CLAIMED_AWARDS = 1;

/**
 * A run with achievement awards waiting, and one already taken.
 *
 * `clearedStages` is {@link CLEARS}, so what decides how many awards are outstanding is the ledger
 * below rather than a second clear count — which keeps this fixture honest if the ladder is
 * retuned. One claimed entry puts a *partly* claimed track on screen, which is the row state a
 * fresh run and a fully claimed one both miss.
 */
const achievementsSave = {
  ...unlockedSave,
  // ⚠️ Written at the **current** schema rather than migrated from v0, for the reason
  // `gearedSave` is: the v2 → v3 migration writes `achievements: {}` unconditionally — correct,
  // because a v2 save cannot have one — so a v0 fixture would have this ledger overwritten on the
  // way up and scan the unclaimed-everything branch instead.
  version: 3,
  roster: [
    { defId: 'rin', rarity: 2, level: 1, copies: 0, gear: {} },
    { defId: 'bran', rarity: 2, level: 1, copies: 0, gear: {} },
    { defId: 'mira', rarity: 2, level: 1, copies: 0, gear: {} },
  ],
  wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
  gear: [],
  gearMinted: 0,
  gearShop: { slot: 0, purchased: [] },
  achievements: { [CLAIMED_TRACK.id]: CLAIMED_AWARDS },
};

/**
 * A run with one daily quest finished and the other still running.
 *
 * ⚠️ **The window index is computed rather than written**, and it has to be: `GameLoopService`
 * rolls any window whose period has elapsed, so a hard-coded index would be behind the clock on
 * every run after the day it was written, get rolled, and scan a board with nothing on it.
 *
 * The offset must match `QUEST_RULES.resetOffsetMinutes`; it is imported rather than restated so
 * moving the reset moves this with it.
 */
function questsSave() {
  const dayIndex = Math.floor((Date.now() - QUEST_RULES.resetOffsetMinutes * 60_000) / 86_400_000);
  const weekIndex = Math.floor(
    (Date.now() - QUEST_RULES.resetOffsetMinutes * 60_000) / (86_400_000 * 7),
  );
  return {
    ...unlockedSave,
    // Current schema rather than migrated from v0: the v3 → v4 migration writes empty windows
    // unconditionally, so a v0 fixture would have these overwritten on the way up.
    version: 4,
    battleCount: 100,
    pullCount: 20,
    roster: [
      { defId: 'rin', rarity: 2, level: 1, copies: 0, gear: {} },
      { defId: 'bran', rarity: 2, level: 1, copies: 0, gear: {} },
      { defId: 'mira', rarity: 2, level: 1, copies: 0, gear: {} },
    ],
    wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
    gear: [],
    gearMinted: 0,
    gearShop: { slot: 0, purchased: [] },
    achievements: {},
    quests: {
      // 100 battles against a baseline of 95 finishes the five-battle daily; 20 pulls against 20
      // leaves the pull daily untouched, so both row states are on screen at once.
      daily: { index: dayIndex, baseline: { battleCount: 95, pullCount: 20 }, claimed: [] },
      weekly: { index: weekIndex, baseline: { battleCount: 95, pullCount: 20 }, claimed: [] },
    },
  };
}

/**
 * The shortest mission that carries a faction requirement, derived rather than named.
 *
 * ⚠️ **Seeding a dispatch on this one is what makes the scan deterministic.** The board rotates
 * daily, so which variant of a tier is offered is a function of the seed and the date — and an
 * assertion about a requirement being on screen would pass or fail depending on the day it ran. A
 * *running* mission holds its tier's row whatever the draw says, so dispatching this one puts the
 * requirement markup in every scan, forever.
 */
const REQUIRED_BOUNTY = [...BOUNTIES]
  .filter((bounty) => bounty.requires !== undefined)
  .sort((a, b) => a.durationMs - b.durationMs)[0];

if (REQUIRED_BOUNTY === undefined) {
  throw new Error('No bounty carries a faction requirement; `bountiesSave` is stale.');
}
if (REQUIRED_BOUNTY.crew !== 1) {
  // The fixture benches exactly one character — two are fielded, which is what gives the picker
  // somebody to offer *and* somebody to withhold. A wider mission would need a wider bench.
  throw new Error(
    `The shortest mission with a requirement now wants ${REQUIRED_BOUNTY.crew} characters; widen the bench in \`bountiesSave\`.`,
  );
}

/**
 * A run with one bounty finished, enough clears to unlock more, and a bench to crew them from.
 *
 * The mission is backdated to twice its own duration, so it has finished by the time the app loads
 * however long the suite takes to get here — a fixed timestamp would go stale.
 */
function bountiesSave() {
  return {
    ...unlockedSave,
    // Current schema rather than migrated from v0: the v4 → v5 migration writes an empty dispatch
    // list unconditionally, so a v0 fixture would lose this on the way up.
    version: 5,
    clearedStages: CLEARS,
    roster: [
      { defId: 'rin', rarity: 2, level: 1, copies: 0, gear: {} },
      { defId: 'bran', rarity: 2, level: 1, copies: 0, gear: {} },
      { defId: 'mira', rarity: 2, level: 1, copies: 0, gear: {} },
      // ⚠️ Two more, and they are what make the picker non-empty. `rin` is the only other bench
      // character and the seeded dispatch takes her, so a roster of three leaves the picker showing
      // its empty state — which scans, passes, and covers none of the toggle-list markup this test
      // exists for. `wren` is a Human and `dorn` a Dwarf, so the list holds both a member who can
      // count toward a faction requirement and one who cannot.
      { defId: 'wren', rarity: 2, level: 1, copies: 0, gear: {} },
      { defId: 'dorn', rarity: 2, level: 1, copies: 0, gear: {} },
    ],
    // Two fielded, two on the bench, one away — so the picker has somebody to offer *and* somebody
    // to withhold, which is the disjointness invariant visible on screen.
    formation: { front: ['bran'], back: ['mira'] },
    wallet: { gold: '0', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
    gear: [],
    gearMinted: 0,
    gearShop: { slot: 0, purchased: [] },
    achievements: {},
    quests: {
      daily: { index: -1, baseline: {}, claimed: [] },
      weekly: { index: -1, baseline: {}, claimed: [] },
    },
    dispatches: [
      {
        bountyId: REQUIRED_BOUNTY.id,
        members: ['rin'],
        startedAt: Date.now() - 2 * REQUIRED_BOUNTY.durationMs,
      },
    ],
  };
}

/** Writes a save the app will read on its next load. Capacitor's web backend is localStorage. */
async function seedSave(page: Page, save: unknown): Promise<void> {
  await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
    'CapacitorStorage.save',
    JSON.stringify(save),
  ] as const);
}

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
    await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();

    await scan(page, testInfo, 'home');
  });

  test('the home screen with a dismissible notice has no AXE violations', async ({
    page,
  }, testInfo) => {
    await seedSave(page, awaySave);
    await page.goto('');

    await expect(page.getByRole('button', { name: /^Fight \d+-\d+/ })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Dismiss offline earnings notice' }),
    ).toBeVisible();

    await scan(page, testInfo, 'home-notice');
  });

  test('the battle screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('');

    await page.getByRole('button', { name: /^Fight \d+-\d+/ }).click();
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

  test('the battle screen with auto-battle unlocked has no AXE violations', async ({
    page,
  }, testInfo) => {
    // The Auto toggle only renders for a run that has earned it, so the scan above never sees it.
    // It is a pressed-state button sitting beside three more of them, which is exactly the markup
    // most likely to end up announcing nothing.
    await seedSave(page, unlockedSave);
    await page.goto('');

    await page.getByRole('button', { name: /^Fight \d+-\d+/ }).click();
    await expect(page.getByRole('button', { name: 'Auto' })).toBeVisible();
    await page.getByRole('button', { name: '4×' }).click();
    await expect(page.locator('.actions')).toBeVisible({ timeout: 15_000 });

    await scan(page, testInfo, 'battle-auto');
  });

  /**
   * The gacha screens are routes, so each is reachable directly and each gets its own scan.
   *
   * These carry the markup most likely to go wrong: a progress bar, a data table, toggle buttons
   * whose visible label repeats down a list, and a disclosure. None of that is covered by a scan
   * of another screen.
   */
  test('the town screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/town');

    await expect(page.getByRole('heading', { level: 1, name: 'Town' })).toBeVisible();

    await scan(page, testInfo, 'town');
  });

  test('the summon screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/town/summon');

    await expect(page.getByRole('heading', { level: 1, name: 'Summon' })).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();

    await scan(page, testInfo, 'summon');
  });

  test('the roster screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/roster');

    await expect(page.getByRole('heading', { level: 1, name: 'Roster' })).toBeVisible();
    // A fresh run fields three of five, so the placement control is scanned in both of its
    // states — one row offering to move somebody who is standing, and the empty slots below.
    await expect(page.getByRole('heading', { level: 2, name: 'Formation' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Move .* to the back row/ }).first(),
    ).toBeVisible();

    await scan(page, testInfo, 'roster');
  });

  test('a character sheet has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/roster/rin');

    await expect(page.getByRole('heading', { level: 1, name: 'Rin' })).toBeVisible();

    await scan(page, testInfo, 'character');
  });

  /**
   * The bag carries two patterns nothing else here does: a disclosure whose expanded panel holds
   * its own controls, and a grade that is drawn as a colour. Colour is never the only carrier of
   * meaning in this project, so a scan that never expands a row would miss the half of that rule
   * the markup is responsible for.
   *
   * Two scans rather than one since the forge moved to Town: they were one screen and are now two
   * routes, and a scan of either would no longer see the other's markup.
   */
  test('the bag has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, gearedSave);
    await page.goto('/bag');

    await expect(page.getByRole('heading', { level: 1, name: 'Bag' })).toBeVisible();
    // The bag only renders rows when something is spare, so waiting on one is what proves the
    // seeded save was read rather than scanning an empty-state branch.
    await expect(page.locator('.item').first()).toBeVisible();

    // Expanded, so the scan covers the enhance and salvage controls inside the panel rather than
    // only the row that reveals them.
    await page.locator('.item__row').first().click();
    await expect(page.locator('.detail')).toBeVisible();

    await scan(page, testInfo, 'bag');
  });

  test('the gear shop has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, gearedSave);
    await page.goto('/town/gear-shop');

    await expect(page.getByRole('heading', { level: 1, name: 'Gear Shop' })).toBeVisible();
    // The stock is derived, so six offers render whatever the run holds; the seeded gold is what
    // makes their buttons enabled rather than disabled, which is the state worth scanning.
    await expect(page.locator('.offer').first()).toBeVisible();
    await expect(page.locator('.offer__buy').first()).toBeEnabled();

    await scan(page, testInfo, 'gear-shop');
  });

  test('a character sheet with its gear picker open has no AXE violations', async ({
    page,
  }, testInfo) => {
    await seedSave(page, gearedSave);
    await page.goto('/roster/rin');

    await expect(page.getByRole('heading', { level: 1, name: 'Rin' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Gear' })).toBeVisible();

    // The chest slot is the one holding a piece *and* offering an alternative, so opening it
    // scans the "take off" control and the option list together.
    await page.getByRole('button', { name: /^Chest/ }).click();
    await expect(page.locator('.picker')).toBeVisible();

    await scan(page, testInfo, 'character-gear');
  });

  /**
   * The Altar, seeded so every row state is on screen at once.
   *
   * Its markup is the pattern most likely to go wrong here: a list whose rows are focusable
   * without being in the tab order — a character sheet links straight to one — beside buttons
   * whose visible label ("Ascend") repeats down the whole list and whose accessible name has to
   * come from somewhere else.
   */
  test('the altar has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, duplicatesSave);
    await page.goto('/town/altar');

    await expect(page.getByRole('heading', { level: 1, name: 'Altar' })).toBeVisible();
    // A ready row and a waiting row both on screen, which is what proves the seeded save was read
    // rather than scanning an empty-state branch.
    await expect(page.getByRole('button', { name: /^Ascend Rin to / })).toBeEnabled();
    await expect(page.locator('.character--waiting').first()).toBeVisible();

    await scan(page, testInfo, 'altar');
  });

  /**
   * Achievements, seeded so a ready track and a claimed one are both on screen.
   *
   * Every row carries a `role="progressbar"` whose whole accessible description lives in
   * `aria-valuetext` — markup that ends up announcing a bare percentage of nothing if it is wrong.
   * A fresh run would scan the "first award at 5" branch and never reach a ready row.
   *
   * ⚠️ **The bar is located by name, and it has to be.** This read `getByRole('progressbar')`
   * bare, on a comment claiming the row carried the app's only one. That stopped being true the
   * moment a second track shipped, and Playwright's strict mode then failed the locator — before
   * {@link scan} on the next line ever ran, so the screen sat with no accessibility coverage at all
   * while the suite reported a failure that looked like a markup regression. **A precondition guard
   * that can be broken by unrelated content is worse than none**: it fails loudly for the wrong
   * reason and hides the assertion it was guarding. Name the row this fixture is actually about.
   *
   * ⚠️ **A visible bar is not evidence the seeded ledger was read.** Every row draws one whatever
   * its claim state, so the bare locator was never proving what the comment said it did — the
   * strict-mode break only made a weak guard look like a broken one. The claim count in the hint
   * text is the assertion that actually distinguishes the branches.
   *
   * ⚠️ It also scans the *quiet* rows, which is the point the Altar learned the hard way: dimming
   * a card with `opacity` dims its text with it, and `$muted` at 70% is under the 4.5:1 floor.
   */
  test('the achievements screen has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, achievementsSave);
    await page.goto('/town/achievements');

    await expect(page.getByRole('heading', { level: 1, name: 'Achievements' })).toBeVisible();
    // A track with something waiting, which is what proves the seeded save was read rather than
    // scanning the empty-state branch.
    await expect(page.getByRole('button', { name: /^Claim all/ })).toBeEnabled();
    await expect(
      page.getByRole('progressbar', { name: `${CLAIMED_TRACK.name} progress` }),
    ).toBeVisible();
    // The bar renders on every row whatever its state, so it proves a row was drawn and nothing
    // more. The *partly claimed* branch — the row state this fixture exists for, and the one a
    // fresh run and a fully claimed one both miss — is only legible in the hint text, and only the
    // seeded ledger can put a non-zero claim count there.
    await expect(page.getByText(new RegExp(`earned, ${CLAIMED_AWARDS} claimed`))).toBeVisible();

    await scan(page, testInfo, 'achievements');
  });

  /**
   * Quests, seeded so a finished quest and an unfinished one are both on screen.
   *
   * The screen carries two `role="progressbar"` rows and a state word that is the *only* signal a
   * quest is done — colour is never allowed to carry that alone, which is what this scan is
   * checking as much as the bar's labelling.
   *
   * ⚠️ The seeded window is pinned to the index the app will compute for "now", because a window
   * whose stored index is behind the clock is rolled on load — which would reset the baseline and
   * scan an empty board instead of the one this test is for.
   */
  test('the quests screen has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, questsSave());
    await page.goto('/town/quests');

    await expect(page.getByRole('heading', { level: 1, name: 'Quests' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Claim all/ })).toBeEnabled();
    await expect(page.getByRole('progressbar').first()).toBeVisible();

    await scan(page, testInfo, 'quests');
  });

  /**
   * The bounty board, seeded so a finished mission, a running one and a locked one are all on
   * screen, with the crew picker open.
   *
   * ⚠️ The picker is the reason this scan matters most: it is a list of toggle buttons whose state
   * lives entirely in `aria-pressed`, beside a Send control that is disabled until the crew is the
   * right size. Both are the shape that ends up with controls nothing can name.
   *
   * The formation is left holding two characters so the picker has somebody to offer *and*
   * somebody to withhold — which is the disjointness invariant visible on screen.
   */
  test('the bounty board has no AXE violations', async ({ page }, testInfo) => {
    await seedSave(page, bountiesSave());
    await page.goto('/town/bounties');

    await expect(page.getByRole('heading', { level: 1, name: 'Bounty Board' })).toBeVisible();
    // A finished mission, which proves the seeded dispatch was read rather than scanning an
    // empty board.
    await expect(page.getByRole('button', { name: /^Collect all/ })).toBeEnabled();
    // The seeded mission carries a faction requirement, and a running mission holds its tier's
    // row — so this markup is in the scan whatever the day's rotation drew.
    await expect(page.locator('.mission__term--requires').first()).toBeVisible();

    // Open a crew picker on a mission nobody is on, so the toggle list is in the scan.
    await page
      .getByRole('button', { name: /^Choose a crew for/ })
      .first()
      .click();
    await expect(page.locator('.picker')).toBeVisible();

    // ⚠️ And choose somebody, so the scan covers the *chosen* state. That is the one new colour
    // pairing the faction line introduced — muted text on the accent background — and an unchosen
    // picker would never put it in front of AXE.
    await page.locator('.picker__member').first().click();
    await expect(page.locator('.picker__member--chosen')).toHaveCount(1);

    await scan(page, testInfo, 'bounties');
  });

  test('the spark shop has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/town/shop');

    await expect(page.getByRole('heading', { level: 1, name: 'Spark Shop' })).toBeVisible();

    await scan(page, testInfo, 'shop');
  });

  /**
   * The settings screen carries the only radio group in the app, and its inputs are visually
   * hidden with the visible box beside them — which is exactly the arrangement that ends up with
   * controls nothing can name.
   */
  test('the settings screen has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('radio', { name: '1×' })).toBeChecked();

    await scan(page, testInfo, 'settings');
  });

  /**
   * The app's first modal, and the markup with the most ways to be wrong: a dialog role, a label
   * that has to come from the visible heading, and everything behind it needing to leave the
   * accessibility tree. CDK owns all three, so this is as much a check that the CDK path is wired
   * up as it is a scan.
   *
   * Scanned with the dialog **open**, which also covers the screen underneath in its `aria-hidden`
   * state — a violation there would be one no other scan could see.
   */
  test('the reset confirmation has no AXE violations', async ({ page }, testInfo) => {
    await page.goto('/settings');

    await page.getByRole('button', { name: 'Reset run' }).click();
    await expect(page.getByRole('dialog', { name: 'Reset this run?' })).toBeVisible();

    await scan(page, testInfo, 'settings-reset-dialog');
  });
});
