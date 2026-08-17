import { TOWER_ANGEL } from './tower-angel';
import { TOWER_DEMON } from './tower-demon';
import { TOWER_DWARF } from './tower-dwarf';
import { TOWER_ELF } from './tower-elf';
import { TOWER_HUMAN } from './tower-human';
import { TOWER_MONSTER } from './tower-monster';
import { TOWER_UNDEAD } from './tower-undead';

/**
 * How every tower is shaped, and the towers this build ships.
 *
 * `core/towers.ts` is where all of this is evaluated — the level line, the mini-boss rhythm, the
 * level-matched payout, the one integer of progress. What lives here is the content and four
 * coefficients, which is the same division [`chapters.ts`](./chapters.ts) makes with the reward
 * curve.
 *
 * ## What a tower is for
 *
 * Not more difficulty — **more roster**. The campaign has never asked for more than five characters,
 * against a forty-nine character bench fed by a gacha generous enough to produce roughly 190 pulls a
 * day at post-ladder crystal rates. Seven towers of five, each locked to one faction, is demand for
 * thirty-five invested characters, so an unlucky pull becomes the answer to a tower instead of
 * fodder. See [history](../../docs/history.md) for the whole argument.
 *
 * ⚠️ **A tower is therefore skippable, never on the critical path, and never the only source of
 * anything.** It is a wall about *who you own* in a game with no way to buy a character, which is
 * precisely the failure role-locked formation slots were rejected for in milestone 4. What keeps it
 * safe is that nothing behind it is required.
 */

