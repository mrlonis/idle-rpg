import { parseAchievements } from '../achievements';
import {
  parseRates,
  parseWallet,
  type Rates,
  serializeRates,
  serializeWallet,
  type Wallet,
} from '../currency';
import { emptyGearShop, type GearItem, type GearShopState } from '../gear/types';
import { parseQuestWindows, type QuestWindow } from '../quests';
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
      gear: { ...owned.gear },
    })),
    formation: {
      front: [...state.formation.front],
      back: [...state.formation.back],
    },
    pity: state.pity,
    pullCount: state.pullCount,
    gear: state.gear.map((item) => ({
      id: item.id,
      slot: item.slot,
      archetype: item.archetype,
      grade: item.grade,
      // Omitted rather than written as null, so an unaligned piece costs five bytes instead of
      // twenty-two. The bag is the one collection in this save that runs to hundreds of entries.
      ...(item.alignment === undefined ? {} : { alignment: item.alignment }),
      level: item.level,
    })),
    gearMinted: state.gearMinted,
    gearShop: {
      slot: state.gearShop.slot,
      purchased: [...state.gearShop.purchased],
    },
    achievements: { ...state.achievements },
    quests: {
      daily: encodeWindow(state.quests.daily),
      weekly: encodeWindow(state.quests.weekly),
    },
  };
}

/** One quest window, as plain JSON. */
function encodeWindow(window: QuestWindow): CurrentSaveData['quests']['daily'] {
  return {
    index: window.index,
    baseline: { ...window.baseline },
    claimed: [...window.claimed],
  };
}

/** A field that could not be loaded as written, in the shape the repair pass reports it. */
type Note = (field: string, problem: string, recovered: string) => void;

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
  const gear = readGear(record['gear'], note);
  const gearMinted = readGearMinted(record['gearMinted'], gear, note);
  const gearShop = readGearShop(record['gearShop'], note);
  const achievements = parseAchievements(record['achievements'], note);
  const quests = parseQuestWindows(record['quests'], note);

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
      gear,
      gearMinted,
      gearShop,
      achievements,
      quests,
    },
    issues,
  };
}

/**
 * Decodes the bag, dropping anything structurally unusable.
 *
 * ⚠️ **This checks shape, not content.** It does not know which slots, archetypes or grades the
 * build ships — that is `data/`, and `core/save/` cannot see it any more than the rest of `core/`
 * can. So an entry with a string slot survives here and is dropped later by `repairLoadouts`, which
 * is handed the gear rules and can say whether `'greaves'` is a real slot. Splitting it that way is
 * what keeps a save readable by a build whose content has moved on: the bytes parse, and then the
 * content check decides what to keep.
 *
 * A piece with no usable id is dropped outright, because an id is how a loadout refers to it and
 * a piece nothing can refer to is a piece nobody can equip. Duplicates go for the same reason
 * `readRoster` drops them: two objects with one id is the damage that pays a bonus twice.
 */
function readGear(raw: unknown, note: Note): readonly GearItem[] {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (!Array.isArray(raw)) {
    note('gear', `not an array (${JSON.stringify(raw) ?? 'undefined'})`, 'no gear');
    return [];
  }

  const seen = new Set<string>();
  const gear: GearItem[] = [];
  for (const entry of raw) {
    const record = asRecord(entry);
    const id = record['id'];
    const slot = record['slot'];
    const archetype = record['archetype'];
    if (
      typeof id !== 'string' ||
      id === '' ||
      typeof slot !== 'string' ||
      typeof archetype !== 'string'
    ) {
      note(
        'gear[]',
        `entry is not a gear item (${JSON.stringify(entry) ?? 'undefined'})`,
        'dropped',
      );
      continue;
    }
    if (seen.has(id)) {
      note('gear[]', `duplicate item id "${id}"`, 'dropped');
      continue;
    }
    seen.add(id);

    const alignment = record['alignment'];
    const grade = record['grade'];
    const level = record['level'];
    gear.push({
      id,
      slot: slot as GearItem['slot'],
      archetype: archetype as GearItem['archetype'],
      grade: typeof grade === 'number' && Number.isInteger(grade) && grade >= 0 ? grade : 0,
      alignment: typeof alignment === 'string' && alignment !== '' ? alignment : undefined,
      level:
        typeof level === 'number' && Number.isFinite(level) ? Math.max(Math.floor(level), 1) : 1,
    });
  }
  return gear;
}

