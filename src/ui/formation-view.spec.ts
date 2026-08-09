import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { CAMPAIGN_FORMATION, type RosterResult } from '../core';
import { BattleService, type StageHeading } from './battle.service';
import { FormationView } from './formation-view';
import { type CrewView, FormationService } from './formation.service';
import { type RosterEntryView } from './roster.service';
import { TowerService, type TowerView } from './tower.service';

/** A lineup paying nothing, which is what most of these crews earn. */
const NO_BONUS = {
  attack: 0,
  health: 0,
  defence: 0,
  critChance: 0,
  critDamageAmp: 0,
  haste: 0,
  injuredEnergyRegen: 0,
};

/** One roster row, with only what a test cares about overridden. */
function row(over: Partial<RosterEntryView> = {}): RosterEntryView {
  return {
    defId: 'rin',
    name: 'Rin',
    faction: 'elf',
    factionName: 'Elves',
    tier: 'common',
    role: 'ranger',
    rarity: 0,
    rarityLabel: 'Rare',
    rarityFamily: 'rare',
    level: 12,
    resonated: false,
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    crews: [],
    crewed: false,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 12,
    ascensionCost: null,
    canAscend: false,
    ...over,
  };
}

function crew(over: Partial<CrewView> = {}): CrewView {
  return {
    activity: { id: CAMPAIGN_FORMATION, name: 'Campaign', kind: 'campaign' },
    front: [],
    back: [],
    size: 0,
    open: { front: 2, back: 3 },
    lineup: { bonus: NO_BONUS, tier: null, counts: [], rallyCount: 0, ladderCount: 0 },
    eligible: [{ factionId: 'elf', label: 'Elves', members: [row()], owned: 1 }],
    lockFaction: null,
    away: [],
    ready: false,
    ...over,
  };
}

/**
 * A stand-in for the real service.
 *
 * The component's job is presentation: decide what each row says, what the next tap does, and
 * whether the Fight control is live. Driving the real service would pull in the game loop,
 * `Preferences` and wall-clock time, and would end up testing `core/` rather than the template.
 */
class FakeFormations {
  readonly view = signal<CrewView | null>(crew());
  readonly cycled: string[] = [];
  readonly cleared: string[] = [];
  /** Where each id is standing, for `placementOf`. Empty means "in the pool". */
  placements: Readonly<Record<string, { row: 'front' | 'back'; slot: number }>> = {};

  crew(): CrewView | null {
    return this.view();
  }

  placementOf(_activityId: string, defId: string) {
    return this.placements[defId] ?? null;
  }

  cyclePlacement(_activityId: string, defId: string): RosterResult {
    this.cycled.push(defId);
    return { ok: false, reason: 'row-full' };
  }

  clear(activityId: string): RosterResult {
    this.cleared.push(activityId);
    return { ok: false, reason: 'not-owned' };
  }
}

class FakeBattles {
  readonly fought: { at: number; activity: string }[] = [];

  /**
   * Whether the activity has a fight behind it, which the Fight control asks about separately from
   * the crew.
   *
   * `null` is a real answer rather than an error — a tower the campaign has not opened, and a tower
   * already topped, are both activities with a legal crew and nothing to fight.
   */
  readonly next = signal<StageHeading | null>({
    activity: CAMPAIGN_FORMATION,
    kind: 'campaign',
    where: '1-1',
    name: 'Mossy Hollow',
    place: 'Chapter 1 · The Sunken Fen',
    label: '1-1 — Mossy Hollow',
    level: 1,
  });

  fight(nowMs: number, activity: string): void {
    this.fought.push({ at: nowMs, activity });
  }

  nextFight(): StageHeading | null {
    return this.next();
  }
}

/** Only the tower states, which is all the crew editor asks about the climb. */
class FakeTowers {
  readonly tower = signal<TowerView | null>(null);

  view(): TowerView | null {
    return this.tower();
  }
}

