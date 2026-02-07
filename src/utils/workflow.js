// ---------------------------------------------------------------------------
// Workflow utility functions
// ---------------------------------------------------------------------------
// Pure helpers and the BFS execution engine extracted from the monolithic
// workflow-execution-engine.jsx so they can be reused across components.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Nested workflow traversal helpers
// ---------------------------------------------------------------------------

/**
 * Given the root workflow data and a view stack (array of { nodeId, title }),
 * return the { nodes, connections } at the current depth level.
 */
export function getNodesAtLevel(workflow, viewStack) {
  let current = workflow;
  for (const entry of viewStack) {
    const node = current.nodes?.find((n) => n.id === entry.nodeId);
    if (!node?.children) return { nodes: [], connections: [] };
    current = node.children;
  }
  return {
    nodes: current.nodes ?? [],
    connections: current.connections ?? [],
  };
}

/**
 * Given root workflow data and a view stack, produce a new workflow object
 * with the nodes/connections at the deepest level replaced by updatedData.
 * Returns a new workflow object (immutable).
 */
export function setNodesAtLevel(workflow, viewStack, updatedData) {
  if (viewStack.length === 0) {
    return { ...workflow, ...updatedData };
  }

  const [head, ...rest] = viewStack;
  const newNodes = workflow.nodes.map((n) => {
    if (n.id !== head.nodeId) return n;
    const newChildren = setNodesAtLevel(
      n.children || { nodes: [], connections: [] },
      rest,
      updatedData
    );
    return { ...n, children: newChildren };
  });

  return { ...workflow, nodes: newNodes, connections: workflow.connections };
}

/**
 * Find all direct child nodes of a given node (downstream).
 *
 * @param {string} nodeId
 * @param {Array<{id:string, from:string, to:string}>} connections
 * @param {Array<{id:string}>} nodes
 * @returns {Array<object>} child node objects
 */
export function getDownstreamNodes(nodeId, connections, nodes) {
  return connections
    .filter((conn) => conn.from === nodeId)
    .map((conn) => nodes.find((n) => n.id === conn.to))
    .filter(Boolean);
}

/**
 * Find all direct parent nodes of a given node (upstream).
 *
 * @param {string} nodeId
 * @param {Array<{id:string, from:string, to:string}>} connections
 * @param {Array<{id:string}>} nodes
 * @returns {Array<object>} parent node objects
 */
export function getUpstreamNodes(nodeId, connections, nodes) {
  return connections
    .filter((conn) => conn.to === nodeId)
    .map((conn) => nodes.find((n) => n.id === conn.from))
    .filter(Boolean);
}

/**
 * Build a cubic Bezier SVG path string between two points.
 * The control points are placed at the horizontal midpoint so the curve
 * flows smoothly from left to right.
 *
 * @param {number} startX
 * @param {number} startY
 * @param {number} endX
 * @param {number} endY
 * @returns {string} SVG `d` attribute value
 */
