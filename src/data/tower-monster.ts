import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  ASHPIT_SCUTTLER,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BENCHLINE_LURKER,
  BLOODGORGE_HOUND,
  BLOODPACT_FIEND,
  BOAR,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CENTURYBOUGH_WARDEN,
  CHAFFMOUTH_GAUNT,
  CHALKHIDE_BROWSER,
  CHARNEL_DRUDGE,
  CINDERFLAW_PROVER,
  CINDERLING,
  CINDERPLATE_HOUNDSMAN,
  CINDERQUENCH_BEARER,
  CINDERSEED_COURSER,
  CINDER_CULLER,
  CLOSEWARD_SERAPH,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  CORTEGE_LANCER,
  CROWNBARK_BASTION,
  DEEPGALLERY_RUNNER,
  DEEPROCK_MINER,
  DROWNED_MAST,
  DUSKFERN_SKIRMISHER,
  DUSTPLATE_GRINDER,
  EDGETURN_WARDEN,
  EMBERSEED_WARLOCK,
  EMBERSHELL_WHELP,
  EMBERVAULT_KEEPER,
  FENGORGED_WALLOWER,
  FENLORD,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GALLERY_SLIPFANG,
  GANTRY_WARDEN,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLANCEWORK_SMITH,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVEFURROW_WALKER,
  GRAVEMOURN_KEEPER,
  GRAVESTRIDE_SERJEANT,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  GRUDGEPLATE_SMITH,
  HAG,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  ILLFALL_SKULKER,
  IRONSLING_WRIGHT,
  IRONWAKE_VANGUARD,
  KINGSWAY_LANCER,
  KNELL_CHANTER,
  LAMPLESS_PILGRIM,
  LAMPOIL_SACRIST,
  LASTFEW_WARDEN,
  LITANY_BEARER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MILEWORN_HUSK,
  MIREWHELP,
  MOONSONG_WEAVER,
  MUSTER_PIKE,
  NIGHTCANOPY_SINGER,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  OVERBURDEN_HULK,
  PALE_WARDEN,
  PANOPLY_BEARER,
  PASSBELL_RINGER,
  PLATEBOUND_HUSK,
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
  ROUGHCAST_GNAWER,
  RUINWING_DEVOURER,
  RUNEWARDEN,
  SCALEPLATE_BRAMBLE,
  SCARBOUND_BELLOWER,
  SCARWEAVE_TRAMPLER,
  SCATTERSTONE_HOWLER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SHALEBED_CRAWLER,
  SHATTERJAW_MAULER,
  SHEAFLESS_SHADE,
  SIGNAL_RUNNER,
  SILENTVAULT_KEEPER,
  SILTFAT_BROODER,
  SKYSHRIKE,
  SLAGBLOOM_THICKET,
  SLAGBOUND_DRUDGE,
  SLAGHIDE_PURSUER,
  SLIME,
  SLIPFAST_IRONSIDE,
  SLOWGROWTH_BOLE,
  SPENTRANK_HAND,
  SPRUNGPLATE_HAND,
  STEPFALL_STANDARD,
  STILLNESS_CANTOR,
  STORMCALLER,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  TALLOWLIGHT_RUNNER,
  THE_BREACHLORD,
  THE_CROWN_WHEEL,
  THE_DEADBOLT,
  THE_DEEPCUT,
  THE_DOORSTONE,
  THE_EDGEWRIGHT,
  THE_GRAVEWRIGHT,
  THE_HORNCALLER,
  THE_LAST_MERCY,
  THE_PANOPLY,
  THE_PLATEWRIGHT,
  THE_PROOF_HOUSE,
  THE_REDMAW,
  THE_SEEDFATHER,
  THE_TURNAWAY,
  THE_UNANSWERED,
  THE_UNBITTEN,
  THE_UNFALTERING,
  THE_UNQUENCHED,
  THE_UNSWALLOWED,
  THORNBACK_GRAZER,
  THORNLING,
  THORNPLATE_WEARER,
  THORNWEALD_WARDEN,
  THURIBLE_ORDINAL,
  TIDELESS_MAW,
  TYRANT,
  UNDERROAD_RANKER,
  UNDERVAULT_SAPPER,
  UNSEALED_WRETCH,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WALKED_GROUND_DEAD,
  WARDEN,
  WEALDSHADOW_STALKER,
  WEARWAY_GAUNT,
  WHISPERLEAF_ARCHER,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Monster Tower — six hundred floors, enemy levels 1 to 283.
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
 * ## ⚠️ The fourth hundred escalates through evasion joining that armour, and the two are not one curve
 *
 * The obvious reading is that they are. Both reduce the damage this crew deals; a crew that sustains
 * on `lifeLeech` off damage *dealt* is starved by either; so `dodge` looks like the third hundred's
 * axis wearing a second stat, which is the disqualification the Coppice recorded for `magicResist`.
 * **Measured, that reading is wrong by a factor of three.** At level 189 in Fine 60 against two
 * calibrated controls — the reference five on an anchor at 1300/68 behind four at 580/42, the
 * alternate on 1060/58 behind four at 480/37, each the heaviest board its own crew still reads ≥3.75
 * on — forty seeds, zero timeouts anywhere:
 *
 * ```
 *   physicalResist 0.45 alone   ref -0.98   alt -0.90
 *   dodge 0.35 alone            ref -1.00   alt -0.90
 *   both                        ref -2.58   alt -2.15
 *
 *   physicalResist 0.60 alone   ref -1.90   alt -1.90
 *   dodge 0.45 alone            ref -1.25   alt -1.15
 *   both                        ref -3.90   alt -3.87   (0% and 3% win)
 * ```
 *
 * ⚠️ **It is sharpest on a single body, which is the cleanest form of the finding.** One anchor at
 * 950/64 behind four light escorts at the roof reads alt **2.08** bare, **1.82** with the plate
 * alone, **1.82** with the evasion alone and **0.20 at a 20% win rate with both**. Each half costs a
 * quarter of a member; the pair costs nearly two. Same shape as this tower's own third-hundred
 * `def`-plus-wall reading and chapter 23's "a pairing beats either half pushed further".
 *
 * ⚠️ **And it is still theirs, which the cross-crew table had to be re-run to say.** Each candidate
 * held to the magnitude that costs monster-ref about one member, measured as a change on each crew's
 * own calibrated control, mirror boards so the matrix is off, every arrangement re-calibrated to the
 * heaviest board it still reads ≥3.75 on: `physicalResist` ranks monster-ref **first of fourteen**
 * and `dodge` **second**. Nothing else is near — `hp` 4th, `physicalPierce` 5th, `def` and a
 * board-wide `STUN` 7th, `haste` 9th, the Coppice's `atk` × `haste` **11th**, `atk` 12th, burst
 * **13th**. Worth 0.00 at any value: `magicResist`, `accuracy`, `energyRegen`. `THORNMAIL` is worth
 * **+0.10** — it leaves the board easier, which is the seventh reading of that kind on this tower.
 *
 * ⚠️ **A second `ascended` anchor grades cleanly and was rejected anyway, and the reason is the whole
 * point of running the table.** Lifting this tower's own two-hundred-floor ration — one anchor a
 * board and never two — grades **3.90 → 3.00 → 2.30 → 2.05 → 1.77** across a second body from 700/46
 * to 1300/68, four monotone steps with zero timeouts, and it reads like the Coppice's "the hundred
 * below is not wrong; the crew meeting it is a different crew". It costs dwarf-ref **−4.00** against
 * monster-ref's −1.98, **eighth of fourteen**. It is the Dwarves' weakness rather than the Monsters'.
 * **A dial that grades is not the same thing as an axis that is ours.**
 *
 * ⚠️ **The four new blocks are Dwarves, and the faction is a measurement rather than a theme.** With
 * no counter-faction to author into, the choice falls to the flat spread: Dwarf was this tower's
 * thinnest row at **11.12%** of 1,439 slots against a demon leader at 17.16%. It leaves at
 * **20.17%** of 1,939 — the leader now, over a floor of 12.22%, against bounds of 5% and 25%.
 * ⚠️ **The first pass ran 22.59% and that is too close to a ceiling that may never be crossed**; the
 * fix was the two the procedure names, every non-new Dwarf texture block swapped for a comparable
 * body from another faction and the **third carrier rationed to alternate floors** in the two middle
 * bands.
 *
 * ⚠️ **The register check comes back as a pairing rather than a stat.** Measured before these four
 * joined the pool: `dodge` on **25 of 338** blocks, median 0.22, ceiling 0.55; `physicalResist` on
 * 157, median 0.10, ceiling 0.40. Every value the hundred authors is at or under the `dodge` median
 * and inside the plate's upper half — **it steps past neither register alone.** What steps past is
 * carrying them together: **0 of 338 blocks carry `dodge` ≥ 0.15 and `physicalResist` ≥ 0.15**, and
 * **not one Dwarf block in the game carries `dodge` at all** while the Dwarves own three of the
 * twelve blocks at plate 0.20 or better.
 *
 * ⚠️ **One board rule, and it is a cliff rather than a preference: the Turnaway never stands beside
 * the Slipfast.** The roof with those two together reads **35%** for the alternate and **90%** with
 * the Slipfast moved one rank back — same board, one body, one rank. ⚠️ **Stated as the pair rather
 * than as "one to a front rank", which is what the first draft claimed and the prose check caught**:
 * the hundred authors exactly one front-rank pairing, the Turnaway beside {@link GLANCEWORK_SMITH} on
 * floors 393–400, and that is the arrangement the 90% was measured on. Carriers per board run
 * **1 / 2 / 2–3 / 2–3 / 2–3** across the five bands — a range, not a constant.
 *
 * ⚠️ **The hundred carries no sustain at all**, where the third hundred stripped it only from its
 * last ten floors. Of the 58 blocks the Turning fields, **zero** carry `recovery`, `lifeLeech` or
 * `healthRegen`, and **zero** carry a heal, drain or shield effect or a `regen` status. Measured the
 * same way one hundred below — boards, over floors 201–300 — that reads **43 carrying `recovery`, 15
 * `healthRegen`, 13 `lifeLeech` and 7 fielding a drain**. ⚠️ **Stated as boards over a named range
 * rather than as an absolute**, which is the fix three towers had to make to this claim — and the
 * first draft of this paragraph quoted the tower's *161–300* figures against a 201–300 range, which
 * is the same failure one step smaller.
 *
 * ⚠️ **The collapse check found the alternate again, and the anchor check found nothing.** The
 * shipped floor-300 board fielded up its own line reads 100% / 5.00 for both crews at level 142,
 * 100% / 4.00 against 100% / 3.23 at 175, and **100% / 1.93 against 15% with 0.15** at 189 in Fine
 * 60 — so every board here is sized against the alternate, exactly as the third hundred's were. No
 * anchor had to retire: the lowest of the sixteen `ascended` blocks the third hundred fields reads
 * ref 2.98 / alt 1.95 behind four light escorts at the roof. ⚠️ **That check was run twice.** Sixteen
 * of those blocks — forty-eight pool-wide — carried no `gearArchetype`, so the first pass fought them
 * **naked** on boards priced as kitted and read {@link THE_UNBITTEN} at a comfortable 4.00 / 4.00
 * against its true **2.98 / 1.95**. All forty-eight have one now; none stood on a geared board, so
 * the bill was zero — checked rather than assumed.
 *
 * The hundred opens at floor 301 in 7.3 seconds with all five alive, costs the alternate a member
 * from floor 330 and the reference from floor 350, and closes at **100% / 3.00 / 27.7s against
 * 88% / 1.45 / 32.7s** — zero timeouts anywhere, longest fight 48.6s against a 67.5s bar. ⚠️ **Three
 * of five is a soft-looking roof and the alternate is what authored it**; the two arrangements are
 * 1.55 survivors apart on that board.
 *
 * ## ⚠️ The fifth hundred is where "is it ours" came back _no_ for everything but the plate
 *
 * Thirteen stats and five mechanics were priced across all fourteen shipped arrangements at band 5 —
 * each crew calibrated to the heaviest **mirror** control it still reads ≥3.75 on, on a 5% ladder,
 * because the coarse version put dwarf-alt and both Angel rows on a cliff and lied. **Every candidate
 * ranks the Monster fives between eighth and fourteenth of fourteen**: `atk` ×1.6 and a crit ramp
 * 13th/14th, a poison 12th/13th, `hp` ×2.8 14th, `haste` 190 and `attackSpeed` 120 12th, a second
 * `ascended` anchor 12th, `WEAKEN` 11th, a board-wide `STUN` 10th, this tower's own `dodge` 12th.
 * That is the Human fifth hundred's finding on a second tower, and it arrives for the **opposite**
 * reason: the Humans are mid-table on every register, and this crew **has no support to lose** —
 * five near-identical attackers with no interdependence, so pressure removes them one at a time and
 * nothing cascades.
 *
 * ⚠️ **The one exception is the plate, and its licence has not expired.** `physicalResist` 0.45 on
 * four bodies costs **monster-ref 0.95, second of fourteen, and monster-alt 0.92, third**, against a
 * field where six arrangements read at or under 0.38 and undead-alt and demon-alt read *negative*.
 * The mechanism is the third hundred's and it is in [`damage.ts`](../core/battle/damage.ts) rather
 * than in the stat names: `effectiveDefence` returns `def × (1 − pierce)` and `resistedShare`
 * multiplies by `1 − resist` **afterwards**, so a pierce never touches a resist — and this crew is
 * the only one built on pierce. **A hundred may build on the hundred below it; this is the third
 * time this tower has, and the licence is measured rather than inherited.**
 *
 * ## ⚠️ The new half is a poison, and both halves are priced in _seconds_
 *
 * The tower's founding paragraph names two currencies a leech crew cannot pay in, and the third and
 * fourth hundreds both bought the same one: armour and evasion each reduce *damage dealt*, which
 * starves `lifeLeech` at its input. A `dot` is the other. `statusDamage` in `simulate.ts` never
 * re-enters the attack path, so leech returns nothing from it; the amount is
 * `scaled(applier.atk, power)`, which **bypasses `def` entirely** and answers only `resistedShare`;
 * and these fives carry **Σ0.00 `magicResist`**. It is the one thing on this ladder that keeps
 * billing after the body carrying it is dead.
 *
 * ⚠️ **Measured on the shipped floors, both halves are worth 0.00 at the bottom of the hundred and
 * everything at the top, and that is one mechanism rather than two.** The plate buys seconds and the
 * poison bills them:
 *
 * ```
 *   floor   burn worth ref/alt   plate worth ref/alt   shipped ref / alt
 *   f420        0.00 / 0.00          0.00 / 0.00        5.00 / 4.00   8.4s
 *   f445        0.05 / 0.05          0.00 / 0.05        4.00 / 3.95  12.9s
 *   f467        0.42 / 0.40          0.50 / 0.50        3.45 / 1.93  15.1s
 *   f490        0.20 / 0.43          0.27 / 0.48        2.77 / 1.25  17.3s
 *   f500        0.20 / 0.80          1.02 / 1.62        2.98 / 0.80  19.5s
 * ```
 *
 * ⚠️ **A poison is worth nothing on a crew that clears in eight seconds, and the opening band is
 * eight seconds long.** That is a finding about the mechanic rather than about this band: the
 * hundred's first twenty floors run 6.6s to 8.4s and {@link BURN} lands once in them. Floor 500 with
 * the plate stripped off the four axis blocks reads **4.00 / 2.42 at 14.4s / 19.3s** against the
 * shipped 2.98 / 0.80 at 19.5s / 31.2s. **State the seconds beside the survivors**; the Elf fifth
 * hundred's rule, arriving from the other side.
 *
 * ⚠️ **The licence is over the _alternate_, which is a shape the Angel fourth hundred recorded and
 * this tower has now reproduced twice.** The poison is worth 0.20 to the reference five on the roof
 * and **0.80** to the alternate; the two arrangements close 2.18 survivors apart. Every board here is
 * sized against the alternate, as the third and fourth hundreds' were.
 *
 * ⚠️ **Inert or refused at band 5, measured against the hundred's own controls** (monster-ref
 * 1150/62 behind four 540/40 reading 3.90; monster-alt 980/55 behind four 470/36 reading 3.85, both
 * at floor 500 in Relic 40): `magicResist` 0.50 worth **0.00 / −0.07** — this crew deals no magical
 * damage, so a magic wall has nothing to answer, which reproduces the third hundred's reading two
 * bands up; `tenacity` 0.60 **0.00 / 0.02**; complete crit immunity — `critBlock` 0.30 with
 * `critDamageResist` 0.90 — **0.02 / −0.02**, because Σ0.22 of chance over Σ3.10 of amp across five
 * is an expected multiplier of 1.027; `physicalPierce` **flat from 0.40 to 1.00** at 0.90 / 0.85,
 * because Σ76 of `def` across five is fourth-lowest of the fourteen shipped arrangements and there is
 * nothing to open.
 *
 * ⚠️ **A stun is worth 0.00 at every scope but `enemy-all`, and then it is a cliff with nothing in
 * the middle.** At two carriers on duration 25: `enemy-lowest` 0.27, `enemy-front` 0.85,
 * `enemy-highest` 0.90, `enemy-row-front` 0.85 — every one of them exactly the plain damage the cast
 * carries — against **1.90 / 2.45** on `enemy-all`. By duration at one carrier it reads 0.00 at 15,
 * 0.00 at 25, 1.88 at 35 and a **wipe** at 50. **No band can be built on it.** ⚠️ **A dot's scope
 * table is not a stun's**: the same {@link BURN} reads **−0.10** on `enemy-row-back` — the eighth
 * reading on this tower of aim past the front rank leaving a board easier — 0.65 on `enemy-front`,
 * 0.82 on `enemy-lowest`, 0.90 on `enemy-row-front` and 1.02 wide.
 *
 * ## ⚠️ The retirement check is the harshest any hundred has run, and it confirmed the axis
 *
 * **Thirteen of the fourth hundred's anchors retire**, against the Angel fourth hundred's four —
 * and the claim has to name the floors, because all thirteen stand on floors 301–389 and are fine
 * there. Fielded alone behind four 300/18 commons at floor 500 in Relic 40: The Last Mercy (1520/91),
 * The Deepcut, The Doorstone, The Deadbolt and The Unanswered all read **0% for the alternate**, The
 * Unbitten 5%, The Unfaltering 13%, The Seedfather 57%. ⚠️ **The block that stands is the
 * heaviest in the hundred below**: the Bonefall Tyrant at **1550/96** reads 100% / 3.38 against
 * 100% / 2.70 where The Last Mercy at 1520/91 reads 0.00 and 0.00. Thirty health and five attack
 * apart, and what separates them is that three of the four blocks reading 0% carry a board-wide
 * {@link BURN} at the shipped power. **The retirement check priced the hundred's own axis before a
 * board was authored.**
 *
 * ⚠️ **The floor-400 board carried to floor 500 reads 100% / 1.75 against 0% / 0.00** — the
 * Crownworks collapse a sixth time, and the alternate again.
 *
 * ## ⚠️ What the hundred carries, stated as counts
 *
 * Of the **42 distinct blocks** it fields over floors 401–500, **zero** carry `lifeLeech`,
 * `recovery` or `healthRegen`, and zero field a heal, a drain, a shield, a `regen`, a taunt, a link
 * or a reflect. ⚠️ **That absolute was false on the first pass and the fix was the boards**: the
 * Ashen Choir carried `recovery` 4 and a barrier on four floors, the Ebbdrift Latcher `lifeLeech`
 * 0.12 on two, and the Passbell Ringer applied a **link** on three — which this tower has forbidden
 * above floor 100 since it measured one, and which nothing in the sweep would ever have noticed
 * because the boards were tuned with them on. Nine slots, three swaps. **Run the check; expect to
 * fix content.**
 *
 * Board-wide voices run a mean of **1.24 with a hard ceiling of two**, against this tower's own third
 * and fourth hundreds' **1.69 and 1.05**; one ascended anchor a board and never two, which is this tower's
 * rule since floor 160 and survives a second rung of investment. Burn carriers per board run
 * **1 / 1–2 / 2 / 2–3 / 2** across the five bands — a range, not a constant.
 *
 * The hundred opens at floor 401 in 6.6 seconds with all five alive, costs the alternate a member
 * from floor 409 and the reference from floor 426, and closes at **100% / 2.98 / 19.5s against
 * 80% / 0.80 / 31.2s** — zero timeouts anywhere, longest single attempt **33.9s** against the 67.5s
 * bar, slowest mean 31.2s against the 60s bar. ⚠️ **Its longest fight is nine seconds shorter than
 * the fourth hundred's 47.8s**, which is the third consecutive hundred on this tower to close faster
 * than the one below — and the mechanism, rather than the trend, is that the boards get *lighter* as
 * the axis rises: floor 500 weighs **2,740** of health where floor 400 weighs 3,260 and floor 300
 * weighs 4,080.
 *
 * ## ⚠️ The sixth hundred is where "is it ours" came back _no_ for everything, its own plate included
 *
 * The fifth hundred found this crew ranked eighth to fourteenth of fourteen on thirteen stats and five
 * mechanics, with `physicalResist` the one exception at second and third. At band 6 that exception is
 * gone. **Forty candidates** — seventeen stats, twelve statuses and mechanics, a burst cadence at held
 * damage per second, a second `ascended` anchor, and the damage *type* the board deals — were priced
 * across all fourteen shipped arrangements, each crew calibrated in 2.5% steps to the heaviest control
 * it still reads ≥3.60 on. **monster-ref sits at ×0.725 and monster-alt at ×0.650, the third-lowest
 * and joint-lowest of the fourteen**, and the Monster fives rank **tenth to fourteenth on every
 * candidate** but the plate, where they are fifth and seventh — behind elf-alt 1.89 and dwarf-ref
 * 1.71, which is the Dwarf Tower's own sixth hundred, shipped one session earlier. ⚠️ **Fitting each
 * candidate's cost against how long a crew's fights already run moves them by at most one place**, so
 * the residual does not rescue it either: this is the Ironpace's finding arriving for the third time
 * on one tower, and the first time with nothing left over.
 *
 * ## ⚠️ The axis is enemy **health at held attack**, and the licence is affordability
 *
 * Every hundred before this one attacked the trade at its **input**: the second by asking more
 * questions than a leech crew has answers, the third and fifth with armour the jaws do not open, the
 * fourth with evasion on top of it, the fifth again with a poison billing the seconds the plate
 * bought. All five reduce the damage this crew *deals*, and `lifeLeech` off damage dealt is starved by
 * every one of them. This one attacks the trade's **duration** — a pool the jaws cannot finish — and
 * it is the first escalation here that makes the boards heavier rather than lighter.
 *
 * Measured at floor 600 in Relic 100 against a control of **3.85 / 3.70 at 13.3s / 15.5s**, escort
 * health walked at held attack, forty seeds, **zero timeouts on every row and a 100% win rate
 * throughout**:
 *
 * ```
 *   escort health  ×1.0 ×1.3 ×1.6 ×1.9 ×2.2 ×2.5 ×2.8 ×3.1 ×3.4
 *   reference      3.95 3.13 3.00 2.95 2.27 2.00 1.93 1.85 1.25
 *   alternate      3.70 3.17 3.00 2.70 2.23 2.00 2.00 1.88 1.18
 *   alt fight       16s  18s  21s  24s  28s  33s  37s  42s  49s
 * ```
 *
 * ⚠️ **Nine monotone steps in value _and_ five in carrier count**, which is what a six-band hundred
 * needs: at ×2.2 the walk across zero to four carriers reads **3.83 / 3.00 / 2.98 / 2.65 / 2.23** and
 * **3.73 / 3.00 / 2.98 / 2.50 / 2.02**. The timeout count is what tells this apart from the
 * ninety-second clock wearing a stat block, and it is checked rather than inferred — a wipe and a
 * timeout are the same `defeat`.
 *
 * ⚠️ **The seconds are the price and they are the whole licence.** Of the ten arrangements that
 * out-rank the Monster fives on this axis, **dwarf-alt runs 58.1s, angel-alt 54.5s, dwarf-ref 53.1s
 * and angel-ref 39.4s** at the same grade — against a 60-second mean bar and a 67.5-second
 * longest-cleared one. The crews the axis belongs to are the crews whose towers cannot author it; the
 * Monster fives pay **27.6s and 30.9s**. That is the Demon fifth hundred's affordability licence, and
 * this is the first time it has licensed a *weight* axis — which is this tower's own fourth-hundred
 * warning, that weight axes belong to whichever crew is slowest, answered rather than ignored.
 *
 * ⚠️ **On a health axis the `tank` archetype switches the axis off.** Held at an identical stat line
 * on one board, all-`tank` reads **3.00 of five** and all-`support` 2.90 against all-`brawler` 2.10,
 * all-`mage` 2.10 and all-`ranger` **2.00** — `GEAR_PROFILES` pays a tank +46% attack at Relic 100 and
 * a ranger +112%, and a pool with nothing billing it is a long fight rather than a hard one. **Not one
 * carrier in this hundred wears `tank`.** That is the third hundred running to find the gear
 * allocation worth more than a step of its own axis.
 *
 * ⚠️ **A health carrier bills what is _aimed at_, which is a fourth distinct answer to the rank
 * question in four hundreds.** Carried on one body with the escort held, a fat escort is worth **3.02
 * of five in front against 3.63 behind** at ×1.8, 3.00 against 3.40 at ×2.4 and 2.98 against 3.05 at
 * ×3.0 — a spread of 0.61 → 0.40 → **0.07** that *shrinks* as the pool grows, where the Demon fifth
 * hundred's `dodge` spread grew 0.45 → 1.00 with its value. A dodge bills what is aimed at, an
 * `attackSpeed` what is left alive, a resist every blow that reaches the body — and a pool big enough
 * to soak the whole fight soaks it from either rank. **Carry the measurement, never the precedent.**
 *
 * ⚠️ **Disqualified rather than merely weak, each for a stated reason.** `magicResist` 0.60 is worth
 * **−0.04 / −0.12** — this crew deals nine physical damage effects and **zero** magical ones, which
 * reproduces the third and fifth hundreds' reading a third time. `tenacity` 0.80 is worth 0.15 /
 * **0.01**, complete crit **denial** 0.10 / 0.05 and `accuracy` **−0.05 / −0.07**, all against Σ0.00
 * registers: a stat the crew carries none of is a stat there is nothing to refuse. `physicalPierce`
 * 0.75 is worth 0.61 / 0.67, because Σ47,712 and Σ43,668 of `def` are the fourth- and third-lowest of
 * the fourteen and there is nothing to open; `magicPierce` **−0.06 / −0.03**, because a pierce never
 * touches a resist. `THORNMAIL` on all five is **−0.12 / −0.10** and an `OATHSHIELD` taunt **−0.20 /
 * −0.10**, both the wrong sign. A board-wide `STUN` ranks fourteenth and twelfth, `BLOODRISEN`
 * fourteenth and thirteenth, a board-wide `RALLY` thirteenth and fourteenth, a burst cadence at held
 * damage per second fourteenth and twelfth, and a second `ascended` anchor tenth and eleventh.
 * ⚠️ **The damage _type_ the board deals is the one candidate that is nearly theirs and still is
 * not**: a wholly magical board costs monster-alt **0.60, third of fourteen** behind angel-ref 0.77
 * and dwarf-alt 0.65, but the walk across zero to five casters spans only **0.52**, which is texture
 * rather than an axis. **An axis that grades on one crew is not the same thing as an axis that is
 * theirs, and neither is a mechanism that sounds right.**
 *
 * ## ⚠️ The retirement check retired the whole `ascended` roster, and the seconds say what killed each
 *
 * All seven of the fourth and fifth hundreds' `ascended` anchors read **0% for both arrangements** at
 * floor 600 behind four 300/18 commons — Tyrant, The Crown Wheel, The Platewright, Oathbreaker, The
 * Proof House, The Unquenched and The Turnaway. ⚠️ **But two of them read 100% there**: The Unquenched
 * at 1.02 survivors and The Turnaway at 1.80, both for the *reference* five only, and both fail the
 * alternate outright. Behind four 520/44 legendaries every one of the seven reads 0% for both. **The
 * floor-500 board carried to floor 600 reads 0% / 0%** — the Crownworks collapse a seventh time.
 * ⚠️ **"Retires" needs the floors it retires from**: {@link TYRANT} is one of the seven and still
 * anchors this hundred's opening band, where floor 501 is forty-seven levels below the roof, beside
 * {@link THE_REDMAW} and {@link THE_DEEPCUT} from the fourth hundred — and all three are gone by floor
 * 521. **No board above floor 520 carries an `ascended` block at all** until the roof.
 *
 * ## ⚠️ What the hundred carries, stated as counts
 *
 * Of the **36 distinct blocks** it fields over floors 501–600, **zero** carry `lifeLeech`, `recovery`
 * or `healthRegen`, and zero field a heal, a drain, a shield, a `regen`, a taunt, a link or a reflect —
 * the absolute the fifth hundred was the first able to make, held for a second hundred. ⚠️ **It was
 * checked before the boards were authored rather than after**, which is what the Angel fourth hundred's
 * finding asks for: eight otherwise obvious returning blocks were screened out for carrying one
 * (`FENLORD` and `RIMEPLATE` on `recovery`, `BRAMBLEHIDE_RAVENER`, `BLOODGORGE_HOUND`, `SLACKRUN_SIPPER`
 * and `EBBDRIFT_LATCHER` on `lifeLeech`, `QUENCHPIT_IRONHIDE` and `SCARBOUND_BELLOWER` on their kits).
 *
 * Bodies at a health-to-attack ratio of 20 or above run **0–1 / 0–2 / 1–3 / 3–4 / 3–4 / 4–5** across
 * the six bands, stated as counts because the ratio is on every block in the game rather than absent
 * from it — and measured against the register **before** these four joined it: median **13.2**, p90
 * **21.8**, ceiling **55.0** ({@link THE_NEVERMARK}) over 434 blocks, with the Monster faction's own
 * ceiling at {@link SHALEBED_CRAWLER}'s 45.8. The three carriers run 19.1, 24.2 and 29.2 — every one
 * **inside** the register — and the roof lands at **55.0**, exactly the game's own ceiling rather than
 * a step past it, which is the Elf third hundred's shape rather than the Monster third's.
 *
 * ⚠️ **The flat-spread ceiling is what this tower overshoots, and it did again.** Authored the obvious
 * way — the four new carriers and the cold texture the axis wants, nearly all Monster — the hundred came
 * out at **78.8% Monster** and took the tower to **22.69%** against a 25% bound. The named fix worked:
 * converting texture slots one at a time across every band, never an axis block and never an anchor,
 * leaves the hundred at **60.0% Monster** and the tower at **19.50%**, with all seven factions between
 * 9.97% and 19.50%. ⚠️ **Why it cannot go lower is worth recording**: the coldest bodies in the game are
 * Monster ({@link SHALEBED_CRAWLER} 45.8, {@link SCATTERSTONE_HOWLER} 35.7, {@link ROUGHCAST_GNAWER}
 * 34.6) where the next faction's coldest heavy body is {@link WEARWAY_GAUNT} at 23.9, so the closing
 * bands' texture is nearly forced. **When the axis's own texture belongs to one faction, the spread is
 * decided in the opening bands.**
 *
 * The hundred opens at floor 501 in 8.5 seconds with all five of the reference crew alive and the
 * alternate already down one, and closes at **100% / 2.33 / 20.2s against 85% / 0.88 / 35.2s** — zero timeouts
 * anywhere, worst reading 100% and 85%, longest single attempt **38.3s** against the 67.5s bar and
 * slowest mean **35.2s** against the 60s bar. ⚠️ **Its longest fight is four seconds longer than the
 * fifth hundred's 33.9s, which ends three consecutive hundreds of closing faster than the one below** —
 * and the mechanism rather than the trend is that this is the first hundred here whose axis is weight,
 * so the boards stop getting lighter: floor 600 weighs **5,246** common-equivalent where floor 500
 * weighs 3,848 and floor 400 weighs 4,378 — and floor 501, nineteen levels under floor 550 and forty-
 * seven under the roof, weighs **7,557**. ⚠️ **The hundred's own budget still falls, by a factor of
 * 1.44**; what does not fall is the comparison with the hundreds below it.
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
    // The Beaters' Line — Floors 121–140, levels 57–66 — three questions to a board, and the first boards that cannot be answered by picking the one you like first.
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
    // The Shutfast Line — Floors 246–270, levels 116–128 — three a board, and every faction the tower fields has brought the half of itself that wears armour.
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

    // -------------------------------------------------------------------------------------
    // The Sprung Plate — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — the hold's answer to a jaw was never a thicker plate. One body a board wearing a face that does not meet a blow square.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f301',
      name: 'Floor 301',
      enemies: {
        front: [TYRANT, SPRUNGPLATE_HAND],
        back: [GOLEM, SPENTRANK_HAND, GANTRY_WARDEN],
      },
    },
    {
      id: 't-monster-f302',
      name: 'Floor 302',
      enemies: {
        front: [THE_UNANSWERED, SPRUNGPLATE_HAND],
        back: [DROWNED_MAST, GRAVEMOURN_KEEPER, CENTURYBOUGH_WARDEN],
      },
    },
    {
      id: 't-monster-f303',
      name: 'Floor 303',
      enemies: {
        front: [THE_LAST_MERCY, SPRUNGPLATE_HAND],
        back: [CLOSEWARD_SERAPH, ANTIPHON_ARCHON, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-monster-f304',
      name: 'Floor 304',
      enemies: {
        front: [THE_DEEPCUT, SPRUNGPLATE_HAND],
        back: [GANTRY_WARDEN, SLAGBLOOM_THICKET, PANOPLY_BEARER],
      },
    },
    {
      id: 't-monster-f305',
      name: 'Floor 305',
      enemies: {
        front: [THE_REDMAW, SPRUNGPLATE_HAND],
        back: [CENTURYBOUGH_WARDEN, UNDERVAULT_SAPPER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f306',
      name: 'Floor 306',
      enemies: {
        front: [THE_DOORSTONE, SPRUNGPLATE_HAND],
        back: [THORNBACK_GRAZER, CINDERSEED_COURSER, GOLEM],
      },
    },
    {
      id: 't-monster-f307',
      name: 'Floor 307',
      enemies: {
        front: [TYRANT, SPRUNGPLATE_HAND],
        back: [PANOPLY_BEARER, NIGHTCANOPY_SINGER, DROWNED_MAST],
      },
    },
    {
      id: 't-monster-f308',
      name: 'Floor 308',
      enemies: {
        front: [THE_UNANSWERED, SPRUNGPLATE_HAND],
        back: [MUSTER_PIKE, SLAGHIDE_PURSUER, CLOSEWARD_SERAPH],
      },
    },
    {
      id: 't-monster-f309',
      name: 'Floor 309',
      enemies: {
        front: [THE_LAST_MERCY, SPRUNGPLATE_HAND],
        back: [GOLEM, SPENTRANK_HAND, GANTRY_WARDEN],
      },
    },
    {
      id: 't-monster-f310',
      name: 'Floor 310 — The Sprung Plate',
      enemies: {
        front: [THE_DEEPCUT, SPRUNGPLATE_HAND],
        back: [DROWNED_MAST, GRAVEMOURN_KEEPER, CENTURYBOUGH_WARDEN],
      },
    },
    {
      id: 't-monster-f311',
      name: 'Floor 311',
      enemies: {
        front: [THE_REDMAW, SPRUNGPLATE_HAND],
        back: [CLOSEWARD_SERAPH, ANTIPHON_ARCHON, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-monster-f312',
      name: 'Floor 312',
      enemies: {
        front: [THE_DOORSTONE, SPRUNGPLATE_HAND],
        back: [GANTRY_WARDEN, SLAGBLOOM_THICKET, PANOPLY_BEARER],
      },
    },
    {
      id: 't-monster-f313',
      name: 'Floor 313',
      enemies: {
        front: [TYRANT, SPRUNGPLATE_HAND],
        back: [CENTURYBOUGH_WARDEN, UNDERVAULT_SAPPER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f314',
      name: 'Floor 314',
      enemies: {
        front: [THE_UNANSWERED, SPRUNGPLATE_HAND],
        back: [THORNBACK_GRAZER, CINDERSEED_COURSER, GOLEM],
      },
    },
    {
      id: 't-monster-f315',
      name: 'Floor 315',
      enemies: {
        front: [THE_LAST_MERCY, SPRUNGPLATE_HAND],
        back: [PANOPLY_BEARER, NIGHTCANOPY_SINGER, DROWNED_MAST],
      },
    },
    {
      id: 't-monster-f316',
      name: 'Floor 316',
      enemies: {
        front: [THE_DEEPCUT, SPRUNGPLATE_HAND],
        back: [MUSTER_PIKE, SLAGHIDE_PURSUER, CLOSEWARD_SERAPH],
      },
    },
    {
      id: 't-monster-f317',
      name: 'Floor 317',
      enemies: {
        front: [THE_REDMAW, SPRUNGPLATE_HAND],
        back: [GOLEM, SPENTRANK_HAND, GANTRY_WARDEN],
      },
    },
    {
      id: 't-monster-f318',
      name: 'Floor 318',
      enemies: {
        front: [THE_DOORSTONE, SPRUNGPLATE_HAND],
        back: [DROWNED_MAST, GRAVEMOURN_KEEPER, CENTURYBOUGH_WARDEN],
      },
    },
    {
      id: 't-monster-f319',
      name: 'Floor 319',
      enemies: {
        front: [TYRANT, SPRUNGPLATE_HAND],
        back: [CLOSEWARD_SERAPH, ANTIPHON_ARCHON, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-monster-f320',
      name: 'Floor 320 — The Glancing Ranks',
      enemies: {
        front: [THE_UNANSWERED, SPRUNGPLATE_HAND],
        back: [GANTRY_WARDEN, SLAGBLOOM_THICKET, PANOPLY_BEARER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Glancing Ranks — Floors 321–345, levels 152–163, Sturdy 5–Sturdy 34 — two, and the first boards where what is missed is missed twice.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f321',
      name: 'Floor 321',
      enemies: {
        front: [THE_SEEDFATHER, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, PLATEBOUND_HUSK, FORLORN_LEVY],
      },
    },
    {
      id: 't-monster-f322',
      name: 'Floor 322',
      enemies: {
        front: [THE_EDGEWRIGHT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SCALEPLATE_BRAMBLE, CINDER_CULLER],
      },
    },
    {
      id: 't-monster-f323',
      name: 'Floor 323',
      enemies: {
        front: [THE_BREACHLORD, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, THORNBACK_GRAZER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f324',
      name: 'Floor 324',
      enemies: {
        front: [THE_UNBITTEN, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SLAGHIDE_PURSUER, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f325',
      name: 'Floor 325',
      enemies: {
        front: [THE_UNFALTERING, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, DROWNED_MAST, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f326',
      name: 'Floor 326',
      enemies: {
        front: [THE_DEADBOLT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, CLOSEWARD_SERAPH, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-monster-f327',
      name: 'Floor 327',
      enemies: {
        front: [THE_SEEDFATHER, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, GOLEM, MIREWHELP],
      },
    },
    {
      id: 't-monster-f328',
      name: 'Floor 328',
      enemies: {
        front: [THE_EDGEWRIGHT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SPENTRANK_HAND, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f329',
      name: 'Floor 329',
      enemies: {
        front: [THE_BREACHLORD, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, PLATEBOUND_HUSK, FORLORN_LEVY],
      },
    },
    {
      id: 't-monster-f330',
      name: 'Floor 330 — The Angled Face',
      enemies: {
        front: [THE_UNBITTEN, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SCALEPLATE_BRAMBLE, CINDER_CULLER],
      },
    },
    {
      id: 't-monster-f331',
      name: 'Floor 331',
      enemies: {
        front: [THE_UNFALTERING, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, THORNBACK_GRAZER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f332',
      name: 'Floor 332',
      enemies: {
        front: [THE_DEADBOLT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SLAGHIDE_PURSUER, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f333',
      name: 'Floor 333',
      enemies: {
        front: [THE_SEEDFATHER, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, DROWNED_MAST, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f334',
      name: 'Floor 334',
      enemies: {
        front: [THE_EDGEWRIGHT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, CLOSEWARD_SERAPH, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-monster-f335',
      name: 'Floor 335',
      enemies: {
        front: [THE_BREACHLORD, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, GOLEM, MIREWHELP],
      },
    },
    {
      id: 't-monster-f336',
      name: 'Floor 336',
      enemies: {
        front: [THE_UNBITTEN, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SPENTRANK_HAND, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f337',
      name: 'Floor 337',
      enemies: {
        front: [THE_UNFALTERING, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, PLATEBOUND_HUSK, FORLORN_LEVY],
      },
    },
    {
      id: 't-monster-f338',
      name: 'Floor 338',
      enemies: {
        front: [THE_DEADBOLT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SCALEPLATE_BRAMBLE, CINDER_CULLER],
      },
    },
    {
      id: 't-monster-f339',
      name: 'Floor 339',
      enemies: {
        front: [THE_SEEDFATHER, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, THORNBACK_GRAZER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f340',
      name: 'Floor 340 — The Slipfast Line',
      enemies: {
        front: [THE_EDGEWRIGHT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SLAGHIDE_PURSUER, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f341',
      name: 'Floor 341',
      enemies: {
        front: [THE_BREACHLORD, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, DROWNED_MAST, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f342',
      name: 'Floor 342',
      enemies: {
        front: [THE_UNBITTEN, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, CLOSEWARD_SERAPH, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-monster-f343',
      name: 'Floor 343',
      enemies: {
        front: [THE_UNFALTERING, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, GOLEM, MIREWHELP],
      },
    },
    {
      id: 't-monster-f344',
      name: 'Floor 344',
      enemies: {
        front: [THE_DEADBOLT, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, SPENTRANK_HAND, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-monster-f345',
      name: 'Floor 345',
      enemies: {
        front: [THE_SEEDFATHER, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, PLATEBOUND_HUSK, FORLORN_LEVY],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Slipfast Line — Floors 346–370, levels 163–175, Sturdy 35–Fine 24 — two or three to a board, the third rationed to alternate floors. The plate steps and the evasion steps with it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f346',
      name: 'Floor 346',
      enemies: {
        front: [THE_PLATEWRIGHT, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f347',
      name: 'Floor 347',
      enemies: {
        front: [OATHBREAKER, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, FORLORN_LEVY, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f348',
      name: 'Floor 348',
      enemies: {
        front: [THE_PROOF_HOUSE, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f349',
      name: 'Floor 349',
      enemies: {
        front: [THE_BREACHLORD, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, MIREWHELP, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f350',
      name: 'Floor 350 — The Slip',
      enemies: {
        front: [THE_CROWN_WHEEL, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f351',
      name: 'Floor 351',
      enemies: {
        front: [THE_PANOPLY, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, LITANY_BEARER, THORNPLATE_WEARER],
      },
    },
    {
      id: 't-monster-f352',
      name: 'Floor 352',
      enemies: {
        front: [THE_PLATEWRIGHT, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f353',
      name: 'Floor 353',
      enemies: {
        front: [OATHBREAKER, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, FORLORN_LEVY, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f354',
      name: 'Floor 354',
      enemies: {
        front: [THE_PROOF_HOUSE, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f355',
      name: 'Floor 355',
      enemies: {
        front: [THE_BREACHLORD, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, MIREWHELP, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f356',
      name: 'Floor 356',
      enemies: {
        front: [THE_CROWN_WHEEL, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f357',
      name: 'Floor 357',
      enemies: {
        front: [THE_PANOPLY, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, LITANY_BEARER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f358',
      name: 'Floor 358',
      enemies: {
        front: [THE_PLATEWRIGHT, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f359',
      name: 'Floor 359',
      enemies: {
        front: [OATHBREAKER, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, FORLORN_LEVY, THORNPLATE_WEARER],
      },
    },
    {
      id: 't-monster-f360',
      name: 'Floor 360 — The Turned Shoulder',
      enemies: {
        front: [THE_PROOF_HOUSE, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f361',
      name: 'Floor 361',
      enemies: {
        front: [THE_BREACHLORD, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, MIREWHELP, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f362',
      name: 'Floor 362',
      enemies: {
        front: [THE_CROWN_WHEEL, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f363',
      name: 'Floor 363',
      enemies: {
        front: [THE_PANOPLY, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, LITANY_BEARER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f364',
      name: 'Floor 364',
      enemies: {
        front: [THE_PLATEWRIGHT, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f365',
      name: 'Floor 365',
      enemies: {
        front: [OATHBREAKER, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, FORLORN_LEVY, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-monster-f366',
      name: 'Floor 366',
      enemies: {
        front: [THE_PROOF_HOUSE, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f367',
      name: 'Floor 367',
      enemies: {
        front: [THE_BREACHLORD, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, MIREWHELP, THORNPLATE_WEARER],
      },
    },
    {
      id: 't-monster-f368',
      name: 'Floor 368',
      enemies: {
        front: [THE_CROWN_WHEEL, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f369',
      name: 'Floor 369',
      enemies: {
        front: [THE_PANOPLY, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, LITANY_BEARER, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f370',
      name: 'Floor 370 — The Turned Jaw',
      enemies: {
        front: [THE_PLATEWRIGHT, SLIPFAST_IRONSIDE],
        back: [GLANCEWORK_SMITH, SPRUNGPLATE_HAND, PASSBELL_RINGER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Turned Jaw — Floors 371–390, levels 175–184, Fine 25–Fine 48 — the anchors come down as the levels go up, and what is left on the board is almost all of it wearing both.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f371',
      name: 'Floor 371',
      enemies: {
        front: [THE_PLATEWRIGHT, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, FORLORN_LEVY, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f372',
      name: 'Floor 372',
      enemies: {
        front: [THE_CROWN_WHEEL, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f373',
      name: 'Floor 373',
      enemies: {
        front: [OATHBREAKER, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, MIREWHELP, THORNLING],
      },
    },
    {
      id: 't-monster-f374',
      name: 'Floor 374',
      enemies: {
        front: [THE_PANOPLY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, MIREWHELP],
      },
    },
    {
      id: 't-monster-f375',
      name: 'Floor 375',
      enemies: {
        front: [THE_PROOF_HOUSE, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, LITANY_BEARER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f376',
      name: 'Floor 376',
      enemies: {
        front: [THE_PLATEWRIGHT, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f377',
      name: 'Floor 377',
      enemies: {
        front: [THE_CROWN_WHEEL, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, FORLORN_LEVY, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f378',
      name: 'Floor 378',
      enemies: {
        front: [OATHBREAKER, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f379',
      name: 'Floor 379',
      enemies: {
        front: [THE_PANOPLY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, MIREWHELP, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f380',
      name: 'Floor 380 — The Blow Goes Wide',
      enemies: {
        front: [THE_PROOF_HOUSE, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f381',
      name: 'Floor 381',
      enemies: {
        front: [THE_PLATEWRIGHT, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, LITANY_BEARER, THORNLING],
      },
    },
    {
      id: 't-monster-f382',
      name: 'Floor 382',
      enemies: {
        front: [THE_CROWN_WHEEL, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, MIREWHELP],
      },
    },
    {
      id: 't-monster-f383',
      name: 'Floor 383',
      enemies: {
        front: [OATHBREAKER, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, FORLORN_LEVY, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f384',
      name: 'Floor 384',
      enemies: {
        front: [THE_PANOPLY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f385',
      name: 'Floor 385',
      enemies: {
        front: [THE_PROOF_HOUSE, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, MIREWHELP, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f386',
      name: 'Floor 386',
      enemies: {
        front: [THE_PLATEWRIGHT, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f387',
      name: 'Floor 387',
      enemies: {
        front: [THE_CROWN_WHEEL, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, LITANY_BEARER, TALLOWLIGHT_RUNNER],
      },
    },
    {
      id: 't-monster-f388',
      name: 'Floor 388',
      enemies: {
        front: [OATHBREAKER, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f389',
      name: 'Floor 389',
      enemies: {
        front: [THE_PANOPLY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, LITANY_BEARER, THORNLING],
      },
    },
    {
      id: 't-monster-f390',
      name: 'Floor 390 — Nothing Lands',
      enemies: {
        front: [THE_PROOF_HOUSE, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SPRUNGPLATE_HAND, MIREWHELP],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Turning — Floors 391–400, levels 185–189, Fine 49–Fine 60 — the lightest roof in the game standing in front of the last eight floors. Two or three to a board, and the roof's own pair is the only time two of them share a front rank.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f391',
      name: 'Floor 391',
      enemies: {
        front: [THE_PLATEWRIGHT, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, CHALKHIDE_BROWSER, THORNLING],
      },
    },
    {
      id: 't-monster-f392',
      name: 'Floor 392',
      enemies: {
        front: [THE_CROWN_WHEEL, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SLOWGROWTH_BOLE, MIREWHELP],
      },
    },
    {
      id: 't-monster-f393',
      name: 'Floor 393',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, THORNBACK_GRAZER, CARRION_SWARM],
      },
    },
    {
      id: 't-monster-f394',
      name: 'Floor 394',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, GOLEM, PASSBELL_RINGER],
      },
    },
    {
      id: 't-monster-f395',
      name: 'Floor 395',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, CHALKHIDE_BROWSER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f396',
      name: 'Floor 396',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SLIPFAST_IRONSIDE, SLOWGROWTH_BOLE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f397',
      name: 'Floor 397',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, THORNBACK_GRAZER, THORNLING],
      },
    },
    {
      id: 't-monster-f398',
      name: 'Floor 398',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, GOLEM, MIREWHELP],
      },
    },
    {
      id: 't-monster-f399',
      name: 'Floor 399',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [SPRUNGPLATE_HAND, THORNLING, MIREWHELP],
      },
    },
    {
      id: 't-monster-f400',
      name: 'Floor 400 — The Turnaway',
      enemies: {
        front: [THE_TURNAWAY, GLANCEWORK_SMITH],
        back: [GOLEM, THORNLING, MIREWHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Censing — Floors 401–420, levels 189–198, Masterwork 1–24 — the field stops trying to stop the jaws and starts making the ground cost them. One censer a board, on the narrowest scope this hundred authors.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f401',
      name: 'Floor 401',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, GOLEM, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f402',
      name: 'Floor 402',
      enemies: {
        front: [THE_CROWN_WHEEL, THURIBLE_ORDINAL],
        back: [GRAVESTRIDE_SERJEANT, THORNBACK_GRAZER, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f403',
      name: 'Floor 403',
      enemies: {
        front: [OATHBREAKER, THURIBLE_ORDINAL],
        back: [CLOSEWARD_SERAPH, CHALKHIDE_BROWSER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f404',
      name: 'Floor 404',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [SILENTVAULT_KEEPER, SLOWGROWTH_BOLE, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f405',
      name: 'Floor 405',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [CINDERFLAW_PROVER, MUSTER_PIKE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f406',
      name: 'Floor 406',
      enemies: {
        front: [THE_TURNAWAY, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, PANOPLY_BEARER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f407',
      name: 'Floor 407',
      enemies: {
        front: [THE_CROWN_WHEEL, THURIBLE_ORDINAL],
        back: [SLAGHIDE_PURSUER, SCALEPLATE_BRAMBLE, LASTFEW_WARDEN],
      },
    },
    {
      id: 't-monster-f408',
      name: 'Floor 408',
      enemies: {
        front: [OATHBREAKER, THURIBLE_ORDINAL],
        back: [GRAVESTRIDE_SERJEANT, PLATEBOUND_HUSK, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f409',
      name: 'Floor 409',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, CHALKHIDE_BROWSER, STEPFALL_STANDARD],
      },
    },
    {
      id: 't-monster-f410',
      name: 'Floor 410 — The First Censer',
      enemies: {
        front: [TYRANT, THURIBLE_ORDINAL],
        back: [CLOSEWARD_SERAPH, GILDED_SENTRY, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f411',
      name: 'Floor 411',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [GRAVESTRIDE_SERJEANT, SLOWGROWTH_BOLE, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f412',
      name: 'Floor 412',
      enemies: {
        front: [THE_CROWN_WHEEL, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, THORNBACK_GRAZER, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f413',
      name: 'Floor 413',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [SILENTVAULT_KEEPER, MUSTER_PIKE, CINDERFLAW_PROVER],
      },
    },
    {
      id: 't-monster-f414',
      name: 'Floor 414',
      enemies: {
        front: [OATHBREAKER, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, CHALKHIDE_BROWSER, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f415',
      name: 'Floor 415',
      enemies: {
        front: [THE_TURNAWAY, THURIBLE_ORDINAL],
        back: [GRAVESTRIDE_SERJEANT, PANOPLY_BEARER, LASTFEW_WARDEN],
      },
    },
    {
      id: 't-monster-f416',
      name: 'Floor 416',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [CLOSEWARD_SERAPH, SCALEPLATE_BRAMBLE, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-monster-f417',
      name: 'Floor 417',
      enemies: {
        front: [THE_CROWN_WHEEL, THURIBLE_ORDINAL],
        back: [SILENTVAULT_KEEPER, SLOWGROWTH_BOLE, SLAGHIDE_PURSUER],
      },
    },
    {
      id: 't-monster-f418',
      name: 'Floor 418',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, PLATEBOUND_HUSK, CINDERFLAW_PROVER],
      },
    },
    {
      id: 't-monster-f419',
      name: 'Floor 419',
      enemies: {
        front: [OATHBREAKER, THURIBLE_ORDINAL],
        back: [GRAVESTRIDE_SERJEANT, THORNBACK_GRAZER, STEPFALL_STANDARD],
      },
    },
    {
      id: 't-monster-f420',
      name: 'Floor 420 — The Smoke Goes First',
      enemies: {
        front: [TYRANT, THURIBLE_ORDINAL],
        back: [PANOPLY_BEARER, GRAVESTRIDE_SERJEANT, LASTFEW_WARDEN],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Slow Lamps — Floors 421–445, levels 199–210, Masterwork 25–54 — the oil goes down. One board-wide voice a board and never two, because two read 0% for the alternate.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f421',
      name: 'Floor 421',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PANOPLY_BEARER, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f422',
      name: 'Floor 422',
      enemies: {
        front: [THE_CROWN_WHEEL, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, SLOWGROWTH_BOLE, GILDED_SENTRY],
      },
    },
    {
      id: 't-monster-f423',
      name: 'Floor 423',
      enemies: {
        front: [OATHBREAKER, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, MUSTER_PIKE, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f424',
      name: 'Floor 424',
      enemies: {
        front: [THE_PROOF_HOUSE, CLOSEWARD_SERAPH],
        back: [LAMPOIL_SACRIST, MUSTER_PIKE, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f425',
      name: 'Floor 425',
      enemies: {
        front: [THE_TURNAWAY, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, WEARWAY_GAUNT, SLAGHIDE_PURSUER],
      },
    },
    {
      id: 't-monster-f426',
      name: 'Floor 426',
      enemies: {
        front: [THE_PLATEWRIGHT, PANOPLY_BEARER],
        back: [LAMPOIL_SACRIST, THORNBACK_GRAZER, STEPFALL_STANDARD],
      },
    },
    {
      id: 't-monster-f427',
      name: 'Floor 427',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PLATEBOUND_HUSK, GILDED_SENTRY],
      },
    },
    {
      id: 't-monster-f428',
      name: 'Floor 428',
      enemies: {
        front: [OATHBREAKER, SILENTVAULT_KEEPER],
        back: [LAMPOIL_SACRIST, SCALEPLATE_BRAMBLE, SLAGHIDE_PURSUER],
      },
    },
    {
      id: 't-monster-f429',
      name: 'Floor 429',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PANOPLY_BEARER, LASTFEW_WARDEN],
      },
    },
    {
      id: 't-monster-f430',
      name: 'Floor 430 — The Oil Is Poured',
      enemies: {
        front: [TYRANT, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PANOPLY_BEARER, STEPFALL_STANDARD],
      },
    },
    {
      id: 't-monster-f431',
      name: 'Floor 431',
      enemies: {
        front: [THE_PLATEWRIGHT, GRAVESTRIDE_SERJEANT],
        back: [LAMPOIL_SACRIST, SLOWGROWTH_BOLE, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f432',
      name: 'Floor 432',
      enemies: {
        front: [THE_CROWN_WHEEL, CLOSEWARD_SERAPH],
        back: [LAMPOIL_SACRIST, WALKED_GROUND_DEAD, GILDED_SENTRY],
      },
    },
    {
      id: 't-monster-f433',
      name: 'Floor 433',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, MUSTER_PIKE, CINDERFLAW_PROVER],
      },
    },
    {
      id: 't-monster-f434',
      name: 'Floor 434',
      enemies: {
        front: [THE_PROOF_HOUSE, SILENTVAULT_KEEPER],
        back: [LAMPOIL_SACRIST, THORNBACK_GRAZER, LASTFEW_WARDEN],
      },
    },
    {
      id: 't-monster-f435',
      name: 'Floor 435',
      enemies: {
        front: [THE_TURNAWAY, PANOPLY_BEARER],
        back: [LAMPOIL_SACRIST, SLOWGROWTH_BOLE, SLAGHIDE_PURSUER],
      },
    },
    {
      id: 't-monster-f436',
      name: 'Floor 436',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PLATEBOUND_HUSK, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-monster-f437',
      name: 'Floor 437',
      enemies: {
        front: [THE_PROOF_HOUSE, GRAVESTRIDE_SERJEANT],
        back: [LAMPOIL_SACRIST, SCALEPLATE_BRAMBLE, RADIANT_HERALD],
      },
    },
    {
      id: 't-monster-f438',
      name: 'Floor 438',
      enemies: {
        front: [OATHBREAKER, PANOPLY_BEARER],
        back: [LAMPOIL_SACRIST, CAIRNWARD_HUSK, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f439',
      name: 'Floor 439',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, PANOPLY_BEARER, CINDERFLAW_PROVER],
      },
    },
    {
      id: 't-monster-f440',
      name: 'Floor 440 — The Slow Lamps',
      enemies: {
        front: [TYRANT, CLOSEWARD_SERAPH],
        back: [LAMPOIL_SACRIST, GRAVESTRIDE_SERJEANT, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-monster-f441',
      name: 'Floor 441',
      enemies: {
        front: [THE_PLATEWRIGHT, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, SLOWGROWTH_BOLE, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-monster-f442',
      name: 'Floor 442',
      enemies: {
        front: [THE_CROWN_WHEEL, SILENTVAULT_KEEPER],
        back: [LAMPOIL_SACRIST, THORNBACK_GRAZER, SLAGHIDE_PURSUER],
      },
    },
    {
      id: 't-monster-f443',
      name: 'Floor 443',
      enemies: {
        front: [OATHBREAKER, PANOPLY_BEARER],
        back: [LAMPOIL_SACRIST, MUSTER_PIKE, STEPFALL_STANDARD],
      },
    },
    {
      id: 't-monster-f444',
      name: 'Floor 444',
      enemies: {
        front: [THE_PROOF_HOUSE, THURIBLE_ORDINAL],
        back: [LAMPOIL_SACRIST, THORNBACK_GRAZER, CINDERFLAW_PROVER],
      },
    },
    {
      id: 't-monster-f445',
      name: 'Floor 445',
      enemies: {
        front: [THE_TURNAWAY, GRAVESTRIDE_SERJEANT],
        back: [LAMPOIL_SACRIST, WEARWAY_GAUNT, LASTFEW_WARDEN],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Oiled Ground — Floors 446–467, levels 210–220, Masterwork 55–80 — two carriers, and the first boards where the plate and the fire stand on one body. The weight comes *down* as the axis rises; that is the escalation rather than a discount on it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f446',
      name: 'Floor 446',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, MILEWORN_HUSK, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f447',
      name: 'Floor 447',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f448',
      name: 'Floor 448',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f449',
      name: 'Floor 449',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, LAMPLESS_PILGRIM, THORNLING],
      },
    },
    {
      id: 't-monster-f450',
      name: 'Floor 450 — The Ground Takes It',
      enemies: {
        front: [EMBERVAULT_KEEPER, TYRANT],
        back: [LAMPOIL_SACRIST, GRAVEFURROW_WALKER, THORNLING],
      },
    },
    {
      id: 't-monster-f451',
      name: 'Floor 451',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, GILDED_SENTRY, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f452',
      name: 'Floor 452',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f453',
      name: 'Floor 453',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, CHAFFMOUTH_GAUNT],
      },
    },
    {
      id: 't-monster-f454',
      name: 'Floor 454',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, MILEWORN_HUSK, THORNLING],
      },
    },
    {
      id: 't-monster-f455',
      name: 'Floor 455',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f456',
      name: 'Floor 456',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, GILDED_SENTRY, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f457',
      name: 'Floor 457',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, LAMPLESS_PILGRIM, THORNLING],
      },
    },
    {
      id: 't-monster-f458',
      name: 'Floor 458',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f459',
      name: 'Floor 459',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f460',
      name: 'Floor 460 — Nothing Here Is Wet',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, GILDED_SENTRY, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f461',
      name: 'Floor 461',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, MILEWORN_HUSK, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f462',
      name: 'Floor 462',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f463',
      name: 'Floor 463',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, CHAFFMOUTH_GAUNT],
      },
    },
    {
      id: 't-monster-f464',
      name: 'Floor 464',
      enemies: {
        front: [EMBERVAULT_KEEPER, OATHBREAKER],
        back: [LAMPOIL_SACRIST, GILDED_SENTRY, THORNLING],
      },
    },
    {
      id: 't-monster-f465',
      name: 'Floor 465',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f466',
      name: 'Floor 466',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f467',
      name: 'Floor 467',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, THORNLING],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Long Burn — Floors 468–490, levels 221–231, Relic 2–28 — aligned to the grade boundary, which steps the effective bonus down from +108% to +25.8%, so the band opens heavier and then falls further than any before it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f468',
      name: 'Floor 468',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, GILDED_SENTRY],
      },
    },
    {
      id: 't-monster-f469',
      name: 'Floor 469',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f470',
      name: 'Floor 470 — It Has Not Gone Out',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, THORNLING],
      },
    },
    {
      id: 't-monster-f471',
      name: 'Floor 471',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-monster-f472',
      name: 'Floor 472',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f473',
      name: 'Floor 473',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, MILEWORN_HUSK],
      },
    },
    {
      id: 't-monster-f474',
      name: 'Floor 474',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f475',
      name: 'Floor 475',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f476',
      name: 'Floor 476',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f477',
      name: 'Floor 477',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f478',
      name: 'Floor 478',
      enemies: {
        front: [EMBERVAULT_KEEPER, OATHBREAKER],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f479',
      name: 'Floor 479',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f480',
      name: 'Floor 480 — The Long Burn',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, GRAVEFURROW_WALKER],
      },
    },
    {
      id: 't-monster-f481',
      name: 'Floor 481',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, CHAFFMOUTH_GAUNT],
      },
    },
    {
      id: 't-monster-f482',
      name: 'Floor 482',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_CROWN_WHEEL],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f483',
      name: 'Floor 483',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f484',
      name: 'Floor 484',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PROOF_HOUSE],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f485',
      name: 'Floor 485',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-monster-f486',
      name: 'Floor 486',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_PLATEWRIGHT],
        back: [LAMPOIL_SACRIST, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f487',
      name: 'Floor 487',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, GLADE_STALKER],
      },
    },
    {
      id: 't-monster-f488',
      name: 'Floor 488',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, THURIBLE_ORDINAL, THORNLING],
      },
    },
    {
      id: 't-monster-f489',
      name: 'Floor 489',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f490',
      name: 'Floor 490 — Everything Is Oiled',
      enemies: {
        front: [EMBERVAULT_KEEPER, THE_TURNAWAY],
        back: [LAMPOIL_SACRIST, UNDERROAD_RANKER, THORNLING],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Unquenched — Floors 491–500, levels 232–236, Relic 29–40 — the roof's own board-wide burn is the only one the last ten floors carry. The censer never stands beside it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f491',
      name: 'Floor 491',
      enemies: {
        front: [THE_UNQUENCHED, GILDED_SENTRY],
        back: [THURIBLE_ORDINAL, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f492',
      name: 'Floor 492',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [VAULTLIGHT_CENSER, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f493',
      name: 'Floor 493',
      enemies: {
        front: [THE_UNQUENCHED, GILDED_SENTRY],
        back: [THURIBLE_ORDINAL, VAULTLIGHT_CENSER, THORNLING],
      },
    },
    {
      id: 't-monster-f494',
      name: 'Floor 494',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [LUMEN_ACOLYTE, THORNLING, SHEAFLESS_SHADE],
      },
    },
    {
      id: 't-monster-f495',
      name: 'Floor 495',
      enemies: {
        front: [THE_UNQUENCHED, GILDED_SENTRY],
        back: [THURIBLE_ORDINAL, GRAVEFURROW_WALKER, THORNLING],
      },
    },
    {
      id: 't-monster-f496',
      name: 'Floor 496',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [VAULTLIGHT_CENSER, GRAVEFURROW_WALKER, THORNLING],
      },
    },
    {
      id: 't-monster-f497',
      name: 'Floor 497',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [VAULTLIGHT_CENSER, LUMEN_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-monster-f498',
      name: 'Floor 498',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [VAULTLIGHT_CENSER, THORNLING, SHEAFLESS_SHADE],
      },
    },
    {
      id: 't-monster-f499',
      name: 'Floor 499',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [LUMEN_ACOLYTE, THORNLING, SHEAFLESS_SHADE],
      },
    },
    {
      id: 't-monster-f500',
      name: 'Floor 500 — The Unquenched',
      enemies: {
        front: [THE_UNQUENCHED, THURIBLE_ORDINAL],
        back: [VAULTLIGHT_CENSER, UNDERROAD_RANKER, THORNLING],
      },
    }, // -------------------------------------------------------------------------------------
    // The Fatted Ground — Floors 501–520, levels 236–245, Relic 41–52 — the last of the old anchors, and behind each of them one body the jaws close on and do not close through. One carrier a board, and the only band in the hundred whose weight is still in front of it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f501',
      name: 'Floor 501',
      enemies: {
        front: [THE_REDMAW, PANOPLY_BEARER],
        back: [CENTURYBOUGH_WARDEN, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f502',
      name: 'Floor 502',
      enemies: {
        front: [TYRANT, GRAVESTRIDE_SERJEANT],
        back: [CLOSEWARD_SERAPH, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f503',
      name: 'Floor 503',
      enemies: {
        front: [THE_DEEPCUT, PLATEBOUND_HUSK],
        back: [SLAGHIDE_PURSUER, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f504',
      name: 'Floor 504',
      enemies: {
        front: [THE_REDMAW, GANTRY_WARDEN],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f505',
      name: 'Floor 505',
      enemies: {
        front: [TYRANT, DROWNED_MAST],
        back: [SPENTRANK_HAND, SLAGBLOOM_THICKET, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f506',
      name: 'Floor 506',
      enemies: {
        front: [THE_REDMAW, PANOPLY_BEARER],
        back: [CENTURYBOUGH_WARDEN, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f507',
      name: 'Floor 507',
      enemies: {
        front: [TYRANT, GRAVESTRIDE_SERJEANT],
        back: [CLOSEWARD_SERAPH, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f508',
      name: 'Floor 508',
      enemies: {
        front: [THE_DEEPCUT, PLATEBOUND_HUSK],
        back: [SLAGHIDE_PURSUER, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f509',
      name: 'Floor 509',
      enemies: {
        front: [THE_REDMAW, GANTRY_WARDEN],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f510',
      name: 'Floor 510 — The Fatted Ground',
      enemies: {
        front: [TYRANT, DROWNED_MAST],
        back: [SPENTRANK_HAND, SLAGBLOOM_THICKET, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f511',
      name: 'Floor 511',
      enemies: {
        front: [THE_REDMAW, PANOPLY_BEARER],
        back: [CENTURYBOUGH_WARDEN, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f512',
      name: 'Floor 512',
      enemies: {
        front: [TYRANT, GRAVESTRIDE_SERJEANT],
        back: [CLOSEWARD_SERAPH, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f513',
      name: 'Floor 513',
      enemies: {
        front: [THE_DEEPCUT, PLATEBOUND_HUSK],
        back: [SLAGHIDE_PURSUER, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f514',
      name: 'Floor 514',
      enemies: {
        front: [THE_REDMAW, GANTRY_WARDEN],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f515',
      name: 'Floor 515',
      enemies: {
        front: [TYRANT, DROWNED_MAST],
        back: [SPENTRANK_HAND, SLAGBLOOM_THICKET, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f516',
      name: 'Floor 516',
      enemies: {
        front: [THE_REDMAW, PANOPLY_BEARER],
        back: [CENTURYBOUGH_WARDEN, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f517',
      name: 'Floor 517',
      enemies: {
        front: [TYRANT, GRAVESTRIDE_SERJEANT],
        back: [CLOSEWARD_SERAPH, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f518',
      name: 'Floor 518',
      enemies: {
        front: [THE_DEEPCUT, PLATEBOUND_HUSK],
        back: [SLAGHIDE_PURSUER, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f519',
      name: 'Floor 519',
      enemies: {
        front: [THE_REDMAW, GANTRY_WARDEN],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f520',
      name: 'Floor 520 — The Long Feed',
      enemies: {
        front: [TYRANT, DROWNED_MAST],
        back: [SPENTRANK_HAND, SLAGBLOOM_THICKET, FENGORGED_WALLOWER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Long Feed — Floors 521–545, levels 246–257, Relic 53–67 — no board above 520 carries an `ascended` block, and what replaces them is a second body that will not thin. One or two a board — and the boards are *heavier* for having no anchor on them, which is the shape this hundred keeps to the roof.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f521',
      name: 'Floor 521',
      enemies: {
        front: [OVERBURDEN_HULK, CENTURYBOUGH_WARDEN],
        back: [PANOPLY_BEARER, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f522',
      name: 'Floor 522',
      enemies: {
        front: [GANTRY_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f523',
      name: 'Floor 523',
      enemies: {
        front: [DUSTPLATE_GRINDER, GRAVESTRIDE_SERJEANT],
        back: [SLAGBLOOM_THICKET, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f524',
      name: 'Floor 524',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DROWNED_MAST],
        back: [SLAGHIDE_PURSUER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f525',
      name: 'Floor 525',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, GALLERY_SLIPFANG],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f526',
      name: 'Floor 526',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [CINDERFLAW_PROVER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f527',
      name: 'Floor 527',
      enemies: {
        front: [GANTRY_WARDEN, REDWATER_STALKER],
        back: [WALKED_GROUND_DEAD, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f528',
      name: 'Floor 528',
      enemies: {
        front: [OVERBURDEN_HULK, CENTURYBOUGH_WARDEN],
        back: [PANOPLY_BEARER, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f529',
      name: 'Floor 529',
      enemies: {
        front: [GANTRY_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f530',
      name: 'Floor 530 — The Second Season',
      enemies: {
        front: [DUSTPLATE_GRINDER, GRAVESTRIDE_SERJEANT],
        back: [SLAGBLOOM_THICKET, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f531',
      name: 'Floor 531',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DROWNED_MAST],
        back: [SLAGHIDE_PURSUER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f532',
      name: 'Floor 532',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, GALLERY_SLIPFANG],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f533',
      name: 'Floor 533',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [CINDERFLAW_PROVER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f534',
      name: 'Floor 534',
      enemies: {
        front: [GANTRY_WARDEN, REDWATER_STALKER],
        back: [WALKED_GROUND_DEAD, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f535',
      name: 'Floor 535',
      enemies: {
        front: [OVERBURDEN_HULK, CENTURYBOUGH_WARDEN],
        back: [PANOPLY_BEARER, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f536',
      name: 'Floor 536',
      enemies: {
        front: [GANTRY_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f537',
      name: 'Floor 537',
      enemies: {
        front: [DUSTPLATE_GRINDER, GRAVESTRIDE_SERJEANT],
        back: [SLAGBLOOM_THICKET, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f538',
      name: 'Floor 538',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DROWNED_MAST],
        back: [SLAGHIDE_PURSUER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f539',
      name: 'Floor 539',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, GALLERY_SLIPFANG],
        back: [SILENTVAULT_KEEPER, SCALEPLATE_BRAMBLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f540',
      name: 'Floor 540 — The Standing Water',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [CINDERFLAW_PROVER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f541',
      name: 'Floor 541',
      enemies: {
        front: [GANTRY_WARDEN, REDWATER_STALKER],
        back: [WALKED_GROUND_DEAD, SLOWGROWTH_BOLE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f542',
      name: 'Floor 542',
      enemies: {
        front: [OVERBURDEN_HULK, CENTURYBOUGH_WARDEN],
        back: [PANOPLY_BEARER, WEARWAY_GAUNT, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f543',
      name: 'Floor 543',
      enemies: {
        front: [GANTRY_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f544',
      name: 'Floor 544',
      enemies: {
        front: [DUSTPLATE_GRINDER, GRAVESTRIDE_SERJEANT],
        back: [SLAGBLOOM_THICKET, MUSTER_PIKE, FENGORGED_WALLOWER],
      },
    },
    {
      id: 't-monster-f545',
      name: 'Floor 545',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DROWNED_MAST],
        back: [SLAGHIDE_PURSUER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Thickening — Floors 546–567, levels 258–267, Relic 68–80 — one to three a board, and the first floors where the fat body leads rather than follows: a health carrier bills what is *aimed at*, at 3.02 of five in the front rank against 3.63 behind.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f546',
      name: 'Floor 546',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SILTFAT_BROODER],
        back: [PANOPLY_BEARER, FENGORGED_WALLOWER, SPENTRANK_HAND],
      },
    },
    {
      id: 't-monster-f547',
      name: 'Floor 547',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [SCATTERSTONE_HOWLER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f548',
      name: 'Floor 548',
      enemies: {
        front: [DUSTPLATE_GRINDER, SILTFAT_BROODER],
        back: [PLATEBOUND_HUSK, FENGORGED_WALLOWER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f549',
      name: 'Floor 549',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f550',
      name: 'Floor 550 — The Thickening',
      enemies: {
        front: [OVERBURDEN_HULK, SILTFAT_BROODER],
        back: [MUSTER_PIKE, FENGORGED_WALLOWER, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-monster-f551',
      name: 'Floor 551',
      enemies: {
        front: [GANTRY_WARDEN, BENCHLINE_LURKER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f552',
      name: 'Floor 552',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SILTFAT_BROODER],
        back: [PANOPLY_BEARER, FENGORGED_WALLOWER, SPENTRANK_HAND],
      },
    },
    {
      id: 't-monster-f553',
      name: 'Floor 553',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [SCATTERSTONE_HOWLER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f554',
      name: 'Floor 554',
      enemies: {
        front: [DUSTPLATE_GRINDER, SILTFAT_BROODER],
        back: [PLATEBOUND_HUSK, FENGORGED_WALLOWER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f555',
      name: 'Floor 555',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f556',
      name: 'Floor 556',
      enemies: {
        front: [OVERBURDEN_HULK, SILTFAT_BROODER],
        back: [MUSTER_PIKE, FENGORGED_WALLOWER, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-monster-f557',
      name: 'Floor 557',
      enemies: {
        front: [GANTRY_WARDEN, BENCHLINE_LURKER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f558',
      name: 'Floor 558',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SILTFAT_BROODER],
        back: [PANOPLY_BEARER, FENGORGED_WALLOWER, SPENTRANK_HAND],
      },
    },
    {
      id: 't-monster-f559',
      name: 'Floor 559',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [SCATTERSTONE_HOWLER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f560',
      name: 'Floor 560 — The Deep Fen',
      enemies: {
        front: [DUSTPLATE_GRINDER, SILTFAT_BROODER],
        back: [PLATEBOUND_HUSK, FENGORGED_WALLOWER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f561',
      name: 'Floor 561',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f562',
      name: 'Floor 562',
      enemies: {
        front: [OVERBURDEN_HULK, SILTFAT_BROODER],
        back: [MUSTER_PIKE, FENGORGED_WALLOWER, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-monster-f563',
      name: 'Floor 563',
      enemies: {
        front: [GANTRY_WARDEN, BENCHLINE_LURKER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f564',
      name: 'Floor 564',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SILTFAT_BROODER],
        back: [PANOPLY_BEARER, FENGORGED_WALLOWER, SPENTRANK_HAND],
      },
    },
    {
      id: 't-monster-f565',
      name: 'Floor 565',
      enemies: {
        front: [SHATTERJAW_MAULER, PLATEBOUND_HUSK],
        back: [SCATTERSTONE_HOWLER, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    {
      id: 't-monster-f566',
      name: 'Floor 566',
      enemies: {
        front: [DUSTPLATE_GRINDER, SILTFAT_BROODER],
        back: [PLATEBOUND_HUSK, FENGORGED_WALLOWER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f567',
      name: 'Floor 567',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SCARWEAVE_TRAMPLER],
        back: [CLOSEWARD_SERAPH, FENGORGED_WALLOWER, SILTFAT_BROODER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Slow Quarry — Floors 568–585, levels 268–276, Relic 81–91 — the lieutenant arrives at 568 and leads every board it stands on. Three or four a board, and the boards come down in weight as the count goes up — the escalation rather than a discount on it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f568',
      name: 'Floor 568',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, PANOPLY_BEARER],
      },
    },
    {
      id: 't-monster-f569',
      name: 'Floor 569',
      enemies: {
        front: [TIDELESS_MAW, PLATEBOUND_HUSK],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f570',
      name: 'Floor 570 — The Slow Quarry',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f571',
      name: 'Floor 571',
      enemies: {
        front: [TIDELESS_MAW, CENTURYBOUGH_WARDEN],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f572',
      name: 'Floor 572',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, ILLFALL_SKULKER],
      },
    },
    {
      id: 't-monster-f573',
      name: 'Floor 573',
      enemies: {
        front: [TIDELESS_MAW, FENGORGED_WALLOWER],
        back: [SILTFAT_BROODER, WEARWAY_GAUNT, ROUGHCAST_GNAWER],
      },
    },
    {
      id: 't-monster-f574',
      name: 'Floor 574',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, PANOPLY_BEARER],
      },
    },
    {
      id: 't-monster-f575',
      name: 'Floor 575',
      enemies: {
        front: [TIDELESS_MAW, PLATEBOUND_HUSK],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f576',
      name: 'Floor 576',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f577',
      name: 'Floor 577',
      enemies: {
        front: [TIDELESS_MAW, CENTURYBOUGH_WARDEN],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f578',
      name: 'Floor 578',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, ILLFALL_SKULKER],
      },
    },
    {
      id: 't-monster-f579',
      name: 'Floor 579',
      enemies: {
        front: [TIDELESS_MAW, FENGORGED_WALLOWER],
        back: [SILTFAT_BROODER, WEARWAY_GAUNT, ROUGHCAST_GNAWER],
      },
    },
    {
      id: 't-monster-f580',
      name: 'Floor 580 — The Standing Weight',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, PANOPLY_BEARER],
      },
    },
    {
      id: 't-monster-f581',
      name: 'Floor 581',
      enemies: {
        front: [TIDELESS_MAW, PLATEBOUND_HUSK],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f582',
      name: 'Floor 582',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SHALEBED_CRAWLER, FENGORGED_WALLOWER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f583',
      name: 'Floor 583',
      enemies: {
        front: [TIDELESS_MAW, CENTURYBOUGH_WARDEN],
        back: [SILTFAT_BROODER, FENGORGED_WALLOWER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f584',
      name: 'Floor 584',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [WALKED_GROUND_DEAD, FENGORGED_WALLOWER, ILLFALL_SKULKER],
      },
    },
    {
      id: 't-monster-f585',
      name: 'Floor 585',
      enemies: {
        front: [TIDELESS_MAW, FENGORGED_WALLOWER],
        back: [SILTFAT_BROODER, WEARWAY_GAUNT, ROUGHCAST_GNAWER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Overmatch — Floors 586–595, levels 276–281, Relic 92–97 — three or four a board and nothing anywhere in the band under seven hundred of health. The reference five reads a flat 4.00 across the whole band and the alternate carries the decline, which is the survivors metric saturating — the seconds are what separate these floors, 14.2s to 22.8s.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f586',
      name: 'Floor 586',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SHALEBED_CRAWLER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f587',
      name: 'Floor 587',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SCATTERSTONE_HOWLER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f588',
      name: 'Floor 588',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SILTFAT_BROODER, SHALEBED_CRAWLER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f589',
      name: 'Floor 589',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, WEARWAY_GAUNT, SCALEPLATE_BRAMBLE],
      },
    },
    {
      id: 't-monster-f590',
      name: 'Floor 590 — The Overmatch',
      enemies: {
        front: [TIDELESS_MAW, FENGORGED_WALLOWER],
        back: [SILTFAT_BROODER, SHALEBED_CRAWLER, MUSTER_PIKE],
      },
    },
    {
      id: 't-monster-f591',
      name: 'Floor 591',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SHALEBED_CRAWLER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f592',
      name: 'Floor 592',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SCATTERSTONE_HOWLER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f593',
      name: 'Floor 593',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SILTFAT_BROODER, SHALEBED_CRAWLER, SLAGBLOOM_THICKET],
      },
    },
    {
      id: 't-monster-f594',
      name: 'Floor 594',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, WEARWAY_GAUNT, SCALEPLATE_BRAMBLE],
      },
    },
    {
      id: 't-monster-f595',
      name: 'Floor 595',
      enemies: {
        front: [TIDELESS_MAW, FENGORGED_WALLOWER],
        back: [SILTFAT_BROODER, SHALEBED_CRAWLER, MUSTER_PIKE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Unswallowed — Floors 596–600, levels 281–283, Relic 98–100 — five floors, each measured on its own, and at the top of them the one thing six hundred floors of jaws could not start on.
    // -------------------------------------------------------------------------------------
    {
      id: 't-monster-f596',
      name: 'Floor 596',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SHALEBED_CRAWLER, WEARWAY_GAUNT],
      },
    },
    {
      id: 't-monster-f597',
      name: 'Floor 597',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SILTFAT_BROODER, SHALEBED_CRAWLER, SLOWGROWTH_BOLE],
      },
    },
    {
      id: 't-monster-f598',
      name: 'Floor 598',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, SHALEBED_CRAWLER, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-monster-f599',
      name: 'Floor 599',
      enemies: {
        front: [TIDELESS_MAW, SILTFAT_BROODER],
        back: [SILTFAT_BROODER, WEARWAY_GAUNT, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-monster-f600',
      name: 'Floor 600 — The Unswallowed',
      enemies: {
        front: [THE_UNSWALLOWED, SILTFAT_BROODER],
        back: [FENGORGED_WALLOWER, ROUGHCAST_GNAWER, ILLFALL_SKULKER],
      },
    },
  ],
} as const;
