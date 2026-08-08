import { type AchievementLedger, emptyAchievements } from './achievements';
import { type Dispatch, emptyDispatches } from './bounties';
import { emptyWallet, type Rates, type Wallet, zeroRates } from './currency';
import { emptyGearShop, type GearItem, type GearShopState } from './gear/types';
import { type LadderPosition } from './ladder';
import { emptyQuestWindows, type QuestWindows } from './quests';
import { type RngState } from './rng';
import { type OwnedCharacter } from './roster/types';
import { SAVE_VERSION } from './save/version';
import { emptyTowers, type TowerProgress } from './towers';

/**
 * How many characters stand in the front rank.
 *
 * Two, against three behind them. The asymmetry is the point: the front row is a **gate**
 * ordinary attacks have to work through, so making it the smaller rank keeps it a real cost
 * rather than a free wall — a party that wants three bodies protecting its healer cannot have
 * them.
 *
 * These live here rather than in `data/` because they are rules the save layer has to enforce
 * when repairing a damaged formation, and `core/` cannot reach `data/` to ask.
 */
export const FRONT_ROW_SIZE = 2;

/** How many characters stand behind the front rank. */
export const BACK_ROW_SIZE = 3;

/** How many characters fight at once, across both rows. */
export const PARTY_SIZE = FRONT_ROW_SIZE + BACK_ROW_SIZE;

/**
 * The party that fights, as character ids in slot order within each rank.
 *
 * Two lists rather than one ordered list with the first two slots understood to be the front.
 * A flat list cannot express "nobody in front, two in the back", which is a formation a player
 * mid-reshuffle is entitled to have — and encoding a hole as an empty string is the kind of
 * sentinel that survives into a save file and then into a bug report.
 *
 * Ids rather than roster indices, so reordering or repairing the roster cannot silently change
 * who is fighting.
 */
export interface PartyFormation {
  readonly front: readonly string[];
  readonly back: readonly string[];
}

/** An empty formation. A run mid-reshuffle is allowed to have one; a battle reads it as a loss. */
export function emptyFormation(): PartyFormation {
  return { front: [], back: [] };
}

/**
 * One shared empty formation, for the read path.
 *
 * {@link formationIn} answers for an activity the run has never crewed, and it is read from
 * `computed()` values in `ui/`. Those compare by reference, so handing back a fresh
 * `emptyFormation()` each call would republish every screen watching an empty formation on every
 * change-detection pass. Everything on a formation is `readonly`, so one instance is safe to
 * share.
 */
const NO_FORMATION: PartyFormation = { front: [], back: [] };

/**
 * Every formation the run holds, keyed by the activity it fights for.
 *
 * **Eight live formations rather than one live formation and seven saved templates**, which is the
 * decision milestone 15a rests on. A template model would have kept `GameState.formation` as the
 * single thing that fights and made the others inert copies loaded into it — cheaper, and wrong
 * for the same reason a "more" tab is wrong: it spends a step of the player's attention on
 * bookkeeping the game could have done. Eight activities means eight crews, and a crew that has to
 * be *loaded* before it is real is a crew the player has to remember to load.
 *
 * A keyed record rather than a field per activity, for the reason {@link GameState.wallet} and
 * {@link GameState.achievements} are records: an eighth activity is a key and a line in `data/`,
 * not a save migration.
 *
 * ⚠️ **An unknown key is kept rather than dropped**, which is the opposite of how a formation
 * treats an unknown *character* id and the same call {@link AchievementLedger} makes. A character
 * this build does not ship cannot be fielded, so carrying it would mean carrying a fighter nothing
 * can render; a crew for a tower this build has not shipped costs two short arrays and is exactly
 * what a save needs to survive a build with less content than the one that wrote it. Nothing reads
 * a key it was not asked for, so an unknown entry is inert.
 */
export type FormationBook = Readonly<Record<string, PartyFormation>>;

/**
 * The activity key the campaign's crew stands under.
 *
 * A constant in `core/` rather than a string in `data/`, and the same call {@link FRONT_ROW_SIZE}
 * makes: the save layer has to be able to repair a damaged book and to seed a new run's starters
 * without asking what content exists. Every *other* key is content — which towers this build ships
 * — and reaches `core/` as an argument like everything else.
 */
