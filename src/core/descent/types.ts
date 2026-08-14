import { type EnemyFormationData, type StageKind } from '../battle/types';
import { type PartyFormation } from '../state';

/**
 * The Descent: one run a day, nine fights, damage that carries, and a card between each.
 *
 * ## What it adds that nothing else in this game does
 *
 * Every other fight in this project is decided at the crew editor and then watched. A campaign
 * stage, a tower floor and a bounty are all the same shape: arrange, confirm, observe. **This is
 * the only content that asks a question mid-flight** — the third fight's card depends on how the
 * second went, and a party three fights deep is not the party that entered.
 *
 * Two mechanics carry the whole of that, and both are *subtractive* rather than additive:
 *
 * - **Attrition.** Health and energy carry from fight to fight and a fallen member does not come
 *   back. So a clean win is worth more than a win, and the run's real currency is health.
 * - **A choice with an opportunity cost.** Three cards are offered and one is taken. Nothing is
 *   spent — but the two not taken are gone, which is the first genuinely irreversible decision in
 *   the game that is not an ascension.
 *
 * ## What it deliberately is not
 *
 * ⚠️ **Not a second ladder.** A run pays and resets; there is no descent-side position, no floor
 * that stays cleared, and nothing here touches `clearedStages`, the campaign position or an idle
 * rate — the same three fields `core/towers.ts` is fenced off from, for the same arithmetic
 * reason. What a run leaves behind is one integer, {@link GameState.descentRuns}.
 *
 * ⚠️ **Not a difficulty ladder either.** The enemy level is read off the campaign the run has
 * already cleared — see {@link DescentLevelData} — so nine authored boards stay a real fight
 * forever rather than decaying into empty squares as the party's own curve runs away. That is
 * milestone 10's argument applied to content that is fought once a day for the life of a run.
 *
 * ## Nothing about a day is stored except the day
 *
 * The boards are drawn from a pool and the daily faction lock is drawn from `FACTIONS`, both as a
 * function of the run's seed and the day index — the idiom `gearShopOffers` and `dailyBoard`
 * already use, and for the same three reasons: no save field, nothing to migrate, and ⚠️ **rerolling
 * is impossible rather than merely detectable.** Force-quitting cannot re-take a draw that is a pure
 * function of the seed and the day.
 *
 * `core/` still cannot see `data/`: the cards, the boards and the rules all arrive as arguments.
 */

/**
 * The stats a card may move.
 *
 * Seven rather than the four gear moves, and the three extra ones are exactly the three the
 * player asked for and gear cannot say: crit chance, crit damage and life leech.
 *
 * ⚠️ **The first four are fractions of the wearer's own stat and the last three are points added
 * to a bounded rate, and the split is a rescale argument rather than a convenience.** `hp`, `atk`,
 * `def` and `haste` are quantities that climb with the level curve, so anything *added* to one
 * would be a no-op at ×10⁹ and would break the whole-board rescale identity `simulate.spec.ts`
 * asserts. `critChance`, `critDamageAmp` and `lifeLeech` are probabilities and shares in `[0, 1]`;
 * a percentage of a roster that mostly sits low pays almost nothing, and points survive a rescale
 * untouched because nothing compares them against a scaling quantity. It is the same split
 * {@link LineupLadderStepData} already makes, and it is made here for the same reason.
 */
export const DESCENT_STATS = [
  'hp',
  'atk',
  'def',
  'haste',
  'critChance',
  'critDamageAmp',
  'lifeLeech',
] as const;

/** One of the stats a card may move. */
export type DescentStat = (typeof DESCENT_STATS)[number];

/**
 * What one card, or a whole run's worth of them, is worth.
 *
 * Absent means zero. **Summed rather than compounded**, exactly as a gear loadout is summed, and
 * for the same reason: compounding makes the *last* card the most valuable, which rewards a run for
 * how far it got rather than for what it chose.
 */
