import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BACK_ROW_SIZE,
  FRONT_ROW_SIZE,
  PARTY_SIZE,
  type RosterFailure,
  type RosterResult,
  type Row,
} from '../core';
import { COMBAT, factionName } from './content';
import { formatAmounts } from './format-numeric';
import { type ScreenId } from './navigation';
import { type RosterEntryView, RosterService } from './roster.service';

/**
 * The three factions the lineup rules name, read off the parsed rules rather than spelled out.
 *
 * Copy is decided in this file; *which faction* is content, and a screen that hard-coded "Angels"
 * would keep saying it after the wildcard moved. Naming them here is what keeps the panel's words
 * and the simulation's behaviour the same statement.
 */
const WILDCARD_FACTION = COMBAT.lineup.wildcard;
const RALLY_FACTION = COMBAT.lineup.rally.faction;
const LADDER_FACTION = COMBAT.lineup.ladder.faction;

/** The smallest composition that pays anything, for the "nothing yet" hint. */
const SMALLEST_RUNG = Math.min(...COMBAT.lineup.tiers.map((tier) => tier.largest));

/** Why a formation change was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'row-full': `Both rows are full — ${FRONT_ROW_SIZE} in front, ${BACK_ROW_SIZE} behind. Bench somebody first.`,
  'not-owned': 'You do not own that character.',
  'duplicate-party-member': 'That character is already in your formation.',
  'unknown-character': 'That character is no longer available.',
  'insufficient-currency': 'Not enough gold, XP or essence to raise the shared level.',
  'level-capped': `Your ${PARTY_SIZE}th-highest character is at its level cap. Ascend somebody to raise the shared level further.`,
};

/** What the next tap on a row's control will do. */
interface PlacementAction {
  readonly label: string;
  /** Spelled out for assistive technology, because the visible label repeats down the list. */
  readonly description: string;
}

/**
 * The lineup bonus, in words.
 *
 * Three parts because the panel answers three questions in the order a player asks them: what
 * shape am I fielding, what is it worth, and what would be worth more. The last one is the point
 * of the panel — a bonus with no visible next rung is a number rather than a decision.
 */
interface LineupPanel {
  /**
   * Who is actually fielded, among the factions doing something: "Dwarves ×3 · Elves ×2".
   *
   * **Real counts, never the rung's.** The two differ whenever a wildcard stood in for somebody,
   * and the flat tracks pay on real members — so this is the line that has to agree with the
   * effects beside it. Each faction appears at most once however many tracks it is feeding.
   */
  readonly shape: string;
  /** Every stat the bonus moves, already formatted. Empty when the party qualified for nothing. */
  readonly effects: readonly string[];
  /** What to do about it — and what the rung counted the party as, when that differs. */
  readonly hint: string;
}

