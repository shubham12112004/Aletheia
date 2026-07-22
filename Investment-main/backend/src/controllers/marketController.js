const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const integration = require("../services/integrationService");
const Watchlist = require("../models/Watchlist");

// Helper to wait
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
    const item = cache.get(key);
    if (item && Date.now() - item.timestamp < CACHE_TTL) return item.data;
    return null;
};
const setCachedData = (key, data) => cache.set(key, { timestamp: Date.now(), data });

exports.getOverview = asyncHandler(async (req, res) => {
    const cacheKey = 'market_overview';
    const cached = getCachedData(cacheKey);
    if (cached) return success(res, cached, "Market overview retrieved (cached)");

    const indices = ["SPY", "QQQ", "DIA"];
    const results = await Promise.all(
        indices.map(async (ticker) => {
            try {
                const [quote, profile] = await Promise.all([
                    integration.getQuote(ticker),
                    integration.getCompanyProfile(ticker)
                ]);
                return {
                    ticker,
                    name: profile.name || ticker,
                    price: quote.c || 0,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                };
            } catch (e) {
                console.error("Market overview error for", ticker, e.message);
                return { ticker, name: ticker, price: 0, change: 0, changePercent: 0 };
            }
        })
    );

    setCachedData(cacheKey, results);
    return success(res, results, "Market overview retrieved");
});

exports.getScreener = asyncHandler(async (req, res) => {
    const cacheKey = 'market_screener';
    const cached = getCachedData(cacheKey);
    if (cached) return success(res, cached, "Screener data retrieved (cached)");

    const trending = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA"];
    const results = await Promise.all(
        trending.map(async (ticker) => {
            try {
                const [quote, financials] = await Promise.all([
                    integration.getQuote(ticker),
                    integration.getBasicFinancials(ticker)
                ]);
                const metrics = financials?.metric || {};
                return {
                    ticker,
                    price: quote.c || 0,
                    changePercent: quote.dp || 0,
                    volume: quote.v || 0,
                    peRatio: metrics.peTTM || 0,
                    marketCap: metrics.marketCapitalization || 0,
                    dividendYield: metrics.dividendYieldIndicatedAnnual || 0,
                };
            } catch (e) {
                console.error("Screener error for", ticker, e.message);
                return { ticker, price: 0, changePercent: 0, volume: 0, peRatio: 0, marketCap: 0, dividendYield: 0 };
            }
        })
    );

    setCachedData(cacheKey, results);
    return success(res, results, "Screener data retrieved");
});

exports.getPortfolio = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const watchlist = await Watchlist.find({ userId });
    
    const holdings = watchlist.length > 0 ? watchlist.map(w => w.ticker) : ["AAPL", "MSFT"];
    const cacheKey = `portfolio_${holdings.sort().join('_')}`;
    const cached = getCachedData(cacheKey);
    if (cached) return success(res, cached, "Simulated portfolio retrieved (cached)");

    let totalValue = 0;
    let totalDailyChange = 0;

    const assets = await Promise.all(
        holdings.map(async (ticker) => {
            try {
                const [quote, profile] = await Promise.all([
                    integration.getQuote(ticker),
                    integration.getCompanyProfile(ticker)
                ]);
                const shares = 100;
                const value = (quote.c || 0) * shares;
                const dailyChange = (quote.d || 0) * shares;

                return {
                    ticker,
                    name: profile.name || ticker,
                    shares,
                    price: quote.c || 0,
                    value,
                    dailyChange,
                    dailyChangePercent: quote.dp || 0
                };
            } catch (e) {
                console.error("Portfolio error for", ticker, e.message);
                return null;
            }
        })
    );

    const validAssets = assets.filter(Boolean);
    for (const a of validAssets) {
        totalValue += a.value;
        totalDailyChange += a.dailyChange;
    }

    const portfolioData = {
        totalValue,
        totalDailyChange,
        totalDailyChangePercent: totalValue > 0 ? (totalDailyChange / (totalValue - totalDailyChange)) * 100 : 0,
        assets: validAssets
    };

    setCachedData(cacheKey, portfolioData);
    return success(res, portfolioData, "Simulated portfolio retrieved");
});
