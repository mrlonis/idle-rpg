import { credit, type CurrencyAmounts, type CurrencyId, type Rates } from './currency';
import { num, type Numeric, ZERO } from './numeric';
import { derivedStream } from './rng';
import { type CharacterData } from './roster/types';
import { type GameState } from './state';

/**
 * The bounty board: characters dispatched on timed missions.
 *
 * ## What this is for, which is not what the other two faucets are for
 *
 * Achievements and quests pay for **playing**. This is the only system in the game that pays for
 * characters you are **not** fighting with — dispatched characters come off the bench, so a wide
 * roster becomes worth something before faction towers ask for it, and a duplicate-heavy run has a
 * use for breadth from the moment it starts.
 *
 * ⚠️ **Dispatch and the formation are disjoint, and that is the whole of the design.** A character
 * cannot be both fighting and away. Without it this is not a bench sink at all — it is a free
 * resource tap that the player's five best characters run on a timer while also winning every
 * fight. The invariant is enforced in **both** directions: {@link dispatchBounty} refuses anybody
 * standing in the formation, and `setFormation` refuses anybody away. Enforcing one side only is
 * the shape this is most likely to be built in, and it leaves the hole wide open.
 *
 * ## Why a bounty pays a duration rather than a quantity
 *
 * ⚠️ A bounty pays **seconds of the run's own idle income**, not a flat amount — the same idiom
 * `StageRewardCurveData.rewardSeconds` already uses for a stage's lump, and for the same reason.
 * Gold, xp and essence are spent against a level curve worth ×10⁹, so a flat quantity of any of
 * them is worthless a chapter or two later; a duration of the player's *current* rate means the
 * same thing at stage 5 and at stage 5,000 and never needs retuning.
 *
 * That is deliberately a different answer from the one quests give. **Quests pay flat crystals
 * because they exist to help a player whose ladder has stopped**; a reward scaling with progress
 * would help them least. **Bounties reward roster breadth**, which is not a stuck player's problem,
 * so scaling with progress is the right shape here and the wrong one there.
 *
 * ⚠️ **Crystals are deliberately not payable by a bounty.** The crystal rate is linear in the clear
 * count precisely so it cannot outrun a flat `PULL_COST` — see {@link SummonRateCurve} — and paying
 * a *multiple* of that rate on a timer is exactly the compounding it exists to prevent.
 *
 * ## The clock belongs to the caller
 *
 * `core/` has no clock. A dispatch stores the `nowMs` it was started at, supplied by `ui/`, and
 * whether it has finished is arithmetic against another `nowMs` passed in. The backwards-clock rule
 * applies: a device clock moved back must not make a finished mission unfinished, which
 * {@link bountyProgress} handles by clamping elapsed time at zero rather than by detecting anything.
 *
 * ## The board rotates daily, and none of it is stored
 *
 * What `data/` authors is a **pool**; what a player sees is one variant of each tier, derived from
 * the run's own seed against the day index — the same trick `gearShopOffers` plays on the hour, and
 * for the same three reasons. It adds no save field, it cannot drift out of step with content a
 * build no longer ships, and ⚠️ **it makes rerolling impossible rather than merely detectable**:
 * there is nothing to re-take, because the answer is a function of the seed and the day.
 *
 * ⚠️ **A dispatch outlives the board it was sent from, and that is load-bearing.** A 24-hour
 * campaign crosses a rotation boundary by definition. Every lookup that has to honour a running
 * mission — {@link repairDispatches}, {@link collectReadyBounties} — therefore takes the **whole
 * pool**, never the day's board, and {@link dailyBoard} shows a tier's *running* mission in place of
 * the day's draw. Wiring any of those three to the board instead would drop a mission a player is
 * eleven hours into, silently, and pay nothing for it.
 */

/**
 * How many of one faction a mission insists on.
 *
 * ⚠️ **Never a celestial faction.** Angels and Demons ascend on copies of themselves alone, so a
 * run whose banners are unkind can own none of either indefinitely — a mission requiring one is a
 * row that player cannot run for reasons no amount of play fixes. `data/bounties.spec.ts` derives
 * that rule from the shipped `FACTIONS` rather than restating which ones are mortal.
 */
export interface BountyRequirement {
  /** The faction id the crew must draw from. */
  readonly faction: string;
  /** How many of the crew must be of it. Never more than the crew size. */
  readonly count: number;
}

