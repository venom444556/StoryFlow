import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronDown, ChevronUp, Plus, Pencil, BookOpen, Lightbulb } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import SectionHeader from '../ui/SectionHeader'
import EmptyState from '../ui/EmptyState'

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false)

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(session.started_at || session.created_at), {
        addSuffix: true,
      })
    } catch {
      return ''
    }
  })()

  return (
    <div
      className="cursor-pointer rounded-xl px-3 py-3 transition-colors hover:bg-[var(--color-bg-glass)]"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-3">
        {/* Dot indicator with color coding */}
        <div className="mt-2 flex flex-col items-center gap-1">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor:
                session.issues_created > 0
                  ? 'var(--color-success)'
                  : session.issues_updated > 0
                    ? 'var(--color-info)'
                    : 'var(--color-fg-faint)',
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p
              className={[
                'text-[13px] font-medium leading-snug text-[var(--color-fg-default)]',
                !expanded && 'line-clamp-2',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {session.summary || session.work_done || 'Agent session'}
            </p>
            {expanded ? (
              <ChevronUp size={12} className="mt-0.5 shrink-0 text-[var(--color-fg-muted)]" />
            ) : (
              <ChevronDown size={12} className="mt-0.5 shrink-0 text-[var(--color-fg-muted)]" />
            )}
          </div>

          {/* Stat chips */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {session.issues_created > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                <Plus size={9} /> {session.issues_created} created
              </span>
            )}
            {session.issues_updated > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-info)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--color-info)]">
                <Pencil size={9} /> {session.issues_updated} updated
              </span>
            )}
            <span className="text-[10px] text-[var(--color-fg-faint)]">{timeAgo}</span>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 border-t border-[var(--color-border-default)] pt-3">
                  {session.work_done && session.summary !== session.work_done && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                        Work Done
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                        {session.work_done}
                      </p>
                    </div>
                  )}
                  {session.key_decisions && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                        Key Decisions
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                        {session.key_decisions}
                      </p>
                    </div>
                  )}
                  {session.learnings && (
                    <div className="flex items-start gap-1.5">
                      <Lightbulb size={11} className="mt-px shrink-0 text-amber-400" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                          Learnings
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                          {session.learnings}
                        </p>
                      </div>
                    </div>
                  )}
                  {session.next_steps && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-fg-subtle)]">
                        Next Steps
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-fg-muted)]">
                        {session.next_steps}
                      </p>
                    </div>
                  )}
                  {session.wiki_pages_updated && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-fg-subtle)]">
                      <BookOpen size={10} />
                      Wiki: {session.wiki_pages_updated}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function SessionHistory({ projectId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setLoading(true)

    fetch(`/api/projects/${encodeURIComponent(projectId)}/sessions?limit=10`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setSessions(data)
      })
      .catch(() => {
        if (!cancelled) setSessions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="border-b border-[var(--color-border-default)] px-5 py-4">
          <SectionHeader icon={History} color="var(--color-ai-accent)" className="mb-0">
            Session History
          </SectionHeader>
        </div>
        <div className="space-y-3 p-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-7 w-7 rounded-lg bg-[var(--color-bg-glass)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-[var(--color-bg-glass)]" />
                <div className="h-2 w-1/2 rounded bg-[var(--color-bg-glass)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="glass-card overflow-hidden h-[400px] flex flex-col">
        <div className="border-b border-[var(--color-border-default)] px-5 py-4">
          <SectionHeader icon={History} color="var(--color-ai-accent)" className="mb-0">
            Session History
          </SectionHeader>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <EmptyState
            icon={History}
            title="No agent sessions yet"
            description="Session history will appear here after the AI agent completes work on your project"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card flex flex-col overflow-hidden h-[400px]">
      <div className="border-b border-[var(--color-border-default)] px-5 py-4 shrink-0">
        <SectionHeader
          icon={History}
          color="var(--color-ai-accent)"
          count={sessions.length}
          className="mb-0"
        >
          Session History
        </SectionHeader>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}
