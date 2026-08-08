import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  COLOSSUS,
  GOLEM,
  HAG,
  HEADSMAN,
  HIEROPHANT,
  OATHBREAKER,
  PYRE,
  RAVAGER,
  REVENANT,
  RIMEPLATE,
  SENTINEL,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  TYRANT,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Human Tower — a hundred floors, enemy levels 1 to 60.
 *
 * ## What this file authors, and what it deliberately does not
 *
 * **Line-ups, and nothing else.** A floor's level is a straight line from 1 to 60 drawn by
 * `floorLevel` in `core/towers.ts`; whether it is a mini-boss is the campaign's every-tenth rule
 * reused; and what it pays is read off the campaign's own curves at the **matched enemy level**.
 * Typing a hundred levels that must follow a formula is the retyping
 * [testing](../../docs/testing.md) forbids, and a payout authored here would be a second mechanism
 * on a number the campaign already decides.
 *
 * A floor is therefore three fields, and two of them are its name.
 *
 * ## The floors are numbered, and only the punctuation is named
 *
 * A tower is **one place with a hundred floors**, where a chapter is fifty places. So an ordinary
 * floor is `Floor 37` — which is how a player says where they are, and what the Home card shows —
 * and the every-tenth mini-boss and the roof carry a real name, because those are the handful of
 * moments a climb is remembered by.
 *
 * ## Why the enemies are mostly Undead
 *
 * Undead counter Humans in the matchup cycle, so this is the tower that punishes the crew it
 * admits. About half the slots are Undead and the rest are spread across the other six factions,
 * which is the shape the matrix needs: a mono-Human five meets fights it is unfavoured in *and*
 * fights it is favoured in, rather than a mirror match that would switch the matrix off entirely.
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ⚠️ **It needs no new enemy blocks, and that is why this tower shipped first.** Undead already have
 * five archetypes and the other six factions supply the variety — see
 * [milestones](../../docs/milestones.md) for why the Angel tower, countered by Demons alone, is the
 * one that had to wait.
 *
 * ## Where the difficulty sits
 *
 * Deliberately **inside** the campaign's range: level 60 is a little past halfway through chapter 2,
 * and the campaign runs to 85. A tower is not where difficulty lives — what it asks for is five
 * characters of one faction, which is a demand on the *roster* rather than on investment. The
 * balance target is five Humans at `rare-plus`, level 60, no gear, taking floor 100;
 * [`towers.balance.ts`](./towers.balance.ts) is what holds it.
 *
 * **What the bands measure at**, against that crew: floor 1 resolves in a second, floor 50 in seven,
 * floor 80 in twelve, and floor 100 in twenty-four with two of the five dead. The win rate is 100%
 * the whole way, which is the intended shape — a floor is climbed once and there is no way around
 * one, so a floor the crew cannot pass stops the tower. What ramps is **what it costs**, not whether
 * it is possible: nobody dies below floor 80, and a second Human five that is not the reference one
 * takes the roof 85% of the time. ⚠️ Difficulty here is almost entirely the **front rank's weight** —
 * two ascended blocks in front of three legendaries is the top band, and pairing the two heaviest
 * hitters (an Unmade beside a Tyrant) drops the crew to single-digit win rates rather than making the
 * floor harder. Re-run `npm run test:balance` after touching any band above 68.
 */
