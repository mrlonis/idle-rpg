import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { type BountyFailure } from '../core';
import { BountiesView } from './bounties-view';
import { BountiesService, type BountyRowView, type CrewMemberView } from './bounties.service';

function row(overrides: Partial<BountyRowView> = {}): BountyRowView {
  return {
    bounty: {
      id: 'patrol',
      name: 'Border Patrol',
      description: 'Two characters walk the boundary.',
      durationMs: 4 * 3_600_000,
      crew: 2,
      payoutSeconds: 5400,
      unlockClears: 15,
    },
    running: false,
    ready: false,
    unlocked: true,
    percent: 0,
    remaining: '',
    duration: '4h',
    payout: [{ currency: 'gold', amount: '54K', label: 'gold' }],
    crew: [],
    ...overrides,
  };
}

const BENCH: CrewMemberView[] = [
  { defId: 'rin', name: 'Rin', factionName: 'elf' },
  { defId: 'bran', name: 'Bran', factionName: 'dwarf' },
  { defId: 'mira', name: 'Mira', factionName: 'human' },
];

class FakeBounties {
  readonly rows = signal<readonly BountyRowView[]>([row()]);
  readonly ready = signal(0);
  readonly available = signal<readonly CrewMemberView[]>(BENCH);
  /** Set to make the next dispatch refuse, so the screen's error path can be driven. */
  refusal: BountyFailure | null = null;
  readonly dispatch = vi.fn((_bounty: unknown, members: readonly string[]) => {
    void members;
    return this.refusal;
  });
  readonly collect = vi.fn(() => ({
    missions: 1,
    gained: [{ currency: 'gold' as const, amount: '54K', label: 'gold' }],
  }));
  readonly collectAll = vi.fn(() => ({
    missions: 2,
    gained: [{ currency: 'gold' as const, amount: '120K', label: 'gold' }],
  }));
}

async function render() {
  const bounties = new FakeBounties();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [BountiesView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: BountiesService, useValue: bounties },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(BountiesView);
  fixture.detectChanges();

  return { bounties, fixture, el: fixture.nativeElement as HTMLElement };
}

function click(el: HTMLElement, selector: string): void {
  el.querySelector<HTMLButtonElement>(selector)?.click();
}

function crewButtons(el: HTMLElement): HTMLButtonElement[] {
  return [...el.querySelectorAll<HTMLButtonElement>('.picker__member')];
}

