const { z } = require('zod');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// Simple symmetric encryption for API keys
// In production, ENCRYPTION_KEY should be in .env and be a 32-byte hex string
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return '';
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return '';
  }
}

// Get user settings (create default if missing)
const getSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({ userId });
  }

  const settingsObj = settings.toObject();
  
  // Decrypt API keys before sending to frontend (or just mask them)
  // For the frontend to show them correctly, we'll send the decrypted keys
  // The frontend will handle masking visually
  if (settingsObj.apiKeys) {
    settingsObj.apiKeys.geminiKey = decrypt(settingsObj.apiKeys.geminiKey);
    settingsObj.apiKeys.newsApiKey = decrypt(settingsObj.apiKeys.newsApiKey);
    settingsObj.apiKeys.fmpKey = decrypt(settingsObj.apiKeys.fmpKey);
    settingsObj.apiKeys.tavilyKey = decrypt(settingsObj.apiKeys.tavilyKey);
  }

  // Also include base user data
  const userObj = {
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    lastLoginAt: req.user.lastLoginAt,
  };

  return success(res, { settings: settingsObj, user: userObj });
});

// Update profile (also updates User model for core info)
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    bio: z.string().optional(),
    company: z.string().optional(),
    occupation: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
  });
  
  const data = schema.parse(req.body);
  
  const emailCheck = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: userId } });
  if (emailCheck) {
    throw new AppError('Email address is already in use by another account.', 400);
  }

  await User.findByIdAndUpdate(userId, { name: data.name, email: data.email.toLowerCase() });
  
  const settings = await UserSettings.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        'profile.bio': data.bio || '',
        'profile.company': data.company || '',
        'profile.occupation': data.occupation || '',
        'profile.country': data.country || '',
        'profile.timezone': data.timezone || 'UTC',
      } 
    },
    { new: true, upsert: true }
  );

  return success(res, settings, 'Profile updated successfully');
});

// Update password (transferred from authController, but keeping it here for modularity)
const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8), // matching standard strong password
  });
  
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await User.findById(userId);
  if (!user || !user.password) {
    throw new AppError('Google accounts do not have local passwords.', 400);
  }

  const matches = await bcrypt.compare(currentPassword, user.password);
  if (!matches) {
    throw new AppError('Current password is incorrect.', 400);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate other sessions
  await user.save();

  return success(res, null, 'Password updated successfully. Other sessions have been logged out.');
});

// Update preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    researchDepth: z.enum(['quick', 'standard', 'deep']),
    defaultModel: z.enum(['gemini-flash', 'gemini-pro']),
    defaultSearchEngine: z.enum(['tavily']),
    defaultReportFormat: z.enum(['executive', 'detailed']),
  });
  
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { preferences: data } }, { new: true, upsert: true });
  return success(res, settings, 'Preferences updated successfully');
});

// Update workspace
const updateWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    name: z.string(),
    description: z.string().optional(),
  });
  
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate(
    { userId }, 
    { $set: { 'workspace.name': data.name, 'workspace.description': data.description || '' } }, 
    { new: true, upsert: true }
  );
  return success(res, settings, 'Workspace identity updated successfully');
});

// Update notifications
const updateNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    emailNotifications: z.boolean(),
    weeklySummary: z.boolean(),
    securityAlerts: z.boolean(),
    researchAlerts: z.boolean(),
    browserNotifications: z.boolean(),
  });
  
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { notifications: data } }, { new: true, upsert: true });
  return success(res, settings, 'Notification settings updated successfully');
});

// Update theme
const updateTheme = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({ theme: z.enum(['dark', 'light', 'system']) });
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { theme: data.theme } }, { new: true, upsert: true });
  return success(res, settings, 'Theme updated successfully');
});

// Update security
const updateSecurity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({ twoFactorEnabled: z.boolean() });
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { 'security.twoFactorEnabled': data.twoFactorEnabled } }, { new: true, upsert: true });
  return success(res, settings, 'Security settings updated successfully');
});

// Update API Keys
const updateApiKeys = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    geminiKey: z.string().optional(),
    newsApiKey: z.string().optional(),
    fmpKey: z.string().optional(),
    tavilyKey: z.string().optional(),
  });
  
  const data = schema.parse(req.body);
  
  const updateData = {};
  if (data.geminiKey !== undefined) updateData['apiKeys.geminiKey'] = encrypt(data.geminiKey);
  if (data.newsApiKey !== undefined) updateData['apiKeys.newsApiKey'] = encrypt(data.newsApiKey);
  if (data.fmpKey !== undefined) updateData['apiKeys.fmpKey'] = encrypt(data.fmpKey);
  if (data.tavilyKey !== undefined) updateData['apiKeys.tavilyKey'] = encrypt(data.tavilyKey);

  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true });
  return success(res, null, 'API keys saved securely');
});

// Update runtime
const updateRuntime = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    socketStreaming: z.boolean(),
    quotaAlerts: z.boolean(),
    autoRefresh: z.boolean(),
    cacheResults: z.boolean(),
    parallelAgents: z.boolean(),
  });
  
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { runtime: data } }, { new: true, upsert: true });
  return success(res, settings, 'Runtime options updated successfully');
});

// Update analysis
const updateAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const schema = z.object({
    confidenceThreshold: z.number().min(70).max(95),
    autoSave: z.boolean(),
    enableStreaming: z.boolean(),
    enableMarketNews: z.boolean(),
    enableSwot: z.boolean(),
    enableCompetitorAnalysis: z.boolean(),
    enableFinancialRatioAnalysis: z.boolean(),
  });
  
  const data = schema.parse(req.body);
  const settings = await UserSettings.findOneAndUpdate({ userId }, { $set: { analysis: data } }, { new: true, upsert: true });
  return success(res, settings, 'Analysis settings updated successfully');
});

// Delete account
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndDelete(userId);
  await UserSettings.findOneAndDelete({ userId });
  
  try {
    const Watchlist = require('../models/Watchlist');
    await Watchlist.deleteMany({ userId });
  } catch (err) { /* ignore */ }

  return success(res, null, 'Account permanently deleted');
});

module.exports = {
  getSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
  updateWorkspace,
  updateNotifications,
  updateTheme,
  updateSecurity,
  updateApiKeys,
  updateRuntime,
  updateAnalysis,
  deleteAccount
};
