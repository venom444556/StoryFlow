import '@testing-library/jest-dom/vitest'

// jsdom does not implement canvas. Stub getContext to return a no-op 2D
// context so the draw loop does not crash during component tests.
if (typeof HTMLCanvasElement !== 'undefined') {
  const noop = () => {}
  HTMLCanvasElement.prototype.getContext = function () {
    return new Proxy(
      {
        canvas: this,
        createRadialGradient: () => ({ addColorStop: noop }),
        createLinearGradient: () => ({ addColorStop: noop }),
      },
      {
        get(target, prop) {
          if (prop in target) return target[prop]
          return noop
        },
        set(target, prop, value) {
          target[prop] = value
          return true
        },
      }
    )
  }
}

// jsdom lacks ResizeObserver.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Minimal requestAnimationFrame polyfill (jsdom has one but it can be slow).
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
}
