const financialService = require('../../services/financialModelingPrepService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('companyValidation', 'Company Validation', async (state) => {
  const results = await financialService.searchCompany(state.company);
  const matches = Array.isArray(results) ? results : [];
  const selected = matches[0];

  if (!selected || !selected.symbol) {
    throw new Error(`No public company match found for "${state.company}"`);
  }

  return {
    patch: {
      company: selected.name || state.company,
      ticker: selected.symbol,
      data: {
        ...state.data,
        companyValidation: {
          query: state.company,
          selected,
          matches,
        },
      },
    },
    output: {
      query: state.company,
      ticker: selected.symbol,
      companyName: selected.name,
      matchCount: matches.length,
    },
  };
});
