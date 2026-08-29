import {
  ACOLYTE,
  ANTIPHON_ARCHON,
  ASHEN_CHOIR,
  ASHPIT_SCUTTLER,
  BANDIT,
  BAREMARK_GNAWER,
  BOAR,
  BRAKETHORN_FLAIL,
  BRAMBLEHIDE_RAVENER,
  BRAMBLEWALK_SCOUT,
  BREAKSTONE_WARDEN,
  BULWARK_ENEMY,
  CARRION_SWARM,
  CENTURYBOUGH_WARDEN,
  CHALKHIDE_BROWSER,
  CHANNELBED_STALKER,
  CINDERLING,
  CINDERSEED_COURSER,
  CINDER_CULLER,
  CLOSEWARD_SERAPH,
  COLOSSUS,
  CONCORD_CANTOR,
  COPPICE_LASHER,
  COVENANT_BREAKER,
  COVERT_REAVER,
  CROWNBARK_BASTION,
  CROWNFALL_DARTER,
  DEEPMAST_HEARTWOOD,
  DROWNED_MAST,
  DULLEDGE_BRIAR,
  DUSKFERN_SKIRMISHER,
  DUSTPLATE_GRINDER,
  EMBERSEED_WARLOCK,
  EMBERSHELL_WHELP,
  EMBERWEDGE_DRIVER,
  EVENLIGHT_TENDER,
  EVENSONG_WARDEN,
  FLATSHADE_STALKER,
  GALLERY_SLIPFANG,
  GILDED_SENTRY,
  GLADE_STALKER,
  GLASSBARK_SENTRY,
  GLASSCHOIR_ARBITER,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GREYLEAF_WARDEN,
  HEADSMAN,
  HEARTROOT_TENDER,
  HEXBOUND_TORMENTOR,
  HIEROPHANT,
  HOLLOWBARK_SENTRY,
  ILLFALL_SKULKER,
  IRONBARK_WARDEN,
  KILNSWORN_ADEPT,
  KNELL_CHANTER,
  LITANY_BEARER,
  LONGBOUGH_MARKSMAN,
  LUMEN_ACOLYTE,
  MIREMAST_TRUNK,
  MIREWHELP,
  MOONSONG_WEAVER,
  NIGHTCANOPY_SINGER,
  NOONLESS_ARCHER,
  OVERBURDEN_HULK,
  PYRE,
  QUENCHPIT_IRONHIDE,
  RADIANT_HERALD,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  RIFTBORN_HARROWER,
  RIFTEDGE_CANTOR,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  RINGBARK_ELDER,
  RIVENBOUGH_FROE,
  ROOTPLATE_CLIMBER,
  ROUGHCAST_GNAWER,
  RUSTLEAF_GLEANER,
  SCALEPLATE_BRAMBLE,
  SCARBOUND_BELLOWER,
  SCATTERSTONE_HOWLER,
  SCREEBACK_DARTER,
  SEEDLIGHT_KEEPER,
  SENTINEL,
  SERAPH_ADJUDICANT,
  SHADE,
  SHADOWLESS_DANCER,
  SHAKEWOOD_LANCER,
  SHALEBED_CRAWLER,
  SHARDLIGHT_ACOLYTE,
  SILTCROWN_CANOPY,
  SKYSHRIKE,
  SLAGSEAM_FLENSER,
  SLIME,
  SLOWGROWTH_BOLE,
  SNAPWOOD_HARRIER,
  SPLITMAW_RENDER,
  STILLNESS_CANTOR,
  STILLWATER_ROOT,
  STORMCALLER,
  SUCKERWOOD_WHIP,
  SUNFADE_CHANTER,
  SUNMOTE_DANCER,
  THE_BLACKTHORN,
  THE_HAIRLINE,
  THE_HEARTSHAKE,
  THE_LAST_RING,
  THE_LONGSHADOW,
  THE_SEEDFATHER,
  THE_SPRINGWOOD,
  THE_SUNBOUGH,
  THE_UNHURRIED,
  THE_WITHERED_CROWN,
  THINWOOD_HARRIER,
  THORNBACK_GRAZER,
  THORNLING,
  THORNWEALD_WARDEN,
  UNSEALED_WRETCH,
  UNSPOKEN_CANON,
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
 * The Undead Tower — six hundred floors, enemy levels 1 to 283.
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
 * ## ⚠️ The fifth hundred escalates through `attackSpeed`, which nothing in this game had ever fielded
 *
 * The Thicket, floors 401–500, levels 189–236, and the gear ramp continues rather than arriving —
 * Masterwork 1 at floor 401 to **Relic 40** at the roof, one rule for all seven towers — so this
 * hundred owed an axis on top of it exactly as The Coppice did. The full measurement, the negative
 * list, the cross-crew table and the register check live beside {@link SUCKERWOOD_WHIP} in
 * [`enemies.ts`](./enemies.ts); what belongs here is what it means for this tower.
 *
 * ⚠️ **The vocabulary has collapsed to one curve, and saying so is half the finding.** At band 5 this
 * crew has no answer to anything: held at equal nominal damage, `attackSpeed` 130, `haste` 160–190,
 * `atk` ×1.5 and enemy crit at ×1.88 expected damage all read the same 2.00 / 0.00 against the
 * hundred's two controls, and **every throughput candidate ranks undead-alt first of the twelve
 * non-Angel arrangements**. That ranking is a fact about the crew rather than about any one stat, so
 * the cross-crew table cannot choose between the spellings — which is the inverse of the Human fifth
 * hundred's problem, where nothing was exclusively theirs because that crew is balanced.
 *
 * ⚠️ **What chose `attackSpeed` is fight length, and the register being empty is what stops it being
 * The Coppice shipped twice.** At matched difficulty it is the fastest spelling of the curve — worth
 * about 1.5 of five it adds 4.1 seconds where crit adds 4.5 and `atk` adds 4.8, and `def` 110, the one
 * candidate with an *exclusive* licence (undead-alt first of fourteen at 1.85), adds **12.9**. And
 * because `attackSpeed` accrues **only when a body's last action was a basic attack**, it is `haste`
 * a body has to pay a kit for: every turn in this hundred runs 64 to 84 ticks against a shipped median
 * of 55, where The Coppice's run 34 to 40. Same curve, opposite skill shape.
 *
 * ⚠️ **The attack halves and the rate replaces it.** Floor 500's board and floor 400's weigh
 * **exactly the same 2,610 health** and carry **188 attack against 238** — the weight barely moves
 * across a hundred floors and the attack comes down a fifth on the board and by nearly a half on the
 * carriers (74 / 78 / 82 in The Coppice against 44 / 42 / 40 here). **Convert the attack as well as
 * the weight when carrying a budget across a boundary**, which is chapter 23's rule on a tower.
 *
 * ⚠️ **Both of this tower's earlier axes have expired again, which makes it three for three.**
 * Re-measured at band 5 against every crew's own calibrated control, The Coppice's `atk` × `haste`
 * pair costs **undead-ref last of fourteen** (1.38) against dwarf-ref 3.73 and elf-alt 3.60. **Re-run
 * "is it ours" on the band being authored, never on the band that recorded it.**
 *
 * ⚠️ **Which crew binds depends on what is being measured, and the two answers are opposite.** On the
 * isolated axis grade the **alternate** is far the weaker — four carriers at `attackSpeed` 130 read
 * 2.00 for the reference five and **0.00** for the alternate. On the shipped boards the **reference**
 * five binds on almost every floor, because those boards carry real weight and the alternate does not
 * fall to weight. Weight breaks one arrangement and the axis breaks the other, which is the Angel
 * Tower's split arriving here. **Check both on every board.**
 *
 * ## ⚠️ The Springwood is unwinnable at this hundred's roof, and the anchor check came back clean
 *
 * The shipped floor-400 board reads 100% with all five alive at floor 401 and **0% / 8% at floor 500
 * in Relic 40** — the Crownworks collapse a fifth time on this tower. So {@link THE_BLACKTHORN} is
 * lighter than {@link THE_SPRINGWOOD} it succeeds on both stats, 1180/34 against 1160/72.
 *
 * ⚠️ **The retirement check itself came back almost entirely clean, which is what a rung boundary
 * should do.** Fielded alone behind four light escorts at floor 500 in Relic 40, **twelve of the
 * fourteen blocks The Coppice fields at 700 health or more read 100% with all five alive** — the
 * Scarbound Bellower at 1180/70 and the Deepmast Heartwood at 1160/56 included. Only
 * {@link THE_SEEDFATHER} (83% / 70% at **40 seconds**) and {@link THE_SPRINGWOOD} (95% / 88%) read
 * under bar, and both stay retired from the closing bands. A band boundary hands the crew a rung
 * (×1.6) and twenty-four levels where the boards gain forty-seven, and ×1.6 outruns
 * `perLevel.ascended`.
 *
 * ⚠️ **The hundred fields no sustain at all, and it carries no taunt, link or reflect either** — which
 * is stricter than The Coppice, whose opening bands spend three self-taunts and a link. Stated in
 * counts, because the absolute form of this claim has shipped wrong five times across the towers: of
 * the **38** blocks the hundred fields, **zero** carry `recovery`, `lifeLeech` or `healthRegen`,
 * **zero** carry a heal, a drain or a shield effect, **zero** carry a `regen` status, and **zero**
 * carry a taunt, a link or a reflect. That cost it {@link SCARBOUND_BELLOWER},
 * {@link QUENCHPIT_IRONHIDE}, {@link CROWNBARK_BASTION} and {@link GLOAMVINE_CREEPER}, all four
 * fielded freely one hundred floors below and all four still fielded there.
 *
 * ⚠️ **One board-wide turn per board, held mechanically.** The draft came out with fifteen boards
 * carrying two, all from substituted texture; the shipped hundred runs a **mean of 0.58 and a maximum
 * of one**, against this tower's own third and fourth hundreds at **1.08 with a peak of three** and
 * **0.86 with a peak of four**. **Count the voices per board with a script; nobody reads a hundred
 * boards and notices.**
 *
 * ⚠️ **The lean's first pass came out at 94.8% Elf**, the worst overshoot this tower has had, because
 * the three new carriers and the roof are Elven and stand on nearly every board — 244 of 500 slots
 * before a single texture body was chosen. Corrected during authoring by converting one texture slot
 * at a time across every band to Angel, Demon and Monster bodies of matched weight and attack — all
 * three counter Undead — the hundred ships at **59.4% Elf** and takes the tower to **60.2%**.
 * **Budget for it: when the axis blocks are the lean's, the carriers alone can spend the whole
 * allowance.**
 *
 * ## ⚠️ The sixth hundred — the Riving — is the size of one blow, and it is the half of crit a
 * neighbouring tower declined
 *
 * The Riving, floors 501–600, levels 236–283, and the gear ramp **finishes** rather than continues —
 * Relic 41 at floor 501 to **Relic 100** at the roof, one rule for all seven towers, and the first
 * hundred in any tower with no grade boundary inside it because Relic is the last grade. So this
 * hundred owed an axis on top of a ramp that is monotone from its first floor to its last. The full
 * measurement, the negative list, the cross-crew table and the register check live beside
 * {@link EMBERWEDGE_DRIVER} in [`enemies.ts`](./enemies.ts); what belongs here is what it means for
 * this tower.
 *
 * ⚠️ **It is the tower's founding sentence taken from the one direction five hundred floors did not.**
 * What breaks an Undead five is anything that stops the trade paying, and the four hundreds below stop
 * it by taking the trade away: `dodge` makes the swing miss, a pool that will not die leaves nothing to
 * take it from, and `atk` × `haste` and `attackSpeed` end the fight before attrition can pay. This one
 * lets the trade happen and **removes the trader**: `critDamage` is `1 + max(critDamageAmp −
 * critDamageResist, 0)`, and a crew whose sustain is `lifeLeech` off damage dealt (Σ0.36 / Σ0.40, the
 * highest in the game) and `recovery` on its own turn (Σ55 / Σ61, the highest by a quarter) cannot
 * out-heal a blow that takes a body between two of them.
 *
 * ⚠️ **The licence is margin rather than exclusivity, and this is the second consecutive hundred that
 * has had to say so.** At band 6 undead-alt ranks **third of fourteen and first of the twelve non-Angel
 * arrangements**, with the fight-length confound at 0.612 and the residual putting it third in a
 * three-way tie inside 0.18. The fifth hundred had the opposite problem — *every* throughput candidate
 * ranked undead-alt first, so the table could not choose between the spellings — and one rung and
 * twenty-four levels later that has simply stopped being true. **Re-run "is it ours" on the band being
 * authored, never on the band that recorded it**, which is now four for four on this tower.
 *
 * ⚠️ **`magicResist` is the candidate that looks decisive and is not, and the reason is another
 * tower.** undead-alt deals **twelve magical damage effects and zero physical**, six of them drains, so
 * a magic ward ought to tax the hit *and* the healing — and measured it ranks **second**, behind
 * demon-alt on the raw table at every size (1.23 against 1.25 at 0.60; 1.50 against 1.53 at 0.74) and
 * behind it on the residual too. That is the Demon Tower's own fourth hundred, and a dead heat is not a
 * licence. **Two towers with one stat is a question about the argument, and this one loses it.**
 *
 * ⚠️ **The register is stepped on one half of the pair and held inside the other.** `critDamageAmp`
 * sits on **all 430** shipped blocks at a median of 0.70 and a ceiling of **1.15**, and the four
 * carriers run **1.35 / 1.70 / 2.00 / 2.30** — every one above the ceiling, the Monster Tower's "works
 * only above its register" as a whole hundred. `critChance` sits on all 430 at a median of 0.10 and a
 * ceiling of **0.30**, and the four run 0.20 / 0.24 / 0.26 / 0.28, every one **inside** it. **Say which
 * side of the register each half landed on.**
 *
 * ⚠️ **The band table is a count of bodies at a threshold, because the stat is on every block.** Bodies
 * at `critDamageAmp` ≥ 1.20 run **0–1, 1–2, 2, 2–3, 3, 3** across the six bands. And the axis grades in
 * that count as well as in value — 3.95 / 3.83 / 3.48 / 3.02 / 3.00 for the reference five across zero
 * to four carriers at 2.20 — which is what lets six bands be built on it.
 *
 * ⚠️ **The carriers stand behind, and that is priced rather than habitual.** Carried on **one** body
 * with the escort held, an amplifier is worth 0.15–0.30 of five in front and **1.00 behind** at floor
 * 570's level, and 0.02–0.08 in front against **1.80–1.85 behind** at floor 590's, reproduced on all
 * three carriers. An amplifier bills what is **left alive** — chapter 28's `attackSpeed` sign, and the
 * exact opposite of the `dodge` this tower's second hundred is built on, which bills what is *aimed
 * at*. The one exception is {@link RIVENBOUGH_FROE}, which takes the front rank on the boards that want
 * a third amplifier and cannot afford a third back-rank one.
 *
 * ⚠️ **The weight falls by a factor of 4.60 and the attack by a third, which is the largest squeeze
 * this tower has had.** On a fixed control the board weight reading ≥3.90 of five for the binding
 * arrangement falls from **6,670 raw / 10,105 common-equivalent at floor 501 to 1,450 / 2,197 at floor
 * 600**, against the Elf sixth hundred's 3.69 — because the party is frozen at band 6 while the boards
 * climb forty-seven levels and **fifty-nine gear positions**. The shipped boards run 4,337
 * common-equivalent at 244 board attack at floor 501 to 2,292 at 170 by floor 595. **Convert the attack
 * as well as the weight**, which is chapter 23's rule and this tower's fifth hundred's, again.
 *
 * ## ⚠️ The whole of the Thicket's ascended roster retires, and the seconds say what killed it
 *
 * The shipped floor-500 board, fielded up its own level line against the band-6 crew, reads 100% with
 * all five alive at its own level 236, 100% / 4.75 at floor 530, 100% / 2.02 at floor 565 and **0% / 0%
 * at floor 600 in Relic 100** — the Crownworks collapse a sixth time on this tower. So
 * {@link THE_HEARTSHAKE} is lighter than {@link THE_BLACKTHORN} it succeeds on both stats, 560/16
 * against 1180/34.
 *
 * ⚠️ **Fielded alone behind four light escorts at floor 600, _all six_ of the `ascended` blocks the
 * Thicket fields read 0%** — {@link THE_SPRINGWOOD} at 9.1s, {@link THE_HAIRLINE} at 12.6s,
 * {@link THE_SEEDFATHER} at 14.6s, {@link THE_BLACKTHORN} at 15.8s, {@link THE_LAST_RING} at 18.6s and
 * {@link THE_UNHURRIED} at 24.1s — every one of them a death rather than a timeout, which is the Dwarf
 * sixth hundred's distinction and the half that says the boards are too *big* rather than too slow.
 * ⚠️ **A rung boundary is only a reprieve when the hundred's gear is flat**, and this one's is not:
 * floors 401–500 climb Masterwork 1 → Relic 40 for ×1.09 in effective tank health where 501–600 climb
 * Relic 41 → Relic 100 for **×1.47**. The Thicket's own check came back almost entirely clean on
 * exactly that argument and this one does not.
 *
 * ⚠️ **What stands is the cold**, and it is not a clean rule so the list is stated: of the twenty-one
 * blocks the Thicket fields at 800 health or more, seven read 0%, six more read under one bar or both
 * ({@link OVERBURDEN_HULK} 100% / 68%, {@link DUSTPLATE_GRINDER} 88% / 78%, {@link CLOSEWARD_SERAPH}
 * 23% / 70%, {@link DROWNED_MAST} 15% / 85%, {@link REDWATER_STALKER} 8% / 78%,
 * {@link EVENSONG_WARDEN} 83% / 88%), and eight stand. **Five of those eight are at `atk` 48 or under
 * and three are not** — {@link STILLWATER_ROOT} 1180/54 at 98% / 90%, {@link GOREHIDE_MATRIARCH}
 * 1020/58 at 93% / 100% and {@link SILTCROWN_CANOPY} 860/70 at 100% / 100% — which is why this is a
 * list rather than a threshold.
 *
 * ⚠️ **The hundred fields no sustain, no taunt, no link and no reflect** — the same discipline as the
 * Thicket's, and stated in counts because the absolute form of this claim has shipped wrong five times
 * across the towers: of the **38** blocks the hundred fields, **zero** carry `lifeLeech`, `recovery` or
 * `healthRegen`, **zero** carry a heal, a drain or a shield effect, **zero** carry a `regen` status, and
 * **zero** carry a taunt, a link or a reflect.
 *
 * ⚠️ **One board-wide turn per board, held mechanically and counted the way the Thicket counted it** —
 * bodies carrying a turn aimed at `enemy-all`, `enemy-row-front` or `enemy-row-back`. The hundred runs a
 * **mean of 0.08 and a maximum of one**, against the Thicket's 0.58 and this tower's third and fourth
 * hundreds at 1.08 with a peak of three and 0.86 with a peak of four. The draft had one board carrying
 * two, both from returning texture. **Count the voices per board with a script; nobody reads a hundred
 * boards and notices.**
 *
 * ⚠️ **The lean overshoot was budgeted rather than discovered, and the fix was who carries the axis.**
 * The Thicket's first pass came out at **94.8% Elf** because its three new carriers and its roof were
 * all Elven and stood on nearly every board — 244 of 500 slots spoken for before a texture body was
 * chosen. This hundred split the four **two Elf, one Demon, one Monster**, both of which also counter
 * Undead (Demons at ×1.1, Monsters at ×1.05), so the two carriers standing on almost every board cost
 * the lean nothing at all. It ships at **53.2% Elf** and takes the tower to **59.03%**, down from
 * 60.2%. **Decide the carrier density and the carriers' factions together.**
 *
 * ## What the bands measure at
 *
 * Band 6 opens at floor 501 in 8.6 seconds with all five alive and **costs the reference five its first
 * member at floor 523 and the alternate at 543**. From there: 4.80 / 5.00 at 530, 4.70 / 4.80 at 550,
 * 4.00 / 4.08 at 560, 2.73 / 3.95 at 570, 1.90 / 2.92 at 580, 2.08 / 3.27 at 590, 1.70 / 2.23 at 595
 * and **1.27 / 1.82 at the roof** — 98% for the reference five and 93% for the alternate, against bars
 * of 90% and 75%. Every one of the hundred floors clears both bars, the worst reading anywhere is 95%
 * and 93%, there are **no timeouts**, and the longest single attempt is **22.8 seconds**.
 *
 * ⚠️ **The axis carries the last floor.** Floor 600 with the whole board's amplifiers dropped to the
 * pool median of 0.70 reads 100% / 2.00 and 100% / 3.13 against the shipped 98% / 1.27 and 93% / 1.82 —
 * worth **0.73 of the reference five and 1.31 of the alternate** on the top floor of the tower, and
 * 0.37 / 0.71 at floor 590.
 *
 * Band 5 opens at floor 401 in 5.6 seconds with all five alive and **costs the reference five its
 * first member at floor 430 and the alternate at 439**. From there: 4.67 / 5.00 at 440, 4.00 / 4.00
 * at 450, 3.00 / 4.00 at 460, 2.15 / 3.65 at 470, 2.02 / 3.17 at 480, 1.80 / 2.48 at 490 and
 * **1.20 / 2.23 at the roof** — 95% for the reference five and 100% for the alternate, against bars
 * of 90% and 75%. Every one of the
 * hundred floors clears both bars, there are **no timeouts anywhere**, and the longest single attempt
 * is **25.0 seconds**.
 *
 * ⚠️ **The axis carries the last floor.** Floor 500 with the roof's and its escort's `attackSpeed`
 * stripped to zero reads 100% with 2.25 of five against the shipped 95% with 1.20 — worth **1.05 of
 * the reference five and 1.77 of the alternate** on the top floor.
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
 * floor 100, at 51.2 seconds.** The six hundreds' longest fights run **51.2, 39.6, 41.4, 24.3, 25.0 and
 * 22.8**. Against the balance sweep's bound on a *cleared* fight (0.75 × the ninety-second timer, so
 * 67.5s) that shipped board is still the binding case for this tower — six hundred floors on, and by
 * more than twenty seconds — and it is the reason the Green Vigil's heal is the last one on the climb
 * rather than the shape any roof is built from.
 *
 * ⚠️ **A superlative goes stale the moment the next hundred lands, so the list is stated rather than
 * the claim — and the fifth hundred is where the direction it recorded stopped holding.** Four
 * hundreds running had each closed *faster* than the one below; the fifth closes 0.7 seconds slower
 * than the fourth and the sixth closes 2.2 seconds faster than the fifth. **A run of four is a run, not
 * a law, and so is a reversal of one**: the fourth hundred spent its whole budget on rate and let the
 * weight fall away and had nothing left to take out, where the sixth bought its difficulty on an
 * amplifier costing +1.9 seconds and could afford to take more weight out again. The claim to keep is
 * the one underneath both — every hundred on this tower has to buy its difficulty as far from the clock
 * as it can — and **22.8s against a 67.5s bar** is what that looks like on the axis that costs the
 * fewest seconds of anything measured here.
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
    // The Sunward Reach — Floors 121–140, levels 57–66 — evasion is the board rather than a body on it, and the Chanters take the weight out of whatever still lands.
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
    // -------------------------------------------------------------------------------------
    // The Thicket — Floors 401–420, levels 189–198, Masterwork 1–24 — a coppice left uncut for three hundred floors is not a wood, it is a wall of shoots. One of them a board, and behind it everything that was still standing.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f401',
      name: 'Floor 401',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [HOLLOWBARK_SENTRY, EMBERSHELL_WHELP, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f402',
      name: 'Floor 402',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [HOLLOWBARK_SENTRY, EMBERSHELL_WHELP, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f403',
      name: 'Floor 403',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [HOLLOWBARK_SENTRY, EMBERSHELL_WHELP, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f404',
      name: 'Floor 404',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [HOLLOWBARK_SENTRY, EMBERSHELL_WHELP, LUMEN_ACOLYTE],
      },
    },
    {
      id: 't-undead-f405',
      name: 'Floor 405',
      enemies: {
        front: [OVERBURDEN_HULK, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f406',
      name: 'Floor 406',
      enemies: {
        front: [OVERBURDEN_HULK, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f407',
      name: 'Floor 407',
      enemies: {
        front: [OVERBURDEN_HULK, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f408',
      name: 'Floor 408',
      enemies: {
        front: [OVERBURDEN_HULK, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f409',
      name: 'Floor 409',
      enemies: {
        front: [OVERBURDEN_HULK, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f410',
      name: 'Floor 410 — The Thicket',
      enemies: {
        front: [THE_SEEDFATHER, SUCKERWOOD_WHIP],
        back: [SCALEPLATE_BRAMBLE, CINDER_CULLER, EMBERSHELL_WHELP],
      },
    },
    {
      id: 't-undead-f411',
      name: 'Floor 411',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [CHALKHIDE_BROWSER, EMBERSHELL_WHELP, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f412',
      name: 'Floor 412',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [CHALKHIDE_BROWSER, EMBERSHELL_WHELP, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f413',
      name: 'Floor 413',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [CHALKHIDE_BROWSER, EMBERSHELL_WHELP, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f414',
      name: 'Floor 414',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [CHALKHIDE_BROWSER, EMBERSHELL_WHELP, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f415',
      name: 'Floor 415',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [CHALKHIDE_BROWSER, EMBERSHELL_WHELP, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f416',
      name: 'Floor 416',
      enemies: {
        front: [CLOSEWARD_SERAPH, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, SHARDLIGHT_ACOLYTE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f417',
      name: 'Floor 417',
      enemies: {
        front: [CLOSEWARD_SERAPH, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, SHARDLIGHT_ACOLYTE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f418',
      name: 'Floor 418',
      enemies: {
        front: [CLOSEWARD_SERAPH, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, SHARDLIGHT_ACOLYTE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f419',
      name: 'Floor 419',
      enemies: {
        front: [CLOSEWARD_SERAPH, SUCKERWOOD_WHIP],
        back: [MIREMAST_TRUNK, SHARDLIGHT_ACOLYTE, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f420',
      name: 'Floor 420 — The Thicket',
      enemies: {
        front: [THE_SPRINGWOOD, SUCKERWOOD_WHIP],
        back: [SCALEPLATE_BRAMBLE, ASHPIT_SCUTTLER, MIREWHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Suckerwood — Floors 421–445, levels 199–210, Masterwork 25–54 — sucker growth off the old stools, two abreast. Neither is heavy and neither stops swinging.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f421',
      name: 'Floor 421',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, CHALKHIDE_BROWSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f422',
      name: 'Floor 422',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, CHALKHIDE_BROWSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f423',
      name: 'Floor 423',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, CHALKHIDE_BROWSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f424',
      name: 'Floor 424',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, CHALKHIDE_BROWSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f425',
      name: 'Floor 425',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, CHALKHIDE_BROWSER, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f426',
      name: 'Floor 426',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f427',
      name: 'Floor 427',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f428',
      name: 'Floor 428',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f429',
      name: 'Floor 429',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f430',
      name: 'Floor 430 — The Suckerwood',
      enemies: {
        front: [THE_SEEDFATHER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, MIREMAST_TRUNK, ASHPIT_SCUTTLER],
      },
    },
    {
      id: 't-undead-f431',
      name: 'Floor 431',
      enemies: {
        front: [OVERBURDEN_HULK, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f432',
      name: 'Floor 432',
      enemies: {
        front: [OVERBURDEN_HULK, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f433',
      name: 'Floor 433',
      enemies: {
        front: [OVERBURDEN_HULK, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f434',
      name: 'Floor 434',
      enemies: {
        front: [OVERBURDEN_HULK, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f435',
      name: 'Floor 435',
      enemies: {
        front: [OVERBURDEN_HULK, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f436',
      name: 'Floor 436',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f437',
      name: 'Floor 437',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f438',
      name: 'Floor 438',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f439',
      name: 'Floor 439',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, SLAGSEAM_FLENSER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f440',
      name: 'Floor 440 — The Suckerwood',
      enemies: {
        front: [DROWNED_MAST, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, EVENSONG_WARDEN, CINDER_CULLER],
      },
    },
    {
      id: 't-undead-f441',
      name: 'Floor 441',
      enemies: {
        front: [CLOSEWARD_SERAPH, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-undead-f442',
      name: 'Floor 442',
      enemies: {
        front: [CLOSEWARD_SERAPH, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-undead-f443',
      name: 'Floor 443',
      enemies: {
        front: [CLOSEWARD_SERAPH, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-undead-f444',
      name: 'Floor 444',
      enemies: {
        front: [CLOSEWARD_SERAPH, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },
    {
      id: 't-undead-f445',
      name: 'Floor 445',
      enemies: {
        front: [CLOSEWARD_SERAPH, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, REDWATER_STALKER, SCREEBACK_DARTER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Brake — Floors 446–467, levels 210–220, Masterwork 55–80 — three, and the last of the heartwood goes with them. What the boards give up in attack they take back in the beat.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f446',
      name: 'Floor 446',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f447',
      name: 'Floor 447',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f448',
      name: 'Floor 448',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f449',
      name: 'Floor 449',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f450',
      name: 'Floor 450 — The Brake',
      enemies: {
        front: [REDWATER_STALKER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, EVENSONG_WARDEN],
      },
    },
    {
      id: 't-undead-f451',
      name: 'Floor 451',
      enemies: {
        front: [EVENSONG_WARDEN, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f452',
      name: 'Floor 452',
      enemies: {
        front: [EVENSONG_WARDEN, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f453',
      name: 'Floor 453',
      enemies: {
        front: [EVENSONG_WARDEN, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f454',
      name: 'Floor 454',
      enemies: {
        front: [EVENSONG_WARDEN, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f455',
      name: 'Floor 455',
      enemies: {
        front: [EVENSONG_WARDEN, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f456',
      name: 'Floor 456',
      enemies: {
        front: [DROWNED_MAST, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f457',
      name: 'Floor 457',
      enemies: {
        front: [DROWNED_MAST, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f458',
      name: 'Floor 458',
      enemies: {
        front: [DROWNED_MAST, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f459',
      name: 'Floor 459',
      enemies: {
        front: [DROWNED_MAST, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f460',
      name: 'Floor 460 — The Brake',
      enemies: {
        front: [THORNBACK_GRAZER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f461',
      name: 'Floor 461',
      enemies: {
        front: [GILDED_SENTRY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f462',
      name: 'Floor 462',
      enemies: {
        front: [GILDED_SENTRY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f463',
      name: 'Floor 463',
      enemies: {
        front: [GILDED_SENTRY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f464',
      name: 'Floor 464',
      enemies: {
        front: [GILDED_SENTRY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f465',
      name: 'Floor 465',
      enemies: {
        front: [GILDED_SENTRY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f466',
      name: 'Floor 466',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f467',
      name: 'Floor 467',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Covert — Floors 468–485, levels 221–229, Relic 2–22 — the grade steps down at the boundary, so the band opens heavier than the one it follows. The wood closes over and nothing here is slow.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f468',
      name: 'Floor 468',
      enemies: {
        front: [THE_HAIRLINE, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, THINWOOD_HARRIER],
      },
    },
    {
      id: 't-undead-f469',
      name: 'Floor 469',
      enemies: {
        front: [THE_HAIRLINE, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, THINWOOD_HARRIER],
      },
    },
    {
      id: 't-undead-f470',
      name: 'Floor 470 — The Covert',
      enemies: {
        front: [THE_SPRINGWOOD, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f471',
      name: 'Floor 471',
      enemies: {
        front: [THE_LAST_RING, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, UNSPOKEN_CANON],
      },
    },
    {
      id: 't-undead-f472',
      name: 'Floor 472',
      enemies: {
        front: [THE_LAST_RING, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, UNSPOKEN_CANON],
      },
    },
    {
      id: 't-undead-f473',
      name: 'Floor 473',
      enemies: {
        front: [THE_LAST_RING, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, UNSPOKEN_CANON],
      },
    },
    {
      id: 't-undead-f474',
      name: 'Floor 474',
      enemies: {
        front: [THE_LAST_RING, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, UNSPOKEN_CANON],
      },
    },
    {
      id: 't-undead-f475',
      name: 'Floor 475',
      enemies: {
        front: [THE_LAST_RING, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, UNSPOKEN_CANON],
      },
    },
    {
      id: 't-undead-f476',
      name: 'Floor 476',
      enemies: {
        front: [THE_UNHURRIED, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f477',
      name: 'Floor 477',
      enemies: {
        front: [THE_UNHURRIED, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f478',
      name: 'Floor 478',
      enemies: {
        front: [THE_UNHURRIED, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f479',
      name: 'Floor 479',
      enemies: {
        front: [THE_UNHURRIED, BRAKETHORN_FLAIL],
        back: [SUCKERWOOD_WHIP, COVERT_REAVER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-undead-f480',
      name: 'Floor 480 — The Covert',
      enemies: {
        front: [STILLWATER_ROOT, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f481',
      name: 'Floor 481',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f482',
      name: 'Floor 482',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f483',
      name: 'Floor 483',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f484',
      name: 'Floor 484',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    {
      id: 't-undead-f485',
      name: 'Floor 485',
      enemies: {
        front: [GOREHIDE_MATRIARCH, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, SLAGSEAM_FLENSER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Blackthorn — Floors 486–500, levels 229–236, Relic 23–40 — four, and no heartwood left at all. Blackthorn is the last thing to grow where a wood was, and it is all edge.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f486',
      name: 'Floor 486',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f487',
      name: 'Floor 487',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f488',
      name: 'Floor 488',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f489',
      name: 'Floor 489',
      enemies: {
        front: [DUSTPLATE_GRINDER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f490',
      name: 'Floor 490 — The Blackthorn',
      enemies: {
        front: [GALLERY_SLIPFANG, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, BRAKETHORN_FLAIL, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f491',
      name: 'Floor 491',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f492',
      name: 'Floor 492',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f493',
      name: 'Floor 493',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f494',
      name: 'Floor 494',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f495',
      name: 'Floor 495',
      enemies: {
        front: [SILTCROWN_CANOPY, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, COVERT_REAVER],
      },
    },
    {
      id: 't-undead-f496',
      name: 'Floor 496',
      enemies: {
        front: [RIFTSTEP_REAVER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f497',
      name: 'Floor 497',
      enemies: {
        front: [RIFTSTEP_REAVER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f498',
      name: 'Floor 498',
      enemies: {
        front: [RIFTSTEP_REAVER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f499',
      name: 'Floor 499',
      enemies: {
        front: [RIFTSTEP_REAVER, SUCKERWOOD_WHIP],
        back: [BRAKETHORN_FLAIL, COVERT_REAVER, MIREWHELP],
      },
    },
    {
      id: 't-undead-f500',
      name: 'Floor 500 — The Blackthorn',
      enemies: {
        front: [THE_BLACKTHORN, LUMEN_ACOLYTE],
        back: [COVERT_REAVER, LUMEN_ACOLYTE, LUMEN_ACOLYTE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Standing Wood — Floors 501–520, levels 236–245, Relic 41–52 — the old boles are still here and still heavy, and the first wedge goes in behind them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f501',
      name: 'Floor 501',
      enemies: {
        front: [RINGBARK_ELDER, MIREMAST_TRUNK],
        back: [SUCKERWOOD_WHIP, RUSTLEAF_GLEANER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f502',
      name: 'Floor 502',
      enemies: {
        front: [RINGBARK_ELDER, SCALEPLATE_BRAMBLE],
        back: [SUCKERWOOD_WHIP, RUSTLEAF_GLEANER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f503',
      name: 'Floor 503',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, MIREMAST_TRUNK],
        back: [BRAKETHORN_FLAIL, RUSTLEAF_GLEANER, THORNLING],
      },
    },
    {
      id: 't-undead-f504',
      name: 'Floor 504',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, SCALEPLATE_BRAMBLE],
        back: [BRAKETHORN_FLAIL, SHARDLIGHT_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-undead-f505',
      name: 'Floor 505',
      enemies: {
        front: [IRONBARK_WARDEN, HOLLOWBARK_SENTRY],
        back: [SUCKERWOOD_WHIP, SHARDLIGHT_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f506',
      name: 'Floor 506',
      enemies: {
        front: [IRONBARK_WARDEN, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f507',
      name: 'Floor 507',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SHARDLIGHT_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-undead-f508',
      name: 'Floor 508',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, BRAKETHORN_FLAIL, THORNLING],
      },
    },
    {
      id: 't-undead-f509',
      name: 'Floor 509',
      enemies: {
        front: [STILLWATER_ROOT, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SUCKERWOOD_WHIP, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f510',
      name: 'Floor 510 — The Standing Bole',
      enemies: {
        front: [STILLWATER_ROOT, RINGBARK_ELDER],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f511',
      name: 'Floor 511',
      enemies: {
        front: [SLOWGROWTH_BOLE, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, BRAKETHORN_FLAIL, THORNLING],
      },
    },
    {
      id: 't-undead-f512',
      name: 'Floor 512',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, SLOWGROWTH_BOLE],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f513',
      name: 'Floor 513',
      enemies: {
        front: [IRONBARK_WARDEN, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SHARDLIGHT_ACOLYTE, THORNLING],
      },
    },
    {
      id: 't-undead-f514',
      name: 'Floor 514',
      enemies: {
        front: [CHALKHIDE_BROWSER, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SUCKERWOOD_WHIP, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f515',
      name: 'Floor 515',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, BRAKETHORN_FLAIL, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f516',
      name: 'Floor 516',
      enemies: {
        front: [RINGBARK_ELDER, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, THORNLING],
      },
    },
    {
      id: 't-undead-f517',
      name: 'Floor 517',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SUCKERWOOD_WHIP, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f518',
      name: 'Floor 518',
      enemies: {
        front: [IRONBARK_WARDEN, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, BRAKETHORN_FLAIL, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f519',
      name: 'Floor 519',
      enemies: {
        front: [STILLWATER_ROOT, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, THORNLING],
      },
    },
    {
      id: 't-undead-f520',
      name: 'Floor 520 — The First Wedge',
      enemies: {
        front: [STILLWATER_ROOT, DEEPMAST_HEARTWOOD],
        back: [EMBERWEDGE_DRIVER, SUCKERWOOD_WHIP, GLADE_STALKER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Wedge Goes In — Floors 521–545, levels 246–257, Relic 53–67 — two amplifiers a board and the weight beginning to leave. The Elf boles thin out and the cold Monster bulk takes over from them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f521',
      name: 'Floor 521',
      enemies: {
        front: [CHALKHIDE_BROWSER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f522',
      name: 'Floor 522',
      enemies: {
        front: [SLOWGROWTH_BOLE, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, BRAKETHORN_FLAIL, THORNLING],
      },
    },
    {
      id: 't-undead-f523',
      name: 'Floor 523',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SHARDLIGHT_ACOLYTE, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f524',
      name: 'Floor 524',
      enemies: {
        front: [IRONBARK_WARDEN, ILLFALL_SKULKER],
        back: [EMBERWEDGE_DRIVER, RUSTLEAF_GLEANER, THORNLING],
      },
    },
    {
      id: 't-undead-f525',
      name: 'Floor 525',
      enemies: {
        front: [SHALEBED_CRAWLER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f526',
      name: 'Floor 526',
      enemies: {
        front: [DEEPMAST_HEARTWOOD, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f527',
      name: 'Floor 527',
      enemies: {
        front: [SLOWGROWTH_BOLE, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SUCKERWOOD_WHIP, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f528',
      name: 'Floor 528',
      enemies: {
        front: [CHALKHIDE_BROWSER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f529',
      name: 'Floor 529',
      enemies: {
        front: [SCATTERSTONE_HOWLER, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f530',
      name: 'Floor 530 — The Second Wedge',
      enemies: {
        front: [CENTURYBOUGH_WARDEN, SHALEBED_CRAWLER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, RUSTLEAF_GLEANER],
      },
    },
    {
      id: 't-undead-f531',
      name: 'Floor 531',
      enemies: {
        front: [SLOWGROWTH_BOLE, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f532',
      name: 'Floor 532',
      enemies: {
        front: [SCATTERSTONE_HOWLER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f533',
      name: 'Floor 533',
      enemies: {
        front: [CHALKHIDE_BROWSER, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f534',
      name: 'Floor 534',
      enemies: {
        front: [ROUGHCAST_GNAWER, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f535',
      name: 'Floor 535',
      enemies: {
        front: [SHALEBED_CRAWLER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f536',
      name: 'Floor 536',
      enemies: {
        front: [SLOWGROWTH_BOLE, ILLFALL_SKULKER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, RUSTLEAF_GLEANER],
      },
    },
    {
      id: 't-undead-f537',
      name: 'Floor 537',
      enemies: {
        front: [SCATTERSTONE_HOWLER, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f538',
      name: 'Floor 538',
      enemies: {
        front: [ROUGHCAST_GNAWER, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f539',
      name: 'Floor 539',
      enemies: {
        front: [CHALKHIDE_BROWSER, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, SHARDLIGHT_ACOLYTE],
      },
    },
    {
      id: 't-undead-f540',
      name: 'Floor 540 — The Grain Found',
      enemies: {
        front: [SHALEBED_CRAWLER, SCATTERSTONE_HOWLER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f541',
      name: 'Floor 541',
      enemies: {
        front: [ROUGHCAST_GNAWER, MIREMAST_TRUNK],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f542',
      name: 'Floor 542',
      enemies: {
        front: [SCATTERSTONE_HOWLER, GLASSBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, RUSTLEAF_GLEANER],
      },
    },
    {
      id: 't-undead-f543',
      name: 'Floor 543',
      enemies: {
        front: [ILLFALL_SKULKER, SCALEPLATE_BRAMBLE],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f544',
      name: 'Floor 544',
      enemies: {
        front: [ROUGHCAST_GNAWER, HOLLOWBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f545',
      name: 'Floor 545',
      enemies: {
        front: [SHALEBED_CRAWLER, GLASSBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, SHARDLIGHT_ACOLYTE],
      },
    },
    // -------------------------------------------------------------------------------------
    // Along the Grain — Floors 546–567, levels 258–267, Relic 68–80 — no Elf bole is left standing and nothing on a board is both heavy and hot; what is left of them is what a crit is worth.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f546',
      name: 'Floor 546',
      enemies: {
        front: [ROUGHCAST_GNAWER, GREYLEAF_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f547',
      name: 'Floor 547',
      enemies: {
        front: [ILLFALL_SKULKER, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f548',
      name: 'Floor 548',
      enemies: {
        front: [SCATTERSTONE_HOWLER, GREYLEAF_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f549',
      name: 'Floor 549',
      enemies: {
        front: [ROUGHCAST_GNAWER, BREAKSTONE_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f550',
      name: 'Floor 550 — The Long Split',
      enemies: {
        front: [ILLFALL_SKULKER, GLASSBARK_SENTRY],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, RUSTLEAF_GLEANER],
      },
    },
    {
      id: 't-undead-f551',
      name: 'Floor 551',
      enemies: {
        front: [GREYLEAF_WARDEN, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f552',
      name: 'Floor 552',
      enemies: {
        front: [BREAKSTONE_WARDEN, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f553',
      name: 'Floor 553',
      enemies: {
        front: [ILLFALL_SKULKER, GREYLEAF_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f554',
      name: 'Floor 554',
      enemies: {
        front: [ROUGHCAST_GNAWER, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f555',
      name: 'Floor 555',
      enemies: {
        front: [BREAKSTONE_WARDEN, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f556',
      name: 'Floor 556',
      enemies: {
        front: [GREYLEAF_WARDEN, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f557',
      name: 'Floor 557',
      enemies: {
        front: [ILLFALL_SKULKER, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f558',
      name: 'Floor 558',
      enemies: {
        front: [BREAKSTONE_WARDEN, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f559',
      name: 'Floor 559',
      enemies: {
        front: [GREYLEAF_WARDEN, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f560',
      name: 'Floor 560 — The Opened Log',
      enemies: {
        front: [ILLFALL_SKULKER, BREAKSTONE_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f561',
      name: 'Floor 561',
      enemies: {
        front: [GREYLEAF_WARDEN, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f562',
      name: 'Floor 562',
      enemies: {
        front: [BREAKSTONE_WARDEN, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f563',
      name: 'Floor 563',
      enemies: {
        front: [DULLEDGE_BRIAR, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f564',
      name: 'Floor 564',
      enemies: {
        front: [GREYLEAF_WARDEN, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f565',
      name: 'Floor 565',
      enemies: {
        front: [BREAKSTONE_WARDEN, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f566',
      name: 'Floor 566',
      enemies: {
        front: [GREYLEAF_WARDEN, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f567',
      name: 'Floor 567',
      enemies: {
        front: [BREAKSTONE_WARDEN, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Froe and the Mallet — Floors 568–585, levels 268–276, Relic 81–91 — the lieutenant arrives and the third amplifier with it.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f568',
      name: 'Floor 568',
      enemies: {
        front: [GREYLEAF_WARDEN, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f569',
      name: 'Floor 569',
      enemies: {
        front: [DULLEDGE_BRIAR, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f570',
      name: 'Floor 570 — The Froe Set',
      enemies: {
        front: [RIVENBOUGH_FROE, GREYLEAF_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f571',
      name: 'Floor 571',
      enemies: {
        front: [BREAKSTONE_WARDEN, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f572',
      name: 'Floor 572',
      enemies: {
        front: [RIVENBOUGH_FROE, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f573',
      name: 'Floor 573',
      enemies: {
        front: [DULLEDGE_BRIAR, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f574',
      name: 'Floor 574',
      enemies: {
        front: [RIVENBOUGH_FROE, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f575',
      name: 'Floor 575',
      enemies: {
        front: [GREYLEAF_WARDEN, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f576',
      name: 'Floor 576',
      enemies: {
        front: [RIVENBOUGH_FROE, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f577',
      name: 'Floor 577',
      enemies: {
        front: [BREAKSTONE_WARDEN, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f578',
      name: 'Floor 578',
      enemies: {
        front: [RIVENBOUGH_FROE, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, SNAPWOOD_HARRIER],
      },
    },
    {
      id: 't-undead-f579',
      name: 'Floor 579',
      enemies: {
        front: [GREYLEAF_WARDEN, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f580',
      name: 'Floor 580 — The Mallet Falls',
      enemies: {
        front: [RIVENBOUGH_FROE, BREAKSTONE_WARDEN],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, GLADE_STALKER],
      },
    },
    {
      id: 't-undead-f581',
      name: 'Floor 581',
      enemies: {
        front: [DULLEDGE_BRIAR, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    {
      id: 't-undead-f582',
      name: 'Floor 582',
      enemies: {
        front: [RIVENBOUGH_FROE, EVENLIGHT_TENDER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, SNAPWOOD_HARRIER],
      },
    },
    {
      id: 't-undead-f583',
      name: 'Floor 583',
      enemies: {
        front: [GREYLEAF_WARDEN, SHADOWLESS_DANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f584',
      name: 'Floor 584',
      enemies: {
        front: [RIVENBOUGH_FROE, ROOTPLATE_CLIMBER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f585',
      name: 'Floor 585',
      enemies: {
        front: [RIVENBOUGH_FROE, DULLEDGE_BRIAR],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, NOONLESS_ARCHER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Shakes — Floors 586–595, levels 276–281, Relic 92–97 — three amplifiers on every board and nothing anywhere in the band heavier than four hundred.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f586',
      name: 'Floor 586',
      enemies: {
        front: [RIVENBOUGH_FROE, SNAPWOOD_HARRIER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f587',
      name: 'Floor 587',
      enemies: {
        front: [RIVENBOUGH_FROE, CROWNFALL_DARTER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, FLATSHADE_STALKER],
      },
    },
    {
      id: 't-undead-f588',
      name: 'Floor 588',
      enemies: {
        front: [RIVENBOUGH_FROE, THORNLING],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CROWNFALL_DARTER],
      },
    },
    {
      id: 't-undead-f589',
      name: 'Floor 589',
      enemies: {
        front: [RIVENBOUGH_FROE, SNAPWOOD_HARRIER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f590',
      name: 'Floor 590 — The Shakes',
      enemies: {
        front: [RIVENBOUGH_FROE, GLADE_STALKER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CROWNFALL_DARTER],
      },
    },
    {
      id: 't-undead-f591',
      name: 'Floor 591',
      enemies: {
        front: [RIVENBOUGH_FROE, CROWNFALL_DARTER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f592',
      name: 'Floor 592',
      enemies: {
        front: [RIVENBOUGH_FROE, SNAPWOOD_HARRIER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, THORNLING],
      },
    },
    {
      id: 't-undead-f593',
      name: 'Floor 593',
      enemies: {
        front: [RIVENBOUGH_FROE, BAREMARK_GNAWER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CROWNFALL_DARTER],
      },
    },
    {
      id: 't-undead-f594',
      name: 'Floor 594',
      enemies: {
        front: [RIVENBOUGH_FROE, THORNLING],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f595',
      name: 'Floor 595',
      enemies: {
        front: [RIVENBOUGH_FROE, CROWNFALL_DARTER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, BAREMARK_GNAWER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Heartshake — Floors 596–600, levels 281–283, Relic 98–100 — five floors, each measured on its own, and the split the wood was always going to take at the top of them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-undead-f596',
      name: 'Floor 596',
      enemies: {
        front: [RIVENBOUGH_FROE, SNAPWOOD_HARRIER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f597',
      name: 'Floor 597',
      enemies: {
        front: [RIVENBOUGH_FROE, SHAKEWOOD_LANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, BAREMARK_GNAWER],
      },
    },
    {
      id: 't-undead-f598',
      name: 'Floor 598',
      enemies: {
        front: [RIVENBOUGH_FROE, SHAKEWOOD_LANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f599',
      name: 'Floor 599',
      enemies: {
        front: [RIVENBOUGH_FROE, SHAKEWOOD_LANCER],
        back: [EMBERWEDGE_DRIVER, SPLITMAW_RENDER, CHANNELBED_STALKER],
      },
    },
    {
      id: 't-undead-f600',
      name: 'Floor 600 — The Heartshake',
      enemies: {
        front: [THE_HEARTSHAKE, RIVENBOUGH_FROE],
        back: [EMBERWEDGE_DRIVER, CHANNELBED_STALKER, CROWNFALL_DARTER],
      },
    },
  ],
} as const;
