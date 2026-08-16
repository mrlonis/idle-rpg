/**
 * Gear: the grade ladder, what each piece is worth, and what it costs.
 *
 * Plain data, like everything in `data/`. `core/gear/` evaluates all of it and
 * [`gear.spec.ts`](./gear.spec.ts) pins the results where they matter — derived from these numbers
 * rather than retyped beside them, so retuning a grade re-runs every figure below.
 *
 * ## Every number here is a percentage of the wearer's own stat
 *
 * The full argument is in [`core/gear/types.ts`](../core/gear/types.ts); the short version is that
 * levelling is worth ×10⁹ and ascension ×450, so a flat quantity authored today is a rounding error
 * by level 400 and would need a second exponential to keep pace. A percentage is worth the same
 * proportion at level 1 and at level 1000, and — because it is a multiplication — it commutes with
 * the whole-board rescale `simulate.spec.ts` asserts is an identity.
 *
 * ## Where it lands
 *
 * A full five-piece set at the top grade, fully enhanced, unaligned:
 *
 * | Archetype | hp    | atk   | def  | haste |
 * | --------- | ----- | ----- | ---- | ----- |
 * | tank      | +166% | +46%  | +68% | +19%  |
 * | brawler   | +112% | +89%  | +43% | +31%  |
 * | mage      | +73%  | +120% | +29% | +35%  |
 * | ranger    | +81%  | +112% | +29% | +43%  |
 * | support   | +128% | +58%  | +50% | +39%  |
 *
 * Four things that table is chosen to show:
 *
 * 1. **Gear is a third axis, not a fourth game.** Roughly ×2 on the two stats an archetype cares
 *    about is a real prize and is nowhere near the ×10⁹ the level curve pays or the ×450 the rung
 *    ladder pays. A player with no gear at all is behind, not locked out.
 * 2. **An archetype's gear says what the archetype is.** A tank's set is nearly four times the
 *    health bonus of a mage's and a third of the attack. The budgets behind them are within a few
 *    percent of each other — `gear.spec.ts` asserts that — so this is emphasis rather than one
 *    archetype getting more.
 * 3. ⚠️ **The defence column is deliberately half the size it looks like it should be, and that is
 *    a termination argument rather than a balance preference.** It was authored at twice these
 *    numbers and the ladder sweep went red on `c2-s23` (`c4-s13`, The Adamant Gate, since the
 *    six-chapter re-cut): a fully geared party ran the ninety
 *    seconds out against a stage it could not beat, which is the stall class milestone 8c's timer
 *    exists to bound and which the zero-timeout guard is there to catch.
 *
 *    The measurement behind the fix is the useful part. Sweeping the whole ladder with the
 *    defensive share at ×1, ×0.5 and ×0 clears **75, 74 and 74** stages respectively — so defence
 *    was buying one stage in fights the party wins, and a ninety-second stall in the fights it
 *    loses. That follows from the damage formula: `atk² / (atk + def)` has sharply diminishing
 *    returns once the attacker's `atk` outruns the defender's `def`, which is the situation on
 *    every stage tuned above the party — while `def` and `hp` multiply each other to extend a
 *    fight nobody is going to win.
 *
 *    Halving it keeps defence as an identity (a tank's is still more than twice a mage's) and
 *    takes the longest fight in the sweep from 90.0s back to 54.2s. **Do not put it back without
 *    re-running the sweep**; the guard will name the stage.
 * 4. ⚠️ **Haste is bounded and that bound is a termination argument, not a balance knob.** The
 *    largest haste bonus this table can produce is the ranger's +43%, or +55% once alignment is
 *    counted. The fastest character in the game is authored at 152 haste, so a fully geared,
 *    perfectly aligned ranger reaches about 236 against an `ATB_THRESHOLD` of 1000 — a quarter of
 *    the gauge. `content.ts` clamps haste to that threshold because the simulation's termination
 *    argument depends on nobody banking two actions in a tick, and a clamp that binds would make
 *    every geared character identically fast. `gear.spec.ts` derives the bound from these numbers
 *    rather than restating it.
 */