export const TOWER_HUMAN = {
  id: 'tower-human',
  name: 'Human Tower',
  faction: 'human',
  /**
   * Open at the auto-battle unlock.
   *
   * Twelve clears is the end of the campaign's opening run of locks — the stretch that teaches a
   * player what a party is for — and it is deliberately early: somebody walled at the chapter-1
   * healer lock should already have somewhere to send an unlucky pull. Authored rather than read off
   * `AUTO_BATTLE_UNLOCK_CLEARS`, because these are two decisions that happen to agree rather than
   * one fact stated twice.
   */
  unlockClears: 12,
  floors: [
    // -------------------------------------------------------------------------------------
    // The Lower Steps — Floors 1–12, levels 1–8 — fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f1',
      name: 'Floor 1',
      enemies: { front: [WISP], back: [SLIME] },
    },
    {
      id: 't-human-f2',
      name: 'Floor 2',
      enemies: { front: [SLIME], back: [WISP, BOAR] },
    },
    {
      id: 't-human-f3',
      name: 'Floor 3',
      enemies: { front: [REVENANT], back: [WISP, SLIME] },
    },
    {
      id: 't-human-f4',
      name: 'Floor 4',
      enemies: { front: [BOAR], back: [WISP, WISP] },
    },
    {
      id: 't-human-f5',
      name: 'Floor 5',
      enemies: { front: [REVENANT, SLIME], back: [WISP, BOAR] },
    },
    {
      id: 't-human-f6',
      name: 'Floor 6',
      enemies: { front: [BANDIT], back: [WISP, REVENANT] },
    },
    {
      id: 't-human-f7',
      name: 'Floor 7',
      enemies: { front: [BOAR, SLIME], back: [REVENANT, WISP] },
    },
    {
      id: 't-human-f8',
      name: 'Floor 8',
      enemies: { front: [REVENANT], back: [WISP, BOAR, SLIME] },
    },
    {
      id: 't-human-f9',
      name: 'Floor 9',
      enemies: { front: [WISP, BOAR], back: [REVENANT, SLIME] },
    },
    {
      id: 't-human-f10',
      name: 'Floor 10 — The Barrow Gate',
      enemies: { front: [REVENANT, BOAR], back: [WISP, WISP, SLIME] },
    },
    {
      id: 't-human-f11',
      name: 'Floor 11',
      enemies: { front: [BANDIT, SLIME], back: [WISP, REVENANT] },
    },
    {
      id: 't-human-f12',
      name: 'Floor 12',
      enemies: { front: [WISP], back: [SLIME] },
    },

    // -------------------------------------------------------------------------------------
    // The Ossuary Stair — Floors 13–28, levels 8–17 — the locks arrive: a healer behind two bodies, a party-wide debuff, an evasion wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f13',
      name: 'Floor 13',
      enemies: { front: [REVENANT, BOAR], back: [WISP, ACOLYTE] },
    },
    {
      id: 't-human-f14',
      name: 'Floor 14',
      enemies: { front: [GOLEM, SLIME], back: [SHADE, WISP] },
    },
    {
      id: 't-human-f15',
      name: 'Floor 15',
      enemies: { front: [BOAR, BANDIT], back: [HAG, WISP, SLIME] },
    },
    {
      id: 't-human-f16',
      name: 'Floor 16',
      enemies: { front: [REVENANT, BANDIT], back: [HAG, SHADE] },
    },
    {
      id: 't-human-f17',
      name: 'Floor 17',
      enemies: { front: [SLIME, REVENANT], back: [SHADE, PYRE] },
    },
    {
      id: 't-human-f18',
      name: 'Floor 18',
      enemies: { front: [BOAR, BANDIT], back: [HAG, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f19',
      name: 'Floor 19',
      enemies: { front: [REVENANT, SLIME], back: [PYRE, WISP, SHADE] },
    },
    {
      id: 't-human-f20',
      name: 'Floor 20 — The Weeping Reliquary',
      enemies: { front: [REVENANT, GOLEM], back: [HAG, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f21',
      name: 'Floor 21',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f22',
      name: 'Floor 22',
      enemies: { front: [GOLEM, BOAR], back: [HAG, SHADE, WISP] },
    },
    {
      id: 't-human-f23',
      name: 'Floor 23',
      enemies: { front: [REVENANT, BANDIT], back: [SKYSHRIKE, HAG] },
    },
    {
      id: 't-human-f24',
      name: 'Floor 24',
      enemies: { front: [GOLEM, REVENANT], back: [ACOLYTE, SHADE] },
    },
    {
      id: 't-human-f25',
      name: 'Floor 25',
      enemies: { front: [BOAR, REVENANT], back: [PYRE, HAG, WISP] },
    },
    {
      id: 't-human-f26',
      name: 'Floor 26',
      enemies: { front: [BULWARK_ENEMY, BANDIT], back: [SHADE, WISP, ACOLYTE] },
    },
    {
      id: 't-human-f27',
      name: 'Floor 27',
      enemies: { front: [REVENANT, BOAR], back: [WISP, ACOLYTE] },
    },
    {
      id: 't-human-f28',
      name: 'Floor 28',
      enemies: { front: [GOLEM, SLIME], back: [SHADE, WISP] },
    },

    // -------------------------------------------------------------------------------------
    // The Hollow Gallery — Floors 29–48, levels 18–29 — the executioner, armour on both axes, and every lock met in combination.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f29',
      name: 'Floor 29',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f30',
      name: 'Floor 30 — The Gallows Arch',
      enemies: { front: [REVENANT, RIMEPLATE], back: [HEADSMAN, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f31',
      name: 'Floor 31',
      enemies: { front: [HEADSMAN, BOAR], back: [SHADE, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f32',
      name: 'Floor 32',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [HAG, SHADE] },
    },
    {
      id: 't-human-f33',
      name: 'Floor 33',
      enemies: { front: [GOLEM, RIMEPLATE], back: [SHADE, HAG, WISP] },
    },
    {
      id: 't-human-f34',
      name: 'Floor 34',
      enemies: { front: [SENTINEL, REVENANT], back: [HEADSMAN, HAG] },
    },
    {
      id: 't-human-f35',
      name: 'Floor 35',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SKYSHRIKE, SHADE] },
    },
    {
      id: 't-human-f36',
      name: 'Floor 36',
      enemies: { front: [RAVAGER, BOAR], back: [HAG, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f37',
      name: 'Floor 37',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [PYRE, SHADE] },
    },
    {
      id: 't-human-f38',
      name: 'Floor 38',
      enemies: { front: [GOLEM, HEADSMAN], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f39',
      name: 'Floor 39',
      enemies: { front: [SENTINEL, REVENANT], back: [HAG, SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f40',
      name: 'Floor 40 — The Gallows Arch',
      enemies: { front: [REVENANT, RIMEPLATE], back: [HEADSMAN, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f41',
      name: 'Floor 41',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HEADSMAN, SHADE, HAG] },
    },
    {
      id: 't-human-f42',
      name: 'Floor 42',
      enemies: { front: [WRATHBORN, REVENANT], back: [SHADE, HAG] },
    },
    {
      id: 't-human-f43',
      name: 'Floor 43',
      enemies: { front: [HEADSMAN, GOLEM], back: [HAG, SKYSHRIKE, SHADE] },
    },
    {
      id: 't-human-f44',
      name: 'Floor 44',
      enemies: { front: [RAVAGER, RIMEPLATE], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f45',
      name: 'Floor 45',
      enemies: { front: [SENTINEL, HEADSMAN], back: [HAG, SHADE, WISP] },
    },
    {
      id: 't-human-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, REVENANT], back: [HEADSMAN, PYRE] },
    },
    {
      id: 't-human-f47',
      name: 'Floor 47',
      enemies: { front: [BULWARK_ENEMY, HEADSMAN], back: [SHADE, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f48',
      name: 'Floor 48',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SHADE, STORMCALLER] },
    },

    // -------------------------------------------------------------------------------------
    // The Bonefall Reach — Floors 49–68, levels 29–41 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f49',
      name: 'Floor 49',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-human-f50',
      name: 'Floor 50 — The Bonefall Throne',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f51',
      name: 'Floor 51',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f52',
      name: 'Floor 52',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HAG, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f53',
      name: 'Floor 53',
      enemies: { front: [SENTINEL, RIMEPLATE], back: [HEADSMAN, STORMCALLER, PYRE] },
    },
    {
      id: 't-human-f54',
      name: 'Floor 54',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f55',
      name: 'Floor 55',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [SHADE, SKYSHRIKE, PYRE] },
    },
    {
      id: 't-human-f56',
      name: 'Floor 56',
      enemies: { front: [SENTINEL, HEADSMAN], back: [HAG, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f57',
      name: 'Floor 57',
      enemies: { front: [RIMEPLATE, RAVAGER], back: [SHADE, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f58',
      name: 'Floor 58',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, HIEROPHANT, HAG] },
    },
    {
      id: 't-human-f59',
      name: 'Floor 59',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f60',
      name: 'Floor 60 — The Bonefall Throne',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f61',
      name: 'Floor 61',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SHADE, WRATHBORN, SKYSHRIKE] },
    },
    {
      id: 't-human-f62',
      name: 'Floor 62',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [HEADSMAN, SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f63',
      name: 'Floor 63',
      enemies: { front: [SENTINEL, HEADSMAN], back: [SHADE, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-human-f64',
      name: 'Floor 64',
      enemies: { front: [HEADSMAN, RAVAGER], back: [HIEROPHANT, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f65',
      name: 'Floor 65',
      enemies: { front: [RIMEPLATE, SENTINEL], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f66',
      name: 'Floor 66',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-human-f67',
      name: 'Floor 67',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f68',
      name: 'Floor 68',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HAG, SHADE, SKYSHRIKE] },
    },

    // -------------------------------------------------------------------------------------
    // The Long Vigil — Floors 69–84, levels 41–50 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f69',
      name: 'Floor 69',
      enemies: { front: [HEADSMAN, TYRANT], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f70',
      name: 'Floor 70 — The Vigil Gate',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f71',
      name: 'Floor 71',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [SHADE, HAG] },
    },
    {
      id: 't-human-f72',
      name: 'Floor 72',
      enemies: { front: [HEADSMAN, WARDEN], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f73',
      name: 'Floor 73',
      enemies: { front: [TYRANT, HEADSMAN], back: [SHADE, HIEROPHANT, HAG] },
    },
    {
      id: 't-human-f74',
      name: 'Floor 74',
      enemies: { front: [HEADSMAN, COLOSSUS], back: [STORMCALLER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f75',
      name: 'Floor 75',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [SHADE, HAG, HEADSMAN] },
    },
    {
      id: 't-human-f76',
      name: 'Floor 76',
      enemies: { front: [HEADSMAN, TYRANT], back: [HIEROPHANT, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f77',
      name: 'Floor 77',
      enemies: { front: [SENTINEL, COLOSSUS], back: [HEADSMAN, SHADE, PYRE] },
    },
    {
      id: 't-human-f78',
      name: 'Floor 78',
      enemies: { front: [HEADSMAN, OATHBREAKER], back: [SHADE, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f79',
      name: 'Floor 79',
      enemies: { front: [TYRANT, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f80',
      name: 'Floor 80 — The Vigil Gate',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f81',
      name: 'Floor 81',
      enemies: { front: [HEADSMAN, COLOSSUS], back: [SHADE, WRATHBORN, HEADSMAN] },
    },
    {
      id: 't-human-f82',
      name: 'Floor 82',
      enemies: { front: [WARDEN, HEADSMAN], back: [HEADSMAN, SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f83',
      name: 'Floor 83',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [SHADE, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f84',
      name: 'Floor 84',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, SHADE, STORMCALLER] },
    },

    // -------------------------------------------------------------------------------------
    // The Roof — Floors 85–100, levels 51–60 — two ascended blocks in front of three legendaries, and the Oathbreaker waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f85',
      name: 'Floor 85',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, SHADE, HAG] },
    },
    {
      id: 't-human-f86',
      name: 'Floor 86',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f87',
      name: 'Floor 87',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f88',
      name: 'Floor 88',
      enemies: { front: [TYRANT, WARDEN], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f89',
      name: 'Floor 89',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HEADSMAN, WRATHBORN, SHADE] },
    },
    {
      id: 't-human-f90',
      name: 'Floor 90 — The Crown Stair',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f91',
      name: 'Floor 91',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f92',
      name: 'Floor 92',
      enemies: { front: [OATHBREAKER, TYRANT], back: [HEADSMAN, SHADE, PYRE] },
    },
    {
      id: 't-human-f93',
      name: 'Floor 93',
      enemies: { front: [WARDEN, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f94',
      name: 'Floor 94',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f95',
      name: 'Floor 95',
      enemies: { front: [TYRANT, OATHBREAKER], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f96',
      name: 'Floor 96',
      enemies: { front: [COLOSSUS, WARDEN], back: [HEADSMAN, SKYSHRIKE, HIEROPHANT] },
    },
    {
      id: 't-human-f97',
      name: 'Floor 97',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f98',
      name: 'Floor 98',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f99',
      name: 'Floor 99',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f100',
      name: 'Floor 100 — The Oathbreaker',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HIEROPHANT, STORMCALLER, HEADSMAN] },
    },
  ],
} as const;
