import { computed, inject, Service, signal } from '@angular/core';
import {
  abandonExpedition,
  applyExpeditionResult,
  type AuthoredCurrencies,
  cardOffer,
  chaptersCleared,
  type CombatantOpening,
  completeExpedition,
  type DescentBonus,
  descentBonus,
  type DescentCard,
  descentCards,
  type ExpeditionBattleOutcome,
  type ExpeditionCampData,
  expeditionCardsOwed,
  expeditionExitOpen,
  expeditionLevel,
  expeditionLump,
  type ExpeditionMapData,
  expeditionMapOpen,
  expeditionRecordFor,
  type ExpeditionRecord,
  type ExpeditionRun,
  expeditionsCompleted,
  expeditionStaminaLeft,
  expeditionStaminaSpent,
  expeditionStatus,
  type ExpeditionStatus,
  fightableExpeditionCamps,
  type GameState,
  isExpeditionUnlocked,
  matchedStageIndex,
  nextExpeditionCamp,
  type PartyFormation,
  type PartyOpening,
  resolveExpeditionCamp,
  type StageData,
  stagePayout,
  startExpedition,
  takeExpeditionCard,
} from '../core';
import {
  CAMPAIGN_LEVELS,
  characterById,
  DESCENT_CARDS,
  EXPEDITION,
  EXPEDITION_LIST,
  EXPEDITION_MAP_BY_ID,
  GEAR,
  GEAR_ALIGNMENTS,
  LADDER,
  STAGE_REWARD_CURVE,
} from './content';
import { cardView, type DescentCardView } from './descent.service';
import { GameLoopService } from './game-loop.service';

/**
 * Expeditions' read model and its five actions: start, fight, take a card, complete, walk away.
 *
 * ## Almost none of this is stored, same as the Descent
 *
 * The reachable region, the fightable camps, the stamina spent, the exit's state and the three
 * cards on offer are all pure functions of the map and what the attempt has taken — the offer is
 * keyed on the map, the attempt number and the cards already held, so force-quitting hands back
 * the identical three cards while a fresh attempt genuinely redraws.
 *
 * ## The offer is filtered by the crew, not by a lock
 *
 * This mode has no faction lock, so the dead-card leak the Descent plugged with its daily lock is
 * plugged here from the other side: the card draw is handed the factions the attempt's crew
 * actually fields, and a faction family nobody standing can wear is never offered. The filter
 * shrinks as members fall, which is the honest reading — a Wyrdsong offered to a run whose last
 * Elf is down is a dead card again.
 */

/** One map, as the Expeditions index draws it. */
export interface ExpeditionMapRow {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: 'locked' | 'open' | 'underway' | 'completed';
  /** `3 of 4 camps · 2 of 3 chests` — the permanent ledger, not the attempt. */
  readonly progress: string;
}

/** One tile, as the map screen draws it. */
export interface ExpeditionTileView {
  readonly kind: 'wall' | 'path' | 'start' | 'exit' | 'camp' | 'chest';
  /** The camp letter or chest digit, where the kind carries one. */
  readonly cell: string;
  /** Whether the tile sits inside the region the run can walk. */
  readonly reachable: boolean;
  /** Camp only. */
  readonly camp?: {
    readonly name: string;
    readonly stamina: number;
    readonly level: number;
    readonly boss: boolean;
    readonly cleared: boolean;
    /** Standing, beside the region, and affordable — the tile is a button exactly when true. */
    readonly fightable: boolean;
  };
  /** Chest only. */
  readonly chest?: {
    readonly name: string;
    /** Paid in an earlier attempt or this one — the ledger's answer, not the attempt's. */
    readonly taken: boolean;
  };
  /** Exit only: whether it is open to walk. */
  readonly exitOpen?: boolean;
}

@Service()
export class ExpeditionService {
  private readonly game = inject(GameLoopService);

  /** The three shipped maps, in unlock order. */
  readonly maps = EXPEDITION_LIST;

