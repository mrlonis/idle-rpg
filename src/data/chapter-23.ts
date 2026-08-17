import {
  BARROWMIST_KEENER,
  CAIRNWARD_HUSK,
  CHAFFMOUTH_GAUNT,
  CHARNEL_DRUDGE,
  DULLEDGE_BRIAR,
  EVENFERN_CREEPER,
  EVENLIGHT_TENDER,
  FLATSHADE_STALKER,
  GLADE_STALKER,
  GLASSBARK_SENTRY,
  GLOAMVINE_CREEPER,
  GRAVEFURROW_WALKER,
  GREYLEAF_WARDEN,
  HOLLOWBARK_SENTRY,
  LAMPLESS_PILGRIM,
  MEERSTONE_HUSK,
  MILEWORN_HUSK,
  MIREMAST_TRUNK,
  NOONLESS_ARCHER,
  QUILLRUST_DARTER,
  ROADGAUNT_OUTRIDER,
  SCALEPLATE_BRAMBLE,
  SHADOWLESS_DANCER,
  SLAGBLOOM_THICKET,
  SLOWGROWTH_BOLE,
  SUNMOTE_DANCER,
  THE_EVENFALL,
  THE_UNBETTERED,
  THORNLING,
  TURFBOUND_SLEEPER,
  UNDERROAD_RANKER,
  WHISPERLEAF_ARCHER,
} from './enemies';

