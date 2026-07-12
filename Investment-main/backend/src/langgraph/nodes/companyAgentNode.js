const { companyAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

function parseToolResult(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = createGraphNode('companyAgent', 'Company Agent', async (state) => {
  const toolEvidence = parseToolResult(await companyAgent.tools[0].invoke({ query: state.company }));
  const selected = toolEvidence.data && toolEvidence.data[0];

  const analysis = await companyAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      toolEvidence,
    }),
  });

  const output = {
    toolEvidence,
    analysis,
    company: analysis.company || (selected && selected.name) || state.company,
    ticker: analysis.ticker || (selected && selected.symbol) || state.ticker,
  };

  if (!output.ticker) {
    throw new Error(`Company Agent could not resolve ticker for "${state.company}"`);
  }

  return {
    patch: {
      company: output.company,
      ticker: output.ticker,
      data: {
        ...state.data,
        companyAgent: output,
        companyValidation: output,
      },
    },
    output,
  };
});
