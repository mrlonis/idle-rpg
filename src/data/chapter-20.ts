import {
  AFTERGRASS_GLEANER,
  BARROWMIST_KEENER,
  BINDWEED_DEAD,
  CAIRNWARD_HUSK,
  CHAFFMOUTH_GAUNT,
  CORTEGE_LANCER,
  DEADMANS_MAIL,
  FALLOWMARCH_WARDEN,
  FORLORN_LEVY,
  FREE_BLADE,
  GRAVEFURROW_WALKER,
  HARNESS_CUTTER,
  HEAPFOOT_RUMMAGER,
  LAMPLESS_PILGRIM,
  MEERSTONE_HUSK,
  MILEWORN_HUSK,
  ONEGRAVE_HAND,
  PASSBELL_RINGER,
  QUICKSET_DEAD,
  ROADGAUNT_OUTRIDER,
  SEPULCHRE_HOUND,
  SHEAFLESS_SHADE,
  SPOILCART_HAND,
  SPOIL_PICKER,
  STUBBLEFIELD_RUNNER,
  TALLOWLIGHT_RUNNER,
  THE_TITHING,
  THE_UNDIVIDED,
  THORNPLATE_WEARER,
  TURFBOUND_SLEEPER,
  UNDERROAD_RANKER,
  WISP,
} from './enemies';

