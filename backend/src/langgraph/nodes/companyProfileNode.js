const financialService = require('../../services/financialModelingPrepService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('companyProfile', 'Company Profile', async (state) => {
  const profile = await financialService.getCompanyProfile(state.ticker);

  if (!profile) {
    throw new Error(`Company profile not found for ${state.ticker}`);
  }

  return {
    patch: {
      data: {
        ...state.data,
        companyProfile: profile,
      },
    },
    output: {
      ticker: state.ticker,
      companyName: profile.companyName || profile.companyName,
      sector: profile.sector,
      industry: profile.industry,
      marketCap: profile.mktCap,
    },
  };
});
