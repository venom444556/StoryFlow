import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { generateId } from '../../utils/ids';
import WorkflowNode from './WorkflowNode';
import WorkflowConnection from './WorkflowConnection';
import NodeContextMenu from './NodeContextMenu';
import WorkflowZoomControls from './WorkflowZoomControls';

// ---------------------------------------------------------------------------
// WorkflowCanvas
// ---------------------------------------------------------------------------
// Reusable interactive workflow canvas with SVG grid, nodes, connections,
// drag, connection-drawing, zoom/pan, and context menu support.
// Used by both the main WorkflowTab and SubWorkflowOverlay.
// ---------------------------------------------------------------------------

const NODE_WIDTH = 180;
const HANDLE_CENTER_Y = 41; // matches WorkflowNode top-[34px] + 7px (half handle)
const GRID_SIZE = 20; // snap-to-grid spacing (matches SVG dot pattern)
const NODE_HEIGHT_ESTIMATE = 80; // approximate height for bounding-box calc

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function clampZoom(z) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
}

export default function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  onSaveNodes,
  onSaveConnections,
  onSaveBoth,
  onSelectNode,
  onDrillDown,
  onNodeDoubleClick,
  onAddChildren,
  isExecuting = false,
  canvasId = 'main',
}) {
  // ------ Viewport state (zoom + pan) ------
  const [viewport, setViewport] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const viewportInitialized = useRef(false);
  const prevCanvasId = useRef(canvasId);

  // ------ Drag state ------
  const [draggingId, setDraggingId] = useState(null);
  const [pendingDragId, setPendingDragId] = useState(null); // waiting for threshold
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef(null); // { clientX, clientY } — for drag threshold
  const DRAG_THRESHOLD = 4; // px — movement before drag actually starts

  // ------ Pan state ------
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef(null); // { clientX, clientY, offsetX, offsetY }

  // ------ Connection-drawing state ------
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState(null);

  // ------ Context menu state ------
  const [contextMenu, setContextMenu] = useState(null);

  const canvasRef = useRef(null);

  // ------ Coordinate helpers ------

  // Convert screen (mouse) coordinates to canvas-space coordinates
  const screenToCanvas = useCallback(
    (screenX, screenY) => ({
      x: (screenX - viewport.offsetX) / viewport.scale,
      y: (screenY - viewport.offsetY) / viewport.scale,
    }),
    [viewport]
  );

  // ------ Auto-center on mount / canvasId change ------

  const centerOnNodes = useCallback(() => {
    const container = canvasRef.current;
    if (!container || nodes.length === 0) return;

    const rect = container.getBoundingClientRect();
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) + NODE_WIDTH;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) + NODE_HEIGHT_ESTIMATE;

    const contentCenterX = (minX + maxX) / 2;
    const contentCenterY = (minY + maxY) / 2;

    setViewport({
      scale: 1,
      offsetX: rect.width / 2 - contentCenterX,
      offsetY: rect.height / 2 - contentCenterY,
    });
  }, [nodes]);

  useEffect(() => {
    // Reset when switching between main / sub-workflow canvases
    if (prevCanvasId.current !== canvasId) {
      viewportInitialized.current = false;
      prevCanvasId.current = canvasId;
    }

    if (!viewportInitialized.current && nodes.length > 0) {
      centerOnNodes();
      viewportInitialized.current = true;
    }
  }, [nodes, canvasId, centerOnNodes]);

  // ------ Zoom handlers ------

  const handleZoomIn = useCallback(() => {
    setViewport((prev) => {
      const newScale = clampZoom(prev.scale + ZOOM_STEP);
      // Zoom toward center of viewport
      const container = canvasRef.current;
      if (!container) return { ...prev, scale: newScale };
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      return {
        scale: newScale,
        offsetX: cx - (cx - prev.offsetX) * (newScale / prev.scale),
        offsetY: cy - (cy - prev.offsetY) * (newScale / prev.scale),
      };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => {
      const newScale = clampZoom(prev.scale - ZOOM_STEP);
      const container = canvasRef.current;
      if (!container) return { ...prev, scale: newScale };
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      return {
        scale: newScale,
        offsetX: cx - (cx - prev.offsetX) * (newScale / prev.scale),
        offsetY: cy - (cy - prev.offsetY) * (newScale / prev.scale),
      };
    });
  }, []);

  const handleResetView = useCallback(() => {
    centerOnNodes();
  }, [centerOnNodes]);

  // Ctrl/Cmd + scroll wheel zoom (toward cursor)
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;

      setViewport((prev) => {
        const newScale = clampZoom(prev.scale + delta);
        return {
          scale: newScale,
          offsetX: mx - (mx - prev.offsetX) * (newScale / prev.scale),
          offsetY: my - (my - prev.offsetY) * (newScale / prev.scale),
        };
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // ------ Connection counts ------
  const inConnectionCounts = useMemo(() => {
    const counts = {};
    connections.forEach((c) => {
      counts[c.to] = (counts[c.to] || 0) + 1;
    });
    return counts;
  }, [connections]);

  const outConnectionCounts = useMemo(() => {
    const counts = {};
    connections.forEach((c) => {
      counts[c.from] = (counts[c.from] || 0) + 1;
    });
    return counts;
  }, [connections]);

  const contextMenuNode = contextMenu
    ? nodes.find((n) => n.id === contextMenu.nodeId)
    : null;

  // ------ Node CRUD ------

  const handleUpdateNode = useCallback(
    (nodeId, updates) => {
      const updatedNodes = nodes.map((n) =>
        n.id === nodeId ? { ...n, ...updates } : n
      );
      onSaveNodes(updatedNodes);
    },
    [nodes, onSaveNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      const updatedNodes = nodes.filter((n) => n.id !== nodeId);
      const updatedConns = connections.filter(
        (c) => c.from !== nodeId && c.to !== nodeId
      );
      onSaveBoth(updatedNodes, updatedConns);
      if (selectedNodeId === nodeId) onSelectNode?.(null);
      setContextMenu(null);
    },
    [nodes, connections, onSaveBoth, selectedNodeId, onSelectNode]
  );

  const handleDuplicateNode = useCallback(
    (nodeId) => {
      const original = nodes.find((n) => n.id === nodeId);
      if (!original) return;

      const duplicate = {
        ...original,
        id: generateId(),
        title: `${original.title} (copy)`,
        x: original.x + 40,
        y: original.y + 40,
        status: 'idle',
        error: null,
        children: undefined,
      };
      onSaveNodes([...nodes, duplicate]);
      onSelectNode?.(duplicate.id);
      setContextMenu(null);
    },
    [nodes, onSaveNodes, onSelectNode]
  );

  // ------ Connection CRUD ------

  const handleDeleteConnection = useCallback(
    (connection) => {
      if (isExecuting) return;
      const updatedConns = connections.filter((c) => c.id !== connection.id);
      onSaveConnections(updatedConns);
    },
    [connections, isExecuting, onSaveConnections]
  );

  // ------ Context menu ------

  const handleNodeContextMenu = useCallback((nodeId, event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Context menu renders outside the transform wrapper, so use screen coords
    setContextMenu({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      nodeId,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // ------ Drag handling (with viewport transform) ------

  const handleNodeMouseDown = useCallback(
    (nodeId, event) => {
      if (isExecuting) return;
      event.preventDefault();
      setContextMenu(null);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Convert screen coords to canvas-space for drag offset
      const canvas = screenToCanvas(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
      dragOffsetRef.current = {
        x: canvas.x - node.x,
        y: canvas.y - node.y,
      };
      // Store the start position — don't begin drag until threshold exceeded
      dragStartRef.current = { clientX: event.clientX, clientY: event.clientY };
      setPendingDragId(nodeId);
      onSelectNode?.(nodeId);
    },
    [isExecuting, nodes, onSelectNode, screenToCanvas]
  );

  // ------ Pan handling ------

  const handlePanStart = useCallback(
    (event) => {
      // Middle mouse button (button === 1) or left click on empty canvas with Space held
      if (event.button === 1) {
        event.preventDefault();
        setIsPanning(true);
        panStartRef.current = {
          clientX: event.clientX,
          clientY: event.clientY,
          offsetX: viewport.offsetX,
          offsetY: viewport.offsetY,
        };
      }
    },
    [viewport.offsetX, viewport.offsetY]
  );

  // ------ Connection drawing ------

  const handleStartConnect = useCallback(
    (nodeId, event) => {
      if (isExecuting) return;
      setConnectingFrom(nodeId);
    },
    [isExecuting]
  );

  const handleEndConnect = useCallback(
    (nodeId) => {
      if (!connectingFrom || connectingFrom === nodeId) {
        setConnectingFrom(null);
        setTempConnectionEnd(null);
        return;
      }

      const exists = connections.some(
        (c) => c.from === connectingFrom && c.to === nodeId
      );
      if (!exists) {
        const newConn = {
          id: generateId(),
          from: connectingFrom,
          to: nodeId,
        };
        onSaveConnections([...connections, newConn]);
      }

      setConnectingFrom(null);
      setTempConnectionEnd(null);
    },
    [connectingFrom, connections, onSaveConnections]
  );

  // ------ Global mouse handlers (drag + connection drawing + pan) ------

  const handleCanvasMouseMove = useCallback(
    (event) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Pan movement
      if (isPanning && panStartRef.current) {
        const dx = event.clientX - panStartRef.current.clientX;
        const dy = event.clientY - panStartRef.current.clientY;
        setViewport((prev) => ({
          ...prev,
          offsetX: panStartRef.current.offsetX + dx,
          offsetY: panStartRef.current.offsetY + dy,
        }));
        return;
      }

      // Check drag threshold before activating drag
      if (!draggingId && pendingDragId && dragStartRef.current) {
        const dx = event.clientX - dragStartRef.current.clientX;
        const dy = event.clientY - dragStartRef.current.clientY;
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          setDraggingId(pendingDragId);
          setPendingDragId(null);
          dragStartRef.current = null;
        }
        return; // don't move until threshold crossed
      }

      if (draggingId) {
        // Convert screen coords to canvas space
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const canvas = screenToCanvas(screenX, screenY);
        const rawX = canvas.x - dragOffsetRef.current.x;
        const rawY = canvas.y - dragOffsetRef.current.y;
        const newX = snapToGrid(rawX);
        const newY = snapToGrid(rawY);

        const updatedNodes = nodes.map((n) =>
          n.id === draggingId ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n
        );
        onSaveNodes(updatedNodes);
      }

      if (connectingFrom) {
        // Temp connection endpoint needs canvas-space coords (SVG is inside transform wrapper)
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const canvas = screenToCanvas(screenX, screenY);
        setTempConnectionEnd({ x: canvas.x, y: canvas.y });
      }
    },
    [draggingId, pendingDragId, connectingFrom, isPanning, nodes, onSaveNodes, screenToCanvas]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (draggingId) {
      setDraggingId(null);
    }
    setPendingDragId(null);
    dragStartRef.current = null;
    if (connectingFrom) {
      setConnectingFrom(null);
      setTempConnectionEnd(null);
    }
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  }, [draggingId, connectingFrom, isPanning]);

  useEffect(() => {
    if (!draggingId && !connectingFrom && !pendingDragId && !isPanning) return;

    const move = (e) => handleCanvasMouseMove(e);
    const up = () => handleCanvasMouseUp();

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [draggingId, connectingFrom, pendingDragId, isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  // ------ Canvas click (deselect) ------

  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget || e.target.tagName === 'rect') {
        onSelectNode?.(null);
        setContextMenu(null);
      }
    },
    [onSelectNode]
  );

  // ------ Temp connection path ------

  const renderTempConnection = () => {
    if (!connectingFrom || !tempConnectionEnd) return null;

    const fromNode = nodes.find((n) => n.id === connectingFrom);
    if (!fromNode) return null;

    const startX = fromNode.x + NODE_WIDTH + 7;
    const startY = fromNode.y + HANDLE_CENTER_Y;

    return (
      <line
        x1={startX}
        y1={startY}
        x2={tempConnectionEnd.x}
        y2={tempConnectionEnd.y}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        className="pointer-events-none"
      />
    );
  };

  const canvasCursor = isPanning
    ? 'grabbing'
    : draggingId
      ? 'grabbing'
      : connectingFrom
        ? 'crosshair'
        : 'default';

  const patternId = `workflow-grid-${canvasId}`;

  // Use CSS zoom for crisp text at all scale levels (zoom re-renders at target
  // resolution unlike transform:scale which rasterizes then stretches).
  // Translate is adjusted by 1/zoom so the offset stays in screen-pixels.
  const transformStyle = {
    zoom: viewport.scale,
    transform: `translate(${viewport.offsetX / viewport.scale}px, ${viewport.offsetY / viewport.scale}px)`,
    transformOrigin: '0 0',
  };

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden bg-surface-primary"
      style={{ cursor: canvasCursor }}
      onMouseDown={handlePanStart}
    >
      {/* Transform wrapper — everything inside scales + translates together */}
      <div className="absolute inset-0" style={transformStyle}>
        <svg
          className="absolute h-full w-full"
          style={{ left: 0, top: 0, width: '200%', height: '200%' }}
          onClick={handleCanvasClick}
        >
          {/* Dot grid pattern */}
          <defs>
            <pattern
              id={patternId}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.8" style={{ fill: 'var(--th-border)' }} />
            </pattern>
          </defs>
          <rect x="-5000" y="-5000" width="10000" height="10000" fill={`url(#${patternId})`} />

          {/* Connections */}
          {connections.map((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            return (
              <WorkflowConnection
                key={conn.id}
                fromNode={fromNode}
                toNode={toNode}
                connection={conn}
                onDelete={isExecuting ? undefined : handleDeleteConnection}
              />
            );
          })}

          {/* Temp connection being drawn */}
          {renderTempConnection()}
        </svg>

        {/* Nodes rendered as HTML positioned over the SVG */}
        {nodes.map((node) => (
          <WorkflowNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            inConnections={inConnectionCounts[node.id] || 0}
            outConnections={outConnectionCounts[node.id] || 0}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
            onDoubleClick={() => onNodeDoubleClick?.(node.id)}
            onDrillDown={() => onDrillDown?.(node.id)}
            onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
            onStartConnect={(e) => handleStartConnect(node.id, e)}
            onEndConnect={(e) => handleEndConnect(node.id)}
          />
        ))}
      </div>

      {/* Context menu (outside transform — renders at screen coords) */}
      {contextMenu && contextMenuNode && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenuNode}
          onClose={closeContextMenu}
          onEdit={() => {
            onNodeDoubleClick?.(contextMenu.nodeId);
            setContextMenu(null);
          }}
          onDuplicate={() => handleDuplicateNode(contextMenu.nodeId)}
          onDelete={() => handleDeleteNode(contextMenu.nodeId)}
          onAddChildren={
            onAddChildren && !contextMenuNode.children?.nodes?.length
              ? () => {
                  onAddChildren(contextMenu.nodeId);
                  setContextMenu(null);
                }
              : undefined
          }
          onDrillDown={
            contextMenuNode.children?.nodes?.length
              ? () => {
                  onDrillDown?.(contextMenu.nodeId);
                  setContextMenu(null);
                }
              : undefined
          }
          isExecuting={isExecuting}
        />
      )}

      {/* Zoom controls (outside transform — stays fixed in corner) */}
      <WorkflowZoomControls
        scale={viewport.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetView}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      />
    </div>
  );
}
