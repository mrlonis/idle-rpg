/**
 * Achievement tracks: what the run is paid for having already done.
 *
 * `core/achievements.ts` is where these are evaluated. What lives here is the content — a counter,
 * an interval, and a price — which is the same division `chapters.ts` makes with the reward curve.
 *
 * ## Why a track is endless
 *
 * A track pays every `every`th unit of its counter, forever, rather than being a list of authored
 * rows that stops somewhere. The ladder is a hundred stages today and shaped for thousands, so a
 * bounded list would either run out or become the per-stage authoring problem milestone 11 spent
 * a milestone removing. One rule means the same thing at stage 5 and at stage 5,000.
 *
 * ## What these are measured against
 *
 * A pull costs a flat 100 (`PULL_COST`), so an award reads directly as pulls: the stage track pays
 * **ten** and a chapter pays **a hundred**. Over the shipped ladder that is 20,000 crystals from
 * the stage track and 20,000 from the chapter one, against the 29,000 the ladder's first clears
 * pay — so achievements are now **more than half** of what climbing is worth in crystals, where
 * they used to be a rounding error on it.
 *
 * ⚠️ **That shift is the other half of one decision and does not read as sane on its own.**
 * `chapters.ts` flattened the first-clear payout from "200 rising 6 a stage" to a flat 250, which
 * took the ladder's first-clear crystals from about 58,800 down to 29,000. These tracks are where
 * that came back, and the whole came out at roughly 69,000 against the old 63,800 — a few percent
 * more in total, redistributed hard toward the early game. Retuning either half in isolation is
 * how the pacing quietly moves; `achievements.spec.ts` measures the sum for that reason.
 *
 * ## Why every award is flat
 *
 * Neither track scales with how far the run has come, and since the flattening neither does the
 * first-clear payout — so nothing in the crystal economy is linear in the stage index any more,
 * and the whole of it prices against a `PULL_COST` that never moves. A reward that scaled would
 * pay most to the player whose ladder is already moving, which is the opposite of what these exist
 * for: **a flat award is worth most exactly when a run has fewest crystals.**
 *
 * ## Why these are not stage-gated in the way everything else is
 *
 * A player walled below a stage has one income source and it is the thing the wall is throttling.
 * These pay on the clears already banked, so being stuck stops meaning being stopped — which
 * matters more in a game with no way to buy a way past.
 */

/**
 * The tracks this build ships.
 *
 * **Stage Climber** pays every five clears. Five is short enough that the first award lands inside
 * the opening tutorial run — the stretch before the stage-7 healer lock — so the screen has
 * something on it the first time a player finds it rather than being an empty promise, and 1,000
 * crystals is ten pulls at exactly the point a run is trying to fill three empty formation slots.
 *
 * **Chapter Conqueror** pays for finishing a chapter, and it is the ladder's big punctuation: a
 * hundred pulls, arriving on the same fight as the chapter boss. It is what makes a chapter a
 * thing a player finishes rather than a stretch they pass through, and it is deliberately the
 * largest single payout in the game.
 *
 * ⚠️ **Its counter is `clearedChapters`, which is derived rather than stored, and it may not be
 * re-authored as `every: 50` over `clearedStages`.** Chapters are fifty stages through chapter 10
 * and sixty from chapter 11 — see `CHAPTER_CURVE` — so a fixed stage interval drifts off the
 * chapter boundary the moment the band steps, and pays a "chapter" award ten stages into the next
 * one. `core/achievements.ts` carries the argument in full.
 */
export const ACHIEVEMENTS = [
  {
    id: 'stages-cleared',
    name: 'Stage Climber',
    description: 'Crystals for every five stages cleared, for as long as the ladder lasts.',
    counter: 'clearedStages',
    every: 5,
    reward: { summons: 1000 },
  },
  {
    id: 'chapters-cleared',
    name: 'Chapter Conqueror',
    description: 'Crystals for every chapter finished, however long that chapter runs.',
    counter: 'clearedChapters',
    every: 1,
    reward: { summons: 10_000 },
  },
] as const;
