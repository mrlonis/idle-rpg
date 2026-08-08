import {
  ACOLYTE,
  BANDIT,
  BOAR,
  CINDERLING,
  FREE_BLADE,
  GLADE_STALKER,
  GOLEM,
  HAG,
  HEADSMAN,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  OATHBREAKER,
  PYRE,
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
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Dwarf Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## Why the enemies are mostly Human
 *
 * Humans beat Dwarves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * About half the slots are Human and the rest are spread across the other six factions, which is
 * the shape the matrix needs: a mono-Dwarf five meets fights it is unfavoured in *and* fights it is
 * favoured in, rather than a mirror match that would switch the matrix off entirely.
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ## What a Dwarf five is, and what this tower charges it for
 *
 * The faction's line is "cannot close a fight; can refuse to lose one" — the lowest `atk` in the
 * game against the deepest armour. So the wrong tower for Dwarves is a wall, which they simply
 * out-last: what this one fields instead is **reach and tempo**. A Marsh Acolyte behind two bodies
 * out-heals a party that cannot spike, a Fen Stormcaller charges through armour that never mattered,
 * and the ninety-second clock is the wall a Dwarf five actually has to beat.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts) for the
 * argument, which is the same one for all seven.
 */
export const TOWER_DWARF = {
  id: 'tower-dwarf',
  name: 'Dwarf Tower',
  faction: 'dwarf',
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
    // The Cracked Gate — Floors 1–12, levels 1–8 — a levy at the door, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f1',
      name: 'Floor 1',
      enemies: { front: [REVENANT], back: [THORNLING] },
    },
    {
      id: 't-dwarf-f2',
      name: 'Floor 2',
      enemies: { front: [FREE_BLADE], back: [BANDIT, SLIME] },
    },
    {
      id: 't-dwarf-f3',
      name: 'Floor 3',
      enemies: { front: [BOAR], back: [THORNLING, BANDIT] },
    },
    {
      id: 't-dwarf-f4',
      name: 'Floor 4',
      enemies: { front: [BOAR, BANDIT], back: [FREE_BLADE, SLIME] },
    },
    {
      id: 't-dwarf-f5',
      name: 'Floor 5',
      enemies: { front: [FREE_BLADE], back: [WISP, LUMEN_ACOLYTE] },
    },
    {
      id: 't-dwarf-f6',
      name: 'Floor 6',
      enemies: { front: [FREE_BLADE, BANDIT], back: [WISP, SLIME] },
    },
    {
      id: 't-dwarf-f7',
      name: 'Floor 7',
      enemies: { front: [FREE_BLADE], back: [BANDIT, WISP, SLIME] },
    },
    {
      id: 't-dwarf-f8',
      name: 'Floor 8',
      enemies: { front: [BOAR, BANDIT], back: [FREE_BLADE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-dwarf-f9',
      name: 'Floor 9',
      enemies: { front: [FREE_BLADE], back: [WISP] },
    },
    {
      id: 't-dwarf-f10',
      name: 'Floor 10 — The Cracked Gate',
      enemies: { front: [FREE_BLADE, BANDIT], back: [BANDIT, BOAR, CINDERLING] },
    },
    {
      id: 't-dwarf-f11',
      name: 'Floor 11',
      enemies: { front: [BANDIT], back: [SLIME, WISP] },
    },
    {
      id: 't-dwarf-f12',
      name: 'Floor 12',
      enemies: { front: [BOAR, REVENANT], back: [FREE_BLADE, THORNLING] },
    },

    // -------------------------------------------------------------------------------------
    // The Sundered Hall — Floors 13–28, levels 8–17 — the locks arrive: a healer behind two bodies, a party-wide debuff, an evasion wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f13',
      name: 'Floor 13',
      enemies: { front: [BANDIT, FREE_BLADE], back: [SHADE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-dwarf-f14',
      name: 'Floor 14',
      enemies: { front: [BANDIT, GOLEM], back: [HAG, LUMEN_ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f15',
      name: 'Floor 15',
      enemies: { front: [FREE_BLADE, BANDIT], back: [STORMCALLER, GLADE_STALKER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f16',
      name: 'Floor 16',
      enemies: { front: [GOLEM, BOAR], back: [ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f17',
      name: 'Floor 17',
      enemies: { front: [BOAR, GOLEM], back: [ACOLYTE, BANDIT, SHADE] },
    },
    {
      id: 't-dwarf-f18',
      name: 'Floor 18',
      enemies: { front: [BOAR, GOLEM], back: [ACOLYTE, BANDIT] },
    },
    {
      id: 't-dwarf-f19',
      name: 'Floor 19',
      enemies: { front: [GOLEM, BOAR], back: [CINDERLING, ACOLYTE, BANDIT] },
    },
    {
      id: 't-dwarf-f20',
      name: 'Floor 20 — The Sundered Hall',
      enemies: { front: [GOLEM, FREE_BLADE], back: [ACOLYTE, STORMCALLER, SHADE] },
    },
    {
      id: 't-dwarf-f21',
      name: 'Floor 21',
      enemies: { front: [FREE_BLADE, BANDIT], back: [SHADE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f22',
      name: 'Floor 22',
      enemies: { front: [GOLEM, REVENANT], back: [GLADE_STALKER, LUMEN_ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f23',
      name: 'Floor 23',
      enemies: { front: [BANDIT, FREE_BLADE], back: [ACOLYTE, HAG] },
    },
    {
      id: 't-dwarf-f24',
      name: 'Floor 24',
      enemies: { front: [BANDIT, FREE_BLADE], back: [STORMCALLER, ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f25',
      name: 'Floor 25',
      enemies: { front: [BOAR, BANDIT], back: [ACOLYTE, LUMEN_ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f26',
      name: 'Floor 26',
      enemies: { front: [BANDIT, FREE_BLADE], back: [STORMCALLER, SHADE] },
    },
    {
      id: 't-dwarf-f27',
      name: 'Floor 27',
      enemies: { front: [FREE_BLADE, BANDIT], back: [ACOLYTE, SHADE, GLADE_STALKER] },
    },
    {
      id: 't-dwarf-f28',
      name: 'Floor 28',
      enemies: { front: [BOAR, FREE_BLADE], back: [LUMEN_ACOLYTE, SHADE] },
    },

    // -------------------------------------------------------------------------------------
    // The Ashen Foundry — Floors 29–48, levels 18–29 — the caster ranks, and armour that stops answering the question.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f29',
      name: 'Floor 29',
      enemies: { front: [FREE_BLADE, BANDIT], back: [PYRE, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f30',
      name: 'Floor 30 — The Ashen Foundry',
      enemies: { front: [RIMEPLATE, FREE_BLADE], back: [STORMCALLER, ACOLYTE, BANDIT] },
    },
    {
      id: 't-dwarf-f31',
      name: 'Floor 31',
      enemies: { front: [BANDIT, THORNWEALD_WARDEN], back: [ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f32',
      name: 'Floor 32',
      enemies: { front: [FREE_BLADE, RIMEPLATE], back: [STORMCALLER, BANDIT, ACOLYTE] },
    },
    {
      id: 't-dwarf-f33',
      name: 'Floor 33',
      enemies: { front: [FREE_BLADE, BANDIT], back: [STORMCALLER, SHADE] },
    },
    {
      id: 't-dwarf-f34',
      name: 'Floor 34',
      enemies: { front: [BANDIT, HEADSMAN], back: [SERAPH_ADJUDICANT, ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f35',
      name: 'Floor 35',
      enemies: { front: [FREE_BLADE, SENTINEL], back: [ACOLYTE, STORMCALLER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f36',
      name: 'Floor 36',
      enemies: { front: [SENTINEL, BANDIT], back: [SERAPH_ADJUDICANT, ACOLYTE] },
    },
    {
      id: 't-dwarf-f37',
      name: 'Floor 37',
      enemies: { front: [FREE_BLADE, RIMEPLATE], back: [STORMCALLER, PYRE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f38',
      name: 'Floor 38',
      enemies: { front: [THORNWEALD_WARDEN, RIMEPLATE], back: [SHADE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f39',
      name: 'Floor 39',
      enemies: { front: [FREE_BLADE, THORNWEALD_WARDEN], back: [BANDIT, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f40',
      name: 'Floor 40 — The Ashen Foundry',
      enemies: { front: [RIMEPLATE, FREE_BLADE], back: [STORMCALLER, ACOLYTE, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f41',
      name: 'Floor 41',
      enemies: { front: [THORNWEALD_WARDEN, FREE_BLADE], back: [ACOLYTE, BANDIT] },
    },
    {
      id: 't-dwarf-f42',
      name: 'Floor 42',
      enemies: { front: [FREE_BLADE, RIMEPLATE], back: [ACOLYTE, SHADE, BANDIT] },
    },
    {
      id: 't-dwarf-f43',
      name: 'Floor 43',
      enemies: { front: [THORNWEALD_WARDEN, BANDIT], back: [ACOLYTE, PYRE] },
    },
    {
      id: 't-dwarf-f44',
      name: 'Floor 44',
      enemies: { front: [FREE_BLADE, HEADSMAN], back: [BANDIT, ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f45',
      name: 'Floor 45',
      enemies: { front: [BANDIT, FREE_BLADE], back: [STORMCALLER, ACOLYTE, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f46',
      name: 'Floor 46',
      enemies: { front: [BANDIT, FREE_BLADE], back: [STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f47',
      name: 'Floor 47',
      enemies: { front: [RAVAGER, RIMEPLATE], back: [PYRE, STORMCALLER, BANDIT] },
    },
    {
      id: 't-dwarf-f48',
      name: 'Floor 48',
      enemies: { front: [BANDIT, HEADSMAN], back: [STORMCALLER, ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Kingsway — Floors 49–68, levels 29–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f49',
      name: 'Floor 49',
      enemies: { front: [FREE_BLADE, WARDEN], back: [ACOLYTE, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-dwarf-f50',
      name: 'Floor 50 — The Kingsway',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [STORMCALLER, ACOLYTE, HIEROPHANT] },
    },
    {
      id: 't-dwarf-f51',
      name: 'Floor 51',
      enemies: { front: [FREE_BLADE, RIMEPLATE], back: [ACOLYTE, MOONSONG_WEAVER, STORMCALLER] },
    },
    {
      id: 't-dwarf-f52',
      name: 'Floor 52',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [ACOLYTE, SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f53',
      name: 'Floor 53',
      enemies: { front: [WRATHBORN, THORNWEALD_WARDEN], back: [ACOLYTE, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f54',
      name: 'Floor 54',
      enemies: { front: [WARDEN, FREE_BLADE], back: [STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f55',
      name: 'Floor 55',
      enemies: { front: [THORNWEALD_WARDEN, WARDEN], back: [ACOLYTE, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f56',
      name: 'Floor 56',
      enemies: { front: [WARDEN, HEADSMAN], back: [STORMCALLER, ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f57',
      name: 'Floor 57',
      enemies: { front: [FREE_BLADE, WARDEN], back: [ACOLYTE, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f58',
      name: 'Floor 58',
      enemies: { front: [HEADSMAN, WARDEN], back: [STORMCALLER, SHADE] },
    },
    {
      id: 't-dwarf-f59',
      name: 'Floor 59',
      enemies: { front: [FREE_BLADE, WRATHBORN], back: [HIEROPHANT, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f60',
      name: 'Floor 60 — The Kingsway',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [STORMCALLER, ACOLYTE, HIEROPHANT] },
    },
    {
      id: 't-dwarf-f61',
      name: 'Floor 61',
      enemies: { front: [WRATHBORN, WARDEN], back: [STORMCALLER, ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f62',
      name: 'Floor 62',
      enemies: { front: [WRATHBORN, WARDEN], back: [SHADE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f63',
      name: 'Floor 63',
      enemies: { front: [WARDEN, HEADSMAN], back: [ACOLYTE, STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-dwarf-f64',
      name: 'Floor 64',
      enemies: { front: [WARDEN, THORNWEALD_WARDEN], back: [STORMCALLER, ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f65',
      name: 'Floor 65',
      enemies: { front: [HEADSMAN, WARDEN], back: [MOONSONG_WEAVER, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f66',
      name: 'Floor 66',
      enemies: { front: [WRATHBORN, WARDEN], back: [SKYSHRIKE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f67',
      name: 'Floor 67',
      enemies: { front: [WARDEN, WRATHBORN], back: [ACOLYTE, SHADE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f68',
      name: 'Floor 68',
      enemies: { front: [WARDEN, HEADSMAN], back: [STORMCALLER, MOONSONG_WEAVER, ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Siege Above — Floors 69–84, levels 41–50 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f69',
      name: 'Floor 69',
      enemies: { front: [RUNEWARDEN, WARDEN], back: [SERAPH_ADJUDICANT, HEADSMAN, ACOLYTE] },
    },
    {
      id: 't-dwarf-f70',
      name: 'Floor 70 — The Siege Above',
      enemies: { front: [OATHBREAKER, WARDEN], back: [STORMCALLER, ACOLYTE, HIEROPHANT] },
    },
    {
      id: 't-dwarf-f71',
      name: 'Floor 71',
      enemies: { front: [WARDEN, RUNEWARDEN], back: [ACOLYTE, STORMCALLER, SHADE] },
    },
    {
      id: 't-dwarf-f72',
      name: 'Floor 72',
      enemies: { front: [WARDEN, WRATHBORN], back: [STORMCALLER, SERAPH_ADJUDICANT, ACOLYTE] },
    },
    {
      id: 't-dwarf-f73',
      name: 'Floor 73',
      enemies: { front: [HEADSMAN, WARDEN], back: [STORMCALLER, SHADE, MOONSONG_WEAVER] },
    },
    {
      id: 't-dwarf-f74',
      name: 'Floor 74',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [ACOLYTE, SHADE] },
    },
    {
      id: 't-dwarf-f75',
      name: 'Floor 75',
      enemies: { front: [RIMEPLATE, OATHBREAKER], back: [STORMCALLER, ACOLYTE, MOONSONG_WEAVER] },
    },
    {
      id: 't-dwarf-f76',
      name: 'Floor 76',
      enemies: { front: [OATHBREAKER, WARDEN], back: [SERAPH_ADJUDICANT, ACOLYTE, STORMCALLER] },
    },
    {
      id: 't-dwarf-f77',
      name: 'Floor 77',
      enemies: { front: [WARDEN, HEADSMAN], back: [STORMCALLER, ACOLYTE, MOONSONG_WEAVER] },
    },
    {
      id: 't-dwarf-f78',
      name: 'Floor 78',
      enemies: { front: [WARDEN, WRATHBORN], back: [HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-dwarf-f79',
      name: 'Floor 79',
      enemies: { front: [RIMEPLATE, WARDEN], back: [HEADSMAN, SHADE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f80',
      name: 'Floor 80 — The Siege Above',
      enemies: { front: [OATHBREAKER, WARDEN], back: [STORMCALLER, ACOLYTE, HIEROPHANT] },
    },
    {
      id: 't-dwarf-f81',
      name: 'Floor 81',
      enemies: { front: [WARDEN, HEADSMAN], back: [STORMCALLER, SERAPH_ADJUDICANT, SHADE] },
    },
    {
      id: 't-dwarf-f82',
      name: 'Floor 82',
      enemies: { front: [OATHBREAKER, WARDEN], back: [HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-dwarf-f83',
      name: 'Floor 83',
      enemies: { front: [WARDEN, HEADSMAN], back: [ACOLYTE, STORMCALLER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f84',
      name: 'Floor 84',
      enemies: { front: [WARDEN, HEADSMAN], back: [SHADE, STORMCALLER, ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Crown Stair — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Crown-Taker waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f85',
      name: 'Floor 85',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [STORMCALLER, MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f86',
      name: 'Floor 86',
      enemies: { front: [WARDEN, OATHBREAKER], back: [HEADSMAN, ACOLYTE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f87',
      name: 'Floor 87',
      enemies: { front: [WARDEN, OATHBREAKER], back: [ACOLYTE, SERAPH_ADJUDICANT, HEADSMAN] },
    },
    {
      id: 't-dwarf-f88',
      name: 'Floor 88',
      enemies: { front: [WARDEN, OATHBREAKER], back: [SERAPH_ADJUDICANT, ACOLYTE, HEADSMAN] },
    },
    {
      id: 't-dwarf-f89',
      name: 'Floor 89',
      enemies: { front: [HEADSMAN, WARDEN], back: [STORMCALLER, SERAPH_ADJUDICANT, ACOLYTE] },
    },
    {
      id: 't-dwarf-f90',
      name: 'Floor 90 — The Crown Stair',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [STORMCALLER, ACOLYTE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f91',
      name: 'Floor 91',
      enemies: { front: [WARDEN, OATHBREAKER], back: [ACOLYTE, SHADE, HEADSMAN] },
    },
    {
      id: 't-dwarf-f92',
      name: 'Floor 92',
      enemies: { front: [WARDEN, HEADSMAN], back: [SHADE, STORMCALLER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f93',
      name: 'Floor 93',
      enemies: {
        front: [OATHBREAKER, HIEROPHANT],
        back: [STORMCALLER, HEADSMAN, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f94',
      name: 'Floor 94',
      enemies: { front: [OATHBREAKER, WARDEN], back: [ACOLYTE, STORMCALLER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f95',
      name: 'Floor 95',
      enemies: { front: [OATHBREAKER, WARDEN], back: [ACOLYTE, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-dwarf-f96',
      name: 'Floor 96',
      enemies: { front: [OATHBREAKER, WARDEN], back: [STORMCALLER, HEADSMAN, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f97',
      name: 'Floor 97',
      enemies: { front: [WARDEN, OATHBREAKER], back: [SHADE, MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-dwarf-f98',
      name: 'Floor 98',
      enemies: { front: [OATHBREAKER, WARDEN], back: [STORMCALLER, SHADE, ACOLYTE] },
    },
    {
      id: 't-dwarf-f99',
      name: 'Floor 99',
      enemies: { front: [WARDEN, OATHBREAKER], back: [HEADSMAN, SERAPH_ADJUDICANT, ACOLYTE] },
    },
    {
      id: 't-dwarf-f100',
      name: 'Floor 100 — The Crown-Taker',
      enemies: { front: [OATHBREAKER, WARDEN], back: [STORMCALLER, HEADSMAN, SERAPH_ADJUDICANT] },
    },
  ],
} as const;
