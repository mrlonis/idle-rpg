// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { Decimal, isUsable, num, ONE, parseOr, serialize, tryParse, ZERO } from './numeric';

describe('tryParse', () => {
  it.each([
    { label: 'integer number', raw: 42, expected: '42' },
    { label: 'exponential string', raw: '1.2345e+30', expected: '1.2345e+30' },
    { label: 'plain string', raw: '250', expected: '250' },
    { label: 'zero', raw: 0, expected: '0' },
    { label: 'negative', raw: -5, expected: '-5' },
    // Decimal switches to exponential notation above 1e21, like a plain number does.
    { label: 'existing Decimal', raw: num('7e18'), expected: '7000000000000000000' },
    { label: 'value above the exponential threshold', raw: '7e22', expected: '7e+22' },
  ])('parses $label', ({ raw, expected }) => {
    expect(tryParse(raw)?.toString()).toBe(expected);
  });

  it.each([
    { label: 'unparseable string', raw: 'garbage' },
    { label: 'empty string', raw: '' },
    { label: 'whitespace string', raw: '   ' },
    { label: 'null', raw: null },
    { label: 'undefined', raw: undefined },
    { label: 'plain object', raw: {} },
    { label: 'array', raw: [1, 2] },
    { label: 'boolean', raw: true },
    { label: 'NaN', raw: Number.NaN },
    { label: 'Infinity', raw: Infinity },
    { label: 'Infinity string', raw: 'Infinity' },
  ])('returns undefined without throwing for $label', ({ raw }) => {
    // `new Decimal(...)` throws outright on '', null and objects, and yields NaN for
    // garbage strings. A save is untrusted input and a throw costs the player their run.
    expect(() => tryParse(raw)).not.toThrow();
    expect(tryParse(raw)).toBeUndefined();
  });

  it.each([
    { label: 'NaN', value: Number.NaN },
    { label: 'Infinity', value: Infinity },
  ])('rejects an already-damaged Decimal instance holding $label', ({ value }) => {
    // A Decimal can arrive already poisoned — for example from arithmetic that divided by
    // zero — and must not be waved through just because it is the right class.
    expect(tryParse(new Decimal(value))).toBeUndefined();
  });
});

describe('parseOr', () => {
  it('returns the parsed value when usable', () => {
    expect(parseOr('500', ZERO).toString()).toBe('500');
  });

  it('returns the fallback when the input is damaged', () => {
    expect(parseOr('garbage', ZERO).toString()).toBe('0');
    expect(parseOr(undefined, ONE).toString()).toBe('1');
  });
});

describe('isUsable', () => {
  it('accepts finite values', () => {
    expect(isUsable(num('1e300'))).toBe(true);
    expect(isUsable(ZERO)).toBe(true);
  });

  it('rejects NaN and Infinity', () => {
    expect(isUsable(new Decimal(Number.NaN))).toBe(false);
    expect(isUsable(new Decimal(Infinity))).toBe(false);
  });
});

describe('serialize', () => {
  it.each(['0', '1', '250', '1.2345e+18', '9.87e+300', '-42'])(
    'round-trips %s exactly',
    (value) => {
      const original = num(value);

      const restored = tryParse(serialize(original));

      expect(restored?.eq(original)).toBe(true);
    },
  );

  it('survives a JSON round-trip', () => {
    const state = { gold: num('1.2345e+30') };

    const restored = tryParse(
      (JSON.parse(JSON.stringify({ gold: serialize(state.gold) })) as { gold: string }).gold,
    );

    expect(restored?.toString()).toBe('1.2345e+30');
  });
});

describe('what break_infinity actually buys', () => {
  // These pin the measured behaviour so the dependency decision stays evidence-based. The
  // headline: it extends range, not precision.

  it('does NOT add mantissa precision past 2^53', () => {
    // Its mantissa is a float64, so it drops a +1 against 1e20 exactly like a plain number.
    // Anyone assuming Decimal makes gold integer-exact at high magnitudes is mistaken.
    expect(num('1e20').add(1).eq(num('1e20'))).toBe(true);
    expect(1e20 + 1 === 1e20).toBe(true);
  });

  it('keeps roughly 17 significant digits, the same as a plain number', () => {
    expect(num('1.2345678901234567890123').toString()).toBe('1.2345678901234567');
  });

  it('does extend range far past float64, which is the real reason to have it', () => {
    // float64 overflows to Infinity here; Decimal does not.
    expect(Math.pow(1.15, 100000)).toBe(Infinity);
    expect(isUsable(Decimal.pow(1.15, 100000))).toBe(true);
  });

  it('documents that the planned curve does not yet need that range', () => {
    // AGENTS.md: add break_infinity only if the curve actually demands it. A 1.15x curve
    // over 500 stages lands at ~2.2e30 — well inside float64, which survives to ~1.8e308.
    const atStage500 = Math.pow(1.15, 500);
    expect(atStage500).toBeLessThan(Number.MAX_VALUE);
    expect(Number.isFinite(atStage500)).toBe(true);

    // float64 only gives out around stage 5075 on that curve.
    const overflowStage = Math.ceil(Math.log(Number.MAX_VALUE) / Math.log(1.15));
    expect(overflowStage).toBeGreaterThan(5000);
  });
});

describe('structuredClone hazard', () => {
  it('strips the Decimal prototype, which is why state is never cloned for the UI', () => {
    // The UI holds core's returned state directly as its snapshot. This test documents why
    // it must not defensively clone: the numbers come back as inert data.
    const clone = structuredClone(num('7e30'));

    expect(clone instanceof Decimal).toBe(false);
    expect(() => clone.add(1)).toThrow(TypeError);
  });
});
