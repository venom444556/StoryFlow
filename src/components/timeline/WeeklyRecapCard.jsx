import { FileText } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

/**
 * WeeklyRecapCard displays a gradient-accent summary of the latest
 * week's progress. Shows recap text and a link to view the full report.
 */
export default function WeeklyRecapCard({ recap, onViewReport }) {
  if (!recap) return null

  return (
    <GlassCard variant="obsidian" className="relative overflow-hidden">
      {/* Gradient accent stripe */}
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ background: 'linear-gradient(to bottom, #10b981, #8b5cf6)' }}
      />

      <div className="pl-3">
        <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
          Weekly Recap
        </h4>
        <p className="text-sm leading-relaxed text-[var(--color-fg-default)]">
          {recap.summary || 'No recap available for this week.'}
        </p>

        {recap.highlights && recap.highlights.length > 0 && (
          <ul className="mt-2 space-y-1">
            {recap.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-fg-muted)]">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-success)]" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {onViewReport && (
          <div className="mt-3">
            <Button variant="ghost" size="sm" icon={FileText} onClick={onViewReport}>
              View Full Report
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
