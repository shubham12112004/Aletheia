const { newsTool, tavilyTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { newsAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'News Agent',
  prompt: newsAgentPrompt,
  tools: [newsTool, tavilyTool],
  fallback: {
    latestNews: {},
    webSearch: {},
    sources: [],
    summary: '',
    notableEvents: [],
  },
});
