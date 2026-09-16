const companyTool = require('./companyTool');
const financialTool = require('./financialTool');
const newsTool = require('./newsTool');
const tavilyTool = require('./tavilyTool');
const swotTool = require('./swotTool');
const riskTool = require('./riskTool');
const researchTool = require('./researchTool');
const recommendationTool = require('./recommendationTool');

const researchTools = [
  companyTool,
  financialTool,
  newsTool,
  tavilyTool,
  swotTool,
  riskTool,
  researchTool,
  recommendationTool,
];

module.exports = {
  companyTool,
  financialTool,
  newsTool,
  tavilyTool,
  swotTool,
  riskTool,
  researchTool,
  recommendationTool,
  researchTools,
};
