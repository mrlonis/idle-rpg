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
 *
 * ## The two tower tracks, and why there are two per tower rather than two for all seven
 *
 * **Spire Climber** is the tower's version of Stage Climber: 500 crystals every five floors, which
 * over a hundred floors is 10,000 — a little under what the floors themselves pay, so the rhythm of
 * the climb and the climb are worth about the same.
 *
 * **Spire Conqueror** is the completion award, and ⚠️ **it needs no new mechanism**: a track with
 * `every: 100` over a hundred-floor counter pays exactly once, so "finish the tower" is an interval
 * like any other. That is the whole reason towers added no concept to this file.
 *
 * ⚠️ **A tower counter names its tower, so a track is per tower and cannot be shared.** Summing the
 * seven would make the completion award payable by climbing a hundred floors spread over seven
 * towers, which is the opposite of what it is for — and it would make the five-floor track pay for
 * breadth twice, once here and once through the towers being crewable at all.
 *
 * ⚠️ **Every tower's pair is worth the same, and that is deliberate.** A tower is optional content
 * gated behind roster depth; paying more for one faction than another would make the banner's luck
 * decide which optional ladder is worth climbing. `towers.spec.ts` derives that from the shipped
 * tracks rather than trusting this paragraph, and it also holds the tie between topping a tower and
 * finishing a chapter — both pay 10,000, because a hundred floors and a fifty-stage chapter are
 * comparable events.
 *
 * ⚠️ **The fourteen tower tracks share two names between them, and an `id` is what tells them
 * apart.** Every Spire Climber is called Spire Climber; what says *which* spire is the `tower`
 * field, and the achievements screen reads the tower's own name off `TOWERS` rather than off the
 * track. Renaming them per faction would put the faction in two places and let them disagree.
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
    description: 'Crystals and emblems for every chapter finished, however long that chapter runs.',
    counter: 'clearedChapters',
    every: 1,
    // The one track paying two currencies, and it is the right one to: finishing a chapter is
    // already what turns the emblem idle rate up a step, so paying a lump of them here is the same
    // event saying the same thing twice rather than a second mechanism. 100 is a tenth of a
    // signature item's 996 — enough to be worth the moment, nowhere near enough to skip the climb.
    //
    // ⚠️ Flat, like every achievement award. The reasoning that keeps the others in crystals holds
    // for emblems too: both price against flat costs — a pull is 100 forever and a signature level
    // is a fixed number forever — so a flat award stays worth the same at every point in a run.
    reward: { summons: 10_000, emblem: 100 },
  },
  {
    id: 'signature-levels',
    name: 'Signature Bearer',
    description: 'Crystals for every five signature item levels bought, across your whole roster.',
    counter: 'signatureLevels',
    every: 5,
    // ⚠️ Pays **crystals**, not emblems. An emblem award on an emblem-spending track is a partial
    // refund — it would make the last levels cheaper than the first and quietly flatten the cost
    // curve `data/signature.ts` is careful to keep linear. Crystals are the currency with no claim
    // on this track at all, which is exactly why they are the right reward for it.
    reward: { summons: 2000 },
  },
  {
    id: 'signature-mastered',
    name: 'Signature Master',
    description: 'Crystals for every signature item taken to its highest level.',
    counter: 'signatureLevels',
    // One award per 30 levels — a maxed item's worth. ⚠️ Not the same as "one item maxed": a run
    // holding two items at level 15 collects this too. That is deliberate rather than sloppy,
    // because the alternative needs a per-character counter, and the only honest thing this track
    // can measure without one is **total investment**, which is what it is named for.
    every: 30,
    reward: { summons: 15_000 },
  },
  {
    id: 'tower-human-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Human Tower.',
    counter: 'towerFloors',
    tower: 'tower-human',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-human-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Human Tower.',
    counter: 'towerFloors',
    tower: 'tower-human',
    // ⚠️ **A hundred floors, which stopped being the tower's whole height in milestone 21e and is
    // still the interval.** The towers doubled to two hundred, so this now pays **twice** — and
    // re-authoring it as `every: 200` to keep "conquering a spire" a single event was declined,
    // because it strips 70,000 crystals from the tower side and drops the tower:campaign ratio under
    // its own floor. The tie with a chapter's completion award always rested on "a hundred floors
    // and a fifty-stage chapter are comparable events", so it is stated per unit and the number did
    // not move. `towers.spec.ts` checks both halves: this equals the unit, and the tower is a whole
    // number of them. Authored one short it would pay three times; one long, never.
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-dwarf-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Dwarf Tower.',
    counter: 'towerFloors',
    tower: 'tower-dwarf',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-dwarf-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Dwarf Tower.',
    counter: 'towerFloors',
    tower: 'tower-dwarf',
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-elf-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Elf Tower.',
    counter: 'towerFloors',
    tower: 'tower-elf',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-elf-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Elf Tower.',
    counter: 'towerFloors',
    tower: 'tower-elf',
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-undead-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Undead Tower.',
    counter: 'towerFloors',
    tower: 'tower-undead',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-undead-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Undead Tower.',
    counter: 'towerFloors',
    tower: 'tower-undead',
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-monster-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Monster Tower.',
    counter: 'towerFloors',
    tower: 'tower-monster',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-monster-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Monster Tower.',
    counter: 'towerFloors',
    tower: 'tower-monster',
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-angel-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Angel Tower.',
    counter: 'towerFloors',
    tower: 'tower-angel',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-angel-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Angel Tower.',
    counter: 'towerFloors',
    tower: 'tower-angel',
    every: 100,
    reward: { summons: 10_000 },
  },
  {
    id: 'tower-demon-floors',
    name: 'Spire Climber',
    description: 'Crystals for every five floors of the Demon Tower.',
    counter: 'towerFloors',
    tower: 'tower-demon',
    every: 5,
    reward: { summons: 500 },
  },
  {
    id: 'tower-demon-cleared',
    name: 'Spire Conqueror',
    description: 'Crystals for every hundred floors of the Demon Tower.',
    counter: 'towerFloors',
    tower: 'tower-demon',
    every: 100,
    reward: { summons: 10_000 },
  },
] as const;
