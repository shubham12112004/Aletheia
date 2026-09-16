const env = require('../config/env');
const { newsClient } = require('../config/httpClients');

async function getCompanyNews(company, options = {}) {
  const { data } = await newsClient.get('/everything', {
    params: {
      q: company,
      language: options.language ?? 'en',
      sortBy: options.sortBy ?? 'publishedAt',
      pageSize: options.pageSize ?? 20,
      apiKey: env.NEWS_API_KEY,
    },
  });

  return data;
}

module.exports = { getCompanyNews };