/**
 * Decodes the mint counter, never below what the bag already proves has been minted.
 *
 * A counter that has fallen behind the ids in use is the one kind of damage here that produces a
 * plausible wrong answer instead of a missing one: the next drop reissues a live id, and a loadout
 * silently rebinds to a different object. So the recovered value is the larger of what was written
 * and what the bag implies, read off the `g<n>` ids themselves rather than off the array length —
 * a bag that has had pieces salvaged out of it is shorter than the number minted.
 */
function readGearMinted(raw: unknown, gear: readonly GearItem[], note: Note): number {
  let highest = 0;
  for (const item of gear) {
    const parsed = /^g(\d+)$/.exec(item.id);
    if (parsed?.[1] !== undefined) {
      highest = Math.max(highest, Number(parsed[1]));
    }
  }

  // Recovered to `highest` in one step rather than defaulted to zero and then clamped. Both routes
  // end at the same number, but the two-step version reports the same field twice — one issue for
  // "not an integer" and a second for "below the highest minted id" — which reads to anyone looking
  // at the issue list as two separate things having gone wrong.
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
    note(
      'gearMinted',
      `not a non-negative integer (${JSON.stringify(raw) ?? 'undefined'})`,
      String(highest),
    );
    return highest;
  }

  if (raw < highest) {
    note('gearMinted', `below the highest minted id (${raw} < ${highest})`, String(highest));
    return highest;
  }
  return raw;
}

/**
 * Decodes the shop ledger.
 *
 * A damaged ledger costs nothing and self-heals: the stock is derived from the seed and the refresh
 * slot, so all this holds is "which offers have already been taken from the stocking I am looking
 * at". Defaulting to an empty list hands a player one extra shop, which is the harmless direction —
 * the opposite mistake would silently mark offers sold that nobody bought.
 */
function readGearShop(raw: unknown, note: Note): GearShopState {
  if (raw === undefined || raw === null) {
    return emptyGearShop();
  }
  const record = asRecord(raw);
  const slot = record['slot'];
  const purchased = record['purchased'];
  if (typeof slot !== 'number' || !Number.isInteger(slot) || slot < 0) {
    note(
      'gearShop.slot',
      `not a non-negative integer (${JSON.stringify(slot) ?? 'undefined'})`,
      '0',
    );
    return emptyGearShop();
  }
  if (!Array.isArray(purchased)) {
    note(
      'gearShop.purchased',
      `not an array (${JSON.stringify(purchased) ?? 'undefined'})`,
      'empty',
    );
    return { slot, purchased: [] };
  }
  const indices = purchased.filter(
    (value: unknown): value is number =>
      typeof value === 'number' && Number.isInteger(value) && value >= 0,
  );
  if (indices.length !== purchased.length) {
    note('gearShop.purchased', 'contains non-index entries', 'those entries dropped');
  }
  return { slot, purchased: [...new Set(indices)].sort((a, b) => a - b) };
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
          gear: readLoadout(record['gear']),
        },
        character,
        options.levelCurve,
      ),
    );
  }
  return roster;
}

/**
 * Decodes one character's loadout: slot ids to item ids, and nothing else.
 *
 * Deliberately silent — it reports no issues. Every meaningful check on a loadout needs to see both
 * the bag and the content this build ships (does the id resolve, is the piece in the slot it claims,
 * does its archetype still match its wearer), and `repairLoadouts` is where all three are answerable.
 * Noting "dropped an unresolvable reference" here would mean noting it again there, or noting it
 * here on the basis of a check this function cannot actually perform.
 */
function readLoadout(raw: unknown): Record<string, string> {
  const loadout: Record<string, string> = {};
  const record = asRecord(raw);
  for (const [slot, id] of Object.entries(record)) {
    if (typeof id === 'string' && id !== '') {
      loadout[slot] = id;
    }
  }
  return loadout;
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
