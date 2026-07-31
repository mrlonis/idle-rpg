import { parseOr, serialize as serializeNumeric, tryParse, ZERO } from '../numeric';
import { type GameState } from '../state';
import { type CurrentSaveData } from './schema';
import { SAVE_VERSION } from './version';

/** A single field that could not be loaded as written and was defaulted or clamped. */
export interface RepairIssue {
  readonly field: string;
  readonly problem: string;
  readonly recovered: string;
}

export interface RepairOptions {
  /**
   * Seed to adopt when the save has none. Supplied by the caller because core cannot call
   * `Math.random()`.
   */
  readonly fallbackSeed: number;
  /** Epoch milliseconds, supplied by the caller because core has no clock. */
  readonly nowMs: number;
}

export interface RepairResult {
  readonly state: GameState;
  readonly issues: readonly RepairIssue[];
}

/** Encodes runtime state into the current JSON-safe save shape. */
export function toSaveData(state: GameState): CurrentSaveData {
  return {
    version: SAVE_VERSION,
    gold: serializeNumeric(state.gold),
    goldPerSec: serializeNumeric(state.goldPerSec),
    lastTickAt: state.lastTickAt,
    rng: { seed: state.rng.seed, calls: state.rng.calls },
    stage: state.stage,
    battleCount: state.battleCount,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

/**
 * Decodes a migrated save into runtime state, clamping and defaulting anything damaged.
 *
 * This never throws. A thrown error during load costs the player their entire run, so
 * every field degrades to a sane default instead: unparseable gold becomes 0, a negative
 * rate becomes 0, a missing seed adopts the caller's fallback. Every substitution is
 * reported in `issues` so the UI can tell the player their save was recovered, and so bug
 * reports say what was wrong rather than just "it broke".
 */
export function fromSaveData(raw: unknown, options: RepairOptions): RepairResult {
  const issues: RepairIssue[] = [];
  const record = asRecord(raw);
  const note = (field: string, problem: string, recovered: string): void => {
    issues.push({ field, problem, recovered });
  };

  let gold = parseOr(record['gold'], ZERO);
  if (tryParse(record['gold']) === undefined) {
    note('gold', `unparseable (${JSON.stringify(record['gold']) ?? 'undefined'})`, '0');
  }
  if (gold.lt(ZERO)) {
    note('gold', `negative (${gold.toString()})`, '0');
    gold = ZERO;
  }

  // Defaults to zero, matching a fresh run: idle income is earned by clearing stages, so
  // inventing a rate for a damaged save would hand out progress that was never made. It also
  // self-heals — the next clear raises the rate to whatever the stage grants.
  let goldPerSec = parseOr(record['goldPerSec'], ZERO);
  if (tryParse(record['goldPerSec']) === undefined) {
    note('goldPerSec', `unparseable (${JSON.stringify(record['goldPerSec']) ?? 'undefined'})`, '0');
  }
  if (goldPerSec.lt(ZERO)) {
    note('goldPerSec', `negative (${goldPerSec.toString()})`, '0');
    goldPerSec = ZERO;
  }

  const rawLastTick = record['lastTickAt'];
  let lastTickAt: number;
  if (typeof rawLastTick !== 'number' || !Number.isFinite(rawLastTick) || rawLastTick < 0) {
    note(
      'lastTickAt',
      `not a valid timestamp (${JSON.stringify(rawLastTick) ?? 'undefined'})`,
      'now',
    );
    lastTickAt = options.nowMs;
  } else if (rawLastTick > options.nowMs) {
    // The save is stamped in the future: the device clock moved backwards since it was
    // written. Normalise to now so the offline window is zero rather than negative.
    note('lastTickAt', `in the future (${rawLastTick} > ${options.nowMs})`, 'now');
    lastTickAt = options.nowMs;
  } else {
    lastTickAt = rawLastTick;
  }

  const rngRecord = asRecord(record['rng']);
  const rawSeed = rngRecord['seed'];
  let seed: number;
  if (typeof rawSeed !== 'number' || !Number.isFinite(rawSeed)) {
    note(
      'rng.seed',
      `missing or invalid (${JSON.stringify(rawSeed) ?? 'undefined'})`,
      'fallback seed',
    );
    seed = options.fallbackSeed >>> 0;
  } else {
    seed = rawSeed >>> 0;
  }

  const rawCalls = rngRecord['calls'];
  let calls: number;
  if (typeof rawCalls !== 'number' || !Number.isInteger(rawCalls) || rawCalls < 0) {
    note(
      'rng.calls',
      `not a non-negative integer (${JSON.stringify(rawCalls) ?? 'undefined'})`,
      '0',
    );
    calls = 0;
  } else {
    calls = rawCalls;
  }

  // Both progression counters are bounded integers, which is exactly why they are stored as
  // indices rather than ids: they can be repaired here without core/ knowing what stages the
  // shipped content actually contains. The caller clamps `stage` to the stages it has.
  const stage = readCounter(record['stage'], 'stage', 1, note);
  const battleCount = readCounter(record['battleCount'], 'battleCount', 0, note);

  return {
    state: {
      version: SAVE_VERSION,
      gold,
      goldPerSec,
      lastTickAt,
      rng: { seed, calls },
      stage,
      battleCount,
    },
    issues,
  };
}

/**
 * Reads an integer counter that must be at least `floor`, defaulting to `floor` when it is
 * damaged. Shared by the progression fields, which have identical failure modes and would
 * otherwise be two copies of the same eight lines.
 */
function readCounter(
  raw: unknown,
  field: string,
  floor: number,
  note: (field: string, problem: string, recovered: string) => void,
): number {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < floor) {
    note(
      field,
      `not an integer of at least ${floor} (${JSON.stringify(raw) ?? 'undefined'})`,
      String(floor),
    );
    return floor;
  }
  return raw;
}
