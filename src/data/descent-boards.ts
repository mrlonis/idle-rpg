import {
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  BARROW_SOVEREIGN,
  BARROWMIST_KEENER,
  BLOODGORGE_HOUND,
  BLOODPACT_FIEND,
  BONECHAIN_WARDEN,
  BRAMBLEHIDE_RAVENER,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDER_CULLER,
  CINDERLING,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  CONCORD_CANTOR,
  COVENANT_BREAKER,
  COVENANT_EXECUTOR,
  CROWNBARK_BASTION,
  DEEPGALLERY_RUNNER,
  DUSKFERN_SKIRMISHER,
  EDGETURN_WARDEN,
  EMBERSEED_WARLOCK,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  GRUDGEPLATE_SMITH,
  HEADSMAN,
  HEARTROOT_TENDER,
  HEXBOUND_TORMENTOR,
  HOLLOWBARK_SENTRY,
  IRONSLING_WRIGHT,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTCANOPY_SINGER,
  NIGHTMARCH_OUTRIDER,
  OATHSHIELD_VANGUARD,
  OATHSTONE_BASTION,
  PLUMBLINE_HAND,
  RADIANT_HERALD,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUINWING_DEVOURER,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SKYSHRIKE,
  SLAGBOUND_DRUDGE,
  STILLNESS_CANTOR,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  THORNBACK_GRAZER,
  THORNLING,
  UNDERVAULT_SAPPER,
  UNSEALED_WRETCH,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WYRDROOT_ANCIENT,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The boards a Descent run may meet: twenty-four, of which nine are drawn each day.
 *
 * Five ordinary boards and three guardians per floor. A day takes two ordinaries and one guardian
 * from each floor's own group, without replacement, so the arc is always light-light-heavy three
 * times over and the *content* of it is different every day. Twenty ordered pairs of ordinary
 * boards times three guardians is 60 shapes a floor, and 216,000 distinct nine-fight runs.
 *
 * ## ⚠️ Every board is mixed-faction, and that is a rule rather than a flourish
 *
 * The crew's factions are **drawn** and the board's are not. A mono-faction board would therefore
 * make roughly a seventh of days a walkover and a seventh a wall, decided by a matchup nobody
 * chose — the exact opposite of what the matrix is for, which is deciding a fight the player
 * brought an answer to. Every board here fields at least three factions, and `descent.spec.ts`
 * holds it along with a bound on how far the whole pool's faction shares may drift apart.
 *
 * That is the deliberate inverse of a tower, where the boards lean hard on one faction *because*
 * the crew is known: a tower is a question with a fixed answer, and this is a question asked of an
 * answer that changes daily.
 *
 * ## What escalates across the three floors
 *
 * Not weight alone. Floor 1 is four bodies of mostly commons and exists to be cleared cheaply —
 * a run that arrives at floor 2 already wounded has lost, and a first floor that could do that
 * would make the mode a coin flip on the opening draw. Floor 2 goes to five bodies with a legendary
 * front and is where attrition starts to bite. Floor 3 fields two legendaries in front, and its
 * guardians are the only boards in the pool with an `ascended` anchor.
 *
 * ⚠️ **The escalation the player actually feels is their own health**, which is why the boards
 * escalate less steeply than a chapter's do. Nine fights at a flat difficulty would already ramp,
 * because the party entering fight nine is not the party that entered fight one.
 *
 * ## Two rules every board obeys, both held by `descent.spec.ts`
 *
 * - ⚠️ **No board pairs a taunt with a healer.** Sustain the party cannot aim at is the
 *   ninety-second clock wearing a boss's stat block — the failure milestone 15c found on the Dwarf
 *   Tower roof and the Bound Marches were built around avoiding. It bites harder here than
 *   anywhere: a timeout costs a life, and a run has two.
 * - ⚠️ **No board fields two `ascended` blocks.** One anchor is the top band in a tower and this
 *   mode fights with a wounded party; the pair that takes a fresh reference five to single digits
 *   would take a Descent party at fight nine to nothing.
 */

/** Floor 1's ordinary fights: four bodies, and cheap to clear. */
const FLOOR_1_ORDINARY = [
  {
    id: 'descent-1a',
    name: 'The Threshold',
    floor: 1,
    guardian: false,
    enemies: {
      front: [FORGE_THRALL, GRAVEWAKE_THRALL],
      back: [WHISPERLEAF_ARCHER, CINDERLING],
    },
  },
  {
    id: 'descent-1b',
    name: 'Wet Stone',
    floor: 1,
    guardian: false,
    enemies: {
      front: [MIREWHELP, FORLORN_LEVY],
      back: [LUMEN_ACOLYTE, BARROWMIST_KEENER],
    },
  },
  {
    id: 'descent-1c',
    name: 'The Low Gallery',
    floor: 1,
    guardian: false,
    enemies: {
      front: [SLAGBOUND_DRUDGE, HOLLOWBARK_SENTRY],
      back: [ZENITH_CHORISTER, RENDFANG_JACKAL],
    },
  },
  {
    id: 'descent-1d',
    name: 'Cold Ashes',
    floor: 1,
    guardian: false,
    enemies: {
      front: [VAULTBOUND_GAOLER, THORNBACK_GRAZER],
      back: [UNSEALED_WRETCH, DUSKFERN_SKIRMISHER],
    },
  },
  {
    // The first taunt a run can meet, on a common that dies to one turn — the mechanic introduced
    // where it costs a party almost nothing to answer wrongly.
    id: 'descent-1e',
    name: 'The Second Step',
    floor: 1,
    guardian: false,
    enemies: {
      front: [CAIRNWARD_HUSK, PLUMBLINE_HAND],
      back: [GLOAMVINE_CREEPER, BLOODPACT_FIEND],
    },
  },
] as const;

/** Floor 1's guardians: five bodies and a legendary front, still without an ascended anchor. */
const FLOOR_1_GUARDIANS = [
  {
    id: 'descent-1g1',
    name: 'The Warden of the First Stair',
    floor: 1,
    guardian: true,
    enemies: {
      front: [SENTINEL, FREE_BLADE],
      back: [WEALDSHADOW_STALKER, CINDERLING, MIREWHELP],
    },
  },
  {
    id: 'descent-1g2',
    name: 'The Choir at the Gate',
    floor: 1,
    guardian: true,
    enemies: {
      front: [GILDED_SENTRY, REVENANT],
      back: [ASHEN_CHOIR, MOONSONG_WEAVER, SLAGBOUND_DRUDGE],
    },
  },
  {
    id: 'descent-1g3',
    name: 'Something in the Dark',
    floor: 1,
    guardian: true,
    enemies: {
      front: [BRAMBLEHIDE_RAVENER, MARCHWARD_PIKEMAN],
      back: [HEXBOUND_TORMENTOR, WHISPERLEAF_ARCHER, FORLORN_LEVY],
    },
  },
] as const;

/** Floor 2's ordinary fights: five bodies, one legendary in front. */
const FLOOR_2_ORDINARY = [
  {
    id: 'descent-2a',
    name: 'The Long Dark',
    floor: 2,
    guardian: false,
    enemies: {
      front: [COLDHEARTH_IRONSWORN, SEPULCHRE_HOUND],
      back: [LONGBOUGH_MARKSMAN, CINDER_CULLER, CARRION_SWARM],
    },
  },
  {
    id: 'descent-2b',
    name: 'Hollow Lamps',
    floor: 2,
    guardian: false,
    enemies: {
      front: [OATHSHIELD_VANGUARD, DEEPGALLERY_RUNNER],
      back: [NIGHTCANOPY_SINGER, BARROWMIST_KEENER, VAULTLIGHT_CENSER],
    },
  },
  {
    id: 'descent-2c',
    name: 'The Bleeding Wall',
    floor: 2,
    guardian: false,
    enemies: {
      front: [REDWATER_STALKER, CAIRNWARD_HUSK],
      back: [RIFTSTEP_REAVER, SUNMOTE_DANCER, COLDFORGE_HAND],
    },
  },
  {
    id: 'descent-2d',
    name: 'Antiphon',
    floor: 2,
    guardian: false,
    enemies: {
      front: [SEALWARD_CUSTODIAN, CHARNEL_DRUDGE],
      back: [KINGSWAY_LANCER, THORNLING, RENDFANG_JACKAL],
    },
  },
  {
    id: 'descent-2e',
    name: 'Grudge and Rust',
    floor: 2,
    guardian: false,
    enemies: {
      front: [GRUDGEPLATE_SMITH, THORNBACK_GRAZER],
      back: [GRAVETIDE_HERALD, GLADE_STALKER, UNSEALED_WRETCH],
    },
  },
] as const;

/** Floor 2's guardians: a legendary front and a legendary back, and no anchor yet. */
const FLOOR_2_GUARDIANS = [
  {
    id: 'descent-2g1',
    name: 'The Keeper of the Middle Deep',
    floor: 2,
    guardian: true,
    enemies: {
      front: [RUNEWARDEN, OATHSHIELD_VANGUARD],
      back: [HEADSMAN, SKYSHRIKE, CINDERLING],
    },
  },
  {
    id: 'descent-2g2',
    name: 'The Weight of Years',
    floor: 2,
    guardian: true,
    enemies: {
      front: [RIMEPLATE, CROWNBARK_BASTION],
      back: [EMBERSEED_WARLOCK, CONCORD_CANTOR, FORGE_THRALL],
    },
  },
  {
    id: 'descent-2g3',
    name: 'The Sundered Choir',
    floor: 2,
    guardian: true,
    enemies: {
      front: [ANTIPHON_ARCHON, CAIRNBOUND_SENTINEL],
      back: [RADIANT_HERALD, WEALDSHADOW_STALKER, MIREWHELP],
    },
  },
] as const;

/** Floor 3's ordinary fights: two legendaries in front, and a run four to six fights deep. */
const FLOOR_3_ORDINARY = [
  {
    id: 'descent-3a',
    name: 'Where the Stair Ends',
    floor: 3,
    guardian: false,
    enemies: {
      front: [OATHSTONE_BASTION, SCARBOUND_BELLOWER],
      back: [COVENANT_EXECUTOR, HEARTROOT_TENDER, GRAVEWAKE_THRALL],
    },
  },
  {
    id: 'descent-3b',
    name: 'The Last Lamps',
    floor: 3,
    guardian: false,
    enemies: {
      front: [EDGETURN_WARDEN, BONECHAIN_WARDEN],
      back: [UNDERVAULT_SAPPER, SUNFADE_CHANTER, ZENITH_CHORISTER],
    },
  },
  {
    id: 'descent-3c',
    name: 'Red Water',
    floor: 3,
    guardian: false,
    enemies: {
      front: [BLOODGORGE_HOUND, COLDHEARTH_IRONSWORN],
      back: [RUINWING_DEVOURER, LONGBOUGH_MARKSMAN, REVENANT],
    },
  },
  {
    // The one board in the pool with no taunt anywhere on it, and it is the fastest — two
    // board-wide voices behind a body that hits. What it asks is whether the party can still spend
    // a turn on the back rank after four fights of being taught to clear the front.
    id: 'descent-3d',
    name: 'The Undersong',
    floor: 3,
    guardian: false,
    enemies: {
      front: [KNELL_CHANTER, MARROWHUNT_ALPHA],
      back: [STILLNESS_CANTOR, NIGHTMARCH_OUTRIDER, GLOAMVINE_CREEPER],
    },
  },
  {
    id: 'descent-3e',
    name: 'The Iron Vigil',
    floor: 3,
    guardian: false,
    enemies: {
      front: [IRONSLING_WRIGHT, RIVEN_MARCHWARDEN],
      back: [GRAVEMOURN_KEEPER, SERAPH_ADJUDICANT, DUSKFERN_SKIRMISHER],
    },
  },
] as const;

/**
 * Floor 3's guardians: the run's last fight, and the only boards with an `ascended` anchor.
 *
 * Three anchors rather than one, and deliberately three *different* ones — the Gate Warden, the
 * Barrow Sovereign and the Wyrdroot Ancient. A single closing body would make the whole mode one
 * fight learnt once; three means the last card choice is made against a board the run cannot
 * predict.
 *
 * ⚠️ **None of them is a chapter final, a chapter lieutenant or a tower roof.** Every chapter ends
 * on a boss fielded nowhere else, which is a rule `chapters.ts` states; borrowing one here would
 * break it silently, and borrowing a lieutenant would take a recurring antagonist and make it a
 * daily. ⚠️ **And none of them is the Unmade**, which `enemies.spec.ts` holds as the ceiling for
 * every block authored since — a wounded party at fight nine is not what that body is sized against.
 */
const FLOOR_3_GUARDIANS = [
  {
    id: 'descent-3g1',
    name: 'The Gate Warden',
    floor: 3,
    guardian: true,
    enemies: {
      front: [WARDEN, OATHSHIELD_VANGUARD],
      back: [GRAVETIDE_HERALD, MOONSONG_WEAVER, REDWATER_STALKER],
    },
  },
  {
    id: 'descent-3g2',
    name: 'The Sovereign of the Barrow',
    floor: 3,
    guardian: true,
    enemies: {
      front: [BARROW_SOVEREIGN, COLDHEARTH_IRONSWORN],
      back: [WEALDSHADOW_STALKER, COVENANT_BREAKER, GILDED_SENTRY],
    },
  },
  {
    id: 'descent-3g3',
    name: 'The Root Beneath',
    floor: 3,
    guardian: true,
    enemies: {
      front: [WYRDROOT_ANCIENT, RIMEPLATE],
      back: [ASHEN_CHOIR, HEADSMAN, COLDFORGE_HAND],
    },
  },
] as const;

/** Every board the Descent may draw, floor by floor, ordinary fights before guardians. */
export const DESCENT_BOARDS = [
  ...FLOOR_1_ORDINARY,
  ...FLOOR_1_GUARDIANS,
  ...FLOOR_2_ORDINARY,
  ...FLOOR_2_GUARDIANS,
  ...FLOOR_3_ORDINARY,
  ...FLOOR_3_GUARDIANS,
] as const;
