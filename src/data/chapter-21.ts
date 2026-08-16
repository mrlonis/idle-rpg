import {
  ASHPIT_SCUTTLER,
  BAREMARK_GNAWER,
  BINDWEED_DEAD,
  BOAR,
  CARRION_SWARM,
  CHANNELBED_STALKER,
  CLEFTHORN_GORER,
  DRIFTMOUTH_CHOKER,
  EBBDRIFT_LATCHER,
  FENSPAWN_SKITTER,
  HAMMERTIDE_LURCHER,
  LONGEBB_RENDER,
  LOWMARK_DRIFTER,
  MIREFOOT_RUNNER,
  MIREWHELP,
  NEAPMARK_WRETCH,
  PACKCALL_WHISTLER,
  QUICKMIRE_SKIMMER,
  REEDBACK_COURSER,
  RENDFANG_JACKAL,
  RIVENMIRE_SPRINTER,
  SALTBLEACH_CRIER,
  SCREEBACK_DARTER,
  SHEAFLESS_SHADE,
  SILTWAKE_DARTER,
  SLACKRUN_SIPPER,
  SLIME,
  SPINEDRIFT_LANCER,
  SUMPWATER_BROOD,
  THE_UNDERTOW,
  THE_UNRETURNED,
  WISP,
} from './enemies';

