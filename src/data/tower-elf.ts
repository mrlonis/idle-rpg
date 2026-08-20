import {
  ACOLYTE,
  ANVILBACK_SMITH,
  ASHPIT_SCUTTLER,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BOAR,
  BOLTFAST_IRONSIDE,
  BONECHAIN_WARDEN,
  BRACEWORK_DELVER,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHALKHIDE_BROWSER,
  CHARNEL_DRUDGE,
  CINDERFLAW_PROVER,
  CINDERLING,
  CINDERQUENCH_BEARER,
  CINDER_CULLER,
  CLEFTHORN_GORER,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  COVENANT_BREAKER,
  DEEPGALLERY_RUNNER,
  DEEPLAMP_SEALER,
  DEEPROCK_MINER,
  DRIFTMOUTH_CHOKER,
  EDGETURN_WARDEN,
  EMBERSEED_WARLOCK,
  EMBERSHELL_WHELP,
  FORGE_THRALL,
  FORLORN_LEVY,
  FREE_BLADE,
  GATEFAST_WARDEN,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLASSCHOIR_ARBITER,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  GRUDGEPLATE_SMITH,
  HAG,
  HEADRACE_HAND,
  HEADSMAN,
  HELVESTRUCK_SMITH,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HUSHGLASS_WARDEN,
  IRONSLING_WRIGHT,
  KILNCRACK_CANTOR,
  KILNSTROKE_CELEBRANT,
  KILNSWORN_ADEPT,
  KINGSWAY_LANCER,
  KINSTONE_BEARER,
  KNELL_CHANTER,
  LUMEN_ACOLYTE,
  MARCHWARD_PIKEMAN,
  MARROWHUNT_ALPHA,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  OATHSHIELD_VANGUARD,
  OATHSTONE_BASTION,
  PLATESHOD_HAMMERER,
  PLUMBLINE_HAND,
  PROPGALLERY_HAND,
  PYRE,
  QUENCHPIT_IRONHIDE,
  QUENCHWRIGHT,
  RADIANT_HERALD,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTBORN_HARROWER,
  RIFTEDGE_CANTOR,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RINGWALL_HAMMERER,
  RIVEN_MARCHWARDEN,
  RIVETLINE_HAND,
  RUNEWARDEN,
  SCARBOUND_BELLOWER,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SETSTONE_DRUDGE,
  SHADE,
  SHARDLIGHT_ACOLYTE,
  SLAGBOUND_DRUDGE,
  SLAGHIDE_PURSUER,
  SLIME,
  SPLINTERYARD_HONER,
  STORMCALLER,
  THE_CAMWRIGHT,
  THE_DEADBOLT,
  THE_EDGEWRIGHT,
  THE_GRAVEWRIGHT,
  THE_GREAT_HELVE,
  THE_GRUDGEKEEPER,
  THE_PLATEWRIGHT,
  THE_WARDWRIGHT,
  THORNBACK_GRAZER,
  THORNWEALD_WARDEN,
  UNMARKED_WARDEN,
  VAULTBOUND_GAOLER,
  VAULTLIGHT_CENSER,
  WARDEN,
  WARDSTONE_KEEPER,
  WEALDSHADOW_STALKER,
  WISP,
  WRATHBORN,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Elf Tower — five hundred floors, enemy levels 1 to 236.
 *
 * ## Why the enemies are mostly Dwarven
 *
 * Dwarves beat Elves in the matchup cycle, so this is the tower that punishes the crew it admits.
 * Just under two thirds of the slots are Dwarven and the rest are spread across the other six
 * factions — [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this
 * paragraph.
 *
 * ⚠️ **Every hundred has wanted to be far more Dwarven than that**, exactly as 21e's and 21f's did,
 * and the correction is made while authoring rather than afterwards: non-Dwarf bodies of comparable
 * weight fill the slots where composition is worth nothing anyway. That is a thing to do on purpose,
 * and it is now four sessions for four. ⚠️ **The fourth hundred is the worst overshoot of the four**
 * — authored from the Dwarf bench it came out at **85.2% Dwarf**, which took the whole tower to
 * **65.34%** and over the ceiling. Converting one texture slot per affected board, spread across all
 * five bands and never touching an axis carrier or an anchor, took the hundred to 75.6% and the tower
 * to **62.99%**. ⚠️ **The substitutes are drawn only from factions that also counter Elves** —
 * monster, angel and demon — because a swap to anything else turns the lean off on that board.
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
 * ## ⚠️ The fourth hundred — the Plating Floor — is attack and the health standing under it
 *
 * Floors 301–400, levels 142–189, and the gear ramp arrives **free**: `TOWER_RULES.gear` is one rule
 * for all seven towers, Worn 1 at floor 301 to Fine 60 at the roof with grades stepping at 301, 318
 * and 351. So where the Human fourth hundred spent that ramp *as* its axis, this one had to find an
 * axis on top of it — and the honest finding of the session is that **nothing else moves an Elf five
 * at all.**
 *
 * Against a calibrated geared control at level 189 in Fine 60 — an anchor at 1000/58 behind four
 * bodies at 520/36, reading **4.00 / 3.95**, and it moves — forty seeds, zero timeouts on every row:
 *
 * | four carriers at       | reference | alternate | worth to the alternate |
 * | ---------------------- | --------- | --------- | ---------------------- |
 * | 520 / 36 — the control | 4.00      | 3.95      | —                      |
 * | 520 / 44               | 3.95      | 3.20      | 0.75                   |
 * | 520 / 52               | 3.55      | 1.55      | 2.40                   |
 * | 700 / 36               | 4.00      | 3.77      | 0.18                   |
 * | 900 / 36               | 4.00      | 3.20      | 0.75                   |
 * | **700 / 52**           | 3.17      | **0.33**  | **3.62**               |
 * | **900 / 44**           | 3.50      | **0.85**  | **3.10**               |
 *
 * **Neither half is worth much alone and together they are the whole board.** ⚠️ **It grades in
 * carrier counts as well as in value**, which is what five bands need: at 700/52, by how many of four
 * carry it, 3.95 → 3.88 → 3.13 → 1.75 → **0.33**; at 900/62, 3.95 → 3.60 → 1.48 → 0.03 → 0.00.
 *
 * ⚠️ **The mechanism is that an Elf five kills anything soft before it swings twice**, so attack only
 * bills for as long as the body carrying it lives. One body at `atk` 70 reads 3.98 of five on 340
 * health, 3.80 on 520, 3.55 on 800 and **3.08** on 1100. Held the other way — the same 202 points of
 * board attack, redistributed — 90 on one soft escort reads **4.88** and 118 on the anchor reads
 * **2.75**: identical throughput, 2.13 of five apart. ⚠️ **{@link COLOSSUS} is the proof and the reason
 * it can still be fielded here**: 1250/88 is the second heaviest Dwarf `ascended` line in the game and
 * it reads 4.00 / 4.08 alone at the roof's level, because its `haste` is **58** — the lowest in the
 * game — so a third of its attack never lands. What refuses the axis is time, and every stat that buys
 * time buys difficulty with it.
 *
 * | Band | Floors  | Levels  | Grade             | Carriers per board | Raw health  |
 * | ---- | ------- | ------- | ----------------- | ------------------ | ----------- |
 * | 1    | 301–320 | 142–151 | Worn 1–Sturdy 4   | 1                  | 3,240–3,960 |
 * | 2    | 321–345 | 152–163 | Sturdy 5–34       | 2–3                | 3,360–4,160 |
 * | 3    | 346–365 | 164–173 | Sturdy 35–Fine 18 | 3–4                | 3,640–4,100 |
 * | 4    | 366–385 | 173–182 | Fine 19–42        | 2–3                | 3,700–4,470 |
 * | 5    | 386–400 | 182–189 | Fine 43–60        | 2                  | 3,500–4,020 |
 *
 * ⚠️ **A carrier is stated as a count of bodies at `atk` ≥ 62 on `hp` ≥ 640 rather than as an
 * absolute, because both halves are *common* stats** — 109 of the 330 blocks that predate this hundred
 * carry one, at a median `atk` of 76 — so "the hot bodies arrive in band 2" would be false the day it
 * was written. That is chapter 23's counts-not-absolutes fix, on a tower. ⚠️ **The count falls in the
 * closing bands and that is the ramp working**: a third carrier at level 188 is worth **3.15 of five**
 * (floor 398's board reads 3.40 with two carriers and **0.25 with three**), so the last fifteen floors trade
 * carriers for a grade worth +65.7% health on a `tank`, exactly as the Human and Dwarf fourth hundreds
 * let their authored weight fall.
 *
 * ### ⚠️ Two of this tower's own roofs had to retire, and the pair that went is not the heaviest
 *
 * Behind four low-`atk` commons at level 189 in Fine 60, {@link THE_GRUDGEKEEPER} at 1520/89 reads
 * **78% / 2.15** and {@link COLOSSUS} at 1250/88 reads **4.00 / 4.08**, while {@link THE_EDGEWRIGHT} at
 * 1300/84 — the hundred below's own roof, and 220 health lighter than the Grudgekeeper — reads
 * **5% / 0.05**, {@link THE_WARDWRIGHT} at 1560/92 reads 20% / 0.38, `THE_DOORSTONE` at 1480/88 reads
 * 0% and `THE_ANVIL_CROWNED` at 1750/97 reads 0%. **Weight predicts none of it.** The Edgewright fails
 * on its `critChance` 0.22 at `critDamageAmp` 1.15 — the *third* hundred's axis, against a crew with
 * zero of either answering stat — and the Doorstone on its `def` 70 and `physicalResist` 0.30, which
 * buy it 29 seconds of swinging where the Grudgekeeper gets 17. The Demon Tower's finding, sharpened:
 * there one roof retired, here two do while an older and heavier block stands. **Field each candidate
 * anchor alone before concluding anything from a column of stat lines.**
 *
 * ### ⚠️ What the boards found that the control did not
 *
 * - ⚠️ **The Splintering collapses.** The shipped floor-300 board fielded up the level line reads 100%
 *   with all five alive at its own level 142, 100% / 4.72 at 170, and **3% with 0.03 against 0%** at
 *   189 in Fine 60.
 * - ⚠️ **The roof's escort is the whole question and its attack settled the boss.** With weight held at
 *   1240 the roof reads 2.70 (95%) at `atk` 78, 3.45 at 70, **2.48 at 64** and 4.03 at 54; and behind
 *   the same line, one {@link RIVETLINE_HAND} plus three low-`atk` commons closes at 93% / 2.48 where
 *   swapping the Rivetline for {@link ANVILBACK_SMITH} reads **57% / 1.25**, a mid-weight escort reads
 *   **63% / 1.30**, and a second carrier reads **0%**. Both halves of a roof, not one.
 * - ⚠️ **The axis carries the last floor rather than riding along.** The roof board with the attack
 *   stripped out of the boss and its escort reads 100% / 4.00 and 100% / 4.38 against 3.77 and 2.48 for
 *   the same five bodies at their shipped lines — worth 0.23 and **1.90** of five on floor 400. (Both
 *   figures are from the same synthetic pairing; the shipped floor itself sweeps at 3.88 and 2.33,
 *   because a battle's seed is derived from the stage id.)
 * - ⚠️ **A band-boundary dip is the one shape to watch here**, because band 5 is where the authored
 *   weight *falls*. Floor 385 first read 2.65 against floor 386's 4.03, which is a step backwards on
 *   the way into the closing band; lightening 385's escort and opening 386 heavier put the seam at
 *   3.40 → 3.85.
 *
 * ## What the bands measure at
 *
 * Third hundred: floor 201 in two seconds with all five alive, 250 in four, 270 in five with 4.22, 280
 * in seven with 4.00, 290 in eight with 3.67; the roof takes the reference five 8.2 seconds and costs
 * it 1.58 of five, and the alternate clears it at **88% with 2.02**.
 *
 * Fourth hundred: floor 301 in two and a half seconds with all five alive, 320 in three and a half,
 * 345 in four, 360 in six with 4.38, 380 in eleven with 3.67, 390 in thirteen with 3.45, 399 in twelve
 * with 3.38, and the roof in **twenty seconds at 85% with 2.33 — 13.3s and 3.88 for the reference
 * five.** ⚠️ **Zero timeouts anywhere in the hundred and the longest single attempt is 32.0 seconds**
 * against the sweep's 67.5-second bar for a cleared fight, which is the whole of why an axis that other
 * towers had to refuse for the clock is affordable here. The reference five loses nobody below floor
 * 350 and the alternate below floor 346.
 *
 * ⚠️ **The sustain claim is stated in counts, because the absolute form has shipped wrong four times
 * across the seven towers and always on one of five different words.** Over the 40 blocks the fourth
 * hundred fields: **zero** carry a point of `lifeLeech`, **zero** carry a heal, drain or shield effect,
 * and **zero** carry a `regen` status. What it does carry is `recovery` on five blocks standing on 23
 * boards, `healthRegen` on two standing on 14, a ward status on one standing on seven, and a taunt on
 * two standing on ten. ⚠️ **No board pairs a taunt with a body that refills** — the two boards that did
 * were found by walking all four hundred floors with a script rather than by reading them, and the two
 * that remain carry the `recovery` on the body that is *itself* the taunt, which is the tolerable form.
 * ⚠️ **No board pairs two `ascended` blocks.**
 *
 * ⚠️ **This is the one tower where the ninety-second clock has never been the constraint, and it still
 * authors no sustain.** Measured here, enemy sustain is worth **0.07 of a survivor** across the entire
 * vocabulary — `lifeLeech` 0.45 on all four (3.92), `recovery` 30 (3.88), `healthRegen` 22 (**3.95,
 * exactly the control**), a back-rank healer (4.00) and `REGENERATION` on `ally-all` (3.98). A hundred
 * does not get to relax a termination argument because its own crew happens to clear in ten seconds.
 *
 * ## ⚠️ The fifth hundred — the Trip-Hammers — is the fourth hundred's sentence read backwards
 *
 * Floors 401–500, levels 189–236, Masterwork 1 to Relic 40: the works have stopped being swung by
 * hand. Water is let into the head race, a cam barrel turns, and the helve comes down on a beat
 * nothing in the hold sets any more. The whole measurement lives in [`enemies.ts`](./enemies.ts)
 * beside the four blocks that carry it; what belongs here is what the floors do with it and what the
 * hundred is allowed to claim.
 *
 * 1. ⚠️ **The axis is `atk` and `haste` carried together on light bodies, and it is this tower's own
 *    fourth-hundred mechanism arriving from the other end.** The Plating Floor found that attack
 *    only bills for as long as the body carrying it lives, and proved it on {@link COLOSSUS} —
 *    1250/88 reading 4.00 of five alone because its `haste` is 58 and a third of its attack never
 *    lands. This hundred authors the same attack **arriving earlier**. Priced against the hundred's
 *    own control at level 236 in Relic 40, forty seeds, zero timeouts: `atk` alone is worth
 *    0.00 / 1.03 of five, `haste` alone **0.00 / 0.03**, and the two together **0.20 / 2.03** against
 *    a sum of halves of 1.05 — ×1.93 super-additive, which is the Monster fourth hundred's licence
 *    for building on the axis below.
 * 2. ⚠️ **The licence is margin rather than exclusivity, and what makes it authorable is the clock.**
 *    Across all fourteen shipped arrangements — each calibrated to the heaviest mirror control it
 *    still reads ≥3.75 on — the pair puts **elf-alt fourth of fourteen** and elf-ref eleventh. The
 *    same difficulty takes elf-alt **16 seconds** and dwarf-alt **46**. ⚠️ **This is the one tower
 *    that can spend the refusal vocabulary at all** — at band 5 `def` 110 is worth 0.38 / 2.85,
 *    `physicalResist` 0.40 0.38 / 2.70 and `dodge` 0.50 0.77 / 3.25, all of which the fourth hundred
 *    measured inert, so **a refusal recorded on size expires here too** — and it spends the half that
 *    converts budget into deaths rather than into seconds. `def` 110 costs dwarf-alt 3.90 at **66
 *    seconds**, which is not a board anybody may author.
 * 3. ⚠️ **Crit denial was the axis this session set out to build and it measured inert.** Four
 *    carriers at `critBlock` 0.36 with `critDamageResist` 0.90 — complete immunity against the
 *    deepest crit register any party in this game carries (Σ1.03 / Σ3.67 and Σ1.08 / Σ3.80 of chance
 *    and amp, all five members) — is worth **0.05 of five to the alternate and 0.00 to the
 *    reference**, and buys a second of fight. Chapter 23's "a lock is worth what the party has staked
 *    on the thing it denies" is a claim about a *mechanism*; crit on this crew is a 13% throughput
 *    bonus. **The third hundred already spent this tower's crit conversation and the mirror direction
 *    is not there.**
 * 4. ⚠️ **The anchor-retirement check comes back completely clean, which is a first for this tower
 *    and the opposite of the hundred below.** Fielded alone behind four 300/18 commons at floor 500
 *    in Relic 40, **every one of the fourth hundred's blocks stands** — the Grudgekeeper at 1520/89
 *    reads 98% / 2.63 against 90% / 2.58, the Colossus 100% / 4.00, the Platewright 100% / 3.90 —
 *    where two of this tower's own roofs had to retire a hundred floors below. The reason is the band
 *    boundary: band 5's crew gains a whole rung and twenty-four levels where the boards gain
 *    forty-seven, and ×1.6 outruns `perLevel.ascended`. **Run the check regardless; a clean answer is
 *    a result.**
 * 5. ⚠️ **The board budget still falls, and the fourth hundred's own boards are the proof.** Floor
 *    400's shipped board carried up to floor 500 reads **100% / 2.40 against 3% / 0.05** — past the
 *    alternate's bar — and floor 350's reads **0% for both**, because that board carries **four**
 *    bodies at `atk` ≥ 62 where floor 400's carries two. **What bounds a board here is how many hot
 *    bodies stand on it rather than what it weighs**: floor 350 at 4,100 raw health is unauthorable
 *    at 500 while floor 400, 375 health lighter, is merely too hard.
 *
 * The bands walk the carrier count, counted as bodies at `atk` ≥ 34 with `haste` ≥ 100 per board — a
 * **count**, because both halves are common stats and an absolute claim would be false the day it was
 * written:
 *
 * | Band | Floors  | Levels  | Grade              | Carriers | Raw health  |
 * | ---- | ------- | ------- | ------------------ | -------- | ----------- |
 * | 1    | 401–420 | 189–198 | Masterwork 1–24    | 1        | 2,930–3,920 |
 * | 2    | 421–445 | 199–210 | Masterwork 25–54   | 1–2      | 2,890–3,840 |
 * | 3    | 446–467 | 211–220 | Masterwork 55–80   | 2        | 2,690–3,700 |
 * | 4    | 468–485 | 221–229 | Relic 2–22         | 2        | 3,110–3,800 |
 * | 5    | 486–495 | 229–234 | Relic 23–34        | 3        | 3,020–3,360 |
 * | 6    | 496–500 | 234–236 | Relic 35–40        | 2–3      | 3,060–3,640 |
 *
 * ⚠️ **Every substitute in the hundred carries `haste` under 100, and that is a constraint the first
 * pass missed rather than a coincidence.** The lean overshoot is corrected by converting texture slots
 * to monster, angel and demon bodies — and the light commons of those three factions are *fast*
 * (Vaultlight Censer 104, Zenith Chorister 106, Shardlight Acolyte and Cinderling 108, Carrion Swarm
 * 124, Cinder Culler 126). Fielded as texture they silently count as carriers and **flattened the
 * table to three on every board of every band**, which is a band table that says nothing. The
 * substitute pools are drawn from the slow tail of the same three factions instead.
 *
 * ⚠️ **The gear ramp is inherited rather than spent and it steps _down_ inside the hundred** — floor
 * 400 wears Fine 60 at +65.7% health on a `tank` and floor 401 wears Masterwork 1 at **+20.2%**; floor
 * 467 wears Masterwork 80 at +108.0% and floor 468 wears Relic 2 at **+27.2%** — so bands 1 and 4 open
 * heavier in authored weight than the floors they follow, exactly as the Human and Dwarf fifth
 * hundreds' do.
 *
 * ⚠️ **`SLOW` is a lock on this crew rather than texture, and the claim is stated in counts because
 * the absolute form is false — the prose check is what caught it.** The status multiplies `haste` by
 * 0.7 and an Elf five carries the highest `haste` in the game (Σ580 / Σ620), so a draft in which the
 * three axis carriers each applied it took the binding arrangement to **0% at every roof attack from
 * 28 down to 12**, where the identical board without the rider clears at 83%. It is the second
 * hundred's Cairn Sentinel note — "a Cairn Sentinel slows exactly the stat an Elf five is built out
 * of" — priced at fifth-hundred weight. So the four new blocks do not carry it and **the roof is the
 * only new block that does**; what the *boards* carry is eight returning bodies spread over **30 of
 * the hundred's 100 boards, one of which fields two**, against the fourth hundred's **62 boards, 18
 * of them with two and a peak of three**. **Halved rather than banned, and counted rather than
 * asserted.**
 *
 * ⚠️ **The roof was settled on its attack, which is the fifth tower roof running.** With weight held
 * at 1180, [`THE_GREAT_HELVE`](./enemies.ts) reads **3% for the binding arrangement at `atk` 28** and
 * **100% / 3.80 against 83% / 2.00 at the shipped 24** — and the axis carries the floor rather than
 * riding along: the same board with its carriers' `haste` dropped to 90 reads 4.00 and 4.03, so the
 * beat is worth **0.20 of five to the reference and 2.03 to the alternate** on the top floor.
 *
 * ⚠️ **The closing five floors are pinned rather than composed from the pools**, because the returning
 * pool puts 1060/80 next to 720/70 and at these levels that reads as a saw rather than an approach.
 * Each was measured on its own so the alternate's survivors fall into the boss: 4.40 → 4.03 → 3.85 →
 * 2.55 → 2.00.
 *
 * ## What the bands measure at
 *
 * Fifth hundred: floor 401 in two and a half seconds with all five alive, 420 in four and a half at
 * 4.85, 445 in five, 460 in ten at 4.00, 480 in ten at 4.00, 490 in twelve, 499 in ten with the
 * alternate at **90% and 2.55**, and the roof in **seventeen seconds at 100% / 3.80 — 27.3s and 83% /
 * 2.00 for the alternate five**. ⚠️ **Zero timeouts anywhere in the hundred; the longest single
 * attempt is 45.2 seconds** against the sweep's 67.5-second bar, and the longest the reference five
 * ever spends is 18.0. The reference five loses nobody below floor 420 and the alternate below floor
 * 440.
 *
 * ⚠️ **The sustain claim is stated in counts, and this hundred can make the strict form.** Of the
 * **43 blocks** it fields: **zero** carry a point of `lifeLeech`, `recovery` or `healthRegen`;
 * **zero** carry a heal, drain or shield effect; **zero** carry a `regen`, ward or guard status; and
 * **zero** carry a taunt. That took four blocks out of the draft — the Colossus and the Rimeplate on
 * `recovery`, the Riven Marchwarden on both, and the Edgeturn Warden on its taunt — all of which the
 * fourth hundred fields freely, and all of which stay fielded there. One block carries a reflect
 * (the Grudgeplate Smith's `THORNMAIL`), which is neither sustain nor a taunt. ⚠️ **No board pairs
 * two `ascended` blocks**, and ⚠️ **no board carries more than two bodies with a board-wide turn** —
 * the generated draft came out at a mean of 1.46 a board with a peak of **four**, which is exactly
 * the shape this tower's third hundred measured at 0%. Capped, the hundred ships at a mean of **0.75
 * with 17 boards over one**, against the third and fourth hundreds' 0.62 and 1.03.
 *
 * Re-run `npm run test:balance` after touching any band above floor 180, 270, 385 or 485.
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
    // The Sighting Gallery — Floors 121–140, levels 58–66 — the surveyors' works, where everything on the board already has a line on the rank the party has been hiding behind.
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
    // The Cantor's Line — Floors 246–270, levels 116–128 — a third voice, and it is the one that goes looking for whoever is already hurt.
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

    // -------------------------------------------------------------------------------------
    // The Rivet Line — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — the works have stopped making edges. One body a board now carries what the line was making, and it is wearing the works' own plate — the third geared hundred in the towers, after the Human and Dwarf fourth hundreds.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f301',
      name: 'Floor 301',
      enemies: {
        front: [ANVILBACK_SMITH, BRACEWORK_DELVER],
        back: [ASHPIT_SCUTTLER, PROPGALLERY_HAND, MARCHWARD_PIKEMAN],
      },
    },
    {
      id: 't-elf-f302',
      name: 'Floor 302',
      enemies: {
        front: [SENTINEL, GATEFAST_WARDEN],
        back: [WARDSTONE_KEEPER, PLUMBLINE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f303',
      name: 'Floor 303',
      enemies: {
        front: [RIVETLINE_HAND, KINSTONE_BEARER],
        back: [ASHPIT_SCUTTLER, SLAGBOUND_DRUDGE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f304',
      name: 'Floor 304',
      enemies: {
        front: [GRUDGEPLATE_SMITH, THORNBACK_GRAZER],
        back: [BRACEWORK_DELVER, CINDERQUENCH_BEARER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f305',
      name: 'Floor 305',
      enemies: {
        front: [ANVILBACK_SMITH, EDGETURN_WARDEN],
        back: [SHARDLIGHT_ACOLYTE, PROPGALLERY_HAND, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f306',
      name: 'Floor 306',
      enemies: {
        front: [DEEPLAMP_SEALER, THORNBACK_GRAZER],
        back: [BRACEWORK_DELVER, MARCHWARD_PIKEMAN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f307',
      name: 'Floor 307',
      enemies: {
        front: [RIVETLINE_HAND, GATEFAST_WARDEN],
        back: [RENDFANG_JACKAL, KINSTONE_BEARER, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f308',
      name: 'Floor 308',
      enemies: {
        front: [DEEPLAMP_SEALER, EDGETURN_WARDEN],
        back: [WARDSTONE_KEEPER, SLAGBOUND_DRUDGE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f309',
      name: 'Floor 309',
      enemies: {
        front: [ANVILBACK_SMITH, KINSTONE_BEARER],
        back: [ASHPIT_SCUTTLER, MARCHWARD_PIKEMAN, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f310',
      name: 'Floor 310 — The Rivet Line',
      enemies: {
        front: [ANVILBACK_SMITH, RIMEPLATE],
        back: [BRACEWORK_DELVER, COLDFORGE_HAND, MARCHWARD_PIKEMAN],
      },
    },
    {
      id: 't-elf-f311',
      name: 'Floor 311',
      enemies: {
        front: [ANVILBACK_SMITH, BRACEWORK_DELVER],
        back: [ASHPIT_SCUTTLER, PROPGALLERY_HAND, MARCHWARD_PIKEMAN],
      },
    },
    {
      id: 't-elf-f312',
      name: 'Floor 312',
      enemies: {
        front: [SENTINEL, GATEFAST_WARDEN],
        back: [WARDSTONE_KEEPER, PLUMBLINE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f313',
      name: 'Floor 313',
      enemies: {
        front: [RIVETLINE_HAND, KINSTONE_BEARER],
        back: [ASHPIT_SCUTTLER, SLAGBOUND_DRUDGE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f314',
      name: 'Floor 314',
      enemies: {
        front: [GRUDGEPLATE_SMITH, THORNBACK_GRAZER],
        back: [BRACEWORK_DELVER, CINDERQUENCH_BEARER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f315',
      name: 'Floor 315',
      enemies: {
        front: [ANVILBACK_SMITH, EDGETURN_WARDEN],
        back: [SHARDLIGHT_ACOLYTE, PROPGALLERY_HAND, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f316',
      name: 'Floor 316',
      enemies: {
        front: [DEEPLAMP_SEALER, THORNBACK_GRAZER],
        back: [BRACEWORK_DELVER, MARCHWARD_PIKEMAN, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f317',
      name: 'Floor 317',
      enemies: {
        front: [RIVETLINE_HAND, GATEFAST_WARDEN],
        back: [RENDFANG_JACKAL, KINSTONE_BEARER, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f318',
      name: 'Floor 318',
      enemies: {
        front: [DEEPLAMP_SEALER, EDGETURN_WARDEN],
        back: [WARDSTONE_KEEPER, SLAGBOUND_DRUDGE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f319',
      name: 'Floor 319',
      enemies: {
        front: [ANVILBACK_SMITH, KINSTONE_BEARER],
        back: [ASHPIT_SCUTTLER, MARCHWARD_PIKEMAN, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f320',
      name: 'Floor 320 — The Line Runs Cold',
      enemies: {
        front: [ANVILBACK_SMITH, RIMEPLATE],
        back: [BRACEWORK_DELVER, COLDFORGE_HAND, MARCHWARD_PIKEMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Plate Shop — Floors 321–345, levels 152–163, Sturdy 5–34 — two of them, and the grade steps to Sturdy underneath. Neither half is the point: a hot body the party removes in two swings is worth almost nothing, and the shop is where the health arrives to stop that happening.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f321',
      name: 'Floor 321',
      enemies: {
        front: [ANVILBACK_SMITH, RIVETLINE_HAND],
        back: [RENDFANG_JACKAL, MARCHWARD_PIKEMAN, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f322',
      name: 'Floor 322',
      enemies: {
        front: [SPLINTERYARD_HONER, SENTINEL],
        back: [GRUDGEPLATE_SMITH, KINSTONE_BEARER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f323',
      name: 'Floor 323',
      enemies: {
        front: [RINGWALL_HAMMERER, RIVETLINE_HAND],
        back: [DEEPLAMP_SEALER, CARRION_SWARM, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f324',
      name: 'Floor 324',
      enemies: {
        front: [ANVILBACK_SMITH, QUENCHWRIGHT],
        back: [EDGETURN_WARDEN, COLDFORGE_HAND, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f325',
      name: 'Floor 325',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, RIMEPLATE],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f326',
      name: 'Floor 326',
      enemies: {
        front: [BOLTFAST_IRONSIDE, SENTINEL],
        back: [SPLINTERYARD_HONER, BRACEWORK_DELVER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f327',
      name: 'Floor 327',
      enemies: {
        front: [ANVILBACK_SMITH, DEEPLAMP_SEALER],
        back: [RIVETLINE_HAND, SHARDLIGHT_ACOLYTE, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f328',
      name: 'Floor 328',
      enemies: {
        front: [SPLINTERYARD_HONER, RIVETLINE_HAND],
        back: [QUENCHWRIGHT, KINSTONE_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f329',
      name: 'Floor 329',
      enemies: {
        front: [MARROWHUNT_ALPHA, ANVILBACK_SMITH],
        back: [GRUDGEPLATE_SMITH, RENDFANG_JACKAL, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f330',
      name: 'Floor 330 — The Plate Shop',
      enemies: {
        front: [ANVILBACK_SMITH, COLDHEARTH_IRONSWORN],
        back: [RIVETLINE_HAND, EDGETURN_WARDEN, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f331',
      name: 'Floor 331',
      enemies: {
        front: [RIVEN_MARCHWARDEN, RIVETLINE_HAND],
        back: [COLDHEARTH_IRONSWORN, SHARDLIGHT_ACOLYTE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f332',
      name: 'Floor 332',
      enemies: {
        front: [ANVILBACK_SMITH, RIVETLINE_HAND],
        back: [BRACEWORK_DELVER, MARCHWARD_PIKEMAN, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f333',
      name: 'Floor 333',
      enemies: {
        front: [SPLINTERYARD_HONER, SENTINEL],
        back: [GRUDGEPLATE_SMITH, THORNBACK_GRAZER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f334',
      name: 'Floor 334',
      enemies: {
        front: [RINGWALL_HAMMERER, RIVETLINE_HAND],
        back: [DEEPLAMP_SEALER, SLAGBOUND_DRUDGE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f335',
      name: 'Floor 335',
      enemies: {
        front: [ANVILBACK_SMITH, QUENCHWRIGHT],
        back: [EDGETURN_WARDEN, ASHPIT_SCUTTLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f336',
      name: 'Floor 336',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, RIMEPLATE],
        back: [RIVETLINE_HAND, MARCHWARD_PIKEMAN, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f337',
      name: 'Floor 337',
      enemies: {
        front: [BOLTFAST_IRONSIDE, SENTINEL],
        back: [SPLINTERYARD_HONER, RENDFANG_JACKAL, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f338',
      name: 'Floor 338',
      enemies: {
        front: [ANVILBACK_SMITH, DEEPLAMP_SEALER],
        back: [RIVETLINE_HAND, WARDSTONE_KEEPER, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f339',
      name: 'Floor 339',
      enemies: {
        front: [SPLINTERYARD_HONER, RIVETLINE_HAND],
        back: [QUENCHWRIGHT, THORNBACK_GRAZER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f340',
      name: 'Floor 340 — What the Shop Was For',
      enemies: {
        front: [ANVILBACK_SMITH, COLDHEARTH_IRONSWORN],
        back: [RIVETLINE_HAND, EDGETURN_WARDEN, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f341',
      name: 'Floor 341',
      enemies: {
        front: [MARROWHUNT_ALPHA, ANVILBACK_SMITH],
        back: [GRUDGEPLATE_SMITH, RENDFANG_JACKAL, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f342',
      name: 'Floor 342',
      enemies: {
        front: [RIVEN_MARCHWARDEN, RIVETLINE_HAND],
        back: [COLDHEARTH_IRONSWORN, WARDSTONE_KEEPER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f343',
      name: 'Floor 343',
      enemies: {
        front: [ANVILBACK_SMITH, RIVETLINE_HAND],
        back: [RENDFANG_JACKAL, MARCHWARD_PIKEMAN, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f344',
      name: 'Floor 344',
      enemies: {
        front: [SPLINTERYARD_HONER, SENTINEL],
        back: [GRUDGEPLATE_SMITH, KINSTONE_BEARER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f345',
      name: 'Floor 345',
      enemies: {
        front: [RINGWALL_HAMMERER, RIVETLINE_HAND],
        back: [DEEPLAMP_SEALER, CARRION_SWARM, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Weighing House — Floors 346–365, levels 163–172, Sturdy 35–Fine 18 — three abreast, and Fine plate arrives on the boards carrying them. This is where the two halves stop being two halves.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f346',
      name: 'Floor 346',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, BRACEWORK_DELVER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f347',
      name: 'Floor 347',
      enemies: {
        front: [ANVILBACK_SMITH, SPLINTERYARD_HONER],
        back: [RIVETLINE_HAND, DEEPLAMP_SEALER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f348',
      name: 'Floor 348',
      enemies: {
        front: [PLATESHOD_HAMMERER, RIVETLINE_HAND],
        back: [QUENCHWRIGHT, KINSTONE_BEARER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f349',
      name: 'Floor 349',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, ANVILBACK_SMITH],
        back: [DEEPLAMP_SEALER, RIVETLINE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f350',
      name: 'Floor 350 — The Weighing House',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, SPLINTERYARD_HONER, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f351',
      name: 'Floor 351',
      enemies: {
        front: [PLATESHOD_HAMMERER, RINGWALL_HAMMERER],
        back: [SPLINTERYARD_HONER, RENDFANG_JACKAL, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f352',
      name: 'Floor 352',
      enemies: {
        front: [ANVILBACK_SMITH, QUENCHWRIGHT],
        back: [RIVETLINE_HAND, MARROWHUNT_ALPHA, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f353',
      name: 'Floor 353',
      enemies: {
        front: [MARROWHUNT_ALPHA, PLATESHOD_HAMMERER],
        back: [RIVETLINE_HAND, SHARDLIGHT_ACOLYTE, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f354',
      name: 'Floor 354',
      enemies: {
        front: [PLATESHOD_HAMMERER, SENTINEL],
        back: [SPLINTERYARD_HONER, COLDFORGE_HAND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f355',
      name: 'Floor 355',
      enemies: {
        front: [ANVILBACK_SMITH, COLDHEARTH_IRONSWORN],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f356',
      name: 'Floor 356',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, BRACEWORK_DELVER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f357',
      name: 'Floor 357',
      enemies: {
        front: [ANVILBACK_SMITH, SPLINTERYARD_HONER],
        back: [RIVETLINE_HAND, DEEPLAMP_SEALER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f358',
      name: 'Floor 358',
      enemies: {
        front: [PLATESHOD_HAMMERER, RIVETLINE_HAND],
        back: [QUENCHWRIGHT, KINSTONE_BEARER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f359',
      name: 'Floor 359',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, ANVILBACK_SMITH],
        back: [DEEPLAMP_SEALER, RIVETLINE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f360',
      name: 'Floor 360 — Weighed and Kept',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, SPLINTERYARD_HONER, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f361',
      name: 'Floor 361',
      enemies: {
        front: [PLATESHOD_HAMMERER, RINGWALL_HAMMERER],
        back: [SPLINTERYARD_HONER, RENDFANG_JACKAL, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f362',
      name: 'Floor 362',
      enemies: {
        front: [ANVILBACK_SMITH, QUENCHWRIGHT],
        back: [RIVETLINE_HAND, MARROWHUNT_ALPHA, CINDERQUENCH_BEARER],
      },
    },
    {
      id: 't-elf-f363',
      name: 'Floor 363',
      enemies: {
        front: [MARROWHUNT_ALPHA, PLATESHOD_HAMMERER],
        back: [RIVETLINE_HAND, SHARDLIGHT_ACOLYTE, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f364',
      name: 'Floor 364',
      enemies: {
        front: [PLATESHOD_HAMMERER, SENTINEL],
        back: [SPLINTERYARD_HONER, COLDFORGE_HAND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f365',
      name: 'Floor 365',
      enemies: {
        front: [ANVILBACK_SMITH, COLDHEARTH_IRONSWORN],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, PLUMBLINE_HAND],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Deadweight — Floors 366–385, levels 173–182, Fine 19–42 — the heaviest boards in the hundred, and the last of the works’ own old anchors. Everything above this is lighter, which is the ramp working rather than the band relenting.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f366',
      name: 'Floor 366',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, COLDFORGE_HAND, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f367',
      name: 'Floor 367',
      enemies: {
        front: [COLOSSUS, PLATESHOD_HAMMERER],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f368',
      name: 'Floor 368',
      enemies: {
        front: [PLATESHOD_HAMMERER, COLDHEARTH_IRONSWORN],
        back: [SPLINTERYARD_HONER, WARDSTONE_KEEPER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f369',
      name: 'Floor 369',
      enemies: {
        front: [ANVILBACK_SMITH, REDWATER_STALKER],
        back: [PLATESHOD_HAMMERER, ASHPIT_SCUTTLER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f370',
      name: 'Floor 370 — The Deadweight',
      enemies: {
        front: [THE_GRUDGEKEEPER, ANVILBACK_SMITH],
        back: [COLDFORGE_HAND, MARCHWARD_PIKEMAN, BRACEWORK_DELVER],
      },
    },
    {
      id: 't-elf-f371',
      name: 'Floor 371',
      enemies: {
        front: [PLATESHOD_HAMMERER, RINGWALL_HAMMERER],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f372',
      name: 'Floor 372',
      enemies: {
        front: [COLOSSUS, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, BRACEWORK_DELVER, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f373',
      name: 'Floor 373',
      enemies: {
        front: [PLATESHOD_HAMMERER, IRONSLING_WRIGHT],
        back: [ANVILBACK_SMITH, THORNBACK_GRAZER, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f374',
      name: 'Floor 374',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [QUENCHWRIGHT, COLDFORGE_HAND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f375',
      name: 'Floor 375',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, ASHPIT_SCUTTLER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f376',
      name: 'Floor 376',
      enemies: {
        front: [COLOSSUS, PLATESHOD_HAMMERER],
        back: [RIVETLINE_HAND, MARCHWARD_PIKEMAN, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f377',
      name: 'Floor 377',
      enemies: {
        front: [PLATESHOD_HAMMERER, COLDHEARTH_IRONSWORN],
        back: [SPLINTERYARD_HONER, SHARDLIGHT_ACOLYTE, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f378',
      name: 'Floor 378',
      enemies: {
        front: [ANVILBACK_SMITH, REDWATER_STALKER],
        back: [PLATESHOD_HAMMERER, COLDFORGE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f379',
      name: 'Floor 379',
      enemies: {
        front: [PLATESHOD_HAMMERER, RINGWALL_HAMMERER],
        back: [RIVETLINE_HAND, THORNBACK_GRAZER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-elf-f380',
      name: 'Floor 380 — The Last Old Anchor',
      enemies: {
        front: [THE_GRUDGEKEEPER, ANVILBACK_SMITH],
        back: [COLDFORGE_HAND, MARCHWARD_PIKEMAN, BRACEWORK_DELVER],
      },
    },
    {
      id: 't-elf-f381',
      name: 'Floor 381',
      enemies: {
        front: [COLOSSUS, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, RENDFANG_JACKAL, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f382',
      name: 'Floor 382',
      enemies: {
        front: [PLATESHOD_HAMMERER, IRONSLING_WRIGHT],
        back: [ANVILBACK_SMITH, MARCHWARD_PIKEMAN, CARRION_SWARM],
      },
    },
    {
      id: 't-elf-f383',
      name: 'Floor 383',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [QUENCHWRIGHT, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-elf-f384',
      name: 'Floor 384',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [RIVETLINE_HAND, COLDFORGE_HAND, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f385',
      name: 'Floor 385',
      enemies: {
        front: [COLOSSUS, PLATESHOD_HAMMERER],
        back: [RIVETLINE_HAND, VAULTLIGHT_CENSER, VAULTLIGHT_CENSER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Plating — Floors 386–400, levels 182–189, Fine 43–60 — the boards go light and the bodies on them do not. The Edgewright is a hundred floors below and could not stand here at all; what can is the one that finally wore the thing the works were for.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f386',
      name: 'Floor 386',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [COLDFORGE_HAND, MARCHWARD_PIKEMAN, BRACEWORK_DELVER],
      },
    },
    {
      id: 't-elf-f387',
      name: 'Floor 387',
      enemies: {
        front: [PLATESHOD_HAMMERER, COLDHEARTH_IRONSWORN],
        back: [ASHPIT_SCUTTLER, PROPGALLERY_HAND, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f388',
      name: 'Floor 388',
      enemies: {
        front: [PLATESHOD_HAMMERER, SPLINTERYARD_HONER],
        back: [COLDFORGE_HAND, PLUMBLINE_HAND, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-elf-f389',
      name: 'Floor 389',
      enemies: {
        front: [ANVILBACK_SMITH, PLATESHOD_HAMMERER],
        back: [VAULTLIGHT_CENSER, COLDFORGE_HAND, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-elf-f390',
      name: 'Floor 390 — The Plating',
      enemies: {
        front: [THE_GRUDGEKEEPER, RIVETLINE_HAND],
        back: [COLDFORGE_HAND, PROPGALLERY_HAND, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f391',
      name: 'Floor 391',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [VAULTLIGHT_CENSER, PLUMBLINE_HAND, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f392',
      name: 'Floor 392',
      enemies: {
        front: [PLATESHOD_HAMMERER, RINGWALL_HAMMERER],
        back: [COLDFORGE_HAND, PROPGALLERY_HAND, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f393',
      name: 'Floor 393',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [VAULTLIGHT_CENSER, FORGE_THRALL, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f394',
      name: 'Floor 394',
      enemies: {
        front: [PLATESHOD_HAMMERER, COLDHEARTH_IRONSWORN],
        back: [PROPGALLERY_HAND, SETSTONE_DRUDGE, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f395',
      name: 'Floor 395',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [FORGE_THRALL, VAULTLIGHT_CENSER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f396',
      name: 'Floor 396',
      enemies: {
        front: [ANVILBACK_SMITH, PLATESHOD_HAMMERER],
        back: [FORGE_THRALL, SETSTONE_DRUDGE, UNMARKED_WARDEN],
      },
    },
    {
      id: 't-elf-f397',
      name: 'Floor 397',
      enemies: {
        front: [PLATESHOD_HAMMERER, SPLINTERYARD_HONER],
        back: [VAULTLIGHT_CENSER, UNMARKED_WARDEN, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f398',
      name: 'Floor 398',
      enemies: {
        front: [PLATESHOD_HAMMERER, ANVILBACK_SMITH],
        back: [SETSTONE_DRUDGE, FORGE_THRALL, UNMARKED_WARDEN],
      },
    },
    {
      id: 't-elf-f399',
      name: 'Floor 399',
      enemies: {
        front: [PLATESHOD_HAMMERER, SPLINTERYARD_HONER],
        back: [ASHPIT_SCUTTLER, PROPGALLERY_HAND, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f400',
      name: 'Floor 400 — The Platewright',
      enemies: {
        front: [THE_PLATEWRIGHT, RIVETLINE_HAND],
        back: [SETSTONE_DRUDGE, PROPGALLERY_HAND, UNMARKED_WARDEN],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Head Race — Floors 401–420, levels 189–198, Masterwork 1–24 — the works have stopped being
    // swung by hand. Water is let into the channel, and one body a board is already keeping the new
    // time.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f401',
      name: 'Floor 401',
      enemies: {
        front: [PLATESHOD_HAMMERER, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, DEEPROCK_MINER, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f402',
      name: 'Floor 402',
      enemies: {
        front: [ANVILBACK_SMITH, WRATHBORN],
        back: [HEADRACE_HAND, GILDED_SENTRY, GATEFAST_WARDEN],
      },
    },
    {
      id: 't-elf-f403',
      name: 'Floor 403',
      enemies: {
        front: [SPLINTERYARD_HONER, HUSHGLASS_WARDEN],
        back: [HEADRACE_HAND, PYRE, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f404',
      name: 'Floor 404',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, GILDED_SENTRY, UNMARKED_WARDEN],
      },
    },
    {
      id: 't-elf-f405',
      name: 'Floor 405',
      enemies: {
        front: [RINGWALL_HAMMERER, WRATHBORN],
        back: [HEADRACE_HAND, EMBERSHELL_WHELP, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f406',
      name: 'Floor 406',
      enemies: {
        front: [QUENCHWRIGHT, HUSHGLASS_WARDEN],
        back: [HEADRACE_HAND, SLIME, DEEPROCK_MINER],
      },
    },
    {
      id: 't-elf-f407',
      name: 'Floor 407',
      enemies: {
        front: [IRONSLING_WRIGHT, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, DRIFTMOUTH_CHOKER, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f408',
      name: 'Floor 408',
      enemies: {
        front: [RIVETLINE_HAND, WRATHBORN],
        back: [HEADRACE_HAND, CLEFTHORN_GORER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f409',
      name: 'Floor 409',
      enemies: {
        front: [PLATESHOD_HAMMERER, HUSHGLASS_WARDEN],
        back: [HEADRACE_HAND, GILDED_SENTRY, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f410',
      name: 'Floor 410 — The Sluice Gate',
      enemies: {
        front: [THE_PLATEWRIGHT, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, CLEFTHORN_GORER, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f411',
      name: 'Floor 411',
      enemies: {
        front: [SPLINTERYARD_HONER, WRATHBORN],
        back: [HEADRACE_HAND, RADIANT_HERALD, GATEFAST_WARDEN],
      },
    },
    {
      id: 't-elf-f412',
      name: 'Floor 412',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, HUSHGLASS_WARDEN],
        back: [HEADRACE_HAND, CLEFTHORN_GORER, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f413',
      name: 'Floor 413',
      enemies: {
        front: [RINGWALL_HAMMERER, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, SLIME, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f414',
      name: 'Floor 414',
      enemies: { front: [QUENCHWRIGHT, WRATHBORN], back: [HEADRACE_HAND, PYRE, COLDFORGE_HAND] },
    },
    {
      id: 't-elf-f415',
      name: 'Floor 415',
      enemies: {
        front: [IRONSLING_WRIGHT, HUSHGLASS_WARDEN],
        back: [HEADRACE_HAND, RADIANT_HERALD, FORGE_THRALL],
      },
    },
    {
      id: 't-elf-f416',
      name: 'Floor 416',
      enemies: {
        front: [RIVETLINE_HAND, CHALKHIDE_BROWSER],
        back: [HEADRACE_HAND, RADIANT_HERALD, GATEFAST_WARDEN],
      },
    },
    {
      id: 't-elf-f417',
      name: 'Floor 417',
      enemies: {
        front: [PLATESHOD_HAMMERER, GATEFAST_WARDEN],
        back: [HEADRACE_HAND, EMBERSHELL_WHELP, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f418',
      name: 'Floor 418',
      enemies: {
        front: [ANVILBACK_SMITH, BRACEWORK_DELVER],
        back: [HEADRACE_HAND, SLIME, UNMARKED_WARDEN],
      },
    },
    {
      id: 't-elf-f419',
      name: 'Floor 419',
      enemies: {
        front: [SPLINTERYARD_HONER, BOLTFAST_IRONSIDE],
        back: [HEADRACE_HAND, EMBERSHELL_WHELP, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f420',
      name: 'Floor 420 — The Wheelpit',
      enemies: {
        front: [THE_EDGEWRIGHT, GRUDGEPLATE_SMITH],
        back: [HEADRACE_HAND, RADIANT_HERALD, DEEPROCK_MINER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Cam Shaft — Floors 421–445, levels 199–210, Masterwork 25–54 — a second body on the beat.
    // Neither is heavy; what they are is early, and an Elf five that kills a soft body in two swings
    // has stopped getting the second swing in first.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f421',
      name: 'Floor 421',
      enemies: {
        front: [RINGWALL_HAMMERER, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, PYRE, SETSTONE_DRUDGE],
      },
    },
    {
      id: 't-elf-f422',
      name: 'Floor 422',
      enemies: {
        front: [QUENCHWRIGHT, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, PYRE, UNMARKED_WARDEN],
      },
    },
    {
      id: 't-elf-f423',
      name: 'Floor 423',
      enemies: {
        front: [IRONSLING_WRIGHT, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, EMBERSHELL_WHELP, PLUMBLINE_HAND],
      },
    },
    {
      id: 't-elf-f424',
      name: 'Floor 424',
      enemies: {
        front: [RIVETLINE_HAND, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, SLIME, DEEPROCK_MINER],
      },
    },
    {
      id: 't-elf-f425',
      name: 'Floor 425',
      enemies: {
        front: [PLATESHOD_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, BOAR, BRACEWORK_DELVER],
      },
    },
    {
      id: 't-elf-f426',
      name: 'Floor 426',
      enemies: {
        front: [ANVILBACK_SMITH, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, CLEFTHORN_GORER, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f427',
      name: 'Floor 427',
      enemies: {
        front: [SPLINTERYARD_HONER, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, GILDED_SENTRY, COLDFORGE_HAND],
      },
    },
    {
      id: 't-elf-f428',
      name: 'Floor 428',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, GILDED_SENTRY, SLIME],
      },
    },
    {
      id: 't-elf-f429',
      name: 'Floor 429',
      enemies: {
        front: [RINGWALL_HAMMERER, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, CLEFTHORN_GORER, BOAR],
      },
    },
    {
      id: 't-elf-f430',
      name: 'Floor 430 — The Cam Barrel',
      enemies: {
        front: [THE_DEADBOLT, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f431',
      name: 'Floor 431',
      enemies: {
        front: [IRONSLING_WRIGHT, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, DRIFTMOUTH_CHOKER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f432',
      name: 'Floor 432',
      enemies: {
        front: [RIVETLINE_HAND, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, DRIFTMOUTH_CHOKER, PYRE],
      },
    },
    {
      id: 't-elf-f433',
      name: 'Floor 433',
      enemies: {
        front: [PLATESHOD_HAMMERER, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f434',
      name: 'Floor 434',
      enemies: {
        front: [ANVILBACK_SMITH, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f435',
      name: 'Floor 435',
      enemies: {
        front: [SPLINTERYARD_HONER, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f436',
      name: 'Floor 436',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, DEEPLAMP_SEALER],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f437',
      name: 'Floor 437',
      enemies: {
        front: [RINGWALL_HAMMERER, GATEFAST_WARDEN],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f438',
      name: 'Floor 438',
      enemies: {
        front: [QUENCHWRIGHT, BRACEWORK_DELVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f439',
      name: 'Floor 439',
      enemies: {
        front: [IRONSLING_WRIGHT, BOLTFAST_IRONSIDE],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f440',
      name: 'Floor 440 — The Trip Rack',
      enemies: {
        front: [THE_PLATEWRIGHT, GRUDGEPLATE_SMITH],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f441',
      name: 'Floor 441',
      enemies: {
        front: [PLATESHOD_HAMMERER, DEEPLAMP_SEALER],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f442',
      name: 'Floor 442',
      enemies: {
        front: [ANVILBACK_SMITH, GATEFAST_WARDEN],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f443',
      name: 'Floor 443',
      enemies: {
        front: [SPLINTERYARD_HONER, BRACEWORK_DELVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f444',
      name: 'Floor 444',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, BOLTFAST_IRONSIDE],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f445',
      name: 'Floor 445',
      enemies: {
        front: [RINGWALL_HAMMERER, GRUDGEPLATE_SMITH],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Falling Rack — Floors 446–467, levels 211–220, Masterwork 55–80 — the Camwright cuts the
    // rhythm the rest of the hundred keeps. The heavier of the two hammers moves behind the rank the
    // party cannot aim past.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f446',
      name: 'Floor 446',
      enemies: {
        front: [QUENCHWRIGHT, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f447',
      name: 'Floor 447',
      enemies: {
        front: [IRONSLING_WRIGHT, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f448',
      name: 'Floor 448',
      enemies: {
        front: [RIVETLINE_HAND, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f449',
      name: 'Floor 449',
      enemies: {
        front: [PLATESHOD_HAMMERER, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f450',
      name: 'Floor 450 — The Camwright',
      enemies: {
        front: [THE_CAMWRIGHT, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f451',
      name: 'Floor 451',
      enemies: {
        front: [SPLINTERYARD_HONER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f452',
      name: 'Floor 452',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f453',
      name: 'Floor 453',
      enemies: {
        front: [RINGWALL_HAMMERER, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f454',
      name: 'Floor 454',
      enemies: {
        front: [QUENCHWRIGHT, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f455',
      name: 'Floor 455',
      enemies: {
        front: [IRONSLING_WRIGHT, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-elf-f456',
      name: 'Floor 456',
      enemies: {
        front: [RIVETLINE_HAND, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f457',
      name: 'Floor 457',
      enemies: {
        front: [PLATESHOD_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f458',
      name: 'Floor 458',
      enemies: {
        front: [ANVILBACK_SMITH, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f459',
      name: 'Floor 459',
      enemies: {
        front: [SPLINTERYARD_HONER, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-elf-f460',
      name: 'Floor 460 — The Second Cam',
      enemies: {
        front: [THE_CAMWRIGHT, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f461',
      name: 'Floor 461',
      enemies: {
        front: [RINGWALL_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f462',
      name: 'Floor 462',
      enemies: {
        front: [QUENCHWRIGHT, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f463',
      name: 'Floor 463',
      enemies: { front: [IRONSLING_WRIGHT, SLIME], back: [HEADRACE_HAND, HEADRACE_HAND, PYRE] },
    },
    {
      id: 't-elf-f464',
      name: 'Floor 464',
      enemies: {
        front: [RIVETLINE_HAND, KILNSTROKE_CELEBRANT],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f465',
      name: 'Floor 465',
      enemies: {
        front: [PLATESHOD_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f466',
      name: 'Floor 466',
      enemies: {
        front: [ANVILBACK_SMITH, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-elf-f467',
      name: 'Floor 467',
      enemies: {
        front: [SPLINTERYARD_HONER, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Quickstroke — Floors 468–485, levels 221–229, Relic 2–21 — Relic plate arrives and steps the
    // grade *down*, so the band opens heavier than the one it follows. Two hammers on every board and
    // the returning weight back in front of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f468',
      name: 'Floor 468',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, KILNSTROKE_CELEBRANT],
        back: [HEADRACE_HAND, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f469',
      name: 'Floor 469',
      enemies: {
        front: [RINGWALL_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f470',
      name: 'Floor 470 — The Quickstroke',
      enemies: {
        front: [THE_CAMWRIGHT, SLAGHIDE_PURSUER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f471',
      name: 'Floor 471',
      enemies: {
        front: [IRONSLING_WRIGHT, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f472',
      name: 'Floor 472',
      enemies: {
        front: [RIVETLINE_HAND, KILNSTROKE_CELEBRANT],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f473',
      name: 'Floor 473',
      enemies: {
        front: [PLATESHOD_HAMMERER, CINDERFLAW_PROVER],
        back: [HEADRACE_HAND, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f474',
      name: 'Floor 474',
      enemies: {
        front: [ANVILBACK_SMITH, SLAGHIDE_PURSUER],
        back: [HEADRACE_HAND, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f475',
      name: 'Floor 475',
      enemies: {
        front: [SPLINTERYARD_HONER, KILNCRACK_CANTOR],
        back: [HEADRACE_HAND, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f476',
      name: 'Floor 476',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, KILNSTROKE_CELEBRANT],
        back: [HEADRACE_HAND, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f477',
      name: 'Floor 477',
      enemies: {
        front: [RINGWALL_HAMMERER, CINDERFLAW_PROVER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f478',
      name: 'Floor 478',
      enemies: {
        front: [QUENCHWRIGHT, SLAGHIDE_PURSUER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f479',
      name: 'Floor 479',
      enemies: {
        front: [IRONSLING_WRIGHT, KILNCRACK_CANTOR],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-elf-f480',
      name: 'Floor 480 — The Racing Gear',
      enemies: {
        front: [THE_CAMWRIGHT, KILNSTROKE_CELEBRANT],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f481',
      name: 'Floor 481',
      enemies: {
        front: [PLATESHOD_HAMMERER, CINDERFLAW_PROVER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f482',
      name: 'Floor 482',
      enemies: {
        front: [ANVILBACK_SMITH, SLAGHIDE_PURSUER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f483',
      name: 'Floor 483',
      enemies: {
        front: [SPLINTERYARD_HONER, KILNCRACK_CANTOR],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, SLIME],
      },
    },
    {
      id: 't-elf-f484',
      name: 'Floor 484',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, RIVETLINE_HAND],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f485',
      name: 'Floor 485',
      enemies: {
        front: [RINGWALL_HAMMERER, PLATESHOD_HAMMERER],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, SLIME],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Racing Gear — Floors 486–495, levels 229–234, Relic 22–34 — the gearing runs away with
    // itself. The authored weight falls from here to the roof and the beat is what replaces it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f486',
      name: 'Floor 486',
      enemies: {
        front: [GRUDGEPLATE_SMITH, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f487',
      name: 'Floor 487',
      enemies: {
        front: [DEEPLAMP_SEALER, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f488',
      name: 'Floor 488',
      enemies: {
        front: [QUENCHWRIGHT, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-elf-f489',
      name: 'Floor 489',
      enemies: {
        front: [RIVETLINE_HAND, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, PYRE],
      },
    },
    {
      id: 't-elf-f490',
      name: 'Floor 490 — The Last Cam',
      enemies: {
        front: [THE_CAMWRIGHT, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-elf-f491',
      name: 'Floor 491',
      enemies: {
        front: [DEEPLAMP_SEALER, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-elf-f492',
      name: 'Floor 492',
      enemies: {
        front: [QUENCHWRIGHT, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, BOAR],
      },
    },
    {
      id: 't-elf-f493',
      name: 'Floor 493',
      enemies: {
        front: [RIVETLINE_HAND, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, RADIANT_HERALD],
      },
    },
    {
      id: 't-elf-f494',
      name: 'Floor 494',
      enemies: {
        front: [GRUDGEPLATE_SMITH, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    {
      id: 't-elf-f495',
      name: 'Floor 495',
      enemies: {
        front: [DEEPLAMP_SEALER, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, HEADRACE_HAND, GILDED_SENTRY],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Great Helve — Floors 496–500, levels 234–236, Relic 35–40 — five floors, each measured on
    // its own, and the helve at the top of them. Nothing here is heavy; everything here is early.
    // -------------------------------------------------------------------------------------
    {
      id: 't-elf-f496',
      name: 'Floor 496',
      enemies: {
        front: [RIVETLINE_HAND, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, SETSTONE_DRUDGE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f497',
      name: 'Floor 497',
      enemies: {
        front: [DEEPLAMP_SEALER, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, SETSTONE_DRUDGE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f498',
      name: 'Floor 498',
      enemies: {
        front: [ANVILBACK_SMITH, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, SETSTONE_DRUDGE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-elf-f499',
      name: 'Floor 499',
      enemies: {
        front: [SPLINTERYARD_HONER, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, SETSTONE_DRUDGE, PROPGALLERY_HAND],
      },
    },
    {
      id: 't-elf-f500',
      name: 'Floor 500 — The Great Helve',
      enemies: {
        front: [THE_GREAT_HELVE, HELVESTRUCK_SMITH],
        back: [HELVESTRUCK_SMITH, SETSTONE_DRUDGE, PROPGALLERY_HAND],
      },
    },
  ],
} as const;
