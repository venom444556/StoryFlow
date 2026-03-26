import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Lightbulb,
  Loader2,
  CheckCircle2,
  ClipboardList,
  ArrowUpRight,
  FileText,
} from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import EmptyState from '../ui/EmptyState'
import SectionHeader from '../ui/SectionHeader'

function formatStamp(value) {
  if (!value) return 'Unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'
  return date.toLocaleString()
}

// Removed MetricCard payload—we use inline text summaries for a truly raw IDE feel.

export default function LessonsLearnedTab({ project }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLessons = useCallback(
    async (signal) => {
      if (!project?.id) return
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/projects/${project.id}/lessons-learned`, { signal })
        if (!res.ok) throw new Error('Failed to load lessons learned')
        const body = await res.json()
        setData(body)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Failed to load lessons learned:', err)
        setError(err.message || 'Failed to load lessons learned')
      } finally {
        setLoading(false)
      }
    },
    [project?.id]
  )

  useEffect(() => {
    const controller = new AbortController()
    void loadLessons(controller.signal)
    return () => controller.abort()
  }, [loadLessons])

  const flatLessons = useMemo(
    () =>
      (data?.reports || []).flatMap((report) =>
        (report.lessonsLearned || []).map((lesson, index) => ({
          id: `${report.phaseId}-lesson-${index}`,
          phaseId: report.phaseId,
          phaseName: report.phaseName,
          text: lesson,
          status: report.status,
        }))
      ),
    [data]
  )

  const flatActions = useMemo(
    () =>
      (data?.reports || []).flatMap((report) =>
        (report.followUpActions || []).map((action, index) => ({
          id: `${report.phaseId}-action-${index}`,
          phaseId: report.phaseId,
          phaseName: report.phaseName,
          title: action.title,
          key: action.key || null,
          status: report.status,
        }))
      ),
    [data]
  )

  if (loading) {
    return (
      <div className="flex min-h-[750px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading lessons learned...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[750px] items-center justify-center">
        <EmptyState icon={Lightbulb} title="Lessons learned unavailable" description={error} />
      </div>
    )
  }

  const summary = data?.summary || {
    reportsCount: 0,
    finalCount: 0,
    draftCount: 0,
    lessonsCount: 0,
    followUpActionsCount: 0,
    pageId: null,
  }

  return (
    <div className="surface-workstation with-steering-clearance flex min-h-[750px] flex-col overflow-hidden px-4 pt-4 md:px-8 md:pt-6">
      <div className="mb-6 flex items-end justify-between border-b border-[var(--color-border-muted)] pb-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[var(--color-fg-default)] flex items-center gap-2">
            <Lightbulb size={18} className="text-[var(--color-fg-muted)]" />
            Lessons Learned
          </h1>
          <p className="mt-1 text-sm text-[var(--color-fg-faint)]">
            Project-level lessons and follow-up actions captured from phase hot washes.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-fg-muted)]">
          <span>{summary.reportsCount} REPORTS</span>
          <span className="text-[var(--color-border-muted)]">|</span>
          <span>{summary.lessonsCount} LESSONS</span>
          <span className="text-[var(--color-border-muted)]">|</span>
          <span>{summary.followUpActionsCount} ACTIONS</span>
          {summary.pageId && (
            <>
              <span className="text-[var(--color-border-muted)]">|</span>
              <Link
                to={`/project/${project.id}/docs/page/${summary.pageId}`}
                className="flex items-center gap-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-default)] transition-colors"
                title="Open inside Wiki"
              >
                <span>OPEN WIKI</span>
                <ArrowUpRight size={12} />
              </Link>
            </>
          )}
        </div>
      </div>

      {!data?.reports?.length ? (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={FileText}
            title="No lessons learned yet"
            description="Generate a phase hot wash to automatically populate the project-level lessons."
          />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 xl:grid-cols-[1.5fr_1fr] pb-8">
          {/* Phase Reports - Left Column */}
          <div className="flex flex-col min-h-0">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-fg-faint)] flex items-center gap-2">
              <FileText size={14} /> Phase Reports
            </h2>
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
              {data.reports.map((report) => (
                <div key={report.id} className="group flex flex-col gap-3">
                  <div className="flex items-baseline justify-between border-b border-[var(--color-border-subtle)] pb-2">
                    <div className="text-sm font-semibold tracking-tight text-[var(--color-fg-default)] group-hover:text-[var(--accent-default)] transition-colors">
                      {report.phaseName}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase text-[var(--color-fg-muted)]">
                      <span>{report.status}</span>
                      <span>GEN: {formatStamp(report.generatedAt)}</span>
                    </div>
                  </div>
                  <p className="text-[13px] leading-loose text-[var(--color-fg-default)] border-b border-[var(--color-border-subtle)] pb-4 mb-4">
                    {report.summary || 'Summary unavailable.'}
                  </p>
                  <div className="flex flex-col gap-6">
                    <div>
                      <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)]">
                        Lessons Output
                      </div>
                      {report.lessonsLearned.length ? (
                        <ul className="space-y-3 border-l-2 border-[var(--color-border-muted)] pl-4">
                          {report.lessonsLearned.map((lesson, index) => (
                            <li
                              key={index}
                              className="text-[13.5px] leading-loose text-[var(--color-fg-default)]"
                            >
                              {lesson}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[13px] italic text-[var(--color-fg-muted)]">None</div>
                      )}
                    </div>
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg-muted)]">
                        Follow-Up Actions
                      </div>
                      {report.followUpActions.length ? (
                        <ul className="space-y-3 border-l-2 border-[var(--color-border-muted)] pl-4">
                          {report.followUpActions.map((action, index) => (
                            <li
                              key={index}
                              className="text-[13.5px] leading-loose text-[var(--color-fg-default)]"
                            >
                              {action.key ? (
                                <span className="mr-2 font-mono text-[11.5px] font-medium text-[var(--color-fg-muted)]">
                                  [{action.key}]
                                </span>
                              ) : null}
                              {action.title}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[13px] italic text-[var(--color-fg-muted)]">None</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distilled DB - Right Column */}
          <div className="flex flex-col min-h-0 gap-8 border-l border-[var(--color-border-muted)] pl-8">
            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-fg-faint)] flex items-center gap-2">
                <CheckCircle2 size={14} /> Distilled Lessons
              </h2>
              <div className="flex-1 overflow-y-auto pr-2">
                {flatLessons.length ? (
                  <ul className="space-y-6">
                    {flatLessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="text-[13.5px] border-l-2 border-[var(--color-border-subtle)] pl-4"
                      >
                        <span className="font-mono text-[11px] text-[var(--color-fg-muted)] uppercase tracking-wider block mb-2">
                          {lesson.phaseName}
                        </span>
                        <span className="text-[var(--color-fg-default)] leading-loose block">
                          {lesson.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[13px] italic text-[var(--color-fg-faint)]">
                    No lessons logged.
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--color-fg-faint)] flex items-center gap-2">
                <ClipboardList size={14} /> Follow-Up Queue
              </h2>
              <div className="flex-1 overflow-y-auto pr-2">
                {flatActions.length ? (
                  <ul className="space-y-4">
                    {flatActions.map((action) => (
                      <li
                        key={action.id}
                        className="text-[13.5px] group rounded-md p-2 -ml-2 hover:bg-[var(--color-bg-subtle)] transition-colors"
                      >
                        <span className="font-mono text-[11px] text-[var(--color-fg-muted)] uppercase tracking-wider flex items-center justify-between mb-1.5">
                          {action.phaseName}
                          {action.key && (
                            <span className="text-[var(--color-fg-faint)]">[{action.key}]</span>
                          )}
                        </span>
                        <span className="text-[var(--color-fg-default)] group-hover:text-[var(--accent-default)] transition-colors">
                          {action.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[13px] italic text-[var(--color-fg-faint)]">
                    No actions queued.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
