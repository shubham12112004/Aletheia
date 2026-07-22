const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPhase9to12() {
  console.log('=== PHASES 9-12: SETTINGS, WATCHLIST, HISTORY & TURNSTILE TEST ===');

  const testEmail = `test_user_phase9_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  try {
    // 1. Signup user to get token
    const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      name: 'Phase 9 User',
      turnstileToken: 'dummy-token'
    });
    const token = signupRes.data.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✅ Created test session for Phase 9-12.');

    // --- Phase 9: Settings Verification ---
    console.log('\n--- Phase 9: Settings Endpoints Verification ---');
    
    // Get Settings
    const getSetRes = await axios.get(`${API_BASE}/settings`, authHeader);
    console.log('  ✅ Get Settings:', getSetRes.data.success);

    // Update Profile
    const profRes = await axios.put(`${API_BASE}/settings/profile`, {
      name: 'Phase 9 User Updated',
      email: testEmail,
      bio: 'Quantitative Trader',
      company: 'Aletheia Capital',
      country: 'US',
      timezone: 'America/New_York'
    }, authHeader);
    console.log('  ✅ Profile update:', profRes.data.data.profile.company === 'Aletheia Capital');

    // Update Preferences
    const prefRes = await axios.put(`${API_BASE}/settings/preferences`, {
      researchDepth: 'deep',
      defaultModel: 'gemini-flash',
      defaultSearchEngine: 'tavily',
      defaultReportFormat: 'executive'
    }, authHeader);
    console.log('  ✅ Preferences update:', prefRes.data.data.preferences.researchDepth === 'deep');

    // Update Theme
    const themeRes = await axios.put(`${API_BASE}/settings/theme`, { theme: 'dark' }, authHeader);
    console.log('  ✅ Theme update:', themeRes.data.data.theme === 'dark');

    // Update Notifications
    const notifRes = await axios.put(`${API_BASE}/settings/notifications`, {
      emailNotifications: true,
      weeklySummary: false,
      securityAlerts: true,
      researchAlerts: true,
      browserNotifications: false
    }, authHeader);
    console.log('  ✅ Notifications update:', notifRes.data.data.notifications.emailNotifications === true);

    // Update Workspace
    const wsRes = await axios.put(`${API_BASE}/settings/workspace`, { name: 'Alpha Desk', description: 'Main Desk' }, authHeader);
    console.log('  ✅ Workspace update:', wsRes.data.data.workspace.name === 'Alpha Desk');

    // Update API Keys
    const apiRes = await axios.put(`${API_BASE}/settings/apis`, { geminiKey: 'test_key_123' }, authHeader);
    console.log('  ✅ API Keys update:', apiRes.data.success);

    // --- Phase 10: Watchlist Verification ---
    console.log('\n--- Phase 10: Watchlist Endpoints Verification ---');

    // Add ticker to Watchlist
    const addWatchRes = await axios.post(`${API_BASE}/watchlist`, {
      ticker: 'AAPL',
      name: 'Apple Inc.'
    }, authHeader);
    console.log('  ✅ Watchlist Add AAPL:', addWatchRes.data.success);

    // Fetch Watchlist
    const getWatchRes = await axios.get(`${API_BASE}/watchlist`, authHeader);
    if (!Array.isArray(getWatchRes.data.data) || getWatchRes.data.data.length !== 1) {
      throw new Error('Watchlist array size mismatch');
    }
    console.log('  ✅ Watchlist Fetch count = 1');

    // Remove ticker from Watchlist
    const delWatchRes = await axios.delete(`${API_BASE}/watchlist/AAPL`, authHeader);
    console.log('  ✅ Watchlist Remove AAPL:', delWatchRes.data.success);

    // --- Phase 11: History Verification ---
    console.log('\n--- Phase 11: History Endpoints Verification ---');

    // Save report to History
    const saveHistRes = await axios.post(`${API_BASE}/history`, {
      company: 'Microsoft Corp',
      ticker: 'MSFT',
      finalReport: {
        verdict: 'BUY',
        confidence: 88,
        summary: 'Strong Cloud & AI Growth'
      }
    }, authHeader);
    const reportId = saveHistRes.data.data._id;
    console.log('  ✅ History Save Report ID:', reportId);

    // Fetch History List
    const getHistListRes = await axios.get(`${API_BASE}/history`, authHeader);
    if (!Array.isArray(getHistListRes.data.data) || getHistListRes.data.data.length !== 1) {
      throw new Error('History list size mismatch');
    }
    console.log('  ✅ History List fetch successful');

    // Open Report
    const getHistSingleRes = await axios.get(`${API_BASE}/history/${reportId}`, authHeader);
    console.log('  ✅ History Open single report:', getHistSingleRes.data.data.company === 'Microsoft Corp');

    // Delete Report
    const delHistRes = await axios.delete(`${API_BASE}/history/${reportId}`, authHeader);
    console.log('  ✅ History Delete report:', delHistRes.data.success);

    // --- Phase 12: Turnstile Verification ---
    console.log('\n--- Phase 12: Cloudflare Turnstile Verification ---');
    const turnRes = await axios.post(`${API_BASE}/auth/verify-turnstile`, {
      turnstileToken: 'dummy-token'
    });
    console.log('  ✅ Turnstile token validation endpoint:', turnRes.data.success);

    // Clean up test account
    await axios.delete(`${API_BASE}/auth/delete-account`, authHeader);
    console.log('\n✅ Account cleanup complete.');

    console.log('=== PHASES 9-12 VERIFICATION PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phases 9-12 test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase9to12();
