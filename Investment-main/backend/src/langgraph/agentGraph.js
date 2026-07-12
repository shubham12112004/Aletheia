const { END, START, StateGraph, Annotation } = require('@langchain/langgraph');
const { createInitialGraphState } = require('./state');
const companyAgentNode = require('./nodes/companyAgentNode');
const financialAgentNode = require('./nodes/financialAgentNode');
const newsAgentNode = require('./nodes/newsAgentNode');
const researchAgentNode = require('./nodes/researchAgentNode');
const riskAgentNode = require('./nodes/riskAgentNode');
const recommendationAgentNode = require('./nodes/recommendationAgentNode');

const AgentGraphState = Annotation.Root({
  company: Annotation(),
  ticker: Annotation(),
  status: Annotation(),
  startedAt: Annotation(),
  completedAt: Annotation(),
  errors: Annotation({
    reducer: (_left, right) => right,
    default: () => [],
  }),
  nodes: Annotation({
    reducer: (_left, right) => right,
    default: () => ({}),
  }),
  data: Annotation({
    reducer: (_left, right) => right,
    default: () => ({}),
  }),
  intermediateOutputs: Annotation({
    reducer: (_left, right) => right,
    default: () => [],
  }),
});

function buildMultiAgentResearchGraph() {
  return new StateGraph(AgentGraphState)
    .addNode('companyAgent', companyAgentNode)
    .addNode('financialAgent', financialAgentNode)
    .addNode('newsAgent', newsAgentNode)
    .addNode('researchAgent', researchAgentNode)
    .addNode('riskAgent', riskAgentNode)
    .addNode('recommendationAgent', recommendationAgentNode)
    .addEdge(START, 'companyAgent')
    .addEdge('companyAgent', 'financialAgent')
    .addEdge('financialAgent', 'newsAgent')
    .addEdge('newsAgent', 'researchAgent')
    .addEdge('researchAgent', 'riskAgent')
    .addEdge('riskAgent', 'recommendationAgent')
    .addEdge('recommendationAgent', END)
    .compile();
}

async function runMultiAgentResearchGraph(input) {
  const graph = buildMultiAgentResearchGraph();
  const initialState = createInitialGraphState(input);
  return graph.invoke(initialState);
}

module.exports = {
  buildMultiAgentResearchGraph,
  runMultiAgentResearchGraph,
};
