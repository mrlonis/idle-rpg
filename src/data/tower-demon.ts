import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  ASHPIT_SCUTTLER,
  BANDIT,
  BARROW_SOVEREIGN,
  BLOODGORGE_HOUND,
  BOAR,
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
  GRAVETIDE_HERALD,
  HEADSMAN,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOW_SERAPH,
  HUSHGLASS_WARDEN,
  KNELL_CHANTER,
  LITANY_BEARER,
  LUMEN_ACOLYTE,
  MARROWHUNT_ALPHA,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTMARCH_OUTRIDER,
  OATHSHIELD_VANGUARD,
  PLAINSONG_PRECENTOR,
  QUENCHPIT_IRONHIDE,
  RADIANT_HERALD,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  REVENANT,
  RIMEPLATE,
  RIVEN_MARCHWARDEN,
  SCARBOUND_BELLOWER,
  SCARWEAVE_TRAMPLER,
  SCREEBACK_DARTER,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SHARDLIGHT_ACOLYTE,
  SHATTERJAW_MAULER,
  SILENTVAULT_KEEPER,
  STILLNESS_CANTOR,
  STORMCALLER,
  SUMPWATER_BROOD,
  THE_UNBITTEN,
  THE_UNFALTERING,
  THE_UNHEARING,
  THE_UNISON,
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
 * The Demon Tower — four hundred floors, enemy levels 1 to 189.
 *
 * **The seventh tower to reach the fourth hundred and the last one to get there**, which closes the
 * bump for the third time and empties the `PENDING` lists in `towers.spec.ts` and
 * `towers.balance.ts` along with the branches they guarded.
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
    // The Hush — Floors 121–140, levels 58–66 — the board-wide turn starts carrying a rider, and the rider is the one the party can still play around.
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
    // The Sealed Verse — Floors 261–280, levels 124–132 — the whole board refuses, and the Trampler brings the only physical damage in the hundred.
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
    // The Vault Entire — Floors 361–380, levels 171–180, Fine 13–Fine 36 — three voices on every board, which is where the measured cliff was on the count.
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
  ],
} as const;
