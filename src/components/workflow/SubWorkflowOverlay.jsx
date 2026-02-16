import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronRight, Home } from 'lucide-react'
import { generateId } from '../../utils/ids'
import { getNodesAtLevel, setNodesAtLevel } from '../../utils/workflow'
import { getNodeType } from '../../data/nodeTypes'
import WorkflowToolbar from './WorkflowToolbar'
import WorkflowCanvas from './WorkflowCanvas'
import NodeDetailModal from './NodeDetailModal'

// ---------------------------------------------------------------------------
// SubWorkflowOverlay
// ---------------------------------------------------------------------------
// Large overlay popup that shows a sub-workflow (children of a parent node).
// Supports full node CRUD, drag, connections, and nested drill-down via
// an internal view stack.
// ---------------------------------------------------------------------------

function OverlayBreadcrumb({ parentTitle, viewStack, onNavigate }) {
  if (viewStack.length === 0) return null

  return (
    <div
      className="flex items-center gap-1 border-b border-[var(--color-bg-glass)] px-4 py-1.5 text-xs backdrop-blur-md"
      style={{ backgroundColor: 'var(--th-panel-medium)' }}
    >
      <button
        onClick={() => onNavigate(-1)}
        className="flex items-center gap-1 rounded-md px-2 py-0.5 font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
      >
        <Home size={11} />
        <span>{parentTitle}</span>
      </button>

      {viewStack.map((entry, index) => (
        <React.Fragment key={entry.nodeId}>
          <ChevronRight size={11} className="text-[var(--color-fg-subtle)]" />
          <button
            onClick={() => onNavigate(index)}
            className={[
              'rounded-md px-2 py-0.5 font-medium transition-colors',
              index === viewStack.length - 1
                ? 'text-[var(--color-fg-default)]'
                : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]',
            ].join(' ')}
          >
            {entry.title}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

export default function SubWorkflowOverlay({
  isOpen,
  onClose,
  parentNode,
  childrenData,
  onUpdateChildren,
}) {
  // ------ Internal drill-down view stack ------
  const [viewStack, setViewStack] = useState([])

  // ------ UI state ------
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [detailNodeId, setDetailNodeId] = useState(null)

  // Reset state when overlay opens/closes or parent changes
  useEffect(() => {
    if (isOpen) {
      setViewStack([])
      setSelectedNodeId(null)
      setDetailNodeId(null)
    }
  }, [isOpen, parentNode?.id])

  // Reset selection when navigating levels
  useEffect(() => {
    setSelectedNodeId(null)
    setDetailNodeId(null)
  }, [viewStack])

  // ------ Derived data at current level ------
  const { nodes, connections } = useMemo(
    () => getNodesAtLevel(childrenData || { nodes: [], connections: [] }, viewStack),
    [childrenData, viewStack]
  )

  const detailNode = nodes.find((n) => n.id === detailNodeId) || null

  // ------ Persist changes at current level ------
  const saveNodes = useCallback(
    (updatedNodes) => {
      const newData = setNodesAtLevel(childrenData || { nodes: [], connections: [] }, viewStack, {
        nodes: updatedNodes,
        connections,
      })
      onUpdateChildren(newData)
    },
    [childrenData, viewStack, connections, onUpdateChildren]
  )

  const saveConnections = useCallback(
    (updatedConnections) => {
      const newData = setNodesAtLevel(childrenData || { nodes: [], connections: [] }, viewStack, {
        nodes,
        connections: updatedConnections,
      })
      onUpdateChildren(newData)
    },
    [childrenData, viewStack, nodes, onUpdateChildren]
  )

  const saveBoth = useCallback(
    (updatedNodes, updatedConnections) => {
      const newData = setNodesAtLevel(childrenData || { nodes: [], connections: [] }, viewStack, {
        nodes: updatedNodes,
        connections: updatedConnections,
      })
      onUpdateChildren(newData)
    },
    [childrenData, viewStack, onUpdateChildren]
  )

  // ------ Node CRUD ------

  const handleAddNode = useCallback(
    (typeDef) => {
      const newNode = {
        id: generateId(),
        type: typeDef.type,
        title: typeDef.label,
        x: 200 + Math.random() * 300,
        y: 150 + Math.random() * 200,
        status: 'idle',
        config: {},
        description: '',
        error: null,
      }
      saveNodes([...nodes, newNode])
      setSelectedNodeId(newNode.id)
    },
    [nodes, saveNodes]
  )

  const handleUpdateNode = useCallback(
    (nodeId, updates) => {
      const updatedNodes = nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      saveNodes(updatedNodes)
    },
    [nodes, saveNodes]
  )

  const handleDeleteNode = useCallback(
    (nodeId) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId)
      const updatedConns = connections.filter((c) => c.from !== nodeId && c.to !== nodeId)
      saveBoth(updatedNodes, updatedConns)
      if (selectedNodeId === nodeId) setSelectedNodeId(null)
      if (detailNodeId === nodeId) setDetailNodeId(null)
    },
    [nodes, connections, saveBoth, selectedNodeId, detailNodeId]
  )

  // ------ Add sub-workflow to a node ------
  const handleAddChildren = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node || node.children?.nodes?.length) return

      const startId = generateId()
      const endId = generateId()
      const updatedNodes = nodes.map((n) => {
        if (n.id !== nodeId) return n
        return {
          ...n,
          children: {
            nodes: [
              {
                id: startId,
                type: 'start',
                title: 'Start',
                x: 100,
                y: 200,
                status: 'idle',
                config: {},
                description: '',
                error: null,
              },
              {
                id: endId,
                type: 'end',
                title: 'End',
                x: 500,
                y: 200,
                status: 'idle',
                config: {},
                description: '',
                error: null,
              },
            ],
            connections: [{ id: generateId(), from: startId, to: endId }],
          },
        }
      })
      saveNodes(updatedNodes)
      // Auto drill-down into the new sub-workflow
      setViewStack((prev) => [...prev, { nodeId, title: node.title }])
    },
    [nodes, saveNodes]
  )

  // ------ Drill-down navigation ------

  const handleDrillDown = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node?.children?.nodes?.length) return
      setViewStack((prev) => [...prev, { nodeId, title: node.title }])
    },
    [nodes]
  )

  const handleNavigateUp = useCallback((toIndex) => {
    if (toIndex < 0) {
      setViewStack([])
    } else {
      setViewStack((prev) => prev.slice(0, toIndex + 1))
    }
  }, [])

  // ------ Keyboard: Escape to close ------
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // If detail modal is open, let it handle Escape first
        if (detailNodeId) {
          setDetailNodeId(null)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, detailNodeId, onClose])

  // Get parent node type info for the header
  const parentType = parentNode ? getNodeType(parentNode.type) : null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 'var(--z-drawer, 400)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Overlay panel */}
          <motion.div
            className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-default)] shadow-2xl"
            style={{
              width: '85vw',
              height: '85vh',
              backgroundColor: 'var(--th-panel-solid)',
            }}
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-default)] px-5 py-3">
              <div className="flex items-center gap-3">
                {parentType && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: parentType.color }}
                  />
                )}
                <h2 className="text-base font-semibold text-[var(--color-fg-default)]">
                  {parentNode?.title || 'Sub-Workflow'}
                </h2>
                <span className="rounded-full bg-[var(--color-bg-glass)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--color-fg-muted)]">
                  Sub-workflow
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mini toolbar */}
            <WorkflowToolbar
              onAddNode={handleAddNode}
              hideExecution
              nodeCount={nodes.length}
              connectionCount={connections.length}
            />

            {/* Internal breadcrumb (when drilled deeper inside overlay) */}
            <OverlayBreadcrumb
              parentTitle={parentNode?.title || 'Root'}
              viewStack={viewStack}
              onNavigate={handleNavigateUp}
            />

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden">
              {/* Canvas */}
              <WorkflowCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                onSaveNodes={saveNodes}
                onSaveConnections={saveConnections}
                onSaveBoth={saveBoth}
                onSelectNode={setSelectedNodeId}
                onDrillDown={handleDrillDown}
                onNodeDoubleClick={setDetailNodeId}
                onAddChildren={handleAddChildren}
                canvasId={`sub-workflow-${parentNode?.id || 'root'}${viewStack.length > 0 ? '-' + viewStack.map((v) => v.nodeId).join('-') : ''}`}
              />
            </div>

            {/* Detail modal (renders above overlay via z-50) */}
            <NodeDetailModal
              node={detailNode}
              isOpen={!!detailNode}
              onClose={() => setDetailNodeId(null)}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
