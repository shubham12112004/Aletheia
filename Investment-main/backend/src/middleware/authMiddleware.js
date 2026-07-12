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
  req.user = jwt.verify(token, env.JWT_SECRET);
  next();
});

module.exports = { requireAuth };
