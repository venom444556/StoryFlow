import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ChevronRight,
  FileText,
  ListTodo,
  GitBranch,
  Scale,
  Clock,
  Wand2,
  X,
} from 'lucide-react'
import AIActionButton, { AISuggestionCard } from './AIActionButton'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'

/**
 * AI Actions by context type
 */
const AI_ACTIONS = {
  board: [
    {
      id: 'generate-issues',
      icon: ListTodo,
      label: 'Generate Issues from PRD',
      description: 'Parse a requirements document and create structured issues',
    },
    {
      id: 'suggest-sprint',
      icon: Clock,
      label: 'Suggest Sprint Planning',
      description: 'AI-powered sprint backlog recommendations based on velocity',
    },
    {
      id: 'estimate-points',
      icon: Wand2,
      label: 'Estimate Story Points',
      description: 'Analyze issue descriptions and suggest point estimates',
    },
  ],
  wiki: [
    {
      id: 'draft-from-outline',
      icon: FileText,
      label: 'Draft Page from Outline',
      description: 'Generate full page content from a bullet-point outline',
    },
    {
      id: 'improve-writing',
      icon: Wand2,
      label: 'Improve Writing',
      description: 'Enhance clarity, fix grammar, and improve readability',
    },
    {
      id: 'generate-docs',
      icon: FileText,
      label: 'Generate API Docs',
      description: 'Create documentation from code comments and types',
    },
  ],
  decisions: [
    {
      id: 'analyze-alternatives',
      icon: Scale,
      label: 'Analyze Alternatives',
      description: 'Deep-dive comparison of options with pros/cons',
    },
    {
      id: 'suggest-questions',
      icon: Wand2,
      label: 'Suggest Questions',
      description: 'Identify blind spots and missing considerations',
    },
    {
      id: 'generate-summary',
      icon: FileText,
      label: 'Generate Summary',
      description: 'Create executive summary of the decision',
    },
  ],
  architecture: [
    {
      id: 'suggest-components',
      icon: GitBranch,
      label: 'Suggest Components',
      description: 'Recommend component structure based on requirements',
    },
    {
      id: 'detect-patterns',
      icon: Wand2,
      label: 'Detect Patterns',
      description: 'Identify design patterns in your architecture',
    },
    {
      id: 'generate-diagram',
      icon: FileText,
      label: 'Generate Diagram Description',
      description: 'Create mermaid/plantuml from component structure',
    },
  ],
  timeline: [
    {
      id: 'estimate-durations',
      icon: Clock,
      label: 'Estimate Durations',
      description: 'AI-powered time estimates based on task complexity',
    },
    {
      id: 'optimize-schedule',
      icon: Wand2,
      label: 'Optimize Schedule',
      description: 'Suggest optimal task ordering based on dependencies',
    },
    {
      id: 'identify-risks',
      icon: FileText,
      label: 'Identify Schedule Risks',
      description: 'Highlight potential bottlenecks and delays',
    },
  ],
}

/**
 * AIPanel - Contextual AI actions panel
 */
export default function AIPanel({
  context = 'board', // 'board' | 'wiki' | 'decisions' | 'architecture' | 'timeline'
  onAction,
  className = '',
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeAction, setActiveAction] = useState(null)

  const actions = AI_ACTIONS[context] || []

  const handleAction = (action) => {
    setActiveAction(action.id)
    // Call the onAction callback - in a real implementation, this would
    // trigger the AI processing. For now, it's a placeholder.
    onAction?.(action.id, action)

    // Simulate completion after a brief delay
    setTimeout(() => setActiveAction(null), 500)
  }

  if (!expanded) {
    return (
      <AIActionButton
        onClick={() => setExpanded(true)}
        tooltip="AI Assistant"
        className={className}
      >
        AI Actions
        <ChevronRight size={14} />
      </AIActionButton>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border-muted)] p-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span className="font-medium text-[var(--color-fg-default)]">
              AI Assistant
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded p-1 text-[var(--color-fg-subtle)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-muted)]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-2">
          {actions.map((action) => {
            const Icon = action.icon
            const isActive = activeAction === action.id

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action)}
                disabled={isActive}
                className={[
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                  isActive
                    ? 'bg-purple-500/20'
                    : 'hover:bg-[var(--color-bg-glass-hover)]',
                ].join(' ')}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-purple-400' : 'text-[var(--color-fg-muted)]'}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-fg-default)]">
                      {action.label}
                    </span>
                    {isActive && (
                      <span className="text-xs text-purple-400">Processing...</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-[var(--color-border-muted)] p-3">
          <p className="text-center text-xs text-[var(--color-fg-subtle)]">
            AI features require Claude integration
          </p>
        </div>
      </GlassCard>
    </motion.div>
  )
}

/**
 * Compact AI action button bar for embedding in headers
 */
export function AIActionBar({
  context = 'board',
  onAction,
  className = '',
}) {
  const actions = AI_ACTIONS[context] || []
  const primaryAction = actions[0]

  if (!primaryAction) return null

  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <AIActionButton
        onClick={() => onAction?.(primaryAction.id, primaryAction)}
        tooltip={primaryAction.description}
      >
        {primaryAction.label}
      </AIActionButton>
    </div>
  )
}

/**
 * Get all available AI actions for a context
 */
export function getAIActions(context) {
  return AI_ACTIONS[context] || []
}
