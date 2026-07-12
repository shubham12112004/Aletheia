const tavilyService = require('../../services/tavilyService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('webSearch', 'Web Search (Tavily)', async (state) => {
  const query = `${state.company} ${state.ticker} investment analysis financial risk latest news`;
  const webSearch = await tavilyService.search(query, { maxResults: 8 });
  const results = Array.isArray(webSearch.results) ? webSearch.results : [];

  return {
    patch: {
      data: {
        ...state.data,
        webSearch: {
          answer: webSearch.answer || null,
          results,
        },
      },
    },
    output: {
      query,
      answer: webSearch.answer || null,
      resultsRetrieved: results.length,
      sources: results.map((result) => result.url).filter(Boolean),
    },
  };
});
