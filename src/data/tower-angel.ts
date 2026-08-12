import {
  ASHEN_CHOIR,
  BARROW_SOVEREIGN,
  BLOODPACT_FIEND,
  BOAR,
  CINDERLING,
  COLOSSUS,
  DEEPROCK_MINER,
  FORGE_THRALL,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  PYRE,
  RADIANT_HERALD,
  REVENANT,
  RIMEPLATE,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  STORMCALLER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNMADE,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * The Angel Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## Why the enemies are mostly Demons
 *
 * Demons are the one faction that hits an Angel back. Everything mortal takes ten percent more from
 * a celestial with nothing coming the other way, and Monsters take ten and return five — so the
 * only board that trades evenly with an Angel five is the other celestial's. That makes the lean
 * here sharper than a mortal tower's rather than looser: about half the slots are Demon, because
 * the alternative is a hundred floors the crew is favoured on.
 *
 * ⚠️ **A celestial tower cannot out-cost its own mirror, and `towers.balance.ts` asserts that
 * inversion rather than working around it.** An all-Angel board would deny the crew the ten percent
 * it gets against everything mortal, which makes the mirror the *hardest* configuration this tower
 * has. That is the celestial advantage `combat.ts` documents, paid for on the luck-only ascension
 * ladder rather than here.
 *
 * ## What an Angel five is, and what this tower charges it for
 *
 * Angels are the game's support faction — four of the seven heal or shield, and the five a player
 * actually fields is slower to kill anything than any mortal line-up. So this tower does not try to
 * out-heal them, it tries to **out-last their clock**: a Wrathborn that gets worse as it dies, a
 * Sevenfold Hex that charges twice for a cleanse, and an Unmade at the top that has to be killed
 * rather than survived.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_ANGEL = {
  id: 'tower-angel',
  name: 'Angel Tower',
  faction: 'angel',
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
    // The Ember Gate — Floors 1–12, levels 1–8 — imps and fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f1',
      name: 'Floor 1',
      enemies: { front: [REVENANT], back: [CINDERLING] },
    },
    {
      id: 't-angel-f2',
      name: 'Floor 2',
      enemies: { front: [CINDERLING], back: [WISP, BLOODPACT_FIEND] },
    },
    {
      id: 't-angel-f3',
      name: 'Floor 3',
      enemies: { front: [BOAR], back: [CINDERLING, BLOODPACT_FIEND] },
    },
    {
      id: 't-angel-f4',
      name: 'Floor 4',
      enemies: { front: [BLOODPACT_FIEND, CINDERLING], back: [THORNLING, WISP] },
    },
    {
      id: 't-angel-f5',
      name: 'Floor 5',
      enemies: { front: [BLOODPACT_FIEND], back: [CINDERLING, WISP] },
    },
    {
      id: 't-angel-f6',
      name: 'Floor 6',
      enemies: { front: [CINDERLING, BLOODPACT_FIEND], back: [THORNLING, LUMEN_ACOLYTE] },
    },
    {
      id: 't-angel-f7',
      name: 'Floor 7',
      enemies: { front: [BLOODPACT_FIEND], back: [THORNLING, CINDERLING, DEEPROCK_MINER] },
    },
    {
      id: 't-angel-f8',
      name: 'Floor 8',
      enemies: { front: [BOAR, CINDERLING], back: [WISP, DEEPROCK_MINER] },
    },
    {
      id: 't-angel-f9',
      name: 'Floor 9',
      enemies: { front: [BOAR], back: [CINDERLING] },
    },
    {
      id: 't-angel-f10',
      name: 'Floor 10 — The Ember Gate',
      enemies: { front: [BLOODPACT_FIEND, CINDERLING], back: [WISP, BOAR, THORNLING] },
    },
    {
      id: 't-angel-f11',
      name: 'Floor 11',
      enemies: { front: [BLOODPACT_FIEND], back: [CINDERLING, LUMEN_ACOLYTE] },
    },
    {
      id: 't-angel-f12',
      name: 'Floor 12',
      enemies: { front: [BOAR, BLOODPACT_FIEND], back: [CINDERLING, THORNLING] },
    },

    // -------------------------------------------------------------------------------------
    // The Cinder Choir — Floors 13–28, levels 8–17 — the locks arrive: a wide magical wave, an evasion wall, and two hexes at once.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f13',
      name: 'Floor 13',
      enemies: { front: [FORGE_THRALL, BLOODPACT_FIEND], back: [HAG, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f14',
      name: 'Floor 14',
      enemies: { front: [REVENANT, BLOODPACT_FIEND], back: [CINDERLING, SHADE, PYRE] },
    },
    {
      id: 't-angel-f15',
      name: 'Floor 15',
      enemies: { front: [GOLEM, BLOODPACT_FIEND], back: [CINDERLING, PYRE, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f16',
      name: 'Floor 16',
      enemies: { front: [FORGE_THRALL, GOLEM], back: [CINDERLING, GLADE_STALKER] },
    },
    {
      id: 't-angel-f17',
      name: 'Floor 17',
      enemies: {
        front: [BLOODPACT_FIEND, FORGE_THRALL],
        back: [HEXBOUND_TORMENTOR, GLADE_STALKER, CINDERLING],
      },
    },
    {
      id: 't-angel-f18',
      name: 'Floor 18',
      enemies: { front: [BLOODPACT_FIEND, CINDERLING], back: [PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-angel-f19',
      name: 'Floor 19',
      enemies: { front: [GOLEM, CINDERLING], back: [PYRE, HAG, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f20',
      name: 'Floor 20 — The Cinder Choir',
      enemies: { front: [GOLEM, BLOODPACT_FIEND], back: [PYRE, HEXBOUND_TORMENTOR, CINDERLING] },
    },
    {
      id: 't-angel-f21',
      name: 'Floor 21',
      enemies: { front: [CINDERLING, BLOODPACT_FIEND], back: [HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f22',
      name: 'Floor 22',
      enemies: { front: [GOLEM, FORGE_THRALL], back: [HAG, CINDERLING, PYRE] },
    },
    {
      id: 't-angel-f23',
      name: 'Floor 23',
      enemies: { front: [FORGE_THRALL, REVENANT], back: [SHADE, PYRE] },
    },
    {
      id: 't-angel-f24',
      name: 'Floor 24',
      enemies: { front: [FORGE_THRALL, REVENANT], back: [PYRE, CINDERLING, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f25',
      name: 'Floor 25',
      enemies: {
        front: [BLOODPACT_FIEND, CINDERLING],
        back: [GLADE_STALKER, SHADE, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-angel-f26',
      name: 'Floor 26',
      enemies: { front: [BLOODPACT_FIEND, REVENANT], back: [CINDERLING, GLADE_STALKER] },
    },
    {
      id: 't-angel-f27',
      name: 'Floor 27',
      enemies: { front: [BLOODPACT_FIEND, GOLEM], back: [CINDERLING, HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f28',
      name: 'Floor 28',
      enemies: { front: [BLOODPACT_FIEND, REVENANT], back: [LUMEN_ACOLYTE, HEXBOUND_TORMENTOR] },
    },

    // -------------------------------------------------------------------------------------
    // The Wrathfall — Floors 29–48, levels 18–29 — the escalation lock, and armour that stops answering the question.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f29',
      name: 'Floor 29',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [HEXBOUND_TORMENTOR, PYRE, SKYSHRIKE] },
    },
    {
      id: 't-angel-f30',
      name: 'Floor 30 — The Wrathfall',
      enemies: { front: [WRATHBORN, RIMEPLATE], back: [PYRE, HEXBOUND_TORMENTOR, CINDERLING] },
    },
    {
      id: 't-angel-f31',
      name: 'Floor 31',
      enemies: { front: [GILDED_SENTRY, WRATHBORN], back: [HEXBOUND_TORMENTOR, RADIANT_HERALD] },
    },
    {
      id: 't-angel-f32',
      name: 'Floor 32',
      enemies: {
        front: [RIMEPLATE, BLOODPACT_FIEND],
        back: [PYRE, HEXBOUND_TORMENTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-angel-f33',
      name: 'Floor 33',
      enemies: { front: [WRATHBORN, GILDED_SENTRY], back: [PYRE, SHADE] },
    },
    {
      id: 't-angel-f34',
      name: 'Floor 34',
      enemies: { front: [GILDED_SENTRY, WRATHBORN], back: [PYRE, STORMCALLER, CINDERLING] },
    },
    {
      id: 't-angel-f35',
      name: 'Floor 35',
      enemies: { front: [WRATHBORN, RIMEPLATE], back: [SKYSHRIKE, CINDERLING, PYRE] },
    },
    {
      id: 't-angel-f36',
      name: 'Floor 36',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [SKYSHRIKE, SHADE] },
    },
    {
      id: 't-angel-f37',
      name: 'Floor 37',
      enemies: { front: [RIMEPLATE, FORGE_THRALL], back: [STORMCALLER, HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-angel-f38',
      name: 'Floor 38',
      enemies: { front: [WRATHBORN, GILDED_SENTRY], back: [PYRE, RADIANT_HERALD] },
    },
    {
      id: 't-angel-f39',
      name: 'Floor 39',
      enemies: {
        front: [FORGE_THRALL, WRATHBORN],
        back: [HEXBOUND_TORMENTOR, CINDERLING, STORMCALLER],
      },
    },
    {
      id: 't-angel-f40',
      name: 'Floor 40 — The Wrathfall',
      enemies: { front: [WRATHBORN, RIMEPLATE], back: [PYRE, HEXBOUND_TORMENTOR, CINDERLING] },
    },
    {
      id: 't-angel-f41',
      name: 'Floor 41',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f42',
      name: 'Floor 42',
      enemies: {
        front: [BLOODPACT_FIEND, RIMEPLATE],
        back: [SKYSHRIKE, HEXBOUND_TORMENTOR, STORMCALLER],
      },
    },
    {
      id: 't-angel-f43',
      name: 'Floor 43',
      enemies: { front: [RIMEPLATE, BLOODPACT_FIEND], back: [PYRE, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f44',
      name: 'Floor 44',
      enemies: {
        front: [BLOODPACT_FIEND, WRATHBORN],
        back: [SKYSHRIKE, HEXBOUND_TORMENTOR, CINDERLING],
      },
    },
    {
      id: 't-angel-f45',
      name: 'Floor 45',
      enemies: { front: [BLOODPACT_FIEND, GILDED_SENTRY], back: [SHADE, HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f46',
      name: 'Floor 46',
      enemies: { front: [BLOODPACT_FIEND, GILDED_SENTRY], back: [STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-angel-f47',
      name: 'Floor 47',
      enemies: { front: [RIMEPLATE, GILDED_SENTRY], back: [HEXBOUND_TORMENTOR, CINDERLING, PYRE] },
    },
    {
      id: 't-angel-f48',
      name: 'Floor 48',
      enemies: { front: [BLOODPACT_FIEND, HEADSMAN], back: [HEXBOUND_TORMENTOR, PYRE] },
    },

    // -------------------------------------------------------------------------------------
    // The Long Burning — Floors 49–68, levels 30–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f49',
      name: 'Floor 49',
      enemies: { front: [BLOODPACT_FIEND, HEADSMAN], back: [STORMCALLER, MOONSONG_WEAVER, SHADE] },
    },
    {
      id: 't-angel-f50',
      name: 'Floor 50 — The Long Burning',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [HEXBOUND_TORMENTOR, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f51',
      name: 'Floor 51',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [SHADE, HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f52',
      name: 'Floor 52',
      enemies: { front: [ASHEN_CHOIR, WRATHBORN], back: [HEADSMAN, HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-angel-f53',
      name: 'Floor 53',
      enemies: {
        front: [THORNWEALD_WARDEN, ASHEN_CHOIR],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, PYRE],
      },
    },
    {
      id: 't-angel-f54',
      name: 'Floor 54',
      enemies: { front: [RIMEPLATE, WRATHBORN], back: [RADIANT_HERALD, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f55',
      name: 'Floor 55',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [RADIANT_HERALD, STORMCALLER, SHADE] },
    },
    {
      id: 't-angel-f56',
      name: 'Floor 56',
      enemies: { front: [RIMEPLATE, WRATHBORN], back: [MOONSONG_WEAVER, HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f57',
      name: 'Floor 57',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [SHADE, STORMCALLER, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f58',
      name: 'Floor 58',
      enemies: { front: [HEADSMAN, ASHEN_CHOIR], back: [SHADE, PYRE] },
    },
    {
      id: 't-angel-f59',
      name: 'Floor 59',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [HEXBOUND_TORMENTOR, SHADE, PYRE] },
    },
    {
      id: 't-angel-f60',
      name: 'Floor 60 — The Long Burning',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [HEXBOUND_TORMENTOR, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f61',
      name: 'Floor 61',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [SHADE, STORMCALLER, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f62',
      name: 'Floor 62',
      enemies: { front: [ASHEN_CHOIR, RIMEPLATE], back: [HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-angel-f63',
      name: 'Floor 63',
      enemies: { front: [WRATHBORN, RIMEPLATE], back: [SHADE, HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f64',
      name: 'Floor 64',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [PYRE, HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-angel-f65',
      name: 'Floor 65',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [SHADE, PYRE, RADIANT_HERALD] },
    },
    {
      id: 't-angel-f66',
      name: 'Floor 66',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [STORMCALLER, PYRE] },
    },
    {
      id: 't-angel-f67',
      name: 'Floor 67',
      enemies: {
        front: [WRATHBORN, BLOODPACT_FIEND],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, SHADE],
      },
    },
    {
      id: 't-angel-f68',
      name: 'Floor 68',
      enemies: { front: [WRATHBORN, RIMEPLATE], back: [PYRE, HEXBOUND_TORMENTOR, RADIANT_HERALD] },
    },

    // -------------------------------------------------------------------------------------
    // The Unmaking — Floors 69–84, levels 42–51 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f69',
      name: 'Floor 69',
      enemies: { front: [COLOSSUS, UNMADE], back: [HEXBOUND_TORMENTOR, PYRE, RADIANT_HERALD] },
    },
    {
      id: 't-angel-f70',
      name: 'Floor 70 — The Unmaking',
      enemies: { front: [UNMADE, WRATHBORN], back: [HEXBOUND_TORMENTOR, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f71',
      name: 'Floor 71',
      enemies: { front: [UNMADE, COLOSSUS], back: [MOONSONG_WEAVER, PYRE, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f72',
      name: 'Floor 72',
      enemies: {
        front: [WRATHBORN, BARROW_SOVEREIGN],
        back: [PYRE, HEXBOUND_TORMENTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f73',
      name: 'Floor 73',
      enemies: { front: [WRATHBORN, UNMADE], back: [HEXBOUND_TORMENTOR, HEADSMAN, PYRE] },
    },
    {
      id: 't-angel-f74',
      name: 'Floor 74',
      enemies: { front: [UNMADE, COLOSSUS], back: [HEXBOUND_TORMENTOR, PYRE] },
    },
    {
      id: 't-angel-f75',
      name: 'Floor 75',
      enemies: {
        front: [BARROW_SOVEREIGN, HIEROPHANT],
        back: [HEXBOUND_TORMENTOR, PYRE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f76',
      name: 'Floor 76',
      enemies: {
        front: [WRATHBORN, UNMADE],
        back: [STORMCALLER, HEXBOUND_TORMENTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f77',
      name: 'Floor 77',
      enemies: { front: [WRATHBORN, HIEROPHANT], back: [STORMCALLER, RADIANT_HERALD, PYRE] },
    },
    {
      id: 't-angel-f78',
      name: 'Floor 78',
      enemies: { front: [UNMADE, WRATHBORN], back: [HEXBOUND_TORMENTOR, MOONSONG_WEAVER] },
    },
    {
      id: 't-angel-f79',
      name: 'Floor 79',
      enemies: {
        front: [WYRDROOT_ANCIENT, WRATHBORN],
        back: [HEADSMAN, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-angel-f80',
      name: 'Floor 80 — The Unmaking',
      enemies: { front: [UNMADE, WRATHBORN], back: [HEXBOUND_TORMENTOR, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f81',
      name: 'Floor 81',
      enemies: { front: [UNMADE, COLOSSUS], back: [MOONSONG_WEAVER, PYRE, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f82',
      name: 'Floor 82',
      enemies: { front: [WRATHBORN, UNMADE], back: [HEXBOUND_TORMENTOR, STORMCALLER] },
    },
    {
      id: 't-angel-f83',
      name: 'Floor 83',
      enemies: { front: [WRATHBORN, BARROW_SOVEREIGN], back: [PYRE, HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-angel-f84',
      name: 'Floor 84',
      enemies: {
        front: [BARROW_SOVEREIGN, UNMADE],
        back: [HEXBOUND_TORMENTOR, PYRE, MOONSONG_WEAVER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Black Stair — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Unmade waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f85',
      name: 'Floor 85',
      enemies: { front: [WRATHBORN, HEXBOUND_TORMENTOR], back: [STORMCALLER, HEADSMAN, PYRE] },
    },
    {
      id: 't-angel-f86',
      name: 'Floor 86',
      enemies: { front: [HEXBOUND_TORMENTOR, WRATHBORN], back: [STORMCALLER, PYRE, HEADSMAN] },
    },
    {
      id: 't-angel-f87',
      name: 'Floor 87',
      enemies: {
        front: [HEXBOUND_TORMENTOR, UNMADE],
        back: [RADIANT_HERALD, STORMCALLER, HEADSMAN],
      },
    },
    {
      id: 't-angel-f88',
      name: 'Floor 88',
      enemies: { front: [UNMADE, WRATHBORN], back: [PYRE, HEXBOUND_TORMENTOR, RADIANT_HERALD] },
    },
    {
      id: 't-angel-f89',
      name: 'Floor 89',
      enemies: { front: [HEXBOUND_TORMENTOR, WRATHBORN], back: [HEADSMAN, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f90',
      name: 'Floor 90 — The Black Stair',
      enemies: { front: [UNMADE, COLOSSUS], back: [HEXBOUND_TORMENTOR, PYRE, HEADSMAN] },
    },
    {
      id: 't-angel-f91',
      name: 'Floor 91',
      enemies: {
        front: [UNMADE, HEXBOUND_TORMENTOR],
        back: [PYRE, MOONSONG_WEAVER, RADIANT_HERALD],
      },
    },
    {
      id: 't-angel-f92',
      name: 'Floor 92',
      enemies: {
        front: [WRATHBORN, HEXBOUND_TORMENTOR],
        back: [PYRE, STORMCALLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f93',
      name: 'Floor 93',
      enemies: { front: [WRATHBORN, HEXBOUND_TORMENTOR], back: [HEADSMAN, STORMCALLER, PYRE] },
    },
    {
      id: 't-angel-f94',
      name: 'Floor 94',
      enemies: { front: [WRATHBORN, UNMADE], back: [HEXBOUND_TORMENTOR, HEADSMAN, PYRE] },
    },
    {
      id: 't-angel-f95',
      name: 'Floor 95',
      enemies: { front: [BLOODPACT_FIEND, WRATHBORN], back: [MOONSONG_WEAVER, HEADSMAN, PYRE] },
    },
    {
      id: 't-angel-f96',
      name: 'Floor 96',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [PYRE, HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-angel-f97',
      name: 'Floor 97',
      enemies: { front: [WRATHBORN, UNMADE], back: [MOONSONG_WEAVER, PYRE, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-angel-f98',
      name: 'Floor 98',
      enemies: { front: [WRATHBORN, HEXBOUND_TORMENTOR], back: [HEADSMAN, PYRE, STORMCALLER] },
    },
    {
      id: 't-angel-f99',
      name: 'Floor 99',
      enemies: { front: [WRATHBORN, BLOODPACT_FIEND], back: [MOONSONG_WEAVER, STORMCALLER, PYRE] },
    },
    {
      id: 't-angel-f100',
      name: 'Floor 100 — The Unmade',
      enemies: { front: [UNMADE, WRATHBORN], back: [HEXBOUND_TORMENTOR, PYRE, SERAPH_ADJUDICANT] },
    },
  ],
} as const;
