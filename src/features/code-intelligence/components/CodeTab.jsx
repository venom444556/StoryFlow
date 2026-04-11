/**
 * CodeTab — IssueDetail surface for the Code Intelligence feature.
 *
 * Shows the issue's linked symbols and their current impact. If the feature is
 * disabled, renders a clean empty state. If the issue has no `codeLinks` yet,
 * offers a "Resolve symbols from this ticket" action. If it does, renders each
 * linked symbol with a lightweight inline impact badge.
 *
 * This component is owned by the CodeTab build agent. It imports the feature
 * module via `useCodeIntelligence()` only — never reaches into
 * `modules/code-intel/`.
 */

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Link2, RefreshCw, AlertTriangle, FileCode, Sparkles } from 'lucide-react'
import LoadingState from '../../../components/ui/LoadingState.jsx'
import { useCodeIntelligence } from '../index.js'

/**
 * @typedef {import('../index.js').CodeIntelligenceModule} CodeIntelligenceModule
 */

const BLAST_RADIUS_TOKENS = {
  LOW: {
    label: 'Low',
    color: 'var(--color-success)',
    bg: 'var(--color-success-subtle)',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-subtle)',
  },
  HIGH: {
    label: 'High',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-subtle)',
  },
  CRITICAL: {
    label: 'Critical',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-subtle)',
  },
}

function InlineImpactBadge({ blastRadius }) {
  const token = BLAST_RADIUS_TOKENS[blastRadius] || BLAST_RADIUS_TOKENS.LOW
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ backgroundColor: token.bg, color: token.color }}
      data-testid="inline-impact-badge"
    >
      {token.label}
    </span>
  )
}

function ErrorMessage({ error }) {
  if (!error) return null
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-subtle)] px-3 py-2 text-xs text-[var(--color-danger)]"
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span className="whitespace-pre-wrap">{error.message || String(error)}</span>
    </div>
  )
}

function CandidateRow({ candidate, linked, onLink }) {
  const sym = candidate.symbol || {}
  const confidencePct = Math.round((candidate.confidence || 0) * 100)
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2">
      <FileCode size={14} className="mt-0.5 shrink-0 text-[var(--color-fg-muted)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--color-fg-default)]">
            {sym.name || 'unknown'}
          </span>
          <span className="shrink-0 rounded-md bg-[var(--color-bg-glass-hover)] px-1.5 py-0.5 text-[10px] text-[var(--color-fg-muted)]">
            {confidencePct}%
          </span>
        </div>
        {sym.file && (
          <div className="mt-0.5 truncate text-[11px] text-[var(--color-fg-subtle)]">
            {sym.file}
            {sym.line ? `:${sym.line}` : ''}
          </div>
        )}
        {candidate.reason && (
          <div className="mt-1 text-[11px] text-[var(--color-fg-muted)]">{candidate.reason}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onLink?.(candidate)}
        disabled={linked}
        className="shrink-0 rounded-md border border-[var(--color-border-default)] px-2 py-1 text-[11px] font-medium text-[var(--color-fg-default)] transition-colors hover:bg-[var(--color-bg-glass-hover)] disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="inline-flex items-center gap-1">
          <Link2 size={11} />
          {linked ? 'Linked' : 'Link'}
        </span>
      </button>
    </div>
  )
}

