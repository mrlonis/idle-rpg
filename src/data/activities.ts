/**
 * The activities this build ships: everything a run can send a crew at.
 *
 * `core/activity.ts` is where these are evaluated — the faction lock, the crew lookup — and this
 * is the content, which is the same division `chapters.ts` makes with the reward curve.
 *
 * ## Why the campaign is authored here rather than assumed
 *
 * It would be shorter to treat the campaign as implicit and list only the towers. It would also
 * put the campaign on a different footing from everything else, and the whole point of milestone
 * 15a is that the game stops having one thing to fight: the formations screen lists activities,
 * the battle path takes an activity, and a campaign that were not one would need a special case in
 * each. One row costs nothing and the special cases cost a screen each.
 *
 * ⚠️ **An `id` is a save key and is permanent once shipped.** It is what a crew is filed under in
 * `GameState.formations`, so renaming one silently disbands the party standing in it — the save
 * layer keeps the orphaned key rather than dropping it, but nothing will ever look at it again.
 * Change the `name` freely; never the `id`.
 *
 * **The seven faction towers are milestone 15b and 15c and are deliberately absent.** A locked
 * door with nothing behind it is the thing the Bag rename argued against: the second heading
 * arrives with the second kind of item. Adding a tower here is one row plus the ladder it points
 * at.
 */
export const ACTIVITIES = [
  {
    id: 'campaign',
    name: 'Campaign',
    kind: 'campaign',
  },
] as const;
