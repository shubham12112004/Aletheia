const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Authentication token is required', 401);
  }

  const token = header.slice('Bearer '.length);
  const decoded = jwt.verify(token, env.JWT_SECRET);
  
  // Find user to check tokenVersion (invalidates old tokens on password change)
  const User = require('../models/User');
  const user = await User.findById(decoded.sub);
  
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }
  
  if (decoded.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
    throw new AppError('Session expired. Please log in again.', 401);
  }
  
  req.user = user;
  next();
});

module.exports = { requireAuth };
