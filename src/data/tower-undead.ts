import {
  ACOLYTE,
  ASHEN_CHOIR,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  COLOSSUS,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  PYRE,
  RAVAGER,
  RIMEPLATE,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  THORNLING,
  THORNWEALD_WARDEN,
  WARDEN,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * The Undead Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## Why the enemies are mostly Elven
 *
 * Elves beat the Undead in the matchup cycle, so this is the tower that punishes the crew it
 * admits. About half the slots are Elven and the rest are spread across the other six factions —
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ⚠️ **This is the tower that could not be built before milestone 15c.** Elves had exactly one
 * archetype at the end of 15b, so its lead faction would have been a Sky-Shrike a hundred times —
 * which is the case the whole enemy-authoring half of this milestone exists to answer. Five of the
 * six blocks it leans on are new.
 *
 * ## What an Undead five is, and what this tower charges it for
 *
 * The Undead bargain is tempo bought with their own health, and their sustain is leech rather than
 * a healer — so what breaks them is not a wall but **anything that heals faster than they drain**.
 * A Thornweald Warden's Wilding Bloom is that: a heal with nothing to reach and nothing to kill,
 * which is exactly the question a faction built to out-trade cannot answer by out-trading.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_UNDEAD = {
  id: 'tower-undead',
  name: 'Undead Tower',
  faction: 'undead',
  /**
   * Open at the auto-battle unlock, exactly as the Human Tower is.
   *
   * ⚠️ **All seven towers open together, and that is a decision rather than an oversight.**
   * Which tower a run enters is meant to be settled by who it owns, not by where the ladder has
   * carried it — staggering these would gate a player holding five of one faction behind clears
   * that have nothing to do with them. Authored rather than read off
   * `AUTO_BATTLE_UNLOCK_CLEARS`, because these are two decisions that agree rather than one
   * fact stated twice.
   */
  unlockClears: 12,
  floors: [
    // -------------------------------------------------------------------------------------
    // The Green Gate — Floors 1–12, levels 1–8 — thorns and fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f1',
      name: 'Floor 1',
      enemies: { front: [BOAR], back: [BANDIT] },
    },
    {
      id: 't-undead-f2',
      name: 'Floor 2',
      enemies: { front: [BOAR], back: [THORNLING, BANDIT] },
    },
    {
      id: 't-undead-f3',
      name: 'Floor 3',
      enemies: { front: [THORNLING], back: [LUMEN_ACOLYTE, BANDIT] },
    },
    {
      id: 't-undead-f4',
      name: 'Floor 4',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [LUMEN_ACOLYTE, SLIME] },
    },
    {
      id: 't-undead-f5',
      name: 'Floor 5',
      enemies: { front: [GLADE_STALKER], back: [SLIME, THORNLING] },
    },
    {
      id: 't-undead-f6',
      name: 'Floor 6',
      enemies: { front: [GLADE_STALKER, BOAR], back: [BANDIT, THORNLING] },
    },
    {
      id: 't-undead-f7',
      name: 'Floor 7',
      enemies: { front: [GLADE_STALKER], back: [THORNLING, BANDIT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f8',
      name: 'Floor 8',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [BANDIT, SLIME] },
    },
    {
      id: 't-undead-f9',
      name: 'Floor 9',
      enemies: { front: [GLADE_STALKER], back: [LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f10',
      name: 'Floor 10 — The Green Gate',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [BOAR, SLIME, BANDIT] },
    },
    {
      id: 't-undead-f11',
      name: 'Floor 11',
      enemies: { front: [THORNLING], back: [BANDIT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f12',
      name: 'Floor 12',
      enemies: { front: [BOAR, THORNLING], back: [SLIME, GLADE_STALKER] },
    },

    // -------------------------------------------------------------------------------------
    // The Singing Wood — Floors 13–28, levels 8–17 — the locks arrive: a party-wide slow, a healer with nothing to kill, a back rank that is not safe.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f13',
      name: 'Floor 13',
      enemies: {
        front: [THORNWEALD_WARDEN, BULWARK_ENEMY],
        back: [GLADE_STALKER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f14',
      name: 'Floor 14',
      enemies: {
        front: [THORNWEALD_WARDEN, GLADE_STALKER],
        back: [SKYSHRIKE, MOONSONG_WEAVER, PYRE],
      },
    },
    {
      id: 't-undead-f15',
      name: 'Floor 15',
      enemies: {
        front: [THORNWEALD_WARDEN, THORNLING],
        back: [GLADE_STALKER, LUMEN_ACOLYTE, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f16',
      name: 'Floor 16',
      enemies: { front: [THORNWEALD_WARDEN, GLADE_STALKER], back: [MOONSONG_WEAVER, WISP] },
    },
    {
      id: 't-undead-f17',
      name: 'Floor 17',
      enemies: { front: [GOLEM, GLADE_STALKER], back: [LUMEN_ACOLYTE, SKYSHRIKE, WISP] },
    },
    {
      id: 't-undead-f18',
      name: 'Floor 18',
      enemies: { front: [THORNLING, BULWARK_ENEMY], back: [ACOLYTE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f19',
      name: 'Floor 19',
      enemies: {
        front: [GLADE_STALKER, THORNWEALD_WARDEN],
        back: [LUMEN_ACOLYTE, MOONSONG_WEAVER, WISP],
      },
    },
    {
      id: 't-undead-f20',
      name: 'Floor 20 — The Singing Wood',
      enemies: {
        front: [THORNWEALD_WARDEN, GOLEM],
        back: [MOONSONG_WEAVER, SKYSHRIKE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f21',
      name: 'Floor 21',
      enemies: { front: [GOLEM, BULWARK_ENEMY], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f22',
      name: 'Floor 22',
      enemies: {
        front: [THORNWEALD_WARDEN, GOLEM],
        back: [SKYSHRIKE, MOONSONG_WEAVER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f23',
      name: 'Floor 23',
      enemies: { front: [BULWARK_ENEMY, THORNLING], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f24',
      name: 'Floor 24',
      enemies: { front: [GOLEM, GLADE_STALKER], back: [SKYSHRIKE, ACOLYTE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f25',
      name: 'Floor 25',
      enemies: {
        front: [THORNWEALD_WARDEN, BULWARK_ENEMY],
        back: [GLADE_STALKER, PYRE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f26',
      name: 'Floor 26',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-undead-f27',
      name: 'Floor 27',
      enemies: { front: [GLADE_STALKER, THORNLING], back: [PYRE, SKYSHRIKE, WISP] },
    },
    {
      id: 't-undead-f28',
      name: 'Floor 28',
      enemies: { front: [GOLEM, THORNLING], back: [ACOLYTE, MOONSONG_WEAVER] },
    },

    // -------------------------------------------------------------------------------------
    // The Thornfall — Floors 29–48, levels 18–29 — a wall that regrows, and every lock met in combination.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f29',
      name: 'Floor 29',
      enemies: { front: [RIMEPLATE, THORNLING], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f30',
      name: 'Floor 30 — The Thornfall',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-undead-f31',
      name: 'Floor 31',
      enemies: { front: [RAVAGER, BULWARK_ENEMY], back: [MOONSONG_WEAVER, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f32',
      name: 'Floor 32',
      enemies: {
        front: [RIMEPLATE, BULWARK_ENEMY],
        back: [GLADE_STALKER, SHADE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f33',
      name: 'Floor 33',
      enemies: { front: [THORNWEALD_WARDEN, BULWARK_ENEMY], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f34',
      name: 'Floor 34',
      enemies: {
        front: [RIMEPLATE, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f35',
      name: 'Floor 35',
      enemies: {
        front: [GILDED_SENTRY, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, GLADE_STALKER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-undead-f36',
      name: 'Floor 36',
      enemies: { front: [THORNWEALD_WARDEN, THORNLING], back: [SHADE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-undead-f37',
      name: 'Floor 37',
      enemies: {
        front: [RAVAGER, THORNWEALD_WARDEN],
        back: [HEXBOUND_TORMENTOR, GLADE_STALKER, SHADE],
      },
    },
    {
      id: 't-undead-f38',
      name: 'Floor 38',
      enemies: { front: [THORNLING, BULWARK_ENEMY], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f39',
      name: 'Floor 39',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f40',
      name: 'Floor 40 — The Thornfall',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f41',
      name: 'Floor 41',
      enemies: { front: [BULWARK_ENEMY, THORNLING], back: [SKYSHRIKE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f42',
      name: 'Floor 42',
      enemies: {
        front: [BULWARK_ENEMY, GILDED_SENTRY],
        back: [SKYSHRIKE, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f43',
      name: 'Floor 43',
      enemies: { front: [THORNWEALD_WARDEN, RIMEPLATE], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f44',
      name: 'Floor 44',
      enemies: {
        front: [RAVAGER, THORNLING],
        back: [GLADE_STALKER, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f45',
      name: 'Floor 45',
      enemies: { front: [RAVAGER, RIMEPLATE], back: [MOONSONG_WEAVER, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [SKYSHRIKE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f47',
      name: 'Floor 47',
      enemies: {
        front: [BULWARK_ENEMY, GILDED_SENTRY],
        back: [MOONSONG_WEAVER, SHADE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f48',
      name: 'Floor 48',
      enemies: { front: [GILDED_SENTRY, RIMEPLATE], back: [SKYSHRIKE, HEXBOUND_TORMENTOR] },
    },

    // -------------------------------------------------------------------------------------
    // The Deep Bough — Floors 49–68, levels 29–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f49',
      name: 'Floor 49',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f50',
      name: 'Floor 50 — The Deep Bough',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f51',
      name: 'Floor 51',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [THORNWEALD_WARDEN, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f52',
      name: 'Floor 52',
      enemies: {
        front: [RIMEPLATE, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f53',
      name: 'Floor 53',
      enemies: { front: [THORNWEALD_WARDEN, ASHEN_CHOIR], back: [HIEROPHANT, SKYSHRIKE, HEADSMAN] },
    },
    {
      id: 't-undead-f54',
      name: 'Floor 54',
      enemies: { front: [THORNWEALD_WARDEN, SENTINEL], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f55',
      name: 'Floor 55',
      enemies: {
        front: [WRATHBORN, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f56',
      name: 'Floor 56',
      enemies: {
        front: [SENTINEL, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f57',
      name: 'Floor 57',
      enemies: { front: [ASHEN_CHOIR, THORNWEALD_WARDEN], back: [SKYSHRIKE, HIEROPHANT, HEADSMAN] },
    },
    {
      id: 't-undead-f58',
      name: 'Floor 58',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [MOONSONG_WEAVER, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f59',
      name: 'Floor 59',
      enemies: {
        front: [RIMEPLATE, SENTINEL],
        back: [MOONSONG_WEAVER, HIEROPHANT, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f60',
      name: 'Floor 60 — The Deep Bough',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f61',
      name: 'Floor 61',
      enemies: {
        front: [THORNWEALD_WARDEN, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f62',
      name: 'Floor 62',
      enemies: { front: [GLADE_STALKER, THORNWEALD_WARDEN], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f63',
      name: 'Floor 63',
      enemies: {
        front: [SENTINEL, RIMEPLATE],
        back: [MOONSONG_WEAVER, STORMCALLER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f64',
      name: 'Floor 64',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f65',
      name: 'Floor 65',
      enemies: {
        front: [GLADE_STALKER, THORNWEALD_WARDEN],
        back: [HIEROPHANT, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f66',
      name: 'Floor 66',
      enemies: { front: [THORNWEALD_WARDEN, ASHEN_CHOIR], back: [STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f67',
      name: 'Floor 67',
      enemies: {
        front: [THORNWEALD_WARDEN, ASHEN_CHOIR],
        back: [SHADE, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f68',
      name: 'Floor 68',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, STORMCALLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Heartwood Vigil — Floors 69–84, levels 41–50 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f69',
      name: 'Floor 69',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, SHADE, STORMCALLER],
      },
    },
    {
      id: 't-undead-f70',
      name: 'Floor 70 — The Heartwood Vigil',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f71',
      name: 'Floor 71',
      enemies: {
        front: [SENTINEL, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f72',
      name: 'Floor 72',
      enemies: { front: [SENTINEL, THORNWEALD_WARDEN], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f73',
      name: 'Floor 73',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f74',
      name: 'Floor 74',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f75',
      name: 'Floor 75',
      enemies: {
        front: [ASHEN_CHOIR, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, HIEROPHANT, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f76',
      name: 'Floor 76',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f77',
      name: 'Floor 77',
      enemies: { front: [COLOSSUS, WYRDROOT_ANCIENT], back: [SHADE, MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f78',
      name: 'Floor 78',
      enemies: { front: [ASHEN_CHOIR, WARDEN], back: [SKYSHRIKE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-undead-f79',
      name: 'Floor 79',
      enemies: { front: [WYRDROOT_ANCIENT, COLOSSUS], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f80',
      name: 'Floor 80 — The Heartwood Vigil',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f81',
      name: 'Floor 81',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [STORMCALLER, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f82',
      name: 'Floor 82',
      enemies: { front: [WYRDROOT_ANCIENT, SENTINEL], back: [SKYSHRIKE, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f83',
      name: 'Floor 83',
      enemies: { front: [COLOSSUS, WYRDROOT_ANCIENT], back: [SKYSHRIKE, SHADE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f84',
      name: 'Floor 84',
      enemies: { front: [ASHEN_CHOIR, WARDEN], back: [THORNWEALD_WARDEN, SHADE, MOONSONG_WEAVER] },
    },

    // -------------------------------------------------------------------------------------
    // The Canopy — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Wyrdroot waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f85',
      name: 'Floor 85',
      enemies: {
        front: [THORNWEALD_WARDEN, WYRDROOT_ANCIENT],
        back: [HEADSMAN, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f86',
      name: 'Floor 86',
      enemies: {
        front: [WARDEN, THORNWEALD_WARDEN],
        back: [HEADSMAN, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f87',
      name: 'Floor 87',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [THORNWEALD_WARDEN, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-undead-f88',
      name: 'Floor 88',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f89',
      name: 'Floor 89',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [HIEROPHANT, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f90',
      name: 'Floor 90 — The Canopy',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, SKYSHRIKE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f91',
      name: 'Floor 91',
      enemies: {
        front: [WARDEN, COLOSSUS],
        back: [HIEROPHANT, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f92',
      name: 'Floor 92',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f93',
      name: 'Floor 93',
      enemies: {
        front: [COLOSSUS, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f94',
      name: 'Floor 94',
      enemies: {
        front: [THORNWEALD_WARDEN, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f95',
      name: 'Floor 95',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [SERAPH_ADJUDICANT, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f96',
      name: 'Floor 96',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [SKYSHRIKE, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f97',
      name: 'Floor 97',
      enemies: {
        front: [COLOSSUS, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f98',
      name: 'Floor 98',
      enemies: { front: [WARDEN, COLOSSUS], back: [SKYSHRIKE, THORNWEALD_WARDEN, STORMCALLER] },
    },
    {
      id: 't-undead-f99',
      name: 'Floor 99',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [HIEROPHANT, THORNWEALD_WARDEN, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f100',
      name: 'Floor 100 — The Wyrdroot',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [THORNWEALD_WARDEN, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
  ],
} as const;
