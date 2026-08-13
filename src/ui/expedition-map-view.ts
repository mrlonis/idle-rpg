import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PARTY_SIZE } from '../core';
import { BattleService } from './battle.service';
import { characterById } from './content';
import { type DescentCardView } from './descent.service';
import { ExpeditionService, type ExpeditionTileView } from './expedition.service';
import { FormationService } from './formation.service';

/** Expeditions' crew key, which is also the activity id and the formation-book key. */
const EXPEDITION_ACTIVITY = 'expedition';

/**
 * One map of the Expedition, played: the grid, the budget, the crew, and the cards.
 *
 * ## The grid is buttons, and that is the whole rendering answer
 *
 * A puzzle map in a hand-written-component app is a CSS grid of tiles: camps are buttons that
 * select themselves for inspection, the exit is a button once it opens, and everything else is
 * inert ground. No canvas, no drag, no avatar — movement is free and the map fully visible, so the
 * only decisions are which camps to fight, and a button per decision is exactly what HTML is for.
 *
 * ## Tapping a camp inspects it; a second control fights it
 *
 * Fighting spends stamina on a win, so a stray tap must never start a fight. The tile selects, the
 * detail panel says what the camp costs and why it can or cannot be fought, and the Fight control
 * in that panel is what commits — the same two-step every shop purchase in this game uses.
 *
 * ⚠️ Both per-screen signals here are `linkedSignal`s keyed on the route parameter, per the rule in
 * `AGENTS.md`: the router reuses this component instance between `/expeditions/a` and
 * `/expeditions/b`, and a selected camp or a half-confirmed abandon carried across would be a
 * statement about a map the player is no longer looking at.
 */
@Component({
  selector: 'app-expedition-map-view',
  imports: [RouterLink],
  templateUrl: './expedition-map-view.html',
  styleUrl: './expedition-map-view.scss',
})
export class ExpeditionMapView {
  private readonly expeditions = inject(ExpeditionService);
  private readonly formations = inject(FormationService);
  private readonly battles = inject(BattleService);
  private readonly router = inject(Router);

  /** Which map, off the route. */
  readonly mapId = input.required<string>();

  protected readonly partySize = PARTY_SIZE;

  /** The camp cell under inspection, or `null`. Reset when the route's map changes. */
  protected readonly selected = linkedSignal<string, string | null>({
    source: this.mapId,
    computation: () => null,
  });

  /** Whether the Abandon control is one tap from firing. Reset with the route, same rule. */
  protected readonly confirmingAbandon = linkedSignal<string, boolean>({
    source: this.mapId,
    computation: () => false,
  });

  protected readonly map = computed(() => this.expeditions.mapById(this.mapId()));
  protected readonly open = computed(() => this.expeditions.mapOpen(this.mapId()));
  protected readonly record = computed(() => this.expeditions.recordFor(this.mapId()));
  protected readonly run = computed(() => this.expeditions.runOn(this.mapId()));
  protected readonly status = computed(() => this.expeditions.statusOn(this.mapId()));
  protected readonly exitOpen = computed(() => this.expeditions.exitOpen(this.mapId()));
  protected readonly staminaLeft = computed(() => this.expeditions.staminaLeft(this.mapId()));
  protected readonly staminaSpent = computed(() => this.expeditions.staminaSpent(this.mapId()));
  protected readonly tiles = computed(() => this.expeditions.tiles(this.mapId()));
  protected readonly held = computed(() => this.expeditions.held(this.mapId()));
  protected readonly offer = computed(() => this.expeditions.offer(this.mapId()));
  protected readonly cardsOwed = computed(() => this.expeditions.cardsOwed(this.mapId()));
  protected readonly chaptersNeeded = this.expeditions.chaptersNeeded;

  /** The attempt in flight somewhere else, which beginning here would abandon. */
  protected readonly elsewhere = computed(() => {
    const run = this.expeditions.run();
    if (run === null || run.mapId === this.mapId()) {
      return null;
    }
    return this.expeditions.mapById(run.mapId)?.name ?? run.mapId;
  });

  /** The crew the editor currently holds, which is what a fresh attempt would copy in. */
  protected readonly crew = computed(() => this.formations.crew(EXPEDITION_ACTIVITY));

  /** Where the crew is arranged. The editor, never duplicated here — the Descent's rule. */
  protected readonly crewLink = ['/formations', EXPEDITION_ACTIVITY];

  /**
   * The party, named, with how much health each still carries — the run's own copy once one
   * exists, the editor's crew before that. See `descent-view.ts` for why.
   */
  protected readonly members = computed<readonly { name: string; health: number }[]>(() => {
    const run = this.run();
    if (run === null) {
      const crew = this.crew();
      return crew === null
        ? []
        : [...crew.front, ...crew.back].map((entry) => ({ name: entry.name, health: 100 }));
    }
    return [...run.party.front, ...run.party.back].map((defId) => ({
      name: characterById(defId)?.name ?? defId,
      health: Math.round((run.health[defId] ?? 1) * 100),
    }));
  });

