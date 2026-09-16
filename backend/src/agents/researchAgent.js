const { researchTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { researchAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'Research Agent',
  prompt: researchAgentPrompt,
  tools: [researchTool],
  fallback: {
    sentiment: {
      positive: 0,
      neutral: 0,
      negative: 0,
      summary: '',
      signals: [],
    },
    researchSummary: '',
    investmentThemes: [],
    evidenceGaps: [],
  },
});