/**
 * The grade ladder, weakest first. A grade is an **index into this array**.
 *
 * Each rung is worth more twice over — a bigger multiplier and a higher enhancement ceiling — which
 * is the same arrangement `LEVEL_CURVE.caps` makes for characters: a rung is worth having partly
 * because of the headroom it unlocks. A relic at level 1 is barely better than a fine piece at
 * level 1; it is better because it can be taken to 100.
 *
 * **The names deliberately avoid every word this project already overloads.** `rare`, `elite`,
 * `legendary`, `mythic`, `ascended` and `common` are all spoken for — by `CharacterTier`, by
 * `RarityId`, or by `RarityFamily`, and [glossary](../../docs/glossary.md) already has to explain
 * three meanings of "rarity". A sixth ladder sharing those words would be the collision that
 * finally makes a sentence about this game unparseable, so gear gets its own vocabulary.
 *
 * `weight` is the drop distribution among the grades that are **unlocked**: `gradeWeights` starts
 * its tilt at 1 and multiplies it in with depth, so these are the numbers a reader can predict from
 * once a grade is available at all.
 *
 * ## `unlockIndex` gates the ladder, and the opening is one grade wide
 *
 * A grade cannot drop or be stocked below its `unlockIndex` on the linear stage index. Worn is
 * ungated, so the first ten stages hand out nothing else — every piece is comparable to every other
 * and a drop asks only which slot it fills. The gates then arrive roughly a band apart across the
 * shipped hundred stages:
 *
 * | Grade      | Unlocks at | Which is                        |
 * | ---------- | ---------- | ------------------------------- |
 * | Worn       | 1          | the opening                     |
 * | Sturdy     | 10         | the first mini-boss of ch. 1    |
 * | Fine       | 25         | the middle of chapter 1         |
 * | Masterwork | 45         | approaching chapter 1's boss    |
 * | Relic      | 70         | the middle of chapter 2         |
 *
 * ⚠️ **All five are reachable inside the two chapters this build ships**, and that is the constraint
 * the numbers are picked against rather than a happy accident. Gating a grade behind content that
 * does not exist makes it unreachable content, and four of five grades sat behind chapter 3 in the
 * first version of this idea. `gear.spec.ts` asserts every gate lands inside the shipped ladder, so
 * a gate authored past the end of the ladder is a failing test rather than a silent deletion.
 *
 * The soft tilt still runs on top of the gate, so crossing one widens the table rather than
 * replacing it — `gradeWeights` carries the full argument, including the position it reverses.
 */
export const GEAR_GRADES = [
  {
    id: 'worn',
    name: 'Worn',
    multiplier: 1.0,
    maxLevel: 20,
    salvage: 100,
    weight: 100,
    priceSeconds: 60,
    unlockIndex: 1,
  },
  {
    id: 'sturdy',
    name: 'Sturdy',
    multiplier: 1.35,
    maxLevel: 40,
    salvage: 240,
    weight: 46,
    priceSeconds: 260,
    unlockIndex: 10,
  },
  {
    id: 'fine',
    name: 'Fine',
    multiplier: 1.8,
    maxLevel: 60,
    salvage: 560,
    weight: 18,
    priceSeconds: 900,
    unlockIndex: 25,
  },
  {
    id: 'masterwork',
    name: 'Masterwork',
    multiplier: 2.35,
    maxLevel: 80,
    salvage: 1250,
    weight: 6,
    priceSeconds: 2600,
    unlockIndex: 45,
  },
  {
    id: 'relic',
    name: 'Relic',
    multiplier: 3.0,
    maxLevel: 100,
    salvage: 2700,
    weight: 1.6,
    priceSeconds: 7200,
    unlockIndex: 70,
  },
] as const;

/**
 * What each slot contributes, per archetype, as fractions of the wearer's base stat at grade ×1 and
 * level 1.
 *
 * ## The two axes, and why the table is written out rather than generated
 *
 * A profile is an archetype's **emphasis** crossed with a slot's **shape**. Every archetype splits
 * its budget across the five slots identically — head a fifth, arms the attack piece, chest the
 * health piece, legs the defence piece, boots the fast one — and what differs is the budget being
 * split. `data/` may hold no logic, so the cross product is spelled out; the spec re-derives the
 * per-archetype totals from it and asserts they stay within a band of each other, which is what
 * stops a hand-edited cell from quietly handing one archetype a bigger budget than the rest.
 *
 * **Boots own all the haste and nothing else does.** That was the brief and it is also the right
 * shape: haste is the one stat here with a hard ceiling, so concentrating it in one slot means the
 * bound is a statement about one piece rather than something that has to be re-derived every time
 * any other slot is retuned.
 *
 * **Chest carries no attack at all.** Not a rounding artefact — it is the piece that says "this
 * archetype survives things", and leaving it purely defensive means a player who only ever finds
 * chest pieces is building something coherent rather than a diluted version of everything.
 */
