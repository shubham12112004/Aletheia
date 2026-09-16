const geminiService = require('../../services/geminiService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('swot', 'SWOT', async (state) => {
  const swot = await geminiService.generateSwot({
    company: state.company,
    ticker: state.ticker,
    profile: state.data.companyProfile,
    financialStatements: state.data.financialStatements,
    stockMetrics: state.data.stockMetrics,
    sentimentAnalysis: state.data.sentimentAnalysis,
    webSearch: state.data.webSearch,
  });

  return {
    patch: {
      data: {
        ...state.data,
        swot,
      },
    },
    output: swot,
  };
});
