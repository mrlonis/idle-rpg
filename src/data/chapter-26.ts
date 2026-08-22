import {
  BAREMARK_GNAWER,
  BOAR,
  BREAKSTONE_WARDEN,
  CHALKHIDE_BROWSER,
  CHANNELBED_STALKER,
  DEEPSET_ANVILWARD,
  GOLEM,
  HAMMERTIDE_LURCHER,
  HEADRACE_HAND,
  ILLFALL_SKULKER,
  LONGSTRIDE_RAVENER,
  LOOSEGROUND_RAVENER,
  MIREFOOT_RUNNER,
  NEVERMARK_KEEPER,
  ODDSTONE_HERALD,
  QUICKMIRE_SKIMMER,
  ROUGHCAST_GNAWER,
  SALTBLEACH_CRIER,
  SCATTERSTONE_HOWLER,
  SETSTONE_DRUDGE,
  SHALEBED_CRAWLER,
  SHARPSTONE_COURSER,
  SILTBANK_HULK,
  SILTWAKE_DARTER,
  SLIME,
  SPINEDRIFT_LANCER,
  THE_ILLMET,
  THE_LATECOMER,
  THE_MISCHANCE,
  THE_NEVERMARK,
  THORNBACK_GRAZER,
  UNMARKED_WARDEN,
} from './enemies';

