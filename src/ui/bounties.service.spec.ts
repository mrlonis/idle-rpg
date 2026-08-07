import { describe, expect, it } from 'vitest';
import { duration } from './bounties.service';

/**
 * The bounty board's duration wording.
 *
 * `duration` is pure and exported, so it is tested directly rather than through the screen — no
 * `TestBed`, and none of the `GameLoopService` scaffolding the rest of the service needs.
 *
 * ⚠️ **The sub-minute case is the one worth having.** It was written as `Math.ceil(ms / 60_000) < 1`,
 * which is unreachable for any positive duration — so the branch was dead, and a mission thirty
 * seconds out read as "1m" while the doc comment above it claimed "under a minute". The guard now
 * tests `ms` directly, and the case below is what stops it silently reverting.
 */
describe('duration', () => {
  it.each([
    { ms: 0, expected: '' },
    { ms: -1, expected: '' },
    { ms: Number.NaN, expected: '' },
    { ms: Number.POSITIVE_INFINITY, expected: '' },
  ])('says nothing at all for $ms, which is not a wait', ({ ms, expected }) => {
    expect(duration(ms)).toBe(expected);
  });

  it.each([
    { ms: 1, label: 'a millisecond' },
    { ms: 30_000, label: 'half a minute' },
    { ms: 59_999, label: 'a millisecond under a minute' },
  ])('reads "under a minute" at $label rather than counting down', ({ ms }) => {
    expect(duration(ms)).toBe('under a minute');
  });

  it('switches to minutes at exactly one minute', () => {
    expect(duration(60_000)).toBe('1m');
  });

  it.each([
    { ms: 45 * 60_000, expected: '45m' },
    { ms: 59 * 60_000, expected: '59m' },
    { ms: 3_600_000, expected: '1h' },
    { ms: 4 * 3_600_000, expected: '4h' },
    { ms: 24 * 3_600_000, expected: '24h' },
    { ms: 3 * 3_600_000 + 12 * 60_000, expected: '3h 12m' },
  ])('words $ms as $expected', ({ ms, expected }) => {
    expect(duration(ms)).toBe(expected);
  });

  it('rounds a part-minute up, so a countdown never shows a wait shorter than it is', () => {
    expect(duration(60_001)).toBe('2m');
  });
});
