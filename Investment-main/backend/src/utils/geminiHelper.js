const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const env = require('../config/env');

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGroqFallback(prompt, schema) {
  const groqKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY;
  if (!groqKey) return null;

  console.log('[GeminiHelper] Attempting Groq API fallback (llama-3.3-70b-versatile)...');
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a CFA investment analyst. Return valid JSON only adhering strictly to the requested structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      console.log('[GeminiHelper] Groq API fallback succeeded.');
      return content.trim();
    }
  } catch (err) {
    console.warn('[GeminiHelper] Groq fallback failed:', err.response?.data || err.message);
  }
  return null;
}

/**
 * Executes a Gemini API call with model fallback, rate limit retries, and Groq fallback.
 */
async function generateWithFallback({ prompt, systemInstruction, schema, apiKey, timeoutMs = 25000 }) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
  
  if (effectiveKey) {
    const genAI = new GoogleGenerativeAI(effectiveKey);

    for (const modelName of CANDIDATE_MODELS) {
      let retries = 2;
      while (retries >= 0) {
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
          const errMsg = err.message || '';
          console.warn(`[GeminiHelper] Model '${modelName}' error:`, errMsg);

          if (errMsg.includes("403 Forbidden")) {
            break; // Try next or Groq fallback
          }

          if (errMsg.includes("429 Too Many Requests") || errMsg.includes("Quota exceeded")) {
            if (retries > 0) {
              console.log(`[GeminiHelper] 429 Rate limit hit. Waiting 4s before retry... (${retries} retries remaining)`);
              await sleep(4000);
              retries--;
              continue;
            }
          }

          break; // Move to next model
        }
      }
    }
  }

  // Fallback to Groq API
  const groqResult = await callGroqFallback(prompt, schema);
  if (groqResult) return groqResult;

  throw new Error("All Gemini models and Groq fallback failed.");
}

module.exports = {
  generateWithFallback,
  CANDIDATE_MODELS
};

