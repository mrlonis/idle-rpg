import {
  CARRION_SWARM,
  DRUMMING_SHOAL,
  FENSPAWN_SKITTER,
  GLADE_STALKER,
  HAMMERTIDE_LURCHER,
  HARNESS_CUTTER,
  HEAPFOOT_RUMMAGER,
  LONGSTRIDE_RAVENER,
  MIREFOOT_RUNNER,
  PACKCALL_WHISTLER,
  QUICKMIRE_SKIMMER,
  REEDBACK_COURSER,
  RIVENMIRE_SPRINTER,
  ROADGAUNT_OUTRIDER,
  SIGNAL_RUNNER,
  SILTBANK_HULK,
  SILTWAKE_DARTER,
  SLACKWATER_WARDEN,
  SLIME,
  SPINEDRIFT_LANCER,
  SPOIL_PICKER,
  STEPMIRE_ELDER,
  SUMPLIGHT_STRIDER,
  TALLOWLIGHT_RUNNER,
  THE_LATECOMER,
  THE_PACEMAKER,
  THORNLING,
  WISP,
} from './enemies';

/**
 * Chapter 17 — The Quickmire.
 *
 * Fifty stages, enemy levels 350 to 375. It **opens at the level chapter 16 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Spoilfield did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, and the spoilfield whether it is **the party's own
 * damage at all**. This one asks whether the party can **spend it fast enough**.
 *
 * The Spoilfield was open ground and a trade standing still on it. This is what the ground turns
 * into two days east: water with no bottom, where nothing heavy has survived and everything that
 * did is thin, quick, and already moving. There is no wall in this chapter. There is nothing here
 * that will stand and take a blow. What there is instead is a board that has taken three turns
 * while the party took two, and a party that never gets to finish the thought it started.
 *
 * | Band            | Stages | The lock it teaches                                              |
 * | --------------- | ------ | ---------------------------------------------------------------- |
 * | The shallows    | 1–10   | the stat block is not the board: `haste` is                       |
 * | The pack        | 11–20  | {@link HASTE} across the board — it buys its own tempo            |
 * | The stepping    | 21–30  | {@link SLOW} across the party, from a body in the **front** rank  |
 * | The overtaking  | 31–40  | one instance, bigger and rarer, arriving before the answer        |
 * | The last of it  | 41–50  | all four at once, and the thing that got here first               |
 *
 * ## Where the levels come from
 *
 * 350 to 375, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ## ⚠️ The cap has been out of levels for four chapters and the seam is now 0.9608
 *
 * `legendary-plus` caps at **260** against a close of **375**, so the party this chapter is tuned
 * for stands **a hundred and fifteen levels under the last board** — where The Spoilfield's stood
 * ninety under, The Underroad's sixty-five, The Shutgate's forty and The Quarry's fifteen. At
 * `perLevel.common` = 1.021 that is **×10.91** of content the party cannot answer with levels, and
 * it arrives entirely from a ceiling that does not move.
 *
 * The seam ratios are the record: **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 → 0.9608**. ⚠️ **The
 * last four factors are all exactly `perLevel.common ** -25` = 0.595**, so a chapter on this rung
 * divides the seam by **1.680 by arithmetic**. That was a prediction at chapter 15, arithmetic at
 * chapter 16, and it has now held four times. ⚠️ **The seam has gone below 1.00 for the first
 * time** — the content is now nominally ahead of the party the chapter is tuned for, and it is the
 * board weight coming down that keeps the chapter winnable rather than anything the party gains.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Against a
 * close of 375, `legendary-plus` reads 0.9608 (|Δln| **0.5196** against chapter 16's own seam) and
 * `mythic` reads 8.1062 (|Δln| **1.6130**). So `legendary-plus` wins by 1.09 of a nat and this is
 * the **seventh** chapter running on one rung. It is also the **fourth degenerate link in a row**:
 * chapters 13 through 17 all clamp to 260, so five consecutive seam parties are the same five
 * characters at the same level at the same rung.
 *
 * ## ⚠️ The pool can no longer supply a returning majority, which is the finding chapter 16 predicted
 *
 * The Spoilfield recorded that "a seventeenth chapter on this rung cannot be authored out of the
 * pool at all". Measured rather than inherited — The Spoilfield's own final board refielded against
 * this chapter's party and gear:
 *
 * | `c16-s50`'s board, refielded | reading                       |
 * | ----------------------------- | ----------------------------- |
 * | level 350, Relic 100          | 100% / 3.85 survivors / 15.0s |
 * | level 375, Relic 100          | **0%** / 0.00 / 9.8s          |
 * | level 375, ×0.7               | **0%** / 0.00 / 16.3s         |
 * | level 375, ×0.6               | 53% / 1.25 / 26.2s            |
 * | level 375, ×0.5               | 100% / 3.95 / 15.7s           |
 *
 * So this chapter's boards are **roughly half of chapter 16's**: **1,085 common-equivalent at the
 * first stage falling to 763 at the last**, against The Spoilfield's 2,715 → 1,543 — ×0.40 and
 * ×0.49. The five bands run 930–1,205, 758–1,150, 965–1,188, 868–1,106 and 625–1,009.
 *
 * ⚠️ **Stated against the pool this chapter drew from rather than as a standing threshold, because
 * the range grows underneath a claim like this one**: of the **221** blocks that existed before The
 * Quickmire, exactly **13** sit at or under 400 common-equivalent at level 375 and **5** at or under
 * 250. The eleven returning blocks this chapter fields are very nearly that entire light tail — for
 * the second chapter running, and the twenty-four The Spoilfield fielded are already too heavy to
 * bring back.
 *
 * ⚠️ **So the 25% rule is met by a wide margin and not by choice: this chapter is 57.7% new.**
 * Counted the way the rule counts — distinct archetypes fielded, with the lieutenant and the final
 * excluded from both sides — it fields **26 ordinary archetypes, 15 of them new**, where the quota
 * is eight new against twenty-four returning. Seventeen new blocks in all once the lieutenant and
 * the final are added back. The quota is a floor, so nothing is violated; the reason it is exceeded
 * is that **twenty-four light-enough returning blocks do not exist**, and no arrangement of the
 * shipped pool produces them. See [authoring](../../docs/authoring.md).
 *
 * ## ⚠️ Author against common-equivalent weight; raw health is now badly misleading
 *
 * `perLevel` is 1.024 / 1.0225 / 1.021, so **at level 375 an `ascended` block is worth ×3.005 of a
 * `common` one and ×1.734 of a `legendary` one** — up from ×2.784 and ×1.668 at chapter 16's close,
 * and the premium grows every chapter. {@link THE_LATECOMER} is authored at **112 health and 13
 * attack**, which is **337** in common-equivalent terms — **44% of its own board's entire budget of
 * 763**, while on the raw stat line one of its own escorts (a 122-health {@link FENSPAWN_SKITTER})
 * out-weighs it. ⚠️ **That inversion is why the rule says convert before comparing.**
 *
 * ## ⚠️ The gear ladder is exhausted, so every board here carries the same set
 *
 * Every board carries {@link StageEncounterData.gear} at grade **4 (Relic)** and level **100**,
 * **flat across all fifty stages**. Relic 100 is the top of the whole ladder and there is no grade 5
 * and no Relic 101, so this is the **first chapter in six that cannot step this axis at all** —
 * exactly what The Spoilfield predicted. Holding it flat is the honest reading rather than a loss:
 * the ramp inside chapter 16 measured **0.08 of a survivor** end to end, chapter 13 measured a grade
 * step at ×1.15 against the ×3 escalation would need, and four consecutive chapters have measured
 * this axis as fight length rather than difficulty. **A sixth grade is a `data/` rule change rather
 * than a chapter**, and it is recorded as a finding rather than taken as scope. See
 * [gear](../../docs/gear.md).
 *
 * ## ⚠️ What carries the difficulty: haste, and it is a cliff built below its own register
 *
 * Every figure below is against one calibrated control — an anchor of 230/18 behind four bodies of
 * 110/20 at level 375 and Relic 100, totalling **1,131 common-equivalent** and reading **3.83 of
 * five**. ⚠️ **The control moves**, which is what makes the rest of the table mean anything: 4.00 at
 * 931, 3.77 at 1,131, 2.70 at 1,231, 0.65 at 1,331, 0.00 at 1,431.
 *
 * | shape                                           | survivors | worth    |
 * | ----------------------------------------------- | --------- | -------- |
 * | {@link STUN} on a **selection**, one or two casters | 3.85 / 3.88 | **0.00** |
 * | board `haste` 100                               | 3.80      | 0.03     |
 * | an `opening` turn dealing `enemy-all` damage    | 3.48      | 0.35     |
 * | {@link SLOW} on `enemy-front` + damage, ×2      | 3.00      | 0.83     |
 * | {@link SLOW} on `enemy-all`, caster in the **front** rank | 2.00 | 1.83  |
 * | board `haste` 118                               | 1.88      | 1.95     |
 * | {@link HASTE} on `ally-all`, one caster         | 1.45      | 2.38     |
 * | {@link SLOW} on `enemy-all`, caster in the **back** rank | 1.43 | 2.40   |
 * | {@link STUN} on a **scope** (`enemy-all`)       | 1.23      | **2.60** |
 * | board `haste` 130                               | 0.42      | 3.41     |
 * | board `haste` 144 or 152                        | 0.00      | 3.83     |
 *
 * ⚠️ **Zero timeouts on every row**, longest 54.7 seconds against a ninety-second timer. Those
 * are the *control's* fights, not the chapter's; the shipped boards' longest is 40.7s.
 *
 * 1. ⚠️ **The register check came back a sixth way: the stat works, but only *below* its shipped
 *    register.** `haste` ships at a ceiling of **152** over a median of **98**, and a session
 *    reading that register would reasonably build a tempo band at the top of it. At the control's
 *    weight, 144 is **0.00 of five** and 130 is 0.42. **The seventeen blocks this chapter authors
 *    run 106 to 126 and stop**, twenty-six under the ceiling — the opposite of the Monster Tower's
 *    `physicalResist` band, which had to step *past* its register to be worth anything.
 *    ⚠️ **That is a claim about the new blocks and not about this chapter's boards**, which also
 *    field the returning {@link WISP} at 148 and {@link SLIME} at 78: bands 1 to 4 all reach 148 in
 *    one slot and band 5 tops out at 126. What no board does is carry the top of the range across
 *    all five slots. **Stated as the range measured rather than as the threshold meant**, because a
 *    claim phrased the other way has shipped false four times in this project.
 * 2. ⚠️ **A `STUN` on a selection is worth 0.00 and the same status on a scope is worth 2.60.** Not
 *    a difference of degree: one caster and two casters both read inert. A *scope* (`enemy-all`), a
 *    *reach* (`enemy-back`) and a *selection* (`enemy-highest`) are three different things, and the
 *    Angel Tower's roof shipped a false claim conflating them. **No board here authors a stun on a
 *    selection**, and the one board-wide stun in the chapter is on the final.
 * 3. ⚠️ **A board-wide `SLOW` is worth 2.40 from the back rank and 1.83 from the front** — the
 *    sustain-behind-a-taunt failure wearing a debuff, the same shape chapter 16 measured at 3.90 on
 *    a `WEAKEN`. **Every carrier in this chapter stands in the front rank, on every board.**
 * 4. ⚠️ **The party carries zero `tenacity` and zero `dodge` across all five**, which is what
 *    licenses a status-led band at all — the same test the Elf Tower's `critChance` hundred passed
 *    and the Demon Tower's magic ward failed twice.
 * 5. ⚠️ **The haste axis bites the real seam party harder than the probe threshold predicts.**
 *    Chapter 16 reads 4.00 survivors at a probe threshold of 2,160 where this chapter reads 2.4–2.8
 *    at the same threshold, because the probe scales a party uniformly and tempo is not a uniform
 *    quantity. **Tune a tempo band against survivors, not against the probe.**
 *
 * ## What it draws on
 *
 * Twenty-six archetypes excluding the lieutenant and the final: **fifteen new, eleven returning** —
 * 57.7% new, far above the quarter a chapter owes, for the reason recorded above. Twenty-eight
 * distinct bodies in all, over 250 board slots. The pool goes 221 → 238.
 *
 * ⚠️ **The returning blocks thin monotonically across the bands — 11, 7, 4, 2 and 0 distinct** —
 * which is the same shape The Spoilfield's non-lean texture took (15, 12, 9, 3, 1 slots) and for the
 * same reason: the budget falls faster than the pool's light tail does, so by the closing band there
 * is nothing shipped that fits. **Band 5 fields no returning block at all**, and it is the only band
 * whose `haste` range is its own — bands 1 through 4 each reach 148 in a single slot, on the Wisp.
 *
 * ⚠️ **The lean is Monster and it takes the faction 34 → 51.** The seven ran angel 24, demon 25, elf
 * 33, monster 34, dwarf 34, undead 35, human 36 — five legal leads within three of each other, so
 * **the depth argument has stopped discriminating** and this one was picked on the matchup instead:
 * Monster is the only lean that costs the faction matrix nothing, because every faction reads ×1.05
 * into Monsters and Monsters ×1.05 into all seven. It is a repeat lead after chapter 13, and what a
 * repeat costs is that the chapter has to be a visibly different **place**: The Bleeding Wild is the
 * Monsters as a territory that fights back, and The Quickmire is what is left where nothing heavy
 * can stand. **Recompute the depths before the next lean.**
 *
 * ⚠️ **The lean measures 86.8% of board slots, counted after the boards landed rather than written
 * from the intent** — which is the failure The Shutgate's header records making, and this header
 * made it too: it claimed 84.4% until the count was run. Against the shipped nine that is the
 * **second heaviest**, a shade above The Underroad's 86.4% and well under The Rustwood's 92%: the
 * Weald 81.5%, The Standing Line 83.2%, The Bleeding Wild 83.9%, The Spoilfield 84.0%, The Quarry
 * and The Shutgate 85.2%, The Underroad 86.4%, **The Quickmire 86.8%**, The Rustwood 92%. It is
 * high for the reason the whole chapter is unusual — only eleven shipped blocks are light enough to
 * field at all, so the non-lean texture has nowhere else to come from.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Latecomer is the seventeenth body authored under the rule that a chapter's final is
 * fielded nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here: nothing, and that is a countable claim
 *
 * Measured over all fifty boards and all twenty-eight blocks with a script rather than by reading:
 * **0 blocks carry `recovery`, 0 carry `healthRegen`, 0 carry `lifeLeech`, 0 field a heal, 0 field a
 * drain, and 0 field a shield or a pool of any kind.** The only effect kinds on any board are
 * `damage` and the statuses `haste`, `slow`, `stun`, `sunder` and `bleed` — the last two arriving on
 * returning blocks' own kits rather than being authored here.
 *
 * ⚠️ **That is what makes a tempo axis safe rather than a clock.** A board that acts more often
 * finishes a fight sooner; a board that acts more often *and* repairs itself is the ninety seconds
 * with a stat block attached. `SLOW` is the one shape here that lengthens a fight, and it is
 * confined to one band, one closing-band carrier and the lieutenant. Measured across all fifty
 * boards the longest fight is **40.7 seconds** on `c17-s49` against a ninety-second timer and the
 * 0.80 bar's 72 — longer than The Spoilfield's 25.4 and well inside both. The sweep counts **zero
 * timeouts** on every board, and the fewest survivors on any board is **2.20** on `c17-s25`.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight**, never with +3 enemy levels. Here the whole board is the dial rather than the
 *    anchor slot alone, for the third chapter running.
 * 2. ⚠️ **The probe's phase is the inverse of chapter 16's, and it was computed rather than
 *    copied.** Chapter 17 opens at linear index 700, so the stride lands on s1, s5, s9, s13, s17,
 *    s21, s25, s29, s33, s37, s41, s45, s49 and the final. **Band openers 1, 3 and 5 (s1, s21, s41)
 *    are samples and openers 2 and 4 (s11, s31) are not** — the exact reverse of The Spoilfield,
 *    where s11 and s31 were the sampled pair. So three of the five bands may not open lightly, and
 *    **none of the four mini-bosses is a sample**: only the chapter boss is pinned in, so their
 *    weight is authored against the boards either side rather than against the probe. Measured
 *    thresholds run **1,451 → 2,182** with a peak of 2,280 and a worst adjacent ratio of **0.886**
 *    against a bar of 0.85 — thinner than The Spoilfield's 0.928, and it is the band 3 → band 4
 *    seam, where the board-wide `SLOW` stops. The bracket has **×2,193** of headroom, so it does not
 *    need widening.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank**, and the lieutenant does not stand
 *    on the final — chapters 9 through 16 all declined it. At a hundred-and-fifteen-level gap that
 *    pairing is not a step but a cliff.
 */
