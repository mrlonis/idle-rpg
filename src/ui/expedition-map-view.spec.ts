import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type GameState, newGame, startExpedition } from '../core';
import { EXPEDITION_LIST } from './content';
import { ExpeditionMapView } from './expedition-map-view';
import { GameLoopService } from './game-loop.service';

const T0 = 1_700_000_000_000;
const FORD = EXPEDITION_LIST[0];
const CAUSEWAY = EXPEDITION_LIST[1];

function opened(over: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0xe7ed1, nowMs: T0 }), clearedStages: 250, ...over };
}

/** A state with an attempt underway on the Ford. */
function underway(): GameState {
  return startExpedition(opened(), FORD, { front: ['rin'], back: [] }, {});
}

class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(opened());
  current: GameState | null = this.snapshot();
  /** The real `FormationService` reads the book through this, not through the snapshot. */
  readonly formations = () => this.snapshot()?.formations ?? {};

  apply(update: (state: GameState) => GameState): void {
    const next = update(this.current ?? opened());
    this.current = next;
    this.snapshot.set(next);
  }

  persist(): Promise<void> {
    return Promise.resolve();
  }
}

async function render(mapId: string, state: GameState = opened()) {
  const game = new FakeGameLoop();
  game.snapshot.set(state);
  game.current = state;

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [ExpeditionMapView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ExpeditionMapView);
  fixture.componentRef.setInput('mapId', mapId);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { game, fixture, el: fixture.nativeElement as HTMLElement };
}

describe('ExpeditionMapView', () => {
  it('draws one button per camp, each naming itself, its cost and its level', async () => {
    const { el } = await render(FORD.id, underway());
    const camps = [...el.querySelectorAll<HTMLButtonElement>('.tile--camp')];

    expect(camps).toHaveLength(FORD.camps.length);
    const labels = camps.map((tile) => tile.getAttribute('aria-label') ?? '');
    for (const camp of FORD.camps) {
      const label = labels.find((entry) => entry.includes(camp.name));
      expect(label, camp.cell).toBeDefined();
      expect(label).toContain(`${camp.stamina} stamina`);
    }
    // The boss wears its kind in the label, not only in a colour.
    expect(labels.some((entry) => entry.startsWith('Boss camp'))).toBe(true);
  });

  it('names its own map as the crew editor’s origin, so its back link returns here', async () => {
    // Without `from` the link still works and the editor quietly falls back to the formations
    // index — a screen this trip never visited. The parameter is the half that fails silently,
    // and it has to carry the map id: every map shares one crew, but the player left from a
    // particular map and goes back to it.
    const { el } = await render(FORD.id);

    expect(el.querySelector('.party__link')?.getAttribute('href')).toBe(
      `/formations/expedition?from=expedition:${FORD.id}`,
    );
  });

  it('keeps the stamina budget on screen as a real progressbar while an attempt runs', async () => {
    const idle = await render(FORD.id);
    expect(idle.el.querySelector('.budget__bar')).toBeNull();

    const { el } = await render(FORD.id, underway());
    const bar = el.querySelector('.budget__bar');
    expect(bar?.getAttribute('role')).toBe('progressbar');
    expect(bar?.getAttribute('aria-valuenow')).toBe(String(FORD.stamina));
  });

  it('inspects a camp on tap and fights only from the detail panel', async () => {
    const { el, fixture } = await render(FORD.id, underway());
    expect(el.querySelector('.detail')).toBeNull();

    const camp = [...el.querySelectorAll<HTMLButtonElement>('.tile--camp')].find((tile) =>
      tile.getAttribute('aria-label')?.includes('Mirewatch Pickets'),
    );
    camp?.click();
    fixture.detectChanges();

    const detail = el.querySelector('.detail');
    expect(detail?.textContent).toContain('Mirewatch Pickets');
    expect(detail?.querySelector('.act__go')?.textContent).toContain('Fight — 2 stamina');
  });

  it('explains a camp that cannot be fought instead of offering a dead control', async () => {
    const { el, fixture } = await render(FORD.id, underway());
    const boss = [...el.querySelectorAll<HTMLButtonElement>('.tile--camp')].find((tile) =>
      tile.getAttribute('aria-label')?.startsWith('Boss camp'),
    );
    boss?.click();
    fixture.detectChanges();

    const detail = el.querySelector('.detail');
    expect(detail?.querySelector('.act__go')).toBeNull();
    expect(detail?.textContent).toContain('Out of reach');
  });

  it('resets the selected camp when the route moves to another map', async () => {
    // ⚠️ The rule in `AGENTS.md`: the router keeps the same component instance when only the
    // parameter changes, so per-screen state must be a `linkedSignal` keyed on it. This drives the
    // parameter exactly as the router does; a plain `signal` here leaves the first map's camp
    // selected on the second map's screen.
    const { el, fixture } = await render(FORD.id, underway());
    const camp = el.querySelector<HTMLButtonElement>('.tile--camp');
    camp?.click();
    fixture.detectChanges();
    expect(el.querySelector('.detail')).not.toBeNull();

    fixture.componentRef.setInput('mapId', CAUSEWAY.id);
    fixture.detectChanges();
    expect(el.querySelector('.detail')).toBeNull();

    fixture.componentRef.setInput('mapId', FORD.id);
    fixture.detectChanges();
    expect(el.querySelector('.detail')).toBeNull();
  });

  it('says why a locked map is locked rather than showing an empty board', async () => {
    const { el } = await render(CAUSEWAY.id);
    expect(el.querySelector('.grid')).toBeNull();
    expect(el.querySelector('.notice')?.textContent).toContain('Complete the map before this one');
  });

  it('walks an unknown map id to a plain sentence rather than a crash', async () => {
    const { el } = await render('never-shipped');
    expect(el.querySelector('.notice')?.textContent).toContain('not part of this build');
  });

  it('arms the abandon control on the first tap and fires on the second', async () => {
    const { el, fixture, game } = await render(FORD.id, underway());

    const abandon = [...el.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Abandon this attempt'),
    );
    abandon?.click();
    fixture.detectChanges();
    expect(game.current?.expedition).not.toBeNull();

    const confirm = [...el.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent?.trim() === 'Abandon it',
    );
    confirm?.click();
    fixture.detectChanges();
    expect(game.current?.expedition).toBeNull();
  });
});
