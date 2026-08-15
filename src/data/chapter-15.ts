import {
  BARROWMIST_KEENER,
  BRACEWORK_DELVER,
  CAIRNWARD_HUSK,
  CHARNEL_DRUDGE,
  COLDFORGE_HAND,
  CORTEGE_LANCER,
  DEADPACE_DRUMMER,
  DEEPGALLERY_RUNNER,
  DEEPLAMP_SEALER,
  DEEPROCK_MINER,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  HOLLOWCART_DROVER,
  IRONSLING_WRIGHT,
  IRONWAKE_VANGUARD,
  LAMPLESS_PILGRIM,
  MARCHWARD_PIKEMAN,
  MILEWORN_HUSK,
  NIGHTMARCH_OUTRIDER,
  PLUMBLINE_HAND,
  QUICKLIME_SERJEANT,
  ROADGAUNT_OUTRIDER,
  SEPULCHRE_HOUND,
  SHADE,
  STEPFALL_STANDARD,
  TALLOWLIGHT_RUNNER,
  THE_TALLYMAN,
  THE_UNNUMBERED,
  UNDERROAD_RANKER,
  WISP,
  BONECHAIN_WARDEN,
} from './enemies';

/**
 * Chapter 15 — The Underroad.
 *
 * Fifty stages, enemy levels 300 to 325. It **opens at the level chapter 14 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Shutgate did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, and the shutgate whether it arrives **big enough**. This
 * one asks whether there is **an end to it**.
 *
 * Fourteen chapters have been a place with a number of things in it. This one is a road with a
 * column on it, and the column has been walking since the gate was shut. Nothing on these boards
 * refuses the party's damage the way The Shutgate's did — every blow lands and every blow is worth
 * the turn. What the chapter asks is whether the party's damage runs out before the road does.
 *
 * | Band                 | Stages | The lock it teaches                                          |
 * | -------------------- | ------ | ------------------------------------------------------------ |
 * | The outriders        | 1–10   | `haste` at the shipped register: it acts before the party does |
 * | The ranks            | 11–20  | volume and sameness, and a standard that keeps closing them up |
 * | The drum             | 21–30  | tempo as a **turn**, with a silence in every cycle             |
 * | The train            | 31–40  | what the column picked up, and a finisher on the softest body  |
 * | The head of the column | 41–50 | all four at once, and the thing the march is following        |
 *
 * ## Where the setting comes from
 *
 * The Shutgate was closed from the inside, a very long time ago, against something. This is the
 * something. It is not an army and it is not a garrison — it is a **procession**, on a road that
 * runs under the hill and out the other side of it, and the hold was sealed because the road went
 * past the door and the door was the only thing anybody could do about it.
 *
 * ⚠️ **It is the inverse of the chapter below it in the same way that one inverted The Quarry.**
 * The Shutgate is a Dwarf lean with Monster texture — the things from the breach, thinning out as
 * the party goes deeper into the hold. This is an **Undead lean with Dwarf texture**, and the Dwarf
 * slots run the other way for four bands and then stop: the further along the road the party goes,
 * the more of the hold's own dead are walking in the column, until the head of the column, which
 * never went through anybody's door. Counted, the five bands carry **4, 6, 8, 13 and 3** Dwarf
 * slots.
 *
 * ⚠️ **That measures as an 86.4% lean, which is out of family, and it is stated rather than
 * rounded.** The Shutgate and The Quarry both ran 85.2%, the Weald 81.5%, The Bleeding Wild 83.9%
 * and The Standing Line 83.2%; only The Rustwood's 92% is heavier. **It was counted after the
 * boards landed rather than written from the intent** — which is the failure The Shutgate's own
 * header records making — and the extra 1.2 points came from the closing band, where the weight
 * budget pushed three Dwarf commons off boards that could not afford them. Bringing it back to
 * 85.2% would have meant putting the hold's dead at the *head* of the column, which is the one
 * place the fiction says they are not.
 *
 * The name is the mechanic as well as the place. An underroad is a road that does not stop at
 * anybody's door, and the whole chapter is the party trying to reach the end of one.
 *
 * ## Where the levels come from
 *
 * 300 to 325, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## ⚠️ The cap has now been out of levels for two chapters, and the gradient compounds
 *
 * `legendary-plus` caps at **260** against a close of **325**, so the party this chapter is tuned
 * for stands **sixty-five levels under the last board** — where The Shutgate's stood forty under and
 * The Quarry's fifteen. At `perLevel.common` = 1.021 that is **×3.80** of content the party cannot
 * answer with levels, and it arrives entirely from a ceiling that does not move.
 *
 * The seam ratios are the record: **10.4858 → 7.6774 → 4.5665 → 2.7160**, which is ×0.732 and then
 * ×0.595 twice. ⚠️ **The second factor is not a coincidence and it is not tuning**: it is exactly
 * `perLevel.common ** -25`, so a chapter on this rung divides the seam by 1.680 by arithmetic. It
 * will keep doing so for as long as the rung does not move.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Against a
 * close of 325, `legendary-plus` reads 2.7160 (|Δln| **0.5196** against chapter 14's own seam) and
 * `mythic` reads 16.7772 (|Δln| **1.3013**). So `legendary-plus` wins by 0.78 of a nat and this is
 * the **fifth** chapter running on one rung.
 *
 * ⚠️ **`mythic` was ruled out by measurement rather than by reflex, and the measurement is the
 * finding.** Fielded at 325 — level with this chapter's close, its cap being 340 — a `mythic` party
 * takes chapter 14's final board **unchanged** at 100% with all five alive in 3.9 seconds, and the
 * board has to be scaled **×2.4** before it loses a single member. That puts the anchor it would
 * need at roughly **3,550 health**, which is ×2 past {@link UNMADE}'s 1800 — the ceiling
 * `enemies.spec.ts` enforces on every new `ascended` block. **So the rung the arithmetic prefers is
 * also the only one the enemy roster can be authored for**, and a session that reaches for `mythic`
 * here is reaching for a `data/` rule change rather than for a chapter.
 *
 * ## ⚠️ Every block here is roughly half the weight of chapter 14's, and the whole board with it
 *
 * {@link THE_UNNUMBERED} is **680/40** against The Doorstone's 1480/88, and {@link THE_TALLYMAN}
 * **800/50** against The Deadbolt's 1400/84 — the second chapter running that a final has been
 * authored lighter than the one before it, and the first where the *ordinary* blocks came down too.
 * **Field the previous chapter's final at the new roof before authoring anything**, exactly as a
 * tower does. Measured, chapter 14's own final board against this chapter's seam party:
 *
 * | `c14-s50`'s board, refielded  | reading                       |
 * | ----------------------------- | ----------------------------- |
 * | level 300, Masterwork 42      | 100% / 4.00 survivors / 29.0s |
 * | level 305, Masterwork 49      | **60%** / 1.63 / 39.7s        |
 * | level 310, Masterwork 57      | **0%** / 0.00                 |
 * | level 325, Masterwork 80      | **0%** / 0.00 / 11.5s         |
 *
 * ⚠️ **The whole board has to come down and not just the anchor, which is the part that is easy to
 * get wrong.** Chapter 14 recorded that what moves a tuned party is the anchor slot; that is a fact
 * about *which slot the response lives in*, not a licence to prop a light anchor up with heavy
 * support. Measured here: with The Doorstone **deleted outright** the four remaining chapter-14
 * bodies at level 325 still read **35% with 0.68 survivors**, and three of them alone read 0%.
 * Scaling only the anchor to a tenth reads 0%. Only a uniform halving of all five reads 4.00.
 *
 * **So the budget is the design and the stat lines follow from it**: every board here totals roughly
 * **2,200 to 2,900 health and 165 to 222 attack** across its five bodies, flat from the first stage
 * to the last, and the level line supplies the entire gradient. That is what let the chapter draw
 * twenty-four returning blocks from the light end of the shipped pool rather than authoring a
 * bestiary.
 *
 * ## ⚠️ The gear grade steps to Masterwork, and it opens at level 42 rather than at level 1
 *
 * Every board here carries {@link StageEncounterData.gear} at grade **3 (Masterwork)**, climbing 42
 * to 80 across the fifty stages. **Forty-two, not one, and it is the same arithmetic the two
 * chapters below used at their own boundaries**: a piece is worth `multiplier × (1 + 0.055 ×
 * (level − 1))`, so Fine at its cap of 60 is **7.641** while Masterwork at level 1 is only 2.350 and
 * at 41 still **7.520**. Masterwork 42 reads **7.649** — the first level of the new grade that clears
 * the old grade's cap — and Masterwork 80 reads **12.561**, so the chapter closes at ×1.64 of what
 * The Shutgate closed at.
 *
 * ⚠️ **This is the fourth chapter to run the grade ladder to a cap and the second-to-last that can.**
 * Relic is one grade up and one chapter away; there is no sixth grade. A chapter 17 finding this
 * exhausted writes it down rather than taking the scope — see [gear](../../docs/gear.md), which has
 * measured the axis at ×1.09–1.18, ×1.15 and "worth seconds" on three separate occasions against the
 * ×3 the escalation would need.
 *
 * ## ⚠️ What carries the difficulty here, and the negative list restated for a different vocabulary
 *
 * Chapter 14 measured its whole **refusal** vocabulary inert against this party — `def` past the
 * register, `physicalResist` to 0.60, board-wide barriers, aegises, guards and weakens, instance
 * size at held damage per second, and reach — none worth more than 0.08 of a survivor and several
 * worth eleven seconds of fight. This chapter's vocabulary is **tempo** rather than refusal, and it
 * measures the same way: the drum band's `ally-all` {@link HASTE} and the outriders' 138–144 `haste`
 * are worth fight length and texture, and what actually grades the boards is where they stand on the
 * curve.
 *
 * ⚠️ **That is stated rather than hidden, for the third chapter running, because only one half of it
 * is visible in the boards.** The bands are what the chapter is *about*; the level line is what makes
 * it hard. A session that reads the bands as the difficulty will size the next chapter wrong.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the final: **eight new, twenty-four returning** —
 * exactly the quarter a chapter owes, measured over what the chapter *fields* rather than over the
 * shipped pool. Thirty-four distinct bodies in all.
 *
 * ⚠️ **The lean is Undead and it takes the faction 25 → 35.** Undead stood thinnest of the five
 * factions a chapter may lead: the seven ran angel 24, undead 25, demon 25, human 26, elf 33,
 * monster 34, dwarf 34, and **both factions at or below 25 that are not Undead are celestials** — a
 * celestial deals ×1.10 to every mortal and the matrix has **no mortal → celestial row**, so neither
 * may lead. **Recompute the depths before choosing the next lean**; this is the fifth session in a
 * row where one lean has reversed the ordering.
 *
 * ⚠️ **Undead is the lean whose idiom is the drain, and the chapter spends it deliberately rather
 * than avoiding it.** See the sustain counts below: `lifeLeech` is permitted here where chapter 14
 * carried none, because a leech is bounded by the damage its holder deals and dies with the holder,
 * where a `recovery` is not. The timeout count is what settles that, and it is counted rather than
 * assumed.
 *
 * ⚠️ **The non-Undead texture is Dwarf, and it thickens rather than thinning** —
 * {@link DEEPGALLERY_RUNNER}, {@link DEEPROCK_MINER}, {@link PLUMBLINE_HAND},
 * {@link MARCHWARD_PIKEMAN}, {@link BRACEWORK_DELVER}, {@link COLDFORGE_HAND},
 * {@link IRONSLING_WRIGHT} and {@link DEEPLAMP_SEALER}. Eight blocks, all returning, none new: a
 * chapter's ten new blocks go to its lean. Counted, the five bands carry **4, 6, 8, 13 and 6** Dwarf
 * slots, which is The Shutgate's own thinning arithmetic run backwards — the column picks the hold's
 * dead up as it goes, and the head of the column has none of them.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Unnumbered is the fifteenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here, stated as counts rather than as an absolute
 *
 * A threshold claim has its range grow underneath it, so the counts, measured over all fifty boards
 * with a script rather than by reading: **0 boards carry a block with `recovery`, 0 carry
 * `healthRegen`, 0 field a heal, 0 field a shield or a pool of any kind, 12 carry a block with
 * `lifeLeech`, and 2 field a `drain` in a kit.** The three leech carriers are
 * {@link SEPULCHRE_HOUND} at 0.10, {@link SHADE} at 0.15 and {@link HEADSMAN} at 0.20; the two
 * drains are {@link SHADE}'s and {@link GRAVETIDE_HERALD}'s `withering-touch`.
 *
 * ⚠️ **A leech is not a regeneration and the distinction is what licenses it.** `recovery` and
 * `healthRegen` pay a body back on a clock it does not have to earn; a leech pays only in proportion
 * to damage the body actually deals, so it is bounded by the very thing the party is removing, and
 * it stops the instant the holder dies. That is why the returning Undead set excludes
 * {@link REVENANT}, {@link RELIQUARY_BEARER}, {@link CAIRNBOUND_SENTINEL} and
 * {@link BARROW_SOVEREIGN} — all four carry `recovery` — and it is four of the faction's
 * twenty-five, which is why the returning Undead list is sixteen rather than twenty.
 *
 * ⚠️ **Neither the lieutenant nor the final restores or drains anything**, and that is the one
 * absolute claim this chapter makes about a single board. A boss feeding off a slowed party is the
 * ninety-second clock with a stat block attached.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier front rank, the lieutenant brought forward — never with +3 enemy
 *    levels. Here the whole board is the dial rather than the anchor slot alone; see the header.
 * 2. ⚠️ **The probe reads `c15-s1`, and then every fourth stage.** The stride lands on s1, s5, s9,
 *    s13, s17, s21, s25, s29, s33, s37, s41, s45, s49 and the final — so **band openers 1, 3 and 5
 *    (s1, s21, s41) are samples and openers 2 and 4 (s11, s31) are not**, which is the reverse of The
 *    Shutgate's arrangement and the same phase The Quarry had. The three that are had to be authored
 *    heavy against the pull to open a band lightly, and **none of the four mini-bosses is a sample** —
 *    only the chapter boss is pinned in.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank**, and the lieutenant does not stand
 *    on the final — chapters 9 through 14 all declined it, and what stands beside The Unnumbered is a
 *    legendary. At this chapter's level gap that pairing is not a step but a cliff.
 */
