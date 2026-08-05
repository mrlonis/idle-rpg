import {
  parseRates,
  parseWallet,
  type Rates,
  serializeRates,
  serializeWallet,
  type Wallet,
} from '../currency';
import { type LevelCurveData } from '../roster/level';
import { type CharacterLookup, repairOwned } from '../roster/roster';
import { type OwnedCharacter } from '../roster/types';
import { type GameState, type PartyFormation, rowCapacity } from '../state';
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
  /**
   * The characters this build actually ships, so a roster entry naming one that no longer
   * exists can be dropped rather than carried forward as a character nothing can render.
   *
   * Required rather than optional: a save is untrusted input, and a repair pass that cannot
   * check ids would silently pass damage through to the UI, where it becomes a crash instead
   * of a reported issue.
   */
  readonly characters: CharacterLookup;
  /** The level curve, so a level above its rarity's cap can be clamped. */
  readonly levelCurve: LevelCurveData;
}

export interface RepairResult {
  readonly state: GameState;
  readonly issues: readonly RepairIssue[];
}

/** Encodes runtime state into the current JSON-safe save shape. */
export function toSaveData(state: GameState): CurrentSaveData {
  return {
    version: SAVE_VERSION,
    wallet: serializeWallet(state.wallet),
    rates: serializeRates(state.rates),
    lastTickAt: state.lastTickAt,
    rng: { seed: state.rng.seed, calls: state.rng.calls },
    chapter: state.chapter,
    stage: state.stage,
    clearedStages: state.clearedStages,
    battleCount: state.battleCount,
    roster: state.roster.map((owned) => ({
      defId: owned.defId,
      rarity: owned.rarity,
      level: owned.level,
      copies: owned.copies,
    })),
    formation: {
      front: [...state.formation.front],
      back: [...state.formation.back],
    },
    pity: state.pity,
    pullCount: state.pullCount,
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
 * rate becomes 0, a missing seed adopts the caller's fallback, a character id this build no
 * longer ships is dropped. Every substitution is reported in `issues` so the UI can tell the
 * player their save was recovered, and so bug reports say what was wrong rather than just
 * "it broke".
 */
export function fromSaveData(raw: unknown, options: RepairOptions): RepairResult {
  const issues: RepairIssue[] = [];
  const record = asRecord(raw);
  const note = (field: string, problem: string, recovered: string): void => {
    issues.push({ field, problem, recovered });
  };

  const wallet: Wallet = parseWallet(record['wallet'], note);
  const rates: Rates = parseRates(record['rates'], note);

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

  // Bounded integers, which is exactly why they are stored as counters rather than ids: they
  // can be repaired here without core/ knowing what content the build actually contains. The
  // caller clamps the `chapter`/`stage` pair to the ladder it actually ships — see
  // `clampPosition` — because how long a chapter is, is content.
  const chapter = readCounter(record['chapter'], 'chapter', 1, note);
  const stage = readCounter(record['stage'], 'stage', 1, note);
  const clearedStages = readCounter(record['clearedStages'], 'clearedStages', 0, note);
  const battleCount = readCounter(record['battleCount'], 'battleCount', 0, note);
  const pity = readCounter(record['pity'], 'pity', 0, note);
  const pullCount = readCounter(record['pullCount'], 'pullCount', 0, note);

  const roster = readRoster(record['roster'], options, note);
  const formation = readFormation(record['formation'], roster, note);

  return {
    state: {
      version: SAVE_VERSION,
      wallet,
      rates,
      lastTickAt,
      rng: { seed, calls },
      chapter,
      stage,
      clearedStages,
      battleCount,
      roster,
      formation,
      pity,
      pullCount,
    },
    issues,
  };
}

/**
 * Decodes the roster, dropping anything this build cannot render.
 *
 * Three kinds of damage are handled distinctly, because they mean different things: an entry
 * naming a character that no longer ships is dropped outright, a second entry for a character
 * already read is dropped as a duplicate, and an entry with a damaged rarity or level is kept
 * and clamped. Only the last of those is recoverable, and keeping it is the difference between
 * a player losing one character's progress and losing the character.
 */
function readRoster(
  raw: unknown,
  options: RepairOptions,
  note: (field: string, problem: string, recovered: string) => void,
): readonly OwnedCharacter[] {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (!Array.isArray(raw)) {
    note('roster', `not an array (${JSON.stringify(raw) ?? 'undefined'})`, 'empty roster');
    return [];
  }

  const seen = new Set<string>();
  const roster: OwnedCharacter[] = [];
  for (const entry of raw) {
    const record = asRecord(entry);
    const defId = record['defId'];
    if (typeof defId !== 'string') {
      note(
        'roster[]',
        `entry has no character id (${JSON.stringify(entry) ?? 'undefined'})`,
        'dropped',
      );
      continue;
    }
    const character = options.characters.get(defId);
    if (character === undefined) {
      note('roster[]', `unknown character "${defId}"`, 'dropped');
      continue;
    }
    if (seen.has(defId)) {
      note('roster[]', `duplicate entry for "${defId}"`, 'dropped');
      continue;
    }
    seen.add(defId);
    roster.push(
      repairOwned(
        {
          defId,
          rarity: typeof record['rarity'] === 'number' ? record['rarity'] : 0,
          level: typeof record['level'] === 'number' ? record['level'] : 1,
          copies: typeof record['copies'] === 'number' ? record['copies'] : 0,
        },
        character,
        options.levelCurve,
      ),
    );
  }
  return roster;
}

/**
 * Decodes the formation, keeping only owned characters and trimming each rank to its capacity.
 *
 * The `placed` set is shared across both ranks rather than reset per rank, because a save that
 * names the same character in front and behind would otherwise produce a fighter that acts
 * twice — the one kind of damage here that a battle would happily run with and nobody would
 * report as a bug.
 */
function readFormation(
  raw: unknown,
  roster: readonly OwnedCharacter[],
  note: (field: string, problem: string, recovered: string) => void,
): PartyFormation {
  if (raw === undefined || raw === null) {
    return { front: [], back: [] };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    note('formation', `not an object (${JSON.stringify(raw) ?? 'undefined'})`, 'empty formation');
    return { front: [], back: [] };
  }

  const owned = new Set(roster.map((entry) => entry.defId));
  const placed = new Set<string>();
  const record = asRecord(raw);

  const readRank = (row: 'front' | 'back'): string[] => {
    const value = record[row];
    if (value === undefined || value === null) {
      return [];
    }
    if (!Array.isArray(value)) {
      note(`formation.${row}`, `not an array (${JSON.stringify(value) ?? 'undefined'})`, 'empty');
      return [];
    }

    const rank: string[] = [];
    const capacity = rowCapacity(row);
    for (const id of value) {
      if (typeof id !== 'string' || !owned.has(id) || placed.has(id)) {
        note(
          `formation.${row}[]`,
          `not an unplaced owned character (${JSON.stringify(id) ?? 'undefined'})`,
          'dropped',
        );
        continue;
      }
      if (rank.length >= capacity) {
        note(`formation.${row}`, `more than ${capacity} members`, `trimmed to ${capacity}`);
        break;
      }
      placed.add(id);
      rank.push(id);
    }
    return rank;
  };

  const front = readRank('front');
  const back = readRank('back');
  return { front, back };
}

/**
 * Reads an integer counter that must be at least `floor`, defaulting to `floor` when it is
 * damaged. Shared by the progression fields, which have identical failure modes and would
 * otherwise be several copies of the same eight lines.
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
