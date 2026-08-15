/**
 * The Descent: one run a day, three floors of three fights, and a card between each.
 *
 * `core/descent/` evaluates all of this. What lives here is the content and the coefficients — the
 * same division `chapters.ts` makes with the reward curve and `towers.ts` with the floor rules.
 *
 * ## What the shape is for
 *
 * Nine fights is the length at which attrition is the mechanic rather than a flavour. Three is too
 * few for the cards to compound into anything and fifteen is a chore on a daily timer; at nine a
 * run makes **eight** decisions, which is enough that two runs on one day's boards are genuinely
 * different runs.
 *
 * ⚠️ **The whole mode adds exactly two save fields** — the run in flight and a count of runs
 * finished. Everything else is derived: the day's boards, the day's faction lock, the three cards on
 * offer, the enemy levels, and every payout. That is not frugality for its own sake; it is what
 * makes ⚠️ **rerolling impossible rather than merely detectable**, which is worth far more in a
 * project with no anti-cheat than any amount of validation.
 */

export {
  DESCENT_FAMILIES,
  DESCENT_FACTION_FAMILIES,
  DESCENT_UNIVERSAL_FAMILIES,
} from './descent-cards';
export { DESCENT_BOARDS } from './descent-boards';

/**
 * How the mode is shaped.
 *
 * ## The three numbers most likely to be retuned, and what each one costs
 *
 * - **`level.baseOffset` / `level.topOffset`.** The whole difficulty dial. See
 *   {@link DescentLevelData}: a fight is fought a fixed number of **levels** either side of the
 *   hardest campaign stage this run has beaten, so the mode stays a fight forever with twenty-four
 *   authored boards. Moving either is a full re-run of `descent.balance.ts` at every depth it
 *   samples, because the party's ascension rung — which the offset does not see — moves with the
 *   campaign too.
 * - **`summons`.** A repeatable crystal source is the one shape this economy has no answer to, so
 *   these are sized against what a day of idle income already pays rather than against what nine
 *   fights feel like they are worth. See the note on the field.
 * - **`maxLifeLeech`.** ⚠️ Not a balance number. See {@link DescentRulesData.maxLifeLeech}.
 */
