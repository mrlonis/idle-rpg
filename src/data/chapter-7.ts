import {
  ANTIPHON_ARCHON,
  BARROW_SOVEREIGN,
  BARROWMIST_KEENER,
  BONECHAIN_WARDEN,
  BRAMBLEHIDE_RAVENER,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  COLOSSUS,
  COVENANT_BREAKER,
  FREE_BLADE,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  MARCHWARD_PIKEMAN,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  REVENANT,
  RIFTBORN_HARROWER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  SEALWARD_CUSTODIAN,
  SEPULCHRE_HOUND,
  SHADE,
  SENTINEL,
  SKYSHRIKE,
  THE_CAIRN_KING,
  THE_GRAVEWRIGHT,
  TYRANT,
  UNMADE,
  VAULTBOUND_GAOLER,
  WISP,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * Chapter 7 — The Waking Barrows.
 *
 * Fifty stages, enemy levels 225 to 305. It **opens at the level chapter 6 closed on**, which is the
 * rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Sundered Vault did not
 *
 * The Vault asked what happens when the party's damage is *taxed* — a celestial board deals ×1.10 to
 * every mortal with nothing coming back, and no composition answers it. This chapter asks something
 * narrower and, for the first time, aimed at the party's **habits** rather than its stat block:
 * every board here has an opinion about *how* the damage arrives.
 *
 * ⚠️ **No new status, no new effect kind, no new target kind, and nothing in `ui/` changed.**
 * Milestone 21 licenses up to three new statuses across its four chapters and says plainly that the
 * budget is a ceiling rather than a quota. This is the first of the four and it spends none of it —
 * see [`enemies.ts`](./enemies.ts) for the five locks and what each is built out of. Three new
 * skills ship, and all three are pieces of the existing vocabulary aimed somewhere they have never
 * been aimed: a bomb at `enemy-highest`, the first `ally-afflicted` turn on the enemy side, and
 * {@link THORNMAIL} applied by a skill rather than authored as an `opening`.
 *
 * | Band          | Stages | The lock it teaches                                        |
 * | ------------- | ------ | ---------------------------------------------------------- |
 * | The risen     | 1–10   | the wall you must hit answers every swing                  |
 * | The tithe     | 11–20  | the fuse lands on the body you never cleanse               |
 * | The bonefield | 21–30  | going wide is answered once per body you reach             |
 * | The bound     | 31–40  | the wall you must hit spreads your damage sideways         |
 * | The crown     | 41–50  | all four at once, and the thing the barrows were built for |
 *
 * **The third band is the one that inverts an answer the ladder spent two hundred stages teaching.**
 * A row attack into three thorned bodies is answered three times, so the reply a crowded board has
 * always wanted is the expensive one here and single-target focus is the cheap one. That question
 * needed no new mechanic; it needed thorns on something nobody treats carefully.
 *
 * ## Where the levels come from, and the rule they corrected
 *
 * 225 to 305, a little over one and a half levels a stage. ⚠️ **Milestone 21's brief said 285, and
 * authoring it there is what proved the brief's margin rule wrong** — this is the one place chapter 7
 * departs from the roadmap it was written against, and the departure is arithmetic rather than taste.
 *
 * The rule as written: a chapter must close **+25 past the cap of the rung it asks for**, because a
 * rung is worth ×1.6, the enemy side has no rungs, and twenty-three levels is what ×1.6 costs at
 * `perLevel.common`. That is correct for the chapter where a cap is *first* out-climbed and wrong
 * for every chapter after it. **A constant margin cancels.** Each chapter hands the party a fresh
 * rung (×1.6) on top of the levels it climbs, while the content climbs only the levels — so if the
 * deficit stays at 25, the rung is free and the gap compounds. Measured as party power ÷ the
 * difficulty probe's threshold at each chapter's final:
 *
 * | Chapter              | Party                   | Ratio    |
 * | -------------------- | ----------------------- | -------- |
 * | 5                    | `elite-plus` at 140     | 1.08     |
 * | 6                    | `legendary` at 200      | 1.44     |
 * | 7 at 285, as briefed | `legendary-plus` at 260 | **2.08** |
 * | 7 at 305, as shipped | `legendary-plus` at 260 | ~1.16    |
 *
 * At 285 every stage in the chapter was a walkover for the party it was tuned for — the reference
 * five finished The Cairn King with all of them alive in seven seconds — and no board fixes that: a
 * board heavy enough to cost that party a member needed **three** ascended bodies and measured 1.86×
 * the stage before it, which is a cliff and the shape milestone 15c warns makes six towers fail at
 * once. ⚠️ **The margin has to grow by about twenty-three levels a chapter** — +45 here, and the
 * roadmap's remaining chapters re-derived to close at ~411, ~514 and ~617 rather than 365, 445 and
 * 525. See [milestones](../../docs/milestones.md).
 *
 * So the top is **forty-five levels past the cap of the rung the chapter asks for**: `legendary-plus`
 * caps at 260, and a player who buys the ascension and levels it out still arrives at The Cairn King
 * forty-five levels short, making the difference up in composition, matchup and gear.
 *
 * Still no lucky pull anywhere on the ladder: the rung is thirty-eight duplicate copies of each of
 * the five, six more than chapter 6 asked for, and every one of them is bought with time.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the boss: **eight new, twenty-four returning**
 * — exactly the quarter milestone 21 asks of a chapter, measured over what the chapter *fields*
 * rather than over the shipped pool. The returning set is weighted toward the Vault's own wreckage
 * and the ladder's undead, so a player arriving here recognises most of the board and meets the
 * barrows' bodies as the thing that changed.
 *
 * ⚠️ **Celestials are used sparingly and never lead a board**, which is the Vault's own argument
 * turned down rather than repeated: an Angel or a Demon taxes every mortal ×1.10 with no mortal →
 * celestial row to answer it, worth roughly nine levels of investment, and one chapter may carry
 * that. Two in a row may not.
 *
 * ⚠️ **The Hollow Seraph does not appear**, and neither does The Chainsworn. Each stands on its own
 * chapter's last stage and nowhere else; {@link THE_CAIRN_KING} is the seventh body authored under
 * that rule.
 *
 * ## Two authoring rules this chapter runs on, both of them safety rather than taste
 *
 * 1. ⚠️ **At most one taunt source per board.** Two taunters at a 45-tick status against a 60-tick
 *    cooldown leave the door shut about ninety-four percent of the time, which is a single-target
 *    party locked out of the back rank for a whole fight rather than handed a window — the failure
 *    the duty-cycle rule in `data/skills.spec.ts` exists to prevent. Four blocks here can taunt —
 *    the Cairnbound Sentinel, the Oathshield Vanguard, the Riven Marchwarden and the Sealward
 *    Custodian — and no board fields two of them. ⚠️ **The Cairn King is deliberately not among
 *    them**; see [`enemies.ts`](./enemies.ts) for why a boss that taunts is the easier boss.
 * 2. ⚠️ **Nothing that puts health back stands behind a taunt.** Sustain the party cannot aim at is
 *    a ninety-second clock and a timeout is scored as a **defeat** — the shape chapter 3 shipped
 *    once and every chapter since has refused. In practice that rules out the Gravetide Herald, the
 *    Fen Shade, the Ash Revenant and the Barrow Sovereign, all of which drain; each appears only on
 *    boards with no taunt on them, or in a front rank the party can always reach.
 */
export const CHAPTER_7 = {
  id: 'chapter-7',
  name: 'The Waking Barrows',
  stages: [
    // -----------------------------------------------------------------------------------
    // The risen — stages 1 to 10, levels 225 to 241
    // -----------------------------------------------------------------------------------
    {
      // The seam. A board built out of what followed the party out of the Vault, at the Vault's own
      // closing level, with the first two barrow bodies standing in it. The fight the party that
      // took the Hollow Seraph already knows how to have — and the ground it is standing on is not.
      id: 'c7-s1',
      name: 'The Barrow Road',
      enemies: {
        front: [VAULTBOUND_GAOLER, GRAVEWAKE_THRALL],
        back: [BARROWMIST_KEENER, SKYSHRIKE],
      },
      level: 225,
    },
    {
      // The chapter's first lock, stated plainly. Six chapters have taught that a taunt is answered
      // by killing the thing that cast it; this one is wearing spines, so the answer now costs a
      // quarter of itself on the way in.
      id: 'c7-s2',
      name: 'First Cairn',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, GRAVEWAKE_THRALL],
        back: [BARROWMIST_KEENER, SKYSHRIKE],
      },
      level: 227,
    },
    {
      id: 'c7-s3',
      name: 'Wake of Bone',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, GRAVEWAKE_THRALL],
        back: [BARROWMIST_KEENER, SEPULCHRE_HOUND, ANTIPHON_ARCHON],
      },
      level: 229,
    },
    {
      id: 'c7-s4',
      name: 'Hollow Ground',
      enemies: {
        front: [GRAVEWAKE_THRALL, VAULTBOUND_GAOLER],
        back: [SEPULCHRE_HOUND, REVENANT, WISP],
      },
      level: 230,
    },
    {
      id: 'c7-s5',
      name: 'The Sworn Cairn',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, SENTINEL],
        back: [ANTIPHON_ARCHON, BARROWMIST_KEENER, SKYSHRIKE],
      },
      level: 232,
    },
    {
      id: 'c7-s6',
      name: 'Barrowmist',
      enemies: {
        front: [FREE_BLADE, SEPULCHRE_HOUND],
        back: [BARROWMIST_KEENER, HAG],
      },
      level: 234,
    },
    {
      id: 'c7-s7',
      name: 'The Toothed Gate',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, GRAVEWAKE_THRALL],
        back: [HAG, BARROWMIST_KEENER],
      },
      level: 235,
    },
    {
      id: 'c7-s8',
      name: 'Sunken Barrow',
      enemies: {
        front: [RIMEPLATE, GRAVEWAKE_THRALL],
        back: [SHADE, SKYSHRIKE],
      },
      level: 237,
    },
    {
      id: 'c7-s9',
      name: 'Bonewake',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, RIMEPLATE],
        back: [ANTIPHON_ARCHON, HAG, SKYSHRIKE],
      },
      level: 239,
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **The same block stands on all four**,
      // at 237, 249, 261 and 273 — a recurring antagonist that gets harder because the ladder does,
      // rather than four one-shot stat blocks each seen once. Its opening turn hands the whole board
      // thorns, so every mini-boss in this chapter becomes a third-band board whether or not one was
      // authored that way.
      id: 'c7-s10',
      name: 'The Gravewright',
      enemies: {
        front: [THE_GRAVEWRIGHT, CAIRNBOUND_SENTINEL],
        back: [BARROWMIST_KEENER, SEPULCHRE_HOUND, SKYSHRIKE],
      },
      level: 241,
    },

    // -----------------------------------------------------------------------------------
    // The tithe — stages 11 to 20, levels 242 to 257
    // -----------------------------------------------------------------------------------
    {
      // The Herald arrives, and it counts the party rather than looking at it. Every payload the
      // ladder has planted so far landed on a body the party expected to lose; this one lands on the
      // biggest thing standing, which is the member nobody points a cleanse at.
      id: 'c7-s11',
      name: 'The Tithe Road',
      enemies: {
        front: [GRAVEWAKE_THRALL, VAULTBOUND_GAOLER],
        back: [GRAVETIDE_HERALD, BARROWMIST_KEENER],
      },
      level: 242,
    },
    {
      id: 'c7-s12',
      name: 'Gravetide',
      enemies: {
        front: [SENTINEL, GRAVEWAKE_THRALL],
        back: [GRAVETIDE_HERALD, SKYSHRIKE, BARROWMIST_KEENER],
      },
      level: 244,
    },
    {
      // ⚠️ A probe sample, and the first draft put a common in the front rank here — which measured
      // as a step *backwards* from `c7-s9` (184 against 226) even though the level had climbed five.
      // Two legendary walls is the fix, made with weight rather than with the level dial.
      id: 'c7-s13',
      name: 'The Counting',
      enemies: {
        front: [RIMEPLATE, SENTINEL],
        back: [GRAVETIDE_HERALD, HAG, SKYSHRIKE],
      },
      level: 246,
    },
    {
      id: 'c7-s14',
      name: 'Toll of Bone',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, GRAVEWAKE_THRALL],
        back: [GRAVETIDE_HERALD, SKYSHRIKE],
      },
      level: 247,
    },
    {
      id: 'c7-s15',
      name: 'The Marked Wall',
      enemies: {
        front: [COLOSSUS, MARCHWARD_PIKEMAN],
        back: [GRAVETIDE_HERALD, ANTIPHON_ARCHON],
      },
      level: 249,
    },
    {
      id: 'c7-s16',
      name: 'Barrowdebt',
      enemies: {
        front: [GRAVEWAKE_THRALL, SEPULCHRE_HOUND],
        back: [GRAVETIDE_HERALD, HEADSMAN, BARROWMIST_KEENER],
      },
      level: 251,
    },
    {
      // Two Heralds, so two brands are running at once against a cleanse that reaches one ally at a
      // time. The same shape the Chainsworn's Doomknell asks at five, moved onto the two members the
      // party would least like to spend a turn on.
      id: 'c7-s17',
      name: 'Two Debts',
      enemies: {
        front: [COLOSSUS, RIMEPLATE],
        back: [GRAVETIDE_HERALD, GRAVETIDE_HERALD, ANTIPHON_ARCHON],
      },
      level: 252,
    },
    {
      id: 'c7-s18',
      name: 'The Reckoned',
      enemies: {
        front: [SENTINEL, GRAVEWAKE_THRALL],
        back: [GRAVETIDE_HERALD, SKYSHRIKE],
      },
      level: 254,
    },
    {
      id: 'c7-s19',
      name: 'Cairn and Debt',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [ANTIPHON_ARCHON, HAG, BARROWMIST_KEENER],
      },
      level: 256,
    },
    {
      // Mini-boss. The band's lock at full size and the one board where the tithe is collected
      // twice a cycle. No taunt on it, deliberately — the Heralds drain, and a drain the party
      // cannot aim at is the ninety-second clock rather than a difficulty.
      id: 'c7-s20',
      name: "The Gravewright's Toll",
      enemies: {
        front: [THE_GRAVEWRIGHT, COLOSSUS],
        back: [GRAVETIDE_HERALD, GRAVETIDE_HERALD, SKYSHRIKE],
      },
      level: 257,
    },

    // -----------------------------------------------------------------------------------
    // The bonefield — stages 21 to 30, levels 259 to 273
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **A band opener that is also a difficulty-probe sample, which is where the Sundered Vault
      // went wrong — and knowing that was not enough to get it right first time.** Band openings
      // want to be light and the stride does not care. This was authored deliberately heavy at five
      // bodies with a legendary front rank, and it *still* measured 212 after `c7-s17`'s 313, well
      // inside the probe's 0.85 tolerance: thorns on fodder is a cheap question, because a Husk is
      // a common that dies before it charges much. **What a board asks and what it weighs are
      // different numbers, and the probe only reads the second.** Fixed with an ascended anchor
      // rather than +3 levels, which would have fought the level curve for about thirteen percent.
      id: 'c7-s21',
      name: 'The Bonefield',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, WYRDROOT_ANCIENT],
        back: [CAIRNWARD_HUSK, CAIRNWARD_HUSK, ANTIPHON_ARCHON],
      },
      level: 259,
    },
    {
      id: 'c7-s22',
      name: 'Cairnrows',
      enemies: {
        front: [OATHSHIELD_VANGUARD, CAIRNWARD_HUSK],
        back: [BARROWMIST_KEENER, SEPULCHRE_HOUND, SKYSHRIKE],
      },
      level: 261,
    },
    {
      id: 'c7-s23',
      name: 'The Thorned Ground',
      enemies: {
        front: [CAIRNWARD_HUSK, GRAVEWAKE_THRALL],
        back: [CAIRNWARD_HUSK, HAG, BARROWMIST_KEENER],
      },
      level: 262,
    },
    {
      id: 'c7-s24',
      name: 'Wide and Costly',
      enemies: {
        front: [CAIRNWARD_HUSK, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, GRAVETIDE_HERALD, ANTIPHON_ARCHON],
      },
      level: 264,
    },
    {
      id: 'c7-s25',
      name: 'The Bramble Cairn',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, GRAVETIDE_HERALD, SKYSHRIKE],
      },
      level: 266,
    },
    {
      id: 'c7-s26',
      name: 'Chaffwake',
      enemies: {
        front: [SEALWARD_CUSTODIAN, SEPULCHRE_HOUND],
        back: [CAIRNWARD_HUSK, CAIRNWARD_HUSK, BARROWMIST_KEENER],
      },
      level: 267,
    },
    {
      id: 'c7-s27',
      name: 'The Rimeward Cairn',
      enemies: {
        front: [RIMEPLATE, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, HAG, GRAVETIDE_HERALD],
      },
      level: 269,
    },
    {
      id: 'c7-s28',
      name: 'Bramblewake',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, BARROWMIST_KEENER],
      },
      level: 271,
    },
    {
      id: 'c7-s29',
      name: 'The Sable Field',
      enemies: {
        front: [WYRDROOT_ANCIENT, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, GRAVETIDE_HERALD, ANTIPHON_ARCHON],
      },
      level: 272,
    },
    {
      // Mini-boss. The lieutenant on a board that is already thorned before it takes its turn, so
      // Wake the Bone is spent on the three bodies that were not — and clearing any of them costs
      // whatever cleared it.
      id: 'c7-s30',
      name: "The Gravewright's Field",
      enemies: {
        front: [THE_GRAVEWRIGHT, CAIRNWARD_HUSK],
        back: [CAIRNWARD_HUSK, CAIRNWARD_HUSK, GRAVETIDE_HERALD],
      },
      level: 273,
    },

    // -----------------------------------------------------------------------------------
    // The bound — stages 31 to 40, levels 275 to 289
    // -----------------------------------------------------------------------------------
    {
      // The Warden arrives, and the band's pairing is a board rather than a body: the taunt says the
      // party may only hit the wall, and the link says two fifths of every blow on the wall is spread
      // across everything else standing. The party is aimed at one thing and cannot concentrate on
      // it. It resolves because a link conserves damage — what it costs is the *route*, not the
      // progress.
      id: 'c7-s31',
      name: 'The Chained Barrow',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, GRAVEWAKE_THRALL],
        back: [BONECHAIN_WARDEN, BARROWMIST_KEENER],
      },
      level: 275,
    },
    {
      id: 'c7-s32',
      name: 'Bone to Bone',
      enemies: {
        front: [CAIRNWARD_HUSK, GRAVEWAKE_THRALL],
        back: [BONECHAIN_WARDEN, RIFTBORN_HARROWER, BARROWMIST_KEENER],
      },
      level: 277,
    },
    {
      id: 'c7-s33',
      name: "The Warden's Chain",
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [BONECHAIN_WARDEN, ANTIPHON_ARCHON, BARROWMIST_KEENER],
      },
      level: 278,
    },
    {
      // The Keeper beside the chain. Everything the party spends on opening the wall is taken back
      // off whichever body carries the most of it, so the setup that made the last ten stages
      // survivable is the exact thing this board is built to refuse.
      id: 'c7-s34',
      name: 'Nothing Taken Alone',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER],
      },
      level: 280,
    },
    {
      id: 'c7-s35',
      name: 'The Unmourned',
      enemies: {
        front: [CAIRNWARD_HUSK, GRAVEWAKE_THRALL],
        back: [GRAVEMOURN_KEEPER, GRAVETIDE_HERALD, BARROWMIST_KEENER],
      },
      level: 282,
    },
    {
      id: 'c7-s36',
      name: 'Chain and Silence',
      enemies: {
        front: [SENTINEL, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, SKYSHRIKE],
      },
      level: 283,
    },
    {
      id: 'c7-s37',
      name: 'The Bound Ground',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, WYRDROOT_ANCIENT],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 285,
    },
    {
      id: 'c7-s38',
      name: 'Riven Chain',
      enemies: {
        front: [RIVEN_MARCHWARDEN, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, BARROWMIST_KEENER],
      },
      level: 287,
    },
    {
      id: 'c7-s39',
      name: 'The Last Cairn Before',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COVENANT_BREAKER],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 288,
    },
    {
      // Mini-boss, and the last time the lieutenant is met. Every question the chapter has asked
      // except the crown's own: a thorned wall that must be hit, a board bound so nothing comes off
      // it alone, and the setup for either taken back on the Keeper's turn.
      id: 'c7-s40',
      name: 'The Gravewright Bound',
      enemies: {
        front: [THE_GRAVEWRIGHT, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 289,
    },

    // -----------------------------------------------------------------------------------
    // The crown — stages 41 to 50, levels 291 to 305
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **The second band opener on a probe sample, and it is heavy for the same reason `c7-s21`
      // is.** The Unmade anchors it rather than +3 enemy levels doing the work: composition moves
      // difficulty by far more than a level does, and fixing a step backwards with the level dial
      // fights a curve worth about thirteen percent.
      id: 'c7-s41',
      name: "The King's Road",
      enemies: {
        front: [UNMADE, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 291,
    },
    {
      id: 'c7-s42',
      name: 'Barrowcrown',
      enemies: {
        front: [COLOSSUS, CAIRNWARD_HUSK],
        back: [GRAVETIDE_HERALD, BONECHAIN_WARDEN, BARROWMIST_KEENER],
      },
      level: 293,
    },
    {
      id: 'c7-s43',
      name: "The Sovereign's Barrow",
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, BARROWMIST_KEENER],
      },
      level: 294,
    },
    {
      id: 'c7-s44',
      name: 'Hollow Crown',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, TYRANT],
        back: [BONECHAIN_WARDEN, ANTIPHON_ARCHON, BARROWMIST_KEENER],
      },
      level: 296,
    },
    {
      id: 'c7-s45',
      name: 'The Unmade Cairn',
      enemies: {
        front: [UNMADE, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, GRAVETIDE_HERALD],
      },
      level: 298,
    },
    {
      id: 'c7-s46',
      name: "Oathbreaker's Barrow",
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 299,
    },
    {
      id: 'c7-s47',
      name: 'The Wyrdroot Crown',
      enemies: {
        front: [WYRDROOT_ANCIENT, CAIRNWARD_HUSK],
        back: [GRAVETIDE_HERALD, BONECHAIN_WARDEN, BARROWMIST_KEENER],
      },
      level: 301,
    },
    {
      id: 'c7-s48',
      name: "The Tyrant's Cairn",
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, ANTIPHON_ARCHON],
      },
      level: 303,
    },
    {
      id: 'c7-s49',
      name: 'The Crown Approach',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNWARD_HUSK],
        back: [BONECHAIN_WARDEN, GRAVEMOURN_KEEPER, GRAVETIDE_HERALD],
      },
      level: 304,
    },
    {
      // ⚠️ The chapter boss, and the third body on the ladder standing on exactly one stage. All
      // five of the chapter's questions are on it: the King is thorned from the first tick and Wake
      // the Bone hands the spines to everything else, the Sentinel in front decides what the party
      // is allowed to hit, the tithe lands on whatever survives best, the Warden's chain stops any
      // of it being removed alone, and the Keeper takes back the setup for all of it.
      //
      // ⚠️ **The Sentinel wears the taunt rather than the King, and the first draft had it the other
      // way round.** A boss that taunts itself is the fight the party already wanted — it points
      // every attack at the body the party was going to focus anyway, and it spends the boss's own
      // turns on something that deals nothing. It measured 738 against `c7-s49`'s 878, a chapter
      // *final* asking less than the stage before it, and `INVESTED` finished it with all five alive.
      // The Hollow Seraph's shape is the right one: the wall in front is what stops the party
      // choosing to answer the boss first, and the boss spends its turns killing.
      //
      // ⚠️ **The Gravewright stands here too, and this comment said the opposite for a whole
      // milestone.** It read "the Gravewright is deliberately absent — it has been the fight four
      // times already", which is a good argument about a body being *the* fight and a bad one about
      // it being on the board at all. The lieutenant's last stand behind the thing it has been
      // raising is the shape the chapter wants, and what the rule actually protects is that the
      // **headline** body is new: the King stands on one stage and nowhere else.
      //
      // ⚠️ **Measurement is what settled it rather than taste.** Drop the Gravewright and the probe
      // reads 1,484 against `c7-s49`'s 1,404 — a chapter final 6% harder than the stage before it —
      // and `BARROWED`, the party this chapter is tuned for, finishes it with **all five alive**.
      // That is the identical defect rejected two paragraphs above. While chapter 7 was the top of
      // the ladder, `chapters.balance.ts`'s `meanSurvivors < 5` read this stage, so the four-body
      // board could not have shipped green. ⚠️ **It would pass silently now** — chapter 8 moved that
      // assertion onto `c8-s50` — which is why the contradiction survived to be found by reading.
      //
      // Deliberately **no healing, no drain and no shield anywhere on it**: three things here make
      // the party live longer than it can kill, and every one of them is a step toward the
      // ninety-second timeout that is scored as a defeat. What keeps it resolving is that a reflect
      // only ever shortens a fight and nothing on the board puts health back.
      id: 'c7-s50',
      name: 'The Cairn King',
      enemies: {
        front: [THE_CAIRN_KING, CAIRNBOUND_SENTINEL],
        back: [THE_GRAVEWRIGHT, BONECHAIN_WARDEN, GRAVEMOURN_KEEPER],
      },
      level: 305,
    },
  ],
} as const;
