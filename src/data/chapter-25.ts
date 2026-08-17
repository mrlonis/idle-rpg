import {
  AFTERGRASS_GLEANER,
  ASHPIT_SCUTTLER,
  BARROWMIST_KEENER,
  CAIRNWARD_HUSK,
  CHALKHIDE_BROWSER,
  CHARNEL_DRUDGE,
  CLEFTHORN_GORER,
  CORTEGE_LANCER,
  DEADPACE_DRUMMER,
  EBBDRIFT_LATCHER,
  FALLOWMARCH_WARDEN,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HOLLOWCART_DROVER,
  HOLLOWCOUNT_RIDER,
  IRONWAKE_VANGUARD,
  LASTFEW_WARDEN,
  MILEWORN_HUSK,
  NUMBERLESS_DRUDGE,
  PASSBELL_RINGER,
  RENDFANG_JACKAL,
  SCARWEAVE_TRAMPLER,
  SEPULCHRE_HOUND,
  SPARSEWAY_HERALD,
  SPENTRANK_HAND,
  STEPFALL_STANDARD,
  THE_SHORTFALL,
  THE_THINNING,
  THINRANK_LANCER,
  THORNBACK_GRAZER,
  UNDERROAD_RANKER,
  WALKED_GROUND_DEAD,
  WEARWAY_GAUNT,
} from './enemies';

