import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'client',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.js'],
          include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        },
      },
      {
        test: {
          name: 'server',
          globals: true,
          environment: 'node',
          include: ['server/**/*.{test,spec}.{js,ts}'],
          env: { STORYFLOW_RATE_LIMIT_MAX: '500' },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', 'src/data/seedProject.js'],
    },
  },
})
