import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  ASHPIT_SCUTTLER,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BLOODGORGE_HOUND,
  BLOODPACT_FIEND,
  BOAR,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDERLING,
  CINDERPLATE_HOUNDSMAN,
  CINDERQUENCH_BEARER,
  CLOSEWARD_SERAPH,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  CORTEGE_LANCER,
  CROWNBARK_BASTION,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  DUSKFERN_SKIRMISHER,
  EDGETURN_WARDEN,
  EMBERSEED_WARLOCK,
  EMBERSHELL_WHELP,
  FENLORD,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  GRUDGEPLATE_SMITH,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  IRONSLING_WRIGHT,
  IRONWAKE_VANGUARD,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LITANY_BEARER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  MOONSONG_WEAVER,
  MUSTER_PIKE,
  NIGHTCANOPY_SINGER,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  PALE_WARDEN,
  PLUMBLINE_HAND,
  PYRE,
  QUENCHPIT_IRONHIDE,
  QUENCHWRIGHT,
  QUICKLIME_SERJEANT,
  RADIANT_HERALD,
  RAVAGER,
  REDWATER_STALKER,
  RELIQUARY_BEARER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTBORN_HARROWER,
  RIMEPLATE,
  ROADWATCH_BOWMAN,
  RUINWING_DEVOURER,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SIGNAL_RUNNER,
  SKYSHRIKE,
  SLAGBOUND_DRUDGE,
  SLAGHIDE_PURSUER,
  SLIME,
  STILLNESS_CANTOR,
  STORMCALLER,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  THE_BREACHLORD,
  THE_CROWN_WHEEL,
  THE_EDGEWRIGHT,
  THE_GRAVEWRIGHT,
  THE_HORNCALLER,
  THE_REDMAW,
  THE_SEEDFATHER,
  THE_UNBITTEN,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  TYRANT,
  UNDERVAULT_SAPPER,
  UNSEALED_WRETCH,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
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
 * The Monster Tower — three hundred floors, enemy levels 1 to 142.
 *
 * ## The one tower with no counter-faction lean, and why that *is* its lean
 *
 * Every other tower leans toward the faction that counters the one it admits. Monsters have no
 * such faction, because they have **all of them**: the matrix has the four mortal factions taking
 * five percent back from Monsters, both celestials taking ten, and Monsters hitting each other for
 * ten as well. Countering a Monster five is not a job for one faction, it is what everybody does.
 *
 * So this tower is authored as an **even spread across all seven** rather than a lean, and that is
 * the same decision every other tower makes rather than an exception to it: field what counters the
 * crew. `towers.spec.ts` knows the difference — it reads the counter set off the matrix, sees that
 * every faction is in it, and asserts the spread is genuinely flat instead of asserting a leader.
 *
 * ⚠️ **The mirror control in `towers.balance.ts` does not apply here either.** Rewriting every
 * enemy to `monster` is supposed to switch the matrix off; monster-on-monster is the matrix's one
 * self-edge, so a mirrored Monster Tower is a *harder* board rather than a neutral one. See the
 * grouping in that file.
 *
 * ## What a Monster five is, and what this tower charges it for
 *
 * Monsters trade defence for reach — the deepest raw `atk` in the game on bodies with no healer,
 * carrying leech and a siphon instead. This tower charges that in the two currencies leech cannot
 * pay: **damage it cannot return** (a Cinder Storm, a Pillar of Light, a Sevenfold Hex) and
 * **turns**, because a Monster with no turn heals for nothing.
 *
 * ⚠️ **Milestone 21i sharpened that into a stronger claim, which is what the second hundred is
 * built on: Monsters are the only faction in the game with no heal, no regeneration and no
 * shield.** Every other faction has at least two of the three. Here it is `drain` and `lifeLeech`
 * and nothing else, so every point of health this crew gets back has to be taken off a body it is
 * currently hitting — and it carries no `tenacity`, no `accuracy` and no `dodge` on any of its eight
 * characters either.
 *
 * ## ⚠️ The second hundred escalates through *how many questions a board asks*, which is new
 *
 * The other four extended towers each found a different answer — the Human Tower thickened its
 * support, the Dwarf Tower its front rank, the Elf Tower hid a burster behind a wall, and the Undead
 * Tower's was a stat block. This one is none of those, and it was measured before anything was
 * authored. Controlled at one anchor, one legendary and three commons at the roof's level, mean
 * survivors of five:
 *
 * ```
 *   nothing            ref 4.35 / alt 4.00
 *   one lock, ×4       ref 4.13 / alt 3.92
 *   two questions      ref 4.05 / alt 3.90
 *   three questions    ref 4.00 / alt 2.70
 *   five questions     ref 3.58 / alt 0.85
 * ```
 *
 * Repeating one lock is worth almost nothing and the count is worth everything, which is a fact
 * about this crew rather than about board design in general: a Monster five answers any single
 * question by out-damaging it and has no second answer to spend when a board asks two more. So the
 * bands escalate two → three → four → five, and it lands on the tower that already had the reason to
 * do it — every faction counters Monsters, so this is the one ladder in the game whose boards may
 * draw evenly from all seven without turning its own lean off.
 *
 * ⚠️ **No board above floor 100 carries a `link`, and that is measured rather than stylistic.** On a
 * five-question board `rootbound` took the alternate five from 2.42 survivors to **3.33** and a cast
 * `chainbond` to **3.85**. A link is a defence against *focus fire*, and this is the one crew that
 * does not focus: four of its eight bodies open with a row attack and three of its four drains name
 * `enemy-lowest`, so spreading a share of every blow is a board volunteering to die evenly.
 *
 * ⚠️ **This crew's weight ceiling is the lowest of the seven.** At the roof's level one anchor over
 * four *legendaries* measures 95% / 3% and any two anchors is 8% / 0%. So a board above floor 160
 * gets one anchor and four soft bodies, never two anchors, and the only way to make it ask more is to
 * make the soft ones sharper. **The third hundred is that rule taken to its end**: its boards are
 * lighter in raw stats than the second hundred's and the difficulty is carried by a stat on the soft
 * slots.
 *
 * ⚠️ **What is forbidden above floor 160 is a heal effect and a regeneration status, and that is a
 * correction.** This block used to say "sustain … forbidden above floor 160", and walking the floors
 * rather than reading them says otherwise. Over the second hundred's own floors 161–200: no board
 * carries a `heal` or a `regen`, but **fourteen** carry a `drain`, ten carry `lifeLeech`, eleven
 * carry `healthRegen` and **twenty-nine** carry `recovery` — including floor 200, where
 * {@link THE_HORNCALLER} restores 6 at the top of every one of its turns. Over 161–300 the same
 * counts read 21, 23, 26 and 72. The honest fix was the claim rather than the boards, exactly as the
 * Crownworks found for `tower-dwarf.ts`: restating it keeps every measured figure on those floors
 * valid where retuning twenty-nine shipped boards would invalidate all of them. A **shield** stays
 * allowed for the reason it always was — a pool banked once depletes where a heal refills.
 *
 * ⚠️ **Read those counts as a range rather than as a threshold.** "Above floor 160" grew by a hundred
 * floors when this hundred landed, so a figure measured against the second hundred silently stops
 * describing the claim it is attached to. Both ranges are stated for that reason.
 *
 * ⚠️ **The closing band is stricter than the tower, deliberately.** Floors 291–300 carry no `drain`,
 * no `lifeLeech`, no `recovery`, no `healthRegen` and no ward of any kind, because a roof is where
 * sustain stops being a lock and becomes the ninety-second clock. {@link THE_UNBITTEN} restores
 * nothing, which is the first roof this tower has had that does not.
 *
 * ## ⚠️ The third hundred escalates through armour this crew's penetration does not cut
 *
 * The second hundred's axis is spent: five questions is the size of a board. What replaced it was
 * measured before anything was authored, against a **4.00 / 3.35** control at the roof's level — one
 * anchor plus four identical bodies, forty seeds — and three of the four candidates came back dead:
 *
 * ```
 *   tenacity 0.40 / 0.60 / 0.85   ref 4.00 / 4.00 / 4.00   alt 3.48 / 3.52 / 3.50
 *   aim enemy-back                ref 4.08                 alt 4.00
 *   aim enemy-row-back            ref 4.42                 alt 4.00
 *   aim enemy-highest             ref 4.25                 alt 4.00
 *   physicalResist 0.23 → 0.70    ref 4.00 → 2.02          alt 3.00 → 0.00
 * ```
 *
 * A `tenacity` wall is worth **nothing at any value** — this crew's kits are almost pure damage, so
 * there is nothing to refuse — and every aim that reaches past the front rank leaves a board *easier*
 * than saying nothing, which is now the fourth tower to find it. What grades is `physicalResist`, and
 * the control that makes it a mechanism rather than a wall is that the identical block spelled
 * `magicResist` 0.55 reads **4.00 / 3.42**: the control exactly, worth nothing at all. Every damage
 * effect in both swept arrangements is `physical` — eleven of eleven and twelve of twelve.
 *
 * ⚠️ **It is this crew's rather than merely unanswerable, and the reason is a stat it *does* carry.**
 * Monsters own the game's only real armour-cutting: mean `physicalPierce` **0.145** against 0.040 or
 * less for every other faction. In [`damage.ts`](../core/battle/damage.ts) pierce multiplies **`def`**
 * and `resistedShare` is applied afterwards with no pierce term in it, so the one defence this crew is
 * built to open is the one this hundred does not use. See the head of the Closing section in
 * [`enemies.ts`](./enemies.ts) for the seven-crew control, which reads −1.30 for this tower's weaker
 * arrangement and **0.00** for the Elves — the *other* 100%-physical roster.
 *
 * ⚠️ **The alternate five is what every board here is sized against, and that is new for this
 * tower.** In the second hundred the reference five is much the stronger, and at the third hundred's
 * roof level that gap becomes the whole constraint: the shipped floor-200 board fielded at level 142
 * reads 100% / 3.45 for the reference and **8% with 0.07 survivors** for the alternate.
 *
 * ⚠️ **No anchor had to be retired, unlike the Elf and Undead third hundreds.** All twelve `ascended`
 * blocks the *second hundred* fields above floor 160 read 100% for both crews at level 142 behind
 * light support — {@link THE_HORNCALLER} at 1560/91 is 100% / 4.00 and 100% / 3.15. What broke floor
 * 200 up there is its *support* rather than its anchor, so the escalation comes out of the four soft
 * slots, which is what this tower's own second hundred already said it must. The four heaviest do
 * still stand down before the roof — the Gravewright's last floor is 276, the Horncaller's 279, the
 * Tyrant's 280 and the Redmaw's 282 — but that is rhythm for the closing band rather than the
 * arithmetic that forced the Grudgekeeper and the Withered Crown off their own towers.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 */
