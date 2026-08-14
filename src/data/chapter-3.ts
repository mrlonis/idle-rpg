import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  FIRST_CINDER,
  GOLEM,
  HAG,
  PYRE,
  RAVAGER,
  REVENANT,
  RIMEPLATE,
  SENTINEL,
  SHADE,
  SKYSHRIKE,
  STORMCALLER,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * Chapter 3 — The Cinder Mire.
 *
 * Thirty stages, enemy levels 15 to 30, and the ladder's first seam with a landscape in it: the
 * fen's cold tail for twenty stages, and then the ground starts burning. The re-cut put the
 * fen-to-ash transition inside one chapter deliberately — a boundary is a name change and a boss
 * behind you, and *this* chapter is where the world changes, so the change happens mid-chapter
 * where the player can feel it rather than at a seam where it would read as a new game.
 *
 * ## The two halves
 *
 * Stages 1 to 20 are the fen's hardest combinations — every lock chapters 1 and 2 taught, asked
 * two and three at a time, at a level curve that barely moves. Stage 20, The Frozen Gate, was the
 * fen's own final before the re-cut and keeps that board as the mini-boss it now is.
 *
 * Stages 21 to 30 are the first ash: the back-rank lock (a Sky-Shrike dives the whole back row),
 * the armour-with-a-clock pair (Cairn Sentinels in front of Stormcallers), penetration (the
 * Ravager, the first time buying more armour is not an answer) and escalation (the Wrathborn,
 * which chipping is what turns on). A few fen bodies appear among them at the same levels —
 * deliberately, because a lock is a question and not a stat block.
 *
 * ## The final
 *
 * The First Cinder, at stage 30: the penetration lesson wearing a crown, with burn on top, on the
 * board that used to be Ravager's Deep. Levels climb from 16 to 30 across the back half — the
 * chapter where the curve wakes up after the fen's flat band — and the boss closes at exactly the
 * level chapter 4 opens on, which is the boundary rule.
 */
