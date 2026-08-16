import {
  ACOLYTE,
  BACKSTROKE_IRONSIDE,
  BANDIT,
  BOLTFAST_IRONSIDE,
  COUNTERSIGN_CAPTAIN,
  COUNTERWEIGHT_BEARER,
  EDGETURN_WARDEN,
  FREE_BLADE,
  GANTRY_WARDEN,
  GATEFAST_WARDEN,
  HARNESS_CUTTER,
  HEAPFOOT_RUMMAGER,
  IRONTALLY_MASON,
  KINSTONE_BEARER,
  MARCHWARD_PIKEMAN,
  MUSTERYARD_HAND,
  MUSTER_PIKE,
  OATHSHIELD_VANGUARD,
  ORDER_SERJEANT,
  PAWLSET_WRIGHT,
  RAMHEAD_SERJEANT,
  RESERVE_ENSIGN,
  ROADWATCH_BOWMAN,
  SIGHTLINE_CLERK,
  SLAGBOUND_DRUDGE,
  THE_HELDBACK,
  THE_OVERSTRIKE,
  THE_QUARTERMASTER,
  TRACKWAY_GANG,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
  WINDLASS_CREW,
} from './enemies';

/**
 * Chapter 22 — The Downstroke.
 *
 * **Sixty stages**, enemy levels 485 to 515. It **opens at the level chapter 21 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Longebb did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, and the longebb whether it **still holds its value**. This one asks
 * whether it **arrives all at once**.
 *
 * A downstroke is a siege works: a yard full of machines built to do one thing, once, as hard as a
 * thing can be done. Nothing on the spine of these boards is quick. Every anchor is drawn back
 * further and released more rarely than the band it stands in would otherwise carry, and the chapter
 * walks that one idea from a habit to a threat — a blow, then a bigger blow, then two of them, then
 * one that reaches past the front rank, and at the end one that does not care where anybody stands.
 *
 * | Band               | Stages | Levels  | The lock it teaches                                       |
 * | ------------------ | ------ | ------- | --------------------------------------------------------- |
 * | The mustering yard | 1–10   | 485–490 | the habit only: slow bodies, {@link LONG_HAUL}, no carrier |
 * | The drawn cord     | 11–20  | 490–495 | one carrier of {@link THE_CORD_DRAWS} (1.9 at cd 42)      |
 * | The counterweight  | 21–30  | 495–500 | {@link FULL_WEIGHT} arrives (2.6 at cd 60), and stays     |
 * | The trackway       | 31–40  | 500–505 | two carriers of the cord beside the counterweight         |
 * | The engine floor   | 41–50  | 505–510 | the blow acquires a **reach** ({@link OVER_THE_LINE})      |
 * | The downstroke     | 51–60  | 510–515 | the blow on the **scope** ({@link EVERYTHING_AT_ONCE})     |
 *
 * ## ⚠️ The rung moves to `mythic-plus`, and it is an override rather than a derivation
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 21's seam of **0.8241** and The Downstroke's close of 515, `mythic` reads **0.4418**
 * (|Δln| **0.6235**) and `mythic-plus` **3.7273** (|Δln| **1.5091**). **The rule prefers staying on
 * `mythic` by 0.886 of a nat, and this chapter overrides it** — the second override in the
 * campaign's history, after chapter 18.
 *
 * ⚠️ **What licenses an override is the seam *below* being wrong, and here it is.** Chapter 21
 * landed on 0.8241 — under 1.00, meaning the content at the top of the ladder is nominally ahead of
 * the party it is tuned for — and declined to override on the argument that its own chapter was
 * still authorable out of the pool. That argument does not survive another thirty levels:
 *
 * | board at level 515, against the `mythic` five                        | reading       |
 * | -------------------------------------------------------------------- | ------------- |
 * | the **five lightest bodies in the game** (100/104/106/122/126 health) | **0% / 0.00** |
 * | the five heaviest of The Quickmire's light Monsters                   | **0% / 0.00** |
 * | (the same five lightest bodies at level 485, for comparison)          | 100% / 4.00   |
 *
 * **There is no chapter 22 on `mythic`** — not a hard one, not any. That is chapter 18's situation
 * reproduced one rung up, and chapter 21 predicted it in writing: "chapter 22 closes at 515, where
 * the same boards are worth ×1.86 more and nothing shipped can stand on one."
 *
 * ⚠️ **The rung move re-opens the pool, which is the other half of what an override buys.** Against
 * the `mythic-plus` five a board at level 515 reads 4.00 of five at about 9,500 common-equivalent and
 * 0.00 at 11,900, and **181 of the 282 blocks that existed before this chapter sit inside the band
 * its ordinary slots use**. Chapter 18 measured 116 of 238 after its own move; this is the same event
 * with the same shape. Nothing in `data/` had to change.
 *
 * ⚠️ **`mythic-plus` was fielded rather than reasoned about.** Chapter 21's own final refielded at
 * level 515 reads **100% with all five alive in 3.1 seconds** against the new party — a walkover, and
 * the honest consequence of a rung move rather than a defect. Chapter 18's boundary read the same
 * way. What it means for authoring is that this chapter's boards are the **first authored heavier
 * than the chapter below them since chapter 13**.
 *
 * ## ⚠️ The chapter's central measurement, taken before a board was written
 *
 * Priced against one calibrated control — an anchor of 3,200/295 behind four bodies of 1,800/250 at
 * level 515 and Relic 100, **10,400 common-equivalent**, reading **3.08 of five at 160 trials** and
 * 3.05 at the 40 the sweep uses — and it **moves** (4.00 at 9,500, 3.67 at 10,100, 2.63 at 10,700,
 * 1.02 at 11,300, 0.00 at 11,900). Zero timeouts on every row below.
 *
 * **The premise, as a single-target turn on one front carrier** — bigger and rarer in step, so
 * damage per second is roughly held:
 *
 * | power / cooldown | survivors | worth | longest |
 * | ---------------- | --------- | ----- | ------- |
 * | 1.20 / 25        | 2.99      | 0.09  | 23.0s   |
 * | 1.55 / 35        | 2.93      | 0.14  | 23.0s   |
 * | 1.90 / 42        | 2.64      | 0.43  | 25.0s   |
 * | 2.20 / 50        | 2.48      | 0.60  | 45.4s   |
 * | 2.60 / 60        | 2.25      | 0.83  | 45.4s   |
 * | 3.10 / 70        | 2.22      | 0.86  | 53.5s   |
 * | 3.60 / 80        | 1.36      | 1.72  | 55.9s   |
 *
 * 1. ⚠️ **It has to be a single-target turn, because `skills.spec.ts` caps a wide skill at power
 *    1.2** — `enemy-all`, `enemy-row-front` and `enemy-row-back` may not carry a big blow at all. The
 *    first draft of this chapter measured the whole axis on `enemy-row-front` at power 1.55 to 3.10
 *    and **every row of it described a skill the game will not let anybody author**; the cap caught
 *    it, not the sweep. **Check what a target is allowed to carry before pricing a mechanic on it.**
 * 2. ⚠️ **On the legal target it is still a dial where nearly everything else at this weight is a
 *    cliff, and that is the whole reason the chapter exists.** Monotone across a threefold range of
 *    instance size with **zero timeouts on every row** — which is what tells difficulty apart from
 *    the ninety-second clock. Six bands need six steps and this axis has them, at a shallower slope
 *    than the illegal version promised.
 * 3. ⚠️ **Two carriers is worth roughly one power-step more than one**: 0.13 / 0.35 / 0.69 / 0.74 at
 *    power 1.20 / 1.55 / 1.90 / 2.20 against one carrier's 0.09 / 0.14 / 0.43 / 0.60. A **reach** on
 *    `enemy-back` — single-target, so uncapped — is worth 0.33 / 0.55 / 0.72 at power 1.90 / 2.40 /
 *    2.90.
 * 4. ⚠️ **The stat-block form of the same idea works board-wide and fails on one body, which is a
 *    finding about the axis rather than about a stat.** Holding damage per second and trading `atk`
 *    against `haste` across the whole board reads 3.05 / 2.33 / 1.98 / 1.80 / **0.40** at ×1.00 /
 *    1.15 / 1.30 / 1.45 / 1.60. On a **single body** the same trade is **non-monotone** — 3.08 / 2.39
 *    / 2.20 / **2.91** / 2.55 / **3.01** at ×1.0 through ×4.0, re-measured at 160 trials — because
 *    past about ×2.5 the body's period exceeds the fight and the second swing never lands. **Nominal
 *    damage per second stops describing a body once its cooldown is longer than the battle.** So the
 *    chapter's carriers are authored as **skills** and its texture as `haste`.
 *
 * ## ⚠️ The aim rule arrives on a damage turn, and the first measurement of it was confounded
 *
 * The same escort body carrying {@link EVERYTHING_AT_ONCE} at the wide cap of 1.2, moved between
 * ranks with nothing else changed:
 *
 * | arrangement                    | survivors | worth    |
 * | ------------------------------ | --------- | -------- |
 * | cd 50, **front** rank          | 3.01      | **0.07** |
 * | cd 50, **back** rank           | 2.43      | **0.64** |
 * | cd 60, front / back            | 3.01/2.61 | 0.07/0.46 |
 * | cd 70, front / back            | 3.01/2.66 | 0.07/0.42 |
 *
 * ⚠️ **Chapter 16 measured that shape on a `WEAKEN` and chapter 19 measured it with the opposite sign
 * on a reflect; this is the first time it has been measured on plain damage, and it behaves like the
 * debuff.** ⚠️ **The first version of this table read the reverse and the cause was a confound**: the
 * front arm happened to be carried by the board's anchor and the back arm by an escort, so it varied
 * two things at once. **A rank comparison has to be carried on one body.**
 *
 * ⚠️ **This chapter takes the *back-rank* arrangement, which is the opposite of what chapter 16's
 * rule prescribes, and the difference is that a scope worth 0.07 is not a lock.** What chapter 16
 * forbids is an unreachable body applying a status that never lapses — it measured 4.00 against 0.10,
 * a fortyfold swing, and the board was unanswerable. This is damage: it bills once and depletes
 * nothing, the party reaches the caster as soon as the front rank falls, and the gap is 0.07 against
 * 0.64. **Take the measurement, not the precedent.** {@link SIGHTLINE_CLERK}, whose reach is worth a
 * real 0.55 from the front, stands in the **front** rank for the same reason read the other way.
 *
 * ## ⚠️ The rest of the vocabulary, re-priced against this chapter's own control
 *
 * Chapter 21 wrote that a figure quoted without the weight it was measured at means nothing, and
 * this chapter's board is **twelve times** its weight. Every reading moved. (Against the 40-trial
 * control at 3.05.)
 *
 * | shape                                       | survivors | worth     |
 * | ------------------------------------------- | --------- | --------- |
 * | {@link THORNMAIL} on all five               | 4.00      | **−0.95** |
 * | {@link THORNMAIL} on the back three         | 4.00      | −0.95     |
 * | {@link THORNMAIL} on the front two          | 3.42      | −0.38     |
 * | {@link SAVAGED} on `enemy-all`, one carrier | 3.23      | **−0.18** |
 * | {@link OATHSHIELD} on the front anchor      | 3.08      | −0.03     |
 * | {@link BLOODRISEN} on `self`, all five      | 3.02      | 0.02      |
 * | {@link GUARD} on `ally-all`, one carrier    | 2.90      | 0.15      |
 * | {@link SUNDER} on `enemy-all`, one carrier  | 2.60      | 0.45      |
 * | {@link ROOTBOUND} on all five               | 2.38      | 0.67      |
 * | {@link CHAINBOND} cast on `ally-all`        | 1.95      | 1.10      |
 * | {@link STUN} on `enemy-all`, one carrier    | 0.07      | 2.97      |
 * | {@link SLOW} on `enemy-all`, one carrier    | 0.07      | 2.97      |
 * | {@link HASTE} on `ally-all`, one carrier    | 0.03      | **3.02**  |
 * | {@link RALLY} on `ally-all`, one carrier    | 0.03      | 3.02      |
 * | {@link WEAKEN} on `enemy-all`, one carrier  | 0.03      | 3.02      |
 *
 * And the bare stats, board-wide: `dodge` 0.10 / 0.20 / 0.30 is worth 0.15 / 1.67 / 2.85;
 * `physicalPierce` 0.15 / 0.30 / 0.45 is worth 0.55 / 1.50 / 2.40; `lifeLeech` 0.05 / 0.15 / 0.25 /
 * 0.40 is worth 0.10 / 0.20 / 0.40 / 1.27; `physicalResist` 0.20 / 0.40 is worth 1.25 / 3.05; and
 * board `haste` 110 is already worth 2.17 with 125 a total wipe.
 *
 * 1. ⚠️ **A reflect is worth *less than nothing* here, on all three arrangements, where chapter 21
 *    measured the same status at +0.73 across five.** The mechanism is chapter 20's: the turn a body
 *    spends applying a status is a turn it does not spend attacking, and at this weight the attack is
 *    worth more than the reflect. **A status is never free of what it displaces.**
 * 2. ⚠️ **{@link SAVAGED} on a scope has now come back at +1.27 (chapter 21) and −0.18 (here) on the
 *    same arm** — a fourth sign for one status, and the clearest argument yet that this table cannot
 *    be carried between chapters at all.
 * 3. ⚠️ **The whole tempo half of the vocabulary is a total wipe from one carrier** — `HASTE`,
 *    `RALLY`, `WEAKEN`, `SLOW` and `STUN` all read 0.03 to 0.07 of five. No board here carries any of
 *    them deliberately, which is why the chapter had to be built on damage instance size rather than
 *    on a status. ⚠️ **And one returning block carries two of them by accident**: the Order Serjeant's
 *    {@link THE_ORDER_STANDS} is a board-wide `GUARD` **and** `RALLY`. It is affordable in bands 1
 *    through 3 and lethal past them — `c22-s58` read **8% with 0.10 survivors** with it in an escort
 *    slot at 8,119 common-equivalent, where the *heavier* Edgeturn Warden at 8,544 reads 4.00.
 *    **Read a returning block's kit, not only its stat line.**
 *
 * ## ⚠️ The lean is Human for the third time, and its bench and the premise disagree
 *
 * Human leads chapters 11, 16 and 22. It was the thinnest legal lead at **36** blocks — angel 24 and
 * demon 25 are barred — and the fewest leads of the five mortal factions.
 *
 * ⚠️ **The wall this chapter met is a *faction* wall on `haste`, which is chapter 20's finding
 * wearing a different stat.** The Commonage found twelve blocks under 150 health and every one a
 * Monster; The Downstroke's premise is slowness and **Human's bench is not slow** — its median
 * `haste` is 92 against a shipped median of 96 and a floor of 52. **Fourteen** returning Human blocks
 * sit at 92 or under and **three of those are past this chapter's weight budget** (the Pale Warden,
 * the Breachlord and the Colour Serjeant, at 4,972 to 6,485 common-equivalent), so the usable slow
 * bench is **eleven**. A first draft leaned on Dwarf to make up the weight and came out **55%
 * Human** with only 25 distinct archetypes, which is not a Human chapter. What fixed it was noticing
 * that five returning Humans sit in the **1,700–2,400 common-equivalent band** — the Countersign
 * Captain, the Oathshield Vanguard, the Order Serjeant, the Reserve Ensign and the Quartermaster —
 * and the draft was using none of them.
 *
 * ⚠️ **The resolution is that speed is only unaffordable on a *heavy* body.** Every board that failed
 * in tuning to its escort lost to a body that was both fast and over 1,600 common-equivalent — the
 * Crownworks Striker at haste 118 and 80 attack, the Standfast Lancer at 96 and 80. The **light**
 * fast Humans cost nothing: the Free Blade, the Bandit, the Vanward Spear, the Roadwatch Bowman, the
 * Harness Cutter and the Heapfoot Rummager all sit at or under 560 common-equivalent and are fielded
 * as the runners and pickets between the engines. **The refusal is a joint condition on speed and
 * weight, not on speed.**
 *
 * ⚠️ **So the claim this chapter makes about itself is scoped, and it is this**: across its 300 board
 * slots the **median `haste` is 72**, and every fielded body above 92 sits at or under 560
 * common-equivalent.
 * It is *not* "nothing here is fast" — six fielded blocks run 96 to 114, and stating the threshold
 * rather than the measurement is how three tower headers shipped a false claim.
 *
 * The lean measures **84.0% of board slots**, against The Standing Line's 83.2% and The Spoilfield's
 * 84.0% — in family. The non-lean texture is **Dwarf**, the crew that cut the timber and forged the
 * ironwork, and its slots run **5, 6, 7, 8, 15, 7** across the six bands: heaviest in band 5, because
 * that is where the chapter wants the slowest bodies in the game and Dwarf is where they live.
 *
 * ## ⚠️ Escort attack binds in the closing band, and the ordering inverts
 *
 * Measured on band 6's own boards rather than on the control: an escort body at **60** attack reads
 * 4.00 of five, at **70** reads 1.65, and at **74** reads 0.00 — same weight, same board, same
 * anchor. That is chapter 21's "the anchor sets the fight length and the escort sets the rate at
 * which length becomes deaths".
 *
 * ⚠️ **But weight only shortlists, and the ordering inverted twice here.** `c22-s58` reads 4.00 with
 * the Edgeturn Warden at 2,247 common-equivalent in an escort slot and **8%** with the Order Serjeant
 * at 1,706 — a board 5% *lighter* losing the whole fight, because the lighter body is the one
 * carrying a board-wide `RALLY`. Chapter 19 found no scalar predicts a board; this is that on a pair
 * of stat lines one of which has a kit.
 *
 * ## The blocks, the quota, the gear and the spine
 *
 * Thirty-two distinct archetypes, **ten of them new** — eight ordinary plus {@link THE_HELDBACK} and
 * {@link THE_OVERSTRIKE}. That is **26.7%** under the shipped rule, which excludes the two uniques
 * from both sides of the fraction, and **31.3%** counting them inside — the same two figures The
 * Longebb landed on. Both clear the quarter, and the quota lands at the quota for the fourth chapter
 * running: the rung move paying out on the pool exactly as chapter 18's did.
 *
 * ⚠️ **The `gearArchetype` bill landed here after three chapters of zero**, and it is a fact about
 * the lean rather than a trend: only **19 of 36** Human blocks carried one, because The Spoilfield
 * fielded seven Humans and The Standing Line predates enemy gear entirely. Eleven returning blocks
 * took a one-line edit before a single board could be authored — and every one of them appears only
 * in ungeared content below chapter 12, so the edit changed nothing anywhere else. Every board here
 * carries **Relic 100, flat**, for the sixth chapter running; the grade ladder was exhausted at
 * chapter 17 and a sixth grade is a `data/` rule change rather than a chapter.
 *
 * **The spine.** The difficulty probe samples `c22-s3`, `s7`, … `s59` and the final — the stride is
 * over the *whole* ladder and this chapter opens at global index 970, so the phase lands on s3 rather
 * than s1. It runs **95,427 → 151,331** with a worst adjacent ratio of **0.876** against the 0.85
 * bar. All sixty boards clear at 100% with **zero timeouts**, the longest single fight anywhere in
 * the chapter is **59.5s** against a 72s bar, and the board budget runs 7,730 → 8,672
 * common-equivalent with the final at 5,318.
 *
 * ⚠️ **Band 4 opens heavier than band 3 closes** — 9,617 against 8,608 — which is chapter 21's rule:
 * the weight drop that would pay for a new lock is the only half the probe can see, so a band that
 * adds one must not also get lighter. It read a step backwards at 0.770 against the 0.85 bar before
 * it was lifted, and band 5 read 0.810 for the same reason a draft earlier.
 *
 * ⚠️ **Two boards had to come down off the ninety-second clock rather than off a survivor count**:
 * `c22-s38` measured 95% with a worst fight of **71.0s** against the 72s bar, and `c22-s40` 48% at
 * 71.7s. Both were three heavy slow bodies plus two carriers. **Count the seconds as well as the
 * survivors** — the guard reads the longest fight a party actually *clears*, so a marginal clear is
 * exactly the fight that lands in it.
 *
 * ## ⚠️ What the next chapter should expect
 *
 * `mythic-plus` caps at **420** against this chapter's close of 515, so the seam is already
 * ninety-five levels above the cap and the degenerate chain restarts at one link. Each further
 * sixty-stage chapter on this rung divides the seam by `perLevel.common ** 30` = **1.867**: chapter
 * 23 reads **1.9981**, chapter 24 **1.0711**, chapter 25 **0.5742**. **So the arithmetic buys about
 * two and a half chapters** — and chapters 19 through 21 are the record of the arithmetic being right
 * and the *pool* running out first. **Measure the pool before re-deriving the seam.** The next rung,
 * `ascended`, caps at 500 and is the last one the campaign can spend.
 */
