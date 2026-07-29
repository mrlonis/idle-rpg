import { mulberry32 } from './mulberry32';

/**
 * The additive constant mulberry32 applies to its internal state on every draw. Exposed
 * because the O(1) resume below depends on it.
 */
const MULBERRY32_STEP = 0x6d2b79f5;

/** FNV-1a 32-bit offset basis and prime, used to derive independent sub-streams. */
const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

/**
 * The RNG position stored in the save. `calls` is the number of draws taken from the main
 * stream, which is what makes a run reproducible from `seed` alone.
 */
export interface RngState {
  readonly seed: number;
  readonly calls: number;
}

/**
 * A cursor over the main RNG stream.
 *
 * This is deliberately mutable, but it is a local working object — it is created inside a
 * pure function, drawn from, and then read back out into a new `RngState`. It is never
 * stored in `GameState`.
 */
export interface RngStream {
  /** Draws the next float in [0, 1). */
  next(): number;
  /** Draws an integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
  /** The `RngState` reflecting every draw taken so far. */
  commit(): RngState;
}

/**
 * Resumes the main stream at `state.calls` in constant time.
 *
 * mulberry32 advances its internal state by a fixed additive step per draw, so the state
 * after N draws is `seed + N * STEP` (mod 2^32) — reachable directly rather than by
 * replaying N draws. Without this, loading a save with a large call count would cost one
 * iteration per historical draw on every launch.
 *
 * `Math.imul` performs the multiply with 32-bit wraparound, which keeps the arithmetic
 * exact; computing `calls * STEP` as a float64 would lose precision past ~5 million draws.
 */
export function resumeStream(state: RngState): RngStream {
  const advance = Math.imul(state.calls, MULBERRY32_STEP) >>> 0;
  const draw = mulberry32((state.seed + advance) >>> 0);
  let calls = state.calls;

  return {
    next(): number {
      calls += 1;
      return draw();
    },
    nextInt(maxExclusive: number): number {
      return Math.floor(this.next() * maxExclusive);
    },
    commit(): RngState {
      return { seed: state.seed, calls };
    },
  };
}

/**
 * Derives an independent seed from the main seed and a label, via FNV-1a.
 *
 * Combat draws from a derived stream rather than the main one so that replaying a battle
 * is reproducible and does not shift the pull sequence. Pulls advance `RngState.calls`;
 * combat never does.
 *
 * @example
 *   deriveSeed(state.rng.seed, `battle:${stageId}:${battleCount}`)
 */
export function deriveSeed(seed: number, label: string): number {
  let hash = (FNV_OFFSET_BASIS ^ (seed >>> 0)) >>> 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash ^ label.charCodeAt(i)) >>> 0;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Opens a standalone stream that does not participate in the main stream's call counter.
 * Use with {@link deriveSeed} for combat and any other replayable subsystem.
 */
export function derivedStream(seed: number, label: string): () => number {
  return mulberry32(deriveSeed(seed, label));
}
