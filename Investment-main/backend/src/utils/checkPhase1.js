const env = require('../config/env');
const connectDatabase = require('../config/database');
const mongoose = require('mongoose');

async function runCheck() {
  console.log('=== PHASE 1: ENVIRONMENT & API VERIFICATION ===');
  
  const checks = {
    MONGODB_URI: !!env.MONGODB_URI,
    JWT_SECRET: !!env.JWT_SECRET && env.JWT_SECRET !== 'default_super_secret_jwt_key_32_characters_long_min',
    GEMINI_API_KEY: !!env.GEMINI_API_KEY,
    FINNHUB_API_KEY: !!env.FINNHUB_API_KEY,
    NEWS_API_KEY: !!env.NEWS_API_KEY,
    TAVILY_API_KEY: !!env.TAVILY_API_KEY,
    GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
    TURNSTILE_SECRET_KEY: !!env.TURNSTILE_SECRET_KEY
  };

  console.table(checks);

  const missing = Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    process.exit(1);
  }

  console.log('✅ Environment variables validated.');

  try {
    await connectDatabase();
    console.log('✅ MongoDB Connected successfully.');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ MongoDB Connection failed:', err.message);
    process.exit(1);
  }

  console.log('=== PHASE 1 VERIFICATION PASSED ===');
  process.exit(0);
}

runCheck();
