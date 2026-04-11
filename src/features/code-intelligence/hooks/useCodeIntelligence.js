/**
 * useCodeIntelligence — React hook wrapping the feature module singleton.
 *
 * Returns `{ enabled, ready, error, module }`. The hook subscribes to the
 * singleton's `ready` promise via `useEffect` and updates local state when it
 * resolves or rejects. Safe to call from any component — if the singleton has
 * not been bootstrapped yet, `getCodeIntelligenceModule()` will lazy-create it
 * on first access.
 *
 * No context provider is needed; the singleton is process-global.
 */

import { useEffect, useState } from 'react'
import { getCodeIntelligenceModule } from '../module.js'

/**
 * @returns {{
 *   enabled: boolean,
 *   ready: boolean,
 *   error: Error|null,
 *   module: import('../index.js').CodeIntelligenceModule|null,
 * }}
 */
export function useCodeIntelligence() {
  const moduleInstance = getCodeIntelligenceModule()
  const enabled = moduleInstance && moduleInstance.enabled === true

  const [ready, setReady] = useState(!enabled) // disabled module is instantly ready
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!moduleInstance || !moduleInstance.ready) {
      setReady(true)
      return undefined
    }
    Promise.resolve(moduleInstance.ready)
      .then(() => {
        if (cancelled) return
        setReady(true)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [moduleInstance])

  return {
    enabled: Boolean(enabled),
    ready,
    error,
    module: moduleInstance || null,
  }
}

export default useCodeIntelligence