export const CHAPTER_15 = {
  id: 'chapter-15',
  name: 'The Underroad',
  stages: [
    // -----------------------------------------------------------------------------------
    // The outriders — stages 1 to 10, levels 300 to 305, Masterwork 42 to 49
    //
    // The lock: something that acts before the party does. {@link ROADGAUNT_OUTRIDER} carries
    // `haste` 138 and {@link TALLOWLIGHT_RUNNER} 144, and both sit **inside** the shipped register
    // rather than past it — the ceiling over the whole pool is the Skyshrike's 152, with
    // {@link WISP} at 148 and {@link QUICKLIME_SERJEANT} at 144. ⚠️ **Authored at the register, and
    // nothing in this chapter steps past it**, which is the shape the Elf Tower's third hundred took
    // with `critChance` rather than the Monster Tower's step past `physicalResist`.
    //
    // ⚠️ **Both are thin, and that is the register too.** Every fast block this game ships is thin,
    // because the Angel Tower measured `haste` as worth almost nothing on a durable body and as the
    // strongest dial there is on a soft one. Speed here is paid for in health rather than added to it.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The seam, at The Shutgate's own closing level. Authored light on purpose: a change of
      // place rather than a step. **It is a probe sample** — the stride opens on `c15-s1` this time
      // — but the probe skips a sample that follows a chapter boss by name, so the escalation it has
      // to make is against `c15-s5` rather than against The Doorstone.
      id: 'c15-s1',
      name: 'The Road Behind the Door',
      enemies: {
        front: [CORTEGE_LANCER, ROADGAUNT_OUTRIDER],
        back: [WISP, TALLOWLIGHT_RUNNER, DEEPGALLERY_RUNNER],
      },
      level: 300,
      gear: { grade: 3, level: 42 },
    },
    {
      id: 'c15-s2',
      name: 'Nobody Sounded a Halt',
      enemies: {
        front: [ROADGAUNT_OUTRIDER, SEPULCHRE_HOUND],
        back: [WISP, TALLOWLIGHT_RUNNER, BARROWMIST_KEENER],
      },
      level: 301,
      gear: { grade: 3, level: 43 },
    },
    {
      id: 'c15-s3',
      name: 'Ahead of the Column',
      enemies: {
        front: [CORTEGE_LANCER, ROADGAUNT_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, SEPULCHRE_HOUND, PLUMBLINE_HAND],
      },
      level: 301,
      gear: { grade: 3, level: 44 },
    },
    {
      id: 'c15-s4',
      name: 'Tallowlight',
      enemies: {
        front: [SEPULCHRE_HOUND, ROADGAUNT_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, WISP, BARROWMIST_KEENER],
      },
      level: 302,
      gear: { grade: 3, level: 44 },
    },
    {
      // ⚠️ A probe sample, and the first board that has to escalate on its own — the sample before
      // it follows a chapter boss and is skipped by name.
      id: 'c15-s5',
      name: 'The Outriders',
      enemies: {
        front: [NIGHTMARCH_OUTRIDER, ROADGAUNT_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, WISP, SHADE],
      },
      level: 302,
      gear: { grade: 3, level: 45 },
    },
    {
      id: 'c15-s6',
      name: 'They Do Not Stop for What They Pass',
      enemies: {
        front: [CORTEGE_LANCER, NIGHTMARCH_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER, DEEPGALLERY_RUNNER],
      },
      level: 303,
      gear: { grade: 3, level: 46 },
    },
    {
      id: 'c15-s7',
      name: 'Quicklime',
      enemies: {
        front: [QUICKLIME_SERJEANT, ROADGAUNT_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, WISP, SEPULCHRE_HOUND],
      },
      level: 303,
      gear: { grade: 3, level: 47 },
    },
    {
      id: 'c15-s8',
      name: 'The Step Does Not Break',
      enemies: {
        front: [IRONWAKE_VANGUARD, SEPULCHRE_HOUND],
        back: [ROADGAUNT_OUTRIDER, TALLOWLIGHT_RUNNER, WISP],
      },
      level: 304,
      gear: { grade: 3, level: 47 },
    },
    {
      // ⚠️ A probe sample, and the band's heaviest front rank before the mini-boss.
      id: 'c15-s9',
      name: 'How Far There Is Left',
      enemies: {
        front: [QUICKLIME_SERJEANT, NIGHTMARCH_OUTRIDER],
        back: [TALLOWLIGHT_RUNNER, ROADGAUNT_OUTRIDER, PLUMBLINE_HAND],
      },
      level: 304,
      gear: { grade: 3, level: 48 },
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **Not a probe sample** — the stride's
      // phase puts none of this chapter's four mini-bosses on it, so their weight is authored
      // against the boards either side rather than against the probe.
      id: 'c15-s10',
      name: 'The Tallyman',
      enemies: {
        front: [THE_TALLYMAN, CORTEGE_LANCER],
        back: [ROADGAUNT_OUTRIDER, TALLOWLIGHT_RUNNER, NIGHTMARCH_OUTRIDER],
      },
      level: 305,
      gear: { grade: 3, level: 49 },
    },

    // -----------------------------------------------------------------------------------
    // The ranks — stages 11 to 20, levels 305 to 310, Masterwork 50 to 57
    //
    // The lock: volume and sameness. {@link UNDERROAD_RANKER} is the plainest stat block in the
    // chapter — no reach, no status, no condition — and it is on **all ten** of these boards, as is
    // {@link STEPFALL_STANDARD}; counted, they are on seventeen and sixteen of the fifty.
    // {@link STEPFALL_STANDARD} is what makes that a band rather than a filler run:
    // {@link DRESS_THE_RANKS} puts {@link RALLY} across the column every fifty-five ticks against
    // the status's own forty-five, so a sixth of every cycle is a window where the board is only
    // what its stat block says.
    //
    // ⚠️ **Unconditioned, and specifically not conditioned on the column being hurt.** A body that
    // sharpens itself as it is wounded is the offensive spelling of the one defensive shape nobody
    // may author.
    //
    // ⚠️ **A buff on the enemy side is not the flat synergy bonus this project forbids.** That rule
    // is about a bonus a party gets for its own composition, which asks nothing of the encounter.
    // This is a body standing in a rank, and deleting it turns the bonus off.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample, so it is allowed to state the lock plainly.
      id: 'c15-s11',
      name: 'Somebody Is Still Dressing the Ranks',
      enemies: {
        front: [CAIRNWARD_HUSK, UNDERROAD_RANKER],
        back: [STEPFALL_STANDARD, BARROWMIST_KEENER, ROADGAUNT_OUTRIDER],
      },
      level: 305,
      gear: { grade: 3, level: 50 },
    },
    {
      id: 'c15-s12',
      name: 'One of the Ranks',
      enemies: {
        front: [UNDERROAD_RANKER, GRAVEWAKE_THRALL],
        back: [STEPFALL_STANDARD, WISP, PLUMBLINE_HAND],
      },
      level: 306,
      gear: { grade: 3, level: 51 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c15-s13',
      name: 'The Column Closes Up',
      enemies: {
        front: [IRONWAKE_VANGUARD, UNDERROAD_RANKER],
        back: [STEPFALL_STANDARD, BARROWMIST_KEENER, DEEPROCK_MINER],
      },
      level: 306,
      gear: { grade: 3, level: 51 },
    },
    {
      id: 'c15-s14',
      name: 'Nothing Here Is a Problem',
      enemies: {
        front: [UNDERROAD_RANKER, MARCHWARD_PIKEMAN],
        back: [STEPFALL_STANDARD, SEPULCHRE_HOUND, WISP],
      },
      level: 307,
      gear: { grade: 3, level: 52 },
    },
    {
      id: 'c15-s15',
      name: 'The Standard Has Not Been Lowered',
      enemies: {
        front: [CAIRNWARD_HUSK, CORTEGE_LANCER],
        back: [STEPFALL_STANDARD, UNDERROAD_RANKER, BARROWMIST_KEENER],
      },
      level: 307,
      gear: { grade: 3, level: 53 },
    },
    {
      id: 'c15-s16',
      name: 'Rank After Rank',
      enemies: {
        front: [GRAVEWAKE_THRALL, UNDERROAD_RANKER],
        back: [STEPFALL_STANDARD, TALLOWLIGHT_RUNNER, DEEPROCK_MINER],
      },
      level: 308,
      gear: { grade: 3, level: 54 },
    },
    {
      // ⚠️ A probe sample, and the band's heaviest front rank.
      id: 'c15-s17',
      name: 'Told to Keep Walking',
      enemies: {
        front: [CHARNEL_DRUDGE, MARCHWARD_PIKEMAN],
        back: [STEPFALL_STANDARD, UNDERROAD_RANKER, CORTEGE_LANCER],
      },
      level: 308,
      gear: { grade: 3, level: 54 },
    },
    {
      id: 'c15-s18',
      name: 'The Same Face Again',
      enemies: {
        front: [UNDERROAD_RANKER, CAIRNWARD_HUSK],
        back: [STEPFALL_STANDARD, BARROWMIST_KEENER, COLDFORGE_HAND],
      },
      level: 309,
      gear: { grade: 3, level: 55 },
    },
    {
      id: 'c15-s19',
      name: 'Counting Them Does Not Help',
      enemies: {
        front: [GRAVEWAKE_THRALL, CHARNEL_DRUDGE],
        back: [STEPFALL_STANDARD, UNDERROAD_RANKER, ROADGAUNT_OUTRIDER],
      },
      level: 309,
      gear: { grade: 3, level: 56 },
    },
    {
      // Mini-boss. The lieutenant behind the standard: the party's swing is slowed and the rank it
      // was aimed at is sharpened on the same board.
      id: 'c15-s20',
      name: 'Dressed, and Still Walking',
      enemies: {
        front: [THE_TALLYMAN, UNDERROAD_RANKER],
        back: [STEPFALL_STANDARD, CAIRNWARD_HUSK, BARROWMIST_KEENER],
      },
      level: 310,
      gear: { grade: 3, level: 57 },
    },

    // -----------------------------------------------------------------------------------
    // The drum — stages 21 to 30, levels 310 to 315, Masterwork 58 to 64
    //
    // The lock: tempo said as a **turn**. {@link KEEP_THE_STEP} puts {@link HASTE} across the
    // drummer's whole side every sixty ticks against the status's own forty-five, so a quarter of
    // each cycle is silence.
    //
    // ⚠️ **Tempo and weight are not interchangeable, which is why this is a band rather than a
    // stat.** `haste` buys *turns*, so a third more of it is a third more of everything the column
    // was ever going to do — the same arithmetic that makes {@link SLOW} the most quietly powerful
    // debuff in the game, read in the other direction.
    //
    // ⚠️ **And it sits on the softest legendary the chapter fields** — 560 health and 16 `def`, in
    // the back rank — because a tempo whose source the party cannot delete is a clock rather than a
    // lock. Same placement rule as chapter 14's ward and for the same reason.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample, which is the harder of the two jobs: it may not
      // read as a step down from `c15-s19`. So it opens on the band's own caster behind the band
      // above's weight at full strength rather than easing into it.
      id: 'c15-s21',
      name: 'Deadpace',
      enemies: {
        front: [CHARNEL_DRUDGE, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, UNDERROAD_RANKER, BARROWMIST_KEENER],
      },
      level: 310,
      gear: { grade: 3, level: 58 },
    },
    {
      id: 'c15-s22',
      name: 'Keeping Time for Nobody',
      enemies: {
        front: [CAIRNWARD_HUSK, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, HAG, DEEPROCK_MINER],
      },
      level: 311,
      gear: { grade: 3, level: 58 },
    },
    {
      id: 'c15-s23',
      name: 'The Drum Under the Hill',
      enemies: {
        front: [CORTEGE_LANCER, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, GRAVEMOURN_KEEPER, DEEPGALLERY_RUNNER],
      },
      level: 311,
      gear: { grade: 3, level: 59 },
    },
    {
      id: 'c15-s24',
      name: 'A Quarter of Every Cycle',
      enemies: {
        front: [MILEWORN_HUSK, GRAVEWAKE_THRALL],
        back: [DEADPACE_DRUMMER, HAG, PLUMBLINE_HAND],
      },
      level: 312,
      gear: { grade: 3, level: 60 },
    },
    {
      // ⚠️ A probe sample, and the band's first fast front rank — the outriders' register standing
      // behind the drummer that makes it worse.
      id: 'c15-s25',
      name: 'Faster Than the Party',
      enemies: {
        front: [NIGHTMARCH_OUTRIDER, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, TALLOWLIGHT_RUNNER, DEEPGALLERY_RUNNER],
      },
      level: 312,
      gear: { grade: 3, level: 61 },
    },
    {
      id: 'c15-s26',
      name: 'The Silence Between',
      enemies: {
        front: [CHARNEL_DRUDGE, UNDERROAD_RANKER],
        back: [DEADPACE_DRUMMER, GRAVEMOURN_KEEPER, BRACEWORK_DELVER],
      },
      level: 313,
      gear: { grade: 3, level: 61 },
    },
    {
      id: 'c15-s27',
      name: 'Quickstep',
      enemies: {
        front: [QUICKLIME_SERJEANT, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, HAG, PLUMBLINE_HAND],
      },
      level: 313,
      gear: { grade: 3, level: 62 },
    },
    {
      id: 'c15-s28',
      name: 'It Was Told to Hold the Pace',
      enemies: {
        front: [IRONWAKE_VANGUARD, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, GRAVEMOURN_KEEPER, COLDFORGE_HAND],
      },
      level: 314,
      gear: { grade: 3, level: 63 },
    },
    {
      // ⚠️ A probe sample, and the last board before the third mini-boss.
      id: 'c15-s29',
      name: 'Two Beats and a Gap',
      enemies: {
        front: [MILEWORN_HUSK, CAIRNWARD_HUSK],
        back: [DEADPACE_DRUMMER, DEEPLAMP_SEALER, HAG],
      },
      level: 314,
      gear: { grade: 3, level: 64 },
    },
    {
      // Mini-boss. The lieutenant on a board that is already faster than the party, so the answer
      // found on `c15-s10` — spend a body and the count stops — costs more here.
      id: 'c15-s30',
      name: 'The Count and the Cadence',
      enemies: {
        front: [THE_TALLYMAN, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, GRAVEMOURN_KEEPER, UNDERROAD_RANKER],
      },
      level: 315,
      gear: { grade: 3, level: 64 },
    },

    // -----------------------------------------------------------------------------------
    // The train — stages 31 to 40, levels 315 to 320, Masterwork 65 to 72
    //
    // The lock: what the column picked up. {@link PUT_IT_ON_THE_CART} names `enemy-lowest` — ⚠️ **a
    // _selection_ rather than a reach or a scope**, which is a different question from
    // {@link AHEAD_OF_THE_COLUMN}'s `enemy-back`. Saying which of the three a claim is about is the
    // correction four sessions have now had to make after the fact, so this band says it twice.
    //
    // It punishes a party that spread its damage and left five bodies half-standing — which is
    // exactly the shape the drum band above it rewards, so the two bands ask opposite things of the
    // same party.
    //
    // ⚠️ **This is where the Dwarf texture is thickest, at thirteen slots of fifty.** The hold's
    // dead are in the column now, and they are carrying the lamps they were sealed in with.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample.
      id: 'c15-s31',
      name: 'The Train',
      enemies: {
        front: [HOLLOWCART_DROVER, MARCHWARD_PIKEMAN],
        back: [LAMPLESS_PILGRIM, DEEPLAMP_SEALER, BARROWMIST_KEENER],
      },
      level: 315,
      gear: { grade: 3, level: 65 },
    },
    {
      id: 'c15-s32',
      name: 'Whatever Stops Walking',
      enemies: {
        front: [HOLLOWCART_DROVER, CHARNEL_DRUDGE],
        back: [LAMPLESS_PILGRIM, IRONSLING_WRIGHT, WISP],
      },
      level: 316,
      gear: { grade: 3, level: 66 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c15-s33',
      name: 'What the Hold Gave Up',
      enemies: {
        front: [DEEPLAMP_SEALER, HOLLOWCART_DROVER],
        back: [LAMPLESS_PILGRIM, GRAVETIDE_HERALD, MILEWORN_HUSK],
      },
      level: 316,
      gear: { grade: 3, level: 67 },
    },
    {
      id: 'c15-s34',
      name: 'The Lamps Went With Them',
      enemies: {
        front: [MARCHWARD_PIKEMAN, UNDERROAD_RANKER],
        back: [DEEPLAMP_SEALER, LAMPLESS_PILGRIM, HOLLOWCART_DROVER],
      },
      level: 317,
      gear: { grade: 3, level: 68 },
    },
    {
      id: 'c15-s35',
      name: 'On the Cart',
      enemies: {
        front: [HOLLOWCART_DROVER, CAIRNWARD_HUSK],
        back: [LAMPLESS_PILGRIM, DEADPACE_DRUMMER, IRONSLING_WRIGHT],
      },
      level: 317,
      gear: { grade: 3, level: 68 },
    },
    {
      id: 'c15-s36',
      name: 'It Picked Up the Watch',
      enemies: {
        front: [COLDFORGE_HAND, HOLLOWCART_DROVER],
        back: [DEEPLAMP_SEALER, LAMPLESS_PILGRIM, WISP],
      },
      level: 318,
      gear: { grade: 3, level: 69 },
    },
    {
      // ⚠️ A probe sample. The train's finisher behind the ranks band's standard: the column is
      // sharpened and the softest body on the party's side is named.
      id: 'c15-s37',
      name: 'Half-Standing',
      enemies: {
        front: [HOLLOWCART_DROVER, GRAVEWAKE_THRALL],
        back: [LAMPLESS_PILGRIM, STEPFALL_STANDARD, IRONSLING_WRIGHT],
      },
      level: 318,
      gear: { grade: 3, level: 70 },
    },
    {
      id: 'c15-s38',
      name: 'The Handle and No Lamp',
      enemies: {
        front: [CHARNEL_DRUDGE, HOLLOWCART_DROVER],
        back: [LAMPLESS_PILGRIM, DEEPLAMP_SEALER, HAG],
      },
      level: 319,
      gear: { grade: 3, level: 71 },
    },
    {
      id: 'c15-s39',
      name: 'The Cart Is What It Is For',
      enemies: {
        front: [HOLLOWCART_DROVER, MILEWORN_HUSK],
        back: [LAMPLESS_PILGRIM, IRONSLING_WRIGHT, GRAVEMOURN_KEEPER],
      },
      level: 319,
      gear: { grade: 3, level: 71 },
    },
    {
      // Mini-boss, and the lieutenant's last appearance — fifteen levels above where the party first
      // met it, with the train standing behind it. Its turn is still conditioned on all five of the
      // party being up, so a party that has already traded a body never sees it here.
      id: 'c15-s40',
      name: 'Everything the Road Took',
      enemies: {
        front: [THE_TALLYMAN, HOLLOWCART_DROVER],
        back: [LAMPLESS_PILGRIM, PLUMBLINE_HAND, UNDERROAD_RANKER],
      },
      level: 320,
      gear: { grade: 3, level: 72 },
    },

    // -----------------------------------------------------------------------------------
    // The head of the column — stages 41 to 50, levels 320 to 325, Masterwork 73 to 80
    //
    // All four locks at once, and the Masterwork set at the top of its own ladder. Nothing new is
    // asked above this line: what changes is that every board carries two of the four at the same
    // time, and the front rank stops being anything the party can go through quickly.
    //
    // ⚠️ **The hold runs out**, which is the fiction and the arithmetic at once: counted, the five
    // bands carry **4, 6, 8, 13 and 6** Dwarf slots. Whatever the column picked up on the way is
    // behind it now, and the head of the column never went through anybody's door.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample — the third of the three, and the same job as
      // `c15-s21`. So it opens on the band's heaviest legendary and the train's finisher at once.
      id: 'c15-s41',
      name: 'The Head of the Column',
      enemies: {
        front: [HEADSMAN, HOLLOWCART_DROVER],
        back: [DEADPACE_DRUMMER, STEPFALL_STANDARD, LAMPLESS_PILGRIM],
      },
      level: 320,
      gear: { grade: 3, level: 73 },
    },
    {
      id: 'c15-s42',
      name: 'Since Before the Gate Was Shut',
      enemies: {
        front: [BONECHAIN_WARDEN, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, LAMPLESS_PILGRIM, ROADGAUNT_OUTRIDER],
      },
      level: 321,
      gear: { grade: 3, level: 74 },
    },
    {
      id: 'c15-s43',
      name: 'No End to It',
      enemies: {
        front: [HEADSMAN, UNDERROAD_RANKER],
        back: [STEPFALL_STANDARD, DEADPACE_DRUMMER, LAMPLESS_PILGRIM],
      },
      level: 321,
      gear: { grade: 3, level: 75 },
    },
    {
      id: 'c15-s44',
      name: 'The Road Goes Under',
      enemies: {
        front: [HOLLOWCART_DROVER, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, LAMPLESS_PILGRIM, DEEPLAMP_SEALER],
      },
      level: 322,
      gear: { grade: 3, level: 75 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c15-s45',
      name: 'Ahead, and Ahead',
      enemies: {
        front: [BONECHAIN_WARDEN, HOLLOWCART_DROVER],
        back: [STEPFALL_STANDARD, DEADPACE_DRUMMER, TALLOWLIGHT_RUNNER],
      },
      level: 322,
      gear: { grade: 3, level: 76 },
    },
    {
      id: 'c15-s46',
      name: 'Nothing Is Counting Any More',
      enemies: {
        front: [HEADSMAN, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, LAMPLESS_PILGRIM, PLUMBLINE_HAND],
      },
      level: 323,
      gear: { grade: 3, level: 77 },
    },
    {
      // ⚠️ A probe sample, and the last of the band's three.
      id: 'c15-s47',
      name: 'The Last Rank',
      enemies: {
        front: [BONECHAIN_WARDEN, HOLLOWCART_DROVER],
        back: [STEPFALL_STANDARD, DEADPACE_DRUMMER, ROADGAUNT_OUTRIDER],
      },
      level: 323,
      gear: { grade: 3, level: 78 },
    },
    {
      id: 'c15-s48',
      name: 'It Has Never Finished',
      enemies: {
        front: [HEADSMAN, UNDERROAD_RANKER],
        back: [DEADPACE_DRUMMER, LAMPLESS_PILGRIM, PLUMBLINE_HAND],
      },
      level: 324,
      gear: { grade: 3, level: 78 },
    },
    {
      // ⚠️ A probe sample, and the last board before the final. The chapter's own list in full, one
      // level below the thing the list has been describing.
      id: 'c15-s49',
      name: 'The Unnumbered in the Dark',
      enemies: {
        front: [HEADSMAN, MILEWORN_HUSK],
        back: [DEADPACE_DRUMMER, STEPFALL_STANDARD, ROADGAUNT_OUTRIDER],
      },
      level: 324,
      gear: { grade: 3, level: 79 },
    },
    {
      // The chapter final. ⚠️ **One `ascended` anchor and four legendaries**, which is the shape
      // chapters 9 through 14 all settled on — the lieutenant is deliberately absent, because a
      // second anchor beside a boss is the sharpest non-linear weight step this game can author, and
      // at this chapter's sixty-five level gap it is a cliff rather than a step.
      //
      // The drum's cadence, the train's finisher and both outriders. What The Unnumbered adds is
      // {@link THERE_IS_NO_END_TO_IT} — the whole party hit and slowed on a seventy-tick cadence,
      // and **unconditioned**, unlike {@link THE_COUNT_DOES_NOT_STOP} below it, so the answer the
      // chapter taught does not work here.
      //
      // ⚠️ **{@link STEPFALL_STANDARD} is deliberately not on this board, and the measurement is
      // why.** Its {@link RALLY} is ×1.3 `atk` across all five, which on a board already at the
      // budget is worth more than the boss's entire stat line: with the standard on it, the final
      // reads **0% with nobody standing** at every boss weight from 880/54 down to 520/34; with the
      // runner in its place at 680/40 it reads **100% with 3.55 alive at 21.4s**. The closing band
      // states the ranks; the final does not restate them.
      //
      // ⚠️ **It restores nothing and drains nothing**, and that is the one absolute claim the
      // chapter makes about a single board's anchor. No `recovery`, no `healthRegen`, no
      // `lifeLeech`, and no heal, drain or pool in its own kit. The only leech on any board in the
      // closing band is {@link HEADSMAN}'s, and it is not on this one.
      //
      // ⚠️ **No stat on this board steps past its shipped register.** 680 health and 40 attack sit
      // under every chapter final in the game, and `haste: 100` sits at the pool's median. The
      // chapter's fastest body is {@link WISP} at 148 — a returning block — against a pool ceiling
      // of 152, and the fastest block this chapter *authors* is {@link TALLOWLIGHT_RUNNER} at 144.
      // So unlike The Doorstone's `def: 70` there is nothing here authored above what has shipped.
      id: 'c15-s50',
      name: 'The Unnumbered',
      enemies: {
        front: [THE_UNNUMBERED, HOLLOWCART_DROVER],
        back: [DEADPACE_DRUMMER, LAMPLESS_PILGRIM, TALLOWLIGHT_RUNNER],
      },
      level: 325,
      gear: { grade: 3, level: 80 },
    },
  ],
} as const;