/** One authored mission. */
export interface BountyData {
  readonly id: string;
  /**
   * Which rung of the board this is a variant of.
   *
   * Variants of a tier share its duration, crew, payout and unlock, and differ only in flavour and
   * in {@link requires}. The board offers **one variant per tier per day**, which is what keeps
   * rotation a change in *what is asked for* rather than in what the day is worth.
   */
  readonly tier: string;
  readonly name: string;
  /** What the mission is, in a line. */
  readonly description: string;
  /** How long it runs, in milliseconds. */
  readonly durationMs: number;
  /** How many characters it takes. Exactly this many, never fewer. */
  readonly crew: number;
  /**
   * Seconds of the run's current idle income paid on collection.
   *
   * A duration rather than an amount, so the payout cannot drift away from the economy it is
   * measured against. See the note at the top of this file.
   */
  readonly payoutSeconds: number;
  /** Stage clears required before this mission is offered at all. */
  readonly unlockClears: number;
  /** A faction the crew must partly be drawn from, when the mission asks for one. */
  readonly requires?: BountyRequirement;
}

/** How the board is stocked and when it rotates, as authored in `data/`. */
export interface BountyBoardRulesData {
  /**
   * How far after midnight UTC the day rolls, in minutes.
   *
   * ⚠️ **The same boundary the quest windows use.** Two daily clocks in one game would mean two
   * different "tomorrows", with nothing on either screen to explain why one reset and the other did
   * not. `data/bounties.spec.ts` asserts the equality rather than restating the number.
   */
  readonly resetOffsetMinutes: number;
  /**
   * How many missions stand on the board at once, running ones included.
   *
   * ⚠️ **This is the ceiling on the whole faucet, so it is a balance number rather than a layout
   * one.** Every mission pays a fraction of idle income for as long as it runs, so `missions`
   * simultaneous ones multiply that fraction — `data/bounties.spec.ts` bounds the worst case rather
   * than letting it be whatever the board happens to fit. Raising it is an economy change.
   */
  readonly missions: number;
}

/** A mission currently running. */
export interface Dispatch {
  readonly bountyId: string;
  /** The characters away on it, as `defId`s. */
  readonly members: readonly string[];
  /** Epoch milliseconds it was started at, supplied by the caller. */
  readonly startedAt: number;
}

/** Why a dispatch or a collection was refused, in terms the UI can turn into a sentence. */
export type BountyFailure =
  | 'unknown-bounty'
  | 'already-running'
  | 'not-running'
  | 'wrong-crew-size'
  | 'wrong-faction'
  | 'not-owned'
  | 'duplicate-member'
  | 'in-formation'
  | 'already-away'
  | 'not-finished'
  | 'locked';

export type BountyResult =
  | { readonly ok: true; readonly state: GameState; readonly gained?: CurrencyAmounts }
  | { readonly ok: false; readonly reason: BountyFailure };

const fail = (reason: BountyFailure): BountyResult => ({ ok: false, reason });

/**
 * Everyone standing in **any** formation, as a set.
 *
 * ⚠️ **Spelled out rather than importing `allFormationMembers` from `state.ts`, and that is a real
 * constraint rather than a preference.** `state.ts` imports this module for {@link Dispatch} and
 * {@link emptyDispatches}, so importing a *value* back out of it closes a runtime dependency
 * cycle — which `import/no-cycle` rejects, and rightly: the two modules would then have an
 * initialisation order between them. `achievements.ts` and `quests.ts` avoid it by importing only
 * `type GameState`, and this file has to do the same. A few lines is the whole cost.
 *
 * ⚠️ **Every formation rather than one, and this is the interim reading of the disjointness rule
 * rather than its final one.** Milestone 15a turned one formation into eight, and the narrowest
 * change that keeps the invariant exactly as strong as it was is to read all eight — a character
 * standing anywhere is fighting somewhere, so they may not also be away.
 *
 * **It gets tighter as towers get crewed, and that is a known cost with a scheduled fix.** Eight
 * crews is forty slots against a forty-nine character roster, so a player who has filled every
 * tower has almost nobody left to dispatch, and the board stops being a bench sink because there
 * is no bench. The agreed answer is to invert the rule rather than widen it: let anybody be
 * dispatched, and refuse to *fight* with somebody who is away. That moves the check from
 * "dispatch" to the battle path, where it costs the player a crew they must fill in rather than a
 * mission they cannot start. Until it lands, this is the honest conservative reading — it can only
 * refuse things, never let a character be in two places at once.
 */
