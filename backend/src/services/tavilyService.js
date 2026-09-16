const env = require('../config/env');
const { tavilyClient } = require('../config/httpClients');

async function search(query, options = {}) {
  const { data } = await tavilyClient.post('/search', {
    api_key: env.TAVILY_API_KEY,
    query,
    search_depth: options.searchDepth ?? 'advanced',
    include_answer: options.includeAnswer ?? true,
    include_raw_content: options.includeRawContent ?? false,
    max_results: options.maxResults ?? 8,
  });

  return data;
}

module.exports = { search };