export type DescentBonus = Readonly<Partial<Record<DescentStat, number>>>;

/** A bonus that would leave a stat block exactly as it found it. */
export const NO_DESCENT_BONUS: DescentBonus = {};

/**
 * One family of cards, and what each of its rungs is worth.
 *
 * ## A family with rungs rather than fifty-six flat cards
 *
 * The player's rule is that a card already taken may come back **only at a higher rung**, which
 * means a card is a *position on a track* rather than a thing in a bag. Authored flat, that rule
 * would be a naming convention holding a mechanic together; authored as a family it is a array
 * index, and `descent.spec.ts` can assert every rung is strictly larger than the one below it.
 *
 * It is also what keeps the pool honest to write. Fourteen families of four rungs is fifty-six
 * cards and fourteen rows.
 */
export interface DescentFamilyData {
  /** Stable forever once shipped: a run stores `${id}:${rank}` for every card it has taken. */
  readonly id: string;
  /** What the screen calls the family. The rank supplies the prefix — see {@link DescentRankData}. */
  readonly name: string;
  /** What it does, in a line, without the numbers the card itself shows. */
  readonly description: string;
  /**
   * The faction this pays, or absent to pay the whole party.
   *
   * ⚠️ **This is the pattern `AGENTS.md` names and rejects — "+10% if two Fire units" — and it
   * survives on an argument the lineup bonus does not need.** A composition bonus is a reward for a
   * decision made *before* the fight, so it resolves to a best party; this is **drawn**, three at a
   * time, out of fourteen families, after the crew is already locked for the run. There is nothing
   * to optimise into: a run cannot know it will be offered Wyrdsong, and a crew built around the
   * hope of it is a crew that loses eight runs in nine. What it rewards is the crew you happened to
   * bring, which is the opposite of what the rule forbids.
   *
   * A plain string for the reason {@link CombatantData.faction} is one: factions are content, and a
   * family naming one that does not exist simply pays nobody.
   */
  readonly faction?: string;
  /**
   * One entry per rank, lowest first.
   *
   * Must be exactly as long as {@link DescentRulesData.ranks} and strictly increasing on every stat
   * it names — `descent.spec.ts` holds both, because a family with a short list is a rank that can
   * be offered and never resolved, and a rung that is not larger than the one below it makes the
   * "a repeat is offered higher only" rule a downgrade.
   */
  readonly rungs: readonly DescentBonus[];
}

/**
 * One rung of the card ladder: what it is called, and how likely it is at each end of a run.
 *
 * ## The tilt saturates, and that is the whole reason it is authored as two ends
 *
 * `gradeWeights` in `core/gear/roll.ts` tilts by `1 + stageIndex / gradeSoftness`, which climbs
 * **without bound** — and the cost of that is a constant somebody has to re-derive once a chapter,
 * forever, which `docs/gear.md` records as a standing tax and names the fix for. This is that fix,
 * taken up front because this content is new: the weight of a rank is interpolated between
 * {@link start} and {@link end} across the run's own card choices, so the tilt is bounded by
 * construction and there is no softness constant to go stale.
 *
 * A run is a fixed nine fights, so "how far through" is a fraction that saturates at 1 on the last
 * choice whatever the run's length is ever retuned to.
 */
export interface DescentRankData {
  /** The prefix a card of this rank wears: `Lesser Whetstone`, `Grand Wyrdsong`. */
  readonly name: string;
  /** Relative weight at the **first** card choice of a run. Zero means it cannot be drawn there. */
  readonly start: number;
  /** Relative weight at the **last**. Linear between the two. */
  readonly end: number;
}

/**
 * One board the run may meet, as `data/` authors it.
 *
 * ⚠️ **No level, and that is the difference from a campaign stage.** A stage authors its own level
 * because the campaign's curve has a tutorial ramp and a deliberate step at the healer lock; a
 * descent board is fought at whatever the run's own campaign progress says — see
 * {@link DescentLevelData} — so authoring one here would be a second, staler answer to a question
 * the run already answers. The same call `core/towers.ts` makes about a floor.
 */