/**
 * Chapter 25 — The Thinground.
 *
 * **Sixty stages**, enemy levels 575 to 605. It **opens at the level chapter 24 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Nevermark did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, the longebb whether it **still holds its value**, the downstroke whether
 * it **arrives all at once**, the evenfall whether it **ever lands well**, and the nevermark whether
 * anything it does **takes hold**. This one asks whether there is **anyone left to spend it**.
 *
 * ⚠️ **Every question above is about the damage; this one is about the party throwing it, and that
 * is the distinction.** A road walked by so many dead that nothing on it holds — and what goes
 * through the party's armour is what decides how many of the five are still standing to swing. The
 * chapter is authored on `physicalPierce` for that reason and no other.
 *
 * | Band              | Stages | Levels  | The lock it teaches                                  |
 * | ----------------- | ------ | ------- | ---------------------------------------------------- |
 * | The walked ground | 1–10   | 575–580 | the habit: the road, and almost nothing going through |
 * | The first wearing | 11–20  | 580–585 | pierce arrives, below the shipped median             |
 * | The set median    | 21–30  | 585–590 | the median — {@link NUMBERLESS_DRUDGE}               |
 * | The thinning      | 31–40  | 590–595 | past the median — {@link THINRANK_LANCER}            |
 * | The sparse rank   | 41–50  | 595–600 | most of the board past it — {@link SPARSEWAY_HERALD} |
 * | The thinground    | 51–60  | 600–605 | the pairing — {@link LASTFEW_WARDEN}                 |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied for the third chapter running and for the same reason: before this chapter
 * `physicalPierce` sat on **94 of 312 blocks at a median of 0.20, a p75 of 0.24 and a ceiling of
 * 0.45**, so "the wearing arrives in band 2" cannot be a claim about *presence*. Measured over the
 * shipped boards, bodies per board at or above **0.20** run **0–1, 0–1, 1–2, 3, 4–5, 4–5** across the
 * six bands; at or above **0.28** they run **0–1, 0–1, 0–1, 1, 2–4, 3–4**; and at or above **0.32**,
 * **0, 0, 0, 0, 1–3, 2–4**. ⚠️ **It also forced a block to be authored *without* the stat**:
 * {@link WALKED_GROUND_DEAD} carries no `physicalPierce` at all, because it stands on more
 * opening-band boards than anything else here.
 *
 * ⚠️ **The whole axis sits *inside* the shipped register, and that is the answer rather than a
 * formality.** The top of the chapter is 0.40 against a shipped ceiling of 0.45, and only
 * {@link THE_SHORTFALL} reaches it. That is the Elf Tower's `critChance` shape rather than the
 * Monster Tower's `physicalResist` one, and a later session should be able to see which of the two
 * it is looking at.
 *
 * ⚠️ **No board restores anything, with one bounded exception, and the counts are the claim.**
 * `recovery` appears on **0 of 60** boards, `healthRegen` on **0 of 60**, and **0 of 60** field a kit
 * with a heal or shield effect. `lifeLeech` appears on **3 of 60** — `c25-s3`, `c25-s5` and `c25-s9`,
 * all in the opening band, all at 0.10 to 0.12, on two returning bodies. ⚠️ **The first draft of this
 * paragraph claimed zero on all four and the prose check disagreed**; the fix is the claim rather
 * than the boards, which is the Dwarf Tower's rule, and it is the fifth time a session has miscounted
 * its own sustain. **`recovery`, `lifeLeech`, `healthRegen` and a `regen` status are four different
 * things — name them separately or the sentence is false the day it is written.**
 *
 * ⚠️ **No board fields two `enemy-back` turns and no board fields two board-wide ones**, both checked
 * mechanically over all sixty. ⚠️ **Chapter 24 shipped the first of those claims false**, because the
 * authoring pass checked it against its own new blocks and missed two returning bodies that also
 * carried one. The returning Undead bench here is thick with `enemy-back` — {@link BARROWMIST_KEENER},
 * {@link SEPULCHRE_HOUND}, {@link DEADPACE_DRUMMER} and {@link GRAVETIDE_HERALD} all carry one — so
 * the check was run over the **fielded** bodies rather than the new ones, and it moved four boards.
 *
 * ## ⚠️ The rung moves to `ascended`, and this is the campaign's third override
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 24's seam of **1.0711** and The Thinground's close of 605, `mythic-plus` reads **0.5740**
 * (|Δln| **0.6238**) and `ascended` **4.8443** (|Δln| **1.5092**). **The rule prefers staying put by
 * 0.885 of a nat** — numerically the same margin chapters 18 and 22 overrode and chapters 19, 20, 21,
 * 23 and 24 stayed on. **This one is an override.**
 *
 * ⚠️ **What licenses it is the pool, measured by fielding rather than by filtering**, which is
 * chapter 24's correction to chapter 23's rule. Every one of the **312** shipped blocks was fielded
 * as an ordinary body beside four light escorts at level 605:
 *
 * | party fielding the board at level 605 | blocks that stand                         |
 * | ------------------------------------- | ----------------------------------------- |
 * | the `mythic-plus` five, cap 420       | **4 of 312**, every one a Monster         |
 * | an `ascended` five, cap 500           | **282 of 312**, across all seven factions |
 *
 * ⚠️ **And chapter 24's own boards read 0% at 605 against the rung it was fought on** — its opening
 * board, its mid board and its final alike, where the `ascended` five takes all three at 100% with
 * all five alive in 3.0s, 7.6s and 7.3s. **There is no chapter 25 on `mythic-plus`**, exactly as
 * there was no chapter 18 on `legendary-plus` and no chapter 22 on `mythic`.
 *
 * ⚠️ **Be honest about which half of the licence is met.** The standing rule is that an override
 * needs the seam **below** to be wrong *and* the pool to be unable to supply a board. Here the seam
 * below is **1.0711 — above 1.00** — and only this chapter's own is under it, which is the reading
 * chapter 21 correctly declined an override on. **What is different is that chapter 21's chapter was
 * authorable and this one is not**: four fieldable blocks in one faction cannot make sixty boards.
 * **The pool is the binding half, and it is the half that has settled all three overrides.**
 *
 * ⚠️ **`ascended` caps at 500 and is the last rung the campaign can spend at this close.**
 * `ascended-1` caps at 600 — five levels under the chapter's own close — and reads **61.94**, a
 * walkover by two orders of magnitude. Chapter 26 inherits a seam of **4.8443** and a fresh rung.
 *
 * ## ⚠️ The party gains a rung and eighty levels, so the boards are authored much heavier
 *
 * `mythic-plus` caps at 420 and `ascended` at 500, so the five that take this chapter are worth
 * ×1.6 for the rung and `perLevel.common ** 80` = ×5.22 for the levels — **×8.36** — against thirty
 * levels of board, ×1.87. An authored number here is worth **×4.47** of the identical number in The
 * Nevermark, which is why this chapter's ten new blocks run **420 to 1,350 authored health** — 780 to
 * 2,941 in common-equivalent terms — where chapter 24's ran 110 to 600, and why the boards run
 * **3,180 to 8,616 common-equivalent** against The Nevermark's 1,310 to 2,718.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an anchor of 2,209/51 behind four bodies of 1,250/40, each
 * carrying one ordinary turn, at level 605 and Relic 100: **17,996 common-equivalent, reading 3.91 of
 * five at 38.7s**, and it **moves** (4.00 at 16,555, 3.25 at 18,714, 2.23 at 19,438; on attack alone,
 * holding the weight, 3.38 at 54, 2.38 at 57, 0.63 at 60). Zero timeouts on every row.
 *
 * | `physicalPierce` across five | survivors | worth    |
 * | ---------------------------- | --------- | -------- |
 * | 0.08                         | 3.71      | 0.20     |
 * | 0.12                         | 3.50      | 0.41     |
 * | 0.16                         | 3.40      | 0.51     |
 * | 0.20 — the shipped median    | 3.33      | 0.58     |
 * | 0.24 — the shipped p75       | 2.98      | 0.93     |
 * | 0.28                         | 2.78      | 1.13     |
 * | 0.32                         | 2.56      | 1.35     |
 * | 0.36                         | 2.23      | 1.67     |
 * | 0.40                         | 1.85      | 2.06     |
 * | 0.45 — the shipped ceiling   | 1.58      | **2.33** |
 *
 * 1. ⚠️ **Ten monotone steps at 120 trials with zero timeouts, and it grades in counts as well** —
 *    1.27 / 1.34 / 1.50 / 1.57 / 1.96 at one through five carriers at 0.40. That is a
 *    two-dimensional grid where almost everything else at this weight is a cliff, and it is what
 *    makes six bands buildable. Chapter 21 found `lifeLeech` was the one stat that graded and
 *    chapter 24 found `tenacity` was; **when every other reading is a cliff, look for the one stat
 *    that grades** keeps being the rule that finds a chapter.
 * 2. ⚠️ **Fight length is what chose it over every refusal stat, and no previous chapter has picked
 *    an axis on that.** Pierce moves the control from 38.7s to 43.9s across its whole range, where
 *    `def` (50.9 → 58.5s), `physicalResist` (43.5 → 56.4s), `dodge` (41.0 → 54.3s) and `tenacity`
 *    (40.8 → 49.4s) all walk toward the 72s bar. Chapter 22 and chapter 24 each lost two boards to
 *    that bar; **the longest fight anywhere in this chapter is 29.0s.** A chapter about attrition
 *    wants an axis that converts weight into deaths rather than into seconds, and this is the only
 *    one measured that does.
 * 3. ⚠️ **The refusal vocabulary inverted again, in both directions, which is the fourth chapter
 *    running to record one.** Against this control `def` is a **cliff** — 1.78 at 20 and 3.65 at 40
 *    — where chapter 23 measured it as a dial (0.40 / 1.65 / 3.55 across 46 / 70 / 110); and
 *    `critBlock` **saturates at 0.75** by 0.28, exactly as chapter 23 found. **Re-price against the
 *    chapter's own control every time; a figure quoted without its weight means nothing.**
 * 4. ⚠️ **`THORNMAIL` on the back three is a total wipe here — 4.00 of five — where chapter 19
 *    measured that exact arrangement at 0.00 and chapter 22 at less than nothing.** The mechanism is
 *    the one chapter 19 named: a reflect bills what is actually struck, and an `ascended` five aims
 *    differently. No board in this chapter carries one, and the reading is recorded because it is the
 *    sharpest inversion in the sweep.
 *
 * ## ⚠️ Three things the boards found that the control did not
 *
 * 1. ⚠️ **A final that fails at every stat line is its escort, and this chapter reproduced chapter
 *    19's signature exactly.** Behind {@link QUICKLIME_SERJEANT} — 1000/52 at haste 144 — the boss
 *    read **0% at every stat line from 1000/26 down to 340/10**. Behind two {@link LASTFEW_WARDEN}
 *    it grades 4.00 / 3.67 / 1.65 / 0.00 across 430/14, 540/18, 700/22 and 1000/26 — the escort it
 *    ships with. It ships at **500/16**, reading 100% with **3.98 of five at 26.8s**. **Check the
 *    control can move before concluding anything from a boss sweep.**
 * 2. ⚠️ **The lieutenant was settled by fielding all five appearances, not the first.** At 900/30 it
 *    graded 5.00 / 5.00 / 4.83 / 3.52 / **0.05** across s10 to s50 against the tuning escorts —
 *    chapter 17's trap, an `ascended` block climbing at 1.024 against a party frozen at its rung's
 *    cap. At **420/18** the same five boards read 5.00 / 5.00 / 5.00 / 4.00 / 4.00, and **on the
 *    boards as shipped they read 5.00 / 5.00 / 5.00 / 4.97 / 4.00** — quoted separately because the
 *    escorts moved between the sweep and the chapter, and a tuning figure is not a board figure.
 * 3. ⚠️ **The probe reads throughput, so the late bands needed one fast, hot body.**
 *    {@link THINRANK_LANCER} is chapter 24's {@link STUBBORN_GRAIN} repair applied to a different
 *    lock. **Weight shortlists; only the probe ranks.** The spine runs **315,115 → 1,319,896** across
 *    the sixteen sampled stages, ×4.19, with a worst adjacent ratio of **0.974**.
 *
 * ## What the sixty boards read
 *
 * Against the party the chapter is tuned for, every board reads **100%** with **zero timeouts**. The
 * lowest survivor count anywhere is **3.98 of five at the final**, the six band representatives read
 * 5.00 / 5.00 / 5.00 / 5.00 / 4.00 / 4.00, and **the longest fight in the chapter is 29.0s** against
 * a 72s bar — the flattest length profile any chapter has shipped, and the whole reason the axis is
 * `physicalPierce` rather than a refusal stat.
 *
 * ## The lean, and what it costs
 *
 * - **Undead, at 90.0% of board slots** — in family, between The Underroad's 86.4% and The
 *   Rustwood's 92%. Undead was **not** the thinnest legal lead: the reading before this chapter was
 *   angel 24, demon 25, **human 46**, undead 49, elf 53, dwarf 54, monster 61, and this takes Undead
 *   to 59. ⚠️ **Human was passed over on recency rather than on depth** — it led The Downstroke two
 *   chapters ago, its third lead — where Undead last led The Commonage five chapters back. **Say
 *   which of the two arguments you used**, because the depth ordering alone would have picked Human.
 * - **The non-lean texture is the road's scavengers**, Monster, thinning monotonically across the
 *   bands — **9, 7, 5, 4, 3, 2** slots — which is The Spoilfield's shape doing a fiction's job.
 *   Monster is also the one faction whose lean costs the matchup nothing.
 * - **33 distinct archetypes fielded, ten of them new** — **25.8%** of ordinary archetypes under the
 *   shipped rule (8 of 31) and **30.3%** counting the lieutenant and the boss inside the fraction.
 *   The quota lands at the quota for the sixth chapter running.
 * - ⚠️ **The `gearArchetype` bill was zero for the sixth chapter running.** Nine of the 49 Undead
 *   blocks carry none, and none of them is fielded here, because every one is either too heavy for a
 *   board at this budget or carries a second `enemy-back` turn. **That is a fact about which blocks
 *   the budget reached, not about the faction.**
 */

