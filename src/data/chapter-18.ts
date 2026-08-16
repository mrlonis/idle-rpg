import {
  BRAMBLEWALK_SCOUT,
  CAIRNWARD_HUSK,
  CENTURYBOUGH_WARDEN,
  CORROWEALD_SINGER,
  CORTEGE_LANCER,
  CROWNBARK_BASTION,
  DEEPMAST_HEARTWOOD,
  DROWNED_MAST,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GRAVEMOURN_KEEPER,
  HOLLOWBARK_SENTRY,
  HOLLOWCART_DROVER,
  IRONBARK_WARDEN,
  IRONWAKE_VANGUARD,
  MIREMAST_TRUNK,
  MOONSONG_WEAVER,
  QUICKLIME_SERJEANT,
  QUILLRUST_DARTER,
  RINGBARK_ELDER,
  RUSTLEAF_GLEANER,
  SCALEPLATE_BRAMBLE,
  SILTCROWN_CANOPY,
  SKYSHRIKE,
  SLAGBLOOM_THICKET,
  SLOWGROWTH_BOLE,
  SPOILWOOD_REAVER,
  STILLWATER_ROOT,
  SUNFADE_CHANTER,
  THE_LAST_RING,
  THE_UNHURRIED,
  UNDERBOUGH_CREEPER,
  WEALDSHADOW_STALKER,
} from './enemies';

