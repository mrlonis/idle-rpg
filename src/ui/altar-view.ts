import {
  Component,
  computed,
  effect,
  type ElementRef,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { type RarityFamily, rarityFamily, rarityLabel, type RosterFailure } from '../core';
import { type RosterEntryView, RosterService } from './roster.service';

/** Why a single ascension was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'insufficient-copies': 'Not enough spare copies of that character.',
  'max-rarity': 'That character is already fully ascended.',
  'not-owned': 'You do not own that character.',
  'unknown-character': 'That character is not in this build.',
};

/** One character as the Altar draws it. */
interface AltarRow {
  readonly defId: string;
  readonly name: string;
  readonly factionName: string;
  readonly rarityLabel: string;
  readonly rarityFamily: RarityFamily;
  /** The rung the next ascension buys, or `null` at the top of the ladder. */
  readonly nextLabel: string | null;
  /** Which colour family that next rung belongs to, for the arrow's right-hand side. */
  readonly nextFamily: RarityFamily | null;
  readonly copies: number;
  /** What the next rung costs, or `null` at the top of the ladder. */
  readonly cost: number | null;
  readonly ready: boolean;
  readonly maxed: boolean;
}

/**
 * The Altar: the one place a character is ascended.
 *
 * ## Why ascension moved off the character sheet
 *
 * It was one button per sheet, and a rung costs copies of one character and nothing else — so a
 * player holding duplicates of nine characters had nine sheets to open, each to make a decision
 * with no alternative. That is navigation charged for a formality. Gathering them here makes the
 * whole roster's worth of that formality one press, and leaves the sheet's Ascension panel doing
 * the job it is actually good at: explaining what the *next* rung buys this particular character,
 * skill unlock included.
 *
 * The sheet keeps the panel and loses the button. It links here instead, focused on the row it
 * came from — a panel that quotes a price and offers no way to pay it is a dead end.
 *
 * ## Why Ascend All can be one press with no confirmation
 *
 * Copies are spent on the character they are copies of and have no other use, so ascending
 * everything costs nothing that could have been spent elsewhere. There is no trade to weigh, so a
 * dialog would be asking the player to confirm the only answer. See `ascendAll` in
 * [`core/roster/ascend.ts`](../core/roster/ascend.ts) for the condition that would end that — a
 * rung priced in anything shared makes this a choice again, and it would belong back with the
 * player rather than resolved greedily.
 *
 * ## Everyone is listed, ready first
 *
 * Two groups rather than a filtered list. A character three copies short is the reason to go
 * summoning, and dropping it would leave the screen empty for most of a run — the same argument
 * the roster makes for rendering faction headings with nobody under them.
 */
@Component({
  selector: 'app-altar-view',
  imports: [RouterLink],
  templateUrl: './altar-view.html',
  styleUrl: './altar-view.scss',
})
export class AltarView {
  private readonly roster = inject(RosterService);

  /**
   * Which character to bring into view, from `/town/altar?focus=<defId>`.
   *
   * Written by the character sheet's ascension panel and bound by the router rather than read off
   * an `ActivatedRoute`, the same way the sheet takes its own `defId`. An id nobody owns is simply
   * not found — a stale link scrolls nowhere rather than failing.
   */
  readonly focus = input<string>();

  /** What the last action said, when it said anything worth showing. */
  protected readonly notice = signal<string | null>(null);

  private readonly rowElements = viewChildren<ElementRef<HTMLElement>>('rowEl');

  /**
   * Whether the `focus` parameter has already been honoured.
   *
   * A plain field rather than a signal, deliberately: the effect below both reads and writes it,
   * and a signal would make that a self-triggering cycle. It also has to be one-shot — the rows
   * re-render on every ascension, and an effect that refocused each time would yank focus out of
   * the Ascend All button the moment it was pressed.
   */
  private focusHonoured = false;

  protected readonly ready = computed<readonly AltarRow[]>(() =>
    this.roster
      .entries()
      .filter((entry) => entry.canAscend)
      .map(toRow),
  );

  protected readonly waiting = computed<readonly AltarRow[]>(() =>
    this.roster
      .entries()
      .filter((entry) => !entry.canAscend)
      .map(toRow),
  );

  /** How many copies one press would spend, quoted before it is pressed. */
  protected readonly readyCount = computed(() => this.ready().length);

  constructor() {
    effect(() => {
      const target = this.focus();
      const rows = this.rowElements();
      if (this.focusHonoured || target === undefined || rows.length === 0) {
        return;
      }
      const match = rows.find((row) => row.nativeElement.dataset['defId'] === target);
      if (match === undefined) {
        return;
      }
      this.focusHonoured = true;
      // Focus rather than `scrollIntoView`: moving focus scrolls the element into view anyway,
      // and it also tells a screen reader where the player now is — which a silent scroll does
      // not. The row carries `tabindex="-1"` so it can receive focus without joining the tab order.
      match.nativeElement.focus();
    });
  }

  /** Climbs one rung, exactly as the character sheet's button used to. */
  protected ascend(row: AltarRow): void {
    const result = this.roster.ascendOnce(row.defId);
    if (result.ok) {
      this.notice.set(`${row.name} is now ${rarityLabel(this.rarityOf(row.defId))}.`);
      return;
    }
    this.notice.set(FAILURE_MESSAGES[result.reason] ?? 'That did not work.');
  }

  /** Climbs every character as far as its own copies reach. */
  protected ascendAll(): void {
    const run = this.roster.ascendAll();
    if (run.characters === 0) {
      this.notice.set('Nobody is holding enough spare copies for their next rung.');
      return;
    }
    this.notice.set(
      `Ascended ${count(run.characters, 'character')} — ${count(run.rungs, 'rung')} for ${count(run.copies, 'copy', 'copies')}.`,
    );
  }

  /** The rung a character is standing on now, read back after an ascension for the notice. */
  private rarityOf(defId: string): number {
    return this.roster.entry(defId)?.rarity ?? 0;
  }
}

function toRow(entry: RosterEntryView): AltarRow {
  const maxed = entry.isMaxRarity;
  return {
    defId: entry.defId,
    name: entry.name,
    factionName: entry.factionName,
    rarityLabel: entry.rarityLabel,
    rarityFamily: entry.rarityFamily,
    // Guarded by `maxed` rather than clamped: at the top of the ladder there is no next rung to
    // name, and both of these functions would happily answer with the current one.
    nextLabel: maxed ? null : rarityLabel(entry.rarity + 1),
    nextFamily: maxed ? null : rarityFamily(entry.rarity + 1),
    copies: entry.copies,
    cost: entry.ascensionCost,
    ready: entry.canAscend,
    maxed,
  };
}

/** "1 rung", "9 rungs" — the plural spelled out where English does not just add an s. */
function count(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}
