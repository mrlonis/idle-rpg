import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  FENLORD,
  GOLEM,
  HAG,
  PYRE,
  SLIME,
  WISP,
} from './enemies';

/**
 * Chapter 1 — The Sunken Fen.
 *
 * Ten stages, enemy levels 1 to 14: the tutorial ramp, the ladder's three most important locks,
 * and the first boss. The six-chapter re-cut made the opening chapter short on purpose — a
 * chapter is finished when its questions are, and the questions here are "what is a party for"
 * asked three ways. Clearing it is what unlocks auto-battle, so the chapter is exactly the
 * stretch a player fights by hand.
 *
 * ## Where the levels come from
 *
 * Stages 1 to 6 are the tutorial ramp and are level 1 to 9, because the party fighting them is
 * three characters at level 1. Then the level steps to 14 at **stage 7, the healer lock**, and
 * holds there through the boss.
 *
 * ⚠️ **That step is the single most important number in the chapter and it is measured, not
 * chosen for looks.** The starting three clear the Marsh Shrine reliably at enemy level 6, most
 * of the time at level 8, and never from level 14 up. The wall is a question about *who* is
 * fighting rather than how many levels they have — but a party has to be held at a level where
 * the question is asked, and below 14 the encounter simply answers itself. Flattening this step
 * to make the curve prettier deletes the early game's only wall.
 *
 * ## What it draws on
 *
 * Ten archetypes: the heart of the fen set, plus the one body that stands nowhere else — The
 * Fenlord, the chapter's final, at stage 10. The rest of the fen (the Warden's stun, the Shade's
 * dodge, the Rimeplate's double armour) belongs to chapter 2, which is where those locks are
 * taught; a ten-stage chapter that tried to ask everything would teach nothing.
 */
export const CHAPTER_1 = {
  id: 'chapter-1',
  name: 'The Sunken Fen',
  stages: [
    // -----------------------------------------------------------------------------------
    // The tutorial ramp — stages 1 to 6, levels 1 to 9
    // -----------------------------------------------------------------------------------
    {
      id: 'c1-s1',
      name: 'Mossy Hollow',
      enemies: { front: [SLIME], back: [SLIME] },
      level: 1,
    },
    {
      id: 'c1-s2',
      name: 'Sunken Path',
      enemies: { front: [SLIME, SLIME], back: [SLIME] },
      level: 2,
    },
    {
      // First speed check, and the first time the back rank matters: two Wisps act nearly twice
      // as often as anything the party has, and they are standing behind something.
      id: 'c1-s3',
      name: 'Wisplight Marsh',
      enemies: { front: [SLIME], back: [WISP, WISP] },
      level: 3,
    },
    {
      id: 'c1-s4',
      name: 'Bramble Run',
      enemies: { front: [BOAR], back: [SLIME, SLIME] },
      level: 5,
    },
    {
      // First real damage check, and the first thing that reaches past the front rank: Bandits
      // carry Cutpurse, so a Rin standing safely behind two bodies is not safe at all.
      id: 'c1-s5',
      name: 'Cutthroat Camp',
      enemies: { front: [BANDIT, BANDIT], back: [WISP, SLIME] },
      level: 6,
    },
    {
      // The widest wave in the tutorial: five bodies, two of them fast. Single-target damage
      // starts losing to volume here, which is what makes Volley, Grave Tide and Ruin Unbound
      // worth a turn.
      id: 'c1-s6',
      name: 'Thornwood Clearing',
      enemies: { front: [BOAR, BOAR], back: [WISP, WISP, SLIME] },
      level: 9,
    },

    // -----------------------------------------------------------------------------------
    // The locks — stages 7 to 9, level 14
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ The healer lock, and the stage the whole early game is built around. Two Boars in
      // front of an Acolyte that heals for more than a starting party can chip through: the party
      // has to reach past them or lose. "Attack whatever has the least HP" answers this by
      // attacking the Boars forever, which is why milestone 2's targeting could not have posed
      // the question at all.
      //
      // Level 14 rather than the level the curve would put here — see the note at the top.
      id: 'c1-s7',
      name: 'Marsh Shrine',
      enemies: { front: [BOAR, BOAR], back: [ACOLYTE] },
      level: 14,
    },
    {
      // Debuff plus sustain. The Hag weakens the whole party and slows the front rank, and the
      // Acolyte undoes whatever damage gets through — so the party needs a cleanse *and* reach,
      // which is the first stage that asks for two answers at once.
      id: 'c1-s8',
      name: 'Hagfen',
      enemies: { front: [BOAR, BANDIT], back: [HAG, ACOLYTE] },
      level: 14,
    },
    {
      // The armour check. Almost nothing physical the party does lands for full value against a
      // Golem, and the Pyre Caster behind it means grinding through slowly is not free either.
      // The Golem's resist is physical only, so this is where a caster earns a slot.
      id: 'c1-s9',
      name: 'Broken Causeway',
      enemies: { front: [GOLEM], back: [WISP, PYRE] },
      level: 14,
    },
    {
      // ⚠️ The chapter boss, and the first body on the ladder a player meets exactly once. The
      // Fenlord wears the absorb lesson itself — a banked pool that depletes and is never
      // refilled — with the Iron Bulwark beside it still teaching the party-wide version, a burn
      // and a debuff behind, and no healing anywhere on the board. Every question the fen has
      // asked so far, asked by something big enough to remember.
      id: 'c1-s10',
      name: 'The Fenlord',
      enemies: { front: [FENLORD, BULWARK_ENEMY], back: [HAG, PYRE, WISP] },
      level: 14,
    },
  ],
} as const;
