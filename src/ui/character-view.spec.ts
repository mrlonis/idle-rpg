import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { type AutoEquipResult, emptyWallet, GEAR_SLOTS, num, type SignatureResult } from '../core';
import { CharacterView } from './character-view';
import { GameLoopService } from './game-loop.service';
import { type GearBonusView, GearService, type GearSlotView } from './gear.service';
import { type RosterEntryView, RosterService } from './roster.service';
import { SignatureService, type SignatureView } from './signature.service';

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
    rarityLabel: 'Common',
    rarityFamily: 'common',
    level: 12,
    resonated: false,
    levelCap: 20,
    atLevelCap: false,
    isMaxRarity: false,
    copies: 0,
    crews: ['campaign'],
    crewed: true,
    nextLevelCost: null,
    canLevel: false,
    affordableLevel: 12,
    ascensionCost: null,
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
}

/**
 * The wallet, plus a snapshot the signature panel's `computed` reads to stay live.
 *
 * `snapshot` returns `null` rather than a state: nothing on this sheet reads a field off it — the
 * panel's own data comes from {@link FakeSignature} — and it is touched only so the panel
 * recomputes when emblems are spent.
 */
class FakeGameLoop {
  readonly wallet = signal(emptyWallet());

  snapshot(): null {
    return null;
  }
}

/**
 * The signature panel's seam, faked for the reason `GearService` is: the real one reaches for the
 * shipped roster and the authored items, and the sheet's job is to render what it is handed.
 *
 * `null` by default, which is the common case — forty-two of the forty-nine characters have no
 * signature item — and the case in which the panel must not be drawn at all.
 */
class FakeSignature {
  readonly panel = signal<SignatureView | null>(null);
  readonly held = signal(num(0));

  /** Which character ids `levelUp` was called for, so the wiring itself is assertable. */
  readonly levelCalls: string[] = [];

  /** What the next `levelUp` reports back. Set per test. */
  levelResult: SignatureResult = { ok: false, reason: 'insufficient' };

  view(): SignatureView | null {
    return this.panel();
  }

  levelUp(defId: string): SignatureResult {
    this.levelCalls.push(defId);
    return this.levelResult;
  }
}

/** A signature panel view, unlocked and mid-climb unless overridden. */
function signatureView(over: Partial<SignatureView> = {}): SignatureView {
  return {
    defId: 'rin',
    characterName: 'Rin',
    item: {
      id: 'test-item',
      defId: 'rin',
      name: 'Test Signature',
      description: 'A test signature item.',
      perLevel: { atk: 0.05 },
      tiers: [],
    },
    locked: false,
    unlocksAt: 'Mythic',
    level: 12,
    maxLevel: 30,
    atMax: false,
    bonuses: [{ stat: 'atk', label: 'Attack', percent: 60 }],
    nextBonuses: [{ stat: 'atk', label: 'Attack', percent: 65 }],
    tier: { name: 'Second Rung', description: 'Does a second thing.', at: 10 },
    nextTier: { name: 'Third Rung', description: 'Does a third thing.', at: 20 },
    cost: 28,
    held: num(500),
    canBuy: true,
    ...over,
  };
}

/**
 * The gear panel's seam, faked for the same reason `RosterService` is: the real one reaches for
 * the shipped roster and the whole grade ladder, and the sheet's job is to render what it is
 * handed rather than to resolve it.
 *
 * Empty slots by default. Every test here is about the level card, the skill list or the back
 * link, and the gear panel's own behaviour belongs with the gear screen.
 */
class FakeGear {
  readonly slotViews = signal<readonly GearSlotView[]>(
    GEAR_SLOTS.map((slot) => ({ slot, label: slot, item: null, options: [] })),
  );

  /** What the next `autoEquip` reports back. Set per test. */
  autoEquipResult: AutoEquipResult = { ok: true, state: {} as never, equipped: 0 };