/**
 * Chapter 20 — The Commonage.
 *
 * **Sixty stages**, enemy levels 425 to 455. It **opens at the level chapter 19 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## ⚠️ It is the first chapter longer than fifty, and that is a curve change rather than an
 * exception
 *
 * `CHAPTER_CURVE.maxStages` was fifty and its own doc block called fifty permanent, inviting a
 * deliberate revisit rather than a drift. This is that revisit: the cap is now a **schedule**
 * (`raisedMaxFromChapter` 20, `raisedMaxStages` 60), so this chapter is sixty stages by the same
 * formula that makes chapter 4 forty, and `chapters.spec.ts` still holds every authored chapter
 * equal to `chapterSize`. ⚠️ **A raised cap can only ever apply forward**, so chapters 1 through 19
 * are arithmetically untouched — no shipped stage id moves and no run's position changes.
 *
 * ⚠️ **Sixty stages costs more than ten boards.** The level line is unchanged at half a level a
 * stage, so this chapter climbs **thirty** levels rather than twenty-five while the party's cap
 * does not move at all — every quantity below is thirty levels of squeeze rather than twenty-five,
 * and the pool wall the seam arithmetic projected for chapter 22 arrives inside this one. See
 * "where the boards come from" below.
 *
 * ## What it asks that The Backcut did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own
 * damage at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it
 * **adds up**, and the backcut whether the party can **afford** to spend it. This one asks whether
 * the party gets to **choose where it goes**.
 *
 * A commonage is ground held by everybody and owned by nobody. A host was put into this one in a
 * single grave, because a single grave was what there was time for, and the village went on working
 * the field over the top of it. Both halves are still here and neither is separable from the other.
 * Nothing standing on this ground is one thing, so there is nothing on it worth aiming at in
 * particular.
 *
 * | Band              | Stages | The lock it teaches                                          |
 * | ----------------- | ------ | ------------------------------------------------------------ |
 * | The open common   | 1–10   | nothing to choose between: aiming is free and worth nothing    |
 * | The turned ground | 11–20  | the back rank is bound to itself, so reaching past it spreads  |
 * | The near rows     | 21–30  | the binding moves into the rank the party has to go through    |
 * | The whole field   | 31–40  | bound front and back: no square on the board is a single body  |
 * | The old hedge     | 41–50  | the reflect arrives beside it, so both routes now charge       |
 * | The one grave     | 51–60  | both at once, and the bell that briefly lets go                |
 *
 * ## ⚠️ The chapter's central measurement: a taunt is worth *less than nothing*
 *
 * The obvious way to author "the party does not choose where its damage goes" is a taunt, and it
 * was measured before a board was written. Priced against one calibrated control — four bodies at
 * 300/40 behind an anchor of 420/46 at level 455 and Relic 100, **2,099 common-equivalent, reading
 * 3.35 of five**, and it **moves** (3.95 at 2,018, 2.60 at 2,180, 1.18 at 2,220). Zero timeouts on
 * every row.
 *
 * | shape                                        | survivors | worth     |
 * | -------------------------------------------- | --------- | --------- |
 * | `OATHSHIELD` on the front anchor             | 4.00      | **−0.65** |
 * | `enemy-lowest` / `enemy-highest` stat bait   | 3.98      | −0.63     |
 * | `OATHSHIELD` on two carriers, front and back | 3.80      | −0.45     |
 * | `OATHSHIELD` from the back rank              | 3.63      | −0.28     |
 * | `ROOTBOUND` on the back three                | 3.17      | 0.18      |
 * | `WEAKEN` on `enemy-all`, front carrier       | 2.40      | 0.95      |
 * | `THORNMAIL` on the front two                 | 2.30      | 1.05      |
 * | `SLOW` on `enemy-all`, front carrier         | 1.95      | 1.40      |
 * | `CHAINBOND` cast on `ally-all`               | 1.57      | 1.78      |
 * | `THORNMAIL` on all five                      | 1.07      | 2.28      |
 * | `ROOTBOUND` on all five                      | 1.00      | **2.35**  |
 * | `ROOTBOUND` on all five **plus** a taunt     | 1.63      | 1.72      |
 *
 * 1. ⚠️ **A taunt never costs the party anything at this weight and usually pays it.** Confirmed
 *    off the synthetic control as well: bolted onto the shipped `c19-s50` it reads 3.25 bare
 *    against 3.30 in the front rank and **3.63** from the back. The mechanism is clean — a taunt
 *    *concentrates* the party's damage, and concentration is what a party wants, because one body
 *    dying drops the board's throughput faster than five bodies being chipped.
 * 2. ⚠️ **It is the direct antidote to this chapter's own lock**, which is the sharpest form of the
 *    same statement: a board-wide `ROOTBOUND` reads 1.00 of five and 1.63 with a front-rank taunt
 *    added, so the taunt hands **0.63 straight back**. **No board in The Commonage carries one.**
 * 3. ⚠️ **So the question survived the measurement and the answer inverted.** Taking the choice
 *    away helps the player; what hurts is making the choice **worthless**. Every board here is
 *    arranged so that no aim is better than any other, which is what a link does and what a taunt
 *    is the opposite of.
 * 4. ⚠️ **Baiting the party's own selection rules is worth −0.63 and was declined.** Redistributing
 *    a board's health so one body is far below the rest (soaking `enemy-lowest` finishers) or far
 *    above it (soaking `enemy-highest` turns) reads 3.98 against the control's 3.35 — the same
 *    concentration effect, arriving through a stat line rather than a status. **Reach for the stat
 *    block before the vocabulary is a good rule and this is where it does not apply.**
 *
 * ## ⚠️ Where the boards come from, and why they are the lightest in the campaign
 *
 * The board budget runs **2,145 down to 1,328 common-equivalent** against The Backcut's 3,745 to
 * 5,875 one chapter below. That is not a softer chapter: the party is frozen at `mythic`'s cap of
 * 340 while these boards stand at 425 to 455, so a body worth 420 here asks what a body worth 5,875
 * asked there.
 *
 * 1. ⚠️ **The pool wall arrived inside this chapter rather than at chapter 22.** At level 455 the
 *    lightest five *shipped* commons that can stand together — 2,320 common-equivalent — read **3%
 *    and 0.03 survivors**, and a five of ordinary chapter-19 bodies reads 0%. Of the 258 blocks that
 *    existed before this chapter, **34** sit at or under 450 common-equivalent at level 455 and
 *    **28** at or under 400. Chapter 19 projected `mythic` buying about three chapters on the seam
 *    arithmetic; on the **pool** it buys one and a half, because a sixty-stage chapter climbs thirty
 *    levels rather than twenty-five.
 * 2. ⚠️ **The closing bands needed bodies lighter than anything ever shipped.** At 455 a five-body
 *    board carrying an `ascended` anchor reads 100% at **1,330** common-equivalent and **0%** at
 *    1,535, and the four lightest *Undead or Human* blocks the pool already held total 790 on their own — so no
 *    arrangement of this chapter's own factions plus a boss fits. {@link SHEAFLESS_SHADE} at 150 and
 *    {@link BINDWEED_DEAD} at 170 exist for that band and nothing else.
 *    ⚠️ **The Shade is the lightest body outside the Monster faction and not the lightest in the
 *    game** — twelve blocks sit under it and every one is a Monster, from the Rivenmire Sprinter's
 *    100 up. **So the wall here is a faction squeeze rather than an absolute one**: the bodies exist
 *    and The Quickmire authored them, and fielding them would have meant abandoning the lean. A
 *    chapter 21 leaning Monster would not hit this wall; every other lean will.
 * 3. ⚠️ **Common-equivalent weight counts health and the `ascended` premium applies to every
 *    stat**, which is the trap that cost this session its longest diagnosis. At level 455 an
 *    `ascended` block is worth ×3.792 of a `common` one on *defence and attack* as well as health,
 *    so the final read 0% at every stat line from 230/56 down to **110/20** — the fight lengthening
 *    at each step, which is chapter 19's escort signature pointing at the boss itself rather than at
 *    its escort. What settled it was taking the **attack** down: 200/30 reads 0%, 200/16 reads 13%,
 *    200/10 reads 73% at 64.0s. **Shortlist an anchor on common-equivalent weight and settle it on
 *    attack.**
 * 4. ⚠️ **The lieutenant came down from 250/52 to 190/18 and the final from 230/56 to 175/16.** Both
 *    were settled by fielding every appearance, which is chapter 17's rule with one more appearance
 *    to survive than the rule was written for — see the table below.
 *
 * ## Where the levels come from
 *
 * 425 to 455, half a level a stage, flat — `open + round(30 * (i - 1) / 59)`, so each level stands
 * for two stages and there is nothing to bisect. The slope is every other chapter's; only the span
 * is longer, because the chapter is.
 *
 * ## The rung stays on `mythic`, for the second chapter running, and the pool is what will move it
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`, taken
 * closest in **log** space. Against chapter 19's seam of 2.8677 and this chapter's close of 455,
 * `mythic` reads **1.5373** (|Δln| **0.6237**) and `mythic-plus` **12.9700** (|Δln| **1.5099**).
 * `mythic` wins by 0.886 of a nat.
 *
 * ⚠️ **This is a stay, and a stay needs its own argument.** The Slowgrowth's override was licensed
 * by the seam below it being *wrong* — 0.9608, under 1.00, with no chapter authorable on the old
 * rung at all. Nothing of that kind holds here: 1.5373 is comfortably above 1.00 and the chapter
 * was authorable, if only by writing its closing bands from nothing. ⚠️ **But the reason it was
 * close is the pool rather than the seam**, and a chapter 21 on this rung should re-measure the
 * pool before the arithmetic: the seam projects 0.9150 at chapter 21 and 0.5447 at chapter 22, and
 * the board budget projects lighter than the lightest body in the game.
 *
 * ⚠️ **The seam chain is degenerate for a third link.** Chapters 18, 19 and this one all clamp to
 * `mythic`'s cap of 340, so `SLOWGROWTH`, `BACKCUT` and `INVESTED` are one set of five combatants
 * and the assertions either side of two boundaries are one claim. Chapter 19 predicted this
 * exactly; recorded rather than repaired, as chapters 13 through 17 recorded it one rung down.
 *
 * ## What the chapter measures
 *
 * Every board, all sixty, against the seam party at Relic 100. **Zero boards under the bar, zero
 * timeouts, worst fight 33.0s** against the 0.80 bar's 72.0. Survivors run 5.00 at the open to
 * **3.67** on the final — and 4.00 is a plateau on a `mythic` five rather than a midpoint, so the
 * escalation is read off the difficulty probe instead: the spine runs **11,308 → 18,598, ×1.64**,
 * with a worst adjacent ratio of **0.881** against the 0.85 bar.
 *
 * | The Tithing, all five appearances | reading                       |
 * | --------------------------------- | ----------------------------- |
 * | `c20-s10`, level 430              | 100% / 4.05 survivors / 11.0s |
 * | `c20-s20`, level 435              | 100% / 4.00 / 14.0s           |
 * | `c20-s30`, level 440              | 100% / 4.00 / 16.3s           |
 * | `c20-s40`, level 445              | 100% / 4.00 / 19.2s           |
 * | `c20-s50`, level 450              | 100% / 3.42 / 24.0s           |
 *
 * ⚠️ **At its authored 250/52 the same block graded 3.98 → 2.05 → 0.03 → fail → fail.** An
 * `ascended` body climbs at 1.024 against a party that does not climb at all, and sixty stages is
 * one more appearance than fifty — so the climb-down is steeper than chapter 17's 265→142.
 *
 * ⚠️ **The board weight is smooth in the stage index and the locks step at band boundaries**, which
 * is what makes a boundary read as a step up. A per-band weight drop cancels against the new band's
 * lock: `c20-s53` first measured a probe ratio of **0.780** against the 0.85 bar for exactly that
 * reason. The three stages after each mini-boss are lifted for the same kind of reason, and
 * deliberately **not** in the closing band, which has no weight to spare — `c20-s51` reads 60% and
 * 1.00 of five with the lift on.
 *
 * ## The lean
 *
 * **86.7% Undead over 300 board slots**, with Human texture at 13.3% — in family with The
 * Slowgrowth's 86.0% and The Underroad's 86.4%, counted after the boards landed rather than written
 * from the intent. Thirty-two distinct archetypes, **twelve of the thirty ordinary ones new — 40.0%**,
 * which is a long way above the 25% floor and not by choice: see the pool note above.
 *
 * ⚠️ **Undead has now led twice, at chapter 15 and here, and the repeat is paid for by being a
 * visibly different place.** The Underroad is the dead as a column on a road that stops at nobody's
 * door — an Undead lean with Dwarf texture, the hold's own dead joining the march. This is the dead
 * that never went anywhere, in ground the living never stopped working, so the texture is **Human**
 * and it is the villagers rather than a garrison. No block and no fiction is shared between them.
 *
 * The returning blocks thin across the bands — **11, 6, 8, 4, 4 and 2** distinct — which is the
 * shape The Spoilfield and The Quickmire both recorded, and here it is the weight budget rather
 * than a choice: the closing bands cannot afford a two-hundred-health returning body.
 *
 * ## Gear
 *
 * Every board carries **Relic 100, flat**, as The Quickmire, The Slowgrowth and The Backcut all
 * did. The grade ladder is exhausted and a sixth grade is a `data/` rule change rather than a
 * chapter. ⚠️ **The `gearArchetype` bill was zero for the third chapter running** — every one of the
 * thirty-two blocks fielded here already carried one, because The Underroad paid the Undead bill
 * and The Spoilfield paid the Human one. **That is a fact about the lean, not a trend.**
 */
