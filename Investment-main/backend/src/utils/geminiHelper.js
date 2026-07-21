const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

/**
  * Executes a Gemini API call with model fallback and error handling.
  */
async function generateWithFallback({ prompt, systemInstruction, schema, apiKey, timeoutMs = 25000 }) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
  
  if (!effectiveKey) {
    throw new Error("Missing GEMINI_API_KEY in backend environment.");
  }

  const genAI = new GoogleGenerativeAI(effectiveKey);
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[GeminiHelper] Attempting request using model '${modelName}'...`);
      
      const modelOptions = { model: modelName };
      if (systemInstruction) modelOptions.systemInstruction = systemInstruction;
      
      if (schema) {
        modelOptions.generationConfig = {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.2
        };
      }

      const model = genAI.getGenerativeModel(modelOptions);

      // Timeout wrapper
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini request timeout after ${timeoutMs}ms`)), timeoutMs)
      );

      const responsePromise = model.generateContent(prompt);
      const result = await Promise.race([responsePromise, timeoutPromise]);

      const text = result.response.text().trim();
      if (!text) throw new Error("Gemini returned empty text.");

      console.log(`[GeminiHelper] Successfully generated response using model '${modelName}'`);
      return text;

    } catch (err) {
      console.warn(`[GeminiHelper] Model '${modelName}' failed:`, err.message);
      lastError = err;

      // If it's a 403 Forbidden (Invalid API Key), breaking retry early is appropriate
      if (err.message && err.message.includes("403 Forbidden")) {
        throw new Error("403 Forbidden: Invalid or expired GEMINI_API_KEY.");
      }

      // Continue loop for 404 or model unavailable errors
    }
  }

  throw lastError || new Error("All candidate Gemini models failed.");
}

module.exports = {
  generateWithFallback,
  CANDIDATE_MODELS
};
