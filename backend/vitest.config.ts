import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // The suites share one in-memory MongoDB instance.
    fileParallelism: false,
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
})
