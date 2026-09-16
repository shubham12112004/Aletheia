const env = require('../config/env');
const { fmpClient } = require('../config/httpClients');

async function searchCompany(query) {
  const { data } = await fmpClient.get('/search', {
    params: { query, limit: 10, apikey: env.FMP_API_KEY },
  });
  return data;
}

async function getCompanyProfile(symbol) {
  const { data } = await fmpClient.get(`/profile/${encodeURIComponent(symbol)}`, {
    params: { apikey: env.FMP_API_KEY },
  });
  return Array.isArray(data) ? data[0] : data;
}

async function getFinancialStatements(symbol, limit = 4) {
  const params = { limit, apikey: env.FMP_API_KEY };
  const [income, balance, cashflow] = await Promise.all([
    fmpClient.get(`/income-statement/${encodeURIComponent(symbol)}`, { params }),
    fmpClient.get(`/balance-sheet-statement/${encodeURIComponent(symbol)}`, { params }),
    fmpClient.get(`/cash-flow-statement/${encodeURIComponent(symbol)}`, { params }),
  ]);

  return {
    incomeStatement: income.data,
    balanceSheet: balance.data,
    cashFlow: cashflow.data,
  };
}

async function getStockMetrics(symbol) {
  const params = { limit: 4, apikey: env.FMP_API_KEY };
  const [quote, ratios, metrics] = await Promise.all([
    fmpClient.get(`/quote/${encodeURIComponent(symbol)}`, { params: { apikey: env.FMP_API_KEY } }),
    fmpClient.get(`/ratios/${encodeURIComponent(symbol)}`, { params }),
    fmpClient.get(`/key-metrics/${encodeURIComponent(symbol)}`, { params }),
  ]);

  return {
    quote: Array.isArray(quote.data) ? quote.data[0] : quote.data,
    ratios: ratios.data,
    keyMetrics: metrics.data,
  };
}

module.exports = {
  searchCompany,
  getCompanyProfile,
  getFinancialStatements,
  getStockMetrics,
};
