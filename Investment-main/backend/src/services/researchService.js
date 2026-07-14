const integration = require("./integrationService");

/**
 * Executes the complete investment research pipeline.
 */
exports.executeResearch = async (
  company,
  scenarioId,
  focusOptions = {}
) => {
  try {
    console.log("--------------------------------");
    console.log("Starting Research");
    console.log("Company:", company);
    console.log("--------------------------------");

    // ============================================================
    // STEP 1 : Resolve Company Name -> Stock Symbol
    // ============================================================

    const searchResult = await integration.searchCompany(company);

    if (!searchResult) {
      throw new Error(`Company "${company}" not found.`);
    }

    const symbol = searchResult.symbol;

    console.log("Resolved Symbol:", symbol);

    // ============================================================
    // STEP 2 : Load Company Profile
    // ============================================================

    const profile = await integration.getCompanyProfile(symbol);

    console.log("Company Profile Loaded");

    // ============================================================
    // STEP 3 : Fetch Parallel Data
    // ============================================================

    const [quote, financials, news, web] = await Promise.all([
      integration.getQuote(symbol),
      integration.getBasicFinancials(symbol),

      // News works better using company name
      integration.getCompanyNews(company),

      // Tavily also works better using company name
      integration.tavilySearch(company),
    ]);

    console.log("Quote Loaded");
    console.log("Financials Loaded");
    console.log("News Loaded");
    console.log("Web Research Loaded");

    // ============================================================
    // STEP 4 : Generate AI Report
    // ============================================================

    const report = await integration.generateGroqReport({
      profile,
      quote,
      financials,
      news,
      web,
    });

    console.log("Groq Report Generated");

    // ============================================================
    // STEP 5 : Return Everything
    // ============================================================

    return {
      company,
      symbol,

      profile,

      quote,

      financials,

      metrics: financials?.metric || {},

      news,

      report,
    };
  } catch (error) {
    console.error("Research Pipeline Failed");
    console.error(error);

    throw error;
  }
};