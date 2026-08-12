import {
  ACOLYTE,
  ASHEN_CHOIR,
  BANDIT,
  BARROW_SOVEREIGN,
  BOAR,
  CINDERLING,
  COLOSSUS,
  DEEPROCK_MINER,
  FREE_BLADE,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  RADIANT_HERALD,
  REVENANT,
  RIMEPLATE,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  STORMCALLER,
  UNMADE,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * The Demon Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## Why the enemies are mostly Angels
 *
 * Angels are the one faction that hits a Demon back. Everything mortal takes ten percent more from
 * a celestial with nothing coming the other way, so the only board that trades evenly with a Demon
 * five is the other celestial's — which makes the lean here sharper than a mortal tower's rather
 * than looser. See the mirror of this paragraph in [`tower-angel.ts`](./tower-angel.ts).
 *
 * ⚠️ **A celestial tower cannot out-cost its own mirror, and `towers.balance.ts` asserts that
 * inversion rather than working around it.**
 *
 * ## What a Demon five is, and what this tower charges it for
 *
 * Demons are the glassiest faction in the game — four of the seven are mages, the five a player
 * fields has no real front rank, and the faction's own lineup track opens on `def` precisely
 * because that is the stat it is worst at. So the currency this tower charges in is **incoming
 * damage that does not care what it hits**: a Pillar of Light through the back rank, an Ashen
 * Choir putting a refreshed absorb on the fodder, and a Hierophant at the top that heals and
 * shields from the same turn economy.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_DEMON = {
  id: 'tower-demon',
  name: 'Demon Tower',
  faction: 'demon',
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
    // The Gilded Gate — Floors 1–12, levels 1–8 — motes and sentries, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f1',
      name: 'Floor 1',
      enemies: { front: [GILDED_SENTRY], back: [WISP] },
    },
    {
      id: 't-demon-f2',
      name: 'Floor 2',
      enemies: { front: [FREE_BLADE], back: [LUMEN_ACOLYTE, BANDIT] },
    },
    {
      id: 't-demon-f3',
      name: 'Floor 3',
      enemies: { front: [BOAR], back: [GILDED_SENTRY, BANDIT] },
    },
    {
      id: 't-demon-f4',
      name: 'Floor 4',
      enemies: { front: [GILDED_SENTRY, LUMEN_ACOLYTE], back: [WISP, CINDERLING] },
    },
    {
      id: 't-demon-f5',
      name: 'Floor 5',
      enemies: { front: [FREE_BLADE], back: [BANDIT, GILDED_SENTRY] },
    },
    {
      id: 't-demon-f6',
      name: 'Floor 6',
      enemies: { front: [GILDED_SENTRY, FREE_BLADE], back: [GLADE_STALKER, LUMEN_ACOLYTE] },
    },
    {
      id: 't-demon-f7',
      name: 'Floor 7',
      enemies: { front: [GILDED_SENTRY], back: [LUMEN_ACOLYTE, BANDIT, GLADE_STALKER] },
    },
    {
      id: 't-demon-f8',
      name: 'Floor 8',
      enemies: { front: [BOAR, LUMEN_ACOLYTE], back: [CINDERLING, GILDED_SENTRY] },
    },
    {
      id: 't-demon-f9',
      name: 'Floor 9',
      enemies: { front: [GILDED_SENTRY], back: [LUMEN_ACOLYTE] },
    },
    {
      id: 't-demon-f10',
      name: 'Floor 10 — The Gilded Gate',
      enemies: { front: [GILDED_SENTRY, LUMEN_ACOLYTE], back: [WISP, BOAR, BANDIT] },
    },
    {
      id: 't-demon-f11',
      name: 'Floor 11',
      enemies: { front: [GILDED_SENTRY], back: [LUMEN_ACOLYTE, CINDERLING] },
    },
    {
      id: 't-demon-f12',
      name: 'Floor 12',
      enemies: { front: [LUMEN_ACOLYTE, GILDED_SENTRY], back: [DEEPROCK_MINER, WISP] },
    },

    // -------------------------------------------------------------------------------------
    // The Choir Stair — Floors 13–28, levels 8–17 — the locks arrive: a refreshed absorb on five bodies, a back rank that is not safe, an evasion wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f13',
      name: 'Floor 13',
      enemies: { front: [GOLEM, ASHEN_CHOIR], back: [SERAPH_ADJUDICANT, CINDERLING] },
    },
    {
      id: 't-demon-f14',
      name: 'Floor 14',
      enemies: { front: [GOLEM, ASHEN_CHOIR], back: [RADIANT_HERALD, GLADE_STALKER, ACOLYTE] },
    },
    {
      id: 't-demon-f15',
      name: 'Floor 15',
      enemies: { front: [GILDED_SENTRY, LUMEN_ACOLYTE], back: [SHADE, CINDERLING, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f16',
      name: 'Floor 16',
      enemies: { front: [GOLEM, REVENANT], back: [GLADE_STALKER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-demon-f17',
      name: 'Floor 17',
      enemies: {
        front: [GILDED_SENTRY, GOLEM],
        back: [GLADE_STALKER, LUMEN_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f18',
      name: 'Floor 18',
      enemies: { front: [GOLEM, GILDED_SENTRY], back: [RADIANT_HERALD, GLADE_STALKER] },
    },
    {
      id: 't-demon-f19',
      name: 'Floor 19',
      enemies: {
        front: [GILDED_SENTRY, REVENANT],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-demon-f20',
      name: 'Floor 20 — The Choir Stair',
      enemies: { front: [ASHEN_CHOIR, GOLEM], back: [SERAPH_ADJUDICANT, RADIANT_HERALD, SHADE] },
    },
    {
      id: 't-demon-f21',
      name: 'Floor 21',
      enemies: { front: [ASHEN_CHOIR, REVENANT], back: [SERAPH_ADJUDICANT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-demon-f22',
      name: 'Floor 22',
      enemies: {
        front: [GILDED_SENTRY, ASHEN_CHOIR],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f23',
      name: 'Floor 23',
      enemies: { front: [GOLEM, REVENANT], back: [RADIANT_HERALD, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-demon-f24',
      name: 'Floor 24',
      enemies: {
        front: [GILDED_SENTRY, LUMEN_ACOLYTE],
        back: [RADIANT_HERALD, GLADE_STALKER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f25',
      name: 'Floor 25',
      enemies: {
        front: [ASHEN_CHOIR, REVENANT],
        back: [CINDERLING, SERAPH_ADJUDICANT, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f26',
      name: 'Floor 26',
      enemies: { front: [GILDED_SENTRY, GOLEM], back: [SERAPH_ADJUDICANT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-demon-f27',
      name: 'Floor 27',
      enemies: {
        front: [REVENANT, GOLEM],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f28',
      name: 'Floor 28',
      enemies: { front: [LUMEN_ACOLYTE, REVENANT], back: [RADIANT_HERALD, ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Weighing — Floors 29–48, levels 18–29 — the priority lock, and armour that stops answering the question.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f29',
      name: 'Floor 29',
      enemies: {
        front: [WRATHBORN, GILDED_SENTRY],
        back: [RADIANT_HERALD, LUMEN_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f30',
      name: 'Floor 30 — The Weighing',
      enemies: {
        front: [ASHEN_CHOIR, RIMEPLATE],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-demon-f31',
      name: 'Floor 31',
      enemies: { front: [RIMEPLATE, ASHEN_CHOIR], back: [SHADE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-demon-f32',
      name: 'Floor 32',
      enemies: {
        front: [GILDED_SENTRY, ASHEN_CHOIR],
        back: [STORMCALLER, SERAPH_ADJUDICANT, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f33',
      name: 'Floor 33',
      enemies: { front: [HEADSMAN, ASHEN_CHOIR], back: [LUMEN_ACOLYTE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-demon-f34',
      name: 'Floor 34',
      enemies: {
        front: [REVENANT, ASHEN_CHOIR],
        back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f35',
      name: 'Floor 35',
      enemies: {
        front: [ASHEN_CHOIR, REVENANT],
        back: [STORMCALLER, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f36',
      name: 'Floor 36',
      enemies: { front: [ASHEN_CHOIR, GILDED_SENTRY], back: [HEXBOUND_TORMENTOR, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f37',
      name: 'Floor 37',
      enemies: {
        front: [GILDED_SENTRY, RIMEPLATE],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, STORMCALLER],
      },
    },
    {
      id: 't-demon-f38',
      name: 'Floor 38',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [SERAPH_ADJUDICANT, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f39',
      name: 'Floor 39',
      enemies: {
        front: [GILDED_SENTRY, ASHEN_CHOIR],
        back: [LUMEN_ACOLYTE, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f40',
      name: 'Floor 40 — The Weighing',
      enemies: {
        front: [ASHEN_CHOIR, RIMEPLATE],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, SHADE],
      },
    },
    {
      id: 't-demon-f41',
      name: 'Floor 41',
      enemies: { front: [HEADSMAN, GILDED_SENTRY], back: [SHADE, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f42',
      name: 'Floor 42',
      enemies: {
        front: [WRATHBORN, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-demon-f43',
      name: 'Floor 43',
      enemies: { front: [ASHEN_CHOIR, RIMEPLATE], back: [STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-demon-f44',
      name: 'Floor 44',
      enemies: {
        front: [RIMEPLATE, HEADSMAN],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, STORMCALLER],
      },
    },
    {
      id: 't-demon-f45',
      name: 'Floor 45',
      enemies: {
        front: [RIMEPLATE, WRATHBORN],
        back: [HEXBOUND_TORMENTOR, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f46',
      name: 'Floor 46',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-demon-f47',
      name: 'Floor 47',
      enemies: {
        front: [GILDED_SENTRY, HEADSMAN],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, SHADE],
      },
    },
    {
      id: 't-demon-f48',
      name: 'Floor 48',
      enemies: { front: [ASHEN_CHOIR, GILDED_SENTRY], back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT] },
    },

    // -------------------------------------------------------------------------------------
    // The Long Watch — Floors 49–68, levels 30–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f49',
      name: 'Floor 49',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [MOONSONG_WEAVER, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f50',
      name: 'Floor 50 — The Long Watch',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },
    {
      id: 't-demon-f51',
      name: 'Floor 51',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [STORMCALLER, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f52',
      name: 'Floor 52',
      enemies: {
        front: [ASHEN_CHOIR, GILDED_SENTRY],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, STORMCALLER],
      },
    },
    {
      id: 't-demon-f53',
      name: 'Floor 53',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-demon-f54',
      name: 'Floor 54',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER] },
    },
    {
      id: 't-demon-f55',
      name: 'Floor 55',
      enemies: {
        front: [GILDED_SENTRY, HEADSMAN],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f56',
      name: 'Floor 56',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f57',
      name: 'Floor 57',
      enemies: {
        front: [GILDED_SENTRY, HEADSMAN],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f58',
      name: 'Floor 58',
      enemies: { front: [RIMEPLATE, ASHEN_CHOIR], back: [SERAPH_ADJUDICANT, STORMCALLER] },
    },
    {
      id: 't-demon-f59',
      name: 'Floor 59',
      enemies: {
        front: [SENTINEL, GILDED_SENTRY],
        back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f60',
      name: 'Floor 60 — The Long Watch',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },
    {
      id: 't-demon-f61',
      name: 'Floor 61',
      enemies: {
        front: [ASHEN_CHOIR, GILDED_SENTRY],
        back: [SERAPH_ADJUDICANT, HEADSMAN, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f62',
      name: 'Floor 62',
      enemies: { front: [ASHEN_CHOIR, GILDED_SENTRY], back: [HEADSMAN, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-demon-f63',
      name: 'Floor 63',
      enemies: {
        front: [ASHEN_CHOIR, RIMEPLATE],
        back: [SERAPH_ADJUDICANT, STORMCALLER, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f64',
      name: 'Floor 64',
      enemies: {
        front: [ASHEN_CHOIR, RIMEPLATE],
        back: [STORMCALLER, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f65',
      name: 'Floor 65',
      enemies: { front: [ASHEN_CHOIR, WRATHBORN], back: [HEADSMAN, RADIANT_HERALD, STORMCALLER] },
    },
    {
      id: 't-demon-f66',
      name: 'Floor 66',
      enemies: { front: [ASHEN_CHOIR, SENTINEL], back: [SERAPH_ADJUDICANT, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f67',
      name: 'Floor 67',
      enemies: {
        front: [GILDED_SENTRY, HEADSMAN],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f68',
      name: 'Floor 68',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Radiant Vigil — Floors 69–84, levels 42–51 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f69',
      name: 'Floor 69',
      enemies: {
        front: [HIEROPHANT, BARROW_SOVEREIGN],
        back: [SERAPH_ADJUDICANT, ASHEN_CHOIR, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f70',
      name: 'Floor 70 — The Radiant Vigil',
      enemies: {
        front: [HIEROPHANT, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },
    {
      id: 't-demon-f71',
      name: 'Floor 71',
      enemies: {
        front: [WYRDROOT_ANCIENT, ASHEN_CHOIR],
        back: [RADIANT_HERALD, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f72',
      name: 'Floor 72',
      enemies: {
        front: [HIEROPHANT, UNMADE],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, ASHEN_CHOIR],
      },
    },
    {
      id: 't-demon-f73',
      name: 'Floor 73',
      enemies: {
        front: [ASHEN_CHOIR, WYRDROOT_ANCIENT],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, STORMCALLER],
      },
    },
    {
      id: 't-demon-f74',
      name: 'Floor 74',
      enemies: { front: [ASHEN_CHOIR, HIEROPHANT], back: [SERAPH_ADJUDICANT, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f75',
      name: 'Floor 75',
      enemies: {
        front: [ASHEN_CHOIR, HIEROPHANT],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-demon-f76',
      name: 'Floor 76',
      enemies: {
        front: [UNMADE, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f77',
      name: 'Floor 77',
      enemies: {
        front: [HIEROPHANT, COLOSSUS],
        back: [SERAPH_ADJUDICANT, ASHEN_CHOIR, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f78',
      name: 'Floor 78',
      enemies: { front: [HIEROPHANT, COLOSSUS], back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER] },
    },
    {
      id: 't-demon-f79',
      name: 'Floor 79',
      enemies: {
        front: [UNMADE, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f80',
      name: 'Floor 80 — The Radiant Vigil',
      enemies: {
        front: [HIEROPHANT, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },
    {
      id: 't-demon-f81',
      name: 'Floor 81',
      enemies: {
        front: [ASHEN_CHOIR, UNMADE],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f82',
      name: 'Floor 82',
      enemies: { front: [UNMADE, HIEROPHANT], back: [STORMCALLER, RADIANT_HERALD] },
    },
    {
      id: 't-demon-f83',
      name: 'Floor 83',
      enemies: {
        front: [ASHEN_CHOIR, HIEROPHANT],
        back: [RADIANT_HERALD, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f84',
      name: 'Floor 84',
      enemies: {
        front: [HIEROPHANT, COLOSSUS],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, ASHEN_CHOIR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Gilded Crown — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Hierophant waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f85',
      name: 'Floor 85',
      enemies: {
        front: [HIEROPHANT, ASHEN_CHOIR],
        back: [MOONSONG_WEAVER, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f86',
      name: 'Floor 86',
      enemies: {
        front: [UNMADE, ASHEN_CHOIR],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-demon-f87',
      name: 'Floor 87',
      enemies: {
        front: [COLOSSUS, HIEROPHANT],
        back: [HEADSMAN, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f88',
      name: 'Floor 88',
      enemies: {
        front: [HIEROPHANT, BARROW_SOVEREIGN],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, ASHEN_CHOIR],
      },
    },
    {
      id: 't-demon-f89',
      name: 'Floor 89',
      enemies: {
        front: [HIEROPHANT, UNMADE],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, ASHEN_CHOIR],
      },
    },
    {
      id: 't-demon-f90',
      name: 'Floor 90 — The Gilded Crown',
      enemies: {
        front: [HIEROPHANT, COLOSSUS],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, ASHEN_CHOIR],
      },
    },
    {
      id: 't-demon-f91',
      name: 'Floor 91',
      enemies: {
        front: [HIEROPHANT, COLOSSUS],
        back: [SERAPH_ADJUDICANT, ASHEN_CHOIR, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f92',
      name: 'Floor 92',
      enemies: {
        front: [ASHEN_CHOIR, COLOSSUS],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-demon-f93',
      name: 'Floor 93',
      enemies: { front: [BARROW_SOVEREIGN, UNMADE], back: [RADIANT_HERALD, ASHEN_CHOIR, HEADSMAN] },
    },
    {
      id: 't-demon-f94',
      name: 'Floor 94',
      enemies: {
        front: [ASHEN_CHOIR, COLOSSUS],
        back: [HEADSMAN, RADIANT_HERALD, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f95',
      name: 'Floor 95',
      enemies: {
        front: [HIEROPHANT, UNMADE],
        back: [ASHEN_CHOIR, SERAPH_ADJUDICANT, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f96',
      name: 'Floor 96',
      enemies: {
        front: [ASHEN_CHOIR, COLOSSUS],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f97',
      name: 'Floor 97',
      enemies: {
        front: [ASHEN_CHOIR, BARROW_SOVEREIGN],
        back: [SERAPH_ADJUDICANT, RADIANT_HERALD, HEADSMAN],
      },
    },
    {
      id: 't-demon-f98',
      name: 'Floor 98',
      enemies: {
        front: [COLOSSUS, HIEROPHANT],
        back: [RADIANT_HERALD, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f99',
      name: 'Floor 99',
      enemies: {
        front: [COLOSSUS, UNMADE],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f100',
      name: 'Floor 100 — The Hierophant',
      enemies: {
        front: [HIEROPHANT, COLOSSUS],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, ASHEN_CHOIR],
      },
    },
  ],
} as const;