/**
 * Chapter 18 — The Slowgrowth.
 *
 * Fifty stages, enemy levels 375 to 400. It **opens at the level chapter 17 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Quickmire did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, and the quickmire whether it can be **spent fast enough**. This one asks whether it
 * **adds up**.
 *
 * The Quickmire was water with no bottom where nothing heavy had survived. Two days further the
 * water finds something with a bottom, and what it found has had two hundred years and nobody to cut
 * it. Everything here is slow. Everything here is enormous. Nothing here is in a hurry, and the
 * chapter's whole question is whether the party has enough damage, full stop.
 *
 * | Band               | Stages | The lock it teaches                                        |
 * | ------------------ | ------ | ---------------------------------------------------------- |
 * | The standing water | 1–10   | the wall is not the threat; it is the reason you are late   |
 * | The first ring     | 11–20  | one board-wide voice, and it stands where you can reach it  |
 * | The deepmast       | 21–30  | a reach across the front row, and a reach into the back     |
 * | The closing canopy | 31–40  | the heaviest boards, and the longest fights                 |
 * | The oldest of it   | 41–50  | nothing here came from anywhere else                        |
 *
 * ## Where the levels come from
 *
 * 375 to 400, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## ⚠️ This is the first chapter in seven to move a rung, and it is the whole story
 *
 * Chapters 11 through 17 all sat on `legendary-plus`, whose cap of **260** the ladder passed at
 * chapter 12. With the party frozen at that cap and the content climbing 25 levels a chapter, every
 * board had to fall by `perLevel.common ** -25` = **0.595** just to stay winnable — six consecutive
 * halvings that took a board from 2,715 common-equivalent to **763** and drove the seam ratio
 * **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 → 0.9608**, below 1.00 for the first time.
 *
 * ⚠️ **Carried one chapter further it runs out, and that is arithmetic rather than an opinion.** On
 * `legendary-plus` this chapter's budget would have been **645 → 454** common-equivalent, which is
 * **129 → 91 per body on a board of five**. Of the **238** blocks that existed before The
 * Slowgrowth, **five** sit at or under 129 and **none** at or under 91 — the lightest body this game
 * has ever shipped is 100. There is no arrangement of the pool that fields a closing band, and no
 * new block could be authored for one either.
 *
 * ⚠️ **`mythic` was ruled out at chapter 15 on a measurement, and the measurement has inverted.**
 * The Underroad recorded that a `mythic` five needs boards scaled ×2.4 — an anchor near 3,550 health
 * against {@link UNMADE}'s ceiling of 1800 — and chapters 16 and 17 both repeated it. That was true
 * of chapter 15's boards and is false of this chapter's, because three further halvings happened
 * underneath the claim. Measured: a `mythic` five stands **×8.44** above a `legendary-plus` one, so
 * the budget is **5,442 → 3,830** common-equivalent, **1,088 → 766 per body**, against a pool whose
 * median at level 400 is **1,295**. ⚠️ **116 of 238 blocks sit inside the ordinary-slot band where
 * 13 did for The Quickmire.** The Unmade is 5,820 there, so the ceiling is no longer binding and is
 * not trivial either. **Re-measure a projection before carrying it forward.**
 *
 * The seam therefore reads **4.8214**, against 0.9608 for chapter 17 and **0.5718** for a chapter 18
 * that had stayed put. ⚠️ **It loses the log-space comparison and was taken anyway**: against chapter
 * 17's own seam, `legendary-plus` reads 0.5715 (|Δln| **0.5195**) and `mythic` 4.8214 (|Δln|
 * **1.6131**). The rule that picks a rung assumes the seam below it was itself correct, and a seam
 * below 1.00 is the defect this chapter exists to end. **Stated as an override rather than as a
 * derivation**, because the next session should know which of the two it is looking at.
 *
 * ⚠️ **It also ends the degenerate seam chain.** Chapters 13 through 17 all clamped to 260, so five
 * consecutive seam parties were the same five combatants and the assertions either side of four
 * boundaries were one claim. This party clamps to **340**.
 *
 * ## ⚠️ What carries the difficulty: not health, and that is the finding
 *
 * The chapter's axis is weight, and **weight measured as health grades 0.00**. Against a control of
 * five walls at level 390 with attack held fixed, health from **×1.0 to ×2.8** — absolute weight
 * 14,043 to 39,321 — reads **4.00 survivors at every single row with zero timeouts**, and buys
 * nothing but fight length: 25.7s to 62.6s. Held the other way, attack from ×1.0 to ×1.9 reads
 * **4.00 → 4.00 → 3.92 → 0.00**. A cliff.
 *
 * ⚠️ **So durability is this chapter's identity and its difficulty is the attack standing behind
 * it.** That is the same shape chapter 14 measured across its whole refusal vocabulary and chapter
 * 16 measured on gear — *a mechanic can be worth only fight length, and that is the ninety-second
 * clock rather than a difficulty*. Pushing health alone would have walked the chapter into the
 * timer: ×2.8 already reads 62.6s against the 0.80 bar's 72. **Every board here is a wall the party
 * has to chew through and something behind it that is actually killing them**, and no board is five
 * hides.
 *
 * ⚠️ **No scalar predicts a board and three were tried.** Common-equivalent health, attack-equivalent
 * and a throughput product all mis-rank the shipped boards — a five-wall board at 12,673 absolute
 * weight reads 4.00 where a five-attacker board at 12,920 reads **0.97**, because difficulty is
 * throughput times fight length and fight length is set by the health. **Measure every authored
 * board**; the number used to budget the spine here is the difficulty probe's own quantity.
 *
 * ## What it draws on
 *
 * Thirty-one ordinary archetypes excluding the lieutenant and the final: **eight new, twenty-three
 * returning — 25.8%**, against a quota of 25%. Thirty-three distinct bodies in all, over 250 board
 * slots. The pool goes 238 → 248.
 *
 * ⚠️ **The quota is met at the quota for the first time since chapter 16**, and that is the rung move
 * showing up in a second place. The Quickmire was **57.7% new and not by choice**, because thirteen
 * shipped blocks were light enough to field at all; here the whole pool is available again and the
 * chapter fields the blocks it wants rather than the blocks it can lift.
 *
 * ⚠️ **The lean is Elf and it takes the faction 33 → 43.** The seven ran angel 24, demon 25, elf 33,
 * dwarf 34, undead 35, human 36, monster 51 before this chapter, with both celestials barred from
 * leading because a celestial deals ×1.10 to every mortal and the matrix has no mortal → celestial
 * row. Elf was the thinnest legal lead. **Recompute the depths before the next lean**; this is the
 * eighth session running where one lean reverses the ordering.
 *
 * ⚠️ **It is a third Elf-led chapter and what a repeat costs is that it has to be a different
 * place.** The Sunless Weald is the Elves at home; The Rustwood is the Elves out on somebody else's
 * battlefield picking it over; The Slowgrowth has no Elves in it at all in the sense the other two
 * do — it is what their wood did once nobody was tending it.
 *
 * ⚠️ **Elf is the awkward faction to hang a durability axis on, deliberately.** Dwarves own the
 * tankiest blocks in the game, so a Dwarven version writes itself and is the one most able to run the
 * clock out. The Elf idiom is precision and crit, so weight here had to be *wood* rather than armour.
 *
 * ⚠️ **The lean measures 86.0% of board slots, counted after the boards landed rather than written
 * from the intent** — the failure The Shutgate's header records making. Against the shipped ten that
 * is mid-family: the Weald 81.5%, The Standing Line 83.2%, The Bleeding Wild 83.9%, The Spoilfield
 * 84.0%, The Quarry and The Shutgate 85.2%, **The Slowgrowth 86.0%**, The Underroad 86.4%, The
 * Quickmire 86.8%, The Rustwood 92%.
 *
 * ⚠️ **The 35 non-lean slots are all Undead and they thin monotonically across the bands — 12, 10,
 * 8, 5 and 0.** That is the drowned road giving out as the party gets further into the wood, and
 * **band 5 fields no non-Elf body at all**. Unlike The Spoilfield's identical shape it is a fiction
 * rather than a budget: the rung move means the closing band could afford anything it liked.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Last Ring is the eighteenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here. The lieutenant does not stand on it —
 * chapters 9 through 17 all declined that and so does this one.
 *
 * ## ⚠️ What restores anything here: nothing, and that is a countable claim
 *
 * Measured over all fifty boards and all thirty-three blocks with a script rather than by reading:
 * **0 blocks carry `recovery`, 0 carry `healthRegen`, 0 carry `lifeLeech`, 0 field a heal, 0 field a
 * drain, and 0 field a shield or a ward of any kind.** On a chapter whose whole axis is durability
 * that is not a preference, it is the termination argument: a board that is hard to kill *and*
 * repairs itself is the ninety seconds with a stat block attached.
 *
 * Measured across all fifty boards the longest fight is **34.4 seconds** against a ninety-second
 * timer and the 0.80 bar's 72, with a mean of **15.2s**. The sweep counts **zero timeouts** on every
 * board, every board reads a **100%** win rate, and the fewest survivors on any board is **4.00**.
 *
 * ⚠️ **4.00 is a plateau rather than a midpoint on this party and the chapter is budgeted
 * accordingly.** A `mythic` five loses one member to almost any real board and the other four to
 * almost nothing until the board cliffs — the same shape the Demon Tower's `critBlock` band records
 * arriving from the opposite direction. **So the escalation is measured on the difficulty probe's
 * threshold, not on survivors**, and the survivor count is used only as a legality check.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight**, never with +3 enemy levels.
 * 2. ⚠️ **The probe's phase matches chapter 16's and was computed rather than copied.** Chapter 18
 *    opens at linear index 750, so the stride lands on s3, s7, s11, s15, s19, s23, s27, s31, s35,
 *    s39, s43, s47 and the final. **Band openers 2 and 4 (s11, s31) are samples and openers 1, 3 and
 *    5 (s1, s21, s41) are not** — so two of the five bands may not open lightly, and **none of the
 *    four mini-bosses is a sample**. Measured thresholds run **8,281 → 17,048** with a worst adjacent
 *    ratio of **0.931** against a bar of 0.85, and the chapter's foot-to-top averages read 9,352 →
 *    14,265.
 * 3. ⚠️ **One board-wide turn per board, and its carrier stands in the front rank.** Both were
 *    checked with a script rather than by reading, and **both caught a violation**: `c18-s11` fielded
 *    a {@link LONGBOUGH_MARKSMAN}, which carries *two* `enemy-row-back` skills on one body, from the
 *    back rank. It was replaced rather than moved. A board-wide debuffer the party cannot aim past is
 *    the sustain-behind-a-taunt failure wearing a debuff.
 */