export interface DescentEncounterData {
  readonly id: string;
  readonly name: string;
  /** Which floor this may stand on, 1-based. */
  readonly floor: number;
  /**
   * Whether this is one of a floor's ordinary fights or the fight that closes it.
   *
   * A group tag rather than a {@link StageKind}: what a fight *is* — normal, mini-boss, or the
   * run's boss — is a rule over the slot it lands in, exactly as `stageKindAt` decides it for a
   * chapter. A guardian board drawn onto floor 3 is the run's boss and the same board drawn onto
   * floor 1 would not be, so the kind cannot live on the board.
   */
  readonly guardian: boolean;
  /** The opposing side, in two rows. Repeating an archetype gives multiple copies. */
  readonly enemies: EnemyFormationData;
}

/**
 * How the enemy level is read off the campaign the run has already cleared.
 *
 * The anchor is the level of the hardest campaign stage this run has ever beaten, and a fight is
 * fought a fixed number of **levels** either side of it: the run opens below what the party has
 * already proved it can beat and closes near it. So the mode is a fair fight at ten clears and a
 * fair fight at four hundred, with twenty-four authored boards and no level line to re-derive per
 * chapter.
 *
 * ## ⚠️ Offsets rather than shares, and the first version of this got it wrong
 *
 * The obvious authoring is a *share* — 0.65 of the anchor to 0.90 of it — and it is wrong in a way
 * that only shows up when the mode is measured at more than one depth. Enemy power is `perLevel ^
 * level` with `perLevel` around 1.021, so a share is not a difficulty at all: 0.9 of level 14 is
 * one level down and 0.9 of level 588 is **fifty-nine** levels down, which is ×3.4 easier. Measured,
 * that read as a mode which is a wall at chapter 1 and a walkover with five bodies at full health
 * from chapter 5 onward.
 *
 * A level offset is the same difficulty at every depth by construction, because it is the same
 * number of steps along one exponential. `-20` means ×0.66 of the anchor's enemies whether the
 * anchor is 14 or 588.
 *
 * ⚠️ **The floor is 1 rather than a proportional minimum, and the opening chapters are genuinely
 * easy because of it.** At anchor 14 an offset of −20 clamps flat. That is accepted rather than
 * papered over: the mode opens when chapter 1 falls, the daily faction lock is at its most punishing
 * when the roster is three characters wide, and an easy first week is the right shape for content
 * whose difficulty is meant to arrive with the roster rather than before it.
 */
export interface DescentLevelData {
  /** Levels below the anchor the first fight is fought at. Negative is easier. */
  readonly baseOffset: number;
  /** Levels relative to the anchor the last fight is fought at. Linear between the two. */
  readonly topOffset: number;
  /**
   * Extra levels added per level of anchor, on top of the two fixed offsets.
   *
   * ## ⚠️ This exists because a fixed offset is **not** the same difficulty at every depth
   *
   * The comment on {@link baseOffset} used to argue that it was — enemy power is exponential in
   * level, so a *share* of the anchor is a different difficulty at every depth while a fixed number
   * of levels is the same one everywhere. The first half is right and the conclusion does not
   * follow, because the **party** on the other side of that board is not a fixed distance from the
   * anchor either.
   *
   * Two things pull it away, both compounding over the whole level range rather than over a chapter:
   * enemy `legendary` and `ascended` blocks climb at 1.0225 and 1.024 against a mostly-`common`
   * five's 1.021, so the campaign stage the calibration anchors on gets *relatively* heavier with
   * depth; and the ascension ladder hands the party a ×1.6 every time it crosses a cap. The
   * measurement, at a flat −8/+12 across the five sampled depths:
   *
   * | anchor | 30   | 50   | 75   | 125  | 250  |
   * | ------ | ---- | ---- | ---- | ---- | ---- |
   * | survivors of five | 3.20 | 4.15 | 4.15 | 4.80 | 5.00 |
   *
   * **Monotonic, and the deep end is a full walkover** — nobody ever dies. Raising the fixed offsets
   * cannot fix it: +24 levels takes the deepest sample to a healthy 4.15 and takes the *shallowest*
   * from a 0.50 finish rate to **0.00**. The shape is wrong, not the number.
   *
   * ⚠️ **Zero reproduces the old behaviour exactly**, which is what makes this safe to author and
   * what the level-dial override in `descent.balance.ts` still relies on.
   */
  readonly anchorSlope: number;
}

