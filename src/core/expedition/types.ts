import { type EnemyFormationData } from '../battle/types';
import { type DescentRankData } from '../descent/types';
import { type PartyFormation } from '../state';

/**
 * Expeditions: hand-authored puzzle maps, solved once each.
 *
 * ## What it adds that nothing else in this game does
 *
 * Every other mode climbs — bigger numbers until the content runs out. An expedition is **solved**:
 * a fixed map, a fixed stamina budget, and more camps than the budget can pay for, so the whole mode
 * is the question "which fights do I not take?". Milestone 23's roadmap entry names Peaks of Time as
 * the reference and hand-authoring as the whole cost; this is that entry, built.
 *
 * ## The map is a grid and the player is nowhere on it
 *
 * ⚠️ **There is no avatar and no position, and that is a finding rather than a cut.** Movement is
 * free and the map is fully visible, so walking was never a decision — the only decisions are which
 * camps to fight. Everything a position would say is derived from which camps have fallen: the
 * *reachable region* grows out of the start tile through open tiles, a camp adjacent to that region
 * may be fought, a chest inside it is collected, and an exit inside it may be completed. That is why
 * {@link ExpeditionRun} stores a list of cleared camps and nothing about where anybody is standing.
 *
 * ## One-time, and what that buys
 *
 * Every reward on a map — a camp's crystals, a chest's contents, the completion bonus — pays exactly
 * once, ever, recorded in {@link ExpeditionRecord}. That is the same shape as the campaign's
 * first-clear crystals, which is the one shape of crystal payout this economy already has an answer
 * to: a finite pool needs no rate guard, no daily cap and no compounding analysis. It is also what
 * makes free restarts safe — nothing pays twice, so retrying is never exploitable, and nothing is
 * lost, so it is never punishing.
 *
 * `core/` still cannot see `data/`: the maps, the card families and the rules all arrive as
 * arguments, exactly as the Descent's do.
 */

/**
 * One enemy camp on a map.
 *
 * The camp's tile is named by {@link cell}, a single lowercase letter placed in the map's grid.
 * ⚠️ **The cell is a save key**: {@link ExpeditionRecord.camps} and {@link ExpeditionRun.camps} both
 * store it, so once a map has shipped a camp keeps its letter forever — reword the name freely,
 * never the cell.
 */
export interface ExpeditionCampData {
  /** The grid letter, `a`–`z`. Unique within its map, permanent once shipped. */
  readonly cell: string;
  readonly name: string;
  /** Stamina fighting this camp costs. Spent on victory only — a defeat writes nothing. */
  readonly stamina: number;
  /**
   * Levels relative to the run's anchor — the hardest campaign stage ever cleared — exactly as
   * {@link DescentLevelData} counts. ⚠️ An offset rather than a share, for the reason that file
   * records: enemy power is exponential in level, so only a fixed number of steps along the curve
   * is the same difficulty at every depth.
   */
  readonly levelOffset: number;
  /**
   * Whether this camp is the map's boss — the one fight the route cannot avoid.
   *
   * Exactly one per map, and it gates the exit: `expedition.spec.ts` asserts the exit is
   * unreachable while the boss stands even with every other camp cleared. That is the "every
   * chapter ends on a boss" rule, restated for a map.
   */
  readonly boss: boolean;
  /** The opposing side, in two rows. Repeating an archetype gives multiple copies. */
  readonly enemies: EnemyFormationData;
}

/**
 * What one chest holds.
 *
 * Two idioms, matching the two kinds of currency, and neither may borrow the other's:
 *
 * - **`summons` and `emblems` are flat**, for the reason every crystal payout in this game is flat —
 *   a pull costs a flat `PULL_COST` forever, and an emblem prices a signature level at a flat rate
 *   forever.
 * - **`gold`, `xp` and `essence` are multipliers on the campaign lump matched at the run's anchor
 *   level**, because a flat quantity of any of them is invisible against a level curve worth ×10⁹.
 *   The same idiom {@link DescentRulesData.lumpMultipliers} uses, priced per chest rather than per
 *   mode because a chest is the thing on screen.
 */
export interface ExpeditionChestContents {
  /** Crystals, flat. */
  readonly summons?: number;
  /** Emblems, flat. */
  readonly emblems?: number;
  /** Multiplier on the matched campaign stage's gold lump. */
  readonly gold?: number;
  /** Multiplier on the matched campaign stage's xp lump. */
  readonly xp?: number;
  /** Multiplier on the matched campaign stage's essence lump. */
  readonly essence?: number;
}

