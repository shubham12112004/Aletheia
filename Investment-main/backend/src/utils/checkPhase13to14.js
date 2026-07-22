const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPhase13to14() {
  console.log('=== PHASES 13 & 14: PERFORMANCE & ERROR HANDLING TEST ===');

  const testEmail = `perf_test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Create test user
  const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
    email: testEmail,
    password: testPassword,
    name: 'Perf User',
    turnstileToken: 'dummy-token'
  });
  const token = signupRes.data.data.token;
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // --- Phase 13: Performance Benchmarks ---
  console.log('\n--- Phase 13: Performance Benchmarks ---');

  // Benchmark Login
  const t0 = Date.now();
  await axios.post(`${API_BASE}/auth/login`, {
    email: testEmail,
    password: testPassword,
    turnstileToken: 'dummy-token'
  });
  const loginDuration = Date.now() - t0;
  console.log(`  ⏱️ Login Latency: ${loginDuration}ms`);
  if (loginDuration > 2000) {
    throw new Error(`Login latency (${loginDuration}ms) exceeded 2000ms target`);
  }
  console.log('  ✅ Login latency < 2 sec PASSED.');

  // Benchmark Dashboard Overview
  const t1 = Date.now();
  await axios.get(`${API_BASE}/markets/overview`, authHeader);
  const dashboardDuration = Date.now() - t1;
  console.log(`  ⏱️ Dashboard Overview Latency: ${dashboardDuration}ms`);
  if (dashboardDuration > 2000) {
    throw new Error(`Dashboard overview latency (${dashboardDuration}ms) exceeded 2000ms target`);
  }
  console.log('  ✅ Dashboard overview latency < 2 sec PASSED.');

  // --- Phase 14: Error Handling & Status Codes ---
  console.log('\n--- Phase 14: Error Handling & Status Codes ---');

  // 1. 404 Route Not Found
  try {
    await axios.get(`${API_BASE}/invalid-endpoint`);
    throw new Error('404 test failed');
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log('  ✅ 404 Not Found status code verified.');
    } else throw err;
  }

  // 2. 400 Validation Error
  try {
    await axios.post(`${API_BASE}/auth/login`, { email: 'invalid-email' });
    throw new Error('400 test failed');
  } catch (err) {
    if (err.response && err.response.status === 400) {
      console.log('  ✅ 400 Bad Request validation status code verified.');
    } else throw err;
  }

  // 3. 401 Unauthorized Error
  try {
    await axios.get(`${API_BASE}/settings`);
    throw new Error('401 test failed');
  } catch (err) {
    if (err.response && err.response.status === 401) {
      console.log('  ✅ 401 Unauthorized status code verified.');
    } else throw err;
  }

  // Cleanup
  await axios.delete(`${API_BASE}/auth/delete-account`, authHeader);
  console.log('\n✅ Account cleanup complete.');

  console.log('=== PHASES 13 & 14 VERIFICATION PASSED ===');
  process.exit(0);
}

testPhase13to14().catch(err => {
  console.error('❌ Phases 13 & 14 test failed:', err.response?.data || err.message);
  process.exit(1);
});
