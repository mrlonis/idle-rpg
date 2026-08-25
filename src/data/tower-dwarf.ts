import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHPIT_SCUTTLER,
  BANDIT,
  BAREMARK_GNAWER,
  BARROWMIST_KEENER,
  BOAR,
  BRAMBLEWALK_SCOUT,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHALKHIDE_BROWSER,
  CHANNELBED_STALKER,
  CHARNEL_DRUDGE,
  CINDERLING,
  CINDER_CULLER,
  CLEFTHORN_GORER,
  COLDFORGE_HAND,
  COLOSSUS,
  COUNTERSIGN_CAPTAIN,
  COUNTERWEIGHT_BEARER,
  CROWNWORKS_STRIKER,
  DEADFALL_TIMBERER,
  DEEPGALLERY_RUNNER,
  DUSKFERN_SKIRMISHER,
  EMBERSEED_WARLOCK,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GANTRY_WARDEN,
  GLADE_STALKER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HARNESS_CUTTER,
  HEADSMAN,
  HEAPFOOT_RUMMAGER,
  HEARTROOT_TENDER,
  HEWSTROKE_PRENTICE,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  JOURNEYMAN_HEWER,
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
  PROOFMARK_SERJEANT,
  PYRE,
  QUENCHPIT_IRONHIDE,
  RACKPICKED_LEVY,
  RAMHEAD_SERJEANT,
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
  SCARWEAVE_TRAMPLER,
  SCREEBACK_DARTER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SIGHTLINE_CLERK,
  SIGNAL_RUNNER,
  SKYSHRIKE,
  SLAGBOUND_DRUDGE,
  SLIME,
  SPOILCART_HAND,
  SPOIL_PICKER,
  STANDFAST_LANCER,
  STOPEWARD_MASON,
  STORMCALLER,
  THE_BREACHLORD,
  THE_CROWN_WHEEL,
  THE_MASTERSTROKE,
  THE_PROOF_HOUSE,
  THE_UNDERMOST,
  THE_WORKMASTER,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNDERSET_PIONEER,
  UNDERVAULT_SAPPER,
  VANWARD_SPEAR,
  VAULTBOUND_GAOLER,
  WARDEN,
  WARPICK_LIEUTENANT,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WISP,
  WRATHBORN,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Dwarf Tower — six hundred floors, enemy levels 1 to 283.
 *
 * ## Why the enemies are mostly Human
 *
 * Humans beat Dwarves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * About three fifths of the slots are Human — **62.87%** across the whole tower, over 2,459 slots and
 * 104 distinct blocks — and the rest are spread across the other six factions, which is the shape the
 * matrix needs: a mono-Dwarf five meets fights it is unfavoured in *and* fights it is favoured in,
 * rather than a mirror match that would switch the matrix off entirely.
 * [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this paragraph.
 *
 * ⚠️ **Every hundred so far has wanted to be far more Human than that** — authored from the lean's
 * own bench the second came out at 86%, exactly as 21e's did — and each is held down by substituting
 * non-Human bodies of comparable weight through the filler slots. That is a thing to do on purpose
 * rather than a thing that happens. The third and fourth hundreds both landed at **63.4%** by drawing
 * their texture from the other three factions that also counter Dwarves: Monsters and Humans at ×1.05,
 * Demons and Angels at ×1.10. ⚠️ **Drawing a substitute from anywhere else quietly switches the lean
 * off on that board.** ⚠️ **The fourth hundred's overshoot was fixed on the _soft_ pool rather than the
 * light one**, which is where it differs from the third: its late bands are made of low-attack bodies
 * rather than skirmishers, and the shipped low-attack commons are nearly all Human — so the swap had to
 * reach for Monster tanks (`CHALKHIDE_BROWSER`, `THORNBACK_GRAZER`, `BOAR`) rather than for the light
 * Monster texture the bands below use. It closed at 63.4% from a first pass at **77.6%**, which would
 * have taken the whole tower to 65.44% and failed the ceiling outright. ⚠️ **The fifth hundred is the
 * first whose first pass came out legal — 67.6%, shipped at 67.0% — and it is not virtue**: its axis
 * carriers are hot, light bodies, so the boards wanted the Monster tank-and-texture pool from the
 * start rather than acquiring it in the substitution pass. Budget for the overshoot anyway.
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
 * ## ⚠️ The fourth hundred — the Proof House — is armour-piercing kit out of the hold's own armoury
 *
 * The Proof House, floors 301–400, levels 142–189: the host has got into the armoury and comes up the
 * stair wearing what the hold forged and carrying what the hold forged to test it with. The gear is
 * `TOWER_RULES.gear` and it is **one rule for all seven towers** — Worn 1 at floor 301 to Fine 60 at the
 * roof, walked as one position on the concatenated grade ladder, grades stepping at floors 301, 318 and
 * 351 — so unlike the Human Tower, which spent that ramp *as* its axis, this hundred gets it for free
 * and had to find an axis of its own on top of it.
 *
 * ⚠️ **That axis is `physicalPierce`, and it is the first in the project aimed at the stat the crew's
 * whole identity is.** "Cannot close a fight; can refuse to lose one" is a sentence about armour: the two
 * swept arrangements carry authored `def` **Σ163 / Σ186** against Human Σ119 / Σ122, Elf Σ83 / Σ75,
 * Monster Σ76 and Undead Σ50 / Σ45. `core/battle/damage.ts` computes `def × (1 − pierce)`, so pierce is a
 * discount on the only thing standing between this crew and the board. Measured against a calibrated
 * geared control — an anchor at 1100/64 behind four bodies at 580/40 at level 189 in Fine 60, reading
 * **4.00 / 4.00**, and it moves — forty seeds, **zero timeouts on every row**:
 *
 * | four bodies at        | reference | alternate  | worth to the alternate |
 * | --------------------- | --------- | ---------- | ---------------------- |
 * | 0.00 — the control    | 4.00      | 3.95       | —                      |
 * | `physicalPierce` 0.10 | 3.98      | 3.85       | 0.10                   |
 * | `physicalPierce` 0.18 | 3.80      | 3.38       | 0.57                   |
 * | `physicalPierce` 0.25 | 3.48      | 3.10       | 0.85                   |
 * | `physicalPierce` 0.35 | 3.05      | 2.92       | **1.03**               |
 * | `physicalPierce` 0.45 | 2.92      | 2.52       | **1.43**               |
 * | `physicalPierce` 0.60 | 1.68      | 1.63 · 90% | **2.32**               |
 *
 * ⚠️ **It grades in carrier _counts_ as well as in value, which is what a hundred floors needs.** At 0.35,
 * by how many of four carry it: 3.95 → 3.98 → 3.73 → 3.33 → **3.10**. So the bands walk the count first
 * and the value second, which is what gives five bands something to be:
 *
 * | Band | Floors  | Levels  | Grade             | Bodies at `physicalPierce` ≥ 0.20 | Raw health  |
 * | ---- | ------- | ------- | ----------------- | --------------------------------- | ----------- |
 * | 1    | 301–320 | 142–151 | Worn 1–Sturdy 4   | 1–2                               | 3,360–3,850 |
 * | 2    | 321–345 | 152–163 | Sturdy 5–34       | 2–3                               | 3,330–3,830 |
 * | 3    | 346–365 | 164–173 | Sturdy 35–Fine 18 | 3–4                               | 3,640–4,300 |
 * | 4    | 366–385 | 173–182 | Fine 19–42        | 3–4                               | 3,760–4,380 |
 * | 5    | 386–400 | 182–189 | Fine 43–60        | 1–3                               | 3,320–4,340 |
 *
 * ⚠️ **Stated as bodies per board rather than as an absolute, because `physicalPierce` is a _common_
 * stat** — 105 of the 326 blocks that predate this hundred carry some — so "the picks arrive in band 2"
 * would be false the day it was
 * written. That is chapter 23's counts-not-absolutes fix, on a tower. ⚠️ **The closing band's count
 * _falls_, and that is the ramp working**: it trades carriers for the roof's own 0.40 and for a grade that
 * is worth +65.7% health on a `tank`, exactly as the Human hundred's authored weight falls across its
 * fourth hundred. The top of each band's range is its **tenth floors** — 310 and 320, 330 and 340, 350 and
 * 360, 370 and 380, 390 — **and in band 3 its closing five floors as well** (361–365 also carry four),
 * which is that band handing over to the next one rather than an exception.
 *
 * ⚠️ **It was chosen on _fight length_ rather than on survivors, which is chapter 25's rule arriving on a
 * tower — and on this tower it is the only rule that could have chosen.** Three dials measured *stronger*
 * and all three are the ninety-second clock. Against the same control at 31.6s: `def` 110 is worth 1.33
 * but runs **58.2s**; enemy `hp` 1300 is worth 3.67 but runs **67.9s at a 20% win rate**; `haste` 143 is
 * worth 2.00 at 44.1s and is the second hundred's axis anyway. Pierce at 0.45 is worth 1.43 at **41.1s**.
 * This tower's own third-hundred roof is the tightest cleared fight in the project at 62.5 seconds against
 * a 67.5-second bar, so an axis that buys deaths per second of clock is the only kind available.
 *
 * ⚠️ **"Is it ours" comes back first of fourteen, and the naive form of the argument is _false_.** As a
 * change on each crew's own control — calibrated per crew to the heaviest geared board still reading ~4.00,
 * then given pierce 0.35: **dwarf-alt −1.08, dwarf-ref −1.00**, monster-ref −0.88, undead-ref −0.79,
 * monster-alt −0.75, human-alt −0.50, human-ref −0.38, angel-ref −0.29, elf-alt −0.25, demon-ref −0.21,
 * elf-ref −0.17, angel-alt −0.08, demon-alt −0.04, undead-alt −0.04. ⚠️ **But "they have the most `def` to
 * lose" does not survive the table**: both **Angel** arrangements carry *more* authored `def` than the
 * Dwarves (Σ195 and Σ174 against Σ186 and Σ163) and lose −0.08 and −0.29. What makes it this crew's is that
 * `def` is the *only* mitigation it has — zero `magicResist`, zero `dodge`, Σ0.12 / Σ0.32 of `tenacity`, no
 * `lifeLeech` — where an Angel five has armour *and* a choir. **Take the measurement, not the register.**
 *
 * ⚠️ **It is not the Monster Tower's lock wearing a new name, and the damage formula is why.** That tower's
 * third hundred is built on enemy `physicalResist` — the board refusing the crew's damage — and its own
 * argument is that pierce multiplies `def` while resist is applied afterwards untouched by it. This is the
 * same sentence read from the other side of the board: the enemies pierce, and what they pierce is the
 * deepest armour in the game.
 *
 * ⚠️ **The register, and which side of it each block lands on — measured before this hundred's own four
 * blocks joined the pool, which is the only form of the figure that stays true.** `physicalPierce` sat on
 * **105 of 326** blocks at a median of **0.20** and a ceiling of **0.45** (the Ravager); across the 46 Human
 * blocks it was **22** carriers, median 0.20, ceiling **0.30**, which the Standfast Lancer and the
 * Breachlord already hold and which [`THE_CROWN_WHEEL`](./enemies.ts) closes the third hundred at 0.28.
 * (The pool now reads 109 of 330 and the Human ceiling is this roof's own 0.40 — state the register you
 * measured against, not the one your own blocks created.) The three new legendaries run
 * **0.20 / 0.25 / 0.30, all inside the Human register**, and only the roof steps past it at **0.40** —
 * still under the game's own 0.45. That is the Splintering Yards' shape rather than the Closing's, and the
 * figure at the register is stated so a later session can tell which it is looking at: at 0.30 across four
 * bodies the axis is already worth 0.85 of the binding arrangement.
 *
 * ⚠️ **Two negatives worth not re-measuring.** Magical damage is worth **0.12** here where the third
 * hundred read 0.48 — the crews carry zero `magicResist`, but only Σ0.29 / Σ0.42 of `physicalResist` to
 * bypass, so the swap is worth 6–8% of a hit and nothing else. And instance size at held damage per second
 * is worth 0.05 / 0.33 / **0.70** across power 1.35 / 2.20 / 3.10 — a third of what the Angel Tower's own
 * axis is worth there, so the turns climb gently and the block carrying them climbs in pierce.
 *
 * ⚠️ **The _gear archetype_ each body declares is a small dial in its own right, and it is the one lever
 * this hundred has that the naked hundreds did not.** Identical stat lines all-`tank` / `support` /
 * `brawler` / `ranger` / `mage` read 4.00 / 4.00 / 3.98 / **3.67** / 3.75 for the binding arrangement, and
 * the attack-and-haste profiles take **7.2 seconds off** the board as well. So the pierce carriers wear
 * `brawler` and the walls wear `tank`: on a clock-bound crew the allocation is a way to add pressure
 * without adding seconds. It is texture rather than the axis — a third of a survivor against pierce's 1.43.
 *
 * ### ⚠️ What the boards found that the control did not
 *
 * - ⚠️ **The Crownworks collapse, again and harder.** The shipped floor-300 board fielded up the level line
 *   against the band-4 crew reads 100% with all five alive at its own level 142, **5% with 0.05 naked at
 *   189**, and **0% in Fine 60** — the gear turning a 47-second loss into a 21-second one. **Check the
 *   previous hundred's roof board at the new roof's level before authoring anything.**
 * - ⚠️ **No anchor had to retire, and that is the fifth clean answer to that check.** Every heavy block this
 *   tower fields above floor 200 stands as a lone anchor behind four light escorts at level 189 in Fine 60
 *   at 100% — [`THE_BREACHLORD`](./enemies.ts) at 1300/78 reading 4.00 / 3.95 and
 *   [`THE_CROWN_WHEEL`](./enemies.ts) at 1240/74 reading 4.00 / 4.00. What collapses is the **board**.
 *   **Run the check anyway; a clean answer is a result.**
 * - ⚠️ **The roof failed at every escort and the fix was its _attack_, which inverts the Human Tower's
 *   roof finding.** There the escort was the whole question and the boss's stat line was never touched;
 *   here, with weight held at 1200 hp and the escort held, the roof reads **0% at `atk` 70**, 2.67 / 2.35 at
 *   **52**, 3.85 / 3.42 at 44 and 4.00 / 3.95 at 38. The third turn is most of it: one turn instead of three
 *   at `atk` 70 reads 100% / 1.20 and 90% / 1.55. **Shortlist on weight; settle on attack** — chapter 20's
 *   rule, on a roof, and it is why [`THE_PROOF_HOUSE`](./enemies.ts) carried the lowest `atk` of any tower
 *   roof in the game at 52 when it shipped — a record the Ironpace then took at 44 and this tower's own
 *   fifth hundred at 40, because a superlative about the towers goes stale the moment the next hundred
 *   lands.
 * - ⚠️ **The escort still had to come down as well, and only low-`atk` commons work.** Four of them read
 *   100% / 2.67 against 100% / 2.35; swapping one for `MUSTER_PIKE` at 900/**48** reads **48% / 53%**, and
 *   putting a single pierce carrier in the escort reads **3% / 5%**. Both halves of a roof, not one.
 * - ⚠️ **The axis carries the last floor rather than riding along.** Floor 400 with the roof's pierce
 *   stripped to zero reads 100% / **3.80** against 100% / **3.00** where the shipped board reads 2.67 and
 *   2.35 — worth 1.13 and 0.65 of five, and six seconds of clock.
 * - ⚠️ **The second hundred's "escalate in front, the back rank is a cliff" does _not_ transfer to this
 *   axis, and a first pass nearly shipped the claim that it does.** On the shipped floor 398, moving a
 *   carrier between ranks is worth **−0.37 to +0.33** and changes nothing on the clock: both in front reads
 *   2.55 / 2.58, the Serjeant behind 2.92 / 2.83, the Lieutenant behind 2.63 / 2.25, both behind
 *   3.20 / 2.60. The earlier reading that said otherwise (1.93 and 1.80 against 2.52) was taken on a five
 *   whose *third* body also carried pierce, so moving one back put **two** carriers there — a different
 *   experiment, which is chapter 22's "a rank comparison must be carried on one body" arriving intact.
 *   ⚠️ **The rank rule is about _output_ and pierce is not output**: a discount on `def` bills wherever the
 *   party is already aiming. The boards keep their carriers in front because that is where the weight
 *   belongs, not because the axis prices differently by rank.
 * - ⚠️ **The closing floors fall in weight and rise in heat, and reaching for a heavy carrier there is a
 *   cliff.** A first pass put a second hot carrier (Redwater Stalker or Standfast Lancer, 880–900 hp at 78–80
 *   `atk`) in the back rank of floors 394–399 and read **0% to 25%** with maxima at 68.8s. Replacing it with
 *   a light, hot skirmisher at 500–560 hp took the same floors to 100% with 3.3 to 4.0 alive.
 * - ⚠️ **No board pairs two `ascended` blocks**, which is not a habit here: two in one front rank at the
 *   roof's level in Fine 60 reads **0% / 0%**.
 * - ⚠️ **A mini-boss peak has to be checked in survivors as well as in seconds on this hundred, and
 *   floor 380 is the case that shows why.** Eight of the nine tenth floors read longer than both their
 *   neighbours; floor 380 reads **21.3s against 24.0s and 24.4s** and is still the peak, because it costs
 *   **3.77 of five against their 4.00 and 4.50**. That is the hundred's own thesis arriving in its rhythm:
 *   an axis chosen to convert weight into deaths rather than into seconds produces peaks that are *faster*
 *   than the floors around them. ⚠️ **Two others (310 and 340) were genuinely flat on the first pass and
 *   were lifted with heavier _texture_ rather than another carrier**, so the per-band carrier counts stayed
 *   what the band table says they are.
 *
 * ## ⚠️ The fifth hundred — the Masterworks — is the pair the pick was always half of
 *
 * The Masterworks, floors 401–500, levels 189–236, Masterwork 1 to Relic 40: the host has stopped
 * testing the hold's arms and apprenticed itself to the hold's craft — prentice, journeyman,
 * workmaster, and at the top the one stroke the craft exists for. The whole measurement lives in
 * [`enemies.ts`](./enemies.ts) beside the four blocks that carry it; what belongs here is what the
 * floors do with it and what the hundred is allowed to claim.
 *
 * 1. ⚠️ **The axis is `physicalPierce` and `atk` carried together on light bodies, and the licence
 *    has two halves.** The pair is **super-additive** on this crew — pierce 0.25 alone is worth 0.47,
 *    `atk` 46 alone 0.82, and together **1.97** — which is the Monster fourth hundred's licence for
 *    building on the axis below (this tower's own pierce, spent at the fourth hundred). And it is
 *    taken on **margin rather than exclusivity**: cross-crew at band 5 the two Angel arrangements
 *    read higher on every attack-shaped candidate (a hammer is the choir's tax, their own third
 *    hundred's finding), and **dwarf-ref is first of the twelve mortal arrangements** at 1.17.
 * 2. ⚠️ **The fourth hundred's own licence expired** — pierce 0.35 alone re-measured at band 5 costs
 *    dwarf-ref 0.50, seventh of fourteen — which is the Undead Tower's "re-run 'is it ours' on the
 *    band being authored" arriving on this one.
 * 3. ⚠️ **Which crew binds flipped: the reference five reads lower on nearly every row**, where the
 *    fourth hundred's alternate bound. Both were checked on every floor regardless.
 * 4. ⚠️ **Everything stronger than the pair is the ninety-second clock**, re-measured one band up:
 *    enemy `hp` 1100 is worth 3.47 of five at 58.6s mean, **72.0s max and a 38% win rate**; `dodge`
 *    0.45 is worth 1.94 at **82.9s max** on a crew with zero `accuracy`; `def` 110 is worth 1.29 at
 *    51.8s. Weight, armour and evasion all convert budget into seconds; the pair converts it into
 *    deaths, and the longest cleared fight in the hundred is **58.2 seconds** against the 67.5s bar.
 * 5. ⚠️ **Crit is dead last of fourteen** (dwarf-ref 0.25, dwarf-alt 0.05 at `critChance` 0.30):
 *    the Dwarf arrangements carry the game's deepest `critBlock`, so this is the Angel fourth
 *    hundred's "the crew answered the wrong half" mirrored — this crew answered the right one.
 * 6. ⚠️ **A second `ascended` anchor is still a cliff at band 5** — a 650/44 second beside the
 *    control's anchor reads **0% / 45%** — so the pairing ban survives a second rung of investment
 *    and no board in the hundred pairs two.
 *
 * The bands walk the carrier count first and the pair's size second, counted as bodies at
 * `physicalPierce` ≥ 0.20 per board — a *count*, because pierce is a common stat and an absolute
 * claim would be false the day it was written:
 *
 * | Band | Floors  | Levels  | Grade              | Carriers | Raw health  |
 * | ---- | ------- | ------- | ------------------ | -------- | ----------- |
 * | 1    | 401–420 | 189–198 | Masterwork 1–24    | 0–2      | 3,420–3,980 |
 * | 2    | 421–445 | 199–210 | Masterwork 25–54   | 1–3      | 3,340–4,100 |
 * | 3    | 446–465 | 211–220 | Masterwork 55–78   | 2–3      | 3,460–4,080 |
 * | 4    | 466–480 | 220–227 | Masterwork 79–R 16 | 2–3      | 3,480–4,060 |
 * | 5    | 481–495 | 227–234 | Relic 17–34        | 2–3      | 3,360–3,880 |
 * | 6    | 496–500 | 234–236 | Relic 35–40        | 1–2      | 3,080–3,540 |
 *
 * ⚠️ **The gear ramp is inherited rather than spent and it steps _down_ twice inside the hundred** —
 * floor 400 wears Fine 60 and floor 401 wears Masterwork 1; floor 467 wears Masterwork 80 and floor
 * 468 wears Relic 1 — so bands 1 and 4 open heavier than the floors they follow, exactly as the
 * Human fifth hundred's do. The raw-health budget otherwise falls across the hundred while the pair
 * rises through it.
 *
 * ⚠️ **A pair carrier in the back rank is worth half a member more than the same body in front**
 * (3.48 against 3.98 on one carrier, carried on one body as chapter 22 demands), because the pair is
 * half *output* and a body this crew cannot reach bills its attack for longer — the second hundred's
 * rank cliff, returning at half size on an axis that is half output where pierce alone was none. The
 * Long Grain spends it deliberately: one carrier stands in the back rank through band 5, and that is
 * the band's escalation while its weight eases.
 *
 * ⚠️ **The roof was settled on its attack, which is now the fourth tower roof running.** Weight held
 * at 1140, [`THE_MASTERSTROKE`](./enemies.ts) reads **0% for both arrangements at `atk` 50**, 73%
 * for the binding one at 44, and **100% / 1.68 against 100% / 2.08 at the shipped 40** — and the
 * axis carries the floor rather than riding along: pierce stripped to zero reads 100% / 3.15 and
 * 100% / 2.95, so the pair is worth **1.47 of five** on the top floor of the tower.
 *
 * ⚠️ **Two retired anchors came back for the opening bands and two could not.** At floor 500 behind
 * light escorts, `THE_PROOF_HOUSE`, `THE_BREACHLORD` and `THE_CROWN_WHEEL` all read **0%** — the
 * Crownworks collapse, a fourth time — while the Warpick Lieutenant, the Proofmark Serjeant and the
 * Quenchpit Ironhide stand at 100% with 4.00 alive. "Retires" means from the closing bands: the
 * Breachlord anchors floor 410 and the Crown Wheel floor 420, twenty-five levels below the roof,
 * exactly as the Human fifth hundred re-fielded the Gravewright. The Proof House itself is not
 * re-fielded — the fourth hundred ended on it and the fiction did too.
 *
 * ## ⚠️ The sixth hundred — the Deepworks — is the two hundreds below it read backwards
 *
 * The Deepworks, floors 501–600, levels 236–283, Relic 41 to Relic 100: the host has finished with
 * the hold and gone down past it, into the galleries the hold was digging when it fell. The whole
 * measurement lives in [`enemies.ts`](./enemies.ts) beside the four blocks that carry it; what
 * belongs here is what the floors do with it and what the hundred is allowed to claim.
 *
 * 1. ⚠️ **The axis is `physicalResist`, and it is the one wall the Proof House and the Masterworks
 *    taught the player to open and cannot.** `core/battle/damage.ts` computes `effectiveDefence` as
 *    `def × (1 − pierce)` and applies `resistedShare` — `1 − resist` — **afterwards, untouched by any
 *    pierce**. Two hundred floors of this tower are built on picks; this is the stone.
 * 2. ⚠️ **"Is it ours" comes back first _and second_ of fourteen, which is exclusivity rather than
 *    margin — the stronger licence, and the first time this tower has had it.** At `physicalResist`
 *    0.20, each arrangement calibrated to the heaviest control it still reads ≥3.60 on: **dwarf-ref
 *    1.35, dwarf-alt 1.28**, elf-alt 1.02, human-ref 0.90, then nine rows from 0.67 down to 0.00.
 * 3. ⚠️ **The fight-length confound is disproved outright rather than fitted away, and that is worth
 *    more than a correlation.** A Dwarf five is the **slowest mortal arrangement in the game**
 *    (`haste` Σ378 / Σ354) and calibrates to a 27.9s control where most crews sit at 8–16s, so the
 *    Demon fifth hundred's warning applies directly. **angel-alt is the slowest of all fourteen at a
 *    35.7s control and reads 0.15, twelfth**; the correlation across the table is 0.177, and ranking
 *    the residual moves nothing.
 * 4. ⚠️ **What makes it theirs is the damage type, and it is total.** The two arrangements field **5
 *    and 7 physical damage effects and zero magical**, so a physical ward taxes every point of the
 *    lowest `atk` in the game, while carrying `physicalPierce` Σ0.15 / Σ0.15 against the Monsters'
 *    Σ0.56 / Σ0.70. They neither dodge it, out-run it nor open it.
 * 5. ⚠️ **Every pairing measured is flat, so the axis ships alone** — with `dodge` ×1.02 of its
 *    halves, with `tenacity` ×0.98, and `dodge` with `tenacity` ×0.91. Only `physicalResist` with
 *    `def` is super-additive at ×1.23, and it costs **+25.7 seconds**, which on this tower is the
 *    ninety-second clock rather than a licence.
 * 6. ⚠️ **`tenacity` is declined for the third hundred running** (0.70 / 0.83 / 0.95 across
 *    0.30 / 0.60 / 0.85, saturating), `magicResist` and `accuracy` are disqualified by the formula
 *    rather than by size (0.27 and 0.23 — the party deals no magical damage and carries `dodge`
 *    Σ0.00), and `attackSpeed` is refused twice over: `effectiveSpeed` adds it to `haste`, which is
 *    this tower's own second- and third-hundred axis, and its cost correlates **0.726** with how long
 *    each crew's fights already are. **A speed tax belongs to whichever crew is slowest.**
 *
 * The bands walk the carrier count first and the value second, counted as bodies at
 * `physicalResist` ≥ 0.14 per board — a **count**, because `physicalResist` sits on 193 of 422
 * shipped blocks and an absolute claim would be false the day it was written:
 *
 * | Band | Floors  | Levels  | Grade        | Carriers | Raw health  |
 * | ---- | ------- | ------- | ------------ | -------- | ----------- |
 * | 1    | 501–520 | 236–245 | Relic 41–52  | 0–1      | 2,950–3,480 |
 * | 2    | 521–545 | 246–257 | Relic 53–67  | 1–2      | 2,575–3,070 |
 * | 3    | 546–565 | 258–267 | Relic 68–79  | 2        | 2,575–2,745 |
 * | 4    | 566–580 | 267–274 | Relic 80–88  | 2–3      | 1,675–2,675 |
 * | 5    | 581–595 | 274–281 | Relic 89–97  | 3        | 1,230–1,570 |
 * | 6    | 596–600 | 281–283 | Relic 98–100 | 1–3      | 1,180–1,335 |
 *
 * ⚠️ **There is no grade boundary anywhere inside this hundred** — Relic is the last grade — so the
 * "a band after a boundary opens heavier" rule does not apply to it at all, and its gear is monotone
 * from floor 501 to the roof. It is the second hundred in the project with that property.
 *
 * ### ⚠️ What the boards found that the control did not
 *
 * - ⚠️ **The Crownworks collapse, a fifth time, and this is the harshest retirement check any hundred
 *   in this tower has had: _all four_ `ascended` blocks retire from the closing bands.** Behind four
 *   light escorts at floor 600, `THE_BREACHLORD`, `THE_CROWN_WHEEL`, `THE_WORKMASTER` and
 *   `THE_MASTERSTROKE` all read **0%**. ⚠️ **They fail in two different ways and the seconds say
 *   which**: the Breachlord dies at **22.3s** and the Masterstroke at **58.1s** — the heavy ones lose
 *   to damage and the light ones to the clock.
 * - ⚠️ **"Retires" means from the closing bands, not from the hundred.** Behind the same escorts, the
 *   Masterstroke and the Workmaster hold to floor **565** (4.00 of five at 37.0s and 35.0s) and the
 *   Crown Wheel and the Breachlord to floor **545**. All four anchor the opening bands, exactly as
 *   the Breachlord and the Crown Wheel were re-fielded one hundred below.
 * - ⚠️ **The squeeze is a factor of 9.86 and it is the whole reason the new blocks are so light.**
 *   The board weight that reads 4.00 of five falls from **23,445 common-equivalent at floor 501 to
 *   2,377 at floor 600**, because the party is frozen at band 6 while the boards climb forty-seven
 *   levels and fifty-nine gear positions. The authored weight opens at **3,440 raw health and closes
 *   at 1,335** — a fall of ×2.58 — to meet part of it, and the level line does the rest.
 * - ⚠️ **The rank a carrier stands in is priced by its _output_ and not by its resist, and the two new
 *   readings disagree with each other.** Carried on one body at floor 593: the **Pioneer** — the
 *   heaviest carrier, and the only one with a second turn — reads **2.25 of five in front against
 *   3.02 behind**, worth 0.77; the **Mason** reads **4.00 in front and 4.00 behind**, worth nothing
 *   at all. That is this tower's own second-hundred rule ("escalate in front; the back rank is a
 *   cliff") landing on the body carrying the turn and missing the body carrying the stat.
 * - ⚠️ **A third answer to the rank question in four hundreds, so carry the measurement rather than
 *   the precedent.** A dodge bills what is *aimed at* (Demon fifth hundred, 0.75 against 0.28), an
 *   `attackSpeed` bills what is *left alive* (chapter 28, 0.00 against 0.77), and a resist bills every
 *   blow that reaches the body whenever it arrives.
 * - ⚠️ **The Pioneer stands in the front rank only where no returning anchor does, and that is a
 *   tuning rule rather than a habit.** Beside `WARPICK_LIEUTENANT` in one front rank it reads **0%**,
 *   and behind `PROOFMARK_SERJEANT` with a hot escort it read 1.25 of five at 46.8s. Every board in
 *   bands 4 through 6 was settled by moving it.
 * - ⚠️ **The roof was settled on its attack, the fifth tower roof running.** With weight held at 580,
 *   `THE_UNDERMOST` reads **18% at `atk` 40**, 65% at 38, **98% at 36** and 100% / 2.70 at 34.
 *   ⚠️ **And its resist is capped by the board rather than by the register**: at `physicalResist` 0.34
 *   the same board reads **88%**, under the 90% bar, so it ships at 0.30 with the Dwarf faction's own
 *   shipped 0.34 and the game's 0.40 both left standing.
 * - ⚠️ **The axis carries the last floor rather than riding along**: the roof's board with its resist
 *   stripped to zero reads 100% / **3.50** against the shipped 98% / **1.60** — worth **1.90 of five**
 *   on the top floor of the tower, and twenty-two seconds of clock.
 * - ⚠️ **The carriers wear `brawler` and `tank` would switch the axis off.** Held at an identical stat
 *   line, all-`tank` reads **5.00 of five** where all-`brawler` reads 4.00: a tank set pays its grade
 *   into health, which on a refusal axis buys the party seconds rather than costing it members. The
 *   Proof House's allocation finding, arriving with the opposite sign.
 * - ⚠️ **The lean overshoot was 88.2% and it is structural rather than sloppy.** Authored from the
 *   Human bench the hundred came out at 88.2% and would have taken the tower to **67.15%**, over the
 *   ceiling — the axis carriers alone stand on 175 slots. It ships at **74.2%** and the tower at
 *   **64.79%**, corrected by converting every second occurrence of four matched-weight texture blocks
 *   to Monster bodies that also counter Dwarves (`BANDIT` → `MIREWHELP`, `FREE_BLADE` →
 *   `ASHPIT_SCUTTLER`, `VANWARD_SPEAR` → `RENDFANG_JACKAL`, `FORLORN_LEVY` → `MIREWHELP`), **spread
 *   across every band** rather than emptying whichever band leans hardest on filler.
 * - ⚠️ **Nothing above floor 500 restores anything, stated as counts rather than as an absolute.** Of
 *   the **28 blocks** this hundred fields, **zero** carry a point of `lifeLeech`, `recovery` or
 *   `healthRegen`; **zero** carry a heal, drain or shield effect; **zero** carry a `regen`, ward or
 *   guard status; and **zero** carry a taunt. Checked with a script over the shipped floors rather
 *   than read.
 *
 * ## What the bands measure at
 *
 * Band 1: floor 1 in one second, floor 50 in seven, floor 100 in forty-four with three of five
 * down. Band 2: floor 101 in five seconds, floor 160 in fourteen, floor 200 in thirty-six at 98%
 * with 2.3 alive, and the alternate five takes it at **88% with 1.5**. Band 3: floor 201 in eight
 * seconds, floor 250 in twelve, floor 290 in twenty at 4.03, floor 299 in twenty-eight at 3.00, and
 * the roof in **thirty-three seconds at 2.77 — 42.3s and 1.82 for the alternate five.** Band 4: floor
 * 301 in six and a half seconds, floor 345 in thirteen, floor 365 in nineteen at 4.00, floor 385 in
 * twenty-eight at 3.83, floor 399 in thirty-nine at 3.40, and floor 400 in **forty-one seconds at
 * 2.67 — 43.7s and 2.35 for the alternate five**. Band 5: floor 401 in eight seconds with all five
 * alive, floor 450 in twenty-five, floor 460 in thirty-three at 4.00, floor 490 — the hundred's
 * longest mini-boss — in thirty-seven at 3.83, floor 497 in thirty-six at 2.65, and the roof in
 * **fifty-four
 * seconds at 1.68 — 53.2s and 2.08 for the alternate five**, with **zero timeouts anywhere in the
 * five hundred**. Win rate is 100% almost the whole way, which is the intended shape — a floor is
 * climbed once and there is no way around one. What ramps is what it costs: the reference five loses
 * nobody below floor 80 in band 1, floor 185 in band 2, **floor 280** in band 3, **floor 362** in
 * band 4 or **floor 448** in the fifth hundred, and the alternate first pays at **251**, then at
 * **340**, then at **445**.
 *
 * ⚠️ **The third hundred's roof is the tightest fight in the project against the timer and the fourth
 * hundred deliberately did not tie it.** The alternate five's longest single attempt on floor 300 is
 * **62.5 seconds** against the sweep's 67.5-second bar for a cleared fight, and no other floor in that
 * hundred passes 39.2; a heavier roof was measured and rejected for exactly that reason rather than for
 * its win rate. In the fourth hundred the longest cleared attempt is **60.9s** (the reference five on
 * floor 398) and the alternate's worst on the roof itself is **57.9s** — a roof one step back from the
 * one below it, chosen on the clock. ⚠️ **A roof at `atk` 54 rather than 52 measured 62.5s on the nose
 * and was declined for that alone**: it costs 0.2 of a survivor and buys back nothing. The fifth
 * hundred stays inside all of that: its longest fight anywhere is **58.2s**, on the roof.
 *
 * ⚠️ **The roof is far lighter than the Human Tower's and that is 15c's rule rather than an
 * oversight**: anchors are sized against the tower's own crew, never to a shared weight. A roof at
 * The Deathless Marshal's weight reads **0%** for both Dwarf arrangements. See
 * [`THE_BREACHLORD`](./enemies.ts) and [`THE_CROWN_WHEEL`](./enemies.ts) — which is *lighter* than
 * the Breachlord it succeeds, for the growth reason above.
 *
 * ⚠️ **No board pairs a taunt with a body that heals**, and **no board above floor 200 restores
 * anything at all** — checked by walking all four hundred floors with a script rather than by
 * reading them, which is how the one board that broke it was found.
 *
 * ⚠️ **The fourth hundred's version of that claim is stated in counts, because the absolute form has
 * shipped wrong four times across the seven towers and always on one of five different words.**
 * `recovery`, `healthRegen`, `lifeLeech`, a `regen` **status** and a `heal` **effect** are five separate
 * things. Measured over the hundred rather than read: of the **35 blocks** it fields, **zero** carry a
 * point of `lifeLeech`, `recovery` or `healthRegen`; **zero** carry a heal, drain or shield effect; **zero**
 * carry a `regen`, ward or guard status; and **zero** carry a taunt. That is the strictest sustain claim
 * any hundred in this project makes, and it is the crew's own failure mode rather than fastidiousness —
 * every point of enemy sustain is a second of clock a party that cannot burst does not have.
 *
 * ⚠️ **The stricter claim this file used to make about floor 180 was wrong, and the script is what
 * caught it.** Three boards above 180 do carry restoration: the Oathshield Vanguard's `recovery` 5 on
 * floors 186 and 194, and the Sepulchre Hound's `lifeLeech` 0.10 on floor 188. Both are the tolerable
 * form and neither is what 15c measured — the Vanguard's recovery sits on the body that is *itself*
 * the taunt, so the party is already hitting the thing that heals, and a tenth of leech on a body in
 * the open is not sustain anyone has to outpace. **What is forbidden above floor 180 is a heal, a
 * drain or a regeneration**, and there is none.
 *
 * ⚠️ **The fifth hundred keeps the fourth's strict form of the claim.** Of the **26 blocks** it
 * fields, **zero** carry a point of `lifeLeech`, `recovery` or `healthRegen`; **zero** carry a heal,
 * drain or shield effect; **zero** carry a `regen`, ward or guard status; and **zero** carry a
 * taunt — the Scarbound Bellower, the Order Serjeant, the Gorehide Matriarch and the Signal Runner
 * were each considered as texture and excluded for exactly one line of their kits.
 *
 * Re-run `npm run test:balance` after touching any band above floor 68, 180, 270, 385, 490 or 596.
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
    // The Undervault — Floors 121–140, levels 57–66 — somebody has found the seams, and armour stops being an answer.
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

    // -------------------------------------------------------------------------------------
    // The Rack Room — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — the armoury door is open and one of them has taken a pick off the wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f301',
      name: 'Floor 301',
      enemies: {
        front: [RACKPICKED_LEVY, SCARWEAVE_TRAMPLER],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f302',
      name: 'Floor 302',
      enemies: {
        front: [RACKPICKED_LEVY, GANTRY_WARDEN],
        back: [SERAPH_ADJUDICANT, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f303',
      name: 'Floor 303',
      enemies: {
        front: [RACKPICKED_LEVY, SIGHTLINE_CLERK],
        back: [RIFTSTEP_REAVER, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f304',
      name: 'Floor 304',
      enemies: {
        front: [RACKPICKED_LEVY, COUNTERWEIGHT_BEARER],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f305',
      name: 'Floor 305',
      enemies: {
        front: [RACKPICKED_LEVY, SCARWEAVE_TRAMPLER],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f306',
      name: 'Floor 306',
      enemies: {
        front: [RACKPICKED_LEVY, GANTRY_WARDEN],
        back: [ANTIPHON_ARCHON, SCREEBACK_DARTER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f307',
      name: 'Floor 307',
      enemies: {
        front: [RACKPICKED_LEVY, SIGHTLINE_CLERK],
        back: [STORMCALLER, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f308',
      name: 'Floor 308',
      enemies: {
        front: [RACKPICKED_LEVY, COUNTERWEIGHT_BEARER],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f309',
      name: 'Floor 309',
      enemies: {
        front: [RACKPICKED_LEVY, SCARWEAVE_TRAMPLER],
        back: [SERAPH_ADJUDICANT, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f310',
      name: 'Floor 310 — The Rack Room',
      enemies: {
        front: [RACKPICKED_LEVY, STANDFAST_LANCER],
        back: [STORMCALLER, RIFTSTEP_REAVER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f311',
      name: 'Floor 311',
      enemies: {
        front: [RACKPICKED_LEVY, SIGHTLINE_CLERK],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f312',
      name: 'Floor 312',
      enemies: {
        front: [RACKPICKED_LEVY, COUNTERWEIGHT_BEARER],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f313',
      name: 'Floor 313',
      enemies: {
        front: [RACKPICKED_LEVY, SCARWEAVE_TRAMPLER],
        back: [ANTIPHON_ARCHON, SCREEBACK_DARTER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f314',
      name: 'Floor 314',
      enemies: {
        front: [RACKPICKED_LEVY, GANTRY_WARDEN],
        back: [STORMCALLER, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f315',
      name: 'Floor 315',
      enemies: {
        front: [RACKPICKED_LEVY, SIGHTLINE_CLERK],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f316',
      name: 'Floor 316',
      enemies: {
        front: [RACKPICKED_LEVY, COUNTERWEIGHT_BEARER],
        back: [SERAPH_ADJUDICANT, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f317',
      name: 'Floor 317',
      enemies: {
        front: [RACKPICKED_LEVY, SCARWEAVE_TRAMPLER],
        back: [RIFTSTEP_REAVER, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f318',
      name: 'Floor 318',
      enemies: {
        front: [RACKPICKED_LEVY, GANTRY_WARDEN],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f319',
      name: 'Floor 319',
      enemies: {
        front: [RACKPICKED_LEVY, SIGHTLINE_CLERK],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f320',
      name: 'Floor 320 — The Rack Room',
      enemies: {
        front: [RACKPICKED_LEVY, REDWATER_STALKER],
        back: [ANTIPHON_ARCHON, SCREEBACK_DARTER, VANWARD_SPEAR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Fitting Floor — Floors 321–345, levels 152–163, Sturdy 5–Sturdy 34 — two of them now, and the grade steps to Sturdy underneath.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f321',
      name: 'Floor 321',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f322',
      name: 'Floor 322',
      enemies: {
        front: [RACKPICKED_LEVY, REDWATER_STALKER],
        back: [SERAPH_ADJUDICANT, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f323',
      name: 'Floor 323',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [RIFTSTEP_REAVER, ROADWATCH_BOWMAN, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f324',
      name: 'Floor 324',
      enemies: {
        front: [RACKPICKED_LEVY, STANDFAST_LANCER],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f325',
      name: 'Floor 325',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f326',
      name: 'Floor 326',
      enemies: {
        front: [RACKPICKED_LEVY, RAMHEAD_SERJEANT],
        back: [ANTIPHON_ARCHON, SCREEBACK_DARTER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f327',
      name: 'Floor 327',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [STORMCALLER, CLEFTHORN_GORER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f328',
      name: 'Floor 328',
      enemies: {
        front: [RACKPICKED_LEVY, REDWATER_STALKER],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f329',
      name: 'Floor 329',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [SERAPH_ADJUDICANT, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f330',
      name: 'Floor 330 — The Fitting Floor',
      enemies: {
        front: [RACKPICKED_LEVY, STANDFAST_LANCER],
        back: [CROWNWORKS_STRIKER, RIFTSTEP_REAVER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f331',
      name: 'Floor 331',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f332',
      name: 'Floor 332',
      enemies: {
        front: [RACKPICKED_LEVY, RAMHEAD_SERJEANT],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f333',
      name: 'Floor 333',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [ANTIPHON_ARCHON, SCREEBACK_DARTER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f334',
      name: 'Floor 334',
      enemies: {
        front: [RACKPICKED_LEVY, REDWATER_STALKER],
        back: [STORMCALLER, CLEFTHORN_GORER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f335',
      name: 'Floor 335',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f336',
      name: 'Floor 336',
      enemies: {
        front: [RACKPICKED_LEVY, STANDFAST_LANCER],
        back: [SERAPH_ADJUDICANT, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f337',
      name: 'Floor 337',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [RIFTSTEP_REAVER, ROADWATCH_BOWMAN, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f338',
      name: 'Floor 338',
      enemies: {
        front: [RACKPICKED_LEVY, RAMHEAD_SERJEANT],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f339',
      name: 'Floor 339',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [EMBERSEED_WARLOCK, FORLORN_LEVY, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f340',
      name: 'Floor 340 — The Fitting Floor',
      enemies: {
        front: [RACKPICKED_LEVY, REDWATER_STALKER],
        back: [CROWNWORKS_STRIKER, STORMCALLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f341',
      name: 'Floor 341',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [STORMCALLER, CLEFTHORN_GORER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f342',
      name: 'Floor 342',
      enemies: {
        front: [RACKPICKED_LEVY, STANDFAST_LANCER],
        back: [KILNSWORN_ADEPT, VANWARD_SPEAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f343',
      name: 'Floor 343',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [SERAPH_ADJUDICANT, MIREWHELP, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f344',
      name: 'Floor 344',
      enemies: {
        front: [RACKPICKED_LEVY, RAMHEAD_SERJEANT],
        back: [RIFTSTEP_REAVER, ROADWATCH_BOWMAN, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f345',
      name: 'Floor 345',
      enemies: {
        front: [PROOFMARK_SERJEANT, RACKPICKED_LEVY],
        back: [RIFTBORN_HARROWER, ASHPIT_SCUTTLER, CLEFTHORN_GORER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Proving Floor — Floors 346–365, levels 163–172, Sturdy 35–Fine 18 — three, and Fine plate arrives on the boards carrying them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f346',
      name: 'Floor 346',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RENDFANG_JACKAL, VANWARD_SPEAR, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f347',
      name: 'Floor 347',
      enemies: {
        front: [WARPICK_LIEUTENANT, REDWATER_STALKER],
        back: [REDWATER_STALKER, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f348',
      name: 'Floor 348',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [STANDFAST_LANCER, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f349',
      name: 'Floor 349',
      enemies: {
        front: [WARPICK_LIEUTENANT, STANDFAST_LANCER],
        back: [KINGSWAY_LANCER, ASHPIT_SCUTTLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f350',
      name: 'Floor 350 — The Proving Floor',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RACKPICKED_LEVY, RENDFANG_JACKAL, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f351',
      name: 'Floor 351',
      enemies: {
        front: [WARPICK_LIEUTENANT, RAMHEAD_SERJEANT],
        back: [RENDFANG_JACKAL, SCREEBACK_DARTER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f352',
      name: 'Floor 352',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [REDWATER_STALKER, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f353',
      name: 'Floor 353',
      enemies: {
        front: [WARPICK_LIEUTENANT, REDWATER_STALKER],
        back: [STANDFAST_LANCER, VANWARD_SPEAR, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f354',
      name: 'Floor 354',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [KINGSWAY_LANCER, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f355',
      name: 'Floor 355',
      enemies: {
        front: [WARPICK_LIEUTENANT, STANDFAST_LANCER],
        back: [CROWNWORKS_STRIKER, ROADWATCH_BOWMAN, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f356',
      name: 'Floor 356',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RENDFANG_JACKAL, ASHPIT_SCUTTLER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f357',
      name: 'Floor 357',
      enemies: {
        front: [WARPICK_LIEUTENANT, RAMHEAD_SERJEANT],
        back: [REDWATER_STALKER, FORLORN_LEVY, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-dwarf-f358',
      name: 'Floor 358',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [STANDFAST_LANCER, SCREEBACK_DARTER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f359',
      name: 'Floor 359',
      enemies: {
        front: [WARPICK_LIEUTENANT, REDWATER_STALKER],
        back: [KINGSWAY_LANCER, CLEFTHORN_GORER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f360',
      name: 'Floor 360 — The Proving Floor',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RACKPICKED_LEVY, RENDFANG_JACKAL, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f361',
      name: 'Floor 361',
      enemies: {
        front: [WARPICK_LIEUTENANT, STANDFAST_LANCER],
        back: [RENDFANG_JACKAL, STANDFAST_LANCER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f362',
      name: 'Floor 362',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [REDWATER_STALKER, KINGSWAY_LANCER, ROADWATCH_BOWMAN],
      },
    },
    {
      id: 't-dwarf-f363',
      name: 'Floor 363',
      enemies: {
        front: [WARPICK_LIEUTENANT, RAMHEAD_SERJEANT],
        back: [STANDFAST_LANCER, CROWNWORKS_STRIKER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f364',
      name: 'Floor 364',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [KINGSWAY_LANCER, RENDFANG_JACKAL, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f365',
      name: 'Floor 365',
      enemies: {
        front: [WARPICK_LIEUTENANT, REDWATER_STALKER],
        back: [CROWNWORKS_STRIKER, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Pick Line — Floors 366–385, levels 173–182, Fine 19–Fine 42 — three abreast and four on the tenth floors, and the weight starts to ease as the grade climbs.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f366',
      name: 'Floor 366',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RENDFANG_JACKAL, FREE_BLADE, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f367',
      name: 'Floor 367',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [REDWATER_STALKER, BOAR, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f368',
      name: 'Floor 368',
      enemies: {
        front: [WARPICK_LIEUTENANT, KINGSWAY_LANCER],
        back: [STANDFAST_LANCER, BANDIT, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f369',
      name: 'Floor 369',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [KINGSWAY_LANCER, CHALKHIDE_BROWSER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f370',
      name: 'Floor 370 — The Pick Line',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [CROWNWORKS_STRIKER, RENDFANG_JACKAL, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f371',
      name: 'Floor 371',
      enemies: {
        front: [WARPICK_LIEUTENANT, COUNTERSIGN_CAPTAIN],
        back: [RENDFANG_JACKAL, THORNBACK_GRAZER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f372',
      name: 'Floor 372',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [REDWATER_STALKER, FREE_BLADE, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f373',
      name: 'Floor 373',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [STANDFAST_LANCER, BOAR, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f374',
      name: 'Floor 374',
      enemies: {
        front: [WARPICK_LIEUTENANT, CROWNWORKS_STRIKER],
        back: [KINGSWAY_LANCER, BANDIT, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f375',
      name: 'Floor 375',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [CROWNWORKS_STRIKER, CHALKHIDE_BROWSER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f376',
      name: 'Floor 376',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [RENDFANG_JACKAL, MUSTER_PIKE, BOAR],
      },
    },
    {
      id: 't-dwarf-f377',
      name: 'Floor 377',
      enemies: {
        front: [WARPICK_LIEUTENANT, RAMHEAD_SERJEANT],
        back: [REDWATER_STALKER, THORNBACK_GRAZER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f378',
      name: 'Floor 378',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [STANDFAST_LANCER, FREE_BLADE, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f379',
      name: 'Floor 379',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [KINGSWAY_LANCER, BOAR, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f380',
      name: 'Floor 380 — The Pick Line',
      enemies: {
        front: [WARPICK_LIEUTENANT, KINGSWAY_LANCER],
        back: [CROWNWORKS_STRIKER, RENDFANG_JACKAL, BANDIT],
      },
    },
    {
      id: 't-dwarf-f381',
      name: 'Floor 381',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RENDFANG_JACKAL, CHALKHIDE_BROWSER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f382',
      name: 'Floor 382',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [REDWATER_STALKER, MUSTER_PIKE, BOAR],
      },
    },
    {
      id: 't-dwarf-f383',
      name: 'Floor 383',
      enemies: {
        front: [WARPICK_LIEUTENANT, COUNTERSIGN_CAPTAIN],
        back: [STANDFAST_LANCER, THORNBACK_GRAZER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f384',
      name: 'Floor 384',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [KINGSWAY_LANCER, FREE_BLADE, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f385',
      name: 'Floor 385',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [CROWNWORKS_STRIKER, BOAR, MUSTER_PIKE],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Proof House — Floors 386–400, levels 182–189, Fine 43–Fine 60 — the boards go light and the picks do not, and the thing the hold tested its plate against is at the top of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f386',
      name: 'Floor 386',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [FREE_BLADE, BANDIT, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f387',
      name: 'Floor 387',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [BOAR, CHALKHIDE_BROWSER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f388',
      name: 'Floor 388',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [BANDIT, MUSTER_PIKE, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f389',
      name: 'Floor 389',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [CHALKHIDE_BROWSER, THORNBACK_GRAZER, BOAR],
      },
    },
    {
      id: 't-dwarf-f390',
      name: 'Floor 390 — The Proof House',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [RACKPICKED_LEVY, MUSTER_PIKE, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f391',
      name: 'Floor 391',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [THORNBACK_GRAZER, BOAR, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f392',
      name: 'Floor 392',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [FREE_BLADE, BANDIT, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f393',
      name: 'Floor 393',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [BOAR, CHALKHIDE_BROWSER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f394',
      name: 'Floor 394',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [MIREWHELP, MUSTER_PIKE, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f395',
      name: 'Floor 395',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [ROADWATCH_BOWMAN, THORNBACK_GRAZER, BOAR],
      },
    },
    {
      id: 't-dwarf-f396',
      name: 'Floor 396',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [ASHPIT_SCUTTLER, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f397',
      name: 'Floor 397',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [FORLORN_LEVY, BOAR, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-dwarf-f398',
      name: 'Floor 398',
      enemies: {
        front: [WARPICK_LIEUTENANT, PROOFMARK_SERJEANT],
        back: [SCREEBACK_DARTER, BANDIT, MUSTER_PIKE],
      },
    },
    {
      id: 't-dwarf-f399',
      name: 'Floor 399',
      enemies: {
        front: [WARPICK_LIEUTENANT, RACKPICKED_LEVY],
        back: [CLEFTHORN_GORER, CHALKHIDE_BROWSER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-dwarf-f400',
      name: 'Floor 400 — The Proof House',
      enemies: {
        front: [THE_PROOF_HOUSE, FREE_BLADE],
        back: [BANDIT, FREE_BLADE, BANDIT],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Prentice Steps — Floors 401–420, levels 189–198, Masterwork 1–Masterwork 24 — the gear steps down from Fine 60 to Masterwork 1, so the band opens on the heaviest boards this hundred allows. One stroke a board, swung the way the hold taught.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f401',
      name: 'Floor 401',
      enemies: {
        front: [GANTRY_WARDEN, HEWSTROKE_PRENTICE],
        back: [MUSTER_PIKE, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f402',
      name: 'Floor 402',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, VANWARD_SPEAR],
        back: [CHALKHIDE_BROWSER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f403',
      name: 'Floor 403',
      enemies: {
        front: [GANTRY_WARDEN, HEWSTROKE_PRENTICE],
        back: [THORNBACK_GRAZER, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f404',
      name: 'Floor 404',
      enemies: {
        front: [CHALKHIDE_BROWSER, RENDFANG_JACKAL],
        back: [MUSTER_PIKE, ASHPIT_SCUTTLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f405',
      name: 'Floor 405',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, HEWSTROKE_PRENTICE],
        back: [THORNBACK_GRAZER, FREE_BLADE, BOAR],
      },
    },
    {
      id: 't-dwarf-f406',
      name: 'Floor 406',
      enemies: {
        front: [GANTRY_WARDEN, VANWARD_SPEAR],
        back: [CHALKHIDE_BROWSER, MIREWHELP, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f407',
      name: 'Floor 407',
      enemies: {
        front: [MUSTER_PIKE, HEWSTROKE_PRENTICE],
        back: [COUNTERWEIGHT_BEARER, FORLORN_LEVY, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f408',
      name: 'Floor 408',
      enemies: {
        front: [CHALKHIDE_BROWSER, RENDFANG_JACKAL],
        back: [GANTRY_WARDEN, ASHPIT_SCUTTLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f409',
      name: 'Floor 409',
      enemies: {
        front: [THORNBACK_GRAZER, HEWSTROKE_PRENTICE],
        back: [MUSTER_PIKE, MIREWHELP, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f410',
      name: 'Floor 410 — The Breach Reopened',
      enemies: {
        front: [THE_BREACHLORD, HEWSTROKE_PRENTICE],
        back: [MUSTER_PIKE, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f411',
      name: 'Floor 411',
      enemies: {
        front: [MUSTER_PIKE, VANWARD_SPEAR],
        back: [THORNBACK_GRAZER, BOAR, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f412',
      name: 'Floor 412',
      enemies: {
        front: [GANTRY_WARDEN, HEWSTROKE_PRENTICE],
        back: [CHALKHIDE_BROWSER, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f413',
      name: 'Floor 413',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, RENDFANG_JACKAL],
        back: [MUSTER_PIKE, MIREWHELP, BOAR],
      },
    },
    {
      id: 't-dwarf-f414',
      name: 'Floor 414',
      enemies: {
        front: [CHALKHIDE_BROWSER, HEWSTROKE_PRENTICE],
        back: [THORNBACK_GRAZER, SCREEBACK_DARTER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f415',
      name: 'Floor 415',
      enemies: {
        front: [GANTRY_WARDEN, VANWARD_SPEAR],
        back: [MUSTER_PIKE, BOAR, BANDIT],
      },
    },
    {
      id: 't-dwarf-f416',
      name: 'Floor 416',
      enemies: {
        front: [THORNBACK_GRAZER, HEWSTROKE_PRENTICE],
        back: [COUNTERWEIGHT_BEARER, ASHPIT_SCUTTLER, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f417',
      name: 'Floor 417',
      enemies: {
        front: [MUSTER_PIKE, RENDFANG_JACKAL],
        back: [CHALKHIDE_BROWSER, MIREWHELP, BOAR],
      },
    },
    {
      id: 't-dwarf-f418',
      name: 'Floor 418',
      enemies: {
        front: [GANTRY_WARDEN, HEWSTROKE_PRENTICE],
        back: [THORNBACK_GRAZER, FORLORN_LEVY, BANDIT],
      },
    },
    {
      id: 't-dwarf-f419',
      name: 'Floor 419',
      enemies: {
        front: [CHALKHIDE_BROWSER, VANWARD_SPEAR],
        back: [MUSTER_PIKE, SCREEBACK_DARTER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f420',
      name: 'Floor 420 — The Wheel Still Turns',
      enemies: {
        front: [THE_CROWN_WHEEL, HEWSTROKE_PRENTICE],
        back: [THORNBACK_GRAZER, MIREWHELP, BANDIT],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Second Hand — Floors 421–445, levels 199–210, Masterwork 25–Masterwork 54 — the Journeyman arrives and there are two strokes a board, and the grade climbs back through Masterwork underneath them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f421',
      name: 'Floor 421',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f422',
      name: 'Floor 422',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f423',
      name: 'Floor 423',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f424',
      name: 'Floor 424',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, ASHPIT_SCUTTLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f425',
      name: 'Floor 425',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, SCREEBACK_DARTER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f426',
      name: 'Floor 426',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, BOAR, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f427',
      name: 'Floor 427',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, MIREWHELP, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f428',
      name: 'Floor 428',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, BANDIT, BOAR],
      },
    },
    {
      id: 't-dwarf-f429',
      name: 'Floor 429',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, ASHPIT_SCUTTLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f430',
      name: 'Floor 430 — The Second Hand',
      enemies: {
        front: [WARPICK_LIEUTENANT, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CHALKHIDE_BROWSER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f431',
      name: 'Floor 431',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, MIREWHELP, BOAR],
      },
    },
    {
      id: 't-dwarf-f432',
      name: 'Floor 432',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f433',
      name: 'Floor 433',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, SCREEBACK_DARTER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f434',
      name: 'Floor 434',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f435',
      name: 'Floor 435',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, ASHPIT_SCUTTLER, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f436',
      name: 'Floor 436',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f437',
      name: 'Floor 437',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f438',
      name: 'Floor 438',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, SCREEBACK_DARTER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f439',
      name: 'Floor 439',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f440',
      name: 'Floor 440 — Both Hands Now',
      enemies: {
        front: [WARPICK_LIEUTENANT, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, THORNBACK_GRAZER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f441',
      name: 'Floor 441',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, ASHPIT_SCUTTLER, BOAR],
      },
    },
    {
      id: 't-dwarf-f442',
      name: 'Floor 442',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, MIREWHELP, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f443',
      name: 'Floor 443',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, BOAR, BANDIT],
      },
    },
    {
      id: 't-dwarf-f444',
      name: 'Floor 444',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, CINDER_CULLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f445',
      name: 'Floor 445',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, SCREEBACK_DARTER, MIREWHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Workmaster's Round — Floors 446–465, levels 210–219, Masterwork 55–Masterwork 78 — the Workmaster keeps the tenth floors and the pair keeps every board between, three strokes wide in the handover.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f446',
      name: 'Floor 446',
      enemies: {
        front: [PROOFMARK_SERJEANT, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, BOAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f447',
      name: 'Floor 447',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f448',
      name: 'Floor 448',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, ASHPIT_SCUTTLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f449',
      name: 'Floor 449',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CINDER_CULLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f450',
      name: 'Floor 450 — The Workmaster',
      enemies: {
        front: [THE_WORKMASTER, JOURNEYMAN_HEWER],
        back: [CHALKHIDE_BROWSER, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f451',
      name: 'Floor 451',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, SCREEBACK_DARTER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f452',
      name: 'Floor 452',
      enemies: {
        front: [PROOFMARK_SERJEANT, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, MIREWHELP, BOAR],
      },
    },
    {
      id: 't-dwarf-f453',
      name: 'Floor 453',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, ASHPIT_SCUTTLER, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f454',
      name: 'Floor 454',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, BANDIT, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f455',
      name: 'Floor 455',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, MIREWHELP, BOAR],
      },
    },
    {
      id: 't-dwarf-f456',
      name: 'Floor 456',
      enemies: {
        front: [PROOFMARK_SERJEANT, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, SCREEBACK_DARTER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f457',
      name: 'Floor 457',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, CINDER_CULLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f458',
      name: 'Floor 458',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, BOAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f459',
      name: 'Floor 459',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, ASHPIT_SCUTTLER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f460',
      name: 'Floor 460 — The Measure Taken',
      enemies: {
        front: [THE_WORKMASTER, JOURNEYMAN_HEWER],
        back: [THORNBACK_GRAZER, HEWSTROKE_PRENTICE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f461',
      name: 'Floor 461',
      enemies: {
        front: [PROOFMARK_SERJEANT, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, VANWARD_SPEAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f462',
      name: 'Floor 462',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, HEWSTROKE_PRENTICE, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f463',
      name: 'Floor 463',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, RENDFANG_JACKAL, BANDIT],
      },
    },
    {
      id: 't-dwarf-f464',
      name: 'Floor 464',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f465',
      name: 'Floor 465',
      enemies: {
        front: [PROOFMARK_SERJEANT, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, HEWSTROKE_PRENTICE, FREE_BLADE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Relic Racks — Floors 466–480, levels 220–227, Masterwork 79–Relic 16 — the grade steps to Relic at 468 and resets to +25.8% from Masterwork 80's +108%, so this band opens heavier than the one it follows. Three carriers a board.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f466',
      name: 'Floor 466',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, VANWARD_SPEAR, BOAR],
      },
    },
    {
      id: 't-dwarf-f467',
      name: 'Floor 467',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, RENDFANG_JACKAL, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f468',
      name: 'Floor 468',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CROWNWORKS_STRIKER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f469',
      name: 'Floor 469',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f470',
      name: 'Floor 470 — The Relic Racks',
      enemies: {
        front: [THE_WORKMASTER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CHALKHIDE_BROWSER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f471',
      name: 'Floor 471',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, RENDFANG_JACKAL, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f472',
      name: 'Floor 472',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, KINGSWAY_LANCER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f473',
      name: 'Floor 473',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, CROWNWORKS_STRIKER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f474',
      name: 'Floor 474',
      enemies: {
        front: [GANTRY_WARDEN, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, RENDFANG_JACKAL, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f475',
      name: 'Floor 475',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, VANWARD_SPEAR, BOAR],
      },
    },
    {
      id: 't-dwarf-f476',
      name: 'Floor 476',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CROWNWORKS_STRIKER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f477',
      name: 'Floor 477',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, RENDFANG_JACKAL, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f478',
      name: 'Floor 478',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, VANWARD_SPEAR, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f479',
      name: 'Floor 479',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, HEWSTROKE_PRENTICE, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f480',
      name: 'Floor 480 — The Racks Run Empty',
      enemies: {
        front: [THE_WORKMASTER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, CHALKHIDE_BROWSER, FREE_BLADE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Long Grain — Floors 481–495, levels 227–234, Relic 17–Relic 34 — a carrier steps into the back rank, where the pair is worth half a member more, and the authored weight eases as the grade climbs.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f481',
      name: 'Floor 481',
      enemies: {
        front: [CHALKHIDE_BROWSER, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, VANWARD_SPEAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f482',
      name: 'Floor 482',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [KINGSWAY_LANCER, RENDFANG_JACKAL, BANDIT],
      },
    },
    {
      id: 't-dwarf-f483',
      name: 'Floor 483',
      enemies: {
        front: [THORNBACK_GRAZER, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, CROWNWORKS_STRIKER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f484',
      name: 'Floor 484',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, KINGSWAY_LANCER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f485',
      name: 'Floor 485',
      enemies: {
        front: [MUSTER_PIKE, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, RENDFANG_JACKAL, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f486',
      name: 'Floor 486',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [CROWNWORKS_STRIKER, VANWARD_SPEAR, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f487',
      name: 'Floor 487',
      enemies: {
        front: [CHALKHIDE_BROWSER, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, KINGSWAY_LANCER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f488',
      name: 'Floor 488',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, CROWNWORKS_STRIKER, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f489',
      name: 'Floor 489',
      enemies: {
        front: [THORNBACK_GRAZER, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f490',
      name: 'Floor 490 — The Long Grain',
      enemies: {
        front: [THE_WORKMASTER, HEWSTROKE_PRENTICE],
        back: [MUSTER_PIKE, RENDFANG_JACKAL, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f491',
      name: 'Floor 491',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [VANWARD_SPEAR, RENDFANG_JACKAL, BANDIT],
      },
    },
    {
      id: 't-dwarf-f492',
      name: 'Floor 492',
      enemies: {
        front: [MUSTER_PIKE, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, RENDFANG_JACKAL, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f493',
      name: 'Floor 493',
      enemies: {
        front: [THORNBACK_GRAZER, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, VANWARD_SPEAR, CINDER_CULLER],
      },
    },
    {
      id: 't-dwarf-f494',
      name: 'Floor 494',
      enemies: {
        front: [CHALKHIDE_BROWSER, HEWSTROKE_PRENTICE],
        back: [JOURNEYMAN_HEWER, ROADWATCH_BOWMAN, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f495',
      name: 'Floor 495',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [RENDFANG_JACKAL, ASHPIT_SCUTTLER, FREE_BLADE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Masterstroke — Floors 496–500, levels 234–236, Relic 35–Relic 40 — the roof band. The boards go light and hot, and the one stroke the craft exists for is at the top of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f496',
      name: 'Floor 496',
      enemies: {
        front: [JOURNEYMAN_HEWER, HEWSTROKE_PRENTICE],
        back: [VANWARD_SPEAR, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f497',
      name: 'Floor 497',
      enemies: {
        front: [CHALKHIDE_BROWSER, JOURNEYMAN_HEWER],
        back: [HEWSTROKE_PRENTICE, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f498',
      name: 'Floor 498',
      enemies: {
        front: [JOURNEYMAN_HEWER, HEWSTROKE_PRENTICE],
        back: [FREE_BLADE, CINDER_CULLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f499',
      name: 'Floor 499',
      enemies: {
        front: [MUSTER_PIKE, JOURNEYMAN_HEWER],
        back: [MIREWHELP, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f500',
      name: 'Floor 500 — The Masterstroke',
      enemies: {
        front: [THE_MASTERSTROKE, FREE_BLADE],
        back: [BANDIT, FREE_BLADE, BANDIT],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Sinking Stair — Floors 501–520, levels 236–245, Relic 41–Relic 52 — the host goes down past everything it has taken. The hold's own ascended dead still anchor the boards, and the first stone that will not open is behind them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f501',
      name: 'Floor 501',
      enemies: {
        front: [THE_BREACHLORD, FREE_BLADE],
        back: [BANDIT, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f502',
      name: 'Floor 502',
      enemies: {
        front: [THE_BREACHLORD, ASHPIT_SCUTTLER],
        back: [MIREWHELP, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f503',
      name: 'Floor 503',
      enemies: {
        front: [THE_CROWN_WHEEL, RENDFANG_JACKAL],
        back: [MIREWHELP, FREE_BLADE, BANDIT],
      },
    },
    {
      id: 't-dwarf-f504',
      name: 'Floor 504',
      enemies: {
        front: [THE_BREACHLORD, FORLORN_LEVY],
        back: [MIREWHELP, ASHPIT_SCUTTLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f505',
      name: 'Floor 505',
      enemies: {
        front: [THE_CROWN_WHEEL, FREE_BLADE],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f506',
      name: 'Floor 506',
      enemies: {
        front: [THE_BREACHLORD, VANWARD_SPEAR],
        back: [MIREWHELP, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f507',
      name: 'Floor 507',
      enemies: {
        front: [THE_CROWN_WHEEL, FREE_BLADE],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f508',
      name: 'Floor 508',
      enemies: {
        front: [THE_BREACHLORD, ASHPIT_SCUTTLER],
        back: [ASHPIT_SCUTTLER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f509',
      name: 'Floor 509',
      enemies: {
        front: [THE_CROWN_WHEEL, RENDFANG_JACKAL],
        back: [DEADFALL_TIMBERER, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f510',
      name: 'Floor 510 — The Sinking Stair',
      enemies: {
        front: [THE_BREACHLORD, FREE_BLADE],
        back: [DEADFALL_TIMBERER, VANWARD_SPEAR, BANDIT],
      },
    },
    {
      id: 't-dwarf-f511',
      name: 'Floor 511',
      enemies: {
        front: [THE_MASTERSTROKE, ASHPIT_SCUTTLER],
        back: [MIREWHELP, ASHPIT_SCUTTLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f512',
      name: 'Floor 512',
      enemies: {
        front: [THE_CROWN_WHEEL, FREE_BLADE],
        back: [DEADFALL_TIMBERER, MIREWHELP, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f513',
      name: 'Floor 513',
      enemies: {
        front: [THE_MASTERSTROKE, RENDFANG_JACKAL],
        back: [BANDIT, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f514',
      name: 'Floor 514',
      enemies: {
        front: [THE_BREACHLORD, FREE_BLADE],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f515',
      name: 'Floor 515',
      enemies: {
        front: [THE_CROWN_WHEEL, FORLORN_LEVY],
        back: [ASHPIT_SCUTTLER, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f516',
      name: 'Floor 516',
      enemies: {
        front: [THE_MASTERSTROKE, FREE_BLADE],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f517',
      name: 'Floor 517',
      enemies: {
        front: [THE_BREACHLORD, VANWARD_SPEAR],
        back: [MIREWHELP, BANDIT, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-dwarf-f518',
      name: 'Floor 518',
      enemies: {
        front: [THE_CROWN_WHEEL, ASHPIT_SCUTTLER],
        back: [DEADFALL_TIMBERER, MIREWHELP, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f519',
      name: 'Floor 519',
      enemies: {
        front: [THE_MASTERSTROKE, ASHPIT_SCUTTLER],
        back: [BANDIT, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f520',
      name: 'Floor 520 — The Winze',
      enemies: {
        front: [THE_MASTERSTROKE, RENDFANG_JACKAL],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Adit — Floors 521–545, levels 246–257, Relic 53–Relic 67 — two courses of it now, and the Masterworks' own anchors are the last thing on these boards the party can open.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f521',
      name: 'Floor 521',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [MIREWHELP, FREE_BLADE, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f522',
      name: 'Floor 522',
      enemies: {
        front: [THE_MASTERSTROKE, ASHPIT_SCUTTLER],
        back: [DEADFALL_TIMBERER, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f523',
      name: 'Floor 523',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [MIREWHELP, MIREWHELP, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f524',
      name: 'Floor 524',
      enemies: {
        front: [THE_CROWN_WHEEL, DEADFALL_TIMBERER],
        back: [BANDIT, RENDFANG_JACKAL, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f525',
      name: 'Floor 525',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f526',
      name: 'Floor 526',
      enemies: {
        front: [THE_WORKMASTER, FREE_BLADE],
        back: [DEADFALL_TIMBERER, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f527',
      name: 'Floor 527',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [BANDIT, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f528',
      name: 'Floor 528',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f529',
      name: 'Floor 529',
      enemies: {
        front: [THE_CROWN_WHEEL, ASHPIT_SCUTTLER],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f530',
      name: 'Floor 530 — The Adit',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f531',
      name: 'Floor 531',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [BANDIT, FREE_BLADE, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f532',
      name: 'Floor 532',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [BANDIT, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f533',
      name: 'Floor 533',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f534',
      name: 'Floor 534',
      enemies: {
        front: [THE_MASTERSTROKE, ASHPIT_SCUTTLER],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f535',
      name: 'Floor 535',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f536',
      name: 'Floor 536',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f537',
      name: 'Floor 537',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [MIREWHELP, SCREEBACK_DARTER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f538',
      name: 'Floor 538',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f539',
      name: 'Floor 539',
      enemies: {
        front: [THE_WORKMASTER, FREE_BLADE],
        back: [STOPEWARD_MASON, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f540',
      name: 'Floor 540 — The Sump',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f541',
      name: 'Floor 541',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, BANDIT],
      },
    },
    {
      id: 't-dwarf-f542',
      name: 'Floor 542',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [MIREWHELP, RENDFANG_JACKAL, BANDIT],
      },
    },
    {
      id: 't-dwarf-f543',
      name: 'Floor 543',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f544',
      name: 'Floor 544',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f545',
      name: 'Floor 545',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Deep Galleries — Floors 546–565, levels 258–267, Relic 68–Relic 79 — the ascended anchors thin out and hand over to the hold's own legendaries, because at this depth an ascended block grows faster than a crew frozen at its rung does.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f546',
      name: 'Floor 546',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f547',
      name: 'Floor 547',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f548',
      name: 'Floor 548',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f549',
      name: 'Floor 549',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, BANDIT, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f550',
      name: 'Floor 550 — The Deep Galleries',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f551',
      name: 'Floor 551',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, BANDIT, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f552',
      name: 'Floor 552',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, FORLORN_LEVY, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f553',
      name: 'Floor 553',
      enemies: {
        front: [THE_MASTERSTROKE, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, ASHPIT_SCUTTLER, BANDIT],
      },
    },
    {
      id: 't-dwarf-f554',
      name: 'Floor 554',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, RENDFANG_JACKAL, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-dwarf-f555',
      name: 'Floor 555',
      enemies: {
        front: [THE_MASTERSTROKE, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f556',
      name: 'Floor 556',
      enemies: {
        front: [THE_WORKMASTER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, MIREWHELP, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f557',
      name: 'Floor 557',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, RENDFANG_JACKAL, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f558',
      name: 'Floor 558',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, ASHPIT_SCUTTLER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f559',
      name: 'Floor 559',
      enemies: {
        front: [GANTRY_WARDEN, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, RENDFANG_JACKAL, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f560',
      name: 'Floor 560 — The Stull Line',
      enemies: {
        front: [THE_WORKMASTER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f561',
      name: 'Floor 561',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-dwarf-f562',
      name: 'Floor 562',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, RENDFANG_JACKAL, FREE_BLADE],
      },
    },
    {
      id: 't-dwarf-f563',
      name: 'Floor 563',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, DEADFALL_TIMBERER],
        back: [STOPEWARD_MASON, VANWARD_SPEAR, MIREWHELP],
      },
    },
    {
      id: 't-dwarf-f564',
      name: 'Floor 564',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, ASHPIT_SCUTTLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f565',
      name: 'Floor 565',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, RENDFANG_JACKAL, SCREEBACK_DARTER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Pioneer's Heading — Floors 566–580, levels 267–274, Relic 80–Relic 88 — the lieutenant arrives. It stands in the front rank only where no returning anchor does; behind one it is worth 0.77 of five less, and beside one it is a wipe.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f566',
      name: 'Floor 566',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, VANWARD_SPEAR, BANDIT],
      },
    },
    {
      id: 't-dwarf-f567',
      name: 'Floor 567',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f568',
      name: 'Floor 568',
      enemies: {
        front: [PROOFMARK_SERJEANT, STOPEWARD_MASON],
        back: [UNDERSET_PIONEER, RENDFANG_JACKAL, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f569',
      name: 'Floor 569',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, CINDER_CULLER, FORLORN_LEVY],
      },
    },
    {
      id: 't-dwarf-f570',
      name: "Floor 570 — The Pioneer's Heading",
      enemies: {
        front: [UNDERSET_PIONEER, GANTRY_WARDEN],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, VANWARD_SPEAR],
      },
    },
    {
      id: 't-dwarf-f571',
      name: 'Floor 571',
      enemies: {
        front: [WARPICK_LIEUTENANT, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, HARNESS_CUTTER, SIGNAL_RUNNER],
      },
    },
    {
      id: 't-dwarf-f572',
      name: 'Floor 572',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [UNDERSET_PIONEER, RENDFANG_JACKAL, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f573',
      name: 'Floor 573',
      enemies: {
        front: [PROOFMARK_SERJEANT, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, MIREWHELP, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f574',
      name: 'Floor 574',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [UNDERSET_PIONEER, CINDER_CULLER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f575',
      name: 'Floor 575',
      enemies: {
        front: [WARPICK_LIEUTENANT, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, CINDER_CULLER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f576',
      name: 'Floor 576',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [UNDERSET_PIONEER, HARNESS_CUTTER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f577',
      name: 'Floor 577',
      enemies: {
        front: [GANTRY_WARDEN, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, CINDER_CULLER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f578',
      name: 'Floor 578',
      enemies: {
        front: [PROOFMARK_SERJEANT, STOPEWARD_MASON],
        back: [UNDERSET_PIONEER, HARNESS_CUTTER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f579',
      name: 'Floor 579',
      enemies: {
        front: [COUNTERWEIGHT_BEARER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, CINDER_CULLER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f580',
      name: 'Floor 580 — The Winding Hole',
      enemies: {
        front: [UNDERSET_PIONEER, STOPEWARD_MASON],
        back: [DEADFALL_TIMBERER, CINDER_CULLER, SIGNAL_RUNNER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Sunken Course — Floors 581–595, levels 274–281, Relic 89–Relic 97 — the returning anchors are gone entirely. Three carriers on every board, and the escort walks down from 560 raw health to 175 as the level line climbs under it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f581',
      name: 'Floor 581',
      enemies: {
        front: [UNDERSET_PIONEER, VANWARD_SPEAR],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f582',
      name: 'Floor 582',
      enemies: {
        front: [UNDERSET_PIONEER, FORLORN_LEVY],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f583',
      name: 'Floor 583',
      enemies: {
        front: [UNDERSET_PIONEER, RENDFANG_JACKAL],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f584',
      name: 'Floor 584',
      enemies: {
        front: [UNDERSET_PIONEER, MIREWHELP],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f585',
      name: 'Floor 585',
      enemies: {
        front: [UNDERSET_PIONEER, CINDER_CULLER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f586',
      name: 'Floor 586',
      enemies: {
        front: [UNDERSET_PIONEER, SIGNAL_RUNNER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f587',
      name: 'Floor 587',
      enemies: {
        front: [UNDERSET_PIONEER, CINDER_CULLER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f588',
      name: 'Floor 588',
      enemies: {
        front: [UNDERSET_PIONEER, SIGNAL_RUNNER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f589',
      name: 'Floor 589',
      enemies: {
        front: [UNDERSET_PIONEER, BAREMARK_GNAWER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f590',
      name: 'Floor 590 — The Sunken Course',
      enemies: {
        front: [UNDERSET_PIONEER, CINDER_CULLER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f591',
      name: 'Floor 591',
      enemies: {
        front: [UNDERSET_PIONEER, CHANNELBED_STALKER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f592',
      name: 'Floor 592',
      enemies: {
        front: [UNDERSET_PIONEER, BAREMARK_GNAWER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f593',
      name: 'Floor 593',
      enemies: {
        front: [UNDERSET_PIONEER, CHANNELBED_STALKER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f594',
      name: 'Floor 594',
      enemies: {
        front: [UNDERSET_PIONEER, SPOILCART_HAND],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f595',
      name: 'Floor 595',
      enemies: {
        front: [UNDERSET_PIONEER, BAREMARK_GNAWER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Undermost — Floors 596–600, levels 281–283, Relic 98–Relic 100 — the roof band, and the last five floors of the tower. The boards go lightest and hottest of the hundred, and the bottom of the dig is at the end of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-dwarf-f596',
      name: 'Floor 596',
      enemies: {
        front: [UNDERSET_PIONEER, CHANNELBED_STALKER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f597',
      name: 'Floor 597',
      enemies: {
        front: [UNDERSET_PIONEER, SPOILCART_HAND],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HEAPFOOT_RUMMAGER],
      },
    },
    {
      id: 't-dwarf-f598',
      name: 'Floor 598',
      enemies: {
        front: [UNDERSET_PIONEER, HEAPFOOT_RUMMAGER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, HARNESS_CUTTER],
      },
    },
    {
      id: 't-dwarf-f599',
      name: 'Floor 599',
      enemies: {
        front: [UNDERSET_PIONEER, HARNESS_CUTTER],
        back: [STOPEWARD_MASON, DEADFALL_TIMBERER, SPOIL_PICKER],
      },
    },
    {
      id: 't-dwarf-f600',
      name: 'Floor 600 — The Undermost',
      enemies: {
        front: [THE_UNDERMOST, HEAPFOOT_RUMMAGER],
        back: [SPOIL_PICKER, HARNESS_CUTTER, SPOIL_PICKER],
      },
    },
  ],
} as const;