export const CHAPTER_20 = {
  id: 'chapter-20',
  name: 'The Commonage',
  stages: [
    {
      id: 'c20-s1',
      name: 'Common Ground',
      enemies: {
        front: [MEERSTONE_HUSK, CORTEGE_LANCER],
        back: [WISP, TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 425,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s2',
      name: 'Nothing Here Is Fenced',
      enemies: {
        front: [FORLORN_LEVY, CORTEGE_LANCER],
        back: [STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER, HEAPFOOT_RUMMAGER],
      },
      level: 426,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s3',
      name: 'Whose Field Was This',
      enemies: {
        front: [FORLORN_LEVY, CORTEGE_LANCER],
        back: [CHAFFMOUTH_GAUNT, TALLOWLIGHT_RUNNER, SPOIL_PICKER],
      },
      level: 426,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s4',
      name: 'The Grazing Right',
      enemies: {
        front: [MEERSTONE_HUSK, CORTEGE_LANCER],
        back: [TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER, SPOIL_PICKER],
      },
      level: 427,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s5',
      name: 'Held in Common',
      enemies: {
        front: [MILEWORN_HUSK, FORLORN_LEVY],
        back: [TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER, LAMPLESS_PILGRIM],
      },
      level: 427,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s6',
      name: 'Nobody Owns the Turf',
      enemies: {
        front: [MILEWORN_HUSK, FREE_BLADE],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, LAMPLESS_PILGRIM],
      },
      level: 428,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s7',
      name: 'The Unmarked Half',
      enemies: {
        front: [UNDERROAD_RANKER, FORLORN_LEVY],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, LAMPLESS_PILGRIM],
      },
      level: 428,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s8',
      name: 'Where the Sheep Were',
      enemies: {
        front: [MEERSTONE_HUSK, CORTEGE_LANCER],
        back: [CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER],
      },
      level: 429,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s9',
      name: 'One Gate, No Fence',
      enemies: {
        front: [MILEWORN_HUSK, FREE_BLADE],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, LAMPLESS_PILGRIM],
      },
      level: 429,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s10',
      name: 'The Reeve of Nothing',
      enemies: {
        front: [THE_TITHING, MILEWORN_HUSK],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, STUBBLEFIELD_RUNNER],
      },
      level: 430,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s11',
      name: 'Something Was Turned Here',
      enemies: {
        front: [MILEWORN_HUSK, CAIRNWARD_HUSK],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, BARROWMIST_KEENER],
      },
      level: 430,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s12',
      name: 'Something Under the Sward',
      enemies: {
        front: [MILEWORN_HUSK, CAIRNWARD_HUSK],
        back: [CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER, BARROWMIST_KEENER],
      },
      level: 431,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s13',
      name: 'It Comes Up in Rows',
      enemies: {
        front: [MILEWORN_HUSK, FREE_BLADE],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, BARROWMIST_KEENER],
      },
      level: 431,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s14',
      name: 'Broken Furrow',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER, BARROWMIST_KEENER],
      },
      level: 432,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s15',
      name: 'The Same Depth Everywhere',
      enemies: {
        front: [MILEWORN_HUSK, FREE_BLADE],
        back: [ONEGRAVE_HAND, CHAFFMOUTH_GAUNT, BARROWMIST_KEENER],
      },
      level: 432,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s16',
      name: 'A Grave the Width of a Field',
      enemies: {
        front: [UNDERROAD_RANKER, MILEWORN_HUSK],
        back: [CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER, BARROWMIST_KEENER],
      },
      level: 433,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s17',
      name: 'Turned Once, Turned Again',
      enemies: {
        front: [MILEWORN_HUSK, FREE_BLADE],
        back: [TURFBOUND_SLEEPER, ONEGRAVE_HAND, BARROWMIST_KEENER],
      },
      level: 433,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s18',
      name: 'What the Plough Found',
      enemies: {
        front: [MEERSTONE_HUSK, MILEWORN_HUSK],
        back: [ONEGRAVE_HAND, ROADGAUNT_OUTRIDER, BARROWMIST_KEENER],
      },
      level: 434,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s19',
      name: 'Nothing Comes Up Alone',
      enemies: {
        front: [UNDERROAD_RANKER, MILEWORN_HUSK],
        back: [TURFBOUND_SLEEPER, ONEGRAVE_HAND, BARROWMIST_KEENER],
      },
      level: 434,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s20',
      name: 'The Bound Acre',
      enemies: {
        front: [THE_TITHING, MEERSTONE_HUSK],
        back: [ONEGRAVE_HAND, CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER],
      },
      level: 435,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s21',
      name: 'The Near Rows',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 435,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s22',
      name: 'Between You and It',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 436,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s23',
      name: 'Through the Standing Crop',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 436,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s24',
      name: 'Nothing You Can Walk Past',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, SPOILCART_HAND],
      },
      level: 437,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s25',
      name: 'The Row Holds',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 437,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s26',
      name: 'Cut One, Cut All',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, HARNESS_CUTTER],
      },
      level: 438,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s27',
      name: 'The Nearest Is the Farthest',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER, HARNESS_CUTTER],
      },
      level: 438,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s28',
      name: 'What Stands in Front',
      enemies: {
        front: [UNDERROAD_RANKER, SEPULCHRE_HOUND],
        back: [STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER, SPOILCART_HAND],
      },
      level: 439,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s29',
      name: 'A Hedge of Hands',
      enemies: {
        front: [MEERSTONE_HUSK, SEPULCHRE_HOUND],
        back: [STUBBLEFIELD_RUNNER, TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 439,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s30',
      name: 'The Near Tithe',
      enemies: {
        front: [THE_TITHING, UNDERROAD_RANKER],
        back: [SPOIL_PICKER, WISP, SPOILCART_HAND],
      },
      level: 440,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s31',
      name: 'The Whole Field',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [TURFBOUND_SLEEPER, CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER],
      },
      level: 440,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s32',
      name: 'Bound Front and Back',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [TURFBOUND_SLEEPER, CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER],
      },
      level: 441,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s33',
      name: 'Nowhere It Does Not Go',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [TURFBOUND_SLEEPER, CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER],
      },
      level: 441,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s34',
      name: 'The Field Answers',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [TURFBOUND_SLEEPER, ONEGRAVE_HAND, ROADGAUNT_OUTRIDER],
      },
      level: 442,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s35',
      name: 'Every Blow Divided',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [CHAFFMOUTH_GAUNT, STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 442,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s36',
      name: 'Point at Any of It',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 443,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s37',
      name: 'It Is All One Body',
      enemies: {
        front: [MEERSTONE_HUSK, UNDERROAD_RANKER],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, ROADGAUNT_OUTRIDER],
      },
      level: 443,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s38',
      name: 'Nothing Lands Alone',
      enemies: {
        front: [GRAVEFURROW_WALKER, UNDERROAD_RANKER],
        back: [ONEGRAVE_HAND, CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER],
      },
      level: 444,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s39',
      name: 'The Field Entire',
      enemies: {
        front: [GRAVEFURROW_WALKER, UNDERROAD_RANKER],
        back: [ONEGRAVE_HAND, CHAFFMOUTH_GAUNT, ROADGAUNT_OUTRIDER],
      },
      level: 444,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s40',
      name: 'The Whole Tithing',
      enemies: {
        front: [THE_TITHING, GRAVEFURROW_WALKER],
        back: [WISP, STUBBLEFIELD_RUNNER, SPOIL_PICKER],
      },
      level: 445,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s41',
      name: 'The Old Hedge',
      enemies: {
        front: [THORNPLATE_WEARER, DEADMANS_MAIL],
        back: [TURFBOUND_SLEEPER, ONEGRAVE_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 445,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s42',
      name: 'Grown Through the Gap',
      enemies: {
        front: [QUICKSET_DEAD, THORNPLATE_WEARER],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, SPOIL_PICKER],
      },
      level: 446,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s43',
      name: 'Spines in the Quickset',
      enemies: {
        front: [AFTERGRASS_GLEANER, QUICKSET_DEAD],
        back: [SHEAFLESS_SHADE, BINDWEED_DEAD, SPOIL_PICKER],
      },
      level: 446,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s44',
      name: 'What the Hedge Keeps',
      enemies: {
        front: [GRAVEFURROW_WALKER, THORNPLATE_WEARER],
        back: [SHEAFLESS_SHADE, TURFBOUND_SLEEPER, ONEGRAVE_HAND],
      },
      level: 447,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s45',
      name: 'The Thorn Line',
      enemies: {
        front: [GRAVEFURROW_WALKER, THORNPLATE_WEARER],
        back: [SHEAFLESS_SHADE, TURFBOUND_SLEEPER, ONEGRAVE_HAND],
      },
      level: 447,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s46',
      name: 'Nothing Comes Back Clean',
      enemies: {
        front: [GRAVEFURROW_WALKER, THORNPLATE_WEARER],
        back: [SHEAFLESS_SHADE, ONEGRAVE_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 448,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s47',
      name: 'Cut and Bleed',
      enemies: {
        front: [AFTERGRASS_GLEANER, GRAVEFURROW_WALKER],
        back: [SHEAFLESS_SHADE, ONEGRAVE_HAND, SPOIL_PICKER],
      },
      level: 448,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s48',
      name: 'The Hedge Holds',
      enemies: {
        front: [GRAVEFURROW_WALKER, DEADMANS_MAIL],
        back: [BINDWEED_DEAD, ONEGRAVE_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 449,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s49',
      name: 'Two Ways to Pay',
      enemies: {
        front: [GRAVEFURROW_WALKER, DEADMANS_MAIL],
        back: [BINDWEED_DEAD, ONEGRAVE_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 449,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s50',
      name: 'The Hedge Tithe',
      enemies: {
        front: [THE_TITHING, GRAVEFURROW_WALKER],
        back: [SHEAFLESS_SHADE, WISP, SPOIL_PICKER],
      },
      level: 450,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s51',
      name: 'The One Grave',
      enemies: {
        front: [FALLOWMARCH_WARDEN, BINDWEED_DEAD],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, HARNESS_CUTTER],
      },
      level: 450,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s52',
      name: 'Nobody Here Is One Thing',
      enemies: {
        front: [FALLOWMARCH_WARDEN, BINDWEED_DEAD],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, HARNESS_CUTTER],
      },
      level: 451,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s53',
      name: 'The Bell for All of Them',
      enemies: {
        front: [FALLOWMARCH_WARDEN, SHEAFLESS_SHADE],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, HARNESS_CUTTER],
      },
      level: 451,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s54',
      name: 'Undivided',
      enemies: {
        front: [FALLOWMARCH_WARDEN, SHEAFLESS_SHADE],
        back: [BINDWEED_DEAD, ONEGRAVE_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 452,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s55',
      name: 'No Name on It',
      enemies: {
        front: [PASSBELL_RINGER, SHEAFLESS_SHADE],
        back: [ONEGRAVE_HAND, STUBBLEFIELD_RUNNER, HARNESS_CUTTER],
      },
      level: 452,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s56',
      name: 'The Common Answer',
      enemies: {
        front: [FALLOWMARCH_WARDEN, BINDWEED_DEAD],
        back: [BINDWEED_DEAD, STUBBLEFIELD_RUNNER, SPOIL_PICKER],
      },
      level: 453,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s57',
      name: 'Everything at Once',
      enemies: {
        front: [PASSBELL_RINGER, BINDWEED_DEAD],
        back: [BINDWEED_DEAD, ONEGRAVE_HAND, HARNESS_CUTTER],
      },
      level: 453,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s58',
      name: 'Nothing Left to Aim At',
      enemies: {
        front: [FALLOWMARCH_WARDEN, SHEAFLESS_SHADE],
        back: [BINDWEED_DEAD, SHEAFLESS_SHADE, STUBBLEFIELD_RUNNER],
      },
      level: 454,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s59',
      name: 'The Last Acre',
      enemies: {
        front: [FALLOWMARCH_WARDEN, SHEAFLESS_SHADE],
        back: [BINDWEED_DEAD, SPOIL_PICKER, HARNESS_CUTTER],
      },
      level: 454,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c20-s60',
      name: 'The Undivided',
      enemies: {
        front: [THE_UNDIVIDED, BINDWEED_DEAD],
        back: [BINDWEED_DEAD, SHEAFLESS_SHADE, SPOIL_PICKER],
      },
      level: 455,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
