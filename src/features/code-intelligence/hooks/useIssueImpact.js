import { useEffect, useRef, useState } from 'react'
import { useCodeIntelligence } from '../index.js'

/**
 * @typedef {import('../../../../modules/code-intel/CONTRACTS.md').ImpactReport} ImpactReport
 */

const BLAST_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

/**
 * Pick the worst (highest-blast-radius) report from a list.
 * @param {ImpactReport[]} reports
 * @returns {ImpactReport|null}
 */
function pickWorst(reports) {
  if (!Array.isArray(reports) || reports.length === 0) return null
  let worst = reports[0]
  for (const r of reports) {
    if ((BLAST_ORDER[r.blastRadius] ?? -1) > (BLAST_ORDER[worst.blastRadius] ?? -1)) {
      worst = r
    } else if (
      BLAST_ORDER[r.blastRadius] === BLAST_ORDER[worst.blastRadius] &&
      (r.callsiteCount ?? 0) > (worst.callsiteCount ?? 0)
    ) {
      worst = r
    }
  }
  return worst
}

/**
 * Module-level cache keyed by a signature of the symbols analyzed. Keeps us
 * from hammering the feature module on every re-render of every card.
 * @type {Map<string, ImpactReport|null>}
 */
const impactCache = new Map()

/**
 * React hook returning the representative impact report for an issue.
 *
 * @param {{ id?: string, codeLinks?: Array<{ symbol: string }> }} issue
 * @returns {{ report: ImpactReport|null, loading: boolean, error: Error|null }}
 */
export function useIssueImpact(issue) {
  const { enabled, module: ciModule } = useCodeIntelligence() || {}
  const symbols = Array.isArray(issue?.codeLinks)
    ? issue.codeLinks.map((l) => l && l.symbol).filter(Boolean)
    : []
  const cacheKey = symbols.length > 0 ? `${issue?.id || ''}::${symbols.join('|')}` : null

  const [state, setState] = useState(() => {
    if (cacheKey && impactCache.has(cacheKey)) {
      return { report: impactCache.get(cacheKey), loading: false, error: null }
    }
    return { report: null, loading: false, error: null }
  })

  const lastKeyRef = useRef(null)

  useEffect(() => {
    if (!enabled || !ciModule || !cacheKey) {
      setState({ report: null, loading: false, error: null })
      lastKeyRef.current = null
      return
    }

    if (lastKeyRef.current === cacheKey) return
    lastKeyRef.current = cacheKey

    if (impactCache.has(cacheKey)) {
      setState({ report: impactCache.get(cacheKey), loading: false, error: null })
      return
    }

    let cancelled = false
    setState((prev) => ({ ...prev, loading: true, error: null }))

    Promise.resolve()
      .then(() => ciModule.analyzeSymbols(symbols))
      .then((reports) => {
        if (cancelled) return
        const worst = pickWorst(reports)
        impactCache.set(cacheKey, worst)
        setState({ report: worst, loading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setState({ report: null, loading: false, error: err })
      })

    return () => {
      cancelled = true
    }
    // cacheKey captures symbols + issue id; enabled/module identity gate work
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ciModule, cacheKey])

  return state
}