export function buildBezierPath(startX, startY, endX, endY) {
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

/**
 * Determine the hex stroke colour for a connection between two nodes based
 * on the execution status of each endpoint.
 *
 * @param {{status:string}} fromNode
 * @param {{status:string}} toNode
 * @returns {string} hex colour
 */
export function getConnectionColor(fromNode, toNode) {
  if (!fromNode || !toNode) return '#4b5563'; // gray-600

  if (fromNode.status === 'error' || toNode.status === 'error') {
    return '#ef4444'; // red-500
  }
  if (fromNode.status === 'success' && toNode.status === 'running') {
    return '#eab308'; // yellow-500
  }
  if (fromNode.status === 'success' && toNode.status === 'success') {
    return '#22c55e'; // green-500
  }
  if (fromNode.status === 'running' || toNode.status === 'running') {
    return '#eab308'; // yellow-500
  }
  return '#4b5563'; // gray-600  (idle / default)
}

// ---------------------------------------------------------------------------
// Internal – simulate execution for a single node
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateNodeExecution(node, inputData) {
  // 1–2 second delay to simulate real work
  await sleep(1000 + Math.random() * 1000);

  let result = { ...inputData };

  switch (node.type) {
    case 'start':
      result = { initiated: true, timestamp: Date.now() };
      break;

    case 'api':
      if (Math.random() < 0.2) {
        throw new Error(
          `API call failed: ${node.config?.url || 'No URL configured'}`
        );
      }
      result = {
        ...inputData,
        apiData: { users: ['Alice', 'Bob', 'Charlie'], count: 3 },
        statusCode: 200,
      };
      break;

    case 'database':
      if (Math.random() < 0.15) {
        throw new Error('Database connection timeout');
      }
      result = {
        ...inputData,
        dbResult: { inserted: true, id: Math.floor(Math.random() * 1000) },
      };
      break;

    case 'code':
      if (
        inputData.apiData &&
        node.config?.errorOnEmpty &&
        inputData.apiData.count === 0
      ) {
        throw new Error('Empty data set not allowed');
      }
      result = {
        ...inputData,
        transformed: true,
        processedCount: inputData.apiData?.count || 0,
      };
      break;

    case 'decision':
      result = {
        ...inputData,
        branchTaken: (inputData.count ?? 0) > 0 ? 'true' : 'false',
      };
      break;

    case 'phase':
      result = {
        ...inputData,
        phaseStarted: true,
        phaseName: node.title,
      };
      break;

    case 'task':
      if (Math.random() < 0.1) {
        throw new Error(`Task "${node.title}" failed unexpectedly`);
      }
      result = {
        ...inputData,
        taskCompleted: true,
        taskName: node.title,
      };
      break;

    case 'milestone':
      result = {
        ...inputData,
        milestoneReached: true,
        milestoneName: node.title,
      };
      break;

    case 'end':
      result = { ...inputData, completed: true };
      break;

    default:
      // Unknown type – pass through
      break;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public – BFS workflow execution engine with error cascading
// ---------------------------------------------------------------------------

/**
 * Execute a workflow using BFS traversal with dependency resolution and
 * automatic error cascading to downstream nodes.
 *
 * @param {Array<object>} nodes
 * @param {Array<object>} connections
 * @param {(nodeId:string)=>void}                   onNodeStart
 * @param {(nodeId:string, result:object)=>void}    onNodeComplete
 * @param {(nodeId:string, error:string)=>void}     onNodeError
 * @param {(message:string, level:string)=>void}    onLog
 * @returns {Promise<{executed:Set, failed:Set}>}
 */
export async function executeWorkflow(
  nodes,
  connections,
  onNodeStart,
  onNodeComplete,
  onNodeError,
  onLog
) {
  onLog('Starting workflow execution...', 'info');

  // Find start node
  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) {
    onLog('No start node found in workflow.', 'error');
    return { executed: new Set(), failed: new Set() };
  }

  const queue = [{ node: startNode, data: {} }];
  const executed = new Set();
  const failed = new Set();

  /** Internal node data store (maps nodeId -> result) */
  const nodeData = {};

  // Recursive cascade helper
  const cascadeError = (fromNodeId) => {
    const downstream = getDownstreamNodes(fromNodeId, connections, nodes);
    downstream.forEach((downNode) => {
      if (!failed.has(downNode.id) && !executed.has(downNode.id)) {
        onNodeError(downNode.id, 'Upstream failure');
        onLog(
          `${downNode.title} skipped due to upstream failure`,
          'warning'
        );
        failed.add(downNode.id);
        cascadeError(downNode.id);
      }
    });
  };

  // Guard against infinite loops – cap iterations at 10x node count
  const maxIterations = nodes.length * 10;
  let iterations = 0;

  while (queue.length > 0) {
    iterations++;
    if (iterations > maxIterations) {
      onLog('Workflow aborted: possible circular dependency detected.', 'error');
      break;
    }

    const { node, data } = queue.shift();

    if (executed.has(node.id) || failed.has(node.id)) continue;

    // Check parent dependencies
    const parentConnections = connections.filter(
      (conn) => conn.to === node.id
    );
    const allParentsFinished = parentConnections.every(
      (conn) => executed.has(conn.from) || failed.has(conn.from)
    );
    const anyParentFailed = parentConnections.some((conn) =>
      failed.has(conn.from)
    );

    if (parentConnections.length > 0 && !allParentsFinished) {
      // Re-queue – not all parents finished yet
      queue.push({ node, data });
      continue;
    }

    if (anyParentFailed) {
      onNodeError(node.id, 'Parent node failed');
      onLog(`${node.title} skipped due to upstream failure`, 'warning');
      failed.add(node.id);
      cascadeError(node.id);
      continue;
    }

    // Merge input data from all parents
    let mergedData = { ...data };
    parentConnections.forEach((conn) => {
      if (nodeData[conn.from]) {
        mergedData = { ...mergedData, ...nodeData[conn.from] };
      }
    });

    // Execute
    onNodeStart(node.id);
    onLog(`Executing node: ${node.title} (${node.type})`, 'info');

    try {
      const result = await simulateNodeExecution(node, mergedData);
      nodeData[node.id] = result;
      executed.add(node.id);
      onNodeComplete(node.id, result);
      onLog(`${node.title} completed successfully`, 'success');

      // Queue downstream
      const downstream = getDownstreamNodes(node.id, connections, nodes);
      downstream.forEach((downNode) => {
        if (!executed.has(downNode.id) && !failed.has(downNode.id)) {
          queue.push({ node: downNode, data: result });
        }
      });
    } catch (err) {
      failed.add(node.id);
      onNodeError(node.id, err.message);
      onLog(`${node.title} failed: ${err.message}`, 'error');
      cascadeError(node.id);
    }
  }

  // Summary
  if (failed.size > 0) {
    onLog(
      `Workflow completed with ${failed.size} failure${failed.size > 1 ? 's' : ''}.`,
      'error'
    );
  } else {
    onLog('Workflow completed successfully.', 'success');
  }

  return { executed, failed };
}
