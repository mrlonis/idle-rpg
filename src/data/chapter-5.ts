import {
  ASHEN_CHOIR,
  BARROW_SOVEREIGN,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  CHAINSWORN,
  COLOSSUS,
  CONCORD_CANTOR,
  DEEPROCK_MINER,
  EMBERSEED_WARLOCK,
  FREE_BLADE,
  GLADE_STALKER,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  MARCHWARD_PIKEMAN,
  MOONSONG_WEAVER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  RADIANT_HERALD,
  RAVAGER,
  REVENANT,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SKYSHRIKE,
  STORMCALLER,
  THORNWEALD_WARDEN,
  TYRANT,
  UNMADE,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * Chapter 5 — The Bound Marches.
 *
 * Fifty stages, enemy levels 50 to 75. It **opens at the level chapter 4 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Ashfall Reach did not
 *
 * The fen asked about reach, sustain, armour and volume; the Reach asked about things composition
 * cannot fix and answered most of them with investment. This chapter asks a question neither of
 * them could put: **not how much damage a party has, but where it is allowed to go.**
 *
 * Three of the four mechanics milestone 17 added are about the *routing* of a hit rather than its
 * size — a taunt that overrides the row gate, a link that spreads a blow across a board, thorns
 * that charge for the swing itself — and the fourth puts a clock inside the fight. A party that
 * arrives here with a bigger number finds that the number is not the thing being tested.
 *
 * | Band      | Stages | The lock it teaches                                    |
 * | --------- | ------ | ------------------------------------------------------ |
 * | The march | 1–10   | a taunt: you no longer choose what to hit              |
 * | Thorns    | 11–20  | the swing costs; many small hits cost the most        |
 * | The Concord | 21–30 | a link: nothing can be removed on its own            |
 * | The fuse  | 31–40  | a payload with a timer; when to spend the cleanse      |
 * | The road  | 41–50  | all four at once, and the thing they were bound for    |
 *
 * ## Where the levels come from, and the one thing this chapter does that neither below it does
 *
 * 85 to 160, about a level and a half a stage. ⚠️ **The top is deliberately past the level cap of
 * the rung the chapter asks for**, and that is the whole difficulty statement: `elite-plus` caps at
 * 140, so a player who buys the ascension and levels it out is still twenty levels short at the
 * Chainsworn and has to make the difference up in composition, matchup and gear.
 *
 * **This was authored at 85 → 130 first and the balance sweep refused it**, in a way worth
 * recording because the arithmetic is not obvious. An ascension rung is worth ×1.6 and the enemy
 * side has **no rungs at all** — `toEnemyCombatant` deliberately never grew that third dial — so a
 * party matching the enemy's level from one rung higher is ×1.6 ahead of it, and every stage in the
 * chapter was a walkover for the party it was meant for. Twenty-three levels is what ×1.6 costs at
 * `perLevel.common`, and that is where the extra thirty at the top came from: **a chapter that asks
 * for a new rung has to out-climb the rung it asks for.** Chapters 1 through 4 never met this
 * because each ran inside a cap the party already had.
 *
 * Still no lucky pull anywhere on the ladder: the rung is twenty-four duplicate copies of each of
 * the five, which is four more than chapter 4 asked for and is bought with time.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes: **eight new, twenty-four returning** — a quarter new, which is what a
 * chapter needs to feel like somewhere else without becoming a parade of stat blocks. Twelve of
 * the returning ones are the Ashfall set the player has just spent fifty stages learning, and
 * **twelve have never appeared in the campaign at all** — they were authored for the faction
 * towers in milestone 15c, so a player who never climbed one meets the Runewarden, the Wyrdroot
 * Ancient and the Barrow Sovereign here for the first time.
 *
 * ⚠️ **The four mini-bosses and the boss field boards that appear nowhere else**, and the boss
 * fields a body that appears nowhere else either — The Chainsworn stands on `c5-s50` and on no
 * other stage in the game. It was the first final authored that way; the six-chapter re-cut made
 * it the rule, and every chapter now ends on a body fielded once: the last encounter of a chapter
 * is the one a player remembers.
 *
 * ⚠️ **Only one board in the chapter puts a healer behind a taunt**, and it is the stage-10
 * mini-boss where the lock is first stated and the party is far ahead of the level. Milestone 15c
 * recorded why: sustain on the enemy side, behind something the party cannot aim past, is a
 * ninety-second clock rather than a hard fight — and a timeout is a defeat.
 */
export const CHAPTER_5 = {
  id: 'chapter-5',
  name: 'The Bound Marches',
  stages: [
    // -----------------------------------------------------------------------------------
    // The march — stages 1 to 10, levels 50 to 55
    // -----------------------------------------------------------------------------------
    {
      // The seam. An Ashfall board at the Ashfall's own closing level, so the first fight of the
      // chapter is one the party that took the Ashfall Sovereign already knows how to have.
      id: 'c5-s1',
      name: 'Marchgate',
      enemies: { front: [OATHBREAKER, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 50,
    },
    {
      // The taunt lock, stated plainly and early. Fifty stages of the Reach have taught the party
      // to shoot past a front rank; this is the first thing that refuses to let it.
      id: 'c5-s2',
      name: 'The First Oath',
      enemies: { front: [OATHSHIELD_VANGUARD, REVENANT], back: [STORMCALLER, SKYSHRIKE] },
      level: 51,
    },
    {
      id: 'c5-s3',
      name: 'Pikewall',
      enemies: { front: [MARCHWARD_PIKEMAN, MARCHWARD_PIKEMAN], back: [SKYSHRIKE, STORMCALLER] },
      level: 51,
    },
    {
      id: 'c5-s4',
      name: 'The Scoutline',
      enemies: {
        front: [MARCHWARD_PIKEMAN, REVENANT],
        back: [BRAMBLEWALK_SCOUT, BRAMBLEWALK_SCOUT, SKYSHRIKE],
      },
      level: 52,
    },
    {
      // A taunt in front of a full back row, which is the first time the lock is asked with
      // something behind it worth reaching.
      id: 'c5-s5',
      name: 'Oathwatch',
      enemies: {
        front: [OATHSHIELD_VANGUARD, SENTINEL],
        back: [STORMCALLER, SKYSHRIKE, BRAMBLEWALK_SCOUT],
      },
      level: 52,
    },
    {
      id: 'c5-s6',
      name: 'The Free Company',
      enemies: { front: [FREE_BLADE, FREE_BLADE], back: [SKYSHRIKE, STORMCALLER] },
      level: 53,
    },
    {
      id: 'c5-s7',
      name: 'Marchward Ford',
      enemies: {
        front: [OATHSHIELD_VANGUARD, FREE_BLADE],
        back: [BRAMBLEWALK_SCOUT, HEADSMAN],
      },
      level: 53,
    },
    {
      id: 'c5-s8',
      name: 'The Long Column',
      enemies: {
        front: [SENTINEL, MARCHWARD_PIKEMAN],
        back: [STORMCALLER, SKYSHRIKE, BRAMBLEWALK_SCOUT],
      },
      level: 54,
    },
    {
      id: 'c5-s9',
      name: 'Broken Standards',
      enemies: { front: [OATHBREAKER, OATHSHIELD_VANGUARD], back: [HEADSMAN, STORMCALLER] },
      level: 54,
    },
    {
      // ⚠️ Mini-boss, and the only board in the chapter with a healer standing behind a taunt.
      // The lock in full: while the Oathshield is up nothing can be aimed at the Hierophant, so
      // the party has to bring a row attack or spend the window the cooldown leaves it. It is here,
      // at the foot of the chapter, because the party fighting it is far above the level — the same
      // encounter forty stages later is a ninety-second clock rather than a question.
      id: 'c5-s10',
      name: 'The Sworn Wall',
      enemies: {
        front: [OATHSHIELD_VANGUARD, SENTINEL],
        back: [HIEROPHANT, STORMCALLER, SKYSHRIKE],
      },
      level: 55,
    },

    // -----------------------------------------------------------------------------------
    // Thorns — stages 11 to 20, levels 55 to 60
    // -----------------------------------------------------------------------------------
    {
      // Every lock below this is answered by doing more of something. This one is answered by
      // doing less of it: a quarter of every blow comes straight back.
      id: 'c5-s11',
      name: 'Bramblehide Run',
      enemies: { front: [BRAMBLEHIDE_RAVENER, REVENANT], back: [SKYSHRIKE, STORMCALLER] },
      level: 55,
    },
    {
      id: 'c5-s12',
      name: 'The Spined Hollow',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, MARCHWARD_PIKEMAN],
        back: [BRAMBLEWALK_SCOUT, HEADSMAN],
      },
      level: 56,
    },
    {
      id: 'c5-s13',
      name: 'Thornfall',
      enemies: { front: [BRAMBLEHIDE_RAVENER, RAVAGER], back: [STORMCALLER, SKYSHRIKE] },
      level: 56,
    },
    {
      // The first tower block a campaign player meets: a regeneration that outlives whatever cast
      // it, so the answer moves from reaching a healer to out-damaging a tick.
      id: 'c5-s14',
      name: 'The Quiet Grove',
      enemies: {
        front: [SENTINEL, BRAMBLEHIDE_RAVENER],
        back: [THORNWEALD_WARDEN, GLADE_STALKER],
      },
      level: 57,
    },
    {
      id: 'c5-s15',
      name: 'Glade of Spears',
      enemies: {
        front: [MARCHWARD_PIKEMAN, FREE_BLADE],
        back: [GLADE_STALKER, GLADE_STALKER, THORNWEALD_WARDEN],
      },
      level: 57,
    },
    {
      id: 'c5-s16',
      name: 'Wildingfall',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, WRATHBORN],
        back: [THORNWEALD_WARDEN, STORMCALLER],
      },
      level: 58,
    },
    {
      // The two halves of the chapter's opening lock, on two bodies. Aim at the Vanguard and the
      // Ravener is untouched; aim anywhere and the Vanguard takes it instead.
      id: 'c5-s17',
      name: 'The Bitter Hedge',
      enemies: {
        front: [OATHSHIELD_VANGUARD, BRAMBLEHIDE_RAVENER],
        back: [BRAMBLEWALK_SCOUT, SKYSHRIKE],
      },
      level: 58,
    },
    {
      id: 'c5-s18',
      name: 'Moonsong Hollow',
      enemies: {
        front: [SENTINEL, REVENANT],
        back: [MOONSONG_WEAVER, GLADE_STALKER, SKYSHRIKE],
      },
      level: 59,
    },
    {
      // The cleanse pointed back at the party: a Runewarden takes the Sunder off the wall it is
      // standing behind, which is the setup every party has used since milestone 4.
      id: 'c5-s19',
      name: 'The Warded Path',
      enemies: { front: [COLOSSUS, MARCHWARD_PIKEMAN], back: [RUNEWARDEN, STORMCALLER] },
      level: 59,
    },
    {
      // Mini-boss. Two thorned bodies with a regeneration behind them, which is the same sentence
      // said twice: chip damage pays the thorns over and over and loses the race to the tick.
      id: 'c5-s20',
      name: 'Bramblehide Deep',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, BRAMBLEHIDE_RAVENER],
        back: [THORNWEALD_WARDEN, MOONSONG_WEAVER, GLADE_STALKER],
      },
      level: 60,
    },

    // -----------------------------------------------------------------------------------
    // The Concord — stages 21 to 30, levels 60 to 65
    // -----------------------------------------------------------------------------------
    {
      // The link arrives. Two fifths of every hit is spread across whatever else is standing, so
      // the party's usual opening — remove the support, then the wall — stops resolving.
      id: 'c5-s21',
      name: 'The Concord Road',
      enemies: {
        front: [SENTINEL, FREE_BLADE],
        back: [CONCORD_CANTOR, SKYSHRIKE, STORMCALLER],
      },
      level: 60,
    },
    {
      id: 'c5-s22',
      name: 'Bound in Chorus',
      enemies: { front: [SENTINEL, MARCHWARD_PIKEMAN], back: [CONCORD_CANTOR, STORMCALLER] },
      level: 61,
    },
    {
      // A link and a board-wide absorb together: focus fire fails twice over, once because the
      // damage is spread and once because each share meets its own shield.
      id: 'c5-s23',
      name: 'Choirlight',
      enemies: {
        front: [OATHSHIELD_VANGUARD, DEEPROCK_MINER],
        back: [CONCORD_CANTOR, ASHEN_CHOIR],
      },
      level: 61,
    },
    {
      id: 'c5-s24',
      name: 'The Adamant Concord',
      enemies: { front: [COLOSSUS, MARCHWARD_PIKEMAN], back: [CONCORD_CANTOR, RADIANT_HERALD] },
      level: 62,
    },
    {
      id: 'c5-s25',
      name: 'Heraldsong',
      enemies: {
        front: [SENTINEL, FREE_BLADE],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
      level: 62,
    },
    {
      id: 'c5-s26',
      name: 'The Deeprock Line',
      enemies: { front: [DEEPROCK_MINER, DEEPROCK_MINER], back: [RUNEWARDEN, STORMCALLER] },
      level: 63,
    },
    {
      id: 'c5-s27',
      name: 'Chained Vigil',
      enemies: {
        front: [OATHSHIELD_VANGUARD, BRAMBLEHIDE_RAVENER],
        back: [CONCORD_CANTOR, RADIANT_HERALD],
      },
      level: 63,
    },
    {
      id: 'c5-s28',
      name: 'The Seraph’s Reach',
      enemies: {
        front: [COLOSSUS, SENTINEL],
        back: [SERAPH_ADJUDICANT, ASHEN_CHOIR, RADIANT_HERALD],
      },
      level: 64,
    },
    {
      id: 'c5-s29',
      name: 'Barrowmarch',
      enemies: { front: [BARROW_SOVEREIGN, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 64,
    },
    {
      // Mini-boss, and the Riven Marchwarden's first appearance: a wall the party must hit and
      // cannot afford to. The Concord behind it means killing it is not a matter of aiming, either.
      id: 'c5-s30',
      name: 'The Bound Concord',
      enemies: {
        front: [RIVEN_MARCHWARDEN, COLOSSUS],
        back: [CONCORD_CANTOR, ASHEN_CHOIR, SERAPH_ADJUDICANT],
      },
      level: 65,
    },

    // -----------------------------------------------------------------------------------
    // The fuse — stages 31 to 40, levels 65 to 70
    // -----------------------------------------------------------------------------------
    {
      // A payload on the back rank with forty ticks on it. Nothing on the ladder has ever asked
      // the party *when* to spend an answer rather than whether it owns one.
      id: 'c5-s31',
      name: 'Emberseed',
      enemies: { front: [MARCHWARD_PIKEMAN, REVENANT], back: [EMBERSEED_WARLOCK, SKYSHRIKE] },
      level: 65,
    },
    {
      id: 'c5-s32',
      name: 'The Sowing',
      enemies: {
        front: [OATHSHIELD_VANGUARD, FREE_BLADE],
        back: [EMBERSEED_WARLOCK, STORMCALLER],
      },
      level: 66,
    },
    {
      // Two hostile statuses and a fuse, against a cleanse that removes a fixed count. The party
      // has the answer and cannot spend it everywhere, which is the whole of the encounter.
      id: 'c5-s33',
      name: 'Hexbound March',
      enemies: {
        front: [WRATHBORN, RIVEN_MARCHWARDEN],
        back: [HEXBOUND_TORMENTOR, EMBERSEED_WARLOCK, SKYSHRIKE],
      },
      level: 66,
    },
    {
      id: 'c5-s34',
      name: 'The Slow Fuse',
      enemies: {
        front: [RIVEN_MARCHWARDEN, REVENANT],
        back: [EMBERSEED_WARLOCK, BRAMBLEWALK_SCOUT],
      },
      level: 67,
    },
    {
      id: 'c5-s35',
      name: 'Cinderwatch',
      enemies: {
        front: [TYRANT, MARCHWARD_PIKEMAN],
        back: [EMBERSEED_WARLOCK, HIEROPHANT, SKYSHRIKE],
      },
      level: 67,
    },
    {
      id: 'c5-s36',
      name: 'The Wyrdroot',
      enemies: { front: [WYRDROOT_ANCIENT, SENTINEL], back: [THORNWEALD_WARDEN, GLADE_STALKER] },
      level: 68,
    },
    {
      id: 'c5-s37',
      name: 'Doomed Ground',
      enemies: {
        front: [WYRDROOT_ANCIENT, RIVEN_MARCHWARDEN],
        back: [EMBERSEED_WARLOCK, HEXBOUND_TORMENTOR],
      },
      level: 68,
    },
    {
      id: 'c5-s38',
      name: 'The Long March',
      enemies: {
        front: [COLOSSUS, OATHSHIELD_VANGUARD],
        back: [CONCORD_CANTOR, STORMCALLER, SKYSHRIKE],
      },
      level: 69,
    },
    {
      id: 'c5-s39',
      name: 'Ashen Chorus',
      enemies: {
        front: [OATHBREAKER, BRAMBLEHIDE_RAVENER],
        back: [ASHEN_CHOIR, EMBERSEED_WARLOCK, RADIANT_HERALD],
      },
      level: 69,
    },
    {
      // Mini-boss. The chapter's four questions on one board with nothing to heal any of it —
      // a wall that must be hit and hurts to hit, a fuse, two statuses, and a slow on all five.
      id: 'c5-s40',
      name: 'The Riven Gate',
      enemies: {
        front: [RIVEN_MARCHWARDEN, COLOSSUS],
        back: [EMBERSEED_WARLOCK, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
      level: 70,
    },

    // -----------------------------------------------------------------------------------
    // The road — stages 41 to 50, levels 70 to 75
    // -----------------------------------------------------------------------------------
    {
      id: 'c5-s41',
      name: 'The Chain Road',
      enemies: { front: [RIVEN_MARCHWARDEN, TYRANT], back: [CONCORD_CANTOR, HEADSMAN] },
      level: 70,
    },
    {
      id: 'c5-s42',
      name: 'Sovereign’s March',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHSHIELD_VANGUARD],
        back: [EMBERSEED_WARLOCK, STORMCALLER],
      },
      level: 71,
    },
    {
      id: 'c5-s43',
      name: 'The Unmade Road',
      enemies: { front: [UNMADE, MARCHWARD_PIKEMAN], back: [CONCORD_CANTOR, SKYSHRIKE] },
      level: 71,
    },
    {
      id: 'c5-s44',
      name: 'Wyrdroot Deep',
      enemies: {
        front: [WYRDROOT_ANCIENT, BRAMBLEHIDE_RAVENER],
        back: [THORNWEALD_WARDEN, MOONSONG_WEAVER, GLADE_STALKER],
      },
      level: 72,
    },
    {
      id: 'c5-s45',
      name: 'The Last Concord',
      enemies: {
        front: [COLOSSUS, RIVEN_MARCHWARDEN],
        back: [CONCORD_CANTOR, ASHEN_CHOIR, MARCHWARD_PIKEMAN],
      },
      level: 72,
    },
    {
      id: 'c5-s46',
      name: 'The Tolling',
      enemies: {
        front: [TYRANT, OATHSHIELD_VANGUARD],
        back: [EMBERSEED_WARLOCK, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
      level: 73,
    },
    {
      id: 'c5-s47',
      name: 'Barrow Gate',
      enemies: { front: [BARROW_SOVEREIGN, COLOSSUS], back: [HIEROPHANT, HEADSMAN] },
      level: 73,
    },
    {
      id: 'c5-s48',
      name: 'The Sworn Road',
      enemies: {
        front: [UNMADE, RIVEN_MARCHWARDEN],
        back: [CONCORD_CANTOR, EMBERSEED_WARLOCK, STORMCALLER],
      },
      level: 74,
    },
    {
      id: 'c5-s49',
      name: 'Chainfall',
      enemies: {
        front: [OATHBREAKER, BARROW_SOVEREIGN],
        back: [CONCORD_CANTOR, HIEROPHANT, SERAPH_ADJUDICANT],
      },
      level: 74,
    },
    {
      // ⚠️ The chapter boss, and the only board in the game fielding a block that stands nowhere
      // else. Three of the chapter's four mechanics come off the Chainsworn itself — its board is
      // bound, it is thorned, and the Doomknell brands all five at once — and the fourth is the
      // Marchwarden in front of it, which is what stops the party choosing to answer the Chainsworn
      // first. Deliberately **no healer**: sustain behind a taunt is a ninety-second clock, and a
      // timeout is a defeat rather than a hard fight.
      id: 'c5-s50',
      name: 'The Chainsworn',
      enemies: {
        front: [CHAINSWORN, RIVEN_MARCHWARDEN],
        back: [CONCORD_CANTOR, EMBERSEED_WARLOCK, SERAPH_ADJUDICANT],
      },
      level: 75,
    },
  ],
} as const;