export const GEAR_PROFILES = {
  tank: {
    head: { hp: 0.0172, atk: 0.0048, def: 0.0035 },
    arms: { hp: 0.0069, atk: 0.012, def: 0.0014 },
    chest: { hp: 0.0344, def: 0.0056 },
    legs: { hp: 0.0206, atk: 0.0036, def: 0.0056 },
    boots: { hp: 0.0069, atk: 0.0036, def: 0.0014, haste: 0.01 },
  },
  brawler: {
    head: { hp: 0.0116, atk: 0.0092, def: 0.0022 },
    arms: { hp: 0.0046, atk: 0.023, def: 0.000875 },
    chest: { hp: 0.0232, def: 0.003525 },
    legs: { hp: 0.0139, atk: 0.0069, def: 0.003525 },
    boots: { hp: 0.0046, atk: 0.0069, def: 0.000875, haste: 0.016 },
  },
  mage: {
    head: { hp: 0.0076, atk: 0.0124, def: 0.0015 },
    arms: { hp: 0.003, atk: 0.031, def: 0.0006 },
    chest: { hp: 0.0152, def: 0.0024 },
    legs: { hp: 0.0091, atk: 0.0093, def: 0.0024 },
    boots: { hp: 0.003, atk: 0.0093, def: 0.0006, haste: 0.018 },
  },
  ranger: {
    head: { hp: 0.0084, atk: 0.0116, def: 0.0015 },
    arms: { hp: 0.0034, atk: 0.029, def: 0.0006 },
    chest: { hp: 0.0168, def: 0.0024 },
    legs: { hp: 0.0101, atk: 0.0087, def: 0.0024 },
    boots: { hp: 0.0034, atk: 0.0087, def: 0.0006, haste: 0.022 },
  },
  support: {
    head: { hp: 0.0132, atk: 0.006, def: 0.0026 },
    arms: { hp: 0.0053, atk: 0.015, def: 0.00105 },
    chest: { hp: 0.0264, def: 0.00415 },
    legs: { hp: 0.0158, atk: 0.0045, def: 0.00415 },
    boots: { hp: 0.0053, atk: 0.0045, def: 0.00105, haste: 0.02 },
  },
} as const;

/**
 * Everything that decides what gear is worth, what it costs, and where it comes from.
 *
 * ## The enhancement curve, and the gold claim it finally makes good on
 *
 * Four places in this codebase say gold's level-curve coefficient is the shallowest of the three
 * **because gear will spend it later**. This is later.
 *
 * | Grade      | Cap | Alloy to cap | Gold to cap |
 * | ---------- | --- | ------------ | ----------- |
 * | Worn       | 20  | 1,878        | 11,393      |
 * | Sturdy     | 40  | 8,875        | 88,272      |
 * | Fine       | 60  | 21,861       | 289,616     |
 * | Masterwork | 80  | 41,355       | 671,122     |
 * | Relic      | 100 | 67,753       | 1,286,557   |
 *
 * Kitting a party of five in fully enhanced relics is twenty-five pieces and about **32M gold**,
 * which at the 91 gold/s the top of chapter 2 pays is a hundred hours. Levelling one character to
 * 200 is about 6.4M, or twenty hours. So gear roughly doubles what gold is for, which takes it from
 * the loosest of the three levelling currencies to comparable with essence — the intended outcome
 * rather than a coincidence, and the reason the coefficient was left shallow in the first place.
 *
 * The alloy side is deliberately the softer constraint: 68k alloy is about 280 sturdy pieces
 * salvaged, and a stage clear drops at least one. A player who fights is never short of material;
 * what they are short of is gold, which is the axis this milestone was asked to load.
 *
 * ## Alignment is 30%, and it is a bonus rather than a gate
 *
 * A matching-faction piece is worth 1.3× what it would be on anybody else. Any character can wear
 * any piece — the restriction version was declined, because combined with the archetype gate a drop
 * would have had to match on two axes before it was worth anything, which is the "category of
 * answer you cannot buy" failure milestone 4 added a mortal healer to fix.
 *
 * Note what it is **not**: this does not favour mono-faction parties. Matching one character's
 * faction is one chance in eight per drop whether the party is mono or rainbow, so it does not
 * stack with the lineup bonus in the way a set bonus would. It is a reason to keep a piece for a
 * particular character, not a reason to build a particular party.
 */
