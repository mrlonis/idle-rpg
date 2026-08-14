import {
  ACOLYTE,
  ASHPIT_SCUTTLER,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BOAR,
  BONECHAIN_WARDEN,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDERLING,
  CINDERQUENCH_BEARER,
  CINDER_CULLER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  COVENANT_BREAKER,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  EDGETURN_WARDEN,
  EMBERSEED_WARLOCK,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GLADE_STALKER,
  GLASSCHOIR_ARBITER,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  GRUDGEPLATE_SMITH,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  IRONSLING_WRIGHT,
  KILNSWORN_ADEPT,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  OATHSTONE_BASTION,
  PLUMBLINE_HAND,
  PYRE,
  QUENCHPIT_IRONHIDE,
  QUENCHWRIGHT,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTBORN_HARROWER,
  RIFTEDGE_CANTOR,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SHARDLIGHT_ACOLYTE,
  SLAGBOUND_DRUDGE,
  SLIME,
  SPLINTERYARD_HONER,
  STORMCALLER,
  THE_EDGEWRIGHT,
  THE_GRAVEWRIGHT,
  THE_GRUDGEKEEPER,
  THE_WARDWRIGHT,
  THORNBACK_GRAZER,
  THORNWEALD_WARDEN,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WISP,
  WRATHBORN,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Elf Tower — three hundred floors, enemy levels 1 to 142.
 *
 * ## Why the enemies are mostly Dwarven
 *
 * Dwarves beat Elves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * Just under three fifths of the slots are Dwarven and the rest are spread across the other six
 * factions — [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this
 * paragraph.
 *
 * ⚠️ **The second hundred wanted to be far more Dwarven than that**, exactly as 21e's and 21f's did,
 * and the correction was made while authoring rather than afterwards: non-Dwarf bodies of comparable
 * weight fill the slots where composition is worth nothing anyway. That is a thing to do on purpose,
 * and it is now three sessions for three.
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
 *
 * ## ⚠️ The second hundred escalates through the wall *and* what the wall is hiding
 *
 * Neither shipped escalation transfers, and both were measured on these crews first. 21e thins the
 * anchors and thickens the board's own support; against the Elf pair a shield support in the back
 * rank leaves the weaker arrangement at **100% with 4.25 of five alive**. 21f escalates in front and
 * forbids sustain, because a Dwarf five loses to the ninety-second clock; an Elf five takes this
 * tower's heaviest authorable board in **eleven seconds**, so the clock is not the constraint here
 * and a wall is affordable. What is scarce is *health* — two anchors take the weaker arrangement
 * from 100% to **43%**.
 *
 * So the wall is the point and it is never the threat. {@link EDGETURN_WARDEN} taunts and refuses a
 * crit; behind it {@link IRONSLING_WRIGHT} and {@link THE_WARDWRIGHT} reach the rank an Elf five
 * keeps its support and its casters in. The party's reach — the thing this faction believes it owns
 * — has to be spent on one or the other.
 *
 * ## ⚠️ Below level 108 no board is a fight, and that is structural rather than an authoring failure
 *
 * Band 2's crew stands at level 100 — the highest cap strictly below the roof — while the band opens
 * at level **61**. Measured at floor 101's level, the *lightest* board authorable here resolves in
 * 2.6 seconds and the *heaviest* one — the roof itself — in **2.9**, both with all five alive for
 * both arrangements. Composition buys three tenths of a second across the entire authorable range.
 *
 * That is a fact about the band split rather than about this tower, and the two towers before it
 * hid it: a Dwarf five carries the lowest `atk` in the game, so its own opening floors read 5.5
 * seconds and looked like content. **Do not try to make the bottom of a band 2 hard.** Author it for
 * rhythm and variety, put the escalation where the level line has caught up — here, the last thirty
 * floors — and expect the same reading on 21h–21k.
 *
 * ## What the bands measure at
 *
 * Band 1: floor 1 in one second, floor 50 in five, floor 100 in eleven with one of five down; both
 * arrangements first pay a member at floor 76. Band 2: floor 101 in two and a half seconds, floor
 * 160 in five, floor 200 in twelve at 100% with 4.0 alive, and the alternate five takes the roof at
 * **83% with 2.1**. Within band 2 nobody dies below floor 144 for the alternate or floor 180 for the
 * reference five.
 *
 * ⚠️ **The reference five is never in danger on this tower and the alternate is the whole
 * constraint.** Every board that costs the reference crew a second member takes the alternate below
 * its own 75% bar — the two arrangements measure **nine levels apart** on the roof board, which
 * falls from 100% to 2% for the alternate across eight levels while the reference is still at 100%.
 * Size everything here against the alternate.
 *
 * ⚠️ **No board pairs a taunt with anything that refills**, checked by walking all three hundred
 * floors with a script rather than by reading them. Re-run `npm run test:balance` after touching any
 * band above floor 180.
 *
 * ## ⚠️ The third hundred is one stat, and the negative results are most of the finding
 *
 * The Splintering Yards escalate through **being crit at**, and that is the only mechanic of
 * twenty-odd measured against both arrangements at the roof's level that graded rather than doing
 * nothing or falling off a cliff. Against a control of one anchor plus four identical bodies:
 *
 * | four bodies at                    | reference | alternate |
 * | --------------------------------- | --------- | --------- |
 * | plain front-hitter (control)      | 3.25      | 2.25 · 93% |
 * | `critChance` 0.18 / amp 1.00      | 3.20      | 1.73 · 80% |
 * | `critChance` 0.22 / amp 1.00      | 3.00      | 1.07 · 57% |
 * | `critChance` 0.26 / amp 1.10      | 2.92      | 0.72 · 48% |
 *
 * ⚠️ **Everything else was inert or a cliff.** `enemy-all` reads 98 / 90 / 75% across one, two and
 * three voices and then **0%** at four, which is a trap rather than a dial; `enemy-row-front` is flat
 * at every count from zero to four; reach (`enemy-back`, 98%) and `enemy-highest` (100%) leave a
 * board **easier** than saying nothing; a link takes the weaker five from 2.08 survivors to
 * **4.97**. Do not re-measure these.
 *
 * ⚠️ **It is this tower's lock and not merely an unanswerable one**, which is the test that shelved
 * `dodge` on the Monster Tower. Both swept Elf arrangements carry **zero `critDamageResist` and zero
 * `critBlock`** — the only crew in the game with neither, against the Dwarf five's 0.23 of block and
 * the Angel five's 0.76 of resist — on the lowest mean HP in the game at 461. And the second hundred
 * already made crit this tower's conversation in the mirror direction: {@link EDGETURN_WARDEN} holds
 * the game's highest `critBlock` for the sole purpose of refusing an Elf five's crits.
 *
 * ## ⚠️ The old anchor is heavier than the new roof, and the closing band has to drop it
 *
 * Fielded up its own level line against the band-3 crew, the shipped floor-200 board reads 100% with
 * all five alive at its own level 95, 100% / 4.90 at 125, and **35% with 0.70 survivors** at 142 —
 * the same collapse the Dwarf Tower's third hundred measured, because an `ascended` block climbs at
 * `perLevel.ascended` 1.024 against a mostly-`common` five's 1.021. So {@link THE_EDGEWRIGHT} is
 * **lighter** than {@link THE_WARDWRIGHT} it succeeds (1300/84 against 1560/92).
 *
 * ⚠️ **The same arithmetic applies inside the hundred and it caught a first draft.** The tower's own
 * {@link THE_GRUDGEKEEPER} is 1520/89 — heavier than the new roof — so a board carrying it above
 * level 140 is harder than the roof itself, which measured floor 298 at 2.85 reference survivors
 * against the roof's 3.42. The band drops it after floor 294 and nothing but the Edgewright anchors
 * the last six floors.
 *
 * ⚠️ **Thinning the anchors out entirely is the opposite mistake, and the first draft made that one
 * too.** Boards of five legendaries with no anchor at all measured **flat** across floors 271–295 —
 * 4.00 reference survivors and an alternate reading 4.38 to 4.88, which is *easier* than the boards
 * below them. The Dwarf Tower's finding is that a third hundred's anchors get lighter, not that they
 * go away.
 *
 * ## What the third hundred measures at
 *
 * Floor 201 in two seconds with all five alive, 250 in four, 270 in five with 4.22, 280 in seven
 * with 4.00, 290 in eight with 3.67. The roof takes the reference five 8.2 seconds and costs it 1.58
 * of five; the alternate clears it at **88% with 2.02**. Floor 296 is the second Edgewright board and
 * the only other real fight, at 3.73 and 88%.
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
    // The Root Stair — Floors 1–12, levels 1–6 — delvers and fodder, and the first speed check.
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
    // The Delvers’ Cut — Floors 13–28, levels 7–14 — the locks arrive: a refreshed absorb, a party-wide debuff, an evasion wall.
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
    // The Iron Grove — Floors 29–48, levels 14–23 — armour on both axes, and the first thing that takes an answer back.
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
    // The Stonewright Reach — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
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
    // The Long Siege — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
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
    // The Crown of Stone — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Stonewright waiting above them.
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

    // -------------------------------------------------------------------------------------
    // The Warded Stair — Floors 101–120, levels 48–57 — past the Stonewright's crown the stone is cut with wards, and the first bodies on the stair that do not miss.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f101',
      name: 'Floor 101',
      enemies: { front: [SENTINEL, PLUMBLINE_HAND], back: [RUNEWARDEN, STORMCALLER, SHADE] },
    },
    {
      id: 't-elf-f102',
      name: 'Floor 102',
      enemies: {
        front: [FORGE_THRALL, PLUMBLINE_HAND],
        back: [HEADSMAN, DEEPGALLERY_RUNNER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f103',
      name: 'Floor 103',
      enemies: {
        front: [SENTINEL, VAULTBOUND_GAOLER],
        back: [PLUMBLINE_HAND, RUNEWARDEN, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f104',
      name: 'Floor 104',
      enemies: {
        front: [BULWARK_ENEMY, COLDFORGE_HAND],
        back: [PLUMBLINE_HAND, STORMCALLER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f105',
      name: 'Floor 105',
      enemies: {
        front: [RUNEWARDEN, CAIRNWARD_HUSK],
        back: [PLUMBLINE_HAND, SHADE, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f106',
      name: 'Floor 106',
      enemies: {
        front: [SENTINEL, GRAVEWAKE_THRALL],
        back: [PLUMBLINE_HAND, HEADSMAN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-elf-f107',
      name: 'Floor 107',
      enemies: {
        front: [MARCHWARD_PIKEMAN, PLUMBLINE_HAND],
        back: [RUNEWARDEN, STORMCALLER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f108',
      name: 'Floor 108',
      enemies: {
        front: [BULWARK_ENEMY, SENTINEL],
        back: [PLUMBLINE_HAND, DEEPGALLERY_RUNNER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f109',
      name: 'Floor 109',
      enemies: {
        front: [OATHSHIELD_VANGUARD, CHARNEL_DRUDGE],
        back: [PLUMBLINE_HAND, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f110',
      name: 'Floor 110 — The Warded Stair',
      enemies: { front: [OATHBREAKER, RUNEWARDEN], back: [PLUMBLINE_HAND, SENTINEL, HEADSMAN] },
    },
    {
      id: 't-elf-f111',
      name: 'Floor 111',
      enemies: {
        front: [SENTINEL, PLUMBLINE_HAND],
        back: [RUNEWARDEN, STORMCALLER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f112',
      name: 'Floor 112',
      enemies: {
        front: [RIMEPLATE, CAIRNWARD_HUSK],
        back: [PLUMBLINE_HAND, HEADSMAN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-elf-f113',
      name: 'Floor 113',
      enemies: {
        front: [SENTINEL, SLAGBOUND_DRUDGE],
        back: [PLUMBLINE_HAND, KINGSWAY_LANCER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f114',
      name: 'Floor 114',
      enemies: {
        front: [RUNEWARDEN, BULWARK_ENEMY],
        back: [PLUMBLINE_HAND, HEADSMAN, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-elf-f115',
      name: 'Floor 115',
      enemies: {
        front: [SENTINEL, FORLORN_LEVY],
        back: [QUENCHWRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f116',
      name: 'Floor 116',
      enemies: {
        front: [GRUDGEPLATE_SMITH, MARCHWARD_PIKEMAN],
        back: [PLUMBLINE_HAND, STORMCALLER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f117',
      name: 'Floor 117',
      enemies: {
        front: [SENTINEL, RUNEWARDEN],
        back: [PLUMBLINE_HAND, KINGSWAY_LANCER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-elf-f118',
      name: 'Floor 118',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CAIRNWARD_HUSK],
        back: [PLUMBLINE_HAND, QUENCHWRIGHT, STORMCALLER],
      },
    },
    {
      id: 't-elf-f119',
      name: 'Floor 119',
      enemies: {
        front: [SENTINEL, PLUMBLINE_HAND],
        back: [RUNEWARDEN, HEADSMAN, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-elf-f120',
      name: 'Floor 120 — The Ward Line',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SENTINEL],
        back: [PLUMBLINE_HAND, KINGSWAY_LANCER, STORMCALLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sighting Gallery — Floors 121–140, levels 58–67 — the surveyors' works, where everything on the board already has a line on the rank the party has been hiding behind.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f121',
      name: 'Floor 121',
      enemies: {
        front: [SENTINEL, VAULTBOUND_GAOLER],
        back: [PLUMBLINE_HAND, DEEPGALLERY_RUNNER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f122',
      name: 'Floor 122',
      enemies: {
        front: [RUNEWARDEN, MARCHWARD_PIKEMAN],
        back: [PLUMBLINE_HAND, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f123',
      name: 'Floor 123',
      enemies: {
        front: [BARROW_SOVEREIGN, GRUDGEPLATE_SMITH],
        back: [PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f124',
      name: 'Floor 124',
      enemies: {
        front: [BULWARK_ENEMY, THORNBACK_GRAZER],
        back: [DEEPGALLERY_RUNNER, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f125',
      name: 'Floor 125',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, MARCHWARD_PIKEMAN],
        back: [PLUMBLINE_HAND, RUNEWARDEN, STORMCALLER],
      },
    },
    {
      id: 't-elf-f126',
      name: 'Floor 126',
      enemies: {
        front: [SENTINEL, PLUMBLINE_HAND],
        back: [GRAVEMOURN_KEEPER, GRAVETIDE_HERALD, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f127',
      name: 'Floor 127',
      enemies: {
        front: [OATHBREAKER, COLDFORGE_HAND],
        back: [PLUMBLINE_HAND, HEADSMAN, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-elf-f128',
      name: 'Floor 128',
      enemies: {
        front: [OATHSTONE_BASTION, MARCHWARD_PIKEMAN],
        back: [PLUMBLINE_HAND, RUNEWARDEN, STORMCALLER],
      },
    },
    {
      id: 't-elf-f129',
      name: 'Floor 129',
      enemies: {
        front: [SENTINEL, GRUDGEPLATE_SMITH],
        back: [SEPULCHRE_HOUND, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f130',
      name: 'Floor 130 — The Sighting Gallery',
      enemies: { front: [COLOSSUS, SENTINEL], back: [PLUMBLINE_HAND, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-elf-f131',
      name: 'Floor 131',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, PLUMBLINE_HAND],
        back: [DEEPGALLERY_RUNNER, STORMCALLER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f132',
      name: 'Floor 132',
      enemies: {
        front: [BARROW_SOVEREIGN, SLAGBOUND_DRUDGE],
        back: [PLUMBLINE_HAND, QUENCHWRIGHT, HEADSMAN],
      },
    },
    {
      id: 't-elf-f133',
      name: 'Floor 133',
      enemies: {
        front: [RUNEWARDEN, VAULTBOUND_GAOLER],
        back: [PLUMBLINE_HAND, KINGSWAY_LANCER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f134',
      name: 'Floor 134',
      enemies: {
        front: [GRUDGEPLATE_SMITH, COLDFORGE_HAND],
        back: [PLUMBLINE_HAND, STORMCALLER, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-elf-f135',
      name: 'Floor 135',
      enemies: {
        front: [OATHBREAKER, COLDHEARTH_IRONSWORN],
        back: [PLUMBLINE_HAND, HEADSMAN, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-elf-f136',
      name: 'Floor 136',
      enemies: {
        front: [BULWARK_ENEMY, PLUMBLINE_HAND],
        back: [QUENCHWRIGHT, BARROWMIST_KEENER, COVENANT_BREAKER],
      },
    },
    {
      id: 't-elf-f137',
      name: 'Floor 137',
      enemies: {
        front: [RUNEWARDEN, SLAGBOUND_DRUDGE],
        back: [PLUMBLINE_HAND, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f138',
      name: 'Floor 138',
      enemies: {
        front: [SENTINEL, CAIRNWARD_HUSK],
        back: [DEEPGALLERY_RUNNER, STORMCALLER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f139',
      name: 'Floor 139',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, GRUDGEPLATE_SMITH],
        back: [PLUMBLINE_HAND, RUNEWARDEN, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f140',
      name: 'Floor 140 — The Long Sight',
      enemies: {
        front: [THE_GRUDGEKEEPER, SENTINEL],
        back: [PLUMBLINE_HAND, KINGSWAY_LANCER, STORMCALLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Slingworks — Floors 141–160, levels 67–76 — the engines that throw over a wall, aimed at the rank an Elf five keeps its answers in.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f141',
      name: 'Floor 141',
      enemies: {
        front: [SENTINEL, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, HEADSMAN],
      },
    },
    {
      id: 't-elf-f142',
      name: 'Floor 142',
      enemies: {
        front: [BARROW_SOVEREIGN, FORLORN_LEVY],
        back: [IRONSLING_WRIGHT, DEEPGALLERY_RUNNER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f143',
      name: 'Floor 143',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, PLUMBLINE_HAND],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f144',
      name: 'Floor 144',
      enemies: {
        front: [OATHBREAKER, SLAGBOUND_DRUDGE],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f145',
      name: 'Floor 145',
      enemies: {
        front: [SCARBOUND_BELLOWER, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, DEEPGALLERY_RUNNER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f146',
      name: 'Floor 146',
      enemies: {
        front: [COLOSSUS, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f147',
      name: 'Floor 147',
      enemies: {
        front: [SENTINEL, GRAVEWAKE_THRALL],
        back: [IRONSLING_WRIGHT, QUENCHWRIGHT, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f148',
      name: 'Floor 148',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, PLUMBLINE_HAND],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-elf-f149',
      name: 'Floor 149',
      enemies: {
        front: [OATHSTONE_BASTION, SENTINEL],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, HEADSMAN],
      },
    },
    {
      id: 't-elf-f150',
      name: 'Floor 150 — The Slingworks',
      enemies: {
        front: [THE_GRAVEWRIGHT, RUNEWARDEN],
        back: [IRONSLING_WRIGHT, SENTINEL, STORMCALLER],
      },
    },
    {
      id: 't-elf-f151',
      name: 'Floor 151',
      enemies: {
        front: [BARROW_SOVEREIGN, VAULTBOUND_GAOLER],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f152',
      name: 'Floor 152',
      enemies: {
        front: [RIVEN_MARCHWARDEN, COLDFORGE_HAND],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f153',
      name: 'Floor 153',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, THORNBACK_GRAZER],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, STORMCALLER],
      },
    },
    {
      id: 't-elf-f154',
      name: 'Floor 154',
      enemies: {
        front: [COLOSSUS, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f155',
      name: 'Floor 155',
      enemies: {
        front: [RUNEWARDEN, PLUMBLINE_HAND],
        back: [IRONSLING_WRIGHT, IRONSLING_WRIGHT, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f156',
      name: 'Floor 156',
      enemies: {
        front: [OATHBREAKER, CAIRNWARD_HUSK],
        back: [IRONSLING_WRIGHT, QUENCHWRIGHT, HEADSMAN],
      },
    },
    {
      id: 't-elf-f157',
      name: 'Floor 157',
      enemies: {
        front: [SENTINEL, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f158',
      name: 'Floor 158',
      enemies: {
        front: [OATHSTONE_BASTION, COLDFORGE_HAND],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f159',
      name: 'Floor 159',
      enemies: {
        front: [BARROW_SOVEREIGN, GRAVEWAKE_THRALL],
        back: [IRONSLING_WRIGHT, DEEPGALLERY_RUNNER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f160',
      name: 'Floor 160 — The Overshot',
      enemies: {
        front: [THE_GRUDGEKEEPER, SENTINEL],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Turned Edge — Floors 161–180, levels 76–85 — stone laid so a crit is worth nothing, and behind it the engines finally get their turns.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f161',
      name: 'Floor 161',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f162',
      name: 'Floor 162',
      enemies: {
        front: [EDGETURN_WARDEN, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f163',
      name: 'Floor 163',
      enemies: {
        front: [COLOSSUS, FORLORN_LEVY],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f164',
      name: 'Floor 164',
      enemies: {
        front: [EDGETURN_WARDEN, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, DEEPGALLERY_RUNNER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f165',
      name: 'Floor 165',
      enemies: {
        front: [THE_GRUDGEKEEPER, PLUMBLINE_HAND],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f166',
      name: 'Floor 166',
      enemies: {
        front: [EDGETURN_WARDEN, THORNBACK_GRAZER],
        back: [IRONSLING_WRIGHT, QUENCHWRIGHT, HEADSMAN],
      },
    },
    {
      id: 't-elf-f167',
      name: 'Floor 167',
      enemies: {
        front: [BARROW_SOVEREIGN, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f168',
      name: 'Floor 168',
      enemies: {
        front: [EDGETURN_WARDEN, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, STORMCALLER],
      },
    },
    {
      id: 't-elf-f169',
      name: 'Floor 169',
      enemies: {
        front: [THE_GRAVEWRIGHT, VAULTBOUND_GAOLER],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f170',
      name: 'Floor 170 — The Turned Edge',
      enemies: {
        front: [COLOSSUS, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-elf-f171',
      name: 'Floor 171',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f172',
      name: 'Floor 172',
      enemies: {
        front: [THE_GRUDGEKEEPER, CAIRNWARD_HUSK],
        back: [IRONSLING_WRIGHT, DEEPGALLERY_RUNNER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f173',
      name: 'Floor 173',
      enemies: {
        front: [EDGETURN_WARDEN, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, HEADSMAN],
      },
    },
    {
      id: 't-elf-f174',
      name: 'Floor 174',
      enemies: {
        front: [BARROW_SOVEREIGN, PLUMBLINE_HAND],
        back: [IRONSLING_WRIGHT, QUENCHWRIGHT, STORMCALLER],
      },
    },
    {
      id: 't-elf-f175',
      name: 'Floor 175',
      enemies: {
        front: [EDGETURN_WARDEN, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f176',
      name: 'Floor 176',
      enemies: {
        front: [THE_GRUDGEKEEPER, BONECHAIN_WARDEN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-elf-f177',
      name: 'Floor 177',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, IRONSLING_WRIGHT, HEADSMAN],
      },
    },
    {
      id: 't-elf-f178',
      name: 'Floor 178',
      enemies: {
        front: [THE_GRAVEWRIGHT, GRAVEWAKE_THRALL],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f179',
      name: 'Floor 179',
      enemies: {
        front: [EDGETURN_WARDEN, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f180',
      name: 'Floor 180 — The Blunted Crown',
      enemies: {
        front: [THE_GRUDGEKEEPER, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Wardwright's Cut — Floors 181–200, levels 86–95 — one anchor a board behind a wall that has to come down first, and the Wardwright at the top of the stair.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f181',
      name: 'Floor 181',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, HEADSMAN],
      },
    },
    {
      id: 't-elf-f182',
      name: 'Floor 182',
      enemies: {
        front: [COLOSSUS, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f183',
      name: 'Floor 183',
      enemies: {
        front: [BARROW_SOVEREIGN, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f184',
      name: 'Floor 184',
      enemies: {
        front: [THE_WARDWRIGHT, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f185',
      name: 'Floor 185',
      enemies: {
        front: [EDGETURN_WARDEN, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, HEADSMAN],
      },
    },
    {
      id: 't-elf-f186',
      name: 'Floor 186',
      enemies: {
        front: [BARROW_SOVEREIGN, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f187',
      name: 'Floor 187',
      enemies: {
        front: [THE_GRUDGEKEEPER, SENTINEL],
        back: [IRONSLING_WRIGHT, IRONSLING_WRIGHT, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f188',
      name: 'Floor 188',
      enemies: {
        front: [THE_WARDWRIGHT, COLDHEARTH_IRONSWORN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f189',
      name: 'Floor 189',
      enemies: {
        front: [EDGETURN_WARDEN, COLOSSUS],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f190',
      name: 'Floor 190 — The Wardwright’s Cut',
      enemies: {
        front: [THE_WARDWRIGHT, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, RUNEWARDEN],
      },
    },
    {
      id: 't-elf-f191',
      name: 'Floor 191',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, HEADSMAN],
      },
    },
    {
      id: 't-elf-f192',
      name: 'Floor 192',
      enemies: {
        front: [THE_WARDWRIGHT, SENTINEL],
        back: [IRONSLING_WRIGHT, KINGSWAY_LANCER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f193',
      name: 'Floor 193',
      enemies: {
        front: [THE_GRUDGEKEEPER, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f194',
      name: 'Floor 194',
      enemies: {
        front: [BARROW_SOVEREIGN, MARCHWARD_PIKEMAN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f195',
      name: 'Floor 195',
      enemies: {
        front: [THE_WARDWRIGHT, GRUDGEPLATE_SMITH],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_WARDWRIGHT, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f197',
      name: 'Floor 197',
      enemies: {
        front: [THE_GRUDGEKEEPER, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, PLUMBLINE_HAND, RUNEWARDEN],
      },
    },
    {
      id: 't-elf-f198',
      name: 'Floor 198',
      enemies: {
        front: [EDGETURN_WARDEN, SENTINEL],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-elf-f199',
      name: 'Floor 199',
      enemies: {
        front: [THE_WARDWRIGHT, SENTINEL],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f200',
      name: 'Floor 200 — The Wardwright',
      enemies: {
        front: [THE_WARDWRIGHT, EDGETURN_WARDEN],
        back: [IRONSLING_WRIGHT, RUNEWARDEN, PLUMBLINE_HAND],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Grinding Stair — Floors 201–220, levels 95–104 — the Wardwright is dead and the yards above him are still turning. One body a board carries the new edge, and it is the one that swings.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f201',
      name: 'Floor 201',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [PLUMBLINE_HAND, DEEPGALLERY_RUNNER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f202',
      name: 'Floor 202',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SHARDLIGHT_ACOLYTE, CINDERQUENCH_BEARER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f203',
      name: 'Floor 203',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [PLUMBLINE_HAND, STORMCALLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f204',
      name: 'Floor 204',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f205',
      name: 'Floor 205',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [DEEPGALLERY_RUNNER, VAULTLIGHT_CENSER, STORMCALLER],
      },
    },
    {
      id: 't-elf-f206',
      name: 'Floor 206',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [SHARDLIGHT_ACOLYTE, PLUMBLINE_HAND, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f207',
      name: 'Floor 207',
      enemies: {
        front: [COLDFORGE_HAND, SPLINTERYARD_HONER],
        back: [KILNSWORN_ADEPT, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f208',
      name: 'Floor 208',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SHARDLIGHT_ACOLYTE, SERAPH_ADJUDICANT, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f209',
      name: 'Floor 209',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [PLUMBLINE_HAND, ZENITH_CHORISTER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f210',
      name: 'Floor 210 — The Grinding Stair',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f211',
      name: 'Floor 211',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [CINDERQUENCH_BEARER, KILNSWORN_ADEPT, CINDER_CULLER],
      },
    },
    {
      id: 't-elf-f212',
      name: 'Floor 212',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [DEEPGALLERY_RUNNER, SHARDLIGHT_ACOLYTE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f213',
      name: 'Floor 213',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [VAULTLIGHT_CENSER, PLUMBLINE_HAND, STORMCALLER],
      },
    },
    {
      id: 't-elf-f214',
      name: 'Floor 214',
      enemies: {
        front: [COLDFORGE_HAND, SPLINTERYARD_HONER],
        back: [SERAPH_ADJUDICANT, SHARDLIGHT_ACOLYTE, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f215',
      name: 'Floor 215',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [ZENITH_CHORISTER, KILNSWORN_ADEPT, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f216',
      name: 'Floor 216',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [PLUMBLINE_HAND, SHARDLIGHT_ACOLYTE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f217',
      name: 'Floor 217',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [CINDER_CULLER, ASHPIT_SCUTTLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f218',
      name: 'Floor 218',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [SERAPH_ADJUDICANT, SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f219',
      name: 'Floor 219',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [VAULTLIGHT_CENSER, DEEPGALLERY_RUNNER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f220',
      name: 'Floor 220 — The Whetted Stair',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Splinteryard — Floors 221–245, levels 105–116 — where the edge is put on. Two that swing, and the yard’s own fodder starts carrying a shard of it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f221',
      name: 'Floor 221',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f222',
      name: 'Floor 222',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SERAPH_ADJUDICANT, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f223',
      name: 'Floor 223',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, REDWATER_STALKER],
      },
    },
    {
      id: 't-elf-f224',
      name: 'Floor 224',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, PLUMBLINE_HAND, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f225',
      name: 'Floor 225',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, KILNSWORN_ADEPT, KNELL_CHANTER],
      },
    },
    {
      id: 't-elf-f226',
      name: 'Floor 226',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f227',
      name: 'Floor 227',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, MARROWHUNT_ALPHA, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f228',
      name: 'Floor 228',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-elf-f229',
      name: 'Floor 229',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, PLUMBLINE_HAND, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-elf-f230',
      name: 'Floor 230 — The Splinteryard',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f231',
      name: 'Floor 231',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, KILNSWORN_ADEPT, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f232',
      name: 'Floor 232',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, REDWATER_STALKER],
      },
    },
    {
      id: 't-elf-f233',
      name: 'Floor 233',
      enemies: {
        front: [COLDFORGE_HAND, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, KNELL_CHANTER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f234',
      name: 'Floor 234',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, EMBERSEED_WARLOCK],
      },
    },
    {
      id: 't-elf-f235',
      name: 'Floor 235',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, DEEPGALLERY_RUNNER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-elf-f236',
      name: 'Floor 236',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f237',
      name: 'Floor 237',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, MARROWHUNT_ALPHA, CINDER_CULLER],
      },
    },
    {
      id: 't-elf-f238',
      name: 'Floor 238',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f239',
      name: 'Floor 239',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTSTEP_REAVER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f240',
      name: 'Floor 240 — The Honing Floor',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f241',
      name: 'Floor 241',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SERAPH_ADJUDICANT, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f242',
      name: 'Floor 242',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, REDWATER_STALKER],
      },
    },
    {
      id: 't-elf-f243',
      name: 'Floor 243',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, EMBERSEED_WARLOCK, KNELL_CHANTER],
      },
    },
    {
      id: 't-elf-f244',
      name: 'Floor 244',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-elf-f245',
      name: 'Floor 245',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, PLUMBLINE_HAND],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Cantor's Line — Floors 246–270, levels 117–128 — a third voice, and it is the one that goes looking for whoever is already hurt.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f246',
      name: 'Floor 246',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f247',
      name: 'Floor 247',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f248',
      name: 'Floor 248',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-elf-f249',
      name: 'Floor 249',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f250',
      name: "Floor 250 — The Cantor's Line",
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f251',
      name: 'Floor 251',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f252',
      name: 'Floor 252',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, REDWATER_STALKER],
      },
    },
    {
      id: 't-elf-f253',
      name: 'Floor 253',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-elf-f254',
      name: 'Floor 254',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f255',
      name: 'Floor 255',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-elf-f256',
      name: 'Floor 256',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f257',
      name: 'Floor 257',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f258',
      name: 'Floor 258',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f259',
      name: 'Floor 259',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f260',
      name: 'Floor 260 — The Keening Floor',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f261',
      name: 'Floor 261',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, REDWATER_STALKER],
      },
    },
    {
      id: 't-elf-f262',
      name: 'Floor 262',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f263',
      name: 'Floor 263',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-elf-f264',
      name: 'Floor 264',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f265',
      name: 'Floor 265',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f266',
      name: 'Floor 266',
      enemies: {
        front: [QUENCHWRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-elf-f267',
      name: 'Floor 267',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-elf-f268',
      name: 'Floor 268',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f269',
      name: 'Floor 269',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f270',
      name: 'Floor 270 — The Line Sung Through',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, RIFTEDGE_CANTOR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Glasslight Floor — Floors 271–290, levels 128–137 — a fourth voice, and an anchor back in front of it. Lighter than the Wardwright the band below closed on, because at this height an anchor grows faster than the crew does — and never absent, because without one the band measures flat.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f271',
      name: 'Floor 271',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f272',
      name: 'Floor 272',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f273',
      name: 'Floor 273',
      enemies: {
        front: [IRONSLING_WRIGHT, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f274',
      name: 'Floor 274',
      enemies: {
        front: [OATHSTONE_BASTION, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f275',
      name: 'Floor 275',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f276',
      name: 'Floor 276',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f277',
      name: 'Floor 277',
      enemies: {
        front: [SCARBOUND_BELLOWER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f278',
      name: 'Floor 278',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f279',
      name: 'Floor 279',
      enemies: {
        front: [OATHSTONE_BASTION, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f280',
      name: 'Floor 280 — The Glasslight Floor',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f281',
      name: 'Floor 281',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SPLINTERYARD_HONER],
        back: [RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f282',
      name: 'Floor 282',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f283',
      name: 'Floor 283',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f284',
      name: 'Floor 284',
      enemies: {
        front: [SCARBOUND_BELLOWER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f285',
      name: 'Floor 285',
      enemies: {
        front: [OATHSTONE_BASTION, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f286',
      name: 'Floor 286',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f287',
      name: 'Floor 287',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SPLINTERYARD_HONER],
        back: [RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f288',
      name: 'Floor 288',
      enemies: {
        front: [SCARBOUND_BELLOWER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, GLASSCHOIR_ARBITER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-elf-f289',
      name: 'Floor 289',
      enemies: {
        front: [GRUDGEPLATE_SMITH, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f290',
      name: 'Floor 290 — The Glass Cut True',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER, GLASSCHOIR_ARBITER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Splintering — Floors 291–300, levels 138–142 — no passengers left. The Grudgekeeper takes his last four floors and then the band drops him: at these levels the tower’s own old anchor is heavier than its new roof, so above floor 294 the only thing standing in front is the one who made the edge.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f291',
      name: 'Floor 291',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f292',
      name: 'Floor 292',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f293',
      name: 'Floor 293',
      enemies: {
        front: [RIVEN_MARCHWARDEN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f294',
      name: 'Floor 294',
      enemies: {
        front: [THE_GRUDGEKEEPER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-elf-f295',
      name: 'Floor 295',
      enemies: {
        front: [OATHSTONE_BASTION, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_EDGEWRIGHT, SPLINTERYARD_HONER],
        back: [SERAPH_ADJUDICANT, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f297',
      name: 'Floor 297',
      enemies: {
        front: [SCARBOUND_BELLOWER, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f298',
      name: 'Floor 298',
      enemies: {
        front: [OATHSTONE_BASTION, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f299',
      name: 'Floor 299',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, SPLINTERYARD_HONER],
        back: [SPLINTERYARD_HONER, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-elf-f300',
      name: 'Floor 300 — The Edgewright',
      enemies: {
        front: [THE_EDGEWRIGHT, SPLINTERYARD_HONER],
        back: [PLUMBLINE_HAND, RIFTEDGE_CANTOR, GLASSCHOIR_ARBITER],
      },
    },
  ],
} as const;
