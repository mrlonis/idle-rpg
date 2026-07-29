/**
 * mulberry32: a small, fast, seeded PRNG.
 *
 * The internal state is masked back to a uint32 on every step. The commonly circulated
 * version accumulates `a` as an unbounded float64 and relies on the bitwise operators to
 * reduce it mod 2^32 at use time, which is exact only while `a` stays under 2^53 — it
 * starts producing a different sequence at call 4,917,759 (`2^53 / 0x6d2b79f5`).
 *
 * Masking costs nothing, keeps the stream exact at any call count, and is what makes the
 * O(1) resume in `rng.ts` provably equivalent to replaying draws one at a time.
 */
export function mulberry32(a: number) {
  let state = a >>> 0;
  return function () {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
