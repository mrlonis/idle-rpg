import {
  ASHPIT_SCUTTLER,
  BANDIT,
  BRAMBLEWALK_SCOUT,
  CARRION_SWARM,
  CINDERQUENCH_BEARER,
  DEADMANS_MAIL,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  FORLORN_LEVY,
  FREE_BLADE,
  GLADE_STALKER,
  HARNESS_CUTTER,
  HEAPFOOT_RUMMAGER,
  LAMPLESS_PILGRIM,
  MILEWORN_HUSK,
  MUSTER_PIKE,
  PLUMBLINE_HAND,
  QUARTERMASTERS_CLERK,
  ROADGAUNT_OUTRIDER,
  ROADWATCH_BOWMAN,
  ROPEWALK_CREW,
  SCREEBACK_DARTER,
  SIGNAL_RUNNER,
  SKYSHRIKE,
  SLIME,
  SPOIL_PICKER,
  SPOILCART_HAND,
  TALLOWLIGHT_RUNNER,
  THE_INHERITOR,
  THE_QUARTERMASTER,
  THORNLING,
  THORNPLATE_WEARER,
  VANWARD_SPEAR,
  WISP,
} from './enemies';

/**
 * Chapter 16 — The Spoilfield.
 *
 * Fifty stages, enemy levels 325 to 350. It **opens at the level chapter 15 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Underroad did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, and the
 * underroad whether there is **an end to it**. This one asks whether it is **the party's own damage
 * at all**.
 *
 * The Underroad came out from under the hill. This is what it comes out onto: open ground with
 * everything the road ever carried put down on it, and people living on that. Not an army and not a
 * garrison — a **trade**. They strip the dead and they wear what they strip, and after fifteen
 * chapters of dead that is the best equipment in the world. Thin, half-fed people inside other
 * people's armour, and some of that armour still has the spines in it.
 *
 * | Band                      | Stages | The lock it teaches                                       |
 * | ------------------------- | ------ | --------------------------------------------------------- |
 * | The pickers               | 1–10   | the stat block is not the board: gear is most of what they are |
 * | The thorned               | 11–20  | {@link THORNMAIL}, on the lightest bodies ever to carry it  |
 * | The chained               | 21–30  | a cast {@link CHAINBOND}: the route stops working, not the progress |
 * | The quartermaster's line  | 31–40  | {@link WEAKEN} across the party, from a body in the front rank |
 * | The heap                  | 41–50  | all four at once, and the thing standing on top of it       |
 *
 * ## Where the levels come from
 *
 * 325 to 350, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## ⚠️ The cap has been out of levels for three chapters and the seam is now 1.6154
 *
 * `legendary-plus` caps at **260** against a close of **350**, so the party this chapter is tuned
 * for stands **ninety levels under the last board** — where The Underroad's stood sixty-five under,
 * The Shutgate's forty and The Quarry's fifteen. At `perLevel.common` = 1.021 that is **×6.49** of
 * content the party cannot answer with levels, and it arrives entirely from a ceiling that does not
 * move.
 *
 * The seam ratios are the record: **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154**. ⚠️ **The last
 * three factors are all exactly `perLevel.common ** -25` = 0.595**, so a chapter on this rung
 * divides the seam by **1.680 by arithmetic**. Chapter 15 predicted this would keep happening until
 * the rung moves; it has, for the third time, and it is not tuning.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Against a
 * close of 350, `legendary-plus` reads 1.6154 (|Δln| **0.5196** against chapter 15's own seam) and
 * `mythic` reads 13.6290 (|Δln| **1.6130**). So `legendary-plus` wins by 1.09 of a nat and this is
 * the **sixth** chapter running on one rung. It is also the **third degenerate link in a row**:
 * chapters 13, 14, 15 and 16 all clamp to 260, so four consecutive seam parties are the same five
 * characters at the same level at the same rung.
 *
 * ## ⚠️ The board budget has fallen through the floor of the shipped enemy pool
 *
 * This is the finding this chapter exists to record, and it is the third consecutive chapter to
 * come down.
 *
 * Measured, The Underroad's own final board refielded against this chapter's party and gear:
 *
 * | `c15-s50`'s board, refielded | reading                       |
 * | ----------------------------- | ----------------------------- |
 * | level 325, Relic 59           | 100% / 3.58 survivors / 20.6s |
 * | level 330, Relic 67           | **0%** / 0.00 / 21.6s         |
 * | level 337, Relic 79           | **0%** / 0.00 / 13.4s         |
 * | level 350, Relic 100          | **0%** / 0.00 / 5.8s          |
 * | level 350, Relic 100, ×0.5    | **45%** / 0.80                |
 * | level 350, Relic 100, ×0.4    | 100% / 4.00                   |
 *
 * So this chapter's boards are **roughly ×0.4 of chapter 15's**, which puts a board at **2,715
 * common-equivalent at the first stage falling to 1,541 at the last** — 175 to 900 raw health a
 * body, and most of them under 250.
 *
 * ⚠️ **The pool cannot supply that for much longer, and a seventeenth chapter on this rung cannot
 * be authored out of it at all.** ⚠️ **Stated against the pool this chapter drew from rather than
 * as a standing threshold, because the range grows underneath a claim like this one**: of the
 * **211** blocks that existed before The Spoilfield, **48** sat at or under 560 health and exactly
 * **one** — the Wisp, at 210 — under 250. The twenty-four returning blocks this chapter fields are
 * very nearly that entire light tail. The four new commons it authors — 175, 200, 205 and 220 —
 * are the lightest bodies this project has ever shipped outside the Wisp, and they take the pool to
 * 221 blocks with 58 at or under 560. See [authoring](../../docs/authoring.md); this is a finding
 * rather than scope taken.
 *
 * ## ⚠️ Author against common-equivalent weight; raw health is now badly misleading
 *
 * `perLevel` is 1.024 / 1.0225 / 1.021, so **at level 350 an `ascended` block is worth ×2.784 of a
 * `common` one and ×1.668 of a `legendary` one** — up from ×2.587 and ×1.608 at chapter 15's close,
 * and the premium grows every chapter. {@link THE_INHERITOR} is authored at **250 health and 24
 * attack**, which reads absurd next to a 220-health cart hand until it is converted: in
 * common-equivalent terms it is **696 and 67**, roughly three times its escort's health and nearly
 * twice its attack. **Convert before comparing two blocks, and certainly two chapters.**
 *
 * ## ⚠️ The gear ladder ends here, and this is the last chapter that can step it
 *
 * Every board carries {@link StageEncounterData.gear} at grade **4 (Relic)**, climbing **59 to 100**
 * across the fifty stages. Fifty-nine rather than one, by the same arithmetic every grade boundary
 * has used: a piece is worth `multiplier × (1 + 0.055 × (level − 1))`, so Masterwork at its cap of
 * 80 is **12.561** while Relic at level 1 is only 3.000 and at 58 still **12.405**. Relic 59 reads
 * **12.570** — the first level of the new grade that clears the old grade's cap — and Relic 100
 * reads **19.335**, the top of the whole ladder.
 *
 * ⚠️ **There is no grade 5 and no Relic 101.** Chapter 17 is the first chapter in five that cannot
 * step this axis at all. Recorded rather than solved: [gear](../../docs/gear.md) has now measured
 * the axis at ×1.09–1.18, ×1.15 and "worth seconds" on three occasions against the ×3 the
 * escalation would need, and a sixth grade is a `data/` rule change rather than a chapter.
 *
 * ⚠️ **The ramp inside this chapter is worth fight length and not survivors**, which is the same
 * answer the three chapters below it got. Measured on one board at the roof, Relic 59 → 100 moves it
 * from 4.08 survivors in 11.9 seconds to 4.00 in 15.1 — **0.08 of a survivor and a quarter more
 * fight.** The level line is the difficulty; the gear is texture with a number attached.
 *
 * ## ⚠️ What carries the difficulty, and the plateau that makes every other figure conditional
 *
 * ⚠️ **This chapter's single most important measurement is that the vocabulary's worth is a
 * function of where the board stands, not of the mechanic.** Against a calibrated control at level
 * 350 and Relic 100, `THORNMAIL` across a whole board reads:
 *
 * | control weight (raw) | control survivors | with `THORNMAIL` ×5 |
 * | -------------------- | ----------------- | ------------------- |
 * | 900                  | 4.00              | 4.00 (**0.00**)     |
 * | 1,060                | 3.80              | 3.65 (**0.15**)     |
 * | 1,160                | 2.23              | 0.90 (**1.33**)     |
 *
 * The mechanic did not change between those rows. **State the weight with the figure or the figure
 * means nothing** — and the first control this session built was saturated, reading exactly 4.00 at
 * every weight from 900 to 1,180, which made the entire vocabulary look inert. That is the same trap
 * chapter 15 recorded from the opposite direction and the Demon Tower's `critBlock` band before it.
 * **Check the control can move.**
 *
 * The full sweep at the roof, control 3.83 of five: `SUNDER` enemy-all **0.00**, `GUARD` ally-all
 * 0.08, `THORNMAIL` ×1 0.13, `THORNMAIL` ×5 0.20, cast `CHAINBOND` 0.25, `THORNMAIL` + `CHAINBOND`
 * 0.43, `BLEED` enemy-all 1.45, `WEAKEN` enemy-all **1.66**, `RALLY` ally-all **2.26**. ⚠️ **Zero
 * timeouts on every row**, longest 44.2 seconds.
 *
 * ⚠️ **A board-wide `RALLY` is larger than any anchor's whole stat line, for the second chapter
 * running.** The Underroad recorded a final that read 0% at every anchor weight from 880/54 down to
 * 520/34 because of one; this chapter spends exactly **one** rally, on the final, and prices the
 * board against it rather than around it.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the final: **eight new, twenty-four
 * returning** — exactly the quarter a chapter owes, measured over what the chapter *fields* rather
 * than over the shipped pool. Thirty-four distinct bodies in all, over 250 board slots.
 *
 * ⚠️ **The lean is Human and it takes the faction 26 → 36.** Human stood thinnest of the five
 * factions a chapter may lead: the seven ran angel 24, demon 25, **human 26**, elf 33, monster 34,
 * dwarf 34, undead 35, and both factions below Human are celestials — a celestial deals ×1.10 to
 * every mortal and the matrix has no mortal → celestial row, so neither may lead. **Recompute the
 * depths before choosing the next lean**; this is the sixth session running where one lean has
 * reversed the ordering.
 *
 * ⚠️ **It is a repeat lead, the second in the campaign after Elf led chapters 8 and 12, and what a
 * repeat costs is that the chapter has to be a visibly different place.** The Standing Line is the
 * Humans as an army, holding. This is the Humans after every army has gone through, making a living
 * off what the armies left — the same faction with none of the same fiction, and none of its blocks
 * in common except the seven light ones the budget could still afford.
 *
 * ⚠️ **The lean measures 84.0% of board slots, counted after the boards landed rather than written
 * from the intent** — which is the failure The Shutgate's header records making. In family: the
 * Weald 81.5%, The Standing Line 83.2%, The Bleeding Wild 83.9%, The Quarry and The Shutgate 85.2%,
 * The Underroad 86.4%, The Rustwood 92%. The non-Human texture is 40 slots over 17 blocks and it
 * **thins out as the chapter goes**: 15, 12, 9, 3 and 1 slots across the five bands, because the
 * closer the party gets to the trade itself, the less of anybody else is still on the ground.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Inheritor is the sixteenth body authored under the rule that a chapter's final is
 * fielded nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here: nothing, and that is a countable claim
 *
 * Measured over all fifty boards and all thirty-four blocks with a script rather than by reading:
 * **0 blocks carry `recovery`, 0 carry `healthRegen`, 0 carry `lifeLeech`, 0 field a heal, 0 field a
 * drain, and 0 field a shield or a pool of any kind.** The Underroad permitted the drain because a
 * leech is bounded by the damage its holder deals; this chapter needs no such argument, because it
 * has none.
 *
 * ⚠️ **That is not squeamishness, it is what makes the axis safe.** A reflect is *extra damage on a
 * schedule the party controls* — it can only ever shorten a fight. Building the chapter on one and
 * then putting sustain behind it would have handed back the exact property that licensed it. The
 * longest fight on any of the fifty boards is **25.4 seconds** against a ninety-second timer, and
 * the sweep counts **zero timeouts**.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is
 *    fixed with **weight**, never with +3 enemy levels. Here the whole board is the dial rather
 *    than the anchor slot alone, for the second chapter running.
 * 2. ⚠️ **The probe reads `c16-s3`, and then every fourth stage.** Chapter 16 opens at linear index
 *    650, so the stride lands on s3, s7, s11, s15, s19, s23, s27, s31, s35, s39, s43, s47 and the
 *    final. **Band openers 2 and 4 (s11 and s31) are samples and openers 1, 3 and 5 (s1, s21, s41)
 *    are not**, so those two had to be authored heavy against the pull to open a band lightly;
 *    **none of the four mini-bosses is a sample**, only the chapter boss is pinned in, so their
 *    weight is authored against the boards either side rather than against the probe. That is a
 *    different phase from The Underroad's, so the samples were computed rather than copied.
 *    Measured thresholds run 1,232 → 2,159 with a worst adjacent ratio of **0.940** against a bar
 *    of 0.85, and the bracket has ×2,316 of headroom, so it does not need widening.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank**, and the lieutenant does not
 *    stand on the final — chapters 9 through 15 all declined it. At a ninety-level gap that pairing
 *    is not a step but a cliff.
 */
