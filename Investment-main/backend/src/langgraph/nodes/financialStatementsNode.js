const financialService = require('../../services/financialModelingPrepService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('financialStatements', 'Financial Statements', async (state) => {
  const statements = await financialService.getFinancialStatements(state.ticker);

  return {
    patch: {
      data: {
        ...state.data,
        financialStatements: statements,
      },
    },
    output: {
      ticker: state.ticker,
      incomeStatements: Array.isArray(statements.incomeStatement) ? statements.incomeStatement.length : 0,
      balanceSheets: Array.isArray(statements.balanceSheet) ? statements.balanceSheet.length : 0,
      cashFlows: Array.isArray(statements.cashFlow) ? statements.cashFlow.length : 0,
    },
  };
});
