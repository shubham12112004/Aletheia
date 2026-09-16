const {
  createInvestmentResearchChain,
  createRiskChain,
  createSwotChain,
} = require('../langchain/chains');

async function generateContent(prompt, options = {}) {
  const chain = createInvestmentResearchChain();
  return chain.invoke({
    input: prompt,
    ...options,
  });
}

async function generateSwot(evidence) {
  const chain = createSwotChain();
  return chain.invoke({ evidence: JSON.stringify(evidence) });
}

async function generateRiskAssessment(evidence) {
  const chain = createRiskChain();
  return chain.invoke({ evidence: JSON.stringify(evidence) });
}

module.exports = {
  generateContent,
  generateSwot,
  generateRiskAssessment,
};
