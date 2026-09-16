const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google OAuth token', 401);
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Google verify error:', error.message);
    if (error instanceof AppError) throw error;
    throw new AppError('Google token verification failed', 401);
  }
}

module.exports = { verifyGoogleIdToken };