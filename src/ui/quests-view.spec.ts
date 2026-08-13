import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { QuestsView } from './quests-view';
import { type QuestGroupView, type QuestRowView, QuestsService } from './quests.service';

/**
 * A row in the shape the service hands one over.
 *
 * Built here rather than driven through `core/` because what this file tests is the *screen* —
 * `core/quests.spec.ts` already proves the window arithmetic, and a component spec that recomputed
 * it would fail twice for one bug.
 */
function row(overrides: Partial<QuestRowView> = {}): QuestRowView {
  return {
    quest: {
      id: 'daily-skirmish',
      name: 'Skirmish',
      description: 'Fight five battles.',
      period: 'daily',
      counter: 'battleCount',
      target: 5,
      reward: { summons: 200 },
    },
    done: 3,
    target: 5,
    complete: false,
    claimed: false,
    claimable: false,
    fraction: 0.6,
    percent: 60,
    reward: [{ currency: 'summons', amount: '200', label: 'crystals' }],
    ...overrides,
  };
}

function group(overrides: Partial<QuestGroupView> = {}): QuestGroupView {
  return {
    period: 'daily',
    title: 'Today',
    resetsAt: 1_700_000_000_000,
    rows: [row()],
    ...overrides,
  };
}

class FakeQuests {
  readonly groups = signal<readonly QuestGroupView[]>([group()]);
  readonly claimable = signal(0);
  readonly claimAll = vi.fn(() => ({
    quests: 2,
    gained: [{ currency: 'summons' as const, amount: '350', label: 'crystals' }],
  }));
}

async function render() {
  const quests = new FakeQuests();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [QuestsView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: QuestsService, useValue: quests },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(QuestsView);
  fixture.detectChanges();

  return { quests, fixture, el: fixture.nativeElement as HTMLElement };
}

function claimButton(el: HTMLElement): HTMLButtonElement {
  const button = el.querySelector<HTMLButtonElement>('.claim-all');
  if (button === null) {
    throw new Error('the claim button is not on the screen');
  }
  return button;
}

describe('QuestsView', () => {
  it('names each quest, what it asks for, and what it pays', async () => {
    const { el } = await render();

    expect(el.querySelector('.quest__name')?.textContent?.trim()).toBe('Skirmish');
    expect(el.querySelector('.quest__description')?.textContent).toContain('Fight five battles');
    expect(el.querySelector('.quest__reward')?.textContent).toContain('200 crystals');
  });

  it('groups the two periods under their own headings', async () => {
    // A section with a heading rather than a run of rows, so the two windows are distinguishable
    // to a screen reader by structure and not only by where they sit on the page.
    const { el, quests, fixture } = await render();

    quests.groups.set([
      group(),
      group({ period: 'weekly', title: 'This week', rows: [row({ target: 35 })] }),
    ]);
    fixture.detectChanges();

    expect(
      [...el.querySelectorAll('.group__title')].map((node) => node.textContent?.trim()),
    ).toEqual(['Today', 'This week']);
  });

  it('disables the button and says so when nothing is finished', async () => {
    const { el } = await render();

    expect(claimButton(el).disabled).toBe(true);
    expect(claimButton(el).textContent?.trim()).toBe('Nothing to claim');
  });

  it('offers the claim once something is finished, counting what is waiting', async () => {
    const { el, quests, fixture } = await render();

    quests.claimable.set(2);
    fixture.detectChanges();

    expect(claimButton(el).disabled).toBe(false);
    expect(claimButton(el).textContent).toContain('(2)');
  });

  it('claims everything in one press and reports what arrived', async () => {
    const { el, quests, fixture } = await render();

    quests.claimable.set(2);
    fixture.detectChanges();
    claimButton(el).click();
    fixture.detectChanges();

    expect(quests.claimAll).toHaveBeenCalledOnce();
    expect(el.querySelector('.notice')?.textContent).toContain('Claimed 2 quests — 350 crystals.');
    expect(el.querySelector('.notice')?.getAttribute('role')).toBe('status');
  });

  it('marks a finished quest Ready and a taken one Claimed, in words', async () => {
    // ⚠️ Never colour or opacity alone. Dimming a card dims its text with it, and `$muted` at 70%
    // is under the 4.5:1 floor — the mistake that failed AXE on the Altar in all three browsers.
    const { el, quests, fixture } = await render();

    quests.groups.set([group({ rows: [row({ done: 5, complete: true, claimable: true })] })]);
    fixture.detectChanges();
    expect(el.querySelector('.quest__state')?.textContent?.trim()).toBe('Ready');

    quests.groups.set([group({ rows: [row({ done: 5, complete: true, claimed: true })] })]);
    fixture.detectChanges();
    expect(el.querySelector('.quest__state')?.textContent?.trim()).toBe('Claimed');
  });

  it('keeps a claimed quest on screen rather than removing it', async () => {
    const { el, quests, fixture } = await render();

    quests.groups.set([group({ rows: [row({ done: 5, complete: true, claimed: true })] })]);
    fixture.detectChanges();

    expect(el.querySelectorAll('.quest')).toHaveLength(1);
  });

  it('gives the progress bar real values and a readable description', async () => {
    const { el } = await render();
    const bar = el.querySelector('[role="progressbar"]');

    expect(bar?.getAttribute('aria-valuenow')).toBe('3');
    expect(bar?.getAttribute('aria-valuemax')).toBe('5');
    expect(bar?.getAttribute('aria-valuetext')).toBe('3 of 5');
    expect(bar?.getAttribute('aria-label')).toBe('Skirmish progress');
  });

  it('promises that missing a day costs nothing', async () => {
    // ⚠️ Load-bearing copy, not decoration. A streak that resets is a scarcity mechanic wearing a
    // generosity costume, and `docs/rejected.md` rules it out by name — so the screen has to say
    // plainly that nothing is lost.
    const { el } = await render();

    expect(el.querySelector('.intro')?.textContent).toContain('costs nothing');
  });

  it('offers a way back to Town, named rather than called "back"', async () => {
    const { el } = await render();
    const back = el.querySelector<HTMLAnchorElement>('.head__back');

    expect(back?.getAttribute('href')).toBe('/town');
    expect(back?.textContent).toContain('Town');
  });

  it('survives a build that ships no quests', async () => {
    const { el, quests, fixture } = await render();

    quests.groups.set([]);
    fixture.detectChanges();

    expect(el.querySelector('.empty')).not.toBeNull();
  });
});
