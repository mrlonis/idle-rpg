import {
  BARROW_SOVEREIGN,
  BARROWMIST_KEENER,
  BONECHAIN_WARDEN,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  COLOSSUS,
  DUSKFERN_SKIRMISHER,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HEADSMAN,
  HEARTROOT_TENDER,
  HOLLOWBARK_SENTRY,
  LONGBOUGH_MARKSMAN,
  MARCHWARD_PIKEMAN,
  MOONSONG_WEAVER,
  NIGHTCANOPY_SINGER,
  OATHBREAKER,
  RIMEPLATE,
  SENTINEL,
  SKYSHRIKE,
  THE_LONGSHADOW,
  THE_WITHERED_CROWN,
  THORNLING,
  THORNWEALD_WARDEN,
  TYRANT,
  UNMADE,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * Chapter 8 — The Sunless Weald.
 *
 * Fifty stages, enemy levels 125 to 150. It **opens at the level chapter 7 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Waking Barrows did not
 *
 * The barrows asked about *how* the party's damage arrives — a thorned wall charges for the swing,
 * a fuse punishes the slow kill, thorns on fodder make going wide expensive. Every one of those is
 * a question about the **shape** of a turn. This chapter asks about **where the damage lands**, and
 * it is aimed at the two things a party stops thinking about once it has a working line-up: that
 * its swings connect, and that its back rank is safe.
 *
 * | Band          | Stages | The lock it teaches                                          |
 * | ------------- | ------ | ------------------------------------------------------------ |
 * | The glancing  | 1–10   | the thing you aimed at is not reliably there                 |
 * | The long loose| 11–20  | your back rank was never the safe half                       |
 * | The rootbound | 21–30  | reaching past the wall buys spread, not a kill               |
 * | The drawn root| 31–40  | the one you commit to is pulled back into the whole          |
 * | The heartwood | 41–50  | all four at once, and the thing the weald grew around        |
 *
 * ⚠️ **One new status, and it is the first of milestone 21's three to be spent.** 21a came in under
 * the ceiling; this chapter does not, and the argument is band 3's rather than the budget's.
 * {@link ROOTBOUND} is a **partial, permanent** link — it shares only to other holders of the same
 * id, so a board can bind its back rank to itself and leave its wall out of it. No pair of shipped
 * parts says that: {@link CHAINBOND} is cast, lapses, and binds a whole side, which is a statement
 * about focus fire in general rather than about the bypass in particular. See
 * [`statuses.ts`](./statuses.ts) for the full argument and
 * [authoring](../../docs/authoring.md) for why a pair was tried first.
 *
 * The chapter's other four questions cost nothing new. **Evasion is a stat block** — `ModifiableStat`
 * is `atk`, `def` and `haste`, so `dodge` cannot be a status without a `core/` change this milestone
 * forbids, and it does not need to be. Three new skills ship, all of them existing parts aimed
 * somewhere they have never been aimed: {@link ROOTBOUND} applied by a turn, the first debuff at
 * `enemy-row-back`, and a link cast **reactively** where the game has only ever cast a heal.
 *
 * **Band 1 is the one worth reading twice, because its answer is a stat five characters already
 * carry.** `accuracy` has been in `characters.ts` since milestone 8e and has never once decided a
 * fight — Rin, Ysolde, Aelrindel, Cirien and Sylvara carry it and nothing on the ladder cared. A
 * wood of `dodge` is what makes owning it legible. `MIN_HIT_CHANCE` is what stops it being a wall:
 * a tenth of every swing lands whatever the pool says, which is the termination guard
 * `data/combat.ts` argues for and not a tuning number.
 *
 * ## Where the levels come from
 *
 * 125 to 150, half a level a stage. The chapter runs inside `legendary`, which caps at 200, so the
 * party reaches The Withered Crown fifty levels clear of it. The rung is thirty-two duplicate copies
 * of each of the five, eight more than chapter 7 asked for, and every one of them is bought with
 * time.
 *
 * ## ⚠️ The second correction to the margin rule, kept because the arithmetic outlived the rule
 *
 * This chapter closed at 396 against `mythic`'s cap of 340 — a **+56** deficit where chapter 7's was
 * +45 — and finding it corrected 21a's closed form a second time. **The correction is the enemy's own
 * growth curve, and that has not stopped being true of any fight in this game.** 21a derived "+23
 * levels a chapter" from `perLevel.common`, because that is what the *party* climbs on. An enemy
 * `ascended` block climbs on `perLevel.ascended` — 1.024 against 1.021 — and that gap compounds over
 * the **whole** level rather than over the chapter: `(1.024 / 1.021) ** 411` is ×3.34 where `** 305`
 * is ×2.45, so the enemy side gained about **fifteen levels' worth** of head start across one chapter
 * at that depth.
 *
 * ⚠️ **Keep that in view wherever an enemy block is fielded far from where it was measured** — the
 * two sides diverge with depth even when neither is retuned, which is a fact about the growth
 * constants and not about any level line. What is gone is only the rule it was correcting: nothing
 * closes past a cap now, and there is no margin to predict. See
 * [authoring](../../docs/authoring.md).
 *
 * ## ⚠️ It briefly closed the signature-item measurement gap, and the flattening reopened it
 *
 * `docs/signature-items.md` carried the gap from milestone 16: `mythic` caps at 340 and the hardest
 * authored stage was 225, so `data/signature.balance.ts` had to re-level the top encounter to
 * measure anything at all. The Bound Marches, the Sundered Vault and the Waking Barrows were each
 * expected to close it and none did; this chapter, closing at 396, finally did, and the probe
 * stopped re-levelling.
 *
 * ⚠️ **The flattened line reopened it and made it permanent.** The campaign now tops out at **200**
 * against `mythic`'s cap of 340, so no shipped stage reaches the rung a signature item unlocks at —
 * and unlike milestone 16's gap, no future chapter closes this one either, because the level line no
 * longer chases a rung's cap. `signature.balance.ts` re-levels its top encounter again, permanently.
 *
 * ⚠️ **That is a deliberate consequence, not a regression.** Signature items were moved out of the
 * campaign on purpose when the line was flattened: the campaign is a shorter on-ramp now and the
 * towers, the Descent and Expeditions carry the content past it. What it costs is that the probe
 * measures items against a re-levelled board rather than an authored one — so **a reach figure
 * recorded here is a statement about the item, not about any stage a player will meet.**
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the boss: **eight new, twenty-four returning**
 * — exactly the quarter milestone 21 asks of a chapter, measured over what the chapter *fields*
 * rather than over the shipped pool. The returning set is weighted toward the barrows the party has
 * just walked out of and the Elves the ladder has fielded sparingly since chapter 2, so the weald
 * reads as something growing over what came before rather than as a new cast.
 *
 * ⚠️ **One celestial appears, twice, and this comment used to say none did.** The Sundered Vault
 * records the argument: an Angel or a Demon taxes every mortal ×1.10 with no mortal → celestial row
 * to answer it, worth roughly nine levels of investment, and one chapter may carry that. With `dodge`
 * already taxing every swing here, a matchup tax on top is two unanswerable multipliers on one board
 * — so the rule this chapter actually follows is that **no celestial leads a board**, and the only
 * one fielded is The Unmade, anchoring `c8-s42` and `c8-s47` in the last band because it is the
 * heaviest block on the ladder and nothing else that heavy is mortal.
 *
 * ⚠️ **Corrected in 21c, and the correction is the same class 21b found in 21a's Cairn King note:
 * prose that was never true of the boards under it.** The claim about chapter 7 that stood here was
 * wrong in the same sentence — it said the barrows "used them sparingly", and chapter 7 fields a
 * celestial on twenty of its fifty boards. **The boards are swept and the prose is not**, so where
 * they disagree the prose is what moved. Chapter 9 makes the stronger claim and it is checked rather
 * than asserted: no celestial appears there at all.
 *
 * ⚠️ **The Cairn King does not appear**, and neither does any other chapter final.
 * {@link THE_WITHERED_CROWN} is the eighth body authored under that rule.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **At most one taunt source per board**, unchanged from chapter 7 and for the same reason:
 *    two taunters at a 45-tick status against a 60-tick cooldown leave the door shut about
 *    ninety-four percent of the time. Two blocks here can taunt — the Cairnbound Sentinel and the
 *    Riven Marchwarden — and no board fields both. ⚠️ **The Withered Crown is deliberately not among
 *    them**; see [`enemies.ts`](./enemies.ts) for why a boss that taunts is the easier boss.
 * 2. ⚠️ **Nothing that puts health back stands behind a taunt.** Sustain the party cannot aim at is
 *    a ninety-second clock and a timeout is scored as a **defeat**. That rules out the Thornweald
 *    Warden, the Wyrdroot Ancient, the Gravetide Herald and the Barrow Sovereign, all of which
 *    regrow or drain; each appears only on boards with no taunt, or in a front rank the party can
 *    always reach.
 * 3. ⚠️ **At most three bound bodies on a board, and never all five.** A link conserves damage, so it
 *    cannot stall a fight on its own — but it keeps the enemy's action economy intact for longer,
 *    and stacked on top of a `dodge` pool that is already lengthening every exchange, a fully bound
 *    board is the shape that walks into the ninety-second timer. The bound half is the back rank;
 *    the wall in front of it is not part of it, which is also what makes reaching past the wall the
 *    thing the band is about.
 */
export const CHAPTER_8 = {
  id: 'chapter-8',
  name: 'The Sunless Weald',
  stages: [
    // -----------------------------------------------------------------------------------
    // The glancing — stages 1 to 10, levels 125 to 130
    // -----------------------------------------------------------------------------------
    {
      // The seam, at the Barrows' own closing level: what followed the party out of the cairns,
      // with the first two weald bodies standing in it. The fight the party that took The Cairn
      // King already knows how to have — except that a quarter of its swings now find nothing.
      id: 'c8-s1',
      name: 'The Green Cairns',
      enemies: {
        front: [GRAVEWAKE_THRALL, HOLLOWBARK_SENTRY],
        back: [DUSKFERN_SKIRMISHER, BARROWMIST_KEENER],
      },
      level: 125,
    },
    {
      // The lock stated plainly. Two Skirmishers behind a bark wall: nothing here is dangerous and
      // everything here takes longer than it should, which is the whole of what `dodge` is.
      id: 'c8-s2',
      name: 'Duskfern',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [DUSKFERN_SKIRMISHER, BARROWMIST_KEENER],
      },
      level: 126,
    },
    {
      // ⚠️ A probe sample, and the first in the chapter. The Stalker anchors it — evasion on a body
      // that kills things, rather than on fodder that does not.
      id: 'c8-s3',
      name: 'The Glancing Wood',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [DUSKFERN_SKIRMISHER, BARROWMIST_KEENER, THORNLING],
      },
      level: 126,
    },
    {
      id: 'c8-s4',
      name: 'Thin Light',
      enemies: {
        front: [GRAVEWAKE_THRALL, DUSKFERN_SKIRMISHER],
        back: [GLADE_STALKER, BRAMBLEWALK_SCOUT, BARROWMIST_KEENER],
      },
      level: 127,
    },
    {
      id: 'c8-s5',
      name: 'The Bark Gate',
      enemies: {
        front: [HOLLOWBARK_SENTRY, RIMEPLATE],
        back: [DUSKFERN_SKIRMISHER, SKYSHRIKE],
      },
      level: 127,
    },
    {
      id: 'c8-s6',
      name: 'Where the Sun Stops',
      enemies: {
        front: [WEALDSHADOW_STALKER, DUSKFERN_SKIRMISHER],
        back: [BRAMBLEWALK_SCOUT, BARROWMIST_KEENER, THORNLING],
      },
      level: 128,
    },
    {
      // ⚠️ A probe sample. The chapter's first pair, and the one that decides whether a party's
      // answer to evasion is *enough* accuracy or merely some: the Singer takes a third of the gauge
      // off all five, so the swings being paid to `dodge` are coming out of fewer turns.
      id: 'c8-s7',
      name: 'Nightcanopy',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [NIGHTCANOPY_SINGER, DUSKFERN_SKIRMISHER, SKYSHRIKE],
      },
      level: 128,
    },
    {
      id: 'c8-s8',
      name: 'The Quiet Track',
      enemies: {
        front: [SENTINEL, DUSKFERN_SKIRMISHER],
        back: [NIGHTCANOPY_SINGER, BARROWMIST_KEENER],
      },
      level: 129,
    },
    {
      id: 'c8-s9',
      name: 'Fernhollow',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [MOONSONG_WEAVER, DUSKFERN_SKIRMISHER, SKYSHRIKE],
      },
      level: 129,
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **The same block stands on all four**,
      // at 324, 346, 367 and 389 — a recurring antagonist that gets harder because the ladder does,
      // rather than four one-shot stat blocks. Its opening turn binds the whole board, so every
      // mini-boss in this chapter becomes a third-band board whether or not one was authored that
      // way, exactly as the Gravewright's did for the Barrows.
      id: 'c8-s10',
      name: 'The Longshadow',
      enemies: {
        front: [THE_LONGSHADOW, HOLLOWBARK_SENTRY],
        back: [WEALDSHADOW_STALKER, DUSKFERN_SKIRMISHER, BARROWMIST_KEENER],
      },
      level: 130,
    },

    // -----------------------------------------------------------------------------------
    // The long loose — stages 11 to 20, levels 130 to 135
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **A band opener that is also a probe sample, which is the trap chapters 6 and 7 both fell
      // into.** Band openings want to be light and the stride does not care, so this is authored
      // heavy on purpose: five bodies, a legendary front rank, and the Marksman already in it. The
      // fix for a step backwards is weight, never +3 enemy levels — that would fight the level curve
      // for about thirteen percent and lose.
      id: 'c8-s11',
      name: 'The Long Loose',
      enemies: {
        front: [RIMEPLATE, WEALDSHADOW_STALKER],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER, DUSKFERN_SKIRMISHER],
      },
      level: 130,
    },
    {
      id: 'c8-s12',
      name: 'Arrowfall',
      enemies: {
        front: [HOLLOWBARK_SENTRY, GRAVEWAKE_THRALL],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER, SKYSHRIKE],
      },
      level: 131,
    },
    {
      id: 'c8-s13',
      name: 'Behind the Wall',
      enemies: {
        front: [SENTINEL, HOLLOWBARK_SENTRY],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER, WHISPERLEAF_ARCHER],
      },
      level: 131,
    },
    {
      id: 'c8-s14',
      name: 'The Marked Rank',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, DUSKFERN_SKIRMISHER],
        back: [LONGBOUGH_MARKSMAN, NIGHTCANOPY_SINGER],
      },
      level: 132,
    },
    {
      // ⚠️ A probe sample, and the band's question at full weight: the back rank is opened by the
      // Marksman and then reached by everything standing beside him. Neither half is new; the
      // sequence is.
      id: 'c8-s15',
      name: 'Nothing Is Behind',
      enemies: {
        front: [COLOSSUS, HOLLOWBARK_SENTRY],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER, SKYSHRIKE],
      },
      level: 132,
    },
    {
      id: 'c8-s16',
      name: 'Wealdward',
      enemies: {
        front: [WEALDSHADOW_STALKER, MARCHWARD_PIKEMAN],
        back: [LONGBOUGH_MARKSMAN, BARROWMIST_KEENER, BRAMBLEWALK_SCOUT],
      },
      level: 133,
    },
    {
      // Two Marksmen, so the party's back rank is opened twice a cycle against a cleanse that
      // reaches one ally at a time. The same shape the Heralds asked in the barrows, moved off the
      // member the party watches and onto the three it does not.
      id: 'c8-s17',
      name: 'Two Bows',
      enemies: {
        front: [RIMEPLATE, HOLLOWBARK_SENTRY],
        back: [LONGBOUGH_MARKSMAN, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 133,
    },
    {
      id: 'c8-s18',
      name: 'The Sunless Track',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, DUSKFERN_SKIRMISHER],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 134,
    },
    {
      // ⚠️ A probe sample. A taunt in front of the archers, which is the band's hardest form: the
      // party may only hit the wall, and the wall is not what is killing it.
      id: 'c8-s19',
      name: 'The Held Path',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, WEALDSHADOW_STALKER],
        back: [LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER, NIGHTCANOPY_SINGER],
      },
      level: 134,
    },
    {
      // Mini-boss. The lieutenant with the band's lock beside it, and no taunt anywhere on the
      // board — the Longshadow already decides where the party's damage goes by binding the board,
      // and stacking a taunt on top of that is a door held shut rather than a question.
      id: 'c8-s20',
      name: "The Longshadow's Volley",
      enemies: {
        front: [THE_LONGSHADOW, HOLLOWBARK_SENTRY],
        back: [LONGBOUGH_MARKSMAN, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 135,
    },

    // -----------------------------------------------------------------------------------
    // The rootbound — stages 21 to 30, levels 135 to 140
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is **not** a probe sample — the stride puts those on s11 and s31 in this
      // chapter — so this is free to be what a band opening wants to be: the lock taught small, with
      // two bound Creepers behind a wall and nothing else going on. Reach the back rank and a third
      // of the shot goes to the other one.
      id: 'c8-s21',
      name: 'The Rootbound',
      enemies: {
        front: [HOLLOWBARK_SENTRY, GRAVEWAKE_THRALL],
        back: [GLOAMVINE_CREEPER, GLOAMVINE_CREEPER, BARROWMIST_KEENER],
      },
      level: 135,
    },
    {
      id: 'c8-s22',
      name: 'Deeproot',
      enemies: {
        front: [RIMEPLATE, HOLLOWBARK_SENTRY],
        back: [GLOAMVINE_CREEPER, GLOAMVINE_CREEPER, WHISPERLEAF_ARCHER],
      },
      level: 136,
    },
    {
      // ⚠️ A probe sample. The bind at legendary weight: the Tenders are bound to the Creeper, so the
      // bodies undoing the party's focus fire are themselves the things focus fire cannot remove.
      //
      // ⚠️ **The band-opener trap in its third form, and it took two passes to clear.** Authored with
      // a common wall and one Tender it measured 1,859 against `c8-s19`'s 2,588 — a step backwards
      // inside the probe's 0.85 tolerance, with the level eight higher. A second Tender and a
      // legendary wall took it to 2,092 and it *still* failed at 0.81.
      //
      // ⚠️ **What that measured is the gap between the two bands' locks, and it is worth knowing:**
      // `c8-s19` and this board are the same shape — two legendaries in front, two legendaries and a
      // common behind — and the taunt-in-front-of-archers pair is worth about a quarter more than the
      // bound back rank. A bind costs the party its route; a taunt costs it its targets, and the
      // probe reads the second as heavier. Fixed with **weight** on the third pass, never with the
      // level dial, which would have fought the level curve for about thirteen percent.
      id: 'c8-s23',
      name: 'One Wood, Many Names',
      enemies: {
        front: [HEADSMAN, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, GLOAMVINE_CREEPER],
      },
      level: 136,
    },
    {
      id: 'c8-s24',
      name: 'The Shared Wound',
      enemies: {
        front: [CAIRNWARD_HUSK, DUSKFERN_SKIRMISHER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 137,
    },
    {
      id: 'c8-s25',
      name: 'Bramble and Root',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, WHISPERLEAF_ARCHER],
      },
      level: 137,
    },
    {
      id: 'c8-s26',
      name: 'The Grafted Wall',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, HOLLOWBARK_SENTRY],
        back: [GLOAMVINE_CREEPER, GLOAMVINE_CREEPER, WHISPERLEAF_ARCHER],
      },
      level: 138,
    },
    {
      // ⚠️ A probe sample, and the band's two answers refused at once: reach is spread and going wide
      // is answered, because the Ravener in front is thorned and the wood behind it is bound.
      id: 'c8-s27',
      name: 'Thorn and Root',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, HEARTROOT_TENDER, GLOAMVINE_CREEPER],
      },
      level: 138,
    },
    {
      id: 'c8-s28',
      name: 'Wyrdroot',
      enemies: {
        front: [WYRDROOT_ANCIENT, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, WHISPERLEAF_ARCHER],
      },
      level: 139,
    },
    {
      id: 'c8-s29',
      name: 'The Bound Grove',
      enemies: {
        front: [SENTINEL, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 139,
    },
    {
      // Mini-boss. The lieutenant on a board that is bound before it takes its turn, so Rootwake is
      // spent on the two bodies that were not — and after that nothing on the field can be taken out
      // of it alone.
      id: 'c8-s30',
      name: "The Longshadow's Wood",
      enemies: {
        front: [THE_LONGSHADOW, HOLLOWBARK_SENTRY],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, GLOAMVINE_CREEPER],
      },
      level: 140,
    },

    // -----------------------------------------------------------------------------------
    // The drawn root — stages 31 to 40, levels 140 to 145
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **The second band opener on a probe sample, and it is heavy for the reason `c8-s11` is.**
      // The Wyrdroot anchors it rather than +3 enemy levels doing the work: composition moves
      // difficulty by far more than a level does. What arrives here is the Tender's reactive bind —
      // the party commits to a target and the wood pulls it back into the whole.
      id: 'c8-s31',
      name: 'Drawn into the Root',
      enemies: {
        front: [WYRDROOT_ANCIENT, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 140,
    },
    {
      id: 'c8-s32',
      name: 'The Refused Kill',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [HEARTROOT_TENDER, HEARTROOT_TENDER, WHISPERLEAF_ARCHER],
      },
      level: 141,
    },
    {
      id: 'c8-s33',
      name: 'Heartroot',
      enemies: {
        front: [COLOSSUS, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, NIGHTCANOPY_SINGER, WHISPERLEAF_ARCHER],
      },
      level: 141,
    },
    {
      // The Keeper beside the Tender. Everything the party spends opening a body is taken back off
      // whichever one carries the most of it, and whatever damage does land is pulled sideways —
      // the two halves of "commit to a target" refused separately.
      id: 'c8-s34',
      name: 'Nothing Finished',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [HEARTROOT_TENDER, GRAVEMOURN_KEEPER, LONGBOUGH_MARKSMAN],
      },
      level: 142,
    },
    {
      // ⚠️ A probe sample. A taunt in front of a bound back rank: the party may only hit the wall,
      // and the wall is the one thing on the board the roots are **not** attached to.
      id: 'c8-s35',
      name: 'The Warden and the Wood',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 142,
    },
    {
      id: 'c8-s36',
      name: 'Chain and Root',
      enemies: {
        front: [RIMEPLATE, GLOAMVINE_CREEPER],
        back: [BONECHAIN_WARDEN, HEARTROOT_TENDER, WHISPERLEAF_ARCHER],
      },
      level: 143,
    },
    {
      id: 'c8-s37',
      name: 'The Long Patience',
      enemies: {
        front: [HEADSMAN, HOLLOWBARK_SENTRY],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, NIGHTCANOPY_SINGER],
      },
      level: 143,
    },
    {
      // The Thornweald Warden, in a front rank the party can always reach — the regeneration lock
      // and the bound board on one field, with nothing between the party and the thing regrowing.
      // Behind a taunt this board would be the ninety-second clock rather than a fight.
      id: 'c8-s38',
      name: 'What Grows Back',
      enemies: {
        front: [THORNWEALD_WARDEN, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, WHISPERLEAF_ARCHER],
      },
      level: 144,
    },
    {
      // ⚠️ A probe sample, and the last board before the lieutenant's fourth appearance.
      id: 'c8-s39',
      name: 'The Last Grove',
      enemies: {
        front: [TYRANT, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 144,
    },
    {
      // Mini-boss, and the last time the lieutenant is met. Every question the chapter has asked
      // except the heartwood's own: the board is bound before the first tick, the back rank is
      // opened and then reached, and whatever the party commits to is pulled back into the whole.
      id: 'c8-s40',
      name: 'The Longshadow Rooted',
      enemies: {
        front: [THE_LONGSHADOW, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, GLOAMVINE_CREEPER],
      },
      level: 145,
    },

    // -----------------------------------------------------------------------------------
    // The heartwood — stages 41 to 50, levels 145 to 150
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is not a probe sample, so it is allowed to be the quiet one: the weald's
      // own bodies, at the weald's own weight, with the barrows finally left behind.
      id: 'c8-s41',
      name: 'The Heartwood Road',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, NIGHTCANOPY_SINGER],
      },
      level: 145,
    },
    {
      id: 'c8-s42',
      name: 'Underbough',
      enemies: {
        front: [UNMADE, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 146,
    },
    {
      // ⚠️ A probe sample. The Ancient in front and the bound wood behind it: a body that regrows
      // faster than the party can spread its damage, which is the pair the chapter has been building
      // toward. Reachable, and nothing on the board taunts.
      id: 'c8-s43',
      name: 'The Elder Root',
      enemies: {
        front: [WYRDROOT_ANCIENT, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, LONGBOUGH_MARKSMAN],
      },
      level: 146,
    },
    {
      id: 'c8-s44',
      name: 'The Old Grave',
      enemies: {
        front: [BARROW_SOVEREIGN, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, WHISPERLEAF_ARCHER],
      },
      level: 147,
    },
    {
      id: 'c8-s45',
      name: 'Bound and Blind',
      enemies: {
        front: [OATHBREAKER, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, GLOAMVINE_CREEPER, NIGHTCANOPY_SINGER],
      },
      level: 147,
    },
    {
      id: 'c8-s46',
      name: 'The Tithe in the Trees',
      enemies: {
        front: [TYRANT, HOLLOWBARK_SENTRY],
        back: [GRAVETIDE_HERALD, HEARTROOT_TENDER, LONGBOUGH_MARKSMAN],
      },
      level: 148,
    },
    {
      // ⚠️ A probe sample, and the last one before the final. The Unmade anchoring a board that is
      // bound, evasive and already reaching the party's back rank.
      id: 'c8-s47',
      name: 'The Way to the Crown',
      enemies: {
        front: [UNMADE, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, GLOAMVINE_CREEPER],
      },
      level: 148,
    },
    {
      id: 'c8-s48',
      name: 'Withered Bough',
      enemies: {
        front: [WYRDROOT_ANCIENT, DUSKFERN_SKIRMISHER],
        back: [HEARTROOT_TENDER, HEARTROOT_TENDER, LONGBOUGH_MARKSMAN],
      },
      level: 149,
    },
    {
      id: 'c8-s49',
      name: 'The Last Clearing',
      enemies: {
        front: [COLOSSUS, WEALDSHADOW_STALKER],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, NIGHTCANOPY_SINGER],
      },
      level: 149,
    },
    {
      // ⚠️ The chapter boss, and the fourth body on the ladder standing on exactly one stage. All
      // four of the chapter's questions are on it: the Crown is bound from the first tick and
      // Rootwake binds everything else to it, its `dodge` pool means the party's answer has to be
      // aimed as well as large, the Long Loose opens the half of the party its Marksman is already
      // reaching, and Headsman's Arc takes whoever the spread has quietly been working on.
      //
      // ⚠️ **The Sentinel wears the taunt rather than the Crown**, which is 21a's finding and not
      // this chapter's to re-derive: a boss that draws every attack onto itself aims them at the
      // body the party was going to focus anyway and spends its own turns dealing nothing.
      //
      // **The Longshadow does not stand here, and that is this chapter's choice rather than a rule.**
      // What the rule forbids is a lieutenant being *the* fight — a chapter's last encounter is the
      // one a player remembers, and a stat block already beaten four times is a stage number. As
      // support it is permitted, and `c7-s50` fields the Gravewright for exactly that reason. This
      // board does not need it: it measures a real fight without one, where chapter 7's does not.
      // ⚠️ **Check the survivor count before copying either choice**, because nothing asserts it
      // once a later chapter takes over the top of the ladder.
      //
      // Deliberately **no healing, no drain and no shield anywhere on it**. Three things on this
      // board already make a party live longer than it can kill — a bound field, a dodge pool and a
      // wall it cannot aim past — and every one of them is a step toward the ninety-second timeout
      // that is scored as a defeat. What keeps it resolving is that a link conserves damage and
      // nothing here puts health back.
      id: 'c8-s50',
      name: 'The Withered Crown',
      enemies: {
        front: [THE_WITHERED_CROWN, CAIRNBOUND_SENTINEL],
        back: [HEARTROOT_TENDER, LONGBOUGH_MARKSMAN, WEALDSHADOW_STALKER],
      },
      level: 150,
    },
  ],
} as const;
