const integrationService = require('../services/integrationService');

async function testPhase5to8() {
  console.log('=== PHASES 5-8: MARKET DATA, SEARCH, GEMINI & REPORT GENERATION TEST ===');

  const tickers = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'NVDA', 'META'];

  // Phase 5 & 6: Search & Market Data Verification
  console.log('\n--- Phase 5 & 6: Market Data & Search Verification ---');
  for (const t of tickers) {
    console.log(`Fetching quote & profile for ${t}...`);
    const quote = await integrationService.getQuote(t);
    const profile = await integrationService.getCompanyProfile(t);

    if (!quote || quote.c === undefined) {
      console.warn(`⚠️ Warning: Live quote for ${t} returned empty or missing price.`);
    } else {
      console.log(`  ✅ ${t}: Price = $${quote.c}, Change = ${quote.dp?.toFixed(2)}%, Name = "${profile.name}"`);
    }
  }

  // Phase 6: Company Search Autocomplete Test
  console.log('\n--- Phase 6: Autocomplete Search Verification ---');
  const searchRes = await integrationService.searchCompany('Apple');
  if (!searchRes || !searchRes.symbol) {
    throw new Error('Company search for "Apple" failed');
  }
  console.log(`  ✅ Search "Apple" resolved to symbol: ${searchRes.symbol} (${searchRes.description})`);

  // Phase 7 & 8: Gemini LLM Report Generation
  console.log('\n--- Phase 7 & 8: Gemini Report Generation Verification ---');
  console.log('Generating dynamic AI Investment Report for AAPL...');

  const appleProfile = await integrationService.getCompanyProfile('AAPL');
  const appleQuote = await integrationService.getQuote('AAPL');
  const appleFinancials = await integrationService.getBasicFinancials('AAPL');
  const appleNews = await integrationService.getCompanyNews('Apple');
  const appleWeb = await integrationService.tavilySearch('Apple');

  const report = await integrationService.generateGroqReport({
    profile: appleProfile,
    quote: appleQuote,
    financials: appleFinancials,
    news: appleNews,
    web: appleWeb
  });

  console.log('\n=== GENERATED REPORT METRICS ===');
  console.log('Company:', report.company);
  console.log('Ticker:', report.ticker);
  console.log('Verdict:', report.verdict);
  console.log('Confidence Score:', report.confidence);
  console.log('Executive Summary Items:', report.executiveSummary?.length || 0);
  console.log('SWOT Analysis Present:', !!report.swot);
  console.log('Competitors Count:', report.competitors?.length || 0);
  console.log('Bull Case Count:', report.bullCase?.length || 0);
  console.log('Bear Case Count:', report.bearCase?.length || 0);

  if (!report.verdict || !['BUY', 'HOLD', 'SELL'].includes(report.verdict)) {
    throw new Error('Report verdict is invalid or missing');
  }

  if (typeof report.confidence !== 'number' || report.confidence < 1 || report.confidence > 100) {
    throw new Error('Report confidence score is invalid or out of range');
  }

  console.log('✅ Gemini LLM report generation successfully verified with dynamic recommendation & confidence!');
  console.log('=== PHASES 5-8 VERIFICATION PASSED ===');
  process.exit(0);
}

testPhase5to8().catch(err => {
  console.error('❌ Phases 5-8 test failed:', err);
  process.exit(1);
});
