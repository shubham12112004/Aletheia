const { END, START, StateGraph, Annotation } = require('@langchain/langgraph');
const { createInitialGraphState } = require('./state');
const { buildMultiAgentResearchGraph, runMultiAgentResearchGraph } = require('./agentGraph');
const {
  companyValidationNode,
  companyProfileNode,
  financialStatementsNode,
  stockMetricsNode,
  latestNewsNode,
  webSearchNode,
  sentimentAnalysisNode,
  swotNode,
  riskAnalysisNode,
  recommendationNode,
} = require('./nodes');

const GraphState = Annotation.Root({
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

function buildInvestmentResearchGraph() {
  return new StateGraph(GraphState)
    .addNode('companyValidation', companyValidationNode)
    .addNode('companyProfile', companyProfileNode)
    .addNode('financialStatements', financialStatementsNode)
    .addNode('stockMetrics', stockMetricsNode)
    .addNode('latestNews', latestNewsNode)
    .addNode('webSearch', webSearchNode)
    .addNode('sentimentAnalysis', sentimentAnalysisNode)
    .addNode('swot', swotNode)
    .addNode('riskAnalysis', riskAnalysisNode)
    .addNode('recommendation', recommendationNode)
    .addEdge(START, 'companyValidation')
    .addEdge('companyValidation', 'companyProfile')
    .addEdge('companyProfile', 'financialStatements')
    .addEdge('financialStatements', 'stockMetrics')
    .addEdge('stockMetrics', 'latestNews')
    .addEdge('latestNews', 'webSearch')
    .addEdge('webSearch', 'sentimentAnalysis')
    .addEdge('sentimentAnalysis', 'swot')
    .addEdge('swot', 'riskAnalysis')
    .addEdge('riskAnalysis', 'recommendation')
    .addEdge('recommendation', END)
    .compile();
}

async function runInvestmentResearchGraph(input) {
  const graph = buildInvestmentResearchGraph();
  const initialState = createInitialGraphState(input);
  return graph.invoke(initialState);
}

module.exports = {
  buildInvestmentResearchGraph: buildMultiAgentResearchGraph,
  runInvestmentResearchGraph: runMultiAgentResearchGraph,
  buildMultiAgentResearchGraph,
  runMultiAgentResearchGraph,
  buildLegacyNodeGraph: buildInvestmentResearchGraph,
  runLegacyNodeGraph: runInvestmentResearchGraph,
  createInitialGraphState,
};

