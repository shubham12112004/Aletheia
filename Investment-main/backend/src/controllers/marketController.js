const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const integration = require("../services/integrationService");
const Watchlist = require("../models/Watchlist");

// Helper to wait
const delay = (ms) => new Promise(res => setTimeout(res, ms));

exports.getOverview = asyncHandler(async (req, res) => {
    // S&P 500, NASDAQ, Dow Jones proxies (SPY, QQQ, DIA)
    const indices = ["SPY", "QQQ", "DIA"];
    const results = [];

    for (const ticker of indices) {
        try {
            const quote = await integration.getQuote(ticker);
            const profile = await integration.getCompanyProfile(ticker);
            results.push({
                ticker,
                name: profile.name || ticker,
                price: quote.c || 0,
                change: quote.d || 0,
                changePercent: quote.dp || 0,
            });
            await delay(100); // Rate limit protection
        } catch (e) {
            console.error("Market overview error for", ticker, e.message);
        }
    }

    return success(res, results, "Market overview retrieved");
});

exports.getScreener = asyncHandler(async (req, res) => {
    // Trending tech stocks for screener demo
    const trending = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA"];
    const results = [];

    for (const ticker of trending) {
        try {
            const quote = await integration.getQuote(ticker);
            const financials = await integration.getBasicFinancials(ticker);
            const metrics = financials?.metric || {};
            
            results.push({
                ticker,
                price: quote.c || 0,
                changePercent: quote.dp || 0,
                volume: quote.v || 0,
                peRatio: metrics.peTTM || 0,
                marketCap: metrics.marketCapitalization || 0,
                dividendYield: metrics.dividendYieldIndicatedAnnual || 0,
            });
            await delay(100); // Rate limit protection
        } catch (e) {
            console.error("Screener error for", ticker, e.message);
        }
    }

    return success(res, results, "Screener data retrieved");
});

exports.getPortfolio = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const watchlist = await Watchlist.find({ userId });
    
    // Simulate a portfolio based on watchlist items
    // If watchlist is empty, use a default fallback to show some data
    const holdings = watchlist.length > 0 ? watchlist.map(w => w.ticker) : ["AAPL", "MSFT"];
    let totalValue = 0;
    let totalDailyChange = 0;
    const assets = [];

    for (const ticker of holdings) {
        try {
            const quote = await integration.getQuote(ticker);
            const profile = await integration.getCompanyProfile(ticker);
            
            // Give them a simulated 100 shares of everything they watch
            const shares = 100;
            const value = (quote.c || 0) * shares;
            const dailyChange = (quote.d || 0) * shares;

            totalValue += value;
            totalDailyChange += dailyChange;

            assets.push({
                ticker,
                name: profile.name || ticker,
                shares,
                price: quote.c || 0,
                value,
                dailyChange,
                dailyChangePercent: quote.dp || 0
            });
            await delay(100); // Rate limit protection
        } catch (e) {
            console.error("Portfolio error for", ticker, e.message);
        }
    }

    const portfolioData = {
        totalValue,
        totalDailyChange,
        totalDailyChangePercent: totalValue > 0 ? (totalDailyChange / (totalValue - totalDailyChange)) * 100 : 0,
        assets
    };

    return success(res, portfolioData, "Simulated portfolio retrieved");
});
