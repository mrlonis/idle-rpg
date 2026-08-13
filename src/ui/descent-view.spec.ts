import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type PartyFormation } from '../core';
import { BattleService } from './battle.service';
import { DescentView } from './descent-view';
import { DescentService, type DescentCardView, type DescentFightView } from './descent.service';
import { type CrewView, FormationService } from './formation.service';

/** A lineup paying nothing, which is what this screen never reads anyway. */
const EMPTY_BONUS = {
  attack: 0,
  health: 0,
  defence: 0,
  critChance: 0,
  critDamageAmp: 0,
  haste: 0,
  injuredEnergyRegen: 0,
};

function member(defId: string, name: string) {
  return { defId, name } as unknown as CrewView['front'][number];
}

function crew(over: Partial<CrewView> = {}): CrewView {
  return {
    activity: { id: 'descent', name: 'The Descent', kind: 'descent' },
    front: [member('bran', 'Bran'), member('mira', 'Mira')],
    back: [member('rin', 'Rin')],
    size: 3,
    open: { front: 0, back: 2 },
    lineup: { bonus: EMPTY_BONUS, tier: null, counts: [], rallyCount: 0, ladderCount: 0 },
    eligible: [],
    lockFactions: ['human', 'elf', 'demon'],
    away: [],
    ready: true,
    ...over,
  };
}

function fight(over: Partial<DescentFightView> = {}): DescentFightView {
  return {
    index: 1,
    floor: 1,
    step: 1,
    kind: 'normal',
    name: 'The Threshold',
    level: 40,
    summons: 120,
    cleared: false,
    current: true,
    ...over,
  };
}

/** Nine fights across three floors, with `cleared` of them behind the run. */
function ladder(cleared: number): readonly DescentFightView[] {
  return Array.from({ length: 9 }, (_, offset) => {
    const index = offset + 1;
    return fight({
      index,
      floor: Math.floor(offset / 3) + 1,
      step: (offset % 3) + 1,
      kind: index === 9 ? 'boss' : index % 3 === 0 ? 'mini-boss' : 'normal',
      name: `Board ${index}`,
      level: 40 + index,
      cleared: index <= cleared,
      current: index === cleared + 1,
    });
  });
}

function card(id: string, over: Partial<DescentCardView> = {}): DescentCardView {
  return {
    id,
    name: `Grand ${id}`,
    description: 'Does a thing.',
    rank: 2,
    rankName: 'Grand',
    faction: null,
    effects: ['+20% attack'],
    ...over,
  };
}

/** Everything the screen asks of the mode, and nothing that reaches a clock or a seed. */
class FakeDescent {
  readonly phase = signal<'locked' | 'available' | 'choosing' | 'ready' | 'complete' | 'ended'>(
    'available',
  );
  readonly chaptersNeeded = signal(0);
  readonly lock = signal<readonly string[]>(['human', 'elf', 'demon']);
  readonly livesLeft = signal(2);
  readonly runsFinished = signal(7);
  readonly held = signal<readonly DescentCardView[]>([]);
  readonly offer = signal<readonly DescentCardView[]>([]);
  readonly fightRows = signal<readonly DescentFightView[]>(ladder(0));
  readonly party = signal<PartyFormation | null>(null);
  readonly openingMap = signal<ReadonlyMap<string, { health: number; energy: number }>>(new Map());
  readonly lives = 2;
  readonly fights = 9;
  readonly started: PartyFormation[] = [];
  readonly taken: string[] = [];

  opening() {
    return this.openingMap();
  }

  start(party: PartyFormation): boolean {
    this.started.push(party);
    return true;
  }

  take(cardId: string): void {
    this.taken.push(cardId);
  }
}

class FakeFormations {
  readonly descent = signal<CrewView | null>(crew());

  crew(activityId: string): CrewView | null {
    return activityId === 'descent' ? this.descent() : null;
  }
}

class FakeBattles {
  readonly fought: string[] = [];

  fight(_nowMs: number, activity: string): void {
    this.fought.push(activity);
  }
}

