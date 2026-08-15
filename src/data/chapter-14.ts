import {
  BENCHLINE_LURKER,
  BOLTFAST_IRONSIDE,
  BRACEWORK_DELVER,
  CHALKHIDE_BROWSER,
  CINDERQUENCH_BEARER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  DEEPGALLERY_RUNNER,
  DEEPLAMP_SEALER,
  DEEPROCK_MINER,
  DUSTPLATE_GRINDER,
  EDGETURN_WARDEN,
  FORGE_THRALL,
  GALLERY_SLIPFANG,
  GATEFAST_WARDEN,
  GRUDGEPLATE_SMITH,
  IRONSLING_WRIGHT,
  KINSTONE_BEARER,
  MARCHWARD_PIKEMAN,
  OATHSTONE_BASTION,
  OVERBURDEN_HULK,
  PLUMBLINE_HAND,
  QUENCHWRIGHT,
  RINGWALL_HAMMERER,
  SCREEBACK_DARTER,
  SLAGBOUND_DRUDGE,
  SPLINTERYARD_HONER,
  STONECOURSE_MASON,
  SUMPWATER_BROOD,
  THE_DEADBOLT,
  THE_DEEPCUT,
  THE_DOORSTONE,
  THE_EDGEWRIGHT,
  WARDSTONE_KEEPER,
} from './enemies';

