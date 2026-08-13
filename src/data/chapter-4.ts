import {
  ASHFALL_SOVEREIGN,
  COLOSSUS,
  HEADSMAN,
  HIEROPHANT,
  OATHBREAKER,
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
 * Chapter 4 — The Ashfall Reach.
 *
 * Forty stages, enemy levels 30 to 50. It **opens at the level chapter 3 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step. The
 * First Cinder taught the Reach's opening locks on the way out of the mire; this chapter is where
 * they stop being lessons and start being the terrain.
 *
 * ## What it asks that the chapters below it did not
 *
 * The fen's questions are answered with composition. This chapter's are the things composition
 * cannot fix on its own — a healer-and-shielder in one body, an executioner that ignores rank, a
 * wall that debuffs bounce off, a wall-breaker that attacks the party's biggest pool directly —
 * and the answer to most of them is **investment**. That is the division of labour across the
 * ladder: the fen is where a player learns what a party is for, and the Reach is where they find
 * out what it costs.
 *
 * ## Where the levels come from
 *
 * 30 to 85, climbing about a level and a half a stage. The top is where the old twenty-four
 * stage ladder ended, and it is there for the same reason it was there: a common-tier five at
 * level 90, four rungs up, clears it and loses a member doing so. Nothing in chapters 1 through 4
 * asks for a pull anybody had to be lucky for.
 *
 * ## The final
 *
 * The Ashfall Sovereign, at stage 40, in the slot The Unmade held when this was the whole
 * ladder's last fight. The Unmade still stands in its nine other stages as the Reach's heaviest
 * presence; the Sovereign asks the pair it never did — escalation on the boss itself, execution
 * pointed at the party's weakest — beside the same escort that made the old fight the one
 * everybody remembered.
 */
export const CHAPTER_4 = {
  id: 'chapter-4',
  name: 'The Ashfall Reach',
  stages: [
    // -----------------------------------------------------------------------------------
    // The choir — stages 1 to 10, levels 30 to 35
    // -----------------------------------------------------------------------------------
    {
      id: 'c4-s1',
      name: 'Cairnwatch',
      enemies: { front: [SENTINEL, SENTINEL], back: [SKYSHRIKE, STORMCALLER, REVENANT] },
      level: 30,
    },
    {
      id: 'c4-s2',
      name: 'The Long Burn',
      enemies: { front: [WRATHBORN, RAVAGER], back: [STORMCALLER, SKYSHRIKE] },
      level: 31,
    },
    {
      id: 'c4-s3',
      name: 'Hollow Ash',
      enemies: { front: [SENTINEL, REVENANT], back: [HIEROPHANT, SKYSHRIKE] },
      level: 31,
    },
    {
      // A healer and a shielder in one body, standing behind a wall. Chip damage loses to the
      // barrier and burst loses to the heal, so the only answer left is the one the back rank was
      // built around: reach past the front and kill it.
      id: 'c4-s4',
      name: 'The Hollow Choir',
      enemies: { front: [SENTINEL, REVENANT], back: [HIEROPHANT, SKYSHRIKE, STORMCALLER] },
      level: 32,
    },
    {
      id: 'c4-s5',
      name: 'Pyreholm',
      enemies: { front: [RAVAGER, WRATHBORN], back: [HIEROPHANT, STORMCALLER] },
      level: 32,
    },
    {
      id: 'c4-s6',
      name: 'The Grey March',
      enemies: { front: [SENTINEL, RAVAGER], back: [SKYSHRIKE, SKYSHRIKE, HIEROPHANT] },
      level: 33,
    },
    {
      id: 'c4-s7',
      name: 'Emberfall',
      enemies: { front: [WRATHBORN, WRATHBORN], back: [STORMCALLER, SKYSHRIKE] },
      level: 33,
    },
    {
      id: 'c4-s8',
      name: 'The Cinder Line',
      enemies: { front: [SENTINEL, SENTINEL], back: [HIEROPHANT, STORMCALLER, SKYSHRIKE] },
      level: 34,
    },
    {
      id: 'c4-s9',
      name: 'Ashmoor',
      enemies: { front: [RAVAGER, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 34,
    },
    {
      // Mini-boss. The execution lock: a Headsman ignores rank and goes for whoever is closest to
      // dying, which is a demand for sustain aimed somewhere other than the front rank.
      id: 'c4-s10',
      name: 'Gallowmoor',
      enemies: { front: [OATHBREAKER, REVENANT], back: [HEADSMAN, HIEROPHANT] },
      level: 35,
    },

    // -----------------------------------------------------------------------------------
    // The adamant road — stages 11 to 20, levels 35 to 40
    // -----------------------------------------------------------------------------------
    {
      id: 'c4-s11',
      name: 'The Gallow Road',
      enemies: { front: [OATHBREAKER, SENTINEL], back: [HEADSMAN, SKYSHRIKE] },
      level: 35,
    },
    {
      id: 'c4-s12',
      name: 'Ironwake',
      enemies: { front: [COLOSSUS, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 36,
    },
    {
      // The tenacity lock. Sunder, Weaken and Slow have answered every large thing below this,
      // and against a Colossus almost none of them land. What is left is raw damage and
      // penetration.
      id: 'c4-s13',
      name: 'The Adamant Gate',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, STORMCALLER] },
      level: 36,
    },
    {
      id: 'c4-s14',
      name: 'Hangman’s Reach',
      enemies: { front: [OATHBREAKER, RAVAGER], back: [HEADSMAN, HIEROPHANT] },
      level: 37,
    },
    {
      id: 'c4-s15',
      name: 'The Slag Fields',
      enemies: { front: [COLOSSUS, WRATHBORN], back: [STORMCALLER, SKYSHRIKE, HEADSMAN] },
      level: 37,
    },
    {
      // The wall-breaker. A Tyrant attacks the party's largest HP pool rather than through the
      // front rank, so the wall is the first thing to die and a second body does not help.
      id: 'c4-s16',
      name: 'Boneash',
      enemies: { front: [TYRANT, REVENANT], back: [HEADSMAN, STORMCALLER] },
      level: 38,
    },
    {
      id: 'c4-s17',
      name: 'The Cold Forge',
      enemies: { front: [COLOSSUS, SENTINEL], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 38,
    },
    {
      id: 'c4-s18',
      name: 'Bonefall',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HEADSMAN, STORMCALLER] },
      level: 39,
    },
    {
      id: 'c4-s19',
      name: 'The Riven Span',
      enemies: { front: [TYRANT, RAVAGER], back: [SKYSHRIKE, HIEROPHANT, STORMCALLER] },
      level: 39,
    },
    {
      // Mini-boss. Five bodies and three locks: a wall nothing sticks to, an executioner behind
      // it, and the heal-plus-barrier undoing whatever the party does not finish.
      id: 'c4-s20',
      name: 'The Broken Oath',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HEADSMAN, HIEROPHANT, STORMCALLER] },
      level: 40,
    },

    // -----------------------------------------------------------------------------------
    // Tyrants — stages 21 to 30, levels 40 to 45
    // -----------------------------------------------------------------------------------
    {
      id: 'c4-s21',
      name: 'Emberthrone',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, SKYSHRIKE, HEADSMAN] },
      level: 40,
    },
    {
      id: 'c4-s22',
      name: 'The Ashen Choir',
      enemies: { front: [SENTINEL, COLOSSUS], back: [HIEROPHANT, STORMCALLER, SKYSHRIKE] },
      level: 41,
    },
    {
      // Two Headsmen. Nothing in the party's back rank is out of reach, and the one closest to
      // dying is the one that dies.
      id: 'c4-s23',
      name: 'Gallowfall',
      enemies: { front: [OATHBREAKER, TYRANT], back: [HEADSMAN, HEADSMAN] },
      level: 41,
    },
    {
      id: 'c4-s24',
      name: 'The Last Cairn',
      enemies: { front: [COLOSSUS, COLOSSUS], back: [STORMCALLER, HIEROPHANT] },
      level: 42,
    },
    {
      // The wall-breaker and the wall, together. Whatever the party puts in front dies to the
      // Tyrant and whatever it puts behind dies to the Headsman.
      id: 'c4-s25',
      name: 'Tyrant’s Rest',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, OATHBREAKER, HEADSMAN] },
      level: 42,
    },
    {
      id: 'c4-s26',
      name: 'The Scorched Vigil',
      enemies: { front: [OATHBREAKER, WRATHBORN], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 43,
    },
    {
      id: 'c4-s27',
      name: 'Ruinfall',
      enemies: { front: [TYRANT, RAVAGER], back: [HEADSMAN, STORMCALLER, HIEROPHANT] },
      level: 43,
    },
    {
      id: 'c4-s28',
      name: 'The Iron Choir',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, SKYSHRIKE] },
      level: 44,
    },
    {
      id: 'c4-s29',
      name: 'Emberwatch Keep',
      enemies: { front: [TYRANT, COLOSSUS], back: [STORMCALLER, HEADSMAN] },
      level: 44,
    },
    {
      // Mini-boss. The first sight of The Unmade — the ceiling every ascended block in the game
      // is sized under — standing behind a wall that keeps it alive while it works.
      id: 'c4-s30',
      name: 'The Unmaking',
      enemies: { front: [UNMADE, SENTINEL], back: [HIEROPHANT, STORMCALLER] },
      level: 45,
    },

    // -----------------------------------------------------------------------------------
    // The run-in — stages 31 to 40, levels 45 to 50
    // -----------------------------------------------------------------------------------
    {
      id: 'c4-s31',
      name: 'Ashen Reach',
      enemies: { front: [UNMADE, REVENANT], back: [HEADSMAN, SKYSHRIKE] },
      level: 45,
    },
    {
      id: 'c4-s32',
      name: 'The Cinder Throne',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 46,
    },
    {
      id: 'c4-s33',
      name: 'Blackcairn',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, HIEROPHANT] },
      level: 46,
    },
    {
      id: 'c4-s34',
      name: 'The Sundered Oath',
      enemies: { front: [OATHBREAKER, UNMADE], back: [STORMCALLER, SKYSHRIKE, HEADSMAN] },
      level: 47,
    },
    {
      id: 'c4-s35',
      name: 'Pyre of Kings',
      enemies: { front: [UNMADE, COLOSSUS], back: [HIEROPHANT, STORMCALLER] },
      level: 47,
    },
    {
      id: 'c4-s36',
      name: 'The Hollow Crown',
      enemies: { front: [TYRANT, OATHBREAKER], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 48,
    },
    {
      id: 'c4-s37',
      name: 'Ashfall Keep',
      enemies: { front: [UNMADE, TYRANT], back: [STORMCALLER, HEADSMAN] },
      level: 48,
    },
    {
      id: 'c4-s38',
      name: 'The Last Gate',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 49,
    },
    {
      id: 'c4-s39',
      name: 'Ruin’s Edge',
      enemies: { front: [UNMADE, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SKYSHRIKE] },
      level: 49,
    },
    {
      // ⚠️ The chapter boss, in the slot The Unmade held when this was the whole ladder's last
      // fight. The Sovereign is the escalation lock at boss scale — chipping it down is what
      // turns it on — and what it spends the window on is the party's weakest, beside a Headsman
      // that is already doing the same. Two executioners, a wall-breaker in front, and the
      // heal-plus-barrier behind: winnable by a party whose sustain goes wide and whose burst
      // arrives inside the window, and by nothing that brought only one of them.
      id: 'c4-s40',
      name: 'The Ashfall Sovereign',
      enemies: { front: [ASHFALL_SOVEREIGN, TYRANT], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
      level: 50,
    },
  ],
} as const;
