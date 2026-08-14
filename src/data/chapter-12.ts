import {
  BRAMBLEWALK_SCOUT,
  CARRION_SWARM,
  CORROWEALD_SINGER,
  CROWNBARK_BASTION,
  DEEPMAST_HEARTWOOD,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GRAVEWAKE_THRALL,
  HOLLOWBARK_SENTRY,
  IRONBARK_WARDEN,
  LONGBOUGH_MARKSMAN,
  MOONSONG_WEAVER,
  MUSTER_PIKE,
  NIGHTCANOPY_SINGER,
  QUILLRUST_DARTER,
  RENDFANG_JACKAL,
  ROADWATCH_BOWMAN,
  RUSTLEAF_GLEANER,
  RUSTSONG_CHANTER,
  SCALEPLATE_BRAMBLE,
  SKYSHRIKE,
  SLAGBLOOM_THICKET,
  SPOILWOOD_REAVER,
  STANDFAST_LANCER,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  THE_IRONBLOOM,
  THE_LONGSHADOW,
  THE_RECLAIMED,
  THE_SEEDFATHER,
  THE_SUNBOUGH,
  THORNLING,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
} from './enemies';

/**
 * Chapter 12 — The Rustwood.
 *
 * Fifty stages, enemy levels 225 to 250. It **opens at the level chapter 11 closed on**, which is the
 * rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## ⚠️ The first chapter whose enemies wear gear
 *
 * Every board here carries {@link StageEncounterData.gear} — a full five-piece **Worn** set, at an
 * enhancement level climbing 1 to 20 across the fifty stages. What a body gets out of it is decided
 * by its own `gearArchetype`, priced off the same `GEAR_GRADES` and `GEAR_PROFILES` the player's bag
 * is priced off, so a wall gets health out of a set and a glass cannon gets attack out of the same
 * one. It is derived rather than authored: retuning `data/gear.ts` retunes both sides of the board.
 *
 * ⚠️ **Be honest about what it is worth, because the whole point of the axis was that it be worth
 * more.** A full Worn set is **+8.6% health on a `tank` at level 1 and +17.6% at Worn's cap of 20**;
 * on a `mage` it is +3.8% and +7.8%. Measured against this chapter's own seam party, the enemy side
 * needs **×3 to ×4** before a chapter final stops being a fight the party wins with all five alive —
 * so Worn is roughly a twentieth of the gap, and the whole grade ladder end to end (Relic 100,
 * +166% health on a `tank`) is still short of it. **The three guards widened against the promise of
 * this axis therefore do not come back here**, and the header of `chapters.balance.ts` records the
 * measurement rather than the intention. See [authoring](../../docs/authoring.md).
 *
 * ## What it asks that The Standing Line did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * and the line what the party spends it on **first**. This one asks how much of it **survives
 * contact**.
 *
 * Eleven chapters have priced the party's damage at face value: whatever the number on the swing was,
 * that is what arrived, less a `def` curve nobody had to think about. Out here it arrives smaller,
 * and it arrives smaller for two different reasons — the thing in front of it is wearing an army, and
 * the hand throwing it has been cut.
 *
 * | Band            | Stages | The lock it teaches                                        |
 * | --------------- | ------ | ---------------------------------------------------------- |
 * | The gleaning    | 1–10   | fodder with plate on: the same bodies, and they do not fall |
 * | The barkplate   | 11–20  | armour that has to be opened before health matters          |
 * | The rustsong    | 21–30  | a pool banked in front of the **whole** board, on a cadence |
 * | The blunting    | 31–40  | the party's own attack cut before it swings                 |
 * | The ironbloom   | 41–50  | all four at once, and the wood wearing the army             |
 *
 * ## Where the setting comes from
 *
 * The Standing Line stopped moving and never rescinded anything, so it is still standing where it
 * fell. The wood has been over it. That is the chapter's whole premise and it is also the mechanical
 * one: **enemies start wearing gear here because there is gear here to wear**, and the bodies wearing
 * it are the ones that were fodder two chapters ago.
 *
 * The Rustwood is deliberately not another forest. Chapter 8's Sunless Weald is the Elves at home;
 * this is the Elves out on a field that is not theirs, picking it over — which is why its blocks are
 * named for rust, plate and salvage rather than for canopy and moonlight.
 *
 * ## Where the levels come from
 *
 * 225 to 250, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect. The chapter runs entirely inside `legendary-plus`'s
 * cap of 260, which is how every chapter has worked since the margin rule was retired.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Chapter 11's
 * seam reads **10.4858**; against chapter 12's close of 250, `legendary-plus` reads **10.4858** —
 * |Δln| **0.0000**, because 250 still sits under that rung's cap of 260 — and `mythic` reads 16.777
 * at |Δln| 0.470. So chapter 12 shares `legendary-plus` with chapter 11, which is the second chapter
 * running on one rung and exactly what the flat line produces. Moving it up by reflex would hand the
 * party a ×1.6 the content never asked for.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the final: **eight new, twenty-four returning** —
 * exactly the quarter a chapter owes, measured over what the chapter *fields* rather than over the
 * shipped pool. Thirty-four distinct bodies in all.
 *
 * ⚠️ **The lean is Elf and it takes the faction 23 → 33.** Elf was the thinnest of the seven, and the
 * two below it — Angels and Demons at 24 — are both barred from leading a chapter, because a celestial
 * deals ×1.10 to every mortal and the matrix has **no mortal → celestial row**. Dwarf and Monster were
 * level with Elf at 24. **Recompute the depths before choosing the next lean**; the argument that
 * picked this one does not repeat.
 *
 * ⚠️ **Measured, the lean is 92% of board slots, which is the heaviest any chapter has carried** —
 * against the Sunless Weald's 81%, The Bleeding Wild's 84% and The Standing Line's 83%. That is
 * stated rather than rounded to "about eighty" because it is out of family and a later session should
 * see it: the fiction is that what is *alive* out here is all Elf, and the mortals below are what the
 * wood is picking over. The cost is real — a board pool this mono makes the faction matchup nearly
 * constant across the chapter, which is the one axis a mixed pool keeps live.
 *
 * ⚠️ **Elf has now led twice** — chapter 8 at 81% of the board pool and this one — which is the first
 * repeat lead on the ladder. It is legal because the rule is "deepen the thinnest legal faction" and
 * four chapters after the Weald, Elf was still it. What the repeat costs is that this chapter had to
 * be a visibly different *place*, which is what the setting above is for.
 *
 * ⚠️ **The non-Elf texture is The Standing Line's own dead and what came for them** —
 * {@link MUSTER_PIKE}, {@link ROADWATCH_BOWMAN} and {@link STANDFAST_LANCER} out of chapter 11,
 * {@link CARRION_SWARM} and {@link RENDFANG_JACKAL} scavenging, and one {@link GRAVEWAKE_THRALL}. Six
 * blocks, all returning, none new.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Ironbloom is the twelfth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here, stated as counts rather than as an absolute
 *
 * A threshold claim has its range grow underneath it, and "nothing in this chapter restores anything"
 * is the sentence three towers have now shipped falsely. So the counts, measured over all fifty
 * boards with a script rather than by reading: **10 boards carry a block with `recovery`** — every
 * appearance of {@link THE_LONGSHADOW} and {@link THE_SUNBOUGH}, the two Elf `ascended` anchors the
 * chapter borrows — **0 carry `healthRegen`, 0 carry `lifeLeech`, and 0 field a heal, a drain or a
 * regeneration in any kit.** The chapter's only restoration is a **shield**:
 * {@link RUSTSONG_CHANTER}'s board-wide pool and the lieutenant's conditioned one, both of which bank
 * once and deplete.
 *
 * ⚠️ **That count was written as 6 first and the script said 10**, which is the fourth time a session
 * has miscounted its own sustain and the reason the check is run before shipping rather than after.
 *
 * ⚠️ **The one absolute claim is about the final, which is one board and stays checkable**:
 * `c12-s50` restores nothing at all. No `recovery`, no `healthRegen`, no `lifeLeech`, and no kit on it
 * heals, drains or shields.
 *
 * That discipline is the ninety-second clock rather than a preference. Mitigation lengthens every
 * fight it appears in, and `def` and `hp` multiply each other to extend a fight nobody is going to
 * win — so a chapter built on armour is the one most able to run the clock out, and a timeout is
 * scored a **defeat**.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier front rank, an `ascended` anchor brought forward — never with +3
 *    enemy levels, which fights the level curve for about thirteen percent and loses.
 * 2. ⚠️ **The probe reads `c12-s3`, and then every fourth stage.** The stride lands on s3, s7, s11,
 *    s15, s19, s23, s27, s31, s35, s39, s43, s47 and the final — so **band openers 2 and 4 (s11, s31)
 *    are samples and openers 1, 3 and 5 are not**, which is the reverse of chapter 11's arrangement.
 *    The two that are had to be authored heavy against the pull to open a band lightly.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank.** The Angel Tower's third hundred is
 *    where that came apart: its floor-200 board read 73% against 50% at the next roof and what failed
 *    was the **pairing** rather than any one anchor. The lieutenant also does not stand on the final —
 *    chapters 9, 10 and 11 all declined it, and what stands beside The Ironbloom is a legendary.
 */
