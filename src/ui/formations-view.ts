import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTY_SIZE } from '../core';
import { factionName } from './content';
import { FormationService } from './formation.service';

/** One activity's row on the index. */
interface CrewRow {
  readonly id: string;
  readonly name: string;
  /** "3 of 5 standing", or what is missing. */
  readonly status: string;
  /** Who is standing, named, or `null` for an empty crew. */
  readonly members: string | null;
  /** What the lock admits, or `null` for the campaign. */
  readonly lock: string | null;
  /** Whether this crew could start a fight as it stands. */
  readonly ready: boolean;
}

/**
 * Every crew, in one place.
 *
 * ## Why this screen exists before there is much on it
 *
 * It has one row today. The seven faction towers land in milestones 15b and 15c, and this is where
 * they appear — so shipping it now is what makes each of those a row rather than a screen. The
 * alternative was to defer it and let the campaign crew stay on the roster screen, which is
 * precisely the arrangement milestone 15a was asked to undo.
 *
 * It is reached from the Roster, which is where a player is when they are thinking about who is
 * worth fielding, and **not** from the tab bar. The bar is at five of a measured six and the spare
 * slot is not for spending — see [navigation](../../docs/navigation.md). This also fails the Town
 * test on purpose: Town is "somewhere you go deliberately, with something you have earned", and a
 * crew is not something you earn, it is something you arrange about the roster you already have.
 */
@Component({
  selector: 'app-formations-view',
  imports: [RouterLink],
  templateUrl: './formations-view.html',
  styleUrl: './formations-view.scss',
})
export class FormationsView {
  private readonly formations = inject(FormationService);

  protected readonly partySize = PARTY_SIZE;

  protected readonly rows = computed<readonly CrewRow[]>(() =>
    this.formations.summaries().map((crew) => ({
      id: crew.activity.id,
      name: crew.activity.name,
      status: `${crew.size} of ${PARTY_SIZE} standing`,
      // Named rather than counted. The count is already in the status line, and the whole reason
      // to open this screen is to remember who is where without opening each crew in turn.
      members:
        crew.size === 0
          ? null
          : [...crew.front, ...crew.back].map((entry) => entry.name).join(' · '),
      lock: crew.lockFaction === null ? null : `${factionName(crew.lockFaction)} only`,
      ready: crew.ready,
    })),
  );
}
