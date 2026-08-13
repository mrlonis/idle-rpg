import { provideLocationMocks } from '@angular/common/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { type GameState, newGame } from '../core';
import { EXPEDITION_LIST } from './content';
import { ExpeditionsView } from './expeditions-view';
import { GameLoopService } from './game-loop.service';

const T0 = 1_700_000_000_000;

function opened(over: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0xe7ed1, nowMs: T0 }), clearedStages: 250, ...over };
}

class FakeGameLoop {
  readonly snapshot = signal<GameState | null>(opened());
  current: GameState | null = this.snapshot();
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

async function render(state: GameState = opened()) {
  const game = new FakeGameLoop();
  game.snapshot.set(state);
  game.current = state;

  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [ExpeditionsView],
    providers: [
      provideRouter([]),
      provideLocationMocks(),
      { provide: GameLoopService, useValue: game },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ExpeditionsView);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('ExpeditionsView', () => {
  it('lists every shipped map, and links only the ones a run may enter', async () => {
    const { el } = await render();
    const rows = [...el.querySelectorAll('.map')];

    expect(rows).toHaveLength(EXPEDITION_LIST.length);
    // The first map is open and a link; the later ones are inert rows that say why.
    expect(rows[0].querySelector('a')).not.toBeNull();
    expect(rows[1].querySelector('a')).toBeNull();
    expect(rows[1].textContent).toContain('Complete the map before it');
  });

  it('names the key rather than the door when the whole mode is locked', async () => {
    const { el } = await render(opened({ clearedStages: 20 }));

    expect(el.querySelector('.notice')?.textContent).toContain('more chapter');
    // Every row is inert below the unlock — there is nowhere to go yet.
    expect(el.querySelectorAll('.map a')).toHaveLength(0);
  });
});
