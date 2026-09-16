const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticker: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

// Prevent duplicate watchlist items per user
WatchlistSchema.index({ userId: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
