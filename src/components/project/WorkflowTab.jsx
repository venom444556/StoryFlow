import React, { useState, useCallback, useMemo } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { generateId } from '../../utils/ids';
import { executeWorkflow } from '../../utils/workflow';

import WorkflowToolbar from '../workflow/WorkflowToolbar';
import WorkflowCanvas from '../workflow/WorkflowCanvas';
import NodeDetailModal from '../workflow/NodeDetailModal';
import ExecutionLog from '../workflow/ExecutionLog';
import SubWorkflowOverlay from '../workflow/SubWorkflowOverlay';

// ---------------------------------------------------------------------------
// WorkflowTab
// ---------------------------------------------------------------------------

export default function WorkflowTab({ project, onUpdate }) {
  // ------ Root-level workflow data ------
  const workflow = project?.workflow ?? { nodes: [], connections: [] };
  const nodes = workflow.nodes ?? [];
  const connections = workflow.connections ?? [];

  // ------ Local UI state ------
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [logPanelOpen, setLogPanelOpen] = useState(false);

  // Detail modal state
  const [detailNodeId, setDetailNodeId] = useState(null);

  // Sub-workflow overlay state
  const [subWorkflowTargetId, setSubWorkflowTargetId] = useState(null);

  // ------ Derived references ------
  const detailNode = nodes.find((n) => n.id === detailNodeId) || null;
  const subWorkflowNode = subWorkflowTargetId
    ? nodes.find((n) => n.id === subWorkflowTargetId)
    : null;

  // ------ Helpers to persist changes ------
  const saveNodes = useCallback(
    (updatedNodes) => {
      onUpdate?.({ ...workflow, nodes: updatedNodes });
    },
    [onUpdate, workflow]
  );

  const saveConnections = useCallback(
    (updatedConnections) => {
      onUpdate?.({ ...workflow, connections: updatedConnections });
    },
    [onUpdate, workflow]
  );

  const saveBoth = useCallback(
    (updatedNodes, updatedConnections) => {
      onUpdate?.({ ...workflow, nodes: updatedNodes, connections: updatedConnections });
    },
    [onUpdate, workflow]
  );

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
      };
      saveNodes([...nodes, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [nodes, saveNodes]
  );

  const handleUpdateNode = useCallback(
    (nodeId, updates) => {
      const updatedNodes = nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      );
      saveNodes(updatedNodes);
    },
    [nodes, saveNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);
      const updatedConns = connections.filter(
        (c) => c.from !== nodeId && c.to !== nodeId
      );
      saveBoth(updatedNodes, updatedConns);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      if (detailNodeId === nodeId) setDetailNodeId(null);
    },
    [nodes, connections, saveBoth, selectedNodeId, detailNodeId]
  );

  // ------ Add sub-workflow to a node ------

  const handleAddChildren = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || node.children?.nodes?.length) return;

      const startId = generateId();
      const endId = generateId();
      const updatedNodes = nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          children: {
            nodes: [
              { id: startId, type: 'start', title: 'Start', x: 100, y: 200, status: 'idle', config: {}, description: '', error: null },
              { id: endId, type: 'end', title: 'End', x: 500, y: 200, status: 'idle', config: {}, description: '', error: null },
            ],
            connections: [
              { id: generateId(), from: startId, to: endId },
            ],
          },
        };
      });
      saveNodes(updatedNodes);
      // Auto open the sub-workflow overlay
      setSubWorkflowTargetId(nodeId);
    },
    [nodes, saveNodes]
  );

  // ------ Drill-down → open overlay ------

  const handleDrillDown = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node?.children?.nodes?.length) return;
      setSubWorkflowTargetId(nodeId);
    },
    [nodes]
  );

  // ------ Update children data from overlay ------

  const handleUpdateChildren = useCallback(
    (updatedChildrenData) => {
      if (!subWorkflowTargetId) return;
      const updatedNodes = nodes.map((n) =>
        n.id === subWorkflowTargetId ? { ...n, children: updatedChildrenData } : n
      );
      saveNodes(updatedNodes);
    },
    [subWorkflowTargetId, nodes, saveNodes]
  );

  // ------ Execution ------

  const handleExecute = useCallback(async () => {
    if (isExecuting || nodes.length === 0) return;
    setIsExecuting(true);
    setExecutionLog([]);

    const resetNodes = nodes.map((n) => ({ ...n, status: 'idle', error: null }));
    saveNodes(resetNodes);

    // Mutable working copy — separate from React state to avoid
    // "Cannot assign to read only property" on frozen state objects.
    const workingNodes = resetNodes.map((n) => ({ ...n }));

    const addLog = (message, level) => {
      setExecutionLog((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          message,
          level,
        },
      ]);
    };

    const onNodeStart = (nodeId) => {
      const wn = workingNodes.find((n) => n.id === nodeId);
      if (wn) {
        wn.status = 'running';
        wn.error = null;
      }
      saveNodes(workingNodes.map((n) => ({ ...n })));
    };

    const onNodeComplete = (nodeId, _result) => {
      const wn = workingNodes.find((n) => n.id === nodeId);
      if (wn) {
        wn.status = 'success';
        wn.error = null;
      }
      saveNodes(workingNodes.map((n) => ({ ...n })));
    };

    const onNodeError = (nodeId, errorMsg) => {
      const wn = workingNodes.find((n) => n.id === nodeId);
      if (wn) {
        wn.status = 'error';
        wn.error = errorMsg;
      }
      saveNodes(workingNodes.map((n) => ({ ...n })));
    };

    try {
      await executeWorkflow(
        workingNodes,
        connections,
        onNodeStart,
        onNodeComplete,
        onNodeError,
        addLog
      );
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, nodes, connections, saveNodes]);

  const handleReset = useCallback(() => {
    if (isExecuting) return;
    const resetNodes = nodes.map((n) => ({ ...n, status: 'idle', error: null }));
    saveNodes(resetNodes);
    setExecutionLog([]);
  }, [isExecuting, nodes, saveNodes]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <WorkflowToolbar
        onAddNode={handleAddNode}
        onExecute={handleExecute}
        onReset={handleReset}
        isExecuting={isExecuting}
        nodeCount={nodes.length}
        connectionCount={connections.length}
      />

      {/* Main area */}
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
          isExecuting={isExecuting}
          canvasId="main"
        />

        {/* Execution log (right) */}
        <div className="relative flex items-stretch">
          <button
            onClick={() => setLogPanelOpen((prev) => !prev)}
            className="absolute -left-8 top-3 z-10 rounded-l-md border border-r-0 border-[var(--color-border-default)] p-1.5 text-[var(--color-fg-muted)] backdrop-blur-lg transition-colors hover:text-[var(--color-fg-default)]"
            style={{ backgroundColor: 'var(--th-panel)' }}
            title={logPanelOpen ? 'Hide log' : 'Show log'}
          >
            {logPanelOpen ? (
              <PanelRightClose size={14} />
            ) : (
              <PanelRightOpen size={14} />
            )}
          </button>

          {logPanelOpen && (
            <div className="w-72">
              <ExecutionLog
                logs={executionLog}
                onClear={() => setExecutionLog([])}
              />
            </div>
          )}
        </div>
      </div>

      {/* Node Detail Modal */}
      <NodeDetailModal
        node={detailNode}
        isOpen={!!detailNode}
        onClose={() => setDetailNodeId(null)}
        onUpdate={handleUpdateNode}
        onDelete={handleDeleteNode}
      />

      {/* Sub-Workflow Overlay */}
      {subWorkflowNode && (
        <SubWorkflowOverlay
          isOpen={!!subWorkflowNode}
          onClose={() => setSubWorkflowTargetId(null)}
          parentNode={subWorkflowNode}
          childrenData={subWorkflowNode.children}
          onUpdateChildren={handleUpdateChildren}
        />
      )}
    </div>
  );
}