/**
 * What a cleared fight pays in crystals, and what finishing pays on top.
 *
 * Flat, for the reason every crystal payout in this game is flat: a pull costs a flat `PULL_COST`
 * forever, so anything scaling with how far a run has come pays most to the player who needs it
 * least. The two multipliers are where the run's own rhythm pays out, exactly as they are on a
 * chapter and in a tower.
 */
export interface DescentSummonsData {
  readonly perFight: number;
  /** Multiplier on a floor guardian — the third fight of a floor. */
  readonly guardianMultiplier: number;
  /** Multiplier on the run's last fight. Replaces the guardian multiplier, never stacks with it. */
  readonly bossMultiplier: number;
  /** Paid once, on finishing the whole run. */
  readonly completion: number;
}

/** How the Descent is shaped. One rule for the whole mode; `data/` authors the pools. */
export interface DescentRulesData {
  readonly floors: number;
  readonly fightsPerFloor: number;
  /**
   * Attempts a run has in total.
   *
   * Two: the run, and one retry across the whole of it. A defeat costs one and leaves everything
   * else untouched — the health, the energy, the cards and the fight index are only ever written on
   * a **victory** — so a retry is genuinely the same fight from the same state rather than an
   * approximation of it. At zero the run is over.
   */
  readonly lives: number;
  /** Cards offered at each choice. One is taken; the others are gone. */
  readonly offer: number;
  /** How many factions the daily lock admits. */
  readonly lockFactions: number;
  /** Campaign chapters that must be finished before the Descent opens at all. */
  readonly unlockChapters: number;
  /** The rank ladder, lowest first. Every family carries exactly this many rungs. */
  readonly ranks: readonly DescentRankData[];
  /**
   * Ceiling on the life leech a whole run may accumulate.
   *
   * ⚠️ **A termination guard before it is a balance number, and it is the one clause in this file
   * that could stop a fight ending.** Closing pressure amplifies damage without bound and
   * deliberately does **not** amplify healing — which is what breaks a closed sustain loop — but
   * leech is taken off damage *dealt*, so it rises with the pressure that is meant to end the
   * fight. A party siphoning enough of its own output back does not win; it stalls, the
   * ninety-second clock runs out, and a timeout is a defeat. `descent.spec.ts` holds the whole
   * authorable stack under this, so the clamp is a backstop against a future rung rather than a
   * silent cut on a shipped one.
   */
  readonly maxLifeLeech: number;
  readonly level: DescentLevelData;
  readonly summons: DescentSummonsData;
  /** Emblems paid once, on finishing a run. Flat, for the reason the crystals are. */
  readonly completionEmblems: number;
  /**
   * What a cleared fight's lump is worth, as multiples of the matched campaign stage's own lump.
   *
   * ⚠️ **A duration of the run's own income rather than a quantity**, arrived at by matching the
   * campaign stage that fights at the same enemy level — the idiom `resolveFloor` already uses. A
   * flat quantity of gold, xp or essence is invisible against a level curve worth ×10⁹, and a
   * second authored curve here would be a number to re-derive every time the campaign's moves.
   *
   * ⚠️ **The three are deliberately not equal, which is the one place this mode diverges from
   * "scale all three together or none".** That rule is about `baseRates`, where a common factor
   * cancels out of every ratio `levels.spec.ts` measures; this is a one-off lump on optional daily
   * content and moves no rate at all. Essence is the currency a run is genuinely bottlenecked on
   * late, and paying it here is what makes nine fights worth the nine minutes.
   */
  readonly lumpMultipliers: {
    readonly gold: number;
    readonly xp: number;
    readonly essence: number;
  };
}

