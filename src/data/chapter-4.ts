import {
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  BARROW_SOVEREIGN,
  BRAMBLEHIDE_RAVENER,
  COLOSSUS,
  CONCORD_CANTOR,
  COVENANT_BREAKER,
  DEEPROCK_MINER,
  EMBERSEED_WARLOCK,
  FREE_BLADE,
  GILDED_SENTRY,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HOLLOW_SERAPH,
  MARCHWARD_PIKEMAN,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  RADIANT_HERALD,
  REVENANT,
  RIFTBORN_HARROWER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SKYSHRIKE,
  STORMCALLER,
  TYRANT,
  UNMADE,
  UNSEALED_WRETCH,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * Chapter 4 — The Sundered Vault.
 *
 * Fifty stages, enemy levels 160 to 225. It **opens at the level chapter 3 closed on**, which is
 * the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Bound Marches did not
 *
 * The Marches asked *where a hit is allowed to go*, and milestone 17 grew the vocabulary once to
 * let them ask it. ⚠️ **This chapter grows nothing, and that is a decision rather than a shortfall.**
 * Every targeting, status and effect kind is in use; a fifth spelling of "hits the front rank
 * harder" is what milestone 17 refused to ship, and inventing a mechanic per chapter is a treadmill
 * that ends with a combat system nobody can hold in their head.
 *
 * So the Vault is built out of two things that were always available and had never been spent:
 *
 * 1. **Pairs.** A taunt welded to an absorb pool, a cleanse welded to a tempo buff, a wide hit that
 *    switches off once the party has lost somebody. Each is two known parts on one body, and each
 *    asks something neither part asks alone.
 * 2. **The matchup matrix, pointed one way.** An Angel or a Demon deals ×1.10 to every mortal and
 *    **nothing comes back** — the matrix has no mortal → celestial row, by design. Everywhere else
 *    on the ladder the matrix is a tiebreak a party answers by choosing who to bring. In a
 *    celestial-led chapter it is a **standing tax no mortal composition can answer**, which is the
 *    Vault's difficulty signature and the reason it reads as somewhere else.
 *
 * ⚠️ **That second lever is why the lean is moderate rather than total.** At every board the
 * ×1.10 stops being a texture and becomes a second level dial stacked on the first — worth roughly
 * nine levels of investment, silently, on top of the sixty-five the chapter already climbs. So
 * mortal jailers and Marches wreckage hold most front ranks, and the celestials headline.
 *
 * | Band          | Stages | The lock it teaches                                       |
 * | ------------- | ------ | --------------------------------------------------------- |
 * | The breach    | 1–10   | the wall you are forced to hit is wearing a shield        |
 * | The wards     | 11–20  | your setup is removed, and paid for in tempo              |
 * | The unsealed  | 21–30  | the fight is hardest while you are still whole            |
 * | The covenant  | 31–40  | wounding it is what points it at your carry               |
 * | The heart     | 41–50  | all four at once, and the thing the chains were holding   |
 *
 * ## Where the levels come from
 *
 * 160 to 225, about one and a third levels a stage — flatter than the Marches' one and a half,
 * because the matrix is carrying difficulty the level dial had to carry there.
 *
 * ⚠️ **The top is past the level cap of the rung the chapter asks for**, which is the rule chapter 3
 * established and this one inherits: `legendary` caps at 200, so a player who buys the ascension and
 * levels it out is still **twenty-five levels short** at the Hollow Seraph and has to make the
 * difference up in composition, matchup and gear. An ascension rung is worth ×1.6 and the enemy side
 * has no rungs at all, so a chapter that closes *inside* the cap it asks for hands the party a ×1.6
 * nobody paid for and every stage in it is a walkover.
 *
 * Still no lucky pull anywhere on the ladder: the rung is thirty-two duplicate copies of each of the
 * five, eight more than chapter 3 asked for, and every one of them is bought with time.
 *
 * ## What it draws on
 *
 * Thirty-five archetypes: **eight new, twenty-seven returning** — a little under a quarter new, the
 * same ratio chapter 3 shipped at. The returning set is deliberately weighted toward the Marches, so
 * a player arriving here recognises most of the board and meets the Vault's own bodies as the thing
 * that changed.
 *
 * ⚠️ **The Chainsworn does not appear.** It stands on `c3-s50` and nowhere else, and the Hollow
 * Seraph is the second body on the ladder authored under that rule — a chapter's last encounter is
 * the one a player remembers, and a stat block they have already beaten four times is a stage number.
 *
 * ⚠️ **No board in this chapter puts a healer behind a taunt, and no board fields a healer at all.**
 * The Marches allow exactly one such encounter, at stage 10, where the party is far above the level;
 * here the taunting body is itself the durable one, which inverts the failure rather than repeating
 * it — the one thing the party is permitted to hit is the one thing it needs to kill. Sustain the
 * party cannot aim at is a ninety-second clock, and a timeout is scored as a defeat.
 */
export const CHAPTER_4 = {
  id: 'chapter-4',
  name: 'The Sundered Vault',
  stages: [
    // -----------------------------------------------------------------------------------
    // The breach — stages 1 to 10, levels 160 to 172
    // -----------------------------------------------------------------------------------
    {
      // The seam. A wholly mortal board at the Marches' own closing level, so the first fight of
      // the chapter is one the party that took the Chainsworn already knows how to have. The gate
      // is still held by the people who were posted to it; what is behind it is not.
      id: 'c4-s1',
      name: 'The Outer Gate',
      enemies: { front: [MARCHWARD_PIKEMAN, VAULTBOUND_GAOLER], back: [STORMCALLER, SKYSHRIKE] },
      level: 160,
    },
    {
      // The chapter's first lock, stated plainly. The party has spent fifty stages learning that a
      // taunt is answered by killing the thing that cast it; this one is wearing an absorb pool, so
      // the answer now has to arrive inside the window rather than eventually.
      id: 'c4-s2',
      name: 'First Seal',
      enemies: {
        front: [SEALWARD_CUSTODIAN, VAULTBOUND_GAOLER],
        back: [VAULTLIGHT_CENSER, STORMCALLER],
      },
      level: 161,
    },
    {
      id: 'c4-s3',
      name: 'The Sealward',
      enemies: {
        front: [SEALWARD_CUSTODIAN, MARCHWARD_PIKEMAN],
        back: [VAULTLIGHT_CENSER, SKYSHRIKE, STORMCALLER],
      },
      level: 163,
    },
    {
      id: 'c4-s4',
      name: 'Wretchfall',
      enemies: {
        front: [VAULTBOUND_GAOLER, UNSEALED_WRETCH],
        back: [UNSEALED_WRETCH, VAULTLIGHT_CENSER],
      },
      level: 164,
    },
    {
      id: 'c4-s5',
      name: "Custodian's Watch",
      enemies: {
        front: [SEALWARD_CUSTODIAN, SENTINEL],
        back: [RADIANT_HERALD, VAULTLIGHT_CENSER, SKYSHRIKE],
      },
      level: 165,
    },
    {
      id: 'c4-s6',
      name: 'Broken Muster',
      enemies: {
        front: [FREE_BLADE, UNSEALED_WRETCH],
        back: [SERAPH_ADJUDICANT, VAULTLIGHT_CENSER],
      },
      level: 167,
    },
    {
      // The first board where the whole back rank is celestial. Nothing on it is individually a
      // problem; what it costs is the tax on every hit the party takes, with no matchup answer.
      id: 'c4-s7',
      name: 'Gilded Approach',
      enemies: {
        front: [SEALWARD_CUSTODIAN, VAULTBOUND_GAOLER],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, VAULTLIGHT_CENSER],
      },
      level: 168,
    },
    {
      id: 'c4-s8',
      name: 'The Choirward',
      enemies: {
        front: [OATHSHIELD_VANGUARD, MARCHWARD_PIKEMAN],
        back: [ASHEN_CHOIR, STORMCALLER],
      },
      level: 169,
    },
    {
      id: 'c4-s9',
      name: 'Sealbreak',
      enemies: { front: [SEALWARD_CUSTODIAN, REVENANT], back: [SERAPH_ADJUDICANT, HEADSMAN] },
      level: 171,
    },
    {
      // Mini-boss. The band's lock at full size: a taunt in front of a board that is itself
      // shielded, so the party is aimed at the one body it can least afford to chew through.
      // Deliberately no healer and no regeneration anywhere on it — every pool here depletes, which
      // is what makes this a burst check rather than a ninety-second clock.
      id: 'c4-s10',
      name: 'The Sworn Custodian',
      enemies: {
        front: [SEALWARD_CUSTODIAN, GILDED_SENTRY],
        back: [ASHEN_CHOIR, SERAPH_ADJUDICANT, VAULTLIGHT_CENSER],
      },
      level: 172,
    },

    // -----------------------------------------------------------------------------------
    // The wards — stages 11 to 20, levels 173 to 185
    // -----------------------------------------------------------------------------------
    {
      // The Archon arrives. A Runewarden already refused the party's setup; this takes it back and
      // spends the turn on speed rather than armour, so the board that shrugged off the opening
      // also starts acting more often than the party does.
      id: 'c4-s11',
      name: 'The Warded Hall',
      enemies: {
        front: [MARCHWARD_PIKEMAN, VAULTBOUND_GAOLER],
        back: [ANTIPHON_ARCHON, STORMCALLER],
      },
      level: 173,
    },
    {
      id: 'c4-s12',
      name: 'Antiphon',
      enemies: {
        front: [SENTINEL, VAULTBOUND_GAOLER],
        back: [ANTIPHON_ARCHON, VAULTLIGHT_CENSER, SKYSHRIKE],
      },
      level: 175,
    },
    {
      // Two cleanses on one board, which is the only encounter in the game where a party's debuffs
      // are worth nothing at all. What is left is damage that needs no setup — a real thing to own,
      // and not every party does.
      id: 'c4-s13',
      name: 'Twice Warded',
      enemies: { front: [RIMEPLATE, MARCHWARD_PIKEMAN], back: [RUNEWARDEN, ANTIPHON_ARCHON] },
      level: 176,
    },
    {
      id: 'c4-s14',
      name: 'The Silent Ward',
      enemies: {
        front: [SEALWARD_CUSTODIAN, DEEPROCK_MINER],
        back: [ANTIPHON_ARCHON, STORMCALLER],
      },
      level: 177,
    },
    {
      id: 'c4-s15',
      name: 'Adamant Antiphon',
      enemies: {
        front: [COLOSSUS, VAULTBOUND_GAOLER],
        back: [ANTIPHON_ARCHON, RADIANT_HERALD, VAULTLIGHT_CENSER],
      },
      level: 179,
    },
    {
      id: 'c4-s16',
      name: 'The Gilded Ward',
      enemies: {
        front: [OATHSHIELD_VANGUARD, GILDED_SENTRY],
        back: [ANTIPHON_ARCHON, SERAPH_ADJUDICANT],
      },
      level: 180,
    },
    {
      id: 'c4-s17',
      name: 'Marchward Vigil',
      enemies: {
        front: [RIVEN_MARCHWARDEN, VAULTBOUND_GAOLER],
        back: [ANTIPHON_ARCHON, SKYSHRIKE],
      },
      level: 181,
    },
    {
      // The Marches' link beside the Vault's cleanse: focus fire is spread, and the debuff that
      // would have made the spread survivable is removed on the Archon's next turn.
      id: 'c4-s18',
      name: 'Chorus and Chain',
      enemies: {
        front: [SENTINEL, FREE_BLADE],
        back: [CONCORD_CANTOR, ANTIPHON_ARCHON, VAULTLIGHT_CENSER],
      },
      level: 183,
    },
    {
      id: 'c4-s19',
      name: 'The Deep Ward',
      enemies: { front: [SEALWARD_CUSTODIAN, COLOSSUS], back: [ANTIPHON_ARCHON, ASHEN_CHOIR] },
      level: 184,
    },
    {
      // Mini-boss. A Seraph Adjudicant rather than a fourth defensive body on purpose: three
      // sources of denial with nothing that kills is a stall, and a stall is a timeout the party is
      // scored a loss for. The board has to be able to finish the fight it is refusing to lose.
      id: 'c4-s20',
      name: 'The Antiphon Choir',
      enemies: {
        front: [SEALWARD_CUSTODIAN, RIVEN_MARCHWARDEN],
        back: [ANTIPHON_ARCHON, CONCORD_CANTOR, SERAPH_ADJUDICANT],
      },
      level: 185,
    },

    // -----------------------------------------------------------------------------------
    // The unsealed — stages 21 to 30, levels 187 to 198
    // -----------------------------------------------------------------------------------
    {
      // The Harrower, and the inversion the band is named for: its wide turn only fires while four
      // of the party are standing, so this is the first encounter on the ladder that is *hardest at
      // the start* and cannot be out-lasted — only out-opened.
      id: 'c4-s21',
      name: 'The Lesser Cells',
      enemies: {
        front: [VAULTBOUND_GAOLER, UNSEALED_WRETCH],
        back: [RIFTBORN_HARROWER, VAULTLIGHT_CENSER],
      },
      level: 187,
    },
    {
      id: 'c4-s22',
      name: 'Wretchwarren',
      enemies: { front: [WRATHBORN, UNSEALED_WRETCH], back: [RIFTBORN_HARROWER, SKYSHRIKE] },
      level: 188,
    },
    {
      id: 'c4-s23',
      name: 'Riftfall',
      enemies: {
        front: [MARCHWARD_PIKEMAN, UNSEALED_WRETCH],
        back: [RIFTBORN_HARROWER, EMBERSEED_WARLOCK, VAULTLIGHT_CENSER],
      },
      level: 189,
    },
    {
      id: 'c4-s24',
      name: 'The Widening',
      enemies: {
        front: [SEALWARD_CUSTODIAN, UNSEALED_WRETCH],
        back: [RIFTBORN_HARROWER, HEXBOUND_TORMENTOR],
      },
      level: 191,
    },
    {
      id: 'c4-s25',
      name: 'Unsealed Ground',
      enemies: {
        front: [COLOSSUS, WRATHBORN],
        back: [RIFTBORN_HARROWER, ANTIPHON_ARCHON, UNSEALED_WRETCH],
      },
      level: 192,
    },
    {
      id: 'c4-s26',
      name: "Tyrant's Cell",
      enemies: { front: [TYRANT, UNSEALED_WRETCH], back: [RIFTBORN_HARROWER, VAULTLIGHT_CENSER] },
      level: 193,
    },
    {
      // A fuse and a wide opening on one board. The Emberseed asks *when* the cleanse is spent and
      // the Riftfall makes the first twenty seconds the expensive ones, so the party is being asked
      // to spend an answer early and to survive early with the same turns.
      id: 'c4-s27',
      name: 'The Riven Host',
      enemies: {
        front: [OATHSHIELD_VANGUARD, WRATHBORN],
        back: [RIFTBORN_HARROWER, EMBERSEED_WARLOCK, SERAPH_ADJUDICANT],
      },
      level: 194,
    },
    {
      id: 'c4-s28',
      name: 'The Unmade Cell',
      enemies: { front: [UNMADE, UNSEALED_WRETCH], back: [RIFTBORN_HARROWER, VAULTLIGHT_CENSER] },
      level: 196,
    },
    {
      id: 'c4-s29',
      name: 'Rimeward Breach',
      enemies: {
        front: [SEALWARD_CUSTODIAN, RIMEPLATE],
        back: [RIFTBORN_HARROWER, ANTIPHON_ARCHON],
      },
      level: 197,
    },
    {
      // Mini-boss, and the heaviest front rank the chapter has fielded so far. The Unmade is the
      // ceiling every ascended block in the game is sized under, and it is here rather than at the
      // top because the Hollow Seraph has to be the harder fight without being the bigger one.
      id: 'c4-s30',
      name: 'The Breach Widens',
      enemies: {
        front: [UNMADE, WRATHBORN],
        back: [RIFTBORN_HARROWER, EMBERSEED_WARLOCK, ANTIPHON_ARCHON],
      },
      level: 198,
    },

    // -----------------------------------------------------------------------------------
    // The covenant — stages 31 to 40, levels 200 to 212
    // -----------------------------------------------------------------------------------
    {
      // The Breaker: harmless until it is wounded, and then aimed past the front rank at whatever
      // is biggest. Chipping it is not progress toward killing it — it is the thing that turns it
      // around, which is the opposite of every wall the ladder has taught.
      //
      // ⚠️ **A band opener that is also a difficulty-probe sample, and the first draft got that
      // wrong.** This was a four-body board with two commons on it, which reads as a teaching stage
      // and measured as a step *backwards* from `c4-s27` — 84.4 against 100.9, inside the probe's
      // 0.85 tolerance. Chapter 3 recorded the rule and chapter 4 broke it anyway: the sampled
      // stages are the chapter's spine, composition moves difficulty by far more than the level
      // does, and a light board landing on a sample after a heavy one is a step down however the
      // levels read. Fixed by weight rather than by level — a legendary front rank and a fifth body.
      id: 'c4-s31',
      name: 'The Broken Word',
      enemies: {
        front: [COVENANT_BREAKER, SENTINEL],
        back: [SERAPH_ADJUDICANT, STORMCALLER, VAULTLIGHT_CENSER],
      },
      level: 200,
    },
    {
      id: 'c4-s32',
      name: "Covenant's Edge",
      enemies: { front: [COVENANT_BREAKER, UNSEALED_WRETCH], back: [SERAPH_ADJUDICANT, SKYSHRIKE] },
      level: 201,
    },
    {
      id: 'c4-s33',
      name: 'The Wounded Pact',
      enemies: {
        front: [COVENANT_BREAKER, WRATHBORN],
        back: [RIFTBORN_HARROWER, VAULTLIGHT_CENSER],
      },
      level: 202,
    },
    {
      // The pairing the band was built for. The taunt drags the party onto the Custodian, so the
      // Breaker is the one body on the board the party is *not allowed* to finish — and it spends
      // the whole window getting worse.
      id: 'c4-s34',
      name: 'Oath and Ward',
      enemies: {
        front: [COVENANT_BREAKER, SEALWARD_CUSTODIAN],
        back: [ANTIPHON_ARCHON, SERAPH_ADJUDICANT],
      },
      level: 204,
    },
    {
      id: 'c4-s35',
      name: 'The Adamant Pact',
      enemies: {
        front: [COVENANT_BREAKER, COLOSSUS],
        back: [CONCORD_CANTOR, RIFTBORN_HARROWER, VAULTLIGHT_CENSER],
      },
      level: 205,
    },
    {
      id: 'c4-s36',
      name: 'Thorn and Covenant',
      enemies: {
        front: [COVENANT_BREAKER, BRAMBLEHIDE_RAVENER],
        back: [EMBERSEED_WARLOCK, ANTIPHON_ARCHON],
      },
      level: 206,
    },
    {
      id: 'c4-s37',
      name: "Sovereign's Cell",
      enemies: { front: [BARROW_SOVEREIGN, COVENANT_BREAKER], back: [ANTIPHON_ARCHON, HEADSMAN] },
      level: 208,
    },
    {
      id: 'c4-s38',
      name: 'The Bound Covenant',
      enemies: {
        front: [SEALWARD_CUSTODIAN, COVENANT_BREAKER],
        back: [CONCORD_CANTOR, RIFTBORN_HARROWER],
      },
      level: 209,
    },
    {
      id: 'c4-s39',
      name: "Oathbreaker's Vigil",
      enemies: {
        front: [OATHBREAKER, COVENANT_BREAKER],
        back: [ANTIPHON_ARCHON, EMBERSEED_WARLOCK, SERAPH_ADJUDICANT],
      },
      level: 210,
    },
    {
      // Mini-boss. Every question the chapter has asked, on one board, with the answers pointed at
      // each other: a wall that must be hit, a body that must not be, a wide opening, and a cleanse
      // that takes the setup for all of it back.
      id: 'c4-s40',
      name: 'The Broken Covenant',
      enemies: {
        front: [COVENANT_BREAKER, SEALWARD_CUSTODIAN],
        back: [RIFTBORN_HARROWER, ANTIPHON_ARCHON, CONCORD_CANTOR],
      },
      level: 212,
    },

    // -----------------------------------------------------------------------------------
    // The heart — stages 41 to 50, levels 213 to 225
    // -----------------------------------------------------------------------------------
    {
      id: 'c4-s41',
      name: 'The Inner Vault',
      enemies: { front: [SEALWARD_CUSTODIAN, TYRANT], back: [ANTIPHON_ARCHON, RIFTBORN_HARROWER] },
      level: 213,
    },
    {
      id: 'c4-s42',
      name: 'Chainward Deep',
      enemies: {
        front: [COVENANT_BREAKER, RIVEN_MARCHWARDEN],
        back: [CONCORD_CANTOR, EMBERSEED_WARLOCK],
      },
      level: 214,
    },
    {
      id: 'c4-s43',
      name: 'The Unmade Vault',
      enemies: {
        front: [UNMADE, SEALWARD_CUSTODIAN],
        back: [RIFTBORN_HARROWER, ANTIPHON_ARCHON, VAULTLIGHT_CENSER],
      },
      level: 216,
    },
    {
      id: 'c4-s44',
      name: "Sovereign's Vigil",
      enemies: {
        front: [BARROW_SOVEREIGN, COVENANT_BREAKER],
        back: [CONCORD_CANTOR, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
      level: 217,
    },
    {
      id: 'c4-s45',
      name: 'Wyrdroot Vault',
      enemies: {
        front: [WYRDROOT_ANCIENT, SEALWARD_CUSTODIAN],
        back: [ANTIPHON_ARCHON, ASHEN_CHOIR],
      },
      level: 218,
    },
    {
      id: 'c4-s46',
      name: 'The Last Oath',
      enemies: {
        front: [OATHBREAKER, COVENANT_BREAKER],
        back: [RIFTBORN_HARROWER, EMBERSEED_WARLOCK, ANTIPHON_ARCHON],
      },
      level: 220,
    },
    {
      id: 'c4-s47',
      name: 'The Unmade Heart',
      enemies: {
        front: [UNMADE, RIVEN_MARCHWARDEN],
        back: [CONCORD_CANTOR, RIFTBORN_HARROWER, SERAPH_ADJUDICANT],
      },
      level: 221,
    },
    {
      id: 'c4-s48',
      name: "Tyrant's Vigil",
      enemies: {
        front: [TYRANT, SEALWARD_CUSTODIAN],
        back: [ANTIPHON_ARCHON, EMBERSEED_WARLOCK, CONCORD_CANTOR],
      },
      level: 222,
    },
    {
      id: 'c4-s49',
      name: 'The Hollow Approach',
      enemies: {
        front: [COVENANT_BREAKER, SEALWARD_CUSTODIAN],
        back: [RIFTBORN_HARROWER, ANTIPHON_ARCHON, SERAPH_ADJUDICANT],
      },
      level: 224,
    },
    {
      // ⚠️ The chapter boss, and the second board in the game fielding a block that stands nowhere
      // else. All three of the chapter's pairs come off the Hollow Seraph itself — it wears the
      // pool, it takes the party's setup back and quickens its own board, and its marquee turn is a
      // stun, which is the one thing on the board a cleanse cannot answer. The fourth question is
      // the Custodian in front of it, which is what stops the party choosing to answer the Seraph
      // first.
      //
      // Deliberately **no healing anywhere on it**: three of these five make the party live longer
      // than it can kill, and every one of them is a step toward the ninety-second timeout that is
      // scored as a defeat. What keeps it resolving is that every pool here depletes and nothing
      // puts health back.
      id: 'c4-s50',
      name: 'The Hollow Seraph',
      enemies: {
        front: [HOLLOW_SERAPH, SEALWARD_CUSTODIAN],
        back: [ANTIPHON_ARCHON, RIFTBORN_HARROWER, CONCORD_CANTOR],
      },
      level: 225,
    },
  ],
} as const;