function fieldedMembers(state: GameState): ReadonlySet<string> {
  const fielded = new Set<string>();
  for (const formation of Object.values(state.formations)) {
    for (const member of [...formation.front, ...formation.back]) {
      fielded.add(member);
    }
  }
  return fielded;
}

/** No missions running. A new run starts here. */
export function emptyDispatches(): readonly Dispatch[] {
  return [];
}

/**
 * Everybody currently away, as a set.
 *
 * A set rather than a list because every caller asks "is this one away" rather than "who is away",
 * and the roster screen asks it once per row.
 */
export function awayMembers(state: GameState): ReadonlySet<string> {
  const away = new Set<string>();
  for (const dispatch of state.dispatches) {
    for (const member of dispatch.members) {
      away.add(member);
    }
  }
  return away;
}

/** The dispatch running `bountyId`, if there is one. */
export function dispatchOf(state: GameState, bountyId: string): Dispatch | undefined {
  return state.dispatches.find((dispatch) => dispatch.bountyId === bountyId);
}

/**
 * Every mission currently out, in the pool's authored order.
 *
 * ⚠️ **Missions stack, and nothing limits how many run at once except the bench.** An earlier build
 * allowed one per tier so the board could be four fixed rows; that was dropped deliberately — a
 * player with a wide roster should be able to run the whole board, which is the bench sink working
 * rather than a hole in it. What bounds the faucet is `BountyBoardRulesData.missions` and the size
 * of the bench, both of which cost the player something.
 */
export function runningBounties(
  state: GameState,
  bounties: readonly BountyData[],
): readonly BountyData[] {
  return bounties.filter((bounty) => dispatchOf(state, bounty.id) !== undefined);
}

/** Whether the run has cleared enough stages for this mission to be offered. */
export function isUnlocked(bounty: BountyData, state: GameState): boolean {
  const required = Number.isFinite(bounty.unlockClears) ? Math.max(bounty.unlockClears, 0) : 0;
  return state.clearedStages >= required;
}

/**
 * A day, in milliseconds.
 *
 * Spelled out here rather than imported from `quests.ts` because the two systems agree on the
 * **boundary**, which is authored in `data/` and asserted equal there, rather than on an
 * implementation. A shared constant would read as one system depending on the other.
 */
const DAY_MS = 86_400_000;

/** How far past midnight UTC the day rolls, in milliseconds, from a possibly-damaged rule. */
function resetOffsetMs(rules: BountyBoardRulesData): number {
  return Number.isFinite(rules.resetOffsetMinutes) ? rules.resetOffsetMinutes * 60_000 : 0;
}

/**
 * Which day's board `nowMs` falls on.
 *
 * The same shape as `periodIndex` in `quests.ts`: a whole number counting upward, clamped at zero
 * so a pre-epoch or non-finite clock reads as the first day rather than producing a negative index
 * that the derived draw would then have to guard against.
 */
export function boardDayIndex(rules: BountyBoardRulesData, nowMs: number): number {
  if (!Number.isFinite(nowMs)) {
    return 0;
  }
  return Math.max(Math.floor((nowMs - resetOffsetMs(rules)) / DAY_MS), 0);
}

/** Milliseconds until the board rotates, for the countdown on the screen. */
export function msUntilRotation(rules: BountyBoardRulesData, nowMs: number): number {
  if (!Number.isFinite(nowMs)) {
    return DAY_MS;
  }
  const since = nowMs - resetOffsetMs(rules);
  // Two modulos, because a clock before the first boundary makes `since` negative and `%` in
  // JavaScript keeps the sign — which would hand the screen a negative countdown.
  const into = ((since % DAY_MS) + DAY_MS) % DAY_MS;
  return DAY_MS - into;
}

/**
 * The day's shuffle of the **whole** pool, as indices into `bounties`.
 *
 * ⚠️ **Fisher–Yates over the entire pool, before anything is filtered.** Shuffling only the
 * unlocked missions would make the draw a function of the clear count, so crossing an unlock
 * threshold would reshuffle every mission on the board — a player would watch rows they had been
 * reading change for no reason they could see. Shuffling everything and filtering afterwards means
 * an unlock can only ever *insert*: the missions already on the board keep their relative order.
 *
 * The same discipline as the count draw in `rollDrops`. What matters is that the number of draws is
 * fixed, not what they cost.
 */
