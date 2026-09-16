const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');
const financialService = require('../../services/financialModelingPrepService');

const companyTool = new DynamicStructuredTool({
  name: 'company_tool',
  description: 'Search and validate a public company or ticker symbol using Financial Modeling Prep.',
  schema: z.object({
    query: z.string().min(1).describe('Company name or ticker symbol'),
  }),
  func: async ({ query }) => {
    const data = await financialService.searchCompany(query);

    return JSON.stringify({
      success: true,
      tool: 'company_tool',
      input: { query },
      data: Array.isArray(data) ? data : [],
      meta: {
        resultCount: Array.isArray(data) ? data.length : 0,
      },
    });
  },
});

module.exports = companyTool;
