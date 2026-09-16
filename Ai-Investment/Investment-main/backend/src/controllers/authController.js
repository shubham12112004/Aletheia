const { z } = require('zod');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { verifyGoogleIdToken } = require('../services/googleOAuthService');
const { verifyTurnstileToken } = require('../services/turnstileService');
const { signToken } = require('../services/jwtService');
const { sendPasswordResetOTP } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

const turnstileSchema = z.object({
  turnstileToken: z.string().optional().default('dummy-token'),
});

const googleLoginSchema = z.object({
  idToken: z.string().min(1),
  turnstileToken: z.string().optional().default('dummy-token'),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  turnstileToken: z.string().optional().default('dummy-token'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  turnstileToken: z.string().optional().default('dummy-token'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional().default('dummy-token'),
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

const updateProfileSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// Google sign-in
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
    tokenVersion: user.tokenVersion || 0,
  });

  return success(res, { user, token }, 'Authenticated with Google');
});

// Email signup
const emailSignup = asyncHandler(async (req, res) => {
  const { email, password, name, turnstileToken } = signupSchema.parse(req.body);

  await verifyTurnstileToken(turnstileToken, req.ip);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email address is already in use.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    lastLoginAt: new Date()
  });

  const userObj = user.toObject();
  delete userObj.password;

  const token = signToken({
    sub: String(user._id),
    email: user.email,
    tokenVersion: user.tokenVersion || 0,
  });

  return success(res, { user: userObj, token }, 'Account created successfully');
});

// Email login
const emailLogin = asyncHandler(async (req, res) => {
  const { email, password, turnstileToken } = loginSchema.parse(req.body);

  await verifyTurnstileToken(turnstileToken, req.ip);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password) {
    throw new AppError('Invalid email address or password.', 401);
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new AppError('Invalid email address or password.', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  const token = signToken({
    sub: String(user._id),
    email: user.email,
    tokenVersion: user.tokenVersion || 0,
  });

  return success(res, { user: userObj, token }, 'Logged in successfully');
});

// Forgot password — sends real OTP email via Resend
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, turnstileToken } = forgotPasswordSchema.parse(req.body);

  await verifyTurnstileToken(turnstileToken, req.ip);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success anyway to prevent email enumeration
    return success(res, null, 'If that email exists, a reset code has been sent.');
  }

  // Generate a 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate any previous OTPs for this email
  await OTP.deleteMany({ email: email.toLowerCase() });

  // Save OTP to DB
  await OTP.create({ email: email.toLowerCase(), otp, expiresAt });

  // Send real email via Resend
  await sendPasswordResetOTP(email.toLowerCase(), otp, user.name || 'User');

  return success(res, null, 'A 6-digit reset code has been sent to your email.');
});

// Verify OTP and set new password
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = verifyOTPSchema.parse(req.body);

  const record = await OTP.findOne({ email: email.toLowerCase(), otp, used: false });

  if (!record) {
    throw new AppError('Invalid or expired OTP code.', 400);
  }

  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    throw new AppError('This OTP has expired. Please request a new one.', 400);
  }

  // Mark OTP as used
  record.used = true;
  await record.save();

  // Update user password
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError('User not found.', 404);

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return success(res, null, 'Password has been reset successfully. You can now sign in.');
});

// Update Profile
const updateProfile = asyncHandler(async (req, res) => {
  const { email, name } = updateProfileSchema.parse(req.body);
  const userId = req.user._id;

  const emailCheck = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
  if (emailCheck) {
    throw new AppError('Email address is already in use by another account.', 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { email: email.toLowerCase(), name },
    { new: true }
  );

  if (!user) throw new AppError('User session not found', 404);

  const userObj = user.toObject();
  delete userObj.password;

  return success(res, { user: userObj }, 'Profile updated successfully');
});

// Update Password
const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user || !user.password) {
    throw new AppError('Google accounts do not have local passwords. Set up via profile.', 400);
  }

  const matches = await bcrypt.compare(oldPassword, user.password);
  if (!matches) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return success(res, null, 'Password updated successfully');
});

// Delete Account
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new AppError('User not found', 404);

  // Clear related watchlist / research data if any model is defined
  try {
    const Watchlist = require('../models/Watchlist');
    await Watchlist.deleteMany({ userId });
  } catch (err) {
    // Ignore if Watchlist model does not exist
  }

  return success(res, null, 'Account deleted successfully');
});

const verifyTurnstile = asyncHandler(async (req, res) => {
  const { turnstileToken } = turnstileSchema.parse(req.body);
  await verifyTurnstileToken(turnstileToken, req.ip);
  return success(res, null, 'Cloudflare verification passed');
});

module.exports = {
  googleLogin,
  emailSignup,
  emailLogin,
  forgotPassword,
  verifyOTP,
  updateProfile,
  updatePassword,
  deleteAccount,
  verifyTurnstile,
};
