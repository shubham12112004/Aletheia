const { riskAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('riskAgent', 'Risk Agent', async (state) => {
  const output = await riskAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      companyAgent: state.data.companyAgent,
      financialAgent: state.data.financialAgent,
      newsAgent: state.data.newsAgent,
      researchAgent: state.data.researchAgent,
    }),
  });

  return {
    patch: {
      data: {
        ...state.data,
        riskAgent: output,
        swot: output.swot,
        riskAnalysis: output.risk,
      },
    },
    output,
  };
});
