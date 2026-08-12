import {
  ACOLYTE,
  BARROW_SOVEREIGN,
  BOAR,
  BULWARK_ENEMY,
  CINDERLING,
  COLOSSUS,
  DEEPROCK_MINER,
  FORGE_THRALL,
  FREE_BLADE,
  GLADE_STALKER,
  GOLEM,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  PYRE,
  REVENANT,
  RIMEPLATE,
  RUNEWARDEN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SLIME,
  STORMCALLER,
  THORNWEALD_WARDEN,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Elf Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## Why the enemies are mostly Dwarven
 *
 * Dwarves beat Elves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * About half the slots are Dwarven and the rest are spread across the other six factions —
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ## What an Elf five is, and what this tower charges it for
 *
 * Elves are **reach, speed and evasion** on the softest bodies in the game, and their whole answer
 * to a formation is to go around it. So this tower does not hide anything: it stands armour in the
 * way and asks the faction that never had to break a wall to break one. The Runewarden is the sharp
 * version — it takes back the Snare and the Sunder that were the plan — and a Cairn Sentinel slows
 * exactly the stat an Elf five is built out of.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_ELF = {
  id: 'tower-elf',
  name: 'Elf Tower',
  faction: 'elf',
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
    // The Root Stair — Floors 1–12, levels 1–8 — delvers and fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f1',
      name: 'Floor 1',
      enemies: { front: [FORGE_THRALL], back: [DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f2',
      name: 'Floor 2',
      enemies: { front: [FORGE_THRALL], back: [CINDERLING, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f3',
      name: 'Floor 3',
      enemies: { front: [BOAR], back: [FORGE_THRALL, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f4',
      name: 'Floor 4',
      enemies: { front: [FREE_BLADE, FORGE_THRALL], back: [DEEPROCK_MINER, WISP] },
    },
    {
      id: 't-elf-f5',
      name: 'Floor 5',
      enemies: { front: [FREE_BLADE], back: [FORGE_THRALL, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f6',
      name: 'Floor 6',
      enemies: { front: [FREE_BLADE, DEEPROCK_MINER], back: [FORGE_THRALL, LUMEN_ACOLYTE] },
    },
    {
      id: 't-elf-f7',
      name: 'Floor 7',
      enemies: { front: [BOAR], back: [CINDERLING, FORGE_THRALL, WISP] },
    },
    {
      id: 't-elf-f8',
      name: 'Floor 8',
      enemies: { front: [DEEPROCK_MINER, BOAR], back: [FORGE_THRALL, CINDERLING] },
    },
    {
      id: 't-elf-f9',
      name: 'Floor 9',
      enemies: { front: [BOAR], back: [DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f10',
      name: 'Floor 10 — The Root Stair',
      enemies: { front: [FORGE_THRALL, DEEPROCK_MINER], back: [WISP, BOAR, LUMEN_ACOLYTE] },
    },
    {
      id: 't-elf-f11',
      name: 'Floor 11',
      enemies: { front: [BOAR], back: [FORGE_THRALL, LUMEN_ACOLYTE] },
    },
    {
      id: 't-elf-f12',
      name: 'Floor 12',
      enemies: { front: [FORGE_THRALL, FREE_BLADE], back: [SLIME, DEEPROCK_MINER] },
    },

    // -------------------------------------------------------------------------------------
    // The Delvers’ Cut — Floors 13–28, levels 8–17 — the locks arrive: a refreshed absorb, a party-wide debuff, an evasion wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f13',
      name: 'Floor 13',
      enemies: { front: [DEEPROCK_MINER, BULWARK_ENEMY], back: [SHADE, RUNEWARDEN] },
    },
    {
      id: 't-elf-f14',
      name: 'Floor 14',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [DEEPROCK_MINER, PYRE, RUNEWARDEN] },
    },
    {
      id: 't-elf-f15',
      name: 'Floor 15',
      enemies: { front: [GOLEM, REVENANT], back: [SHADE, RUNEWARDEN, PYRE] },
    },
    {
      id: 't-elf-f16',
      name: 'Floor 16',
      enemies: { front: [DEEPROCK_MINER, BULWARK_ENEMY], back: [ACOLYTE, RUNEWARDEN] },
    },
    {
      id: 't-elf-f17',
      name: 'Floor 17',
      enemies: { front: [DEEPROCK_MINER, REVENANT], back: [RUNEWARDEN, HAG, ACOLYTE] },
    },
    {
      id: 't-elf-f18',
      name: 'Floor 18',
      enemies: { front: [BULWARK_ENEMY, FORGE_THRALL], back: [RUNEWARDEN, LUMEN_ACOLYTE] },
    },
    {
      id: 't-elf-f19',
      name: 'Floor 19',
      enemies: { front: [FORGE_THRALL, GOLEM], back: [RUNEWARDEN, SHADE, ACOLYTE] },
    },
    {
      id: 't-elf-f20',
      name: 'Floor 20 — The Delvers’ Cut',
      enemies: { front: [BULWARK_ENEMY, FORGE_THRALL], back: [HAG, ACOLYTE, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f21',
      name: 'Floor 21',
      enemies: { front: [BULWARK_ENEMY, FORGE_THRALL], back: [DEEPROCK_MINER, RUNEWARDEN] },
    },
    {
      id: 't-elf-f22',
      name: 'Floor 22',
      enemies: { front: [FORGE_THRALL, DEEPROCK_MINER], back: [HAG, RUNEWARDEN, SHADE] },
    },
    {
      id: 't-elf-f23',
      name: 'Floor 23',
      enemies: { front: [BULWARK_ENEMY, FORGE_THRALL], back: [HAG, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f24',
      name: 'Floor 24',
      enemies: { front: [FORGE_THRALL, GOLEM], back: [DEEPROCK_MINER, SHADE, ACOLYTE] },
    },
    {
      id: 't-elf-f25',
      name: 'Floor 25',
      enemies: { front: [DEEPROCK_MINER, FORGE_THRALL], back: [SHADE, RUNEWARDEN, HAG] },
    },
    {
      id: 't-elf-f26',
      name: 'Floor 26',
      enemies: { front: [GOLEM, REVENANT], back: [GLADE_STALKER, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f27',
      name: 'Floor 27',
      enemies: { front: [FORGE_THRALL, BULWARK_ENEMY], back: [RUNEWARDEN, HAG, PYRE] },
    },
    {
      id: 't-elf-f28',
      name: 'Floor 28',
      enemies: { front: [REVENANT, BULWARK_ENEMY], back: [DEEPROCK_MINER, HAG] },
    },

    // -------------------------------------------------------------------------------------
    // The Iron Grove — Floors 29–48, levels 18–29 — armour on both axes, and the first thing that takes an answer back.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f29',
      name: 'Floor 29',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [STORMCALLER, HAG, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-elf-f30',
      name: 'Floor 30 — The Iron Grove',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [ACOLYTE, HAG, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f31',
      name: 'Floor 31',
      enemies: { front: [RIMEPLATE, SENTINEL], back: [RUNEWARDEN, HAG] },
    },
    {
      id: 't-elf-f32',
      name: 'Floor 32',
      enemies: {
        front: [BULWARK_ENEMY, SENTINEL],
        back: [ACOLYTE, SERAPH_ADJUDICANT, DEEPROCK_MINER],
      },
    },
    {
      id: 't-elf-f33',
      name: 'Floor 33',
      enemies: { front: [RUNEWARDEN, RIMEPLATE], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-elf-f34',
      name: 'Floor 34',
      enemies: { front: [HEADSMAN, FORGE_THRALL], back: [RUNEWARDEN, DEEPROCK_MINER, SHADE] },
    },
    {
      id: 't-elf-f35',
      name: 'Floor 35',
      enemies: { front: [RUNEWARDEN, SENTINEL], back: [SHADE, ACOLYTE, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f36',
      name: 'Floor 36',
      enemies: { front: [FORGE_THRALL, HEADSMAN], back: [DEEPROCK_MINER, HAG] },
    },
    {
      id: 't-elf-f37',
      name: 'Floor 37',
      enemies: { front: [BULWARK_ENEMY, RUNEWARDEN], back: [HAG, SHADE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f38',
      name: 'Floor 38',
      enemies: { front: [SENTINEL, BULWARK_ENEMY], back: [RUNEWARDEN, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f39',
      name: 'Floor 39',
      enemies: {
        front: [BULWARK_ENEMY, RIMEPLATE],
        back: [RUNEWARDEN, HEXBOUND_TORMENTOR, ACOLYTE],
      },
    },
    {
      id: 't-elf-f40',
      name: 'Floor 40 — The Iron Grove',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [ACOLYTE, HAG, SHADE] },
    },
    {
      id: 't-elf-f41',
      name: 'Floor 41',
      enemies: { front: [SENTINEL, FORGE_THRALL], back: [STORMCALLER, RUNEWARDEN] },
    },
    {
      id: 't-elf-f42',
      name: 'Floor 42',
      enemies: { front: [SENTINEL, RIMEPLATE], back: [SERAPH_ADJUDICANT, HAG, RUNEWARDEN] },
    },
    {
      id: 't-elf-f43',
      name: 'Floor 43',
      enemies: { front: [SENTINEL, BULWARK_ENEMY], back: [RUNEWARDEN, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f44',
      name: 'Floor 44',
      enemies: { front: [RUNEWARDEN, RIMEPLATE], back: [SHADE, DEEPROCK_MINER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f45',
      name: 'Floor 45',
      enemies: { front: [SENTINEL, RIMEPLATE], back: [RUNEWARDEN, DEEPROCK_MINER, STORMCALLER] },
    },
    {
      id: 't-elf-f46',
      name: 'Floor 46',
      enemies: { front: [BULWARK_ENEMY, RIMEPLATE], back: [RUNEWARDEN, DEEPROCK_MINER] },
    },
    {
      id: 't-elf-f47',
      name: 'Floor 47',
      enemies: {
        front: [RIMEPLATE, RUNEWARDEN],
        back: [DEEPROCK_MINER, ACOLYTE, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-elf-f48',
      name: 'Floor 48',
      enemies: { front: [SENTINEL, BULWARK_ENEMY], back: [HEXBOUND_TORMENTOR, RUNEWARDEN] },
    },

    // -------------------------------------------------------------------------------------
    // The Stonewright Reach — Floors 49–68, levels 30–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f49',
      name: 'Floor 49',
      enemies: { front: [RUNEWARDEN, HEADSMAN], back: [WRATHBORN, HIEROPHANT, MOONSONG_WEAVER] },
    },
    {
      id: 't-elf-f50',
      name: 'Floor 50 — The Stonewright Reach',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [STORMCALLER, SHADE, HIEROPHANT] },
    },
    {
      id: 't-elf-f51',
      name: 'Floor 51',
      enemies: { front: [BULWARK_ENEMY, RIMEPLATE], back: [SENTINEL, RUNEWARDEN, HIEROPHANT] },
    },
    {
      id: 't-elf-f52',
      name: 'Floor 52',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [RUNEWARDEN, MOONSONG_WEAVER, SENTINEL],
      },
    },
    {
      id: 't-elf-f53',
      name: 'Floor 53',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [SHADE, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-elf-f54',
      name: 'Floor 54',
      enemies: { front: [THORNWEALD_WARDEN, RIMEPLATE], back: [WRATHBORN, HEADSMAN] },
    },
    {
      id: 't-elf-f55',
      name: 'Floor 55',
      enemies: { front: [BULWARK_ENEMY, RIMEPLATE], back: [RUNEWARDEN, SENTINEL, HEADSMAN] },
    },
    {
      id: 't-elf-f56',
      name: 'Floor 56',
      enemies: { front: [RUNEWARDEN, BULWARK_ENEMY], back: [STORMCALLER, SENTINEL, HEADSMAN] },
    },
    {
      id: 't-elf-f57',
      name: 'Floor 57',
      enemies: { front: [SENTINEL, HEADSMAN], back: [STORMCALLER, RUNEWARDEN, MOONSONG_WEAVER] },
    },
    {
      id: 't-elf-f58',
      name: 'Floor 58',
      enemies: { front: [HEADSMAN, BULWARK_ENEMY], back: [RUNEWARDEN, SENTINEL] },
    },
    {
      id: 't-elf-f59',
      name: 'Floor 59',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [STORMCALLER, HIEROPHANT, SHADE] },
    },
    {
      id: 't-elf-f60',
      name: 'Floor 60 — The Stonewright Reach',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [STORMCALLER, SHADE, HIEROPHANT] },
    },
    {
      id: 't-elf-f61',
      name: 'Floor 61',
      enemies: { front: [HEADSMAN, SENTINEL], back: [RUNEWARDEN, SHADE, STORMCALLER] },
    },
    {
      id: 't-elf-f62',
      name: 'Floor 62',
      enemies: { front: [SENTINEL, THORNWEALD_WARDEN], back: [RUNEWARDEN, WRATHBORN] },
    },
    {
      id: 't-elf-f63',
      name: 'Floor 63',
      enemies: {
        front: [RUNEWARDEN, BULWARK_ENEMY],
        back: [MOONSONG_WEAVER, SENTINEL, HIEROPHANT],
      },
    },
    {
      id: 't-elf-f64',
      name: 'Floor 64',
      enemies: { front: [RUNEWARDEN, RIMEPLATE], back: [STORMCALLER, SENTINEL, HEADSMAN] },
    },
    {
      id: 't-elf-f65',
      name: 'Floor 65',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SHADE, RUNEWARDEN, SENTINEL] },
    },
    {
      id: 't-elf-f66',
      name: 'Floor 66',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [HEADSMAN, SENTINEL] },
    },
    {
      id: 't-elf-f67',
      name: 'Floor 67',
      enemies: { front: [THORNWEALD_WARDEN, RUNEWARDEN], back: [SENTINEL, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-elf-f68',
      name: 'Floor 68',
      enemies: { front: [SENTINEL, BULWARK_ENEMY], back: [WRATHBORN, SHADE, HIEROPHANT] },
    },

    // -------------------------------------------------------------------------------------
    // The Long Siege — Floors 69–84, levels 42–51 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f69',
      name: 'Floor 69',
      enemies: { front: [SENTINEL, BARROW_SOVEREIGN], back: [HEADSMAN, SHADE, RUNEWARDEN] },
    },
    {
      id: 't-elf-f70',
      name: 'Floor 70 — The Long Siege',
      enemies: { front: [COLOSSUS, RUNEWARDEN], back: [STORMCALLER, SHADE, HIEROPHANT] },
    },
    {
      id: 't-elf-f71',
      name: 'Floor 71',
      enemies: { front: [COLOSSUS, SENTINEL], back: [RUNEWARDEN, HIEROPHANT, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f72',
      name: 'Floor 72',
      enemies: { front: [RUNEWARDEN, COLOSSUS], back: [STORMCALLER, SENTINEL, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f73',
      name: 'Floor 73',
      enemies: {
        front: [RUNEWARDEN, BARROW_SOVEREIGN],
        back: [SENTINEL, SHADE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f74',
      name: 'Floor 74',
      enemies: { front: [HEADSMAN, COLOSSUS], back: [RUNEWARDEN, SENTINEL] },
    },
    {
      id: 't-elf-f75',
      name: 'Floor 75',
      enemies: { front: [SENTINEL, HEADSMAN], back: [RUNEWARDEN, HIEROPHANT, STORMCALLER] },
    },
    {
      id: 't-elf-f76',
      name: 'Floor 76',
      enemies: { front: [WARDEN, SENTINEL], back: [RUNEWARDEN, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f77',
      name: 'Floor 77',
      enemies: { front: [RUNEWARDEN, COLOSSUS], back: [SENTINEL, STORMCALLER, HIEROPHANT] },
    },
    {
      id: 't-elf-f78',
      name: 'Floor 78',
      enemies: { front: [RUNEWARDEN, BARROW_SOVEREIGN], back: [SENTINEL, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-elf-f79',
      name: 'Floor 79',
      enemies: { front: [WARDEN, COLOSSUS], back: [STORMCALLER, HEADSMAN, RUNEWARDEN] },
    },
    {
      id: 't-elf-f80',
      name: 'Floor 80 — The Long Siege',
      enemies: { front: [COLOSSUS, RUNEWARDEN], back: [STORMCALLER, SHADE, HIEROPHANT] },
    },
    {
      id: 't-elf-f81',
      name: 'Floor 81',
      enemies: { front: [RUNEWARDEN, COLOSSUS], back: [SENTINEL, STORMCALLER, SHADE] },
    },
    {
      id: 't-elf-f82',
      name: 'Floor 82',
      enemies: { front: [WARDEN, RUNEWARDEN], back: [HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f83',
      name: 'Floor 83',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [SENTINEL, RUNEWARDEN, SHADE] },
    },
    {
      id: 't-elf-f84',
      name: 'Floor 84',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [STORMCALLER, SERAPH_ADJUDICANT, HEADSMAN] },
    },

    // -------------------------------------------------------------------------------------
    // The Crown of Stone — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Stonewright waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f85',
      name: 'Floor 85',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [RUNEWARDEN, SENTINEL, STORMCALLER] },
    },
    {
      id: 't-elf-f86',
      name: 'Floor 86',
      enemies: { front: [COLOSSUS, SENTINEL], back: [STORMCALLER, RUNEWARDEN, HEADSMAN] },
    },
    {
      id: 't-elf-f87',
      name: 'Floor 87',
      enemies: { front: [SENTINEL, WARDEN], back: [RUNEWARDEN, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f88',
      name: 'Floor 88',
      enemies: { front: [BARROW_SOVEREIGN, COLOSSUS], back: [SHADE, SENTINEL, RUNEWARDEN] },
    },
    {
      id: 't-elf-f89',
      name: 'Floor 89',
      enemies: { front: [WARDEN, COLOSSUS], back: [RUNEWARDEN, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-elf-f90',
      name: 'Floor 90 — The Crown of Stone',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [RUNEWARDEN, SENTINEL, HEADSMAN] },
    },
    {
      id: 't-elf-f91',
      name: 'Floor 91',
      enemies: { front: [WARDEN, BARROW_SOVEREIGN], back: [SHADE, RUNEWARDEN, SENTINEL] },
    },
    {
      id: 't-elf-f92',
      name: 'Floor 92',
      enemies: { front: [SENTINEL, WARDEN], back: [RUNEWARDEN, HEADSMAN, SHADE] },
    },
    {
      id: 't-elf-f93',
      name: 'Floor 93',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [SENTINEL, STORMCALLER, RUNEWARDEN] },
    },
    {
      id: 't-elf-f94',
      name: 'Floor 94',
      enemies: { front: [COLOSSUS, WARDEN], back: [RUNEWARDEN, SHADE, SENTINEL] },
    },
    {
      id: 't-elf-f95',
      name: 'Floor 95',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [RUNEWARDEN, HEADSMAN, SENTINEL] },
    },
    {
      id: 't-elf-f96',
      name: 'Floor 96',
      enemies: { front: [SENTINEL, COLOSSUS], back: [RUNEWARDEN, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-elf-f97',
      name: 'Floor 97',
      enemies: { front: [BARROW_SOVEREIGN, SENTINEL], back: [RUNEWARDEN, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f98',
      name: 'Floor 98',
      enemies: { front: [SENTINEL, COLOSSUS], back: [RUNEWARDEN, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f99',
      name: 'Floor 99',
      enemies: { front: [BARROW_SOVEREIGN, SENTINEL], back: [RUNEWARDEN, STORMCALLER, HEADSMAN] },
    },
    {
      id: 't-elf-f100',
      name: 'Floor 100 — The Stonewright',
      enemies: { front: [COLOSSUS, BARROW_SOVEREIGN], back: [RUNEWARDEN, SENTINEL, HEADSMAN] },
    },
  ],
} as const;
