import {
  BANDIT,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  COLDFORGE_HAND,
  COUNTERSIGN_CAPTAIN,
  FORLORN_LEVY,
  FREE_BLADE,
  GLOAMVINE_CREEPER,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVEWAKE_THRALL,
  HOLLOWBARK_SENTRY,
  KINGSWAY_LANCER,
  LONGBOUGH_MARKSMAN,
  MIREWHELP,
  MUSTER_PIKE,
  OATHBREAKER,
  ORDER_SERJEANT,
  RENDFANG_JACKAL,
  RESERVE_ENSIGN,
  ROADWATCH_BOWMAN,
  SIGNAL_RUNNER,
  SLAGBOUND_DRUDGE,
  STANDFAST_LANCER,
  STORMCALLER,
  THE_COLOUR_SERJEANT,
  THE_LAST_ORDER,
  THORNBACK_GRAZER,
  UNDERVAULT_SAPPER,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
} from './enemies';

/**
 * Chapter 11 — The Standing Line.
 *
 * Fifty stages, enemy levels 200 to 225. It **opens at the level chapter 10 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Bleeding Wild did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, and the wild what its damage **does to the thing it is
 * spent on**. This one asks what the party spends it on **first**.
 *
 * Eleven chapters have let the party choose its target freely and priced that choice at nothing —
 * every board so far is a pool of health that has to reach zero, and the order it reaches zero in has
 * mattered only where a taunt took the choice away. Out here the order is the whole fight, and
 * nothing forces it.
 *
 * | Band               | Stages | The lock it teaches                                      |
 * | ------------------ | ------ | -------------------------------------------------------- |
 * | The muster         | 1–10   | the board re-arms itself, from a body standing behind it  |
 * | The standing order | 11–20  | the weight lands while the party is still whole           |
 * | The relief         | 21–30  | what the party takes off is put straight back             |
 * | The countersign    | 31–40  | the board answers the party's own setup turn              |
 * | The standing line  | 41–50  | all four at once, and nothing to hide behind              |
 *
 * ## ⚠️ No taunt appears anywhere in this chapter, and that is the design
 *
 * Chapters 9 and 10 both close on a taunt band — the one body the party may hit is the one it cannot
 * *open*, and then the one it must not *wound*. A taunt makes the order **forced**, and this chapter
 * is about the order being **chosen wrongly**: every board here leaves the party free to aim anywhere
 * and charges it for aiming badly. Checked against the boards with a script rather than asserted.
 *
 * ⚠️ **Nothing here puts health back either**, and the two rules are one decision. Three of the
 * chapter's turns are board-wide buffs and one of them is {@link GUARD}, so a fight here already runs
 * longer than a fight in the wild did; sustain the party cannot aim at, or a wall in front of it, on
 * top of that is the ninety-second clock — and a timeout is scored a **defeat**. The single thing on
 * the enemy side that restores anything is {@link AEGIS} on the lieutenant's own turn, which banks a
 * pool once and depletes rather than refilling.
 *
 * ## Where the levels come from
 *
 * 200 to 225, half a level a stage, flat — `open + round(25 * (i - 1) / 49)`, so each level stands
 * for two stages and there is nothing to bisect. The chapter runs entirely inside `legendary-plus`'s
 * cap of 260, which is how every chapter has worked since the margin rule was retired.
 *
 * ⚠️ **The seam party moves up a rung and it was computed rather than assumed.** Chapters 8, 9 and 10
 * all shared `legendary`; on the flat line a new chapter often asks for the same rung as the one below
 * it, and moving it up by reflex hands the party a ×1.6 the content never asked for. The rung that
 * reproduces chapter 10's own seam ratio is the closest in log space to 6.5536 — `legendary` reads
 * 3.898 (|Δln| 0.520) and `legendary-plus` reads 10.486 (|Δln| 0.470), so `legendary-plus` wins, and
 * it wins **narrowly**. See [authoring](../../docs/authoring.md) for the formula.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the boss: **eight new, twenty-four returning** —
 * exactly the quarter a chapter owes, measured over what the chapter *fields* rather than over the
 * shipped pool.
 *
 * ⚠️ **The lean is Human and it takes the faction 14 → 24, from thinnest of the seven to deepest.**
 * That is the largest single move any lean has made. Angels (16) and Demons (17) were the next two
 * thinnest and both are barred from leading a chapter — a celestial deals ×1.10 to every mortal and
 * the matrix has no mortal → celestial row — so Human was very nearly forced. **Recompute the depths
 * before choosing the next lean**; the argument that picked this one does not repeat.
 *
 * ⚠️ **Three Human blocks make their campaign debut here** — {@link FORLORN_LEVY},
 * {@link KINGSWAY_LANCER} and {@link UNDERVAULT_SAPPER} were authored for the Human and Dwarf towers
 * and had never been fielded on the ladder. The rest is the wild at the seam, the weald along one
 * flank, the hold's stragglers, and what follows an army that has stopped moving.
 *
 * ⚠️ **No celestial appears anywhere in this chapter, and it was checked against the boards rather
 * than asserted.** The chapter's own signature is already a standing multiplier on what the enemy
 * board does — {@link THE_ORDER_STANDS} is worth ×1.3 attack and ×1.4 defence to all five — and a
 * celestial's matchup edge is the same tax a second time, with nothing a mortal composition can bring
 * to either.
 *
 * ⚠️ **The Last Order is the eleventh body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **The board is not the difficulty dial and neither is the level.** A step backwards is fixed
 *    with **weight** — a heavier back rank, a legendary front — never with +3 enemy levels, which
 *    fights the level curve for about thirteen percent and loses.
 * 2. ⚠️ **The probe reads `c11-s1`, and then every fourth stage.** The stride lands on s1, s5, s9,
 *    s13, s17, s21, s25, s29, s33, s37, s41, s45, s49 and the boss — so **band openers 1, 3 and 5 are
 *    samples and openers 2 and 4 are not**, and the three that are had to be authored heavy against
 *    the pull to open a band lightly. `c11-s1` is excused its own step down by the `afterBoss` skip,
 *    which is why it is the one opener authored light: what it may not do is stand so heavy that
 *    `c11-s5` reads as a step backwards.
 * 3. ⚠️ **The lieutenant does not stand on the final.** The rule permits it and chapters 9 and 10 both
 *    declined; a second `ascended` anchor beside the boss is the sharpest non-linear weight step this
 *    game can author, and what stands beside The Last Order is a legendary.
 */
