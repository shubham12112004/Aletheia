const { BaseOutputParser } = require('@langchain/core/output_parsers');

class JsonOutputParser extends BaseOutputParser {
  lc_namespace = ['ai-investment', 'outputParsers'];

  constructor(fallback = {}) {
    super();
    this.fallback = fallback;
  }

  async parse(text) {
    if (typeof text !== 'string') return text || this.fallback;

    const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fencedJson ? fencedJson[1] : text;

    try {
      return JSON.parse(candidate);
    } catch (_error) {
      return {
        ...this.fallback,
        raw: text,
        parseError: true,
      };
    }
  }

  getFormatInstructions() {
    return 'Return valid JSON only. Do not wrap the response in Markdown.';
  }
}

module.exports = JsonOutputParser;