  /** Which character ids `autoEquip` was called for, so the wiring itself is assertable. */
  readonly autoEquipCalls: string[] = [];

  slots(): readonly GearSlotView[] {
    return this.slotViews();
  }

  bonusFor(): readonly GearBonusView[] {
    return [];
  }

  autoEquip(defId: string): AutoEquipResult {
    this.autoEquipCalls.push(defId);
    return this.autoEquipResult;
  }
}

/**
 * Renders the sheet by **navigating** to it rather than by setting inputs.
 *
 * The whole feature under test is that the router hands `from` to the component the same way it
 * hands over `defId`, so a test that set the input directly would assert the mapping and skip the
 * binding that makes it work.
 */
async function open(
  url: string,
  roster: FakeRoster = new FakeRoster(),
  gear: FakeGear = new FakeGear(),
  signatures: FakeSignature = new FakeSignature(),
) {
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
      { provide: GearService, useValue: gear },
      { provide: SignatureService, useValue: signatures },
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
      roster.at({ rarity: 4, rarityLabel: 'Elite', rarityFamily: 'elite' });
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
      roster.at({ rarity: 3, ascensionCost: 6 });
      const el = await open('/roster/rin', roster);

      expect(unlockLine(el)).toBe('This rung unlocks Snare Arrow');
    });

    it('does not sell a skill the rung being bought will not hand over', async () => {
      // Rin at Rare is two rungs below Elite. This card sits directly above "next rung costs", so
      // a distant unlock phrased as an imminent one is a player paying for something they do not
      // get — which is the one thing this line must never do.
      const roster = new FakeRoster();
      roster.at({ rarity: 2, ascensionCost: 2 });
      const el = await open('/roster/rin', roster);

      expect(unlockLine(el)).toBe('Snare Arrow unlocks later, at Elite');
    });

    it('promises nothing once the kit is fully unlocked', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 4, ascensionCost: 1 });
      const el = await open('/roster/rin', roster);

      expect(el.querySelector('.ascend__unlock')).toBeNull();
    });

    it('explains the rung without offering to buy it — the Altar is the only place that does', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 2, ascensionCost: 2, copies: 9, canAscend: true });
      const el = await open('/roster/rin', roster);

      // The panel still quotes the price. What it no longer carries is a control that spends it.
      expect(el.querySelector('.ascend__costs')).not.toBeNull();
      expect(
        [...el.querySelectorAll('button')].map((button) => button.textContent?.trim()),
      ).not.toContain('Ascend to next rarity');
    });

    it('links to this character’s row at the Altar, so the price has a way to be paid', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 2, ascensionCost: 2, copies: 9, canAscend: true });
      const el = await open('/roster/rin', roster);

      const link = el.querySelector<HTMLAnchorElement>('.ascend__link');
      expect(link?.getAttribute('href')).toBe('/town/altar?focus=rin');
      expect(link?.textContent?.trim()).toBe('Ascend at the Altar →');
    });

    it('still points at the Altar when the rung cannot be paid yet, but does not promise it', async () => {
      const roster = new FakeRoster();
      roster.at({ rarity: 2, ascensionCost: 6, copies: 1, canAscend: false });
      const el = await open('/roster/rin', roster);

      const link = el.querySelector<HTMLAnchorElement>('.ascend__link');
      expect(link?.textContent?.trim()).toBe('See Rin at the Altar →');
      expect(link?.classList.contains('ascend__link--ready')).toBe(false);
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

  describe('auto-equip', () => {
    const button = (el: HTMLElement) =>
      [...el.querySelectorAll<HTMLButtonElement>('.actions--gear .button')].find((node) =>
        node.textContent?.includes('Auto-equip'),
      );

    const note = (el: HTMLElement) =>
      el.querySelector('[role="status"]')?.textContent?.replace(/\s+/gu, ' ').trim();

    it('equips from the bag for the character whose sheet is open', async () => {
      const gear = new FakeGear();
      gear.autoEquipResult = { ok: true, state: {} as never, equipped: 4 };
      const el = await open('/roster/rin', new FakeRoster(), gear);

      button(el)?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(gear.autoEquipCalls).toEqual(['rin']);
    });

    it('says how many pieces moved rather than leaving the rows to imply it', async () => {
      const gear = new FakeGear();
      gear.autoEquipResult = { ok: true, state: {} as never, equipped: 4 };
      const el = await open('/roster/rin', new FakeRoster(), gear);

      button(el)?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(note(el)).toBe('Equipped 4 pieces from your bag.');
    });

    it('singularises a one-piece result', async () => {
      const gear = new FakeGear();
      gear.autoEquipResult = { ok: true, state: {} as never, equipped: 1 };
      const el = await open('/roster/rin', new FakeRoster(), gear);

      button(el)?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(note(el)).toBe('Equipped 1 piece from your bag.');
    });

    it('explains a press that changed nothing, including why', async () => {
      // ⚠️ The outcome that most needs saying. The button is enabled either way, so a press that
      // moves no row is otherwise indistinguishable from a button that does not work — and the
      // reason it moved nothing is usually that the best piece is on somebody else, which is a
      // deliberate limit rather than a bug the player should go hunting for.
      const gear = new FakeGear();
      gear.autoEquipResult = { ok: true, state: {} as never, equipped: 0 };
      const el = await open('/roster/rin', new FakeRoster(), gear);

      button(el)?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(note(el)).toContain('Already wearing the best spare gear');
      expect(note(el)).toContain('worn by other characters are left where they are');
    });

    it('reports a refusal in words rather than doing nothing', async () => {
      const gear = new FakeGear();
      gear.autoEquipResult = { ok: false, reason: 'not-owned' };
      const el = await open('/roster/rin', new FakeRoster(), gear);

      button(el)?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(el.querySelector('.notice--error')?.textContent?.trim()).toBe(
        'You do not own this character.',
      );
    });
  });
});

