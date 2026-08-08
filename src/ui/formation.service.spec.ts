import { computed, signal } from '@angular/core';
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
  type PartyFormation,
} from '../core';
import { CHARACTERS } from '../data';
import { FormationService } from './formation.service';
import { GameLoopService } from './game-loop.service';
import { RosterService } from './roster.service';

/**
 * A stand-in for the real loop, holding the run and nothing else.
 *
 * The loop is the only Angular-shaped dependency in the chain — it owns `Preferences`, wall-clock
 * time and a `requestAnimationFrame` — and everything this file is about is the join between a
 * save, `core/activity.ts` and the rows `RosterService` derives. So the fake is the state.
 */
class FakeLoop {
  state: GameState;
  readonly snapshot;
  readonly formations;

  constructor(state: GameState) {
    this.state = state;
    this.snapshot = signal<GameState | null>(state);
    this.formations = computed(() => this.snapshot()?.formations ?? {});
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
  }
}

/** Two characters of each of the first three factions, so a lock has something to exclude. */
const CAST = pickCast();

function pickCast(): readonly { id: string; faction: string }[] {
  const byFaction = new Map<string, { id: string; faction: string }[]>();
  for (const character of CHARACTERS) {
    const held = byFaction.get(character.faction) ?? [];
    if (held.length < 2) {
      held.push({ id: character.id, faction: character.faction });
      byFaction.set(character.faction, held);
    }
  }
  return [...byFaction.values()].slice(0, 3).flat();
}

/** The faction of whoever this cast happens to lead with, so nothing here hard-codes content. */
const LOCKED_FACTION = CAST[0].faction;
const OTHER_FACTION = CAST.find((member) => member.faction !== LOCKED_FACTION)?.faction ?? '';

function own(defId: string): OwnedCharacter {
  return { defId, rarity: 0, level: 1, copies: 0, gear: {} };
}

function build(formations: Record<string, PartyFormation> = {}) {
  const base = newGame({ seed: 1, nowMs: 1_700_000_000_000 });
  const loop = new FakeLoop({
    ...base,
    wallet: { ...emptyWallet(), gold: num(1e12) },
    roster: CAST.map((member) => own(member.id)),
    formations,
  });

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [FormationService, RosterService, { provide: GameLoopService, useValue: loop }],
  });

  return { loop, formations: TestBed.inject(FormationService) };
}

/** Every id the pool is currently offering, flattened out of its faction groups. */
function eligibleIds(service: FormationService, activityId: string): readonly string[] {
  return (service.crew(activityId)?.eligible ?? []).flatMap((group) =>
    group.members.map((member) => member.defId),
  );
}