export const CAMPAIGN_FORMATION = 'campaign';

/** A run that has crewed nothing. `grantStarters` writes the campaign key on the first load. */
export function emptyFormationBook(): FormationBook {
  return {};
}

/** The crew standing for `activity`, or an empty formation when none has ever been set. */
export function formationIn(book: FormationBook, activity: string): PartyFormation {
  return book[activity] ?? NO_FORMATION;
}

/**
 * Everybody standing in any formation, deduplicated.
 *
 * ⚠️ **One character may stand in several crews at once, and that is not damage.** Only one
 * activity is ever fought at a time, so a Dwarf in both the campaign five and the Dwarf tower five
 * is a player who has made one sensible decision twice — not a fighter acting twice, which is the
 * state {@link placeInRow} exists to prevent *within* a formation.
 */
export function allFormationMembers(book: FormationBook): readonly string[] {
  const members = new Set<string>();
  for (const formation of Object.values(book)) {
    for (const id of formationMembers(formation)) {
      members.add(id);
    }
  }
  return [...members];
}

/** Everyone in the formation, front rank first. */
export function formationMembers(formation: PartyFormation): readonly string[] {
  return [...formation.front, ...formation.back];
}

/** How many characters the formation is currently fielding. */
export function formationSize(formation: PartyFormation): number {
  return formation.front.length + formation.back.length;
}

/** The most a rank can hold. */
export function rowCapacity(row: 'front' | 'back'): number {
  return row === 'front' ? FRONT_ROW_SIZE : BACK_ROW_SIZE;
}

/**
 * The complete runtime game state.
 *
 * Every field is `readonly`: core functions return a new state rather than mutating the
 * one they were given. That purity is what lets the UI hold a state object directly as a
 * snapshot without defensive copying.
 *
 * It **is** a {@link LadderPosition}, stated rather than left to structural typing, so a run can
 * be handed straight to `stageIndex` or `advancePosition` without anybody re-deriving the pair.
 */
