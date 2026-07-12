const geminiService = require('../../services/geminiService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('recommendation', 'Recommendation', async (state) => {
  const recommendation = await geminiService.generateContent(
    JSON.stringify({
      task: 'Generate a final investment recommendation from the graph state.',
      company: state.company,
      ticker: state.ticker,
      profile: state.data.companyProfile,
      financialStatements: state.data.financialStatements,
      stockMetrics: state.data.stockMetrics,
      latestNews: state.data.latestNews,
      webSearch: state.data.webSearch,
      sentimentAnalysis: state.data.sentimentAnalysis,
      swot: state.data.swot,
      riskAnalysis: state.data.riskAnalysis,
      requiredJson: {
        verdict: 'INVEST | HOLD | AVOID',
        confidence: 0,
        summary: '',
        thesis: [],
        risks: [],
        sources: [],
      },
    })
  );

  return {
    patch: {
      completedAt: new Date().toISOString(),
      status: 'completed',
      data: {
        ...state.data,
        recommendation,
      },
    },
    output: recommendation,
  };
});
