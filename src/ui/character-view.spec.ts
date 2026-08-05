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
    resonated: false,
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

  /** Re-points the fake at a different rung, which is what the skill list keys off. */
  at(over: Partial<RosterEntryView>): void {
    this.rows.set([entry(over)]);
  }

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
async function open(url: string, roster: FakeRoster = new FakeRoster()) {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    providers: [
      provideRouter(
        [{ path: 'roster/:defId', component: CharacterView }],
        withComponentInputBinding(),
      ),
      provideLocationMocks(),
      { provide: RosterService, useValue: roster },
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

  describe('the skill list', () => {
    /** Every skill row, as a player reads it: the name, and whether it says it is locked. */
    const rows = (el: HTMLElement) =>
      [...el.querySelectorAll<HTMLElement>('.skills__row')].map((row) => ({
        name: row.querySelector('.skills__name')?.textContent?.trim(),
        locked: row.classList.contains('skills__row--locked'),
        meta: row.querySelector('.skills__meta')?.textContent?.replace(/\s+/gu, ' ').trim(),
        ariaDisabled: row.getAttribute('aria-disabled'),
      }));

    it('shows the locked half of the kit rather than hiding it', async () => {
      // Rin is common tier: her ultimate from the start, her second skill at Elite. Hiding the
      // locked row would make a rung's reward invisible until after it had been paid for.
      const el = await open('/roster/rin');

      expect(rows(el)).toHaveLength(2);
      expect(rows(el)[0].locked).toBe(false);
      expect(rows(el)[1].locked).toBe(true);
    });

    it('names the rung that unlocks a locked skill, in words rather than only in colour', async () => {
      const el = await open('/roster/rin');

      expect(rows(el)[1].meta).toBe('Locked · unlocks at Elite');
    });

    it('marks a locked row disabled for assistive tech, and only a locked one', async () => {
      // The programmatic half of the lock, so it does not depend on the dimming being perceived
      // or on the styling staying as it is. `aria-disabled` rather than `disabled` because a list
      // row is not a control — valid on a `listitem` because ARIA 1.2 made it a global attribute,
      // which is what lets the AXE suite pass with it.
      const el = await open('/roster/rin');

      expect(rows(el).map((row) => row.ariaDisabled)).toEqual([null, 'true']);
    });

    it('opens the whole kit once the character reaches the rung', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 2, rarityLabel: 'Elite', rarityFamily: 'elite' });
      const el = await open('/roster/rin', roster);

      expect(rows(el).every((row) => !row.locked)).toBe(true);
      expect(rows(el).every((row) => row.ariaDisabled === null)).toBe(true);
      expect(rows(el)[1].meta).toContain('cooldown');
    });

    it('says how many skills the tier holds, so two is legible as complete', async () => {
      // Without it a two-skill common-tier character looks like a four-skill character the player
      // has failed to invest in.
      const el = await open('/roster/rin');

      expect(el.textContent).toContain('2 skills at common tier');
    });
  });

  describe('the ascension card', () => {
    /** The unlock line, whitespace collapsed the way a reader sees it. */
    const unlockLine = (el: HTMLElement) =>
      el.querySelector('.ascend__unlock')?.textContent?.replace(/\s+/gu, ' ').trim();

    it('says the rung being bought unlocks a skill when it actually does', async () => {
      // The price is already shown in copies; this is the other half of the trade. The one rung
      // that unlocks a skill should not look like the four that do not.
      const roster = new FakeRoster();
      roster.at({ rarity: 1, ascensionCost: { self: 2, faction: 0 } });
      const el = await open('/roster/rin', roster);

      expect(unlockLine(el)).toBe('This rung unlocks Snare Arrow');
    });

    it('does not sell a skill the rung being bought will not hand over', async () => {
      // Rin at Rare is two rungs below Elite. This card sits directly above "next rung costs", so
      // a distant unlock phrased as an imminent one is a player paying for something they do not
      // get — which is the one thing this line must never do.
      const roster = new FakeRoster();
      roster.at({ rarity: 0, ascensionCost: { self: 2, faction: 0 } });
      const el = await open('/roster/rin', roster);

      expect(unlockLine(el)).toBe('Snare Arrow unlocks later, at Elite');
    });

    it('promises nothing once the kit is fully unlocked', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 2, ascensionCost: { self: 1, faction: 0 } });
      const el = await open('/roster/rin', roster);

      expect(el.querySelector('.ascend__unlock')).toBeNull();
    });
  });

  describe('the level card', () => {
    it('explains a level nobody paid for', async () => {
      // Without this, a character the player has spent nothing on simply shows 40 and the whole
      // mechanic is invisible on the one screen where they are deciding what to spend next.
      const roster = new FakeRoster();
      roster.at({ resonated: true, level: 40 });
      const el = await open('/roster/rin', roster);

      const note = el.querySelector('.level__resonance')?.textContent?.replace(/\s+/gu, ' ').trim();
      expect(note).toContain('Carried here by resonance');
      expect(note).toContain('charged from 40');
    });

    it('does not promise a discount a capped character cannot collect', async () => {
      // The flag above already says the only move left is an ascension, so a sentence about what
      // the next level would cost is a promise this character cannot take up.
      const roster = new FakeRoster();
      roster.at({ resonated: true, level: 40, atLevelCap: true });
      const el = await open('/roster/rin', roster);

      const note = el.querySelector('.level__resonance')?.textContent?.replace(/\s+/gu, ' ').trim();
      expect(note).toContain('Carried here by resonance');
      expect(note).not.toContain('charged from');
    });

    it('stays quiet for a character levelled the ordinary way', async () => {
      // The common case should not be asked to read an explanation of a mechanic that is not
      // affecting it.
      const el = await open('/roster/rin');

      expect(el.querySelector('.level__resonance')).toBeNull();
    });
  });
});
