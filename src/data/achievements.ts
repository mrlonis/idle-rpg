/**
 * Achievement tracks: what the run is paid for having already done.
 *
 * `core/achievements.ts` is where these are evaluated. What lives here is the content — a counter,
 * an interval, and a price — which is the same division `chapters.ts` makes with the reward curve.
 *
 * ## Why one track, and why it is endless
 *
 * A track pays every `every`th unit of its counter, forever, rather than being a list of authored
 * rows that stops somewhere. The ladder is a hundred stages today and shaped for thousands, so a
 * bounded list would either run out or become the per-stage authoring problem milestone 11 spent
 * a milestone removing. One rule means the same thing at stage 5 and at stage 5,000.
 *
 * ## What 250 crystals is measured against
 *
 * A pull costs 100 (`PULL_COST`), so an award is two and a half pulls and the shipped hundred
 * stages pay twenty of them — 5,000 crystals, or fifty pulls. Against the ~58,800 crystals the
 * ladder's first clears already pay over the same stretch that is a **top-up of roughly 8%**,
 * which is the size it should be: this is a second faucet on progress the player was making
 * anyway, not a second income curve.
 *
 * ⚠️ **It is deliberately flat rather than scaling with the stage index.** The first-clear crystal
 * payout is already linear in how far the run has come, so a second linear reward on the same
 * counter would be that curve counted twice — and a track that paid more later would make the
 * early game, where a player is actually short of crystals, the part it helps least. A flat award
 * is worth most exactly when a run has fewest of them.
 *
 * ## Why it is not stage-gated in the way everything else is
 *
 * The retention argument in the milestone notes undersells this. A player walled below a stage has
 * one income source and it is the thing the wall is throttling. This pays on the clears already
 * banked, so being stuck stops meaning being stopped — which matters more in a game with no way to
 * buy a way past.
 */

/**
 * How many stage clears one award costs, and what it pays.
 *
 * Five is short enough that the first award lands inside the opening tutorial run — the stretch
 * before the stage-7 healer lock — so the screen has something on it the first time a player finds
 * it rather than being an empty promise.
 */
export const ACHIEVEMENTS = [
  {
    id: 'stages-cleared',
    name: 'Stage Climber',
    description: 'Crystals for every five stages cleared, for as long as the ladder lasts.',
    counter: 'clearedStages',
    every: 5,
    reward: { summons: 250 },
  },
] as const;
