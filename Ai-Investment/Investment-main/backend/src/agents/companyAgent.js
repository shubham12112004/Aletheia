const { companyTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { companyAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'Company Agent',
  prompt: companyAgentPrompt,
  tools: [companyTool],
  fallback: {
    company: '',
    ticker: '',
    exchange: '',
    currency: '',
    confidence: 0,
    matches: [],
    notes: [],
  },
});
