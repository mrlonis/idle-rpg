import { credit, type CurrencyAmounts, type CurrencyId, type Rates } from './currency';
import { num, type Numeric, ZERO } from './numeric';
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
 */

/** One authored mission. */
export interface BountyData {
  readonly id: string;
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
 * Everyone in the formation, as a set.
 *
 * ⚠️ **Spelled out rather than importing `formationMembers` from `state.ts`, and that is a real
 * constraint rather than a preference.** `state.ts` imports this module for {@link Dispatch} and
 * {@link emptyDispatches}, so importing a *value* back out of it closes a runtime dependency
 * cycle — which `import/no-cycle` rejects, and rightly: the two modules would then have an
 * initialisation order between them. `achievements.ts` and `quests.ts` avoid it by importing only
 * `type GameState`, and this file has to do the same. Two lines is the whole cost.
 */
function fieldedMembers(state: GameState): ReadonlySet<string> {
  return new Set([...state.formation.front, ...state.formation.back]);
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

/** Whether the run has cleared enough stages for this mission to be offered. */
export function isUnlocked(bounty: BountyData, state: GameState): boolean {
  const required = Number.isFinite(bounty.unlockClears) ? Math.max(bounty.unlockClears, 0) : 0;
  return state.clearedStages >= required;
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
 * a player dispatch from the bench and then walk the same character into the formation.
 */
export function dispatchBounty(
  state: GameState,
  bounty: BountyData,
  members: readonly string[],
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
 * - a crew naming somebody standing in the formation, which is the invariant this file exists to
 *   protect and the one thing a hand-edited save is most likely to break;
 * - the same character on two missions at once.
 *
 * ⚠️ **A dropped dispatch pays nothing**, and that is the deliberate choice. Paying it would make
 * damaging a save a way to collect instantly, which in a game with no anti-cheat is not a security
 * problem but *is* a way for a corrupted save to silently inflate a run. Losing an in-flight
 * mission costs the player one wait.
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
