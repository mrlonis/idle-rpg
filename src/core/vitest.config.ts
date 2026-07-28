import { defineConfig } from 'vitest/config';

/**
 * `core/` runs its own Vitest project rather than going through the Angular unit-test
 * builder.
 *
 * The Angular builder runs specs under jsdom, which puts `window`, `document` and
 * `localStorage` on the global object. That would quietly defeat the point of the boundary:
 * a core module that reached for the DOM would pass its tests and only fail in Node, which
 * is exactly where the balance sweeps run. A true `environment: 'node'` makes the
 * constraint self-enforcing — DOM access is a crash, not a warning.
 *
 * This mirrors the existing `scripts/` test project.
 */
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage/core',
      reporter: ['html', 'lcov', 'text', 'text-summary'],
      include: ['src/core/**/*.ts'],
      exclude: ['src/core/**/*.spec.ts', 'src/core/vitest.config.ts'],
    },
    environment: 'node',
    include: ['src/core/**/*.spec.ts'],
  },
});