/**
 * Chapter 21 — The Longebb.
 *
 * **Sixty stages**, enemy levels 455 to 485. It **opens at the level chapter 20 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step. The
 * sixty is the schedule chapter 20 put in `CHAPTER_CURVE` (`raisedMaxFromChapter` 20), not a second
 * exception — every chapter from here is sixty by the same formula.
 *
 * ## What it asks that The Commonage did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, and the commonage whether it gets
 * to **choose where it goes**. This one asks whether it **still holds its value**.
 *
 * A longebb is a tide that went out and has not come back. What lives here is what could live on
 * less, and it has been living on less for a long time. Nothing on these boards is hard to kill.
 * What every one of them does is make the party's next turn worth slightly less than its last: a
 * mouth that keeps what it takes, a cut that does not close, a body worth more once you have hurt
 * it, and at the far mark a voice that says out loud what the whole chapter has been doing.
 *
 * | Band              | Stages | Levels  | The lock it teaches                                     |
 * | ----------------- | ------ | ------- | ------------------------------------------------------- |
 * | The turning tide  | 1–10   | 455–460 | `lifeLeech`: what the party spends comes partly back     |
 * | The drawn flats   | 11–20  | 460–465 | {@link SAVAGED} on the scope: the wound that never shuts |
 * | The bared channel | 21–30  | 465–470 | {@link BLOODRISEN} on `self`: hurt it and do not finish  |
 * | The sink          | 31–40  | 470–475 | both at once, on a board a third lighter                 |
 * | The far mark      | 41–50  | 475–480 | {@link WEAKEN} on the scope: the party's own attack      |
 * | The stillwater    | 51–60  | 480–485 | all of it, at the floor of what the pool can field       |
 *
 * ## ⚠️ The rung stays on `mythic` for the third chapter running, and this time it was *measured*
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 20's seam of **1.5373** and The Longebb's close of 485, `mythic` reads **0.8241** (|Δln|
 * **0.6235**) and `mythic-plus` **6.9529** (|Δln| **1.5091**). `mythic` wins by 0.886 of a nat.
 *
 * ⚠️ **This is a stay, and the seam it lands on is under 1.00 — which is the reading that licensed
 * chapter 18's override one rung down.** It is not the same situation and the difference is the
 * whole argument. The Slowgrowth's override rested on the seam **below** it being wrong (0.9608)
 * *and* on a board budget of 129 common-equivalent per body against a pool whose lightest body was
 * 100 — no chapter existed on the old rung at all. Here the seam below is 1.5373, comfortably above
 * 1.00, and the chapter was authorable. **An override is licensed by the seam below being wrong,
 * never by this chapter's own seam being small.**
 *
 * ⚠️ **`mythic-plus` was fielded rather than reasoned about, and it is a walkover three chapters
 * deep.** Chapter 20's own final, refielded at level 485 against a `mythic-plus` five, reads **100%
 * with all five alive in 3.2 seconds**. Against the `mythic` five it reads 0%. The arithmetic and
 * the measurement agree for once, which is worth recording because at chapter 15 they did not.
 *
 * ## ⚠️ Where the boards come from, and the wall this chapter is standing on
 *
 * Chapter 20's boards refielded up The Longebb's range, against the party this chapter is tuned for:
 *
 * | `c20-s60`'s board, refielded | reading                       |
 * | ---------------------------- | ----------------------------- |
 * | level 455 (its own)          | 100% / 3.77 survivors / 24.8s |
 * | level 460                    | **18%** / 0.30 / 44.0s        |
 * | level 470                    | **0%** / 0.00                 |
 * | level 485                    | **0%** / 0.00 / 8.3s          |
 *
 * ⚠️ **The whole shipped Monster mid-weight tier does the same thing between 475 and 485.** Behind
 * four of the lightest bodies, Carrion Swarm, Mirewhelp, Ashpit Scuttler, Screeback Darter, Rendfang
 * Jackal, Sumpwater Brood, Clefthorn Gorer and Driftmouth Choker all read **1.45 to 4.00 survivors
 * at level 475** — the 1.45 being Screeback Darter, whose second `enemy-back` turn prices it out a
 * band early — and **0.00 to 0.50 at 485**. That ten-level cliff is why the first four bands field
 * the returning pool and the last two very nearly cannot: returning distinct blocks run **15, 17,
 * 12, 8, 4, 8** across the six bands.
 *
 * ⚠️ **The exceptions are the two returning bodies whose weight is not attack** — the Tusked Boar at
 * 620/37 reads **3.00 at 485** where Clefthorn Gorer at 620/60 reads 0.07, and the Slime at 290/25
 * reads 4.00. Both are fielded here for exactly that property, and the Boar is what makes the first
 * three mini-boss boards peaks at all.
 *
 * ## ⚠️ The chapter's central measurement, taken before a board was written
 *
 * Priced against one calibrated control — an anchor of 255/29 behind four bodies of 148/23 at level
 * 485 and Relic 100, **847 common-equivalent, reading 3.25 of five**, and it **moves** (3.98 at 813,
 * 2.70 at 860, 2.17 at 890, 1.88 at 920). Zero timeouts on every row.
 *
 * | shape                                      | survivors | worth     |
 * | ------------------------------------------ | --------- | --------- |
 * | {@link SAVAGED} on `enemy-lowest`          | 3.88      | **−0.63** |
 * | {@link SAVAGED} on `enemy-back`            | 3.73      | −0.48     |
 * | {@link CHAINBOND} cast on `ally-all`       | 3.27      | **0.00**  |
 * | board `tenacity` 0.20 / 0.40 / 0.60        | 3.00/2.98/2.92 | 0.25–0.33 |
 * | board `lifeLeech` 0.05 → 0.40              | 3.08 → 2.40 | 0.17 → 0.85 |
 * | {@link THORNMAIL} on all five              | 2.52      | 0.73      |
 * | board `physicalPierce` 0.15 / 0.30 / 0.45  | 2.65/1.60/0.20 | 0.60/1.65/3.05 |
 * | {@link SAVAGED} on `enemy-all`, one carrier | 1.98     | **1.27**  |
 * | board `dodge` 0.10 / 0.20 / 0.30           | 2.95/1.93/0.65 | 0.30/1.32/2.60 |
 * | {@link ROOTBOUND} on all five              | 1.73      | 1.52      |
 * | {@link BLOODRISEN} on `self`, all five     | 1.27      | **1.98**  |
 * | {@link SLOW} on `enemy-all`                | 0.30      | 2.95      |
 * | {@link WEAKEN} on `enemy-all`              | **0.00**  | **3.25**  |
 *
 * 1. ⚠️ **Four readings inverted against the chapters that measured them, and the cause is the same
 *    in all four: the board underneath is a third of chapter 20's weight.** {@link CHAINBOND} was
 *    worth 1.78 at The Commonage and is worth **0.00** here; {@link WEAKEN} was 0.30 at chapter 19
 *    and 0.95 at chapter 20 and is a **total wipe** here; {@link BLOODRISEN} on `self` across five
 *    was 0.15 at chapter 19 and is **1.98** here. **A figure quoted without the weight it was
 *    measured at means nothing** — chapter 16 wrote that rule and this is the widest spread yet.
 * 2. ⚠️ **{@link SAVAGED} now carries three signs on one status**: −0.63 on a selection, −0.48 on a
 *    reach, **+1.27** on a scope. Chapter 17 measured {@link STUN} at 0.00 against 2.60 and chapter
 *    19 measured {@link BLOODRISEN} at 0.08 against 3.88; this is the first to come back **negative**
 *    on the aimed arm, by chapter 20's mechanism — an aimed wound concentrates the party's damage
 *    for it, and concentration is what a party wants.
 * 3. ⚠️ **`lifeLeech` is the only reading here that is a dial rather than a cliff** — 0.17 → 0.85
 *    monotone across an eightfold range, zero timeouts to 0.25 — which is why the chapter opens on it
 *    and why it is the one lock that runs through all six bands rather than one.
 * 4. ⚠️ **`tenacity` is flat across 0.20 to 0.60 and was declined.** The register check's eighth
 *    answer is the dullest one: worth 0.25 at the bottom of its range and 0.33 at the top.
 *
 * ## ⚠️ An ascended anchor down here is fight length, which inverts chapter 20's rule
 *
 * The longest diagnosis of this session. The final read **0% at every stat line from 120/12 down to
 * 95/4**, and stripping its `lifeLeech`, its `tenacity`, its `physicalPierce`, its defence and then
 * **all three of its skills** moved it by nothing at all. The escort alone read 4.00.
 *
 * What separated them was **tier**, not any stat on the block:
 *
 * | fifth body added to the same four | reading at level 485      |
 * | --------------------------------- | ------------------------- |
 * | `common` 150 health, attack 16→30 | **4.00 at every attack**  |
 * | `ascended` 149 common-equivalent  | 4.00                      |
 * | `ascended` 248 common-equivalent  | 3.50                      |
 * | `ascended` 372 common-equivalent  | 1.85                      |
 * | `ascended` 496 common-equivalent  | **0.15**                  |
 *
 * ⚠️ **So the anchor sets the fight length and the escort sets the rate at which length becomes
 * deaths.** The same 496-weight anchor reads **0.15** behind an escort summing 89 attack and
 * **3.92** behind one summing 68. Chapter 20 found "shortlist on weight, settle on attack" of its
 * final; this chapter's final settles on **weight**, with its attack barely registering — because
 * down here the party's problem is not the boss's damage, it is the twenty extra seconds the boss
 * costs it. **Which of the two binds is a fact about the escort, and it has to be measured.**
 *
 * ## ⚠️ The lean is Monster for the third time, and the pool is what chose it
 *
 * Monster leads chapters 10, 17 and 21 — **the first faction to lead three**, and it was not a free
 * pick. At level 485 a board of five is worth about 800 to 950 common-equivalent, and of the 272
 * blocks that existed before this chapter **fifteen** sit at or under 200: **eleven Monsters**, two
 * Undead and two Human. Chapter 20 recorded the prediction in writing — "a chapter 21 leaning
 * Monster does not hit this wall; every other lean does" — and it was right.
 *
 * What a third lead costs is that the chapter has to be a different **place**. The Bleeding Wild is
 * the Monsters in country that is theirs; The Quickmire is the Monsters somewhere that will not hold
 * still; The Longebb is the Monsters after the water left, on ground that used to be the bottom of
 * something. Its returning bench is The Quickmire's own — the same eleven light bodies, one chapter
 * further down the same drainage — which is the fiction and the weight budget agreeing for once.
 *
 * ⚠️ **The lean measures 93.7% of board slots, the heaviest any chapter has carried**, against The
 * Rustwood's 92%. Stated rather than rounded, because it is out of family — and unlike The
 * Rustwood's mono-Elf lean it **costs the faction matchup nothing**: `FACTION_MATCHUPS` gives every
 * faction ×1.05 into Monsters and Monsters ×1.05 into all seven, so a mono-Monster pool still reads
 * differently to every party. **No other faction has that property**, which is the only thing making
 * a share this high legal.
 *
 * ⚠️ **The texture is limited by _attack_ rather than by weight, which is new.** The nineteen
 * non-lean slots are all Undead, carried down from The Commonage — the Sheafless Shade, the Bindweed
 * Dead and the Wisp, at 150, 170 and 210 health. They are light enough for any board here and they
 * run **30 to 36 attack** against the light Monsters' 16 to 24, so a board that swaps one in gains
 * eleven points of attack for eleven points of weight. That is affordable in the first four bands
 * and not in the last two: the Undead slots run **6, 6, 1, 6, 0, 0** across the bands. Chapter 16's
 * texture thinned because the late bands could not afford a 500-health body; this one thins because
 * they cannot afford a 34-attack one.
 *
 * ## The blocks, the quota and the gear
 *
 * Thirty-two distinct archetypes, **ten of them new** — eight ordinary plus {@link THE_UNDERTOW} and
 * {@link THE_UNRETURNED}. That is **31.3%** counting the two uniques inside the fraction and
 * **26.7%** under the shipped rule, which excludes them from both sides. Both readings clear the
 * quarter, and for the third chapter running the quota is met rather than overshot — chapter 17's
 * 57.7% was the pool refusing to supply, and the pool is supplying again because the lean is the one
 * faction whose bench is light enough.
 *
 * ⚠️ **Every board carries Relic 100, flat, for the fifth chapter running.** The grade ladder was
 * exhausted at chapter 17 and a sixth grade is a `data/` rule change rather than a chapter. The
 * `gearArchetype` bill was **zero**: every block fielded here already carried one, because The
 * Quickmire paid the Monster bill and The Commonage paid the Undead one. That is a fact about the
 * lean rather than a trend.
 *
 * ## ⚠️ What the pool says about chapter 22
 *
 * Chapter 19 projected `mythic` buying about three chapters on the arithmetic and chapter 20 measured
 * it buying about one and a half on the pool. **This chapter is the half.** Its closing band is at
 * the floor: at level 485 the five heaviest shipped light Monsters read **3.75 of five with no help
 * at all**, and the two new bodies authored under them — the Neapmark Wretch at 165/24 and the
 * Lowmark Drifter at 150/23 — are the last stat lines the budget admits. A chapter 22 on this rung
 * closes at 515, where the same board is worth ×1.86 more and **nothing shipped can stand on it**.
 * ⚠️ **Measure the pool before re-deriving the seam**, exactly as chapter 20 said, and expect the
 * answer to be `mythic-plus` — this time on the pool rather than on the log-space rule, which will
 * still prefer staying put.
 */