async function render(configure?: (descent: FakeDescent, formations: FakeFormations) => void) {
  const descent = new FakeDescent();
  const formations = new FakeFormations();
  const battles = new FakeBattles();
  configure?.(descent, formations);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [DescentView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: DescentService, useValue: descent },
      { provide: FormationService, useValue: formations },
      { provide: BattleService, useValue: battles },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DescentView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { descent, formations, battles, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('DescentView', () => {
  describe('before the mode has opened', () => {
    it('names the chapters still owed rather than only refusing', async () => {
      // ⚠️ The rule Home's locked tower row is spent on: optional content a player cannot yet reach
      // should still say what reaches it.
      const { el } = await render((descent) => {
        descent.phase.set('locked');
        descent.chaptersNeeded.set(2);
      });

      expect(el.textContent).toContain('2 more chapters');
      expect(el.querySelector('.act__go')).toBeNull();
    });

    it('shows no map, no lock and no party while it is locked', async () => {
      const { el } = await render((descent) => descent.phase.set('locked'));

      expect(el.querySelector('.map')).toBeNull();
      expect(el.querySelector('.lock')).toBeNull();
      expect(el.querySelector('.party')).toBeNull();
    });
  });

  describe("today's road", () => {
    it("spells out the day's factions", async () => {
      const { el } = await render();

      expect(el.querySelector('.lock__factions')?.textContent).toContain('and');
    });

    it('draws every fight, including the ones still ahead', async () => {
      // The shape of the run is what a player decides against when they take a card, and a level
      // eight fights away is the reason to take the bigger one now.
      const { el } = await render();

      expect(el.querySelectorAll('.fight')).toHaveLength(9);
      expect(el.querySelectorAll('.floor')).toHaveLength(3);
    });

    it('marks the fights already behind the run and the one in front of it', async () => {
      const { el } = await render((descent) => descent.fightRows.set(ladder(4)));

      expect(el.querySelectorAll('.fight--cleared')).toHaveLength(4);
      expect(el.querySelectorAll('.fight--current')).toHaveLength(1);
      expect(el.querySelector('.fight--current .fight__name')?.textContent).toContain('Board 5');
    });

    it('marks a floor guardian as a heavier fight', async () => {
      const { el } = await render();

      // Fights 3, 6 and 9 — the fight that closes each floor.
      expect(el.querySelectorAll('.fight--guardian')).toHaveLength(3);
    });
  });

  describe('the party', () => {
    it('shows the crew at full health before a run has started', async () => {
      const { el } = await render();

      expect(el.querySelectorAll('.party__member')).toHaveLength(3);
      expect(el.querySelector('.party__health')?.textContent).toContain('100%');
    });

    it('shows the run s own party once one exists, with the damage it is carrying', async () => {
      // ⚠️ **Reads the run rather than the formation book.** A run copies its crew at the moment it
      // starts and the fallen leave that copy, so the book would go on reporting three for a party
      // that is down to two.
      const { el } = await render((descent) => {
        descent.phase.set('ready');
        descent.party.set({ front: ['bran'], back: ['rin'] });
        descent.openingMap.set(
          new Map([
            ['bran', { health: 0.42, energy: 0 }],
            ['rin', { health: 1, energy: 0 }],
          ]),
        );
      });

      const rows = [...el.querySelectorAll('.party__member')];
      expect(rows).toHaveLength(2);
      expect(rows[0].textContent).toContain('42%');
    });

    it('gives every health bar an accessible value, not only a width', async () => {
      const { el } = await render((descent) => {
        descent.phase.set('ready');
        descent.party.set({ front: ['bran'], back: [] });
        descent.openingMap.set(new Map([['bran', { health: 0.5, energy: 0 }]]));
      });

      const bar = el.querySelector('.party__bar');
      expect(bar?.getAttribute('role')).toBe('progressbar');
      expect(bar?.getAttribute('aria-valuenow')).toBe('50');
      expect(bar?.getAttribute('aria-valuetext')).toBe('50% health');
    });

    it('shows the attempts left only once a run is under way', async () => {
      const before = await render();
      expect(before.el.querySelector('.party__lives')).toBeNull();

      const during = await render((descent) => descent.phase.set('ready'));
      expect(during.el.querySelector('.party__lives')?.textContent).toContain('2');
    });
  });

  describe('starting a run', () => {
    it('sends the crew as it currently stands', async () => {
      const { el, descent } = await render();

      el.querySelector<HTMLButtonElement>('.act__go')?.click();

      expect(descent.started).toEqual([{ front: ['bran', 'mira'], back: ['rin'] }]);
    });

    it('refuses and says why when the day s lock forbids the crew', async () => {
      const { el, descent } = await render((_descent, formations) => {
        formations.descent.set(crew({ ready: false }));
      });

      expect(el.querySelector<HTMLButtonElement>('.act__go')?.disabled).toBe(true);
      expect(el.querySelector('.hint')?.textContent).toContain('Today only');

      el.querySelector<HTMLButtonElement>('.act__go')?.click();
      expect(descent.started).toEqual([]);
    });

    it('names the empty crew before it names the lock', async () => {
      const { el } = await render((_descent, formations) => {
        formations.descent.set(crew({ size: 0, front: [], back: [], ready: false }));
      });

      expect(el.querySelector('.hint')?.textContent).toContain('Choose a crew');
    });
  });

  describe('taking a card', () => {
    it('offers three, each as one tappable card', async () => {
      // A button rather than a row with a button in it: the whole card is the target, which on a
      // phone is the difference between a comfortable tap and a strip at the end of a line.
      const { el } = await render((descent) => {
        descent.phase.set('choosing');
        descent.offer.set([card('a'), card('b'), card('c')]);
      });

      expect(el.querySelectorAll('.offer .card')).toHaveLength(3);
    });

    it('takes the one that was tapped', async () => {
      const { el, descent } = await render((service) => {
        service.phase.set('choosing');
        service.offer.set([card('a'), card('b'), card('c')]);
      });

      el.querySelectorAll<HTMLButtonElement>('.offer .card')[1].click();

      expect(descent.taken).toEqual(['b']);
    });

    it('says that the two left behind are gone', async () => {
      const { el } = await render((descent) => {
        descent.phase.set('choosing');
        descent.offer.set([card('a')]);
      });

      expect(el.textContent).toContain('are gone for this run');
    });

    it('names the faction a narrow card pays', async () => {
      const { el } = await render((descent) => {
        descent.phase.set('choosing');
        descent.offer.set([card('a', { faction: 'elf' })]);
      });

      expect(el.querySelector('.card__faction')?.textContent).toContain('only');
    });

    it('lists what the run is already carrying', async () => {
      const { el } = await render((descent) => {
        descent.held.set([card('a'), card('b')]);
      });

      expect(el.querySelectorAll('.hand__card')).toHaveLength(2);
    });

    it('hides the hand while the run is carrying nothing', async () => {
      const { el } = await render();

      expect(el.querySelector('.hand')).toBeNull();
    });
  });

  describe('fighting', () => {
    it('names the fight it is about to enter', async () => {
      const { el } = await render((descent) => {
        descent.phase.set('ready');
        descent.fightRows.set(ladder(3));
      });

      expect(el.querySelector('.act__go')?.textContent).toContain('Fight 4 of 9');
      expect(el.querySelector('.act__go')?.textContent).toContain('Board 4');
    });

    it('enters the Descent rather than whatever was last fought', async () => {
      const { el, battles, fixture } = await render((descent) => descent.phase.set('ready'));

      // Navigates home first — the battle screen is a mode rather than a route, so it replaces
      // whatever is beneath it, and leaving `/descent` underneath would drop the player back onto
      // this screen mid-animation.
      el.querySelector<HTMLButtonElement>('.act__go')?.click();
      await fixture.whenStable();

      expect(battles.fought).toEqual(['descent']);
    });

    it('says that auto-battle does not run down here', async () => {
      // ⚠️ The mode's premise rather than a limitation: a Descent fight cannot be repeated without a
      // card being chosen first, so a repeat loop would win one fight and then lie about why it
      // stopped.
      const { el } = await render((descent) => descent.phase.set('ready'));

      expect(el.textContent).toContain('Auto-battle is off');
    });
  });

  describe('a run that is over', () => {
    it('says a finished run is finished and when the next one opens', async () => {
      const { el } = await render((descent) => descent.phase.set('complete'));

      expect(el.textContent).toContain('04:00 UTC');
      expect(el.querySelector('.act__go')).toBeNull();
    });

    it('promises nothing was lost when the lives ran out', async () => {
      // Every fight paid as it was cleared, so a run that ended has already banked what it did.
      const { el } = await render((descent) => descent.phase.set('ended'));

      expect(el.textContent).toContain('already been paid');
    });
  });

  describe('accessibility', () => {
    it('names the screen with a single top-level heading', async () => {
      const { el } = await render();

      expect(el.querySelectorAll('h1')).toHaveLength(1);
    });

    it('labels every section with its own heading', async () => {
      const { el } = await render();

      for (const section of el.querySelectorAll('section')) {
        const id = section.getAttribute('aria-labelledby');
        expect(id, section.className).toBeTruthy();
        expect(el.querySelector(`#${id}`), section.className).not.toBeNull();
      }
    });
  });
});
