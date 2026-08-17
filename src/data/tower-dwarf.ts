import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHPIT_SCUTTLER,
  BANDIT,
  BARROWMIST_KEENER,
  BOAR,
  BRAMBLEWALK_SCOUT,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDERLING,
  CINDER_CULLER,
  COLDFORGE_HAND,
  COLOSSUS,
  COUNTERSIGN_CAPTAIN,
  CROWNWORKS_STRIKER,
  DEEPGALLERY_RUNNER,
  DUSKFERN_SKIRMISHER,
  EMBERSEED_WARLOCK,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  HEARTROOT_TENDER,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  KILNSWORN_ADEPT,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LITANY_BEARER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  MOONSONG_WEAVER,
  MUSTER_PIKE,
  NIGHTCANOPY_SINGER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  ORDER_SERJEANT,
  PYRE,
  QUENCHPIT_IRONHIDE,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  RESERVE_ENSIGN,
  REVENANT,
  RIFTBORN_HARROWER,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  ROADWATCH_BOWMAN,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SIGNAL_RUNNER,
  SKYSHRIKE,
  SLAGBOUND_DRUDGE,
  SLIME,
  STANDFAST_LANCER,
  STORMCALLER,
  THE_BREACHLORD,
  THE_CROWN_WHEEL,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNDERVAULT_SAPPER,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WISP,
  WRATHBORN,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Dwarf Tower — three hundred floors, enemy levels 1 to 142.
 *
 * ## Why the enemies are mostly Human
 *
 * Humans beat Dwarves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * About three fifths of the slots are Human — **61.3%** across the whole tower — and the rest are
 * spread across the other six factions, which is the shape the matrix needs: a mono-Dwarf five meets
 * fights it is unfavoured in *and* fights it is favoured in, rather than a mirror match that would
 * switch the matrix off entirely. [`towers.spec.ts`](./towers.spec.ts) measures the share rather than
 * trusting this paragraph.
 *
 * ⚠️ **Every hundred so far has wanted to be far more Human than that** — authored from the lean's
 * own bench the second came out at 86%, exactly as 21e's did — and each is held down by substituting
 * non-Human bodies of comparable weight through the filler slots. That is a thing to do on purpose
 * rather than a thing that happens. The third hundred landed at **63.4%** by drawing its texture from
 * the other three factions that also counter Dwarves: Monsters and Humans at ×1.05, Demons and Angels
 * at ×1.10. ⚠️ **Drawing a substitute from anywhere else quietly switches the lean off on that
 * board.**
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
 * ## ⚠️ The third hundred: the board stops having passengers
 *
 * The Crownworks — floors 201–300, levels 95–142, the hold's own forge-halls above the breach with
 * the host working them. Its shape is **not** a third dial on top of the second hundred's two, and
 * the reason is arithmetic rather than taste.
 *
 * ⚠️ **An anchor outgrows this crew across a hundred floors, so the anchors get _lighter_ as it
 * climbs.** `perLevel.ascended` is 1.024 and `perLevel.legendary` 1.0225, while a mono-faction Dwarf
 * five is mostly `common` at 1.021 — so over the 47 levels this hundred spans, the heavy blocks pull
 * away by roughly ×1.15 more than the party does. Measured on the shipped floor-200 board fielded up
 * its own level line against the band-3 crew:
 *
 * | The floor-200 board, fielded at | reference five  | alternate five |
 * | ------------------------------- | --------------- | -------------- |
 * | level 95 (its own)              | 100% / 5.00     | 100% / 5.00    |
 * | level 125                       | 100% / 4.97     | 100% / 4.00    |
 * | level 142 (the roof)            | **28% / 0.47**  | **5% / 0.05**  |
 *
 * So the second hundred's climax is unwinnable at the third's roof, and the escalation has to come
 * out of the **other four slots**: floors 201–220 field one body that swings, 221–245 two, 246–270
 * two behind a wall, 271–290 three, and 291–300 nothing else at all.
 *
 * ⚠️ **What moves a Dwarf five is `atk` and rate of action _as a product_, and nothing else does.**
 * One anchor plus four bodies whose whole kit is their swing, at the roof's level, forty seeds —
 * survivors of five, and neither factor alone is a fight:
 *
 * | Four bodies at        | reference | alternate |
 * | --------------------- | --------- | --------- |
 * | `atk` 72, `haste` 98  | 4.00      | 4.00      |
 * | `atk` 86, `haste` 98  | 4.00      | 3.25      |
 * | `atk` 72, `haste` 126 | 4.00      | 3.05      |
 * | `atk` 86, `haste` 126 | **2.88**  | **1.77**  |
 *
 * ⚠️ **`attackSpeed` measures identically to `haste` and is not the loophole it looks like.** It is
 * the one field of `StatBlockData` no shipped block uses, and `atk` 72 with `attackSpeed` 45 reads
 * 3.77 / 2.63 against `haste` 143's 3.48 / 2.35 — the same number. `effectiveSpeed` adds the two and
 * applies the slow multiplier to the **sum**, so it is not even proof against the `slow` both Dwarf
 * arrangements carry. Recorded so the next session does not spend the measurement again.
 *
 * ⚠️ **The negative results are the rest of the finding and they are unusually strong.** Against a
 * 4.38 / 4.00 control, scope and aim are inert or *worse than saying nothing* — `enemy-row-back`
 * 5.00 / 4.28, `enemy-back` 5.00 / 4.17, `enemy-highest` 5.00 / 4.25, `enemy-all` 4.95 / 4.00,
 * `enemy-lowest` 4.92 / 4.00, every one of them at or above it. **A Dwarf five heals, shields and
 * guards `ally-all`, so spread damage is the shape it answers best** — the exact inverse of the Demon Tower, where wide
 * damage was the whole axis. Riders are inert (a 50% stun 4.13 / 4.00, a poison 4.08 / 4.00, a bomb
 * 4.08 / 4.00). `tenacity` at 0.40 / 0.60 / 0.85 reads 3.45 / 3.23 / 3.08 and `physicalResist` at
 * 0.15 / 0.23 reads 3.58 / 3.33, on crews that carry **no `insight` and no `magicResist` at all** —
 * the two gaps that looked like locks, each worth a tenth of a party member.
 *
 * The one shape that is worth something beside the swing is
 * [`QUENCHPIT_IRONHIDE`](./enemies.ts) — a taunt on the body that is *itself* the durability, at
 * 3.98 / **3.02**. It arrives a band after the swing does and it never stands on the roof.
 *
 * ## What the bands measure at
 *
 * Band 1: floor 1 in one second, floor 50 in seven, floor 100 in forty-four with three of five
 * down. Band 2: floor 101 in five seconds, floor 160 in fourteen, floor 200 in thirty-six at 98%
 * with 2.3 alive, and the alternate five takes it at **88% with 1.5**. Band 3: floor 201 in eight
 * seconds, floor 250 in twelve, floor 290 in twenty at 4.03, floor 299 in twenty-eight at 3.00, and
 * the roof in **thirty-three seconds at 2.77 — 42.3s and 1.82 for the alternate five.** Win rate is
 * 100% almost the whole way, which is the intended shape — a floor is climbed once and there is no
 * way around one. What ramps is what it costs: the reference five loses nobody below floor 80 in
 * band 1, floor 185 in band 2 or **floor 280** in band 3, and the alternate first pays at **251**.
 *
 * ⚠️ **The roof is the tightest fight in the project against the timer and it is worth knowing.**
 * The alternate five's longest single attempt on floor 300 is **62.5 seconds** against the sweep's
 * 67.5-second bar for a cleared fight, and no other floor in the hundred passes 39.2. A heavier roof
 * was measured and rejected for exactly this reason rather than for its win rate.
 *
 * ⚠️ **The roof is far lighter than the Human Tower's and that is 15c's rule rather than an
 * oversight**: anchors are sized against the tower's own crew, never to a shared weight. A roof at
 * The Deathless Marshal's weight reads **0%** for both Dwarf arrangements. See
 * [`THE_BREACHLORD`](./enemies.ts) and [`THE_CROWN_WHEEL`](./enemies.ts) — which is *lighter* than
 * the Breachlord it succeeds, for the growth reason above.
 *
 * ⚠️ **No board pairs a taunt with a body that heals**, and **no board above floor 200 restores
 * anything at all** — checked by walking all three hundred floors with a script rather than by
 * reading them, which is how the one board that broke it was found.
 *
 * ⚠️ **The stricter claim this file used to make about floor 180 was wrong, and the script is what
 * caught it.** Three boards above 180 do carry restoration: the Oathshield Vanguard's `recovery` 5 on
 * floors 186 and 194, and the Sepulchre Hound's `lifeLeech` 0.10 on floor 188. Both are the tolerable
 * form and neither is what 15c measured — the Vanguard's recovery sits on the body that is *itself*
 * the taunt, so the party is already hitting the thing that heals, and a tenth of leech on a body in
 * the open is not sustain anyone has to outpace. **What is forbidden above floor 180 is a heal, a
 * drain or a regeneration**, and there is none.
 *
 * Re-run `npm run test:balance` after touching any band above floor 68, floor 180 or floor 270.
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
    // The Undervault — Floors 121–140, levels 58–66 — somebody has found the seams, and armour stops being an answer.
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

    // -------------------------------------------------------------------------------------
    // The Stair Above the Breach — Floors 201–220, levels 95–104 — the Breachlord is dead and the works above him are lit. One body a board is new, and it is the one that swings.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f201',
      name: 'Floor 201',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [STORMCALLER, ASHPIT_SCUTTLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f202',
      name: 'Floor 202',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [SKYSHRIKE, PYRE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f203',
      name: 'Floor 203',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [SERAPH_ADJUDICANT, CINDER_CULLER, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-dwarf-f204',
      name: 'Floor 204',
      enemies: {
        front: [WARDEN, UNDERVAULT_SAPPER],
        back: [DUSKFERN_SKIRMISHER, ASHPIT_SCUTTLER, VAULTBOUND_GAOLER],
      },
    },
    {
      id: 't-dwarf-f205',
      name: 'Floor 205',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [LITANY_BEARER, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f206',
      name: 'Floor 206',
      enemies: {
        front: [OATHBREAKER, STORMCALLER],
        back: [CINDERLING, SKYSHRIKE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f207',
      name: 'Floor 207',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [ZENITH_CHORISTER, CARRION_SWARM, STORMCALLER],
      },
    },
    {
      id: 't-dwarf-f208',
      name: 'Floor 208',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [PYRE, BRAMBLEWALK_SCOUT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f209',
      name: 'Floor 209',
      enemies: {
        front: [WARDEN, CROWNWORKS_STRIKER],
        back: [RENDFANG_JACKAL, VANWARD_SPEAR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f210',
      name: 'Floor 210 — The Stair Above the Breach',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [STORMCALLER, SERAPH_ADJUDICANT, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-dwarf-f211',
      name: 'Floor 211',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [STORMCALLER, ASHPIT_SCUTTLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f212',
      name: 'Floor 212',
      enemies: {
        front: [THE_BREACHLORD, STORMCALLER],
        back: [SKYSHRIKE, PYRE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f213',
      name: 'Floor 213',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [SERAPH_ADJUDICANT, CINDER_CULLER, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-dwarf-f214',
      name: 'Floor 214',
      enemies: {
        front: [WARDEN, KINGSWAY_LANCER],
        back: [DUSKFERN_SKIRMISHER, ASHPIT_SCUTTLER, VAULTBOUND_GAOLER],
      },
    },
    {
      id: 't-dwarf-f215',
      name: 'Floor 215',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [LITANY_BEARER, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f216',
      name: 'Floor 216',
      enemies: {
        front: [OATHBREAKER, UNDERVAULT_SAPPER],
        back: [CINDERLING, SKYSHRIKE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f217',
      name: 'Floor 217',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [ZENITH_CHORISTER, CARRION_SWARM, STORMCALLER],
      },
    },
    {
      id: 't-dwarf-f218',
      name: 'Floor 218',
      enemies: {
        front: [OATHBREAKER, STORMCALLER],
        back: [PYRE, BRAMBLEWALK_SCOUT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f219',
      name: 'Floor 219',
      enemies: {
        front: [WARDEN, CROWNWORKS_STRIKER],
        back: [RENDFANG_JACKAL, VANWARD_SPEAR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f220',
      name: 'Floor 220 — The Stair Above the Breach',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [KINGSWAY_LANCER, KILNSWORN_ADEPT, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Bellowsyard — Floors 221–245, levels 105–116 — the host has the bellows going, and the hold's own halls give it room to work. Two bodies a board that swing, and the soft slots start to go.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f221',
      name: 'Floor 221',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [KILNSWORN_ADEPT, ROADWATCH_BOWMAN, PYRE],
      },
    },
    {
      id: 't-dwarf-f222',
      name: 'Floor 222',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [MARROWHUNT_ALPHA, VANWARD_SPEAR, SKYSHRIKE],
      },
    },
    {
      id: 't-dwarf-f223',
      name: 'Floor 223',
      enemies: {
        front: [THE_BREACHLORD, KINGSWAY_LANCER],
        back: [RIFTBORN_HARROWER, SIGNAL_RUNNER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f224',
      name: 'Floor 224',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [ORDER_SERJEANT, SERAPH_ADJUDICANT, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f225',
      name: 'Floor 225',
      enemies: {
        front: [OATHBREAKER, REDWATER_STALKER],
        back: [KILNSWORN_ADEPT, RAVAGER, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f226',
      name: 'Floor 226',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [EMBERSEED_WARLOCK, VANWARD_SPEAR, KNELL_CHANTER],
      },
    },
    {
      id: 't-dwarf-f227',
      name: 'Floor 227',
      enemies: {
        front: [STANDFAST_LANCER, RESERVE_ENSIGN],
        back: [STORMCALLER, RENDFANG_JACKAL, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f228',
      name: 'Floor 228',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [WEALDSHADOW_STALKER, SIGNAL_RUNNER, GOREHIDE_MATRIARCH],
      },
    },
    {
      id: 't-dwarf-f229',
      name: 'Floor 229',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [ROADWATCH_BOWMAN, RIFTSTEP_REAVER, RESERVE_ENSIGN],
      },
    },
    {
      id: 't-dwarf-f230',
      name: 'Floor 230 — The Bellowsyard',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [STANDFAST_LANCER, KILNSWORN_ADEPT, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f231',
      name: 'Floor 231',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [VANWARD_SPEAR, ANTIPHON_ARCHON, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-dwarf-f232',
      name: 'Floor 232',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, REDWATER_STALKER],
        back: [MIREWHELP, KILNSWORN_ADEPT, REDWATER_STALKER],
      },
    },
    {
      id: 't-dwarf-f233',
      name: 'Floor 233',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [ROADWATCH_BOWMAN, HEXBOUND_TORMENTOR, ORDER_SERJEANT],
      },
    },
    {
      id: 't-dwarf-f234',
      name: 'Floor 234',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, RESERVE_ENSIGN],
        back: [SKYSHRIKE, KILNSWORN_ADEPT, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f235',
      name: 'Floor 235',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [PYRE, MARROWHUNT_ALPHA, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f236',
      name: 'Floor 236',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [SKYSHRIKE, RIFTBORN_HARROWER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f237',
      name: 'Floor 237',
      enemies: {
        front: [OATHBREAKER, KINGSWAY_LANCER],
        back: [ASHPIT_SCUTTLER, ORDER_SERJEANT, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-dwarf-f238',
      name: 'Floor 238',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [ROADWATCH_BOWMAN, KILNSWORN_ADEPT, RAVAGER],
      },
    },
    {
      id: 't-dwarf-f239',
      name: 'Floor 239',
      enemies: {
        front: [STANDFAST_LANCER, REDWATER_STALKER],
        back: [MUSTER_PIKE, EMBERSEED_WARLOCK, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f240',
      name: 'Floor 240 — The Bellowsyard',
      enemies: {
        front: [THE_BREACHLORD, CROWNWORKS_STRIKER],
        back: [COUNTERSIGN_CAPTAIN, MARROWHUNT_ALPHA, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f241',
      name: 'Floor 241',
      enemies: {
        front: [THE_BREACHLORD, RESERVE_ENSIGN],
        back: [KILNSWORN_ADEPT, WEALDSHADOW_STALKER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f242',
      name: 'Floor 242',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [GOREHIDE_MATRIARCH, ROADWATCH_BOWMAN, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-dwarf-f243',
      name: 'Floor 243',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [RESERVE_ENSIGN, CINDER_CULLER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f244',
      name: 'Floor 244',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, KINGSWAY_LANCER],
        back: [MARROWHUNT_ALPHA, VANWARD_SPEAR, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-dwarf-f245',
      name: 'Floor 245',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [UNDERVAULT_SAPPER, MIREWHELP, KILNSWORN_ADEPT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Quenchyard — Floors 246–270, levels 116–128 — a thing in the quench-pits has decided the door is its, and while it stands there it is the only body the party is allowed to answer.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f246',
      name: 'Floor 246',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [STANDFAST_LANCER, KILNSWORN_ADEPT, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f247',
      name: 'Floor 247',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, MARROWHUNT_ALPHA, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f248',
      name: 'Floor 248',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, REDWATER_STALKER],
        back: [COUNTERSIGN_CAPTAIN, RIFTBORN_HARROWER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f249',
      name: 'Floor 249',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, EMBERSEED_WARLOCK, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f250',
      name: 'Floor 250 — The Quenchyard',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [STANDFAST_LANCER, COUNTERSIGN_CAPTAIN, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f251',
      name: 'Floor 251',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-dwarf-f252',
      name: 'Floor 252',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, STANDFAST_LANCER],
        back: [ORDER_SERJEANT, GOREHIDE_MATRIARCH, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f253',
      name: 'Floor 253',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, KNELL_CHANTER],
      },
    },
    {
      id: 't-dwarf-f254',
      name: 'Floor 254',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [ROADWATCH_BOWMAN, COUNTERSIGN_CAPTAIN, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f255',
      name: 'Floor 255',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [RIFTSTEP_REAVER, SIGNAL_RUNNER, CROWNWORKS_STRIKER],
      },
    },
    {
      id: 't-dwarf-f256',
      name: 'Floor 256',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, REDWATER_STALKER],
        back: [MARROWHUNT_ALPHA, STANDFAST_LANCER, LONGBOUGH_MARKSMAN],
      },
    },
    {
      id: 't-dwarf-f257',
      name: 'Floor 257',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [VANWARD_SPEAR, CROWNWORKS_STRIKER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-dwarf-f258',
      name: 'Floor 258',
      enemies: {
        front: [OATHBREAKER, QUENCHPIT_IRONHIDE],
        back: [ROADWATCH_BOWMAN, KILNSWORN_ADEPT, RESERVE_ENSIGN],
      },
    },
    {
      id: 't-dwarf-f259',
      name: 'Floor 259',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [RAVAGER, STANDFAST_LANCER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f260',
      name: 'Floor 260 — The Quenchyard',
      enemies: {
        front: [OATHBREAKER, QUENCHPIT_IRONHIDE],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f261',
      name: 'Floor 261',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [VANWARD_SPEAR, COUNTERSIGN_CAPTAIN, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-dwarf-f262',
      name: 'Floor 262',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [SIGNAL_RUNNER, CROWNWORKS_STRIKER, EMBERSEED_WARLOCK],
      },
    },
    {
      id: 't-dwarf-f263',
      name: 'Floor 263',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [ROADWATCH_BOWMAN, STANDFAST_LANCER, RAVAGER],
      },
    },
    {
      id: 't-dwarf-f264',
      name: 'Floor 264',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, REDWATER_STALKER],
        back: [MUSTER_PIKE, CROWNWORKS_STRIKER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f265',
      name: 'Floor 265',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [WEALDSHADOW_STALKER, ORDER_SERJEANT, GOREHIDE_MATRIARCH],
      },
    },
    {
      id: 't-dwarf-f266',
      name: 'Floor 266',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, QUENCHPIT_IRONHIDE],
        back: [VANWARD_SPEAR, CROWNWORKS_STRIKER, REDWATER_STALKER],
      },
    },
    {
      id: 't-dwarf-f267',
      name: 'Floor 267',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [KNELL_CHANTER, ROADWATCH_BOWMAN, COUNTERSIGN_CAPTAIN],
      },
    },
    {
      id: 't-dwarf-f268',
      name: 'Floor 268',
      enemies: {
        front: [STANDFAST_LANCER, STANDFAST_LANCER],
        back: [KILNSWORN_ADEPT, RIFTSTEP_REAVER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f269',
      name: 'Floor 269',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, MARROWHUNT_ALPHA, STANDFAST_LANCER],
      },
    },
    {
      id: 't-dwarf-f270',
      name: 'Floor 270 — The Quenchyard',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, COUNTERSIGN_CAPTAIN, KILNSWORN_ADEPT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Trip-Hammer Floor — Floors 271–290, levels 128–137 — three hammers behind the wall, and the anchors thin out to make room for them — because at this height an anchor grows faster than the crew does.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f271',
      name: 'Floor 271',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f272',
      name: 'Floor 272',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f273',
      name: 'Floor 273',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f274',
      name: 'Floor 274',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, REDWATER_STALKER],
        back: [CROWNWORKS_STRIKER, COUNTERSIGN_CAPTAIN, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f275',
      name: 'Floor 275',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, MARROWHUNT_ALPHA, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f276',
      name: 'Floor 276',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, RIFTBORN_HARROWER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f277',
      name: 'Floor 277',
      enemies: {
        front: [STANDFAST_LANCER, MARROWHUNT_ALPHA],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, EMBERSEED_WARLOCK],
      },
    },
    {
      id: 't-dwarf-f278',
      name: 'Floor 278',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f279',
      name: 'Floor 279',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, RAVAGER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f280',
      name: 'Floor 280 — The Trip-Hammer Floor',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, COUNTERSIGN_CAPTAIN],
      },
    },
    {
      id: 't-dwarf-f281',
      name: 'Floor 281',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, REDWATER_STALKER],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f282',
      name: 'Floor 282',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, GOREHIDE_MATRIARCH, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f283',
      name: 'Floor 283',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-dwarf-f284',
      name: 'Floor 284',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, MARROWHUNT_ALPHA],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f285',
      name: 'Floor 285',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, ORDER_SERJEANT],
      },
    },
    {
      id: 't-dwarf-f286',
      name: 'Floor 286',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f287',
      name: 'Floor 287',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, KILNSWORN_ADEPT, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f288',
      name: 'Floor 288',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, REDWATER_STALKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f289',
      name: 'Floor 289',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, COUNTERSIGN_CAPTAIN, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f290',
      name: 'Floor 290 — The Trip-Hammer Floor',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, MARROWHUNT_ALPHA],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Crown Wheel — Floors 291–300, levels 138–142 — no passengers left. Every slot on the board is a body that swings, and the thing the hold built to keep them swinging is at the top of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f291',
      name: 'Floor 291',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, COUNTERSIGN_CAPTAIN, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f292',
      name: 'Floor 292',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f293',
      name: 'Floor 293',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f294',
      name: 'Floor 294',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, MARROWHUNT_ALPHA, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f295',
      name: 'Floor 295',
      enemies: {
        front: [STANDFAST_LANCER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-dwarf-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_CROWN_WHEEL, CROWNWORKS_STRIKER],
        back: [STANDFAST_LANCER, ROADWATCH_BOWMAN, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f297',
      name: 'Floor 297',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, COUNTERSIGN_CAPTAIN, EMBERSEED_WARLOCK],
      },
    },
    {
      id: 't-dwarf-f298',
      name: 'Floor 298',
      enemies: {
        front: [COUNTERSIGN_CAPTAIN, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-dwarf-f299',
      name: 'Floor 299',
      enemies: {
        front: [OATHBREAKER, CROWNWORKS_STRIKER],
        back: [CROWNWORKS_STRIKER, STANDFAST_LANCER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f300',
      name: 'Floor 300 — The Crown Wheel',
      enemies: {
        front: [THE_CROWN_WHEEL, CROWNWORKS_STRIKER],
        back: [STORMCALLER, KILNSWORN_ADEPT, ROADWATCH_BOWMAN],
      },
    },
  ],
} as const;
