const { DynamicStructuredTool } = require('@langchain/core/tools');
const { z } = require('zod');

const researchSchema = z.object({
  sentiment: z.object({
    positive: z.number().min(0).default(0),
    neutral: z.number().min(0).default(0),
    negative: z.number().min(0).default(0),
    summary: z.string().default(''),
    signals: z.array(z.string()).default([]),
  }),
  researchSummary: z.string().default(''),
  investmentThemes: z.array(z.string()).default([]),
  evidenceGaps: z.array(z.string()).default([]),
});

const researchTool = new DynamicStructuredTool({
  name: 'research_tool',
  description: 'Normalize research synthesis and sentiment analysis into structured JSON.',
  schema: researchSchema,
  func: async (input) => {
    const parsed = researchSchema.parse(input);

    return JSON.stringify({
      success: true,
      tool: 'research_tool',
      input: parsed,
      data: parsed,
      meta: {
        themeCount: parsed.investmentThemes.length,
        evidenceGapCount: parsed.evidenceGaps.length,
      },
    });
  },
});

module.exports = researchTool;
