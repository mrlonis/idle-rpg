import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { emptyWallet, type FodderOption } from '../core';
import { CharacterView } from './character-view';
import { GameLoopService } from './game-loop.service';
import { type RosterEntryView, RosterService } from './roster.service';

/** One owned row. `rin` and `wren` are real ids, because the sheet resolves its own definition. */
function entry(over: Partial<RosterEntryView> = {}): RosterEntryView {
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
    levelCap: 40,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    inParty: true,
    row: 'back',
    rowSlot: 1,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 12,
    ascensionCost: null,
    fodderAvailable: 0,
    canAscend: false,
    ...over,
  };
}

/** Only the two things the sheet asks of the roster. */
class FakeRoster {
  readonly rows = signal<readonly RosterEntryView[]>([entry()]);

  entry(defId: string): RosterEntryView | null {
    return this.rows().find((row) => row.defId === defId) ?? null;
  }

  fodderFor(): readonly FodderOption[] {
    return [];
  }
}

/** Only the wallet, which is all the sheet reads off the loop. */
class FakeGameLoop {
  readonly wallet = signal(emptyWallet());
}

/**
 * Renders the sheet by **navigating** to it rather than by setting inputs.
 *
 * The whole feature under test is that the router hands `from` to the component the same way it
 * hands over `defId`, so a test that set the input directly would assert the mapping and skip the
 * binding that makes it work.
 */
async function open(url: string) {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    providers: [
      provideRouter(
        [{ path: 'roster/:defId', component: CharacterView }],
        withComponentInputBinding(),
      ),
      provideLocationMocks(),
      { provide: RosterService, useValue: new FakeRoster() },
      { provide: GameLoopService, useValue: new FakeGameLoop() },
    ],
  }).compileComponents();

  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url, CharacterView);

  const el = harness.routeNativeElement;
  if (el === null) {
    throw new Error(`Nothing rendered for ${url}`);
  }
  return el;
}

/** The header's back link, as a player sees it: where it goes and what it is called. */
function backLink(el: HTMLElement) {
  const link = el.querySelector<HTMLAnchorElement>('.head__back');
  return { href: link?.getAttribute('href'), text: link?.textContent?.trim() };
}

describe('CharacterView', () => {
  describe('the back link', () => {
    it('returns to the screen that opened the sheet', async () => {
      // Tapping a name in the party on the home screen lands here. Sending that player to the
      // roster afterwards drops them on a screen they were never on.
      const el = await open('/roster/rin?from=home');

      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Rin');
      expect(backLink(el)).toEqual({ href: '/', text: '← Home' });
    });

    it('returns to the roster when the roster opened the sheet', async () => {
      const el = await open('/roster/rin?from=roster');

      expect(backLink(el)).toEqual({ href: '/roster', text: '← Roster' });
    });

    it('still leads somewhere when the URL names no origin at all', async () => {
      // A bookmark, a reload, or a hand-typed URL. A sheet with no way out would be worse than
      // one whose way out is a guess.
      const el = await open('/roster/rin');

      expect(backLink(el)).toEqual({ href: '/roster', text: '← Roster' });
    });

    it('ignores an origin it does not recognise', async () => {
      const el = await open('/roster/rin?from=nowhere');

      expect(backLink(el)).toEqual({ href: '/roster', text: '← Roster' });
    });

    it('honours the origin even when the character is not owned', async () => {
      // The refusal notice is the only way off this screen, so it is the one that most needs to
      // lead back where the player came from.
      const el = await open('/roster/wren?from=home');

      const link = el.querySelector<HTMLAnchorElement>('.notice__link');
      expect(link?.getAttribute('href')).toBe('/');
      expect(link?.textContent?.trim()).toBe('Back to Home');
    });
  });
});