/**
 * One rule for all seven towers.
 *
 * ## Four hundred floors, levels 1 to 189
 *
 * **Inside the campaign's own range, deliberately.** The shipped ladder runs to level 605 over 1,210
 * stages and first reaches 189 at stage 378, so a tower's top floor is a fight the campaign asks for
 * about a third of the way along it. That is the whole statement about where difficulty lives: a
 * tower charges for roster *breadth*, and charging for investment as well would make it a second
 * campaign that a player behind on the first one cannot enter.
 *
 * ⚠️ **Watch that fraction rather than restating it.** The tower's level line is fixed between
 * extensions while the campaign's keeps growing, so the roof drifts back toward the *opening* of the
 * ladder with every chapter authored — it read 42% of the way along at the two-hundred-floor roof of
 * 95, 63% at the three-hundred-floor roof of 142 against a 450-stage ladder, and **31%** now, because
 * the campaign nearly tripled in length underneath it. It is the right direction for optional content
 * not to creep up the spine, but a roof landing in the first tenth of the campaign has stopped
 * charging for breadth at all, and that is the signal for the next extension.
 *
 * ⚠️ **{@link topLevel} is deliberately *not* a rarity cap, and the assertion that said it was is
 * gone.** A tower closes above the cap of the rung it asks for, because a rung is worth ×1.6 and the
 * enemy side has no rungs at all — so a crew standing at parity with content it out-ranks is not a
 * test. ⚠️ **The fourth hundred is where that stopped being expressible as a cap comparison**, and
 * the guard was restated rather than slid: `legendary` caps at **200** against a roof of 189, so for
 * the first time the top band's crew *could* legally out-level its own roof. What replaced it is the
 * quantity the cap comparison was standing in for — the **power ratio**, held at 1.60–1.80 across
 * every band. See `towers.spec.ts`.
 *
 * ## ⚠️ The bound on the roof is the campaign's own payout curve
 *
 * A floor's lump is read off the campaign **at the stage fighting at the same level**, so a roof that
 * out-levels the campaign stage of the tower's own height pays more per floor than the campaign pays
 * per stage. That is optional content displacing the spine, which is the one thing tower payouts may
 * never do. At four hundred floors the ceiling is the campaign's stage-400 lump of 16,000, and a roof
 * of 189 pays **15,120**. ⚠️ **This is now the binding constraint on the roof rather than a
 * comfortable margin**: a roof of **200 pays exactly 16,000** and fails outright, so the highest
 * legal roof at four hundred floors is 199 — and the solved slope's 189 is only ten levels under it.
 * A fifth hundred has to check this before anything else.
 *
 * ⚠️ **Do not "fix" a future extension by moving the roof up past that.** The bound is the campaign's
 * own level line and it moves whenever that does; `towers.spec.ts` checks the payout directly. The
 * index-based version of that guard was **retired** in 21e — it compared a campaign stage index
 * against a tower floor count, two different units that only ever agreed while the two ladders were a
 * similar length.
 *
 * ⚠️ **The crews are the other half and they do not derive from the caps ladder any more.** Dropping
 * the roof used to drop each crew's *rung* as well, because `towers.balance.ts` read the rung off
 * `caps.indexOf(level)` — costing the crews ×1.6 where the content only lost its levels, which put
 * **all seven roofs at 0%**. The rungs are pinned now and only the levels derive. See that file.
 *
 * ## ⚠️ Every extension so far has been a single straight line, and the retune keeps evaporating
 *
 * {@link floorLevel} draws **one line from floor 1**, so raising `floors` re-draws it underneath
 * content that already shipped. The move that has worked three times is to **solve for the top level
 * at which the new slope meets the old one**, which leaves the shipped floors almost exactly where
 * they were and makes the expected retune disappear:
 *
 * | Extension    | Floors    | topLevel  | New slope | Old slope | Shipped floors that move |
 * | ------------ | --------- | --------- | --------- | --------- | ------------------------ |
 * | 21e          | 100 → 200 | 60 → 120  | 0.5980    | 0.5960    | 10 of 700, by 1 level    |
 * | the flatten  | 200       | 120 → 95  | 0.4724    | 0.5980    | all of them — see above  |
 * | the third    | 200 → 300 | 95 → 142  | 0.4716    | 0.4724    | 17 of 200, by 1 level    |
 * | this one     | 300 → 400 | 142 → 189 | 0.4712    | 0.4716    | 18 of 300, by 1 level    |
 *
 * **189 is where the two slopes meet**, because 1 + 0.4716 × 399 = 189.16. Reach for that arithmetic
 * first on any future extension, then ask whether the roof it implies is a fight and whether its lump
 * stays under the campaign's.
 *
 * ⚠️ **The neighbouring levels are much worse and the penalty is not smooth**, so solve rather than
 * eyeball. Measured over the 300 shipped floors: 188 moves **132**, 190 moves **94**, 187 moves 206
 * and 191 moves 191, against 189's **18**. A round *slope* is the trap here — at three hundred floors
 * exactly 0.50 levels a floor wanted a roof of 150, which moved 172 of 200 shipped floors by up to 5
 * levels and landed its lump exactly on the campaign's payout; at four hundred it wants 200, which
 * moves **273 of 300 by up to 8 levels** and again lands exactly on the campaign's stage-400 lump of
 * 16,000, failing the one bound that may never be crossed.
 *
 * ⚠️ **Making {@link floorLevel} piecewise would preserve every shipped floor exactly**, and it has
 * been declined twice — by 21e and again here — because it is a `core/` change and a content session
 * may not take one. It stays the right answer if a future extension ever cannot be solved this way;
 * record it as a finding rather than reaching for it.
 *
 * ⚠️ **21e's roadmap prescribed 140 and a retune of all seven hundred shipped floors, and both
 * halves measured wrong.** At 140 the slope went 59/99 → 139/199 and **46 of the 700 shipped floors
 * fell below the 90% bar**, with six of seven roofs going from 100% to 0%. That is the failure mode
 * a solved slope avoids, and it is why the table above is kept.
 *
 * ## The rhythm is the campaign's
 *
 * Every tenth floor is a mini-boss and the last one is a boss. A player who has learnt that every
 * tenth fight is harder should not have to learn a second rhythm, and reusing the interval means a
 * fifty-floor tower and a two-hundred-floor one need no new authoring to have peaks.
 *
 * ## The crystals, and why the per-floor figure is not the campaign's
 *
 * 100 a floor against the campaign's 250, ×2 on a mini-boss and ×5 on the roof — so a four-hundred
 * floor tower pays **44,300** from floors alone, and **124,300** once its two achievement tracks are
 * counted. ⚠️ **At parity the seven towers would pay more than five times what the campaign's stage
 * clears do**, which makes the ladder's own rewards look pointless beside optional content. At 100 a
 * floor, seven towers of four hundred come to **310,100** from floors and **870,100** with both
 * tracks.
 *
 * ⚠️ **The ratio between those two totals used to be asserted and no longer is**, and recomputing it
 * by hand is the thing that replaced it. Measured: seven towers of four hundred pay **870,100**
 * against the 25-chapter campaign's **351,500** of first clears, a ratio of **2.475** — up from 1.40
 * at two hundred floors and 2.09 at three hundred. ⚠️ **The direction is the finding.** The retired
 * guard's *floor* was expected to fall as chapters shipped and its *ceiling* of 4 is the half that
 * would now be under pressure: the campaign tripled in stage count between the third hundred and this
 * one and its crystal total rose only 12%, because `firstClearSummons` is nearly flat per stage while
 * a tower's per-floor payout is not. **Optional content is now paying two and a half times the
 * spine**, which is the design question the retirement note said would have to be asked here rather
 * than answered by a threshold — asked, and left as it is, because a tower is gated behind roster
 * depth the campaign never asks for. The guard was a floor, and a floor on that
 * quantity was never stable: it falls by construction every time a chapter ships and rises in one
 * step every time the towers grow, so it had been slid or placeholdered five times — 2 → 1.5 → 1.3 →
 * 1.1 → 0.7 → 1.3 — and spent six of those sessions watching nothing. It was **retired rather than
 * slid a sixth time**, which is the call `docs/authoring.md` records for the absolute
 * hours-to-the-ceiling guard and the two that followed it: when the honest restatement of a guard is
 * a number you would refuse to author, the guard is pointed at the wrong quantity.
 *
 * ⚠️ **What that gives up is real and belongs here rather than in a commit message.** Nothing now
 * fails if a future session ships an eighth ladder or a fifth hundred and the towers quietly become
 * the run's main crystal income — and the fourth hundred is the session that found out what that
 * costs, because the ratio it had to recompute by hand is the highest it has ever been. The question
 * it was asking — *is seven towers still the right amount of optional content beside the campaign of
 * the day* — is a design question that a threshold was never going to answer, and it is asked here
 * instead. **Recompute the two totals when extending either side**; the arithmetic is a dozen lines
 * and `towers.spec.ts` no longer does it for you.
 *
 * Flat in the floor, for the reason every crystal payout in this game is flat: a pull costs a flat
 * `PULL_COST` forever, so anything scaling with how far a run has come pays most to the player who
 * needs it least. The two multipliers are the whole of the climb's rhythm.
 *
 * ⚠️ **`Spire Conqueror` stays `every: 100`**, so a four-hundred floor tower pays it **four times**.
 * The tie it holds with a chapter's completion award is stated as *per hundred floors* — which is the
 * argument the tie always rested on, that a hundred floors and a fifty-stage chapter are comparable
 * events. Re-authoring it to match the tower's height would strip 210,000 crystals from the tower
 * side and would have to be redone at every extension. No save migration either way: awards-taken is
 * an integer, and a player who topped the old height has taken 3 and earned 3.
 */
