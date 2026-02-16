import { describe, it, expect } from 'vitest'
import {
  createIdGenerator,
  createWorkflowPhase,
  createSprint,
  createIssue,
  createPage,
  createComponent,
} from './seedHelpers'

describe('seedHelpers utilities', () => {
  describe('createIdGenerator', () => {
    it('returns an object with get, fresh, has, and all methods', () => {
      const ids = createIdGenerator()
      expect(typeof ids.get).toBe('function')
      expect(typeof ids.fresh).toBe('function')
      expect(typeof ids.has).toBe('function')
      expect(typeof ids.all).toBe('function')
    })

    describe('get method', () => {
      it('generates a new ID for a new name', () => {
        const ids = createIdGenerator()
        const id = ids.get('test')
        expect(typeof id).toBe('string')
        expect(id.length).toBeGreaterThan(0)
      })

      it('returns the same ID for the same name', () => {
        const ids = createIdGenerator()
        const id1 = ids.get('epic1')
        const id2 = ids.get('epic1')
        expect(id1).toBe(id2)
      })

      it('returns different IDs for different names', () => {
        const ids = createIdGenerator()
        const id1 = ids.get('epic1')
        const id2 = ids.get('epic2')
        expect(id1).not.toBe(id2)
      })

      it('handles empty string name', () => {
        const ids = createIdGenerator()
        const id = ids.get('')
        expect(typeof id).toBe('string')
      })

      it('handles special characters in name', () => {
        const ids = createIdGenerator()
        const id = ids.get('test-name_123')
        expect(typeof id).toBe('string')
      })
    })

    describe('fresh method', () => {
      it('generates a new unique ID each time', () => {
        const ids = createIdGenerator()
        const id1 = ids.fresh()
        const id2 = ids.fresh()
        const id3 = ids.fresh()
        expect(id1).not.toBe(id2)
        expect(id2).not.toBe(id3)
        expect(id1).not.toBe(id3)
      })

      it('does not cache fresh IDs', () => {
        const ids = createIdGenerator()
        ids.fresh()
        ids.fresh()
        // Fresh IDs should not be in the cache
        expect(ids.all()).toEqual({})
      })
    })

    describe('has method', () => {
      it('returns false for non-existent name', () => {
        const ids = createIdGenerator()
        expect(ids.has('nonexistent')).toBe(false)
      })

      it('returns true after get is called for a name', () => {
        const ids = createIdGenerator()
        ids.get('test')
        expect(ids.has('test')).toBe(true)
      })

      it('returns false for fresh IDs (not cached)', () => {
        const ids = createIdGenerator()
        ids.fresh()
        expect(ids.has('anything')).toBe(false)
      })
    })

    describe('all method', () => {
      it('returns empty object initially', () => {
        const ids = createIdGenerator()
        expect(ids.all()).toEqual({})
      })

      it('returns all cached name-id pairs', () => {
        const ids = createIdGenerator()
        const id1 = ids.get('name1')
        const id2 = ids.get('name2')
        const all = ids.all()
        expect(all).toEqual({
          name1: id1,
          name2: id2,
        })
      })

      it('returns a plain object', () => {
        const ids = createIdGenerator()
        ids.get('test')
        const all = ids.all()
        expect(typeof all).toBe('object')
        expect(Array.isArray(all)).toBe(false)
      })
    })

    describe('separate instances', () => {
      it('different generators have separate caches', () => {
        const ids1 = createIdGenerator()
        const ids2 = createIdGenerator()
        const id1 = ids1.get('same')
        const id2 = ids2.get('same')
        expect(id1).not.toBe(id2)
      })
    })
  })

  describe('createWorkflowPhase', () => {
    it('creates a phase with required properties', () => {
      const phase = createWorkflowPhase({
        title: 'Test Phase',
        x: 100,
        y: 200,
      })
      expect(phase.title).toBe('Test Phase')
      expect(phase.x).toBe(100)
      expect(phase.y).toBe(200)
      expect(phase.type).toBe('phase')
    })

    it('generates unique ID', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
      })
      expect(typeof phase.id).toBe('string')
      expect(phase.id.length).toBeGreaterThan(0)
    })

    it('defaults status to idle', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
      })
      expect(phase.status).toBe('idle')
    })

    it('accepts custom status', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        status: 'running',
      })
      expect(phase.status).toBe('running')
    })

    it('accepts description in config', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        description: 'Test description',
      })
      expect(phase.config.description).toBe('Test description')
    })

    it('creates start and end nodes', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
      })
      const nodes = phase.children.nodes
      const startNode = nodes.find((n) => n.type === 'start')
      const endNode = nodes.find((n) => n.type === 'end')
      expect(startNode).toBeDefined()
      expect(endNode).toBeDefined()
      expect(startNode.title).toBe('Start')
      expect(endNode.title).toBe('Complete')
    })

    it('creates task nodes from tasks array', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        tasks: [{ title: 'Task 1' }, { title: 'Task 2', assignee: 'alice', notes: 'Some notes' }],
      })
      const nodes = phase.children.nodes
      const taskNodes = nodes.filter((n) => n.type === 'task')
      expect(taskNodes).toHaveLength(2)
      expect(taskNodes[0].title).toBe('Task 1')
      expect(taskNodes[1].title).toBe('Task 2')
      expect(taskNodes[1].config.assignee).toBe('alice')
      expect(taskNodes[1].config.notes).toBe('Some notes')
    })

    it('creates connections from start to tasks and tasks to end', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        tasks: [{ title: 'Task 1' }, { title: 'Task 2' }],
      })
      const connections = phase.children.connections
      // 2 from start to tasks + 2 from tasks to end = 4
      expect(connections).toHaveLength(4)
    })

    it('handles empty tasks array', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        tasks: [],
      })
      const nodes = phase.children.nodes
      expect(nodes).toHaveLength(2) // start and end only
      expect(phase.children.connections).toHaveLength(0)
    })

    it('defaults assignee to claude', () => {
      const phase = createWorkflowPhase({
        title: 'Test',
        x: 0,
        y: 0,
        tasks: [{ title: 'Task' }],
      })
      const taskNode = phase.children.nodes.find((n) => n.type === 'task')
      expect(taskNode.config.assignee).toBe('claude')
    })
  })

  describe('createSprint', () => {
    it('creates a sprint with required properties', () => {
      const sprint = createSprint({
        name: 'Sprint 1',
        goal: 'Complete feature X',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
      })
      expect(sprint.name).toBe('Sprint 1')
      expect(sprint.goal).toBe('Complete feature X')
      expect(sprint.startDate).toBe('2024-01-01')
      expect(sprint.endDate).toBe('2024-01-14')
    })

    it('generates unique ID', () => {
      const sprint = createSprint({
        name: 'Sprint',
        goal: 'Goal',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
      })
      expect(typeof sprint.id).toBe('string')
      expect(sprint.id.length).toBeGreaterThan(0)
    })

    it('defaults status to planned', () => {
      const sprint = createSprint({
        name: 'Sprint',
        goal: 'Goal',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
      })
      expect(sprint.status).toBe('planned')
    })

    it('accepts custom status', () => {
      const sprint = createSprint({
        name: 'Sprint',
        goal: 'Goal',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        status: 'active',
      })
      expect(sprint.status).toBe('active')
    })

    it('generates different IDs for different sprints', () => {
      const sprint1 = createSprint({
        name: 'Sprint 1',
        goal: 'Goal',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
      })
      const sprint2 = createSprint({
        name: 'Sprint 2',
        goal: 'Goal',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
      })
      expect(sprint1.id).not.toBe(sprint2.id)
    })
  })

  describe('createIssue', () => {
    it('creates an issue with required properties', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'story',
        title: 'Test Story',
      })
      expect(issue.key).toBe('PROJ-1')
      expect(issue.type).toBe('story')
      expect(issue.title).toBe('Test Story')
    })

    it('generates unique ID', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(typeof issue.id).toBe('string')
      expect(issue.id.length).toBeGreaterThan(0)
    })

    it('sets createdAt and updatedAt timestamps', () => {
      const before = new Date().toISOString()
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      const after = new Date().toISOString()
      expect(issue.createdAt >= before).toBe(true)
      expect(issue.createdAt <= after).toBe(true)
      expect(issue.updatedAt).toBe(issue.createdAt)
    })

    it('defaults status to backlog', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(issue.status).toBe('backlog')
    })

    it('defaults priority to medium', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(issue.priority).toBe('medium')
    })

    it('defaults epicId and sprintId to null', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(issue.epicId).toBeNull()
      expect(issue.sprintId).toBeNull()
    })

    it('defaults assignee to null', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(issue.assignee).toBeNull()
    })

    it('defaults labels, subtasks, comments, dependencies to empty arrays', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'task',
        title: 'Task',
      })
      expect(issue.labels).toEqual([])
      expect(issue.subtasks).toEqual([])
      expect(issue.comments).toEqual([])
      expect(issue.dependencies).toEqual([])
    })

    it('accepts all optional properties', () => {
      const issue = createIssue({
        key: 'PROJ-1',
        type: 'bug',
        title: 'Bug Fix',
        description: 'Fix the bug',
        status: 'in-progress',
        priority: 'high',
        storyPoints: 5,
        epicId: 'epic-123',
        sprintId: 'sprint-456',
        labels: ['critical', 'backend'],
      })
      expect(issue.description).toBe('Fix the bug')
      expect(issue.status).toBe('in-progress')
      expect(issue.priority).toBe('high')
      expect(issue.storyPoints).toBe(5)
      expect(issue.epicId).toBe('epic-123')
      expect(issue.sprintId).toBe('sprint-456')
      expect(issue.labels).toEqual(['critical', 'backend'])
    })

    it('handles different issue types', () => {
      const epic = createIssue({ key: 'E-1', type: 'epic', title: 'Epic' })
      const story = createIssue({ key: 'S-1', type: 'story', title: 'Story' })
      const task = createIssue({ key: 'T-1', type: 'task', title: 'Task' })
      const bug = createIssue({ key: 'B-1', type: 'bug', title: 'Bug' })
      const subtask = createIssue({
        key: 'ST-1',
        type: 'subtask',
        title: 'Subtask',
      })

      expect(epic.type).toBe('epic')
      expect(story.type).toBe('story')
      expect(task.type).toBe('task')
      expect(bug.type).toBe('bug')
      expect(subtask.type).toBe('subtask')
    })
  })

  describe('createPage', () => {
    it('creates a page with required properties', () => {
      const page = createPage({ title: 'Test Page' })
      expect(page.title).toBe('Test Page')
    })

    it('generates unique ID', () => {
      const page = createPage({ title: 'Page' })
      expect(typeof page.id).toBe('string')
      expect(page.id.length).toBeGreaterThan(0)
    })

    it('sets createdAt and updatedAt timestamps', () => {
      const before = new Date().toISOString()
      const page = createPage({ title: 'Page' })
      const after = new Date().toISOString()
      expect(page.createdAt >= before).toBe(true)
      expect(page.createdAt <= after).toBe(true)
      expect(page.updatedAt).toBe(page.createdAt)
    })

    it('defaults content to empty string', () => {
      const page = createPage({ title: 'Page' })
      expect(page.content).toBe('')
    })

    it('defaults parentId to null', () => {
      const page = createPage({ title: 'Page' })
      expect(page.parentId).toBeNull()
    })

    it('defaults status to published', () => {
      const page = createPage({ title: 'Page' })
      expect(page.status).toBe('published')
    })

    it('defaults icon to document emoji', () => {
      const page = createPage({ title: 'Page' })
      expect(page.icon).toBe('📄')
    })

    it('accepts all optional properties', () => {
      const page = createPage({
        title: 'Child Page',
        content: '# Hello\n\nWorld',
        parentId: 'parent-123',
        status: 'draft',
        icon: '📚',
      })
      expect(page.content).toBe('# Hello\n\nWorld')
      expect(page.parentId).toBe('parent-123')
      expect(page.status).toBe('draft')
      expect(page.icon).toBe('📚')
    })

    it('generates different IDs for different pages', () => {
      const page1 = createPage({ title: 'Page 1' })
      const page2 = createPage({ title: 'Page 2' })
      expect(page1.id).not.toBe(page2.id)
    })
  })

  describe('createComponent', () => {
    it('creates a component with required properties', () => {
      const component = createComponent({ name: 'TestComponent' })
      expect(component.name).toBe('TestComponent')
    })

    it('generates unique ID', () => {
      const component = createComponent({ name: 'Component' })
      expect(typeof component.id).toBe('string')
      expect(component.id.length).toBeGreaterThan(0)
    })

    it('defaults description to empty string', () => {
      const component = createComponent({ name: 'Component' })
      expect(component.description).toBe('')
    })

    it('defaults type to component', () => {
      const component = createComponent({ name: 'Component' })
      expect(component.type).toBe('component')
    })

    it('defaults parentId to null', () => {
      const component = createComponent({ name: 'Component' })
      expect(component.parentId).toBeNull()
    })

    it('defaults dependencies to empty array', () => {
      const component = createComponent({ name: 'Component' })
      expect(component.dependencies).toEqual([])
    })

    it('accepts all optional properties', () => {
      const component = createComponent({
        name: 'ChildComponent',
        description: 'A child component',
        type: 'service',
        parentId: 'parent-123',
        dependencies: ['dep-1', 'dep-2'],
      })
      expect(component.description).toBe('A child component')
      expect(component.type).toBe('service')
      expect(component.parentId).toBe('parent-123')
      expect(component.dependencies).toEqual(['dep-1', 'dep-2'])
    })

    it('generates different IDs for different components', () => {
      const comp1 = createComponent({ name: 'Component1' })
      const comp2 = createComponent({ name: 'Component2' })
      expect(comp1.id).not.toBe(comp2.id)
    })
  })
})