async function render(
  configure?: (formations: FakeFormations, battles: FakeBattles, towers: FakeTowers) => void,
  inputs: { activityId?: string; prepare?: boolean } = {},
) {
  const formations = new FakeFormations();
  const battles = new FakeBattles();
  const towers = new FakeTowers();
  configure?.(formations, battles, towers);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [FormationView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: FormationService, useValue: formations },
      { provide: BattleService, useValue: battles },
      { provide: TowerService, useValue: towers },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FormationView);
  fixture.componentRef.setInput('activityId', inputs.activityId ?? CAMPAIGN_FORMATION);
  fixture.componentRef.setInput('prepare', inputs.prepare ?? false);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { formations, battles, towers, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('FormationView', () => {
  describe('an activity this build does not ship', () => {
    it('says so rather than rendering a blank editor', async () => {
      // A stale link or a hand-typed URL. The character sheet makes the same call for an unknown
      // character id: a screen that explains itself beats one that silently shows nothing.
      const { el } = await render((formations) => formations.view.set(null));

      expect(el.querySelector('h1')?.textContent?.trim()).toBe('No such activity');
      expect(el.querySelector('.empty')?.textContent).toContain('later version');
    });
  });

  describe('the two modes', () => {
    it('titles itself after the activity when arranging a crew', async () => {
      const { el } = await render();

      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Campaign');
      expect(el.querySelector('.head__back')?.getAttribute('href')).toBe('/formations');
    });

    it('shows no Fight control off the pre-battle route', async () => {
      // ⚠️ `prepare` is route data rather than a query parameter precisely so this cannot be
      // forged: a second entry point into the battle path is exactly what routing every fight
      // through one screen was meant to prevent.
      const { el } = await render();

      expect(el.querySelector('.button--primary')).toBeNull();
    });

    it('titles itself for the fight and offers the control when preparing', async () => {
      const { el } = await render(
        (formations) => formations.view.set(crew({ size: 1, ready: true })),
        { prepare: true },
      );

      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Before you fight');
      expect(el.querySelector('.head__back')?.getAttribute('href')).toBe('/');
      expect(el.querySelector<HTMLButtonElement>('.button--primary')?.disabled).toBe(false);
    });
  });

  describe('the Fight control', () => {
    it('starts the fight for this activity, stamped with the current time', async () => {
      // ⚠️ Awaited, because the control **navigates home first**. This screen is a route and the
      // battle view swaps in over the outlet, so leaving `/prepare/…` underneath would drop the
      // player back on a crew editor the moment the fight ended. The fight therefore starts in the
      // navigation's continuation, not in the click handler.
      const before = Date.now();
      const { el, fixture, battles } = await render(
        (formations) => formations.view.set(crew({ size: 1, ready: true })),
        { prepare: true },
      );

      el.querySelector<HTMLButtonElement>('.button--primary')?.click();
      await fixture.whenStable();

      expect(battles.fought).toHaveLength(1);
      expect(battles.fought[0].activity).toBe(CAMPAIGN_FORMATION);
      expect(battles.fought[0].at).toBeGreaterThanOrEqual(before);
    });

    it('is disabled with nobody standing, and says what is missing', async () => {
      const { el, battles } = await render(undefined, { prepare: true });

      expect(el.querySelector<HTMLButtonElement>('.button--primary')?.disabled).toBe(true);
      expect(el.querySelector('.formation__blocked')?.textContent).toContain(
        'Place at least one character',
      );
      expect(battles.fought).toEqual([]);
    });

    /**
     * The second question the control has to ask, which arrived with towers.
     *
     * ⚠️ **A legal crew and a fight behind it are independent.** A tower the campaign has not opened,
     * and a tower already topped, are both activities with five perfectly good characters standing in
     * them and nothing to send them at — and `BattleService.fight` refuses both. A control that asked
     * only about the crew would look live and do nothing.
     */
    describe('when there is nothing to fight', () => {
      const tower = (over: Partial<TowerView> = {}): TowerView => ({
        tower: {
          id: 'tower-human',
          name: 'Human Tower',
          faction: 'human',
          unlockClears: 12,
          floors: [],
        },
        status: 'climbing',
        cleared: 0,
        floors: 100,
        next: 1,
        clearsNeeded: 0,
        level: 1,
        fraction: 0,
        ...over,
      });

      it('refuses a tower the campaign has not opened, and names the key', async () => {
        const { el, battles } = await render(
          (formations, animator, towers) => {
            formations.view.set(crew({ size: 5, ready: true }));
            animator.next.set(null);
            towers.tower.set(tower({ status: 'locked', next: null, clearsNeeded: 4 }));
          },
          { prepare: true, activityId: 'tower-human' },
        );

        expect(el.querySelector<HTMLButtonElement>('.button--primary')?.disabled).toBe(true);
        expect(el.querySelector('.formation__blocked')?.textContent).toContain(
          'cleared 4 more campaign stages',
        );
        expect(battles.fought).toEqual([]);
      });

      it('refuses a tower already topped, and says a floor is climbed once', async () => {
        const { el } = await render(
          (formations, animator, towers) => {
            formations.view.set(crew({ size: 5, ready: true }));
            animator.next.set(null);
            towers.tower.set(tower({ status: 'topped', cleared: 100, next: null, fraction: 1 }));
          },
          { prepare: true, activityId: 'tower-human' },
        );

        expect(el.querySelector<HTMLButtonElement>('.button--primary')?.disabled).toBe(true);
        expect(el.querySelector('.formation__blocked')?.textContent).toContain('all 100 floors');
        expect(el.querySelector('.formation__blocked')?.textContent).toContain('climbed once');
      });

      it('puts a crew problem first, because that is the one a player can fix', async () => {
        // An away crew member and a finished tower can both be true. Naming the tower first would
        // tell the player nothing they can act on.
        const { el } = await render(
          (formations, animator, towers) => {
            formations.view.set(crew({ front: [row()], size: 1, away: ['rin'] }));
            animator.next.set(null);
            towers.tower.set(tower({ status: 'topped', next: null }));
          },
          { prepare: true, activityId: 'tower-human' },
        );

        expect(el.querySelector('.formation__blocked')?.textContent).toContain('away on a bounty');
      });
    });
  });

  describe('the crew', () => {
    it('draws an empty slot for every place still open', async () => {
      const { el } = await render((formations) =>
        formations.view.set(crew({ front: [row()], size: 1, open: { front: 1, back: 3 } })),
      );

      expect(el.querySelectorAll('.slot--filled')).toHaveLength(1);
      expect(el.querySelectorAll('.slot--empty')).toHaveLength(4);
    });

    it('reports a crew member who is away rather than fighting one short', async () => {
      // Only reachable from a hand-edited save — `setFormation` refuses to place anybody away.
      // Silently fielding four is the failure that reads as the game losing a character.
      const { el } = await render((formations) =>
        formations.view.set(crew({ front: [row()], size: 1, away: ['rin'] })),
      );

      expect(el.querySelector('.notice--error')?.textContent).toContain('away on a bounty');
    });
  });

  describe('the faction lock', () => {
    it('says nothing about a lock the campaign does not have', async () => {
      const { el } = await render();

      expect(el.querySelector('.head__lock')).toBeNull();
    });

    it('names the faction a locked activity admits, so an empty pool reads as a rule', async () => {
      // Without this line the filtered pool below reads as a bug: most of the roster is simply
      // missing, and nothing on the screen would explain why.
      const { el } = await render((formations) =>
        formations.view.set(
          crew({
            activity: { id: 'tower-dwarf', name: 'The Deep Hold', kind: 'tower', faction: 'dwarf' },
            lockFaction: 'dwarf',
          }),
        ),
      );

      expect(el.querySelector('.head__lock')?.textContent).toContain('Dwarves');
    });
  });

  describe('the pool', () => {
    it('spells the action and the character into the control’s accessible name', async () => {
      // The visible label ("To front") repeats down the whole list, so it cannot be the accessible
      // name on its own.
      const { el } = await render();

      const button = el.querySelector('.roster__toggle');
      expect(button?.querySelector('.visually-hidden')?.textContent).toBe(
        'Place Rin in the front row',
      );
    });

    it('offers the back row once the front is full', async () => {
      const { el } = await render((formations) =>
        formations.view.set(crew({ open: { front: 0, back: 2 } })),
      );

      expect(el.querySelector('.roster__toggle')?.textContent).toContain('To back');
    });

    it('cycles the character it names when tapped', async () => {
      const { el, formations } = await render();

      el.querySelector<HTMLButtonElement>('.roster__toggle')?.click();

      expect(formations.cycled).toEqual(['rin']);
    });

    it('distinguishes a faction with nobody left to add from one you own none of', async () => {
      // The two look identical on screen and mean opposite things: one is a reason to summon, the
      // other is a reason to look at the crew above.
      const { el } = await render((formations) =>
        formations.view.set(
          crew({
            eligible: [
              { factionId: 'elf', label: 'Elves', members: [], owned: 2 },
              { factionId: 'dwarf', label: 'Dwarves', members: [], owned: 0 },
            ],
          }),
        ),
      );

      const empties = [...el.querySelectorAll('.group__empty')].map((n) => n.textContent?.trim());
      expect(empties).toEqual(['Everyone you own is already standing.', 'None owned yet.']);
    });

    it('says how many other crews a character is already standing in', async () => {
      // The whole point of eight crews is that one character can serve several, so the question
      // this row answers is "am I about to pull somebody out of somewhere".
      const { el } = await render((formations) =>
        formations.view.set(
          crew({
            eligible: [
              {
                factionId: 'elf',
                label: 'Elves',
                members: [row({ crews: ['tower:a', 'tower:b'], crewed: true })],
                owned: 1,
              },
            ],
          }),
        ),
      );

      expect(el.querySelector('.roster__crews')?.textContent?.trim()).toBe('in 2 other crews');
    });
  });

  describe('clearing a crew', () => {
    it('is disabled when there is nobody to remove', async () => {
      const { el } = await render();

      expect(el.querySelector<HTMLButtonElement>('.button--quiet')?.disabled).toBe(true);
    });

    it('clears this activity alone', async () => {
      const { el, formations } = await render((service) =>
        service.view.set(crew({ front: [row()], size: 1 })),
      );

      el.querySelector<HTMLButtonElement>('.button--quiet')?.click();

      expect(formations.cleared).toEqual([CAMPAIGN_FORMATION]);
    });
  });

  describe('a refused change', () => {
    it('says why rather than leaving a control that appears to do nothing', async () => {
      const { el, fixture } = await render();

      el.querySelector<HTMLButtonElement>('.roster__toggle')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(el.querySelector('.notice--error')?.textContent).toContain('Both rows are full');
    });

    it('does not carry onto the next crew this screen is pointed at', async () => {
      // ⚠️ This component serves two parameterised routes — `/formations/:activityId` and
      // `/prepare/:activityId` — and Angular's default reuse strategy keeps the **same instance**
      // when only the parameter changes. So a refusal earned arranging one crew survives onto the
      // next, where it is a statement about a crew the player is no longer looking at.
      //
      // Driven with `setInput` rather than a router harness because that is precisely what the
      // router does to a reused component, with none of the navigation in the way.
      const { el, fixture } = await render();

      el.querySelector<HTMLButtonElement>('.roster__toggle')?.click();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(el.querySelector('.notice--error')).not.toBeNull();

      fixture.componentRef.setInput('activityId', 'tower-human');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(el.querySelector('.notice--error')).toBeNull();
    });
  });
});
