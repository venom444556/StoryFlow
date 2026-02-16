import { Zap, BookOpen, CheckSquare, Bug, GitCommitHorizontal } from 'lucide-react'

const TYPE_CONFIG = {
  epic: {
    icon: Zap,
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    ring: 'ring-purple-500/30',
  },
  story: {
    icon: BookOpen,
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    ring: 'ring-green-500/30',
  },
  task: {
    icon: CheckSquare,
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    ring: 'ring-blue-500/30',
  },
  bug: {
    icon: Bug,
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
  },
  subtask: {
    icon: GitCommitHorizontal,
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    ring: 'ring-gray-500/30',
  },
}

const CONTAINER_SIZES = {
  12: 'h-5 w-5',
  14: 'h-5.5 w-5.5',
  16: 'h-6 w-6',
  20: 'h-7 w-7',
  24: 'h-8 w-8',
}

export default function IssueTypeIcon({ type, size = 16, className = '' }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.task
  const IconComponent = config.icon
  const containerSize = CONTAINER_SIZES[size] || 'h-6 w-6'

  return (
    <div
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-md ring-1',
        containerSize,
        config.bg,
        config.ring,
        className,
      ].join(' ')}
      title={type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
    >
      <IconComponent size={size * 0.65} className={config.text} />
    </div>
  )
}
