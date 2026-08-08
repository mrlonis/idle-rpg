import { type LineupSummary } from '../core';
import { COMBAT, factionName } from './content';

/**
 * The lineup bonus, in words.
 *
 * Pure, and separate from the component for the reason `roster-order.ts` is separate from
 * `RosterService`: it can then be tested against a plain {@link LineupSummary} rather than through
 * a screen that owns routing and the game loop. Nothing here touches Angular.
 *
 * It lived inside the roster screen until milestone 15a and moved with the formation editor, which
 * is now the only screen that draws it — a bonus is a property of a **crew**, and the roster screen
 * stopped being where a crew is assembled.
 */

/**
 * The three factions the lineup rules name, read off the parsed rules rather than spelled out.
 *
 * Copy is decided here; *which faction* is content, and a screen that hard-coded "Angels" would
 * keep saying it after the wildcard moved. Naming them from the rules is what keeps the panel's
 * words and the simulation's behaviour the same statement.
 */
const WILDCARD_FACTION = COMBAT.lineup.wildcard;
const RALLY_FACTION = COMBAT.lineup.rally.faction;
const LADDER_FACTION = COMBAT.lineup.ladder.faction;

/** The smallest composition that pays anything, for the "nothing yet" hint. */
const SMALLEST_RUNG = Math.min(...COMBAT.lineup.tiers.map((tier) => tier.largest));

/**
 * Three parts, because the panel answers three questions in the order a player asks them: what
 * shape am I fielding, what is it worth, and what would be worth more. The last one is the point
 * of the panel — a bonus with no visible next rung is a number rather than a decision.
 */
export interface LineupPanel {
  /**
   * Who is actually standing, among the factions doing something: "Dwarves ×3 · Elves ×2".
   *
   * **Real counts, never the rung's.** The two differ whenever a wildcard stood in for somebody,
   * and the flat tracks pay on real members — so this is the line that has to agree with the
   * effects beside it. Each faction appears at most once however many tracks it is feeding.
   */
  readonly shape: string;
  /** Every stat the bonus moves, already formatted. Empty when the crew qualified for nothing. */
  readonly effects: readonly string[];
  /** What to do about it — and what the rung counted the crew as, when that differs. */
  readonly hint: string;
}

/**
 * What a crew's faction composition is worth, as copy.
 *
 * The numbers come from `core/` — the same call the simulation makes — and only the wording is
 * decided here. A screen that recomputed the ladder would eventually promise something a battle did
 * not pay, which is the one failure a bonus meant to provoke a rebuild cannot afford.
 */
export function lineupPanel(summary: LineupSummary): LineupPanel {
  const { bonus, tier, counts } = summary;
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
  // irregular — a count of one would read "1 Monsters", and deriving "Monster" from "Monsters" is
  // a rule that works until it meets "Undead". The multiplication sign also announces as "times"
  // rather than being skipped, so the line reads correctly aloud as well.
  const label = (faction: string, count: number): string => `${factionName(faction)} ×${count}`;
  const standing = (faction: string): number =>
    counts.find((entry) => entry.faction === faction)?.count ?? 0;

  // **The line reports what is standing, never what a rung counted it as**, and the two are
  // genuinely different numbers: a rung counts a wildcard as the faction it replaced, while both
  // flat tracks only ever count real members. Three Demons and two Angels reach a mono five and pay
  // three rungs of the Demon track — so a line saying "Demons ×5" beside those effects would invite
  // the player to hunt for two rungs that were never earned. The rung is a derived claim about the
  // crew, so it goes in the hint underneath as one.
  //
  // Building it from real counts is also what makes duplication impossible rather than merely
  // guarded against. A faction can be a rung's second half *and* a flat track at the same time —
  // three Humans and two Monsters is both — and a version of this that appended each source in turn
  // named Monsters twice, which reads as a party of seven.
  const contributors: string[] = [];
  const name = (faction: string): void => {
    if (standing(faction) > 0 && !contributors.includes(faction)) {
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
          ...(tier.count > standing(tier.faction) ? [label(tier.faction, tier.count)] : []),
          ...(tier.secondFaction !== null && tier.secondCount > standing(tier.secondFaction)
            ? [label(tier.secondFaction, tier.secondCount)]
            : []),
        ];

  return {
    shape:
      contributors.length > 0
        ? contributors.map((faction) => label(faction, standing(faction))).join(' · ')
        : 'No faction bonus yet',
    effects,
    hint:
      rung.length > 0
        ? `Counts as ${rung.join(' and ')} — ${factionName(WILDCARD_FACTION)} fill a gap in any line-up.`
        : tier === null
          ? `Field ${SMALLEST_RUNG} of one faction for a bonus. ${factionName(WILDCARD_FACTION)} count as any faction.`
          : `${factionName(WILDCARD_FACTION)} count as any faction, so they fill a gap in any line-up.`,
  };
}
