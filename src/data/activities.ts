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
 * **One of the seven faction towers ships; six are milestone 15c.** A locked door with nothing
 * behind it is the thing the Bag rename argued against — the second heading arrives with the second
 * kind of item — so a tower appears here on the day its hundred floors do. Adding one is this row
 * plus an entry in [`towers.ts`](./towers.ts), and the two `id`s must agree:
 * [`towers.spec.ts`](./towers.spec.ts) is what makes a mismatch a failing test rather than a tower
 * with no crew or a crew with no tower.
 */
export const ACTIVITIES = [
  {
    id: 'campaign',
    name: 'Campaign',
    kind: 'campaign',
  },
  {
    // The faction lock is the whole of what a tower asks for. It filters the crew editor's pool
    // rather than refusing a tap — `partyMeetsLock` in `core/activity.ts` is called by the editor
    // *and* by the battle path, because two implementations of one rule is how a screen ends up
    // promising a legal crew that the fight then refuses.
    id: 'tower-human',
    name: 'Human Tower',
    kind: 'tower',
    faction: 'human',
  },
] as const;