export const TOWER_BAND_UNIT = 100;

/**
 * The rung the balance crew for each hundred floors stands at, in climbing order.
 *
 * ## Why this is authored here rather than derived in the sweep
 *
 * `towers.balance.ts` used to read each crew's rung off the caps ladder — band 1 from
 * `caps.indexOf(halfwayFloorLevel)` and band 2 from the highest cap below the roof — which tied a
 * crew's **rung** to its level. ⚠️ **That is what broke when the campaign flattened and `topLevel`
 * came down with it**: both crews lost a whole rung (×1.6) where the content only lost its levels,
 * and all seven roofs measured 0%. The rungs are pinned now and only the levels derive.
 *
 * Pinned means authored, and authored means here — one list beside the height it has to keep up
 * with, rather than a pair of names inline in the sweep. A height bump that nobody wired a crew for
 * is then a failing test rather than a band swept by whichever crew happened to be last.
 *
 * Rarity **ids** rather than ladder indices, the same choice [`kits.ts`](./kits.ts) makes with
 * `unlocks` and for the same reason: `data/` may not import `core/`, and naming them lets
 * `towers.spec.ts` prove each one is a rung the ladder actually has.
 *
 * ## ⚠️ One rung per band, and the third is a stat step where the fourth is a kit step
 *
 * `KIT_RULES.unlocks` is `elite` / `legendary` / `ascended`, so **`elite-plus` hands over no new
 * skill** — band 3's crew is band 2's kit at ×1.6 and twenty-four more levels. ⚠️ **Band 4's crew is
 * the opposite and it is the largest single step any band boundary has**: `legendary` is a kit
 * unlock, so the band-4 five arrives with a **third skill** on top of its ×1.6 and its twenty-four
 * levels. The three-hundred-floor doc predicted exactly this — "nothing of that kind happens again
 * until `legendary`, which caps at 200 and is a *fourth* hundred's business" — and it is the reason
 * the fourth hundred's boards are authored heavier than the power ratio alone suggests: the ratio
 * counts the rung's ×1.6 and cannot count a skill.
 *
 * ⚠️ **`legendary`'s cap of 200 is also where the roof-above-the-cap guard stopped working**, because
 * it is the first band rung whose cap the roof does not reach. See {@link TOWER_RULES} and
 * `towers.spec.ts`; the ratio is what the comparison was standing in for.
 */
