import {
  BACKCUT_HEWER,
  BACKSTROKE_IRONSIDE,
  BOLTFAST_IRONSIDE,
  BRACEWORK_DELVER,
  CAIRNWARD_HUSK,
  CHARNEL_DRUDGE,
  CINDERQUENCH_BEARER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  EDGETURN_WARDEN,
  GATEFAST_WARDEN,
  GRUDGEBOLT_SLINGER,
  GRUDGEPLATE_SMITH,
  HOLLOWCART_DROVER,
  IRONSLING_WRIGHT,
  IRONTALLY_MASON,
  MARCHWARD_PIKEMAN,
  MILEWORN_HUSK,
  PROPGALLERY_HAND,
  QUENCHWRIGHT,
  RINGWALL_HAMMERER,
  RIVEN_MARCHWARDEN,
  SEAMBOUND_DELVER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SHORTMEASURE_CLERK,
  SLAGBOUND_DRUDGE,
  SPITELAMP_BEARER,
  SPLINTERYARD_HONER,
  THE_BACKSWING,
  THE_INTEREST,
  UNDERROAD_RANKER,
} from './enemies';

/**
 * Chapter 19 — The Backcut.
 *
 * Fifty stages, enemy levels 400 to 425. It **opens at the level chapter 18 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Slowgrowth did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, and the slowgrowth whether it
 * **adds up**. This one asks whether the party can **afford** to spend it.
 *
 * The wood finally gives out against something that was cut rather than grown. Two hundred years
 * ago somebody armoured this place against an argument nobody now remembers, walked out, and never
 * came back to disarm it. Everything down here still answers. Nothing down here is free to hit.
 *
 * | Band              | Stages | The lock it teaches                                          |
 * | ----------------- | ------ | ------------------------------------------------------------ |
 * | The open cut      | 1–10   | the tax exists, and it is standing where you are not aiming    |
 * | The near gallery  | 11–20  | it moves into the rank you have to go through                  |
 * | The bound courses | 21–30  | and reaching past it hands the blow to everything beside it    |
 * | The deep working  | 31–40  | both at once, on the heaviest boards                           |
 * | The oldest cut    | 41–50  | nothing left to aim at that costs nothing                      |
 *
 * ## Where the levels come from
 *
 * 400 to 425, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## The rung stays on `mythic`, and this time the rule and the pool agree
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`, taken
 * closest in **log** space. Against chapter 18's seam of 4.8214 and this chapter's close of 425,
 * `mythic` reads **2.8677** (|Δln| **0.5196**) and `mythic-plus` **24.1942** (|Δln| **1.6130**).
 * `mythic` wins by 1.09 of a nat.
 *
 * ⚠️ **That is the same margin chapter 18 overrode, and this chapter does not override it**, which
 * is the distinction worth stating rather than leaving to be reconstructed. The Slowgrowth's
 * override rested on the seam below it being *wrong* — 0.9608, below 1.00, with a board budget of
 * 129 per body against a pool whose lightest body is 100, so there was no chapter 18 on
 * `legendary-plus` at all. Nothing of that kind is true here: at 2.8677 the seam is comfortably
 * above 1.00, and the pool supplies the budget with room. **A rung move needs an argument each
 * time; "the last chapter moved one" is not one.**
 *
 * ⚠️ **The 0.595 squeeze resumes underneath that, and it is arithmetic rather than a warning.**
 * `mythic` caps at 340 and this chapter closes at 425, so the party is **eighty-five levels** under
 * its last board and every further chapter on this rung divides the seam by
 * `perLevel.common ** 25` = 1.680 exactly as chapters 12 through 17 did on the cap below. Projected
 * forward: chapter 20 reads 1.7069, chapter 21 **1.0161**, chapter 22 **0.6048**. **The rung buys
 * about three chapters, not a horizon** — and the pool runs out first, not the arithmetic. See
 * below.
 *
 * ⚠️ **The seam chain goes degenerate again, one link deep.** Chapter 18 ended a five-link
 * degenerate stretch, and this chapter restarts it: both it and The Slowgrowth clamp to `mythic`'s
 * cap of 340, so `SLOWGROWTH` and `INVESTED` are the same five combatants and the two assertions
 * either side of the boundary are one claim. Recorded rather than repaired, exactly as chapters 13
 * through 17 recorded it.
 *
 * ## ⚠️ What carries the difficulty: where the tax stands, not how big it is
 *
 * Priced against one calibrated control — an anchor of 620/60 behind four bodies of 300/48 at level
 * 425 and Relic 100, **4,390 common-equivalent, reading 3.88 of five**, and it **moves** (4.00 at
 * 3,900, 2.00 at 4,700). Zero timeouts on every row.
 *
 * | shape                                          | survivors | worth    | longest |
 * | ---------------------------------------------- | --------- | -------- | ------- |
 * | `THORNMAIL` on the **back three**              | 3.88      | **0.00** | 36.0s   |
 * | `SUNDER` on `enemy-all`, one front carrier     | 3.77      | 0.10     | 37.7s   |
 * | `ROOTBOUND` on the **back three**              | 3.77      | 0.10     | 37.0s   |
 * | `GUARD` on `ally-all`, one front carrier       | 3.73      | 0.15     | 37.7s   |
 * | `BLOODRISEN` on `self`, all five               | 3.73      | 0.15     | 36.8s   |
 * | `WEAKEN` on `enemy-all`, one front carrier     | 3.58      | 0.30     | 39.0s   |
 * | `THORNMAIL` on the **front two**               | 3.50      | 0.38     | 41.9s   |
 * | `SAVAGED` on `enemy-all`, one front carrier    | 3.35      | 0.52     | 43.0s   |
 * | `THORNMAIL` on **all five**                    | 2.92      | 0.95     | 68.7s   |
 * | `ROOTBOUND` on **all five**                    | 2.83      | 1.05     | 46.0s   |
 * | `ROOTBOUND` all five + `THORNMAIL` anchor      | 2.25      | **1.63** | 55.0s   |
 * | `BLOODRISEN` on `ally-all`, one carrier        | **0.00**  | **3.88** | 33.2s   |
 *
 * 1. ⚠️ **A reflect prices where the party is aiming, and on a protected back rank it prices at
 *    exactly 0.00.** That is the mirror image of The Spoilfield's finding — a board-wide debuffer
 *    measured 4.00 survivors in the front rank and 0.10 in the back, because the party cannot aim
 *    past it. Same rank, opposite sign: a debuffer is worth *more* where it cannot be reached and a
 *    reflect is worth *nothing* there, because it only ever bills what is actually struck.
 *    **Neither is a fact about the status.** This is what the chapter's five bands are made of: the
 *    identical status walks from the back rank to the front to the whole board, and that walk is the
 *    entire difficulty curve.
 * 2. ⚠️ **`BLOODRISEN` is a cliff and not a dial, and it is the sharpest scope-versus-selection
 *    reading on record.** One carrier applying it to `ally-all` on a wound condition is a **total
 *    wipe** — 0.00 survivors, from the front rank *or* the back — while the same status on `self`
 *    across all five reads 0.15 and on `ally-lowest` 0.08. There is nothing between 0.08 and 3.88.
 *    Chapter 17 measured `STUN` at 0.00 on a selection against 2.60 on a scope; this is that finding
 *    at five times the spread, and it is why the chapter's headline mechanic is placement rather
 *    than the wound response the axis first suggested. **No board here carries one.**
 * 3. ⚠️ **All-five reflect is the shape this chapter may not author, and the constraint is the clock
 *    rather than the difficulty.** 68.7 seconds against the 0.80 bar's 72.0 spends most of the
 *    headroom before an anchor's weight is added, and chapter 18's longest board was 34.4s. The
 *    arrangement the late bands actually run on is the link across the board with the reflect held
 *    to the front rank — 1.63 at 55.0s — which is more difficulty and eleven fewer seconds. **A
 *    mechanic can be worth only fight length; check which one it is before spending a band on it.**
 * 4. ⚠️ **The status vocabulary was measured before it was reached for, and most of it is inert
 *    here.** `SUNDER`, `GUARD` and a back-rank link all read 0.10 to 0.15 at this weight. A chapter
 *    that spent boards on those would be texture wearing a mechanic's clothes — so **eleven of the
 *    chapter's twelve new turns are plain damage** and the locks are all `opening` passives. The
 *    twelfth is {@link NOTHING_HERE_IS_FREE}, the final's, which spreads a lock the chapter already
 *    has rather than adding one.
 *    - ⚠️ **That is a claim about the chapter's *new* turns and not about its boards.** The
 *      returning blocks bring their own kits, and across all fifty boards the statuses actually
 *      fielded are `bleed`, `ember-seed`, `oathshield`, `slow`, `stun` and `thornmail` — counted
 *      with a script. **Say which of the two a claim is about**; the difference has shipped a false
 *      one before.
 *
 * ## ⚠️ Chapter 18's final at this chapter's roof, which is the check a third hundred established
 *
 * `c18-s50`'s own board, refielded against this chapter's seam party:
 *
 * | The Last Ring's board, refielded | reading                       |
 * | -------------------------------- | ----------------------------- |
 * | level 400, Relic 100             | 100% / 4.00 survivors / 32.4s |
 * | level 405                        | **85%** / 2.70 / 74.5s        |
 * | level 410                        | **0%** / 0.00                 |
 * | level 425                        | **0%** / 0.00                 |
 *
 * So The Interest is **520/58 against The Last Ring's 860/78**, and the lieutenant 560/62 against
 * The Unhurried's 800/68. The level line is doing the work: an `ascended` block stands ×1.81 higher
 * on the growth curve at 425 than at 400, so it is a bigger body written as a smaller stat block.
 *
 * ⚠️ **The finals do not form a monotone series and it is worth not writing that they do.** By
 * health they run The Undercut 1780, The Doorstone 1480, The Unnumbered 680, The Inheritor 250, The
 * Latecomer 112, **The Last Ring 860** and now **The Interest 520** — five chapters of shrinking,
 * one chapter that went up by a factor of seven when the rung moved, and one that came back down.
 * **A stat line is a reading of one chapter's rung and level together**; the quantity that carries
 * across is the final's *share of its own board*, which runs 43% for The Last Ring and 38% here.
 *
 * ⚠️ **The lieutenant is heavier in raw health than the final and that is not an error.** It is
 * fielded at levels 405 to 420 and the final at 425, but far more importantly it stands on boards
 * built around it while the final stands on the one board in the chapter that also carries a
 * board-wide reflect. **A stat line only means something beside the board it is authored for.**
 *
 * ## What it draws on
 *
 * Thirty-two ordinary archetypes excluding the lieutenant and the final: **eight new, twenty-four
 * returning — 25.0%**, against a quota of 25%. Thirty-four distinct bodies in all, over 250 board
 * slots. The pool goes 248 → 258.
 *
 * ⚠️ **The quota lands at the quota for the second chapter running**, which is the rung move still
 * paying out. The Quickmire was 57.7% new and not by choice, because only thirteen shipped blocks
 * were light enough to stand anywhere in it. Here the chapter's ordinary slots run **380 to 2,140
 * common-equivalent with a median of 760**, and **166 of the 248 blocks that existed before it sit
 * inside that band at level 425** — so the chapter fields the blocks it wants rather than the blocks
 * it can lift.
 *
 * ⚠️ **State the band a count is against, because the band moves every chapter and the pool does
 * not.** The Slowgrowth's ordinary slots sat at 766–1,088 and 116 of 238 blocks fitted; quoting that
 * width here would have read 101 of 248 and understated the pool by a third. The pool's own median
 * at level 425 is **1,388**, which is inside this chapter's band and was outside chapter 17's
 * entirely.
 *
 * ⚠️ **The lean is Dwarf and it takes the faction 34 → 44.** The seven ran angel 24, demon 25,
 * dwarf 34, undead 35, human 36, elf 43, monster 51 before this chapter, with both celestials
 * barred from leading because a celestial deals ×1.10 to every mortal and the matrix has no
 * mortal → celestial row. Dwarf was the thinnest legal lead **and** the mortal faction with the
 * fewest leads — two, at chapters 9 and 14, against three each for undead, human and elf and four
 * for monster. **Recompute the depths before the next lean**; this is the ninth session running
 * where one lean reverses the ordering.
 *
 * ⚠️ **It is a third Dwarf-led chapter and what a repeat costs is that it has to be a different
 * place.** The Hollow Anvil is the Dwarves at the forge; The Shutgate is the Dwarves holding a door
 * shut; The Backcut is the Dwarves two centuries after they stopped holding anything, where the
 * only thing still working is what they left armed.
 *
 * ⚠️ **The `gearArchetype` bill was zero, and that is a fact about the lean rather than about the
 * chapter.** All 34 Dwarf blocks already carried one, because The Shutgate paid that bill five
 * chapters ago, and all six Undead blocks this chapter fields carried one because The Underroad paid
 * for those. **Not one of the thirty-four bodies here needed an edit before a board could be
 * authored**, checked with a script over the boards rather than over the pool — which is the count
 * that matters, since a block that is never fielded costs nothing whatever it declares. **A session
 * leaning on a faction that has not yet led a geared chapter should still expect the bill**: it is
 * 26 of 35 across the whole Undead pool and only 19 of 36 across the Human one.
 *
 * ⚠️ **The lean measures 84.8% of board slots, counted after the boards landed rather than written
 * from the intent** — the failure The Shutgate's header records making. Against the shipped eleven
 * that is mid-family: the Weald 81.5%, The Standing Line 83.2%, The Bleeding Wild 83.9%, The
 * Spoilfield 84.0%, **The Backcut 84.8%**, The Quarry and The Shutgate 85.2%, The Slowgrowth 86.0%,
 * The Underroad 86.4%, The Quickmire 86.8%, The Rustwood 92%.
 *
 * ⚠️ **The 38 non-lean slots are all Undead and they thin across the bands — 13, 10, 8, 5, 2.**
 * That is the drowned road of the two chapters below finally running out against cut stone. Unlike
 * The Slowgrowth's identical shape it does **not** reach zero: band 5 fields two Undead slots, so
 * the chapter makes no absolute claim about its closing band that a later session would have to
 * re-check.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Interest is the nineteenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here. The lieutenant does not stand on it —
 * chapters 9 through 18 all declined that and so does this one.
 *
 * ## ⚠️ What restores anything here, counted rather than claimed
 *
 * ⚠️ **This section was first written as "nothing here restores anything" and the script said
 * otherwise, which is the fourth time that exact claim has been caught and the fifth time the word
 * "regeneration" has been the fault.** Three towers shipped it and chapter 18 wrote it truthfully;
 * writing it here by pattern-match would have shipped it false. **`recovery`, `healthRegen`,
 * `lifeLeech` and a `regen` status are four different things and an absolute about them is only
 * ever safe once it has been counted.**
 *
 * Measured over all fifty boards and all thirty-four blocks with a script, stated as counts and
 * scoped to what was measured:
 *
 * - **2 of 34 blocks carry `recovery`** — the Cairn Sentinel and the Riven Marchwarden;
 * - **1 carries `healthRegen`** — the Cairn Sentinel, the only body in the chapter carrying both;
 * - **1 carries `lifeLeech`** — the Sepulchre Hound;
 * - **0 field a heal, 0 field a drain, and 0 field a shield or a ward of any kind.**
 *
 * ⚠️ **The absolute the chapter does make is about the *front rank*, and it is one board wide.**
 * Every body carrying any of the three above stands where the party can reach it: the Cairn Sentinel
 * and the Riven Marchwarden are front-rank anchors on every board that fields them, and the
 * Sepulchre Hound is a 560-health common. **Sustain the party cannot aim past is a clock**, and
 * nothing here is behind a taunt it cannot answer — measured, the longest fight in the chapter is
 * **48.0 seconds** against a ninety-second timer and the 0.80 bar's 72.0, with **zero timeouts on
 * all fifty boards**.
 *
 * ⚠️ **The chapter carries exactly one board-wide turn on exactly one board**, checked with a
 * script rather than by reading: {@link NOTHING_HERE_IS_FREE} on `c19-s50`, cast from the **front**
 * rank. Chapter 17 ended up at one per board after pairing two `SLOW` casters and reading 48%; this
 * chapter is stricter than the rule, because its locks are `opening` passives and a cast board-wide
 * turn is the final's alone.
 *
 * ## What the sweep reads
 *
 * Across all fifty boards against the seam party: **every board a 100% win rate**, the fewest
 * survivors **3.52** (the final) against a mean of 4.37, the longest fight **48.0 seconds** and
 * **zero timeouts anywhere**. The difficulty probe's spine runs **7,076 → 18,530** with a worst
 * adjacent ratio of **0.874** against a bar of 0.85, and the chapter's foot-to-top averages read
 * **9,631 → 16,397**.
 *
 * ⚠️ **4.00 survivors is a plateau on a `mythic` five, not a midpoint**, which is why the survivor
 * column is used only as a legality check. Measured on this chapter's own control the party holds
 * 4.00 flat from 3,900 to 4,700 common-equivalent and falls to 2.00 by 4,900 — so a board reading
 * 4.00 says "legal", not "tuned". **The escalation is budgeted on the probe threshold.**
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier back rank, a legendary in a common's slot — never with +3 enemy
 *    levels, which fights the level curve for about 13%.
 * 2. ⚠️ **The probe's phase is the inverse of chapter 18's and was computed rather than assumed.**
 *    Chapter 19 opens at linear index 800, so the stride lands on s1, s5, s9, s13, s17, s21, s25,
 *    s29, s33, s37, s41, s45, s49 and the final. **All three odd band openers (s1, s21, s41) are
 *    samples where chapter 18's were s11 and s31 — so three of the five bands may not open lightly
 *    — and none of the four mini-bosses is a sample.** Check which stages the stride reads before
 *    authoring; band openings *want* to be light and the stride does not care.
 * 3. ⚠️ **Every board was measured; no scalar was trusted.** Chapter 18 tried common-equivalent
 *    health, attack-equivalent and a throughput product and all three mis-rank a board, because
 *    difficulty is throughput times fight length and fight length is set by the health. Weight is
 *    used to shortlist and the difficulty probe's own threshold to budget the spine.
 */
