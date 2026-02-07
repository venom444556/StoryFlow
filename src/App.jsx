import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProjectsProvider } from './contexts/ProjectsContext'
import { SettingsProvider } from './contexts/SettingsContext'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'

const ProjectPage = lazy(() => import('./pages/ProjectPage'))

export default function App() {
  return (
    <SettingsProvider>
      <ProjectsProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route
              path="project/:id"
              element={
                <Suspense fallback={null}>
                  <ProjectPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ProjectsProvider>
    </SettingsProvider>
  )
}