export const TOWER_BAND_RUNGS = ['rare-plus', 'elite', 'elite-plus', 'legendary'] as const;

export const TOWER_RULES = {
  floors: 400,
  baseLevel: 1,
  topLevel: 189,
  /** The campaign's interval, reused. See {@link CHAPTER_CURVE}. */
  miniBossEvery: 10,
  floorSummons: {
    base: 100,
    miniBossMultiplier: 2,
    bossMultiplier: 5,
  },
  /**
   * The gear ramp, over the fourth hundred only.
   *
   * ## ⚠️ Why the ramp starts at a floor rather than at floor 1
   *
   * The first three hundred floors of all seven towers were authored and swept **naked**, and they
   * stay naked. `fromFloor` 301 is what lets a geared hundred land without re-pricing the two
   * thousand one hundred floors underneath it — a ramp from floor 1 would be a retune of every
   * shipped tower board in the game, which is exactly the "its own retune" the `StageEncounterData`
   * doc comment warned about.
   *
   * ## ⚠️ A tower cannot inherit the campaign's gear the way it inherits its lump
   *
   * A floor's lump is read off the campaign stage fighting at the same enemy level, and reading the
   * *gear* the same way is the obvious move. **Measured, it yields no gear anywhere in any tower**:
   * the campaign's first geared stage is `c12-s1` at enemy **level 225** and this roof is 189, so the
   * whole tower lives below the level the spine introduces gear at. There is nothing at a tower's
   * levels to match against, which is why this is an authored ramp on the floors.
   *
   * It follows that the tower is *not* out-gearing the campaign at equal level — the campaign has no
   * grade at these levels to be out-geared by — so the payout bound's argument does not transfer
   * here. What still binds is that **gear is texture rather than escalation**: see
   * [gear](../../docs/gear.md), where a whole grade step measured about ×1.15 against the ×3 it
   * would need to carry a band, and chapter 16's entire Relic ramp measured 0.08 of a survivor. The
   * fourth hundred gets harder through its boards; this is what its bodies are wearing while it does.
   *
   * ## The endpoints, and what they are worth
   *
   * Worn 1 to Fine 60, walked as one position on the concatenated ladder — see
   * {@link TowerGearRampData}. Three grades across the hundred, stepping at floors 301, 318 and 351,
   * and worth **+8.6% health on a `tank` at the bottom and +65.7% at the roof**: a swing of ×1.53,
   * which the authored boards absorb. ⚠️ **Relic 100 was measured and declined**: it is +166.3%, a
   * ×2.45 swing, which is not texture — it would *be* the hundred's escalation axis and would force
   * the authored weight to fall across the band, which is the shape chapter 16 had to author around
   * and the opposite of how a tower hundred escalates.
   */
  gear: {
    fromFloor: 301,
    from: { grade: 0, level: 1 },
    to: { grade: 2, level: 60 },
  },
} as const;