export const DESCENT_RULES = {
  floors: 3,
  fightsPerFloor: 3,
  /**
   * Two attempts across the whole run — the run, and one retry.
   *
   * ⚠️ **Per run rather than per fight, which is what keeps a defeat expensive.** A retry per fight
   * would make the mode a matter of persistence; one across nine makes the *decision of when to
   * spend it* part of the run, which is the same shape the cards have. And because a defeat writes
   * nothing but this counter, the retry is genuinely the same fight from the same health, the same
   * energy and the same cards.
   */
  lives: 2,
  offer: 3,
  /**
   * Three factions of seven.
   *
   * Twenty-four characters eligible on a full roster, which is deep enough that a five is always
   * buildable and shallow enough that it is never the same five two days running. ⚠️ **Two would
   * be sharper and can leave a thin roster without a good answer**, and four stops reading as a
   * constraint at all once the roster is deep — the mode's breadth demand is the lock, so this is
   * the number that says how much of one there is.
   */
  lockFactions: 3,
  /**
   * Opens when chapter 3 falls — sixty clears.
   *
   * ⚠️ **It was authored at chapter 1, alongside the towers, and the sweep moved it.** Everything
   * optional in this game opens at once and that was the intention here too; what stopped it is that
   * the mode is not *finishable* at chapter 1 or 2. Measured over twenty days at each depth, a run
   * finishes 0 times in 20 at both — a chapter-1 party has no ascension rung and therefore **one
   * skill each**, against boards of four and five bodies with legendary anchors, and no level offset
   * fixes that because the binding constraint is board weight rather than level.
   *
   * ⚠️ **What forced the move rather than merely suggesting it is the daily quest.** "Finish a
   * Descent" is measured against `descentRuns`, and `core/quests.ts` forbids a quest a player cannot
   * make move today — the same rule that keeps `clearedStages` off that list. A mode that is visible
   * and unfinishable would have shipped exactly that: a permanent empty row, for two whole chapters.
   *
   * Sixty clears is the first depth at which a run finishes — 10 in 20 at chapter 3, and 20 in
   * 20 by chapter 4. See `descent.balance.ts`.
   */
  unlockChapters: 3,
  /**
   * The card ladder.
   *
   * ⚠️ **The tilt is authored as two ends rather than as a softness constant, and that is the fix
   * `docs/gear.md` names for `gradeSoftness`.** A weight interpolated across a run's own choices
   * saturates at the last one by construction, so there is nothing here to re-derive when content
   * grows — where the gear grade tilt climbs without bound and has been hand-corrected once a
   * chapter, five times, always to `stages / 2`.
   *
   * Sovereign starts at **zero**, which is the strongest statement the ladder makes: the top rung
   * cannot be drawn on the first choice at all, so "the cards get better as you go deeper" is a
   * fact about the draw rather than an average somebody would have to notice.
   */
  ranks: [
    { name: 'Lesser', start: 12, end: 1 },
    { name: 'Greater', start: 5, end: 5 },
    { name: 'Grand', start: 1, end: 8 },
    { name: 'Sovereign', start: 0, end: 5 },
  ],
  /**
   * Ceiling on a run's total life leech.
   *
   * ⚠️ **A termination guard, not a balance knob** — see {@link DescentRulesData.maxLifeLeech}. The
   * whole authorable stack is Bloodthirst's four rungs summed, 0.34, so this binds on nothing that
   * ships and `descent.spec.ts` asserts as much. It is here so that a fifth rung, or a second
   * leeching family, is a **clamped** run rather than a run that stalls out the ninety-second clock
   * and reports a defeat nobody can explain.
   */
  maxLifeLeech: 0.35,
  /**
   * The difficulty dial, in **levels** either side of the hardest campaign stage ever cleared.
   *
   * ⚠️ **Levels rather than a share, and the share version shipped in this milestone's first
   * draft and was measured wrong.** Enemy power is `perLevel ^ level`, so a share is a different
   * difficulty at every depth — 0.9 of level 14 is one level down and 0.9 of level 588 is
   * fifty-nine, which is ×3.4 easier. The sweep read that as a wall at chapter 1 and five bodies at
   * full health from chapter 5 on. An offset is the same number of steps along one exponential
   * wherever it is applied. See {@link DescentLevelData}.
   *
   * ⚠️ **The run opens below the anchor and closes above it**, and neither half is the mode being
   * easy or being unfair. The anchor is a stage the party cleared with a *full-health best five*; a
   * Descent crew is drawn from three factions it did not choose, arrives at fight nine carrying
   * eight fights of damage, and may be down to three bodies. Eight levels below that stage is
   * already a harder fight than the stage was, and twelve above it is what the eight cards are for.
   *
   * ⚠️ **It was −16 to +4 until the card offer was fixed, which is worth knowing before retuning
   * either number.** A faction family for a faction the day's lock excluded was being offered and
   * could pay nobody — better than a quarter of every offer was a dead card — so a run's real
   * strength jumped the moment that was filtered, and the sweep went from a 0.79 finish rate to
   * 0.96. **The offer and the level line are one dial with two halves**: anything that changes what
   * a card is worth re-aims this.
   */
  level: {
    baseOffset: -11,
    topOffset: 9,
    /**
     * ⚠️ **The two fixed offsets came down by 3 when this arrived, so the shallow end is unchanged.**
     * At the unlock's anchor of 30 the slope contributes +2.25, which puts the total back at about
     * −9 / +11 — near enough the pair the mode shipped with, and the pair every figure below the
     * fourth depth was tuned against. What moves is the deep end: +9.4 at anchor 125 and **+22.5 at
     * anchor 300**.
     *
     * ## ⚠️ Four settings in four chapters, and that is the finding rather than the tuning history
     *
     * Milestone 27 added this at **0.11** because the deep end had stopped being a fight — 5.00
     * survivors of five at anchor 250. The Quarry's depth then read **0.30 finished and 2.45
     * survivors** against a per-depth floor of 0.40, and **0.10** restored 0.50 / 3.50. The Shutgate's
     * depth read **0.15 finished** — the same dial, the same direction, the same one-chapter life —
     * and took it to **0.075**. The Underroad is the fourth in a row, and it is now **0.022**.
     *
     * ⚠️ **Four settings in four chapters is no longer a tuning history, it is a measurement of the
     * shape.** Each chapter raises the anchor by 25, which raises these boards by 25 plus the slope's
     * own contribution — while the *party* the depth implies is bisected against the chapter final and
     * rises only about **20**. So the gap widens roughly **7.5 to 7.75 levels every chapter, by
     * construction**, and no constant here is right for more than one of them.
     *
     * ⚠️ **The re-derivation is now arithmetic rather than a bisection, which is worth knowing before
     * the next one.** Solving "hold the party-to-board gap where it was" gives
     * `s = (gap + anchor − baseOffset − anchor) / anchor` at the new anchor, and for chapter 14 that
     * predicted **0.075** exactly — confirmed by sweeping 0.08 (still 0.30 at the deep end) and 0.07
     * (passes with room).
     *
     * ⚠️ **For chapter 15 the same closed form predicted 0.058 and the answer was 0.022, which is a
     * finding about the form rather than a miss.** It assumes the calibrated party rises by about 20
     * a chapter, which held while chapter finals were authored at a steady weight. The Underroad's
     * final is roughly **half** The Doorstone's stat line — the cap's gradient forced it — so the
     * bisection rose only **9.7** (235 → 244.7 over the three sampled locks) against an anchor that
     * rose the full 25. **Measure the bisection at both depths before predicting**; do not carry the
     * per-chapter figure forward, because it is a fact about how the chapter above was authored.
     *
     * ⚠️ **The reason the party gains less than the anchor is a rung, and it is a _step_.** Party power
     * is `perLevel ^ level × 1.6 ^ rung`, and `rarityFor` hands out a rung at each cap — so at anchor
     * 250 the bisection landed on **201**, one level past `legendary`'s cap of 200, and arrived
     * carrying a fresh ×1.6. At anchor 275 it lands on 221 and at 300 further inside the same rung,
     * carrying nothing new either time. Milestone 27 recorded that step as a *red herring* for the
     * easiness it was fixing; it is the direct cause of the hardness measured twice since.
     *
     * ⚠️ **So the shape is wrong rather than the number, and this is the second dial in the project
     * with that diagnosis** — `gear.ts`'s `gradeSoftness` is the first, and it has now been
     * re-derived ten times. What this eventually wants is a board level keyed off **the calibrated
     * party's own level** rather than off the anchor, which is what makes the rung step cancel instead
     * of accumulate. Recorded rather than taken: it re-derives every figure in `descent.balance.ts`
     * and is a decision about what the mode's difficulty is anchored to. ⚠️ **Do not batch a value
     * several chapters ahead** — the landing is the only thing that will force the shape fix, which is
     * exactly the call `gradeSoftness` records having got right. **Re-derive it from the measured
     * bisection at both depths; chapter 15's landing shows the prediction alone is not enough.**
     */
    anchorSlope: 0.022,
  },
  /**
   * What a run pays in crystals: 3,000 for a clean one, which is thirty pulls.
   *
   * ⚠️ **Sized against a day of idle income rather than against nine fights.** A fully cleared
   * ladder earns twenty to seventy-five pulls a day idly, so this is a supplement of roughly the
   * same order — and against the near-nothing a run stuck at a wall earns, it is most of what they
   * get, which is the same asymmetry quests are built on.
   *
   * ⚠️ **Flat, and it must stay flat.** `core/bounties.ts` states the rule this obeys: the crystal
   * rate is linear in the clear count precisely so it cannot outrun a flat `PULL_COST`, and a
   * *multiple of that rate* on a repeatable timer is exactly the compounding it exists to prevent.
   * A daily mode is the most repeatable timer in the game.
   */
  summons: {
    perFight: 120,
    guardianMultiplier: 2,
    bossMultiplier: 5,
    completion: 1200,
  },
  /**
   * Emblems for finishing a run.
   *
   * ⚠️ **On completion only, never per fight.** Emblems already have two faucets — an idle rate
   * that steps per chapter and a drop chance on a clear — and `docs/economy.md` records that the
   * intuitive reading of which is larger is backwards. A third per-fight source would be a third
   * mechanism on the tightest currency in the game with nothing on screen to say which one paid.
   * Fifty a day against the ~500 a fully cleared run already earns is a bonus, not a bypass.
   */
  completionEmblems: 50,
  /**
   * What a cleared fight's lump is worth, as multiples of the campaign lump at the same enemy level.
   *
   * ⚠️ **Essence is deliberately three times the other two**, which is the one place this mode
   * breaks the "scale all three together or none" rule in `chapters.ts`. That rule protects
   * `baseRates`, where a common factor cancels out of every ratio `levels.spec.ts` measures — and
   * this moves no rate at all. Essence is the currency a run is genuinely bottlenecked on late, so
   * it is the one worth paying here; a run that finishes a Descent earns roughly ninety minutes of
   * its own essence income for nine fights, and half an hour of gold and xp.
   */
  lumpMultipliers: {
    gold: 5,
    xp: 5,
    essence: 15,
  },
} as const;
