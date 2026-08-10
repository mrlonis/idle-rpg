import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  GOLEM,
  HAG,
  PALE_WARDEN,
  PYRE,
  RIMEPLATE,
  SHADE,
  SLIME,
  WARDEN,
  WISP,
} from './enemies';

/**
 * Chapter 2 — The Drowned Ward.
 *
 * Twenty stages, enemy levels 14 to 15. It **opens at the level chapter 1 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step. The
 * level curve is nearly flat through the whole chapter on purpose — this is the band where the
 * player's own growth is rungs rather than levels, so what escalates is the *boards*, and a
 * chapter that climbed levels here would be hiding its own questions behind arithmetic.
 *
 * ## What it asks that chapter 1 did not
 *
 * Chapter 1 taught reach, a cleanse and a caster. This chapter opens on the two locks the fen
 * saves for a party that has those answers: the Warden's Gate, where accuracy stops being a stat
 * nobody reads, and Rimeplate Deep, where "bring the other damage type" stops working and
 * penetration starts. The remaining eighteen stages are those questions in combinations — never a
 * new stat block for its own sake, which is what milestone 10 bought when it made an enemy a
 * level-1 shape plus a level.
 *
 * ## The final
 *
 * The Pale Warden, at stage 20, on a board that fields the whole fen vocabulary at once — stun
 * from the boss, both defences beside it, sustain, a burn and a dodge behind. The durability is
 * on the boss's own body rather than on anything hiding behind it, which is the shape every final
 * observes: everything the party must kill is a thing it is allowed to hit.
 */
export const CHAPTER_2 = {
  id: 'chapter-2',
  name: 'The Drowned Ward',
  stages: [
    // -----------------------------------------------------------------------------------
    // The gates — stages 1 to 10, level 14
    // -----------------------------------------------------------------------------------
    {
      // The gate. A Warden takes turns away, a Shade dodges over half of what is aimed at it, and
      // an Acolyte undoes the rest. Accuracy stops being a stat nobody reads.
      id: 'c2-s1',
      name: 'The Warden’s Gate',
      enemies: { front: [WARDEN, BANDIT], back: [ACOLYTE, SHADE] },
      level: 14,
    },
    {
      // Both defences up in front, two things that punish patience behind. Winnable by a party
      // that brought penetration or a Sunder, and expensive for anything else.
      id: 'c2-s2',
      name: 'Rimeplate Deep',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HAG, PYRE] },
      level: 14,
    },
    {
      // A wave again, but with a wall in it. A pure fodder stage here would ask less than the
      // Broken Causeway four stages below it, which is a step backwards a player feels as the
      // ladder briefly forgetting where they are.
      id: 'c2-s3',
      name: 'Drowned Steps',
      enemies: { front: [GOLEM, BOAR], back: [WISP, SLIME, PYRE] },
      level: 14,
    },
    {
      id: 'c2-s4',
      name: 'Reedcutter Camp',
      enemies: { front: [BANDIT, BANDIT], back: [BANDIT, WISP] },
      level: 14,
    },
    {
      // Absorb and heal together for the first time — neither is new, and the pair is.
      id: 'c2-s5',
      name: 'Fen Chapel',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [ACOLYTE, WISP] },
      level: 14,
    },
    {
      id: 'c2-s6',
      name: 'Mirefall',
      enemies: { front: [GOLEM, BOAR], back: [PYRE, WISP] },
      level: 14,
    },
    {
      id: 'c2-s7',
      name: 'The Shrouded Path',
      enemies: { front: [BANDIT, BULWARK_ENEMY], back: [SHADE, ACOLYTE, WISP] },
      level: 14,
    },
    {
      // Two walls and nothing else worth hitting. A party with no answer to armour spends the
      // whole ninety seconds finding that out.
      id: 'c2-s8',
      name: 'Hollow Bank',
      enemies: { front: [GOLEM, GOLEM], back: [PYRE] },
      level: 14,
    },
    {
      id: 'c2-s9',
      name: 'Widow’s Crossing',
      enemies: { front: [BOAR, BANDIT], back: [HAG, SHADE, WISP] },
      level: 14,
    },
    {
      // Mini-boss. The Warden's stun on top of a Golem's armour and a Hag's debuff: three answers
      // wanted at once, which is what a mini-boss is for.
      id: 'c2-s10',
      name: 'The Bogwarden',
      enemies: { front: [WARDEN, GOLEM], back: [HAG, PYRE] },
      level: 14,
    },

    // -----------------------------------------------------------------------------------
    // The deep ward — stages 11 to 20, levels 14 to 15
    // -----------------------------------------------------------------------------------
    {
      // Two healers behind a barrier. Chip damage cannot win this; the party has to reach.
      id: 'c2-s11',
      name: 'Sunken Chapel',
      enemies: { front: [BULWARK_ENEMY, BOAR], back: [ACOLYTE, ACOLYTE] },
      level: 14,
    },
    {
      id: 'c2-s12',
      name: 'Blackwater Run',
      enemies: { front: [BANDIT, BANDIT], back: [SHADE, SHADE, WISP] },
      level: 15,
    },
    {
      id: 'c2-s13',
      name: 'Cairnmoss',
      enemies: { front: [RIMEPLATE, BOAR], back: [PYRE, WISP] },
      level: 15,
    },
    {
      id: 'c2-s14',
      name: 'The Weeping Fen',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [HAG, ACOLYTE, PYRE] },
      level: 15,
    },
    {
      id: 'c2-s15',
      name: 'Gravelight',
      enemies: { front: [GOLEM, BANDIT], back: [SHADE, ACOLYTE] },
      level: 15,
    },
    {
      id: 'c2-s16',
      name: 'Stonewatch',
      enemies: { front: [RIMEPLATE, GOLEM], back: [WISP, WISP] },
      level: 15,
    },
    {
      // Two Hags is twice the debuff and twice the cleanse it takes to answer them.
      id: 'c2-s17',
      name: 'The Long Mire',
      enemies: { front: [BOAR, BOAR], back: [HAG, HAG, ACOLYTE] },
      level: 15,
    },
    {
      id: 'c2-s18',
      name: 'Emberfen',
      enemies: { front: [BULWARK_ENEMY, BANDIT], back: [PYRE, PYRE] },
      level: 15,
    },
    {
      // A Shade in the front rank, where its dodge is aimed at everything the party throws.
      id: 'c2-s19',
      name: 'Shadewater',
      enemies: { front: [BANDIT, SHADE], back: [SHADE, ACOLYTE, WISP] },
      level: 15,
    },
    {
      // ⚠️ The chapter boss. Stun from the Pale Warden, both defences beside it, and sustain, a
      // burn and a dodge behind — the whole fen vocabulary on one board, led by a body that
      // stands nowhere else and carries its durability itself.
      id: 'c2-s20',
      name: 'The Pale Warden',
      enemies: { front: [PALE_WARDEN, RIMEPLATE], back: [ACOLYTE, PYRE, SHADE] },
      level: 15,
    },
  ],
} as const;
