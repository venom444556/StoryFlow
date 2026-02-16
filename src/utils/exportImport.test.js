import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  exportProjectJSON,
  exportAllProjectsJSON,
  parseProjectJSON,
  downloadJSON,
  readFileAsJSON,
} from './exportImport'

describe('exportImport utilities', () => {
  describe('exportProjectJSON', () => {
    it('returns valid JSON string', () => {
      const project = { name: 'Test Project' }
      const result = exportProjectJSON(project)
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes schema version', () => {
      const project = { name: 'Test Project' }
      const result = JSON.parse(exportProjectJSON(project))
      expect(result.schemaVersion).toBe(1)
    })

    it('includes exportedAt timestamp', () => {
      const project = { name: 'Test Project' }
      const result = JSON.parse(exportProjectJSON(project))
      expect(result.exportedAt).toBeDefined()
      expect(new Date(result.exportedAt).getTime()).not.toBeNaN()
    })

    it('includes project data', () => {
      const project = { name: 'Test Project', description: 'A test' }
      const result = JSON.parse(exportProjectJSON(project))
      expect(result.project).toEqual(project)
    })

    it('formats JSON with 2-space indentation', () => {
      const project = { name: 'Test' }
      const result = exportProjectJSON(project)
      expect(result).toContain('\n')
      expect(result).toMatch(/ {2}"schemaVersion"/)
    })

    it('handles complex nested objects', () => {
      const project = {
        name: 'Complex',
        board: {
          sprints: [{ id: '1', name: 'Sprint 1' }],
          issues: [],
        },
      }
      const result = JSON.parse(exportProjectJSON(project))
      expect(result.project.board.sprints).toHaveLength(1)
    })

    it('handles empty project', () => {
      const project = {}
      const result = JSON.parse(exportProjectJSON(project))
      expect(result.project).toEqual({})
    })
  })

  describe('exportAllProjectsJSON', () => {
    it('returns valid JSON string', () => {
      const projects = [{ name: 'Project 1' }, { name: 'Project 2' }]
      const result = exportAllProjectsJSON(projects)
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('includes schema version', () => {
      const projects = []
      const result = JSON.parse(exportAllProjectsJSON(projects))
      expect(result.schemaVersion).toBe(1)
    })

    it('includes exportedAt timestamp', () => {
      const projects = []
      const result = JSON.parse(exportAllProjectsJSON(projects))
      expect(result.exportedAt).toBeDefined()
    })

    it('includes all projects', () => {
      const projects = [{ name: 'Project 1' }, { name: 'Project 2' }, { name: 'Project 3' }]
      const result = JSON.parse(exportAllProjectsJSON(projects))
      expect(result.projects).toHaveLength(3)
      expect(result.projects[0].name).toBe('Project 1')
    })

    it('handles empty array', () => {
      const result = JSON.parse(exportAllProjectsJSON([]))
      expect(result.projects).toEqual([])
    })
  })

  describe('parseProjectJSON', () => {
    describe('single project format', () => {
      it('parses valid single project export', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          project: { name: 'Test Project' },
        })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(true)
        expect(result.project.name).toBe('Test Project')
      })

      it('fills missing fields with defaults', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { name: 'Test' },
        })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(true)
        expect(result.project.description).toBe('')
        expect(result.project.status).toBe('planning')
        expect(result.project.techStack).toEqual([])
        expect(result.project.board).toBeDefined()
        expect(result.project.pages).toEqual([])
      })

      it('fills board sub-fields with defaults', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { name: 'Test', board: {} },
        })
        const result = parseProjectJSON(json)
        expect(result.project.board.sprints).toEqual([])
        expect(result.project.board.issues).toEqual([])
        expect(result.project.board.nextIssueNumber).toBe(1)
      })

      it('preserves existing values when filling defaults', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { name: 'Test', description: 'Custom description' },
        })
        const result = parseProjectJSON(json)
        expect(result.project.description).toBe('Custom description')
      })
    })

    describe('multi-project format', () => {
      it('parses valid multi-project export', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          projects: [{ name: 'Project 1' }, { name: 'Project 2' }],
        })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(true)
        expect(result.projects).toHaveLength(2)
      })

      it('fills defaults for all projects', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          projects: [{ name: 'Project 1' }],
        })
        const result = parseProjectJSON(json)
        expect(result.projects[0].board).toBeDefined()
        expect(result.projects[0].pages).toEqual([])
      })
    })

    describe('bare project format', () => {
      it('parses bare project object (no wrapper)', () => {
        const json = JSON.stringify({ name: 'Bare Project' })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(true)
        expect(result.project.name).toBe('Bare Project')
      })

      it('fills defaults for bare project', () => {
        const json = JSON.stringify({ name: 'Bare' })
        const result = parseProjectJSON(json)
        expect(result.project.board).toBeDefined()
      })
    })

    describe('error handling', () => {
      it('returns error for invalid JSON', () => {
        const result = parseProjectJSON('not valid json')
        expect(result.success).toBe(false)
        expect(result.error).toContain('Invalid JSON')
      })

      it('returns error for unsupported schema version', () => {
        const json = JSON.stringify({
          schemaVersion: 999,
          project: { name: 'Test' },
        })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Unsupported schema version')
      })

      it('returns error for missing required fields', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { description: 'No name field' },
        })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Missing required fields')
        expect(result.error).toContain('name')
      })

      it('returns error for unrecognised format', () => {
        const json = JSON.stringify({ random: 'data' })
        const result = parseProjectJSON(json)
        expect(result.success).toBe(false)
        expect(result.error).toContain('Unrecognised file format')
      })

      it('returns error for empty object', () => {
        const json = JSON.stringify({})
        const result = parseProjectJSON(json)
        expect(result.success).toBe(false)
      })
    })

    describe('security', () => {
      it('strips __proto__ from parsed data', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { name: 'Test', __proto__: { polluted: true } },
        })
        const result = parseProjectJSON(json)
        expect(result.project).not.toHaveProperty('__proto__')
      })

      it('strips constructor from parsed data', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: { name: 'Test', constructor: 'bad' },
        })
        const result = parseProjectJSON(json)
        // Note: constructor is a special property, but the sanitizer removes it
        expect(Object.prototype.hasOwnProperty.call(result.project, 'constructor')).toBe(false)
      })

      it('strips dangerous keys from nested objects', () => {
        const json = JSON.stringify({
          schemaVersion: 1,
          project: {
            name: 'Test',
            board: { __proto__: 'bad', issues: [] },
          },
        })
        const result = parseProjectJSON(json)
        expect(result.project.board).not.toHaveProperty('__proto__')
      })
    })
  })

  describe('downloadJSON', () => {
    let mockCreateObjectURL
    let mockRevokeObjectURL
    let mockAppendChild
    let mockRemoveChild
    let mockClick
    let mockAnchor

    beforeEach(() => {
      mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
      mockRevokeObjectURL = vi.fn()
      mockClick = vi.fn()
      mockAppendChild = vi.fn()
      mockRemoveChild = vi.fn()
      mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      }

      globalThis.URL.createObjectURL = mockCreateObjectURL
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL
      globalThis.document.createElement = vi.fn(() => mockAnchor)
      globalThis.document.body.appendChild = mockAppendChild
      globalThis.document.body.removeChild = mockRemoveChild
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('creates a blob with JSON content', () => {
      downloadJSON('{"test": true}', 'test.json')
      expect(mockCreateObjectURL).toHaveBeenCalled()
      const blobArg = mockCreateObjectURL.mock.calls[0][0]
      expect(blobArg).toBeInstanceOf(Blob)
    })

    it('sets correct filename', () => {
      downloadJSON('{}', 'my-project.json')
      expect(mockAnchor.download).toBe('my-project.json')
    })

    it('clicks the anchor to trigger download', () => {
      downloadJSON('{}', 'test.json')
      expect(mockClick).toHaveBeenCalled()
    })

    it('cleans up DOM and blob URL', () => {
      downloadJSON('{}', 'test.json')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })

  describe('readFileAsJSON', () => {
    it('reads file content as text', async () => {
      const fileContent = '{"name": "test"}'
      const mockFile = new Blob([fileContent], { type: 'application/json' })

      const result = await readFileAsJSON(mockFile)
      expect(result).toBe(fileContent)
    })

    it('rejects on read error', async () => {
      const mockFile = {
        // Create a mock file that will cause FileReader to error
      }

      // Mock FileReader to simulate error
      const originalFileReader = globalThis.FileReader
      globalThis.FileReader = class {
        constructor() {
          this.onerror = null
          this.onload = null
        }
        readAsText() {
          setTimeout(() => this.onerror(new Error('Read failed')), 0)
        }
      }

      await expect(readFileAsJSON(mockFile)).rejects.toThrow('Failed to read file')

      globalThis.FileReader = originalFileReader
    })

    it('handles empty file', async () => {
      const mockFile = new Blob([''], { type: 'application/json' })
      const result = await readFileAsJSON(mockFile)
      expect(result).toBe('')
    })

    it('handles large content', async () => {
      const largeContent = 'x'.repeat(100000)
      const mockFile = new Blob([largeContent], { type: 'text/plain' })
      const result = await readFileAsJSON(mockFile)
      expect(result).toBe(largeContent)
    })
  })
})
