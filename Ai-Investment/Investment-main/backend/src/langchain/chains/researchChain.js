const { RunnableSequence } = require('@langchain/core/runnables');
const { JsonOutputParser } = require('../outputParsers');
const { investmentResearchPrompt, riskPrompt, swotPrompt } = require('../prompts');
const { researchTools, swotTool, riskTool } = require('../tools');
const { createGeminiModel } = require('./model');

function createToolCallingChain({ prompt, tools, fallback, modelOptions } = {}) {
  const parser = new JsonOutputParser(fallback);
  const model = createGeminiModel(modelOptions).bindTools(tools);

  return RunnableSequence.from([
    async (input) => ({
      ...input,
      formatInstructions: parser.getFormatInstructions(),
    }),
    prompt,
    model,
    parser,
  ]);
}

function createInvestmentResearchChain() {
  return createToolCallingChain({
    prompt: investmentResearchPrompt,
    tools: researchTools,
    fallback: {
      summary: '',
      company: '',
      ticker: '',
      evidence: [],
      analysis: '',
      sources: [],
      nextActions: [],
    },
  });
}

function createSwotChain() {
  return createToolCallingChain({
    prompt: swotPrompt,
    tools: [swotTool],
    fallback: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
  });
}

function createRiskChain() {
  return createToolCallingChain({
    prompt: riskPrompt,
    tools: [riskTool],
    fallback: {
      risks: [],
      riskScore: 50,
      severity: 'medium',
      rationale: '',
    },
  });
}

module.exports = {
  createInvestmentResearchChain,
  createSwotChain,
  createRiskChain,
};
