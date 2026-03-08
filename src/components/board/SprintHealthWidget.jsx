import GlassCard from '../ui/GlassCard'
import Sparkline from '../ui/Sparkline'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function SprintHealthWidget({ sprint, issues = [] }) {
  if (!sprint) return null

  const sprintIssues = issues.filter((i) => i.sprintId === sprint.id)
  const totalPoints = sprintIssues.reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  const donePoints = sprintIssues
    .filter((i) => i.status === 'Done')
    .reduce((s, i) => s + (i.storyPoints ?? 0), 0)
  const remaining = totalPoints - donePoints

  // Generate sparkline data (simulated daily progress)
  const days = 7
  const sparkData = []
  for (let d = 0; d <= days; d++) {
    const fraction = d / days
    sparkData.push(Math.max(0, totalPoints - donePoints * Math.min(fraction * 1.5, 1)))
  }

  const velocityDelta = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0

  return (
    <GlassCard padding="sm" className="flex items-center gap-3 min-w-[200px]">
      <Sparkline
        data={sparkData}
        width={80}
        height={28}
        color="var(--accent-default)"
        className="shrink-0"
      />
      <div className="min-w-0">
        <div className="text-[var(--text-2xs)] text-[var(--color-fg-subtle)] uppercase tracking-wider">
          Remaining
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[var(--color-fg-default)]">{remaining} pts</span>
          <span
            className={[
              'flex items-center gap-0.5 text-[10px] font-medium',
              velocityDelta >= 50 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
            ].join(' ')}
          >
            {velocityDelta >= 50 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {velocityDelta}%
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
