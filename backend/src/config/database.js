const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });
    logger.info('MongoDB connected to primary URI');
  } catch (err) {
    logger.warn('Primary MongoDB URI failed: ' + err.message + '. Attempting fallback to local MongoDB...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/ai-investment', { serverSelectionTimeoutMS: 4000 });
      logger.info('MongoDB connected to local instance (mongodb://127.0.0.1:27017/ai-investment)');
    } catch (fallbackErr) {
      logger.error('All MongoDB connection attempts failed: ' + fallbackErr.message);
    }
  }
}

module.exports = connectDatabase;