  /**
   * The camp the next Fight control will enter, by cell.
   *
   * Set by the map screen just before it hands off to `BattleService`, and validated against the
   * authoritative run in {@link target} — so a stale value from another map or a spent camp
   * resolves to nothing rather than to the wrong fight.
   */
  private readonly queued = signal<string | null>(null);

  /** Whole campaign chapters finished, which is what opens the mode. */
  private readonly chapters = computed(
    () => chaptersCleared(LADDER, this.game.snapshot()?.clearedStages ?? 0).total,
  );

  readonly isUnlocked = computed(() => isExpeditionUnlocked(EXPEDITION, this.chapters()));

  /** Chapters still to finish before the mode opens. Zero once open. */
  readonly chaptersNeeded = computed(() =>
    Math.max(EXPEDITION.unlockChapters - this.chapters(), 0),
  );

  /** The attempt in flight, or `null`. At most one, across all maps. */
  readonly run = computed<ExpeditionRun | null>(() => this.game.snapshot()?.expedition ?? null);

  /** Maps completed, ever. */
  readonly completed = computed(() => {
    const state = this.game.snapshot();
    return state === null ? 0 : expeditionsCompleted(state);
  });

  /** The index screen's rows. */
  readonly mapRows = computed<readonly ExpeditionMapRow[]>(() => {
    const state = this.game.snapshot();
    const run = this.run();
    return this.maps.map((map) => {
      const record: ExpeditionRecord | null =
        state === null ? null : expeditionRecordFor(state, map.id);
      const open = state !== null && expeditionMapOpen(this.maps, state, map.id);
      const status: ExpeditionMapRow['status'] =
        run?.mapId === map.id
          ? 'underway'
          : record?.completed === true
            ? 'completed'
            : open && this.isUnlocked()
              ? 'open'
              : 'locked';
      return {
        id: map.id,
        name: map.name,
        description: map.description,
        status,
        progress: `${record?.camps.length ?? 0} of ${map.camps.length} camps · ${record?.chests.length ?? 0} of ${map.chests.length} chests`,
      };
    });
  });

  /** The shipped map `mapId` names, or `null`. */
  mapById(mapId: string): ExpeditionMapData | null {
    return EXPEDITION_MAP_BY_ID.get(mapId) ?? null;
  }

  /** Whether `mapId` may be entered — the mode open, and every earlier map completed. */
  mapOpen(mapId: string): boolean {
    const state = this.game.snapshot();
    return state !== null && this.isUnlocked() && expeditionMapOpen(this.maps, state, mapId);
  }

  /** What `mapId` remembers forever. */
  recordFor(mapId: string): ExpeditionRecord | null {
    const state = this.game.snapshot();
    return state === null ? null : expeditionRecordFor(state, mapId);
  }

  /** The attempt in flight on `mapId`, or `null` — including when the attempt is elsewhere. */
  runOn(mapId: string): ExpeditionRun | null {
    const run = this.run();
    return run !== null && run.mapId === mapId ? run : null;
  }

  /** Where the attempt on `mapId` stands, or `null` when there is none. */
  statusOn(mapId: string): ExpeditionStatus | null {
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    return map === null || run === null ? null : expeditionStatus(map, run);
  }

  staminaSpent(mapId: string): number {
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    return map === null || run === null ? 0 : expeditionStaminaSpent(map, run);
  }

  staminaLeft(mapId: string): number {
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    return map === null ? 0 : run === null ? map.stamina : expeditionStaminaLeft(map, run);
  }

  /** Whether the exit is open to walk. */
  exitOpen(mapId: string): boolean {
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    return map !== null && run !== null && expeditionExitOpen(map, run);
  }

  /** The camps that may be fought right now. */
  fightable(mapId: string): readonly ExpeditionCampData[] {
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    return map === null || run === null ? [] : fightableExpeditionCamps(map, run);
  }

