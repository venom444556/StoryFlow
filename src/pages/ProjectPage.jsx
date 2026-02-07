import { useState, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useProject } from '../hooks/useProject'
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import Button from '../components/ui/Button'
import ProjectSidebar from '../components/project/ProjectSidebar'
import ProjectHeader from '../components/project/ProjectHeader'

const OverviewTab = lazy(() => import('../components/project/OverviewTab'))
const ArchitectureTab = lazy(() => import('../components/project/ArchitectureTab'))
const WorkflowTab = lazy(() => import('../components/project/WorkflowTab'))
const BoardTab = lazy(() => import('../components/project/BoardTab'))
const WikiTab = lazy(() => import('../components/project/WikiTab'))
const TimelineTab = lazy(() => import('../components/project/TimelineTab'))
const DecisionsTab = lazy(() => import('../components/project/DecisionsTab'))

function TabFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 size={24} className="animate-spin text-slate-500" />
    </div>
  )
}

function renderTab(tab, project, hooks) {
  switch (tab) {
    case 'overview':
      return <OverviewTab project={project} onUpdate={hooks.updateProject} />
    case 'architecture':
      return <ArchitectureTab project={project} onUpdate={hooks.updateProject} />
    case 'workflow':
      return <WorkflowTab project={project} onUpdate={hooks.updateWorkflow} />
    case 'board':
      return (
        <BoardTab
          project={project}
          addIssue={hooks.addIssue}
          updateIssue={hooks.updateIssue}
          deleteIssue={hooks.deleteIssue}
        />
      )
    case 'wiki':
      return (
        <WikiTab
          project={project}
          addPage={hooks.addPage}
          updatePage={hooks.updatePage}
          deletePage={hooks.deletePage}
        />
      )
    case 'timeline':
      return (
        <TimelineTab
          project={project}
          addPhase={hooks.addPhase}
          updatePhase={hooks.updatePhase}
          deletePhase={hooks.deletePhase}
          addMilestone={hooks.addMilestone}
          updateMilestone={hooks.updateMilestone}
          deleteMilestone={hooks.deleteMilestone}
        />
      )
    case 'decisions':
      return (
        <DecisionsTab
          project={project}
          addDecision={hooks.addDecision}
          updateDecision={hooks.updateDecision}
        />
      )
    default:
      return <OverviewTab project={project} onUpdate={hooks.updateProject} />
  }
}

export default function ProjectPage() {
  const { id } = useParams()
  const hooks = useProject(id)
  const { project, updateProject } = hooks
  const [activeTab, setActiveTab] = useState('overview')

  // Alt+1-7 for tab switching
  useKeyboardShortcuts({
    [SHORTCUTS.TAB_OVERVIEW]: () => setActiveTab('overview'),
    [SHORTCUTS.TAB_ARCHITECTURE]: () => setActiveTab('architecture'),
    [SHORTCUTS.TAB_WORKFLOW]: () => setActiveTab('workflow'),
    [SHORTCUTS.TAB_BOARD]: () => setActiveTab('board'),
    [SHORTCUTS.TAB_WIKI]: () => setActiveTab('wiki'),
    [SHORTCUTS.TAB_TIMELINE]: () => setActiveTab('timeline'),
    [SHORTCUTS.TAB_DECISIONS]: () => setActiveTab('decisions'),
  })

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-slate-300">
          Project not found
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          The project you are looking for does not exist or has been removed.
        </p>
        <Link to="/">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <ProjectSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-3 pb-2 md:px-6 md:pt-4">
          <ProjectHeader project={project} onUpdate={updateProject} />
        </div>

        <div className="flex-1 overflow-auto px-4 pb-20 md:px-6 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full pt-2"
            >
              <Suspense fallback={<TabFallback />}>
                {renderTab(activeTab, project, hooks)}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
