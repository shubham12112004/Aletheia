const { newsAgent } = require('../../agents');
const { createGraphNode } = require('./nodeRunner');

function parseToolResult(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = createGraphNode('newsAgent', 'News Agent', async (state) => {
  const newsEvidence = parseToolResult(await newsAgent.tools[0].invoke({ company: state.company, pageSize: 20 }));
  const webEvidence = parseToolResult(
    await newsAgent.tools[1].invoke({
      query: `${state.company} ${state.ticker} investment analysis latest risk`,
      maxResults: 8,
    })
  );

  const analysis = await newsAgent.run({
    input: JSON.stringify({
      company: state.company,
      ticker: state.ticker,
      financialAgent: state.data.financialAgent,
      newsEvidence,
      webEvidence,
    }),
  });

  const output = {
    newsEvidence,
    webEvidence,
    analysis,
    latestNews:
      analysis.latestNews && Object.keys(analysis.latestNews).length ? analysis.latestNews : newsEvidence.data,
    webSearch: analysis.webSearch && Object.keys(analysis.webSearch).length ? analysis.webSearch : webEvidence.data,
    sources: analysis.sources || [],
    summary: analysis.summary,
    notableEvents: analysis.notableEvents || [],
  };

  return {
    patch: {
      data: {
        ...state.data,
        newsAgent: output,
        latestNews: output.latestNews,
        webSearch: output.webSearch,
      },
    },
    output,
  };
});