export const TOWER_MONSTER = {
  id: 'tower-monster',
  name: 'Monster Tower',
  faction: 'monster',
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
    // The Open Field — Floors 1–12, levels 1–6 — one of everything, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f1',
      name: 'Floor 1',
      enemies: { front: [BLOODPACT_FIEND], back: [BANDIT] },
    },
    {
      id: 't-monster-f2',
      name: 'Floor 2',
      enemies: { front: [FREE_BLADE], back: [WISP, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f3',
      name: 'Floor 3',
      enemies: { front: [REVENANT], back: [SLIME, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f4',
      name: 'Floor 4',
      enemies: { front: [SLIME, FREE_BLADE], back: [DEEPROCK_MINER, WISP] },
    },
    {
      id: 't-monster-f5',
      name: 'Floor 5',
      enemies: { front: [SLIME], back: [LUMEN_ACOLYTE, CINDERLING] },
    },
    {
      id: 't-monster-f6',
      name: 'Floor 6',
      enemies: { front: [FORGE_THRALL, REVENANT], back: [BOAR, SLIME] },
    },
    {
      id: 't-monster-f7',
      name: 'Floor 7',
      enemies: { front: [BLOODPACT_FIEND], back: [WISP, LUMEN_ACOLYTE, CINDERLING] },
    },
    {
      id: 't-monster-f8',
      name: 'Floor 8',
      enemies: { front: [FORGE_THRALL, BOAR], back: [WISP, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f9',
      name: 'Floor 9',
      enemies: { front: [BLOODPACT_FIEND], back: [GLADE_STALKER] },
    },
    {
      id: 't-monster-f10',
      name: 'Floor 10 — The Open Field',
      enemies: { front: [GILDED_SENTRY, REVENANT], back: [WISP, CINDERLING, BANDIT] },
    },
    {
      id: 't-monster-f11',
      name: 'Floor 11',
      enemies: { front: [GILDED_SENTRY], back: [CINDERLING, GLADE_STALKER] },
    },
    {
      id: 't-monster-f12',
      name: 'Floor 12',
      enemies: { front: [SLIME, THORNLING], back: [CINDERLING, LUMEN_ACOLYTE] },
    },

    // -------------------------------------------------------------------------------------
    // The Seven Banners — Floors 13–28, levels 7–14 — the locks arrive, one faction at a time, and never twice in a row.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f13',
      name: 'Floor 13',
      enemies: { front: [GOLEM, FREE_BLADE], back: [SLIME, SHADE] },
    },
    {
      id: 't-monster-f14',
      name: 'Floor 14',
      enemies: { front: [BLOODPACT_FIEND, FREE_BLADE], back: [SHADE, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f15',
      name: 'Floor 15',
      enemies: { front: [GILDED_SENTRY, THORNWEALD_WARDEN], back: [SHADE, HAG, ACOLYTE] },
    },
    {
      id: 't-monster-f16',
      name: 'Floor 16',
      enemies: { front: [GILDED_SENTRY, REVENANT], back: [DEEPROCK_MINER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f17',
      name: 'Floor 17',
      enemies: { front: [FREE_BLADE, REVENANT], back: [SHADE, SKYSHRIKE, PYRE] },
    },
    {
      id: 't-monster-f18',
      name: 'Floor 18',
      enemies: { front: [FREE_BLADE, BOAR], back: [PYRE, SHADE] },
    },
    {
      id: 't-monster-f19',
      name: 'Floor 19',
      enemies: { front: [BOAR, BLOODPACT_FIEND], back: [LUMEN_ACOLYTE, SKYSHRIKE, HAG] },
    },
    {
      id: 't-monster-f20',
      name: 'Floor 20 — The Seven Banners',
      enemies: { front: [BULWARK_ENEMY, THORNWEALD_WARDEN], back: [ACOLYTE, HAG, SHADE] },
    },
    {
      id: 't-monster-f21',
      name: 'Floor 21',
      enemies: { front: [BOAR, BULWARK_ENEMY], back: [SKYSHRIKE, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f22',
      name: 'Floor 22',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [ACOLYTE, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f23',
      name: 'Floor 23',
      enemies: { front: [REVENANT, GOLEM], back: [SHADE, SLIME] },
    },
    {
      id: 't-monster-f24',
      name: 'Floor 24',
      enemies: { front: [BOAR, REVENANT], back: [HAG, PYRE, LUMEN_ACOLYTE] },
    },
    {
      id: 't-monster-f25',
      name: 'Floor 25',
      enemies: { front: [GOLEM, GILDED_SENTRY], back: [SHADE, ACOLYTE, SKYSHRIKE] },
    },
    {
      id: 't-monster-f26',
      name: 'Floor 26',
      enemies: { front: [FREE_BLADE, GOLEM], back: [HAG, DEEPROCK_MINER] },
    },
    {
      id: 't-monster-f27',
      name: 'Floor 27',
      enemies: { front: [BULWARK_ENEMY, FREE_BLADE], back: [PYRE, SKYSHRIKE, ACOLYTE] },
    },
    {
      id: 't-monster-f28',
      name: 'Floor 28',
      enemies: { front: [BLOODPACT_FIEND, GILDED_SENTRY], back: [SLIME, SKYSHRIKE] },
    },

    // -------------------------------------------------------------------------------------
    // The Hunters Above — Floors 29–48, levels 14–23 — the sharp questions, and every faction asking a different one.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f29',
      name: 'Floor 29',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SHADE, HEXBOUND_TORMENTOR, GOLEM] },
    },
    {
      id: 't-monster-f30',
      name: 'Floor 30 — The Hunters Above',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [STORMCALLER, MOONSONG_WEAVER, GOLEM] },
    },
    {
      id: 't-monster-f31',
      name: 'Floor 31',
      enemies: { front: [RUNEWARDEN, SENTINEL], back: [HEXBOUND_TORMENTOR, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f32',
      name: 'Floor 32',
      enemies: { front: [ASHEN_CHOIR, WRATHBORN], back: [SHADE, STORMCALLER, ACOLYTE] },
    },
    {
      id: 't-monster-f33',
      name: 'Floor 33',
      enemies: { front: [WRATHBORN, GOLEM], back: [HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f34',
      name: 'Floor 34',
      enemies: { front: [GOLEM, RIMEPLATE], back: [SHADE, STORMCALLER, HEXBOUND_TORMENTOR] },
    },
    {
      id: 't-monster-f35',
      name: 'Floor 35',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [ACOLYTE, HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f36',
      name: 'Floor 36',
      enemies: { front: [SENTINEL, GOLEM], back: [SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-monster-f37',
      name: 'Floor 37',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [SERAPH_ADJUDICANT, GOLEM, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f38',
      name: 'Floor 38',
      enemies: { front: [WRATHBORN, SENTINEL], back: [GOLEM, SKYSHRIKE] },
    },
    {
      id: 't-monster-f39',
      name: 'Floor 39',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [SHADE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f40',
      name: 'Floor 40 — The Hunters Above',
      enemies: { front: [RIMEPLATE, RUNEWARDEN], back: [STORMCALLER, MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f41',
      name: 'Floor 41',
      enemies: { front: [SENTINEL, ASHEN_CHOIR], back: [SHADE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f42',
      name: 'Floor 42',
      enemies: { front: [SENTINEL, GOLEM], back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-monster-f43',
      name: 'Floor 43',
      enemies: { front: [RUNEWARDEN, WRATHBORN], back: [STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-monster-f44',
      name: 'Floor 44',
      enemies: {
        front: [SENTINEL, GOLEM],
        back: [MOONSONG_WEAVER, STORMCALLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f45',
      name: 'Floor 45',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [SKYSHRIKE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, GOLEM], back: [HEXBOUND_TORMENTOR, SHADE] },
    },
    {
      id: 't-monster-f47',
      name: 'Floor 47',
      enemies: {
        front: [GOLEM, WRATHBORN],
        back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f48',
      name: 'Floor 48',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [HEXBOUND_TORMENTOR, GOLEM] },
    },

    // -------------------------------------------------------------------------------------
    // The Ring of Spears — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f49',
      name: 'Floor 49',
      enemies: {
        front: [HEADSMAN, SENTINEL],
        back: [HEXBOUND_TORMENTOR, RADIANT_HERALD, STORMCALLER],
      },
    },
    {
      id: 't-monster-f50',
      name: 'Floor 50 — The Ring of Spears',
      enemies: { front: [SENTINEL, HEADSMAN], back: [STORMCALLER, HIEROPHANT, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f51',
      name: 'Floor 51',
      enemies: {
        front: [RUNEWARDEN, THORNWEALD_WARDEN],
        back: [HEXBOUND_TORMENTOR, STORMCALLER, RAVAGER],
      },
    },
    {
      id: 't-monster-f52',
      name: 'Floor 52',
      enemies: {
        front: [THORNWEALD_WARDEN, WRATHBORN],
        back: [SERAPH_ADJUDICANT, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-monster-f53',
      name: 'Floor 53',
      enemies: {
        front: [HEADSMAN, RIMEPLATE],
        back: [HIEROPHANT, RADIANT_HERALD, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f54',
      name: 'Floor 54',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f55',
      name: 'Floor 55',
      enemies: {
        front: [ASHEN_CHOIR, RAVAGER],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },
    {
      id: 't-monster-f56',
      name: 'Floor 56',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },
    {
      id: 't-monster-f57',
      name: 'Floor 57',
      enemies: { front: [ASHEN_CHOIR, RIMEPLATE], back: [RADIANT_HERALD, HIEROPHANT, STORMCALLER] },
    },
    {
      id: 't-monster-f58',
      name: 'Floor 58',
      enemies: { front: [THORNWEALD_WARDEN, WRATHBORN], back: [RAVAGER, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f59',
      name: 'Floor 59',
      enemies: {
        front: [HEADSMAN, RUNEWARDEN],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, RAVAGER],
      },
    },
    {
      id: 't-monster-f60',
      name: 'Floor 60 — The Ring of Spears',
      enemies: { front: [SENTINEL, HEADSMAN], back: [STORMCALLER, HIEROPHANT, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f61',
      name: 'Floor 61',
      enemies: {
        front: [RIMEPLATE, RAVAGER],
        back: [STORMCALLER, MOONSONG_WEAVER, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f62',
      name: 'Floor 62',
      enemies: { front: [SENTINEL, RUNEWARDEN], back: [HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-monster-f63',
      name: 'Floor 63',
      enemies: {
        front: [ASHEN_CHOIR, HEADSMAN],
        back: [STORMCALLER, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f64',
      name: 'Floor 64',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [HEADSMAN, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f65',
      name: 'Floor 65',
      enemies: { front: [RAVAGER, WRATHBORN], back: [HEADSMAN, RADIANT_HERALD, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f66',
      name: 'Floor 66',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f67',
      name: 'Floor 67',
      enemies: {
        front: [RUNEWARDEN, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f68',
      name: 'Floor 68',
      enemies: {
        front: [RUNEWARDEN, HEADSMAN],
        back: [HIEROPHANT, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Circling Gate — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, and never the same one twice running.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f69',
      name: 'Floor 69',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [HEADSMAN, SERAPH_ADJUDICANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f70',
      name: 'Floor 70 — The Circling Gate',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [STORMCALLER, HIEROPHANT, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f71',
      name: 'Floor 71',
      enemies: {
        front: [OATHBREAKER, TYRANT],
        back: [RIMEPLATE, HEXBOUND_TORMENTOR, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f72',
      name: 'Floor 72',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [HEXBOUND_TORMENTOR, MOONSONG_WEAVER, RIMEPLATE],
      },
    },
    {
      id: 't-monster-f73',
      name: 'Floor 73',
      enemies: {
        front: [WYRDROOT_ANCIENT, TYRANT],
        back: [RIMEPLATE, HEXBOUND_TORMENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f74',
      name: 'Floor 74',
      enemies: { front: [HIEROPHANT, COLOSSUS], back: [MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-monster-f75',
      name: 'Floor 75',
      enemies: {
        front: [BARROW_SOVEREIGN, HIEROPHANT],
        back: [STORMCALLER, RIMEPLATE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f76',
      name: 'Floor 76',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [HEXBOUND_TORMENTOR, HEADSMAN, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f77',
      name: 'Floor 77',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [ACOLYTE, STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f78',
      name: 'Floor 78',
      enemies: { front: [WARDEN, WYRDROOT_ANCIENT], back: [RIMEPLATE, HEADSMAN] },
    },
    {
      id: 't-monster-f79',
      name: 'Floor 79',
      enemies: {
        front: [BARROW_SOVEREIGN, COLOSSUS],
        back: [RADIANT_HERALD, SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f80',
      name: 'Floor 80 — The Circling Gate',
      enemies: {
        front: [COLOSSUS, BARROW_SOVEREIGN],
        back: [STORMCALLER, HIEROPHANT, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f81',
      name: 'Floor 81',
      enemies: { front: [TYRANT, HIEROPHANT], back: [STORMCALLER, HEADSMAN, RADIANT_HERALD] },
    },
    {
      id: 't-monster-f82',
      name: 'Floor 82',
      enemies: { front: [WARDEN, COLOSSUS], back: [HEXBOUND_TORMENTOR, HEADSMAN] },
    },
    {
      id: 't-monster-f83',
      name: 'Floor 83',
      enemies: {
        front: [WARDEN, HIEROPHANT],
        back: [STORMCALLER, RADIANT_HERALD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f84',
      name: 'Floor 84',
      enemies: {
        front: [BARROW_SOVEREIGN, WYRDROOT_ANCIENT],
        back: [RADIANT_HERALD, MOONSONG_WEAVER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Last Banner — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, drawn from every faction that hunts Monsters, which is all of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f85',
      name: 'Floor 85',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-monster-f86',
      name: 'Floor 86',
      enemies: {
        front: [WARDEN, HIEROPHANT],
        back: [MOONSONG_WEAVER, SERAPH_ADJUDICANT, RIMEPLATE],
      },
    },
    {
      id: 't-monster-f87',
      name: 'Floor 87',
      enemies: {
        front: [OATHBREAKER, RUNEWARDEN],
        back: [HEXBOUND_TORMENTOR, HEADSMAN, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f88',
      name: 'Floor 88',
      enemies: {
        front: [OATHBREAKER, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-monster-f89',
      name: 'Floor 89',
      enemies: {
        front: [ASHEN_CHOIR, OATHBREAKER],
        back: [STORMCALLER, RIMEPLATE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f90',
      name: 'Floor 90 — The Last Banner',
      enemies: {
        front: [OATHBREAKER, HIEROPHANT],
        back: [STORMCALLER, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-monster-f91',
      name: 'Floor 91',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, STORMCALLER],
      },
    },
    {
      id: 't-monster-f92',
      name: 'Floor 92',
      enemies: {
        front: [HIEROPHANT, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-monster-f93',
      name: 'Floor 93',
      enemies: {
        front: [RUNEWARDEN, OATHBREAKER],
        back: [RIMEPLATE, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-monster-f94',
      name: 'Floor 94',
      enemies: {
        front: [RUNEWARDEN, WARDEN],
        back: [HEADSMAN, MOONSONG_WEAVER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-monster-f95',
      name: 'Floor 95',
      enemies: {
        front: [OATHBREAKER, WARDEN],
        back: [MOONSONG_WEAVER, HEXBOUND_TORMENTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f96',
      name: 'Floor 96',
      enemies: {
        front: [ASHEN_CHOIR, OATHBREAKER],
        back: [MOONSONG_WEAVER, RADIANT_HERALD, STORMCALLER],
      },
    },
    {
      id: 't-monster-f97',
      name: 'Floor 97',
      enemies: {
        front: [WYRDROOT_ANCIENT, WARDEN],
        back: [HEXBOUND_TORMENTOR, RIMEPLATE, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f98',
      name: 'Floor 98',
      enemies: { front: [ASHEN_CHOIR, RUNEWARDEN], back: [RIMEPLATE, RADIANT_HERALD, STORMCALLER] },
    },
    {
      id: 't-monster-f99',
      name: 'Floor 99',
      enemies: { front: [WARDEN, OATHBREAKER], back: [STORMCALLER, HEADSMAN, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-monster-f100',
      name: 'Floor 100 — The Whole Field',
      enemies: {
        front: [OATHBREAKER, WYRDROOT_ANCIENT],
        back: [HIEROPHANT, HEXBOUND_TORMENTOR, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Long Chase — Floors 101–120, levels 48–57 — past the last banner the field opens, and the hunt stops being a line of bodies and starts being a chase.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f101',
      name: 'Floor 101',
      enemies: { front: [CAIRNWARD_HUSK], back: [ZENITH_CHORISTER, RENDFANG_JACKAL] },
    },
    {
      id: 't-monster-f102',
      name: 'Floor 102',
      enemies: { front: [CINDERLING], back: [BANDIT, FORGE_THRALL] },
    },
    {
      id: 't-monster-f103',
      name: 'Floor 103',
      enemies: {
        front: [GRAVEWAKE_THRALL, HOLLOWBARK_SENTRY],
        back: [LUMEN_ACOLYTE, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f104',
      name: 'Floor 104',
      enemies: {
        front: [SLAGBOUND_DRUDGE],
        back: [CINDERQUENCH_BEARER, BLOODPACT_FIEND, THORNLING],
      },
    },
    {
      id: 't-monster-f105',
      name: 'Floor 105',
      enemies: {
        front: [FORLORN_LEVY, GILDED_SENTRY],
        back: [VAULTBOUND_GAOLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-monster-f106',
      name: 'Floor 106',
      enemies: { front: [BOAR], back: [WHISPERLEAF_ARCHER, UNSEALED_WRETCH, FREE_BLADE] },
    },
    {
      id: 't-monster-f107',
      name: 'Floor 107',
      enemies: {
        front: [MARCHWARD_PIKEMAN, CHARNEL_DRUDGE],
        back: [VAULTLIGHT_CENSER, COLDFORGE_HAND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f108',
      name: 'Floor 108',
      enemies: { front: [GRAVEWAKE_THRALL], back: [BRAMBLEWALK_SCOUT, BOAR, CINDERLING] },
    },
    {
      id: 't-monster-f109',
      name: 'Floor 109',
      enemies: {
        front: [HOLLOWBARK_SENTRY, VAULTBOUND_GAOLER],
        back: [ZENITH_CHORISTER, CINDERLING, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f110',
      name: 'Floor 110 — The Long Chase',
      enemies: {
        front: [GRUDGEPLATE_SMITH],
        back: [SEPULCHRE_HOUND, VAULTBOUND_GAOLER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f111',
      name: 'Floor 111',
      enemies: { front: [GILDED_SENTRY], back: [BLOODPACT_FIEND, THORNLING] },
    },
    {
      id: 't-monster-f112',
      name: 'Floor 112',
      enemies: { front: [REVENANT], back: [LUMEN_ACOLYTE, VAULTBOUND_GAOLER] },
    },
    {
      id: 't-monster-f113',
      name: 'Floor 113',
      enemies: {
        front: [FORGE_THRALL, HOLLOWBARK_SENTRY],
        back: [BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f114',
      name: 'Floor 114',
      enemies: {
        front: [CAIRNWARD_HUSK],
        back: [CINDERQUENCH_BEARER, VAULTLIGHT_CENSER, FORLORN_LEVY],
      },
    },
    {
      id: 't-monster-f115',
      name: 'Floor 115',
      enemies: {
        front: [CARRION_SWARM, HOLLOWBARK_SENTRY],
        back: [GRAVEWAKE_THRALL, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-monster-f116',
      name: 'Floor 116',
      enemies: { front: [BOAR], back: [BANDIT, SUNMOTE_DANCER, CINDERLING] },
    },
    {
      id: 't-monster-f117',
      name: 'Floor 117',
      enemies: {
        front: [GILDED_SENTRY, FREE_BLADE],
        back: [DEEPGALLERY_RUNNER, GRAVEWAKE_THRALL, THORNLING],
      },
    },
    {
      id: 't-monster-f118',
      name: 'Floor 118',
      enemies: { front: [COLDFORGE_HAND], back: [ZENITH_CHORISTER, BOAR, CINDERLING] },
    },
    {
      id: 't-monster-f119',
      name: 'Floor 119',
      enemies: {
        front: [CAIRNWARD_HUSK, VAULTBOUND_GAOLER],
        back: [WHISPERLEAF_ARCHER, RENDFANG_JACKAL, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f120',
      name: 'Floor 120 — The Loosed Pack',
      enemies: { front: [GRUDGEPLATE_SMITH], back: [LUMEN_ACOLYTE, GRAVEWAKE_THRALL, CINDERLING] },
    },

    // -------------------------------------------------------------------------------------
    // The Beaters' Line — Floors 121–140, levels 58–67 — three questions to a board, and the first boards that cannot be answered by picking the one you like first.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f121',
      name: 'Floor 121',
      enemies: {
        front: [SCARBOUND_BELLOWER, FORLORN_LEVY],
        back: [BRAMBLEWALK_SCOUT, GRAVEWAKE_THRALL, CINDERLING],
      },
    },
    {
      id: 't-monster-f122',
      name: 'Floor 122',
      enemies: {
        front: [VAULTBOUND_GAOLER, GILDED_SENTRY],
        back: [RUINWING_DEVOURER, CARRION_SWARM, DEEPROCK_MINER],
      },
    },
    {
      id: 't-monster-f123',
      name: 'Floor 123',
      enemies: {
        front: [CROWNBARK_BASTION, GRAVEWAKE_THRALL],
        back: [VAULTLIGHT_CENSER, CINDERQUENCH_BEARER, FREE_BLADE],
      },
    },
    {
      id: 't-monster-f124',
      name: 'Floor 124',
      enemies: {
        front: [PYRE, HOLLOWBARK_SENTRY],
        back: [ZENITH_CHORISTER, VAULTBOUND_GAOLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f125',
      name: 'Floor 125',
      enemies: {
        front: [CAIRNWARD_HUSK, BOAR],
        back: [SERAPH_ADJUDICANT, FORGE_THRALL, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f126',
      name: 'Floor 126',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CINDERLING],
        back: [BANDIT, MOONSONG_WEAVER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f127',
      name: 'Floor 127',
      enemies: {
        front: [NIGHTCANOPY_SINGER, GILDED_SENTRY],
        back: [BLOODPACT_FIEND, DEEPROCK_MINER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f128',
      name: 'Floor 128',
      enemies: {
        front: [OATHSHIELD_VANGUARD, GRAVEWAKE_THRALL],
        back: [RADIANT_HERALD, RENDFANG_JACKAL, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-monster-f129',
      name: 'Floor 129',
      enemies: {
        front: [HEXBOUND_TORMENTOR, CAIRNWARD_HUSK],
        back: [WHISPERLEAF_ARCHER, VAULTBOUND_GAOLER, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-monster-f130',
      name: "Floor 130 — The Beaters' Line",
      enemies: {
        front: [SEALWARD_CUSTODIAN, CARRION_SWARM],
        back: [ASHEN_CHOIR, PLUMBLINE_HAND, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-monster-f131',
      name: 'Floor 131',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, FORLORN_LEVY],
        back: [BLOODPACT_FIEND, COLDFORGE_HAND, CHARNEL_DRUDGE],
      },
    },
    {
      id: 't-monster-f132',
      name: 'Floor 132',
      enemies: {
        front: [VAULTBOUND_GAOLER, HOLLOWBARK_SENTRY],
        back: [EMBERSEED_WARLOCK, RENDFANG_JACKAL, DEEPROCK_MINER],
      },
    },
    {
      id: 't-monster-f133',
      name: 'Floor 133',
      enemies: {
        front: [SEALWARD_CUSTODIAN, GRAVEWAKE_THRALL],
        back: [BRAMBLEWALK_SCOUT, CINDERQUENCH_BEARER, FREE_BLADE],
      },
    },
    {
      id: 't-monster-f134',
      name: 'Floor 134',
      enemies: {
        front: [PYRE, GILDED_SENTRY],
        back: [BARROWMIST_KEENER, VAULTBOUND_GAOLER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-monster-f135',
      name: 'Floor 135',
      enemies: {
        front: [GILDED_SENTRY, BOAR],
        back: [RUINWING_DEVOURER, FORGE_THRALL, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f136',
      name: 'Floor 136',
      enemies: { front: [RAVAGER, REVENANT], back: [LUMEN_ACOLYTE, MOONSONG_WEAVER, FORLORN_LEVY] },
    },
    {
      id: 't-monster-f137',
      name: 'Floor 137',
      enemies: {
        front: [HAG, SLAGBOUND_DRUDGE],
        back: [BLOODPACT_FIEND, BOAR, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f138',
      name: 'Floor 138',
      enemies: {
        front: [CROWNBARK_BASTION, VAULTBOUND_GAOLER],
        back: [SERAPH_ADJUDICANT, CINDERLING, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f139',
      name: 'Floor 139',
      enemies: {
        front: [HEXBOUND_TORMENTOR, CAIRNWARD_HUSK],
        back: [VAULTLIGHT_CENSER, VAULTBOUND_GAOLER, STORMCALLER],
      },
    },
    {
      id: 't-monster-f140',
      name: 'Floor 140 — The Driven Ground',
      enemies: {
        front: [SCARBOUND_BELLOWER, CHARNEL_DRUDGE],
        back: [BULWARK_ENEMY, WHISPERLEAF_ARCHER, COLDFORGE_HAND],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Converging Horns — Floors 141–160, levels 67–76 — four questions, and the last band that carries a heal: above this floor no board carries a `heal` or a `regen` again. ⚠️ It used to say "nothing restores anything", and that was wrong about the boards underneath it — a drain, `lifeLeech` and `recovery` all appear above 160. See the head of this file.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f141',
      name: 'Floor 141',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, PYRE],
        back: [RADIANT_HERALD, GRAVEWAKE_THRALL, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f142',
      name: 'Floor 142',
      enemies: {
        front: [OATHSHIELD_VANGUARD, GRAVEWAKE_THRALL],
        back: [SKYSHRIKE, RENDFANG_JACKAL, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-monster-f143',
      name: 'Floor 143',
      enemies: {
        front: [MARROWHUNT_ALPHA, GILDED_SENTRY],
        back: [LONGBOUGH_MARKSMAN, SENTINEL, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-monster-f144',
      name: 'Floor 144',
      enemies: {
        front: [REDWATER_STALKER, DEEPROCK_MINER],
        back: [KINGSWAY_LANCER, GRAVEWAKE_THRALL, ACOLYTE],
      },
    },
    {
      id: 't-monster-f145',
      name: 'Floor 145',
      enemies: {
        front: [RIMEPLATE, GILDED_SENTRY],
        back: [SKYSHRIKE, GRAVETIDE_HERALD, CINDERLING],
      },
    },
    {
      id: 't-monster-f146',
      name: 'Floor 146',
      enemies: {
        front: [SEALWARD_CUSTODIAN, THORNLING],
        back: [ANTIPHON_ARCHON, KINGSWAY_LANCER, FORGE_THRALL],
      },
    },
    {
      id: 't-monster-f147',
      name: 'Floor 147',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, NIGHTCANOPY_SINGER],
        back: [EMBERSEED_WARLOCK, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-monster-f148',
      name: 'Floor 148',
      enemies: {
        front: [BLOODGORGE_HOUND, RIFTBORN_HARROWER],
        back: [SERAPH_ADJUDICANT, COLDHEARTH_IRONSWORN, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-monster-f149',
      name: 'Floor 149',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, UNDERVAULT_SAPPER],
        back: [RUINWING_DEVOURER, REVENANT, COLDFORGE_HAND],
      },
    },
    {
      id: 't-monster-f150',
      name: 'Floor 150 — The Converging Horns',
      enemies: {
        front: [SEALWARD_CUSTODIAN, MOONSONG_WEAVER],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f151',
      name: 'Floor 151',
      enemies: {
        front: [RAVAGER, PYRE],
        back: [KINGSWAY_LANCER, VAULTBOUND_GAOLER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f152',
      name: 'Floor 152',
      enemies: {
        front: [SCARBOUND_BELLOWER, GRAVEWAKE_THRALL],
        back: [LONGBOUGH_MARKSMAN, CHARNEL_DRUDGE, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-monster-f153',
      name: 'Floor 153',
      enemies: {
        front: [GOREHIDE_MATRIARCH, GILDED_SENTRY],
        back: [EMBERSEED_WARLOCK, HAG, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-monster-f154',
      name: 'Floor 154',
      enemies: {
        front: [MARROWHUNT_ALPHA, DEEPROCK_MINER],
        back: [SERAPH_ADJUDICANT, VAULTBOUND_GAOLER, ACOLYTE],
      },
    },
    {
      id: 't-monster-f155',
      name: 'Floor 155',
      enemies: { front: [GOLEM, GILDED_SENTRY], back: [RUINWING_DEVOURER, QUENCHWRIGHT, REVENANT] },
    },
    {
      id: 't-monster-f156',
      name: 'Floor 156',
      enemies: {
        front: [CROWNBARK_BASTION, FORLORN_LEVY],
        back: [ASHEN_CHOIR, EMBERSEED_WARLOCK, FORGE_THRALL],
      },
    },
    {
      id: 't-monster-f157',
      name: 'Floor 157',
      enemies: {
        front: [OATHSHIELD_VANGUARD, NIGHTCANOPY_SINGER],
        back: [NIGHTMARCH_OUTRIDER, BOAR, CINDERLING],
      },
    },
    {
      id: 't-monster-f158',
      name: 'Floor 158',
      enemies: {
        front: [REDWATER_STALKER, STORMCALLER],
        back: [RADIANT_HERALD, SENTINEL, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-monster-f159',
      name: 'Floor 159',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, RIFTBORN_HARROWER],
        back: [SERAPH_ADJUDICANT, THORNLING, COLDFORGE_HAND],
      },
    },
    {
      id: 't-monster-f160',
      name: 'Floor 160 — The Closing Ring',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, HAG],
        back: [KINGSWAY_LANCER, HEXBOUND_TORMENTOR, CINDERQUENCH_BEARER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Narrowed Ground — Floors 161–180, levels 76–85 — an anchor to a board and never two, with four questions standing behind it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f161',
      name: 'Floor 161',
      enemies: { front: [WARDEN, CHARNEL_DRUDGE], back: [RADIANT_HERALD, FORGE_THRALL, BOAR] },
    },
    {
      id: 't-monster-f162',
      name: 'Floor 162',
      enemies: {
        front: [FENLORD, THORNLING],
        back: [RUINWING_DEVOURER, GRAVEWAKE_THRALL, DEEPROCK_MINER],
      },
    },
    {
      id: 't-monster-f163',
      name: 'Floor 163',
      enemies: {
        front: [SEALWARD_CUSTODIAN, MOONSONG_WEAVER],
        back: [KINGSWAY_LANCER, CINDERLING, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f164',
      name: 'Floor 164',
      enemies: {
        front: [SEALWARD_CUSTODIAN, NIGHTCANOPY_SINGER],
        back: [GRAVEMOURN_KEEPER, FREE_BLADE, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f165',
      name: 'Floor 165',
      enemies: {
        front: [PALE_WARDEN, CARRION_SWARM],
        back: [EMBERSEED_WARLOCK, SUNFADE_CHANTER, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-monster-f166',
      name: 'Floor 166',
      enemies: {
        front: [WYRDROOT_ANCIENT, REVENANT],
        back: [SERAPH_ADJUDICANT, UNDERVAULT_SAPPER, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-monster-f167',
      name: 'Floor 167',
      enemies: { front: [RAVAGER, PYRE], back: [RADIANT_HERALD, HAG, BOAR] },
    },
    {
      id: 't-monster-f168',
      name: 'Floor 168',
      enemies: {
        front: [SEALWARD_CUSTODIAN, HEXBOUND_TORMENTOR],
        back: [IRONSLING_WRIGHT, MOONSONG_WEAVER, BOAR],
      },
    },
    {
      id: 't-monster-f169',
      name: 'Floor 169',
      enemies: {
        front: [BARROW_SOVEREIGN, COLDHEARTH_IRONSWORN],
        back: [KINGSWAY_LANCER, BOAR, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f170',
      name: 'Floor 170 — The Narrowed Ground',
      enemies: {
        front: [BARROW_SOVEREIGN, NIGHTCANOPY_SINGER],
        back: [SERAPH_ADJUDICANT, BOAR, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f171',
      name: 'Floor 171',
      enemies: { front: [WARDEN, STORMCALLER], back: [RADIANT_HERALD, HAG, THORNLING] },
    },
    {
      id: 't-monster-f172',
      name: 'Floor 172',
      enemies: {
        front: [FENLORD, RIFTBORN_HARROWER],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, CHARNEL_DRUDGE],
      },
    },
    {
      id: 't-monster-f173',
      name: 'Floor 173',
      enemies: {
        front: [OATHBREAKER, GRUDGEPLATE_SMITH],
        back: [RUINWING_DEVOURER, PYRE, VAULTBOUND_GAOLER],
      },
    },
    {
      id: 't-monster-f174',
      name: 'Floor 174',
      enemies: {
        front: [WYRDROOT_ANCIENT, GRUDGEPLATE_SMITH],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-monster-f175',
      name: 'Floor 175',
      enemies: {
        front: [FENLORD, PYRE],
        back: [SERAPH_ADJUDICANT, NIGHTCANOPY_SINGER, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-monster-f176',
      name: 'Floor 176',
      enemies: {
        front: [WARDEN, HEXBOUND_TORMENTOR],
        back: [RADIANT_HERALD, SENTINEL, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-monster-f177',
      name: 'Floor 177',
      enemies: {
        front: [THE_BREACHLORD, GRUDGEPLATE_SMITH],
        back: [SKYSHRIKE, PYRE, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-monster-f178',
      name: 'Floor 178',
      enemies: {
        front: [WYRDROOT_ANCIENT, GRUDGEPLATE_SMITH],
        back: [SERAPH_ADJUDICANT, HEXBOUND_TORMENTOR, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-monster-f179',
      name: 'Floor 179',
      enemies: { front: [FENLORD, HAG], back: [RADIANT_HERALD, PYRE, SHADE] },
    },
    {
      id: 't-monster-f180',
      name: 'Floor 180 — The Last Cover',
      enemies: {
        front: [FENLORD, COLDHEARTH_IRONSWORN],
        back: [KINGSWAY_LANCER, HEXBOUND_TORMENTOR, WEALDSHADOW_STALKER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Horncaller — Floors 181–200, levels 86–95 — five questions and one anchor a board, and at the top the horn all hundred floors of banners were listening for.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f181',
      name: 'Floor 181',
      enemies: { front: [PALE_WARDEN, GRUDGEPLATE_SMITH], back: [SERAPH_ADJUDICANT, PYRE, BOAR] },
    },
    {
      id: 't-monster-f182',
      name: 'Floor 182',
      enemies: {
        front: [OATHBREAKER, GRUDGEPLATE_SMITH],
        back: [NIGHTMARCH_OUTRIDER, HEXBOUND_TORMENTOR, BOAR],
      },
    },
    {
      id: 't-monster-f183',
      name: 'Floor 183',
      enemies: { front: [WYRDROOT_ANCIENT, GRUDGEPLATE_SMITH], back: [RADIANT_HERALD, PYRE, BOAR] },
    },
    {
      id: 't-monster-f184',
      name: 'Floor 184',
      enemies: {
        front: [THE_BREACHLORD, GRUDGEPLATE_SMITH],
        back: [GRAVEMOURN_KEEPER, HEXBOUND_TORMENTOR, BOAR],
      },
    },
    {
      id: 't-monster-f185',
      name: 'Floor 185',
      enemies: {
        front: [FENLORD, MOONSONG_WEAVER],
        back: [SERAPH_ADJUDICANT, PYRE, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-monster-f186',
      name: 'Floor 186',
      enemies: {
        front: [WARDEN, NIGHTCANOPY_SINGER],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-monster-f187',
      name: 'Floor 187',
      enemies: { front: [FENLORD, HAG], back: [SERAPH_ADJUDICANT, PYRE, QUENCHWRIGHT] },
    },
    {
      id: 't-monster-f188',
      name: 'Floor 188',
      enemies: {
        front: [WARDEN, MOONSONG_WEAVER],
        back: [RADIANT_HERALD, HEXBOUND_TORMENTOR, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-monster-f189',
      name: 'Floor 189',
      enemies: {
        front: [TYRANT, HOLLOWBARK_SENTRY],
        back: [KINGSWAY_LANCER, SENTINEL, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-monster-f190',
      name: 'Floor 190 — The Horns Answer',
      enemies: {
        front: [THE_REDMAW, GILDED_SENTRY],
        back: [NIGHTMARCH_OUTRIDER, COLDHEARTH_IRONSWORN, SHADE],
      },
    },
    {
      id: 't-monster-f191',
      name: 'Floor 191',
      enemies: {
        front: [TYRANT, GILDED_SENTRY],
        back: [KINGSWAY_LANCER, NIGHTCANOPY_SINGER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-monster-f192',
      name: 'Floor 192',
      enemies: { front: [THE_REDMAW, GILDED_SENTRY], back: [KINGSWAY_LANCER, SENTINEL, SHADE] },
    },
    {
      id: 't-monster-f193',
      name: 'Floor 193',
      enemies: {
        front: [PALE_WARDEN, PYRE],
        back: [SERAPH_ADJUDICANT, COLDHEARTH_IRONSWORN, STORMCALLER],
      },
    },
    {
      id: 't-monster-f194',
      name: 'Floor 194',
      enemies: {
        front: [WYRDROOT_ANCIENT, HEXBOUND_TORMENTOR],
        back: [GRAVEMOURN_KEEPER, SENTINEL, UNDERVAULT_SAPPER],
      },
    },
    {
      id: 't-monster-f195',
      name: 'Floor 195',
      enemies: { front: [WYRDROOT_ANCIENT, PYRE], back: [RADIANT_HERALD, HAG, SUNFADE_CHANTER] },
    },
    {
      id: 't-monster-f196',
      name: 'Floor 196',
      enemies: {
        front: [COLOSSUS, HEXBOUND_TORMENTOR],
        back: [SERAPH_ADJUDICANT, HAG, STORMCALLER],
      },
    },
    {
      id: 't-monster-f197',
      name: 'Floor 197',
      enemies: {
        front: [THE_GRAVEWRIGHT, UNDERVAULT_SAPPER],
        back: [RADIANT_HERALD, COLDHEARTH_IRONSWORN, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_GRAVEWRIGHT, SUNFADE_CHANTER],
        back: [SERAPH_ADJUDICANT, SENTINEL, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f199',
      name: 'Floor 199',
      enemies: {
        front: [THE_GRAVEWRIGHT, STORMCALLER],
        back: [LONGBOUGH_MARKSMAN, COLDHEARTH_IRONSWORN, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f200',
      name: 'Floor 200 — The Horncaller',
      enemies: {
        front: [THE_HORNCALLER, MARROWHUNT_ALPHA],
        back: [RUINWING_DEVOURER, MOONSONG_WEAVER, CINDERQUENCH_BEARER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Ring Closes — Floors 201–220, levels 95–104 — the horn has been answered, and what answered it does not run. One body a board wearing something these jaws do not open, and every one of them inside the register the game already shipped.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f201',
      name: 'Floor 201',
      enemies: { front: [PALE_WARDEN, GOLEM], back: [SKYSHRIKE, SEPULCHRE_HOUND, MOONSONG_WEAVER] },
    },
    {
      id: 't-monster-f202',
      name: 'Floor 202',
      enemies: {
        front: [WARDEN, SLAGBOUND_DRUDGE],
        back: [MOONSONG_WEAVER, VANWARD_SPEAR, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f203',
      name: 'Floor 203',
      enemies: {
        front: [OATHBREAKER, CHARNEL_DRUDGE],
        back: [ZENITH_CHORISTER, BARROWMIST_KEENER, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f204',
      name: 'Floor 204',
      enemies: {
        front: [FENLORD, HOLLOWBARK_SENTRY],
        back: [SEPULCHRE_HOUND, DEEPROCK_MINER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-monster-f205',
      name: 'Floor 205',
      enemies: {
        front: [THE_CROWN_WHEEL, MUSTER_PIKE],
        back: [DUSKFERN_SKIRMISHER, CARRION_SWARM, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f206',
      name: 'Floor 206',
      enemies: {
        front: [PALE_WARDEN, EMBERSHELL_WHELP],
        back: [SKYSHRIKE, PLUMBLINE_HAND, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-monster-f207',
      name: 'Floor 207',
      enemies: {
        front: [WARDEN, THORNBACK_GRAZER],
        back: [SERAPH_ADJUDICANT, MARROWHUNT_ALPHA, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-monster-f208',
      name: 'Floor 208',
      enemies: {
        front: [THE_BREACHLORD, GILDED_SENTRY],
        back: [MOONSONG_WEAVER, ASHPIT_SCUTTLER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-monster-f209',
      name: 'Floor 209',
      enemies: {
        front: [OATHBREAKER, CAIRNWARD_HUSK],
        back: [KNELL_CHANTER, WHISPERLEAF_ARCHER, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-monster-f210',
      name: 'Floor 210 — The Ring Closes',
      enemies: {
        front: [FENLORD, CLOSEWARD_SERAPH],
        back: [SKYSHRIKE, DEEPROCK_MINER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-monster-f211',
      name: 'Floor 211',
      enemies: {
        front: [PALE_WARDEN, GLOAMVINE_CREEPER],
        back: [RADIANT_HERALD, DUSKFERN_SKIRMISHER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f212',
      name: 'Floor 212',
      enemies: {
        front: [THE_CROWN_WHEEL, GOLEM],
        back: [MOONSONG_WEAVER, SIGNAL_RUNNER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-monster-f213',
      name: 'Floor 213',
      enemies: { front: [WARDEN, GRAVEWAKE_THRALL], back: [SKYSHRIKE, QUENCHWRIGHT, MIREWHELP] },
    },
    {
      id: 't-monster-f214',
      name: 'Floor 214',
      enemies: {
        front: [OATHBREAKER, MARCHWARD_PIKEMAN],
        back: [ZENITH_CHORISTER, BARROWMIST_KEENER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-monster-f215',
      name: 'Floor 215',
      enemies: {
        front: [THE_BREACHLORD, SLAGBOUND_DRUDGE],
        back: [SUNFADE_CHANTER, DUSKFERN_SKIRMISHER, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-monster-f216',
      name: 'Floor 216',
      enemies: {
        front: [FENLORD, VAULTBOUND_GAOLER],
        back: [CARRION_SWARM, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-monster-f217',
      name: 'Floor 217',
      enemies: {
        front: [PALE_WARDEN, CORTEGE_LANCER],
        back: [SKYSHRIKE, LITANY_BEARER, IRONSLING_WRIGHT],
      },
    },
    {
      id: 't-monster-f218',
      name: 'Floor 218',
      enemies: {
        front: [WARDEN, THORNBACK_GRAZER],
        back: [SERAPH_ADJUDICANT, SEPULCHRE_HOUND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f219',
      name: 'Floor 219',
      enemies: {
        front: [THE_CROWN_WHEEL, HOLLOWBARK_SENTRY],
        back: [MOONSONG_WEAVER, ROADWATCH_BOWMAN, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-monster-f220',
      name: 'Floor 220 — The Answering Horn',
      enemies: {
        front: [OATHBREAKER, CLOSEWARD_SERAPH],
        back: [DUSKFERN_SKIRMISHER, SKYSHRIKE, EMBERSHELL_WHELP],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Plated Ranks — Floors 221–245, levels 105–116 — two a board, and the first plate authored to be worn against this crew rather than found lying about the pool.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f221',
      name: 'Floor 221',
      enemies: {
        front: [THE_BREACHLORD, SLAGHIDE_PURSUER],
        back: [GOLEM, SKYSHRIKE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f222',
      name: 'Floor 222',
      enemies: {
        front: [FENLORD, CHARNEL_DRUDGE],
        back: [SLAGBOUND_DRUDGE, MOONSONG_WEAVER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f223',
      name: 'Floor 223',
      enemies: {
        front: [PALE_WARDEN, SLAGHIDE_PURSUER],
        back: [HOLLOWBARK_SENTRY, SKYSHRIKE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f224',
      name: 'Floor 224',
      enemies: {
        front: [BARROW_SOVEREIGN, GOLEM],
        back: [GILDED_SENTRY, MARROWHUNT_ALPHA, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-monster-f225',
      name: 'Floor 225',
      enemies: {
        front: [COLOSSUS, CAIRNWARD_HUSK],
        back: [EMBERSHELL_WHELP, DUSKFERN_SKIRMISHER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-monster-f226',
      name: 'Floor 226',
      enemies: {
        front: [OATHBREAKER, THORNBACK_GRAZER],
        back: [SLAGHIDE_PURSUER, ZENITH_CHORISTER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f227',
      name: 'Floor 227',
      enemies: {
        front: [WYRDROOT_ANCIENT, GRUDGEPLATE_SMITH],
        back: [MUSTER_PIKE, BARROWMIST_KEENER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-monster-f228',
      name: 'Floor 228',
      enemies: {
        front: [THE_CROWN_WHEEL, SLAGHIDE_PURSUER],
        back: [GRAVEWAKE_THRALL, MOONSONG_WEAVER, MIREWHELP],
      },
    },
    {
      id: 't-monster-f229',
      name: 'Floor 229',
      enemies: {
        front: [THE_BREACHLORD, GOLEM],
        back: [GLOAMVINE_CREEPER, SKYSHRIKE, DEEPGALLERY_RUNNER],
      },
    },
    {
      id: 't-monster-f230',
      name: 'Floor 230 — The Plated Ranks',
      enemies: {
        front: [BARROW_SOVEREIGN, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, DUSKFERN_SKIRMISHER, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-monster-f231',
      name: 'Floor 231',
      enemies: {
        front: [FENLORD, MUSTER_PIKE],
        back: [IRONWAKE_VANGUARD, SERAPH_ADJUDICANT, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f232',
      name: 'Floor 232',
      enemies: {
        front: [COLOSSUS, SLAGHIDE_PURSUER],
        back: [CHARNEL_DRUDGE, MOONSONG_WEAVER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-monster-f233',
      name: 'Floor 233',
      enemies: {
        front: [WYRDROOT_ANCIENT, HOLLOWBARK_SENTRY],
        back: [EMBERSHELL_WHELP, DUSKFERN_SKIRMISHER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-monster-f234',
      name: 'Floor 234',
      enemies: {
        front: [PALE_WARDEN, SLAGHIDE_PURSUER],
        back: [GOLEM, NIGHTCANOPY_SINGER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-monster-f235',
      name: 'Floor 235',
      enemies: {
        front: [OATHBREAKER, CORTEGE_LANCER],
        back: [SLAGBOUND_DRUDGE, SKYSHRIKE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f236',
      name: 'Floor 236',
      enemies: {
        front: [THE_BREACHLORD, QUENCHPIT_IRONHIDE],
        back: [CROWNBARK_BASTION, BARROWMIST_KEENER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f237',
      name: 'Floor 237',
      enemies: {
        front: [BARROW_SOVEREIGN, SLAGHIDE_PURSUER],
        back: [MARCHWARD_PIKEMAN, MOONSONG_WEAVER, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-monster-f238',
      name: 'Floor 238',
      enemies: {
        front: [FENLORD, EDGETURN_WARDEN],
        back: [EMBERSHELL_WHELP, DUSKFERN_SKIRMISHER, KINGSWAY_LANCER],
      },
    },
    {
      id: 't-monster-f239',
      name: 'Floor 239',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [IRONWAKE_VANGUARD, SKYSHRIKE, MIREWHELP],
      },
    },
    {
      id: 't-monster-f240',
      name: 'Floor 240 — The Shutfast Yard',
      enemies: {
        front: [COLOSSUS, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, GOLEM, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-monster-f241',
      name: 'Floor 241',
      enemies: {
        front: [THE_CROWN_WHEEL, GOLEM],
        back: [SLAGHIDE_PURSUER, MOONSONG_WEAVER, IRONSLING_WRIGHT],
      },
    },
    {
      id: 't-monster-f242',
      name: 'Floor 242',
      enemies: {
        front: [PALE_WARDEN, EDGETURN_WARDEN],
        back: [EMBERSHELL_WHELP, DUSKFERN_SKIRMISHER, KNELL_CHANTER],
      },
    },
    {
      id: 't-monster-f243',
      name: 'Floor 243',
      enemies: {
        front: [OATHBREAKER, SLAGHIDE_PURSUER],
        back: [HOLLOWBARK_SENTRY, SKYSHRIKE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f244',
      name: 'Floor 244',
      enemies: {
        front: [BARROW_SOVEREIGN, CHARNEL_DRUDGE],
        back: [MUSTER_PIKE, PYRE, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-monster-f245',
      name: 'Floor 245',
      enemies: {
        front: [THE_BREACHLORD, SLAGHIDE_PURSUER],
        back: [GOLEM, MOONSONG_WEAVER, STILLNESS_CANTOR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Shutfast Line — Floors 246–270, levels 117–128 — three a board, and every faction the tower fields has brought the half of itself that wears armour.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f246',
      name: 'Floor 246',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [GOLEM, CHARNEL_DRUDGE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f247',
      name: 'Floor 247',
      enemies: {
        front: [THE_EDGEWRIGHT, CHARNEL_DRUDGE],
        back: [SLAGHIDE_PURSUER, EMBERSHELL_WHELP, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f248',
      name: 'Floor 248',
      enemies: {
        front: [FENLORD, CLOSEWARD_SERAPH],
        back: [SLAGBOUND_DRUDGE, HOLLOWBARK_SENTRY, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f249',
      name: 'Floor 249',
      enemies: {
        front: [COLOSSUS, SLAGHIDE_PURSUER],
        back: [EMBERSHELL_WHELP, CAIRNWARD_HUSK, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f250',
      name: 'Floor 250 — The Shutfast Line',
      enemies: {
        front: [BARROW_SOVEREIGN, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, GOLEM, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f251',
      name: 'Floor 251',
      enemies: {
        front: [THE_SEEDFATHER, SLAGHIDE_PURSUER],
        back: [GRAVEWAKE_THRALL, MUSTER_PIKE, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f252',
      name: 'Floor 252',
      enemies: {
        front: [OATHBREAKER, GOLEM],
        back: [SLAGHIDE_PURSUER, CHARNEL_DRUDGE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f253',
      name: 'Floor 253',
      enemies: {
        front: [THE_CROWN_WHEEL, CLOSEWARD_SERAPH],
        back: [MARCHWARD_PIKEMAN, IRONWAKE_VANGUARD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f254',
      name: 'Floor 254',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [THORNBACK_GRAZER, EMBERSHELL_WHELP, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-monster-f255',
      name: 'Floor 255',
      enemies: {
        front: [THE_BREACHLORD, QUENCHPIT_IRONHIDE],
        back: [SLAGHIDE_PURSUER, GILDED_SENTRY, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f256',
      name: 'Floor 256',
      enemies: {
        front: [FENLORD, CLOSEWARD_SERAPH],
        back: [EMBERSHELL_WHELP, HOLLOWBARK_SENTRY, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f257',
      name: 'Floor 257',
      enemies: {
        front: [THE_EDGEWRIGHT, SLAGHIDE_PURSUER],
        back: [GOLEM, CAIRNBOUND_SENTINEL, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f258',
      name: 'Floor 258',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [SLAGHIDE_PURSUER, EMBERSHELL_WHELP, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f259',
      name: 'Floor 259',
      enemies: {
        front: [BARROW_SOVEREIGN, CLOSEWARD_SERAPH],
        back: [SLAGBOUND_DRUDGE, CHARNEL_DRUDGE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f260',
      name: 'Floor 260 — The Cage of Plate',
      enemies: {
        front: [THE_SEEDFATHER, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, GOLEM, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f261',
      name: 'Floor 261',
      enemies: {
        front: [OATHBREAKER, SLAGHIDE_PURSUER],
        back: [CROWNBARK_BASTION, VAULTBOUND_GAOLER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f262',
      name: 'Floor 262',
      enemies: {
        front: [WYRDROOT_ANCIENT, GOLEM],
        back: [SLAGHIDE_PURSUER, GRUDGEPLATE_SMITH, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f263',
      name: 'Floor 263',
      enemies: {
        front: [THE_CROWN_WHEEL, CLOSEWARD_SERAPH],
        back: [EMBERSHELL_WHELP, IRONWAKE_VANGUARD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f264',
      name: 'Floor 264',
      enemies: {
        front: [THE_BREACHLORD, SLAGHIDE_PURSUER],
        back: [HOLLOWBARK_SENTRY, QUICKLIME_SERJEANT, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f265',
      name: 'Floor 265',
      enemies: { front: [FENLORD, THORNBACK_GRAZER], back: [SLAGHIDE_PURSUER, GOLEM, SKYSHRIKE] },
    },
    {
      id: 't-monster-f266',
      name: 'Floor 266',
      enemies: {
        front: [THE_EDGEWRIGHT, CLOSEWARD_SERAPH],
        back: [EMBERSHELL_WHELP, SLAGBOUND_DRUDGE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f267',
      name: 'Floor 267',
      enemies: {
        front: [COLOSSUS, SLAGHIDE_PURSUER],
        back: [CHARNEL_DRUDGE, OATHSHIELD_VANGUARD, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f268',
      name: 'Floor 268',
      enemies: {
        front: [BARROW_SOVEREIGN, EDGETURN_WARDEN],
        back: [SLAGHIDE_PURSUER, GOLEM, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f269',
      name: 'Floor 269',
      enemies: {
        front: [THE_SEEDFATHER, CLOSEWARD_SERAPH],
        back: [EMBERSHELL_WHELP, QUICKLIME_SERJEANT, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f270',
      name: 'Floor 270 — The Narrow Plate',
      enemies: {
        front: [OATHBREAKER, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, GOLEM, EMBERSHELL_WHELP],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Plated Pack — Floors 271–290, levels 128–137 — the same plate on something that keeps up. One to a board and never two, because the wall and the rate are a product rather than two dials.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f271',
      name: 'Floor 271',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, GOLEM, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f272',
      name: 'Floor 272',
      enemies: {
        front: [TYRANT, CHARNEL_DRUDGE],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f273',
      name: 'Floor 273',
      enemies: {
        front: [THE_BREACHLORD, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f274',
      name: 'Floor 274',
      enemies: {
        front: [THE_REDMAW, GOLEM],
        back: [CINDERPLATE_HOUNDSMAN, SLAGBOUND_DRUDGE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f275',
      name: 'Floor 275',
      enemies: {
        front: [THE_EDGEWRIGHT, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, HOLLOWBARK_SENTRY, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f276',
      name: 'Floor 276',
      enemies: {
        front: [THE_GRAVEWRIGHT, GOLEM],
        back: [CINDERPLATE_HOUNDSMAN, CHARNEL_DRUDGE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f277',
      name: 'Floor 277',
      enemies: {
        front: [OATHBREAKER, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, IRONWAKE_VANGUARD],
      },
    },
    {
      id: 't-monster-f278',
      name: 'Floor 278',
      enemies: {
        front: [THE_SEEDFATHER, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, GOLEM, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f279',
      name: 'Floor 279',
      enemies: {
        front: [THE_HORNCALLER, THORNBACK_GRAZER],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f280',
      name: 'Floor 280 — The Plated Pack',
      enemies: {
        front: [TYRANT, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f281',
      name: 'Floor 281',
      enemies: {
        front: [THE_CROWN_WHEEL, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, QUENCHPIT_IRONHIDE, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-monster-f282',
      name: 'Floor 282',
      enemies: {
        front: [THE_REDMAW, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, GOLEM, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f283',
      name: 'Floor 283',
      enemies: {
        front: [WYRDROOT_ANCIENT, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, CHARNEL_DRUDGE, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f284',
      name: 'Floor 284',
      enemies: {
        front: [THE_BREACHLORD, GOLEM],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, EDGETURN_WARDEN],
      },
    },
    {
      id: 't-monster-f285',
      name: 'Floor 285',
      enemies: {
        front: [THE_EDGEWRIGHT, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, EMBERSHELL_WHELP, HOLLOWBARK_SENTRY],
      },
    },
    {
      id: 't-monster-f286',
      name: 'Floor 286',
      enemies: {
        front: [OATHBREAKER, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, GOLEM, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f287',
      name: 'Floor 287',
      enemies: {
        front: [THE_SEEDFATHER, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, CROWNBARK_BASTION],
      },
    },
    {
      id: 't-monster-f288',
      name: 'Floor 288',
      enemies: {
        front: [THE_CROWN_WHEEL, CHARNEL_DRUDGE],
        back: [CINDERPLATE_HOUNDSMAN, EMBERSHELL_WHELP, SLAGBOUND_DRUDGE],
      },
    },
    {
      id: 't-monster-f289',
      name: 'Floor 289',
      enemies: {
        front: [FENLORD, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, GOLEM, QUICKLIME_SERJEANT],
      },
    },
    {
      id: 't-monster-f290',
      name: 'Floor 290 — Nothing Left to Run To',
      enemies: {
        front: [WYRDROOT_ANCIENT, CLOSEWARD_SERAPH],
        back: [CINDERPLATE_HOUNDSMAN, SLAGHIDE_PURSUER, SLAGHIDE_PURSUER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Closing — Floors 291–300, levels 138–142 — the lightest boards in the hundred carrying the heaviest plate in the game. The old anchors are gone by 295, and nothing but the thing the horn called stands in front of the last six floors.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f291',
      name: 'Floor 291',
      enemies: {
        front: [THE_BREACHLORD, SLAGHIDE_PURSUER],
        back: [SLAGHIDE_PURSUER, GOLEM, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f292',
      name: 'Floor 292',
      enemies: {
        front: [THE_CROWN_WHEEL, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, CINDERPLATE_HOUNDSMAN, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f293',
      name: 'Floor 293',
      enemies: {
        front: [OATHBREAKER, SLAGHIDE_PURSUER],
        back: [CLOSEWARD_SERAPH, THORNBACK_GRAZER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f294',
      name: 'Floor 294',
      enemies: {
        front: [THE_EDGEWRIGHT, SLAGHIDE_PURSUER],
        back: [SLAGHIDE_PURSUER, CINDERPLATE_HOUNDSMAN, GOLEM],
      },
    },
    {
      id: 't-monster-f295',
      name: 'Floor 295',
      enemies: {
        front: [THE_UNBITTEN, EMBERSHELL_WHELP],
        back: [SLAGHIDE_PURSUER, GOLEM, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-monster-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_UNBITTEN, SLAGHIDE_PURSUER],
        back: [EMBERSHELL_WHELP, CHARNEL_DRUDGE, SKYSHRIKE],
      },
    },
    {
      id: 't-monster-f297',
      name: 'Floor 297',
      enemies: {
        front: [THE_UNBITTEN, CLOSEWARD_SERAPH],
        back: [SLAGHIDE_PURSUER, EMBERSHELL_WHELP, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-monster-f298',
      name: 'Floor 298',
      enemies: {
        front: [THE_UNBITTEN, SLAGHIDE_PURSUER],
        back: [SLAGHIDE_PURSUER, EMBERSHELL_WHELP, GOLEM],
      },
    },
    {
      id: 't-monster-f299',
      name: 'Floor 299',
      enemies: {
        front: [THE_UNBITTEN, SLAGHIDE_PURSUER],
        back: [CINDERPLATE_HOUNDSMAN, EMBERSHELL_WHELP, HOLLOWBARK_SENTRY],
      },
    },
    {
      id: 't-monster-f300',
      name: 'Floor 300 — The Unbitten',
      enemies: {
        front: [THE_UNBITTEN, SLAGHIDE_PURSUER],
        back: [SLAGHIDE_PURSUER, CINDERPLATE_HOUNDSMAN, EMBERSHELL_WHELP],
      },
    },
  ],
} as const;
