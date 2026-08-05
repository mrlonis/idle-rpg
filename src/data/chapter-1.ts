import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  GOLEM,
  HAG,
  PYRE,
  RIMEPLATE,
  SHADE,
  SLIME,
  WARDEN,
  WISP,
} from './enemies';

/**
 * Chapter 1 — The Sunken Fen.
 *
 * Fifty stages, enemy levels 1 to 40. The first twelve are the ladder milestones 2, 4 and 7
 * authored, kept in order and re-levelled to fit a chapter four times as long; the rest are what
 * that ladder always wanted and never had room for — every lock met again, in combinations, at a
 * pace that lets a party grow into it.
 *
 * ## Where the levels come from
 *
 * Stages 1 to 6 are the tutorial ramp and are level 1 to 9, because the party fighting them is
 * three characters at level 1. Then the level steps to 14 at **stage 7, the healer lock**, and
 * climbs about two thirds of a level a stage for the remaining forty-three.
 *
 * ⚠️ **That step is the single most important number in the chapter and it is measured, not
 * chosen for looks.** The starting three clear the Marsh Shrine reliably at enemy level 6, most
 * of the time at level 8, and never from level 14 up. The wall is a question about *who* is
 * fighting rather than how many levels they have — but a party has to be held at a level where
 * the question is asked, and below 14 the encounter simply answers itself. Flattening this step
 * to make the curve prettier deletes the early game's only wall.
 *
 * Everything after it is deliberately gradual. The chapter ends where a common-tier five at level
 * 40 — the `rare` cap, which is exactly the party a player holds the moment levelling first stops
 * and ascending starts — can take the boss.
 *
 * ## What it draws on
 *
 * Twelve archetypes, and no more: the fen set. The Ashfall archetypes are chapter 2's, so the
 * fifty stages here are combinations of twelve questions rather than a parade of new stat blocks
 * — which is what milestone 10 bought when it made an enemy a level-1 block plus a level. A Bog
 * Hag at stage 44 is the same fifteen lines of content she was at stage 8, asking the same thing
 * of a party four times the size.
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
    // The locks — stages 7 to 12, levels 14 to 18
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
      level: 15,
    },
    {
      // The armour check. Almost nothing physical the party does lands for full value against a
      // Golem, and the Pyre Caster behind it means grinding through slowly is not free either.
      // The Golem's resist is physical only, so this is where a caster earns a slot.
      id: 'c1-s9',
      name: 'Broken Causeway',
      enemies: { front: [GOLEM], back: [WISP, PYRE] },
      level: 15,
    },
    {
      // Mini-boss. The absorb lock: a Bulwark re-applies a party-wide barrier faster than chip
      // damage can eat it, so the party needs burst — and the Pyre Caster punishes the
      // all-physical-armour parties that answer everything else.
      id: 'c1-s10',
      name: 'Ashen Span',
      enemies: { front: [BULWARK_ENEMY, BOAR], back: [PYRE, WISP] },
      level: 17,
    },
    {
      // The gate. A Warden takes turns away, a Shade dodges over half of what is aimed at it, and
      // an Acolyte undoes the rest. Accuracy stops being a stat nobody reads.
      id: 'c1-s11',
      name: 'The Warden’s Gate',
      enemies: { front: [WARDEN, BANDIT], back: [ACOLYTE, SHADE] },
      level: 17,
    },
    {
      // Both defences up in front, two things that punish patience behind. Winnable by a party
      // that brought penetration or a Sunder, and expensive for anything else.
      id: 'c1-s12',
      name: 'Rimeplate Deep',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HAG, PYRE] },
      level: 18,
    },

    // -----------------------------------------------------------------------------------
    // The fen proper — stages 13 to 20, levels 18 to 23
    // -----------------------------------------------------------------------------------
    {
      // A wave again, but with a wall in it. A pure fodder stage here would ask less than the
      // Broken Causeway four stages below it, which is a step backwards a player feels as the
      // ladder briefly forgetting where they are.
      id: 'c1-s13',
      name: 'Drowned Steps',
      enemies: { front: [GOLEM, BOAR], back: [WISP, SLIME, PYRE] },
      level: 18,
    },
    {
      id: 'c1-s14',
      name: 'Reedcutter Camp',
      enemies: { front: [BANDIT, BANDIT], back: [BANDIT, WISP] },
      level: 19,
    },
    {
      // Absorb and heal together for the first time — neither is new, and the pair is.
      id: 'c1-s15',
      name: 'Fen Chapel',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [ACOLYTE, WISP] },
      level: 19,
    },
    {
      id: 'c1-s16',
      name: 'Mirefall',
      enemies: { front: [GOLEM, BOAR], back: [PYRE, WISP] },
      level: 20,
    },
    {
      id: 'c1-s17',
      name: 'The Shrouded Path',
      enemies: { front: [BANDIT, BULWARK_ENEMY], back: [SHADE, ACOLYTE, WISP] },
      level: 20,
    },
    {
      // Two walls and nothing else worth hitting. A party with no answer to armour spends the
      // whole ninety seconds finding that out.
      id: 'c1-s18',
      name: 'Hollow Bank',
      enemies: { front: [GOLEM, GOLEM], back: [PYRE] },
      level: 21,
    },
    {
      id: 'c1-s19',
      name: 'Widow’s Crossing',
      enemies: { front: [BOAR, BANDIT], back: [HAG, SHADE, WISP] },
      level: 21,
    },
    {
      // Mini-boss. The Warden's stun on top of a Golem's armour and a Hag's debuff: three answers
      // wanted at once, which is what a mini-boss is for.
      id: 'c1-s20',
      name: 'The Bogwarden',
      enemies: { front: [WARDEN, GOLEM], back: [HAG, PYRE] },
      level: 23,
    },

    // -----------------------------------------------------------------------------------
    // The long mire — stages 21 to 30, levels 23 to 29
    // -----------------------------------------------------------------------------------
    {
      // Two healers behind a barrier. Chip damage cannot win this; the party has to reach.
      id: 'c1-s21',
      name: 'Sunken Chapel',
      enemies: { front: [BULWARK_ENEMY, BOAR], back: [ACOLYTE, ACOLYTE] },
      level: 23,
    },
    {
      id: 'c1-s22',
      name: 'Blackwater Run',
      enemies: { front: [BANDIT, BANDIT], back: [SHADE, SHADE, WISP] },
      level: 24,
    },
    {
      id: 'c1-s23',
      name: 'Cairnmoss',
      enemies: { front: [RIMEPLATE, BOAR], back: [PYRE, WISP] },
      level: 24,
    },
    {
      id: 'c1-s24',
      name: 'The Weeping Fen',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [HAG, ACOLYTE, PYRE] },
      level: 25,
    },
    {
      id: 'c1-s25',
      name: 'Gravelight',
      enemies: { front: [GOLEM, BANDIT], back: [SHADE, ACOLYTE] },
      level: 25,
    },
    {
      id: 'c1-s26',
      name: 'Stonewatch',
      enemies: { front: [RIMEPLATE, GOLEM], back: [WISP, WISP] },
      level: 26,
    },
    {
      // Two Hags is twice the debuff and twice the cleanse it takes to answer them.
      id: 'c1-s27',
      name: 'The Long Mire',
      enemies: { front: [BOAR, BOAR], back: [HAG, HAG, ACOLYTE] },
      level: 26,
    },
    {
      id: 'c1-s28',
      name: 'Emberfen',
      enemies: { front: [BULWARK_ENEMY, BANDIT], back: [PYRE, PYRE] },
      level: 27,
    },
    {
      // A Shade in the front rank, where its dodge is aimed at everything the party throws.
      id: 'c1-s29',
      name: 'Shadewater',
      enemies: { front: [BANDIT, SHADE], back: [SHADE, ACOLYTE, WISP] },
      level: 27,
    },
    {
      // Mini-boss. Stun, barrier, heal, burn and dodge — the whole fen vocabulary on one board.
      id: 'c1-s30',
      name: 'The Iron Vigil',
      enemies: { front: [WARDEN, BULWARK_ENEMY], back: [ACOLYTE, PYRE, SHADE] },
      level: 29,
    },

    // -----------------------------------------------------------------------------------
    // Cold water — stages 31 to 40, levels 29 to 35
    // -----------------------------------------------------------------------------------
    {
      id: 'c1-s31',
      name: 'Coldmire',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [WISP, PYRE] },
      level: 29,
    },
    {
      id: 'c1-s32',
      name: 'The Sundered Ford',
      enemies: { front: [GOLEM, BOAR], back: [HAG, SHADE, ACOLYTE] },
      level: 30,
    },
    {
      // Three Shades. Accuracy or volume; nothing else touches this.
      id: 'c1-s33',
      name: 'Wraithlight',
      enemies: { front: [BANDIT, BANDIT], back: [SHADE, SHADE, SHADE] },
      level: 30,
    },
    {
      id: 'c1-s34',
      name: 'The Hag’s Table',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [HAG, HAG, PYRE] },
      level: 31,
    },
    {
      id: 'c1-s35',
      name: 'Fen of Bones',
      enemies: { front: [RIMEPLATE, GOLEM], back: [ACOLYTE, PYRE] },
      level: 31,
    },
    {
      id: 'c1-s36',
      name: 'Stillwater Shrine',
      enemies: { front: [BULWARK_ENEMY, BOAR], back: [ACOLYTE, ACOLYTE, WISP] },
      level: 32,
    },
    {
      id: 'c1-s37',
      name: 'The Grey Causeway',
      enemies: { front: [GOLEM, RIMEPLATE], back: [PYRE, SHADE] },
      level: 32,
    },
    {
      id: 'c1-s38',
      name: 'Nightreed',
      enemies: { front: [BOAR, BANDIT], back: [HAG, PYRE, SHADE] },
      level: 33,
    },
    {
      id: 'c1-s39',
      name: 'The Drowned Court',
      enemies: { front: [WARDEN, BOAR], back: [ACOLYTE, HAG] },
      level: 33,
    },
    {
      // Mini-boss. Two Rimeplates: both defences up, twice over, with a burn and a debuff behind
      // them. The last stage before the chapter's run-in, and the one that says whether a party
      // brought penetration.
      id: 'c1-s40',
      name: 'Rimefall',
      enemies: { front: [RIMEPLATE, RIMEPLATE], back: [PYRE, HAG, WISP] },
      level: 35,
    },

    // -----------------------------------------------------------------------------------
    // The run-in — stages 41 to 50, levels 35 to 40
    // -----------------------------------------------------------------------------------
    {
      id: 'c1-s41',
      name: 'Ashen Fen',
      enemies: { front: [BULWARK_ENEMY, GOLEM], back: [PYRE, PYRE, ACOLYTE] },
      level: 35,
    },
    {
      id: 'c1-s42',
      name: 'The Quiet Deep',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [SHADE, ACOLYTE] },
      level: 36,
    },
    {
      id: 'c1-s43',
      name: 'Thorn Gate',
      enemies: { front: [WARDEN, BANDIT], back: [SHADE, PYRE] },
      level: 36,
    },
    {
      id: 'c1-s44',
      name: 'The Last Reeds',
      enemies: { front: [BOAR, BOAR], back: [HAG, ACOLYTE, SHADE] },
      level: 37,
    },
    {
      id: 'c1-s45',
      name: 'Grimwater',
      enemies: { front: [GOLEM, RIMEPLATE], back: [PYRE, HAG, ACOLYTE] },
      level: 37,
    },
    {
      id: 'c1-s46',
      name: 'The Broken Vigil',
      enemies: { front: [WARDEN, RIMEPLATE], back: [ACOLYTE, PYRE] },
      level: 38,
    },
    {
      id: 'c1-s47',
      name: 'Deepmire',
      enemies: { front: [RIMEPLATE, GOLEM], back: [HAG, SHADE, ACOLYTE] },
      level: 38,
    },
    {
      id: 'c1-s48',
      name: 'The Cold Shrine',
      enemies: { front: [BULWARK_ENEMY, RIMEPLATE], back: [ACOLYTE, ACOLYTE, PYRE] },
      level: 39,
    },
    {
      id: 'c1-s49',
      name: 'Wardenmarch',
      enemies: { front: [WARDEN, GOLEM], back: [SHADE, HAG, PYRE] },
      level: 39,
    },
    {
      // ⚠️ The chapter boss, and the party the whole chapter is tuned against: five common-tier
      // characters at level 40, ascended once. A full board — the Warden's stun and Rimeplate's
      // two defences in front, sustain and a burn behind — and every question the fen has asked,
      // asked together.
      id: 'c1-s50',
      name: 'The Frozen Gate',
      enemies: { front: [WARDEN, RIMEPLATE], back: [ACOLYTE, HAG, PYRE] },
      level: 40,
    },
  ],
} as const;