describe('the signature item panel', () => {
  /** The panel's own section, or `null` when the sheet drew none. */
  function panel(el: HTMLElement): HTMLElement | null {
    return el.querySelector<HTMLElement>('[aria-labelledby="signature-label"]');
  }

  it('draws nothing at all for a character with no signature item', async () => {
    // ⚠️ Absent is not the same as locked. Forty-two of the forty-nine characters will never have
    // one, and a permanently empty section reads as content that is missing rather than as a rule.
    const el = await open('/roster/rin');

    expect(panel(el)).toBeNull();
  });

  it('names the rung that unlocks it while locked, rather than showing an empty slot', async () => {
    // A locked panel is a destination — the same job the locked tower row on Home does. Showing a
    // slot with nothing in it and no explanation is the version that reads as broken.
    const signatures = new FakeSignature();
    signatures.panel.set(
      signatureView({ locked: true, level: 0, bonuses: [], tier: null, cost: 10 }),
    );

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    const text = panel(el)?.textContent ?? '';

    expect(text).toContain('Test Signature');
    expect(text).toContain('Mythic');
  });

  it('shows the level, the bonuses and the ability in force once unlocked', async () => {
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    const text = panel(el)?.textContent ?? '';

    expect(text).toContain('12 / 30');
    expect(text).toContain('Attack');
    expect(text).toContain('+60%');
    expect(text).toContain('Second Rung');
  });

  it('names the level at which the ability next gets stronger', async () => {
    // "What do the next ten levels buy" is the question somebody levelling this is actually
    // asking, and a bare level counter does not answer it.
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    const text = panel(el)?.textContent ?? '';

    expect(text).toContain('Third Rung');
    expect(text).toContain('20');
  });

  it('quotes the price in emblems', async () => {
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);

    expect(panel(el)?.textContent).toContain('28 emblems');
  });

  it('offers exactly one control, and never a buy-as-far-as-I-can-afford', async () => {
    // ⚠️ Load-bearing rather than cosmetic. Emblems are shared across every ascended-tier
    // character, so spending them *is* the decision the currency exists to create — a control that
    // resolved it greedily would make it for the player. Unlike a character level, which competes
    // with nobody, and unlike `ascendAll`, whose copies are spendable on one character.
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    const buttons = panel(el)?.querySelectorAll('button') ?? [];

    expect(buttons.length).toBe(1);
  });

  it('levels the character the sheet is showing', async () => {
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());
    signatures.levelResult = { ok: true, state: {} as never };

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    panel(el)?.querySelector('button')?.click();

    expect(signatures.levelCalls).toEqual(['rin']);
  });

  it('disables the control when the next level is unaffordable', async () => {
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView({ canBuy: false }));

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);

    expect(panel(el)?.querySelector('button')?.disabled).toBe(true);
  });

  it('reports a refusal in words rather than doing nothing', async () => {
    // The whole reason `levelSignature` returns a reason instead of a bare boolean: a button that
    // silently does nothing is the failure the result type exists to prevent.
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());
    signatures.levelResult = { ok: false, reason: 'insufficient' };

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);
    panel(el)?.querySelector('button')?.click();
    // A macrotask rather than a microtask: the app is zoneless, so the signal write from the click
    // handler is flushed by the scheduler rather than by awaiting a resolved promise. Every other
    // post-click assertion in this file waits the same way.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(el.textContent).toContain('Not enough emblems');
  });

  it('offers no control at all once the item is maxed', async () => {
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView({ atMax: true, level: 30, cost: null, nextTier: null }));

    const el = await open('/roster/rin', new FakeRoster(), new FakeGear(), signatures);

    expect(panel(el)?.querySelector('button')).toBeNull();
    expect(panel(el)?.textContent).toContain('Fully levelled');
  });
});

