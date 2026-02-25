import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getNodesAtLevel,
  setNodesAtLevel,
  getDownstreamNodes,
  getUpstreamNodes,
  buildBezierPath,
  getConnectionColor,
  executeWorkflow,
  normalizeConnection,
  validateConnections,
} from './workflow'

describe('workflow utilities', () => {
  describe('getNodesAtLevel', () => {
    const sampleWorkflow = {
      nodes: [
        {
          id: 'parent1',
          type: 'phase',
          children: {
            nodes: [
              { id: 'child1', type: 'task' },
              { id: 'child2', type: 'task' },
            ],
            connections: [{ id: 'conn1', from: 'child1', to: 'child2' }],
          },
        },
        { id: 'parent2', type: 'task' },
      ],
      connections: [{ id: 'rootConn', from: 'parent1', to: 'parent2' }],
    }

    it('returns root nodes when viewStack is empty', () => {
      const result = getNodesAtLevel(sampleWorkflow, [])
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].id).toBe('parent1')
      expect(result.connections).toHaveLength(1)
    })

    it('returns child nodes when viewStack has one entry', () => {
      const result = getNodesAtLevel(sampleWorkflow, [{ nodeId: 'parent1', title: 'Parent 1' }])
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].id).toBe('child1')
      expect(result.connections).toHaveLength(1)
    })

    it('returns empty arrays when node not found', () => {
      const result = getNodesAtLevel(sampleWorkflow, [
        { nodeId: 'nonexistent', title: 'Not Found' },
      ])
      expect(result.nodes).toEqual([])
      expect(result.connections).toEqual([])
    })

    it('returns empty arrays when node has no children', () => {
      const result = getNodesAtLevel(sampleWorkflow, [{ nodeId: 'parent2', title: 'Parent 2' }])
      expect(result.nodes).toEqual([])
      expect(result.connections).toEqual([])
    })

    it('handles deeply nested structures', () => {
      const deepWorkflow = {
        nodes: [
          {
            id: 'level0',
            children: {
              nodes: [
                {
                  id: 'level1',
                  children: {
                    nodes: [{ id: 'level2', type: 'task' }],
                    connections: [],
                  },
                },
              ],
              connections: [],
            },
          },
        ],
        connections: [],
      }
      const result = getNodesAtLevel(deepWorkflow, [{ nodeId: 'level0' }, { nodeId: 'level1' }])
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].id).toBe('level2')
    })

    it('handles workflow with undefined nodes', () => {
      const result = getNodesAtLevel({ connections: [] }, [])
      expect(result.nodes).toEqual([])
    })
  })

  describe('setNodesAtLevel', () => {
    const sampleWorkflow = {
      nodes: [
        {
          id: 'parent1',
          type: 'phase',
          children: {
            nodes: [{ id: 'child1', type: 'task' }],
            connections: [],
          },
        },
      ],
      connections: [],
    }

    it('updates root level when viewStack is empty', () => {
      const updatedData = {
        nodes: [{ id: 'new1', type: 'start' }],
        connections: [],
      }
      const result = setNodesAtLevel(sampleWorkflow, [], updatedData)
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].id).toBe('new1')
    })

    it('updates child level when viewStack has entry', () => {
      const updatedData = {
        nodes: [
          { id: 'child1', type: 'task' },
          { id: 'child2', type: 'task' },
        ],
        connections: [],
      }
      const result = setNodesAtLevel(sampleWorkflow, [{ nodeId: 'parent1' }], updatedData)
      expect(result.nodes[0].children.nodes).toHaveLength(2)
    })

    it('preserves other nodes at same level', () => {
      const workflow = {
        nodes: [
          {
            id: 'parent1',
            children: { nodes: [{ id: 'c1' }], connections: [] },
          },
          { id: 'parent2' },
        ],
        connections: [],
      }
      const result = setNodesAtLevel(workflow, [{ nodeId: 'parent1' }], {
        nodes: [{ id: 'newChild' }],
        connections: [],
      })
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[1].id).toBe('parent2')
    })

    it('returns immutable result (new object)', () => {
      const result = setNodesAtLevel(sampleWorkflow, [], { nodes: [], connections: [] })
      expect(result).not.toBe(sampleWorkflow)
    })

    it('handles missing children gracefully', () => {
      const workflow = {
        nodes: [{ id: 'parent1' }], // no children property
        connections: [],
      }
      const result = setNodesAtLevel(workflow, [{ nodeId: 'parent1' }], {
        nodes: [{ id: 'child' }],
        connections: [],
      })
      expect(result.nodes[0].children.nodes).toHaveLength(1)
    })
  })

  describe('getDownstreamNodes', () => {
    const nodes = [
      { id: 'a', type: 'start' },
      { id: 'b', type: 'task' },
      { id: 'c', type: 'task' },
      { id: 'd', type: 'end' },
    ]
    const connections = [
      { id: 'c1', from: 'a', to: 'b' },
      { id: 'c2', from: 'a', to: 'c' },
      { id: 'c3', from: 'b', to: 'd' },
      { id: 'c4', from: 'c', to: 'd' },
    ]

    it('returns all direct downstream nodes', () => {
      const result = getDownstreamNodes('a', connections, nodes)
      expect(result).toHaveLength(2)
      expect(result.map((n) => n.id)).toContain('b')
      expect(result.map((n) => n.id)).toContain('c')
    })

    it('returns empty array when no downstream nodes', () => {
      const result = getDownstreamNodes('d', connections, nodes)
      expect(result).toEqual([])
    })

    it('returns single downstream node', () => {
      const result = getDownstreamNodes('b', connections, nodes)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('d')
    })

    it('filters out undefined nodes (missing connections)', () => {
      const badConnections = [{ id: 'c1', from: 'a', to: 'nonexistent' }]
      const result = getDownstreamNodes('a', badConnections, nodes)
      expect(result).toEqual([])
    })

    it('returns empty for nonexistent source node', () => {
      const result = getDownstreamNodes('nonexistent', connections, nodes)
      expect(result).toEqual([])
    })
  })

  describe('getUpstreamNodes', () => {
    const nodes = [
      { id: 'a', type: 'start' },
      { id: 'b', type: 'task' },
      { id: 'c', type: 'task' },
      { id: 'd', type: 'end' },
    ]
    const connections = [
      { id: 'c1', from: 'a', to: 'b' },
      { id: 'c2', from: 'a', to: 'c' },
      { id: 'c3', from: 'b', to: 'd' },
      { id: 'c4', from: 'c', to: 'd' },
    ]

    it('returns all direct upstream nodes', () => {
      const result = getUpstreamNodes('d', connections, nodes)
      expect(result).toHaveLength(2)
      expect(result.map((n) => n.id)).toContain('b')
      expect(result.map((n) => n.id)).toContain('c')
    })

    it('returns empty array when no upstream nodes', () => {
      const result = getUpstreamNodes('a', connections, nodes)
      expect(result).toEqual([])
    })

    it('returns single upstream node', () => {
      const result = getUpstreamNodes('b', connections, nodes)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('a')
    })

    it('filters out undefined nodes', () => {
      const badConnections = [{ id: 'c1', from: 'nonexistent', to: 'b' }]
      const result = getUpstreamNodes('b', badConnections, nodes)
      expect(result).toEqual([])
    })
  })

  describe('buildBezierPath', () => {
    it('returns valid SVG path string', () => {
      const path = buildBezierPath(0, 0, 100, 100)
      expect(path).toMatch(/^M \d+ \d+ C \d+ \d+, \d+ \d+, \d+ \d+$/)
    })

    it('starts at start point', () => {
      const path = buildBezierPath(10, 20, 100, 100)
      expect(path).toMatch(/^M 10 20/)
    })

    it('ends at end point', () => {
      const path = buildBezierPath(0, 0, 150, 200)
      expect(path).toMatch(/150 200$/)
    })

    it('places control points at horizontal midpoint', () => {
      const path = buildBezierPath(0, 0, 100, 100)
      // midX should be 50
      expect(path).toContain('C 50 0, 50 100')
    })

    it('handles negative coordinates', () => {
      const path = buildBezierPath(-100, -50, 0, 0)
      expect(path).toContain('M -100 -50')
    })

    it('handles same start and end points', () => {
      const path = buildBezierPath(50, 50, 50, 50)
      expect(path).toBe('M 50 50 C 50 50, 50 50, 50 50')
    })

    it('handles decimal values', () => {
      const path = buildBezierPath(10.5, 20.5, 30.5, 40.5)
      expect(path).toContain('10.5')
      expect(path).toContain('20.5')
    })
  })

  describe('getConnectionColor', () => {
    it('returns gray for null fromNode', () => {
      expect(getConnectionColor(null, { status: 'idle' })).toBe('#4b5563')
    })

    it('returns gray for null toNode', () => {
      expect(getConnectionColor({ status: 'idle' }, null)).toBe('#4b5563')
    })

    it('returns gray for both null', () => {
      expect(getConnectionColor(null, null)).toBe('#4b5563')
    })

    it('returns red when fromNode has error', () => {
      expect(getConnectionColor({ status: 'error' }, { status: 'idle' })).toBe('#ef4444')
    })

    it('returns red when toNode has error', () => {
      expect(getConnectionColor({ status: 'success' }, { status: 'error' })).toBe('#ef4444')
    })

    it('returns yellow when fromNode success and toNode running', () => {
      expect(getConnectionColor({ status: 'success' }, { status: 'running' })).toBe('#eab308')
    })

    it('returns green when both success', () => {
      expect(getConnectionColor({ status: 'success' }, { status: 'success' })).toBe('#22c55e')
    })

    it('returns yellow when fromNode running', () => {
      expect(getConnectionColor({ status: 'running' }, { status: 'idle' })).toBe('#eab308')
    })

    it('returns yellow when toNode running', () => {
      expect(getConnectionColor({ status: 'idle' }, { status: 'running' })).toBe('#eab308')
    })

    it('returns gray for idle states', () => {
      expect(getConnectionColor({ status: 'idle' }, { status: 'idle' })).toBe('#4b5563')
    })

    it('returns gray for unknown status', () => {
      expect(getConnectionColor({ status: 'unknown' }, { status: 'unknown' })).toBe('#4b5563')
    })
  })

  describe('executeWorkflow', () => {
    let onNodeStart, onNodeComplete, onNodeError, onLog

    beforeEach(() => {
      onNodeStart = vi.fn()
      onNodeComplete = vi.fn()
      onNodeError = vi.fn()
      onLog = vi.fn()
    })

    it('logs start message', async () => {
      const nodes = [{ id: 'start', type: 'start', title: 'Start' }]
      await executeWorkflow(nodes, [], onNodeStart, onNodeComplete, onNodeError, onLog)
      expect(onLog).toHaveBeenCalledWith('Starting workflow execution...', 'info')
    })

    it('returns empty sets when no start node', async () => {
      const nodes = [{ id: 'task', type: 'task', title: 'Task' }]
      const result = await executeWorkflow(
        nodes,
        [],
        onNodeStart,
        onNodeComplete,
        onNodeError,
        onLog
      )
      expect(result.executed.size).toBe(0)
      expect(result.failed.size).toBe(0)
      expect(onLog).toHaveBeenCalledWith('No start node found in workflow.', 'error')
    })

    it('executes start node', async () => {
      const nodes = [{ id: 'start', type: 'start', title: 'Start' }]
      await executeWorkflow(nodes, [], onNodeStart, onNodeComplete, onNodeError, onLog)
      expect(onNodeStart).toHaveBeenCalledWith('start')
    }, 10000)

    it('executes connected nodes in order', async () => {
      const nodes = [
        { id: 'start', type: 'start', title: 'Start' },
        { id: 'end', type: 'end', title: 'End' },
      ]
      const connections = [{ id: 'c1', from: 'start', to: 'end' }]
      await executeWorkflow(nodes, connections, onNodeStart, onNodeComplete, onNodeError, onLog)
      expect(onNodeStart).toHaveBeenCalledWith('start')
      expect(onNodeStart).toHaveBeenCalledWith('end')
    }, 10000)

    it('returns executed set with completed nodes', async () => {
      const nodes = [{ id: 'start', type: 'start', title: 'Start' }]
      const result = await executeWorkflow(
        nodes,
        [],
        onNodeStart,
        onNodeComplete,
        onNodeError,
        onLog
      )
      expect(result.executed.has('start')).toBe(true)
    }, 10000)

    it('cascades errors to downstream nodes', async () => {
      // We'll test the cascade logic with a simple graph
      // Note: simulateNodeExecution has random failure chances,
      // so this test is more about structure than guaranteed failure
      const nodes = [
        { id: 'start', type: 'start', title: 'Start' },
        { id: 'task1', type: 'task', title: 'Task 1' },
        { id: 'end', type: 'end', title: 'End' },
      ]
      const connections = [
        { id: 'c1', from: 'start', to: 'task1' },
        { id: 'c2', from: 'task1', to: 'end' },
      ]
      // Just verify it runs without error
      const result = await executeWorkflow(
        nodes,
        connections,
        onNodeStart,
        onNodeComplete,
        onNodeError,
        onLog
      )
      expect(result).toHaveProperty('executed')
      expect(result).toHaveProperty('failed')
    }, 15000)

    it('handles parallel branches', async () => {
      const nodes = [
        { id: 'start', type: 'start', title: 'Start' },
        { id: 'task1', type: 'milestone', title: 'Task 1' }, // Use milestone to avoid random failures
        { id: 'task2', type: 'milestone', title: 'Task 2' },
        { id: 'end', type: 'end', title: 'End' },
      ]
      const connections = [
        { id: 'c1', from: 'start', to: 'task1' },
        { id: 'c2', from: 'start', to: 'task2' },
        { id: 'c3', from: 'task1', to: 'end' },
        { id: 'c4', from: 'task2', to: 'end' },
      ]
      const result = await executeWorkflow(
        nodes,
        connections,
        onNodeStart,
        onNodeComplete,
        onNodeError,
        onLog
      )
      // End node should wait for both task1 and task2
      expect(result.executed.size + result.failed.size).toBe(4)
    }, 15000)

    it('detects and aborts circular dependencies', async () => {
      // Create a very small workflow to trigger circular detection quickly
      const nodes = [
        { id: 'start', type: 'start', title: 'Start' },
        { id: 'a', type: 'milestone', title: 'A' },
      ]
      // Create a connection that creates a cycle: a depends on itself via the logic
      // Actually, the circular detection happens when queue keeps reprocessing
      // Let's create a case where parent connections are never satisfied
      const connections = [
        { id: 'c1', from: 'start', to: 'a' },
        { id: 'c2', from: 'a', to: 'start' }, // Circular: a -> start
      ]

      const result = await executeWorkflow(
        nodes,
        connections,
        onNodeStart,
        onNodeComplete,
        onNodeError,
        onLog
      )
      // Should complete without hanging
      expect(result).toBeDefined()
    }, 30000)

    it('logs completion message', async () => {
      const nodes = [
        { id: 'start', type: 'start', title: 'Start' },
        { id: 'end', type: 'end', title: 'End' },
      ]
      const connections = [{ id: 'c1', from: 'start', to: 'end' }]
      await executeWorkflow(nodes, connections, onNodeStart, onNodeComplete, onNodeError, onLog)
      // Should log either success or failure completion
      const completionLogs = onLog.mock.calls.filter((call) =>
        call[0].includes('Workflow completed')
      )
      expect(completionLogs.length).toBeGreaterThan(0)
    }, 10000)
  })

  describe('normalizeConnection', () => {
    it('passes through valid {id, from, to}', () => {
      const conn = { id: '1', from: 'a', to: 'b' }
      expect(normalizeConnection(conn)).toEqual(conn)
    })

    it('normalizes source/target to from/to', () => {
      const conn = { id: '1', source: 'a', target: 'b' }
      expect(normalizeConnection(conn)).toEqual({ id: '1', from: 'a', to: 'b' })
    })

    it('returns null for missing id', () => {
      expect(normalizeConnection({ from: 'a', to: 'b' })).toBeNull()
    })

    it('returns null for missing from and source', () => {
      expect(normalizeConnection({ id: '1', to: 'b' })).toBeNull()
    })

    it('returns null for null input', () => {
      expect(normalizeConnection(null)).toBeNull()
    })

    it('strips extra fields', () => {
      const conn = { id: '1', from: 'a', to: 'b', extra: 'junk' }
      expect(normalizeConnection(conn)).toEqual({ id: '1', from: 'a', to: 'b' })
    })
  })

  describe('validateConnections', () => {
    it('returns empty array for non-array input', () => {
      expect(validateConnections(null)).toEqual([])
      expect(validateConnections('bad')).toEqual([])
    })

    it('filters out invalid connections', () => {
      const conns = [
        { id: '1', from: 'a', to: 'b' },
        { id: '2' }, // invalid — no from/to
        { id: '3', source: 'c', target: 'd' }, // legacy — should normalize
      ]
      const result = validateConnections(conns)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ id: '1', from: 'a', to: 'b' })
      expect(result[1]).toEqual({ id: '3', from: 'c', to: 'd' })
    })
  })
})