/**
 * One chest on a map, named by its grid digit.
 *
 * ⚠️ **The cell is a save key**, exactly as a camp's is: {@link ExpeditionRecord.chests} stores it.
 *
 * A chest tile is open ground — it blocks nothing and costs nothing. It is collected the moment it
 * joins the reachable region, which is what "chests are free to grab; the camps in front of them
 * are not" means as arithmetic.
 */
export interface ExpeditionChestData {
  /** The grid digit, `1`–`9`. Unique within its map, permanent once shipped. */
  readonly cell: string;
  readonly name: string;
  readonly contents: ExpeditionChestContents;
}

/**
 * One map, as `data/` authors it.
 *
 * ## The grid
 *
 * Rows of single characters, all the same length:
 *
 * - `#` and space — wall
 * - `.` — open path
 * - `S` — the start, exactly one
 * - `X` — the exit, exactly one
 * - `a`–`z` — a camp, resolved by {@link camps}
 * - `1`–`9` — a chest, resolved by {@link chests}
 *
 * Movement is 4-adjacent. A camp blocks its tile until beaten; everything else that is not wall is
 * open. The grid is the geometry and the camp/chest rows are the content, so retuning a camp never
 * touches the drawing of the map.
 *
 * ## The stamina budget is the puzzle
 *
 * ⚠️ `stamina` must afford some route to the exit and must **not** afford every camp — both held by
 * `expedition.spec.ts`, mechanically, with a route search rather than by the author's word. A map
 * whose budget covers everything is a corridor pretending to be a maze.
 */
export interface ExpeditionMapData {
  /** Stable forever once shipped: {@link GameState.expeditions} is keyed by it. */
  readonly id: string;
  readonly name: string;
  /** What the screen says about it, in a line. */
  readonly description: string;
  readonly grid: readonly string[];
  /** The whole budget for one attempt. Only victories spend it. */
  readonly stamina: number;
  readonly camps: readonly ExpeditionCampData[];
  readonly chests: readonly ExpeditionChestData[];
}

/**
 * What clearing a camp and finishing a map pay, in crystals.
 *
 * Flat, once, ever — see the file comment. The boss multiplier is the same shape a chapter boss and
 * a tower roof carry.
 */
export interface ExpeditionSummonsData {
  readonly perCamp: number;
  readonly bossMultiplier: number;
  /** Paid once, on first completing a map. */
  readonly completion: number;
}

/** How Expeditions are shaped. One rule for the whole mode; `data/` authors the maps. */
export interface ExpeditionRulesData {
  /** Campaign chapters that must be finished before the mode opens at all. */
  readonly unlockChapters: number;
  /** Cards offered after each camp falls. One is taken; the others are gone. */
  readonly offer: number;
  /**
   * The card rank ladder, lowest first — the Descent's own type, because it is the Descent's own
   * system: the families, the "a repeat comes back only higher" rule and the saturating tilt all
   * transfer whole. The tilt's progress here is **stamina spent over the map's budget**, which
   * saturates by construction exactly as a fixed choice count does.
   */
  readonly ranks: readonly DescentRankData[];
  /**
   * Ceiling on the life leech a whole attempt may accumulate.
   *
   * ⚠️ A termination guard before it is a balance number — the same clause, for the same reason, as
   * {@link DescentRulesData.maxLifeLeech}: leech is taken off damage dealt, closing pressure
   * amplifies damage without amplifying healing, and a party siphoning enough of its own output
   * back stalls into the ninety-second clock.
   */
  readonly maxLifeLeech: number;
  /**
   * The highest anchor a camp will read, in campaign enemy levels.
   *
   * ⚠️ **The same clamp as {@link DescentLevelData.anchorCap}, for the same cause, and that comment
   * carries the whole argument.** The short version: the anchor is the hardest campaign stage
   * cleared, and it was standing in for *how strong the party is*. The two stopped moving together
   * at chapter 13, when the campaign began running above `legendary-plus`'s level cap of 260 — from
   * there the ladder's level climbs 25 a chapter while the party it is tuned for cannot, so each
   * chapter final is authored lighter than the last. Measured, the party this mode calibrates reads
   * 244.7 at anchor 300, 247.7 at 325 and **242.7** at 350: flat, then backwards.
   *
   * ⚠️ **Its own number rather than the Descent's, because the two modes convert an anchor into a
   * board differently** — this one authors a fixed `levelOffset` per camp where the Descent ramps
   * across nine fights. Both were solved the same way, by holding the board-to-party **power** ratio
   * rather than the level gap; see `expedition.balance.ts` for this mode's measurement.
   *
   * ⚠️ **It binds only above its own value, so every depth below it is untouched** and no camp's
   * `levelOffset` had to move. **It is not permanent**: the plateau exists because the campaign's
   * tuning target plateaued, so a chapter asking for a rung above `legendary-plus` starts the party
   * climbing again and this has to climb with it.
   */
  readonly anchorCap: number;
  readonly summons: ExpeditionSummonsData;
  /** Emblems paid once, on first completing a map. Flat, for the reason the crystals are. */
  readonly completionEmblems: number;
  /**
   * What a camp's first-ever clear pays in gold, xp and essence, as multiples of the matched
   * campaign stage's own lump — the idiom {@link DescentRulesData.lumpMultipliers} argues for.
   */
  readonly lumpMultipliers: {
    readonly gold: number;
    readonly xp: number;
    readonly essence: number;
  };
}