export interface GameState extends LadderPosition {
  /** Save schema version. Present from the first commit so migrations always have a floor. */
  readonly version: number;
  /**
   * Every currency the run holds.
   *
   * A keyed record rather than a field per currency. Milestone 1 carried gold as two flat
   * fields, which was right for one quantity and would have been ten fields for five — each
   * needing its own line in `tick`, in `resume`, in the save encoder and in the repair pass.
   */
  readonly wallet: Wallet;
  /**
   * Idle income per second, per currency.
   *
   * Every rate starts at **zero**. A new run earns nothing at all while idle, which makes the
   * first battle the only thing worth doing; clearing a stage raises these permanently, and
   * they never fall.
   */
  readonly rates: Rates;
  /**
   * Epoch milliseconds at the last save or resume, used to size the offline window.
   *
   * Core never reads a clock, so this is only ever written from a `nowMs` passed in by the
   * UI — see {@link stampSaveTime} and `resume`.
   */
  readonly lastTickAt: number;
  readonly rng: RngState;
  /**
   * The chapter the party is currently in, 1-based.
   *
   * Together with {@link stage} this is a {@link LadderPosition}, and `GameState` satisfies that
   * interface structurally so a position never has to be unpacked to be passed on.
   */
  readonly chapter: number;
  /**
   * The stage the party is currently fighting **within {@link chapter}**, 1-based.
   *
   * ⚠️ **Not a position on the whole ladder.** It was one until milestone 11, and reading it as
   * one is a bug that presents as a player being teleported: chapter 2 stage 3 and chapter 1
   * stage 3 are the same number here. `stageIndex(ladder, state)` is the only way to get a linear
   * index, and it is what the clear count, the crystal rate and the reward curve are all
   * functions of.
   *
   * The pair is stored rather than the linear index because a linear index only means anything
   * against the exact chapter sizes it was written under. Retuning a chapter's length would
   * silently relocate every save mid-ladder; a chapter and a stage still names the same place
   * afterwards.
   *
   * Numbers rather than a stage id, for the reason they always were: `core/` cannot import
   * `data/`, so it cannot check an id against the authored stages, whereas a bounded integer pair
   * can be repaired on load without knowing what content exists. The caller clamps it to the
   * ladder it actually ships.
   */
  readonly stage: number;
  /**
   * How many stages have ever been cleared, as a linear count over the whole ladder.
   *
   * Distinct from the position, which stops climbing at the end of the authored ladder and so
   * cannot answer "was this a first clear" once the player is farming the last one. First-clear
   * summon bonuses and the crystal rate are both paid against this.
   *
   * **A count rather than a pair, deliberately, and the asymmetry with the position is the
   * point.** The position is a *place* and has to survive the ladder being re-cut around it; this
   * is a *quantity earned*, and "I have beaten ninety-one stages" means the same thing however
   * the ladder is cut. It is also what keeps a save flat when chapters run to hundreds of stages:
   * a per-stage record of thousands of entries is a cost with nothing bought by it.
   */
  readonly clearedStages: number;
  /**
   * Battles resolved over the life of the run.
   *
   * Part of the battle RNG label, so retrying a stage is a new fight rather than a replay of
   * the same loss. Combat draws from a derived sub-stream, so this counter is the only thing
   * that advances per battle — `rng.calls` belongs to pulls and is untouched by combat.
   */
  readonly battleCount: number;
  /**
   * Every character the player owns, one entry per character rather than per copy.
   *
   * Unordered as far as the simulation is concerned; the UI sorts it for display.
   */
  readonly roster: readonly OwnedCharacter[];
  /**
   * Every party that fights, one per activity, each in two rows.
   *
   * See {@link FormationBook} for why there are eight of them and {@link PartyFormation} for why
   * each is two lists. Which rank a character stands in is the player's decision and is not
   * constrained by what the character is — a run whose pulls are all Elves and Angels can still
   * put two of them in front, just badly. *Which activity* a character may stand for is a
   * different question, and one `core/` deliberately does not answer: a tower's faction lock is
   * content, so it is enforced by the caller that knows what a tower is.
   */
  readonly formations: FormationBook;
  /**
   * Pulls made since the last ascended-tier character, driving the ascended pity curve.
   *
   * **Global, not per-banner.** Per-banner pity is a monetisation pattern — it makes every new
   * banner a fresh thirty-pull tax — and there is nothing here to monetise.
   */
  readonly pity: number;
  /**
   * Pulls made since the last character of legendary tier **or better**.
   *
   * A second counter rather than a second reading of {@link pity}, because the two answer
   * different questions: this one bounds how long a run of nothing can get, and `pity` bounds how
   * far away the top tier can be. An ascended-tier result clears both — it is not a miss on the
   * promise this one makes.
   *
   * Stored rather than derived for the reason `pity` is: nothing else in the save records what the
   * recent pulls produced, and the alternative is a log of them.
   */
  readonly legendaryPity: number;
  /** Pulls made over the life of the run. Display only; the RNG position lives in `rng.calls`. */
  readonly pullCount: number;
  /**
   * Every piece of gear the run owns, equipped or not.
   *
   * **One list rather than a bag plus a per-character pile**, with {@link OwnedCharacter.gear}
   * holding ids into it. An item then has exactly one home, so "is this piece equipped, and by
   * whom" has one answer, and moving a piece between characters cannot produce two of it — which
   * is the failure a copy-on-equip design has and only notices once somebody reports doubled
   * stats.
   *
   * Unbounded in principle and bounded in practice: unequipped pieces past the authored inventory
   * limit are auto-salvaged into `alloy`, worst first. See `core/gear/inventory.ts`.
   */
  readonly gear: readonly GearItem[];
  /**
   * How many pieces this run has ever minted, and therefore the next id.
   *
   * Monotonic, and never rewound when a piece is salvaged. A reissued id would silently rebind a
   * loadout reference to a different object, which is the one kind of gear damage that produces a
   * plausible-looking wrong answer rather than a missing one.
   *
   * A counter rather than an RNG draw because an id has to be unique, and a draw is unique only by
   * luck — over an evening of auto-battle a 32-bit stream will collide.
   */
  readonly gearMinted: number;
  /** Which stocking of the gear shop this run is looking at, and what it has taken from it. */
  readonly gearShop: GearShopState;
  /**
   * How many achievement awards this run has claimed, keyed by track id.
   *
   * **A ledger of what was taken, not of what was earned.** What has been earned is a division
   * over a counter the run already keeps — see `core/achievements.ts` — so storing it as well
   * would be a second mechanism on the same number, with the two free to disagree after a repair.
   * One integer per track is the whole of it.
   *
   * A keyed record rather than a field per track, for the reason {@link wallet} is one: milestone
   * 1 carried a single quantity as flat fields and six currencies would have been twelve of them.
   * A second track is an entry here and a line in `data/`, not a save migration.
   */
  readonly achievements: AchievementLedger;
  /**
   * The daily and weekly quest windows: when each opened, what the counters read then, and what
   * has been claimed since.
   *
   * ⚠️ **No quest has a progress counter of its own**, and that is deliberate. A window stores a
   * *baseline* of the totals this state already keeps, so progress is a subtraction and a reset is
   * one assignment — which is what keeps quests entirely out of `applyBattleResult`. See
   * `core/quests.ts`.
   */
  readonly quests: QuestWindows;
  /**
   * Missions currently running, and who is away on each.
   *
   * ⚠️ **Not disjoint from {@link formations}, and since milestone 15b that is deliberate.** The
   * invariant is unchanged — a character cannot be both fighting and away — but it bites on the way
   * *out* rather than on the way in: anybody may be dispatched, and a crew holding somebody away
   * cannot fight. Nothing in `core/` refuses a dispatch on these grounds, and `repairDispatches`
   * keeps a mission whose crew is also fielded, because that is an ordinary state a player reached
   * on purpose.
   *
   * The reason it moved: eight crews is forty slots against a forty-nine character roster, so a
   * player who had crewed every tower had no bench left and the board starved exactly when the
   * roster breadth it rewards was widest. See `core/bounties.ts`.
   */
  readonly dispatches: readonly Dispatch[];
  /**
   * How far each faction tower has been climbed, keyed by tower id.
   *
   * ⚠️ **Separate from {@link clearedStages}, and that separation is arithmetic rather than
   * tidiness.** The clear count drives the idle crystal rate; seven towers of a hundred floors
   * feeding it would take that rate to roughly ×8 the base, where `banners.spec.ts` bounds a fully
   * cleared campaign at ×3. See `core/towers.ts`.
   *
   * **One integer per tower — the highest floor cleared — not a set of floors.** A tower is climbed
   * strictly upward and a floor is never re-fought, so "how far" is the whole of what there is to
   * know, and a per-floor record would be a hundred entries per tower saying what one number says.
   */
  readonly towers: TowerProgress;
}

