import {
  ACOLYTE,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BOAR,
  BONECHAIN_WARDEN,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CHARNEL_DRUDGE,
  COLOSSUS,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  HIEROPHANT,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  PYRE,
  RAVAGER,
  RELIQUARY_BEARER,
  REVENANT,
  RIMEPLATE,
  SENTINEL,
  SEPULCHRE_HOUND,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  THE_DEATHLESS_MARSHAL,
  TYRANT,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Human Tower — two hundred floors, enemy levels 1 to 120.
 *
 * ## What this file authors, and what it deliberately does not
 *
 * **Line-ups, and nothing else.** A floor's level is a straight line from 1 to 120 drawn by
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
 * A tower is **one place with two hundred floors**, where a chapter is fifty places. So an ordinary
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
 * ⚠️ **It needed no new enemy blocks, and that is why this tower shipped first.** Undead already had
 * five archetypes where Elves and Angels had one each, so the Human Tower is the only one milestone
 * 15b could author without also authoring content. The other six, and the eighteen blocks that made
 * them possible, are 15c — see [milestones](../../docs/milestones.md).
 *
 * The second hundred needed four, which is the ratio worth reading: **a chapter gets ten because it
 * authors five bands each asking a different question, and a tower gets four because it asks one
 * question a hundred more times.** They are the Charnel Drudge, the Nightmarch Outrider, the
 * Reliquary Bearer and The Deathless Marshal, and Undead go 17 → 21.
 *
 * ## Where the difficulty sits
 *
 * Deliberately **inside** the campaign's range: the ladder first reaches level 120 at `c5-s24` and
 * runs to 588. A tower is not where difficulty lives — what it asks for is five characters of one
 * faction, which is a demand on the *roster* rather than on investment. Two balance targets, one per
 * band, both derived from the level line: five Humans at `rare-plus`/60 over floors 1–100, and the
 * same five at `elite`/100 over floors 101–200, neither wearing gear.
 * [`towers.balance.ts`](./towers.balance.ts) is what holds them.
 *
 * **What the bands measure at.** Band 1: floor 1 resolves in a second, floor 50 in seven, floor 80 in
 * twelve, floor 100 in twenty-four with two of the five dead. Band 2: floor 101 in four seconds,
 * floor 160 in nine, floor 200 in twenty with 3.4 alive at 95%. Win rate is 100% almost the whole
 * way, which is the intended shape — a floor is climbed once and there is no way around one, so a
 * floor the crew cannot pass stops the tower. What ramps is **what it costs**: nobody dies below
 * floor 80 in band 1 or floor 185 in band 2, and the alternate Human five takes each roof at 85% and
 * 83%.
 *
 * ## ⚠️ The second hundred escalates through the level line, not by stacking anchors
 *
 * The shipped hundred's climax is two `ascended` blocks in every front rank. **Band 2 cannot end that
 * way**, and the reason is the alternate five rather than the reference one: measured at level 120, a
 * two-`ascended` board reads 93% for the reference crew and **7%** for the alternate against its own
 * 75% bar. The alternate clears two-anchor boards to about level 108 and falls off a cliff by 117.
 *
 * So the last twenty floors thin the anchors out and thicken the board's own **support** — a link, a
 * shield and a taunt — and let the level line carry the difficulty. That is the inverse of the first
 * hundred's shape and it is a finding rather than a preference.
 *
 * ⚠️ **No board pairs the taunt with a body that heals**, which is 15c's Dwarf Tower roof failure
 * written as a rule: against a party that cannot burst, sustain it is not allowed to aim at is the
 * ninety-second clock rather than a lock. Four boards broke it before shipping and were caught by
 * walking all two hundred with a script rather than by reading them. **The Reliquary Bearer's shield
 * is the deliberate exception and it is not one**: a pool banked once depletes, where a heal refills.
 * The small `lifeLeech` the Undead legendaries carry is likewise not sustain the party has to outpace
 * — and the zero-timeout assertion reads every one of the two hundred floors, for both crews.
 *
 * ⚠️ Difficulty here is otherwise almost entirely the **front rank's weight** — two ascended blocks
 * in front of three legendaries is band 1's top, and pairing the two heaviest hitters (an Unmade
 * beside a Tyrant) drops the crew to single-digit win rates rather than making the floor harder.
 * Re-run `npm run test:balance` after touching any band above floor 68 or floor 180.
 */
