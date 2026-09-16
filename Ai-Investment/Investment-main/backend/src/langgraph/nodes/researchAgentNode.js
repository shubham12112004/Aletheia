const { researchAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('researchAgent', 'Research Agent', async (state) => {
  const output = await researchAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      companyAgent: state.data.companyAgent,
      financialAgent: state.data.financialAgent,
      newsAgent: state.data.newsAgent,
    }),
  });

  return {
    patch: {
      data: {
        ...state.data,
        researchAgent: output,
        sentimentAnalysis: output.sentiment,
      },
    },
    output,
  };
});
