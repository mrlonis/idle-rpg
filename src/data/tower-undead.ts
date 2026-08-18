import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  BANDIT,
  BOAR,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  BULWARK_ENEMY,
  CARRION_SWARM,
  CINDERLING,
  CINDERSEED_COURSER,
  CINDER_CULLER,
  COLOSSUS,
  CONCORD_CANTOR,
  COPPICE_LASHER,
  COVENANT_BREAKER,
  CROWNBARK_BASTION,
  DEEPMAST_HEARTWOOD,
  DUSKFERN_SKIRMISHER,
  EMBERSEED_WARLOCK,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLASSCHOIR_ARBITER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  HEADSMAN,
  HEARTROOT_TENDER,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  KILNSWORN_ADEPT,
  KNELL_CHANTER,
  LITANY_BEARER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTCANOPY_SINGER,
  PYRE,
  QUENCHPIT_IRONHIDE,
  RADIANT_HERALD,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  RIFTBORN_HARROWER,
  RIFTEDGE_CANTOR,
  RIMEPLATE,
  SCARBOUND_BELLOWER,
  SEEDLIGHT_KEEPER,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SHARDLIGHT_ACOLYTE,
  SKYSHRIKE,
  SLIME,
  STILLNESS_CANTOR,
  STORMCALLER,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  THE_LONGSHADOW,
  THE_SEEDFATHER,
  THE_SPRINGWOOD,
  THE_SUNBOUGH,
  THE_WITHERED_CROWN,
  THINWOOD_HARRIER,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNSEALED_WRETCH,
  VAULTLIGHT_CENSER,
  WARDEN,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
  WISP,
  WITHYBIND_RUNNER,
  WRATHBORN,
  WYRDROOT_ANCIENT,
} from './enemies';

