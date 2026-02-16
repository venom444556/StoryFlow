import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { SettingsProvider } from './contexts/SettingsContext'
import ErrorBoundary from './components/layout/ErrorBoundary'
import AppLayout from './components/layout/AppLayout'
import LoadingState from './components/ui/LoadingState'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ProjectsProvider>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Dashboard */}
              <Route index element={<DashboardPage />} />

              {/* Project routes with deep linking */}
              <Route
                path="project/:id/*"
                element={
                  <Suspense fallback={<LoadingState message="Loading project..." />}>
                    <ProjectPage />
                  </Suspense>
                }
              />

              {/* Legacy route redirect */}
              <Route path="project/:id" element={<Navigate to="overview" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ProjectsProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}
