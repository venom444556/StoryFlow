// Local vitest config — isolates this module from the parent StoryFlow
// repo's vite/vitest config (which pulls in React plugin and other deps
// this sub-module must not depend on).
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
  },
})
