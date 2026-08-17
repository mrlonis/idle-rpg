import {
  BACKCUT_HEWER,
  BINDWEED_DEAD,
  BRACEWORK_DELVER,
  COLDFORGE_HAND,
  DEEPROCK_MINER,
  DEEPSET_ANVILWARD,
  FORGE_THRALL,
  GAINSAY_PIKE,
  GATEFAST_WARDEN,
  HOLDFAST_HAND,
  KINSTONE_BEARER,
  MARCHWARD_PIKEMAN,
  NEVERMARK_KEEPER,
  OATHCUT_HEWER,
  ONEGRAVE_HAND,
  PLUMBLINE_HAND,
  PROPGALLERY_HAND,
  QUICKMIRE_SKIMMER,
  REEDBACK_COURSER,
  SEAMBOUND_DELVER,
  SETSTONE_DRUDGE,
  SHEAFLESS_SHADE,
  SHORTMEASURE_CLERK,
  SLAGBOUND_DRUDGE,
  SPITELAMP_BEARER,
  STUBBLEFIELD_RUNNER,
  STUBBORN_GRAIN,
  THE_NEVERMARK,
  THE_UNGAINSAID,
  TURFBOUND_SLEEPER,
  UNMARKED_WARDEN,
  WARDSTONE_KEEPER,
} from './enemies';

