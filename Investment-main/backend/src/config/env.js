const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.string().url(),

  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "GOOGLE_CLIENT_ID is required"),

  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z
    .string()
    .min(1, "TURNSTILE_SECRET_KEY is required"),

  // GROQ
  GROQ_API_KEY: z
    .string()
    .min(1, "GROQ_API_KEY is required"),

  GROQ_MODEL: z
    .string()
    .default("llama-3.3-70b-versatile"),

  // Tavily
  TAVILY_API_KEY: z
    .string()
    .min(1, "TAVILY_API_KEY is required"),

  // Finnhub
  FINNHUB_API_KEY: z
    .string()
    .min(1, "FINNHUB_API_KEY is required"),

  // News API
  NEWS_API_KEY: z
    .string()
    .min(1, "NEWS_API_KEY is required"),

  // Resend (Password reset emails)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),
  RESEND_TO_OVERRIDE: z.string().optional(),
});


const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`
  );

  throw new Error(
    `Invalid environment configuration:\n${errors.join("\n")}`
  );
}

module.exports = parsed.data;