/**
 * The Undead Tower — four hundred floors, enemy levels 1 to 189.
 *
 * ## Why the enemies are mostly Elven
 *
 * Elves beat the Undead in the matchup cycle, so this is the tower that punishes the crew it
 * admits. Just under two thirds of the slots are Elven and the rest are spread across six other
 * factions — [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this
 * paragraph.
 *
 * ⚠️ **The second hundred wanted to be far more Elven than that**, exactly as 21e's, 21f's and
 * 21g's did, and the correction was made while authoring rather than afterwards — four sessions for
 * four now. The substitutes are drawn only from **Angels, Demons and Monsters**, and that is a rule
 * rather than flavour: all three counter Undead in the matrix (Angels and Demons at ×1.1, above the
 * Elves' own ×1.05), so a swap keeps the counter-faction bias `towers.balance.ts` measures. Human,
 * Dwarf and Undead bodies would quietly turn the lean off.
 *
 * ⚠️ **This is the tower that could not be built before milestone 15c.** Elves had exactly one
 * archetype at the end of 15b, so its lead faction would have been a Sky-Shrike a hundred times —
 * which is the case the whole enemy-authoring half of that milestone exists to answer.
 *
 * ## What an Undead five is, and what this tower charges it for
 *
 * The Undead bargain is tempo bought with their own health, and their sustain is leech rather than
 * a healer — so what breaks them is not a wall but **anything that stops the trade paying**. The
 * first hundred says that with a heal: a Thornweald Warden's Wilding Bloom is health with nothing to
 * reach and nothing to kill, which a faction built to out-trade cannot answer by out-trading.
 *
 * A floor authors its line-up and nothing else — see [`tower-human.ts`](./tower-human.ts).
 *
 * ## ⚠️ The second hundred escalates through evasion, because it is the one lock this crew may not
 * buy an answer to
 *
 * A fourth tower and a fourth escalation, measured on these crews before anything was authored.
 * Controlled at one anchor, two legendaries and two commons at the roof's level, only the mechanic
 * varying: `dodge` reads **95% / 65%** against bars of 90% and 75% — the only shape that fails one —
 * where burst reads 100%/95%, a healer 98%/90%, and slow, link and reach all 100%/100%.
 *
 * **No Undead character carries a point of `accuracy`.** The stat lives on four Elves and one Human,
 * and there is none in `gear.ts` or `signature.ts`, so a tower faction-locked to Undead is the one
 * place in the game where an evasion pool has no answer a player can buy. And every Undead body
 * sustains on `drain` and `lifeLeech`, so a miss costs the hit **and** the health the hit would have
 * returned — the faction's engine attacked at the source rather than a tax on its damage.
 *
 * ⚠️ **What keeps that fair is where the pools go.** They sit on soft bodies — {@link
 * SUNMOTE_DANCER} is 500 hp at `dodge: 0.3` — so reach and focus fire are the answer, and the
 * heaviest thing on the tower carries **less** evasion than the legendaries around it, not more.
 * Unlike `tenacity`, which can refuse a debuff outright, `dodge` is a chance floored by
 * `MIN_HIT_CHANCE`: it costs turns and never closes a door.
 *
 * ## ⚠️ Sustain is the ninety-second clock here, exactly as it is on the Dwarf Tower
 *
 * 21f's rule binds on its second tower. An Undead five takes the shipped floor 100 in **34.4
 * seconds** with two of five alive — the slowest crew reading in any tower, against an Elf five's
 * 10.8 — and the healer board above runs 30.8s mean and 50s max. So this tower's *own* first-hundred
 * thesis is the thing that would time it out: the Green Vigil is where it is spent, and **no board
 * above floor 160 carries a heal, a drain or a regeneration**.
 *
 * ⚠️ **That claim used to read "nothing above floor 160 restores anything", and it was wrong about
 * the boards underneath it.** Every anchor above floor 179 carries passive `recovery` — the
 * Longshadow 6, the Sunbough 6, the Withered Crown 7, the Wyrdroot Ancient 9 with `healthRegen` 0.2
 * — and the Covenant Breaker and Bramblehide Ravener carry `lifeLeech` from floor 165. **The honest
 * fix was the claim rather than the boards**, exactly as the Crownworks found on the Dwarf Tower:
 * restating what the tower actually forbids keeps every measured figure on those twenty floors
 * valid, where retuning them would not. A few points of self-recovery on a body the party is
 * already killing is not the mechanic the rule exists to stop; a cast heal on a board the party
 * cannot aim past is.
 *
 * ## ⚠️ Which crew binds flips by mechanic, which is new
 *
 * 21e measured the Human pair twelve levels apart and 21g the Elf pair nine, both with the alternate
 * five as the whole constraint. Here neither five is. In band 1 the alternate is far the stronger —
 * floor 100 costs it 1.6 of five against the reference crew's 3.0 — and on a dodge board at the
 * roof's level it is far the weaker, 65% against 95%, because Nekros's kit is three single-target
 * drains. **Check both arrangements per board**; the answer does not keep.
 *
 * ## ⚠️ Composition buys much more at the bottom of a band 2 than 21g found
 *
 * At floor 101's level the lightest authorable board resolves in 2.7 seconds and five `ascended`
 * blocks in **8.4** — a threefold span, where the Elf pair's whole authorable range was 2.6s to
 * 2.9s. "Do not try to make the bottom of a band 2 hard" was a fact about the *Elf crew's damage*,
 * not about the band split. It still opens gently here, for rhythm rather than because it must.
 *
 * ## ⚠️ The third hundred escalates through how long the board takes to kill
 *
 * A seventh tower and a seventh escalation, measured on these crews before anything was authored.
 * Controlled at one anchor plus four identical bodies at the roof's level, forty seeds, against a
 * **3.83 / 4.00** control:
 *
 * | Four bodies at   | reference | alternate |
 * | ---------------- | --------- | --------- |
 * | hp 700 (control) | 3.85      | 4.00      |
 * | hp 1000          | 3.00      | 4.00      |
 * | hp 1300          | 2.63      | 3.10      |
 * | hp 1600          | **2.00**  | 2.38      |
 * | hp 2000          | 2.00      | 1.07      |
 * | hp 2400          | 1.30      | **0.05**  |
 *
 * **Zero timeouts anywhere on that grade**, which is what makes it difficulty rather than the clock:
 * the alternate's collapse at 2400 is a wipe, not a fight that ran out. And it is **this crew's**
 * rather than merely unanswerable — at hp 1600 the Elf five takes the same board at 4.00 in twelve
 * seconds and the Dwarf five at 4.00 in **thirty-four**, in the fight just as long and losing nobody.
 * An Undead five sustains on `lifeLeech` off damage dealt (0.36–0.40 summed across five, the highest
 * in the game) and `recovery` on its own turn, so what it takes scales with the length of a fight
 * while what it gets back does not. **A board that will not die is a board that starves it.**
 *
 * ⚠️ **`def` and `hp` are one dial**: `def` 70 on a 700-hp body reads 3.00 at 21.6s and hp 1050 at
 * `def` 20 reads 3.00 at 22.5s. The Dwarf Tower's "def is not a lever at these levels" survives —
 * the lever is the pool, whichever stat spells it.
 *
 * ⚠️ **Almost every *mechanic* measured inert, and that is most of the finding.** Aim and scope read
 * at or **above** the control (`enemy-lowest`, `enemy-back`, `enemy-highest` and `enemy-all` all
 * 4.00 / 4.00); a status one at a time is worth 0.10 to 0.63 of the reference five and **exactly
 * nothing** of the alternate ({@link SAVAGED}, the permanent wound this crew has no cleanse for, is
 * worth 0.10); stun does not even grade (0.35 reads 3.27 and 0.60 reads 3.30); and question *count*
 * is flat, 3.88 → 3.42 → 3.45 → 3.10 → 3.00 across zero to four. A link, thorns, a tenacity wall and
 * a magic wall are all inside a third of a survivor.
 *
 * ⚠️ **The second dial is tempo, and with weight it is a product rather than a sum.** Four bodies at
 * `haste` 126 read 2.98 / 3.77 and four at hp 1200 read 2.88 / 3.77, but four at **both** read
 * 2.00 / **1.75** — the one measurement in which the alternate is the weaker five. So the Quickening
 * fields one fast body a board and the Seedcrown one, never two: two behind an anchor at the roof's
 * level reads **0%**. ⚠️ **The claim is about that block and not about speed in general** — the
 * hundred fields 32 Sunmote Dancers and 18 Bramblewalk Scouts above floor 200 and two of those on
 * one board is ordinary texture. What is rationed is a fast body carrying real `atk`, and the
 * Courser is the only one: fifteen appearances, never two to a board.
 *
 * ⚠️ **Two axes this hundred deliberately did not take.** Both arrangements carry zero `critBlock`
 * and zero `critDamageResist` — but the Elf Tower's third hundred is built on crit, and two towers
 * with one lock is one tower shipped twice. Both carry zero `tenacity`, and so do four of the other
 * six crews, which is the same test that shelved `dodge` on the Monster Tower.
 *
 * ## ⚠️ The previous hundred's climax is unwinnable at this one's roof
 *
 * The shipped floor-200 board, fielded up its own level line against the band-3 crew, reads 100% with
 * all five alive at level 95, 100% / 5.00 at 120, and **53% with 0.88** at 142 — the Crownworks
 * collapse a third time. So {@link THE_SEEDFATHER} is **lighter** than both anchors it succeeds
 * (1320 against the Sunbough's 1520 and the Withered Crown's 1740), and the two of them leave the
 * closing floors: on a light board at level 142 the Withered Crown reads **30% / 13%** and the
 * Sunbough **13% / 10%**, both harder than the roof itself. The Withered Crown's last floor is 265,
 * the Sunbough's is 284 and the Longshadow's is 281 — nothing but the Seedfather anchors the last
 * fifteen.
 *
 * ## ⚠️ The fourth hundred escalates through `atk` and `haste` as a product, on weight that falls
 *
 * The Coppice, floors 301–400, and the gear ramp arrives **free** — `TOWER_RULES.gear` is one rule
 * for all seven towers, Worn 1 to Fine 60 with the grades stepping at 301, 318 and 351 — so where
 * the Human fourth hundred spent that ramp *as* its axis, this one had to find an axis on top of it.
 * The full measurement, the negative list, the cross-crew table and the register check live beside
 * {@link COPPICE_LASHER} in [`enemies.ts`](./enemies.ts); what belongs here is what it means for
 * this tower.
 *
 * ⚠️ **It is the exact inversion of the hundred below.** The Seedfall escalates through boards that
 * will not die, on the argument that a crew sustaining on `lifeLeech` off damage dealt is starved by
 * a board with no pool left to take it from. The Coppice escalates through boards that **do not need
 * to live**: every point of budget goes into `atk` and `haste`, the authored weight comes down across
 * the hundred, and the fight ends before attrition can pay. Against calibrated controls at level 189
 * in Fine 60, four carriers walked from 36/96 to 56/136 grade **3.77 → 0.93** for the reference five
 * and **3.92 → 0.00** for the alternate, with zero timeouts on every row.
 *
 * ⚠️ **Two controls rather than one, and that is the calibration step.** A single board serving both
 * arrangements left the alternate flat at 4.00 on 30 rows of 33 — the saturated control the Long Amen
 * and the Plating Floor each had to correct for. The reference five is read on an anchor at 900/54
 * behind four at 460/36 and the alternate on 1100/64 behind four at 520/40, each the heaviest board
 * its own crew still reads ≥3.75 on.
 *
 * ⚠️ **It was chosen on fight length, which is the rule this tower needs more than any other.** Its
 * own shipped floor 100 is the longest fight in the project's towers at **51.2 seconds against a
 * 67.5-second bar**, and every rival axis measured here walks toward that bar — enemy `hp` 1000 costs
 * 1.25 / 1.00 at 32.1s / 30.6s, `def` 110 costs 0.97 / 1.94 at 28.8s / 33.5s, a board-wide `WEAKEN`
 * adds six seconds. **The longest fight in the whole of The Coppice is 24.3 seconds**, and the
 * sharpest rows on the axis ladder are *faster* than the control.
 *
 * ⚠️ **The Quickening's ration is lifted, deliberately.** That band fields one fast body carrying real
 * `atk` per board and never two, because two behind an anchor at *its* roof's level read **0%**. At
 * band 4 — one rung and a third skill later — two carriers read 3.00 / 2.73 and the closing bands
 * field three. The hundred below is not wrong; the crew that meets it is a different crew.
 *
 * ⚠️ **Both of this tower's earlier axes have stopped being its own, which is worth not re-deriving.**
 * Re-measured at band 4's rung and kit against every crew's own calibrated control, the third
 * hundred's enemy `hp` costs dwarf-ref **−2.78** against these crews' −1.25 / −1.00, and the second
 * hundred's `dodge` costs dwarf-ref −1.05 against undead-ref's −0.85. **Re-run "is it ours" on the
 * band being authored, not on the band that recorded it.**
 *
 * ## ⚠️ The Seedcrown is unwinnable at this hundred's roof, and one retirement nearly shipped inverted
 *
 * The shipped floor-300 board, fielded up its own level line against the band-4 crew, reads 100% with
 * all five alive at its own level 142, 4.35 / 5.00 at 161, 2.23 / 3.77 at 175 and **0% / 0% at 189 in
 * Fine 60** — the collapse every fourth hundred has found. So {@link THE_SPRINGWOOD} is **lighter
 * than {@link THE_SEEDFATHER} it succeeds** on health, at 1160 against 1320.
 *
 * Behind four light escorts at 189 in Fine 60, the Seedfather still stands at 1.93 / 2.38 and {@link
 * WYRDROOT_ANCIENT} at 4.00 / 4.00, while {@link THE_SUNBOUGH} reads **0% / 13%** and {@link
 * THE_WITHERED_CROWN} **3% / 18% at 41 seconds**. Both were already retired at floors 284 and 265 and
 * both stay retired. ⚠️ **The Withered Crown first measured 3.10 / 3.63 — comfortably safe — because
 * it carried no `gearArchetype` and was therefore fighting *naked* on a board priced as though it
 * were kitted.** The missing-archetype trap is documented as a silent difficulty error; this is the
 * first time it has been caught **inverting the sign of an anchor-retirement check**. Nine of this
 * tower's blocks needed the one-line edit and none of the nine stands on a geared campaign stage, so
 * the bill was free — but that was checked rather than assumed.
 *
 * ⚠️ **The hundred fields no sustain at all, and {@link WYRDROOT_ANCIENT} is what that cost.** It
 * passes the retirement check outright and is still not fielded, because it carries `recovery` and
 * `healthRegen`. **Stated in counts, because the absolute form of this claim has shipped wrong four
 * times across the towers**: of the 30 blocks the hundred fields, **zero** carry `recovery`,
 * `lifeLeech` or `healthRegen`, **zero** carry a heal, a drain or a shield effect, and **zero** carry
 * a `regen` status. {@link SEEDLIGHT_KEEPER}, whose board-wide ward the Seedfall measured as a clock
 * at the top, is absent too.
 *
 * ⚠️ **What the hundred does carry is three self-taunts and one link, and both are deliberate and
 * bounded.** {@link SCARBOUND_BELLOWER}, {@link QUENCHPIT_IRONHIDE} and {@link CROWNBARK_BASTION}
 * carry `OATHSHIELD` on `self` and stand **only on floors 308–345** — a taunt prices at
 * *−0.65 to −0.28* at depth because concentrating the party's damage is what the party wants, so it
 * is opening texture rather than a lock, and nothing above floor 345 carries one. {@link
 * GLOAMVINE_CREEPER} opens with a link and stands to floor 385, for the same reason and with the same
 * sign. **No board in the hundred pairs two `ascended` blocks**, and only floor 400 fields one at all.
 *
 * ⚠️ **The anchors leave on a schedule and the boards are empty of them before the roof.** {@link
 * THE_SEEDFATHER}'s last floor is 360 and {@link DEEPMAST_HEARTWOOD}'s is 369; from 370 the heaviest
 * body on any board is a 940-health Grazer, and from 386 nothing on a board is heavier than 720. That
 * is the axis rather than the band relenting — the level line and the grade climb into the space the
 * weight vacates.
 *
 * ## What the bands measure at
 *
 * Band 4 opens at floor 301 in 6.8 seconds with all five alive and **costs neither arrangement a
 * member until floor 330**. From there: 4.15 / 4.88 at 330, 3.00 / 3.92 at 350, 2.63 / 3.52 at 360,
 * 2.95 / 3.85 at 380, 1.98 / 2.70 at 390 and **1.38 / 2.48 at the roof**, both at 98% against bars of
 * 90% and 75%. Every one of the hundred floors clears both bars, there are **no timeouts anywhere**,
 * and the longest fight is **24.3 seconds**.
 *
 * ⚠️ **Floor 399 is why the stride is not the check.** `towers.balance.ts` samples every fourth floor
 * plus the mini-bosses, and the first draft's floor 399 — three full carriers standing at the roof's
 * own level 189 in Fine 60 — read **60%** while the floors either side of it read 100% and 98%. It is
 * invisible to the stride and caught only by the every-floor assertion. **Sweep every floor of the
 * closing band before believing a band that samples cleanly.**
 *
 * Band 3 opens at floor 201 in 6.1 seconds with all five alive and **costs neither arrangement a
 * member until floor 255**. From there: 22.0s / 4.00 at 260, 23.8s / 2.27 at 280, 24.1s / 3.05 at
 * 290 and **29.3s at the roof** — 100% with 1.88 alive for the reference five and 93% with 1.82 for
 * the alternate, against bars of 90% and 75%. The longest fight in the hundred is **41.4 seconds**
 * against a 67.5-second bound on a cleared fight, so the tower's binding case is still the shipped
 * floor 100 at 51.2s.
 *
 * Band 1 is untouched: floor 1 in 1.3 seconds, floor 50 in 9.1, floor 100 in **34.4** with two of
 * five alive. Band 2 reads 2.5s at floor 101, 6.2 at 124, 8.5 at 152, 17.2 at 180, 22.4 at 196 and
 * **26.7 at the roof** — 93% with 1.88 alive for the reference five and 93% with 2.30 for the
 * alternate, against bars of 90% and 75%. Neither arrangement loses a member below floor 160.
 *
 * ⚠️ **The tower's longest fight is in none of the hundreds above its first — it is the shipped
 * floor 100, at 51.2 seconds.** The second hundred's longest is 39.6, the third's 41.4 and the
 * fourth's **24.3**. Against the balance sweep's bound on a *cleared* fight (0.75 × the ninety-second
 * timer, so 67.5s) that shipped board is the binding case for this tower, and it is the reason the
 * Green Vigil's heal is the last one on the climb rather than the shape any roof is built from.
 *
 * ⚠️ **A superlative about four hundreds goes stale the moment a fifth lands, so the list is stated
 * rather than the claim** — and the direction is the finding: each hundred has closed *faster* than
 * the one below it, because each has had to buy its difficulty further from the clock.
 */