export const CHAPTER_22 = {
  id: 'chapter-22',
  name: 'The Downstroke',
  stages: [
    {
      id: 'c22-s1',
      name: 'The Yard Before Dawn',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, OATHSHIELD_VANGUARD],
        back: [COUNTERSIGN_CAPTAIN, MUSTERYARD_HAND, FREE_BLADE],
      },
      level: 485,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s2',
      name: 'Everything Is Drawn Up',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, EDGETURN_WARDEN],
        back: [ORDER_SERJEANT, MUSTERYARD_HAND, BANDIT],
      },
      level: 486,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s3',
      name: 'Nothing Swings Twice',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, OATHSHIELD_VANGUARD],
        back: [RESERVE_ENSIGN, MUSTERYARD_HAND, VANWARD_SPEAR],
      },
      level: 486,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s4',
      name: 'The Slow Count',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, COUNTERSIGN_CAPTAIN],
        back: [OATHSHIELD_VANGUARD, MUSTER_PIKE, ROADWATCH_BOWMAN],
      },
      level: 487,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s5',
      name: 'Timber Enough For One',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, BOLTFAST_IRONSIDE],
        back: [ORDER_SERJEANT, MUSTERYARD_HAND, FREE_BLADE],
      },
      level: 487,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s6',
      name: 'They Only Get One Go',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, OATHSHIELD_VANGUARD],
        back: [COUNTERSIGN_CAPTAIN, VAULTBOUND_GAOLER, HARNESS_CUTTER],
      },
      level: 488,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s7',
      name: 'Weighed Out By Hand',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, RESERVE_ENSIGN],
        back: [EDGETURN_WARDEN, MUSTERYARD_HAND, BANDIT],
      },
      level: 488,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s8',
      name: 'The Long Arm Laid Flat',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, OATHSHIELD_VANGUARD],
        back: [ORDER_SERJEANT, MUSTER_PIKE, MARCHWARD_PIKEMAN],
      },
      level: 489,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s9',
      name: 'Braced Against The Ground',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, COUNTERSIGN_CAPTAIN],
        back: [EDGETURN_WARDEN, MUSTERYARD_HAND, VANWARD_SPEAR],
      },
      level: 489,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s10',
      name: 'The Heldback',
      enemies: {
        front: [THE_HELDBACK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, MUSTERYARD_HAND, FREE_BLADE],
      },
      level: 490,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s11',
      name: 'The Cord Takes The Strain',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, MUSTERYARD_HAND, FREE_BLADE],
      },
      level: 490,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s12',
      name: 'Hand Over Hand',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, ORDER_SERJEANT, BANDIT],
      },
      level: 491,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s13',
      name: 'Nothing Yet',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, MUSTER_PIKE, MARCHWARD_PIKEMAN],
      },
      level: 491,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s14',
      name: 'Still Nothing',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [COUNTERSIGN_CAPTAIN, MUSTERYARD_HAND, VANWARD_SPEAR],
      },
      level: 492,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s15',
      name: 'The Pawls Hold',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [BOLTFAST_IRONSIDE, VAULTBOUND_GAOLER, ROADWATCH_BOWMAN],
      },
      level: 492,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s16',
      name: 'A Sound Like Rope',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, MUSTERYARD_HAND, KINSTONE_BEARER],
      },
      level: 493,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s17',
      name: 'Wound To The Mark',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [RESERVE_ENSIGN, MUSTER_PIKE, FREE_BLADE],
      },
      level: 493,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s18',
      name: 'The Yard Goes Quiet',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, THE_QUARTERMASTER, HARNESS_CUTTER],
      },
      level: 494,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s19',
      name: 'Everyone Steps Back',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, ACOLYTE, BANDIT],
      },
      level: 494,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s20',
      name: 'The Heldback Draws',
      enemies: {
        front: [THE_HELDBACK, RAMHEAD_SERJEANT],
        back: [OATHSHIELD_VANGUARD, MUSTERYARD_HAND, GATEFAST_WARDEN],
      },
      level: 495,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s21',
      name: 'The Weight Goes On',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, MARCHWARD_PIKEMAN],
      },
      level: 495,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s22',
      name: 'Stone Into The Basket',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, BANDIT],
      },
      level: 496,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s23',
      name: 'More Than It Needs',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [COUNTERSIGN_CAPTAIN, ORDER_SERJEANT, FREE_BLADE],
      },
      level: 496,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s24',
      name: 'The Frame Complains',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, SLAGBOUND_DRUDGE],
      },
      level: 497,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s25',
      name: 'Loaded Past The Mark',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [BOLTFAST_IRONSIDE, MUSTER_PIKE, VANWARD_SPEAR],
      },
      level: 497,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s26',
      name: 'It Will Not Be Undone',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, IRONTALLY_MASON],
      },
      level: 498,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s27',
      name: 'One Answer Only',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [RESERVE_ENSIGN, THE_QUARTERMASTER, ROADWATCH_BOWMAN],
      },
      level: 498,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s28',
      name: 'The Basket Full',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, HEAPFOOT_RUMMAGER],
      },
      level: 499,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s29',
      name: 'Nothing Held In Reserve',
      enemies: {
        front: [RAMHEAD_SERJEANT, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, ORDER_SERJEANT, FREE_BLADE],
      },
      level: 499,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s30',
      name: 'The Heldback Loaded',
      enemies: {
        front: [THE_HELDBACK, RAMHEAD_SERJEANT],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, KINSTONE_BEARER],
      },
      level: 500,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s31',
      name: 'Laid Along The Track',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, EDGETURN_WARDEN],
      },
      level: 500,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s32',
      name: 'Two Arms Working',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, BOLTFAST_IRONSIDE],
      },
      level: 501,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s33',
      name: 'Both At Once',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, OATHSHIELD_VANGUARD],
      },
      level: 501,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s34',
      name: 'The Rails Take It',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, EDGETURN_WARDEN],
      },
      level: 502,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s35',
      name: 'Dragged To The Line',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, BOLTFAST_IRONSIDE],
      },
      level: 502,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s36',
      name: 'Nothing Turns Aside',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, OATHSHIELD_VANGUARD],
      },
      level: 503,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s37',
      name: 'The Second Arm',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, BACKSTROKE_IRONSIDE],
      },
      level: 503,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s38',
      name: 'Wheel And Sledge',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, MARCHWARD_PIKEMAN],
      },
      level: 504,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s39',
      name: 'Set Against The Wall',
      enemies: {
        front: [RAMHEAD_SERJEANT, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, IRONTALLY_MASON],
      },
      level: 504,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s40',
      name: 'The Heldback On The Track',
      enemies: {
        front: [THE_HELDBACK, RAMHEAD_SERJEANT],
        back: [COUNTERWEIGHT_BEARER, TRACKWAY_GANG, MARCHWARD_PIKEMAN],
      },
      level: 505,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s41',
      name: 'Over The Heads Of It',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, EDGETURN_WARDEN, MARCHWARD_PIKEMAN],
      },
      level: 505,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s42',
      name: 'Sighted Long',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, BOLTFAST_IRONSIDE, FREE_BLADE],
      },
      level: 506,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s43',
      name: 'Past The First Rank',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, OATHSHIELD_VANGUARD, BANDIT],
      },
      level: 506,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s44',
      name: 'The Mark Is Behind You',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, BOLTFAST_IRONSIDE, VANWARD_SPEAR],
      },
      level: 507,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s45',
      name: 'Nothing In Front Matters',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, EDGETURN_WARDEN, KINSTONE_BEARER],
      },
      level: 507,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s46',
      name: 'Laid On The Far Rank',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, ACOLYTE, IRONTALLY_MASON],
      },
      level: 508,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s47',
      name: 'A Line Drawn Through',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, EDGETURN_WARDEN, GATEFAST_WARDEN],
      },
      level: 508,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s48',
      name: 'Two Marks At Once',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, OATHSHIELD_VANGUARD, SLAGBOUND_DRUDGE],
      },
      level: 509,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s49',
      name: 'Ranged And Ready',
      enemies: {
        front: [SIGHTLINE_CLERK, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, BOLTFAST_IRONSIDE, MARCHWARD_PIKEMAN],
      },
      level: 509,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s50',
      name: 'The Heldback Sighted',
      enemies: {
        front: [THE_HELDBACK, SIGHTLINE_CLERK],
        back: [TRACKWAY_GANG, MUSTERYARD_HAND, FREE_BLADE],
      },
      level: 510,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s51',
      name: 'Everything At Once',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 510,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s52',
      name: 'The Arm Comes Over',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 511,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s53',
      name: 'Nowhere Is Behind It',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 511,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s54',
      name: 'The Whole Yard Braced',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 512,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s55',
      name: 'One Stroke Is All It Has',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 512,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s56',
      name: 'It Has Been Drawing All Year',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [OATHSHIELD_VANGUARD, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 513,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s57',
      name: 'The Pawls Let Go',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [BOLTFAST_IRONSIDE, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 513,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s58',
      name: 'Nothing Is Held Back',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 514,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s59',
      name: 'The Last Turn Of The Winch',
      enemies: {
        front: [GANTRY_WARDEN, COUNTERWEIGHT_BEARER],
        back: [EDGETURN_WARDEN, TRACKWAY_GANG, PAWLSET_WRIGHT],
      },
      level: 514,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c22-s60',
      name: 'The Overstrike',
      enemies: {
        front: [THE_OVERSTRIKE, MUSTERYARD_HAND],
        back: [TRACKWAY_GANG, WINDLASS_CREW, VAULTBOUND_GAOLER],
      },
      level: 515,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