describe('state that belongs to one sheet', () => {
  /**
   * Navigating straight from one character's sheet to another's.
   *
   * ⚠️ Angular's default reuse strategy keeps the **same component instance** when only a route
   * parameter changes, so `defId` updates and every component-local signal survives. That is the
   * whole of what these tests are about.
   */
  async function openTwo(first: string, second: string, signatures: FakeSignature) {
    const roster = new FakeRoster();
    roster.rows.set([entry({ defId: 'rin' }), entry({ defId: 'wren', name: 'Wren of the Ninth' })]);

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
        { provide: GearService, useValue: new FakeGear() },
        { provide: SignatureService, useValue: signatures },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const before = await harness.navigateByUrl(first, CharacterView);
    return { harness, before };
  }

  it('does not carry a refusal message onto the next character opened', async () => {
    // The reported bug: a refusal earned on Rin's sheet is a statement about Rin, and showing it
    // above Wren's stats is the component telling the player something untrue about a character
    // they have only just opened.
    const signatures = new FakeSignature();
    signatures.panel.set(signatureView());
    signatures.levelResult = { ok: false, reason: 'insufficient' };

    const { harness } = await openTwo('/roster/rin', '/roster/wren', signatures);
    harness.routeNativeElement
      ?.querySelector<HTMLButtonElement>('[aria-labelledby="signature-label"] button')
      ?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(harness.routeNativeElement?.textContent).toContain('Not enough emblems');

    await harness.navigateByUrl('/roster/wren', CharacterView);

    expect(harness.routeNativeElement?.textContent).not.toContain('Not enough emblems');
  });

  it('closes an open gear slot rather than opening the next sheet mid-picker', async () => {
    const signatures = new FakeSignature();
    const { harness } = await openTwo('/roster/rin', '/roster/wren', signatures);

    harness.routeNativeElement?.querySelector<HTMLButtonElement>('.slot__row')?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(harness.routeNativeElement?.querySelector('.picker')).not.toBeNull();

    await harness.navigateByUrl('/roster/wren', CharacterView);

    expect(harness.routeNativeElement?.querySelector('.picker')).toBeNull();
  });
});
