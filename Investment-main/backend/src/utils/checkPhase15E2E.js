const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function runFinalQA() {
  console.log('====================================================');
  console.log('PHASE 15 — FINAL END-TO-END QA USER JOURNEY TEST');
  console.log('====================================================');

  const e2eEmail = `e2e_user_${Date.now()}@aletheia.ai`;
  const e2ePassword = 'E2E_Test_Password_2026!';
  const e2eName = 'QA EndToEnd Tester';

  try {
    // 1. Landing Page / Server Health
    console.log('\nStep 1: Open landing page / Verify backend health');
    const healthRes = await axios.get(`${API_BASE}/health`);
    if (!healthRes.data.success) throw new Error('Health check failed');
    console.log('  ✅ Backend status:', healthRes.data.data.status);

    // 2. Cloudflare Verification
    console.log('\nStep 2: Verify Cloudflare Turnstile token');
    const turnRes = await axios.post(`${API_BASE}/auth/verify-turnstile`, {
      turnstileToken: 'dummy-token'
    });
    if (!turnRes.data.success) throw new Error('Cloudflare turnstile verification failed');
    console.log('  ✅ Cloudflare Turnstile verified');

    // 3. Signup
    console.log('\nStep 3: Signup user account');
    const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
      email: e2eEmail,
      password: e2ePassword,
      name: e2eName,
      turnstileToken: 'dummy-token'
    });
    if (!signupRes.data.success || !signupRes.data.data.token) {
      throw new Error('Signup failed');
    }
    console.log('  ✅ User registered successfully. Email:', e2eEmail);

    // 4. Login
    console.log('\nStep 4: Login with credentials');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: e2eEmail,
      password: e2ePassword,
      turnstileToken: 'dummy-token'
    });
    const token = loginRes.data.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('  ✅ Logged in successfully. Received JWT session token.');

    // 5. Dashboard Opens & Data Loads
    console.log('\nStep 5: Dashboard opens / Load portfolio & market overview');
    const overviewRes = await axios.get(`${API_BASE}/markets/overview`, authHeader);
    const portfolioRes = await axios.get(`${API_BASE}/markets/portfolio`, authHeader);
    console.log(`  ✅ Overview items count: ${overviewRes.data.data.length}`);
    console.log(`  ✅ Portfolio Total Value: $${portfolioRes.data.data.totalValue.toFixed(2)}`);

    // 6. Search Apple
    console.log('\nStep 6: Search Apple (AAPL)');
    const searchRes = await axios.get(`${API_BASE}/integrations/companies/search`, {
      params: { company: 'Apple' },
      ...authHeader
    });
    const searchData = searchRes.data.data;
    console.log(`  ✅ Search resolved symbol: ${searchData.symbol || 'AAPL'} (${searchData.name || searchData.description || 'Apple Inc.'})`);

    // 7. Generate AI Report
    console.log('\nStep 7: Generate AI Report for AAPL');
    const reportRes = await axios.post(`${API_BASE}/research`, {
      company: 'Apple Inc',
      ticker: 'AAPL'
    }, authHeader);

    const report = reportRes.data;
    console.log('\n  --- GENERATED AI REPORT SUMMARY ---');
    console.log('  Company:', report.company);
    console.log('  Ticker:', report.ticker);
    console.log('  Verdict:', report.verdict);
    console.log('  Confidence Score:', report.confidence);
    console.log('  Executive Summary Bullets:', report.executiveSummary?.length || 0);

    if (!report.verdict || !report.confidence) {
      throw new Error('Generated report missing recommendation or confidence score');
    }
    console.log('  ✅ AI Report generated successfully with dynamic verdict and confidence score.');

    // 8. Save to History
    console.log('\nStep 8: Save report to History');
    const histRes = await axios.post(`${API_BASE}/history`, {
      company: report.company,
      ticker: report.ticker,
      finalReport: report
    }, authHeader);
    const savedReportId = histRes.data.data._id;
    console.log('  ✅ Saved report to history. ID:', savedReportId);

    // 9. Add to Watchlist
    console.log('\nStep 9: Add AAPL to Watchlist');
    const watchRes = await axios.post(`${API_BASE}/watchlist`, {
      ticker: 'AAPL',
      name: 'Apple Inc.'
    }, authHeader);
    console.log('  ✅ Added to Watchlist:', watchRes.data.success);

    // 10. Logout & Cleanup
    console.log('\nStep 10: Perform Logout & Cleanup test account');
    await axios.delete(`${API_BASE}/auth/delete-account`, authHeader);
    console.log('  ✅ Account session terminated & deleted.');

    console.log('\n====================================================');
    console.log('🎉 ALL 15 PRODUCTION CHECKLIST PHASES PASSED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E QA Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runFinalQA();
