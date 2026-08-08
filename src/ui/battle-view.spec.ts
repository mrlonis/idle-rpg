import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import {
  type ActiveStatus,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  num,
  type Numeric,
  ZERO,
} from '../core';
import { BattleView } from './battle-view';
import { type BattleCombatantView, BattleService, type StageHeading } from './battle.service';
import { GameLoopService } from './game-loop.service';

/**
 * The battle log is the entire textual account of a fight, and the only one a screen reader
 * gets — the HP bars beside it are `aria-hidden`, because the numbers above them already say
 * the same thing. So a line that reads badly is not a cosmetic problem here; it is the whole
 * interface for anybody not watching the bars move.
 *
 * Asserted against the rendered DOM rather than by exporting the narrator, for the same reason
 * `home-view.spec.ts` does: what matters is what a player ends up reading, and a spec that
 * called a private function directly would keep passing if the template stopped using it.
 */

/** A stand-in for the animator. The component only ever reads; it never drives a fight. */
class FakeBattles {
  readonly playbackSpeed = signal<1 | 2 | 4>(1);
  readonly stage = signal<StageHeading | null>({
    activity: 'campaign',
    kind: 'campaign',
    where: '1-7',
    name: 'Marsh Shrine',
    place: 'Chapter 1 · The Sunken Fen',
    label: '1-7 — Marsh Shrine',
    level: 14,
  });
  readonly result = signal<BattleResult | null>(null);
  readonly outcome = signal<BattleOutcome | null>(null);
  readonly isFighting = signal(false);
  readonly recentEvents = signal<readonly BattleEvent[]>([]);
  readonly names = signal<ReadonlyMap<string, string>>(
    new Map([
      ['ally-0', 'Bran'],
      ['ally-1', 'Wren'],
      ['enemy-0', 'Bog Hag'],
    ]),
  );
  /**
   * The fight the Go Again control names, which follows the **session's activity** rather than the
   * campaign — a tower session's control has to name the next floor. `null` at the top of a tower,
   * which is the one case where there is nothing to go again to.
   */
  readonly nextInSession = signal<StageHeading | null>({
    activity: 'campaign',
    kind: 'campaign',
    where: '1-8',
    name: 'Hagfen',
    place: 'Chapter 1 · The Sunken Fen',
    label: '1-8 — Hagfen',
    level: 15,
  });
  readonly partyFront = signal<readonly BattleCombatantView[]>([]);
  readonly partyBack = signal<readonly BattleCombatantView[]>([]);
  readonly foesFront = signal<readonly BattleCombatantView[]>([]);
  readonly foesBack = signal<readonly BattleCombatantView[]>([]);
  readonly isAuto = signal(false);
  readonly isAutoUnlocked = signal(false);
  /** Which activity the session is on, so Go Again can return to the right crew editor. */
  readonly activity = signal('campaign');

  /**
   * Recorded rather than left empty, so a test that meant to assert a control did nothing can
   * tell that apart from a control that was never wired up.
   */
  readonly calls: string[] = [];

  fight(nowMs: number): void {
    this.calls.push(`fight:${nowMs}`);
  }

  close(): void {
    this.calls.push('close');
  }

  setSpeed(speed: number): void {
    this.calls.push(`speed:${speed}`);
  }

  setAuto(on: boolean, nowMs: number): void {
    this.calls.push(`auto:${on}:${nowMs}`);
  }
}

class FakeGameLoop {
  readonly goldPerSec = signal(num(0));
}

/** Records where the screen navigated, without standing up a real router outlet. */
class FakeRouter {
  readonly navigated: unknown[][] = [];

  navigate(commands: unknown[]): Promise<boolean> {
    this.navigated.push(commands);
    return Promise.resolve(true);
  }
}

/**
 * The settled screen, with its two action controls on it.
 *
 * `render` above returns log lines and nothing else, which is all every other test here wants.
 * This returns the component's surroundings so the actions can be pressed.
 */