/**
 * The attempt in flight, and one of the two things Expeditions store.
 *
 * Small on purpose. No day — an attempt persists until it is finished or abandoned, because
 * one-time content has no reset to race. No lives — restarts are free, so a defeat costs nothing
 * to count. No position — see the file comment. Stamina spent is the sum of the cleared camps'
 * costs, derived, so it cannot disagree with the list it would summarise.
 *
 * The party, health-as-fractions and energy carry exactly the Descent's shape and rules: the crew
 * is copied in at the start, the fallen leave {@link party} and {@link health} together, and health
 * is a share of maximum so that nothing that moves a maximum mid-attempt reads as a wound.
 */
export interface ExpeditionRun {
  /** Which map this attempt is on. */
  readonly mapId: string;
  /**
   * Which attempt at this map it is, read off {@link ExpeditionRecord.attempts} when it started.
   *
   * ⚠️ **This is the card draw's salt.** The offer is a pure function of the seed, the map, this
   * number, the choice index and the cards already taken — so force-quitting hands back the
   * identical three cards (rerolling is impossible rather than merely detectable), while a fresh
   * attempt genuinely redraws. Without it, every attempt at a map would open with the same card.
   */
  readonly attempt: number;
  /** The crew, as it stood when the attempt started. The fallen are removed from it. */
  readonly party: PartyFormation;
  /** Remaining health per character id, as a fraction of maximum in `(0, 1]`. Absent = untouched. */
  readonly health: Readonly<Record<string, number>>;
  /** Energy carried per character id. Absent means none. */
  readonly energy: Readonly<Record<string, number>>;
  /** Cards taken, in the order taken, as `${familyId}:${rank}` — the Descent's own format. */
  readonly cards: readonly string[];
  /** Camps beaten this attempt, by cell, in the order fought. */
  readonly camps: readonly string[];
}

/**
 * What a map remembers forever, and the other thing Expeditions store.
 *
 * The first-ever ledger: a camp or chest cell in here has paid and will never pay again, whatever
 * later attempts do. ⚠️ **It survives the map being re-fought, abandoned or completed** — it is the
 * record of rewards taken, not of the attempt that took them.
 */
export interface ExpeditionRecord {
  /** Camp cells whose first-ever clear has been paid. */
  readonly camps: readonly string[];
  /** Chest cells whose contents have been paid. */
  readonly chests: readonly string[];
  /** Whether the completion bonus has been paid. Completion also opens the next map. */
  readonly completed: boolean;
  /** Attempts ever started on this map. Feeds {@link ExpeditionRun.attempt}. */
  readonly attempts: number;
}

/** A record for a map nothing has touched. */
export const EMPTY_EXPEDITION_RECORD: ExpeditionRecord = {
  camps: [],
  chests: [],
  completed: false,
  attempts: 0,
};

/**
 * Where an attempt stands, derived rather than stored.
 *
 * Deliberately about the *fight loop* only: whether the exit is open is an independent fact — it
 * can be open while fights remain worth taking — so it is a separate selector rather than a fourth
 * state pretending the two are exclusive.
 */
export type ExpeditionStatus =
  /** A card is owed before the next fight may start. */
  | 'choosing'
  /** At least one camp is adjacent to the region and affordable. */
  | 'ready'
  /** No fight is possible — every remaining camp is out of reach or over budget. */
  | 'spent';
