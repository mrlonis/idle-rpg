import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage/scripts',
      reporter: ['html', 'lcov', 'text', 'text-summary'],
    },
    environment: 'node',
    include: ['scripts/**/*.spec.ts'],
  },
});
