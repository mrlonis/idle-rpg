import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PARTY_SIZE, type RosterFailure, type RosterResult } from '../core';
import { formatAmounts } from './format-numeric';
import { type ScreenId } from './navigation';
import { type RosterEntryView, RosterService } from './roster.service';

/**
 * Why a levelling action was refused, in words a player can act on.
 *
 * ⚠️ **The placement reasons are gone rather than kept "just in case".** Since milestone 15a this
 * screen cannot change a crew, so `row-full`, `duplicate-party-member` and `character-away` name
 * outcomes nothing here can produce — and a message for an impossible outcome is a claim about the
 * screen that stopped being true. They live on the formation editor now.
 */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'not-owned': 'You do not own that character.',
  'insufficient-currency': 'Not enough gold, XP or essence to raise the shared level.',
  'level-capped': `Your ${PARTY_SIZE}th-highest character is at its level cap. Ascend somebody to raise the shared level further.`,
};

/**
 * The shared level, in words.
 *
 * The numbers are resolved in the service through `core/`, and only the wording is decided here.
 * The panel answers the three questions in the order a player asks them — what level is everybody
 * at, who is holding it there, and what does the next one cost.
 */
interface ResonanceAnchor {
  readonly defId: string;
  readonly name: string;
  readonly level: number;
  /** Standing on the floor, so this is one of the characters the next step actually charges for. */
  readonly lagging: boolean;
}

interface ResonancePanel {
  readonly floor: number;
  /**
   * Who is setting the floor, named — the whole mechanic is invisible without this.
   *
   * **A list rather than a sentence, and character names are why.** "Azrathoth, Ruin Unbound" and
   * "Ithuriel, Verse of Dawn" both contain commas, so a comma-joined roll-call reads as seven
   * people. A middot would fix the ambiguity on screen and announce as nothing at all, which
   * trades one unreadable line for another.
   */
  readonly anchors: readonly ResonanceAnchor[];
  /** How many characters the floor is actually lifting. */
  readonly carried: string;
  /** The price of one more level of floor, or `null` when nothing can raise it. */
  readonly stepCost: string | null;
  readonly stepLabel: string;
  readonly maxLabel: string;
  readonly canStep: boolean;
  readonly canMax: boolean;
  /** What to do about it. */
  readonly hint: string;
}

/** One heading and the rows under it. */
interface RosterSection {
  /** Stable key, and the `id` the section's heading is labelled by. */
  readonly id: string;
  readonly label: string;
  readonly members: readonly RosterEntryView[];
  /** Shown in place of the list when the section is empty. */
  readonly empty: string;
}

/**
 * The roster: everyone owned, and what each of them is worth.
 *
 * ## It stopped being a formation editor in milestone 15a
 *
 * It was one, and it was the right screen for it while there was one formation. Eight crews do not
 * fit here — not because the markup could not hold them, but because the screen would then answer
 * two unrelated questions at once: *who is worth levelling* and *who is going to which fight*. So
 * placement moved out whole, to `/formations`, and this screen links there.
 *
 * What is left is the roster as an **investment** screen: the shared level, and every character
 * with the level, rung and copies that decide whether to spend on them. Each row still says which
 * crews it is standing for, because that is a fact about the character rather than about any one
 * crew.
 *
 * The list is **grouped by faction under fixed headings**. Faction is the axis the whole ascension
 * system turns on — a mortal rung is paid in faction-mates — so "how deep is my Dwarf bench" is a
 * question the screen should answer by being scrolled, not by being read. Every faction keeps its
 * heading even when nothing is under it, because a fixed shape is something a player can learn the
 * position of, and because an absent group and an empty one say different things about a run.
 */
@Component({
  selector: 'app-roster-view',
  imports: [RouterLink],
  templateUrl: './roster-view.html',
  styleUrl: './roster-view.scss',
})
export class RosterView {
  private readonly roster = inject(RosterService);

  protected readonly partySize = PARTY_SIZE;
  protected readonly entries = this.roster.entries;
  protected readonly resonance = this.roster.resonance;

  /**
   * What this screen calls itself on links out to a character sheet. The roster is also where a
   * sheet with no origin at all falls back to, but the link says so anyway: every link into a
   * sheet naming its own screen is one rule, and a rule with an exception in it is not learnt.
   */
  protected readonly screenId: ScreenId = 'roster';

