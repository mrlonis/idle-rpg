import {
  ASHPIT_SCUTTLER,
  BENCHLINE_LURKER,
  BOAR,
  CARRION_SWARM,
  CHALKHIDE_BROWSER,
  CINDERQUENCH_BEARER,
  CLEFTHORN_GORER,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  DRIFTMOUTH_CHOKER,
  DUSTPLATE_GRINDER,
  GALLERY_SLIPFANG,
  GOLEM,
  GOREHIDE_MATRIARCH,
  IRONSLING_WRIGHT,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  OVERBURDEN_HULK,
  PLUMBLINE_HAND,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  SCARWEAVE_TRAMPLER,
  SCREEBACK_DARTER,
  SHATTERJAW_MAULER,
  SLAGBOUND_DRUDGE,
  SPLINTERYARD_HONER,
  SUMPWATER_BROOD,
  THE_DEEPCUT,
  THE_REDMAW,
  THE_UNDERCUT,
  THORNBACK_GRAZER,
  TYRANT,
} from './enemies';

/**
 * Chapter 13 — The Quarry.
 *
 * Fifty stages, enemy levels 250 to 275. It **opens at the level chapter 12 closed on**, which is the
 * rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Rustwood did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, and the rustwood how much of it **survives
 * contact**. This one asks whether it lands **at all**.
 *
 * Twelve chapters have priced a swing as a quantity — bigger, smaller, sooner, aimed elsewhere, but
 * always *arriving*. Down here it is a coin. The thing is not where the blade went; the lucky roll
 * that carried half the damage arrives ordinary; whatever the party pinned to it comes off with the
 * next fall of spoil; and the turn it was going to spend was taken out from under it.
 *
 * | Band           | Stages | The lock it teaches                                          |
 * | -------------- | ------ | ------------------------------------------------------------ |
 * | The missing    | 1–10   | it misses: evasion on bodies soft enough to be worth aiming at |
 * | The flat edge  | 11–20  | it lands flat: a crit that arrives as an ordinary hit          |
 * | The unbound    | 21–30  | it does not stick: the party's own control taken straight off  |
 * | The stolen cut | 31–40  | it never happens: the turn removed before it is spent          |
 * | The undercut   | 41–50  | all four at once, and the thing the quarry was cut down onto   |
 *
 * ## Where the setting comes from
 *
 * A dwarven working, cut down through the hill in benches, abandoned at the face. Nobody came back up
 * it and what is down there now is not dwarves. The Bleeding Wild is Monsters at home; this is
 * Monsters in a hole somebody else dug, which is why the blocks here are named for scree, spoil,
 * overburden and drift mouths rather than for the wild.
 *
 * The name is the mechanic as well as the place. **Undercutting is what a quarry does to a block it
 * means to drop** — you cut beneath the thing rather than at it — and a quarry is also the animal at
 * the end of a hunt. The party arrives thinking it is doing the first and finds out it is the second.
 *
 * ## Where the levels come from
 *
 * 250 to 275, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect.
 *
 * ⚠️ **This is the first chapter that closes _above_ the cap of the rung it asks for since the margin
 * rule was retired, and it is not a return of that rule.** `legendary-plus` caps at 260 against a
 * close of 275, so the seam party stands **fifteen levels under** the last board rather than level
 * with it. That falls out of the flat line meeting a cap, not out of a chapter being sized to
 * out-climb anything.
 *
 * ⚠️ **The seam party does not move a rung, and it was computed rather than assumed.** Chapter 12's
 * seam reads **10.4858**; against this chapter's close of 275, `legendary-plus` reads **7.6774**
 * (|Δln| **0.3117**) and `mythic` reads 16.7772 (|Δln| **0.4700**). So `legendary-plus` wins by 0.158
 * of a nat and chapter 13 is the **third** chapter running on one rung — the longest any rung has
 * held on the flat line. Moving it up by reflex would hand the party a ×1.6 The Quarry never asked
 * for, and the sweep answers that with walkovers three chapters deep rather than with a failure at
 * the seam.
 *
 * ## ⚠️ The gear grade steps to Sturdy, and it opens at level 11 rather than at level 1
 *
 * Every board here carries {@link StageEncounterData.gear} at grade **1 (Sturdy)**, climbing 11 to 40
 * across the fifty stages. **Eleven, not one, and that is arithmetic rather than taste**: a piece is
 * worth `multiplier × (1 + 0.055 × (level − 1))`, so Worn at its cap of 20 is **2.045** and Sturdy at
 * level 1 is **1.350**. A clean grade boundary would make `c13-s1` measurably *weaker* on the gear
 * axis than `c12-s49`, which is the wrong direction at the one seam this chapter is supposed to ramp
 * from. Sturdy 11 reads **2.093** — the first level of the new grade that clears the old grade's cap
 * — and Sturdy 40 reads **4.246**, so the chapter closes at ×2.08 of what The Rustwood closed at.
 *
 * ⚠️ **Measured, that is worth almost nothing, and the measurement is the point of stating it.**
 * Chapter 12's final refielded at this chapter's roof level of 275 against this chapter's own seam
 * party reads **100% with all five alive** at every rung of the Sturdy ladder, and the whole ladder
 * end to end moves the fight from **8.8s to 10.0s**:
 *
 * | Enemy gear                    | vs the seam party at 260      |
 * | ----------------------------- | ----------------------------- |
 * | Worn 20 — The Rustwood's close | 100% / 5.00 survivors / 8.8s |
 * | Sturdy 11 — this chapter opens | 100% / 5.00 / 8.8s           |
 * | Sturdy 20                      | 100% / 5.00 / 9.1s           |
 * | Sturdy 30                      | 100% / 5.00 / 9.5s           |
 * | Sturdy 40 — this chapter closes | 100% / 5.00 / 10.0s         |
 *
 * The enemy side needs **×3 to ×4** before a chapter final stops being a fight the tuned party takes
 * with all five alive. A whole grade step is worth about ×1.15 of one archetype's headline stat. So
 * **the three guards widened against the promise of this axis do not come back here either**, and
 * The Quarry's escalation comes out of its boards' composition exactly as The Rustwood's did. See
 * [gear](../../docs/gear.md) and [authoring](../../docs/authoring.md); the finding is recorded rather
 * than fixed, because sizing a gear axis for the enemy side is a milestone rather than a chapter.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the final: **eight new, twenty-four returning** —
 * exactly the quarter a chapter owes, measured over what the chapter *fields* rather than over the
 * shipped pool. Thirty-four distinct bodies in all.
 *
 * ⚠️ **The lean is Monster and it takes the faction 24 → 34.** Monster was joint-thinnest of the
 * seven at 24 with Dwarf and Angel; Angels and Demons are both barred from leading a chapter, because
 * a celestial deals ×1.10 to every mortal and the matrix has **no mortal → celestial row**.
 * **Recompute the depths before choosing the next lean** — a lean is worth ten blocks and this one
 * takes the thinnest faction to the deepest in a single session, which is the third time that has
 * happened.
 *
 * ⚠️ **Monster is the one lean that costs the matchup nothing, and that is the opposite of The
 * Rustwood's problem.** `FACTION_MATCHUPS` gives every faction ×1.05 into Monsters and Monsters ×1.05
 * into every faction including themselves at ×1.10 — the wildcard row — so a mono-Monster pool still
 * reads differently to every party. The Rustwood's 92% mono-Elf lean made the faction matchup very
 * nearly a constant across fifty boards, which is the one axis a mixed pool keeps live; here the
 * problem does not arise.
 *
 * ⚠️ **The non-Monster texture is the crew that cut the working**, and it is Dwarf throughout —
 * {@link DEEPROCK_MINER}, {@link PLUMBLINE_HAND}, {@link MARCHWARD_PIKEMAN},
 * {@link SLAGBOUND_DRUDGE}, {@link GRUDGEPLATE_SMITH} and {@link EDGETURN_WARDEN}. Six blocks, all
 * returning, none new — a chapter's ten new blocks go to its lean, and Dwarf is already level with
 * Monster on depth. The matchup stays live either way: Dwarf → Monster and Monster → Dwarf are both
 * ×1.05, so a Dwarf standing on a Monster board switches nothing off.
 *
 * ⚠️ **No celestial appears anywhere in this chapter**, checked against the boards with a script
 * rather than asserted.
 *
 * ⚠️ **The Undercut is the thirteenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## ⚠️ What restores anything here, stated as counts rather than as an absolute
 *
 * A threshold claim has its range grow underneath it, so the counts, measured over all fifty boards
 * with a script rather than by reading: **0 boards carry a block with `recovery`, 0 carry
 * `healthRegen`, 0 carry `lifeLeech`, and 0 field a heal, a drain, a regeneration or a shield in any
 * kit.** The chapter restores nothing anywhere, which is the strongest form of this claim any chapter
 * has made and the reason it is stated as fifty counted boards rather than as a sentence.
 *
 * That is deliberate and it is a Monster chapter making it. `lifeLeech` in place of a healer is the
 * faction's whole sustain idiom, so the blocks carrying it — {@link BRAMBLEHIDE_RAVENER},
 * {@link BLOODGORGE_HOUND} — and the one Monster block carrying `recovery` ({@link RIMEPLATE}) were
 * filtered out of the returning set on purpose rather than being absent by luck.
 *
 * ⚠️ **The reason is the ninety-second clock and it is sharper here than it was in The Rustwood.**
 * **25 of the 50 boards carry a {@link SLOW}**, from five distinct kits of which **two are
 * conditioned** on `SLOW` being absent — counted with a script, and the split by band is 2, 2, 1, 10,
 * 10. A slow lengthens a fight from the **party's** side by taking its turns away rather than by
 * giving the board health; evasion lengthens it a second time by deleting swings outright. Sustain on
 * top of two mechanics that both cost the party damage per second is a timeout, and a timeout is
 * scored a **defeat**.
 *
 * ⚠️ **Measured, the whole chapter runs zero timeouts and its longest fight is 15.8s against a
 * ninety-second clock** — the seam party's worst board, `c13-s50`, is 12.8s mean. So the two
 * lengthening mechanics are affordable *because* nothing here restores anything; they would not be
 * together with a heal.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier front rank, an `ascended` anchor brought forward — never with +3
 *    enemy levels, which fights the level curve for about thirteen percent and loses.
 * 2. ⚠️ **The probe reads `c13-s1`, and then every fourth stage.** The stride lands on s1, s5, s9,
 *    s13, s17, s21, s25, s29, s33, s37, s41, s45, s49 and the final — so **band openers 3 and 5
 *    (s21, s41) are samples and openers 2 and 4 (s11, s31) are not**, which is the reverse of chapter
 *    12's arrangement again. The two that are had to be authored heavy against the pull to open a
 *    band lightly. `c13-s1` is a sample as well but follows a chapter boss, which the probe excludes
 *    by name.
 * 3. ⚠️ **No board pairs two `ascended` bodies in one front rank**, and the lieutenant does not stand
 *    on the final — chapters 9 through 12 all declined it, and what stands beside The Undercut is a
 *    legendary.
 */
