const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

const swotSchema = z.object({
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  threats: z.array(z.string()).default([]),
});

const swotTool = new DynamicStructuredTool({
  name: 'swot_tool',
  description: 'Normalize SWOT analysis into a structured JSON object.',
  schema: swotSchema,
  func: async (input) => {
    const parsed = swotSchema.parse(input);

    return JSON.stringify({
      success: true,
      tool: 'swot_tool',
      input: parsed,
      data: parsed,
      meta: {
        strengthCount: parsed.strengths.length,
        weaknessCount: parsed.weaknesses.length,
        opportunityCount: parsed.opportunities.length,
        threatCount: parsed.threats.length,
      },
    });
  },
});

module.exports = swotTool;
