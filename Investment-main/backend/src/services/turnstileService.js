const env = require('../config/env');
const { turnstileClient } = require('../config/httpClients');
const AppError = require('../utils/AppError');

async function verifyTurnstileToken(token, remoteIp) {
  const form = new URLSearchParams();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (remoteIp) form.append('remoteip', remoteIp);

  const { data } = await turnstileClient.post('/siteverify', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!data.success) {
    throw new AppError('Cloudflare Turnstile verification failed', 403, data['error-codes']);
  }

  return data;
}

module.exports = { verifyTurnstileToken };