function dayOrder(seed: number, size: number, dayIndex: number): readonly number[] {
  const draw = derivedStream(seed, `bounties:${dayIndex}`);
  const order = Array.from({ length: size }, (_, index) => index);
  for (let index = size - 1; index > 0; index--) {
    // `Math.min` guards the 1.0 a stream is not supposed to produce and an index would fall off.
    const pick = Math.min(Math.floor(draw() * (index + 1)), index);
    [order[index], order[pick]] = [order[pick], order[index]];
  }
  return order;
}

/**
 * The missions standing on the board today.
 *
 * ## Derived from the seed and the day, never stored
 *
 * The same guarantee `gearShopOffers` gives: there is no stock to persist, migrate or repair, and
 * ⚠️ **rerolling is impossible rather than merely detectable** — force-quitting cannot re-take a
 * draw that is a pure function of the run's seed and the day index.
 *
 * ## ⚠️ Missions stack, and every running one holds a place
 *
 * The board is `rules.missions` rows: **every mission currently out**, then filled up from the day's
 * shuffle of what the run has unlocked. A 24-hour campaign crosses a rotation boundary by
 * definition, so dropping it at 04:00 would strand a crew a player is eleven hours into with no way
 * to collect them.
 *
 * Running missions **count against the total**, which is what makes the board behave the way a
 * player expects: send everything and the board is full, collect one and a new mission takes its
 * place. Nothing caps how many run at once except the board size and the bench — an earlier build
 * allowed one per tier, and that was a screen-layout rule masquerading as a game rule.
 *
 * ## Order on screen is authored order, not draw order
 *
 * The shuffle decides *which* missions; `data/` decides how they read. Sorting back into pool order
 * keeps the board shortest-first, so it still reads as a ladder rather than as a bag.
 */
export function dailyBoard(
  state: GameState,
  bounties: readonly BountyData[],
  rules: BountyBoardRulesData,
  dayIndex: number,
): readonly BountyData[] {
  const day = Number.isFinite(dayIndex) ? Math.max(Math.floor(dayIndex), 0) : 0;
  const size = Number.isFinite(rules.missions) ? Math.max(Math.floor(rules.missions), 0) : 0;
  if (size === 0 || bounties.length === 0) {
    return [];
  }

  const chosen = new Set<string>();
  for (const bounty of runningBounties(state, bounties)) {
    chosen.add(bounty.id);
  }

  for (const index of dayOrder(state.rng.seed, bounties.length, day)) {
    if (chosen.size >= size) {
      break;
    }
    const bounty = bounties[index];
    if (isUnlocked(bounty, state)) {
      chosen.add(bounty.id);
    }
  }

  return bounties.filter((bounty) => chosen.has(bounty.id));
}

/**
 * How many of `members` belong to `faction`.
 *
 * A character the lookup does not know counts for nothing rather than for anything — an id the
 * build no longer ships must not satisfy a requirement by being unrecognisable.
 */
function factionCount(
  members: readonly string[],
  characters: ReadonlyMap<string, CharacterData>,
  faction: string,
): number {
  return members.filter((member) => characters.get(member)?.faction === faction).length;
}

/** Whether `members` satisfy whatever faction `bounty` asks for. Missions asking nothing pass. */
export function meetsRequirement(
  bounty: BountyData,
  members: readonly string[],
  characters: ReadonlyMap<string, CharacterData>,
): boolean {
  const required = bounty.requires;
  if (required === undefined) {
    return true;
  }
  const wanted = Number.isFinite(required.count) ? Math.max(Math.floor(required.count), 0) : 0;
  return factionCount(members, characters, required.faction) >= wanted;
}

/** How a mission is going. */
export interface BountyProgress {
  readonly bounty: BountyData;
  /** The dispatch running it, or `undefined` when nobody is on it. */
  readonly dispatch: Dispatch | undefined;
  readonly running: boolean;
  /** Whether it has run its full duration and is waiting to be collected. */
  readonly ready: boolean;
  /** Milliseconds still to run. Zero when ready or idle. */
  readonly remainingMs: number;
  /** How far through, in `[0, 1]`. Zero when idle. */
  readonly fraction: number;
  /** Whether the run has cleared enough stages to send anybody. */
  readonly unlocked: boolean;
}