/**
 * Chapter 24 — The Nevermark.
 *
 * **Sixty stages**, enemy levels 545 to 575. It **opens at the level chapter 23 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Evenfall did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, the longebb whether it **still holds its value**, the downstroke whether
 * it **arrives all at once**, and the evenfall whether it **ever lands well**. This one asks whether
 * anything it does **takes hold**.
 *
 * ⚠️ **That is a different question from chapter 9's, and the distinction is the chapter.** The
 * Hollow Anvil asked whether what the party does **stays** done — things being undone afterwards.
 * The Nevermark asks whether it lands in the first place: a hold whose stone takes no chisel, whose
 * tally takes no correction, and whose people take no telling. Four of the calibrated five carry a
 * hostile status, and here they are simply refused.
 *
 * | Band              | Stages | Levels  | The lock it teaches                                    |
 * | ----------------- | ------ | ------- | ------------------------------------------------------ |
 * | The plain face    | 1–10   | 545–550 | the habit: a wall, and almost nothing refused          |
 * | The first gainsay | 11–20  | 550–555 | refusal arrives, below the shipped median              |
 * | The set grain     | 21–30  | 555–560 | the median, on most of the board                       |
 * | The deep set      | 31–40  | 560–565 | past the median — {@link STUBBORN_GRAIN}               |
 * | The unmarked      | 41–50  | 565–570 | most of the board past it — {@link NEVERMARK_KEEPER}   |
 * | The nevermark     | 51–60  | 570–575 | the wall that takes nothing — {@link DEEPSET_ANVILWARD} |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied again and for the same reason: before this chapter `tenacity` sat on **133 of 302 blocks
 * at a median of 0.40 and a ceiling of 0.85**, and after it on **142 of 312 at the same median and
 * the same ceiling**, so "the refusal arrives in band 2" cannot be a claim about
 * *presence*. Measured over the shipped boards, bodies per board at or above **0.40** run
 * **0–1, 0–3, 2–4, 3–4, 4–5, 4–5** across the six bands, and at or above **0.55** they run
 * **0–1, 0–1, 0–1, 1–3, 3–4, 3–5**. ⚠️ **It also forced a block to be authored *without* the
 * stat**: {@link HOLDFAST_HAND} carries no `tenacity` at all, because it stands on more
 * opening-band boards than anything else here.
 *
 * ⚠️ **The whole axis sits *inside* the shipped register, and that is the answer rather than a
 * formality.** The top of the chapter is 0.75 against a shipped ceiling of 0.85; nothing steps past
 * it. That is the Elf Tower's `critChance` shape rather than the Monster Tower's `physicalResist`
 * one, and a later session should be able to see which of the two it is looking at.
 *
 * ⚠️ **No board carries a heal, a drain, a regeneration or a shield**, checkable rather than
 * rhetorical: `recovery`, `lifeLeech` and `healthRegen` appear on **0 of 60** boards and **0**
 * boards field a kit with a heal or shield effect. A Dwarf chapter is the one most able to run the
 * ninety-second clock out — the faction owns the tankiest blocks in the game — so what makes this
 * one hard is **refusal, not health**, and the longest fight any board produces is **64.0s** against
 * the 72s bar, with **zero timeouts on all sixty**.
 *
 * ⚠️ **No board fields two `enemy-back` turns**, checked mechanically over all sixty. **Four fielded
 * bodies carry one** — {@link GAINSAY_PIKE} and {@link THE_UNGAINSAID} here, and the returning
 * {@link SHORTMEASURE_CLERK} and {@link PLUMBLINE_HAND} — and no board fields two of them. Chapter
 * 19 measured two on a single stat line as the party's back rank deleted.
 *
 * ⚠️ **This shipped false and the prose check is what caught it.** The authoring pass checked the
 * claim against *this chapter's own* new blocks, found one carrier, and wrote "the only bodies" —
 * while `c24-s15` and `c24-s25` each fielded a **returning** Dwarf that also carries one. Both
 * boards measured 4.00 of five, so nothing was red and nothing looked wrong; only the script
 * disagreed. That is chapter 22's "read what a returning block does, not only what it weighs"
 * arriving as a **prose** failure rather than a tuning one, and the fix was the two boards rather
 * than the sentence, because the underlying rule is one this chapter wants to keep.
 *
 * ## ⚠️ The rung stays on `mythic-plus`, and this is a derivation rather than an override
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 23's seam of **1.9981** and The Nevermark's close of 575, `mythic` reads **0.1270** (|Δln|
 * 2.7561), `mythic-plus` **1.0711** (|Δln| **0.6235**) and `ascended` **9.0371** (|Δln| 1.5091).
 * **`mythic-plus` wins by 0.886 of a nat**, the same margin chapters 18 and 22 overrode and chapters
 * 19, 20, 21 and 23 stayed on. Six chapters running have now had to say which of the two they are
 * doing; this one is a **stay**.
 *
 * ⚠️ **The alternative was *fielded* rather than reasoned about**, which is the discipline chapter
 * 21 established. An `ascended` five takes chapter 23's own opening board **and its final** at
 * level 575 at **100% with all five alive in 2.3s and 2.4s** — a walkover three chapters deep. What
 * licenses an override is the seam below being wrong *and* the pool being unable to supply a board,
 * and neither holds: chapter 23's seam is 1.9981, this chapter's own is 1.0711, and **121 of the 302
 * shipped blocks stand as an ordinary body on a board at level 575** (monster 34, undead 21, elf 21,
 * dwarf 17, human 14, angel 9, demon 5).
 *
 * ⚠️ **A weight-and-attack filter predicted a pool wall here and the simulation refused it.**
 * Screening the pool on common-equivalent weight and on the attack chapter 23's boards carried
 * leaves **15 blocks, every one of them a Monster** — the reading that would have forced a third
 * Monster lead. Fielding them instead of filtering them gives 121 across all seven factions.
 * **Chapter 23 was right that the binding quantity is attack rather than weight; it does not follow
 * that a filter on the two is a pool count.**
 *
 * ⚠️ **The seam link is degenerate at two links, as chapter 23 predicted.** Chapters 22, 23 and 24
 * all close above `mythic-plus`'s cap of **420** and all clamp to it, so `DOWNSTROKE`, `EVENFALL`
 * and `INVESTED` are one set of five combatants. **Expect a third at chapter 25**, whose own seam
 * reads **0.5733** — below 1.00, which is the first half of an override licence. The other half is
 * the pool, and it should be **measured rather than projected**.
 *
 * ## ⚠️ The party is unchanged again, so the boards halve again
 *
 * Because chapters 23 and 24 clamp to the same cap, the party fielded here is **the same five
 * combatants** that took The Evenfall, while the boards climb thirty levels. An authored number is
 * worth `perLevel ** 30` = **×1.87** more than the identical number one chapter below, so the board
 * budget is **×0.536** of chapter 23's in common-equivalent terms — boards run **1,310 to 2,718**
 * where The Evenfall's ran 2,185 to 3,999.
 *
 * ⚠️ **Chapter 23's own boards refielded at 575 read 0%**, both its opening board and its final,
 * which is the same boundary check every chapter since 14 has run and the reason this chapter's
 * blocks are authored where they are.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an anchor of 239/18 behind four bodies of 135/14, each
 * carrying one ordinary turn, at level 575 and Relic 100: **1,809 common-equivalent, reading 3.94 of
 * five at 42.0s**, and it **moves** (4.00 at 1,540, 3.52 at 1,902, 1.76 at 2,079). Zero timeouts on
 * every row.
 *
 * | shape                                     | survivors | worth    |
 * | ----------------------------------------- | --------- | -------- |
 * | `tenacity` 0.20 across five               | 3.11      | 0.80     |
 * | `tenacity` 0.40 across five — the median  | 2.38      | 1.53     |
 * | `tenacity` 0.55 across five               | 1.48      | 2.43     |
 * | `tenacity` 0.70 across five               | 0.70      | 3.21     |
 * | `tenacity` 0.85 across five — the ceiling | 0.30      | **3.61** |
 *
 * 1. ⚠️ **This inverts chapter 21's recorded negative, three chapters later.** The Longebb measured
 *    `tenacity` as the register check's eighth answer and **flat** — 0.25 at 0.20 and 0.33 at 0.60 —
 *    and declined it on the measurement. Here it is a **six-step monotone dial with zero timeouts**,
 *    because the board under it is twice the weight and the fights are long enough for a status to
 *    matter. **A recorded "X is inert" is a claim about a curve, and the curves in this project
 *    move** — chapter 23 said the same thing about chapter 14's refusal list, nine chapters apart.
 * 2. ⚠️ **The register on the *party's* side is what makes it worth this much**, which is chapter
 *    23's rule read from the other side of the board. **Four of the calibrated five carry a hostile
 *    status** — Bran's `weaken`, Gnash's `bleed`, Rin's `slow`, Pyra's `burn` — and only the healer
 *    does not. Chapter 23's crit denial saturated at 0.88 of a member because only two of five
 *    carried crit worth denying; this denies four fifths of the party's kit.
 * 3. ⚠️ **Counts grade as well as values, which is what makes six bands buildable.** Stepping bodies
 *    from the shipped median of 0.40 to 0.70 one at a time reads **1.63 / 1.29 / 1.09 / 0.72** of
 *    five at one, two, three and five carriers. The band table above is built on the counts.
 * 4. ⚠️ **Almost everything else at this weight is a cliff or inert**, which is why the chapter is
 *    built on the one dial. `def` reads 3.94 → 0.06 between 0 and 40; `physicalResist` 1.77 at 0.18
 *    and 0.03 at 0.30; `haste` 0.20 at 90 and 0.00 at 105; `WEAKEN`, `SLOW`, `STUN` and `RALLY` are
 *    total wipes from one carrier. Every **reach** — `enemy-back`, `enemy-all` and `enemy-row-back`
 *    at the wide cap — reads **−0.04 to −0.06**, inside the noise.
 *
 * ## ⚠️ Conditioned enemy kits were the chapter's first premise and they price at zero
 *
 * Recorded because it is a negative result with a weight attached, and because the shape is
 * tempting: a board that answers what the party just did reads as the natural next question.
 * Measured against the same control, at one carrier and at all five, **every one of the six
 * condition kinds lands inside ±0.08 of the control** — `ally-hurt` at 0.90 and 0.60, `ally-afflicted`,
 * `self-hurt` 0.60, and `enemies-at-least` at 5 and at 3.
 *
 * ⚠️ **Worse, a condition prices *negative* on the payload axis.** At power 3.6 an always-on turn
 * reads **1.46** of five where the identical turn behind `enemies-at-least 5` reads **3.88** — the
 * condition is worth −2.42, because it stops firing the moment the party loses anybody. That is
 * chapter 20's wrong-sign finding in a new place: **a condition is a restriction on the board, and
 * the party is the beneficiary.** No board in this chapter carries one.
 *
 * ## ⚠️ Three things the boards found that the control did not
 *
 * 1. ⚠️ **The difficulty probe reads throughput, and a lock that slows the board reads as a step
 *    backwards.** A first draft let `atk` and `haste` fall as `tenacity` rose, so the late bands came
 *    out slow and tanky: the probe read the band-4 opener at **0.792** of the sample below it against
 *    a 0.85 bar, while the real party read 4.00 of five on every board. {@link STUBBORN_GRAIN} is the
 *    repair — one fast, hot body that also carries the lock — and it took that sample to 0.993.
 *    **Weight shortlists; only the probe ranks**, and a refusal stat is exactly the kind of lock the
 *    probe cannot see.
 * 2. ⚠️ **The final's rank arrangement is worth more than its stat line.** At 110/2 the same five
 *    bodies read **3.88 of five** with the boss and {@link STUBBORN_GRAIN} in front and **0.82** with
 *    {@link NEVERMARK_KEEPER} there instead — identical board, ranks swapped. The boss's own weight
 *    graded 4.00 / 4.00 / 3.98 across 75, 90 and 110 health behind the right escort and **0% at all
 *    three** behind the wrong one.
 * 3. ⚠️ **Two boards came down off the ninety-second clock rather than off a survivor count** —
 *    74.4s and 76.0s against the 72s bar, both the lieutenant's later appearances behind two of the
 *    chapter's fast bodies. **Count the seconds as well as the survivors**, which is chapter 22's
 *    rule and the one a Dwarf chapter is most likely to need.
 *
 * ## The lean, and what it costs
 *
 * - **Dwarf, at 92.3% of board slots** — out of family on the high side, in company with The
 *   Rustwood's 92% and The Longebb's 93.7%, and stated rather than rounded. Dwarf was the **thinnest
 *   legal lead at 44 blocks** (angel 24, demon 25, dwarf 44, human 46, undead 49, elf 53, monster
 *   61), and this takes it to 54. ⚠️ **Unlike The Longebb's, this share is a choice rather than a
 *   budget**: 121 blocks are fieldable here, so the texture could have been wider. What kept it
 *   narrow is that a hold is a place, and the twenty-one Undead slots are the road-dead already
 *   walking it.
 * - **32 distinct archetypes fielded, ten of them new** — **26.7%** of ordinary archetypes under the
 *   shipped rule (8 of 30) and **31.3%** counting the lieutenant and the boss inside the fraction.
 *   The quota lands at the quota for the fifth chapter running, on the same two figures The Longebb
 *   and The Evenfall landed on.
 * - ⚠️ **The `gearArchetype` bill was zero for the fifth chapter running**, because The Quarry, The
 *   Shutgate and The Backcut already paid the Dwarf one — **all 44 Dwarf blocks carry one**. Still a
 *   fact about the lean rather than a trend.
 */

