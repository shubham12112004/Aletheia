function createInitialGraphState(input = {}) {
  return {
    company: input.company,
    ticker: input.ticker || null,
    status: 'pending',
    startedAt: new Date().toISOString(),
    completedAt: null,
    errors: [],
    nodes: {},
    data: {
      companyAgent: null,
      financialAgent: null,
      newsAgent: null,
      researchAgent: null,
      riskAgent: null,
      recommendationAgent: null,
      companyValidation: null,
      companyProfile: null,
      financialStatements: null,
      stockMetrics: null,
      latestNews: null,
      webSearch: null,
      sentimentAnalysis: null,
      swot: null,
      riskAnalysis: null,
      recommendation: null,
    },
    intermediateOutputs: [],
  };
}

module.exports = {
  createInitialGraphState,
};