/**
 * Chapter 23 — The Evenfall.
 *
 * **Sixty stages**, enemy levels 515 to 545. It **opens at the level chapter 22 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Downstroke did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, the longebb whether it **still holds its value**, and the downstroke
 * whether it **arrives all at once**. This one asks whether it **ever lands well**.
 *
 * An evenfall is a wood under a light that never moves: no noon, no shadow, no hour better than any
 * other. Nothing here takes a blow worse than it has to. The chapter walks one idea from a habit to
 * a wall — first the party's best case is simply denied, then what does land stops counting for
 * full, and at the end neither kind of damage arrives at its face value.
 *
 * | Band              | Stages | Levels  | The lock it teaches                                    |
 * | ----------------- | ------ | ------- | ------------------------------------------------------ |
 * | The level light   | 1–10   | 515–520 | `critBlock` at the register, and nothing else          |
 * | The blunted edge  | 11–20  | 520–525 | `critDamageResist` beside it: the best case is gone    |
 * | The grey leaf     | 21–30  | 525–530 | the physical skin arrives — {@link GREYLEAF_WARDEN}    |
 * | The whole grove   | 31–40  | 530–535 | the skin on most of the board rather than its anchor   |
 * | The deep green    | 41–50  | 535–540 | past the register, and `magicResist` beside it         |
 * | The evenfall      | 51–60  | 540–545 | both kinds refused — {@link EVENFERN_CREEPER}          |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes, which is the fix four tower
 * headers had to make after shipping a false claim.** `physicalResist` is the second most common
 * optional stat in the pool — **139 of 302 blocks carry one, at a median of 0.10** — so "the skin arrives in band 3"
 * cannot be a claim about *presence*. Measured over the shipped boards, bodies per board carrying
 * the stat **at or above 0.12** run **0–1, 0–1, 1–3, 3, 2–3, 1–3** across the six bands, and
 * `magicResist` at or above 0.12 runs **0, 0, 0, 0, 1–2, 1–3** — it genuinely does not appear until
 * band 5. `critBlock` at or above 0.20 runs **0–2, 1–2, 2–3, 2–4, 3–4, 3–4**.
 *
 * ⚠️ **No board carries a heal, a drain, a regeneration or a shield**, and that is checkable rather
 * than rhetorical: `recovery`, `lifeLeech` and `healthRegen` appear on **0 of 60** boards and **0**
 * boards field a kit with a heal or shield effect. A refusal chapter is the one most able to run the
 * ninety-second clock out, so sustain is kept off it entirely — the longest fight any board produces
 * is **45.0s** against the 72s bar.
 *
 * ## ⚠️ The rung stays on `mythic-plus`, and this is a derivation rather than an override
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 22's seam of **3.7273** and The Evenfall's close of 545, `mythic` reads **0.2368** (|Δln|
 * 2.7561), `mythic-plus` **1.9981** (|Δln| **0.6235**) and `ascended` **16.8578** (|Δln| 1.5091).
 * **`mythic-plus` wins by 0.886 of a nat**, which is the same margin chapters 18 and 22 overrode and
 * chapters 19, 20 and 21 stayed on.
 *
 * ⚠️ **What licenses an override is the seam *below* being wrong, and here it is not.** Chapter 22's
 * seam is 3.7273 — comfortably above 1.00 — and this chapter's own seam of 1.9981 is above it too.
 * The pool agrees: **55 shipped blocks are both light enough and cool enough** for these boards, of
 * which 15 are Elf, 15 Undead, 10 Dwarf, 10 Monster and 5 Human. Five chapters running have now had
 * to say which of the two they are doing; this one is a **stay**.
 *
 * ⚠️ **The seam link is degenerate, at one link.** Chapters 22 and 23 both close above
 * `mythic-plus`'s cap of **420** and both clamp to it, so `DOWNSTROKE` and `INVESTED` are one set of five
 * combatants — the shape chapters 13–17 recorded five deep and chapters 18–21 four deep, restarting
 * one rung up. **Expect a second link at chapter 24.**
 *
 * ## ⚠️ The party is unchanged from chapter 22, and that is what makes its attack values wrong
 *
 * Because both chapters clamp to the same cap, the party fielded against these boards is **the same
 * five combatants** that took The Downstroke, while the boards climb thirty levels. So an authored
 * number here is worth `perLevel ** 30` = **×1.87** more than the identical number one chapter
 * below, and the whole board budget is **×0.536** of chapter 22's in common-equivalent terms —
 * boards run **2,185 to 3,999** where The Downstroke's ran 7,400 to 9,500.
 *
 * ⚠️ **The first draft of this chapter's ten blocks carried chapter-22 *attack* values with
 * chapter-23 *health* values, and every board fell off a cliff.** That is chapter 21's finding
 * arriving as an authoring error rather than as a measurement: an anchor sets the fight length and
 * the **escort sets the rate at which length becomes deaths**. Halving the authored `atk` — and
 * nothing else — took the six band-representative boards from readings of 0% to 5.00 / 5.00 / 5.00 /
 * 4.08 / 4.00 / 4.00. **At this depth the returning pool is bounded by its attack, not by its
 * weight**, which is chapter 21's Undead-texture finding one rung up: of 117 blocks light enough for
 * these boards, only 55 are also cool enough.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an anchor of 1,887/174 behind four bodies of 1,062/147 at
 * level 545 and Relic 100, **6,135 common-equivalent, reading 3.55 of five**, and it **moves** (3.98
 * at 5,892, 2.90 at 6,355, 2.70 at 6,412). Zero timeouts on every row.
 *
 * | shape                                  | survivors | worth     |
 * | -------------------------------------- | --------- | --------- |
 * | `magicResist` 0.16 across five         | 3.35      | 0.20      |
 * | `critBlock` 0.16 across five           | 3.13      | 0.42      |
 * | `def` 46 across five                   | 3.15      | 0.40      |
 * | `critBlock` 0.28 on the front two      | 2.95      | 0.60      |
 * | `critBlock` 0.28 across five           | 2.80      | 0.75      |
 * | **complete crit immunity** across five | 2.67      | **0.88**  |
 * | `physicalResist` 0.18 across five      | 2.55      | 1.00      |
 * | `magicResist` 0.75 across five         | 2.38      | 1.17      |
 * | `dodge` 0.20 across five               | 2.20      | 1.35      |
 * | `def` 70 across five                   | 1.90      | 1.65      |
 * | both resists at 0.20 across five       | 1.77      | 1.78      |
 * | `physicalResist` 0.30 across five      | 1.25      | 2.30      |
 * | `dodge` 0.30 across five               | 1.23      | 2.32      |
 * | `physicalResist` 0.45 across five      | 0.05      | **3.50**  |
 * | `def` 110 across five                  | 0.00      | 3.55      |
 *
 * 1. ⚠️ **Crit denial saturates inside its own register and cannot carry a chapter alone.**
 *    `critBlock` grades 0.42 → 0.75 across 0.16 → 0.28 and then **flat**: 0.34 reads 2.77 and 0.45
 *    reads 2.73, and total immunity to both crit chance and crit damage is worth **0.88 of one
 *    member**. The reason is the calibrated five — only two of them (Rin at 0.22, Pyra at 0.25)
 *    carry crit worth denying, and the other three sit at 0.02 to 0.05. **A lock is worth what the
 *    party has staked on the thing it denies**, which is the register check asked from the party's
 *    side rather than the pool's. The Demon Tower's `critBlock` band read 0.59 of five at 0.24
 *    against a crew built on crit; this reads 0.75 at 0.28 against a five that mostly is not.
 * 2. ⚠️ **This chapter inverts chapter 14's refusal finding outright.** The Shutgate measured `def`
 *    past its register and `physicalResist` to 0.60 as worth **no more than 0.08 of a survivor** and
 *    concluded the whole refusal vocabulary was fight length rather than difficulty. At this weight
 *    `def` 70 is worth **1.65** and `physicalResist` 0.30 is worth **2.30**, both with zero timeouts.
 *    Nine chapters and two rung moves separate the two readings. **Re-price the vocabulary against
 *    the new chapter's own control; do not carry a table forward** — chapter 21 wrote that about four
 *    inversions in one chapter, and this is the same rule reaching back nine.
 * 3. ⚠️ **`physicalResist` and `def` are cliffs and `critBlock` is a shallow dial, so the chapter is
 *    built on the dial and textured with the cliffs.** `physicalResist` runs 1.00 → 2.30 → **3.50**
 *    across 0.18 → 0.30 → 0.45 and `def` 0.40 → 1.65 → **3.55** across 46 → 70 → 110; neither can
 *    step six times. No board fields `physicalResist` above 0.24 or `def` above the shipped register.
 * 4. ⚠️ **`magicResist` is the flattest reading in the table and that is why it closes the chapter
 *    rather than carrying it.** It is worth 0.20 at 0.16 and only 1.17 at **0.75** — five times the
 *    shipped ceiling — because the calibrated five deal mostly physical damage. What band 6 buys is
 *    the *pairing*: both resists at 0.20 together are worth **1.78**, more than either at 0.30 alone.
 *
 * ## ⚠️ Board rules this chapter follows
 *
 * - **One anchor to a board.** The first draft put {@link GREYLEAF_WARDEN} and
 *   {@link EVENFERN_CREEPER} in one front rank in bands 5 and 6 and both read **0%**, which is
 *   chapter 19's rule reproduced exactly. No board here carries two legendaries.
 * - **The lean is 89.7% of board slots** — in family, between The Spoilfield's 84.0% and The
 *   Longebb's 93.7%. ⚠️ **A first draft measured 96.7% and had to be brought down**: Elf is not the
 *   wildcard row of `FACTION_MATCHUPS` the way Monster is, so a lean that total makes the matchup
 *   very nearly constant across sixty boards. The other 10.3% is Undead — the wood's own dead, still
 *   standing under the same light — spread **6, 5, 5, 3, 3, 9** across the bands.
 * - **32 distinct archetypes**, of which **8 of 30 ordinary are new — 26.7%**, and **10 of 32 —
 *   31.3%** counting the lieutenant and the boss inside the fraction. The same two figures The
 *   Longebb and The Downstroke landed on, for the third chapter running.
 * - **Every fielded block declares a `gearArchetype`**, checked mechanically. ⚠️ **The bill was zero
 *   for this lean**, because The Rustwood and The Slowgrowth paid the Elf one and The Commonage the
 *   Undead one. A fact about the lean rather than a trend.
 */