export const CHAPTER_12 = {
  id: 'chapter-12',
  name: 'The Rustwood',
  stages: [
    // -----------------------------------------------------------------------------------
    // The gleaning — stages 1 to 10, levels 225 to 230, Worn 1 to 4
    //
    // The lock: the wood has been over the field, and the bodies that were fodder two chapters ago
    // are wearing what it left. Nothing here is new except that it does not fall on schedule.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The seam, at the line's own closing level, and **not** a probe sample — the stride lands
      // on `c12-s3`. Authored light on purpose: three of these five stood on `c11-s1` and the player
      // is meant to recognise them before noticing what has changed about them.
      id: 'c12-s1',
      name: 'The Turned Ground',
      enemies: {
        front: [RUSTLEAF_GLEANER, MUSTER_PIKE],
        back: [CARRION_SWARM, THORNLING, ROADWATCH_BOWMAN],
      },
      level: 225,
      gear: { grade: 0, level: 1 },
    },
    {
      // The first plate, on the softest thing that could be carrying it.
      id: 'c12-s2',
      name: 'What the Line Left',
      enemies: {
        front: [MUSTER_PIKE, SCALEPLATE_BRAMBLE],
        back: [RUSTLEAF_GLEANER, CARRION_SWARM, THORNLING],
      },
      level: 226,
      gear: { grade: 0, level: 1 },
    },
    {
      // ⚠️ A probe sample, and the chapter's first: two walls in the front rank against a board of
      // commons, which is the weight the stride needs to see rather than a new question.
      id: 'c12-s3',
      name: 'Gleaners',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, GLOAMVINE_CREEPER],
        back: [RUSTLEAF_GLEANER, QUILLRUST_DARTER, ROADWATCH_BOWMAN],
      },
      level: 226,
      gear: { grade: 0, level: 2 },
    },
    {
      id: 'c12-s4',
      name: 'The Slow Harvest',
      enemies: {
        front: [MUSTER_PIKE, SLAGBLOOM_THICKET],
        back: [BRAMBLEWALK_SCOUT, CARRION_SWARM, RUSTLEAF_GLEANER],
      },
      level: 227,
      gear: { grade: 0, level: 2 },
    },
    {
      // What else came for the dead. The one Undead body in the chapter.
      id: 'c12-s5',
      name: 'Nothing Was Buried',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, GRAVEWAKE_THRALL],
        back: [QUILLRUST_DARTER, RUSTLEAF_GLEANER, RENDFANG_JACKAL],
      },
      level: 227,
      gear: { grade: 0, level: 3 },
    },
    {
      id: 'c12-s6',
      name: 'Under the Rust',
      enemies: {
        front: [SLAGBLOOM_THICKET, GLOAMVINE_CREEPER],
        back: [SUNMOTE_DANCER, QUILLRUST_DARTER, GLADE_STALKER],
      },
      level: 228,
      gear: { grade: 0, level: 3 },
    },
    {
      // ⚠️ A probe sample. The band's second half: the first legendary, and the first body here that
      // opens armour rather than wearing it.
      id: 'c12-s7',
      name: 'The Reaver in the Spoil',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, SPOILWOOD_REAVER],
        back: [SKYSHRIKE, QUILLRUST_DARTER, RUSTLEAF_GLEANER],
      },
      level: 228,
      gear: { grade: 0, level: 3 },
    },
    {
      // A Lancer that did not fall with the rest of its line.
      id: 'c12-s8',
      name: 'Still at the Halt',
      enemies: {
        front: [SLAGBLOOM_THICKET, STANDFAST_LANCER],
        back: [WHISPERLEAF_ARCHER, RUSTLEAF_GLEANER, CARRION_SWARM],
      },
      level: 229,
      gear: { grade: 0, level: 4 },
    },
    {
      id: 'c12-s9',
      name: 'Quillrust',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, SPOILWOOD_REAVER],
        back: [QUILLRUST_DARTER, SKYSHRIKE, GLADE_STALKER],
      },
      level: 229,
      gear: { grade: 0, level: 4 },
    },
    {
      // Mini-boss. The lieutenant's first appearance, and the first time the party's chosen target
      // gets a pool put on it after the choice was made.
      id: 'c12-s10',
      name: 'The Reclaimed',
      enemies: {
        front: [THE_RECLAIMED, SCALEPLATE_BRAMBLE],
        back: [QUILLRUST_DARTER, RUSTLEAF_GLEANER, SPOILWOOD_REAVER],
      },
      level: 230,
      gear: { grade: 0, level: 4 },
    },

    // -----------------------------------------------------------------------------------
    // The barkplate — stages 11 to 20, levels 230 to 235, Worn 5 to 8
    //
    // The lock: armour that has to be opened before health matters. `IRONBARK_WARDEN` is the band's
    // block and it answers a crit build rather than a swing — `critBlock` 0.18 and `critDamageResist`
    // 0.28, both inside the shipped register.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample, which is the harder of the two jobs: it may not read
      // as a step down from `c12-s7`. So it opens on the band's own block at full weight rather than
      // easing into it.
      id: 'c12-s11',
      name: 'Ironbark',
      enemies: {
        front: [IRONBARK_WARDEN, SCALEPLATE_BRAMBLE],
        back: [SPOILWOOD_REAVER, QUILLRUST_DARTER, WHISPERLEAF_ARCHER],
      },
      level: 230,
      gear: { grade: 0, level: 5 },
    },
    {
      id: 'c12-s12',
      name: 'The Plated Wood',
      enemies: {
        front: [IRONBARK_WARDEN, MUSTER_PIKE],
        back: [SKYSHRIKE, WHISPERLEAF_ARCHER, ROADWATCH_BOWMAN],
      },
      level: 231,
      gear: { grade: 0, level: 5 },
    },
    {
      id: 'c12-s13',
      name: 'Crownbark',
      enemies: {
        front: [CROWNBARK_BASTION, SCALEPLATE_BRAMBLE],
        back: [QUILLRUST_DARTER, SPOILWOOD_REAVER, RUSTLEAF_GLEANER],
      },
      level: 231,
      gear: { grade: 0, level: 6 },
    },
    {
      id: 'c12-s14',
      name: 'Two Doors',
      enemies: {
        front: [IRONBARK_WARDEN, STANDFAST_LANCER],
        back: [MOONSONG_WEAVER, WHISPERLEAF_ARCHER, RENDFANG_JACKAL],
      },
      level: 232,
      gear: { grade: 0, level: 6 },
    },
    {
      // ⚠️ A probe sample. The heaviest front rank the chapter has fielded so far, and both halves of
      // it are walls — which is the band's question at the volume the stride reads.
      id: 'c12-s15',
      name: 'Nothing Gets Through Clean',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, IRONBARK_WARDEN],
        back: [SPOILWOOD_REAVER, QUILLRUST_DARTER, LONGBOUGH_MARKSMAN],
      },
      level: 232,
      gear: { grade: 0, level: 6 },
    },
    {
      // The chapter's other suppression, one band early and on a legendary rather than on the block
      // built for it — a trailer for the blunting.
      id: 'c12-s16',
      name: 'Sunfade on the Plate',
      enemies: {
        front: [CROWNBARK_BASTION, MUSTER_PIKE],
        back: [SUNFADE_CHANTER, SKYSHRIKE, CARRION_SWARM],
      },
      level: 233,
      gear: { grade: 0, level: 7 },
    },
    {
      id: 'c12-s17',
      name: 'The Stalker in the Seam',
      enemies: {
        front: [IRONBARK_WARDEN, SCALEPLATE_BRAMBLE],
        back: [WEALDSHADOW_STALKER, SPOILWOOD_REAVER, QUILLRUST_DARTER],
      },
      level: 233,
      gear: { grade: 0, level: 7 },
    },
    {
      id: 'c12-s18',
      name: 'Deepmast',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, STANDFAST_LANCER],
        back: [LONGBOUGH_MARKSMAN, MOONSONG_WEAVER, ROADWATCH_BOWMAN],
      },
      level: 234,
      gear: { grade: 0, level: 8 },
    },
    {
      // ⚠️ A probe sample, and the band's first `ascended` anchor. One only — the front rank never
      // holds two of them anywhere in this chapter.
      id: 'c12-s19',
      name: 'The Seedfather Armoured',
      enemies: {
        front: [THE_SEEDFATHER, IRONBARK_WARDEN],
        back: [SPOILWOOD_REAVER, WEALDSHADOW_STALKER, QUILLRUST_DARTER],
      },
      level: 234,
      gear: { grade: 0, level: 8 },
    },
    {
      // Mini-boss. The lieutenant behind the band's own wall, which is the first board where the
      // party has to open two layers of plate on the same body.
      id: 'c12-s20',
      name: 'Fitted to the Wound',
      enemies: {
        front: [THE_RECLAIMED, IRONBARK_WARDEN],
        back: [SPOILWOOD_REAVER, LONGBOUGH_MARKSMAN, QUILLRUST_DARTER],
      },
      level: 235,
      gear: { grade: 0, level: 8 },
    },

    // -----------------------------------------------------------------------------------
    // The rustsong — stages 21 to 30, levels 235 to 240, Worn 9 to 12
    //
    // The lock: a pool banked in front of the **whole** board, every seventy ticks, by one soft body
    // standing behind the plate. ⚠️ A shield rather than a heal, and that is the termination argument:
    // a pool depletes under a party that keeps swinging, where a regeneration behind this much armour
    // is the ninety-second clock.
    // -----------------------------------------------------------------------------------
    {
      // The band opener, and **not** a probe sample — so it is allowed to state the lock plainly on a
      // board the party has already beaten twice.
      id: 'c12-s21',
      name: 'The Rustsong',
      enemies: {
        front: [IRONBARK_WARDEN, SCALEPLATE_BRAMBLE],
        back: [RUSTSONG_CHANTER, QUILLRUST_DARTER, SKYSHRIKE],
      },
      level: 235,
      gear: { grade: 0, level: 9 },
    },
    {
      id: 'c12-s22',
      name: 'Every Bough Answers',
      enemies: {
        front: [CROWNBARK_BASTION, SLAGBLOOM_THICKET],
        back: [RUSTSONG_CHANTER, WHISPERLEAF_ARCHER, SPOILWOOD_REAVER],
      },
      level: 236,
      gear: { grade: 0, level: 9 },
    },
    {
      // ⚠️ A probe sample. Two walls and the Chanter behind them, which is the band's whole argument:
      // the party cannot reach the thing making the armour without first getting through armour.
      id: 'c12-s23',
      name: 'Behind the Plate',
      enemies: {
        front: [IRONBARK_WARDEN, DEEPMAST_HEARTWOOD],
        back: [RUSTSONG_CHANTER, LONGBOUGH_MARKSMAN, WEALDSHADOW_STALKER],
      },
      level: 236,
      gear: { grade: 0, level: 10 },
    },
    {
      id: 'c12-s24',
      name: 'Banked Again',
      enemies: {
        front: [CROWNBARK_BASTION, SCALEPLATE_BRAMBLE],
        back: [RUSTSONG_CHANTER, MOONSONG_WEAVER, SKYSHRIKE],
      },
      level: 237,
      gear: { grade: 0, level: 10 },
    },
    {
      id: 'c12-s25',
      name: 'The Seventy-Tick Wood',
      enemies: {
        front: [IRONBARK_WARDEN, HOLLOWBARK_SENTRY],
        back: [RUSTSONG_CHANTER, SPOILWOOD_REAVER, QUILLRUST_DARTER],
      },
      level: 237,
      gear: { grade: 0, level: 10 },
    },
    {
      id: 'c12-s26',
      name: 'Reach or Wait',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, SLAGBLOOM_THICKET],
        back: [RUSTSONG_CHANTER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 238,
      gear: { grade: 0, level: 11 },
    },
    {
      // ⚠️ A probe sample, and an `ascended` anchor in front of the Chanter for the first time.
      id: 'c12-s27',
      name: 'The Seedfather Sings It Up',
      enemies: {
        front: [THE_SEEDFATHER, IRONBARK_WARDEN],
        back: [RUSTSONG_CHANTER, WEALDSHADOW_STALKER, SPOILWOOD_REAVER],
      },
      level: 238,
      gear: { grade: 0, level: 11 },
    },
    {
      id: 'c12-s28',
      name: 'Two Walls and a Voice',
      enemies: {
        front: [CROWNBARK_BASTION, IRONBARK_WARDEN],
        back: [RUSTSONG_CHANTER, MOONSONG_WEAVER, LONGBOUGH_MARKSMAN],
      },
      level: 239,
      gear: { grade: 0, level: 11 },
    },
    {
      // The Longshadow, and the first `recovery` in the chapter. It is on an anchor the party can
      // aim at rather than behind a taunt, which is the whole of why it is allowed here.
      id: 'c12-s29',
      name: 'The Longshadow Plated',
      enemies: {
        front: [THE_LONGSHADOW, SCALEPLATE_BRAMBLE],
        back: [RUSTSONG_CHANTER, SKYSHRIKE, QUILLRUST_DARTER],
      },
      level: 239,
      gear: { grade: 0, level: 12 },
    },
    {
      // Mini-boss. The lieutenant and the Chanter on one board: a pool on the whole side every
      // seventy ticks, and a second one on whatever the party has just committed to.
      id: 'c12-s30',
      name: 'Twice Fitted',
      enemies: {
        front: [THE_RECLAIMED, DEEPMAST_HEARTWOOD],
        back: [RUSTSONG_CHANTER, SPOILWOOD_REAVER, LONGBOUGH_MARKSMAN],
      },
      level: 240,
      gear: { grade: 0, level: 12 },
    },

    // -----------------------------------------------------------------------------------
    // The blunting — stages 31 to 40, levels 240 to 245, Worn 13 to 16
    //
    // The lock: the chapter's question asked from the party's own side of the board. Every band above
    // makes the party's damage arrive against more armour; this one makes it leave smaller.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample — the second of the two, and the same job as
      // `c12-s11`: it may not read as a step down from `c12-s27`. So it opens on an `ascended` anchor
      // and the band's own block at once.
      id: 'c12-s31',
      name: 'Everything Comes Back Blunt',
      enemies: {
        front: [THE_SUNBOUGH, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, SPOILWOOD_REAVER, LONGBOUGH_MARKSMAN],
      },
      level: 240,
      gear: { grade: 0, level: 13 },
    },
    {
      id: 'c12-s32',
      name: 'The Corroweald',
      enemies: {
        front: [IRONBARK_WARDEN, CROWNBARK_BASTION],
        back: [CORROWEALD_SINGER, WEALDSHADOW_STALKER, SKYSHRIKE],
      },
      level: 241,
      gear: { grade: 0, level: 13 },
    },
    {
      // Both suppressions on one board for the first time — a pool in front of the board and the
      // party's attack cut behind it.
      id: 'c12-s33',
      name: 'Smaller Both Ways',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, SCALEPLATE_BRAMBLE],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, QUILLRUST_DARTER],
      },
      level: 241,
      gear: { grade: 0, level: 13 },
    },
    {
      id: 'c12-s34',
      name: 'The Blunted Field',
      enemies: {
        front: [THE_SEEDFATHER, SLAGBLOOM_THICKET],
        back: [CORROWEALD_SINGER, LONGBOUGH_MARKSMAN, SPOILWOOD_REAVER],
      },
      level: 242,
      gear: { grade: 0, level: 14 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c12-s35',
      name: 'Nothing Swings True',
      enemies: {
        front: [THE_LONGSHADOW, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, WEALDSHADOW_STALKER, MOONSONG_WEAVER],
      },
      level: 242,
      gear: { grade: 0, level: 14 },
    },
    {
      id: 'c12-s36',
      name: 'The Long Corrosion',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, SKYSHRIKE],
      },
      level: 243,
      gear: { grade: 0, level: 15 },
    },
    {
      id: 'c12-s37',
      name: 'The Sunbough Rusted',
      enemies: {
        front: [THE_SUNBOUGH, SCALEPLATE_BRAMBLE],
        back: [CORROWEALD_SINGER, SPOILWOOD_REAVER, LONGBOUGH_MARKSMAN],
      },
      level: 243,
      gear: { grade: 0, level: 15 },
    },
    {
      id: 'c12-s38',
      name: 'Two Voices',
      enemies: {
        front: [IRONBARK_WARDEN, HOLLOWBARK_SENTRY],
        back: [CORROWEALD_SINGER, NIGHTCANOPY_SINGER, WEALDSHADOW_STALKER],
      },
      level: 244,
      gear: { grade: 0, level: 15 },
    },
    {
      // ⚠️ A probe sample, and the last board before the fourth mini-boss: an `ascended` anchor, a
      // wall, and both of the chapter's suppressions behind them.
      id: 'c12-s39',
      name: 'Arriving Smaller',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, SPOILWOOD_REAVER],
      },
      level: 244,
      gear: { grade: 0, level: 16 },
    },
    {
      // Mini-boss, and the lieutenant's last appearance — fifteen levels above where the party first
      // met it, behind the band's wall, with both suppressions standing behind that.
      id: 'c12-s40',
      name: 'What the Field Left',
      enemies: {
        front: [THE_RECLAIMED, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, LONGBOUGH_MARKSMAN],
      },
      level: 245,
      gear: { grade: 0, level: 16 },
    },

    // -----------------------------------------------------------------------------------
    // The ironbloom — stages 41 to 50, levels 245 to 250, Worn 17 to 20
    //
    // All four locks at once, and the Worn set at the top of its own ladder. Nothing new is asked
    // above this line: what changes is that every board carries two of the four at the same time.
    // -----------------------------------------------------------------------------------
    {
      // The band opener, and **not** a probe sample.
      id: 'c12-s41',
      name: 'The Iron Comes Up',
      enemies: {
        front: [THE_LONGSHADOW, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, SPOILWOOD_REAVER],
      },
      level: 245,
      gear: { grade: 0, level: 17 },
    },
    {
      id: 'c12-s42',
      name: 'Rooted in Plate',
      enemies: {
        front: [THE_SUNBOUGH, CROWNBARK_BASTION],
        back: [RUSTSONG_CHANTER, WEALDSHADOW_STALKER, LONGBOUGH_MARKSMAN],
      },
      level: 246,
      gear: { grade: 0, level: 17 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c12-s43',
      name: 'The Wood Wears It',
      enemies: {
        front: [THE_SEEDFATHER, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, SPOILWOOD_REAVER],
      },
      level: 246,
      gear: { grade: 0, level: 17 },
    },
    {
      id: 'c12-s44',
      name: 'Under Two Canopies',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [CORROWEALD_SINGER, NIGHTCANOPY_SINGER, WEALDSHADOW_STALKER],
      },
      level: 247,
      gear: { grade: 0, level: 18 },
    },
    {
      id: 'c12-s45',
      name: 'The Salvage Line',
      enemies: {
        front: [THE_SUNBOUGH, IRONBARK_WARDEN],
        back: [RUSTSONG_CHANTER, LONGBOUGH_MARKSMAN, SPOILWOOD_REAVER],
      },
      level: 247,
      gear: { grade: 0, level: 18 },
    },
    {
      id: 'c12-s46',
      name: 'Nothing Is Given Back',
      enemies: {
        front: [THE_SEEDFATHER, CROWNBARK_BASTION],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, MOONSONG_WEAVER],
      },
      level: 248,
      gear: { grade: 0, level: 18 },
    },
    {
      // ⚠️ A probe sample, and the chapter's heaviest board that is not the final.
      id: 'c12-s47',
      name: 'The Whole Rust',
      enemies: {
        front: [THE_LONGSHADOW, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, WEALDSHADOW_STALKER],
      },
      level: 248,
      gear: { grade: 0, level: 19 },
    },
    {
      id: 'c12-s48',
      name: 'Before the Bloom',
      enemies: {
        front: [THE_SUNBOUGH, DEEPMAST_HEARTWOOD],
        back: [CORROWEALD_SINGER, SPOILWOOD_REAVER, LONGBOUGH_MARKSMAN],
      },
      level: 249,
      gear: { grade: 0, level: 19 },
    },
    {
      // The last board before the final. The chapter's own list in full, one level below the thing
      // the list has been describing.
      id: 'c12-s49',
      name: 'The Field Stands Up',
      enemies: {
        front: [THE_SEEDFATHER, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, WEALDSHADOW_STALKER],
      },
      level: 249,
      gear: { grade: 0, level: 20 },
    },
    {
      // The chapter final. ⚠️ **One `ascended` anchor and four legendaries**, which is the shape
      // chapters 9, 10 and 11 all settled on — the lieutenant is deliberately absent, because a second
      // anchor beside a boss is the sharpest non-linear weight step this game can author.
      //
      // Every band on one board: the Warden's plate, the Chanter's pool, the Singer's cut, and the
      // Reaver opening what the party cannot. What The Ironbloom adds is {@link THE_IRON_COMES_UP} —
      // the whole party hit and sundered on a seventy-tick cadence, so the armour the party has spent
      // the chapter learning to open is now also being applied to the party.
      //
      // ⚠️ **It restores nothing, and this is the one absolute claim the chapter makes.** No block on
      // this board carries `recovery`, `healthRegen` or `lifeLeech`, and no kit on it heals, drains or
      // shields. One board, checkable, and checked with a script rather than by reading.
      id: 'c12-s50',
      name: 'The Ironbloom',
      enemies: {
        front: [THE_IRONBLOOM, IRONBARK_WARDEN],
        back: [CORROWEALD_SINGER, RUSTSONG_CHANTER, SPOILWOOD_REAVER],
      },
      level: 250,
      gear: { grade: 0, level: 20 },
    },
  ],
} as const;
