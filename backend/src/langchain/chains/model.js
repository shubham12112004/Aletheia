const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const env = require('../../config/env');

function createGeminiModel(options = {}) {
  return new ChatGoogleGenerativeAI({
    apiKey: env.GEMINI_API_KEY,
    model: options.model || env.GEMINI_MODEL,
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens ?? 2048,
  });
}

module.exports = {
  createGeminiModel,
};
