const financialService = require('../../services/financialModelingPrepService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('stockMetrics', 'Stock Metrics', async (state) => {
  const metrics = await financialService.getStockMetrics(state.ticker);

  return {
    patch: {
      data: {
        ...state.data,
        stockMetrics: metrics,
      },
    },
    output: {
      ticker: state.ticker,
      price: metrics.quote && metrics.quote.price,
      marketCap: metrics.quote && metrics.quote.marketCap,
      ratioPeriods: Array.isArray(metrics.ratios) ? metrics.ratios.length : 0,
      keyMetricPeriods: Array.isArray(metrics.keyMetrics) ? metrics.keyMetrics.length : 0,
    },
  };
});