export const CHAPTER_3 = {
  id: 'chapter-3',
  name: 'The Cinder Mire',
  stages: [
    // -----------------------------------------------------------------------------------
    // Cold water — stages 1 to 10, levels 15 to 16
    // -----------------------------------------------------------------------------------
    {
      id: 'c3-s1',
      name: 'Coldmire',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [WISP, PYRE] },
      level: 15,
    },
    {
      id: 'c3-s2',
      name: 'The Sundered Ford',
      enemies: { front: [GOLEM, BOAR], back: [HAG, SHADE, ACOLYTE] },
      level: 15,
    },
    {
      // Three Shades. Accuracy or volume; nothing else touches this.
      id: 'c3-s3',
      name: 'Wraithlight',
      enemies: { front: [BANDIT, BANDIT], back: [SHADE, SHADE, SHADE] },
      level: 15,
    },
    {
      id: 'c3-s4',
      name: 'The Hag’s Table',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [HAG, HAG, PYRE] },
      level: 15,
    },
    {
      id: 'c3-s5',
      name: 'Fen of Bones',
      enemies: { front: [RIMEPLATE, GOLEM], back: [ACOLYTE, PYRE] },
      level: 15,
    },
    {
      id: 'c3-s6',
      name: 'Stillwater Shrine',
      enemies: { front: [BULWARK_ENEMY, BOAR], back: [ACOLYTE, ACOLYTE, WISP] },
      level: 16,
    },
    {
      id: 'c3-s7',
      name: 'The Grey Causeway',
      enemies: { front: [GOLEM, RIMEPLATE], back: [PYRE, SHADE] },
      level: 16,
    },
    {
      id: 'c3-s8',
      name: 'Nightreed',
      enemies: { front: [BOAR, BANDIT], back: [HAG, PYRE, SHADE] },
      level: 16,
    },
    {
      id: 'c3-s9',
      name: 'The Drowned Court',
      enemies: { front: [WARDEN, BOAR], back: [ACOLYTE, HAG] },
      level: 16,
    },
    {
      // Mini-boss. Two Rimeplates: both defences up, twice over, with a burn and a debuff behind
      // them — the stage that says whether a party brought penetration.
      id: 'c3-s10',
      name: 'Rimefall',
      enemies: { front: [RIMEPLATE, RIMEPLATE], back: [PYRE, HAG, WISP] },
      level: 16,
    },

    // -----------------------------------------------------------------------------------
    // The fen's last stand — stages 11 to 20, level 16
    // -----------------------------------------------------------------------------------
    {
      id: 'c3-s11',
      name: 'Ashen Fen',
      enemies: { front: [BULWARK_ENEMY, GOLEM], back: [PYRE, PYRE, ACOLYTE] },
      level: 16,
    },
    {
      id: 'c3-s12',
      name: 'The Quiet Deep',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [SHADE, ACOLYTE] },
      level: 16,
    },
    {
      id: 'c3-s13',
      name: 'Thorn Gate',
      enemies: { front: [WARDEN, BANDIT], back: [SHADE, PYRE] },
      level: 16,
    },
    {
      id: 'c3-s14',
      name: 'The Last Reeds',
      enemies: { front: [BOAR, BOAR], back: [HAG, ACOLYTE, SHADE] },
      level: 16,
    },
    {
      id: 'c3-s15',
      name: 'Grimwater',
      enemies: { front: [GOLEM, RIMEPLATE], back: [PYRE, HAG, ACOLYTE] },
      level: 16,
    },
    {
      id: 'c3-s16',
      name: 'The Broken Vigil',
      enemies: { front: [WARDEN, RIMEPLATE], back: [ACOLYTE, PYRE] },
      level: 16,
    },
    {
      id: 'c3-s17',
      name: 'Deepmire',
      enemies: { front: [RIMEPLATE, GOLEM], back: [HAG, SHADE, ACOLYTE] },
      level: 16,
    },
    {
      id: 'c3-s18',
      name: 'The Cold Shrine',
      enemies: { front: [BULWARK_ENEMY, RIMEPLATE], back: [ACOLYTE, ACOLYTE, PYRE] },
      level: 16,
    },
    {
      id: 'c3-s19',
      name: 'Wardenmarch',
      enemies: { front: [WARDEN, GOLEM], back: [SHADE, HAG, PYRE] },
      level: 16,
    },
    {
      // Mini-boss, and the fen's own final before the re-cut: the Warden's stun and Rimeplate's
      // two defences in front, sustain and a burn behind. It keeps the board it had as a boss —
      // a full five asking every fen question at once is exactly what this slot wants.
      id: 'c3-s20',
      name: 'The Frozen Gate',
      enemies: { front: [WARDEN, RIMEPLATE], back: [ACOLYTE, HAG, PYRE] },
      level: 16,
    },

    // -----------------------------------------------------------------------------------
    // Out of the fen — stages 21 to 30, levels 16 to 30
    // -----------------------------------------------------------------------------------
    {
      // The back-rank lock. Twenty-nine stages have rewarded putting the fragile things behind
      // two bodies; two Sky-Shrikes diving the whole back row at once is the bill for that.
      id: 'c3-s21',
      name: 'Ashfall Reach',
      enemies: { front: [REVENANT, REVENANT], back: [SKYSHRIKE, SKYSHRIKE] },
      level: 16,
    },
    {
      // A fen board with ash in it, which is the point of the seam.
      id: 'c3-s22',
      name: 'Emberwake',
      enemies: { front: [REVENANT, BOAR], back: [SKYSHRIKE, PYRE] },
      level: 17,
    },
    {
      // Grind, with a clock on it. Two Cairn Sentinels are the most armour on the ladder so far,
      // and the Stormcaller behind them makes taking a long time about it expensive.
      id: 'c3-s23',
      name: 'The Cairn Line',
      enemies: { front: [SENTINEL, SENTINEL], back: [STORMCALLER, STORMCALLER] },
      level: 19,
    },
    {
      id: 'c3-s24',
      name: 'Cinderpath',
      enemies: { front: [REVENANT, SENTINEL], back: [SKYSHRIKE, STORMCALLER] },
      level: 20,
    },
    {
      // Penetration arrives. A Ravager ignores nearly half of whichever defence the party bought,
      // which is the first time on the ladder that buying more of a defensive stat is not an
      // answer.
      id: 'c3-s25',
      name: 'Flensing Grounds',
      enemies: { front: [RAVAGER, REVENANT], back: [SKYSHRIKE, STORMCALLER] },
      level: 22,
    },
    {
      id: 'c3-s26',
      name: 'The Scoured Rise',
      enemies: { front: [RAVAGER, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 23,
    },
    {
      id: 'c3-s27',
      name: 'Emberwatch',
      enemies: { front: [SENTINEL, REVENANT], back: [ACOLYTE, STORMCALLER] },
      level: 24,
    },
    {
      // The escalation lock. Chipping the Wrathborn down is what turns it on, so the fight the
      // party has been winning gets harder at exactly the moment it looks won.
      id: 'c3-s28',
      name: 'The Kindled Span',
      enemies: { front: [WRATHBORN, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
      level: 26,
    },
    {
      id: 'c3-s29',
      name: 'Ashen Ford',
      enemies: { front: [WRATHBORN, REVENANT], back: [SKYSHRIKE, SKYSHRIKE, STORMCALLER] },
      level: 27,
    },
    {
      // ⚠️ The chapter boss: the penetration lesson wearing a crown. The First Cinder's pierce
      // and Flense open the party up, its Cinder Storm taxes the all-physical-armour answer, and
      // the Ravager beside it doubles the question. The escalation behind means the fight gets
      // harder exactly when it looks won — and nothing on the board heals, so it resolves.
      id: 'c3-s30',
      name: 'The First Cinder',
      enemies: { front: [FIRST_CINDER, RAVAGER], back: [WRATHBORN, STORMCALLER, SKYSHRIKE] },
      level: 30,
    },
  ],
} as const;
