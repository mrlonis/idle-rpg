import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AchievementsView } from './achievements-view';
import { AchievementsService, type AchievementRowView } from './achievements.service';

/**
 * A row in the shape the service hands one over.
 *
 * Built here rather than driven through `core/` because what this file tests is the *screen* —
 * `core/achievements.spec.ts` already proves the arithmetic, and a component spec that recomputed
 * it would fail twice for one bug and tell you nothing extra either time.
 */
function row(overrides: Partial<AchievementRowView> = {}): AchievementRowView {
  return {
    track: {
      id: 'stages-cleared',
      name: 'Stage Climber',
      description: 'Crystals for every five stages cleared.',
      counter: 'clearedStages',
      every: 5,
      reward: { summons: 250 },
    },
    total: 12,
    position: 12,
    earned: 2,
    claimed: 0,
    unclaimed: 2,
    nextAt: 15,
    fraction: 0.4,
    percent: 40,
    owed: [{ currency: 'summons', amount: '500', label: 'crystals' }],
    perAward: [{ currency: 'summons', amount: '250', label: 'crystals' }],
    ...overrides,
  };
}

class FakeAchievements {
  readonly rows = signal<readonly AchievementRowView[]>([row()]);
  readonly unclaimed = signal(2);
  readonly claimAll = vi.fn(() => ({
    awards: 2,
    gained: [{ currency: 'summons' as const, amount: '500', label: 'crystals' }],
  }));
}

async function render() {
  const achievements = new FakeAchievements();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [AchievementsView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: AchievementsService, useValue: achievements },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AchievementsView);
  fixture.detectChanges();

  return { achievements, fixture, el: fixture.nativeElement as HTMLElement };
}

function claimButton(el: HTMLElement): HTMLButtonElement {
  const button = el.querySelector<HTMLButtonElement>('.claim-all');
  if (button === null) {
    throw new Error('the claim button is not on the screen');
  }
  return button;
}

