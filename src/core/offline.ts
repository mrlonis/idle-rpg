import { type Numeric, ZERO } from './numeric';
import { type GameState } from './state';

/**
 * The maximum offline window that is paid out, in milliseconds.
 *
 * This is a pacing lever, not a security one. There is no PvP and nothing to buy, so
 * winding the device clock forward costs nothing and is not defended against — the cap
 * exists purely so there is a reason to come back tomorrow.
 */
export const OFFLINE_CAP_MS = 10 * 60 * 60 * 1000;

export interface OfflineReport {
  /** The unclamped delta, for display and diagnostics. */
  readonly rawElapsedMs: number;
  /** The delta actually paid out, after clamping to `[0, OFFLINE_CAP_MS]`. */
  readonly elapsedMs: number;
  /** `true` when the player was away longer than the cap. Worth surfacing in the UI. */
  readonly wasCapped: boolean;
  /** Gold earned over the paid window. */
  readonly gold: Numeric;
}

/**
 * Settles the away period and returns both the updated state and a report to show the
 * player.
 *
 * The elapsed window is never replayed tick by tick. Ten hours at 10Hz is 360,000
 * iterations on resume and would hang the device; gold accrues at a fixed rate, so the
 * exact answer is one multiplication.
 *
 * Two clock guards, neither of them anti-cheat:
 * - A negative delta means the device clock moved backwards. Clamp to zero and pay out
 *   nothing rather than punishing the player for a timezone change or an NTP correction.
 * - A non-finite delta means `lastTickAt` was damaged. Treat it as zero.
 */
export function resume(
  state: GameState,
  nowMs: number,
): { state: GameState; report: OfflineReport } {
  const rawElapsedMs = nowMs - state.lastTickAt;
  const safeElapsedMs = Number.isFinite(rawElapsedMs) ? Math.max(rawElapsedMs, 0) : 0;
  const elapsedMs = Math.min(safeElapsedMs, OFFLINE_CAP_MS);

  const gold = state.goldPerSec.mul(elapsedMs / 1000);

  return {
    state: {
      ...state,
      gold: state.gold.add(gold),
      lastTickAt: nowMs,
    },
    report: {
      rawElapsedMs,
      elapsedMs,
      wasCapped: safeElapsedMs > OFFLINE_CAP_MS,
      gold,
    },
  };
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
  wasCapped: false,
  gold: ZERO,
};
