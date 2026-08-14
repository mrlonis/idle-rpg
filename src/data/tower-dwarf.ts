import {
  ACOLYTE,
  BANDIT,
  BARROWMIST_KEENER,
  BOAR,
  BRAMBLEWALK_SCOUT,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDERLING,
  COLDFORGE_HAND,
  COLOSSUS,
  DEEPGALLERY_RUNNER,
  DUSKFERN_SKIRMISHER,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  HEARTROOT_TENDER,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  KINGSWAY_LANCER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTCANOPY_SINGER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  PYRE,
  RAVAGER,
  RENDFANG_JACKAL,
  REVENANT,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  SLAGBOUND_DRUDGE,
  SLIME,
  STORMCALLER,
  THE_BREACHLORD,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNDERVAULT_SAPPER,
  VAULTBOUND_GAOLER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Dwarf Tower — two hundred floors, enemy levels 1 to 120.
 *
 * ## Why the enemies are mostly Human
 *
 * Humans beat Dwarves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * About three fifths of the slots are Human and the rest are spread across the other six factions,
 * which is the shape the matrix needs: a mono-Dwarf five meets fights it is unfavoured in *and*
 * fights it is favoured in, rather than a mirror match that would switch the matrix off entirely.
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ⚠️ **The second hundred wanted to be far more Human than that** — authored from the lean's own
 * newly deepened bench it came out at 86%, exactly as 21e's did — and it is held down by
 * substituting non-Human bodies of comparable weight through the filler slots. That is a thing to
 * do on purpose rather than a thing that happens.
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
 *
 * ## ⚠️ The second hundred escalates through offence, which is the inverse of the Human Tower's
 *
 * 21e's second hundred thins its anchors and thickens the board's own **support** — links, shields,
 * a taunt — and lets the level line carry the rest. **That shape is unusable here**, and the
 * measurement is unambiguous. Against these crews at the top floor's level:
 *
 * | Board at level 120                             | reference five  | alternate five |
 * | ---------------------------------------------- | --------------- | -------------- |
 * | one anchor + a *bulky* legendary, 3 legendaries | 90% / **45.7s** | **63%**        |
 * | one anchor + a *pressure* legendary, same back  | 100% / **33.0s**| **90%**        |
 * | one anchor + a shield support in the back rank  | **28%**         | **0%**         |
 *
 * Same nominal weight, twelve seconds apart, and only the offensive board is clearable by both
 * arrangements. Every point of sustain on the enemy side is a second of clock a party that cannot
 * burst does not have — which is 15c's finding **on this tower's own roof**, generalised from the
 * anchors to the whole shape. So the second hundred escalates through what a board does per turn:
 * the front rank's weight and speed, and armour that stops answering.
 *
 * ⚠️ **The back rank is a cliff rather than a dial.** Moving one body of the same output from the
 * front rank to the back takes the reference five from 100% to **10%** — Dwarves carry the least
 * reach in the game, so pressure they cannot aim at is not a harder fight, it is a different one.
 * Escalate in front.
 *
 * ## What the bands measure at
 *
 * Band 1: floor 1 in one second, floor 50 in seven, floor 100 in forty-four with three of five
 * down. Band 2: floor 101 in five seconds, floor 160 in fourteen, floor 200 in thirty-six at 98%
 * with 2.3 alive, and the alternate five takes the roof at **88% with 1.5**. Win rate is 100% almost
 * the whole way, which is the intended shape — a floor is climbed once and there is no way around
 * one. What ramps is what it costs: nobody dies below floor 80 in band 1 or floor 185 in band 2.
 *
 * ⚠️ **The roof is far lighter than the Human Tower's and that is 15c's rule rather than an
 * oversight**: anchors are sized against the tower's own crew, never to a shared weight. A roof at
 * The Deathless Marshal's weight reads **0%** for both Dwarf arrangements. See
 * [`THE_BREACHLORD`](./enemies.ts).
 *
 * ⚠️ **No board pairs a taunt with a body that heals**, and no board above floor 180 carries sustain
 * of any kind — checked by walking all two hundred floors with a script rather than by reading them,
 * which is how the one board that broke it was found. Re-run `npm run test:balance` after touching
 * any band above floor 68 or floor 180.
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
   * `AUTO_BATTLE_UNLOCK_CHAPTERS`, because these are two decisions that agree rather than one
   * fact stated twice; `towers.spec.ts` is what holds the agreement.
   */
  unlockClears: 10,
  floors: [
    // -------------------------------------------------------------------------------------
    // The Cracked Gate — Floors 1–12, levels 1–6 — a levy at the door, and the first speed check.
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
    // The Sundered Hall — Floors 13–28, levels 7–14 — the locks arrive: a healer behind two bodies, a party-wide debuff, an evasion wall.
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
    // The Ashen Foundry — Floors 29–48, levels 14–23 — the caster ranks, and armour that stops answering the question.
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
    // The Kingsway — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
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
    // The Siege Above — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
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
    // The Crown Stair — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Crown-Taker waiting above them.
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

    // -------------------------------------------------------------------------------------
    // The Kingsway Above — Floors 101–120, levels 48–57 — the host that took the hold, camped on the road it came up, and the blocks the first hundred never met.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f101',
      name: 'Floor 101',
      enemies: {
        front: [OATHSHIELD_VANGUARD, FORLORN_LEVY],
        back: [STORMCALLER, GRAVEMOURN_KEEPER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f102',
      name: 'Floor 102',
      enemies: {
        front: [VAULTBOUND_GAOLER, FREE_BLADE],
        back: [STORMCALLER, SHADE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f103',
      name: 'Floor 103',
      enemies: {
        front: [KINGSWAY_LANCER, FORLORN_LEVY],
        back: [ACOLYTE, SKYSHRIKE, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-dwarf-f104',
      name: 'Floor 104',
      enemies: {
        front: [OATHSHIELD_VANGUARD, CAIRNWARD_HUSK],
        back: [STORMCALLER, BRAMBLEWALK_SCOUT, GLADE_STALKER],
      },
    },
    {
      id: 't-dwarf-f105',
      name: 'Floor 105',
      enemies: { front: [KINGSWAY_LANCER, MIREWHELP], back: [STORMCALLER, ACOLYTE, CARRION_SWARM] },
    },
    {
      id: 't-dwarf-f106',
      name: 'Floor 106',
      enemies: {
        front: [VAULTBOUND_GAOLER, FORLORN_LEVY],
        back: [SHADE, PYRE, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-dwarf-f107',
      name: 'Floor 107',
      enemies: {
        front: [WARDEN, FORLORN_LEVY],
        back: [ACOLYTE, MOONSONG_WEAVER, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-dwarf-f108',
      name: 'Floor 108',
      enemies: {
        front: [KINGSWAY_LANCER, HOLLOWBARK_SENTRY],
        back: [STORMCALLER, FORLORN_LEVY, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-dwarf-f109',
      name: 'Floor 109',
      enemies: {
        front: [OATHSHIELD_VANGUARD, GLOAMVINE_CREEPER],
        back: [HEARTROOT_TENDER, SKYSHRIKE, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f110',
      name: 'Floor 110 — The Camp Gate',
      enemies: {
        front: [OATHBREAKER, VAULTBOUND_GAOLER],
        back: [STORMCALLER, ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f111',
      name: 'Floor 111',
      enemies: {
        front: [KINGSWAY_LANCER, CHARNEL_DRUDGE],
        back: [STORMCALLER, SHADE, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f112',
      name: 'Floor 112',
      enemies: {
        front: [VAULTBOUND_GAOLER, FORGE_THRALL],
        back: [ACOLYTE, MOONSONG_WEAVER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f113',
      name: 'Floor 113',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [STORMCALLER, WHISPERLEAF_ARCHER, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-dwarf-f114',
      name: 'Floor 114',
      enemies: {
        front: [RIVEN_MARCHWARDEN, FORLORN_LEVY],
        back: [STORMCALLER, BARROWMIST_KEENER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f115',
      name: 'Floor 115',
      enemies: {
        front: [KINGSWAY_LANCER, CAIRNWARD_HUSK],
        back: [SHADE, STORMCALLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f116',
      name: 'Floor 116',
      enemies: {
        front: [RIMEPLATE, FORLORN_LEVY],
        back: [ACOLYTE, NIGHTCANOPY_SINGER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-dwarf-f117',
      name: 'Floor 117',
      enemies: { front: [WARDEN, FREE_BLADE], back: [PYRE, FORLORN_LEVY, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f118',
      name: 'Floor 118',
      enemies: {
        front: [KINGSWAY_LANCER, OATHSHIELD_VANGUARD],
        back: [GRAVEMOURN_KEEPER, STORMCALLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f119',
      name: 'Floor 119',
      enemies: {
        front: [VAULTBOUND_GAOLER, DUSKFERN_SKIRMISHER],
        back: [STORMCALLER, SKYSHRIKE, CINDERLING],
      },
    },
    {
      id: 't-dwarf-f120',
      name: 'Floor 120 — The Road Above',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [STORMCALLER, ACOLYTE, SERAPH_ADJUDICANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Undervault — Floors 121–140, levels 58–67 — somebody has found the seams, and armour stops being an answer.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f121',
      name: 'Floor 121',
      enemies: {
        front: [UNDERVAULT_SAPPER, OATHSHIELD_VANGUARD],
        back: [STORMCALLER, GRAVEMOURN_KEEPER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f122',
      name: 'Floor 122',
      enemies: {
        front: [UNDERVAULT_SAPPER, FORLORN_LEVY],
        back: [STORMCALLER, SHADE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f123',
      name: 'Floor 123',
      enemies: {
        front: [KINGSWAY_LANCER, UNDERVAULT_SAPPER],
        back: [ACOLYTE, MOONSONG_WEAVER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f124',
      name: 'Floor 124',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [STORMCALLER, SKYSHRIKE, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f125',
      name: 'Floor 125',
      enemies: {
        front: [UNDERVAULT_SAPPER, SLAGBOUND_DRUDGE],
        back: [ACOLYTE, NIGHTCANOPY_SINGER, FORGE_THRALL],
      },
    },
    {
      id: 't-dwarf-f126',
      name: 'Floor 126',
      enemies: {
        front: [OATHSHIELD_VANGUARD, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f127',
      name: 'Floor 127',
      enemies: { front: [UNDERVAULT_SAPPER, FREE_BLADE], back: [PYRE, ACOLYTE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-dwarf-f128',
      name: 'Floor 128',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, STORMCALLER, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f129',
      name: 'Floor 129',
      enemies: {
        front: [KINGSWAY_LANCER, CHARNEL_DRUDGE],
        back: [GRAVETIDE_HERALD, STORMCALLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f130',
      name: 'Floor 130 — The Seam',
      enemies: { front: [OATHBREAKER, UNDERVAULT_SAPPER], back: [STORMCALLER, ACOLYTE, SKYSHRIKE] },
    },
    {
      id: 't-dwarf-f131',
      name: 'Floor 131',
      enemies: {
        front: [UNDERVAULT_SAPPER, OATHSHIELD_VANGUARD],
        back: [STORMCALLER, GLADE_STALKER, GOLEM],
      },
    },
    {
      id: 't-dwarf-f132',
      name: 'Floor 132',
      enemies: {
        front: [KINGSWAY_LANCER, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, MOONSONG_WEAVER, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-dwarf-f133',
      name: 'Floor 133',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [STORMCALLER, WEALDSHADOW_STALKER, COLDFORGE_HAND],
      },
    },
    {
      id: 't-dwarf-f134',
      name: 'Floor 134',
      enemies: {
        front: [UNDERVAULT_SAPPER, THORNBACK_GRAZER],
        back: [STORMCALLER, ACOLYTE, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f135',
      name: 'Floor 135',
      enemies: {
        front: [KINGSWAY_LANCER, OATHSHIELD_VANGUARD],
        back: [UNDERVAULT_SAPPER, PYRE, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f136',
      name: 'Floor 136',
      enemies: {
        front: [UNDERVAULT_SAPPER, CHARNEL_DRUDGE],
        back: [ACOLYTE, STORMCALLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f137',
      name: 'Floor 137',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [STORMCALLER, DEEPGALLERY_RUNNER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f138',
      name: 'Floor 138',
      enemies: {
        front: [UNDERVAULT_SAPPER, RIMEPLATE],
        back: [STORMCALLER, ACOLYTE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f139',
      name: 'Floor 139',
      enemies: {
        front: [KINGSWAY_LANCER, CAIRNWARD_HUSK],
        back: [UNDERVAULT_SAPPER, STORMCALLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f140',
      name: 'Floor 140 — The Undervault',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Muster Field — Floors 141–160, levels 67–76 — numbers and tempo, so the fight is decided before a Dwarf five has finished settling into it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f141',
      name: 'Floor 141',
      enemies: {
        front: [RENDFANG_JACKAL, SEPULCHRE_HOUND],
        back: [KINGSWAY_LANCER, STORMCALLER, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f142',
      name: 'Floor 142',
      enemies: {
        front: [KINGSWAY_LANCER, FORLORN_LEVY],
        back: [STORMCALLER, ACOLYTE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f143',
      name: 'Floor 143',
      enemies: {
        front: [OATHSHIELD_VANGUARD, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, PYRE, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f144',
      name: 'Floor 144',
      enemies: {
        front: [KINGSWAY_LANCER, HOLLOWBARK_SENTRY],
        back: [NIGHTCANOPY_SINGER, SKYSHRIKE, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f145',
      name: 'Floor 145',
      enemies: {
        front: [WARDEN, FORLORN_LEVY],
        back: [KINGSWAY_LANCER, GRAVETIDE_HERALD, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f146',
      name: 'Floor 146',
      enemies: {
        front: [KINGSWAY_LANCER, UNDERVAULT_SAPPER],
        back: [STORMCALLER, FORLORN_LEVY, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f147',
      name: 'Floor 147',
      enemies: {
        front: [THORNBACK_GRAZER, SCARBOUND_BELLOWER],
        back: [STORMCALLER, FORLORN_LEVY, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-dwarf-f148',
      name: 'Floor 148',
      enemies: { front: [WARDEN, KINGSWAY_LANCER], back: [UNDERVAULT_SAPPER, PYRE, FORLORN_LEVY] },
    },
    {
      id: 't-dwarf-f149',
      name: 'Floor 149',
      enemies: {
        front: [KINGSWAY_LANCER, BRAMBLEWALK_SCOUT],
        back: [ACOLYTE, MOONSONG_WEAVER, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-dwarf-f150',
      name: 'Floor 150 — The Muster Field',
      enemies: {
        front: [OATHBREAKER, FORLORN_LEVY],
        back: [KINGSWAY_LANCER, STORMCALLER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f151',
      name: 'Floor 151',
      enemies: {
        front: [WEALDSHADOW_STALKER, CAIRNWARD_HUSK],
        back: [UNDERVAULT_SAPPER, STORMCALLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f152',
      name: 'Floor 152',
      enemies: { front: [WARDEN, FORLORN_LEVY], back: [STORMCALLER, ACOLYTE, WEALDSHADOW_STALKER] },
    },
    {
      id: 't-dwarf-f153',
      name: 'Floor 153',
      enemies: {
        front: [KINGSWAY_LANCER, OATHSHIELD_VANGUARD],
        back: [NIGHTCANOPY_SINGER, FORLORN_LEVY, FORGE_THRALL],
      },
    },
    {
      id: 't-dwarf-f154',
      name: 'Floor 154',
      enemies: {
        front: [UNDERVAULT_SAPPER, KINGSWAY_LANCER],
        back: [ACOLYTE, STORMCALLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f155',
      name: 'Floor 155',
      enemies: {
        front: [RIVEN_MARCHWARDEN, VAULTBOUND_GAOLER],
        back: [KINGSWAY_LANCER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f156',
      name: 'Floor 156',
      enemies: {
        front: [KINGSWAY_LANCER, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, ACOLYTE, GLOAMVINE_CREEPER],
      },
    },
    {
      id: 't-dwarf-f157',
      name: 'Floor 157',
      enemies: {
        front: [OATHSHIELD_VANGUARD, KINGSWAY_LANCER],
        back: [PYRE, FORLORN_LEVY, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f158',
      name: 'Floor 158',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [KINGSWAY_LANCER, STORMCALLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f159',
      name: 'Floor 159',
      enemies: {
        front: [KINGSWAY_LANCER, CHARNEL_DRUDGE],
        back: [GRAVETIDE_HERALD, STORMCALLER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f160',
      name: 'Floor 160 — The Standing Orders',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, FORLORN_LEVY],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Standing Camp — Floors 161–180, levels 76–85 — an ascended block on every front rank, with a lance beside it rather than a second wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f161',
      name: 'Floor 161',
      enemies: {
        front: [OATHBREAKER, SEPULCHRE_HOUND],
        back: [STORMCALLER, ACOLYTE, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-dwarf-f162',
      name: 'Floor 162',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f163',
      name: 'Floor 163',
      enemies: {
        front: [OATHBREAKER, OATHSHIELD_VANGUARD],
        back: [NIGHTCANOPY_SINGER, DUSKFERN_SKIRMISHER, LONGBOUGH_MARKSMAN],
      },
    },
    {
      id: 't-dwarf-f164',
      name: 'Floor 164',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [KINGSWAY_LANCER, MOONSONG_WEAVER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f165',
      name: 'Floor 165',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [STORMCALLER, ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f166',
      name: 'Floor 166',
      enemies: {
        front: [COLOSSUS, CARRION_SWARM],
        back: [UNDERVAULT_SAPPER, STORMCALLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-dwarf-f167',
      name: 'Floor 167',
      enemies: {
        front: [OATHBREAKER, CAIRNWARD_HUSK],
        back: [KINGSWAY_LANCER, STORMCALLER, GLOAMVINE_CREEPER],
      },
    },
    {
      id: 't-dwarf-f168',
      name: 'Floor 168',
      enemies: {
        front: [WARDEN, OATHSHIELD_VANGUARD],
        back: [PYRE, GRAVEMOURN_KEEPER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f169',
      name: 'Floor 169',
      enemies: {
        front: [OATHBREAKER, UNDERVAULT_SAPPER],
        back: [STORMCALLER, SKYSHRIKE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f170',
      name: 'Floor 170 — The Broken Line',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f171',
      name: 'Floor 171',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [STORMCALLER, GRAVETIDE_HERALD, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f172',
      name: 'Floor 172',
      enemies: {
        front: [OATHBREAKER, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, WEALDSHADOW_STALKER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f173',
      name: 'Floor 173',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [KINGSWAY_LANCER, STORMCALLER, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-dwarf-f174',
      name: 'Floor 174',
      enemies: {
        front: [OATHBREAKER, RIVEN_MARCHWARDEN],
        back: [KINGSWAY_LANCER, STORMCALLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f175',
      name: 'Floor 175',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, ACOLYTE, NIGHTCANOPY_SINGER],
      },
    },
    {
      id: 't-dwarf-f176',
      name: 'Floor 176',
      enemies: {
        front: [OATHBREAKER, VAULTBOUND_GAOLER],
        back: [PYRE, SERAPH_ADJUDICANT, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f177',
      name: 'Floor 177',
      enemies: {
        front: [WARDEN, THORNBACK_GRAZER],
        back: [KINGSWAY_LANCER, UNDERVAULT_SAPPER, PYRE],
      },
    },
    {
      id: 't-dwarf-f178',
      name: 'Floor 178',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [STORMCALLER, GRAVEMOURN_KEEPER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f179',
      name: 'Floor 179',
      enemies: {
        front: [WARDEN, OATHSHIELD_VANGUARD],
        back: [UNDERVAULT_SAPPER, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f180',
      name: 'Floor 180 — The Last Wall',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Breach — Floors 181–200, levels 86–95 — one anchor a board and everything else spent on the turn, and the Breachlord at the top of the wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f181',
      name: 'Floor 181',
      enemies: {
        front: [THE_BREACHLORD, CHARNEL_DRUDGE],
        back: [STORMCALLER, SKYSHRIKE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f182',
      name: 'Floor 182',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f183',
      name: 'Floor 183',
      enemies: {
        front: [THE_BREACHLORD, VAULTBOUND_GAOLER],
        back: [NIGHTCANOPY_SINGER, SKYSHRIKE, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-dwarf-f184',
      name: 'Floor 184',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f185',
      name: 'Floor 185',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f186',
      name: 'Floor 186',
      enemies: {
        front: [OATHBREAKER, OATHSHIELD_VANGUARD],
        back: [PYRE, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f187',
      name: 'Floor 187',
      enemies: {
        front: [THE_BREACHLORD, FORLORN_LEVY],
        back: [UNDERVAULT_SAPPER, STORMCALLER, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f188',
      name: 'Floor 188',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [NIGHTCANOPY_SINGER, SERAPH_ADJUDICANT, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-dwarf-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_BREACHLORD, CAIRNWARD_HUSK],
        back: [STORMCALLER, SKYSHRIKE, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f190',
      name: 'Floor 190 — The Wall Comes Down',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f191',
      name: 'Floor 191',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-dwarf-f192',
      name: 'Floor 192',
      enemies: {
        front: [THE_BREACHLORD, FORLORN_LEVY],
        back: [NIGHTCANOPY_SINGER, SKYSHRIKE, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-dwarf-f193',
      name: 'Floor 193',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, SERAPH_ADJUDICANT, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f194',
      name: 'Floor 194',
      enemies: {
        front: [THE_BREACHLORD, OATHSHIELD_VANGUARD],
        back: [PYRE, SKYSHRIKE, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f195',
      name: 'Floor 195',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, SERAPH_ADJUDICANT, PYRE],
      },
    },
    {
      id: 't-dwarf-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [UNDERVAULT_SAPPER, STORMCALLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f197',
      name: 'Floor 197',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [NIGHTCANOPY_SINGER, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_BREACHLORD, VAULTBOUND_GAOLER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, CARRION_SWARM],
      },
    },
    {
      id: 't-dwarf-f199',
      name: 'Floor 199',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [PYRE, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f200',
      name: 'Floor 200 — The Breachlord',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, UNDERVAULT_SAPPER],
      },
    },
  ],
} as const;
