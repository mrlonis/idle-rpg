import {
  BARROW_SOVEREIGN,
  BONECHAIN_WARDEN,
  BRAMBLEHIDE_RAVENER,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CINDERQUENCH_BEARER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  FORGE_THRALL,
  GLOAMVINE_CREEPER,
  GRAVEMOURN_KEEPER,
  GRUDGEPLATE_SMITH,
  HOLLOWBARK_SENTRY,
  LONGBOUGH_MARKSMAN,
  MARCHWARD_PIKEMAN,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  OATHSTONE_BASTION,
  QUENCHWRIGHT,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SENTINEL,
  SLAGBOUND_DRUDGE,
  THE_ANVIL_CROWNED,
  THE_GRUDGEKEEPER,
  TYRANT,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * Chapter 9 — The Hollow Anvil.
 *
 * Fifty stages, enemy levels 396 to 490. It **opens at the level chapter 8 closed on**, which is the
 * rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Sunless Weald did not
 *
 * The barrows asked about *how* the party's damage arrives and the weald about *where* it lands.
 * This chapter asks whether **anything the party does stays done** — which is what a hold is, and it
 * is aimed at the half of a turn a party stops counting once its line-up works: the setup. Eight
 * chapters have taught the same opening, which is to Sunder the wall, Weaken the carry and Slow
 * whatever is fast. Down here none of that lands, and what does land is taken off again.
 *
 * | Band            | Stages | The lock it teaches                                           |
 * | --------------- | ------ | ------------------------------------------------------------- |
 * | The cold forge  | 1–10   | your setup does not land                                      |
 * | The quench      | 11–20  | what you put back does not stay                               |
 * | The grudge      | 21–30  | what you commit to is what charges you                        |
 * | The oath        | 31–40  | the one thing you may hit is the one you cannot open          |
 * | The hollow anvil| 41–50  | all four, and the thing the hold was built around             |
 *
 * ⚠️ **No new status, and that is the third chapter in a row to come in under the ceiling in some
 * form.** Milestone 21 licenses three across its four chapters; 21a spent none, 21b spent one, and
 * two remain after this. All three of this chapter's new turns are shipped parts **aimed somewhere
 * they have never been aimed** — {@link THE_QUENCH} is the first status of any kind on
 * `enemy-lowest`, {@link IRON_FOR_IRON} is the first reflect on a *chosen* ally and the first
 * reactive one, and {@link THE_ANVIL_FALLS} is the first stun on one body rather than the whole
 * board. See [`skills.ts`](./skills.ts) for each argument.
 *
 * **Band 1 is a stat block and nothing else, which is the weald's move on a different stat.**
 * `tenacity` is not a `ModifiableStat` — that list is `atk`, `def` and `haste` — so refusal cannot be
 * a status without a `core/` change this milestone forbids, and it does not need to be.
 * `statusChance` is `authored + insight − tenacity` clamped at zero, so a board at 0.55 takes the
 * party's 0.85 Sunder down to 0.30 and {@link THE_ANVIL_CROWNED} at 0.85 takes it to nothing at all.
 * What answers it is `insight`, which two characters carry and no content has ever made matter — and
 * past that, the answer the Adamant Colossus has given since milestone 7: **stop needing the
 * debuff.**
 *
 * ## Where the levels come from
 *
 * 396 to 490, about 1.9 levels a stage against the Weald's 1.8 and the Barrows' 1.6. `mythic-plus`
 * caps at 420, so the margin is **+70** where chapter 8's was +56 and chapter 7's +45.
 *
 * ⚠️ **The roadmap said ~458 and 21b's corrected rule says +66; both are low, and the number was
 * found the way 21b found its own — by bisecting.** Running 21b's arithmetic forward reproduces
 * chapter 8's shipped 396 almost exactly and points here at 486, which measures as a walkover: the
 * party the chapter is tuned for takes the final at 486 with **4.75 of five still standing**. The
 * transition is the step function `docs/testing.md` warns about — 100% at 496, 85% at 498, 25% at
 * 500 and 0% at 502 — so the close is 490, six levels above what the closed form predicted and
 * seven below the 90% edge.
 *
 * | Chapter | Party                   | Margin | Ratio |
 * | ------- | ----------------------- | ------ | ----- |
 * | 7       | `legendary-plus` at 260 | +45    | ~1.16 |
 * | 8       | `mythic` at 340         | +56    | 1.10  |
 * | 9       | `mythic-plus` at 420    | +70    | 1.21  |
 *
 * ⚠️ **Chapter 10 has ten levels of room and no more.** `chapters.spec.ts` holds the top of the
 * ladder under `LEVEL_CURVE.maxLevel / 2`, which is 500, and this chapter closes at 490. That guard
 * was written when two chapters could not be allowed to consume the curve and it is about to mean
 * something entirely different; see [authoring](../../docs/authoring.md).
 *
 * Still no lucky pull anywhere on the ladder: the rung is fifty-two duplicate copies of each of the
 * five, six more than chapter 8 asked for, and every one of them is bought with time.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the boss: **eight new, twenty-four returning**
 * — exactly the quarter milestone 21 asks of a chapter, measured over what the chapter *fields*
 * rather than over the shipped pool. All eight of the Dwarven blocks the ladder already had are
 * fielded here, which is the point of a hold: the garrison the party has been meeting one at a time
 * since the fen is standing in its own halls. The rest is weighted toward the weald the party has
 * just walked down out of, and toward the barrows behind that.
 *
 * ⚠️ **No celestial appears anywhere in this chapter, and unlike chapter 8's version of this note it
 * is checked rather than asserted.** The Sundered Vault records the argument: an Angel or a Demon
 * taxes every mortal ×1.10 with no mortal → celestial row to answer it, worth roughly nine levels of
 * investment. This chapter's own tax is `tenacity`, which no composition answers either, and two
 * unanswerable multipliers on one board is one more than a chapter should carry. The Unmade is the
 * heaviest anchor on the ladder and it is deliberately absent for that reason; the Adamant Colossus,
 * the Bonefall Tyrant and the Barrow Sovereign do that job here.
 *
 * ⚠️ **The Anvil Crowned is the ninth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **At most one taunt source per board**, unchanged from chapters 7 and 8 and for the same
 *    reason: two taunters at a 45-tick status against a 60-tick cooldown leave the door shut about
 *    ninety-four percent of the time. Four blocks here can taunt — the Oathstone Bastion, the Riven
 *    Marchwarden, the Cairnbound Sentinel and the Oathshield Vanguard — and no board fields two.
 *    ⚠️ **The Anvil Crowned is deliberately not among them**; see [`enemies.ts`](./enemies.ts) for
 *    why a boss that taunts is the easier boss.
 * 2. ⚠️ **Nothing that puts health back stands on a board with a taunt.** A taunt narrows the target
 *    pool *before* the row rule is consulted, so sustain the party cannot aim at is a ninety-second
 *    clock however the ranks are arranged — and a timeout is scored as a **defeat**. That rules out
 *    the Iron Bulwark, the Barrow Sovereign, the Bramblehide Ravener and the Wyrdroot Ancient
 *    wherever a taunt stands, and each appears only on boards with none. The Gravemourn Keeper is
 *    the deliberate exception and is not one: a cleanse puts nothing back.
 * 3. ⚠️ **A Dwarven chapter is the one most able to run the clock out, and the boards are authored
 *    against that rather than for the fiction.** This faction owns the tankiest blocks in the game
 *    and the timer's headroom over the longest tuned fight is 1.44×, so every board carries at least
 *    one thing that dies quickly, three of the ten new blocks carry real `haste`, and no board fields
 *    two of the Colossus, the Cairn Sentinel and the Iron Bulwark at once.
 */
export const CHAPTER_9 = {
  id: 'chapter-9',
  name: 'The Hollow Anvil',
  stages: [
    // -----------------------------------------------------------------------------------
    // The cold forge — stages 1 to 10, levels 396 to 413
    // -----------------------------------------------------------------------------------
    {
      // The seam, at the Weald's own closing level: the wood that grew over the hold's gate, with
      // the first two hold bodies standing in it. The fight the party that took The Withered Crown
      // already knows how to have — except that the Sunder it opens with lands about a third of the
      // time now, and nothing on screen says why.
      id: 'c9-s1',
      name: 'The Broken Gate',
      enemies: {
        front: [HOLLOWBARK_SENTRY, COLDFORGE_HAND],
        back: [WEALDSHADOW_STALKER, WHISPERLEAF_ARCHER, COLDFORGE_HAND],
      },
      level: 150,
    },
    {
      // The lock stated plainly, on nothing but fodder. Nothing here is dangerous and nothing here
      // can be softened, which is the whole of what `tenacity` is: a tax on the setup turn rather
      // than on the swing.
      id: 'c9-s2',
      name: 'The Dead Bellows',
      enemies: {
        front: [SLAGBOUND_DRUDGE, FORGE_THRALL],
        back: [COLDFORGE_HAND, WHISPERLEAF_ARCHER],
      },
      level: 151,
    },
    {
      id: 'c9-s3',
      name: 'Ashless Hearth',
      enemies: {
        front: [SLAGBOUND_DRUDGE, COLDFORGE_HAND],
        back: [DEEPROCK_MINER, DEEPGALLERY_RUNNER, WHISPERLEAF_ARCHER],
      },
      level: 151,
    },
    {
      id: 'c9-s4',
      name: 'The Long Stair',
      enemies: {
        front: [COLDFORGE_HAND, DEEPGALLERY_RUNNER],
        back: [WEALDSHADOW_STALKER, COLDFORGE_HAND, WHISPERLEAF_ARCHER],
      },
      level: 152,
    },
    {
      // ⚠️ A probe sample, and the first in the chapter — the seam at `c9-s1` is skipped, because a
      // sample following a chapter boss is a step down by construction. The Ironsworn anchors it:
      // refusal on a body that kills things, rather than on fodder that does not.
      id: 'c9-s5',
      name: 'Coldhearth',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SLAGBOUND_DRUDGE],
        back: [COLDFORGE_HAND, DEEPGALLERY_RUNNER, WHISPERLEAF_ARCHER],
      },
      level: 152,
    },
    {
      id: 'c9-s6',
      name: 'The Slag Road',
      enemies: {
        front: [SLAGBOUND_DRUDGE, MARCHWARD_PIKEMAN],
        back: [COLDFORGE_HAND, DEEPROCK_MINER, DEEPGALLERY_RUNNER],
      },
      level: 153,
    },
    {
      id: 'c9-s7',
      name: 'Deepgallery',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, DEEPGALLERY_RUNNER],
        back: [DEEPGALLERY_RUNNER, WHISPERLEAF_ARCHER, COLDFORGE_HAND],
      },
      level: 153,
    },
    {
      // The band's other half arrives, and it has been in the game since milestone 15c without ever
      // being the point of a board: a Runewarden takes two statuses off everything standing. Refused
      // on the way in at `c9-s5`, removed on the way out here.
      id: 'c9-s8',
      name: 'The Unstruck Rune',
      enemies: {
        front: [RUNEWARDEN, SLAGBOUND_DRUDGE],
        back: [COLDFORGE_HAND, LONGBOUGH_MARKSMAN],
      },
      level: 154,
    },
    {
      // ⚠️ A probe sample, and the band at full weight: `tenacity: 0.8` in the front rank and a
      // cleanse behind it, so a debuff that survives the dice does not survive the next sixty ticks.
      id: 'c9-s9',
      name: 'What the Rune Refuses',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SLAGBOUND_DRUDGE],
        back: [RUNEWARDEN, COLDFORGE_HAND, WEALDSHADOW_STALKER],
      },
      level: 154,
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **The same block stands on all four**,
      // at 413, 432, 452 and 471 — a recurring antagonist that gets harder because the ladder does,
      // rather than four one-shot stat blocks.
      //
      // ⚠️ **Its signature is reactive rather than an opening turn, which is the one way it differs
      // from the Gravewright and the Longshadow** — and it differs because this chapter's first band
      // is a stat block and cannot be applied by a turn at all. What that buys is better than the
      // parallel: those two set their board up on tick one and then stopped, while this answers what
      // the party is *doing*, so its four appearances are four different fights.
      id: 'c9-s10',
      name: 'The Grudgekeeper',
      enemies: {
        front: [THE_GRUDGEKEEPER, SLAGBOUND_DRUDGE],
        back: [COLDHEARTH_IRONSWORN, COLDFORGE_HAND, DEEPGALLERY_RUNNER],
      },
      level: 155,
    },

    // -----------------------------------------------------------------------------------
    // The quench — stages 11 to 20, levels 415 to 432
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is **not** a probe sample — the stride puts those on s5, s9, s13 and s17
      // in this chapter — so this is free to be what a band opening wants to be: the lock taught
      // small, with two Bearers behind a wall and nothing else going on. The heal lands, and the
      // fuse lands on top of it.
      id: 'c9-s11',
      name: 'The Quenching Pool',
      enemies: {
        front: [SLAGBOUND_DRUDGE, COLDFORGE_HAND],
        back: [CINDERQUENCH_BEARER, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
      level: 155,
    },
    {
      id: 'c9-s12',
      name: 'Steam and Iron',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SLAGBOUND_DRUDGE],
        back: [CINDERQUENCH_BEARER, DEEPGALLERY_RUNNER, WHISPERLEAF_ARCHER],
      },
      level: 156,
    },
    {
      // ⚠️ A probe sample. The band at legendary weight: a Quenchwright survives being noticed and
      // reaches the party's back rank between plants, so the member being healed and the member
      // being shot are not the same member and the cleanse has somewhere else it is wanted.
      id: 'c9-s13',
      name: 'The Quenchwright',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SLAGBOUND_DRUDGE],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, LONGBOUGH_MARKSMAN],
      },
      level: 156,
    },
    {
      id: 'c9-s14',
      name: 'Nothing Mended',
      enemies: {
        front: [RIMEPLATE, COLDFORGE_HAND],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
      level: 157,
    },
    {
      // Three planters against one cleanse. The fuse is forty ticks and a Bearer costs almost
      // nothing to field, so the question stops being *whether* to spend the cleanse and becomes
      // which of the three plants is the one worth spending it on.
      id: 'c9-s15',
      name: 'The Second Fire',
      enemies: {
        front: [SLAGBOUND_DRUDGE, DEEPGALLERY_RUNNER],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, CINDERQUENCH_BEARER],
      },
      level: 157,
    },
    {
      id: 'c9-s16',
      name: 'Sootfall',
      enemies: {
        front: [BULWARK_ENEMY, COLDFORGE_HAND],
        back: [CINDERQUENCH_BEARER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 158,
    },
    {
      // ⚠️ A probe sample, and the band's hardest form: the party's cleanse is wanted on the fuse,
      // its Runeward-shaped problem is that the board takes its debuffs off anyway, and its heal is
      // wanted on the body carrying the fuse. Three claims on two turns.
      id: 'c9-s17',
      name: 'The Cleanse and the Cure',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SLAGBOUND_DRUDGE],
        back: [QUENCHWRIGHT, RUNEWARDEN, CINDERQUENCH_BEARER],
      },
      level: 158,
    },
    {
      id: 'c9-s18',
      name: "The Ironmonger's Yard",
      enemies: {
        front: [SENTINEL, DEEPGALLERY_RUNNER],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
      level: 159,
    },
    {
      id: 'c9-s19',
      name: 'Cold Water',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, MARCHWARD_PIKEMAN],
        back: [QUENCHWRIGHT, QUENCHWRIGHT, LONGBOUGH_MARKSMAN],
      },
      level: 159,
    },
    {
      // Mini-boss. The lieutenant with the band's lock beside it, and no taunt anywhere on the board
      // — the Grudgekeeper already decides where the party's damage is worth spending by billing it,
      // and a shut door on top of that is a fight held rather than a question asked.
      id: 'c9-s20',
      name: "The Grudgekeeper's Fire",
      enemies: {
        front: [THE_GRUDGEKEEPER, SLAGBOUND_DRUDGE],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, COLDHEARTH_IRONSWORN],
      },
      level: 160,
    },

    // -----------------------------------------------------------------------------------
    // The grudge — stages 21 to 30, levels 434 to 452
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **A band opener that is also a probe sample, which is the trap chapters 6, 7 and 8 all
      // fell into.** Band openings want to be light and the stride does not care, so this is
      // authored heavy on purpose: five bodies, two legendaries in front and the Smith already
      // behind them. The fix for a step backwards is weight, never +3 enemy levels — that would
      // fight the level curve for about thirteen percent and lose.
      //
      // ⚠️ And the Waking Barrows' correction applies on top: **what a board asks and what it weighs
      // are different numbers**, and the probe only reads the second. A Ravener that is simply
      // thorned is a cheap question, so the weight is carried by the bodies rather than by the lock.
      id: 'c9-s21',
      name: 'The Grudgeplate',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, CINDERQUENCH_BEARER],
      },
      level: 160,
    },
    {
      id: 'c9-s22',
      name: 'Iron for Iron',
      enemies: {
        front: [CAIRNWARD_HUSK, SLAGBOUND_DRUDGE],
        back: [GRUDGEPLATE_SMITH, COLDFORGE_HAND, WHISPERLEAF_ARCHER],
      },
      level: 161,
    },
    {
      // Two Smiths, so the thing the party has committed to is thorned twice a cycle against a
      // cleanse that reaches one body at a time. The same shape the Marksmen asked in the weald,
      // moved off the party's back rank and onto the enemy's front one.
      id: 'c9-s23',
      name: 'The Tally',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, COLDFORGE_HAND],
        back: [GRUDGEPLATE_SMITH, GRUDGEPLATE_SMITH, LONGBOUGH_MARKSMAN],
      },
      level: 161,
    },
    {
      id: 'c9-s24',
      name: 'Spines in the Dark',
      enemies: {
        front: [CAIRNWARD_HUSK, DEEPGALLERY_RUNNER],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, WHISPERLEAF_ARCHER],
      },
      level: 162,
    },
    {
      // ⚠️ A probe sample, and the band's question at full weight. It is the inverse of the weald's
      // third band and worth reading beside it: roots asked the party to stop focusing, and this
      // asks it to focus harder — because a reflect bills the blow that lands rather than moving it,
      // so the cheapest way through is the one that finishes.
      id: 'c9-s25',
      name: 'What It Costs to Finish',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, BRAMBLEHIDE_RAVENER],
        back: [GRUDGEPLATE_SMITH, GRUDGEPLATE_SMITH, QUENCHWRIGHT],
      },
      level: 162,
    },
    {
      id: 'c9-s26',
      name: 'The Grudge Wall',
      enemies: {
        front: [SENTINEL, CAIRNWARD_HUSK],
        back: [GRUDGEPLATE_SMITH, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
      level: 163,
    },
    {
      // The weald's roots through the hold's floor, and the two chapters' answers refusing each
      // other: the bound half wants the party to spread and the thorned half wants it to finish.
      id: 'c9-s27',
      name: 'Bound and Billed',
      enemies: {
        front: [SLAGBOUND_DRUDGE, GLOAMVINE_CREEPER],
        back: [GRUDGEPLATE_SMITH, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 163,
    },
    {
      id: 'c9-s28',
      name: 'The Old Ledger',
      enemies: {
        front: [BULWARK_ENEMY, CAIRNWARD_HUSK],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, CINDERQUENCH_BEARER],
      },
      level: 164,
    },
    {
      // ⚠️ A probe sample. Two Smiths behind two thorned bodies: whatever the party is killing is
      // billing it, and so is whatever is standing in front of that.
      id: 'c9-s29',
      name: 'Every Blow Answered',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, GRUDGEPLATE_SMITH, WEALDSHADOW_STALKER],
      },
      level: 164,
    },
    {
      // Mini-boss. The lieutenant on a board that is already thorned before it takes a turn, so its
      // own reactive spines are spent on whichever body the party has just committed to rather than
      // on setting the board up.
      id: 'c9-s30',
      name: "The Grudgekeeper's Ledger",
      enemies: {
        front: [THE_GRUDGEKEEPER, CAIRNWARD_HUSK],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, COLDHEARTH_IRONSWORN],
      },
      level: 165,
    },

    // -----------------------------------------------------------------------------------
    // The oath — stages 31 to 40, levels 454 to 471
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is not a probe sample, so it is allowed to be the quiet one: four bodies,
      // the lock taught once. The Bastion says the party may hit nothing else, and its `tenacity`
      // says the party may not soften what it is now obliged to hit.
      id: 'c9-s31',
      name: 'The Oathstone',
      enemies: {
        front: [OATHSTONE_BASTION, COLDFORGE_HAND],
        back: [COLDHEARTH_IRONSWORN, WHISPERLEAF_ARCHER],
      },
      level: 165,
    },
    {
      id: 'c9-s32',
      name: 'The Shut Door',
      enemies: {
        front: [OATHSTONE_BASTION, SLAGBOUND_DRUDGE],
        back: [QUENCHWRIGHT, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
      level: 166,
    },
    {
      // ⚠️ A probe sample, and the band's hardest form: the door is shut, what is behind it is
      // arming itself, and the hammer takes the turn of the one body the party cannot do without.
      // `enemy-highest` is the party's wall by construction, and a wall keeps standing in the front
      // rank while stunned — what it stops doing is everything else.
      id: 'c9-s33',
      name: 'Nothing to Aim At',
      enemies: {
        front: [OATHSTONE_BASTION, COLDHEARTH_IRONSWORN],
        back: [QUENCHWRIGHT, GRUDGEPLATE_SMITH, LONGBOUGH_MARKSMAN],
      },
      level: 166,
    },
    {
      id: 'c9-s34',
      name: "The Vanguard's Oath",
      enemies: {
        front: [OATHSHIELD_VANGUARD, COLDFORGE_HAND],
        back: [COLDHEARTH_IRONSWORN, CINDERQUENCH_BEARER, DEEPGALLERY_RUNNER],
      },
      level: 167,
    },
    {
      id: 'c9-s35',
      name: 'Held at the Gate',
      enemies: {
        front: [OATHSTONE_BASTION, DEEPGALLERY_RUNNER],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, WHISPERLEAF_ARCHER],
      },
      level: 167,
    },
    {
      id: 'c9-s36',
      name: 'The Hammer and the Door',
      enemies: {
        front: [RIVEN_MARCHWARDEN, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, LONGBOUGH_MARKSMAN, CINDERQUENCH_BEARER],
      },
      level: 168,
    },
    {
      // ⚠️ A probe sample. The Rimeplate beside the Bastion, which is the band's answer to the answer:
      // a party that gives up on debuffs and reaches for penetration instead finds the one body it is
      // allowed to hit resists both halves of what is left.
      id: 'c9-s37',
      name: 'The Anvil Falls',
      enemies: {
        front: [OATHSTONE_BASTION, RIMEPLATE],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, WEALDSHADOW_STALKER],
      },
      level: 168,
    },
    {
      id: 'c9-s38',
      name: 'The Refused Wall',
      enemies: {
        front: [OATHSTONE_BASTION, SLAGBOUND_DRUDGE],
        back: [COLDHEARTH_IRONSWORN, GRUDGEPLATE_SMITH, LONGBOUGH_MARKSMAN],
      },
      level: 169,
    },
    {
      // The barrows' own taunt, which is thorned as well as shut — the pair chapter 7 built and this
      // band's own bodies standing behind it.
      id: 'c9-s39',
      name: 'The Last Door',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, GLOAMVINE_CREEPER],
      },
      level: 169,
    },
    {
      // Mini-boss, and the last time the lieutenant is met. Every question the chapter has asked
      // except the anvil's own: the door is shut by something that cannot be opened, the board bills
      // every blow that does land, the party's heal is undone as it arrives, and its wall spends
      // whole turns doing nothing.
      id: 'c9-s40',
      name: 'The Grudgekeeper Unbroken',
      enemies: {
        front: [THE_GRUDGEKEEPER, OATHSTONE_BASTION],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, COLDHEARTH_IRONSWORN],
      },
      level: 170,
    },

    // -----------------------------------------------------------------------------------
    // The hollow anvil — stages 41 to 50, levels 473 to 490
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **The second band opener on a probe sample, and it is heavy for the reason `c9-s21` is.**
      // The Colossus anchors it rather than +3 enemy levels doing the work: composition moves
      // difficulty by far more than a level does. It is also band 1 at `ascended` weight — the
      // tenacity lock the ladder has fielded since chapter 2, met again by a party that now knows
      // exactly what it costs.
      id: 'c9-s41',
      name: 'Under the Anvil',
      enemies: {
        front: [COLOSSUS, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, CINDERQUENCH_BEARER],
      },
      level: 170,
    },
    {
      id: 'c9-s42',
      name: 'The Deep Furnace',
      enemies: {
        front: [TYRANT, SLAGBOUND_DRUDGE],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, WHISPERLEAF_ARCHER],
      },
      level: 171,
    },
    {
      // The wood that came down through the roof. Bound, thorned and regrowing at once — and
      // reachable, because nothing on this board taunts.
      id: 'c9-s43',
      name: 'Rootbound Iron',
      enemies: {
        front: [WYRDROOT_ANCIENT, CAIRNWARD_HUSK],
        back: [GRUDGEPLATE_SMITH, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 171,
    },
    {
      id: 'c9-s44',
      name: "The Sovereign's Debt",
      enemies: {
        front: [BARROW_SOVEREIGN, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, BONECHAIN_WARDEN],
      },
      level: 172,
    },
    {
      // ⚠️ A probe sample. A taunt in front of the thing that takes the biggest body on the field —
      // so the party's wall is claimed by the Tyrant and stunned by nothing it can reach.
      id: 'c9-s45',
      name: 'The Oath and the Anvil',
      enemies: {
        front: [OATHSTONE_BASTION, TYRANT],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, CINDERQUENCH_BEARER],
      },
      level: 172,
    },
    {
      id: 'c9-s46',
      name: 'Coldhearth Deep',
      enemies: {
        front: [OATHBREAKER, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, LONGBOUGH_MARKSMAN],
      },
      level: 173,
    },
    {
      // The chapter's first band and its second at `ascended` weight on one board: refused on the way
      // in by 0.85 tenacity, and removed on the way out by the Runewarden behind it.
      id: 'c9-s47',
      name: 'The Unwritten Hold',
      enemies: {
        front: [COLOSSUS, CAIRNWARD_HUSK],
        back: [RUNEWARDEN, GRUDGEPLATE_SMITH, QUENCHWRIGHT],
      },
      level: 173,
    },
    {
      // A taunt with a cleanse behind it, which is the one shape of that pair the chapter permits:
      // the Keeper takes three statuses off the body carrying the most of them and puts no health
      // back, so the door being shut costs the party its setup rather than the clock.
      id: 'c9-s48',
      name: 'The Last Muster',
      enemies: {
        front: [OATHSHIELD_VANGUARD, COLDHEARTH_IRONSWORN],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, GRAVEMOURN_KEEPER],
      },
      level: 174,
    },
    {
      // ⚠️ A probe sample, and the last one before the final. The Colossus and a thorned Ravener in
      // front of the two bodies the chapter has been built out of.
      id: 'c9-s49',
      name: 'The Way to the Anvil',
      enemies: {
        front: [COLOSSUS, BRAMBLEHIDE_RAVENER],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, WEALDSHADOW_STALKER],
      },
      level: 174,
    },
    {
      // ⚠️ The chapter boss, and the ninth body on the ladder standing on exactly one stage. All four
      // of the chapter's questions are on it: `tenacity: 0.85` means nothing the party writes on it
      // lands at all, the Quench undoes whatever its healer has just done, it is thorned from the
      // first tick so every blow is billed, and the Anvil falls on the one body the party cannot do
      // without.
      //
      // ⚠️ **The Bastion wears the taunt rather than the Crowned**, which is 21a's finding and not
      // this chapter's to re-derive: a boss that draws every attack onto itself aims them at the body
      // the party was going to focus anyway and spends its own turns dealing nothing.
      //
      // **The Grudgekeeper does not stand here, and that is this chapter's choice rather than a
      // rule.** What the rule forbids is a lieutenant being *the* fight; as support it is permitted,
      // and `c7-s50` fields the Gravewright for exactly that reason. This board does not need it: it
      // measures 3.65 survivors out of five without one. ⚠️ **Check the survivor count before copying
      // either choice**, because nothing asserts it once a later chapter takes over the top of the
      // ladder.
      //
      // Deliberately **no healing, no drain and no shield anywhere on it**. Two things on this board
      // already make a party live longer than it can kill — a wall it cannot aim past and a board it
      // cannot debuff — and both are steps toward the ninety-second timeout that is scored as a
      // defeat. What keeps it resolving is that a reflect only ever shortens a fight and a bomb is
      // damage rather than delay.
      id: 'c9-s50',
      name: 'The Anvil Crowned',
      enemies: {
        front: [THE_ANVIL_CROWNED, OATHSTONE_BASTION],
        back: [GRUDGEPLATE_SMITH, QUENCHWRIGHT, COLDHEARTH_IRONSWORN],
      },
      level: 175,
    },
  ],
} as const;