export const TOWER_HUMAN = {
  id: 'tower-human',
  name: 'Human Tower',
  faction: 'human',
  /**
   * Open at the auto-battle unlock.
   *
   * Ten clears is the whole of the re-cut chapter 1 — the stretch that teaches a player what a
   * party is for — and it is deliberately early: somebody walled at the chapter-1 healer lock
   * should already have somewhere to send an unlucky pull. Authored rather than read off
   * `AUTO_BATTLE_UNLOCK_CHAPTERS`, because these are two decisions that happen to agree rather
   * than one fact stated twice; `towers.spec.ts` is what holds the agreement.
   */
  unlockClears: 10,
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
    // The Bonefall Reach — Floors 49–68, levels 30–41 — two walls a floor, and the first boards with no soft slot in them.
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
    // The Long Vigil — Floors 69–84, levels 42–51 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
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

    // -------------------------------------------------------------------------------------
    // The Barrow Road — Floors 101–120, levels 61–72 — the ground under the tower, and the blocks the first hundred never met.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f101',
      name: 'Floor 101',
      enemies: { front: [HEADSMAN, CHARNEL_DRUDGE], back: [SHADE, HAG, GRAVEWAKE_THRALL] },
    },
    {
      id: 't-human-f102',
      name: 'Floor 102',
      enemies: {
        front: [CAIRNWARD_HUSK, HEADSMAN],
        back: [SKYSHRIKE, BARROWMIST_KEENER, SENTINEL],
      },
    },
    {
      id: 't-human-f103',
      name: 'Floor 103',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [SHADE, BULWARK_ENEMY, SEPULCHRE_HOUND] },
    },
    {
      id: 't-human-f104',
      name: 'Floor 104',
      enemies: { front: [HEADSMAN, WARDEN], back: [GRAVEMOURN_KEEPER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f105',
      name: 'Floor 105',
      enemies: { front: [CHARNEL_DRUDGE, COLOSSUS], back: [SHADE, WRATHBORN, BARROWMIST_KEENER] },
    },
    {
      id: 't-human-f106',
      name: 'Floor 106',
      enemies: { front: [HEADSMAN, CAIRNWARD_HUSK], back: [GRAVETIDE_HERALD, ACOLYTE, HAG] },
    },
    {
      id: 't-human-f107',
      name: 'Floor 107',
      enemies: { front: [TYRANT, HEADSMAN], back: [SHADE, SEPULCHRE_HOUND, RAVAGER] },
    },
    {
      id: 't-human-f108',
      name: 'Floor 108',
      enemies: { front: [CHARNEL_DRUDGE, HEADSMAN], back: [GOLEM, GRAVEMOURN_KEEPER, SKYSHRIKE] },
    },
    {
      id: 't-human-f109',
      name: 'Floor 109',
      enemies: { front: [WARDEN, CHARNEL_DRUDGE], back: [SHADE, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f110',
      name: 'Floor 110 — The Barrow Gate',
      enemies: { front: [BARROW_SOVEREIGN, STORMCALLER], back: [PYRE, HAG, HEADSMAN] },
    },
    {
      id: 't-human-f111',
      name: 'Floor 111',
      enemies: { front: [HEADSMAN, CHARNEL_DRUDGE], back: [GRAVETIDE_HERALD, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f112',
      name: 'Floor 112',
      enemies: { front: [CAIRNWARD_HUSK, TYRANT], back: [SKYSHRIKE, SENTINEL, RIMEPLATE] },
    },
    {
      id: 't-human-f113',
      name: 'Floor 113',
      enemies: { front: [CHARNEL_DRUDGE, HEADSMAN], back: [GRAVEMOURN_KEEPER, SHADE, PYRE] },
    },
    {
      id: 't-human-f114',
      name: 'Floor 114',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [PYRE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f115',
      name: 'Floor 115',
      enemies: { front: [WRATHBORN, CAIRNWARD_HUSK], back: [SHADE, GRAVETIDE_HERALD, RIMEPLATE] },
    },
    {
      id: 't-human-f116',
      name: 'Floor 116',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [HEADSMAN, ACOLYTE, BULWARK_ENEMY] },
    },
    {
      id: 't-human-f117',
      name: 'Floor 117',
      enemies: { front: [CHARNEL_DRUDGE, WARDEN], back: [GRAVEMOURN_KEEPER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f118',
      name: 'Floor 118',
      enemies: { front: [RAVAGER, COLOSSUS], back: [SKYSHRIKE, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f119',
      name: 'Floor 119',
      enemies: { front: [CAIRNWARD_HUSK, HEADSMAN], back: [SHADE, GRAVETIDE_HERALD, HEADSMAN] },
    },
    {
      id: 't-human-f120',
      name: 'Floor 120 — The Ossuary Door',
      enemies: { front: [BARROW_SOVEREIGN, COLOSSUS], back: [PYRE, STORMCALLER, HIEROPHANT] },
    },

    // -------------------------------------------------------------------------------------
    // The Reliquary — Floors 121–140, levels 73–84 — a board that has to be spent twice, and a wall that charges for being hit.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f121',
      name: 'Floor 121',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, HEADSMAN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f122',
      name: 'Floor 122',
      enemies: { front: [SENTINEL, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, GOLEM, SKYSHRIKE] },
    },
    {
      id: 't-human-f123',
      name: 'Floor 123',
      enemies: { front: [TYRANT, CAIRNBOUND_SENTINEL], back: [RELIQUARY_BEARER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f124',
      name: 'Floor 124',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, PYRE] },
    },
    {
      id: 't-human-f125',
      name: 'Floor 125',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, WRATHBORN, HAG],
      },
    },
    {
      id: 't-human-f126',
      name: 'Floor 126',
      enemies: { front: [HEADSMAN, WARDEN], back: [RELIQUARY_BEARER, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f127',
      name: 'Floor 127',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [RELIQUARY_BEARER, ACOLYTE, RIMEPLATE] },
    },
    {
      id: 't-human-f128',
      name: 'Floor 128',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, RAVAGER],
        back: [GRAVEMOURN_KEEPER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f129',
      name: 'Floor 129',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f130',
      name: 'Floor 130 — The Reliquary',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f131',
      name: 'Floor 131',
      enemies: {
        front: [STORMCALLER, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, PYRE],
      },
    },
    {
      id: 't-human-f132',
      name: 'Floor 132',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f133',
      name: 'Floor 133',
      enemies: { front: [CAIRNBOUND_SENTINEL, TYRANT], back: [RELIQUARY_BEARER, SHADE, HAG] },
    },
    {
      id: 't-human-f134',
      name: 'Floor 134',
      enemies: {
        front: [OATHBREAKER, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-human-f135',
      name: 'Floor 135',
      enemies: {
        front: [SENTINEL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVEMOURN_KEEPER, PYRE],
      },
    },
    {
      id: 't-human-f136',
      name: 'Floor 136',
      enemies: { front: [WARDEN, HEADSMAN], back: [RELIQUARY_BEARER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f137',
      name: 'Floor 137',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [RELIQUARY_BEARER, PYRE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f138',
      name: 'Floor 138',
      enemies: { front: [TYRANT, WRATHBORN], back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, SHADE] },
    },
    {
      id: 't-human-f139',
      name: 'Floor 139',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, HEADSMAN, WRATHBORN],
      },
    },
    {
      id: 't-human-f140',
      name: 'Floor 140 — The Sealed Vault',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [RELIQUARY_BEARER, ACOLYTE, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Nightmarch — Floors 141–160, levels 85–96 — reach at speed, so the back rank stops being somewhere safe to stand.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f141',
      name: 'Floor 141',
      enemies: { front: [RAVAGER, CAIRNWARD_HUSK], back: [NIGHTMARCH_OUTRIDER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f142',
      name: 'Floor 142',
      enemies: { front: [TYRANT, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, HAG, SKYSHRIKE] },
    },
    {
      id: 't-human-f143',
      name: 'Floor 143',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, STORMCALLER],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f144',
      name: 'Floor 144',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [NIGHTMARCH_OUTRIDER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f145',
      name: 'Floor 145',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, SHADE, GOLEM] },
    },
    {
      id: 't-human-f146',
      name: 'Floor 146',
      enemies: {
        front: [SENTINEL, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f147',
      name: 'Floor 147',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [NIGHTMARCH_OUTRIDER, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f148',
      name: 'Floor 148',
      enemies: { front: [WARDEN, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HAG] },
    },
    {
      id: 't-human-f149',
      name: 'Floor 149',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [NIGHTMARCH_OUTRIDER, PYRE, WRATHBORN],
      },
    },
    {
      id: 't-human-f150',
      name: 'Floor 150 — The Night Road',
      enemies: {
        front: [BARROW_SOVEREIGN, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f151',
      name: 'Floor 151',
      enemies: {
        front: [HEADSMAN, CHARNEL_DRUDGE],
        back: [NIGHTMARCH_OUTRIDER, ACOLYTE, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f152',
      name: 'Floor 152',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, RAVAGER],
      },
    },
    {
      id: 't-human-f153',
      name: 'Floor 153',
      enemies: {
        front: [TYRANT, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, GRAVEMOURN_KEEPER, RIMEPLATE],
      },
    },
    {
      id: 't-human-f154',
      name: 'Floor 154',
      enemies: {
        front: [COLOSSUS, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f155',
      name: 'Floor 155',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [NIGHTMARCH_OUTRIDER, STORMCALLER, SHADE],
      },
    },
    {
      id: 't-human-f156',
      name: 'Floor 156',
      enemies: { front: [HEADSMAN, WARDEN], back: [NIGHTMARCH_OUTRIDER, PYRE, RIMEPLATE] },
    },
    {
      id: 't-human-f157',
      name: 'Floor 157',
      enemies: {
        front: [OATHBREAKER, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HAG],
      },
    },
    {
      id: 't-human-f158',
      name: 'Floor 158',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, SENTINEL],
      },
    },
    {
      id: 't-human-f159',
      name: 'Floor 159',
      enemies: {
        front: [HEADSMAN, COLOSSUS],
        back: [NIGHTMARCH_OUTRIDER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f160',
      name: 'Floor 160 — The Standing Watch',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Deathless Watch — Floors 161–180, levels 97–108 — two ascended blocks on every front rank, which is as heavy as this tower's anchors go.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f161',
      name: 'Floor 161',
      enemies: { front: [OATHBREAKER, WRATHBORN], back: [HIEROPHANT, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f162',
      name: 'Floor 162',
      enemies: { front: [TYRANT, COLOSSUS], back: [RELIQUARY_BEARER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f163',
      name: 'Floor 163',
      enemies: {
        front: [BARROW_SOVEREIGN, RAVAGER],
        back: [NIGHTMARCH_OUTRIDER, SHADE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f164',
      name: 'Floor 164',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, HEADSMAN, PYRE],
      },
    },
    {
      id: 't-human-f165',
      name: 'Floor 165',
      enemies: { front: [COLOSSUS, TYRANT], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f166',
      name: 'Floor 166',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f167',
      name: 'Floor 167',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [SHADE, STORMCALLER, GOLEM] },
    },
    {
      id: 't-human-f168',
      name: 'Floor 168',
      enemies: { front: [TYRANT, HEADSMAN], back: [HIEROPHANT, RELIQUARY_BEARER, PYRE] },
    },
    {
      id: 't-human-f169',
      name: 'Floor 169',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f170',
      name: 'Floor 170 — The Deathless Watch',
      enemies: {
        front: [OATHBREAKER, TYRANT],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f171',
      name: 'Floor 171',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SENTINEL, SHADE],
      },
    },
    {
      id: 't-human-f172',
      name: 'Floor 172',
      enemies: {
        front: [BARROW_SOVEREIGN, HEADSMAN],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f173',
      name: 'Floor 173',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, HAG],
      },
    },
    {
      id: 't-human-f174',
      name: 'Floor 174',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f175',
      name: 'Floor 175',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SHADE] },
    },
    {
      id: 't-human-f176',
      name: 'Floor 176',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SKYSHRIKE, RIMEPLATE],
      },
    },
    {
      id: 't-human-f177',
      name: 'Floor 177',
      enemies: {
        front: [OATHBREAKER, WRATHBORN],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f178',
      name: 'Floor 178',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f179',
      name: 'Floor 179',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f180',
      name: 'Floor 180 — The Last Landing',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Marshal's Hall — Floors 181–200, levels 109–120 — the anchors thin out and the board's own support thickens, and the level line carries the rest.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f181',
      name: 'Floor 181',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f182',
      name: 'Floor 182',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f183',
      name: 'Floor 183',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HAG],
      },
    },
    {
      id: 't-human-f184',
      name: 'Floor 184',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f185',
      name: 'Floor 185',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f186',
      name: 'Floor 186',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SKYSHRIKE, RAVAGER],
      },
    },
    {
      id: 't-human-f187',
      name: 'Floor 187',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f188',
      name: 'Floor 188',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-human-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f190',
      name: 'Floor 190 — The Hall of Standards',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, STORMCALLER],
      },
    },
    {
      id: 't-human-f191',
      name: 'Floor 191',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-human-f192',
      name: 'Floor 192',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, NIGHTMARCH_OUTRIDER, SHADE],
      },
    },
    {
      id: 't-human-f193',
      name: 'Floor 193',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, CAIRNWARD_HUSK, HEADSMAN],
      },
    },
    {
      id: 't-human-f194',
      name: 'Floor 194',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f195',
      name: 'Floor 195',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-human-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SKYSHRIKE, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-human-f197',
      name: 'Floor 197',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, CAIRNWARD_HUSK, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f199',
      name: 'Floor 199',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, NIGHTMARCH_OUTRIDER, SHADE],
      },
    },
    {
      id: 't-human-f200',
      name: 'Floor 200 — The Deathless Marshal',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
  ],
} as const;
