import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  BACK_ROW_SIZE,
  FRONT_ROW_SIZE,
  PARTY_SIZE,
  type RosterFailure,
  type RosterResult,
  type Row,
} from '../core';
import { BattleService } from './battle.service';
import { characterById, factionName } from './content';
import { FormationService } from './formation.service';
import { lineupPanel } from './lineup-copy';
import { type RosterEntryView } from './roster.service';
import { TowerService } from './tower.service';

/** Why a crew change was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'row-full': `Both rows are full — ${FRONT_ROW_SIZE} in front, ${BACK_ROW_SIZE} behind. Take somebody out first.`,
  'not-owned': 'You do not own that character.',
  'duplicate-party-member': 'That character is already in this crew.',
  'unknown-character': 'That character is no longer available.',
  // Only reachable on a locked activity, and only from a stale row. The message names the lock
  // rather than the refusal, because "wrong faction" without saying which faction is not a fix.
  'wrong-faction': 'That character cannot enter this tower.',
};

/** What the next tap on a row's control will do. */
interface PlacementAction {
  readonly label: string;
  /** Spelled out for assistive technology, because the visible label repeats down the list. */
  readonly description: string;
}

/** One heading and the rows under it, in the pool below the crew. */
interface PoolSection {
  /** Stable key, and the `id` the section's heading is labelled by. */
  readonly id: string;
  readonly label: string;
  readonly members: readonly RosterEntryView[];
  /** Shown in place of the list when the section is empty. */
  readonly empty: string;
}

/**
 * One activity's crew: who is standing where, and the pool they are drawn from.
 *
 * ## One component, two routes
 *
 * `/formations/:activityId` is where a player arranges a crew ahead of time, and
 * `/prepare/:activityId` is the same screen with a Fight control on it — the step every battle now
 * passes through. They are one component because they are one screen: a pre-battle picker that
 * could not do everything the editor does would send the player to the editor and back, and two
 * implementations of a formation editor is exactly what milestone 15a exists to avoid having
 * eight of.
 *
 * ⚠️ **A screen, not a modal.** "Pop up the formation before every battle" is the requirement, and
 * a dialog was the obvious build. It loses on three counts a route wins: a full crew editor is far
 * more than a phone-sized overlay can hold without scrolling inside a scroll container; a route
 * survives a reload, which is the project's own stated trigger for routing; and the CDK dialog
 * would have to trap focus around a list of forty-nine controls. The transition reads the same to
 * the player — tap Fight, arrange, tap Fight again.
 *
 * ## Placement is one control per row
 *
 * It **cycles** front → back → out rather than offering three buttons or a drag-and-drop board.
 * Two ranks of two and three is a small enough space that cycling reaches every state in at most
 * two taps, and a drag target is the worst possible control on a phone — this screen is a list,
 * and a list is a thing you tap.
 *
 * Which row a character stands in is entirely the player's call. Nothing here consults a
 * character's role: role-locking would let an unlucky roster reach a state with no legal crew, and
 * a bad front row is a far better failure than no front row. A tower's **faction** lock is a
 * different thing and is enforced — it filters the pool rather than refusing a tap, so the screen
 * never shows a row whose control cannot work.
 */
@Component({
  selector: 'app-formation-view',
  imports: [RouterLink],
  templateUrl: './formation-view.html',
  styleUrl: './formation-view.scss',
})
export class FormationView {
  private readonly formations = inject(FormationService);
  private readonly battles = inject(BattleService);
  private readonly towers = inject(TowerService);
  private readonly router = inject(Router);

  /** Which activity's crew this screen is editing. Arrives from the route. */
  readonly activityId = input.required<string>();

  /**
   * Whether the Fight control is on screen.
   *
   * Route data rather than a query parameter, because it is a property of *which route was
   * matched* rather than something a player chose — and it must not be forgeable from a URL: a
   * `/formations/campaign?fight=1` that started battles would be a second, undocumented entry
   * point into the battle path.
   */
  readonly prepare = input(false);

  protected readonly partySize = PARTY_SIZE;

  /** The last refusal, cleared as soon as anything succeeds. */
  protected readonly message = signal<string | null>(null);

  /**
   * The crew, or `null` for an activity this build does not ship.
   *
   * A stale link and a hand-typed URL both land here, and both get a screen that says so rather
   * than a blank one — the same call the character sheet makes for an unknown character id.
   */
  protected readonly crew = computed(() => this.formations.crew(this.activityId()));

  protected readonly lineup = computed(() => {
    const crew = this.crew();
    return crew === null ? null : lineupPanel(crew.lineup);
  });

  /** The two ranks, front first. */
  protected readonly ranks = computed(() => {
    const crew = this.crew();
    if (crew === null) {
      return [];
    }
    return [
      {
        row: 'front' as const,
        label: 'Front row',
        capacity: FRONT_ROW_SIZE,
        hint: 'Attacks come here first. +5% defence, +0.05 crit damage resistance.',
        members: crew.front,
      },
      {
        row: 'back' as const,
        label: 'Back row',
        capacity: BACK_ROW_SIZE,
        hint: 'Shielded while the front row holds. +5% attack, +0.05 crit damage.',
        members: crew.back,
      },
    ];
  });

