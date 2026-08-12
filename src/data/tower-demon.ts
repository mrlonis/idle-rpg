import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  BANDIT,
  BARROW_SOVEREIGN,
  BLOODGORGE_HOUND,
  BOAR,
  CINDERLING,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  CONCORD_CANTOR,
  DEEPROCK_MINER,
  FREE_BLADE,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  GRAVETIDE_HERALD,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOW_SERAPH,
  KNELL_CHANTER,
  LITANY_BEARER,
  LUMEN_ACOLYTE,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHSHIELD_VANGUARD,
  RADIANT_HERALD,
  REVENANT,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  STILLNESS_CANTOR,
  STORMCALLER,
  THE_UNISON,
  UNMADE,
  VAULTLIGHT_CENSER,
  WEALDSHADOW_STALKER,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Demon Tower — two hundred floors, enemy levels 1 to 120.
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
 * because that is the stat it is worst at. So the currency the shipped hundred charges in is
 * **incoming damage that does not care what it hits**: a Pillar of Light through the back rank, an
 * Ashen Choir putting a refreshed absorb on the fodder, and a Hierophant at the top that heals and
 * shields from the same turn economy.
 *
 * ## ⚠️ The second hundred: a Demon five is answered board-wide or it is not answered at all
 *
 * The seventh and last tower session, and the seventh different answer to "how does a tower
 * escalate". Measured against both arrangements at the roof's level before a floor was authored, on
 * a controlled board of one anchor plus four bodies all asking the same question, forty seeds — mean
 * survivors of five, reference / alternate, against a **4.13 / 4.05** control:
 *
 * | one body at a time                                              | ref       | alt       |
 * | --------------------------------------------------------------- | --------- | --------- |
 * | stun · slow · weaken · sunder · poison · `SAVAGED` · `HEXBRAND` | 4.17–4.38 | 4.05–4.17 |
 * | a taunt                                                         | **4.78**  | **4.85**  |
 *
 * | the same turn, aimed at all five | ref      | alt      |
 * | -------------------------------- | -------- | -------- |
 * | wide damage alone                | 4.53     | 3.88     |
 * | wide damage + a slow             | 4.03     | **2.88** |
 * | wide damage + a stun             | **3.95** | **1.85** |
 *
 * **Seven mechanics one body at a time, and every one of them leaves the board easier than saying
 * nothing**; a taunt is measurably worse still. The reference five carries 9,416 to 12,822 hp a body
 * at `elite`, so a question put to one of them is a turn the other four do not have to answer. So
 * the bands escalate in the **scope** of what a board does rather than in its size: one voice, then
 * a voice with a rider, then the rider becoming the turn, then two voices, then three.
 *
 * ⚠️ **This is a fact about these two crews and not a structural gap only Demons have.** The same
 * board reads 2.40 / 0.60 against the Elf crews and 0.88 / 0.00 against the Monster crews, and
 * **4.00 / 3.95** against the Angel five 21j found nothing moves. What makes it this tower's is
 * that nothing *else* moves them.
 *
 * ⚠️ **Weight is not the axis and cannot be, because a second heavy anchor is past the edge.** At
 * the roof's level The Unison beside a Hierophant reads 95% / 3.17 for the reference five and
 * **5%** for the alternate; beside a Colossus 70% / 0%; beside the Hollow Seraph 5% / 0%. No board
 * in this hundred carries two `ascended` blocks.
 *
 * ⚠️ **The licence for an unanswerable lock is placement, exactly as it is for an evasion pool.**
 * Neither arrangement unlocks a cleanse at `elite` and no Demon carries `tenacity`, so every one of
 * these lands with certainty. What keeps it a question is that the voices are soft — the Knell
 * Chanter is 660 hp and the Stillness Cantor 700, against an Angel legendary register running 590 to
 * 1080 — so the answer is to kill the voice, and a board may only keep asking for as long as it can
 * keep one standing.
 *
 * The roof is The Unison over a Litany Bearer, a Knell Chanter, a Stillness Cantor and a Lumen
 * Acolyte: **100% / 4.10 survivors / 9.6s** for the reference five and **88% / 1.98 / 17.2s** for
 * the alternate, against bars of 90% and 75%. Every floor of 181–200 was swept individually; the
 * worst reference reading is 100% and the worst alternate **78%**, at floor 194. The longest
 * cleared fight anywhere in the new hundred is 37.5s against a 67.5s bar, and no floor times out.
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

    // -------------------------------------------------------------------------------------
    // The Massed Verse — Floors 101–120, levels 61–72 — the first bodies that speak to all five at once, and nothing rides along with it yet.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f101',
      name: 'Floor 101',
      enemies: {
        front: [ASHEN_CHOIR, REVENANT],
        back: [LITANY_BEARER, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f102',
      name: 'Floor 102',
      enemies: {
        front: [GILDED_SENTRY, WRATHBORN],
        back: [LITANY_BEARER, SERAPH_ADJUDICANT, BANDIT],
      },
    },
    {
      id: 't-demon-f103',
      name: 'Floor 103',
      enemies: { front: [SENTINEL, ASHEN_CHOIR], back: [LITANY_BEARER, LITANY_BEARER, SHADE] },
    },
    {
      id: 't-demon-f104',
      name: 'Floor 104',
      enemies: {
        front: [HIEROPHANT, RIMEPLATE],
        back: [LITANY_BEARER, RADIANT_HERALD, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f105',
      name: 'Floor 105',
      enemies: {
        front: [GILDED_SENTRY, GOLEM],
        back: [LITANY_BEARER, VAULTLIGHT_CENSER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f106',
      name: 'Floor 106',
      enemies: { front: [ASHEN_CHOIR, REVENANT], back: [STORMCALLER, LITANY_BEARER, BOAR] },
    },
    {
      id: 't-demon-f107',
      name: 'Floor 107',
      enemies: {
        front: [HEXBOUND_TORMENTOR, GILDED_SENTRY],
        back: [LITANY_BEARER, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f108',
      name: 'Floor 108',
      enemies: { front: [HIEROPHANT, SENTINEL], back: [LITANY_BEARER, SERAPH_ADJUDICANT, SHADE] },
    },
    {
      id: 't-demon-f109',
      name: 'Floor 109',
      enemies: {
        front: [ASHEN_CHOIR, WRATHBORN],
        back: [MOONSONG_WEAVER, LITANY_BEARER, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f110',
      name: 'Floor 110 — The Massed Verse',
      enemies: {
        front: [HIEROPHANT, RIMEPLATE],
        back: [STORMCALLER, LITANY_BEARER, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f111',
      name: 'Floor 111',
      enemies: {
        front: [GILDED_SENTRY, REVENANT],
        back: [LITANY_BEARER, SERAPH_ADJUDICANT, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f112',
      name: 'Floor 112',
      enemies: { front: [GOLEM, ASHEN_CHOIR], back: [LITANY_BEARER, STORMCALLER, BANDIT] },
    },
    {
      id: 't-demon-f113',
      name: 'Floor 113',
      enemies: {
        front: [GILDED_SENTRY, HEADSMAN],
        back: [LITANY_BEARER, VAULTLIGHT_CENSER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f114',
      name: 'Floor 114',
      enemies: {
        front: [ASHEN_CHOIR, COLDHEARTH_IRONSWORN],
        back: [MOONSONG_WEAVER, LITANY_BEARER, BOAR],
      },
    },
    {
      id: 't-demon-f115',
      name: 'Floor 115',
      enemies: {
        front: [SEALWARD_CUSTODIAN, WRATHBORN],
        back: [LITANY_BEARER, SERAPH_ADJUDICANT, SHADE],
      },
    },
    {
      id: 't-demon-f116',
      name: 'Floor 116',
      enemies: {
        front: [HIEROPHANT, SENTINEL],
        back: [LITANY_BEARER, STORMCALLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-demon-f117',
      name: 'Floor 117',
      enemies: {
        front: [ASHEN_CHOIR, RIMEPLATE],
        back: [LITANY_BEARER, GRAVETIDE_HERALD, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-demon-f118',
      name: 'Floor 118',
      enemies: {
        front: [GILDED_SENTRY, COLDHEARTH_IRONSWORN],
        back: [STORMCALLER, LITANY_BEARER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-demon-f119',
      name: 'Floor 119',
      enemies: {
        front: [WYRDROOT_ANCIENT, ASHEN_CHOIR],
        back: [MOONSONG_WEAVER, LITANY_BEARER, REVENANT],
      },
    },
    {
      id: 't-demon-f120',
      name: 'Floor 120 — The Massed Verse',
      enemies: {
        front: [HIEROPHANT, HEADSMAN],
        back: [LITANY_BEARER, STORMCALLER, GRAVETIDE_HERALD],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Hush — Floors 121–140, levels 73–84 — the board-wide turn starts carrying a rider, and the rider is the one the party can still play around.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f121',
      name: 'Floor 121',
      enemies: {
        front: [ASHEN_CHOIR, REVENANT],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f122',
      name: 'Floor 122',
      enemies: {
        front: [CONCORD_CANTOR, SENTINEL],
        back: [STILLNESS_CANTOR, SERAPH_ADJUDICANT, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f123',
      name: 'Floor 123',
      enemies: {
        front: [GILDED_SENTRY, WEALDSHADOW_STALKER],
        back: [STILLNESS_CANTOR, VAULTLIGHT_CENSER, SHADE],
      },
    },
    {
      id: 't-demon-f124',
      name: 'Floor 124',
      enemies: { front: [HIEROPHANT, GOLEM], back: [STILLNESS_CANTOR, RADIANT_HERALD, BANDIT] },
    },
    {
      id: 't-demon-f125',
      name: 'Floor 125',
      enemies: {
        front: [ASHEN_CHOIR, GRAVETIDE_HERALD],
        back: [STILLNESS_CANTOR, LITANY_BEARER, BOAR],
      },
    },
    {
      id: 't-demon-f126',
      name: 'Floor 126',
      enemies: {
        front: [CONCORD_CANTOR, OATHSHIELD_VANGUARD],
        back: [STILLNESS_CANTOR, STORMCALLER, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f127',
      name: 'Floor 127',
      enemies: {
        front: [GILDED_SENTRY, RIMEPLATE],
        back: [STILLNESS_CANTOR, ZENITH_CHORISTER, SHADE],
      },
    },
    {
      id: 't-demon-f128',
      name: 'Floor 128',
      enemies: {
        front: [HIEROPHANT, HEADSMAN],
        back: [STILLNESS_CANTOR, LITANY_BEARER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f129',
      name: 'Floor 129',
      enemies: {
        front: [ASHEN_CHOIR, COLDHEARTH_IRONSWORN],
        back: [STILLNESS_CANTOR, MOONSONG_WEAVER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f130',
      name: 'Floor 130 — The Hush',
      enemies: {
        front: [BARROW_SOVEREIGN, ASHEN_CHOIR],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, REVENANT],
      },
    },
    {
      id: 't-demon-f131',
      name: 'Floor 131',
      enemies: {
        front: [CONCORD_CANTOR, BLOODGORGE_HOUND],
        back: [STILLNESS_CANTOR, VAULTLIGHT_CENSER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f132',
      name: 'Floor 132',
      enemies: {
        front: [SEALWARD_CUSTODIAN, SENTINEL],
        back: [STILLNESS_CANTOR, SERAPH_ADJUDICANT, SHADE],
      },
    },
    {
      id: 't-demon-f133',
      name: 'Floor 133',
      enemies: {
        front: [GILDED_SENTRY, WEALDSHADOW_STALKER],
        back: [STILLNESS_CANTOR, STORMCALLER, BANDIT],
      },
    },
    {
      id: 't-demon-f134',
      name: 'Floor 134',
      enemies: {
        front: [HIEROPHANT, REVENANT],
        back: [STILLNESS_CANTOR, ANTIPHON_ARCHON, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f135',
      name: 'Floor 135',
      enemies: {
        front: [CONCORD_CANTOR, NIGHTMARCH_OUTRIDER],
        back: [STILLNESS_CANTOR, MOONSONG_WEAVER, BOAR],
      },
    },
    {
      id: 't-demon-f136',
      name: 'Floor 136',
      enemies: {
        front: [ASHEN_CHOIR, OATHSHIELD_VANGUARD],
        back: [STILLNESS_CANTOR, LITANY_BEARER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f137',
      name: 'Floor 137',
      enemies: {
        front: [GILDED_SENTRY, GRAVETIDE_HERALD],
        back: [STILLNESS_CANTOR, STORMCALLER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f138',
      name: 'Floor 138',
      enemies: {
        front: [WYRDROOT_ANCIENT, CONCORD_CANTOR],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, SHADE],
      },
    },
    {
      id: 't-demon-f139',
      name: 'Floor 139',
      enemies: {
        front: [ASHEN_CHOIR, RIVEN_MARCHWARDEN],
        back: [STILLNESS_CANTOR, ANTIPHON_ARCHON, HEADSMAN],
      },
    },
    {
      id: 't-demon-f140',
      name: 'Floor 140 — The Hush',
      enemies: {
        front: [HIEROPHANT, HEADSMAN],
        back: [STILLNESS_CANTOR, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Tolling — Floors 141–160, levels 85–96 — the rider becomes the turn itself, on the lightest legendary body this tower fields.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f141',
      name: 'Floor 141',
      enemies: {
        front: [ASHEN_CHOIR, REVENANT],
        back: [KNELL_CHANTER, LITANY_BEARER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f142',
      name: 'Floor 142',
      enemies: {
        front: [CONCORD_CANTOR, SENTINEL],
        back: [KNELL_CHANTER, SERAPH_ADJUDICANT, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f143',
      name: 'Floor 143',
      enemies: {
        front: [GILDED_SENTRY, RIMEPLATE],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SHADE],
      },
    },
    {
      id: 't-demon-f144',
      name: 'Floor 144',
      enemies: {
        front: [HIEROPHANT, COLDHEARTH_IRONSWORN],
        back: [KNELL_CHANTER, LITANY_BEARER, BANDIT],
      },
    },
    {
      id: 't-demon-f145',
      name: 'Floor 145',
      enemies: {
        front: [ASHEN_CHOIR, OATHSHIELD_VANGUARD],
        back: [KNELL_CHANTER, VAULTLIGHT_CENSER, BOAR],
      },
    },
    {
      id: 't-demon-f146',
      name: 'Floor 146',
      enemies: {
        front: [CONCORD_CANTOR, HEADSMAN],
        back: [KNELL_CHANTER, STORMCALLER, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f147',
      name: 'Floor 147',
      enemies: {
        front: [SEALWARD_CUSTODIAN, GOLEM],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, WRATHBORN],
      },
    },
    {
      id: 't-demon-f148',
      name: 'Floor 148',
      enemies: {
        front: [BARROW_SOVEREIGN, GILDED_SENTRY],
        back: [KNELL_CHANTER, RADIANT_HERALD, REVENANT],
      },
    },
    {
      id: 't-demon-f149',
      name: 'Floor 149',
      enemies: {
        front: [ASHEN_CHOIR, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, MOONSONG_WEAVER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f150',
      name: 'Floor 150 — The Tolling',
      enemies: {
        front: [HIEROPHANT, WEALDSHADOW_STALKER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f151',
      name: 'Floor 151',
      enemies: {
        front: [CONCORD_CANTOR, NIGHTMARCH_OUTRIDER],
        back: [KNELL_CHANTER, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f152',
      name: 'Floor 152',
      enemies: {
        front: [GILDED_SENTRY, SENTINEL],
        back: [KNELL_CHANTER, STORMCALLER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f153',
      name: 'Floor 153',
      enemies: {
        front: [ASHEN_CHOIR, GRAVETIDE_HERALD],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-demon-f154',
      name: 'Floor 154',
      enemies: {
        front: [WYRDROOT_ANCIENT, CONCORD_CANTOR],
        back: [KNELL_CHANTER, ANTIPHON_ARCHON, REVENANT],
      },
    },
    {
      id: 't-demon-f155',
      name: 'Floor 155',
      enemies: {
        front: [GILDED_SENTRY, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, MOONSONG_WEAVER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-demon-f156',
      name: 'Floor 156',
      enemies: {
        front: [SEALWARD_CUSTODIAN, COLDHEARTH_IRONSWORN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SHADE],
      },
    },
    {
      id: 't-demon-f157',
      name: 'Floor 157',
      enemies: {
        front: [ASHEN_CHOIR, HEADSMAN],
        back: [KNELL_CHANTER, STORMCALLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-demon-f158',
      name: 'Floor 158',
      enemies: {
        front: [HIEROPHANT, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-demon-f159',
      name: 'Floor 159',
      enemies: {
        front: [CONCORD_CANTOR, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, LITANY_BEARER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f160',
      name: 'Floor 160 — The Tolling',
      enemies: {
        front: [BARROW_SOVEREIGN, ASHEN_CHOIR],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, NIGHTMARCH_OUTRIDER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Whole Choir — Floors 161–180, levels 97–108 — the slow and the stun on one board, and the first roofs heavy enough to keep both alive.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f161',
      name: 'Floor 161',
      enemies: {
        front: [ASHEN_CHOIR, COLDHEARTH_IRONSWORN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SHADE],
      },
    },
    {
      id: 't-demon-f162',
      name: 'Floor 162',
      enemies: {
        front: [CONCORD_CANTOR, OATHSHIELD_VANGUARD],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f163',
      name: 'Floor 163',
      enemies: {
        front: [HOLLOW_SERAPH, SENTINEL],
        back: [STILLNESS_CANTOR, LITANY_BEARER, REVENANT],
      },
    },
    {
      id: 't-demon-f164',
      name: 'Floor 164',
      enemies: {
        front: [GILDED_SENTRY, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, HEADSMAN],
      },
    },
    {
      id: 't-demon-f165',
      name: 'Floor 165',
      enemies: {
        front: [ASHEN_CHOIR, HEADSMAN],
        back: [KNELL_CHANTER, MOONSONG_WEAVER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f166',
      name: 'Floor 166',
      enemies: {
        front: [SEALWARD_CUSTODIAN, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SHADE],
      },
    },
    {
      id: 't-demon-f167',
      name: 'Floor 167',
      enemies: {
        front: [HOLLOW_SERAPH, REVENANT],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, WRATHBORN],
      },
    },
    {
      id: 't-demon-f168',
      name: 'Floor 168',
      enemies: {
        front: [CONCORD_CANTOR, WEALDSHADOW_STALKER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, BOAR],
      },
    },
    {
      id: 't-demon-f169',
      name: 'Floor 169',
      enemies: {
        front: [ASHEN_CHOIR, NIGHTMARCH_OUTRIDER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f170',
      name: 'Floor 170 — The Whole Choir',
      enemies: {
        front: [HOLLOW_SERAPH, GRAVETIDE_HERALD],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SENTINEL],
      },
    },
    {
      id: 't-demon-f171',
      name: 'Floor 171',
      enemies: {
        front: [GILDED_SENTRY, OATHSHIELD_VANGUARD],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, BANDIT],
      },
    },
    {
      id: 't-demon-f172',
      name: 'Floor 172',
      enemies: {
        front: [WYRDROOT_ANCIENT, CONCORD_CANTOR],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, REVENANT],
      },
    },
    {
      id: 't-demon-f173',
      name: 'Floor 173',
      enemies: {
        front: [ASHEN_CHOIR, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, SHADE],
      },
    },
    {
      id: 't-demon-f174',
      name: 'Floor 174',
      enemies: {
        front: [SEALWARD_CUSTODIAN, HEADSMAN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f175',
      name: 'Floor 175',
      enemies: {
        front: [HOLLOW_SERAPH, COLDHEARTH_IRONSWORN],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-demon-f176',
      name: 'Floor 176',
      enemies: {
        front: [CONCORD_CANTOR, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f177',
      name: 'Floor 177',
      enemies: {
        front: [BARROW_SOVEREIGN, GILDED_SENTRY],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, WRATHBORN],
      },
    },
    {
      id: 't-demon-f178',
      name: 'Floor 178',
      enemies: {
        front: [ASHEN_CHOIR, SENTINEL],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f179',
      name: 'Floor 179',
      enemies: {
        front: [GILDED_SENTRY, WEALDSHADOW_STALKER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, REVENANT],
      },
    },
    {
      id: 't-demon-f180',
      name: 'Floor 180 — The Whole Choir',
      enemies: {
        front: [HOLLOW_SERAPH, OATHSHIELD_VANGUARD],
        back: [STILLNESS_CANTOR, LITANY_BEARER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Last Verse — Floors 181–200, levels 109–120 — three voices on one board, and above them the body that is all three by itself.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f181',
      name: 'Floor 181',
      enemies: { front: [THE_UNISON, REVENANT], back: [LITANY_BEARER, RADIANT_HERALD, SHADE] },
    },
    {
      id: 't-demon-f182',
      name: 'Floor 182',
      enemies: {
        front: [ASHEN_CHOIR, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, STORMCALLER],
      },
    },
    {
      id: 't-demon-f183',
      name: 'Floor 183',
      enemies: {
        front: [THE_UNISON, SENTINEL],
        back: [STILLNESS_CANTOR, ZENITH_CHORISTER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f184',
      name: 'Floor 184',
      enemies: {
        front: [HOLLOW_SERAPH, HEADSMAN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, REVENANT],
      },
    },
    {
      id: 't-demon-f185',
      name: 'Floor 185',
      enemies: {
        front: [THE_UNISON, COLDHEARTH_IRONSWORN],
        back: [KNELL_CHANTER, LUMEN_ACOLYTE, BOAR],
      },
    },
    {
      id: 't-demon-f186',
      name: 'Floor 186',
      enemies: {
        front: [CONCORD_CANTOR, OATHSHIELD_VANGUARD],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f187',
      name: 'Floor 187',
      enemies: {
        front: [THE_UNISON, GRAVETIDE_HERALD],
        back: [STILLNESS_CANTOR, VAULTLIGHT_CENSER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f188',
      name: 'Floor 188',
      enemies: {
        front: [HOLLOW_SERAPH, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, WRATHBORN],
      },
    },
    {
      id: 't-demon-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_UNISON, GILDED_SENTRY],
        back: [KNELL_CHANTER, ZENITH_CHORISTER, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f190',
      name: 'Floor 190 — The Last Verse',
      enemies: {
        front: [THE_UNISON, NIGHTMARCH_OUTRIDER],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f191',
      name: 'Floor 191',
      enemies: {
        front: [ASHEN_CHOIR, WEALDSHADOW_STALKER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-demon-f192',
      name: 'Floor 192',
      enemies: { front: [THE_UNISON, REVENANT], back: [KNELL_CHANTER, STILLNESS_CANTOR, BANDIT] },
    },
    {
      id: 't-demon-f193',
      name: 'Floor 193',
      enemies: {
        front: [HOLLOW_SERAPH, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f194',
      name: 'Floor 194',
      enemies: {
        front: [THE_UNISON, SENTINEL],
        back: [STILLNESS_CANTOR, LITANY_BEARER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-demon-f195',
      name: 'Floor 195',
      enemies: {
        front: [CONCORD_CANTOR, HEADSMAN],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-demon-f196',
      name: 'Floor 196',
      enemies: { front: [THE_UNISON, GOLEM], back: [KNELL_CHANTER, LUMEN_ACOLYTE, GLADE_STALKER] },
    },
    {
      id: 't-demon-f197',
      name: 'Floor 197',
      enemies: {
        front: [HOLLOW_SERAPH, OATHSHIELD_VANGUARD],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-demon-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_UNISON, DEEPROCK_MINER],
        back: [STILLNESS_CANTOR, KNELL_CHANTER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-demon-f199',
      name: 'Floor 199',
      enemies: {
        front: [ASHEN_CHOIR, BLOODGORGE_HOUND],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f200',
      name: 'Floor 200 — The Unison',
      enemies: {
        front: [THE_UNISON, LITANY_BEARER],
        back: [KNELL_CHANTER, STILLNESS_CANTOR, LUMEN_ACOLYTE],
      },
    },
  ],
} as const;
