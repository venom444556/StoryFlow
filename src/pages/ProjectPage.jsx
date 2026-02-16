import { lazy, Suspense, useEffect, useMemo } from 'react'
import {
  useParams,
  Link,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Box, Workflow, FileEdit, Scale } from 'lucide-react'
import { useProject } from '../hooks/useProject'
import { useKeyboardShortcuts, SHORTCUTS } from '../hooks/useKeyboardShortcuts'
import { SEED_PROJECT_ID, LEGACY_SEED_PROJECT_ID } from '../data/storyflow'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import ProjectSidebar from '../components/project/ProjectSidebar'
import ProjectHeader from '../components/project/ProjectHeader'

// Sub-navigation for tabs with multiple views
const SUB_NAV = {
  plan: [
    { key: 'plan', label: 'Architecture', icon: Box, path: 'plan' },
    { key: 'plan/workflow', label: 'Workflow', icon: Workflow, path: 'plan/workflow' },
  ],
  docs: [
    { key: 'docs', label: 'Wiki', icon: FileEdit, path: 'docs' },
    { key: 'docs/decisions', label: 'Decisions', icon: Scale, path: 'docs/decisions' },
  ],
}

// Map active tab keys → sub-nav group
const TAB_TO_GROUP = {
  architecture: 'plan',
  workflow: 'plan',
  wiki: 'docs',
  decisions: 'docs',
}

// Map active tab keys → sub-nav tab key (for active indicator)
const TAB_TO_SUBNAV_KEY = {
  architecture: 'plan',
  workflow: 'plan/workflow',
  wiki: 'docs',
  decisions: 'docs/decisions',
}

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
      <Loader2 size={24} className="animate-spin text-[var(--color-fg-subtle)]" />
    </div>
  )
}

// Get active tab from pathname
function getActiveTabFromPath(pathname, projectId) {
  const basePath = `/project/${projectId}/`
  if (!pathname.startsWith(basePath)) return 'overview'

  const subPath = pathname.slice(basePath.length)

  // Check for nested routes first (more specific)
  if (subPath.startsWith('plan/workflow')) return 'workflow'
  if (subPath.startsWith('docs/decisions')) return 'decisions'
  if (subPath.startsWith('work/issue/')) return 'board'
  if (subPath.startsWith('docs/page/')) return 'wiki'

  // Then check base routes
  if (subPath.startsWith('plan')) return 'architecture'
  if (subPath.startsWith('work')) return 'board'
  if (subPath.startsWith('docs')) return 'wiki'
  if (subPath.startsWith('insights')) return 'timeline'
  if (subPath.startsWith('overview')) return 'overview'

  return 'overview'
}

