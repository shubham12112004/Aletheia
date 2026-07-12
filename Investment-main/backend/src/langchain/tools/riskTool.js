const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

const riskSchema = z.object({
  risks: z.array(z.string()).default([]),
  riskScore: z.number().min(0).max(100),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  rationale: z.string().min(1),
});

const riskTool = new DynamicStructuredTool({
  name: 'risk_tool',
  description: 'Normalize investment risk assessment into a structured JSON object.',
  schema: riskSchema,
  func: async (input) => {
    const parsed = riskSchema.parse(input);

    return JSON.stringify({
      success: true,
      tool: 'risk_tool',
      input: parsed,
      data: parsed,
      meta: {
        riskCount: parsed.risks.length,
      },
    });
  },
});

module.exports = riskTool;
