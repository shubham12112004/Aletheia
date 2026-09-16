const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');
const financialService = require('../../services/financialModelingPrepService');

const financialTool = new DynamicStructuredTool({
  name: 'financial_tool',
  description: 'Fetch financial statements and stock metrics for a public company ticker.',
  schema: z.object({
    symbol: z.string().min(1).describe('Public company ticker symbol'),
    includeProfile: z.boolean().default(true).describe('Whether to include company profile data'),
  }),
  func: async ({ symbol, includeProfile }) => {
    const [profile, statements, metrics] = await Promise.all([
      includeProfile ? financialService.getCompanyProfile(symbol) : Promise.resolve(null),
      financialService.getFinancialStatements(symbol),
      financialService.getStockMetrics(symbol),
    ]);

    return JSON.stringify({
      success: true,
      tool: 'financial_tool',
      input: { symbol, includeProfile },
      data: {
        profile,
        statements,
        metrics,
      },
      meta: {
        incomeStatementCount: Array.isArray(statements.incomeStatement) ? statements.incomeStatement.length : 0,
        balanceSheetCount: Array.isArray(statements.balanceSheet) ? statements.balanceSheet.length : 0,
        cashFlowCount: Array.isArray(statements.cashFlow) ? statements.cashFlow.length : 0,
      },
    });
  },
});

module.exports = financialTool;
