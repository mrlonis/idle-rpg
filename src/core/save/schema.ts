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

/** The shape written by the current `SAVE_VERSION`. */
export type CurrentSaveData = SaveDataV1;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData = SaveDataV1;
