import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProject } from './useProject'
import { ProjectsProvider } from '../contexts/ProjectsContext'

// Mock project data
const createMockProject = () => ({
  id: 'test-project-1',
  name: 'Test Project',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  overview: {
    goals: ['Goal 1'],
    constraints: [],
    techStack: [],
    targetAudience: '',
  },
  board: {
    issues: [],
    sprints: [],
    columns: ['backlog', 'todo', 'in-progress', 'done'],
    nextIssueNumber: 1,
  },
  pages: [],
  decisions: [],
  timeline: {
    phases: [],
    milestones: [],
  },
  workflow: {
    nodes: [],
    edges: [],
  },
  architecture: {
    components: [],
  },
  settings: {},
})

// Create wrapper with pre-loaded project
function createWrapper(initialProject) {
  return function Wrapper({ children }) {
    return <ProjectsProvider>{children}</ProjectsProvider>
  }
}

describe('useProject hook', () => {
  beforeEach(() => {
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
  })

  describe('project retrieval', () => {
    it('returns null for non-existent project', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('overview updates', () => {
    it('updateOverview does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      // Should not throw
      act(() => {
        result.current.updateOverview({ goals: ['New Goal'] })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('issue operations', () => {
    it('addIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addIssue({ title: 'Test Issue', type: 'task' })
      })

      expect(result.current.project).toBeNull()
    })

    it('updateIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateIssue('issue-1', { title: 'Updated' })
      })

      expect(result.current.project).toBeNull()
    })

    it('deleteIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.deleteIssue('issue-1')
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('page operations', () => {
    it('addPage does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addPage({ title: 'Test Page', content: '' })
      })

      expect(result.current.project).toBeNull()
    })

    it('deletePage does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.deletePage('page-1')
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('decision operations', () => {
    it('addDecision does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addDecision({ title: 'Test Decision' })
      })

      expect(result.current.project).toBeNull()
    })

    it('updateDecision does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateDecision('dec-1', { title: 'Updated' })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('phase operations', () => {
    it('addPhase does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addPhase({ name: 'Test Phase' })
      })

      expect(result.current.project).toBeNull()
    })

    it('deletePhase does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.deletePhase('phase-1')
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('milestone operations', () => {
    it('addMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addMilestone({ name: 'Test Milestone' })
      })

      expect(result.current.project).toBeNull()
    })

    it('updateMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateMilestone('ms-1', { completed: true })
      })

      expect(result.current.project).toBeNull()
    })

    it('deleteMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.deleteMilestone('ms-1')
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('workflow operations', () => {
    it('updateWorkflow does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateWorkflow({ nodes: [] })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('architecture operations', () => {
    it('updateArchitecture does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateArchitecture({ components: [] })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('board settings operations', () => {
    it('updateBoardSettings does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateBoardSettings({ columns: ['backlog'] })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('settings operations', () => {
    it('updateSettings does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.updateSettings({ theme: 'dark' })
      })

      expect(result.current.project).toBeNull()
    })
  })

  describe('hook return value', () => {
    it('returns all expected methods', () => {
      const { result } = renderHook(() => useProject('test'), {
        wrapper: createWrapper(),
      })

      expect(typeof result.current.updateProject).toBe('function')
      expect(typeof result.current.updateOverview).toBe('function')
      expect(typeof result.current.addIssue).toBe('function')
      expect(typeof result.current.updateIssue).toBe('function')
      expect(typeof result.current.deleteIssue).toBe('function')
      expect(typeof result.current.addPage).toBe('function')
      expect(typeof result.current.updatePage).toBe('function')
      expect(typeof result.current.deletePage).toBe('function')
      expect(typeof result.current.addDecision).toBe('function')
      expect(typeof result.current.updateDecision).toBe('function')
      expect(typeof result.current.addPhase).toBe('function')
      expect(typeof result.current.updatePhase).toBe('function')
      expect(typeof result.current.deletePhase).toBe('function')
      expect(typeof result.current.addMilestone).toBe('function')
      expect(typeof result.current.updateMilestone).toBe('function')
      expect(typeof result.current.deleteMilestone).toBe('function')
      expect(typeof result.current.updateWorkflow).toBe('function')
      expect(typeof result.current.updateArchitecture).toBe('function')
      expect(typeof result.current.updateBoardSettings).toBe('function')
      expect(typeof result.current.updateSettings).toBe('function')
    })
  })
})
