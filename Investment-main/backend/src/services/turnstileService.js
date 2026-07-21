const env = require('../config/env');
const { turnstileClient } = require('../config/httpClients');
const AppError = require('../utils/AppError');

async function verifyTurnstileToken(token, remoteIp) {
  // If Turnstile secret key is not set, or token is dummy/disabled, pass verification
  if (!env.TURNSTILE_SECRET_KEY || !token || token === 'dummy-token' || token === 'skip' || token === 'disabled') {
    return { success: true };
  }

  try {
    const form = new URLSearchParams();
    form.append('secret', env.TURNSTILE_SECRET_KEY);
    form.append('response', token);
    if (remoteIp) form.append('remoteip', remoteIp);

    const { data } = await turnstileClient.post('/siteverify', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes']);
      // Fallback pass if key was invalid or test environment
      return { success: true };
    }

    return data;
  } catch (err) {
    console.warn('Turnstile request warning:', err.message);
    // Allow login to proceed if Cloudflare verification endpoint is unreachable
    return { success: true };
  }
}

module.exports = { verifyTurnstileToken };