  /**
   * The pool below the crew, as headings and their rows: one section per faction.
   *
   * The wording of an empty section is decided here rather than in the service, because it is
   * copy. What the service supplies is the fact behind it — how many of that faction are owned —
   * so a section emptied by everybody already standing says so instead of claiming you own none.
   */
  protected readonly sections = computed<readonly PoolSection[]>(() => {
    const crew = this.crew();
    if (crew === null) {
      return [];
    }
    return crew.eligible.map((group) => ({
      id: group.factionId,
      label: group.label,
      members: group.members,
      empty: group.owned === 0 ? 'None owned yet.' : 'Everyone you own is already standing.',
    }));
  });

  /** What the lock says, in a line, or `null` for an activity with no lock. */
  protected readonly lockNote = computed(() => {
    const faction = this.crew()?.lockFaction ?? null;
    return faction === null
      ? null
      : `Only ${factionName(faction)} may enter. Everyone else is hidden below.`;
  });

  /**
   * Who is away, named, or `null` when nobody is.
   *
   * Named rather than counted, because the fix is per character: "two are away" tells a player
   * they are blocked and not who to take out.
   */
  protected readonly awayNote = computed(() => {
    const crew = this.crew();
    if (crew === null || crew.away.length === 0) {
      return null;
    }
    const names = crew.away.map((defId) => characterById(defId)?.name ?? defId).join(', ');
    const verb = crew.away.length === 1 ? 'is' : 'are';
    return `${names} ${verb} away on a bounty and cannot fight. Collect the mission, or take them out of this crew.`;
  });

  /**
   * Whether the Fight control works: the crew can fight, **and** there is something to fight.
   *
   * ⚠️ **Two independent questions, and neither subsumes the other.** `crew.ready` is about the five
   * characters — somebody is standing, the lock is satisfied, nobody is away on a bounty. The second
   * is about the content: a tower the campaign has not opened, and a tower already topped, are both
   * activities with a legal crew and no fight behind them. `BattleService.fight` refuses either way,
   * so a control that only asked the first would silently do nothing.
   */
  protected readonly canFight = computed(
    () => this.crew()?.ready === true && this.battles.nextFight(this.activityId()) !== null,
  );

  /** Why the Fight control is inert, in the order the player can act on. */
  protected readonly blockedReason = computed(() => {
    const crew = this.crew();
    if (crew === null) {
      return '';
    }
    if (crew.size === 0) {
      return 'Place at least one character before fighting.';
    }
    if (crew.away.length > 0) {
      return 'Somebody in this crew is away on a bounty.';
    }
    if (!crew.ready) {
      return `Only ${factionName(crew.lockFaction ?? '')} may enter this tower.`;
    }
    // Content rather than crew, so it comes last: the tower is either not open yet or finished, and
    // in both cases the line names the state instead of asking for a change nothing can make.
    const tower = this.towers.view(this.activityId());
    if (tower?.status === 'locked') {
      const clears =
        tower.clearsNeeded === 1
          ? '1 more campaign stage'
          : `${tower.clearsNeeded} more campaign stages`;
      return `${tower.tower.name} opens once you have cleared ${clears}.`;
    }
    if (tower?.status === 'topped') {
      return `You have cleared all ${tower.floors} floors. A floor is climbed once, so there is nothing left to fight here.`;
    }
    return 'There is nothing to fight here.';
  });

  protected readonly summary = computed(() => {
    const crew = this.crew();
    if (crew === null) {
      return '';
    }
    return `${crew.size} of ${this.partySize} standing`;
  });

  /** Where a character stands in *this* crew, in words, for the row's meta line. */
  protected placementLabel(defId: string): string {
    const placement = this.formations.placementOf(this.activityId(), defId);
    if (placement === null) {
      return 'Available';
    }
    return `${placement.row === 'front' ? 'Front' : 'Back'} ${placement.slot}`;
  }

  /**
   * What the next tap does, given where the character is now and what room is left.
   *
   * Computed rather than hard-coded so the button never promises something the cycle will not do:
   * with a full back row, a front-row character's next tap takes them out, and the label says so.
   */
  protected nextAction(defId: string, name: string): PlacementAction {
    const open = this.crew()?.open ?? { front: 0, back: 0 };
    const row: Row | null = this.formations.placementOf(this.activityId(), defId)?.row ?? null;
    if (row === 'front') {
      return open.back > 0
        ? { label: 'To back', description: `Move ${name} to the back row` }
        : { label: 'Remove', description: `Take ${name} out of this crew` };
    }
    if (row === 'back') {
      return { label: 'Remove', description: `Take ${name} out of this crew` };
    }
    if (open.front > 0) {
      return { label: 'To front', description: `Place ${name} in the front row` };
    }
    if (open.back > 0) {
      return { label: 'To back', description: `Place ${name} in the back row` };
    }
    return { label: 'Place', description: `Place ${name} — both rows are full` };
  }

  protected cycle(defId: string): void {
    this.report(this.formations.cyclePlacement(this.activityId(), defId));
  }

  protected clear(): void {
    this.report(this.formations.clear(this.activityId()));
  }

  /**
   * Starts the fight this screen was opened to prepare for.
   *
   * The clock lives here, as it does everywhere else in `ui/`. Opening the battle screen is the
   * service's business: a battle is a mode rather than a route, so nothing is navigated to — but
   * this screen *is* a route, and leaving it on the stack would put the player back on a crew
   * editor when the fight ends. So it navigates home first and lets the battle screen take over.
   */
  protected fight(): void {
    if (!this.canFight()) {
      return;
    }
    void this.router.navigateByUrl('/').then(() => {
      this.battles.fight(Date.now(), this.activityId());
    });
  }

  private report(result: RosterResult): void {
    this.message.set(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'That did not work.'));
  }
}
