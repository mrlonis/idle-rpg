import {
  ACOLYTE,
  AISLEWARD_VERGER,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  ASHPIT_SCUTTLER,
  BANDIT,
  BAREMARK_GNAWER,
  BARROW_SOVEREIGN,
  BENCHLINE_LURKER,
  BLOODGORGE_HOUND,
  BOAR,
  BREAKSTONE_WARDEN,
  CAIRNCHOIR_SEXTON,
  CARRION_SWARM,
  CENSERSTEP_ACOLYTE,
  CHALKHIDE_BROWSER,
  CHANNELBED_STALKER,
  CINDERLING,
  CLEFTHORN_GORER,
  CLOSEWARD_SERAPH,
  COLDHEARTH_IRONSWORN,
  COLOSSUS,
  CONCORD_CANTOR,
  DEEPROCK_MINER,
  DRIFTMOUTH_CHOKER,
  DUSTPLATE_GRINDER,
  EVENSONG_WARDEN,
  FREE_BLADE,
  GALLERY_SLIPFANG,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLASSCHOIR_ARBITER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVELIGHT_BEADLE,
  GRAVETIDE_HERALD,
  GUTTERLIGHT_SEXTON,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOW_SERAPH,
  HUSHGLASS_WARDEN,
  KNELL_CHANTER,
  LITANY_BEARER,
  LONGEBB_RENDER,
  LUMEN_ACOLYTE,
  MARROWHUNT_ALPHA,
  MIREFOOT_RUNNER,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHSHIELD_VANGUARD,
  OVERBURDEN_HULK,
  PLAINSONG_PRECENTOR,
  PSALMSTONE_LECTOR,
  QUENCHPIT_IRONHIDE,
  RADIANT_HERALD,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  ROUGHCAST_GNAWER,
  SALTBLEACH_CRIER,
  SCARBOUND_BELLOWER,
  SCARWEAVE_TRAMPLER,
  SCATTERSTONE_HOWLER,
  SCREEBACK_DARTER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SHALEBED_CRAWLER,
  SHARDLIGHT_ACOLYTE,
  SHATTERJAW_MAULER,
  SILENTVAULT_KEEPER,
  SLIME,
  STILLNESS_CANTOR,
  STORMCALLER,
  SUMPWATER_BROOD,
  THE_UNBITTEN,
  THE_UNFALTERING,
  THE_UNHEARING,
  THE_UNISON,
  THE_UNMOVED,
  THE_UNSTRUCK,
  THORNBACK_GRAZER,
  UNMADE,
  UNSPOKEN_CANON,
  VAULTLIGHT_CENSER,
  WEALDSHADOW_STALKER,
  WISP,
  WRATHBORN,
  WYRDROOT_ANCIENT,
  ZENITH_CHORISTER,
} from './enemies';