async function renderSettled(activity = 'campaign') {
  const battles = new FakeBattles();
  battles.activity.set(activity);
  battles.outcome.set('victory');
  const router = new FakeRouter();

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [BattleView],
    providers: [
      { provide: BattleService, useValue: battles },
      { provide: GameLoopService, useValue: new FakeGameLoop() },
      { provide: Router, useValue: router },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(BattleView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { battles, router, el: fixture.nativeElement as HTMLElement };
}

async function render(events: readonly BattleEvent[]): Promise<readonly string[]> {
  const battles = new FakeBattles();
  battles.recentEvents.set(events);

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [BattleView],
    providers: [
      { provide: BattleService, useValue: battles },
      { provide: GameLoopService, useValue: new FakeGameLoop() },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(BattleView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  const el = fixture.nativeElement as HTMLElement;
  return [...el.querySelectorAll('.log__line')].map((line) => line.textContent?.trim() ?? '');
}

/** A cleanse that removed `removed.length` hostile statuses from Wren. */
function cleanse(removed: readonly string[]): BattleEvent {
  return { kind: 'cleanse', tick: 40, source: 'ally-0', target: 'ally-1', removed };
}

function attack(damage: Numeric, absorbed: Numeric, crit = false): BattleEvent {
  return {
    kind: 'attack',
    tick: 10,
    source: 'ally-0',
    target: 'enemy-0',
    damageType: 'physical',
    damage,
    absorbed,
    crit,
    targetHp: num(500),
    sourceEnergy: 10,
    targetEnergy: 10,
  };
}

const WEAKENED: ActiveStatus = {
  id: 'weaken',
  name: 'Weakened',
  kind: 'stat-mod',
  hostile: true,
  expiresAt: 85,
  stat: 'atk',
  multiplier: 0.75,
};

describe('the battle log', () => {
  describe('a cleanse', () => {
    it('says what it counted, so the number is not left to be guessed at', async () => {
      // "Wren cleanses 2 from Bran" leaves a reader choosing between effects, targets and
      // stacks. The count is only useful attached to the noun it counts.
      expect(await render([cleanse(['weaken', 'slow'])])).toEqual([
        'Bran cleanses 2 effects from Wren',
      ]);
    });

    it('reads as singular when it removed exactly one', async () => {
      expect(await render([cleanse(['weaken'])])).toEqual(['Bran cleanses 1 effect from Wren']);
    });

    it('says nothing at all when it removed nothing', async () => {
      // The simulation emits the event whether or not anything came off, because the skill was
      // still cast and the cooldown still started. A line reporting zero would be noise.
      expect(await render([cleanse([])])).toEqual([]);
    });
  });

  describe('an attack', () => {
    it('names the damage that landed', async () => {
      expect(await render([attack(num(120), ZERO)])).toEqual(['Bran hits Bog Hag for 120']);
    });

    it('calls out a critical hit', async () => {
      expect(await render([attack(num(240), ZERO, true)])).toEqual([
        'Bran lands a critical hit on Bog Hag for 240',
      ]);
    });

    it('reports what a shield swallowed, so a shielder does not look like it did nothing', async () => {
      expect(await render([attack(num(20), num(100))])).toEqual([
        'Bran hits Bog Hag for 20 (100 absorbed)',
      ]);
    });
  });

  it('distinguishes a self-drain from healing somebody else', async () => {
    const drain: BattleEvent = {
      kind: 'heal',
      tick: 20,
      source: 'ally-0',
      target: 'ally-0',
      amount: num(30),
      targetHp: num(900),
      sourceEnergy: 0,
    };
    const heal: BattleEvent = { ...drain, target: 'ally-1', sourceEnergy: 10 };

    expect(await render([drain, heal])).toEqual(['Bran drains 30', 'Bran heals Wren for 30']);
  });

  it('narrates a status landing, being resisted, and wearing off', async () => {
    const landed: BattleEvent = {
      kind: 'status',
      tick: 40,
      source: 'enemy-0',
      target: 'ally-1',
      status: WEAKENED,
    };
    const resisted: BattleEvent = {
      kind: 'status-resisted',
      tick: 45,
      source: 'enemy-0',
      target: 'ally-0',
      statusId: 'weaken',
      statusName: 'Weakened',
    };
    const expired: BattleEvent = {
      kind: 'status-expired',
      tick: 85,
      target: 'ally-1',
      statusId: 'weaken',
      statusName: 'Weakened',
    };

    expect(await render([landed, resisted, expired])).toEqual([
      'Wren is Weakened',
      'Bran resists Weakened',
      'Wren is no longer Weakened',
    ]);
  });

  it('explains a stun in terms of what it cost, not just that it happened', async () => {
    // A stun consumes its victim's turn rather than freezing it out of the schedule, and the
    // line says so — otherwise a player watching the board sees a combatant simply skipped.
    expect(await render([{ kind: 'stunned', tick: 50, combatant: 'ally-0' }])).toEqual([
      'Bran is stunned and loses a turn',
    ]);
  });

  it('falls back to the raw key for a combatant it cannot name', async () => {
    // Rather than rendering "undefined". The names map comes off the opening line-up, so this
    // only happens if the two ever disagree — at which point a readable key beats a crash.
    const orphan: BattleEvent = { kind: 'defeat', tick: 60, combatant: 'enemy-9' };

    expect(await render([orphan])).toEqual(['enemy-9 is defeated']);
  });

  it('drops the events that would be noise or a spoiler', async () => {
    // Turn markers drive the board's highlight and would drown the log — a fight is far more
    // turns than it is interesting moments. The closing event has its own announced line, and
    // repeating it here would mean a screen reader hears the outcome twice.
    const turn: BattleEvent = { kind: 'turn', tick: 10, combatant: 'ally-0', energy: 40 };
    const end: BattleEvent = { kind: 'end', tick: 90, outcome: 'victory' };

    expect(await render([turn, end])).toEqual([]);
  });
});

describe('going again from the results screen', () => {
  it('closes the board and returns to the crew editor rather than fighting straight away', async () => {
    // ⚠️ It called `fight()` directly until milestone 15a, which skipped the pre-battle step every
    // other route through the game takes — one silent exception to "the crew is confirmed before
    // every battle". A player who wants the fast loop has auto-battle, which is the one thing
    // meant to skip it.
    const { battles, router, el } = await renderSettled();

    el.querySelector<HTMLButtonElement>('.actions__fight')?.click();

    expect(battles.calls).toContain('close');
    expect(battles.calls.some((call) => call.startsWith('fight:'))).toBe(false);
    expect(router.navigated).toEqual([['/prepare', 'campaign']]);
  });

  it('returns to the activity the session was on, never the campaign by default', async () => {
    // The bug this guards is invisible today and certain once towers ship: a tower session whose
    // Go Again dropped the player into the campaign's crew editor, and then into a campaign fight.
    const { router, el } = await renderSettled('tower:dwarf');

    el.querySelector<HTMLButtonElement>('.actions__fight')?.click();

    expect(router.navigated).toEqual([['/prepare', 'tower:dwarf']]);
  });
});
