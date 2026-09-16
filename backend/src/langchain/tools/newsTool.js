const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');
const newsService = require('../../services/newsApiService');

const newsTool = new DynamicStructuredTool({
  name: 'news_tool',
  description: 'Fetch recent company news articles from NewsAPI.',
  schema: z.object({
    company: z.string().min(1).describe('Company name or ticker symbol'),
    pageSize: z.number().int().min(1).max(50).default(20),
  }),
  func: async ({ company, pageSize }) => {
    const data = await newsService.getCompanyNews(company, { pageSize });

    return JSON.stringify({
      success: true,
      tool: 'news_tool',
      input: { company, pageSize },
      data: {
        totalResults: data.totalResults || 0,
        articles: Array.isArray(data.articles) ? data.articles : [],
      },
      meta: {
        source: 'NewsAPI',
        articleCount: Array.isArray(data.articles) ? data.articles.length : 0,
      },
    });
  },
});

module.exports = newsTool;
