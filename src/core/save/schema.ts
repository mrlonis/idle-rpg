/**
 * The on-disk save shape.
 *
 * JSON-safe: `Numeric` values are stored as exponential-notation strings, which round-trip
 * exactly and stay readable when inspecting a save from a bug report.
 *
 * ## There is one shape here, and there used to be five
 *
 * v1 through v5 were the gold counter, combat progression, the keyed wallet and roster, the two
 * ranks, and chapters. **They were collapsed into this v0 baseline while the game was still
 * pre-release**, because nobody outside development had ever loaded a save written by any of them
 * — so the whole chain was five historical shapes and four migrations maintained for an audience
 * of zero. [saves](../../../docs/saves.md) records the reset and the condition that closes the
 * door on doing it again.
 *
 * **From here the old rule applies without exception: never edit or delete a shipped shape.** A
 * migration is written against the shape that existed when it was authored, and changing one
 * retroactively invalidates every migration downstream of it. The next version this file gains is
 * v1, and it will be additive.
 */
export interface SaveDataV0 {
  version: 0;
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
export type CurrentSaveData = SaveDataV0;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData = SaveDataV0;