/**
 * The Demon Tower — six hundred floors, enemy levels 1 to 283.
 *
 * **The seventh tower to reach the fifth hundred and the last one to get there**, which closes the
 * bump for the fourth time and empties the `PENDING` lists in `towers.spec.ts` and
 * `towers.balance.ts` along with the branches they guarded. The same sentence was true of this
 * tower's fourth hundred, and it is true for the same reason: `TOWER_RULES` is one rule for all
 * seven, so a height bump lands in one session and the floors land in seven.
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
 * ## ⚠️ The third hundred: the choir refuses the edge the faction is named for
 *
 * The last hundred of the last tower, and the seventh different answer again. The axis is **crit
 * denial** — `critBlock` and `critDamageResist` on the bodies a Demon five has to get through —
 * and the case for it is that this is the crew the stat was waiting for. The two swept Demon
 * arrangements carry `critChance` **Σ1.21 and Σ1.43** (x̄ 0.242 and 0.286) and `critDamageAmp`
 * **Σ4.50 and Σ5.05**, against the Elf five's 1.03 / 3.67 and **every other crew in the game at or
 * under 0.77 / 3.40**. `core/battle/damage.ts` resolves a crit as `critChance − critBlock` and its
 * worth as `1 + max(critDamageAmp − critDamageResist, 0)`, and it licenses the chance reaching zero
 * in as many words: *a hit that never crits still kills, so a crit-immune archetype cannot stall a
 * battle the way an unhittable one could.* This is the one shape in the game that may close a door
 * outright without becoming the ninety-second clock.
 *
 * Measured against both arrangements at the roof's level before a floor was authored, on a
 * controlled board of one anchor (1500/88) plus four identical bodies (780/88), forty seeds — mean
 * survivors of five, reference / alternate, against a **4.00 / 3.92** control:
 *
 * | Four bodies at                       | reference   | alternate   |
 * | ------------------------------------ | ----------- | ----------- |
 * | `critBlock` 0.10 / 0.16              | 4.00 / 4.00 | 3.70 / 3.75 |
 * | `critBlock` 0.24 — *the register*    | 4.00        | **3.33**    |
 * | `critBlock` 0.32 / 0.40 / 0.50       | 3.98 / 3.98 / 4.00 | 3.17 / **2.85** / **2.50** |
 * | `critDamageResist` 0.32 — *register* | 4.00        | 3.73        |
 * | `critDamageResist` 0.75 / 1.10       | 4.00 / 3.98 | 3.50 / 2.92 |
 * | both, 0.24 + 0.32                    | 3.98        | 3.38        |
 * | both, 0.40 + 0.75                    | 4.00        | **2.42**    |
 *
 * **Zero timeouts on every row**, fights running 7.1s to 13.5s against a ninety-second timer, so it
 * is difficulty rather than the clock. ⚠️ **`critDamageResist` is much the weaker of the two and is
 * never the whole of a board** — it needs 1.10, three times its register, to reach what `critBlock`
 * does at 0.40.
 *
 * ⚠️ **The count matters more than the size until the register is reached, which is this tower's own
 * second-hundred thesis arriving on the other side of the board.** At the register pair, by how many
 * of the four carry it: 3.77 → 3.77 → 3.67 → **3.33** → 3.35 across none, one, two, three and four.
 * A Demon five is answered board-wide or it is not answered at all — the second hundred found that
 * about what a board *does*, and the third finds it about what a board *is*. So the bands escalate
 * one carrier → two → three → the board entire → the board entire with the pair on it.
 *
 * ⚠️ **The first control measured this axis as completely inert, and the control was the bug.** A
 * board of four 780/**68** bodies reads 4.00 / 3.92 as well, and on it the entire grade from
 * `critBlock` 0.10 to full crit immunity spans **4.00 to 3.92** — nothing. Both controls sit at
 * ~4.00 of five and only one of them has anywhere to fall: the crew loses its glass cannon to
 * anything and its other four to nothing, so 4.00 is a **plateau** rather than a midpoint. ⚠️
 * **Check that the control's survivor count moves before trusting a flat row**, which is the
 * Seedfall's saturation trap arriving from the opposite direction — that one saturated at the
 * bottom and this one at the top.
 *
 * ⚠️ **"Is it ours" comes back the sharpest it has for any tower.** As a change on each crew's own
 * control — calibrated per crew to the heaviest board still reading ~4.00, then the pair applied at
 * 0.40 and 0.32: demon-alt **−1.25**, demon-ref −0.35, elf-ref −0.30, elf-alt −0.15, undead-alt
 * −0.13, undead-ref −0.05, human-alt −0.02, and **0.00 for every Human, Dwarf, Monster and Angel
 * arrangement swept**. The Elves are the only other crit-heavy roster and they lose a quarter of
 * what the Demons do. Contrast the Closing's `physicalResist`, which cost undead-ref a full member
 * and dwarf-ref 0.42 on its way to being taken.
 *
 * ⚠️ **The band is built at the register and only the roof steps past** — the Splintering Yards'
 * shape rather than the Closing's, and stated here in writing so a later session can tell which it
 * is looking at. The shipped ceilings are the Edgeturn Warden's `critBlock` **0.24** over 44 blocks
 * that carry any and `critDamageResist` **0.32** over 27; the three new legendaries run 0.16 / 0.20 /
 * 0.24 and 0.25 / 0.28 / 0.32, and only {@link THE_UNFALTERING} goes beyond at 0.34 and 0.52.
 *
 * ⚠️ **The Unison retires, and it is the tower's *roof* that had to go rather than its heaviest
 * body.** The shipped floor-200 board fielded up its own level line against the band-3 crew reads
 * 100% with all five alive at level 95, 100% / 4.78 at 125, and **33% with 0.53** at 142 — the
 * fourth tower to collapse there. But the block underneath it is the one that survives: behind light
 * support at level 142 the **Hollow Seraph at 1760/99 reads 100% / 3.83** while **The Unison at
 * 1720/92 reads 98% / 0.23**, so what fails is not weight but the board-wide turn the second hundred
 * was built on, against the glassier of the two arrangements. Both stop at the second hundred; the
 * new hundred fields neither, and {@link THE_UNFALTERING} is 1440/86 against the Unison's 1720/92.
 *
 * ⚠️ **The second hundred's "no board carries two `ascended` blocks" survives a whole rung of
 * investment and stays.** At level 142 against the band-3 crews: Hollow Seraph beside The Unison is
 * **0% / 0%**, beside the Barrow Sovereign 100% / **5%**, beside the Wyrdroot Ancient 100% / **8%**.
 * Only the two lightest pair legally, and no board in this hundred pairs any.
 *
 * ⚠️ **Every board in the third hundred is sized against the *alternate* arrangement**, which is the
 * Closing's answer rather than this tower's second hundred. The collapse above lands on it, and so
 * does the whole of the axis: the reference five moves 4.00 → 3.98 across the entire grade.
 *
 * The roof is The Unfaltering and an Evensong Warden over a Shatterjaw Mauler, a Scarweave Trampler
 * and a Scarbound Bellower: **100% / 3.88 survivors / 9.8s** for the reference five and **90% /
 * 1.60 / 18.7s** for the alternate, against bars of 90% and 75%. ⚠️ **The axis carries it rather
 * than riding along** — the same five bodies with `critBlock` and `critDamageResist` stripped to
 * zero read 100% / 4.00 and 100% / 3.65, so the refusal is worth 1.2 of five on the last floor.
 * Every floor of 201–300 was swept individually against both arrangements: the worst reference
 * reading is **100%**, the worst alternate **90%** at the roof, **no floor times out**, and the
 * longest fight anywhere is 28.7s against a 67.5s bar.
 *
 * ⚠️ **What this hundred restores, stated as counts rather than as an absolute.** Over floors
 * 201–300: 26 boards carry `recovery`, 36 carry `lifeLeech`, one carries `healthRegen` (floor 218),
 * and 21 field a block whose kit contains a heal, a drain or a shield. What is actually forbidden is
 * narrower and it is the roof: **the last floor carries none of the four**, because a roof is where
 * sustain stops being a lock and becomes the clock. Three towers have now shipped the same false
 * absolute about sustain, always on the word "regeneration"; the counts above are the fix.
 *
 *
 * ## ⚠️ The fourth hundred: the mechanic two towers declined, re-priced against the crew it was for
 *
 * **The last hundred of the last tower**, which closes a height bump that landed in one session and
 * took seven to fill. The `PENDING` lists in `towers.spec.ts` and `towers.balance.ts` went with it,
 * along with the branches they guarded — third time that checklist has run to completion.
 *
 * The axis is **`magicResist`**, and it is the only axis in twenty-one hundreds that a session reached
 * for after two others had measured it and put it down. This tower's own **second** hundred measured a
 * magic ward as worth **0.00** at the shipped register and declined it; the Angel Tower's fourth
 * measured it again on its own crew and declined it again at 0.10 to 0.35 of five; the Undead Tower's
 * fourth found it landed **within a second of `def` and `hp`** and called it that tower's own
 * third-hundred axis wearing a new stat. All three are still right about what they measured. ⚠️ **A
 * recorded "X is inert" is a claim about a curve, and the curves in this project move** — chapter 23's
 * rule, arriving on a tower.
 *
 * Measured at level 189 in Fine 60 before a floor was authored, against a control of one anchor
 * (1100/76) plus four bodies (580/64) reading **4.00 / 3.98**, forty seeds — reference / alternate:
 *
 * | Four carriers at   | reference | alternate |
 * | ------------------ | --------- | --------- |
 * | `magicResist` 0.10 | 4.00      | 3.95      |
 * | 0.18               | 4.00      | 3.80      |
 * | 0.26 — *the ceiling* | 4.00    | **3.70**  |
 * | 0.34               | 3.98      | 3.38      |
 * | 0.42               | 4.00      | 2.98      |
 * | 0.50               | 4.00      | **2.85**  |
 * | 0.58               | 4.00      | 2.55      |
 * | 0.66               | 3.95      | 2.27      |
 * | 0.74               | 3.92      | **1.95**  |
 *
 * **Nine monotone steps with zero timeouts on every row**, fights running 7.3s to 15.1s against a
 * ninety-second timer, so it is difficulty rather than the clock.
 *
 * ⚠️ **The reference five moves 4.00 → 3.92 across the entire grade**, so every board in this hundred
 * is sized against the **alternate** — the third hundred's answer, arriving again, on a tower whose two
 * arrangements have failed on different axes since floor 1.
 *
 * ⚠️ **It is ours by the damage formula rather than by the stat names.** `core/battle/damage.ts`
 * resolves a hit as `def × (1 − pierce)` and *then* multiplies by `1 − resist`, so **a pierce never
 * touches a resist**. The two Demon arrangements carry **nine and seven magical damage effects and
 * zero physical** — their only physical damage in the game is the basic attack — where the Elf, Human,
 * Dwarf and Monster crews carry **zero magical effects at all**; and they carry the game's largest
 * `magicPierce` at Σ0.30 and Σ0.25 against Σ0.15 everywhere else. **The crew built to open armour has
 * no answer whatever to the wall that is not armour.** That is the Monster Tower's own third-hundred
 * finding — the pierce crew meeting the resist it cannot pierce — mirrored onto the other damage type
 * and the other faction, and it is the second time reading the formula rather than the stat lines is
 * what chose an axis.
 *
 * ⚠️ **Cross-crew it is the widest licence any of the twenty-one hundreds has measured.** Each of the
 * fourteen arrangements calibrated to the heaviest board it still reads at or above 3.75 survivors,
 * then four carriers at 0.45: **demon-alt 1.15**, undead-ref 0.82, undead-alt 0.52, **demon-ref 0.38**,
 * angel-alt 0.15, elf-ref 0.08, elf-alt 0.05, dwarf-alt 0.02, and **0.00 for every Human, Dwarf,
 * Monster and Angel-reference arrangement swept**. Nine of fourteen at or under 0.15. ⚠️ **The licence
 * is over the binding arrangement**: demon-alt is first by 40% over second place and demon-ref only
 * fourth, which is the Angel Tower's shape rather than the Monster Tower's, and the difference matters
 * because "first of fourteen" and "first and second of fourteen" are different claims.
 *
 * ⚠️ **The pairing is *worse* than the half, which inverts chapter 23's finding rather than repeating
 * it.** Adding `physicalResist` at the same size reads demon-alt **0.95** against `magicResist`
 * alone's 1.15 — and it lifts every physical crew off 0.00 (monster-ref 0.85, dwarf-ref 0.73, elf-ref
 * 0.68, dwarf-alt 0.97). So the pair grades harder in the abstract and **dilutes the licence to
 * nothing**. Chapter 23 found both resists at 0.20 worth 1.78 where `magicResist` alone at 0.30 read
 * 0.32; here it runs the other way, because that chapter's party was mixed and this one is not. **Test
 * the pairing, and accept the answer in whichever direction it comes.** No block authored below
 * carries a point of `physicalResist`.
 *
 * ⚠️ **The band steps past the register and says so, which is the Monster third hundred's shape rather
 * than the Elf's.** Over the **346** blocks shipped beforehand `magicResist` sits on 112 at a median of
 * **0.10** and a ceiling of **0.26**, and the whole Angel bench this tower already fields runs **0.00
 * to 0.15** — so at the register the ward is worth **0.03 of a survivor**, which is exactly the refusal
 * the two earlier sessions recorded, and it only bites above it. The three new legendaries carry 0.34,
 * 0.44 and 0.52 and {@link THE_UNHEARING} 0.60.
 *
 * ⚠️ **A ward is a share of the board rather than a stat on a body, and that is what sets the board
 * shape.** Holding the total at 0.50, spreading it over four soft bodies reads **3.00** for the
 * alternate where concentrating it on the anchor reads 3.75 and on two heavy front bodies 3.73 — the
 * party has to chew through every body and each one taxes for the whole time it stands. ⚠️ **But a
 * *lone* carrier prices where the party is aiming**: one body in the front rank is worth 0.31 of five
 * and the identical body in the back **0.00**, carried on one body as chapter 22 demands. So the
 * carriers stand in front and the escalation is how many of them there are.
 *
 * ⚠️ **The count is the weaker of the two dials here, which inverts this tower's own third-hundred
 * thesis.** At 0.30, carrier counts read 3.98 / 3.90 / 3.83 / 3.80 / 3.63 across none to four — a span
 * of 0.35 — where the *size* at four carriers spans 2.05. The third hundred found the opposite of its
 * own axis ("the count matters more than the size until the register is reached"), so the bands here
 * escalate in **which** voices are present rather than merely how many: the Warden alone, the Warden
 * and the Canon, the Warden and the Keeper, all three, and all three with the weight shed under them.
 *
 * ⚠️ **Four anchors retired, and the geared check is far harsher than the naked one a hundred below.**
 * The shipped floor-300 board carried to floor 400 reads **0% for both arrangements** where the same
 * board at its own floor reads 100% with all five alive — the Angel Tower's finding, confirmed. Behind
 * four light bodies at floor 400: {@link THE_UNISON} **0% / 0%**, the {@link UNMADE} 70% / **0%**,
 * {@link HOLLOW_SERAPH} 78% / **3%**, and {@link THE_UNFALTERING} — the hundred below's own roof —
 * 100% / **5%**. What survives is lighter and older: {@link WYRDROOT_ANCIENT} (1300/78) reads
 * 100% / 4.38, {@link COLOSSUS} (1250/88) 100% / 4.15, {@link BARROW_SOVEREIGN} (1350/84) 100% / 98%,
 * and {@link THE_UNBITTEN} (1300/76) sits **exactly on the alternate's bar** at 100% / 75%, so it is
 * fielded only below floor 360. ⚠️ **The second hundred's "no board carries two `ascended` blocks"
 * survives a second rung of investment and stays**; with four of the tower's five heavy anchors gone,
 * {@link SILENTVAULT_KEEPER} is what a late board anchors on instead.
 *
 * ⚠️ **Two candidate axes were measured and rejected, and writing the negatives down is half the
 * deliverable.** `attackSpeed` is carried by **0 of 346** shipped blocks and grades beautifully —
 * 4.00 / 3.88 / 3.75 / 3.35 / 3.10 / 2.85 / 2.10 for the reference five across 0 → 130, with **2.6
 * seconds** of added fight — but cross-crew it costs angel-alt **4.00**, dwarf-alt 3.88, angel-ref 3.42
 * and undead-alt 3.25, putting demon-alt **eighth of fourteen** and demon-ref tenth. **A speed tax
 * belongs to whichever crew is slowest**, which is the Monster Tower's warning about weight axes
 * wearing a new stat. And `atk` at 100 — inside the shipped register — costs demon-ref **1.65,
 * fourteenth and last of fourteen**, where it wipes five other crews outright. Against the same
 * control `tenacity` is **flat** (3.85 / 3.92 / 3.95 across 0.30 → 0.85), `magicPierce` **0.00 to
 * 0.08**, `energyRegen` **0.00**, `lifeLeech` 0.13, and `physicalResist` spans 0.06 to 0.46 over
 * 0.15 → 0.60.
 *
 * ⚠️ **The gear ramp is inherited, not spent.** `TOWER_RULES.gear` is one rule for all seven towers, so
 * only the Human Tower's fourth hundred could spend it as an axis; the six after it get Worn 1 → Fine
 * 60 for free and owe an axis on top. This is the seventh and last to pay that bill.
 *
 * The roof is The Unhearing over a Hushglass Warden, a Zenith Chorister, a Shardlight Acolyte and a
 * Vaultlight Censer: **100% / 3.85 survivors / 9.5s** for the reference five and **83% / 1.90 / 15.3s**
 * for the alternate, against bars of 90% and 75%. ⚠️ **The axis carries the last floor rather than
 * riding along** — the same five bodies with the roof's ward stripped read 100% / 4.00 and
 * 100% / **3.63**, so the refusal is worth **1.73 of five** on the top floor of the tower system.
 * ⚠️ **And the roof was settled on its attack rather than its weight**, chapter 20's rule for the third
 * time on a roof: held at 1340 hp the alternate reads 33% at `atk` 88, 55% at 80, **83% at 74** and 98%
 * at 64, while held at `atk` 68 it reads 90% at 1500 hp and 95% at 1140. Its escort may carry exactly
 * one of the other three new blocks — the Warden 83%, the Canon 75% *on* the bar, the Keeper **73%**
 * under it, and any two of them together **18% with 0.23**.
 *
 * Every floor of 301–400 was swept individually against both arrangements, not merely the stride: the
 * worst reference reading is **100%**, the worst alternate **83%** at the roof, **no floor times out**,
 * and the longest fight anywhere is **25.3s** against a 67.5s bar.
 *
 * ⚠️ **What this hundred restores is nothing at all, and for once that is an absolute rather than a
 * count.** Over floors 301–400 **no board carries a `heal`, a `drain`, a `shield`, a `regen`, `barrier`
 * or `aegis` status, or a point of `lifeLeech`, `recovery` or `healthRegen`** — against 26 boards
 * carrying `recovery` and 36 carrying `lifeLeech` over floors 201–300. It is only sayable because the
 * four retired anchors were where nearly all of it sat, and it was **not** true of the first pass:
 * {@link SEALWARD_CUSTODIAN} and {@link SEEDLIGHT_KEEPER} stood on fourteen boards before the prose
 * check said so, and the fix was the boards rather than the sentence. Five towers have now shipped a
 * false sustain claim; this is the first hundred that could make the strong version and check it.
 *
 *
 *
 * ## ⚠️ The fifth hundred: the axis a neighbouring tower declined for costing seconds, taken here
 * because this is the one crew with seconds to spend
 *
 * **The last hundred of the last tower**, which closes a height bump that landed in one session and
 * took seven to fill — fourth time that checklist has run to completion, and the `PENDING` lists went
 * with it again.
 *
 * The axis is **`dodge`**, and the honest statement of the licence is that it is **not exclusively
 * this crew's**. Ten hundreds have been able to say "first of fourteen"; this one cannot, and the
 * Human Tower's fifth hundred already recorded that *"is it ours" can come back no for every
 * candidate, and that is a finding rather than a failed search.* Seven candidates were priced across
 * all fourteen shipped arrangements and the binding Demon five ranks **2nd, 2nd, 4th, 6th, 6th, 7th
 * and 11th**. What chose `dodge` out of that is below, and it is the clock.
 *
 * Measured at level 236 in Relic 40 before a floor was authored, against a control of one anchor
 * (860/62) plus four bodies (460/45) reading **3.98 / 3.64**, eighty seeds — all five carrying:
 *
 * ```
 *   dodge        0.08 0.14 0.20 0.26 0.32 0.38 0.44 0.50
 *   reference    3.90 3.71 3.39 3.15 2.84 2.70 2.16 1.71
 *   alternate    3.17 2.76 1.76 1.45 0.97 0.55 0.19 0.14
 *   alt fight     11s  13s  17s  19s  21s  19s  18s  18s
 * ```
 *
 * **Eight monotone steps on both arrangements with zero timeouts on every row**, the longest single
 * fight anywhere in the grade 45.3s against a ninety-second timer. ⚠️ **It is the first axis in five
 * hundred floors that the _reference_ five feels** — that arrangement moves 3.98 → 1.71 here, where
 * the third hundred's crit denial moved it 4.00 → 3.98 and the fourth hundred's ward 4.00 → 3.92
 * across their entire grades. Every board below is still sized against the alternate, because that is
 * still where the cliff is.
 *
 * ⚠️ **The control was shown to move before any of that was believed**, which is this tower's own
 * third-hundred trap: 880/62 reads 3.35 and 820/58 reads 3.91 either side of it. A Demon five loses
 * its glass cannon to anything and its other four to almost nothing, so ~4.00 here is a **plateau**
 * rather than a midpoint and a flat row proves nothing.
 *
 * ### ⚠️ The cross-crew table has to be read as a *residual*, because one confound dominates the stat
 *
 * Each of the fourteen arrangements calibrated to the heaviest mirror control it still reads ≥3.60
 * on, then graded over `dodge` 0.10 → 0.42. Ranked on raw mean cost the binding Demon arrangement is
 * **sixth**: dwarf-ref 2.49, angel-alt 2.28, dwarf-alt 2.10, angel-ref 1.98, undead-alt 1.98,
 * **demon-alt 1.96**, elf-alt 1.27, demon-ref 1.25, undead-ref 1.19, monster-ref 1.19, human-alt
 * 1.17, human-ref 1.15, monster-alt 0.99, elf-ref 0.69.
 *
 * ⚠️ **But `dodge`'s cost correlates 0.772 with how long a crew's fights already are** — it is
 * mostly a tax on slow crews, and the four arrangements clearly above demon-alt are the four slowest
 * of the fourteen (angel-alt **41.6s**, dwarf-ref 28.1s, dwarf-alt 28.0s, angel-ref 27.4s on their
 * own controls). Fit the trend and rank the **residual** and demon-alt is **first of fourteen at
 * +0.76**, 55% clear of second place (dwarf-ref +0.49, undead-alt +0.39, dwarf-alt +0.11, demon-ref
 * +0.10, everything else at or under +0.03). It pays a slow crew's price at **9.9s**, the third
 * fastest control in the game.
 *
 * **That is the licence, and it is a different one from every hundred before it**: not exclusivity
 * and not margin, but **affordability**. ⚠️ **The Angel Tower's fifth hundred measured this exact
 * stat one tower earlier and declined it** — `dodge` 0.45 worth 1.38 of five at **54.5s** against a
 * 67.5s bar — and it was right to. This tower's alternate five clears its control in 9.9s and its
 * reference in 8.7s, the shortest in the game, so an axis that buys eighteen seconds is affordable
 * here and nowhere else. Every previous "chosen on fight length" finding in this project picked the
 * axis that made fights *shorter* because the crew was walking into the bar; this is the first that
 * could pick one for making them longer.
 *
 * ### ⚠️ The mechanism that looked obvious was measured and it was wrong
 *
 * The Demon arrangements are the **only two of the fourteen carrying a point of `lifeLeech`** —
 * Σ0.22 against Σ0.00 everywhere else — and their other sustain is two `drain` siphons, so all of it
 * is a share of damage *dealt*. A miss therefore looks like it should cost this crew twice: no
 * damage and no healing. Measured, it costs nothing at all. Stripping `lifeLeech` to zero and
 * re-running the whole grade moves the alternate's mean cost from **1.82 to 1.84** and the reference's
 * from 0.74 to 0.75. Σ0.22 across five is simply too small to be the mechanism. ⚠️ **A mechanism
 * argument is not a measurement**, and this one is in the doc because it was believed for an hour.
 *
 * ### ⚠️ What was measured and refused
 *
 * All against the same control, mean cost across a five-step grade, with demon-alt's rank of the
 * fourteen in brackets: enemy **`hp`** ×1.15 → ×1.75 is 2.59 **[2nd]**, **`def`** 50 → 170 is 2.66
 * **[4th]**, **`attackSpeed`** 30 → 110 is 2.94 **[6th]**, **`physicalPierce`** 0.20 → 0.80 is 0.97
 * **[7th]**, **`physicalResist`** 0.15 → 0.63 is 1.17 **[11th]**. Dwarf-ref tops four of those six
 * outright — **weight and armour axes belong to whichever crew is slowest**, which is the Monster
 * Tower's warning arriving again. On the status side, {@link THORNMAIL} graded by carrier count
 * (none to five) costs demon-alt 1.50 **[2nd, behind elf-alt's 1.83]**, board-wide `ROOTBOUND` 0.99
 * and `CHAINBOND` 0.64 — all real and all smaller than the stat. `energyRegen` and `accuracy` on the
 * board are worth **0.00 to 0.12**.
 *
 * ⚠️ **`critBlock` and `magicResist` were not re-measured and were not eligible**: they are this
 * tower's own third- and fourth-hundred axes, and a fifth hundred that spent one of them again would
 * be the hundred below wearing a new size.
 *
 * ### The register, and which side of it the band landed on
 *
 * ⚠️ **Stated as the register this hundred was *measured against*, because its own four blocks move
 * it.** Over the **374** blocks shipped beforehand, `dodge` sat on **29** at a median of **0.20**, a
 * p90 of 0.30 and a ceiling of **0.55** ({@link SHADE}) — and on **0 of 32 Angel blocks**, which is
 * the lean this tower fields on every board above floor 300. So the axis is empty on the faction
 * that has to carry it and ordinary in the game at large: a licence to author rather than only to
 * measure. {@link CENSERSTEP_ACOLYTE}, {@link AISLEWARD_VERGER} and {@link GUTTERLIGHT_SEXTON} carry
 * **0.16 / 0.22 / 0.28**, all inside it, and only {@link THE_UNSTRUCK} steps past the p90 at
 * **0.40** — still under the Shade's ceiling, so the roof steps past the *band* rather than past the
 * game. That is this tower's own third-hundred shape rather than the Monster Tower's. Shipping the
 * four takes the pool to 33 of 378 and the **Angel** ceiling from 0.00 to the roof's own 0.40.
 *
 * ### How the bands escalate
 *
 * ⚠️ **Size is the strong dial and the count saturates at four**, which is the fourth hundred's
 * finding rather than the third's. At `dodge` 0.30 by how many of the five carry it, the alternate
 * reads **3.58 / 2.41 / 1.96 / 1.46 / 1.27 / 1.29** across none to five — a span of 2.29 that is
 * spent by the fourth carrier — where the *size* at all five spans 3.03. So the bands walk the count
 * to four and then stop, and the last two bands escalate in which voices are present and what they
 * carry.
 *
 * ⚠️ **Rank is worth more than two thirds of the stat, measured on one body rather than inferred.**
 * The same 460/45 escort at 0.40 costs the alternate **0.75 of five in the front rank and 0.28 in
 * the back** — chapter 22's rule, that a rank comparison must be carried on one body.
 *
 * ⚠️ **So the back rank is a _discount_ this hundred spends deliberately, and the boards say so.**
 * Every one of the hundred boards has a carrier in its front rank — but of the 245 carrier slots in
 * the hundred, **134 are in front and 111 behind**: {@link GUTTERLIGHT_SEXTON} leads on 35 of its 52
 * boards, {@link AISLEWARD_VERGER} on 22 of 36, and {@link CENSERSTEP_ACOLYTE}, the lightest, stands
 * behind the anchor on 32 of its 49. Four carriers all standing in front is not a board this crew
 * clears at these levels; **once the count is fixed, the rank each carrier takes is most of the
 * remaining tuning.**
 *
 * Bodies at or above 0.16 run **1 / 2 / 3 / 3 / 2–4** across the five bands, stated as counts
 * because `dodge` is on the board rather than absent from it. ⚠️ **Half of those carriers are not
 * new and not Angel**: {@link GALLERY_SLIPFANG} at 0.28 and {@link SCREEBACK_DARTER} at 0.30 already
 * stand on this tower's fourth hundred, and they carry the axis from **floor 401** beside the three
 * new blocks rather than joining it late. That is a decision the counter-faction guard forced — see
 * the lean note below — and it is the better content for it: the refusal is a property of the
 * *tower* rather than of three bodies.
 *
 * ### The retirement check came back entirely clean
 *
 * ⚠️ **Which is the Angel Tower's fifth-hundred outcome rather than this tower's fourth**, where four
 * anchors retired at once. Fielded alone at floor 500 in Relic 40 behind four 330/20 commons, all
 * fifteen candidates read **100%** for both arrangements. Behind a 520/44 escort the pressure shows
 * and only one body is under it: {@link THE_UNBITTEN} at **20% / 0.31**, which the fourth hundred had
 * already stopped fielding above floor 340 and which this hundred does not field at all.
 * {@link THE_UNHEARING} — the hundred below's own roof — holds at 76% / 1.35 and anchors the opening
 * and the Relic boundary here. ⚠️ **The floor-400 board carried up to floor 500 still collapses**:
 * 100% / 2.30 for the reference and **1% / 0.03** for the alternate.
 *
 * ### The roof, and the lean
 *
 * The roof is {@link THE_UNSTRUCK} over a Censerstep Acolyte, a Shardlight Acolyte, a Zenith
 * Chorister and a Lumen Acolyte — the one board in the hundred that is Angel end to end, which is
 * what a celestial capstone ought to be: **100% / 3.83 survivors / 15.4s** for the reference five
 * and **85% / 1.95 / 15.4s** for the alternate, against bars of 90% and 75%. ⚠️ **The axis carries the
 * last floor rather than riding along** — the same five bodies with the roof's own `dodge` stripped
 * read 100% / 3.95 and **100% / 2.68**, so the refusal is worth 0.73 of the reference five and
 * **1.96 of the alternate** on the top floor of the tower system. It was settled on its **attack**;
 * see {@link THE_UNSTRUCK} for the sweep and for what its escort may carry.
 *
 * ### ⚠️ The counter-faction guard binds the lean far harder than the 65% ceiling does, and it only
 * bites on a band that costs members
 *
 * The first pass authored all three new carriers as Angel and stood them on 234 of 500 slots, which
 * put the hundred at **81.8% Angel and the whole tower at 65.84%** — over the 65% ceiling, the same
 * structural overshoot the Angel and Undead fifth hundreds recorded. **But the ceiling was not what
 * failed.** `towers.balance.ts` holds that a **celestial** tower costs its crew *fewer* members than
 * a mirror board of the crew's own faction, and the Demon Tower carried that inversion by only
 * **1.1 members across its whole first four hundred floors**. A fifth hundred at 81.8% Angel pushed
 * it to **93.7 against 92.7** and the tower went red.
 *
 * ⚠️ **The mechanism is the matchup matrix and it is worth stating exactly.** Against a Demon five an
 * Angel board is ×1.05 out **and** ×1.05 in, where the all-Demon mirror is neutral both ways and a
 * Monster board is ×1.10 out against ×1.05 in. Measured over floors 401–500 with faction the only
 * thing varied: all-Angel **58.1** members lost, mirror **55.7**, all-Monster **54.5**. So a glassy
 * five loses more to the incoming five percent than it saves on the outgoing — **an Angel board is
 * strictly worse for a Demon five than its own mirror**, and the guard's premise ("its own mirror is
 * the hardest board it has") holds for the Angel Tower by construction and for this one only
 * empirically.
 *
 * ⚠️ **And it is invisible until a band is hard enough to kill somebody.** Bands 1–3 lose 4.3, 6.3
 * and 8.1 members and each is *favourably* biased, because there the outgoing five percent shortens
 * fights the party was never losing. The inversion appears exactly where losses do.
 *
 * ⚠️ **The band was not lightened to fix it, and that was checked rather than assumed.** Its 57.9
 * members lost sat mid-range across the seven towers — Undead 141.0, Monster 88.1, Human 68.8,
 * **Demon 57.9**, Dwarf 48.2, Elf 38.3, Angel 36.7 — so softening it would have been tuning content
 * to a guard. What changed instead is *who carries the axis*: {@link GALLERY_SLIPFANG} and
 * {@link SCREEBACK_DARTER} take roughly half the carrier slots, and the anchors and texture are drawn
 * from the Monster half of the lean. The hundred ships at **67.4% Monster and 32.6% Angel over 500
 * slots, the tower at 55.84% Angel over 2,459** — still the leader, still inside 35–65%, and with far
 * more headroom than the 64.25% the first pass would have left. The tower reads **84.2 against 84.9**,
 * and band 5's own gap falls from +2.2 to **+0.4**. **40 distinct blocks stand over the hundred**,
 * four of them new.
 *
 * Every floor of 401–500 was swept individually against both arrangements, not merely the stride: the
 * worst reference reading is **100%**, the worst alternate **80%**, **no floor times out**, and the
 * longest fight anywhere is **31.4s** against a 67.5s bar. The hundred opens at floor 401 in 1.8s
 * with all five alive and its bands close at **5.00 / 4.60 / 3.55 / 3.27 / 1.95** for the alternate.
 *
 * ⚠️ **What this hundred restores is nothing at all, checked rather than claimed.** Over floors
 * 401–500 no board carries a `heal`, a `drain`, a `shield`, a `regen`, `barrier` or `aegis` status,
 * or a point of `lifeLeech`, `recovery` or `healthRegen` — the same absolute the fourth hundred was
 * the first in the project able to make, held for a second hundred. It is only sayable because the
 * blocks that carry sustain are the heavy Angel supports this tower stopped fielding at floor 340,
 * and it was verified with a script over the authored boards rather than asserted from memory.
 *
 * ## ⚠️ The sixth hundred: the half of crit this tower did not take, authored above its register
 *
 * **The last hundred of the last tower, and the floors that close the fifth round** — the second time
 * this tower has closed one, and the second time it has deleted both `PENDING` lists and every branch
 * that read them.
 *
 * The axis is enemy **`critDamageResist`**. The third hundred took `critBlock` — the **frequency** —
 * and took it *at* the shipped register; this takes the **size**, and takes it far above one.
 * [`damage.ts`](../core/battle/damage.ts) computes `critDamage` as
 * **`1 + max(critDamageAmp − critDamageResist, 0)`**, a subtraction rather than a ratio, and a Demon
 * five carries `critDamageAmp` **Σ4.50 and Σ5.05** — the largest in the game by a quarter — on
 * `critChance` **Σ1.21 and Σ1.43**, also the largest. Every previous hundred here attacked what this
 * crew *deals*: the second its scope, the third how often its crits land, the fourth the type of its
 * damage, the fifth whether the swing lands at all. This one lets the swing land, lets it crit, and
 * takes the crit away afterwards.
 *
 * ⚠️ **It is the Undead sixth hundred's argument read from the other side of the board.** The Riving
 * authored `critDamageAmp` **above** its register precisely because a subtraction defends against a
 * small amplifier and evaporates against a large one; this authors the subtraction above *its*
 * register against the largest amplifier the game ships. Same formula, opposite end, and the two
 * hundreds are three sessions apart.
 *
 * Measured at floor 600 in Relic 100 against controls of **3.90 / 9.3s** (reference, ×0.925) and
 * **3.77 / 9.7s** (alternate, ×0.85) — the two fastest controls in the game — with all five carrying,
 * forty seeds, zero timeouts on every row:
 *
 * ```
 *   critDamageResist  0.20 0.50 0.80 1.10 1.40 1.70 2.00
 *   reference         3.73 3.40 3.02 2.77 2.40 2.45 2.35
 *   alternate         3.42 3.42 2.55 1.93 1.75 1.32 1.23
 *   alt fight          11s  11s  14s  19s  22s  26s  28s
 * ```
 *
 * ⚠️ **The licence is the widest of the thirty-five hundreds: first _and_ second of fourteen, 93%
 * clear of third.** Priced across all fourteen shipped arrangements, each calibrated in 2.5% steps to
 * the heaviest control it still reads ≥3.60 on, demon-alt costs **1.58** and demon-ref **1.16**
 * against elf-alt's 0.82 — and **eleven of the fourteen read at or under 0.57**, eight at or under
 * 0.41. It is aimed at a register rather than at a weakness, and the register is the largest single
 * number this crew has.
 *
 * ⚠️ **It grades in value and in carrier count.** At 1.40 across zero to five carriers it reads
 * **3.90 / 3.50 / 3.35 / 3.10 / 3.00 / 2.33** and **3.60 / 3.42 / 3.13 / 3.02 / 2.80 / 1.55**, with
 * the cliff at the fifth — so the bands walk the value and the count stops at three.
 *
 * ⚠️ **It costs seconds, and this is the one crew that can afford them.** Their controls are **9.3s
 * and 9.7s**, the two fastest in the game, and the axis walks the alternate to 28s at the top of the
 * grade against a 60-second mean bar. That is this tower's own fifth-hundred licence — affordability —
 * used a second time and honestly: the same axis on the Angel arrangements starts from 35.2s and
 * 52.8s.
 *
 * ⚠️ **On a refusal axis the `tank` archetype switches the axis off, for the second tower running.**
 * Held at an identical stat line at four carriers, all-`tank` reads **4.00 / 4.00** and all-`support`
 * 3.70 / 3.92 against all-`brawler` 3.08 / 2.77, all-`mage` 3.00 / 2.27 and all-`ranger` **2.77 /
 * 1.82**. No carrier here wears `tank`. ⚠️ **And the same lever runs the other way on the _escorts_,
 * which is what made the closing bands authorable at all**: a hot-set common at these levels reads the
 * binding arrangement at **3%** where the identical board with `tank` and `support` escorts reads
 * **100%**. The Angel sixth hundred's finding, arriving on the bodies that are not carrying the axis.
 *
 * ⚠️ **Rank is not a dial at all, which is the sixth distinct answer in six hundreds.** Carried on one
 * body with the escort held, a carrier is worth **3.63 of five in front against 3.77 behind** at 0.8,
 * 3.42 against 3.70 at 1.4 and 3.50 against 3.77 at 2.0 — a spread of 0.14 to 0.28 that never resolves
 * on either arrangement. A dodge bills what is *aimed at*, an `attackSpeed` what is *left alive*, a
 * health pool what is aimed at with a *shrinking* spread, a hot body what is left alive with a
 * *growing* one — and a resist bills every blow that reaches the body whenever it arrives.
 *
 * ⚠️ **The pairing was tested and refused, which is this tower's own fourth-hundred finding a second
 * time.** `SUNDER` on `enemy-all` puts demon-alt **third of fourteen and first of the twelve
 * non-Angel** at 1.23 against dwarf-ref's 0.89 — a real licence on its own — but walked *together*
 * with raw `atk` it is sub-additive on the binding arrangement (2.30 + 1.35 alone against **3.35**
 * together, and exactly additive on the reference) and the licence dilutes to **seventh of fourteen**.
 * **Test the pairing and accept the answer in whichever direction it arrives.**
 *
 * ⚠️ **Disqualified rather than merely weak.** `critBlock` is this tower's own third hundred,
 * `magicResist` its fourth, `dodge` its fifth and a board-wide scope its second. `def` puts demon-alt
 * **seventh** of fourteen, `hp` seventh, `atk` eighth (and is the Angel Tower's sixth, one session
 * old), `haste` eighth, a board-wide `SLOW` sixth and a `STUN` fifth. `accuracy` is worth **0.00 to
 * 0.17** against a crew carrying `dodge` Σ0.07 and Σ0.08 — there is nothing to beat — `THORNMAIL`
 * across all five is flat (3.75 → 3.58), and `tenacity` reads 4.00 → 3.88 and 3.73 → 3.27 against a
 * crew carrying **Σ0.00**. **A stat nobody carries is a stat there is nothing to refuse.**
 *
 * ## ⚠️ The register, and which side of it the band landed on
 *
 * Measured **before** these four joined the pool: `critDamageResist` sits on **76 of 442** shipped
 * blocks at a median of **0.20**, a p90 of **0.32** and a ceiling of **0.52** —
 * {@link THE_UNFALTERING}, this tower's own floor-300 roof. The four below run **0.80, 1.10, 1.40 and
 * 1.80**, so the whole band is authored **above** the register and the roof at three and a half times
 * its ceiling. That is the Monster third hundred's shape — *the stat works, but only above the
 * register* — and it is stated here because at the register the axis is worth **0.35 and 0.42**, which
 * is why the two earlier hundreds that measured this stat were right to leave it alone. Bodies at 0.60
 * or above run **1 / 1–2 / 2 / 3 / 3 / 2–3** across the six bands.
 *
 * ## ⚠️ What the hundred carries, stated as counts
 *
 * Of the **33 distinct blocks** it fields over floors 501–600, **zero** carry a heal, a drain, a
 * shield, a `regen`/`barrier`/`aegis` status, a taunt, a link, a reflect, or a point of `lifeLeech`,
 * `recovery` or `healthRegen`. ⚠️ **That is the strong absolute, and this is the second hundred in the
 * project able to make it** — the first was this tower's own fourth. It was checked with a script over
 * the shipped floors rather than by reading, and it screened the roster before the boards were
 * authored rather than after.
 *
 * ⚠️ **The lean overshot exactly as this tower's fifth hundred predicted, and the same fix worked.**
 * Authored the obvious way — the carriers and every cold escort drawn from the lean — the hundred came
 * out at **81.2% Angel**, which is the 81.8% the Processional recorded, on the tower where that
 * overshoot broke the counter-faction inversion guard rather than the 65% ceiling. Converting the
 * escorts to the Monster half of the counter-set leaves the hundred at **57.2% Angel and 42.8%
 * Monster** and the tower at **56.07%**, against the Processional's 55.84%. **The fix is who carries
 * the board, not a lighter band.**
 *
 * ⚠️ **The retirement check took the whole `ascended` roster.** At floor 600 behind four 300/18
 * commons, {@link THE_UNSTRUCK} — the fifth hundred's own roof — reads 100% / 2.52 for the reference
 * and **45%** for the alternate, {@link THE_UNHEARING} 3% / 0%, and {@link THE_UNBITTEN},
 * {@link THE_UNFALTERING}, {@link HOLLOW_SERAPH} and {@link THE_UNISON} all **0% / 0%**; behind four
 * 520/44 legendaries every one of the six reads 0% for both. Four of them still anchor floors 501–520,
 * where the level is forty-seven below the roof, and **no board above 520 carries an `ascended` block
 * at all** until {@link THE_UNMOVED}.
 *
 * The hundred opens at floor 501 in 5.3 seconds with all five alive and closes at **100% / 3.30 /
 * 14.1s against 85% / 1.23 / 27.1s** — zero timeouts anywhere, worst reading 100% and 85%, longest
 * single attempt **41.8s** against the 67.5s bar and slowest mean **27.1s** against the 60s bar. The
 * boards weigh 7,614 common-equivalent at floor 501 and 5,128 at floor 600, a fall of 1.48 under a
 * level line that climbs forty-seven and a grade that climbs Relic 41 → 100.
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
    // The Gilded Gate — Floors 1–12, levels 1–6 — motes and sentries, and the first speed check.
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
    // The Choir Stair — Floors 13–28, levels 7–14 — the locks arrive: a refreshed absorb on five bodies, a back rank that is not safe, an evasion wall.
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
    // The Weighing — Floors 29–48, levels 14–23 — the priority lock, and armour that stops answering the question.
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
    // The Long Watch — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
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
    // The Radiant Vigil — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
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
    // The Gilded Crown — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Hierophant waiting above them.
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
    // The Massed Verse — Floors 101–120, levels 48–57 — the first bodies that speak to all five at once, and nothing rides along with it yet.
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
    // The Hush — Floors 121–140, levels 57–66 — the board-wide turn starts carrying a rider, and the rider is the one the party can still play around.
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
    // The Tolling — Floors 141–160, levels 67–76 — the rider becomes the turn itself, on the lightest legendary body this tower fields.
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
    // The Whole Choir — Floors 161–180, levels 76–85 — the slow and the stun on one board, and the first roofs heavy enough to keep both alive.
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
    // The Last Verse — Floors 181–200, levels 86–95 — three voices on one board, and above them the body that is all three by itself.
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

    // -------------------------------------------------------------------------------------
    // The Unbroken Line — Floors 201–220, levels 95–104 — one voice a board refuses an edge, and the tower stops paying the Demon crit it has been paying for two hundred floors.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f201',
      name: 'Floor 201',
      enemies: {
        front: [CONCORD_CANTOR, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f202',
      name: 'Floor 202',
      enemies: {
        front: [PLAINSONG_PRECENTOR, HEADSMAN],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f203',
      name: 'Floor 203',
      enemies: {
        front: [ASHEN_CHOIR, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, ZENITH_CHORISTER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f204',
      name: 'Floor 204',
      enemies: {
        front: [SEALWARD_CUSTODIAN, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, MOONSONG_WEAVER, REVENANT],
      },
    },
    {
      id: 't-demon-f205',
      name: 'Floor 205',
      enemies: {
        front: [PLAINSONG_PRECENTOR, RIVEN_MARCHWARDEN],
        back: [KNELL_CHANTER, VAULTLIGHT_CENSER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f206',
      name: 'Floor 206',
      enemies: {
        front: [GILDED_SENTRY, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, LITANY_BEARER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f207',
      name: 'Floor 207',
      enemies: {
        front: [PLAINSONG_PRECENTOR, COLDHEARTH_IRONSWORN],
        back: [KNELL_CHANTER, SHARDLIGHT_ACOLYTE, SHADE],
      },
    },
    {
      id: 't-demon-f208',
      name: 'Floor 208',
      enemies: {
        front: [CONCORD_CANTOR, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f209',
      name: 'Floor 209',
      enemies: {
        front: [PLAINSONG_PRECENTOR, WEALDSHADOW_STALKER],
        back: [KNELL_CHANTER, ZENITH_CHORISTER, REVENANT],
      },
    },
    {
      id: 't-demon-f210',
      name: 'Floor 210 — The Unbroken Line',
      enemies: {
        front: [THE_UNBITTEN, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f211',
      name: 'Floor 211',
      enemies: {
        front: [ASHEN_CHOIR, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, VAULTLIGHT_CENSER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f212',
      name: 'Floor 212',
      enemies: {
        front: [PLAINSONG_PRECENTOR, OATHSHIELD_VANGUARD],
        back: [STILLNESS_CANTOR, SHARDLIGHT_ACOLYTE, STORMCALLER],
      },
    },
    {
      id: 't-demon-f213',
      name: 'Floor 213',
      enemies: {
        front: [GLASSCHOIR_ARBITER, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, RADIANT_HERALD, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f214',
      name: 'Floor 214',
      enemies: {
        front: [PLAINSONG_PRECENTOR, BLOODGORGE_HOUND],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f215',
      name: 'Floor 215',
      enemies: {
        front: [SEALWARD_CUSTODIAN, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, ZENITH_CHORISTER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f216',
      name: 'Floor 216',
      enemies: {
        front: [PLAINSONG_PRECENTOR, GRAVETIDE_HERALD],
        back: [STILLNESS_CANTOR, VAULTLIGHT_CENSER, BANDIT],
      },
    },
    {
      id: 't-demon-f217',
      name: 'Floor 217',
      enemies: {
        front: [CONCORD_CANTOR, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, SHARDLIGHT_ACOLYTE, WRATHBORN],
      },
    },
    {
      id: 't-demon-f218',
      name: 'Floor 218',
      enemies: {
        front: [PLAINSONG_PRECENTOR, SENTINEL],
        back: [STILLNESS_CANTOR, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f219',
      name: 'Floor 219',
      enemies: {
        front: [ASHEN_CHOIR, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, LITANY_BEARER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f220',
      name: 'Floor 220 — The Unbroken Line',
      enemies: {
        front: [THE_UNBITTEN, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, SERAPH_ADJUDICANT, REVENANT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Answering Voice — Floors 221–240, levels 105–114 — a second refusal joins it, and the two stand in the same rank.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f221',
      name: 'Floor 221',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f222',
      name: 'Floor 222',
      enemies: {
        front: [PLAINSONG_PRECENTOR, HEADSMAN],
        back: [EVENSONG_WARDEN, ZENITH_CHORISTER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f223',
      name: 'Floor 223',
      enemies: {
        front: [EVENSONG_WARDEN, CONCORD_CANTOR],
        back: [PLAINSONG_PRECENTOR, RADIANT_HERALD, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f224',
      name: 'Floor 224',
      enemies: {
        front: [SEALWARD_CUSTODIAN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, VAULTLIGHT_CENSER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f225',
      name: 'Floor 225',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, SHARDLIGHT_ACOLYTE, REVENANT],
      },
    },
    {
      id: 't-demon-f226',
      name: 'Floor 226',
      enemies: {
        front: [PLAINSONG_PRECENTOR, COLDHEARTH_IRONSWORN],
        back: [EVENSONG_WARDEN, LITANY_BEARER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f227',
      name: 'Floor 227',
      enemies: {
        front: [EVENSONG_WARDEN, GLASSCHOIR_ARBITER],
        back: [PLAINSONG_PRECENTOR, ZENITH_CHORISTER, SHADE],
      },
    },
    {
      id: 't-demon-f228',
      name: 'Floor 228',
      enemies: {
        front: [ASHEN_CHOIR, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, RADIANT_HERALD, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f229',
      name: 'Floor 229',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, VAULTLIGHT_CENSER, FREE_BLADE],
      },
    },
    {
      id: 't-demon-f230',
      name: 'Floor 230 — The Answering Voice',
      enemies: {
        front: [THE_UNBITTEN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SERAPH_ADJUDICANT, STORMCALLER],
      },
    },
    {
      id: 't-demon-f231',
      name: 'Floor 231',
      enemies: {
        front: [EVENSONG_WARDEN, WEALDSHADOW_STALKER],
        back: [PLAINSONG_PRECENTOR, LITANY_BEARER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f232',
      name: 'Floor 232',
      enemies: {
        front: [PLAINSONG_PRECENTOR, RIVEN_MARCHWARDEN],
        back: [EVENSONG_WARDEN, SHARDLIGHT_ACOLYTE, SHADE],
      },
    },
    {
      id: 't-demon-f233',
      name: 'Floor 233',
      enemies: {
        front: [EVENSONG_WARDEN, CONCORD_CANTOR],
        back: [PLAINSONG_PRECENTOR, ZENITH_CHORISTER, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-demon-f234',
      name: 'Floor 234',
      enemies: {
        front: [BLOODGORGE_HOUND, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, RADIANT_HERALD, REVENANT],
      },
    },
    {
      id: 't-demon-f235',
      name: 'Floor 235',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [STILLNESS_CANTOR, VAULTLIGHT_CENSER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f236',
      name: 'Floor 236',
      enemies: {
        front: [PLAINSONG_PRECENTOR, OATHSHIELD_VANGUARD],
        back: [EVENSONG_WARDEN, LITANY_BEARER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f237',
      name: 'Floor 237',
      enemies: {
        front: [EVENSONG_WARDEN, GLASSCHOIR_ARBITER],
        back: [PLAINSONG_PRECENTOR, SHARDLIGHT_ACOLYTE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f238',
      name: 'Floor 238',
      enemies: {
        front: [SEALWARD_CUSTODIAN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, ZENITH_CHORISTER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f239',
      name: 'Floor 239',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [KNELL_CHANTER, SERAPH_ADJUDICANT, SHADE],
      },
    },
    {
      id: 't-demon-f240',
      name: 'Floor 240 — The Answering Voice',
      enemies: {
        front: [THE_UNBITTEN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, RADIANT_HERALD, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Choir Entire — Floors 241–260, levels 114–123 — three of five refuse, which is where the measured cliff is.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f241',
      name: 'Floor 241',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [SCARWEAVE_TRAMPLER, LITANY_BEARER, SHADE],
      },
    },
    {
      id: 't-demon-f242',
      name: 'Floor 242',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, ZENITH_CHORISTER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f243',
      name: 'Floor 243',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [SCARWEAVE_TRAMPLER, RADIANT_HERALD, REVENANT],
      },
    },
    {
      id: 't-demon-f244',
      name: 'Floor 244',
      enemies: {
        front: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER],
        back: [EVENSONG_WARDEN, VAULTLIGHT_CENSER, WRATHBORN],
      },
    },
    {
      id: 't-demon-f245',
      name: 'Floor 245',
      enemies: {
        front: [EVENSONG_WARDEN, CONCORD_CANTOR],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f246',
      name: 'Floor 246',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, PLAINSONG_PRECENTOR],
        back: [EVENSONG_WARDEN, SHARDLIGHT_ACOLYTE, SHADE],
      },
    },
    {
      id: 't-demon-f247',
      name: 'Floor 247',
      enemies: {
        front: [EVENSONG_WARDEN, GLASSCHOIR_ARBITER],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, DEEPROCK_MINER],
      },
    },
    {
      id: 't-demon-f248',
      name: 'Floor 248',
      enemies: {
        front: [ASHEN_CHOIR, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-demon-f249',
      name: 'Floor 249',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, LITANY_BEARER, STORMCALLER],
      },
    },
    {
      id: 't-demon-f250',
      name: 'Floor 250 — The Choir Entire',
      enemies: {
        front: [THE_UNBITTEN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f251',
      name: 'Floor 251',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [SCARWEAVE_TRAMPLER, ZENITH_CHORISTER, GLADE_STALKER],
      },
    },
    {
      id: 't-demon-f252',
      name: 'Floor 252',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, COLDHEARTH_IRONSWORN],
        back: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR, SHADE],
      },
    },
    {
      id: 't-demon-f253',
      name: 'Floor 253',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [PLAINSONG_PRECENTOR, RADIANT_HERALD, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-demon-f254',
      name: 'Floor 254',
      enemies: {
        front: [PLAINSONG_PRECENTOR, WEALDSHADOW_STALKER],
        back: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER, REVENANT],
      },
    },
    {
      id: 't-demon-f255',
      name: 'Floor 255',
      enemies: {
        front: [EVENSONG_WARDEN, CONCORD_CANTOR],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-demon-f256',
      name: 'Floor 256',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SHARDLIGHT_ACOLYTE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-demon-f257',
      name: 'Floor 257',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [SCARWEAVE_TRAMPLER, LITANY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-demon-f258',
      name: 'Floor 258',
      enemies: {
        front: [SEALWARD_CUSTODIAN, SCARWEAVE_TRAMPLER],
        back: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR, SHADE],
      },
    },
    {
      id: 't-demon-f259',
      name: 'Floor 259',
      enemies: {
        front: [EVENSONG_WARDEN, GLASSCHOIR_ARBITER],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-demon-f260',
      name: 'Floor 260 — The Choir Entire',
      enemies: {
        front: [THE_UNBITTEN, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, RADIANT_HERALD],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sealed Verse — Floors 261–280, levels 123–132 — the whole board refuses, and the Trampler brings the only physical damage in the hundred.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f261',
      name: 'Floor 261',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [PLAINSONG_PRECENTOR, SCARBOUND_BELLOWER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f262',
      name: 'Floor 262',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, GOLEM, BLOODGORGE_HOUND],
      },
    },
    {
      id: 't-demon-f263',
      name: 'Floor 263',
      enemies: {
        front: [EVENSONG_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f264',
      name: 'Floor 264',
      enemies: {
        front: [SCARBOUND_BELLOWER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-demon-f265',
      name: 'Floor 265',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [PLAINSONG_PRECENTOR, RIMEPLATE, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f266',
      name: 'Floor 266',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND],
        back: [EVENSONG_WARDEN, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f267',
      name: 'Floor 267',
      enemies: {
        front: [EVENSONG_WARDEN, MARROWHUNT_ALPHA],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, GOLEM],
      },
    },
    {
      id: 't-demon-f268',
      name: 'Floor 268',
      enemies: {
        front: [SCARBOUND_BELLOWER, SCARWEAVE_TRAMPLER],
        back: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f269',
      name: 'Floor 269',
      enemies: {
        front: [EVENSONG_WARDEN, BLOODGORGE_HOUND],
        back: [SCARWEAVE_TRAMPLER, RIMEPLATE, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f270',
      name: 'Floor 270 — The Sealed Verse',
      enemies: {
        front: [THE_UNBITTEN, EVENSONG_WARDEN],
        back: [SCARWEAVE_TRAMPLER, SCARBOUND_BELLOWER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f271',
      name: 'Floor 271',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [PLAINSONG_PRECENTOR, GOLEM, BLOODGORGE_HOUND],
      },
    },
    {
      id: 't-demon-f272',
      name: 'Floor 272',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, MARROWHUNT_ALPHA],
        back: [EVENSONG_WARDEN, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f273',
      name: 'Floor 273',
      enemies: {
        front: [EVENSONG_WARDEN, PLAINSONG_PRECENTOR],
        back: [SCARWEAVE_TRAMPLER, RIMEPLATE, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-demon-f274',
      name: 'Floor 274',
      enemies: {
        front: [SCARBOUND_BELLOWER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND],
      },
    },
    {
      id: 't-demon-f275',
      name: 'Floor 275',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [PLAINSONG_PRECENTOR, GOLEM, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f276',
      name: 'Floor 276',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND],
        back: [EVENSONG_WARDEN, SCARBOUND_BELLOWER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-demon-f277',
      name: 'Floor 277',
      enemies: {
        front: [EVENSONG_WARDEN, SCARBOUND_BELLOWER],
        back: [PLAINSONG_PRECENTOR, SCARWEAVE_TRAMPLER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f278',
      name: 'Floor 278',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [PLAINSONG_PRECENTOR, RIMEPLATE, BLOODGORGE_HOUND],
      },
    },
    {
      id: 't-demon-f279',
      name: 'Floor 279',
      enemies: {
        front: [EVENSONG_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, GOLEM, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f280',
      name: 'Floor 280 — The Sealed Verse',
      enemies: {
        front: [THE_UNBITTEN, SCARWEAVE_TRAMPLER],
        back: [EVENSONG_WARDEN, SCARBOUND_BELLOWER, BLOODGORGE_HOUND],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Long Amen — Floors 281–300, levels 133–142 — the pair of stats together on every body, and above them the one block past the register.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f281',
      name: 'Floor 281',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [SCARBOUND_BELLOWER, MARROWHUNT_ALPHA, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f282',
      name: 'Floor 282',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, GOLEM, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f283',
      name: 'Floor 283',
      enemies: {
        front: [EVENSONG_WARDEN, SCARBOUND_BELLOWER],
        back: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f284',
      name: 'Floor 284',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, MARROWHUNT_ALPHA],
        back: [EVENSONG_WARDEN, RIMEPLATE, SCARBOUND_BELLOWER],
      },
    },
    {
      id: 't-demon-f285',
      name: 'Floor 285',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [SHATTERJAW_MAULER, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f286',
      name: 'Floor 286',
      enemies: {
        front: [SCARBOUND_BELLOWER, EVENSONG_WARDEN],
        back: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-demon-f287',
      name: 'Floor 287',
      enemies: {
        front: [EVENSONG_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, GOLEM, SCARBOUND_BELLOWER],
      },
    },
    {
      id: 't-demon-f288',
      name: 'Floor 288',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f289',
      name: 'Floor 289',
      enemies: {
        front: [EVENSONG_WARDEN, SCARBOUND_BELLOWER],
        back: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f290',
      name: 'Floor 290 — The Long Amen',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SCARWEAVE_TRAMPLER, SCARBOUND_BELLOWER, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f291',
      name: 'Floor 291',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [SHATTERJAW_MAULER, SCARBOUND_BELLOWER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f292',
      name: 'Floor 292',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, BLOODGORGE_HOUND],
        back: [EVENSONG_WARDEN, GOLEM, SCARBOUND_BELLOWER],
      },
    },
    {
      id: 't-demon-f293',
      name: 'Floor 293',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SCARWEAVE_TRAMPLER, MARROWHUNT_ALPHA, PLAINSONG_PRECENTOR],
      },
    },
    {
      id: 't-demon-f294',
      name: 'Floor 294',
      enemies: {
        front: [EVENSONG_WARDEN, SCARBOUND_BELLOWER],
        back: [SCARWEAVE_TRAMPLER, SHATTERJAW_MAULER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-demon-f295',
      name: 'Floor 295',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, EVENSONG_WARDEN],
        back: [SCARBOUND_BELLOWER, BLOODGORGE_HOUND, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SCARWEAVE_TRAMPLER, SCARBOUND_BELLOWER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f297',
      name: 'Floor 297',
      enemies: {
        front: [EVENSONG_WARDEN, SCARWEAVE_TRAMPLER],
        back: [SHATTERJAW_MAULER, GOLEM, SCARBOUND_BELLOWER],
      },
    },
    {
      id: 't-demon-f298',
      name: 'Floor 298',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, MARROWHUNT_ALPHA],
        back: [EVENSONG_WARDEN, SCARBOUND_BELLOWER, BLOODGORGE_HOUND],
      },
    },
    {
      id: 't-demon-f299',
      name: 'Floor 299',
      enemies: {
        front: [THE_UNFALTERING, SCARWEAVE_TRAMPLER],
        back: [EVENSONG_WARDEN, SHATTERJAW_MAULER, SCARBOUND_BELLOWER],
      },
    },
    {
      id: 't-demon-f300',
      name: 'Floor 300 — The Unfaltering',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, SCARWEAVE_TRAMPLER, SCARBOUND_BELLOWER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Hushglass Gate — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — one voice in the front rank of every board, and the first ward the tower has ever asked a Demon five to get through.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f301',
      name: 'Floor 301',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f302',
      name: 'Floor 302',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HUSHGLASS_WARDEN],
        back: [SERAPH_ADJUDICANT, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f303',
      name: 'Floor 303',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [KNELL_CHANTER, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f304',
      name: 'Floor 304',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [STILLNESS_CANTOR, MIREWHELP, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f305',
      name: 'Floor 305',
      enemies: {
        front: [DUSTPLATE_GRINDER, HUSHGLASS_WARDEN],
        back: [CONCORD_CANTOR, ZENITH_CHORISTER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f306',
      name: 'Floor 306',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, VAULTLIGHT_CENSER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f307',
      name: 'Floor 307',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HUSHGLASS_WARDEN],
        back: [PLAINSONG_PRECENTOR, SUMPWATER_BROOD, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f308',
      name: 'Floor 308',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [RADIANT_HERALD, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f309',
      name: 'Floor 309',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, CLEFTHORN_GORER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f310',
      name: 'Floor 310 — The Hushglass Gate',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, SCARWEAVE_TRAMPLER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f311',
      name: 'Floor 311',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f312',
      name: 'Floor 312',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HUSHGLASS_WARDEN],
        back: [SERAPH_ADJUDICANT, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f313',
      name: 'Floor 313',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [KNELL_CHANTER, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f314',
      name: 'Floor 314',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [STILLNESS_CANTOR, MIREWHELP, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f315',
      name: 'Floor 315',
      enemies: {
        front: [DUSTPLATE_GRINDER, HUSHGLASS_WARDEN],
        back: [CONCORD_CANTOR, ZENITH_CHORISTER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f316',
      name: 'Floor 316',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, VAULTLIGHT_CENSER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f317',
      name: 'Floor 317',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HUSHGLASS_WARDEN],
        back: [PLAINSONG_PRECENTOR, SUMPWATER_BROOD, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f318',
      name: 'Floor 318',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [RADIANT_HERALD, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f319',
      name: 'Floor 319',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, CLEFTHORN_GORER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f320',
      name: 'Floor 320 — The Hushglass Gate',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, SCARWEAVE_TRAMPLER, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Second Silence — Floors 321–340, levels 152–161, Sturdy 5–Sturdy 28 — a second voice joins it, quicker and deeper, and the two never stand in the same rank twice running.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f321',
      name: 'Floor 321',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f322',
      name: 'Floor 322',
      enemies: {
        front: [REDWATER_STALKER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f323',
      name: 'Floor 323',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f324',
      name: 'Floor 324',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f325',
      name: 'Floor 325',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f326',
      name: 'Floor 326',
      enemies: {
        front: [PLAINSONG_PRECENTOR, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f327',
      name: 'Floor 327',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f328',
      name: 'Floor 328',
      enemies: {
        front: [REDWATER_STALKER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f329',
      name: 'Floor 329',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f330',
      name: 'Floor 330 — The Second Silence',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, RAVAGER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f331',
      name: 'Floor 331',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f332',
      name: 'Floor 332',
      enemies: {
        front: [PLAINSONG_PRECENTOR, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f333',
      name: 'Floor 333',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f334',
      name: 'Floor 334',
      enemies: {
        front: [REDWATER_STALKER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f335',
      name: 'Floor 335',
      enemies: {
        front: [EVENSONG_WARDEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f336',
      name: 'Floor 336',
      enemies: {
        front: [CLOSEWARD_SERAPH, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f337',
      name: 'Floor 337',
      enemies: {
        front: [SCARWEAVE_TRAMPLER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f338',
      name: 'Floor 338',
      enemies: {
        front: [PLAINSONG_PRECENTOR, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f339',
      name: 'Floor 339',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f340',
      name: 'Floor 340 — The Second Silence',
      enemies: {
        front: [THE_UNBITTEN, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, RAVAGER, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sealed Vault — Floors 341–360, levels 161–170, Sturdy 29–Fine 12 — the deepest ward any legendary carries anchors the board, and the ascended blocks the tower climbed on are gone.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f341',
      name: 'Floor 341',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f342',
      name: 'Floor 342',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [SERAPH_ADJUDICANT, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f343',
      name: 'Floor 343',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [KNELL_CHANTER, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f344',
      name: 'Floor 344',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f345',
      name: 'Floor 345',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [CONCORD_CANTOR, ZENITH_CHORISTER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f346',
      name: 'Floor 346',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [PLAINSONG_PRECENTOR, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f347',
      name: 'Floor 347',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f348',
      name: 'Floor 348',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [RADIANT_HERALD, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f349',
      name: 'Floor 349',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f350',
      name: 'Floor 350 — The Sealed Vault',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, GALLERY_SLIPFANG, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f351',
      name: 'Floor 351',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f352',
      name: 'Floor 352',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [SERAPH_ADJUDICANT, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f353',
      name: 'Floor 353',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [KNELL_CHANTER, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f354',
      name: 'Floor 354',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f355',
      name: 'Floor 355',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [CONCORD_CANTOR, ZENITH_CHORISTER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f356',
      name: 'Floor 356',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [PLAINSONG_PRECENTOR, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f357',
      name: 'Floor 357',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [STILLNESS_CANTOR, LITANY_BEARER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f358',
      name: 'Floor 358',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [RADIANT_HERALD, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f359',
      name: 'Floor 359',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [GLASSCHOIR_ARBITER, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f360',
      name: 'Floor 360 — The Sealed Vault',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [ANTIPHON_ARCHON, GALLERY_SLIPFANG, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Vault Entire — Floors 361–380, levels 170–179, Fine 13–Fine 36 — three voices on every board, which is where the measured cliff was on the count.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f361',
      name: 'Floor 361',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f362',
      name: 'Floor 362',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f363',
      name: 'Floor 363',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f364',
      name: 'Floor 364',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f365',
      name: 'Floor 365',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f366',
      name: 'Floor 366',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f367',
      name: 'Floor 367',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, VAULTLIGHT_CENSER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f368',
      name: 'Floor 368',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f369',
      name: 'Floor 369',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f370',
      name: 'Floor 370 — The Vault Entire',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, GALLERY_SLIPFANG, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f371',
      name: 'Floor 371',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f372',
      name: 'Floor 372',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f373',
      name: 'Floor 373',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f374',
      name: 'Floor 374',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SUMPWATER_BROOD, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f375',
      name: 'Floor 375',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f376',
      name: 'Floor 376',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, DRIFTMOUTH_CHOKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f377',
      name: 'Floor 377',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, VAULTLIGHT_CENSER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-demon-f378',
      name: 'Floor 378',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f379',
      name: 'Floor 379',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ASHPIT_SCUTTLER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f380',
      name: 'Floor 380 — The Vault Entire',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, GALLERY_SLIPFANG, ASHPIT_SCUTTLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Unhearing — Floors 381–400, levels 180–189, Fine 37–Fine 60 — the front rank entire, the boards shedding weight into the roof, and at the top the deepest ward in the game.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f381',
      name: 'Floor 381',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f382',
      name: 'Floor 382',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f383',
      name: 'Floor 383',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f384',
      name: 'Floor 384',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f385',
      name: 'Floor 385',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f386',
      name: 'Floor 386',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f387',
      name: 'Floor 387',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, VAULTLIGHT_CENSER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f388',
      name: 'Floor 388',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f389',
      name: 'Floor 389',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-demon-f390',
      name: 'Floor 390 — The Unhearing',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f391',
      name: 'Floor 391',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f392',
      name: 'Floor 392',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f393',
      name: 'Floor 393',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LITANY_BEARER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f394',
      name: 'Floor 394',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f395',
      name: 'Floor 395',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-demon-f396',
      name: 'Floor 396',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, ZENITH_CHORISTER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f397',
      name: 'Floor 397',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, VAULTLIGHT_CENSER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f398',
      name: 'Floor 398',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, LUMEN_ACOLYTE, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f399',
      name: 'Floor 399',
      enemies: {
        front: [SILENTVAULT_KEEPER, HUSHGLASS_WARDEN],
        back: [UNSPOKEN_CANON, SHARDLIGHT_ACOLYTE, ZENITH_CHORISTER],
      },
    },
    {
      id: 't-demon-f400',
      name: 'Floor 400 — The Unhearing',
      enemies: {
        front: [THE_UNHEARING, HUSHGLASS_WARDEN],
        back: [ZENITH_CHORISTER, SHARDLIGHT_ACOLYTE, VAULTLIGHT_CENSER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Processional — Floors 401–420, levels 189–198, Masterwork 1–Masterwork 24 — one voice a board, in the front rank of every one, and the first floors in five hundred where a swing simply does not land. The voice is as often Monster as Angel, which is what keeps the choir off the whole hundred.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f401',
      name: 'Floor 401',
      enemies: {
        front: [DUSTPLATE_GRINDER, CENSERSTEP_ACOLYTE],
        back: [RENDFANG_JACKAL, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f402',
      name: 'Floor 402',
      enemies: {
        front: [DUSTPLATE_GRINDER, CENSERSTEP_ACOLYTE],
        back: [MARROWHUNT_ALPHA, CLEFTHORN_GORER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f403',
      name: 'Floor 403',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [RAVAGER, DRIFTMOUTH_CHOKER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f404',
      name: 'Floor 404',
      enemies: {
        front: [SCARBOUND_BELLOWER, CENSERSTEP_ACOLYTE],
        back: [REDWATER_STALKER, SUMPWATER_BROOD, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f405',
      name: 'Floor 405',
      enemies: {
        front: [OVERBURDEN_HULK, SCREEBACK_DARTER],
        back: [SCARWEAVE_TRAMPLER, RENDFANG_JACKAL, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f406',
      name: 'Floor 406',
      enemies: {
        front: [SILENTVAULT_KEEPER, CENSERSTEP_ACOLYTE],
        back: [BENCHLINE_LURKER, ASHPIT_SCUTTLER, CARRION_SWARM],
      },
    },
    {
      id: 't-demon-f407',
      name: 'Floor 407',
      enemies: {
        front: [CLOSEWARD_SERAPH, GALLERY_SLIPFANG],
        back: [CLEFTHORN_GORER, MIREWHELP, LONGEBB_RENDER],
      },
    },
    {
      id: 't-demon-f408',
      name: 'Floor 408',
      enemies: {
        front: [GOREHIDE_MATRIARCH, CENSERSTEP_ACOLYTE],
        back: [DRIFTMOUTH_CHOKER, CHALKHIDE_BROWSER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-demon-f409',
      name: 'Floor 409',
      enemies: {
        front: [SHATTERJAW_MAULER, SCREEBACK_DARTER],
        back: [SUMPWATER_BROOD, THORNBACK_GRAZER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f410',
      name: 'Floor 410 — A Pace Ahead',
      enemies: {
        front: [HUSHGLASS_WARDEN, CENSERSTEP_ACOLYTE],
        back: [RENDFANG_JACKAL, CARRION_SWARM, SALTBLEACH_CRIER],
      },
    },
    {
      id: 't-demon-f411',
      name: 'Floor 411',
      enemies: {
        front: [EVENSONG_WARDEN, GALLERY_SLIPFANG],
        back: [ASHPIT_SCUTTLER, LONGEBB_RENDER, MIREFOOT_RUNNER],
      },
    },
    {
      id: 't-demon-f412',
      name: 'Floor 412',
      enemies: {
        front: [THE_UNHEARING, CENSERSTEP_ACOLYTE],
        back: [MIREWHELP, CHANNELBED_STALKER, SLIME],
      },
    },
    {
      id: 't-demon-f413',
      name: 'Floor 413',
      enemies: {
        front: [DUSTPLATE_GRINDER, SCREEBACK_DARTER],
        back: [CHALKHIDE_BROWSER, BAREMARK_GNAWER, SHATTERJAW_MAULER],
      },
    },
    {
      id: 't-demon-f414',
      name: 'Floor 414',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, CENSERSTEP_ACOLYTE],
        back: [THORNBACK_GRAZER, SALTBLEACH_CRIER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f415',
      name: 'Floor 415',
      enemies: {
        front: [SCARBOUND_BELLOWER, GALLERY_SLIPFANG],
        back: [CARRION_SWARM, MIREFOOT_RUNNER, RAVAGER],
      },
    },
    {
      id: 't-demon-f416',
      name: 'Floor 416',
      enemies: {
        front: [OVERBURDEN_HULK, CENSERSTEP_ACOLYTE],
        back: [LONGEBB_RENDER, SLIME, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f417',
      name: 'Floor 417',
      enemies: {
        front: [SILENTVAULT_KEEPER, SCREEBACK_DARTER],
        back: [CHANNELBED_STALKER, SHATTERJAW_MAULER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f418',
      name: 'Floor 418',
      enemies: {
        front: [CLOSEWARD_SERAPH, CENSERSTEP_ACOLYTE],
        back: [BAREMARK_GNAWER, MARROWHUNT_ALPHA, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f419',
      name: 'Floor 419',
      enemies: {
        front: [GOREHIDE_MATRIARCH, GALLERY_SLIPFANG],
        back: [SALTBLEACH_CRIER, RAVAGER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f420',
      name: 'Floor 420 — The Censer Swung',
      enemies: {
        front: [SHATTERJAW_MAULER, CENSERSTEP_ACOLYTE],
        back: [MIREFOOT_RUNNER, REDWATER_STALKER, DRIFTMOUTH_CHOKER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Cleared Aisle — Floors 421–445, levels 199–210, Masterwork 25–Masterwork 54 — two, drawn from both factions that counter a Demon five, and the anchor is still the tower's own weight.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f421',
      name: 'Floor 421',
      enemies: {
        front: [SCARBOUND_BELLOWER, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f422',
      name: 'Floor 422',
      enemies: {
        front: [OVERBURDEN_HULK, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f423',
      name: 'Floor 423',
      enemies: {
        front: [SILENTVAULT_KEEPER, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f424',
      name: 'Floor 424',
      enemies: {
        front: [CLOSEWARD_SERAPH, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f425',
      name: 'Floor 425',
      enemies: {
        front: [GOREHIDE_MATRIARCH, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f426',
      name: 'Floor 426',
      enemies: {
        front: [SHATTERJAW_MAULER, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, MARROWHUNT_ALPHA, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f427',
      name: 'Floor 427',
      enemies: {
        front: [HUSHGLASS_WARDEN, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f428',
      name: 'Floor 428',
      enemies: {
        front: [EVENSONG_WARDEN, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f429',
      name: 'Floor 429',
      enemies: {
        front: [DUSTPLATE_GRINDER, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f430',
      name: "Floor 430 — The Verger's Round",
      enemies: {
        front: [DUSTPLATE_GRINDER, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f431',
      name: 'Floor 431',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f432',
      name: 'Floor 432',
      enemies: {
        front: [SCARBOUND_BELLOWER, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f433',
      name: 'Floor 433',
      enemies: {
        front: [OVERBURDEN_HULK, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f434',
      name: 'Floor 434',
      enemies: {
        front: [SILENTVAULT_KEEPER, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, LONGEBB_RENDER],
      },
    },
    {
      id: 't-demon-f435',
      name: 'Floor 435',
      enemies: {
        front: [CLOSEWARD_SERAPH, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f436',
      name: 'Floor 436',
      enemies: {
        front: [GOREHIDE_MATRIARCH, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f437',
      name: 'Floor 437',
      enemies: {
        front: [SHATTERJAW_MAULER, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, RAVAGER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f438',
      name: 'Floor 438',
      enemies: {
        front: [HUSHGLASS_WARDEN, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, SUMPWATER_BROOD],
      },
    },
    {
      id: 't-demon-f439',
      name: 'Floor 439',
      enemies: {
        front: [EVENSONG_WARDEN, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f440',
      name: 'Floor 440 — The Aisle Kept',
      enemies: {
        front: [THE_UNHEARING, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f441',
      name: 'Floor 441',
      enemies: {
        front: [DUSTPLATE_GRINDER, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f442',
      name: 'Floor 442',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f443',
      name: 'Floor 443',
      enemies: {
        front: [SCARBOUND_BELLOWER, GALLERY_SLIPFANG],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f444',
      name: 'Floor 444',
      enemies: {
        front: [OVERBURDEN_HULK, CENSERSTEP_ACOLYTE],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f445',
      name: 'Floor 445',
      enemies: {
        front: [DUSTPLATE_GRINDER, GALLERY_SLIPFANG],
        back: [AISLEWARD_VERGER, SHATTERJAW_MAULER, MIREFOOT_RUNNER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Guttering — Floors 446–467, levels 210–220, Masterwork 55–Masterwork 80 — three, the Sexton anchoring in place of the weight, and the returning pair joining from the Monster half of the lean.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f446',
      name: 'Floor 446',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f447',
      name: 'Floor 447',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, BENCHLINE_LURKER],
      },
    },
    {
      id: 't-demon-f448',
      name: 'Floor 448',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, SUMPWATER_BROOD],
      },
    },
    {
      id: 't-demon-f449',
      name: 'Floor 449',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, REDWATER_STALKER, RAVAGER],
      },
    },
    {
      id: 't-demon-f450',
      name: 'Floor 450 — The Wick Turned Down',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SHATTERJAW_MAULER, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f451',
      name: 'Floor 451',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, RAVAGER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f452',
      name: 'Floor 452',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f453',
      name: 'Floor 453',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, RAVAGER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f454',
      name: 'Floor 454',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, MARROWHUNT_ALPHA, SUMPWATER_BROOD],
      },
    },
    {
      id: 't-demon-f455',
      name: 'Floor 455',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f456',
      name: 'Floor 456',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, MIREFOOT_RUNNER],
      },
    },
    {
      id: 't-demon-f457',
      name: 'Floor 457',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f458',
      name: 'Floor 458',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, MARROWHUNT_ALPHA, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f459',
      name: 'Floor 459',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, RAVAGER],
      },
    },
    {
      id: 't-demon-f460',
      name: 'Floor 460 — The Low Flame',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f461',
      name: 'Floor 461',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f462',
      name: 'Floor 462',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, MARROWHUNT_ALPHA, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f463',
      name: 'Floor 463',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, RAVAGER],
      },
    },
    {
      id: 't-demon-f464',
      name: 'Floor 464',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [SCREEBACK_DARTER, MARROWHUNT_ALPHA, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f465',
      name: 'Floor 465',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    {
      id: 't-demon-f466',
      name: 'Floor 466',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCARWEAVE_TRAMPLER, MIREFOOT_RUNNER],
      },
    },
    {
      id: 't-demon-f467',
      name: 'Floor 467',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [SCREEBACK_DARTER, SHATTERJAW_MAULER, CLEFTHORN_GORER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Passing Light — Floors 468–488, levels 221–230, Relic 2–Relic 26 — opens on the Relic boundary, where the effective bonus steps from +108% to +25.8%, so it opens heavier than the band below closes and sheds its anchor a rank at a time.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f468',
      name: 'Floor 468',
      enemies: {
        front: [CLOSEWARD_SERAPH, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f469',
      name: 'Floor 469',
      enemies: {
        front: [GOREHIDE_MATRIARCH, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f470',
      name: 'Floor 470 — The Light Carried Out',
      enemies: {
        front: [SHATTERJAW_MAULER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f471',
      name: 'Floor 471',
      enemies: {
        front: [THE_UNHEARING, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f472',
      name: 'Floor 472',
      enemies: {
        front: [EVENSONG_WARDEN, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f473',
      name: 'Floor 473',
      enemies: {
        front: [THE_UNHEARING, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f474',
      name: 'Floor 474',
      enemies: {
        front: [DUSTPLATE_GRINDER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f475',
      name: 'Floor 475',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, CENSERSTEP_ACOLYTE, RAVAGER],
      },
    },
    {
      id: 't-demon-f476',
      name: 'Floor 476',
      enemies: {
        front: [SCARBOUND_BELLOWER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f477',
      name: 'Floor 477',
      enemies: {
        front: [OVERBURDEN_HULK, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, REDWATER_STALKER],
      },
    },
    {
      id: 't-demon-f478',
      name: 'Floor 478',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f479',
      name: 'Floor 479',
      enemies: {
        front: [SHATTERJAW_MAULER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f480',
      name: 'Floor 480 — The Last Taper',
      enemies: {
        front: [GOREHIDE_MATRIARCH, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f481',
      name: 'Floor 481',
      enemies: {
        front: [SHATTERJAW_MAULER, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, RAVAGER],
      },
    },
    {
      id: 't-demon-f482',
      name: 'Floor 482',
      enemies: {
        front: [DUSTPLATE_GRINDER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f483',
      name: 'Floor 483',
      enemies: {
        front: [GOREHIDE_MATRIARCH, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, CENSERSTEP_ACOLYTE, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f484',
      name: 'Floor 484',
      enemies: {
        front: [THE_UNHEARING, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f485',
      name: 'Floor 485',
      enemies: {
        front: [DUSTPLATE_GRINDER, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, MARROWHUNT_ALPHA],
      },
    },
    {
      id: 't-demon-f486',
      name: 'Floor 486',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-demon-f487',
      name: 'Floor 487',
      enemies: {
        front: [SCARBOUND_BELLOWER, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, CENSERSTEP_ACOLYTE, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f488',
      name: 'Floor 488',
      enemies: {
        front: [OVERBURDEN_HULK, GALLERY_SLIPFANG],
        back: [GUTTERLIGHT_SEXTON, SCREEBACK_DARTER, ASHPIT_SCUTTLER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Unstruck — Floors 489–500, levels 231–236, Relic 27–Relic 40 — four voices, the weight shed into the roof, and at the top the only body in the hundred past the register.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f489',
      name: 'Floor 489',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f490',
      name: 'Floor 490 — The Blow Unmet',
      enemies: {
        front: [GALLERY_SLIPFANG, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, MIREWHELP],
      },
    },
    {
      id: 't-demon-f491',
      name: 'Floor 491',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [AISLEWARD_VERGER, SCREEBACK_DARTER, MIREFOOT_RUNNER],
      },
    },
    {
      id: 't-demon-f492',
      name: 'Floor 492',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [AISLEWARD_VERGER, SCREEBACK_DARTER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-demon-f493',
      name: 'Floor 493',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f494',
      name: 'Floor 494',
      enemies: {
        front: [GALLERY_SLIPFANG, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f495',
      name: 'Floor 495',
      enemies: {
        front: [GALLERY_SLIPFANG, GUTTERLIGHT_SEXTON],
        back: [AISLEWARD_VERGER, SCREEBACK_DARTER, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f496',
      name: 'Floor 496',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, SALTBLEACH_CRIER],
      },
    },
    {
      id: 't-demon-f497',
      name: 'Floor 497',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-demon-f498',
      name: 'Floor 498',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, SUMPWATER_BROOD],
      },
    },
    {
      id: 't-demon-f499',
      name: 'Floor 499',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, AISLEWARD_VERGER],
        back: [CENSERSTEP_ACOLYTE, SCREEBACK_DARTER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-demon-f500',
      name: 'Floor 500 — The Unstruck',
      enemies: {
        front: [THE_UNSTRUCK, CENSERSTEP_ACOLYTE],
        back: [SHARDLIGHT_ACOLYTE, ZENITH_CHORISTER, LUMEN_ACOLYTE],
      },
    }, // -------------------------------------------------------------------------------------
    // The Deadening — Floors 501–520, levels 236–245, Relic 41–52 — the last four of the old anchors, and behind each of them one body the edge finds and does not open. One body a board at `critDamageResist` 0.60 or above, and the only band whose difficulty is still its weight.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f501',
      name: 'Floor 501',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, MARROWHUNT_ALPHA, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f502',
      name: 'Floor 502',
      enemies: {
        front: [THE_UNHEARING, GUTTERLIGHT_SEXTON],
        back: [DUSTPLATE_GRINDER, REDWATER_STALKER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f503',
      name: 'Floor 503',
      enemies: {
        front: [THE_UNBITTEN, AISLEWARD_VERGER],
        back: [OVERBURDEN_HULK, GALLERY_SLIPFANG, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f504',
      name: 'Floor 504',
      enemies: {
        front: [THE_UNSTRUCK, HUSHGLASS_WARDEN],
        back: [RAVAGER, GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f505',
      name: 'Floor 505',
      enemies: {
        front: [THE_UNHEARING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, DUSTPLATE_GRINDER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f506',
      name: 'Floor 506',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, MARROWHUNT_ALPHA, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f507',
      name: 'Floor 507',
      enemies: {
        front: [THE_UNHEARING, GUTTERLIGHT_SEXTON],
        back: [DUSTPLATE_GRINDER, REDWATER_STALKER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f508',
      name: 'Floor 508',
      enemies: {
        front: [THE_UNBITTEN, AISLEWARD_VERGER],
        back: [OVERBURDEN_HULK, GALLERY_SLIPFANG, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f509',
      name: 'Floor 509',
      enemies: {
        front: [THE_UNSTRUCK, HUSHGLASS_WARDEN],
        back: [RAVAGER, GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f510',
      name: 'Floor 510 — The Deadening',
      enemies: {
        front: [THE_UNHEARING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, DUSTPLATE_GRINDER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f511',
      name: 'Floor 511',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, MARROWHUNT_ALPHA, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f512',
      name: 'Floor 512',
      enemies: {
        front: [THE_UNHEARING, GUTTERLIGHT_SEXTON],
        back: [DUSTPLATE_GRINDER, REDWATER_STALKER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f513',
      name: 'Floor 513',
      enemies: {
        front: [THE_UNBITTEN, AISLEWARD_VERGER],
        back: [OVERBURDEN_HULK, GALLERY_SLIPFANG, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f514',
      name: 'Floor 514',
      enemies: {
        front: [THE_UNSTRUCK, HUSHGLASS_WARDEN],
        back: [RAVAGER, GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f515',
      name: 'Floor 515',
      enemies: {
        front: [THE_UNHEARING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, DUSTPLATE_GRINDER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f516',
      name: 'Floor 516',
      enemies: {
        front: [THE_UNFALTERING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, MARROWHUNT_ALPHA, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f517',
      name: 'Floor 517',
      enemies: {
        front: [THE_UNHEARING, GUTTERLIGHT_SEXTON],
        back: [DUSTPLATE_GRINDER, REDWATER_STALKER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f518',
      name: 'Floor 518',
      enemies: {
        front: [THE_UNBITTEN, AISLEWARD_VERGER],
        back: [OVERBURDEN_HULK, GALLERY_SLIPFANG, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f519',
      name: 'Floor 519',
      enemies: {
        front: [THE_UNSTRUCK, HUSHGLASS_WARDEN],
        back: [RAVAGER, GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f520',
      name: 'Floor 520 — The Cold Stone',
      enemies: {
        front: [THE_UNHEARING, EVENSONG_WARDEN],
        back: [SHATTERJAW_MAULER, DUSTPLATE_GRINDER, PSALMSTONE_LECTOR],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Cold Stone — Floors 521–545, levels 246–257, Relic 53–67 — no board above 520 carries an `ascended` block. One or two a board, and the value steps past the shipped ceiling of 0.52 for the first time — at the register the axis is worth 0.35 and 0.42, which is why two earlier hundreds left it alone.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f521',
      name: 'Floor 521',
      enemies: {
        front: [EVENSONG_WARDEN, SHATTERJAW_MAULER],
        back: [MARROWHUNT_ALPHA, GUTTERLIGHT_SEXTON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f522',
      name: 'Floor 522',
      enemies: {
        front: [AISLEWARD_VERGER, DUSTPLATE_GRINDER],
        back: [REDWATER_STALKER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f523',
      name: 'Floor 523',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, OVERBURDEN_HULK],
        back: [GALLERY_SLIPFANG, HUSHGLASS_WARDEN, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f524',
      name: 'Floor 524',
      enemies: {
        front: [EVENSONG_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f525',
      name: 'Floor 525',
      enemies: {
        front: [HUSHGLASS_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, GLASSCHOIR_ARBITER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f526',
      name: 'Floor 526',
      enemies: {
        front: [AISLEWARD_VERGER, SHATTERJAW_MAULER],
        back: [DUSTPLATE_GRINDER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f527',
      name: 'Floor 527',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, REDWATER_STALKER],
        back: [GOLEM, UNSPOKEN_CANON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f528',
      name: 'Floor 528',
      enemies: {
        front: [EVENSONG_WARDEN, SHATTERJAW_MAULER],
        back: [MARROWHUNT_ALPHA, GUTTERLIGHT_SEXTON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f529',
      name: 'Floor 529',
      enemies: {
        front: [AISLEWARD_VERGER, DUSTPLATE_GRINDER],
        back: [REDWATER_STALKER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f530',
      name: 'Floor 530 — The Slow Psalm',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, OVERBURDEN_HULK],
        back: [GALLERY_SLIPFANG, HUSHGLASS_WARDEN, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f531',
      name: 'Floor 531',
      enemies: {
        front: [EVENSONG_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f532',
      name: 'Floor 532',
      enemies: {
        front: [HUSHGLASS_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, GLASSCHOIR_ARBITER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f533',
      name: 'Floor 533',
      enemies: {
        front: [AISLEWARD_VERGER, SHATTERJAW_MAULER],
        back: [DUSTPLATE_GRINDER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f534',
      name: 'Floor 534',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, REDWATER_STALKER],
        back: [GOLEM, UNSPOKEN_CANON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f535',
      name: 'Floor 535',
      enemies: {
        front: [EVENSONG_WARDEN, SHATTERJAW_MAULER],
        back: [MARROWHUNT_ALPHA, GUTTERLIGHT_SEXTON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f536',
      name: 'Floor 536',
      enemies: {
        front: [AISLEWARD_VERGER, DUSTPLATE_GRINDER],
        back: [REDWATER_STALKER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f537',
      name: 'Floor 537',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, OVERBURDEN_HULK],
        back: [GALLERY_SLIPFANG, HUSHGLASS_WARDEN, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f538',
      name: 'Floor 538',
      enemies: {
        front: [EVENSONG_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f539',
      name: 'Floor 539',
      enemies: {
        front: [HUSHGLASS_WARDEN, MARROWHUNT_ALPHA],
        back: [SCARWEAVE_TRAMPLER, GLASSCHOIR_ARBITER, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f540',
      name: 'Floor 540 — The Reliquary',
      enemies: {
        front: [AISLEWARD_VERGER, SHATTERJAW_MAULER],
        back: [DUSTPLATE_GRINDER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f541',
      name: 'Floor 541',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, REDWATER_STALKER],
        back: [GOLEM, UNSPOKEN_CANON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f542',
      name: 'Floor 542',
      enemies: {
        front: [EVENSONG_WARDEN, SHATTERJAW_MAULER],
        back: [MARROWHUNT_ALPHA, GUTTERLIGHT_SEXTON, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f543',
      name: 'Floor 543',
      enemies: {
        front: [AISLEWARD_VERGER, DUSTPLATE_GRINDER],
        back: [REDWATER_STALKER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f544',
      name: 'Floor 544',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, OVERBURDEN_HULK],
        back: [GALLERY_SLIPFANG, HUSHGLASS_WARDEN, PSALMSTONE_LECTOR],
      },
    },
    {
      id: 't-demon-f545',
      name: 'Floor 545',
      enemies: {
        front: [EVENSONG_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Muffled Bell — Floors 546–567, levels 258–267, Relic 68–80 — two a board, and the weight comes down as the value goes up: floor 501 weighs 7,614 common-equivalent and floor 600 weighs 5,128.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f546',
      name: 'Floor 546',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f547',
      name: 'Floor 547',
      enemies: {
        front: [AISLEWARD_VERGER, GALLERY_SLIPFANG],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f548',
      name: 'Floor 548',
      enemies: {
        front: [GLASSCHOIR_ARBITER, MARROWHUNT_ALPHA],
        back: [GOLEM, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f549',
      name: 'Floor 549',
      enemies: {
        front: [KNELL_CHANTER, REDWATER_STALKER],
        back: [THORNBACK_GRAZER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f550',
      name: 'Floor 550 — The Muffled Bell',
      enemies: {
        front: [UNSPOKEN_CANON, SCARWEAVE_TRAMPLER],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f551',
      name: 'Floor 551',
      enemies: {
        front: [HUSHGLASS_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f552',
      name: 'Floor 552',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f553',
      name: 'Floor 553',
      enemies: {
        front: [AISLEWARD_VERGER, GALLERY_SLIPFANG],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f554',
      name: 'Floor 554',
      enemies: {
        front: [GLASSCHOIR_ARBITER, MARROWHUNT_ALPHA],
        back: [GOLEM, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f555',
      name: 'Floor 555',
      enemies: {
        front: [KNELL_CHANTER, REDWATER_STALKER],
        back: [THORNBACK_GRAZER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f556',
      name: 'Floor 556',
      enemies: {
        front: [UNSPOKEN_CANON, SCARWEAVE_TRAMPLER],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f557',
      name: 'Floor 557',
      enemies: {
        front: [HUSHGLASS_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f558',
      name: 'Floor 558',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f559',
      name: 'Floor 559',
      enemies: {
        front: [AISLEWARD_VERGER, GALLERY_SLIPFANG],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f560',
      name: 'Floor 560 — The Stopped Peal',
      enemies: {
        front: [GLASSCHOIR_ARBITER, MARROWHUNT_ALPHA],
        back: [GOLEM, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f561',
      name: 'Floor 561',
      enemies: {
        front: [KNELL_CHANTER, REDWATER_STALKER],
        back: [THORNBACK_GRAZER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f562',
      name: 'Floor 562',
      enemies: {
        front: [UNSPOKEN_CANON, SCARWEAVE_TRAMPLER],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f563',
      name: 'Floor 563',
      enemies: {
        front: [HUSHGLASS_WARDEN, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f564',
      name: 'Floor 564',
      enemies: {
        front: [GUTTERLIGHT_SEXTON, RAVAGER],
        back: [GOREHIDE_MATRIARCH, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f565',
      name: 'Floor 565',
      enemies: {
        front: [AISLEWARD_VERGER, GALLERY_SLIPFANG],
        back: [CHALKHIDE_BROWSER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f566',
      name: 'Floor 566',
      enemies: {
        front: [GLASSCHOIR_ARBITER, MARROWHUNT_ALPHA],
        back: [GOLEM, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    {
      id: 't-demon-f567',
      name: 'Floor 567',
      enemies: {
        front: [KNELL_CHANTER, REDWATER_STALKER],
        back: [THORNBACK_GRAZER, PSALMSTONE_LECTOR, GRAVELIGHT_BEADLE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Unfelt Blow — Floors 568–585, levels 268–276, Relic 81–91 — the lieutenant arrives at 568 carrying 1.40, and rank stops mattering — a carrier is worth 3.42 of five in front against 3.70 behind, a spread that never resolves at any value. Three a board.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f568',
      name: 'Floor 568',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f569',
      name: 'Floor 569',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, CHALKHIDE_BROWSER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f570',
      name: 'Floor 570 — The Unfelt Blow',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f571',
      name: 'Floor 571',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, THORNBACK_GRAZER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f572',
      name: 'Floor 572',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f573',
      name: 'Floor 573',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOLEM, ROUGHCAST_GNAWER],
      },
    },
    {
      id: 't-demon-f574',
      name: 'Floor 574',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f575',
      name: 'Floor 575',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, CHALKHIDE_BROWSER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f576',
      name: 'Floor 576',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f577',
      name: 'Floor 577',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, THORNBACK_GRAZER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f578',
      name: 'Floor 578',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f579',
      name: 'Floor 579',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOLEM, ROUGHCAST_GNAWER],
      },
    },
    {
      id: 't-demon-f580',
      name: 'Floor 580 — The Blunted Rite',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f581',
      name: 'Floor 581',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, CHALKHIDE_BROWSER, SCARWEAVE_TRAMPLER],
      },
    },
    {
      id: 't-demon-f582',
      name: 'Floor 582',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f583',
      name: 'Floor 583',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, THORNBACK_GRAZER, DRIFTMOUTH_CHOKER],
      },
    },
    {
      id: 't-demon-f584',
      name: 'Floor 584',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOREHIDE_MATRIARCH, CHALKHIDE_BROWSER],
      },
    },
    {
      id: 't-demon-f585',
      name: 'Floor 585',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GOLEM, ROUGHCAST_GNAWER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Blunted Rite — Floors 586–595, levels 276–281, Relic 92–97 — three a board and the escorts all in `tank` or `support` sets. ⚠️ **That is the measurement rather than a flourish**: at Relic 100 a `ranger` set is worth +112% attack against a tank's +46%, and a hot-set common at these levels reads the binding arrangement at 3% where a cold-set one reads 100%.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f586',
      name: 'Floor 586',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f587',
      name: 'Floor 587',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, BREAKSTONE_WARDEN, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f588',
      name: 'Floor 588',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, CHALKHIDE_BROWSER, GILDED_SENTRY],
      },
    },
    {
      id: 't-demon-f589',
      name: 'Floor 589',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, ROUGHCAST_GNAWER, BREAKSTONE_WARDEN],
      },
    },
    {
      id: 't-demon-f590',
      name: 'Floor 590 — The Last Verse',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-demon-f591',
      name: 'Floor 591',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f592',
      name: 'Floor 592',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, BREAKSTONE_WARDEN, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f593',
      name: 'Floor 593',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, CHALKHIDE_BROWSER, GILDED_SENTRY],
      },
    },
    {
      id: 't-demon-f594',
      name: 'Floor 594',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, ROUGHCAST_GNAWER, BREAKSTONE_WARDEN],
      },
    },
    {
      id: 't-demon-f595',
      name: 'Floor 595',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SHALEBED_CRAWLER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Unmoved — Floors 596–600, levels 281–283, Relic 98–100 — five floors, each measured on its own, and at the top of them the last floor of the last tower — the edge that opened everything, finding nothing to open.
    // -------------------------------------------------------------------------------------
    {
      id: 't-demon-f596',
      name: 'Floor 596',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, SHALEBED_CRAWLER],
      },
    },
    {
      id: 't-demon-f597',
      name: 'Floor 597',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, BREAKSTONE_WARDEN, SCATTERSTONE_HOWLER],
      },
    },
    {
      id: 't-demon-f598',
      name: 'Floor 598',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, ROUGHCAST_GNAWER, GILDED_SENTRY],
      },
    },
    {
      id: 't-demon-f599',
      name: 'Floor 599',
      enemies: {
        front: [CAIRNCHOIR_SEXTON, GRAVELIGHT_BEADLE],
        back: [PSALMSTONE_LECTOR, GILDED_SENTRY, THORNBACK_GRAZER],
      },
    },
    {
      id: 't-demon-f600',
      name: 'Floor 600 — The Unmoved',
      enemies: {
        front: [THE_UNMOVED, PSALMSTONE_LECTOR],
        back: [GILDED_SENTRY, SHALEBED_CRAWLER, BREAKSTONE_WARDEN],
      },
    },
  ],
} as const;
