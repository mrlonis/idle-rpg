import { accrue, credit, isEmpty, type RateCurrencyId, zeroRates } from './currency';
import { type Numeric } from './numeric';
import { type GameState } from './state';

/**
 * The earliest `lastTickAt` treated as a real timestamp rather than as damage.
 *
 * **There is no offline cap** — a year away pays a year — and removing it took away the ceiling
 * that used to bound a corrupt `lastTickAt` incidentally. A damaged timestamp of zero is finite
 * and produces a positive delta, so it passes every other guard here and would pay out decades
 * of income, silently wrecking a run's pacing without the player ever choosing it.
 *
 * A literal rather than a `Date` expression, because `core/` has no clock. It is
 * `2020-01-01T00:00:00Z`: comfortably before this project existed, and comfortably after the
 * epoch-adjacent values that damage actually produces.
 */
export const MIN_PLAUSIBLE_TICK_MS = 1_577_836_800_000;

export interface OfflineReport {
  /** The raw delta, before the clock guards. For display and diagnostics. */
  readonly rawElapsedMs: number;
  /** The delta actually paid out. Equal to `rawElapsedMs` unless a clock guard fired. */
  readonly elapsedMs: number;
  /**
   * What was earned over the paid window, per currency.
   *
   * Complete rather than partial — every rate-bearing currency is present, at zero if it earned
   * nothing — so a caller never has to distinguish "earned nothing" from "was not paid at all".
   */
  readonly earned: Readonly<Record<RateCurrencyId, Numeric>>;
}

/**
 * Settles the away period and returns both the updated state and a report to show the
 * player.
 *
 * The elapsed window is never replayed tick by tick, and with no cap that argument stops being
 * a nicety: a year at 10Hz is 315 million iterations on resume. Every currency accrues at a
 * fixed rate, so the exact answer is one multiplication per currency and a year settles in the
 * same O(1) as a minute. That is what makes an uncapped window affordable at all.
 *
 * **The rates are constant across any offline window**, which is what makes the closed form
 * exactly right rather than merely close. Battles only ever resolve with the app in the
 * foreground — auto-battle included, by design — so nothing clears a stage, and therefore
 * nothing raises a rate, while the player is away.
 *
 * That is a permanent property of the design rather than a temporary one, so there is no
 * segmented solver and none is owed. Reversing the foreground-only rule is what would change
 * it; see `docs/milestones.md`.
 *
 * There is deliberately **no upper bound**. The genre caps offline income to force a daily
 * session; there is no session to force here and nothing to sell by forcing it. Come back a year
 * later and the game pays a year.
 *
 * Three clock guards, none of them anti-cheat:
 * - A negative delta means the device clock moved backwards. Clamp to zero and pay out
 *   nothing rather than punishing the player for a timezone change or an NTP correction.
 * - A non-finite delta means `lastTickAt` was damaged. Treat it as zero.
 * - A `lastTickAt` below {@link MIN_PLAUSIBLE_TICK_MS} is damage rather than an absence, and
 *   pays nothing. Without a cap overhead, nothing else would catch it.
 */
export function resume(
  state: GameState,
  nowMs: number,
): { state: GameState; report: OfflineReport } {
  const rawElapsedMs = nowMs - state.lastTickAt;
  const damaged = !Number.isFinite(rawElapsedMs) || state.lastTickAt < MIN_PLAUSIBLE_TICK_MS;
  const elapsedMs = damaged ? 0 : Math.max(rawElapsedMs, 0);

  const earned = accrue(state.rates, elapsedMs / 1000);

  return {
    state: {
      ...state,
      wallet: credit(state.wallet, earned),
      lastTickAt: nowMs,
    },
    report: {
      rawElapsedMs,
      elapsedMs,
      earned,
    },
  };
}

/** `true` when a report paid out nothing worth showing the player. */
export function paidNothing(report: OfflineReport): boolean {
  return isEmpty(report.earned);
}

export interface DiscreteAccrual {
  /** Whole units awarded now. */
  readonly whole: number;
  /** Fractional remainder to carry in the save until it completes a whole unit. */
  readonly carry: number;
}

/**
 * Converts an expected quantity of discrete drops into whole units plus a carried
 * remainder.
 *
 * Offline loot is paid at expected value with deterministic rounding rather than rolled.
 * Rolling invites force-quit-and-relaunch rerolling, and an expected-value summary reads
 * as fair: "37 clears, 3 shards" is legible in a way that a random payout is not.
 *
 * The remainder is carried in the save so that many short sessions accrue at the same rate
 * as one long one, instead of rounding away to nothing.
 *
 * **Nothing calls this, and nothing is planned to.** Idle income is the four continuous rates
 * and nothing else — nothing drops while the player is away — so there is no `dropCarry` field
 * in `GameState` and no reason to add one. Kept because it is eight specified lines encoding a
 * rule worth not re-deriving under pressure: offline loot is paid at expected value, never
 * rolled. Do not wire it up to manufacture a use for it; see `docs/milestones.md`.
 */
export function accrueDiscrete(carry: number, expected: number): DiscreteAccrual {
  const safeCarry = Number.isFinite(carry) && carry > 0 ? carry : 0;
  const safeExpected = Number.isFinite(expected) && expected > 0 ? expected : 0;
  const total = safeCarry + safeExpected;
  const whole = Math.floor(total);
  return { whole, carry: total - whole };
}

/** Zero-valued report, for the case where a resume pays out nothing. */
export const EMPTY_OFFLINE_REPORT: OfflineReport = {
  rawElapsedMs: 0,
  elapsedMs: 0,
  earned: zeroRates(),
};