export const GEAR_RULES = {
  grades: GEAR_GRADES,
  profiles: GEAR_PROFILES,

  /**
   * Growth in a piece's contribution per enhancement level above the first.
   *
   * **Linear, where the character curve is exponential**, and that is the one place gear
   * deliberately does not copy it. A piece at its grade's cap is worth about 6.4× what it was at
   * level 1; an exponential of the same reach would put a finished set several orders of magnitude
   * ahead of an empty one, at which point gear is not a third axis, it is the game.
   */
  perLevel: 0.055,

  alignmentBonus: 1.3,

  /**
   * How often a piece drops with no faction on it.
   *
   * Just over a third, so the remaining two thirds spread across seven factions leaves any one
   * specific faction at about 9%. An unaligned piece is not a worse piece — it is the one that is
   * equally good on everybody, which makes it the sensible thing to enhance first while a run is
   * still deciding who it is fielding.
   */
  unalignedChance: 0.35,

  enhance: {
    alloy: { coefficient: 6, exponent: 1.2 },
    // The steeper of the two by a wide margin, which is what makes gold the binding constraint
    // rather than material. See the table above.
    gold: { coefficient: 6, exponent: 1.9 },
  },

  /**
   * What a stage clear drops.
   *
   * **Every win drops at least one piece.** A drop *chance* was the alternative and it loses on
   * this project's own terms: a pull can never produce nothing, so neither should a fight, and a
   * piece that is useless to the party is still alloy. The bosses pay the chapter's rhythm here the
   * same way first-clear crystals do — and because the grade is rolled per piece, a boss dropping
   * six is six independent chances at a relic rather than one chance counted six times.
   *
   * **The count is a range rather than a number**, drawn once per fight. A fixed count makes every
   * ordinary clear identical, and the variance is what makes a drop an event rather than an
   * increment — the same reason the grade is rolled rather than assigned. The floors are the old
   * fixed counts, so nothing pays less than it did; the ceilings roughly double the average haul
   * (2 / 3.5 / 6 against 1 / 2 / 4).
   *
   * ⚠️ **This raises alloy income and fills the bag faster**, and both are bounded rather than
   * open-ended: `inventoryLimit` caps the bag and the overflow salvages, so more drops means more
   * material rather than a larger save. The floor of 1 is the part that is a rule — see
   * `GearDropRange` — and the ceilings are the part that is tuning.
   */
  drops: {
    normal: { min: 1, max: 3 },
    miniBoss: { min: 2, max: 5 },
    boss: { min: 4, max: 8 },
    /**
     * How sharply grade odds improve with the linear stage index.
     *
     * Two hundred and fifty. `gradeWeights` tilts by `1 + stageIndex / gradeSoftness`, so this
     * is a **rate per stage** and the ladder's length is the other half of every number it produces.
     * Lower makes the ladder's bottom worthless faster; higher makes depth stop meaning anything.
     *
     * ⚠️ **It has now been re-derived twelve times — by chapters 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 and 17 —
     * and every time deliberately rather than by moving the threshold that caught it.** At ninety the top grade
     * was 14.8% of drops over a hundred and fifty stages and **21.3%** over two hundred, past the
     * `< 0.2` bound in `gear.spec.ts` that exists to keep a relic a find rather than a routine drop;
     * a hundred put it at 18.7% over two hundred. Chapter 7 took the ladder to two hundred and fifty
     * and it read **24.5%**, so a hundred and twenty-five restored 18.7%. Chapter 8 took it to three
     * hundred and it read **23.4%**, and a hundred and fifty restored 18.7% again. Chapter 9 took it
     * to three hundred and fifty and it read **22.6%**, answered with a hundred and seventy-five.
     * Chapter 10 took it to four hundred and it read **22.1%**. Chapter 11 took it to four hundred
     * and fifty and it read **21.7%**. The Rustwood took it to five hundred and it read **21.3%**.
     * The Quarry took it to five hundred and fifty and it read **21.1%**; two hundred and
     * seventy-five restored 18.7%. The Shutgate took it to six hundred and it read **20.9%**; three
     * hundred restored 18.7%. The Underroad took it to six hundred and fifty and it read **20.7%**;
     * three hundred and twenty-five restored 18.7%. The Spoilfield took it to seven hundred and it
     * read **20.5%**; three hundred and fifty restored 18.7%. The Quickmire took it to seven
     * hundred and fifty and three hundred and seventy-five restored 18.7% for the twelfth time. The
     * Slowgrowth took it to eight hundred and it read **20.3%**; four hundred restored 18.7% for the
     * thirteenth time — **the value the previous entry predicted in writing, a chapter early.**
     *
     * ⚠️ **Thirteen landings and every one of them is 18.7%, which is the whole finding.** The solution
     * is always `gradeSoftness = stages / 2` — that is the value at which the tilt equals 3.0, and
     * 3.0 is what produces 18.7% whatever the ladder's length is. So the constant is not a tuning
     * number at all; it is the ladder's length divided by two, written down by hand once a chapter.
     *
     * ⚠️ **Enemy gear arriving in chapter 12 changed nothing here, and that is worth stating.** This
     * constant tilts what the *player* finds; an enemy's set is authored on the stage as a grade and
     * a level and never rolled, so it draws no weights and shifts no stream. The two uses of
     * `GEAR_GRADES` are deliberately independent.
     *
     * ⚠️ **This is a guard that fires every chapter forever, and the shape rather than the number is
     * what is wrong.** A tilt linear in the stage index has no ceiling, so the top grade's share
     * climbs without bound and no value of this constant is ever right for more than one chapter.
     * Milestone 21 forbade taking scope for this, so it is recorded rather than fixed: what it
     * eventually wants is a tilt that **saturates**. See [authoring](../../docs/authoring.md).
     *
     * ⚠️ **21b declined to write this value early — it would have bought the whole of milestone 21
     * in one edit — and the five landings are why that was right.** Had 200 been written then, the
     * fifth landing would have been silent and the "always `stages / 2`" finding would have been
     * three data points instead of five. The contrast is with `levels.spec.ts`'s ceiling ratio, which
     * 21a *did* re-derive four chapters ahead: that quantity is **meant** to fall as the ladder
     * grows, so batching it costs only vigilance, and it was retired outright in 21d. This one is not
     * meant to do anything, so firing on schedule is the only thing that will eventually force the
     * fix. **Chapter 19 landed on it and wanted 425, exactly as this line predicted — the twelfth
     * landing, the twelfth time the answer was `stages / 2`, and the first time the prediction was
     * written down a chapter in advance and then checked. Chapter 20 will want 450.**
     *
     * ⚠️ **Raising this is safe for the starter wall and lowering it would not be.** `gradeWeights`
     * raises the *whole* distribution's tilt, so the guard that three level-1 starters cannot gear
     * their way through the stage-7 lock is untouched — that test fields grade 0 at level 1
     * explicitly rather than rolling for it. The dial that would move it is Worn's own multiplier,
     * which sits at 0.175 against a 0.2 limit and is not free.
     */
    gradeSoftness: 425,
  },

  /**
   * The shop: six pieces, restocked hourly, priced in seconds of the run's own gold income.
   *
   * ⚠️ **Nothing about the stock is stored** — it is derived from the run's seed and the refresh
   * index, so there is nothing a force-quit could reroll. That is a stronger guarantee than
   * persisting the roll would give, and it costs the save two numbers instead of six items. See
   * `core/gear/shop.ts`.
   *
   * Six because the shop's job is to be the **targeted** source next to a drop table that is not:
   * a player who needs a mage chest piece can watch for one instead of waiting for the dice. Fewer
   * makes that wait indistinguishable from the dice; many more makes the hour meaningless.
   */
  shop: {
    offers: 6,
    refreshMs: 60 * 60 * 1000,
    /**
     * The gold rate a price is floored at.
     *
     * A price is `priceSeconds × the run's gold income`, and a brand-new run's income is zero — so
     * without a floor the opening shop would be free. This is the rate the first stage of the
     * ladder unlocks, which is the smallest non-zero income the game can produce, so the floor
     * binds for exactly as long as a run has cleared nothing.
     *
     * ⚠️ **Derived from `STAGE_REWARDS.baseRates.gold`, and `gear.spec.ts` asserts the equality**
     * rather than letting this drift into a number that used to be that rate. It moved from 0.5 to
     * 1 when the ladder's rates doubled, and that spec is what caught it.
     */
    minGoldPerSecond: 1,
  },

  /**
   * The most unequipped pieces the bag holds before the worst is salvaged automatically.
   *
   * **A bound is not optional and the size of it is not the interesting part.** Auto-battle clears
   * a stage a minute and every clear drops, so an unbounded bag is thousands of records in a save
   * that the repair pass walks on every load. What matters is that overflow is **salvaged rather
   * than refused**: the value of a drop is never lost, only the object, so a full bag costs a player
   * nothing they would have kept.
   *
   * 240 is roughly two of every slot-and-archetype pairing, which is enough to hold a spare set for
   * a whole party plus material, and small enough that the list stays something a person can scroll.
   */
  inventoryLimit: 240,
} as const;
