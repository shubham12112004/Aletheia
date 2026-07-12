const geminiService = require('../../services/geminiService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('riskAnalysis', 'Risk Analysis', async (state) => {
  const riskAnalysis = await geminiService.generateRiskAssessment({
    company: state.company,
    ticker: state.ticker,
    profile: state.data.companyProfile,
    financialStatements: state.data.financialStatements,
    stockMetrics: state.data.stockMetrics,
    sentimentAnalysis: state.data.sentimentAnalysis,
    swot: state.data.swot,
    webSearch: state.data.webSearch,
  });

  return {
    patch: {
      data: {
        ...state.data,
        riskAnalysis,
      },
    },
    output: riskAnalysis,
  };
});
