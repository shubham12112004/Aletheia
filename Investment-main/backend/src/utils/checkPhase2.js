const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuthPhase() {
  console.log('=== PHASE 2: AUTHENTICATION API TEST ===');

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  try {
    // 1. Signup
    console.log('Testing Signup...');
    const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
      email: testEmail,
      password: testPassword,
      name: testName,
      turnstileToken: 'dummy-token'
    });
    
    if (!signupRes.data.success || !signupRes.data.data.token) {
      throw new Error('Signup response invalid');
    }
    console.log('✅ Signup successful. Token received.');
    const token = signupRes.data.data.token;

    // 2. Email Login
    console.log('Testing Email Login...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: testPassword,
      turnstileToken: 'dummy-token'
    });
    if (!loginRes.data.success || !loginRes.data.data.token) {
      throw new Error('Login response invalid');
    }
    console.log('✅ Email login successful.');

    // 3. Invalid Login
    console.log('Testing Invalid Credentials rejection...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword!',
        turnstileToken: 'dummy-token'
      });
      throw new Error('Should have failed with 401');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Invalid password properly rejected with HTTP 401.');
      } else {
        throw err;
      }
    }

    // 4. Protected Route with valid token
    console.log('Testing Protected Route (Update Profile)...');
    const updateRes = await axios.post(
      `${API_BASE}/auth/update-profile`,
      { name: 'Updated Test User', email: testEmail },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!updateRes.data.success || updateRes.data.data.user.name !== 'Updated Test User') {
      throw new Error('Update profile failed');
    }
    console.log('✅ Protected route accessed and profile updated.');

    // 5. Protected Route without token
    console.log('Testing Unauthenticated Access Rejection...');
    try {
      await axios.post(`${API_BASE}/auth/update-profile`, { name: 'Hack', email: testEmail });
      throw new Error('Should have failed with 401');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Unauthenticated request properly rejected with HTTP 401.');
      } else {
        throw err;
      }
    }

    // 6. Delete Account (cleanup)
    console.log('Testing Delete Account...');
    const deleteRes = await axios.delete(
      `${API_BASE}/auth/delete-account`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!deleteRes.data.success) {
      throw new Error('Delete account failed');
    }
    console.log('✅ Account deletion successful.');

    console.log('=== PHASE 2 AUTHENTICATION VERIFICATION PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Authentication test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

testAuthPhase();
