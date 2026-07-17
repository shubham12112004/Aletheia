const { z } = require('zod');
const Watchlist = require('../models/Watchlist');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const addWatchlistSchema = z.object({
  ticker: z.string().min(1).toUpperCase(),
  name: z.string().min(1)
});

const getWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const items = await Watchlist.find({ userId }).sort({ createdAt: -1 }).lean();
  return success(res, items, 'Watchlist fetched successfully');
});

const addToWatchlist = asyncHandler(async (req, res) => {
  const { ticker, name } = addWatchlistSchema.parse(req.body);
  const userId = req.user.sub;

  const existing = await Watchlist.findOne({ userId, ticker });
  if (existing) {
    throw new AppError('Asset is already in your watchlist.', 400);
  }

  const item = await Watchlist.create({
    userId,
    ticker,
    name
  });

  return success(res, item, 'Added to watchlist successfully');
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  const { ticker } = req.params;
  const userId = req.user.sub;

  const deleted = await Watchlist.findOneAndDelete({ userId, ticker: ticker.toUpperCase() });
  if (!deleted) {
    throw new AppError('Watchlist item not found.', 404);
  }

  return success(res, null, 'Removed from watchlist successfully');
});

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
