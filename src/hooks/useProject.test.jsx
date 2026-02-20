import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProject } from './useProject'
import { useProjectsStore } from '../stores/projectsStore'

describe('useProject hook', () => {
  beforeEach(() => {
    // Reset the Zustand store to empty state before each test
    useProjectsStore.setState({ projects: [] })
  })

  describe('project retrieval', () => {
    it('returns undefined for non-existent project', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('overview updates', () => {
    it('updateOverview does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      // Should not throw
      act(() => {
        result.current.updateOverview({ goals: ['New Goal'] })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('issue operations', () => {
    it('addIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.addIssue({ title: 'Test Issue', type: 'task' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('updateIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateIssue('issue-1', { title: 'Updated' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('deleteIssue does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.deleteIssue('issue-1')
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('page operations', () => {
    it('addPage does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.addPage({ title: 'Test Page', content: '' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('deletePage does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.deletePage('page-1')
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('decision operations', () => {
    it('addDecision does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.addDecision({ title: 'Test Decision' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('updateDecision does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateDecision('dec-1', { title: 'Updated' })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('phase operations', () => {
    it('addPhase does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.addPhase({ name: 'Test Phase' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('deletePhase does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.deletePhase('phase-1')
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('milestone operations', () => {
    it('addMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.addMilestone({ name: 'Test Milestone' })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('updateMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateMilestone('ms-1', { completed: true })
      })

      expect(result.current.project).toBeUndefined()
    })

    it('deleteMilestone does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.deleteMilestone('ms-1')
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('workflow operations', () => {
    it('updateWorkflow does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateWorkflow({ nodes: [] })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('architecture operations', () => {
    it('updateArchitecture does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateArchitecture({ components: [] })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('board settings operations', () => {
    it('updateBoardSettings does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateBoardSettings({ columns: ['backlog'] })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('settings operations', () => {
    it('updateSettings does nothing when project is null', () => {
      const { result } = renderHook(() => useProject('nonexistent'))

      act(() => {
        result.current.updateSettings({ theme: 'dark' })
      })

      expect(result.current.project).toBeUndefined()
    })
  })

  describe('hook return value', () => {
    it('returns all expected methods', () => {
      const { result } = renderHook(() => useProject('test'))

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