describe('FormationService', () => {
  describe('reading a crew', () => {
    it('answers null for an activity this build does not ship', () => {
      // A stale link and a hand-typed URL both land here, and the screen says so rather than
      // rendering a blank editor over an activity that does not exist.
      const { formations } = build();

      expect(formations.crew('tower:not-shipped')).toBeNull();
    });

    it('reads each activity’s own crew rather than one shared formation', () => {
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
        'tower:x': { front: [CAST[1].id], back: [] },
      });

      expect(formations.crew(CAMPAIGN_FORMATION)?.front.map((row) => row.defId)).toEqual([
        CAST[0].id,
      ]);
    });

    it('reports an empty crew as not ready, so the Fight control has something to refuse', () => {
      const { formations } = build();

      expect(formations.crew(CAMPAIGN_FORMATION)?.ready).toBe(false);
      expect(formations.crew(CAMPAIGN_FORMATION)?.size).toBe(0);
    });

    it('counts the open slots in each rank, which is what the editor draws as gaps', () => {
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
      });

      expect(formations.crew(CAMPAIGN_FORMATION)?.open).toEqual({ front: 1, back: 3 });
    });
  });

  describe('placement', () => {
    it('places into one activity without touching another', () => {
      // The tower crew is seeded rather than placed, because 15a ships one activity and `placeIn`
      // refuses an unknown one. What is under test is that a write to the campaign key spreads
      // into the book rather than replacing it — the failure that would silently disband seven
      // crews the first time a player edited the campaign five.
      //
      // ⚠️ **`tower:x` is a colon on purpose, and it is not the shipped id format.** Every real
      // activity id is hyphenated (`tower-dwarf`), so the colon marks a key this build does *not*
      // ship — which is the whole point of the keys in this file: the retention rule they cover
      // only has something to say about an activity nothing can resolve. A well-meant tidy to
      // `tower-dwarf` here would quietly turn these into tests of a *known* activity and stop
      // covering the rule entirely. Where a fixture stands in for a real tower, as in
      // `activity.spec.ts` and `formations-view.spec.ts`, the shipped format is the right one.
      const { formations, loop } = build({ 'tower:x': { front: [CAST[1].id], back: [] } });

      expect(formations.placeIn(CAMPAIGN_FORMATION, CAST[0].id, 'front').ok).toBe(true);

      expect(loop.state.formations[CAMPAIGN_FORMATION]).toEqual({
        front: [CAST[0].id],
        back: [],
      });
      expect(loop.state.formations['tower:x']).toEqual({ front: [CAST[1].id], back: [] });
    });

    it('cycles front, then back, then out of this crew alone', () => {
      const { formations, loop } = build();
      const id = CAST[0].id;

      formations.cyclePlacement(CAMPAIGN_FORMATION, id);
      expect(loop.state.formations[CAMPAIGN_FORMATION]?.front).toEqual([id]);

      formations.cyclePlacement(CAMPAIGN_FORMATION, id);
      expect(loop.state.formations[CAMPAIGN_FORMATION]?.back).toEqual([id]);

      formations.cyclePlacement(CAMPAIGN_FORMATION, id);
      expect(loop.state.formations[CAMPAIGN_FORMATION]).toEqual({ front: [], back: [] });
    });

    it('empties one crew and leaves the rest standing', () => {
      const { formations, loop } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
        'tower:x': { front: [CAST[1].id], back: [] },
      });

      expect(formations.clear(CAMPAIGN_FORMATION).ok).toBe(true);

      expect(loop.state.formations[CAMPAIGN_FORMATION]).toEqual({ front: [], back: [] });
      expect(loop.state.formations['tower:x']).toEqual({ front: [CAST[1].id], back: [] });
    });

    it('refuses a character for an activity this build does not ship', () => {
      // `allows` resolves the activity before the character, so an unknown activity is refused
      // rather than silently writing a crew nothing will ever read.
      const { formations } = build();

      expect(formations.placeIn('tower:not-shipped', CAST[0].id, 'front')).toEqual({
        ok: false,
        reason: 'wrong-faction',
      });
    });
  });

  describe('the eligible pool', () => {
    it('offers everybody not already standing', () => {
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
      });

      const offered = eligibleIds(formations, CAMPAIGN_FORMATION);
      expect(offered).not.toContain(CAST[0].id);
      expect(offered).toContain(CAST[1].id);
    });

    it('still counts a standing character towards its faction’s owned total', () => {
      // What lets a heading read "everyone you own is already standing" rather than "none owned".
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
      });

      const group = formations
        .crew(CAMPAIGN_FORMATION)
        ?.eligible.find((entry) => entry.factionId === LOCKED_FACTION);

      expect(group?.owned).toBe(2);
      expect(group?.members.map((member) => member.defId)).toEqual([CAST[1].id]);
    });
  });

  describe('the battle formation', () => {
    it('resolves the crew of the activity it is asked for', () => {
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id], back: [] },
        'tower:x': { front: [CAST[1].id, CAST[2].id], back: [] },
      });

      expect(formations.battleFormation(CAMPAIGN_FORMATION).front).toHaveLength(1);
      expect(formations.battleFormation('tower:x').front).toHaveLength(2);
    });

    it('hands an uncrewed activity through empty rather than substituting anything', () => {
      // `simulateBattle` reads a party of nobody as an immediate defeat, which is the honest
      // outcome of sending nobody — quietly substituting the campaign crew would not be.
      const { formations } = build();

      expect(formations.battleFormation('tower:x')).toEqual({ front: [], back: [] });
    });
  });

  describe('placementOf', () => {
    it('reports the rank and 1-based slot within the activity asked about', () => {
      const { formations } = build({
        [CAMPAIGN_FORMATION]: { front: [CAST[0].id, CAST[1].id], back: [CAST[2].id] },
      });

      expect(formations.placementOf(CAMPAIGN_FORMATION, CAST[1].id)).toEqual({
        row: 'front',
        slot: 2,
      });
      expect(formations.placementOf(CAMPAIGN_FORMATION, CAST[2].id)).toEqual({
        row: 'back',
        slot: 1,
      });
    });

    it('answers null for somebody standing in a different activity', () => {
      // The distinction the whole book rests on: a placement is a fact about a crew, never about
      // a character.
      const { formations } = build({ 'tower:x': { front: [CAST[0].id], back: [] } });

      expect(formations.placementOf(CAMPAIGN_FORMATION, CAST[0].id)).toBeNull();
      expect(formations.placementOf('tower:x', CAST[0].id)).toEqual({ row: 'front', slot: 1 });
    });
  });

  describe('the lineup bonus', () => {
    it('is resolved through the simulation’s own function, and follows the crew', () => {
      // A screen promising +25% and a battle awarding something else is the worst possible failure
      // for a mechanic whose entire job is to make the player rebuild their crew.
      const mono = CAST.filter((member) => member.faction === LOCKED_FACTION).map(
        (member) => member.id,
      );
      const mixed = [
        CAST[0].id,
        CAST.find((member) => member.faction === OTHER_FACTION)?.id ?? CAST[2].id,
      ];

      const sameFaction = build({ [CAMPAIGN_FORMATION]: { front: mono, back: [] } });
      const twoFactions = build({ [CAMPAIGN_FORMATION]: { front: mixed, back: [] } });

      const monoCounts = sameFaction.formations.crew(CAMPAIGN_FORMATION)?.lineup.counts ?? [];
      expect(monoCounts).toHaveLength(1);
      expect(monoCounts[0]?.count).toBe(2);
      expect(twoFactions.formations.crew(CAMPAIGN_FORMATION)?.lineup.counts).toHaveLength(2);
    });
  });
});
