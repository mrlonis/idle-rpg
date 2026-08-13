import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PARTY_SIZE } from '../core';
import { BattleService } from './battle.service';
import { characterById, factionList, factionName } from './content';
import { DescentService, type DescentCardView, type DescentFightView } from './descent.service';
import { FormationService } from './formation.service';

/** The Descent's crew key, which is also its activity id and its formation-book key. */
const DESCENT_ACTIVITY = 'descent';

/** One floor, with its three fights under it. */
interface FloorRow {
  readonly floor: number;
  readonly label: string;
  readonly fights: readonly DescentFightView[];
}

/**
 * The Descent: one run a day, three floors of three, and a card between each fight.
 *
 * ## Why this is a screen of its own rather than a crew editor with extras
 *
 * Every other fight in the game is a crew editor and a Fight control, which is why
 * `/prepare/:activityId` serves all eight of them. A Descent run has state **between** its fights —
 * a floor map, carried damage, a hand of cards, a pending choice — and none of that belongs on a
 * screen whose job is arranging five characters. The crew is still edited by the one editor, at
 * `/formations/descent`; this screen links to it and never duplicates it.
 *
 * ⚠️ **The Fight control lives here rather than on the editor**, which is the one place the Descent
 * departs from "every battle passes through the crew editor". The reason is the card: a run in
 * progress has to be sent back *here* between fights, and routing it through the editor every time
 * would ask the player to re-confirm a crew that is locked for the rest of the run and cannot be
 * changed.
 *
 * ## Six states, and every one of them says what to do next
 *
 * The mode is optional daily content, so none of its states is a fault: locked names the chapter
 * that opens it, available names today's factions, choosing is the card offer, ready is the fight,
 * complete is a run finished, and ended is a run out of lives. That is the same rule Home's locked
 * tower row is spent on — a visible destination is most of what optional content is for.
 */
@Component({
  selector: 'app-descent-view',
  imports: [RouterLink],
  templateUrl: './descent-view.html',
  styleUrl: './descent-view.scss',
})
export class DescentView {
  private readonly descent = inject(DescentService);
  private readonly formations = inject(FormationService);
  private readonly battles = inject(BattleService);
  private readonly router = inject(Router);

  protected readonly partySize = PARTY_SIZE;
  protected readonly phase = this.descent.phase;
  protected readonly livesLeft = this.descent.livesLeft;
  protected readonly lives = this.descent.lives;
  protected readonly fights = this.descent.fights;
  protected readonly runsFinished = this.descent.runsFinished;
  protected readonly held = this.descent.held;
  protected readonly offer = this.descent.offer;

  /** Where the crew is arranged. The editor, never the pre-battle route — see the class note. */
  protected readonly crewLink = ['/formations', DESCENT_ACTIVITY];

  /** Today's three factions, spelled out. */
  protected readonly lockNote = computed(() => factionList(this.descent.lock()));

  /** The crew the editor currently holds, which is what a fresh run would be started with. */
  protected readonly crew = computed(() => this.formations.crew(DESCENT_ACTIVITY));

  /**
   * The party, named, with how much health each still carries.
   *
   * ⚠️ **Reads the run's own party once one exists**, not the formation book. A run copies its crew
   * at the moment it starts and the fallen leave that copy — so the book would go on reporting five
   * for a party that is down to three, which is the number this list exists to show. Before a run
   * starts there is no run to read, so it shows the crew the editor holds.
   *
   * The health is the **fraction** the run stores, which is why it survives a level bought between
   * two fights: the bar says how wounded somebody is, not how many points they have left.
   */
  protected readonly members = computed<readonly { name: string; health: number }[]>(() => {
    const party = this.descent.party();
    const crew = this.crew();
    if (party === null) {
      return crew === null
        ? []
        : [...crew.front, ...crew.back].map((entry) => ({ name: entry.name, health: 100 }));
    }
    const carried = this.descent.opening();
    return [...party.front, ...party.back].map((defId) => ({
      name: characterById(defId)?.name ?? defId,
      health: Math.round((carried.get(defId)?.health ?? 1) * 100),
    }));
  });

  /** How many of today's run are still standing. */
  protected readonly standing = computed(() => this.members().length);

  /** The nine fights, grouped into their three floors. */
  protected readonly floors = computed<readonly FloorRow[]>(() => {
    const rows = this.descent.fightRows();
    const floors = new Map<number, DescentFightView[]>();
    for (const row of rows) {
      const list = floors.get(row.floor) ?? [];
      list.push(row);
      floors.set(row.floor, list);
    }
    return [...floors.entries()].map(([floor, fights]) => ({
      floor,
      label: `Floor ${floor}`,
      fights,
    }));
  });

  /** The fight the run would enter next, or `null` when there is none. */
  protected readonly current = computed<DescentFightView | null>(
    () => this.descent.fightRows().find((row) => row.current) ?? null,
  );

  /** What a card's faction line says, or `null` on one that pays everybody. */
  protected factionOf(card: DescentCardView): string | null {
    return card.faction === null ? null : `${factionName(card.faction)} only`;
  }

  /**
   * Whether a fresh run can start: the mode is open, none has been started today, and the crew is
   * legal.
   *
   * ⚠️ **`crew.ready` covers the faction lock and the bounty rule together**, which is exactly what
   * it is for — the lock changes daily here, so a crew that was legal yesterday may not be today,
   * and the answer has to come from the one resolver both the editor and the battle path use.
   */
  protected readonly canStart = computed(
    () => this.phase() === 'available' && this.crew()?.ready === true,
  );

  /** Why the Start control is inert, in the order the player can act on it. */
  protected readonly startBlocked = computed(() => {
    if (this.phase() !== 'available') {
      return '';
    }
    const crew = this.crew();
    if (crew === null || crew.size === 0) {
      return 'Choose a crew before descending.';
    }
    if (crew.away.length > 0) {
      return 'Somebody in this crew is away on a bounty.';
    }
    if (!crew.ready) {
      return `Today only ${this.lockNote()} may descend.`;
    }
    return '';
  });

  /** How many campaign chapters are still owed before the mode opens. */
  protected readonly chaptersNeeded = this.descent.chaptersNeeded;

  /** Starts today's run with the crew as it currently stands, and locks it for the whole run. */
  protected start(): void {
    const crew = this.crew();
    if (crew === null || !this.canStart()) {
      return;
    }
    this.descent.start({
      front: crew.front.map((entry) => entry.defId),
      back: crew.back.map((entry) => entry.defId),
    });
  }

  /** Takes one of the three cards. The other two are gone. */
  protected take(cardId: string): void {
    this.descent.take(cardId);
  }

  /**
   * Enters the next fight.
   *
   * Navigates home first, exactly as the crew editor's Fight control does: the battle screen is a
   * mode rather than a route, so it replaces whatever is beneath it — and leaving `/descent`
   * underneath would drop the player back onto this screen mid-animation.
   */
  protected fight(): void {
    if (this.phase() !== 'ready') {
      return;
    }
    void this.router.navigateByUrl('/').then(() => {
      this.battles.fight(Date.now(), DESCENT_ACTIVITY);
    });
  }
}
