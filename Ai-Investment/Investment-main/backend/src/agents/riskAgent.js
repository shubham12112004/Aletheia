const { riskTool, swotTool } = require('../langchain/tools');
const { createAgent } = require('./agentRunner');
const { riskAgentPrompt } = require('./prompts');

module.exports = createAgent({
  name: 'Risk Agent',
  prompt: riskAgentPrompt,
  tools: [swotTool, riskTool],
  fallback: {
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    risk: {
      risks: [],
      riskScore: 50,
      severity: 'medium',
      rationale: '',
    },
  },
});
