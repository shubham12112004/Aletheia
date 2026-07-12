const { recommendationTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { recommendationAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'Recommendation Agent',
  prompt: recommendationAgentPrompt,
  tools: [recommendationTool],
  fallback: {
    verdict: 'HOLD',
    confidence: 0,
    recommendation: '',
    rationale: [],
    watchItems: [],
    sources: [],
  },
});
