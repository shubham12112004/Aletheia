const { z } = require('zod');
const User = require('../models/User');
const { verifyGoogleIdToken } = require('../services/googleOAuthService');
const { verifyTurnstileToken } = require('../services/turnstileService');
const { signToken } = require('../services/jwtService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const turnstileSchema = z.object({
  turnstileToken: z.string().min(1),
});

const googleLoginSchema = z.object({
  idToken: z.string().min(1),
  turnstileToken: z.string().min(1),
});

const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, turnstileToken } = googleLoginSchema.parse(req.body);

  await verifyTurnstileToken(turnstileToken, req.ip);
  const googleUser = await verifyGoogleIdToken(idToken);

  const user = await User.findOneAndUpdate(
    { email: googleUser.email },
    { ...googleUser, lastLoginAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  const token = signToken({
    sub: String(user._id),
    email: user.email,
  });

  return success(res, { user, token }, 'Authenticated');
});

const verifyTurnstile = asyncHandler(async (req, res) => {
  const { turnstileToken } = turnstileSchema.parse(req.body);
  await verifyTurnstileToken(turnstileToken, req.ip);
  return success(res, null, 'Cloudflare verification passed');
});

module.exports = { googleLogin, verifyTurnstile };
