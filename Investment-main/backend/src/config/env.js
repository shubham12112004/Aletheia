const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.string().default("http://localhost:5173"),

  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/ai-investment"),

  JWT_SECRET: z
    .string()
    .default("default_super_secret_jwt_key_32_characters_long_min"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  GOOGLE_CLIENT_ID: z.string().optional().default(""),

  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  TURNSTILE_SECRET_KEY: z.string().optional().default(""),

  GROQ_API_KEY: z.string().optional().default(""),

  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),

  TAVILY_API_KEY: z.string().optional().default(""),

  FINNHUB_API_KEY: z.string().optional().default(""),

  NEWS_API_KEY: z.string().optional().default(""),

  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM: z.string().optional().default(""),
  RESEND_TO_OVERRIDE: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn("Environment schema warnings:", parsed.error.issues);
}

module.exports = parsed.data || {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-investment",
  JWT_SECRET: process.env.JWT_SECRET || "default_super_secret_jwt_key_32_characters_long_min",
  JWT_EXPIRES_IN: "7d"
};