/** A duration read off authored content or an untrusted save, as a positive number of ms. */
function positiveMs(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * How `bounty` is going at `nowMs`.
 *
 * ⚠️ **Elapsed time is clamped at zero**, which is the backwards-clock rule in this system. A
 * device clock moved behind a dispatch's `startedAt` would otherwise produce negative elapsed time
 * and a `remainingMs` *longer* than the mission — so a player who changed timezone would watch a
 * finished mission become unfinished. Clamp; do not detect. Nothing here is worth protecting.
 */
export function bountyProgress(
  bounty: BountyData,
  state: GameState,
  nowMs: number,
): BountyProgress {
  const dispatch = dispatchOf(state, bounty.id);
  const unlocked = isUnlocked(bounty, state);
  if (dispatch === undefined) {
    return {
      bounty,
      dispatch: undefined,
      running: false,
      ready: false,
      remainingMs: 0,
      fraction: 0,
      unlocked,
    };
  }

  const duration = positiveMs(bounty.durationMs, 1);
  const now = Number.isFinite(nowMs) ? nowMs : dispatch.startedAt;
  const elapsed = Math.max(now - dispatch.startedAt, 0);
  const remainingMs = Math.max(duration - elapsed, 0);
  return {
    bounty,
    dispatch,
    running: true,
    ready: remainingMs === 0,
    remainingMs,
    fraction: Math.min(elapsed / duration, 1),
    unlocked,
  };
}

/** Every mission's progress, in the order they were authored. */
export function allBountyProgress(
  bounties: readonly BountyData[],
  state: GameState,
  nowMs: number,
): readonly BountyProgress[] {
  return bounties.map((bounty) => bountyProgress(bounty, state, nowMs));
}

/**
 * What a bounty pays, given the rates the run currently earns.
 *
 * ⚠️ **`summons` is absent and must stay absent.** The crystal rate is linear in the clear count
 * specifically so it cannot outrun a flat `PULL_COST`; paying a multiple of it on a repeatable
 * timer is the compounding that rule exists to prevent. Gold, xp and essence are the three that
 * are *meant* to compound, which is exactly why a duration of them is the right unit.
 *
 * Rounded to whole numbers because these are shown to the player, and dropped entirely when they
 * round to nothing — "+0 essence" on a results panel reads as a bug rather than as a small reward.
 */
export function bountyPayout(bounty: BountyData, rates: Rates): CurrencyAmounts {
  const seconds = Number.isFinite(bounty.payoutSeconds) ? Math.max(bounty.payoutSeconds, 0) : 0;
  const paid: Partial<Record<CurrencyId, Numeric>> = {};
  for (const id of ['gold', 'xp', 'essence'] as const) {
    const amount = rates[id].mul(seconds).round();
    if (amount.gt(ZERO)) {
      paid[id] = amount;
    }
  }
  return paid;
}

/**
 * Sends `members` on `bounty`.
 *
 * Every refusal is a distinct reason rather than a boolean, because each one has a different
 * sentence attached on screen — "they are already fighting" and "that mission is already running"
 * are not the same problem and do not have the same fix.
 *
 * ⚠️ **The formation check is half of the disjointness invariant.** The other half lives in
 * `setFormation`, which refuses to field anybody away. Both are required: this one alone would let
 * a player dispatch from the bench and then walk the same character into a formation. Since
 * milestone 15a it reads **every** activity's crew — see {@link fieldedMembers} for why that is the
 * interim reading and what replaces it.
 *
 * ⚠️ **Nothing here limits how many missions run at once**, and that is deliberate. The only thing
 * a second simultaneous mission costs is the crew it takes off the bench, which is exactly the
 * scarcity this system exists to create — a rule capping concurrency would be spending the player's
 * roster breadth twice.
 */
export function dispatchBounty(
  state: GameState,
  bounty: BountyData,
  members: readonly string[],
  characters: ReadonlyMap<string, CharacterData>,
  nowMs: number,
): BountyResult {
  if (!isUnlocked(bounty, state)) {
    return fail('locked');
  }
  if (dispatchOf(state, bounty.id) !== undefined) {
    return fail('already-running');
  }
  const crew = Number.isFinite(bounty.crew) ? Math.max(Math.floor(bounty.crew), 1) : 1;
  if (members.length !== crew) {
    return fail('wrong-crew-size');
  }
  if (new Set(members).size !== members.length) {
    return fail('duplicate-member');
  }

  const fielded = fieldedMembers(state);
  const away = awayMembers(state);
  for (const member of members) {
    if (state.roster.every((owned) => owned.defId !== member)) {
      return fail('not-owned');
    }
    if (fielded.has(member)) {
      return fail('in-formation');
    }
    if (away.has(member)) {
      return fail('already-away');
    }
  }

  // Last, so a crew that is both unowned and of the wrong faction reports the problem the player
  // can actually act on first.
  if (!meetsRequirement(bounty, members, characters)) {
    return fail('wrong-faction');
  }

  const startedAt = Number.isFinite(nowMs) ? nowMs : 0;
  return {
    ok: true,
    state: {
      ...state,
      dispatches: [...state.dispatches, { bountyId: bounty.id, members: [...members], startedAt }],
    },
  };
}

/**
 * Collects a finished mission, paying it and bringing the crew home.
 *
 * Refuses an unfinished one rather than paying a partial reward: a mission is a wait, and letting
 * it be cashed early would make the wait optional, which is the entire mechanic.
 */
export function collectBounty(state: GameState, bounty: BountyData, nowMs: number): BountyResult {
  const progress = bountyProgress(bounty, state, nowMs);
  if (!progress.running) {
    return fail('not-running');
  }
  if (!progress.ready) {
    return fail('not-finished');
  }

  const gained = bountyPayout(bounty, state.rates);
  return {
    ok: true,
    state: {
      ...state,
      wallet: credit(state.wallet, gained),
      dispatches: state.dispatches.filter((dispatch) => dispatch.bountyId !== bounty.id),
    },
    gained,
  };
}

/** What collecting everything finished did. */
export interface CollectAllResult {
  readonly state: GameState;
  readonly gained: CurrencyAmounts;
  /** How many missions were collected. */
  readonly missions: number;
}

/**
 * Collects every finished mission in one pass.
 *
 * One press for the same reason the Altar's `ascendAll` is one press: a finished mission has no
 * alternative use and no two of them compete, so "collect everything" is the only move rather than
 * a strategy.
 *
 * ⚠️ Returns the same state object when nothing was ready, which callers use to tell a real change
 * from a no-op.
 */
export function collectReadyBounties(
  state: GameState,
  bounties: readonly BountyData[],
  nowMs: number,
): CollectAllResult {
  let next = state;
  let gained: Partial<Record<CurrencyId, Numeric>> = {};
  let missions = 0;

  for (const bounty of bounties) {
    const result = collectBounty(next, bounty, nowMs);
    if (!result.ok) {
      continue;
    }
    next = result.state;
    missions++;
    for (const [id, amount] of Object.entries(result.gained ?? {})) {
      const currency = id as CurrencyId;
      gained = { ...gained, [currency]: (gained[currency] ?? ZERO).add(amount) };
    }
  }

  return missions === 0 ? { state, gained: {}, missions: 0 } : { state: next, gained, missions };
}

/**
 * Everybody who could be sent right now: owned, not fighting, not already away — in roster order.
 *
 * ⚠️ **Both exclusions are the disjointness invariant**, and this is the single place the screen
 * and {@link dispatchOpenBounties} both read it from. A picker offering somebody `dispatchBounty`
 * would refuse is how a player learns a rule by being told "no".
 */
export function benchMembers(state: GameState): readonly string[] {
  const fielded = fieldedMembers(state);
  const away = awayMembers(state);
  return state.roster
    .map((owned) => owned.defId)
    .filter((defId) => !fielded.has(defId) && !away.has(defId));
}

/**
 * A crew for `bounty` out of `bench`, or `undefined` when one cannot be made.
 *
 * **Faction first, then anybody.** Filling the requirement last would let a general slot take the
 * only Dwarf on the bench and then fail a mission that was crewable — the ordinary shape of this
 * bug, and the reason the two passes are not one.
 */
function pickCrew(
  bounty: BountyData,
  bench: readonly string[],
  characters: ReadonlyMap<string, CharacterData>,
): readonly string[] | undefined {
  const crew = Number.isFinite(bounty.crew) ? Math.max(Math.floor(bounty.crew), 1) : 1;
  const chosen: string[] = [];

  const required = bounty.requires;
  if (required !== undefined) {
    // Clamped to the crew size as well as at zero: `data/` may not author more of a faction than
    // the mission has seats, but a clamp here is what stops that being an unfillable crew rather
    // than a failing test.
    const wanted = Math.min(
      Number.isFinite(required.count) ? Math.max(Math.floor(required.count), 0) : 0,
      crew,
    );
    for (const defId of bench) {
      if (chosen.length >= wanted) {
        break;
      }
      if (characters.get(defId)?.faction === required.faction) {
        chosen.push(defId);
      }
    }
    if (chosen.length < wanted) {
      return undefined;
    }
  }

  for (const defId of bench) {
    if (chosen.length >= crew) {
      break;
    }
    if (!chosen.includes(defId)) {
      chosen.push(defId);
    }
  }
  return chosen.length === crew ? chosen : undefined;
}

/** What one press of Dispatch all did. */
export interface DispatchAllResult {
  readonly state: GameState;
  /** How many missions were sent. */
  readonly dispatched: number;
}

/**
 * Fills every open mission on `board` from the bench, in one press.
 *
 * ## ⚠️ This is not `ascendAll`, and the difference is worth stating
 *
 * The Altar's one-press climb needs no confirmation because **nothing is foregone**: copies are
 * spent on the character they are copies of, so no two ascensions compete. Crews *do* compete —
 * every character this sends is one the next mission cannot have — so this genuinely resolves a
 * choice rather than merely executing the only move.
 *
 * It is offered anyway, and the reason is that the stakes are a **wait rather than a loss**: the
 * characters come back, nothing is consumed, and the worst outcome is a mission crewed in an order
 * the player would not have picked. What that buys is the obligation to be **predictable** rather
 * than clever:
 *
 * - **Board order, top to bottom**, which is the order on screen. Filling the longest or the
 *   best-paying first would be invisible cleverness — a player cannot predict it, and a player who
 *   wants a particular assignment has the per-mission picker.
 * - **Roster order within a mission**, so the same bench produces the same crews every time.
 *
 * ⚠️ Returns the same state object when nothing was sent, which callers use to tell a real change
 * from a no-op.
 */
export function dispatchOpenBounties(
  state: GameState,
  board: readonly BountyData[],
  characters: ReadonlyMap<string, CharacterData>,
  nowMs: number,
): DispatchAllResult {
  let next = state;
  let dispatched = 0;

  for (const bounty of board) {
    if (!isUnlocked(bounty, next) || dispatchOf(next, bounty.id) !== undefined) {
      continue;
    }
    // Recomputed per mission, so characters this pass has already sent are off the bench.
    const crew = pickCrew(bounty, benchMembers(next), characters);
    if (crew === undefined) {
      continue;
    }
    const result = dispatchBounty(next, bounty, crew, characters, nowMs);
    if (!result.ok) {
      continue;
    }
    next = result.state;
    dispatched++;
  }

  return dispatched === 0 ? { state, dispatched: 0 } : { state: next, dispatched };
}

/**
 * Drops dispatches a build can no longer honour, and repairs the disjointness invariant.
 *
 * Runs on every load like `grantStarters` and `reconcileClearedStages`, for the same reason: it
 * needs content `core/` cannot see, and it is idempotent so it costs nothing when there is nothing
 * to fix.
 *
 * Four kinds of damage, all resolved by **bringing the crew home rather than by keeping a
 * half-valid dispatch**:
 *
 * - a mission id this build no longer ships — the duration and payout are gone with it, so there
 *   is no way to say when it finishes or what it owes;
 * - a crew naming somebody the roster no longer holds;
 * - a crew naming somebody standing in **any** activity's formation, which is the invariant this
 *   file exists to protect and the one thing a hand-edited save is most likely to break;
 * - the same character on two missions at once.
 *
 * ⚠️ **Two missions on the same tier is _not_ damage**, and an earlier build wrongly dropped one of
 * them. Missions stack; a tier is an authoring group, not a limit.
 *
 * ⚠️ **A dropped dispatch pays nothing**, and that is the deliberate choice. Paying it would make
 * damaging a save a way to collect instantly, which in a game with no anti-cheat is not a security
 * problem but *is* a way for a corrupted save to silently inflate a run. Losing an in-flight
 * mission costs the player one wait.
 *
 * ⚠️ **The faction requirement is deliberately not checked here.** A requirement is a gate on
 * *starting* a mission, not a property of one already running — so a crew that no longer satisfies
 * a retuned requirement is kept rather than dropped. Because every drop is unpaid, dropping one
 * would punish a player for a content change they did not make, and there is nothing to protect:
 * no write path can produce such a dispatch, and this project has no anti-cheat by design.
 *
 * Returns the same object when nothing was wrong, so a clean load does not republish a snapshot.
 */
export function repairDispatches(
  state: GameState,
  bounties: readonly BountyData[],
  note?: (field: string, problem: string, recovered: string) => void,
): GameState {
  const known = new Set(bounties.map((bounty) => bounty.id));
  const owned = new Set(state.roster.map((entry) => entry.defId));
  const fielded = fieldedMembers(state);
  const seen = new Set<string>();
  const kept: Dispatch[] = [];

  for (const dispatch of state.dispatches) {
    const problem = !known.has(dispatch.bountyId)
      ? 'names a mission this build does not ship'
      : dispatch.members.some((member) => !owned.has(member))
        ? 'names a character the roster does not hold'
        : dispatch.members.some((member) => fielded.has(member))
          ? 'names a character standing in the formation'
          : dispatch.members.some((member) => seen.has(member))
            ? 'names a character already away on another mission'
            : undefined;

    if (problem !== undefined) {
      note?.(`dispatches.${dispatch.bountyId}`, problem, 'crew brought home');
      continue;
    }
    for (const member of dispatch.members) {
      seen.add(member);
    }
    kept.push(dispatch);
  }

  return kept.length === state.dispatches.length ? state : { ...state, dispatches: kept };
}

/** A field that could not be loaded as written, in the shape the save layer reports. */
type Note = (field: string, problem: string, recovered: string) => void;

/**
 * Decodes the dispatch list from an untrusted save.
 *
 * Shape only. Whether a mission id exists, whether the crew is owned and whether anybody is also
 * in the formation are all questions about *content* and about the rest of the state, so they
 * belong to {@link repairDispatches} — the same split `readGear` and `repairLoadouts` already use.
 */
export function parseDispatches(raw: unknown, note: Note): readonly Dispatch[] {
  if (raw === undefined) {
    return [];
  }
  if (!Array.isArray(raw)) {
    note('dispatches', 'not a list', 'nobody away');
    return [];
  }

  const dispatches: Dispatch[] = [];
  for (const [index, entry] of raw.entries()) {
    if (typeof entry !== 'object' || entry === null) {
      note(`dispatches[${index}]`, 'not an object', 'dropped');
      continue;
    }
    const record = entry as Record<string, unknown>;
    const bountyId = record['bountyId'];
    const startedAt = record['startedAt'];
    const members = record['members'];

    if (typeof bountyId !== 'string' || bountyId === '') {
      note(`dispatches[${index}].bountyId`, 'missing or unusable', 'dropped');
      continue;
    }
    if (typeof startedAt !== 'number' || !Number.isFinite(startedAt) || startedAt < 0) {
      note(`dispatches[${index}].startedAt`, 'not a usable timestamp', 'dropped');
      continue;
    }
    if (!Array.isArray(members)) {
      note(`dispatches[${index}].members`, 'not a list', 'dropped');
      continue;
    }
    const crew = members.filter((member): member is string => typeof member === 'string');
    if (crew.length !== members.length) {
      note(`dispatches[${index}].members`, 'contains non-id entries', 'dropped');
      continue;
    }
    dispatches.push({ bountyId, members: crew, startedAt });
  }
  return dispatches;
}

/** Encodes the dispatch list for persistence. */
export function serializeDispatches(
  dispatches: readonly Dispatch[],
): { bountyId: string; members: string[]; startedAt: number }[] {
  return dispatches.map((dispatch) => ({
    bountyId: dispatch.bountyId,
    members: [...dispatch.members],
    startedAt: dispatch.startedAt,
  }));
}

/** Convenience for the UI: `num` re-exported is not wanted, but a zero payout check is. */
export function isPayoutEmpty(payout: CurrencyAmounts): boolean {
  return (['gold', 'xp', 'essence'] as const).every((id) => (payout[id] ?? num(0)).lte(ZERO));
}
