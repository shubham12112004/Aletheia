const { financialTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { financialAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'Financial Agent',
  prompt: financialAgentPrompt,
  tools: [financialTool],
  fallback: {
    profile: {},
    statements: {},
    metrics: {},
    summary: '',
    keySignals: [],
    warnings: [],
  },
});
