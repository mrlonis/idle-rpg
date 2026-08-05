import {
  ACOLYTE,
  BOAR,
  COLOSSUS,
  HEADSMAN,
  HIEROPHANT,
  OATHBREAKER,
  PYRE,
  RAVAGER,
  REVENANT,
  SENTINEL,
  SKYSHRIKE,
  STORMCALLER,
  TYRANT,
  UNMADE,
  WRATHBORN,
} from './enemies';

/**
 * Chapter 2 — The Ashfall Reach.
 *
 * Fifty stages, enemy levels 40 to 126. It **opens at the level chapter 1 closed on**, which is
 * the whole of what a chapter boundary is: a name change and a boss behind you, not a step. A
 * player who has just taken the Frozen Gate walks into Ashfall Reach and finds an encounter tuned
 * for exactly the party that took it.
 *
 * ## What it asks that chapter 1 did not
 *
 * The fen's twelve archetypes ask about reach, sustain, armour and volume, and a party answers
 * them with composition. This chapter's twelve ask about things composition cannot fix on its
 * own — a wave aimed at the back rank, penetration that makes armour stop working, an executioner
 * that ignores rank, a wall that debuffs bounce off — and the answer to most of them is
 * investment. That is the division of labour between the two: chapter 1 is where a player learns
 * what a party is for, and chapter 2 is where they find out what it costs.
 *
 * A few fen archetypes appear in the opening stages, at levels four times what the fen fielded
 * them at. That is deliberate rather than filler: it is the clearest possible demonstration that
 * a lock is a question and not a stat block, which is the property milestone 10 bought and the
 * reason a chapter of fifty stages is an afternoon's authoring.
 *
 * ## Where the levels come from
 *
 * Level 40 to 126, climbing about one and a half a stage early and a little over two a stage
 * late. The top is where the old twenty-four stage ladder ended, and it is there for the same
 * reason it was there: a common-tier five at level 90, four rungs up, clears it and loses a
 * member doing so. Nothing in chapters 1 and 2 asks for a pull anybody had to be lucky for.
 */
