const newsService = require('../../services/newsApiService');
const { createGraphNode } = require('./nodeRunner');

module.exports = createGraphNode('latestNews', 'Latest News', async (state) => {
  const news = await newsService.getCompanyNews(state.company, { pageSize: 20 });
  const articles = Array.isArray(news.articles) ? news.articles : [];

  return {
    patch: {
      data: {
        ...state.data,
        latestNews: {
          totalResults: news.totalResults || 0,
          articles,
        },
      },
    },
    output: {
      totalResults: news.totalResults || 0,
      articlesRetrieved: articles.length,
      sources: articles.map((article) => article.source && article.source.name).filter(Boolean),
    },
  };
});
