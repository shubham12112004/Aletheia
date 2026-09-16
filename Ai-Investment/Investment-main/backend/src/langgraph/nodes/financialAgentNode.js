const { financialAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

function parseToolResult(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = createGraphNode('financialAgent', 'Financial Agent', async (state) => {
  const toolEvidence = parseToolResult(
    await financialAgent.tools[0].invoke({ symbol: state.ticker, includeProfile: true })
  );

  const analysis = await financialAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      companyAgent: state.data.companyAgent,
      toolEvidence,
    }),
  });

  const output = {
    toolEvidence,
    analysis,
    profile: analysis.profile && Object.keys(analysis.profile).length ? analysis.profile : toolEvidence.data.profile,
    statements:
      analysis.statements && Object.keys(analysis.statements).length ? analysis.statements : toolEvidence.data.statements,
    metrics: analysis.metrics && Object.keys(analysis.metrics).length ? analysis.metrics : toolEvidence.data.metrics,
    summary: analysis.summary,
    keySignals: analysis.keySignals || [],
    warnings: analysis.warnings || [],
  };

  return {
    patch: {
      data: {
        ...state.data,
        financialAgent: output,
        companyProfile: output.profile,
        financialStatements: output.statements,
        stockMetrics: output.metrics,
      },
    },
    output,
  };
});
