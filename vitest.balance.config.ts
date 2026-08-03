import { defineConfig } from 'vitest/config';

/**
 * The balance project.
 *
 * Statistical sweeps over shipped content, kept out of the suite that runs on save. `AGENTS.md`
 * describes the trigger and this is it: milestone 4's skills, statuses and `Decimal` quantities
 * made a battle roughly a millisecond, and milestone 7 doubled the ladder and added a third
 * reference party — so a full sweep went from a couple of seconds to more than ten. The rule is
 * to move the sweep rather than shrink the sample, because a smaller sample buys speed by making
 * the answer less true.
 *
 * These specs are `*.balance.ts` rather than `*.spec.ts` so `ng test` never picks them up, and
 * `tsconfig.app.json` excludes them so the app build never bundles them.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.balance.ts'],
    // A sweep is thousands of battles. The fast suite's default would fail on volume alone.
    testTimeout: 120_000,
  },
});
