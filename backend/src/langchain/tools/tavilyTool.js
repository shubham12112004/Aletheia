const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');
const tavilyService = require('../../services/tavilyService');

const tavilyTool = new DynamicStructuredTool({
  name: 'tavily_tool',
  description: 'Search the web for investment research sources using Tavily.',
  schema: z.object({
    query: z.string().min(1).describe('Research search query'),
    maxResults: z.number().int().min(1).max(10).default(8),
  }),
  func: async ({ query, maxResults }) => {
    const data = await tavilyService.search(query, { maxResults });

    return JSON.stringify({
      success: true,
      tool: 'tavily_tool',
      input: { query, maxResults },
      data: {
        answer: data.answer || null,
        results: Array.isArray(data.results) ? data.results : [],
      },
      meta: {
        resultCount: Array.isArray(data.results) ? data.results.length : 0,
      },
    });
  },
});

module.exports = tavilyTool;