export const CHAPTER_23 = {
  id: 'chapter-23',
  name: 'The Evenfall',
  stages: [
    {
      id: 'c23-s1',
      name: 'Nothing Casts A Shadow',
      enemies: {
        front: [GLASSBARK_SENTRY, EVENLIGHT_TENDER],
        back: [FLATSHADE_STALKER, THORNLING, GLADE_STALKER],
      },
      level: 515,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s2',
      name: 'The Light Is The Same All Day',
      enemies: {
        front: [GLASSBARK_SENTRY, FLATSHADE_STALKER],
        back: [EVENLIGHT_TENDER, GLOAMVINE_CREEPER, ROADGAUNT_OUTRIDER],
      },
      level: 516,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s3',
      name: 'A Wood With No Noon',
      enemies: {
        front: [GLOAMVINE_CREEPER, EVENLIGHT_TENDER],
        back: [WHISPERLEAF_ARCHER, GLADE_STALKER, TURFBOUND_SLEEPER],
      },
      level: 516,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s4',
      name: 'Every Stroke The Same Stroke',
      enemies: {
        front: [GLASSBARK_SENTRY, EVENLIGHT_TENDER],
        back: [FLATSHADE_STALKER, GLADE_STALKER, THORNLING],
      },
      level: 517,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s5',
      name: 'The Grey Hour',
      enemies: {
        front: [GLASSBARK_SENTRY, FLATSHADE_STALKER],
        back: [EVENLIGHT_TENDER, ROADGAUNT_OUTRIDER, GLOAMVINE_CREEPER],
      },
      level: 517,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s6',
      name: 'Level Light, Level Ground',
      enemies: {
        front: [GLOAMVINE_CREEPER, FLATSHADE_STALKER],
        back: [QUILLRUST_DARTER, THORNLING, TURFBOUND_SLEEPER],
      },
      level: 518,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s7',
      name: 'No Sun Gets In',
      enemies: {
        front: [GLASSBARK_SENTRY, EVENLIGHT_TENDER],
        back: [FLATSHADE_STALKER, THORNLING, GLADE_STALKER],
      },
      level: 518,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s8',
      name: 'The Canopy Holds It Flat',
      enemies: {
        front: [GLASSBARK_SENTRY, FLATSHADE_STALKER],
        back: [EVENLIGHT_TENDER, GLOAMVINE_CREEPER, ROADGAUNT_OUTRIDER],
      },
      level: 519,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s9',
      name: 'Nothing Here Glitters',
      enemies: {
        front: [GLOAMVINE_CREEPER, EVENLIGHT_TENDER],
        back: [WHISPERLEAF_ARCHER, GLADE_STALKER, TURFBOUND_SLEEPER],
      },
      level: 519,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s10',
      name: 'The Unbettered',
      enemies: {
        front: [THE_UNBETTERED, GLASSBARK_SENTRY],
        back: [EVENLIGHT_TENDER, GLOAMVINE_CREEPER, THORNLING],
      },
      level: 520,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s11',
      name: 'Nothing Bites Deeper Here',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, GLADE_STALKER, GLOAMVINE_CREEPER],
      },
      level: 520,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s12',
      name: 'The Briar Takes The Edge',
      enemies: {
        front: [GLOAMVINE_CREEPER, DULLEDGE_BRIAR],
        back: [SUNMOTE_DANCER, FLATSHADE_STALKER, ROADGAUNT_OUTRIDER],
      },
      level: 521,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s13',
      name: 'It Was A Good Swing',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, FLATSHADE_STALKER, GLOAMVINE_CREEPER],
      },
      level: 521,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s14',
      name: 'No Better Hour Than This',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, GLADE_STALKER, GRAVEFURROW_WALKER],
      },
      level: 522,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s15',
      name: 'The Dull Green',
      enemies: {
        front: [GLOAMVINE_CREEPER, DULLEDGE_BRIAR],
        back: [FLATSHADE_STALKER, EVENLIGHT_TENDER, TURFBOUND_SLEEPER],
      },
      level: 522,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s16',
      name: 'It Came Off Blunt',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, FLATSHADE_STALKER, THORNLING],
      },
      level: 523,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s17',
      name: 'Your Best Was Ordinary',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, GLADE_STALKER, GLOAMVINE_CREEPER],
      },
      level: 523,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s18',
      name: 'Nothing Went In Further',
      enemies: {
        front: [GLOAMVINE_CREEPER, DULLEDGE_BRIAR],
        back: [SUNMOTE_DANCER, FLATSHADE_STALKER, ROADGAUNT_OUTRIDER],
      },
      level: 524,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s19',
      name: 'A Clean Hit, And Nothing',
      enemies: {
        front: [GLASSBARK_SENTRY, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, FLATSHADE_STALKER, GLOAMVINE_CREEPER],
      },
      level: 524,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s20',
      name: 'It Has Not Improved',
      enemies: {
        front: [THE_UNBETTERED, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, GLOAMVINE_CREEPER, GRAVEFURROW_WALKER],
      },
      level: 525,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s21',
      name: 'The Bark Turns It',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [EVENLIGHT_TENDER, MEERSTONE_HUSK, MIREMAST_TRUNK],
      },
      level: 525,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s22',
      name: 'Under The Grey Leaf',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [DULLEDGE_BRIAR, FLATSHADE_STALKER, SCALEPLATE_BRAMBLE],
      },
      level: 526,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s23',
      name: 'Half Of It Stays Outside',
      enemies: {
        front: [GREYLEAF_WARDEN, DULLEDGE_BRIAR],
        back: [GLASSBARK_SENTRY, EVENLIGHT_TENDER, UNDERROAD_RANKER],
      },
      level: 526,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s24',
      name: 'The Green Holds',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [EVENLIGHT_TENDER, HOLLOWBARK_SENTRY, MEERSTONE_HUSK],
      },
      level: 527,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s25',
      name: 'Nothing Opens',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [DULLEDGE_BRIAR, EVENLIGHT_TENDER, SCALEPLATE_BRAMBLE],
      },
      level: 527,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s26',
      name: 'It Goes In And Stops',
      enemies: {
        front: [GREYLEAF_WARDEN, DULLEDGE_BRIAR],
        back: [EVENLIGHT_TENDER, FLATSHADE_STALKER, SLAGBLOOM_THICKET],
      },
      level: 528,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s27',
      name: 'Grey All The Way Down',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [EVENLIGHT_TENDER, MEERSTONE_HUSK, MIREMAST_TRUNK],
      },
      level: 528,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s28',
      name: 'The Leaf Was Ready',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [DULLEDGE_BRIAR, FLATSHADE_STALKER, SCALEPLATE_BRAMBLE],
      },
      level: 529,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s29',
      name: 'What Reaches The Wood',
      enemies: {
        front: [GREYLEAF_WARDEN, DULLEDGE_BRIAR],
        back: [GLASSBARK_SENTRY, EVENLIGHT_TENDER, UNDERROAD_RANKER],
      },
      level: 529,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s30',
      name: 'The Same Wood, Later',
      enemies: {
        front: [THE_UNBETTERED, GLASSBARK_SENTRY],
        back: [DULLEDGE_BRIAR, EVENLIGHT_TENDER, SLAGBLOOM_THICKET],
      },
      level: 530,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s31',
      name: 'The Whole Grove Refuses',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, EVENLIGHT_TENDER, SLOWGROWTH_BOLE],
      },
      level: 530,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s32',
      name: 'It Does Not Reach The Wood',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, DULLEDGE_BRIAR, HOLLOWBARK_SENTRY],
      },
      level: 531,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s33',
      name: 'Grown Against The Edge',
      enemies: {
        front: [GREYLEAF_WARDEN, NOONLESS_ARCHER],
        back: [GLASSBARK_SENTRY, EVENLIGHT_TENDER, MILEWORN_HUSK],
      },
      level: 531,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s34',
      name: 'Nothing Gets Its Best',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, DULLEDGE_BRIAR, SLOWGROWTH_BOLE],
      },
      level: 532,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s35',
      name: 'The Quiet Under It',
      enemies: {
        front: [GREYLEAF_WARDEN, NOONLESS_ARCHER],
        back: [EVENLIGHT_TENDER, SCALEPLATE_BRAMBLE, CAIRNWARD_HUSK],
      },
      level: 532,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s36',
      name: 'Bark Over Bark',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, MIREMAST_TRUNK, EVENLIGHT_TENDER],
      },
      level: 533,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s37',
      name: 'Every Trunk The Same Answer',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, EVENLIGHT_TENDER, SLOWGROWTH_BOLE],
      },
      level: 533,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s38',
      name: 'There Is No Thin Part',
      enemies: {
        front: [GREYLEAF_WARDEN, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, DULLEDGE_BRIAR, HOLLOWBARK_SENTRY],
      },
      level: 534,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s39',
      name: 'It Has All Been Growing',
      enemies: {
        front: [GREYLEAF_WARDEN, NOONLESS_ARCHER],
        back: [GLASSBARK_SENTRY, EVENLIGHT_TENDER, MILEWORN_HUSK],
      },
      level: 534,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s40',
      name: 'Nothing It Has Not Turned',
      enemies: {
        front: [THE_UNBETTERED, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, EVENLIGHT_TENDER, SLOWGROWTH_BOLE],
      },
      level: 535,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s41',
      name: 'Thicker Than It Looks',
      enemies: {
        front: [EVENFERN_CREEPER, NOONLESS_ARCHER],
        back: [SHADOWLESS_DANCER, DULLEDGE_BRIAR, SLAGBLOOM_THICKET],
      },
      level: 535,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s42',
      name: 'The Fern Has Had Years',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, NOONLESS_ARCHER, LAMPLESS_PILGRIM],
      },
      level: 536,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s43',
      name: 'Past What The Wood Should Carry',
      enemies: {
        front: [EVENFERN_CREEPER, NOONLESS_ARCHER],
        back: [SHADOWLESS_DANCER, DULLEDGE_BRIAR, SCALEPLATE_BRAMBLE],
      },
      level: 536,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s44',
      name: 'Nothing Counts For Full',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [NOONLESS_ARCHER, SHADOWLESS_DANCER, SLOWGROWTH_BOLE],
      },
      level: 537,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s45',
      name: 'Deep Green, Even Light',
      enemies: {
        front: [EVENFERN_CREEPER, NOONLESS_ARCHER],
        back: [SHADOWLESS_DANCER, EVENLIGHT_TENDER, CHARNEL_DRUDGE],
      },
      level: 537,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s46',
      name: 'Years Of It, All The Same',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, NOONLESS_ARCHER, MIREMAST_TRUNK],
      },
      level: 538,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s47',
      name: 'Deeper Than The Register',
      enemies: {
        front: [EVENFERN_CREEPER, NOONLESS_ARCHER],
        back: [SHADOWLESS_DANCER, DULLEDGE_BRIAR, SLAGBLOOM_THICKET],
      },
      level: 538,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s48',
      name: 'It Was Always This Thick',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, NOONLESS_ARCHER, LAMPLESS_PILGRIM],
      },
      level: 539,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s49',
      name: 'Nothing Arrives Whole',
      enemies: {
        front: [EVENFERN_CREEPER, NOONLESS_ARCHER],
        back: [SHADOWLESS_DANCER, DULLEDGE_BRIAR, SCALEPLATE_BRAMBLE],
      },
      level: 539,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s50',
      name: 'Still Standing, Still Even',
      enemies: {
        front: [THE_UNBETTERED, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, EVENLIGHT_TENDER, MIREMAST_TRUNK],
      },
      level: 540,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s51',
      name: 'Neither Kind Of It Lands',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, NOONLESS_ARCHER, CHARNEL_DRUDGE],
      },
      level: 540,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s52',
      name: 'The Last Of The Light',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [NOONLESS_ARCHER, DULLEDGE_BRIAR, BARROWMIST_KEENER],
      },
      level: 541,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s53',
      name: 'The Light Goes Flat',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [GLASSBARK_SENTRY, NOONLESS_ARCHER, CHARNEL_DRUDGE],
      },
      level: 541,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s54',
      name: 'It Was Never Going To Be Better',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [NOONLESS_ARCHER, MIREMAST_TRUNK, CHAFFMOUTH_GAUNT],
      },
      level: 542,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s55',
      name: 'Nothing Here Improves',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [NOONLESS_ARCHER, EVENLIGHT_TENDER, CHARNEL_DRUDGE],
      },
      level: 542,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s56',
      name: 'The Wood Keeps Its Own Level',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [NOONLESS_ARCHER, FLATSHADE_STALKER, BARROWMIST_KEENER],
      },
      level: 543,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s57',
      name: 'Both Kinds Turned Aside',
      enemies: {
        front: [EVENFERN_CREEPER, GLASSBARK_SENTRY],
        back: [SHADOWLESS_DANCER, NOONLESS_ARCHER, CHARNEL_DRUDGE],
      },
      level: 543,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s58',
      name: 'No Hour Better Than This One',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [NOONLESS_ARCHER, DULLEDGE_BRIAR, BARROWMIST_KEENER],
      },
      level: 544,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s59',
      name: 'The Light Does Not Move',
      enemies: {
        front: [EVENFERN_CREEPER, SHADOWLESS_DANCER],
        back: [GLASSBARK_SENTRY, NOONLESS_ARCHER, CHARNEL_DRUDGE],
      },
      level: 544,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c23-s60',
      name: 'The Evenfall',
      enemies: {
        front: [THE_EVENFALL, GLASSBARK_SENTRY],
        back: [EVENLIGHT_TENDER, FLATSHADE_STALKER, DULLEDGE_BRIAR],
      },
      level: 545,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
