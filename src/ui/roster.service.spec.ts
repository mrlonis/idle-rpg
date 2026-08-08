import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  CAMPAIGN_FORMATION,
  emptyWallet,
  formationIn,
  type GameState,
  newGame,
  num,
  type OwnedCharacter,
  PARTY_SIZE,
  type PartyFormation,
  toCombatStats,
} from '../core';
import { CHARACTERS } from '../data';
import { LEVELS } from './content';
import { FormationService } from './formation.service';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/**
 * `RosterService` against the shipped content, with the game loop faked.
 *
 * The loop is the only Angular-shaped dependency here — it owns `Preferences`, wall-clock time
 * and a `requestAnimationFrame` — and everything this file is about is the join between a save
 * and `core/`. So the fake is the state and nothing else.
 *
 * **What is worth testing here rather than in `core/roster/resonance.spec.ts`** is the seam: the
 * derivation is pinned there, and what can still go wrong is a screen or a battle reading the
 * invested level when the player has been shown the carried one.
 */
class FakeLoop {
  state: GameState;
  readonly snapshot;
  readonly formations;

  constructor(state: GameState) {
    this.state = state;
    this.snapshot = signal<GameState | null>(state);
    this.formations = signal(state.formations);
  }

  get current(): GameState | null {
    return this.state;
  }

  formationFor(activity: string): PartyFormation {
    return formationIn(this.formations(), activity);
  }

  apply(update: (state: GameState) => GameState): void {
    this.state = update(this.state);
    this.snapshot.set(this.state);
    this.formations.set(this.state.formations);
  }
}

/** Six shipped characters, so a roster can exceed `PARTY_SIZE` and resonance can do something. */
const CAST = CHARACTERS.slice(0, PARTY_SIZE + 1);

/** The top rung, so a level is never quietly clamped by a cap the test was not about. */
const TOP = LEVELS.caps.length - 1;

function entry(defId: string, level: number, rarity = TOP): OwnedCharacter {
  return { defId, rarity, level, copies: 0, gear: {} };
}

function build(roster: readonly OwnedCharacter[], front: readonly string[] = []) {
  const base = newGame({ seed: 1, nowMs: 1_700_000_000_000 });
  const loop = new FakeLoop({
    ...base,
    wallet: { ...emptyWallet(), gold: num(1e18), xp: num(1e18), essence: num(1e18) },
    roster,
    formations: { [CAMPAIGN_FORMATION]: { front: [...front], back: [] } },
  });

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: GameLoopService, useValue: loop }] });

  return {
    loop,
    roster: TestBed.inject(RosterService),
    // The crew and the rows come from two services now. Both are returned so a test can keep
    // asserting the seam end to end — the failure this file exists for is a screen and a battle
    // disagreeing about a level, and that crosses exactly this boundary.
    formations: TestBed.inject(FormationService),
  };
}

/** Five anchors at `level`, plus one straggler at level 1 for resonance to carry. */
function carriedRoster(level: number) {
  return [
    ...CAST.slice(0, PARTY_SIZE).map((character) => entry(character.id, level)),
    entry(CAST[PARTY_SIZE].id, 1),
  ];
}

const STRAGGLER = CAST[PARTY_SIZE].id;

describe('RosterService and the resonance floor', () => {
  it('reports the carried level on the row, not what was paid for', () => {
    const { roster } = build(carriedRoster(60));

    const row = roster.entry(STRAGGLER);
    expect(row?.level).toBe(60);
    expect(row?.resonated).toBe(true);
  });

  it('leaves an anchor unmarked, because it is standing on its own investment', () => {
    const { roster } = build(carriedRoster(60));

    expect(roster.entry(CAST[0].id)?.resonated).toBe(false);
  });

  it('sends the carried level into battle, not the invested one', () => {
    // The failure this guards against is silent and one-sided: every screen would say 60 and the
    // fight would be resolved at level 1. Derived-not-stored only works if every reader derives.
    const carried = build(carriedRoster(60), [STRAGGLER]);
    const invested = build([entry(STRAGGLER, 1)], [STRAGGLER]);

    const lifted = toCombatStats(
      carried.formations.battleFormation(CAMPAIGN_FORMATION).front[0].stats,
    );
    const alone = toCombatStats(
      invested.formations.battleFormation(CAMPAIGN_FORMATION).front[0].stats,
    );

    expect(lifted.hp.gt(alone.hp)).toBe(true);
    expect(lifted.atk.gt(alone.atk)).toBe(true);
  });

  it('charges the next level from the floor, so a carried character never pays twice', () => {
    const { roster, loop } = build(carriedRoster(60));

    expect(roster.levelUpOnce(STRAGGLER).ok).toBe(true);
    expect(loop.state.roster.find((owned) => owned.defId === STRAGGLER)?.level).toBe(61);
  });

  it('names the five holding the floor up, and counts who is being carried', () => {
    const { roster } = build(carriedRoster(60));

    const view = roster.resonance();
    expect(view.floor).toBe(60);
    expect(view.anchors.map((row) => row.defId)).toEqual(
      CAST.slice(0, PARTY_SIZE).map((c) => c.id),
    );
    expect(view.carried).toBe(1);
  });

  it('raises the floor by one, levelling only what it takes', () => {
    const { roster, loop } = build(carriedRoster(60));

    expect(roster.resonateOnce().ok).toBe(true);
    expect(roster.resonance().floor).toBe(61);
    // The straggler was carried, not levelled — the floor moved because the anchors did.
    expect(loop.state.roster.find((owned) => owned.defId === STRAGGLER)?.level).toBe(1);
    expect(roster.entry(STRAGGLER)?.level).toBe(61);
  });

  it('carries nobody while the roster is no bigger than the party', () => {
    // Self-neutralising by construction rather than by a special case: everybody in a roster of
    // five or fewer is already at or above the floor.
    const { roster } = build(CAST.slice(0, PARTY_SIZE).map((c, i) => entry(c.id, 10 + i)));

    expect(roster.entries().every((row) => !row.resonated)).toBe(true);
    expect(roster.resonance().carried).toBe(0);
  });

  it('reports a cap stall as capped, and only a cap stall', () => {
    // `resonancePlan` returns null for two unrelated reasons — a cap nothing can climb past, and
    // a roster with nobody in it — and only the first is something an ascension fixes. A flag
    // that conflated them would put "your fifth-highest character is at its cap" on a screen
    // with no characters on it.
    const stalled = build([
      ...CAST.slice(0, PARTY_SIZE - 1).map((character) => entry(character.id, 40)),
      // `rare`, capped at 40 and already there: four can climb past it and a fifth cannot.
      entry(CAST[PARTY_SIZE - 1].id, LEVELS.caps[0], 0),
    ]);
    const nobody = build([]);

    expect(stalled.roster.resonance().capped).toBe(true);
    expect(nobody.roster.resonance().capped).toBe(false);
  });
});
