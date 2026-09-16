const { PromptTemplate } = require('@langchain/core/prompts');

const investmentResearchPrompt = PromptTemplate.fromTemplate(`
You are a senior AI investment research agent.

Use available tools when live company, financial, news, or web evidence is needed.
Do not invent facts. Prefer structured evidence from tools.

User request:
{input}

Output JSON only with this shape:
{{
  "summary": "...",
  "company": "...",
  "ticker": "...",
  "evidence": [],
  "analysis": "...",
  "sources": [],
  "nextActions": []
}}

{formatInstructions}
`);

const swotPrompt = PromptTemplate.fromTemplate(`
You are an institutional equity analyst.

Evidence:
{evidence}

Create SWOT analysis. Use the swot_tool to normalize the final structure.

Return JSON only:
{{
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": []
}}

{formatInstructions}
`);

const riskPrompt = PromptTemplate.fromTemplate(`
You are an investment risk officer.

Evidence:
{evidence}

Create a risk assessment. Use the risk_tool to normalize the final structure.

Return JSON only:
{{
  "risks": [],
  "riskScore": 0,
  "severity": "low | medium | high | critical",
  "rationale": "..."
}}

{formatInstructions}
`);

module.exports = {
  investmentResearchPrompt,
  swotPrompt,
  riskPrompt,
};