describe('AchievementsView', () => {
  it('names every shipped track and what it pays', async () => {
    const { el } = await render();

    expect(el.querySelector('.track__name')?.textContent?.trim()).toBe('Stage Climber');
    expect(el.querySelector('.track__reward')?.textContent).toContain('250 crystals');
  });

  it('quotes what one press pays before it is pressed', async () => {
    // The same argument the Town cards make for carrying a balance: the number that decides
    // whether to act should be readable without acting.
    const { el } = await render();

    expect(claimButton(el).textContent).toContain('500 crystals');
  });

  it('disables the button and says so when nothing is waiting', async () => {
    const { el, achievements, fixture } = await render();

    achievements.unclaimed.set(0);
    achievements.rows.set([row({ unclaimed: 0, claimed: 2, owed: [] })]);
    fixture.detectChanges();

    expect(claimButton(el).disabled).toBe(true);
    expect(claimButton(el).textContent?.trim()).toBe('Nothing to claim');
  });

  it('claims everything in one press and reports what arrived', async () => {
    const { el, achievements, fixture } = await render();

    claimButton(el).click();
    fixture.detectChanges();

    expect(achievements.claimAll).toHaveBeenCalledOnce();
    expect(el.querySelector('.notice')?.textContent).toContain('Claimed 2 awards — 500 crystals.');
  });

  it('announces the result rather than leaving it to be noticed', async () => {
    // `role="status"` is a polite live region: the wallet moved somewhere off-screen, so the one
    // thing confirming the press worked has to reach a screen reader without stealing focus.
    const { el, fixture } = await render();

    claimButton(el).click();
    fixture.detectChanges();

    expect(el.querySelector('.notice')?.getAttribute('role')).toBe('status');
  });

  it('keeps a claimed track on screen, showing the next award instead of vanishing', async () => {
    // ⚠️ A screen that empties itself is a screen a player learns not to open.
    const { el, achievements, fixture } = await render();

    achievements.unclaimed.set(0);
    achievements.rows.set([row({ unclaimed: 0, claimed: 2, owed: [], total: 12, nextAt: 15 })]);
    fixture.detectChanges();

    expect(el.querySelectorAll('.track')).toHaveLength(1);
    expect(el.querySelector('.track__progress')?.textContent).toContain('12');
    expect(el.querySelector('.track__progress')?.textContent).toContain('15');
  });

  it('marks a ready track with a border rather than dimming the others', async () => {
    // ⚠️ Dimming a card dims its text with it, and `$muted` at 70% is under the 4.5:1 floor —
    // which is exactly how the Altar's "Not yet" rows failed AXE in all three browsers.
    const { el, achievements, fixture } = await render();

    expect(el.querySelector('.track')?.classList.contains('track--ready')).toBe(true);

    achievements.rows.set([row({ unclaimed: 0, owed: [] })]);
    fixture.detectChanges();

    expect(el.querySelector('.track')?.classList.contains('track--ready')).toBe(false);
  });

  it('gives the progress bar real values and a readable description', async () => {
    // A styled div would leave a screen reader with nothing but the raw counts, and a percentage
    // alone does not say what it is a percentage of.
    const { el } = await render();
    const bar = el.querySelector('[role="progressbar"]');

    expect(bar?.getAttribute('aria-valuenow')).toBe('12');
    expect(bar?.getAttribute('aria-valuemin')).toBe('10');
    expect(bar?.getAttribute('aria-valuemax')).toBe('15');
    expect(bar?.getAttribute('aria-valuetext')).toBe('12 of 15 toward the next award');
    expect(bar?.getAttribute('aria-label')).toBe('Stage Climber progress');
  });

  it('draws a coarse counter part way through its unit rather than at empty', async () => {
    // ⚠️ A chapter track counts in chapters and a chapter is fifty fights. `aria-valuenow` follows
    // `position` so the announced value agrees with the fill — `total` alone would say "1" beside
    // a bar the player can see is a quarter full. The text stays in whole chapters, which is what
    // the row is actually counting.
    const { el, achievements, fixture } = await render();

    achievements.rows.set([
      row({
        track: {
          id: 'chapters-cleared',
          name: 'Chapter Conqueror',
          description: 'Crystals for every chapter finished.',
          counter: 'clearedChapters',
          every: 1,
          reward: { summons: 10_000 },
        },
        total: 1,
        position: 1.24,
        earned: 1,
        claimed: 0,
        unclaimed: 1,
        nextAt: 2,
        fraction: 0.24,
        percent: 24,
      }),
    ]);
    fixture.detectChanges();
    const bar = el.querySelector('[role="progressbar"]');

    expect(bar?.getAttribute('aria-valuenow')).toBe('1.24');
    expect(bar?.getAttribute('aria-valuemin')).toBe('1');
    expect(bar?.getAttribute('aria-valuemax')).toBe('2');
    expect(bar?.getAttribute('aria-valuetext')).toBe('1 of 2 toward the next award');
  });

  it('offers a way back to Town, named rather than called "back"', async () => {
    const { el } = await render();
    const back = el.querySelector<HTMLAnchorElement>('.head__back');

    expect(back?.getAttribute('href')).toBe('/town');
    expect(back?.textContent).toContain('Town');
  });

  it('says the first award is still ahead when the run has claimed nothing', async () => {
    const { el, achievements, fixture } = await render();

    achievements.rows.set([
      row({ total: 3, earned: 0, claimed: 0, unclaimed: 0, nextAt: 5, owed: [], percent: 60 }),
    ]);
    fixture.detectChanges();

    expect(el.querySelector('.track__progress')?.textContent).toContain('first award at 5');
  });

  it('survives a build that ships no tracks at all', async () => {
    const { el, achievements, fixture } = await render();

    achievements.rows.set([]);
    achievements.unclaimed.set(0);
    fixture.detectChanges();

    expect(el.querySelector('.track--empty')).not.toBeNull();
  });
});