/**
 * The shared level, in words.
 *
 * Same split as {@link LineupPanel}: the numbers are resolved in the service through `core/`, and
 * only the wording is decided here. The panel answers the three questions in the order a player
 * asks them — what level is everybody at, who is holding it there, and what does the next one
 * cost.
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
 * The roster: everyone owned, and where they are standing.
 *
 * Placement is one control per row that **cycles** front → back → benched rather than three
 * buttons or a drag-and-drop board. Two rows of two and three is a small enough space that
 * cycling reaches every state in at most two taps, and a drag target is the worst possible
 * control on a phone — this whole screen is a list, and a list is a thing you tap.
 *
 * Which row a character stands in is entirely the player's call. Nothing here consults a
 * character's role: role-locking would let an unlucky roster reach a state with no legal
 * formation, and a bad front row is a far better failure than no front row.
 *
 * The list is **grouped by faction under fixed headings**, with the fielded party pinned above
 * them as a group of its own. Faction is the axis the whole ascension system turns on — a
 * mortal rung is paid in faction-mates — so "how deep is my Dwarf bench" is a question the
 * screen should answer by being scrolled, not by being read. Every faction keeps its heading
 * even when nothing is under it, because a fixed shape is something a player can learn the
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
  protected readonly openSlots = this.roster.openSlots;
  protected readonly resonance = this.roster.resonance;

  /**
   * What this screen calls itself on links out to a character sheet. The roster is also where a
   * sheet with no origin at all falls back to, but the link says so anyway: every link into a
   * sheet naming its own screen is one rule, and a rule with an exception in it is not learnt.
   */
  protected readonly screenId: ScreenId = 'roster';

  /** The two ranks, front first, for the formation panel above the list. */
  protected readonly ranks = computed(() => [
    {
      row: 'front' as const,
      label: 'Front row',
      capacity: FRONT_ROW_SIZE,
      hint: 'Attacks come here first. +5% defence, +0.05 crit damage resistance.',
      members: this.roster.frontRow(),
    },
    {
      row: 'back' as const,
      label: 'Back row',
      capacity: BACK_ROW_SIZE,
      hint: 'Shielded while the front row holds. +5% attack, +0.05 crit damage.',
      members: this.roster.backRow(),
    },
  ]);

  /**
   * The list, as headings and their rows: the party first, then one section per faction.
   *
   * The wording of an empty section is decided here rather than in the service, because it is
   * copy. What the service supplies is the fact behind it — how many of that faction are owned
   * — so a group emptied by fielding everybody says so instead of claiming you own none.
   */
  protected readonly sections = computed<readonly RosterSection[]>(() => [
    {
      id: 'fielded',
      // Not "Formation": the panel above already owns that heading, and two level-2 headings
      // whose names differ by a preposition are indistinguishable to anyone navigating by
      // heading. "Fielded" is the word the summary line at the top of the screen already uses.
      label: 'Fielded',
      members: this.roster.fielded(),
      empty: 'Nobody is fielded. Field somebody from a faction below.',
    },
    ...this.roster.benchGroups().map((group) => ({
      id: group.factionId,
      label: group.label,
      members: group.members,
      empty: group.owned === 0 ? 'None owned yet.' : 'Everyone you own is fielded.',
    })),
  ]);

  /**
   * What the fielded party's faction composition is worth, as copy.
   *
   * The numbers come from `core/` through the service — the same call the simulation makes — and
   * only the wording is decided here. A screen that recomputed the ladder would eventually
   * promise something a battle did not pay, which is the one failure a bonus meant to provoke a
   * rebuild cannot afford.
   */
  protected readonly lineup = computed<LineupPanel>(() => {
    const { bonus, tier, counts } = this.roster.lineup();
    const percent = (value: number): string => `${Math.round(value * 100)}%`;

    // Fixed order rather than the order the tracks resolved in, so the panel reads the same way
    // every time and a player can learn where to look for the stat they care about.
    const effects = [
      bonus.attack > 0 ? `+${percent(bonus.attack)} attack` : null,
      bonus.health > 0 ? `+${percent(bonus.health)} health` : null,
      bonus.defence > 0 ? `+${percent(bonus.defence)} defence` : null,
      bonus.critChance > 0 ? `+${percent(bonus.critChance)} crit rating` : null,
      bonus.critDamageAmp > 0 ? `+${percent(bonus.critDamageAmp)} crit damage` : null,
      bonus.haste > 0 ? `+${bonus.haste} haste` : null,
      bonus.injuredEnergyRegen > 0
        ? `+${percent(bonus.injuredEnergyRegen)} energy recovery while hurt`
        : null,
    ].filter((effect): effect is string => effect !== null);

    // "Dwarves ×3" rather than "3 Dwarves", because the authored faction names are plural and
    // irregular — a count of one would read "1 Monsters", and deriving "Monster" from "Monsters"
    // is a rule that works until it meets "Undead". The multiplication sign also announces as
    // "times" rather than being skipped, so the line reads correctly aloud as well.
    const label = (faction: string, count: number): string => `${factionName(faction)} ×${count}`;
    const fielded = (faction: string): number =>
      counts.find((entry) => entry.faction === faction)?.count ?? 0;

    // **The line reports what was fielded, never what a rung counted it as**, and the two are
    // genuinely different numbers: a rung counts a wildcard as the faction it replaced, while both
    // flat tracks only ever count real members. Three Demons and two Angels reach a mono five and
    // pay three rungs of the Demon track — so a line saying "Demons ×5" beside those effects would
    // invite the player to hunt for two rungs that were never earned. The rung is a derived claim
    // about the party, so it goes in the hint underneath as one.
    //
    // Building it from real counts is also what makes duplication impossible rather than merely
    // guarded against. A faction can be a rung's second half *and* a flat track at the same time —
    // three Humans and two Monsters is both — and a version of this that appended each source in
    // turn named Monsters twice, which reads as a party of seven.
    const contributors: string[] = [];
    const name = (faction: string): void => {
      if (fielded(faction) > 0 && !contributors.includes(faction)) {
        contributors.push(faction);
      }
    };
    if (tier !== null) {
      name(tier.faction);
      if (tier.secondFaction !== null) {
        name(tier.secondFaction);
      }
      // Whatever the wildcards were standing in for, they are why the rung was reached.
      name(WILDCARD_FACTION);
    }
    // Named even without a rung: one Demon pays +30% defence and reaches nothing, and an effect a
    // player cannot attribute to anybody is one they cannot go and get more of.
    name(RALLY_FACTION);
    name(LADDER_FACTION);

    // Only worth saying when the rung and the roll-call disagree, which is exactly when wildcards
    // were spent. Saying it unconditionally would put "counts as Humans ×5" under "Humans ×5".
    const rung: string[] =
      tier === null
        ? []
        : [
            ...(tier.count > fielded(tier.faction) ? [label(tier.faction, tier.count)] : []),
            ...(tier.secondFaction !== null && tier.secondCount > fielded(tier.secondFaction)
              ? [label(tier.secondFaction, tier.secondCount)]
              : []),
          ];

    return {
      shape:
        contributors.length > 0
          ? contributors.map((faction) => label(faction, fielded(faction))).join(' · ')
          : 'No faction bonus yet',
      effects,
      hint:
        rung.length > 0
          ? `Counts as ${rung.join(' and ')} — ${factionName(WILDCARD_FACTION)} fill a gap in any line-up.`
          : tier === null
            ? `Field ${SMALLEST_RUNG} of one faction for a bonus. ${factionName(WILDCARD_FACTION)} count as any faction.`
            : `${factionName(WILDCARD_FACTION)} count as any faction, so they fill a gap in any line-up.`,
    };
  });

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
    const fielded = this.roster.fieldedCount();
    return `${fielded} of ${this.partySize} fielded · ${total} ${total === 1 ? 'character' : 'characters'} owned`;
  });

  /** Where a character stands, in words, for the row's meta line. */
  protected placementLabel(row: Row | null, slot: number | null): string {
    if (row === null) {
      return 'Benched';
    }
    return `${row === 'front' ? 'Front' : 'Back'} ${slot ?? 1}`;
  }

  /**
   * What the next tap does, given where the character is now and what room is left.
   *
   * Computed rather than hard-coded so the button never promises something the cycle will not
   * do: with a full back row, a front-row character's next tap benches it, and the label says
   * so.
   */
  protected nextAction(row: Row | null, name: string): PlacementAction {
    const open = this.openSlots();
    if (row === 'front') {
      return open.back > 0
        ? { label: 'To back', description: `Move ${name} to the back row` }
        : { label: 'Bench', description: `Bench ${name}` };
    }
    if (row === 'back') {
      return { label: 'Bench', description: `Bench ${name}` };
    }
    if (open.front > 0) {
      return { label: 'To front', description: `Field ${name} in the front row` };
    }
    if (open.back > 0) {
      return { label: 'To back', description: `Field ${name} in the back row` };
    }
    return { label: 'Field', description: `Field ${name} — both rows are full` };
  }

  protected cycle(defId: string): void {
    this.report(this.roster.cyclePlacement(defId));
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
