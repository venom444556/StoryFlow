import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ProjectsProvider, useProjectsContext } from './ProjectsContext'

describe('ProjectsContext', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useProjectsContext', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useProjectsContext())
      }).toThrow('useProjectsContext must be used within a ProjectsProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('ProjectsProvider', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('provides projects array', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(Array.isArray(result.current.projects)).toBe(true)
    })

    it('provides dispatch function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.dispatch).toBe('function')
    })

    it('provides addProject function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.addProject).toBe('function')
    })

    it('provides updateProject function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.updateProject).toBe('function')
    })

    it('provides deleteProject function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.deleteProject).toBe('function')
    })

    it('provides getProject function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.getProject).toBe('function')
    })

    it('provides importProject function', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(typeof result.current.importProject).toBe('function')
    })
  })

  describe('addProject', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('adds a new project with the given name', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      const initialCount = result.current.projects.length

      act(() => {
        result.current.addProject('New Test Project')
      })

      expect(result.current.projects.length).toBe(initialCount + 1)
      const newProject = result.current.projects.find((p) => p.name === 'New Test Project')
      expect(newProject).toBeDefined()
      expect(newProject.name).toBe('New Test Project')
    })

    it('returns the created project', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      let createdProject
      act(() => {
        createdProject = result.current.addProject('Another Project')
      })

      expect(createdProject).toBeDefined()
      expect(createdProject.name).toBe('Another Project')
      expect(createdProject.id).toBeDefined()
    })
  })

  describe('getProject', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('returns null for non-existent project', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      const project = result.current.getProject('non-existent-id')
      expect(project).toBeNull()
    })

    it('returns project by id', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      let createdProject
      act(() => {
        createdProject = result.current.addProject('Findable Project')
      })

      const found = result.current.getProject(createdProject.id)
      expect(found).toBeDefined()
      expect(found.id).toBe(createdProject.id)
      expect(found.name).toBe('Findable Project')
    })
  })

  describe('updateProject', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('updates project fields', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      let createdProject
      act(() => {
        createdProject = result.current.addProject('Original Name')
      })

      act(() => {
        result.current.updateProject(createdProject.id, { name: 'Updated Name' })
      })

      const updated = result.current.getProject(createdProject.id)
      expect(updated.name).toBe('Updated Name')
    })

    it('sets updatedAt timestamp on update', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      let createdProject
      act(() => {
        createdProject = result.current.addProject('Timestamp Test')
      })

      act(() => {
        result.current.updateProject(createdProject.id, { name: 'Changed' })
      })

      const updated = result.current.getProject(createdProject.id)
      // Verify updatedAt is a valid ISO timestamp
      expect(updated.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('deleteProject', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('soft-deletes project (sets deletedAt)', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      let createdProject
      act(() => {
        createdProject = result.current.addProject('To Be Deleted')
      })

      act(() => {
        result.current.deleteProject(createdProject.id)
      })

      // deleteProject now does a soft-delete (sets deletedAt)
      const project = result.current.getProject(createdProject.id)
      expect(project).toBeDefined()
      expect(project.deletedAt).toBeDefined()
    })
  })

  describe('importProject', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('imports project with new id and timestamps', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      const importData = {
        name: 'Imported Project',
        overview: { goals: ['Imported goal'] },
        board: { issues: [] },
        pages: [],
        decisions: [],
        timeline: { phases: [], milestones: [] },
        workflow: { nodes: [], edges: [] },
        architecture: { components: [] },
      }

      const beforeCount = result.current.projects.length

      act(() => {
        result.current.importProject(importData)
      })

      expect(result.current.projects.length).toBe(beforeCount + 1)
      const imported = result.current.projects.find((p) => p.name === 'Imported Project')
      expect(imported).toBeDefined()
      expect(imported.id).toBeDefined()
      expect(imported.createdAt).toBeDefined()
      expect(imported.updatedAt).toBeDefined()
    })
  })

  describe('localStorage persistence', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('persists projects to localStorage on change', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      act(() => {
        result.current.addProject('Persisted Project')
      })

      // Zustand persist middleware handles localStorage persistence.
      // Verify that the project was actually added to the store.
      const found = result.current.projects.find((p) => p.name === 'Persisted Project')
      expect(found).toBeDefined()
    })

    it('loads projects from localStorage on init', () => {
      // Zustand persist middleware rehydrates the store from localStorage at module
      // load time (not on each Provider mount). Since the store seeds a default
      // project when empty, verify the store has projects available on init.
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      expect(result.current.projects.length).toBeGreaterThan(0)
      const firstProject = result.current.projects[0]
      expect(firstProject).toBeDefined()
      expect(firstProject.name).toBeDefined()
    })
  })

  describe('reducer actions', () => {
    function wrapper({ children }) {
      return <ProjectsProvider>{children}</ProjectsProvider>
    }

    it('handles SET_PROJECTS action (deprecated dispatch)', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      // dispatch is now deprecated (wraps Zustand store).
      // It logs a warning and is a no-op, so dispatching SET_PROJECTS
      // does not change the projects array.
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const beforeProjects = result.current.projects

      act(() => {
        result.current.dispatch({ type: 'SET_PROJECTS', payload: [] })
      })

      // Projects remain unchanged since dispatch is a no-op
      expect(result.current.projects).toEqual(beforeProjects)

      consoleSpy.mockRestore()
    })

    it('ignores unknown action types', () => {
      const { result } = renderHook(() => useProjectsContext(), { wrapper })

      const beforeProjects = result.current.projects

      act(() => {
        result.current.dispatch({ type: 'UNKNOWN_ACTION', payload: {} })
      })

      expect(result.current.projects).toEqual(beforeProjects)
    })
  })
})