function LinkedSymbolRow({ link }) {
  const sym = link.symbol || link
  const report = link.impact || null
  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-3 py-2"
      data-testid="linked-symbol-row"
    >
      <FileCode size={14} className="mt-0.5 shrink-0 text-[var(--color-fg-muted)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--color-fg-default)]">
            {sym.name || 'unknown'}
          </span>
          {report?.blastRadius && <InlineImpactBadge blastRadius={report.blastRadius} />}
        </div>
        {sym.file && (
          <div className="mt-0.5 truncate text-[11px] text-[var(--color-fg-subtle)]">
            {sym.file}
            {sym.line ? `:${sym.line}` : ''}
          </div>
        )}
        {report && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--color-fg-muted)]">
            <span>{report.callsiteCount ?? 0} callsites</span>
            {typeof report.affectedServiceCount === 'number' && (
              <span>{report.affectedServiceCount} services</span>
            )}
            {Array.isArray(report.affectedClusterIds) && report.affectedClusterIds.length > 0 && (
              <span>{report.affectedClusterIds.length} clusters</span>
            )}
          </div>
        )}
        {report?.rationale && (
          <div className="mt-1 text-[11px] italic text-[var(--color-fg-subtle)]">
            {report.rationale}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * @param {{ issue: { id?: string, title?: string, description?: string, codeLinks?: Array<any> } }} props
 */
export default function CodeTab({ issue }) {
  const { enabled, ready, error: moduleError, module } = useCodeIntelligence()

  const [candidates, setCandidates] = useState([])
  const [pendingLinks, setPendingLinks] = useState([])
  const [resolving, setResolving] = useState(false)
  const [resolveError, setResolveError] = useState(null)
  const [hasResolved, setHasResolved] = useState(false)

  const existingLinks = useMemo(() => (issue && issue.codeLinks) || [], [issue])
  const hasLinks = existingLinks.length > 0

  const linkedKeys = useMemo(() => {
    const keys = new Set()
    for (const link of existingLinks) {
      const sym = link?.symbol || link
      if (sym?.name) keys.add(`${sym.name}::${sym.file || ''}`)
    }
    for (const link of pendingLinks) {
      const sym = link?.symbol || link
      if (sym?.name) keys.add(`${sym.name}::${sym.file || ''}`)
    }
    return keys
  }, [existingLinks, pendingLinks])

  const handleResolve = useCallback(async () => {
    if (!module || !enabled) return
    setResolving(true)
    setResolveError(null)
    try {
      const result = await module.resolveTicket({
        title: issue?.title || '',
        description: issue?.description || '',
        key: issue?.key,
      })
      setCandidates(Array.isArray(result) ? result : [])
      setHasResolved(true)
    } catch (err) {
      setResolveError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setResolving(false)
    }
  }, [module, enabled, issue?.title, issue?.description, issue?.key])

  const handleLink = useCallback((candidate) => {
    // Persistence is a future iteration — optimistic local add for now.
    // eslint-disable-next-line no-console
    console.log('[CodeTab] link symbol to issue', candidate)
    setPendingLinks((prev) => [...prev, candidate])
  }, [])

  // Disabled feature
  if (!enabled) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-4 py-8 text-center"
        data-testid="code-tab-disabled"
      >
        <Code2 size={28} className="text-[var(--color-fg-subtle)]" aria-hidden="true" />
        <p className="text-sm text-[var(--color-fg-muted)]">
          Code Intelligence is not enabled for this project
        </p>
        <p className="text-[11px] text-[var(--color-fg-subtle)]">
          Configure it at{' '}
          <code className="rounded bg-[var(--color-bg-glass-hover)] px-1 py-0.5 font-mono text-[10px]">
            .storyflow/modules/code-intelligence.example.json
          </code>
        </p>
      </motion.div>
    )
  }

  // Enabled but booting
  if (!ready && !moduleError) {
    return <LoadingState size="sm" message="Booting code intelligence..." />
  }

  if (moduleError) {
    return <ErrorMessage error={moduleError} />
  }

  const candidatesToShow = candidates.filter((c) => {
    const sym = c?.symbol || {}
    return !linkedKeys.has(`${sym.name}::${sym.file || ''}`)
  })

  return (
    <div className="space-y-4" data-testid="code-tab">
      {/* Linked symbols block */}
      {hasLinks && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
              Linked Symbols
            </h5>
            <button
              type="button"
              onClick={handleResolve}
              disabled={resolving}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border-default)] px-2 py-1 text-[11px] font-medium text-[var(--color-fg-default)] transition-colors hover:bg-[var(--color-bg-glass-hover)] disabled:pointer-events-none disabled:opacity-40"
            >
              <RefreshCw size={11} className={resolving ? 'animate-spin' : ''} />
              Re-resolve
            </button>
          </div>
          <div className="space-y-2">
            {existingLinks.map((link, idx) => (
              <LinkedSymbolRow key={link?.id || link?.symbol?.name || idx} link={link} />
            ))}
          </div>
        </div>
      )}

      {/* Unlinked state — prompt to resolve */}
      {!hasLinks && !hasResolved && !resolving && (
        <div
          className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-[var(--color-border-default)] bg-[var(--color-bg-glass)] px-4 py-6"
          data-testid="code-tab-no-links"
        >
          <div className="flex items-center gap-2 text-[var(--color-fg-muted)]">
            <Sparkles size={14} />
            <span className="text-sm">No code symbols linked to this issue yet.</span>
          </div>
          <button
            type="button"
            onClick={handleResolve}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-glass-hover)] px-3 py-1.5 text-xs font-medium text-[var(--color-fg-default)] transition-colors hover:bg-[var(--color-bg-glass)]"
          >
            <Sparkles size={12} />
            Resolve symbols from this ticket
          </button>
        </div>
      )}

      {resolving && <LoadingState size="sm" message="Resolving symbols..." />}
      {resolveError && <ErrorMessage error={resolveError} />}

      {/* Candidate suggestions */}
      {hasResolved && candidatesToShow.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
            {hasLinks ? 'New Suggestions' : 'Suggested Symbols'}
          </h5>
          <div className="space-y-2">
            {candidatesToShow.map((candidate, idx) => {
              const sym = candidate?.symbol || {}
              const key = `${sym.name || 'unknown'}::${sym.file || idx}`
              const linked = linkedKeys.has(`${sym.name}::${sym.file || ''}`)
              return (
                <CandidateRow key={key} candidate={candidate} linked={linked} onLink={handleLink} />
              )
            })}
          </div>
        </div>
      )}

      {hasResolved && !resolving && candidatesToShow.length === 0 && (
        <p className="text-xs text-[var(--color-fg-subtle)]">
          No additional symbol candidates found for this ticket.
        </p>
      )}
    </div>
  )
}