export const TOWER_UNDEAD = {
  id: 'tower-undead',
  name: 'Undead Tower',
  faction: 'undead',
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
    // The Green Gate — Floors 1–12, levels 1–6 — thorns and fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f1',
      name: 'Floor 1',
      enemies: { front: [BOAR], back: [BANDIT] },
    },
    {
      id: 't-undead-f2',
      name: 'Floor 2',
      enemies: { front: [BOAR], back: [THORNLING, BANDIT] },
    },
    {
      id: 't-undead-f3',
      name: 'Floor 3',
      enemies: { front: [THORNLING], back: [LUMEN_ACOLYTE, BANDIT] },
    },
    {
      id: 't-undead-f4',
      name: 'Floor 4',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [LUMEN_ACOLYTE, SLIME] },
    },
    {
      id: 't-undead-f5',
      name: 'Floor 5',
      enemies: { front: [GLADE_STALKER], back: [SLIME, THORNLING] },
    },
    {
      id: 't-undead-f6',
      name: 'Floor 6',
      enemies: { front: [GLADE_STALKER, BOAR], back: [BANDIT, THORNLING] },
    },
    {
      id: 't-undead-f7',
      name: 'Floor 7',
      enemies: { front: [GLADE_STALKER], back: [THORNLING, BANDIT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f8',
      name: 'Floor 8',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [BANDIT, SLIME] },
    },
    {
      id: 't-undead-f9',
      name: 'Floor 9',
      enemies: { front: [GLADE_STALKER], back: [LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f10',
      name: 'Floor 10 — The Green Gate',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [BOAR, SLIME, BANDIT] },
    },
    {
      id: 't-undead-f11',
      name: 'Floor 11',
      enemies: { front: [THORNLING], back: [BANDIT, LUMEN_ACOLYTE] },
    },
    {
      id: 't-undead-f12',
      name: 'Floor 12',
      enemies: { front: [BOAR, THORNLING], back: [SLIME, GLADE_STALKER] },
    },

    // -------------------------------------------------------------------------------------
    // The Singing Wood — Floors 13–28, levels 7–14 — the locks arrive: a party-wide slow, a healer with nothing to kill, a back rank that is not safe.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f13',
      name: 'Floor 13',
      enemies: {
        front: [THORNWEALD_WARDEN, BULWARK_ENEMY],
        back: [GLADE_STALKER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f14',
      name: 'Floor 14',
      enemies: {
        front: [THORNWEALD_WARDEN, GLADE_STALKER],
        back: [SKYSHRIKE, MOONSONG_WEAVER, PYRE],
      },
    },
    {
      id: 't-undead-f15',
      name: 'Floor 15',
      enemies: {
        front: [THORNWEALD_WARDEN, THORNLING],
        back: [GLADE_STALKER, LUMEN_ACOLYTE, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f16',
      name: 'Floor 16',
      enemies: { front: [THORNWEALD_WARDEN, GLADE_STALKER], back: [MOONSONG_WEAVER, WISP] },
    },
    {
      id: 't-undead-f17',
      name: 'Floor 17',
      enemies: { front: [GOLEM, GLADE_STALKER], back: [LUMEN_ACOLYTE, SKYSHRIKE, WISP] },
    },
    {
      id: 't-undead-f18',
      name: 'Floor 18',
      enemies: { front: [THORNLING, BULWARK_ENEMY], back: [ACOLYTE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f19',
      name: 'Floor 19',
      enemies: {
        front: [GLADE_STALKER, THORNWEALD_WARDEN],
        back: [LUMEN_ACOLYTE, MOONSONG_WEAVER, WISP],
      },
    },
    {
      id: 't-undead-f20',
      name: 'Floor 20 — The Singing Wood',
      enemies: {
        front: [THORNWEALD_WARDEN, GOLEM],
        back: [MOONSONG_WEAVER, SKYSHRIKE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f21',
      name: 'Floor 21',
      enemies: { front: [GOLEM, BULWARK_ENEMY], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f22',
      name: 'Floor 22',
      enemies: {
        front: [THORNWEALD_WARDEN, GOLEM],
        back: [SKYSHRIKE, MOONSONG_WEAVER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f23',
      name: 'Floor 23',
      enemies: { front: [BULWARK_ENEMY, THORNLING], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f24',
      name: 'Floor 24',
      enemies: { front: [GOLEM, GLADE_STALKER], back: [SKYSHRIKE, ACOLYTE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f25',
      name: 'Floor 25',
      enemies: {
        front: [THORNWEALD_WARDEN, BULWARK_ENEMY],
        back: [GLADE_STALKER, PYRE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f26',
      name: 'Floor 26',
      enemies: { front: [THORNLING, GLADE_STALKER], back: [MOONSONG_WEAVER, ACOLYTE] },
    },
    {
      id: 't-undead-f27',
      name: 'Floor 27',
      enemies: { front: [GLADE_STALKER, THORNLING], back: [PYRE, SKYSHRIKE, WISP] },
    },
    {
      id: 't-undead-f28',
      name: 'Floor 28',
      enemies: { front: [GOLEM, THORNLING], back: [ACOLYTE, MOONSONG_WEAVER] },
    },

    // -------------------------------------------------------------------------------------
    // The Thornfall — Floors 29–48, levels 14–23 — a wall that regrows, and every lock met in combination.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f29',
      name: 'Floor 29',
      enemies: { front: [RIMEPLATE, THORNLING], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f30',
      name: 'Floor 30 — The Thornfall',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-undead-f31',
      name: 'Floor 31',
      enemies: { front: [RAVAGER, BULWARK_ENEMY], back: [MOONSONG_WEAVER, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f32',
      name: 'Floor 32',
      enemies: {
        front: [RIMEPLATE, BULWARK_ENEMY],
        back: [GLADE_STALKER, SHADE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f33',
      name: 'Floor 33',
      enemies: { front: [THORNWEALD_WARDEN, BULWARK_ENEMY], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f34',
      name: 'Floor 34',
      enemies: {
        front: [RIMEPLATE, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f35',
      name: 'Floor 35',
      enemies: {
        front: [GILDED_SENTRY, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, GLADE_STALKER, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-undead-f36',
      name: 'Floor 36',
      enemies: { front: [THORNWEALD_WARDEN, THORNLING], back: [SHADE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-undead-f37',
      name: 'Floor 37',
      enemies: {
        front: [RAVAGER, THORNWEALD_WARDEN],
        back: [HEXBOUND_TORMENTOR, GLADE_STALKER, SHADE],
      },
    },
    {
      id: 't-undead-f38',
      name: 'Floor 38',
      enemies: { front: [THORNLING, BULWARK_ENEMY], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f39',
      name: 'Floor 39',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f40',
      name: 'Floor 40 — The Thornfall',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f41',
      name: 'Floor 41',
      enemies: { front: [BULWARK_ENEMY, THORNLING], back: [SKYSHRIKE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f42',
      name: 'Floor 42',
      enemies: {
        front: [BULWARK_ENEMY, GILDED_SENTRY],
        back: [SKYSHRIKE, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f43',
      name: 'Floor 43',
      enemies: { front: [THORNWEALD_WARDEN, RIMEPLATE], back: [SKYSHRIKE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f44',
      name: 'Floor 44',
      enemies: {
        front: [RAVAGER, THORNLING],
        back: [GLADE_STALKER, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f45',
      name: 'Floor 45',
      enemies: { front: [RAVAGER, RIMEPLATE], back: [MOONSONG_WEAVER, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [SKYSHRIKE, GLADE_STALKER] },
    },
    {
      id: 't-undead-f47',
      name: 'Floor 47',
      enemies: {
        front: [BULWARK_ENEMY, GILDED_SENTRY],
        back: [MOONSONG_WEAVER, SHADE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f48',
      name: 'Floor 48',
      enemies: { front: [GILDED_SENTRY, RIMEPLATE], back: [SKYSHRIKE, HEXBOUND_TORMENTOR] },
    },

    // -------------------------------------------------------------------------------------
    // The Deep Bough — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f49',
      name: 'Floor 49',
      enemies: {
        front: [THORNWEALD_WARDEN, RIMEPLATE],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f50',
      name: 'Floor 50 — The Deep Bough',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f51',
      name: 'Floor 51',
      enemies: {
        front: [SENTINEL, ASHEN_CHOIR],
        back: [THORNWEALD_WARDEN, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f52',
      name: 'Floor 52',
      enemies: {
        front: [RIMEPLATE, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f53',
      name: 'Floor 53',
      enemies: { front: [THORNWEALD_WARDEN, ASHEN_CHOIR], back: [HIEROPHANT, SKYSHRIKE, HEADSMAN] },
    },
    {
      id: 't-undead-f54',
      name: 'Floor 54',
      enemies: { front: [THORNWEALD_WARDEN, SENTINEL], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f55',
      name: 'Floor 55',
      enemies: {
        front: [WRATHBORN, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f56',
      name: 'Floor 56',
      enemies: {
        front: [SENTINEL, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f57',
      name: 'Floor 57',
      enemies: { front: [ASHEN_CHOIR, THORNWEALD_WARDEN], back: [SKYSHRIKE, HIEROPHANT, HEADSMAN] },
    },
    {
      id: 't-undead-f58',
      name: 'Floor 58',
      enemies: { front: [WRATHBORN, ASHEN_CHOIR], back: [MOONSONG_WEAVER, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f59',
      name: 'Floor 59',
      enemies: {
        front: [RIMEPLATE, SENTINEL],
        back: [MOONSONG_WEAVER, HIEROPHANT, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f60',
      name: 'Floor 60 — The Deep Bough',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f61',
      name: 'Floor 61',
      enemies: {
        front: [THORNWEALD_WARDEN, ASHEN_CHOIR],
        back: [SERAPH_ADJUDICANT, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f62',
      name: 'Floor 62',
      enemies: { front: [GLADE_STALKER, THORNWEALD_WARDEN], back: [MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f63',
      name: 'Floor 63',
      enemies: {
        front: [SENTINEL, RIMEPLATE],
        back: [MOONSONG_WEAVER, STORMCALLER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f64',
      name: 'Floor 64',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER, HEADSMAN],
      },
    },
    {
      id: 't-undead-f65',
      name: 'Floor 65',
      enemies: {
        front: [GLADE_STALKER, THORNWEALD_WARDEN],
        back: [HIEROPHANT, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f66',
      name: 'Floor 66',
      enemies: { front: [THORNWEALD_WARDEN, ASHEN_CHOIR], back: [STORMCALLER, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f67',
      name: 'Floor 67',
      enemies: {
        front: [THORNWEALD_WARDEN, ASHEN_CHOIR],
        back: [SHADE, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f68',
      name: 'Floor 68',
      enemies: {
        front: [THORNWEALD_WARDEN, SENTINEL],
        back: [MOONSONG_WEAVER, SKYSHRIKE, STORMCALLER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Heartwood Vigil — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f69',
      name: 'Floor 69',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [SKYSHRIKE, SHADE, STORMCALLER],
      },
    },
    {
      id: 't-undead-f70',
      name: 'Floor 70 — The Heartwood Vigil',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f71',
      name: 'Floor 71',
      enemies: {
        front: [SENTINEL, WYRDROOT_ANCIENT],
        back: [SERAPH_ADJUDICANT, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f72',
      name: 'Floor 72',
      enemies: { front: [SENTINEL, THORNWEALD_WARDEN], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f73',
      name: 'Floor 73',
      enemies: {
        front: [ASHEN_CHOIR, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f74',
      name: 'Floor 74',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [STORMCALLER, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f75',
      name: 'Floor 75',
      enemies: {
        front: [ASHEN_CHOIR, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, HIEROPHANT, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f76',
      name: 'Floor 76',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f77',
      name: 'Floor 77',
      enemies: { front: [COLOSSUS, WYRDROOT_ANCIENT], back: [SHADE, MOONSONG_WEAVER, SKYSHRIKE] },
    },
    {
      id: 't-undead-f78',
      name: 'Floor 78',
      enemies: { front: [ASHEN_CHOIR, WARDEN], back: [SKYSHRIKE, SERAPH_ADJUDICANT] },
    },
    {
      id: 't-undead-f79',
      name: 'Floor 79',
      enemies: { front: [WYRDROOT_ANCIENT, COLOSSUS], back: [MOONSONG_WEAVER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-undead-f80',
      name: 'Floor 80 — The Heartwood Vigil',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f81',
      name: 'Floor 81',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [STORMCALLER, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f82',
      name: 'Floor 82',
      enemies: { front: [WYRDROOT_ANCIENT, SENTINEL], back: [SKYSHRIKE, THORNWEALD_WARDEN] },
    },
    {
      id: 't-undead-f83',
      name: 'Floor 83',
      enemies: { front: [COLOSSUS, WYRDROOT_ANCIENT], back: [SKYSHRIKE, SHADE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f84',
      name: 'Floor 84',
      enemies: { front: [ASHEN_CHOIR, WARDEN], back: [THORNWEALD_WARDEN, SHADE, MOONSONG_WEAVER] },
    },

    // -------------------------------------------------------------------------------------
    // The Canopy — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Wyrdroot waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f85',
      name: 'Floor 85',
      enemies: {
        front: [THORNWEALD_WARDEN, WYRDROOT_ANCIENT],
        back: [HEADSMAN, SKYSHRIKE, MOONSONG_WEAVER],
      },
    },
    {
      id: 't-undead-f86',
      name: 'Floor 86',
      enemies: {
        front: [WARDEN, THORNWEALD_WARDEN],
        back: [HEADSMAN, SERAPH_ADJUDICANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f87',
      name: 'Floor 87',
      enemies: {
        front: [COLOSSUS, WYRDROOT_ANCIENT],
        back: [THORNWEALD_WARDEN, HEADSMAN, STORMCALLER],
      },
    },
    {
      id: 't-undead-f88',
      name: 'Floor 88',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f89',
      name: 'Floor 89',
      enemies: {
        front: [WARDEN, WYRDROOT_ANCIENT],
        back: [HIEROPHANT, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f90',
      name: 'Floor 90 — The Canopy',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, SKYSHRIKE, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f91',
      name: 'Floor 91',
      enemies: {
        front: [WARDEN, COLOSSUS],
        back: [HIEROPHANT, MOONSONG_WEAVER, THORNWEALD_WARDEN],
      },
    },
    {
      id: 't-undead-f92',
      name: 'Floor 92',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f93',
      name: 'Floor 93',
      enemies: {
        front: [COLOSSUS, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f94',
      name: 'Floor 94',
      enemies: {
        front: [THORNWEALD_WARDEN, WYRDROOT_ANCIENT],
        back: [MOONSONG_WEAVER, HIEROPHANT, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f95',
      name: 'Floor 95',
      enemies: {
        front: [WYRDROOT_ANCIENT, THORNWEALD_WARDEN],
        back: [SERAPH_ADJUDICANT, SKYSHRIKE, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f96',
      name: 'Floor 96',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [SKYSHRIKE, MOONSONG_WEAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f97',
      name: 'Floor 97',
      enemies: {
        front: [COLOSSUS, THORNWEALD_WARDEN],
        back: [MOONSONG_WEAVER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-undead-f98',
      name: 'Floor 98',
      enemies: { front: [WARDEN, COLOSSUS], back: [SKYSHRIKE, THORNWEALD_WARDEN, STORMCALLER] },
    },
    {
      id: 't-undead-f99',
      name: 'Floor 99',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [HIEROPHANT, THORNWEALD_WARDEN, SKYSHRIKE],
      },
    },
    {
      id: 't-undead-f100',
      name: 'Floor 100 — The Wyrdroot',
      enemies: {
        front: [WYRDROOT_ANCIENT, COLOSSUS],
        back: [THORNWEALD_WARDEN, MOONSONG_WEAVER, SKYSHRIKE],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Open Crown — Floors 101–120, levels 48–57 — past the Wyrdroot the wood breaks into light and open air, and the first bodies that will not stand still to be hit.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f101',
      name: 'Floor 101',
      enemies: { front: [HOLLOWBARK_SENTRY, SUNMOTE_DANCER], back: [WHISPERLEAF_ARCHER, SLIME] },
    },
    {
      id: 't-undead-f102',
      name: 'Floor 102',
      enemies: { front: [SUNMOTE_DANCER, GILDED_SENTRY], back: [LUMEN_ACOLYTE, MOONSONG_WEAVER] },
    },
    {
      id: 't-undead-f103',
      name: 'Floor 103',
      enemies: {
        front: [HOLLOWBARK_SENTRY, BRAMBLEWALK_SCOUT],
        back: [SUNMOTE_DANCER, VAULTLIGHT_CENSER, CINDERLING],
      },
    },
    {
      id: 't-undead-f104',
      name: 'Floor 104',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [DUSKFERN_SKIRMISHER, SERAPH_ADJUDICANT, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f105',
      name: 'Floor 105',
      enemies: {
        front: [GILDED_SENTRY, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, CARRION_SWARM],
      },
    },
    {
      id: 't-undead-f106',
      name: 'Floor 106',
      enemies: {
        front: [SUNMOTE_DANCER, THORNLING],
        back: [WHISPERLEAF_ARCHER, UNSEALED_WRETCH, MIREWHELP],
      },
    },
    {
      id: 't-undead-f107',
      name: 'Floor 107',
      enemies: {
        front: [GLOAMVINE_CREEPER, BRAMBLEWALK_SCOUT],
        back: [SUNMOTE_DANCER, LUMEN_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-undead-f108',
      name: 'Floor 108',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, VAULTLIGHT_CENSER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-undead-f109',
      name: 'Floor 109',
      enemies: {
        front: [SUNMOTE_DANCER, GILDED_SENTRY],
        back: [SKYSHRIKE, RENDFANG_JACKAL, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-undead-f110',
      name: 'Floor 110 — The Open Crown',
      enemies: {
        front: [THORNWEALD_WARDEN, HOLLOWBARK_SENTRY],
        back: [SUNMOTE_DANCER, SERAPH_ADJUDICANT, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f111',
      name: 'Floor 111',
      enemies: { front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER], back: [VAULTLIGHT_CENSER, PYRE] },
    },
    {
      id: 't-undead-f112',
      name: 'Floor 112',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, SERAPH_ADJUDICANT, BOAR],
      },
    },
    {
      id: 't-undead-f113',
      name: 'Floor 113',
      enemies: {
        front: [SUNMOTE_DANCER, BRAMBLEWALK_SCOUT],
        back: [SKYSHRIKE, LUMEN_ACOLYTE, MIREWHELP],
      },
    },
    {
      id: 't-undead-f114',
      name: 'Floor 114',
      enemies: {
        front: [THORNBACK_GRAZER, GILDED_SENTRY],
        back: [SUNMOTE_DANCER, MOONSONG_WEAVER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f115',
      name: 'Floor 115',
      enemies: {
        front: [DUSKFERN_SKIRMISHER, SUNMOTE_DANCER],
        back: [WHISPERLEAF_ARCHER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-undead-f116',
      name: 'Floor 116',
      enemies: {
        front: [HOLLOWBARK_SENTRY, GLOAMVINE_CREEPER],
        back: [SUNMOTE_DANCER, PYRE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f117',
      name: 'Floor 117',
      enemies: {
        front: [SUNMOTE_DANCER, DUSKFERN_SKIRMISHER],
        back: [MOONSONG_WEAVER, CARRION_SWARM, BOAR],
      },
    },
    {
      id: 't-undead-f118',
      name: 'Floor 118',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [NIGHTCANOPY_SINGER, UNSEALED_WRETCH, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f119',
      name: 'Floor 119',
      enemies: {
        front: [GILDED_SENTRY, BRAMBLEWALK_SCOUT],
        back: [LONGBOUGH_MARKSMAN, SUNMOTE_DANCER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f120',
      name: 'Floor 120 — The Open Crown',
      enemies: {
        front: [WYRDROOT_ANCIENT, HOLLOWBARK_SENTRY],
        back: [SUNMOTE_DANCER, SERAPH_ADJUDICANT, VAULTLIGHT_CENSER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sunward Reach — Floors 121–140, levels 58–66 — evasion is the board rather than a body on it, and the Chanters take the weight out of whatever still lands.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f121',
      name: 'Floor 121',
      enemies: {
        front: [DUSKFERN_SKIRMISHER, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, PYRE, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f122',
      name: 'Floor 122',
      enemies: {
        front: [HOLLOWBARK_SENTRY, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, HEXBOUND_TORMENTOR, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f123',
      name: 'Floor 123',
      enemies: {
        front: [WEALDSHADOW_STALKER, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, RADIANT_HERALD, BOAR],
      },
    },
    {
      id: 't-undead-f124',
      name: 'Floor 124',
      enemies: {
        front: [GLOAMVINE_CREEPER, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f125',
      name: 'Floor 125',
      enemies: {
        front: [THORNBACK_GRAZER, BRAMBLEWALK_SCOUT],
        back: [SUNFADE_CHANTER, HEXBOUND_TORMENTOR, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-undead-f126',
      name: 'Floor 126',
      enemies: {
        front: [THORNBACK_GRAZER, DUSKFERN_SKIRMISHER],
        back: [NIGHTCANOPY_SINGER, SUNMOTE_DANCER, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f127',
      name: 'Floor 127',
      enemies: {
        front: [WEALDSHADOW_STALKER, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, SERAPH_ADJUDICANT, PYRE],
      },
    },
    {
      id: 't-undead-f128',
      name: 'Floor 128',
      enemies: {
        front: [GLOAMVINE_CREEPER, THORNBACK_GRAZER],
        back: [SUNFADE_CHANTER, EMBERSEED_WARLOCK, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f129',
      name: 'Floor 129',
      enemies: {
        front: [DUSKFERN_SKIRMISHER, SUNMOTE_DANCER],
        back: [WEALDSHADOW_STALKER, CONCORD_CANTOR, RAVAGER],
      },
    },
    {
      id: 't-undead-f130',
      name: 'Floor 130 — The Sunward Reach',
      enemies: {
        front: [THORNWEALD_WARDEN, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, CONCORD_CANTOR, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f131',
      name: 'Floor 131',
      enemies: {
        front: [HOLLOWBARK_SENTRY, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, SKYSHRIKE, HEXBOUND_TORMENTOR],
      },
    },
    {
      id: 't-undead-f132',
      name: 'Floor 132',
      enemies: {
        front: [WEALDSHADOW_STALKER, GLOAMVINE_CREEPER],
        back: [SUNFADE_CHANTER, EMBERSEED_WARLOCK, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-undead-f133',
      name: 'Floor 133',
      enemies: {
        front: [RAVAGER, BRAMBLEWALK_SCOUT],
        back: [LONGBOUGH_MARKSMAN, CONCORD_CANTOR, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-undead-f134',
      name: 'Floor 134',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, MOONSONG_WEAVER, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f135',
      name: 'Floor 135',
      enemies: {
        front: [SUNMOTE_DANCER, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SERAPH_ADJUDICANT, EMBERSEED_WARLOCK],
      },
    },
    {
      id: 't-undead-f136',
      name: 'Floor 136',
      enemies: {
        front: [GLOAMVINE_CREEPER, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f137',
      name: 'Floor 137',
      enemies: {
        front: [THORNBACK_GRAZER, SUNMOTE_DANCER],
        back: [NIGHTCANOPY_SINGER, WHISPERLEAF_ARCHER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f138',
      name: 'Floor 138',
      enemies: {
        front: [WEALDSHADOW_STALKER, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, PYRE, BOAR],
      },
    },
    {
      id: 't-undead-f139',
      name: 'Floor 139',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [LONGBOUGH_MARKSMAN, EMBERSEED_WARLOCK, MIREWHELP],
      },
    },
    {
      id: 't-undead-f140',
      name: 'Floor 140 — The Sunward Reach',
      enemies: {
        front: [THE_LONGSHADOW, HOLLOWBARK_SENTRY],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, CONCORD_CANTOR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Green Vigil — Floors 141–160, levels 67–76 — the first hundred's own lock restated at height: a heal with nothing to kill, on a board that cannot be out-traded. The last band that carries one.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f141',
      name: 'Floor 141',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [THORNWEALD_WARDEN, ASHEN_CHOIR, RAVAGER],
      },
    },
    {
      id: 't-undead-f142',
      name: 'Floor 142',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [HEARTROOT_TENDER, ASHEN_CHOIR, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f143',
      name: 'Floor 143',
      enemies: {
        front: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY],
        back: [THORNWEALD_WARDEN, EMBERSEED_WARLOCK, GOREHIDE_MATRIARCH],
      },
    },
    {
      id: 't-undead-f144',
      name: 'Floor 144',
      enemies: {
        front: [HEARTROOT_TENDER, GLOAMVINE_CREEPER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f145',
      name: 'Floor 145',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [THORNWEALD_WARDEN, HIEROPHANT, RAVAGER],
      },
    },
    {
      id: 't-undead-f146',
      name: 'Floor 146',
      enemies: {
        front: [WEALDSHADOW_STALKER, SUNMOTE_DANCER],
        back: [HEARTROOT_TENDER, RAVAGER, ASHEN_CHOIR],
      },
    },
    {
      id: 't-undead-f147',
      name: 'Floor 147',
      enemies: {
        front: [GOLEM, BRAMBLEWALK_SCOUT],
        back: [THORNWEALD_WARDEN, NIGHTCANOPY_SINGER, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f148',
      name: 'Floor 148',
      enemies: {
        front: [HEARTROOT_TENDER, HOLLOWBARK_SENTRY],
        back: [SUNFADE_CHANTER, EMBERSEED_WARLOCK, GOREHIDE_MATRIARCH],
      },
    },
    {
      id: 't-undead-f149',
      name: 'Floor 149',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUNMOTE_DANCER],
        back: [THORNWEALD_WARDEN, LONGBOUGH_MARKSMAN, ASHEN_CHOIR],
      },
    },
    {
      id: 't-undead-f150',
      name: 'Floor 150 — The Green Vigil',
      enemies: {
        front: [WYRDROOT_ANCIENT, HEARTROOT_TENDER],
        back: [THORNWEALD_WARDEN, HIEROPHANT, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f151',
      name: 'Floor 151',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WEALDSHADOW_STALKER],
        back: [THORNWEALD_WARDEN, HIEROPHANT, RIMEPLATE],
      },
    },
    {
      id: 't-undead-f152',
      name: 'Floor 152',
      enemies: {
        front: [HEARTROOT_TENDER, RIMEPLATE],
        back: [SUNFADE_CHANTER, LONGBOUGH_MARKSMAN, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f153',
      name: 'Floor 153',
      enemies: {
        front: [WEALDSHADOW_STALKER, SUNMOTE_DANCER],
        back: [THORNWEALD_WARDEN, GOREHIDE_MATRIARCH, ASHEN_CHOIR],
      },
    },
    {
      id: 't-undead-f154',
      name: 'Floor 154',
      enemies: {
        front: [GOLEM, DUSKFERN_SKIRMISHER],
        back: [HEARTROOT_TENDER, SUNFADE_CHANTER, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f155',
      name: 'Floor 155',
      enemies: {
        front: [GLOAMVINE_CREEPER, WEALDSHADOW_STALKER],
        back: [THORNWEALD_WARDEN, ANTIPHON_ARCHON, ASHEN_CHOIR],
      },
    },
    {
      id: 't-undead-f156',
      name: 'Floor 156',
      enemies: {
        front: [HEARTROOT_TENDER, HOLLOWBARK_SENTRY],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, RAVAGER],
      },
    },
    {
      id: 't-undead-f157',
      name: 'Floor 157',
      enemies: {
        front: [GOREHIDE_MATRIARCH, BRAMBLEWALK_SCOUT],
        back: [THORNWEALD_WARDEN, WEALDSHADOW_STALKER, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-undead-f158',
      name: 'Floor 158',
      enemies: {
        front: [WEALDSHADOW_STALKER, SUNMOTE_DANCER],
        back: [HEARTROOT_TENDER, SUNFADE_CHANTER, HIEROPHANT],
      },
    },
    {
      id: 't-undead-f159',
      name: 'Floor 159',
      enemies: {
        front: [RIMEPLATE, HOLLOWBARK_SENTRY],
        back: [THORNWEALD_WARDEN, LONGBOUGH_MARKSMAN, ANTIPHON_ARCHON],
      },
    },
    {
      id: 't-undead-f160',
      name: 'Floor 160 — The Green Vigil',
      enemies: {
        front: [THE_WITHERED_CROWN, HOLLOWBARK_SENTRY],
        back: [THORNWEALD_WARDEN, SUNFADE_CHANTER, ANTIPHON_ARCHON],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Warded Bough — Floors 161–180, levels 76–85 — bark that has closed over the same wound a hundred times, and behind it everything the party has spent the climb missing. Nothing above this floor restores anything.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f161',
      name: 'Floor 161',
      enemies: {
        front: [CROWNBARK_BASTION, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f162',
      name: 'Floor 162',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f163',
      name: 'Floor 163',
      enemies: {
        front: [CROWNBARK_BASTION, DUSKFERN_SKIRMISHER],
        back: [NIGHTCANOPY_SINGER, SUNMOTE_DANCER, GOREHIDE_MATRIARCH],
      },
    },
    {
      id: 't-undead-f164',
      name: 'Floor 164',
      enemies: {
        front: [CROWNBARK_BASTION, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f165',
      name: 'Floor 165',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, COVENANT_BREAKER, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f166',
      name: 'Floor 166',
      enemies: {
        front: [CROWNBARK_BASTION, BRAMBLEWALK_SCOUT],
        back: [WEALDSHADOW_STALKER, CONCORD_CANTOR, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f167',
      name: 'Floor 167',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, COVENANT_BREAKER],
      },
    },
    {
      id: 't-undead-f168',
      name: 'Floor 168',
      enemies: {
        front: [CROWNBARK_BASTION, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, WEALDSHADOW_STALKER, WRATHBORN],
      },
    },
    {
      id: 't-undead-f169',
      name: 'Floor 169',
      enemies: {
        front: [GLOAMVINE_CREEPER, WEALDSHADOW_STALKER],
        back: [SUNMOTE_DANCER, SERAPH_ADJUDICANT, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f170',
      name: 'Floor 170 — The Warded Bough',
      enemies: {
        front: [CROWNBARK_BASTION, WYRDROOT_ANCIENT],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f171',
      name: 'Floor 171',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, WRATHBORN],
      },
    },
    {
      id: 't-undead-f172',
      name: 'Floor 172',
      enemies: {
        front: [CROWNBARK_BASTION, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f173',
      name: 'Floor 173',
      enemies: {
        front: [GLOAMVINE_CREEPER, SUNMOTE_DANCER],
        back: [NIGHTCANOPY_SINGER, WRATHBORN, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f174',
      name: 'Floor 174',
      enemies: {
        front: [CROWNBARK_BASTION, BRAMBLEWALK_SCOUT],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, COVENANT_BREAKER],
      },
    },
    {
      id: 't-undead-f175',
      name: 'Floor 175',
      enemies: {
        front: [WEALDSHADOW_STALKER, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, BRAMBLEHIDE_RAVENER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f176',
      name: 'Floor 176',
      enemies: {
        front: [CROWNBARK_BASTION, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, LONGBOUGH_MARKSMAN, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f177',
      name: 'Floor 177',
      enemies: {
        front: [BRAMBLEHIDE_RAVENER, SUNMOTE_DANCER],
        back: [LONGBOUGH_MARKSMAN, SERAPH_ADJUDICANT, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f178',
      name: 'Floor 178',
      enemies: {
        front: [CROWNBARK_BASTION, DUSKFERN_SKIRMISHER],
        back: [NIGHTCANOPY_SINGER, SUNMOTE_DANCER, WRATHBORN],
      },
    },
    {
      id: 't-undead-f179',
      name: 'Floor 179',
      enemies: {
        front: [GLOAMVINE_CREEPER, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, RIFTBORN_HARROWER, COVENANT_BREAKER],
      },
    },
    {
      id: 't-undead-f180',
      name: 'Floor 180 — The Warded Bough',
      enemies: {
        front: [THE_LONGSHADOW, CROWNBARK_BASTION],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, CONCORD_CANTOR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sunbough — Floors 181–200, levels 86–95 — one anchor a board and an evasive board around it, and at the top the thing the whole wood was reaching for.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f181',
      name: 'Floor 181',
      enemies: {
        front: [THE_LONGSHADOW, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f182',
      name: 'Floor 182',
      enemies: {
        front: [CROWNBARK_BASTION, WEALDSHADOW_STALKER],
        back: [SUNMOTE_DANCER, BRAMBLEWALK_SCOUT, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f183',
      name: 'Floor 183',
      enemies: {
        front: [THE_WITHERED_CROWN, HOLLOWBARK_SENTRY],
        back: [SUNMOTE_DANCER, WHISPERLEAF_ARCHER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f184',
      name: 'Floor 184',
      enemies: {
        front: [THE_LONGSHADOW, CROWNBARK_BASTION],
        back: [SUNFADE_CHANTER, DUSKFERN_SKIRMISHER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f185',
      name: 'Floor 185',
      enemies: {
        front: [WYRDROOT_ANCIENT, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f186',
      name: 'Floor 186',
      enemies: {
        front: [THE_SUNBOUGH, HOLLOWBARK_SENTRY],
        back: [SUNMOTE_DANCER, BRAMBLEWALK_SCOUT, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f187',
      name: 'Floor 187',
      enemies: {
        front: [CROWNBARK_BASTION, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f188',
      name: 'Floor 188',
      enemies: {
        front: [THE_WITHERED_CROWN, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, WHISPERLEAF_ARCHER, RIFTBORN_HARROWER],
      },
    },
    {
      id: 't-undead-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_LONGSHADOW, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, WEALDSHADOW_STALKER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f190',
      name: 'Floor 190 — The Sunbough',
      enemies: {
        front: [THE_SUNBOUGH, CROWNBARK_BASTION],
        back: [SUNMOTE_DANCER, WHISPERLEAF_ARCHER, CINDERLING],
      },
    },
    {
      id: 't-undead-f191',
      name: 'Floor 191',
      enemies: {
        front: [WYRDROOT_ANCIENT, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f192',
      name: 'Floor 192',
      enemies: {
        front: [THE_LONGSHADOW, HOLLOWBARK_SENTRY],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, REDWATER_STALKER],
      },
    },
    {
      id: 't-undead-f193',
      name: 'Floor 193',
      enemies: {
        front: [THE_SUNBOUGH, BRAMBLEWALK_SCOUT],
        back: [SUNMOTE_DANCER, WHISPERLEAF_ARCHER, CARRION_SWARM],
      },
    },
    {
      id: 't-undead-f194',
      name: 'Floor 194',
      enemies: {
        front: [THE_WITHERED_CROWN, GLOAMVINE_CREEPER],
        back: [SUNMOTE_DANCER, WHISPERLEAF_ARCHER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f195',
      name: 'Floor 195',
      enemies: {
        front: [CROWNBARK_BASTION, WEALDSHADOW_STALKER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, RADIANT_HERALD],
      },
    },
    {
      id: 't-undead-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_SUNBOUGH, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f197',
      name: 'Floor 197',
      enemies: {
        front: [THE_LONGSHADOW, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, DUSKFERN_SKIRMISHER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_SUNBOUGH, SUNMOTE_DANCER],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f199',
      name: 'Floor 199',
      enemies: {
        front: [THE_WITHERED_CROWN, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f200',
      name: 'Floor 200 — The Sunbough',
      enemies: {
        front: [THE_SUNBOUGH, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, SUNMOTE_DANCER, WHISPERLEAF_ARCHER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Seedfall — Floors 201–220, levels 95–104 — past the Sunbough the wood seeds itself, and what grows back does not fall over when it is hit.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f201',
      name: 'Floor 201',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f202',
      name: 'Floor 202',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DEEPMAST_HEARTWOOD],
        back: [WHISPERLEAF_ARCHER, GILDED_SENTRY, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f203',
      name: 'Floor 203',
      enemies: {
        front: [THORNBACK_GRAZER, HOLLOWBARK_SENTRY],
        back: [GILDED_SENTRY, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f204',
      name: 'Floor 204',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, DUSKFERN_SKIRMISHER],
        back: [BRAMBLEWALK_SCOUT, LITANY_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f205',
      name: 'Floor 205',
      enemies: {
        front: [GLOAMVINE_CREEPER, THORNBACK_GRAZER],
        back: [LITANY_BEARER, SUNMOTE_DANCER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f206',
      name: 'Floor 206',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SUNMOTE_DANCER, VAULTLIGHT_CENSER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f207',
      name: 'Floor 207',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DEEPMAST_HEARTWOOD],
        back: [VAULTLIGHT_CENSER, LUMEN_ACOLYTE, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f208',
      name: 'Floor 208',
      enemies: {
        front: [THORNBACK_GRAZER, HOLLOWBARK_SENTRY],
        back: [LUMEN_ACOLYTE, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f209',
      name: 'Floor 209',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, DUSKFERN_SKIRMISHER],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f210',
      name: 'Floor 210 — The Seedfall',
      enemies: {
        front: [WYRDROOT_ANCIENT, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, BRAMBLEWALK_SCOUT, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f211',
      name: 'Floor 211',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [GILDED_SENTRY, BRAMBLEWALK_SCOUT, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f212',
      name: 'Floor 212',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DEEPMAST_HEARTWOOD],
        back: [BRAMBLEWALK_SCOUT, LITANY_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f213',
      name: 'Floor 213',
      enemies: {
        front: [THORNBACK_GRAZER, HOLLOWBARK_SENTRY],
        back: [LITANY_BEARER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f214',
      name: 'Floor 214',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, DUSKFERN_SKIRMISHER],
        back: [SUNMOTE_DANCER, VAULTLIGHT_CENSER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f215',
      name: 'Floor 215',
      enemies: {
        front: [GLOAMVINE_CREEPER, THORNBACK_GRAZER],
        back: [VAULTLIGHT_CENSER, LUMEN_ACOLYTE, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f216',
      name: 'Floor 216',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [LUMEN_ACOLYTE, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f217',
      name: 'Floor 217',
      enemies: {
        front: [HOLLOWBARK_SENTRY, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f218',
      name: 'Floor 218',
      enemies: {
        front: [THORNBACK_GRAZER, HOLLOWBARK_SENTRY],
        back: [WHISPERLEAF_ARCHER, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f219',
      name: 'Floor 219',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, DUSKFERN_SKIRMISHER],
        back: [GILDED_SENTRY, BRAMBLEWALK_SCOUT, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f220',
      name: 'Floor 220 — The Seedfall',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, RADIANT_HERALD],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Deepmast — Floors 221–245, levels 105–116 — the seed is kept: a pool banked over the whole board, spent once and gone.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f221',
      name: 'Floor 221',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f222',
      name: 'Floor 222',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, WHISPERLEAF_ARCHER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f223',
      name: 'Floor 223',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [CONCORD_CANTOR, WEALDSHADOW_STALKER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f224',
      name: 'Floor 224',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f225',
      name: 'Floor 225',
      enemies: {
        front: [GOLEM, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SHARDLIGHT_ACOLYTE, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f226',
      name: 'Floor 226',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [SUNMOTE_DANCER, STILLNESS_CANTOR, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f227',
      name: 'Floor 227',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, STILLNESS_CANTOR, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f228',
      name: 'Floor 228',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [SEEDLIGHT_KEEPER, BRAMBLEWALK_SCOUT, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f229',
      name: 'Floor 229',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f230',
      name: 'Floor 230 — The Deepmast',
      enemies: {
        front: [WYRDROOT_ANCIENT, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f231',
      name: 'Floor 231',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, CONCORD_CANTOR, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f232',
      name: 'Floor 232',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, DEEPMAST_HEARTWOOD],
        back: [WEALDSHADOW_STALKER, SHARDLIGHT_ACOLYTE, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f233',
      name: 'Floor 233',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [SEEDLIGHT_KEEPER, SHARDLIGHT_ACOLYTE, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f234',
      name: 'Floor 234',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SEEDLIGHT_KEEPER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f235',
      name: 'Floor 235',
      enemies: {
        front: [GOLEM, DEEPMAST_HEARTWOOD],
        back: [STILLNESS_CANTOR, BRAMBLEWALK_SCOUT, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f236',
      name: 'Floor 236',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, BRAMBLEWALK_SCOUT, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f237',
      name: 'Floor 237',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f238',
      name: 'Floor 238',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [WHISPERLEAF_ARCHER, CONCORD_CANTOR, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f239',
      name: 'Floor 239',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [SEEDLIGHT_KEEPER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f240',
      name: 'Floor 240 — The Deepmast',
      enemies: {
        front: [THE_LONGSHADOW, QUENCHPIT_IRONHIDE],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f241',
      name: 'Floor 241',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [SHARDLIGHT_ACOLYTE, SUNMOTE_DANCER, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f242',
      name: 'Floor 242',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SUNMOTE_DANCER, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f243',
      name: 'Floor 243',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [SEEDLIGHT_KEEPER, STILLNESS_CANTOR, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f244',
      name: 'Floor 244',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [BRAMBLEWALK_SCOUT, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f245',
      name: 'Floor 245',
      enemies: {
        front: [GOLEM, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Rootfast — Floors 246–265, levels 116–125 — the thing that must be killed is the thing that is hardest to kill, and it insists.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f246',
      name: 'Floor 246',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f247',
      name: 'Floor 247',
      enemies: {
        front: [SCARBOUND_BELLOWER, CROWNBARK_BASTION],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f248',
      name: 'Floor 248',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [SERAPH_ADJUDICANT, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f249',
      name: 'Floor 249',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, WHISPERLEAF_ARCHER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-undead-f250',
      name: 'Floor 250 — The Rootfast',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f251',
      name: 'Floor 251',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [SUNMOTE_DANCER, LONGBOUGH_MARKSMAN, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f252',
      name: 'Floor 252',
      enemies: {
        front: [SCARBOUND_BELLOWER, CROWNBARK_BASTION],
        back: [SEEDLIGHT_KEEPER, LONGBOUGH_MARKSMAN, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f253',
      name: 'Floor 253',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f254',
      name: 'Floor 254',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HOLLOWBARK_SENTRY],
        back: [SUNFADE_CHANTER, WEALDSHADOW_STALKER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f255',
      name: 'Floor 255',
      enemies: {
        front: [THE_WITHERED_CROWN, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f256',
      name: 'Floor 256',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, SERAPH_ADJUDICANT, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f257',
      name: 'Floor 257',
      enemies: {
        front: [SCARBOUND_BELLOWER, CROWNBARK_BASTION],
        back: [WHISPERLEAF_ARCHER, KILNSWORN_ADEPT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f258',
      name: 'Floor 258',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, KILNSWORN_ADEPT],
      },
    },
    {
      id: 't-undead-f259',
      name: 'Floor 259',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, SUNMOTE_DANCER, LONGBOUGH_MARKSMAN],
      },
    },
    {
      id: 't-undead-f260',
      name: 'Floor 260 — The Rootfast',
      enemies: {
        front: [THE_LONGSHADOW, CROWNBARK_BASTION],
        back: [SEEDLIGHT_KEEPER, WEALDSHADOW_STALKER, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f261',
      name: 'Floor 261',
      enemies: {
        front: [CROWNBARK_BASTION, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, CONCORD_CANTOR, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f262',
      name: 'Floor 262',
      enemies: {
        front: [SCARBOUND_BELLOWER, CROWNBARK_BASTION],
        back: [SEEDLIGHT_KEEPER, SUNFADE_CHANTER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f263',
      name: 'Floor 263',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [WEALDSHADOW_STALKER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f264',
      name: 'Floor 264',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HOLLOWBARK_SENTRY],
        back: [SEEDLIGHT_KEEPER, SERAPH_ADJUDICANT, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f265',
      name: 'Floor 265',
      enemies: {
        front: [THE_WITHERED_CROWN, DEEPMAST_HEARTWOOD],
        back: [SEEDLIGHT_KEEPER, WHISPERLEAF_ARCHER, KILNSWORN_ADEPT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Quickening — Floors 266–285, levels 126–135 — the wood stops waiting. One body a board that moves faster than the dead do.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f266',
      name: 'Floor 266',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f267',
      name: 'Floor 267',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [CINDERSEED_COURSER, WHISPERLEAF_ARCHER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-undead-f268',
      name: 'Floor 268',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DEEPMAST_HEARTWOOD],
        back: [GLASSCHOIR_ARBITER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f269',
      name: 'Floor 269',
      enemies: {
        front: [THE_SUNBOUGH, QUENCHPIT_IRONHIDE],
        back: [CINDERSEED_COURSER, SUNMOTE_DANCER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-undead-f270',
      name: 'Floor 270 — The Quickening',
      enemies: {
        front: [WYRDROOT_ANCIENT, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f271',
      name: 'Floor 271',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [DUSKFERN_SKIRMISHER, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f272',
      name: 'Floor 272',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [CINDERSEED_COURSER, WEALDSHADOW_STALKER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f273',
      name: 'Floor 273',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f274',
      name: 'Floor 274',
      enemies: {
        front: [THE_SUNBOUGH, QUENCHPIT_IRONHIDE],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-undead-f275',
      name: 'Floor 275',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [CINDERSEED_COURSER, WHISPERLEAF_ARCHER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-undead-f276',
      name: 'Floor 276',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, GLASSCHOIR_ARBITER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f277',
      name: 'Floor 277',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [SUNMOTE_DANCER, RIFTEDGE_CANTOR, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f278',
      name: 'Floor 278',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, RIFTEDGE_CANTOR],
      },
    },
    {
      id: 't-undead-f279',
      name: 'Floor 279',
      enemies: {
        front: [THE_SUNBOUGH, QUENCHPIT_IRONHIDE],
        back: [CINDERSEED_COURSER, DUSKFERN_SKIRMISHER, WEALDSHADOW_STALKER],
      },
    },
    {
      id: 't-undead-f280',
      name: 'Floor 280 — The Quickening',
      enemies: {
        front: [THE_SUNBOUGH, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, SUNFADE_CHANTER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f281',
      name: 'Floor 281',
      enemies: {
        front: [THE_LONGSHADOW, DEEPMAST_HEARTWOOD],
        back: [CINDERSEED_COURSER, CINDER_CULLER, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f282',
      name: 'Floor 282',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [CINDERSEED_COURSER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f283',
      name: 'Floor 283',
      enemies: {
        front: [GOREHIDE_MATRIARCH, DEEPMAST_HEARTWOOD],
        back: [WHISPERLEAF_ARCHER, GLASSCHOIR_ARBITER],
      },
    },
    {
      id: 't-undead-f284',
      name: 'Floor 284',
      enemies: {
        front: [THE_SUNBOUGH, QUENCHPIT_IRONHIDE],
        back: [CINDERSEED_COURSER, GLASSCHOIR_ARBITER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f285',
      name: 'Floor 285',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [CINDERSEED_COURSER, SUNMOTE_DANCER, RIFTEDGE_CANTOR],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Seedcrown — Floors 286–300, levels 135–142 — weight and rate together, and at the top the wood that has already outlived everything that climbed it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f286',
      name: 'Floor 286',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f287',
      name: 'Floor 287',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [WHISPERLEAF_ARCHER, KNELL_CHANTER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f288',
      name: 'Floor 288',
      enemies: {
        front: [THE_SEEDFATHER, HOLLOWBARK_SENTRY],
        back: [KNELL_CHANTER, SUNMOTE_DANCER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f289',
      name: 'Floor 289',
      enemies: {
        front: [SCARBOUND_BELLOWER, DEEPMAST_HEARTWOOD],
        back: [SUNMOTE_DANCER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f290',
      name: 'Floor 290 — The Seedcrown',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f291',
      name: 'Floor 291',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [BRAMBLEWALK_SCOUT, SHARDLIGHT_ACOLYTE, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f292',
      name: 'Floor 292',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [SHARDLIGHT_ACOLYTE, DUSKFERN_SKIRMISHER, SUNFADE_CHANTER],
      },
    },
    {
      id: 't-undead-f293',
      name: 'Floor 293',
      enemies: {
        front: [THE_SEEDFATHER, HOLLOWBARK_SENTRY],
        back: [DUSKFERN_SKIRMISHER, SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f294',
      name: 'Floor 294',
      enemies: {
        front: [SCARBOUND_BELLOWER, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f295',
      name: 'Floor 295',
      enemies: {
        front: [THE_SEEDFATHER, QUENCHPIT_IRONHIDE],
        back: [WHISPERLEAF_ARCHER, KNELL_CHANTER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f296',
      name: 'Floor 296',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [KNELL_CHANTER, SUNMOTE_DANCER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f297',
      name: 'Floor 297',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CROWNBARK_BASTION],
        back: [SUNMOTE_DANCER, CINDER_CULLER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f298',
      name: 'Floor 298',
      enemies: {
        front: [THE_SEEDFATHER, HOLLOWBARK_SENTRY],
        back: [CINDER_CULLER, BRAMBLEWALK_SCOUT, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f299',
      name: 'Floor 299',
      enemies: {
        front: [SCARBOUND_BELLOWER, DEEPMAST_HEARTWOOD],
        back: [BRAMBLEWALK_SCOUT, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f300',
      name: 'Floor 300 — The Seedcrown',
      enemies: {
        front: [THE_SEEDFATHER, DEEPMAST_HEARTWOOD],
        back: [SUNFADE_CHANTER, WHISPERLEAF_ARCHER, SUNMOTE_DANCER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Coppice — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — the crown came off three hundred floors ago and what grew back is thin, straight and in a hurry. One body a board carries it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f301',
      name: 'Floor 301',
      enemies: {
        front: [THE_SEEDFATHER, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, WHISPERLEAF_ARCHER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f302',
      name: 'Floor 302',
      enemies: {
        front: [THE_SEEDFATHER, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, SHARDLIGHT_ACOLYTE, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f303',
      name: 'Floor 303',
      enemies: {
        front: [THE_SEEDFATHER, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, LITANY_BEARER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f304',
      name: 'Floor 304',
      enemies: {
        front: [THE_SEEDFATHER, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f305',
      name: 'Floor 305',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, GILDED_SENTRY, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f306',
      name: 'Floor 306',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, LUMEN_ACOLYTE, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f307',
      name: 'Floor 307',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, WHISPERLEAF_ARCHER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f308',
      name: 'Floor 308',
      enemies: {
        front: [SCARBOUND_BELLOWER, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, STILLNESS_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f309',
      name: 'Floor 309',
      enemies: {
        front: [SCARBOUND_BELLOWER, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, WHISPERLEAF_ARCHER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f310',
      name: 'Floor 310 — The Coppice',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WEALDSHADOW_STALKER, HOLLOWBARK_SENTRY, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f311',
      name: 'Floor 311',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, LITANY_BEARER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f312',
      name: 'Floor 312',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f313',
      name: 'Floor 313',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, GILDED_SENTRY, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f314',
      name: 'Floor 314',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, LUMEN_ACOLYTE, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f315',
      name: 'Floor 315',
      enemies: {
        front: [CROWNBARK_BASTION, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, WHISPERLEAF_ARCHER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f316',
      name: 'Floor 316',
      enemies: {
        front: [CROWNBARK_BASTION, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, STILLNESS_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f317',
      name: 'Floor 317',
      enemies: {
        front: [CROWNBARK_BASTION, THORNBACK_GRAZER],
        back: [COPPICE_LASHER, WHISPERLEAF_ARCHER, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f318',
      name: 'Floor 318',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, GLOAMVINE_CREEPER],
        back: [COPPICE_LASHER, SHARDLIGHT_ACOLYTE, GILDED_SENTRY],
      },
    },
    {
      id: 't-undead-f319',
      name: 'Floor 319',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [COPPICE_LASHER, LITANY_BEARER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f320',
      name: 'Floor 320 — The Coppice',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WEALDSHADOW_STALKER, THORNBACK_GRAZER, VAULTLIGHT_CENSER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Sapwood — Floors 321–345, levels 152–163, Sturdy 5–Sturdy 34 — two of them, and the old heartwood behind them starts to go. Neither half of the pair is the point; carrying both is.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f321',
      name: 'Floor 321',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [SERAPH_ADJUDICANT, STILLNESS_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f322',
      name: 'Floor 322',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [SERAPH_ADJUDICANT, SHARDLIGHT_ACOLYTE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f323',
      name: 'Floor 323',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [SERAPH_ADJUDICANT, KNELL_CHANTER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f324',
      name: 'Floor 324',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [SERAPH_ADJUDICANT, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f325',
      name: 'Floor 325',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [SERAPH_ADJUDICANT, CONCORD_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f326',
      name: 'Floor 326',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, WHISPERLEAF_ARCHER, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f327',
      name: 'Floor 327',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, LITANY_BEARER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f328',
      name: 'Floor 328',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, STILLNESS_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f329',
      name: 'Floor 329',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, SHARDLIGHT_ACOLYTE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f330',
      name: 'Floor 330 — The Sapwood',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f331',
      name: 'Floor 331',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f332',
      name: 'Floor 332',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CONCORD_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f333',
      name: 'Floor 333',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, WHISPERLEAF_ARCHER, STILLNESS_CANTOR],
      },
    },
    {
      id: 't-undead-f334',
      name: 'Floor 334',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, LITANY_BEARER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f335',
      name: 'Floor 335',
      enemies: {
        front: [QUENCHPIT_IRONHIDE, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, STILLNESS_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f336',
      name: 'Floor 336',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WEALDSHADOW_STALKER, SHARDLIGHT_ACOLYTE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f337',
      name: 'Floor 337',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WEALDSHADOW_STALKER, KNELL_CHANTER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f338',
      name: 'Floor 338',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WEALDSHADOW_STALKER, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f339',
      name: 'Floor 339',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WEALDSHADOW_STALKER, CONCORD_CANTOR, LITANY_BEARER],
      },
    },
    {
      id: 't-undead-f340',
      name: 'Floor 340 — The Sapwood',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, WHISPERLEAF_ARCHER],
      },
    },
    {
      id: 't-undead-f341',
      name: 'Floor 341',
      enemies: {
        front: [SCARBOUND_BELLOWER, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, LITANY_BEARER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f342',
      name: 'Floor 342',
      enemies: {
        front: [SCARBOUND_BELLOWER, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, STILLNESS_CANTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f343',
      name: 'Floor 343',
      enemies: {
        front: [SCARBOUND_BELLOWER, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, SHARDLIGHT_ACOLYTE, VAULTLIGHT_CENSER],
      },
    },
    {
      id: 't-undead-f344',
      name: 'Floor 344',
      enemies: {
        front: [SCARBOUND_BELLOWER, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, KNELL_CHANTER, CONCORD_CANTOR],
      },
    },
    {
      id: 't-undead-f345',
      name: 'Floor 345',
      enemies: {
        front: [SCARBOUND_BELLOWER, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, VAULTLIGHT_CENSER, WHISPERLEAF_ARCHER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Withy — Floors 346–365, levels 163–172, Sturdy 35–Fine 18 — three abreast and the first of them standing where an Undead five has one ultimate to reach. Green wood bends round you before it goes through.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f346',
      name: 'Floor 346',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f347',
      name: 'Floor 347',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f348',
      name: 'Floor 348',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f349',
      name: 'Floor 349',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, COPPICE_LASHER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f350',
      name: 'Floor 350 — The Withy',
      enemies: {
        front: [THE_SEEDFATHER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, COPPICE_LASHER],
      },
    },
    {
      id: 't-undead-f351',
      name: 'Floor 351',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f352',
      name: 'Floor 352',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f353',
      name: 'Floor 353',
      enemies: {
        front: [THE_SEEDFATHER, COPPICE_LASHER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f354',
      name: 'Floor 354',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WITHYBIND_RUNNER, GLASSCHOIR_ARBITER, KNELL_CHANTER],
      },
    },
    {
      id: 't-undead-f355',
      name: 'Floor 355',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WITHYBIND_RUNNER, GLASSCHOIR_ARBITER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f356',
      name: 'Floor 356',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WITHYBIND_RUNNER, GLASSCHOIR_ARBITER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f357',
      name: 'Floor 357',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, CINDERSEED_COURSER],
        back: [WITHYBIND_RUNNER, GLASSCHOIR_ARBITER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f358',
      name: 'Floor 358',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, COPPICE_LASHER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f359',
      name: 'Floor 359',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, COPPICE_LASHER, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f360',
      name: 'Floor 360 — The Withy',
      enemies: {
        front: [THE_SEEDFATHER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, COPPICE_LASHER],
      },
    },
    {
      id: 't-undead-f361',
      name: 'Floor 361',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, COPPICE_LASHER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f362',
      name: 'Floor 362',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f363',
      name: 'Floor 363',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f364',
      name: 'Floor 364',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f365',
      name: 'Floor 365',
      enemies: {
        front: [HOLLOWBARK_SENTRY, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, CINDERSEED_COURSER, SUNMOTE_DANCER],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Lashwood — Floors 366–385, levels 173–182, Fine 19–Fine 42 — the anchors are gone and two carriers stand behind. What the boards give up in weight is exactly what pays for the heat.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f366',
      name: 'Floor 366',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f367',
      name: 'Floor 367',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f368',
      name: 'Floor 368',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f369',
      name: 'Floor 369',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, WITHYBIND_RUNNER],
        back: [CINDERSEED_COURSER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f370',
      name: 'Floor 370 — The Lashwood',
      enemies: {
        front: [THORNBACK_GRAZER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f371',
      name: 'Floor 371',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f372',
      name: 'Floor 372',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f373',
      name: 'Floor 373',
      enemies: {
        front: [THORNBACK_GRAZER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f374',
      name: 'Floor 374',
      enemies: {
        front: [HOLLOWBARK_SENTRY, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, KILNSWORN_ADEPT, SUNMOTE_DANCER],
      },
    },
    {
      id: 't-undead-f375',
      name: 'Floor 375',
      enemies: {
        front: [HOLLOWBARK_SENTRY, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, KILNSWORN_ADEPT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f376',
      name: 'Floor 376',
      enemies: {
        front: [HOLLOWBARK_SENTRY, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, KILNSWORN_ADEPT, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f377',
      name: 'Floor 377',
      enemies: {
        front: [HOLLOWBARK_SENTRY, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, KILNSWORN_ADEPT, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f378',
      name: 'Floor 378',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f379',
      name: 'Floor 379',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f380',
      name: 'Floor 380 — The Lashwood',
      enemies: {
        front: [THORNBACK_GRAZER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f381',
      name: 'Floor 381',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f382',
      name: 'Floor 382',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, SERAPH_ADJUDICANT, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f383',
      name: 'Floor 383',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, SERAPH_ADJUDICANT, DUSKFERN_SKIRMISHER],
      },
    },
    {
      id: 't-undead-f384',
      name: 'Floor 384',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, SERAPH_ADJUDICANT, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f385',
      name: 'Floor 385',
      enemies: {
        front: [GLOAMVINE_CREEPER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, SERAPH_ADJUDICANT, BRAMBLEWALK_SCOUT],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Springwood — Floors 386–400, levels 182–189, Fine 43–Fine 60 — the fast ring a tree lays down in a season that will not last. Nothing on these boards is heavy and nothing on them is slow.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f386',
      name: 'Floor 386',
      enemies: {
        front: [CINDER_CULLER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f387',
      name: 'Floor 387',
      enemies: {
        front: [CINDER_CULLER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f388',
      name: 'Floor 388',
      enemies: {
        front: [CINDER_CULLER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f389',
      name: 'Floor 389',
      enemies: {
        front: [CINDER_CULLER, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, SERAPH_ADJUDICANT, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f390',
      name: 'Floor 390 — The Springwood',
      enemies: {
        front: [CINDER_CULLER, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f391',
      name: 'Floor 391',
      enemies: {
        front: [BRAMBLEWALK_SCOUT, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f392',
      name: 'Floor 392',
      enemies: {
        front: [BRAMBLEWALK_SCOUT, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDERSEED_COURSER, BRAMBLEWALK_SCOUT],
      },
    },
    {
      id: 't-undead-f393',
      name: 'Floor 393',
      enemies: {
        front: [LUMEN_ACOLYTE, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f394',
      name: 'Floor 394',
      enemies: {
        front: [LUMEN_ACOLYTE, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f395',
      name: 'Floor 395',
      enemies: {
        front: [LUMEN_ACOLYTE, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f396',
      name: 'Floor 396',
      enemies: {
        front: [LUMEN_ACOLYTE, WITHYBIND_RUNNER],
        back: [THINWOOD_HARRIER, GLASSCHOIR_ARBITER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f397',
      name: 'Floor 397',
      enemies: {
        front: [LUMEN_ACOLYTE, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDER_CULLER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f398',
      name: 'Floor 398',
      enemies: {
        front: [LUMEN_ACOLYTE, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDER_CULLER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f399',
      name: 'Floor 399',
      enemies: {
        front: [LUMEN_ACOLYTE, THINWOOD_HARRIER],
        back: [WITHYBIND_RUNNER, CINDER_CULLER, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f400',
      name: 'Floor 400 — The Springwood',
      enemies: {
        front: [THE_SPRINGWOOD, LUMEN_ACOLYTE],
        back: [BRAMBLEWALK_SCOUT, LUMEN_ACOLYTE, LUMEN_ACOLYTE],
      },
    },
  ],
} as const;