/**
 * Chapter 26 — The Roughcast.
 *
 * **Sixty stages**, enemy levels 605 to 635. It **opens at the level chapter 25 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Thinground did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, the longebb whether it **still holds its value**, the downstroke whether
 * it **arrives all at once**, the evenfall whether it **ever lands well**, the nevermark whether
 * anything it does **takes hold**, and the thinground whether there is **anyone left to spend it**.
 * This one asks whether any of it **can be counted on**.
 *
 * ⚠️ **The Thinground asked about attrition and this one asks about variance, which is the
 * distinction.** Ground cast up and left, where a course laid true one day has gone over the next —
 * and what the party meets is not more damage but damage it cannot plan around. The chapter is
 * authored on enemy `critChance` for that reason and no other.
 *
 * | Band                | Stages | Levels  | The lock it teaches                                     |
 * | ------------------- | ------ | ------- | ------------------------------------------------------- |
 * | The plain ground    | 1–10   | 605–610 | the habit: level work, and almost nothing going wrong   |
 * | The first ill throw | 11–20  | 610–615 | the first carrier, at the shipped p90                   |
 * | The set odds        | 21–30  | 615–620 | the p90 on most of the board — {@link SCATTERSTONE_HOWLER} |
 * | The turned stone    | 31–40  | 620–625 | past the Monster ceiling — {@link SHARPSTONE_COURSER}   |
 * | The long odds       | 41–50  | 625–630 | past the whole shipped register — {@link ODDSTONE_HERALD} |
 * | The roughcast       | 51–60  | 630–635 | the pairing, and the roof — {@link BREAKSTONE_WARDEN}   |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied for the fourth chapter running and for a sharper reason than any chapter before it:
 * `critChance` sat on **378 of 378 shipped blocks** at a median of 0.10, a p75 of 0.12 and a p90 of
 * 0.15 **before this chapter**. There is no such thing as a board without it, so "the ill throw arrives in band 2" cannot be
 * a claim about *presence*. Measured over the shipped boards, bodies per board at or above **0.15**
 * run **0–1, 1–2, 2–3, 3, 3–4, 4** across the six bands; at or above **0.18** they run **0–1, 0–1,
 * 0–2, 0–2, 1–3, 3–4**; and at or above **0.20**, **0–1, 0–1, 0–1, 0–1, 1–2, 1–3**. The highest
 * `critChance` on any board runs **0.20, 0.20, 0.20, 0.20, 0.24, 0.28** band by band.
 * ⚠️ **It also forced a block to be authored at the median rather than above it**:
 * {@link ROUGHCAST_GNAWER} carries exactly 0.10, because it and {@link SHALEBED_CRAWLER} take
 * sixteen of band 1's fifty slots between them and the counts have to mean what they say.
 *
 * ⚠️ **The axis runs *past* its own lean's register, and that is the answer rather than a
 * formality.** ⚠️ **Every figure here is the register this chapter was measured *against*, not the
 * one it leaves behind** — the Dwarf fourth hundred's rule, because a session's own blocks move the
 * register it is citing. Before The Roughcast the ceiling was **0.30, on a single Demon block**, 11
 * blocks sat at or above 0.18 and 5 at or above 0.20, and **Monster carried 16 of the 44 blocks at
 * or above 0.15 — more than any other faction — at a faction ceiling of 0.18.** Shipping these ten
 * takes the pool to 388, the p90 to 0.16, those counts to 17 and 10, and the Monster ceiling to this
 * chapter's own 0.28; a header quoting those would claim a register the chapter itself created. So bands 1 to 4 sit inside the Monster
 * register and bands 5 and 6 step past it, with only {@link THE_MISCHANCE} at 0.28 near the pool
 * ceiling. That is the Monster Tower's `physicalResist` shape rather than the Elf Tower's
 * `critChance` one, and a later session should be able to see which of the two it is looking at.
 *
 * ⚠️ **No board restores anything, and this is the first chapter that can make the claim absolutely.**
 * `recovery` appears on **0 of 60** boards, `lifeLeech` on **0 of 60**, `healthRegen` on **0 of 60**,
 * a `heal`, `drain` or `shield` effect on **0 of 60**, and a `regen`, `barrier` or `aegis` status on
 * **0 of 60** — five separate counts rather than one word, because `recovery`, `lifeLeech`,
 * `healthRegen` and a `regen` status are four different things and naming them together is how five
 * sessions running shipped a false claim. Chapter 25 could only say "three of sixty"; the trimmed
 * roster here happens to carry none at all, and it was **checked rather than assumed**.
 *
 * ⚠️ **No board fields two `enemy-back` turns and no board fields two board-wide ones**, both
 * checked mechanically over all sixty and over the **fielded** bodies rather than the new ones —
 * which is the check chapter 24 shipped false by running it over its own new blocks alone.
 *
 * ## The rung stays on `ascended`, and the seam goes degenerate again
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 25's seam of **4.8443** and The Roughcast's close of 635, `ascended` reads **2.5971**
 * (|Δln| **0.6234**) and `ascended-1` **33.2031** (|Δln| **1.9248**). **The rule prefers staying put
 * by 1.30 nats** — the widest margin any chapter has had — and there is nothing to override toward:
 * chapter 25 recorded that `ascended` is the last rung whose cap the ladder has not already climbed
 * past, so every rung above it is a walkover by construction rather than by tuning.
 *
 * ⚠️ **This is the first chapter since that became true, and what it means is that the rung question
 * is over.** From here a chapter that cannot be authored on `ascended` is a `data/` question about
 * `LEVEL_CURVE.caps` rather than a chapter. **The pool says this one can**: fielded as an ordinary
 * body beside four light escorts at level 635, **246 of 378 shipped blocks stand**, across all seven
 * factions and 47 of them Monster — measured by *fielding* rather than by filtering, which is
 * chapter 24's correction. There was no pool wall to argue about.
 *
 * ## ⚠️ The party is literally unchanged, so thirty levels of board is the whole difficulty
 *
 * `ascended` caps at 500 and chapters 25 and 26 both close above it, so `THINGROUND` and `INVESTED`
 * are **the same five combatants at the same level at the same rung** — the degenerate chain
 * re-forming exactly where chapter 25 predicted it would. Equal *absolute* weight is therefore equal
 * difficulty, and the chapter below's price table transfers at **0.536×** the common-equivalent
 * figure. That is the one case where a measured table carries forward, and it was spot-checked
 * rather than assumed.
 *
 * What it costs is that thirty levels of board climb against a frozen party is a straight ×1.8654 of
 * squeeze. Refielding chapter 25's own boards at this chapter's levels: `c25-s60` reads 100% with
 * 3.95 of five at 605 and **0%** at 615; `c25-s30` reads 100% / 5.00 at 605 and **40% / 0.82** at
 * 635. So these boards are authored *lighter* than The Thinground's while standing thirty levels
 * higher — **3,174 to 5,089 common-equivalent** against chapter 25's 3,180 to 8,616, on ten new
 * blocks running **300 to 1,100 authored health** and **13 to 34 attack** where chapter 25's ran
 * 420 to 1,350 and 16 to 58.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an `ascended` anchor of 300/14 behind four bodies of
 * 620/34, each carrying one ordinary turn, at level 620 and Relic 100: **4,335 common-equivalent,
 * reading 4.28 of five at 13.2s**, and it **moves** (3.95 at escort attack 34, 2.25 at 38, 0.72 at
 * 40). Zero timeouts on every row.
 *
 * | shape                                          | survivors           | worth              | mean fight   |
 * | ---------------------------------------------- | ------------------- | ------------------ | ------------ |
 * | `critChance` 0.12 → 0.45 across five           | 3.02 → 0.00         | 0.20 → **3.23**    | 22.9 → 40.3s |
 * | `dodge` 0.04 → 0.28 across five                | 3.05 → 0.30         | 0.18 → 2.93        | 24.4 → 39.3s |
 * | `critDamageAmp` 1.15 across five               | 2.92                | 0.30               | 23.2s        |
 * | `insight` 0.32 across five                     | 3.13                | 0.10               | 23.1s        |
 * | `accuracy` 1.25 across five                    | 3.20                | 0.02               | 22.7s        |
 * | `magicPierce` 0.40 across five                 | 3.23                | **0.00**           | 23.1s        |
 * | `energyRegen` 7 across five                    | 3.27                | **−0.05**          | 23.0s        |
 * | `attackSpeed` 60 / `haste` 120 across five     | 0.00                | total wipe         | 19.7 / 29.2s |
 *
 * 1. ⚠️ **Nine monotone steps in value and six in carrier count, with zero timeouts.** By value it
 *    reads 0.20 / 0.60 / 0.88 / 1.13 / 1.80 / 1.95 / 2.45 / 2.65 / 3.23 across 0.12 → 0.45; by
 *    carrier count at 0.28 it reads 0.02 / 0.08 / 0.25 / 0.65 / 1.18 / 1.78 at zero through five.
 *    **When every other reading is a cliff, look for the one stat that grades** keeps being the rule
 *    that finds a chapter — `lifeLeech` at 21, `tenacity` at 24, `physicalPierce` at 25, this.
 * 2. ⚠️ **The licence is the register read from the *party's* side, and it is chapter 23 inverted.**
 *    That chapter priced complete crit *denial* at 0.88 of one member because only two of the
 *    calibrated five carry crit worth denying. The same five carry `critBlock` **Σ0.05**,
 *    `critDamageResist` **Σ0.15** and `tenacity` **Σ0.00** — so the identical stat that saturated as
 *    a lock grades as a threat. **Two chapters may share a stat name when they do not share the
 *    argument; say which side of the board you measured.**
 * 3. ⚠️ **`insight` is not a crit stat and reading the code rather than the name is what caught it.**
 *    `statusChance` computes `authored + insight − tenacity`, so `insight` is the offensive mirror of
 *    chapter 24's axis and says nothing about a critical hit. On a board carrying no hostile status
 *    it is worth 0.10 — noise. `magicPierce` is worth **exactly 0.00** for the neighbouring reason
 *    from `damage.ts`: a pierce only ever opens the defence its own damage type is checked against,
 *    and these boards deal physical damage.
 * 4. ⚠️ **`critChance` is the rare axis the difficulty probe can see**, because it is throughput
 *    rather than refusal. Chapter 24's `tenacity` lock was invisible to the probe and cost that
 *    chapter a band opener at 0.792 against the 0.85 bar; nothing here needed that repair for the
 *    same reason, and the two sampled stages that did dip were fixed by throughput rather than by
 *    weight.
 *
 * ## ⚠️ Three things the boards found that the control did not
 *
 * 1. ⚠️ **Two heavy bodies in one front rank is chapter 19's failure, and it has a campaign instance
 *    now.** A first pass put the heaviest two of every board in front; `c26-s51` read 95% with 3.15
 *    and `c26-s54` read **8% with 0.20** — and **removing any single body from either fixed it**,
 *    which is the tell that it is the arrangement rather than a block. Moving the second-heaviest
 *    body to the back rank took both to 100% with 4.00. ⚠️ **But the swap is not a rule**: applied
 *    to all sixty it broke `c26-s58` (63% / 1.50) and the final (**0%**). **The rank each body takes
 *    is per-board tuning and was settled by measuring every arrangement of every board**, which is
 *    the Demon fifth hundred's finding arriving on a chapter.
 * 2. ⚠️ **The final's control moves, and its stat line is a plateau with a cliff two steps past it.**
 *    Behind its shipped escort {@link THE_MISCHANCE} grades 4.00 / 4.00 / 4.00 / 4.00 / 3.95 /
 *    **0.42** across 240/9, 290/11, 340/13, 400/15, 470/18 and 560/22. The escort is what moves it:
 *    held at 340/13, a heavier escort of four reads **0%** and four light bodies read 4.03. It ships
 *    at **340/13**, reading 100% with 4.00 of five at **37.2s** — the longest fight in the chapter
 *    against a next-longest of 29.1s, which is the only thing that separates the final from the
 *    thirty other boards the survivor metric also calls 4.00.
 * 3. ⚠️ **The 25% quota failed on the first authored pass and the cause was the denominator.** The
 *    boards fielded **47** distinct archetypes against chapter 25's 33, which took eight new blocks
 *    to **17.8%** of ordinary archetypes. Nothing about the blocks was wrong; the returning roster
 *    was too wide. Trimming it to sixteen Monster and six Dwarf returning blocks took the chapter to
 *    **26.7%** with the boards otherwise untouched. **The quota is a constraint on how many
 *    *different* things a chapter fields, not on how much is new.**
 *
 * ## What the sixty boards read
 *
 * Against the party the chapter is tuned for, every board reads **100%** with **zero timeouts**. The
 * lowest survivor count anywhere is **3.73**, the six band representatives read 5.00 / 5.00 / 5.00 /
 * 4.00 / 4.00 / 4.00, the final reads 4.00, and **the longest fight in the chapter is 39.6s** against
 * a 72s bar. The lieutenant grades **5.00 / 5.00 / 5.00 / 4.00 / 4.00** across its five appearances,
 * settled by fielding all five rather than the first. The spine runs **494,688 → 1,145,556** across
 * the sixteen sampled stages, ×2.32, with a worst adjacent ratio of **0.918**.
 *
 * ## The lean, and what it costs
 *
 * - **Monster, at 90.0% of board slots** — in family, between The Underroad's 86.4% and The
 *   Rustwood's 92%. Monster was **not** the thinnest legal lead: the reading before this chapter was
 *   demon 33, angel 36, **human 54**, monster 61, elf 61, dwarf 66, undead 67, and this takes Monster
 *   to 69. ⚠️ **Human was passed over on recency rather than on depth** — it led The Downstroke four
 *   chapters ago, its third lead — where Monster last led The Longebb five chapters back. **Say which
 *   of the two arguments you used**, because the depth ordering alone would have picked Human. It is
 *   the second chapter running to be decided by the rotation.
 * - ⚠️ **The depth table in [authoring](../../docs/authoring.md) was four tower hundreds out of
 *   date**, reading angel 24 / demon 25 where the pool now holds 36 and 33. **Recompute before
 *   choosing; do not read the table.**
 * - **Monster is also the one lean that costs the faction matchup nothing** — `FACTION_MATCHUPS`
 *   gives every faction ×1.05 into Monsters and Monsters ×1.05 into all seven, so a 90% Monster pool
 *   still reads differently to every party. No other faction has this property.
 * - **The non-lean texture is Dwarf: the work that was supposed to hold.** It thins monotonically
 *   across the bands — **9, 7, 5, 4, 3, 2** slots — which is The Spoilfield's shape doing a fiction's
 *   job, and it is the half of the board that carries **no** crit worth the name: the six Dwarf blocks
 *   run **0.06 to 0.10**, every one at or below the shipped median, where the sixteen returning
 *   Monster blocks run 0.02 to 0.18 and supply every carrier the bands ask for.
 * - **32 distinct archetypes fielded, ten of them new** — **26.7%** of ordinary archetypes under the
 *   shipped rule (8 of 30) and **31.3%** counting the lieutenant and the boss inside the fraction.
 *   The quota lands at the quota for the seventh chapter running.
 * - ⚠️ **The `gearArchetype` bill was zero for the seventh chapter running, and this time
 *   structurally.** All **378** shipped blocks carried one before this chapter and all **388** do
 *   after it — chapter 25 recorded nine Undead blocks without, and the tower sessions since have
 *   paid it off. **The bill is no longer a fact about the lean; there is nothing left to owe.**
 */

