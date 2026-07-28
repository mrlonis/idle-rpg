// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';

/**
 * Guards the headless guarantee, and documents exactly how much of it the test environment
 * is actually responsible for.
 *
 * The Angular unit-test builder runs specs under jsdom by default. Each `core/` spec opts
 * out with the `@vitest-environment node` docblock above; this spec fails loudly if that
 * mechanism ever stops working.
 *
 * **What the Node environment does and does not buy.** Measured on Node 26, plain Node
 * already provides `sessionStorage`, `navigator`, `fetch` and `crypto`, and declares a
 * `localStorage` global. So switching off jsdom only removes `window`, `document` and the
 * jsdom-only DOM APIs (`requestAnimationFrame`, `indexedDB`, `MutationObserver` and
 * similar).
 *
 * Everything else on the forbidden list is caught by `no-restricted-globals` in
 * `src/core/eslint.config.js`, which is the primary enforcement — it is static, runs on
 * every file in CI, and does not depend on what the current Node release happens to expose.
 * Treat the environment as defence in depth, not as the guarantee.
 */
describe('core runs headless', () => {
  it.each(['window', 'document'])('does not expose %s', (name) => {
    expect(globalThis).not.toHaveProperty(name);
  });

  it.each(['requestAnimationFrame', 'indexedDB', 'MutationObserver', 'getComputedStyle'])(
    'does not expose the jsdom-only DOM API %s',
    (name) => {
      expect(globalThis).not.toHaveProperty(name);
    },
  );

  it('relies on ESLint, not the environment, for globals Node itself provides', () => {
    // Pins the measurement above so the comment cannot quietly go stale: these exist here,
    // which is precisely why the lint rule has to carry the weight.
    expect(globalThis).toHaveProperty('navigator');
    expect(globalThis).toHaveProperty('fetch');
  });
});