export const CHAPTER_16 = {
  id: 'chapter-16',
  name: 'The Spoilfield',
  stages: [
    // -----------------------------------------------------------------------------------
    // The pickers — stages 1 to 10, levels 325 to 330, Relic 59 to 66
    //
    // The lock is arithmetic rather than a mechanic: these are the thinnest bodies in the game
    // wearing the best equipment in it. {@link SPOIL_PICKER} is 175 health, and a full Relic set
    // at 100 is +112% health and +89% attack on a `brawler` profile — so it fights at rather more
    // than twice its stat line and the stat line is the smaller half of it.
    //
    // ⚠️ **This is where the returning blocks live**, and the weight is why: the band opens at
    // 2,715 common-equivalent, which is the largest budget in the chapter, so it is the only place
    // a 900-health {@link MUSTER_PIKE} or a 540-health {@link CINDERQUENCH_BEARER} still fits. By
    // the closing band the budget will not carry either.
    //
    // ⚠️ **Nothing in this band reflects, binds or debuffs the party's attack.** The chapter's
    // vocabulary arrives one band at a time and the opening band is the field itself.
    // -----------------------------------------------------------------------------------

    {
      id: 'c16-s1',
      name: 'Out from Under the Hill',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [SCREEBACK_DARTER, PLUMBLINE_HAND, SPOIL_PICKER],
      },
      level: 325,
      gear: { grade: 4, level: 59 },
    },
    {
      id: 'c16-s2',
      name: 'Nobody Buried Any of This',
      enemies: {
        front: [MUSTER_PIKE, FREE_BLADE],
        back: [ASHPIT_SCUTTLER, CINDERQUENCH_BEARER, SPOIL_PICKER],
      },
      level: 326,
      gear: { grade: 4, level: 60 },
    },
    {
      id: 'c16-s3',
      name: 'The Trade',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [SCREEBACK_DARTER, DEEPROCK_MINER, HARNESS_CUTTER],
      },
      level: 326,
      gear: { grade: 4, level: 61 },
    },
    {
      id: 'c16-s4',
      name: 'Straps First',
      enemies: {
        front: [FREE_BLADE, FORLORN_LEVY],
        back: [CINDERQUENCH_BEARER, PLUMBLINE_HAND, SPOILCART_HAND],
      },
      level: 327,
      gear: { grade: 4, level: 62 },
    },
    {
      id: 'c16-s5',
      name: 'What the Dead Kept',
      enemies: {
        front: [MUSTER_PIKE, BANDIT],
        back: [ASHPIT_SCUTTLER, DEEPGALLERY_RUNNER, HEAPFOOT_RUMMAGER],
      },
      level: 327,
      gear: { grade: 4, level: 62 },
    },
    {
      id: 'c16-s6',
      name: 'Half a Mile of It',
      enemies: {
        front: [VANWARD_SPEAR, FREE_BLADE],
        back: [CARRION_SWARM, DEEPROCK_MINER, SPOIL_PICKER],
      },
      level: 328,
      gear: { grade: 4, level: 63 },
    },
    {
      id: 'c16-s7',
      name: 'The Cart Comes Back Loaded',
      enemies: {
        front: [MUSTER_PIKE, FORLORN_LEVY],
        back: [ROADWATCH_BOWMAN, DEEPGALLERY_RUNNER, SPOILCART_HAND],
      },
      level: 328,
      gear: { grade: 4, level: 64 },
    },
    {
      id: 'c16-s8',
      name: 'Picked Over Twice',
      enemies: {
        front: [BANDIT, VANWARD_SPEAR],
        back: [BRAMBLEWALK_SCOUT, SIGNAL_RUNNER, HEAPFOOT_RUMMAGER],
      },
      level: 329,
      gear: { grade: 4, level: 65 },
    },
    {
      id: 'c16-s9',
      name: 'Everything Fits Somebody',
      enemies: {
        front: [MUSTER_PIKE, FREE_BLADE],
        back: [SKYSHRIKE, ROADWATCH_BOWMAN, SPOIL_PICKER],
      },
      level: 329,
      gear: { grade: 4, level: 66 },
    },
    {
      id: 'c16-s10',
      name: 'The Quartermaster',
      enemies: {
        front: [THE_QUARTERMASTER, VANWARD_SPEAR],
        back: [ROADWATCH_BOWMAN, SIGNAL_RUNNER, SPOILCART_HAND],
      },
      level: 330,
      gear: { grade: 4, level: 67 },
    },

    // -----------------------------------------------------------------------------------
    // The thorned — stages 11 to 20, levels 330 to 335, Relic 67 to 75
    //
    // The lock: {@link THORNMAIL}, and it is a **returning** status rather than a new one. Nine
    // shipped blocks carry it and **not one is under 760 health**; {@link THORNPLATE_WEARER} at
    // 330 and {@link DEADMANS_MAIL} at 295 are the lightest bodies ever to hold it. That is the
    // point rather than a compromise: a reflect prices against the **attacker's** blow, which is
    // the scaling quantity, and against the wearer's health, which is not.
    //
    // ⚠️ **Measured, and the figure is meaningless without the weight beside it.** Against a live
    // control at the roof, `THORNMAIL` across a whole board is worth **0.00** survivors at 900
    // total health, **0.20** at 1,060 and **1.33** at 1,160. The mechanic is identical in all
    // three rows. **This band's boards sit at 2,060 to 2,300 common-equivalent, which is deep
    // inside the plateau, so what it is worth here is texture** — and the chapter says so rather
    // than implying a lock it has not got.
    //
    // ⚠️ **A reflect can never run the ninety-second clock out**, which is why it is the axis. It
    // is strictly extra damage on a schedule the party controls; every board carrying it measured
    // **faster** than its own control, and the sweep counts zero timeouts on all fifty.
    // -----------------------------------------------------------------------------------

    {
      id: 'c16-s11',
      name: 'Plate With the Spines In',
      enemies: {
        front: [THORNPLATE_WEARER, VANWARD_SPEAR],
        back: [SCREEBACK_DARTER, PLUMBLINE_HAND, SPOIL_PICKER],
      },
      level: 330,
      gear: { grade: 4, level: 67 },
    },
    {
      id: 'c16-s12',
      name: 'It Was Made to Be Hard to Hit',
      enemies: {
        front: [THORNPLATE_WEARER, FREE_BLADE],
        back: [BRAMBLEWALK_SCOUT, DEEPROCK_MINER, HARNESS_CUTTER],
      },
      level: 331,
      gear: { grade: 4, level: 68 },
    },
    {
      id: 'c16-s13',
      name: "Deadman's Mail",
      enemies: {
        front: [DEADMANS_MAIL, FORLORN_LEVY],
        back: [CINDERQUENCH_BEARER, MILEWORN_HUSK, HEAPFOOT_RUMMAGER],
      },
      level: 331,
      gear: { grade: 4, level: 69 },
    },
    {
      id: 'c16-s14',
      name: 'Whoever Had It Last',
      enemies: {
        front: [DEADMANS_MAIL, BANDIT],
        back: [MILEWORN_HUSK, DEEPGALLERY_RUNNER, SPOIL_PICKER],
      },
      level: 332,
      gear: { grade: 4, level: 70 },
    },
    {
      id: 'c16-s15',
      name: 'The Field Answers Back',
      enemies: {
        front: [THORNPLATE_WEARER, VANWARD_SPEAR],
        back: [LAMPLESS_PILGRIM, SIGNAL_RUNNER, SPOILCART_HAND],
      },
      level: 332,
      gear: { grade: 4, level: 71 },
    },
    {
      id: 'c16-s16',
      name: 'Nothing Here Is Yours',
      enemies: {
        front: [DEADMANS_MAIL, FREE_BLADE],
        back: [BRAMBLEWALK_SCOUT, ROADWATCH_BOWMAN, HEAPFOOT_RUMMAGER],
      },
      level: 333,
      gear: { grade: 4, level: 72 },
    },
    {
      id: 'c16-s17',
      name: 'Two Sets and One Body',
      enemies: {
        front: [THORNPLATE_WEARER, DEADMANS_MAIL],
        back: [LAMPLESS_PILGRIM, SIGNAL_RUNNER, SPOIL_PICKER],
      },
      level: 333,
      gear: { grade: 4, level: 72 },
    },
    {
      id: 'c16-s18',
      name: 'Struck Through',
      enemies: {
        front: [THORNPLATE_WEARER, FORLORN_LEVY],
        back: [ASHPIT_SCUTTLER, ROADWATCH_BOWMAN, HARNESS_CUTTER],
      },
      level: 334,
      gear: { grade: 4, level: 73 },
    },
    {
      id: 'c16-s19',
      name: 'The Spines Do Not Wear Out',
      enemies: {
        front: [DEADMANS_MAIL, BANDIT],
        back: [SIGNAL_RUNNER, ROADWATCH_BOWMAN, SPOILCART_HAND],
      },
      level: 334,
      gear: { grade: 4, level: 74 },
    },
    {
      id: 'c16-s20',
      name: 'The Quartermaster Returns',
      enemies: {
        front: [THE_QUARTERMASTER, THORNPLATE_WEARER],
        back: [ROADWATCH_BOWMAN, SPOIL_PICKER, SPOILCART_HAND],
      },
      level: 335,
      gear: { grade: 4, level: 75 },
    },

    // -----------------------------------------------------------------------------------
    // The chained — stages 21 to 30, levels 335 to 340, Relic 76 to 84
    //
    // The lock: {@link CHAINBOND}, cast by {@link ROPEWALK_CREW} on a seventy-five tick cadence
    // against the status's own sixty, so a fifth of every cycle is a window where focus fire works
    // again.
    //
    // ⚠️ **Cast rather than authored as an `opening`, and the difference is the whole design.**
    // Measured at the roof, the same status laid as an opening on all five is worth **0.75 of
    // five** where the cast is worth **0.25** — because an opening costs the board no turn and a
    // cast costs it one. A bind the party can watch arrive is a route problem; a permanent one on
    // a board this thin is a wall.
    //
    // ⚠️ **A link conserves damage and cannot cascade** — a share resolves through `statusDamage`,
    // which never re-enters the attack path — so this costs the party its route rather than its
    // progress, and no version of it lengthens a fight past the timer.
    // -----------------------------------------------------------------------------------

    {
      id: 'c16-s21',
      name: 'Roped Together',
      enemies: {
        front: [THORNPLATE_WEARER, VANWARD_SPEAR],
        back: [ROPEWALK_CREW, MILEWORN_HUSK, SPOIL_PICKER],
      },
      level: 335,
      gear: { grade: 4, level: 76 },
    },
    {
      id: 'c16-s22',
      name: 'The Rope Was for the Cart',
      enemies: {
        front: [DEADMANS_MAIL, FREE_BLADE],
        back: [ROPEWALK_CREW, ROADGAUNT_OUTRIDER, HARNESS_CUTTER],
      },
      level: 336,
      gear: { grade: 4, level: 77 },
    },
    {
      id: 'c16-s23',
      name: 'Aim Anywhere',
      enemies: {
        front: [THORNPLATE_WEARER, VANWARD_SPEAR],
        back: [ROPEWALK_CREW, ASHPIT_SCUTTLER, HEAPFOOT_RUMMAGER],
      },
      level: 336,
      gear: { grade: 4, level: 77 },
    },
    {
      id: 'c16-s24',
      name: 'It Goes Round the Rest',
      enemies: {
        front: [DEADMANS_MAIL, FORLORN_LEVY],
        back: [ROPEWALK_CREW, CARRION_SWARM, SPOIL_PICKER],
      },
      level: 337,
      gear: { grade: 4, level: 78 },
    },
    {
      id: 'c16-s25',
      name: 'Five Belts',
      enemies: {
        front: [THORNPLATE_WEARER, ROPEWALK_CREW],
        back: [GLADE_STALKER, SIGNAL_RUNNER, SPOILCART_HAND],
      },
      level: 337,
      gear: { grade: 4, level: 79 },
    },
    {
      id: 'c16-s26',
      name: 'The Route Stops Working',
      enemies: {
        front: [DEADMANS_MAIL, VANWARD_SPEAR],
        back: [ROPEWALK_CREW, ROADGAUNT_OUTRIDER, HEAPFOOT_RUMMAGER],
      },
      level: 338,
      gear: { grade: 4, level: 80 },
    },
    {
      id: 'c16-s27',
      name: 'Slack in the Line',
      enemies: {
        front: [THORNPLATE_WEARER, FREE_BLADE],
        back: [ROPEWALK_CREW, GLADE_STALKER, SPOIL_PICKER],
      },
      level: 338,
      gear: { grade: 4, level: 81 },
    },
    {
      id: 'c16-s28',
      name: 'Hauled Off the Heap',
      enemies: {
        front: [DEADMANS_MAIL, ROPEWALK_CREW],
        back: [CARRION_SWARM, ROADWATCH_BOWMAN, HARNESS_CUTTER],
      },
      level: 339,
      gear: { grade: 4, level: 82 },
    },
    {
      id: 'c16-s29',
      name: 'One Blow, Five Backs',
      enemies: {
        front: [THORNPLATE_WEARER, BANDIT],
        back: [ROPEWALK_CREW, ROADGAUNT_OUTRIDER, SPOILCART_HAND],
      },
      level: 339,
      gear: { grade: 4, level: 82 },
    },
    {
      id: 'c16-s30',
      name: 'The Quartermaster Ropes It',
      enemies: {
        front: [THE_QUARTERMASTER, ROPEWALK_CREW],
        back: [SPOIL_PICKER, HEAPFOOT_RUMMAGER, SPOILCART_HAND],
      },
      level: 340,
      gear: { grade: 4, level: 83 },
    },

    // -----------------------------------------------------------------------------------
    // The quartermaster's line — stages 31 to 40, levels 340 to 345, Relic 84 to 92
    //
    // The lock: {@link WEAKEN}, across the party, from {@link QUARTERMASTERS_CLERK}. ⚠️ **This is
    // the second largest lever in the chapter** — at the roof it costs the tuned party **1.66 of
    // five** and takes the mean fight from 13.4 to 21.4 seconds, against the same status measuring
    // **0.00** at every band opening above it. Chapter 14 measured its whole refusal vocabulary
    // inert against a party standing forty levels under its boards; this party stands **ninety**
    // under, and that is the entire difference.
    //
    // ⚠️ **The clerk stands in the FRONT rank on every board it appears on, and that is a rule
    // rather than a preference.** Measured, the same body moved to the back rank costs the party
    // roughly **four** more survivors — from 4.00 to 0.10 at one weight — because the party cannot
    // aim past it and the weaken never lapses in practice. A debuff the party cannot reach the
    // source of is the same failure as sustain behind a taunt, wearing a different stat.
    //
    // ⚠️ **It is the one turn in this chapter that lengthens a fight rather than shortening it.**
    // Worst measured across the band is 25.4 seconds against a ninety-second timer, and this is the
    // block a later session would have to look at first if that ever moved.
    // -----------------------------------------------------------------------------------

    {
      id: 'c16-s31',
      name: 'The List',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [TALLOWLIGHT_RUNNER, HEAPFOOT_RUMMAGER, SPOIL_PICKER],
      },
      level: 340,
      gear: { grade: 4, level: 84 },
    },
    {
      id: 'c16-s32',
      name: 'At What the List Says',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SPOILCART_HAND, HARNESS_CUTTER],
      },
      level: 341,
      gear: { grade: 4, level: 85 },
    },
    {
      id: 'c16-s33',
      name: 'Taken Off the Count',
      enemies: {
        front: [QUARTERMASTERS_CLERK, VANWARD_SPEAR],
        back: [THORNLING, HEAPFOOT_RUMMAGER, SPOIL_PICKER],
      },
      level: 341,
      gear: { grade: 4, level: 86 },
    },
    {
      id: 'c16-s34',
      name: 'The Edge Comes Off It',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOILCART_HAND, SPOIL_PICKER, HEAPFOOT_RUMMAGER],
      },
      level: 342,
      gear: { grade: 4, level: 87 },
    },
    {
      id: 'c16-s35',
      name: 'Nothing Is Worth What You Paid',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SLIME, SPOILCART_HAND],
      },
      level: 342,
      gear: { grade: 4, level: 87 },
    },
    {
      id: 'c16-s36',
      name: 'Weighed at the Cart',
      enemies: {
        front: [QUARTERMASTERS_CLERK, FREE_BLADE],
        back: [SPOIL_PICKER, HARNESS_CUTTER, HEAPFOOT_RUMMAGER],
      },
      level: 343,
      gear: { grade: 4, level: 88 },
    },
    {
      id: 'c16-s37',
      name: 'The Clerk Does Not Look Up',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOILCART_HAND, HEAPFOOT_RUMMAGER, SPOIL_PICKER],
      },
      level: 343,
      gear: { grade: 4, level: 89 },
    },
    {
      id: 'c16-s38',
      name: 'Struck Off',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SPOIL_PICKER, HARNESS_CUTTER],
      },
      level: 344,
      gear: { grade: 4, level: 90 },
    },
    {
      id: 'c16-s39',
      name: 'A Number for a Person',
      enemies: {
        front: [QUARTERMASTERS_CLERK, BANDIT],
        back: [SPOILCART_HAND, HEAPFOOT_RUMMAGER, SPOIL_PICKER],
      },
      level: 344,
      gear: { grade: 4, level: 91 },
    },
    {
      id: 'c16-s40',
      name: 'The Quartermaster Writes It Down',
      enemies: {
        front: [THE_QUARTERMASTER, HARNESS_CUTTER],
        back: [SPOIL_PICKER, SPOILCART_HAND, HEAPFOOT_RUMMAGER],
      },
      level: 345,
      gear: { grade: 4, level: 92 },
    },

    // -----------------------------------------------------------------------------------
    // The heap — stages 41 to 50, levels 345 to 350, Relic 92 to 100
    //
    // All four at once, and the thing standing on top of it. The field's other scavengers have
    // thinned out to **one** non-Human body in this band's fifty slots — the Wisp on `c16-s45` —
    // which is the arithmetic of the last two bands run to its end: the closer the party gets to
    // the trade itself, the less of anybody else is left on the ground.
    //
    // ⚠️ **The cliff is between five levels here, and that is measured rather than felt.** Boards
    // of the same shape and within 1% of the same weight read 4.00 survivors at level 347 and
    // **0.80** at 349. Every board in this band was placed against the sweep individually; none of
    // them was sized by eye against the one before it.
    // -----------------------------------------------------------------------------------

    {
      id: 'c16-s41',
      name: 'The Heap',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SPOILCART_HAND, SPOIL_PICKER],
      },
      level: 345,
      gear: { grade: 4, level: 92 },
    },
    {
      id: 'c16-s42',
      name: 'Everything the Road Carried',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOIL_PICKER, SPOILCART_HAND, HEAPFOOT_RUMMAGER],
      },
      level: 346,
      gear: { grade: 4, level: 93 },
    },
    {
      id: 'c16-s43',
      name: 'Sorted by What It Was',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SPOIL_PICKER, HARNESS_CUTTER],
      },
      level: 346,
      gear: { grade: 4, level: 94 },
    },
    {
      id: 'c16-s44',
      name: 'The Top of the Pile',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOILCART_HAND, SPOIL_PICKER, HEAPFOOT_RUMMAGER],
      },
      level: 347,
      gear: { grade: 4, level: 95 },
    },
    {
      id: 'c16-s45',
      name: 'Fifteen Chapters Deep',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, WISP, SPOILCART_HAND],
      },
      level: 347,
      gear: { grade: 4, level: 96 },
    },
    {
      id: 'c16-s46',
      name: 'What You Left Behind You',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOIL_PICKER, HARNESS_CUTTER, HEAPFOOT_RUMMAGER],
      },
      level: 348,
      gear: { grade: 4, level: 97 },
    },
    {
      id: 'c16-s47',
      name: 'It Has All of It',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [ROPEWALK_CREW, SPOILCART_HAND, SPOIL_PICKER],
      },
      level: 348,
      gear: { grade: 4, level: 97 },
    },
    {
      id: 'c16-s48',
      name: 'Nothing Was Thrown Away',
      enemies: {
        front: [DEADMANS_MAIL, QUARTERMASTERS_CLERK],
        back: [SPOIL_PICKER, SPOILCART_HAND, HEAPFOOT_RUMMAGER],
      },
      level: 349,
      gear: { grade: 4, level: 98 },
    },
    {
      id: 'c16-s49',
      name: 'The Last of the Field',
      enemies: {
        front: [THORNPLATE_WEARER, QUARTERMASTERS_CLERK],
        back: [SPOILCART_HAND, SPOIL_PICKER, HARNESS_CUTTER],
      },
      level: 349,
      gear: { grade: 4, level: 99 },
    },
    {
      id: 'c16-s50',
      name: 'The Inheritor',
      enemies: {
        front: [THE_INHERITOR, HEAPFOOT_RUMMAGER],
        back: [SPOILCART_HAND, HARNESS_CUTTER, SPOILCART_HAND],
      },
      level: 350,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
