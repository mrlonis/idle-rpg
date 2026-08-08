import { CAMPAIGN_FORMATION, formationIn, type FormationBook, type PartyFormation } from './state';

/**
 * Activities: the things a run can fight, and the crew each one keeps.
 *
 * Milestone 15a exists because the game is about to have more than one of these. Until it, "the
 * formation" was unambiguous — there was one thing to fight, so there was one party. Faction
 * towers make that eight, and this module is the vocabulary that lets the rest of the codebase
 * name *which* one it means.
 *
 * ## What an activity is, and what it deliberately is not
 *
 * An activity is a **place a crew stands**, keyed into {@link FormationBook}. It is not a ladder,
 * not a screen and not a reward table — the campaign's ladder lives in `core/ladder.ts` and a
 * tower's will live beside it. Keeping the two apart is what lets an activity be authored in
 * `data/` as five short fields while the content it points at stays wherever it already lives.
 *
 * ## Why the faction lock is a rule here rather than a check in `ui/`
 *
 * A tower restricts its crew to one faction, and that restriction has to be enforced in the
 * formation editor **and** honoured at battle time. Two implementations of one rule is how a
 * screen ends up promising a legal party that the fight then refuses — the same failure the
 * lineup bonus avoids by having `ui/` call the simulation's own `lineupBonus`. So the rule is one
 * function, here, and both callers use it.
 *
 * ⚠️ **The lock is a filter on *who may stand*, never a requirement that the crew be full.** A
 * player mid-reshuffle is entitled to an empty tower crew, and a party of nobody resolves as a
 * defeat rather than as an error — exactly as it does for the campaign. {@link partyMeetsLock}
 * therefore passes an empty formation; what refuses an empty crew is the Fight control, which
 * already refuses one for the campaign.
 */

/** What kind of content an activity points at. */
export type ActivityKind = 'campaign' | 'tower';

/**
 * One activity, as `data/` authors it.
 *
 * `id` doubles as the {@link FormationBook} key, which is what keeps a crew attached to its
 * activity through a rename: the name on screen may change, the key may not.
 */
export interface ActivityData {
  /** The formation book key. Stable forever once a save has carried it. */
  readonly id: string;
  /** What the screen calls it. */
  readonly name: string;
  readonly kind: ActivityKind;
  /**
   * The faction every member of this activity's crew must belong to, or absent for no lock.
   *
   * A single faction id rather than a list, because the roadmap's demand is **per-faction depth**
   * — seven crews of five, from seven benches of seven. A lock naming two factions would let the
   * thinnest bench borrow from the deepest, which is the pressure towers exist to create.
   */
  readonly faction?: string;
}

/** The campaign, which is the one activity every build ships and the one with no lock. */
export const CAMPAIGN_ACTIVITY: ActivityData = {
  id: CAMPAIGN_FORMATION,
  name: 'Campaign',
  kind: 'campaign',
};

/**
 * Whether `faction` may stand in `activity`.
 *
 * An unlocked activity accepts anybody, so the campaign's answer is always yes.
 */
export function factionMeetsLock(activity: ActivityData, faction: string): boolean {
  return activity.faction === undefined || activity.faction === faction;
}

/**
 * Whether every character standing in `formation` is allowed to.
 *
 * Takes a faction resolver rather than a roster, because the only thing this needs of a character
 * is which faction it belongs to — and a resolver is what both callers already hold. An id that
 * resolves to nothing fails the lock rather than passing it: a crew naming a character the build
 * cannot identify is a crew that should be rebuilt, not one that gets the benefit of the doubt.
 */
export function partyMeetsLock(
  activity: ActivityData,
  formation: PartyFormation,
  factionOf: (defId: string) => string | undefined,
): boolean {
  if (activity.faction === undefined) {
    return true;
  }
  for (const defId of [...formation.front, ...formation.back]) {
    const faction = factionOf(defId);
    if (faction === undefined || !factionMeetsLock(activity, faction)) {
      return false;
    }
  }
  return true;
}

/**
 * The crew standing for `activity`.
 *
 * A one-line convenience over {@link formationIn}, and it earns its place by taking the activity
 * rather than its id: every call site that has an activity in hand is then unable to look up the
 * wrong crew by passing a stale string.
 */
export function crewFor(book: FormationBook, activity: ActivityData): PartyFormation {
  return formationIn(book, activity.id);
}
