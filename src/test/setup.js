import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => `test-${Math.random().toString(36).slice(2, 11)}`,
  },
})