/**
 * Chapter 14 — The Shutgate.
 *
 * Fifty stages, enemy levels 275 to 300. It **opens at the level chapter 13 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Quarry did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * and the quarry whether it lands **at all**. This one asks whether it arrives **big enough**.
 *
 * Thirteen chapters have priced a swing by whether it happened. Down here every one of them
 * happens and most of them are not worth the turn: the course is set before the blow lands, the
 * ward is banked in front of it, the plate takes the same share off everything, and three separate
 * turns make the swing itself smaller before it arrives.
 *
 * | Band              | Stages | The lock it teaches                                             |
 * | ----------------- | ------ | --------------------------------------------------------------- |
 * | The plate         | 1–10   | `def` past the shipped register: a small blow pays almost nothing |
 * | The braced course | 11–20  | the plate as a **turn**, with a window in every cycle              |
 * | Turned aside      | 21–30  | `physicalResist`: the same share off every blow, large or small    |
 * | The ward          | 31–40  | a pool banked in front of the board, spent rather than refilled    |
 * | The shutgate      | 41–50  | all four at once, and the block the hold was shut with            |
 *
 * ## Where the setting comes from
 *
 * The Quarry cut down through the hill and broke into the outer works of the hold it had been
 * cutting toward. Nobody came back up the quarry because they went **down**: the hold was shut from
 * the inside, a very long time ago, against something — and it is still shut, and what is behind it
 * does not care which side the party arrived from.
 *
 * ⚠️ **It is the exact inverse of the chapter below it, deliberately.** The Quarry is a Monster lean
 * with Dwarf texture — the crew that cut the working, thinning out as the party goes deeper. This is
 * a Dwarf lean with Monster texture: the things from the quarry that got in through the breach,
 * thinning out the further into the hold the party goes. Same hill, other side of the wall, and the
 * two chapters' faction shares are the same number from opposite ends — **85.2%** here against The
 * Quarry's 85.2%.
 *
 * The name is the mechanic as well as the place. A shutgate is a gate that was closed on purpose and
 * is not going to be opened; a doorstone is the single block a hold is sealed with, and the one
 * thing in a quarry that a hundred small blows will never move.
 *
 * ## Where the levels come from
 *
 * 275 to 300, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## ⚠️ The rung's cap has run out, and it is what gives this chapter a difficulty gradient
 *
 * `legendary-plus` caps at **260** against a close of **300**, so the party this chapter is tuned for
 * stands **forty levels under the last board** — where The Quarry's stood fifteen under and every
 * chapter before that stood level with its own close. At `perLevel.common` = 1.021 that is **×2.29**
 * of content the party cannot answer with levels, and it arrives entirely from the cap.
 *
 * ⚠️ **This is the difficulty gradient the flattening traded away, coming back from somewhere nobody
 * planned it.** [authoring](../../docs/authoring.md) records the trade: a chapter is ×1.68 of party
 * power and a rung is ×1.60, so the two cancel and the campaign has no gradient of its own — with
 * enemy gear named as the axis that would restore it. Gear did not restore it, twice measured. **The
 * cap did.** The seam ratios are the record: chapter 12 read 10.4858, chapter 13 read 7.6774, and
 * this one reads **4.5665** — ×0.595 a chapter and compounding, because every further chapter on
 * this rung closes further above a cap that does not move.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Against a
 * close of 300, `legendary-plus` reads 4.5665 (|Δln| **0.5197** against chapter 13's own seam) and
 * `mythic` reads 16.7772 (|Δln| **0.7816**). So `legendary-plus` wins by 0.26 of a nat and chapter 14
 * is the **fourth** chapter running on one rung — the longest any rung has held. Moving it up by
 * reflex would hand the party a ×1.6 *and* forty levels at once, which is ×3.67 the content never
 * asked for.
 *
 * ⚠️ **{@link INVESTED} and this chapter's seam party are now the same five at the same level and the
 * same rung, and that is a finding rather than an oversight.** Both clamp to `min(close, 260)` = 260,
 * so the two named parties the seam chain exists to compare are **literally identical combatants**.
 * The momentum ceiling was already non-binding at this seam for a different reason — see
 * `chapters.balance.ts` — and here it is degenerate. Recorded, not fixed: the honest repair is a
 * share of the slice, which is a decision about what a seam proves rather than a chapter's scope.
 *
 * ## ⚠️ The gear grade steps to Fine, and it opens at level 26 rather than at level 1
 *
 * Every board here carries {@link StageEncounterData.gear} at grade **2 (Fine)**, climbing 26 to 60
 * across the fifty stages. **Twenty-six, not one, and it is the same arithmetic The Quarry used at
 * its own boundary**: a piece is worth `multiplier × (1 + 0.055 × (level − 1))`, so Sturdy at its cap
 * of 40 is **4.246** and Fine at level 1 is only **1.800**. Fine 26 reads **4.275** — the first level
 * of the new grade that clears the old grade's cap — and Fine 60 reads **7.641**, so the chapter
 * closes at ×1.80 of what The Quarry closed at.
 *
 * ⚠️ **That is the third independent measurement that the gear axis is texture rather than
 * escalation, and it is the least ambiguous of the three.** Chapter 12 measured a full Worn set at
 * ×1.09–1.18 where the axis needs ×3; chapter 13 measured a whole grade step at ×1.15 and +1.2s of
 * fight. Here the level line moved the same board from 100% with five alive to **0% with nobody
 * standing** over twenty-five levels, while the whole Fine ladder underneath it is worth seconds. The
 * two axes are not the same size and they are not close.
 *
 * ## ⚠️ What carries the difficulty here, measured, with the negative list stated in full
 *
 * The chapter's question is about refusal, and **every refusal mechanic in the game measures inert
 * against the party this chapter is tuned for.** Measured against a control reading 4.03 survivors of
 * five at 12.7s — an `ascended` Dwarf anchor, a legendary tank and three legendaries at level 300
 * wearing the Fine set:
 *
 * | The mechanic, varied alone            | survivors of five | fight        |
 * | ------------------------------------- | ----------------- | ------------ |
 * | control                               | 4.03              | 12.7s        |
 * | `def` 44 → 170 on a front-rank body   | 4.03 → 4.00       | 12.7 → 15.5s |
 * | `physicalResist` 0.08 → 0.60, board-wide | 4.03 → 4.00    | 13.0 → 24.3s |
 * | `hp` ×2.3 on the back rank            | 4.08 → 4.00       | 13.7 → 22.9s |
 * | a {@link BARRIER} on `ally-all`       | 4.00              | 13.4s        |
 * | an {@link AEGIS} on `ally-all`        | 4.00              | 14.2s        |
 * | {@link GUARD} on `ally-all`           | 4.00              | 13.2s        |
 * | {@link WEAKEN} at 0.8 on `enemy-all`  | 4.00              | 15.7s        |
 * | one instance's size at held damage per second | 4.08 → 4.00 | 12.5 → 12.8s |
 * | reach: `enemy-back`, `enemy-row-back` | 4.00              | 13.0s        |
 *
 * **Nothing on that list is worth more than 0.08 of a survivor and several are worth eleven seconds
 * of fight**, which is the ninety-second clock rather than a difficulty. ⚠️ **The control is not the
 * problem and that was checked**: the same board graded from 5.00 to 4.03 across ten levels, and the
 * anchor slot grades it from 4.03 to 0.00 outright. What this crew loses to is **enemy damage output
 * from the anchor slot**, and its response to that is a cliff — board-wide `atk` ×1.6 reads 3.98,
 * ×2.0 reads 1.43 and ×2.5 reads 0.00.
 *
 * ⚠️ **So the bands below are what the chapter is _about_ and the level line is what makes it hard,
 * and both halves of that sentence are stated because only one of them is visible in the boards.**
 * The refusal vocabulary is authored at real registers, it is what the place is, and it is worth
 * seconds. The chapter escalates because the party cannot follow it up the curve.
 *
 * ## ⚠️ A later chapter's anchors are now the lighter ones, and this is the campaign's first
 *
 * {@link THE_DOORSTONE} is 1480/88 against The Undercut's 1780/99 one chapter below, and
 * {@link THE_DEADBOLT} is 1400/84 against The Deepcut's 1500/88. **Field the previous chapter's final
 * at the new roof's level before authoring anything** — the campaign version of the rule the towers'
 * third hundreds established. Measured, chapter 13's own final board at level 300 wearing the Fine
 * set against this chapter's seam party:
 *
 * | `c13-s50`'s board, refielded | vs the seam party            |
 * | ---------------------------- | ---------------------------- |
 * | level 275, Fine 26           | 100% / 5.00 survivors / 9.3s |
 * | level 285, Fine 40           | 100% / 4.88 / 13.6s          |
 * | level 290, Fine 47           | 100% / 3.40 / 21.1s          |
 * | level 295, Fine 54           | **43%** / 1.15 / 33.0s       |
 * | level 300, Fine 60           | **0%** / 0.00                |
 *
 * The escalation therefore comes out of the boards' **level** and the anchor slot's composition, and
 * the stat blocks had to come down to meet it. Nothing here is a softer chapter: The Doorstone stands
 * ×1.81 higher on the growth curve than The Undercut does.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the final: **eight new, twenty-four returning** —
 * exactly the quarter a chapter owes, measured over what the chapter *fields* rather than over the
 * shipped pool. Thirty-four distinct bodies in all.
 *
 * ⚠️ **The lean is Dwarf and it takes the faction 24 → 34.** Dwarf stood joint-thinnest of the seven
 * with Angel at 24, and Angels and Demons are both barred from leading a chapter — a celestial deals
 * ×1.10 to every mortal and the matrix has **no mortal → celestial row** — so Dwarf was the only
 * faction that both wanted a lean and could take one. **Recompute the depths before choosing the next
 * lean**; this is the fourth session in a row where one lean has reversed the ordering.
 *
 * ⚠️ **Dwarf is the lean this project's own rules warn about, and the warning is the reason for the
 * negative list above.** Dwarves own the tankiest blocks in the game, so a Dwarven chapter is the one
 * most able to run the ninety-second clock out, and what makes it hard has to be **refusal rather
 * than health**. Measured, refusal is not hard either — so what makes it hard is the level, and every
 * board here is checked for the timeout rather than trusted.
 *
 * ⚠️ **The non-Dwarf texture is the quarry, thinning out**, and it is Monster throughout —
 * {@link CHALKHIDE_BROWSER}, {@link SCREEBACK_DARTER}, {@link SUMPWATER_BROOD},
 * {@link GALLERY_SLIPFANG}, {@link DUSTPLATE_GRINDER}, {@link OVERBURDEN_HULK},
 * {@link BENCHLINE_LURKER} and {@link THE_DEEPCUT}. Eight blocks, all returning, none new: a
 * chapter's ten new blocks go to its lean. Counted, the five bands carry **14, 10, 7, 4 and 2**
 * Monster slots, which is The Quarry's own dwarves-thinning-out arithmetic run backwards. The matchup
 * stays live either way — Dwarf → Monster and Monster → Dwarf are both ×1.05, so a Monster standing
 * on a Dwarf board switches nothing off, and Monster is the one faction every faction reads ×1.05
 * into.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Doorstone is the fourteenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here, stated as counts rather than as an absolute
 *
 * A threshold claim has its range grow underneath it, so the counts, measured over all fifty boards
 * with a script rather than by reading: **0 boards carry a block with `recovery`, 0 carry
 * `healthRegen`, 0 carry `lifeLeech`, 0 field a heal, a drain or a regeneration in any kit, and 20
 * field a shield.** The twenty are the ward band and the whole of the closing band; the shield is
 * {@link BANK_THE_WARD} on {@link WARDSTONE_KEEPER} and nothing else in the chapter.
 *
 * That split is the whole of the chapter's sustain argument. ⚠️ **A pool is not a heal**: a
 * {@link BARRIER} is banked once and depletes, and closing pressure amplifies damage without bound
 * past `PRESSURE_AFTER_TICKS` while deliberately not amplifying healing — so a pool cannot outrun a
 * fight the way a heal can, and it is the one restorative shape that cannot stall this chapter into
 * the timer. It is carried by {@link WARDSTONE_KEEPER}, the softest body the chapter fields, standing
 * in the back rank where the party can aim at it.
 *
 * The Dwarf blocks that would have broken the claim were filtered out of the returning set on purpose
 * rather than being absent by luck: {@link SENTINEL}, {@link COLOSSUS}, {@link RUNEWARDEN},
 * {@link RIVEN_MARCHWARDEN}, {@link THE_GRUDGEKEEPER} and {@link THE_WARDWRIGHT} all carry
 * `recovery`, and {@link BULWARK_ENEMY} banks a pool of its own. That is six of the faction's
 * twenty-four, and it is why the chapter's returning Dwarf list is sixteen rather than twenty-two.
 *
 * ⚠️ **Measured, the whole chapter runs zero timeouts and its longest fight is 31.4s against a
 * ninety-second clock** — the final at 29.0s mean is the longest board in it, which is 2.9× the
 * headroom the timer needs. Stated because a chapter built out of four fight-lengthening mechanics is
 * exactly the one where that number has to be counted rather than assumed.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier front rank, an `ascended` anchor brought forward — never with +3
 *    enemy levels. Here that is sharper than usual, because the anchor slot is the only slot the
 *    tuned party's survivor count responds to at all.
 * 2. ⚠️ **The probe reads `c14-s3`, and then every fourth stage.** The stride lands on s3, s7, s11,
 *    s15, s19, s23, s27, s31, s35, s39, s43, s47 and the final — so **band openers 2 and 4 (s11, s31)
 *    are samples and openers 3 and 5 (s21, s41) are not**, which is the reverse of The Quarry's
 *    arrangement, which was itself the reverse of The Rustwood's. The two that are had to be authored
 *    heavy against the pull to open a band lightly.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank**, and the lieutenant does not stand
 *    on the final — chapters 9 through 13 all declined it, and what stands beside The Doorstone is a
 *    legendary. At this chapter's level gap that pairing is not a step but a cliff: an anchor of
 *    1450/88 behind a legendary escort already reads 57% at the roof.
 */
