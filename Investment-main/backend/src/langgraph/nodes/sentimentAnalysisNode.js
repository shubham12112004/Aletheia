const geminiService = require('../../services/geminiService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('sentimentAnalysis', 'Sentiment Analysis', async (state) => {
  const articles = state.data.latestNews && state.data.latestNews.articles ? state.data.latestNews.articles : [];
  const prompt = {
    task: 'Analyze investment news sentiment for the company.',
    company: state.company,
    ticker: state.ticker,
    articles: articles.slice(0, 10).map((article) => ({
      title: article.title,
      source: article.source && article.source.name,
      description: article.description,
      publishedAt: article.publishedAt,
      url: article.url,
    })),
    requiredJson: {
      positive: 0,
      neutral: 0,
      negative: 0,
      summary: '',
      signals: [],
    },
  };

  const sentiment = await geminiService.generateContent(JSON.stringify(prompt));

  return {
    patch: {
      data: {
        ...state.data,
        sentimentAnalysis: sentiment,
      },
    },
    output: sentiment,
  };
});
