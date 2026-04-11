import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: here,
  plugins: [react()],
  server: { port: 5178, strictPort: false, open: false },
  resolve: {
    alias: {
      '@storyflow/code-intel-graph-renderer': resolve(here, '../src/index.js'),
    },
  },
})
