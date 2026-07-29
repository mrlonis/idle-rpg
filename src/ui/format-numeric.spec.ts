import { describe, expect, it } from 'vitest';
import { num } from '../core';
import { formatDuration, formatNumeric, formatRate } from './format-numeric';

describe('formatNumeric', () => {
  it.each([
    { input: '0', expected: '0' },
    { input: '1', expected: '1' },
    { input: '42', expected: '42' },
    { input: '999', expected: '999' },
  ])('shows $input plainly below 1000', ({ input, expected }) => {
    expect(formatNumeric(num(input))).toBe(expected);
  });

  it('keeps decimals on fractional small values', () => {
    expect(formatNumeric(num('12.345'))).toBe('12.35');
  });

  it.each([
    { input: '1000', expected: '1K' },
    { input: '1500', expected: '1.5K' },
    { input: '1234', expected: '1.23K' },
    { input: '999999', expected: '1000K' },
    { input: '1e6', expected: '1M' },
    { input: '2.5e6', expected: '2.5M' },
    { input: '1e9', expected: '1B' },
    { input: '1e12', expected: '1T' },
    { input: '1e15', expected: '1Qa' },
    { input: '1e18', expected: '1Qi' },
    { input: '1.234e21', expected: '1.23Sx' },
  ])('formats $input as $expected', ({ input, expected }) => {
    expect(formatNumeric(num(input))).toBe(expected);
  });

  it('switches to exponential past the suffix table', () => {
    // 1e36 is the first value with no suffix left; invented names stop being legible.
    expect(formatNumeric(num('1e36'))).toBe('1.00e36');
    expect(formatNumeric(num('1.2345e100'))).toBe('1.23e100');
  });

  it('formats values far past float64 exact-integer range', () => {
    // The whole reason this exists instead of DecimalPipe.
    expect(formatNumeric(num('1.2345e+30'))).toBe('1.23No');
    expect(formatNumeric(num('9.87e+300'))).toBe('9.87e300');
  });

  it('handles negatives', () => {
    expect(formatNumeric(num('-1500'))).toBe('-1.5K');
    expect(formatNumeric(num('-42'))).toBe('-42');
  });

  it.each([
    { label: 'a NaN value', value: () => num(Number.NaN) },
    { label: 'the square root of a negative', value: () => num(-1).sqrt() },
  ])('degrades $label to a placeholder rather than printing NaN at the player', ({ value }) => {
    expect(formatNumeric(value())).toBe('—');
  });

  it('documents that break_infinity swallows division by zero', () => {
    // Surprising, and worth knowing before it is relied on: div-by-zero yields 0 rather
    // than Infinity or NaN, so a bad rate calculation fails silently rather than loudly.
    expect(num(1).div(0).toString()).toBe('0');
    expect(formatNumeric(num(1).div(0))).toBe('0');
  });

  it('respects a custom precision', () => {
    expect(formatNumeric(num('1234567'), 3)).toBe('1.235M');
    expect(formatNumeric(num('1234567'), 0)).toBe('1M');
  });

  it('never renders a bare trailing decimal point', () => {
    for (const value of ['1000', '1e6', '2e9', '1234', '1.5e21']) {
      expect(formatNumeric(num(value))).not.toMatch(/\.$/);
    }
  });
});

describe('formatRate', () => {
  it('appends the unit', () => {
    expect(formatRate(num('250'))).toBe('250/s');
    expect(formatRate(num('1.5e6'))).toBe('1.5M/s');
  });
});

describe('formatDuration', () => {
  it.each([
    { ms: 0, expected: 'no time' },
    { ms: -1000, expected: 'no time' },
    { ms: 30_000, expected: 'less than a minute' },
    { ms: 60_000, expected: '1 minute' },
    { ms: 120_000, expected: '2 minutes' },
    { ms: 3_600_000, expected: '1 hour' },
    { ms: 7_200_000, expected: '2 hours' },
    { ms: 5_400_000, expected: '1h 30m' },
  ])('formats $ms ms as "$expected"', ({ ms, expected }) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it('handles a non-finite duration', () => {
    expect(formatDuration(Number.NaN)).toBe('no time');
  });
});