export const CHAPTER_11 = {
  id: 'chapter-11',
  name: 'The Standing Line',
  stages: [
    // -----------------------------------------------------------------------------------
    // The muster — stages 1 to 10, levels 200 to 205
    //
    // The lock: the board re-arms itself, and the thing doing it is standing behind the thing the
    // party is hitting. Stated first on fodder, then at a legendary's weight.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The seam, at the wild's own closing level, and **a probe sample** — the stride lands on
      // `c11-s1` where it landed on `c10-s3`. Authored light on purpose: the `afterBoss` skip
      // excuses this stage its own step down from The Everwound, but `c11-s5` is measured against
      // it, so a heavy opener here would fail the band rather than start it.
      //
      // Five commons, two of them from the other side of the seam, and one Runner in the back rank
      // that nothing on screen says anything about.
      id: 'c11-s1',
      name: 'The Turned Field',
      enemies: {
        front: [MIREWHELP, MUSTER_PIKE],
        back: [CARRION_SWARM, SIGNAL_RUNNER, ROADWATCH_BOWMAN],
      },
      level: 200,
    },
    {
      // The lock stated plainly, on nothing but fodder. Nothing here is dangerous and all of it is a
      // third faster than it should be, which is the whole of what {@link PASS_THE_WORD} is: a tax
      // on clearing a front rank in the order the front rank presents itself.
      id: 'c11-s2',
      name: 'Word Down the Line',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [SIGNAL_RUNNER, ROADWATCH_BOWMAN, BANDIT],
      },
      level: 201,
    },
    {
      // Two Runners, which is the same question asked at a volume a player cannot miss. The board is
      // otherwise the weakest in the chapter and it is the fastest.
      id: 'c11-s3',
      name: 'The Picket Line',
      enemies: {
        front: [VANWARD_SPEAR, FREE_BLADE],
        back: [SIGNAL_RUNNER, SIGNAL_RUNNER, ROADWATCH_BOWMAN],
      },
      level: 201,
    },
    {
      id: 'c11-s4',
      name: 'Ditchwater',
      enemies: {
        front: [MUSTER_PIKE, THORNBACK_GRAZER],
        back: [CARRION_SWARM, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 202,
    },
    {
      // ⚠️ A probe sample, and the band's other half: the same lock at a legendary's weight. The
      // Serjeant braces and sharpens all five at once, so the board the party measured on `c11-s2`
      // is not the board it is fighting — and unlike the Runner, this one does not die to a single
      // reaching turn.
      id: 'c11-s5',
      name: 'Where the Order Came From',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [ORDER_SERJEANT, SIGNAL_RUNNER, ROADWATCH_BOWMAN],
      },
      level: 202,
    },
    {
      // The Creeper is here for its {@link MIRE}: a board that is already faster than it should be,
      // slowing the rank the party would have used to reach the back one.
      id: 'c11-s6',
      name: 'Standing Water',
      enemies: {
        front: [MUSTER_PIKE, HOLLOWBARK_SENTRY],
        back: [ORDER_SERJEANT, GLOAMVINE_CREEPER, ROADWATCH_BOWMAN],
      },
      level: 203,
    },
    {
      id: 'c11-s7',
      name: 'The Second Rank',
      enemies: {
        front: [VANWARD_SPEAR, MUSTER_PIKE],
        back: [ORDER_SERJEANT, SIGNAL_RUNNER, BANDIT],
      },
      level: 203,
    },
    {
      id: 'c11-s8',
      name: 'Nobody Stood Down',
      enemies: {
        front: [MUSTER_PIKE, VAULTBOUND_GAOLER],
        back: [ORDER_SERJEANT, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 204,
    },
    {
      // ⚠️ A probe sample. Both callers on one board behind a legendary front rank, which is the
      // band closing on the hardest version of its own question: two bodies worth killing first, and
      // only one turn to spend on the choice.
      id: 'c11-s9',
      name: 'Two Callers',
      enemies: {
        front: [VANWARD_SPEAR, KINGSWAY_LANCER],
        back: [ORDER_SERJEANT, SIGNAL_RUNNER, ROADWATCH_BOWMAN],
      },
      level: 204,
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **The same block stands on all four**,
      // at 205, 210, 215 and 220 — a recurring antagonist that gets harder because the ladder does,
      // rather than four one-shot stat blocks.
      //
      // ⚠️ **Conditioned rather than an opening turn**, which is the third chapter running to take
      // that shape. {@link THE_COLOURS_STAND} does nothing until the party has hurt something and
      // then shields exactly what the party chose, so four appearances are four different fights
      // against one stat block.
      id: 'c11-s10',
      name: 'The Colour Serjeant',
      enemies: {
        front: [THE_COLOUR_SERJEANT, MUSTER_PIKE],
        back: [ORDER_SERJEANT, SIGNAL_RUNNER, ROADWATCH_BOWMAN],
      },
      level: 205,
    },

    // -----------------------------------------------------------------------------------
    // The standing order — stages 11 to 20, levels 205 to 210
    //
    // The lock: the board spends its weight while the party is whole. ⚠️ **Not a probe sample**, so
    // this opener is allowed to be the light one — the stride reads s13 and s17 instead.
    // -----------------------------------------------------------------------------------
    {
      id: 'c11-s11',
      name: 'The Halt',
      enemies: {
        front: [STANDFAST_LANCER, MUSTER_PIKE],
        back: [ROADWATCH_BOWMAN, SIGNAL_RUNNER, BANDIT],
      },
      level: 205,
    },
    {
      id: 'c11-s12',
      name: 'Levelled Spears',
      enemies: {
        front: [STANDFAST_LANCER, VANWARD_SPEAR],
        back: [ROADWATCH_BOWMAN, CARRION_SWARM, FORLORN_LEVY],
      },
      level: 206,
    },
    {
      // ⚠️ A probe sample, and the band stated at full weight: two bodies whose heaviest turn is
      // gated on the party being entirely whole, over a caller that keeps the rest of the board
      // standing. Everything here is front-loaded — a party that takes its first loss early has
      // bought the second half of the fight cheaply, which is the inversion the band exists for.
      id: 'c11-s13',
      name: 'While You Are Five',
      enemies: {
        front: [STANDFAST_LANCER, KINGSWAY_LANCER],
        back: [ORDER_SERJEANT, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
      level: 206,
    },
    {
      id: 'c11-s14',
      name: 'Broken Ground',
      enemies: {
        front: [VANWARD_SPEAR, MUSTER_PIKE],
        back: [FORLORN_LEVY, ROADWATCH_BOWMAN, RENDFANG_JACKAL],
      },
      level: 207,
    },
    {
      id: 'c11-s15',
      name: 'The First Loss',
      enemies: {
        front: [STANDFAST_LANCER, VANWARD_SPEAR],
        back: [SIGNAL_RUNNER, FORLORN_LEVY, ROADWATCH_BOWMAN],
      },
      level: 207,
    },
    {
      id: 'c11-s16',
      name: 'The Roadwatch',
      enemies: {
        front: [MUSTER_PIKE, FREE_BLADE],
        back: [ROADWATCH_BOWMAN, ROADWATCH_BOWMAN, LONGBOUGH_MARKSMAN],
      },
      level: 208,
    },
    {
      // ⚠️ A probe sample. The Marksman is what stops the band resolving into "stand still and
      // trade": {@link THE_LONG_LOOSE} opens the rank the party keeps its damage in, and the two
      // charges in front are aimed at the body holding everything up.
      id: 'c11-s17',
      name: 'Charge at the Halt',
      enemies: {
        front: [STANDFAST_LANCER, KINGSWAY_LANCER],
        back: [ORDER_SERJEANT, LONGBOUGH_MARKSMAN, SIGNAL_RUNNER],
      },
      level: 208,
    },
    {
      id: 'c11-s18',
      name: 'The Levy Field',
      enemies: {
        front: [VANWARD_SPEAR, MUSTER_PIKE],
        back: [FORLORN_LEVY, FORLORN_LEVY, ROADWATCH_BOWMAN],
      },
      level: 209,
    },
    {
      id: 'c11-s19',
      name: 'Nothing Held Back',
      enemies: {
        front: [STANDFAST_LANCER, VANWARD_SPEAR],
        back: [ORDER_SERJEANT, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
      level: 209,
    },
    {
      // Mini-boss. The lieutenant's second appearance, and the first time its shield lands on a body
      // the party had already committed to killing *because the board would soon be weaker* — which
      // is the two bands' questions arriving on the same turn.
      id: 'c11-s20',
      name: 'The Colours at the Halt',
      enemies: {
        front: [THE_COLOUR_SERJEANT, STANDFAST_LANCER],
        back: [ORDER_SERJEANT, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 210,
    },

    // -----------------------------------------------------------------------------------
    // The relief — stages 21 to 30, levels 210 to 215
    //
    // The lock: what the party takes off is put straight back. The answer is the source, not the
    // symptom — and the source stands in the rank the party has to reach for.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **A band opener that is also a probe sample**, which is the trap chapters 6, 7 and 8 all
      // fell into: band openings want to be light and the stride does not care. Authored heavy on
      // purpose — five bodies, three legendaries in the back rank, and both of the band's
      // re-appliers standing together. The Ensign puts {@link WEAKEN} back on the party's back rank
      // the moment it is cleared, and the Stormcaller's {@link WITHERHEX} does the same to the whole
      // board; between them a cleanse is never the last word.
      id: 'c11-s21',
      name: 'The Relief',
      enemies: {
        front: [STANDFAST_LANCER, MUSTER_PIKE],
        back: [RESERVE_ENSIGN, STORMCALLER, ORDER_SERJEANT],
      },
      level: 210,
    },
    {
      id: 'c11-s22',
      name: 'Fresh Ranks',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [RESERVE_ENSIGN, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
      level: 211,
    },
    {
      id: 'c11-s23',
      name: 'The Same Wound Twice',
      enemies: {
        front: [VANWARD_SPEAR, KINGSWAY_LANCER],
        back: [RESERVE_ENSIGN, STORMCALLER, SIGNAL_RUNNER],
      },
      level: 211,
    },
    {
      id: 'c11-s24',
      name: 'Blunted',
      enemies: {
        front: [MUSTER_PIKE, HOLLOWBARK_SENTRY],
        back: [RESERVE_ENSIGN, ROADWATCH_BOWMAN, WHISPERLEAF_ARCHER],
      },
      level: 212,
    },
    {
      // ⚠️ A probe sample. Both re-appliers behind a legendary front rank the party cannot walk
      // through quickly, which is what turns "cleanse it" from a bad turn into an expensive habit.
      id: 'c11-s25',
      name: 'Put Back As It Was',
      enemies: {
        front: [STANDFAST_LANCER, KINGSWAY_LANCER],
        back: [RESERVE_ENSIGN, STORMCALLER, ORDER_SERJEANT],
      },
      level: 212,
    },
    {
      // The Sapper opens the party's own front rank while the Ensign blunts its back one, so both
      // halves of the party are being taken apart from the rank it has least reach into.
      id: 'c11-s26',
      name: "The Sapper's Ditch",
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [UNDERVAULT_SAPPER, RESERVE_ENSIGN, COLDFORGE_HAND],
      },
      level: 213,
    },
    {
      id: 'c11-s27',
      name: 'Undermined',
      enemies: {
        front: [VANWARD_SPEAR, SLAGBOUND_DRUDGE],
        back: [UNDERVAULT_SAPPER, RESERVE_ENSIGN, SIGNAL_RUNNER],
      },
      level: 213,
    },
    {
      id: 'c11-s28',
      name: 'The Long Loosing',
      enemies: {
        front: [MUSTER_PIKE, HOLLOWBARK_SENTRY],
        back: [LONGBOUGH_MARKSMAN, RESERVE_ENSIGN, WHISPERLEAF_ARCHER],
      },
      level: 214,
    },
    {
      // ⚠️ A probe sample, and the band's hardest arrangement: three separate things that come back
      // after being answered, over a front rank whose own damage decays. The party can win this by
      // killing three bodies in a particular order and by no other route.
      id: 'c11-s29',
      name: 'Nothing Stays Off',
      enemies: {
        front: [STANDFAST_LANCER, KINGSWAY_LANCER],
        back: [RESERVE_ENSIGN, STORMCALLER, LONGBOUGH_MARKSMAN],
      },
      level: 214,
    },
    {
      id: 'c11-s30',
      name: 'The Colours Reformed',
      enemies: {
        front: [THE_COLOUR_SERJEANT, STANDFAST_LANCER],
        back: [RESERVE_ENSIGN, STORMCALLER, ORDER_SERJEANT],
      },
      level: 215,
    },

    // -----------------------------------------------------------------------------------
    // The countersign — stages 31 to 40, levels 215 to 220
    //
    // The lock: the board answers the party's own setup turn. ⚠️ **Not a probe sample**, so this
    // opener may be the light one; the stride reads s33 and s37.
    //
    // ⚠️ The band's returning half is {@link GRAVEMOURN_KEEPER}, whose {@link THE_BARROW_FORGETS} is
    // the game's only other turn conditioned on the party having acted — and it *undoes* the setup
    // where the Captain *bills* for it. The two together are the band's whole argument.
    // -----------------------------------------------------------------------------------
    {
      id: 'c11-s31',
      name: 'The Countersign',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, MUSTER_PIKE],
        back: [GRAVEMOURN_KEEPER, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 215,
    },
    {
      id: 'c11-s32',
      name: 'Given and Answered',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, VANWARD_SPEAR],
        back: [RESERVE_ENSIGN, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
      level: 216,
    },
    {
      // ⚠️ A probe sample. Both answers to a setup turn on one board — one that removes it and one
      // that charges for it — so a party whose opening is a shred pays twice for it and a party
      // whose opening is damage pays nothing. Neither is wrong; the board only insists the party
      // has decided which it is.
      id: 'c11-s33',
      name: 'The Turn You Spent',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, STANDFAST_LANCER],
        back: [GRAVEMOURN_KEEPER, ORDER_SERJEANT, LONGBOUGH_MARKSMAN],
      },
      level: 216,
    },
    {
      id: 'c11-s34',
      name: 'The Undone Setup',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, MUSTER_PIKE],
        back: [GRAVEMOURN_KEEPER, WHISPERLEAF_ARCHER, SIGNAL_RUNNER],
      },
      level: 217,
    },
    {
      id: 'c11-s35',
      name: 'Watchword',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, KINGSWAY_LANCER],
        back: [RESERVE_ENSIGN, ROADWATCH_BOWMAN, GRAVEWAKE_THRALL],
      },
      level: 217,
    },
    {
      id: 'c11-s36',
      name: 'The Grave Watch',
      enemies: {
        front: [CAIRNWARD_HUSK, COUNTERSIGN_CAPTAIN],
        back: [GRAVEMOURN_KEEPER, GRAVEWAKE_THRALL, WHISPERLEAF_ARCHER],
      },
      level: 218,
    },
    {
      // ⚠️ A probe sample, and the band closing: the Captain, the Keeper and both of the chapter's
      // support blocks, so every turn the party spends on anything other than damage is answered by
      // one of three different bodies.
      id: 'c11-s37',
      name: 'Answered in Turn',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, STANDFAST_LANCER],
        back: [GRAVEMOURN_KEEPER, RESERVE_ENSIGN, ORDER_SERJEANT],
      },
      level: 218,
    },
    {
      id: 'c11-s38',
      name: 'The Wrong Thing First',
      enemies: {
        front: [OATHBREAKER, COUNTERSIGN_CAPTAIN],
        back: [RESERVE_ENSIGN, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 219,
    },
    {
      id: 'c11-s39',
      name: 'No Sign Given',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, VANWARD_SPEAR],
        back: [GRAVEMOURN_KEEPER, STORMCALLER, LONGBOUGH_MARKSMAN],
      },
      level: 219,
    },
    {
      id: 'c11-s40',
      name: 'The Colours Answered',
      enemies: {
        front: [THE_COLOUR_SERJEANT, COUNTERSIGN_CAPTAIN],
        back: [GRAVEMOURN_KEEPER, RESERVE_ENSIGN, ORDER_SERJEANT],
      },
      level: 220,
    },

    // -----------------------------------------------------------------------------------
    // The standing line — stages 41 to 50, levels 220 to 225
    //
    // All four locks at once. ⚠️ **A probe sample on the opener again**, so it is authored heavy for
    // the same reason `c11-s21` is.
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ A probe sample and a band opener. The Stalker is the piece the chapter has been missing:
      // {@link HEADSMANS_ARC} aims at whatever the party has left lowest, so the board finishes what
      // the party started on its behalf — and every body it might have finished is one the party
      // chose to leave.
      id: 'c11-s41',
      name: 'The Standing Line',
      enemies: {
        front: [STANDFAST_LANCER, COUNTERSIGN_CAPTAIN],
        back: [ORDER_SERJEANT, RESERVE_ENSIGN, WEALDSHADOW_STALKER],
      },
      level: 220,
    },
    {
      id: 'c11-s42',
      name: 'The Long Watch',
      enemies: {
        front: [OATHBREAKER, GOLEM],
        back: [ORDER_SERJEANT, ROADWATCH_BOWMAN, SIGNAL_RUNNER],
      },
      level: 221,
    },
    {
      id: 'c11-s43',
      name: 'The Ninth Ditch',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, VANWARD_SPEAR],
        back: [RESERVE_ENSIGN, STORMCALLER, LONGBOUGH_MARKSMAN],
      },
      level: 221,
    },
    {
      // The seam looking back: the wild's own bodies standing in the line's ditches, still getting
      // stronger for being chipped. The chapter's answer to `blood-risen` is the chapter's own
      // sentence — finish it or leave it, but decide.
      id: 'c11-s44',
      name: 'Where the Wild Stops',
      enemies: {
        front: [STANDFAST_LANCER, THORNBACK_GRAZER],
        back: [ORDER_SERJEANT, GRAVEMOURN_KEEPER, RENDFANG_JACKAL],
      },
      level: 222,
    },
    {
      // ⚠️ A probe sample. Three supports behind an `ascended` front rank, which is as close as an
      // ordinary board comes to the final: the order is decided before the first turn or not at all.
      id: 'c11-s45',
      name: 'The Order Repeated',
      enemies: {
        front: [OATHBREAKER, COUNTERSIGN_CAPTAIN],
        back: [ORDER_SERJEANT, RESERVE_ENSIGN, STORMCALLER],
      },
      level: 222,
    },
    {
      id: 'c11-s46',
      name: 'The Held Gate',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, VAULTBOUND_GAOLER],
        back: [ORDER_SERJEANT, UNDERVAULT_SAPPER, WHISPERLEAF_ARCHER],
      },
      level: 223,
    },
    {
      id: 'c11-s47',
      name: 'Nothing Was Rescinded',
      enemies: {
        front: [STANDFAST_LANCER, COUNTERSIGN_CAPTAIN],
        back: [RESERVE_ENSIGN, GRAVEMOURN_KEEPER, SIGNAL_RUNNER],
      },
      level: 223,
    },
    {
      id: 'c11-s48',
      name: 'The Last Picket',
      enemies: {
        front: [WARDEN, STANDFAST_LANCER],
        back: [ORDER_SERJEANT, RESERVE_ENSIGN, LONGBOUGH_MARKSMAN],
      },
      level: 224,
    },
    {
      // ⚠️ A probe sample, and the last board before the final: an `ascended` escort, both callers,
      // and a Keeper to take back whatever the party has managed to put on. Nothing new is asked —
      // this is the chapter's own list, in full, one level below the thing that gives the orders.
      id: 'c11-s49',
      name: 'Before the Line',
      enemies: {
        front: [OATHBREAKER, STANDFAST_LANCER],
        back: [ORDER_SERJEANT, RESERVE_ENSIGN, GRAVEMOURN_KEEPER],
      },
      level: 224,
    },
    {
      // The chapter final. ⚠️ **One `ascended` anchor and four legendaries**, which is the shape
      // chapters 9 and 10 both settled on — the lieutenant is deliberately absent, because a second
      // anchor beside a boss is the sharpest non-linear weight step this game can author.
      //
      // Every band on one board: the Serjeant re-arms it, the Lancer's weight lands while the party
      // is whole, the Ensign puts back what comes off, and the Captain answers the setup turn. What
      // The Last Order adds is {@link THE_STANDING_ORDER} — three hostile statuses off **every** body
      // on its side, and the whole line sharpened in the same action, on an eighty-tick cadence. A
      // party that opened on the escort meets the board twice.
      id: 'c11-s50',
      name: 'The Last Order',
      enemies: {
        front: [THE_LAST_ORDER, COUNTERSIGN_CAPTAIN],
        back: [ORDER_SERJEANT, RESERVE_ENSIGN, STANDFAST_LANCER],
      },
      level: 225,
    },
  ],
} as const;
