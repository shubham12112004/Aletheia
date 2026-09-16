const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

const recommendationSchema = z.object({
  verdict: z.enum(['INVEST', 'HOLD', 'AVOID']).default('HOLD'),
  confidence: z.number().min(0).max(100).default(0),
  recommendation: z.string().default(''),
  rationale: z.array(z.string()).default([]),
  watchItems: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
});

const recommendationTool = new DynamicStructuredTool({
  name: 'recommendation_tool',
  description: 'Normalize final investment recommendation into structured JSON.',
  schema: recommendationSchema,
  func: async (input) => {
    const parsed = recommendationSchema.parse(input);

    return JSON.stringify({
      success: true,
      tool: 'recommendation_tool',
      input: parsed,
      data: parsed,
      meta: {
        rationaleCount: parsed.rationale.length,
        watchItemCount: parsed.watchItems.length,
        sourceCount: parsed.sources.length,
      },
    });
  },
});

module.exports = recommendationTool;
