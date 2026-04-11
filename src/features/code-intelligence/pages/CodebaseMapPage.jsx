import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Network, AlertCircle, RefreshCw } from 'lucide-react'
import { useCodeIntelligence } from '../index.js'
import LoadingState from '../../../components/ui/LoadingState.jsx'
import EmptyState from '../../../components/ui/EmptyState.jsx'
import Button from '../../../components/ui/Button.jsx'
import GraphRenderer from '../../../../modules/code-intel/graph-renderer/src/index.js'

/**
 * CodebaseMapPage — full-screen canvas view mounting the Code Intelligence
 * graph-renderer with data pulled from the feature module.
 *
 * Behavior:
 *   - Disabled feature → empty state pointing at the example config
 *   - Enabled + fetching → LoadingState
 *   - Enabled + ready → GraphRenderer fills the viewport
 *   - Error → inline error card with Retry
 */
export default function CodebaseMapPage() {
  const { enabled, ready, module } = useCodeIntelligence()
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadGraph = useCallback(async () => {
    if (!enabled || !module) return
    setLoading(true)
    setError(null)
    try {
      const data = await module.fetchGraphData()
      setGraphData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setGraphData(null)
    } finally {
      setLoading(false)
    }
  }, [enabled, module])

  useEffect(() => {
    if (!enabled) return
    if (!module) return
    loadGraph()
  }, [enabled, module, loadGraph])

  const handleNodeClick = useCallback((node) => {
    // Future: open a symbol detail panel. For now, log the selection
    // so downstream agents/devs can wire it up.
    // eslint-disable-next-line no-console
    console.log('[CodebaseMap] node clicked:', node)
  }, [])

  // Disabled: the feature module is off for this project.
  if (!enabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="flex h-full min-h-0 items-center justify-center p-[var(--space-6)]"
      >
        <div
          className={[
            'flex max-w-md flex-col items-center rounded-[var(--radius-lg)]',
            'border border-[var(--color-border-muted)] bg-[var(--color-bg-glass)]',
            'px-[var(--space-8)] py-[var(--space-10)] text-center',
          ].join(' ')}
          data-testid="codebase-map-disabled"
        >
          <Network
            size={48}
            strokeWidth={1.5}
            className="mb-[var(--space-4)] text-[var(--color-fg-faint)]"
            aria-hidden="true"
          />
          <h3 className="mb-[var(--space-2)] text-[var(--text-lg)] font-medium text-[var(--color-fg-default)]">
            Code Intelligence is not enabled for this project
          </h3>
          <p className="mb-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-fg-subtle)]">
            To enable the Codebase Map, copy the example config and set{' '}
            <code className="rounded bg-[var(--color-bg-glass-hover)] px-1 py-0.5 text-[var(--text-xs)] text-[var(--color-fg-muted)]">
              enabled: true
            </code>
            .
          </p>
          <p className="text-[var(--text-xs)] text-[var(--color-fg-faint)]">
            See{' '}
            <code className="rounded bg-[var(--color-bg-glass-hover)] px-1 py-0.5 text-[var(--color-fg-muted)]">
              .storyflow/modules/code-intelligence.example.json
            </code>
          </p>
        </div>
      </motion.div>
    )
  }

  // Enabled but still booting sub-modules, or actively fetching
  if (loading || !ready) {
    return (
      <div
        className="flex h-full min-h-0 items-center justify-center"
        data-testid="codebase-map-loading"
      >
        <LoadingState message="Building codebase map..." size="lg" />
      </div>
    )
  }

  // Error state with retry
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full min-h-0 items-center justify-center p-[var(--space-6)]"
        data-testid="codebase-map-error"
      >
        <EmptyState
          icon={AlertCircle}
          title="Could not load codebase map"
          description={error.message || 'An unknown error occurred while fetching graph data.'}
          action={{ label: 'Retry', onClick: loadGraph }}
        />
      </motion.div>
    )
  }

  // Ready + no data — extremely small fallback so the canvas doesn't thrash
  if (!graphData) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <EmptyState
          icon={Network}
          title="No graph data yet"
          description="The code intelligence index is empty. Kick off an index run to populate the map."
          action={{ label: 'Refresh', onClick: loadGraph }}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="flex h-full min-h-0 flex-1 flex-col"
      data-testid="codebase-map-page"
    >
      <div className="flex shrink-0 items-center justify-between pb-[var(--space-3)]">
        <div className="flex items-center gap-[var(--space-2)]">
          <Network size={18} className="text-[var(--color-fg-muted)]" aria-hidden="true" />
          <h2 className="text-[var(--text-base)] font-semibold text-[var(--color-fg-default)]">
            Codebase Map
          </h2>
          <span className="text-[var(--text-xs)] text-[var(--color-fg-subtle)]">
            {graphData.nodes?.length ?? 0} nodes · {graphData.edges?.length ?? 0} edges
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={loadGraph}
          aria-label="Refresh codebase map"
        >
          Refresh
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-muted)] bg-[var(--color-bg-raised)]">
        <GraphRenderer
          nodes={graphData.nodes || []}
          edges={graphData.edges || []}
          clusters={graphData.clusters || []}
          theme="obsidian-dark"
          onNodeClick={handleNodeClick}
        />
      </div>
    </motion.div>
  )
}
