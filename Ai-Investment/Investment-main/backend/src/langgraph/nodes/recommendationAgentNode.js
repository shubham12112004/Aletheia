const { recommendationAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('recommendationAgent', 'Recommendation Agent', async (state) => {
  const output = await recommendationAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      companyAgent: state.data.companyAgent,
      financialAgent: state.data.financialAgent,
      newsAgent: state.data.newsAgent,
      researchAgent: state.data.researchAgent,
      riskAgent: state.data.riskAgent,
    }),
  });

  return {
    patch: {
      completedAt: new Date().toISOString(),
      status: 'completed',
      data: {
        ...state.data,
        recommendationAgent: output,
        recommendation: output,
      },
    },
    output,
  };
});