export const CHAPTER_13 = {
  id: 'chapter-13',
  name: 'The Quarry',
  stages: [
    // -----------------------------------------------------------------------------------
    // The missing — stages 1 to 10, levels 250 to 255, Sturdy 11 to 16
    //
    // The lock: the swing goes where the thing was. `SCREEBACK_DARTER` carries `dodge: 0.30` and
    // `GALLERY_SLIPFANG` 0.28, both inside a shipped field of 0.55, 0.34, 0.30, 0.28 — and both are
    // soft, because an evasion pool is licensed by *where* it is put rather than by its size. Only
    // five of the fifty-six shipped characters carry `accuracy`, so the answer is reach and focus
    // fire: aim past the front rank and delete the thing that cannot be hit head-on.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The seam, at The Rustwood's own closing level, and a probe sample — but one that follows a
      // chapter boss, which the probe excludes by name. Authored light on purpose: a change of place
      // rather than a step, and the player is meant to notice the ground before the bestiary.
      id: 'c13-s1',
      name: 'The Cut',
      enemies: {
        front: [CLEFTHORN_GORER, THORNBACK_GRAZER],
        back: [SCREEBACK_DARTER, CARRION_SWARM, DEEPROCK_MINER],
      },
      level: 250,
      gear: { grade: 1, level: 11 },
    },
    {
      id: 'c13-s2',
      name: 'Nobody Came Back Up It',
      enemies: {
        front: [THORNBACK_GRAZER, BOAR],
        back: [SCREEBACK_DARTER, MIREWHELP, PLUMBLINE_HAND],
      },
      level: 251,
      gear: { grade: 1, level: 12 },
    },
    {
      id: 'c13-s3',
      name: 'Scree',
      enemies: {
        front: [CHALKHIDE_BROWSER, CLEFTHORN_GORER],
        back: [SCREEBACK_DARTER, CARRION_SWARM, DEEPGALLERY_RUNNER],
      },
      level: 251,
      gear: { grade: 1, level: 12 },
    },
    {
      id: 'c13-s4',
      name: 'The Loose Floor',
      enemies: {
        front: [THORNBACK_GRAZER, RENDFANG_JACKAL],
        back: [SCREEBACK_DARTER, MIREWHELP, MARCHWARD_PIKEMAN],
      },
      level: 252,
      gear: { grade: 1, level: 13 },
    },
    {
      // ⚠️ A probe sample, and the first board where the thing that cannot be hit is also a thing
      // worth hitting.
      id: 'c13-s5',
      name: 'Nothing Where It Went',
      enemies: {
        front: [CHALKHIDE_BROWSER, GALLERY_SLIPFANG],
        back: [SCREEBACK_DARTER, ASHPIT_SCUTTLER, MARCHWARD_PIKEMAN],
      },
      level: 252,
      gear: { grade: 1, level: 13 },
    },
    {
      id: 'c13-s6',
      name: 'The Second Bench',
      enemies: {
        front: [GALLERY_SLIPFANG, THORNBACK_GRAZER],
        back: [SCREEBACK_DARTER, RAVAGER, CINDERQUENCH_BEARER],
      },
      level: 253,
      gear: { grade: 1, level: 14 },
    },
    {
      id: 'c13-s7',
      name: 'Chalk',
      enemies: {
        front: [CHALKHIDE_BROWSER, BOAR],
        back: [SCREEBACK_DARTER, RENDFANG_JACKAL, SLAGBOUND_DRUDGE],
      },
      level: 253,
      gear: { grade: 1, level: 15 },
    },
    {
      // The chapter's first {@link SLOW}, one band early and on a returning block rather than on the
      // body built for it — a trailer for the stolen cut, exactly as The Rustwood trailed its own
      // suppression on `c12-s16`.
      id: 'c13-s8',
      name: 'What Works the Face Now',
      enemies: {
        front: [GOLEM, GALLERY_SLIPFANG],
        back: [SCREEBACK_DARTER, CARRION_SWARM, CINDERQUENCH_BEARER],
      },
      level: 254,
      gear: { grade: 1, level: 15 },
    },
    {
      // ⚠️ A probe sample. Both of the band's evasion pools on one board, with the weight in front of
      // them, which is the band's question at the volume the stride reads.
      id: 'c13-s9',
      name: 'Two That Are Not There',
      enemies: {
        front: [GALLERY_SLIPFANG, CHALKHIDE_BROWSER],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, IRONSLING_WRIGHT],
      },
      level: 254,
      gear: { grade: 1, level: 16 },
    },
    {
      // Mini-boss. The lieutenant's first appearance, and the first time the party's turn is taken
      // rather than answered.
      id: 'c13-s10',
      name: 'The Deepcut',
      enemies: {
        front: [THE_DEEPCUT, CHALKHIDE_BROWSER],
        back: [SCREEBACK_DARTER, GALLERY_SLIPFANG, CARRION_SWARM],
      },
      level: 255,
      gear: { grade: 1, level: 16 },
    },

    // -----------------------------------------------------------------------------------
    // The flat edge — stages 11 to 20, levels 255 to 260, Sturdy 17 to 22
    //
    // The lock: the lucky roll arrives ordinary. `DUSTPLATE_GRINDER` carries `critBlock: 0.24` and
    // `critDamageResist: 0.32` — **at** the shipped field's second rung rather than past it, the same
    // pair `EDGETURN_WARDEN` and `EVENSONG_WARDEN` have carried since chapter 11 — and
    // `SCARWEAVE_TRAMPLER` stands beside it at 0.20 / 0.28. It is here because both of the reference
    // five's damage dealers crit — Rin at 0.22 / 0.8 and Pyra at 0.25 / 0.9 — and neither of them
    // carries a point of `critDamageResist` in return.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample, so it is allowed to state the lock plainly on a
      // board the party has already beaten.
      id: 'c13-s11',
      name: 'Dustplate',
      enemies: {
        front: [DUSTPLATE_GRINDER, CHALKHIDE_BROWSER],
        back: [SCREEBACK_DARTER, RENDFANG_JACKAL, DEEPGALLERY_RUNNER],
      },
      level: 255,
      gear: { grade: 1, level: 17 },
    },
    {
      id: 'c13-s12',
      name: 'Ground Down',
      enemies: {
        front: [DUSTPLATE_GRINDER, THORNBACK_GRAZER],
        back: [GALLERY_SLIPFANG, SHATTERJAW_MAULER, DEEPROCK_MINER],
      },
      level: 256,
      gear: { grade: 1, level: 18 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c13-s13',
      name: 'Nothing Comes Off Clean',
      enemies: {
        front: [DUSTPLATE_GRINDER, GOLEM],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, MIREWHELP],
      },
      level: 256,
      gear: { grade: 1, level: 18 },
    },
    {
      // The crew that cut the working, still holding the head of it.
      id: 'c13-s14',
      name: 'The Old Crew',
      enemies: {
        front: [SPLINTERYARD_HONER, CHALKHIDE_BROWSER],
        back: [GALLERY_SLIPFANG, PLUMBLINE_HAND, SLAGBOUND_DRUDGE],
      },
      level: 257,
      gear: { grade: 1, level: 19 },
    },
    {
      id: 'c13-s15',
      name: 'The Flat Edge',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, CHALKHIDE_BROWSER],
        back: [SCREEBACK_DARTER, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 257,
      gear: { grade: 1, level: 19 },
    },
    {
      id: 'c13-s16',
      name: 'Spoil',
      enemies: {
        front: [SPLINTERYARD_HONER, CHALKHIDE_BROWSER],
        back: [GOREHIDE_MATRIARCH, GALLERY_SLIPFANG, DEEPGALLERY_RUNNER],
      },
      level: 258,
      gear: { grade: 1, level: 20 },
    },
    {
      // ⚠️ A probe sample, and the heaviest front rank the chapter has fielded: the band's own block
      // beside the shipped body that has carried the same pair of stats since The Bleeding Wild.
      id: 'c13-s17',
      name: 'Two Kinds of Plate',
      enemies: {
        front: [DUSTPLATE_GRINDER, SCARWEAVE_TRAMPLER],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, IRONSLING_WRIGHT],
      },
      level: 258,
      gear: { grade: 1, level: 20 },
    },
    {
      id: 'c13-s18',
      name: 'The Quench Pit',
      enemies: {
        front: [DUSTPLATE_GRINDER, SPLINTERYARD_HONER],
        back: [GALLERY_SLIPFANG, CARRION_SWARM, MIREWHELP],
      },
      level: 259,
      gear: { grade: 1, level: 21 },
    },
    {
      id: 'c13-s19',
      name: 'What the Smiths Left',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, IRONSLING_WRIGHT],
        back: [SCREEBACK_DARTER, REDWATER_STALKER, MARCHWARD_PIKEMAN],
      },
      level: 259,
      gear: { grade: 1, level: 22 },
    },
    {
      // Mini-boss. The lieutenant behind the band's own wall: the party's crits stop paying on the
      // same board where its turns start going missing.
      id: 'c13-s20',
      name: 'Cut Beneath It',
      enemies: {
        front: [THE_DEEPCUT, DUSTPLATE_GRINDER],
        back: [GALLERY_SLIPFANG, SCREEBACK_DARTER, MARROWHUNT_ALPHA],
      },
      level: 260,
      gear: { grade: 1, level: 22 },
    },

    // -----------------------------------------------------------------------------------
    // The unbound — stages 21 to 30, levels 260 to 265, Sturdy 23 to 28
    //
    // The lock: nothing the party applies stays applied. `OVERBURDEN_HULK` carries `tenacity: 0.80`
    // — third-highest shipped, inside a ceiling of 0.85 — and {@link NOTHING_TAKES_HOLD} says it
    // again as a turn: two hostile statuses off every body on its side, every sixty ticks.
    //
    // ⚠️ **A cleanse is not sustain, and that is the whole of why this band is authorable.** It
    // restores no health and banks no pool; what it costs the party is the turn it spent, which is a
    // choice re-priced rather than a fight the clock ends.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample, which is the harder of the two jobs: it may not read
      // as a step down from `c13-s17`. So it opens on the band's own block at full weight beside the
      // band above's, rather than easing into it.
      id: 'c13-s21',
      name: 'Overburden',
      enemies: {
        front: [OVERBURDEN_HULK, DUSTPLATE_GRINDER],
        back: [SUMPWATER_BROOD, GALLERY_SLIPFANG, MARROWHUNT_ALPHA],
      },
      level: 260,
      gear: { grade: 1, level: 23 },
    },
    {
      id: 'c13-s22',
      name: 'It Comes Straight Off',
      enemies: {
        front: [OVERBURDEN_HULK, THORNBACK_GRAZER],
        back: [SUMPWATER_BROOD, RAVAGER, DEEPROCK_MINER],
      },
      level: 261,
      gear: { grade: 1, level: 23 },
    },
    {
      id: 'c13-s23',
      name: 'The Sump',
      enemies: {
        front: [OVERBURDEN_HULK, CHALKHIDE_BROWSER],
        back: [SUMPWATER_BROOD, REDWATER_STALKER, CINDERQUENCH_BEARER],
      },
      level: 261,
      gear: { grade: 1, level: 24 },
    },
    {
      id: 'c13-s24',
      name: 'Nothing Holds',
      enemies: {
        front: [SPLINTERYARD_HONER, OVERBURDEN_HULK],
        back: [SUMPWATER_BROOD, SHATTERJAW_MAULER, PLUMBLINE_HAND],
      },
      level: 262,
      gear: { grade: 1, level: 25 },
    },
    {
      // ⚠️ A probe sample, and the band's first `ascended` anchor. One only — the front rank never
      // holds two of them anywhere in this chapter.
      id: 'c13-s25',
      name: 'The Redmaw in the Working',
      enemies: {
        front: [THE_REDMAW, OVERBURDEN_HULK],
        back: [SUMPWATER_BROOD, SCREEBACK_DARTER, MARROWHUNT_ALPHA],
      },
      level: 262,
      gear: { grade: 1, level: 25 },
    },
    {
      id: 'c13-s26',
      name: 'Two Walls and the Water',
      enemies: {
        front: [OVERBURDEN_HULK, DUSTPLATE_GRINDER],
        back: [SUMPWATER_BROOD, GOREHIDE_MATRIARCH, DEEPGALLERY_RUNNER],
      },
      level: 263,
      gear: { grade: 1, level: 26 },
    },
    {
      id: 'c13-s27',
      name: 'Unpinned',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, OVERBURDEN_HULK],
        back: [SUMPWATER_BROOD, GALLERY_SLIPFANG, MARCHWARD_PIKEMAN],
      },
      level: 263,
      gear: { grade: 1, level: 26 },
    },
    {
      id: 'c13-s28',
      name: 'The Waste Above the Seam',
      enemies: {
        front: [OVERBURDEN_HULK, IRONSLING_WRIGHT],
        back: [SUMPWATER_BROOD, REDWATER_STALKER, SLAGBOUND_DRUDGE],
      },
      level: 264,
      gear: { grade: 1, level: 27 },
    },
    {
      // ⚠️ A probe sample, and the last board before the third mini-boss.
      id: 'c13-s29',
      name: 'Nothing Takes Hold',
      enemies: {
        front: [TYRANT, OVERBURDEN_HULK],
        back: [SUMPWATER_BROOD, GALLERY_SLIPFANG, MARROWHUNT_ALPHA],
      },
      level: 264,
      gear: { grade: 1, level: 28 },
    },
    {
      // Mini-boss. The lieutenant behind the block that takes the party's control off, so the answer
      // the party found on `c13-s10` is the answer that stops working here.
      id: 'c13-s30',
      name: 'Nothing Sticks to It',
      enemies: {
        front: [THE_DEEPCUT, OVERBURDEN_HULK],
        back: [SUMPWATER_BROOD, GALLERY_SLIPFANG, SCREEBACK_DARTER],
      },
      level: 265,
      gear: { grade: 1, level: 28 },
    },

    // -----------------------------------------------------------------------------------
    // The stolen cut — stages 31 to 40, levels 265 to 270, Sturdy 29 to 34
    //
    // The lock: the turn is taken before it is spent. {@link SLOW} is the quietest debuff in the game
    // because haste buys **turns** rather than damage, so a third off the party's gauge is a third of
    // everything it was ever going to do.
    //
    // ⚠️ **The counts, measured over the ten boards rather than asserted.** All ten carry a slow, and
    // four distinct kits produce them here — {@link CHOKE_THE_DRIFT} and `STONE_FIST` unconditioned,
    // {@link THE_FACE_COMES_DOWN} and {@link CUT_BENEATH_IT} conditioned on `SLOW` being absent. The
    // two conditioned ones are the termination argument rather than a courtesy: unconditioned they
    // would be a turn tax with no decision in it, and ten boards carrying one would be one board
    // carried ten times. Conditioned, a party that cleanses is asking for it again and a party that
    // does not is simply slower.
    // -----------------------------------------------------------------------------------
    {
      // A band opener and **not** a probe sample.
      id: 'c13-s31',
      name: 'The Face Comes Down',
      enemies: {
        front: [DUSTPLATE_GRINDER, CHALKHIDE_BROWSER],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, PLUMBLINE_HAND],
      },
      level: 265,
      gear: { grade: 1, level: 29 },
    },
    {
      id: 'c13-s32',
      name: 'Sixty Feet of Bench',
      enemies: {
        front: [OVERBURDEN_HULK, THORNBACK_GRAZER],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, DEEPGALLERY_RUNNER],
      },
      level: 266,
      gear: { grade: 1, level: 29 },
    },
    {
      // ⚠️ A probe sample. An `ascended` anchor in front of the band's own pair for the first time.
      id: 'c13-s33',
      name: 'Half a Turn Late',
      enemies: {
        front: [THE_REDMAW, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, GALLERY_SLIPFANG],
      },
      level: 266,
      gear: { grade: 1, level: 30 },
    },
    {
      id: 'c13-s34',
      name: 'The Drift Mouth',
      enemies: {
        front: [SPLINTERYARD_HONER, GOLEM],
        back: [BENCHLINE_LURKER, RAVAGER, DRIFTMOUTH_CHOKER],
      },
      level: 267,
      gear: { grade: 1, level: 31 },
    },
    {
      // Three of the chapter's four locks on one board: a wall that flattens crits, a hulk that takes
      // the party's control off, and the face coming down on all five.
      id: 'c13-s35',
      name: 'All But the Aim',
      enemies: {
        front: [OVERBURDEN_HULK, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, IRONSLING_WRIGHT],
      },
      level: 267,
      gear: { grade: 1, level: 31 },
    },
    {
      id: 'c13-s36',
      name: 'Under the Working',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, IRONSLING_WRIGHT],
        back: [BENCHLINE_LURKER, SHATTERJAW_MAULER, DRIFTMOUTH_CHOKER],
      },
      level: 268,
      gear: { grade: 1, level: 32 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c13-s37',
      name: 'The Gauge Runs Backwards',
      enemies: {
        front: [THE_REDMAW, OVERBURDEN_HULK],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, GALLERY_SLIPFANG],
      },
      level: 268,
      gear: { grade: 1, level: 32 },
    },
    {
      id: 'c13-s38',
      name: 'The Honer and the Waste',
      enemies: {
        front: [SPLINTERYARD_HONER, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, GOREHIDE_MATRIARCH, SUMPWATER_BROOD],
      },
      level: 269,
      gear: { grade: 1, level: 33 },
    },
    {
      id: 'c13-s39',
      name: 'Nothing Spent',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, OVERBURDEN_HULK],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, SLAGBOUND_DRUDGE],
      },
      level: 269,
      gear: { grade: 1, level: 33 },
    },
    {
      // Mini-boss, and the lieutenant's last appearance — fifteen levels above where the party first
      // met it, with both of the band's slows standing behind it. Its own turn is still conditioned,
      // so on this board it is usually the *third* thing to take a turn away and often takes none.
      id: 'c13-s40',
      name: 'What the Hill Kept',
      enemies: {
        front: [THE_DEEPCUT, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, GALLERY_SLIPFANG],
      },
      level: 270,
      gear: { grade: 1, level: 34 },
    },

    // -----------------------------------------------------------------------------------
    // The undercut — stages 41 to 50, levels 270 to 275, Sturdy 35 to 40
    //
    // All four locks at once, and the Sturdy set at the top of its own ladder. Nothing new is asked
    // above this line: what changes is that every board carries two of the four at the same time and
    // the front rank stops being anything the party can go through quickly.
    //
    // ⚠️ **The dwarves thin out and then stop**, which is the fiction and the arithmetic at once:
    // counted, the five bands carry **9, 11, 8, 7 and 2** Dwarf slots. Nobody who cut this working got
    // this far down it.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A band opener **and** a probe sample — the second of the two, and the same job as
      // `c13-s21`. So it opens on an `ascended` anchor and the band below's block at once.
      id: 'c13-s41',
      name: 'The Floor of It',
      enemies: {
        front: [THE_REDMAW, OVERBURDEN_HULK],
        back: [BENCHLINE_LURKER, GALLERY_SLIPFANG, SUMPWATER_BROOD],
      },
      level: 270,
      gear: { grade: 1, level: 35 },
    },
    {
      id: 'c13-s42',
      name: 'Cut Down Onto It',
      enemies: {
        front: [TYRANT, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, SCREEBACK_DARTER, DRIFTMOUTH_CHOKER],
      },
      level: 271,
      gear: { grade: 1, level: 35 },
    },
    {
      id: 'c13-s43',
      name: 'The Last Bench',
      enemies: {
        front: [OVERBURDEN_HULK, SCARWEAVE_TRAMPLER],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, RAVAGER],
      },
      level: 271,
      gear: { grade: 1, level: 36 },
    },
    {
      id: 'c13-s44',
      name: 'Neither Half Arrives',
      enemies: {
        front: [THE_REDMAW, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, IRONSLING_WRIGHT],
      },
      level: 272,
      gear: { grade: 1, level: 36 },
    },
    {
      // ⚠️ A probe sample.
      id: 'c13-s45',
      name: 'The Quarry Answers',
      enemies: {
        front: [THE_REDMAW, SCARWEAVE_TRAMPLER],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, GALLERY_SLIPFANG],
      },
      level: 272,
      gear: { grade: 1, level: 37 },
    },
    {
      id: 'c13-s46',
      name: 'Down to the Head',
      enemies: {
        front: [OVERBURDEN_HULK, SPLINTERYARD_HONER],
        back: [BENCHLINE_LURKER, SHATTERJAW_MAULER, DRIFTMOUTH_CHOKER],
      },
      level: 273,
      gear: { grade: 1, level: 38 },
    },
    {
      // ⚠️ A probe sample, and the chapter's heaviest board that is not the final.
      id: 'c13-s47',
      name: 'Nothing Lands',
      enemies: {
        front: [THE_REDMAW, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, GALLERY_SLIPFANG],
      },
      level: 273,
      gear: { grade: 1, level: 38 },
    },
    {
      id: 'c13-s48',
      name: 'Before the Fall',
      enemies: {
        front: [TYRANT, OVERBURDEN_HULK],
        back: [BENCHLINE_LURKER, DRIFTMOUTH_CHOKER, GOREHIDE_MATRIARCH],
      },
      level: 274,
      gear: { grade: 1, level: 39 },
    },
    {
      // The last board before the final. The chapter's own list in full, one level below the thing
      // the list has been describing.
      id: 'c13-s49',
      name: 'The Working Stands Up',
      enemies: {
        front: [THE_REDMAW, OVERBURDEN_HULK],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, GALLERY_SLIPFANG],
      },
      level: 274,
      gear: { grade: 1, level: 39 },
    },
    {
      // The chapter final. ⚠️ **One `ascended` anchor and four legendaries**, which is the shape
      // chapters 9 through 12 all settled on — the lieutenant is deliberately absent, because a
      // second anchor beside a boss is the sharpest non-linear weight step this game can author.
      //
      // Every band on one board: the Slipfang the party cannot hit, the Grinder's flat edge, the
      // Brood that will not hold a status, and the Lurker bringing the face down. What The Undercut
      // adds is {@link THE_GROUND_GOES} — the whole party hit and slowed on a seventy-tick cadence,
      // and **unconditioned**, unlike the three slows below it, so the answer the chapter taught does
      // not work here.
      //
      // ⚠️ **It restores nothing, and this is the one absolute claim the chapter makes about a single
      // board.** No block on it carries `recovery`, `healthRegen` or `lifeLeech`, and no kit on it
      // heals, drains or shields. One board, checkable, and checked with a script rather than by
      // reading.
      //
      // ⚠️ **It is also the one board in the chapter that steps past the shipped register**, at
      // `critBlock: 0.28` and `critDamageResist: 0.40` — past the field of 0.24 and 0.32 and under
      // `THE_UNFALTERING`'s lone 0.34 and 0.52.
      id: 'c13-s50',
      name: 'The Undercut',
      enemies: {
        front: [THE_UNDERCUT, DUSTPLATE_GRINDER],
        back: [BENCHLINE_LURKER, SUMPWATER_BROOD, GALLERY_SLIPFANG],
      },
      level: 275,
      gear: { grade: 1, level: 40 },
    },
  ],
} as const;