export const CHAPTER_21 = {
  id: 'chapter-21',
  name: 'The Longebb',
  stages: [
    {
      id: 'c21-s1',
      name: 'Where The Water Was',
      enemies: {
        front: [EBBDRIFT_LATCHER, CARRION_SWARM],
        back: [SLACKRUN_SIPPER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 455,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s2',
      name: 'It Went Out In The Night',
      enemies: {
        front: [EBBDRIFT_LATCHER, MIREWHELP],
        back: [SLACKRUN_SIPPER, PACKCALL_WHISTLER, QUICKMIRE_SKIMMER],
      },
      level: 456,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s3',
      name: 'Nothing Came Back With It',
      enemies: {
        front: [EBBDRIFT_LATCHER, ASHPIT_SCUTTLER],
        back: [SLACKRUN_SIPPER, SILTWAKE_DARTER, SHEAFLESS_SHADE],
      },
      level: 456,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s4',
      name: 'The Mark It Left',
      enemies: {
        front: [EBBDRIFT_LATCHER, BOAR],
        back: [SLACKRUN_SIPPER, QUICKMIRE_SKIMMER, BINDWEED_DEAD],
      },
      level: 457,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s5',
      name: 'Drinking What It Finds',
      enemies: {
        front: [EBBDRIFT_LATCHER, SUMPWATER_BROOD],
        back: [SLACKRUN_SIPPER, PACKCALL_WHISTLER, SILTWAKE_DARTER],
      },
      level: 457,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s6',
      name: 'A Mouth In The Shallows',
      enemies: {
        front: [EBBDRIFT_LATCHER, CLEFTHORN_GORER],
        back: [SLACKRUN_SIPPER, BINDWEED_DEAD, QUICKMIRE_SKIMMER],
      },
      level: 458,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s7',
      name: 'Every Bite Paid Twice',
      enemies: {
        front: [EBBDRIFT_LATCHER, SCREEBACK_DARTER],
        back: [QUICKMIRE_SKIMMER, SILTWAKE_DARTER, BINDWEED_DEAD],
      },
      level: 458,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s8',
      name: 'What You Spend Here',
      enemies: {
        front: [EBBDRIFT_LATCHER, RENDFANG_JACKAL],
        back: [QUICKMIRE_SKIMMER, PACKCALL_WHISTLER, SHEAFLESS_SHADE],
      },
      level: 459,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s9',
      name: 'The Slack Between Tides',
      enemies: {
        front: [EBBDRIFT_LATCHER, MIREWHELP],
        back: [SLACKRUN_SIPPER, SLIME, SHEAFLESS_SHADE],
      },
      level: 459,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s10',
      name: 'The Undertow',
      enemies: {
        front: [THE_UNDERTOW, EBBDRIFT_LATCHER],
        back: [SLACKRUN_SIPPER, BOAR, SILTWAKE_DARTER],
      },
      level: 460,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s11',
      name: 'Out Onto The Flats',
      enemies: {
        front: [LONGEBB_RENDER, MIREWHELP],
        back: [SLACKRUN_SIPPER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 460,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s12',
      name: 'Nothing Closes Here',
      enemies: {
        front: [LONGEBB_RENDER, ASHPIT_SCUTTLER],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 461,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s13',
      name: 'Opened And Left Open',
      enemies: {
        front: [LONGEBB_RENDER, SUMPWATER_BROOD],
        back: [SILTWAKE_DARTER, MIREFOOT_RUNNER, BINDWEED_DEAD],
      },
      level: 461,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s14',
      name: 'The Cut That Keeps',
      enemies: {
        front: [LONGEBB_RENDER, CARRION_SWARM],
        back: [SLACKRUN_SIPPER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 462,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s15',
      name: 'Still Bleeding At Noon',
      enemies: {
        front: [LONGEBB_RENDER, BOAR],
        back: [REEDBACK_COURSER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 462,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s16',
      name: 'What Will Not Scab',
      enemies: {
        front: [LONGEBB_RENDER, SCREEBACK_DARTER],
        back: [QUICKMIRE_SKIMMER, REEDBACK_COURSER, SILTWAKE_DARTER],
      },
      level: 463,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s17',
      name: 'Counting What Is Left',
      enemies: {
        front: [LONGEBB_RENDER, RENDFANG_JACKAL],
        back: [QUICKMIRE_SKIMMER, BINDWEED_DEAD, SILTWAKE_DARTER],
      },
      level: 463,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s18',
      name: 'A Long Way To The Water',
      enemies: {
        front: [LONGEBB_RENDER, DRIFTMOUTH_CHOKER],
        back: [MIREFOOT_RUNNER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 464,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s19',
      name: 'It Does Not Stop',
      enemies: {
        front: [LONGEBB_RENDER, CLEFTHORN_GORER],
        back: [SILTWAKE_DARTER, REEDBACK_COURSER, SHEAFLESS_SHADE],
      },
      level: 464,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s20',
      name: 'The Undertow Again',
      enemies: {
        front: [THE_UNDERTOW, EBBDRIFT_LATCHER],
        back: [SLACKRUN_SIPPER, BOAR, MIREFOOT_RUNNER],
      },
      level: 465,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s21',
      name: 'Down The Bared Channel',
      enemies: {
        front: [BAREMARK_GNAWER, ASHPIT_SCUTTLER],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 465,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s22',
      name: 'Hurt And Not Finished',
      enemies: {
        front: [BAREMARK_GNAWER, CARRION_SWARM],
        back: [CHANNELBED_STALKER, PACKCALL_WHISTLER, QUICKMIRE_SKIMMER],
      },
      level: 466,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s23',
      name: 'Worth More Wounded',
      enemies: {
        front: [BAREMARK_GNAWER, MIREWHELP],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, REEDBACK_COURSER],
      },
      level: 466,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s24',
      name: 'What The Water Marked',
      enemies: {
        front: [BAREMARK_GNAWER, SLIME],
        back: [CHANNELBED_STALKER, MIREFOOT_RUNNER, WISP],
      },
      level: 467,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s25',
      name: 'Half Of It Is Enough',
      enemies: {
        front: [BAREMARK_GNAWER, SUMPWATER_BROOD],
        back: [CHANNELBED_STALKER, QUICKMIRE_SKIMMER, REEDBACK_COURSER],
      },
      level: 467,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s26',
      name: 'It Learned From That',
      enemies: {
        front: [BAREMARK_GNAWER, BOAR],
        back: [CHANNELBED_STALKER, PACKCALL_WHISTLER, SILTWAKE_DARTER],
      },
      level: 468,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s27',
      name: 'Leave Nothing Standing',
      enemies: {
        front: [BAREMARK_GNAWER, MIREWHELP],
        back: [CHANNELBED_STALKER, REEDBACK_COURSER, QUICKMIRE_SKIMMER],
      },
      level: 468,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s28',
      name: 'The Second Time Costs More',
      enemies: {
        front: [BAREMARK_GNAWER, CARRION_SWARM],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 469,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s29',
      name: 'Finish What You Open',
      enemies: {
        front: [BAREMARK_GNAWER, BOAR],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 469,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s30',
      name: 'The Undertow At The Bend',
      enemies: {
        front: [THE_UNDERTOW, BAREMARK_GNAWER],
        back: [CHANNELBED_STALKER, BOAR, SILTWAKE_DARTER],
      },
      level: 470,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s31',
      name: 'Into The Sink',
      // ⚠️ The band opens *heavier* than the one below it closes, which is chapter 20's rule about
      // locks that step at a band boundary. Band 4 is the first to carry the leech and the wound
      // together, so a weight drop here cancels against the new lock and reads as a step
      // **backwards** on the difficulty probe — this board measured 0.849 against the 0.85 bar at
      // 1,017 common-equivalent and clears it at 1,125.
      enemies: {
        front: [EBBDRIFT_LATCHER, CHANNELBED_STALKER],
        back: [LOWMARK_DRIFTER, SILTWAKE_DARTER, BINDWEED_DEAD],
      },
      level: 470,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s32',
      name: 'Both Mouths At Once',
      enemies: {
        front: [LONGEBB_RENDER, SLIME],
        back: [SLACKRUN_SIPPER, LOWMARK_DRIFTER, REEDBACK_COURSER],
      },
      level: 471,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s33',
      name: 'Taken And Not Closed',
      enemies: {
        front: [EBBDRIFT_LATCHER, QUICKMIRE_SKIMMER],
        back: [CHANNELBED_STALKER, SHEAFLESS_SHADE, LOWMARK_DRIFTER],
      },
      level: 471,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s34',
      name: 'The Trade Goes Bad',
      enemies: {
        front: [LONGEBB_RENDER, SILTWAKE_DARTER],
        back: [SLACKRUN_SIPPER, SHEAFLESS_SHADE, LOWMARK_DRIFTER],
      },
      level: 472,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s35',
      name: 'Less Every Hour',
      enemies: {
        front: [EBBDRIFT_LATCHER, MIREFOOT_RUNNER],
        back: [CHANNELBED_STALKER, SHEAFLESS_SHADE, LOWMARK_DRIFTER],
      },
      level: 472,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s36',
      name: 'Nothing Here Is Worth What It Was',
      enemies: {
        front: [LONGEBB_RENDER, CHANNELBED_STALKER],
        back: [QUICKMIRE_SKIMMER, SILTWAKE_DARTER, LOWMARK_DRIFTER],
      },
      level: 473,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s37',
      name: 'Paying In Both Directions',
      enemies: {
        front: [EBBDRIFT_LATCHER, PACKCALL_WHISTLER],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, NEAPMARK_WRETCH],
      },
      level: 473,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s38',
      name: 'The Ground Gives Way',
      enemies: {
        front: [LONGEBB_RENDER, CHANNELBED_STALKER],
        back: [WISP, REEDBACK_COURSER, LOWMARK_DRIFTER],
      },
      level: 474,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s39',
      name: 'Down To The Bed',
      enemies: {
        front: [BAREMARK_GNAWER, EBBDRIFT_LATCHER],
        back: [SILTWAKE_DARTER, SHEAFLESS_SHADE, LOWMARK_DRIFTER],
      },
      level: 474,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s40',
      name: 'The Undertow In The Sink',
      enemies: {
        front: [THE_UNDERTOW, BAREMARK_GNAWER],
        back: [CHANNELBED_STALKER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 475,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s41',
      name: 'Out To The Far Mark',
      enemies: {
        front: [SALTBLEACH_CRIER, BAREMARK_GNAWER],
        back: [NEAPMARK_WRETCH, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 475,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s42',
      name: 'It Is All Worth Less',
      enemies: {
        front: [SALTBLEACH_CRIER, BAREMARK_GNAWER],
        back: [LOWMARK_DRIFTER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 476,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s43',
      name: 'Less Than This Morning',
      enemies: {
        front: [SALTBLEACH_CRIER, CHANNELBED_STALKER],
        back: [NEAPMARK_WRETCH, MIREFOOT_RUNNER, QUICKMIRE_SKIMMER],
      },
      level: 476,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s44',
      name: 'Nothing Buys What It Did',
      enemies: {
        front: [SALTBLEACH_CRIER, SILTWAKE_DARTER],
        back: [CHANNELBED_STALKER, LOWMARK_DRIFTER, MIREFOOT_RUNNER],
      },
      level: 477,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s45',
      name: 'The Arm Goes First',
      enemies: {
        front: [SALTBLEACH_CRIER, BAREMARK_GNAWER],
        back: [NEAPMARK_WRETCH, REEDBACK_COURSER, SILTWAKE_DARTER],
      },
      level: 477,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s46',
      name: 'Weighed And Found Short',
      enemies: {
        front: [SALTBLEACH_CRIER, QUICKMIRE_SKIMMER],
        back: [CHANNELBED_STALKER, NEAPMARK_WRETCH, LOWMARK_DRIFTER],
      },
      level: 478,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s47',
      name: 'What Is Left To Spend',
      enemies: {
        front: [SALTBLEACH_CRIER, CHANNELBED_STALKER],
        back: [LOWMARK_DRIFTER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 478,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s48',
      name: 'Thin All The Way Down',
      enemies: {
        front: [SALTBLEACH_CRIER, BAREMARK_GNAWER],
        back: [NEAPMARK_WRETCH, LOWMARK_DRIFTER, QUICKMIRE_SKIMMER],
      },
      level: 479,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s49',
      name: 'The Last Of The Reach',
      enemies: {
        front: [SALTBLEACH_CRIER, BAREMARK_GNAWER],
        back: [NEAPMARK_WRETCH, LOWMARK_DRIFTER, SILTWAKE_DARTER],
      },
      level: 479,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s50',
      name: 'The Undertow At The Mark',
      enemies: {
        front: [THE_UNDERTOW, REEDBACK_COURSER],
        back: [QUICKMIRE_SKIMMER, SILTWAKE_DARTER, LOWMARK_DRIFTER],
      },
      level: 480,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s51',
      name: 'The Stillwater',
      enemies: {
        front: [BAREMARK_GNAWER, NEAPMARK_WRETCH],
        back: [CHANNELBED_STALKER, LOWMARK_DRIFTER, SILTWAKE_DARTER],
      },
      level: 480,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s52',
      name: 'Nothing Moves Out Here',
      enemies: {
        front: [BAREMARK_GNAWER, NEAPMARK_WRETCH],
        back: [SALTBLEACH_CRIER, LOWMARK_DRIFTER, SILTWAKE_DARTER],
      },
      level: 481,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s53',
      name: 'Flat To The Horizon',
      enemies: {
        front: [BAREMARK_GNAWER, NEAPMARK_WRETCH],
        back: [LOWMARK_DRIFTER, SILTWAKE_DARTER, MIREFOOT_RUNNER],
      },
      level: 481,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s54',
      name: 'The Bell Under The Mud',
      enemies: {
        front: [CHANNELBED_STALKER, NEAPMARK_WRETCH],
        back: [SALTBLEACH_CRIER, LOWMARK_DRIFTER, MIREFOOT_RUNNER],
      },
      level: 482,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s55',
      name: 'It Was Deep Here Once',
      enemies: {
        front: [BAREMARK_GNAWER, NEAPMARK_WRETCH],
        back: [LOWMARK_DRIFTER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 482,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s56',
      name: 'Salt All The Way Up',
      enemies: {
        front: [BAREMARK_GNAWER, NEAPMARK_WRETCH],
        back: [SALTBLEACH_CRIER, LOWMARK_DRIFTER, REEDBACK_COURSER],
      },
      level: 483,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s57',
      name: 'No Tide To Wait For',
      enemies: {
        front: [NEAPMARK_WRETCH, MIREFOOT_RUNNER],
        back: [CHANNELBED_STALKER, LOWMARK_DRIFTER, SILTWAKE_DARTER],
      },
      level: 483,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s58',
      name: 'The Last Wet Ground',
      enemies: {
        front: [NEAPMARK_WRETCH, MIREFOOT_RUNNER],
        back: [SALTBLEACH_CRIER, LOWMARK_DRIFTER, QUICKMIRE_SKIMMER],
      },
      level: 484,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s59',
      name: 'Everything It Took',
      enemies: {
        front: [NEAPMARK_WRETCH, MIREFOOT_RUNNER],
        back: [SALTBLEACH_CRIER, LOWMARK_DRIFTER, SILTWAKE_DARTER],
      },
      level: 484,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c21-s60',
      name: 'The Unreturned',
      // The lightest board in the chapter, because the body standing on it casts the most
      // expensive turn in the chapter. Four of the five lightest bodies the game has ever shipped,
      // summing 77 attack: {@link THE_UNRETURNED} at 85 health is 352 common-equivalent here, and
      // it is the *seconds* it costs rather than its damage that the escort converts into deaths.
      enemies: {
        front: [THE_UNRETURNED, SPINEDRIFT_LANCER],
        back: [RIVENMIRE_SPRINTER, FENSPAWN_SKITTER, HAMMERTIDE_LURCHER],
      },
      level: 485,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
