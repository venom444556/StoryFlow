import Modal from '../ui/Modal'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle2, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'

export default function HotWashModal({ isOpen, onClose, report, onFinalize, projectId }) {
  if (!report) return null

  const detailsLoaded =
    Object.prototype.hasOwnProperty.call(report, 'lessonsLearned') &&
    Object.prototype.hasOwnProperty.call(report, 'followUpActions')

  // UI Schema for integrator reference
  // report: {
  //   status: 'available',
  //   summary: 'High level text...',
  //   lessonsLearned: [{ type: 'success'|'improvement', text: '...' }],
  //   followUpActions: [{ title: '...', key?: 'issue-key' }]
  // }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>Phase Hot Wash Report</span>
          <div className="flex items-center gap-2">
            {projectId ? (
              <Link
                to={`/project/${projectId}/insights/lessons`}
                onClick={onClose}
                className="rounded border border-[var(--color-border-default)] px-2.5 py-1 text-xs text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                Lessons Page
              </Link>
            ) : null}
            {report.status === 'draft' && (
              <button
                onClick={() => onFinalize?.(report.phaseId)}
                className="text-xs bg-[var(--color-interactive-default)] text-white px-2.5 py-1 rounded hover:bg-[var(--color-interactive-hover)] transition-colors"
              >
                Finalize Report
              </button>
            )}
          </div>
        </div>
      }
      size="lg"
    >
      {report.loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]">
            <Loader2 size={16} className="animate-spin" />
            <span>Loading full report...</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Executive Summary */}
          <section className="bg-[var(--color-bg-subtle)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2 flex items-center gap-2">
              <FileText size={14} /> Executive Summary
            </h3>
            <p className="text-[var(--color-fg-default)] text-sm leading-relaxed">
              {report.summary || 'Summary unavailable.'}
            </p>
          </section>

          {!detailsLoaded ? (
            <section className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-glass)] p-4">
              <p className="text-sm text-[var(--color-fg-muted)]">
                Detailed lessons and follow-up actions are unavailable for this report right now.
              </p>
            </section>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lessons Learned */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-2">
                  <TrendingUp size={14} /> Lessons Learned
                </h3>

                {report.lessonsLearned?.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {report.lessonsLearned.map((lesson, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-[var(--color-bg-glass)] border border-[var(--color-border-default)] p-3 rounded shadow-sm"
                      >
                        {lesson.type === 'success' ? (
                          <CheckCircle2
                            size={16}
                            className="text-[var(--color-success)] mt-0.5 shrink-0"
                          />
                        ) : (
                          <AlertTriangle
                            size={16}
                            className="text-[var(--color-warning)] mt-0.5 shrink-0"
                          />
                        )}
                        <span className="text-sm text-[var(--color-fg-default)] leading-snug">
                          {lesson.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic text-[var(--color-fg-faint)]">
                    No explicit lessons recorded.
                  </p>
                )}
              </section>

              {/* Follow-up Actions */}
              <section className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)] flex items-center gap-2">
                  <CheckCircle2 size={14} /> Follow-Up Actions
                </h3>

                {report.followUpActions?.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {report.followUpActions.map((action, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-[var(--color-bg-glass)] border border-[var(--color-border-default)] p-3 rounded shadow-sm"
                      >
                        <div className="h-4 w-4 shrink-0 rounded border border-[var(--color-border-emphasis)] mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-sm text-[var(--color-fg-default)] leading-snug">
                            {action.title}
                          </span>
                          {action.key && (
                            <span className="text-xs text-[var(--color-accent-blue)] mt-1 tracking-wide font-mono">
                              {action.key}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic text-[var(--color-fg-faint)]">
                    No follow-up actions flagged.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
