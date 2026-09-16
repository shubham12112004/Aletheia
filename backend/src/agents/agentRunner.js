const { RunnableSequence } = require('@langchain/core/runnables');
const { JsonOutputParser } = require('../langchain/outputParsers');
const { createGeminiModel } = require('../langchain/chains/model');

function createAgent({ name, prompt, tools, fallback, modelOptions }) {
  const parser = new JsonOutputParser(fallback);
  const model = createGeminiModel(modelOptions).bindTools(tools);

  const chain = RunnableSequence.from([
    async (input) => ({
      ...input,
      agentName: name,
      formatInstructions: parser.getFormatInstructions(),
    }),
    prompt,
    model,
    parser,
  ]);

  return {
    name,
    tools,
    run: (input) => chain.invoke(input),
  };
}

module.exports = {
  createAgent,
};
