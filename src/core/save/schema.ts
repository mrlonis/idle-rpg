/**
 * The on-disk save shapes, one interface per historical version.
 *
 * These are JSON-safe: `Numeric` values are stored as exponential-notation strings, which
 * round-trip exactly and stay readable when inspecting a save from a bug report.
 *
 * Never edit a historical shape. Migrations are written against the shape that existed at
 * the time, and changing one retroactively invalidates every migration downstream of it.
 */
export interface SaveDataV1 {
  version: 1;
  gold: string;
  goldPerSec: string;
  lastTickAt: number;
  rng: { seed: number; calls: number };
}

/**
 * v2 adds combat progression: which stage the party is on and how many battles it has
 * resolved. Both are plain bounded integers rather than ids, so they can be repaired on load
 * without `core/` knowing what stages exist.
 */
export interface SaveDataV2 {
  version: 2;
  gold: string;
  goldPerSec: string;
  lastTickAt: number;
  rng: { seed: number; calls: number };
  stage: number;
  battleCount: number;
}

/**
 * v3 is the gacha release, and the largest shape change so far.
 *
 * Two things happened at once. The single `gold`/`goldPerSec` pair became a **keyed wallet and
 * rate table**, because five currencies as ten flat fields would have been ten lines in every
 * encoder, decoder and repair pass. And characters became state at all: a roster, the party
 * fielded from it, and the pity counter that feeds them.
 *
 * `clearedStages` is new and is not the same thing as `stage`. `stage` stops climbing at the
 * end of the authored ladder, so once a player is farming the last one it can no longer answer
 * "has this stage ever been cleared" — which is exactly what a first-clear bonus needs to know.
 */
export interface SaveDataV3 {
  version: 3;
  wallet: { gold: string; xp: string; essence: string; summons: string; spark: string };
  rates: { gold: string; xp: string; essence: string; summons: string };
  lastTickAt: number;
  rng: { seed: number; calls: number };
  stage: number;
  clearedStages: number;
  battleCount: number;
  roster: { defId: string; rarity: number; level: number; copies: number }[];
  activeParty: string[];
  pity: number;
  pullCount: number;
}

/**
 * v4 is the formation release: the flat `activeParty` becomes two ranks.
 *
 * The front row is a **gate** attacks work through before they can reach the back, so where a
 * character stands is now a real decision and a flat list can no longer express it. Two lists
 * rather than one list plus a "how many are in front" count, because the count cannot say
 * "nobody in front, two behind" — a formation a player mid-reshuffle is entitled to have.
 */
export interface SaveDataV4 {
  version: 4;
  wallet: { gold: string; xp: string; essence: string; summons: string; spark: string };
  rates: { gold: string; xp: string; essence: string; summons: string };
  lastTickAt: number;
  rng: { seed: number; calls: number };
  stage: number;
  clearedStages: number;
  battleCount: number;
  roster: { defId: string; rarity: number; level: number; copies: number }[];
  formation: { front: string[]; back: string[] };
  pity: number;
  pullCount: number;
}

/**
 * v5 is the chapters release: the flat stage number becomes a chapter and a stage within it.
 *
 * `stage` keeps its name and changes its meaning, which is normally a bad trade and is the right
 * one here: every field that reads it has to be revisited anyway, and a save carrying both
 * `stage` and `stageInChapter` would be two numbers that can disagree.
 *
 * **`clearedStages` did not become a pair, and that asymmetry is deliberate.** The position is a
 * place and has to survive the ladder being re-cut around it; the clear count is a quantity
 * earned, and "ninety-one stages beaten" means the same thing however the chapters are sliced.
 */
export interface SaveDataV5 {
  version: 5;
  wallet: { gold: string; xp: string; essence: string; summons: string; spark: string };
  rates: { gold: string; xp: string; essence: string; summons: string };
  lastTickAt: number;
  rng: { seed: number; calls: number };
  chapter: number;
  /** The stage **within** `chapter`, not a position on the whole ladder. */
  stage: number;
  clearedStages: number;
  battleCount: number;
  roster: { defId: string; rarity: number; level: number; copies: number }[];
  formation: { front: string[]; back: string[] };
  pity: number;
  pullCount: number;
}

/** The shape written by the current `SAVE_VERSION`. */
export type CurrentSaveData = SaveDataV5;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData = SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4 | SaveDataV5;