export const CHAPTER_25 = {
  id: 'chapter-25',
  name: 'The Thinground',
  stages: [
    {
      id: 'c25-s1',
      name: 'The Walked Ground',
      enemies: {
        front: [WALKED_GROUND_DEAD, CAIRNWARD_HUSK],
        back: [MILEWORN_HUSK, UNDERROAD_RANKER, RENDFANG_JACKAL],
      },
      level: 575,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s2',
      name: 'Nobody Counts It',
      enemies: {
        front: [WALKED_GROUND_DEAD, GRAVEWAKE_THRALL],
        back: [UNDERROAD_RANKER, MILEWORN_HUSK, CLEFTHORN_GORER],
      },
      level: 576,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s3',
      name: 'A Road Of Its Own',
      enemies: {
        front: [CAIRNWARD_HUSK, CHARNEL_DRUDGE],
        back: [SEPULCHRE_HOUND, MILEWORN_HUSK, ASHPIT_SCUTTLER],
      },
      level: 576,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s4',
      name: 'Verge And Ditch',
      enemies: {
        front: [WALKED_GROUND_DEAD, CORTEGE_LANCER],
        back: [MILEWORN_HUSK, UNDERROAD_RANKER, RENDFANG_JACKAL],
      },
      level: 577,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s5',
      name: 'The Long Shoulder',
      enemies: {
        front: [WALKED_GROUND_DEAD, CHARNEL_DRUDGE],
        back: [BARROWMIST_KEENER, UNDERROAD_RANKER, EBBDRIFT_LATCHER],
      },
      level: 577,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s6',
      name: 'What The Road Keeps',
      enemies: {
        front: [CHARNEL_DRUDGE, GRAVEWAKE_THRALL],
        back: [UNDERROAD_RANKER, CORTEGE_LANCER, ASHPIT_SCUTTLER],
      },
      level: 578,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s7',
      name: 'Milestones Unread',
      enemies: {
        front: [WALKED_GROUND_DEAD, CORTEGE_LANCER],
        back: [SPENTRANK_HAND, BARROWMIST_KEENER, CLEFTHORN_GORER],
      },
      level: 578,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s8',
      name: 'The Second Verge',
      enemies: {
        front: [CHARNEL_DRUDGE, CAIRNWARD_HUSK],
        back: [SPENTRANK_HAND, UNDERROAD_RANKER, CHALKHIDE_BROWSER],
      },
      level: 579,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s9',
      name: 'Nothing Turned Back',
      enemies: {
        front: [WALKED_GROUND_DEAD, CHARNEL_DRUDGE],
        back: [SPENTRANK_HAND, SEPULCHRE_HOUND, CLEFTHORN_GORER],
      },
      level: 579,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s10',
      name: 'The Thinning Comes Up',
      enemies: {
        front: [THE_THINNING, WALKED_GROUND_DEAD],
        back: [SPENTRANK_HAND, CAIRNWARD_HUSK, GRAVEWAKE_THRALL],
      },
      level: 580,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s11',
      name: 'First Wearing',
      enemies: {
        front: [WALKED_GROUND_DEAD, CHARNEL_DRUDGE],
        back: [SPENTRANK_HAND, CORTEGE_LANCER, RENDFANG_JACKAL],
      },
      level: 580,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s12',
      name: 'Where The Ruts Are',
      enemies: {
        front: [WEARWAY_GAUNT, CAIRNWARD_HUSK],
        back: [SPENTRANK_HAND, GRAVEWAKE_THRALL, CLEFTHORN_GORER],
      },
      level: 581,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s13',
      name: 'A Thinner Company',
      enemies: {
        front: [WEARWAY_GAUNT, CHARNEL_DRUDGE],
        back: [SPENTRANK_HAND, CORTEGE_LANCER, RENDFANG_JACKAL],
      },
      level: 581,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s14',
      name: 'The Road Widens',
      enemies: {
        front: [WEARWAY_GAUNT, GRAVEWAKE_THRALL],
        back: [SPENTRANK_HAND, CHARNEL_DRUDGE, CLEFTHORN_GORER],
      },
      level: 582,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s15',
      name: 'Bone For Ballast',
      enemies: {
        front: [WEARWAY_GAUNT, CORTEGE_LANCER],
        back: [PASSBELL_RINGER, CHARNEL_DRUDGE, SPENTRANK_HAND],
      },
      level: 582,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s16',
      name: 'The Marching Order',
      enemies: {
        front: [WEARWAY_GAUNT, CHARNEL_DRUDGE],
        back: [SPENTRANK_HAND, FALLOWMARCH_WARDEN, ASHPIT_SCUTTLER],
      },
      level: 583,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s17',
      name: 'Fewer Than Yesterday',
      enemies: {
        front: [WEARWAY_GAUNT, CAIRNWARD_HUSK],
        back: [AFTERGRASS_GLEANER, SPENTRANK_HAND, ASHPIT_SCUTTLER],
      },
      level: 583,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s18',
      name: 'What Wears First',
      enemies: {
        front: [WEARWAY_GAUNT, CHARNEL_DRUDGE],
        back: [SPENTRANK_HAND, AFTERGRASS_GLEANER, CLEFTHORN_GORER],
      },
      level: 584,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s19',
      name: 'The Company Halts',
      enemies: {
        front: [WEARWAY_GAUNT, CORTEGE_LANCER],
        back: [SPENTRANK_HAND, FALLOWMARCH_WARDEN, CHARNEL_DRUDGE],
      },
      level: 584,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s20',
      name: 'The Thinning Again',
      enemies: {
        front: [THE_THINNING, WEARWAY_GAUNT],
        back: [SPENTRANK_HAND, CHARNEL_DRUDGE, CORTEGE_LANCER],
      },
      level: 585,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s21',
      name: 'The Set Median',
      enemies: {
        front: [NUMBERLESS_DRUDGE, WEARWAY_GAUNT],
        back: [SPENTRANK_HAND, CHARNEL_DRUDGE, CORTEGE_LANCER],
      },
      level: 585,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s22',
      name: 'A Full Rank',
      enemies: {
        front: [NUMBERLESS_DRUDGE, CHARNEL_DRUDGE],
        back: [WEARWAY_GAUNT, SPENTRANK_HAND, CLEFTHORN_GORER],
      },
      level: 586,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s23',
      name: 'Ground Already Given',
      enemies: {
        front: [WEARWAY_GAUNT, NUMBERLESS_DRUDGE],
        back: [WEARWAY_GAUNT, CHARNEL_DRUDGE, AFTERGRASS_GLEANER],
      },
      level: 586,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s24',
      name: 'The Middle Mile',
      enemies: {
        front: [NUMBERLESS_DRUDGE, WEARWAY_GAUNT],
        back: [AFTERGRASS_GLEANER, CHARNEL_DRUDGE, THORNBACK_GRAZER],
      },
      level: 587,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s25',
      name: 'Counted And Uncounted',
      enemies: {
        front: [NUMBERLESS_DRUDGE, CHARNEL_DRUDGE],
        back: [WEARWAY_GAUNT, WEARWAY_GAUNT, PASSBELL_RINGER],
      },
      level: 587,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s26',
      name: 'The Road Takes Its Own',
      enemies: {
        front: [WEARWAY_GAUNT, NUMBERLESS_DRUDGE],
        back: [WEARWAY_GAUNT, AFTERGRASS_GLEANER, CLEFTHORN_GORER],
      },
      level: 588,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s27',
      name: 'No Number Holds',
      enemies: {
        front: [NUMBERLESS_DRUDGE, WEARWAY_GAUNT],
        back: [WEARWAY_GAUNT, STEPFALL_STANDARD, THORNBACK_GRAZER],
      },
      level: 588,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s28',
      name: 'A Hollow Middle',
      enemies: {
        front: [NUMBERLESS_DRUDGE, CHARNEL_DRUDGE],
        back: [WEARWAY_GAUNT, DEADPACE_DRUMMER, WEARWAY_GAUNT],
      },
      level: 589,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s29',
      name: 'The Ruts Go Deep',
      enemies: {
        front: [NUMBERLESS_DRUDGE, WEARWAY_GAUNT],
        back: [WEARWAY_GAUNT, STEPFALL_STANDARD, CLEFTHORN_GORER],
      },
      level: 589,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s30',
      name: 'The Thinning Holds',
      enemies: {
        front: [THE_THINNING, NUMBERLESS_DRUDGE],
        back: [WEARWAY_GAUNT, WEARWAY_GAUNT, CHARNEL_DRUDGE],
      },
      level: 590,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s31',
      name: 'The Thinning Ground',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [WEARWAY_GAUNT, HOLLOWCOUNT_RIDER, STEPFALL_STANDARD],
      },
      level: 590,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s32',
      name: 'Rank And File',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [HOLLOWCOUNT_RIDER, WEARWAY_GAUNT, AFTERGRASS_GLEANER],
      },
      level: 591,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s33',
      name: 'Spent In The Walking',
      enemies: {
        front: [THINRANK_LANCER, NUMBERLESS_DRUDGE],
        back: [HOLLOWCOUNT_RIDER, WEARWAY_GAUNT, SCARWEAVE_TRAMPLER],
      },
      level: 591,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s34',
      name: 'A Shorter Column',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [HOLLOWCOUNT_RIDER, WEARWAY_GAUNT, HOLLOWCART_DROVER],
      },
      level: 592,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s35',
      name: 'The Fourth Verge',
      enemies: {
        front: [THINRANK_LANCER, NUMBERLESS_DRUDGE],
        back: [HOLLOWCOUNT_RIDER, STEPFALL_STANDARD, THORNBACK_GRAZER],
      },
      level: 592,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s36',
      name: 'Fewer Every Mile',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [HOLLOWCOUNT_RIDER, HOLLOWCART_DROVER, WEARWAY_GAUNT],
      },
      level: 593,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s37',
      name: 'What The March Costs',
      enemies: {
        front: [THINRANK_LANCER, NUMBERLESS_DRUDGE],
        back: [HOLLOWCOUNT_RIDER, WEARWAY_GAUNT, SCARWEAVE_TRAMPLER],
      },
      level: 593,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s38',
      name: 'The Road Thins',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [HOLLOWCOUNT_RIDER, HOLLOWCART_DROVER, THORNBACK_GRAZER],
      },
      level: 594,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s39',
      name: 'Nothing Comes Back',
      enemies: {
        front: [THINRANK_LANCER, NUMBERLESS_DRUDGE],
        back: [HOLLOWCOUNT_RIDER, STEPFALL_STANDARD, HOLLOWCART_DROVER],
      },
      level: 594,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s40',
      name: 'The Thinning Marches',
      enemies: {
        front: [THE_THINNING, THINRANK_LANCER],
        back: [NUMBERLESS_DRUDGE, WEARWAY_GAUNT, HOLLOWCART_DROVER],
      },
      level: 595,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s41',
      name: 'The Sparse Rank',
      enemies: {
        front: [THINRANK_LANCER, NUMBERLESS_DRUDGE],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, HOLLOWCART_DROVER],
      },
      level: 595,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s42',
      name: 'A Road Without A Column',
      enemies: {
        front: [THINRANK_LANCER, LASTFEW_WARDEN],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, WEARWAY_GAUNT],
      },
      level: 596,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s43',
      name: 'Sparse And Sparser',
      enemies: {
        front: [NUMBERLESS_DRUDGE, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, HOLLOWCART_DROVER],
      },
      level: 596,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s44',
      name: 'The Fifth Verge',
      enemies: {
        front: [THINRANK_LANCER, LASTFEW_WARDEN],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, THORNBACK_GRAZER],
      },
      level: 597,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s45',
      name: 'What Few Remain',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, IRONWAKE_VANGUARD],
      },
      level: 597,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s46',
      name: 'The Column Breaks',
      enemies: {
        front: [THINRANK_LANCER, LASTFEW_WARDEN],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, SCARWEAVE_TRAMPLER],
      },
      level: 598,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s47',
      name: 'Ground Without Marks',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, HOLLOWCART_DROVER],
      },
      level: 598,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s48',
      name: 'A Thin Muster',
      enemies: {
        front: [THINRANK_LANCER, LASTFEW_WARDEN],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, SCARWEAVE_TRAMPLER],
      },
      level: 599,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s49',
      name: 'The Last Of The Road',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER, LASTFEW_WARDEN],
      },
      level: 599,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s50',
      name: 'The Thinning Musters',
      enemies: {
        front: [THE_THINNING, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, LASTFEW_WARDEN, NUMBERLESS_DRUDGE],
      },
      level: 600,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s51',
      name: 'The Thinground',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, SPARSEWAY_HERALD, HOLLOWCOUNT_RIDER],
      },
      level: 600,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s52',
      name: 'Nobody On The Road',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, LASTFEW_WARDEN, SPARSEWAY_HERALD],
      },
      level: 601,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s53',
      name: 'The Roll Is Short',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, LASTFEW_WARDEN, HOLLOWCART_DROVER],
      },
      level: 601,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s54',
      name: 'What The Ground Keeps',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, SPARSEWAY_HERALD, GRAVETIDE_HERALD],
      },
      level: 602,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s55',
      name: 'A Rank Of Two',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, HOLLOWCOUNT_RIDER, SCARWEAVE_TRAMPLER],
      },
      level: 602,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s56',
      name: 'The Muster Thins',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [SPARSEWAY_HERALD, LASTFEW_WARDEN, IRONWAKE_VANGUARD],
      },
      level: 603,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s57',
      name: 'No One Answers',
      enemies: {
        front: [LASTFEW_WARDEN, NUMBERLESS_DRUDGE],
        back: [LASTFEW_WARDEN, SPARSEWAY_HERALD, THINRANK_LANCER],
      },
      level: 603,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s58',
      name: 'The Last Verge',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, SPARSEWAY_HERALD, SCARWEAVE_TRAMPLER],
      },
      level: 604,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s59',
      name: 'Ground Enough For All',
      enemies: {
        front: [LASTFEW_WARDEN, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, SPARSEWAY_HERALD, IRONWAKE_VANGUARD],
      },
      level: 604,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c25-s60',
      name: 'The Shortfall',
      enemies: {
        front: [THE_SHORTFALL, THINRANK_LANCER],
        back: [LASTFEW_WARDEN, LASTFEW_WARDEN, HOLLOWCOUNT_RIDER],
      },
      level: 605,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