describe('BountiesView', () => {
  it('names each mission, its terms and what it pays at current rates', async () => {
    const { el } = await render();

    expect(el.querySelector('.mission__name')?.textContent?.trim()).toBe('Border Patrol');
    expect(el.querySelector('.mission__terms')?.textContent).toContain('2');
    expect(el.querySelector('.mission__terms')?.textContent).toContain('4h');
    expect(el.querySelector('.mission__payout')?.textContent).toContain('54K gold');
  });

  it('opens a crew picker offering only characters who can actually go', async () => {
    // ⚠️ The disjointness invariant showing through to the UI. Offering somebody `core/` would
    // refuse is how a player learns a rule by being told "no"; the list is what makes it visible.
    const { el, fixture } = await render();

    click(el, '.mission__action');
    fixture.detectChanges();

    expect(crewButtons(el).map((button) => button.textContent?.trim())).toEqual([
      'Rin',
      'Bran',
      'Mira',
    ]);
  });

  it('will not send until the crew is exactly the size the mission wants', async () => {
    const { el, fixture } = await render();
    click(el, '.mission__action');
    fixture.detectChanges();

    const send = (): HTMLButtonElement | null => el.querySelector('.picker__send');
    expect(send()?.disabled).toBe(true);

    crewButtons(el)[0].click();
    fixture.detectChanges();
    expect(send()?.disabled).toBe(true);

    crewButtons(el)[1].click();
    fixture.detectChanges();
    expect(send()?.disabled).toBe(false);
  });

  it('stops adding at the crew size rather than swapping somebody out', async () => {
    // A toggle that removed a choice the player did not make is a control people stop trusting.
    const { el, fixture } = await render();
    click(el, '.mission__action');
    fixture.detectChanges();

    crewButtons(el)[0].click();
    crewButtons(el)[1].click();
    crewButtons(el)[2].click();
    fixture.detectChanges();

    expect(el.querySelector('.picker__prompt')?.textContent).toContain('2 chosen');
    expect(crewButtons(el)[2].getAttribute('aria-pressed')).toBe('false');
  });

  it('marks a chosen member with aria-pressed, not colour alone', async () => {
    const { el, fixture } = await render();
    click(el, '.mission__action');
    fixture.detectChanges();

    crewButtons(el)[0].click();
    fixture.detectChanges();

    expect(crewButtons(el)[0].getAttribute('aria-pressed')).toBe('true');
    expect(crewButtons(el)[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('dispatches the chosen crew and says when they are back', async () => {
    const { el, bounties, fixture } = await render();
    click(el, '.mission__action');
    fixture.detectChanges();
    crewButtons(el)[0].click();
    crewButtons(el)[1].click();
    fixture.detectChanges();

    click(el, '.picker__send');
    fixture.detectChanges();

    expect(bounties.dispatch).toHaveBeenCalledOnce();
    expect(bounties.dispatch.mock.calls[0][1]).toEqual(['rin', 'bran']);
    expect(el.querySelector('.notice')?.textContent).toContain('back in 4h');
  });

  it('turns a refusal into a sentence the player can act on', async () => {
    const { el, bounties, fixture } = await render();
    bounties.refusal = 'in-formation';
    click(el, '.mission__action');
    fixture.detectChanges();
    crewButtons(el)[0].click();
    crewButtons(el)[1].click();
    fixture.detectChanges();

    click(el, '.picker__send');
    fixture.detectChanges();

    expect(el.querySelector('.notice')?.textContent).toContain('Bench them first');
  });

  it('says who is away and how long is left while a mission runs', async () => {
    const { el, bounties, fixture } = await render();
    bounties.rows.set([
      row({ running: true, percent: 40, remaining: '2h 24m', crew: [BENCH[0], BENCH[1]] }),
    ]);
    fixture.detectChanges();

    expect(el.querySelector('.mission__state')?.textContent).toContain('2h 24m left');
    expect(el.querySelector('.mission__crew')?.textContent).toContain('Rin');
    expect(el.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe(
      '2h 24m left',
    );
  });

  it('offers a collect button once a mission is back', async () => {
    const { el, bounties, fixture } = await render();
    bounties.rows.set([row({ running: true, ready: true, percent: 100, crew: [BENCH[0]] })]);
    fixture.detectChanges();

    expect(el.querySelector('.mission__state')?.textContent?.trim()).toBe('Back');
    click(el, '.mission__action');
    fixture.detectChanges();

    expect(bounties.collect).toHaveBeenCalledOnce();
    expect(el.querySelector('.notice')?.textContent).toContain('54K gold');
  });

  it('collects everything back in one press', async () => {
    const { el, bounties, fixture } = await render();
    bounties.ready.set(2);
    fixture.detectChanges();

    click(el, '.collect-all');
    fixture.detectChanges();

    expect(bounties.collectAll).toHaveBeenCalledOnce();
    expect(el.querySelector('.notice')?.textContent).toContain('Collected 2 missions');
  });

  it('disables the collect-all when nothing is back, and says so', async () => {
    const { el } = await render();
    const button = el.querySelector<HTMLButtonElement>('.collect-all');

    expect(button?.disabled).toBe(true);
    expect(button?.textContent?.trim()).toBe('Nothing back yet');
  });

  it('says what a locked mission costs, in text rather than by dimming it', async () => {
    // ⚠️ `opacity` on a card dims its text with it, and `$muted` at 70% is under the 4.5:1 floor —
    // the mistake that failed AXE on the Altar in all three browsers.
    const { el, bounties, fixture } = await render();
    bounties.rows.set([row({ unlocked: false })]);
    fixture.detectChanges();

    expect(el.querySelector('.mission__state')?.textContent).toContain('Locked');
    expect(el.querySelector('.mission__action')?.textContent).toContain('15');
    expect(el.querySelector<HTMLButtonElement>('.mission__action')?.disabled).toBe(true);
  });

  it('explains an empty payout rather than showing a blank line', async () => {
    // A run that has cleared nothing earns no idle income, so a mission genuinely pays zero — and
    // "0 gold" reads as a bug where a sentence reads as an explanation.
    const { el, bounties, fixture } = await render();
    bounties.rows.set([row({ payout: [] })]);
    fixture.detectChanges();

    expect(el.querySelector('.mission__none')?.textContent).toContain('clear a stage first');
  });

  it('offers a way back to Town, named rather than called "back"', async () => {
    const { el } = await render();
    const back = el.querySelector<HTMLAnchorElement>('.head__back');

    expect(back?.getAttribute('href')).toBe('/town');
    expect(back?.textContent).toContain('Town');
  });

  it('tells a player with a full party why nobody is available', async () => {
    const { el, bounties, fixture } = await render();
    bounties.available.set([]);
    click(el, '.mission__action');
    fixture.detectChanges();

    expect(el.querySelector('.picker__empty')?.textContent).toContain('fighting or already out');
  });

  it('survives a build that ships no missions', async () => {
    const { el, bounties, fixture } = await render();
    bounties.rows.set([]);
    fixture.detectChanges();

    expect(el.querySelector('.mission--empty')).not.toBeNull();
  });
});
