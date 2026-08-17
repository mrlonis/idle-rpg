import {
  ASHEN_CHOIR,
  ASHFALL_SOVEREIGN,
  ASHPIT_SCUTTLER,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BLOODPACT_FIEND,
  BOAR,
  BRAMBLEWALK_SCOUT,
  CARRION_SWARM,
  CINDERLING,
  CINDERPLATE_HOUNDSMAN,
  CINDERQUENCH_BEARER,
  CINDERSEED_COURSER,
  CINDER_CULLER,
  CLEFTHORN_GORER,
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
  IRONSLING_WRIGHT,
  KILNSTROKE_CELEBRANT,
  KILNSWORN_ADEPT,
  KINGSWAY_LANCER,
  LUMEN_ACOLYTE,
  MARROWHUNT_ALPHA,
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
  RIFTEDGE_CANTOR,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RUINWING_DEVOURER,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SHATTERJAW_MAULER,
  SKYSHRIKE,
  SLAGHIDE_PURSUER,
  STORMCALLER,
  SUNMOTE_DANCER,
  THE_LAST_MERCY,
  THE_UNANSWERED,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNMADE,
  VANWARD_SPEAR,
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
 * The Angel Tower — three hundred floors, enemy levels 1 to 142.
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
 * healer leaves both crews at 4.00 survivors and buys nothing but eleven seconds.
 *
 * ## ⚠️ What is forbidden above floor 160, restated because the old wording was wrong
 *
 * This block used to say that no board above floor 160 carries "a heal, a regeneration, a drain or
 * `lifeLeech`", and walking the floors rather than reading them says otherwise on the second clause.
 * Over floors 161–300: **no board carries a `heal` effect, a `drain`, a `regen` status or a point of
 * `lifeLeech`** — but 111 carry `recovery` and 29 carry `healthRegen`, both of which are a
 * regeneration in the plain sense of the word, and both of which sit on the anchors this tower has
 * fielded since its first hundred ({@link FIRST_CINDER} at 5, {@link ASHFALL_SOVEREIGN} at 7,
 * {@link UNMADE} at 8, {@link WYRDROOT_ANCIENT} at 9 and 0.2).
 *
 * The honest fix is the claim rather than the boards, exactly as the Crownworks found for
 * `tower-dwarf.ts` and the Closing for `tower-monster.ts` — this is the third tower to make the same
 * mistake. Restating it keeps every measured figure on those floors valid where retuning a hundred
 * and eleven shipped boards would invalidate all of them. ⚠️ **The counts are stated as a range
 * rather than as a threshold**, because "above floor 160" meant forty boards when it was first
 * written and means a hundred and forty now; over 161–200 alone the same counts read 37 and 6.
 *
 * ## ⚠️ The third hundred escalates through the *size of one blow*, which is a cadence rather than a
 * mechanic
 *
 * The second hundred's two dials are spent — both at once already reads 0.00 for both arrangements —
 * and the twenty-two shapes it ruled out stayed ruled out at the new roof's level. Against a
 * **3.98 / 3.80** control at level 142: `magicResist` 0.15 → 0.70 moves the pair 4.00 → 3.88 and
 * 3.70 → 3.45 while adding six seconds a board, `physicalResist` 0.45 reads 4.00 / 3.77, `dodge`
 * 0.30 reads 4.00 / 3.80, `tenacity` 0.60 reads 4.00 / 3.60, and enemy durability from hp 1000 to
 * 2000 is not even monotonic (3.98 / 3.30 / 3.60 against 3.45 / 3.08 / 2.25) and is paid entirely in
 * the clock, 21.5s to 35.3s. Crit at the Elf Tower's own ceiling does move the alternate — 3.73 /
 * 2.13 — and was declined anyway: it is that tower's lock, and this crew carries the game's highest
 * `critDamageResist` at 0.76 and 0.96 summed across five.
 *
 * What moves an Angel five is how *large a single instance of damage is*. Same control, damage per
 * second **held constant**, both endpoints inside the shipped cooldown register:
 *
 * ```
 *   power 1.55 / cd 35    ref 4.00         alt 3.52
 *   power 2.20 / cd 50    ref 3.38 · 93%   alt 1.02 · 38%
 *   power 3.10 / cd 70    ref 2.33 · 68%   alt 0.15 · 13%
 * ```
 *
 * **Less total damage, delivered lumpier, kills more of this crew** — because every Angel heal names
 * `ally-lowest` on a cooldown, so a stream of chip is exactly what the choir is built to answer and a
 * body removed between two heal ticks cannot be healed at all. The bands escalate by how much of a
 * board swings one: **1.20 bodies a board over 201–220, 2.60 over 221–245, 3.52 over 246–270 and
 * 4.50 over 271–290**, closing at 4.00 because the last band trades a voice for a slab of weight in
 * front of the anchor. See {@link THE_SINGLE_STROKE} in `skills.ts` for the full grade and the
 * seven-crew control.
 *
 * ⚠️ **The licence is margin rather than exclusivity, and that is weaker than the Closing's.** As a
 * change on each crew's own calibrated control, burst costs angel-alt **−2.38** and angel-ref −1.35
 * against elf-alt −2.08, undead-alt −1.80 and monster-ref −0.63 — everybody loses about a member and
 * the choir loses two.
 *
 * ⚠️ **The blow and the aim are a product.** Four bodies swinging 2.30 at the front rank read
 * 2.98 · 95% / 1.07 · 57%; four swinging **less**, at 2.10, and naming `enemy-lowest` read
 * **1.50 · 75% / 0.00**. So the aim arrives a band later, no board carries more than two of it, and
 * the roof names nothing but the front rank.
 *
 * ⚠️ **The collapse check came back clean on the anchors and dirty on the pairing.** The shipped
 * floor-200 board fielded up its own level line against the band-3 crew reads 100% with all five
 * alive at 95, 100% / 5.00 at 125 and **73% / 1.60 against 50% / 0.85** at 142 — but all nine
 * `ascended` blocks this tower fields above floor 160 read 100% for both crews at 142 behind three
 * soft bodies, {@link UNMADE} at 1800/100 included at 4.33 / 4.38. What breaks floor 200 up there is
 * that it stands **two** of them in one front rank, and {@link THE_LAST_MERCY} beside
 * {@link THE_UNANSWERED} at the roof's level reads 0%. So no anchor retires — the second hundred of
 * four to find that — and no board in the third hundred carries two.
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
    // The Wounded First — Floors 121–140, levels 58–66 — the aim arrives at weight: every board names the one body the choir has just committed to, and one of them collects the heal as it lands.
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

    // -------------------------------------------------------------------------------------
    // The Slow Wound — Floors 201–220, levels 95–104 — one body a board swings something that arrives in one piece, and the rest of it is the chip the choir has answered for two hundred floors.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f201',
      name: 'Floor 201',
      enemies: {
        front: [FIRST_CINDER, RIFTSTEP_REAVER],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f202',
      name: 'Floor 202',
      enemies: {
        front: [PALE_WARDEN, CINDERPLATE_HOUNDSMAN],
        back: [KILNSTROKE_CELEBRANT, RENDFANG_JACKAL, MIREWHELP],
      },
    },
    {
      id: 't-angel-f203',
      name: 'Floor 203',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [CLEFTHORN_GORER, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f204',
      name: 'Floor 204',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [RIFTSTEP_REAVER, CINDERQUENCH_BEARER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f205',
      name: 'Floor 205',
      enemies: {
        front: [WARDEN, RIFTEDGE_CANTOR],
        back: [VANWARD_SPEAR, CINDER_CULLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f206',
      name: 'Floor 206',
      enemies: {
        front: [OATHBREAKER, CINDERSEED_COURSER],
        back: [KILNSTROKE_CELEBRANT, ASHPIT_SCUTTLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-angel-f207',
      name: 'Floor 207',
      enemies: {
        front: [FIRST_CINDER, SLAGHIDE_PURSUER],
        back: [CLEFTHORN_GORER, MOONSONG_WEAVER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f208',
      name: 'Floor 208',
      enemies: {
        front: [COLOSSUS, CINDERPLATE_HOUNDSMAN],
        back: [KILNSTROKE_CELEBRANT, RENDFANG_JACKAL, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f209',
      name: 'Floor 209',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSWORN_ADEPT],
        back: [VANWARD_SPEAR, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f210',
      name: 'Floor 210 — The Slow Wound',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [RIFTSTEP_REAVER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f211',
      name: 'Floor 211',
      enemies: {
        front: [PALE_WARDEN, RIFTEDGE_CANTOR],
        back: [KILNSTROKE_CELEBRANT, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-angel-f212',
      name: 'Floor 212',
      enemies: {
        front: [WYRDROOT_ANCIENT, CINDERSEED_COURSER],
        back: [CLEFTHORN_GORER, CINDER_CULLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f213',
      name: 'Floor 213',
      enemies: {
        front: [FIRST_CINDER, KILNSWORN_ADEPT],
        back: [KILNSTROKE_CELEBRANT, RENDFANG_JACKAL, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-angel-f214',
      name: 'Floor 214',
      enemies: {
        front: [OATHBREAKER, SLAGHIDE_PURSUER],
        back: [VANWARD_SPEAR, MOONSONG_WEAVER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f215',
      name: 'Floor 215',
      enemies: {
        front: [COLOSSUS, CINDERPLATE_HOUNDSMAN],
        back: [KILNSTROKE_CELEBRANT, ASHPIT_SCUTTLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f216',
      name: 'Floor 216',
      enemies: {
        front: [FIRST_CINDER, EMBERSEED_WARLOCK],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f217',
      name: 'Floor 217',
      enemies: {
        front: [WYRDROOT_ANCIENT, RIFTEDGE_CANTOR],
        back: [CLEFTHORN_GORER, DUSKFERN_SKIRMISHER, MIREWHELP],
      },
    },
    {
      id: 't-angel-f218',
      name: 'Floor 218',
      enemies: {
        front: [PALE_WARDEN, CINDERSEED_COURSER],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f219',
      name: 'Floor 219',
      enemies: {
        front: [OATHBREAKER, KILNSWORN_ADEPT],
        back: [VANWARD_SPEAR, RENDFANG_JACKAL, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f220',
      name: 'Floor 220 — The Stroke Falls',
      enemies: {
        front: [PALE_WARDEN, KINGSWAY_LANCER],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, RIFTSTEP_REAVER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Second Stroke — Floors 221–245, levels 105–116 — two, and the tower starts drawing its swingers from every bench it has rather than from the two blocks this band introduced.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f221',
      name: 'Floor 221',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [CLEFTHORN_GORER, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f222',
      name: 'Floor 222',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f223',
      name: 'Floor 223',
      enemies: {
        front: [THE_UNANSWERED, RIFTEDGE_CANTOR],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, MIREWHELP],
      },
    },
    {
      id: 't-angel-f224',
      name: 'Floor 224',
      enemies: {
        front: [OATHBREAKER, CINDERPLATE_HOUNDSMAN],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f225',
      name: 'Floor 225',
      enemies: {
        front: [FIRST_CINDER, KILNSWORN_ADEPT],
        back: [KINGSWAY_LANCER, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f226',
      name: 'Floor 226',
      enemies: {
        front: [THE_UNANSWERED, CINDERPLATE_HOUNDSMAN],
        back: [SHATTERJAW_MAULER, CINDER_CULLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f227',
      name: 'Floor 227',
      enemies: {
        front: [COLOSSUS, CINDERSEED_COURSER],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f228',
      name: 'Floor 228',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CINDER_CULLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f229',
      name: 'Floor 229',
      enemies: {
        front: [ASHFALL_SOVEREIGN, SLAGHIDE_PURSUER],
        back: [KILNSTROKE_CELEBRANT, CINDERQUENCH_BEARER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f230',
      name: 'Floor 230 — The Second Stroke',
      enemies: {
        front: [THE_UNANSWERED, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CINDER_CULLER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-angel-f231',
      name: 'Floor 231',
      enemies: {
        front: [FIRST_CINDER, RIFTEDGE_CANTOR],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f232',
      name: 'Floor 232',
      enemies: {
        front: [PALE_WARDEN, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f233',
      name: 'Floor 233',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSWORN_ADEPT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-angel-f234',
      name: 'Floor 234',
      enemies: {
        front: [ASHFALL_SOVEREIGN, CINDERPLATE_HOUNDSMAN],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f235',
      name: 'Floor 235',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [CLEFTHORN_GORER, RIFTSTEP_REAVER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-angel-f236',
      name: 'Floor 236',
      enemies: {
        front: [COLOSSUS, CINDERSEED_COURSER],
        back: [SHATTERJAW_MAULER, KINGSWAY_LANCER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f237',
      name: 'Floor 237',
      enemies: {
        front: [FIRST_CINDER, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f238',
      name: 'Floor 238',
      enemies: {
        front: [WYRDROOT_ANCIENT, MARROWHUNT_ALPHA],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f239',
      name: 'Floor 239',
      enemies: {
        front: [ASHFALL_SOVEREIGN, RIFTEDGE_CANTOR],
        back: [CLEFTHORN_GORER, KILNSTROKE_CELEBRANT, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f240',
      name: 'Floor 240 — The Verse Interrupted',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CINDER_CULLER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f241',
      name: 'Floor 241',
      enemies: {
        front: [OATHBREAKER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-angel-f242',
      name: 'Floor 242',
      enemies: {
        front: [FIRST_CINDER, IRONSLING_WRIGHT],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f243',
      name: 'Floor 243',
      enemies: {
        front: [WYRDROOT_ANCIENT, CINDERPLATE_HOUNDSMAN],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-angel-f244',
      name: 'Floor 244',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [CLEFTHORN_GORER, SHATTERJAW_MAULER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f245',
      name: 'Floor 245',
      enemies: {
        front: [THE_UNANSWERED, CINDERSEED_COURSER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Gathering Hand — Floors 246–270, levels 116–128 — three, and the first boards that aim the blow at the body the choir has already committed a heal to.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f246',
      name: 'Floor 246',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f247',
      name: 'Floor 247',
      enemies: {
        front: [WYRDROOT_ANCIENT, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f248',
      name: 'Floor 248',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [CLEFTHORN_GORER, VANWARD_SPEAR, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f249',
      name: 'Floor 249',
      enemies: {
        front: [THE_UNANSWERED, WEALDSHADOW_STALKER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-angel-f250',
      name: 'Floor 250 — The Gathering Hand',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-angel-f251',
      name: 'Floor 251',
      enemies: {
        front: [COLOSSUS, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, KINGSWAY_LANCER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f252',
      name: 'Floor 252',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [VANWARD_SPEAR, CLEFTHORN_GORER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f253',
      name: 'Floor 253',
      enemies: {
        front: [WYRDROOT_ANCIENT, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f254',
      name: 'Floor 254',
      enemies: {
        front: [OATHBREAKER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f255',
      name: 'Floor 255',
      enemies: {
        front: [THE_UNANSWERED, KINGSWAY_LANCER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f256',
      name: 'Floor 256',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-angel-f257',
      name: 'Floor 257',
      enemies: {
        front: [FIRST_CINDER, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f258',
      name: 'Floor 258',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSTROKE_CELEBRANT],
        back: [CLEFTHORN_GORER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-angel-f259',
      name: 'Floor 259',
      enemies: {
        front: [UNMADE, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f260',
      name: 'Floor 260 — Between Two Mercies',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [VANWARD_SPEAR, CLEFTHORN_GORER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f261',
      name: 'Floor 261',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f262',
      name: 'Floor 262',
      enemies: {
        front: [WYRDROOT_ANCIENT, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f263',
      name: 'Floor 263',
      enemies: {
        front: [COLOSSUS, KILNSTROKE_CELEBRANT],
        back: [VANWARD_SPEAR, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f264',
      name: 'Floor 264',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-angel-f265',
      name: 'Floor 265',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-angel-f266',
      name: 'Floor 266',
      enemies: {
        front: [FIRST_CINDER, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-angel-f267',
      name: 'Floor 267',
      enemies: {
        front: [UNMADE, KILNSTROKE_CELEBRANT],
        back: [VANWARD_SPEAR, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f268',
      name: 'Floor 268',
      enemies: {
        front: [WYRDROOT_ANCIENT, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, KINGSWAY_LANCER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-angel-f269',
      name: 'Floor 269',
      enemies: {
        front: [THE_UNANSWERED, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-angel-f270',
      name: 'Floor 270 — The Choir Behind',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, RIFTSTEP_REAVER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Blow Entire — Floors 271–290, levels 128–137 — four, and the anchors that have swung one since the second hundred are now the smallest part of what does.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f271',
      name: 'Floor 271',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f272',
      name: 'Floor 272',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f273',
      name: 'Floor 273',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-angel-f274',
      name: 'Floor 274',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f275',
      name: 'Floor 275',
      enemies: {
        front: [UNMADE, KILNSTROKE_CELEBRANT],
        back: [VANWARD_SPEAR, CLEFTHORN_GORER, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f276',
      name: 'Floor 276',
      enemies: {
        front: [FIRST_CINDER, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, CLEFTHORN_GORER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f277',
      name: 'Floor 277',
      enemies: {
        front: [THE_UNANSWERED, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f278',
      name: 'Floor 278',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, CINDER_CULLER],
      },
    },
    {
      id: 't-angel-f279',
      name: 'Floor 279',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f280',
      name: 'Floor 280 — The Blow Entire',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, KILNSTROKE_CELEBRANT],
      },
    },
    {
      id: 't-angel-f281',
      name: 'Floor 281',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-angel-f282',
      name: 'Floor 282',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f283',
      name: 'Floor 283',
      enemies: {
        front: [UNMADE, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f284',
      name: 'Floor 284',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, KILNSTROKE_CELEBRANT],
      },
    },
    {
      id: 't-angel-f285',
      name: 'Floor 285',
      enemies: {
        front: [WYRDROOT_ANCIENT, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f286',
      name: 'Floor 286',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-angel-f287',
      name: 'Floor 287',
      enemies: {
        front: [FIRST_CINDER, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f288',
      name: 'Floor 288',
      enemies: {
        front: [THE_UNANSWERED, SHATTERJAW_MAULER],
        back: [KILNSTROKE_CELEBRANT, VANWARD_SPEAR, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-angel-f289',
      name: 'Floor 289',
      enemies: {
        front: [UNMADE, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, CLEFTHORN_GORER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f290',
      name: 'Floor 290 — Faster Than the Ward',
      enemies: {
        front: [ASHFALL_SOVEREIGN, KILNSTROKE_CELEBRANT],
        back: [SHATTERJAW_MAULER, VANWARD_SPEAR, KILNSTROKE_CELEBRANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Last Mercy — Floors 291–300, levels 138–142 — one anchor and never two, a slab in front of it to spend the clock on, and behind that everything the hundred has been building toward.
    // -------------------------------------------------------------------------------------
    {
      id: 't-angel-f291',
      name: 'Floor 291',
      enemies: {
        front: [THE_UNANSWERED, MARROWHUNT_ALPHA],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f292',
      name: 'Floor 292',
      enemies: {
        front: [ASHFALL_SOVEREIGN, MARROWHUNT_ALPHA],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f293',
      name: 'Floor 293',
      enemies: {
        front: [UNMADE, THORNBACK_GRAZER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f294',
      name: 'Floor 294',
      enemies: {
        front: [THE_LAST_MERCY, WRATHBORN],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f295',
      name: 'Floor 295',
      enemies: {
        front: [ASHFALL_SOVEREIGN, THORNBACK_GRAZER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, SHATTERJAW_MAULER],
      },
    },
    {
      id: 't-angel-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_LAST_MERCY, MARROWHUNT_ALPHA],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f297',
      name: 'Floor 297',
      enemies: {
        front: [UNMADE, THORNBACK_GRAZER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f298',
      name: 'Floor 298',
      enemies: {
        front: [THE_LAST_MERCY, RIMEPLATE],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-angel-f299',
      name: 'Floor 299',
      enemies: {
        front: [THE_LAST_MERCY, THORNBACK_GRAZER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-angel-f300',
      name: 'Floor 300 — The Last Mercy',
      enemies: {
        front: [THE_LAST_MERCY, THORNBACK_GRAZER],
        back: [KILNSTROKE_CELEBRANT, SHATTERJAW_MAULER, SHATTERJAW_MAULER],
      },
    },
  ],
} as const;
