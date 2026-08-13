import {
  ASHEN_CHOIR,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BLOODGORGE_HOUND,
  BLOODPACT_FIEND,
  BONECHAIN_WARDEN,
  BRAMBLEHIDE_RAVENER,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDERLING,
  CINDER_CULLER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  CONCORD_CANTOR,
  COVENANT_EXECUTOR,
  CROWNBARK_BASTION,
  DEEPGALLERY_RUNNER,
  DUSKFERN_SKIRMISHER,
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
  HEARTROOT_TENDER,
  IRONSLING_WRIGHT,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  NIGHTCANOPY_SINGER,
  NIGHTMARCH_OUTRIDER,
  OATHSHIELD_VANGUARD,
  OATHSTONE_BASTION,
  PLUMBLINE_HAND,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SEPULCHRE_HOUND,
  SLAGBOUND_DRUDGE,
  SUNMOTE_DANCER,
  THORNBACK_GRAZER,
  THORNLING,
  UNDERVAULT_SAPPER,
  UNSEALED_WRETCH,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The three shipped maps, in the order they unlock: finishing one opens the next.
 *
 * ## How to read a grid
 *
 * `#` wall · `.` path · `S` start · `X` exit · `a`–`z` a camp (its row below names it) · `1`–`9` a
 * chest. Movement is free and 4-adjacent; only fighting a camp spends stamina, and only a victory
 * spends it. The camp and chest letters are **save keys** — see `core/expedition/types.ts` — so
 * once a map ships, a cell keeps its letter forever.
 *
 * ## The authoring discipline, all of it inherited
 *
 * - **The budget must afford a route and must not afford the map.** `expedition.spec.ts` proves
 *   both with a route search — the roadmap named "no way to know it is solvable except by solving
 *   it" as this milestone's whole risk, and the Dijkstra in `core/expedition/map.ts` is that solve,
 *   run mechanically on every shipped grid. Every chest must also be affordable on its own; a
 *   reward nobody can ever take is the failure "nothing empty ships" forbids.
 * - **Boards follow the Descent pool's rules**, because these are fought by the same kind of party
 *   under the same attrition: both ranks filled within the party's shape, at least three factions a
 *   board, never a taunt beside a healer, at most one ascended anchor — and ascended anchors only
 *   where the map's own arc has earned one. Most boards here *are* Descent boards, lifted whole:
 *   they are measured content, and a puzzle mode's novelty budget is spent on the map, not on the
 *   stat blocks.
 * - **Levels are offsets off the anchor** (the hardest campaign stage ever cleared), so a map is
 *   the same fight at chapter 3 and chapter 10. A camp deep in a map runs hotter than one at the
 *   gate, and a boss runs hottest — the offsets below are the tuning dial `expedition.balance.ts`
 *   measures.
 *
 * ## The three puzzles, briefly
 *
 * 1. **The Wayfarer's Ford** teaches the mode: two lanes to one boss, one lane cheaper, and a
 *    budget of 7 that affords the cheap lane, the boss and the side cache exactly — fighting the
 *    dear lane too is the first thing the budget refuses.
 * 2. **The Sunken Causeway** asks the real question: three lanes at different prices, two vault
 *    pockets off the start, and enough stamina for one lane, the boss and *one* pocket.
 * 3. **The Shattered Spine** is the commitment: double-gated lanes, a tolled boss approach, and a
 *    budget that leaves five stamina of slack across thirty-four points of camps.
 */
export const EXPEDITION_MAPS = [
  {
    id: 'wayfarers-ford',
    name: "The Wayfarer's Ford",
    description: 'Two lanes cross the marsh, and only one of them is worth its toll.',
    grid: [
      '###X###',
      '###f###',
      '#..2..#',
      '#a###b#',
      '#.###.#',
      '#.###.#',
      '#.###.#',
      '#..S..#',
      '#1#c###',
      '###3###',
    ],
    stamina: 7,
    camps: [
      {
        cell: 'a',
        name: 'Mirewatch Pickets',
        stamina: 2,
        levelOffset: -12,
        boss: false,
        enemies: {
          front: [FORGE_THRALL, GRAVEWAKE_THRALL],
          back: [WHISPERLEAF_ARCHER, CINDERLING],
        },
      },
      {
        cell: 'b',
        name: 'Redwater Toll',
        stamina: 3,
        levelOffset: -10,
        boss: false,
        enemies: {
          front: [MIREWHELP, FORLORN_LEVY],
          back: [LUMEN_ACOLYTE, BARROWMIST_KEENER],
        },
      },
      {
        cell: 'c',
        name: 'Barrow Cache Watch',
        stamina: 2,
        levelOffset: -11,
        boss: false,
        enemies: {
          front: [VAULTBOUND_GAOLER, THORNBACK_GRAZER],
          back: [UNSEALED_WRETCH, DUSKFERN_SKIRMISHER],
        },
      },
      {
        cell: 'f',
        name: 'Warden of the Ford',
        stamina: 3,
        levelOffset: -6,
        boss: true,
        enemies: {
          front: [SENTINEL, FREE_BLADE],
          back: [WEALDSHADOW_STALKER, CINDERLING, MIREWHELP],
        },
      },
    ],
    chests: [
      { cell: '1', name: "Traveller's Cache", contents: { summons: 150 } },
      { cell: '2', name: 'Ford Toll Chest', contents: { gold: 10 } },
      { cell: '3', name: 'Barrow Cache', contents: { essence: 30 } },
    ],
  },
  {
    id: 'sunken-causeway',
    name: 'The Sunken Causeway',
    description: 'Three flooded lanes and two drowned vaults, and stamina for less than half.',
    grid: [
      '####X####',
      '####g####',
      '#.......#',
      '#2##.##.#',
      '#f##.##.#',
      '#1##.##.#',
      '#.##b##.#',
      '#a##.##c#',
      '#.##.##.#',
      '#...S...#',
      '##d###e##',
      '##3###4##',
    ],
    stamina: 13,
    camps: [
      {
        cell: 'a',
        name: 'Causeway Pickets',
        stamina: 2,
        levelOffset: -8,
        boss: false,
        enemies: {
          front: [SLAGBOUND_DRUDGE, THORNBACK_GRAZER],
          back: [ZENITH_CHORISTER, GRAVEWAKE_THRALL],
        },
      },
      {
        cell: 'f',
        name: 'The Upper Locks',
        stamina: 3,
        levelOffset: -5,
        boss: false,
        enemies: {
          front: [COLDHEARTH_IRONSWORN, SEPULCHRE_HOUND],
          back: [LONGBOUGH_MARKSMAN, CINDER_CULLER, CARRION_SWARM],
        },
      },
      {
        cell: 'b',
        name: 'The Drowned Gate',
        stamina: 4,
        levelOffset: -4,
        boss: false,
        enemies: {
          front: [OATHSHIELD_VANGUARD, DEEPGALLERY_RUNNER],
          back: [NIGHTCANOPY_SINGER, BARROWMIST_KEENER, VAULTLIGHT_CENSER],
        },
      },
      {
        cell: 'c',
        name: 'The Eastern Stair',
        stamina: 4,
        levelOffset: -4,
        boss: false,
        enemies: {
          front: [REDWATER_STALKER, CAIRNWARD_HUSK],
          back: [RIFTSTEP_REAVER, SUNMOTE_DANCER, COLDFORGE_HAND],
        },
      },
      {
        cell: 'd',
        name: 'Silt Vault Watch',
        stamina: 3,
        levelOffset: -6,
        boss: false,
        enemies: {
          front: [SEALWARD_CUSTODIAN, CHARNEL_DRUDGE],
          back: [KINGSWAY_LANCER, THORNLING, RIFTSTEP_REAVER],
        },
      },
      {
        cell: 'e',
        name: 'Reedbank Watch',
        stamina: 3,
        levelOffset: -6,
        boss: false,
        enemies: {
          front: [GRUDGEPLATE_SMITH, THORNBACK_GRAZER],
          back: [GRAVETIDE_HERALD, GLADE_STALKER, UNSEALED_WRETCH],
        },
      },
      {
        cell: 'g',
        name: 'The Causeway Keeper',
        stamina: 5,
        levelOffset: 0,
        boss: true,
        enemies: {
          front: [RIMEPLATE, CROWNBARK_BASTION],
          back: [EMBERSEED_WARLOCK, CONCORD_CANTOR, FORGE_THRALL],
        },
      },
    ],
    chests: [
      { cell: '1', name: 'Silt-buried Coffer', contents: { xp: 10 } },
      { cell: '2', name: 'Drowned Reliquary', contents: { emblems: 15 } },
      { cell: '3', name: "Smuggler's Cache", contents: { summons: 300 } },
      { cell: '4', name: 'Votive Chest', contents: { essence: 30 } },
    ],
  },
  {
    id: 'shattered-spine',
    name: 'The Shattered Spine',
    description: 'A broken ridge, every pass double-gated, and a toll on the summit itself.',
    grid: [
      '####X####',
      '####j####',
      '#...h...#',
      '#g##.##i#',
      '#.4#5#..#',
      '#.#####.#',
      '#e#####d#',
      '#.##3##.#',
      '#.##.##.#',
      '#a##b##c#',
      '#.##.##.#',
      '#...S...#',
      '#k#####l#',
      '#1#####2#',
    ],
    stamina: 22,
    camps: [
      {
        cell: 'a',
        name: 'The Western Scree',
        stamina: 2,
        levelOffset: -6,
        boss: false,
        enemies: {
          front: [CAIRNWARD_HUSK, PLUMBLINE_HAND],
          back: [GLOAMVINE_CREEPER, BLOODPACT_FIEND],
        },
      },
      {
        cell: 'c',
        name: 'The Eastern Scree',
        stamina: 2,
        levelOffset: -6,
        boss: false,
        enemies: {
          front: [REDWATER_STALKER, CHARNEL_DRUDGE],
          back: [BLOODPACT_FIEND, COLDFORGE_HAND, UNSEALED_WRETCH],
        },
      },
      {
        cell: 'k',
        name: 'The West Cache Toll',
        stamina: 2,
        levelOffset: -5,
        boss: false,
        enemies: {
          front: [MARCHWARD_PIKEMAN, GRAVEWAKE_THRALL],
          back: [DUSKFERN_SKIRMISHER, CINDERLING],
        },
      },
      {
        cell: 'l',
        name: 'The East Cache Toll',
        stamina: 3,
        levelOffset: -5,
        boss: false,
        enemies: {
          front: [BRAMBLEHIDE_RAVENER, FORLORN_LEVY],
          back: [ASHEN_CHOIR, SLAGBOUND_DRUDGE],
        },
      },
      {
        cell: 'b',
        name: 'The Undercroft Door',
        stamina: 3,
        levelOffset: -4,
        boss: false,
        enemies: {
          front: [OATHSTONE_BASTION, SCARBOUND_BELLOWER],
          back: [COVENANT_EXECUTOR, HEARTROOT_TENDER, GRAVEWAKE_THRALL],
        },
      },
      {
        cell: 'e',
        name: 'The Western Switchback',
        stamina: 3,
        levelOffset: -3,
        boss: false,
        enemies: {
          front: [BONECHAIN_WARDEN, FORLORN_LEVY],
          back: [UNDERVAULT_SAPPER, ZENITH_CHORISTER, GLOAMVINE_CREEPER],
        },
      },
      {
        cell: 'd',
        name: 'The Eastern Switchback',
        stamina: 3,
        levelOffset: -3,
        boss: false,
        enemies: {
          front: [BLOODGORGE_HOUND, SEPULCHRE_HOUND],
          back: [LONGBOUGH_MARKSMAN, REVENANT, CARRION_SWARM],
        },
      },
      {
        cell: 'g',
        name: 'The Western Pass',
        stamina: 4,
        levelOffset: -1,
        boss: false,
        enemies: {
          front: [KNELL_CHANTER, MARROWHUNT_ALPHA],
          back: [NIGHTMARCH_OUTRIDER, GLOAMVINE_CREEPER, CARRION_SWARM],
        },
      },
      {
        cell: 'i',
        name: 'The Eastern Pass',
        stamina: 3,
        levelOffset: -1,
        boss: false,
        enemies: {
          front: [IRONSLING_WRIGHT, RIVEN_MARCHWARDEN],
          back: [GRAVEMOURN_KEEPER, DUSKFERN_SKIRMISHER, UNSEALED_WRETCH],
        },
      },
      {
        // ⚠️ No ascended anchor here, and the first draft had one. Two ascended-anchor fights on
        // one route — this toll and the boss behind it — measured as a wall (0.00 finish at the
        // first two depths, three retries a camp), where no Descent day fields more than one.
        cell: 'h',
        name: 'The Summit Toll',
        stamina: 3,
        levelOffset: 1,
        boss: false,
        enemies: {
          front: [RUNEWARDEN, OATHSHIELD_VANGUARD],
          back: [GRAVETIDE_HERALD, ZENITH_CHORISTER, RENDFANG_JACKAL],
        },
      },
      {
        // +6 rather than the Descent's top +12: that mode's hottest fight arrives with eight
        // cards and two lives on a daily timer, this one with about five cards and a route already
        // paid for — measured at +10 the boss was unfinishable at the unlock even with retries.
        cell: 'j',
        name: 'The Spine-Crowned',
        stamina: 6,
        levelOffset: 4,
        boss: true,
        enemies: {
          front: [BARROW_SOVEREIGN, COLDHEARTH_IRONSWORN],
          back: [WEALDSHADOW_STALKER, GILDED_SENTRY, BLOODPACT_FIEND],
        },
      },
    ],
    chests: [
      { cell: '1', name: 'Spinefall Cache', contents: { gold: 12 } },
      { cell: '2', name: "Toll-keeper's Strongbox", contents: { summons: 350 } },
      { cell: '3', name: 'Sealed Reliquary', contents: { emblems: 20 } },
      { cell: '4', name: 'Wayshrine Offering', contents: { essence: 40 } },
      { cell: '5', name: "The Warden's Tithe", contents: { summons: 400, emblems: 10 } },
    ],
  },
] as const;