export interface NewGameOptions {
  /**
   * The run's RNG seed. Supplied by the caller because core must not call `Math.random()`;
   * the UI generates it once at new-game time and it lives in the save from then on.
   */
  readonly seed: number;
  /** Epoch milliseconds at creation, supplied by the caller because core has no clock. */
  readonly nowMs: number;
}

export function newGame({ seed, nowMs }: NewGameOptions): GameState {
  return {
    version: SAVE_VERSION,
    wallet: emptyWallet(),
    rates: zeroRates(),
    lastTickAt: nowMs,
    rng: { seed: seed >>> 0, calls: 0 },
    chapter: 1,
    stage: 1,
    clearedStages: 0,
    battleCount: 0,
    // Empty, not seeded. `core/` cannot import `data/`, so it does not know who the starter
    // characters are — the UI grants them with `grantStarters`, which also repairs a save that
    // somehow arrives with nobody in it.
    roster: [],
    formations: emptyFormationBook(),
    pity: 0,
    legendaryPity: 0,
    pullCount: 0,
    gear: [],
    gearMinted: 0,
    gearShop: emptyGearShop(),
    achievements: emptyAchievements(),
    quests: emptyQuestWindows(),
    dispatches: emptyDispatches(),
    towers: emptyTowers(),
  };
}

/**
 * Stamps the current wall-clock time onto the state ahead of persisting it.
 *
 * Kept separate from `tick` so that core stays clockless: `tick` advances the simulation by
 * a duration it is handed, and only the persistence boundary knows what time it is.
 */
export function stampSaveTime(state: GameState, nowMs: number): GameState {
  return { ...state, lastTickAt: nowMs };
}
