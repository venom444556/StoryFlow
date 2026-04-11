import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: ['src/types.js'],
      reporter: ['text', 'text-summary'],
      thresholds: {
        branches: 95,
        functions: 100,
        lines: 95,
        statements: 95,
      },
    },
  },
})
