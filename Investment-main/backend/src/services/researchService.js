const integration = require('./integrationService');

/**
 * Executes the core company research orchestration pipeline.
 * Fetches structured financial metrics, real-time pricing data, recent news indexing records,
 * and deep web research queries in parallel before feeding the unified context to Groq.
 */
exports.executeResearch = async (company, scenarioId, focusOptions = {}) => {
    try {
        // Step 1: Retrieve structural profile coordinates to safely extract the public ticker asset
        const profile = await integration.getCompanyProfile(company);
        
        // Use the profile's ticker abbreviation if available, otherwise fall back to the raw search parameter
        const symbol = profile.ticker || company;

        console.log(`Orchestrating parallel metrics ingestion for symbol: ${symbol}`);

        // Step 2: Concurrently pull real-time pricing quote, basic financials, news, and external web intelligence
        const [quote, financials, news, web] = await Promise.all([
            integration.getQuote(symbol),
            integration.getBasicFinancials(symbol),
            integration.getCompanyNews(company),
            integration.tavilySearch(company),
        ]);

        console.log("Ingestion complete. Dispatching enriched financial context matrix to Groq LLM engine.");

        // Step 3: Call the report generator with the expanded financial data attributes
        const report = await integration.generateGroqReport({
            profile,
            quote,
            financials,
            news,
            web,
        });

        // Step 4: Return the structured document layer mapping payload to directly update the client views
        return {
            report,
            profile,
            quote,
            financials,
            news,
        };

    } catch (error) {
        console.error("Critical orchestration failure within researchService execution layer:", error.message);
        throw error;
    }
};