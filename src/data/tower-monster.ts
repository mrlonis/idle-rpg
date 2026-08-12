import {
  ACOLYTE,
  ASHEN_CHOIR,
  BANDIT,
  BARROW_SOVEREIGN,
  BLOODPACT_FIEND,
  BOAR,
  BULWARK_ENEMY,
  CINDERLING,
  COLOSSUS,
  DEEPROCK_MINER,
  FORGE_THRALL,
  FREE_BLADE,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  OATHBREAKER,
  PYRE,
  RADIANT_HERALD,
  RAVAGER,
  REVENANT,
  RIMEPLATE,
  RUNEWARDEN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  THORNLING,
  THORNWEALD_WARDEN,
  TYRANT,
  WARDEN,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * The Monster Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## The one tower with no counter-faction lean, and why that *is* its lean
 *
 * Every other tower leans toward the faction that counters the one it admits. Monsters have no
 * such faction, because they have **all of them**: the matrix has the four mortal factions taking
 * five percent back from Monsters, both celestials taking ten, and Monsters hitting each other for
 * ten as well. Countering a Monster five is not a job for one faction, it is what everybody does.
 *
 * So this tower is authored as an **even spread across all seven** rather than a lean, and that is
 * the same decision every other tower makes rather than an exception to it: field what counters the
 * crew. `towers.spec.ts` knows the difference — it reads the counter set off the matrix, sees that
 * every faction is in it, and asserts the spread is genuinely flat instead of asserting a leader.
 *
 * ⚠️ **The mirror control in `towers.balance.ts` does not apply here either.** Rewriting every
 * enemy to `monster` is supposed to switch the matrix off; monster-on-monster is the matrix's one
 * self-edge, so a mirrored Monster Tower is a *harder* board rather than a neutral one. See the
 * grouping in that file.
 *
 * ## What a Monster five is, and what this tower charges it for
 *
 * Monsters trade defence for reach — the deepest raw `atk` in the game on bodies with no healer,
 * carrying leech and a siphon instead. This tower charges that in the two currencies leech cannot
 * pay: **damage it cannot return** (a Cinder Storm, a Pillar of Light, a Sevenfold Hex) and
 * **turns**, because a Monster with no turn heals for nothing.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_MONSTER = {
  id: 'tower-monster',
  name: 'Monster Tower',
  faction: 'monster',
  /**
   * Open at the auto-battle unlock, exactly as the Human Tower is.
   *
   * ⚠️ **All seven towers open together, and that is a decision rather than an oversight.**
   * Which tower a run enters is meant to be settled by who it owns, not by where the ladder has
   * carried it — staggering these would gate a player holding five of one faction behind clears
   * that have nothing to do with them. Authored rather than read off
   * `AUTO_BATTLE_UNLOCK_CHAPTERS`, because these are two decisions that agree rather than one
   * fact stated twice; `towers.spec.ts` is what holds the agreement.
   */
  unlockClears: 10,
  floors: [
    // -------------------------------------------------------------------------------------
    // The Open Field — Floors 1–12, levels 1–8 — one of everything, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f1',
      name: 'Floor 1',
      enemies: { front: [BLOODPACT_FIEND], back: [BANDIT] },
    },
    {
      id: 't-monster-f2',
      name: 'Floor 2',
      enemies: { front: [FREE_BLADE], back: [WISP, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f3',
      name: 'Floor 3',
      enemies: { front: [REVENANT], back: [SLIME, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f4',
      name: 'Floor 4',
      enemies: { front: [SLIME, FREE_BLADE], back: [DEEPROCK_MINER, WISP] },
    },
    {
      id: 't-monster-f5',
      name: 'Floor 5',
      enemies: { front: [SLIME], back: [LUMEN_ACOLYTE, CINDERLING] },
    },
    {
      id: 't-monster-f6',
      name: 'Floor 6',
      enemies: { front: [FORGE_THRALL, REVENANT], back: [BOAR, SLIME] },
    },
    {
      id: 't-monster-f7',
      name: 'Floor 7',
      enemies: { front: [BLOODPACT_FIEND], back: [WISP, LUMEN_ACOLYTE, CINDERLING] },
    },
    {
      id: 't-monster-f8',
      name: 'Floor 8',
      enemies: { front: [FORGE_THRALL, BOAR], back: [WISP, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f9',
      name: 'Floor 9',
      enemies: { front: [BLOODPACT_FIEND], back: [GLADE_STALKER] },
    },
    {
      id: 't-monster-f10',
      name: 'Floor 10 — The Open Field',
      enemies: { front: [GILDED_SENTRY, REVENANT], back: [WISP, CINDERLING, BANDIT] },
    },
    {
      id: 't-monster-f11',
      name: 'Floor 11',
      enemies: { front: [GILDED_SENTRY], back: [CINDERLING, GLADE_STALKER] },
    },
    {
      id: 't-monster-f12',
      name: 'Floor 12',
      enemies: { front: [SLIME, THORNLING], back: [CINDERLING, LUMEN_ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Seven Banners — Floors 13–28, levels 8–17 — the locks arrive, one faction at a time, and never twice in a row.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f13',
      name: 'Floor 13',
      enemies: { front: [GOLEM, FREE_BLADE], back: [SLIME, SHADE] },
    },
    {
      id: 't-monster-f14',
      name: 'Floor 14',
      enemies: { front: [BLOODPACT_FIEND, FREE_BLADE], back: [SHADE, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f15',
      name: 'Floor 15',
      enemies: { front: [GILDED_SENTRY, THORNWEALD_WARDEN], back: [SHADE, HAG, ACOLYTE] },
    },
    {
      id: 't-monster-f16',
      name: 'Floor 16',
      enemies: { front: [GILDED_SENTRY, REVENANT], back: [DEEPROCK_MINER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f17',
      name: 'Floor 17',
      enemies: { front: [FREE_BLADE, REVENANT], back: [SHADE, SKYSHRIKE, PYRE] },
    },
    {
      id: 't-monster-f18',
      name: 'Floor 18',
      enemies: { front: [FREE_BLADE, BOAR], back: [PYRE, SHADE] },
    },
    {
      id: 't-monster-f19',
      name: 'Floor 19',
      enemies: { front: [BOAR, BLOODPACT_FIEND], back: [LUMEN_ACOLYTE, SKYSHRIKE, HAG] },
    },
    {
      id: 't-monster-f20',
      name: 'Floor 20 — The Seven Banners',
      enemies: { front: [BULWARK_ENEMY, THORNWEALD_WARDEN], back: [ACOLYTE, HAG, SHADE] },
    },
    {
      id: 't-monster-f21',
      name: 'Floor 21',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [SKYSHRIKE, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f22',
      name: 'Floor 22',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [ACOLYTE, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f23',
      name: 'Floor 23',
      enemies: { front: [REVENANT, GOLEM], back: [SHADE, SLIME] },
    },
    {
      id: 't-monster-f24',
      name: 'Floor 24',
      enemies: { front: [BOAR, REVENANT], back: [HAG, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f25',
      name: 'Floor 25',
      enemies: { front: [GOLEM, GILDED_SENTRY], back: [SHADE, ACOLYTE, SKYSHRIKE] },
    },
    {
      id: 't-monster-f26',
      name: 'Floor 26',
      enemies: { front: [FREE_BLADE, GOLEM], back: [HAG, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f27',
      name: 'Floor 27',
      enemies: { front: [BULWARK_ENEMY, FREE_BLADE], back: [PYRE, SKYSHRIKE, ACOLYTE] },
    },
    {
      id: 't-monster-f28',
      name: 'Floor 28',
      enemies: { front: [BLOODPACT_FIEND, GILDED_SENTRY], back: [SLIME, SKYSHRIKE] },
    },

    // -------------------------------------------------------------------------------------
    // The Hunters Above — Floors 29–48, levels 18–29 — the sharp questions, and every faction asking a different one.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f29',
      name: 'Floor 29',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SHADE, HEXBOUND_TORMENTOR, GOLEM] },
    },
    {
      id: 't-monster-f30',
      name: 'Floor 30 — The Hunters Above',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [STORMCALLER, MOONSONG_WEAVER, GOLEM] },
    },
    {
      id: 't-monster-f31',
      name: 'Floor 31',
      enemies: { front: [RUNEWARDEN, SENTINEL], back: [HEXBOUND_TORMENTOR, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f32',
      name: 'Floor 32',
      enemies: { front: [ASHEN_CHOIR, WRATHBORN], back: [SHADE, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-monster-f33',
      name: 'Floor 33',
      enemies: { front: [WRATHBORN, GOLEM], back: [HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f34',
      name: 'Floor 34',
      enemies: { front: [GOLEM, RIMEPLATE], back: [SHADE, STORMCALLER, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-monster-f35',
      name: 'Floor 35',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [ACOLYTE, HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f36',
      name: 'Floor 36',
      enemies: { front: [SENTINEL, GOLEM], back: [SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-monster-f37',
      name: 'Floor 37',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [SERAPH_ADJUDICANT, GOLEM, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f38',
      name: 'Floor 38',
      enemies: { front: [WRATHBORN, SENTINEL], back: [GOLEM, SKYSHRIKE] },
    },
    {
      id: 't-monster-f39',
      name: 'Floor 39',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [SHADE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f40',
      name: 'Floor 40 — The Hunters Above',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [STORMCALLER, MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f41',
      name: 'Floor 41',
      enemies: { front: [SENTINEL, ASHEN_CHOIR], back: [SHADE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f42',
      name: 'Floor 42',
      enemies: { front: [SENTINEL, GOLEM], back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-monster-f43',
      name: 'Floor 43',
      enemies: { front: [RUNEWARDEN, WRATHBORN], back: [STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f44',
      name: 'Floor 44',
      enemies: {
        front: [SENTINEL, GOLEM],
        back: [MOONSONG_WEAVER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f45',
      name: 'Floor 45',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [SKYSHRIKE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, GOLEM], back: [HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f47',
      name: 'Floor 47',
      enemies: {
        front: [GOLEM, WRATHBORN],
        back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f48',
      name: 'Floor 48',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [HEXBOUND_TORMENTOR, GOLEM] },
    },

    // -------------------------------------------------------------------------------------
    // The Ring of Spears — Floors 49–68, levels 30–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f49',
      name: 'Floor 49',
      enemies: {
        front: [HEADSMAN, SENTINEL],
        back: [HEXBOUND_TORMENTOR, RADIANT_HERALD, STORMCALLER],
      },
    },
    {
      id: 't-monster-f50',
      name: 'Floor 50 — The Ring of Spears',
      enemies: { front: [SENTINEL, HEADSMAN], back: [STORMCALLER, HIEROPHANT, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f51',
      name: 'Floor 51',
      enemies: {
        front: [RUNEWARDEN, THORNWEALD_WARDEN],
        back: [HEXBOUND_TORMENTOR, STORMCALLER, RAVAGER],
      },
    },
    {
      id: 't-monster-f52',
      name: 'Floor 52',
      enemies: {
        front: [THORNWEALD_WARDEN, WRATHBORN],
        back: [SERAPH_ADJUDICANT, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-monster-f53',
      name: 'Floor 53',
      enemies: {
        front: [HEADSMAN, RIMEPLATE],
        back: [HIEROPHANT, RADIANT_HERALD, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f54',
      name: 'Floor 54',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f55',
      name: 'Floor 55',
      enemies: {
        front: [ASHEN_CHOIR, RAVAGER],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },
    {
      id: 't-monster-f56',
      name: 'Floor 56',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },
    {
      id: 't-monster-f57',
      name: 'Floor 57',
      enemies: { front: [ASHEN_CHOIR, RIMEPLATE], back: [RADIANT_HERALD, HIEROPHANT, STORMCALLER] },
    },
    {
      id: 't-monster-f58',
      name: 'Floor 58',
      enemies: { front: [THORNWEALD_WARDEN, WRATHBORN], back: [RAVAGER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f59',
      name: 'Floor 59',
      enemies: {
        front: [HEADSMAN, RUNEWARDEN],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, RAVAGER],
      },
    },
    {
      id: 't-monster-f60',
      name: 'Floor 60 — The Ring of Spears',
      enemies: { front: [SENTINEL, HEADSMAN], back: [STORMCALLER, HIEROPHANT, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f61',
      name: 'Floor 61',
      enemies: {
        front: [RIMEPLATE, RAVAGER],
        back: [STORMCALLER, MOONSONG_WEAVER, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f62',
      name: 'Floor 62',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-monster-f63',
      name: 'Floor 63',
      enemies: {
        front: [ASHEN_CHOIR, HEADSMAN],
        back: [STORMCALLER, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f64',
      name: 'Floor 64',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [HEADSMAN, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f65',
      name: 'Floor 65',
      enemies: { front: [RAVAGER, WRATHBORN], back: [HEADSMAN, RADIANT_HERALD, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f66',
      name: 'Floor 66',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f67',
      name: 'Floor 67',
      enemies: {
        front: [RUNEWARDEN, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f68',
      name: 'Floor 68',
      enemies: {
        front: [RUNEWARDEN, HEADSMAN],
        back: [HIEROPHANT, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Circling Gate — Floors 69–84, levels 42–51 — an ascended block anchors every front rank, and never the same one twice running.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f69',
      name: 'Floor 69',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [HEADSMAN, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f70',
      name: 'Floor 70 — The Circling Gate',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [STORMCALLER, HIEROPHANT, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f71',
      name: 'Floor 71',
      enemies: {
        front: [OATHBREAKER, TYRANT],
        back: [RIMEPLATE, HEXBOUND_TORMENTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f72',
      name: 'Floor 72',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [HEXBOUND_TORMENTOR, MOONSONG_WEAVER, RIMEPLATE],
      },
    },
    {
      id: 't-monster-f73',
      name: 'Floor 73',
      enemies: {
        front: [WYRDROOT_ANCIENT, TYRANT],
        back: [RIMEPLATE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f74',
      name: 'Floor 74',
      enemies: { front: [HIEROPHANT, COLOSSUS], back: [MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-monster-f75',
      name: 'Floor 75',
      enemies: {
        front: [BARROW_SOVEREIGN, HIEROPHANT],
        back: [STORMCALLER, RIMEPLATE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f76',
      name: 'Floor 76',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [HEXBOUND_TORMENTOR, HEADSMAN, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f77',
      name: 'Floor 77',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [ACOLYTE, STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f78',
      name: 'Floor 78',
      enemies: { front: [WARDEN, WYRDROOT_ANCIENT], back: [RIMEPLATE, HEADSMAN] },
    },
    {
      id: 't-monster-f79',
      name: 'Floor 79',
      enemies: {
        front: [BARROW_SOVEREIGN, COLOSSUS],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f80',
      name: 'Floor 80 — The Circling Gate',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [STORMCALLER, HIEROPHANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f81',
      name: 'Floor 81',
      enemies: { front: [TYRANT, HIEROPHANT], back: [STORMCALLER, HEADSMAN, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f82',
      name: 'Floor 82',
      enemies: { front: [WARDEN, COLOSSUS], back: [HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-monster-f83',
      name: 'Floor 83',
      enemies: {
        front: [WARDEN, HIEROPHANT],
        back: [STORMCALLER, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f84',
      name: 'Floor 84',
      enemies: {
        front: [BARROW_SOVEREIGN, WYRDROOT_ANCIENT],
        back: [RADIANT_HERALD, MOONSONG_WEAVER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Last Banner — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, drawn from every faction that hunts Monsters, which is all of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f85',
      name: 'Floor 85',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-monster-f86',
      name: 'Floor 86',
      enemies: {
        front: [WARDEN, HIEROPHANT],
        back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT, RIMEPLATE],
      },
    },
    {
      id: 't-monster-f87',
      name: 'Floor 87',
      enemies: {
        front: [OATHBREAKER, RUNEWARDEN],
        back: [HEXBOUND_TORMENTOR, HEADSMAN, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f88',
      name: 'Floor 88',
      enemies: {
        front: [OATHBREAKER, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-monster-f89',
      name: 'Floor 89',
      enemies: {
        front: [ASHEN_CHOIR, OATHBREAKER],
        back: [STORMCALLER, RIMEPLATE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f90',
      name: 'Floor 90 — The Last Banner',
      enemies: {
        front: [OATHBREAKER, HIEROPHANT],
        back: [STORMCALLER, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-monster-f91',
      name: 'Floor 91',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, STORMCALLER],
      },
    },
    {
      id: 't-monster-f92',
      name: 'Floor 92',
      enemies: {
        front: [HIEROPHANT, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-monster-f93',
      name: 'Floor 93',
      enemies: {
        front: [RUNEWARDEN, OATHBREAKER],
        back: [RIMEPLATE, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f94',
      name: 'Floor 94',
      enemies: {
        front: [RUNEWARDEN, WARDEN],
        back: [HEADSMAN, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f95',
      name: 'Floor 95',
      enemies: {
        front: [OATHBREAKER, WARDEN],
        back: [MOONSONG_WEAVER, HEXBOUND_TORMENTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f96',
      name: 'Floor 96',
      enemies: {
        front: [ASHEN_CHOIR, OATHBREAKER],
        back: [MOONSONG_WEAVER, RADIANT_HERALD, STORMCALLER],
      },
    },
    {
      id: 't-monster-f97',
      name: 'Floor 97',
      enemies: {
        front: [WYRDROOT_ANCIENT, WARDEN],
        back: [HEXBOUND_TORMENTOR, RIMEPLATE, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f98',
      name: 'Floor 98',
      enemies: { front: [ASHEN_CHOIR, RUNEWARDEN], back: [RIMEPLATE, RADIANT_HERALD, STORMCALLER] },
    },
    {
      id: 't-monster-f99',
      name: 'Floor 99',
      enemies: { front: [WARDEN, OATHBREAKER], back: [STORMCALLER, HEADSMAN, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f100',
      name: 'Floor 100 — The Whole Field',
      enemies: {
        front: [OATHBREAKER, WYRDROOT_ANCIENT],
        back: [HIEROPHANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },
  ],
} as const;