  /**
   * The list, as headings and their rows: one section per faction.
   *
   * The wording of an empty section is decided here rather than in the service, because it is
   * copy. What the service supplies is the fact behind it — how many of that faction are owned.
   * Both numbers agree on this screen, which includes every row; the formation editor is where
   * they differ.
   */
  protected readonly sections = computed<readonly RosterSection[]>(() =>
    this.roster.factionGroups().map((group) => ({
      id: group.factionId,
      label: group.label,
      members: group.members,
      empty: 'None owned yet.',
    })),
  );

  /**
   * The shared level, as copy.
   *
   * **The anchors are named rather than counted.** A floor is a number with no visible cause, and
   * "held up by Rin, Bram, Vess, Kel and Oda" is the sentence that turns it into something a
   * player can act on — it is also the only place the screen says *which* five are doing the
   * lifting, which is what stops the button feeling arbitrary when it charges for one character.
   */
  protected readonly resonancePanel = computed<ResonancePanel>(() => {
    const { floor, anchors, carried, stepCost, affordable, ceiling, capped } = this.resonance();
    const owned = this.entries().length;
    // The pre-load window and a roster repaired down to nothing both land here, and every other
    // line on this panel is a claim about characters. Answered first so none of them has to be
    // written twice — "everybody already stands above the floor" is not true of nobody.
    const empty = owned === 0;

    return {
      floor,
      anchors: anchors.map((entry) => ({
        defId: entry.defId,
        name: entry.name,
        level: entry.level,
        // Marked because it is the actionable half of the mechanic: levelling somebody already
        // above the floor buys that character's own power and moves the roster nothing.
        lagging: entry.level <= floor,
      })),
      carried: empty
        ? 'Nothing to share yet.'
        : carried === 0
          ? `Nobody is being carried yet — resonance starts working once you own more than ${PARTY_SIZE}.`
          : `${carried} ${carried === 1 ? 'character is' : 'characters are'} being carried above what you paid for.`,
      stepCost: stepCost === null ? null : formatAmounts(stepCost),
      stepLabel: `Raise to ${floor + 1}`,
      // Named rather than "Raise to max", because the two buttons differ by exactly one number
      // and a label that hid it would make them look like the same control twice.
      maxLabel: affordable > floor ? `Raise to ${affordable}` : 'Raise as far as I can',
      canStep: !capped && stepCost !== null,
      canMax: affordable > floor,
      hint: empty
        ? 'Your roster sets a level every character you own is carried to. It starts working as soon as there is a roster to set it.'
        : capped
          ? `Your ${PARTY_SIZE}th-highest character is at its rarity’s level cap. Ascend somebody — or level a sixth character past them — to raise this further.`
          : owned <= PARTY_SIZE
            ? `Raising this costs nothing you would not have spent anyway: with ${PARTY_SIZE} or fewer characters everybody already stands above the floor.`
            : `Ascension is never carried. A character’s own rarity still caps how much of this it collects, and this roster tops out at ${ceiling}.`,
    };
  });

  /** The last refusal, cleared as soon as anything succeeds. */
  protected readonly message = signal<string | null>(null);

  protected readonly summary = computed(() => {
    const total = this.entries().length;
    const crewed = this.roster.crewedCount();
    // A count of characters rather than of slots, and the wording says so: with eight crews the
    // slot total runs to forty, which against a roster of forty-nine reads as a percentage of
    // nothing meaningful. "How much of my bench is doing something" is the question this answers.
    return `${total} ${total === 1 ? 'character' : 'characters'} · ${crewed} standing in a crew`;
  });

  /** How many crews a character is standing for, in words, for the row's meta line. */
  protected crewLabel(count: number): string {
    if (count === 0) {
      return 'Not in a crew';
    }
    return `In ${count} ${count === 1 ? 'crew' : 'crews'}`;
  }

  /** Raises the shared level by one. */
  protected resonateOnce(): void {
    this.report(this.roster.resonateOnce());
  }

  /** Raises the shared level as far as the wallet reaches, all at once or not at all. */
  protected resonateMax(): void {
    this.report(this.roster.resonateMax());
  }

  private report(result: RosterResult): void {
    this.message.set(result.ok ? null : (FAILURE_MESSAGES[result.reason] ?? 'That did not work.'));
  }
}