/**
 * The run in flight, and the only thing the Descent stores.
 *
 * ## Why the party is copied in rather than read from the formation book
 *
 * A crew is a plan the player edits freely, and a run is a thing already underway. Reading the book
 * per fight would mean a swap made between fight four and fight five arrives at full health with
 * none of the attrition the run is about — and it would let a player walk a fresh five into the
 * boss. Copying it once at the start makes the crew part of the run, which is what a run is.
 *
 * The stats are still resolved live off the roster, so levelling mid-run is felt. That is
 * deliberate and it is generous: nothing here is a competition, and a player who spends essence
 * between fights has spent essence.
 *
 * ## Health is a fraction, not a quantity
 *
 * ⚠️ **Stored as a share of maximum rather than as HP**, which is what makes it survive everything
 * that can move a maximum between two fights of one run: a level, a rung, a resonance floor, a gear
 * swap, a signature level. An absolute figure would read as a heal or a wound that nobody
 * administered — and against a ×10⁹ curve it would read as a very large one.
 */
export interface DescentRun {
  /**
   * The daily window index this run belongs to.
   *
   * ⚠️ **This is the whole of the daily reset.** There is no roll pass, no expiry flag and nothing
   * to reconcile: a run whose day is behind today's is simply not today's run, so it can neither be
   * continued nor block a fresh one. A window that rolls over a run in progress abandons it, and
   * everything the run had already banked was banked fight by fight.
   */
  readonly day: number;
  /** Fights won so far, 0 through the run's length. */
  readonly cleared: number;
  /** The crew, as it stood when the run started. The fallen are removed from it. */
  readonly party: PartyFormation;
  /**
   * Remaining health per character id, as a fraction of maximum in `(0, 1]`.
   *
   * Absent means untouched. A character that has fallen is not here **and** not in {@link party} —
   * one of those alone would be a body on the board at zero health, which is a fighter every
   * targeting rule has to then step around.
   */
  readonly health: Readonly<Record<string, number>>;
  /** Energy carried per character id, in `[0, MAX_ENERGY]`. Absent means none. */
  readonly energy: Readonly<Record<string, number>>;
  /** Cards taken, in the order taken, as `${familyId}:${rank}`. */
  readonly cards: readonly string[];
  /** Attempts left. A defeat costs one; at zero the run is over. */
  readonly lives: number;
}

/**
 * Where a run stands, derived rather than stored.
 *
 * Four states rather than a pair of flags, because every screen that draws a run has to say exactly
 * one thing about it — the same call {@link TowerStatus} makes.
 */
export type DescentStatus =
  /** A card is owed before the next fight may start. */
  | 'choosing'
  /** The next fight is ready to be entered. */
  | 'ready'
  /** Every fight has been won. */
  | 'complete'
  /** The lives ran out. */
  | 'ended';

/** One card on offer: which family, and which rung of it. */
export interface DescentCard {
  readonly family: DescentFamilyData;
  /** 0-based index into {@link DescentRulesData.ranks} and into the family's rungs. */
  readonly rank: number;
  /** `${family.id}:${rank}` — what the run stores and what a choice names. */
  readonly id: string;
}

/** A fight's place in the run, as the screens draw it. */
export interface DescentFight {
  /** 1-based, over the whole run. */
  readonly index: number;
  /** 1-based floor. */
  readonly floor: number;
  /** 1-based position within its floor. */
  readonly step: number;
  /** Ordinary, a floor guardian, or the run's last fight. */
  readonly kind: StageKind;
}
