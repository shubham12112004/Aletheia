function createNodeResult(nodeId, nodeName, startedAt, output, error) {
  const executionTimeMs = Date.now() - startedAt;

  return {
    nodeId,
    nodeName,
    status: error ? 'failed' : 'completed',
    executionTimeMs,
    intermediateOutput: output || null,
    errors: error ? [error.message || 'Unknown node error'] : [],
    timestamp: new Date().toISOString(),
  };
}

function mergeNodeState(state, nodeId, result, patch = {}) {
  return {
    ...state,
    ...patch,
    status: result.status === 'failed' ? 'failed' : state.status,
    errors: [...(state.errors || []), ...result.errors],
    nodes: {
      ...(state.nodes || {}),
      [nodeId]: result,
    },
    intermediateOutputs: [
      ...(state.intermediateOutputs || []),
      {
        nodeId,
        nodeName: result.nodeName,
        status: result.status,
        executionTimeMs: result.executionTimeMs,
        output: result.intermediateOutput,
        errors: result.errors,
        timestamp: result.timestamp,
      },
    ],
  };
}

function createGraphNode(nodeId, nodeName, work) {
  return async (state) => {
    const startedAt = Date.now();

    try {
      const { patch = {}, output = null } = await work(state);
      const result = createNodeResult(nodeId, nodeName, startedAt, output);
      return mergeNodeState(state, nodeId, result, patch);
    } catch (error) {
      const result = createNodeResult(nodeId, nodeName, startedAt, null, error);
      return mergeNodeState(state, nodeId, result);
    }
  };
}

module.exports = {
  createGraphNode,
};