export default function ProjectPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect legacy seed project URL to new slug-based URL
  useEffect(() => {
    if (id === LEGACY_SEED_PROJECT_ID) {
      const rest = location.pathname.replace(`/project/${LEGACY_SEED_PROJECT_ID}`, '')
      navigate(`/project/${SEED_PROJECT_ID}${rest}`, { replace: true })
    }
  }, [id, location.pathname, navigate])

  const hooks = useProject(id)
  const { project, updateProject } = hooks

  // Get active tab from URL
  const activeTab = useMemo(
    () => getActiveTabFromPath(location.pathname, id),
    [location.pathname, id]
  )

  // Keyboard shortcuts for tab navigation
  useKeyboardShortcuts({
    [SHORTCUTS.TAB_OVERVIEW]: () => navigate(`/project/${id}/overview`),
    [SHORTCUTS.TAB_ARCHITECTURE]: () => navigate(`/project/${id}/plan`),
    [SHORTCUTS.TAB_WORKFLOW]: () => navigate(`/project/${id}/plan/workflow`),
    [SHORTCUTS.TAB_BOARD]: () => navigate(`/project/${id}/work`),
    [SHORTCUTS.TAB_WIKI]: () => navigate(`/project/${id}/docs`),
    [SHORTCUTS.TAB_TIMELINE]: () => navigate(`/project/${id}/insights`),
    [SHORTCUTS.TAB_DECISIONS]: () => navigate(`/project/${id}/docs/decisions`),
  })

  if (!project) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <h2 className="mb-2 text-xl font-semibold text-[var(--color-fg-muted)]">
          Project not found
        </h2>
        <p className="mb-6 text-sm text-[var(--color-fg-subtle)]">
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
      <ProjectSidebar
        activeTab={activeTab}
        projectId={id}
        onTabChange={(tab) => {
          const pathMap = {
            overview: 'overview',
            architecture: 'plan',
            workflow: 'plan/workflow',
            board: 'work',
            wiki: 'docs',
            timeline: 'insights',
            decisions: 'docs/decisions',
          }
          navigate(`/project/${id}/${pathMap[tab] || 'overview'}`)
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-3 pb-2 md:px-6 md:pt-4">
          <ProjectHeader project={project} onUpdate={updateProject} />
        </div>

        {/* Sub-navigation tabs for Plan and Docs */}
        {TAB_TO_GROUP[activeTab] && (
          <div className="shrink-0 px-4 pb-2 md:px-6">
            <Tabs
              tabs={SUB_NAV[TAB_TO_GROUP[activeTab]]}
              activeTab={TAB_TO_SUBNAV_KEY[activeTab]}
              onTabChange={(key) => {
                const tab = SUB_NAV[TAB_TO_GROUP[activeTab]]?.find((t) => t.key === key)
                if (tab) {
                  navigate(`/project/${id}/${tab.path}`)
                }
              }}
              layoutId="sub-nav"
            />
          </div>
        )}

        <div className="flex-1 overflow-auto px-4 pb-20 md:px-6 md:pb-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="h-full pt-2"
          >
            <Suspense fallback={<TabFallback />}>
              <Routes>
                {/* Overview */}
                <Route
                  path="overview"
                  element={<OverviewTab project={project} onUpdate={updateProject} />}
                />

                {/* Plan tab (Architecture) */}
                <Route
                  path="plan"
                  element={<ArchitectureTab project={project} onUpdate={updateProject} />}
                />
                <Route
                  path="plan/workflow"
                  element={<WorkflowTab project={project} onUpdate={hooks.updateWorkflow} />}
                />

                {/* Work tab (Board) */}
                <Route
                  path="work"
                  element={
                    <BoardTab
                      project={project}
                      addIssue={hooks.addIssue}
                      updateIssue={hooks.updateIssue}
                      deleteIssue={hooks.deleteIssue}
                      addSprint={hooks.addSprint}
                      updateSprint={hooks.updateSprint}
                      deleteSprint={hooks.deleteSprint}
                      closeSprint={hooks.closeSprint}
                    />
                  }
                />
                <Route
                  path="work/issue/:issueId"
                  element={
                    <BoardTab
                      project={project}
                      addIssue={hooks.addIssue}
                      updateIssue={hooks.updateIssue}
                      deleteIssue={hooks.deleteIssue}
                      addSprint={hooks.addSprint}
                      updateSprint={hooks.updateSprint}
                      deleteSprint={hooks.deleteSprint}
                      closeSprint={hooks.closeSprint}
                    />
                  }
                />

                {/* Docs tab (Wiki) */}
                <Route
                  path="docs"
                  element={
                    <WikiTab
                      project={project}
                      addPage={hooks.addPage}
                      updatePage={hooks.updatePage}
                      deletePage={hooks.deletePage}
                    />
                  }
                />
                <Route
                  path="docs/page/:pageId"
                  element={
                    <WikiTab
                      project={project}
                      addPage={hooks.addPage}
                      updatePage={hooks.updatePage}
                      deletePage={hooks.deletePage}
                    />
                  }
                />
                <Route
                  path="docs/decisions"
                  element={
                    <DecisionsTab
                      project={project}
                      addDecision={hooks.addDecision}
                      updateDecision={hooks.updateDecision}
                    />
                  }
                />

                {/* Insights tab (Timeline) */}
                <Route
                  path="insights"
                  element={
                    <TimelineTab
                      project={project}
                      addPhase={hooks.addPhase}
                      updatePhase={hooks.updatePhase}
                      deletePhase={hooks.deletePhase}
                      addMilestone={hooks.addMilestone}
                      updateMilestone={hooks.updateMilestone}
                      deleteMilestone={hooks.deleteMilestone}
                    />
                  }
                />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="overview" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