export const CHAPTER_18 = {
  id: 'chapter-18',
  name: 'The Slowgrowth',
  stages: [
    // -----------------------------------------------------------------------------------
    // The standing water — stages 1 to 10, levels 375 to 380
    //
    // The mire of the chapter below finally reaches something with a bottom, and what it reaches has
    // had two hundred years and nobody to cut it. ⚠️ **The whole band is walls** — {@link RINGBARK_ELDER}
    // at 1,220 health and {@link STILLWATER_ROOT} at 1,180 against the Quickmire's 170-health runners.
    // That is not the difficulty; it is the *identity*. What the boards actually cost is the attack
    // standing behind the walls, which is why every one of them fields a {@link DROWNED_MAST}, a
    // {@link SPOILWOOD_REAVER} or a {@link WEALDSHADOW_STALKER} rather than five hides.
    //
    // ⚠️ **This is where the Undead texture is thickest** — twelve slots of the chapter's thirty-five
    // — because the drowned road is still visible here. It thins to nothing by band 5.
    // -----------------------------------------------------------------------------------

    {
      id: 'c18-s1',
      name: 'Where the Mire Gives Out',
      enemies: {
        front: [STILLWATER_ROOT, DEEPMAST_HEARTWOOD],
        back: [CROWNBARK_BASTION, HOLLOWCART_DROVER, CAIRNWARD_HUSK],
      },
      level: 375,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s2',
      name: 'Nothing Was Ever Cut Here',
      enemies: {
        front: [IRONBARK_WARDEN, DROWNED_MAST],
        back: [QUICKLIME_SERJEANT, HOLLOWBARK_SENTRY, CAIRNWARD_HUSK],
      },
      level: 376,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s3',
      name: 'The Water Stopped Moving',
      enemies: {
        front: [IRONBARK_WARDEN, CENTURYBOUGH_WARDEN],
        back: [QUICKLIME_SERJEANT, MIREMAST_TRUNK, SLOWGROWTH_BOLE],
      },
      level: 376,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s4',
      name: 'Two Hundred Years of Nobody',
      enemies: {
        front: [RINGBARK_ELDER, SPOILWOOD_REAVER],
        back: [HOLLOWCART_DROVER, HOLLOWBARK_SENTRY, CAIRNWARD_HUSK],
      },
      level: 377,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s5',
      name: 'Standing Where It Fell',
      enemies: {
        front: [RINGBARK_ELDER, WEALDSHADOW_STALKER],
        back: [HOLLOWCART_DROVER, SLOWGROWTH_BOLE, HOLLOWBARK_SENTRY],
      },
      level: 377,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s6',
      name: 'The Green Under the Green',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, IRONBARK_WARDEN],
        back: [IRONWAKE_VANGUARD, MIREMAST_TRUNK, CORTEGE_LANCER],
      },
      level: 378,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s7',
      name: 'Deadfall',
      enemies: {
        front: [STILLWATER_ROOT, CROWNBARK_BASTION],
        back: [GRAVEMOURN_KEEPER, HOLLOWCART_DROVER, MIREMAST_TRUNK],
      },
      level: 378,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s8',
      name: 'It Grew Over the Road',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [WEALDSHADOW_STALKER, SLOWGROWTH_BOLE, HOLLOWBARK_SENTRY],
      },
      level: 379,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s9',
      name: 'The Long Shade',
      enemies: {
        front: [RINGBARK_ELDER, STILLWATER_ROOT],
        back: [CROWNBARK_BASTION, DROWNED_MAST, SLOWGROWTH_BOLE],
      },
      level: 379,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s10',
      name: 'What Was Here Before the Water',
      enemies: {
        front: [THE_UNHURRIED, IRONBARK_WARDEN],
        back: [DROWNED_MAST, MIREMAST_TRUNK, SLOWGROWTH_BOLE],
      },
      level: 380,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The first ring — stages 11 to 20, levels 380 to 385
    //
    // The singers arrive, and with them the chapter's one board-wide voice. ⚠️ **One board-wide turn
    // per board, never two** — the rule chapter 17 ended up with after pairing two `SLOW` casters and
    // reading 48%. ⚠️ **And every carrier stands in the FRONT rank on every board in this chapter**,
    // because a board-wide debuffer the party cannot aim past is the sustain-behind-a-taunt failure
    // wearing a debuff: chapter 16 measured 4.00 survivors in front and 0.10 behind at one weight.
    // -----------------------------------------------------------------------------------

    {
      id: 'c18-s11',
      name: 'A Ring Is a Year',
      enemies: {
        front: [RINGBARK_ELDER, GRAVEMOURN_KEEPER],
        back: [SPOILWOOD_REAVER, SCALEPLATE_BRAMBLE, CORTEGE_LANCER],
      },
      level: 380,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s12',
      name: 'Count Them If You Like',
      enemies: {
        front: [SUNFADE_CHANTER, STILLWATER_ROOT],
        back: [QUICKLIME_SERJEANT, MIREMAST_TRUNK, CAIRNWARD_HUSK],
      },
      level: 381,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s13',
      name: 'Bark, and Then More Bark',
      enemies: {
        front: [CORROWEALD_SINGER, CENTURYBOUGH_WARDEN],
        back: [QUICKLIME_SERJEANT, SLOWGROWTH_BOLE, CAIRNWARD_HUSK],
      },
      level: 381,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s14',
      name: 'The Year It Drowned',
      enemies: {
        front: [CROWNBARK_BASTION, SPOILWOOD_REAVER],
        back: [GRAVEMOURN_KEEPER, SLOWGROWTH_BOLE, CAIRNWARD_HUSK],
      },
      level: 382,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s15',
      name: 'Slow Water, Slower Wood',
      enemies: {
        front: [CORROWEALD_SINGER, SPOILWOOD_REAVER],
        back: [HOLLOWCART_DROVER, MIREMAST_TRUNK, CAIRNWARD_HUSK],
      },
      level: 382,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s16',
      name: 'Everything Here Is Older Than You',
      enemies: {
        front: [RINGBARK_ELDER, STILLWATER_ROOT],
        back: [CROWNBARK_BASTION, DROWNED_MAST, SCALEPLATE_BRAMBLE],
      },
      level: 383,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s17',
      name: 'The Second Ring',
      enemies: {
        front: [STILLWATER_ROOT, IRONBARK_WARDEN],
        back: [CROWNBARK_BASTION, DROWNED_MAST, SCALEPLATE_BRAMBLE],
      },
      level: 383,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s18',
      name: 'Nothing Rots in Standing Water',
      enemies: {
        front: [STILLWATER_ROOT, DEEPMAST_HEARTWOOD],
        back: [CROWNBARK_BASTION, DROWNED_MAST, MIREMAST_TRUNK],
      },
      level: 384,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s19',
      name: 'It Closed Over the Track',
      enemies: {
        front: [RINGBARK_ELDER, STILLWATER_ROOT],
        back: [CENTURYBOUGH_WARDEN, DROWNED_MAST, SLOWGROWTH_BOLE],
      },
      level: 384,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s20',
      name: 'It Has Not Agreed to Anything',
      enemies: {
        front: [THE_UNHURRIED, SUNFADE_CHANTER],
        back: [CROWNBARK_BASTION, MIREMAST_TRUNK, SCALEPLATE_BRAMBLE],
      },
      level: 385,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The deepmast — stages 21 to 30, levels 385 to 390
    //
    // The wood under the wood. {@link SILTCROWN_CANOPY} and {@link UNDERBOUGH_CREEPER} arrive together
    // and they are the first bodies here that do not simply stand in front of you: one is a *reach*
    // across the front row, the other a *reach* into the back. ⚠️ **A scope, a reach and a selection
    // are three different things**, and saying which has now been got wrong four times in this
    // project. Neither of these is a scope, and neither carries a status.
    // -----------------------------------------------------------------------------------

    {
      id: 'c18-s21',
      name: 'Where the Trunks Meet',
      enemies: {
        front: [RINGBARK_ELDER, GRAVEMOURN_KEEPER],
        back: [UNDERBOUGH_CREEPER, HOLLOWCART_DROVER, HOLLOWBARK_SENTRY],
      },
      level: 385,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s22',
      name: 'The Mast That Never Sailed',
      enemies: {
        front: [STILLWATER_ROOT, CROWNBARK_BASTION],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, HOLLOWBARK_SENTRY],
      },
      level: 386,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s23',
      name: 'Under the Waterline',
      enemies: {
        front: [MOONSONG_WEAVER, STILLWATER_ROOT],
        back: [QUICKLIME_SERJEANT, SCALEPLATE_BRAMBLE, CORTEGE_LANCER],
      },
      level: 386,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s24',
      name: 'It Took the Cart With It',
      enemies: {
        front: [RINGBARK_ELDER, CROWNBARK_BASTION],
        back: [DROWNED_MAST, UNDERBOUGH_CREEPER, MIREMAST_TRUNK],
      },
      level: 387,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s25',
      name: 'The Deepmast Itself',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CENTURYBOUGH_WARDEN],
        back: [GRAVEMOURN_KEEPER, UNDERBOUGH_CREEPER, CAIRNWARD_HUSK],
      },
      level: 387,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s26',
      name: 'The Wood Between the Wood',
      enemies: {
        front: [RINGBARK_ELDER, CROWNBARK_BASTION],
        back: [DROWNED_MAST, HOLLOWCART_DROVER, CAIRNWARD_HUSK],
      },
      level: 388,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s27',
      name: 'A Hundred Rings Down',
      enemies: {
        front: [RINGBARK_ELDER, STILLWATER_ROOT],
        back: [IRONBARK_WARDEN, SILTCROWN_CANOPY, SLOWGROWTH_BOLE],
      },
      level: 388,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s28',
      name: 'Silt to the Knee',
      enemies: {
        front: [RINGBARK_ELDER, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, UNDERBOUGH_CREEPER, SLOWGROWTH_BOLE],
      },
      level: 389,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s29',
      name: 'The Old Cut Line',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, UNDERBOUGH_CREEPER, SCALEPLATE_BRAMBLE],
      },
      level: 389,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s30',
      name: 'Still Adding to Itself',
      enemies: {
        front: [THE_UNHURRIED, CORROWEALD_SINGER],
        back: [CENTURYBOUGH_WARDEN, SCALEPLATE_BRAMBLE, HOLLOWBARK_SENTRY],
      },
      level: 390,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The closing canopy — stages 31 to 40, levels 390 to 395
    //
    // The light goes. ⚠️ **The heaviest boards in the chapter by absolute weight**, and the band where
    // the wide bodies and the walls stand on the same board — but never two board-wide turns, and never
    // two `ascended` bodies in one front rank. Fights lengthen here (19 to 22 seconds against the
    // opening band's 9 to 12) and that is the thing to watch rather than the survivor count: **a grade
    // that costs survivors is difficulty; one that starts timing out is the ninety-second clock wearing
    // a stat block.** The sweep counts zero timeouts on every board in this band.
    // -----------------------------------------------------------------------------------

    {
      id: 'c18-s31',
      name: 'The Canopy Closes',
      enemies: {
        front: [SLAGBLOOM_THICKET, STILLWATER_ROOT],
        back: [IRONBARK_WARDEN, QUICKLIME_SERJEANT, CORTEGE_LANCER],
      },
      level: 390,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s32',
      name: 'No Light on the Floor',
      enemies: {
        front: [MOONSONG_WEAVER, DEEPMAST_HEARTWOOD],
        back: [QUICKLIME_SERJEANT, HOLLOWBARK_SENTRY, RUSTLEAF_GLEANER],
      },
      level: 391,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s33',
      name: 'It Is All One Tree',
      enemies: {
        front: [GLOAMVINE_CREEPER, CENTURYBOUGH_WARDEN],
        back: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD, SCALEPLATE_BRAMBLE],
      },
      level: 391,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s34',
      name: 'Reach Without Light',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CENTURYBOUGH_WARDEN],
        back: [MIREMAST_TRUNK, SKYSHRIKE, RUSTLEAF_GLEANER],
      },
      level: 392,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s35',
      name: 'The Long Dark Aisle',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, IRONBARK_WARDEN],
        back: [CENTURYBOUGH_WARDEN, SILTCROWN_CANOPY, MIREMAST_TRUNK],
      },
      level: 392,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s36',
      name: 'Rot Would Be a Mercy',
      enemies: {
        front: [STILLWATER_ROOT, IRONBARK_WARDEN],
        back: [CENTURYBOUGH_WARDEN, SILTCROWN_CANOPY, MIREMAST_TRUNK],
      },
      level: 393,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s37',
      name: 'What the Canopy Keeps',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, IRONBARK_WARDEN],
        back: [CENTURYBOUGH_WARDEN, SILTCROWN_CANOPY, HOLLOWBARK_SENTRY],
      },
      level: 393,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s38',
      name: 'Overhead and Underfoot',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, IRONBARK_WARDEN],
        back: [CENTURYBOUGH_WARDEN, SILTCROWN_CANOPY, SLOWGROWTH_BOLE],
      },
      level: 394,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s39',
      name: 'The Last Open Ground',
      enemies: {
        front: [STILLWATER_ROOT, IRONBARK_WARDEN],
        back: [CENTURYBOUGH_WARDEN, UNDERBOUGH_CREEPER, RUSTLEAF_GLEANER],
      },
      level: 394,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s40',
      name: 'It Has Noticed You Now',
      enemies: {
        front: [THE_UNHURRIED, DEEPMAST_HEARTWOOD],
        back: [SILTCROWN_CANOPY, SLOWGROWTH_BOLE, RUSTLEAF_GLEANER],
      },
      level: 395,
      gear: { grade: 4, level: 100 },
    },
    // -----------------------------------------------------------------------------------
    // The oldest of it — stages 41 to 50, levels 395 to 400
    //
    // ⚠️ **No Undead body appears anywhere in this band.** The road gave out two bands ago; nothing
    // here came from anywhere else, and the texture thinning to zero is the same shape The Spoilfield's
    // did (15, 12, 9, 3, 1 slots) for the same reason — except that here it is a fiction rather than a
    // budget, because the rung move means the pool can afford anything. The band runs 12 to 20 distinct
    // Elf bodies against a boss authored at 860 health, which is the first chapter final in six to be
    // *heavier* than the one before it.
    // -----------------------------------------------------------------------------------

    {
      id: 'c18-s41',
      name: 'The Oldest Standing Thing',
      enemies: {
        front: [RINGBARK_ELDER, WEALDSHADOW_STALKER],
        back: [UNDERBOUGH_CREEPER, RUSTLEAF_GLEANER, BRAMBLEWALK_SCOUT],
      },
      level: 395,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s42',
      name: 'Before the Road, Before the War',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SPOILWOOD_REAVER],
        back: [UNDERBOUGH_CREEPER, QUILLRUST_DARTER, BRAMBLEWALK_SCOUT],
      },
      level: 396,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s43',
      name: 'Count Back Far Enough',
      enemies: {
        front: [STILLWATER_ROOT, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, GLADE_STALKER],
      },
      level: 396,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s44',
      name: 'It Will Still Be Here',
      enemies: {
        front: [RINGBARK_ELDER, CROWNBARK_BASTION],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, SLOWGROWTH_BOLE],
      },
      level: 397,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s45',
      name: 'The Part That Takes Longest',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, GLADE_STALKER],
      },
      level: 397,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s46',
      name: 'It Was Growing Before You Asked',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, SLOWGROWTH_BOLE],
      },
      level: 398,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s47',
      name: 'The Ring You Are Standing In',
      enemies: {
        front: [RINGBARK_ELDER, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, UNDERBOUGH_CREEPER, BRAMBLEWALK_SCOUT],
      },
      level: 398,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s48',
      name: 'All of It at Once',
      enemies: {
        front: [IRONBARK_WARDEN, CENTURYBOUGH_WARDEN],
        back: [DROWNED_MAST, SILTCROWN_CANOPY, SLOWGROWTH_BOLE],
      },
      level: 399,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s49',
      name: 'There Is Simply More of It',
      enemies: {
        front: [SLAGBLOOM_THICKET, CROWNBARK_BASTION],
        back: [CENTURYBOUGH_WARDEN, SPOILWOOD_REAVER, QUILLRUST_DARTER],
      },
      level: 399,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c18-s50',
      name: 'The Last Ring',
      enemies: {
        front: [THE_LAST_RING, RINGBARK_ELDER],
        back: [IRONBARK_WARDEN, RUSTLEAF_GLEANER, QUILLRUST_DARTER],
      },
      level: 400,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