export const CHAPTER_19 = {
  id: 'chapter-19',
  name: 'The Backcut',
  stages: [
    // -----------------------------------------------------------------------------------
    // The open cut — stages 1 to 10, levels 400 to 405
    //
    // Daylight still reaches the first few hundred feet, and the wood the party has spent two
    // chapters in is still growing in through the mouth of it. ⚠️ **All ten boards carry the tax and
    // all ten carry it in the back rank**, on the new {@link PROPGALLERY_HAND} and the returning
    // {@link CAIRNWARD_HUSK}, where a reflect measures **0.00** against 0.38 in the front — counted
    // with a script rather than asserted. That is the band's whole teaching: the mechanic is visible
    // and free, so what it costs later reads as a change of position rather than as a new rule.
    //
    // ⚠️ **The one front-rank carrier in the band is the lieutenant on `c19-s10`**, which is stated
    // because the obvious way to write this section is as an absolute and the absolute is false. A
    // mini-boss is where the band's lesson is charged for, not where it is taught.
    //
    // ⚠️ **This is where the Undead texture is thickest** — thirteen slots of the chapter's
    // thirty-eight — because the drowned road of the two chapters below is what the party is
    // walking in on. It thins to two by band 5.
    //
    // ⚠️ **`c19-s1` is a difficulty-probe sample and two of the other four band openers are not.**
    // The stride lands on s1, s21 and s41 here where chapter 18's landed on s11 and s31, so this
    // band may not open lightly. It reads 7,076 on the probe against `c19-s5`'s 9,730.
    // -----------------------------------------------------------------------------------

    {
      id: 'c19-s1',
      name: 'Where the Wood Stops',
      enemies: {
        front: [SENTINEL, BACKCUT_HEWER],
        back: [PROPGALLERY_HAND, MARCHWARD_PIKEMAN, CAIRNWARD_HUSK],
      },
      level: 400,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s2',
      name: 'Somebody Cut This',
      enemies: {
        front: [SPLINTERYARD_HONER, DEEPROCK_MINER],
        back: [PROPGALLERY_HAND, CHARNEL_DRUDGE, SEPULCHRE_HOUND],
      },
      level: 401,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s3',
      name: 'The Mouth of the Working',
      enemies: {
        front: [SENTINEL, SHORTMEASURE_CLERK],
        back: [CAIRNWARD_HUSK, GATEFAST_WARDEN, DEEPGALLERY_RUNNER],
      },
      level: 401,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s4',
      name: 'Two Hundred Years Unswept',
      enemies: {
        front: [IRONSLING_WRIGHT, BACKCUT_HEWER],
        back: [PROPGALLERY_HAND, SLAGBOUND_DRUDGE, UNDERROAD_RANKER],
      },
      level: 402,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s5',
      name: 'Still Lit',
      enemies: {
        front: [QUENCHWRIGHT, COLDFORGE_HAND],
        back: [SPITELAMP_BEARER, CAIRNWARD_HUSK, CHARNEL_DRUDGE],
      },
      level: 402,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s6',
      name: 'The Road Gives Out',
      enemies: {
        front: [SPLINTERYARD_HONER, DEEPGALLERY_RUNNER],
        back: [PROPGALLERY_HAND, MARCHWARD_PIKEMAN, SEPULCHRE_HOUND],
      },
      level: 403,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s7',
      name: 'Cut Straight and Left',
      enemies: {
        front: [SENTINEL, COLDFORGE_HAND],
        back: [SHORTMEASURE_CLERK, CAIRNWARD_HUSK, BRACEWORK_DELVER],
      },
      level: 403,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s8',
      name: 'Nobody Came Back for It',
      enemies: {
        front: [IRONSLING_WRIGHT, BACKCUT_HEWER],
        back: [PROPGALLERY_HAND, GATEFAST_WARDEN, MILEWORN_HUSK],
      },
      level: 404,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s9',
      name: 'The First Face',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, DEEPROCK_MINER],
        back: [SPITELAMP_BEARER, CAIRNWARD_HUSK, MILEWORN_HUSK],
      },
      level: 404,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s10',
      name: 'What It Cost to Cut',
      enemies: {
        front: [THE_BACKSWING, BACKCUT_HEWER],
        back: [PROPGALLERY_HAND, MARCHWARD_PIKEMAN, CHARNEL_DRUDGE],
      },
      level: 405,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The near gallery — stages 11 to 20, levels 405 to 410
    //
    // The tax walks forward one rank, and that is the entire escalation. ⚠️ **The identical status
    // on comparable bodies is worth 0.08 in the back rank and 0.38 in the front**, so this band
    // authors {@link BACKSTROKE_IRONSIDE} and moves {@link PROPGALLERY_HAND} up beside it rather
    // than reaching for anything new. A party that learned band 1's habit of opening on the front
    // rank arrives holding exactly the wrong one.
    //
    // ⚠️ **Counted: all ten boards carry at least one front-rank reflect and none carries one in the
    // back** — the only band in the chapter of which that is true in both directions.
    //
    // ⚠️ **{@link GRUDGEBOLT_SLINGER} appears here and it is the block that nearly broke the
    // chapter.** Its first draft carried two `enemy-back` turns and read **0% beside any second
    // legendary**; at one turn and 60 attack it reads 100% with 4.10 of five alone. Two reaching
    // turns on one body is not a heavier body — it is the party's back rank deleted before its
    // front rank has moved.
    // -----------------------------------------------------------------------------------

    {
      id: 'c19-s11',
      name: 'A Rank You Have to Go Through',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, PROPGALLERY_HAND],
        back: [SHORTMEASURE_CLERK, BRACEWORK_DELVER, HOLLOWCART_DROVER],
      },
      level: 405,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s12',
      name: 'The Iron Was Left Standing',
      enemies: {
        front: [GRUDGEPLATE_SMITH, BACKCUT_HEWER],
        back: [SPITELAMP_BEARER, GATEFAST_WARDEN, CHARNEL_DRUDGE],
      },
      level: 406,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s13',
      name: 'Everything Answers',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, CAIRNWARD_HUSK],
        back: [GRUDGEBOLT_SLINGER, MARCHWARD_PIKEMAN, DEEPGALLERY_RUNNER],
      },
      level: 406,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s14',
      name: 'Hand on the Prop',
      enemies: {
        front: [RINGWALL_HAMMERER, PROPGALLERY_HAND],
        back: [SHORTMEASURE_CLERK, SLAGBOUND_DRUDGE, UNDERROAD_RANKER],
      },
      level: 407,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s15',
      name: 'The Backstroke',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, COLDFORGE_HAND],
        back: [CHARNEL_DRUDGE, GATEFAST_WARDEN, CINDERQUENCH_BEARER],
      },
      level: 407,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s16',
      name: 'Down the Straight',
      enemies: {
        front: [GRUDGEPLATE_SMITH, DEEPROCK_MINER],
        back: [GRUDGEBOLT_SLINGER, CHARNEL_DRUDGE, CINDERQUENCH_BEARER],
      },
      level: 408,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s17',
      name: 'Struck and Struck Back',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, PROPGALLERY_HAND],
        back: [BACKCUT_HEWER, BRACEWORK_DELVER, HOLLOWCART_DROVER],
      },
      level: 408,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s18',
      name: 'The Near Rank',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, CAIRNWARD_HUSK],
        back: [SHORTMEASURE_CLERK, MARCHWARD_PIKEMAN, CINDERQUENCH_BEARER],
      },
      level: 409,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s19',
      name: 'Two Sets of Spines',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, GRUDGEPLATE_SMITH],
        back: [COLDFORGE_HAND, DEEPGALLERY_RUNNER, UNDERROAD_RANKER],
      },
      level: 409,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s20',
      name: 'Paid Either Way',
      enemies: {
        front: [THE_BACKSWING, PROPGALLERY_HAND],
        back: [GRUDGEBOLT_SLINGER, MARCHWARD_PIKEMAN, MILEWORN_HUSK],
      },
      level: 410,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The bound courses — stages 21 to 30, levels 410 to 415
    //
    // Masonry, and the Dwarven answer to the Elves' third band. ⚠️ **{@link ROOTBOUND} is authored
    // as an `opening` and only ever shares to other holders of the same id**, so a board binds the
    // bodies that carry it — {@link IRONTALLY_MASON} and {@link SEAMBOUND_DELVER} — and leaves its
    // wall out of it. With the reflect held in the front rank the party is taxed both ways: hitting
    // the near rank pays the reflect, and reaching past it hands a third of the blow to everything
    // bound beside the target. **Neither route is free and neither is closed** — a route question
    // rather than a wall.
    //
    // ⚠️ **Counted rather than claimed: all ten boards carry two link holders**, eight carry a
    // front-rank reflect, and one — `c19-s28` — carries its reflect in the back on a returning
    // {@link CAIRNWARD_HUSK}. **The chapter has no board on which both locks are absent.**
    //
    // ⚠️ **`c19-s21` is the one board in the chapter that had to be fixed with weight**, and it is
    // the trap the band-opener rule names: it is a probe sample, it opened light, and it read
    // **0.798** of the sample before it against a bar of 0.85. Standing a second reflect carrier in
    // its front rank took it to **12,708** — a ratio of 0.960 — with no level moved. **A step
    // backwards is fixed with weight, never with levels.**
    // -----------------------------------------------------------------------------------

    {
      id: 'c19-s21',
      name: 'Set Into the Course',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, GRUDGEPLATE_SMITH],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, MARCHWARD_PIKEMAN],
      },
      level: 410,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s22',
      name: 'Stone Laid to Hold Stone',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, UNDERROAD_RANKER],
      },
      level: 411,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s23',
      name: 'Course by Course',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, SHORTMEASURE_CLERK],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, SLAGBOUND_DRUDGE],
      },
      level: 411,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s24',
      name: 'Reaching Past It',
      enemies: {
        front: [RINGWALL_HAMMERER, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, COLDFORGE_HAND, SEPULCHRE_HOUND],
      },
      level: 412,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s25',
      name: 'The Whole Wall Feels It',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, PROPGALLERY_HAND],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, CHARNEL_DRUDGE],
      },
      level: 412,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s26',
      name: 'Bound Where It Was Cut',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, MILEWORN_HUSK, MARCHWARD_PIKEMAN],
      },
      level: 413,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s27',
      name: 'A Third of It Goes Sideways',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, BRACEWORK_DELVER],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, CHARNEL_DRUDGE],
      },
      level: 413,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s28',
      name: 'The Mason Stayed',
      enemies: {
        front: [BOLTFAST_IRONSIDE, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, CAIRNWARD_HUSK, DEEPGALLERY_RUNNER],
      },
      level: 414,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s29',
      name: 'Neither Way Is Free',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, COLDFORGE_HAND, CHARNEL_DRUDGE],
      },
      level: 414,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s30',
      name: 'What the Courses Hold Shut',
      enemies: {
        front: [THE_BACKSWING, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, MARCHWARD_PIKEMAN, UNDERROAD_RANKER],
      },
      level: 415,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The deep working — stages 31 to 40, levels 415 to 420
    //
    // Both locks at once, on the heaviest boards the chapter fields, and the heavy returning
    // anchors — {@link BOLTFAST_IRONSIDE}, {@link EDGETURN_WARDEN}, {@link RIVEN_MARCHWARDEN} —
    // arrive here rather than earlier.
    //
    // ⚠️ **The link goes across the board and the reflect stays in the front rank**, which measured
    // **1.63 of a survivor at 55.0s worst** against all-five reflect's 0.95 at **68.7s**. More
    // difficulty and thirteen fewer seconds, which is the whole reason the arrangement is this way
    // round rather than the obvious one. **The 0.80 bar is 72.0 seconds and it is the binding
    // constraint on this band, not the survivor count.**
    //
    // ⚠️ **No board in the chapter carries two bodies over 1,600 common-equivalent**, checked with a
    // script. Every one of the returning anchors reads 100% with four of five alive *alone* at level
    // 425; what fails is the **pairing**, which is the Angel Tower's third-hundred finding arriving
    // on a campaign board. Two heavy anchors in one front rank read **0%** at 5,536.
    //
    // ⚠️ **Counted: all ten boards carry two link holders, seven carry a front-rank reflect and one
    // carries one in the back.** Three boards — `c19-s32`, `c19-s34` and `c19-s37` — carry the link
    // and no reflect at all, which is deliberate texture rather than an oversight: a band in which
    // every board asks both questions has no shape.
    // -----------------------------------------------------------------------------------

    {
      id: 'c19-s31',
      name: 'Where the Daylight Stopped',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 415,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s32',
      name: 'Armoured Against Nothing',
      enemies: {
        front: [EDGETURN_WARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, COLDFORGE_HAND, DEEPGALLERY_RUNNER],
      },
      level: 416,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s33',
      name: 'The Argument Nobody Remembers',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, BRACEWORK_DELVER, DEEPROCK_MINER],
      },
      level: 416,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s34',
      name: 'Deep Enough to Be Quiet',
      enemies: {
        front: [BOLTFAST_IRONSIDE, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, SLAGBOUND_DRUDGE, UNDERROAD_RANKER],
      },
      level: 417,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s35',
      name: 'Every Blow Written Down',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, RIVEN_MARCHWARDEN],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, DEEPGALLERY_RUNNER],
      },
      level: 417,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s36',
      name: 'The Sealed Course',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, CHARNEL_DRUDGE],
      },
      level: 418,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s37',
      name: 'Nothing Down Here Wore Out',
      enemies: {
        front: [EDGETURN_WARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, MARCHWARD_PIKEMAN, MILEWORN_HUSK],
      },
      level: 418,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s38',
      name: 'The Long Gallery',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, CAIRNWARD_HUSK, BRACEWORK_DELVER],
      },
      level: 419,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s39',
      name: 'Struck Once, Charged Twice',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, BOLTFAST_IRONSIDE],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, CHARNEL_DRUDGE],
      },
      level: 419,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s40',
      name: 'The Account Runs Deep',
      enemies: {
        front: [THE_BACKSWING, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 420,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The oldest cut — stages 41 to 50, levels 420 to 425
    //
    // The face they were working when they left, and the only part of the workings that was never
    // meant to be walked out of.
    //
    // ⚠️ **The final is the one board in fifty that spreads the reflect across everything at once**,
    // and it is the chapter's argument finished rather than a new one: everywhere else The Backcut
    // charges for aiming at one thing, and here there is nothing left to aim at that is free.
    //
    // ⚠️ **Counted rather than claimed, because the tempting sentence here is an absolute and it is
    // false: seven of the ten boards carry a front-rank reflect, none carries one in the back, and
    // nine of the ten carry two link holders.** The tenth is the final, which carries no link and
    // casts the reflect instead. **State the counts; the range a threshold covers grows underneath
    // it and an absolute about a band is wrong the day a body moves.**
    //
    // ⚠️ **Two Undead slots survive into this band and no more.** The Slowgrowth's texture reached
    // zero in its closing band; this one does not, deliberately, so the chapter makes no absolute
    // claim here that a later session would have to re-measure.
    // -----------------------------------------------------------------------------------

    {
      id: 'c19-s41',
      name: 'The Face They Were Working',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 420,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s42',
      name: 'Left Armed',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, EDGETURN_WARDEN],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, SLAGBOUND_DRUDGE],
      },
      level: 421,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s43',
      name: 'Two Hundred Years of Interest',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, SLAGBOUND_DRUDGE, SEPULCHRE_HOUND],
      },
      level: 421,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s44',
      name: 'The Deepest Course',
      enemies: {
        front: [EDGETURN_WARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, CHARNEL_DRUDGE],
      },
      level: 422,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s45',
      name: 'Nobody Was Coming Back',
      enemies: {
        front: [BACKSTROKE_IRONSIDE, RIVEN_MARCHWARDEN],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, GATEFAST_WARDEN],
      },
      level: 422,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s46',
      name: 'What Was Still Owed',
      enemies: {
        front: [BOLTFAST_IRONSIDE, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, SLAGBOUND_DRUDGE, MARCHWARD_PIKEMAN],
      },
      level: 423,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s47',
      name: 'The Cut That Answers',
      enemies: {
        front: [RIVEN_MARCHWARDEN, GRUDGEPLATE_SMITH],
        back: [IRONTALLY_MASON, SEAMBOUND_DELVER, COLDFORGE_HAND],
      },
      level: 423,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s48',
      name: 'Nothing Left Standing Idle',
      enemies: {
        front: [EDGETURN_WARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, GATEFAST_WARDEN, BRACEWORK_DELVER],
      },
      level: 424,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s49',
      name: 'The Last Face',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SEAMBOUND_DELVER],
        back: [IRONTALLY_MASON, SLAGBOUND_DRUDGE, GATEFAST_WARDEN],
      },
      level: 424,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c19-s50',
      name: 'The Interest',
      enemies: {
        front: [THE_INTEREST, PROPGALLERY_HAND],
        back: [MARCHWARD_PIKEMAN, SLAGBOUND_DRUDGE, GATEFAST_WARDEN],
      },
      level: 425,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