export const CHAPTER_17 = {
  id: 'chapter-17',
  name: 'The Quickmire',
  stages: [
    // -----------------------------------------------------------------------------------
    // The shallows — stages 1 to 10, levels 350 to 355
    //
    // The lock is arithmetic rather than a mechanic, exactly as The Spoilfield's opening band's
    // was, and it is a different arithmetic: these bodies are not wearing the board, they are
    // *outrunning* it. {@link MIREFOOT_RUNNER} is 170 health at `haste` 106 against a party whose
    // front rank runs 70 and 74.
    //
    // ⚠️ **This is where the returning blocks live**, and the weight is why: the band runs
    // 930–1,205 common-equivalent, the largest budget in the chapter, so it is the only place a
    // 430-health {@link SIGNAL_RUNNER} or a 400-health {@link CARRION_SWARM} still fits. By the
    // closing band the budget will not carry either.
    //
    // ⚠️ **Nothing in this band hastens, slows or stuns.** The chapter's vocabulary arrives one
    // band at a time and the opening band is the water itself.
    // -----------------------------------------------------------------------------------

    {
      id: 'c17-s1',
      name: 'Two Days East of the Field',
      enemies: {
        front: [MIREFOOT_RUNNER, CARRION_SWARM],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 350,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s2',
      name: 'The Ground Stops Being Ground',
      enemies: {
        front: [MIREFOOT_RUNNER, SLIME],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, SPOIL_PICKER],
      },
      level: 351,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s3',
      name: 'Nothing Heavy Got This Far',
      enemies: {
        front: [MIREFOOT_RUNNER, HARNESS_CUTTER],
        back: [SILTWAKE_DARTER, TALLOWLIGHT_RUNNER, QUICKMIRE_SKIMMER],
      },
      level: 351,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s4',
      name: 'Shallow, and Then Not',
      enemies: {
        front: [MIREFOOT_RUNNER, SIGNAL_RUNNER],
        back: [QUICKMIRE_SKIMMER, WISP, SPOIL_PICKER],
      },
      level: 352,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s5',
      name: 'It Was Already Behind You',
      enemies: {
        front: [MIREFOOT_RUNNER, CARRION_SWARM],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, TALLOWLIGHT_RUNNER],
      },
      level: 352,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s6',
      name: 'Reedline',
      enemies: {
        front: [MIREFOOT_RUNNER, GLADE_STALKER],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, HEAPFOOT_RUMMAGER],
      },
      level: 353,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s7',
      name: 'The Water Keeps Its Own Time',
      enemies: {
        front: [MIREFOOT_RUNNER, ROADGAUNT_OUTRIDER],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 353,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s8',
      name: 'Three Steps to Your Two',
      enemies: {
        front: [MIREFOOT_RUNNER, THORNLING],
        back: [SILTWAKE_DARTER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 354,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s9',
      name: 'Where the Reeds Give Out',
      enemies: {
        front: [MIREFOOT_RUNNER, CARRION_SWARM],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, HEAPFOOT_RUMMAGER],
      },
      level: 354,
      gear: { grade: 4, level: 100 },
    },
    // The lieutenant's first appearance. Not a probe sample — its weight is authored against the
    // boards either side of it rather than against the stride.
    {
      id: 'c17-s10',
      name: 'Something Is Setting the Pace',
      enemies: {
        front: [THE_PACEMAKER, MIREFOOT_RUNNER],
        back: [SILTWAKE_DARTER, QUICKMIRE_SKIMMER, WISP],
      },
      level: 355,
      gear: { grade: 4, level: 100 },
    },

    // -----------------------------------------------------------------------------------
    // The pack — stages 11 to 20, levels 355 to 360
    //
    // The chapter's first real lock: {@link PACKCALL_WHISTLER} puts {@link HASTE} across the whole
    // board on a fifty-five tick cadence against the status's own forty-five, so a fifth of every
    // cycle is a window in which the board is only what its stat blocks say.
    //
    // ⚠️ **Measured at 2.38 of five against the calibrated control** — the largest single mechanic
    // in the chapter that is not the final's, and larger than any anchor's whole stat line here.
    // The band's weight comes down to 758–1,150 to pay for it.
    //
    // ⚠️ **s11 is not a probe sample this chapter** (the stride's phase is the inverse of chapter
    // 16's), so this band may open at its own weight rather than against the pull.
    // -----------------------------------------------------------------------------------

    {
      id: 'c17-s11',
      name: 'One of Them Whistles',
      enemies: {
        front: [MIREFOOT_RUNNER, REEDBACK_COURSER],
        back: [PACKCALL_WHISTLER, QUICKMIRE_SKIMMER, SPOIL_PICKER],
      },
      level: 355,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s12',
      name: 'And They All Move',
      enemies: {
        front: [MIREFOOT_RUNNER, REEDBACK_COURSER],
        back: [PACKCALL_WHISTLER, SILTWAKE_DARTER, WISP],
      },
      level: 356,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s13',
      name: 'The Tune Carries',
      enemies: {
        front: [MIREFOOT_RUNNER, GLADE_STALKER],
        back: [PACKCALL_WHISTLER, REEDBACK_COURSER, TALLOWLIGHT_RUNNER],
      },
      level: 356,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s14',
      name: 'Nobody Gave the Order',
      enemies: {
        front: [REEDBACK_COURSER, MIREFOOT_RUNNER],
        back: [PACKCALL_WHISTLER, SILTWAKE_DARTER, HEAPFOOT_RUMMAGER],
      },
      level: 357,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s15',
      name: 'Downwater',
      enemies: {
        front: [MIREFOOT_RUNNER, THORNLING],
        back: [PACKCALL_WHISTLER, REEDBACK_COURSER, SILTWAKE_DARTER],
      },
      level: 357,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s16',
      name: 'Two Whistles',
      enemies: {
        front: [REEDBACK_COURSER, MIREFOOT_RUNNER],
        back: [PACKCALL_WHISTLER, PACKCALL_WHISTLER, QUICKMIRE_SKIMMER],
      },
      level: 358,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s17',
      name: 'The Pack Turns Together',
      enemies: {
        front: [MIREFOOT_RUNNER, REEDBACK_COURSER],
        back: [PACKCALL_WHISTLER, ROADGAUNT_OUTRIDER, TALLOWLIGHT_RUNNER],
      },
      level: 358,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s18',
      name: 'You Are Inside It Now',
      enemies: {
        front: [REEDBACK_COURSER, MIREFOOT_RUNNER],
        back: [PACKCALL_WHISTLER, REEDBACK_COURSER, WISP],
      },
      level: 359,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s19',
      name: 'No Gap to Step Into',
      enemies: {
        front: [MIREFOOT_RUNNER, ROADGAUNT_OUTRIDER],
        back: [PACKCALL_WHISTLER, REEDBACK_COURSER, SILTWAKE_DARTER],
      },
      level: 359,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s20',
      name: 'It Is Counting Your Turns',
      enemies: {
        front: [THE_PACEMAKER, REEDBACK_COURSER],
        back: [PACKCALL_WHISTLER, SILTWAKE_DARTER, QUICKMIRE_SKIMMER],
      },
      level: 360,
      gear: { grade: 4, level: 100 },
    },

    // -----------------------------------------------------------------------------------
    // The stepping — stages 21 to 30, levels 360 to 365
    //
    // {@link STEPMIRE_ELDER} lands {@link SLOW} across the party. ⚠️ **It stands in the FRONT rank
    // on every board in this band and that is a rule of the chapter** — the same skill measured
    // **1.83 of five** cast from the front and **2.40** from the back, because a board-wide
    // debuffer the party cannot select is the sustain-behind-a-taunt failure wearing a different
    // stat. Chapter 16 recorded the same result on a `WEAKEN` at 4.00 against 0.10.
    //
    // ⚠️ **s21 IS a probe sample this chapter**, so this band opens at 1,064 rather than lightly —
    // heavier than the stage that follows it, which is the stride being authored against rather
    // than discovered. The band runs 965–1,188.
    //
    // ⚠️ **This is the band that lengthens fights.** Across all fifty boards the longest fight is
    // 40.7 seconds against a ninety-second timer and the 0.80 bar's 72, and the fewest survivors
    // on any board in the chapter is 2.20 on `c17-s25`, in this band. It is confined here, to one
    // closing-band carrier and to the lieutenant for exactly that reason.
    // -----------------------------------------------------------------------------------

    {
      id: 'c17-s21',
      name: 'The Mire Takes a Step',
      enemies: {
        front: [STEPMIRE_ELDER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, SILTWAKE_DARTER, SPOIL_PICKER],
      },
      level: 360,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s22',
      name: 'With You Still On It',
      enemies: {
        front: [STEPMIRE_ELDER, MIREFOOT_RUNNER],
        back: [SUMPLIGHT_STRIDER, FENSPAWN_SKITTER, WISP],
      },
      level: 361,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s23',
      name: 'Slack Water',
      enemies: {
        front: [STEPMIRE_ELDER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, FENSPAWN_SKITTER, SPOIL_PICKER],
      },
      level: 361,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s24',
      name: 'Everything Slows but the Mire',
      enemies: {
        front: [STEPMIRE_ELDER, MIREFOOT_RUNNER],
        back: [SUMPLIGHT_STRIDER, PACKCALL_WHISTLER, FENSPAWN_SKITTER],
      },
      level: 362,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s25',
      name: 'Knee Deep and Falling Behind',
      enemies: {
        front: [STEPMIRE_ELDER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, SILTWAKE_DARTER, HEAPFOOT_RUMMAGER],
      },
      level: 362,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s26',
      name: 'The Long Ford',
      enemies: {
        front: [STEPMIRE_ELDER, MIREFOOT_RUNNER],
        back: [SUMPLIGHT_STRIDER, FENSPAWN_SKITTER, THORNLING],
      },
      level: 363,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s27',
      name: 'Nothing to Push Against',
      enemies: {
        front: [STEPMIRE_ELDER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, PACKCALL_WHISTLER, FENSPAWN_SKITTER],
      },
      level: 363,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s28',
      name: 'It Does Not Hurry',
      enemies: {
        front: [STEPMIRE_ELDER, MIREFOOT_RUNNER],
        back: [SUMPLIGHT_STRIDER, SILTWAKE_DARTER, FENSPAWN_SKITTER],
      },
      level: 364,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s29',
      name: 'A Step and Then a Step',
      enemies: {
        front: [STEPMIRE_ELDER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, FENSPAWN_SKITTER, WISP],
      },
      level: 364,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s30',
      name: 'Still Counting',
      enemies: {
        front: [THE_PACEMAKER, REEDBACK_COURSER],
        back: [SUMPLIGHT_STRIDER, FENSPAWN_SKITTER, SILTWAKE_DARTER],
      },
      level: 365,
      gear: { grade: 4, level: 100 },
    },

    // -----------------------------------------------------------------------------------
    // The overtaking — stages 31 to 40, levels 365 to 370
    //
    // {@link HAMMERTIDE_LURCHER} and {@link LONGSTRIDE_RAVENER} carry
    // {@link AHEAD_OF_THE_ANSWER}: one instance of damage, bigger and rarer. ⚠️ **The size of one
    // instance is an escalation axis in its own right** — the Angel Tower's third hundred measured
    // it at 4.00 → 3.38 → 2.33 across held damage per second, with zero timeouts, because a burst
    // body deals *less* over a fight and a party that answers on a cooldown cannot out-heal a
    // hammer.
    //
    // ⚠️ **No SLOW in this band.** It is confined to the stepping and the lieutenant, because it is
    // the one shape here that lengthens a fight; the band's escalation is the board's own `haste`
    // stepping to 118–120 and {@link SILTBANK_HULK} arriving as an anchor with real `def`.
    //
    // ⚠️ **s31 is not a probe sample**, so this band may open at its own weight.
    // -----------------------------------------------------------------------------------

    {
      id: 'c17-s31',
      name: 'It Passes You',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [HAMMERTIDE_LURCHER, FENSPAWN_SKITTER, SPOIL_PICKER],
      },
      level: 365,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s32',
      name: 'And Comes Back the Other Way',
      enemies: {
        front: [SILTBANK_HULK, REEDBACK_COURSER],
        back: [HAMMERTIDE_LURCHER, DRUMMING_SHOAL, FENSPAWN_SKITTER],
      },
      level: 366,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s33',
      name: 'Ahead of the Answer',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, HAMMERTIDE_LURCHER, HAMMERTIDE_LURCHER],
      },
      level: 366,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s34',
      name: 'You Started a Swing You Cannot Finish',
      enemies: {
        front: [SILTBANK_HULK, HAMMERTIDE_LURCHER],
        back: [DRUMMING_SHOAL, FENSPAWN_SKITTER, WISP],
      },
      level: 367,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s35',
      name: 'Open Water',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [HAMMERTIDE_LURCHER, DRUMMING_SHOAL, SPINEDRIFT_LANCER],
      },
      level: 367,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s36',
      name: 'One Blow, and It Was Not Yours',
      enemies: {
        front: [SILTBANK_HULK, HAMMERTIDE_LURCHER],
        back: [DRUMMING_SHOAL, SPINEDRIFT_LANCER, FENSPAWN_SKITTER],
      },
      level: 368,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s37',
      name: 'The Overtaking',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, HAMMERTIDE_LURCHER, HAMMERTIDE_LURCHER],
      },
      level: 368,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s38',
      name: 'Nothing Here Waits',
      enemies: {
        front: [SILTBANK_HULK, HAMMERTIDE_LURCHER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 369,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s39',
      name: 'Deepwater Reach',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, SPINEDRIFT_LANCER, RIVENMIRE_SPRINTER],
      },
      level: 369,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s40',
      name: 'None of Them the One',
      enemies: {
        front: [THE_PACEMAKER, FENSPAWN_SKITTER],
        back: [FENSPAWN_SKITTER, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 370,
      gear: { grade: 4, level: 100 },
    },

    // -----------------------------------------------------------------------------------
    // The last of it — stages 41 to 50, levels 370 to 375
    //
    // Everything the chapter has, at the top of its `haste` register and the bottom of its weight:
    // 1,002 common-equivalent falling to **763** at the final, which is the lightest board in the
    // campaign. ⚠️ **This band's `haste` runs 106 to 126, twenty-six under the shipped ceiling of
    // 152**, because 144 reads 0.00 of five at this weight and 130 reads 0.42. It is also the only
    // band that fields no returning block, so it is the one place the chapter's own range is the
    // board's whole range — bands 1 through 4 each reach 148 in one slot, on the Wisp.
    //
    // ⚠️ **s41 IS a probe sample**, so the band opens heavy against the pull.
    //
    // ⚠️ **{@link SLACKWATER_WARDEN} brings the stepping band's SLOW back at 112 health against
    // {@link STEPMIRE_ELDER}'s 160** — front rank, as ever — so the chapter's vocabulary closes
    // with all four shapes on the board and none of them new.
    // -----------------------------------------------------------------------------------

    {
      id: 'c17-s41',
      name: 'The Last of the Reeds',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, SPINEDRIFT_LANCER, RIVENMIRE_SPRINTER],
      },
      level: 370,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s42',
      name: 'No Bottom Anywhere',
      enemies: {
        front: [SLACKWATER_WARDEN, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, SPINEDRIFT_LANCER, RIVENMIRE_SPRINTER],
      },
      level: 371,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s43',
      name: 'Everything Left Is Quick',
      enemies: {
        front: [SILTBANK_HULK, HAMMERTIDE_LURCHER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 371,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s44',
      name: 'Three of Yours to Five of Theirs',
      enemies: {
        front: [SLACKWATER_WARDEN, SPINEDRIFT_LANCER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, FENSPAWN_SKITTER],
      },
      level: 372,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s45',
      name: 'Still Falling Behind',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 372,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s46',
      name: 'The Water Does Not End',
      enemies: {
        front: [SLACKWATER_WARDEN, HAMMERTIDE_LURCHER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 373,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s47',
      name: 'You Have Not Finished a Thought in Miles',
      enemies: {
        front: [SILTBANK_HULK, SPINEDRIFT_LANCER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, RIVENMIRE_SPRINTER],
      },
      level: 373,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s48',
      name: 'Something Is Already There',
      enemies: {
        front: [SLACKWATER_WARDEN, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 374,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c17-s49',
      name: 'The Far Bank',
      enemies: {
        front: [SILTBANK_HULK, LONGSTRIDE_RAVENER],
        back: [DRUMMING_SHOAL, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 374,
      gear: { grade: 4, level: 100 },
    },
    // The final. ⚠️ **The one board in fifty stages carrying a board-wide STUN**, conditioned on
    // the party still being whole so it lapses at the party's first loss — smaller as the fight
    // turns, never larger. The board is priced *against* that turn rather than around it: **763**
    // common-equivalent, the lightest in the campaign, where `c17-s31` twenty stages above carries
    // 1,106. ⚠️ **It may not also carry the board-wide HASTE** — it did, and read 78%.
    // Measured 100% / 3.85 survivors / 13.9s, longest 15.0s, zero timeouts.
    {
      id: 'c17-s50',
      name: 'The Latecomer',
      enemies: {
        front: [THE_LATECOMER, RIVENMIRE_SPRINTER],
        back: [FENSPAWN_SKITTER, RIVENMIRE_SPRINTER, SPINEDRIFT_LANCER],
      },
      level: 375,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