/**
 * The towers this build ships, in the order the screens list them.
 *
 * **Seven of seven, one per faction, in `FACTIONS` order** — which is also the order the roster
 * screen groups by, so a player who knows where their Elves are knows where the Elf Tower is.
 * `towers.spec.ts` holds the one-per-faction shape rather than this paragraph.
 *
 * The Human Tower shipped alone in milestone 15b because it is the only one that needed no new
 * enemy archetypes: Undead counter Humans and already had five blocks, which is what let that
 * milestone be about the *system*. 15c is the other six, and the eighteen blocks they needed — the
 * counts were lopsided (monster 6, undead 5, human 5, dwarf 3, demon 3, **elf 1, angel 1**) and a
 * tower biased toward a faction with one block is the same fight a hundred times. Every faction now
 * has at least fourteen. See [`enemies.ts`](./enemies.ts).
 *
 * ## ⚠️ The height is four hundred and the floors arrive one tower at a time
 *
 * {@link TOWER_RULES} is one rule for all seven, so a height bump lands in **one** session while the
 * floors themselves land in seven. It happened that way for the second hundred (21e bumped, 21e–21k
 * authored), again for the third, and it is happening again for the fourth — **the Human, Dwarf, Elf and
 * Undead Towers are the only four at four hundred floors today.** A tower that has not been extended simply ends at its last
 * authored floor — `clearedFloors` clamps to what the tower authors, so `nextFloor` reports it topped
 * and nothing in `ui/` misreads it.
 *
 * ⚠️ **What it loses while it waits is its boss.** `floorKindAt` reads the *rules'* height, so a
 * short tower's last floor resolves as a mini-boss and pays ×2 rather than ×5. That is a real payout
 * regression for every tower still on the old height, and it is licensed by exactly one argument —
 * the same one the save re-bases rest on: **no build carrying this has ever reached a player.** If
 * that ever stops being true, extend all seven in one session or not at all.
 *
 * What keeps it honest is a hand-maintained `PENDING` list of names in `towers.spec.ts` and
 * `towers.balance.ts` that each session shrinks and the last one deletes, along with the branches it
 * guards. ⚠️ **A filter — "the full height or three quarters of it" — would pass forever and never
 * notice a tower nobody went back for.** The list is literal for exactly that reason, and it is back
 * for the third time, and it is down to **three** names — the Human Tower's hundred opened the round and
 * the Dwarf, Elf and Undead Towers followed. **Do it the same way every time the height moves.**
 *
 * ⚠️ **A tower's `id` is a save key twice over** — it is what `GameState.towers` files the climb
 * under *and* what `GameState.formations` files the crew under. Renaming one strands both. Change
 * the `name` freely; never the `id`. Every tower also needs a matching row in
 * [`activities.ts`](./activities.ts), which is what gives it a crew at all;
 * [`towers.spec.ts`](./towers.spec.ts) is what makes a missing one a failing test rather than a
 * tower with no way in.
 */
export const TOWERS = [
  TOWER_HUMAN,
  TOWER_DWARF,
  TOWER_ELF,
  TOWER_UNDEAD,
  TOWER_MONSTER,
  TOWER_ANGEL,
  TOWER_DEMON,
] as const;