  protected readonly standing = computed(() => this.members().length);

  /** The selected camp's tile view, or `null`. */
  protected readonly selectedCamp = computed(() => {
    const cell = this.selected();
    if (cell === null) {
      return null;
    }
    for (const row of this.tiles()) {
      for (const tile of row) {
        if (tile.kind === 'camp' && tile.cell === cell) {
          return tile;
        }
      }
    }
    return null;
  });

  /** Why the selected camp cannot be fought right now, or empty when it can. */
  protected readonly fightBlocked = computed(() => {
    const tile = this.selectedCamp();
    if (tile?.camp === undefined) {
      return '';
    }
    if (this.run() === null) {
      return 'Begin the expedition first.';
    }
    if (tile.camp.cleared) {
      return 'This camp has already fallen.';
    }
    if (this.cardsOwed() > 0) {
      return 'Take a card before the next fight.';
    }
    if (!tile.reachable && !tile.camp.fightable) {
      return 'Out of reach — open a path to it first.';
    }
    if (!tile.camp.fightable) {
      return `Not enough stamina — this camp costs ${tile.camp.stamina} and you have ${this.staminaLeft()}.`;
    }
    return '';
  });

  /** An accessible one-line description of a tile, for the grid buttons and cells. */
  protected tileLabel(tile: ExpeditionTileView): string {
    switch (tile.kind) {
      case 'start':
        return 'The start';
      case 'exit':
        return tile.exitOpen === true ? 'The exit — open' : 'The exit — sealed behind the boss';
      case 'camp': {
        const camp = tile.camp;
        if (camp === undefined) {
          return 'A camp';
        }
        const kind = camp.boss ? 'Boss camp' : 'Camp';
        if (camp.cleared) {
          return `${kind} ${tile.cell.toUpperCase()} — ${camp.name}, cleared`;
        }
        return `${kind} ${tile.cell.toUpperCase()} — ${camp.name}, ${camp.stamina} stamina, level ${camp.level}`;
      }
      case 'chest': {
        const chest = tile.chest;
        return chest === undefined
          ? 'A chest'
          : `Chest — ${chest.name}${chest.taken ? ', already claimed' : ''}`;
      }
      default:
        return '';
    }
  }

  /** Selects a camp for inspection. Never fights — see the class note. */
  protected select(tile: ExpeditionTileView): void {
    if (tile.kind === 'camp') {
      this.selected.set(tile.cell);
    }
  }

  /** Whether a fresh attempt can begin: the map is open and the editor's crew is legal. */
  protected readonly canStart = computed(
    () => this.open() && this.run() === null && this.crew()?.ready === true,
  );

  /** Why the Begin control is inert, in the order the player can act on it. */
  protected readonly startBlocked = computed(() => {
    if (!this.open() || this.run() !== null) {
      return '';
    }
    const crew = this.crew();
    if (crew === null || crew.size === 0) {
      return 'Choose a crew before setting out.';
    }
    if (crew.away.length > 0) {
      return 'Somebody in this crew is away on a bounty.';
    }
    return crew.ready ? '' : 'This crew is not ready to fight.';
  });

  /** Begins an attempt with the crew as it stands, replacing any attempt elsewhere. */
  protected start(): void {
    const crew = this.crew();
    if (crew === null || !this.canStart()) {
      return;
    }
    this.expeditions.start(this.mapId(), {
      front: crew.front.map((entry) => entry.defId),
      back: crew.back.map((entry) => entry.defId),
    });
  }

  /** Takes one of the cards on offer. The others are gone for this attempt. */
  protected take(card: DescentCardView): void {
    this.expeditions.take(card.id);
  }

  /**
   * Enters the fight against the selected camp.
   *
   * Navigates home first, exactly as the Descent's Fight control does: the battle screen is a mode
   * rather than a route, and leaving this screen underneath would drop the player back onto it
   * mid-animation.
   */
  protected fight(): void {
    const tile = this.selectedCamp();
    if (tile?.camp?.fightable !== true || this.status() !== 'ready') {
      return;
    }
    this.expeditions.queue(tile.cell);
    void this.router.navigateByUrl('/').then(() => {
      this.battles.fight(Date.now(), EXPEDITION_ACTIVITY);
    });
  }

  /** Walks the open exit: completion pays first time ever, and the attempt closes. */
  protected complete(): void {
    if (this.expeditions.complete(this.mapId())) {
      this.selected.set(null);
    }
  }

  /** Two taps to abandon: the first arms, the second fires. Nothing banked is lost either way. */
  protected abandon(): void {
    if (!this.confirmingAbandon()) {
      this.confirmingAbandon.set(true);
      return;
    }
    this.confirmingAbandon.set(false);
    this.selected.set(null);
    this.expeditions.abandon();
  }

  protected cancelAbandon(): void {
    this.confirmingAbandon.set(false);
  }
}