export const CHAPTER_24 = {
  id: 'chapter-24',
  name: 'The Nevermark',
  stages: [
    {
      id: 'c24-s1',
      name: 'The Plain Face',
      enemies: {
        front: [HOLDFAST_HAND, SHEAFLESS_SHADE],
        back: [SHEAFLESS_SHADE, BINDWEED_DEAD, HOLDFAST_HAND],
      },
      level: 545,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s2',
      name: 'Cut And Uncut',
      enemies: {
        front: [HOLDFAST_HAND, SETSTONE_DRUDGE],
        back: [BINDWEED_DEAD, SHEAFLESS_SHADE, HOLDFAST_HAND],
      },
      level: 546,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s3',
      name: 'A Hand On The Stone',
      enemies: {
        front: [SETSTONE_DRUDGE, HOLDFAST_HAND],
        back: [HOLDFAST_HAND, STUBBLEFIELD_RUNNER, BINDWEED_DEAD],
      },
      level: 546,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s4',
      name: 'Nothing Written Here',
      enemies: {
        front: [HOLDFAST_HAND, SPITELAMP_BEARER],
        back: [HOLDFAST_HAND, SHEAFLESS_SHADE, STUBBLEFIELD_RUNNER],
      },
      level: 547,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s5',
      name: 'The First Course',
      enemies: {
        front: [SETSTONE_DRUDGE, HOLDFAST_HAND],
        back: [SHORTMEASURE_CLERK, HOLDFAST_HAND, ONEGRAVE_HAND],
      },
      level: 547,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s6',
      name: 'Set And Set Again',
      enemies: {
        front: [HOLDFAST_HAND, SETSTONE_DRUDGE],
        back: [HOLDFAST_HAND, HOLDFAST_HAND, TURFBOUND_SLEEPER],
      },
      level: 548,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s7',
      name: 'The Mason Says No',
      enemies: {
        front: [SETSTONE_DRUDGE, SHORTMEASURE_CLERK],
        back: [HOLDFAST_HAND, HOLDFAST_HAND, ONEGRAVE_HAND],
      },
      level: 548,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s8',
      name: 'Chalk On A Wet Face',
      enemies: {
        front: [HOLDFAST_HAND, BACKCUT_HEWER],
        back: [SETSTONE_DRUDGE, HOLDFAST_HAND, STUBBLEFIELD_RUNNER],
      },
      level: 549,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s9',
      name: 'The Line Does Not Take',
      enemies: {
        front: [SETSTONE_DRUDGE, HOLDFAST_HAND],
        back: [BACKCUT_HEWER, HOLDFAST_HAND, TURFBOUND_SLEEPER],
      },
      level: 549,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s10',
      name: 'The Ungainsaid',
      enemies: {
        front: [THE_UNGAINSAID, HOLDFAST_HAND],
        back: [SETSTONE_DRUDGE, SETSTONE_DRUDGE, HOLDFAST_HAND],
      },
      level: 550,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s11',
      name: 'Said Once',
      enemies: {
        front: [HOLDFAST_HAND, GAINSAY_PIKE],
        back: [SETSTONE_DRUDGE, HOLDFAST_HAND, ONEGRAVE_HAND],
      },
      level: 550,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s12',
      name: 'The Second Course',
      enemies: {
        front: [SETSTONE_DRUDGE, OATHCUT_HEWER],
        back: [GAINSAY_PIKE, HOLDFAST_HAND, TURFBOUND_SLEEPER],
      },
      level: 551,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s13',
      name: 'A Word Against It',
      enemies: {
        front: [GAINSAY_PIKE, SETSTONE_DRUDGE],
        back: [HOLDFAST_HAND, OATHCUT_HEWER, STUBBLEFIELD_RUNNER],
      },
      level: 551,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s14',
      name: 'Struck And Struck Off',
      enemies: {
        front: [OATHCUT_HEWER, HOLDFAST_HAND],
        back: [SETSTONE_DRUDGE, GAINSAY_PIKE, ONEGRAVE_HAND],
      },
      level: 552,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s15',
      name: 'The Tally Will Not Hold',
      enemies: {
        front: [SETSTONE_DRUDGE, GAINSAY_PIKE],
        back: [SEAMBOUND_DELVER, HOLDFAST_HAND, TURFBOUND_SLEEPER],
      },
      level: 552,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s16',
      name: 'Gainsaid',
      enemies: {
        front: [OATHCUT_HEWER, SETSTONE_DRUDGE],
        back: [GAINSAY_PIKE, HOLDFAST_HAND, ONEGRAVE_HAND],
      },
      level: 553,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s17',
      name: 'The Drudge Answers',
      enemies: {
        front: [SETSTONE_DRUDGE, OATHCUT_HEWER],
        back: [BRACEWORK_DELVER, GAINSAY_PIKE, HOLDFAST_HAND],
      },
      level: 553,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s18',
      name: 'Nothing Sticks To It',
      enemies: {
        front: [GAINSAY_PIKE, SETSTONE_DRUDGE],
        back: [OATHCUT_HEWER, SETSTONE_DRUDGE, TURFBOUND_SLEEPER],
      },
      level: 554,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s19',
      name: 'Against The Grain',
      enemies: {
        front: [OATHCUT_HEWER, SETSTONE_DRUDGE],
        back: [OATHCUT_HEWER, GAINSAY_PIKE, SEAMBOUND_DELVER],
      },
      level: 554,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s20',
      name: 'The Ungainsaid Returns',
      enemies: {
        front: [THE_UNGAINSAID, SETSTONE_DRUDGE],
        back: [OATHCUT_HEWER, OATHCUT_HEWER, HOLDFAST_HAND],
      },
      level: 555,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s21',
      name: 'The Set Grain',
      enemies: {
        front: [UNMARKED_WARDEN, SETSTONE_DRUDGE],
        back: [GAINSAY_PIKE, OATHCUT_HEWER, HOLDFAST_HAND],
      },
      level: 555,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s22',
      name: 'Warden Of The Blank Wall',
      enemies: {
        front: [UNMARKED_WARDEN, OATHCUT_HEWER],
        back: [SETSTONE_DRUDGE, GAINSAY_PIKE, SEAMBOUND_DELVER],
      },
      level: 556,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s23',
      name: 'A Third Course, Unmarked',
      enemies: {
        front: [SETSTONE_DRUDGE, UNMARKED_WARDEN],
        back: [OATHCUT_HEWER, GAINSAY_PIKE, DEEPROCK_MINER],
      },
      level: 556,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s24',
      name: 'The Chisel Skips',
      enemies: {
        front: [UNMARKED_WARDEN, GAINSAY_PIKE],
        back: [SETSTONE_DRUDGE, OATHCUT_HEWER, QUICKMIRE_SKIMMER],
      },
      level: 557,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s25',
      name: 'Told And Not Taken',
      enemies: {
        front: [OATHCUT_HEWER, UNMARKED_WARDEN],
        back: [GAINSAY_PIKE, SETSTONE_DRUDGE, DEEPROCK_MINER],
      },
      level: 557,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s26',
      name: 'The Wall Keeps Its Own',
      enemies: {
        front: [UNMARKED_WARDEN, SETSTONE_DRUDGE],
        back: [UNMARKED_WARDEN, GAINSAY_PIKE, REEDBACK_COURSER],
      },
      level: 558,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s27',
      name: 'No Purchase',
      enemies: {
        front: [SETSTONE_DRUDGE, UNMARKED_WARDEN],
        back: [OATHCUT_HEWER, UNMARKED_WARDEN, SEAMBOUND_DELVER],
      },
      level: 558,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s28',
      name: 'The Long Refusal',
      enemies: {
        front: [UNMARKED_WARDEN, OATHCUT_HEWER],
        back: [SETSTONE_DRUDGE, GAINSAY_PIKE, DEEPROCK_MINER],
      },
      level: 559,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s29',
      name: 'Unmarked And Standing',
      enemies: {
        front: [UNMARKED_WARDEN, SETSTONE_DRUDGE],
        back: [UNMARKED_WARDEN, OATHCUT_HEWER, PLUMBLINE_HAND],
      },
      level: 559,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s30',
      name: 'The Ungainsaid Holds',
      enemies: {
        front: [THE_UNGAINSAID, UNMARKED_WARDEN],
        back: [UNMARKED_WARDEN, SETSTONE_DRUDGE, OATHCUT_HEWER],
      },
      level: 560,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s31',
      name: 'The Deep Set',
      enemies: {
        front: [UNMARKED_WARDEN, STUBBORN_GRAIN],
        back: [STUBBORN_GRAIN, OATHCUT_HEWER, SETSTONE_DRUDGE],
      },
      level: 560,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s32',
      name: 'Grain Under Grain',
      enemies: {
        front: [STUBBORN_GRAIN, UNMARKED_WARDEN],
        back: [UNMARKED_WARDEN, STUBBORN_GRAIN, FORGE_THRALL],
      },
      level: 561,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s33',
      name: 'What The Hold Keeps',
      enemies: {
        front: [UNMARKED_WARDEN, COLDFORGE_HAND],
        back: [STUBBORN_GRAIN, OATHCUT_HEWER, SETSTONE_DRUDGE],
      },
      level: 561,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s34',
      name: 'The Fourth Course',
      enemies: {
        front: [STUBBORN_GRAIN, UNMARKED_WARDEN],
        back: [STUBBORN_GRAIN, GAINSAY_PIKE, FORGE_THRALL],
      },
      level: 562,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s35',
      name: 'Nothing Answers To It',
      enemies: {
        front: [COLDFORGE_HAND, STUBBORN_GRAIN],
        back: [UNMARKED_WARDEN, OATHCUT_HEWER, PROPGALLERY_HAND],
      },
      level: 562,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s36',
      name: 'A Stubborn Reading',
      enemies: {
        front: [STUBBORN_GRAIN, UNMARKED_WARDEN],
        back: [STUBBORN_GRAIN, STUBBORN_GRAIN, SETSTONE_DRUDGE],
      },
      level: 563,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s37',
      name: 'The Mark Wears Off',
      enemies: {
        front: [UNMARKED_WARDEN, STUBBORN_GRAIN],
        back: [UNMARKED_WARDEN, GAINSAY_PIKE, WARDSTONE_KEEPER],
      },
      level: 563,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s38',
      name: 'Struck Out Of Record',
      enemies: {
        front: [STUBBORN_GRAIN, COLDFORGE_HAND],
        back: [UNMARKED_WARDEN, OATHCUT_HEWER, SETSTONE_DRUDGE],
      },
      level: 564,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s39',
      name: 'Deeper Than The Chisel',
      enemies: {
        front: [STUBBORN_GRAIN, UNMARKED_WARDEN],
        back: [STUBBORN_GRAIN, UNMARKED_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 564,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s40',
      name: 'The Ungainsaid Deepens',
      enemies: {
        front: [THE_UNGAINSAID, STUBBORN_GRAIN],
        back: [UNMARKED_WARDEN, UNMARKED_WARDEN, SETSTONE_DRUDGE],
      },
      level: 565,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s41',
      name: 'The Unmarked',
      enemies: {
        front: [NEVERMARK_KEEPER, STUBBORN_GRAIN],
        back: [STUBBORN_GRAIN, UNMARKED_WARDEN, SETSTONE_DRUDGE],
      },
      level: 565,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s42',
      name: 'Keeper Of The Blank Course',
      enemies: {
        front: [NEVERMARK_KEEPER, UNMARKED_WARDEN],
        back: [STUBBORN_GRAIN, NEVERMARK_KEEPER, FORGE_THRALL],
      },
      level: 566,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s43',
      name: 'Said To No Purpose',
      enemies: {
        front: [STUBBORN_GRAIN, NEVERMARK_KEEPER],
        back: [STUBBORN_GRAIN, UNMARKED_WARDEN, SLAGBOUND_DRUDGE],
      },
      level: 566,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s44',
      name: 'The Fifth Course',
      enemies: {
        front: [NEVERMARK_KEEPER, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, UNMARKED_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 567,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s45',
      name: 'What Will Not Be Told',
      enemies: {
        front: [NEVERMARK_KEEPER, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, UNMARKED_WARDEN, SLAGBOUND_DRUDGE],
      },
      level: 567,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s46',
      name: 'The Hold Does Not Hear',
      enemies: {
        front: [STUBBORN_GRAIN, NEVERMARK_KEEPER],
        back: [STUBBORN_GRAIN, NEVERMARK_KEEPER, KINSTONE_BEARER],
      },
      level: 568,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s47',
      name: 'Neither Cut Nor Counted',
      enemies: {
        front: [NEVERMARK_KEEPER, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, UNMARKED_WARDEN, GATEFAST_WARDEN],
      },
      level: 568,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s48',
      name: 'A Blank Face, Deepening',
      enemies: {
        front: [NEVERMARK_KEEPER, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, UNMARKED_WARDEN, SETSTONE_DRUDGE],
      },
      level: 569,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s49',
      name: 'Nothing Of It Remains',
      enemies: {
        front: [NEVERMARK_KEEPER, UNMARKED_WARDEN],
        back: [STUBBORN_GRAIN, NEVERMARK_KEEPER, SETSTONE_DRUDGE],
      },
      level: 569,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s50',
      name: 'The Ungainsaid Unmoved',
      enemies: {
        front: [THE_UNGAINSAID, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, NEVERMARK_KEEPER, UNMARKED_WARDEN],
      },
      level: 570,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s51',
      name: 'The Nevermark Reach',
      enemies: {
        front: [DEEPSET_ANVILWARD, NEVERMARK_KEEPER],
        back: [NEVERMARK_KEEPER, UNMARKED_WARDEN, SETSTONE_DRUDGE],
      },
      level: 570,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s52',
      name: 'The Sixth Course',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [DEEPSET_ANVILWARD, NEVERMARK_KEEPER, SETSTONE_DRUDGE],
      },
      level: 571,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s53',
      name: 'Anvilward',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, DEEPSET_ANVILWARD, UNMARKED_WARDEN],
      },
      level: 571,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s54',
      name: 'Nothing Takes Here',
      enemies: {
        front: [NEVERMARK_KEEPER, DEEPSET_ANVILWARD],
        back: [DEEPSET_ANVILWARD, STUBBORN_GRAIN, SETSTONE_DRUDGE],
      },
      level: 572,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s55',
      name: 'The Last Refusal',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, DEEPSET_ANVILWARD, UNMARKED_WARDEN],
      },
      level: 572,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s56',
      name: 'Unwritten Stone',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [DEEPSET_ANVILWARD, NEVERMARK_KEEPER, UNMARKED_WARDEN],
      },
      level: 573,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s57',
      name: 'The Wall Without A Face',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [DEEPSET_ANVILWARD, DEEPSET_ANVILWARD, NEVERMARK_KEEPER],
      },
      level: 573,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s58',
      name: 'No Hand Has Been Here',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [DEEPSET_ANVILWARD, NEVERMARK_KEEPER, UNMARKED_WARDEN],
      },
      level: 574,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s59',
      name: 'What The Deep Set Keeps',
      enemies: {
        front: [DEEPSET_ANVILWARD, STUBBORN_GRAIN],
        back: [DEEPSET_ANVILWARD, DEEPSET_ANVILWARD, UNMARKED_WARDEN],
      },
      level: 574,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c24-s60',
      name: 'The Nevermark',
      enemies: {
        front: [THE_NEVERMARK, STUBBORN_GRAIN],
        back: [NEVERMARK_KEEPER, DEEPSET_ANVILWARD, UNMARKED_WARDEN],
      },
      level: 575,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
