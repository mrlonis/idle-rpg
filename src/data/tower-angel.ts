import {
  ASHEN_CHOIR,
  ASHFALL_SOVEREIGN,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BLOODPACT_FIEND,
  BOAR,
  BRAMBLEWALK_SCOUT,
  CARRION_SWARM,
  CINDERLING,
  CINDERQUENCH_BEARER,
  CINDER_CULLER,
  COLOSSUS,
  COVENANT_BREAKER,
  COVENANT_EXECUTOR,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  DUSKFERN_SKIRMISHER,
  EMBERSEED_WARLOCK,
  FIRST_CINDER,
  FORGE_THRALL,
  FORLORN_LEVY,
  GILDED_SENTRY,
  GLADE_STALKER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  KINGSWAY_LANCER,
  LUMEN_ACOLYTE,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  PALE_WARDEN,
  PYRE,
  QUENCHWRIGHT,
  RADIANT_HERALD,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTBORN_HARROWER,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RUINWING_DEVOURER,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  STORMCALLER,
  SUNMOTE_DANCER,
  THE_UNANSWERED,
  THORNLING,
  THORNWEALD_WARDEN,
  UNMADE,
  VAULTLIGHT_CENSER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Angel Tower — two hundred floors, enemy levels 1 to 120.
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
 * ## ⚠️ The second hundred escalates by tempo and aim, because no *mechanic* moves an Angel five
 *
 * Twenty-two shapes were measured against both arrangements at the roof's level before a floor of
 * this half was authored — a taunt, thorns, a link, a bomb, `SAVAGED`, `BLOODRISEN`, `dodge`,
 * `tenacity`, a board stun, a board slow, a shield, a resist wall, a healer, hex volume — and the
 * **whole spread was 0.15 survivors of five**. Four supports and a wall answers every lock in the
 * library, so 21i's count of distinct questions buys nothing here either: no individual question
 * costs this crew anything to begin with. The table is in `skills.ts` beside
 * {@link CULL_THE_EMBERS}.
 *
 * What an Angel crew cannot answer is a board that **arrives before its wards do** and spends itself
 * on the body its heals are already aimed at. Every Angel heal in the game names `ally-lowest`, and
 * every shield the crew owns is behind a cooldown or an energy bar. So the bands escalate through
 * `haste` and through `enemy-lowest` / `enemy-back` targeting: aim alone takes the alternate five
 * from 4.00 survivors to 2.00, speed on a thin body to 0.15, and aiming at `enemy-highest` instead
 * makes a board measurably *easier*, because that is where the crew's two tanks stand.
 *
 * ⚠️ **Both dials at once is past the edge — a board that is fast *and* names the lowest reads 0.00
 * for both arrangements** — so the aim arrives in 121–160 and the speed from 161, and the closing
 * band never carries three bodies above `haste` 126.
 *
 * ⚠️ **The two arrangements fail on opposite axes here, which no earlier tower found.** Weight
 * breaks the reference five (any two of the Unmade, the Ashfall Sovereign and the Hollow Seraph on
 * one board reads 5% or below for it, and 38–65% for the alternate); length breaks the alternate,
 * whose five characters field **four** damage skills between them at `elite` and which is the
 * slowest party in the game. So denial is a *cost* on this tower rather than an escalation — a
 * healer leaves both crews at 4.00 survivors and buys nothing but eleven seconds — and no board
 * above floor 160 carries a heal, a regeneration, a drain or `lifeLeech`.
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
    // The Ember Gate — Floors 1–12, levels 1–6 — imps and fodder, and the first speed check.
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
    // The Cinder Choir — Floors 13–28, levels 7–14 — the locks arrive: a wide magical wave, an evasion wall, and two hexes at once.
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
    // The Wrathfall — Floors 29–48, levels 14–23 — the escalation lock, and armour that stops answering the question.
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
    // The Long Burning — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
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
    // The Unmaking — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
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
    // The Black Stair — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Unmade waiting above them.
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

    // -------------------------------------------------------------------------------------
    // The Quickening — Floors 101–120, levels 48–57 — past the Black Stair the boards stop waiting — the first cheap body that goes for whoever is already hurt, and a rank that keeps arriving before the choir does.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f101',
      name: 'Floor 101',
      enemies: { front: [WRATHBORN, CINDER_CULLER], back: [PYRE, CINDER_CULLER, WISP] },
    },
    {
      id: 't-angel-f102',
      name: 'Floor 102',
      enemies: {
        front: [HEXBOUND_TORMENTOR, DUSKFERN_SKIRMISHER],
        back: [CINDERLING, SEPULCHRE_HOUND, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f103',
      name: 'Floor 103',
      enemies: {
        front: [COVENANT_BREAKER, WRATHBORN],
        back: [RUINWING_DEVOURER, CINDERQUENCH_BEARER, GLADE_STALKER],
      },
    },
    {
      id: 't-angel-f104',
      name: 'Floor 104',
      enemies: {
        front: [RIFTBORN_HARROWER, FORLORN_LEVY],
        back: [EMBERSEED_WARLOCK, SKYSHRIKE, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-angel-f105',
      name: 'Floor 105',
      enemies: {
        front: [WRATHBORN, RENDFANG_JACKAL],
        back: [CINDER_CULLER, BARROWMIST_KEENER, PYRE],
      },
    },
    {
      id: 't-angel-f106',
      name: 'Floor 106',
      enemies: {
        front: [COVENANT_BREAKER, CARRION_SWARM],
        back: [HEXBOUND_TORMENTOR, CINDER_CULLER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-angel-f107',
      name: 'Floor 107',
      enemies: {
        front: [RIFTBORN_HARROWER, MIREWHELP],
        back: [RUINWING_DEVOURER, SEPULCHRE_HOUND, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-angel-f108',
      name: 'Floor 108',
      enemies: {
        front: [WRATHBORN, CINDER_CULLER],
        back: [CINDERQUENCH_BEARER, MOONSONG_WEAVER, BANDIT],
      },
    },
    {
      id: 't-angel-f109',
      name: 'Floor 109',
      enemies: {
        front: [HEXBOUND_TORMENTOR, DUSKFERN_SKIRMISHER],
        back: [EMBERSEED_WARLOCK, SKYSHRIKE, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-angel-f110',
      name: 'Floor 110 — The Quickening',
      enemies: {
        front: [FIRST_CINDER, WRATHBORN],
        back: [HEXBOUND_TORMENTOR, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f111',
      name: 'Floor 111',
      enemies: {
        front: [RIFTBORN_HARROWER, FORLORN_LEVY],
        back: [CINDERLING, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f112',
      name: 'Floor 112',
      enemies: {
        front: [WRATHBORN, RENDFANG_JACKAL],
        back: [RUINWING_DEVOURER, SEPULCHRE_HOUND, GLADE_STALKER],
      },
    },
    {
      id: 't-angel-f113',
      name: 'Floor 113',
      enemies: {
        front: [COVENANT_BREAKER, CARRION_SWARM],
        back: [EMBERSEED_WARLOCK, CINDERQUENCH_BEARER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-angel-f114',
      name: 'Floor 114',
      enemies: {
        front: [RIFTBORN_HARROWER, MIREWHELP],
        back: [SKYSHRIKE, BARROWMIST_KEENER, PYRE],
      },
    },
    {
      id: 't-angel-f115',
      name: 'Floor 115',
      enemies: {
        front: [WRATHBORN, CINDER_CULLER],
        back: [HEXBOUND_TORMENTOR, CINDER_CULLER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-angel-f116',
      name: 'Floor 116',
      enemies: {
        front: [HEXBOUND_TORMENTOR, DUSKFERN_SKIRMISHER],
        back: [RUINWING_DEVOURER, CINDER_CULLER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-angel-f117',
      name: 'Floor 117',
      enemies: {
        front: [COVENANT_BREAKER, WRATHBORN],
        back: [SEPULCHRE_HOUND, MOONSONG_WEAVER, BANDIT],
      },
    },
    {
      id: 't-angel-f118',
      name: 'Floor 118',
      enemies: {
        front: [RIFTBORN_HARROWER, FORLORN_LEVY],
        back: [EMBERSEED_WARLOCK, CINDERQUENCH_BEARER, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-angel-f119',
      name: 'Floor 119',
      enemies: { front: [WRATHBORN, RENDFANG_JACKAL], back: [PYRE, SKYSHRIKE, WISP] },
    },
    {
      id: 't-angel-f120',
      name: 'Floor 120 — The Verse Cut Short',
      enemies: {
        front: [FIRST_CINDER, COVENANT_BREAKER],
        back: [EMBERSEED_WARLOCK, CINDER_CULLER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Wounded First — Floors 121–140, levels 58–67 — the aim arrives at weight: every board names the one body the choir has just committed to, and one of them collects the heal as it lands.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f121',
      name: 'Floor 121',
      enemies: {
        front: [COVENANT_EXECUTOR, WRATHBORN],
        back: [HEADSMAN, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f122',
      name: 'Floor 122',
      enemies: {
        front: [COVENANT_BREAKER, CINDERQUENCH_BEARER],
        back: [CINDERQUENCH_BEARER, PYRE, WISP],
      },
    },
    {
      id: 't-angel-f123',
      name: 'Floor 123',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [EMBERSEED_WARLOCK, COVENANT_EXECUTOR, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f124',
      name: 'Floor 124',
      enemies: {
        front: [RIFTBORN_HARROWER, HEADSMAN],
        back: [QUENCHWRIGHT, CINDER_CULLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-angel-f125',
      name: 'Floor 125',
      enemies: {
        front: [COVENANT_EXECUTOR, KINGSWAY_LANCER],
        back: [RUINWING_DEVOURER, CINDER_CULLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-angel-f126',
      name: 'Floor 126',
      enemies: {
        front: [FIRST_CINDER, WEALDSHADOW_STALKER],
        back: [WEALDSHADOW_STALKER, CINDER_CULLER, BANDIT],
      },
    },
    {
      id: 't-angel-f127',
      name: 'Floor 127',
      enemies: {
        front: [HEXBOUND_TORMENTOR, COVENANT_EXECUTOR],
        back: [HEXBOUND_TORMENTOR, CINDERQUENCH_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f128',
      name: 'Floor 128',
      enemies: {
        front: [COVENANT_EXECUTOR, WRATHBORN],
        back: [HEADSMAN, COVENANT_EXECUTOR, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-angel-f129',
      name: 'Floor 129',
      enemies: {
        front: [COVENANT_BREAKER, HEADSMAN],
        back: [EMBERSEED_WARLOCK, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f130',
      name: 'Floor 130 — The Wounded First',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [WEALDSHADOW_STALKER, CINDERQUENCH_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-angel-f131',
      name: 'Floor 131',
      enemies: {
        front: [RIFTBORN_HARROWER, WEALDSHADOW_STALKER],
        back: [WEALDSHADOW_STALKER, PYRE, WISP],
      },
    },
    {
      id: 't-angel-f132',
      name: 'Floor 132',
      enemies: {
        front: [COVENANT_EXECUTOR, KINGSWAY_LANCER],
        back: [EMBERSEED_WARLOCK, CINDERQUENCH_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f133',
      name: 'Floor 133',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [QUENCHWRIGHT, CINDER_CULLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-angel-f134',
      name: 'Floor 134',
      enemies: {
        front: [HEXBOUND_TORMENTOR, COVENANT_EXECUTOR],
        back: [RUINWING_DEVOURER, HEADSMAN, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-angel-f135',
      name: 'Floor 135',
      enemies: {
        front: [COVENANT_EXECUTOR, WRATHBORN],
        back: [WEALDSHADOW_STALKER, CINDER_CULLER, BANDIT],
      },
    },
    {
      id: 't-angel-f136',
      name: 'Floor 136',
      enemies: {
        front: [COVENANT_BREAKER, WEALDSHADOW_STALKER],
        back: [HEXBOUND_TORMENTOR, WEALDSHADOW_STALKER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f137',
      name: 'Floor 137',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [HEADSMAN, CINDERQUENCH_BEARER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-angel-f138',
      name: 'Floor 138',
      enemies: {
        front: [RIFTBORN_HARROWER, COVENANT_EXECUTOR],
        back: [EMBERSEED_WARLOCK, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f139',
      name: 'Floor 139',
      enemies: {
        front: [COVENANT_EXECUTOR, KINGSWAY_LANCER],
        back: [HEADSMAN, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f140',
      name: 'Floor 140 — The Debt Called',
      enemies: {
        front: [ASHFALL_SOVEREIGN, COVENANT_EXECUTOR],
        back: [WEALDSHADOW_STALKER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Unkept Hour — Floors 141–160, levels 67–76 — the bodies that are past the front rank before the ward is up, and the last band that carries a heal — above this floor nothing on any board restores anything.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f141',
      name: 'Floor 141',
      enemies: {
        front: [COVENANT_EXECUTOR, RIFTSTEP_REAVER],
        back: [HIEROPHANT, RIFTSTEP_REAVER, PYRE],
      },
    },
    {
      id: 't-angel-f142',
      name: 'Floor 142',
      enemies: {
        front: [FIRST_CINDER, RIFTSTEP_REAVER],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f143',
      name: 'Floor 143',
      enemies: {
        front: [ASHFALL_SOVEREIGN, COVENANT_EXECUTOR],
        back: [COVENANT_EXECUTOR, HEADSMAN, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f144',
      name: 'Floor 144',
      enemies: {
        front: [COVENANT_BREAKER, SERAPH_ADJUDICANT],
        back: [GOREHIDE_MATRIARCH, RIFTSTEP_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-angel-f145',
      name: 'Floor 145',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [WEALDSHADOW_STALKER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f146',
      name: 'Floor 146',
      enemies: {
        front: [ASHFALL_SOVEREIGN, RIFTSTEP_REAVER],
        back: [HIEROPHANT, RIFTSTEP_REAVER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-angel-f147',
      name: 'Floor 147',
      enemies: {
        front: [RIFTBORN_HARROWER, RIFTSTEP_REAVER],
        back: [COVENANT_EXECUTOR, NIGHTMARCH_OUTRIDER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f148',
      name: 'Floor 148',
      enemies: {
        front: [COVENANT_EXECUTOR, CINDER_CULLER],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f149',
      name: 'Floor 149',
      enemies: {
        front: [FIRST_CINDER, RIFTSTEP_REAVER],
        back: [HEADSMAN, SERAPH_ADJUDICANT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f150',
      name: 'Floor 150 — The Unkept Hour',
      enemies: {
        front: [ASHFALL_SOVEREIGN, COVENANT_EXECUTOR],
        back: [RIFTSTEP_REAVER, QUENCHWRIGHT, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-angel-f151',
      name: 'Floor 151',
      enemies: {
        front: [COVENANT_BREAKER, RIFTSTEP_REAVER],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-angel-f152',
      name: 'Floor 152',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [COVENANT_EXECUTOR, HEADSMAN, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-angel-f153',
      name: 'Floor 153',
      enemies: {
        front: [ASHFALL_SOVEREIGN, CINDER_CULLER],
        back: [GOREHIDE_MATRIARCH, RIFTSTEP_REAVER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f154',
      name: 'Floor 154',
      enemies: {
        front: [RIFTBORN_HARROWER, RIFTSTEP_REAVER],
        back: [SERAPH_ADJUDICANT, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f155',
      name: 'Floor 155',
      enemies: {
        front: [COVENANT_EXECUTOR, WEALDSHADOW_STALKER],
        back: [HIEROPHANT, RIFTSTEP_REAVER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-angel-f156',
      name: 'Floor 156',
      enemies: {
        front: [FIRST_CINDER, RIFTSTEP_REAVER],
        back: [COVENANT_EXECUTOR, RIFTSTEP_REAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f157',
      name: 'Floor 157',
      enemies: {
        front: [ASHFALL_SOVEREIGN, COVENANT_EXECUTOR],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-angel-f158',
      name: 'Floor 158',
      enemies: {
        front: [COVENANT_BREAKER, CINDER_CULLER],
        back: [HEADSMAN, CINDER_CULLER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f159',
      name: 'Floor 159',
      enemies: {
        front: [FIRST_CINDER, COVENANT_EXECUTOR],
        back: [HIEROPHANT, SERAPH_ADJUDICANT, PYRE],
      },
    },
    {
      id: 't-angel-f160',
      name: 'Floor 160 — The Ward Too Late',
      enemies: {
        front: [ASHFALL_SOVEREIGN, RIFTSTEP_REAVER],
        back: [COVENANT_EXECUTOR, HEADSMAN, SERAPH_ADJUDICANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Narrow Mercy — Floors 161–180, levels 76–85 — two anchors a board and never two heavy ones, nothing that restores, and something fast enough that the shields land on a body already gone.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f161',
      name: 'Floor 161',
      enemies: {
        front: [FIRST_CINDER, RIFTSTEP_REAVER],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f162',
      name: 'Floor 162',
      enemies: { front: [ASHFALL_SOVEREIGN, WARDEN], back: [NIGHTMARCH_OUTRIDER, PYRE, SKYSHRIKE] },
    },
    {
      id: 't-angel-f163',
      name: 'Floor 163',
      enemies: {
        front: [UNMADE, PALE_WARDEN],
        back: [RIFTSTEP_REAVER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f164',
      name: 'Floor 164',
      enemies: {
        front: [FIRST_CINDER, OATHBREAKER],
        back: [CINDERQUENCH_BEARER, WEALDSHADOW_STALKER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f165',
      name: 'Floor 165',
      enemies: {
        front: [ASHFALL_SOVEREIGN, SERAPH_ADJUDICANT],
        back: [RIFTSTEP_REAVER, SERAPH_ADJUDICANT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f166',
      name: 'Floor 166',
      enemies: {
        front: [FIRST_CINDER, WYRDROOT_ANCIENT],
        back: [WEALDSHADOW_STALKER, CINDER_CULLER, PYRE],
      },
    },
    {
      id: 't-angel-f167',
      name: 'Floor 167',
      enemies: {
        front: [UNMADE, NIGHTMARCH_OUTRIDER],
        back: [NIGHTMARCH_OUTRIDER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f168',
      name: 'Floor 168',
      enemies: {
        front: [FIRST_CINDER, CINDER_CULLER],
        back: [CINDER_CULLER, ZENITH_CHORISTER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f169',
      name: 'Floor 169',
      enemies: {
        front: [ASHFALL_SOVEREIGN, WARDEN],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-angel-f170',
      name: 'Floor 170 — The Narrow Mercy',
      enemies: {
        front: [FIRST_CINDER, ASHFALL_SOVEREIGN],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f171',
      name: 'Floor 171',
      enemies: { front: [FIRST_CINDER, OATHBREAKER], back: [RIFTSTEP_REAVER, PYRE, SKYSHRIKE] },
    },
    {
      id: 't-angel-f172',
      name: 'Floor 172',
      enemies: {
        front: [ASHFALL_SOVEREIGN, NIGHTMARCH_OUTRIDER],
        back: [RIFTSTEP_REAVER, QUENCHWRIGHT, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-angel-f173',
      name: 'Floor 173',
      enemies: {
        front: [FIRST_CINDER, WYRDROOT_ANCIENT],
        back: [CINDERQUENCH_BEARER, CINDER_CULLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f174',
      name: 'Floor 174',
      enemies: {
        front: [UNMADE, WEALDSHADOW_STALKER],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f175',
      name: 'Floor 175',
      enemies: {
        front: [FIRST_CINDER, SERAPH_ADJUDICANT],
        back: [WEALDSHADOW_STALKER, CINDER_CULLER, PYRE],
      },
    },
    {
      id: 't-angel-f176',
      name: 'Floor 176',
      enemies: {
        front: [ASHFALL_SOVEREIGN, WARDEN],
        back: [RIFTSTEP_REAVER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f177',
      name: 'Floor 177',
      enemies: { front: [UNMADE, PALE_WARDEN], back: [CINDER_CULLER, ZENITH_CHORISTER, SKYSHRIKE] },
    },
    {
      id: 't-angel-f178',
      name: 'Floor 178',
      enemies: {
        front: [FIRST_CINDER, OATHBREAKER],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-angel-f179',
      name: 'Floor 179',
      enemies: {
        front: [ASHFALL_SOVEREIGN, WEALDSHADOW_STALKER],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f180',
      name: 'Floor 180 — The Last Antiphon',
      enemies: {
        front: [FIRST_CINDER, ASHFALL_SOVEREIGN],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, NIGHTMARCH_OUTRIDER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Unanswered — Floors 181–200, levels 86–95 — two medium anchors, never two heavy ones and never three bodies above `haste` 126, because both dials at once is a board neither arrangement clears — and at the top, the verse that arrives late.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f181',
      name: 'Floor 181',
      enemies: {
        front: [FIRST_CINDER, ASHFALL_SOVEREIGN],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f182',
      name: 'Floor 182',
      enemies: {
        front: [THE_UNANSWERED, WARDEN],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-angel-f183',
      name: 'Floor 183',
      enemies: {
        front: [UNMADE, PALE_WARDEN],
        back: [WEALDSHADOW_STALKER, NIGHTMARCH_OUTRIDER, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f184',
      name: 'Floor 184',
      enemies: {
        front: [THE_UNANSWERED, FIRST_CINDER],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f185',
      name: 'Floor 185',
      enemies: {
        front: [ASHFALL_SOVEREIGN, OATHBREAKER],
        back: [CINDERQUENCH_BEARER, RIFTSTEP_REAVER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f186',
      name: 'Floor 186',
      enemies: {
        front: [THE_UNANSWERED, WYRDROOT_ANCIENT],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f187',
      name: 'Floor 187',
      enemies: {
        front: [FIRST_CINDER, COLOSSUS],
        back: [CINDER_CULLER, CINDERQUENCH_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f188',
      name: 'Floor 188',
      enemies: {
        front: [FIRST_CINDER, ASHFALL_SOVEREIGN],
        back: [RIFTSTEP_REAVER, NIGHTMARCH_OUTRIDER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-angel-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_UNANSWERED, WARDEN],
        back: [QUENCHWRIGHT, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f190',
      name: 'Floor 190 — The Silence Rising',
      enemies: {
        front: [THE_UNANSWERED, FIRST_CINDER],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f191',
      name: 'Floor 191',
      enemies: {
        front: [THE_UNANSWERED, FIRST_CINDER],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-angel-f192',
      name: 'Floor 192',
      enemies: {
        front: [ASHFALL_SOVEREIGN, OATHBREAKER],
        back: [WEALDSHADOW_STALKER, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-angel-f193',
      name: 'Floor 193',
      enemies: {
        front: [THE_UNANSWERED, WYRDROOT_ANCIENT],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-angel-f194',
      name: 'Floor 194',
      enemies: {
        front: [FIRST_CINDER, COLOSSUS],
        back: [CINDERQUENCH_BEARER, CINDER_CULLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f195',
      name: 'Floor 195',
      enemies: {
        front: [FIRST_CINDER, ASHFALL_SOVEREIGN],
        back: [RIFTSTEP_REAVER, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_UNANSWERED, WARDEN],
        back: [CINDER_CULLER, CINDERQUENCH_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-angel-f197',
      name: 'Floor 197',
      enemies: {
        front: [UNMADE, PALE_WARDEN],
        back: [RIFTSTEP_REAVER, SERAPH_ADJUDICANT, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-angel-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_UNANSWERED, FIRST_CINDER],
        back: [QUENCHWRIGHT, NIGHTMARCH_OUTRIDER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f199',
      name: 'Floor 199',
      enemies: {
        front: [ASHFALL_SOVEREIGN, OATHBREAKER],
        back: [CINDER_CULLER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f200',
      name: 'Floor 200 — The Unanswered',
      enemies: {
        front: [THE_UNANSWERED, FIRST_CINDER],
        back: [RIFTSTEP_REAVER, QUENCHWRIGHT, CINDER_CULLER],
      },
    },
  ],
} as const;