export const CHAPTER_14 = {
  id: 'chapter-14',
  name: 'The Shutgate',
  stages: [
    // -----------------------------------------------------------------------------------
    // The plate — stages 1 to 10, levels 275 to 280, Fine 26 to 32
    //
    // The lock: a blow that arrives small arrives as nothing. `GATEFAST_WARDEN` carries `def: 58` —
    // **exactly** the shipped ceiling, which is {@link UNMADE}'s own — and `RINGWALL_HAMMERER` 66,
    // which steps past it. Against `atk² / (atk + def)` that is not a flat tax: the formula is
    // superlinear in the attacker's own stat, so the same wall takes 45% off a swing of 34 and 34%
    // off a swing of 63. ⚠️ **The answer is `physicalPierce` and it is a lock no roster can buy** —
    // five of the fifty-six shipped characters carry any, and three of those five are Monsters. So
    // what the band actually teaches is to put the big attacker's turn where it counts.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The seam, at The Quarry's own closing level. Authored light on purpose: a change of place
      // rather than a step, and the player is meant to notice the ground before the bestiary. Not a
      // probe sample — the stride opens on `c14-s3`.
      id: 'c14-s1',
      name: 'Through the Floor of It',
      enemies: {
        front: [GATEFAST_WARDEN, MARCHWARD_PIKEMAN],
        back: [DEEPROCK_MINER, PLUMBLINE_HAND, CHALKHIDE_BROWSER],
      },
      level: 275,
      gear: { grade: 2, level: 26 },
    },
    {
      id: 'c14-s2',
      name: 'The Wrong Side of the Wall',
      enemies: {
        front: [GATEFAST_WARDEN, SLAGBOUND_DRUDGE],
        back: [FORGE_THRALL, SCREEBACK_DARTER, CHALKHIDE_BROWSER],
      },
      level: 276,
      gear: { grade: 2, level: 27 },
    },
    {
      // ⚠️ A probe sample, and the first stage the stride reads. It follows a chapter boss, which the
      // probe excludes by name at `s1` — this is the first board that has to escalate on its own.
      id: 'c14-s3',
      name: 'Cut Stone',
      enemies: {
        front: [GATEFAST_WARDEN, MARCHWARD_PIKEMAN],
        back: [PLUMBLINE_HAND, SPLINTERYARD_HONER, SCREEBACK_DARTER],
      },
      level: 276,
      gear: { grade: 2, level: 27 },
    },
    {
      id: 'c14-s4',
      name: 'What the Breach Let In',
      enemies: {
        front: [GATEFAST_WARDEN, CHALKHIDE_BROWSER],
        back: [COLDFORGE_HAND, SCREEBACK_DARTER, SUMPWATER_BROOD],
      },
      level: 277,
      gear: { grade: 2, level: 28 },
    },
    {
      // ⚠️ A probe sample, and the band's own legendary arriving.
      id: 'c14-s5',
      name: 'The Ringwall',
      enemies: {
        front: [RINGWALL_HAMMERER, GATEFAST_WARDEN],
        back: [PLUMBLINE_HAND, SPLINTERYARD_HONER, SCREEBACK_DARTER],
      },
      level: 277,
      gear: { grade: 2, level: 29 },
    },
    {
      id: 'c14-s6',
      name: 'Nothing Comes Off It',
      enemies: {
        front: [RINGWALL_HAMMERER, SLAGBOUND_DRUDGE],
        back: [CINDERQUENCH_BEARER, DEEPGALLERY_RUNNER, GALLERY_SLIPFANG],
      },
      level: 278,
      gear: { grade: 2, level: 29 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s7',
      name: 'The Old Doors',
      enemies: {
        front: [RINGWALL_HAMMERER, GATEFAST_WARDEN],
        back: [IRONSLING_WRIGHT, SPLINTERYARD_HONER, GALLERY_SLIPFANG],
      },
      level: 278,
      gear: { grade: 2, level: 30 },
    },
    {
      id: 'c14-s8',
      name: 'A Hundred Small Blows',
      enemies: {
        front: [GATEFAST_WARDEN, DUSTPLATE_GRINDER],
        back: [PLUMBLINE_HAND, BENCHLINE_LURKER, SCREEBACK_DARTER],
      },
      level: 279,
      gear: { grade: 2, level: 31 },
    },
    {
      id: 'c14-s9',
      name: 'The Weight Behind It',
      enemies: {
        front: [RINGWALL_HAMMERER, GATEFAST_WARDEN],
        back: [IRONSLING_WRIGHT, SPLINTERYARD_HONER, BENCHLINE_LURKER],
      },
      level: 279,
      gear: { grade: 2, level: 32 },
    },
    {
      // Mini-boss. The lieutenant's first appearance, and the first time the party's own swing is
      // taken down a quarter before it lands.
      id: 'c14-s10',
      name: 'The Deadbolt',
      enemies: {
        front: [THE_DEADBOLT, GATEFAST_WARDEN],
        back: [IRONSLING_WRIGHT, RINGWALL_HAMMERER, PLUMBLINE_HAND],
      },
      level: 280,
      gear: { grade: 2, level: 32 },
    },

    // -----------------------------------------------------------------------------------
    // The braced course — stages 11 to 20, levels 280 to 285, Fine 33 to 39
    //
    // The lock: the plate said as a **turn**. {@link SET_THE_STONE} puts {@link GUARD} across the
    // mason's whole side every sixty ticks against the status's own forty-five, so a seventh of every
    // cycle is a window where the board is only what its stat block says.
    //
    // ⚠️ **Unconditioned, and specifically not conditioned on being hurt.** A body that armours
    // itself as it is wounded is the one defensive shape nobody may author — it is the ninety-second
    // clock with a narrative attached. This one is set on a metronome whether it is needed or not,
    // which is what makes the window a property of the board rather than of the party's luck.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample, which is the harder of the two jobs: it may not read
      // as a step down from `c14-s9`. So it opens on the band's own caster behind the band above's
      // weight at full strength, rather than easing into it.
      id: 'c14-s11',
      name: 'Somebody Is Still Laying Courses',
      enemies: {
        front: [RINGWALL_HAMMERER, EDGETURN_WARDEN],
        back: [STONECOURSE_MASON, SPLINTERYARD_HONER, IRONSLING_WRIGHT],
      },
      level: 280,
      gear: { grade: 2, level: 33 },
    },
    {
      id: 'c14-s12',
      name: 'Set Before It Lands',
      enemies: {
        front: [GATEFAST_WARDEN, BRACEWORK_DELVER],
        back: [STONECOURSE_MASON, CHALKHIDE_BROWSER, DUSTPLATE_GRINDER],
      },
      level: 281,
      gear: { grade: 2, level: 34 },
    },
    {
      id: 'c14-s13',
      name: 'Bracework',
      enemies: {
        front: [RINGWALL_HAMMERER, BRACEWORK_DELVER],
        back: [STONECOURSE_MASON, SCREEBACK_DARTER, GALLERY_SLIPFANG],
      },
      level: 281,
      gear: { grade: 2, level: 34 },
    },
    {
      id: 'c14-s14',
      name: 'The Mortar Takes',
      enemies: {
        front: [EDGETURN_WARDEN, GATEFAST_WARDEN],
        back: [STONECOURSE_MASON, BENCHLINE_LURKER, SUMPWATER_BROOD],
      },
      level: 282,
      gear: { grade: 2, level: 35 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s15',
      name: 'One Course Ahead',
      enemies: {
        front: [RINGWALL_HAMMERER, EDGETURN_WARDEN],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, COLDHEARTH_IRONSWORN],
      },
      level: 282,
      gear: { grade: 2, level: 36 },
    },
    {
      id: 'c14-s16',
      name: 'The Window in It',
      enemies: {
        front: [OATHSTONE_BASTION, CHALKHIDE_BROWSER],
        back: [STONECOURSE_MASON, GRUDGEPLATE_SMITH, SCREEBACK_DARTER],
      },
      level: 283,
      gear: { grade: 2, level: 36 },
    },
    {
      // ⚠️ A probe sample, and the band's heaviest front rank: the hold's own wall beside the block
      // that keeps rebuilding it.
      id: 'c14-s17',
      name: 'Two Courses and a Wall',
      enemies: {
        front: [RINGWALL_HAMMERER, OATHSTONE_BASTION],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 283,
      gear: { grade: 2, level: 37 },
    },
    {
      id: 'c14-s18',
      name: 'Deeper Than the Working Went',
      enemies: {
        front: [THE_EDGEWRIGHT, BRACEWORK_DELVER],
        back: [STONECOURSE_MASON, SUMPWATER_BROOD, DEEPGALLERY_RUNNER],
      },
      level: 284,
      gear: { grade: 2, level: 38 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s19',
      name: 'What the Hold Kept Out',
      enemies: {
        front: [THE_EDGEWRIGHT, EDGETURN_WARDEN],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, OVERBURDEN_HULK],
      },
      level: 284,
      gear: { grade: 2, level: 38 },
    },
    {
      // Mini-boss. The lieutenant behind the band's own caster: the party's swing is blunted and the
      // course it was aimed at is reset on the same board.
      id: 'c14-s20',
      name: 'Barred From the Inside',
      enemies: {
        front: [THE_DEADBOLT, EDGETURN_WARDEN],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 285,
      gear: { grade: 2, level: 39 },
    },

    // -----------------------------------------------------------------------------------
    // Turned aside — stages 21 to 30, levels 285 to 290, Fine 40 to 46
    //
    // The lock: the same share off everything. `KINSTONE_BEARER` carries `physicalResist: 0.30` and
    // `BOLTFAST_IRONSIDE` 0.34 — the shipped field's third and second rungs, under
    // {@link THE_UNBITTEN}'s lone 0.40 — so this band is authored **at** the register where the plate
    // above it steps past.
    //
    // ⚠️ **The two bands are the same idea and different arithmetic, which is the point of standing
    // them next to each other.** `def` is applied to a quantity quadratic in the attacker's own
    // stat, so it costs a small swing more than a large one; resist multiplies the result, so it
    // costs both exactly the same third. A party that answered the plate by putting its big attacker
    // forward finds that answer buys nothing here.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample, so it is allowed to state the lock plainly on a
      // board the party has already beaten.
      id: 'c14-s21',
      name: 'Kinstone',
      enemies: {
        front: [KINSTONE_BEARER, GATEFAST_WARDEN],
        back: [STONECOURSE_MASON, PLUMBLINE_HAND, SCREEBACK_DARTER],
      },
      level: 285,
      gear: { grade: 2, level: 40 },
    },
    {
      id: 'c14-s22',
      name: 'The Dead in the Wall',
      enemies: {
        front: [KINSTONE_BEARER, RINGWALL_HAMMERER],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SCREEBACK_DARTER],
      },
      level: 286,
      gear: { grade: 2, level: 41 },
    },
    {
      // ⚠️ A probe sample, and the band's legendary arriving at full weight.
      //
      // ⚠️ **Authored for damage rather than for walls, which is the trap this stage fell into
      // twice.** The probe reads what a board *asks*, and a wall asks nothing: the first version of
      // this stage answered a step backwards by putting {@link OVERBURDEN_HULK} on it, and the
      // threshold went **down** — 879 to 805 — because a 1220-health cleanser at `haste: 60` deals
      // less than the damage dealer it replaced. What fixed it was two more attacking bodies.
      id: 'c14-s23',
      name: 'Boltfast',
      enemies: {
        front: [BOLTFAST_IRONSIDE, COLDHEARTH_IRONSWORN],
        back: [QUENCHWRIGHT, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 286,
      gear: { grade: 2, level: 41 },
    },
    {
      id: 'c14-s24',
      name: 'The Same Third of Everything',
      enemies: {
        front: [BOLTFAST_IRONSIDE, BRACEWORK_DELVER],
        back: [QUENCHWRIGHT, COLDFORGE_HAND, DUSTPLATE_GRINDER],
      },
      level: 287,
      gear: { grade: 2, level: 42 },
    },
    {
      id: 'c14-s25',
      name: 'Turned Aside',
      enemies: {
        front: [BOLTFAST_IRONSIDE, KINSTONE_BEARER],
        back: [STONECOURSE_MASON, BENCHLINE_LURKER, GALLERY_SLIPFANG],
      },
      level: 287,
      gear: { grade: 2, level: 43 },
    },
    {
      id: 'c14-s26',
      name: 'The Gallery Under the Gate',
      enemies: {
        front: [KINSTONE_BEARER, RINGWALL_HAMMERER],
        back: [IRONSLING_WRIGHT, SPLINTERYARD_HONER, OVERBURDEN_HULK],
      },
      level: 288,
      gear: { grade: 2, level: 43 },
    },
    {
      // ⚠️ A probe sample, and the band's first `ascended` anchor. One only — the front rank never
      // holds two of them anywhere in this chapter.
      id: 'c14-s27',
      name: 'The Edgewright in the Gallery',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 288,
      gear: { grade: 2, level: 44 },
    },
    {
      id: 'c14-s28',
      name: 'Nothing Gets Through Whole',
      enemies: {
        front: [BOLTFAST_IRONSIDE, EDGETURN_WARDEN],
        back: [STONECOURSE_MASON, SUMPWATER_BROOD, IRONSLING_WRIGHT],
      },
      level: 289,
      gear: { grade: 2, level: 45 },
    },
    {
      // ⚠️ A probe sample, and the last board before the third mini-boss.
      id: 'c14-s29',
      name: 'The Plate and the Course',
      enemies: {
        front: [BOLTFAST_IRONSIDE, RINGWALL_HAMMERER],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 289,
      gear: { grade: 2, level: 45 },
    },
    {
      // Mini-boss. The lieutenant behind the block that takes the same share off everything, so the
      // answer the party found on `c14-s10` is the answer that stops working here.
      id: 'c14-s30',
      name: 'What Is Left of the Watch',
      enemies: {
        front: [THE_DEADBOLT, BOLTFAST_IRONSIDE],
        back: [STONECOURSE_MASON, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 290,
      gear: { grade: 2, level: 46 },
    },

    // -----------------------------------------------------------------------------------
    // The ward — stages 31 to 40, levels 290 to 295, Fine 47 to 53
    //
    // The lock: a pool banked in front of the board. {@link BANK_THE_WARD} puts a {@link BARRIER}
    // across the keeper's whole side every eighty ticks against the status's own seventy, so it
    // lapses before it is re-banked and a party that spreads its damage fills five pools where a
    // party that concentrates burns one and then kills.
    //
    // ⚠️ **A pool is not a heal, and the whole band rests on the difference.** A barrier is banked
    // once and depletes; closing pressure amplifies damage without bound and deliberately does not
    // amplify healing, so a pool cannot outrun a fight the way a heal can. ⚠️ **And it sits on the
    // softest body the chapter fields** — 600 health and 20 `def`, in the back rank — because a pool
    // whose source the party cannot delete is a clock rather than a lock.
    //
    // ⚠️ **Measured, the ward is worth 0.00 survivors and +0.7s.** It is here because it is what the
    // place is, not because it is what makes the band hard; see the chapter header's negative list.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample — the second of the two, and the same job as
      // `c14-s11`. So it opens on an `ascended` anchor and the band below's block at once.
      id: 'c14-s31',
      name: 'The Wards Were Set That Day',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, IRONSLING_WRIGHT, SPLINTERYARD_HONER],
      },
      level: 290,
      gear: { grade: 2, level: 47 },
    },
    {
      id: 'c14-s32',
      name: 'Banked in Front of It',
      enemies: {
        front: [BOLTFAST_IRONSIDE, KINSTONE_BEARER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, IRONSLING_WRIGHT],
      },
      level: 291,
      gear: { grade: 2, level: 48 },
    },
    {
      id: 'c14-s33',
      name: 'The Deeplamps',
      enemies: {
        front: [RINGWALL_HAMMERER, EDGETURN_WARDEN],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, GALLERY_SLIPFANG],
      },
      level: 291,
      gear: { grade: 2, level: 48 },
    },
    {
      id: 'c14-s34',
      name: 'Spent, Not Refilled',
      enemies: {
        front: [BOLTFAST_IRONSIDE, GATEFAST_WARDEN],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, OVERBURDEN_HULK],
      },
      level: 292,
      gear: { grade: 2, level: 49 },
    },
    {
      // ⚠️ A probe sample. Three of the chapter's four locks on one board: the plate, the course and
      // the pool.
      id: 'c14-s35',
      name: 'All But the Bar',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, STONECOURSE_MASON, RINGWALL_HAMMERER],
      },
      level: 292,
      gear: { grade: 2, level: 50 },
    },
    {
      id: 'c14-s36',
      name: 'The Lamps Go Out in Order',
      enemies: {
        front: [BOLTFAST_IRONSIDE, BRACEWORK_DELVER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, DUSTPLATE_GRINDER],
      },
      level: 293,
      gear: { grade: 2, level: 50 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s37',
      name: 'Nothing the Party Spends Arrives',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, IRONSLING_WRIGHT],
      },
      level: 293,
      gear: { grade: 2, level: 51 },
    },
    {
      id: 'c14-s38',
      name: 'The Second Gate',
      enemies: {
        front: [THE_DEEPCUT, KINSTONE_BEARER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, PLUMBLINE_HAND],
      },
      level: 294,
      gear: { grade: 2, level: 52 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s39',
      name: 'What the Keepers Kept',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, SPLINTERYARD_HONER],
      },
      level: 294,
      gear: { grade: 2, level: 52 },
    },
    {
      // Mini-boss, and the lieutenant's last appearance — fifteen levels above where the party first
      // met it, with the band's pool standing behind it. Its own turn is still conditioned, so a
      // party that has already traded a body never sees it here.
      id: 'c14-s40',
      name: 'Still Holding It Shut',
      enemies: {
        front: [THE_DEADBOLT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, IRONSLING_WRIGHT],
      },
      level: 295,
      gear: { grade: 2, level: 53 },
    },

    // -----------------------------------------------------------------------------------
    // The shutgate — stages 41 to 50, levels 295 to 300, Fine 54 to 60
    //
    // All four locks at once, and the Fine set at the top of its own ladder. Nothing new is asked
    // above this line: what changes is that every board carries two of the four at the same time and
    // the front rank stops being anything the party can go through quickly.
    //
    // ⚠️ **The quarry runs out**, which is the fiction and the arithmetic at once: counted, the five
    // bands carry **14, 10, 7, 4 and 2** Monster slots. Whatever came in through the breach did not
    // get this far in either.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample.
      id: 'c14-s41',
      name: 'The Last Course',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, STONECOURSE_MASON, RINGWALL_HAMMERER],
      },
      level: 295,
      gear: { grade: 2, level: 54 },
    },
    {
      id: 'c14-s42',
      name: 'Shut From the Inside',
      enemies: {
        front: [BOLTFAST_IRONSIDE, RINGWALL_HAMMERER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, GALLERY_SLIPFANG],
      },
      level: 296,
      gear: { grade: 2, level: 54 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s43',
      name: 'A Long Time Ago, Against Something',
      enemies: {
        front: [THE_EDGEWRIGHT, RINGWALL_HAMMERER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, COLDHEARTH_IRONSWORN],
      },
      level: 296,
      gear: { grade: 2, level: 55 },
    },
    {
      id: 'c14-s44',
      name: 'Neither Half Is Worth the Turn',
      enemies: {
        front: [BOLTFAST_IRONSIDE, GATEFAST_WARDEN],
        back: [WARDSTONE_KEEPER, STONECOURSE_MASON, COLDHEARTH_IRONSWORN],
      },
      level: 297,
      gear: { grade: 2, level: 56 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c14-s45',
      name: 'The Hold Answers',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, RINGWALL_HAMMERER],
      },
      level: 297,
      gear: { grade: 2, level: 57 },
    },
    {
      id: 'c14-s46',
      name: 'Down to the Gate',
      enemies: {
        front: [THE_DEEPCUT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, STONECOURSE_MASON, IRONSLING_WRIGHT],
      },
      level: 298,
      gear: { grade: 2, level: 57 },
    },
    {
      // ⚠️ A probe sample, and the chapter's heaviest board that is not the final.
      id: 'c14-s47',
      name: 'Nothing Small Moves It',
      enemies: {
        front: [THE_EDGEWRIGHT, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, SPLINTERYARD_HONER],
      },
      level: 298,
      gear: { grade: 2, level: 58 },
    },
    {
      id: 'c14-s48',
      name: 'The Bar Across It',
      enemies: {
        front: [BOLTFAST_IRONSIDE, RINGWALL_HAMMERER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, STONECOURSE_MASON],
      },
      level: 299,
      gear: { grade: 2, level: 59 },
    },
    {
      // The last board before the final. The chapter's own list in full, one level below the thing
      // the list has been describing.
      id: 'c14-s49',
      name: 'The Doorstone in the Dark',
      enemies: {
        front: [THE_EDGEWRIGHT, RINGWALL_HAMMERER],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, IRONSLING_WRIGHT],
      },
      level: 299,
      gear: { grade: 2, level: 59 },
    },
    {
      // The chapter final. ⚠️ **One `ascended` anchor and four legendaries**, which is the shape
      // chapters 9 through 13 all settled on — the lieutenant is deliberately absent, because a
      // second anchor beside a boss is the sharpest non-linear weight step this game can author, and
      // at this chapter's forty-level gap it is measurably a cliff rather than a step.
      //
      // Every band on one board: the Ringwall's plate, the Boltfast's flat third, the Keeper's
      // banked pool and the Sealer's lamps. What The Doorstone adds is
      // {@link NOTHING_SMALL_MOVES_IT} — the whole party hit and blunted on a seventy-tick cadence,
      // and **unconditioned**, unlike {@link THE_BAR_HOLDS} below it, so the answer the chapter
      // taught does not work here.
      //
      // ⚠️ **It restores nothing and banks nothing itself**, and that is the one absolute claim the
      // chapter makes about a single board's anchor. No `recovery`, no `healthRegen`, no `lifeLeech`,
      // and no heal, drain or pool in its own kit. The board's ward is the Keeper's, standing in the
      // back rank where the party can aim at it.
      //
      // ⚠️ **`def: 70` is the one stat on this board that steps past the shipped register**, whose
      // ceiling is {@link UNMADE}'s 58. `physicalResist: 0.30` sits at the register's third rung, and
      // 1480 health and 88 attack are **under** the final one chapter below it — see the chapter
      // header for why a later chapter's anchors are now the lighter ones.
      id: 'c14-s50',
      name: 'The Doorstone',
      enemies: {
        front: [THE_DOORSTONE, BOLTFAST_IRONSIDE],
        back: [WARDSTONE_KEEPER, DEEPLAMP_SEALER, RINGWALL_HAMMERER],
      },
      level: 300,
      gear: { grade: 2, level: 60 },
    },
  ],
} as const;
