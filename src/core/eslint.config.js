// @ts-check
const { defineConfig } = require('eslint/config');

/**
 * The `core/` boundary, enforced mechanically.
 *
 * `core/` must run headless in Node: it is the reason balance can be tested by simulating
 * thousands of hours instead of playing them. These rules are the enforcement AGENTS.md
 * refers to, and must not be disabled.
 *
 * This config is spread into the root config so the rules apply during a normal
 * `npm run lint:angular` run — it is not a standalone entry point.
 */
module.exports = defineConfig([
  {
    files: ['src/core/**/*.ts'],
    ignores: ['src/core/vitest.config.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@angular/*', '@angular/**'],
              message:
                'core/ must not import Angular. Signals are an Angular concept; game state lives in plain objects owned by core/.',
            },
            {
              group: ['@capacitor/*', '@capacitor/**'],
              message:
                'core/ must not import Capacitor. Persistence and native access belong in ui/.',
            },
            {
              group: ['@ionic/*', '@ionic/**'],
              message: 'core/ must not import Ionic.',
            },
            {
              group: ['**/ui', '**/ui/**', '**/app', '**/app/**'],
              message:
                'core/ must not import from ui/. The dependency runs one way: ui/ imports core/, never the reverse.',
            },
            {
              group: ['**/data', '**/data/**'],
              message:
                'core/ must not import from data/. Content is passed in as arguments so the simulation can be driven with test fixtures.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'window',
          message: 'core/ must run headless in Node. Pass what you need in as a parameter.',
        },
        {
          name: 'document',
          message: 'core/ must run headless in Node. Pass what you need in as a parameter.',
        },
        {
          name: 'localStorage',
          message:
            'core/ must not persist anything. Saves are owned by ui/ via @capacitor/preferences.',
        },
        {
          name: 'sessionStorage',
          message: 'core/ must not persist anything.',
        },
        {
          name: 'navigator',
          message: 'core/ must run headless in Node.',
        },
        {
          name: 'fetch',
          message: 'The game is fully offline. core/ must not make network calls.',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'core/ must use the seeded PRNG (see core/rng.ts) so runs are reproducible. Math.random() breaks replayable balance runs and bug reports.',
        },
        {
          object: 'Date',
          property: 'now',
          message:
            'core/ has no clock. Time is a parameter passed in from ui/ (see `nowMs`), which is what makes offline resume testable.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'NewExpression[callee.name="Date"]',
          message:
            'core/ has no clock. Time is a parameter passed in from ui/ (see `nowMs`), which is what makes offline resume testable.',
        },
      ],
    },
  },
]);