export const CHAPTER_26 = {
  id: 'chapter-26',
  name: 'The Roughcast',
  stages: [
    {
      id: 'c26-s1',
      name: 'The Plain Ground',
      enemies: {
        front: [SHALEBED_CRAWLER, ROUGHCAST_GNAWER],
        back: [THE_NEVERMARK, BOAR, MIREFOOT_RUNNER],
      },
      level: 605,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s2',
      name: 'Nothing Underfoot',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [ROUGHCAST_GNAWER, NEVERMARK_KEEPER, SPINEDRIFT_LANCER],
      },
      level: 606,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s3',
      name: 'Where The Work Stopped',
      enemies: {
        front: [SHALEBED_CRAWLER, SETSTONE_DRUDGE],
        back: [SILTBANK_HULK, SLIME, SALTBLEACH_CRIER],
      },
      level: 606,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s4',
      name: 'A Level Enough Place',
      enemies: {
        front: [SHALEBED_CRAWLER, MIREFOOT_RUNNER],
        back: [ROUGHCAST_GNAWER, THE_NEVERMARK, BOAR],
      },
      level: 607,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s5',
      name: 'The Course As Laid',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [ROUGHCAST_GNAWER, NEVERMARK_KEEPER, HAMMERTIDE_LURCHER],
      },
      level: 607,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s6',
      name: 'Set And Left',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [BOAR, SETSTONE_DRUDGE, SPINEDRIFT_LANCER],
      },
      level: 608,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s7',
      name: 'What The Dwarves Laid',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [ROUGHCAST_GNAWER, UNMARKED_WARDEN, SILTWAKE_DARTER],
      },
      level: 608,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s8',
      name: 'The Even Span',
      enemies: {
        front: [SHALEBED_CRAWLER, ROUGHCAST_GNAWER],
        back: [CHALKHIDE_BROWSER, THE_NEVERMARK, HAMMERTIDE_LURCHER],
      },
      level: 609,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s9',
      name: 'Ground Held Down',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [BOAR, SETSTONE_DRUDGE, SPINEDRIFT_LANCER],
      },
      level: 609,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s10',
      name: 'The Illmet Comes Up',
      enemies: {
        front: [THE_ILLMET, MIREFOOT_RUNNER],
        back: [SHALEBED_CRAWLER, SLIME, SALTBLEACH_CRIER],
      },
      level: 610,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s11',
      name: 'First Ill Throw',
      enemies: {
        front: [HEADRACE_HAND, HAMMERTIDE_LURCHER],
        back: [ROUGHCAST_GNAWER, THE_LATECOMER, BOAR],
      },
      level: 610,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s12',
      name: 'Where The Bed Slipped',
      enemies: {
        front: [GOLEM, CHANNELBED_STALKER],
        back: [THE_NEVERMARK, MIREFOOT_RUNNER, QUICKMIRE_SKIMMER],
      },
      level: 611,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s13',
      name: 'A Course Gone Crooked',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [ILLFALL_SKULKER, UNMARKED_WARDEN, SILTWAKE_DARTER],
      },
      level: 611,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s14',
      name: 'Nothing Sits Square',
      enemies: {
        front: [HEADRACE_HAND, THE_LATECOMER],
        back: [ROUGHCAST_GNAWER, BOAR, SPINEDRIFT_LANCER],
      },
      level: 612,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s15',
      name: 'The Rubble Line',
      enemies: {
        front: [SHALEBED_CRAWLER, SETSTONE_DRUDGE],
        back: [SILTBANK_HULK, ILLFALL_SKULKER, SALTBLEACH_CRIER],
      },
      level: 612,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s16',
      name: 'Off The True',
      enemies: {
        front: [GOLEM, BAREMARK_GNAWER],
        back: [THE_NEVERMARK, MIREFOOT_RUNNER, QUICKMIRE_SKIMMER],
      },
      level: 613,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s17',
      name: 'Shale And Spoil',
      enemies: {
        front: [HEADRACE_HAND, THE_LATECOMER],
        back: [ROUGHCAST_GNAWER, BOAR, SPINEDRIFT_LANCER],
      },
      level: 613,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s18',
      name: 'A Second Course Up',
      enemies: {
        front: [SHALEBED_CRAWLER, BOAR],
        back: [SILTBANK_HULK, ILLFALL_SKULKER, LONGSTRIDE_RAVENER],
      },
      level: 614,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s19',
      name: 'A Poor Bearing',
      enemies: {
        front: [SHALEBED_CRAWLER, SILTBANK_HULK],
        back: [ROUGHCAST_GNAWER, ILLFALL_SKULKER, BAREMARK_GNAWER],
      },
      level: 614,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s20',
      name: 'The Illmet Again',
      enemies: {
        front: [THE_ILLMET, SHALEBED_CRAWLER],
        back: [SLIME, BAREMARK_GNAWER, CHANNELBED_STALKER],
      },
      level: 615,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s21',
      name: 'The Set Odds',
      enemies: {
        front: [SILTBANK_HULK, ILLFALL_SKULKER],
        back: [ROUGHCAST_GNAWER, SHARPSTONE_COURSER, DEEPSET_ANVILWARD],
      },
      level: 615,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s22',
      name: 'Reckoned And Wrong',
      enemies: {
        front: [HEADRACE_HAND, BOAR],
        back: [SHALEBED_CRAWLER, THE_LATECOMER, SILTWAKE_DARTER],
      },
      level: 616,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s23',
      name: 'The Odds As Laid',
      enemies: {
        front: [HEADRACE_HAND, CHANNELBED_STALKER],
        back: [SILTBANK_HULK, SCATTERSTONE_HOWLER, LONGSTRIDE_RAVENER],
      },
      level: 616,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s24',
      name: 'What The Bed Gives',
      enemies: {
        front: [SHALEBED_CRAWLER, THE_LATECOMER],
        back: [ILLFALL_SKULKER, SHARPSTONE_COURSER, UNMARKED_WARDEN],
      },
      level: 617,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s25',
      name: 'A Fair Enough Face',
      enemies: {
        front: [GOLEM, ROUGHCAST_GNAWER],
        back: [NEVERMARK_KEEPER, HAMMERTIDE_LURCHER, SPINEDRIFT_LANCER],
      },
      level: 617,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s26',
      name: 'The Scatter Begins',
      enemies: {
        front: [SILTBANK_HULK, SCATTERSTONE_HOWLER],
        back: [ROUGHCAST_GNAWER, ILLFALL_SKULKER, BAREMARK_GNAWER],
      },
      level: 618,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s27',
      name: 'Loose On The Slope',
      enemies: {
        front: [GOLEM, ILLFALL_SKULKER],
        back: [LONGSTRIDE_RAVENER, BAREMARK_GNAWER, CHANNELBED_STALKER],
      },
      level: 618,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s28',
      name: 'Nothing To Bear On',
      enemies: {
        front: [SHALEBED_CRAWLER, THE_LATECOMER],
        back: [SCATTERSTONE_HOWLER, THORNBACK_GRAZER, SLIME],
      },
      level: 619,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s29',
      name: 'The Odds Hold',
      enemies: {
        front: [GOLEM, QUICKMIRE_SKIMMER],
        back: [ROUGHCAST_GNAWER, LONGSTRIDE_RAVENER, SILTWAKE_DARTER],
      },
      level: 619,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s30',
      name: 'The Illmet Sets',
      enemies: {
        front: [THE_ILLMET, SCATTERSTONE_HOWLER],
        back: [SHARPSTONE_COURSER, BAREMARK_GNAWER, SALTBLEACH_CRIER],
      },
      level: 620,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s31',
      name: 'The Turned Stone',
      enemies: {
        front: [HEADRACE_HAND, ILLFALL_SKULKER],
        back: [THORNBACK_GRAZER, THE_LATECOMER, LONGSTRIDE_RAVENER],
      },
      level: 620,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s32',
      name: 'A Stone That Rolls',
      enemies: {
        front: [SILTBANK_HULK, UNMARKED_WARDEN],
        back: [LOOSEGROUND_RAVENER, ILLFALL_SKULKER, SHARPSTONE_COURSER],
      },
      level: 621,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s33',
      name: 'Under The Facing',
      enemies: {
        front: [GOLEM, SILTWAKE_DARTER],
        back: [SCATTERSTONE_HOWLER, NEVERMARK_KEEPER, QUICKMIRE_SKIMMER],
      },
      level: 621,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s34',
      name: 'The Course Breaks',
      enemies: {
        front: [HEADRACE_HAND, ILLFALL_SKULKER],
        back: [SCATTERSTONE_HOWLER, THE_LATECOMER, BAREMARK_GNAWER],
      },
      level: 622,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s35',
      name: 'Where It Went Over',
      enemies: {
        front: [SILTBANK_HULK, THORNBACK_GRAZER],
        back: [LOOSEGROUND_RAVENER, ILLFALL_SKULKER, CHANNELBED_STALKER],
      },
      level: 622,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s36',
      name: 'Nothing Bedded Right',
      enemies: {
        front: [SILTBANK_HULK, QUICKMIRE_SKIMMER],
        back: [SCATTERSTONE_HOWLER, LOOSEGROUND_RAVENER, CHALKHIDE_BROWSER],
      },
      level: 623,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s37',
      name: 'The Slip Face',
      enemies: {
        front: [SILTBANK_HULK, SCATTERSTONE_HOWLER],
        back: [ILLFALL_SKULKER, SHARPSTONE_COURSER, BOAR],
      },
      level: 623,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s38',
      name: 'A Bad Seat',
      enemies: {
        front: [GOLEM, LOOSEGROUND_RAVENER],
        back: [LONGSTRIDE_RAVENER, MIREFOOT_RUNNER, SILTWAKE_DARTER],
      },
      level: 624,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s39',
      name: 'The Stone Turns Again',
      enemies: {
        front: [SILTBANK_HULK, THORNBACK_GRAZER],
        back: [LOOSEGROUND_RAVENER, SHARPSTONE_COURSER, SILTWAKE_DARTER],
      },
      level: 624,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s40',
      name: 'The Illmet Turns',
      enemies: {
        front: [THE_ILLMET, ILLFALL_SKULKER],
        back: [SHARPSTONE_COURSER, BOAR, SALTBLEACH_CRIER],
      },
      level: 625,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s41',
      name: 'The Long Odds',
      enemies: {
        front: [HEADRACE_HAND, LOOSEGROUND_RAVENER],
        back: [ODDSTONE_HERALD, SHARPSTONE_COURSER, MIREFOOT_RUNNER],
      },
      level: 625,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s42',
      name: 'Against The Grain Of It',
      enemies: {
        front: [BREAKSTONE_WARDEN, UNMARKED_WARDEN],
        back: [SCATTERSTONE_HOWLER, THORNBACK_GRAZER, THE_LATECOMER],
      },
      level: 626,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s43',
      name: 'The Broken Facing',
      enemies: {
        front: [HEADRACE_HAND, ODDSTONE_HERALD],
        back: [BREAKSTONE_WARDEN, LONGSTRIDE_RAVENER, BAREMARK_GNAWER],
      },
      level: 626,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s44',
      name: 'What Will Not Set',
      enemies: {
        front: [SILTBANK_HULK, LOOSEGROUND_RAVENER],
        back: [SCATTERSTONE_HOWLER, SHARPSTONE_COURSER, BOAR],
      },
      level: 627,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s45',
      name: 'A Run Of Bad Ground',
      enemies: {
        front: [GOLEM, SILTWAKE_DARTER],
        back: [BREAKSTONE_WARDEN, CHANNELBED_STALKER, MIREFOOT_RUNNER],
      },
      level: 627,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s46',
      name: 'The Odds Lengthen',
      enemies: {
        front: [BREAKSTONE_WARDEN, THE_LATECOMER],
        back: [SCATTERSTONE_HOWLER, THORNBACK_GRAZER, BAREMARK_GNAWER],
      },
      level: 628,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s47',
      name: 'Nothing Runs True',
      enemies: {
        front: [ODDSTONE_HERALD, LOOSEGROUND_RAVENER],
        back: [SILTBANK_HULK, SHARPSTONE_COURSER, BOAR],
      },
      level: 628,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s48',
      name: 'The Spoil Heap',
      enemies: {
        front: [GOLEM, SILTWAKE_DARTER],
        back: [BREAKSTONE_WARDEN, CHANNELBED_STALKER, MIREFOOT_RUNNER],
      },
      level: 629,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s49',
      name: 'Reckoned Long',
      enemies: {
        front: [BREAKSTONE_WARDEN, ODDSTONE_HERALD],
        back: [SCATTERSTONE_HOWLER, THORNBACK_GRAZER, LONGSTRIDE_RAVENER],
      },
      level: 629,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s50',
      name: 'The Illmet At Length',
      enemies: {
        front: [THE_ILLMET, LONGSTRIDE_RAVENER],
        back: [CHALKHIDE_BROWSER, SHARPSTONE_COURSER, BOAR],
      },
      level: 630,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s51',
      name: 'The Roughcast',
      enemies: {
        front: [HEADRACE_HAND, ODDSTONE_HERALD],
        back: [LOOSEGROUND_RAVENER, SHARPSTONE_COURSER, CHANNELBED_STALKER],
      },
      level: 630,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s52',
      name: 'Cast And Left Standing',
      enemies: {
        front: [BREAKSTONE_WARDEN, LOOSEGROUND_RAVENER],
        back: [ODDSTONE_HERALD, SHARPSTONE_COURSER, SETSTONE_DRUDGE],
      },
      level: 631,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s53',
      name: 'The Whole Face Loose',
      enemies: {
        front: [BREAKSTONE_WARDEN, ODDSTONE_HERALD],
        back: [LOOSEGROUND_RAVENER, THORNBACK_GRAZER, LONGSTRIDE_RAVENER],
      },
      level: 631,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s54',
      name: 'No Course To Follow',
      enemies: {
        front: [GOLEM, LOOSEGROUND_RAVENER],
        back: [SHARPSTONE_COURSER, LONGSTRIDE_RAVENER, CHANNELBED_STALKER],
      },
      level: 632,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s55',
      name: 'Where Nothing Holds',
      enemies: {
        front: [BREAKSTONE_WARDEN, ODDSTONE_HERALD],
        back: [LOOSEGROUND_RAVENER, SHARPSTONE_COURSER, BAREMARK_GNAWER],
      },
      level: 632,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s56',
      name: 'The Last Good Bearing',
      enemies: {
        front: [BREAKSTONE_WARDEN, ODDSTONE_HERALD],
        back: [LOOSEGROUND_RAVENER, THORNBACK_GRAZER, LONGSTRIDE_RAVENER],
      },
      level: 633,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s57',
      name: 'Odds Past Reckoning',
      enemies: {
        front: [GOLEM, LOOSEGROUND_RAVENER],
        back: [SHARPSTONE_COURSER, LONGSTRIDE_RAVENER, CHANNELBED_STALKER],
      },
      level: 633,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s58',
      name: 'The Facing Comes Away',
      enemies: {
        front: [BREAKSTONE_WARDEN, LOOSEGROUND_RAVENER],
        back: [THORNBACK_GRAZER, SHARPSTONE_COURSER, THE_LATECOMER],
      },
      level: 634,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s59',
      name: 'Nothing To Count On',
      enemies: {
        front: [BREAKSTONE_WARDEN, LOOSEGROUND_RAVENER],
        back: [ODDSTONE_HERALD, SHARPSTONE_COURSER, BAREMARK_GNAWER],
      },
      level: 634,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c26-s60',
      name: 'The Mischance',
      enemies: {
        front: [THE_MISCHANCE, LOOSEGROUND_RAVENER],
        back: [CHALKHIDE_BROWSER, SHARPSTONE_COURSER, CHANNELBED_STALKER],
      },
      level: 635,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