export const CHAPTER_2 = {
  id: 'chapter-2',
  name: 'The Ashfall Reach',
  stages: [
    // -----------------------------------------------------------------------------------
    // Out of the fen — stages 1 to 10, levels 40 to 55
    // -----------------------------------------------------------------------------------
    {
      // The back-rank lock. Fifty stages have rewarded putting the fragile things behind two
      // bodies; two Sky-Shrikes diving the whole back row at once is the bill for that.
      id: 'c2-s1',
      name: 'Ashfall Reach',
      enemies: { front: [REVENANT, REVENANT], back: [SKYSHRIKE, SKYSHRIKE] },
      level: 40,
    },
    {
      // A fen board at four times the level it was fielded at, which is the point of it.
      id: 'c2-s2',
      name: 'Emberwake',
      enemies: { front: [REVENANT, BOAR], back: [SKYSHRIKE, PYRE] },
      level: 41,
    },
    {
      // Grind, with a clock on it. Two Cairn Sentinels are the most armour on the ladder so far,
      // and the Stormcaller behind them makes taking a long time about it expensive.
      id: 'c2-s3',
      name: 'The Cairn Line',
      enemies: { front: [SENTINEL, SENTINEL], back: [STORMCALLER, STORMCALLER] },
      level: 43,
    },
    {
      id: 'c2-s4',
      name: 'Cinderpath',
      enemies: { front: [REVENANT, SENTINEL], back: [SKYSHRIKE, STORMCALLER] },
      level: 44,
    },
    {
      // Penetration arrives. A Ravager ignores nearly half of whichever defence the party bought,
      // which is the first time on the ladder that buying more of a defensive stat is not an
      // answer.
      id: 'c2-s5',
      name: 'Flensing Grounds',
      enemies: { front: [RAVAGER, REVENANT], back: [SKYSHRIKE, STORMCALLER] },
      level: 46,
    },
    {
      id: 'c2-s6',
      name: 'The Scoured Rise',
      enemies: { front: [RAVAGER, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 47,
    },
    {
      id: 'c2-s7',
      name: 'Emberwatch',
      enemies: { front: [SENTINEL, REVENANT], back: [ACOLYTE, STORMCALLER] },
      level: 49,
    },
    {
      // The escalation lock. Chipping the Wrathborn down is what turns it on, so the fight the
      // party has been winning gets harder at exactly the moment it looks won.
      id: 'c2-s8',
      name: 'The Kindled Span',
      enemies: { front: [WRATHBORN, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 50,
    },
    {
      id: 'c2-s9',
      name: 'Ashen Ford',
      enemies: { front: [WRATHBORN, REVENANT], back: [SKYSHRIKE, SKYSHRIKE, STORMCALLER] },
      level: 52,
    },
    {
      // Mini-boss. Penetration twice over, with the escalation behind it, and the first stage
      // where the party's HP pool rather than its armour is what keeps it alive.
      id: 'c2-s10',
      name: 'Ravager’s Deep',
      enemies: { front: [RAVAGER, RAVAGER], back: [WRATHBORN, STORMCALLER, SKYSHRIKE] },
      level: 55,
    },

    // -----------------------------------------------------------------------------------
    // The choir — stages 11 to 20, levels 56 to 71
    // -----------------------------------------------------------------------------------
    {
      id: 'c2-s11',
      name: 'Cairnwatch',
      enemies: { front: [SENTINEL, SENTINEL], back: [SKYSHRIKE, STORMCALLER, REVENANT] },
      level: 56,
    },
    {
      id: 'c2-s12',
      name: 'The Long Burn',
      enemies: { front: [WRATHBORN, RAVAGER], back: [STORMCALLER, SKYSHRIKE] },
      level: 57,
    },
    {
      id: 'c2-s13',
      name: 'Hollow Ash',
      enemies: { front: [SENTINEL, REVENANT], back: [HIEROPHANT, SKYSHRIKE] },
      level: 59,
    },
    {
      // A healer and a shielder in one body, standing behind a wall. Chip damage loses to the
      // barrier and burst loses to the heal, so the only answer left is the one the back rank was
      // built around: reach past the front and kill it.
      id: 'c2-s14',
      name: 'The Hollow Choir',
      enemies: { front: [SENTINEL, REVENANT], back: [HIEROPHANT, SKYSHRIKE, STORMCALLER] },
      level: 60,
    },
    {
      id: 'c2-s15',
      name: 'Pyreholm',
      enemies: { front: [RAVAGER, WRATHBORN], back: [HIEROPHANT, STORMCALLER] },
      level: 62,
    },
    {
      id: 'c2-s16',
      name: 'The Grey March',
      enemies: { front: [SENTINEL, RAVAGER], back: [SKYSHRIKE, SKYSHRIKE, HIEROPHANT] },
      level: 63,
    },
    {
      id: 'c2-s17',
      name: 'Emberfall',
      enemies: { front: [WRATHBORN, WRATHBORN], back: [STORMCALLER, SKYSHRIKE] },
      level: 65,
    },
    {
      id: 'c2-s18',
      name: 'The Cinder Line',
      enemies: { front: [SENTINEL, SENTINEL], back: [HIEROPHANT, STORMCALLER, SKYSHRIKE] },
      level: 66,
    },
    {
      id: 'c2-s19',
      name: 'Ashmoor',
      enemies: { front: [RAVAGER, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 68,
    },
    {
      // Mini-boss. The execution lock: a Headsman ignores rank and goes for whoever is closest to
      // dying, which is a demand for sustain aimed somewhere other than the front rank.
      id: 'c2-s20',
      name: 'Gallowmoor',
      enemies: { front: [OATHBREAKER, REVENANT], back: [HEADSMAN, HIEROPHANT] },
      level: 71,
    },

    // -----------------------------------------------------------------------------------
    // The adamant road — stages 21 to 30, levels 72 to 88
    // -----------------------------------------------------------------------------------
    {
      id: 'c2-s21',
      name: 'The Gallow Road',
      enemies: { front: [OATHBREAKER, SENTINEL], back: [HEADSMAN, SKYSHRIKE] },
      level: 72,
    },
    {
      id: 'c2-s22',
      name: 'Ironwake',
      enemies: { front: [COLOSSUS, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 74,
    },
    {
      // The tenacity lock. Sunder, Weaken and Slow have answered every large thing below this,
      // and against a Colossus almost none of them land. What is left is raw damage and
      // penetration.
      id: 'c2-s23',
      name: 'The Adamant Gate',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, STORMCALLER] },
      level: 75,
    },
    {
      id: 'c2-s24',
      name: 'Hangman’s Reach',
      enemies: { front: [OATHBREAKER, RAVAGER], back: [HEADSMAN, HIEROPHANT] },
      level: 77,
    },
    {
      id: 'c2-s25',
      name: 'The Slag Fields',
      enemies: { front: [COLOSSUS, WRATHBORN], back: [STORMCALLER, SKYSHRIKE, HEADSMAN] },
      level: 78,
    },
    {
      // The wall-breaker. A Tyrant attacks the party's largest HP pool rather than through the
      // front rank, so the wall is the first thing to die and a second body does not help.
      id: 'c2-s26',
      name: 'Boneash',
      enemies: { front: [TYRANT, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 80,
    },
    {
      id: 'c2-s27',
      name: 'The Cold Forge',
      enemies: { front: [COLOSSUS, SENTINEL], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 81,
    },
    {
      id: 'c2-s28',
      name: 'Bonefall',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HEADSMAN, STORMCALLER] },
      level: 83,
    },
    {
      id: 'c2-s29',
      name: 'The Riven Span',
      enemies: { front: [TYRANT, RAVAGER], back: [SKYSHRIKE, HIEROPHANT, STORMCALLER] },
      level: 84,
    },
    {
      // Mini-boss. Five bodies and three locks: a wall nothing sticks to, an executioner behind
      // it, and the heal-plus-barrier undoing whatever the party does not finish.
      id: 'c2-s30',
      name: 'The Broken Oath',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HEADSMAN, HIEROPHANT, STORMCALLER] },
      level: 88,
    },

    // -----------------------------------------------------------------------------------
    // Tyrants — stages 31 to 40, levels 89 to 106
    // -----------------------------------------------------------------------------------
    {
      id: 'c2-s31',
      name: 'Emberthrone',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, SKYSHRIKE, HEADSMAN] },
      level: 89,
    },
    {
      id: 'c2-s32',
      name: 'The Ashen Choir',
      enemies: { front: [SENTINEL, COLOSSUS], back: [HIEROPHANT, STORMCALLER, SKYSHRIKE] },
      level: 91,
    },
    {
      // Two Headsmen. Nothing in the party's back rank is out of reach, and the one closest to
      // dying is the one that dies.
      id: 'c2-s33',
      name: 'Gallowfall',
      enemies: { front: [OATHBREAKER, TYRANT], back: [HEADSMAN, HEADSMAN] },
      level: 92,
    },
    {
      id: 'c2-s34',
      name: 'The Last Cairn',
      enemies: { front: [COLOSSUS, COLOSSUS], back: [STORMCALLER, HIEROPHANT] },
      level: 94,
    },
    {
      // The wall-breaker and the wall, together. Whatever the party puts in front dies to the
      // Tyrant and whatever it puts behind dies to the Headsman.
      id: 'c2-s35',
      name: 'Tyrant’s Rest',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, OATHBREAKER, HEADSMAN] },
      level: 95,
    },
    {
      id: 'c2-s36',
      name: 'The Scorched Vigil',
      enemies: { front: [OATHBREAKER, WRATHBORN], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 97,
    },
    {
      id: 'c2-s37',
      name: 'Ruinfall',
      enemies: { front: [TYRANT, RAVAGER], back: [HEADSMAN, STORMCALLER, HIEROPHANT] },
      level: 99,
    },
    {
      id: 'c2-s38',
      name: 'The Iron Choir',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, SKYSHRIKE] },
      level: 100,
    },
    {
      id: 'c2-s39',
      name: 'Emberwatch Keep',
      enemies: { front: [TYRANT, COLOSSUS], back: [STORMCALLER, HEADSMAN] },
      level: 102,
    },
    {
      // Mini-boss. The first sight of the thing the chapter is named for, standing behind a wall
      // that keeps it alive while it works.
      id: 'c2-s40',
      name: 'The Unmaking',
      enemies: { front: [UNMADE, SENTINEL], back: [HIEROPHANT, STORMCALLER] },
      level: 106,
    },

    // -----------------------------------------------------------------------------------
    // The run-in — stages 41 to 50, levels 107 to 126
    // -----------------------------------------------------------------------------------
    {
      id: 'c2-s41',
      name: 'Ashen Reach',
      enemies: { front: [UNMADE, REVENANT], back: [HEADSMAN, SKYSHRIKE] },
      level: 107,
    },
    {
      id: 'c2-s42',
      name: 'The Cinder Throne',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 109,
    },
    {
      id: 'c2-s43',
      name: 'Blackcairn',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, HIEROPHANT] },
      level: 110,
    },
    {
      id: 'c2-s44',
      name: 'The Sundered Oath',
      enemies: { front: [OATHBREAKER, UNMADE], back: [STORMCALLER, SKYSHRIKE, HEADSMAN] },
      level: 112,
    },
    {
      id: 'c2-s45',
      name: 'Pyre of Kings',
      enemies: { front: [UNMADE, COLOSSUS], back: [HIEROPHANT, STORMCALLER] },
      level: 114,
    },
    {
      id: 'c2-s46',
      name: 'The Hollow Crown',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 115,
    },
    {
      id: 'c2-s47',
      name: 'Ashfall Keep',
      enemies: { front: [UNMADE, TYRANT], back: [STORMCALLER, HEADSMAN] },
      level: 117,
    },
    {
      id: 'c2-s48',
      name: 'The Last Gate',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 119,
    },
    {
      id: 'c2-s49',
      name: 'Ruin’s Edge',
      enemies: { front: [UNMADE, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 121,
    },
    {
      // ⚠️ The chapter boss, and the top of everything shipped. It takes the biggest thing the
      // party brought, burns the whole party, half-ignores both defences and shrugs off half of
      // what is aimed back — winnable, expensively, by a party that arrived with sustain, reach
      // and penetration, and by nothing that brought only one of them.
      id: 'c2-s50',
      name: 'The Unmade',
      enemies: { front: [UNMADE, TYRANT], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 126,
    },
  ],
} as const;
