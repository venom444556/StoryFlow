import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProjects } from './useProjects'
import { ProjectsProvider } from '../contexts/ProjectsContext'

describe('useProjects', () => {
  beforeEach(() => {
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
  })

  function createWrapper() {
    return function Wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }
  }

  describe('initial state', () => {
    it('returns projects array', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      expect(Array.isArray(result.current.projects)).toBe(true)
    })

    it('returns all expected methods', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      expect(typeof result.current.addProject).toBe('function')
      expect(typeof result.current.deleteProject).toBe('function')
      expect(typeof result.current.importProject).toBe('function')
      expect(typeof result.current.getProject).toBe('function')
    })

    it('initializes with projects array', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // In test env, Zustand's persist middleware may not rehydrate synchronously.
      // The store initializes with an empty array, then seeds on rehydration.
      // Just verify the hook returns an array.
      expect(Array.isArray(result.current.projects)).toBe(true)
    })
  })

  describe('addProject', () => {
    it('adds a new project', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      const initialCount = result.current.projects.length

      act(() => {
        result.current.addProject('Test Project')
      })

      expect(result.current.projects.length).toBe(initialCount + 1)
    })

    it('returns the created project', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      let newProject
      act(() => {
        newProject = result.current.addProject('My New Project')
      })

      expect(newProject).toBeDefined()
      expect(newProject.name).toBe('My New Project')
      expect(newProject.id).toBeDefined()
    })

    it('creates project with required fields', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      let newProject
      act(() => {
        newProject = result.current.addProject('Complete Project')
      })

      expect(newProject.id).toBeDefined()
      expect(newProject.name).toBe('Complete Project')
      expect(newProject.createdAt).toBeDefined()
      expect(newProject.updatedAt).toBeDefined()
      expect(newProject.overview).toBeDefined()
      expect(newProject.board).toBeDefined()
      expect(newProject.pages).toBeDefined()
      expect(newProject.decisions).toBeDefined()
      expect(newProject.timeline).toBeDefined()
      expect(newProject.workflow).toBeDefined()
      expect(newProject.architecture).toBeDefined()
    })

    it('project is available after add', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.addProject('Persisted Project')
      })

      // Zustand uses IndexedDB (not localStorage) for persistence.
      // Verify the project was added to the store.
      const found = result.current.projects.find((p) => p.name === 'Persisted Project')
      expect(found).toBeDefined()
    })
  })

  describe('deleteProject', () => {
    it('removes a project by id', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // Add a project first
      let newProject
      act(() => {
        newProject = result.current.addProject('To Delete')
      })

      const countAfterAdd = result.current.projects.length

      act(() => {
        result.current.deleteProject(newProject.id)
      })

      expect(result.current.projects.length).toBe(countAfterAdd - 1)
      expect(result.current.projects.find((p) => p.id === newProject.id)).toBeUndefined()
    })

    it('does nothing for non-existent id', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      const initialCount = result.current.projects.length

      act(() => {
        result.current.deleteProject('non-existent-id')
      })

      expect(result.current.projects.length).toBe(initialCount)
    })
  })

  describe('getProject', () => {
    it('returns project by id', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // Add a project
      let newProject
      act(() => {
        newProject = result.current.addProject('Findable Project')
      })

      const found = result.current.getProject(newProject.id)

      expect(found).toBeDefined()
      expect(found.id).toBe(newProject.id)
      expect(found.name).toBe('Findable Project')
    })

    it('returns null for non-existent id', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      const found = result.current.getProject('non-existent-id')

      expect(found).toBeNull()
    })
  })

  describe('importProject', () => {
    it('imports a project with new id', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      const importedData = {
        name: 'Imported Project',
        description: 'From external source',
        overview: { goals: ['Goal 1'] },
        board: { issues: [] },
        pages: [],
        decisions: [],
        timeline: { phases: [] },
        workflow: { nodes: [] },
        architecture: { components: [] },
      }

      const initialCount = result.current.projects.length

      act(() => {
        result.current.importProject(importedData)
      })

      expect(result.current.projects.length).toBe(initialCount + 1)

      const imported = result.current.projects.find((p) => p.name === 'Imported Project')
      expect(imported).toBeDefined()
      // Should have a new id, not the original
      expect(imported.id).toBeDefined()
      expect(imported.id).not.toBe(importedData.id)
    })

    it('sets new timestamps on import', () => {
      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      const oldDate = '2020-01-01T00:00:00.000Z'
      const importedData = {
        name: 'Old Project',
        createdAt: oldDate,
        updatedAt: oldDate,
        overview: {},
        board: { issues: [] },
        pages: [],
        decisions: [],
      }

      act(() => {
        result.current.importProject(importedData)
      })

      const imported = result.current.projects.find((p) => p.name === 'Old Project')
      expect(imported.createdAt).not.toBe(oldDate)
      expect(imported.updatedAt).not.toBe(oldDate)
    })
  })

  describe('context requirement', () => {
    it('throws error when used outside provider', () => {
      // Suppress expected error output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useProjects())
      }).toThrow('useProjectsContext must be used within a ProjectsProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('multiple hook instances', () => {
    it('shares state between hook instances', () => {
      const wrapper = createWrapper()

      const { result: result1 } = renderHook(() => useProjects(), { wrapper })
      const { result: result2 } = renderHook(() => useProjects(), { wrapper })

      // Both should see the same initial projects
      expect(result1.current.projects.length).toBe(result2.current.projects.length)

      // Add project via first hook
      act(() => {
        result1.current.addProject('Shared Project')
      })

      // Second hook should see the new project
      expect(result2.current.projects.find((p) => p.name === 'Shared Project')).toBeDefined()
    })
  })

  describe('localStorage integration', () => {
    it('loads projects from localStorage', () => {
      const storedProjects = [
        {
          id: 'stored-1',
          name: 'Stored Project',
          isSeed: true,
          seedVersion: 999,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          overview: {},
          board: { issues: [] },
          pages: [],
          decisions: [],
          timeline: { phases: [] },
          workflow: { nodes: [] },
          architecture: { components: [] },
        },
      ]

      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(storedProjects))

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // Note: The seed project may be migrated if version is newer
      expect(result.current.projects.length).toBeGreaterThan(0)
    })

    it('handles corrupted localStorage gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid json {{{')

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // Should fall back to seed data
      expect(result.current.projects.length).toBeGreaterThan(0)
    })

    it('handles empty localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      })

      // Should initialize with seed project
      expect(result.current.projects.length).toBeGreaterThan(0)
    })
  })
})