  /**
   * The grid, resolved for drawing: one row per grid row, one view per tile.
   *
   * Everything a tile says — cleared, fightable, taken, open — is derived here once rather than
   * queried per tile by the template, because the template draws up to a hundred and forty of them
   * at 6Hz.
   */
  tiles(mapId: string): readonly (readonly ExpeditionTileView[])[] {
    const map = this.mapById(mapId);
    if (map === null) {
      return [];
    }
    const state = this.game.snapshot();
    const run = this.runOn(mapId);
    const record = state === null ? null : expeditionRecordFor(state, mapId);
    const cleared = new Set(run?.camps ?? []);
    const fightable = new Set(
      (run === null ? [] : fightableExpeditionCamps(map, run)).map((camp) => camp.cell),
    );
    const anchor = this.anchor();
    const exitOpen = run !== null && expeditionExitOpen(map, run);
    const campByCell = new Map(map.camps.map((camp) => [camp.cell, camp]));
    const chestByCell = new Map(map.chests.map((chest) => [chest.cell, chest]));

    // The reachable region, for styling walked ground apart from ground not yet won. Recomputed
    // with the same BFS the rules use, so the drawing cannot disagree with the game.
    const reached = new Set<string>();
    {
      const grid = map.grid;
      const open = (row: number, col: number): boolean => {
        const char = grid[row]?.[col] ?? '#';
        if (char === '#' || char === ' ') {
          return false;
        }
        if (char >= 'a' && char <= 'z') {
          return cleared.has(char);
        }
        return true;
      };
      const queue: [number, number][] = [];
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col] === 'S') {
            queue.push([row, col]);
            reached.add(`${row},${col}`);
          }
        }
      }
      for (const [row, col] of queue) {
        for (const [dr, dc] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const nr = row + dr;
          const nc = col + dc;
          if (!reached.has(`${nr},${nc}`) && open(nr, nc)) {
            reached.add(`${nr},${nc}`);
            queue.push([nr, nc]);
          }
        }
      }
    }

    return map.grid.map((line, row) =>
      [...line].map((char, col): ExpeditionTileView => {
        const reachable = reached.has(`${row},${col}`);
        if (char === 'S') {
          return { kind: 'start', cell: '', reachable: true };
        }
        if (char === 'X') {
          return { kind: 'exit', cell: '', reachable, exitOpen };
        }
        const camp = campByCell.get(char);
        if (camp !== undefined) {
          return {
            kind: 'camp',
            cell: char,
            reachable,
            camp: {
              name: camp.name,
              stamina: camp.stamina,
              level: expeditionLevel(EXPEDITION, anchor, camp),
              boss: camp.boss,
              cleared: cleared.has(char),
              fightable: fightable.has(char),
            },
          };
        }
        const chest = chestByCell.get(char);
        if (chest !== undefined) {
          return {
            kind: 'chest',
            cell: char,
            reachable,
            chest: { name: chest.name, taken: record?.chests.includes(char) ?? false },
          };
        }
        return { kind: char === '.' ? 'path' : 'wall', cell: '', reachable };
      }),
    );
  }

  /** How many cards the attempt is owed. Zero or one in play. */
  cardsOwed(mapId: string): number {
    const run = this.runOn(mapId);
    return run === null ? 0 : expeditionCardsOwed(run);
  }

  /** The cards the attempt holds, resolved for display. */
  held(mapId: string): readonly DescentCardView[] {
    return this.heldCards(mapId).map((card) => cardView(card));
  }

  /**
   * The three cards on offer, or empty when none is owed.
   *
   * Derived exactly as the Descent's offer is, with the crew's own factions where the daily lock
   * would stand — see the class note — and the rank tilt progressed by **stamina spent over the
   * budget**, which saturates by construction however a map is retuned.
   */
  offer(mapId: string): readonly DescentCardView[] {
    const state = this.game.snapshot();
    const map = this.mapById(mapId);
    const run = this.runOn(mapId);
    if (state === null || map === null || run === null) {
      return [];
    }
    if (expeditionStatus(map, run) !== 'choosing') {
      return [];
    }
    return this.derivedOffer(state, map, run).map((card) => cardView(card));
  }

  /** What the attempt's cards are worth to one faction — the same function the battle path calls. */
  bonusFor(faction: string): DescentBonus {
    const run = this.run();
    return descentBonus(
      EXPEDITION,
      run === null ? [] : descentCards(DESCENT_CARDS, EXPEDITION, run.cards),
      faction,
    );
  }

  /** What the attempt carries into its next fight — survivors only, the Descent's rule. */
  readonly opening = computed<PartyOpening>(() => {
    const run = this.run();
    const carried = new Map<string, CombatantOpening>();
    if (run === null) {
      return carried;
    }
    for (const defId of [...run.party.front, ...run.party.back]) {
      carried.set(defId, { health: run.health[defId] ?? 1, energy: run.energy[defId] ?? 0 });
    }
    return carried;
  });

  /** The crew standing in the attempt, which is fixed for its whole length. */
  readonly party = computed<PartyFormation | null>(() => this.run()?.party ?? null);

  /** Marks `cell` as the camp the next Fight control enters. */
  queue(cell: string): void {
    this.queued.set(cell);
  }

  /**
   * The fight the mode would enter next, resolved against the **authoritative** run.
   *
   * `null` whenever there is nothing to fight: no attempt, an attempt on a map this build does not
   * ship, no camp queued, a card owed, or a queued camp that is out of reach, over budget or
   * already down. Every one of those is a screen's business; every one means the same thing here.
   */
  target(state: GameState): {
    readonly map: ExpeditionMapData;
    readonly camp: ExpeditionCampData;
    readonly stage: StageData;
  } | null {
    const run = state.expedition;
    if (run === null) {
      return null;
    }
    const map = this.mapById(run.mapId);
    const cell = this.queued();
    if (map === null || cell === null) {
      return null;
    }
    const camp = nextExpeditionCamp(map, run, cell);
    if (camp === null) {
      return null;
    }
    const anchor = anchorFor(state);
    const lump = expeditionLump(
      EXPEDITION,
      this.matchedReward(expeditionLevel(EXPEDITION, anchor, camp)),
    );
    return { map, camp, stage: resolveExpeditionCamp(EXPEDITION, map, camp, anchor, lump) };
  }

  /**
   * Folds a finished camp fight back into the attempt.
   *
   * Called by `BattleService.settle`, keyed off the result's stage id — never off the queued cell,
   * which the animation may have outlived. The ledger inside `applyExpeditionResult` is what gates
   * every payout, so a re-fight banks the win and pays nothing.
   */
  settle(
    state: GameState,
    hit: { readonly map: ExpeditionMapData; readonly camp: ExpeditionCampData },
    result: ExpeditionBattleOutcome,
  ): GameState {
    const anchor = anchorFor(state);
    const level = expeditionLevel(EXPEDITION, anchor, hit.camp);
    return applyExpeditionResult(
      state,
      EXPEDITION,
      hit.map,
      hit.camp.cell,
      result,
      this.matchedReward(anchor),
      {
        rules: GEAR,
        factions: GEAR_ALIGNMENTS,
        // The campaign index this camp's level matched, so a camp drops the grades the campaign
        // drops where the fight is the same size — the rule every optional mode follows.
        stageIndex: matchedStageIndex(CAMPAIGN_LEVELS, level),
      },
    );
  }

  /**
   * Opens an attempt on `mapId` with `party` standing in it, replacing any attempt in flight.
   *
   * Refused when the mode is locked or the map's turn has not come. The replacement is the
   * caller's decision to surface — nothing banked is ever lost, but a half-walked map is.
   */
  start(mapId: string, party: PartyFormation): boolean {
    const state = this.game.current;
    const map = this.mapById(mapId);
    if (state === null || map === null || !this.mapOpen(mapId)) {
      return false;
    }
    this.queued.set(null);
    this.game.apply((current) =>
      startExpedition(current, map, party, this.matchedReward(anchorFor(current))),
    );
    void this.game.persist();
    return true;
  }

  /**
   * Takes one of the cards on offer.
   *
   * Re-derived against the authoritative run rather than trusting the id off the screen, and
   * persisted immediately — a card is an irreversible choice, the Descent's reasoning exactly.
   */
  take(cardId: string): void {
    const state = this.game.current;
    if (state === null) {
      return;
    }
    const run = state.expedition;
    const map = run === null ? null : this.mapById(run.mapId);
    if (run === null || map === null) {
      return;
    }
    const offered = this.derivedOffer(state, map, run);
    if (!offered.some((card) => card.id === cardId)) {
      return;
    }
    this.game.apply((current) => takeExpeditionCard(current, map, cardId));
    void this.game.persist();
  }

  /** Walks the open exit: pays the completion bonus first time ever, and closes the attempt. */
  complete(mapId: string): boolean {
    const state = this.game.current;
    const map = this.mapById(mapId);
    if (state === null || map === null) {
      return false;
    }
    const walked = completeExpedition(state, EXPEDITION, map);
    if (walked === state) {
      return false;
    }
    this.queued.set(null);
    this.game.apply(() => walked);
    void this.game.persist();
    return true;
  }

  /** Walks away from the attempt in flight. Costs nothing that was not already banked. */
  abandon(): void {
    const state = this.game.current;
    if (state === null) {
      return;
    }
    if (state.expedition === null) {
      return;
    }
    this.queued.set(null);
    this.game.apply((current) => abandonExpedition(current));
    void this.game.persist();
  }

  /** The enemy level everything anchors on — the hardest campaign stage ever cleared. */
  readonly anchor = computed(() => anchorFor(this.game.snapshot()));

  private heldCards(mapId: string): readonly DescentCard[] {
    const run = this.runOn(mapId);
    return run === null ? [] : descentCards(DESCENT_CARDS, EXPEDITION, run.cards);
  }

  /** The one spelling of the offer's inputs, shared by the reactive read and the take guard. */
  private derivedOffer(
    state: GameState,
    map: ExpeditionMapData,
    run: ExpeditionRun,
  ): readonly DescentCard[] {
    const factions = [
      ...new Set(
        [...run.party.front, ...run.party.back]
          .map((defId) => characterById(defId)?.faction)
          .filter((faction): faction is string => faction !== undefined),
      ),
    ];
    return cardOffer(
      EXPEDITION,
      DESCENT_CARDS,
      factions,
      state.rng.seed,
      `expedition:cards:${map.id}:${run.attempt}:${run.cards.length}`,
      Math.min(expeditionStaminaSpent(map, run) / Math.max(map.stamina, 1), 1),
      descentCards(DESCENT_CARDS, EXPEDITION, run.cards),
    );
  }

  /** The campaign lump matched at `level` — the base every lump and chest multiplier prices off. */
  private matchedReward(level: number): AuthoredCurrencies {
    return stagePayout(STAGE_REWARD_CURVE, matchedStageIndex(CAMPAIGN_LEVELS, level)).reward;
  }
}

/**
 * The level an attempt is measured against: the hardest campaign stage ever cleared.
 *
 * `clearedStages` rather than the ladder position, for the reason `descent.service.ts` records —
 * the position stops climbing at the top of the authored ladder.
 */
function anchorFor(state: GameState | null): number {
  if (state === null || CAMPAIGN_LEVELS.length === 0) {
    return 1;
  }
  const cleared = Math.max(Math.floor(state.clearedStages), 0);
  const index = Math.min(Math.max(cleared, 1), CAMPAIGN_LEVELS.length);
  return CAMPAIGN_LEVELS[index - 1];
}
